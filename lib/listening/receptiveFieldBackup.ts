/** LISTEN-23 · PORTABLE, MEMBER-CUSTODIED receptive field export (review only).
 * No localStorage, server account, sync, recovery claims, recording, telemetry.
 * Independently security-review before a real member release.
 */
import {
  exportReceptiveShelf, importReceptiveShelf,
  RECEPTIVE_SHELF_FORMAT, RECEPTIVE_SHELF_MAX_BYTES,
} from './receptiveField';
import type { ReceptiveFieldRecipe } from './receptiveField';

export const PRIVATE_RECEPTIVE_BACKUP_FORMAT = 'SOULLAB_LISTEN_RECEPTIVE_PRIVATE_V1';
export const MAX_RECEPTIVE_PRIVATE_BACKUP_BYTES = 128 * 1024;
const KDF_ITERATIONS=600_000;
const SALT_BYTES=16;
const IV_BYTES=12;
const TAG_BYTES=16;
const aadText='SOULLAB_RECEPTIVE_FIELD_PRIVATE_AAD_V1';
type Envelope = {
  format:typeof PRIVATE_RECEPTIVE_BACKUP_FORMAT;
  version:1;
  kdf:'PBKDF2-SHA256-600000';
  cipher:'AES-256-GCM';
  salt:string;iv:string;ciphertext:string;
};

function utf8(text:string) { return new TextEncoder().encode(text); }
function requirePassword(value:string) {
  if(typeof value !== 'string' || value.length<12 || utf8(value).length>1024)
    throw new Error('Use a private passphrase of 12 or more characters (1024 bytes maximum).');
}
function localCrypto(): Crypto {
  if (typeof crypto==='undefined' || !crypto.subtle || !crypto.getRandomValues)
    throw new Error('Encrypted fields need a secure browser context (HTTPS or localhost).');
  return crypto;
}
function base64(data:Uint8Array):string {
  let s='';
  for (let offset=0;offset<data.length;offset+=8192)
    s+=String.fromCharCode(...data.subarray(offset,offset+8192));
  return btoa(s);
}
function decodeBase64(value:unknown,maxBytes:number):Uint8Array {
  if(typeof value!=='string' || value.length>Math.ceil(maxBytes/3)*4+4 ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value))
    throw new Error('Unrecognized private field backup.');
  let source:string;
  try {source=atob(value)} catch {throw new Error('Unrecognized private field backup.');}
  if(source.length>maxBytes)throw new Error('Unrecognized private field backup.');
  return Uint8Array.from(source, ch=>ch.charCodeAt(0));
}
async function derive(passphrase:string,salt:Uint8Array):Promise<CryptoKey> {
  const c=localCrypto();
  const imported=await c.subtle.importKey('raw',utf8(passphrase),'PBKDF2',false,['deriveKey']);
  return c.subtle.deriveKey(
    {name:'PBKDF2',salt:new Uint8Array(salt),iterations:KDF_ITERATIONS,hash:'SHA-256'},
    imported,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}

export async function encryptReceptiveFields(
  entries: readonly ReceptiveFieldRecipe[],passphrase:string
):Promise<string> {
  requirePassword(passphrase);
  const source=exportReceptiveShelf(entries); // valid bounded data only
  if(utf8(source).length>RECEPTIVE_SHELF_MAX_BYTES)
    throw new Error('Too many go-to fields for a private backup.');
  const c=localCrypto();
  const salt=c.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv=c.getRandomValues(new Uint8Array(IV_BYTES));
  const key=await derive(passphrase,salt);
  const sealed=new Uint8Array(await c.subtle.encrypt(
    {name:'AES-GCM',iv:new Uint8Array(iv),additionalData:utf8(aadText)},
    key,utf8(source)));
  const envelope:Envelope={
    format:PRIVATE_RECEPTIVE_BACKUP_FORMAT,version:1,
    kdf:'PBKDF2-SHA256-600000',cipher:'AES-256-GCM',
    salt:base64(salt),iv:base64(iv),ciphertext:base64(sealed)
  };
  return JSON.stringify(envelope);
}

export async function decryptReceptiveFields(
  wrapped:string,passphrase:string
):Promise<ReceptiveFieldRecipe[]> {
  requirePassword(passphrase);
  if(typeof wrapped!=='string'||utf8(wrapped).length>MAX_RECEPTIVE_PRIVATE_BACKUP_BYTES)
    throw new Error('Unrecognized private field backup.');
  let input:unknown;
  try {input=JSON.parse(wrapped)} catch {throw new Error('Unrecognized private field backup.');}
  if(typeof input!=='object'||input===null||Array.isArray(input))
    throw new Error('Unrecognized private field backup.');
  const envelope=input as Partial<Envelope>;
  if(envelope.format!==PRIVATE_RECEPTIVE_BACKUP_FORMAT ||
    envelope.version!==1||envelope.kdf!=='PBKDF2-SHA256-600000'||
    envelope.cipher!=='AES-256-GCM')
    throw new Error('Unrecognized private field backup.');
  const salt=decodeBase64(envelope.salt,SALT_BYTES);
  const iv=decodeBase64(envelope.iv,IV_BYTES);
  const ciphertext=decodeBase64(envelope.ciphertext,RECEPTIVE_SHELF_MAX_BYTES+TAG_BYTES);
  if(salt.length!==SALT_BYTES||iv.length!==IV_BYTES||ciphertext.length<=TAG_BYTES)
    throw new Error('Unrecognized private field backup.');
  try {
    const c=localCrypto();
    const key=await derive(passphrase,salt);
    const bytes=await c.subtle.decrypt(
      {name:'AES-GCM',iv:new Uint8Array(iv),additionalData:utf8(aadText)},
      key,new Uint8Array(ciphertext));
    const source=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
    return importReceptiveShelf(source); // authenticated data STILL revalidated
  } catch {
    throw new Error('Unable to unlock this backup. The passphrase or file may be incorrect.');
  }
}
