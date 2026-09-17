/**
 * F5-CONFORMANCE-REPAIR-01 · P5-A coverage gate.
 *
 * Refuses schema drift that creates a durable member-bound locus or a declared
 * FK to members(id) without an explicit account-erasure registry classification.
 *
 * This is a repository-declaration guard, not a claim about production occupancy.
 */
import process from 'process';
import { discoverCensus, loadRegistry, validateRegistry } from './erasure/account-erasure-registry-core';

const root = process.cwd();
const census = discoverCensus(root);
const registry = loadRegistry(root);
const failures = validateRegistry(registry, census);

console.log('\n🔐 Account-erasure registry coverage gate\n');
console.log(`   baseline              ${census.baselineTableCount} tables · ${census.baselineMemberBoundCount} member-bound`);
console.log(`   declared current       ${census.memberBoundLoci.length} member-bound loci`);
console.log(`   migration member FKs   ${census.memberForeignKeys.length} declarations · ${census.fkLinkedTables} tables · ${census.fkTableActionPairs} table/action pairs`);
console.log(`   FK actions             CASCADE ${census.fkActionCounts.CASCADE} · RESTRICT ${census.fkActionCounts.RESTRICT} · NO ACTION ${census.fkActionCounts['NO ACTION']} · SET NULL ${census.fkActionCounts['SET NULL']}`);
console.log(`   ledger child FKs        ${census.accountErasureLedgerChildren.length} retained declarations`);
console.log(`   registry               ${registry.version} · ${registry.memberBoundLoci.length} loci · ${registry.memberForeignKeyDeclarations.length} member FK declarations · ${registry.accountErasureLedgerChildren.length} ledger children\n`);

if (failures.length === 0) {
  console.log('✅ Every declared member-bound locus and member FK is explicitly classified.');
  console.log('   Registry remains coverage-only; activation is prohibited.\n');
  process.exit(0);
}

console.error('🚨 ACCOUNT-ERASURE REGISTRY DRIFT\n');
for (const failure of failures) console.error(`   ${failure}`);
console.error('\nA schema change may not create member custody or implicit member-FK effects by omission.');
console.error('Classify the new locus/effect explicitly under the governing erasure lane; do not weaken this guard.\n');
process.exit(1);
