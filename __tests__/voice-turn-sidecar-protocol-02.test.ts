import { Buffer } from 'buffer';
import { mockPrediction } from '@/lib/voice/predictors/mockTurnSidecar';
import {
  MAX_PCM_SAMPLES_PER_FRAME,
  TURN_PREDICTOR_CHANNELS,
  TURN_PREDICTOR_PROTOCOL,
  TURN_PREDICTOR_SAMPLE_RATES,
  decodePcm16Frame,
  predictionToEvidenceFrame,
  validateSidecarHello,
} from '@/lib/voice/predictors/sidecarProtocol';

function audio(samples: number[], seq = 1) {
  const buf = Buffer.alloc(samples.length * 2);
  samples.forEach((v, i) => buf.writeInt16LE(v, i * 2));
  return { type: 'audio' as const, seq, atMs: 1000 + seq, pcm16leBase64: buf.toString('base64') };
}

describe('TURN-02 sidecar protocol v2', () => {
  const model = { provider: 'other' as const, modelId: 'test', weightLicense: 'INTERNAL-TEST-ONLY' };

  it('admits mono 16 kHz and 24 kHz handshakes with model provenance', () => {
    expect(TURN_PREDICTOR_SAMPLE_RATES).toEqual([16000, 24000]);
    for (const sampleRateHz of TURN_PREDICTOR_SAMPLE_RATES) {
      expect(validateSidecarHello({ type: 'hello', protocol: TURN_PREDICTOR_PROTOCOL, sampleRateHz, channels: TURN_PREDICTOR_CHANNELS, frameSamples: sampleRateHz === 24000 ? 1920 : 1280, model }).model).toEqual(model);
    }
  });

  it('refuses undeclared audio rates', () => {
    expect(() => validateSidecarHello({ type: 'hello', protocol: TURN_PREDICTOR_PROTOCOL, sampleRateHz: 48000 as 24000, channels: TURN_PREDICTOR_CHANNELS, frameSamples: 1920, model })).toThrow(/audio contract/);
  });


  it('requires a bounded model-declared frame size', () => {
    expect(() => validateSidecarHello({ type: 'hello', protocol: TURN_PREDICTOR_PROTOCOL, sampleRateHz: 24000, channels: 1, frameSamples: 0, model })).toThrow(/frameSamples/);
    expect(() => validateSidecarHello({ type: 'hello', protocol: TURN_PREDICTOR_PROTOCOL, sampleRateHz: 24000, channels: 1, frameSamples: MAX_PCM_SAMPLES_PER_FRAME + 1, model })).toThrow(/frameSamples/);
  });

  it('decodes bounded PCM16LE frames exactly', () => {
    expect(Array.from(decodePcm16Frame(audio([-32768, -1, 0, 1, 32767])))).toEqual([-32768, -1, 0, 1, 32767]);
  });

  it('refuses oversized or malformed audio frames', () => {
    expect(() => decodePcm16Frame(audio(Array(MAX_PCM_SAMPLES_PER_FRAME + 1).fill(0)))).toThrow(/large/);
    expect(() => decodePcm16Frame({ type: 'audio', seq: 1, atMs: 1, pcm16leBase64: Buffer.from([1]).toString('base64') })).toThrow(/even/);
  });

  it('converts model-neutral evidence without floor policy', () => {
    const frame = predictionToEvidenceFrame({ type: 'prediction', seq: 4, atMs: 1234, acousticContinue: 0.7, acousticYield: 0.3, vad: 0.5 }, model);
    expect(frame).toMatchObject({ atMs: 1234, acousticContinue: 0.7, acousticYield: 0.3, vad: 0.5, model });
    expect(frame).not.toHaveProperty('decision');
  });

  it('requires at least one continue/yield evidence signal', () => {
    expect(() => predictionToEvidenceFrame({ type: 'prediction', seq: 1, atMs: 1, vad: 0.5 }, model)).toThrow(/continue or yield/);
  });

  it('mock is deterministic plumbing only', () => {
    expect(mockPrediction(audio([0, 0, 0], 2))).toMatchObject({ seq: 2, acousticContinue: 0, vad: 0 });
    const a = mockPrediction(audio([16384, -16384], 3));
    expect(a.acousticContinue).toBe(0.5);
    expect(a).not.toHaveProperty('acousticYield');
  });
});
