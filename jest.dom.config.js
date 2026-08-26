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
 * SECOND SURFACE (MLX-06 Unit 3B). MAIA's first contact after Arrival has the
 * same property: whether the member actually SEES it cannot be established in a
 * `node` environment, and the transcript that owns it lives inside a
 * 10,794-line component with 116 imports — too coupled to mount without mocking
 * the product away. So the visibility seam is rendered here instead, under the
 * same narrow discipline.
 *
 * THE BOUNDARY, deliberately narrow:
 *   - this project matches ONLY `*.dom.test.tsx` under the two paths below
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
  testMatch: [
    '<rootDir>/app/press/manuscript/**/*.dom.test.tsx',
    '<rootDir>/components/maia/**/*.dom.test.tsx',
  ],
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
