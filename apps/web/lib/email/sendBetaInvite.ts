import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}

export interface BetaInvite {
  name: string;
  email: string;
  betaCode?: string;
}

const templateConfig: Record<string, { subject: string; tag: string }> = {
  'beta-invitation': { subject: 'Your MAIA Beta Invitation', tag: 'invitation' },
  'beta-welcome': { subject: 'Welcome to MAIA Beta', tag: 'welcome' },
  'beta-day2-update': { subject: '🌀 Day 2: The Space Between Words', tag: 'day2-update' },
  'chapter-two-memory': { subject: '🌅 Chapter Two: The Mirror Remembers - Monday\'s Transformation', tag: 'chapter-two-memory' },
  'beta-week1-checkin': { subject: 'Week 1 with MAIA - How is it going?', tag: 'week1-checkin' },
  'beta-week2-celebration': { subject: '🌀 Week 2: Watch MAIA spiral into her next iteration', tag: 'week2-celebration' },
  'beta-week2-survey': { subject: 'MAIA Beta Feedback - Week 2', tag: 'week2-survey' },
  'beta-week3-group-call': { subject: 'Join Our Beta Group Call', tag: 'week3-group-call' },
  'beta-week4-closing': { subject: 'MAIA Beta - Final Reflections', tag: 'week4-closing' },
  'monday-oct21-modes-announcement': { subject: '🏜️ This Week in the Desert - The Handbook Has Arrived', tag: 'monday-oct21' },
};

export async function sendBetaInvite(invite: BetaInvite, template: string = 'beta-invitation') {
  try {
    const config = templateConfig[template] || templateConfig['beta-invitation'];
    const htmlTemplatePath = path.join(process.cwd(), 'public', 'email-templates', `${template}.html`);
    const textTemplatePath = path.join(process.cwd(), 'public', 'email-templates', `${template}.txt`);

    const htmlTemplate = fs.readFileSync(htmlTemplatePath, 'utf-8');
    let textTemplate = '';
    if (fs.existsSync(textTemplatePath)) {
      textTemplate = fs.readFileSync(textTemplatePath, 'utf-8');
    }

    const personalizedHtml = htmlTemplate
      .replace(/\{\{Name\}\}/g, invite.name)
      .replace(/\{\{BetaCode\}\}/g, invite.betaCode || '');
    const personalizedText = textTemplate
      ? textTemplate
          .replace(/\{\{Name\}\}/g, invite.name)
          .replace(/\{\{BetaCode\}\}/g, invite.betaCode || '')
      : '';

    const resend = getResendClient();
    const result = await resend.emails.send({
      from: 'Kelly @ Soullab <kelly@soullab.org>',
      to: invite.email,
      subject: config.subject,
      html: personalizedHtml,
      text: personalizedText,
      tags: [
        { name: 'campaign', value: 'beta-launch' },
        { name: 'type', value: config.tag }
      ]
    });

    console.log(`✅ Sent to ${invite.name} (${invite.email}):`, result.id);
    return { success: true, id: result.id };

  } catch (error: any) {
    console.error(`❌ Failed to send to ${invite.email}:`, error.message);
    return { success: false, error: error.message };
  }
}

export async function sendBatchInvites(invites: BetaInvite[], template: string = 'beta-invitation', delayMs: number = 0) {
  const config = templateConfig[template] || templateConfig['beta-invitation'];
  const htmlTemplatePath = path.join(process.cwd(), 'public', 'email-templates', `${template}.html`);
  const textTemplatePath = path.join(process.cwd(), 'public', 'email-templates', `${template}.txt`);

  const htmlTemplate = fs.readFileSync(htmlTemplatePath, 'utf-8');
  let textTemplate = '';
  if (fs.existsSync(textTemplatePath)) {
    textTemplate = fs.readFileSync(textTemplatePath, 'utf-8');
  }

  const resend = getResendClient();
  const results = [];

  // Use Resend's batch API (send all at once, up to 100 per batch)
  try {
    const batchData = invites.map(invite => ({
      from: 'Kelly @ Soullab <kelly@soullab.org>',
      to: invite.email,
      subject: config.subject,
      html: htmlTemplate
        .replace(/\{\{Name\}\}/g, invite.name)
        .replace(/\{\{BetaCode\}\}/g, invite.betaCode || ''),
      text: textTemplate
        ? textTemplate
            .replace(/\{\{Name\}\}/g, invite.name)
            .replace(/\{\{BetaCode\}\}/g, invite.betaCode || '')
        : '',
      tags: [
        { name: 'campaign', value: 'beta-launch' },
        { name: 'type', value: config.tag }
      ]
    }));

    // Resend batch API can handle up to 100 emails at once
    const batchResult = await resend.batch.send(batchData);

    console.log(`✅ Batch sent successfully:`, batchResult);

    // Map results back to invites
    invites.forEach((invite, index) => {
      results.push({
        ...invite,
        success: true,
        id: batchResult.data?.[index]?.id || 'batch-sent'
      });
    });

  } catch (error: any) {
    console.error(`❌ Batch send failed:`, error.message);

    // Fallback: send individually if batch fails
    console.log('Falling back to individual sends...');
    for (const invite of invites) {
      const result = await sendBetaInvite(invite, template);
      results.push({ ...invite, ...result });

      // Only add delay if specified and doing individual sends
      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
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