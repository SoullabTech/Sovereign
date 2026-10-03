import { chromium } from 'playwright';
import pg from 'pg';
import { randomUUID } from 'node:crypto';

const { Client } = pg;
const BASE = process.env.EA_BASE_URL || 'http://localhost:3700';
const DB = process.env.EA_DATABASE_URL || 'postgresql://soullab@localhost:5432/maia_consciousness';
const REAL_DRAFT_SECTIONS = [
  'a678dfe4-5f4f-44b1-afd7-552afcb84f79',
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
    `SELECT d.id,d.text,d.position,s.heading_depth,s.heading_signal
       FROM manuscript_draft_sections d
       JOIN manuscript_sections s ON s.id=d.source_section_id
       WHERE d.id = ANY($1::uuid[])
       ORDER BY d.position`,
    [REAL_DRAFT_SECTIONS],
  )).rows;
  if (real.length !== 3) throw new Error('could not recover the Elemental Alchemy chapter fixture');

  const member = randomUUID(), manuscript = randomUUID(), livingWork = randomUUID();
  const draft = randomUUID(), token = `ea-mutation-${randomUUID()}`;
  const sources = [randomUUID(), randomUUID(), randomUUID()];
  const draftSections = [randomUUID(), randomUUID(), randomUUID()];
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
      `INSERT INTO manuscript_sections
         (id,manuscript_id,position,heading,body,heading_depth,heading_signal)
       VALUES($1,$2,$3,$4,$5,$6,$7)`,
      [sources[i], manuscript, i, parsed.heading, parsed.body, real[i].heading_depth, real[i].heading_signal],
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
  const wholeEditor = page.locator(
    `[data-whole-manuscript-section="${sectionId}"][data-whole-manuscript-mounted="true"] textarea`,
  ).first();
  if (await wholeEditor.waitFor({ state: 'attached', timeout: 30_000 }).then(() => true).catch(() => false)) {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const found = await wholeEditor.evaluate((input, target) => {
        const start = input.value.indexOf(target);
        if (start < 0) return false;
        input.focus();
        input.setSelectionRange(start, start + target.length);
        input.dispatchEvent(new Event('select', { bubbles: true }));
        document.dispatchEvent(new Event('selectionchange', { bubbles: true }));
        return true;
      }, text);
      if (!found) throw new Error('target text not found in whole-chapter editor');
      if (await page.locator('[data-p4r1-selection-affordance]').count()) return;
      await page.waitForTimeout(250);
    }
    const nativeSelection = await wholeEditor.evaluate((input, target) => {
      const start = input.value.indexOf(target);
      if (start < 0) return null;
      input.focus();
      input.setSelectionRange(start, start);
      return { start, length: target.length };
    }, text);
    if (!nativeSelection) throw new Error('target text not found for native whole-chapter selection');
    await wholeEditor.focus();
    await page.keyboard.down('Shift');
    for (let i = 0; i < nativeSelection.length; i += 1) {
      await page.keyboard.press('ArrowRight');
    }
    await page.keyboard.up('Shift');
    await page.waitForTimeout(250);
    if (await page.locator('[data-p4r1-selection-affordance]').count()) return;
    throw new Error('whole-chapter selection affordance did not appear after synthetic or native selection');
  }

  const editor = page.locator(`[data-write-editor][data-section-id="${sectionId}"]`);
  await editor.waitFor({ timeout: 30_000 });
  let found = false;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    found = await page.evaluate(({ sectionId, text }) => {
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
        selection?.removeAllRanges();
        selection?.addRange(range);
        document.dispatchEvent(new Event('selectionchange', { bubbles: true }));
        return true;
      }
      return false;
    }, { sectionId, text });
    if (!found) throw new Error('target text not found in rendered editor');
    if (await page.locator('[data-p4r1-selection-affordance]').count()) return;
    await page.waitForTimeout(250);
  }
  throw new Error('selection affordance did not appear after repeated selectionchange dispatch');
}
async function main() {
  await db.connect();
  const fixture = await seedClone();
  const [, waterSection] = fixture.draftSections;
  const original = (await one('SELECT text FROM manuscript_draft_sections WHERE id=$1', [waterSection])).text;

  browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  const ctx = await browser.newContext({
    viewport: { width: 1600, height: 1200 },
    extraHTTPHeaders: { 'x-session-token': fixture.token },
  });
  await ctx.addCookies([{ name: 'maia_session', value: fixture.token, url: BASE }]);
  const identityProbe = await ctx.request.get(`${BASE}/api/members/me`);
  const identityText = await identityProbe.text();
  const identityBody = (() => { try { return JSON.parse(identityText); } catch { return null; } })();
  console.log('MUTATION · identity probe=', identityProbe.status(), identityProbe.headers()['content-type'] ?? null, identityBody?.code ?? null, identityBody?.member?.id === fixture.member, identityText.slice(0, 160));
  const authProbe = await ctx.request.get(
    `${BASE}/api/writers-studio/rebuild/context?manuscriptId=${fixture.manuscript}`,
  );
  console.log('MUTATION · authenticated context probe=', authProbe.status());
  if (authProbe.status() !== 200) {
    throw new Error('disposable browser context did not authenticate against Writer Studio');
  }
  await ctx.addInitScript(() => localStorage.setItem('maia_settings', JSON.stringify({ sanctuary: false })));
  const page = await ctx.newPage();
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/writers-studio/editorial/')) {
      console.log('[EDITORIAL HTTP]', response.request().method(), response.status(), url);
    }
    if (response.request().method() === 'POST'
      && (url.includes('/readings') || url.includes('/attention-map') || url.includes('/chapter-reviews'))) {
      const body = await response.text().catch(() => '');
      console.log('[REVIEW HTTP]', response.status(), url, body.slice(0, 2400));
    }
  });

  await page.goto(`${BASE}/writers-studio?mode=write&m=${fixture.manuscript}&s=${waterSection}`,
    { waitUntil: 'domcontentloaded', timeout: 30_000 });

  const editView = page.getByRole('button', { name: 'Edit', exact: true }).first();
  await editView.waitFor({ state: 'visible', timeout: 30_000 });
  await editView.click();
  await page.locator('[data-chapter-edit]').waitFor({ state: 'attached', timeout: 30_000 });
  await page.waitForTimeout(250);
  await selectExactText(page, waterSection, TARGET);
  const workWithPassage = page.getByRole('button', { name: /Work with passage/i }).first();
  await workWithPassage.waitFor({ state: 'attached', timeout: 10_000 });
  await workWithPassage.evaluate((button) => button.click());
  const focusMenuItem = page.getByRole('menuitem', { name: /Focus/i }).first();
  await focusMenuItem.waitFor({ state: 'visible', timeout: 10_000 });
  await focusMenuItem.evaluate((button) => button.click());
  await page.getByText('What would help you here?').waitFor({ timeout: 30_000 });
  console.log('MUTATION · focus room ready');
  const requestEditOptions = async () => {
    const turn = page.waitForResponse((response) =>
      response.url().includes('/api/writers-studio/editorial/turn')
        && response.request().method() === 'POST',
      { timeout: 120_000 },
    );
    const revisionAction = page.getByRole('button', { name: /Show (?:edit|revision) options/i }).first();
    await revisionAction.waitFor({ state: 'visible', timeout: 30_000 });
    if (await revisionAction.isDisabled()) throw new Error('revision action is disabled');
    const revisionBox = await revisionAction.boundingBox();
    console.log('MUTATION · revision action box=', JSON.stringify(revisionBox));
    await revisionAction.evaluate((button) => button.click());
    const response = await turn;
    const body = await response.text().catch(() => '');
    console.log('MUTATION · edit-options turn', response.status());
    console.log('MUTATION · edit-options body=', body.slice(0, 4000));
    return { response, body };
  };

  let editAttempt = await requestEditOptions();
  let nextLatitude = 2;
  let paragraphRemovalEnabled = false;
  for (let attempt = 0; attempt < 6 && editAttempt.response.status() !== 200; attempt += 1) {
    let refusal = null;
    try { refusal = JSON.parse(editAttempt.body); } catch {}
    const refusalKind = refusal?.error ?? '';
    const boundedRefusal = editAttempt.response.status() === 409
      && (Boolean(refusal?.scope)
        || ['voice_intrusion', 'scope_refused', 'sequence_discussion_first', 'scope_removes_paragraphs'].includes(refusalKind));
    if (!boundedRefusal) throw new Error('edit-options turn failed');

    console.log('MUTATION · author-agency refusal PASS=', refusalKind, refusal?.detail ?? '');

    if (refusalKind === 'scope_removes_paragraphs' && !paragraphRemovalEnabled) {
      const preferences = page.locator('summary').filter({ hasText: /^Preferences$/ }).first();
      if (await preferences.isVisible().catch(() => false)) await preferences.click();
      const paragraphToggle = page.getByLabel(/Allow paragraph-removal proposals/i).first();
      await paragraphToggle.waitFor({ state: 'visible', timeout: 10_000 });
      if (!(await paragraphToggle.isChecked())) await paragraphToggle.check();
      paragraphRemovalEnabled = true;
      await page.waitForTimeout(250);
      console.log('MUTATION · explicitly enabled disposable paragraph-removal permission');
    } else {
      const requestedLatitude = Number(refusal?.scope?.wouldPassAtLatitude);
      const latitude = Math.min(
        Number.isFinite(requestedLatitude) && requestedLatitude >= 1 ? requestedLatitude : nextLatitude,
        5,
      );
      const slider = page.locator('#p4r1-editing-latitude');
      await slider.waitFor({ state: 'attached', timeout: 10_000 });
      await slider.evaluate((input, next) => {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
        setter?.call(input, String(next));
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }, latitude);
      nextLatitude = Math.min(latitude + 1, 5);
      await page.waitForTimeout(250);
      console.log('MUTATION · widened disposable edit latitude to', latitude);
    }
    editAttempt = await requestEditOptions();
  }
  if (editAttempt.response.status() !== 200) throw new Error('edit-options turn remained refused after bounded author-permission widening');

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
  const adjustedBody = await adjustedResponse.text().catch(() => '');
  console.log('MUTATION · lighter turn', adjustedResponse.status());
  console.log('MUTATION · lighter body=', adjustedBody.slice(0, 4000));
  let adjustmentNoopViolation = false;
  let adjusted = proposed;
  if (adjustedResponse.status() === 200) {
    let adjustedPayload = null;
    try { adjustedPayload = JSON.parse(adjustedBody); } catch {}
    const producedVersion = adjustedPayload?.version?.id ?? null;
    if (producedVersion) {
      await page.waitForTimeout(350);
      adjusted = await page.locator('textarea[aria-label="Edit your working version"]').inputValue();
      console.log('MUTATION · lighter proposal differs from first=', adjusted !== proposed);
      if (adjusted === proposed) {
        adjustmentNoopViolation = true;
        console.log('MUTATION · DEFECT: lighter adjustment created a nominal successor with byte-identical wording');
      }
    } else if (adjustedPayload?.version === null) {
      console.log('MUTATION · lighter adjustment truthfully returned without a new proposal PASS');
    } else {
      throw new Error('lighter adjustment returned 200 without a legible version outcome');
    }
  } else {
    let refusal = null;
    try { refusal = JSON.parse(adjustedBody); } catch {}
    if (adjustedResponse.status() !== 409 || refusal?.error !== 'noop_editorial_adjustment') {
      console.log('MUTATION · lighter refusal body=', adjustedBody.slice(0, 2400));
      throw new Error('lighter adjustment failed');
    }
    console.log('MUTATION · byte-identical adjustment truthfully refused PASS');
  }
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

  const reviewUrl = new URL(page.url());
  reviewUrl.searchParams.set('mode', 'review');
  reviewUrl.searchParams.set('m', fixture.manuscript);
  reviewUrl.searchParams.set('s', waterSection);
  if (!reviewUrl.searchParams.get('editorialThread')) {
    throw new Error('applied editorial relationship was not preserved in the Studio address');
  }
  console.log('MUTATION · exact editorial thread address preserved into Review');
  await page.goto(reviewUrl.toString(),
    { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.locator('[data-review-reread]').waitFor({ timeout: 30_000 });
  console.log('MUTATION · Review room opened');

  const quick = page.getByRole('button', { name: /^Quick reread$/i }).first();
  const checkpointQuick = page.getByRole('button', { name: /Save current draft & quick reread/i }).first();
  const quickResult = page.locator('[data-review-quick-result]');
  const reviewError = page.locator('[data-review-reread] .p4r1-error').first();

  const initialControl = await Promise.race([
    quick.waitFor({ state: 'visible', timeout: 30_000 }).then(() => 'quick').catch(() => null),
    checkpointQuick.waitFor({ state: 'visible', timeout: 30_000 }).then(() => 'checkpoint').catch(() => null),
    reviewError.waitFor({ state: 'visible', timeout: 30_000 }).then(() => 'error').catch(() => null),
  ]);
  if (initialControl === 'error') {
    throw new Error('Review entry error: ' + await reviewError.innerText());
  }
  if (initialControl === 'checkpoint') {
    await checkpointQuick.click();
  } else if (initialControl === 'quick') {
    await quick.click();
  } else {
    console.log('MUTATION · Review entry body=', (await page.locator('[data-review-reread]').innerText()).slice(0, 2400));
    throw new Error('Review quick reread control unavailable');
  }

  let reviewState = await Promise.race([
    quickResult.waitFor({ state: 'visible', timeout: 120_000 }).then(() => 'result').catch(() => null),
    checkpointQuick.waitFor({ state: 'visible', timeout: 120_000 }).then(() => 'checkpoint').catch(() => null),
    reviewError.waitFor({ state: 'visible', timeout: 120_000 }).then(() => 'error').catch(() => null),
  ]);
  if (reviewState === 'checkpoint') {
    console.log('MUTATION · Review requested current-draft checkpoint');
    await checkpointQuick.click();
    reviewState = await Promise.race([
      quickResult.waitFor({ state: 'visible', timeout: 120_000 }).then(() => 'result').catch(() => null),
      reviewError.waitFor({ state: 'visible', timeout: 120_000 }).then(() => 'error').catch(() => null),
    ]);
  }
  if (reviewState === 'error') {
    throw new Error('Review quick reread error: ' + await reviewError.innerText());
  }
  if (reviewState !== 'result') {
    console.log('MUTATION · Review stalled body=', (await page.locator('[data-review-reread]').innerText()).slice(0, 3200));
    throw new Error('Quick Review produced neither result nor explicit error');
  }
  const quickItems = await page.locator('[data-review-quick-result] article').allInnerTexts();
  console.log('MUTATION · quick Review items=', JSON.stringify(quickItems));
  if (quickItems.length === 0) throw new Error('Quick Review returned no items');
  console.log('MUTATION · Apply → Review quick reread PASS');

  if (process.env.EA_RUN_DEEP_REVIEW === '1') {
    const deepDetails = page.locator('details.p4r1-review-deep').first();
    await deepDetails.waitFor({ state: 'visible', timeout: 30_000 });
    await deepDetails.evaluate((details) => { details.open = true; });
    const deepButton = page.getByRole('button', {
      name: /^(?:Run deep Review|Save current draft & run deep Review)$/i,
    }).first();
    await deepButton.waitFor({ state: 'visible', timeout: 30_000 });
    console.log('MUTATION · commissioning governed deep Review');
    await deepButton.evaluate((button) => button.click());
    await page.waitForFunction(
      () => new URL(window.location.href).searchParams.has('reviewRun'),
      undefined,
      { timeout: 420_000 },
    );
    await page.locator('[data-live-review]').waitFor({ state: 'visible', timeout: 60_000 });
    const reviewRun = new URL(page.url()).searchParams.get('reviewRun');
    const lensCount = await page.locator('[data-live-lens]').count();
    const findingCount = await page.locator('[data-live-finding]').count();
    console.log('MUTATION · deep Review saved=', reviewRun, 'lenses=', lensCount, 'findings=', findingCount);
    if (!reviewRun || lensCount === 0) throw new Error('deep Review did not open a durable governed result');
    console.log('MUTATION · deep Review durable return PASS');
  }

  const writeReturnUrl = new URL(page.url());
  writeReturnUrl.searchParams.set('mode', 'write');
  writeReturnUrl.searchParams.set('m', fixture.manuscript);
  writeReturnUrl.searchParams.set('s', waterSection);
  await page.goto(writeReturnUrl.toString(),
    { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.getByRole('button', { name: /Undo this change/i }).waitFor({ state: 'visible', timeout: 30_000 });
  console.log('MUTATION · Review → Write restored exact applied relationship');

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
  if (adjustmentNoopViolation) {
    throw new Error('all downstream connections passed, but lighter adjustment still exposed byte-identical visible wording');
  }
  console.log('EA MUTATION CASE STUDY · PASS');
}

main().then(cleanup).catch(async (error) => {
  console.error('EA MUTATION CASE STUDY · FAIL', error);
  await cleanup();
  process.exit(1);
});
