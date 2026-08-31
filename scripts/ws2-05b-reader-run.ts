/**
 * WS2-05B-5½ · REAL-STRUCTURE-READER-01 — MAIA reads a real Work.
 *
 * The first time anything in this programme asks MAIA what a member's book is.
 * It gathers mechanical evidence, runs the host loop with the real reader,
 * stores the result as a PROPOSAL, and prints the link to the room where the
 * member judges it.
 *
 * WHAT IT CANNOT DO, AND HOW THAT IS SHOWN. It imports the proposal store and
 * never the structure service, so there is no writer in the process. That is the
 * static half. The dynamic half is a FINGERPRINT OF THE CANONICAL STRUCTURE
 * taken before and after: the first version of this check asserted that the
 * manuscript had zero structure rows, which proves "this Work has no structure"
 * and says nothing at all about a Work that already has some. Before == after is
 * the claim actually being made.
 *
 * WHAT IT PRINTS. Structure, counts, ranges, uncertainty tags and coverage - and
 * never a body, under any flag. `SHOW_READING=1` additionally prints MAIA's
 * account and the division titles, which is what 05B-8 needs a person to judge;
 * it is opt-in because titles are drawn from the member's own words.
 *
 * WHAT LEAVES THE MACHINE. Headings and mechanical observations on pass 1. Prose
 * only for sections MAIA explicitly requests, and exactly those are recorded in
 * the stored proposal's coverage. `DRY_RUN=1` prints the pass-1 request instead
 * of sending it - read it before you send your book.
 *
 * Run it with MANUSCRIPT set and MEMBER_ID unset once, and it prints the query
 * that resolves your member id. No placeholder to paste - an angle-bracket
 * placeholder is a redirect in zsh, and has twice been pasted literally.
 */

const MANUSCRIPT = process.env.MANUSCRIPT ?? '';
const MEMBER_ID = process.env.MEMBER_ID ?? '';
const BASE = process.env.BASE ?? 'http://localhost:3105';
const SHOW_READING = process.env.SHOW_READING === '1';
const DRY_RUN = process.env.DRY_RUN === '1';
const MAX_PASSES = Number(process.env.MAX_PASSES ?? '3') as 1 | 2 | 3;
/** Where a refused reading is kept for inspection. Never the database. */
const OUT = process.env.OUT ?? '/tmp';

