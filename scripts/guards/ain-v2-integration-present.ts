/**
 * Guardrail: Fail if AIN v2 library exists but the oracle route is missing
 * the soft-consultation integration.
 *
 * Run: npm run guard:ain-v2-integration
 */

import * as fs from "fs";

function exists(p: string): boolean {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function read(p: string): string {
  return fs.readFileSync(p, "utf8");
}

function main(): void {
  const gatesPath = "lib/ain/gates.ts";
  const consultPath = "lib/ain/consultation.ts";
  const routePath = "app/api/oracle/conversation/route.ts";

  const ainExists = exists(gatesPath) && exists(consultPath);
  if (!ainExists) {
    console.log("[guard:ain-v2] AIN v2 not present (lib/ain/* missing) — skipping.");
    process.exit(0);
  }

  if (!exists(routePath)) {
    console.error(`[guard:ain-v2] AIN v2 exists, but ${routePath} is missing.`);
    process.exit(1);
  }

  const route = read(routePath);

  // Minimal "signature" checks that should survive refactors
  const required = [
    "from '@/lib/ain/gates'",
    "from '@/lib/ain/consultation'",
    "buildGateContext",
    "recommendConsultation",
    "consult(",
  ];

  const missing = required.filter((needle) => !route.includes(needle));

  if (missing.length) {
    console.error("[guard:ain-v2] FAIL: AIN v2 exists but integration is missing in oracle route.");
    for (const m of missing) console.error(`  Missing: ${m}`);
    console.error(`  Expected wiring in: ${routePath}`);
    process.exit(1);
  }

  console.log("[guard:ain-v2] OK: AIN v2 present and wired into oracle route.");
  process.exit(0);
}

main();
