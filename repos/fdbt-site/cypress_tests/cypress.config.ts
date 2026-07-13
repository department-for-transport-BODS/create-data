import { defineConfig } from 'cypress';

export default defineConfig({
    allowCypressEnv: false,
    e2e: {
        baseUrl: 'http://localhost:5555',
    },
    numTestsKeptInMemory: 0,
    projectId: '2pvo3t',
    redirectionLimit: 25,
    retries: 3,
});
