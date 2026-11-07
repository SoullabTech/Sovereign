/**
 * Duplicate-import awareness — "you already brought this in".
 *
 * Importing the same file twice used to create a second manuscript AND a second Work (the founder ended with five identical
 * Works). This module decides, without storing anything new and without any migration, whether the member ALREADY HOLDS an
 * import of the same file.
 *
 * LAW
 *   - A match is only ever against what the member CURRENTLY HOLDS: the lookup joins `member_manuscripts`, so a manuscript the
 *     member deleted (arrival rows cascade with it) never matches, and re-importing after a deletion is always allowed.
 *   - A match is a QUESTION, never a decision. The caller answers "already_imported" and the member chooses Open or
 *     "Import again anyway". Nothing is merged, replaced, deleted or silently skipped.
 *   - Matching uses hashes ALREADY STORED on `manuscript_source_arrivals` (`artifact_hash` = sha256 of the exact original bytes,
 *     `source_text_hash` = sha256 of the exact extracted text). No content is read, compared in memory or logged, so the lookup
 *     is O(member's arrivals) on an existing (member_id, created_at) index and carries no writing out of the database.
 *   - Lookups FAIL OPEN: if the check itself fails the import proceeds as it always did. A broken duplicate check must never
 *     stop a member bringing in their writing.
 */

import { createHash } from 'node:crypto';
import { query, type TransactionClient } from '@/lib/db/postgres';

export type HeldImport = {
  manuscriptId: string;
  workId: string | null;
  title: string | null;
  /** sha256 of the original bytes, or null for a pasted arrival. */
  artifactHash: string | null;
  sourceTextHash: string;
  createdAt: string;
};

export type DuplicateDecision =
  | { outcome: 'proceed' }
  | {
      outcome: 'already_imported';
      existing: HeldImport;
      /** 'bytes' = byte-identical file; 'text' = a different file whose extracted text is identical. */
      matchedOn: 'bytes' | 'text';
    };

/**
 * PURE. `held` are the member's currently held imports that share a hash with the arriving file (or any held imports: the
 * function re-checks the hashes itself, so it never trusts the query's filter). `importAgain` is the member's explicit act and
 * always wins.
 */
export function decideDuplicateImport(input: {
  held: readonly HeldImport[];
  bytesHash: string;
  textHash: string;
  importAgain: boolean;
}): DuplicateDecision {
  if (input.importAgain) return { outcome: 'proceed' };
  // Newest first, byte identity before text identity: bytes are the stronger statement.
  const ordered = [...input.held].sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
  const byBytes = ordered.find((h) => h.artifactHash !== null && h.artifactHash === input.bytesHash);
  if (byBytes) return { outcome: 'already_imported', existing: byBytes, matchedOn: 'bytes' };
  const byText = ordered.find((h) => h.sourceTextHash === input.textHash);
  if (byText) return { outcome: 'already_imported', existing: byText, matchedOn: 'text' };
  return { outcome: 'proceed' };
}

/** Currently held, member-bound, hash-matched imports. Never reads source_text. */
export async function findHeldImports(memberId: string, bytesHash: string, textHash: string): Promise<HeldImport[]> {
  const result = await query<{
    manuscript_id: string;
    title: string | null;
    artifact_hash: string | null;
    source_text_hash: string;
    created_at: string;
    work_id: string | null;
  }>(
    `SELECT a.manuscript_id, m.title, a.artifact_hash, a.source_text_hash, a.created_at,
            (SELECT e.living_work_id FROM living_work_expressions e
               JOIN living_works w ON w.id = e.living_work_id AND w.member_id = $1
              WHERE e.expression_type = 'manuscript' AND e.expression_id = m.id
              ORDER BY e.declared_at ASC LIMIT 1) AS work_id
       FROM manuscript_source_arrivals a
       JOIN member_manuscripts m ON m.id = a.manuscript_id AND m.member_id = $1
      WHERE a.member_id = $1
        AND a.manuscript_id IS NOT NULL
        AND (a.artifact_hash = $2 OR a.source_text_hash = $3)
      ORDER BY a.created_at DESC
      LIMIT 10`,
    [memberId, bytesHash, textHash],
  );
  return result.rows.map((r) => ({
    manuscriptId: r.manuscript_id,
    workId: r.work_id,
    title: r.title,
    artifactHash: r.artifact_hash,
    sourceTextHash: r.source_text_hash,
    createdAt: new Date(r.created_at).toISOString(),
  }));
}

