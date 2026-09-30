# Add a New CFD Admin

Create Fares Data admins use the admin facilities within the main [Create Fares Data website](https://fares-data.dft-cfd.com/).
Admin users can add, edit, delete and list CFD users, resend invitations and view reporting.

## Adding a new user

To be able to add a new CFD Admin, you must have Prod AWS account access with the ability to make changes in Cognito

- Access the relevant AWS account (see [Access AWS](../how-to/access-aws.md) for details)
- Go to Cognito in `eu-west-2` (London)
- Go to the main `fdbt-user-pool-<STAGE>` user pool
- In the "Users" box, click "Create user"
- Under "User information":
  - "Invitation Message": Send an email invitation
  - "Email address": "\<enter the new users email address\>"
  - "Mark email address as verified": Checked
  - "Temporary password": Generate a password
- Add the user to the `admin` group
- The new admin should then receive an email invitation
  - This confirms their username and contains a temporary password
- After signing in to the main site, the admin facilities links are shown on the home page.
