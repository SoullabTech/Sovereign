/**
 * R33 disposable cold-reopen child; called only over parent-local private IPC.
 * Test-only encryption keys, signed checkpoint and fictional text are supplied
 * transiently, not via shell arguments, environment variables or SQL.
 */
import {createPublicKey} from 'node:crypto';
import {reopenDraftR33} from '../../lib/writersStudio/recovery/heldAuthorEditsR33';
import {closePool} from '../../lib/db/postgres';

if(process.env.R33_EDITORIAL_HISTORY_FIXTURE!=='fictional-only'||
   process.env.R23_VAULT_HISTORY_FIXTURE!=='fictional-only'||
   process.env.R33_COLD_CHILD_FIXTURE!=='fictional-only')
 throw Error('R33_COLD_REOPEN_CHILD_ONLY');
if(!process.send) throw Error('R33_CHILD_IPC_REQUIRED');
let once=false;
process.on('message',async(value:unknown)=>{
 if(once)return;
 once=true;
 try{
  const msg=value as {
    subject:{memberId:string;assertedBy:'server_verified_member_session'};
    workId:string;generation:number;expectedText:string;
    keyId:string;keyBase64:string;
    signedDeletion:{checkpoint:any;signature:string};
    signerPublicPEM:string;independentMinimum:number;
  };
  const keyBytes=Buffer.from(msg.keyBase64,'base64');
  if(keyBytes.length!==32)throw Error('bad_fixture_key');
  const result=await reopenDraftR33({
    subject:msg.subject,workId:msg.workId,generation:msg.generation,
    custody:{
      key:{keyId:msg.keyId,keyBytes},signedDeletion:msg.signedDeletion,
      trustedSigner:createPublicKey(msg.signerPublicPEM),
      independent:{minimumGeneration:msg.independentMinimum},
    },
  });
  keyBytes.fill(0);
  const passed=result.text===msg.expectedText&&result.action==='undo'&&
    result.manifest.generation===msg.generation;
  process.send?.({kind:'r33_cold_fixture_result',passed});
 }catch{
  process.send?.({kind:'r33_cold_fixture_result',passed:false});
 }finally{
  await closePool().catch(()=>undefined);
  setImmediate(()=>process.exit(0));
 }
});
