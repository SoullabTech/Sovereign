/**
 * WRITER'S STUDIO JOURNEY — WJ-1
 *
 * Drives the real built app (real browser, real database) with FICTIONAL writers on a THROWAWAY stack.
 * It is a regression instrument for the writer's core path; it is NOT the retired 56-step journey and is not
 * comparable to its result. Scope and limits: see README.md.
 *
 * Defeat modes (WJ_DEFEAT) exist so the journey can be proven to FAIL when the product is broken:
 *   no_roster       Alice is removed from the beta roster            -> the studio must NOT open (S02 fails)
 *   bad_password    Alice signs in with a wrong password              -> sign-in must fail (S01 fails)
 *   block_autosave  the draft-save request is blocked in the browser  -> "Saved" must never appear (S06 fails)
 */
import { test, expect, type Page, type APIRequestContext } from '@playwright/test';

const DEFEAT = process.env.WJ_DEFEAT || 'none';
const ALICE = { username: 'journey_alice', password: 'journey-alice-pass-1' };
const BOB = { username: 'journey_bob', password: 'journey-bob-pass-1' };
const CAROL = { username: 'journey_carol', password: 'journey-carol-pass-1' };

const PROSE = 'The orchard behind the old house was made entirely of glass. Every morning the light came through the trees and the whole garden rang softly.';
const PASTED = `# The Salt Road

The caravan left before dawn, lanterns swaying against the cold. Marta counted the camels twice and found the same number both times, which comforted her more than it should have.

# The Lantern Keeper

At the third well an old woman sold oil in small clay jars. She would not say where the oil came from, only that it burned longer in the dark than it had any right to.

# The Long Dry

By the sixth day the salt had worked into everything. They spoke less. They shared the water in silence and watched the horizon for a color that was not white.`;

const pageErrors: string[] = [];
let aliceWorkId = '';
let importedWorkId = '';

async function signIn(request: APIRequestContext, who: { username: string; password: string }) {
  const r = await request.post('/api/members/signin', { data: who });
  return r;
}
// Reads go through the BROWSER page (same-origin fetch), exactly as the app does: the session cookie is Secure, and
// Playwright's own request client does not send Secure cookies over plain http.
async function apiGet(page: Page, path: string): Promise<{ status: number; text: string }> {
  return page.evaluate(async (p) => { const r = await fetch(p, { credentials: 'same-origin' }); return { status: r.status, text: await r.text() }; }, path);
}
function watch(page: Page) { page.on('pageerror', e => pageErrors.push(String(e.message || e))); }

test.describe.configure({ mode: 'serial' });

