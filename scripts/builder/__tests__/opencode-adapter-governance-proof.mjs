#!/usr/bin/env node
/**
 * JARVIS-PROVIDER-01 proof.
 * Exercises the real ain-delegate.sh OpenCode + direct-Tinker lanes against local stubs.
 * No NVIDIA/Tinker request is made; fake keys only prove the local authorization seam.
 */
import {
  mkdtempSync, mkdirSync, writeFileSync, chmodSync, readFileSync, rmSync, existsSync,
} from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { listProviderIds, resolveOpenCodeProvider } from '../opencode-provider.mjs';

let passed = 0, failed = 0;
const assert = (name, condition, detail = '') => {
  if (condition) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; console.log(`  FAIL  ${name}`); }
  if (detail) console.log(`          ${detail}`);
};

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const DELEGATE = path.join(REPO, 'scripts', 'ain-delegate.sh');
const TMP = mkdtempSync(path.join(os.tmpdir(), 'jarvis-opencode-proof-'));
const AIN_HOME = path.join(TMP, 'ain');
const WORKTREES_ROOT = path.join(TMP, 'worktrees');
const FAKE_BIN = path.join(TMP, 'bin');
const ARGS_FILE = path.join(TMP, 'opencode-args.txt');
const SECURITY_ARGS_FILE = path.join(TMP, 'security-args.txt');
const OPENCODE_ENV_STATUS_FILE = path.join(TMP, 'opencode-env-status.txt');
const TINKER_ARGS_FILE = path.join(TMP, 'tinker-args.txt');
const TINKER_ENV_STATUS_FILE = path.join(TMP, 'tinker-env-status.txt');
const TINKER_PROMPT_FILE = path.join(TMP, 'tinker-prompt.txt');
const REAL_NODE = process.execPath;
mkdirSync(AIN_HOME, { recursive: true });
mkdirSync(WORKTREES_ROOT, { recursive: true });
mkdirSync(FAKE_BIN, { recursive: true });

writeFileSync(path.join(FAKE_BIN, 'opencode'), `#!/bin/sh
printf '%s\\n' "$@" > "$STUB_OPENCODE_ARGS"
: > "$STUB_OPENCODE_ENV_STATUS"
if [ -n "$TINKER_API_KEY" ]; then
  printf 'TINKER_API_KEY_PRESENT\\n' >> "$STUB_OPENCODE_ENV_STATUS"
else
  printf 'TINKER_API_KEY_ABSENT\\n' >> "$STUB_OPENCODE_ENV_STATUS"
fi
if [ -n "$NVIDIA_API_KEY" ]; then
  printf 'NVIDIA_API_KEY_PRESENT\\n' >> "$STUB_OPENCODE_ENV_STATUS"
else
  printf 'NVIDIA_API_KEY_ABSENT\\n' >> "$STUB_OPENCODE_ENV_STATUS"
fi
printf 'stub-opencode-ok\\n'
exit 0
`);
chmodSync(path.join(FAKE_BIN, 'opencode'), 0o755);

writeFileSync(path.join(FAKE_BIN, 'node'), `#!/bin/sh
if [ "$1" = "$STUB_TINKER_DIRECT_SCRIPT" ]; then
  shift
  printf '%s\n' "$@" > "$STUB_TINKER_ARGS"
  if [ -n "$TINKER_API_KEY" ]; then
    printf 'TINKER_API_KEY_PRESENT\n' > "$STUB_TINKER_ENV_STATUS"
  else
    printf 'TINKER_API_KEY_ABSENT\n' > "$STUB_TINKER_ENV_STATUS"
  fi
  cat > "$STUB_TINKER_PROMPT"
  printf '{"provider":"tinker","transport":"anthropic-compatible","model":"%s","text":"stub-direct-ok","usage":null,"stop_reason":"end_turn"}\n' "$1"
  exit 0
fi
exec "$REAL_NODE" "$@"
`);
chmodSync(path.join(FAKE_BIN, 'node'), 0o755);

writeFileSync(path.join(FAKE_BIN, 'security'), `#!/bin/sh
printf '%s\\n' "$@" >> "$STUB_SECURITY_ARGS"
[ -n "$STUB_SECURITY_SECRET" ] || exit 44
printf '%s\\n' "$STUB_SECURITY_SECRET"
`);
chmodSync(path.join(FAKE_BIN, 'security'), 0o755);

