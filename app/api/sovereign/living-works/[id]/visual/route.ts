// Production web requires force-dynamic for runtime database access
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';

/**
 * WS-WORK-VISUAL-01 — the image a writer chose for a Work.
 *
 * GET    → { visual } | { visual: null }   metadata only; bytes are at ./bytes
 * POST   multipart { image, kind }         choose or REPLACE
 * DELETE                                   the Work stops having a visual
 *
 * ── Custody (founder ruling 2026-09-07) ───────────────────────────────────
 * Work-owned. The bytes reuse the shared vault, which is a storage fact and
 * not a custody authority — this image is private to the writer's Studio, does
 * not enter Co-Lab, and inherits none of Co-Lab's sharing semantics or release
 * gate. Ownership is re-checked against the Work before EVERY mutation, from
 * the credential, never from the payload.
 *
 * ── ⛔ Never generated, suggested, or selected ────────────────────────────
 * `kind` is the writer's own statement about what this image is to them. There
 * is no default, no inference from filename or dimensions, and no branch here
 * that could set it without them saying so — a missing or unknown kind is a
 * 400, not a guess.
 *
 * ── Replacement destroys the superseded bytes ─────────────────────────────
 * Not "eventually" and not "best effort". The old path is enqueued into
 * vault_erasure_queue INSIDE the transaction that repoints the row, so after
 * the commit the bytes are unreferenced by the Studio but still reachable for
 * destruction, and the sweep proves absence rather than attempting it. This is
 * the same mechanism WS-DELETE-01 built for manuscripts, reused rather than
 * re-invented: the one seam a transaction cannot close is closed the same way.
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { query, transaction } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { writeVaultBytes, imageExtFromMime, deleteVaultBytes } from '@/lib/storage/fileVault';
import { enqueueVaultErasure, workVisualErasureAuthority } from '@/lib/storage/erasureAuthority';
import { sweepVaultErasureQueue } from '@/lib/manuscript/source/eraseManuscript';

/** The bytes live beside the other vault namespaces, never mixed into them. */
const VAULT_NAMESPACE = 'work-visuals';

/** A cover photographed at print resolution is large; a book is not a wallpaper. */
const MAX_BYTES = 8 * 1024 * 1024;

const KINDS = ['cover', 'inspiration'] as const;
type VisualKind = (typeof KINDS)[number];
const isKind = (v: unknown): v is VisualKind =>
  typeof v === 'string' && (KINDS as readonly string[]).includes(v);

interface VisualRow {
  kind: string;
  mime_type: string;
  byte_size: string;
  original_filename: string | null;
  chosen_at: string;
  storage_path: string;
}

