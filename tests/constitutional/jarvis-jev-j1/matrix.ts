/**
 * JARVIS-ROUTING-INTELLIGENCE-01 / J2-R1 / J1R4-F1 — execution matrix.
 *
 * Evidence only if ALL hold (act §V):
 *   REFERENCE              conforming model passes every falsifier
 *   LETHALITY              every candidate dies on its NAMED target
 *   DISCRIMINATION         every collateral kill is classified with a concrete reason
 *   STALE-COLLATERAL       a declared collateral that stops firing FAILS the matrix
 *   SURVIVOR LAW           any survivor -> NOT EVIDENCE; repair the SUITE
 */
import { execFileSync } from 'node:child_process';
import { REFERENCE, type ContractModel } from './contract-model';
import { FALSIFIERS, FALSIFIER_IDS, type Falsifier } from './falsifiers';
import { CANDIDATES, CANDIDATE_IDS } from './candidates';

const out = (s: string) => process.stdout.write(`${s}\n`);

// ───────────────────────────── §VII contract & substrate pins ─────────────────────────────

const PINS = {
  j1r4: {
    what: 'J1R4 contract blob',
    expect: '98eb6cf16223b83b4768e46e1ae253e7881ae5f5',
    rev: 'HEAD:docs/programme/JARVIS-JEV-01_J1R4_JUDGMENT_CONTRACT_2026-09-22.md',
  },
  j0: {
    what: 'J0 blob (canonical)',
    expect: '494cd61973ed02c4453067716657631f3f9143e9',
    rev: 'origin/clean-main-no-secrets:docs/programme/JARVIS-JEV-01_J0_CONSTITUTION_AND_J1_JUDGMENT_CONTRACT_2026-09-22.md',
  },
  j5: {
    what: 'TaskShape source blob (canonical)',
    expect: 'e840d705c9c1059667379d321cc7b5c802045754',
    rev: 'origin/clean-main-no-secrets:scripts/builder/routing-intelligence-j5-v1.mjs',
  },
} as const;

const gitBlob = (rev: string): string =>
  execFileSync('git', ['rev-parse', rev], { encoding: 'utf8' }).trim();

const verifyPins = (): void => {
  out('── §VII PINS ──');
  for (const p of Object.values(PINS)) {
    let actual: string;
    try {
      actual = gitBlob(p.rev);
    } catch {
      out(`STALE / NO EVIDENCE — could not resolve ${p.what} (${p.rev})`);
      process.exit(2);
    }
    if (actual !== p.expect) {
      out(`STALE / NO EVIDENCE — ${p.what}: ${actual} != ${p.expect}`);
      out('This is a pin mismatch, NOT a failed constitutional test.');
      process.exit(2);
    }
    out(`  ok  ${p.what} = ${actual}`);
  }
};

// ───────────────────────────── declared collateral (§V DISCRIMINATION) ─────────────────────────────
//
// candidate -> falsifier -> concrete reason the collateral is IRREDUCIBLE.
// A declared entry that stops firing FAILS the matrix (stale-collateral check).

