/**
 * RF01 S0-A1.1 — authenticated, atomic member settings.
 * A returned default is a display value, not evidence of express memory consent.
 */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db/postgres';
import { resolvePrivacyActor, matchingClaim } from '@/lib/auth/privacyMemberGuard';
import { isValidReviewLensId } from '@/lib/studio/reviewLens';

type RecordObject = Record<string, unknown>;
const isRecord = (x: unknown): x is RecordObject =>
  !!x && typeof x === 'object' && !Array.isArray(x);

const BOOLEAN_FIELDS: Record<string, string> = {
  emailWeeklyDigest: 'email_weekly_digest',
  emailBreakthroughMoments: 'email_breakthrough_moments',
  emailCommunityUpdates: 'email_community_updates',
  emailProductUpdates: 'email_product_updates',
  shareAnonymousInsights: 'share_anonymous_insights',
  allowResearchParticipation: 'allow_research_participation',
};
const STRING_FIELDS: Record<string, string> = {
  voiceModel: 'voice_model',
  memoryDepth: 'memory_depth',
  archetype: 'archetype',
  conversationMode: 'conversation_mode',
  preferredAssistantName: 'preferred_assistant_name',
};
const CONSENT_KEYS = new Set([
  'audioServer', 'audioLocal',
  'conversationsServer', 'conversationsLocal',
  'journalsServer', 'journalsLocal',
  'journalServer', 'journalLocal',
  'preferencesServer', 'preferencesLocal',
  'memoriesServer', 'memoriesLocal',
  'insightsServer', 'insightsLocal',
]);

function failure(code: string, status: number) {
  return NextResponse.json({ error: code }, { status });
}

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) return NextResponse.json({ stub: true });
  try {
    const actor = await resolvePrivacyActor(request, request.nextUrl.searchParams.get('memberId'));
    if (!actor.ok) return failure(actor.code, actor.status);
    const result = await query('SELECT * FROM member_settings WHERE member_id = $1', [actor.memberId]);
    const r = result.rows[0] ?? null;
    // A first GET is observational; never INSERT a row with an automatic
    // Continuity default and then mistake that row for the member's choice.
    return NextResponse.json({
      maia: {
        defaultMemoryMode: r?.default_memory_mode ?? null,
        memoryModeChoiceProvenance: r ? 'unverified_legacy' : 'unresolved',
        voiceModel: r?.voice_model ?? 'shimmer',
        voiceSpeed: r?.voice_speed == null ? 0.95 : Number(r.voice_speed),
        memoryDepth: r?.memory_depth ?? 'moderate',
        archetype: r?.archetype ?? 'AUTO',
        conversationMode: r?.conversation_mode ?? 'her',
        preferredAssistantName: r?.preferred_assistant_name ?? 'MAIA',
      },
      notifications: {
        weeklyDigest: r?.email_weekly_digest ?? true,
        breakthroughMoments: r?.email_breakthrough_moments ?? true,
        communityUpdates: r?.email_community_updates ?? false,
        productUpdates: r?.email_product_updates ?? true,
      },
      privacy: {
        shareAnonymousInsights: r?.share_anonymous_insights ?? false,
        allowResearchParticipation: r?.allow_research_participation ?? false,
      },
      membership: {
        tier: r?.circle_tier ?? 'explorer',
        amount: r?.circle_amount ?? 0,
        joinedAt: r?.circle_joined_at ?? null,
      },
      storageConsent: r?.storage_consent ?? {},
      preferredReviewLenses: r?.preferred_review_lenses ?? [],
    });
  } catch {
    return failure('SETTINGS_UNAVAILABLE', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const actor = await resolvePrivacyActor(request, request.nextUrl.searchParams.get('memberId'));
    if (!actor.ok) return failure(actor.code, actor.status);
    let body: unknown;
    try { body = await request.json(); } catch { return failure('INVALID_JSON', 400); }
    if (!isRecord(body)) return failure('INVALID_SETTINGS_BODY', 400);
    if (!matchingClaim(body.memberId, actor.memberId)) {
      return failure('MEMBER_CLAIM_MISMATCH', 403);
    }
    // Payment/membership authority is not conferred by a generic settings PUT.
    if ('circleTier' in body || 'circleAmount' in body) {
      return failure('MEMBERSHIP_FIELD_NOT_WRITABLE', 403);
    }

    const setters: string[] = [];
    const params: unknown[] = [actor.memberId];
    let storageConsent: RecordObject | null = null;
    const append = (column: string, value: unknown) => {
      params.push(value);
      setters.push(column + ' = $' + params.length);
    };

    // Validate the whole request before even the first settings INSERT.
    for (const [key, value] of Object.entries(body)) {
      if (key === 'memberId') continue;
      if (key in BOOLEAN_FIELDS) {
        if (typeof value !== 'boolean') return failure('INVALID_' + key, 400);
        append(BOOLEAN_FIELDS[key], value);
        continue;
      }
      if (key in STRING_FIELDS) {
        if (typeof value !== 'string' || !value.trim() || value.length > 160) {
          return failure('INVALID_' + key, 400);
        }
        append(STRING_FIELDS[key], value);
        continue;
      }
      if (key === 'defaultMemoryMode') {
        if (value !== 'continuity' && value !== 'sanctuary') {
          return failure('INVALID_DEFAULT_MEMORY_MODE', 400);
        }
        append('default_memory_mode', value);
        continue;
      }
      if (key === 'voiceSpeed') {
        if (typeof value !== 'number' || !Number.isFinite(value) || value < 0.25 || value > 3) {
          return failure('INVALID_VOICE_SPEED', 400);
        }
        append('voice_speed', value);
        continue;
      }
      if (key === 'preferredReviewLenses') {
        if (!Array.isArray(value) || value.some(v => typeof v !== 'string' || !isValidReviewLensId(v))) {
          return failure('INVALID_REVIEW_LENSES', 400);
        }
        append('preferred_review_lenses', value);
        continue;
      }
      if (key === 'storageConsent') {
        if (!isRecord(value) || Object.keys(value).length === 0 ||
            Object.entries(value).some(([name, permitted]) =>
              !CONSENT_KEYS.has(name) || typeof permitted !== 'boolean')) {
          return failure('INVALID_STORAGE_CONSENT', 400);
        }
        storageConsent = value;
        continue;
      }
      return failure('UNSUPPORTED_SETTINGS_FIELD', 400);
    }
    if (storageConsent) {
      params.push(JSON.stringify(storageConsent));
      setters.push("storage_consent = COALESCE(storage_consent, '{}'::jsonb) || $" +
        params.length + '::jsonb');
    }
    if (setters.length === 0) return failure('NO_SETTINGS_UPDATES', 400);

    // One pinned connection for both writes. A later SQL failure rolls back
    // the first write; a committed response is returned only after COMMIT.
    const settings = await transaction(async (client) => {
      await client.query(
        'INSERT INTO member_settings (member_id) VALUES ($1) ON CONFLICT (member_id) DO NOTHING',
        [actor.memberId],
      );
      const updated = await client.query(
        'UPDATE member_settings SET ' + setters.join(', ') +
        ', updated_at = NOW() WHERE member_id = $1 RETURNING *',
        params,
      );
      if (!updated.rows[0]) throw new Error('SETTINGS_UPDATE_EMPTY');
      return updated.rows[0];
    });
    return NextResponse.json({ success: true, settings });
  } catch {
    return failure('SETTINGS_UPDATE_FAILED', 500);
  }
}
