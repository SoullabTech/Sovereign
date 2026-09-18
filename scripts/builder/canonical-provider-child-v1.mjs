#!/usr/bin/env node
/**
 * E1 child-side credential custody for the existing direct Tinker adapter.
 *
 * This module runs only after the parent has completed human authorization,
 * fresh R4 admission, R5A integrity, and credential-presence checks.
 * Credential values stay in this short-lived child process.
 */
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import { invokeTinkerDirect } from './tinker-direct.mjs';

export const CANONICAL_PROVIDER_CHILD_VERSION = 'E1-CHILD.v1';

export function readTinkerCredentialV1({
  env = process.env,
  platform = process.platform,
  execFileSyncImpl = execFileSync,
} = {}) {
  if (env.TINKER_API_KEY) return { value: env.TINKER_API_KEY, source: 'environment' };
  if (platform !== 'darwin') return { value: null, source: null };

  try {
    const account = env.USER || os.userInfo().username;
    const value = String(execFileSyncImpl('/usr/bin/security', [
      'find-generic-password',
      '-a', account,
      '-s', 'soullab.tinker.api',
      '-w',
    ], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }) || '').trim();
    return value ? { value, source: 'keychain' } : { value: null, source: null };
  } catch {
    return { value: null, source: null };
  }
}

export async function runCanonicalProviderChildV1({
  adapter_id,
  model_id,
  prompt,
  env = process.env,
  platform = process.platform,
  execFileSyncImpl = execFileSync,
  invokeTinker = invokeTinkerDirect,
} = {}) {
  if (adapter_id !== 'tinker-direct') {
    throw new Error('CANONICAL_PROVIDER_CHILD_ADAPTER_UNSUPPORTED');
  }
  if (typeof model_id !== 'string' || !model_id.trim()) {
    throw new Error('MODEL_ID_REQUIRED');
  }
  if (typeof prompt !== 'string' || !prompt) {
    throw new Error('PROMPT_REQUIRED');
  }

  const credential = readTinkerCredentialV1({ env, platform, execFileSyncImpl });
  if (!credential.value) throw new Error('PROVIDER_CREDENTIAL_MISSING');

  const result = await invokeTinker({
    model: model_id,
    prompt,
    apiKey: credential.value,
  });
  return {
    child_version: CANONICAL_PROVIDER_CHILD_VERSION,
    credential_source: credential.source,
    result,
  };
}

async function readStdin() {
  let value = '';
  for await (const chunk of process.stdin) value += chunk;
  return value;
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const adapterId = process.argv[2];
  const modelId = process.argv[3];
  try {
    const prompt = await readStdin();
    const out = await runCanonicalProviderChildV1({
      adapter_id: adapterId,
      model_id: modelId,
      prompt,
    });
    process.stdout.write(JSON.stringify(out) + '\n');
  } catch (error) {
    const code = error instanceof Error ? error.message : 'CANONICAL_PROVIDER_CHILD_ERROR';
    process.stderr.write('[canonical-provider-child] REFUSED ' + code + '\n');
    process.exit(4);
  }
}
