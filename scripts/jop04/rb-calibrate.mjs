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
      'RB-CAL-2a': 'RED', 'RB-CAL-2b': 'NOT-REACHED',
    },
  },
  fd543df1: {
    name: 'RB-6A CANDIDATE MATRIX (frozen before re-run)',
    expect: {
      'RB-F1': 'GREEN', 'RB-F2': 'GREEN', 'RB-F3': 'RED', 'RB-F4': 'RED',
      'RB-F5': 'UNINSTANTIATED', 'RB-F6': 'RED', 'RB-F7': 'N/A', 'RB-F8': 'GREEN',
      'RB-CAL-2a': 'GREEN', 'RB-CAL-2b': 'GREEN',
    },
  },
};
const NEVER_DISCHARGES = new Set(['PRECONDITION-UNMET', 'UNINSTANTIATED', 'N/A', 'NOT-REACHED']);

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
  const profile = PROFILES[subjectArg];
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
      records.push({
        subject_sha: subject.resolvedSha,
        instrument_sha,
        instrument_lineage: INSTRUMENT_LINEAGE,
        falsifier: probe.id,
        statement: probe.label,
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
      });
    }

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
