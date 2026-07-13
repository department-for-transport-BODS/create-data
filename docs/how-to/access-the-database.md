# Access the Database

- With an authenticated AWS CLI session [see Access AWS](./access-aws.md)
- In the `scripts` folder within the `fdbt-aws` repo there is a script named `cfd-bastion-tunnel`, copy this into your local bin folder:
  - `cp cfd-bastion-tunnel /usr/local/bin`
- If you are authenticated against the target account you can now run the following to access the db:
  - `cfd-bastion-tunnel`
- The DB can now be accessed on port 13306
  - The credentials can be found in [AWS Secrets Manager](https://eu-west-2.console.aws.amazon.com/systems-manager/parameters/fdbt-rds-root-password)
- You can access the DB using the command line and the mysql client:
  - `mysql -h127.0.0.1 -P13306 -u${USERNAME} -p`
  - And then pass in the password when asked
- You can also use a GUI such as Sequel Pro (recommended) or MySQL Workbench

## AWS CLI requirements

- add `export AWS_PAGER=` into .zshrc to allow the `cfd-bastion-tunnel` command to run without the need to `q` out of a file on new AWS CLI versions

## Optional: Sequel Pro

Note that some IDEs have database GUIs already so this tool would not be needed

## Local Database Access

- Spin up local env with `mise run run` in the root of the repo
- Enter the following credentials into Sequel Pro

| Field    | Content               |
| -------- | --------------------- |
| Name     | Chose a sensible name |
| Host     | 127.0.0.1             |
| Username | root                  |
| Password | root                  |
| Database | fdbt                  |
| Port     | 3306                  |

## AWS RDS Database Access

- With an authenticated AWS CLI session [see Access AWS](./access-aws.md)
- Assume the relevant role before starting running the `cfd-bastion-tunnel` command

**NOTE: DO NOT SAVE THE PASSWORD IN WHEN SAVING PROFILES**

| Field    | Content                                                                            |
| -------- | ---------------------------------------------------------------------------------- |
| Name     | Chose a sensible name                                                              |
| Host     | 127.0.0.1                                                                          |
| Username | admin                                                                              |
| Password | Can be found in CFD-Core parameter store under `/rds/${ENVIRONMENT}/root/password` |
| Database | fdbt                                                                               |
| Port     | 13306                                                                              |

## Troubleshooting DB access issues

### If you’re getting ‘Access Denied’ when following the usual process, check the following:

- Run `sudo lsof -i -P -n | grep LISTEN`
- Is there a process listening on port 13306?
- This is most likely a previous connection to one of our RDS instances. To resolve, kill this process using `kill {PROCESS_ID}`