const securityLog = () => existsSync(SECURITY_ARGS_FILE)
  ? readFileSync(SECURITY_ARGS_FILE, 'utf8')
  : '';

const baseEnv = (extra = {}) => ({
  ...process.env,
  ...extra,
  AIN_DELEGATION_HOME: AIN_HOME,
  AIN_WORKTREES_ROOT: WORKTREES_ROOT,
  PATH: `${FAKE_BIN}:${process.env.PATH}`,
  STUB_OPENCODE_ARGS: ARGS_FILE,
  STUB_SECURITY_ARGS: SECURITY_ARGS_FILE,
  STUB_OPENCODE_ENV_STATUS: OPENCODE_ENV_STATUS_FILE,
  STUB_TINKER_ARGS: TINKER_ARGS_FILE,
  STUB_TINKER_ENV_STATUS: TINKER_ENV_STATUS_FILE,
  STUB_TINKER_PROMPT: TINKER_PROMPT_FILE,
  STUB_TINKER_DIRECT_SCRIPT: path.join(REPO, 'scripts', 'builder', 'tinker-direct.mjs'),
  REAL_NODE,
});

const sh = (args, extra = {}) => {
  try {
    return {
      code: 0,
      out: execFileSync('bash', [DELEGATE, ...args], {
        encoding: 'utf8', env: baseEnv(extra), stdio: ['ignore', 'pipe', 'pipe'],
      }),
      err: '',
    };
  } catch (e) {
    return {
      code: e.status ?? 1,
      out: (e.stdout ?? '').toString(),
      err: (e.stderr ?? '').toString(),
    };
  }
};

const packetPath = (id) => path.join(AIN_HOME, 'packets', `${id}.json`);
const resultPath = (id) => path.join(AIN_HOME, 'results', `${id}.json`);
const readPacket = (id) => JSON.parse(readFileSync(packetPath(id), 'utf8'));
const writePacket = (id, patch) => {
  const raw = readPacket(id);
  writeFileSync(packetPath(id), JSON.stringify({ ...raw, ...patch }, null, 2));
};

const authorizeReadOnly = (id, extraActs = []) => writePacket(id, {
  authorized_acts: ['repo.read', ...extraActs],
  not_authorized_acts: [
    'repo.write:worktree', 'production.read', 'production.write',
    'deploy', 'authority.change',
    ...(extraActs.includes('network.external') ? [] : ['network.external']),
    ...(extraActs.includes('provider.spend') ? [] : ['provider.spend']),
  ],
});

const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

console.log('\n=== P1: registry is explicit and bounded ===');
{
  const ids = listProviderIds();
  assert('exactly the five intended provider classes are registered',
    JSON.stringify(ids) === JSON.stringify(['qwen-local', 'nemotron-nvidia', 'nemotron-zen', 'nemotron-tinker', 'inkling-tinker']),
    JSON.stringify(ids));

  const local = resolveOpenCodeProvider({
    providerId: 'qwen-local',
    permissionEnvelope: {
      repo_read: true, repo_write_scope: 'none', external_network: false, provider_spend: false,
    },
    env: {},
  });
  assert('local Qwen resolves without network, spend, or credential authority',
    local.ok && local.model_ref === 'ollama/qwen3-coder:30b', JSON.stringify(local));

  const writeAttempt = resolveOpenCodeProvider({
    providerId: 'qwen-local',
    permissionEnvelope: {
      repo_read: true, repo_write_scope: 'worktree', external_network: false, provider_spend: false,
    },
    env: {},
  });
  assert('V1 refuses OpenCode mutation even for a local model',
    !writeAttempt.ok && writeAttempt.code === 'OPENCODE_V1_READ_ONLY', JSON.stringify(writeAttempt));
}

