#!/usr/bin/env node
/**
 * JARVIS-PROVIDER-01 — governed OpenCode provider registry.
 *
 * Provider/model choice is execution-attempt capability. It never expands the
 * canonical Work Unit permission envelope and never creates epistemic standing.
 * V1 is intentionally read-only: OpenCode may inspect a governed worktree, but
 * it may not mutate it until a later adapter act proves a write-safe mapping.
 */
import { loadWorkUnit, derivePermissionEnvelope } from './work-unit.mjs';

export const OPENCODE_PROVIDERS = Object.freeze({
  'qwen-local': Object.freeze({
    opencode_provider: 'ollama',
    default_model: 'qwen3-coder:30b',
    models: Object.freeze(['qwen3-coder:30b', 'maia-coder:latest', 'qwen2.5:7b']),
    external_network: false,
    metered_provider: false,
    credential_env: null,
    standing: 'local-established',
  }),
  'nemotron-nvidia': Object.freeze({
    opencode_provider: 'nvidia',
    default_model: 'nemotron-3-ultra-550b-a55b',
    models: Object.freeze(['nemotron-3-ultra-550b-a55b']),
    external_network: true,
    metered_provider: true,
    credential_env: 'NVIDIA_API_KEY',
    standing: 'external-candidate',
  }),
  'inkling-tinker': Object.freeze({
    opencode_provider: 'tinker',
    default_model: 'thinkingmachines/Inkling',
    models: Object.freeze(['thinkingmachines/Inkling']),
    external_network: true,
    metered_provider: true,
    credential_env: 'TINKER_API_KEY',
    standing: 'evaluation-only',
  }),
});

export function listProviderIds() {
  return Object.keys(OPENCODE_PROVIDERS);
}

function refused(code) {
  return Object.freeze({ ok: false, code });
}

function normalizeModel(spec, requested) {
  const value = requested || spec.default_model;
  const prefix = `${spec.opencode_provider}/`;
  return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}

export function resolveOpenCodeProvider({ providerId, model, permissionEnvelope, env = process.env }) {
  const spec = OPENCODE_PROVIDERS[providerId];
  if (!spec) return refused('UNKNOWN_PROVIDER');

  const selectedModel = normalizeModel(spec, model);
  if (!spec.models.includes(selectedModel)) return refused('MODEL_NOT_REGISTERED');

  if (!permissionEnvelope || permissionEnvelope.repo_read !== true) {
    return refused('REPO_READ_NOT_AUTHORIZED');
  }
  if (permissionEnvelope.repo_write_scope !== 'none') {
    return refused('OPENCODE_V1_READ_ONLY');
  }
  if (spec.external_network && permissionEnvelope.external_network !== true) {
    return refused('EXTERNAL_NETWORK_NOT_AUTHORIZED');
  }
  if (spec.metered_provider && permissionEnvelope.provider_spend !== true) {
    return refused('PROVIDER_SPEND_NOT_AUTHORIZED');
  }
  if (spec.credential_env && !env[spec.credential_env]) {
    return refused('PROVIDER_CREDENTIAL_MISSING');
  }

  return Object.freeze({
    ok: true,
    provider_id: providerId,
    provider_standing: spec.standing,
    model_id: selectedModel,
    model_ref: `${spec.opencode_provider}/${selectedModel}`,
    agent: 'jarvis-readonly',
    external_network: spec.external_network,
    metered_provider: spec.metered_provider,
  });
}

export function resolveWorkUnitProvider(workUnitId, providerId, model, env = process.env) {
  const workUnit = loadWorkUnit(workUnitId);
  if (!workUnit) return refused('WORK_UNIT_NOT_FOUND');
  return resolveOpenCodeProvider({
    providerId,
    model,
    permissionEnvelope: derivePermissionEnvelope(workUnit),
    env,
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [command, workUnitId, providerId, model] = process.argv.slice(2);
  if (command === 'list') {
    process.stdout.write(JSON.stringify(listProviderIds()) + '\n');
  } else if (command === 'resolve' && workUnitId && providerId) {
    const result = resolveWorkUnitProvider(workUnitId, providerId, model);
    if (!result.ok) {
      process.stderr.write(`[opencode-provider] REFUSED ${result.code}\n`);
      process.exit(3);
    }
    process.stdout.write(JSON.stringify(result) + '\n');
  } else {
    process.stderr.write('usage: opencode-provider.mjs {list|resolve <work_unit_id> <provider_id> [model]}\n');
    process.exit(2);
  }
}
