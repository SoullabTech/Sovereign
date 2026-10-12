/**
 * EMAIL ROUTER
 * ============
 * Practitioner email is delivered through Soullab's managed sovereign SMTP path.
 * There is one transport contract and no practitioner-supplied vendor credential.
 */

import { sendEmail } from '@/lib/email/sendEmail';

export interface EmailPayload {
  to: string;
  toName?: string;
  subject: string;
  bodyHtml?: string;
  bodyText: string;
  replyTo?: string;
  tags?: Array<{ name: string; value: string }>;
}

export interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
  provider: 'managed';
}
export class EmailRouter {
  constructor(private practitionerId: string) {}

  async send(
    payload: EmailPayload,
    defaults: {
      fromEmail: string;
      fromName: string;
      replyTo?: string;
    }
  ): Promise<EmailResult> {
    const from = `${defaults.fromName} <${defaults.fromEmail}>`;
    const result = await sendEmail({
      purpose: 'practitioner:email',
      triggerType: 'route',
      triggerRef: 'lib/comms/emailRouter.ts',
      from,
      to: payload.toName ? `${payload.toName} <${payload.to}>` : payload.to,
      subject: payload.subject,
      html: payload.bodyHtml,
      text: payload.bodyText,
      replyTo: payload.replyTo || defaults.replyTo,
      tags: payload.tags,
      metadata: { practitioner: 'managed' },
    });

    if (!result.success) {
      console.error(
        `[EmailRouter] managed SMTP refused send practitioner=${this.practitionerId} failureKind=${result.failureKind ?? 'unclassified'}`
      );
      return { success: false, error: result.error, provider: 'managed' };
    }

    return { success: true, id: result.id, provider: 'managed' };
  }
}
export async function sendPractitionerEmail(
  practitionerId: string,
  payload: EmailPayload,
  defaults: {
    fromEmail: string;
    fromName: string;
    replyTo?: string;
  }
): Promise<EmailResult> {
  return new EmailRouter(practitionerId).send(payload, defaults);
}