console.log('\n=== P2: external provider authority is conjunctive and fail-closed ===');
{
  const base = { repo_read: true, repo_write_scope: 'none', external_network: false, provider_spend: false };
  const noNetwork = resolveOpenCodeProvider({
    providerId: 'nemotron-nvidia', permissionEnvelope: base, env: {},
  });
  assert('Nemotron refuses before credential lookup when network is not authorized',
    noNetwork.code === 'EXTERNAL_NETWORK_NOT_AUTHORIZED', JSON.stringify(noNetwork));

  const zenNoNetwork = resolveOpenCodeProvider({
    providerId: 'nemotron-zen', permissionEnvelope: base, env: {},
  });
  assert('Zen Nemotron still requires explicit external-network authority',
    zenNoNetwork.code === 'EXTERNAL_NETWORK_NOT_AUTHORIZED', JSON.stringify(zenNoNetwork));

  const zen = resolveOpenCodeProvider({
    providerId: 'nemotron-zen',
    permissionEnvelope: { ...base, external_network: true },
    env: {},
  });
  assert('Zen Nemotron remains registered but governed automation fails closed',
    !zen.ok && zen.code === 'PROVIDER_AUTOMATION_UNSUPPORTED',
    JSON.stringify(zen));

  const noSpend = resolveOpenCodeProvider({
    providerId: 'nemotron-nvidia',
    permissionEnvelope: { ...base, external_network: true },
    env: {},
  });
  assert('network authority alone cannot authorize metered provider use',
    noSpend.code === 'PROVIDER_SPEND_NOT_AUTHORIZED', JSON.stringify(noSpend));

  const noKey = resolveOpenCodeProvider({
    providerId: 'nemotron-nvidia',
    permissionEnvelope: { ...base, external_network: true, provider_spend: true },
    env: {},
  });
  assert('network + spend still refuse when the provider credential is absent',
    noKey.code === 'PROVIDER_CREDENTIAL_MISSING', JSON.stringify(noKey));

  const directNvidia = resolveOpenCodeProvider({
    providerId: 'nemotron-nvidia',
    permissionEnvelope: { ...base, external_network: true, provider_spend: true },
    env: { NVIDIA_API_KEY: 'proof-only-not-a-real-key' },
  });
  assert('direct NVIDIA preserves the exact namespaced NIM model id',
    directNvidia.ok
      && directNvidia.model_id === 'nvidia/nemotron-3-ultra-550b-a55b'
      && directNvidia.model_ref === 'nvidia/nvidia/nemotron-3-ultra-550b-a55b',
    JSON.stringify(directNvidia));

  const tinkerNoSpend = resolveOpenCodeProvider({
    providerId: 'nemotron-tinker',
    permissionEnvelope: { ...base, external_network: true },
    env: { TINKER_API_KEY: 'proof-only-not-a-real-key' },
  });
  assert('Tinker Nemotron remains metered and refuses without spend authority',
    tinkerNoSpend.code === 'PROVIDER_SPEND_NOT_AUTHORIZED', JSON.stringify(tinkerNoSpend));

  const tinkerNemotron = resolveOpenCodeProvider({
    providerId: 'nemotron-tinker',
    permissionEnvelope: { ...base, external_network: true, provider_spend: true },
    env: { TINKER_API_KEY: 'proof-only-not-a-real-key' },
  });
  assert('Tinker Nemotron resolves after network + spend + credential',
    tinkerNemotron.ok
      && tinkerNemotron.model_ref === 'tinker/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16',
    JSON.stringify(tinkerNemotron));

  const tinkerUltra = resolveOpenCodeProvider({
    providerId: 'nemotron-tinker',
    model: 'nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16',
    permissionEnvelope: { ...base, external_network: true, provider_spend: true },
    env: { TINKER_API_KEY: 'proof-only-not-a-real-key' },
  });
  assert('Tinker Nemotron Ultra is an explicit allowlisted override',
    tinkerUltra.ok
      && tinkerUltra.model_ref === 'tinker/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16',
    JSON.stringify(tinkerUltra));

  const inkling = resolveOpenCodeProvider({
    providerId: 'inkling-tinker',
    permissionEnvelope: { ...base, external_network: true, provider_spend: true },
    env: { TINKER_API_KEY: 'proof-only-not-a-real-key' },
  });
  assert('Inkling resolves only after both grants and a credential are present',
    inkling.ok
      && inkling.model_ref === 'tinker/thinkingmachines/Inkling-Small'
      && inkling.execution_adapter === 'tinker-direct',
    JSON.stringify(inkling));
  assert('Inkling remains explicitly evaluation-only in the registry',
    inkling.provider_standing === 'evaluation-only', inkling.provider_standing);
}

