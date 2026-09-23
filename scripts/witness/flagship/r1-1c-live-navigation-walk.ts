/**
 * FLAGSHIP-RUNTIME-CONVERGENCE-01 / R1-1C — LIVE REVIEW NAVIGATION WALK (W1–W8).
 *
 *   DATABASE_URL=<shadow> WITNESS_PORT=<running next dev> PROVIDER_HITS=<counter log> \
 *     npx tsx scripts/witness/flagship/r1-1c-live-navigation-walk.ts
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
const HITS = process.env.PROVIDER_HITS ?? '/tmp/r1-1c-provider-hits.log';
const OUT = join(process.cwd(), 'docs/design/contracts/screenshots/flagship-r1-1c');
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

/* member M owns Work A (two chapter sections); readings: current · other · stale · none (no reading produced) */
const M = randomUUID(), TOKEN = `r11c-${randomUUID()}`;
const A = { lw: randomUUID(), wk: randomUUID(), s1: randomUUID(), s2: randomUUID(), dr: randomUUID(), d1: randomUUID(), d2: randomUUID() };
const R = { current: randomUUID(), other: randomUUID(), stale: randomUUID(), none: randomUUID(), unknown: randomUUID() };
const H1 = 'Chapter 1', H2 = 'The river at dusk';
const B1 = 'The water held the last of the light.';
const B2 = 'Nothing moved on the far bank. She waited for the sound to come back.';
const T1 = `${H1}\n\n${B1}`, T2 = `${H2}\n\n${B2}`;
const T2_OLD = `${H2}\n\nNothing moved on the near bank.`;

