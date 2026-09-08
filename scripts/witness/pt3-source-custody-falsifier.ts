/**
 * PT-3 FALSIFIER — protected source lineage.
 *
 * AUTHORITY. Founder ruling, Writer's Studio · Life of a Work, 2026-09-08:
 * PT-3 governs TWO tiers, differently named and equally protected from
 * content-working mutation.
 *
 *   HISTORICAL SOURCE      manuscript_source_arrivals (+ its vault artifact)
 *                          the custody-bearing arrival artifact.
 *   SOURCE REPRESENTATION  manuscript_sections
 *                          a derived pre-working interpretation of that
 *                          arrival, upon which Working Drafts may be based.
 *
 * This instrument exists to DISPROVE the constitutional claim, not to
 * demonstrate that the application behaves normally. It keeps two claims
 * apart, because they are not the same claim and one is routinely mistaken
 * for the other:
 *
 *   BEHAVIORAL COMPLIANCE   do the shipped content-working paths refrain from
 *                           writing either protected tier?
 *   STRUCTURAL ENFORCEMENT  would the architecture REFUSE a content-working
 *                           path that attempted such a write?
 *
 * A red structural result is a valid and consequential finding. Per the
 * ruling: do NOT make this instrument green by weakening the claim or by
 * repairing the database boundary. Remediation is unauthorized.
 *
 * SAFETY. Legs 3 and 4 issue deliberately destructive writes. They run only
 * against a disposable fixture database (see assertDisposableTarget) and only
 * behind an explicit confirmation. Source protection is never proven by
 * attacking production or real member material.
 *
 *   DATABASE_URL=postgresql://…/maia_falsifier \
 *   FILE_STORAGE_PATH=/tmp/pt3-vault \
 *   PT3_FALSIFIER_CONFIRM=1 \
 *     npx tsx scripts/witness/pt3-source-custody-falsifier.ts
 */
import { randomUUID, createHash } from 'crypto';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

import { query, transaction, closePool } from '@/lib/db/postgres';
import {
  recordArtifactArrival,
  recordSuppliedArrival,
  claimArrival,
  verifyCustody,
} from '@/lib/manuscript/source/arrivals';
import { readVaultBytes, resolveVaultRoot } from '@/lib/storage/fileVault';
import { saveSection } from '@/lib/manuscript/sections/saveSection';
import { convertDraftToSections } from '@/lib/manuscript/sections/convertDraft';
import { normalizeLegacyScaffoldForDraft } from '@/lib/manuscript/sections/normalizeLegacyScaffold';
import { eraseManuscript } from '@/lib/manuscript/source/eraseManuscript';
import { authorStructureFromProposal } from '@/lib/manuscript/structure/authorStructure';
import { sectionTopologyHash } from '@/lib/manuscript/structure/evidence';

/* ─────────────────────────── report primitives ─────────────────────────── */

type Verdict = 'PASS' | 'FAIL' | 'RED';
interface Line { leg: string; id: string; verdict: Verdict; label: string; detail: string }
const lines: Line[] = [];

/** A behavioural or census obligation. FAIL means the instrument is red. */
function check(leg: string, id: string, label: string, pass: boolean, detail = '') {
  lines.push({ leg, id, verdict: pass ? 'PASS' : 'FAIL', label, detail });
}
/**
 * A structural probe. `refused === true` means the architecture refused the
 * attack. `false` is NOT a test failure — it is the finding the ruling asked
 * for, and it is reported in its own vocabulary so it can never be quietly
 * absorbed into a green run.
 */
function probe(leg: string, id: string, label: string, refused: boolean, detail = '') {
  lines.push({
    leg, id, label,
    verdict: refused ? 'PASS' : 'RED',
    detail: refused ? detail : `${detail} — PT-3 BEHAVIORALLY OBSERVED / STRUCTURALLY UNENFORCED AT THIS BOUNDARY`,
  });
}

/* ───────────────────────────── safety gate ─────────────────────────────── */

