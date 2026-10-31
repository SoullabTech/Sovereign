import {
 appendEncounterConsentDecision,decideStoredEncounterConsent,loadEncounterConsentContext,
 loadEncounterConsentEvents,scopeFromContext,type ConsentQueryable,
} from '../consentLedgerStore';
const scope={encounterId:'enc-1',participantId:'p-1',purpose:'join' as const,agreementVersion:'v1',generation:2};
function row(action:'grant'|'refuse'|'revoke',at:number,id:string=action){return {event_id:id,encounter_id:'enc-1',participant_id:'p-1',
 actor_participant_id:'p-1',purpose:'join',action,agreement_version:'v1',generation:2,decided_at_ms:at};}
describe('EXP-21 consent ledger store',()=>{
 it('loads current version/generation context and constructs an exact purpose scope',async()=>{
  const database={query:jest.fn(async()=>({rows:[{encounter_id:'enc-1',participant_id:'p-1',display_name:'Ari',role:'guest',
   consent_agreement_version:'v1',consent_generation:2}]}))} as unknown as ConsentQueryable;
  const context=await loadEncounterConsentContext('enc-1','p-1',database);
  expect(context).toMatchObject({agreementVersion:'v1',generation:2,displayName:'Ari'});
  expect(scopeFromContext(context!,'record_audio')).toEqual({...scope,purpose:'record_audio'});
 });
 it('loads only the exact non-legacy scope and lets the pure law decide latest state',async()=>{
  const database={query:jest.fn(async()=>({rows:[row('grant',10),row('revoke',11)]}))} as unknown as ConsentQueryable;
  expect(await loadEncounterConsentEvents(scope,database)).toHaveLength(2);
  expect(await decideStoredEncounterConsent(scope,database)).toMatchObject({allowed:false,reason:'revoked'});
  const sql=(database.query as jest.Mock).mock.calls[0][0] as string;
  expect(sql).toContain('legacy_provenance = FALSE');expect(sql).toContain('agreement_version = $4');
 });
 it('derives the decision actor from the scoped participant and appends rather than upserting',async()=>{
  const database={query:jest.fn(async()=>({rows:[row('grant',12,'new-event')]}))} as unknown as ConsentQueryable;
  const result=await appendEncounterConsentDecision({...scope,action:'grant',textSnapshot:'exact words'},database);
  expect(result.actorParticipantId).toBe('p-1');
  const [sql,params]=(database.query as jest.Mock).mock.calls[0];
  expect(sql).toContain('actor_participant_id');expect(sql).not.toContain('ON CONFLICT');
  expect(sql).toContain('e.consent_agreement_version = $5');expect(sql).toContain('e.consent_generation = $6');
  expect(params).toEqual(['enc-1','p-1','join','grant','v1',2,'exact words']);
 });
 it('refuses a decision when the current consent scope changed before append',async()=>{
  const database={query:jest.fn(async()=>({rows:[]}))} as unknown as ConsentQueryable;
  await expect(appendEncounterConsentDecision({...scope,action:'grant'},database))
    .rejects.toThrow('CONSENT_SCOPE_STALE_OR_UNKNOWN');
 });
});
