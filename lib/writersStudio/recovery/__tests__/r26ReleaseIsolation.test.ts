/**
 * R26 source isolation — no fabricated external signer should become live
 * writer authority by importing the review-only verifier from an API route.
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { R26_REAL_MEMBER_KEY_CUSTODY_ENABLED } from '../externalCustodyContractR26';
import { R23_REAL_MEMBER_VAULT_ENABLED } from '../reviewVaultHistoryServiceR23';
import { R23_REAL_WRITER_HISTORY_ENABLED } from '../heldVaultHistoryR23';
import { R22_REAL_MEMBER_HISTORY_ENABLED } from '../reviewHeldHistoryServiceR22';
import { R21_REAL_MEMBER_ENCRYPTED_WRITES_ENABLED } from '../heldEncryptedHistoryR21';
import { R15_REAL_MEMBER_TRANSFER_ENABLED } from '../pairedTransferJournalV2';

function routeFiles(folder: string): string[] {
  const files: string[] = [];
  for(const item of readdirSync(folder,{withFileTypes:true})){
    const file=path.join(folder,item.name);
    if(item.isDirectory()) files.push(...routeFiles(file));
    else if(item.isFile() && /^route\.tsx?$/.test(item.name)) files.push(file);
  }
  return files;
}
describe('R26 external authority remains review-only',()=>{
  it('holds every historical/real-member encrypted writer activation',()=>{
    expect(R26_REAL_MEMBER_KEY_CUSTODY_ENABLED).toBe(false);
    expect(R23_REAL_MEMBER_VAULT_ENABLED).toBe(false);
    expect(R23_REAL_WRITER_HISTORY_ENABLED).toBe(false);
    expect(R22_REAL_MEMBER_HISTORY_ENABLED).toBe(false);
    expect(R21_REAL_MEMBER_ENCRYPTED_WRITES_ENABLED).toBe(false);
    expect(R15_REAL_MEMBER_TRANSFER_ENABLED).toBe(false);
  });
  it('has no live writer endpoint importing external custody contract or held-vault writer',()=>{
    const suspect=routeFiles(path.join(process.cwd(),'app/api')).filter(file=>
      /(?:externalCustodyContractR26|verifyExternalCustodyR26|heldVaultHistoryR23|reviewVaultHistoryServiceR23)/
        .test(readFileSync(file,'utf8')));
    expect(suspect).toEqual([]);
  });
});
