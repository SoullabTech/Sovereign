#!/usr/bin/env node
/**
 * O5-R3 operator recovery: retire one stranded CLAIMED grant whose execution
 * outcome is unknowable. This narrows authority only. It never writes W4,
 * never records an execution result, and never retries a provider.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import * as LEASE from './grant-writer-lease-v1.mjs';
import * as STORE from './canonical-provider-execution-grant-store-v1.mjs';

export const VERSION = 'O5R3-OPERATOR-CLAIMED-RETIRE.v1';
export const RETIRE_REASON = 'OPERATOR_RECOVERY_UNKNOWN_EXECUTION_OUTCOME';

const homeOf = (home) => path.resolve(home
  || process.env.AIN_DELEGATION_HOME
  || path.join(os.homedir(), '.claude', 'ain-delegation'));
const sha = (bytes) => 'sha256:' + crypto.createHash('sha256').update(bytes).digest('hex');
const read = (file) => fs.readFileSync(file);
const resultRef = (wu, grant) => `canonical-result:${wu}:${grant}`;

function paths(home, workUnitId, grantId) {
  const v2 = path.join(home, 'work-units-v2');
  return {
    envelope: path.join(v2, workUnitId + '.json'),
    ledger: STORE.canonicalGrantLedgerPathV1(workUnitId, home),
    result: path.join(v2, 'results', workUnitId, grantId + '.json'),
  };
}

function subjectState(home, workUnitId, grantId) {
  const p = paths(home, workUnitId, grantId);
  const envelopeBytes = read(p.envelope);
  const envelope = JSON.parse(envelopeBytes);
  const ledgerBytes = read(p.ledger);
  const standing = STORE.canonicalGrantStandingV1(workUnitId, grantId, { home });
  const resultPresent = fs.existsSync(p.result);
  const execution = envelope.work_unit?.execution || {};
  const ref = resultRef(workUnitId, grantId);
  const w4HasResult = (execution.artifacts || []).some((a) => a?.ref === ref)
    || (execution.attempts || []).some((a) => (a?.evidence_refs || []).includes(ref));
  return {
    p, envelope, standing, resultPresent, w4HasResult,
    envelope_sha: sha(envelopeBytes),
    ledger_sha: sha(ledgerBytes),
    ledger_bytes: ledgerBytes,
    ledger_event_count: STORE.readCanonicalGrantEventsV1(workUnitId, { home }).length,
  };
}

function subjectDigest(s) {
  return sha(Buffer.from(JSON.stringify({
    envelope_sha: s.envelope_sha,
    ledger_sha: s.ledger_sha,
    result_present: s.resultPresent,
    w4_has_result: s.w4HasResult,
    standing: s.standing.standing,
  })));
}

export function inspectIncident({
  home: requestedHome, workUnitId, grantId, expectGeneration,
} = {}) {
  const home = homeOf(requestedHome);
  const errors = [];
  const leaseState = LEASE.readLeaseState(home);
  const subject = subjectState(home, workUnitId, grantId);
  const self = LEASE.currentProcessIdentity();
  let holderProof = null;

  if (leaseState.unreadable) errors.push('LEASE_RECORD_UNREADABLE');
  else if (!leaseState.record || leaseState.record.released) errors.push('LATEST_LEASE_NOT_UNRELEASED_HOLDER');
  else holderProof = LEASE.judgeHolder(leaseState.record, self);

  if (Number.isInteger(expectGeneration) && leaseState.generation !== expectGeneration) {
    errors.push(`LEASE_GENERATION_MISMATCH:${leaseState.generation}`);
  }
  if (!['DEAD', 'DEAD_PID_REUSED'].includes(holderProof)) {
    errors.push(`LEASE_HOLDER_NOT_PROVEN_DEAD:${holderProof ?? 'NONE'}`);
  }
  if (!subject.standing.exists) errors.push('GRANT_NOT_FOUND');
  else if (subject.standing.standing !== 'CLAIMED') errors.push(`GRANT_NOT_CLAIMED:${subject.standing.standing}`);

  const lifecycle = subject.envelope.work_unit?.state?.lifecycle_state;
  const guardState = subject.envelope.guard?.current_state;
  if (lifecycle !== 'EXECUTING' || guardState !== 'EXECUTING') {
    errors.push(`WORK_UNIT_NOT_EXECUTING:${lifecycle ?? 'NONE'}/${guardState ?? 'NONE'}`);
  }
  if (subject.envelope.work_unit?.identity?.id !== workUnitId
      || subject.envelope.guard?.work_unit_id !== workUnitId) {
    errors.push('WORK_UNIT_IDENTITY_MISMATCH');
  }
  if (subject.resultPresent) errors.push('DURABLE_RESULT_PRESENT');
  if (subject.w4HasResult) errors.push('W4_ALREADY_RECORDS_RESULT');

  const genFile = path.join(home, LEASE.LEASE_DIR,
    `g-${String(leaseState.generation).padStart(12, '0')}.json`);
  const leaseSha = fs.existsSync(genFile) ? sha(read(genFile)) : null;
  const admissionDigest = sha(Buffer.from(JSON.stringify({
    version: VERSION, home, work_unit_id: workUnitId, grant_id: grantId,
    lease_generation: leaseState.generation, lease_sha: leaseSha,
    holder_proof: holderProof, subject_digest: subjectDigest(subject),
    action: 'INVALIDATE_CLAIMED_AUTHORITY_ONLY', reason: RETIRE_REASON,
  })));

  return {
    version: VERSION, ready: errors.length === 0, errors, admission_digest: admissionDigest,
    home, work_unit_id: workUnitId, grant_id: grantId,
    lease: { generation: leaseState.generation, holder: leaseState.record, holder_proof: holderProof, sha: leaseSha },

    grant: {
      standing: subject.standing.standing,
      events: subject.standing.events.map((e) => e.event),
      ledger_sha: subject.ledger_sha,
      event_count: subject.ledger_event_count,
    },
    work_unit: {
      lifecycle_state: lifecycle, guard_state: guardState,
      envelope_sha: subject.envelope_sha,
      durable_result_present: subject.resultPresent,
      w4_records_result: subject.w4HasResult,
    },
    proposed_effect: {
      append_event: 'INVALIDATED',
      reason: RETIRE_REASON,
      writes_w4: false,
      retries_provider: false,
      claims_execution_outcome: false,
    },
    _subject: subject,
  };
}

function publicInspection(i) {
  const { _subject, ...publicPart } = i;
  return publicPart;
}

export function executeRetirement({
  home: requestedHome, workUnitId, grantId, expectGeneration, admit,
} = {}) {
  const home = homeOf(requestedHome);
  const before = inspectIncident({ home, workUnitId, grantId, expectGeneration });
  if (!before.ready) return { ok: false, refused: 'INCIDENT_NOT_READY', inspection: publicInspection(before) };
  if (!admit || admit !== before.admission_digest) {
    return { ok: false, refused: 'ADMISSION_DIGEST_MISMATCH', inspection: publicInspection(before) };
  }

  const held = LEASE.ensureGrantWriterLeaseV1(home);
  if (!held.ok) {
    return {
      ok: false, refused: 'GRANT_WRITER_LEASE_UNAVAILABLE',
      lease_reason: held.reason, generation: held.generation ?? null, holder: held.holder ?? null,
    };
  }

  let released = null;
  try {
    if (!held.proof || !['DEAD', 'DEAD_PID_REUSED'].includes(held.proof)) {
      return { ok: false, refused: 'TAKEOVER_NOT_PROVEN_DEAD', proof: held.proof ?? null };
    }

    const afterTakeover = subjectState(home, workUnitId, grantId);
    if (subjectDigest(afterTakeover) !== subjectDigest(before._subject)) {
      return {
        ok: false, refused: 'INCIDENT_STATE_CHANGED_DURING_TAKEOVER',
        before_subject_digest: subjectDigest(before._subject),
        after_subject_digest: subjectDigest(afterTakeover),
      };
    }

    const invalidated = STORE.invalidateCanonicalExecutionGrantV1(workUnitId, grantId, {
      home, lease: held.lease, reason: RETIRE_REASON,
    });
    if (!invalidated.ok) {
      return { ok: false, refused: 'GRANT_INVALIDATION_REFUSED', invalidation: invalidated };
    }

    const after = subjectState(home, workUnitId, grantId);
    const appendPrefixExact = after.ledger_bytes.subarray(0, before._subject.ledger_bytes.length)
      .equals(before._subject.ledger_bytes);
    const exactlyOneEvent = after.ledger_event_count === before._subject.ledger_event_count + 1;
    const lastEvent = after.standing.events[after.standing.events.length - 1];

    const verified = after.standing.standing === 'INVALIDATED'
      && appendPrefixExact
      && exactlyOneEvent
      && lastEvent?.event === 'INVALIDATED'
      && lastEvent?.grant_id === grantId
      && lastEvent?.reason === RETIRE_REASON
      && after.envelope_sha === before._subject.envelope_sha
      && after.resultPresent === false
      && after.w4HasResult === false;

    if (!verified) {
      return {
        ok: false, refused: 'POST_INVALIDATION_VERIFICATION_FAILED',
        observed: {
          standing: after.standing.standing, append_prefix_exact: appendPrefixExact,
          exactly_one_event: exactlyOneEvent, last_event: lastEvent ?? null,
          envelope_unchanged: after.envelope_sha === before._subject.envelope_sha,
          result_present: after.resultPresent, w4_records_result: after.w4HasResult,
        },
      };
    }

    return {
      ok: true, status: 'CLAIMED_AUTHORITY_RETIRED_OUTCOME_UNKNOWN',
      admitted_digest: before.admission_digest,
      takeover: { generation: held.lease.generation, proof: held.proof, took_over_from: held.took_over_from },

      authority: {
        work_unit_id: workUnitId, grant_id: grantId,
        before: 'CLAIMED', after: 'INVALIDATED', reason: RETIRE_REASON,
      },
      execution_outcome: 'UNKNOWN',
      provider_retried: false,
      w4_written: false,
      durable_result_written: false,
      verification: {
        ledger_old_bytes_exact_prefix: appendPrefixExact,
        exactly_one_event_appended: exactlyOneEvent,
        work_unit_envelope_unchanged: true,
      },
    };
  } finally {
    if (!held.reused) released = LEASE.releaseGrantWriterLeaseV1(home, held.lease);
  }
}

function usage() {
  return [
    'Usage:',
    '  node scripts/builder/o5-operator-retire-claimed-grant.mjs --work-unit <id> --grant <id> --expect-generation <n>',
    '  add --execute --admit <admission_digest> only after reviewing the dry-run output',
  ].join('\n');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const val = (flag) => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const workUnitId = val('--work-unit');
  const grantId = val('--grant');
  const expectGeneration = Number(val('--expect-generation'));
  const requestedHome = val('--home');
  if (!workUnitId || !grantId || !Number.isInteger(expectGeneration)) {
    process.stderr.write(usage() + '\n');
    process.exit(2);
  }

  const home = homeOf(requestedHome);
  if (!args.includes('--execute')) {
    const inspection = inspectIncident({ home, workUnitId, grantId, expectGeneration });
    process.stdout.write(JSON.stringify(publicInspection(inspection), null, 2) + '\n');
    process.exit(inspection.ready ? 0 : 2);
  }

  const out = executeRetirement({
    home, workUnitId, grantId, expectGeneration, admit: val('--admit'),
  });
  const finalLease = LEASE.readLeaseState(home);
  const rendered = {
    ...out,
    final_lease: {
      generation: finalLease.generation,
      record: finalLease.record,
      unreadable: Boolean(finalLease.unreadable),
    },
  };
  process.stdout.write(JSON.stringify(rendered, null, 2) + '\n');
  process.exit(out.ok ? 0 : 2);
}
