/**
 * Scoped DOM test project — the Writer's Field only.
 *
 * WHY THIS EXISTS SEPARATELY. The repository's Jest config runs in `node`,
 * which is correct: nearly every suite here tests pure logic, and a global
 * jsdom would invite DOM assumptions into tests that should not have them.
 *
 * But the Writer's Field replaced the core writing surface, and its highest-risk
 * contracts — selection offsets, undo across programmatic insertion, full
 * document replacement on revision restore — are exactly the ones a Node
 * environment cannot exercise at all. Leaving them to a browser walk alone
 * would make the most important behaviour in the editor non-repeatable.
 *
 * THE BOUNDARY, deliberately narrow:
 *   - this project matches ONLY `*.dom.test.tsx` under app/press/manuscript
 *   - the root config matches only `*.test.ts`, so it cannot see these files
 *   - the existing suites and their `node` environment are untouched, and the
 *     39-test baseline they establish must keep passing on its own config
 *
 * Run: `npx jest -c jest.dom.config.js`
 */

/** @type {import('jest').Config} */
const config = {
  displayName: 'writer-field-dom',
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  rootDir: __dirname,
  testMatch: ['<rootDir>/app/press/manuscript/**/*.dom.test.tsx'],
  setupFilesAfterEnv: ['<rootDir>/app/press/manuscript/__tests__/domSetup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          jsx: 'react-jsx',
        },
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};

module.exports = config;
