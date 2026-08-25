/**
 * Universal Session Capture — domain contract + store (USC-01 / USC-02)
 *
 * One capture object. Many capture surfaces. One Session Room memory.
 *
 *   WATCH ─┐
 *   IPHONE ┤
 *   WEB    ┼──→ CAPTURE DOMAIN ──→ SESSION TIMELINE ──→ MAIA
 *   SIRI   ┤
 *   LISTEN ┘
 *
 * Provenance layers — L3 may never masquerade as L1:
 *   L0 EVENT              capturedAt / offset / source / modality
 *   L1 RAW HUMAN CAPTURE  content / transcript      (immutable, encrypted)
 *   L2 ORGANIZED          kind / tags / lenses      (member-assigned only)
 *   L3 INTERPRETATION     MAIA synthesis — not represented here at all
 *
 * Consent: a capture is not a keep. Nothing here reaches MAIA's prompt context
 * until the member promotes it into `member_memory_atoms`.
 *
 * Identity/consent reuse: session binding and ownership run through the
 * existing Session Room architecture (lib/scribe/scribeAuth.ts).
 */

import { randomUUID } from 'crypto';
import { query, queryOne } from '@/lib/db/postgres';
import { encryptForDB, decryptFromDB, type PHIEncryptionMeta } from '@/lib/security/phiEncryption';

// ─── Domain contract ─────────────────────────────────────────────────────────

export const CAPTURE_SOURCES = ['web', 'iphone', 'ipad', 'watch', 'siri', 'unknown'] as const;
export type CaptureSource = (typeof CAPTURE_SOURCES)[number];

export const CAPTURE_MODALITIES = ['marker', 'text', 'voice', 'photo', 'task'] as const;
export type CaptureModality = (typeof CAPTURE_MODALITIES)[number];

export const CAPTURE_KINDS = [
  'insight', 'emotion', 'body', 'pattern', 'question', 'follow_up',
] as const;
export type CaptureKind = (typeof CAPTURE_KINDS)[number];

export const ELEMENTAL_LENSES = ['fire', 'water', 'earth', 'air', 'aether'] as const;
export type ElementalLens = (typeof ELEMENTAL_LENSES)[number];

export type CaptureVisibility = 'private' | 'shareable';

/** What a surface sends. `clientCaptureId` is stamped on the device at capture time. */
export interface CaptureInput {
  /** Device-generated id. Makes offline replay idempotent. Required. */
  clientCaptureId: string;
  source: CaptureSource;
  modality: CaptureModality;
  /** L1 raw content. Optional for a bare marker. */
  content?: string;
  transcript?: string;
  mediaPath?: string;
  /** Device capture time (ms epoch). Server clamps to now if absent/implausible. */
  capturedAtMs?: number;
  /** Member-assigned only. The system never infers these. */
  kind?: CaptureKind;
  tags?: string[];
  elementalLenses?: ElementalLens[];
  visibility?: CaptureVisibility;
  /**
   * Explicit session binding. Omit to let the server resolve the member's
   * active consented session (the normal path for watch/Siri).
   */
  sessionId?: string | null;
}

/** What the data layer returns. Never carries `_enc` columns. */
export interface Capture {
  id: string;
  memberId: string;
  sessionId: string | null;
  capturedAt: string;
  sessionOffsetMs: number | null;
  source: CaptureSource;
  modality: CaptureModality;
  capturedBy: 'member';
  content: string | null;
  transcript: string | null;
  mediaPath: string | null;
  kind: CaptureKind | null;
  tags: string[];
  elementalLenses: ElementalLens[];
  visibility: CaptureVisibility;
  promotedAtomId: string | null;
  promotedAt: string | null;
  clientCaptureId: string;
}

export interface IngestResult {
  capture: Capture;
  /** False when an existing row was returned for a replayed clientCaptureId. */
  created: boolean;
  /** Whether the capture bound to a live session or fell to the personal inbox. */
  binding: 'session' | 'inbox';
}

/** Sessions eligible to receive captures: active AND consented. */
export interface ActiveSessionTarget {
  sessionId: string;
  container: 'solo' | 'witness' | 'practitioner';
  title: string | null;
  startedAt: string;
  memoryPolicy: 'sealed' | 'learning';
}

const TABLE = 'session_captures';
const MAX_SESSION_MS = 12 * 60 * 60 * 1000; // mirrors capture-mode clamp

// ─── Encryption helpers (AAD-bound; ciphertext never leaves this module) ─────

