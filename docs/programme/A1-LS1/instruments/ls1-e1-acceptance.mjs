// A1-LS1 · additive positive-law acceptance witness (packet §6).
//
// Proves the POSITIVE laws R1–R5 must make true — not merely that an LS0 RED
// predicate stopped firing. Every law is a set of named checks; a law is GREEN
// only when every check holds. Evidence records identities, states, offsets,
// codes and booleans only — never manuscript prose.
//
// Usage: node ls1-e1-acceptance.mjs <root> <base_url> <identity.env> <out.json> <label> [only=A1,A2,...]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';

const [ROOT, BASE, IDENTITY, OUT, LABEL, ONLY] = process.argv.slice(2);
const only = ONLY ? new Set(ONLY.replace(/^only=/, '').split(',')) : null;
const want = (law) => !only || only.has(law);
const require = createRequire(path.join(ROOT, 'package.json'));
const { chromium } = require('playwright');
const pg = require('pg');

const ident = Object.fromEntries(fs.readFileSync(IDENTITY, 'utf8').trim().split('\n').map((l) => l.split('=')));
const TOKEN = ident.LS0_SESSION_A_TOKEN;
const db = new pg.Client({ connectionString: 'postgresql://soullab@127.0.0.1:55432/maia_consciousness' });
const T_NAV = 180_000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = { label: LABEL, only: only ? [...only] : 'all', startedAt: new Date().toISOString(), laws: {} };

// ── synthetic manuscripts (fixture identities only) ────────────────────────
const filler = (tag, n) => Array.from({ length: n }, (_, i) => `Synthetic line ${i + 1} of ${tag}.`).join('\n\n');
const SPEC = [
  ['Chapter 1: Synthetic One', 1], ['Scene 1.1', 2], ['Chapter 2: Synthetic Two', 1], ['Scene 2.1', 2],
  ['Chapter 10: Synthetic Ten', 1], ['Scene 10.1', 2], ['Chapter 11: Synthetic Eleven', 1], ['Scene 11.1', 2],
];
async function api(p, { method = 'GET', body, headers = {} } = {}) {
  const res = await fetch(BASE + p, { method, headers: { cookie: `maia_session=${TOKEN}`, ...(body !== undefined ? { 'content-type': 'application/json' } : {}), ...headers }, body: body === undefined ? undefined : JSON.stringify(body) });
  let json = null; try { json = await res.json(); } catch { /* none */ }
  return { status: res.status, json };
}
async function newManuscript(tag, lines = 40) {
  const sections = SPEC.map(([heading, depth]) => ({ heading, body: filler(`${tag}/${heading}`, lines), headingDepth: depth, headingSignal: 'markdown' }));
  const m = await api('/api/sovereign/manuscripts', { method: 'POST', body: { title: `LS1 synthetic ${tag}`, sections } });
  if (m.status >= 300 || !m.json?.id) throw new Error(`manuscript create ${m.status}`);
  const d = await api(`/api/sovereign/manuscripts/${m.json.id}/draft`, { method: 'POST' });
  if (d.status !== 201) throw new Error(`draft create ${d.status}`);
  const ids = d.json.sections.map((s) => s.id);
  return { mid: m.json.id, ids, by: Object.fromEntries(SPEC.map(([h], i) => [h, ids[i]])) };
}
const q = async (sql, params) => (await db.query(sql, params)).rows;
const MARK = (k) => `LS1MARK${k}${crypto.randomBytes(3).toString('hex')}`;
const persisted = async (sectionId, marker) => (await q('SELECT position(($2)::text in text) > 0 AS has FROM manuscript_draft_sections WHERE id = $1', [sectionId, marker]))[0]?.has === true;

