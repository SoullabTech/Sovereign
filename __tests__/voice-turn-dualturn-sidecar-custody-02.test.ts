import { readFileSync } from 'fs';
import { join } from 'path';

const src = readFileSync(join(process.cwd(), 'scripts/voice/dualturn-shadow-sidecar.py'), 'utf8');

describe('TURN-02 DualTurn shadow sidecar custody', () => {
  it('requires a local model path, exact SHA-256, and explicit model version', () => {
    expect(src).toContain('ap.add_argument("--model-path", required=True)');
    expect(src).toContain('ap.add_argument("--expected-sha256", required=True)');
    expect(src).toContain('ap.add_argument("--model-version", required=True)');
    expect(src).toContain('model SHA-256 mismatch');
  });

  it('contains no network model-resolution path', () => {
    for (const forbidden of ['huggingface_hub', 'hf_hub_download', 'requests.', 'urllib.', 'http://', 'https://']) {
      expect(src).not.toContain(forbidden);
    }
  });

  it('pins protocol v2, 24 kHz mono, and the admitted license provenance', () => {
    expect(src).toContain('PROTOCOL = "maia.turn-predictor.v2"');
    expect(src).toContain('SAMPLE_RATE = 24000');
    expect(src).toContain('FRAME_SAMPLES = 1920');
    expect(src).toContain('Apache-2.0; base Mimi CC-BY-4.0');
  });

  it('emits acoustic evidence only and has no turn-send authority', () => {
    expect(src).toContain('"acousticYield"');
    expect(src).toContain('"acousticContinue"');
    expect(src).not.toContain('onTranscript');
    expect(src).not.toContain('sendMessage');
  });
});