function encField(
  plaintext: string | undefined | null,
  column: string,
  rowId: string,
  ownerId: string
): { ciphertext: string | null; meta: PHIEncryptionMeta | null } {
  if (plaintext === undefined || plaintext === null || plaintext === '') {
    return { ciphertext: null, meta: null };
  }
  const { ciphertext, meta } = encryptForDB(plaintext, {
    table: TABLE, column, rowId, ownerId,
  });
  return { ciphertext, meta };
}

function decField(
  ciphertext: string | null,
  meta: PHIEncryptionMeta | null,
  column: string,
  rowId: string,
  ownerId: string
): string | null {
  if (!ciphertext || !meta) return null;
  try {
    return decryptFromDB(ciphertext, meta, { table: TABLE, column, rowId, ownerId });
  } catch (error) {
    // Never log ciphertext or plaintext — ids and state flags only.
    console.error(`[capture] decrypt failed column=${column} capture=${rowId}`);
    return null;
  }
}

function rowToCapture(row: any): Capture {
  return {
    id: row.id,
    memberId: row.member_id,
    sessionId: row.session_id,
    capturedAt: row.captured_at instanceof Date ? row.captured_at.toISOString() : row.captured_at,
    sessionOffsetMs: row.session_offset_ms,
    source: row.source,
    modality: row.modality,
    capturedBy: 'member',
    content: decField(row.content_enc, row.content_enc_meta, 'content', row.id, row.member_id),
    transcript: decField(row.transcript_enc, row.transcript_enc_meta, 'transcript', row.id, row.member_id),
    mediaPath: row.media_path,
    kind: row.capture_kind,
    tags: row.tags ?? [],
    elementalLenses: row.elemental_lenses ?? [],
    visibility: row.visibility,
    promotedAtomId: row.promoted_atom_id,
    promotedAt: row.promoted_at instanceof Date ? row.promoted_at.toISOString() : row.promoted_at,
    clientCaptureId: row.client_capture_id,
  };
}

// ─── Session binding ─────────────────────────────────────────────────────────

/**
 * The session a capture would bind to right now.
 *
 * Only an ACTIVE and CONSENT-CONFIRMED session is eligible. This is the same
 * gate `POST /api/scribe/mark` enforces, resolved server-side so a wrist tap
 * does not need to know a session id.
 *
 * Returns null when nothing is eligible — callers must fall back to the
 * personal inbox and MUST NOT create a session.
 */
export async function resolveActiveSessionTarget(
  memberId: string
): Promise<ActiveSessionTarget | null> {
  const row = await queryOne(
    `SELECT id, container, title, started_at, memory_policy
       FROM scribe_sessions
      WHERE member_id = $1
        AND is_active = TRUE
        AND consent_status = 'confirmed'
      ORDER BY started_at DESC
      LIMIT 1`,
    [memberId]
  );
  if (!row) return null;
  return {
    sessionId: row.id,
    container: row.container,
    title: row.title,
    startedAt: row.started_at instanceof Date ? row.started_at.toISOString() : row.started_at,
    memoryPolicy: row.memory_policy,
  };
}

/** Verify an explicitly supplied session is owned, active and consented. */
async function verifyExplicitSession(
  sessionId: string,
  memberId: string
): Promise<ActiveSessionTarget | null> {
  const row = await queryOne(
    `SELECT id, container, title, started_at, memory_policy
       FROM scribe_sessions
      WHERE id = $1
        AND member_id = $2
        AND is_active = TRUE
        AND consent_status = 'confirmed'
      LIMIT 1`,
    [sessionId, memberId]
  );
  if (!row) return null;
  return {
    sessionId: row.id,
    container: row.container,
    title: row.title,
    startedAt: row.started_at instanceof Date ? row.started_at.toISOString() : row.started_at,
    memoryPolicy: row.memory_policy,
  };
}

// ─── Ingestion ───────────────────────────────────────────────────────────────

/**
 * Ingest one capture from any surface.
 *
 * Idempotent on (memberId, clientCaptureId): a queued capture replayed after
 * reconnect returns the original row with `created: false` rather than
 * duplicating the moment.
 *
 * Binding is resolved server-side and never manufactures a session.
 */
