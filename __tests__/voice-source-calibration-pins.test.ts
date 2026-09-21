import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const read = (path: string) => readFileSync(path, 'utf8');

describe('SOURCE LEVEL-CALIBRATION-01 execution pins', () => {
  const preflight = read('docs/programme/VOICE-2026/SOURCE_LEVEL-CALIBRATION-01_PREFLIGHT_PIN_DRAFT_2026-09-21.sh');
  const run = read('docs/programme/VOICE-2026/SOURCE_LEVEL-CALIBRATION-01_RUN_PIN_DRAFT_2026-09-21.sh');
  const retry = read('docs/programme/VOICE-2026/SOURCE_LEVEL-CALIBRATION-01_RETRY-01_RUN_PIN_DRAFT_2026-09-21.sh');

  it('pins the exact bounded implementation candidate', () => {
    for (const src of [preflight, run, retry]) {
      expect(src).toContain('SHA=2f211f432394a236cc2bcdb4fea55ca1bd179713');
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
    expect(preflight).not.toContain('feature/voice-2026-record-of-record-20260916\\ngit merge-base');
    expect(preflight).toContain('feature/voice-2026-record-of-record-20260916\ngit merge-base --is-ancestor "$SHA" FETCH_HEAD');
    expect(preflight).not.toContain('sort -z');
    expect(preflight).not.toContain('xargs -0');
  });

  it('run pin requires fresh authority, unchanged geometry and operator safety before spending its marker', () => {
    expect(run).toContain('K00_EXEC_AUTHORITY');
    expect(run).toContain('K00_CAL_GEOMETRY_CONFIRMATION');
    expect(run).toContain('[ "$GEOMETRY_CONFIRMATION" = UNCHANGED ]');
    expect(run).toContain('K00_CAL_OPERATOR_SAFETY');
    expect(run).toContain('[ "$SAFETY_CONFIRMATION" = CONFIRMED ]');
    expect(run.match(/K00_CAL_BATCH_AUTHORITY=BOUND bash scripts\/witness\/k00-source-calibration-batch\.sh/g)?.length).toBe(2);
    expect(run).toContain('operatorSafety=%s');
    const freshness = run.indexOf('test "$AGE" -le 300');
    const marker = run.indexOf("SOURCE-LEVEL-CALIBRATION-01 INVOKED");
    expect(freshness).toBeGreaterThan(-1);
    expect(marker).toBeGreaterThan(freshness);
  });

  it('Retry-01 proves ACT-01 was an infrastructure-only zero-measurement stop', () => {
    expect(retry).toContain('PRIOR_SHA=858ee4948fd5e4f7a65dab156004bb863ad8ae66');
    expect(retry).toContain('PRIOR_ACT_MARK=/private/tmp/source-level-calibration-01-act-invoked.txt');
    expect(retry).toContain('RETRY_MARK=/private/tmp/source-level-calibration-01-retry-01-act-invoked.txt');
    expect(retry).toContain("grep -q 'idx: unbound variable'");
    expect(retry).toContain("test ! -f \"$PRIOR_L1DIR/sample-timing.tsv\"");
    expect(retry).toContain("sample-*-afplay-liveness.tsv");
    expect(retry).toContain("sample-*-xcodebuild.log");
    expect(retry).toContain("sample-*-harness-state.txt");
    expect(retry).toContain("sample-*-preplay-processes.json");
    expect(retry).toContain("*.jsonl");
    expect(retry).toContain('priorMeasurementRows=0');
    expect(retry).toContain('priorPlaybackStarted=false');
    expect(retry).toContain('priorPhoneInvocationStarted=false');
    expect(retry).toContain('FOUNDER-REAUTHORIZED-SOURCE-LEVEL-CALIBRATION-01-RETRY-01');
    expect(retry).toContain('ACT01_INFRA_PREPLAY_ZERO_MEASUREMENT');
    expect(retry.match(/K00_CAL_BATCH_AUTHORITY=BOUND bash scripts\/witness\/k00-source-calibration-batch\.sh/g)?.length).toBe(2);
  });

  it('Retry-01 spends a distinct marker only after prior-act proof and fresh preflight', () => {
    const proof = retry.indexOf("grep -q 'idx: unbound variable'");
    const fresh = retry.indexOf('test "$AGE" -le 300');
    const marker = retry.indexOf('SOURCE-LEVEL-CALIBRATION-01 RETRY-01 INVOKED');
    expect(proof).toBeGreaterThan(-1);
    expect(fresh).toBeGreaterThan(proof);
    expect(marker).toBeGreaterThan(fresh);
    expect(retry).not.toContain('rm -f "$PRIOR_ACT_MARK"');
    expect(retry).not.toContain('rm "$PRIOR_ACT_MARK"');
  });

  it('implements the closed first-pass-wins ladder with no L4 in initial and Retry-01 pins', () => {
    for (const src of [run, retry]) {
      expect(src).toContain('for LEVEL in L1 L2 L3');
      expect(src).not.toContain('L4');
      expect(src).toContain('if [ "$PASS" = yes ]; then');
      expect(src).toContain('break');
      expect(src).toContain('NO_LEVEL_PIN');
      expect(src).toContain('V1 remains 20 dB');
      expect(src).not.toContain('sort -z');
      expect(src).not.toContain('xargs -0');
    }
  });

  it('executes VP-off only after a VP-on level pin exists', () => {
    for (const src of [run, retry]) {
      const noPin = src.indexOf('if [ -z "$SELECTED" ]');
      const vpOff = src.indexOf('off 3 "$FIXTURE"');
      expect(noPin).toBeGreaterThan(-1);
      expect(vpOff).toBeGreaterThan(noPin);
      expect(src).toContain('vpCharacterization=');
    }
  });

  it('both pin scripts are shell-syntax clean', () => {
    expect(() => execFileSync('bash', ['-n', 'docs/programme/VOICE-2026/SOURCE_LEVEL-CALIBRATION-01_PREFLIGHT_PIN_DRAFT_2026-09-21.sh'], { stdio: 'pipe' })).not.toThrow();
    expect(() => execFileSync('bash', ['-n', 'docs/programme/VOICE-2026/SOURCE_LEVEL-CALIBRATION-01_RUN_PIN_DRAFT_2026-09-21.sh'], { stdio: 'pipe' })).not.toThrow();
    expect(() => execFileSync('bash', ['-n', 'docs/programme/VOICE-2026/SOURCE_LEVEL-CALIBRATION-01_RETRY-01_RUN_PIN_DRAFT_2026-09-21.sh'], { stdio: 'pipe' })).not.toThrow();
  });
});
