import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  RECEPTIVE_SHELF_FORMAT, RECEPTIVE_SHELF_MAX_FIELDS,
  RECEPTIVE_INVITATIONS, ORIGINAL_RECEPTIVE_CONTROLS,
  RECEPTIVE_INTENTIONS, newReceptiveRecipe, validatedReceptiveControls,
  validatedReceptiveIntentions, validateReceptiveRecipe,
  exportReceptiveShelf, importReceptiveShelf,
} from '../../lib/listening/receptiveField.ts';
import {
  encryptReceptiveFields, decryptReceptiveFields,
  PRIVATE_RECEPTIVE_BACKUP_FORMAT,MAX_RECEPTIVE_PRIVATE_BACKUP_BYTES,
} from '../../lib/listening/receptiveFieldBackup.ts';

const password='two rivers with gentleness and depth';
const sample=newReceptiveRecipe('Grace and remembrance','rest',
  {pulse:35,space:85,density:25},['remember','center'],'field-12345678abcd');

test('defaults preserve the original low-gain review study',()=>{
 assert.deepEqual(ORIGINAL_RECEPTIVE_CONTROLS,{pulse:50,space:50,density:50});
 assert.equal(Object.isFrozen(ORIGINAL_RECEPTIVE_CONTROLS),true);
});
test('four accessible receiving invitations include warmth, space, release and rest',()=>{
 assert.equal(RECEPTIVE_INVITATIONS.length,4);
 assert(RECEPTIVE_INVITATIONS.some(v=>v.intention==='release'));
 assert(RECEPTIVE_INVITATIONS.some(v=>v.controls.space>v.controls.pulse));
 assert(RECEPTIVE_INVITATIONS.some(v=>v.controls.pulse>v.controls.space));
});
test('person names her own field and self-selects interpretations',()=>{
 assert.equal(sample.title,'Grace and remembrance');
 assert.deepEqual(sample.intentions,['remember','center']);
 assert.equal(sample.source,'soullab-original-sketch-v1');
});
test('note-free recipes include no inferred emotional diagnoses',()=>{
 const keys=Object.keys(sample);
 assert.deepEqual(keys,['id','title','source','journey','controls','intentions']);
 assert(!JSON.stringify(sample).includes('memberId'));
});
test('three dials remain independent, bounded and step-adjusted',()=>{
 assert.deepEqual(validatedReceptiveControls({pulse:77,space:33,density:50}),{pulse:75,space:35,density:50});
 for(const pulse of [NaN,Infinity,-1,101,'50',undefined]){
  assert.throws(()=>validatedReceptiveControls({pulse,space:50,density:50}));
 }
});
test('unknown, repeated and coercive intention labels are refused',()=>{
 assert.deepEqual(validatedReceptiveIntentions([]),[]);
 assert.throws(()=>validatedReceptiveIntentions(['unknown']));
 assert.throws(()=>validatedReceptiveIntentions(['release','release']));
 assert.throws(()=>validatedReceptiveIntentions(['release','grieve','rest','center','explore']));
 assert(RECEPTIVE_INTENTIONS.some(x=>x.id==='grieve'));
});
test('unsupported musical sources cannot receive a remix-sounding save receipt',()=>{
 const fake={...sample,source:'spotify-audio-copy'};
 assert.throws(()=>validateReceptiveRecipe(fake));
 assert.throws(()=>validateReceptiveRecipe({...sample,journey:'healing-clinic'}));
});
test('ids and untrusted strings are checked before import',()=>{
 assert.throws(()=>validateReceptiveRecipe({...sample,id:'admin'}));
 assert.throws(()=>validateReceptiveRecipe({...sample,title:'\u0000   \n'}));
 assert.equal(validateReceptiveRecipe({...sample,title:' Evening \u0000  grace  '}).title,'Evening grace');
});
test('recipes roundtrip exactly under an explicit v1 export',()=>{
 const wire=exportReceptiveShelf([sample]);
 assert.equal(JSON.parse(wire).format,RECEPTIVE_SHELF_FORMAT);
 assert.deepEqual(importReceptiveShelf(wire),[sample]);
});
test('import never accepts unknown source, unsafe controls or duplicate ids',()=>{
 const parsed=JSON.parse(exportReceptiveShelf([sample]));
 parsed.fields[0].source='external-reference';
 assert.throws(()=>importReceptiveShelf(JSON.stringify(parsed)));
 parsed.fields[0].source=sample.source;
 parsed.fields[0].controls.pulse=500;
 assert.throws(()=>importReceptiveShelf(JSON.stringify(parsed)));
 parsed.fields[0].controls.pulse=sample.controls.pulse;
 parsed.fields.push(parsed.fields[0]);
 assert.throws(()=>importReceptiveShelf(JSON.stringify(parsed)));
});
test('shelf bounds remain small and never include actual sound bytes',()=>{
 assert.equal(RECEPTIVE_SHELF_MAX_FIELDS,24);
 assert.throws(()=>exportReceptiveShelf(Array.from({length:25},(_,i)=>({...sample,id:'field-12345678abcd'+i}))));
 assert.throws(()=>importReceptiveShelf('X'.repeat(64*1024+1)));
});
test('no unknown future encrypted-backup version is silently accepted',async()=>{
 const original=JSON.parse(await encryptReceptiveFields([sample],password));
 for(const change of [{version:2},{format:'WRONG'}, {kdf:'PBKDF2-SHA256-1'}, {cipher:'AES-CBC'}]){
  await assert.rejects(()=>decryptReceptiveFields(JSON.stringify({...original,...change}),password));
 }
});
test('AES-GCM portable backup roundtrips with no member or audio files',async()=>{
 const sealed=await encryptReceptiveFields([sample],password);
 const envelope=JSON.parse(sealed);
 assert.equal(envelope.format,PRIVATE_RECEPTIVE_BACKUP_FORMAT);
 assert.equal(envelope.cipher,'AES-256-GCM');
 assert.equal(envelope.kdf,'PBKDF2-SHA256-600000');
 assert(!sealed.includes('Grace and remembrance'));
 assert(!sealed.includes('remember'));
 assert.deepEqual(await decryptReceptiveFields(sealed,password),[sample]);
});
test('same field encrypts with independent salt and nonce',async()=>{
 const a=JSON.parse(await encryptReceptiveFields([sample],password));
 const b=JSON.parse(await encryptReceptiveFields([sample],password));
 assert.notEqual(a.salt,b.salt);
 assert.notEqual(a.iv,b.iv);
 assert.notEqual(a.ciphertext,b.ciphertext);
});
test('wrong passphrase, ciphertext and IV tampering always refuse',async()=>{
 const sealed=await encryptReceptiveFields([sample],password);
 await assert.rejects(()=>decryptReceptiveFields(sealed,'a very different private phrase'));
 const bad=JSON.parse(sealed);
 bad.ciphertext=bad.ciphertext.slice(0,-4)+'AAAA';
 await assert.rejects(()=>decryptReceptiveFields(JSON.stringify(bad),password));
 bad.iv='AA==';
 await assert.rejects(()=>decryptReceptiveFields(JSON.stringify(bad),password));
});
test('short passphrases and oversize encrypted backup refuse',async()=>{
 await assert.rejects(()=>encryptReceptiveFields([sample],'short'));
 await assert.rejects(()=>decryptReceptiveFields('[]','short'));
 await assert.rejects(()=>decryptReceptiveFields('A'.repeat(MAX_RECEPTIVE_PRIVATE_BACKUP_BYTES+1),password));
});
test('private module never contacts third parties or persists music history',()=>{
 for(const file of ['lib/listening/receptiveField.ts','lib/listening/receptiveFieldBackup.ts']){
   const source=readFileSync(resolve(process.cwd(),file),'utf8');
   const executable=source.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'');
   assert.doesNotMatch(executable,/\bfetch\s*\(|XMLHttpRequest|\b(?:window|globalThis)\.(?:localStorage|sessionStorage)|navigator\.mediaDevices|new\s+Audio\(/);
 }
});
