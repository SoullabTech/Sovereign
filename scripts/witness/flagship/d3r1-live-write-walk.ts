/**
 * WRITERS-STUDIO-FLAGSHIP-ROADMAP-01 / D3R1
 * Complete live Write walk on an isolated disposable DB + controlled provider.
 * This is candidate evidence only. Never point at production.
 */
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { Client } from 'pg';
import { chromium, type Page } from 'playwright';

const DSN = process.env.DATABASE_URL ?? '';
const PORT = Number(process.env.WITNESS_PORT ?? '3617');
const OUT = join(process.cwd(), 'docs/design/contracts/screenshots/ws-roadmap-d3r1');
if (!/\/ws_d3r1_witness_[^/?]+(?:\?|$)/.test(DSN)) {
  console.error('REFUSED — D3R1 requires a disposable ws_d3r1_witness_* database');
  process.exit(2);
}

let pass = 0, fail = 0;
const check = (name: string, ok: boolean, detail = '') => {
  if (ok) { pass += 1; console.log(`  PASS  ${name}${detail ? ` — ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${name}\n        ${detail}`); }
};

const pg = new Client({ connectionString: DSN });
const q = async (sql: string, params: unknown[] = []) => (await pg.query(sql, params)).rows as Record<string, unknown>[];

const M = randomUUID(), LW = randomUUID(), WK = randomUUID(), DR = randomUUID();
const S1 = randomUUID(), S2 = randomUUID(), D1 = randomUUID(), D2 = randomUUID();
const TOKEN = `d3r1-${randomUUID()}`;
const H1 = 'Chapter 1', H2 = 'The river at dusk';
const B1 = 'The water held the last of the light.';
const B2 = 'Nothing moved on the far bank. She waited for the sound to come back.';
const SEL = 'far bank';
const PROPOSED = 'far shore';

async function seed() {
  await q(`INSERT INTO members (id,passkey,username,password_hash,name,onboarded,onboarding_step,tester)
           VALUES ($1,$2,$3,'x','D3R1 witness',true,'complete',true)`,
    [M, `SOULLAB-D3R1-${M.slice(0,8)}`, `d3r1-${M.slice(0,8)}`]);
  await q(`INSERT INTO auth_sessions (member_id,session_token,expires_at,user_agent)
           VALUES ($1,$2,NOW() + INTERVAL '2 hours','d3r1-witness')`, [M, TOKEN]);
  await q(`INSERT INTO living_works (id,member_id,title) VALUES ($1,$2,'The River Between')`, [LW,M]);
  await q(`INSERT INTO member_manuscripts (id,member_id,title) VALUES ($1,$2,'The River Between')`, [WK,M]);
  await q(`INSERT INTO living_work_expressions (living_work_id,expression_type,expression_id,declared_by)
           VALUES ($1,'manuscript',$2,$3)`, [LW,WK,M]);
  await q(`INSERT INTO manuscript_sections
           (id,manuscript_id,position,heading,heading_depth,heading_signal,body)
           VALUES ($1,$2,1,$3,1,'chapter',$4),($5,$2,2,$6,2,'markdown',$7)`,
    [S1,WK,H1,B1,S2,H2,B2]);
  await q(`INSERT INTO manuscript_working_drafts
           (id,manuscript_id,member_id,content,base_source_hash,revision_count)
           VALUES ($1,$2,$3,'','sha-d3r1',2)`, [DR,WK,M]);
  await q(`INSERT INTO manuscript_draft_sections
           (id,draft_id,position,text,source_section_id)
           VALUES ($1,$2,1,$3,$4),($5,$2,2,$6,$7)`,
    [D1,DR,`${H1}\n\n${B1}`,S1,D2,`${H2}\n\n${B2}`,S2]);
  await q(`UPDATE manuscript_working_drafts d
           SET content=(SELECT COALESCE(string_agg(s.text,'' ORDER BY s.position),'')
                        FROM manuscript_draft_sections s WHERE s.draft_id=d.id)
           WHERE d.id=$1`, [DR]);
  await q(`UPDATE manuscript_working_drafts SET section_addressable_at=NOW() WHERE id=$1`, [DR]);
}
const stored = async () => String((await q(`SELECT text FROM manuscript_draft_sections WHERE id=$1`,[D2]))[0]?.text ?? '');
const version = async () => Number((await q(`SELECT version FROM manuscript_working_drafts WHERE id=$1`,[DR]))[0]?.version ?? 0);

async function selectPassage(page: Page) {
  await page.locator(`[data-authored-body="${D2}"]`).click();
  const ta = page.locator(`textarea[data-authored-body="${D2}"]`);
  await ta.waitFor({ state: 'visible' });
  const addr = await ta.evaluate((el, sel) => {
    const field = el as HTMLTextAreaElement;
    const start = field.value.indexOf(String(sel));
    field.setSelectionRange(start, start + String(sel).length);
    field.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Shift' }));
    return {
      start: [...field.value.slice(0,start)].length,
      end: [...field.value.slice(0,start + String(sel).length)].length,
    };
  }, SEL);
  await ta.evaluate((el) => (el as HTMLTextAreaElement).blur());
  await page.waitForSelector(`[data-flagship-section="${D2}"][data-held="true"]`, { timeout: 10_000 });
  return addr;
}

async function screenshot(page: Page, name: string) {
  await page.screenshot({ path: join(OUT, name), fullPage: false });
}

async function main() {
  mkdirSync(OUT,{recursive:true});
  await pg.connect();
  const [who] = await q('select current_database() d,current_user u');
  if (!String(who?.d).startsWith('ws_d3r1_witness_') || who?.u !== 'maia_test_user') {
    throw new Error(`wrong DB identity: ${who?.d}/${who?.u}`);
  }
  await seed();
  const v0 = await version();

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  await ctx.addCookies([{ name: 'maia_session', value: TOKEN, url: `http://127.0.0.1:${PORT}` }]);
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    localStorage.setItem('maia_settings', JSON.stringify({ sanctuary: false }));
  });

  try {
    console.log(`\n── D3R1 LIVE WRITE WALK · manuscript=${WK} · draft=${DR} · v0=${v0} ──\n`);
    await page.goto(`http://127.0.0.1:${PORT}/writers-studio/rebuild?m=${WK}&s=${D2}`,
      { waitUntil: 'domcontentloaded', timeout: 240_000 });
    await page.waitForSelector(`[data-authored-body="${D2}"]`, { timeout: 240_000 });
    await page.waitForTimeout(500);
    await screenshot(page,'01-open.png');

    check('D3-01 exact V10 shell is live', await page.locator('.fs-root').count() === 1,
      `fs-root=${await page.locator('.fs-root').count()}`);
    check('D3-02 legacy workspace composition is absent',
      await page.locator('.wsr-grid,.wsr-outline,.wsr-maia').count() === 0);
    check('D3-03 exact Work/place address is retained',
      page.url().includes(`m=${WK}`) && page.url().includes(`s=${D2}`), page.url());

    const addr = await selectPassage(page);
    const heldAddress = await page.locator(`[data-flagship-section="${D2}"]`).getAttribute('data-held-passage-address');
    check('D3-04 exact passage can be held', heldAddress === `${addr.start}:${addr.end}`,
      `address=${heldAddress} expected=${addr.start}:${addr.end}`);
    await screenshot(page,'02-held.png');

    const bodyBeforeMaia = await page.locator(`[data-authored-body="${D2}"]`).boundingBox();
    await page.locator('button[data-event="HOLD_PASSAGE"]').click();
    await page.waitForSelector('.fs-maia');
    const bodyWithMaia = await page.locator(`[data-authored-body="${D2}"]`).boundingBox();
    check('D3-05 contextual MAIA opens without moving manuscript',
      !!bodyBeforeMaia && !!bodyWithMaia &&
      Math.abs(bodyBeforeMaia.x-bodyWithMaia.x) < 1 &&
      Math.abs(bodyBeforeMaia.width-bodyWithMaia.width) < 1,
      `x ${bodyBeforeMaia?.x}->${bodyWithMaia?.x}; w ${bodyBeforeMaia?.width}->${bodyWithMaia?.width}`);

    await page.locator('[data-a2-begin-relationship]').click();
    await page.waitForFunction(() => new URL(location.href).searchParams.has('relationship'), null, { timeout: 15_000 });
    const relationshipId = new URL(page.url()).searchParams.get('relationship');
    check('D3-06 explicit MAIA relationship is created and addressed', !!relationshipId,
      `relationship=${relationshipId?.slice(0,8)}…`);

    if (await page.locator('.fs-maia').count() === 0) {
      await page.locator('button[data-event="HOLD_PASSAGE"]').click();
      await page.waitForSelector('.fs-maia');
    }
    const tabs = await page.locator('.fs-maia [role="tab"]').allTextContents();
    check('D3-07 only live tabs are exposed', JSON.stringify(tabs) === JSON.stringify(['Discuss','Revise']),
      JSON.stringify(tabs));

    const discuss = page.locator('textarea[aria-label="Your question about this passage"]');
    await discuss.fill('What is happening in this phrase?');
    await discuss.locator('xpath=..').locator('button[type="submit"]').click().catch(async () => {
      await page.locator('.fs-minput button[type="submit"]').click();
    });
    await page.waitForFunction(() =>
      Array.from(document.querySelectorAll('.fs-say')).some((n) => (n.textContent ?? '').includes('Controlled D3 witness reply: the phrase')),
      null,{ timeout: 30_000 });
    check('D3-08 Discuss completes in the same contextual relationship', true);
    await screenshot(page,'03-discuss.png');

    await page.locator('[data-tab="Revise"]').click();
    const revise = page.locator('textarea[aria-label="What would you like to revise?"]');
    await revise.fill('Try a quieter version of these words.');
    await page.locator('.fs-minput button[type="submit"]').click();
    await page.waitForSelector('[data-alternatives="peer"]', { timeout: 30_000 });

    const ranked = await page.locator('[data-alternatives="peer"]').getAttribute('data-ranked');
    const keep = await page.locator('[data-alternative="keep-original"][data-keep="true"]').count();
    const readers = await page.locator('button[data-event="READ_IN_CONTEXT"]').count();
    check('D3-09 alternatives are unranked and Keep my original is first-class',
      ranked === 'false' && keep === 1 && readers >= 1, `ranked=${ranked} keep=${keep} readButtons=${readers}`);
    await screenshot(page,'04-alternatives.png');

    const readButton = page.locator('button[data-event="READ_IN_CONTEXT"]').first();
    const altId = await readButton.getAttribute('data-alternative');
    await readButton.click();
    await page.waitForSelector('[data-apply-gate="open"]');

    const del = ((await page.locator('.fs-del').first().textContent().catch(() => '')) ?? '').trim();
    const ins = ((await page.locator('.fs-ins').first().textContent().catch(() => '')) ?? '').trim();
    check('D3-10 Read in context actually projects the candidate into the live manuscript',
      del === SEL && ins === PROPOSED, `deleted="${del}" inserted="${ins}"`);
    check('D3-11 Apply exists only at the context-review gate',
      await page.locator('button[data-event="APPLY"]').count() === 1, `alternative=${altId}`);
    await screenshot(page,'05-read-in-context.png');

    await page.locator('button[data-event="APPLY"]').click();
    await page.waitForSelector('[data-receipt="applied"]', { timeout: 30_000 });
    await page.waitForFunction(({ id, proposed }) => {
      const el = document.querySelector(`[data-authored-body="${id}"]`);
      return (el?.textContent ?? '').includes(String(proposed));
    }, { id: D2, proposed: PROPOSED }, { timeout: 20_000 });
    const appliedStored = await stored();
    check('D3-12 Apply changes the exact stored locus and shows a truthful receipt',
      appliedStored.includes(PROPOSED) && !appliedStored.includes(SEL),
      `stored contains proposed=${appliedStored.includes(PROPOSED)}`);
    await screenshot(page,'06-applied.png');

    await page.locator('button[data-event="OPEN_OVERLAY"][data-overlay="history"]').click();
    await page.waitForSelector('aside[data-overlay="history"]');
    const historyEntries = await page.locator('aside[data-overlay="history"] .fs-ver').count();
    check('D3-13 History is real and populated from saved versions', historyEntries >= 1,
      `entries=${historyEntries}`);
    await page.locator('button[data-event="CLOSE_OVERLAY"]').click();

    await page.locator('button[data-event="UNDO"]').click();
    await page.waitForFunction(({ id, original }) => {
      const el = document.querySelector(`[data-authored-body="${id}"]`);
      return (el?.textContent ?? '').includes(String(original));
    }, { id: D2, original: SEL }, { timeout: 20_000 });
    const undoneStored = await stored();
    check('D3-14 Undo restores the exact prior wording without deleting history',
      undoneStored.includes(SEL) && !undoneStored.includes(PROPOSED),
      `restored=${undoneStored.includes(SEL)}`);
    check('D3-15 Work/place/relationship continuity survives apply + undo',
      page.url().includes(`m=${WK}`) && page.url().includes(`s=${D2}`) &&
      new URL(page.url()).searchParams.get('relationship') === relationshipId, page.url());
    await screenshot(page,'07-undone.png');

    const v1 = await version();
    check('D3-16 the durable draft version advanced through apply + undo', v1 > v0, `version ${v0}->${v1}`);
  } finally {
    await browser.close();
    await pg.end();
  }

  console.log(`\nD3R1 RESULT — ${pass} passed · ${fail} failed · screenshots ${OUT}\n`);
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(async (e) => {
  console.error(e);
  await pg.end().catch(()=>{});
  process.exit(2);
});
