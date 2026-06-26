import os
import pytest
import boto3
from moto import mock_s3, mock_ssm, mock_cloudwatch

@pytest.fixture(scope='function')
def aws_credentials():
    """Mocked AWS Credentials for moto."""
    os.environ['AWS_ACCESS_KEY_ID'] = 'testing'
    os.environ['AWS_SECRET_ACCESS_KEY'] = 'testing'
    os.environ['AWS_SECURITY_TOKEN'] = 'testing'
    os.environ['AWS_SESSION_TOKEN'] = 'testing'

@pytest.fixture(scope='function')
def s3(aws_credentials):
    with mock_s3():
        yield boto3.client('s3', region_name='eu-west-2')


@pytest.fixture(scope='function')
def ssm(aws_credentials):
    with mock_ssm():
        yield boto3.client('ssm', region_name='eu-west-2')

@pytest.fixture(scope='function')
def cloudwatch(aws_credentials):
    with mock_cloudwatch():
        yield boto3.client('cloudwatch', region_name='eu-west-2')