import { defineConfig } from '@playwright/test';

// Writer's Studio journey (WJ-1). One worker, steps in order, system Chrome (no browser download).
export default defineConfig({
  testDir: '.',
  testMatch: /journey\.spec\.ts$/,
  fullyParallel: false,
  workers: 1,
  retries: 0,                 // a failure is reported as it is; nothing is retried
  timeout: 180_000,
  reporter: [['list'], ['json', { outputFile: process.env.WJ_REPORT || 'journey-report.json' }]],
  use: {
    baseURL: process.env.WJ_BASE_URL || 'http://127.0.0.1:3300',
    channel: 'chrome',
    headless: true,
    viewport: { width: 1280, height: 900 },
    trace: 'off',
  },
});
