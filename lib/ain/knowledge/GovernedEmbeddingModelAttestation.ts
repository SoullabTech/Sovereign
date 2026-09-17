import type { GovernedSelectionContract } from './GovernedSelectionContract';

interface OllamaTagModel {
  name?: string;
  model?: string;
  digest?: string;
}

export interface GovernedEmbeddingModelAttestationResult {
  readonly name: string;
  readonly digest: string;
}

/**
 * Runtime attestation of the exact local embedding-model artifact. The model name
 * alone is not enough because an Ollama tag can be repointed to different weights.
 * No cache: a model substitution must be able to turn the next governed retrieval red.
 */
export async function assertGovernedEmbeddingModelAttestation(
  contract: GovernedSelectionContract,
): Promise<GovernedEmbeddingModelAttestationResult> {
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const timeoutMs = Math.min(Number(process.env.OLLAMA_EMBED_TIMEOUT_MS || 2000), 5000);
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/tags`, {
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) {
    throw new Error(`governed embedding-model attestation failed: Ollama tags HTTP ${response.status}`);
  }

  const payload = await response.json() as { models?: OllamaTagModel[] };
  const model = (payload.models || []).find((candidate) => {
    const names = [candidate.name, candidate.model].filter(Boolean) as string[];
    return names.some((name) =>
      name === contract.vectorModel || name.startsWith(`${contract.vectorModel}:`),
    );
  });
  const digest = model?.digest || '';
  if (!model || digest !== contract.vectorModelDigest) {
    throw new Error(
      `governed embedding-model attestation failed for ${contract.vectorModel} ` +
      `(digest=${digest || 'missing'})`,
    );
  }

  return {
    name: model.name || model.model || contract.vectorModel,
    digest,
  };
}
