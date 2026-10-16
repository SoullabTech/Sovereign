/** R21 HELD, offline-only encrypted revision history using real PostgreSQL.
 * No public routes, approved real keys, or deployed migration. All real member
 * writing stays disabled. Historical SQL/WAL backup migration remains HOLD.
 */
import {createHash} from 'node:crypto';
import type {KeyObject} from 'node:crypto';
import {query, transaction} from '@/lib/db/postgres';
import {sealWorkSnapshot,openWorkSnapshot,WorkRecoveryRefusal,
 type WorkRecord,type WorkEncryptionKey,type SealedWorkV1} from './workEnvelopeV1';
import {requireCurrentRestoreAuthorization,type SignedDeletionHighwaterV1,
 type IndependentGenerationWitness} from './deletionBarrierV1';
import type {HeldWriterRequestReviewR17} from './heldWriterSessionReviewR17';
export const R21_REAL_MEMBER_ENCRYPTED_WRITES_ENABLED=false as const;
export type R21HeldWriter=Extract<HeldWriterRequestReviewR17,{kind:'held_only'}>;
export type Trust={signed:SignedDeletionHighwaterV1|null;signer:KeyObject|null;
 independent:IndependentGenerationWitness|null};
export type Manifest={memberId:string;workId:string;generation:number;keyId:string;
 cipherDigest:string;previousDigest:string|null;state:'fictional_held_only'};
