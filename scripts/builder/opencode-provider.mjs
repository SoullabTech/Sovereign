#!/usr/bin/env node
/**
 * JARVIS-PROVIDER — governed model-provider registry.
 *
 * Provider/model choice is execution-attempt capability. It never expands the
 * canonical Work Unit permission envelope and never creates epistemic standing.
 * V1 is intentionally read-only. Execution transport is explicit per provider;
 * provider registration never grants repository mutation or external authority.
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
    execution_adapter: 'opencode',
  }),
  'nemotron-nvidia': Object.freeze({
    opencode_provider: 'nvidia',
    default_model: 'nvidia/nemotron-3-ultra-550b-a55b',
    models: Object.freeze(['nvidia/nemotron-3-ultra-550b-a55b']),
    external_network: true,
    metered_provider: true,
    credential_env: 'NVIDIA_API_KEY',
    standing: 'external-candidate',
    execution_adapter: 'opencode',
  }),
  'nemotron-zen': Object.freeze({
    opencode_provider: 'opencode',
    default_model: 'nemotron-3-ultra-free',
    models: Object.freeze(['nemotron-3-ultra-free', 'nemotron-3.5-lightning-free']),
    external_network: true,
    metered_provider: false,
    credential_env: null,
    standing: 'interactive-only',
    delegation_supported: false,
    execution_adapter: 'opencode-interactive',
  }),
  'nemotron-tinker': Object.freeze({
    opencode_provider: 'tinker',
    default_model: 'nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16',
    models: Object.freeze([
      'nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16',
      'nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16',
    ]),
    external_network: true,
    metered_provider: true,
    credential_env: 'TINKER_API_KEY',
    standing: 'external-candidate',
    execution_adapter: 'tinker-direct',
  }),
  'inkling-tinker': Object.freeze({
    opencode_provider: 'tinker',
    default_model: 'thinkingmachines/Inkling-Small',
    models: Object.freeze([
      'thinkingmachines/Inkling-Small',
      'thinkingmachines/Inkling',
    ]),
    external_network: true,
    metered_provider: true,
    credential_env: 'TINKER_API_KEY',
    standing: 'evaluation-only',
    execution_adapter: 'tinker-direct',
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
  if (spec.models.includes(value)) return value;
  const prefix = `${spec.opencode_provider}/`;
  return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}

export function resolveOpenCodeProvider({
  providerId, model, permissionEnvelope, env = process.env, skipCredentialCheck = false,
}) {
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
  // OpenCode Zen Free currently rejects JARVIS's custom read-only agent and any
  // equivalent permission override with FreeTierError. Keep it registered for
  // truthful capability discovery/manual OpenCode use, but fail closed before
  // workspace acquisition for governed delegation. Do not weaken permissions to
  // satisfy a provider gate.
  if (spec.delegation_supported === false) {
    return refused('PROVIDER_AUTOMATION_UNSUPPORTED');
  }
  if (spec.metered_provider && permissionEnvelope.provider_spend !== true) {
    return refused('PROVIDER_SPEND_NOT_AUTHORIZED');
  }
  if (!skipCredentialCheck && spec.credential_env && !env[spec.credential_env]) {
    return refused('PROVIDER_CREDENTIAL_MISSING');
  }

  return Object.freeze({
    ok: true,
    provider_id: providerId,
    provider_standing: spec.standing,
    model_id: selectedModel,
    model_ref: `${spec.opencode_provider}/${selectedModel}`,
    agent: spec.execution_adapter === 'opencode' ? 'jarvis-readonly' : null,
    external_network: spec.external_network,
    metered_provider: spec.metered_provider,
    credential_env: spec.credential_env ?? null,
    execution_adapter: spec.execution_adapter,
  });
}

export function resolveWorkUnitProvider(
  workUnitId, providerId, model, env = process.env, { skipCredentialCheck = false } = {},
) {
  const workUnit = loadWorkUnit(workUnitId);
  if (!workUnit) return refused('WORK_UNIT_NOT_FOUND');
  return resolveOpenCodeProvider({
    providerId,
    model,
    permissionEnvelope: derivePermissionEnvelope(workUnit),
    env,
    skipCredentialCheck,
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [command, workUnitId, providerId, model] = process.argv.slice(2);
  if (command === 'list') {
    process.stdout.write(JSON.stringify(listProviderIds()) + '\n');
  } else if ((command === 'authorize' || command === 'resolve') && workUnitId && providerId) {
    const result = resolveWorkUnitProvider(
      workUnitId,
      providerId,
      model,
      process.env,
      { skipCredentialCheck: command === 'authorize' },
    );
    if (!result.ok) {
      process.stderr.write(`[opencode-provider] REFUSED ${result.code}\n`);
      process.exit(3);
    }
    process.stdout.write(JSON.stringify(result) + '\n');
  } else {
    process.stderr.write('usage: opencode-provider.mjs {list|authorize|resolve} <work_unit_id> <provider_id> [model]\n');
    process.exit(2);
  }
}
