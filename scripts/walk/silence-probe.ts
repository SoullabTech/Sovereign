/**
 * Silence probe — pre-deploy walk instrument for #877 + #878.
 *
 * Claim under test: the Workbench is silent. ARCHITECTURE §8 states the
 * enforcement as "No model calls anywhere in lib/workbench/; absence is
 * auditable." This probe audits that absence two ways, because each alone
 * is weak:
 *
 *   static  — no code path in the Workbench surfaces can reach a model,
 *             clustering, synthesis, inference, or suggestion call.
 *   runtime — during the walk's time window, nothing was actually emitted.
 *
 * Static passes on its own merits. Runtime needs a window: run `window-start`
 * before the walk and `window-end` after, then `report`.
 *
 * READ-ONLY. Reads source files and log/table rows; writes only to .walk/.
 *
 * Usage:
 *   npx tsx scripts/walk/silence-probe.ts static
 *   npx tsx scripts/walk/silence-probe.ts window-start
 *   # ... perform the walk ...
 *   npx tsx scripts/walk/silence-probe.ts window-end
 *   npx tsx scripts/walk/silence-probe.ts report
 */

import { readFileSync, existsSync, readdirSync, mkdirSync, writeFileSync, statSync } from 'fs';
import { join } from 'path';
import { query } from '@/lib/db/postgres';

const ROOT = process.cwd();
const OUT = join(ROOT, '.walk');
const WINDOW = join(OUT, 'silence-window.json');

/** Surfaces the walk touches. If a model call exists, it is reachable from one of these. */
const SURFACES = [
  'lib/workbench',
  'components/book-studio/workbench',
  'app/maia/workbench',
  'app/api/book-studio/workbench',
];

/** Named by the claim: model calls, clustering, synthesis, inference, suggestion. */
const FORBIDDEN: Array<[string, RegExp]> = [
  ['model provider import', /@anthropic-ai|\bfrom\s+['"]openai['"]|ollama|@ai-sdk/i],
  ['completion call', /generateText\(|createCompletion|messages\.create\(|chat\.completions/i],
  ['embedding call', /embeddings?\s*\(|createEmbedding/i],
  ['clustering', /\bcluster\w*\s*\(/],
  ['synthesis', /\bsynthesi[sz]e\w*\s*\(/i],
  ['inference', /\binfer[A-Z]\w*\s*\(/],
  ['suggestion path', /\bsuggest[A-Z]\w*\s*\(|recommend[A-Z]\w*\s*\(/],
  ['maia service call', /maiaService|maiaOrchestrator|buildMaia\w+|WisdomRouter/],
];

/** Prose may name these concepts; only code may not perform them. */
function codeOnly(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function walkFiles(dir: string, acc: string[] = []): string[] {
  const abs = join(ROOT, dir);
  if (!existsSync(abs)) return acc;
  for (const e of readdirSync(abs)) {
    const rel = join(dir, e);
    if (statSync(join(ROOT, rel)).isDirectory()) walkFiles(rel, acc);
    else if (/\.tsx?$/.test(e) && !/__tests__/.test(rel)) acc.push(rel);
  }
  return acc;
}

function staticAudit(): boolean {
  const files = SURFACES.flatMap((s) => walkFiles(s));
  const hits: string[] = [];
  for (const f of files) {
    const src = codeOnly(readFileSync(join(ROOT, f), 'utf8'));
    for (const [label, re] of FORBIDDEN) {
      const m = src.match(re);
      if (m) hits.push(`  ${f} — ${label}: ${JSON.stringify(m[0])}`);
    }
  }
  console.log(`static audit — ${files.length} source files across ${SURFACES.length} surfaces`);
  if (hits.length === 0) {
    console.log('✅ no model, clustering, synthesis, inference, or suggestion call reachable');
    return true;
  }
  console.log(`❌ ${hits.length} reachable call(s):`);
  hits.forEach((h) => console.log(h));
  return false;
}

function windowMark(which: 'start' | 'end'): void {
  mkdirSync(OUT, { recursive: true });
  const cur = existsSync(WINDOW) ? JSON.parse(readFileSync(WINDOW, 'utf8')) : {};
  cur[which] = new Date().toISOString();
  writeFileSync(WINDOW, JSON.stringify(cur, null, 2));
  console.log(`window ${which} = ${cur[which]}`);
}

async function report(): Promise<void> {
  if (!existsSync(WINDOW)) throw new Error('no window recorded — run window-start / window-end first');
  const { start, end } = JSON.parse(readFileSync(WINDOW, 'utf8'));
  if (!start || !end) throw new Error(`incomplete window: start=${start} end=${end}`);
  console.log(`\nwalk window: ${start} → ${end}\n`);

  const ok = staticAudit();

  // Runtime: any parallel-emission or turn row inside the window means the
  // Workbench (or something during it) spoke. Expected: zero.
  const checks: Array<[string, string]> = [
    ['agent_runs (Corpus Callosum emissions)', 'SELECT count(*)::int AS n FROM agent_runs WHERE created_at BETWEEN $1 AND $2'],
    ['integration_passes', 'SELECT count(*)::int AS n FROM integration_passes WHERE created_at BETWEEN $1 AND $2'],
    ['runtime_events', 'SELECT count(*)::int AS n FROM runtime_events WHERE created_at BETWEEN $1 AND $2'],
  ];

  let runtimeClean = true;
  for (const [label, sql] of checks) {
    try {
      const r = await query<{ n: number }>(sql, [start, end]);
      const n = r.rows[0]?.n ?? 0;
      // A zero from query() can also mean the table is missing — say which.
      console.log(`  ${n === 0 ? '✅' : '❌'} ${label}: ${n}`);
      if (n > 0) runtimeClean = false;
    } catch (e) {
      console.log(`  ⚠️  ${label}: table unreadable (${(e as Error).message.slice(0, 60)}) — NOT evidence of absence`);
      runtimeClean = false;
    }
  }

  console.log(
    `\ncontainer logs for the same window (run separately — this probe does not shell out):\n` +
      `  ssh soullab@minisforum 'docker logs maia-sovereign --since "${start}" 2>&1 | grep -Ei "maia|anthropic|model|cluster|synthes|infer"'\n`,
  );

  console.log(ok && runtimeClean ? '✅ SILENT' : '❌ NOT PROVEN SILENT');
  process.exit(ok && runtimeClean ? 0 : 1);
}

const cmd = process.argv[2];
if (cmd === 'static') process.exit(staticAudit() ? 0 : 1);
else if (cmd === 'window-start') windowMark('start');
else if (cmd === 'window-end') windowMark('end');
else if (cmd === 'report') report().catch((e) => { console.error(e.message); process.exit(1); });
else {
  console.error('usage: static | window-start | window-end | report');
  process.exit(2);
}
