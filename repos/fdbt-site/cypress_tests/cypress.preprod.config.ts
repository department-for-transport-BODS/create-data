import { defineConfig } from 'cypress';

export default defineConfig({
    allowCypressEnv: true,
    env: {
        preprod: true,
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
