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
  const ctx = await browser.newContext({
    viewport: { width: 1600, height: 1200 },
    extraHTTPHeaders: { 'x-session-token': token },
  });
  await ctx.addCookies([{ name: 'maia_session', value: token, url: BASE }]);
  await ctx.addInitScript(() => localStorage.setItem('maia_settings', JSON.stringify({ sanctuary: false })));
  const page = await ctx.newPage();
  page.on('response', async (response) => {
    const u = response.url();
    if (u.includes('/api/writers-studio/editorial/')) {
      console.log('[EDITORIAL HTTP]', response.request().method(), response.status(), u);
    }
    if (response.request().method() !== 'GET'
      && (u.includes('/develop/preparation') || u.includes('/readings') || u.includes('/attention-map'))) {
      const body = await response.text().catch(() => '');
      console.log('[DEVELOP HTTP]', response.request().method(), response.status(), u, body.slice(0, 1600));
    }
  });
  const chapterStart = 'a678dfe4-5f4f-44b1-afd7-552afcb84f79';
  const url = `${BASE}/writers-studio?mode=develop&m=${MANUSCRIPT}&s=${chapterStart}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  /* The button is server-rendered before its React handler is attached. Wait for
     the live room to hydrate before treating a click as an authored gesture. */
  await page.waitForTimeout(1500);

  const readButton = page.getByRole('button', { name: /^Read this chapter$/i }).first();
  const checkpointRead = page.getByRole('button', { name: /Save current draft & read/i }).first();
  const readyText = page.getByText(/MAIA read the chapter/i).first();
  await Promise.race([
    readButton.waitFor({ state: 'visible', timeout: 30_000 }).catch(() => null),
    checkpointRead.waitFor({ state: 'visible', timeout: 30_000 }).catch(() => null),
    readyText.waitFor({ state: 'visible', timeout: 30_000 }).catch(() => null),
  ]);
  if (!(await readyText.isVisible().catch(() => false))) {
    if (await checkpointRead.isVisible().catch(() => false)) {
      console.log('EA CASE STUDY · checkpointing current chapter before read');
      await checkpointRead.evaluate((button) => button.click());
    } else {
      console.log('EA CASE STUDY · commissioning chapter read');
      await readButton.evaluate((button) => button.click());
      await page.waitForTimeout(1500);
      if (await checkpointRead.isVisible().catch(() => false)) {
        console.log('EA CASE STUDY · reading requires a current-draft checkpoint');
        await checkpointRead.evaluate((button) => button.click());
      }
    }
    await readyText.waitFor({ state: 'visible', timeout: 180_000 }).catch(async (error) => {
      console.log('EA CASE STUDY · chapter-read state=', (await page.locator('body').innerText()).slice(0, 5000));
      throw error;
    });
  }

  const runExpansion = async (buttonName, selector, label) => {
    const button = page.getByRole('button', { name: buttonName }).first();
    await button.waitFor({ state: 'visible', timeout: 30_000 });
    await button.evaluate((node) => node.click());
    const result = page.locator(selector);
    await result.waitFor({ state: 'visible', timeout: 180_000 }).catch(async (error) => {
      console.log(`EA CASE STUDY · ${label} state=`, (await page.locator('body').innerText()).slice(0, 7000));
      throw error;
    });
    const text = (await result.innerText()).trim();
    if (!text) throw new Error(`${label} returned an empty result`);
    console.log(`EA CASE STUDY · ${label} PASS=`, text.slice(0, 1000));
  };

  await runExpansion(/How does this chapter fit the book\?/i, '[data-chapter-book-fit]', 'book fit');
  await runExpansion(/Show me the chapter’s movement/i, '[data-chapter-movement]', 'chapter movement');
  await runExpansion(/^Chapter scorecard$/i, '[data-chapter-scorecard]', 'chapter scorecard');

  const strengthen = page.getByRole('button', { name: /Show me what to strengthen/i }).first();
  await strengthen.waitFor({ timeout: 30_000 });
  await strengthen.evaluate((button) => button.click());
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
  const focused = new URL(page.url());
  if (
    focused.searchParams.get('insightReading') !== READING
    || focused.searchParams.get('insightObservation') !== 'o4'
    || focused.searchParams.get('insightAction') !== 'focus'
  ) {
    throw new Error(`strengthening handoff lost its frozen o4 evidence identity: ${focused.search}`);
  }

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
  );
  await discuss.click();
  const turn = await turnResponse;
  console.log('EA CASE STUDY · editorial turn status=', turn.status());
  if (turn.status() !== 200) {
    throw new Error(`Discuss what’s happening returned HTTP ${turn.status()}: ${(await turn.text()).slice(0, 1200)}`);
  }
  await page.waitForFunction(() => {
    const el = document.querySelector('.p4r1-dance-response');
    const text = el?.textContent ?? '';
    return text.length > 0 && !text.includes('MAIA is with the passage');
  }, undefined, { timeout: 120_000 });
  await page.waitForTimeout(500);
  const responseText = (await page.locator('.p4r1-dance-response').first().innerText()).trim();
  const failureText = await page.locator('.p4r1-error').allInnerTexts();
  console.log('EA CASE STUDY · discussion response=', responseText.slice(0, 1200));
  console.log('EA CASE STUDY · visible errors=', JSON.stringify(failureText));
  if (responseText.length < 80) throw new Error('Discuss what’s happening rendered no substantive response');
  if (!/(repet|redundan|spiral|wound|gift)/i.test(responseText)) {
    throw new Error('Discuss what’s happening lost the repetition/wound-gift editorial subject');
  }
  if (failureText.length > 0) {
    throw new Error(`Discuss what’s happening rendered visible errors: ${failureText.join(' | ')}`);
  }

  await page.screenshot({ path: '/private/tmp/ea-case-study-actions.png', fullPage: false });
}

main().then(cleanup).catch(async (err) => {
  console.error(err);
  await cleanup();
  process.exit(1);
});
