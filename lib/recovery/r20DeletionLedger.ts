/**
 * R20 independent deletion ledger.
 *
 * The application database remains the transactional source of truth for a
 * deletion act. This module mirrors ONLY the content-free S5 deletion substrate
 * (manifests, scopes and tombstones) into an independently held, HMAC-authenticated
 * ledger with a monotonic high-water record. It never stores manuscript prose,
 * filenames, Source text or vault paths.
 */

import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { query, transaction, type TransactionClient } from '@/lib/db/postgres';

const LEDGER_PROTOCOL = 'soullab.r20.deletion-ledger.v1';
const HIGH_WATER_PROTOCOL = 'soullab.r20.deletion-high-water.v1';

export type R20ManifestRecord = Readonly<{
  id: string;
  reason_class: string;
  incident_ref: string | null;
  authorized_by: string;
  executed_at: string | null;
  created_at: string;
  note: string | null;
}>;

export type R20ScopeRecord = Readonly<{
  id: string;
  manifest_id: string;
  table_name: string;
  session_id: string | null;
  member_id: string | null;
  window_start: string | null;
  window_end: string | null;
}>;

export type R20TombstoneRecord = Readonly<{
  id: string;
  manifest_id: string;
  object_kind: string;
  object_id: string;
  tombstoned_at: string;
}>;

export type R20LedgerPayload = Readonly<{
  manifests: readonly R20ManifestRecord[];
  scopes: readonly R20ScopeRecord[];
  tombstones: readonly R20TombstoneRecord[];
}>;

type LedgerUnsigned = Readonly<{
  protocol: typeof LEDGER_PROTOCOL;
  generation: number;
  captured_at: string;
  payload_sha256: string;
  payload: R20LedgerPayload;
}>;

export type R20LedgerEnvelope = LedgerUnsigned & Readonly<{ hmac_sha256: string }>;

type HighWaterUnsigned = Readonly<{
  protocol: typeof HIGH_WATER_PROTOCOL;
  generation: number;
  ledger_sha256: string;
  updated_at: string;
}>;

export type R20HighWater = HighWaterUnsigned & Readonly<{ hmac_sha256: string }>;

export class R20LedgerError extends Error {
  readonly code: string;
  constructor(code: string) {
    super(code);
    this.name = 'R20LedgerError';
    this.code = code;
  }
}

export function r20LedgerErrorCode(error: unknown): string {
  if (error instanceof R20LedgerError) return error.code;
  const maybe = error as NodeJS.ErrnoException | undefined;
  return typeof maybe?.code === 'string' ? maybe.code.slice(0, 48) : 'R20_LEDGER_UNKNOWN';
}

function requiredPath(value: string | undefined, code: string): string {
  if (!value || !path.isAbsolute(value)) throw new R20LedgerError(code);
  return value;
}

function keyBytes(file: string): Buffer {
  let raw: Buffer;
  try {
    raw = fs.readFileSync(file);
  } catch {
    throw new R20LedgerError('R20_LEDGER_KEY_UNAVAILABLE');
  }
  const text = raw.toString('utf8').trim();
  let key: Buffer;
  if (/^[a-f0-9]{64}$/i.test(text)) key = Buffer.from(text, 'hex');
  else if (/^[A-Za-z0-9+/]{43}=$/.test(text) || /^[A-Za-z0-9+/]{44}$/.test(text)) key = Buffer.from(text, 'base64');
  else key = raw;
  if (key.length !== 32) throw new R20LedgerError('R20_LEDGER_KEY_INVALID');
  return key;
}

function stableJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((k) => `${JSON.stringify(k)}:${stableJson(record[k])}`).join(',')}}`;
}

function sha256(value: string | Buffer): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function hmac(key: Buffer, value: unknown): string {
  return crypto.createHmac('sha256', key).update(stableJson(value)).digest('hex');
}

function constantEqual(a: string, b: string): boolean {
  if (!/^[a-f0-9]{64}$/i.test(a) || !/^[a-f0-9]{64}$/i.test(b)) return false;
  return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
}

function iso(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  if (!Number.isFinite(date.getTime())) throw new R20LedgerError('R20_LEDGER_TIMESTAMP_INVALID');
  return date.toISOString();
}

function atomicWrite(file: string, bytes: Buffer | string): void {
  const dir = path.dirname(file);
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const temp = path.join(dir, `.${path.basename(file)}.${process.pid}.${crypto.randomUUID()}.tmp`);
  const fd = fs.openSync(temp, 'wx', 0o600);
  try {
    fs.writeFileSync(fd, bytes);
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  fs.renameSync(temp, file);
  const dirFd = fs.openSync(dir, 'r');
  try { fs.fsyncSync(dirFd); } finally { fs.closeSync(dirFd); }
}

function parseJson<T>(file: string, code: string): { value: T; bytes: Buffer } {
  let bytes: Buffer;
  try { bytes = fs.readFileSync(file); } catch { throw new R20LedgerError(code); }
  try { return { value: JSON.parse(bytes.toString('utf8')) as T, bytes }; }
  catch { throw new R20LedgerError(`${code}_INVALID`); }
}

function verifyEnvelope(envelope: R20LedgerEnvelope, key: Buffer): void {
  if (envelope.protocol !== LEDGER_PROTOCOL) throw new R20LedgerError('R20_LEDGER_PROTOCOL_INVALID');
  if (!Number.isSafeInteger(envelope.generation) || envelope.generation < 1) throw new R20LedgerError('R20_LEDGER_GENERATION_INVALID');
  const unsigned: LedgerUnsigned = {
    protocol: envelope.protocol,
    generation: envelope.generation,
    captured_at: envelope.captured_at,
    payload_sha256: envelope.payload_sha256,
    payload: envelope.payload,
  };
  if (!constantEqual(envelope.hmac_sha256, hmac(key, unsigned))) throw new R20LedgerError('R20_LEDGER_HMAC_INVALID');
  if (!constantEqual(envelope.payload_sha256, sha256(stableJson(envelope.payload)))) throw new R20LedgerError('R20_LEDGER_PAYLOAD_HASH_INVALID');
  validatePayload(envelope.payload);
}

function verifyHighWater(high: R20HighWater, key: Buffer): void {
  if (high.protocol !== HIGH_WATER_PROTOCOL) throw new R20LedgerError('R20_HIGH_WATER_PROTOCOL_INVALID');
  if (!Number.isSafeInteger(high.generation) || high.generation < 1) throw new R20LedgerError('R20_HIGH_WATER_GENERATION_INVALID');
  const unsigned: HighWaterUnsigned = {
    protocol: high.protocol,
    generation: high.generation,
    ledger_sha256: high.ledger_sha256,
    updated_at: high.updated_at,
  };
  if (!constantEqual(high.hmac_sha256, hmac(key, unsigned))) throw new R20LedgerError('R20_HIGH_WATER_HMAC_INVALID');
}

function validatePayload(payload: R20LedgerPayload): void {
  if (!payload || !Array.isArray(payload.manifests) || !Array.isArray(payload.scopes) || !Array.isArray(payload.tombstones)) {
    throw new R20LedgerError('R20_LEDGER_PAYLOAD_INVALID');
  }
  const forbiddenKey = /^(artifact_ref|source_text|original_filename|storage_path|body|content)$/i;
  const inspectKeys = (value: unknown): void => {
    if (Array.isArray(value)) { for (const item of value) inspectKeys(item); return; }
    if (!value || typeof value !== 'object') return;
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      if (forbiddenKey.test(key)) throw new R20LedgerError('R20_LEDGER_CONTENT_FIELD_FORBIDDEN');
      inspectKeys(item);
    }
  };
  inspectKeys(payload);
  for (const row of payload.tombstones) {
    if (!row.id || !row.manifest_id || !row.object_kind || !row.object_id || !row.tombstoned_at) {
      throw new R20LedgerError('R20_LEDGER_TOMBSTONE_INVALID');
    }
  }
}

function assertPayloadNonRegression(previous: R20LedgerPayload, current: R20LedgerPayload): void {
  const assertRows = <T>(
    prior: readonly T[], present: readonly T[], key: (row: T) => string,
  ): void => {
    const currentByKey = new Map<string, string>();
    for (const row of present) {
      const k = key(row);
      if (currentByKey.has(k)) throw new R20LedgerError('R20_LEDGER_DATABASE_DUPLICATE');
      currentByKey.set(k, stableJson(row));
    }
    for (const row of prior) {
      const k = key(row);
      if (currentByKey.get(k) !== stableJson(row)) {
        throw new R20LedgerError('R20_LEDGER_DATABASE_REGRESSION');
      }
    }
  };
  assertRows(previous.manifests, current.manifests, (row) => row.id);
  assertRows(previous.scopes, current.scopes, (row) => row.id);
  assertRows(previous.tombstones, current.tombstones, (row) => `${row.object_kind} ${row.object_id}`);
}

async function currentPayload(): Promise<R20LedgerPayload> {
  const manifests = await query<any>(
    `SELECT id::text, reason_class, incident_ref, authorized_by, executed_at, created_at, note
       FROM deletion_manifests ORDER BY created_at, id`,
  );
  const scopes = await query<any>(
    `SELECT id::text, manifest_id::text, table_name, session_id, member_id, window_start, window_end
       FROM deletion_manifest_scopes ORDER BY manifest_id, table_name, id`,
  );
  const tombstones = await query<any>(
    `SELECT id::text, manifest_id::text, object_kind, object_id, tombstoned_at
       FROM provenance_tombstones ORDER BY object_kind, object_id, id`,
  );
  const payload: R20LedgerPayload = {
    manifests: manifests.rows.map((r: any) => ({
      id: String(r.id), reason_class: String(r.reason_class), incident_ref: r.incident_ref == null ? null : String(r.incident_ref),
      authorized_by: String(r.authorized_by), executed_at: iso(r.executed_at), created_at: iso(r.created_at)!, note: r.note == null ? null : String(r.note),
    })),
    scopes: scopes.rows.map((r: any) => ({
      id: String(r.id), manifest_id: String(r.manifest_id), table_name: String(r.table_name),
      session_id: r.session_id == null ? null : String(r.session_id), member_id: r.member_id == null ? null : String(r.member_id),
      window_start: iso(r.window_start), window_end: iso(r.window_end),
    })),
    tombstones: tombstones.rows.map((r: any) => ({
      id: String(r.id), manifest_id: String(r.manifest_id), object_kind: String(r.object_kind), object_id: String(r.object_id),
      tombstoned_at: iso(r.tombstoned_at)!,
    })),
  };
  validatePayload(payload);
  return payload;
}

export type R20LedgerPaths = Readonly<{ ledgerFile: string; highWaterFile: string; keyFile: string }>;

export function r20LedgerPathsFromEnv(): R20LedgerPaths {
  return {
    ledgerFile: requiredPath(process.env.R20_LEDGER_FILE, 'R20_LEDGER_FILE_MISSING'),
    highWaterFile: requiredPath(process.env.R20_HIGH_WATER_FILE, 'R20_HIGH_WATER_FILE_MISSING'),
    keyFile: requiredPath(process.env.R20_LEDGER_KEY_FILE, 'R20_LEDGER_KEY_FILE_MISSING'),
  };
}

export function verifyR20DeletionLedger(paths: R20LedgerPaths = r20LedgerPathsFromEnv()): {
  envelope: R20LedgerEnvelope; highWater: R20HighWater; ledgerSha256: string;
} {
  const key = keyBytes(paths.keyFile);
  const ledger = parseJson<R20LedgerEnvelope>(paths.ledgerFile, 'R20_LEDGER_MISSING');
  const high = parseJson<R20HighWater>(paths.highWaterFile, 'R20_HIGH_WATER_MISSING');
  verifyEnvelope(ledger.value, key);
  verifyHighWater(high.value, key);
  const ledgerHash = sha256(ledger.bytes);
  if (ledger.value.generation !== high.value.generation) throw new R20LedgerError('R20_LEDGER_STALE_GENERATION');
  if (!constantEqual(ledgerHash, high.value.ledger_sha256)) throw new R20LedgerError('R20_LEDGER_STALE_DIGEST');
  return { envelope: ledger.value, highWater: high.value, ledgerSha256: ledgerHash };
}

export async function sealR20DeletionLedger(paths: R20LedgerPaths = r20LedgerPathsFromEnv()): Promise<{
  sealed: true; generation: number; changed: boolean; payloadSha256: string;
}> {
  const key = keyBytes(paths.keyFile);
  const allowInitialize = process.env.R20_LEDGER_ALLOW_INITIALIZE === 'true';
  const ledgerExists = fs.existsSync(paths.ledgerFile);
  const highExists = fs.existsSync(paths.highWaterFile);

  if (ledgerExists !== highExists) {
    throw new R20LedgerError(ledgerExists ? 'R20_HIGH_WATER_MISSING' : 'R20_LEDGER_MISSING');
  }

  let existing: R20LedgerEnvelope | null = null;
  let high: R20HighWater | null = null;
  if (ledgerExists && highExists) {
    const verified = verifyR20DeletionLedger(paths);
    existing = verified.envelope;
    high = verified.highWater;
  } else if (!allowInitialize) {
    throw new R20LedgerError('R20_HIGH_WATER_MISSING');
  }

  const payload = await currentPayload();
  const payloadHash = sha256(stableJson(payload));
  if (existing) {
    assertPayloadNonRegression(existing.payload, payload);
    if (existing.payload_sha256 === payloadHash) {
      return { sealed: true, generation: existing.generation, changed: false, payloadSha256: payloadHash };
    }
  }

  const generation = (high?.generation ?? 0) + 1;
  const unsigned: LedgerUnsigned = {
    protocol: LEDGER_PROTOCOL, generation, captured_at: new Date().toISOString(), payload_sha256: payloadHash, payload,
  };
  const envelope: R20LedgerEnvelope = { ...unsigned, hmac_sha256: hmac(key, unsigned) };
  const ledgerBytes = Buffer.from(`${stableJson(envelope)}
