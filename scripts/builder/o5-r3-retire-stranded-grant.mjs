#!/usr/bin/env node
/**
 * O5-R3 operator recovery — retire one stranded CLAIMED canonical grant.
 *
 * This command NEVER records an execution result and NEVER dispatches a provider.
 * It narrows authority only: CLAIMED -> INVALIDATED, preserving outcome as UNKNOWN.
 *
 * Required evidence:
 * - exact admitted O5-R2 census digest;
 * - exact Work Unit + grant classified BLOCKED_BY_EVIDENCE /
 *   DISPATCHED_WITHOUT_WITNESS_NO_PROBE / no_durable_result;
 * - current grant-writer lease holder proven dead or pid-reused.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as LEASE from './grant-writer-lease-v1.mjs';
import { census } from './o5-recovery-census.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const RETIRE_REASON = 'OPERATOR_RETIRED_UNKNOWN_OUTCOME_NO_DURABLE_RESULT';

const homeOf = (env) => env.AIN_DELEGATION_HOME
  || path.join(os.homedir(), '.claude', 'ain-delegation');

export function retirementCandidate(c, workUnitId, grantId) {
  if (!c?.admissible) return { ok: false, reason: 'CENSUS_NOT_ADMISSIBLE' };
  const hits = c.path_b?.BLOCKED_BY_EVIDENCE || [];
  const hit = hits.find((e) => e.work_unit_id === workUnitId && e.grant_id === grantId);
  if (!hit) return { ok: false, reason: 'TARGET_NOT_BLOCKED_BY_EVIDENCE' };
  if (hit.reason !== 'DISPATCHED_WITHOUT_WITNESS_NO_PROBE') {
    return { ok: false, reason: 'TARGET_REASON_NOT_UNKNOWN_DISPATCH' };
  }
  if (hit.category !== 'no_durable_result') {
    return { ok: false, reason: 'TARGET_CATEGORY_NOT_NO_DURABLE_RESULT' };
  }
  return { ok: true, hit };
}

function deadHolderProof(home) {
  const state = LEASE.readLeaseState(home);
  if (!state.record || state.record.released) {
    return { ok: false, reason: 'NO_UNRELEASED_HOLDER', generation: state.generation };
  }
  const verdict = LEASE.judgeHolder(
    state.record,
    LEASE.currentProcessIdentity(),
  );
  if (!['DEAD', 'DEAD_PID_REUSED'].includes(verdict)) {
    return {
      ok: false,
      reason: 'HOLDER_NOT_PROVEN_DEAD',
      verdict,
      generation: state.generation,
      holder: state.record,
    };
  }
  return { ok: true, verdict, generation: state.generation, holder: state.record };
}

export async function retireStrandedGrant(
  root = ROOT,
  { env = process.env, admit, workUnitId, grantId, now = () => new Date().toISOString(), censusFn = census } = {},
) {
  if (!admit || !workUnitId || !grantId) {
    return { ok: false, reason: 'ADMIT_WORK_UNIT_AND_GRANT_REQUIRED' };
  }
  const c = await censusFn(root, { env, rehearseRecords: false });
  if (c.census_digest !== admit) {
    return {
      ok: false,
      reason: 'CENSUS_DIGEST_MISMATCH',
      admitted: admit,
      current: c.census_digest,
    };
  }
  const candidate = retirementCandidate(c, workUnitId, grantId);
  if (!candidate.ok) return candidate;

  const home = homeOf(env);
  const dead = deadHolderProof(home);
  if (!dead.ok) return dead;

  const store = await import(
    pathToFileURL(path.join(root, 'scripts/builder/canonical-provider-execution-grant-store-v1.mjs')).href
  );
  const before = store.canonicalGrantStandingV1(workUnitId, grantId, { home });
  if (!before.exists || before.standing !== 'CLAIMED') {
    return { ok: false, reason: 'GRANT_NOT_CLAIMED', standing: before.standing ?? null };
  }

  const resultFile = path.join(home, 'work-units-v2', 'results', workUnitId, grantId + '.json');
  if (fs.existsSync(resultFile)) {
    return { ok: false, reason: 'DURABLE_RESULT_APPEARED' };
  }

  const held = LEASE.acquireGrantWriterLeaseV1(home, { now });
  if (!held.ok) {
    return { ok: false, reason: 'LEASE_ACQUISITION_REFUSED', lease_reason: held.reason };
  }

  let invalidation;
  let release;
  try {
    const recheck = store.canonicalGrantStandingV1(workUnitId, grantId, { home });
    if (!recheck.exists || recheck.standing !== 'CLAIMED' || fs.existsSync(resultFile)) {
      return {
        ok: false,
        reason: 'STATE_CHANGED_AFTER_LEASE_ACQUISITION',
        standing: recheck.standing ?? null,
      };
    }
    invalidation = store.invalidateCanonicalExecutionGrantV1(workUnitId, grantId, {
      home,
      lease: held.lease,
      at: now(),
      reason: RETIRE_REASON,
    });
    if (!invalidation.ok) {
      return {
        ok: false,
        reason: 'INVALIDATION_REFUSED',
        invalidation,
      };
    }
  } finally {
    release = LEASE.releaseGrantWriterLeaseV1(home, held.lease, { now });
  }

  if (!release?.ok) {
    return {
      ok: false,
      reason: 'LEASE_RELEASE_FAILED_AFTER_RETIREMENT',
      invalidation_status: invalidation?.status ?? null,
      lease_release: release ?? null,
    };
  }

  return {
    ok: true,
    action: 'STRANDED_GRANT_RETIRED',
    outcome: 'UNKNOWN',
    provider_replayed: false,
    w4_result_written: false,
    work_unit_id: workUnitId,
    grant_id: grantId,
    prior_lease_generation: dead.generation,
    takeover_proof: dead.verdict,
    acquired_generation: held.lease.generation,
    invalidation_status: invalidation?.status ?? null,
    invalidation_reason: RETIRE_REASON,
    released: release?.ok === true,
    released_generation: release?.ok ? held.lease.generation + 1 : null,
  };
}

function arg(args, flag) {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const args = process.argv.slice(2);
  const out = await retireStrandedGrant(ROOT, {
    admit: arg(args, '--admit'),
    workUnitId: arg(args, '--work-unit'),
    grantId: arg(args, '--grant'),
  });
  process.stdout.write(JSON.stringify(out, null, 2) + '\n');
  process.exit(out.ok ? 0 : 2);
}
