/** @jest-environment node */

import { ELEMENTAL_ALCHEMY_SELECTION_CONTRACT } from '../GovernedSelectionContract';
import { assertGovernedEmbeddingModelAttestation } from '../GovernedEmbeddingModelAttestation';

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  jest.restoreAllMocks();
});

test('exact Ollama model digest passes runtime attestation', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      models: [{
        name: 'nomic-embed-text:latest',
        digest: ELEMENTAL_ALCHEMY_SELECTION_CONTRACT.vectorModelDigest,
      }],
    }),
  }) as any;

  await expect(assertGovernedEmbeddingModelAttestation(ELEMENTAL_ALCHEMY_SELECTION_CONTRACT)).resolves.toEqual({
    name: 'nomic-embed-text:latest',
    digest: ELEMENTAL_ALCHEMY_SELECTION_CONTRACT.vectorModelDigest,
  });
});

test('same model name with substituted weights fails attestation', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      models: [{ name: 'nomic-embed-text:latest', digest: '0'.repeat(64) }],
    }),
  }) as any;

  await expect(assertGovernedEmbeddingModelAttestation(ELEMENTAL_ALCHEMY_SELECTION_CONTRACT))
    .rejects.toThrow(/embedding-model attestation failed/);
});

test('missing governed model fails attestation', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ models: [{ name: 'other-model:latest', digest: '1'.repeat(64) }] }),
  }) as any;

  await expect(assertGovernedEmbeddingModelAttestation(ELEMENTAL_ALCHEMY_SELECTION_CONTRACT))
    .rejects.toThrow(/embedding-model attestation failed/);
});

test('Ollama tag endpoint failure fails attestation', async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503 }) as any;

  await expect(assertGovernedEmbeddingModelAttestation(ELEMENTAL_ALCHEMY_SELECTION_CONTRACT))
    .rejects.toThrow(/Ollama tags HTTP 503/);
});
