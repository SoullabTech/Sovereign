import type { AcousticTurnFrame, PredictorModelIdentity } from './turnPredictorPort';

export const TURN_PREDICTOR_PROTOCOL = 'maia.turn-predictor.v1' as const;
export const TURN_PREDICTOR_SAMPLE_RATE = 16000 as const;
export const TURN_PREDICTOR_CHANNELS = 1 as const;
export const MAX_PCM_SAMPLES_PER_FRAME = 3200; // 200 ms @ 16 kHz

export type TurnSidecarHello = {
  type: 'hello';
  protocol: typeof TURN_PREDICTOR_PROTOCOL;
  sampleRateHz: typeof TURN_PREDICTOR_SAMPLE_RATE;
  channels: typeof TURN_PREDICTOR_CHANNELS;
  model: PredictorModelIdentity;
};

export type TurnSidecarAudio = {
  type: 'audio';
  seq: number;
  atMs: number;
  pcm16leBase64: string;
};

export type TurnSidecarReset = { type: 'reset'; seq: number };
export type TurnSidecarClientMessage = TurnSidecarAudio | TurnSidecarReset;

export type TurnSidecarPrediction = {
  type: 'prediction';
  seq: number;
  atMs: number;
  p_now: number;
  p_future: number;
  vad?: number;
};

export type TurnSidecarError = {
  type: 'error';
  code: string;
  seq?: number;
};

export type TurnSidecarServerMessage = TurnSidecarHello | TurnSidecarPrediction | TurnSidecarError;

const probability = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1;
const nonnegativeInt = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 0;

export function decodePcm16Frame(message: TurnSidecarAudio): Int16Array {
  if (!nonnegativeInt(message.seq) || typeof message.atMs !== 'number' || !Number.isFinite(message.atMs)) throw new Error('invalid audio metadata');
  if (typeof message.pcm16leBase64 !== 'string' || message.pcm16leBase64.length === 0) throw new Error('pcm16leBase64 required');
  const bytes = Buffer.from(message.pcm16leBase64, 'base64');
  if (bytes.length === 0 || bytes.length % 2 !== 0) throw new Error('PCM16LE byte length must be positive and even');
  const samples = bytes.length / 2;
  if (samples > MAX_PCM_SAMPLES_PER_FRAME) throw new Error('PCM frame too large');
  const out = new Int16Array(samples);
  for (let i = 0; i < samples; i++) out[i] = bytes.readInt16LE(i * 2);
  return out;
}

export function validateSidecarHello(message: TurnSidecarHello): TurnSidecarHello {
  if (message.protocol !== TURN_PREDICTOR_PROTOCOL) throw new Error('protocol mismatch');
  if (message.sampleRateHz !== TURN_PREDICTOR_SAMPLE_RATE || message.channels !== TURN_PREDICTOR_CHANNELS) throw new Error('audio contract mismatch');
  if (!message.model?.modelId || !message.model.weightLicense) throw new Error('model identity required');
  return message;
}

export function predictionToFrame(message: TurnSidecarPrediction, model: PredictorModelIdentity): AcousticTurnFrame {
  if (!nonnegativeInt(message.seq) || !Number.isFinite(message.atMs)) throw new Error('invalid prediction metadata');
  if (!probability(message.p_now) || !probability(message.p_future)) throw new Error('invalid prediction probability');
  if (message.vad != null && !probability(message.vad)) throw new Error('invalid vad probability');
  return {
    atMs: message.atMs,
    pNow: message.p_now,
    pFuture: message.p_future,
    ...(message.vad == null ? {} : { vad: message.vad }),
    model,
  };
}
