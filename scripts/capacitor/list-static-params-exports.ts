/**
 * CLI for scripts/capacitor-patch-routes.sh.
 *
 * Reads newline-separated file paths on stdin, parses each one, and prints
 * (one per line, verbatim) every path whose module actually exports
 * `generateStaticParams`. Paths that do not are simply omitted.
 *
 *   find app -name page.tsx | npx tsx scripts/capacitor/list-static-params-exports.ts
 *
 * Exit status: 0 on success; non-zero if any listed file cannot be read, so
 * the shell caller (under `set -e`) aborts the patch instead of proceeding on
 * an incomplete classification. An unreadable page must never be classified
 * by omission.
 */

import { readFileSync } from 'node:fs';
import { exportsGenerateStaticParams } from './staticParamsExport';

function main(): void {
  const input = readFileSync(0, 'utf8');
  const paths = input.split('\n').map((l) => l.trim()).filter(Boolean);

  let failures = 0;
  for (const path of paths) {
    let source: string;
    try {
      source = readFileSync(path, 'utf8');
    } catch (err) {
      failures += 1;
      process.stderr.write(`[static-params] cannot read ${path}: ${String(err)}\n`);
      continue;
    }
    if (exportsGenerateStaticParams(source, path)) {
      process.stdout.write(`${path}\n`);
    }
  }

  if (failures > 0) {
    process.stderr.write(`[static-params] ${failures} file(s) unreadable — aborting\n`);
    process.exit(1);
  }
}

main();
