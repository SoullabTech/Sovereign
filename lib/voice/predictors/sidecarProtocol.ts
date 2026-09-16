import type { AcousticEvidenceFrame, PredictorModelIdentity, PredictorSampleRateHz } from './turnPredictorPort';

export const TURN_PREDICTOR_PROTOCOL = 'maia.turn-predictor.v2' as const;
export const TURN_PREDICTOR_CHANNELS = 1 as const;
export const TURN_PREDICTOR_SAMPLE_RATES: readonly PredictorSampleRateHz[] = [16000, 24000] as const;
export const MAX_PCM_FRAME_MS = 200;
export const MAX_PCM_SAMPLES_PER_FRAME = 4800; // 200 ms @ highest admitted rate (24 kHz)

export type TurnSidecarHello = {
  type: 'hello';
  protocol: typeof TURN_PREDICTOR_PROTOCOL;
  sampleRateHz: PredictorSampleRateHz;
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

/** Model-neutral acoustic evidence. A provider may emit continue, yield, or both. */
export type TurnSidecarPrediction = {
  type: 'prediction';
  seq: number;
  atMs: number;
  acousticContinue?: number;
  acousticYield?: number;
  vad?: number;
  backchannel?: number;
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
  if (!TURN_PREDICTOR_SAMPLE_RATES.includes(message.sampleRateHz) || message.channels !== TURN_PREDICTOR_CHANNELS) throw new Error('audio contract mismatch');
  if (!message.model?.modelId || !message.model.weightLicense) throw new Error('model identity required');
  return message;
}

export function predictionToEvidenceFrame(message: TurnSidecarPrediction, model: PredictorModelIdentity): AcousticEvidenceFrame {
  if (!nonnegativeInt(message.seq) || !Number.isFinite(message.atMs)) throw new Error('invalid prediction metadata');
  const fields = [message.acousticContinue, message.acousticYield, message.vad, message.backchannel];
  if (fields.some((v) => v != null && !probability(v))) throw new Error('invalid prediction probability');
  if (message.acousticContinue == null && message.acousticYield == null) throw new Error('prediction requires continue or yield evidence');
  return {
    atMs: message.atMs,
    ...(message.acousticContinue == null ? {} : { acousticContinue: message.acousticContinue }),
    ...(message.acousticYield == null ? {} : { acousticYield: message.acousticYield }),
    ...(message.vad == null ? {} : { vad: message.vad }),
    ...(message.backchannel == null ? {} : { backchannel: message.backchannel }),
    model,
  };
}
