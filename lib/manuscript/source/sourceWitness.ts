/**
 * PT-3 — the Source witness.
 *
 * Founder ruling 2026-09-08. PT-3 does not protect a row; it protects the thing
 * the writer entrusted. So this does not `SELECT *` and compare columns:
 *
 *   "A row comparison is not custody. The actual entrusted thing must remain
 *    recoverable and identical."
 *
 * The witness binds nine things per arrival, and the last three are the ones a
 * row diff cannot see:
 *
 *   IDENTITY      id · member · manuscript · kind · created_at
 *   ARTIFACT      ref · hash · size · original filename · mime type
 *   EXTRACTION    source_text · source_text_hash
 *   PROVENANCE    extraction_method · extractor_version
 *   LIVENESS      the bytes are READ BACK from the vault and RE-HASHED, and the
 *                 stored text is re-hashed against its own recorded hash
 *   REACHABILITY  no vault_erasure_queue row names this artifact
 *
 * LIVENESS is what stops "the row didn't change" from passing for custody:
 * destroy or overwrite the bytes and every column still matches. WS-01 already
 * ratified the principle at arrival — *a hash without recoverable bytes must
 * never be accepted as Source custody* — and PT-3 carries it forward through
 * every subsequent act.
 *
 * REACHABILITY makes SCHEDULED destruction a violation now rather than later: an
 * act that enqueues a Source path has broken custody even though the bytes are
 * still on disk when the assertion runs.
 *
 * ── The vacuity guard (P10) ───────────────────────────────────────────────
 *
 * A manuscript with no arrival has no protectable Source — every pre-WS-01
 * import is in that state, and `source_custody` labels it `legacy_interpreted_
 * import` precisely because it cannot be retrospectively certified. Such a
 * manuscript yields `applicable: false`, which the falsifier must count as SKIP.
 * Under the ratified FR-14 coverage law a SKIP never discharges an obligation,
 * so custody can never be reported green by having nothing to protect.
 */
import { createHash } from 'crypto';
import { query } from '@/lib/db/postgres';
import { readVaultBytes } from '@/lib/storage/fileVault';

export interface ArrivalWitness {
  id: string;
  memberId: string;
  manuscriptId: string | null;
  sourceKind: string;
  createdAt: string;
  artifactRef: string | null;
  artifactHash: string | null;
  artifactSize: string | null;
  originalFilename: string | null;
  mimeType: string | null;
  sourceText: string;
  sourceTextHash: string;
  extractionMethod: string;
  extractorVersion: string;
  /** Liveness: what the vault actually holds right now. */
  bytesPresent: boolean;
  bytesHash: string | null;
  bytesMatchRecordedHash: boolean;
  textMatchesRecordedHash: boolean;
  /** Reachability: destruction already owed on this artifact. */
  erasureQueued: boolean;
}

export interface SourceWitness {
  manuscriptId: string;
  /** False when there is no arrival to protect — SKIP, never PASS. */
  applicable: boolean;
  custodyLabel: string | null;
  arrivals: ArrivalWitness[];
  /** Stable digest of everything above. Equality of digests is the invariant. */
  digest: string;
}

const sha256 = (v: string | Buffer) => createHash('sha256').update(v).digest('hex');

export async function witnessSource(
  manuscriptId: string,
  memberId: string,
): Promise<SourceWitness> {
  const custody = await query<{ source_custody: string }>(
    `SELECT source_custody FROM member_manuscripts WHERE id = $1 AND member_id = $2`,
    [manuscriptId, memberId],
  );

  const rows = await query<any>(
    `SELECT a.id, a.member_id, a.manuscript_id, a.source_kind, a.created_at,
            a.artifact_ref, a.artifact_hash, a.artifact_size, a.original_filename,
            a.mime_type, a.source_text, a.source_text_hash,
            a.extraction_method, a.extractor_version,
            EXISTS (
              SELECT 1 FROM vault_erasure_queue q WHERE q.artifact_ref = a.artifact_ref
            ) AS erasure_queued
       FROM manuscript_source_arrivals a
      WHERE a.manuscript_id = $1 AND a.member_id = $2
      ORDER BY a.id`,
    [manuscriptId, memberId],
  );

  const arrivals: ArrivalWitness[] = [];
  for (const r of rows.rows) {
    let bytesPresent = false;
    let bytesHash: string | null = null;
    if (r.artifact_ref) {
      try {
        const bytes = await readVaultBytes(r.artifact_ref);
        bytesPresent = true;
        bytesHash = sha256(bytes);
      } catch {
        /* Absent, unreadable, or refused by the traversal guard. All three mean
           the same thing for custody: the entrusted artifact is not recoverable. */
      }
    }
    arrivals.push({
      id: r.id,
      memberId: r.member_id,
      manuscriptId: r.manuscript_id,
      sourceKind: r.source_kind,
      createdAt: new Date(r.created_at).toISOString(),
      artifactRef: r.artifact_ref,
      artifactHash: r.artifact_hash,
      artifactSize: r.artifact_size === null ? null : String(r.artifact_size),
      originalFilename: r.original_filename,
      mimeType: r.mime_type,
      sourceText: r.source_text,
      sourceTextHash: r.source_text_hash,
      extractionMethod: r.extraction_method,
      extractorVersion: r.extractor_version,
      bytesPresent,
      bytesHash,
      bytesMatchRecordedHash: r.artifact_ref === null ? true : bytesHash === r.artifact_hash,
      textMatchesRecordedHash: sha256(r.source_text) === r.source_text_hash,
      erasureQueued: Boolean(r.erasure_queued),
    });
  }

  return {
    manuscriptId,
    applicable: arrivals.length > 0,
    custodyLabel: custody.rows[0]?.source_custody ?? null,
    arrivals,
    digest: sha256(JSON.stringify(arrivals)),
  };
}

/** True only when the witness is LIVE: every entrusted artifact still recoverable and intact. */
export function witnessIsLive(w: SourceWitness): boolean {
  return (
    w.applicable
    && w.arrivals.every(
      (a) =>
        a.textMatchesRecordedHash
        && a.bytesMatchRecordedHash
        && (a.artifactRef === null || a.bytesPresent)
        && !a.erasureQueued,
    )
  );
}
