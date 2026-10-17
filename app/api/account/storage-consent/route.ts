// RF01 S0-A1.1 — authoritative authenticated account-storage consent.
// A submitted memberId is only a claim, never proof of ownership.
export const dynamic = 'force-dynamic';
export const revalidate = false;

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { resolvePrivacyActor, matchingClaim } from '@/lib/auth/privacyMemberGuard';

const CONSENT_KEYS = new Set([
  'audioServer', 'audioLocal',
  'conversationsServer', 'conversationsLocal',
  'journalsServer', 'journalsLocal',
  'journalServer', 'journalLocal',
  'preferencesServer', 'preferencesLocal',
  'memoriesServer', 'memoriesLocal',
  'insightsServer', 'insightsLocal',
]);
const failure = (code: string, status: number) =>
  NextResponse.json({ success: false, error: code }, { status });

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) return NextResponse.json({ stub: true });
  try {
    const actor = await resolvePrivacyActor(request, request.nextUrl.searchParams.get('memberId'));
    if (!actor.ok) return failure(actor.code, actor.status);
    const result = await query<{ storage_consent: Record<string, boolean> | null }>(
      'SELECT storage_consent FROM member_settings WHERE member_id = $1 LIMIT 1',
      [actor.memberId],
    );
    return NextResponse.json({ success: true, consent: result.rows[0]?.storage_consent ?? {} });
  } catch {
    return failure('STORAGE_CONSENT_UNAVAILABLE', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await resolvePrivacyActor(request, request.nextUrl.searchParams.get('memberId'));
    if (!actor.ok) return failure(actor.code, actor.status);
    let body: unknown;
    try { body = await request.json(); } catch { return failure('INVALID_JSON', 400); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return failure('INVALID_CONSENT_BODY', 400);
    }
    const input = body as Record<string, unknown>;
    if (!matchingClaim(input.memberId, actor.memberId)) {
      return failure('MEMBER_CLAIM_MISMATCH', 403);
    }
    const clean: Record<string, boolean> = {};
    for (const [name, value] of Object.entries(input)) {
      if (name === 'memberId') continue;
      if (!CONSENT_KEYS.has(name)) continue; // legacy forward compatibility
      if (typeof value !== 'boolean') return failure('INVALID_CONSENT_VALUE', 400);
      clean[name] = value;
    }
    if (Object.keys(clean).length === 0) return failure('NO_CONSENT_CHANGES', 400);
    await query(
      "INSERT INTO member_settings (member_id, storage_consent) VALUES ($1, $2::jsonb) " +
      "ON CONFLICT (member_id) DO UPDATE SET " +
      "storage_consent = COALESCE(member_settings.storage_consent, '{}'::jsonb) || EXCLUDED.storage_consent, updated_at = NOW()",
      [actor.memberId, JSON.stringify(clean)],
    );
    // Intentionally do not log content, member IDs, or consent values.
    return NextResponse.json({ success: true });
  } catch {
    return failure('STORAGE_CONSENT_UPDATE_FAILED', 500);
  }
}
