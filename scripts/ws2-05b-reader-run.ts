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
 *
 * `CONTRACT_ONLY=1` prints the STANDING INSTRUCTIONS and the TOOL SCHEMA and
 * nothing else - no database, no manuscript, no key. It is the smaller half of
 * DRY_RUN, separated because the contract is the half that changes between
 * readers: `DRY_RUN=1` also shows this Work's headings and observations, which
 * is a lot of scrolling when what you are checking is what MAIA was ASKED.
 * Inspect it before a reading, and compare `promptContractHash` afterwards
 * against the one frozen on the proposal.
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
  if (process.env.CONTRACT_ONLY === '1') {
    /* Imported here rather than at the top so this path needs no database, no
       manuscript and no key: the contract is a property of the reader, not of
       any Work, and checking it should cost nothing. */
    const { READER_SYSTEM, readerTools, promptContractHash, READER_VERSION } =
      await import('@/lib/manuscript/structure/maiaReader');
    console.log(`\n=== READER CONTRACT · ${READER_VERSION} ===`);
    console.log(`promptContractHash  ${promptContractHash()}`);
    console.log('\n--- STANDING INSTRUCTIONS (system) ---\n');
    console.log(READER_SYSTEM);
    console.log('\n--- TOOLS (the other half of the instruction) ---\n');
    console.log(JSON.stringify(readerTools(), null, 2));
    console.log('\nNothing was sent. No database was opened.\n');
    return;
  }

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

    /* THE PREFLIGHT FACTS, and THE STANDING OF EACH ONE.
       They are what a person actually checks before spending a real reading,
       and hunting for them inside 174 heading rows is how a preflight becomes a
       formality. But they are NOT all the same kind of claim, and printing them
       in one undifferentiated block would make "the preflight said true" into a
       new proof category - which is precisely the drift this programme keeps
       finding under new names.

       So the block is grouped by standing, and each group says how it knows:

         DERIVED     read out of live code in this process - the hash from the
                     reader, the ceilings from the same scope constant the host
                     enforces, the contract fields from the tool schema itself.
                     A change to any of them moves this output.
         SENTINEL    a textual test on the rendered request. It would miss a
                     body that arrived without the heading it looks for, so the
                     exact request is printed below and the property has its own
                     host tests. The line is a convenience, not the evidence.
         DISPLAYED   standing rules enforced elsewhere - in the host loop, its
                     refusals and their tests - and shown here for inspection.
                     This preflight does not derive them and cannot verify them.

       The distinction is the point. Two of these lines used to sit beside the
       derived ones looking equally strong. */
    const { promptContractHash, READER_VERSION, readerTools } =
      await import('@/lib/manuscript/structure/maiaReader');
    const propose = readerTools()[0].input_schema as Record<string, unknown>;
    const props = propose.properties as Record<string, Record<string, unknown>>;
    const unitReq = ((props.units.items as Record<string, unknown>).required ?? []) as string[];
    const synReq = (props.editorialSynthesis?.required ?? []) as string[];
    const readingReq = (propose.required ?? []) as string[];

    console.log('\n══ PREFLIGHT ' + '═'.repeat(57));

    console.log('\n  DERIVED — read out of live code in this process');
    const row = (k: string, v: string) => console.log(`    ${k.padEnd(30)} ${v}`);
    row('promptContractHash', `${promptContractHash().slice(0, 12)}…`);
    row('readerVersion', READER_VERSION);
    row('editorialLabel required', String(unitReq.includes('editorialLabel')));
    row('editorialSynthesis required', String(readingReq.includes('editorialSynthesis')));
    row('  its fields', synReq.join(' · ') || '(none)');
    row('ceilings', `${DEFAULT_READ_SCOPE.maxIdsPerRequest}/request · `
      + `${DEFAULT_READ_SCOPE.maxSections}/read · `
      + `${DEFAULT_READ_SCOPE.maxChars.toLocaleString('en-US')} chars`);

    const carriesProse = body.includes('SECTIONS YOU REQUESTED');
    console.log('\n  SENTINEL — a textual test on the request printed below.'
      + '\n             Read the request; this line is a convenience, not the evidence.');
    row('pass 1 bodies', carriesProse
      ? 'SOME — INVESTIGATE' : '0 (no requested-sections block)');

    console.log('\n  DISPLAYED — standing rules enforced in the host loop and its'
      + '\n              tests, NOT derived or verified by this preflight');
    row('no truncation', 'whole section or no section');
    row('Materials', 'out of scope');

    console.log('\n  DRY RUN — everything that would be sent on pass 1.\n');
    console.log('══ SYSTEM ' + '═'.repeat(60));
    console.log(READER_SYSTEM);
    console.log('\n══ USER ' + '═'.repeat(62));
    console.log(body);
    console.log('\n══ ' + '═'.repeat(67));
    /* Stated rather than left to be inferred from the absence of a heading -
       and it is the SAME sentinel as the preflight line, not a second opinion. */
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
    editorialLabel?: string | null;
    fromSectionId: string; toSectionId: string; uncertainty: readonly string[];
    children: readonly unknown[] }, depth: number): void => {
    /* THE LABEL PRINTS UNCONDITIONALLY; the title does not.
       The existing gate is there because titles are drawn from the MEMBER'S own
       words. An editorial label is MAIA's own words about a division, and
       whether she produced one is the whole question 02b was built to answer -
       so requiring the flag that also dumps the member's titles in order to see
       it would put the witness behind the wrong door. */
    const label = u.editorialLabel === undefined ? ''
      : `  ⟨${u.editorialLabel ?? 'no label'}⟩`;
    const name = (SHOW_READING
      ? `${u.kind ?? '—'} · ${u.title ?? '(untitled)'}`
      : `${u.kind ?? '—'}`) + label;
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

  /* ── the 02b witness: is the reading COMMUNICABLE? ─────────────────────── */

  /* AFTER the proposal is stored, deliberately. This is reporting, and a paid
     reading must not be lost to a crash in the code that describes it. The row
     is the artifact; the console is commentary, and re-runnable from the row. */

  /**
   * Not "did she reproduce the old structure". 8B failed on a page that was
   * mechanically faithful, so what has to be inspected here is whether the
   * distinction a reader needs was available to MAIA when she was asked for it
   * explicitly - and whether it stayed on her side of the adoption seam.
   *
   * FIVE NULLS IS A RESULT, NOT A BUG. It would mean she could perceive the
   * labels in prose and did not regard them as grounded enough to emit. That
   * is a finding about the reading, and repairing the prompt on the spot would
   * destroy it.
   */
  type U = { id: string; title: string | null; kind: string | null;
    editorialLabel?: string | null; fromSectionId: string; toSectionId: string;
    children: U[] };
  const allUnits: U[] = [];
  const gather = (us: readonly U[]) => { for (const u of us) { allUnits.push(u); gather(u.children); } };
  if ('units' in interp) gather(interp.units as U[]);
  if ('alternatives' in interp) for (const a of interp.alternatives) gather(a.units as U[]);

  console.log('\n  ── editorial witness ──');
  const labelled = allUnits.filter((u) => typeof u.editorialLabel === 'string');
  const declined = allUnits.filter((u) => u.editorialLabel === null);
  const missing = allUnits.filter((u) => u.editorialLabel === undefined);
  console.log(`  labels: ${labelled.length} given · ${declined.length} declined (null)`
    + `${missing.length ? ` · ${missing.length} ABSENT — INVESTIGATE` : ''}`
    + ` of ${allUnits.length} division(s)`);

  /* The adversarial shape itself: siblings sharing one kind with no titles.
     If any such group exists, its rows are what 02b lives or dies on. */
  const groups = new Map<string, U[]>();
  const sib = (us: readonly U[]) => {
    const byKind = new Map<string, U[]>();
    for (const u of us) {
      if (u.kind) byKind.set(u.kind, [...(byKind.get(u.kind) ?? []), u]);
      sib(u.children);
    }
    for (const [k, list] of byKind) {
      if (list.length >= 2 && list.every((u) => u.title === null)) {
        groups.set(k, [...(groups.get(k) ?? []), ...list]);
      }
    }
  };
  if ('units' in interp) sib(interp.units as U[]);

  if (groups.size === 0) {
    console.log('  no untitled same-kind sibling group in this reading');
  } else {
    for (const [kind, list] of groups) {
      console.log(`\n  ${list.length} untitled siblings of kind "${kind}" —`
        + ' the shape 8B failed on:');
      console.log('    kind          title   editorialLabel');
      for (const u of list) {
        console.log(`    ${kind.padEnd(13)} null    `
          + `${u.editorialLabel === undefined ? '(absent)' : u.editorialLabel ?? 'null'}`
          + `   ${at.get(u.fromSectionId)}–${at.get(u.toSectionId)}`);
      }
    }
  }

  /* THE SEAM. A label that arrived as a title would be exactly the invention
     this programme has refused throughout, and the one failure the offline
     leak test cannot catch: it proves the code does not COPY the label, not
     that MAIA did not write the same words into both fields. */
  const leaked = allUnits.filter((u) =>
    u.title !== null && u.editorialLabel != null && u.title === u.editorialLabel);
  console.log(`\n  label leaked into title: ${leaked.length === 0 ? 'none'
    : `${leaked.length} unit(s) — ${leaked.map((u) => u.id).join(',')} — INVESTIGATE`}`);

  const syn = interp.editorialSynthesis;
  if (!syn) {
    console.log('  editorialSynthesis: ABSENT — this reading predates the contract');
  } else {
    console.log(`  editorialSynthesis: ${syn.strongestFindings.length} finding(s),`
      + ` ${syn.questionsForAuthor.length} question(s)`);
    /* Text behind the same gate as `account`: it is MAIA's prose about the
       member's book, and may quote it. The COUNTS above are structural and
       always print, so "did she write a letter at all" needs no flag. */
    if (SHOW_READING) {
      console.log(`\n  THESIS: ${syn.thesis}`);
      for (const f of syn.strongestFindings) console.log(`    · ${f}`);
      for (const q of syn.questionsForAuthor) {
        const where = (q.sectionIds ?? []).map((id) => at.get(id) ?? '?').join(',');
        console.log(`\n    Q: ${q.label}${where ? `  [${where}]` : '  [no place named]'}`);
        console.log(`       ${q.explanation}`);
      }
    } else {
      console.log('  (SHOW_READING=1 to print the letter itself)');
    }
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
