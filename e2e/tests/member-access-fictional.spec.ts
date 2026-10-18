/**
 * CLASS A UI witness: real Playwright browser, fictional identity/data.
 *
 * Never calls production. Member directory, admin auth and issuance are mocked
 * at the network boundary. Redemption POST is also intercepted. Browser still
 * executes actual Next/React screens and interactions.
 */
import { test, expect, type Page, type Route } from '@playwright/test';

const MEMBER_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const OTHER_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const TOKEN = 'a'.repeat(64);
const LINK = 'https://soullab.life/member-recovery#token=' + TOKEN;
const MEMBER = {
  id: MEMBER_ID, name: 'Fictional Member One',
  username: 'fixture_one', email: 'one@example.invalid', admin_role: null,
};
const OTHER = {
  id: OTHER_ID, name: 'Fictional Member Two',
  username: 'fixture_two', email: 'two@example.invalid', admin_role: null,
};

type Capture = { pathname: string; request: Record<string, unknown>; sharedPasswordHeader: string | null };
type Harness = { issued: Capture[]; redeemed: Capture[] };

async function setMock(route: Route, status: number, data: unknown) {
  await route.fulfill({
    status, contentType: 'application/json; charset=utf-8',
    headers: { 'cache-control': 'no-store' },
    body: JSON.stringify(data),
  });
}

async function fictional(page: Page, options: { founder?: boolean; issueFailure?: boolean; delayMs?: number } = {}): Promise<Harness> {
  const capture: Harness = { issued: [], redeemed: [] };
  // Any attempts to load external domains are refused rather than contacting
  // the user's live platform or third-party services. Next assets stay local.
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
      await route.abort('blockedbyclient'); return;
    }
    await route.continue();
  });
  await page.addInitScript(() => {
    window.localStorage.setItem('maia_session_token', 'fictional-founder-session');
    // The old admin console may retain this credential, but Member Access
    // must NEVER attach it to its own sensitive requests.
    window.localStorage.setItem('soullab_admin_secret', 'FICTIONAL_LEGACY_BROWSER_SHARED_PASSWORD');
  });
  // Specific routes registered after general blocker so Playwright prioritizes
  // them over catch-all.
  await page.route('**/api/admin/auth', route =>
    setMock(route, 200, { isAdmin: true, via: 'member', role: 'founder' }));
  await page.route('**/api/admin/members', route => {
    if (route.request().headers()['x-admin-password']) {
      return setMock(route, 403, { error: 'Shared password must not be forwarded by Member Access' });
    }
    return setMock(route, 200, { members: [MEMBER, OTHER], viewerRole: 'founder' });
  });
  await page.route('**/api/admin/members/recovery', async route => {
    const payload = route.request().postDataJSON() as Record<string, unknown>;
    capture.issued.push({
      pathname: new URL(route.request().url()).pathname,
      request: payload,
      sharedPasswordHeader: route.request().headers()['x-admin-password'] ?? null,
    });
    if (options.delayMs) await new Promise<void>(resolve => setTimeout(resolve, options.delayMs));
    if (options.issueFailure || !options.founder) {
      await setMock(route, 403, { error: 'A verified founder member session is required' });
      return;
    }
    if (payload.method === 'email') {
      await setMock(route, 200, { success: true, method: 'email', delivery: 'provider_accepted', expiresInMinutes: 30 });
      return;
    }
    await setMock(route, 200, { success: true, method: 'private_handoff', recoveryLink: LINK, expiresInMinutes: 10 });
  });
  await page.route('**/api/members/admin-recovery', async route => {
    const payload = route.request().postDataJSON() as Record<string, unknown>;
    capture.redeemed.push({ pathname: new URL(route.request().url()).pathname, request: payload });
    await setMock(route, 200, { success: true, message: 'Password updated. Please sign in again.' });
  });
  return capture;
}

