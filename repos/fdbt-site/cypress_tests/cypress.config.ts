import { defineConfig } from 'cypress';

export default defineConfig({
    allowCypressEnv: true,
    e2e: {
        baseUrl: 'http://localhost:5555',
        excludeSpecPattern: 'cypress/e2e/preprod/**/*.cy.ts',
    },
    defaultCommandTimeout: 30000,
    numTestsKeptInMemory: 0,
    pageLoadTimeout: 60000,
    projectId: '2pvo3t',
    redirectionLimit: 25,
    retries: 3,
    responseTimeout: 30000,
});
