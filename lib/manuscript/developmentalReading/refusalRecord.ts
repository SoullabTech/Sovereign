/**
 * WS-DEVELOP-REFUSAL-TRUTH-OBS-01 · O-4, O-5, R-2, R-3 — the operator's record
 * of a refusal that kept nothing.
 *
 * WHY THIS EXISTS. On 2026-09-07 a whole-work read refused twice in production.
 * The typed cause was constructed, returned to one browser, rendered as one
 * sentence, and discarded. Recovering it took three attempts and a Network tab.
 * A refusal that no one can reconstruct is a refusal the system cannot learn
 * from — and this path emitted no log line of any kind.
 *
 * ⛔ THIS IS TELEMETRY ABOUT THE MACHINE. It is not a reading, not an
 * observation, and nothing here is reachable from any surface that presents
 * readings. A refusal still stores no reading (07C), and the reading store is
 * untouched (O-6). The two must never be confused: a record that a reading
 * FAILED is not a record of a reading.
 *
 * ⛔ NO MODEL-SUPPLIED VALUE IS WRITTEN (O-5, as corrected by the founder
 * 2026-09-08). An earlier draft would have persisted the refusal `detail`
 * length-bounded; that was wrong, because a hundred characters of manuscript
 * prose is still manuscript prose — truncation is not redaction. Every field
 * below is either system-issued or drawn from a closed vocabulary. `detailKind`
 * is the inner refusal code, never the sentence that carried it. Where a value
 * would be diagnostically useful but untrusted, it is digested, never stored.
 *
 * R-2 · NOT `lib/security/auditLog.ts`. That writer carries a broader
 * security-audit schema and replicates every production entry to an external
 * endpoint; refusal telemetry must not leave the host. It also has no deletion
 * mechanism, which R-3 requires. What is reused is the SUBSTRATE — the
 * volume-backed audit directory that survives container swaps — in a file
 * family of this lane's own.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { RefusalCause } from '../developmentalReader/contract';

/** R-3. Days, hard. A record older than this is removed whether or not anything else happens. */
export const REFUSAL_RECORD_RETENTION_DAYS = 7;

/** The one closed shape that reaches disk. Adding a field here is a privacy decision. */
export interface RefusalRecord {
  /** ISO-8601, UTC. */
  timestamp: string;
  /** System-issued. A model-supplied id is never written — see `detailKind`. */
  manuscriptId: string;
  lens: string;
  stage: string;
  refusal: string;
  /**
   * The INNER refusal code from a nested failure — e.g. `run_not_as_read` from
   * the binder inside a `claim_unbindable`. A closed vocabulary value parsed out
   * of the detail sentence, never the sentence.
   */
  detailKind: string | null;
  claimIndex: number | null;
  refIndex: number | null;
  /* Null where no causal inquiry occurred — a capture or recover refusal never
     reached a model response. Distinct from `'unknown'`, which means the
     question was live and went unanswered. The operator reading this record
     must be able to tell those apart (O-3 · O-4). */
  completion: RefusalCause['completion'] | null;
  attribution: RefusalCause['attribution'] | null;
  stopReason: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  /* Null when no response existed to attribute — there is then no reader to
     name, and naming the build's default would be a fact about the deployment
     rather than about the act. */
  readerVersion: string | null;
  promptHash: string | null;
}

/**
 * Pull the closed-vocabulary parts out of a detail sentence and DISCARD the rest.
 *
 * Details are built by our own code to a known shape — `claims[26]
 * run_not_as_read: refs[3] is not a contiguous run…` — but they interpolate
 * model-supplied values in some branches (`foreign_field` carries invented key
 * names; `non_conclusion_unknown` carries an invented token). Rather than
 * deciding per branch which sentences are safe, nothing is carried across but
 * the three machine-shaped facts, matched positionally.
 *
 * The identifiers are bounded by construction: `\w+` cannot match a space, so a
 * sentence fragment can never arrive here disguised as a code.
 */
export function normalizeDetail(detail: string): {
  detailKind: string | null; claimIndex: number | null; refIndex: number | null;
} {
  const claim = /\bclaims\[(\d+)\]/.exec(detail);
  const ref = /\brefs\[(\d+)\]/.exec(detail);
  /* The inner code sits between the claim index and its colon. Anchored to that
     shape so free prose cannot be mistaken for a vocabulary word. */
  const kind = /\bclaims\[\d+\]\s+([a-z][a-z0-9_]{2,63}):/.exec(detail);
  return {
    detailKind: kind ? kind[1] : null,
    claimIndex: claim ? Number(claim[1]) : null,
    refIndex: ref ? Number(ref[1]) : null,
  };
}

/** For an untrusted value that matters diagnostically: the digest, never the value (O-5). */
export function digestOf(value: string): string {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex').slice(0, 16);
}

