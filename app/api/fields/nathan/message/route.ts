import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/sendEmail';

const FOUNDER_EMAIL = process.env.FOUNDER_EMAIL ?? 'kelly@soullab.life';
const FROM_ADDRESS = 'Nathan\'s Field <noreply@soullab.life>';

export async function POST(req: Request) {

  try {
    const body = await req.json() as {
      subject?: string;
      body: string;
      category: string;
    };

    if (!body.body?.trim()) {
      return NextResponse.json({ error: 'Message body required' }, { status: 400 });
    }

    const subject = `[Nathan's Field] ${body.category.charAt(0).toUpperCase() + body.category.slice(1)}: ${body.subject?.trim() || 'New message'}`;

    const emailBody = `
<div style="font-family: DM Sans, sans-serif; max-width: 600px; margin: 0 auto; color: #1A140E;">
  <div style="background: #1A140E; padding: 24px 28px; border-radius: 8px 8px 0 0;">
    <p style="color: #B08060; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 6px;">
      Nathan&apos;s Field
    </p>
    <h2 style="color: #E8DDD0; font-size: 18px; font-weight: 400; margin: 0;">
      ${body.category.charAt(0).toUpperCase() + body.category.slice(1)}
      ${body.subject ? `: ${body.subject}` : ''}
    </h2>
  </div>
  <div style="background: #F7F3EC; padding: 28px; border-radius: 0 0 8px 8px;">
    <div style="white-space: pre-wrap; font-size: 15px; line-height: 1.7; color: #2A2318;">
${body.body.trim()}
    </div>
    <hr style="border: none; border-top: 1px solid #E0D8D0; margin: 24px 0;" />
    <p style="font-size: 12px; color: #9A8F80; margin: 0;">
      Sent from <a href="https://nathan.soullab.life/studio" style="color: #B08060;">nathan.soullab.life/studio</a>
    </p>
  </div>
</div>
    `.trim();

    const sent = await sendEmail({
      purpose: 'notify:field-message',
      from: FROM_ADDRESS,
      to: FOUNDER_EMAIL,
      subject,
      html: emailBody,
      text: `[${body.category}] ${body.subject ?? ''}\n\n${body.body.trim()}\n\n---\nSent from nathan.soullab.life/studio`,
    });

    // sendEmail never throws, so an un-inspected result would return ok:true for
    // mail the provider refused — the exact bug this lane exists to remove.
    if (!sent.success) {
      console.error(
        `[Nathan Studio] message REFUSED failureKind=${sent.failureKind ?? 'unclassified'} providerCode=${sent.providerCode ?? 'unnamed'} retryable=${sent.retryable === true}`
      );
      return NextResponse.json(
        {
          error: sent.retryable
            ? 'Could not send that just now. Please try again shortly.'
            : 'Could not send that message. Please reach out another way.',
          retryable: sent.retryable === true,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Nathan Studio] message send error:', err);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
