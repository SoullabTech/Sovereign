/**
 * R44 disposable two-OS-process race client. This is NOT a member endpoint.
 * Never prints approval tokens, test issuer material, manuscript or SQL args.
 */
import {readFileSync} from 'node:fs';
import {closePool} from '@/lib/db/postgres';
import {claimHeldAuthorApprovalR44}
 from '@/lib/writersStudio/recovery/heldDurableAuthorApprovalR44';
import {WORK,view,selection,admission}
 from './fixtures/wsR44ChoiceFixture';
async function main(){
 if(process.env.R44_RACE_PROCESS_FIXTURE!=='fictional-only'||
    process.env.R44_DURABLE_APPROVAL_FIXTURE!=='fictional-only')
  throw Error('r44_process_race_disabled');
 const file=process.env.R44_FICTIONAL_ESCROW;
 if(!file)throw Error('r44_no_fictional_escrow');
 const f=JSON.parse(readFileSync(file,'utf8'));
 if(typeof f.rootHex!=='string'||!(/^[a-f0-9]{64}$/).test(f.rootHex)||
    typeof f.parallelToken!=='string')
  throw Error('r44_invalid_fictional_escrow');
 try{
  await claimHeldAuthorApprovalR44({
   admission,workId:WORK,currentView:view,selection:selection(),
   issuerSecret:Buffer.from(f.rootHex,'hex'),
   nowMs:f.nowMs,opaqueToken:f.parallelToken,
  });
  console.log('R44_PROCESS_CLAIMED_HELD');
 }catch{
  console.log('R44_PROCESS_REFUSED_HELD');
  process.exitCode=4;
 }finally{await closePool();}
}
main().catch(()=>{
 console.log('R44_PROCESS_FIXTURE_UNAVAILABLE');
 process.exitCode=8;
});