/** Fail-open wrapper. Returns the decision; a failed lookup is `proceed` and logs only an error NAME. */
export async function checkDuplicateImport(input: {
  memberId: string;
  bytesHash: string;
  textHash: string;
  importAgain: boolean;
}): Promise<DuplicateDecision> {
  if (input.importAgain) return { outcome: 'proceed' };
  try {
    const held = await findHeldImports(input.memberId, input.bytesHash, input.textHash);
    return decideDuplicateImport({ held, bytesHash: input.bytesHash, textHash: input.textHash, importAgain: false });
  } catch (err) {
    console.warn('[press/manuscripts/ingest] duplicate check unavailable; proceeding', {
      errorName: err instanceof Error ? err.name : 'unknown',
    });
    return { outcome: 'proceed' };
  }
}

/* ───────────────────────── double-submit (same save, twice, moments apart) ───────────────────────── */

/** A second identical save inside this window is the same act repeated (a double click, a retried request), not a new import. */
export const DOUBLE_SUBMIT_WINDOW_SECONDS = 15;

/** Exact-content digest of the confirmed sections. Order, headings and bodies all count; nothing is normalized. */
export function sectionsDigest(sections: ReadonlyArray<{ heading: string | null; body: string }>): string {
  const h = createHash('sha256');
  for (const s of sections) {
    const heading = Buffer.from(s.heading ?? '', 'utf-8');
    const body = Buffer.from(s.body, 'utf-8');
    // Length-prefixed so ("ab","c") and ("a","bc") cannot collide.
    h.update(`${s.heading === null ? 'n' : 'h'}:${heading.length}:${body.length}:`);
    h.update(heading);
    h.update(body);
  }
  return h.digest('hex');
}

export type RecentImport = { manuscriptId: string; workId: string | null; sourceCustody: 'source_custodied' | 'legacy_interpreted_import' };

/**
 * Inside the save transaction, after taking the member's import advisory lock: is there a manuscript this member created within
 * the last few seconds with the same title, the same confirmed sections and the same Work declaration? If so the save is a repeat
 * of the one that just landed, and it is answered with that manuscript instead of a second one.
 *
 * Bounded: at most a handful of rows created in the window are examined, and only the member's own.
 */
export async function findRecentIdenticalImport(
  client: TransactionClient,
  input: { memberId: string; title: string; digest: string; wantsWork: boolean },
): Promise<RecentImport | null> {
  const recent = await client.query<{ id: string; work_id: string | null; claimed: boolean }>(
    `SELECT m.id,
            (SELECT e.living_work_id FROM living_work_expressions e
              WHERE e.expression_type = 'manuscript' AND e.expression_id = m.id
              ORDER BY e.declared_at ASC LIMIT 1) AS work_id,
            EXISTS (SELECT 1 FROM manuscript_source_arrivals a WHERE a.manuscript_id = m.id) AS claimed
       FROM member_manuscripts m
      WHERE m.member_id = $1 AND m.title = $2
        AND m.created_at > now() - make_interval(secs => $3)
      ORDER BY m.created_at DESC
      LIMIT 5`,
    [input.memberId, input.title, DOUBLE_SUBMIT_WINDOW_SECONDS],
  );
  for (const row of recent.rows) {
    if ((row.work_id !== null) !== input.wantsWork) continue;
    const sections = await client.query<{ heading: string | null; body: string }>(
      'SELECT heading, body FROM manuscript_sections WHERE manuscript_id = $1 ORDER BY position ASC',
      [row.id],
    );
    if (sectionsDigest(sections.rows) === input.digest) {
      return {
        manuscriptId: row.id,
        workId: row.work_id,
        sourceCustody: row.claimed ? 'source_custodied' : 'legacy_interpreted_import',
      };
    }
  }
  return null;
}
