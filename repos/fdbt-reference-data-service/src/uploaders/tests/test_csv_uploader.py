from csv_uploader.db_queries import *


class TestClass:
    def test_public_name_bucket_insertion(self):
        bucket = "unit-test-bucket"
        naptan_bucket_region = "eu-west-2"
        result = public_name_query(bucket, naptan_bucket_region)
        assert result[3].__contains__(bucket)
        assert result[3].__contains__(naptan_bucket_region)

    def test_noc_table_bucket_insertion(self):
        bucket = "unit-test-bucket"
        naptan_bucket_region = "eu-west-2"
        result = noc_table_query(bucket, naptan_bucket_region)
        assert result[3].__contains__(bucket)
        assert result[3].__contains__(naptan_bucket_region)

    def test_noc_lines_bucket_insertion(self):
        bucket = "unit-test-bucket"
        naptan_bucket_region = "eu-west-2"
        result = noc_lines_query(bucket, naptan_bucket_region)
        assert result[3].__contains__(bucket)
        assert result[3].__contains__(naptan_bucket_region)

    def test_stops_bucket_insertion(self):
        bucket = "unit-test-bucket"
        naptan_s3_key = "NaPTAN.csv"
        naptan_bucket_region = "eu-west-2"
        result = stops_query(bucket, naptan_s3_key, naptan_bucket_region)
        assert result[3].__contains__(bucket)
        assert result[3].__contains__(naptan_s3_key)
        assert result[3].__contains__(naptan_bucket_region)
