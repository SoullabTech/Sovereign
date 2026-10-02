import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { projectJevCalibration, jevCalibrationMonitorRows } from '../../../scripts/builder/founder-workspace/jev-calibration.mjs';

const root=mkdtempSync(path.join(os.tmpdir(),'jev-calibration-witness-'));
try {
  let c=projectJevCalibration({env:{JARVIS_JEV_CALIBRATION_DIR:root},now:'2026-10-02T21:00:00Z'});
  assert.equal(c.state,'UNASSESSED');
  assert.equal(c.evidence_state,'UNOBSERVED');
  assert.equal(c.policy.self_widening_forbidden,true);
  assert.equal(c.policy.provider_activation_authorized,false);
  let rows=jevCalibrationMonitorRows(c);
  assert.equal(rows.length,1);
  assert.equal(rows[0].level,'unobserved');
  console.log('PASS  absent evidence → UNASSESSED, never false calm');

  writeFileSync(path.join(root,'measurements.json'),JSON.stringify({shapes:[
    {task_shape:'ARCHITECTURE_REASONING',state:'DRIFTING',evidence_state:'OBSERVED',sample_size:48,undercall_rate:0.08,max_undercall:2,abstention_rate:0.21,reason:'Under-deliberation exceeded the admitted bound.'}
  ]}));
  writeFileSync(path.join(root,'admitted-envelope.json'),JSON.stringify({task_shapes:['ARCHITECTURE_REASONING']}));
  c=projectJevCalibration({env:{JARVIS_JEV_CALIBRATION_DIR:root},now:'2026-10-02T21:05:00Z'});
  assert.equal(c.state,'DRIFTING');
  assert.equal(c.shapes[0].state,'DRIFTING');
  assert.equal(c.policy.self_widening_forbidden,true);
  rows=jevCalibrationMonitorRows(c);
  assert.equal(rows[0].level,'warn');
  assert.match(rows[0].plain,/Under-deliberation/);
  console.log('PASS  drift → visible attention; admitted envelope does not override drift');

  writeFileSync(path.join(root,'measurements.json'),JSON.stringify({shapes:[
    {task_shape:'CODE_GROUNDED',state:'OBSERVING',evidence_state:'OBSERVED',sample_size:150,undercall_rate:0,max_undercall:0,abstention_rate:0.05}
  ]}));
  writeFileSync(path.join(root,'admitted-envelope.json'),JSON.stringify({task_shapes:['CODE_GROUNDED']}));
  c=projectJevCalibration({env:{JARVIS_JEV_CALIBRATION_DIR:root},now:'2026-10-02T21:10:00Z'});
  assert.equal(c.state,'ADMITTED');
  assert.equal(c.shapes[0].state,'ADMITTED');
  console.log('PASS  only an external admitted envelope promotes an observing shape');
} finally {
  rmSync(root,{recursive:true,force:true});
}
