import { decodePcm16Frame, type TurnSidecarAudio, type TurnSidecarPrediction } from './sidecarProtocol';

/**
 * Deterministic plumbing witness only — NOT a turn predictor.
 * Maps short-frame absolute PCM energy to a bounded number so streaming,
 * sequencing and benchmark adapters can be tested without a model or weights.
 */
export function mockPrediction(message: TurnSidecarAudio): TurnSidecarPrediction {
  const pcm = decodePcm16Frame(message);
  let sum = 0;
  for (const sample of pcm) sum += Math.abs(sample) / 32768;
  const activity = Math.max(0, Math.min(1, sum / pcm.length));
  return {
    type: 'prediction',
    seq: message.seq,
    atMs: message.atMs,
    p_now: Number(activity.toFixed(6)),
    p_future: Number(activity.toFixed(6)),
    vad: Number(activity.toFixed(6)),
  };
}
