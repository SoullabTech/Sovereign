export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { sendEmail } from '@/lib/email/sendEmail';

// Admin auth - requires LABTOOLS_SECRET environment variable
const ADMIN_SECRET = process.env.LABTOOLS_SECRET;

function validateAdminSecret(secret: string | null | undefined): boolean {
  if (!ADMIN_SECRET) {
    console.error('LABTOOLS_SECRET environment variable not configured');
    return false;
  }
  return secret === ADMIN_SECRET;
}

function generatePasskey(name: string): string {
  // Create SOULLAB-NAME format, uppercase, no spaces
  const cleanName = name
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 12);
  return `SOULLAB-${cleanName}`;
}

function generateGiftEmailHtml(
  recipientName: string,
  passkey: string,
  gifterName?: string,
  personalMessage?: string
): string {
  const greeting = gifterName
    ? `${gifterName} thinks you'd love this...`
    : "You've been invited to something special...";

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
                ${greeting}
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
                ${gifterName ? `<p style="margin: 12px 0 0; color: #D4B896; font-size: 14px;">— ${gifterName}</p>` : ''}
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
  gifterName?: string,
  personalMessage?: string
): string {
  const greeting = gifterName
    ? `${gifterName} thinks you'd love this...`
    : 'You\'ve been invited to something special...';

  return `
✨ A GIFT AWAITS

${greeting}

Dear ${recipientName},

${personalMessage ? `"${personalMessage}"\n${gifterName ? `— ${gifterName}\n` : ''}\n` : ''}
You've been gifted access to MAIA — a consciousness companion unlike anything else. This isn't another AI chatbot. MAIA is built on 34 years of archetypal research, designed to truly see and understand you.

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      recipientName,
      recipientEmail,
      gifterName,
      gifterEmail,
      personalMessage,
      adminSecret
    } = body;

    // Admin auth check
    if (!validateAdminSecret(adminSecret)) {
      return NextResponse.json(
        { error: 'Unauthorized - invalid or missing admin secret' },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!recipientName || !recipientEmail) {
      return NextResponse.json(
        { error: 'Recipient name and email are required' },
        { status: 400 }
      );
    }

    // Generate passkey
    const passkey = generatePasskey(recipientName);

    // Check if passkey already exists
    const existing = await query(
      'SELECT id FROM gift_passkeys WHERE passkey = $1 UNION SELECT id FROM members WHERE passkey = $1',
      [passkey]
    );

    if (existing.rows.length > 0) {
      // Add a number suffix to make unique
      const suffix = Date.now().toString().slice(-4);
      const uniquePasskey = `${passkey}-${suffix}`;

      // Insert gift record with unique passkey
      await query(
        `INSERT INTO gift_passkeys (passkey, recipient_name, recipient_email, gifter_name, gifter_email, personal_message)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [uniquePasskey, recipientName, recipientEmail, gifterName || null, gifterEmail || null, personalMessage || null]
      );

      // Send email with unique passkey
      const emailResult = await sendGiftEmail(uniquePasskey, recipientName, recipientEmail, gifterName, personalMessage);

      // Update email_sent_at
      if (emailResult.success) {
        await query(
          'UPDATE gift_passkeys SET email_sent_at = NOW() WHERE passkey = $1',
          [uniquePasskey]
        );
      }

      return NextResponse.json({
        success: true,
        passkey: uniquePasskey,
        emailSent: emailResult.success,
        emailId: emailResult.id,
        emailError: emailResult.error
      });
    }

    // Insert gift record
    await query(
      `INSERT INTO gift_passkeys (passkey, recipient_name, recipient_email, gifter_name, gifter_email, personal_message)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [passkey, recipientName, recipientEmail, gifterName || null, gifterEmail || null, personalMessage || null]
    );

    // Send beautiful email
    const emailResult = await sendGiftEmail(passkey, recipientName, recipientEmail, gifterName, personalMessage);

    // Update email_sent_at
    if (emailResult.success) {
      await query(
        'UPDATE gift_passkeys SET email_sent_at = NOW() WHERE passkey = $1',
        [passkey]
      );
    }

    return NextResponse.json({
      success: true,
      passkey,
      emailSent: emailResult.success,
      emailId: emailResult.id,
      emailError: emailResult.error
    });

  } catch (error: any) {
    console.error('Gift creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create gift' },
      { status: 500 }
    );
  }
}

async function sendGiftEmail(
  passkey: string,
  recipientName: string,
  recipientEmail: string,
  gifterName?: string,
  personalMessage?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const subject = gifterName
      ? `${gifterName} sent you a gift — MAIA awaits`
      : `You've been gifted access to MAIA`;

    const result = await sendEmail({
      purpose: 'invite:gift',
      from: 'Soullab Gifts <gifts@soullab.life>',
      replyTo: 'kelly@soullab.life',
      to: recipientEmail,
      subject,
      html: generateGiftEmailHtml(recipientName, passkey, gifterName, personalMessage),
      text: generateGiftEmailText(recipientName, passkey, gifterName, personalMessage),
      idempotencyKey: `invite:gift:${passkey}`,
      tags: [
        { name: 'campaign', value: 'gift-passkey' },
        { name: 'type', value: 'invitation' }
      ]
    });

    // The provider REFUSES by resolving, not by throwing. The previous code
    // returned `{ success: true }` unconditionally, so a quota refusal was
    // recorded as a delivered gift and the recipient was never told.
    if (!result.success) {
      console.error(
        `❌ Gift email refused for ${recipientName}: failureKind=${result.failureKind ?? 'unclassified'} providerCode=${result.providerCode ?? 'unnamed'}`
      );
      return { success: false, error: result.error };
    }

    console.log(`✨ Gift email sent to ${recipientName}:`, result.id);
    return { success: true, id: result.id };

  } catch (error: any) {
    console.error(`❌ Failed to send gift email to ${recipientEmail}:`, error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    return { success: false, error: error.message || String(error) };
  }
}

