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
const MEMBER = {
  id: MEMBER_ID, name: 'Fictional Member One',
  username: 'fixture_one', email: 'one@example.invalid', admin_role: null, recovery_email_verified: true,
};
const OTHER = {
  id: OTHER_ID, name: 'Fictional Member Two',
  username: 'fixture_two', email: 'two@example.invalid', admin_role: null, recovery_email_verified: true,
};
const UNVERIFIED = {
  id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', name: 'Fictional Unverified Member',
  username: 'fixture_unverified', email: 'unverified@example.invalid',
  admin_role: null, recovery_email_verified: false,
};

type Capture = { pathname: string; request: Record<string, unknown>; sharedPasswordHeader?: string | null };
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
  // Real Next.js proxy/role middleware verifies this against a separate
  // ephemeral PostgreSQL fixture BEFORE serving the Admin page. This cookie
  // alone is NOT accepted without the matching database session.
  await page.context().addCookies([{
    name: 'maia_session',
    value: 'fictional-founder-session',
    url: 'http://localhost:3000',
    httpOnly: true,
    sameSite: 'Lax',
  }]);
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
    return setMock(route, 200, { members: [MEMBER, OTHER, UNVERIFIED], viewerRole: 'founder' });
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
    await setMock(route, 403, { error: 'Private handoff is unavailable during the initial beta' });
  });
  await page.route('**/api/members/admin-recovery', async route => {
    const payload = route.request().postDataJSON() as Record<string, unknown>;
    capture.redeemed.push({ pathname: new URL(route.request().url()).pathname, request: payload });
    await setMock(route, 200, { success: true, message: 'Password updated. Please sign in again.' });
  });
  return capture;
}

