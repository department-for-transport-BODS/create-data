import boto3
import os
from urllib.parse import unquote_plus
import logging
import pymysql
from csv_uploader.db_queries import *

s3 = boto3.resource('s3')
ssm = boto3.client('ssm')


def get_cross_account_s3_client(role_arn: str, region: str):
    sts_client = boto3.client('sts', region_name=region)
    assumed = sts_client.assume_role(
        RoleArn=role_arn,
        RoleSessionName="csv-uploader-cross-account-session",
        DurationSeconds=3600,
    )
    creds = assumed['Credentials']
    return boto3.client(
        's3',
        region_name=region,
        aws_access_key_id=creds['AccessKeyId'],
        aws_secret_access_key=creds['SecretAccessKey'],
        aws_session_token=creds['SessionToken'],
    )


def stage_naptan_file_locally(naptan_bucket: str, role_arn: str, region: str, local_bucket: str) -> str:
    """Download NaPTAN CSV from cross-account bucket and re-upload to local bucket.
    Returns the local bucket name to use for LOAD DATA FROM S3."""
    logger.info(f"Assuming role {role_arn} to read NaPTAN CSV from {naptan_bucket}")
    cross_account_client = get_cross_account_s3_client(role_arn, region)

    naptan_s3_key = os.getenv("NAPTAN_S3_KEY")
    naptan_tmp_path = os.getenv("NAPTAN_TMP_PATH")

    if naptan_s3_key is None or naptan_tmp_path is None:
        raise Exception("NAPTAN_S3_KEY and NAPTAN_TMP_PATH environment variables must be set")

    logger.info(f"Downloading s3://{naptan_bucket}/{naptan_s3_key} to {naptan_tmp_path}")
    cross_account_client.download_file(naptan_bucket, naptan_s3_key, naptan_tmp_path)

    logger.info(f"Uploading NaPTAN CSV to local bucket s3://{local_bucket}/{naptan_s3_key}")
    s3.Bucket(local_bucket).upload_file(naptan_tmp_path, naptan_s3_key)

    return local_bucket

def stage_noc_file_locally(noc_bucket: str, role_arn: str, region: str, local_bucket: str) -> list:
    """List all files in the NOC folder prefix, select the 3 required CSVs (noclines, noctable,
    publicname), download from the cross-account bucket and re-upload to the local bucket.
    Returns the list of S3 keys that were staged."""
    logger.info(f"Assuming role {role_arn} to read NOC CSVs from {noc_bucket}")
    cross_account_client = get_cross_account_s3_client(role_arn, region)

    noc_folder = os.getenv("NOC_S3_KEY")
    noc_tmp_path = os.getenv("NOC_TMP_PATH")

    if noc_folder is None or noc_tmp_path is None:
        raise Exception("NOC_S3_KEY and NOC_TMP_PATH environment variables must be set")

    # List all objects under the NOC folder prefix
    logger.info(f"Listing objects in s3://{noc_bucket}/{noc_folder}")
    response = cross_account_client.list_objects_v2(Bucket=noc_bucket, Prefix=noc_folder)
    all_keys = [obj['Key'] for obj in response.get('Contents', [])]

    # Select the 3 required CSVs by matching the table_{tablename}_latest_csv.csv naming convention
    target_filenames = ["table_noclines_latest_csv.csv", "table_noc_table_latest_csv.csv", "table_noc_public_name_latest_csv.csv"]
    selected_keys = [
        key for key in all_keys
        if os.path.basename(key).lower() in target_filenames
    ]

    if len(selected_keys) != 3:
        raise Exception(
            f"Expected 3 NOC CSVs (noclines, noctable, publicname) but found "
            f"{len(selected_keys)}: {selected_keys}"
        )

    for key in selected_keys:
        filename = os.path.basename(key)
        tmp_file = os.path.join(noc_tmp_path, filename)
        logger.info(f"Downloading s3://{noc_bucket}/{key} to {tmp_file}")
        cross_account_client.download_file(noc_bucket, key, tmp_file)

        logger.info(f"Uploading NOC CSV to local bucket s3://{local_bucket}/{key}")
        s3.Bucket(local_bucket).upload_file(tmp_file, key)

    return selected_keys

logger = logging.getLogger()
logger.setLevel(logging.INFO)

rds_host = os.getenv('RDS_HOST')
db_name = "fdbt"
username = ssm.get_parameter(
    Name='fdbt-rds-reference-data-username',
    WithDecryption=True
)['Parameter']['Value']
password = ssm.get_parameter(
    Name='fdbt-rds-reference-data-password',
    WithDecryption=True
)['Parameter']['Value']

db_connection = pymysql.connect(host=rds_host, user=username, password=password, database=db_name, connect_timeout=5)


def lambda_handler(event, context):
    try:
        bucket = event['Records'][0]['s3']['bucket']['name']
        key = unquote_plus(event['Records'][0]['s3']['object']['key'])
        naptan_s3_key = os.getenv("NAPTAN_S3_KEY")
        naptan_bucket_region = os.getenv("NAPTAN_BUCKET_REGION")
        noc_bucket_region = os.getenv("NOC_BUCKET_REGION")

        insert_in_database(
            key,
            bucket,
            naptan_s3_key=naptan_s3_key,
            naptan_bucket_region=naptan_bucket_region,
            noc_bucket_region=noc_bucket_region,
        )
    except Exception as e:
        ssm.put_parameter(
            Name="/scheduled/disable-table-renamer",
            Value="true",
            Type="String",
            Overwrite=True
        )
        logger.error(e)
        raise e
    
