/**
 * RC-GEN-01 · A-S · C-S · AC-1 · AC-2 — the analyser witnesses.
 *
 * ⛔ THE SUBJECT IS READ AT RUN TIME, NEVER HARD-CODED. An earlier draft printed a
 * literal SHA, and it went stale three commits later while still announcing itself
 * as the frozen subject — an instrument asserting a provenance it was not running.
 * ⛔ No prompt or schema change while this evidence
 * is being collected.
 *
 * ⛔ THIS HARNESS DOES NOT JUDGE SEMANTICS, AND MUST NOT LEARN TO. It reports what
 * is mechanical — provider reached · exactly one tool call · schema admitted ·
 * graphs printed · D's outcome where D applies — and prints the graphs raw for a
 * person to rule on. No scoring. No second model evaluating a graph. No `reason`
 * field returning under another name.
 *
 * ⛔ AND IT NEVER PRINTS THE OTHER PASSAGE OR AN EXPECTED VERDICT BESIDE AN
 * ANALYSER INVOCATION. A sees the source; C sees a candidate; putting them on the
 * same screen at the moment of analysis would make the separation cosmetic for the
 * human reading it.
 *
 *   npx tsx scripts/witness/rc-gen-01/analyzers.ts [--require-cognition]
 */

import {
  analyzeSource, analyzeCandidate, ANALYZER_VERSION,
  type AnalysisResult,
} from '../../../lib/manuscript/revision/analyze';
import { compareConservation, type SemanticGraph } from '../../../lib/manuscript/revision/semanticGraph';

const REQUIRE = process.argv.includes('--require-cognition');
const MODEL = process.env.MAIA_ASK_MODEL || 'claude-opus-5';

/* ── passages ─────────────────────────────────────────────────────────────── */

const SOURCE =
  'The experience facilitated a significant transformation in his relational ' +
  'orientation toward the natural world, and the resulting shift in perspective ' +
  'constituted a meaningful development in his ongoing process of integration.';

/**
 * C-good / AC-1. A faithful paraphrase with materially different vocabulary,
 * sentence structure and ORDER OF EXPRESSION. Authored as a fixture, not produced
 * by any run — and deliberately not using the source's own words for the two
 * degree properties (`important`, not `significant`).
 */
const C_GOOD =
  'Within an integration that was still underway, a meaningful development took ' +
  'form: a shift in how he saw things, which had followed from an important ' +
  'change — brought about by the experience — in the way he stood toward the ' +
  'natural world.';

/** C-large. The exact run-8 / run-9 candidate. */
const C_LARGE =
  'The experience brought about a large change in how he related to the natural ' +
  'world. The shift in how he saw things that came out of that change was a ' +
  'meaningful development in the process of integration he was already engaged in.';

/** C-migration. The exact run-9 candidate — significance moved to the later node. */
const C_MIGRATION =
  'The experience brought about a large change in how he related to the natural ' +
  'world, and the change in how he saw things that came out of it was a ' +
  'significant step in the process of integration he was already engaged in.';

/* ── mechanical reporting only ────────────────────────────────────────────── */

let failed = 0;
const check = (ok: boolean, label: string) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failed++;
};

function header(role: 'A' | 'C', what: string): void {
  console.log(`\n${'─'.repeat(66)}`);
  console.log(`ROLE             ${role}`);
  console.log(`ANALYZER_VERSION ${ANALYZER_VERSION}`);
  console.log(`MODEL            ${MODEL}`);
  console.log(`INPUT            ${what}`);
  console.log('─'.repeat(66));
}

function report(r: AnalysisResult, label: string): SemanticGraph | null {
  check(r.ok, `${label}: provider reached, one tool call, schema admitted`);
  if (!r.ok) {
    console.log(`      refusal: ${r.refusal}${r.detail ? ` — ${r.detail}` : ''}`);
    return null;
  }
  console.log('\n  GRAPH (verbatim):');
  console.log(JSON.stringify(r.graph, null, 2).split('\n').map((l) => '    ' + l).join('\n'));
  return r.graph;
}

/** D is deterministic, so its outcome is mechanical and may be printed. */
function printD(a: SemanticGraph | null, b: SemanticGraph | null, label: string): void {
  if (!a || !b) { check(false, `${label}: both graphs needed`); return; }
  const v = compareConservation(a, b);
  console.log(`\n  D(${label}) = ${JSON.stringify(v, null, 2).split('\n').join('\n  ')}`);
}

const A_S_RUBRIC = `
  A-S — RUBRIC (human ruling required)
  Does the source graph record what the source COMMITS TO, and leave unspecified
  what the source leaves unspecified?
    relational change        distinct node
    perspective shift        distinct node
    resultative edge         present
    development/integration  represented without collapse
    ongoing temporality      represented
    significance             on the correct node
    meaningfulness           on the correct node
    magnitude · valence · direction         UNSPECIFIED
  ⭐⭐ analyzer/3 · SV-4 — THE PARTICIPATION READING IS THE FIRST CLEAN PROOF
     THAT THE ONTOLOGY REPAIR REMOVED A1 RATHER THAN RENAMING IT.
     The source does NOT say the person actively participates in or undergoes
     the integration or the transformation. So the correct graph carries
     NO PARTICIPATION EDGE AT ALL.
  ⛔ A participation edge appearing merely to replace the old agency field is
     A1 in a new syntax, and A-S FAILS. Absence is the answer, not silence.
  ⛔ If A invents high / positive, or asserts participation the source does not,
     A-S FAILS IMMEDIATELY and nothing downstream is consulted.`;

