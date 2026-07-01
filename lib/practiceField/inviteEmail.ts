/**
 * Practice Field — Relationship Space Invitation Email
 *
 * Relationship-framed, not platform-signup-framed.
 * The client is accepting Jondi's invitation, not signing up for software.
 *
 * Uses Resend (same pattern as lib/portal/notifications.ts).
 */

import { Resend } from 'resend';

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('[PracticeField/inviteEmail] RESEND_API_KEY not configured');
      return null;
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export interface RelationshipInviteEmailParams {
  clientEmail: string;
  clientName?: string;
  practitionerName: string;
  welcomeMessage?: string | null;
  inviteToken: string;
  baseUrl: string;
}

export async function sendRelationshipInviteEmail(
  params: RelationshipInviteEmailParams
): Promise<{ success: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) {
    console.warn('[PracticeField/inviteEmail] Resend not configured — logging invite instead');
    console.log(`[INVITE] ${params.practitionerName} → ${params.clientEmail}: ${params.baseUrl}/join/${params.inviteToken}`);
    return { success: true };
  }

  const acceptUrl = `${params.baseUrl}/join/${params.inviteToken}`;
  const greeting = params.clientName ? `Hi ${params.clientName},` : 'Hi,';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation from ${params.practitionerName}</title>
</head>
<body style="font-family: Georgia, serif; background: #fafaf8; margin: 0; padding: 40px 20px;">
  <div style="max-width: 520px; margin: 0 auto; background: white; padding: 48px 40px; border-radius: 4px;">

    <p style="color: #666; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 32px;">
      A private invitation
    </p>

    <p style="color: #1a1a1a; font-size: 17px; line-height: 1.7; margin: 0 0 24px;">
      ${greeting}
    </p>

    <p style="color: #333; font-size: 17px; line-height: 1.7; margin: 0 0 24px;">
      ${params.practitionerName} has invited you into a private shared space where the two of you can continue your work together between sessions, supported by MAIA.
    </p>

    ${params.welcomeMessage ? `
    <div style="border-left: 2px solid #d4c5a9; padding: 16px 20px; margin: 24px 0; background: #faf7f2;">
      <p style="color: #444; font-size: 15px; line-height: 1.8; margin: 0; font-style: italic;">
        ${params.welcomeMessage.replace(/\n/g, '<br>')}
      </p>
      <p style="color: #888; font-size: 12px; margin: 12px 0 0;">— ${params.practitionerName}</p>
    </div>
    ` : ''}

    <p style="color: #555; font-size: 15px; line-height: 1.7; margin: 24px 0;">
      MAIA is here to support the work you're already doing together — to help you reflect, prepare for sessions, and carry what matters between your meetings.
    </p>

    <div style="text-align: center; margin: 40px 0;">
      <a href="${acceptUrl}"
         style="background: #1a1a1a; color: white; text-decoration: none; padding: 14px 32px; font-size: 15px; letter-spacing: 0.03em; border-radius: 2px; display: inline-block;">
        Accept Invitation
      </a>
    </div>

    <p style="color: #999; font-size: 13px; line-height: 1.6; margin: 24px 0 0;">
      This invitation was sent by ${params.practitionerName} via Soullab. If you weren't expecting this, you can ignore it safely.
    </p>

  </div>
</body>
</html>
  `.trim();

  try {
    const result = await resend.emails.send({
      from: 'Soullab <noreply@soullab.life>',
      to: params.clientEmail,
      subject: `${params.practitionerName} has invited you into a shared space`,
      html,
    });

    if (result.error) {
      console.error('[PracticeField/inviteEmail] Resend error:', result.error);
      return { success: false, error: String(result.error) };
    }

    return { success: true };
  } catch (err) {
    console.error('[PracticeField/inviteEmail] Unexpected error:', err);
    return { success: false, error: String(err) };
  }
}
