/**
 * TURN-02 predictor boundary.
 *
 * Predictors produce evidence. They never own transcript commit or floor transfer.
 * Raw model outputs stay distinct from arbiter policy so calibration can be
 * benchmarked without silently changing the meaning of a model probability.
 */
export type PredictorModelIdentity = {
  provider: 'maai' | 'kyutai' | 'dualturn' | 'other';
  modelId: string;
  modelVersion?: string;
  weightLicense: string;
};

export type PredictorSampleRateHz = 16000 | 24000;

export type AcousticTurnFrame = {
  atMs: number;
  pNow: number;
  pFuture: number;
  vad?: number;
  model: PredictorModelIdentity;
};


export type AcousticEvidenceFrame = {
  atMs: number;
  acousticContinue?: number;
  acousticYield?: number;
  vad?: number;
  backchannel?: number;
  model: PredictorModelIdentity;
};

export type SemanticTurnFrame = {
  atMs: number;
  endOfTurn: number;
  horizonMs: number;
  model: PredictorModelIdentity;
};

export interface AcousticTurnPredictorPort {
  readonly sampleRateHz: PredictorSampleRateHz;
  pushPcm16(samples: Int16Array, atMs: number): void;
  latest(): AcousticTurnFrame | null;
  reset(): void;
}

export interface SemanticTurnPredictorPort {
  latest(): SemanticTurnFrame | null;
  reset(): void;
}
