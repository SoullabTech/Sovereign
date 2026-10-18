/**
 * R70.19C negative-only tests on disposable COPIES of an already accepted
 * fictional generation. No real data, production access or live key read.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {cpSync,chmodSync,readFileSync,writeFileSync,rmSync,
  mkdirSync,readdirSync,unlinkSync,symlinkSync} from 'node:fs';
import path from 'node:path';
import {verifyR7019CFictionalCompletePoint} from '../wsBetaR7019CEncryptedFixture';

const E=process.env.R7019C_ACCEPTED_EVIDENCE_DIR||'';
const HEAD=process.env.R7019C_ACCEPTED_SOURCE_HEAD||'';
assert.equal(process.env.R7019C_TEST_MODE,'fictional-only');
assert.match(E,/^\/Volumes\/T7 Shield\/ws-beta-r7019c-[a-z0-9-]+$/);
assert.match(HEAD,/^[a-f0-9]{40}$/);
const src=readdirSync(E).filter(x=>/^complete-[a-f0-9]{12}$/.test(x));
assert.equal(src.length,1);
const accepted=path.join(E,src[0]);
const staging=path.join(E,'r7019c-negative-only-copies');
mkdirSync(staging,{mode:0o700});
const clones:string[]=[];
function clone(name:string){
 const root=path.join(staging,name);
 const p=path.join(root,src[0]);
 mkdirSync(root,{mode:0o700});
 cpSync(accepted,p,{recursive:true,force:false,errorOnExist:true});
 chmodSync(p,0o700);
 for(const f of readdirSync(p))chmodSync(path.join(p,f),0o600);
 clones.push(root);
 return p;
}
test.after(()=>{for(const p of clones){
  rmSync(p,{recursive:true,force:true});
 }rmSync(staging,{recursive:true,force:true});});

test('complete generation still refuses production admission',()=>{
 const r=verifyR7019CFictionalCompletePoint(accepted,HEAD);
 assert.equal(r.hasDatabaseCiphertext,true);
 assert.equal(r.hasVaultCiphertext,true);
 assert.equal(r.productionRestoreApproved,false);
 assert.equal(r.realMemberAdmissionApproved,false);
 assert.equal(r.containsIndependentErasureAuthority,false);
});
test('missing vault cipher refuses instead of treating database-only as complete',()=>{
 const p=clone('no-vault');unlinkSync(path.join(p,'vault.tar.gpg'));
 assert.throws(()=>verifyR7019CFictionalCompletePoint(p,HEAD),
  /R7019C_SEALED_REFUSED_incomplete_generation/);
});
test('tampered encrypted database with unchanged digest refuses',()=>{
 const p=clone('tampered');
 const f=path.join(p,'database.pgdump.gpg');
 writeFileSync(f,Buffer.concat([readFileSync(f),Buffer.from('TAMPER')]));
 chmodSync(f,0o600);
 assert.throws(()=>verifyR7019CFictionalCompletePoint(p,HEAD),
  /R7019C_SEALED_REFUSED_ciphertext_integrity_failure/);
});
test('forged release flags cannot promote an encrypted archive',()=>{
 const p=clone('forged');
 const f=path.join(p,'manifest.json');
 const j=JSON.parse(readFileSync(f,'utf8'));
 j.releaseApproved=true;j.externalErasureAuthorityVerified=true;
 writeFileSync(f,JSON.stringify(j));chmodSync(f,0o600);
 assert.throws(()=>verifyR7019CFictionalCompletePoint(p,HEAD),
  /R7019C_SEALED_REFUSED_untrusted_generation_manifest/);
});
test('symlinked external cipher refuses instead of following link',()=>{
 const p=clone('symlinked');
 const f=path.join(p,'vault.tar.gpg');
 unlinkSync(f);symlinkSync(path.join(accepted,'vault.tar.gpg'),f);
 assert.throws(()=>verifyR7019CFictionalCompletePoint(p,HEAD),
  /R7019C_SEALED_REFUSED_weak_cipher_file_permissions/);
});
test('weak file mode and unexpected generation member refuse',()=>{
 const p=clone('weak');chmodSync(path.join(p,'database.pgdump.gpg'),0o644);
 assert.throws(()=>verifyR7019CFictionalCompletePoint(p,HEAD),
  /R7019C_SEALED_REFUSED_weak_cipher_file_permissions/);
 const p2=clone('extra');writeFileSync(path.join(p2,'extra.txt'),'FICTIONAL');
 assert.throws(()=>verifyR7019CFictionalCompletePoint(p2,HEAD),
  /R7019C_SEALED_REFUSED_incomplete_generation/);
});
test('unknown source revision cannot inherit another source approval',()=>{
 assert.throws(()=>verifyR7019CFictionalCompletePoint(accepted,'0'.repeat(40)),
  /R7019C_SEALED_REFUSED_untrusted_generation_manifest/);
});
