import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {R23_REAL_WRITER_HISTORY_ENABLED} from '../heldVaultHistoryR23';
import {R23_REAL_MEMBER_VAULT_ENABLED} from '../reviewVaultHistoryServiceR23';
import {R24_REAL_EXTERNAL_CUSTODY_ENABLED} from '../externalCustodyBoundaryR24';

const root=process.cwd();
const source=()=>readFileSync(join(root,
 'scripts/ops/wsBetaR26OldBackupRefusal.ts'),'utf8');
const sidecar=()=>readFileSync(join(root,
 'scripts/ops/wsBetaR26FictionalRevocationCustodian.cjs'),'utf8');

describe('R26 retired Work old-backup policy fixture remains inactive',()=>{
 it('holds all real writer/key entrypoints disabled',()=>{
  expect(R23_REAL_WRITER_HISTORY_ENABLED).toBe(false);
  expect(R23_REAL_MEMBER_VAULT_ENABLED).toBe(false);
  expect(R24_REAL_EXTERNAL_CUSTODY_ENABLED).toBe(false);
 });
 it('requires opt-in and cannot call a live KMS, DB or remote service',()=>{
  const fixture=source(),child=sidecar();
  expect(fixture).toContain("R26_OLD_BACKUP_FIXTURE!=='fictional-only'");
  expect(child).toContain("R26_SIDECAR_FIXTURE!=='fictional-only'");
  expect(child).toContain("ws-r26-fictional-");
  expect(fixture).not.toContain('https://');
  expect(child).not.toMatch(/createServer\(|\.listen\(|fetch\(|\bWebSocket\b/);
 });
 it('tests actual old vault ciphertext and keeps key retirement separate',()=>{
  const fixture=source(),child=sidecar();
  expect(fixture).toContain('writeDurableVaultBytes');
  expect(fixture).toContain('copyFileSync');
  expect(fixture).toContain('reviewR24HeldCustodyLease');
  expect(fixture).toContain('requireCurrentRestoreAuthorization');
  expect(child).toContain("msg?.op==='retire'");
  expect(child).toContain('delete s.workKeys[keyPath]');
  expect(child).toContain('retiredKeyIds.push(key.keyId)');
  expect(child).toContain('s.generation+=1');
  expect(child).toContain('fs.fsyncSync(fd)');
 });
 it('expressly tests retained-key offline bypass, never claims irreversible erasure',()=>{
  const fixture=source();
  expect(fixture).toContain('unsafeRetainedKeyCanDecryptOldBackup');
  expect(fixture).toContain('old backup and retained old key can decrypt offline');
  expect(fixture).toContain('RAW_KEY_ERASURE_UNPROVEN');
  expect(fixture).toContain("realMemberRelease:'HOLD'");
 });
 it('removes only fixture-marker-owned synthetic files and child state',()=>{
  const fixture=source();
  expect(fixture).toContain('ws-r26-fictional-');
  expect(fixture).toContain('ws-r26-backup-fict-');
  expect(fixture).toContain('if(existsSync(rootMarker))rmSync(root');
  expect(fixture).toContain('if(existsSync(copyMarker))rmSync(separateCopy');
  expect(fixture).not.toContain('docker system prune');
  expect(fixture).not.toContain('docker volume prune');
 });
});
