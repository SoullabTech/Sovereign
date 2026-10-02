/**
 * FLAGSHIP-RUNTIME-CONVERGENCE-01 / R2-2 — isolated live Review Discuss witness.
 * Synthetic member + Work only. Refuses every DB except maia_consciousness_test.
 */
import { createHash, randomUUID } from 'node:crypto';
import { Client } from 'pg';
import { chromium, type Request } from 'playwright';

const DSN = process.env.DATABASE_URL ?? '';
const PORT = Number(process.env.WITNESS_PORT ?? '3499');
if (!DSN || !/\/maia_consciousness_test(?:\?|$)/.test(DSN)) {
  console.error('REFUSED — R2-2 witness requires maia_consciousness_test');
  process.exit(2);
}

const sha = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');
const cp = (s: string) => [...s].length;
const pg = new Client({ connectionString: DSN });
const q = async <T extends Record<string, unknown> = Record<string, unknown>>(sql: string, params: unknown[] = []) =>
  (await pg.query<T>(sql, params)).rows;

let pass = 0;
let fail = 0;
const check = (name: string, ok: boolean, detail = '') => {
  if (ok) { pass += 1; console.log(`  PASS  ${name}${detail ? ` — ${detail}` : ''}`); }
  else { fail += 1; console.log(`  FAIL  ${name}\n        ${detail}`); }
};

const M = randomUUID();
const TOKEN = `r22-${randomUUID()}`;
const WK = randomUUID();
const SRC = randomUUID();
const DR = randomUUID();
const DS = randomUUID();
const R = randomUUID();
const HEADING = 'The River at Dusk';
const BODY = 'Nothing moved on the far bank. She waited for the sound to come back.';
const TEXT = `${HEADING}\n\n${BODY}`;
const OBS = 'The far bank is where this passage keeps returning.';

async function seed() {
  const readState = {
    draftId: DR,
    revisionNumber: 1,
    revisionDigest: sha(TEXT),
    sectionTopology: [DS],
    sections: {
      [DS]: {
        revisionNumber: 1,
        range: { start: 0, end: cp(TEXT) },
        digest: sha(TEXT),
      },
    },
    inputFingerprint: sha(`r2-2:${R}`),
  };
  const observation = {
    key: 'o1',
    observationId: `dobs_${R}`,
    admissionIndex: 0,
    basisFingerprint: sha(`basis:${R}`),
    position: { sectionPosition: 0, codePointStart: 0 },
    lens: 'continuity',
    phenomenon: 'recurrence',
    evidenceRefs: [{ kind: 'section', sectionId: DS }],
    observation: OBS,
    doesNotEstablish: ['author-intent', 'editorial-consequence'],
    structureDependency: { kind: 'independent' },
  };
  const scope = { commissionedLens: 'continuity', bodyScope: [DS], withStructure: false };
  const coverage = { sections: { [DS]: 'body' } };
  const reader = {
    provider: 'witness',
    model: 'seeded-no-provider',
    promptHash: 'r2-2',
    readerVersion: 'DEVELOPMENTAL-READER-01',
  };
  const classifier = {
    provider: 'witness',
    model: 'seeded-no-provider',
    promptHash: 'r2-2',
    classifierVersion: 'CLASSIFIER-01',
  };

  await q(`INSERT INTO members (id,passkey,username,password_hash,name,onboarded,onboarding_step,tester)
           VALUES ($1,$2,$3,'x','R2-2 founder witness',true,'complete',true)`,
    [M, `SOULLAB-R22-${M.slice(0,8)}`, `r22-${M.slice(0,8)}`]);
  await q(`INSERT INTO auth_sessions (member_id,session_token,expires_at,user_agent)
           VALUES ($1,$2,NOW() + INTERVAL '2 hours','r2-2-witness')`, [M, TOKEN]);
  await q(`INSERT INTO member_manuscripts (id,member_id,title) VALUES ($1,$2,$3)`, [WK, M, 'R2-2 River Witness']);
  await q(`INSERT INTO manuscript_sections (id,manuscript_id,position,heading,heading_depth,heading_signal,body)
           VALUES ($1,$2,0,$3,1,'chapter',$4)`, [SRC, WK, HEADING, BODY]);
  await q(`INSERT INTO manuscript_working_drafts
           (id,manuscript_id,member_id,content,base_source_hash,revision_count)
           VALUES ($1,$2,$3,$4,$5,1)`, [DR, WK, M, TEXT, sha(TEXT)]);
  await q(`INSERT INTO manuscript_draft_sections (id,draft_id,position,text,source_section_id)
           VALUES ($1,$2,0,$3,$4)`, [DS, DR, TEXT, SRC]);
  await q(`UPDATE manuscript_working_drafts SET section_addressable_at=NOW() WHERE id=$1`, [DR]);
  await q(`INSERT INTO working_draft_revisions
           (draft_id,revision_number,content,saved_by,note,section_partition)
           VALUES ($1,1,$2,$3,'R2-2 witness',$4::jsonb)`,
    [DR, TEXT, M, JSON.stringify([{ sectionId: DS, start: 0, end: cp(TEXT) }])]);
  await q(`INSERT INTO developmental_readings
           (id,manuscript_id,member_id,draft_id,revision_number,commissioned_lens,scope,read_state,coverage,
            input_fingerprint,outcome,observations,reader_provenance,classifier_provenance,frozen_at)
           VALUES ($1,$2,$3,$4,1,'continuity',$5::jsonb,$6::jsonb,$7::jsonb,$8,'reading',$9::jsonb,$10::jsonb,$11::jsonb,NOW())`,
    [R, WK, M, DR, JSON.stringify(scope), JSON.stringify(readState), JSON.stringify(coverage),
     readState.inputFingerprint, JSON.stringify([observation]), JSON.stringify(reader), JSON.stringify(classifier)]);
}

