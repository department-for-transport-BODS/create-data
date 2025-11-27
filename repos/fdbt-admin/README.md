# FDBT Admin

The codebase for the Create Fares Data Admin Site. The site is built using React with Amplify to interact with AWS services.


## Environment Variable: REACT_APP_SUPPORT_USER_EMAIL_DOMAINS

Add to your `.env` file for local development:

```
REACT_APP_SUPPORT_USER_EMAIL_DOMAINS=yourdomain.com,anotherdomain.com
```

For Amplify deployments, set this in the Amplify Console environment variables.

## Pre-requisites

-   Node 18
-   AWS CLI
-   [Amplify CLI](https://docs.amplify.aws/cli/start/install)

## Development

### Initial setup

-   If using aws-vault, follow the instructions in 'Using aws-vault' below instead
-   Run `npm install` to install necessary dependencies
-   Retrieve the contents of the secret, `adminTeamProviderInfo`, from Secrets Manager in the Core AWS account
-   Create a file called `team-provider-info.json` in the root of the Amplify folder (`repos/fdbt-admin/amplify/team-provider-info.json`) and paste the above content into it
-   [Authenticate to AWS](../../docs/how-to/access-aws.md) for the `test` environment
-   Run `amplify init` to start init process
    -   "Do you want to use an existing environment?": Yes
    -   "Choose the environment you would like to use": test
    -   "Choose your default editor": Preferred editor
    -   "Do you want to use an AWS profile?": Yes
    -   "Please choose the profile you want to use": Profile with correct privileges

### Developing the site

-   [Authenticate to AWS](../../docs/how-to/access-aws.md) for the `test` environment
-   Run `amplify serve`
-   The site will now open in the browser and be served on [`http://localhost:3000`](http://localhost:3000)

## Deployment

### tl;dr

-   [Authenticate to AWS](../../docs/how-to/access-aws.md) for the desired environment
-   Run `amplify env checkout <test|preprod|prod>`
-   Run `amplify publish`

### Retrieving changes to the infrastructure before deploying

To retrieve the latest changes to Amplify:

-   Run `amplify pull`, make sure to do this before pushing any other Amplify changes

### Switching envs

If you need to switch Amplify envs to work against PreProd or Prod:

-   [Authenticate to AWS](../../docs/how-to/access-aws.md) for the desired environment
-   Run `amplify env checkout <test|preprod|prod>`

### Changes to Amplify

After making a change to Amplify, either with `amplify add`, by changing the config files in `./amplify` or the React site, these will need to be pushed up to AWS:

-   Run `amplify publish`

### Changes to Team Provider Info

If you have made any changes to the `team-provider-info.json` file, then you will need to update Secrets Manager in the Core AWS Account with the new JSON value