function baseDir(): string {
  const root = process.env.AUDIT_LOG_DIR || './audit-logs';
  return path.join(root, 'develop-refusals');
}

/** `YYYY-MM-DD` in UTC — the day a record belongs to, and the unit retention deletes. */
function dayOf(at: Date): string {
  return at.toISOString().slice(0, 10);
}

const FILE_RE = /^refusals-(\d{4}-\d{2}-\d{2})\.jsonl$/;

/**
 * Append one record. Never throws: an operator log that can take a member's
 * refusal down with it has inverted the priority it exists to serve. The
 * failure is reported to stderr and the refusal proceeds unchanged.
 *
 * Serialized on a promise chain, and the filename is recomputed per write —
 * `auditLog.ts` learned both the hard way: a boot-time filename keeps appending
 * to yesterday's file after midnight.
 */
let writeQueue: Promise<void> = Promise.resolve();

export function recordRefusal(record: RefusalRecord): Promise<void> {
  writeQueue = writeQueue.then(async () => {
    try {
      const dir = baseDir();
      await fs.mkdir(dir, { recursive: true });
      const file = path.join(dir, `refusals-${dayOf(new Date(record.timestamp))}.jsonl`);
      await fs.appendFile(file, `${JSON.stringify(record)}\n`, 'utf-8');
    } catch (err) {
      console.error('[MAIA/develop] refusal record not written:', err);
    }
  });
  return writeQueue;
}

/**
 * R-3 · remove every daily file older than the retention window.
 *
 * ⛔ TIME-DRIVEN, NEVER WRITE-DRIVEN. "Prune on the next refusal" would leave a
 * quiet month's records sitting forever precisely because nothing failed —
 * retention that depends on failure recurring is not retention. `now` is a
 * parameter so the falsifier can prove expiry with no later refusal at all.
 *
 * ⛔ UNLIKE `recordRefusal`, THIS MAY THROW. That asymmetry is deliberate:
 * `recordRefusal` sits on the member's refusal path, where an operator log
 * must never take a member's answer down with it. The sweep sits on no member
 * path at all — its only caller is the retention CLI, whose ratified contract
 * is a non-zero exit on a genuine failure. Swallowing an unreadable directory
 * here would make that contract unimplementable.
 */
export interface SweepResult {
  /** Daily files actually removed. */
  removed: string[];
  /**
   * Files that were due for removal and could NOT be removed. Separate from
   * `removed` because a caller that cannot tell these apart has no way to
   * exit non-zero on a real failure — and a retention sweep that reports
   * success while retaining is the one outcome it must never produce.
   */
  failed: string[];
  /** `YYYY-MM-DD`, UTC. The boundary this run applied, for the operator line. */
  cutoffDay: string;
}

export async function sweepExpired(now: Date = new Date()): Promise<SweepResult> {
  const dir = baseDir();
  const cutoff = new Date(now.getTime() - REFUSAL_RECORD_RETENTION_DAYS * 86_400_000);
  /* Snapped to the day boundary once, outside the loop: the unit of retention
     is the file's day, not the instant the sweep happened to run. */
  const cutoffDay = Date.UTC(cutoff.getUTCFullYear(), cutoff.getUTCMonth(), cutoff.getUTCDate());
  const cutoffDayIso = new Date(cutoffDay).toISOString().slice(0, 10);
  const removed: string[] = [];
  const failed: string[] = [];
  let names: string[];
  try {
    names = await fs.readdir(dir);
  } catch (err) {
    /* ⛔ ENOENT is the ONLY lawful "nothing to do". A directory we cannot READ
       is not an empty one, and reporting it as empty would be exactly the
       silent success this sweep exists to prevent: retention would appear to
       run for as long as the permission fault lasted. Every other errno is a
       real failure and is raised to the caller. */
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return { removed, failed, cutoffDay: cutoffDayIso };
    }
    throw err;
  }
  for (const name of names) {
    const m = FILE_RE.exec(name);
    if (!m) continue;
    /* Compared at the day boundary the file is named for. A file dated exactly
       at the cutoff is still inside the window; only strictly older goes. */
    if (new Date(`${m[1]}T00:00:00.000Z`).getTime() < cutoffDay) {
      try {
        await fs.unlink(path.join(dir, name));
        removed.push(name);
      } catch (err) {
        console.error('[MAIA/develop] refusal record not swept:', name, err);
        failed.push(name);
      }
    }
  }
  return { removed, failed, cutoffDay: cutoffDayIso };
}

/** Read a day's records back — the operator path O-4 exists for. */
export async function readRecords(day: string): Promise<RefusalRecord[]> {
  try {
    const raw = await fs.readFile(path.join(baseDir(), `refusals-${day}.jsonl`), 'utf-8');
    return raw.split('\n').filter(Boolean).map((l) => JSON.parse(l) as RefusalRecord);
  } catch {
    return [];
  }
}