function assertDisposableTarget() {
  if (process.env.PT3_FALSIFIER_CONFIRM !== '1') {
    throw new Error(
      'Refusing to run: legs 3 and 4 issue destructive writes to the protected tiers.\n' +
      'Set PT3_FALSIFIER_CONFIRM=1 and point DATABASE_URL at a disposable fixture database.',
    );
  }
  const url = process.env.DATABASE_URL ?? '';
  if (!url) throw new Error('Refusing to run: DATABASE_URL is not set.');

  /* Two independent conditions, both required. A hostname alone is not enough
     — a developer's laptop can hold a real member database on localhost. */
  const localHost = /@(127\.0\.0\.1|localhost)(:\d+)?\//.test(url);
  const disposableName = /\/[a-z0-9_]*(falsifier|fixture|shadow|disposable)[a-z0-9_]*(\?|$)/i.test(url);
  if (!localHost || !disposableName) {
    throw new Error(
      'Refusing to run against this DATABASE_URL.\n' +
      'Required: a local host AND a database name marked disposable ' +
      '(…falsifier / …fixture / …shadow / …disposable).\n' +
      'Source protection is never proven by attacking production or real member material.',
    );
  }
}

/* ══════════════════════ LEG 1 — mutation-boundary census ═════════════════ */

/**
 * The two protected tiers, by table. Everything else in the manuscript stack
 * is a descendant working representation and is free to change.
 */
const PROTECTED = {
  manuscript_source_arrivals: 'HISTORICAL SOURCE',
  manuscript_sections: 'SOURCE REPRESENTATION',
} as const;

type Classification =
  | 'arrival creation'
  | 'extraction / Source representation creation'
  | 'custody or claim bookkeeping'
  | 'explicit Source lifecycle operation'
  | 'prohibited content-working mutation';

interface AllowedWrite {
  file: string;
  statement: 'INSERT' | 'UPDATE' | 'DELETE';
  table: keyof typeof PROTECTED;
  classification: Classification;
  purpose: string;
}

/**
 * THE CONTRACT IS THIS NAMED SET — never its length.
 *
 * FR-14 discipline: an instrument can satisfy all of its remaining questions
 * by forgetting to ask the difficult ones. A census that asserted "four
 * writes" would pass the day a fifth replaced a fourth. Each entry below is
 * identified by purpose and classified; an unidentified Source write fails
 * the census outright.
 */
const ALLOWLIST: AllowedWrite[] = [
  {
    file: 'app/api/sovereign/manuscripts/route.ts',
    statement: 'INSERT', table: 'manuscript_sections',
    classification: 'extraction / Source representation creation',
    purpose: 'Import cuts the arrival into sections. This CREATES the representation; it never revises one.',
  },
  {
    file: 'lib/manuscript/source/arrivals.ts',
    statement: 'INSERT', table: 'manuscript_source_arrivals',
    classification: 'arrival creation',
    purpose: 'recordArtifactArrival / recordSuppliedArrival — the custody-bearing arrival is written once.',
  },
  {
    file: 'lib/manuscript/source/arrivals.ts',
    statement: 'UPDATE', table: 'manuscript_source_arrivals',
    classification: 'custody or claim bookkeeping',
    purpose: 'claimArrival binds an unclaimed arrival to a manuscript. Guarded by manuscript_id IS NULL; touches no source text, hash, or artifact.',
  },
];

const SCAN_ROOTS = ['app', 'lib'];

/** Comments document the boundary; only executable code may answer for it. */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1 ');
}

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '__tests__' || entry === '.next') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (/\.tsx?$/.test(full) && !/\.test\.tsx?$/.test(full)) yield full;
  }
}

function censusProtectedWrites(repoRoot: string) {
  const found: Array<{ file: string; statement: string; table: string }> = [];
  const tables = Object.keys(PROTECTED).join('|');
  const re = new RegExp(
    String.raw`\b(INSERT\s+INTO|UPDATE|DELETE\s+FROM)\s+(${tables})\b`,
    'gi',
  );
  for (const root of SCAN_ROOTS) {
    for (const file of walk(join(repoRoot, root))) {
      const code = stripComments(readFileSync(file, 'utf8'));
      for (const m of code.matchAll(re)) {
        found.push({
          file: relative(repoRoot, file),
          statement: m[1].toUpperCase().startsWith('INSERT') ? 'INSERT'
            : m[1].toUpperCase().startsWith('DELETE') ? 'DELETE' : 'UPDATE',
          table: m[2].toLowerCase(),
        });
      }
    }
  }
  return found;
}

