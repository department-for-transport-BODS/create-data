# Cypress UI Tests

Cypress UI test project, to prove key user journeys work.

## Getting Started

### Install dependencies

Run the following to install the required dependencies, including Cypress:

```bash
cd ${FDBT_ROOT}/repos/fdbt-site/cypress_tests && npm i
```

### Install browsers

We run the tests on Chrome, Firefox and Edge - follow the download and installation instructions for each of these.

Note - for those using Ubuntu, there are instructions [https://www.omgubuntu.co.uk/2021/01/how-to-install-edge-on-ubuntu-linux](here) on how to install the developer version of Edge (at the time of writing, there is not a stable version of Edge for Linux distributions)

## Running the tests locally in interactive mode

-   Bring up the site locally as per instructions in fdbt-dev.
-   To open Cypress in interactive mode, run the following:

```bash
cd ${FDBT_ROOT}/repos/fdbt-site
make open-cypress
```

-   You can now manually run any or all of the cypress tests, choosing which browser you wish the test to run on.
-   This mode allows you to look back through the state of the site at different points in the test execution, which can be useful in debugging issues.

## Running the tests locally via the CLI

-   To run the tests via the CLI, run the following:

```bash
cd ${FDBT_ROOT}/repos/fdbt-site
make run-cypress-[chrome|firefox|edge|all]
```

-   This will not open the interactive test-runner, but will save screenshots and videos in the cypress directory if any errors occur.

## Running the tests against preprod

The specs in `cypress/e2e/preprod` are a copy of the local specs, run against `https://preprod.dft-cfd.com` using `cypress.preprod.config.ts`. Preprod does not allow the `disableAuth` bypass, so the tests sign in through the login page instead.

### Credentials

Two accounts are needed, because the scheme journeys require a scheme operator and the rest require a normal operator. Export them in the terminal you run the tests from:

```bash
export CYPRESS_PREPROD_EMAIL='<operator email>'
read -s "CYPRESS_PREPROD_PASSWORD?Operator password: "; export CYPRESS_PREPROD_PASSWORD

export CYPRESS_PREPROD_SCHEME_EMAIL='<scheme operator email>'
read -s "CYPRESS_PREPROD_SCHEME_PASSWORD?Scheme password: "; export CYPRESS_PREPROD_SCHEME_PASSWORD
```

`scheme.cy.ts` and `carnet/scheme.cy.ts` use the scheme account, every other spec uses the operator account.

### Running

```bash
cd ${FDBT_ROOT}/repos/fdbt-site/cypress_tests
BROWSER=chrome npm run runCypress:preprod
```

To run a subset, pass `--spec`:

```bash
BROWSER=chrome npx cypress run --config-file cypress.preprod.config.ts -b chrome \
  --spec 'cypress/e2e/preprod/myFares/myFares.cy.ts'
```

### HTML report

```bash
BROWSER=chrome npm run runCypress:preprod:report
```

This runs the suite, writes a mochawesome report to `results/preprod-report.html` and opens it in Chrome. The report is produced even when tests fail. Use `npm run report:build` and `npm run report:open` to rebuild or reopen it without re-running the tests.

### Preprod specific behaviour

Everything below is guarded by `Cypress.env('preprod')`, so local runs are unaffected.

-   Test data created by the setup is prefixed with `Preprod Cypress` to keep it separate from other data on the environment.
-   Fare zone uploads use `fareZone.preprod.csv` and `fareZoneEdited.preprod.csv`, which contain ATCO codes that exist in preprod.
-   The scheme specs run their own setup, including operator details, rather than the normal operator setup.

### Tests that do not run on preprod

-   Flat fare priced by distance - the option is only rendered when the deployed app has `STAGE=dev`.
-   The four global settings lifecycle specs - they delete all passenger types, purchase methods, time restrictions and operator groups, which preprod rejects while products depend on them.