test.describe('Admin Member Access — fictional member workflow', () => {
  test('selects the right member, requires confirmation, and reports email acceptance without a link', async ({ page }) => {
    const h = await fictional(page, { founder: true });
    await page.goto('/admin/member-access');
    await expect(page.getByRole('heading', { name: 'Member Access' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Fictional Member One/ })).toBeVisible();
    await page.getByRole('textbox', { name: 'Search member name or email' }).fill('two@example.invalid');
    await expect(page.getByRole('button', { name: /Fictional Member One/ })).toHaveCount(0);
    await page.getByRole('button', { name: /Fictional Member Two/ }).click();
    const submit = page.getByRole('button', { name: 'Initiate recovery' });
    await expect(submit).toBeDisabled();
    await page.getByRole('checkbox', { name: /correct member and the request is authorized/ }).check();
    await submit.click();
    await expect(page.getByRole('status')).toContainText('provider accepted');
    await expect(page.getByText('One-time private link')).toHaveCount(0);
    expect(h.issued).toHaveLength(1);
    expect(h.issued[0].sharedPasswordHeader).toBeNull();
    expect(h.issued[0].request).toMatchObject({
      memberId: OTHER_ID, method: 'email', reason: 'member_requested',
    });
    expect(JSON.stringify(h.issued[0].request)).not.toContain('password');
  });

  test('private handoff requires separate identity check, shows link once and clears it after copy', async ({ page }) => {
    const h = await fictional(page, { founder: true });
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: async (value: string) => { (window as any).__fictionalCopied = value; } },
      });
    });
    await page.goto('/admin/member-access');
    await page.getByRole('button', { name: /Fictional Member One/ }).click();
    await page.getByRole('radio', { name: /Verified private handoff/ }).check();
    const button = page.getByRole('button', { name: 'Initiate recovery' });
    await page.getByRole('checkbox', { name: /correct member and the request is authorized/ }).check();
    await expect(button).toBeDisabled();
    await page.getByRole('checkbox', { name: /verified this member's identity independently/ }).check();
    await expect(button).toBeEnabled();
    await button.click();
    await expect(page.getByText(LINK)).toBeVisible();
    await page.getByRole('button', { name: 'Copy once' }).click();
    await expect(page.getByText(LINK)).toHaveCount(0);
    expect(await page.evaluate(() => (window as any).__fictionalCopied)).toBe(LINK);
    expect(h.issued).toHaveLength(1);
    expect(h.issued[0].request).toMatchObject({
      memberId: MEMBER_ID, method: 'private_handoff',
      identityVerified: true, reason: 'email_unavailable',
    });
  });

  test('server refusal is surfaced; no recovery link appears to password-only administrator', async ({ page }) => {
    const h = await fictional(page, { founder: false });
    await page.goto('/admin/member-access');
    await page.getByRole('button', { name: /Fictional Member One/ }).click();
    await page.getByRole('checkbox', { name: /correct member and the request is authorized/ }).check();
    await page.getByRole('button', { name: 'Initiate recovery' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'founder member account' })).toContainText('founder member account');
    await expect(page.getByText('One-time private link')).toHaveCount(0);
    expect(h.issued).toHaveLength(1);
  });

  test('holds the chosen target while a private recovery request is in flight', async ({ page }) => {
    const h = await fictional(page, { founder: true, delayMs: 900 });
    await page.goto('/admin/member-access');
    await page.getByRole('button', { name: /Fictional Member One/ }).click();
    await page.getByRole('radio', { name: /Verified private handoff/ }).check();
    await page.getByRole('checkbox', { name: /correct member and the request is authorized/ }).check();
    await page.getByRole('checkbox', { name: /verified this member's identity independently/ }).check();
    await page.getByRole('button', { name: 'Initiate recovery' }).click();
    await expect(page.getByRole('button', { name: /Fictional Member Two/ })).toBeDisabled();
    await expect(page.getByText(LINK)).toBeVisible();
    expect(h.issued[0].request.memberId).toBe(MEMBER_ID);
    await expect(page.getByText('Recovery for Fictional Member One')).toBeVisible();
  });

  test('switching target clears earlier confirmation and any private link', async ({ page }) => {
    await fictional(page, { founder: true });
    await page.goto('/admin/member-access');
    await page.getByRole('button', { name: /Fictional Member One/ }).click();
    await page.getByRole('radio', { name: /Verified private handoff/ }).check();
    await page.getByRole('checkbox', { name: /correct member and the request is authorized/ }).check();
    await page.getByRole('checkbox', { name: /verified this member's identity independently/ }).check();
    await page.getByRole('button', { name: 'Initiate recovery' }).click();
    await expect(page.getByText(LINK)).toBeVisible();
    await page.getByRole('button', { name: /Fictional Member Two/ }).click();
    await expect(page.getByText(LINK)).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Initiate recovery' })).toBeDisabled();
  });
});

test.describe('Member-facing recovery — fictional bearer only', () => {
  test('removes the token fragment and submits member-chosen password to the correct route', async ({ page }) => {
    const h = await fictional(page, { founder: true });
    await page.goto('/member-recovery#token=' + TOKEN);
    await expect(page.getByRole('heading', { name: 'Recover your Soullab access' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Set my new password' })).toBeVisible();
    await expect.poll(() => page.url()).not.toContain('#token=');
    await page.getByLabel('New password').fill('fictional-long-password');
    await page.getByLabel('Confirm password').fill('fictional-long-password');
    await page.getByRole('button', { name: 'Set my new password' }).click();
    await expect(page.getByRole('status')).toContainText('Password updated');
    expect(h.redeemed).toHaveLength(1);
    expect(h.redeemed[0].request).toMatchObject({ token: TOKEN, newPassword: 'fictional-long-password' });
    expect(page.url()).not.toContain(TOKEN);
  });

  test('invalid fragment refuses member password form', async ({ page }) => {
    const h = await fictional(page, { founder: true });
    await page.goto('/member-recovery#token=not-a-real-bearer');
    await expect(page.getByRole('alert').filter({ hasText: 'missing, invalid, used or expired' })).toContainText('missing, invalid, used or expired');
    await expect(page.getByRole('button', { name: 'Set my new password' })).toHaveCount(0);
    expect(h.redeemed).toHaveLength(0);
  });

  test('mismatched passwords never hit the recovery API', async ({ page }) => {
    const h = await fictional(page, { founder: true });
    await page.goto('/member-recovery#token=' + TOKEN);
    await page.getByLabel('New password').fill('fictional-long-password');
    await page.getByLabel('Confirm password').fill('fictional-other-password');
    await page.getByRole('button', { name: 'Set my new password' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Passwords do not match' })).toContainText('Passwords do not match');
    expect(h.redeemed).toHaveLength(0);
  });
});