function runCensus(repoRoot: string) {
  const found = censusProtectedWrites(repoRoot);
  const key = (w: { file: string; statement: string; table: string }) =>
    `${w.file}::${w.statement}::${w.table}`;
  const allowed = new Set(ALLOWLIST.map(key));
  const seen = new Set(found.map(key));

  const unidentified = found.filter((w) => !allowed.has(key(w)));
  check('1', 'C1', 'every Source write is on the named allowlist',
    unidentified.length === 0,
    unidentified.length === 0
      ? `${found.length} write site(s), all classified`
      : `UNIDENTIFIED: ${unidentified.map(key).join(' | ')}`);

  const vanished = ALLOWLIST.filter((w) => !seen.has(key(w)));
  check('1', 'C2', 'every allowlisted write still exists (the census cannot go stale)',
    vanished.length === 0,
    vanished.length === 0 ? 'all present' : `MISSING: ${vanished.map(key).join(' | ')}`);

  const prohibited = ALLOWLIST.filter((w) => w.classification === 'prohibited content-working mutation');
  check('1', 'C3', 'no write is classified as a prohibited content-working mutation',
    prohibited.length === 0, prohibited.map((w) => w.file).join(' | '));

  for (const w of ALLOWLIST) {
    lines.push({
      leg: '1', id: `C4·${w.table === 'manuscript_sections' ? 'REP' : 'HIST'}`,
      verdict: 'PASS',
      label: `${w.statement} ${w.table} — ${w.classification}`,
      detail: `${w.file} · ${w.purpose}`,
    });
  }
}

/* ═══════════════════════ witness of the protected tiers ══════════════════ */

interface TierWitness {
  historical: {
    rows: number;
    digest: string;
    artifactBytesHash: string | null;
    custody: string;
  };
  representation: { rows: number; digest: string };
}

const sha = (s: string) => createHash('sha256').update(Buffer.from(s, 'utf-8')).digest('hex');

async function witness(manuscriptId: string, memberId: string): Promise<TierWitness> {
  const arr = await query<Record<string, unknown>>(
    `SELECT id, source_kind, artifact_ref, artifact_hash, artifact_size, original_filename,
            mime_type, source_text, source_text_hash, extraction_method, extractor_version
       FROM manuscript_source_arrivals WHERE manuscript_id = $1 ORDER BY created_at, id`,
    [manuscriptId],
  );
  const sec = await query<Record<string, unknown>>(
    `SELECT id, position, heading, body, heading_depth, heading_signal
       FROM manuscript_sections WHERE manuscript_id = $1 ORDER BY position, id`,
    [manuscriptId],
  );

  /* The bytes, not the row's claim about the bytes. A hash column that still
     reads correctly over deleted bytes is precisely the false green WS-01
     was built to refuse. */
  let artifactBytesHash: string | null = null;
  const ref = arr.rows.find((r) => r.artifact_ref)?.artifact_ref as string | undefined;
  if (ref) {
    try {
      artifactBytesHash = createHash('sha256').update(await readVaultBytes(ref)).digest('hex');
    } catch { artifactBytesHash = 'UNREADABLE'; }
  }

  const custody = await verifyCustody(manuscriptId, memberId);
  return {
    historical: {
      rows: arr.rows.length,
      digest: sha(JSON.stringify(arr.rows)),
      artifactBytesHash,
      custody: `${custody.custodied}:${custody.reason}`,
    },
    representation: { rows: sec.rows.length, digest: sha(JSON.stringify(sec.rows)) },
  };
}

function tiersUnchanged(before: TierWitness, after: TierWitness) {
  const h = before.historical.digest === after.historical.digest
    && before.historical.artifactBytesHash === after.historical.artifactBytesHash
    && before.historical.rows === after.historical.rows;
  const r = before.representation.digest === after.representation.digest
    && before.representation.rows === after.representation.rows;
  return { historical: h, representation: r };
}

/* ═══════════════════════════ fixture construction ════════════════════════ */

const SOURCE_TEXT = [
  '# The House on Laurel Street',
  '',
  'The kitchen door never closed properly. My mother said it was the frame.',
  '',
  '# What I Remember Wrong',
  '',
  'I have told this story enough times that I no longer trust the telling.',
].join('\n');

interface Fixture { memberId: string; manuscriptId: string; draftId: string; arrivalId: string }

