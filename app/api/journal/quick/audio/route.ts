// Production requires force-dynamic for per-user database access
export const dynamic = 'force-dynamic';
/**
 * Voice Journal Audio Upload API
 * POST /api/journal/quick/audio
 *
 * Handles audio file uploads for voice journal entries.
 * Stores files locally in storage/audio/journals/{userId}/
 * Updates the quick_journal_entries row with audio metadata.
 */

import { NextRequest, NextResponse } from 'next/server';

export const revalidate = false;
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getEntitlements } from '@/lib/entitlements';
import { logAudioUsageEvent } from '@/lib/usage/audioUsage';

// Skip during static export (Capacitor builds)

// Node runtime required for filesystem writes
export const runtime = 'nodejs';

function safeSegment(input: string): string {
  return input.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

export async function POST(request: NextRequest) {
  try {
    // Auth: require authenticated member
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Feature gate: audio uploads disabled by default (local-only policy)
    if (process.env.ALLOW_AUDIO_UPLOADS !== 'true') {
      logAudioUsageEvent({
        memberId,
        route: "/api/journal/quick/audio",
        kind: "upload",
        bytes: 0,
        seconds: null,
        status: "rejected",
        errorCode: "FEATURE_DISABLED",
        meta: { reason: "ALLOW_AUDIO_UPLOADS not enabled" },
      });
      return NextResponse.json(
        { success: false, error: 'Audio uploads are disabled. Audio is stored locally on-device by default.' },
        { status: 410 }
      );
    }

    // Entitlement check: cloudAudioUploads feature flag
    const entitlements = await getEntitlements(memberId);
    if (!entitlements.features.cloudAudioUploads) {
      logAudioUsageEvent({
        memberId,
        route: "/api/journal/quick/audio",
        kind: "upload",
        bytes: 0,
        seconds: null,
        status: "rejected",
        errorCode: "TIER_GATE",
        meta: { tier: entitlements.tier },
      });
      return NextResponse.json(
        { success: false, error: 'Cloud audio uploads are disabled for your tier', upgradeRequired: true },
        { status: 403 }
      );
    }

    // Guard: reject non-multipart requests with a clear 415 error
    const ct = request.headers.get('content-type') ?? '';
    if (!ct.includes('multipart/form-data')) {
      logAudioUsageEvent({
        memberId,
        route: "/api/journal/quick/audio",
        kind: "upload",
        bytes: 0,
        seconds: null,
        status: "rejected",
        errorCode: "UNSUPPORTED_MEDIA_TYPE",
        meta: { contentType: ct },
      });
      return NextResponse.json(
        { success: false, error: 'Expected multipart/form-data (FormData upload). Do not set Content-Type manually.' },
        { status: 415 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const form: any = await request.formData();

    // Use server-derived identity (never trust client-sent userId)
    const userId = memberId;
    const entryId = String(form.get('entryId') || '');
    const durationMs = Number(form.get('durationMs') || 0);
    const transcriptSource = String(form.get('transcriptSource') || 'none');
    const transcriptConfidenceVal = form.get('transcriptConfidence');
    const transcriptConfidence = transcriptConfidenceVal
      ? Number(transcriptConfidenceVal)
      : null;

    const file = form.get('audio') as File | null;

    if (!entryId || !file) {
      logAudioUsageEvent({
        memberId,
        route: "/api/journal/quick/audio",
        kind: "upload",
        bytes: 0,
        seconds: null,
        status: "rejected",
        errorCode: "NO_FILE",
        meta: { hasEntryId: !!entryId, hasFile: !!file },
      });
      return NextResponse.json(
        { success: false, error: 'Missing entryId or audio file' },
        { status: 400 }
      );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PAID FEATURE GATE + CONSENT GATE (single query)
    // circle_tier determines paid status; storage_consent holds consent flags
    // Both live in member_settings table.
    // Database tiers: 'explorer' (free), 'sustainer'/'guardian'/'elder'/'pioneer' (paid)
    // ─────────────────────────────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settingsRes: any = await query(
      `SELECT circle_tier, storage_consent
       FROM member_settings
       WHERE member_id = $1
       LIMIT 1`,
      [userId]
    );
    // Support both pg-style { rows } and raw array returns
    const settingsRow = Array.isArray(settingsRes) ? settingsRes[0] : settingsRes?.rows?.[0];
    const tier = (settingsRow?.circle_tier as string) || 'explorer';
    const isPaid = tier !== 'explorer';
    const storageConsent = (settingsRow?.storage_consent as Record<string, boolean>) || {};

    if (!isPaid) {
      console.log(`🔒 [VoiceJournal] Server audio blocked for free user: ${userId} (tier: ${tier})`);
      logAudioUsageEvent({
        memberId,
        route: "/api/journal/quick/audio",
        kind: "upload",
        bytes: file.size,
        seconds: null,
        status: "rejected",
        errorCode: "PAID_FEATURE",
        meta: { tier },
      });
      return NextResponse.json(
        {
          success: false,
          error: 'PAID_FEATURE',
          message: 'Server audio storage is a paid feature. You can save transcripts without saving raw audio.',
        },
        { status: 402 }
      );
    }

    // Default deny: block unless audioServer is explicitly true
    // Matches "audio privacy (default off)" truth claim
    if (storageConsent.audioServer !== true) {
      console.log(`🔒 [VoiceJournal] Server audio blocked by consent (audioServer=${storageConsent.audioServer}): ${userId}`);
      logAudioUsageEvent({
        memberId,
        route: "/api/journal/quick/audio",
        kind: "upload",
        bytes: file.size,
        seconds: null,
        status: "rejected",
        errorCode: "CONSENT_DISABLED",
        meta: { tier, audioServerConsent: storageConsent.audioServer },
      });
      return NextResponse.json(
        {
          success: false,
          error: 'CONSENT_DISABLED',
          message: 'Server audio storage is disabled in your privacy settings.',
        },
        { status: 403 }
      );
    }

    // Validate file size (max 50MB for voice memos)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      logAudioUsageEvent({
        memberId,
        route: "/api/journal/quick/audio",
        kind: "upload",
        bytes: file.size,
        seconds: null,
        status: "rejected",
        errorCode: "SIZE_LIMIT",
        meta: { maxBytes: maxSize },
      });
      return NextResponse.json(
        { success: false, error: 'Audio file too large (max 50MB)' },
        { status: 413 }
      );
    }

    const safeUser = safeSegment(userId);
    const ts = Date.now();
    const ext = 'webm'; // MediaRecorder default for audio/webm
    const fname = `${safeSegment(entryId)}-${ts}-${crypto.randomBytes(4).toString('hex')}.${ext}`;

    const baseDir = path.join(process.cwd(), 'storage', 'audio', 'journals', safeUser);
    await ensureDir(baseDir);

    const absPath = path.join(baseDir, fname);
    const relPath = path.join('storage', 'audio', 'journals', safeUser, fname);

    // Write audio file to disk
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(absPath, Buffer.from(arrayBuffer));

    // Update the journal entry with audio metadata
    const audioMime = file.type || 'audio/webm';
    await query(
      `UPDATE quick_journal_entries
       SET audio_path = $1,
           audio_mime = $2,
           audio_duration_ms = $3,
           transcript_source = $4,
           transcript_confidence = $5
       WHERE id = $6 AND user_id = $7`,
      [
        relPath,
        audioMime,
        durationMs || null,
        transcriptSource,
        transcriptConfidence,
        entryId,
        userId
      ]
    );

    console.log(`🎙️ [VoiceJournal] Audio saved: ${relPath} (${Math.round(file.size / 1024)}KB, ${durationMs}ms)`);

    // Log audio usage for metering (fire-and-forget)
    logAudioUsageEvent({
      memberId: userId,
      route: '/api/journal/quick/audio',
      kind: 'upload',
      bytes: file.size,
      seconds: durationMs ? Math.ceil(durationMs / 1000) : null,
      status: 'ok',
      meta: {
        entryId,
        audioMime,
        transcriptSource,
      },
    });

    return NextResponse.json({
      success: true,
      audioPath: relPath,
      audioMime,
      audioDurationMs: durationMs || null,
      transcriptSource
    });

  } catch (error) {
    console.error('❌ [VoiceJournal] Upload failed:', error);
    return NextResponse.json(
      { success: false, error: 'Audio upload failed' },
      { status: 500 }
    );
  }
}
