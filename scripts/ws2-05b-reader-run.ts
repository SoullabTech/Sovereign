/**
 * WS2-05B-5½ · REAL-STRUCTURE-READER-01 — MAIA reads a real Work.
 *
 * The first time anything in this programme asks MAIA what a member's book is.
 * It gathers mechanical evidence, runs the host loop with the real reader,
 * stores the result as a PROPOSAL, and prints the link to the room where the
 * member judges it.
 *
 * WHAT IT CANNOT DO. It imports the proposal store and never the structure
 * service. Nothing here can write `manuscript_structure_units`; adoption is 6
 * and 6 is not built. Running this against your own book cannot change it.
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
 *   ANTHROPIC_API_KEY=... DATABASE_URL=... \
 *   MEMBER_ID=<uuid> MANUSCRIPT=<uuid> \
 *   npx tsx scripts/ws2-05b-reader-run.ts
 */

const MANUSCRIPT = process.env.MANUSCRIPT ?? '';
const MEMBER_ID = process.env.MEMBER_ID ?? '';
const BASE = process.env.BASE ?? 'http://localhost:3105';
const SHOW_READING = process.env.SHOW_READING === '1';
const DRY_RUN = process.env.DRY_RUN === '1';
const MAX_PASSES = Number(process.env.MAX_PASSES ?? '3') as 1 | 2 | 3;

async function main() {
  if (!MANUSCRIPT || !MEMBER_ID) {
    console.error('\n  MANUSCRIPT and MEMBER_ID are required (both uuids).\n');
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
  const { createProposal } = await import('@/lib/manuscript/structure/proposalStore');
  const {
    createMaiaStructureReader, boundedFetcher, buildRequest, StructureReaderError,
  } = await import('@/lib/manuscript/structure/maiaReader');

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
    console.log('\n  DRY RUN — the pass-1 request, which is what would be sent:\n');
    console.log(buildRequest({ pass: 1, evidence, sections, bodies: new Map() }));
    console.log('\n  Nothing was sent and nothing was stored.\n');
    process.exit(0);
  }

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

  const reader = createMaiaStructureReader({
    onTurn: (t) => console.log(`  pass ${t.pass} → ${t.tool}`
      + `  (in ${t.inputTokens} / out ${t.outputTokens} tokens,`
      + ` ${t.bodiesSupplied} bodies in hand)`),
  });

  console.log('\n  Reading…');
  const started = Date.now();
  let result;
  try {
    result = await interpretStructure(evidence, sections, reader,
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
    throw e;
  }
  const secs = ((Date.now() - started) / 1000).toFixed(1);

  if (result.status === 'refused') {
    console.error(`\n  THE HOST REFUSED THE READING — ${result.refusal}`
      + `${result.detail ? ` (${result.detail})` : ''}`);
    console.error('  Nothing was stored. The interpreter judged the reading'
      + ' ill-formed, which is the guard working.\n');
    process.exit(1);
  }

  const interp = result.interpretation;
  console.log(`\n  Form: ${interp.form}   (${secs}s)`);
  console.log(`  Coverage: headings all · bodies ${interp.coverage.bodies.mode}`
    + ` (${interp.coverage.bodies.sectionIds.length}) · ${interp.coverage.passes} pass(es)`);
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
  });

  if (stored.status !== 'ok') {
    console.error(`\n  NOT STORED — ${stored.refusal}`
      + `${stored.detail ? ` (${stored.detail})` : ''}\n`);
    process.exit(1);
  }

  const units = await query(
    `SELECT 1 FROM manuscript_structure_units WHERE manuscript_id = $1`, [MANUSCRIPT]);
  console.log(`\n  Stored as a proposal: ${stored.value.id}`);
  console.log(`  Canonical structure rows written: ${units.rows.length === 0 ? '0 — none, '
    + 'as there is no path from here to one' : `${units.rows.length} — INVESTIGATE`}`);
  console.log(`  Bodies that left the machine: ${supplied.length}`);
  console.log(`\n  Read it: ${BASE}/writers-studio/review`
    + `?m=${MANUSCRIPT}&p=${stored.value.id}\n`);

  process.exit(units.rows.length === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