async function buildFixture(): Promise<Fixture> {
  const memberId = randomUUID();
  await query(
    `INSERT INTO members (id, passkey, username, password_hash, name, email, onboarded)
     VALUES ($1,$2,$3,$4,$5,$6,true)`,
    [memberId, `PT3-${memberId.slice(0, 8)}`, `pt3_${memberId.slice(0, 8)}`,
     'x'.repeat(64), 'PT-3 Fixture', `pt3+${memberId.slice(0, 8)}@fixture.invalid`],
  );

  const arrival = await recordArtifactArrival({
    memberId,
    bytes: Buffer.from(SOURCE_TEXT, 'utf-8'),
    originalFilename: 'laurel-street.md',
    mimeType: 'text/markdown',
    sourceText: SOURCE_TEXT,
    extractor: 'text',
  });

  const ms = await query<{ id: string }>(
    `INSERT INTO member_manuscripts (member_id, title, provenance)
     VALUES ($1,$2,'member_uploaded') RETURNING id`,
    [memberId, 'The House on Laurel Street'],
  );
  const manuscriptId = ms.rows[0].id;
  await claimArrival(arrival.id, manuscriptId, memberId);

  /* The Source Representation, cut exactly as the import route cuts it. */
  const cut = [
    { position: 0, heading: 'The House on Laurel Street', body: 'The kitchen door never closed properly. My mother said it was the frame.', depth: 1, signal: 'markdown' },
    { position: 1, heading: 'What I Remember Wrong', body: 'I have told this story enough times that I no longer trust the telling.', depth: 1, signal: 'markdown' },
  ];
  /* Draft section text carries its own separator: the shipped round-trip
     trigger flattens by bare concatenation, and a fixture that did not satisfy
     it would be testing a draft shape the product cannot hold. */
  const draftText = (i: number) =>
    `${cut[i].heading}\n\n${cut[i].body}${i < cut.length - 1 ? '\n\n' : ''}`;
  const sectionIds: string[] = [];
  for (const c of cut) {
    const r = await query<{ id: string }>(
      `INSERT INTO manuscript_sections
         (manuscript_id, position, heading, body, heading_depth, heading_signal)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [manuscriptId, c.position, c.heading, c.body, c.depth, c.signal],
    );
    sectionIds.push(r.rows[0].id);
  }

  /* The descendant working representation, created as the draft route creates
     it — content and section rows descending from the representation above. */
  const content = cut.map((_, i) => draftText(i)).join('');
  const draftId = await transaction(async (tx) => {
    const d = await tx.query<{ id: string }>(
      `INSERT INTO manuscript_working_drafts
         (manuscript_id, member_id, content, base_source_hash, revision_count,
          section_addressable_at, section_conversion_version)
       VALUES ($1,$2,$3,$4,1,now(),1) RETURNING id`,
      [manuscriptId, memberId, content, sha(content)],
    );
    const id = d.rows[0].id;
    for (const i of cut.keys()) {
      await tx.query(
        `INSERT INTO manuscript_draft_sections (draft_id, position, text, source_section_id)
         VALUES ($1,$2,$3,$4)`,
        [id, i, draftText(i), sectionIds[i]],
      );
    }
    return id;
  });

  return { memberId, manuscriptId, draftId, arrivalId: arrival.id };
}

async function destroyFixture(f: Fixture) {
  await query(`DELETE FROM manuscript_source_arrivals WHERE member_id = $1`, [f.memberId]);
  await query(`DELETE FROM member_manuscripts WHERE member_id = $1`, [f.memberId]);
  await query(`DELETE FROM members WHERE id = $1`, [f.memberId]);
}

/* ═════════════════ LEG 2 — behavioural witness (real paths) ══════════════ */

/**
 * A refusal is a real outcome and must be reported as one. An act that its own
 * preconditions declined exercised the guard, not the mutation — reading that
 * as evidence of custody would be the false green this instrument exists to
 * refuse, so the reason is carried into the report verbatim.
 */
function outcomeOf(r: unknown): string {
  if (typeof r !== 'object' || r === null) return 'completed';
  const o = r as { status?: unknown; refusal?: unknown };
  const status = o.status === undefined ? 'completed' : String(o.status);
  return o.refusal === undefined ? status : `${status}:${String(o.refusal)}`;
}

async function legBehavioural(f: Fixture) {
  const acts: Array<{ id: string; label: string; run: () => Promise<string> }> = [
    {
      id: 'B1', label: 'saveSection — revise a section of the working draft',
      run: async () => {
        const s = await query<{ id: string }>(
          `SELECT id FROM manuscript_draft_sections WHERE draft_id = $1 ORDER BY position LIMIT 1`,
          [f.draftId]);
        const v = await query<{ version: string }>(
          `SELECT version FROM manuscript_working_drafts WHERE id = $1`, [f.draftId]);
        const r = await saveSection(
          f.manuscriptId, f.memberId, s.rows[0].id,
          'The kitchen door never closed properly. It was never the frame.',
          Number(v.rows[0].version));
        return r.status;
      },
    },
    {
      id: 'B2', label: 'normalizeLegacyScaffoldForDraft — formatting correction on the draft',
      run: async () => {
        const r = await normalizeLegacyScaffoldForDraft(f.manuscriptId, f.memberId);
        return outcomeOf(r);
      },
    },
    {
      id: 'B3', label: 'convertDraftToSections — re-partition the working draft',
      run: async () => {
        const r = await convertDraftToSections(f.manuscriptId, f.memberId);
        return outcomeOf(r);
      },
    },
    {
      id: 'B6', label: 'authorStructureFromProposal — adopt a structure over the sections',
      run: async () => {
        /* Topology is taken from manuscript_draft_sections — the descendant.
           authorStructureFromProposal never hashes the Source Representation,
           which is itself a fact about where structural authority sits. */
        const secs = await query<{ id: string; position: number }>(
          `SELECT id, position FROM manuscript_draft_sections WHERE draft_id = $1 ORDER BY position`,
          [f.draftId]);
        const rows = secs.rows.map((r) => ({ id: r.id, position: Number(r.position) }));
        const reviewed = {
          units: [{
            id: randomUUID(), title: 'Part One', kind: 'part',
            fromSectionId: rows[0].id, toSectionId: rows[rows.length - 1].id, children: [],
          }],
        };
        const prop = await query<{ id: string }>(
          `INSERT INTO manuscript_structure_proposals
             (manuscript_id, evidence, interpretation, coverage, section_topology_hash,
              interpretation_input_hash, reviewed, review_revision, reviewed_at)
           VALUES ($1,'{}'::jsonb,'{}'::jsonb,'{}'::jsonb,$2,$3,$4::jsonb,1,now())
           RETURNING id`,
          [f.manuscriptId, sectionTopologyHash(rows as never), 'pt3-fixture', JSON.stringify(reviewed)]);
        const r = await authorStructureFromProposal(f.manuscriptId, f.memberId, prop.rows[0].id, 1);
        return outcomeOf(r);
      },
    },
  ];

  for (const act of acts) {
    const before = await witness(f.manuscriptId, f.memberId);
    let outcome = 'threw';
    try { outcome = await act.run(); } catch (e) { outcome = `threw:${(e as Error).message.slice(0, 90)}`; }
    const after = await witness(f.manuscriptId, f.memberId);
    const same = tiersUnchanged(before, after);

    check('2', `${act.id}h`, `${act.label} — HISTORICAL SOURCE preserved`,
      same.historical, `act=${outcome}`);
    check('2', `${act.id}r`, `${act.label} — SOURCE REPRESENTATION preserved`,
      same.representation, `act=${outcome}`);
  }

  /* The descendant MUST be free to change, or "nothing was mutated" would be
     satisfied by an application that does nothing at all. */
  const draft = await query<{ content: string; version: string }>(
    `SELECT content, version FROM manuscript_working_drafts WHERE id = $1`, [f.draftId]);
  const revs = await query<{ n: string }>(
    `SELECT count(*) AS n FROM working_draft_revisions WHERE draft_id = $1`, [f.draftId]);
  check('2', 'B4', 'the descendant working representation DID change (custody is not paralysis)',
    Number(revs.rows[0]?.n ?? 0) > 0 || Number(draft.rows[0]?.version ?? 1) > 1,
    `draft version=${draft.rows[0]?.version} revisions=${revs.rows[0]?.n}`);

  await legFirstPartition();
}

/**
 * The first partition of a not-yet-converted draft, on its OWN fixture.
 *
 * It has to de-convert a draft to reach the unconverted state, and doing that
 * to the shared fixture left the later smuggling probe refusing for the wrong
 * reason — `not_section_addressable` instead of the tier-scoping refusal it
 * exists to demonstrate. A probe that passes for an accidental reason is not
 * evidence, so this act is isolated rather than reordered.
 */
async function legFirstPartition() {
  const g = await buildFixture();
  try {
    const flat = await query<{ content: string }>(
      `SELECT string_agg(text, '' ORDER BY position) AS content
         FROM manuscript_draft_sections WHERE draft_id = $1`, [g.draftId]);
    await query(
      `UPDATE manuscript_working_drafts
          SET section_addressable_at = NULL, section_conversion_version = NULL, content = $2
        WHERE id = $1`,
      [g.draftId, flat.rows[0].content]);
    await query(`DELETE FROM manuscript_draft_sections WHERE draft_id = $1`, [g.draftId]);

    const before = await witness(g.manuscriptId, g.memberId);
    let outcome = 'threw';
    try { outcome = outcomeOf(await convertDraftToSections(g.manuscriptId, g.memberId)); }
    catch (e) { outcome = `threw:${(e as Error).message.slice(0, 90)}`; }
    const after = await witness(g.manuscriptId, g.memberId);
    const same = tiersUnchanged(before, after);

    check('2', 'B5h', 'convertDraftToSections — first partition of an unconverted draft — HISTORICAL SOURCE preserved',
      same.historical, `act=${outcome}`);
    check('2', 'B5r', 'convertDraftToSections — first partition of an unconverted draft — SOURCE REPRESENTATION preserved',
      same.representation, `act=${outcome}`);
    const sec = await query<{ n: string }>(
      `SELECT count(*) AS n FROM manuscript_draft_sections WHERE draft_id = $1`, [g.draftId]);
    check('2', 'B5x', 'that partition actually ran (the act was not a no-op)',
      Number(sec.rows[0].n) > 0, `draft sections after conversion=${sec.rows[0].n}`);
  } finally {
    await destroyFixture(g);
  }
}

/* ═══════ LEG 3 — adversarial: SOURCE REPRESENTATION (manuscript_sections) ═ */

async function legRepresentationAttacks(f: Fixture) {
  /* A3.1 — tier confusion. Can a Source id be smuggled into a draft mutation? */
  {
    const sec = await query<{ id: string }>(
      `SELECT id FROM manuscript_sections WHERE manuscript_id = $1 ORDER BY position LIMIT 1`,
      [f.manuscriptId]);
    const v = await query<{ version: string }>(
      `SELECT version FROM manuscript_working_drafts WHERE id = $1`, [f.draftId]);
    const before = await witness(f.manuscriptId, f.memberId);
    let status = 'threw';
    try {
      const r = await saveSection(f.manuscriptId, f.memberId, sec.rows[0].id,
        'SMUGGLED CONTENT — this must never reach the representation.',
        Number(v.rows[0].version));
      status = r.status === 'refused' ? `refused:${(r as { refusal?: string }).refusal}` : r.status;
    } catch (e) { status = `threw:${(e as Error).message.slice(0, 60)}`; }
    const after = await witness(f.manuscriptId, f.memberId);
    probe('3', 'A3.1', 'a Source id smuggled into saveSection is refused',
      status.startsWith('refused') && tiersUnchanged(before, after).representation,
      `saveSection→${status}`);
  }

  /* A3.2 — THE DIRECT ATTACK. Exactly the statement a future WRITE gesture,
     Restore, or LLM-proposed repair would issue, with the application's own
     credentials, through the application's own connection pool. */
  {
    const before = await witness(f.manuscriptId, f.memberId);
    let refused = false; let detail = '';
    try {
      const r = await query(
        `UPDATE manuscript_sections SET body = $2 WHERE manuscript_id = $1`,
        [f.manuscriptId, 'CONTENT-WORKING MUTATION OF THE SOURCE REPRESENTATION']);
      detail = `UPDATE affected ${r.rowCount} row(s)`;
    } catch (e) { refused = true; detail = `refused: ${(e as Error).message.slice(0, 110)}`; }
    const after = await witness(f.manuscriptId, f.memberId);
    const mutated = !tiersUnchanged(before, after).representation;
    probe('3', 'A3.2', 'direct UPDATE manuscript_sections is refused by the architecture',
      refused && !mutated, detail);

    if (mutated) {
      await query(`UPDATE manuscript_sections SET body = $2 WHERE manuscript_id = $1 AND position = 0`,
        [f.manuscriptId, 'The kitchen door never closed properly. My mother said it was the frame.']);
      await query(`UPDATE manuscript_sections SET body = $2 WHERE manuscript_id = $1 AND position = 1`,
        [f.manuscriptId, 'I have told this story enough times that I no longer trust the telling.']);
    }
  }

  /* A3.3 — deletion of the representation beneath a live Working Draft. */
  {
    let refused = false; let detail = '';
    const row = await query<{ id: string; heading: string; body: string; position: number;
      heading_depth: number | null; heading_signal: string | null }>(
      `SELECT id, heading, body, position, heading_depth, heading_signal
         FROM manuscript_sections WHERE manuscript_id = $1 ORDER BY position LIMIT 1`,
      [f.manuscriptId]);
    try {
      const r = await query(`DELETE FROM manuscript_sections WHERE id = $1`, [row.rows[0].id]);
      detail = `DELETE affected ${r.rowCount} row(s) — a Working Draft's origin can be removed from under it`;
    } catch (e) { refused = true; detail = `refused: ${(e as Error).message.slice(0, 110)}`; }
    probe('3', 'A3.3', 'deleting a Source Representation row beneath a live draft is refused',
      refused, detail);
    if (!refused) {
      const r0 = row.rows[0];
      await query(
        `INSERT INTO manuscript_sections (id, manuscript_id, position, heading, body, heading_depth, heading_signal)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [r0.id, f.manuscriptId, r0.position, r0.heading, r0.body, r0.heading_depth, r0.heading_signal]);
    }
  }
}

/* ════════ LEG 4 — adversarial: HISTORICAL SOURCE (arrivals + artifact) ════ */

async function legHistoricalAttacks(f: Fixture) {
  /* A4.1 — rewrite the arrival's source text AND its hash, so the row is
     internally consistent and a hash-only check would see nothing wrong. */
  {
    const before = await witness(f.manuscriptId, f.memberId);
    let refused = false; let detail = '';
    const forged = 'A HISTORY THAT WAS NEVER RECEIVED.';
    try {
      const r = await query(
        `UPDATE manuscript_source_arrivals
            SET source_text = $2, source_text_hash = $3 WHERE id = $1`,
        [f.arrivalId, forged, sha(forged)]);
      detail = `UPDATE affected ${r.rowCount} row(s) — the received artifact can be rewritten in place`;
    } catch (e) { refused = true; detail = `refused: ${(e as Error).message.slice(0, 110)}`; }
    const after = await witness(f.manuscriptId, f.memberId);
    const mutated = !tiersUnchanged(before, after).historical;
    probe('4', 'A4.1', 'direct UPDATE of the arrival source text is refused by the architecture',
      refused && !mutated, detail);
    if (mutated) {
      await query(
        `UPDATE manuscript_source_arrivals SET source_text = $2, source_text_hash = $3 WHERE id = $1`,
        [f.arrivalId, SOURCE_TEXT, sha(SOURCE_TEXT)]);
    }
  }

  /* A4.2 — re-claim collision: a second arrival must not overwrite the first.
     A returned Work cannot overwrite its own history by arriving again. */
  {
    const before = await witness(f.manuscriptId, f.memberId);
    const second = await recordSuppliedArrival({
      memberId: f.memberId, sourceText: 'A LATER, DIFFERENT TEXT.' });
    const claimed = await claimArrival(second.id, f.manuscriptId, f.memberId);
    const after = await witness(f.manuscriptId, f.memberId);
    const firstIntact = await query<{ source_text: string }>(
      `SELECT source_text FROM manuscript_source_arrivals WHERE id = $1`, [f.arrivalId]);
    check('4', 'A4.2', 'a second arrival never rewrites the first (it is added, not merged)',
      firstIntact.rows[0]?.source_text === SOURCE_TEXT,
      `second claim=${claimed}; arrivals ${before.historical.rows}→${after.historical.rows}`);
    await query(`DELETE FROM manuscript_source_arrivals WHERE id = $1`, [second.id]);
  }

  /* A4.3 — custody without bytes is not custody. The WS-01 negative control:
     destroy the artifact, leave every column intact, require FAIL. */
  {
    const ref = await query<{ artifact_ref: string }>(
      `SELECT artifact_ref FROM manuscript_source_arrivals WHERE id = $1`, [f.arrivalId]);
    const vaultPath = join(resolveVaultRoot(), ref.rows[0].artifact_ref);
    const bytes = readFileSync(vaultPath);
    const { unlink, writeFile } = await import('fs/promises');
    await unlink(vaultPath);
    const custody = await verifyCustody(f.manuscriptId, f.memberId);
    check('4', 'A4.3', 'custody FAILS when the bytes are gone but the hash remains',
      custody.custodied === false, `verifyCustody→${custody.custodied}:${custody.reason}`);
    await writeFile(vaultPath, bytes);
    const restored = await verifyCustody(f.manuscriptId, f.memberId);
    check('4', 'A4.4', 'custody is recoverable once the bytes return',
      restored.custodied === true, `verifyCustody→${restored.custodied}:${restored.reason}`);
  }

  /* A4.5 — erasure is NOT editing. PT-3's amendment: the member's lifecycle
     authority over their own Source must survive. Custody against working
     acts must never become immutability that traps the owner. */
  {
    const f2 = await buildFixture();
    let erased = false; let detail = '';
    try {
      await eraseManuscript(f2.manuscriptId, f2.memberId);
      const rows = await query<{ n: string }>(
        `SELECT count(*) AS n FROM manuscript_source_arrivals WHERE manuscript_id = $1`,
        [f2.manuscriptId]);
      const ms = await query<{ n: string }>(
        `SELECT count(*) AS n FROM member_manuscripts WHERE id = $1`, [f2.manuscriptId]);
      erased = Number(rows.rows[0].n) === 0 && Number(ms.rows[0].n) === 0;
      detail = `arrivals=${rows.rows[0].n} manuscripts=${ms.rows[0].n}`;
    } catch (e) { detail = `threw:${(e as Error).message.slice(0, 100)}`; }
    check('4', 'A4.5', 'member-directed erasure removes the Source — gone, not altered',
      erased, detail);
    await destroyFixture(f2);
  }
}

/* ═════════════════════════════════ report ═══════════════════════════════ */

function report(): number {
  const pad = (s: string, n: number) => s.length >= n ? s : s + ' '.repeat(n - s.length);
  let leg = '';
  for (const l of lines) {
    if (l.leg !== leg) { leg = l.leg; console.log(`\n── LEG ${leg} ${'─'.repeat(58)}`); }
    console.log(`${pad(l.verdict, 5)} ${pad(l.id, 9)} ${l.label}${l.detail ? `\n                 ${l.detail}` : ''}`);
  }
  const fails = lines.filter((l) => l.verdict === 'FAIL');
  const reds = lines.filter((l) => l.verdict === 'RED');
  console.log(`\n${'═'.repeat(72)}`);
  console.log(`passed ${lines.filter((l) => l.verdict === 'PASS').length} · failed ${fails.length} · structurally-unenforced ${reds.length}`);

  if (reds.length) {
    console.log('\nPT-3 BEHAVIORALLY OBSERVED / STRUCTURALLY UNENFORCED at:');
    for (const r of reds) console.log(`  · ${r.id}  ${r.label}`);
    console.log('\nThis is a valid falsifier result and the red must be returned intact.');
    console.log('Remediation (triggers, roles, grants, constraints, a Source seam) is NOT');
    console.log('authorized. Do not make this instrument green by weakening the claim.');
  }
  /* Exit code answers BEHAVIORAL COMPLIANCE only. Structural findings are
     reported in their own vocabulary and deliberately do not mask it. */
  return fails.length === 0 ? 0 : 1;
}

async function main() {
  assertDisposableTarget();
  const repoRoot = process.cwd();
  runCensus(repoRoot);

  const f = await buildFixture();
  try {
    await legBehavioural(f);
    await legRepresentationAttacks(f);
    await legHistoricalAttacks(f);
  } finally {
    await destroyFixture(f);
  }
  const code = report();
  await closePool();
  process.exit(code);
}

main().catch(async (e) => {
  console.error(e instanceof Error ? e.message : e);
  await closePool().catch(() => {});
  process.exit(2);
});
