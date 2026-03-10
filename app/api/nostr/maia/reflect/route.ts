export const dynamic = 'force-dynamic';

/**
 * POST /api/nostr/maia/reflect
 *
 * Publish a MAIA oracle reflection as a signed Nostr event (kind 1).
 * Events are signed by the Oracle service key with a NIP-26 delegation
 * tag linking them to the MAIA root identity.
 *
 * This is an INTERNAL endpoint — called by the oracle conversation system,
 * not directly by the client.
 *
 * Auth: X-Internal-Token header (MAIA_INTERNAL_SERVICE_TOKEN env var)
 *
 * Body:
 *   content         string   — the reflection text
 *   memberPubkeyHex string?  — if set, a 'p' tag is added (member reference)
 *   replyToEventId  string?  — if set, a 'e' tag is added (thread reply)
 *
 * Returns:
 *   { eventId, pubkey, rootPubkey, delegated, publishedAt }
 *
 * If Phase 4 is not yet configured (no service key or delegation cert),
 * returns 503 with a clear message — callers should handle gracefully.
 */

import { NextRequest, NextResponse } from 'next/server';
import { signAsMaia, checkPhase4Readiness } from '@/lib/nostr/maiaIdentity';
import { publishEventFromServer } from '@/lib/nostr/serverClient';

export async function POST(request: NextRequest) {
  // ─── Internal auth ────────────────────────────────────────────────────────

  const internalToken = process.env.MAIA_INTERNAL_SERVICE_TOKEN;
  const authHeader = request.headers.get('x-internal-token');

  if (!internalToken) {
    // Phase 4 not yet fully configured — fail gracefully
    return NextResponse.json(
      { error: 'MAIA Nostr identity not configured', code: 'PHASE4_NOT_CONFIGURED' },
      { status: 503 }
    );
  }

  if (authHeader !== internalToken) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // ─── Body ────────────────────────────────────────────────────────────────

  let body: {
    content?: string;
    memberPubkeyHex?: string;
    replyToEventId?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { content, memberPubkeyHex, replyToEventId } = body;

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 });
  }

  if (content.length > 4096) {
    return NextResponse.json({ error: 'content too long (max 4096 chars)' }, { status: 400 });
  }

  if (memberPubkeyHex && !/^[0-9a-f]{64}$/.test(memberPubkeyHex)) {
    return NextResponse.json({ error: 'Invalid memberPubkeyHex' }, { status: 400 });
  }

  if (replyToEventId && !/^[0-9a-f]{64}$/.test(replyToEventId)) {
    return NextResponse.json({ error: 'Invalid replyToEventId' }, { status: 400 });
  }

  // ─── Readiness check ──────────────────────────────────────────────────────

  const readiness = await checkPhase4Readiness('oracle');
  if (!readiness.ready) {
    console.warn('[MAIA Reflect] Phase 4 oracle not ready', readiness);
    return NextResponse.json(
      {
        error: 'Oracle service not ready',
        code: 'ORACLE_NOT_READY',
        details: readiness,
      },
      { status: 503 }
    );
  }

  // ─── Build + sign event ───────────────────────────────────────────────────

  const now = Math.floor(Date.now() / 1000);
  const tags: string[][] = [];

  // Tag the member if provided (NIP-01: p tag)
  if (memberPubkeyHex) {
    tags.push(['p', memberPubkeyHex]);
  }

  // Thread reply if provided (NIP-10: e tag)
  if (replyToEventId) {
    tags.push(['e', replyToEventId, '', 'reply']);
  }

  // Mark as MAIA-generated content
  tags.push(['client', 'maia-sovereign']);

  const result = await signAsMaia('oracle', {
    kind: 1,
    created_at: now,
    content: content.trim(),
    tags,
  });

  if (!result) {
    console.error('[MAIA Reflect] signAsMaia returned null for oracle role');
    return NextResponse.json(
      { error: 'Failed to sign oracle reflection', code: 'SIGN_FAILED' },
      { status: 500 }
    );
  }

  // ─── Publish ──────────────────────────────────────────────────────────────

  try {
    await publishEventFromServer(result.event);
  } catch (err) {
    console.error('[MAIA Reflect] Failed to publish to relay', err);
    return NextResponse.json(
      { error: 'Failed to publish to relay', code: 'PUBLISH_FAILED' },
      { status: 503 }
    );
  }

  return NextResponse.json({
    eventId:     result.event.id,
    pubkey:      result.event.pubkey,
    rootPubkey:  result.rootPubkey,
    delegated:   result.delegated,
    publishedAt: now,
  });
}
