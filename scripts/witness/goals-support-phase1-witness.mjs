/**
 * GOALS SUPPORT · PHASE 1 — wiring witness.
 *
 * Proves the seam, not the warmth: that a member act mints an occasion, that
 * changing a grant does not, and that a refusal from the inference seam becomes
 * SILENCE rather than an error the member has to see.
 *
 * ⚠️ INSTRUMENT NOTE, recorded because this script produced a false reading
 * before a true one. `waitForResponse` registered before clicking "met" caught
 * the still-in-flight PATCH from the PREVIOUS click (the grant change) and its
 * body was printed under the "MET" label — an occasion of null, reported as a
 * defect that did not exist. Wait for the effect of the previous act to be
 * VISIBLE before registering a waiter for the next one, and match on the
 * request body rather than the URL alone.
 */
import { chromium } from 'playwright';
const M = '33333333-3333-4333-8333-333333333333';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await b.newContext({ viewport: { width: 1500, height: 950 } });
await ctx.addCookies([{ name: 'maia_session', value: 'witness-session-token', domain: 'localhost', path: '/' }]);
const p = await ctx.newPage();
await p.goto(`http://localhost:3000/writers-studio/canvas?m=${M}`, { waitUntil: 'networkidle', timeout: 60000 });
await p.locator('[data-destination="goals"][data-state="rest"]').waitFor({ timeout: 30000 });
await p.locator('[data-destination="goals"]').click();
const panel = p.locator('[data-panel-role="goals"]');
await panel.waitFor({ timeout: 20000 });

const show = (label, body) => {
  const j = JSON.parse(body);
  console.log(`${label}`);
  console.log(`   occasion     : ${j.occasion ? JSON.stringify(j.occasion.kind) + ' / ' + JSON.stringify(j.occasion.authority) : 'null'}`);
  console.log(`   encouragement: ${j.encouragement === null ? 'null (silence)' : JSON.stringify(j.encouragement)}`);
};

// 1 · DECLARE with a quiet grant → no occasion at all
let r = p.waitForResponse((x) => x.url().endsWith('/goals') && x.request().method() === 'POST', { timeout: 20000 });
await panel.locator('textarea').fill('Finish the Torus chapter');
await panel.getByText('declare it').click();
show('DECLARE · standing grant = track_only', await (await r).text());
await panel.locator('li').first().waitFor({ timeout: 20000 });

// 2 · invite encouragement on that goal, then mark it met
const row = panel.locator('li').first();
await row.locator('[data-goal-support-choice="encourage"]').click();
await p.waitForTimeout(1500);
const row2 = p.locator('[data-panel-role="goals"] li [data-goal-support="encourage"]').first();
await row2.waitFor({ timeout: 20000 });
r = p.waitForResponse((x) => /\/goals\/[0-9a-f-]{36}$/.test(x.url()) && x.request().method() === 'PATCH', { timeout: 20000 });
await p.locator('[data-panel-role="goals"] li').first().getByText('met', { exact: true }).click();
show('MET · standing grant = encourage', await (await r).text());

await b.close();
