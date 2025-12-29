// backend: app/api/bardic/capture-episode/route.ts
import { NextResponse } from 'next/server';

import { getConversationMemory, type CrystallizationDetection } from '@/lib/memory/bardic/ConversationMemoryIntegration';

type CaptureEpisodeBody = {
  userId: string;
  sessionId: string;
  userMessage: string;
  assistantResponse: string;
  crystallization: CrystallizationDetection;

  // optional context enrichers
  currentCoherence?: number; // 0..1
  currentAffect?: { valence: number; arousal: number };
  placeCue?: string;
  senseCues?: string[];

  // IMPORTANT: only send this when user explicitly finalizes a holoflower reading
  holoflowerReading?: any; // keep loose for now unless you want strict typing here
};

function isNumber(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n);
}

function isString(s: unknown): s is string {
  return typeof s === 'string' && s.length > 0;
}

function isCrystallization(x: any): x is CrystallizationDetection {
  return (
    x &&
    typeof x === 'object' &&
    typeof x.isCrystallizing === 'boolean' &&
    typeof x.shouldCapture === 'boolean' &&
    isNumber(x.fireAirAlignment) &&
    (x.suggestedStanza === undefined || typeof x.suggestedStanza === 'string')
  );
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<CaptureEpisodeBody>;

    if (
      !isString(body.userId) ||
      !isString(body.sessionId) ||
      !isString(body.userMessage) ||
      !isString(body.assistantResponse) ||
      !isCrystallization(body.crystallization)
    ) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // ✅ PATCH C: Bulletproof boolean check (accept both shouldCapture and isCrystallizing)
    const shouldCapture =
      (body.crystallization as any).shouldCapture ?? body.crystallization.isCrystallizing;

    // Enforce: "one event = one save"
    if (!shouldCapture) {
      return NextResponse.json({ episodeId: null, skipped: true });
    }

    const context = {
      userId: body.userId,
      sessionId: body.sessionId,
      currentCoherence: body.currentCoherence,
      currentAffect: body.currentAffect,
      placeCue: body.placeCue,
      senseCues: body.senseCues,
      // only present when you explicitly set it on Finalize
      holoflowerReading: body.holoflowerReading,
    };

    const conversationMemory = getConversationMemory();
    const episodeId = await conversationMemory.captureEpisode(
      context,
      body.userMessage,
      body.assistantResponse,
      body.crystallization
    );

    return NextResponse.json({ episodeId });
  } catch (err) {
    console.error('[bardic/capture-episode] Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
