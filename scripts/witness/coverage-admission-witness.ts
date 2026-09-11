/**
 * COVERAGE-DERIVED ADMISSION · THE LIVE-MODEL WITNESS.
 *
 * Founder ruling 2026-09-11: the host law is CLOSED; the MODEL/HOST
 * COMPOSITION is UNWITNESSED, and this is the only legitimate step before
 * deploy. Design record:
 * `docs/programme/READING_COVERAGE_DERIVED_ADMISSION_DESIGN_2026-09-11.md`.
 *
 *   ⭐⭐ Do not state an epistemic limitation whose prerequisite condition is
 *      known not to exist.
 *
 * THREE WITNESSES, as ruled — and the third is not optional, because the
 * first two together could both be satisfied by a repair that had turned full
 * coverage into blanket refusal:
 *
 *   A  FULL COVERAGE, tag emitted, claim's unreadSpan empty
 *        → EXPECTED: the whole reading refused. Not silently repaired.
 *   B  PARTIAL COVERAGE, tag emitted, claim's unreadSpan NON-empty
 *        → EXPECTED: the reading admitted AND the limitation RETAINED.
 *          ⭐ The second half is the half that matters. Without it we have
 *            shown only that the new law can reject.
 *   C  FULL COVERAGE, an unaffected non-conclusion
 *        → EXPECTED: admitted unchanged. Proves the repair did not turn full
 *          coverage into blanket permission or blanket refusal.
 *
 * ⛔ THE PROMPT IS NOT TOUCHED AND NOTHING IS ASKED OF THE MODEL. Steering a
 * reading toward emitting `across-unread-span` would manufacture the very
 * observation the witness exists to find, and the result would be a fixture
 * wearing a live model's clothes. This script only chooses COVERAGE — a system
 * fact — and reads what comes back.
 *
 * ⭐ THEREFORE WITNESS A IS OPPORTUNISTIC AND MAY NOT BE OBTAINABLE IN A GIVEN
 * RUN. If no full-coverage reading emits the tag, A is `NOT EXERCISED` — a
 * first-class result, never a pass and never a skip. The founder's own `o8`
 * shows the emission does occur; it does not follow that it occurs on demand.
 *
 * ⛔ NO MEMBER PROSE IS PRINTED. Section counts, code-point totals, claim
 * counts, tag names, span lengths, refusal names. Never a sentence of the Work
 * and never a claim's text.
 *
 * ⛔ READ-ONLY. `captureEvidence` runs one REPEATABLE READ transaction with
 * ownership in its predicate; `loadRevisionContent` is a single SELECT. This
 * script creates nothing, renames nothing, and deletes nothing. It is safe to
 * point at a database someone is using — deliberately unlike the walk-12 fault
 * injection, which was written for a disposable cluster and wedged a live dev
 * database on 2026-09-10.
 *
 *   DATABASE_URL=postgres://...            required
 *   WITNESS_MANUSCRIPT_ID=<uuid>           required
 *   WITNESS_MEMBER_ID=<uuid>               required
 *   ANTHROPIC_API_KEY=...                  through the NORMAL environment
 *                                          mechanism. ⛔ no mock, no provider
 *                                          bypass, no reuse of an agent or
 *                                          session credential.
 *   MAIA_INFERENCE_MODE                    unset or `primary`. `local_only`
 *                                          refuses — there is no local
 *                                          structured provider.
 *   WITNESS_RUNS=3                         readings per coverage condition
 *   WITNESS_LENSES=development,arc          comma-separated, cycled
 *
 *   DATABASE_URL=... WITNESS_MANUSCRIPT_ID=... WITNESS_MEMBER_ID=... \
 *     npx tsx scripts/witness/coverage-admission-witness.ts
 */

import { captureEvidence, loadRevisionContent } from '@/lib/manuscript/development/capture';
import { bindEvidence, unreadSpan } from '@/lib/manuscript/development/bind';
import { recoverEvidence } from '@/lib/manuscript/development/resolve';
import type { DevelopmentalEvidence } from '@/lib/manuscript/development/readState';
import {
  DEVELOPMENTAL_LENSES, DEVELOPMENTAL_READ_CEILING_CODE_POINTS,
  type DevelopmentalLens, type DevelopmentalReaderRequest, type RecoveredBody,
} from '@/lib/manuscript/developmentalReader/contract';
import { readDevelopmentally } from '@/lib/manuscript/developmentalReader/read';