def naptan_handler(event, context):
    try:
        naptan_bucket = os.getenv("NAPTAN_BUCKET_NAME")
        if naptan_bucket is None:
            raise Exception("No NAPTAN_BUCKET_NAME environment variable set")

        naptan_s3_key = os.getenv("NAPTAN_S3_KEY")
        if naptan_s3_key is None:
            raise Exception("No NAPTAN_S3_KEY environment variable set")

        role_arn = os.getenv("NAPTAN_ROLE_ARN")
        region = os.getenv("NAPTAN_BUCKET_REGION")

        if region is None:
            raise Exception("No NAPTAN_BUCKET_REGION environment variable set")

        if role_arn:
            local_bucket = os.getenv("CSV_BUCKET_NAME")
            if local_bucket is None:
                raise Exception("CSV_BUCKET_NAME environment variable must be set when NAPTAN_ROLE_ARN is configured")

            bucket = stage_naptan_file_locally(naptan_bucket, role_arn, region, local_bucket)
        else:
            bucket = naptan_bucket

        logger.info(f"Running scheduled naptan upload from bucket: {bucket}")
        insert_in_database(naptan_s3_key, bucket, naptan_s3_key, region)

    except Exception as e:
        ssm.put_parameter(
            Name="/scheduled/disable-table-renamer",
            Value="true",
            Type="String",
            Overwrite=True
        )
        logger.error(e)
        raise e

def noc_handler(event, context):
    try:
        noc_bucket = os.getenv("NOC_BUCKET_NAME")
        if noc_bucket is None:
            raise Exception("No NOC_BUCKET_NAME environment variable set")

        noc_folder = os.getenv("NOC_S3_KEY")
        if noc_folder is None:
            raise Exception("No NOC_S3_KEY environment variable set")

        noc_role_arn = os.getenv("NOC_ROLE_ARN")
        noc_bucket_region = os.getenv("NOC_BUCKET_REGION")

        if noc_bucket_region is None:
            raise Exception("No NOC_BUCKET_REGION environment variable set")

        if noc_role_arn:
            local_bucket = os.getenv("NOC_CSV_BUCKET_NAME")
            if local_bucket is None:
                raise Exception("NOC_CSV_BUCKET_NAME environment variable must be set when NOC_ROLE_ARN is configured")

            noc_s3_keys = stage_noc_file_locally(noc_bucket, noc_role_arn, noc_bucket_region, local_bucket)
            bucket = local_bucket
        else:
            # List objects in the folder and select the 3 required CSVs directly
            s3_client = boto3.client('s3', region_name=noc_bucket_region)
            response = s3_client.list_objects_v2(Bucket=noc_bucket, Prefix=noc_folder)
            all_keys = [obj['Key'] for obj in response.get('Contents', [])]
            target_filenames = ["table_noclines_latest_csv.csv", "table_noc_table_latest_csv.csv", "table_noc_public_name_latest_csv.csv"]
            noc_s3_keys = [
                key for key in all_keys
                if os.path.basename(key).lower() in target_filenames
            ]
            if len(noc_s3_keys) != 3:
                raise Exception(
                    f"Expected 3 NOC CSVs (noclines, noctable, publicname) but found "
                    f"{len(noc_s3_keys)}: {noc_s3_keys}"
                )
            bucket = noc_bucket

        # Process each selected CSV
        for noc_s3_key in noc_s3_keys:
            logger.info(f"Running scheduled NOC upload from bucket: {bucket} for file: {noc_s3_key}")
            insert_in_database(noc_s3_key, bucket, noc_bucket_region=noc_bucket_region)

    except Exception as e:
        ssm.put_parameter(
            Name="/scheduled/disable-table-renamer",
            Value="true",
            Type="String",
            Overwrite=True
        )
        logger.error(e)
        raise e

def insert_in_database(key, bucket, naptan_s3_key=None, naptan_bucket_region=None, noc_bucket_region=None):
    query_array = None
    key_lower = key.lower()
    noc_s3_key = key

    if naptan_s3_key and key == naptan_s3_key:
        if naptan_bucket_region is None:
            raise Exception("NAPTAN_BUCKET_REGION environment variable must be set for NaPTAN loads")
        query_array = stops_query(bucket, naptan_s3_key, naptan_bucket_region)
    elif "noclines" in key_lower:
        query_array = noc_lines_query(bucket, noc_s3_key, noc_bucket_region)
    elif "noc_table" in key_lower:
        query_array = noc_table_query(bucket, noc_s3_key, noc_bucket_region)
    elif "noc_public_name" in key_lower:
        query_array = public_name_query(bucket, noc_s3_key, noc_bucket_region)
    else:
        raise Exception(f"No matching query found for file: {key}")

    for query_line in query_array:
        with db_connection.cursor() as cursor:
            cursor.execute(query_line)

    db_connection.commit()

    logger.info("SUCCESS: Data insertion to RDS MySQL instance succeeded")
