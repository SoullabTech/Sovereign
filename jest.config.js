/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/app/api/backend/',   // Backend has separate test setup
    '<rootDir>/app/api/_backend/',  // Legacy backend prototype
    '<rootDir>/backend/',           // Backend folder
    '<rootDir>/tests/__legacy__/',  // Quarantined legacy tests
    '<rootDir>/tests/__integration__/', // Integration tests (run separately)
    '<rootDir>/e2e/',               // E2E tests (run with Playwright)
    '<rootDir>/lib/memory/beads-sync/__tests__/', // Beads infra tests
    // Integration tests requiring infrastructure (run separately)
    '.*Integration\\.test\\.ts$',   // fooIntegration.test.ts style
    '.*\\.integration\\.test\\.ts$', // foo.integration.test.ts style
    '.*\\.soak\\.test\\.ts$',       // Soak/load tests
    '.*\\.robustness\\.test\\.ts$', // Robustness tests
    '.*\\.privacy\\.test\\.ts$',    // Privacy tests (need mocks)
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!app/api/backend/**',  // Exclude backend from coverage
  ],
};

module.exports = config;
