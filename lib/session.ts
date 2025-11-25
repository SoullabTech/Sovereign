import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

export interface Session {
  id: string;
  userId: string;
  createdAt: number;
  lastActivity: number;
}

export async function getSession(request: NextRequest): Promise<Session> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session');

  if (sessionCookie) {
    try {
      return JSON.parse(sessionCookie.value);
    } catch (e) {
      // Invalid session cookie
    }
  }

  // Create new session with proper UUIDs for Supabase compatibility
  const session: Session = {
    id: randomUUID(),
    userId: randomUUID(),
    createdAt: Date.now(),
    lastActivity: Date.now()
  };

  return session;
}

export function createSessionCookie(session: Session): string {
  return JSON.stringify(session);
}