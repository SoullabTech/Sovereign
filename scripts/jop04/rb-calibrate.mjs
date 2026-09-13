#!/usr/bin/env node
/**
 * JOP-04 RB — RED-before-GREEN calibration run.
 *
 * FIRST RUN IS CALIBRATION, NOT ACCEPTANCE.
 * It compares PREDICTED legacy state to OBSERVED legacy state at the subject SHA.
 * Any mismatch is a FINDING, never something to patch around.
 *
 *   RB-F2 observed GREEN  →  STOP  →  instrument invalid or census premise contradicted
 *
 * ⛔ This script changes nothing. It repairs nothing. It executes only registered
 *    read capabilities, inside a detached checkout of the subject.
 *
 * Usage:  node scripts/jop04/rb-calibrate.mjs [--json <path>]
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { materializeSubject, loadSubjectModules, instrumentSha, SUBJECT_SHA } from './rb-subject.mjs';
import { FALSIFIERS, ipcCompositionTripwire, LAYER_B_CAPABILITY } from './rb-falsifiers.mjs';
import { runCal2, CAL2_SPECIMEN } from './rb-cal2.mjs';
import { runCal3, ipcHostWitness, CAL3_SPECIMEN } from './rb-cal3.mjs';

/** Instrument lineage. ⛔ The amendment does not REPLACE 0b9aaec4; it descends from it. */
const INSTRUMENT_LINEAGE = ['0b9aaec4', '1ed81732'];
/**
 * RULING 3 — named expectation profiles. ⛔ The runner is TOLD which matrix
 * governs the subject. It may NEVER infer the expected matrix from observed
 * outcomes, and the baseline matrix is never edited to fit a candidate.
 */
const PROFILES = {
  e1c6f527: {
    name: 'BASELINE MATRIX (immutable)',
    expect: {
      'RB-F1': 'RED', 'RB-F2': 'RED', 'RB-F3': 'RED', 'RB-F4': 'RED',
      'RB-F5': 'UNINSTANTIATED',
      // ⚠️ PREDECLARED CHANGE, frozen before this run: under the AMENDED F6
      // specimen (same capability, only routing differs) arm B is UNREACHABLE at
      // baseline — CAL-2a RED proves no task shape makes a registered capability
      // non-routable. The old baseline RED was obtained by varying CAPABILITY
      // IDENTITY, which is RB-F8's discriminant, not RB-F6's. Reported as a
      // FINDING, not absorbed.
      'RB-F6': 'PRECONDITION-UNMET',
      'RB-F7': 'N/A', 'RB-F8': 'GREEN',
      'RB-CAL-2a': 'RED', 'RB-CAL-2b': 'PRECONDITION-UNMET',
      // RB-6B probes — CAL-3a is the new known-bad anchor.
      'RB-CAL-3a': 'RED', 'RB-CAL-3b': 'UNINSTANTIATED',
      'RB-CAL-3c': 'UNINSTANTIATED', 'RB-CAL-3d': 'UNINSTANTIATED',
    },
  },
  fd543df1: {
    name: 'RB-6A CANDIDATE MATRIX (frozen before re-run)',
    expect: {
      'RB-F1': 'GREEN', 'RB-F2': 'GREEN', 'RB-F3': 'RED', 'RB-F4': 'RED',
      'RB-F5': 'UNINSTANTIATED', 'RB-F6': 'RED', 'RB-F7': 'N/A', 'RB-F8': 'GREEN',
      'RB-CAL-2a': 'GREEN', 'RB-CAL-2b': 'GREEN',
      // ⭐ RB-6B ANCHOR: a legitimate route still causes execution by itself.
      'RB-CAL-3a': 'RED', 'RB-CAL-3b': 'UNINSTANTIATED',
      'RB-CAL-3c': 'UNINSTANTIATED', 'RB-CAL-3d': 'UNINSTANTIATED',
    },
  },
};

/**
 * RB-6B TARGET MATRIX — frozen BEFORE implementation. Not a profile yet: no
 * RB-6B repair exists to judge. ⛔ RB-F4 must remain RED on a REACHED
 * precondition; if it turns GREEN because the new boundary refuses
 * "unclassified effect", the implementation crossed into the effect lane.
 * The correct RB-6B refusal is `no constituted execution decision`.
 */
