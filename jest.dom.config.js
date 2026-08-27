/**
 * Scoped DOM test project — surfaces that genuinely need a DOM.
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
 *   - this project matches ONLY files explicitly named `*.dom.test.tsx`, under
 *     the three paths below
 *   - the root config matches only `*.test.ts`, so it cannot see these files
 *   - the existing suites and their `node` environment are untouched, and the
 *     39-test baseline they establish must keep passing on its own config
 *
 * THIRD SURFACE, widened 2026-08-25, to include `lib/hooks`. Voice capture and turn
 * finalization run inside a React hook driving a browser SpeechRecognition
 * object; a Node environment cannot exercise either. The opt-in stays explicit
 * — a file is only picked up if it is NAMED `*.dom.test.tsx` — so no existing
 * suite changes environment by accident.
 *
 * NOT revived here: `lib/hooks/__tests__/useVoiceInput.rerender.test.tsx`. It
 * matches NEITHER config and has therefore never executed — `.tsx` is outside
 * the root config's `*.test.ts` testMatch, and it sat outside this project's
 * manuscript-only path. It also imports `@testing-library/react`, which is not
 * a dependency of this repository, so it could not have run even if matched.
 * It pins the composer self-abort regression and currently pins nothing.
 * Reviving it needs either that dependency or a rewrite, and that is its own
 * unit — not instrumentation work smuggled into a witness PR.
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
    '<rootDir>/lib/hooks/**/__tests__/**/*.dom.test.tsx',
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
