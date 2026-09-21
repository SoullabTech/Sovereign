#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "../../..");
const FILE = path.join(ROOT, "scripts/deploy-production.sh");
const source = fs.readFileSync(FILE, "utf8");

function section(start: string, end: string): string {
  const a = source.indexOf(start);
  if (a < 0) throw new Error("missing section start: " + start);
  const b = source.indexOf(end, a);
  if (b < 0) throw new Error("missing section end: " + end);
  return source.slice(a, b);
}

function requireOrder(label: string, body: string, tokens: string[]): void {
  let prior = -1;
  for (const token of tokens) {
    const at = body.indexOf(token);
    if (at < 0) throw new Error(label + " missing token: " + token);
    if (at <= prior) throw new Error(label + " wrong order at: " + token);
    prior = at;
  }
}

const deploy = section("cmd_deploy() {", "# UPDATE - Pull latest and redeploy");
const update = section("cmd_update() {", "# MIGRATE - Run database migrations only");
const migrateOnly = section("cmd_migrate() {", "# LOGS - Tail container logs");
const rewitness = section(
  "rewitness_compatible_old_reader_or_abort() {",
  "run_migrations_or_abort() {",
);
const migrationFailure = section(
  "run_migrations_or_abort() {",
  "# ALERT - Send alert to developer",
);

requireOrder("deploy", deploy, [
  'review_migration_custody_or_abort "Deployment"',
  'rewitness_compatible_old_reader_or_abort "Deployment"',
  'run_migrations_or_abort "Deployment"',
  'tag_images_for_rollback "$GIT_COMMIT"',
  "deploy_ctx_compose up -d",
  'deploy_ctx_verify_running "$GIT_COMMIT"',
]);

requireOrder("update", update, [
  'review_migration_custody_or_abort "Update"',
  'rewitness_compatible_old_reader_or_abort "Update"',
  'run_migrations_or_abort "Update"',
  'tag_images_for_rollback "$GIT_COMMIT"',
  "deploy_ctx_compose up -d",
  'deploy_ctx_verify_running "$GIT_COMMIT"',
]);

for (const [label, body] of [["deploy", deploy], ["update", update]] as const) {
  const migration = body.indexOf("run_migrations_or_abort");
  const swap = body.indexOf("deploy_ctx_compose up -d");
  if (migration < 0 || swap < 0 || migration >= swap) {
    throw new Error(label + " does not migrate before swap");
  }
}

for (const token of [
  'expected="${MIGRATION_COMPAT_OLD_READER:-}"',
  'docker exec maia-sovereign printenv GIT_COMMIT',
  'git -C "$PROJECT_DIR" rev-parse "$live_stamp^{commit}"',
  'if [ "$live_reader" != "$expected" ]',
]) {
  if (!rewitness.includes(token)) throw new Error("rewitness missing: " + token);
}

if (!migrationFailure.includes("candidate reader was NOT swapped in")) {
  throw new Error("migration failure does not state pre-swap reader custody");
}
if (!migrationFailure.includes("schema may be partially migrated")) {
  throw new Error("migration failure hides partial-schema possibility");
}

if (migrateOnly.includes("rewitness_compatible_old_reader_or_abort")) {
  throw new Error("migration-only command was broadened by Step 3");
}
requireOrder("migration-only", migrateOnly, [
  'review_migration_custody_or_abort "Migration-only run"',
  'docker compose -f "$COMPOSE_FILE" --profile migrate run --rm migrate',
]);

console.log("DEPLOYMENT-SAFETY-03 STEP 3 ORDERING: PASS");
console.log("  deploy: gate -> re-witness old reader -> migrate -> tag -> swap -> verify");
console.log("  update: gate -> re-witness old reader -> migrate -> tag -> swap -> verify");
console.log("  migrate-only: unchanged");
