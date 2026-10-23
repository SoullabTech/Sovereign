import { test, expect } from '@playwright/test';
import { resolve } from 'path';

/**
 * Standalone, PUBLIC/fictional real-browser client acceptance.
 * This is NOT authenticated Next.js, a physical iPhone, R2/R3, or R20 proof.
 * Test only the isolated MAIA React components; do not load a Soullab API.
 */

test.beforeEach(async ({ page }) => {
  await page.setContent('<main id="maia-test-host"></main>');
  await page.addScriptTag({
    path: resolve(process.cwd(), 'tests/ios-p0-client/browserHarness.bundle.js'),
  });
});

test('idle mount and callback rerender never close; deliberate doubleclick closes once', async ({ page }) => {
  await page.evaluate(() => (window as any).__maiaIosP0.renderClose(false));
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.evaluate(() => (window as any).__maiaIosP0.renderClose(false));
  await expect.poll(async () =>
    page.evaluate(() => (window as any).__maiaIosP0.counts().closeRequests),
  ).toBe(0);

  await page.evaluate(() => (window as any).__maiaIosP0.renderClose(true));
  const closeButton = page.getByRole('button', { name: 'Request session close' });
  await expect(closeButton).toBeVisible();
  await closeButton.dblclick();
  await expect.poll(async () =>
    page.evaluate(() => (window as any).__maiaIosP0.counts().closeRequests),
  ).toBe(1);
});

test('Sanctuary 202 is displayed as pending without a new close action', async ({ page }) => {
  await page.evaluate(() =>
    (window as any).__maiaIosP0.renderClose(true, 'sanctuary_erasure_pending'),
  );
  await expect(page.getByRole('heading', { name: 'Sanctuary erasure pending' })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('NOT yet been verified');
  await expect(page.getByRole('button', { name: 'Request session close' })).toHaveCount(0);
  await expect.poll(async () =>
    page.evaluate(() => (window as any).__maiaIosP0.counts().closeRequests),
  ).toBe(0);
});

test('opening starts once per actual open transition, not idle or rerender', async ({ page }) => {
  await page.evaluate(() => (window as any).__maiaIosP0.renderOpening(false));
  await expect.poll(async () =>
    page.evaluate(() => (window as any).__maiaIosP0.counts().openings),
  ).toBe(0);

  await page.evaluate(() => (window as any).__maiaIosP0.renderOpening(true));
  await expect.poll(async () =>
    page.evaluate(() => (window as any).__maiaIosP0.counts().openings),
  ).toBe(1);

  await page.evaluate(() => (window as any).__maiaIosP0.renderOpening(true));
  await expect.poll(async () =>
    page.evaluate(() => (window as any).__maiaIosP0.counts().openings),
  ).toBe(1);
});

test('unverified saved timer cannot Resume or New, but dismiss remains usable', async ({ page }) => {
  await page.evaluate(() => (window as any).__maiaIosP0.renderResume(true));
  await expect(page.getByRole('button', { name: 'Resume verified session' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Begin verified new conversation' })).toBeDisabled();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect.poll(async () =>
    page.evaluate(() => (window as any).__maiaIosP0.counts().dismissals),
  ).toBe(1);
  const totals = await page.evaluate(() => (window as any).__maiaIosP0.counts());
  expect(totals.resumes).toBe(0);
  expect(totals.news).toBe(0);
});

test('the actual session clock updates seconds and extended total', async ({ page }) => {
  await page.evaluate(() => (window as any).__maiaIosP0.renderTimer());
  const display = page.getByRole('timer');
  await expect(display).toContainText('0:00 / 50:00');
  await page.evaluate(() => (window as any).__maiaIosP0.extendTimer(15));
  await expect(display).toContainText('65:00');
  await expect(display).toContainText('0:01 / 65:00', { timeout: 4500 });
  // This isolated bundle intentionally does not load the production
  // Tailwind stylesheet, so visual dimensions are not meaningful here.
  // Verify the accessible progress role/value instead; the actual clock
  // progression and extended total are asserted immediately above.
  const progress = page.getByRole('progressbar', { name: 'Session time elapsed' });
  await expect(progress).toHaveCount(1);
  await expect(progress).toHaveAttribute('aria-valuemin', '0');
  await expect(progress).toHaveAttribute('aria-valuemax', '100');
  await expect(progress).toHaveAttribute('aria-valuenow', /^[0-9]+$/);
});
