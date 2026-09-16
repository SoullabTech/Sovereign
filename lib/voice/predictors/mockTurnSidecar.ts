import { decodePcm16Frame, type TurnSidecarAudio, type TurnSidecarPrediction } from './sidecarProtocol';

/** Deterministic transport witness only. It is not a turn-taking model. */
export function mockPrediction(message: TurnSidecarAudio): TurnSidecarPrediction {
  const pcm = decodePcm16Frame(message);
  let sum = 0;
  for (const sample of pcm) sum += Math.abs(sample) / 32768;
  const activity = Math.max(0, Math.min(1, sum / pcm.length));
  return {
    type: 'prediction',
    seq: message.seq,
    atMs: message.atMs,
    acousticContinue: activity,
    vad: activity,
  };
}
