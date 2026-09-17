import { readFileSync } from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '../../..');
const MIGRATION = path.join(ROOT, 'database/migrations/20260917000001_account_erasure_ledger.sql');
const SQL = readFileSync(MIGRATION, 'utf8');

function tableBlock(name: string): string {
  const start = SQL.indexOf(`CREATE TABLE IF NOT EXISTS ${name} (`);
  expect(start).toBeGreaterThanOrEqual(0);
  const end = SQL.indexOf('\n);', start);
  expect(end).toBeGreaterThan(start);
  return SQL.slice(start, end + 3);
}

describe('F5 P5-A account-erasure ledger substrate', () => {
  it('keeps the durable act outside the members FK cascade', () => {
    const acts = tableBlock('account_erasure_acts');
    expect(acts).toMatch(/subject_member_id uuid NOT NULL/);
    expect(acts).not.toMatch(/subject_member_id[^\n]*REFERENCES\s+members/i);
    expect(acts).not.toMatch(/REFERENCES\s+members\s*\(/i);
  });

  it('freezes a versioned immutable plan before execution', () => {
    expect(SQL).toMatch(/policy_version text NOT NULL/);
    expect(SQL).toMatch(/registry_version text NOT NULL/);
    expect(SQL).toMatch(/event_type = 'plan_frozen'/);
    expect(SQL).toMatch(/erasure plan already frozen — disposition INSERT refused/);
    expect(SQL).toMatch(/erasure execution cannot begin before plan_frozen/);
  });

  it('makes act, plan and execution history append-only against UPDATE DELETE and TRUNCATE', () => {
    for (const table of [
      'account_erasure_acts',
      'account_erasure_dispositions',
      'account_erasure_execution_events',
    ]) {
      expect(SQL).toContain(`BEFORE UPDATE OR DELETE ON ${table}`);
      expect(SQL).toContain(`BEFORE TRUNCATE ON ${table}`);
    }
    expect(SQL).toMatch(/account-erasure history is append-only/);
  });

  it('kills the history-rewrite mutant with additive corrections', () => {
    expect(SQL).toMatch(/event_type = 'correction'/);
    expect(SQL).toMatch(/supersedes_event_id uuid REFERENCES account_erasure_execution_events/);
    expect(SQL).toMatch(/correction must supersede an event from the same erasure act/);
  });

  it('refuses completed while a disposition outcome is missing', () => {
    expect(SQL).toMatch(/act_completed refused — % disposition\(s\) lack successful outcome/);
  });

  it('refuses completed while required verification is missing or failed', () => {
    expect(SQL).toMatch(/verification_rule <> 'none'/);
    const events = tableBlock('account_erasure_execution_events');
    expect(events).toMatch(/event_seq bigint GENERATED ALWAYS AS IDENTITY/);
    const plan = tableBlock('account_erasure_dispositions');
    expect(plan).not.toMatch(/event_seq/);
    expect(SQL).toMatch(/ORDER BY e\.event_seq DESC/);
    expect(SQL).toMatch(/act_completed refused — % disposition\(s\) lack current successful verification/);
  });

  it('kills the owed-custody mutant until a matching clear event exists', () => {
    expect(SQL).toMatch(/event_type = 'custody_owed'/);
    expect(SQL).toMatch(/event_type = 'custody_cleared'/);
    expect(SQL).toMatch(/cleared\.event_ref = owed\.event_ref/);
    expect(SQL).toMatch(/act_completed refused — % custody obligation\(s\) still owed/);
  });

  it('allows only one terminal act result and one terminal outcome per disposition', () => {
    expect(SQL).toMatch(/uq_account_erasure_terminal/);
    expect(SQL).toMatch(/uq_account_erasure_disposition_outcome/);
    expect(SQL).toMatch(/idx_account_erasure_verification_events/);
  });

  it('does not activate the ledger in the live route or Account Settings during P5-A', () => {
    const route = readFileSync(path.join(ROOT, 'app/api/members/delete-account/route.ts'), 'utf8');
    const client = readFileSync(path.join(ROOT, 'components/account/AccountSettings.tsx'), 'utf8');
    expect(route).not.toMatch(/account_erasure_(acts|dispositions|execution_events)/);
    expect(client).not.toMatch(/account_erasure_(acts|dispositions|execution_events)/);
  });
});