console.log('\n=== P3: real delegate seam invokes governed OpenCode locally ===');
{
  const id = uid('qwen');
  sh(['new', id]);
  authorizeReadOnly(id);
  const run = sh(['opencode', id, 'qwen-local']);
  assert('read-only local OpenCode attempt completes against the stub',
    run.code === 0, `exit=${run.code} err=${run.err.slice(0, 160)}`);

  const result = JSON.parse(readFileSync(resultPath(id), 'utf8'));
  assert('attempt provenance records OpenCode and the exact provider/model reference',
    result.lane === 'opencode' && result.model === 'ollama/qwen3-coder:30b',
    `lane=${result.lane} model=${result.model}`);

  const args = readFileSync(ARGS_FILE, 'utf8');
  assert('OpenCode uses the project-scoped read-only agent',
    args.includes('--agent') && args.includes('jarvis-readonly'));
  assert('OpenCode receives an explicit session title so title generation needs no model call',
    args.includes('--title') && args.includes(`JARVIS ${id}`));
  assert('OpenCode never receives --auto from JARVIS',
    !args.split('\n').includes('--auto'), args.slice(0, 220));
  assert('the read-only prompt contains no commit instruction',
    !args.includes('commit your changes') && args.includes('READ-ONLY PROVIDER EVALUATION'));
  sh(['release', id]);
}

console.log('\n=== P4: denied external use stops before workspace acquisition or worker launch ===');
{
  const id = uid('nemotron-denied');
  sh(['new', id]);
  authorizeReadOnly(id);
  const beforeArgs = existsSync(ARGS_FILE) ? readFileSync(ARGS_FILE, 'utf8') : '';
  const run = sh(['opencode', id, 'nemotron-nvidia']);
  assert('ungranted Nemotron attempt is refused with the authority code',
    run.code === 3 && /EXTERNAL_NETWORK_NOT_AUTHORIZED/.test(run.err),
    `exit=${run.code} err=${run.err.slice(0, 160)}`);
  assert('refusal occurs before the packet gains a worktree',
    readPacket(id).worktree === null, JSON.stringify(readPacket(id).worktree));
  const afterArgs = existsSync(ARGS_FILE) ? readFileSync(ARGS_FILE, 'utf8') : '';
  assert('refused external attempt never launches OpenCode',
    afterArgs === beforeArgs);
}

console.log('\n=== P4b: Zen Free interactive capability cannot silently become JARVIS automation ===');
{
  const id = uid('zen-unsupported');
  sh(['new', id]);
  authorizeReadOnly(id, ['network.external']);
  const beforeArgs = existsSync(ARGS_FILE) ? readFileSync(ARGS_FILE, 'utf8') : '';
  const run = sh(['opencode', id, 'nemotron-zen']);
  assert('network-authorized Zen delegation refuses with provider-automation code',
    run.code === 3 && /PROVIDER_AUTOMATION_UNSUPPORTED/.test(run.err),
    `exit=${run.code} err=${run.err.slice(0, 180)}`);
  assert('Zen provider restriction is enforced before workspace acquisition',
    readPacket(id).worktree === null, JSON.stringify(readPacket(id).worktree));
  const afterArgs = existsSync(ARGS_FILE) ? readFileSync(ARGS_FILE, 'utf8') : '';
  assert('unsupported Zen delegation never launches OpenCode',
    afterArgs === beforeArgs);
}

console.log('\n=== P4c: denied Tinker spend never reads Keychain ===');
{
  const id = uid('tinker-spend-denied');
  sh(['new', id]);
  authorizeReadOnly(id, ['network.external']);
  const beforeSecurity = securityLog();
  const run = sh(['tinker', id, 'inkling-tinker'], {
    TINKER_API_KEY: '',
    STUB_SECURITY_SECRET: 'credential-from-keychain-stub',
  });
  assert('Tinker refuses missing spend authority before credential hydration',
    run.code === 3 && /PROVIDER_SPEND_NOT_AUTHORIZED/.test(run.err),
    `exit=${run.code} err=${run.err.slice(0, 180)}`);
  assert('denied spend does not read macOS Keychain',
    securityLog() === beforeSecurity, securityLog().slice(-200));
  assert('denied Tinker attempt still has no worktree',
    readPacket(id).worktree === null, JSON.stringify(readPacket(id).worktree));
}

