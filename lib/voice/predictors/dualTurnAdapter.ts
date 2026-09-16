import type { AcousticEvidenceFrame, PredictorModelIdentity } from './turnPredictorPort';

export type DualTurnResult = {
  eot: number;
  userVad?: number;
  userFutureActivity: readonly [number, number, number, number];
};

const probability = (value: number, name: string): number => {
  if (!Number.isFinite(value) || value < 0 || value > 1) throw new Error(`${name} must be in [0,1]`);
  return value;
};

/**
 * DualTurn exposes EOT directly and user FVAD over 0-240/240-640/640-1200/1200-2000ms.
 * Yield evidence is the published EOT probability. Continue evidence is the maximum
 * published future-user-activity probability across the 2s horizon. This aggregation
 * is explicit and benchmarkable; the arbiter still owns all policy.
 */
export function adaptDualTurnFrame(
  result: DualTurnResult,
  atMs: number,
  model: PredictorModelIdentity,
): AcousticEvidenceFrame {
  if (model.provider !== 'dualturn') throw new Error('DualTurn adapter requires provider=dualturn');
  const future = result.userFutureActivity.map((v, i) => probability(v, `fvad[${i}]`));
  return {
    atMs,
    acousticContinue: Math.max(...future),
    acousticYield: probability(result.eot, 'eot'),
    ...(result.userVad == null ? {} : { vad: probability(result.userVad, 'vad') }),
    model,
  };
}