// ── page helpers ───────────────────────────────────────────────────────────
async function context(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addCookies([{ name: 'maia_session', value: TOKEN, url: BASE }]);
  // Observation only: record how section saves were dispatched (never bodies).
  await ctx.addInitScript(() => {
    // Fault injection for the digest-ordering check only: delays queued by the
    // witness are applied, in call order, to the page's SHA-256 computations.
    window.__ls1DigestDelays = [];
    window.__ls1LateDigests = 0;
    try {
      const origDigest = SubtleCrypto.prototype.digest;
      SubtleCrypto.prototype.digest = async function (...a) { const d = window.__ls1DigestDelays.shift() ?? 0; const r = await origDigest.apply(this, a); if (d) { await new Promise((res) => setTimeout(res, d)); window.__ls1LateDigests += 1; } return r; };
    } catch { /* unavailable ⇒ the ordering check reports INSTRUMENT_FAILURE */ }
    window.__ls1ScrollCalls = 0;
    const count = (proto, name) => { const f = proto[name]; if (typeof f !== 'function') return; proto[name] = function (...a) { window.__ls1ScrollCalls += 1; return f.apply(this, a); }; };
    count(Element.prototype, 'scrollIntoView'); count(Element.prototype, 'scrollTo'); count(Element.prototype, 'scrollBy'); count(window, 'scrollTo'); count(window, 'scrollBy');
    const orig = window.fetch.bind(window);
    window.__ls1Puts = [];
    window.fetch = (input, init = {}) => {
      try {
        const url = typeof input === 'string' ? input : input.url;
        if (/\/sections\//.test(url) && (init.method ?? 'GET') === 'PUT') {
          window.__ls1Puts.push({ keepalive: init.keepalive === true, bytes: typeof init.body === 'string' ? new TextEncoder().encode(init.body).length : null });
        }
      } catch { /* observation must never break the page */ }
      return orig(input, init);
    };
  });
  return ctx;
}
async function openWrite(page, mid, s) {
  await page.goto(`${BASE}/writers-studio/rebuild?m=${mid}${s !== undefined ? `&s=${encodeURIComponent(s)}` : ''}`, { timeout: T_NAV });
  await page.waitForSelector('[data-rebuild-section]', { timeout: T_NAV });
}
const focusedOnce = (page) => page.evaluate(() => {
  const hits = [];
  for (const node of document.querySelectorAll('[data-imported-structure-node]')) {
    const btn = node.querySelector(':scope > div > button:nth-of-type(2)');
    if (!btn) continue;
    const cs = getComputedStyle(btn);
    if (cs.borderLeftWidth === '3px' && cs.borderLeftColor !== 'rgba(0, 0, 0, 0)' && cs.borderLeftColor !== 'transparent') hits.push(node.getAttribute('data-imported-structure-node'));
  }
  return hits.length === 1 ? hits[0] : (hits.length ? `AMBIGUOUS:${hits.length}` : null);
});
async function focused(page, timeout = 15_000) { const t0 = Date.now(); let v = null; while (Date.now() - t0 < timeout) { v = await focusedOnce(page); if (v) return v; await sleep(250); } return v; }
const addressS = (page) => page.evaluate(() => new URLSearchParams(location.search).get('s'));
const scrollState = (page) => page.evaluate(() => ({ manuscript: document.querySelector('[data-manuscript-scroll]')?.scrollTop ?? null, window: window.scrollY }));
const saveState = (page) => page.evaluate(() => (document.querySelector('[data-save-state]')?.textContent ?? '').trim() || null);
const clickRail = async (page, id) => { await page.locator(`[data-imported-structure-node="${id}"] > div > button:nth-of-type(2)`).first().click(); await sleep(600); };
async function openEditor(page, id) {
  await page.locator(`[data-authored-body="${id}"]`).first().click();
  await page.waitForSelector(`textarea[data-authored-body="${id}"]`, { timeout: 15_000 });
}
function putLog(page) {
  const log = [];
  page.on('response', (r) => { const m = r.url().match(/\/sections\/([^/?]+)/); if (m && r.request().method() === 'PUT') log.push({ section: m[1], status: r.status() }); });
  return log;
}
async function waitFor(fn, timeout = 20_000, step = 100) { const t0 = Date.now(); while (Date.now() - t0 < timeout) { const v = await fn(); if (v) return v; await sleep(step); } return null; }
const editorTuple = (page) => page.evaluate(() => {
  const a = document.activeElement; const ta = a && a.tagName === 'TEXTAREA' ? a : null;
  return { tag: a?.tagName ?? null, section: a?.getAttribute?.('data-authored-body') ?? null, start: ta?.selectionStart ?? null, end: ta?.selectionEnd ?? null,
    bodyDigest: ta ? Array.from(new TextEncoder().encode(ta.value)).reduce((h, b) => (h * 31 + b) >>> 0, 7) : null };
});

async function law(name, fn) {
  if (!want(name)) return;
  const t0 = Date.now();
  try {
    const { checks, obs } = await fn();
    const failed = Object.entries(checks).filter(([, v]) => v !== true).map(([k]) => k);
    results.laws[name] = { outcome: failed.length === 0 ? 'GREEN' : 'RED', failedChecks: failed, checks, obs };
  } catch (e) {
    results.laws[name] = { outcome: 'INSTRUMENT_FAILURE', basis: String(e?.message ?? e).slice(0, 240) };
  }
  results.laws[name].ms = Date.now() - t0;
  process.stdout.write(`${name}: ${results.laws[name].outcome}${results.laws[name].failedChecks?.length ? ' ' + results.laws[name].failedChecks.join(',') : ''}\n`);
}

await db.connect();
const browser = await chromium.launch();
// warm-up (compiles routes; never evidence)
{ const w = await newManuscript('warmup', 2); const ctx = await context(browser); const p = await ctx.newPage(); await openWrite(p, w.mid); await ctx.close(); }

