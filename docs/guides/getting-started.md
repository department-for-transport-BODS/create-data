# Getting started Guide

## Get access to GitHub repos

- Create a GitHub account if you do not already have one
- Request access to the [fares-data-build-tool](https://github.com/fares-data-build-tool) through an admin
- Setup SSH keys on GitHub if you haven’t already with [connecting-to-github-with-ssh](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/connecting-to-github-with-ssh)

## Install Homebrew (Mac)

(package manager - allows installation of packages using `brew` command)

`/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"`

## Install/Upgrade Python

It is recommended to use `pyenv` to manage versions of python easily, see [https://github.com/pyenv/pyenv](https://github.com/pyenv/pyenv) for installation instructions, unless otherwise stated Python 3.7 has been used for development of the service.

## Install Wget

### Mac

`brew install wget`

### Ubuntu

`sudo apt install wget`

## Install Node.js

`asdf` should be used to manage versions of node, see [https://asdf-vm.com/](https://asdf-vm.com/) for installation instructions.

Unless otherwise stated node 18 has been used for development of the service.

## Install jq

### Mac

`brew install jq`

### Ubuntu

`sudo apt install jq`

## Install AWS Local

`pip install awscli-local`

## Getting AWS access

See [Access AWS](../how-to/access-aws.md) for details on getting setup with AWS

## IDE

VS Code and IntelliJ are both supported so use whichever you are most comfortable with.

### Option 1: VS Code

[https://code.visualstudio.com/](https://code.visualstudio.com/)

See [Setup VSCode for Dev](../how-to/setup-vscode-for-dev.md) for details on configuring VS Code

### Option 2: IntelliJ

[https://www.jetbrains.com/idea/download](https://www.jetbrains.com/idea/download)


## Setting REACT_APP_SUPPORT_USER_EMAIL_DOMAINS

For `fdbt-admin`, add the following to your `.env` file for local development:

```
REACT_APP_SUPPORT_USER_EMAIL_DOMAINS=yourdomain.com,anotherdomain.com
```

For AWS Amplify deployments, set this variable in the Amplify Console under App settings > Environment variables.

## Repo Setup

There is a mono repo which contains all our services: [https://github.com/fares-data-build-tool/create-data](https://github.com/fares-data-build-tool/create-data)

Follow the READMEs in the fdbt-dev folder and the individual service repos to get everything up and running locally

## Useful Links

- [All Github Pull requests](https://github.com/pulls?q=is%3Aopen+is%3Apr+archived%3Afalse+user%3Afares-data-build-tool)
- [editthiscookie chrome extension](https://chrome.google.com/webstore/detail/editthiscookie/fngmhnnpilhplaeedifhccceomclgfbg?hl=en)
