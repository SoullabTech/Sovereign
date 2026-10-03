import { chromium } from 'playwright';
import pg from 'pg';
import { randomUUID } from 'node:crypto';

const { Client } = pg;
const BASE = process.env.EA_BASE_URL || 'http://localhost:3700';
const DB = process.env.EA_DATABASE_URL || 'postgresql://soullab@localhost:5432/maia_consciousness';
const MANUSCRIPT = '19039a86-4582-47f1-a847-84820f2471b5';
const READING = '0bfa36c0-ec36-40fd-9647-7b9c3c34d64b';
const SECTION = '2ee9727e-6ca8-425c-aad7-003b3d76e332';

const db = new Client({ connectionString: DB });
let token = null;
let browser = null;

async function cleanup() {
  await browser?.close().catch(() => {});
  if (token) await db.query('DELETE FROM auth_sessions WHERE session_token=$1', [token]).catch(() => {});
  await db.end().catch(() => {});
}
async function main() {
  await db.connect();
  const member = (await db.query(
    'SELECT member_id FROM manuscript_working_drafts WHERE manuscript_id=$1 LIMIT 1',
    [MANUSCRIPT],
  )).rows[0]?.member_id;
  if (!member) throw new Error('Elemental Alchemy member not found');

  token = `ea-case-${randomUUID()}`;
  await db.query(
    "INSERT INTO auth_sessions(member_id,session_token,expires_at) VALUES($1,$2,NOW()+INTERVAL '30 minutes')",
    [member, token],
  );

  browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1200 } });
  await ctx.addCookies([{ name: 'maia_session', value: token, domain: 'localhost', path: '/' }]);
  await ctx.addInitScript(() => localStorage.setItem('maia_settings', JSON.stringify({ sanctuary: false })));
  const page = await ctx.newPage();
  page.on('response', (response) => {
    const u = response.url();
    if (u.includes('/api/writers-studio/editorial/')) {
      console.log('[EDITORIAL HTTP]', response.request().method(), response.status(), u);
    }
  });
  const chapterStart = 'a678dfe4-5f4f-44b1-afd7-552afcb84f79';
  const url = `${BASE}/writers-studio?mode=develop&m=${MANUSCRIPT}&s=${chapterStart}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });

  const readButton = page.getByRole('button', { name: /Read this chapter/i }).first();
  const readyText = page.getByText(/Strong Structural Signposting|MAIA read the chapter/i).first();
  await Promise.race([
    readButton.waitFor({ timeout: 30_000 }).catch(() => null),
    readyText.waitFor({ timeout: 30_000 }).catch(() => null),
  ]);
  if (await readButton.isVisible().catch(() => false)) {
    console.log('EA CASE STUDY · commissioning chapter read');
    await readButton.click();
    await readyText.waitFor({ timeout: 120_000 });
  }

  const strengthen = page.getByRole('button', { name: /Show me what to strengthen/i }).first();
  await strengthen.waitFor({ timeout: 30_000 });
  await strengthen.click();
  const repetition = page.getByText(/repeated core ideas|redundant explanations|repetition of core ideas/i).first();
  await repetition.waitFor({ timeout: 120_000 });
  const article = repetition.locator('xpath=ancestor::article[1]');
  const work = article.getByRole('button', { name: /Work on this/i });
  await work.click();

  await page.getByText('What would help you here?').waitFor({ timeout: 30_000 });
  await page.waitForTimeout(750);

  console.log('EA CASE STUDY · passage-focus probe');
  console.log('url=', page.url());
  console.log('posture=', await page.evaluate(() => localStorage.getItem('maia_settings')));

  const labels = [
    'Show edit options',
    'Discuss what’s happening',
    'Show me examples',
    'Give me ideas',
    'Teach me about the writing',
    'Go deeper',
  ];
  for (const label of labels) {
    const button = page.getByRole('button', { name: label, exact: false }).first();
    if (!(await button.count())) {
      console.log(JSON.stringify({ label, missing: true }));
      continue;
    }
    const disabled = await button.isDisabled();
    const box = await button.boundingBox();
    const hit = box ? await page.evaluate(({ x, y }) => {
      const e = document.elementFromPoint(x, y);
      if (!e) return null;
      const s = getComputedStyle(e);
      return {
        tag: e.tagName,
        cls: String(e.className || ''),
        text: (e.textContent || '').trim().slice(0, 120),
        disabled: 'disabled' in e ? e.disabled : null,
        pointerEvents: s.pointerEvents,
        zIndex: s.zIndex,
      };
    }, { x: box.x + box.width / 2, y: box.y + box.height / 2 }) : null;
    console.log(JSON.stringify({ label, disabled, box, hit }));
  }

  const discuss = page.getByRole('button', { name: 'Discuss what’s happening', exact: false }).first();
  console.log('EA CASE STUDY · clicking Discuss what’s happening');
  const turnResponse = page.waitForResponse((response) =>
    response.url().includes('/api/writers-studio/editorial/turn')
      && response.request().method() === 'POST',
    { timeout: 120_000 },
  ).catch(() => null);
  await discuss.click();
  const turn = await turnResponse;
  if (turn) console.log('EA CASE STUDY · editorial turn status=', turn.status());
  await page.waitForFunction(() => {
    const el = document.querySelector('.p4r1-dance-response');
    const text = el?.textContent ?? '';
    return text.length > 0 && !text.includes('MAIA is with the passage');
  }, undefined, { timeout: 120_000 }).catch(() => {});
  await page.waitForTimeout(500);
  const responseText = await page.locator('.p4r1-dance-response').first().innerText().catch(() => '');
  const failureText = await page.locator('.p4r1-error').allInnerTexts().catch(() => []);
  console.log('EA CASE STUDY · discussion response=', responseText.slice(0, 1200));
  console.log('EA CASE STUDY · visible errors=', JSON.stringify(failureText));

  await page.screenshot({ path: '/private/tmp/ea-case-study-actions.png', fullPage: false });
}

main().then(cleanup).catch(async (err) => {
  console.error(err);
  await cleanup();
  process.exit(1);
});
