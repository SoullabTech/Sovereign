/**
 * WS2-05B step 5c - the review surface, witnessed by a browser.
 *
 * WHAT THIS REPLACES. Twelve assertions that would otherwise be twelve requests
 * for a person to look at a screen and report. It seeds a synthetic manuscript,
 * stores one proposal per reading, drives the page, asserts the DOM, and deletes
 * everything it made. No member's manuscript is read or written.
 *
 * WHAT IT CANNOT SETTLE, and does not pretend to: whether the reading is right.
 * That is the founder witness, and it is the only part that should still cost a
 * person's attention.
 *
 *   TOK=<session token> MEMBER_ID=<uuid> DATABASE_URL=... \
 *   npx tsx scripts/ws2-05b-review-witness.ts
 */

import { createHash } from 'crypto';
import puppeteer, { type Page } from 'puppeteer';

const BASE = process.env.BASE ?? 'http://localhost:3105';
const TOK = process.env.TOK ?? '';
const OUT = process.env.OUT ?? '/tmp';

let failures = 0;
const check = (name: string, pass: boolean, detail = '') => {
  console.log(`  ${pass ? 'ok  ' : 'FAIL'}  ${name}${detail ? `  ${detail}` : ''}`);
  if (!pass) failures++;
};

async function main() {
  if (!TOK) {
    console.error('\n  TOK is required - a live session token for the member.\n');
    process.exit(2);
  }

  const { query, transaction } = await import('@/lib/db/postgres');
  const { createProposal, loadProposal } = await import('@/lib/manuscript/structure/proposalStore');
  const { gatherEvidence } = await import('@/lib/manuscript/structure/evidence');
  const { interpretationInputHash } = await import('@/lib/manuscript/structure/interpret');
  const { allReadings } = await import('@/lib/manuscript/structure/fixtures');

  /* -- a Work of our own ------------------------------------------------ */
  console.log('\n1 · fixture');
  const N = 12;
  const fixture = await transaction(async (tx) => {
    let memberId = process.env.MEMBER_ID ?? '';
    if (!memberId) {
      const m = await tx.query<{ id: string }>(`INSERT INTO members DEFAULT VALUES RETURNING id`);
      memberId = m.rows[0].id;
    }
    const man = await tx.query<{ id: string }>(
      `INSERT INTO member_manuscripts (member_id, title) VALUES ($1, $2) RETURNING id`,
      [memberId, `ws2-05b-review-witness-${Date.now()}`]);
    const manuscriptId = man.rows[0].id;
    const bodies = Array.from({ length: N }, (_, i) => `SECTION-${i} filler.\n\n`);
    const content = bodies.join('');
    const draft = await tx.query<{ id: string }>(
      `INSERT INTO manuscript_working_drafts
         (manuscript_id, member_id, content, base_source_hash, version)
       VALUES ($1, $2, $3, $4, 1) RETURNING id`,
      [manuscriptId, memberId, content,
       createHash('sha256').update(content, 'utf8').digest('hex')]);
    for (let i = 0; i < N; i++) {
      /* Source sections exist so the draft sections carry HEADINGS through the
         same join the route reads. Without them the witness held headings it
         invented and the server saw nulls, and every hash comparison between
         the two was meaningless. */
      const src = await tx.query<{ id: string }>(
        `INSERT INTO manuscript_sections (manuscript_id, position, heading, body)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [manuscriptId, i, `HEADING ${i}`, bodies[i]]);
      await tx.query(
        `INSERT INTO manuscript_draft_sections (draft_id, position, text, source_section_id)
         VALUES ($1, $2, $3, $4)`,
        [draft.rows[0].id, i, bodies[i], src.rows[0].id]);
    }
    await tx.query(
      `UPDATE manuscript_working_drafts SET section_addressable_at = now(),
              section_conversion_version = 1 WHERE id = $1`, [draft.rows[0].id]);
    return { memberId, manuscriptId, draftId: draft.rows[0].id };
  });

  const rows = await query<{ id: string; position: number; text: string; heading: string | null }>(
    `SELECT s.id, s.position, s.text, ms.heading
       FROM manuscript_draft_sections s
       LEFT JOIN manuscript_sections ms ON ms.id = s.source_section_id
      WHERE s.draft_id = $1 ORDER BY s.position`,
    [fixture.draftId]);
  const sections = rows.rows.map((r) => ({
    id: r.id, position: r.position, heading: r.heading,
  }));
  const bodyOf = new Map(rows.rows.map((r) => [r.id, r.text]));
  check('a manuscript to propose about', sections.length === N, `${N} sections`);

  /* One stored proposal per reading, built against the REAL section ids. */
  const evidence = gatherEvidence(fixture.manuscriptId, sections);
  const proposals: Record<string, string> = {};
  for (const [name, make] of Object.entries(allReadings)) {
    const interpretation = make(sections);
    const created = await createProposal(fixture.manuscriptId, fixture.memberId, {
      evidence, interpretation, coverage: interpretation.coverage,
      sectionTopologyHash: evidence.sectionTopologyHash,
      /* The REAL hash over what this reading rests on, so `staleAsRead` is a
         measurement the witness can check rather than a stored placeholder. */
      interpretationInputHash: interpretationInputHash(
        sections,
        new Map(interpretation.coverage.bodies.sectionIds
          .map((sid) => [sid, bodyOf.get(sid) ?? '']))),
    });
    if (created.status !== 'ok') {
      check(`store the ${name} reading`, false, created.refusal);
      continue;
    }
    proposals[name] = created.value.id;
  }
  check('all six readings stored', Object.keys(proposals).length === 6);

  /* -- the browser ------------------------------------------------------ */
  const browser = await puppeteer.launch({
    headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1000 });
  await browser.setCookie({
    name: 'maia_session', value: TOK, domain: new URL(BASE).hostname, path: '/',
  });

  const open = async (name: string): Promise<void> => {
    await page.goto(
      `${BASE}/writers-studio/review?m=${fixture.manuscriptId}&p=${proposals[name]}`,
      { waitUntil: 'networkidle0', timeout: 60_000 });
    await page.waitForSelector('[data-structure-review]', { timeout: 30_000 });
  };
  const form = () => page.$eval('[data-structure-review]',
    (el) => el.getAttribute('data-form'));
  const drawnPositions = (p: Page) => p.$$eval('[data-section]',
    (els) => els.map((e) => Number(e.getAttribute('data-section'))));
  const unitIds = (p: Page) => p.$$eval('[data-review-unit]',
    (els) => els.map((e) => e.getAttribute('data-review-unit')!));

  /* -- the six forms ---------------------------------------------------- */
  console.log('\n2 · every reading has a real screen');

  await open('stable');
  check('stable renders its divisions', (await unitIds(page)).length >= 2, await form() ?? '');
  const stableDrawn = await drawnPositions(page);
  check('stable renders in book order',
    stableDrawn.every((p, i) => i === 0 || p > stableDrawn[i - 1]),
    stableDrawn.join(','));

  await open('partial');
  const partialDrawn = await drawnPositions(page);
  check('partial keeps unaccounted material in position',
    partialDrawn.length === 8 && partialDrawn[0] === 4,
    partialDrawn.join(','));
  check('partial renders in book order',
    partialDrawn.every((p, i) => i === 0 || p > partialDrawn[i - 1]));

  await open('flat');
  const flatNested = await page.$$eval('[data-review-unit] [data-review-unit]', (e) => e.length);
  check('flat creates no synthetic root', flatNested === 0, `${flatNested} nested`);

  await open('mixed');
  const kinds = await page.$$eval('[data-review-unit] > div > span',
    (els) => els.map((e) => e.textContent ?? ''));
  check('mixed permits heterogeneous kinds',
    kinds.some((k) => /Letter/.test(k)) && kinds.some((k) => /Vignette/.test(k)));

  await open('ambiguous');
  const alts = await page.$$eval('[data-alternative]', (e) => e.length);
  check('ambiguous renders its alternatives', alts === 2, `${alts}`);
  check('ambiguous renders no canonical tree', (await unitIds(page)).length === 0);
  const ambiguousDrawn = await drawnPositions(page);
  check('and nothing is accounted for', ambiguousDrawn.length === N, `${ambiguousDrawn.length}`);

  await open('none');
  check('none renders a complete screen with no tree',
    (await unitIds(page)).length === 0 && (await page.$('[data-no-structure]')) !== null);
  const noneDrawn = await drawnPositions(page);
  check('and the Work beneath it', noneDrawn.length === N, `${noneDrawn.length}`);
  const apology = await page.$$eval('[data-structure-review]',
    (els) => /try again|something went wrong|no results|failed/i.test(els[0].textContent ?? ''));
  check('with no apology or failure framing', !apology);

  /* -- the two voices ---------------------------------------------------- */
  console.log('\n3 · whose voice is whose');
  await open('stable');
  const before = await page.$$eval('[data-maia-original]', (e) => e.length);
  check('an untouched proposal is not noisy with duplication', before === 0);

  /* Rename through the API the surface uses, then reload and look. */
  const first = (await unitIds(page))[0];
  const renamed = await page.evaluate(async (args) => {
    const res = await fetch(
      `/api/sovereign/manuscripts/${args.m}/structure/proposals/${args.p}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expectedReviewRevision: 0,
          operation: { op: 'rename', unitId: args.u, title: 'My own name', kind: null },
        }) });
    return res.status;
  }, { m: fixture.manuscriptId, p: proposals.stable, u: first });
  check('a rename is accepted', renamed === 200, String(renamed));

  await open('stable');
  const after = await page.$$eval('[data-maia-original]', (e) => e.length);
  check('a changed division shows MAIA\'s original beneath the member\'s', after === 1);

  /* -- authority on the wire --------------------------------------------- */
  console.log('\n4 · authority');
  const staleStatus = await page.evaluate(async (args) => {
    const res = await fetch(
      `/api/sovereign/manuscripts/${args.m}/structure/proposals/${args.p}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expectedReviewRevision: 0,
          operation: { op: 'rename', unitId: args.u, title: 'Again', kind: null },
        }) });
    return res.status;
  }, { m: fixture.manuscriptId, p: proposals.stable, u: first });
  check('a stale review revision is refused', staleStatus === 409, String(staleStatus));

  const smuggled = await page.evaluate(async (args) => {
    const res = await fetch(
      `/api/sovereign/manuscripts/${args.m}/structure/proposals/${args.p}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expectedReviewRevision: 0,
          operation: {
            op: 'choose-alternative', alternativeId: 'a1',
            units: [{ id: 'x', title: 'INVENTED', kind: null,
              fromSectionId: 'a', toSectionId: 'b', children: [],
              rationale: '', evidenceRefs: [], uncertainty: [] }],
          },
        }) });
    const body = await res.json();
    return { status: res.status, titles: JSON.stringify(body).includes('INVENTED') };
  }, { m: fixture.manuscriptId, p: proposals.ambiguous });
  check('choose-alternative ignores a smuggled tree',
    smuggled.status === 200 && !smuggled.titles,
    `${smuggled.status}${smuggled.titles ? ' — TREE ACCEPTED' : ''}`);

  /* An unrecognised operation must be REFUSED, not silently applied. Before the
     boundary parser existed this returned 200 with an unchanged tree: a no-op
     reported as a completed gesture. */
  const bogus = await page.evaluate(async (args) => {
    const call = async (operation: unknown) => {
      const res = await fetch(
        `/api/sovereign/manuscripts/${args.m}/structure/proposals/${args.p}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ expectedReviewRevision: args.rev, operation }) });
      return res.status;
    };
    return {
      unknown: await call({ op: 'obliterate', unitId: args.u }),
      missingField: await call({ op: 'reparent', unitId: args.u }),
      notAnObject: await call('rename'),
    };
  }, { m: fixture.manuscriptId, p: proposals.stable, u: first, rev: 1 });
  check('an unknown operation is refused as malformed', bogus.unknown === 400,
    String(bogus.unknown));
  check('a known operation missing a field is refused', bogus.missingField === 400,
    String(bogus.missingField));
  check('a non-object operation is refused', bogus.notAnObject === 400,
    String(bogus.notAnObject));

  /* ONE ENGINE, PROVEN. The post-image returned by a preview and the one stored
     by the commit must be identical - not similar, and not merely believed to
     agree because the same function is called twice. */
  console.log('\n4b · what is previewed is what is stored');
  const sameImage = await page.evaluate(async (args) => {
    const call = async (body: unknown) => {
      const res = await fetch(
        `/api/sovereign/manuscripts/${args.m}/structure/proposals/${args.p}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body) });
      return { status: res.status, json: await res.json() };
    };
    const op = { op: 'rename', unitId: args.u, title: 'Previewed then stored', kind: 'Part' };
    const pre = await call({ expectedReviewRevision: args.rev, operation: op, previewOnly: true });
    const com = await call({ expectedReviewRevision: args.rev, operation: op });
    return {
      previewHasImage: pre.json?.reviewed !== undefined,
      identical: JSON.stringify(pre.json?.reviewed) === JSON.stringify(com.json?.reviewed),
      status: com.status,
    };
  }, { m: fixture.manuscriptId, p: proposals.stable, u: first, rev: 1 });
  check('a preview returns the post-image it describes', sameImage.previewHasImage);
  check('and the committed post-image is byte-identical to it',
    sameImage.identical && sameImage.status === 200, String(sameImage.status));

  /* -- staleness is measured, never assumed ------------------------------ */
  console.log('\n4c · staleAsRead is a measurement');
  const readStale = async (name: string) => page.evaluate(async (args) => {
    const res = await fetch(
      `/api/sovereign/manuscripts/${args.m}/structure/proposals/${args.p}`);
    const j = await res.json();
    return j.staleAsRead as boolean | null;
  }, { m: fixture.manuscriptId, p: proposals[name] });

  check('an unrewritten Work reads as not stale', (await readStale('stable')) === false);
  /* `partial` read two bodies in full. Rewrite one of them - through the round
     trip, because the database refuses a section edit that leaves the draft's
     content out of step with its sections. Rewriting the section alone would
     have failed at COMMIT, which is the invariant working. */
  const readIds = allReadings.partial(sections).coverage.bodies.sectionIds;
  await transaction(async (tx) => {
    await tx.query(
      `UPDATE manuscript_draft_sections SET text = text || 'rewritten. ' WHERE id = $1`,
      [readIds[0]]);
    await tx.query(
      `UPDATE manuscript_working_drafts d
          SET content = (SELECT COALESCE(string_agg(s.text, '' ORDER BY s.position), '')
                           FROM manuscript_draft_sections s WHERE s.draft_id = d.id)
        WHERE d.id = $1`,
      [fixture.draftId]);
  });
  check('rewriting a body MAIA read makes the reading stale',
    (await readStale('partial')) === true);
  /* And a heading change is caught even where no body was read at all. */
  await query(
    `UPDATE manuscript_sections SET heading = 'CHANGED'
      WHERE id = (SELECT source_section_id FROM manuscript_draft_sections WHERE id = $1)`,
    [sections[0].id]);
  check('rewriting a heading makes a headings-only reading stale',
    (await readStale('flat')) === true);

  /* -- coupled gestures show their whole post-image ---------------------- */
  console.log('\n5 · atomic does not mean hidden');
  await open('mixed');
  const nested = await page.$$eval('[data-review-unit] [data-review-unit]',
    (els) => els.map((e) => e.getAttribute('data-review-unit')!));
  check('the mixed reading has something nested to promote', nested.length > 0);
  if (nested.length > 0) {
    await page.click(`[data-review-unit="${nested[0]}"] button[aria-label*="out one level"]`);
    await page.waitForSelector('[data-post-image]', { timeout: 10_000 }).catch(() => undefined);
    const changeRows = await page.$$eval('[data-change-row]',
      (els) => els.map((e) => e.getAttribute('data-change-row')!));
    check('promote previews BOTH changed divisions before committing',
      changeRows.length === 2 && changeRows.includes('moves-out')
        && changeRows.includes('range-changes'),
      changeRows.join(','));
  }

  /* -- the boundary ------------------------------------------------------ */
  console.log('\n6 · the review cannot author structure');
  const canonical = await query(
    `SELECT 1 FROM manuscript_structure_units WHERE manuscript_id = $1`,
    [fixture.manuscriptId]);
  check('review gestures created ZERO canonical structure rows',
    canonical.rows.length === 0, `${canonical.rows.length}`);

  const stored = await loadProposal(proposals.stable, fixture.memberId);
  check('and the frozen interpretation still says what MAIA said',
    stored.status === 'ok' && 'units' in stored.value.interpretation
      && stored.value.interpretation.units[0].title === 'Departure',
    stored.status === 'ok' && 'units' in stored.value.interpretation
      ? String(stored.value.interpretation.units[0].title) : '?');

  await page.screenshot({ path: `${OUT}/ws2-05b-review.png` });
  console.log(`\n  capture: ${OUT}/ws2-05b-review.png`);
  await browser.close();

  /* -- leave nothing behind --------------------------------------------- */
  console.log('\n7 · cleanup');
  if (process.env.KEEP_FIXTURE === '1') {
    console.log(`  fixture KEPT at manuscript ${fixture.manuscriptId}`);
  } else {
    const gone = await query(`DELETE FROM member_manuscripts WHERE id = $1`,
      [fixture.manuscriptId]);
    check('the fixture manuscript is removed', (gone.rowCount ?? 0) === 1);
  }

  console.log(`\n${failures === 0 ? 'PASS' : 'FAIL'} — ${failures} failed\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
