import type { AcousticTurnFrame, PredictorModelIdentity } from './turnPredictorPort';

export type MaaiMonoResult = {
  p_now: number;
  p_future: number;
  vad?: number;
};

const probability = (value: number, name: string): number => {
  if (!Number.isFinite(value) || value < 0 || value > 1) throw new Error(`${name} must be in [0,1]`);
  return value;
};

/**
 * Lossless adapter from MaAI Mono-VAP's published output vocabulary into our
 * raw predictor port. No continue/yield weighting is invented here.
 */
export function adaptMaaiMonoFrame(
  result: MaaiMonoResult,
  atMs: number,
  model: PredictorModelIdentity,
): AcousticTurnFrame {
  if (model.provider !== 'maai') throw new Error('MaAI adapter requires provider=maai');
  return {
    atMs,
    pNow: probability(result.p_now, 'p_now'),
    pFuture: probability(result.p_future, 'p_future'),
    ...(result.vad == null ? {} : { vad: probability(result.vad, 'vad') }),
    model,
  };
}
