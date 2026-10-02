/**
 * FLAGSHIP-RUNTIME-CONVERGENCE-01 / R1-1B — LIVE SINGLE-READING READ-ONLY REVIEW WALK.
 *
 *   DATABASE_URL=<shadow> WITNESS_PORT=<running next dev> PROVIDER_HITS=<counter log> \
 *     npx tsx scripts/witness/flagship/r1-1b-live-review-walk.ts
 *
 * Real browser · real /writers-studio/rebuild · real authenticated session · real rows in a
 * disposable full-schema shadow. Readings are SEEDED directly (never through the commission
 * route). The witness next dev points its provider base URL at a counter that must stay at 0.
 * ⚠️ CANDIDATE EVIDENCE — ⛔ not production, ⛔ not a member walk. Identifiers, counts, short
 * witness strings only. ⛔ Never point this at production: it seeds and deletes rows.
 */
import { mkdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { Client } from 'pg';
import { chromium, type Page, type Request } from 'playwright';

const DSN = process.env.DATABASE_URL ?? '';
const PORT = Number(process.env.WITNESS_PORT ?? '3499');
const HITS = process.env.PROVIDER_HITS ?? '/tmp/r1-1b-provider-hits.log';
const OUT = join(process.cwd(), 'docs/design/contracts/screenshots/flagship-r1-1b');
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

/* member M owns Work A (two chapters sections) and Work B; member M2 owns Work C */
const M = randomUUID(), M2 = randomUUID(), TOKEN = `r11b-${randomUUID()}`;
const A = { lw: randomUUID(), wk: randomUUID(), s1: randomUUID(), s2: randomUUID(), dr: randomUUID(), d1: randomUUID(), d2: randomUUID() };
const B = { wk: randomUUID(), s: randomUUID(), dr: randomUUID(), d: randomUUID() };
const C = { wk: randomUUID(), s: randomUUID(), dr: randomUUID(), d: randomUUID() };
const R = { current: randomUUID(), other: randomUUID(), stale: randomUUID(), b: randomUUID(), c: randomUUID(), unknown: randomUUID() };
const H1 = 'Chapter 1', H2 = 'The river at dusk';
const B1 = 'The water held the last of the light.';
const B2 = 'Nothing moved on the far bank. She waited for the sound to come back.';
const T1 = `${H1}\n\n${B1}`, T2 = `${H2}\n\n${B2}`;
const T2_OLD = `${H2}\n\nNothing moved on the near bank.`;
const TB = 'Work B\n\nA second, separate Work.'; const TC = 'Work C\n\nAnother member’s Work.';

async function seedWork(x: { wk: string; dr: string; s: string; d: string }, member: string, title: string, text: string) {
  await q(`INSERT INTO member_manuscripts (id,member_id,title) VALUES ($1,$2,$3)`, [x.wk, member, title]);
  await q(`INSERT INTO manuscript_sections (id,manuscript_id,position,heading,body) VALUES ($1,$2,0,$3,$4)`, [x.s, x.wk, title, text]);
  await q(`INSERT INTO manuscript_working_drafts (id,manuscript_id,member_id,content,base_source_hash,revision_count) VALUES ($1,$2,$3,'','r1-1b',1)`, [x.dr, x.wk, member]);
  await q(`INSERT INTO manuscript_draft_sections (id,draft_id,position,text,source_section_id) VALUES ($1,$2,0,$3,$4)`, [x.d, x.dr, text, x.s]);
  await q(`UPDATE manuscript_working_drafts SET content=$2, section_addressable_at=NOW() WHERE id=$1`, [x.dr, text]);
}
async function seedReading(args: { id: string; wk: string; dr: string; member: string; topology: { id: string; text: string }[]; obsAt: number | null; frozenAt: string; text?: string }) {
  const sections = Object.fromEntries(args.topology.map((t) => [t.id, { revisionNumber: 1, range: { start: 0, end: cp(t.text) }, digest: sha(t.text) }]));
  const readState = { draftId: args.dr, revisionNumber: 1, revisionDigest: sha(args.topology.map((t) => t.text).join('')), sectionTopology: args.topology.map((t) => t.id), sections, inputFingerprint: sha(`r1-1b:${args.id}`) };
  const obs = args.obsAt === null ? [] : [{
    key: 'o1', observationId: `dobs_${args.id}`, admissionIndex: 0, basisFingerprint: sha(`basis:${args.id}`),
    position: { sectionPosition: args.obsAt, codePointStart: 0 }, lens: 'continuity', phenomenon: 'recurrence',
    evidenceRefs: [{ kind: 'section', sectionId: args.topology[args.obsAt]!.id }],
    observation: args.text ?? 'The river returns here as a place of movement.',
    doesNotEstablish: ['author-intent', 'editorial-consequence'], structureDependency: { kind: 'independent' },
  }];
  const scope = { commissionedLens: 'continuity', bodyScope: args.topology.map((t) => t.id), withStructure: false };
  const coverage = { sections: Object.fromEntries(args.topology.map((t) => [t.id, 'body'])) };
  const reader = { provider: 'witness', model: 'seeded-no-provider', promptHash: 'r1-1b', readerVersion: 'DEVELOPMENTAL-READER-01' };
  const classifier = { provider: 'witness', model: 'seeded-no-provider', promptHash: 'r1-1b', classifierVersion: 'CLASSIFIER-01' };
  await q(`INSERT INTO developmental_readings (id,manuscript_id,member_id,draft_id,revision_number,commissioned_lens,scope,read_state,coverage,input_fingerprint,outcome,observations,reader_provenance,classifier_provenance,frozen_at)
           VALUES ($1,$2,$3,$4,1,'continuity',$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
    [args.id, args.wk, args.member, args.dr, JSON.stringify(scope), JSON.stringify(readState), JSON.stringify(coverage), readState.inputFingerprint,
      obs.length ? 'reading' : 'none', JSON.stringify(obs), JSON.stringify(reader), obs.length ? JSON.stringify(classifier) : null, args.frozenAt]);
}
async function seed() {
  await q(`INSERT INTO members (id,passkey,username,password_hash,name) VALUES ($1,$2,$3,'x','R1-1B walk'),($4,$5,$6,'x','R1-1B other member')`, [M, `SOULLAB-R11B-${M.slice(0, 8)}`, `r11b-${M.slice(0, 8)}`, M2, `SOULLAB-R11B-${M2.slice(0, 8)}`, `r11b-${M2.slice(0, 8)}`]);
  await q(`INSERT INTO auth_sessions (member_id,session_token,expires_at) VALUES ($1,$2,NOW() + INTERVAL '2 hours')`, [M, TOKEN]);
  await q(`INSERT INTO living_works (id,member_id,title) VALUES ($1,$2,'The River Between')`, [A.lw, M]);
  await q(`INSERT INTO member_manuscripts (id,member_id,title) VALUES ($1,$2,'The River Between')`, [A.wk, M]);
  await q(`INSERT INTO living_work_expressions (living_work_id,expression_type,expression_id,declared_by) VALUES ($1,'manuscript',$2,$3)`, [A.lw, A.wk, M]);
  await q(`INSERT INTO manuscript_sections (id,manuscript_id,position,heading,heading_depth,heading_signal,body) VALUES ($1,$2,1,$3,1,'chapter',$4),($5,$2,2,$6,2,'markdown',$7)`, [A.s1, A.wk, H1, B1, A.s2, H2, B2]);
  await q(`INSERT INTO manuscript_working_drafts (id,manuscript_id,member_id,content,base_source_hash,revision_count) VALUES ($1,$2,$3,'','sha-r11b',2)`, [A.dr, A.wk, M]);
  await q(`INSERT INTO manuscript_draft_sections (id,draft_id,position,text,source_section_id) VALUES ($1,$2,1,$3,$4),($5,$2,2,$6,$7)`, [A.d1, A.dr, T1, A.s1, A.d2, T2, A.s2]);
  await q(`UPDATE manuscript_working_drafts SET content=$2, section_addressable_at=NOW() WHERE id=$1`, [A.dr, T1 + T2]);
  await seedWork(B, M, 'Work B', TB);
  await seedWork(C, M2, 'Work C', TC);
  const topo = [{ id: A.d1, text: T1 }, { id: A.d2, text: T2 }];
  await seedReading({ id: R.current, wk: A.wk, dr: A.dr, member: M, topology: topo, obsAt: 1, frozenAt: '2026-09-22T12:00:00.000Z', text: 'The far bank is where the chapter keeps returning.' });
  await seedReading({ id: R.other, wk: A.wk, dr: A.dr, member: M, topology: topo, obsAt: 0, frozenAt: '2026-09-22T13:00:00.000Z', text: 'The light at the opening is the first return.' });
  await seedReading({ id: R.stale, wk: A.wk, dr: A.dr, member: M, topology: [{ id: A.d1, text: T1 }, { id: A.d2, text: T2_OLD }], obsAt: 1, frozenAt: '2026-09-22T11:00:00.000Z' });
  await seedReading({ id: R.b, wk: B.wk, dr: B.dr, member: M, topology: [{ id: B.d, text: TB }], obsAt: 0, frozenAt: '2026-09-22T14:00:00.000Z' });
  await seedReading({ id: R.c, wk: C.wk, dr: C.dr, member: M2, topology: [{ id: C.d, text: TC }], obsAt: 0, frozenAt: '2026-09-22T15:00:00.000Z' });
}
async function cleanup() {
  for (const [sql, p] of [
    [`DELETE FROM developmental_readings WHERE member_id = ANY($1)`, [[M, M2]]],
    [`DELETE FROM manuscript_working_drafts WHERE member_id = ANY($1)`, [[M, M2]]],
    [`DELETE FROM manuscript_sections WHERE manuscript_id = ANY($1)`, [[A.wk, B.wk, C.wk]]],
    [`DELETE FROM living_work_expressions WHERE living_work_id = $1`, [A.lw]],
    [`DELETE FROM member_manuscripts WHERE id = ANY($1)`, [[A.wk, B.wk, C.wk]]],
    [`DELETE FROM living_works WHERE id = $1`, [A.lw]],
    [`DELETE FROM auth_sessions WHERE member_id = $1`, [M]],
    [`DELETE FROM members WHERE id = ANY($1)`, [[M, M2]]],
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
const FORBIDDEN = /Ask MAIA|data-action="discuss"|data-action="explore"|data-commission=|Read for this|Read again|Read this chapter again|Not now|Add your own observation|Keep with this passage|fs-facet|data-facet=|\bdisabled\b|aria-disabled/;

async function main() {
  mkdirSync(OUT, { recursive: true });
  await pg.connect();
  const dbn = String((await q('SELECT current_database() d'))[0]!['d']);
  if (!/shadow|witness/.test(dbn)) { console.log(`REFUSED — '${dbn}' is not a shadow/witness database`); process.exit(2); }
  await seed();
  console.log(`\n── R1-1B LIVE REVIEW WALK · work=${A.wk} · current=${R.current} other=${R.other} stale=${R.stale} ──\n`);
  const hits0 = hits();

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addCookies([{ name: 'maia_session', value: TOKEN, domain: '127.0.0.1', path: '/' }]);
  const page: Page = await ctx.newPage();
  const reqs: { t: number; m: string; u: string }[] = [];
  page.on('request', (r: Request) => { if (/\/api\//.test(r.url())) reqs.push({ t: Date.now(), m: r.method(), u: r.url() }); });
  const readingsSince = (t: number) => reqs.filter((r) => r.t >= t && /\/readings/.test(r.u)).map((r) => `${r.m} ${r.u.replace(/^https?:\/\/[^/]+/, '').replace(A.wk, '<A>').replace(B.wk, '<B>').replace(R.current, '<current>').replace(R.other, '<other>').replace(R.stale, '<stale>').replace(R.b, '<b>').replace(R.c, '<c>').replace(R.unknown, '<unknown>')}`);
  const open = async (query: string, waitFor: string) => { const t = Date.now(); await page.goto(`http://127.0.0.1:${PORT}/writers-studio/rebuild?${query}`, { waitUntil: 'domcontentloaded', timeout: 240_000 }); await page.waitForSelector(waitFor, { timeout: 240_000 }); await page.waitForTimeout(500); return t; };
  /* R1-1C SUCCESSION (2026-09-23): the shell now names Write and Review on both surfaces; what this walk still refuses is a LEGACY bridge. */
  const nav = async () => ({ navs: await page.locator('[data-nav]').count(), write: await page.locator('[data-nav="write"]').count(), review: await page.locator('[data-nav="review"]').count(), legacy: await page.locator('a[href*="/writers-studio/review"]').count() });

  try {
    /* ── W1 · ordinary Write ─────────────────────────────────────────── */
    const t1 = await open(`m=${A.wk}&s=${A.d2}`, `[data-authored-body="${A.d2}"]`);
    const n1 = await nav();
    check('W1 ordinary Write mounts; no Review; zero reading GETs; orientation unchanged', (await page.locator('[data-authored-body]').count()) === 2 && (await page.locator('[data-review]').count()) === 0 && readingsSince(t1).length === 0 && n1.navs === 4 && n1.write === 2 && n1.review === 2 && n1.legacy === 0 && (await page.locator('button:not([data-affordance="navigate"])').count()) === 0,
      `bodies=${await page.locator('[data-authored-body]').count()} review=${await page.locator('[data-review]').count()} readingsRequests=${readingsSince(t1).length} nav=${JSON.stringify(n1)}`);

    const digest0 = await memberDigest();
    check('W7a member-scoped digest captured before the measured Review window', digest0.length === 32, digest0);

    /* ── W2 · explicit current reading ──────────────────────────────── */
    const t2 = await open(`m=${A.wk}&s=${A.d2}&reading=${R.current}`, '[data-review="ready"]');
    await page.screenshot({ path: join(OUT, 'w2-ready.png') });
    const trace2 = readingsSince(t2);
    const findings = await page.locator('[data-finding]').count();
    const findingId = await page.locator('[data-finding]').first().getAttribute('data-finding');
    const html2 = await page.locator('[data-review="ready"]').innerHTML();
    const n2 = await nav();
    const tabs = await page.locator('[role="tab"]').allTextContents();
    const highlighted = await page.locator('.fs-contextp[data-highlighted="true"]').textContent();
    check('W2 exact GET order: ledger, then the one selected reading, nothing else', trace2.length === 2 && trace2[0] === 'GET /api/sovereign/manuscripts/<A>/readings' && trace2[1] === 'GET /api/sovereign/manuscripts/<A>/readings/<current>', trace2.join(' | '));
    const pageHtml2 = await page.content();
    check('W2 exact reading mounted read-only: one finding from the selected reading, Discuss/Explore/commission/write/navigate/facet absent', (await page.locator('[data-review="ready"]').getAttribute('data-review-reading')) === R.current && findings === 1 && findingId === `dobs_${R.current}` && !FORBIDDEN.test(html2) && !/fs-facet|data-facet=/.test(pageHtml2) && (await page.locator('button:not([role="tab"])').count()) === 0 && (await page.locator('[data-authored-body]').count()) === 0,
      `reading=${(await page.locator('[data-review="ready"]').getAttribute('data-review-reading')) === R.current} findings=${findings} id=${findingId === `dobs_${R.current}`} forbidden=${FORBIDDEN.test(html2)}`);
    check('W2 orientation per R1-1C succession (Write · Review, no legacy bridge); tabs filter only; unranked disclosure present', n2.navs === 4 && n2.write === 2 && n2.review === 2 && n2.legacy === 0 && tabs.length === 2 && tabs[0] === 'Everything' && /Nothing here is ranked/.test(html2), `nav=${JSON.stringify(n2)} tabs=${JSON.stringify(tabs)}`);
    check('W2 current manuscript context beside the finding is the finding’s own return section', !!highlighted && highlighted.includes(B2) && (await page.locator('.fs-contextp').count()) === 2, `highlighted=${(highlighted ?? '').slice(0, 30)}…`);
    const tBefore = Date.now();
    await page.locator('[role="tab"]').nth(1).click(); await page.waitForTimeout(300);
    check('W2 switching the lens tab filters locally: no request, selection changes', (await page.locator('[role="tab"]').nth(1).getAttribute('aria-selected')) === 'true' && readingsSince(tBefore).length === 0, `requestsOnTab=${readingsSince(tBefore).length}`);

    /* ── W3 · explicit unknown reading ──────────────────────────────── */
    const t3 = await open(`m=${A.wk}&s=${A.d2}&reading=${R.unknown}`, '[data-review="unavailable"]');
    const html3 = await page.locator('[data-review="unavailable"]').innerHTML();
    await page.screenshot({ path: join(OUT, 'w3-unavailable.png') });
    check('W3 unknown reading: honest unavailable, no Write fallback, no findings, ledger only, no existence probe', readingsSince(t3).length === 1 && readingsSince(t3)[0]!.startsWith('GET /api/sovereign/manuscripts/<A>/readings') && (await page.locator('[data-finding], [data-authored-body]').count()) === 0 && /isn’t available to show here/.test(html3) && !/rd_|dobs_|not found|another/i.test(html3), readingsSince(t3).join(' | '));

    /* ── W4 · wrong Work · unowned ──────────────────────────────────── */
    const t4a = await open(`m=${A.wk}&s=${A.d2}&reading=${R.b}`, '[data-review="unavailable"]');
    const html4a = await page.locator('[data-review="unavailable"]').innerHTML();
    const t4b = await open(`m=${A.wk}&s=${A.d2}&reading=${R.c}`, '[data-review="unavailable"]');
    const html4b = await page.locator('[data-review="unavailable"]').innerHTML();
    check('W4 wrong-Work and unowned readings: same non-disclosing unavailable markup as unknown; ledger only', html4a === html3 && html4b === html3 && readingsSince(t4a).filter((r) => r.includes('<b>')).length === 0 && readingsSince(t4b).filter((r) => r.includes('<c>')).length === 0, `identical=${html4a === html3 && html4b === html3} probes=${readingsSince(t4a).length + readingsSince(t4b).length}`);

    /* ── W5 · stale reading ─────────────────────────────────────────── */
    const t5 = await open(`m=${A.wk}&s=${A.d2}&reading=${R.stale}`, '[data-review="unavailable"]');
    const html5 = await page.locator('[data-review="unavailable"]').innerHTML();
    check('W5 stale reading: real R1-0 refusal → unavailable; no fabricated prose; no reread; no POST', html5 === html3 && readingsSince(t5).length === 2 && readingsSince(t5).every((r) => r.startsWith('GET ')) && (await page.locator('[data-finding], .fs-moved').count()) === 0, readingsSince(t5).join(' | '));

    /* ── W6 · late result: A delayed, B selected ────────────────────── */
    await page.route(`**/readings/${R.current}`, async (route) => { await new Promise((r) => setTimeout(r, 4000)); await route.continue(); });
    const t6 = await open(`m=${A.wk}&s=${A.d2}&reading=${R.current}`, '[data-review="loading"]');
    await page.evaluate(({ q }) => { window.history.pushState(null, '', `/writers-studio/rebuild?${q}`); }, { q: `m=${A.wk}&s=${A.d2}&reading=${R.other}` });
    await page.waitForSelector('[data-review="ready"]', { timeout: 60_000 });
    const firstReady = await page.locator('[data-review="ready"]').getAttribute('data-review-reading');
    await page.waitForTimeout(5500);
    const finalReady = await page.locator('[data-review="ready"]').getAttribute('data-review-reading');
    const finalFinding = await page.locator('[data-finding]').first().getAttribute('data-finding');
    await page.unroute(`**/readings/${R.current}`);
    check('W6 late result: A resolved after B became current and did not attach; B stays mounted', firstReady === R.other && finalReady === R.other && finalFinding === `dobs_${R.other}` && readingsSince(t6).some((r) => r.endsWith('<current>')) && readingsSince(t6).some((r) => r.endsWith('<other>')), `first=${firstReady === R.other ? 'other' : firstReady} final=${finalReady === R.other ? 'other' : finalReady} finding=${finalFinding}`);
    await page.screenshot({ path: join(OUT, 'w6-other-after-late-a.png') });

    /* ── W7 · zero-write · W8 · no provider traffic ─────────────────── */
    const digest1 = await memberDigest();
    check('W7b member-scoped database state byte-identical across the whole Review window', digest0 === digest1, `${digest0.slice(0, 12)} → ${digest1.slice(0, 12)}`);
    const posts = reqs.filter((r) => r.m !== 'GET' && /\/readings|\/editorial|\/focus|standing|keeps/.test(r.u));
    check('W8 no provider/model traffic and no Review-triggered POST', hits() === hits0 && posts.length === 0, `providerHits=${hits() - hits0} nonGetRequests=${posts.length}`);
    console.log('\n  /readings traffic, whole walk:'); for (const r of reqs.filter((x) => /\/readings/.test(x.u))) console.log(`    ${r.m} ${r.u.replace(/^https?:\/\/[^/]+/, '')}`);
  } finally {
    await browser.close();
    await cleanup();
    await pg.end();
  }
  console.log(`\n  ${pass} passed · ${fail} failed · screenshots ${OUT}\n`);
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(async (e) => { console.error(e); await cleanup().catch(() => {}); await pg.end().catch(() => {}); process.exit(2); });
