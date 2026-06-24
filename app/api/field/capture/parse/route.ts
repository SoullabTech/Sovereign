/**
 * Natural Language Capture — PARSE endpoint.
 *
 * PARSE ONLY. This route NEVER writes and NEVER creates objects. It maps raw member
 * language into candidate structured objects for the member to confirm. Creation
 * happens on a separate, explicit consent gesture, via existing writers
 * (calendar/events, focus/triage, field/records).
 *
 * Mirrors the studio/assist/ask invariant: "MAIA proposes, the human commits."
 */
import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { parseCapture } from '@/lib/studio/intent/parseCapture';

export async function POST(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const input =
    body && typeof body === 'object' && typeof (body as Record<string, unknown>).input === 'string'
      ? ((body as Record<string, unknown>).input as string).trim()
      : '';
  if (!input) {
    return NextResponse.json({ error: 'input required' }, { status: 400 });
  }

  const timezone =
    body && typeof body === 'object' && typeof (body as Record<string, unknown>).timezone === 'string'
      ? ((body as Record<string, unknown>).timezone as string)
      : 'UTC';

  try {
    const result = await parseCapture(input, { now: new Date().toISOString(), timezone });
    return NextResponse.json(result);
  } catch (err) {
    console.error('[field/capture/parse] parse failed', err);
    return NextResponse.json({ error: 'parse failed' }, { status: 500 });
  }
}
