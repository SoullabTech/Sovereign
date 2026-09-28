#!/usr/bin/env tsx
/**
 * Additive two-layer migration custody adapter.
 * Read-only. It validates a base admitted review plus a hash-bound delta-review projection.
 * It does not execute migrations and is not wired into deploy-production.sh.
 */
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import {
  composeTwoLayerMigrationRebind,
  type BaseMigrationReview,
  type DeltaReview,
} from './migration-custody-composition-core';
import type { PendingMigration } from './migration-compatibility-core';

class Refusal extends Error {
  constructor(readonly code: string, message: string) { super(message); }
}
const sha256 = (b: Uint8Array | string) => createHash('sha256').update(b).digest('hex');
function arg(name: string): string {
  const i=process.argv.indexOf('--'+name);
  const v=i >= 0 ? process.argv[i+1] : undefined;
  if (!v || v.startsWith('--')) throw new Refusal('BAD_ARGUMENT', '--'+name+' is required');
  return v;
}
function readJson(p: string): any {
  try { return JSON.parse(fs.readFileSync(p,'utf8')); }
  catch (e) { throw new Refusal('EVIDENCE_UNREADABLE', p+': '+(e as Error).message); }
}
function git(repo: string, ...args: string[]): string {
  try { return execFileSync('git',['-C',repo,...args],{encoding:'utf8'}).trim(); }
  catch { throw new Refusal('GIT_REFUSED','git '+args.join(' ')+' failed'); }
}
function gitBlobHash(repo: string, commit: string, path: string): string {
  try {
    const b=execFileSync('git',['-C',repo,'show',commit+':'+path],{encoding:'buffer'}) as Buffer;
    return sha256(b);
  } catch { throw new Refusal('TARGET_BLOB_MISSING',path+' missing at '+commit); }
}
function samePending(a: PendingMigration[], b: PendingMigration[]): boolean {
  return a.length===b.length && a.every((m,i)=>m.path===b[i]?.path && m.sha256===b[i]?.sha256);
}

function main() {
  const repo=arg('repo');
  const baseReviewPath=arg('base-review');
  const baseRecordPath=arg('base-record');
  const deltaReviewPath=arg('delta-review');
  const projectionPath=arg('projection');
  const observedPath=arg('observed-pending');
  const liveReader=git(repo,'rev-parse',arg('live-reader')+'^{commit}');
  const target=git(repo,'rev-parse',arg('target')+'^{commit}');

  const baseReview=readJson(baseReviewPath);
  const baseRecord=readJson(baseRecordPath);
  const projection=readJson(projectionPath);
  const observed=readJson(observedPath);

  if (baseRecord?.approval?.verdict !== 'APPROVED')
    throw new Refusal('BASE_NOT_APPROVED','base custody record carries no APPROVED admission');
  if (sha256(fs.readFileSync(baseReviewPath)) !== baseRecord.approval.review_sha256)
    throw new Refusal('BASE_REVIEW_SUBSTITUTED','base review bytes differ from admitted hash');

  const compat=baseReview.migration_compatibility;
  if (compat?.verdict !== 'COMPATIBLE' || compat?.failure_prefix_compatibility?.verdict !== 'ALL_PREFIXES_COMPATIBLE')
    throw new Refusal('BASE_COMPATIBILITY_MISSING','base review lacks compatible/all-prefix attestation');

  if (projection?.instrument !== 'delta-review-projection/v1')
    throw new Refusal('BAD_DELTA_PROJECTION','delta projection shape is invalid');
  const deltaReviewHash=sha256(fs.readFileSync(deltaReviewPath));
  if (projection.source_review_sha256 !== deltaReviewHash)
    throw new Refusal('DELTA_REVIEW_SUBSTITUTED','delta report bytes differ from projection source hash');

  const basePending=compat.pending as PendingMigration[];
  const projectedPending=projection.migration_bytes as PendingMigration[];
  const observedPending=observed.pending as PendingMigration[];
  const baseTarget=git(repo,'rev-parse',compat.target_reader_commit+'^{commit}');

  for (const m of basePending) {
    if (gitBlobHash(repo,target,m.path) !== m.sha256)
      throw new Refusal('TARGET_MIGRATION_BYTES_CHANGED','target migration byte mismatch: '+m.path);
  }

  const actualChanged=git(repo,'diff','--name-only',baseTarget,target).split('\n').filter(Boolean).sort();
  const projectedChanged=[...projection.changed_paths].sort();
  if (JSON.stringify(actualChanged)!==JSON.stringify(projectedChanged))
    throw new Refusal('DELTA_PATH_SET_MISMATCH','projection does not match exact git delta');

  const witnessed=new Set<string>(projection.witnessed_paths);
  for (const p of actualChanged) {
    if (!witnessed.has(p)) throw new Refusal('DELTA_COVERAGE_MISSING','changed path not witnessed: '+p);
    if (!fs.readFileSync(deltaReviewPath,'utf8').includes('target/'+p))
      throw new Refusal('DELTA_REPORT_COVERAGE_MISSING','delta report does not name physical read: '+p);
  }

  let ancestor=true;
  try { execFileSync('git',['-C',repo,'merge-base','--is-ancestor',baseTarget,target]); }
  catch { ancestor=false; }

  const base: BaseMigrationReview = {
    admitted:true, targetReaderCommit:baseTarget, pending:basePending,
    allPrefixesCompatible:true, reviewSha256:baseRecord.approval.review_sha256,
  };
  const delta: DeltaReview = {
    approved: projection.verdict==='APPROVED',
    compatible: projection.compatibility==='COMPATIBLE',
    allPrefixesCompatible: projection.prefix_result==='ALL_PREFIXES_COMPATIBLE',
    baseTargetCommit: projection.base_target_commit,
    targetReaderCommit: projection.target_reader_commit,
    reviewSha256: deltaReviewHash,
    expectedReviewSha256: projection.source_review_sha256,
    migrationBytes: projectedPending,
    changedPaths: projection.changed_paths,
    witnessedPaths: projection.witnessed_paths,
  };

  if (!samePending(basePending,observedPending))
    throw new Refusal('PENDING_PREFIX_DRIFT','observed pending set differs from base review');

  const outcome=composeTwoLayerMigrationRebind(base,delta,{
    liveReaderCommit:liveReader, targetReaderCommit:target,
    pending:observedPending, deltaBaseIsAncestor:ancestor,
  });
  if (outcome.kind==='refused') throw new Refusal(outcome.code,outcome.reason);

  console.log('TWO-LAYER MIGRATION CUSTODY COMPOSITION APPLIES');
  console.log('  base target  '+baseTarget);
  console.log('  live/target  '+target);
  console.log('  migrations   '+outcome.migrations+' exact pending bytes');
  console.log('  delta files  '+outcome.deltaFiles+' changed paths, all witnessed');
  console.log('  delta review '+deltaReviewHash);
  console.log('\nSTOP BEFORE MIGRATIONS · read-only composition witness only');
}

try { main(); }
catch (e) {
  const x=e as Error;
  console.error('REFUSED ['+(e instanceof Refusal ? e.code : 'INSTRUMENT_ERROR')+'] — '+x.message);
  process.exit(1);
}