export const RB6B_TARGET = Object.freeze({
  'RB-F1': 'GREEN', 'RB-F2': 'GREEN', 'RB-F3': 'GREEN', 'RB-F4': 'RED',
  'RB-F5': 'nondischarging until a legitimate specimen exists',
  'RB-F6': 'GREEN', 'RB-F7': 'N/A', 'RB-F8': 'GREEN',
  'RB-CAL-2a': 'GREEN', 'RB-CAL-2b': 'GREEN',
  'RB-CAL-3a': 'GREEN', 'RB-CAL-3b': 'GREEN',
  'RB-CAL-3c': 'GREEN', 'RB-CAL-3d': 'GREEN',
  'caller-forged execution authority': 'REFUSED / no execution',
  'host-minted execution decision': 'execution possible',
});
/**
 * M1 MUTATION MATRIX — frozen BEFORE the mutant is built or run.
 * M1 reintroduces the SEMANTIC equivalent of `registered → routable`: the router
 * manufactures a routing eligibility from registry membership, overriding what the
 * caller declared. ⛔ Not the literal old line — the falsifiers must bite on the
 * CLASS, not on a spelling.
 */
const M1_EXPECT = {
  'RB-F1': 'RED',              // registration alone executes again
  'RB-F2': 'RED',              // membership alone decides the lane again
  'RB-F3': 'RED',              // unchanged — lane reachable, authority still absent
  'RB-F4': 'RED',              // unchanged — absence of contract still accepted
  'RB-F5': 'UNINSTANTIATED',
  // arm B cannot reach a non-routable state: the mutation OVERRIDES an explicitly
  // unsatisfied declaration, so both arms route. PRECONDITION-UNMET, not GREEN.
  'RB-F6': 'PRECONDITION-UNMET',
  'RB-F7': 'N/A',
  'RB-F8': 'GREEN',            // ⛔ MUST HOLD — a mutation may not widen execution authority
  'RB-CAL-2a': 'RED',          // no task shape leaves a registered capability non-routable
  'RB-CAL-2b': 'PRECONDITION-UNMET',  // nothing to evaluate once 2a is RED
};
// Ruling 1's ratified verdict set. ⛔ 'NOT-REACHED' was legacy vocabulary for the
// same state and is migrated to PRECONDITION-UNMET — a rename, not a change of
// expected outcome.
/**
 * M1-FULL MUTATION MATRIX — frozen BEFORE the mutant is built or run.
 * M1-full reintroduces BOTH components of `registered → routable`:
 *   COMPONENT A  registration manufactures routing eligibility
 *   COMPONENT B  registration preempts the router's own judgment
 * The two PRECONDITION-UNMET entries are intentional: the mutant DESTROYS the
 * discriminating state those probes require. That is a correct mutation
 * response, not an acceptance discharge.
 */
const M1_FULL_EXPECT = {
  'RB-F1': 'RED', 'RB-F2': 'RED', 'RB-F3': 'RED', 'RB-F4': 'RED',
  'RB-F5': 'UNINSTANTIATED',
  'RB-F6': 'PRECONDITION-UNMET',   // arm B unreachable — preemption restored
  'RB-F7': 'N/A',
  'RB-F8': 'GREEN',                // ⛔ MUST HOLD
  'RB-CAL-2a': 'RED',              // no arm survives: oversize is preempted too
  'RB-CAL-2b': 'PRECONDITION-UNMET',
};
const NEVER_DISCHARGES = new Set(['PRECONDITION-UNMET', 'UNINSTANTIATED', 'N/A', 'INSTRUMENT_ERROR', 'HOST_WITNESS_UNAVAILABLE']);

/**
 * RULING 1 (machine-enforced) — the runner refuses to emit GREEN when the
 * precondition contract has not been evidenced.
 *
 *   REQUIRED + REACHED     → RED or GREEN may stand
 *   REQUIRED + UNREACHED   → PRECONDITION-UNMET
 *   NOT_REQUIRED           → RED or GREEN may stand
 *   missing / malformed    → INSTRUMENT_ERROR  (⛔ not a substrate verdict)
 */