const TAG = 'across-unread-span';

type Verdict = 'FIRED' | 'ADMITTED_AND_RETAINED' | 'ADMITTED' | 'NOT EXERCISED' | 'VIOLATED';

const env = (k: string) => process.env[k]?.trim() || '';
const lines: string[] = [];
const say = (s = '') => { lines.push(s); console.log(s); };

function stop(why: string, remedy?: string): never {
  console.error(`\n⛔ WITNESS NOT RUN — ${why}`);
  if (remedy) console.error(`   ${remedy}`);
  console.error('\n   NOT RUN is a first-class result. It is not a pass and it is not a skip.\n');
  process.exit(2);
}

/* ── preflight ───────────────────────────────────────────────────────────── */

function preflight() {
  if (!env('DATABASE_URL')) stop('DATABASE_URL is not set',
    'This witness reads a real Work. It does not shell out to psql and does not read PG* — ' +
    'the 2026-09-10 walk defect. Set DATABASE_URL itself.');
  if (!env('WITNESS_MANUSCRIPT_ID') || !env('WITNESS_MEMBER_ID'))
    stop('WITNESS_MANUSCRIPT_ID and WITNESS_MEMBER_ID are both required',
      'Ownership is in the capture predicate: a manuscript belonging to another member is ' +
      'indistinguishable from one that does not exist.');

  const key = env('ANTHROPIC_API_KEY');
  if (!key) stop('ANTHROPIC_API_KEY is not set',
    'The witness exists to observe the app\'s own provider path. ⛔ No mock, no provider bypass, ' +
    'and do not repurpose an agent or session credential.');
  /* The 2026-09-10 defect, made structural rather than remembered: two
     appended key lines glued by `grep | cut` into one 217-char value
     containing a newline. curl refused it (error 43); the SDK failed
     identically; both surfaced as `unreachable` with no cause. */
  if (/\s/.test(key)) stop(
    `ANTHROPIC_API_KEY contains whitespace (length ${key.length})`,
    'Almost certainly two keys concatenated — .env.local acquired a second line and `grep|cut` ' +
    'joined them. Dedupe to ONE line, RESTART the server or shell so the file is re-read, and ' +
    'use `head -1` when exporting.');

  const mode = env('MAIA_INFERENCE_MODE');
  if (mode && mode !== 'primary') stop(`MAIA_INFERENCE_MODE=${mode} refuses structured inference`,
    'Unset it or set it to `primary`. There is no local structured provider, so `local_only` ' +
    'cannot produce a cognition witness.');
}

/* ── evidence ────────────────────────────────────────────────────────────── */

async function evidenceFor(bodyScope: readonly string[] | undefined) {
  const r = await captureEvidence(env('WITNESS_MANUSCRIPT_ID'), env('WITNESS_MEMBER_ID'),
    { bodyScope: bodyScope ?? [], withStructure: false });
  if (!r.ok) stop(`captureEvidence refused: ${r.refusal} — ${r.detail}`);
  return r.value;
}

async function requestFor(evidence: DevelopmentalEvidence, lens: DevelopmentalLens) {
  const content = await loadRevisionContent(evidence.readState.draftId, evidence.readState.revisionNumber);
  if (content === null) stop('the frozen revision has no content row');
  const recovered: RecoveredBody[] = [];
  for (const [sectionId, depth] of Object.entries(evidence.coverage.sections)) {
    if (depth !== 'body') continue;
    const rec = recoverEvidence({ kind: 'section', sectionId }, evidence.readState, content);
    if (!rec.ok || rec.value.kind !== 'text') stop(`recoverEvidence failed for a body section: ${JSON.stringify(rec)}`);
    recovered.push(rec.value);
  }
  const req: DevelopmentalReaderRequest = { commissionedLens: lens, evidence, recovered };
  const codePoints = recovered.reduce((n, r) => n + [...r.text].length, 0);
  if (codePoints > DEVELOPMENTAL_READ_CEILING_CODE_POINTS)
    stop(`the body scope is ${codePoints} code points, over the ${DEVELOPMENTAL_READ_CEILING_CODE_POINTS} ceiling`,
      'Narrow the Work or the scope. ⛔ Do not raise the ceiling to make a witness run.');
  return { req, codePoints };
}

