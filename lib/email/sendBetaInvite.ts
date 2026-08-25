import { sendEmail } from './sendEmail';

/**
 * Sender for beta invitations.
 *
 * NOTE — deliberately left on `soullab.org`, the address this sender has always
 * used, rather than silently moved to the `soullab.life` identity in SENDERS.
 * If `soullab.org` is not a verified domain on the provider account these sends
 * fail as `provider_config` — which is now VISIBLE rather than swallowed. That
 * is a deliverability decision for an operator, not a drive-by edit.
 */
const BETA_INVITE_SENDER = 'Kelly @ Soullab <kelly@soullab.org>';

/** Ceiling on one batch. Exceeding it truncates loudly — never silently. */
const MAX_INVITES_PER_BATCH = 100;

/** Failures that mean EVERY remaining send in the batch would fail too. */
const TRANSPORT_WIDE_FAILURES = new Set<string>([
  'quota_exceeded', 'provider_auth', 'provider_config', 'not_configured',
]);
import fs from 'fs';
import path from 'path';

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

    const result = await sendEmail({
      purpose: 'invite:beta',
      from: BETA_INVITE_SENDER,
      to: invite.email,
      subject: config.subject,
      html: personalizedHtml,
      text: personalizedText,
      idempotencyKey: `invite:beta:${template}:${invite.email}`,
      tags: [
        { name: 'campaign', value: 'beta-launch' },
        { name: 'type', value: config.tag }
      ]
    });

    // The previous code read `result.id` off the raw SDK response — a field
    // that does not exist there (the id lives under `result.data.id`), so every
    // send reported `{ success: true, id: undefined }` and a refusal reported
    // success as well.
    if (!result.success) {
      console.error(
        `❌ Invite to ${invite.name} REFUSED: failureKind=${result.failureKind ?? 'unclassified'} providerCode=${result.providerCode ?? 'unnamed'}`
      );
      return { success: false, error: result.error, failureKind: result.failureKind };
    }

    console.log(`✅ Sent to ${invite.name}:`, result.id);
    return { success: true, id: result.id };

  } catch (error: any) {
    console.error(`❌ Failed to send to ${invite.email}:`, error.message);
    return { success: false, error: error.message, failureKind: 'exception' };
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

  const results: any[] = [];

  // Resend's batch API was used here and every invite in the batch was marked
  // `success: true` regardless of what came back — including a literal
  // 'batch-sent' placeholder id. One refused batch reported 100 delivered
  // invitations. Per-message sends cost more calls and are the only shape in
  // which a per-recipient refusal is visible at all.
  //
  // NO SILENT CAP: a batch larger than the ceiling is TRUNCATED AND SAID SO.
  const batch = invites.slice(0, MAX_INVITES_PER_BATCH);
  if (invites.length > batch.length) {
    console.warn(
      `[BetaInvite] batch of ${invites.length} exceeds MAX_INVITES_PER_BATCH=${MAX_INVITES_PER_BATCH}; ` +
        `sending ${batch.length}, DROPPING ${invites.length - batch.length}. Re-run for the remainder.`
    );
  }

  for (const invite of batch) {
    const result = await sendBetaInvite(invite, template);
    results.push({ ...invite, ...result });

    // A transport-wide refusal (quota, bad key, unverified sender) fails for
    // every remaining recipient too. Continuing burns the rest of the list
    // against a provider that is refusing everything.
    if (!result.success && TRANSPORT_WIDE_FAILURES.has(result.failureKind ?? '')) {
      console.error(
        `[BetaInvite] ABORTING batch — failureKind=${result.failureKind} is transport-wide; ` +
          `${batch.length - results.length} invite(s) not attempted.`
      );
      break;
    }

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