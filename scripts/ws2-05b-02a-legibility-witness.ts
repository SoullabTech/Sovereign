/**
 * WS2-05B-8B-02a — the editorial surface, witnessed.
 *
 * WHAT 8a CANNOT ASK. 8a compares the render against the frozen row and passes
 * on a page no human can read: legibility is not a property of that comparison,
 * and that is not a defect in it — it is the boundary of what a fidelity
 * witness can establish.
 *
 *     test execution   ≠ type validation
 *     script execution ≠ inclusion in ship program
 *     gate identity    ≠ diagnostic identity
 *     render fidelity  ≠ intelligibility
 *     fixture shape    ≠ fixture content
 *
 * WHAT THIS ASKS INSTEAD, and it is a FLOOR rather than a substitute. Whether a
 * writer can say what MAIA thinks their book is has no machine witness and none
 * should be built to fake one. But one half of the 8B defect IS mechanical:
 * five sibling divisions rendering the same text are indistinguishable to
 * anybody, and that is checkable. So is whether the thesis reached the page,
 * whether her questions did, and whether a label ever passes for a title.
 *
 * A green run here means the room CAN be read, not that it WAS. The founder
 * opening it and saying "ah, I see what she thinks the book is" remains the
 * only instrument for the second thing.
 *
 * READ-ONLY BY CONSTRUCTION, like 8a: every non-GET the page attempts is
 * aborted, and the proposal is re-read afterwards to assert it did not move.
 */

import puppeteer from 'puppeteer';

const BASE = process.env.BASE ?? 'http://localhost:3105';
const TOK = process.env.TOK ?? '';
const MANUSCRIPT = process.env.MANUSCRIPT ?? '';
const PROPOSAL = process.env.PROPOSAL ?? '';
const MEMBER_ID = process.env.MEMBER_ID ?? '';

type Verdict = 'PASS' | 'FAIL' | 'UNKNOWN' | 'N/A';
const results: { n: string; name: string; verdict: Verdict; detail: string }[] = [];
const record = (n: string, name: string, verdict: Verdict, detail = '') => {
  results.push({ n, name, verdict, detail });
  const mark = verdict === 'PASS' ? 'ok   ' : verdict === 'FAIL' ? 'FAIL '
    : verdict === 'N/A' ? 'n/a  ' : '?    ';
  console.log(`  ${mark} ${n}. ${name}${detail ? `\n         ${detail}` : ''}`);
};

type U = {
  id: string; title: string | null; kind: string | null;
  editorialLabel?: string | null; rationale: string;
  uncertainty: readonly string[]; children: U[];
};

