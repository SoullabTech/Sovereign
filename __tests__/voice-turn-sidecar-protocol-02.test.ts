import { Buffer } from 'buffer';
import { mockPrediction } from '@/lib/voice/predictors/mockTurnSidecar';
import {
  MAX_PCM_SAMPLES_PER_FRAME,
  TURN_PREDICTOR_CHANNELS,
  TURN_PREDICTOR_PROTOCOL,
  TURN_PREDICTOR_SAMPLE_RATE,
  decodePcm16Frame,
  predictionToFrame,
  validateSidecarHello,
} from '@/lib/voice/predictors/sidecarProtocol';

function audio(samples: number[], seq = 1) {
  const buf = Buffer.alloc(samples.length * 2);
  samples.forEach((v, i) => buf.writeInt16LE(v, i * 2));
  return { type: 'audio' as const, seq, atMs: 1000 + seq, pcm16leBase64: buf.toString('base64') };
}

describe('TURN-02 sidecar protocol', () => {
  const model = { provider: 'other' as const, modelId: 'test', weightLicense: 'INTERNAL-TEST-ONLY' };

  it('pins mono 16 kHz v1 handshake with model provenance', () => {
    expect(validateSidecarHello({ type: 'hello', protocol: TURN_PREDICTOR_PROTOCOL, sampleRateHz: TURN_PREDICTOR_SAMPLE_RATE, channels: TURN_PREDICTOR_CHANNELS, model }).model).toEqual(model);
  });

  it('decodes bounded PCM16LE frames exactly', () => {
    expect(Array.from(decodePcm16Frame(audio([-32768, -1, 0, 1, 32767])))).toEqual([-32768, -1, 0, 1, 32767]);
  });

  it('refuses oversized or malformed audio frames', () => {
    expect(() => decodePcm16Frame(audio(Array(MAX_PCM_SAMPLES_PER_FRAME + 1).fill(0)))).toThrow(/large/);
    expect(() => decodePcm16Frame({ type: 'audio', seq: 1, atMs: 1, pcm16leBase64: Buffer.from([1]).toString('base64') })).toThrow(/even/);
  });

  it('converts validated prediction frames without floor policy', () => {
    const frame = predictionToFrame({ type: 'prediction', seq: 4, atMs: 1234, p_now: 0.3, p_future: 0.7, vad: 0.5 }, model);
    expect(frame).toMatchObject({ atMs: 1234, pNow: 0.3, pFuture: 0.7, vad: 0.5, model });
    expect(frame).not.toHaveProperty('decision');
  });

  it('mock is deterministic plumbing only', () => {
    expect(mockPrediction(audio([0, 0, 0], 2))).toMatchObject({ seq: 2, p_now: 0, p_future: 0, vad: 0 });
    const a = mockPrediction(audio([16384, -16384], 3));
    expect(a.p_now).toBe(0.5);
    expect(a.p_future).toBe(0.5);
  });
});
