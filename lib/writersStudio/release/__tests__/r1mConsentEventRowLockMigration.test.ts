import {readFileSync} from 'node:fs';
import path from 'node:path';
import {lockWriterBetaMemberR1K,R1K_REAL_PROTECTED_EDITORIAL_RELEASED} from '../serializedWriterBetaConsentR1K';

const root=process.cwd();
const file=(p:string)=>readFileSync(path.join(root,p),'utf8');
const ddl=file('database/migrations/20261017190000_writer_beta_consent_row_lock_r1m.sql');
const original=file('database/migrations/20261015000001_writer_studio_beta_consent_events.sql');
const r1k=file('lib/writersStudio/release/serializedWriterBetaConsentR1K.ts');
const r72=file('lib/writersStudio/recovery/r72MemberProposalConsent.ts');

describe('R1M actual beta consent insert/withdrawal DB lock law',()=>{
 it('declares one row-level BEFORE INSERT trigger on exact immutable consent event relation',()=>{
  expect(ddl).toContain('CREATE TRIGGER writer_beta_consent_member_fence_r1m');
  expect(ddl).toMatch(/BEFORE INSERT ON writers_studio_beta_consent_events\s+FOR EACH ROW EXECUTE FUNCTION writer_beta_consent_member_fence_r1m/);
  expect(ddl).toContain('DROP TRIGGER IF EXISTS writer_beta_consent_member_fence_r1m');
 });
 it('uses same durable member row FOR UPDATE lock as R1K protected edit',()=>{
  expect(ddl).toContain('PERFORM 1 FROM members WHERE id = NEW.member_id FOR UPDATE;');
  expect(ddl).toContain("NEW.seq := nextval(pg_get_serial_sequence(");
  expect(r1k).toContain('SELECT id FROM members WHERE id=$1 FOR UPDATE');
  expect(typeof lockWriterBetaMemberR1K).toBe('function');
 });
 it('refuses different actor and unavailable member before accepting event',()=>{
  expect(ddl).toContain('NEW.actor_member_id IS DISTINCT FROM NEW.member_id');
  expect(ddl).toContain('writer_beta_consent_member_unavailable');
  expect(ddl).toContain("USING ERRCODE = '23514'");
  expect(ddl).toContain("USING ERRCODE = '23503'");
 });
 it('binds consent sequence to lock order rather than pre-trigger identity allocation',()=>{
  expect(ddl.indexOf('PERFORM 1 FROM members WHERE id = NEW.member_id FOR UPDATE;')).toBeLessThan(ddl.indexOf('NEW.seq := nextval(pg_get_serial_sequence('));
 });
  it('does not create second source of latest consent nor bypass immutable notice chronology',()=>{
  expect(ddl).not.toContain('INSERT INTO writers_studio_beta_consent_events');
  expect(ddl).not.toContain('UPDATE writers_studio_beta_consent_events SET');
  expect(r1k).toContain('ORDER BY seq DESC LIMIT 1');
  expect(original).toContain('GENERATED ALWAYS AS IDENTITY');
 });
 it('retains member erasure cascade and never creates blanket delete/rollback block',()=>{
  expect(original).toContain('REFERENCES members(id) ON DELETE CASCADE');
  expect(ddl).not.toMatch(/BEFORE DELETE ON writers_studio_beta_consent_events/);
  expect(ddl).not.toMatch(/BEFORE TRUNCATE ON writers_studio_beta_consent_events/);
 });
 it('closes older fixture-only direct INSERT while protected editorial remains held',()=>{
  expect(r72).toContain('INSERT INTO writers_studio_beta_consent_events');
  expect(R1K_REAL_PROTECTED_EDITORIAL_RELEASED).toBe(false);
  expect(ddl).toContain('REVIEW-ONLY MIGRATION');
 });
});
