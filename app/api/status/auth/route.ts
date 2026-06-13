import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { password?: string };
  const password = body.password ?? '';
  const expected = process.env.STATUS_PAGE_PASSWORD;

  if (!expected || password !== expected) {
    return NextResponse.json({ error: 'wrong password' }, { status: 401 });
  }

  const hash = createHash('sha256').update(password).digest('hex');
  const response = NextResponse.json({ ok: true });
  response.cookies.set('status_session', hash, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: true,
  });
  return response;
}
