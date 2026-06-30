import boto3
import os
import logging
from io import BytesIO
from zipfile import ZipFile, is_zipfile
import requests

logger = logging.getLogger()
logger.setLevel(logging.INFO)

s3 = boto3.resource("s3")
ssm = boto3.client("ssm")

def get_cross_account_s3_client(role_arn: str, region: str):
    sts_client = boto3.client('sts', region_name=region)
    assumed = sts_client.assume_role(
        RoleArn=role_arn,
        RoleSessionName="csv-retriever-cross-account-session",
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

    logger.info(f"Uploading NaPTAN CSV to local bucket s3://{local_bucket}/Stops.csv")
    s3.Bucket(local_bucket).upload_file(naptan_tmp_path, "Stops.csv")

    return local_bucket

def naptan_handler(event, context):
    try:
        naptan_bucket = os.getenv("NAPTAN_BUCKET_NAME")
        if naptan_bucket is None:
            raise Exception("No NAPTAN_BUCKET_NAME environment variable set")

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

        logger.info(f"NaPTAN uploaded to bucket: {bucket}")
        
NOC_FILE_NAME_MAPPING = {
    "table_noclines_latest_csv.csv": "NOCLines.csv",
    "table_noc_table_latest_csv.csv": "NOCTable.csv",
    "table_noc_public_name_latest_csv.csv": "PublicName.csv",
}

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

    # Select the 3 required CSVs by matching the expected source filenames.
    target_filenames = list(NOC_FILE_NAME_MAPPING.keys())
    selected_keys = [
        key for key in all_keys
        if os.path.basename(key).lower() in target_filenames
    ]

    if len(selected_keys) != 3:
        raise Exception(
            f"Expected 3 NOC CSVs (noclines, noctable, publicname) but found "
            f"{len(selected_keys)}: {selected_keys}"
        )

    staged_keys = []
    for key in selected_keys:
        filename = os.path.basename(key).lower()
        mapped_filename = NOC_FILE_NAME_MAPPING[filename]
        tmp_file = os.path.join(noc_tmp_path, filename)
        logger.info(f"Downloading s3://{noc_bucket}/{key} to {tmp_file}")
        cross_account_client.download_file(noc_bucket, key, tmp_file)

        logger.info(f"Uploading NOC CSV to local bucket s3://{local_bucket}/{mapped_filename}")
        s3.Bucket(local_bucket).upload_file(tmp_file, mapped_filename)
        staged_keys.append(mapped_filename)

    return staged_keys

def noc_handler(event, context):
    noc_bucket = os.getenv("NOC_BUCKET_NAME")
    if noc_bucket is None:
        raise Exception("No NOC_BUCKET_NAME environment variable set")

    role_arn = os.getenv("NOC_ROLE_ARN")
    region = os.getenv("NOC_BUCKET_REGION")

    if region is None:
        raise Exception("No NOC_BUCKET_REGION environment variable set")

    if role_arn:
        local_bucket = os.getenv("NOC_CSV_BUCKET_NAME")
        if local_bucket is None:
            raise Exception("NOC_CSV_BUCKET_NAME environment variable must be set when NOC_ROLE_ARN is configured")

        bucket = stage_noc_file_locally(noc_bucket, role_arn, region, local_bucket)
    else:
        bucket = noc_bucket

    logger.info(f"NOC CSVs uploaded to bucket: {bucket}")

def lambda_handler(event, context):
    try:
        data_url = os.getenv("DATA_URL")
        content_type = os.getenv("CONTENT_TYPE")
        bucket_name = os.getenv("BUCKET_NAME")

        if data_url is None:
            raise Exception("There was no DATA_URL environment variable!")

        if content_type is None:
            raise Exception("There was no CONTENT_TYPE environment variable!")

        if bucket_name is None:
            raise Exception("There was no BUCKET_NAME environment variable!")

        response = requests.get(data_url, allow_redirects=True, timeout=30)
        file = BytesIO(response.content)

        if is_zipfile(file):
            logger.info("File retrieved is a ZIP file")

            zip_file = ZipFile(file)
            target_file = os.getenv("TARGET_FILE")

            for file_name in zip_file.namelist():
                if (target_file and file_name == target_file) or not target_file:
                    s3.meta.client.upload_fileobj(
                        zip_file.open(file_name),
                        bucket_name,
                        file_name,
                        ExtraArgs={"ContentType": content_type},
                    )
        else:
            logger.info("File retrieved is not a ZIP file")

            target_file = os.getenv("TARGET_FILE")
            if target_file is None:
                raise Exception("There was no TARGET_FILE environment variable!")

            s3.meta.client.put_object(
                Body=response.content, Bucket=bucket_name, Key=target_file
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
