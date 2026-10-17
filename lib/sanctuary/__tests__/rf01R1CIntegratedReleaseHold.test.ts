/**
 * RF01 R1-C — source custody of one continuous A1→R1-C candidate.
 * Does not substitute for witnessed Next.js, Safari or native tests.
 */
import {describe,it,expect} from '@jest/globals';
import fs from 'node:fs';
import path from 'node:path';
const read=(p:string)=>fs.readFileSync(path.join(process.cwd(),p),'utf8');
const canonical=read('app/api/sovereign/app/maia/list/route.ts');
const between=read('app/api/between/chat/route.ts');
const erasure=read('lib/sanctuary/exactTurnErasure.ts');
const migration=read('database/migrations/20261017113000_rf01_r1c_erasure_write_fence.sql');
const restore=read('scripts/restore-governed.sh');
const service=read('lib/sanctuary/protectedTextReply.ts');
const grant=read('lib/sanctuary/externalProcessingGrant.ts');
const s1a=read('lib/sanctuary/processingQualification.ts');

describe('RF01 one-source release candidate keeps every primary privacy authority',()=>{
 it('canonical authentication, ownership, consent, S1-A and R1-B remain in order',()=>{
   const auth=canonical.indexOf('const userId = await resolveMemberIdentity(req)');
   const influence=canonical.indexOf('await assertMemberInfluenceAllowed(userId!)');
   const owner=canonical.indexOf('await ensureOwnedMemberSession(acceptedSessionId, userId!)');
   const consent=canonical.indexOf('await verifyExplicitTurnConsent({');
   const hold=canonical.indexOf('requireQualifiedConversationProcessing({ sanctuary: isSanctuary })');
   const f1=canonical.indexOf('memberTurnDurable = await TurnsStore.addExchangeTurn');
   expect(auth).toBeGreaterThan(0);
   expect(influence).toBeGreaterThan(auth);
   expect(owner).toBeGreaterThan(influence);
   expect(consent).toBeGreaterThan(owner);
   expect(hold).toBeGreaterThan(consent);
   expect(f1).toBeGreaterThan(hold);
 });
 it('canonical generation is followed by another custody read before content use',()=>{
   const generation=canonical.indexOf("      'getMaiaResponse',");
   const after=canonical.indexOf('await assertMemberInfluenceAllowed(userId!)',generation);
   const sideEffect=canonical.indexOf('observeRelationalContent(',generation);
   const final=canonical.indexOf('const response = jsonWithCors(req, responseData',generation);
   const returnResponse=canonical.indexOf('return response;',generation);
   expect(generation).toBeGreaterThan(0);
   expect(after).toBeGreaterThan(generation);
   expect(after).toBeLessThan(sideEffect);
   expect(after).toBeLessThan(final);
   expect(returnResponse).toBeGreaterThan(final);
 });
 it('canonical response rechecks again before background observations',()=>{
   const generation=canonical.indexOf("      'getMaiaResponse',");
   const first=canonical.indexOf('await assertMemberInfluenceAllowed(userId!)',generation);
   const second=canonical.indexOf('await assertMemberInfluenceAllowed(userId!)',first+20);
   const observe=canonical.indexOf('observeRelationalContent(',generation);
   const shadow=canonical.indexOf('launchRelationalFieldShadow(',observe);
   expect(second).toBeGreaterThan(first);
   expect(second).toBeLessThan(observe);
   expect(shadow).toBeGreaterThan(observe);
 });
 it('Between safe and full-generation pathways have post-await influence checks',()=>{
   const simple=between.indexOf('const simpleResult = await generateSimpleMaiaResponse(');
   const simpleAfter=between.indexOf('await assertMemberInfluenceAllowed(authUserId)',simple);
   const safeReturn=between.indexOf('return withSessionCookie(response, sessionCookie)',simple);
   const full=between.indexOf('const [orchestratorResult, consultationResult] = await Promise.all');
   const fullAfter=between.indexOf('await assertMemberInfluenceAllowed(authUserId)',full);
   const fullReturn=between.indexOf('return withSessionCookie(response2, sessionCookie)',full);
   expect(simple).toBeGreaterThan(0);
   expect(simpleAfter).toBeGreaterThan(simple);
   expect(simpleAfter).toBeLessThan(safeReturn);
   expect(fullAfter).toBeGreaterThan(full);
   expect(fullAfter).toBeLessThan(fullReturn);
 });
 it('a late refusal is generic and does not attach the generated answer',()=>{
   expect(canonical).toContain('return jsonWithCors(req, influenceHoldResponse(err), 503);');
   expect(between).toContain('return NextResponse.json(influenceHoldResponse(err), { status: 503 });');
 });
 it('database fencing serializes all five material-bearing lanes',()=>{
   for(const lane of [
      'conversation_turns','episodic_memories','member_memory_atoms',
      'member_sessions','maia_sessions',
   ])expect(migration).toContain(lane);
   expect(migration).toContain('BEFORE INSERT OR UPDATE');
   expect(migration).toContain('pg_catalog.pg_advisory_xact_lock');
   expect(migration).toContain('RF01_ERASED_MEMBER_CONTENT_WRITE_REFUSED');
   expect(migration).toContain('RF01_SESSION_OWNER_IMMUTABLE');
 });
 it('exact erasure obtains the same advisory lock before taking row locks',()=>{
   const advisory=erasure.indexOf('SELECT pg_advisory_xact_lock(hashtextextended($1::text,81017))');
   const ownership=erasure.indexOf('SELECT member_id FROM maia_sessions WHERE id=$1 FOR UPDATE');
   const deleteSql=erasure.indexOf('DELETE FROM conversation_turns ');
   expect(advisory).toBeGreaterThan(0);
   expect(advisory).toBeLessThan(ownership);
   expect(ownership).toBeLessThan(deleteSql);
 });
 it('S5 tombstones stay authoritative and R1-C fence runs later alphabetically',()=>{
   expect(migration).toContain('zz_rf01_r1c_content_fence_trg');
   expect(migration).toContain('S5');
   expect(erasure).toContain('INSERT INTO provenance_tombstones');
 });
 it('member-only restore scopes still refuse before reading the dump',()=>{
   const scopes=restore.indexOf('R1B_UNSWEPT_SCOPES=');
   const opening=restore.indexOf('Restoring dump (governed lane declared)');
   expect(scopes).toBeGreaterThan(0);
   expect(scopes).toBeLessThan(opening);
 });
 it('known immediate serving logs do not print member or generated-text previews',()=>{
   for(const source of [canonical,between]) {
     expect(source).not.toContain('preview: message.slice(0, 120)');
   }
   expect(canonical).not.toContain('original_preview: orchestratorResult.text.slice');
   expect(canonical).not.toContain('replacement_preview: _memoryScrub.slice');
   expect(between).not.toContain('title: ideaCandidate.title,');
 });
 it('public Sanctuary stays held and the fictional responder is still unmounted',()=>{
   expect(canonical).toContain('requireQualifiedConversationProcessing({ sanctuary: isSanctuary })');
   expect(canonical).not.toContain('produceFictionalProtectedTextReply');
   expect(service).toContain("process.env.NODE_ENV !== 'test'");
   expect(s1a).toContain('SANCTUARY_PROCESSING_UNQUALIFIED');
   expect(grant).toContain("process.env.RF01_S1B_PROVIDER_DISPATCH_ENABLED !== '1'");
 });
});