function enforcePrecondition(observed, precondition) {
  if (!precondition || typeof precondition !== 'object'
      || !['REQUIRED', 'NOT_REQUIRED'].includes(precondition.requirement)
      || !['REACHED', 'UNREACHED', 'N/A'].includes(precondition.state)
      || precondition.evidence == null || precondition.provenance == null) {
    return { verdict: 'INSTRUMENT_ERROR', overridden: true,
      why: 'probe did not implement its frozen measurement contract: precondition record absent or malformed' };
  }
  if (precondition.requirement === 'REQUIRED' && precondition.state !== 'REACHED') {
    return { verdict: 'PRECONDITION-UNMET', overridden: observed !== 'PRECONDITION-UNMET',
      why: 'required precondition was not reached; no valid judgment is available' };
  }
  return { verdict: observed, overridden: false, why: null };
}

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');


function dischargeState(observed) {
  if (NEVER_DISCHARGES.has(observed)) return 'NON-DISCHARGING';
  return observed === 'GREEN' ? 'DISCHARGED' : 'NOT-DISCHARGED';
}

async function main() {
  const jsonAt = process.argv.includes('--json')
    ? process.argv[process.argv.indexOf('--json') + 1]
    : path.join(REPO_ROOT, 'docs', 'programme', 'JOP-04_RB_CALIBRATION_EVIDENCE.json');

  // ⛔ Subject identity is explicit. Default is the frozen baseline; a repair
  //    candidate must be NAMED, never inherited from "whatever HEAD is now".
  const subjectArg = process.argv.includes('--subject')
    ? process.argv[process.argv.indexOf('--subject') + 1]
    : SUBJECT_SHA;
  const isBaseline = subjectArg === SUBJECT_SHA;
  const isCandidate = subjectArg === 'fd543df1';
  const profile = process.argv.includes('--m1full')
    ? { name: 'M1-FULL MUTATION MATRIX (frozen before the mutant was built)', expect: M1_FULL_EXPECT }
    : process.argv.includes('--m1')
    ? { name: 'M1 MUTATION MATRIX (frozen before the mutant was built)', expect: M1_EXPECT }
    : PROFILES[subjectArg];
  if (!profile) {
    console.error(`⛔ no frozen expectation profile for subject '${subjectArg}'. A matrix must be FROZEN BEFORE the run; the runner may never infer one.`);
    process.exitCode = 2; return;
  }
  const instrument_sha = instrumentSha(REPO_ROOT);
  const subject = materializeSubject(REPO_ROOT, subjectArg);

  console.log('JOP-04 RB — RED-before-GREEN CALIBRATION');
  console.log('='.repeat(78));
  console.log(`SUBJECT SHA     ${subject.shortSha}   ${isBaseline ? '(FROZEN BASELINE — detached worktree, pristine, HEAD read back)' : '(REPAIR CANDIDATE — detached worktree, pristine, HEAD read back)'}`);
  console.log(`INSTRUMENT SHA  ${instrument_sha}   (harness judging it — separate identity)`);
  console.log(`  lineage from  ${INSTRUMENT_LINEAGE.join(', ')}   (amendment descends from, never replaces)`);
  console.log(`CAL-2 SPECIMEN  ${CAL2_SPECIMEN}   (same capability identity in every arm)`);
  console.log(`PROFILE         ${profile.name}`);
  console.log(`LAYER B CAP     ${LAYER_B_CAPABILITY}   (registered read capability only)`);
  console.log('');

  const records = [];
  let mismatches = 0;
  let stop = null;

  try {
    const mods = await loadSubjectModules(subject.dir);
    const ctx = { mods, subjectDir: subject.dir };

    for (const f of FALSIFIERS) {
      let observed, evidence, note, precondition = null;
      try {
        ({ observed, evidence, note, precondition = null } = await f.run(ctx));
      } catch (e) {
        observed = 'ERROR';
        evidence = { instrument_error: e.message };
        note = 'the instrument itself failed — this is an instrument defect, not a subject verdict';
      }
      const enforced = enforcePrecondition(observed, precondition);
      if (enforced.overridden) { note = `⛔ RUNNER OVERRIDE (${enforced.verdict}): ${enforced.why} | probe said: ${observed}`; }
      observed = enforced.verdict;
      const expected = profile.expect[f.id];
      const calibration = observed === expected ? 'MATCH' : 'MISMATCH';
      if (calibration === 'MISMATCH') mismatches++;
      if (f.calibrationAnchor && isBaseline && observed !== 'RED') {
        stop = `${f.id} was predicted RED and observed ${observed} — instrument invalid or census premise contradicted`;
      }
      records.push({
        subject_sha: subject.resolvedSha,
        instrument_sha,
        falsifier: f.id,
        statement: f.statement,
        expected_state: expected,
        expectation_profile: profile.name,
        precondition,
        observed_state: observed,
        calibration,
        evidence_class: f.evidenceClass,
        evidence_location: `scripts/jop04/rb-falsifiers.mjs → FALSIFIERS[${f.id}].run()`,
        layer: f.layerB ? 'B (route→runCapability composition; IPC hop NOT exercised)' : 'A',
        layer_b_capability: f.layerB ? LAYER_B_CAPABILITY : null,
        discharge_state: dischargeState(observed),
        evidence,
        note,
      });
    }

    // ── RB-CAL-2 · registration/routability discriminator (amendment) ──────
    const cal2 = await runCal2(mods, subject.dir, CAL2_SPECIMEN);
    const cal2Expected = profile.expect['RB-CAL-2a'];
    const cal2Calibration = cal2.headline === cal2Expected ? 'MATCH' : 'MISMATCH';
    if (cal2Calibration === 'MISMATCH') mismatches++;
    if (isBaseline && cal2.headline !== 'RED') {
      stop = `RB-CAL-2 was predicted RED at baseline and observed ${cal2.headline} — the amendment does not detect the coupling it was written to distinguish`;
    }
    if (cal2.cal2b.observed !== profile.expect['RB-CAL-2b']) mismatches++;
    for (const probe of [cal2.cal2a, cal2.cal2b]) {
      // Ruling 1 applies to EVERY probe, calibration probes included. This was
      // missing: CAL-2a/2b bypassed enforcement entirely.
      const enf = enforcePrecondition(probe.observed, probe.precondition);
      if (enf.overridden) { probe.observed = enf.verdict; probe.note = `⛔ RUNNER OVERRIDE (${enf.verdict}): ${enf.why}`; }
      records.push({
        subject_sha: subject.resolvedSha,
        instrument_sha,
        instrument_lineage: INSTRUMENT_LINEAGE,
        falsifier: probe.id,
        statement: probe.label,
        precondition: probe.precondition ?? null,
        expected_state: profile.expect[probe.id],
        expectation_profile: profile.name,
        observed_state: probe.observed,
        calibration: probe.observed === profile.expect[probe.id] ? 'MATCH' : 'MISMATCH',
        evidence_class: 'BEHAVIORAL',
        evidence_location: 'scripts/jop04/rb-cal2.mjs → runCal2()',
        layer: 'A (route() only — no execution)',
        layer_b_capability: null,
        discharge_state: dischargeState(probe.observed),
        evidence: probe.evidence,
        note: probe.note,
        precondition_enforced: enforcePrecondition(probe.observed, probe.precondition).verdict,
      });
    }

    // ── RB-6B · CAL-3 probes ─────────────────────────────────────────────
    const cal3 = await runCal3(ctx, subject.dir, CAL3_SPECIMEN);
    for (const probe of [cal3.cal3a, cal3.cal3b, cal3.cal3c, cal3.cal3d]) {
      const enf = enforcePrecondition(probe.observed, probe.precondition);
      // UNINSTANTIATED is a probe-declared state, not a precondition failure.
      if (enf.overridden && probe.observed !== 'UNINSTANTIATED') probe.observed = enf.verdict;
      const exp = profile.expect[probe.id];
      if (probe.observed !== exp) mismatches++;
      if (probe.id === 'RB-CAL-3a' && isCandidate && probe.observed !== 'RED') {
        stop = `RB-CAL-3a was predicted RED on the RB-6A subject and observed ${probe.observed} — the instrument fails to see the defect C2, RB-F3 and RB-F6 already established`;
      }
      records.push({
        subject_sha: subject.resolvedSha, instrument_sha, instrument_lineage: INSTRUMENT_LINEAGE,
        falsifier: probe.id, statement: probe.label,
        precondition: probe.precondition ?? null,
        expected_state: exp, expectation_profile: profile.name,
        observed_state: probe.observed,
        calibration: probe.observed === exp ? 'MATCH' : 'MISMATCH',
        evidence_class: 'BEHAVIORAL', evidence_location: 'scripts/jop04/rb-cal3.mjs → runCal3()',
        layer: 'A/B (subject composition; ⛔ NOT the real IPC boundary)',
        layer_b_capability: CAL3_SPECIMEN,
        discharge_state: dischargeState(probe.observed),
        evidence: probe.evidence, note: probe.note,
      });
    }
    const hostWitness = ipcHostWitness(subject.dir);

    const tripwire = ipcCompositionTripwire(mods.mainJsPath);

    // ── report ────────────────────────────────────────────────────────────
    const pad = (s, n) => String(s).padEnd(n);
    console.log(`${pad('FALSIFIER', 10)}${pad('PREDICTED', 16)}${pad('OBSERVED', 16)}${pad('CALIBRATION', 14)}DISCHARGE`);
    console.log('-'.repeat(78));
    for (const r of records) {
      const flag = r.calibration === 'MISMATCH' ? ' <<<' : '';
      console.log(`${pad(r.falsifier, 10)}${pad(r.expected_state, 16)}${pad(r.observed_state, 16)}${pad(r.calibration, 14)}${r.discharge_state}${flag}`);
    }
    console.log('-'.repeat(78));
    for (const r of records) console.log(`${r.falsifier}  ${r.note}`);

    console.log('');
    console.log(`REAL IPC HOST WITNESS   ${hostWitness.observed}   (discharges nothing)`);
    console.log(`  required path         ${hostWitness.required_path.join(' → ')}`);
    console.log(`  ⛔ ${hostWitness.substitution_policy}`);
    console.log(`  ⚠️  ${hostWitness.consequence}`);
    console.log('');
    console.log('STRUCTURAL TRIPWIRE — IPC composition (discharges nothing)');
    console.log(`  submit-task handler present   ${tripwire.submit_task_handler_present}`);
    console.log(`  C0 branch consumes lane       ${tripwire.c0_branch_consumes_lane}`);
    console.log(`  calls runCapability           ${tripwire.calls_run_capability}`);
    console.log(`  ⚠️  ${tripwire.note}`);

    const nonDischarging = records.filter((r) => r.discharge_state === 'NON-DISCHARGING').map((r) => r.falsifier);
    const calibrationSuccess = mismatches === 0 && !stop;

    console.log('');
    console.log('='.repeat(78));
    console.log(`CALIBRATION           ${calibrationSuccess ? 'SUCCESS — predicted legacy state matches observed' : 'FAILED — see MISMATCH rows'}`);
    console.log(`RB ACCEPTANCE PASS    NO — ${nonDischarging.join(', ')} non-discharging (FR-14: an obligation that does not PASS never discharges)`);
    if (stop) console.log(`\n⛔ STOP: ${stop}\n   No substrate work follows.`);

    const out = {
      run: 'JOP-04 RB RED-before-GREEN calibration (amended — RB-CAL-2 added)',
      instrument_lineage: INSTRUMENT_LINEAGE,
      cal2_specimen: CAL2_SPECIMEN,
      subject_sha: subject.resolvedSha,
      subject_sha_short: subject.shortSha,
      subject_role: isBaseline ? 'FROZEN_BASELINE' : 'REPAIR_CANDIDATE',
      instrument_sha,
      layer_b_capability: LAYER_B_CAPABILITY,
      expectation_profile: profile.name,
      calibration: calibrationSuccess ? 'SUCCESS' : 'FAILED',
      rb_acceptance_pass: false,
      non_discharging: nonDischarging,
      mismatches,
      stop,
      ipc_structural_tripwire: tripwire,
      real_ipc_host_witness: hostWitness,
      rb6b_target_matrix: RB6B_TARGET,
      records,
    };
    writeFileSync(jsonAt, JSON.stringify(out, null, 2));
    console.log(`\nevidence → ${path.relative(REPO_ROOT, jsonAt)}`);
    process.exitCode = calibrationSuccess ? 0 : 1;
  } finally {
    subject.dispose();
  }
}

main().catch((e) => { console.error('instrument failure:', e.message); process.exitCode = 2; });
