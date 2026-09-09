/**
 * WS-WHOLE-MANUSCRIPT-01 · the falsifier's own Playwright configuration.
 *
 * Deliberately NOT `e2e/playwright.config.ts`: that one starts `npm run dev` on
 * port 3000 and fans out across six browser profiles. This harness supplies its
 * own already-built application on a loopback port, and a falsifier that could
 * silently attach to whatever happened to be listening on 3000 would be
 * witnessing an unknown subject.
 *
 * ⛔ NO RETRIES. A check that passes on the second attempt has told us
 * something — that the behaviour is not reliable — and a retry would discard
 * exactly that.
 */
import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.WM_BASE;
if (!baseURL) throw new Error('WM_BASE is required — the falsifier does not guess its subject.');

export default defineConfig({
  testDir: __dirname,
  outputDir: process.env.WM_OUT ?? `${__dirname}/.results`,
  timeout: 180_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: true,
  reporter: [['list']],
  use: {
    baseURL,
    ...devices['Desktop Chrome'],
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium' }],
});
