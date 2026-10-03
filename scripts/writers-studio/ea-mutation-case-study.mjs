import { chromium } from 'playwright';
import pg from 'pg';
import { randomUUID } from 'node:crypto';

const { Client } = pg;
const BASE = process.env.EA_BASE_URL || 'http://localhost:3700';
const DB = process.env.EA_DATABASE_URL || 'postgresql://soullab@localhost:5432/maia_consciousness';
const REAL_DRAFT_SECTIONS = [
  '2ee9727e-6ca8-425c-aad7-003b3d76e332',
  '34628812-9225-46fd-a412-b1e8650a8bca',
];
const TARGET = 'This is one of the paradoxes Water can reveal: the wound and the gift may live very close to one another.';

const db = new Client({ connectionString: DB });
let browser = null;
let ids = null;

async function one(sql, params = []) {
  return (await db.query(sql, params)).rows[0] ?? null;
}
async function cleanup() {
  await browser?.close().catch(() => {});
  if (!ids) { await db.end().catch(() => {}); return; }
  const { member, manuscript, livingWork, token } = ids;
  try {
    await db.query('DELETE FROM auth_sessions WHERE session_token=$1', [token]);
    await db.query('DELETE FROM living_works WHERE id=$1', [livingWork]);
    await db.query('DELETE FROM member_manuscripts WHERE id=$1', [manuscript]);
    await db.query('DELETE FROM members WHERE id=$1', [member]);
  } catch (error) {
    console.error('cleanup warning', error.message);
  }
  await db.end().catch(() => {});
}

