#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";

const ROOT=path.resolve(__dirname,"../../..");
const FILE=path.join(ROOT,"scripts/deploy-production.sh");
const source=fs.readFileSync(FILE,"utf8");

function section(start:string,end:string):string{
  const a=source.indexOf(start);
  if(a<0)throw new Error("missing section start: "+start);
  const b=source.indexOf(end,a);
  if(b<0)throw new Error("missing section end: "+end);
  return source.slice(a,b);
}
function requireOrder(label:string,body:string,tokens:string[]):void{
  let prior=-1;
  for(const token of tokens){
    const at=body.indexOf(token);
    if(at<0)throw new Error(label+" missing token: "+token);
    if(at<=prior)throw new Error(label+" wrong order at: "+token);
    prior=at;
  }
}

const deploy=section("cmd_deploy() {","# UPDATE - Pull latest and redeploy");
const update=section("cmd_update() {","# MIGRATE - Run database migrations only");
const migrateOnly=section("cmd_migrate() {","# LOGS - Tail container logs");
const rewitness=section(
  "rewitness_migration_relation_or_abort() {",
  "run_migrations_or_abort() {",
);
const migration=section(
  "run_migrations_or_abort() {",
  "# ALERT - Send alert to developer",
);

for(const [label,body,phase] of [
  ["deploy",deploy,"Deployment"],
  ["update",update,"Update"],
] as const){
  requireOrder(label,body,[
    'review_migration_custody_or_abort "'+phase+'"',
    'run_migrations_or_abort "'+phase+'"',
    'tag_images_for_rollback "$GIT_COMMIT"',
    "deploy_ctx_compose up -d",
    'deploy_ctx_verify_running "$GIT_COMMIT"',
  ]);
}

requireOrder("immediate relation witness",rewitness,[
  'pending_now="$(collect_pending_production_migrations)"',
  'if [ "$pending_now" != "$expected_pending" ]',
  'docker exec maia-sovereign printenv GIT_COMMIT',
  'git -C "$PROJECT_DIR" rev-parse "$live_stamp^{commit}"',
  'if [ -z "$live_old" ] || [ "$live_old" != "$expected_old" ]',
]);

requireOrder("migration seam",migration,[
  'rewitness_migration_relation_or_abort "$phase"',
  'deploy_ctx_compose --profile migrate run --rm migrate',
]);

for(const token of [
  "The candidate reader was NOT swapped in.",
  "previously witnessed old reader remains the live reader",
  "compatible",
  "committed prefix",
]){
  if(!migration.includes(token))throw new Error("migration failure missing: "+token);
}

if(migrateOnly.includes("run_migrations_or_abort") ||
   migrateOnly.includes("rewitness_migration_relation_or_abort")){
  throw new Error("migration-only command was broadened into Step 3 ordering helper");
}
requireOrder("migration-only",migrateOnly,[
  'review_migration_custody_or_abort "Migration-only run"',
  'docker compose -f "$COMPOSE_FILE" --profile migrate run --rm migrate',
]);

console.log("DEPLOYMENT-SAFETY-03 STEP 3 ORDERING: PASS");
console.log("  deploy/update: gate -> immediate relation re-witness+migrate -> tags -> swap -> verify");
console.log("  re-witness: pending set -> old reader -> migrate");
console.log("  migrate-only: unchanged by ordering act");
