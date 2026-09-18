#!/usr/bin/env node
/**
 * JARVIS-PROVIDER-01 proof.
 * Exercises the real ain-delegate.sh OpenCode lane against a stub opencode binary.
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
mkdirSync(AIN_HOME, { recursive: true });
mkdirSync(WORKTREES_ROOT, { recursive: true });
mkdirSync(FAKE_BIN, { recursive: true });

writeFileSync(path.join(FAKE_BIN, 'opencode'), `#!/bin/sh
printf '%s\\n' "$@" > "$STUB_OPENCODE_ARGS"
printf 'stub-opencode-ok\\n'
exit 0
`);
chmodSync(path.join(FAKE_BIN, 'opencode'), 0o755);

writeFileSync(path.join(FAKE_BIN, 'security'), `#!/bin/sh
printf '%s\\n' "$@" >> "$STUB_SECURITY_ARGS"
[ -n "${STUB_SECURITY_SECRET:-}" ] || exit 44
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
      && inkling.model_ref === 'tinker/thinkingmachines/Inkling-Small:peft:262144:sampling-nvfp4',
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
  const run = sh(['opencode', id, 'inkling-tinker'], {
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

console.log('\n=== P5: authorized external selection remains testable without a real API call ===');
{
  const id = uid('inkling-stub');
  sh(['new', id]);
  authorizeReadOnly(id, ['network.external', 'provider.spend']);
  const run = sh(['opencode', id, 'inkling-tinker'], {
    TINKER_API_KEY: 'proof-only-not-a-real-key',
  });
  assert('authorized Inkling selection reaches only the stub OpenCode process',
    run.code === 0, `exit=${run.code} err=${run.err.slice(0, 160)}`);
  const result = JSON.parse(readFileSync(resultPath(id), 'utf8'));
  assert('Inkling model identity is durable in the result contract',
    result.model === 'tinker/thinkingmachines/Inkling-Small:peft:262144:sampling-nvfp4', result.model);
  sh(['release', id], { TINKER_API_KEY: 'proof-only-not-a-real-key' });
}

console.log('\n=== P5b: authorized Tinker may hydrate from macOS Keychain without secret leakage ===');
{
  const id = uid('inkling-keychain');
  const proofSecret = 'credential-from-keychain-stub';
  sh(['new', id]);
  authorizeReadOnly(id, ['network.external', 'provider.spend']);
  const beforeSecurity = securityLog();
  const run = sh(['opencode', id, 'inkling-tinker'], {
    TINKER_API_KEY: '',
    STUB_SECURITY_SECRET: proofSecret,
  });
  assert('authorized Tinker run reaches the stub after Keychain hydration',
    run.code === 0, `exit=${run.code} err=${run.err.slice(0, 180)}`);

  const afterSecurity = securityLog();
  assert('Keychain lookup uses the bounded Soullab Tinker service name',
    afterSecurity.length > beforeSecurity.length
      && afterSecurity.includes('find-generic-password')
      && afterSecurity.includes('soullab.tinker.api')
      && afterSecurity.includes('-w'),
    afterSecurity.slice(-320));

  const args = existsSync(ARGS_FILE) ? readFileSync(ARGS_FILE, 'utf8') : '';
  const resultText = readFileSync(resultPath(id), 'utf8');
  assert('Keychain secret never enters OpenCode args or result contract',
    !args.includes(proofSecret) && !resultText.includes(proofSecret));

  const result = JSON.parse(resultText);
  assert('Keychain-hydrated attempt preserves exact Inkling model provenance',
    result.model === 'tinker/thinkingmachines/Inkling-Small:peft:262144:sampling-nvfp4',
    result.model);
  sh(['release', id], { TINKER_API_KEY: '', STUB_SECURITY_SECRET: proofSecret });
}

console.log('\n=== P6: project OpenCode config carries no credential or default external model ===');
{
  const configText = readFileSync(path.join(REPO, 'opencode.json'), 'utf8');
  const config = JSON.parse(configText);
  assert('project config registers Ollama, NVIDIA, and Tinker without selecting a default model',
    !!config.provider?.ollama && !!config.provider?.nvidia && !!config.provider?.tinker
      && config.model === undefined);
  const tinkerModels = Object.keys(config.provider?.tinker?.models ?? {});
  assert('Tinker config carries the exact bounded Inkling + Nemotron model set',
    JSON.stringify(tinkerModels) === JSON.stringify([
      'thinkingmachines/Inkling-Small:peft:262144:sampling-nvfp4',
      'thinkingmachines/Inkling:peft:262144:sampling-nvfp4',
      'nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16',
      'nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16',
    ]), JSON.stringify(tinkerModels));
  assert('every custom Tinker model declares both context and output limits',
    Object.values(config.provider.tinker.models).every((m) =>
      Number.isInteger(m.limit?.context) && m.limit.context > 0
      && Number.isInteger(m.limit?.output) && m.limit.output > 0),
    JSON.stringify(Object.fromEntries(Object.entries(config.provider.tinker.models)
      .map(([id, m]) => [id, m.limit]))));
  const secretLikePrefixes = ['nv' + 'api-', 's' + 'k-'];
  assert('project config references environment variables instead of embedding credentials',
    configText.includes('{env:NVIDIA_API_KEY}')
      && configText.includes('{env:TINKER_API_KEY}')
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