/** The Work, only if this member owns it. Ownership is never taken on trust. */
async function ownedWork(workId: string, memberId: string): Promise<boolean> {
  const owned = await query<{ id: string }>(
    `SELECT id FROM living_works WHERE id = $1 AND member_id = $2`,
    [workId, memberId],
  );
  return owned.rows.length > 0;
}

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await ctx.params;

    const result = await query<VisualRow>(
      `SELECT kind, mime_type, byte_size, original_filename, chosen_at, storage_path
         FROM living_work_visuals WHERE living_work_id = $1 AND member_id = $2`,
      [id, memberId],
    );
    const row = result.rows[0];
    /* No visual is a correct state and says so plainly. Nothing stands in. */
    if (!row) return NextResponse.json({ visual: null });

    return NextResponse.json({
      visual: {
        kind: row.kind,
        mimeType: row.mime_type,
        byteSize: Number(row.byte_size),
        /* Provenance, and never rendered as the Work's name. */
        originalFilename: row.original_filename,
        chosenAt: row.chosen_at,
      },
    });
  } catch (error) {
    console.error('[living-works/visual] read failed', error);
    return NextResponse.json({ error: 'Failed to read the visual' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  let written: string | null = null;
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await ctx.params;

    if (!(await ownedWork(id, memberId))) {
      /* Not found rather than forbidden: a member learns nothing about whether
         another member's Work exists. */
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return NextResponse.json({ error: 'Expected an image upload' }, { status: 400 });
    }

    const kind = form.get('kind');
    if (!isKind(kind)) {
      /* ⛔ No default. A cover and an inspiration image are different claims
         about the same file, and only the writer can make either. */
      return NextResponse.json(
        { error: 'Choose whether this is a cover or an inspiration image.' },
        { status: 400 },
      );
    }

    const file = form.get('image');
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: 'No image was received.' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: 'That image is larger than 8 MB. Try a smaller file.' },
        { status: 413 },
      );
    }
    const ext = imageExtFromMime(file.type);
    if (!ext) {
      return NextResponse.json(
        { error: 'Images only — PNG, JPEG, GIF or WebP.' },
        { status: 415 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    /* Written BEFORE the transaction so a failed write never commits a row
       naming bytes that are not there. The reverse — bytes with no row — is
       recoverable and is cleaned up below. */
    written = await writeVaultBytes(VAULT_NAMESPACE, randomUUID(), ext, buffer);

    const superseded = await transaction(async (tx) => {
      const previous = await tx.query<{ storage_path: string }>(
        `SELECT storage_path FROM living_work_visuals
          WHERE living_work_id = $1 AND member_id = $2 FOR UPDATE`,
        [id, memberId],
      );

      await tx.query(
        `INSERT INTO living_work_visuals
           (living_work_id, member_id, kind, storage_path, mime_type, byte_size, original_filename, chosen_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, now())
         ON CONFLICT (living_work_id) DO UPDATE
           SET kind = EXCLUDED.kind,
               storage_path = EXCLUDED.storage_path,
               mime_type = EXCLUDED.mime_type,
               byte_size = EXCLUDED.byte_size,
               original_filename = EXCLUDED.original_filename,
               chosen_at = now()`,
        [id, memberId, kind, written, file.type, buffer.length, file.name || null],
      );

      /* The superseded bytes become owed destruction in the SAME transaction
         that stops referencing them. If this commits, the obligation exists; if
         it rolls back, the old image is still the Work's and nothing was owed. */
      const old = previous.rows[0]?.storage_path;
      if (old && old !== written) {
        /* WS-DELETE-01 · S4. This is a CONTENT-WORKING route, and it keeps
           exactly the authority its own artifact needs: replacing a cover may
           erase the cover it replaced. Handed a `manuscript-sources/` path this
           same call refuses — which is the point. Content work is
           constitutionally powerless against entrusted Source. */
        await enqueueVaultErasure(tx, workVisualErasureAuthority('workVisual:replace'), [old]);
      }
      return old ?? null;
    });

    written = null; // committed; no longer this handler's to clean up
    if (superseded) await sweepVaultErasureQueue();

    return NextResponse.json({ visual: { kind, mimeType: file.type, byteSize: buffer.length } });
  } catch (error) {
    console.error('[living-works/visual] write failed', error);
    /* Bytes written for a row that never committed are nothing's image. Removed
       best-effort — and if that fails they are orphaned, not retained against a
       promise, because no member was ever told this image was kept. */
    if (written) await deleteVaultBytes(written);
    return NextResponse.json({ error: 'Could not save that image.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await ctx.params;

    const removed = await transaction(async (tx) => {
      const gone = await tx.query<{ storage_path: string }>(
        `DELETE FROM living_work_visuals
          WHERE living_work_id = $1 AND member_id = $2
        RETURNING storage_path`,
        [id, memberId],
      );
      const path = gone.rows[0]?.storage_path;
      if (path) {
        await enqueueVaultErasure(tx, workVisualErasureAuthority('workVisual:remove'), [path]);
      }
      return path ?? null;
    });

    if (!removed) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const swept = await sweepVaultErasureQueue();
    /* Reported, not hidden: the row is gone either way, and whether the bytes
       are destroyed yet is a fact the caller may know. */
    return NextResponse.json({ removed: true, bytesDestroyed: swept.remaining === 0 });
  } catch (error) {
    console.error('[living-works/visual] remove failed', error);
    return NextResponse.json({ error: 'Could not remove that image.' }, { status: 500 });
  }
}
