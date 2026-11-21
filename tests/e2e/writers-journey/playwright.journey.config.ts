import { defineConfig } from '@playwright/test';

// Writer's Studio journey (WJ-1). One worker, steps in order, system Chrome (no browser download).
// WJ_CHROMIUM_PATH (optional): drive that Chromium binary instead of the system Chrome channel (used by the journey-ledger
// harness, tests/e2e/journey-ledger/run.sh --wj1, which runs this spec against a `next dev` stack in a container).
const chromiumPath = process.env.WJ_CHROMIUM_PATH;
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
    ...(chromiumPath
      ? { launchOptions: { executablePath: chromiumPath, args: typeof process.getuid === 'function' && process.getuid() === 0 ? ['--no-sandbox'] : [] } }
      : { channel: 'chrome' as const }),
    navigationTimeout: 120_000,   // a cold `next dev` compiles a route on its first request (tens of seconds); a production build answers at once
    headless: true,
    viewport: { width: 1280, height: 900 },
    trace: 'off',
  },
});
