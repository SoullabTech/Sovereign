/**
 * R105 review-only vault erasure error classification.
 * Never return an artifact ref, full path, Error.message or stack.
 * This is NOT a change to membership, erasure ordering or proof of deletion.
 */
const CODES=new Set([
 'EACCES','EPERM','EROFS','ENOENT','EIO','EBUSY','ENOTDIR','EISDIR',
 'ENOSPC','EMFILE','ELOOP','EXDEV','ESTILLPRESENT','UNKNOWN'
]);
export const R105_REAL_ERASURE_WORKER_REHOME_ENABLED=false as const;
export function storedVaultErasureErrnoR105(value:unknown):string{
 return typeof value==='string'&&CODES.has(value)?value:'UNKNOWN';
}
export function vaultErasureErrnoR105(failure:unknown):string{
 if(failure!==null&&typeof failure==='object'){
  const x=failure as {code?:unknown;message?:unknown};
  if(typeof x.code==='string'&&CODES.has(x.code))return x.code;
  if(typeof x.message==='string'&&
     x.message.includes('still present'))return 'ESTILLPRESENT';
 }
 return 'UNKNOWN';
}
export function safeVaultAttemptCountR105(value:unknown):number{
 return typeof value==='number'&&Number.isSafeInteger(value)&&
   value>=0&&value<=100000000?value:0;
}