async function counts() {
  const [row] = await q<{threads:string; turns:string; acts:string; consumes:string; receipts:string}>(`
    SELECT
      (SELECT count(*)::text FROM ask_threads WHERE member_id=$1 AND manuscript_id=$2) threads,
      (SELECT count(*)::text FROM ask_turns t JOIN ask_threads h ON h.id=t.thread_id WHERE h.member_id=$1 AND h.manuscript_id=$2) turns,
      (SELECT count(*)::text FROM ask_authorization_acts WHERE member_id=$1 AND manuscript_id=$2) acts,
      (SELECT count(*)::text FROM ask_authorization_consumptions c JOIN ask_authorization_acts a ON a.id=c.act_id WHERE a.member_id=$1 AND a.manuscript_id=$2) consumes,
      (SELECT count(*)::text FROM context_disclosure_receipts WHERE member_id=$1::text AND source_ref=$2::text) receipts
  `, [M, WK]);
  return Object.fromEntries(Object.entries(row).map(([k,v]) => [k, Number(v)])) as Record<string, number>;
}

async function workFingerprint() {
  const [r] = await q<{digest:string}>(`
    SELECT md5(jsonb_build_object(
      'draft',(SELECT to_jsonb(d) FROM manuscript_working_drafts d WHERE d.id=$1),
      'sections',(SELECT jsonb_agg(to_jsonb(s) ORDER BY s.position) FROM manuscript_draft_sections s WHERE s.draft_id=$1),
      'revisions',(SELECT jsonb_agg(to_jsonb(v) ORDER BY v.revision_number) FROM working_draft_revisions v WHERE v.draft_id=$1),
      'reading',(SELECT to_jsonb(x) FROM developmental_readings x WHERE x.id=$2)
    )::text) digest
  `, [DR, R]);
  return String(r?.digest ?? '');
}