// ── A1 · Arrival (R1) ──────────────────────────────────────────────────────
await law('A1', async () => {
  const m = await newManuscript('a1', 60);
  const ctx = await context(browser); const page = await ctx.newPage();
  const arrive = async (s) => { await openWrite(page, m.mid, s); const f = await focused(page); await sleep(1200); return { focus: f, addr: await addressS(page), scroll: await scrollState(page), scrollCalls: await page.evaluate(() => window.__ls1ScrollCalls ?? null) }; };
  const valid = await arrive(m.by['Scene 2.1']);
  const absent = await arrive(undefined);
  const stale = await arrive(crypto.randomUUID());
  const invalid = await arrive('not-a-section-id');
  await ctx.close();
  const first = m.ids[0]; const ch10 = m.by['Chapter 10: Synthetic Ten'];
  const noScroll = (x) => x.scroll.manuscript === 0 && x.scroll.window === 0;
  const checks = {
    validExplicitPlaceHonoured: valid.focus === m.by['Scene 2.1'] && valid.addr === m.by['Scene 2.1'],
    absentResolvesToFirstSection: absent.focus === first,
    staleResolvesToFirstSection: stale.focus === first,
    invalidResolvesToFirstSection: invalid.focus === first,
    absentAddressRepairedToResolved: absent.addr === first,
    staleAddressRepairedToResolved: stale.addr === first,
    invalidAddressRepairedToResolved: invalid.addr === first,
    noChapter10Heuristic: absent.focus !== ch10 && stale.focus !== ch10 && invalid.focus !== ch10,
    zeroArrivalScroll: [valid, absent, stale, invalid].every(noScroll),
    zeroArrivalScrollCalls: [valid, absent, stale, invalid].every((x) => x.scrollCalls === 0),
  };
  const lab = (id) => (id === first ? 'first section' : id === ch10 ? 'Chapter 10 root' : id === m.by['Scene 2.1'] ? 'Scene 2.1' : id);
  const o = (x) => ({ focus: lab(x.focus), addr: lab(x.addr), scroll: x.scroll, scrollCalls: x.scrollCalls });
  return { checks, obs: { valid: o(valid), absent: o(absent), stale: o(stale), invalid: o(invalid) } };
});

// ── A2 · Save truth (R2) ───────────────────────────────────────────────────
await law('A2', async () => {
  const m = await newManuscript('a2', 8);
  const ctx = await context(browser); const page = await ctx.newPage(); const puts = putLog(page);
  const s11 = m.by['Scene 1.1'], s21 = m.by['Scene 2.1'];
  await openWrite(page, m.mid, s11);
  const afterLoad = await waitFor(() => saveState(page), 10_000);
  // progression with the response held so the in-flight state is observable
  const seen = new Set();
  let hold = true;
  await page.route('**/sections/**', async (route) => { if (route.request().method() === 'PUT' && hold) { await sleep(1500); } await route.continue(); });
  await openEditor(page, s11);
  await page.keyboard.type(` ${MARK('A2')}`, { delay: 5 });
  const t0 = Date.now();
  while (Date.now() - t0 < 7000) { seen.add(await saveState(page)); await sleep(50); }
  hold = false; await page.unroute('**/sections/**');
  const settled = await waitFor(async () => (await saveState(page)) === 'Saved' ? 'Saved' : null, 8000);
  // off-chapter failure: an unknown outcome in chapter 1, observed from chapter 2
  await page.route('**/sections/**', (route) => (route.request().method() === 'PUT' ? route.abort() : route.continue()));
  await openEditor(page, s11);
  await page.keyboard.type(` ${MARK('A2e')}`, { delay: 5 });
  await clickRail(page, s21);
  const errorElsewhere = await waitFor(async () => { const s = await saveState(page); return s && s !== 'Unsaved' && s !== 'Saving…' ? s : null; }, 8000);
  await page.unroute('**/sections/**');
  await ctx.close();
  // off-chapter conflict: another writer changes Scene 1.1 itself
  const ctx2 = await context(browser); const p2 = await ctx2.newPage();
  await openWrite(p2, m.mid, s11);
  // Another writer's committed change to Scene 1.1 itself: section text, derived
  // content and version move together in one transaction, as a real save does.
  await q('BEGIN');
  await q(`UPDATE manuscript_draft_sections SET text = text || $2, updated_at = now() WHERE id = $1`, [s11, ' elsewhere']);
  await q(`UPDATE manuscript_working_drafts d SET version = version + 1, content = (SELECT string_agg(text, '' ORDER BY position) FROM manuscript_draft_sections WHERE draft_id = d.id) WHERE manuscript_id = $1`, [m.mid]);
  await q('COMMIT');
  await openEditor(p2, s11);
  await p2.keyboard.type(` ${MARK('A2c')}`, { delay: 5 });
  await clickRail(p2, s21);
  const conflictElsewhere = await waitFor(async () => { const s = await saveState(p2); return s === 'Needs attention' ? s : null; }, 10_000);
  const footerText = await p2.evaluate(() => document.querySelector('footer')?.textContent ?? '');
  const pageHasDraftV = await p2.evaluate(() => /draft v\d/i.test(document.body.innerText));
  await ctx2.close();
  const checks = {
    savedAfterInitialLoad: afterLoad === 'Saved',
    unsavedWhileStaged: seen.has('Unsaved'),
    savingWhileInFlight: seen.has('Saving…'),
    savedAfterAcknowledgement: settled === 'Saved',
    offChapterErrorVisible: errorElsewhere === 'Save unavailable',
    offChapterConflictVisible: conflictElsewhere === 'Needs attention',
    draftCounterAbsent: !/draft v\d/i.test(footerText) && !pageHasDraftV,
  };
  return { checks, obs: { afterLoad, statesSeen: [...seen].filter(Boolean), settled, errorElsewhere, conflictElsewhere, putStatuses: puts.map((p) => p.status) } };
});