const DECLARED_COLLATERAL: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  'DC-ABSTAIN-REJECTED': {
    'DC-MODEL-REASON-WINS':
      'Rejecting a LAWFUL ProviderAbstain means a well-formed REFUSED is never admitted as itself, which is exactly what MODEL-REASON-WINS checks in its non-malformed leg.',
    'DC-UNION-COLLAPSE':
      'UNION-COLLAPSE requires lawful model reasons to be admitted unchanged; refusing all abstentions necessarily breaks that. Irreducible — the error IS refusing lawful abstentions.',
  },
  'DC-ADDS-AUTHORIZED-ACT': {
    'DC-LLM-TRUE-GRANTS':
      'The candidate adds an act on Q_LLM_NEEDED=true; granting eligibility on that answer IS what the LLM law forbids. Narrowing would require adding an act without granting anything.',
  },
  'DC-AGREEMENT-AS-AUTHORITY': {
    'DC-REPLAY-ACCUMULATES':
      'The candidate\'s condition is a COUNT of agreeing judgments, so one judgment and three judgments necessarily differ — which is precisely what the accumulation law measures.',
  },
  'DC-AGREEMENT-IS-STANDING': {
    'DC-REPLAY-ACCUMULATES':
      'Same: agreement is inherently count-conditioned, so N repeats differ from one.',
  },
  'DC-BUCKET-OVERFLOW': {
    'DC-CLAMP-ON-OVERFLOW':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
    'DC-DEFAULT-SUBSTITUTION':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
    'DC-HASH-OVERFLOW':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
    'DC-LOCAL-OVERFLOW-ENUM':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
    'DC-SPLIT-TO-FIT':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
    'DC-STRINGIFY-OVERFLOW':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
  },
  'DC-CLAMP-ON-OVERFLOW': {
    'DC-BUCKET-OVERFLOW':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
    'DC-DEFAULT-SUBSTITUTION':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
    'DC-HASH-OVERFLOW':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
    'DC-LOCAL-OVERFLOW-ENUM':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
    'DC-SPLIT-TO-FIT':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
    'DC-STRINGIFY-OVERFLOW':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
  },
  'DC-CORRELATION-HANDLE': {
    'DC-EXTRA-MEMBER':
      'A correlation handle IS an extra member. Narrowing would require adding no field, i.e. not embodying the error. Founder-ruled as legitimate for this candidate.',
    'DC-VARYING-INSTRUCTION':
      '⭐ A work-unit identifier VARIES with the work unit by definition, so the varying-content law fires. This collateral is informative: a correlation handle is a special case of work-unit-varying content.',
  },
  'DC-DEFAULT-SUBSTITUTION': {
    'DC-BUCKET-OVERFLOW':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
    'DC-CLAMP-ON-OVERFLOW':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
    'DC-HASH-OVERFLOW':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
    'DC-LOCAL-OVERFLOW-ENUM':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
    'DC-SPLIT-TO-FIT':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
    'DC-STRINGIFY-OVERFLOW':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
  },
  'DC-EXTRA-MEMBER': {
    'DC-CORRELATION-HANDLE':
      'The correlation law rejects ANY non-member key, not only identifiers, so a plain extra member trips it.',
  },
  'DC-FORGERY-AS-UNKNOWN-SHAPE': {
    'DC-FORGERY-DISCARDED':
      'Same single decision: the required OUT_OF_RANGE record is not produced.',
    'DC-HOST-REASON-PASSTHROUGH':
      'UNKNOWN_SHAPE is itself a HostFailureReason, so the passthrough check sees a host reason echoed for that member of the enum.',
    'DC-MODEL-FORGES-HOST-REASON':
      'Classifying the forgery UNKNOWN_SHAPE is precisely not recording OUT_OF_RANGE.',
  },
  'DC-FORGERY-DISCARDED': {
    'DC-FORGERY-AS-UNKNOWN-SHAPE':
      'Same: the throw reaches every forged-reason fixture. A discard cannot be narrowed to throw for only one observer.',
    'DC-HOST-REASON-PASSTHROUGH':
      'The throw propagates through any fixture that sends a forged host reason, including this one.',
    'DC-MODEL-FORGES-HOST-REASON':
      'Discarding by throwing means the required OUT_OF_RANGE record is never produced, so the forgery law fires too.',
    'DC-NONDETERMINISTIC-REASON':
      'The determinism fixture uses a forged host reason as its identical input; the discard throws on it. The collateral is the throw\'s blast radius, not a second error.',
    'DC-UNION-COLLAPSE':
      'UNION-COLLAPSE sends host reasons through admit; the discard throws on each, so the law dies on the exception rather than on a wrong value.',
  },
  'DC-HASH-OVERFLOW': {
    'DC-BUCKET-OVERFLOW':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
    'DC-CLAMP-ON-OVERFLOW':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
    'DC-DEFAULT-SUBSTITUTION':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
    'DC-LOCAL-OVERFLOW-ENUM':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
    'DC-SPLIT-TO-FIT':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
    'DC-STRINGIFY-OVERFLOW':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
  },
  'DC-HOST-REASON-PASSTHROUGH': {
    'DC-FORGERY-DISCARDED':
      'Recording the provider\'s host reason verbatim is not recording OUT_OF_RANGE, which is what this law requires.',
    'DC-MODEL-FORGES-HOST-REASON':
      'Passthrough IS the forgery being trusted. Identical mechanism, opposite naming.',
  },
  'DC-LOCAL-OVERFLOW-ENUM': {
    'DC-BUCKET-OVERFLOW':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
    'DC-CLAMP-ON-OVERFLOW':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
    'DC-DEFAULT-SUBSTITUTION':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
    'DC-HASH-OVERFLOW':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
    'DC-SPLIT-TO-FIT':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
    'DC-STRINGIFY-OVERFLOW':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
  },
  'DC-MODEL-FORGES-HOST-REASON': {
    'DC-FORGERY-DISCARDED':
      'FORGERY-DISCARDED asserts the forged reason is RECORDED as OUT_OF_RANGE. Trusting the provider\'s claim records something else, so it fires. Both laws police the same single decision.',
    'DC-HOST-REASON-PASSTHROUGH':
      'Trusting the claim IS passthrough. The two names describe one mechanism from two sides; they cannot be separated without the candidate ceasing to forge.',
  },
  'DC-PROSE-IN-REPRESENTATION': {
    'DC-WRAPPER-ENVELOPE':
      'Adding any member means the representation is no longer the packet, which is what the no-wrapper law asserts. Identity and membership are the same law seen twice.',
  },
  'DC-QUESTION-TEXT': {
    'DC-WRAPPER-ENVELOPE':
      'Same: a representation carrying question text is not the packet.',
  },
  'DC-SPLIT-TO-FIT': {
    'DC-BUCKET-OVERFLOW':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
    'DC-CLAMP-ON-OVERFLOW':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
    'DC-DEFAULT-SUBSTITUTION':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
    'DC-HASH-OVERFLOW':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
    'DC-LOCAL-OVERFLOW-ENUM':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
    'DC-STRINGIFY-OVERFLOW':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
  },
  'DC-STRINGIFY-OVERFLOW': {
    'DC-BUCKET-OVERFLOW':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
    'DC-CLAMP-ON-OVERFLOW':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
    'DC-DEFAULT-SUBSTITUTION':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
    'DC-HASH-OVERFLOW':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
    'DC-LOCAL-OVERFLOW-ENUM':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
    'DC-SPLIT-TO-FIT':
      'Every §5 overflow law asserts the SAME required outcome for OVERFLOW_STATE: no representation is constructed. This candidate constructs one — that IS its error — so all sibling overflow laws necessarily fire. Removing the collateral would mean refusing construction, i.e. ceasing to embody the error. IRREDUCIBLE.',
  },
  'DC-UNION-COLLAPSE': {
    'DC-FORGERY-DISCARDED':
      'Same decision point: the required OUT_OF_RANGE record is replaced by a model reason.',
    'DC-MODEL-FORGES-HOST-REASON':
      'Collapsing a host reason to REFUSED is not recording OUT_OF_RANGE.',
  },
  'DC-VARYING-INSTRUCTION': {
    'DC-CORRELATION-HANDLE':
      'Same added-member mechanism trips the non-member check.',
    'DC-EXTRA-MEMBER':
      'Work-unit-varying wording can only reach the wire as content, and any content outside the six members is an extra member. IRREDUCIBLE.',
    'DC-FREE-STRING':
      'Varying wording is by construction a free string, which is exactly what the free-string law forbids.',
    'DC-PROSE-IN-REPRESENTATION':
      'The added member is prose and is named `guidance`, which the prose-member law matches by design.',
  },
};