/* ── one reading ─────────────────────────────────────────────────────────── */

interface Reading {
  condition: 'FULL' | 'PARTIAL';
  lens: DevelopmentalLens;
  outcome: string;
  refusal?: string;
  /** Claims that carried the tag, with their own derived span length. */
  tagged: { index: number; spanLen: number; retained: boolean }[];
  /** Non-conclusions admitted on this reading, other than the tag. */
  otherTags: string[];
  claimCount: number;
}

async function readOnce(condition: 'FULL' | 'PARTIAL', evidence: DevelopmentalEvidence, lens: DevelopmentalLens): Promise<Reading> {
  const { req } = await requestFor(evidence, lens);
  const result = await readDevelopmentally(req);
  const r: Reading = { condition, lens, outcome: result.outcome, tagged: [], otherTags: [], claimCount: 0 };

  if (result.outcome === 'refused') {
    r.refusal = result.refusal;
    /* A refusal carries no claims, so the span that caused it cannot be
       re-derived here. The refusal DETAIL names the claim index, and that is
       the evidence — the host already proved the span was empty. */
    return r;
  }
  if (result.outcome !== 'claims') return r;

  r.claimCount = result.claims.length;
  for (const [i, c] of result.claims.entries()) {
    for (const t of c.doesNotEstablish) if (t !== TAG && !r.otherTags.includes(t)) r.otherTags.push(t);
    if (!c.doesNotEstablish.includes(TAG)) continue;
    /* Re-bind independently of the host so the witness measures the span
       itself rather than trusting the code under test to report it. */
    const b = bindEvidence(c.refs, evidence);
    if (!b.ok) stop(`an admitted claim did not re-bind: ${b.refusal}`);
    r.tagged.push({ index: i, spanLen: unreadSpan(b.value, evidence).length, retained: true });
  }
  return r;
}

/* ── main ────────────────────────────────────────────────────────────────── */

