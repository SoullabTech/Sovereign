import { describe, it, expect } from '@jest/globals';
import fs from 'node:fs';
import path from 'node:path';
const read=(p:string)=>fs.readFileSync(path.resolve(process.cwd(),p),'utf8');
const canonical=read('app/api/sovereign/app/maia/list/route.ts');
const between=read('app/api/between/chat/route.ts');
const web=read('components/OracleConversation.tsx');
const legacy=read('app/api/sovereign/app/maia/route.ts');
const voice=read('app/api/voice/stream-conversation/route.ts');
describe('RF01 S0-B pre-Send non-use ordering',()=>{
 it('canonical owned session and consent both precede early F1 content write',()=>{
   const owner=canonical.indexOf('await ensureOwnedMemberSession(acceptedSessionId, userId!)');
   const consent=canonical.indexOf('await verifyExplicitTurnConsent({');
   const f1=canonical.indexOf('memberTurnDurable = await TurnsStore.addExchangeTurn');
   expect(owner).toBeGreaterThan(0);
   expect(consent).toBeGreaterThan(owner);
   expect(f1).toBeGreaterThan(consent);
 });
 it('canonical denies unspecified and contradictory privacy before consent check',()=>{
   const resolution=canonical.indexOf("typeof rawSanctuary !== 'boolean'");
   const conflict=canonical.indexOf("'CONFLICTING_PRIVACY_SIGNALS'");
   const consent=canonical.indexOf('await verifyExplicitTurnConsent({');
   expect(resolution).toBeGreaterThan(0);
   expect(conflict).toBeGreaterThan(resolution);
   expect(consent).toBeGreaterThan(conflict);
 });
 it('Between requires verified consent before active-state, canon writes and providers',()=>{
   const receipt=between.indexOf('const consent = await verifyExplicitTurnConsent({');
   const active=between.indexOf('await touchActiveSession({');
   const canon=between.indexOf('await addConversationExchange(safeSessionId');
   expect(receipt).toBeGreaterThan(0);
   expect(active).toBeGreaterThan(receipt);
   expect(canon).toBeGreaterThan(active);
   expect(between).toContain('sanctuary: isSanctuary,');
 });
 it('legacy independent text and voice endpoints refuse before parsing member content',()=>{
   for(const route of [legacy,voice]) {
     const pos=route.indexOf("error: 'LEGACY_");
     const body=route.indexOf('await req.json()',route.indexOf('export async function POST'));
     expect(pos).toBeGreaterThan(0);
     expect(body).toBeGreaterThan(pos);
   }
 });
 it('web cannot dispatch without an explicit per-session choice and consent request',()=>{
   const handle=web.indexOf('const handleTextMessage = useCallback');
   const guard=web.indexOf('if (!privacyChoiceRef.current)',handle);
   const preflight=web.indexOf("apiFetch('/api/sovereign/privacy/turn-consent'",handle);
   const msgAppend=web.indexOf('setMessages(prev => appendMessageCapped(prev, userMessage!',handle);
   const normalSend=web.indexOf('response = await apiFetch(apiEndpoint',handle);
   expect(guard).toBeGreaterThan(handle);
   expect(preflight).toBeGreaterThan(guard);
   expect(msgAppend).toBeGreaterThan(preflight);
   expect(normalSend).toBeGreaterThan(preflight);
 });
 it('style commands cannot silently remove an already-chosen privacy posture',()=>{
   expect(web).toContain("const effectiveSanctuary = privacyChoiceRef.current !== 'continuity'");
   expect(web).not.toContain('else setIsSanctuary(false)');
 });
 it('browser conversation persistence excludes unresolved and Sanctuary sessions',()=>{
   expect(web).toContain("if (explicitSessionPrivacyChoice !== 'continuity' ||");
   expect(web).toContain("privacyChoiceRef.current !== 'continuity') return;");
 });
 it('conversation history cannot restore before explicit Continuity',()=>{
   const start=web.indexOf('const loadConversationHistory = async');
   const guard=web.indexOf("privacyChoiceRef.current !== 'continuity'",web.indexOf('// 💾 SOVEREIGN CONVERSATION PERSISTENCE: Load'));
   expect(guard).toBeGreaterThan(0);
   expect(guard).toBeLessThan(start);
   expect(web).toContain("if (cancelled || privacyChoiceRef.current !== 'continuity') return;");
   expect(web).toContain('return () => { cancelled = true; };');
 });

});
