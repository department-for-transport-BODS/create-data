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

        insert_in_database(key, bucket, naptan_s3_key, naptan_bucket_region)
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


def insert_in_database(key, bucket, naptan_s3_key=None, naptan_bucket_region=None):
    query_array = None

    if naptan_s3_key and key == naptan_s3_key:
        if naptan_bucket_region is None:
            raise Exception("NAPTAN_BUCKET_REGION environment variable must be set for NaPTAN loads")
        query_array = stops_query(bucket, naptan_s3_key, naptan_bucket_region)
    elif key == "NOCLines.csv":
        query_array = noc_lines_query(bucket)
    elif key == "NOCTable.csv":
        query_array = noc_table_query(bucket)
    elif key == "PublicName.csv":
        query_array = public_name_query(bucket)

    for query_line in query_array:
        with db_connection.cursor() as cursor:
            cursor.execute(query_line)

    db_connection.commit()

    logger.info("SUCCESS: Data insertion to RDS MySQL instance succeeded")
