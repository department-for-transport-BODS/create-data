import fs from 'fs';
import path from 'path';
import { defineConfig } from 'cypress';
import yaml from 'js-yaml';

interface PreprodUsers {
    operator: { email: string; password: string };
    scheme: { email: string; password: string };
}

// Credentials are kept out of source control - see cypress/env/preprod/users.yaml (gitignored).
const loadPreprodUsersEnv = (): Record<string, string> => {
    const usersFile = path.join(__dirname, 'cypress/env/preprod/users.yaml');
    if (!fs.existsSync(usersFile)) {
        return {};
    }

    const users = yaml.load(fs.readFileSync(usersFile, 'utf8')) as PreprodUsers;

    return {
        PREPROD_EMAIL: users.operator?.email ?? '',
        PREPROD_PASSWORD: users.operator?.password ?? '',
        PREPROD_SCHEME_EMAIL: users.scheme?.email ?? '',
        PREPROD_SCHEME_PASSWORD: users.scheme?.password ?? '',
    };
};

export default defineConfig({
    allowCypressEnv: true,
    env: {
        preprod: true,
        ...loadPreprodUsersEnv(),
    },
    e2e: {
        baseUrl: 'https://preprod.dft-cfd.com',
        specPattern: 'cypress/e2e/preprod/**/*.cy.ts',
        supportFile: 'cypress/support/preprod.ts',
    },
    defaultCommandTimeout: 30000,
    numTestsKeptInMemory: 0,
    pageLoadTimeout: 60000,
    projectId: '2pvo3t',
    redirectionLimit: 25,
    retries: 3,
    responseTimeout: 30000,
});