// ── A3 · Section-local conflict containment (R3 + amendment) ───────────────
await law('A3', async () => {
  const m = await newManuscript('a3', 6);
  const A = m.by['Scene 1.1'], B = m.by['Scene 2.1'], C3 = m.by['Scene 10.1'], D = m.by['Scene 11.1'];
  const c1 = await context(browser); const t1 = await c1.newPage(); const p1 = putLog(t1);
  const c2 = await context(browser); const t2 = await c2.newPage(); const p2 = putLog(t2);
  await openWrite(t1, m.mid, A); await openWrite(t2, m.mid, A);
  await sleep(1500); // mount-time observed-body digests settle
  const editAndLeave = async (page, puts, id, leaveTo, tag) => {
    await clickRail(page, id); const from = puts.length; const mk = MARK(tag);
    await openEditor(page, id); await page.keyboard.type(` ${mk}`, { delay: 5 });
    await clickRail(page, leaveTo);
    const hit = await waitFor(() => puts.slice(from).find((e) => e.section === id) ?? null, 15_000);
    return { status: hit?.status ?? null, mk };
  };
  const markers = (page, id) => page.evaluate((sid) => ({
    section: !!document.querySelector(`[data-rebuild-section="${sid}"] [data-conflict-marker-section]`),
    rail: !!document.querySelector(`[data-imported-structure-node="${sid}"] [data-conflict-marker]`),
    interactiveInMarkers: [...document.querySelectorAll('[data-conflict-marker], [data-conflict-marker-section]')].some((el) => el.querySelector('button, a, input, select, textarea, [role="button"]')),
    resolutionButtons: [...document.querySelectorAll('button, a, [role="button"]')].some((el) => /keep mine|keep yours|use mine|use theirs|take local|take theirs|discard|overwrite|merge|resolve/i.test(el.textContent ?? '')),
  }), id);
  // (1) another writer changes A
  const t1A = await editAndLeave(t1, p1, A, B, 'A3t1A');
  // (2) different-section concurrency: stale-version B with matching observed-body digest saves
  const t2B = await editAndLeave(t2, p2, B, C3, 'A3t2B');
  const bKept = t2B.status === 200 && await persisted(B, t2B.mk);
  // (3) same-section concurrency: stale observed A conflicts
  const t2A = await editAndLeave(t2, p2, A, B, 'A3t2A');
  await clickRail(t2, A);
  const afterConflict = { state: await saveState(t2), ...(await markers(t2, A)) };
  const aNotOverwritten = !(await persisted(A, t2A.mk)) && await persisted(A, t1A.mk);
  // (4) unrelated section saves while A stays conflicted and marked
  const t2C = await editAndLeave(t2, p2, C3, D, 'A3t2C');
  const cKept = t2C.status === 200 && await persisted(C3, t2C.mk);
  await clickRail(t2, A);
  await sleep(800);
  const afterUnrelated = { state: await saveState(t2), ...(await markers(t2, A)) };
  const aStillNotOverwritten = !(await persisted(A, t2A.mk));
  await c1.close(); await c2.close();
  // (6) no valid digest ⇒ the draft-version rule alone decides
  const ctxRows = await api(`/api/writers-studio/rebuild/context?manuscriptId=${m.mid}`);
  const cur = Number(ctxRows.json.version);
  const bodyOf = (id) => ctxRows.json.sections.find((x) => x.draftSectionId === id).body;
  const sha = (b) => crypto.createHash('sha256').update(b, 'utf8').digest('hex');
  const put = (id, body, baseVersion, digest) => api(`/api/sovereign/manuscripts/${m.mid}/sections/${id}`, { method: 'PUT', body: digest === undefined ? { body, baseVersion } : { body, baseVersion, observedBodySha256: digest } });
  const noDigest = await put(D, bodyOf(D) + ' LS1MARKnodigest', cur - 1);
  const badDigest = await put(D, bodyOf(D) + ' LS1MARKbaddigest', cur - 1, 'not-a-digest');
  // (7) the comparison is atomic under the lock: concurrent saves from ONE observation ⇒ exactly one winner
  const rounds = [];
  for (let r = 0; r < 3; r++) {
    const snap = await api(`/api/writers-studio/rebuild/context?manuscriptId=${m.mid}`);
    const v = Number(snap.json.version); const bodyD = snap.json.sections.find((x) => x.draftSectionId === D).body;
    const res = await Promise.all(Array.from({ length: 8 }, (_, i) => put(D, `${bodyD} LS1MARKrace${r}_${i}`, v - 1, sha(bodyD))));
    rounds.push(res.filter((x) => x.status === 200).length);
  }
  // (9) the digest is over the EXACT bytes the context route delivers — no Unicode or whitespace normalization
  const rawBody = 'Synthetic cafe\u0301 line, decomposed accent.\n\n  trailing spaces and blank lines  \n\n';
  let snapN = await api(`/api/writers-studio/rebuild/context?manuscriptId=${m.mid}`);
  const setRaw = await put(C3, rawBody, Number(snapN.json.version));
  snapN = await api(`/api/writers-studio/rebuild/context?manuscriptId=${m.mid}`);
  const deliveredExact = snapN.json.sections.find((x) => x.draftSectionId === C3).body === rawBody;
  await q('BEGIN');
  await q(`UPDATE manuscript_draft_sections SET text = text || $2, updated_at = now() WHERE id = $1`, [D, ' elsewhere-n']);
  await q(`UPDATE manuscript_working_drafts d SET version = version + 1, content = (SELECT string_agg(text, '' ORDER BY position) FROM manuscript_draft_sections WHERE draft_id = d.id) WHERE manuscript_id = $1`, [m.mid]);
  await q('COMMIT');
  const vN = Number((await api(`/api/writers-studio/rebuild/context?manuscriptId=${m.mid}`)).json.version);
  const normalizedAttempt = await put(C3, `${rawBody} LS1MARKnorm`, vN - 1, sha(rawBody.normalize('NFC').trim()));
  const exactAttempt = await put(C3, `${rawBody} LS1MARKexact`, vN - 1, sha(rawBody));
  // (8) digest ordering: the digest of the LATEST acknowledged body wins, whatever order digests resolve in.
  // Every page-side SHA-256 (the mount-time digests of the delivered bodies) is held for 12 s, so two
  // acknowledged saves of B land FIRST and the stale digest of B's delivered body resolves LAST.
  const c3 = await context(browser);
  await c3.addInitScript(() => { window.__ls1DigestDelays = Array.from({ length: 64 }, () => 12_000); });
  const t3 = await c3.newPage(); const p3 = putLog(t3);
  await openWrite(t3, m.mid, B);
  const s1 = await editAndLeave(t3, p3, B, C3, 'A3o1');
  const s2 = await editAndLeave(t3, p3, B, C3, 'A3o2');
  const lateBeforeAcks = await t3.evaluate(() => window.__ls1LateDigests);
  if (lateBeforeAcks !== 0) throw new Error(`ordering precondition not reached: ${lateBeforeAcks} held digests resolved before both acknowledgements`);
  const lateResolved = await waitFor(async () => ((await t3.evaluate(() => window.__ls1LateDigests)) >= m.ids.length ? true : null), 30_000);
  if (!lateResolved) throw new Error('ordering precondition not reached: held digests did not resolve');
  await sleep(500);
  await q('BEGIN');
  await q(`UPDATE manuscript_draft_sections SET text = text || $2, updated_at = now() WHERE id = $1`, [D, ' elsewhere-o']);
  await q(`UPDATE manuscript_working_drafts d SET version = version + 1, content = (SELECT string_agg(text, '' ORDER BY position) FROM manuscript_draft_sections WHERE draft_id = d.id) WHERE manuscript_id = $1`, [m.mid]);
  await q('COMMIT');
  const s3 = await editAndLeave(t3, p3, B, C3, 'A3o3');
  const s3Kept = s3.status === 200 && await persisted(B, s3.mk);
  await c3.close();
  const checks = {
    differentSectionSaves: bKept,
    sameSectionConflicts: t2A.status === 409 && aNotOverwritten,
    conflictVisibleWholeDraft: afterConflict.state === 'Needs attention',
    conflictMarkedAtSection: afterConflict.section === true && afterConflict.rail === true,
    unrelatedSavesWhileConflicted: cKept,
    conflictPersistsAfterUnrelatedSave: afterUnrelated.state === 'Needs attention' && afterUnrelated.section === true && afterUnrelated.rail === true && aStillNotOverwritten,
    noResolutionUi: !afterConflict.interactiveInMarkers && !afterConflict.resolutionButtons && !afterUnrelated.interactiveInMarkers && !afterUnrelated.resolutionButtons,
    missingDigestFallsBackToVersionRule: noDigest.status === 409,
    invalidDigestFallsBackToVersionRule: badDigest.status === 409,
    lockedComparisonSingleWinner: rounds.every((n) => n === 1),
    digestOverExactDeliveredBytes: setRaw.status === 200 && deliveredExact && normalizedAttempt.status === 409 && exactAttempt.status === 200,
    latestAcknowledgedDigestWins: s1.status === 200 && s2.status === 200 && s3Kept,
  };
  return { checks, obs: { t1A: t1A.status, t2B: t2B.status, t2A: t2A.status, t2C: t2C.status, afterConflict, afterUnrelated, noDigest: noDigest.status, badDigest: badDigest.status, raceWinnersPerRound: rounds, exactBytes: { setRaw: setRaw.status, deliveredExact, normalizedAttempt: normalizedAttempt.status, exactAttempt: exactAttempt.status }, orderingSaves: [s1.status, s2.status, s3.status], orderingS3Persisted: s3Kept } };
});