type Row={member_id:string;work_id:string;generation:number|string;key_id:string;
 cipher_digest:string;previous_digest:string|null;envelope:SealedWorkV1;state:string};
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA=/^[a-f0-9]{64}$/;
const fail=(code:string):never=>{throw new WorkRecoveryRefusal(code)};
const digest=(s:string)=>createHash('sha256').update(s,'utf8').digest('hex');
function admission(writer:R21HeldWriter):string{
 if(!writer||writer.kind!=='held_only'||writer.origin!=='https://soullab.life'||
 writer.subject?.assertedBy!=='server_verified_member_session'||
 !UUID.test(writer.subject?.memberId||''))fail('r21_unverified_preflight');
 return writer.subject.memberId.toLowerCase();
}
function workId(v:string):string{if(!UUID.test(v||''))fail('r21_bad_work');return v.toLowerCase();}
function guard(trust:Trust,memberId:string,work:string,generation:number,keyId:string){
 requireCurrentRestoreAuthorization({request:{workId:work,keyId,snapshotGeneration:generation},
 signed:trust?.signed??null,trustedSigner:trust?.signer??null,
 independent:trust?.independent??null});
}
function manifest(row:Row,memberId:string,work:string):Manifest{
 const generation=Number(row.generation);
 if(Object.keys(row.envelope||{}).sort().join(',')!=='ciphertext,iv,keyId,protocol,tag'||
 row.member_id!==memberId||row.work_id!==work||
 row.state!=='fictional_held_only'||!Number.isSafeInteger(generation)||
 generation<1||!UUID.test(row.key_id)||!SHA.test(row.cipher_digest)||
 (row.previous_digest!==null&&!SHA.test(row.previous_digest))||
 !row.envelope||digest(JSON.stringify({protocol:row.envelope.protocol,keyId:row.envelope.keyId,iv:row.envelope.iv,tag:row.envelope.tag,ciphertext:row.envelope.ciphertext}))!==row.cipher_digest)
 fail('r21_corrupt_manifest');
 return {memberId,workId:work,generation,keyId:row.key_id,
 cipherDigest:row.cipher_digest,previousDigest:row.previous_digest,
 state:'fictional_held_only'};
}
/** Serializes by author-owned Work row, writes ciphertext only to PG16. */
export async function appendHeldRevisionR21(input:{
 writer:R21HeldWriter;workId:string;generation:number;records:readonly WorkRecord[];
 key:WorkEncryptionKey;trust:Trust;
}):Promise<Manifest>{
 if(process.env.R21_FICTIONAL_ENCRYPTED_HISTORY!=='fictional-only') fail('r21_fixture_only');
 const memberId=admission(input.writer),work=workId(input.workId);
 if(!Number.isSafeInteger(input.generation)||input.generation<1)
 fail('r21_bad_generation');
 guard(input.trust,memberId,work,input.generation,input.key?.keyId);
 // Encryption precedes any SQL carrying writing or revision notes.
 const sealed=sealWorkSnapshot({memberId,workId:work,generation:input.generation},
 input.records,input.key);
 const ciphertextJson=JSON.stringify(sealed),cipherDigest=digest(ciphertextJson);
 return transaction(async tx=>{
 const owned=await tx.query<{id:string}>(`SELECT id FROM member_manuscripts
 WHERE id=$1 AND member_id=$2 FOR UPDATE`,[work,memberId]);
 if(owned.rows.length!==1)fail('r21_work_not_owned');
 const history=await tx.query<Row>(`SELECT member_id,work_id,generation,key_id,
 cipher_digest,previous_digest,envelope,state FROM writers_studio_r21_held_revisions
 WHERE work_id=$1 ORDER BY generation DESC LIMIT 1`,[work]);
 const prior=history.rows[0];
 if(input.generation!==(prior?Number(prior.generation)+1:1))
 fail('r21_stale_version');
 if(prior)manifest(prior,memberId,work);
 await tx.query(`INSERT INTO writers_studio_r21_held_revisions
 (member_id,work_id,generation,key_id,envelope,cipher_digest,previous_digest,state)
 VALUES($1,$2,$3,$4,$5::jsonb,$6,$7,'fictional_held_only')`,
 [memberId,work,input.generation,input.key.keyId,ciphertextJson,cipherDigest,
 prior?.cipher_digest??null]);
 return {memberId,workId:work,generation:input.generation,keyId:input.key.keyId,
 cipherDigest,previousDigest:prior?.cipher_digest??null,state:'fictional_held_only'};
 });
}
/** Reading historic versions requires same-member identity and live external deletion trust. */
export async function readHeldRevisionR21(input:{
 writer:R21HeldWriter;workId:string;generation:number;key:WorkEncryptionKey;trust:Trust;
}):Promise<{manifest:Manifest;records:WorkRecord[]}>{
 if(process.env.R21_FICTIONAL_ENCRYPTED_HISTORY!=='fictional-only') fail('r21_fixture_only');
 const memberId=admission(input.writer),work=workId(input.workId);
 if(!Number.isSafeInteger(input.generation)||input.generation<1)
 fail('r21_bad_generation');
 const r=await query<Row>(`SELECT r.member_id,r.work_id,r.generation,r.key_id,
 r.cipher_digest,r.previous_digest,r.envelope,r.state
 FROM writers_studio_r21_held_revisions r
 JOIN member_manuscripts m ON m.id=r.work_id AND m.member_id=r.member_id
 WHERE r.member_id=$1 AND r.work_id=$2 AND r.generation=$3`,
 [memberId,work,input.generation]);
 if(r.rows.length!==1)fail('r21_history_not_visible');
 const found=manifest(r.rows[0],memberId,work);
 if(input.generation===1 && found.previousDigest!==null)fail('r21_unexpected_prior_hash');
 if(input.generation>1){
  const prior=await query<Row>(`SELECT r.member_id,r.work_id,r.generation,r.key_id,
    r.cipher_digest,r.previous_digest,r.envelope,r.state
    FROM writers_studio_r21_held_revisions r
    JOIN member_manuscripts m ON m.id=r.work_id AND m.member_id=r.member_id
    WHERE r.member_id=$1 AND r.work_id=$2 AND r.generation=$3`,
    [memberId,work,input.generation-1]);
  if(prior.rows.length!==1 ||
   manifest(prior.rows[0],memberId,work).cipherDigest!==found.previousDigest)
   fail('r21_broken_history_chain');
 }
 if(found.keyId!==input.key?.keyId)fail('r21_wrong_key');
 guard(input.trust,memberId,work,input.generation,found.keyId);
 const records=openWorkSnapshot({memberId,workId:work,generation:input.generation},
 r.rows[0].envelope,input.key);
 return {manifest:found,records};
}