test.describe(`Writer's Studio journey WJ-1 [defeat=${DEFEAT}]`, () => {
  test('S01–S09 Alice: sign in, begin a Work, write, save, return, import by paste', async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({ baseURL });
    const page = await ctx.newPage(); watch(page);

    await test.step('S01 Alice signs in with her password', async () => {
      const pw = DEFEAT === 'bad_password' ? 'wrong-password' : ALICE.password;
      const r = await signIn(ctx.request, { username: ALICE.username, password: pw });
      expect(r.status(), 'sign-in status').toBe(200);
      expect((await r.json()).success).toBe(true);
    });

    await test.step('S02 the studio opens for a rostered writer and offers a first beginning', async () => {
      await page.goto('/writers-studio');
      await expect(page.getByText('What are you beginning?')).toBeVisible({ timeout: 30_000 });
      await expect(page).toHaveURL(/\/writers-studio/);
    });

    await test.step('S03 Alice names and begins a new Work', async () => {
      await page.getByRole('button', { name: 'Start writing' }).first().click();
      await page.getByRole('textbox').first().fill('The Glass Orchard');
      await page.getByRole('button', { name: 'Start writing' }).last().click();
      await page.waitForURL(/mode=write&m=[0-9a-f-]{36}/, { timeout: 30_000 });
      aliceWorkId = new URL(page.url()).searchParams.get('m') || '';
      expect(aliceWorkId).toMatch(/^[0-9a-f-]{36}$/);
    });

    await test.step('S04 the Work opens in Write under its own name', async () => {
      await expect(page.getByText('The Glass Orchard').first()).toBeVisible();
      await expect(page.getByText('Section 1').first()).toBeVisible();
    });

    if (DEFEAT === 'block_autosave') {
      await page.route('**/api/sovereign/manuscripts/*/draft*', route => route.abort());
    }

    await test.step('S05 Alice writes in her own words', async () => {
      await page.getByText('Just start writing').click();
      // KD-1 (see the known-defect test below): typing in the first ~100 ms after this click can move the first
      // character to the end of the text. A person pauses; this baseline does too, so the journey measures the rest.
      await page.waitForTimeout(1500);
      await page.keyboard.type(PROSE, { delay: 40 });
      await expect(page.getByText(/25 words/)).toBeVisible();
    });

    await test.step('S06 autosave completes: the server holds her words and the page reads Saved', async () => {
      // "Saved" is already on screen BEFORE she types, so it proves nothing alone. The server's copy is the evidence.
      await expect.poll(async () => (await apiGet(page, `/api/sovereign/manuscripts/${aliceWorkId}/draft`)).text.includes('The orchard behind the old house'),
        { timeout: 30_000, message: 'the draft never reached the server' }).toBe(true);
      await expect(page.getByText('Saved', { exact: true })).toBeVisible({ timeout: 20_000 });
    });

    await test.step('S07 the server holds exactly what she wrote (independent of the screen)', async () => {
      const r = await apiGet(page, `/api/sovereign/manuscripts/${aliceWorkId}/draft`);
      expect(r.status).toBe(200);
      expect(r.text).toContain('The orchard behind the old house was made entirely of glass.');
    });

    await test.step('S08 reload: her words are still there, still Saved', async () => {
      await page.reload();
      await expect(page.getByText('Every morning the light came through the trees')).toBeVisible({ timeout: 30_000 });
      await expect(page.getByText('Saved', { exact: true })).toBeVisible({ timeout: 20_000 });
    });

    await test.step('S09 a brand-new session signs in again and finds her place', async () => {
      const ctx2 = await browser.newContext({ baseURL });
      const page2 = await ctx2.newPage(); watch(page2);
      const r = await signIn(ctx2.request, { username: ALICE.username, password: ALICE.password });
      expect(r.status()).toBe(200);
      await page2.goto('/writers-studio');
      await expect(page2.getByText('Welcome back to The Glass Orchard.')).toBeVisible({ timeout: 30_000 });
      await expect(page2.getByRole('button', { name: 'Return to this work' })).toBeVisible();
      await page2.getByRole('button', { name: 'Return to this work' }).click();
      await expect(page2.getByText('Every morning the light came through the trees')).toBeVisible({ timeout: 30_000 });
      await ctx2.close();
    });

    await test.step('S10 Alice imports a manuscript by pasting it (original-file import is held on this image)', async () => {
      await page.goto('/writers-studio');
      await page.getByRole('button', { name: 'Import writing' }).click();
      await expect(page.getByText('Original-file import is held on this Writer image.').first()).toBeVisible();
      await page.getByPlaceholder('Title of the Work').fill('Salt and Lanterns');
      await page.getByPlaceholder('Paste your manuscript here…').fill(PASTED);
      await page.getByRole('button', { name: 'Review structure' }).click();
      await expect(page.getByText('3 proposed sections')).toBeVisible({ timeout: 30_000 });
    });

    await test.step('S11 she confirms the proposed structure and the Work opens in Write', async () => {
      await page.getByRole('button', { name: 'Create Work and open in Write' }).click();
      await page.waitForURL(/mode=write&m=[0-9a-f-]{36}/, { timeout: 30_000 });
      importedWorkId = new URL(page.url()).searchParams.get('m') || '';
      expect(importedWorkId).not.toBe(aliceWorkId);
      await expect(page.getByText('The caravan left before dawn')).toBeVisible({ timeout: 30_000 });
    });

    await test.step('S12 the imported Work keeps all three sections and the original words', async () => {
      const r = await apiGet(page, `/api/sovereign/manuscripts/${importedWorkId}/draft`);
      expect(r.status).toBe(200);
      const body = r.text;
      expect(body).toContain('The caravan left before dawn');
      expect(body).toContain('At the third well an old woman sold oil');
      expect(body).toContain('By the sixth day the salt had worked into everything');
    });

    await ctx.close();
  });

  test('S13–S18 boundaries: other writers and visitors cannot reach Alice’s words', async ({ browser, baseURL }) => {
    await test.step('S13 an unauthenticated visitor is sent to sign in, and the API says 401', async () => {
      const ctx = await browser.newContext({ baseURL }); const page = await ctx.newPage();
      await page.goto('/writers-studio');
      await expect(page).toHaveURL(/\/signin/);
      const r = await apiGet(page, `/api/sovereign/manuscripts/${aliceWorkId}/draft`);
      expect(r.status).toBe(401);
      await ctx.close();
    });

    await test.step('S14 Carol (not on the beta roster) signs in but is refused the studio', async () => {
      const ctx = await browser.newContext({ baseURL }); const page = await ctx.newPage();
      expect((await signIn(ctx.request, CAROL)).status()).toBe(200);
      await page.goto('/writers-studio');
      await expect(page).toHaveURL(/invitation-required/);
      const r = await apiGet(page, `/api/sovereign/manuscripts/${aliceWorkId}/draft`);
      expect([401, 403, 404], 'a non-roster member must not read Alice’s draft').toContain(r.status);
      expect(r.text).not.toContain('orchard behind the old house');
      await ctx.close();
    });

    await test.step('S14b Carol is refused the Writer corridor’s own API (invitation-only), not just the page', async () => {
      // Ordinary Living Work creation is open to any signed-in member BY DESIGN (lib/writersStudio/restrictedCorridor.ts);
      // the invitation corridor covers the studio pages, /api/writers-studio/*, and the advanced manuscript routes.
      const ctx = await browser.newContext({ baseURL }); const page = await ctx.newPage();
      expect((await signIn(ctx.request, CAROL)).status()).toBe(200);
      await page.goto('/writers-studio');
      const w = await page.evaluate(async () => {
        const r = await fetch('/api/sovereign/manuscripts/blank', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
        return { status: r.status, text: await r.text() };
      });
      expect(w.status, `status ${w.status}: ${w.text.slice(0, 120)}`).toBe(403);
      expect(w.text).toContain('WRITER_STUDIO_INVITATION_REQUIRED');
      await ctx.close();
    });

    await test.step('S15 Bob (rostered) reaches his own studio', async () => {
      const ctx = await browser.newContext({ baseURL }); const page = await ctx.newPage(); watch(page);
      expect((await signIn(ctx.request, BOB)).status()).toBe(200);
      await page.goto('/writers-studio');
      await expect(page.getByText('What are you beginning?')).toBeVisible({ timeout: 30_000 });

      await test.step('S16 Bob cannot read Alice’s draft by id (API)', async () => {
        for (const id of [aliceWorkId, importedWorkId]) {
          const r = await apiGet(page, `/api/sovereign/manuscripts/${id}/draft`);
          expect([401, 403, 404], `status for ${id}`).toContain(r.status);
          expect(r.text).not.toContain('orchard behind the old house');
          expect(r.text).not.toContain('caravan left before dawn');
        }
      });

      await test.step('S17 Bob opening Alice’s Work URL does not show her words', async () => {
        await page.goto(`/writers-studio?mode=write&m=${aliceWorkId}`);
        await page.waitForTimeout(4000);
        expect(await page.locator('body').innerText()).not.toContain('orchard behind the old house');
      });

      await test.step('S18 Bob’s Home does not mention Alice’s Works', async () => {
        await page.goto('/writers-studio');
        await page.waitForTimeout(2500);
        const text = await page.locator('body').innerText();
        expect(text).not.toContain('The Glass Orchard');
        expect(text).not.toContain('Salt and Lanterns');
      });
      await ctx.close();
    });
  });

  // KNOWN DEFECT KD-1 — reported 2026-10-30. EXPECTED TO FAIL until fixed (Playwright test.fail()):
  // `focusRealEditor` (app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx) puts the caret at the START of the editor two
  // animation frames after "Just start writing" is clicked, even if the writer has already typed. Typing straight away then
  // saves e.g. "he orchard … softly.T". When the defect is fixed this test will PASS, Playwright will report it as an
  // unexpected pass, and the annotation must be removed so it becomes a normal regression test.
  test('KD-1 typing straight after "Just start writing" keeps the first words in order [KNOWN DEFECT, expected to fail]', async ({ browser, baseURL }) => {
    test.fail(true, 'KD-1: caret is reset to the start of the editor after the first keystroke');
    const ctx = await browser.newContext({ baseURL }); const page = await ctx.newPage();
    expect((await signIn(ctx.request, BOB)).status()).toBe(200);
    await page.goto('/writers-studio'); await page.waitForTimeout(2000);
    const made = await page.evaluate(async () => {
      const a = await fetch('/api/sovereign/living-works', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title: 'KD-1 witness' }) });
      const w = await a.json(); const wid = w.id || w.work?.id || w.livingWork?.id;
      const b = await fetch(`/api/sovereign/living-works/${wid}/start-writing`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
      return await b.text();
    });
    const m = /"manuscriptId":"([0-9a-f-]{36})"/.exec(made)?.[1] || /"id":"([0-9a-f-]{36})"/.exec(made)?.[1] || '';
    expect(m).not.toBe('');
    await page.goto(`/writers-studio?mode=write&m=${m}`); await page.waitForTimeout(2500);
    await page.getByText('Just start writing').click();
    const TEXT = 'The orchard was made of glass. Every morning the light came through the trees.';
    await page.keyboard.type(TEXT, { delay: 80 });
    await page.waitForTimeout(6000);
    const saved = await apiGet(page, `/api/sovereign/manuscripts/${m}/draft`);
    expect(JSON.parse(saved.text).content).toBe(TEXT);
    await ctx.close();
  });

  test('S19 no uncaught page errors during the whole journey', async () => {
    expect(pageErrors, `uncaught page errors:\n${pageErrors.join('\n')}`).toEqual([]);
  });
});
