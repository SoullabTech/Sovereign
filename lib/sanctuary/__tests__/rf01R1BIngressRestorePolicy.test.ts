/**
 * R1-B: public non-use and recovery refusal remain structural.
 * This is an independent read-only source custody check, not a substitute
 * for an actual backup restore across every derived data lane.
 */
import {describe,it,expect} from '@jest/globals';
import fs from 'node:fs';
import path from 'node:path';
const read=(p:string)=>fs.readFileSync(path.join(process.cwd(),p),'utf8');
const canonical=read('app/api/sovereign/app/maia/list/route.ts');
const between=read('app/api/between/chat/route.ts');
const service=read('lib/sovereign/maiaService.ts');
const turns=read('lib/memory/stores/TurnsStore.ts');
const erase=read('lib/sanctuary/exactTurnErasure.ts');
const migration=read('database/migrations/20261017090000_rf01_r1b_erasure_influence_hold.sql');
const summaryEligibility=read('lib/sanctuary/sessionSummaryEligibility.ts');
const restore=read('scripts/restore-governed.sh');
const rawRestore=read('scripts/restore-db.sh');

describe('R1-B real serving path refuses erased member influence',()=>{
 it('canonical MAIA route checks erasure hold before session writes and F1',()=>{
  const check=canonical.indexOf('await assertMemberInfluenceAllowed(userId!)');
  const owner=canonical.indexOf('await ensureOwnedMemberSession(acceptedSessionId, userId!)');
  const persist=canonical.indexOf('memberTurnDurable = await TurnsStore.addExchangeTurn');
  expect(check).toBeGreaterThan(0);
  expect(check).toBeLessThan(owner);
  expect(owner).toBeLessThan(persist);
 });
 it('Between route checks the authenticated member before history and canonical return',()=>{
  const check=between.indexOf('await assertMemberInfluenceAllowed(authUserId)');
  const session=between.indexOf('await ensureOwnedMemberSession(safeSessionId, authUserId)');
  const history=between.indexOf('let conversationHistory = await getConversationHistory');
  expect(check).toBeGreaterThan(0);
  expect(check).toBeLessThan(session);
  expect(session).toBeLessThan(history);
 });
 it('direct MAIA service also has its own hold gate before cognition',()=>{
  const entry=service.indexOf('export async function getMaiaResponse(');
  const hold=service.indexOf('await assertMemberInfluenceAllowed(actor)',entry);
  const crisis=service.indexOf('const crisisAssessment =',entry);
  expect(hold).toBeGreaterThan(entry);
  expect(hold).toBeLessThan(crisis);
 });
 it('shared cross-session turn retrieval independently refuses a held member',()=>{
  const start=turns.indexOf('async getRecentTurns(');
  const hold=turns.indexOf('await assertMemberInfluenceAllowed(userId)',start);
  const sql=turns.indexOf('FROM conversation_turns',start);
  expect(hold).toBeGreaterThan(start);
  expect(hold).toBeLessThan(sql);
 });
});
describe('R1-B restore and deletion remain bounded',()=>{
 it('exact turn deletion has no blanket session delete',()=>{
  expect(erase).toContain('DELETE FROM conversation_turns ');
  expect(erase).toContain('WHERE id=ANY($1::uuid[]) AND user_id=$2 AND session_id=$3');
  expect(erase).not.toContain("DELETE FROM conversation_turns WHERE session_id = $1");
  expect(erase).toContain('await transaction');
 });
 it('the erasure routine is test-only and cannot enable production writes',()=>{
  expect(erase).toContain("process.env.NODE_ENV!=='test'");
  expect(erase).toContain("process.env.RF01_R1B_FICTIONAL_ERASURE_ENABLED!=='1'");
 });
 it('derived-member writes have a structural database quarantine trigger',()=>{
  expect(migration).toContain('rf01_refuse_quarantined_derived_insert');
  for(const table of ['episodic_memories','member_memory_atoms','member_sessions','maia_sessions'])
    expect(migration).toContain(table);
  expect(migration).toContain('RF01_DERIVED_INFLUENCE_HELD');
  expect(migration).toContain('BEFORE INSERT OR UPDATE');
 });
 it('governed restore first verifies hold and unswept scope state',()=>{
  const held=restore.indexOf('R1B_HELD_MEMBERS=');
  const scopes=restore.indexOf('R1B_UNSWEPT_SCOPES=');
  const opening=restore.indexOf('Restoring dump (governed lane declared)');
  expect(held).toBeGreaterThan(0);
  expect(scopes).toBeGreaterThan(held);
  expect(opening).toBeGreaterThan(scopes);
 });
 it('the legacy ungoverned restore override has been retired',()=>{
  expect(rawRestore).toContain('ungoverned database restore disabled');
  expect(rawRestore).not.toContain('!= "yes"');
  expect(rawRestore).toContain('exit 1');
 });
 it('background summary classification also refuses member-level erased-source influence',()=>{
  expect(summaryEligibility).toContain('rf01_member_erasure_holds');
  expect(summaryEligibility).toContain('row.erasure_hold_present');
 });
 it('the hold is not automatically lifted through a client flag or provider setting',()=>{
  expect(migration).not.toContain('ON DELETE CASCADE');
  expect(erase).not.toContain('DELETE FROM rf01_member_erasure_holds');
 });
});