export async function ingestCapture(
  memberId: string,
  input: CaptureInput
): Promise<IngestResult> {
  const clientCaptureId = input.clientCaptureId?.trim();
  if (!clientCaptureId) {
    throw new Error('clientCaptureId is required for idempotent ingestion');
  }

  // Replay check first — cheapest path, and the one a flaky watch link hits most.
  const existing = await queryOne(
    `SELECT * FROM ${TABLE} WHERE member_id = $1 AND client_capture_id = $2`,
    [memberId, clientCaptureId]
  );
  if (existing) {
    return {
      capture: rowToCapture(existing),
      created: false,
      binding: existing.session_id ? 'session' : 'inbox',
    };
  }

  // Resolve binding: explicit id if given and still eligible, else active session,
  // else the personal inbox. Never create a session here.
  let target: ActiveSessionTarget | null = null;
  if (input.sessionId) {
    target = await verifyExplicitSession(input.sessionId, memberId);
  } else if (input.sessionId !== null) {
    target = await resolveActiveSessionTarget(memberId);
  }

  // Capture time: trust the device only within a sane window.
  const nowMs = Date.now();
  const capturedAtMs =
    input.capturedAtMs && Math.abs(nowMs - input.capturedAtMs) < MAX_SESSION_MS
      ? input.capturedAtMs
      : nowMs;
  const capturedAt = new Date(capturedAtMs);

  let sessionOffsetMs: number | null = null;
  if (target) {
    const startMs = new Date(target.startedAt).getTime();
    sessionOffsetMs = Math.max(0, Math.min(capturedAtMs - startMs, MAX_SESSION_MS));
  }

  // Encrypt before insert: AAD binds ciphertext to (table, column, rowId, ownerId),
  // so the row id must exist first.
  const id = randomUUID();
  const content = encField(input.content, 'content', id, memberId);
  const transcript = encField(input.transcript, 'transcript', id, memberId);

  const inserted = await queryOne(
    `INSERT INTO ${TABLE} (
       id, member_id, session_id, captured_at, session_offset_ms,
       source, modality, content_enc, content_enc_meta,
       transcript_enc, transcript_enc_meta, media_path,
       capture_kind, tags, elemental_lenses, visibility, client_capture_id
     ) VALUES (
       $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
     )
     ON CONFLICT (member_id, client_capture_id) DO NOTHING
     RETURNING *`,
    [
      id,
      memberId,
      target?.sessionId ?? null,
      capturedAt,
      sessionOffsetMs,
      input.source,
      input.modality,
      content.ciphertext,
      content.meta ? JSON.stringify(content.meta) : null,
      transcript.ciphertext,
      transcript.meta ? JSON.stringify(transcript.meta) : null,
      input.mediaPath ?? null,
      input.kind ?? null,
      input.tags ?? [],
      input.elementalLenses ?? [],
      input.visibility ?? 'private',
      clientCaptureId,
    ]
  );

  // Lost a concurrent race on the same clientCaptureId (two devices replaying at
  // once). The winner's row is the capture.
  if (!inserted) {
    const winner = await queryOne(
      `SELECT * FROM ${TABLE} WHERE member_id = $1 AND client_capture_id = $2`,
      [memberId, clientCaptureId]
    );
    if (!winner) throw new Error('capture ingestion failed');
    return {
      capture: rowToCapture(winner),
      created: false,
      binding: winner.session_id ? 'session' : 'inbox',
    };
  }

  console.log(
    `[capture] ingested id=${inserted.id} source=${input.source} ` +
    `modality=${input.modality} binding=${target ? 'session' : 'inbox'}`
  );

  return {
    capture: rowToCapture(inserted),
    created: true,
    binding: target ? 'session' : 'inbox',
  };
}

// ─── Reads ───────────────────────────────────────────────────────────────────

/** Captures bound to one session, oldest first (the Session Room timeline). */
export async function getSessionCaptures(
  sessionId: string,
  memberId: string
): Promise<Capture[]> {
  const result = await query(
    `SELECT * FROM ${TABLE}
      WHERE session_id = $1 AND member_id = $2
      ORDER BY captured_at ASC`,
    [sessionId, memberId]
  );
  return result.rows.map(rowToCapture);
}

/** The member's unbound personal capture inbox, newest first. */
export async function getCaptureInbox(
  memberId: string,
  opts: { limit?: number; unpromotedOnly?: boolean } = {}
): Promise<Capture[]> {
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200);
  const result = await query(
    `SELECT * FROM ${TABLE}
      WHERE member_id = $1
        AND session_id IS NULL
        ${opts.unpromotedOnly ? 'AND promoted_atom_id IS NULL' : ''}
      ORDER BY captured_at DESC
      LIMIT $2`,
    [memberId, limit]
  );
  return result.rows.map(rowToCapture);
}

export async function getCapture(
  captureId: string,
  memberId: string
): Promise<Capture | null> {
  const row = await queryOne(
    `SELECT * FROM ${TABLE} WHERE id = $1 AND member_id = $2`,
    [captureId, memberId]
  );
  return row ? rowToCapture(row) : null;
}
