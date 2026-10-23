import { defineConfig } from '@playwright/test';

/**
 * Scoped isolated client smoke — NO API, database, login, model or cloud
 * browser dependency. This is a WebKit emulator, not a physical iPhone.
 */
export default defineConfig({
  testDir: '.',
  testMatch: '**/browserLifecycle.spec.ts',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'line',
  timeout: 15000,
  use: {
    headless: true,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'webkit-mobile',
      use: {
        browserName: 'webkit',
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'webkit-desktop',
      use: {
        browserName: 'webkit',
        viewport: { width: 1366, height: 768 },
      },
    },
  ],
});
