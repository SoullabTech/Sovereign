/**
 * Phase 2J: Selflet Card Action API
 *
 * Handles snooze and archive actions for past-self message cards.
 * POST /api/selflet/action
 */

import { NextResponse } from 'next/server';
import { selfletChain } from '@/lib/memory/selflet/SelfletChain';

const IS_PROD = process.env.NODE_ENV === 'production';

type ActionBody = {
  messageId: string;
  action: 'snooze' | 'archive';
  snoozeMinutes?: number;
  userId?: string; // Only used if MAIA_DEV_TRUST_BODY_ID is enabled
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ActionBody;

    // Validate required fields
    if (!body?.messageId || !body?.action) {
      return NextResponse.json(
        { ok: false, error: 'missing_fields' },
        { status: 400 }
      );
    }

    if (body.action !== 'snooze' && body.action !== 'archive') {
      return NextResponse.json(
        { ok: false, error: 'invalid_action' },
        { status: 400 }
      );
    }

    // ✅ IDENTITY RESOLUTION
    // In production, we'd get userId from verified session/auth
    // For now, use dev trust mode pattern matching chat route
    const devTrustBodyId = process.env.MAIA_DEV_TRUST_BODY_ID === '1';

    let effectiveUserId: string | null = null;

    // TODO: When auth is implemented, get userId from verified session
    // const authUserId = await getAuthenticatedUserId(req);
    // if (authUserId) effectiveUserId = authUserId;

    if (!effectiveUserId && !IS_PROD && devTrustBodyId && body.userId) {
      // 🧪 Dev mode with trust enabled: Allow client-supplied userId
      effectiveUserId = body.userId.trim();
    }

    if (!effectiveUserId) {
      return NextResponse.json(
        { ok: false, error: 'unauthorized' },
        { status: 401 }
      );
    }

    // Execute the action
    if (body.action === 'archive') {
      const result = await selfletChain.archiveMessageById({
        userId: effectiveUserId,
        messageId: body.messageId,
        reason: 'card_archive',
      });
      return NextResponse.json(result);
    }

    // Snooze action
    // Clamp snooze duration: min 5 minutes, max 30 days
    const snoozeMinutes = Math.max(5, Math.min(60 * 24 * 30, body.snoozeMinutes ?? 60 * 24));
    const result = await selfletChain.snoozeMessageById({
      userId: effectiveUserId,
      messageId: body.messageId,
      snoozeMinutes,
      reason: 'card_snooze',
    });
    return NextResponse.json(result);

  } catch (err) {
    console.error('[SELFLET] action route error:', err);
    return NextResponse.json(
      { ok: false, error: 'server_error' },
      { status: 500 }
    );
  }
}
