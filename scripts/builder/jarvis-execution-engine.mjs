#!/usr/bin/env node
/**
 * JARVIS execution-engine adapters.
 *
 * Engine selection is deliberately orthogonal to Work Unit authority.
 * A Work Unit says what may happen; this adapter only translates that
 * permission envelope into the flags/config understood by a harness.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, rmSync, rmdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

export const ENGINES = Object.freeze(['opencode', 'rcli']);
export const DEFAULT_OPENCODE_MODEL = 'ollama/qwen2.5:7b';
export const DEFAULT_RCLI_MODEL = 'jarvis-local/qwen2.5:7b';

export function resolveRcliCommand(env = process.env, home = homedir()) {
  if (env.JARVIS_RCLI_BIN) return env.JARVIS_RCLI_BIN;
  const sourceBuild = join(home, '.local', 'bin', 'backboard-jarvis');
  return existsSync(sourceBuild) ? sourceBuild : 'backboard';
}

const ENGINE_BOUNDARY = [
  'JARVIS ENGINE BOUNDARY (higher priority than worker convenience):',
  '- Stay inside the supplied worktree.',
  '- Do not commit, push, merge, deploy, or contact production.',
  '- Do not change governance, authority, consent, security, or memory policy.',
  '- Leave edits uncommitted; JARVIS owns verification and integration.',
  '- If scope or authority is insufficient, stop and report ESCALATE_TO_CLAUDE: <reason>.',
].join('\n');

function assertScope(writeScope) {
  if (!['none', 'worktree'].includes(writeScope)) {
    throw new Error(`unsupported repo_write_scope '${writeScope}'`);
  }
}
export function openCodePermission(writeScope) {
  assertScope(writeScope);
  return {
    '*': 'deny',
    read: 'allow',
    glob: 'allow',
    grep: 'allow',
    list: 'allow',
    lsp: 'allow',
    edit: writeScope === 'worktree' ? 'allow' : 'deny',
    external_directory: 'deny',
    bash: 'deny',
    webfetch: 'deny',
    websearch: 'deny',
    task: 'deny',
    question: 'deny',
  };
}

export function buildInvocation({
  engine,
  cwd,
  prompt,
  model = null,
  writeScope = 'none',
}) {
  if (!ENGINES.includes(engine)) throw new Error(`unsupported execution engine '${engine}'`);
  if (!cwd) throw new Error('cwd is required');
  if (!prompt) throw new Error('prompt is required');
  assertScope(writeScope);

  const boundedPrompt = `${prompt}\n\n${ENGINE_BOUNDARY}`;
  if (engine === 'opencode') {
    const resolvedModel = model || DEFAULT_OPENCODE_MODEL;
    return {
      engine,
      command: 'opencode',
      model: resolvedModel,
      cwd,
      args: [
        'run', '--pure', '--format', 'json', '--dir', cwd,
        '--model', resolvedModel,
        boundedPrompt,
      ],
      env: {
        ...process.env,
        OPENCODE_DISABLE_AUTOUPDATE: '1',
        OPENCODE_AUTO_SHARE: 'false',
        OPENCODE_CONFIG_CONTENT: JSON.stringify({
          permission: openCodePermission(writeScope),
        }),
      },
    };
  }

  const resolvedModel = model || DEFAULT_RCLI_MODEL;
  const args = [
    '--cwd', cwd,
    '--format', 'json',
    '--memory', 'off',
    '--fresh',
    '--permission-mode', writeScope === 'worktree' ? 'acceptEdits' : 'manual',
    '--excluded-tools', 'Execute,WebSearch,Agent',
    '--model', resolvedModel,
  ];
  args.push('--print', boundedPrompt);
  return {
    engine,
    command: resolveRcliCommand(),
    model: resolvedModel,
    cwd,
    args,
    env: {
      ...process.env,
      BACKBOARD_NO_UPDATE_CHECK: '1',
    },
  };
}

export function probeEngine(engine) {
  if (!ENGINES.includes(engine)) throw new Error(`unsupported execution engine '${engine}'`);
  const command = engine === 'opencode' ? 'opencode' : resolveRcliCommand();
  const p = spawnSync(command, ['--version'], { encoding: 'utf8' });
  return {
    engine,
    command,
    available: p.status === 0,
    version: p.status === 0 ? String(p.stdout || p.stderr || '').trim() : null,
    error: p.status === 0 ? null : String(p.error?.message || p.stderr || 'unavailable').trim(),
  };
}

export function cleanupRcliSessionState(cwd, sessionsExistedBefore) {
  if (sessionsExistedBefore) return;
  const backboardDir = join(cwd, '.backboard');
  const sessionsDir = join(backboardDir, 'sessions');
  if (existsSync(sessionsDir)) rmSync(sessionsDir, { recursive: true, force: true });
  if (existsSync(backboardDir) && readdirSync(backboardDir).length === 0) rmdirSync(backboardDir);
}

export function runInvocation(spec) {
  const invocation = buildInvocation(spec);
  const rcliSessions = join(invocation.cwd, '.backboard', 'sessions');
  const sessionsExistedBefore = invocation.engine === 'rcli' && existsSync(rcliSessions);
  const p = spawnSync(invocation.command, invocation.args, {
    cwd: invocation.cwd,
    env: invocation.env,
    stdio: 'inherit',
  });
  if (invocation.engine === 'rcli') {
    cleanupRcliSessionState(invocation.cwd, sessionsExistedBefore);
  }
  if (p.error) {
    console.error(`[jarvis-engine] ${invocation.engine} failed to start: ${p.error.message}`);
    return 127;
  }
  return p.status ?? 1;
}
function opt(argv, name) {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : null;
}

function cli() {
  const argv = process.argv.slice(2);
  const command = argv[0];

  if (command === 'probe') {
    const engine = argv[1];
    process.stdout.write(JSON.stringify(probeEngine(engine), null, 2) + '\n');
    return 0;
  }

  if (command === 'run') {
    const engine = opt(argv, '--engine');
    const cwd = opt(argv, '--cwd');
    const prompt = opt(argv, '--prompt');
    const model = opt(argv, '--model');
    const writeScope = opt(argv, '--write-scope') || 'none';
    return runInvocation({ engine, cwd, prompt, model, writeScope });
  }

  console.error('usage: jarvis-execution-engine.mjs probe <opencode|rcli>');
  console.error('   or: jarvis-execution-engine.mjs run --engine <engine> --cwd <dir> --write-scope <none|worktree> [--model <id>] --prompt <text>');
  return 2;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = cli();
}
