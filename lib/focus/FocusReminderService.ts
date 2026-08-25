/**
 * FOCUS REMINDER SERVICE
 *
 * Sends reminder emails via Resend for the focus tools.
 * Handles follow-up reminders, start-time nudges, and check-ins.
 *
 * Philosophy: Gentle nudges, not nagging. Support, not surveillance.
 */

import { sendEmail } from '@/lib/email/sendEmail';
import { FocusScheduler, type FocusReminder } from './FocusScheduler';

// ============================================================================
// Configuration
// ============================================================================

const FROM_EMAIL = 'MAIA <maia@soullab.life>';
const FROM_NAME = 'MAIA';

// ============================================================================
// Email Templates
// ============================================================================

interface ReminderEmailData {
  reminder: FocusReminder;
  recipientEmail: string;
  recipientName?: string;
}

/**
 * Generate email content based on reminder type
 */
function generateEmailContent(reminder: FocusReminder): {
  subject: string;
  html: string;
  text: string;
} {
  switch (reminder.reminder_type) {
    case 'follow_up':
      return generateFollowUpEmail(reminder);
    case 'start':
      return generateStartReminderEmail(reminder);
    case 'check_in':
      return generateCheckInEmail(reminder);
    default:
      return generateGenericReminderEmail(reminder);
  }
}

/**
 * Follow-up reminder email (for Avoidance Breaker)
 */
function generateFollowUpEmail(reminder: FocusReminder): {
  subject: string;
  html: string;
  text: string;
} {
  const recipient = reminder.recipient || 'them';

  return {
    subject: `Gentle nudge: Follow up with ${recipient}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1A2F24, #2C5530); padding: 24px; border-radius: 12px; margin-bottom: 24px;">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 20px; font-weight: 500;">
            Time to follow up with ${recipient}
          </h1>
        </div>

        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          You asked me to remind you to check in on this:
        </p>

        <div style="background: #F5F5F5; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2C5530;">
          <p style="color: #666; margin: 0; font-style: italic;">
            "${reminder.message}"
          </p>
        </div>

        ${reminder.original_message ? `
        <details style="margin: 20px 0;">
          <summary style="color: #2C5530; cursor: pointer; font-weight: 500;">
            View your original message
          </summary>
          <div style="background: #FAFAFA; padding: 12px; border-radius: 8px; margin-top: 8px;">
            <pre style="white-space: pre-wrap; font-family: inherit; margin: 0; color: #555;">
${reminder.original_message}
            </pre>
          </div>
        </details>
        ` : ''}

        <p style="color: #666; font-size: 14px; margin-top: 24px;">
          No pressure. Just keeping track for you.
        </p>

        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #EEE;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            This reminder was set by you using MAIA Focus.
          </p>
        </div>
      </div>
    `,
    text: `
Time to follow up with ${recipient}

You asked me to remind you:
"${reminder.message}"

${reminder.original_message ? `Your original message:\n${reminder.original_message}` : ''}

No pressure. Just keeping track for you.

- MAIA
    `.trim(),
  };
}

/**
 * Start reminder email (for scheduled tasks)
 */
function generateStartReminderEmail(reminder: FocusReminder): {
  subject: string;
  html: string;
  text: string;
} {
  return {
    subject: `Ready when you are: ${reminder.message.substring(0, 50)}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1A2F24, #2C5530); padding: 24px; border-radius: 12px; margin-bottom: 24px;">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 20px; font-weight: 500;">
            Time for your next step
          </h1>
        </div>

        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          You planned to start this now:
        </p>

        <div style="background: #F5F5F5; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2C5530;">
          <p style="color: #333; margin: 0; font-weight: 500;">
            ${reminder.message}
          </p>
        </div>

        <p style="color: #666; font-size: 14px;">
          Just the first tiny step. You've got this.
        </p>

        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #EEE;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            This reminder was set by you using MAIA Focus.
          </p>
        </div>
      </div>
    `,
    text: `
Time for your next step

You planned to start this now:
${reminder.message}

Just the first tiny step. You've got this.

- MAIA
    `.trim(),
  };
}

/**
 * Check-in reminder email
 */
