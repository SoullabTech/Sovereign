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

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const NON_DISCHARGING = new Set(['UNINSTANTIATED', 'N/A']);

function dischargeState(f, observed) {
  if (NON_DISCHARGING.has(observed)) return 'NON-DISCHARGING';
  // At the legacy baseline a RED is the PREDICTED state, not a discharge.
  return observed === 'GREEN' ? 'DISCHARGED-AT-BASELINE' : 'NOT-DISCHARGED';
}

async function main() {
  const jsonAt = process.argv.includes('--json')
    ? process.argv[process.argv.indexOf('--json') + 1]
    : path.join(REPO_ROOT, 'docs', 'programme', 'JOP-04_RB_CALIBRATION_EVIDENCE.json');

  const instrument_sha = instrumentSha(REPO_ROOT);
  const subject = materializeSubject(REPO_ROOT, SUBJECT_SHA);

  console.log('JOP-04 RB — RED-before-GREEN CALIBRATION');
  console.log('='.repeat(78));
  console.log(`SUBJECT SHA     ${subject.shortSha}   (detached worktree, pristine, HEAD read back from checkout)`);
  console.log(`INSTRUMENT SHA  ${instrument_sha}   (harness judging it — separate identity)`);
  console.log(`LAYER B CAP     ${LAYER_B_CAPABILITY}   (registered read capability only)`);
  console.log('');

  const records = [];
  let mismatches = 0;
  let stop = null;

  try {
    const mods = await loadSubjectModules(subject.dir);
    const ctx = { mods, subjectDir: subject.dir };

    for (const f of FALSIFIERS) {
      let observed, evidence, note;
      try {
        ({ observed, evidence, note } = f.run(ctx));
      } catch (e) {
        observed = 'ERROR';
        evidence = { instrument_error: e.message };
        note = 'the instrument itself failed — this is an instrument defect, not a subject verdict';
      }
      const calibration = observed === f.predicted ? 'MATCH' : 'MISMATCH';
      if (calibration === 'MISMATCH') mismatches++;
      if (f.calibrationAnchor && observed !== 'RED') {
        stop = `${f.id} was predicted RED and observed ${observed} — instrument invalid or census premise contradicted`;
      }
      records.push({
        subject_sha: subject.resolvedSha,
        instrument_sha,
        falsifier: f.id,
        statement: f.statement,
        expected_state: f.predicted,
        observed_state: observed,
        calibration,
        evidence_class: f.evidenceClass,
        evidence_location: `scripts/jop04/rb-falsifiers.mjs → FALSIFIERS[${f.id}].run()`,
        layer: f.layerB ? 'B (route→runCapability composition; IPC hop NOT exercised)' : 'A',
        layer_b_capability: f.layerB ? LAYER_B_CAPABILITY : null,
        discharge_state: dischargeState(f, observed),
        evidence,
        note,
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
      run: 'JOP-04 RB RED-before-GREEN calibration',
      subject_sha: subject.resolvedSha,
      subject_sha_short: subject.shortSha,
      instrument_sha,
      layer_b_capability: LAYER_B_CAPABILITY,
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
