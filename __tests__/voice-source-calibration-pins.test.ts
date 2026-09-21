import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const read = (path: string) => readFileSync(path, 'utf8');

describe('SOURCE LEVEL-CALIBRATION-01 execution pins', () => {
  const preflight = read('docs/programme/VOICE-2026/SOURCE_LEVEL-CALIBRATION-01_PREFLIGHT_PIN_DRAFT_2026-09-21.sh');
  const run = read('docs/programme/VOICE-2026/SOURCE_LEVEL-CALIBRATION-01_RUN_PIN_DRAFT_2026-09-21.sh');

  it('pins the exact bounded implementation candidate', () => {
    for (const src of [preflight, run]) {
      expect(src).toContain('SHA=858ee4948fd5e4f7a65dab156004bb863ad8ae66');
      expect(src).toContain('SUBJECT_SHA=faf918b5c5b2cd85f8e8a6c9cbda8bc76df11ce8');
    }
  });

  it('preflight proves frozen kernel, harness, historical batch and readers', () => {
    expect(preflight).toContain('VOICEKERNEL_TREE=df48584178c67ca0ac0daeab2918fd57c571c4e8');
    expect(preflight).toContain('HARNESS_TREE=7a37892d2afdb56174ef367e99f2bc2f8e44c946');
    expect(preflight).toContain('DRIVER_BATCH_BLOB=bd6fb211dc85c2352b27168c2d3516af54d15746');
    expect(preflight).toContain('SOURCE_READER_BLOB=ff2924059de663a701f80b888e1611adad3c8159');
    expect(preflight).toContain('OUTPUT_READER_BLOB=a87c56d0a6073b177e160f8c92dc95ec2673b3ca');
    expect(preflight).toContain('ENTRY_READER_BLOB=abd26d05efd838cd87c93fcdb1d1706e2b671901');
  });

  it('preflight is read-only with respect to the phone and records fixed geometry', () => {
    expect(preflight).toContain('device info apps');
    expect(preflight).toContain('device info processes');
    expect(preflight).not.toContain('test-without-building');
    expect(preflight).not.toContain('device process launch');
    expect(preflight).not.toContain('afplay -v');
    expect(preflight).toContain('K00_CAL_DISTANCE_CM');
    expect(preflight).toContain('geometry-record.txt');
    expect(preflight).toContain('git fetch origin feature/voice-2026-record-of-record-20260916');
    expect(preflight).toContain('git merge-base --is-ancestor "$SHA" FETCH_HEAD');
    expect(preflight).not.toContain('sort -z');
    expect(preflight).not.toContain('xargs -0');
  });

  it('run pin requires fresh authority, unchanged geometry and operator safety', () => {
    expect(run).toContain('K00_EXEC_AUTHORITY');
    expect(run).toContain('K00_CAL_GEOMETRY_CONFIRMATION');
    expect(run).toContain('[ "$GEOMETRY_CONFIRMATION" = UNCHANGED ]');
    expect(run).toContain('K00_CAL_OPERATOR_SAFETY');
    expect(run).toContain('[ "$SAFETY_CONFIRMATION" = CONFIRMED ]');
    expect(run.match(/K00_CAL_BATCH_AUTHORITY=BOUND bash scripts\/witness\/k00-source-calibration-batch\.sh/g)?.length).toBe(2);
    expect(run).toContain('operatorSafety=%s');
  });

  it('implements the closed first-pass-wins ladder with no L4', () => {
    expect(run).toContain('for LEVEL in L1 L2 L3');
    expect(run).not.toContain('L4');
    expect(run).toContain('if [ "$PASS" = yes ]; then');
    expect(run).toContain('break');
    expect(run).toContain('NO_LEVEL_PIN');
    expect(run).toContain('V1 remains 20 dB');
    expect(run).not.toContain('sort -z');
    expect(run).not.toContain('xargs -0');
  });

  it('executes VP-off only after a VP-on level pin exists', () => {
    const noPin = run.indexOf('if [ -z "$SELECTED" ]');
    const vpOff = run.indexOf('off 3 "$FIXTURE"');
    expect(noPin).toBeGreaterThan(-1);
    expect(vpOff).toBeGreaterThan(noPin);
    expect(run).toContain('vpCharacterization=');
  });

  it('both pin scripts are shell-syntax clean', () => {
    expect(() => execFileSync('bash', ['-n', 'docs/programme/VOICE-2026/SOURCE_LEVEL-CALIBRATION-01_PREFLIGHT_PIN_DRAFT_2026-09-21.sh'], { stdio: 'pipe' })).not.toThrow();
    expect(() => execFileSync('bash', ['-n', 'docs/programme/VOICE-2026/SOURCE_LEVEL-CALIBRATION-01_RUN_PIN_DRAFT_2026-09-21.sh'], { stdio: 'pipe' })).not.toThrow();
  });
});
