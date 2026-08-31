/**
 * WS2-05B-8a · RENDER FIDELITY — does the room show what the row holds?
 *
 * READ ONLY, AND STRUCTURALLY SO. Every mutating request the page attempts is
 * intercepted and ABORTED, and any such attempt fails the witness. This harness
 * cannot edit the reviewed copy, cannot adopt, and cannot write canonical
 * structure - not because it declines to, but because the only writes it could
 * make are the ones it blocks.
 *
 * THE STOP RULE. A defect found here does not authorise repairing it. Each item
 * is reported PASS / FAIL / UNKNOWN and the run stops.
 *
 * WHAT IT CANNOT SETTLE. Whether MAIA perceived the Work correctly. This
 * compares the RENDER against the FROZEN ROW: it can prove the room shows what
 * was stored, and it can prove the room drops something that was stored. It
 * cannot tell you the eleven divisions are the right reading of the book. That
 * is 05B-8b, and it is the founder's.
 *
 *   TOK=<session token, from the shell> MEMBER_ID=... MANUSCRIPT=... PROPOSAL=... \
 *   DATABASE_URL=... npx tsx scripts/ws2-05b-8a-render-witness.ts
 *
 * Run with MANUSCRIPT set and MEMBER_ID unset and the reader-run script prints
 * the query that resolves your member id.
 */

import puppeteer, { type Page } from 'puppeteer';

const BASE = process.env.BASE ?? 'http://localhost:3105';
const TOK = process.env.TOK ?? '';
const MANUSCRIPT = process.env.MANUSCRIPT ?? '';
const PROPOSAL = process.env.PROPOSAL ?? '';
const MEMBER_ID = process.env.MEMBER_ID ?? '';
const OUT = process.env.OUT ?? '/tmp';

type Verdict = 'PASS' | 'FAIL' | 'UNKNOWN';
const results: { n: number; name: string; verdict: Verdict; detail: string }[] = [];
const record = (n: number, name: string, verdict: Verdict, detail = '') => {
  results.push({ n, name, verdict, detail });
  const mark = verdict === 'PASS' ? 'ok   ' : verdict === 'FAIL' ? 'FAIL ' : '?    ';
  console.log(`  ${mark} ${n}. ${name}${detail ? `\n         ${detail}` : ''}`);
};
/** For a check whose evidence did not arrive. Never reported as a pass. */
const unknown = (n: number, name: string, why: string) => record(n, name, 'UNKNOWN', why);