`, 'utf8');
  atomicWrite(paths.ledgerFile, ledgerBytes);
  const highUnsigned: HighWaterUnsigned = {
    protocol: HIGH_WATER_PROTOCOL, generation, ledger_sha256: sha256(ledgerBytes), updated_at: new Date().toISOString(),
  };
  atomicWrite(paths.highWaterFile, `${stableJson({ ...highUnsigned, hmac_sha256: hmac(key, highUnsigned) })}
`);
  return { sealed: true, generation, changed: true, payloadSha256: payloadHash };
}

async function ensureRow(
  tx: TransactionClient, insertSql: string, insertParams: unknown[], selectSql: string, selectParams: unknown[], expected: Record<string, unknown>,
): Promise<void> {
  await tx.query(insertSql, insertParams as any[]);
  const found = await tx.query<Record<string, unknown>>(selectSql, selectParams as any[]);
  if (found.rows.length !== 1 || stableJson(found.rows[0]) !== stableJson(expected)) throw new R20LedgerError('R20_LEDGER_IMPORT_CONFLICT');
}

export async function importR20DeletionLedger(paths: R20LedgerPaths = r20LedgerPathsFromEnv()): Promise<{
  generation: number; manifests: number; scopes: number; tombstones: number;
}> {
  const { envelope } = verifyR20DeletionLedger(paths);
  await transaction(async (tx) => {
    for (const r of envelope.payload.manifests) {
      await ensureRow(tx,
        `INSERT INTO deletion_manifests (id, reason_class, incident_ref, authorized_by, executed_at, created_at, note)
         VALUES ($1::uuid,$2,$3,$4,$5::timestamptz,$6::timestamptz,$7) ON CONFLICT (id) DO NOTHING`,
        [r.id,r.reason_class,r.incident_ref,r.authorized_by,r.executed_at,r.created_at,r.note],
        `SELECT id::text, reason_class, incident_ref, authorized_by,
                CASE WHEN executed_at IS NULL THEN NULL ELSE to_char(executed_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') END AS executed_at,
                to_char(created_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS created_at, note
           FROM deletion_manifests WHERE id=$1::uuid`, [r.id], r as unknown as Record<string,unknown>);
    }
    for (const r of envelope.payload.scopes) {
      await ensureRow(tx,
        `INSERT INTO deletion_manifest_scopes (id, manifest_id, table_name, session_id, member_id, window_start, window_end)
         VALUES ($1::uuid,$2::uuid,$3,$4,$5,$6::timestamptz,$7::timestamptz) ON CONFLICT (id) DO NOTHING`,
        [r.id,r.manifest_id,r.table_name,r.session_id,r.member_id,r.window_start,r.window_end],
        `SELECT id::text, manifest_id::text, table_name, session_id, member_id,
                CASE WHEN window_start IS NULL THEN NULL ELSE to_char(window_start AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') END AS window_start,
                CASE WHEN window_end IS NULL THEN NULL ELSE to_char(window_end AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') END AS window_end
           FROM deletion_manifest_scopes WHERE id=$1::uuid`, [r.id], r as unknown as Record<string,unknown>);
    }
    for (const r of envelope.payload.tombstones) {
      await tx.query(
        `INSERT INTO provenance_tombstones (id, manifest_id, object_kind, object_id, tombstoned_at)
         VALUES ($1::uuid,$2::uuid,$3,$4,$5::timestamptz)
         ON CONFLICT (object_kind, object_id) DO NOTHING`,
        [r.id,r.manifest_id,r.object_kind,r.object_id,r.tombstoned_at],
      );
      const found = await tx.query<any>(
        `SELECT id::text, manifest_id::text, object_kind, object_id,
                to_char(tombstoned_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS tombstoned_at
           FROM provenance_tombstones WHERE object_kind=$1 AND object_id=$2`, [r.object_kind,r.object_id],
      );
      if (found.rows.length !== 1 || stableJson(found.rows[0]) !== stableJson(r)) throw new R20LedgerError('R20_LEDGER_IMPORT_CONFLICT');
    }
  });
  return {
    generation: envelope.generation, manifests: envelope.payload.manifests.length,
    scopes: envelope.payload.scopes.length, tombstones: envelope.payload.tombstones.length,
  };
}
