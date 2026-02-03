// Production requires force-dynamic for per-user database access
export const dynamic = 'force-dynamic';
export const revalidate = false;

/**
 * Storage Consent Sync API
 * POST /api/account/storage-consent
 *
 * Syncs client-side consent toggles to server for authoritative enforcement.
 * The server reads consent from member_settings.storage_consent JSONB,
 * NOT from client-provided form fields.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

// TODO: Replace with proper session-based auth when available.
// For now, follows existing pattern of memberId in request body.
// This is not ideal but matches current auth approach across the app.
async function getMemberIdFromRequest(req: NextRequest): Promise<string | null> {
  try {
    const body = await req.json();
    return body.memberId || null;
  } catch {
    return null;
  }
}

type StorageConsentPatch = {
  audioServer?: boolean;
  audioLocal?: boolean;
  conversationsServer?: boolean;
  conversationsLocal?: boolean;
  journalsServer?: boolean;
  journalsLocal?: boolean;
  memoriesServer?: boolean;
  memoriesLocal?: boolean;
  insightsServer?: boolean;
  insightsLocal?: boolean;
};

export async function POST(req: NextRequest) {
  try {
    // Clone request to read body twice (once for memberId, once for patch)
    const body = await req.json();
    const memberId = body.memberId;

    if (!memberId) {
      return NextResponse.json(
        { success: false, error: 'Missing memberId' },
        { status: 400 }
      );
    }

    const patch = body as StorageConsentPatch;

    // Defensive: only accept known keys
    const allowedKeys = new Set([
      'audioServer', 'audioLocal',
      'conversationsServer', 'conversationsLocal',
      'journalsServer', 'journalsLocal',
      'memoriesServer', 'memoriesLocal',
      'insightsServer', 'insightsLocal',
    ]);

    const clean: Record<string, boolean> = {};
    for (const [k, v] of Object.entries(patch || {})) {
      if (allowedKeys.has(k) && typeof v === 'boolean') clean[k] = v;
    }

    if (Object.keys(clean).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid consent fields provided' },
        { status: 400 }
      );
    }

    // Upsert: insert if no settings row exists, otherwise merge into existing consent
    await query(
      `
      INSERT INTO member_settings (member_id, storage_consent)
      VALUES ($1, $2::jsonb)
      ON CONFLICT (member_id)
      DO UPDATE SET
        storage_consent = COALESCE(member_settings.storage_consent, '{}'::jsonb) || EXCLUDED.storage_consent,
        updated_at = NOW()
      `,
      [memberId, JSON.stringify(clean)]
    );

    console.log(`[StorageConsent] Updated for ${memberId}:`, clean);

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to update consent';
    console.error('[StorageConsent] Error:', e);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve current consent state
export async function GET(req: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const memberId = req.nextUrl.searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json(
        { success: false, error: 'Missing memberId' },
        { status: 400 }
      );
    }

    const result = await query(
      `SELECT storage_consent FROM member_settings WHERE member_id = $1 LIMIT 1`,
      [memberId]
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = Array.isArray(result) ? result[0] : (result as any)?.rows?.[0];
    const consent = row?.storage_consent || {};

    return NextResponse.json({ success: true, consent });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to get consent';
    console.error('[StorageConsent] GET Error:', e);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