function splitDraftSection(text) {
  const first = text.indexOf('\n');
  return {
    heading: first >= 0 ? text.slice(0, first).trim() : null,
    body: first >= 0 ? text.slice(first).trim() : text.trim(),
  };
}
async function seedClone() {
  const real = (await db.query(
    'SELECT id,text FROM manuscript_draft_sections WHERE id = ANY($1::uuid[]) ORDER BY position',
    [REAL_DRAFT_SECTIONS],
  )).rows;
  if (real.length !== 2) throw new Error('could not recover the two Elemental Alchemy source passages');

  const member = randomUUID(), manuscript = randomUUID(), livingWork = randomUUID();
  const draft = randomUUID(), token = `ea-mutation-${randomUUID()}`;
  const sources = [randomUUID(), randomUUID()];
  const draftSections = [randomUUID(), randomUUID()];
  const username = `ea_case_${member.slice(0, 8)}`;

  await db.query(
    `INSERT INTO members(id,passkey,username,password_hash,name,tester)
     VALUES($1,$2,$3,'!EA-CASE-STUDY-NO-LOGIN!','EA Mutation Case Study',true)`,
    [member, `EA-CASE-${member}`, username],
  );
  await db.query(
    `INSERT INTO living_works(id,member_id,title,purpose)
     VALUES($1,$2,'Elemental Alchemy — disposable refinement witness','Mutation-safe Writer Studio acceptance')`,
    [livingWork, member],
  );
  await db.query(
    `INSERT INTO member_manuscripts(id,member_id,title,provenance)
     VALUES($1,$2,'Elemental Alchemy — disposable refinement witness','member_uploaded')`,
    [manuscript, member],
  );
  await db.query(
    `INSERT INTO living_work_expressions(living_work_id,expression_type,expression_id,declared_by)
     VALUES($1,'manuscript',$2,$3)`,
    [livingWork, manuscript, member],
  );
  for (let i = 0; i < real.length; i += 1) {
    const parsed = splitDraftSection(real[i].text);
    await db.query(
      `INSERT INTO manuscript_sections(id,manuscript_id,position,heading,body)
       VALUES($1,$2,$3,$4,$5)`,
      [sources[i], manuscript, i, parsed.heading, parsed.body],
    );
  }

  await db.query(
    `INSERT INTO manuscript_working_drafts
       (id,manuscript_id,member_id,content,base_source_hash,revision_count)
     VALUES($1,$2,$3,'','ea-mutation-case-study',1)`,
    [draft, manuscript, member],
  );
  for (let i = 0; i < real.length; i += 1) {
    await db.query(
      `INSERT INTO manuscript_draft_sections(id,draft_id,position,text,source_section_id)
       VALUES($1,$2,$3,$4,$5)`,
      [draftSections[i], draft, i, real[i].text, sources[i]],
    );
  }
  await db.query(
    `UPDATE manuscript_working_drafts
        SET content=(SELECT COALESCE(string_agg(text,'' ORDER BY position),'')
                       FROM manuscript_draft_sections WHERE draft_id=$1),
            section_addressable_at=NOW()
      WHERE id=$1`,
    [draft],
  );
  await db.query(
    `INSERT INTO auth_sessions(member_id,session_token,expires_at)
     VALUES($1,$2,NOW()+INTERVAL '30 minutes')`,
    [member, token],
  );
  ids = { member, manuscript, livingWork, draft, draftSections, token };
  return { real, ...ids };
}
async function selectExactText(page, sectionId, text) {
  const editor = page.locator(`[data-write-editor][data-section-id="${sectionId}"]`);
  await editor.waitFor({ timeout: 30_000 });
  const found = await page.evaluate(({ sectionId, text }) => {
    const root = document.querySelector(`[data-write-editor][data-section-id="${sectionId}"]`);
    if (!root) return false;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const value = node.nodeValue || '';
      const start = value.indexOf(text);
      if (start < 0) continue;
      const range = document.createRange();
      range.setStart(node, start);
      range.setEnd(node, start + text.length);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      document.dispatchEvent(new Event('selectionchange', { bubbles: true }));
      return true;
    }
    return false;
  }, { sectionId, text });
  if (!found) throw new Error('target text not found in rendered editor');
  await page.waitForSelector('[data-p4r1-selection-affordance]', { timeout: 10_000 });
}
async function main() {
  await db.connect();
  const fixture = await seedClone();
  const [waterSection] = fixture.draftSections;
  const original = (await one('SELECT text FROM manuscript_draft_sections WHERE id=$1', [waterSection])).text;

  browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1200 } });
  await ctx.addCookies([{ name: 'maia_session', value: fixture.token, domain: 'localhost', path: '/' }]);
  await ctx.addInitScript(() => localStorage.setItem('maia_settings', JSON.stringify({ sanctuary: false })));
  const page = await ctx.newPage();
  page.on('response', (response) => {
    if (response.url().includes('/api/writers-studio/editorial/')) {
      console.log('[EDITORIAL HTTP]', response.request().method(), response.status(), response.url());
    }
  });

  await page.goto(`${BASE}/writers-studio?mode=write&m=${fixture.manuscript}&s=${waterSection}`,
    { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForTimeout(900);

  const editSection = page.getByRole('button', { name: 'Edit this section', exact: false }).first();
  if (await editSection.isVisible().catch(() => false)) {
    await editSection.click();
    await page.waitForTimeout(400);
  }
  await selectExactText(page, waterSection, TARGET);
  const workWithPassage = page.getByRole('button', { name: /Work with passage/i }).first();
  await workWithPassage.waitFor({ state: 'attached', timeout: 10_000 });
  await workWithPassage.evaluate((button) => button.click());
  const focusMenuItem = page.getByRole('menuitem', { name: /Focus/i }).first();
  await focusMenuItem.waitFor({ state: 'visible', timeout: 10_000 });
  await focusMenuItem.evaluate((button) => button.click());
  await page.getByText('What would help you here?').waitFor({ timeout: 30_000 });
  console.log('MUTATION · focus room ready');
  const turn = page.waitForResponse((response) =>
    response.url().includes('/api/writers-studio/editorial/turn')
      && response.request().method() === 'POST',
    { timeout: 120_000 },
  );
  await page.getByRole('button', { name: /Show edit options/i }).click();
  const firstTurn = await turn;
  console.log('MUTATION · edit-options turn', firstTurn.status());
  const firstTurnBody = await firstTurn.text().catch(() => '');
  console.log('MUTATION · edit-options body=', firstTurnBody.slice(0, 4000));
  if (firstTurn.status() !== 200) throw new Error('edit-options turn failed');

  const lighter = page.getByRole('button', { name: /Make it lighter/i }).first();
  const proposalVisible = await lighter.waitFor({ state: 'visible', timeout: 15_000 }).then(() => true).catch(() => false);
  if (!proposalVisible) {
    console.log('MUTATION · proposal UI missing');
    console.log('MUTATION · page excerpt=', (await page.locator('body').innerText()).slice(-5000));
    throw new Error('edit-options turn returned 200 but no proposal UI appeared');
  }
  const proposed = await page.locator('textarea[aria-label="Edit your working version"]').inputValue();
  console.log('MUTATION · proposal differs=', proposed !== TARGET, 'chars=', proposed.length);
  if (!proposed.trim() || proposed === TARGET) throw new Error('no distinct proposed wording');

  const adjustTurn = page.waitForResponse((response) =>
    response.url().includes('/api/writers-studio/editorial/turn')
      && response.request().method() === 'POST',
    { timeout: 120_000 },
  );
  await page.getByRole('button', { name: /Make it lighter/i }).click();
  const adjustedResponse = await adjustTurn;
  console.log('MUTATION · lighter turn', adjustedResponse.status());
  if (adjustedResponse.status() !== 200) throw new Error('lighter adjustment failed');

  await page.waitForTimeout(350);
  const adjusted = await page.locator('textarea[aria-label="Edit your working version"]').inputValue();
  console.log('MUTATION · lighter proposal differs from first=', adjusted !== proposed);
  await page.getByRole('button', { name: /Read my version in context/i }).click();
  await page.getByText(/In context · not applied/i).waitFor({ timeout: 10_000 });
  console.log('MUTATION · context preview PASS');

  const beforeApply = (await one('SELECT text FROM manuscript_draft_sections WHERE id=$1', [waterSection])).text;
  if (beforeApply !== original) throw new Error('clone changed before Apply');

  const saveButton = page.getByRole('button', { name: /^Save my version$/i }).first();
  await saveButton.click();
  console.log('MUTATION · member-version request sent');

  const applyButton = page.getByRole('button', { name: /Apply my version/i }).first();
  await page.waitForFunction(
    (el) => el instanceof HTMLButtonElement && !el.disabled,
    await applyButton.elementHandle(),
    { timeout: 20_000 },
  );
  console.log('MUTATION · member version saved and Apply enabled');

  const applyResponse = page.waitForResponse((response) =>
    response.url().includes('/api/writers-studio/editorial/adoption')
      && response.request().method() === 'POST',
    { timeout: 30_000 },
  );
  await applyButton.click();
  const applied = await applyResponse;
  console.log('MUTATION · apply status', applied.status());
  if (applied.status() !== 200) throw new Error('Apply failed');

  await page.getByText(/Applied to the manuscript/i).waitFor({ timeout: 20_000 });
  const afterApply = (await one('SELECT text FROM manuscript_draft_sections WHERE id=$1', [waterSection])).text;
  console.log('MUTATION · manuscript changed=', afterApply !== original);
  if (afterApply === original) throw new Error('Apply did not change clone bytes');

  const undoResponse = page.waitForResponse((response) =>
    response.url().includes('/api/writers-studio/editorial/undo')
      && response.request().method() === 'POST',
    { timeout: 30_000 },
  );
  await page.getByRole('button', { name: /Undo this change/i }).click();
  const undone = await undoResponse;
  console.log('MUTATION · undo status', undone.status());
  if (undone.status() !== 200) throw new Error('Undo failed');

  await page.waitForTimeout(500);
  const afterUndo = (await one('SELECT text FROM manuscript_draft_sections WHERE id=$1', [waterSection])).text;
  console.log('MUTATION · original bytes restored=', afterUndo === original);
  if (afterUndo !== original) throw new Error('Undo did not restore original bytes');

  await page.screenshot({ path: '/private/tmp/ea-mutation-case-study.png', fullPage: false });
  console.log('EA MUTATION CASE STUDY · PASS');
}

main().then(cleanup).catch(async (error) => {
  console.error('EA MUTATION CASE STUDY · FAIL', error);
  await cleanup();
  process.exit(1);
});
