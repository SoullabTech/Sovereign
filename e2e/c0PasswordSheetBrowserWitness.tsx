/**
 * C0 isolated browser UI witness. Static rendering of the real password sheet
 * in desktop Chrome and mobile WebKit. No app server, database, network request,
 * login attempt, email, member record or production environment.
 *
 * Run explicitly with: node --import tsx e2e/c0PasswordSheetBrowserWitness.tsx
 */
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { chromium, devices, webkit } from 'playwright';
import PasswordChangeSheet from '../components/auth/PasswordChangeSheet';

if (process.env.DATABASE_URL || process.env.SMTP_HOST) {
  throw new Error('Refusing browser witness with production-capable environment variables');
}
const memberId = '11111111-1111-4111-8111-111111111111';
const markup = renderToStaticMarkup(React.createElement(PasswordChangeSheet, {
  isOpen: true,
  onClose: () => {},
  memberId,
  memberName: 'Fictional Member',
}));
const html = '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body>' + markup + '</body></html>';

const cases = [
  {
    name: 'desktop Chrome',
    type: chromium,
    launch: { headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--disable-background-networking', '--no-first-run'] },
    context: { viewport: { width: 1280, height: 800 } },
  },
  {
    name: 'mobile WebKit',
    type: webkit,
    launch: { headless: true },
    context: { ...devices['iPhone 13'] },
  },
] as const;

for (const c of cases) {
  const browser = await c.type.launch(c.launch);
  try {
    const ctx = await browser.newContext(c.context);
    const page = await ctx.newPage();
    let requests = 0;
    await page.route('**/*', async (route) => {
      requests++;
      await route.abort();
    });
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    assert.equal(await page.getByRole('dialog').count(), 1, c.name + ' dialog');
    assert.equal(await page.locator('input').count(), 0, c.name + ' no password inputs');
    assert.equal(await page.getByRole('heading', { name: 'Password setup is temporarily unavailable' }).count(), 1);
    assert.match(await page.getByRole('dialog').innerText(), /No password has been changed/);
    assert.equal(await page.getByRole('link', { name: 'Open Account Settings' }).getAttribute('href'), '/account/settings');
    assert.equal(await page.getByRole('link', { name: 'Contact Soullab support' }).getAttribute('href'), 'mailto:support@soullab.life');
    assert.equal(requests, 0, c.name + ' external requests');
    await ctx.close();
    console.log('PASS C0 ' + c.name + ': refusal dialog, no password collection, support links, no requests');
  } finally {
    await browser.close();
  }
}
console.log('C0_BROWSER_UI_WITNESS_PASS 2/2');