// ───────────────────────────── run ─────────────────────────────

type Outcome = 'passed' | 'killed';

const run = (f: Falsifier, m: ContractModel): Outcome => {
  try {
    f(m);
    return 'passed';
  } catch {
    return 'killed';
  }
};

const main = (): void => {
  verifyPins();

  out('');
  out('── CORPUS ──');
  out(`  falsifiers : ${FALSIFIER_IDS.length}`);
  out(`  candidates : ${CANDIDATE_IDS.length}`);

  const missingFalsifier = CANDIDATE_IDS.filter((c) => !FALSIFIER_IDS.includes(c));
  const missingCandidate = FALSIFIER_IDS.filter((f) => !CANDIDATE_IDS.includes(f));
  if (missingFalsifier.length || missingCandidate.length) {
    out(`  FAIL: unpaired — no falsifier: ${missingFalsifier.join(',') || 'none'}`);
    out(`                  no candidate: ${missingCandidate.join(',') || 'none'}`);
    process.exit(1);
  }

  // REFERENCE
  out('');
  out('── REFERENCE ──');
  const refFailures: string[] = [];
  for (const id of FALSIFIER_IDS) {
    const f = FALSIFIERS[id];
    if (!f) { refFailures.push(`${id} (missing)`); continue; }
    try {
      f(REFERENCE);
    } catch (e) {
      refFailures.push(`${id}: ${(e as Error).message}`);
    }
  }
  if (refFailures.length) {
    out(`  FAIL — conforming reference did not pass ${refFailures.length} falsifier(s):`);
    for (const r of refFailures) out(`    ${r}`);
    process.exit(1);
  }
  out(`  ok  reference passes all ${FALSIFIER_IDS.length} falsifiers`);

  // LETHALITY + DISCRIMINATION + STALE-COLLATERAL + SURVIVOR
  out('');
  out('── LETHALITY / DISCRIMINATION ──');
  const survivors: string[] = [];
  const unclassified: string[] = [];
  const staleDeclared: string[] = [];
  let namedKills = 0;
  let collateralTotal = 0;

  for (const cid of CANDIDATE_IDS) {
    const model = CANDIDATES[cid];
    if (!model) { survivors.push(`${cid} (missing candidate)`); continue; }

    const named = FALSIFIERS[cid];
    if (!named) { survivors.push(`${cid} (missing named falsifier)`); continue; }

    if (run(named, model) !== 'killed') {
      survivors.push(cid);
      continue;
    }
    namedKills += 1;

    const declared = DECLARED_COLLATERAL[cid] ?? {};
    const fired: string[] = [];
    for (const fid of FALSIFIER_IDS) {
      if (fid === cid) continue;
      const other = FALSIFIERS[fid];
      if (!other) continue;
      if (run(other, model) === 'killed') {
        fired.push(fid);
        collateralTotal += 1;
        if (!(fid in declared)) unclassified.push(`${cid} -> ${fid}`);
      }
    }
    for (const dfid of Object.keys(declared)) {
      if (!fired.includes(dfid)) staleDeclared.push(`${cid} -> ${dfid}`);
    }
    out(`  kill ${cid}${fired.length ? `   collateral: ${fired.join(', ')}` : ''}`);
  }

  out('');
  out('── VERDICT ──');
  out(`  named kills          : ${namedKills}/${CANDIDATE_IDS.length}`);
  out(`  collateral kills     : ${collateralTotal}`);
  out(`  unclassified         : ${unclassified.length}`);
  out(`  stale declarations   : ${staleDeclared.length}`);
  out(`  survivors            : ${survivors.length}`);

  let failed = false;
  if (survivors.length) {
    failed = true;
    out('');
    out('  SURVIVOR LAW — suite is NOT EVIDENCE. Repair the SUITE, never the candidate:');
    for (const s of survivors) out(`    survived: ${s}`);
  }
  if (unclassified.length) {
    failed = true;
    out('');
    out('  DISCRIMINATION — unclassified collateral (declare with a concrete reason):');
    for (const u of unclassified) out(`    ${u}`);
  }
  if (staleDeclared.length) {
    failed = true;
    out('');
    out('  STALE-COLLATERAL — declared collateral that no longer fires:');
    for (const s of staleDeclared) out(`    ${s}`);
  }

  if (failed) process.exit(1);
  out('');
  out('  MATRIX LETHAL + DISCRIMINATING');
  process.exit(0);
};

main();
