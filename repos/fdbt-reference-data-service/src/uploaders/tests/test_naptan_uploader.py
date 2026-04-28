import os
import sys
import pytest
from unittest.mock import MagicMock, patch
import boto3
import csv
import io

# --- Must patch before importing main, due to module-level SSM/DB calls ---

os.environ['RDS_HOST'] = 'localhost'
os.environ['NAPTAN_BUCKET_NAME'] = 'bods-1297-data-landing-zone'

_mock_ssm = MagicMock()
_mock_ssm.get_parameter.return_value = {'Parameter': {'Value': 'testvalue'}}

_mock_pymysql = MagicMock()
_mock_conn = MagicMock()
_mock_cursor = MagicMock()
_mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=_mock_cursor)
_mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)
_mock_pymysql.connect.return_value = _mock_conn

with patch('boto3.client', return_value=_mock_ssm), \
     patch.dict('sys.modules', {'pymysql': _mock_pymysql}):
    from csv_uploader import main

# ---------------------------------------------------------

class TestNaptanUploader:
    def setup_method(self):
        _mock_cursor.execute.reset_mock()

    def test_naptan_key_routes_to_stops_query(self):
        print("\n[TEST] Calling insert_in_database with key='raw/naptan/naptan_latest_csv.csv'")
        main.insert_in_database("raw/naptan/naptan_latest_csv.csv", "event-bucket")
        executed_sql = [str(c) for c in _mock_cursor.execute.call_args_list]
        print(f"[TEST] SQL statements executed ({len(executed_sql)} total):")
        for sql in executed_sql:
            print(f"       {sql}")
        naptan_bucket_used = any('bods-1297-data-landing-zone' in q for q in executed_sql)
        print(f"[TEST] naptan bucket 'bods-1297-data-landing-zone' found in SQL: {naptan_bucket_used}")
        assert naptan_bucket_used

    def test_naptan_query_uses_correct_file_path(self):
        print("\n[TEST] Checking SQL contains correct file path 'raw/naptan/naptan_latest_csv.csv'")
        main.insert_in_database("raw/naptan/naptan_latest_csv.csv", "event-bucket")
        executed_sql = [str(c) for c in _mock_cursor.execute.call_args_list]
        print(f"[TEST] SQL statements executed ({len(executed_sql)} total):")
        for sql in executed_sql:
            print(f"       {sql}")
        correct_path_used = any('raw/naptan/naptan_latest_csv.csv' in q for q in executed_sql)
        print(f"[TEST] correct file path found in SQL: {correct_path_used}")
        assert correct_path_used

    def test_naptan_does_not_use_event_bucket(self):
        print("\n[TEST] Checking event bucket 'event-bucket' is NOT used in SQL")
        main.insert_in_database("raw/naptan/naptan_latest_csv.csv", "event-bucket")
        executed_sql = [str(c) for c in _mock_cursor.execute.call_args_list]
        event_bucket_used = any('event-bucket' in q for q in executed_sql)
        print(f"[TEST] event bucket 'event-bucket' found in SQL (should be False): {event_bucket_used}")
        assert not event_bucket_used

    def test_lambda_handler_full_flow(self):
        print("\n[TEST] Simulating full S3 event trigger for naptan file")
        event = {
            'Records': [{
                's3': {
                    'bucket': {'name': 'fdbt-csv-ref-data-test'},
                    'object': {'key': 'raw/naptan/naptan_latest_csv.csv'}
                }
            }]
        }
        print(f"[TEST] Event bucket: fdbt-csv-ref-data-test")
        print(f"[TEST] Event key:    raw/naptan/naptan_latest_csv.csv")
        print(f"[TEST] NAPTAN_BUCKET_NAME env var: {os.environ.get('NAPTAN_BUCKET_NAME')}")

        main.lambda_handler(event, {})

        executed_sql = [str(c) for c in _mock_cursor.execute.call_args_list]
        print(f"[TEST] SQL statements executed ({len(executed_sql)} total):")
        for sql in executed_sql:
            print(f"       {sql}")

        naptan_bucket_used = any('bods-1297-data-landing-zone' in q for q in executed_sql)
        correct_path_used = any('raw/naptan/naptan_latest_csv.csv' in q for q in executed_sql)
        event_bucket_used = any('fdbt-csv-ref-data-test' in q for q in executed_sql)
        print(f"[TEST] naptan bucket used in SQL:      {naptan_bucket_used}  (expected: True)")
        print(f"[TEST] correct file path in SQL:       {correct_path_used}  (expected: True)")
        print(f"[TEST] event bucket leaked into SQL:   {event_bucket_used}  (expected: False)")

        assert naptan_bucket_used
        assert correct_path_used
        assert not event_bucket_used

@pytest.mark.integration
def test_real_naptan_data_from_bucket():
    """Uses bods profile to pull real naptan data, validates it looks correct."""
    NAPTAN_BUCKET = 'bods-1297-data-landing-zone'
    NAPTAN_KEY = 'raw/naptan/naptan_latest_csv.csv'

    # Account 1 (bods) — to read the naptan file from the source bucket
    bods_session = boto3.Session(profile_name='bods-test-rw')  # change to your bods profile name
    s3 = bods_session.client('s3', region_name='eu-west-2')

    print(f"\n[INTEGRATION] Account 1 (bods): connecting to bucket {NAPTAN_BUCKET}")
    bods_identity = bods_session.client('sts').get_caller_identity()
    print(f"[INTEGRATION] Bods account ID: {bods_identity['Account']}")
    print(f"[INTEGRATION] Bods identity:   {bods_identity['Arn']}")

    print(f"[INTEGRATION] Fetching: s3://{NAPTAN_BUCKET}/{NAPTAN_KEY}")
    response = s3.get_object(Bucket=NAPTAN_BUCKET, Key=NAPTAN_KEY)
    content = response['Body'].read().decode('utf-8')
    print(f"[INTEGRATION] File size: {len(content):,} bytes")

    reader = csv.DictReader(io.StringIO(content))
    rows = list(reader)
    print(f"[INTEGRATION] Total rows: {len(rows):,}")
    print(f"[INTEGRATION] Columns: {reader.fieldnames}")

    # Account 2 (tfn) — to confirm what account the Lambda will run in
    tfn_session = boto3.Session(profile_name='tfn-test')
    tfn_identity = tfn_session.client('sts').get_caller_identity()
    print(f"\n[INTEGRATION] Account 2 (tfn): Lambda will run in account {tfn_identity['Account']}")
    print(f"[INTEGRATION] tfn identity: {tfn_identity['Arn']}")

    # Validate the naptan data
    expected_columns = ['ATCOCode', 'CommonName', 'Latitude', 'Longitude', 'StopType']
    for col in expected_columns:
        present = col in reader.fieldnames
        print(f"[INTEGRATION] Column '{col}' present: {present}")
        assert present, f"Expected column '{col}' not found"

    print(f"\n[INTEGRATION] First 3 rows:")
    for i, row in enumerate(rows[:3]):
        print(f"  Row {i+1}: ATCOCode={row.get('ATCOCode')}, CommonName={row.get('CommonName')}, StopType={row.get('StopType')}")

    assert len(rows) > 0
    print(f"\n[INTEGRATION] PASSED - naptan data pulled from bods account and looks valid")