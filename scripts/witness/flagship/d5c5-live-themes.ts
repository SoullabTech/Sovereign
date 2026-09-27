/**
 * WRITERS-STUDIO-FLAGSHIP-ROADMAP-01 / D5C5
 * Live governed Themes walk in the new flagship Develop room.
 */
import { createHash, randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { Client } from 'pg';
import { chromium } from 'playwright';

const DSN = process.env.DATABASE_URL ?? '';
const PORT = Number(process.env.WITNESS_PORT ?? '3618');
const OUT = join(process.cwd(), 'docs/design/contracts/screenshots/ws-roadmap-d5c5');
if (!/\/ws_d4r1_witness_[^/?]+(?:\?|$)/.test(DSN)) {
  console.error('REFUSED — D5C5 requires disposable ws_d4r1_witness_* DB');
  process.exit(2);
}
const pg = new Client({ connectionString: DSN });
const q = async (sql: string, params: unknown[] = []) =>
  (await pg.query(sql, params)).rows as Record<string, unknown>[];
const sha = (s: string) => createHash('sha256').update(s).digest('hex');
let pass = 0, fail = 0;
const check = (name: string, ok: boolean, detail = '') => {
  if (ok) { pass += 1; console.log(`  PASS  ${name}${detail ? ` — ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${name}\n        ${detail}`); }
};
const M = randomUUID(), LW = randomUUID(), WK = randomUUID(), DR = randomUUID();
const S1 = randomUUID(), S2 = randomUUID(), S3 = randomUUID();
const D1 = randomUUID(), D2 = randomUUID(), D3 = randomUUID();
const RID = randomUUID(), OID = `dobs_${randomUUID()}`;
const TOKEN = `d5c5-${randomUUID()}`;
const T1 = 'Chapter 1\n\nThe river appears, narrows, and returns before Clara crosses.';
const T2 = 'The crossing\n\nShe hears the river again from the far bank.';
const T3 = 'Afterward\n\nClara enters the house and closes the door.';
const CONTENT = T1 + T2 + T3;
const LABEL = 'The returning river';
const OBS = 'The river recurs across the opening and the crossing.';

async function seed() {
  await q(`INSERT INTO members (id,passkey,username,password_hash,name,onboarded,onboarding_step,tester)
    VALUES ($1,$2,$3,'x','D5C5 witness',true,'complete',true)`,
    [M,`SOULLAB-D5C5-${M.slice(0,8)}`,`d5c5-${M.slice(0,8)}`]);
  await q(`INSERT INTO auth_sessions (member_id,session_token,expires_at,user_agent)
    VALUES ($1,$2,NOW()+INTERVAL '2 hours','d5c5-witness')`, [M,TOKEN]);
  await q(`INSERT INTO living_works (id,member_id,title,form)
    VALUES ($1,$2,'The River Between','book')`, [LW,M]);
  await q(`INSERT INTO member_manuscripts (id,member_id,title)
    VALUES ($1,$2,'The River Between')`, [WK,M]);
  await q(`INSERT INTO living_work_expressions
    (living_work_id,expression_type,expression_id,declared_by)
    VALUES ($1,'manuscript',$2,$3)`, [LW,WK,M]);
  await q(`INSERT INTO manuscript_sections
    (id,manuscript_id,position,heading,heading_depth,heading_signal,body)
    VALUES
      ($1,$2,1,'Chapter 1',1,'chapter',$3),
      ($4,$2,2,'The crossing',2,'markdown',$5),
      ($6,$2,3,'Afterward',2,'markdown',$7)`,
    [S1,WK,T1,S2,T2,S3,T3]);
  await q(`INSERT INTO manuscript_working_drafts
    (id,manuscript_id,member_id,content,base_source_hash,revision_count)
    VALUES ($1,$2,$3,$4,'sha-d5c5',1)`, [DR,WK,M,CONTENT]);
  await q(`INSERT INTO manuscript_draft_sections
    (id,draft_id,position,text,source_section_id)
    VALUES
      ($1,$2,1,$3,$4),
      ($5,$2,2,$6,$7),
      ($8,$2,3,$9,$10)`,
    [D1,DR,T1,S1,D2,T2,S2,D3,T3,S3]);
  await q(`UPDATE manuscript_working_drafts
    SET section_addressable_at=NOW() WHERE id=$1`, [DR]);

  const l1 = [...T1].length, l2 = [...T2].length, l3 = [...T3].length;
  const readState = {
    draftId:DR, revisionNumber:1, revisionDigest:sha(CONTENT),
    sectionTopology:[D1,D2,D3],
    sections:{
      [D1]:{revisionNumber:1,range:{start:0,end:l1},digest:sha(T1)},
      [D2]:{revisionNumber:1,range:{start:l1,end:l1+l2},digest:sha(T2)},
      [D3]:{revisionNumber:1,range:{start:l1+l2,end:l1+l2+l3},digest:sha(T3)},
    },
    inputFingerprint:sha('d5c5-input'),
  };
  const observation = {
    key:'o1', observationId:OID, admissionIndex:0,
    basisFingerprint:sha('d5c5-basis'),
    position:{sectionPosition:0,codePointStart:4},
    lens:'themes', themeLabel:LABEL,
    evidenceRefs:[
      {kind:'passage',sectionId:D1,range:{start:11,end:20}},
      {kind:'passage',sectionId:D1,range:{start:22,end:29}},
      {kind:'passage',sectionId:D1,range:{start:35,end:42}},
      {kind:'passage',sectionId:D2,range:{start:20,end:29}},
    ],
    observation:OBS,
    doesNotEstablish:['author-intent','editorial-consequence'],
    structureDependency:{kind:'independent'},
  };
  await q(`INSERT INTO developmental_readings
    (id,manuscript_id,member_id,draft_id,revision_number,commissioned_lens,
     scope,read_state,coverage,input_fingerprint,outcome,observations,
     reader_provenance,classifier_provenance,frozen_at)
    VALUES ($1,$2,$3,$4,1,'themes',$5,$6,$7,$8,'reading',$9,$10,$11,NOW())`,[
    RID,WK,M,DR,
    JSON.stringify({commissionedLens:'themes',bodyScope:[D1,D2,D3],withStructure:false}),
    JSON.stringify(readState),
    JSON.stringify({sections:{[D1]:'body',[D2]:'body',[D3]:'body'}}),
    readState.inputFingerprint,
    JSON.stringify([observation]),
    JSON.stringify({provider:'anthropic',model:'witness',promptHash:sha('prompt'),readerVersion:'DEVELOPMENTAL-READER-07'}),
    JSON.stringify({provider:'anthropic',model:'witness',promptHash:sha('classifier'),classifierVersion:'DEVELOPMENTAL-PHENOMENON-04'}),
  ]);
}
async function main() {
  mkdirSync(OUT, { recursive: true });
  await pg.connect();
  const [who] = await q('select current_database() d,current_user u');
  if (!String(who?.d).startsWith('ws_d4r1_witness_') || who?.u !== 'maia_test_user') {
    throw new Error(`wrong DB ${who?.d}/${who?.u}`);
  }
  await seed();

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await ctx.addCookies([{ name:'maia_session', value:TOKEN, url:`http://127.0.0.1:${PORT}` }]);
  const page = await ctx.newPage();
  let readingPosts = 0;
  page.on('request', (req) => {
    if (req.method() === 'POST' && /\/readings(?:\?|$)/.test(req.url())) readingPosts += 1;
  });

  try {
    console.log('\n── D5C5 LIVE FLAGSHIP THEMES WALK ──\n');
    await page.goto(`http://127.0.0.1:${PORT}/writers-studio/develop?m=${WK}&s=${D1}`,
      { waitUntil:'domcontentloaded', timeout:240000 });
    await page.waitForSelector('[data-studio-mode="develop"] [data-stage="develop"]', { timeout:240000 });

    check('D5C5-01 Themes is a real live Develop destination',
      await page.getByRole('tab',{name:'What keeps returning'}).count() === 1);
    const before = readingPosts;
    await page.getByRole('tab',{name:'What keeps returning'}).click();
    await page.waitForFunction(() => new URL(location.href).searchParams.get('lens') === 'themes');
    await page.waitForSelector('[data-develop-view="themes"]');
    await page.waitForSelector(`[data-theme-candidate="${OID}"]`);
    check('D5C5-02 opening Themes is explicit URL state',
      new URL(page.url()).searchParams.get('lens') === 'themes', page.url());
    const tabFit = await page.locator('.fs-modetabs').evaluate((node) => ({
      clientWidth: node.clientWidth, scrollWidth: node.scrollWidth,
    }));
    check('D5C5-03 full eight-lens family fits the accepted desktop viewport',
      tabFit.scrollWidth <= tabFit.clientWidth + 1, JSON.stringify(tabFit));
    check('D5C5-04 opening Themes commissions no reading',
      readingPosts === before, `reading POST delta=${readingPosts-before}`);
    check('D5C5-05 frozen MAIA observation remains a candidate until member acts',
      await page.locator('[data-theme-candidate]').count() === 1
      && await page.locator('[data-work-theme]').count() === 0);
    check('D5C5-06 candidate names its provenance rather than impersonating the writer',
      (await page.locator('[data-theme-candidate] .fs-themeprov').textContent())?.includes('MAIA noticed this') === true);

    const candidateReturns = await page.locator('[data-theme-candidate] a[data-return-to]')
      .evaluateAll((nodes) => nodes.map((node) => ({
        id: node.getAttribute('data-return-to'), href: node.getAttribute('href'),
      })));
    check('D5C5-07 current candidate evidence has exact section returns',
      candidateReturns.length === 4
      && candidateReturns.every((r) => r.href?.includes(`m=${WK}`) && r.href?.includes(`s=${r.id}`)),
      JSON.stringify(candidateReturns));

    await page.getByRole('button',{name:'Keep as a theme'}).click();
    await page.waitForSelector('[data-work-theme][data-theme-standing="accepted"]');
    await page.waitForFunction(() => document.querySelectorAll('[data-theme-candidate]').length === 0);
    check('D5C5-08 acceptance promotes exactly one governed Work Theme',
      await page.locator('[data-work-theme][data-theme-standing="accepted"]').count() === 1);

    const [stored] = await q(`SELECT t.id,t.initial_label,
      (SELECT e.event_type FROM writer_studio_work_theme_events e
        WHERE e.theme_id=t.id ORDER BY e.id DESC LIMIT 1) latest_event
      FROM writer_studio_work_themes t
      WHERE t.member_id=$1 AND t.manuscript_id=$2
        AND t.source_reading_id=$3 AND t.source_observation_id=$4`,
      [M,WK,RID,OID]);
    const occ = await q(`SELECT section_id,code_point_start,code_point_end
      FROM writer_studio_work_theme_occurrences WHERE theme_id=$1 ORDER BY section_id,code_point_start`,
      [stored?.id]);
    check('D5C5-09 accepted theme is reload-durable with four exact occurrences',
      Boolean(stored?.id) && stored?.latest_event === 'accept' && occ.length === 4,
      `occurrences=${occ.length}`);

    const cells = await page.locator('[data-work-theme] .fs-themecellbar')
      .evaluateAll((nodes) => nodes.map((node) => ({
        p: node.getAttribute('data-presence'),
        state: node.getAttribute('data-presence-state'),
      })));
    check('D5C5-10 presence bars are derived frequency: sometimes · once/twice · known zero',
      JSON.stringify(cells) === JSON.stringify([
        {p:'2',state:'known'},{p:'1',state:'known'},{p:'0',state:'known'},
      ]), JSON.stringify(cells));
    check('D5C5-11 trajectory excludes known-zero section rather than inventing movement',
      (await page.locator('[data-work-theme] .fs-themefacts').textContent())?.includes('2 sections with exact occurrence evidence') === true);
    check('D5C5-12 every known presence cell returns to its exact current section',
      await page.locator('[data-work-theme] a.fs-themecell[data-return-to]').count() === 3);

    await page.locator('[data-work-theme] details').filter({hasText:'Rename'}).first().locator('summary').click();
    const rename = page.locator('[data-work-theme] details').filter({hasText:'Rename'}).first().locator('input[name="label"]');
    await rename.fill('River as return');
    await rename.press('Enter');
    await page.waitForFunction(() => document.querySelector('[data-work-theme] .fs-themetitle')?.textContent === 'River as return');
    const [frozen] = await q(`SELECT observations->0->>'themeLabel' label FROM developmental_readings WHERE id=$1`,[RID]);
    check('D5C5-13 rename changes governed label without rewriting frozen MAIA label',
      frozen?.label === LABEL && (await page.locator('[data-work-theme] .fs-themetitle').textContent()) === 'River as return');
    await page.getByRole('button',{name:'Not a theme in my book'}).first().click();
    await page.waitForSelector('[data-work-theme][data-theme-standing="rejected"]');
    check('D5C5-14 rejection is durable set-aside, not deletion',
      await page.locator('[data-work-theme][data-theme-standing="rejected"]').count() === 1
      && (await q(`SELECT count(*)::int n FROM writer_studio_work_theme_occurrences WHERE theme_id=$1`,[stored?.id]))[0]?.n === 4);

    await page.getByRole('button',{name:'Restore theme'}).click();
    await page.waitForSelector('[data-work-theme][data-theme-standing="accepted"]');
    const [restored] = await q(`SELECT t.id,
      (SELECT e.event_type FROM writer_studio_work_theme_events e
        WHERE e.theme_id=t.id ORDER BY e.id DESC LIMIT 1) latest_event
      FROM writer_studio_work_themes t WHERE t.id=$1`,[stored?.id]);
    check('D5C5-15 restore returns the same durable identity',
      restored?.id === stored?.id && restored?.latest_event === 'restore');

    await page.screenshot({path:join(OUT,'01-themes-live.png'),fullPage:false});

    await page.locator('.fs-themeintro details').filter({hasText:'Name a theme yourself'}).locator('summary').click();
    const declared = page.locator('.fs-themeintro input[name="label"]');
    await declared.fill('Homecoming');
    await declared.press('Enter');
    await page.waitForFunction(() => [...document.querySelectorAll('.fs-themetitle')].some((n) => n.textContent === 'Homecoming'));
    const declaredCard = page.locator('[data-work-theme]').filter({hasText:'Homecoming'});
    check('D5C5-16 member-declared Theme is real without invented presence bars',
      await declaredCard.count() === 1
      && await declaredCard.locator('.fs-themecellbar').count() === 0
      && (await declaredCard.textContent())?.includes('no admitted occurrence evidence yet') === true);

    check('D5C5-17 Read for themes remains a separate deliberate act',
      await page.getByRole('button',{name:'Read for themes'}).count() === 1 && readingPosts === before);

    await page.screenshot({path:join(OUT,'01-themes-live.png'),fullPage:false});
    const visual = await page.locator('.fs-root').evaluate((node) => {
      const style = getComputedStyle(node);
      return {display:style.display,columns:style.gridTemplateColumns,background:style.backgroundColor};
    });
    check('D5C5-18 flagship visual system remains live in Themes',
      visual.display === 'grid' && visual.columns.split(' ').length >= 2, JSON.stringify(visual));
  } finally {
    await browser.close();
    await pg.end();
  }

  console.log(`\nD5C5 RESULT — ${pass} passed · ${fail} failed · screenshot ${OUT}\n`);
  process.exit(fail===0?0:1);
}
main().catch(async(e)=>{
  console.error(e);
  await pg.end().catch(()=>{});
  process.exit(2);
});
