import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');
const strip = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

const shadow = strip(read('lib/ain/epistemic-join/shadow/relationalField.ts'));
const runner = strip(read('lib/maia/relational-field-shadow/runner.ts'));
const store = strip(read('lib/maia/relational-field-shadow/evidenceStore.ts'));
const telemetryStore = strip(read('lib/maia/relational-field-shadow/epistemicTelemetryStore.ts'));
const migration = read('database/migrations/20260921000002_epistemic_join_integration_shadow.sql');

let passed = 0;
const failures: string[] = [];
function guard(id: string, law: string, fn: () => boolean): void {
  const ok = (() => { try { return fn(); } catch { return false; } })();
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}  ${law}`);
  if (ok) passed += 1; else failures.push(id);
}

guard('I4-F01', 'integration shadow is literal-1 and default OFF', () =>
  shadow.includes("=== '1'") && shadow.includes('MAIA_EPISTEMIC_JOIN_INTEGRATION_SHADOW'));
guard('I4-F02', 'only multi-evidence proposals are eligible semantic joins', () =>
  shadow.includes('distinctBasisCount >= 2')
  && shadow.includes('shadow_join_requires_two_distinct_basis_evidence'));
guard('I4-F03', 'shadow proposal is HYPOTHESIZE only', () =>
  shadow.includes("operation: 'HYPOTHESIZE'"));
guard('I4-F04', 'shadow request cannot claim semantic force', () =>
  shadow.includes('claimedSemantics: []'));
guard('I4-F05', 'shadow request supplies no warrant', () =>
  shadow.includes('warrants: []') && shadow.includes('offeredWarrantRefs: []'));
guard('I4-F06', 'shadow can request candidate standing only', () =>
  shadow.includes("claimedStanding: 'CANDIDATE_UNESTABLISHED'")
  && shadow.includes("requestedStanding: 'CANDIDATE_UNESTABLISHED'"));
guard('I4-F07', 'lineage-not-entailment remains an operative boundary', () =>
  shadow.includes('lineage-not-entailment')
  && shadow.includes('Basis evidence establishes lineage only'));
guard('I4-F08', 'only member-authored basis evidence crosses into the join request', () =>
  shadow.includes("evidence.authoredBy !== 'member'")
  && shadow.includes('shadow_basis_not_member_authored'));
guard('I4-F09', 'jurisdiction remains MAIA conversational inquiry', () =>
  (shadow.match(/maia_conversational_inquiry/g) ?? []).length >= 3);
guard('I4-F10', 'I2 evaluation happens only after existing standing-envelope rendering succeeds', () =>
  runner.lastIndexOf('renderCurrentTurnBasisEnvelope(')
    < runner.lastIndexOf('evaluateRelationalFieldEpistemicShadow({'));
guard('I4-F11', 'shadow integration never calls the I3 persistence writer', () =>
  !shadow.includes('persistEpistemicJoinSnapshot')
  && !runner.includes('persistEpistemicJoinSnapshot')
  && !runner.includes('epistemic-join/persistence'));
guard('I4-F12', 'runner does not return or replace primary response from epistemic telemetry', () =>
  runner.includes('primaryResponseText: input.primaryResponse')
  && !/return\s+epistemicJoinShadow/.test(runner));
guard('I4-F13', 'I4 telemetry has only structural fields', () => {
  const allowed = [
    'status', 'proposalCount', 'evaluatedCount', 'admittedStandingCounts',
    'refusalCodeCounts', 'representationClosed', 'errorCount',
  ];
  const section = shadow.slice(shadow.indexOf('export interface EpistemicJoinShadowTelemetry'),
    shadow.indexOf('export interface RelationalFieldEpistemicShadowInput'));
  return allowed.every((key) => section.includes(key))
    && !/proposition|evidenceText|memberId|joinId|evidenceId/.test(section);
});
guard('I4-F14', 'telemetry has its own child table, leaving the existing evidence writer unchanged', () =>
  migration.includes('CREATE TABLE IF NOT EXISTS public.maia_epistemic_join_integration_shadow_runs')
  && !store.includes('epistemic_join_integration_shadow')
  && !store.includes('epistemicJoinShadow'));
guard('I4-F15', 'telemetry schema contains structural columns only and representation is closed', () =>
  migration.includes('representation_closed BOOLEAN NOT NULL CHECK (representation_closed = TRUE)')
  && !/relation_proposition|evidence_text|member_id|join_id|evidence_id|response_text/.test(migration));
guard('I4-F16', 'telemetry store writes only the structural I4 child sink', () =>
  telemetryStore.includes('maia_epistemic_join_integration_shadow_runs')
  && !/relationProposition|evidenceText|memberId|joinId|evidenceId|primaryResponse/.test(telemetryStore)
  && !/epistemic_join_records|epistemic_join_admissions/.test(telemetryStore));
guard('I4-F17', 'integration flag is not configured outside implementation and tests', () => {
  const result = spawnSync('git', ['grep', '-n', 'MAIA_EPISTEMIC_JOIN_INTEGRATION_SHADOW', '--',
    ':!lib/ain/epistemic-join/shadow/**',
    ':!lib/maia/relational-field-shadow/**',
    ':!tests/**',
    ':!docs/**'], { cwd: root, encoding: 'utf8' });
  return result.status === 1 && result.stdout.trim() === '';
});
guard('I4-F18', 'I4 integration code has no path to member memory, Wisdom Graph, or Living Constellation', () => {
  const code = [shadow, runner, telemetryStore].join('\n');
  return !/member_memory_atoms|wisdom_graph|wisdom_nodes|living-constellation|livingConstellation/.test(code);
});
guard('I4-F19', 'existing shadow launch remains asynchronous and unawaited', () =>
  runner.includes('setImmediate(() => {')
  && runner.includes('void runRelationalFieldShadow(input, models)'));
guard('I4-F20', 'I4 adds no model/provider/routing decision surface', () =>
  !/routeParticipant|provider_id|model_id|recommended_next_action/.test(shadow));
guard('I4-F21', 'database count maps reject keys outside the closed I2 vocabularies', () =>
  migration.includes('admitted_standing_counts - ARRAY[')
  && migration.includes('refusal_code_counts - ARRAY[')
  && migration.includes("'CANDIDATE_UNESTABLISHED'")
  && migration.includes("'member_scope_violation'")
  && migration.includes("= '{}'::jsonb"));
guard('I4-F22', 'telemetry count maps are type-closed and database values are numeric non-negative integers', () =>
  shadow.includes('Partial<Record<RelationStanding, number>>')
  && shadow.includes('Partial<Record<RefusalCode, number>>')
  && migration.includes("jsonb_typeof(admitted_standing_counts -> 'CANDIDATE_UNESTABLISHED') = 'number'")
  && migration.includes("jsonb_typeof(refusal_code_counts -> 'no_warrant_offered') = 'number'")
  && migration.includes("~ '^[0-9]+$'")
  && migration.includes('evaluated_count + error_count = proposal_count'));

console.log(`\nRESULT: ${passed}/22 PASS`);
if (failures.length) {
  console.error(`FAILED: ${failures.join(', ')}`);
  process.exit(1);
}
