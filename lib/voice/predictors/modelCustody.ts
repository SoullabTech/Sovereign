import type { PredictorModelIdentity } from './turnPredictorPort';

export type PredictorAssetCustody = {
  identity: PredictorModelIdentity;
  localWeightPath: string;
  sha256: string;
  commercialUseAllowed: boolean;
  sourceUrl?: string;
};

const SHA256 = /^[a-f0-9]{64}$/i;

/**
 * Fail-closed custody gate for predictor weights.
 *
 * A model name is not authority to download or run weights. Runtime activation
 * requires an exact local path, digest, recorded license and affirmative
 * commercial-use permission. No network fallback exists at this boundary.
 */
export function validatePredictorCustody(c: PredictorAssetCustody): PredictorAssetCustody {
  if (!c.identity.modelId.trim()) throw new Error('modelId required');
  if (!c.identity.weightLicense.trim() || c.identity.weightLicense === 'UNVERIFIED') {
    throw new Error('verified weight license required');
  }
  if (!c.commercialUseAllowed) throw new Error('commercial-use permission required');
  if (!c.localWeightPath.startsWith('/')) throw new Error('absolute localWeightPath required');
  if (!SHA256.test(c.sha256)) throw new Error('sha256 required');
  if (/^https?:\/\//i.test(c.localWeightPath)) throw new Error('network weight path forbidden');
  return c;
}
