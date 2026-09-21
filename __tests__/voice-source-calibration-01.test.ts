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

  it('uses the frozen SID entry batch instead of mutating historical output/source acts', () => {
    expect(batch).toContain('--act entry --vp "$VP" --mode L --hold 15 --subject vpio-02-sid');
    expect(batch).not.toContain('--act output');
    expect(batch).not.toContain('--act duplex');
    expect(batch).not.toContain('testTerminateOnly');
  });

  it('closes the ladder and does not change Mac system volume', () => {
    expect(batch).toContain('L1) GAIN="0.285714"; EFFECTIVE="0.20"');
    expect(batch).toContain('L2) GAIN="0.571429"; EFFECTIVE="0.40"');
    expect(batch).toContain('L3) GAIN="1.000000"; EFFECTIVE="0.70"');
    expect(batch).toContain('OUTPUT_VOLUME=69');
    expect(batch).not.toContain('set volume');
    expect(batch).not.toContain('output volume of');
  });

  it('requires fixed geometry and fail-closed harness-zero custody before playback and after source settle', () => {
    expect(batch).toContain('GEOMETRY_SHA');
    expect(batch).toContain('preplay-processes.json');
    expect(batch).toContain('jit-processes.json');
    expect(batch.match(/grep -ci VoiceKernelHarness/g)?.length).toBeGreaterThanOrEqual(2);
  });

  it('passes both Python self-tests', () => {
    expect(() => execFileSync('python3', ['scripts/witness/k00-source-calibration-fixture.py', '--selftest'], { stdio: 'pipe' })).not.toThrow();
    expect(() => execFileSync('python3', ['scripts/witness/k00-source-calibration.py', '--selftest'], { stdio: 'pipe' })).not.toThrow();
  });

  it('keeps the calibration shell syntactically valid', () => {
    expect(() => execFileSync('bash', ['-n', 'scripts/witness/k00-source-calibration-batch.sh'], { stdio: 'pipe' })).not.toThrow();
  });
});