console.log('\n=== P4d: denied NVIDIA spend never reads Keychain ===');
{
  const id = uid('nvidia-spend-denied');
  sh(['new', id]);
  authorizeReadOnly(id, ['network.external']);
  const beforeSecurity = securityLog();
  const run = sh(['opencode', id, 'nemotron-nvidia'], {
    NVIDIA_API_KEY: '',
    STUB_SECURITY_SECRET: 'credential-from-keychain-stub',
  });
  assert('NVIDIA refuses missing spend authority before credential hydration',
    run.code === 3 && /PROVIDER_SPEND_NOT_AUTHORIZED/.test(run.err),
    `exit=${run.code} err=${run.err.slice(0, 180)}`);
  assert('denied NVIDIA spend does not read macOS Keychain',
    securityLog() === beforeSecurity, securityLog().slice(-200));
  assert('denied NVIDIA attempt still has no worktree',
    readPacket(id).worktree === null, JSON.stringify(readPacket(id).worktree));
}

console.log('\n=== P5: authorized external selection remains testable without a real API call ===');
{
  const id = uid('inkling-stub');
  sh(['new', id]);
  authorizeReadOnly(id, ['network.external', 'provider.spend']);
  writePacket(id, { allowed_files: ['opencode.json'] });
  const run = sh(['tinker', id, 'inkling-tinker'], {
    TINKER_API_KEY: 'proof-only-not-a-real-key',
  });
  assert('authorized Inkling selection reaches only the stub direct-Tinker process',
    run.code === 0, `exit=${run.code} err=${run.err.slice(0, 160)}`);
  const result = JSON.parse(readFileSync(resultPath(id), 'utf8'));
  assert('Inkling model identity is durable in the result contract',
    result.lane === 'tinker' && result.model === 'tinker/thinkingmachines/Inkling-Small', result.model);
  const directPrompt = readFileSync(TINKER_PROMPT_FILE, 'utf8');
  assert('direct Tinker receives only JARVIS-bundled authorized repository evidence',
    directPrompt.includes('=== BEGIN AUTHORIZED FILE: opencode.json ===')
      && directPrompt.includes('\"$schema\"')
      && !directPrompt.includes('DO NOT SEND'));
  sh(['release', id], { TINKER_API_KEY: 'proof-only-not-a-real-key' });
}

console.log('\n=== P5b: authorized Tinker may hydrate from macOS Keychain without secret leakage ===');
{
  const id = uid('inkling-keychain');
  const proofSecret = 'credential-from-keychain-stub';
  sh(['new', id]);
  authorizeReadOnly(id, ['network.external', 'provider.spend']);
  writePacket(id, { verification_commands: ['test -z "${TINKER_API_KEY:-}"'] });
  const beforeSecurity = securityLog();
  const run = sh(['tinker', id, 'inkling-tinker'], {
    TINKER_API_KEY: '',
    STUB_SECURITY_SECRET: proofSecret,
  });
  assert('authorized Tinker run reaches the direct stub after Keychain hydration',
    run.code === 0, `exit=${run.code} err=${run.err.slice(0, 180)}`);

  const afterSecurity = securityLog();
  assert('Keychain lookup uses the bounded Soullab Tinker service name',
    afterSecurity.length > beforeSecurity.length
      && afterSecurity.includes('find-generic-password')
      && afterSecurity.includes('soullab.tinker.api')
      && afterSecurity.includes('-w'),
    afterSecurity.slice(-320));

  const args = existsSync(TINKER_ARGS_FILE) ? readFileSync(TINKER_ARGS_FILE, 'utf8') : '';
  const resultText = readFileSync(resultPath(id), 'utf8');
  assert('Keychain secret never enters worker args or result contract',
    !args.includes(proofSecret) && !resultText.includes(proofSecret));

  const envStatus = existsSync(TINKER_ENV_STATUS_FILE)
    ? readFileSync(TINKER_ENV_STATUS_FILE, 'utf8')
    : '';
  assert('Keychain credential is present in the direct Tinker worker environment',
    /TINKER_API_KEY_PRESENT/.test(envStatus), envStatus.trim());

  const result = JSON.parse(resultText);
  assert('post-worker verification cannot see the Keychain credential',
    result.test_results === 'pass', JSON.stringify({ test_results: result.test_results, evidence: result.evidence }));
  assert('Keychain-hydrated attempt preserves exact Inkling model provenance',
    result.lane === 'tinker' && result.model === 'tinker/thinkingmachines/Inkling-Small',
    result.model);
  sh(['release', id], { TINKER_API_KEY: '', STUB_SECURITY_SECRET: proofSecret });
}

