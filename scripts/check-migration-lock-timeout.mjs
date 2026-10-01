#!/usr/bin/env node
/**
 * Migration lock-timeout law (candidate, 2026-10-01).
 *
 * Every migration authored after the cutoff must bound lock ACQUISITION, so a
 * DDL lock queued behind a long reader transaction times out instead of
 * stalling every later query on the table.
 *
 * Required shape, in the file itself:
 *   BEGIN;
 *   SET LOCAL lock_timeout = '<n>s';      -- before any other statement
 *   ...
 *   COMMIT;
 *
 * Why SET LOCAL after the file's own BEGIN (not plain SET):
 *   - production (scripts/run-sql-migrations.sh) runs one psql session per file,
 *     wrapped in BEGIN/COMMIT — SET LOCAL is scoped to that transaction;
 *   - bootstrap/local (scripts/apply-migrations.sh) runs ALL files in ONE psql
 *     session via \i, with no wrapper — plain SET would leak into every later
 *     migration, and SET LOCAL outside the file's own BEGIN is a no-op.
 *
 * Exemption (rare, must be stated): a line `-- lock-timeout: exempt <reason>`.
 *
 * Grandfathered: timestamped files before CUTOFF, and the frozen legacy list of
 * non-timestamped files. A NEW non-timestamped file is refused.
 *
 * Usage: node scripts/check-migration-lock-timeout.mjs [--dir database/migrations]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const CUTOFF = "20261001000000";
const here = path.dirname(fileURLToPath(import.meta.url));

/** Strip -- line comments and block comments so prose cannot satisfy or fail the law. */
function stripComments(sql) {
  return sql.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/--[^\n]*/g, " ");
}

/** Split into top-level statements, respecting $tag$ dollar-quoted bodies and '...' literals. */
function statements(sql) {
  const out = [];
  let cur = "";
  let i = 0;
  while (i < sql.length) {
    const ch = sql[i];
    if (ch === "'") {
      const end = sql.indexOf("'", i + 1);
      const j = end === -1 ? sql.length : end + 1;
      cur += sql.slice(i, j);
      i = j;
      continue;
    }
    if (ch === "$") {
      const m = /^\$[A-Za-z0-9_]*\$/.exec(sql.slice(i));
      if (m) {
        const end = sql.indexOf(m[0], i + m[0].length);
        const j = end === -1 ? sql.length : end + m[0].length;
        cur += sql.slice(i, j);
        i = j;
        continue;
      }
    }
    if (ch === ";") {
      if (cur.trim()) out.push(cur.trim());
      cur = "";
      i += 1;
      continue;
    }
    cur += ch;
    i += 1;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/** @returns {string|null} null if compliant, else the reason. */
export function checkMigration(raw) {
  if (/^[ \t]*--[ \t]*lock-timeout:[ \t]*exempt[ \t]+\S/m.test(raw)) return null;
  const stmts = statements(stripComments(raw)).map((s) => s.replace(/\s+/g, " ").trim());
  if (stmts.length === 0) return "empty migration";
  if (!/^BEGIN( TRANSACTION| WORK)?$/i.test(stmts[0])) {
    return "first statement must be the file's own BEGIN (SET LOCAL is a no-op outside a transaction, and apply-migrations.sh does not wrap files)";
  }
  const second = stmts[1] ?? "";
  if (/^SET\s+lock_timeout\b/i.test(second)) {
    return "use SET LOCAL lock_timeout, not plain SET (plain SET leaks across files in apply-migrations.sh's single session)";
  }
  if (!/^SET\s+LOCAL\s+lock_timeout\s*(=|TO)\s*'?\d+\s*(ms|s|min)?'?$/i.test(second)) {
    return "second statement must be SET LOCAL lock_timeout = '<n>s' (before any DDL)";
  }
  if (/^SET\s+LOCAL\s+lock_timeout\s*(=|TO)\s*'?0+\s*(ms|s|min)?'?$/i.test(second)) {
    return "lock_timeout of 0 disables the bound";
  }
  return null;
}

function main() {
  const argDir = process.argv.indexOf("--dir");
  const dir = argDir > -1 ? process.argv[argDir + 1] : path.join(here, "..", "database", "migrations");
  const legacy = new Set(
    JSON.parse(fs.readFileSync(path.join(here, "migration-lock-timeout-legacy.json"), "utf8")).files,
  );
  const failures = [];
  let checked = 0;
  for (const name of fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    const m = /^(\d{14})_/.exec(name);
    if (!m) {
      if (!legacy.has(name)) failures.push([name, "new migrations must be named <14-digit timestamp>_<name>.sql"]);
      continue;
    }
    if (m[1] < CUTOFF) continue;
    checked += 1;
    const reason = checkMigration(fs.readFileSync(path.join(dir, name), "utf8"));
    if (reason) failures.push([name, reason]);
  }
  if (failures.length) {
    console.error(`❌ Migration lock-timeout law: ${failures.length} violation(s)`);
    for (const [f, r] of failures) console.error(`  ${f}: ${r}`);
    process.exit(1);
  }
  console.log(`✅ Migration lock-timeout law: ${checked} migration(s) at/after ${CUTOFF} comply`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
