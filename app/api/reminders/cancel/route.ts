/**
 * GET  /api/reminders/cancel?t=<token>  — CONFIRM (never cancels)
 * POST /api/reminders/cancel            — CANCEL
 *
 * The stop control reachable from inside a delivered message (ruling §8.8).
 *
 * WHY GET DOES NOT CANCEL: mail scanners, link previewers, and corporate
 * security proxies visit URLs automatically. A GET that cancelled would let a
 * scanner silently destroy the member's instruction without them ever seeing
 * the message. So GET renders a confirmation carrying a form; the POST performs
 * the cancellation. Spec §6.1.
 *
 * The capability is CANCEL-ONLY. Neither verb ever discloses delivery_text, the
 * schedule, or any other reminder — lookup is by hash of the presented token,
 * and nothing about the row is returned. A leaked token costs the member
 * nothing beyond a cancellation they can simply re-create.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { hashCancelToken } from '@/lib/reminders/cancelToken';
import { cancelIfNotDispatching } from '@/lib/reminders/dispatch';

function page(title: string, body: string, formToken?: string): NextResponse {
  const form = formToken
    ? `<form method="POST" action="/api/reminders/cancel">
         <input type="hidden" name="t" value="${escapeHtml(formToken)}" />
         <button type="submit">Cancel this reminder</button>
       </form>`
    : '';
  return new NextResponse(
    `<!doctype html><meta charset="utf-8" />
     <meta name="viewport" content="width=device-width,initial-scale=1" />
     <title>${escapeHtml(title)}</title>
     <style>
       body{font:16px/1.6 system-ui,sans-serif;max-width:32rem;margin:6rem auto;padding:0 1.5rem;color:#2b2b2b}
       button{font:inherit;padding:.6rem 1.1rem;border:1px solid #b9a06a;background:#fff;border-radius:.4rem;cursor:pointer}
     </style>
     <h1>${escapeHtml(title)}</h1><p>${body}</p>${form}`,
    { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } },
  ) as NextResponse;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string,
  );
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('t');
  if (!token) {
    return page('Nothing to cancel', 'This link is missing its token.');
  }
  // Deliberately does NOT reveal whether the token matches anything. The
  // confirmation is identical either way; only the POST has an effect.
  return page(
    'Cancel this reminder?',
    'This will stop the scheduled message you asked us to send you. You can always set another one.',
    token,
  );
}

export async function POST(request: NextRequest) {
  let token: string | null = null;

  const contentType = request.headers.get('content-type') ?? '';
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const form = await request.formData();
    const value = form.get('t');
    token = typeof value === 'string' ? value : null;
  } else {
    try {
      const body = (await request.json()) as Record<string, unknown>;
      token = typeof body?.t === 'string' ? body.t : null;
    } catch {
      token = null;
    }
  }

  if (!token) {
    return page('Nothing to cancel', 'This link is missing its token.');
  }

  // Lookup is by hash: the token itself is never stored, so a database read
  // cannot reconstruct a working link. Conditional on dispatch not having
  // begun — see lib/reminders/dispatch.ts.
  const result = await cancelIfNotDispatching({ cancelTokenHash: hashCancelToken(token) });

  if (result === 'already_sending') {
    // Truthful. We do not pretend an email can be recalled once its send began.
    return page(
      'Already on its way',
      'This one had already started sending when your cancellation reached us, so it could not be stopped. Nothing else is scheduled because of it.',
    );
  }

  // 'cancelled' and 'not_found' return the SAME page: an unmatched token must
  // not be distinguishable from a matched one, and nothing about the row is
  // disclosed either way.
  return page(
    'Cancelled',
    'That reminder will not be sent. Nothing here is keeping count — come back when you come back.',
  );
}
