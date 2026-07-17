# High Level Design

## Overview

The Fares Data Build Tool allows users to convert their fares information into a standardised format called NeTEx, an XML data format. The tool provides a GDS-compliant web workflow which takes the user through a series of questions, allowing them to define their fare structures for the products they provide.

The uploaded fares data is enriched with public reference data obtained from 3 sources - NOC, NaPTAN and TNDS - and converted into the NeTEx format before being emailed to the user.

The aim of the tool is to integrate closely with the DfT BODS system where users will be able to upload their NeTEx for public access.

## Scope

- Customer-facing Next.js web application
- Support-facing React web admin application
- Serverless application to retrieve public reference data and upload to data store
- Serverless application to generate, validate and email out the NeTEx
- AWS hosted infrastructure

## System Access

- Create Fares Data website
  - Primary entrypoint for users, available on [https://fares-data.dft.gov.uk](https://fares-data.dft.gov.uk)
- CFD Admin
  - Site for support users to manage CFD website accounts [https://admin.prod.dft-cfd.com/](https://admin.prod.dft-cfd.com/)

## Technical Design

### Overall Architecture

The Fares Data Build Tool comprises of three main components, the website, the reference data service and the NeTEx Convertor.

#### Site

The Site is a TypeScript Next.js application running on ECS Fargate tasks. The tasks run behind an AWS application load balancer to distribute requests across tasks. The load balancer is set as an origin of a CloudFront distribution, which acts as a global CDN, providing caching and custom error routing.

AWS Cognito is used to handle authentication on the site and DynamoDB is used as a session store. The site uploads data to a number of S3 buckets as part of the journey, the final of which will trigger the NeTEx creation.

#### Reference Data Service

The Reference Data Service is a Serverless application comprising a number of Python Lambdas in AWS. There are three Lambdas responsible for retrieving the reference data, two Lambdas to upload the data to the central data store and one Lambda to handle unzipping of the TNDS data files.

Data is retrieved from 3 sources, NaPTAN, NOC and TNDS, with a Lambda running for each data type. The NaPTAN and NOC data is in CSV format and is retrieved via HTTP requests to download the files. The TNDS data is in XML format and is retrieved via FTP. These Lambdas are triggered daily at 2am (NaPTAN, NOC) and 2:15am (TNDS) via CloudWatch Events.

The Uploaders process the data and store it in the central data store, an AWS MySQL Aurora RDS instance. The CSV Uploader handles the NaPTAN and NOC data by importing the CSV data directly into DB tables from S3, which is a feature of Aurora. The XML Uploader handles the TNDS data and performs some processing before writing the data to the DB.

#### NeTEx Convertor

The NeTEx Convertor is a Serverless application comprising two Node.js Lambdas written using TypeScript and a single Python Lambda. When user fare data is uploaded to S3 after the web workflow, the NeTEx Generator Lambda (Node.js) will be triggered, this will build the NeTEx and upload it to an unvalidated bucket.

This will then trigger the Validator Lambda (Python) which will validate the NeTEx against the [XSD](http://netex.uk/netex/schema/1.10/xsd/NeTEx_publication.xsd). If the NeTEx is valid it will be uploaded to a final bucket, if it fails an alert will be raised via Slack for investigation.

NeTEx being uploaded to the final validated bucket will trigger the Emailer Lambda (TypeScript) which will use NodeMailer and AWS SES to send the NeTEx to the user via email.

### Data Sources

- NaPTAN - [https://data.gov.uk/dataset/ff93ffc1-6656-47d8-9155-85ea0b8f2251/national-public-transport-access-nodes-naptan](https://data.gov.uk/dataset/ff93ffc1-6656-47d8-9155-85ea0b8f2251/national-public-transport-access-nodes-naptan)
- NOC - [https://www.travelinedata.org.uk/traveline-open-data/transport-operations/advanced/](https://www.travelinedata.org.uk/traveline-open-data/transport-operations/advanced/)
- TNDS - [ftp://ftp.tnds.basemap.co.uk/](ftp://ftp.tnds.basemap.co.uk/)

### Authentication

AWS Cognito is used for authentication. Cognito is a managed service, providing user pools which users can be registered in and authenticate against within the website. By using a managed service we do not need to store passwords within our own data stores.

Users are pre-registered on the service using their email address also adding their National Operator Code as an attribute against the user. This will send an email to the registered address, which contains a link to the registration page on the site. The registration page will ask for a password which is then stored in Cognito and will confirm the user, allowing them to login to the service. No self-registration is currently possible.

On login, the ID and Refresh tokens will be stored as cookies. The ID token has a lifetime of 20 minutes while the refresh token has a lifetime of 30 days. The cookies are session cookies and will be deleted on closing the browser.

An express middleware is used to handle authentication on the site, validating the ID token has not expired and that the signature is valid on every request to a protected page.

### Infrastructure

![Architecture Diagram](../_images/CFDArchitecture.drawio.png)

### Data

#### User data

The only personally identifying information collected from a user is their email address, all other data is obtained from public sources and contains no sensitive or personal information.

Google Analytics collects anonymised user data including anonymised IP addresses in order to monitor general user behaviour and help with creating improvements for the site.

#### Data Storage

Data is stored across the following:

- RDS Aurora MySQL
  - Used for storing the retrieved public reference data along with some user defined data for re-use on the website, this contains no personal data
- S3
  - Used for storing user files, user fare data, generated NeTEx and the retrieved reference data before being uploaded to the RDS DB
  - User email is stored in a single bucket, which is retrieved to send the NeTEx to the user after creation
- DynamoDB
  - Stores user session data (fares information) while progressing through the site journey

#### Application logs

Personally identifying information is not available in any application logs. Logs are streamed to AWS CloudWatch where they are retained for 90 days before deletion.

#### Data Retention

- RDS Aurora MySQL
  - Reference data is imported and overwritten every day
  - User defined data (eg. Sales Offer Packages) are retained indefinitely but do not contain personal info
- S3
  - Reference data is replaced every day with the latest version
  - User fares data and uploaded files are deleted after 30 or 60 days depending on the bucket
  - Validated NeTEx data is retained indefinitely but does not contain personal info
- DynamoDB
  - Session data is deleted automatically after finishing a journey on the site or after 24 hours of not being updated

#### Data Backup

- RDS Aurora MySQL
  - Reference data is imported every day and is reproducible
  - DB is not multi-az for cost reasons
  - Backups are taken daily and stored for 3 days in prod
- S3
  - S3 is automatically backed up across multiple availability zones within the region
- DynamoDB
  - DynamoDB is automatically backed up across multiple availability zones within the region

#### Data access requests and right to forget

Under GDPR, users may make a Subject Access Request (SAR) and also request their personal data to be removed.

Users can be removed from Cognito on request, emails stored in S3 will be deleted automatically after 60 days but can be located on request using the NOC associated with the user’s email.

### Personally Identifiable Information (PII)

### PII Data Map

| Personal Data | Source                     | Reason                                          | Handling                                                | Retention                                                                   | Consent Obtained?                             | Classified | Mission Critical? |
| ------------- | -------------------------- | ----------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------- | ---------- | ----------------- |
| Email Address | Given for pre-registration | Needed for authentication and for sending NeTEx | Stored in AWS Cognito for auth and S3 for sending NeTEx | Stored until requested for deletion in Cognito, deleted after 60 days in S3 | Invited to use tool ahead of being registered | No         | Yes               |

## Scaling and Capacity

The Serverless applications utilise Lambdas which can scale up to thousands of concurrent executions automatically, well beyond our requirements for this tool.

The ECS Fargate tasks for the Site can scale between a minimum of 2 and a maximum of 6 tasks currently, with a CPU utilisation target of 50%.

DynamoDB is in ‘On Demand’ mode and so will automatically scale its read and write capacity as necessary without intervention.

RDS Aurora will not scale automatically and is currently set as a t3.medium in production. This is sufficient for our current requirements. If DB load was likely to increase, this would need to be scaled up, or other measures such as Aurora read replicas would need to be implemented.

## Availability and Resilience

We aim for full availability of the service at all times. We utilise Uptime Robot for uptime monitoring.

### Infrastructure

If the AWS London region as a whole was to go down it would result in a full outage of the site, recovering the site would require either deploying the service into a new region or waiting for the failed region to recover.

Fargate is ran with a minimum of two tasks across two availability zones within the London region. If a task were registered as unhealthy a new one would be provisioned.

S3, DynamoDB and Lambda are highly available by default, running or replicating data across all AZs in the region.

RDS is not currently configured in multi-az mode, in the case of a full outage resulting in data loss from the running instance, a backup would need to be used. If the backups were lost from the London region in addition then the data would be unrecoverable. Most data in the database is entirely reproducible however the user-defined Sales Offer Packages would be lost and they would need to re-create them.

### External services

In the case of the reference data sources being unavailable at the time of execution of the reference data retrievers (2am / 2:15am), the data would not be retrieved for that day. This was deemed as acceptable since the data does not change that frequently and it would be retrieved the following day assuming the data source became available again.

## Security

### User Access / Site Security

Users are pre-registered on the site using their email address along with their National Operator Code(s) (NOC) which uniquely identifies the operator(s) they represent. They are not able to self-register, offering an extra layer of validation to who can access the site in the first place. There is only one user level, we do not have admin users.

All pages in the actual user journeys are secured and require authentication, this uses AWS Cognito to provide an ID token which is validated on every request as previously mentioned in this document.

All form submissions use CSRF tokens to prevent any attempt at a Cross Site Request Forgery attack.

Cookies are all set as secure and HTTP only.

Security headers such as CSPs are set and the site achieves an A+ on Mozilla Observatory at the time of writing.

### AWS Access

Access to AWS accounts is controlled by Organisational SSO.

The root user is not used and is protect by AWS Organisation controls.

All AWS API requests are recorded using AWS CloudTrail, the logs from each child account are stored in the core account where they can be queried using Amazon Athena.

### Encryption at Rest

Data is encrypted at rest in every form of data store (S3, DynamoDB, RDS Aurora, CloudTrail) using standard AES-256 encryption.

### Encryption in Transit

Traffic from the viewer to the CloudFront edge locations and from the edge locations to the load balancer is all via HTTPS using a certificate provisioned in Amazon Certificate Manager (ACM). TLS is terminated on the load balancer and traffic to the Fargate tasks is over HTTP from that point although within our private VPC network.

All traffic to S3 and DynamoDB is over HTTPS by default.

Traffic to the Aurora database is not encrypted but it sits within a subnet in our VPC that has no direct inbound or outbound connectivity to the open internet.

## Operations

Grafana is used to visualise metrics captured from each service, CloudWatch is used to provide both custom metrics gathered from application logs and also AWS Service level metrics. The Grafana instance runs in ECS Fargate on a single task, mounting an AWS EFS volume for persistent storage.

Logs are all exported into CloudWatch Logs where insights can then be used for analysing and searching through the log data.

## Rollout

We adhere to a GitFlow development workflow primarily, feature branches are created from develop and then merged back in after review to release to the test environment. PRs are then created into the master branch and merged to trigger a release to the pre-Production environment. When ready for release to production, a release tag is created from master, there is also a manual approval step in the production pipeline to verify the release.

We use Github Actions as our primary CI tool, it is used to run all tests, auditing of dependencies and linting of the code.

## Cost Estimates

At the time of writing the production environment costs ~$230 per month
