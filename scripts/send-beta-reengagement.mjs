/**
 * Beta re-engagement email send
 * Two versions: fully onboarded (44) and partially onboarded (10)
 * Run: node scripts/send-beta-reengagement.mjs
 */

import { Resend } from 'resend';
import pg from 'pg';

const resend = new Resend(process.env.RESEND_API_KEY);
const db = new pg.Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://soullab@localhost:5432/maia_consciousness' });

const onboardedEmail = (name) => ({
  subject: "You're back in the room",
  html: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; color: #2d3748;">
  <p style="font-size: 16px; line-height: 1.7; margin-bottom: 20px;">Hey ${name},</p>
  <p style="font-size: 16px; line-height: 1.7; margin-bottom: 20px;">Getting in has been harder than it should have been. I'm sorry for that — but I've finally fixed it, properly and securely. Such a simple thing, and it's taken too long to get right. It's right now.</p>
  <p style="font-size: 16px; line-height: 1.7; margin-bottom: 24px;">Head to <a href="https://soullab.life/begin" style="color: #2C5530; font-weight: 600;">soullab.life/begin</a>, enter your email and password, and you're in. If your old password doesn't work, set a new one right there — no leaving the page.</p>
  <p style="font-size: 16px; line-height: 1.7; margin-bottom: 20px;">We're in the final stretch of beta before we open to the public on <strong>May 1st</strong>. Full access to everything — Studio, Lab tools, Capture, and more — as long as you're engaging. And when we close beta, you'll have the chance to bring someone in with you.</p>
  <p style="font-size: 16px; line-height: 1.7; margin-bottom: 20px;">Text me if anything gets in the way. <strong>504-453-9009</strong>.</p>
  <p style="font-size: 16px; line-height: 1.7; margin-bottom: 0;">Good to have you back.<br><br>Kelly</p>
</div>`,
  text: `Hey ${name},

Getting in has been harder than it should have been. I'm sorry for that — but I've finally fixed it, properly and securely. Such a simple thing, and it's taken too long to get right. It's right now.

Head to soullab.life/begin, enter your email and password, and you're in. If your old password doesn't work, set a new one right there — no leaving the page.

We're in the final stretch of beta before we open to the public on May 1st. Full access to everything — Studio, Lab tools, Capture, and more — as long as you're engaging. And when we close beta, you'll have the chance to bring someone in with you.

Text me if anything gets in the way. 504-453-9009.

Good to have you back.
Kelly`
});

const partialEmail = (name) => ({
  subject: "Come in through the new door",
  html: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; color: #2d3748;">
  <p style="font-size: 16px; line-height: 1.7; margin-bottom: 20px;">Hey ${name},</p>
  <p style="font-size: 16px; line-height: 1.7; margin-bottom: 20px;">You started the journey and the door didn't cooperate — that's on me, and I'm sorry. I've finally fixed it, properly and securely. Such a simple thing that took too long to get right. It's right now.</p>
  <p style="font-size: 16px; line-height: 1.7; margin-bottom: 24px;">Skip everything that used to get in the way. Go straight to <a href="https://soullab.life/begin" style="color: #2C5530; font-weight: 600;">soullab.life/begin</a>, enter your email and create a password. You're in — clean, simple, no hoops.</p>
  <p style="font-size: 16px; line-height: 1.7; margin-bottom: 20px;">We close beta and open to the public <strong>May 1st</strong>. Get in now, explore what we've built — Studio, Lab tools, Capture — and when we cross that threshold, you'll have the chance to bring someone in with you.</p>
  <p style="font-size: 16px; line-height: 1.7; margin-bottom: 20px;">Anything doesn't work, text me directly. <strong>504-453-9009</strong>.</p>
  <p style="font-size: 16px; line-height: 1.7; margin-bottom: 0;">See you inside.<br><br>Kelly</p>
</div>`,
  text: `Hey ${name},

You started the journey and the door didn't cooperate — that's on me, and I'm sorry. I've finally fixed it, properly and securely. Such a simple thing that took too long to get right. It's right now.

Skip everything that used to get in the way. Go straight to soullab.life/begin, enter your email and create a password. You're in — clean, simple, no hoops.

We close beta and open to the public May 1st. Get in now, explore what we've built — Studio, Lab tools, Capture — and when we cross that threshold, you'll have the chance to bring someone in with you.

Anything doesn't work, text me directly. 504-453-9009.

See you inside.
Kelly`
});

async function send() {
  const { rows } = await db.query(`
    SELECT name, preferred_name, email, onboarded
    FROM members
    WHERE email IS NOT NULL AND email != ''
    ORDER BY created_at ASC
  `);

  console.log(`Sending to ${rows.length} members...`);
  let sent = 0, skipped = 0;

  for (const member of rows) {
    const displayName = member.preferred_name || member.name || 'friend';
    const template = member.onboarded ? onboardedEmail(displayName) : partialEmail(displayName);

    try {
      await resend.emails.send({
        from: 'Kelly at Soullab <kelly@soullab.life>',
        to: member.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
      console.log(`✓ ${member.email} (${member.onboarded ? 'onboarded' : 'partial'})`);
      sent++;
      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      console.error(`✗ ${member.email}: ${err.message}`);
      skipped++;
    }
  }

  console.log(`\nDone. Sent: ${sent}, Failed: ${skipped}`);
  await db.end();
}

send().catch(err => { console.error(err); process.exit(1); });
