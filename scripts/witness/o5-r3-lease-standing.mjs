/**
 * O5-R3 lease standing, judged RELATIVE TO ONE DESKTOP INCARNATION. Read-only.
 *
 * Founder ruling (2026-10-01, pre-admission instrument amendment):
 *   Historical lease state may exist. What matters before the first write is that no live
 *   writer holds authority. After Desktop writes, the live lease must belong to this exact
 *   Desktop incarnation.
 *
 * The live Mac Studio walk found the defect this module repairs: the checker read a
 * correctly RELEASED generation (prior, finished history) as a failure of the pre-write
 * baseline, so the witness depended on whether the home had ever been used.
 *
 * Standings (closed vocabulary):
 *   HELD_BY_THIS_DESKTOP         latest generation is held, and its host + pid + incarnation = the binding's
 *   NOT_YET_HELD                 no generation exists
 *   NOT_YET_HELD_AFTER_RELEASE   latest generation is a WELL-FORMED release of the generation before it
 *   HELD_BY_OTHER_LIVE           latest generation is held by a different, live incarnation
 *   UNRELEASED_HOLDER_GONE       latest generation is held, never released, and its holder is dead
 *                                (pid gone, or pid reused by another incarnation)
 *   UNDETERMINABLE               holder liveness cannot be judged from this host
 *   MALFORMED                    latest generation unreadable, or the release chain is not well-formed
 *
 * Only the LATEST generation decides. A released generation earlier in history never vouches
 * for the present. An unreleased dead holder is NOT a pre-write baseline: the first write would
 * be a takeover, which is a different witness. Unknown is not dead; unreadable is not vacant.
 *
 * Liveness is judged by the lease's OWN judgeHolder, so the checker and the writer cannot disagree.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const LEASE = await import(pathToFileURL(path.join(ROOT, 'scripts/builder/grant-writer-lease-v1.mjs')).href);

export const STANDING = Object.freeze({
  HELD_BY_THIS_DESKTOP: 'HELD_BY_THIS_DESKTOP',
  NOT_YET_HELD: 'NOT_YET_HELD',
  NOT_YET_HELD_AFTER_RELEASE: 'NOT_YET_HELD_AFTER_RELEASE',
  HELD_BY_OTHER_LIVE: 'HELD_BY_OTHER_LIVE',
  UNRELEASED_HOLDER_GONE: 'UNRELEASED_HOLDER_GONE',
  UNDETERMINABLE: 'UNDETERMINABLE',
  MALFORMED: 'MALFORMED',
});
export const PRE_WRITE_ACCEPTABLE = Object.freeze([STANDING.NOT_YET_HELD, STANDING.NOT_YET_HELD_AFTER_RELEASE]);
export const POST_WRITE_ACCEPTABLE = Object.freeze([STANDING.HELD_BY_THIS_DESKTOP]);

const GEN_RE = /^g-(\d{12})\.json$/;

/** Every generation file, in order; an unparseable file is carried as { n, record: null }. Read-only. */
export function readLeaseHistory(home) {
  const dir = path.join(home, LEASE.LEASE_DIR);
  let names = [];
  try { names = fs.readdirSync(dir); } catch { return []; }
  return names.map((name) => GEN_RE.exec(name)).filter(Boolean).map((m) => Number(m[1])).sort((a, b) => a - b)
    .map((n) => {
      let record = null;
      try { record = JSON.parse(fs.readFileSync(path.join(dir, `g-${String(n).padStart(12, '0')}.json`), 'utf8')); } catch { record = null; }
      return { n, record };
    });
}

const isHeldRecord = (r, n) => !!r && r.version === LEASE.LEASE_VERSION && r.released !== true && r.generation === n
  && typeof r.owner_nonce === 'string' && typeof r.host === 'string' && Number.isInteger(r.pid);

/** A release is well-formed only as the release OF the generation immediately before it. */
function releaseWellFormed(history, i) {
  const rel = history[i].record;
  const prev = history[i - 1];
  if (!rel || rel.version !== LEASE.LEASE_VERSION || rel.released !== true) return 'not a release record';
  if (rel.generation !== history[i].n) return 'release generation field does not match its file';
  if (typeof rel.released_at !== 'string' || Number.isNaN(Date.parse(rel.released_at))) return 'release carries no valid released_at';
  if (typeof rel.owner_nonce !== 'string') return 'release carries no owner_nonce';
  if (!prev || prev.n !== history[i].n - 1) return 'no generation immediately precedes the release';
  if (!isHeldRecord(prev.record, prev.n)) return 'the preceding generation is not a held record';
  if (prev.record.owner_nonce !== rel.owner_nonce) return 'release names a different owner than the generation it releases';
  return null;
}

/**
 * Pure classification. `binding` = { host, pid, processStartTime } of the live Desktop.
 * `probe` defaults to the lease's own probe, so liveness is judged exactly as the writer judges it.
 */
export function classifyLeaseStanding(history, binding, { probe = LEASE.probeProcess } = {}) {
  if (!history.length) return { standing: STANDING.NOT_YET_HELD, generation: 0, detail: 'no lease generation exists' };
  const i = history.length - 1;
  const { n, record } = history[i];
  if (!record) return { standing: STANDING.MALFORMED, generation: n, detail: 'latest generation unreadable' };
  if (record.released === true) {
    const why = releaseWellFormed(history, i);
    return why
      ? { standing: STANDING.MALFORMED, generation: n, detail: why }
      : { standing: STANDING.NOT_YET_HELD_AFTER_RELEASE, generation: n, detail: `generation ${n} released at ${record.released_at}` };
  }
  if (!isHeldRecord(record, n)) return { standing: STANDING.MALFORMED, generation: n, detail: 'latest generation is neither a held record nor a release' };
  const self = { host: binding?.host, pid: binding?.pid, process_start_time: binding?.processStartTime ?? null };
  const verdict = LEASE.judgeHolder(record, self, probe);
  const who = `pid ${record.pid} · start ${record.process_start_time} · generation ${n}`;
  if (verdict === 'THIS_PROCESS') return { standing: STANDING.HELD_BY_THIS_DESKTOP, generation: n, detail: who };
  if (verdict === 'ALIVE') return { standing: STANDING.HELD_BY_OTHER_LIVE, generation: n, detail: who };
  if (verdict === 'DEAD' || verdict === 'DEAD_PID_REUSED') return { standing: STANDING.UNRELEASED_HOLDER_GONE, generation: n, detail: `${verdict} · ${who}` };
  return { standing: STANDING.UNDETERMINABLE, generation: n, detail: who };
}

