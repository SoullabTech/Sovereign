#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';

const ROOT=path.resolve(__dirname,'../../..');
const deploy=fs.readFileSync(path.join(ROOT,'scripts/deploy-production.sh'),'utf8');

function section(start:string,end:string):string {
  const a=deploy.indexOf(start), b=deploy.indexOf(end,a);
  if(a<0||b<0) throw new Error('missing section');
  return deploy.slice(a,b);
}
function must(body:string, token:string) {
  if(!body.includes(token)) throw new Error('missing: '+token);
}
function mustNot(body:string, token:string) {
  if(body.includes(token)) throw new Error('unexpected: '+token);
}
function order(body:string,tokens:string[]) {
  let at=-1;
  for(const t of tokens){
    const n=body.indexOf(t);
    if(n<0||n<=at) throw new Error('wrong order/missing: '+t);
    at=n;
  }
}

const gate=section('review_migration_custody_or_abort() {','rewitness_migration_relation_or_abort() {');
const deployCmd=section('cmd_deploy() {','# UPDATE - Pull latest and redeploy');
const updateCmd=section('cmd_update() {','# MIGRATE - Run database migrations only');
const migrateOnly=section('cmd_migrate() {','# LOGS - Tail container logs');

must(gate,'local custody_mode="${MIGRATION_CUSTODY_MODE:-single}"');
must(gate,'[ "$custody_mode" != "single" ] && [ "$custody_mode" != "two-layer" ]');
must(gate,'if [ "$custody_mode" = "single" ]; then');
must(gate,'scripts/review-custody-migration-gate.ts');
must(gate,'local delta_review="${MIGRATION_DELTA_REVIEW:-}"');
must(gate,'local delta_projection="${MIGRATION_DELTA_PROJECTION:-}"');
must(gate,'scripts/migration-custody-composition-gate.ts');
must(gate,'--live-reader "$old_reader" --target "$target"');
must(gate,'composite_args+=(--migration "$m")');

order(gate,[
  'if [ "$custody_mode" = "single" ]; then',
  'scripts/review-custody-migration-gate.ts',
  'else',
  'scripts/migration-custody-composition-gate.ts',
  'MIGRATION_COMPAT_EXPECTED_OLD_READER="$old_reader"',
]);

const twoLayer=gate.slice(gate.indexOf('    else\n        local delta_review='));
must(twoLayer,'if ! "$tsx_bin" "$composite_gate" "${composite_args[@]}"; then');
must(twoLayer,'return 1');
mustNot(twoLayer,'"$tsx_bin" "$gate"');

for(const [name,body,phase] of [['deploy',deployCmd,'Deployment'],['update',updateCmd,'Update']] as const) {
  order(body,[
    'review_migration_custody_or_abort "'+phase+'"',
    'run_migrations_or_abort "'+phase+'"',
  ]);
}

must(migrateOnly,'review_migration_custody_or_abort "Migration-only run"');
mustNot(migrateOnly,'rewitness_migration_relation_or_abort');
mustNot(migrateOnly,'run_migrations_or_abort');

console.log('PRODUCTION-MIGRATION-CUSTODY-INTEGRATION CONFORMANCE: PASS');
console.log('  default=single; two-layer explicit; unknown mode refused');
console.log('  failed composite cannot fall back to legacy');
console.log('  deploy/update preserve gate -> Step-3 re-witness -> migrate ordering');
console.log('  migration-only Step-3 scope unchanged');
