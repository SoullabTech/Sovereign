import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const read = (path: string) => readFileSync(path, 'utf8');

describe('SOURCE LEVEL-CALIBRATION-01 bounded implementation', () => {
  const fixture = read('scripts/witness/k00-source-calibration-fixture.py');
  const reader = read('scripts/witness/k00-source-calibration.py');
  const batch = read('scripts/witness/k00-source-calibration-batch.sh');

  it('keeps the master fixture closed at 997 Hz / 2 Hz / 0.70 FS', () => {
    expect(fixture).toContain('RATE = 48_000');
    expect(fixture).toContain('FREQUENCY_HZ = 997.0');
    expect(fixture).toContain('GATE_MS = 250');
    expect(fixture).toContain('DURATION_S = 180');
    expect(fixture).toContain('AMPLITUDE_FS = 0.70');
  });

  it('keeps the original source visibility law and adds only the 26 dB selection margin', () => {
    expect(reader).toContain('VIS = 10.0');
    expect(reader).toContain('M2 = 0.9');
    expect(reader).toContain('SELECTION_DB = 26.0');
    expect(reader).toContain('ratio_db >= SELECTION_DB');
    expect(reader).not.toContain('K00-06 PASS');
  });

  it('uses only the existing external SID driver method and never a historical output/source act', () => {
    expect(batch).toContain('-only-testing:"DriverUITests/K00DriverTests/testOneSample"');
    expect(batch).toContain('TEST_RUNNER_K00_SUBJECT=vpio-02-sid');
    expect(batch).toContain('TEST_RUNNER_K00_VP="$VP"');
    expect(batch).not.toContain('--act output');
    expect(batch).not.toContain('--act duplex');
    expect(batch).not.toContain('testTerminateOnly');
    const executableLines = batch
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('#'));
    expect(executableLines.some((line) => line.includes('k00-driver-batch.sh'))).toBe(false);
  });

  it('closes the ladder and does not change Mac system volume', () => {
    expect(batch).toContain('L1) GAIN="0.285714"; EFFECTIVE="0.20"');
    expect(batch).toContain('L2) GAIN="0.571429"; EFFECTIVE="0.40"');
    expect(batch).toContain('L3) GAIN="1.000000"; EFFECTIVE="0.70"');
    expect(batch).toContain('OUTPUT_VOLUME=69');
    expect(batch).not.toContain('set volume');
    expect(batch).not.toContain('output volume of');
    expect(batch).not.toContain('sort -z');
    expect(batch).not.toContain('xargs -0');
  });

  it('builds before playback and gives every row its own bounded source-player lifetime', () => {
    const build = batch.indexOf('xcodebuild build-for-testing');
    const loop = batch.indexOf('for i in $(seq 1 "$N")');
    const start = batch.indexOf('start_player "$i"');
    const run = batch.indexOf('run_test > "$LEDGER/sample-$i-xcodebuild.log"');
    const stop = batch.indexOf('stop_player "$i"', run);
    expect(build).toBeGreaterThan(-1);
    expect(loop).toBeGreaterThan(build);
    expect(start).toBeGreaterThan(loop);
    expect(run).toBeGreaterThan(start);
    expect(stop).toBeGreaterThan(run);
  });

  it('requires fixed geometry and fail-closed harness-zero custody before playback and after source settle', () => {
    expect(batch).toContain('GEOMETRY_SHA');
    expect(batch).toContain('process_guard "$i" preplay');
    expect(batch).toContain('process_guard "$i" jit');
    expect(batch).toContain('grep -ci VoiceKernelHarness');
  });

  it('does not expand idx or phase inside the same local declaration under set -u', () => {
    expect(batch).toContain('local idx="$1"\n  local phase="$2"\n  local js="$LEDGER/sample-$idx-$phase-processes.json"');
    expect(batch).not.toContain('local idx="$1" phase="$2" js="$LEDGER/sample-$idx-$phase-processes.json"');
  });

  it('passes both Python self-tests', () => {
    expect(() => execFileSync('python3', ['scripts/witness/k00-source-calibration-fixture.py', '--selftest'], { stdio: 'pipe' })).not.toThrow();
    expect(() => execFileSync('python3', ['scripts/witness/k00-source-calibration.py', '--selftest'], { stdio: 'pipe' })).not.toThrow();
  });

  it('keeps the calibration shell syntactically valid', () => {
    expect(() => execFileSync('bash', ['-n', 'scripts/witness/k00-source-calibration-batch.sh'], { stdio: 'pipe' })).not.toThrow();
  });
});
