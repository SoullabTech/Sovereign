import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}

export interface BetaInviteWithPasscode {
  name: string;
  email: string;
  passcode: string;
}

const templateConfig: Record<string, { subject: string; tag: string }> = {
  'beta-invitation': { subject: 'Your MAIA Beta Invitation', tag: 'invitation' },
  'beta-welcome': { subject: 'Welcome to MAIA Beta - Your Access Code Inside', tag: 'welcome' },
  'beta-passcode': { subject: 'Your Soullab Access Code', tag: 'passcode' },
  'beta-week1-checkin': { subject: 'Week 1 with MAIA - How is it going?', tag: 'week1-checkin' },
  'beta-week2-survey': { subject: 'MAIA Beta Feedback - Week 2', tag: 'week2-survey' },
  'beta-week3-group-call': { subject: 'Join Our Beta Group Call', tag: 'week3-group-call' },
  'beta-week4-closing': { subject: 'MAIA Beta - Final Reflections', tag: 'week4-closing' },
};

export async function sendBetaInviteWithPasscode(
  invite: BetaInviteWithPasscode,
  template: string = 'beta-welcome'
) {
  try {
    const config = templateConfig[template] || templateConfig['beta-welcome'];
    const htmlTemplatePath = path.join(process.cwd(), 'public', 'email-templates', `${template}.html`);
    const textTemplatePath = path.join(process.cwd(), 'public', 'email-templates', `${template}.txt`);

    let htmlTemplate = '';
    let textTemplate = '';

    // Check if template exists, otherwise use a simple passcode template
    if (fs.existsSync(htmlTemplatePath)) {
      htmlTemplate = fs.readFileSync(htmlTemplatePath, 'utf-8');
      if (fs.existsSync(textTemplatePath)) {
        textTemplate = fs.readFileSync(textTemplatePath, 'utf-8');
      }
    } else {
      // If template doesn't exist, create a simple one
      htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .code-box {
              background: #f4f4f5;
              border: 2px solid #d4b896;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              font-size: 24px;
              font-weight: bold;
              color: #1a1f3a;
              margin: 30px 0;
              letter-spacing: 2px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Hi {{Name}}!</h2>
            <p>Your Soullab access code is:</p>
            <div class="code-box">{{Passcode}}</div>
            <p>Visit <a href="https://soullab.life">soullab.life</a> and enter this code when prompted.</p>
            <p>Ready for your journey to begin...</p>
            <p>With warmth,<br>Kelly & the Soullab team</p>
          </div>
        </body>
        </html>
      `;

      textTemplate = `
Hi {{Name}}!

Your Soullab access code is:
{{Passcode}}

Visit soullab.life and enter this code when prompted.

Ready for your journey to begin...

With warmth,
Kelly & the Soullab team
      `;
    }

    // Replace placeholders
    const personalizedHtml = htmlTemplate
      .replace(/\{\{Name\}\}/g, invite.name)
      .replace(/\{\{Passcode\}\}/g, invite.passcode);

    const personalizedText = textTemplate
      .replace(/\{\{Name\}\}/g, invite.name)
      .replace(/\{\{Passcode\}\}/g, invite.passcode);

    const resend = getResendClient();
    const result = await resend.emails.send({
      from: 'Kelly @ Soullab <onboarding@resend.dev>',  // Use Resend's verified domain for now
      to: invite.email,
      subject: config.subject,
      html: personalizedHtml,
      text: personalizedText,
      tags: [
        { name: 'campaign', value: 'beta-launch' },
        { name: 'type', value: config.tag }
      ]
    });

    console.log(`✅ Sent to ${invite.name} (${invite.email}) with passcode ${invite.passcode}:`, result.id);
    return { success: true, id: result.id };

  } catch (error: any) {
    console.error(`❌ Failed to send to ${invite.email}:`, error.message);
    return { success: false, error: error.message };
  }
}

export async function sendBatchInvitesWithPasscodes(
  invites: BetaInviteWithPasscode[],
  template: string = 'beta-welcome',
  delayMs: number = 2000
) {
  const results = [];

  for (const invite of invites) {
    const result = await sendBetaInviteWithPasscode(invite, template);
    results.push({ ...invite, ...result });

    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`\n📊 Batch complete: ${successful} sent, ${failed} failed`);

  return {
    total: invites.length,
    successful,
    failed,
    results
  };
}