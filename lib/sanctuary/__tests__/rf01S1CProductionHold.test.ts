/**
 * RF01 S1-C: acceptance of fixture-only processing must not silently lift the
 * live MAIA Sanctuary hold or authorize a production processing grant.
 */
import fs from 'node:fs';
import path from 'node:path';
const read=(file:string)=>fs.readFileSync(path.join(process.cwd(),file),'utf8');
const route=read('app/api/sovereign/app/maia/list/route.ts');
const service=read('lib/sanctuary/protectedTextReply.ts');
const adapter=read('lib/ai/claudeClient.ts');
const consent=read('app/api/sovereign/privacy/processing-grant/route.ts');
const dispatch=read('lib/sanctuary/protectedDispatchReservation.ts');
const migration=read('database/migrations/20261017000100_rf01_s1c_protected_dispatch_reservations.sql');

describe('S1-C public release HOLD stays intact',()=>{
  it('the real MAIA ingress still refuses protected processing',()=>{
    expect(route).toContain('requireQualifiedConversationProcessing({ sanctuary: isSanctuary });');
    const hold=route.indexOf('requireQualifiedConversationProcessing({ sanctuary: isSanctuary })');
    const f1=route.indexOf('memberTurnDurable = await TurnsStore.addExchangeTurn');
    const generation=route.indexOf('getMaiaResponse({',f1);
    expect(hold).toBeGreaterThan(0);
    expect(f1).toBeGreaterThan(hold);
    expect(generation).toBeGreaterThan(f1);
  });
  it('the fictional responder is not mounted on any public MAIA route',()=>{
    expect(route).not.toContain('produceFictionalProtectedTextReply');
    expect(route).not.toContain("from '@/lib/sanctuary/protectedTextReply'");
  });
  it('service is restricted to the Jest environment AND explicit fixture flag',()=>{
    expect(service).toContain("process.env.NODE_ENV !== 'test'");
    expect(service).toContain("process.env.RF01_S1C_FICTIONAL_RESPONSE_ENABLED !== '1'");
  });
  it('the processor issuer and S1C reservations each remain default-off',()=>{
    expect(consent).toContain("process.env.RF01_S1B_GRANT_WRITES_ENABLED !== '1'");
    expect(dispatch).toContain("process.env.RF01_S1C_DISPATCH_RESERVATIONS_ENABLED !== '1'");
  });
  it('a protected SDK call must claim one reservation with automatic retries disabled',()=>{
    const grant=adapter.indexOf('await requireAnthropicTurnGrant(meta)');
    const reserve=adapter.indexOf('await requireProtectedTextDispatch(meta)');
    const sdk=adapter.indexOf('client.messages.create(');
    expect(grant).toBeGreaterThan(0);
    expect(reserve).toBeGreaterThan(grant);
    expect(sdk).toBeGreaterThan(reserve);
    expect(adapter).toContain('{ maxRetries: 0 }');
  });
  it('private responder imports no memory, storage, telemetry or speech services',()=>{
    for(const forbidden of [
      'TurnsStore','synthesizeMaiaVoice','getConversationHistory',
      'logAINShapeTelemetry','processNameChangeIfDetected','SessionSummaryStore',
      'conversation_turns','addConversationExchange',
    ])expect(service).not.toContain(forbidden);
  });
  it('dispatch reservation contains no member message, response, or content hash',()=>{
    for(const prohibited of [
      'prompt TEXT','content TEXT','response TEXT',
      'content_hash','message_hash','raw_member_text',
    ])expect(migration).not.toContain(prohibited);
  });
});
