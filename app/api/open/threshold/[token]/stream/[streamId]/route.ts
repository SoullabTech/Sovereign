export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Evidence stream lifecycle. PUBLIC (token-scoped).
 *
 * PUT   /api/open/threshold/[token]/stream/[streamId]   — append a raw media chunk
 * PATCH /api/open/threshold/[token]/stream/[streamId]   — { action: 'stop' | 'cancel' }
 *
 * Lifecycle: recording → stopped (evidence committed: sha256 + byte_size recorded,
 * row immutable via DB trigger) | canceled (media discarded — a participant changing
 * their mind leaves no evidence behind).
 *
 * Chunks append only while status='recording' (409 otherwise). The DB trigger makes the
 * committed ROW immutable (Grade A); the file's integrity is attested by sha256 at commit
 * (Grade B on the filesystem — tampering is detectable, not impossible).
 *
 * Raw evidence only. No transcription, no interpretation, no reads of the media.
 */

import { NextRequest, NextResponse } from 'next/server';
import { appendFile, mkdir, stat, unlink, readFile } from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';
import db from '@/lib/db/postgres';
import { verifyThresholdToken } from '@/lib/encounters/threshold';

const STORAGE_BASE = process.env.FILE_STORAGE_PATH || '/app/data/vault';

function streamFilePath(encounterId: string, streamId: string) {
  return path.join(STORAGE_BASE, 'encounters', encounterId, `${streamId}.webm`);
}

async function loadOwnedStream(token: string, streamId: string) {
  const claims = verifyThresholdToken(token);
  if (!claims) return null;
  const result = await db.query(
    `SELECT id, encounter_id, participant_id, status FROM encounter_media_streams
     WHERE id = $1 AND participant_id = $2 AND encounter_id = $3`,
    [streamId, claims.participantId, claims.encounterId]
  );
  return result.rows[0] ?? null;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ token: string; streamId: string }> }
) {
  try {
    const { token, streamId } = await params;
    const stream = await loadOwnedStream(token, streamId);
    if (!stream) return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    if (stream.status !== 'recording') {
      return NextResponse.json(
        { error: `Stream is ${stream.status} — evidence is immutable once committed` },
        { status: 409 }
      );
    }

    const chunk = Buffer.from(await request.arrayBuffer());
    if (chunk.length === 0) return NextResponse.json({ error: 'Empty chunk' }, { status: 400 });

    const filePath = streamFilePath(stream.encounter_id, stream.id);
    await mkdir(path.dirname(filePath), { recursive: true });
    await appendFile(filePath, chunk);
    const { size } = await stat(filePath);

    return NextResponse.json({ ok: true, bytes: size });
  } catch (error) {
    console.error('[Stream/open] PUT error:', error);
    return NextResponse.json({ error: 'Failed to append chunk' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ token: string; streamId: string }> }
) {
  try {
    const { token, streamId } = await params;
    const stream = await loadOwnedStream(token, streamId);
    if (!stream) return NextResponse.json({ error: 'Stream not found' }, { status: 404 });

    let body: { action?: string };
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    if (body.action !== 'stop' && body.action !== 'cancel') {
      return NextResponse.json({ error: "action must be 'stop' or 'cancel'" }, { status: 400 });
    }
    if (stream.status !== 'recording') {
      return NextResponse.json(
        { error: `Stream is ${stream.status} — evidence is immutable once committed` },
        { status: 409 }
      );
    }

    const filePath = streamFilePath(stream.encounter_id, stream.id);

    if (body.action === 'cancel') {
      // Discard media first, then mark terminal. A canceled recording leaves no evidence.
      try {
        await unlink(filePath);
      } catch {
        // No chunks ever arrived — nothing to discard.
      }
      await db.query(
        `UPDATE encounter_media_streams
         SET status = 'canceled', ended_at = NOW(), storage_ref = NULL
         WHERE id = $1`,
        [stream.id]
      );
      console.log('[Stream/open] stream canceled, media discarded', {
        streamIdPrefix: String(stream.id).slice(0, 8),
      });
      return NextResponse.json({ ok: true, status: 'canceled' });
    }

    // stop → commit evidence: hash what was actually written, then seal the row.
    let sha256: string | null = null;
    let byteSize = 0;
    try {
      const data = await readFile(filePath);
      sha256 = createHash('sha256').update(data).digest('hex');
      byteSize = data.length;
    } catch {
      // Recording stopped before any chunk arrived — commit an empty stream honestly.
    }

    await db.query(
      `UPDATE encounter_media_streams
       SET status = 'stopped', ended_at = NOW(),
           storage_ref = $2, sha256 = $3, byte_size = $4
       WHERE id = $1`,
      [stream.id, byteSize > 0 ? filePath : null, sha256, byteSize]
    );

    console.log('[Stream/open] evidence committed', {
      streamIdPrefix: String(stream.id).slice(0, 8),
      byteSize,
      sha256Prefix: sha256?.slice(0, 12) ?? null,
    });

    return NextResponse.json({ ok: true, status: 'stopped', sha256, byteSize });
  } catch (error) {
    console.error('[Stream/open] PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update stream' }, { status: 500 });
  }
}