async function main() {
  if (!TOK || !MANUSCRIPT || !PROPOSAL || !MEMBER_ID) {
    console.error('\n  TOK, MEMBER_ID, MANUSCRIPT and PROPOSAL are all required.\n');
    process.exit(2);
  }

  /* ── the frozen row, which is the thing the render is judged against ──── */
  const { loadProposal } = await import('@/lib/manuscript/structure/proposalStore');
  const { query } = await import('@/lib/db/postgres');

  const stored = await loadProposal(PROPOSAL, MEMBER_ID);
  if (stored.status !== 'ok') {
    console.error(`\n  Could not read the proposal: ${stored.refusal}\n`);
    process.exit(2);
  }
  const p = stored.value;
  if (p.manuscriptId !== MANUSCRIPT) {
    console.error('\n  That proposal does not belong to that manuscript.\n');
    process.exit(2);
  }

  const sectionCount = (await query(
    `SELECT 1 FROM manuscript_draft_sections s
       JOIN manuscript_working_drafts d ON d.id = s.draft_id
      WHERE d.manuscript_id = $1 AND d.section_addressable_at IS NOT NULL`,
    [MANUSCRIPT])).rows.length;

  const interp = p.interpretation;
  const cov = p.coverage.bodies;
  const countUnits = (us: readonly { children: readonly unknown[] }[]): number =>
    us.reduce((n, u) => n + 1 + countUnits(u.children as typeof us), 0);
  const frozenUnits = 'units' in interp ? interp.units : [];

  console.log(`\n  Frozen row: form ${interp.form} · ${countUnits(frozenUnits)} division(s)`
    + ` · ${interp.uncertainRegions.length} uncertain region(s)`
    + ` · unaccounted ${interp.unaccountedSectionIds.length}/${sectionCount}`);
  console.log(`  Reader: ${p.readerProvenance?.model ?? 'none recorded'}`
    + ` · prompt ${p.readerProvenance?.promptHash?.slice(0, 12) ?? '—'}`);

  /* ── the browser ──────────────────────────────────────────────────────── */
  const browser = await puppeteer.launch({
    headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1200 });
  await browser.setCookie({
    name: 'maia_session', value: TOK, domain: new URL(BASE).hostname, path: '/',
  });

  /* READ-ONLY BY CONSTRUCTION. A mutating request is aborted before it leaves,
     and its attempt is itself a finding. */
  const attemptedWrites: string[] = [];
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];
  await page.setRequestInterception(true);
  page.on('request', (r) => {
    if (r.method() !== 'GET' && r.method() !== 'HEAD') {
      attemptedWrites.push(`${r.method()} ${r.url()}`);
      void r.abort();
      return;
    }
    void r.continue();
  });
  /* A bare "Failed to load resource: 404" names nothing. Without the URL a
     witness cannot tell a broken page from a dev-server artifact, and reporting
     it either way would be a finding invented out of ignorance. */
  const notFound: string[] = [];
  page.on('response', (r) => {
    if (r.status() >= 400) notFound.push(`${r.status()} ${r.url()}`);
  });
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e: Error) => consoleErrors.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => {
    /* Our own aborts are not page failures. */
    if (!attemptedWrites.some((w) => w.endsWith(r.url()))) {
      failedRequests.push(`${r.url()} — ${r.failure()?.errorText ?? 'unknown'}`);
    }
  });

  const url = `${BASE}/writers-studio/review?m=${MANUSCRIPT}&p=${PROPOSAL}`;
  console.log(`\n  ${url}\n`);
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60_000 });
  const root = await page.waitForSelector('[data-structure-review]', { timeout: 30_000 })
    .catch(() => null);

  if (!root) {
    record(1, 'the room loads this proposal', 'FAIL', 'no [data-structure-review]');
    await page.screenshot({ path: `${OUT}/ws2-8a-failed-load.png`, fullPage: true });
    await browser.close();
    process.exit(1);
  }

  const attr = (sel: string, name: string) =>
    page.$eval(sel, (el, n) => el.getAttribute(n as string), name).catch(() => null);
  const text = await page.$eval('[data-structure-review]', (el) => el.textContent ?? '');
  const unitIds = await page.$$eval('[data-review-unit]',
    (els) => els.map((e) => e.getAttribute('data-review-unit')!));
  const drawn = await page.$$eval('[data-section]',
    (els) => els.map((e) => Number(e.getAttribute('data-section'))));
  const loose = await page.$$eval('[data-section][data-unaccounted]', (e) => e.length);

  /* 1 ── this proposal, not a fallback ─────────────────────────────────── */
  const shownAccount = interp.account.slice(0, 60);
  record(1, 'the room loads the requested manuscript and proposal',
    text.includes(shownAccount) ? 'PASS' : 'FAIL',
    text.includes(shownAccount) ? "MAIA's stored account is on the page"
      : 'the stored account is not rendered — a different proposal may be shown');

  /* 2 ── the form ──────────────────────────────────────────────────────── */
  const form = await attr('[data-structure-review]', 'data-form');
  record(2, `the displayed reading is form = ${interp.form}`,
    form === interp.form ? 'PASS' : 'FAIL', `rendered ${form ?? 'none'}`);

  /* 3 ── coverage agrees with the frozen row ───────────────────────────── */
  const shownMode = await attr('[data-coverage]', 'data-coverage');
  const saysSections = new RegExp(`\\b${cov.sectionIds.length}\\b`).test(text)
    && /section/i.test(text);
  const saysCeiling = new RegExp(`at most ${cov.sectionLimit}`).test(text);
  if (shownMode === null) {
    unknown(3, 'coverage shown agrees with the frozen proposal',
      'no [data-coverage] in the DOM — the mode is not machine-readable here');
  } else {
    record(3, 'coverage shown agrees with the frozen proposal',
      shownMode === cov.mode && saysSections && saysCeiling ? 'PASS' : 'FAIL',
      `mode ${shownMode} vs frozen ${cov.mode}; sections ${saysSections};`
      + ` ceiling ${cov.sectionLimit} ${saysCeiling}`);
  }
  /* `truncated` and `passes` are in the row and not on the page at all. */
  record(3.1 as unknown as number, 'coverage states truncated and passes',
    /truncat/i.test(text) ? 'PASS' : 'FAIL',
    `frozen truncated=${cov.truncated}, passes=${p.coverage.passes};`
    + ' neither is rendered');

  /* 4 ── every section accounted for ───────────────────────────────────── */
  record(4, `the proposal accounts for all ${sectionCount} sections`,
    interp.unaccountedSectionIds.length === 0 && loose === 0 ? 'PASS' : 'FAIL',
    `frozen unaccounted ${interp.unaccountedSectionIds.length},`
    + ` rendered outside every division ${loose}`);

  /* 5 ── uncertain regions ─────────────────────────────────────────────── */
  const regionMarks = await page.$$eval('[data-uncertain-region]', (e) => e.length)
    .catch(() => 0);
  const anyRegionWhy = interp.uncertainRegions[0]?.why?.slice(0, 40);
  record(5, `${interp.uncertainRegions.length} uncertain region(s) are rendered visibly`,
    regionMarks === interp.uncertainRegions.length && interp.uncertainRegions.length > 0
      ? 'PASS' : 'FAIL',
    `${regionMarks} rendered; the stored text is `
    + `${anyRegionWhy && text.includes(anyRegionWhy) ? 'present' : 'ABSENT'} on the page`);

  /* 6 ── the two voices stay distinct ──────────────────────────────────── */
  const originals = await page.$$eval('[data-maia-original]', (e) => e.length);
  const mine = await page.$$eval('[data-member-authored]', (e) => e.length);
  const untouched = p.reviewRevision === 0;
  record(6, "MAIA's proposal and the member's copy remain distinct surfaces",
    untouched && originals === 0 ? 'PASS' : originals > 0 ? 'PASS' : 'UNKNOWN',
    untouched
      ? `revision 0, nothing changed yet, so no duplication is shown (${originals}`
        + ` originals, ${mine} member-authored) — the surface exists but is unexercised`
      : `revision ${p.reviewRevision}: ${originals} original(s) shown beneath changes`);

  /* 7 ── what the row holds about each division ────────────────────────── */
  const nullTitled = frozenUnits.flatMap(function walk(u: {
    title: string | null; kind: string | null; children: unknown[];
  }): { title: string | null; kind: string | null }[] {
    return [{ title: u.title, kind: u.kind },
      ...(u.children as typeof u[]).flatMap(walk)];
  });
  const invented = nullTitled.filter((u) => u.title === null)
    .some((u) => u.kind && !text.includes(u.kind));
  record(7, 'null titles are not rendered as invented text',
    invented ? 'FAIL' : 'PASS',
    `${nullTitled.filter((u) => u.title === null).length} of ${nullTitled.length}`
    + ' divisions carry no title; the room shows the kind, never a manufactured name');

  const withTags = frozenUnits.flatMap(function walk(u: {
    uncertainty: readonly string[]; children: unknown[];
  }): number[] {
    return [u.uncertainty.length, ...(u.children as typeof u[]).flatMap(walk)];
  }).filter((n) => n > 0).length;
  const tagMarks = await page.$$eval('[data-uncertainty]', (e) => e.length).catch(() => 0);
  record(7.1 as unknown as number, 'uncertainty tags render on the divisions that carry them',
    tagMarks >= withTags && withTags > 0 ? 'PASS' : 'FAIL',
    `${withTags} division(s) carry tags in the frozen row; ${tagMarks} rendered`);

  const kinds = frozenUnits.flatMap(function walk(u: {
    kind: string | null; children: unknown[];
  }): string[] {
    return [...(u.kind ? [u.kind] : []), ...(u.children as typeof u[]).flatMap(walk)];
  });
  const kindsShown = kinds.filter((k) => text.includes(k));
  record(7.2 as unknown as number, "the Work's free-text kinds survive to the page",
    kindsShown.length === kinds.length ? 'PASS' : 'FAIL',
    `${kindsShown.length}/${kinds.length} rendered`);

  /* 8 ── manuscript order, once each ───────────────────────────────────── */
  const ascending = drawn.every((v, i) => i === 0 || v > drawn[i - 1]);
  const unique = new Set(drawn).size === drawn.length;
  record(8, 'sections read in manuscript order, none duplicated or dropped',
    ascending && unique && drawn.length === sectionCount ? 'PASS' : 'FAIL',
    `${drawn.length} of ${sectionCount} drawn; ascending ${ascending}; unique ${unique}`);

  /* 9 ── no adoption reachable ─────────────────────────────────────────── */
  const adoptish = await page.$$eval('button, a', (els) => els
    .map((e) => (e.textContent ?? '').trim())
    .filter((t) => /use this structure|adopt|apply to (the )?work|make it so/i.test(t)));
  record(9, 'no adoption action is reachable in this room',
    adoptish.length === 0 ? 'PASS' : 'FAIL',
    adoptish.length === 0 ? 'absent, not disabled' : adoptish.join(' / '));

  /* 10 ── captures ─────────────────────────────────────────────────────── */
  await page.screenshot({ path: `${OUT}/ws2-8a-room.png`, fullPage: true });
  const shot = async (name: string, sel: string) => {
    const el = await page.$(sel);
    if (!el) return false;
    await el.screenshot({ path: `${OUT}/ws2-8a-${name}.png` }).catch(() => undefined);
    return true;
  };
  const gotCoverage = await shot('coverage', '[data-coverage]');
  /* The section whose placement was refused in Run A. */
  const got42 = await shot('section-42', '[data-section="42"]');
  const gotEnd = await shot('end', `[data-section="${sectionCount - 1}"]`);
  record(10, 'captures written',
    gotCoverage && got42 && gotEnd ? 'PASS' : 'UNKNOWN',
    `${OUT}/ws2-8a-room.png · coverage ${gotCoverage} · section 42 ${got42}`
    + ` · end ${gotEnd} · uncertain region ${regionMarks > 0}`);

  /* 11 ── the console, and anything the page tried to write ────────────── */
  /* The RSC prefetch this page issues for itself is aborted by page teardown,
     not by anything wrong with the room; counting it would manufacture a
     defect. It is named and excluded rather than silently filtered. */
  const realFailures = failedRequests.filter((f) => !/[?&]_rsc=/.test(f));
  const rscAborted = failedRequests.length - realFailures.length;
  record(11, 'no console errors and no failed requests',
    consoleErrors.length === 0 && realFailures.length === 0 && notFound.length === 0
      ? 'PASS' : 'FAIL',
    `${consoleErrors.length} console error(s), ${notFound.length} 4xx/5xx,`
    + ` ${realFailures.length} failed request(s)`
    + `${rscAborted ? ` (${rscAborted} RSC prefetch abort, excluded)` : ''}`);
  for (const e of notFound.slice(0, 8)) console.log(`         http: ${e.slice(0, 160)}`);
  for (const f of realFailures.slice(0, 5)) console.log(`         network: ${f.slice(0, 160)}`);

  record(12, 'the witness itself wrote nothing',
    attemptedWrites.length === 0 ? 'PASS' : 'FAIL',
    attemptedWrites.length === 0 ? 'no non-GET request was issued'
      : `BLOCKED: ${attemptedWrites.join(' / ')}`);

  await browser.close();

  /* ── and the row is exactly as it was ─────────────────────────────────── */
  const after = await loadProposal(PROPOSAL, MEMBER_ID);
  record(13, 'the proposal is unchanged by this witness',
    after.status === 'ok' && after.value.reviewRevision === p.reviewRevision
      && JSON.stringify(after.value.interpretation) === JSON.stringify(interp)
      ? 'PASS' : 'FAIL',
    `revision ${after.status === 'ok' ? after.value.reviewRevision : '?'}`);

  const fails = results.filter((r) => r.verdict === 'FAIL').length;
  const unknowns = results.filter((r) => r.verdict === 'UNKNOWN').length;
  console.log(`\n  ${fails === 0 ? 'PASS' : 'FAIL'} — ${fails} failed, ${unknowns} unknown`);
  console.log('\n  A defect found here does not authorise repairing it.'
    + '\n  05B-8a is render fidelity. 05B-8b — whether MAIA perceived this Work —'
    + '\n  is not decidable by any of the above.\n');
  process.exit(fails === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
