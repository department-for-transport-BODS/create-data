const nextJest = require('next/jest');

const createJestConfig = nextJest({
    dir: './',
});

const customJestConfig = {
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
    testMatch: ['**/*.(test|spec).(ts|tsx)'],
    coveragePathIgnorePatterns: ['/node_modules/'],
    setupFiles: ['<rootDir>/.jest/setEnvVars.ts'],
    coverageReporters: ['json', 'lcov', 'text', 'text-summary'],
    moduleNameMapper: {
        '\\.(css|sass|scss)$': 'identity-obj-proxy',
        '\\.(csv|ico|png|pdf)$': '<rootDir>/__mocks__/fileMock.js',
    },
};

// next/jest sets its own transformIgnorePatterns — post-process to add ESM packages
const jestConfig = createJestConfig(customJestConfig);
module.exports = async (...args) => {
    const config = await jestConfig(...args);
    config.transformIgnorePatterns = (config.transformIgnorePatterns || []).map((pattern) =>
        pattern.replace('/node_modules/', '/node_modules/(?!(uuid)/)'),
    );
    return config;
};