async function main() {
  preflight();

  const runs = Number(env('WITNESS_RUNS') || '3');
  const lensNames = (env('WITNESS_LENSES') || 'development,arc').split(',').map((s) => s.trim()).filter(Boolean);
  for (const l of lensNames) if (!(DEVELOPMENTAL_LENSES as readonly string[]).includes(l)) stop(`unknown lens: ${l}`);
  const lenses = lensNames as DevelopmentalLens[];

  say('\nCOVERAGE-DERIVED ADMISSION · LIVE-MODEL WITNESS');
  say('───────────────────────────────────────────────────────────────────────');

  /* Topology first, from a position-only capture — it reads no bodies. */
  const shape = await evidenceFor([]);
  const topology = shape.readState.sectionTopology;
  if (topology.length < 4) stop(`the Work has ${topology.length} sections`,
    'A partial condition needs enough sections for a claim to span unread material. Use a real Work.');

  const half = Math.ceil(topology.length / 2);
  const full = await evidenceFor(topology);
  const partial = await evidenceFor(topology.slice(0, half));

  const bodyOf = (e: DevelopmentalEvidence) => Object.values(e.coverage.sections).filter((d) => d === 'body').length;
  say(`  draft           ${shape.readState.draftId}  rev ${shape.readState.revisionNumber}`);
  say(`  sections        ${topology.length}`);
  say(`  FULL scope      ${bodyOf(full)} / ${topology.length} at body depth`);
  say(`  PARTIAL scope   ${bodyOf(partial)} / ${topology.length} at body depth`);
  say(`  lenses          ${lenses.join(', ')}    runs per condition  ${runs}`);
  if (bodyOf(full) !== topology.length) stop('the FULL condition did not reach every section at body depth');
  say('');

  const readings: Reading[] = [];
  for (const [condition, evidence] of [['FULL', full], ['PARTIAL', partial]] as const) {
    for (let i = 0; i < runs; i += 1) {
      const lens = lenses[i % lenses.length];
      const r = await readOnce(condition, evidence, lens);
      readings.push(r);
      const tags = r.tagged.length
        ? r.tagged.map((t) => `claim ${t.index} span=${t.spanLen}`).join(' · ')
        : '—';
      say(`  ${condition.padEnd(8)} ${lens.padEnd(12)} ${String(r.outcome).padEnd(9)}`
        + `${(r.refusal ?? '').padEnd(30)} claims=${String(r.claimCount).padEnd(3)} tagged: ${tags}`);
    }
  }

  /* ── A ─────────────────────────────────────────────────────────────────── */
  const fullReadings = readings.filter((r) => r.condition === 'FULL');
  const aFired = fullReadings.filter((r) => r.refusal === 'non_conclusion_inapplicable');
  const aViolated = fullReadings.filter((r) => r.tagged.some((t) => t.spanLen === 0));
  const aVerdict: Verdict = aViolated.length ? 'VIOLATED' : aFired.length ? 'FIRED' : 'NOT EXERCISED';

  /* ── B ─────────────────────────────────────────────────────────────────── */
  const partialReadings = readings.filter((r) => r.condition === 'PARTIAL');
  const bLawful = partialReadings.flatMap((r) => r.tagged.filter((t) => t.spanLen > 0));
  const bWronglyRefused = partialReadings.filter((r) => r.refusal === 'non_conclusion_inapplicable');
  const bVerdict: Verdict = bWronglyRefused.length ? 'VIOLATED'
    : bLawful.length ? 'ADMITTED_AND_RETAINED' : 'NOT EXERCISED';

  /* ── C ─────────────────────────────────────────────────────────────────── */
  const cTags = [...new Set(fullReadings.flatMap((r) => r.outcome === 'claims' ? r.otherTags : []))];
  const cVerdict: Verdict = cTags.length ? 'ADMITTED' : 'NOT EXERCISED';

  say('\n───────────────────────────────────────────────────────────────────────');
  say(`  A · full coverage, empty span, tag emitted        ${aVerdict}`);
  say(`      refusals observed ${aFired.length} / ${fullReadings.length} full-coverage readings`);
  if (aVerdict === 'NOT EXERCISED') say(
    '      ⛔ No full-coverage reading emitted the tag. The law was NOT EXERCISED in live\n'
    + '         composition. This is neither a pass nor a failure; the emission is the model\'s\n'
    + '         and cannot be requested without manufacturing the observation.');
  if (aVerdict === 'VIOLATED') say('      🔴 A claim with an EMPTY span was ADMITTED carrying the tag. The host law did not fire.');

  say(`  B · partial coverage, real span, tag emitted      ${bVerdict}`);
  say(`      lawful tagged claims admitted and retained ${bLawful.length}`);
  if (bVerdict === 'VIOLATED') say('      🔴 A reading whose claim spans unread material was REFUSED. The law over-fired.');
  if (bVerdict === 'NOT EXERCISED') say(
    '      ⛔ No partial-coverage reading emitted the tag on a spanning claim. Rejection alone\n'
    + '         is not the law; without B the repair is shown only to be able to refuse.');

  say(`  C · unaffected non-conclusions at full coverage   ${cVerdict}`);
  say(`      admitted unchanged: ${cTags.length ? cTags.join(', ') : '—'}`);

  const all: Verdict[] = [aVerdict, bVerdict, cVerdict];
  const violated = all.includes('VIOLATED');
  const unexercised = all.includes('NOT EXERCISED');
  say('');
  say(violated
    ? '  MODEL/HOST COMPOSITION   🔴 VIOLATED — deploy stays held and the finding is the result.'
    : unexercised
      ? '  MODEL/HOST COMPOSITION   ⛔ NOT FULLY WITNESSED — a witness that did not exercise the law\n'
        + '                           has established nothing about it. Re-run, or record NOT WITNESSED.'
      : '  MODEL/HOST COMPOSITION   ⭐ WITNESSED on all three sides.');
  say('  DEPLOY                   HELD — this script authorizes nothing.\n');

  process.exit(violated ? 1 : unexercised ? 3 : 0);
}

main().catch((e) => { console.error('\n⛔ WITNESS ABORTED\n', e); process.exit(2); });
