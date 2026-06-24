/**
 * Self-test for the Boundary Audit field-capture hook (lib/ai/fieldCapture.ts).
 *
 * Proves, with synthetic data only (NO model call, NO member data):
 *   1. Flag gating  — capture is a no-op unless MAIA_FIELD_CAPTURE is set.
 *   2. Happy path   — a normal turn is written exactly once, with redacted member id.
 *   3. Sanctuary    — meta.sanctuary=true is NEVER written (Invariant #6).
 *   4. Sanctuary    — a prompt carrying the sanctuary marker is NEVER written.
 *   5. No leak      — no sanctuary content reaches the file.
 *
 * The flag is read live per call, so one process can exercise OFF then ON.
 *
 * Run:  npx tsx scripts/repro/field-capture-selftest.ts
 */

import { promises as fs } from 'fs';
import path from 'path';
import { captureFieldPackage } from '../../lib/ai/fieldCapture';

const TEST_DIR = 'artifacts/field-capture/_selftest';

const fakeResult = () =>
  ({
    text: 'synthetic response',
    provider: { provider: 'anthropic', model: 'claude-sonnet-4-5', mode: 'full', latencyMs: 12 },
  }) as any;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function readLines(): Promise<string[]> {
  const abs = path.resolve(process.cwd(), TEST_DIR);
  let files: string[] = [];
  try {
    files = (await fs.readdir(abs)).filter((f) => f.endsWith('.jsonl'));
  } catch {
    return [];
  }
  const out: string[] = [];
  for (const f of files) {
    const txt = await fs.readFile(path.join(abs, f), 'utf8');
    out.push(...txt.split('\n').filter(Boolean));
  }
  return out;
}

async function main() {
  process.env.MAIA_FIELD_CAPTURE_DIR = TEST_DIR;
  await fs.rm(path.resolve(process.cwd(), TEST_DIR), { recursive: true, force: true });

  let failures = 0;
  const check = (name: string, ok: boolean) => {
    console.log(`${ok ? '✅' : '❌'} ${name}`);
    if (!ok) failures++;
  };

  // ── 1. Flag OFF → no-op ──────────────────────────────────────────────────
  process.env.MAIA_FIELD_CAPTURE = '0';
  captureFieldPackage(
    { systemPrompt: 'off-path prompt', userInput: 'hi', meta: { coreProcessing: true } },
    fakeResult(),
  );
  await sleep(120);
  check('flag OFF writes nothing', (await readLines()).length === 0);

  // ── 2-4. Flag ON ─────────────────────────────────────────────────────────
  process.env.MAIA_FIELD_CAPTURE = '1';

  captureFieldPackage(
    { systemPrompt: 'NORMAL assembled field', userInput: 'how are you', meta: { fastProcessing: true, userId: 'abcd1234efgh5678' } },
    fakeResult(),
  );
  captureFieldPackage(
    { systemPrompt: 'SANCTUARY by flag', userInput: 'secret', meta: { coreProcessing: true, sanctuary: true } },
    fakeResult(),
  );
  captureFieldPackage(
    { systemPrompt: 'preamble... This is a sanctuary session. The user has chosen NOT to...', userInput: 'secret', meta: { coreProcessing: true } },
    fakeResult(),
  );
  await sleep(150);

  const lines = await readLines();
  check('flag ON writes exactly the 1 non-sanctuary turn', lines.length === 1);

  if (lines.length === 1) {
    const rec = JSON.parse(lines[0]);
    check('tier inferred = fast', rec.tier === 'fast');
    check('member id stored as 8-char prefix only', rec.memberIdPrefix === 'abcd1234');
    check('field content present (replay payload)', rec.field?.systemPrompt === 'NORMAL assembled field');
    check('record sanctuary flag = false', rec.sanctuary === false);
  }

  check(
    'no sanctuary content leaked to file',
    !lines.join('\n').includes('SANCTUARY by flag') && !lines.join('\n').includes('sanctuary session'),
  );

  await fs.rm(path.resolve(process.cwd(), TEST_DIR), { recursive: true, force: true });
  console.log(failures === 0 ? '\n🟢 ALL PASS' : `\n🔴 ${failures} FAILURE(S)`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error('selftest crashed:', e);
  process.exit(1);
});
