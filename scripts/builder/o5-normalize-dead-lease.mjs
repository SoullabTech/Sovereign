#!/usr/bin/env node
/**
 * O5-R3 A8 — normalize one proven-dead latest grant-writer lease.
 *
 * This operation changes lease history only:
 * dead unreleased holder -> proven takeover -> immediate release.
 * It never reads or mutates grant ledgers, W4, results, or providers.
 */
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as LEASE from './grant-writer-lease-v1.mjs';

export const VERSION = 'O5R3-DEAD-LEASE-NORMALIZE.v1';
const sha = (value) => 'sha256:' + crypto.createHash('sha256').update(value).digest('hex');

function publicInspection(i) {
  const { _state, ...out } = i;
  return out;
}

export function inspectDeadLease({ home, expectGeneration } = {}) {
  const state = LEASE.readLeaseState(home);
  const errors = [];
  const self = LEASE.currentProcessIdentity();
  let holderProof = null;

  if (state.unreadable) errors.push('LEASE_RECORD_UNREADABLE');
  else if (!state.record) errors.push('LEASE_RECORD_MISSING');
  else if (state.record.released) errors.push('LATEST_LEASE_ALREADY_RELEASED');
  else holderProof = LEASE.judgeHolder(state.record, self);

  if (Number.isInteger(expectGeneration) && state.generation !== expectGeneration) {
    errors.push(`LEASE_GENERATION_MISMATCH:${state.generation}`);
  }
  if (!['DEAD', 'DEAD_PID_REUSED'].includes(holderProof)) {
    errors.push(`LEASE_HOLDER_NOT_PROVEN_DEAD:${holderProof ?? 'NONE'}`);
  }

  const admissionDigest = sha(JSON.stringify({
    version: VERSION,
    generation: state.generation,
    holder: state.record ?? null,
    holder_proof: holderProof,
    action: 'TAKEOVER_AND_IMMEDIATE_RELEASE_ONLY',
  }));

  return {
    version: VERSION,
    ready: errors.length === 0,
    errors,
    admission_digest: admissionDigest,
    lease: {
      generation: state.generation,
      holder: state.record ?? null,
      holder_proof: holderProof,
    },
    proposed_effect: {
      append_takeover_generation: state.generation + 1,
      append_release_generation: state.generation + 2,
      grant_mutation: false,
      w4_mutation: false,
      result_mutation: false,
      provider_execution: false,
    },
    _state: state,
  };
}

export function executeDeadLeaseNormalization({ home, expectGeneration, admit } = {}) {
  const before = inspectDeadLease({ home, expectGeneration });
  if (!before.ready) return { ok: false, refused: 'LEASE_NOT_READY', inspection: publicInspection(before) };
  if (!admit || admit !== before.admission_digest) {
    return { ok: false, refused: 'ADMISSION_DIGEST_MISMATCH', inspection: publicInspection(before) };
  }

  const acquired = LEASE.acquireGrantWriterLeaseV1(home);
  if (!acquired.ok) {
    return { ok: false, refused: 'TAKEOVER_REFUSED', reason: acquired.reason };
  }
  if (!['DEAD', 'DEAD_PID_REUSED'].includes(acquired.proof)) {
    return { ok: false, refused: 'TAKEOVER_NOT_PROVEN_DEAD', proof: acquired.proof ?? null };
  }

  const release = LEASE.releaseGrantWriterLeaseV1(home, acquired.lease);
  if (!release.ok) {
    return { ok: false, refused: 'RELEASE_REFUSED', reason: release.reason };
  }

  const final = LEASE.readLeaseState(home);
  const verified = final.generation === before.lease.generation + 2
    && final.record?.released === true
    && final.record?.owner_nonce === acquired.lease.owner_nonce;

  return {
    ok: verified,
    status: verified ? 'DEAD_LEASE_NORMALIZED' : 'POST_NORMALIZATION_VERIFICATION_FAILED',
    admitted_digest: before.admission_digest,
    takeover: {
      generation: acquired.lease.generation,
      proof: acquired.proof,
      took_over_from: acquired.took_over_from,
    },
    final_lease: final,
  };
}

function usage() {
  return [
    'Usage:',
    '  node scripts/builder/o5-normalize-dead-lease.mjs --expect-generation <n>',
    '  add --execute --admit <digest> only after reviewing the dry-run',
  ].join('\n');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const val = (flag) => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const expectGeneration = Number(val('--expect-generation'));
  const home = val('--home');
  if (!Number.isInteger(expectGeneration)) {
    process.stderr.write(usage() + '\n');
    process.exit(2);
  }

  if (!args.includes('--execute')) {
    const out = inspectDeadLease({ home, expectGeneration });
    process.stdout.write(JSON.stringify(publicInspection(out), null, 2) + '\n');
    process.exit(out.ready ? 0 : 2);
  }

  const out = executeDeadLeaseNormalization({
    home,
    expectGeneration,
    admit: val('--admit'),
  });
  process.stdout.write(JSON.stringify(out, null, 2) + '\n');
  process.exit(out.ok ? 0 : 2);
}