console.log('\n=== P5c: authorized NVIDIA may hydrate from macOS Keychain without secret leakage ===');
{
  const id = uid('nvidia-keychain');
  const proofSecret = 'credential-from-keychain-stub';
  sh(['new', id]);
  authorizeReadOnly(id, ['network.external', 'provider.spend']);
  writePacket(id, { verification_commands: ['test -z "${NVIDIA_API_KEY:-}"'] });
  const beforeSecurity = securityLog();
  const run = sh(['opencode', id, 'nemotron-nvidia'], {
    NVIDIA_API_KEY: '',
    STUB_SECURITY_SECRET: proofSecret,
  });
  assert('authorized NVIDIA run reaches the OpenCode stub after Keychain hydration',
    run.code === 0, `exit=${run.code} err=${run.err.slice(0, 180)}`);

  const afterSecurity = securityLog();
  assert('NVIDIA Keychain lookup uses the bounded JARVIS service name',
    afterSecurity.length > beforeSecurity.length
      && afterSecurity.includes('find-generic-password')
      && afterSecurity.includes('ai.soullab.jarvis.nvidia-api-key')
      && afterSecurity.includes('-w'),
    afterSecurity.slice(-320));

  const args = existsSync(ARGS_FILE) ? readFileSync(ARGS_FILE, 'utf8') : '';
  const resultText = readFileSync(resultPath(id), 'utf8');
  assert('NVIDIA Keychain secret never enters OpenCode args or result contract',
    !args.includes(proofSecret) && !resultText.includes(proofSecret));

  const envStatus = existsSync(OPENCODE_ENV_STATUS_FILE)
    ? readFileSync(OPENCODE_ENV_STATUS_FILE, 'utf8')
    : '';
  assert('NVIDIA Keychain credential is present in the OpenCode worker environment',
    /NVIDIA_API_KEY_PRESENT/.test(envStatus), envStatus.trim());

  const result = JSON.parse(resultText);
  assert('post-worker verification cannot see the NVIDIA Keychain credential',
    result.test_results === 'pass', JSON.stringify({ test_results: result.test_results, evidence: result.evidence }));
  assert('Keychain-hydrated NVIDIA attempt preserves exact model provenance',
    result.lane === 'opencode' && result.model === 'nvidia/nvidia/nemotron-3-ultra-550b-a55b',
    result.model);
  sh(['release', id], { NVIDIA_API_KEY: '', STUB_SECURITY_SECRET: proofSecret });
}

console.log('\n=== P6: project OpenCode config carries no credential or default external model ===');
{
  const configText = readFileSync(path.join(REPO, 'opencode.json'), 'utf8');
  const config = JSON.parse(configText);
  assert('project OpenCode config contains only Ollama + NVIDIA and no Tinker transport',
    !!config.provider?.ollama && !!config.provider?.nvidia && !config.provider?.tinker
      && config.model === undefined);
  assert('project NVIDIA config uses the exact namespaced NIM model id',
    !!config.provider.nvidia.models['nvidia/nemotron-3-ultra-550b-a55b']);
  const secretLikePrefixes = ['nv' + 'api-', 's' + 'k-'];
  assert('project config references environment variables instead of embedding credentials',
    configText.includes('{env:NVIDIA_API_KEY}')
      && !configText.includes('TINKER_API_KEY')
      && secretLikePrefixes.every((prefix) => !configText.includes(prefix)));

  const agent = readFileSync(path.join(REPO, '.opencode', 'agents', 'jarvis-readonly.md'), 'utf8');
  assert('read-only agent denies mutation, shell, web, subagents, and external directories',
    /edit: deny/.test(agent) && /bash: deny/.test(agent)
      && /webfetch: deny/.test(agent) && /websearch: deny/.test(agent)
      && /task: deny/.test(agent) && /external_directory: deny/.test(agent));
}

rmSync(TMP, { recursive: true, force: true });

console.log(`\n${passed} passed · ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