const C_S_RUBRIC = `
  C-S — RUBRIC (human ruling required)
  Does each candidate graph DESCRIBE what its passage asserts?
  ⛔ C must not call anything wrong. It has no source and no expectation.
     It should simply record e.g. magnitude, temporality, where a property sits,
     and who takes part in what.`;

const AC_1_RUBRIC = `
  AC-1 — RUBRIC (human ruling required)
  ⛔ D's admission is NOT sufficient. First inspect A and C independently and
     establish that neither graph reached compatibility BY OMITTING something.
     Equivalent meaning must decompose into compatible structure independently.
  If A chose N nodes and C chose N +/- 1, or the same semantic unit is a process
  in one and a state in the other, record ANALYZER / ONTOLOGY INSTABILITY and stop
  before B.`;

const AC_2_RUBRIC = `
  AC-2 — RUBRIC (human ruling required)
  Byte-identical JSON, local ids and node order are NOT required.
  Structural equivalence IS: D(A1,A2) and D(C1,C2) must ADMIT.
  ⛔ correspondence_ambiguous does NOT count as stability — if the same passage
     twice yields graphs whose identity cannot be structurally resolved, a stable
     representation has not been demonstrated.`;

async function main(): Promise<void> {
  /* ⛔ Provenance is READ, not asserted. A dirty tree is reported as dirty: the
     evidence then attaches to no commit, and that is a fact the ruling needs. */
  const git = (args: string) => {
    try {
      return require('child_process').execSync(`git ${args}`, { encoding: 'utf8' }).trim();
    } catch { return '(unavailable)'; }
  };
  const head = git('rev-parse --short HEAD');
  const dirty = git('status --porcelain');
  console.log(`\nA-S / C-S / AC-1 / AC-2`);
  console.log(`SUBJECT          ${head}${dirty === '' ? '' : '  ⚠️ WORKING TREE NOT CLEAN'}`);
  console.log(`ANALYZER_VERSION ${ANALYZER_VERSION}`);
  console.log(`MODEL            ${MODEL}`);
  if (dirty !== '' && dirty !== '(unavailable)') {
    console.log('\n⚠️ The tree differs from any commit, so this evidence attaches to no SHA.');
    console.log(dirty.split('\n').map((l) => `     ${l}`).join('\n'));
  }
  console.log('');

  const mode = process.env.MAIA_INFERENCE_MODE;
  if (!process.env.ANTHROPIC_API_KEY || mode === 'local_only' || mode === 'sovereign') {
    console.log('\n⛔ A-S / C-S / AC-1 / AC-2: NOT WITNESSED');
    console.log(`   credential present: ${Boolean(process.env.ANTHROPIC_API_KEY)}`);
    console.log(`   MAIA_INFERENCE_MODE: ${mode === undefined ? '(unset)' : `'${mode}'`}`);
    console.log('   Not a skip, not a pass.');
    process.exit(REQUIRE ? 1 : 0);
  }


  /* ── A-S ── */
  header('A', 'the source passage');
  const gsA1 = report(await analyzeSource(SOURCE), 'A-S');
  console.log(A_S_RUBRIC);

  /* ── C-S ── */
  header('C', 'C-good');
  const gcGood1 = report(await analyzeCandidate(C_GOOD), 'C-S · C-good');
  header('C', 'C-large');
  report(await analyzeCandidate(C_LARGE), 'C-S · C-large');
  header('C', 'C-migration');
  report(await analyzeCandidate(C_MIGRATION), 'C-S · C-migration');
  console.log(C_S_RUBRIC);

  /* ── AC-1 ── */
  console.log(`\n${'═'.repeat(66)}\nAC-1 · equivalent-paraphrase decomposition compatibility`);
  printD(gsA1, gcGood1, 'A(source) vs C(C-good)');
  console.log(AC_1_RUBRIC);

  /* ── AC-2 ── */
  console.log(`\n${'═'.repeat(66)}\nAC-2 · repeated-input structural stability`);
  header('A', 'the source passage (second run)');
  const gsA2 = report(await analyzeSource(SOURCE), 'AC-2 · A second run');
  header('C', 'C-good (second run)');
  const gcGood2 = report(await analyzeCandidate(C_GOOD), 'AC-2 · C second run');
  printD(gsA1, gsA2, 'A1 vs A2');
  printD(gcGood1, gcGood2, 'C1 vs C2');
  console.log(AC_2_RUBRIC);

  console.log(`\n${'═'.repeat(66)}`);
  console.log(`MECHANICAL: ${failed} failed`);
  console.log('SEMANTIC:   ⛔ NOT SELF-JUDGED — rule on the rubrics above.');
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error('analyser harness error:', e instanceof Error ? e.message : String(e));
  process.exit(1);
});
