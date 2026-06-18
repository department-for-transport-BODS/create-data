import os
from csv_uploader.db_queries import *


class TestClass:
    def test_public_name_bucket_insertion(self):
        bucket = "unit-test-bucket"
        noc_s3_key = os.getenv("NOC_S3_KEY", "testing")
        noc_bucket_region = os.getenv("NOC_BUCKET_REGION", "eu-west-2")
        result = public_name_query(bucket, noc_s3_key, noc_bucket_region)
        assert result[3].__contains__(bucket)
        assert result[3].__contains__(noc_s3_key)
        assert result[3].__contains__(noc_bucket_region)

    def test_noc_table_bucket_insertion(self):
        bucket = "unit-test-bucket"
        noc_s3_key = os.getenv("NOC_S3_KEY", "testing")
        noc_bucket_region = os.getenv("NOC_BUCKET_REGION", "eu-west-2")
        result = noc_table_query(bucket, noc_s3_key, noc_bucket_region)
        assert result[3].__contains__(bucket)
        assert result[3].__contains__(noc_s3_key)
        assert result[3].__contains__(noc_bucket_region)

    def test_noc_lines_bucket_insertion(self):
        bucket = "unit-test-bucket"
        noc_s3_key = os.getenv("NOC_S3_KEY", "testing")
        noc_bucket_region = os.getenv("NOC_BUCKET_REGION", "eu-west-2")
        result = noc_lines_query(bucket, noc_s3_key, noc_bucket_region)
        assert result[3].__contains__(bucket)
        assert result[3].__contains__(noc_s3_key)
        assert result[3].__contains__(noc_bucket_region)

    def test_stops_bucket_insertion(self):
        bucket = "unit-test-bucket"
        naptan_s3_key = os.getenv("NAPTAN_S3_KEY", "testing")
        naptan_bucket_region = os.getenv("NAPTAN_BUCKET_REGION", "eu-west-2")
        result = stops_query(bucket, naptan_s3_key, naptan_bucket_region)
        assert result[3].__contains__(bucket)
        assert result[3].__contains__(naptan_s3_key)
        assert result[3].__contains__(naptan_bucket_region)