function generateCheckInEmail(reminder: FocusReminder): {
  subject: string;
  html: string;
  text: string;
} {
  return {
    subject: `Checking in: How did it go?`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1A2F24, #2C5530); padding: 24px; border-radius: 12px; margin-bottom: 24px;">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 20px; font-weight: 500;">
            Quick check-in
          </h1>
        </div>

        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          You started working on this earlier. How did it go?
        </p>

        <div style="background: #F5F5F5; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2C5530;">
          <p style="color: #333; margin: 0;">
            ${reminder.message}
          </p>
        </div>

        <p style="color: #666; font-size: 14px;">
          If you finished, celebrate. If not, no judgment - just pick up the thread when you're ready.
        </p>

        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #EEE;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            This check-in was set by you using MAIA Focus.
          </p>
        </div>
      </div>
    `,
    text: `
Quick check-in

You started working on this earlier. How did it go?

${reminder.message}

If you finished, celebrate. If not, no judgment - just pick up the thread when you're ready.

- MAIA
    `.trim(),
  };
}

/**
 * Generic reminder email
 */
function generateGenericReminderEmail(reminder: FocusReminder): {
  subject: string;
  html: string;
  text: string;
} {
  return {
    subject: `Reminder: ${reminder.message.substring(0, 50)}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          ${reminder.message}
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">
          - MAIA
        </p>
      </div>
    `,
    text: reminder.message,
  };
}

// ============================================================================
// Service Class
// ============================================================================

export class FocusReminderService {
  // Provider configuration is no longer this service's concern: lib/email
  // owns it, and reports `not_configured` as a classified failure rather than
  // as a warning at construction time that nothing downstream could observe.

  /**
   * Send a single reminder email
   */
  async sendReminder(reminder: FocusReminder, recipientEmail: string): Promise<boolean> {
    const { subject, html, text } = generateEmailContent(reminder);

    try {
      const result = await sendEmail({
        purpose: 'reminder:focus',
        from: FROM_EMAIL,
        to: recipientEmail,
        subject,
        html,
        text,
        // Identifies a duplicate reminder in the logs. It does NOT suppress one
        // — that needs durable state this module does not have.
        idempotencyKey: `reminder:focus:${reminder.id}`,
      });

      if (result.success) {
        console.log(`[FocusReminder] Sent reminder ${reminder.id}`);
        // Marked delivered ONLY on provider acceptance — otherwise a refused
        // reminder is recorded as delivered and never retried.
        await FocusScheduler.markReminderDelivered(reminder.id);
        return true;
      }

      console.error(
        `[FocusReminder] Send REFUSED for ${reminder.id}: failureKind=${result.failureKind ?? 'unclassified'} providerCode=${result.providerCode ?? 'unnamed'}`
      );
      return false;
    } catch (error) {
      console.error('[FocusReminder] Send error:', error);
      return false;
    }
  }

  /**
   * Process all due reminders
   * Should be called by a cron job or scheduled task
   */
  async processDueReminders(getUserEmail: (userId: string) => Promise<string | null>): Promise<{
    processed: number;
    sent: number;
    failed: number;
  }> {
    const dueReminders = await FocusScheduler.getDueReminders();

    const results = {
      processed: dueReminders.length,
      sent: 0,
      failed: 0,
    };

    for (const reminder of dueReminders) {
      const email = await getUserEmail(reminder.user_id);

      if (!email) {
        console.warn(`[FocusReminder] No email for user ${reminder.user_id}`);
        results.failed++;
        continue;
      }

      const success = await this.sendReminder(reminder, email);
      if (success) {
        results.sent++;
      } else {
        results.failed++;
      }
    }

    console.log(`[FocusReminder] Processed ${results.processed} reminders: ${results.sent} sent, ${results.failed} failed`);
    return results;
  }

  /**
   * Send an immediate reminder (bypass scheduling)
   */
  async sendImmediateReminder(data: {
    userId: string;
    email: string;
    reminderType: 'follow_up' | 'start' | 'check_in';
    message: string;
    recipient?: string;
    originalMessage?: string;
  }): Promise<boolean> {
    // Create a virtual reminder object
    const reminder: FocusReminder = {
      id: 'immediate-' + Date.now(),
      user_id: data.userId,
      reminder_type: data.reminderType,
      message: data.message,
      scheduled_for: new Date(),
      delivery_channel: 'email',
      delivered: false,
      recipient: data.recipient,
      original_message: data.originalMessage,
      created_at: new Date(),
    };

    return this.sendReminder(reminder, data.email);
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const focusReminderService = new FocusReminderService();

export default focusReminderService;