test.describe('scanner-safe email verification, signed out (fictional)', () => {
  test('fragment-only link is removed and NEVER consumed without a human click', async ({ page }) => {
    const token = '3'.repeat(64);
    let calls = 0;
    await page.route('**/api/members/verify-email', async route => {
      calls++;
      expect(route.request().method()).toBe('POST');
      expect(route.request().postDataJSON()).toEqual({ token });
      await setMock(route, 200, { success: true, message: 'Email verified successfully' });
    });
    await page.goto('/verify-email#token=' + token);
    await expect(page.getByRole('heading', { name: 'Verify your Soullab email' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Verify email' })).toBeVisible();
    await expect.poll(() => page.url()).not.toContain('#token=');
    expect(calls).toBe(0); // preview/prefetch/URL arrival does not consume
    await page.getByRole('button', { name: 'Verify email' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Your email has been verified' })).toBeVisible();
    expect(calls).toBe(1);
    await expect(page.getByRole('button', { name: 'Verify email' })).toHaveCount(0);
  });

  test('legacy query token is accepted but not automatically redeemed', async ({ page }) => {
    let calls = 0;
    await page.route('**/api/members/verify-email', async route => {
      calls++;
      await setMock(route, 200, { success: true });
    });
    await page.goto('/verify-email?token=' + '4'.repeat(64));
    await expect(page.getByRole('button', { name: 'Verify email' })).toBeVisible();
    await expect.poll(() => page.url()).not.toContain('?token=');
    expect(calls).toBe(0);
    await page.getByRole('button', { name: 'Verify email' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Your email has been verified' })).toBeVisible();
    expect(calls).toBe(1);
  });

  test('missing or malformed token cannot call the verification API', async ({ page }) => {
    let calls = 0;
    await page.route('**/api/members/verify-email', async route => {
      calls++;
      await setMock(route, 500, { error: 'Unexpected verification call' });
    });
    await page.goto('/verify-email#token=not-a-real-token');
    await expect(page.getByRole('alert').filter({ hasText: 'verification link is missing' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Verify email' })).toHaveCount(0);
    expect(calls).toBe(0);
  });

  test('old direct GET API link redirects to click-confirm page instead of using token', async ({ request }) => {
    const token = '5'.repeat(64);
    const res = await request.get('/api/members/verify-email?token=' + token, { maxRedirects: 0 });
    expect(res.status()).toBe(307);
    const location = res.headers()['location'] || '';
    expect(location).toContain('/verify-email#token=' + token);
    expect(location).not.toContain('?token=');
  });
});

test.describe('real strict access policy — default-OFF recovery', () => {
  test('signed-out member may load the recovery form, never the admin operations page', async ({ page }) => {
    // Not mocked: the strict Next proxy admits the recipient's exact route.
    await page.goto('/member-recovery#token=' + TOKEN);
    await expect(page.getByRole('heading', { name: 'Recover your Soullab access' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Set my new password' })).toBeVisible();
    expect(page.url()).not.toContain('#token=');
  });

  test('anonymous bearer redemption reaches the correct handler but stays disabled by default', async ({ request }) => {
    const response = await request.post('/api/members/admin-recovery', {
      data: { token: TOKEN, newPassword: 'fictional-long-password' },
      headers: { Origin: 'http://localhost:3000' },
    });
    // 503 comes from the route's disabled-by-default guard. A 401 would
    // indicate the strict access matrix wrongly requires a member session.
    expect(response.status()).toBe(503);
    expect(await response.json()).toMatchObject({ error: 'Member Access recovery has not been enabled' });
  });

  test('actual owner-gated member directory requires validated admin session', async ({ page }) => {
    const endpoint = '/api/admin/members';
    const denied = await page.request.get(endpoint);
    expect(denied.status()).toBe(401);

    // A cookie alone is not the grant. Its value resolves to an ephemeral
    // CI auth_sessions row with a database-backed founder admin_role.
    await page.context().addCookies([{
      name: 'maia_session',
      value: 'fictional-founder-session',
      url: 'http://localhost:3000',
      httpOnly: true,
      sameSite: 'Lax',
    }]);
    const allowed = await page.request.get(endpoint);
    expect(allowed.status()).toBe(200);
    const body = await allowed.json();
    expect(body.viewerRole).toBe('founder');
    expect(body.members).toEqual(expect.arrayContaining([
      expect.objectContaining({
        username: 'fixture_founder',
        email: 'founder@example.invalid',
      }),
    ]));
  });

  test('anonymous recovery issuance is stopped by the strict admin proxy', async ({ request }) => {
    const response = await request.post('/api/admin/members/recovery', {
      data: { memberId: MEMBER_ID, method: 'email', reason: 'member_requested' },
      headers: { Origin: 'http://localhost:3000' },
    });
    expect(response.status()).toBe(401);
  });
});

test.describe('actual server-side Admin page gate — fictional database', () => {
  test('redirects a browser without a verified server session to sign-in', async ({ page }) => {
    // This request is NOT mocked: the real Next.js proxy decides whether
    // the Admin page can render, using its ephemeral fixture DB.
    await page.goto('/admin/member-access');
    await expect(page).toHaveURL(/\/signin\?/);
  });

  test('rejects a forged cookie with no matching session row', async ({ page }) => {
    await page.context().addCookies([{
      name: 'maia_session',
      value: 'fictional-forged-session-token',
      url: 'http://localhost:3000',
      httpOnly: true,
      sameSite: 'Lax',
    }]);
    await page.goto('/admin/member-access');
    await expect(page).toHaveURL(/\/signin\?/);
  });
});

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

  test('blocks unverified current-email accounts before recovery API calls', async ({ page }) => {
    const h = await fictional(page, { founder: true });
    await page.goto('/admin/member-access');
    await page.getByRole('textbox', { name: 'Search member name or email' }).fill('unverified@example.invalid');
    await page.getByRole('button', { name: /Fictional Unverified Member/ }).click();
    await expect(page.getByRole('alert').filter({ hasText: 're-verifies their current email' })).toBeVisible();
    await page.getByRole('checkbox', { name: /correct member and the request is authorized/ }).check();
    await expect(page.getByRole('button', { name: 'Initiate recovery' })).toBeDisabled();
    expect(h.issued).toHaveLength(0);
  });

  test('initial beta has no private handoff or copyable recovery link', async ({ page }) => {
    const h = await fictional(page, { founder: true });
    await page.goto('/admin/member-access');
    await page.getByRole('button', { name: /Fictional Member One/ }).click();
    await expect(page.getByLabel('Email-only recovery')).toBeVisible();
    await expect(page.getByText(/Private handoff is unavailable until separately reviewed/)).toBeVisible();
    await expect(page.getByRole('radio', { name: /Verified private handoff/ })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Copy once' })).toHaveCount(0);
    const button = page.getByRole('button', { name: 'Initiate recovery' });
    await expect(button).toBeDisabled();
    await page.getByRole('checkbox', { name: /correct member and the request is authorized/ }).check();
    await button.click();
    await expect(page.getByRole('status')).toContainText('email provider accepted');
    expect(h.issued).toHaveLength(1);
    expect(h.issued[0].request).toMatchObject({ memberId: MEMBER_ID, method: 'email', reason: 'member_requested' });
    expect(h.issued[0].request).not.toHaveProperty('identityVerified');
    expect(JSON.stringify(h.issued[0])).not.toContain('#token=');
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

  test('locks the selected member while an email issuance is in flight', async ({ page }) => {
    const h = await fictional(page, { founder: true, delayMs: 900 });
    await page.goto('/admin/member-access');
    await page.getByRole('button', { name: /Fictional Member One/ }).click();
    await page.getByRole('checkbox', { name: /correct member and the request is authorized/ }).check();
    await page.getByRole('button', { name: 'Initiate recovery' }).click();
    await expect(page.getByRole('button', { name: /Fictional Member Two/ })).toBeDisabled();
    await expect(page.getByRole('status')).toContainText('email provider accepted');
    expect(h.issued[0].request.memberId).toBe(MEMBER_ID);
    await expect(page.getByText('Recovery for Fictional Member One')).toBeVisible();
  });

  test('switching member after email issuance clears earlier confirmation and status', async ({ page }) => {
    const h = await fictional(page, { founder: true });
    await page.goto('/admin/member-access');
    await page.getByRole('button', { name: /Fictional Member One/ }).click();
    await page.getByRole('checkbox', { name: /correct member and the request is authorized/ }).check();
    await page.getByRole('button', { name: 'Initiate recovery' }).click();
    await expect(page.getByRole('status')).toContainText('email provider accepted');
    await page.getByRole('button', { name: /Fictional Member Two/ }).click();
    await expect(page.getByRole('status')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Initiate recovery' })).toBeDisabled();
    expect(h.issued).toHaveLength(1);
    expect(h.issued[0].request.memberId).toBe(MEMBER_ID);
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
