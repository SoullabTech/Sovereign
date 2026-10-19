/**
 * Explicit opt-in Mac browser witness for the actual C0 password sheet.
 * Static SSR HTML is loaded in real desktop Chrome and iPhone-size WebKit.
 * No Soullab server, member data, credentials or external requests.
 *
 * Run with: C0_BROWSER_WITNESS=1 PLAYWRIGHT_BROWSERS_PATH=<approved-local-cache>
 *   jest --runInBand --runTestsByPath components/auth/__tests__/c0PasswordSheetBrowserWitness.test.ts
 */
import { describe, expect, it } from '@jest/globals';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { chromium, devices, webkit } from 'playwright';
import PasswordChangeSheet from '../PasswordChangeSheet';

const browserSuite = process.env.C0_BROWSER_WITNESS === '1' ? describe : describe.skip;
browserSuite('C0 real browser UI witness (static, fictional)', () => {
  it.each(['desktop Chrome', 'mobile WebKit'])('%s displays truthful refusal, no password collection', async (environment) => {
    expect(process.env.DATABASE_URL).toBeUndefined();
    expect(process.env.SMTP_HOST).toBeUndefined();

    const markup = renderToStaticMarkup(React.createElement(PasswordChangeSheet, {
      isOpen: true,
      onClose: () => {},
      memberId: '11111111-1111-4111-8111-111111111111',
      memberName: 'Fictional Member',
    }));
    const html = '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + markup + '</body></html>';
    const mobile = environment === 'mobile WebKit';
    const browser = mobile
      ? await webkit.launch({ headless: true })
      : await chromium.launch({
          headless: true,
          executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          args: ['--disable-background-networking', '--no-first-run'],
        });
    try {
      const context = await browser.newContext(mobile ? { ...devices['iPhone 13'] } : { viewport: { width: 1280, height: 800 } });
      const page = await context.newPage();
      let requests = 0;
      await page.route('**/*', async (route) => { requests++; await route.abort(); });
      await page.setContent(html, { waitUntil: 'domcontentloaded' });

      expect(await page.getByRole('dialog').count()).toBe(1);
      expect(await page.getByRole('heading', { name: 'Password setup is temporarily unavailable' }).count()).toBe(1);
      expect(await page.getByRole('dialog').innerText()).toContain('No password has been changed');
      expect(await page.locator('input').count()).toBe(0);
      expect(await page.getByRole('link', { name: 'Open Account Settings' }).getAttribute('href')).toBe('/account/settings');
      expect(await page.getByRole('link', { name: 'Contact Soullab support' }).getAttribute('href')).toBe('mailto:support@soullab.life');
      expect(requests).toBe(0);
      await context.close();
    } finally {
      await browser.close();
    }
  }, 60000);
});