async function main() {
  await pg.connect();
  const [who] = await q<{d:string;u:string}>('SELECT current_database() d,current_user u');
  if (who?.d !== 'maia_consciousness_test' || who?.u !== 'maia_test_user') {
    throw new Error(`wrong DB identity: ${who?.d}/${who?.u}`);
  }
  await seed();
  const beforeWork = await workFingerprint();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await ctx.addCookies([{ name: 'maia_session', value: TOKEN, url: `http://localhost:${PORT}` }]);
  const page = await ctx.newPage();
  const calls: string[] = [];
  page.on('request', (req: Request) => {
    if (req.url().includes('/review-discuss')) calls.push(`${req.method()} ${req.url()}`);
  });

  try {
    await page.goto(`http://localhost:${PORT}/writers-studio/rebuild?m=${WK}&s=${DS}&reading=${R}`,
      { waitUntil: 'domcontentloaded', timeout: 240_000 });
    await page.waitForSelector('[data-review="ready"]', { timeout: 240_000 });
    check('mounted exact durable reading', await page.locator('[data-review="ready"]').getAttribute('data-review-reading') === R);
    check('real Discuss control visible', await page.locator('button[data-action="discuss"]').count() === 1);

    // Unresolved posture: client must not make a request.
    await page.evaluate(() => localStorage.removeItem('maia_settings'));
    const calls0 = calls.length;
    await page.locator('button[data-action="discuss"]').click();
    await page.locator('[data-review-discussion="composing"] textarea[name="ask"]').fill('What did you notice here?');
    await page.locator('[data-review-discussion="composing"] button[type="submit"]').click();
    await page.waitForSelector('[data-review-discussion="refused"]');
    check('unresolved posture makes zero network request', calls.length === calls0, `requests=${calls.length-calls0}`);
    check('unresolved posture makes zero persistence', Object.values(await counts()).every((n) => n === 0), JSON.stringify(await counts()));

    // Sanctuary on: request reaches server but must refuse before persistence.
    await page.locator('[data-review-discussion="refused"] button').click();
    await page.evaluate(() => localStorage.setItem('maia_settings', JSON.stringify({ sanctuary: true })));
    const calls1 = calls.length;
    await page.locator('button[data-action="discuss"]').click();
    await page.locator('[data-review-discussion="composing"] textarea[name="ask"]').fill('Stay with this observation.');
    await page.locator('[data-review-discussion="composing"] button[type="submit"]').click();
    await page.waitForSelector('[data-review-discussion="refused"]');
    check('Sanctuary sends one explicit refusal request', calls.length === calls1 + 1, `requests=${calls.length-calls1}`);
    const sanctuaryCounts = await counts();
    check('Sanctuary refusal persists nothing', Object.values(sanctuaryCounts).every((n) => n === 0), JSON.stringify(sanctuaryCounts));

    // Sanctuary off: one real history-empty AS_READ act.
    await page.locator('[data-review-discussion="refused"] button').click();
    await page.evaluate(() => localStorage.setItem('maia_settings', JSON.stringify({ sanctuary: false })));
    await page.locator('button[data-action="discuss"]').click();
    await page.locator('[data-review-discussion="composing"] textarea[name="ask"]').fill(
      'What were you seeing in the far-bank image when you made this observation?'
    );
    await page.locator('[data-review-discussion="composing"] button[type="submit"]').click();
    await page.waitForSelector('[data-review-discussion="answered"]', { timeout: 180_000 });
    const answer = (await page.locator('[data-review-discussion="answered"] .fs-say').textContent())?.trim() ?? '';
    check('MAIA answers in place', answer.length > 40, `chars=${answer.length}`);
    check('answer declares AS_READ posture', await page.locator('[data-review-discussion="answered"]').getAttribute('data-posture') === 'AS_READ');

    const finalCounts = await counts();
    check('one persisted thread', finalCounts.threads === 1, JSON.stringify(finalCounts));
    check('exactly two turns', finalCounts.turns === 2, JSON.stringify(finalCounts));
    check('one authorization and one consumption', finalCounts.acts === 1 && finalCounts.consumes === 1, JSON.stringify(finalCounts));
    check('at least one crossed receipt', finalCounts.receipts >= 1, JSON.stringify(finalCounts));

    const [thread] = await q<{reading_identity:any;anchor:any}>(`
      SELECT reading_identity,anchor FROM ask_threads WHERE member_id=$1 AND manuscript_id=$2 ORDER BY opened_at DESC LIMIT 1
    `, [M, WK]);
    check('thread identity is review_discuss_r2_1',
      thread?.reading_identity?.kind === 'review_discuss_r2_1' &&
      thread?.reading_identity?.readingId === R &&
      thread?.reading_identity?.observationKey === 'o1',
      JSON.stringify(thread?.reading_identity));

    const [turn] = await q<{answer_provenance:any}>(`
      SELECT answer_provenance FROM ask_turns t JOIN ask_threads h ON h.id=t.thread_id
      WHERE h.member_id=$1 AND h.manuscript_id=$2 AND t.speaker='maia'
      ORDER BY t.turn_index DESC LIMIT 1
    `, [M, WK]);
    const prov = turn?.answer_provenance;
    check('server provenance names exact R2 object',
      prov?.provenanceAuthority === 'SERVER' &&
      prov?.posture === 'AS_READ' &&
      prov?.anchor?.readingId === R &&
      prov?.anchor?.observationKey === 'o1' &&
      prov?.historyPolicy === 'NONE' &&
      prov?.durableEffect === 'NONE' &&
      typeof prov?.cognitionInputFingerprint === 'string' &&
      prov.cognitionInputFingerprint.length === 64,
      JSON.stringify({ posture:prov?.posture, anchor:prov?.anchor, historyPolicy:prov?.historyPolicy, durableEffect:prov?.durableEffect }));

    const [receipt] = await q<{boundary:string;gesture:string;state:string}>(`
      SELECT boundary,gesture,state FROM context_disclosure_receipts
      WHERE member_id=$1 AND source_ref=$2::text ORDER BY attempted_at DESC LIMIT 1
    `, [M, WK]);
    check('receipt truthfully records Review Discuss crossing',
      receipt?.boundary === 'writers_studio.review_discuss->maia_cognition' &&
      receipt?.gesture === 'discuss_finding' &&
      receipt?.state === 'crossed',
      JSON.stringify(receipt));

    const afterWork = await workFingerprint();
    check('Work + reading byte-identical across discussion', beforeWork === afterWork, `${beforeWork} -> ${afterWork}`);
  } finally {
    await browser.close();
    await pg.end();
  }

  console.log(`\nR2-2 LIVE WITNESS: ${pass} passed · ${fail} failed`);
  console.log(`fixture: member=${M} manuscript=${WK} reading=${R}`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error(e);
  await pg.end().catch(() => {});
  process.exit(2);
});
