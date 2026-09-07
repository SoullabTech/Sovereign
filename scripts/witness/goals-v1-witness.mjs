import { chromium } from 'playwright';
const M = '33333333-3333-4333-8333-333333333333';
const URL = `http://localhost:3000/writers-studio/canvas?m=${M}`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await b.newContext({ viewport: { width: 1500, height: 950 } });
await ctx.addCookies([{ name: 'maia_session', value: 'witness-session-token', domain: 'localhost', path: '/' }]);
const p = await ctx.newPage();

const openGoals = async () => {
  await p.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
  await p.locator('[data-destination="goals"][data-state="rest"]').waitFor({ timeout: 30000 });
  await p.locator('[data-destination="goals"]').click();
  await p.locator('[data-panel-role="goals"]').waitFor({ timeout: 20000 });
  return p.locator('[data-panel-role="goals"]');
};

const panel = await openGoals();
console.log('— panel opens. Kind chooser:',
  JSON.stringify(await panel.locator('[data-goal-kind-choice]').allInnerTexts()));

// default kind = intention: no target field
const numFieldOnIntention = await panel.locator('input[inputmode="numeric"]').count();
console.log('CASE 2 · intention selected by default · target field present =', numFieldOnIntention > 0);

// ── CASE 2 · INTENTION ──────────────────────────────────────────────────────
await panel.locator('textarea').fill('Finish Chapter 7');
await panel.getByText('declare it').click();
await p.waitForTimeout(1800);
let row = panel.locator('li').first();
await row.waitFor({ timeout: 15000 });
console.log('CASE 2 · declared:', JSON.stringify((await row.innerText()).split('\n').filter(Boolean)));
console.log('CASE 2 · kind =', await row.getAttribute('data-goal-kind'),
            '· progress =', await row.getAttribute('data-goal-progress'),
            '· figure shown =', await row.locator('[data-goal-figure]').count());

// ── CASE 1 · MEASURABLE ─────────────────────────────────────────────────────
await panel.locator('[data-goal-kind-choice="measurable"]').click();
console.log('CASE 1 · target field appears on measurable =',
  (await panel.locator('input[inputmode="numeric"]').count()) > 0);
await panel.locator('textarea').fill('3,000 words in this manuscript');
// declare with no target: must refuse
await panel.getByText('declare it').click();
await p.waitForTimeout(900);
const refusal = await panel.locator('p').filter({ hasText: 'whole number' }).count();
console.log('CASE 1 · target required (refused empty target) =', refusal > 0);
await panel.locator('input[inputmode="numeric"]').fill('3000');
await panel.getByText('declare it').click();
await p.waitForTimeout(1800);
const measurable = panel.locator('li').filter({ hasText: '3,000 words in this manuscript' }).first();
await measurable.waitFor({ timeout: 15000 });
console.log('CASE 1/3 · row:', JSON.stringify((await measurable.innerText()).split('\n').filter(Boolean)));
console.log('CASE 1/3 · progress state =', await measurable.getAttribute('data-goal-progress'));

// ── forbidden vocabulary anywhere on the page ───────────────────────────────
const bodyText = (await p.locator('body').innerText()).toLowerCase();
const banned = ['behind', 'ahead of', 'on track', 'per day', 'words/day', 'projected', 'streak', 'you should', '% complete'];
console.log('FR-10 · forbidden language present:', banned.filter((w) => bodyText.includes(w)));
await p.screenshot({ path: '/tmp/goals-1-panel.png' });
await b.close();
