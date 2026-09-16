import { readFileSync } from 'fs';
import { join } from 'path';

const src = readFileSync(join(process.cwd(), 'scripts/voice/run-turn03-a2-dualturn.ts'), 'utf8');

describe('TURN-03 A2 DualTurn local witness', () => {
  it('pins exact local model custody and never downloads a model', () => {
    expect(src).toContain('/private/tmp/dualturn-shadow-candidate/stream_tick.onnx');
    expect(src).toContain('6700ea2f919b4c66355b3dafb4f91f2db9dae9e18a302b812730c04340bf819f');
    expect(src).not.toMatch(/fetch\(|https?:\/\//);
  });
  it('makes 16 to 24 kHz preprocessing explicit outside the sidecar', () => {
    expect(src).toContain('new StreamingPcm16Resampler(SOURCE_RATE, MODEL_RATE)');
    expect(src).toContain('const SOURCE_RATE = 16000');
    expect(src).toContain('const MODEL_RATE = 24000');
    expect(src).toContain("secondMicrophone: false");
  });
  it('proves streaming resampler continuity against a one-shot reference', () => {
    expect(src).toContain("throw new Error('resampler chunk continuity failed')");
    expect(src).toContain('byteIdentical: wholeHash === streamHash');
  });
  it('measures latency, resource use and open network sockets without granting authority', () => {
    expect(src).toContain("spawnSync('lsof'");
    expect(src).toContain("process.argv.includes('--paced')");
    expect(src).toContain("process.argv.includes('--long')");
    expect(src).toContain('LONG_SOURCE_SAMPLES = 512001');
    expect(src).toContain("pacing: paced ? 'realtime' : 'burst'");
    expect(src).toContain('medianRoundTrip');
    expect(src).toContain('maxRssKb');
    expect(src).toContain('canCommitTranscript: false');
    expect(src).toContain('canAlterEndpointing: false');
  });
});