async function seedReading(args: { id: string; topology: { id: string; text: string }[]; obsAt: number | null; frozenAt: string; lens: string; text?: string }) {
  const sections = Object.fromEntries(args.topology.map((t) => [t.id, { revisionNumber: 1, range: { start: 0, end: cp(t.text) }, digest: sha(t.text) }]));
  const readState = { draftId: A.dr, revisionNumber: 1, revisionDigest: sha(args.topology.map((t) => t.text).join('')), sectionTopology: args.topology.map((t) => t.id), sections, inputFingerprint: sha(`r1-1c:${args.id}`) };
  const obs = args.obsAt === null ? [] : [{
    key: 'o1', observationId: `dobs_${args.id}`, admissionIndex: 0, basisFingerprint: sha(`basis:${args.id}`),
    position: { sectionPosition: args.obsAt, codePointStart: 0 }, lens: args.lens, phenomenon: 'recurrence',
    evidenceRefs: [{ kind: 'section', sectionId: args.topology[args.obsAt]!.id }],
    observation: args.text ?? 'The river returns here as a place of movement.',
    doesNotEstablish: ['author-intent', 'editorial-consequence'], structureDependency: { kind: 'independent' },
  }];
  const scope = { commissionedLens: args.lens, bodyScope: args.topology.map((t) => t.id), withStructure: false };
  const coverage = { sections: Object.fromEntries(args.topology.map((t) => [t.id, 'body'])) };
  const reader = { provider: 'witness', model: 'seeded-no-provider', promptHash: 'r1-1c', readerVersion: 'DEVELOPMENTAL-READER-01' };
  const classifier = { provider: 'witness', model: 'seeded-no-provider', promptHash: 'r1-1c', classifierVersion: 'CLASSIFIER-01' };
  await q(`INSERT INTO developmental_readings (id,manuscript_id,member_id,draft_id,revision_number,commissioned_lens,scope,read_state,coverage,input_fingerprint,outcome,observations,reader_provenance,classifier_provenance,frozen_at)
           VALUES ($1,$2,$3,$4,1,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
    [args.id, A.wk, M, A.dr, args.lens, JSON.stringify(scope), JSON.stringify(readState), JSON.stringify(coverage), readState.inputFingerprint,
      obs.length ? 'reading' : 'none', JSON.stringify(obs), JSON.stringify(reader), obs.length ? JSON.stringify(classifier) : null, args.frozenAt]);
}
async function seed() {
  await q(`INSERT INTO members (id,passkey,username,password_hash,name) VALUES ($1,$2,$3,'x','R1-1C walk')`, [M, `SOULLAB-R11C-${M.slice(0, 8)}`, `r11c-${M.slice(0, 8)}`]);
  await q(`INSERT INTO auth_sessions (member_id,session_token,expires_at) VALUES ($1,$2,NOW() + INTERVAL '2 hours')`, [M, TOKEN]);
  await q(`INSERT INTO living_works (id,member_id,title) VALUES ($1,$2,'The River Between')`, [A.lw, M]);
  await q(`INSERT INTO member_manuscripts (id,member_id,title) VALUES ($1,$2,'The River Between')`, [A.wk, M]);
  await q(`INSERT INTO living_work_expressions (living_work_id,expression_type,expression_id,declared_by) VALUES ($1,'manuscript',$2,$3)`, [A.lw, A.wk, M]);
  await q(`INSERT INTO manuscript_sections (id,manuscript_id,position,heading,heading_depth,heading_signal,body) VALUES ($1,$2,1,$3,1,'chapter',$4),($5,$2,2,$6,2,'markdown',$7)`, [A.s1, A.wk, H1, B1, A.s2, H2, B2]);
  await q(`INSERT INTO manuscript_working_drafts (id,manuscript_id,member_id,content,base_source_hash,revision_count) VALUES ($1,$2,$3,'','sha-r11c',2)`, [A.dr, A.wk, M]);
  await q(`INSERT INTO manuscript_draft_sections (id,draft_id,position,text,source_section_id) VALUES ($1,$2,1,$3,$4),($5,$2,2,$6,$7)`, [A.d1, A.dr, T1, A.s1, A.d2, T2, A.s2]);
  await q(`UPDATE manuscript_working_drafts SET content=$2, section_addressable_at=NOW() WHERE id=$1`, [A.dr, T1 + T2]);
  const topo = [{ id: A.d1, text: T1 }, { id: A.d2, text: T2 }];
  await seedReading({ id: R.current, topology: topo, obsAt: 1, frozenAt: '2026-09-22T12:00:00.000Z', lens: 'continuity', text: 'The far bank is where the chapter keeps returning.' });
  await seedReading({ id: R.other, topology: topo, obsAt: 0, frozenAt: '2026-09-22T13:00:00.000Z', lens: 'voice', text: 'The light at the opening is the first return.' });
  await seedReading({ id: R.stale, topology: [{ id: A.d1, text: T1 }, { id: A.d2, text: T2_OLD }], obsAt: 1, frozenAt: '2026-09-22T11:00:00.000Z', lens: 'arc' });
  await seedReading({ id: R.none, topology: topo, obsAt: null, frozenAt: '2026-09-22T10:00:00.000Z', lens: 'structure' });
}
async function cleanup() {
  for (const [sql, p] of [
    [`DELETE FROM developmental_readings WHERE member_id = $1`, [M]],
    [`DELETE FROM manuscript_working_drafts WHERE member_id = $1`, [M]],
    [`DELETE FROM manuscript_sections WHERE manuscript_id = $1`, [A.wk]],
    [`DELETE FROM living_work_expressions WHERE living_work_id = $1`, [A.lw]],
    [`DELETE FROM member_manuscripts WHERE id = $1`, [A.wk]],
    [`DELETE FROM living_works WHERE id = $1`, [A.lw]],
    [`DELETE FROM auth_sessions WHERE member_id = $1`, [M]],
    [`DELETE FROM members WHERE id = $1`, [M]],
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
/* R1-2 SUCCESSION (2026-09-23): return controls (data-return-to) are lawful locations under navigate=true; what this walk still refuses is every non-navigation control. */
const FORBIDDEN = /Ask MAIA|data-action="discuss"|data-action="explore"|data-commission=|Read for this|Read again|Read this chapter again|Read this Work|Not now|Add your own observation|Keep with this passage|fs-facet|data-facet=|\bdisabled\b|aria-disabled/;

async function main() {
  mkdirSync(OUT, { recursive: true });
  await pg.connect();
  const dbn = String((await q('SELECT current_database() d'))[0]!['d']);
  if (!/shadow|witness/.test(dbn)) { console.log(`REFUSED — '${dbn}' is not a shadow/witness database`); process.exit(2); }
  await seed();
  console.log(`\n── R1-1C LIVE NAVIGATION WALK · work=${A.wk} · current=${R.current} other=${R.other} stale=${R.stale} none=${R.none} ──\n`);
  const hits0 = hits();

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addCookies([{ name: 'maia_session', value: TOKEN, domain: '127.0.0.1', path: '/' }]);
  const page: Page = await ctx.newPage();
  const reqs: { t: number; m: string; u: string }[] = [];
  page.on('request', (r: Request) => { if (/\/api\//.test(r.url())) reqs.push({ t: Date.now(), m: r.method(), u: r.url() }); });
  const short = (u: string) => u.replace(/^https?:\/\/[^/]+/, '').replace(A.wk, '<A>').replace(R.current, '<current>').replace(R.other, '<other>').replace(R.stale, '<stale>').replace(R.none, '<none>').replace(R.unknown, '<unknown>');
  const readingsSince = (t: number) => reqs.filter((r) => r.t >= t && /\/readings/.test(r.u)).map((r) => `${r.m} ${short(r.u)}`);
  const open = async (query: string, waitFor: string) => { const t = Date.now(); await page.goto(`http://127.0.0.1:${PORT}/writers-studio/rebuild?${query}`, { waitUntil: 'domcontentloaded', timeout: 240_000 }); await page.waitForSelector(waitFor, { timeout: 240_000 }); await page.waitForTimeout(500); return t; };
  const nav = async () => ({
    navs: await page.locator('[data-nav]').count(),
    writeCurrent: await page.locator('span[data-nav="write"][data-affordance="orientation"][aria-current="page"]').count(),
    reviewCurrent: await page.locator('span[data-nav="review"][data-affordance="orientation"][aria-current="page"]').count(),
    reviewAct: await page.locator('button[data-nav="review"][data-affordance="navigate"]').count(),
    writeLink: await page.locator('a[data-nav="write"][data-affordance="navigate"]').count(),
    develop: await page.locator('[data-nav="develop"]').count(),
    legacy: await page.locator('a[href*="/writers-studio/review"], a[href*="/writers-studio/develop"]').count(),
    rail: await page.locator('.fs-rail [data-nav]').allTextContents(), mobile: await page.locator('.fs-mobilenav [data-nav]').allTextContents(),
  });
  const url = () => new URL(page.url());
  const urlState = () => { const u = url(); return { m: u.searchParams.get('m'), s: u.searchParams.get('s'), reading: u.searchParams.get('reading'), path: u.pathname }; };

  try {
    const digest0 = await memberDigest();
    check('W8a member-scoped digest captured before the whole cycle', digest0.length === 32, digest0);

    /* ── W1 · ordinary Write ─────────────────────────────────────────── */
    const t1 = await open(`m=${A.wk}&s=${A.d2}`, `[data-authored-body="${A.d2}"]`);
    const n1 = await nav();
    await page.screenshot({ path: join(OUT, 'w1-write.png') });
    check('W1 ordinary Write mounts with Write current and Review visible; zero reading GETs; existing Write intact',
      (await page.locator('[data-authored-body]').count()) === 2 && (await page.locator('[data-review]').count()) === 0 && readingsSince(t1).length === 0
      && n1.navs === 4 && n1.writeCurrent === 2 && n1.reviewAct === 2 && n1.develop === 0 && n1.legacy === 0
      && (await page.locator('button:not([data-affordance="navigate"])').count()) === 0,
      `bodies=${await page.locator('[data-authored-body]').count()} readingsRequests=${readingsSince(t1).length} nav=${JSON.stringify({ ...n1, rail: n1.rail.join('|'), mobile: n1.mobile.join('|') })}`);

    /* ── W2 · invoke Review with no selection ─────────────────────────── */
    const t2 = Date.now();
    await page.locator('.fs-rail button[data-nav="review"]').click();
    await page.waitForSelector('[data-review="choose"][data-choose="choices"]', { timeout: 60_000 });
    await page.waitForTimeout(400);
    await page.screenshot({ path: join(OUT, 'w2-chooser.png') });
    const n2 = await nav();
    const chooserHtml = await page.locator('[data-review="choose"]').innerHTML();
    const choiceLinks = await page.locator('a[data-reading-choice]').count();
    const noneRows = await page.locator('li[data-reading-choice][data-reading-outcome="none"]').count();
    const noneLinks = await page.locator(`a[data-reading-choice="${R.none}"]`).count();
    const trace2 = readingsSince(t2);
    check('W2 Review entered: chooser shown from the member-owned ledger; ledger GET only; no reading selected; no finding; no forbidden control',
      trace2.length === 1 && trace2[0] === 'GET /api/sovereign/manuscripts/<A>/readings' && urlState().reading === null && n2.reviewCurrent === 2 && n2.writeLink === 2
      && (await page.locator('[data-finding], [data-review="ready"], [data-review="loading"], [data-authored-body]').count()) === 0
      && choiceLinks === 3 && noneRows === 1 && noneLinks === 0 && !FORBIDDEN.test(chooserHtml) && !/aria-current|data-selected|data-chosen/.test(chooserHtml)
      && !/far bank is where|first return|returns here as a place/.test(chooserHtml),
      `trace=${trace2.join(' | ')} url.reading=${urlState().reading} choiceLinks=${choiceLinks} noneRows=${noneRows} noneLinks=${noneLinks} nav=${JSON.stringify({ reviewCurrent: n2.reviewCurrent, writeLink: n2.writeLink })}`);
    check('W2 no provider traffic and no POST on entering Review', hits() === hits0 && reqs.filter((r) => r.m !== 'GET').length === 0, `providerHits=${hits() - hits0} nonGet=${reqs.filter((r) => r.m !== 'GET').length}`);

    /* ── W3 · explicit human choice ───────────────────────────────────── */
    const t3 = Date.now();
    await page.locator(`a[data-reading-choice="${R.current}"]`).click();
    await page.waitForSelector('[data-review="ready"]', { timeout: 60_000 });
    await page.waitForTimeout(400);
    await page.screenshot({ path: join(OUT, 'w3-chosen-ready.png') });
    const trace3 = readingsSince(t3);
    const u3 = urlState();
    const readyHtml = await page.locator('[data-review="ready"]').innerHTML();
    const n3 = await nav();
    const writeHref = await page.locator('.fs-rail a[data-nav="write"]').getAttribute('href');
    check('W3 the exact chosen reading enters the URL, is loaded (ledger → that reading), reaches R1-0 ready and mounts the R1-1B Review with no other reading content',
      u3.reading === R.current && u3.m === A.wk && u3.s === A.d2 && trace3.length === 2 && trace3[0] === 'GET /api/sovereign/manuscripts/<A>/readings' && trace3[1] === 'GET /api/sovereign/manuscripts/<A>/readings/<current>'
      && (await page.locator('[data-review="ready"]').getAttribute('data-review-reading')) === R.current && (await page.locator('[data-finding]').count()) === 1
      && (await page.locator('[data-finding]').first().getAttribute('data-finding')) === `dobs_${R.current}` && !readyHtml.includes(R.other) && !readyHtml.includes(R.stale) && !/first return/.test(readyHtml)
      && !FORBIDDEN.test(readyHtml) && (await page.locator('[data-review="choose"]').count()) === 0
      && n3.reviewCurrent === 2 && n3.writeLink === 2 && !!writeHref && !/reading=/.test(writeHref) && writeHref.includes(`m=${A.wk}`) && writeHref.includes(`s=${A.d2}`),
      `url=${JSON.stringify(u3).replace(A.wk, '<A>').replace(A.d2, '<d2>').replace(R.current, '<current>')} trace=${trace3.join(' | ')} writeHref=${(writeHref ?? '').replace(A.wk, '<A>').replace(A.d2, '<d2>')}`);

    /* ── W4 · return to Write ─────────────────────────────────────────── */
    const t4 = Date.now();
    await page.locator('.fs-rail a[data-nav="write"]').click();
    await page.waitForSelector(`[data-authored-body="${A.d2}"]`, { timeout: 60_000 });
    await page.waitForTimeout(400);
    const u4 = urlState(); const n4 = await nav();
    check('W4 Write returns: Review runtime unmounted, only `reading` removed, place kept, no reading GET, no POST, no provider traffic',
      u4.reading === null && u4.m === A.wk && u4.s === A.d2 && (await page.locator('[data-review]').count()) === 0 && readingsSince(t4).length === 0
      && n4.writeCurrent === 2 && n4.reviewAct === 2 && reqs.filter((r) => r.m !== 'GET').length === 0 && hits() === hits0,
      `url=${JSON.stringify(u4).replace(A.wk, '<A>').replace(A.d2, '<d2>')} readingsRequests=${readingsSince(t4).length}`);

    /* ── W5 · direct reading URL (R1-1B intact) ───────────────────────── */
    const t5 = await open(`m=${A.wk}&s=${A.d2}&reading=${R.current}`, '[data-review="ready"]');
    const trace5 = readingsSince(t5);
    check('W5 direct reading URL: R1-1B behaviour intact — ledger then exact reading, one finding, never the chooser',
      trace5.length === 2 && trace5[1] === 'GET /api/sovereign/manuscripts/<A>/readings/<current>' && (await page.locator('[data-review="choose"]').count()) === 0
      && (await page.locator('[data-finding]').count()) === 1 && (await page.locator('[data-review="ready"]').getAttribute('data-review-reading')) === R.current,
      trace5.join(' | '));

    /* ── W6 · unavailable selection: direct unknown, and a chosen stale reading ── */
    const t6 = await open(`m=${A.wk}&s=${A.d2}&reading=${R.unknown}`, '[data-review="unavailable"]');
    const html6 = await page.locator('[data-review="unavailable"]').innerHTML();
    const n6 = await nav();
    check('W6a unknown direct reading: honest unavailable, ledger only, no chooser, no fallback, Review still current with Write as the way back',
      readingsSince(t6).length === 1 && (await page.locator('[data-review="choose"], [data-review="ready"], [data-finding], [data-authored-body]').count()) === 0
      && /isn’t available to show here/.test(html6) && !/dobs_|not found|another/i.test(html6) && n6.reviewCurrent === 2 && n6.writeLink === 2 && urlState().reading === R.unknown,
      readingsSince(t6).join(' | '));
    await open(`m=${A.wk}&s=${A.d2}`, `[data-authored-body="${A.d2}"]`);
    await page.locator('.fs-rail button[data-nav="review"]').click();
    await page.waitForSelector(`a[data-reading-choice="${R.stale}"]`, { timeout: 60_000 });
    const t6b = Date.now();
    await page.locator(`a[data-reading-choice="${R.stale}"]`).click();
    await page.waitForSelector('[data-review="unavailable"]', { timeout: 60_000 });
    await page.waitForTimeout(400);
    await page.screenshot({ path: join(OUT, 'w6-chosen-stale-unavailable.png') });
    const html6b = await page.locator('[data-review="unavailable"]').innerHTML();
    check('W6b a chosen reading that cannot lawfully mount (stale): the R1-0 refusal becomes the same honest unavailable state; no substitute reading, no chooser re-entered, no reread',
      html6b === html6 && urlState().reading === R.stale && readingsSince(t6b).length === 2 && readingsSince(t6b).every((r) => r.startsWith('GET '))
      && (await page.locator('[data-review="ready"], [data-review="choose"], [data-finding], .fs-moved').count()) === 0 && reqs.filter((r) => r.m !== 'GET').length === 0,
      `identicalToUnknown=${html6b === html6} trace=${readingsSince(t6b).join(' | ')}`);

    /* ── W7 · mobile orientation ──────────────────────────────────────── */
    const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await mctx.addCookies([{ name: 'maia_session', value: TOKEN, domain: '127.0.0.1', path: '/' }]);
    const mpage = await mctx.newPage();
    const mreqs: string[] = [];
    mpage.on('request', (r: Request) => { if (/\/readings/.test(r.url())) mreqs.push(`${r.method()} ${short(r.url())}`); });
    await mpage.goto(`http://127.0.0.1:${PORT}/writers-studio/rebuild?m=${A.wk}&s=${A.d2}`, { waitUntil: 'domcontentloaded', timeout: 240_000 });
    await mpage.waitForSelector(`[data-authored-body="${A.d2}"]`, { timeout: 240_000 }); await mpage.waitForTimeout(500);
    const words = (xs: string[]) => xs.map((x) => x.replace(/[^A-Za-z]/g, '')).join('|');
    const mobileNav = await mpage.locator('.fs-mobilenav [data-nav]').allTextContents();
    const mobileVisible = await mpage.locator('.fs-mobilenav').isVisible();
    const railVisible = await mpage.locator('.fs-rail').isVisible();
    await mpage.screenshot({ path: join(OUT, 'w7-mobile-write.png') });
    await mpage.locator('.fs-mobilenav button[data-nav="review"]').click();
    await mpage.waitForSelector('[data-review="choose"][data-choose="choices"]', { timeout: 60_000 }); await mpage.waitForTimeout(400);
    await mpage.screenshot({ path: join(OUT, 'w7-mobile-chooser.png') });
    const mobileNav2 = await mpage.locator('.fs-mobilenav [data-nav]').allTextContents();
    const mobileWriteLink = await mpage.locator('.fs-mobilenav a[data-nav="write"][data-affordance="navigate"]').count();
    check('W7 mobile and desktop express the same Write · Review law: the mobile nav (visible, rail hidden) names exactly Write and Review, Review opens the chooser, Write is the link back; no legacy bridge',
      mobileVisible && !railVisible && words(mobileNav) === 'Write|Review' && words(n1.rail) === 'Write|Review' && words(mobileNav2) === 'Write|Review' && mobileWriteLink === 1
      && (await mpage.locator('a[href*="/writers-studio/review"], a[href*="/writers-studio/develop"], [data-nav="develop"]').count()) === 0 && mreqs.length === 1,
      `mobileNav=${mobileNav.join('|')} rail=${n1.rail.join('|')} afterReview=${mobileNav2.join('|')} mobileReqs=${mreqs.join(' | ')}`);
    await mctx.close();

    /* ── W8 · zero-write · zero-cognition over the whole cycle ─────────── */
    const digest1 = await memberDigest();
    const nonGet = reqs.filter((r) => r.m !== 'GET');
    check('W8b member-scoped database state byte-identical across Write → chooser → chosen Review → Write → direct → unavailable → mobile', digest0 === digest1, `${digest0.slice(0, 12)} → ${digest1.slice(0, 12)}`);
    check('W8c zero model/provider commissioning and zero non-GET requests over the whole walk', hits() === hits0 && nonGet.length === 0, `providerHits=${hits() - hits0} nonGet=${nonGet.length}`);
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
