export const dynamic = 'force-dynamic';
export const revalidate = false;
export const runtime = 'nodejs';

/**
 * Universal Capture ingestion (USC-02)
 *
 *   POST /api/capture   — ingest one capture from any surface (idempotent)
 *   GET  /api/capture   — the member's personal capture inbox
 *
 * Identity reuses the Session Room architecture (cookie or x-session-token),
 * so phone and watch clients authenticate exactly as Session Room already does.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/scribe/scribeAuth';
import {
  ingestCapture,
  getCaptureInbox,
  CAPTURE_SOURCES,
  CAPTURE_MODALITIES,
  CAPTURE_KINDS,
  ELEMENTAL_LENSES,
  type CaptureInput,
} from '@/lib/capture/sessionCapture';

export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      clientCaptureId, source, modality, content, transcript, mediaPath,
      capturedAtMs, kind, tags, elementalLenses, visibility, sessionId,
    } = body ?? {};

    if (!clientCaptureId || typeof clientCaptureId !== 'string') {
      return NextResponse.json(
        {
          error: 'clientCaptureId is required (device-generated, enables offline replay)',
          code: 'MISSING_CLIENT_CAPTURE_ID',
        },
        { status: 400 }
      );
    }
    if (!CAPTURE_SOURCES.includes(source)) {
      return NextResponse.json(
        { error: `source must be one of: ${CAPTURE_SOURCES.join(', ')}`, code: 'INVALID_SOURCE' },
        { status: 400 }
      );
    }
    if (!CAPTURE_MODALITIES.includes(modality)) {
      return NextResponse.json(
        { error: `modality must be one of: ${CAPTURE_MODALITIES.join(', ')}`, code: 'INVALID_MODALITY' },
        { status: 400 }
      );
    }
    if (kind && !CAPTURE_KINDS.includes(kind)) {
      return NextResponse.json(
        { error: `kind must be one of: ${CAPTURE_KINDS.join(', ')}`, code: 'INVALID_KIND' },
        { status: 400 }
      );
    }
    if (elementalLenses && (!Array.isArray(elementalLenses) ||
        elementalLenses.some((l: string) => !ELEMENTAL_LENSES.includes(l as any)))) {
      return NextResponse.json(
        { error: `elementalLenses must be from: ${ELEMENTAL_LENSES.join(', ')}`, code: 'INVALID_LENS' },
        { status: 400 }
      );
    }
    // A non-marker capture without material is an empty moment.
    if (modality !== 'marker' && !content && !transcript && !mediaPath) {
      return NextResponse.json(
        { error: `${modality} capture requires content, transcript, or mediaPath`, code: 'EMPTY_CAPTURE' },
        { status: 400 }
      );
    }

    const input: CaptureInput = {
      clientCaptureId,
      source,
      modality,
      content: typeof content === 'string' ? content : undefined,
      transcript: typeof transcript === 'string' ? transcript : undefined,
      mediaPath: typeof mediaPath === 'string' ? mediaPath : undefined,
      capturedAtMs: typeof capturedAtMs === 'number' ? capturedAtMs : undefined,
      kind,
      tags: Array.isArray(tags) ? tags.slice(0, 16).map(String) : undefined,
      elementalLenses,
      visibility: visibility === 'shareable' ? 'shareable' : 'private',
      sessionId: sessionId === null ? null : (sessionId || undefined),
    };

    const result = await ingestCapture(memberId, input);

    // 200 on replay, 201 on a genuinely new moment.
    return NextResponse.json(
      {
        success: true,
        capture: result.capture,
        created: result.created,
        binding: result.binding,
      },
      { status: result.created ? 201 : 200 }
    );
  } catch (error: any) {
    // No capture content in logs — ids and state flags only.
    console.error('[capture] ingest failed:', error?.message);
    return NextResponse.json(
      { error: 'Failed to ingest capture', code: 'INGEST_FAILED' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit')) || 50;
    const unpromotedOnly = searchParams.get('unpromotedOnly') === '1';

    const captures = await getCaptureInbox(memberId, { limit, unpromotedOnly });

    return NextResponse.json({ success: true, captures, count: captures.length });
  } catch (error: any) {
    console.error('[capture] inbox read failed:', error?.message);
    return NextResponse.json(
      { error: 'Failed to load capture inbox', code: 'INBOX_FAILED' },
      { status: 500 }
    );
  }
}
