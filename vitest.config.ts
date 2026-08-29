/**
 * Minimal vitest configuration.
 *
 * ⛔ WHY THIS EXISTS. The repo had no vitest config at all, so the `@/*` path
 * alias that `tsconfig.json` defines — and that most of `lib/` imports with —
 * was unresolvable at transform time. The practical effect was that any module
 * importing `@/…` could not be unit-tested, which is why several units in this
 * programme had to extract dependency-free helpers or lazy-import their way
 * around it, and why fourteen jest-style suites under `lib/` fail to load.
 *
 * This adds ONLY the alias, matching tsconfig. No environment default, no
 * setup files, no include/exclude changes — so which tests run, and how, is
 * exactly as it was.
 */
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
