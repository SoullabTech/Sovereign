// A1-LS0 · E1 baseline defeat witness (S1–S9).
//
// Runs against the UNMODIFIED canonical app served by ls0-e1-server.sh.
// Every manuscript is synthetic and built through the app's own routes.
// Evidence records identities, states, codes and booleans only — never
// manuscript prose. Each scenario's outcome is computed HERE, by a rule
// declared before the run, never assigned afterwards:
//   RED_REPRODUCED · CANONICAL_PREVENTS_IT · INSTRUMENT_FAILURE
// S9 is a GREEN control: GREEN_CONTROL_ESTABLISHED · GREEN_CONTROL_NOT_ESTABLISHED
// · INSTRUMENT_FAILURE.
//
// Usage: node ls0-e1-witness.mjs <canonical_root> <base_url> <identity.env> <stub_log> <out.json> <config_label>
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';

const [ROOT, BASE, IDENTITY, STUB_LOG, OUT, CONFIG] = process.argv.slice(2);
const require = createRequire(path.join(ROOT, 'package.json'));
const { chromium } = require('playwright');
const pg = require('pg');

const ident = Object.fromEntries(fs.readFileSync(IDENTITY, 'utf8').trim().split('\n').map((l) => l.split('=')));
const TOKEN = ident.LS0_SESSION_A_TOKEN;
const TOKEN_B = ident.LS0_SESSION_B_TOKEN;
const db = new pg.Client({ connectionString: 'postgresql://soullab@127.0.0.1:55432/maia_consciousness' });
const results = { config: CONFIG, startedAt: new Date().toISOString(), scenarios: {} };
const T_NAV = 180_000; // first compile of a route under next dev can be slow
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── synthetic manuscripts ──────────────────────────────────────────────────
const filler = (label, n) => Array.from({ length: n }, (_, i) => `Synthetic line ${i + 1} of ${label}.`).join('\n\n');
const SPEC_CH10 = [
  ['Chapter 1: Synthetic One', 1], ['Scene 1.1', 2], ['Chapter 2: Synthetic Two', 1], ['Scene 2.1', 2],
  ['Chapter 10: Synthetic Ten', 1], ['Scene 10.1', 2], ['Chapter 11: Synthetic Eleven', 1], ['Scene 11.1', 2],
];
const SPEC_PLAIN = [
  ['Chapter 1: Synthetic One', 1], ['Scene 1.1', 2], ['Chapter 2: Synthetic Two', 1], ['Scene 2.1', 2],
  ['Chapter 3: Synthetic Three', 1], ['Scene 3.1', 2],
];
async function api(p, { method = 'GET', body, headers = {}, token = TOKEN } = {}) {
  const res = await fetch(BASE + p, {
    method,
    headers: { cookie: `maia_session=${token}`, ...(body !== undefined ? { 'content-type': 'application/json' } : {}), ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let json = null;
  try { json = await res.json(); } catch { /* not json */ }
  return { status: res.status, json };
}
async function newManuscript(tag, spec, lines = 30, token = TOKEN) {
  const sections = spec.map(([heading, depth]) => ({ heading, body: filler(`${tag}/${heading}`, lines), headingDepth: depth, headingSignal: 'markdown' }));
  const m = await api('/api/sovereign/manuscripts', { method: 'POST', body: { title: `LS0 synthetic ${tag}`, sections }, token });
  const mid = m.json?.id ?? m.json?.manuscriptId ?? m.json?.manuscript?.id;
  if (m.status >= 300 || !mid) throw new Error(`manuscript create ${m.status}`);
  const d = await api(`/api/sovereign/manuscripts/${mid}/draft`, { method: 'POST', token });
  if (d.status !== 201) throw new Error(`draft create ${d.status}`);
  const ids = d.json.sections.map((s) => s.id);
  const byHeading = Object.fromEntries(spec.map(([h], i) => [h, ids[i]]));
  return { mid, ids, byHeading };
}
const q = async (sql, params) => (await db.query(sql, params)).rows;
const stubCount = () => (fs.existsSync(STUB_LOG) ? fs.readFileSync(STUB_LOG, 'utf8').split('\n').filter(Boolean).length : 0);
const MARK = (k) => `LS0MARK${k}${crypto.randomBytes(3).toString('hex')}`;
async function persisted(sectionId, marker) {
  const r = await q('SELECT position(($2)::text in text) > 0 AS has FROM manuscript_draft_sections WHERE id = $1', [sectionId, marker]);
  return r[0]?.has === true;
}

// ── page helpers ───────────────────────────────────────────────────────────
async function context(browser, token = TOKEN) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addCookies([{ name: 'maia_session', value: token, url: BASE }]);
  return ctx;
}
async function openWrite(page, mid, s) {
  const url = `/writers-studio/rebuild?m=${mid}${s ? `&s=${s}` : ''}`;
  await page.goto(BASE + url, { timeout: T_NAV });
  await page.waitForSelector('[data-rebuild-section]', { timeout: T_NAV });
  await sleep(400);
}
const focusedIdOnce = (page) => page.evaluate(() => {
  const hits = [];
  for (const node of document.querySelectorAll('[data-imported-structure-node]')) {
    const btn = node.querySelector(':scope > div > button:nth-of-type(2)');
    if (!btn) continue;
    const cs = getComputedStyle(btn);
    if (cs.borderLeftWidth === '3px' && cs.borderLeftColor !== 'rgba(0, 0, 0, 0)' && cs.borderLeftColor !== 'transparent') hits.push(node.getAttribute('data-imported-structure-node'));
  }
  return hits.length === 1 ? hits[0] : (hits.length === 0 ? null : `AMBIGUOUS:${hits.length}`);
});
// The rail mounts after the structure fetch settles (~1.5 s); poll for it.
async function focusedId(page, timeout = 15_000) {
  const t0 = Date.now(); let last = null;
  while (Date.now() - t0 < timeout) { last = await focusedIdOnce(page); if (last !== null) return last; await sleep(250); }
  return last;
}
const renderedIds = (page) => page.$$eval('[data-rebuild-section]', (els) => els.map((e) => e.getAttribute('data-rebuild-section')));
const searchParam = (page, k) => page.evaluate((key) => new URLSearchParams(location.search).get(key), k);
const footerStatus = (page) => page.evaluate(() => {
  const span = [...document.querySelectorAll('span')].find((s) => /words · draft v\d+/.test(s.textContent ?? ''));
  if (!span) return { found: false };
  const t = span.textContent;
  const m = t.match(/draft v(\d+)(?: · (.+))?$/);
  return { found: true, draftV: m ? Number(m[1]) : null, label: m && m[2] ? m[2] : null };
});
const canvasStatus = (page) => page.evaluate(() => {
  const el = document.querySelector('[role="status"]');
  return el ? (el.textContent ?? '').trim() || null : null;
});
async function clickRail(page, id) {
  await page.locator(`[data-imported-structure-node="${id}"] > div > button:nth-of-type(2)`).first().click();
  await sleep(700);
}
async function typeInto(page, id, text) {
  await page.locator(`[data-authored-body="${id}"]`).first().click();
  await page.waitForSelector(`textarea[data-authored-body="${id}"]`, { timeout: 15_000 });
  await page.keyboard.type(text, { delay: 5 });
}
function putWatcher(page) {
  const log = [];
  page.on('response', (r) => {
    const u = r.url();
    const m = u.match(/\/api\/sovereign\/manuscripts\/[^/]+\/sections\/([^/?]+)/);
    if (m && r.request().method() === 'PUT') log.push({ section: m[1], status: r.status(), at: Date.now() });
  });
  return log;
}
async function waitPut(log, section, from = 0, timeout = 20_000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    const hit = log.slice(from).find((e) => e.section === section);
    if (hit) return hit;
    await sleep(150);
  }
  return null;
}
const activeState = (page) => page.evaluate(() => {
  const a = document.activeElement;
  const ta = a && a.tagName === 'TEXTAREA' ? a : null;
  return {
    tag: a ? a.tagName : null,
    section: a ? a.getAttribute('data-authored-body') : null,
    selStart: ta ? ta.selectionStart : null,
    selEnd: ta ? ta.selectionEnd : null,
  };
});

async function scenario(name, fn) {
  const t0 = Date.now();
  try {
    results.scenarios[name] = await fn();
  } catch (e) {
    results.scenarios[name] = { outcome: 'INSTRUMENT_FAILURE', basis: `exception: ${String(e?.message ?? e).slice(0, 200)}` };
  }
  results.scenarios[name].ms = Date.now() - t0;
  process.stdout.write(`${name}: ${results.scenarios[name].outcome}\n`);
}

await db.connect();
const browser = await chromium.launch();

// ── warm-up (compiles routes; never evidence) ──────────────────────────────
{
  const w = await newManuscript('warmup', SPEC_PLAIN, 2);
  const ctx = await context(browser); const page = await ctx.newPage();
  await openWrite(page, w.mid);
  await page.goto(BASE + '/writers-studio', { timeout: T_NAV });
  await api(`/api/sovereign/manuscripts/${w.mid}/readings`, { method: 'POST', body: { lens: 'structure' } });
  await api(`/api/sovereign/manuscripts/${w.mid}/locus`);
  await api(`/api/sovereign/living-works`);
  await ctx.close();
  fs.writeFileSync(STUB_LOG + '.warmup-count', String(stubCount()));
}

// ── S1 arrival fallback / stale place (#8b, #10) ───────────────────────────
await scenario('S1', async () => {
  const a = await newManuscript('s1-ch10', SPEC_CH10);
  const b = await newManuscript('s1-plain', SPEC_PLAIN);
  const ctx = await context(browser); const page = await ctx.newPage();
  const puts = putWatcher(page);
  // Establish a member place away from Chapter 10: write and save in Scene 1.1.
  await openWrite(page, a.mid, a.byHeading['Scene 1.1']);
  const mk = MARK('S1');
  const before = puts.length;
  await typeInto(page, a.byHeading['Scene 1.1'], ` ${mk}`);
  await page.locator(`[data-imported-structure-node="${a.byHeading['Chapter 2: Synthetic Two']}"] > div > button:nth-of-type(2)`).first().click();
  const saved = await waitPut(puts, a.byHeading['Scene 1.1'], before);
  const savedOk = saved?.status === 200 && await persisted(a.byHeading['Scene 1.1'], mk);
  // (a) heading present, no ?s
  await openWrite(page, a.mid);
  const aFocus = await focusedId(page);
  // (b) heading absent, no ?s
  await openWrite(page, b.mid);
  const bFocus = await focusedId(page);
  // (c) valid ?s
  await openWrite(page, a.mid, a.byHeading['Scene 2.1']);
  const cFocus = await focusedId(page);
  // (d) stale ?s
  const stale = crypto.randomUUID();
  await openWrite(page, a.mid, stale);
  const dFocus = await focusedId(page);
  const dAddr = await searchParam(page, 's');
  const devHref = await page.evaluate(() => [...document.querySelectorAll('a')].find((x) => (x.textContent ?? '').trim().startsWith('Develop'))?.getAttribute('href') ?? null);
  await ctx.close();
  const ch10 = a.byHeading['Chapter 10: Synthetic Ten'];
  const obs = {
    memberPlaceEstablished: savedOk, memberSavedSection: 'Scene 1.1',
    a_headingPresent_noS_resolved: aFocus === ch10 ? 'Chapter 10 root' : aFocus === a.byHeading['Scene 1.1'] ? 'Scene 1.1 (member place)' : aFocus === a.ids[0] ? 'first section' : aFocus,
    b_headingAbsent_noS_resolved: bFocus === b.ids[0] ? 'first section' : bFocus,
    c_validS_resolved: cFocus === a.byHeading['Scene 2.1'] ? 'requested section' : cFocus,
    d_staleS_resolved: dFocus === ch10 ? 'Chapter 10 root' : dFocus === a.ids[0] ? 'first section' : dFocus,
    d_staleS_retainedInAddress: dAddr === stale,
    d_staleS_carriedIntoDevelopLink: devHref ? devHref.includes(stale) : null,
  };
  if (!savedOk || aFocus == null || bFocus == null || cFocus == null || dFocus == null || String(aFocus).startsWith('AMBIGUOUS')) {
    return { outcome: 'INSTRUMENT_FAILURE', basis: 'precondition or focus observation failed', obs };
  }
  // Predicted failure: arrival without ?s resolves to the hard-coded heading, not the member's place;
  // a stale ?s is not rewritten and travels.
  const red = aFocus === ch10 && dFocus === ch10 && obs.d_staleS_retainedInAddress === true;
  return { outcome: red ? 'RED_REPRODUCED' : 'CANONICAL_PREVENTS_IT', basis: red ? 'no-?s arrival and stale-?s arrival both resolved to the "Chapter 10" heading while the member had saved in Scene 1.1; stale ?s retained in address' : 'predicted fallback did not occur as a whole', obs };
});

// ── S2 same-tab reload (#9) ────────────────────────────────────────────────
await scenario('S2', async () => {
  const m = await newManuscript('s2', SPEC_PLAIN, 60);
  const ctx = await context(browser); const page = await ctx.newPage();
  let contextFetches = 0;
  page.on('request', (r) => { if (r.url().includes('/api/writers-studio/rebuild/context')) contextFetches += 1; });
  await openWrite(page, m.mid);
  const target = m.byHeading['Scene 3.1'];
  const fetchesBeforeClick = contextFetches;
  await clickRail(page, target);
  await sleep(1500);
  const afterClick = { focus: await focusedId(page), addressS: await searchParam(page, 's'), contextRefetchOnClick: contextFetches - fetchesBeforeClick };
  await page.reload({ timeout: T_NAV });
  await page.waitForSelector('[data-rebuild-section]', { timeout: T_NAV });
  await sleep(1500);
  const inView = await page.evaluate((id) => {
    const el = document.querySelector(`[data-rebuild-section="${id}"]`);
    const sc = document.querySelector('[data-manuscript-scroll]') ?? document.scrollingElement;
    if (!el || !sc) return null;
    const r = el.getBoundingClientRect(); const c = sc.getBoundingClientRect();
    return r.top < c.bottom && r.bottom > c.top;
  }, target);
  const afterReload = { focus: await focusedId(page), addressS: await searchParam(page, 's'), targetInView: inView };
  await ctx.close();
  const obs = {
    afterClick: { focusIsTarget: afterClick.focus === target, addressIsTarget: afterClick.addressS === target, contextRefetchOnClick: afterClick.contextRefetchOnClick },
    afterReload: { focusIsTarget: afterReload.focus === target, addressIsTarget: afterReload.addressS === target, targetInView: afterReload.targetInView },
  };
  if (!obs.afterClick.focusIsTarget || inView === null) return { outcome: 'INSTRUMENT_FAILURE', basis: 'could not establish the navigated place', obs };
  // Predicted failure (#9): the section is recovered but not brought into view.
  const red = obs.afterReload.focusIsTarget && obs.afterReload.targetInView === false;
  return { outcome: red ? 'RED_REPRODUCED' : 'CANONICAL_PREVENTS_IT', basis: red ? 'reload recovered the section identity but did not bring it into view' : (obs.afterReload.focusIsTarget ? 'section recovered and in view' : 'section identity not recovered on reload'), obs };
});

// ── S3 Home reopen / tie (#11) ─────────────────────────────────────────────
await scenario('S3', async () => {
  const m = await newManuscript('s3', SPEC_PLAIN, 30, TOKEN_B);
  const w = await api('/api/sovereign/living-works', { method: 'POST', body: { title: 'LS0 Synthetic Work' }, token: TOKEN_B });
  const wid = w.json?.id ?? w.json?.work?.id ?? w.json?.livingWork?.id;
  const e = await api(`/api/sovereign/living-works/${wid}/expressions`, { method: 'POST', body: { expressionType: 'manuscript', expressionId: m.mid }, token: TOKEN_B });
  if (!wid || e.status >= 300) return { outcome: 'INSTRUMENT_FAILURE', basis: `work/expression setup ${w.status}/${e.status}` };
  const ctx = await context(browser, TOKEN_B); const page = await ctx.newPage();
  const puts = putWatcher(page);
  const heroHref = async (timeout = T_NAV) => {
    // The hero's place comes from the /locus activity read; wait for THAT
    // response (not a fixed delay) before reading the link.
    const locus = page.waitForResponse((r) => /\/api\/sovereign\/manuscripts\/[^/]+\/locus/.test(r.url()), { timeout: 60_000 }).catch(() => null);
    await page.goto(BASE + '/writers-studio', { timeout: T_NAV });
    const link = page.getByRole('link', { name: 'Return to this work' }).first();
    try { await link.waitFor({ timeout }); } catch { return null; }
    const lr = await locus;
    heroLocusStatuses.push(lr ? lr.status() : null);
    await sleep(800);
    return link.getAttribute('href');
  };
  const heroLocusStatuses = [];
  const arrive = async (href) => { await page.goto(BASE + href, { timeout: T_NAV }); await page.waitForSelector('[data-rebuild-section]', { timeout: T_NAV }); await sleep(600); return focusedId(page); };
  const label = (id) => Object.entries(m.byHeading).find(([, v]) => v === id)?.[0] ?? id;
  // (a) before the member has written anything: canonical Home offers no "Return" hero.
  const hrefA = await heroHref(20_000);
  // (b) unique last-saved section (Scene 2.1), then navigate WITHOUT typing to Scene 3.1
  await openWrite(page, m.mid, m.byHeading['Scene 2.1']);
  const mk = MARK('S3'); const before = puts.length;
  await typeInto(page, m.byHeading['Scene 2.1'], ` ${mk}`);
  await clickRail(page, m.byHeading['Scene 3.1']);
  const saved = await waitPut(puts, m.byHeading['Scene 2.1'], before);
  const focusAfterNav = await focusedId(page);
  const hrefB = await heroHref();
  const arrB = hrefB ? await arrive(hrefB) : null;
  // (c) explicit equal-updated_at tie between Scene 2.1 and Scene 3.1
  await q('UPDATE manuscript_draft_sections SET updated_at = (SELECT updated_at FROM manuscript_draft_sections WHERE id = $1) WHERE id = $2', [m.byHeading['Scene 2.1'], m.byHeading['Scene 3.1']]);
  const hrefC = await heroHref();
  const arrC = hrefC ? await arrive(hrefC) : null;
  await ctx.close();
  const sOf = (h) => { try { return new URL(h, BASE).searchParams.get('s'); } catch { return null; } };
  const obs = {
    a_beforeWriting: { returnHeroPresent: hrefA !== null },
    b_uniqueLastSaved: { saveAcknowledged: saved?.status === 200, lastPlaceBeforeLeaving: label(focusAfterNav), heroPresent: hrefB !== null, heroS: hrefB && sOf(hrefB) ? label(sOf(hrefB)) : null, arrival: arrB ? label(arrB) : null },
    c_explicitTie: { heroPresent: hrefC !== null, heroCarriesS: hrefC ? sOf(hrefC) !== null : null, arrival: arrC ? label(arrC) : null },
    locusResponseStatuses: heroLocusStatuses,
  };
  if (saved?.status !== 200 || focusAfterNav !== m.byHeading['Scene 3.1'] || arrB == null || arrC == null || heroLocusStatuses.slice(-2).some((x) => x !== 200)) {
    return { outcome: 'INSTRUMENT_FAILURE', basis: 'precondition not established', obs };
  }
  // Predicted (#11): reopen returns to the last SAVED section, not the last place; a tie falls back.
  const red = arrB === m.byHeading['Scene 2.1'] && arrB !== m.byHeading['Scene 3.1'] && obs.c_explicitTie.heroCarriesS === false;
  return { outcome: red ? 'RED_REPRODUCED' : 'CANONICAL_PREVENTS_IT', basis: red ? 'reopen landed on the last-saved section (Scene 2.1) though the member last stood in Scene 3.1; an equal-updated_at tie carried no place' : 'predicted last-saved/tie behaviour did not occur as a whole', obs };
});

// ── S4 save truth (#17) ────────────────────────────────────────────────────
await scenario('S4', async () => {
  const m = await newManuscript('s4', SPEC_PLAIN, 10);
  const ctx = await context(browser); const page = await ctx.newPage();
  const puts = putWatcher(page);
  await openWrite(page, m.mid, m.byHeading['Scene 1.1']);
  const s11 = m.byHeading['Scene 1.1'];
  // (a) acknowledged persistence: does "Saved" ever appear?
  const mk = MARK('S4'); let from = puts.length;
  await typeInto(page, s11, ` ${mk}`);
  const labelsSeen = new Set(); const t0 = Date.now(); let ack = null;
  while (Date.now() - t0 < 8000) {
    const f = await footerStatus(page); if (f.found) labelsSeen.add(f.label ?? '(none)');
    if (!ack) ack = puts.slice(from).find((e) => e.section === s11) ?? null;
    await sleep(100);
  }
  const persistedA = await persisted(s11, mk);
  // (b) failure outside the current chapter: another writer advances the draft
  //     (synthetic fault: version bumped in E1), then an edit here is refused.
  await q('UPDATE manuscript_working_drafts SET version = version + 1 WHERE manuscript_id = $1', [m.mid]);
  from = puts.length;
  await typeInto(page, s11, ` ${MARK('S4b')}`);
  await clickRail(page, m.byHeading['Scene 2.1']);
  const refused = await waitPut(puts, s11, from);
  await sleep(1200);
  const otherChapterFooter = await footerStatus(page);
  await clickRail(page, s11);
  await sleep(800);
  const sameChapterFooter = await footerStatus(page);
  await ctx.close();
  const obs = {
    a: { saveAcknowledged: ack?.status === 200, persisted: persistedA, footerLabelsSeen: [...labelsSeen], savedLabelEverShown: [...labelsSeen].some((l) => /saved/i.test(l) && !/unsaved/i.test(l)) },
    b: { editRefusedStatus: refused?.status ?? null, footerInOtherChapter: otherChapterFooter.label, footerBackInFailingChapter: sameChapterFooter.label },
  };
  if (!obs.a.saveAcknowledged || !obs.a.persisted || obs.b.editRefusedStatus !== 409 || !sameChapterFooter.found) return { outcome: 'INSTRUMENT_FAILURE', basis: 'precondition not established', obs };
  const hidden = otherChapterFooter.label === null && /needs attention/i.test(sameChapterFooter.label ?? '');
  const red = !obs.a.savedLabelEverShown && hidden;
  return { outcome: red ? 'RED_REPRODUCED' : 'CANONICAL_PREVENTS_IT', basis: red ? '"Saved" never shown after acknowledged persistence; a refused save in chapter 1 showed nothing from chapter 2 and "Needs attention" only on return' : 'predicted save-truth failure did not occur as a whole', obs };
});

// ── S5 conflict latch (#19, #22) ───────────────────────────────────────────
await scenario('S5', async () => {
  const m = await newManuscript('s5', SPEC_PLAIN, 10);
  const ctxA = await context(browser); const pa = await ctxA.newPage(); const putsA = putWatcher(pa);
  const ctxB = await context(browser); const pb = await ctxB.newPage(); const putsB = putWatcher(pb);
  const c1 = m.byHeading['Chapter 1: Synthetic One']; const s11 = m.byHeading['Scene 1.1']; const s21 = m.byHeading['Scene 2.1'];
  await openWrite(pa, m.mid, s11); await openWrite(pb, m.mid, s11);
  // Session B writes first and is acknowledged.
  await typeInto(pb, s11, ` ${MARK('S5B')}`);
  await clickRail(pb, s21);
  const bAck = await waitPut(putsB, s11, 0);
  // Session A, still at the older version, edits a DIFFERENT section → stale base.
  const fromA = putsA.length;
  await typeInto(pa, c1, ` ${MARK('S5A')}`);
  await clickRail(pa, s21);
  const aRefused = await waitPut(putsA, c1, fromA);
  // Session A then edits another section and waits well past autosave.
  const mk = MARK('S5Q'); const fromQ = putsA.length;
  await typeInto(pa, s21, ` ${mk}`);
  await clickRail(pa, s11);
  await sleep(6000);
  const after = putsA.slice(fromQ).map((e) => ({ section: e.section === c1 ? 'Chapter 1 root' : e.section === s21 ? 'Scene 2.1' : e.section === s11 ? 'Scene 1.1' : 'other', status: e.status }));
  const qPersisted = await persisted(s21, mk);
  const footer = await footerStatus(pa);
  await ctxA.close(); await ctxB.close();
  const obs = { sessionBAck: bAck?.status ?? null, sessionAFirstRefusal: aRefused?.status ?? null, sessionAPutsAfterLaterEdit: after, laterSectionPersisted: qPersisted, footerSessionA: footer.label };
  if (obs.sessionBAck !== 200 || obs.sessionAFirstRefusal !== 409) return { outcome: 'INSTRUMENT_FAILURE', basis: 'conflict precondition not established', obs };
  const red = qPersisted === false;
  return { outcome: red ? 'RED_REPRODUCED' : 'CANONICAL_PREVENTS_IT', basis: red ? 'after one stale-base refusal, a later edit to a different section was never persisted in that session' : 'later edit persisted after the conflict', obs };
});

// ── S6 unsaved reload / close (#20) ────────────────────────────────────────
await scenario('S6', async () => {
  const m = await newManuscript('s6', SPEC_PLAIN, 10);
  const s11 = m.byHeading['Scene 1.1'];
  const trial = async (kind, waitMs) => {
    const ctx = await context(browser); const page = await ctx.newPage();
    let dialog = false; page.on('dialog', async (d) => { dialog = true; await d.dismiss().catch(() => {}); });
    await openWrite(page, m.mid, s11);
    const mk = MARK('S6');
    await typeInto(page, s11, ` ${mk}`);
    if (waitMs) await sleep(waitMs);
    if (kind === 'reload') { await page.reload({ timeout: T_NAV }).catch(() => {}); }
    else if (kind === 'close') { await page.close({ runBeforeUnload: true }).catch(() => {}); }
    else if (kind === 'navigate') { await page.goto(BASE + '/writers-studio', { timeout: T_NAV }).catch(() => {}); }
    await sleep(4000);
    const kept = await persisted(s11, mk);
    await ctx.close().catch(() => {});
    return { kind, waitMs, persisted: kept, beforeunloadDialog: dialog };
  };
  const trials = [];
  for (const [kind, wait] of [['reload', 0], ['reload', 0], ['reload', 300], ['reload', 300], ['close', 0], ['close', 0], ['navigate', 0], ['reload', 3000]]) trials.push(await trial(kind, wait));
  const control = trials[trials.length - 1];
  const early = trials.slice(0, -1);
  const obs = { trials };
  if (!control.persisted) return { outcome: 'INSTRUMENT_FAILURE', basis: 'control (reload after autosave window) did not persist', obs };
  const lostWithoutWarning = early.filter((t) => !t.persisted && !t.beforeunloadDialog).length;
  const red = lostWithoutWarning > 0;
  return { outcome: red ? 'RED_REPRODUCED' : 'CANONICAL_PREVENTS_IT', basis: red ? `${lostWithoutWarning} of ${early.length} early reload/close/navigate trials lost the unsaved text with no warning` : 'no early trial lost text', obs };
});

// ── S7 Full Canvas pointer vs Escape (#30) ─────────────────────────────────
await scenario('S7', async () => {
  const m = await newManuscript('s7', SPEC_PLAIN, 10);
  const s11 = m.byHeading['Scene 1.1'];
  const ctx = await context(browser); const page = await ctx.newPage();
  await openWrite(page, m.mid, s11);
  const establish = async () => {
    await page.locator(`[data-authored-body="${s11}"]`).first().click();
    await page.waitForSelector(`textarea[data-authored-body="${s11}"]`, { timeout: 15_000 });
    await page.evaluate((id) => { const t = document.querySelector(`textarea[data-authored-body="${id}"]`); t.focus(); t.setSelectionRange(5, 12); }, s11);
    return activeState(page);
  };
  const same = (a, b) => a.tag === b.tag && a.section === b.section && a.selStart === b.selStart && a.selEnd === b.selEnd;
  // Entry (pointer is the only entry)
  const preEntry = await establish();
  await page.locator('[data-pure-canvas-toggle]').click();
  await page.waitForSelector('main[data-pure-canvas="true"]');
  const inCanvasAfterEntry = await activeState(page);
  // Pointer return
  const preReturnP = await establish();
  await page.locator('button.wsr-return-workspace').click();
  await page.waitForSelector('main[data-pure-canvas="false"]');
  await sleep(300);
  const afterPointer = await activeState(page);
  // Keyboard return
  await page.locator('[data-pure-canvas-toggle]').click();
  await page.waitForSelector('main[data-pure-canvas="true"]');
  const preReturnK = await establish();
  await page.keyboard.press('Escape');
  await page.waitForSelector('main[data-pure-canvas="false"]');
  await sleep(300);
  const afterEscape = await activeState(page);
  await ctx.close();
  const obs = { preEntry, inCanvasAfterEntry, entryPreserved: same(preEntry, inCanvasAfterEntry), preReturnPointer: preReturnP, afterPointer, pointerPreserved: same(preReturnP, afterPointer), preReturnEscape: preReturnK, afterEscape, escapePreserved: same(preReturnK, afterEscape) };
  if (preEntry.tag !== 'TEXTAREA' || preReturnP.tag !== 'TEXTAREA' || preReturnK.tag !== 'TEXTAREA') return { outcome: 'INSTRUMENT_FAILURE', basis: 'could not establish a focused selection', obs };
  const red = !obs.pointerPreserved && obs.escapePreserved;
  return { outcome: red ? 'RED_REPRODUCED' : 'CANONICAL_PREVENTS_IT', basis: red ? 'pointer Return lost focus/selection; Escape preserved it' : 'predicted pointer-vs-Escape asymmetry did not occur', obs };
});

// ── S8 Write edit → readings capture refusal (#38) · S9 GREEN control ──────
let s8State = null;
await scenario('S8', async () => {
  const m = await newManuscript('s8', SPEC_PLAIN, 6);
  const ctx = await context(browser); const page = await ctx.newPage(); const puts = putWatcher(page);
  await openWrite(page, m.mid, m.byHeading['Scene 1.1']);
  await typeInto(page, m.byHeading['Scene 1.1'], ` ${MARK('S8')}`);
  await clickRail(page, m.byHeading['Scene 2.1']);
  const ack = await waitPut(puts, m.byHeading['Scene 1.1'], 0);
  await ctx.close();
  const pre = (await q(`SELECT d.version, d.revision_count, (SELECT max(revision_number) FROM working_draft_revisions r WHERE r.draft_id = d.id) AS latest_rev,
                               (SELECT content FROM working_draft_revisions r WHERE r.draft_id = d.id ORDER BY revision_number DESC LIMIT 1) = d.content AS latest_equals_draft
                          FROM manuscript_working_drafts d WHERE d.manuscript_id = $1`, [m.mid]))[0];
  const stubBefore = stubCount();
  const r = await api(`/api/sovereign/manuscripts/${m.mid}/readings`, { method: 'POST', body: { lens: 'structure' } });
  const stubAfter = stubCount();
  const refusal = r.json?.refusal ?? r.json?.code ?? r.json?.error ?? null;
  s8State = { mid: m.mid };
  const obs = { writeSaveAck: ack?.status ?? null, draftVersion: Number(pre.version), revisionCount: Number(pre.revision_count), latestRevision: Number(pre.latest_rev), latestRevisionEqualsDraft: pre.latest_equals_draft, readingsStatus: r.status, refusal, modelBoundaryReached: stubAfter - stubBefore };
  if (obs.writeSaveAck !== 200 || obs.latestRevisionEqualsDraft !== false) return { outcome: 'INSTRUMENT_FAILURE', basis: 'precondition (a Write save that diverges the draft from its latest revision) not established', obs };
  const red = refusal === 'revision_not_current' && obs.modelBoundaryReached === 0;
  return { outcome: red ? 'RED_REPRODUCED' : 'CANONICAL_PREVENTS_IT', basis: red ? 'after a Write save, the real readings capture refused revision_not_current before any model boundary' : 'capture did not refuse revision_not_current', obs };
});

await scenario('S9', async () => {
  if (!s8State) return { outcome: 'INSTRUMENT_FAILURE', basis: 'S8 state unavailable' };
  const mid = s8State.mid;
  const v = Number((await q('SELECT version FROM manuscript_working_drafts WHERE manuscript_id = $1', [mid]))[0].version);
  const cp = await api(`/api/sovereign/manuscripts/${mid}/draft/checkpoint`, { method: 'POST', headers: { 'x-draft-base-revision': String(v), 'idempotency-key': crypto.randomUUID() } });
  const post = (await q(`SELECT d.revision_count, (SELECT content FROM working_draft_revisions r WHERE r.draft_id = d.id ORDER BY revision_number DESC LIMIT 1) = d.content AS latest_equals_draft
                           FROM manuscript_working_drafts d WHERE d.manuscript_id = $1`, [mid]))[0];
  const stubBefore = stubCount();
  const r = await api(`/api/sovereign/manuscripts/${mid}/readings`, { method: 'POST', body: { lens: 'structure' } });
  await sleep(500);
  const stubAfter = stubCount();
  const refusal = r.json?.refusal ?? r.json?.code ?? r.json?.error ?? null;
  const obs = { checkpointStatus: cp.status, revisionCountAfter: Number(post.revision_count), latestRevisionEqualsDraft: post.latest_equals_draft, readingsStatus: r.status, refusal, modelBoundaryReached: stubAfter - stubBefore, stubDesign: 'loopback stub refuses every request with HTTP 400; no inference' };
  if (cp.status >= 300) return { outcome: 'INSTRUMENT_FAILURE', basis: `checkpoint mechanism returned ${cp.status}`, obs };
  const green = post.latest_equals_draft === true && refusal !== 'revision_not_current' && obs.modelBoundaryReached > 0;
  return { outcome: green ? 'GREEN_CONTROL_ESTABLISHED' : 'GREEN_CONTROL_NOT_ESTABLISHED', basis: green ? 'after the existing checkpoint, capture no longer refused revision_not_current; the request reached the structured-model boundary, where the local stub refused it (no inference)' : 'checkpoint did not change the capture outcome as expected', obs };
});

await browser.close();
await db.end();
results.finishedAt = new Date().toISOString();
fs.writeFileSync(OUT, JSON.stringify(results, null, 2));