// PATCH: Resend gift email
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { passkey, adminSecret } = body;

    if (!validateAdminSecret(adminSecret)) {
      return NextResponse.json(
        { error: 'Unauthorized - invalid or missing admin secret' },
        { status: 401 }
      );
    }

    if (!passkey) {
      return NextResponse.json(
        { error: 'Passkey is required' },
        { status: 400 }
      );
    }

    // Get the gift record
    const result = await query(
      `SELECT passkey, recipient_name, recipient_email, gifter_name, personal_message
       FROM gift_passkeys WHERE passkey = $1`,
      [passkey]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Gift not found' },
        { status: 404 }
      );
    }

    const gift = result.rows[0];

    // Resend the email
    const emailResult = await sendGiftEmail(
      gift.passkey,
      gift.recipient_name,
      gift.recipient_email,
      gift.gifter_name,
      gift.personal_message
    );

    // Update email_sent_at if successful
    if (emailResult.success) {
      await query(
        'UPDATE gift_passkeys SET email_sent_at = NOW() WHERE passkey = $1',
        [passkey]
      );
    }

    return NextResponse.json({
      success: true,
      emailSent: emailResult.success,
      emailId: emailResult.id,
      emailError: emailResult.error
    });

  } catch (error: any) {
    console.error('Gift resend error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to resend gift' },
      { status: 500 }
    );
  }
}

// GET: List all gift passkeys
export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const { searchParams } = new URL(request.url);
    const adminSecret = searchParams.get('adminSecret');

    if (!validateAdminSecret(adminSecret)) {
      return NextResponse.json(
        { error: 'Unauthorized - invalid or missing admin secret' },
        { status: 401 }
      );
    }

    const result = await query(
      `SELECT
        id, passkey, recipient_name, recipient_email,
        gifter_name, email_sent_at, redeemed_at, created_at
       FROM gift_passkeys
       ORDER BY created_at DESC
       LIMIT 100`
    );

    return NextResponse.json({
      success: true,
      gifts: result.rows
    });

  } catch (error: any) {
    console.error('Gift list error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list gifts' },
      { status: 500 }
    );
  }
}
