// @ts-nocheck - Prototype file, not type-checked
export const dynamic = 'force-dynamic';
// backend: app/api/sovereign/app/maia/route.ts

/**
 * ROUTING INVARIANT:
 * Set originRoute + (optional) processingProfileOverride HERE at the HTTP boundary.
 * Do not infer these deeper in the stack.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getMaiaResponse } from '@/lib/sovereign/maiaService';
import { ensureSession, initializeSessionTable } from '@/lib/sovereign/sessionManager';
import { ensureSchemaReady } from '@/lib/db/schemaGate';
import { getCognitiveProfile } from '@/lib/consciousness/cognitiveProfileService';
import { enforceFieldSafety } from '@/lib/field/enforceFieldSafety';
import { makeCanonHeaders } from '@/lib/sovereign/http/canonHeaders';
import { randomUUID } from 'crypto';
import { MemoryBundleService, type MemoryBundle } from '@/lib/memory/MemoryBundle';
import { resolveMemoryMode, type MemoryMode } from '@/lib/memory/MemoryGate';

// Import for build verification compatibility (not used in session-based implementation)
// @ts-ignore
import type { AetherConsciousnessInterface } from '@/lib/consciousness/aether/AetherConsciousnessInterface';

// Skip during static export (Capacitor builds)

// Serverless platform config (prevents platform killing long-running DEEP requests)
export const runtime = 'nodejs';
export const maxDuration = 60; // seconds

const DEMO_MODE = process.env.MAIA_SOVEREIGN_DEMO_MODE === 'true';
const SAFE_MODE = process.env.MAIA_SAFE_MODE === 'true';

//  🔒 Soft timeout for sovereign processing (increased for DEEP path with Opus consultation)
const SOVEREIGN_TIMEOUT_MS = 25000; // FAST: ~2s, CORE: ~4s, DEEP: ~15-20s (full consciousness + Opus)

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
  const requestId = randomUUID();

  // 🛡️ SCHEMA GATE: Fail fast if required migrations are missing
  try {
    await ensureSchemaReady();
  } catch (schemaErr: any) {
    console.error('❌ [SchemaGate] DB schema behind code:', schemaErr.message);
    return NextResponse.json(
      {
        error: 'DB_SCHEMA_BEHIND',
        message: 'Database schema is behind code. Run migrations.',
        details: schemaErr.message,
      },
      { status: 503 }
    );
  }

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

    // 🧠 MEMORY BUNDLE: Build compressed context from multi-bucket retrieval
    const traceId = randomUUID();
    const isSanctuary = (meta as any)?.sanctuary === true;

    // 🛡️ IDENTITY GUARD: Only attempt cross-session memory for recognized users
    // Anonymous sessions (no userId) can still have in-session context but won't
    // trigger "0 memories found" alarms from cross-session retrieval
    const isRecognizedUser = typeof userId === 'string' &&
      userId.length > 0 &&
      userId !== 'guest' &&
      userId !== 'anonymous' &&
      !userId.startsWith('anon:');

    const effectiveUserId = isRecognizedUser ? userId : session.id;
    const allowCrossSessionMemory = isRecognizedUser && !isSanctuary;

    // Resolve memory mode (server-side permission check)
    // Force ephemeral for anonymous users to prevent misleading audit trails
    const requestedMode = isRecognizedUser ? (meta as any)?.memoryMode : 'ephemeral';
    const modeResolution = resolveMemoryMode(effectiveUserId, requestedMode);
    const memoryMode = modeResolution.effective;

    if (!isRecognizedUser) {
      console.log(`🛡️ [Route/Identity] Anonymous session - cross-session memory disabled`);
    }

    let memoryBundle: MemoryBundle | null = null;
    let memoryContext = '';

    // 🔒 SANCTUARY: Skip memory bundle entirely (no cross-session recall)
    // 🔒 ANONYMOUS: Skip cross-session to prevent "0 memories" false alarms
    if (isSanctuary) {
      console.log('🛡️ [Route/MemoryBundle] Skipped - Sanctuary mode');
    } else if (!allowCrossSessionMemory) {
      console.log('🛡️ [Route/MemoryBundle] Skipped - Anonymous session (no cross-session)');
    } else if (memoryMode !== 'ephemeral') {
      try {
        const memoryBundleStart = Date.now();
        memoryBundle = await MemoryBundleService.build({
          userId: effectiveUserId,
          currentInput: message,
          sessionId: session.id,
          traceId,  // For memory usage audit trail
          scope: memoryMode === 'continuity' ? 'cross_session' : 'all',
          maxBullets: 5,
        });

        if (memoryBundle) {
          memoryContext = MemoryBundleService.formatForPrompt(memoryBundle);
          console.log(`📦 [Route/MemoryBundle] Retrieved: ${memoryBundle.retrievalStats.totalCandidates} candidates → ${memoryBundle.memoryBullets.length} bullets (${Date.now() - memoryBundleStart}ms)`);
        }
      } catch (memErr) {
        console.warn('⚠️ [Route/MemoryBundle] Build failed (non-blocking):', memErr);
      }
    }

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
          userId: effectiveUserId, // 🧠 Pass userId for Dialectical Scaffold logging
          traceId, // 📊 For memory usage audit trail
          memoryMode, // 🧠 Server-resolved memory mode
          memoryBundle, // 📦 Pre-built memory bundle
          memoryContext, // 📝 Formatted memory context for prompt
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
        voiceRequested: includeAudio || false,
        // 🔄 Feedback linkage IDs (for agent evolution analysis)
        turnId: orchestratorResult.metadata?.turnId,
        decisionId: orchestratorResult.metadata?.decisionId,  // Clean schema
        deliberationId: orchestratorResult.metadata?.deliberationId,  // Backward compat
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

    // 🛡️ CANON v1.1: Provenance headers for all assistant text responses
    const canonHeaders = makeCanonHeaders({
      requestId,
      pipeline: 'sovereign.getMaiaResponse',
      source: orchestratorResult.processingProfile === 'DEEP' ? 'pfi_full' : 'pfi_legacy',
      mode: 'STANDARD',
      validation: orchestratorResult.validation || null,
      repaired: orchestratorResult.regenerated || false,
    });

    const response = NextResponse.json(responseData, { status: 200 });
    Object.entries(canonHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch (err: any) {
    const duration = Date.now() - start;

    // 🚨 PROVIDERS_UNAVAILABLE: All language models are down
    // Fail closed with clear status - never pretend to be MAIA
    if (err?.code === 'PROVIDERS_UNAVAILABLE') {
      console.error(`🚨 All providers unavailable after ${duration}ms:`, err.message);
      return NextResponse.json(
        {
          error: 'PROVIDERS_UNAVAILABLE',
          status: 'Language providers offline (Claude + Ollama). Check API keys and model availability.',
          route: {
            endpoint: '/api/sovereign/app/maia',
            type: 'Sovereign Consciousness Interface',
            operational: false,
            mode: 'providers-offline',
          },
          meta: {
            durationMs: duration,
            reason: err.reason || 'unknown',
          },
        },
        { status: 503 }
      );
    }

    // 🔥 Timeout-specific handling
    if (err?.code === 'SOVEREIGN_TIMEOUT' || err?.message === 'SOVEREIGN_TIMEOUT') {
      console.error(`❌ Sovereign MAIA timeout after ${duration}ms`);
      return NextResponse.json(
        {
          error: 'SOVEREIGN_TIMEOUT',
          status: 'Request timed out. Try a shorter message or wait a moment.',
          route: {
            endpoint: '/api/sovereign/app/maia',
            type: 'Sovereign Consciousness Interface',
            operational: false,
            mode: 'timeout',
          },
          meta: {
            durationMs: duration,
          },
        },
        { status: 504 }
      );
    }

    console.error(`❌ Sovereign MAIA error after ${duration}ms:`, err);

    // Final fallback - neutral status message, not MAIA-voice
    return NextResponse.json(
      {
        error: 'SYSTEM_ERROR',
        status: 'Service temporarily unavailable. Please try again.',
        route: {
          endpoint: '/api/sovereign/app/maia',
          type: 'Sovereign Consciousness Interface',
          operational: false,
          mode: 'error',
        },
        meta: {
          durationMs: duration,
          code: err?.code || 'UNKNOWN',
        },
      },
      { status: 503 }
    );
  }
}