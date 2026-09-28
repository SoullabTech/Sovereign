import { NextRequest } from 'next/server';

export type BecomingMaiaMode = 'guide' | 'temporal' | 'continuity';

type ConversationTurn = {
  role: 'user' | 'assistant';
  content: string;
};

const MAX_MESSAGE = 120_000;
const MAX_HISTORY = 24;
const MAX_SESSION = 240;

function validHistory(value: unknown): value is ConversationTurn[] {
  return Array.isArray(value)
    && value.length <= MAX_HISTORY
    && value.every(turn =>
      turn
      && typeof turn === 'object'
      && ((turn as ConversationTurn).role === 'user' || (turn as ConversationTurn).role === 'assistant')
      && typeof (turn as ConversationTurn).content === 'string'
      && (turn as ConversationTurn).content.length <= MAX_MESSAGE
    );
}
function expectedHeader(mode: BecomingMaiaMode): [string, string] {
  if (mode === 'guide') return ['x-becoming-guide', '1'];
  if (mode === 'temporal') return ['x-becoming-temporal', '1'];
  return ['x-becoming-explicit-handoff', '1'];
}

function error(status: number, message: string) {
  return Response.json({ error: message }, {
    status,
    headers: {
      'Cache-Control': 'private, no-store, max-age=0',
      Vary: 'Cookie, x-session-token',
    },
  });
}

export async function proxyBecomingMaia(request: NextRequest, mode: BecomingMaiaMode): Promise<Response> {
  const [header, expected] = expectedHeader(mode);
  if (request.headers.get(header) !== expected) return error(403, 'Explicit Becoming act required.');

  const input = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!input) return error(400, 'Invalid JSON.');

  const message = typeof input.message === 'string' ? input.message.trim() : '';
  const sessionId = typeof input.sessionId === 'string' ? input.sessionId.trim() : '';
  const journeyId = typeof input.journeyId === 'string' ? input.journeyId.trim() : '';
  const history = input.conversationHistory ?? [];
  if (!message || message.length > MAX_MESSAGE) return error(400, 'Invalid message.');
  if (!sessionId || sessionId.length > MAX_SESSION || !/^[A-Za-z0-9-]+$/.test(sessionId)) {
    return error(400, 'Invalid session id.');
  }
  if (journeyId.length > 100) return error(400, 'Invalid journey id.');
  if (!validHistory(history)) return error(400, 'Invalid conversation history.');
  if (mode === 'guide' && history.length !== 0) return error(400, 'Guide history is not accepted.');

  const sanctuary = mode !== 'continuity';
  const memoryMode = mode === 'continuity' ? 'continuity' : 'ephemeral';
  const target = new URL('/api/sovereign/app/maia/list', request.url);

  const headers = new Headers({ 'Content-Type': 'application/json' });
  const cookie = request.headers.get('cookie');
  const token = request.headers.get('x-session-token');
  if (cookie) headers.set('cookie', cookie);
  if (token) headers.set('x-session-token', token);

  const upstream = await fetch(target, {
    method: 'POST',
    headers,
    cache: 'no-store',
    body: JSON.stringify({
      message,
      sessionId,
      timezone: 'UTC',
      includeAudio: false,
      sanctuary,
      memoryMode,
      conversationHistory: mode === 'guide' ? [] : history,
      surface: 'maia',
      mode: 'dialogue',
      fieldState: { active: true, depth: 0.7, quality: 'present' },
      becomingMode: mode,
      becomingJourneyId: journeyId || undefined,
    }),
  });

  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('content-type') || 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0',
      Vary: 'Cookie, x-session-token',
    },
  });
}
