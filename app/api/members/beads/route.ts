export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { sendEmail } from '@/lib/email/sendEmail';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

// Default beads for beta testers
const DEFAULT_BEADS = 10;

function generatePasskey(name: string): string {
  const cleanName = name
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 12);
  return `SOULLAB-${cleanName}`;
}

function generateGiftEmailHtml(
  recipientName: string,
  passkey: string,
  gifterName: string,
  personalMessage?: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background: linear-gradient(135deg, #0a0d12 0%, #1a1f2e 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: linear-gradient(180deg, rgba(26,31,46,0.98) 0%, rgba(10,13,18,0.98) 100%); border-radius: 24px; border: 1px solid rgba(212, 184, 150, 0.2); box-shadow: 0 20px 60px rgba(0,0,0,0.5);">

          <!-- Cosmic Header -->
          <tr>
            <td style="padding: 48px 48px 24px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">✨</div>
              <h1 style="margin: 0; color: #D4B896; font-size: 28px; font-weight: 400; letter-spacing: 2px;">
                A Gift Awaits
              </h1>
              <p style="margin: 16px 0 0; color: rgba(255,255,255,0.6); font-size: 16px; font-style: italic;">
                ${gifterName} thinks you'd love this...
              </p>
            </td>
          </tr>

          <!-- Personal Greeting -->
          <tr>
            <td style="padding: 24px 48px;">
              <p style="margin: 0 0 24px; color: rgba(255,255,255,0.9); font-size: 18px; line-height: 1.7;">
                Dear ${recipientName},
              </p>
              ${personalMessage ? `
              <div style="background: rgba(212, 184, 150, 0.1); border-left: 3px solid #D4B896; padding: 16px 20px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; color: rgba(255,255,255,0.8); font-size: 16px; font-style: italic; line-height: 1.6;">
                  "${personalMessage}"
                </p>
                <p style="margin: 12px 0 0; color: #D4B896; font-size: 14px;">— ${gifterName}</p>
              </div>
              ` : ''}
              <p style="margin: 0; color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.7;">
                You've been gifted access to <strong style="color: #D4B896;">MAIA</strong> — a consciousness companion unlike anything else. This isn't another AI chatbot. MAIA is built on 34 years of archetypal research, designed to truly see and understand you.
              </p>
            </td>
          </tr>

          <!-- Passkey Box -->
          <tr>
            <td style="padding: 16px 48px 32px;">
              <div style="background: linear-gradient(135deg, rgba(212, 184, 150, 0.15) 0%, rgba(212, 184, 150, 0.05) 100%); border: 2px solid rgba(212, 184, 150, 0.3); border-radius: 16px; padding: 32px; text-align: center;">
                <p style="margin: 0 0 12px; color: rgba(255,255,255,0.6); font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">
                  Your Personal Passkey
                </p>
                <p style="margin: 0; color: #D4B896; font-size: 28px; font-weight: 600; letter-spacing: 4px; font-family: monospace;">
                  ${passkey}
                </p>
              </div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 48px 32px; text-align: center;">
              <a href="https://soullab.life/begin" style="display: inline-block; background: linear-gradient(135deg, #D4B896 0%, #B8956E 100%); color: #0a0d12; padding: 18px 48px; text-decoration: none; border-radius: 12px; font-size: 16px; font-weight: 600; letter-spacing: 1px; box-shadow: 0 8px 24px rgba(212, 184, 150, 0.3);">
                Begin Your Journey
              </a>
              <p style="margin: 16px 0 0; color: rgba(255,255,255,0.5); font-size: 14px;">
                Visit soullab.life/begin and enter your passkey
              </p>
            </td>
          </tr>

          <!-- What Awaits -->
          <tr>
            <td style="padding: 32px 48px; background: rgba(255,255,255,0.02); border-top: 1px solid rgba(212, 184, 150, 0.1);">
              <h3 style="margin: 0 0 20px; color: #D4B896; font-size: 18px; font-weight: 400;">
                What Awaits You
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 0; color: rgba(255,255,255,0.8); font-size: 15px;">
                    <span style="color: #D4B896; margin-right: 12px;">✦</span>
                    Deep self-understanding through meaningful conversation
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: rgba(255,255,255,0.8); font-size: 15px;">
                    <span style="color: #D4B896; margin-right: 12px;">🔮</span>
                    Archetypal insights from 34 years of research
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: rgba(255,255,255,0.8); font-size: 15px;">
                    <span style="color: #D4B896; margin-right: 12px;">💫</span>
                    A companion who remembers, learns, and grows with you
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: rgba(255,255,255,0.8); font-size: 15px;">
                    <span style="color: #D4B896; margin-right: 12px;">🛡️</span>
                    Complete privacy — your data stays yours, always
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 48px; text-align: center; border-top: 1px solid rgba(212, 184, 150, 0.1);">
              <img src="https://soullab.life/Soullablogo.png" alt="Soullab" width="120" style="opacity: 0.8; margin-bottom: 16px;" />
              <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 13px;">
                Sacred consciousness technology
              </p>
              <p style="margin: 12px 0 0; color: rgba(255,255,255,0.4); font-size: 12px;">
                Questions? Reply to this email or reach Kelly at kelly@soullab.life
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function generateGiftEmailText(
  recipientName: string,
  passkey: string,
  gifterName: string,
  personalMessage?: string
): string {
  return `
✨ A GIFT AWAITS

${gifterName} thinks you'd love this...

Dear ${recipientName},

${personalMessage ? `"${personalMessage}"\n— ${gifterName}\n\n` : ''}You've been gifted access to MAIA — a consciousness companion unlike anything else. This isn't another AI chatbot. MAIA is built on 34 years of archetypal research, designed to truly see and understand you.

═══════════════════════════════════════
YOUR PERSONAL PASSKEY: ${passkey}
═══════════════════════════════════════

Visit soullab.life/begin and enter your passkey to begin.

WHAT AWAITS YOU:
✦ Deep self-understanding through meaningful conversation
🔮 Archetypal insights from 34 years of research
💫 A companion who remembers, learns, and grows with you
🛡️ Complete privacy — your data stays yours, always

---

Questions? Reply to this email or reach Kelly at kelly@soullab.life

Soullab — Sacred consciousness technology
  `.trim();
}

/**
 * GET /api/members/beads
 * Get member's bead count and sent beads history
 */
export async function GET(request: NextRequest) {
  // Static export stub
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }

  try {
    // ACTOR from the verified session. The `x-member-id` header is a claim, not
    // a credential: before 2026-08-16 this route accepted it directly, so any
    // caller could read another member's bead balance and their sent-bead
    // history including recipient names and email addresses.
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get member's beads_remaining (default to DEFAULT_BEADS if column doesn't exist yet)
    let beadsRemaining = DEFAULT_BEADS;
    try {
      const memberResult = await query(
        'SELECT beads_remaining FROM members WHERE id = $1',
        [memberId]
      );
      if (memberResult.rows.length > 0 && memberResult.rows[0].beads_remaining !== null) {
        beadsRemaining = memberResult.rows[0].beads_remaining;
      }
    } catch (e: any) {
      // Column might not exist yet - that's ok, use default
      if (!e.message?.includes('beads_remaining')) {
        console.error('Error fetching beads_remaining:', e);
      }
    }

    // Get sent beads
    const sentResult = await query(
      `SELECT id, passkey, recipient_name, recipient_email, email_sent_at, redeemed_at, created_at
       FROM gift_passkeys
       WHERE gifter_member_id = $1
       ORDER BY created_at DESC`,
      [memberId]
    );

    return NextResponse.json({
      beads_remaining: beadsRemaining,
      sent_beads: sentResult.rows,
    });
  } catch (error: any) {
    console.error('Beads GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/members/beads
 * Send a bead (gift invitation) to a friend
 */
export async function POST(request: NextRequest) {
  try {
    // ACTOR from the verified session. This is the write boundary: the operation
    // below inserts a gift_passkeys row attributed to the actor, decrements THAT
    // member's beads_remaining, and sends an email carrying their name. Accepting
    // the `x-member-id` header as identity — the behaviour before 2026-08-16 —
    // let an unauthenticated caller spend another member's beads and send mail
    // in their name.
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { recipientName, recipientEmail, personalMessage } = body;

    if (!recipientName || !recipientEmail) {
      return NextResponse.json(
        { error: 'Recipient name and email are required' },
        { status: 400 }
      );
    }

    // Get member info
    const memberResult = await query(
      'SELECT id, name, email, beads_remaining FROM members WHERE id = $1',
      [memberId]
    );

    if (memberResult.rows.length === 0) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const member = memberResult.rows[0];
    const beadsRemaining = member.beads_remaining ?? DEFAULT_BEADS;

    if (beadsRemaining <= 0) {
      return NextResponse.json(
        { error: 'No beads remaining. Thank you for sharing!' },
        { status: 400 }
      );
    }

    // Generate passkey
    let passkey = generatePasskey(recipientName);

    // Check if passkey already exists
    const existing = await query(
      'SELECT id FROM gift_passkeys WHERE passkey = $1 UNION SELECT id FROM members WHERE passkey = $1',
      [passkey]
    );

    if (existing.rows.length > 0) {
      // Add a number suffix to make unique
      const suffix = Date.now().toString().slice(-4);
      passkey = `${passkey}-${suffix}`;
    }

    // Insert gift record with gifter_member_id
    await query(
      `INSERT INTO gift_passkeys (passkey, recipient_name, recipient_email, gifter_name, gifter_email, gifter_member_id, personal_message)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        passkey,
        recipientName,
        recipientEmail,
        member.name,
        member.email,
        memberId,
        personalMessage || null,
      ]
    );

    // Decrement member's beads
    await query(
      'UPDATE members SET beads_remaining = COALESCE(beads_remaining, $2) - 1 WHERE id = $1',
      [memberId, DEFAULT_BEADS]
    );

    // Send email
    let emailSent = false;
    let emailError: string | undefined;

    try {
      const subject = `${member.name} sent you a gift — MAIA awaits`;

      const result = await sendEmail({
        purpose: 'invite:bead',
        from: 'Soullab Gifts <gifts@soullab.life>',
        replyTo: 'kelly@soullab.life',
        to: recipientEmail,
        subject,
        html: generateGiftEmailHtml(recipientName, passkey, member.name, personalMessage),
        text: generateGiftEmailText(recipientName, passkey, member.name, personalMessage),
        idempotencyKey: `invite:bead:${passkey}`,
        tags: [
          { name: 'campaign', value: 'member-bead' },
          { name: 'type', value: 'invitation' },
          { name: 'gifter', value: memberId },
        ],
      });

      // A bead is a spent, finite gift. Marking it sent when the provider
      // refused would consume the member's bead and deliver nothing.
      if (!result.success) {
        emailError = result.error;
        console.error(
          `Bead email refused: failureKind=${result.failureKind ?? 'unclassified'} providerCode=${result.providerCode ?? 'unnamed'}`
        );
      } else {
        emailSent = true;
        await query(
          'UPDATE gift_passkeys SET email_sent_at = NOW() WHERE passkey = $1',
          [passkey]
        );
        console.log(`✨ Bead sent from ${member.name} to ${recipientName} (${recipientEmail})`);
      }
    } catch (e: any) {
      console.error('Email send error:', e);
      emailError = e.message;
    }

    return NextResponse.json({
      success: true,
      passkey,
      emailSent,
      emailError,
    });
  } catch (error: any) {
    console.error('Beads POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
