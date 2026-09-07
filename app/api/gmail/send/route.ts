/**
 * GMAIL SEND API
 *
 * Sends an email via Gmail on behalf of the authenticated user.
 * Used by Avoidance Breaker to send drafted messages.
 *
 * Weight: 5 (highest cost action - real external infrastructure)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { GmailService } from '@/lib/gmail/GmailService';
import { logAction, checkThreshold } from '@/lib/focus/weightTracking';

export const dynamic = 'force-dynamic';

interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
  // `userId` and `memberId` are deliberately ABSENT. Both are resolved from
  // the session; accepting either would restore the defect this route had.
}

/**
 * MAIL-04c (2026-09-07) — MEMBER-DELEGATED MAIL
 * =============================================
 * This route sends from a member's OWN connected Google account. That makes it
 * a different plane from platform mail, and the difference matters:
 *
 *   PLATFORM MAIL          Soullab sends its own messages. The destination is
 *                          constrained (MAIL-04a): a caller may not aim it.
 *
 *   MEMBER-DELEGATED MAIL  a member composes from their own account. Choosing
 *                          the recipient is the ENTIRE FEATURE, not a defect.
 *
 * So the invariant is not "the caller may never choose a destination". It is:
 *
 *   a caller may choose a destination only when they hold verified authority
 *   for the sending act — and may NEVER choose another actor's sending identity
 *
 * The defect was the second clause. `userId` came from the request body and was
 * used verbatim to look up OAuth credentials
 * (google_calendar_credentials WHERE user_id = <caller-supplied>), so a caller
 * who knew any connected id could choose BOTH whose Google token to spend AND
 * where the mail went. The 401 below used to gate on whether Gmail was
 * *connected* — a configuration check wearing the costume of an admission check.
 */
export async function POST(request: NextRequest) {
  try {
    const body: SendEmailRequest = await request.json();
    const { to, subject, body: emailBody, cc, bcc } = body;

    // The sending identity is the session's member. A `userId` or `memberId` in
    // the body is ignored — both previously constituted authority.
    const userId = await getMemberIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Sign in to send from your connected Google account' },
        { status: 401 }
      );
    }
    // Weight tracking follows the actor, so it can no longer be aimed at
    // another member's budget either.
    const memberId = userId;

    if (!to) {
      return NextResponse.json(
        { error: 'Recipient (to) is required' },
        { status: 400 }
      );
    }

    if (!subject || !emailBody) {
      return NextResponse.json(
        { error: 'Subject and body are required' },
        { status: 400 }
      );
    }

    // Check threshold before allowing high-cost action (weight 5)
    if (memberId) {
      try {
        const threshold = await checkThreshold(memberId);
        if (threshold.level === 'hard') {
          // At hard threshold, suggest pause before sending
          return NextResponse.json({
            success: false,
            error: 'threshold_reached',
            threshold: threshold.level,
            message: 'You\'ve been doing meaningful work this week. Consider becoming a steward to continue, or take a moment to pause.',
          }, { status: 429 });
        }
      } catch (thresholdError) {
        // Non-blocking - continue if threshold check fails
        console.warn('[GmailSend] Threshold check skipped:', thresholdError);
      }
    }

    // Check if user has Gmail permission
    const hasPermission = await GmailService.hasGmailPermission(userId);
    if (!hasPermission) {
      return NextResponse.json({
        success: false,
        error: 'Gmail not connected',
        needsReauth: true,
        message: 'Please reconnect Google with Gmail send permission.',
      }, { status: 401 });
    }

    // Send the email
    const result = await GmailService.sendEmail(userId, {
      to,
      subject,
      body: emailBody,
      cc,
      bcc,
    });

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
        needsReauth: result.error?.includes('permission') || result.error?.includes('reconnect'),
      }, { status: 400 });
    }

    console.log(`[GmailSend] Email sent to ${to} for user ${userId}`);

    // Log weight for gmail send (weight = 5, highest cost action)
    if (memberId) {
      try {
        await logAction(memberId, 'gmail_send', {
          source: 'avoidance-breaker',
          metadata: { recipient: to }
        });
      } catch (weightError) {
        console.warn('[GmailSend] Weight logging skipped:', weightError);
      }
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      threadId: result.threadId,
      message: `Email sent to ${to}`,
    });

  } catch (error) {
    console.error('[GmailSend] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Check Gmail connection status
 */
export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  // MAIL-04c: the subject is the session's member. `?userId=` previously let
  // any caller read whether an arbitrary account had Gmail connected, and its
  // address — an enumeration surface over connected accounts.
  const userId = await getMemberIdFromRequest(request);

  if (!userId) {
    return NextResponse.json(
      { error: 'Sign in to view Gmail connection status' },
      { status: 401 }
    );
  }

  const hasPermission = await GmailService.hasGmailPermission(userId);
  const userEmail = hasPermission ? await GmailService.getUserEmail(userId) : null;

  return NextResponse.json({
    connected: hasPermission,
    email: userEmail,
  });
}
