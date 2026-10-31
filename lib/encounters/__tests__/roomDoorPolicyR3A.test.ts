jest.mock('../threshold',()=>({verifyThresholdToken:jest.fn()}));
jest.mock('../consentLedgerStore',()=>({loadEncounterConsentContext:jest.fn(),loadEncounterConsentEvents:jest.fn(),
 scopeFromContext:(context:any,purpose:string)=>({encounterId:context.encounterId,participantId:context.participantId,purpose,
 agreementVersion:context.agreementVersion,generation:context.generation})}));
import {authorizeRoomEntry} from '../roomDoor';
import {verifyThresholdToken} from '../threshold';
import {loadEncounterConsentContext,loadEncounterConsentEvents} from '../consentLedgerStore';
const claims={encounterId:'enc-1',participantId:'p-1',agreementVersion:'v1',generation:2,exp:9999999999999};
const context={encounterId:'enc-1',participantId:'p-1',displayName:'Ari',role:'guest',agreementVersion:'v1',generation:2};
const event=(action:'grant'|'revoke')=>({...context,purpose:'join' as const,eventId:action,actorParticipantId:'p-1',action,createdAt:10});
describe('Room door Policy R3A',()=>{
 beforeEach(()=>{jest.resetAllMocks();(verifyThresholdToken as jest.Mock).mockReturnValue(claims);
  (loadEncounterConsentContext as jest.Mock).mockResolvedValue(context);});
 it('admits only a latest exact participant-authored join grant',async()=>{
  (loadEncounterConsentEvents as jest.Mock).mockResolvedValue([event('grant')]);
  await expect(authorizeRoomEntry('token','enc-1')).resolves.toMatchObject({ok:true,participantId:'p-1',generation:2});
 });
 it('refuses a superseded token generation before consulting consent',async()=>{
  (verifyThresholdToken as jest.Mock).mockReturnValue({...claims,generation:1});
  await expect(authorizeRoomEntry('token','enc-1')).resolves.toEqual({ok:false,status:403,reason:'stale_consent_scope'});
  expect(loadEncounterConsentEvents).not.toHaveBeenCalled();
 });
 it('refuses revocation and wrong-room replay',async()=>{
  (loadEncounterConsentEvents as jest.Mock).mockResolvedValue([event('grant'),{...event('revoke'),createdAt:11}]);
  await expect(authorizeRoomEntry('token','enc-1')).resolves.toEqual({ok:false,status:403,reason:'no_consent'});
  await expect(authorizeRoomEntry('token','enc-2')).resolves.toEqual({ok:false,status:403,reason:'wrong_room'});
 });
});
