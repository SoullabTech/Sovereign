/**
 * POST /api/studio/session-followup/send
 *
 * Sends a practitioner-reviewed parent update. Enforces:
 * - human edit requirement
 * - explicit consent confirmation
 * - content validation against session data
 *
 * Delivers via email (Resend) and optionally links to comms thread.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db/postgres';
import { SendFollowupRequestSchema, type SendFollowupRequest } from '@/lib/studio/followups/schema';
import { loadSessionData } from '@/lib/studio/followups/sessionDataLoader';
import { generateParentUpdateHtml } from '@/lib/studio/followups/emailTemplate';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { sendEmail } from '@/lib/email/sendEmail';

export const runtime = 'nodejs';

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

export async function POST(req: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(req);
    if (!memberId) {
      return json(401, { error: 'Not authenticated' });
    }

    const raw = await req.json();
    const input: SendFollowupRequest = SendFollowupRequestSchema.parse(raw);

    // Verify artifact exists and belongs to this practitioner
    const artifactResult = await query(
      `SELECT id, session_id, draft_content, sent_at
       FROM session_artifacts WHERE id = $1 AND created_by = $2`,
      [input.artifactId, memberId],
    );

    if (artifactResult.rows.length === 0) {
      return json(404, { error: 'Artifact not found' });
    }

    const artifact = artifactResult.rows[0];
    if (artifact.sent_at) {
      return json(400, { error: 'This update has already been sent' });
    }

    // Verify session still exists and has content
    const sessionData = await loadSessionData({
      sessionId: input.sessionId,
      caseId: input.clientId ?? null,
    });

    if (!sessionData || !sessionData.reviewableContentExists) {
      return json(400, { error: 'Cannot send follow-up for a session with no reviewable content' });
    }

    // Enforced at API level — not just UI
    if (!input.humanEdited) {
      return json(400, { error: 'Follow-up must be reviewed and edited by a human before sending' });
    }
    if (!input.consentConfirmed) {
      return json(400, { error: 'Explicit consent confirmation is required before sending' });
    }

    // Verify recipient has consent in client_contacts (if contact exists)
    if (input.clientId) {
      const contactResult = await query(
        `SELECT consent_given FROM client_contacts
         WHERE client_id = $1 AND email = $2 AND is_active = true`,
        [input.clientId, input.recipientEmail],
      );
      if (contactResult.rows.length > 0 && !contactResult.rows[0].consent_given) {
        return json(400, { error: 'Recipient has not given consent for communications' });
      }
    }

    // Send email via Resend
    let messageId: string | null = null;

    if (input.sendVia === 'email' || input.sendVia === 'both') {
      const sessionDate = sessionData.startedAt.toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      const html = generateParentUpdateHtml({
        blocks: input.draft,
        practitionerName: input.practitionerName,
        clientName: input.clientName,
        sessionDate,
      });

      const emailResult = await sendEmail({
        purpose: 'practitioner:session-followup',
        from: `${input.practitionerName} via SoulLab <updates@soullab.life>`,
        to: input.recipientEmail,
        subject: `Session update for ${input.clientName}`,
        html,
      });

      // This send was reached by a DYNAMIC vendor import (an inline
      // `await import(...)` of the SDK), which the static-import census did not
      // see. It carried the same defect as the
      // rest: `emailResult.data?.id` was read without ever inspecting
      // `emailResult.error`, so a refused update was recorded as sent — and the
      // artifact below was then marked `sent_at = NOW()` for mail that never
      // left, with `consent_confirmed = true` beside it.
      if (!emailResult.success) {
        console.error(
          `[session-followup/send] Email REFUSED failureKind=${emailResult.failureKind ?? 'unclassified'} providerCode=${emailResult.providerCode ?? 'unnamed'}`
        );
        return json(502, {
          error: emailResult.retryable
            ? 'Email delivery failed. Draft is saved — you can retry.'
            : 'Email delivery failed. Draft is saved — please check the delivery settings.',
          retryable: emailResult.retryable === true,
        });
      }

      messageId = emailResult.id ?? null;
    }

    // Update artifact with sent state
    await query(
      `UPDATE session_artifacts SET
        final_content = $1,
        recipients = $2,
        sent_at = NOW(),
        sent_via = $3,
        human_edited = true,
        consent_confirmed = true,
        updated_at = NOW()
       WHERE id = $4`,
      [
        JSON.stringify(input.draft),
        JSON.stringify([{
          name: input.recipientName,
          email: input.recipientEmail,
          role: 'parent',
        }]),
        input.sendVia,
        input.artifactId,
      ],
    );

    return json(200, {
      ok: true,
      sent: true,
      messageId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return json(400, { error: 'Invalid request', issues: error.flatten() });
    }

    console.error('[session-followup/send] failed', error);
    return json(500, { error: 'Failed to send follow-up' });
  }
}