async function main() {
  if (!TOK || !MANUSCRIPT || !PROPOSAL || !MEMBER_ID) {
    console.error('\n  TOK, MEMBER_ID, MANUSCRIPT and PROPOSAL are all required.\n');
    process.exit(2);
  }
  const { loadProposal } = await import('@/lib/manuscript/structure/proposalStore');
  const stored = await loadProposal(PROPOSAL, MEMBER_ID);
  if (stored.status !== 'ok') {
    console.error(`\n  Could not read the proposal: ${stored.refusal}\n`);
    process.exit(2);
  }
  const p = stored.value;
  const interp = p.interpretation;
  const syn = interp.editorialSynthesis;
  const units: U[] = 'units' in interp ? (interp.units as U[]) : [];
  const flat: U[] = [];
  const walk = (us: readonly U[]) => { for (const u of us) { flat.push(u); walk(u.children); } };
  walk(units);

  console.log(`\n  Frozen row: form ${interp.form} · ${flat.length} division(s)`
    + ` · letter ${syn ? 'present' : 'ABSENT (pre-contract reading)'}`);

  const browser = await puppeteer.launch({
    headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1400 });
  await browser.setCookie({
    name: 'maia_session', value: TOK, domain: new URL(BASE).hostname, path: '/',
  });
  const attemptedWrites: string[] = [];
  await page.setRequestInterception(true);
  page.on('request', (r) => {
    if (r.method() !== 'GET' && r.method() !== 'HEAD') {
      attemptedWrites.push(`${r.method()} ${r.url()}`);
      void r.abort();
      return;
    }
    void r.continue();
  });

  const url = `${BASE}/writers-studio/review?m=${MANUSCRIPT}&p=${PROPOSAL}`;
  console.log(`\n  ${url}\n`);
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60_000 });
  if (!await page.waitForSelector('[data-structure-review]', { timeout: 30_000 })
    .catch(() => null)) {
    console.error('  the room did not load'); await browser.close(); process.exit(1);
  }
  const text = await page.$eval('[data-structure-review]', (el) => el.textContent ?? '');
  const one = (sel: string) => page.$eval(sel, (el) => el.textContent ?? '').catch(() => null);
  const count = (sel: string) => page.$$eval(sel, (e) => e.length).catch(() => 0);

  /* 1 ── the room opens on the thesis ──────────────────────────────────── */
  const thesis = await one('[data-thesis]');
  if (!syn) {
    record('1', 'the room opens on the thesis',
      thesis === null ? 'N/A' : 'FAIL',
      thesis === null
        ? 'this reading predates the letter; no thesis is claimed, and none is shown'
        : 'a thesis is rendered for a reading that has none — INVENTED');
  } else {
    record('1', 'the room opens on the thesis',
      thesis?.trim() === syn.thesis.trim() ? 'PASS' : 'FAIL',
      thesis === null ? 'no [data-thesis] on the page'
        : thesis.trim() === syn.thesis.trim() ? "MAIA's thesis, verbatim"
          : 'the rendered thesis is not the frozen one');
  }

  /* 2 ── the account is present, and second ────────────────────────────── */
  const acct = await count('[data-maia-account]');
  const acctHidden = await page.$eval('[data-maia-account]',
    (el) => Boolean(el.closest('[hidden]'))).catch(() => null);
  record('2', 'her full account is on the page, and no longer first',
    acct === 1 && acctHidden === Boolean(syn) ? 'PASS' : 'FAIL',
    `account elements ${acct}; behind a disclosure ${acctHidden};`
    + ` expected ${Boolean(syn)} for a reading with${syn ? '' : 'out'} a letter`);

  /* 3 ── her findings and questions reached the page ───────────────────── */
  if (!syn) record('3', 'findings and questions rendered', 'N/A', 'no letter to render');
  else {
    const missingF = syn.strongestFindings.filter((f) => !text.includes(f.slice(0, 40)));
    const missingQ = syn.questionsForAuthor.filter((q) =>
      !text.includes(q.label.slice(0, 30)) || !text.includes(q.explanation.slice(0, 40)));
    const qMarks = await count('[data-author-question]');
    record('3', 'every finding and every question reached the page',
      missingF.length === 0 && missingQ.length === 0
        && qMarks === syn.questionsForAuthor.length ? 'PASS' : 'FAIL',
      `${syn.strongestFindings.length - missingF.length}/${syn.strongestFindings.length}`
      + ` findings · ${syn.questionsForAuthor.length - missingQ.length}`
      + `/${syn.questionsForAuthor.length} questions · ${qMarks} marked`);
  }

  /* 4 ── THE 8B DEFECT ITSELF ──────────────────────────────────────────── *
   * Five siblings of one kind with no titles rendered five identical rows.
   * This is the half of that failure a machine can see. */
  /* BY ITS OWN HANDLE. Guessing at DOM shape here picked up the ◇ uncertainty
     marker instead of the name and reported five identical rows on a page that
     was rendering five different ones — a defect invented by the instrument.
     `data-row-name` is the row's name and nothing else; a nested division's own
     name comes later in document order, so the first match is this row's. */
  const rowNames = await page.$$eval('[data-review-unit]', (els) => els.map((e) => {
    const id = e.getAttribute('data-review-unit')!;
    const n = e.querySelector('[data-row-name]');
    return [id, (n?.textContent ?? '').trim()] as [string, string];
  }));
  const nameById = new Map(rowNames);
  const groups: U[][] = [];
  const sib = (us: readonly U[]) => {
    const byKind = new Map<string, U[]>();
    for (const u of us) {
      if (u.kind) byKind.set(u.kind, [...(byKind.get(u.kind) ?? []), u]);
      sib(u.children);
    }
    for (const list of byKind.values()) {
      if (list.length >= 2 && list.every((u) => u.title === null)) groups.push(list);
    }
  };
  sib(units);
  if (groups.length === 0) {
    record('4', 'same-kind untitled siblings are told apart', 'N/A',
      'this reading has no such group — the shape 8B failed on is not present');
  } else {
    /**
     * WHOSE FAILURE IT IS, and the two are not the same.
     *
     * If the reading supplied labels and the page shows the same text five
     * times, the ROOM lost them: a defect, and fixable here.
     *
     * If the reading supplied none, the page showing "element" five times is
     * the faithful render of a reading that cannot be told apart — the 8B
     * defect in its original form, and no layout closes it. Scoring that as a
     * room FAIL would make the witness demand that the surface invent the
     * distinction, which is the exact thing this programme has refused
     * throughout. It is reported as a finding about the READING.
     */
    const lines: string[] = [];
    let roomLostThem = false;
    let readingHasNone = false;
    for (const g of groups) {
      const shown = g.map((u) => nameById.get(u.id) ?? '(row not found)');
      const distinct = new Set(shown).size === shown.length;
      const hadLabels = g.some((u) => typeof u.editorialLabel === 'string' && u.editorialLabel);
      if (!distinct && hadLabels) roomLostThem = true;
      if (!distinct && !hadLabels) readingHasNone = true;
      lines.push(`${g.length} × "${g[0].kind}" → ${shown.join(' · ')}`
        + (distinct ? '' : hadLabels
          ? '   NOT DISTINCT — the room lost her labels'
          : '   NOT DISTINCT — the reading gave none'));
    }
    record('4', 'same-kind untitled siblings are told apart on the page',
      roomLostThem ? 'FAIL' : readingHasNone ? 'N/A' : 'PASS',
      lines.join('\n         ')
      + (readingHasNone && !roomLostThem
        ? '\n         This is the 8B defect, and it belongs to the reading rather'
          + '\n         than to the room: with no label there is nothing faithful to'
          + '\n         show. A surface that invented one would be writing the book.'
        : ''));
  }

  /* 5 ── every label she gave is rendered, and marked as hers ──────────── */
  const labelled = flat.filter((u) => u.title === null && typeof u.editorialLabel === 'string');
  const marked = await count('[data-editorial-label]');
  const missingL = labelled.filter((u) => nameById.get(u.id) !== u.editorialLabel);
  record('5', "every label she gave names its row, and is marked as HER words",
    labelled.length === 0 ? 'N/A'
      : missingL.length === 0 && marked >= labelled.length ? 'PASS' : 'FAIL',
    labelled.length === 0 ? 'no labels in this reading'
      : `${labelled.length - missingL.length}/${labelled.length} rendered;`
        + ` ${marked} marked data-editorial-label`);

  /* 6 ── and a label never passes for a title ──────────────────────────── */
  const titled = flat.filter((u) => u.title !== null);
  const titleRows = titled.filter((u) => nameById.get(u.id) === u.title);
  const labelAsTitle = titled.filter((u) =>
    u.editorialLabel && nameById.get(u.id) === u.editorialLabel);
  record('6', 'where the Work names a division, the row shows the WORK\'s name',
    titled.length === 0 ? 'N/A'
      : titleRows.length === titled.length && labelAsTitle.length === 0 ? 'PASS' : 'FAIL',
    titled.length === 0 ? 'every division is untitled in this reading'
      : `${titleRows.length}/${titled.length} show the title;`
        + ` ${labelAsTitle.length} show a label in a title's place`);

  /**
   * 7 ── her reasoning is reachable at all ────────────────────────────────
   *
   * THE CLAIM IS UNCHANGED; THE MECHANISM MOVED. This check counted
   * `[data-why]` disclosures, one per division. UX01 replaced twenty-two of
   * those with selection and a single inspector, so counting them would now
   * report a defect on a room that reaches her reasoning perfectly well.
   *
   * The check follows the CLAIM, not the markup: it SELECTS each division that
   * carries a rationale and asserts the inspector shows that exact text. That
   * is a stronger test than the old one — it exercises the path a member takes
   * rather than the presence of an element — and it is not the test bending to
   * the implementation, because the sentence being asserted is the same
   * sentence.
   */
  const withRationale = flat.filter((u) => u.rationale.trim().length > 0);
  let reached = 0;
  const unreachable: string[] = [];
  for (const u of withRationale) {
    const picked = await page.click(`[data-review-unit="${u.id}"] .ws2sr-pick`)
      .then(() => page.waitForSelector(`[data-inspector="${u.id}"]`, { timeout: 3_000 }))
      .then(() => page.$eval(`[data-inspector="${u.id}"]`, (el) => el.textContent ?? ''))
      .catch(() => null);
    if (picked !== null && picked.includes(u.rationale.slice(0, 60))) reached += 1;
    else unreachable.push(u.id);
  }
  record('7', "selecting a division shows MAIA's reasoning for it",
    withRationale.length === 0 ? 'N/A'
      : reached === withRationale.length ? 'PASS' : 'FAIL',
    `${reached}/${withRationale.length} division(s) with a rationale showed it`
    + ` in the inspector when selected`
    + `${unreachable.length ? `; missing ${unreachable.slice(0, 5).join(',')}` : ''}`);

  /* 8 ── the map does not open as a serialization ──────────────────────── */
  const visibleSections = await page.$$eval('[data-section]',
    (els) => els.filter((e) => !e.closest('[hidden]')).length);
  const allSections = await count('[data-section]');
  record('8', 'the map opens on the reading, not on every section',
    visibleSections < allSections ? 'PASS' : allSections === 0 ? 'N/A' : 'FAIL',
    `${visibleSections} of ${allSections} section rows visible before anything is opened`);

  /* 9 ── nothing was written ───────────────────────────────────────────── */
  const after = await loadProposal(PROPOSAL, MEMBER_ID);
  record('9', 'the witness wrote nothing and the proposal did not move',
    attemptedWrites.length === 0 && after.status === 'ok'
      && after.value.reviewRevision === p.reviewRevision
      && JSON.stringify(after.value.interpretation) === JSON.stringify(interp)
      ? 'PASS' : 'FAIL',
    `revision ${after.status === 'ok' ? after.value.reviewRevision : '?'};`
    + ` ${attemptedWrites.length} non-GET attempted`);

  await browser.close();
  const failed = results.filter((r) => r.verdict === 'FAIL').length;
  console.log(`\n  ${failed === 0 ? 'PASS' : 'FAIL'} — ${failed} failed,`
    + ` ${results.filter((r) => r.verdict === 'N/A').length} n/a\n`);
  console.log('  This is a FLOOR, not the acceptance. Whether a writer can say what');
  console.log('  MAIA thinks their book is remains 05B-8b, and is a founder judgment.\n');
  process.exit(failed === 0 ? 0 : 1);
}

void main();
