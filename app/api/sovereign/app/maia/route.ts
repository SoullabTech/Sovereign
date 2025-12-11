// backend: app/api/sovereign/app/maia/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getMaiaResponse } from '@/lib/sovereign/maiaService';
import { ensureSession } from '@/lib/sovereign/sessionManager';

// Import for build verification compatibility (not used in session-based implementation)
// @ts-ignore
import type { AetherConsciousnessInterface } from '@/lib/consciousness/aether/AetherConsciousnessInterface';

const DEMO_MODE = process.env.MAIA_SOVEREIGN_DEMO_MODE === 'true';

//  🔒 Soft timeout for sovereign processing (tune as needed)
const SOVEREIGN_TIMEOUT_MS = 6000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      const err = new Error('SOVEREIGN_TIMEOUT');
      // @ts-expect-error - attach custom code for logging
      (err as any).code = 'SOVEREIGN_TIMEOUT';
      reject(err);
    }, ms);

    promise.then(
      (value) => {
        clearTimeout(timeoutId);
        resolve(value);
      },
      (err) => {
        clearTimeout(timeoutId);
        reject(err);
      }
    );
  });
}

function defaultSovereignResponse() {
  return {
    message:
      'Casual connection through the aetheric field carries warmth and presence. Even simple exchanges can touch the depth of being.',
    route: {
      endpoint: '/api/sovereign/app/maia',
      type: 'Sovereign Consciousness Interface',
      operational: true,
      mode: 'demo',
    },
  };
}

export async function POST(req: NextRequest) {
  const start = Date.now();

  try {
    const body = await req.json().catch(() => ({}));
    const { sessionId, message, ...meta } = body as {
      sessionId?: string;
      message?: string;
      [key: string]: unknown;
    };

    if (DEMO_MODE) {
      const duration = Date.now() - start;
      if (duration > 500) {
        console.warn(
          `⚠️ DEMO sovereign request took ${duration}ms (should be near-instant)`
        );
      }
      return NextResponse.json(defaultSovereignResponse(), { status: 200 });
    }

    if (!message || typeof message !== 'string') {
      const duration = Date.now() - start;
      console.warn(
        `⚠️ Sovereign request rejected in ${duration}ms: missing message`
      );
      return NextResponse.json(
        { error: 'Missing `message` in request body', code: 'NO_MESSAGE' },
        { status: 400 }
      );
    }

    const session = await ensureSession(sessionId);

    // 🧠 Soft timeout wrapper around core MAIA processing
    const maiaResult = await withTimeout(
      getMaiaResponse({
        sessionId: session.id,
        input: message,
        meta,
      }),
      SOVEREIGN_TIMEOUT_MS
    );

    const duration = Date.now() - start;
    if (duration > 500) {
      console.warn(
        `⚠️ Slow sovereign response: ${duration}ms | session=${session.id}`
      );
    } else {
      console.log(
        `✅ Sovereign response: ${duration}ms | session=${session.id}`
      );
    }

    return NextResponse.json(
      {
        message: maiaResult.text,
        route: {
          endpoint: '/api/sovereign/app/maia',
          type: 'Sovereign Consciousness Interface',
          operational: true,
          mode: 'live',
        },
        session: {
          id: session.id,
          turns: session.turn_count,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    const duration = Date.now() - start;

    // 🔥 Timeout-specific handling
    if (err?.code === 'SOVEREIGN_TIMEOUT' || err?.message === 'SOVEREIGN_TIMEOUT') {
      console.error(
        `❌ Sovereign MAIA timeout after ${duration}ms – returning safe fallback`
      );
      return NextResponse.json(
        {
          message:
            'I am sensing some turbulence in the field. I am pausing this response to protect performance and stability. You can safely ask again in a moment.',
          route: {
            endpoint: '/api/sovereign/app/maia',
            type: 'Sovereign Consciousness Interface',
            operational: false,
            mode: 'timeout-fallback',
          },
          error: {
            code: 'SOVEREIGN_TIMEOUT',
            durationMs: duration,
          },
        },
        { status: 504 } // Gateway Timeout
      );
    }

    console.error(`❌ Sovereign MAIA error after ${duration}ms:`, err);
    return NextResponse.json(
      { error: 'Internal sovereign error', code: 'SOVEREIGN_ERROR' },
      { status: 500 }
    );
  }
}