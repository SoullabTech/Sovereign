/**
 * F-pass durability (R1). Nothing is trusted from server memory.
 *
 * Every successful case save is held in THREE places, and the first two sit in a different directory from the third:
 *   1. a write-once GENERATION file   <backupDir>/generations/gen-<seq>-<sha8>.json   (the ledger; never overwritten)
 *   2. a rolling latest copy          <backupDir>/rolling-latest.json
 *   3. the canonical working file     <workingPath>
 * plus a hash-chained, content-free EVENT LOG   <backupDir>/events.jsonl   (no judgment values, ever).
 *
 * Order of a save: generation → working → rolling → verify all three byte-equal → event. The generation goes first so a
 * crash between steps leaves the NEWEST state recoverable rather than the previous one.
 *
 * `verify()` re-reads the disk on every call and repairs any single-copy loss from the survivors (preserving a diverged
 * copy for inspection). If NO copy equals what the ledger says was last saved, it refuses LOUDLY — it never serves a
 * count the disk cannot back, and it never starts a fresh blank sheet over lost progress.
 *
 * This module depends only on `pilot.ts` (no UI model), so it builds and tests from a clean checkout.
 */
import { createHash } from 'node:crypto';
import {
  chmodSync, closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync, readdirSync,
  renameSync, statSync, truncateSync, unlinkSync, writeSync, copyFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { assertOutsideHome, physicalPath, type Sheet } from './pilot';
import { QUESTION_IDS } from '../core';

export class DurabilityRefused extends Error {
  constructor(public readonly code: string, detail: string) { super(`${code}: ${detail}`); }
}

export const sha256Hex = (b: Buffer | string): string => createHash('sha256').update(b).digest('hex');
export const canonicalSheet = (s: Sheet): string => JSON.stringify(s, null, 2) + '\n';

export function completedCases(sheet: Sheet): number {
  const byCase = new Map<string, number>();
  for (const e of sheet.entries) {
    if (e.value !== null) byCase.set(e.pilot_id, (byCase.get(e.pilot_id) ?? 0) + 1);
    else if (!byCase.has(e.pilot_id)) byCase.set(e.pilot_id, 0);
  }
  return [...byCase.values()].filter((n) => n === QUESTION_IDS.length).length;
}
export const totalCases = (sheet: Sheet): number => new Set(sheet.entries.map((e) => e.pilot_id)).size;

// ───────────────────────── durable primitives ─────────────────────────

function fsyncDir(dir: string): void {
  try {
    const fd = openSync(dir, 'r');
    try { fsyncSync(fd); } finally { closeSync(fd); }
  } catch { /* directory fsync is best-effort on platforms that refuse it */ }
}

let tmpCounter = 0;
/** tmp → fsync → rename → chmod → fsync dir → re-read BYTES and compare. Returns the SHA-256 of what is on disk. */
export function atomicWriteVerified(path: string, data: string, mode = 0o600): string {
  mkdirSync(dirname(path), { recursive: true });
  const tmp = `${path}.tmp-${process.pid}-${tmpCounter++}`;
  try {
    const fd = openSync(tmp, 'wx', mode);
    try { writeSync(fd, data); fsyncSync(fd); } finally { closeSync(fd); }
    chmodSync(tmp, mode);
    renameSync(tmp, path);
  } catch (e) {
    try { unlinkSync(tmp); } catch { /* nothing to clean */ }
    throw e;
  }
  chmodSync(path, mode);
  fsyncDir(dirname(path));
  const back = readFileSync(path);
  if (back.toString('utf8') !== data) throw new DurabilityRefused('WRITE_VERIFY_FAILED', 'file did not read back byte-for-byte: ' + path);
  return sha256Hex(back);
}

/** Write-once ('wx'), fsync, re-read. An existing file with identical bytes is accepted (idempotent); anything else is a conflict. */
export function writeOnceVerified(path: string, data: string, mode = 0o600): string {
  mkdirSync(dirname(path), { recursive: true });
  if (existsSync(path)) {
    const cur = readFileSync(path, 'utf8');
    if (cur === data) return sha256Hex(data);
    throw new DurabilityRefused('WRITE_ONCE_CONFLICT', 'a different file already exists at ' + path);
  }
  const fd = openSync(path, 'wx', mode);
  try { writeSync(fd, data); fsyncSync(fd); } finally { closeSync(fd); }
  chmodSync(path, mode);
  fsyncDir(dirname(path));
  if (readFileSync(path, 'utf8') !== data) throw new DurabilityRefused('WRITE_VERIFY_FAILED', 'write-once file did not read back: ' + path);
  return sha256Hex(data);
}

// ───────────────────────── event log: append-only, hash-chained, content-free ─────────────────────────

export interface DurEvent {
  seq: number;
  at: string;
  event: string;
  prev_event_sha256: string | null;
  [k: string]: unknown;
  event_sha256: string;
}

function parseEventLine(line: string, expectSeq: number, expectPrev: string | null): DurEvent {
  let o: Record<string, unknown>;
  try { o = JSON.parse(line) as Record<string, unknown>; }
  catch { throw new DurabilityRefused('EVENT_LOG_CORRUPT', 'unparseable line at seq ' + expectSeq); }
  const { event_sha256, ...rest } = o;
  if (typeof event_sha256 !== 'string' || sha256Hex(JSON.stringify(rest)) !== event_sha256) {
    throw new DurabilityRefused('EVENT_LOG_CORRUPT', 'hash mismatch at seq ' + expectSeq);
  }
  if (o.seq !== expectSeq) throw new DurabilityRefused('EVENT_LOG_CORRUPT', 'sequence gap at ' + expectSeq);
  if ((o.prev_event_sha256 ?? null) !== expectPrev) throw new DurabilityRefused('EVENT_LOG_CORRUPT', 'chain break at seq ' + expectSeq);
  return o as unknown as DurEvent;
}

/** Reads and VERIFIES the chain. A torn (unterminated, unparseable) final line is reported, not tolerated silently. */
export function readEvents(path: string): { events: DurEvent[]; tornTailBytes: number } {
  if (!existsSync(path)) return { events: [], tornTailBytes: 0 };
  const text = readFileSync(path, 'utf8');
  const events: DurEvent[] = [];
  const endsClean = text === '' || text.endsWith('\n');
  const lines = text.split('\n');
  if (endsClean) lines.pop();
  let tornTailBytes = 0;
  let prev: string | null = null;
  for (let i = 0; i < lines.length; i += 1) {
    const isLast = i === lines.length - 1;
    const line = lines[i] as string;
    if (isLast && !endsClean) { tornTailBytes = Buffer.byteLength(line, 'utf8'); break; }
    const ev = parseEventLine(line, i + 1, prev);
    events.push(ev);
    prev = ev.event_sha256;
  }
  return { events, tornTailBytes };
}

export function appendEvent(path: string, event: string, fields: Record<string, unknown>, now: Date = new Date()): DurEvent {
  const { events, tornTailBytes } = readEvents(path);
  if (tornTailBytes > 0) throw new DurabilityRefused('EVENT_LOG_TORN_TAIL', 'quarantine the torn tail before appending');
  const last = events[events.length - 1];
  const base = {
    seq: (last?.seq ?? 0) + 1,
    at: now.toISOString(),
    event,
    prev_event_sha256: last?.event_sha256 ?? null,
    ...fields,
  };
  const ev = { ...base, event_sha256: sha256Hex(JSON.stringify(base)) };
  mkdirSync(dirname(path), { recursive: true });
  const fd = openSync(path, 'a', 0o600);
  try { writeSync(fd, JSON.stringify(ev) + '\n'); fsyncSync(fd); } finally { closeSync(fd); }
  chmodSync(path, 0o600);
  return ev as unknown as DurEvent;
}

// ───────────────────────── custody ─────────────────────────

export interface CustodyConfig {
  home: string;
  sourcePath: string;
  workingPath: string;
  backupDir: string;
  /** Parses AND validates a sheet (domain, labeller, P-seal binding). Throws on anything wrong. */
  parse: (text: string) => Sheet;
  /** Content-free code identity recorded at startup. */
  identity?: () => Record<string, unknown>;
  now?: () => Date;
  /** TEST SEAM: called after each save step completes; throwing simulates a crash at that point. Never set in production. */
  fault?: (step: 'generation' | 'working' | 'rolling' | 'event') => void;
}

export interface CustodyReport {
  disk_verified: true;
  working_path: string;
  working_exists: boolean;
  working_sha256: string | null;
  rolling_sha256: string | null;
  generation_count: number;
  latest_generation_seq: number;
  event_seq: number;
  completed_cases_from_disk: number;
  total_cases: number;
  repaired: string[];
}

interface Gen { seq: number; sha256: string; text: string; file: string }
const GEN_RE = /^gen-(\d{6})-([0-9a-f]{8})\.json$/;

export class Custody {
  readonly rollingPath: string;
  readonly genDir: string;
  readonly eventPath: string;
  readonly divergedDir: string;
  private readonly now: () => Date;
  private source!: Sheet;
  private sourceSha = '';

  constructor(private readonly cfg: CustodyConfig) {
    this.rollingPath = join(cfg.backupDir, 'rolling-latest.json');
    this.genDir = join(cfg.backupDir, 'generations');
    this.eventPath = join(cfg.backupDir, 'events.jsonl');
    this.divergedDir = join(cfg.backupDir, 'diverged');
    this.now = cfg.now ?? (() => new Date());
  }

  /** Placement is a deliberate act: the safety copies may not share a directory with the canonical working file. */
  private assertPlacement(): void {
    const { home, workingPath, backupDir, sourcePath } = this.cfg;
    for (const p of [workingPath, this.rollingPath, this.eventPath, join(this.genDir, 'x')]) assertOutsideHome(home, p);
    mkdirSync(backupDir, { recursive: true, mode: 0o700 });
    mkdirSync(dirname(workingPath), { recursive: true });
    if (physicalPath(backupDir) === physicalPath(dirname(workingPath))) {
      throw new DurabilityRefused('BACKUP_DIR_NOT_SEPARATE', 'the backup directory must differ from the working file\'s directory');
    }
    if (resolve(workingPath) === resolve(sourcePath)) {
      throw new DurabilityRefused('WORKING_IS_SOURCE', 'the working file may not be the frozen source sheet');
    }
  }

  private compatible(s: Sheet, label: string): void {
    const a = this.source;
    if (s.manifest_sha256 !== a.manifest_sha256) throw new DurabilityRefused('MANIFEST_MISMATCH', label);
    if (s.after_p_seal_sha256 !== a.after_p_seal_sha256) throw new DurabilityRefused('P_SEAL_MISMATCH', label);
    if (s.domain !== a.domain || s.labeller !== a.labeller) throw new DurabilityRefused('SHEET_IDENTITY_MISMATCH', label);
    if (s.entries.length !== a.entries.length) throw new DurabilityRefused('ENTRY_SET_MISMATCH', `${label}: entry count`);
    for (let i = 0; i < a.entries.length; i += 1) {
      const x = a.entries[i]; const y = s.entries[i];
      if (!x || !y || x.pilot_id !== y.pilot_id || x.target !== y.target || x.domain !== y.domain || y.hindsight_risk !== true) {
        throw new DurabilityRefused('ENTRY_SET_MISMATCH', `${label}: entry ${i}`);
      }
    }
  }

  private readText(path: string): string | null {
    if (!existsSync(path)) return null;
    return readFileSync(path, 'utf8');
  }

  /** Valid generations, oldest→newest. A generation whose bytes do not match its own name, or that does not parse, is ignored. */
  private scanGenerations(): { gens: Gen[]; invalid: string[] } {
    const gens: Gen[] = [];
    const invalid: string[] = [];
    if (!existsSync(this.genDir)) return { gens, invalid };
    for (const f of readdirSync(this.genDir).sort()) {
      const m = GEN_RE.exec(f);
      if (!m) continue;
      const text = readFileSync(join(this.genDir, f), 'utf8');
      const sha = sha256Hex(text);
      try {
        if (sha.slice(0, 8) !== m[2]) throw new DurabilityRefused('GEN_NAME_HASH', f);
        this.compatible(this.cfg.parse(text), f);
        gens.push({ seq: Number(m[1]), sha256: sha, text, file: f });
      } catch { invalid.push(f); }
    }
    gens.sort((a, b) => a.seq - b.seq);
    return { gens, invalid };
  }

  private quarantineTornTail(): void {
    const { tornTailBytes } = readEvents(this.eventPath);
    if (tornTailBytes === 0) return;
    const stamp = this.now().toISOString().replace(/[:.]/g, '-');
    copyFileSync(this.eventPath, `${this.eventPath}.torn-${stamp}`);
    chmodSync(`${this.eventPath}.torn-${stamp}`, 0o600);
    truncateSync(this.eventPath, statSync(this.eventPath).size - tornTailBytes);
  }

  /** Re-read everything from disk, repair any single-copy loss, refuse if the ledger cannot be honoured. */
  verify(): { sheet: Sheet; report: CustodyReport } {
    if (!this.source) throw new DurabilityRefused('NOT_STARTED', 'call start() before verify()');
    this.assertPlacement();
    const { workingPath } = this.cfg;
    const { gens } = this.scanGenerations();
    const latest = gens[gens.length - 1] ?? null;
    const { events, tornTailBytes } = readEvents(this.eventPath);
    if (tornTailBytes > 0) {
      throw new DurabilityRefused('EVENT_LOG_TORN_TAIL',
        'the event log has an unterminated tail; custody is not verified');
    }
    const lastSaveEv = [...events].reverse().find((e) => typeof e.working_sha256 === 'string');

    const wText = this.readText(workingPath);
    const rText = this.readText(this.rollingPath);
    const wSha = wText === null ? null : sha256Hex(wText);
    const rSha = rText === null ? null : sha256Hex(rText);
    const repaired: string[] = [];

    let expected: { sha: string; text: string } | null = null;
    let adopted = false;
    const ledgerWant = typeof lastSaveEv?.working_sha256 === 'string' ? lastSaveEv.working_sha256 : null;
    const genShas = new Set(gens.map((g) => g.sha256));
    if (ledgerWant !== null && !genShas.has(ledgerWant)) {
      // The ledger claims a save that NO generation holds. A crash cannot cause this (the event is written last), so it
      // means a generation was lost. Only a surviving copy that matches the ledger may be served; an older state may not.
      if (wText !== null && wSha === ledgerWant) expected = { sha: ledgerWant, text: wText };
      else if (rText !== null && rSha === ledgerWant) expected = { sha: ledgerWant, text: rText };
      else {
        throw new DurabilityRefused('DURABILITY_UNRECOVERABLE',
          `the ledger records a save (${ledgerWant.slice(0, 12)}…) but no generation, rolling copy or working file matches it`);
      }
    } else if (latest) {
      expected = { sha: latest.sha256, text: latest.text };
    }

    if (!expected) {
      if (wText !== null) {
        // A working file with progress but no generation/ledger: only a pre-R1 file can look like this. Adopt it, visibly.
        const s = this.cfg.parse(wText);
        this.compatible(s, 'working');
        expected = { sha: wSha as string, text: wText };
        adopted = true;
        this.writeGeneration(expected.text, gens.length);
        appendEvent(this.eventPath, 'F_BASELINE_ADOPTED', {
          working_path: workingPath, working_sha256: expected.sha, completed_cases: completedCases(s), total_cases: totalCases(s),
        }, this.now());
        repaired.push('BASELINE_ADOPTED');
      } else {
        return { sheet: this.source, report: this.report(null, null, gens.length, latest?.seq ?? 0, events, this.source, repaired) };
      }
    }

    if (wText === null || wSha !== expected.sha) {
      if (wText !== null && wSha !== expected.sha) this.preserveDiverged(wText);
      atomicWriteVerified(workingPath, expected.text);
      repaired.push(wText === null ? 'WORKING_RESTORED_MISSING' : 'WORKING_RESTORED_DIVERGED');
    }
    if (rText === null || rSha !== expected.sha) {
      atomicWriteVerified(this.rollingPath, expected.text);
      repaired.push('ROLLING_REFRESHED');
    }
    if (!adopted && !genShas.has(expected.sha)) {
      this.writeGeneration(expected.text, gens.length);
      repaired.push('GENERATION_REBUILT');
    }

    const after = readEvents(this.eventPath).events;
    const lastAfter = [...after].reverse().find((e) => typeof e.working_sha256 === 'string');
    if (!lastAfter || lastAfter.working_sha256 !== expected.sha) {
      appendEvent(this.eventPath, 'F_EVENT_CATCHUP', { working_sha256: expected.sha, rolling_sha256: expected.sha }, this.now());
      repaired.push('EVENT_CATCHUP');
    }
    if (repaired.some((r) => r.startsWith('WORKING_RESTORED') || r === 'GENERATION_REBUILT' || (r === 'ROLLING_REFRESHED' && !adopted))) {
      appendEvent(this.eventPath, 'F_DURABILITY_REPAIR', { repairs: repaired, working_sha256: expected.sha }, this.now());
    }

    const sheet = this.cfg.parse(expected.text);
    this.compatible(sheet, 'expected');
    const g2 = this.scanGenerations().gens;
    return { sheet, report: this.report(expected.sha, expected.sha, g2.length, g2[g2.length - 1]?.seq ?? 0, readEvents(this.eventPath).events, sheet, repaired) };
  }

  private report(w: string | null, r: string | null, genCount: number, genSeq: number, events: DurEvent[], sheet: Sheet, repaired: string[]): CustodyReport {
    return {
      disk_verified: true,
      working_path: this.cfg.workingPath,
      working_exists: w !== null,
      working_sha256: w,
      rolling_sha256: r,
      generation_count: genCount,
      latest_generation_seq: genSeq,
      event_seq: events[events.length - 1]?.seq ?? 0,
      completed_cases_from_disk: completedCases(sheet),
      total_cases: totalCases(sheet),
      repaired,
    };
  }

  private preserveDiverged(text: string): void {
    const name = `working-${this.now().toISOString().replace(/[:.]/g, '-')}-${sha256Hex(text).slice(0, 8)}.json`;
    writeOnceVerified(join(this.divergedDir, name), text);
  }

  private writeGeneration(text: string, existingCount: number): Gen {
    const { gens } = this.scanGenerations();
    const seq = (gens[gens.length - 1]?.seq ?? existingCount) + 1;
    const sha = sha256Hex(text);
    const file = `gen-${String(seq).padStart(6, '0')}-${sha.slice(0, 8)}.json`;
    writeOnceVerified(join(this.genDir, file), text);
    return { seq, sha256: sha, text, file };
  }

  start(): CustodyReport {
    this.assertPlacement();
    this.source = this.cfg.parse(readFileSync(this.cfg.sourcePath, 'utf8'));
    this.sourceSha = sha256Hex(readFileSync(this.cfg.sourcePath));
    this.quarantineTornTail();
    const { report } = this.verify();
    appendEvent(this.eventPath, 'F_SERVER_STARTED', {
      source_path: this.cfg.sourcePath,
      source_sha256: this.sourceSha,
      working_path: this.cfg.workingPath,
      rolling_path: this.rollingPath,
      generation_dir: this.genDir,
      event_log_path: this.eventPath,
      completed_cases_at_start: report.completed_cases_from_disk,
      code_identity: this.cfg.identity ? this.cfg.identity() : null,
    }, this.now());
    return this.verify().report;
  }

  /** generation → working → rolling → verify all three → event. Throws (and the UI does not advance) on any failure. */
  save(next: Sheet, pilotId: string): { sheet: Sheet; report: CustodyReport } {
    const pre = this.verify();
    this.compatible(next, 'candidate');
    const text = canonicalSheet(next);
    const sha = sha256Hex(text);
    const gen = this.writeGeneration(text, pre.report.generation_count);
    this.cfg.fault?.('generation');
    const wSha = atomicWriteVerified(this.cfg.workingPath, text);
    this.cfg.fault?.('working');
    const rSha = atomicWriteVerified(this.rollingPath, text);
    this.cfg.fault?.('rolling');
    if (wSha !== sha || rSha !== sha || gen.sha256 !== sha) {
      throw new DurabilityRefused('COPIES_DISAGREE', 'generation, working and rolling copies are not byte-identical after save');
    }
    appendEvent(this.eventPath, 'F_CASE_SAVED_TO_DISK', {
      pilot_id: pilotId,
      completed_cases: completedCases(next),
      total_cases: totalCases(next),
      working_path: this.cfg.workingPath,
      working_sha256: wSha,
      rolling_sha256: rSha,
      generation_file: gen.file,
      generation_seq: gen.seq,
    }, this.now());
    this.cfg.fault?.('event');
    const post = this.verify();
    if (post.report.working_sha256 !== sha) throw new DurabilityRefused('POST_SAVE_VERIFY_FAILED', 'disk does not hold the saved state');
    return post;
  }
}

// ───────────────────────── read-only inspection (used by the finish gate) ─────────────────────────

export interface BackupInspection {
  rollingText: string | null;
  latestGeneration: { seq: number; sha256: string; text: string } | null;
  lastSaveEvent: DurEvent | null;
  eventCount: number;
}

/** Read-only. Throws EVENT_LOG_CORRUPT on a broken chain and EVENT_LOG_TORN_TAIL on an unterminated final line. */
export function inspectBackup(backupDir: string): BackupInspection {
  const rollingPath = join(backupDir, 'rolling-latest.json');
  const genDir = join(backupDir, 'generations');
  const { events, tornTailBytes } = readEvents(join(backupDir, 'events.jsonl'));
  if (tornTailBytes > 0) throw new DurabilityRefused('EVENT_LOG_TORN_TAIL', 'event log ends in an unterminated line');
  let latest: BackupInspection['latestGeneration'] = null;
  if (existsSync(genDir)) {
    for (const f of readdirSync(genDir).sort()) {
      const m = GEN_RE.exec(f);
      if (!m) continue;
      const text = readFileSync(join(genDir, f), 'utf8');
      const sha = sha256Hex(text);
      if (sha.slice(0, 8) !== m[2]) continue;
      const seq = Number(m[1]);
      if (!latest || seq > latest.seq) latest = { seq, sha256: sha, text };
    }
  }
  return {
    rollingText: existsSync(rollingPath) ? readFileSync(rollingPath, 'utf8') : null,
    latestGeneration: latest,
    lastSaveEvent: [...events].reverse().find((e) => typeof e.working_sha256 === 'string') ?? null,
    eventCount: events.length,
  };
}
