/**
 * FLAGSHIP-RUNTIME-CONVERGENCE-01 / R1-2 — LIVE REVIEW → MANUSCRIPT SECTION RETURN WALK (W1–W8).
 *
 *   DATABASE_URL=<shadow> WITNESS_PORT=<running next dev> PROVIDER_HITS=<counter log> \
 *     npx tsx scripts/witness/flagship/r1-2-live-return-walk.ts
 *
 * Real browser · real /writers-studio/rebuild · real authenticated session · real rows in a disposable
 * full-schema shadow. Readings are SEEDED directly (never through the commission route). The witness
 * next dev points its provider base URL at a counter that must stay at 0.
 * ⚠️ CANDIDATE EVIDENCE — ⛔ not production, ⛔ not a member walk. Identifiers, counts, short witness
 * strings only. ⛔ Never point this at production: it seeds and deletes rows.
 */
import { mkdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { Client } from 'pg';
import { chromium, type Page, type Request } from 'playwright';

const DSN = process.env.DATABASE_URL ?? '';
const PORT = Number(process.env.WITNESS_PORT ?? '3499');
const HITS = process.env.PROVIDER_HITS ?? '/tmp/r1-2-provider-hits.log';
const OUT = join(process.cwd(), 'docs/design/contracts/screenshots/flagship-r1-2');
if (!DSN) { console.log('NO EVIDENCE — DATABASE_URL not set'); process.exit(2); }
if (/soullab\.life|minisforum|192\.168\.0\.104|maia_consciousness/.test(DSN)) { console.log('REFUSED — production-looking DATABASE_URL'); process.exit(2); }

let pass = 0, fail = 0;
const ok = (s: string, d = '') => { pass++; console.log(`  PASS  ${s}${d ? `  — ${d}` : ''}`); };
const bad = (s: string, d: string) => { fail++; console.log(`  FAIL  ${s}\n        ${d}`); };
const check = (s: string, cond: boolean, d: string) => (cond ? ok(s, d) : bad(s, d));
const sha = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');
const cp = (s: string) => [...s].length;

const pg = new Client({ connectionString: DSN });
const q = async (s: string, p: unknown[] = []) => (await pg.query(s, p)).rows as Record<string, unknown>[];

/* member M owns Work A (two chapter sections); one reading whose finding returns to the SECOND section (d2), opened while focus is the FIRST */
const M = randomUUID(), TOKEN = `r12-${randomUUID()}`;
const A = { lw: randomUUID(), wk: randomUUID(), s1: randomUUID(), s2: randomUUID(), dr: randomUUID(), d1: randomUUID(), d2: randomUUID() };
const R = { current: randomUUID() };
const H1 = 'Chapter 1', H2 = 'The river at dusk';
const B1 = 'The water held the last of the light.';
const B2 = 'Nothing moved on the far bank. She waited for the sound to come back.';
const T1 = `${H1}\n\n${B1}`, T2 = `${H2}\n\n${B2}`;

async function seed() {
  await q(`INSERT INTO members (id,passkey,username,password_hash,name) VALUES ($1,$2,$3,'x','R1-2 walk')`, [M, `SOULLAB-R12-${M.slice(0, 8)}`, `r12-${M.slice(0, 8)}`]);
  await q(`INSERT INTO auth_sessions (member_id,session_token,expires_at) VALUES ($1,$2,NOW() + INTERVAL '2 hours')`, [M, TOKEN]);
  await q(`INSERT INTO living_works (id,member_id,title) VALUES ($1,$2,'The River Between')`, [A.lw, M]);
  await q(`INSERT INTO member_manuscripts (id,member_id,title) VALUES ($1,$2,'The River Between')`, [A.wk, M]);
  await q(`INSERT INTO living_work_expressions (living_work_id,expression_type,expression_id,declared_by) VALUES ($1,'manuscript',$2,$3)`, [A.lw, A.wk, M]);
  await q(`INSERT INTO manuscript_sections (id,manuscript_id,position,heading,heading_depth,heading_signal,body) VALUES ($1,$2,1,$3,1,'chapter',$4),($5,$2,2,$6,2,'markdown',$7)`, [A.s1, A.wk, H1, B1, A.s2, H2, B2]);
  await q(`INSERT INTO manuscript_working_drafts (id,manuscript_id,member_id,content,base_source_hash,revision_count) VALUES ($1,$2,$3,'','sha-r12',2)`, [A.dr, A.wk, M]);
  await q(`INSERT INTO manuscript_draft_sections (id,draft_id,position,text,source_section_id) VALUES ($1,$2,1,$3,$4),($5,$2,2,$6,$7)`, [A.d1, A.dr, T1, A.s1, A.d2, T2, A.s2]);
  await q(`UPDATE manuscript_working_drafts SET content=$2, section_addressable_at=NOW() WHERE id=$1`, [A.dr, T1 + T2]);
  const topo = [{ id: A.d1, text: T1 }, { id: A.d2, text: T2 }];
  const sections = Object.fromEntries(topo.map((t) => [t.id, { revisionNumber: 1, range: { start: 0, end: cp(t.text) }, digest: sha(t.text) }]));
  const readState = { draftId: A.dr, revisionNumber: 1, revisionDigest: sha(T1 + T2), sectionTopology: topo.map((t) => t.id), sections, inputFingerprint: sha(`r1-2:${R.current}`) };
  const obs = [{ key: 'o1', observationId: `dobs_${R.current}`, admissionIndex: 0, basisFingerprint: sha(`basis:${R.current}`),
    position: { sectionPosition: 1, codePointStart: 0 }, lens: 'continuity', phenomenon: 'recurrence', evidenceRefs: [{ kind: 'section', sectionId: A.d2 }],
    observation: 'The far bank is where the chapter keeps returning.', doesNotEstablish: ['author-intent', 'editorial-consequence'], structureDependency: { kind: 'independent' } }];
  await q(`INSERT INTO developmental_readings (id,manuscript_id,member_id,draft_id,revision_number,commissioned_lens,scope,read_state,coverage,input_fingerprint,outcome,observations,reader_provenance,classifier_provenance,frozen_at)
           VALUES ($1,$2,$3,$4,1,'continuity',$5,$6,$7,$8,'reading',$9,$10,$11,'2026-09-22T12:00:00.000Z')`,
    [R.current, A.wk, M, A.dr, JSON.stringify({ commissionedLens: 'continuity', bodyScope: topo.map((t) => t.id), withStructure: false }), JSON.stringify(readState),
      JSON.stringify({ sections: Object.fromEntries(topo.map((t) => [t.id, 'body'])) }), readState.inputFingerprint, JSON.stringify(obs),
      JSON.stringify({ provider: 'witness', model: 'seeded-no-provider', promptHash: 'r1-2', readerVersion: 'DEVELOPMENTAL-READER-01' }),
      JSON.stringify({ provider: 'witness', model: 'seeded-no-provider', promptHash: 'r1-2', classifierVersion: 'CLASSIFIER-01' })]);
}
async function cleanup() {
  for (const [sql, p] of [
    [`DELETE FROM developmental_readings WHERE member_id = $1`, [M]], [`DELETE FROM manuscript_working_drafts WHERE member_id = $1`, [M]],
    [`DELETE FROM manuscript_sections WHERE manuscript_id = $1`, [A.wk]], [`DELETE FROM living_work_expressions WHERE living_work_id = $1`, [A.lw]],
    [`DELETE FROM member_manuscripts WHERE id = $1`, [A.wk]], [`DELETE FROM living_works WHERE id = $1`, [A.lw]],
    [`DELETE FROM auth_sessions WHERE member_id = $1`, [M]], [`DELETE FROM members WHERE id = $1`, [M]],
  ] as [string, unknown[]][]) await q(sql, p).catch(() => {});
}
/** Member-scoped digest across every table Review could touch (the R1-0 witness set). */
async function memberDigest() {
  const r = await q(`WITH rows AS (
    SELECT 'member' k, id::text i, to_jsonb(m) d FROM members m WHERE id=$1
    UNION ALL SELECT 'session', id::text, to_jsonb(s) FROM auth_sessions s WHERE member_id=$1
    UNION ALL SELECT 'manuscript', id::text, to_jsonb(m) FROM member_manuscripts m WHERE member_id=$1
    UNION ALL SELECT 'draft', id::text, to_jsonb(d) FROM manuscript_working_drafts d WHERE member_id=$1
    UNION ALL SELECT 'draft-section', s.id::text, to_jsonb(s) FROM manuscript_draft_sections s JOIN manuscript_working_drafts d ON d.id=s.draft_id WHERE d.member_id=$1
    UNION ALL SELECT 'revision', r.id::text, to_jsonb(r) FROM working_draft_revisions r JOIN manuscript_working_drafts d ON d.id=r.draft_id WHERE d.member_id=$1
    UNION ALL SELECT 'reading', id::text, to_jsonb(r) FROM developmental_readings r WHERE member_id=$1
    UNION ALL SELECT 'standing', id::text, to_jsonb(e) FROM developmental_observation_standing_events e WHERE member_id=$1
    UNION ALL SELECT 'keep', id::text, to_jsonb(k) FROM manuscript_keeps k WHERE member_id=$1
  ) SELECT md5(COALESCE(jsonb_agg(jsonb_build_object('k',k,'i',i,'d',d) ORDER BY k,i)::text,'[]')) digest FROM rows`, [M]);
  return String(r[0]?.['digest']);
}
const hits = () => (existsSync(HITS) ? readFileSync(HITS, 'utf8').split('\n').filter(Boolean).length : 0);
const FORBIDDEN_SEL = '[data-action="discuss"], [data-action="explore"], [data-commission], .fs-facet, [data-facet], button[data-return-to], [data-return-to="coverage"], [data-return-to="previous-reading"], [data-return-to="full-manuscript"], [data-return-to="context"], [data-return-to=""], [disabled], [aria-disabled]';

async function main() {
  mkdirSync(OUT, { recursive: true });
  await pg.connect();
  const dbn = String((await q('SELECT current_database() d'))[0]!['d']);
  if (!/shadow|witness/.test(dbn)) { console.log(`REFUSED — '${dbn}' is not a shadow/witness database`); process.exit(2); }
  await seed();
  console.log(`\n── R1-2 LIVE RETURN WALK · work=${A.wk} · reading=${R.current} · finding returns to d2=${A.d2} · opened at d1=${A.d1} ──\n`);
  const hits0 = hits();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addCookies([{ name: 'maia_session', value: TOKEN, domain: '127.0.0.1', path: '/' }]);
  const page: Page = await ctx.newPage();
  const reqs: { t: number; m: string; u: string }[] = [];
  page.on('request', (r: Request) => { if (/\/api\//.test(r.url())) reqs.push({ t: Date.now(), m: r.method(), u: r.url() }); });
  const short = (u: string) => u.replace(/^https?:\/\/[^/]+/, '').replace(A.wk, '<A>').replace(R.current, '<current>');
  const readingsSince = (t: number) => reqs.filter((r) => r.t >= t && /\/readings/.test(r.u)).map((r) => `${r.m} ${short(r.u)}`);
  const open = async (query: string, waitFor: string) => { const t = Date.now(); await page.goto(`http://127.0.0.1:${PORT}/writers-studio/rebuild?${query}`, { waitUntil: 'domcontentloaded', timeout: 240_000 }); await page.waitForSelector(waitFor, { timeout: 240_000 }); await page.waitForTimeout(500); return t; };
  const urlState = () => { const u = new URL(page.url()); return { m: u.searchParams.get('m'), s: u.searchParams.get('s'), reading: u.searchParams.get('reading'), keys: [...u.searchParams.keys()].sort().join(','), path: u.pathname }; };
  const arrivedWrite = async () => ({ bodies: await page.locator('[data-authored-body]').count(), review: await page.locator('[data-review]').count(), held: await page.locator('[data-held-passage-address]').count(), focusedBody: await page.locator(`[data-authored-body="${A.d2}"]`).count() });

  try {
    const digest0 = await memberDigest();
    check('W5a member-scoped digest captured before the cycle', digest0.length === 32, digest0);

    /* ── W1 · finding return (opened at d1; the finding's durable address is d2) ── */
    const t1 = await open(`m=${A.wk}&s=${A.d1}&reading=${R.current}`, '[data-review="ready"]');
    await page.screenshot({ path: join(OUT, 'w1-review-with-return.png') });
    const returnAnchors = await page.locator(`.fs-find a[data-return-to="${A.d2}"][href]`).count();
    const footAnchor = await page.locator(`.fs-contextfoot a[data-return-to="${A.d2}"][href]`).count();
    const href1 = await page.locator(`.fs-find a[data-return-to="${A.d2}"]`).first().getAttribute('href');
    check('W7 capability census in mounted read-only Review: navigate present as exact-address locations; every other capability absent',
      returnAnchors === 1 && footAnchor === 1 && (await page.locator(FORBIDDEN_SEL).count()) === 0 && !/Ask MAIA|What MAIA read|Open the full manuscript/.test(await page.locator('[data-review="ready"]').innerHTML())
      && (await page.locator('a[data-return-to]').count()) === 2 && (await page.locator('[data-return-to]').evaluateAll((els, d2) => els.every((e) => e.getAttribute('data-return-to') === d2), A.d2)),
      `findingAnchor=${returnAnchors} contextFootAnchor=${footAnchor} forbidden=${await page.locator(FORBIDDEN_SEL).count()} anchors=${await page.locator('a[data-return-to]').count()}`);
    check('W1 the return location is composed from the durable address: same Work, s=<d2>, no reading, no new vocabulary', !!href1 && href1.includes(`m=${A.wk}`) && href1.includes(`s=${A.d2}`) && !/reading=|passage=|range=|highlight=|selection=/.test(href1), `href=${(href1 ?? '').replace(A.wk, '<A>').replace(A.d2, '<d2>')}`);
    const tGo = Date.now();
    await page.locator(`.fs-find a[data-return-to="${A.d2}"]`).click();
    await page.waitForSelector(`[data-authored-body="${A.d2}"]`, { timeout: 60_000 }); await page.waitForTimeout(500);
    const u1 = urlState(); const w1 = await arrivedWrite();
    await page.screenshot({ path: join(OUT, 'w1-arrived-write.png') });
    check('W1 finding return: same Work · reading removed · s = exact returnTo section · plain Write mounts · no Review · no held passage · no reading GET',
      u1.m === A.wk && u1.s === A.d2 && u1.reading === null && u1.keys === 'm,s' && u1.path === '/writers-studio/rebuild' && w1.bodies === 2 && w1.review === 0 && w1.held === 0 && w1.focusedBody === 1
      && readingsSince(tGo).length === 0 && (await page.locator('.fs-trail, [data-arrived-from], .fs-banner').count()) === 0,
      `url=${JSON.stringify(u1).replace(A.wk, '<A>').replace(A.d2, '<d2>')} arrived=${JSON.stringify(w1)} readingGETs=${readingsSince(tGo).length}`);

    /* ── W4 · browser Back restores the exact prior Review through ordinary history ── */
    const tBack = Date.now();
    await page.goBack({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-review="ready"]', { timeout: 60_000 }); await page.waitForTimeout(400);
    const u4 = urlState();
    /* The law: the exact prior URL and reading identity return, and the R1-1B loader remounts THAT reading — ledger GET, then the
     * `<current>` reading GET, no other reading identity, nothing but GETs. ⚠️ OBSERVED, ⛔ not a law: Back changes `s` and
     * `reading` in one popstate, so the Write host's context reload (inherited R1-1B: the Review effect keys on `context`
     * identity) re-commissions the same read once more; the generation guard attaches only the latest. Recorded as
     * `loaderPasses`, routed out, ⛔ not repaired here (the host's load law is outside R1-2's population). */
    const back = readingsSince(tBack);
    const ledgerGETs = back.filter((r) => r === 'GET /api/sovereign/manuscripts/<A>/readings');
    const currentGETs = back.filter((r) => r === 'GET /api/sovereign/manuscripts/<A>/readings/<current>');
    check('W4 browser Back: the prior exact Review URL and reading identity return through ordinary history; R1-1B remounts it (ledger → reading, the same reading only)',
      u4.reading === R.current && u4.m === A.wk && u4.s === A.d1 && u4.keys === 'm,reading,s' && (await page.locator('[data-review="ready"]').getAttribute('data-review-reading')) === R.current
      && back.length > 0 && back[0] === 'GET /api/sovereign/manuscripts/<A>/readings' && ledgerGETs.length >= 1 && currentGETs.length >= 1
      && ledgerGETs.length + currentGETs.length === back.length && back.indexOf(currentGETs[0]) > 0,
      `url=${JSON.stringify(u4).replace(A.wk, '<A>').replace(A.d1, '<d1>').replace(R.current, '<current>')} loaderPasses=${currentGETs.length} trace=${back.join(' | ')}`);

    /* ── W1b · the context pane's own Go to passage (the selected finding's exact section) ── */
    const tFoot = Date.now();
    await page.locator(`.fs-contextfoot a[data-return-to="${A.d2}"]`).click();
    await page.waitForSelector(`[data-authored-body="${A.d2}"]`, { timeout: 60_000 }); await page.waitForTimeout(400);
    const u1b = urlState(); const w1b = await arrivedWrite();
    check('W1b context-pane return: identical law — same Work, reading removed, s = exact section, plain Write, no held passage', u1b.m === A.wk && u1b.s === A.d2 && u1b.reading === null && u1b.keys === 'm,s' && w1b.review === 0 && w1b.held === 0 && w1b.focusedBody === 1 && readingsSince(tFoot).length === 0, `url=${JSON.stringify(u1b).replace(A.wk, '<A>').replace(A.d2, '<d2>')}`);

    /* ── W2 · coverage line: no section address exists → lawfully absent, never a guess ── */
    await open(`m=${A.wk}&s=${A.d1}&reading=${R.current}`, '[data-review="ready"]');
    const covControls = await page.locator('[data-return-to="coverage"], .fs-goto').count();
    check('W2 coverage-line navigation: the live coverage line carries NO section address (its control names "coverage"), so it is ABSENT under live navigation — no derived target', covControls === 0 && (await page.locator('[data-coverage="true"]').count()) === 1, `coverageLine=${await page.locator('[data-coverage="true"]').count()} coverageControls=${covControls}`);
    /* ── W3 · continuity map: the real mapper builds no map for real readings → NOT WITNESSABLE live; the cell law is proved in the suite (L9/L10) ── */
    const cells = await page.locator('.fs-cell').count();
    check('W3 continuity-map navigation: NOT WITNESSABLE on the live runtime — the R1-0 mapper builds no continuity map for real readings (0 cells); the exact-address cell law is proved at presentation level (R1-2-L9/L10), ⛔ not claimed live', cells === 0, `cells=${cells}`);

    /* ── W8 · mobile ── */
    const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await mctx.addCookies([{ name: 'maia_session', value: TOKEN, domain: '127.0.0.1', path: '/' }]);
    const mpage = await mctx.newPage();
    await mpage.goto(`http://127.0.0.1:${PORT}/writers-studio/rebuild?m=${A.wk}&s=${A.d1}&reading=${R.current}`, { waitUntil: 'domcontentloaded', timeout: 240_000 });
    await mpage.waitForSelector('[data-review="ready"]', { timeout: 240_000 }); await mpage.waitForTimeout(400);
    await mpage.screenshot({ path: join(OUT, 'w8-mobile-review.png') });
    const mAnchors = await mpage.locator(`a[data-return-to="${A.d2}"][href]`).count();
    await mpage.locator(`.fs-find a[data-return-to="${A.d2}"]`).first().click();
    await mpage.waitForSelector(`[data-authored-body="${A.d2}"]`, { timeout: 60_000 }); await mpage.waitForTimeout(400);
    const mu = new URL(mpage.url());
    await mpage.screenshot({ path: join(OUT, 'w8-mobile-arrived.png') });
    check('W8 mobile: the same exact-address return controls, the same law on arrival', mAnchors >= 1 && mu.searchParams.get('s') === A.d2 && mu.searchParams.get('reading') === null && mu.searchParams.get('m') === A.wk && (await mpage.locator('[data-review], [data-held-passage-address]').count()) === 0, `anchors=${mAnchors} s=<d2>=${mu.searchParams.get('s') === A.d2}`);
    await mctx.close();

    /* ── W5 · zero write · W6 · zero cognition ── */
    const digest1 = await memberDigest();
    const nonGet = reqs.filter((r) => r.m !== 'GET');
    check('W5b member-scoped database state byte-identical across Review → return → Write → Back → return → mobile', digest0 === digest1, `${digest0.slice(0, 12)} → ${digest1.slice(0, 12)}`);
    check('W6 zero model/provider commissioning and zero non-GET requests over the whole walk', hits() === hits0 && nonGet.length === 0, `providerHits=${hits() - hits0} nonGet=${nonGet.length}`);
    console.log('\n  /readings traffic, whole walk (desktop):'); for (const r of reqs.filter((x) => /\/readings/.test(x.u))) console.log(`    ${r.m} ${short(r.u)}`);
  } finally {
    await browser.close();
    await cleanup();
    await pg.end();
  }
  console.log(`\n  ${pass} passed · ${fail} failed · screenshots ${OUT}\n`);
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(async (e) => { console.error(e); await cleanup().catch(() => {}); await pg.end().catch(() => {}); process.exit(2); });
