/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    'maiaServiceIntegration.ts',
    'MaiaBeadsPlugin.ts',
    '!**/__tests__/**',
    '!**/node_modules/**',
  ],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../../$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  verbose: true,
};
