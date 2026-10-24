/** LISTEN-05: portable, passphrase-encrypted personal playlist/journal export.
 * No server, provider audio, member account, or third-party keys involved.
 * This is NOT a replacement for authenticated encrypted storage or recovery.
 * Design is held for independent cryptography/privacy review before release. */
import { MAX_RESTORE_BYTES, restoreMemberShelf } from './portableCollections';
import type { MemberCollection } from './portableCollections';

export const PRIVATE_BACKUP_FORMAT = 'SOULLAB_LISTEN_PRIVATE_BACKUP_V1';
export const MAX_PRIVATE_BACKUP_BYTES = 8 * 1024 * 1024;
const ITERATIONS = 600_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;
const TAG_BYTES = 16;

type Envelope = {
  format: typeof PRIVATE_BACKUP_FORMAT;
  version: 1;
  kdf: 'PBKDF2-SHA256-600000';
  cipher: 'AES-256-GCM';
  salt: string;
  iv: string;
  ciphertext: string;
};

function utf8Length(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}
function requirePassphrase(passphrase: string): void {
  if (typeof passphrase !== 'string' || passphrase.length < 12 || utf8Length(passphrase) > 1024)
    throw new Error('Use a private passphrase of at least 12 characters (maximum 1024 bytes).');
}
function webCrypto(): Crypto {
  if (typeof crypto === 'undefined' || !crypto.subtle || !crypto.getRandomValues)
    throw new Error('Encrypted backups require a secure browser context (HTTPS or localhost).');
  return crypto;
}
function base64(bytes: Uint8Array): string {
  // Chunking avoids call-stack overflow for multi-megabyte backups.
  let raw = '';
  for (let offset = 0; offset < bytes.length; offset += 8192)
    raw += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
  return btoa(raw);
}
function fromBase64(value: unknown, maximum: number): Uint8Array {
  if (typeof value !== 'string' || value.length > Math.ceil(maximum / 3) * 4 + 4 ||
      !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value))
    throw new Error('This is not a supported private Listening Room backup.');
  let raw: string;
  try { raw = atob(value); } catch { throw new Error('This is not a supported private Listening Room backup.'); }
  if (raw.length > maximum) throw new Error('This is not a supported private Listening Room backup.');
  return Uint8Array.from(raw, ch => ch.charCodeAt(0));
}
async function keyFor(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const c = webCrypto();
  const imported = await c.subtle.importKey('raw', new TextEncoder().encode(password),
    'PBKDF2', false, ['deriveKey']);
  return c.subtle.deriveKey({name:'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256'},
    imported, {name:'AES-GCM', length:256}, false, ['encrypt','decrypt']);
}
/** Verifies Soullab's portable format before encrypting. Never retains password. */
export async function encryptListeningExport(plainExport: string, passphrase: string): Promise<string> {
  requirePassphrase(passphrase);
  if (typeof plainExport !== 'string' || utf8Length(plainExport) > MAX_RESTORE_BYTES)
    throw new Error('Listening collection is larger than the 5 MB export limit.');
  restoreMemberShelf(plainExport);
  const c = webCrypto();
  const salt = c.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = c.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await keyFor(passphrase, salt);
  const data = new TextEncoder().encode(plainExport);
  const sealed = new Uint8Array(await c.subtle.encrypt({name:'AES-GCM', iv}, key, data));
  const wrapper: Envelope = {
    format:PRIVATE_BACKUP_FORMAT, version:1, kdf:'PBKDF2-SHA256-600000',
    cipher:'AES-256-GCM', salt:base64(salt), iv:base64(iv), ciphertext:base64(sealed),
  };
  return JSON.stringify(wrapper);
}
/** Authenticated decryption and *revalidation* of untrusted restored metadata. */
export async function decryptListeningExport(wrapped: string, passphrase: string): Promise<{
  collections: MemberCollection[]; journal: string;
}> {
  requirePassphrase(passphrase);
  if (typeof wrapped !== 'string' || utf8Length(wrapped) > MAX_PRIVATE_BACKUP_BYTES)
    throw new Error('This is not a supported private Listening Room backup.');
  let v: unknown;
  try { v = JSON.parse(wrapped); }
  catch { throw new Error('This is not a supported private Listening Room backup.'); }
  if (typeof v !== 'object' || v === null || Array.isArray(v))
    throw new Error('This is not a supported private Listening Room backup.');
  const e = v as Partial<Envelope>;
  if (e.format !== PRIVATE_BACKUP_FORMAT || e.version !== 1 ||
      e.kdf !== 'PBKDF2-SHA256-600000' || e.cipher !== 'AES-256-GCM')
    throw new Error('This is not a supported private Listening Room backup.');
  const salt = fromBase64(e.salt, SALT_BYTES);
  const iv = fromBase64(e.iv, IV_BYTES);
  const ciphertext = fromBase64(e.ciphertext, MAX_RESTORE_BYTES + TAG_BYTES);
  if (salt.length !== SALT_BYTES || iv.length !== IV_BYTES || ciphertext.length <= TAG_BYTES)
    throw new Error('This is not a supported private Listening Room backup.');
  try {
    const key = await keyFor(passphrase, salt);
    const unsealed = await webCrypto().subtle.decrypt({name:'AES-GCM',iv}, key, ciphertext);
    const decoded = new TextDecoder('utf-8', {fatal:true}).decode(unsealed);
    return restoreMemberShelf(decoded);
  } catch {
    throw new Error('Unable to unlock this backup. The passphrase or file may be incorrect.');
  }
}
