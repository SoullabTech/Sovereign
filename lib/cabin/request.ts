import 'server-only';

import { NextResponse } from 'next/server';
import { CabinLocalStore, type CabinMember } from './localStore';

export const CABIN_SESSION_COOKIE = 'maia_cabin_session';

export function cabinStore(): CabinLocalStore {
  const dataPath = process.env.MAIA_CABIN_DATA_PATH;
  if (!dataPath) throw new Error('CABIN_DATA_UNAVAILABLE');
  return new CabinLocalStore(dataPath);
}

export function cabinMemberFromRequest(
  store: CabinLocalStore,
  request: { cookies: { get(name: string): { value: string } | undefined } },
): { member: CabinMember; issuedToken: string | null } {
  const incoming = request.cookies.get(CABIN_SESSION_COOKIE)?.value || null;
  const existing = store.resolveSession(incoming);

  if (existing) {
    return { member: existing, issuedToken: null };
  }

  const member = store.ensureLocalMember();
  return {
    member,
    issuedToken: store.issueSession(member.id),
  };
}

export function setCabinSessionCookie(
  response: NextResponse,
  token: string | null,
): void {
  if (!token) return;

  response.cookies.set(CABIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 60 * 60 * 24 * 365 * 5,
  });
}
