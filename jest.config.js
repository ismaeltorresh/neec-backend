export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
    }],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: [
    '**/__tests__/**/*.{js,ts}',
    '**/?(*.)+(spec|test).{js,ts}'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    'environments.test.ts',
    'environments.test.js',
    'environments.test$'
  ],
  collectCoverageFrom: [
    'routes/**/*.{js,ts}',
    'middlewares/**/*.{js,ts}',
    'utils/**/*.{js,ts}',
    '!**/*.test.{js,ts}',
    '!**/__tests__/**',
    '!**/dist/**',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true
};
