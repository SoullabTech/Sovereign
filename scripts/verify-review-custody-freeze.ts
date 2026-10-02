#!/usr/bin/env tsx
/**
 * REVIEW CUSTODY — FREEZE INTEGRITY  (npm run verify:review-custody-freeze)
 *
 * The freeze is a checkable fact or it is prose. This recomputes each frozen
 * file's git blob hash and refuses on any drift.
 *
 * ⭐ It checks BLOB HASHES, not a commit diff: blob identity survives history
 *    rewriting and names exactly which bytes are law.
 *
 * ⛔ Additive law is lawful and this guard permits it: new falsifiers live at
 *    their own address. What it refuses is an EDIT to a frozen file — the move
 *    by which an inconvenient test gets quietly domesticated.
 *
 * Exit 0 intact · 1 drift · 2 instrument error.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

type Manifest = {
  freeze_commit: string;
  frozen: Record<string, string>;
  deliberately_not_frozen?: Record<string, string>;
};

const MANIFEST = path.resolve(__dirname, "../tests/constitutional/review-custody/FREEZE.json");

function main(): number {
  if (!fs.existsSync(MANIFEST)) {
    console.error(`INSTRUMENT ERROR — freeze manifest not found: ${MANIFEST}`);
    return 2;
  }
  const m = JSON.parse(fs.readFileSync(MANIFEST, "utf8")) as Manifest;
  const entries = Object.entries(m.frozen);
  if (entries.length === 0) {
    console.error("INSTRUMENT ERROR — the manifest freezes nothing. An empty freeze is not a freeze.");
    return 2;
  }
  console.log("REVIEW CUSTODY — FREEZE INTEGRITY");
  console.log(`  freeze commit ${m.freeze_commit.slice(0, 9)} · ${entries.length} frozen file(s)\n`);

  const drift: string[] = [];
  for (const [file, expected] of entries) {
    if (!fs.existsSync(file)) {
      drift.push(`${file} — ABSENT (a frozen file may not be deleted)`);
      console.error(`  ✗ ${file}\n      ABSENT`);
      continue;
    }
    let live: string;
    try {
      live = execFileSync("git", ["hash-object", file], { encoding: "utf8" }).trim();
    } catch (e) {
      console.error(`INSTRUMENT ERROR — git hash-object failed on ${file}: ${(e as Error).message}`);
      return 2;
    }
    if (live !== expected) {
      drift.push(`${file} — expected ${expected.slice(0, 12)}…, live ${live.slice(0, 12)}…`);
      console.error(`  ✗ ${file}\n      expected ${expected}\n      live     ${live}`);
    } else {
      console.log(`  ✓ ${file}  ${live.slice(0, 12)}…`);
    }
  }
  if (drift.length > 0) {
    console.error("\nFREEZE VIOLATED");
    for (const d of drift) console.error(`  ⛔ ${d}`);
    console.error("\n⛔ A frozen file changed. Lawful: implementation fails suite → repair the");
    console.error("   implementation. Forbidden: reinterpret the law → weaken the test.");
    console.error("   Changing these bytes requires a formal, named founder act with evidence the");
    console.error("   LAW or the INSTRUMENT was wrong — never that an implementation was inconvenient.");
    return 1;
  }
  console.log("\nFREEZE INTACT");
  console.log("⛔ Intact means the law was not edited. It says nothing about whether any");
  console.log("   implementation satisfies it — run the matrix for that.");
  return 0;
}

process.exit(main());
