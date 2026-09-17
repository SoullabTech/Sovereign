import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { matchRule } from '../config/accessMatrix';

const ROOT = process.cwd();
const failures: string[] = [];

function text(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

const legacyService = 'services/user-sovereignty/delete-memory-api.js';
const deleteRoute = 'app/api/sovereignty/delete-my-memory/route.ts';
const summaryRoute = 'app/api/sovereignty/my-data-summary/[userId]/route.ts';
const labPage = 'app/labtools/sovereignty/page.tsx';
const canonicalRoute = 'app/api/members/delete-account/route.ts';

if (existsSync(join(ROOT, legacyService))) {
  failures.push(`${legacyService} exists — the standalone legacy erasure engine is executable again`);
}

for (const [rel, requiredCode] of [
  [deleteRoute, 'legacy_erasure_surface_retired'],
  [summaryRoute, 'legacy_sovereignty_summary_retired'],
] as const) {
  const src = text(rel);
  if (!src.includes(requiredCode) || !src.includes('status: 410')) {
    failures.push(`${rel} is no longer a stable 410 retirement tombstone`);
  }
  if (/UserDataSovereignty|delete-memory-api\.js|DELETE ALL MY CONSCIOUSNESS DATA|success\s*:\s*true/.test(src)) {
    failures.push(`${rel} regained legacy erasure execution/success semantics`);
  }
}

const page = text(labPage);
if (/fetch\s*\([^\n]*(?:delete-my-memory|my-data-summary)|DELETE ALL MY CONSCIOUSNESS DATA|demo_user_001/.test(page)) {
  failures.push(`${labPage} regained an executable/mock legacy erasure control`);
}
if (!page.includes('Legacy data-sovereignty control retired')) {
  failures.push(`${labPage} no longer declares the legacy control retired`);
}

const canonical = text(canonicalRoute);
if (/\/api\/sovereignty|UserDataSovereignty|delete-memory-api/.test(canonical)) {
  failures.push(`${canonicalRoute} references the retired legacy erasure engine`);
}

const retiredRule = matchRule('/api/sovereignty/delete-my-memory');
if (retiredRule?.prefix !== '/api/sovereignty/') {
  failures.push(
    `/api/sovereignty/delete-my-memory is not intentionally contained by /api/sovereignty/ (got ${retiredRule?.prefix ?? retiredRule?.exact ?? 'no rule'})`,
  );
}
const sovereignRule = matchRule('/api/sovereign/manuscripts/example');
if (sovereignRule?.prefix !== '/api/sovereign') {
  failures.push(
    `/api/sovereign/* live namespace no longer resolves through its original rule (got ${sovereignRule?.prefix ?? sovereignRule?.exact ?? 'no rule'})`,
  );
}

if (failures.length) {
  console.error('\n🚨 LEGACY ERASURE RETIREMENT VIOLATION\n');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log('\n🔒 Legacy erasure retirement gate');
console.log('   standalone engine      absent');
console.log('   delete surface         410 retired');
console.log('   mock summary           410 retired');
console.log('   Lab Tools control      non-actionable');
console.log('   /api/sovereignty/      explicit authenticated containment');
console.log('   /api/sovereign/*       original rule preserved');
console.log('   canonical erasure      no legacy fallback');
console.log('\n✅ P4 legacy-fallback mutant remains killed.\n');
