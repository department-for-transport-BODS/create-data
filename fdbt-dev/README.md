# fdbt-dev

This repo facilitates the development of the Create Fares Data service by providing scripts to launch the site and surrounding dev infra, which are brought up by a single docker compose file. A Makefile and a series of bash scripts provide an easy way for developers to bring up the environment, run tests, reset the data etc.

## Requirements

- [Docker](https://docs.docker.com/install/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [MySQL 5.6](https://dev.mysql.com/doc/mysql-getting-started/en/)
  - For Ubuntu users, if you cannot install MySQL 5.6 using the [MySQL APT Repository](https://dev.mysql.com/downloads/repo/apt/), follow the instructions [here](https://dev.mysql.com/doc/refman/8.0/en/linux-installation-debian.html)
- [LocalStack AWS CLI](https://github.com/localstack/awscli-local)
- [jq](https://stedolan.github.io/jq/download/)

## Repo structure

In order to use the scripts in this repo, the FDBT repos need to be in a particular directory structure on your machine:

```text
├── fdbt-aws
├── fdbt-dev
├── repos
│   ├── fdbt-site
│   ├── fdbt-reference-data-service
│   └── fdbt-netex-output
```

## Running the Create Fares Data service

| Var                         | Description                                                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| PATH_TO_ROOT                | The absolute path to the root of the [repo structure](#repo-structure)                                                               |
| COGNITO_USER_POOL_ID        | In the AWS console, using the aws-tfn-test role, Cognito -> Manage User Pools -> fdbt-user-pool-test -> **Pool Id**                      |
| COGNITO_USER_POOL_CLIENT_ID | In the AWS console, using the aws-tfn-test role, Cognito -> Manage User Pools -> fdbt-user-pool-test -> App clients -> **App client id** |

Set the above env vars in your .zshrc or .bashrc:

```bash
export FDBT_ROOT={PATH_TO_ROOT}
export FDBT_USER_POOL_ID={COGNITO_USER_POOL_ID}
export FDBT_USER_POOL_CLIENT_ID={COGNITO_USER_POOL_CLIENT_ID}
```

Install dependencies from the fdbt-dev folder:

```bash
mise -C ${FDBT_ROOT}/fdbt-dev run install
```

The site and infrastructure can then be brought up by simply running:

```bash
mise -C ${FDBT_ROOT}/fdbt-dev run dev
```

This will start the following:

- Site on http://localhost:5555
- LocalStack S3 on http://127.0.0.1:4566
- MySQL on 127.0.0.1:3306

## Other features

The Makefile has other functionality such as running tests (`make test-site`) and tailing logs (`make logs-site`), see the Makefile for a full list of commands.

For the ODH Uploader it will not send the email locally therefore the purpose of running the make command is show the output which includes the email address and the email template with the populated fields. This will allow you to validate it locally.
