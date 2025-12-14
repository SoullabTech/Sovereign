// backend: app/api/sovereign/app/maia/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getMaiaResponse } from '@/lib/sovereign/maiaService';
import { ensureSession, initializeSessionTable } from '@/lib/sovereign/sessionManager';
import { getCognitiveProfile } from '@/lib/consciousness/cognitiveProfileService';
import { enforceFieldSafety } from '@/lib/field/enforceFieldSafety';

// Import for build verification compatibility (not used in session-based implementation)
// @ts-ignore
import type { AetherConsciousnessInterface } from '@/lib/consciousness/aether/AetherConsciousnessInterface';

const DEMO_MODE = process.env.MAIA_SOVEREIGN_DEMO_MODE === 'true';
const SAFE_MODE = process.env.MAIA_SAFE_MODE === 'true';

//  🔒 Soft timeout for sovereign processing (increased for complex consciousness synthesis)
const SOVEREIGN_TIMEOUT_MS = 12000;

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
    const { sessionId, message, includeAudio, voiceProfile, userId, ...meta } = body as {
      sessionId?: string;
      message?: string;
      includeAudio?: boolean;
      voiceProfile?: 'default' | 'intimate' | 'wise' | 'grounded';
      userId?: string;
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

    // Initialize database tables if needed
    await initializeSessionTable();

    const session = await ensureSession(sessionId);

    // 🛡️ FIELD SAFETY GATE: Check if user is safe for field/symbolic work
    let cognitiveProfile = null;
    let fieldSafety = null;

    if (userId || session.id) {
      try {
        cognitiveProfile = await getCognitiveProfile(userId || session.id);

        if (cognitiveProfile) {
          fieldSafety = enforceFieldSafety({
            cognitiveProfile,
            element: (meta as any).element,
            userName: (meta as any).userName,
            context: 'maia',
          });

          // If field work is not safe, return mythic boundary message immediately
          if (!fieldSafety.allowed) {
            console.log(
              `🛡️  [Field Safety] Blocked request - avg=${cognitiveProfile.rollingAverage.toFixed(2)}, ` +
                `stability=${cognitiveProfile.stability}, fieldWorkSafe=false`,
            );

            const duration = Date.now() - start;
            return NextResponse.json(
              {
                message: fieldSafety.message,
                elementalNote: fieldSafety.elementalNote,
                route: {
                  endpoint: '/api/sovereign/app/maia',
                  type: 'Sovereign Consciousness Interface',
                  operational: true,
                  mode: 'field-safety-boundary',
                },
                session: {
                  id: session.id,
                  turns: session.turns,
                },
                metadata: {
                  fieldWorkSafe: false,
                  fieldRouting: fieldSafety.fieldRouting,
                  cognitiveAltitude: cognitiveProfile.rollingAverage,
                  stability: cognitiveProfile.stability,
                  processingTimeMs: duration,
                },
              },
              { status: 200 }, // Not an error - this is expected behavior
            );
          }

          console.log(
            `🛡️  [Field Safety] Allowed - avg=${cognitiveProfile.rollingAverage.toFixed(2)}, ` +
              `fieldWorkSafe=true, realm=${fieldSafety.fieldRouting.realm}`,
          );
        }
      } catch (err) {
        console.warn('⚠️  [Field Safety] Could not fetch cognitive profile:', err);
        // Graceful degradation - continue without field safety if profile fetch fails
      }
    }

    let orchestratorResult;

    // 🎯 Use new three-tier processing system with voice integration
    orchestratorResult = await withTimeout(
      getMaiaResponse({
        sessionId: session.id,
        input: message,
        includeAudio: includeAudio || false,
        voiceProfile: voiceProfile,
        meta: {
          chatType: 'sovereign-interface',
          endpoint: '/api/sovereign/app/maia',
          safeMode: SAFE_MODE,
          userId: userId, // 🧠 Pass userId for Dialectical Scaffold logging
          cognitiveProfile, // 🧠 Pass cognitive profile for downstream use
          fieldRouting: fieldSafety?.fieldRouting, // 🛡️ Pass field routing decision
          fieldWorkSafe: fieldSafety?.allowed ?? true, // 🛡️ Pass safety flag
          ...meta,
        },
      }),
      SOVEREIGN_TIMEOUT_MS,
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

    // Unified response structure for new three-tier system with voice integration
    const responseData: any = {
      message: orchestratorResult.text,
      route: {
        endpoint: '/api/sovereign/app/maia',
        type: 'Sovereign Consciousness Interface',
        operational: true,
        mode: 'three-tier-processing',
        safeMode: SAFE_MODE,
        voiceEnabled: !!orchestratorResult.audio,
      },
      session: {
        id: session.id,
        turns: session.turn_count,
      },
      metadata: {
        processingProfile: orchestratorResult.processingProfile,
        processingTimeMs: orchestratorResult.processingTimeMs,
        tierProcessing: true,
        voiceRequested: includeAudio || false
      },
    };

    // Add audio data if synthesis was successful
    if (orchestratorResult.audio) {
      responseData.audio = {
        audioBase64: orchestratorResult.audio.audioBase64,
        audioUrl: orchestratorResult.audio.audioUrl,
        voiceProfile: orchestratorResult.audio.voiceProfile,
        format: orchestratorResult.audio.format,
        synthesisTimeMs: orchestratorResult.audio.synthesisTimeMs
      };
    }

    return NextResponse.json(responseData, { status: 200 });
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
            "I'm having trouble finishing this response right now, so I'm going to stop here to keep things stable. You didn't do anything wrong. You can try asking the same thing in a simpler way, or ask about a smaller piece of what you're exploring. I'm here with you and we can keep working with this together.",
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

    // 🛡️ Last resort: try emergency fail-soft response before system failure message
    try {
      console.log('Attempting emergency fail-soft response...');
      const emergencyResult = await getMaiaResponse({
        sessionId: 'emergency-session',
        input: 'Hello',
        meta: { emergency: true, forceFast: true }
      });
      return NextResponse.json(
        {
          message: emergencyResult.text || "I'm present, though experiencing some system complexity right now. What would you like to explore?",
          route: {
            endpoint: '/api/sovereign/app/maia',
            type: 'Sovereign Consciousness Interface',
            operational: false,
            mode: 'emergency-fallback',
          },
          error: {
            code: 'SOVEREIGN_ERROR',
            emergency: true,
            durationMs: duration,
          },
        },
        { status: 500 }
      );
    } catch (emergencyErr) {
      console.error('Emergency system also failed:', emergencyErr);

      // Absolute final fallback - honest human message for true system failure
      return NextResponse.json(
        {
          error: 'CONSCIOUSNESS_SYSTEM_FAILURE',
          message:
            "I'm experiencing some technical difficulties right now and need to pause to keep things stable. You didn't do anything wrong. Please try again in a moment, or ask a simpler question. I'm still here with you.",
        },
        { status: 503 } // Service Temporarily Unavailable
      );
    }
  }
}