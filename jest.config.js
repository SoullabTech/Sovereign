const os = require('os');
const path = require('path');

/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Pin the cache outside the repo. Jest's default is os.tmpdir()/jest_<uid-base36>,
  // which is normally out-of-tree — but if TMPDIR is unset or relative it can resolve
  // into the working tree, and the resulting jest_dx/ cache files have been committed
  // on several branches (see .gitignore). An absolute path makes that impossible.
  cacheDirectory: path.join(os.tmpdir(), 'maia-jest-cache'),
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  modulePathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/.next/standalone/',
    '<rootDir>/.claude/',
  ],
  watchPathIgnorePatterns: [
    '<rootDir>/.claude/',
    '<rootDir>/node_modules/',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/.next/standalone/',
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
        // The transform already claimed `.tsx`, but with no `jsx` setting
        // ts-jest emitted the JSX untouched and Jest died on the first `<`.
        // No suite matched by THIS config is a `.tsx` file, so this affects
        // only `.tsx` MODULES imported by a `.ts` test — which previously
        // could not be imported at all. `.ts` files are unaffected: JSX is
        // not valid there, so the option has nothing to act on.
        jsx: 'react-jsx',
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
