const nextJest = require('next/jest');

const createJestConfig = nextJest({
    dir: './',
});

const customJestConfig = {
    testEnvironment: 'jsdom',
    // jsdom resolves packages using the "browser" export condition by default, which makes
    // aws-sdk v3 (and other dual-build packages) load their ESM browser builds and fail to
    // parse under Jest. Prefer the node conditions so they resolve to their CJS builds.
    testEnvironmentOptions: {
        customExportConditions: ['node', 'node-addons'],
    },
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
// and switch to babel-jest which produces configurable exports (unlike SWC),
// allowing jest.spyOn() to work in Jest 30.
const jestConfig = createJestConfig(customJestConfig);
module.exports = async (...args) => {
    const config = await jestConfig(...args);
    // Replace all SWC transforms with babel-jest so exports are configurable
    if (config.transform) {
        for (const key of Object.keys(config.transform)) {
            config.transform[key] = [
                'babel-jest',
                { presets: [['next/babel', { 'preset-react': { runtime: 'automatic' } }]] },
            ];
        }
    }
    config.transformIgnorePatterns = (config.transformIgnorePatterns || []).map((pattern) =>
        pattern.replace('/node_modules/', '/node_modules/(?!(uuid)/)'),
    );
    return config;
};