async function main() {
  if (!MANUSCRIPT || !MEMBER_ID) {
    /* The member id is NOT looked up from the manuscript here, deliberately:
       every query below is scoped by (manuscript, member) so a wrong id reads
       nothing rather than someone else's Work. Deriving it from the manuscript
       would quietly remove that check. Printing the query keeps the safety and
       spares a placeholder, which is a shell redirect in zsh and has now cost a
       run twice. */
    console.error('\n  MANUSCRIPT and MEMBER_ID are required (both uuids).');
    if (MANUSCRIPT && !MEMBER_ID) {
      console.error('\n  Your member id, for this Work:\n'
        + `\n    export MEMBER_ID=$(psql -U soullab -d maia_consciousness -tAc \\\n`
        + `      "SELECT member_id FROM member_manuscripts WHERE id='${MANUSCRIPT}'")\n`);
    }
    process.exit(2);
  }
  if (!DRY_RUN && !process.env.ANTHROPIC_API_KEY) {
    /* Named plainly rather than failed deep inside the SDK: this is the step
       where the reading actually costs something and leaves the machine. */
    console.error('\n  ANTHROPIC_API_KEY is required to read.'
      + '\n  Run with DRY_RUN=1 to see exactly what would be sent, without sending it.\n');
    process.exit(2);
  }

  const { query } = await import('@/lib/db/postgres');
  const { gatherEvidence, sectionTopologyHash } = await import('@/lib/manuscript/structure/evidence');
  const { interpretStructure } = await import('@/lib/manuscript/structure/interpret');
  const { DEFAULT_READ_SCOPE } = await import('@/lib/manuscript/structure/readScope');
  const { createProposal } = await import('@/lib/manuscript/structure/proposalStore');
  const {
    createMaiaStructureReader, boundedFetcher, buildRequest, StructureReaderError,
    READER_SYSTEM,
  } = await import('@/lib/manuscript/structure/maiaReader');
  const { canonicalFingerprint } = await import('@/lib/manuscript/structure/canonicalFingerprint');

  /* ── the Work, as the app addresses it ────────────────────────────────── */
  const rows = await query<{ id: string; position: number; heading: string | null }>(
    `SELECT s.id, s.position, ms.heading
       FROM manuscript_draft_sections s
       JOIN manuscript_working_drafts d ON d.id = s.draft_id
       JOIN member_manuscripts m ON m.id = d.manuscript_id
       LEFT JOIN manuscript_sections ms ON ms.id = s.source_section_id
      WHERE d.manuscript_id = $1 AND m.member_id = $2
        AND d.section_addressable_at IS NOT NULL
      ORDER BY s.position ASC`,
    [MANUSCRIPT, MEMBER_ID]);

  const sections = rows.rows;
  if (sections.length === 0) {
    console.error('\n  No section-addressable draft for that manuscript and member.\n');
    process.exit(2);
  }
  const headed = sections.filter((s) => s.heading !== null).length;
  console.log(`\n  Work: ${sections.length} sections, ${headed} with headings`);

  /* ── mechanics first, always ──────────────────────────────────────────── */
  const evidence = gatherEvidence(MANUSCRIPT, sections);
  console.log(`  Evidence: ${evidence.observations.length} observation(s)`);
  for (const o of evidence.observations) {
    console.log(`    [${o.id}] ${o.kind} · ${o.positions.length} place(s)`);
  }

  if (DRY_RUN) {
    /* THE WHOLE THING, not half of it. The first version printed only the user
       message, so the standing instructions - where the ceilings and the
       Materials exclusion actually live - could not be inspected before a book
       was sent. "Read it before you send your book" has to mean all of it. */
    const body = buildRequest({ pass: 1, evidence, sections, bodies: new Map() });
    console.log('\n  DRY RUN — everything that would be sent on pass 1.\n');
    console.log('══ SYSTEM ' + '═'.repeat(60));
    console.log(READER_SYSTEM);
    console.log('\n══ USER ' + '═'.repeat(62));
    console.log(body);
    console.log('\n══ ' + '═'.repeat(67));
    /* Stated rather than left to be inferred from the absence of a heading. */
    const carriesProse = body.includes('SECTIONS YOU REQUESTED');
    console.log(`\n  Manuscript bodies in this request: ${carriesProse ? 'SOME — INVESTIGATE'
      : '0 — headings and mechanical observations only'}`);
    console.log('  Nothing was sent and nothing was stored.\n');
    process.exit(carriesProse ? 1 : 0);
  }

  /* Taken BEFORE anything runs, including before the proposal is written. */
  const before = await canonicalFingerprint(MANUSCRIPT);
  const beforeCount = (await query(
    `SELECT 1 FROM manuscript_structure_units WHERE manuscript_id = $1`,
    [MANUSCRIPT])).rows.length;
  console.log(`  Canonical structure before: ${beforeCount} unit(s)`
    + `  fp ${before.slice(0, 12)}`);

  /* ── the reading ──────────────────────────────────────────────────────── */
  const supplied: string[] = [];
  const fetchBodies = boundedFetcher(async (ids) => {
    const r = await query<{ id: string; text: string }>(
      `SELECT s.id, s.text
         FROM manuscript_draft_sections s
         JOIN manuscript_working_drafts d ON d.id = s.draft_id
         JOIN member_manuscripts m ON m.id = d.manuscript_id
        WHERE d.manuscript_id = $1 AND m.member_id = $2 AND s.id = ANY($3::uuid[])`,
      [MANUSCRIPT, MEMBER_ID, ids]);
    for (const row of r.rows) supplied.push(row.id);
    return new Map(r.rows.map((row) => [row.id, row.text]));
  });

  const maia = createMaiaStructureReader({
    onTurn: (t) => console.log(`  pass ${t.pass} → ${t.tool}`
      + `  (in ${t.inputTokens} / out ${t.outputTokens} tokens,`
      + ` ${t.bodiesSupplied} bodies in hand)`),
  });
  console.log(`  Reader: ${maia.provenance.model} · ${maia.provenance.readerVersion}`
    + ` · prompt ${maia.provenance.promptHash.slice(0, 12)}`);
  console.log(`  Scope:  at most ${DEFAULT_READ_SCOPE.maxIdsPerRequest} ids per request,`
    + ` ${DEFAULT_READ_SCOPE.maxSections} sections and`
    + ` ${DEFAULT_READ_SCOPE.maxChars.toLocaleString('en-US')} chars per reading;`
    + ' no truncation; Materials out of scope');

  console.log('\n  Reading…');
  const started = Date.now();
  let result;
  try {
    result = await interpretStructure(evidence, sections, maia.read,
      { fetchBodies, maxPasses: MAX_PASSES });
  } catch (e) {
    /* A reader fault is reported AS a reader fault. It is not stored, and it is
       not rendered as "no structure is evident". */
    if (e instanceof StructureReaderError) {
      console.error(`\n  READER FAULT — ${e.reason}${e.detail ? ` (${e.detail})` : ''}`);
      console.error('  Nothing was stored. This is a fault in the machine, not a'
        + ' finding about the Work.\n');
      process.exit(1);
    }
    /* AND SO IS A TRANSPORT FAULT. This arrived as a raw SDK stack trace with no
       statement about what had happened to the Work - which is the one thing a
       person watching a reading of their own book needs to be told first. An
       auth failure, a rate limit and a dropped connection are all "the reading
       did not happen", and none of them is a finding. */
    const status = (e as { status?: number }).status;
    const kind = status === 401 ? 'the API rejected the key'
      : status === 429 ? 'rate limited'
        : status && status >= 500 ? 'the API is failing'
          : 'the request did not complete';
    console.error(`\n  THE READING DID NOT HAPPEN — ${kind}`
      + `${status ? ` (HTTP ${status})` : ''}`);
    console.error(`  ${(e as Error).message?.split('\n')[0] ?? String(e)}`);
    console.error('\n  Nothing was stored, and your Work is untouched: no proposal'
      + '\n  was written and nothing here can write canonical structure.\n');
    process.exit(1);
  }
  const secs = ((Date.now() - started) / 1000).toFixed(1);

  if (result.status === 'refused') {
    console.error(`\n  THE HOST REFUSED THE READING — ${result.refusal}`
      + `${result.detail ? ` (${result.detail})` : ''}`);

    /* KEEP WHAT WAS REFUSED, so the guard can be checked.
       A refusal costs a real call and several sections of the member's prose
       leaving their machine. Discarding the reading makes that expensive and
       uninformative: there is then no way to see whether one stray boundary
       spoiled a sound reading, or whether the validator misread what she was
       expressing. Written to a LOCAL FILE, never to the database - it is not a
       proposal and there is no path here that could make it one. It holds her
       words about the Work; it holds no body, because the host never gave the
       reading one to carry. */
    if (result.refusedReading) {
      const r = result.refusedReading;
      const out = `${OUT}/ws2-05b-refused-${Date.now()}.json`;
      const { writeFileSync } = await import('fs');
      writeFileSync(out, JSON.stringify(r, null, 2));

      const count = (us: readonly { children: readonly unknown[] }[]): number =>
        us.reduce((n, u) => n + 1 + count(u.children as typeof us), 0);
      const units = 'units' in r ? r.units : [];
      console.error(`\n  What she proposed, refused: form ${r.form},`
        + ` ${count(units)} division(s)`
        + `${'alternatives' in r ? `, ${r.alternatives.length} alternative(s)` : ''}`);
      console.error(`  Kept for inspection, NOT stored: ${out}`);
    }

    if (result.scope) {
      /* Counts and ids. A scope refusal must not become the channel that leaks
         what the scope exists to bound. */
      const q = result.scope;
      console.error(`  sections: ${q.alreadySuppliedCount} supplied,`
        + ` ${q.requestedTotalCount} would be, limit ${q.limitSections}`);
      console.error(`  chars:    ${q.alreadySuppliedChars} supplied,`
        + ` ${q.prospectiveTotalChars} would be, limit ${q.limitChars}`);
      console.error(`  refused request: ${q.requestedIds.length} id(s)`);
      console.error('\n  Nothing was truncated and nothing was stored. If a bounded'
        + '\n  reading cannot settle this Work, that is a finding about the'
        + '\n  protocol - not a reason to raise the ceiling.\n');
    } else {
      console.error('  Nothing was stored. The interpreter judged the reading'
        + ' ill-formed, which is the guard working.\n');
    }
    process.exit(1);
  }

  const interp = result.interpretation;
  console.log(`\n  Form: ${interp.form}   (${secs}s)`);
  const cov = interp.coverage.bodies;
  console.log(`  Coverage: headings all · bodies ${cov.mode}`
    + ` (${cov.sectionIds.length}/${cov.sectionLimit} sections,`
    + ` ${cov.totalChars}/${cov.charLimit} chars, truncated ${cov.truncated})`
    + ` · ${interp.coverage.passes} pass(es)`);
  console.log(`  Unaccounted: ${interp.unaccountedSectionIds.length} of ${sections.length}`);
  console.log(`  Uncertain regions: ${interp.uncertainRegions.length}`);

  const at = new Map(sections.map((s) => [s.id, s.position]));
  const show = (u: { id: string; title: string | null; kind: string | null;
    fromSectionId: string; toSectionId: string; uncertainty: readonly string[];
    children: readonly unknown[] }, depth: number): void => {
    const name = SHOW_READING
      ? `${u.kind ?? '—'} · ${u.title ?? '(untitled)'}`
      : `${u.kind ?? '—'}`;
    console.log(`  ${'  '.repeat(depth)}${u.id}  ${name}`
      + `  ${at.get(u.fromSectionId)}–${at.get(u.toSectionId)}`
      + `${u.uncertainty.length ? `  ?${u.uncertainty.join(',')}` : ''}`);
    for (const c of u.children as typeof u[]) show(c, depth + 1);
  };

  if (SHOW_READING) console.log(`\n  MAIA: ${interp.account}`);
  if ('units' in interp) {
    console.log('');
    for (const u of interp.units) show(u, 0);
  }
  if ('alternatives' in interp) {
    for (const a of interp.alternatives) {
      console.log(`\n  [${a.id}] ${a.label}${SHOW_READING ? ` — ${a.why}` : ''}`);
      for (const u of a.units) show(u, 1);
    }
  }

  /* ── stored as a PROPOSAL, which is all it can ever be ────────────────── */
  const stored = await createProposal(MANUSCRIPT, MEMBER_ID, {
    evidence, interpretation: interp, coverage: interp.coverage,
    sectionTopologyHash: sectionTopologyHash(sections),
    interpretationInputHash: result.interpretationInputHash,
    /* Bound to the reader that actually ran, and frozen by the database with
       the reading it belongs to. */
    readerProvenance: maia.provenance,
  });

  if (stored.status !== 'ok') {
    console.error(`\n  NOT STORED — ${stored.refusal}`
      + `${stored.detail ? ` (${stored.detail})` : ''}\n`);
    process.exit(1);
  }

  /* ── the negative witness: nothing about the Work moved ───────────────── */
  const after = await canonicalFingerprint(MANUSCRIPT);
  const unchanged = after === before;

  console.log(`\n  Stored as a proposal: ${stored.value.id}`);
  console.log(`  Canonical structure after:  fp ${after.slice(0, 12)}`);
  console.log(`  Structure unchanged by this run: ${unchanged
    ? 'YES — before == after'
    : 'NO — INVESTIGATE. A reading changed the Work, which nothing here may do'}`);
  console.log(`  Bodies that left the machine: ${supplied.length}`);
  console.log(`\n  Read it: ${BASE}/writers-studio/review`
    + `?m=${MANUSCRIPT}&p=${stored.value.id}\n`);

  process.exit(unchanged ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
