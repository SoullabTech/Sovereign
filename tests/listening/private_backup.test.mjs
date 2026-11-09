import { test } from 'node:test';
import assert from 'node:assert/strict';
import {encryptListeningExport,decryptListeningExport,MAX_PRIVATE_BACKUP_BYTES,PRIVATE_BACKUP_FORMAT} from '../../lib/listening/privateBackup.ts';
import { SOULLAB_EXPORT_FORMAT } from '../../lib/listening/portableCollections.ts';
const passphrase='correct horse battery neighborhood library';
const fixture=JSON.stringify({format:SOULLAB_EXPORT_FORMAT,collections:[{id:'member-generated',name:'Existential Bliss',provider:'Spotify',link:'https://open.spotify.com/playlist/123',tracks:[{title:'Night City',artist:'Original Artist',album:'Sound',url:null,service:null}]}],journal:'Dreaming with music.'});

test('AES-256-GCM PBKDF2 backup round trips without metadata loss',async()=>{
 const sealed=await encryptListeningExport(fixture,passphrase);
 const wrapper=JSON.parse(sealed);
 assert.equal(wrapper.format, PRIVATE_BACKUP_FORMAT);
 assert.equal(wrapper.kdf,'PBKDF2-SHA256-600000');
 assert.equal(wrapper.cipher,'AES-256-GCM');
 assert.equal(sealed.includes('Dreaming with music.'),false);
 assert.equal(sealed.includes('Existential Bliss'),false);
 const opened=await decryptListeningExport(sealed,passphrase);
 assert.equal(opened.collections[0].name,'Existential Bliss');
 assert.equal(opened.journal,'Dreaming with music.');
});
test('new backup always has fresh randomness',async()=>{
 const a=JSON.parse(await encryptListeningExport(fixture,passphrase));
 const b=JSON.parse(await encryptListeningExport(fixture,passphrase));
 assert.notEqual(a.salt,b.salt);
 assert.notEqual(a.iv,b.iv);
 assert.notEqual(a.ciphertext,b.ciphertext);
});
test('wrong password and ciphertext tampering are rejected',async()=>{
 const sealed=await encryptListeningExport(fixture,passphrase);
 await assert.rejects(()=>decryptListeningExport(sealed,'a very different long passphrase'),/Unable to unlock/);
 const e=JSON.parse(sealed);
 const offset=15;
 e.ciphertext=e.ciphertext.slice(0,offset)+(e.ciphertext[offset]==='A'?'B':'A')+e.ciphertext.slice(offset+1);
 await assert.rejects(()=>decryptListeningExport(JSON.stringify(e),passphrase),/Unable to unlock/);
});
test('IV, salt, format, and KDF downgrades are refused',async()=>{
 const e=JSON.parse(await encryptListeningExport(fixture,passphrase));
 for(const delta of [{iv:'A'},{salt:'AA=='},{format:'other'},{kdf:'PBKDF2-SHA256-1'}, {version:2}, {cipher:'AES-CBC'}]) {
  await assert.rejects(()=>decryptListeningExport(JSON.stringify({...e,...delta}),passphrase));
 }
});
test('invalid plain text and undersized passwords are not exportable',async()=>{
 await assert.rejects(()=>encryptListeningExport('{"format":"FAKE"}',passphrase));
 await assert.rejects(()=>encryptListeningExport(fixture,'too short'));
 await assert.rejects(()=>decryptListeningExport('[]','too short'));
});
test('no unbounded encrypted payload acceptance',async()=>{
 await assert.rejects(()=>decryptListeningExport('X'.repeat(MAX_PRIVATE_BACKUP_BYTES+1),passphrase));
 const e=JSON.parse(await encryptListeningExport(fixture,passphrase));
 e.ciphertext='A'.repeat(8*1024*1024);
 await assert.rejects(()=>decryptListeningExport(JSON.stringify(e),passphrase));
});
test('encrypted backup cannot launder unsafe imported provider links',async()=>{
 const forged=JSON.stringify({format:SOULLAB_EXPORT_FORMAT,collections:[{name:'x',link:'javascript:alert(1)',tracks:[]}],journal:'x'});
 await assert.rejects(()=>encryptListeningExport(forged,passphrase));
});
