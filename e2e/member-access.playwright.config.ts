/**
 * Standalone Class A fictional-browser acceptance config.
 *
 * Executes the actual Next UI on localhost only. All account/credential/API
 * responses are simulated by Playwright route handlers; no real members/mail.
 */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: 'member-access-fictional.spec.ts',
  timeout: 90_000,
  expect: { timeout: 30_000 },
  retries: 0,
  workers: 1,
  fullyParallel: false,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'off',
    video: 'off',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'fictional-desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'fictional-mobile-webkit', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    // The repo's "npm run dev" intentionally clears DATABASE_URL. Keep our
    // exact fictional test DB so the real Next proxy can verify the founder
    // cookie against a real ephemeral auth_sessions row.
    command: './node_modules/.bin/next dev -p 3000',
    cwd: process.cwd(),
    port: 3000,
    reuseExistingServer: false,
    timeout: 240_000,
    env: {
      CI: 'true',
      NODE_ENV: 'development',
      NEXT_TELEMETRY_DISABLED: '1',
      DATABASE_URL: 'postgresql://postgres:postgres@127.0.0.1:5432/postgres',
      MEMBER_ACCESS_RECOVERY_ENABLED: '0',
      LABTOOLS_ADMIN_PASSWORD: '',
      ADMIN_RESET_SECRET: '',
      RESEND_API_KEY: '',
    },
  },
});