// ── A4 · Departure (R4) ────────────────────────────────────────────────────
await law('A4', async () => {
  const m = await newManuscript('a4', 8);
  const s11 = m.by['Scene 1.1'];
  // (a) dirty departure is guarded, and text survives the refusal to leave
  const ctxA = await context(browser); const pa = await ctxA.newPage();
  let dialogA = null; pa.on('dialog', async (d) => { dialogA = d.type(); await d.dismiss(); });
  await openWrite(pa, m.mid, s11); await openEditor(pa, s11);
  const mkA = MARK('A4a'); await pa.keyboard.type(` ${mkA}`, { delay: 5 });
  await pa.reload({ timeout: 5000 }).catch(() => {});
  await sleep(500);
  const stillHasText = await pa.evaluate((mk) => document.body.innerText.includes(mk) || [...document.querySelectorAll('textarea')].some((t) => t.value.includes(mk)), mkA);
  // (e) no browser-side copy of prose, checked while the text is live
  const storage = await pa.evaluate(async (mk) => {
    const inWeb = (st) => { for (let i = 0; i < st.length; i++) { const k = st.key(i); if ((k ?? '').includes(mk) || (st.getItem(k) ?? '').includes(mk)) return true; } return false; };
    let inIdb = false;
    try {
      for (const info of (await indexedDB.databases?.()) ?? []) {
        const dbx = await new Promise((res, rej) => { const r = indexedDB.open(info.name); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
        for (const store of dbx.objectStoreNames) {
          const all = await new Promise((res) => { const t = dbx.transaction(store, 'readonly').objectStore(store).getAll(); t.onsuccess = () => res(t.result); t.onerror = () => res([]); });
          if (JSON.stringify(all).includes(mk)) inIdb = true;
        }
        dbx.close();
      }
    } catch { /* unreadable ⇒ reported below as not established */ }
    return { local: inWeb(localStorage), session: inWeb(sessionStorage), indexedDB: inIdb };
  }, mkA);
  await ctxA.close();
  // (b) an eligible departure save rides keepalive and persists after the page is gone
  const ctxB = await context(browser); const pb = await ctxB.newPage();
  let dialogB = null; pb.on('dialog', async (d) => { dialogB = d.type(); await d.accept(); });
  await openWrite(pb, m.mid, s11); await openEditor(pb, s11);
  const mkB = MARK('A4b'); await pb.keyboard.type(` ${mkB}`, { delay: 5 });
  await pb.close({ runBeforeUnload: true });
  const keptAfterLeave = await waitFor(() => persisted(s11, mkB), 8000);
  await ctxB.close();
  // (c) once acknowledged, leaving is not guarded
  const ctxC = await context(browser); const pc = await ctxC.newPage(); const putsC = putLog(pc);
  let dialogC = null; pc.on('dialog', async (d) => { dialogC = d.type(); await d.dismiss(); });
  await openWrite(pc, m.mid, s11); await openEditor(pc, s11);
  await pc.keyboard.type(` ${MARK('A4c')}`, { delay: 5 });
  await waitFor(async () => (await saveState(pc)) === 'Saved' && putsC.some((p) => p.status === 200) ? true : null, 10_000);
  const smallPut = (await pc.evaluate(() => window.__ls1Puts ?? []))[0] ?? null;
  await pc.reload({ timeout: 30_000 }).catch(() => {});
  await ctxC.close();
  // (d) oversized / unconfirmed departure stays guarded and never claims Saved
  const ctxD = await context(browser); const pd = await ctxD.newPage();
  let dialogD = null; pd.on('dialog', async (d) => { dialogD = d.type(); await d.dismiss(); });
  await pd.route('**/sections/**', async (route) => { if (route.request().method() === 'PUT') { await sleep(60_000); } await route.continue().catch(() => {}); });
  await openWrite(pd, m.mid, s11); await openEditor(pd, s11);
  const big = ` ${MARK('A4d')} ` + 'x'.repeat(60 * 1024);
  await pd.locator(`textarea[data-authored-body="${s11}"]`).fill(await pd.locator(`textarea[data-authored-body="${s11}"]`).inputValue() + big);
  await pd.locator('[data-imported-structure-node]').first().locator(':scope > div > button:nth-of-type(2)').click().catch(() => {});
  const statesD = new Set(); const tD = Date.now(); while (Date.now() - tD < 4000) { statesD.add(await saveState(pd)); await sleep(100); }
  const bigPut = (await pd.evaluate(() => window.__ls1Puts ?? [])).filter((p) => (p.bytes ?? 0) > 48 * 1024)[0] ?? null;
  await pd.reload({ timeout: 5000 }).catch(() => {});
  await sleep(500);
  await ctxD.close().catch(() => {});
  // (f) an ELIGIBLE (keepalive-sized) save whose outcome is not yet known
  const ctxF = await context(browser); const pf = await ctxF.newPage();
  let dialogF = null; pf.on('dialog', async (d) => { dialogF = d.type(); await d.dismiss(); });
  await pf.route('**/sections/**', async (route) => { if (route.request().method() === 'PUT') { await sleep(60_000); } await route.continue().catch(() => {}); });
  await openWrite(pf, m.mid, s11); await openEditor(pf, s11);
  await pf.keyboard.type(` ${MARK('A4f')}`, { delay: 5 });
  await pf.locator('[data-imported-structure-node]').first().locator(':scope > div > button:nth-of-type(2)').click().catch(() => {});
  const statesF = new Set(); const tF = Date.now(); while (Date.now() - tF < 4000) { statesF.add(await saveState(pf)); await sleep(100); }
  const eligibleHeldPut = (await pf.evaluate(() => window.__ls1Puts ?? []))[0] ?? null;
  await pf.reload({ timeout: 5000 }).catch(() => {});
  await sleep(500);
  await ctxF.close().catch(() => {});
  const checks = {
    unconfirmedEligibleNeverClaimsSaved: eligibleHeldPut?.keepalive === true && !statesF.has('Saved'),
    unconfirmedEligibleDepartureGuarded: dialogF === 'beforeunload',
    dirtyDepartureGuarded: dialogA === 'beforeunload',
    textSurvivesRefusedDeparture: stillHasText === true,
    eligibleDepartureUsesKeepalive: smallPut?.keepalive === true,
    eligibleDeparturePersistsAfterLeave: keptAfterLeave === true && dialogB === 'beforeunload',
    acknowledgedDepartureNotGuarded: dialogC === null,
    oversizedSaveNotKeepalive: bigPut !== null && bigPut.keepalive === false,
    unconfirmedNeverClaimsSaved: !statesD.has('Saved'),
    unconfirmedDepartureGuarded: dialogD === 'beforeunload',
    noLocalStorageProse: storage.local === false,
    noSessionStorageProse: storage.session === false,
    noIndexedDbProse: storage.indexedDB === false,
  };
  return { checks, obs: { dialogA, dialogB, dialogC, dialogD, smallPut, bigPut: bigPut && { keepalive: bigPut.keepalive, overBudget: bigPut.bytes > 48 * 1024 }, statesWhileUnconfirmed: [...statesD].filter(Boolean), statesWhileEligibleUnconfirmed: [...statesF].filter(Boolean), dialogF, storage } };
});

// ── A5 · Full Canvas continuity (R5) ───────────────────────────────────────
await law('A5', async () => {
  const m = await newManuscript('a5', 8);
  const s11 = m.by['Scene 1.1'];
  const ctx = await context(browser); const page = await ctx.newPage();
  await openWrite(page, m.mid, s11);
  const establish = async () => {
    await openEditor(page, s11);
    await page.evaluate((id) => { const t = document.querySelector(`textarea[data-authored-body="${id}"]`); t.focus(); t.setSelectionRange(5, 12); t.__ls1node = t.__ls1node ?? Math.random(); document.querySelector(`[data-rebuild-section="${id}"]`).__ls1wrap = document.querySelector(`[data-rebuild-section="${id}"]`).__ls1wrap ?? Math.random(); }, s11);
    return editorTuple(page);
  };
  const marks = () => page.evaluate((id) => ({ node: document.querySelector(`textarea[data-authored-body="${id}"]`)?.__ls1node ?? null, wrap: document.querySelector(`[data-rebuild-section="${id}"]`)?.__ls1wrap ?? null }), s11);
  const same = (a, b) => a.tag === 'TEXTAREA' && a.tag === b.tag && a.section === b.section && a.start === b.start && a.end === b.end && a.bodyDigest === b.bodyDigest;
  const toCanvas = () => page.waitForSelector('main[data-pure-canvas="true"]');
  const toResting = () => page.waitForSelector('main[data-pure-canvas="false"]');
  // Escape must RETURN; if it does not, that is a failed law, not an instrument error.
  const escapeReturns = async () => { try { await page.waitForSelector('main[data-pure-canvas="false"]', { timeout: 5000 }); return true; } catch { await page.locator('button.wsr-return-workspace').click().catch(() => {}); await toResting(); return false; } };
  // pointer entry → pointer Return
  const p0 = await establish(); const m0 = await marks();
  await page.locator('[data-pure-canvas-toggle]').click(); await toCanvas(); await sleep(300);
  const p1 = await editorTuple(page); const m1 = await marks();
  await page.locator('button.wsr-return-workspace').click(); await toResting(); await sleep(300);
  const p2 = await editorTuple(page); const m2 = await marks();
  // keyboard activation (Shift+Tab to the existing toggle, Enter) → Escape
  const shiftTabTo = async (sel) => { for (let i = 0; i < 30; i++) { await page.keyboard.press('Shift+Tab'); if (await page.evaluate((s) => document.activeElement?.matches?.(s) ?? false, sel)) return i + 1; } return null; };
  const k0 = await establish();
  const tabsEnter = await shiftTabTo('[data-pure-canvas-toggle]');
  await page.keyboard.press('Enter'); await toCanvas(); await sleep(400);
  const k1 = await editorTuple(page);
  await page.keyboard.press('Escape'); const escK = await escapeReturns(); await sleep(300);
  const k2 = await editorTuple(page); const mk2 = await marks();
  // keyboard activation with Space
  const sp0 = await establish();
  const tabsSpace = await shiftTabTo('[data-pure-canvas-toggle]');
  await page.keyboard.press('Space'); await toCanvas(); await sleep(400);
  const sp1 = await editorTuple(page);
  await page.keyboard.press('Escape'); const escS = await escapeReturns(); await sleep(300);
  await ctx.close();
  // no new keyboard shortcut: the room's keydown handling is exactly canonical's
  const count = (src) => (src.match(/keydown/g) ?? []).length;
  const candSrc = fs.readFileSync(path.join(ROOT, 'app/writers-studio/rebuild/RebuildStudioClient.tsx'), 'utf8');
  const baseSrc = (await import('node:child_process')).execSync(`git -C "${ROOT}" show e886888416062c7fcbcf899040e3827bc8013835:app/writers-studio/rebuild/RebuildStudioClient.tsx`, { encoding: 'utf8', maxBuffer: 1 << 26 });
  const checks = {
    pointerEntryPreservesTuple: same(p0, p1),
    pointerReturnPreservesTuple: same(p0, p2),
    pointerPathSameEditorNode: m0.node !== null && m0.node === m1.node && m1.node === m2.node,
    sectionNeverRemounted: m0.wrap !== null && m0.wrap === m1.wrap && m1.wrap === m2.wrap && m2.wrap === mk2.wrap,
    keyboardEnterEntryRestoresTuple: tabsEnter !== null && same(k0, k1),
    escapeReturnsFromFullCanvas: escK === true && escS === true,
    escapeReturnPreservesTuple: escK === true && same(k0, k2),
    keyboardSpaceEntryRestoresTuple: tabsSpace !== null && same(sp0, sp1),
    noNewKeyboardShortcut: count(candSrc) === count(baseSrc),
  };
  const strip = (t) => ({ tag: t.tag, sameSection: t.section === s11, start: t.start, end: t.end });
  return { checks, obs: { pointer: [p0, p1, p2].map(strip), keyboardEnter: [k0, k1, k2].map(strip), keyboardSpace: [sp0, sp1].map(strip), shiftTabsToToggle: { enter: tabsEnter, space: tabsSpace } } };
});

await browser.close();
await db.end();
results.finishedAt = new Date().toISOString();
fs.writeFileSync(OUT, JSON.stringify(results, null, 2));
