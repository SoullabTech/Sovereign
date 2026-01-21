// @ts-nocheck - Prototype file, not type-checked
export const dynamic = 'force-dynamic';
// backend: app/api/sovereign/app/maia/route.ts

/**
 * ROUTING INVARIANT:
 * Set originRoute + (optional) processingProfileOverride HERE at the HTTP boundary.
 * Do not infer these deeper in the stack.
 */
import { NextRequest, NextResponse } from 'next/server';

// =============================================================================
// CORS HELPERS - Required for Capacitor/mobile app cross-origin requests
// =============================================================================

const ALLOWED_ORIGINS = new Set([
  'https://soullab.life',
  'http://localhost:5173',
  'http://localhost:3000',
  'capacitor://localhost',
  'ionic://localhost',
  'null', // WebKit sometimes reports this for file-like/Capacitor contexts
]);

// Default headers to allow if client doesn't specify (non-preflight requests)
const DEFAULT_ALLOWED_HEADERS = 'Content-Type, Authorization, X-Requested-With, X-Member-Id, X-Maia-Tier, X-Maia-Roles';

function getCorsHeaders(req: NextRequest): Record<string, string> {
  const origin = req.headers.get('origin');

  // Handle origin: allow known origins, or treat 'null' as capacitor
  let allowedOrigin: string;
  if (origin === 'null') {
    allowedOrigin = 'null'; // WebKit Capacitor edge case
  } else if (origin && ALLOWED_ORIGINS.has(origin)) {
    allowedOrigin = origin;
  } else {
    allowedOrigin = 'https://soullab.life';
  }

  // Echo requested headers for preflight (more robust than fixed list)
  const requestedHeaders = req.headers.get('access-control-request-headers');
  const allowHeaders = requestedHeaders || DEFAULT_ALLOWED_HEADERS;

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': allowHeaders,
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin',
  };
}

/**
 * Helper to create JSON response with CORS headers
 */
function jsonWithCors(
  req: NextRequest,
  data: unknown,
  status: number = 200,
  extraHeaders?: Record<string, string>
): NextResponse {
  const headers = {
    ...getCorsHeaders(req),
    ...extraHeaders,
  };
  return NextResponse.json(data, { status, headers });
}

/**
 * CORS Preflight Handler
 * Returns 204 with proper CORS headers for OPTIONS requests
 */
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(req),
  });
}
import { getMaiaResponse } from '@/lib/sovereign/maiaService';
import { ensureSession, initializeSessionTable } from '@/lib/sovereign/sessionManager';
import { ensureSchemaReady } from '@/lib/db/schemaGate';
import { getCognitiveProfile } from '@/lib/consciousness/cognitiveProfileService';
import { enforceFieldSafety } from '@/lib/field/enforceFieldSafety';
import { makeCanonHeaders } from '@/lib/sovereign/http/canonHeaders';
import { randomUUID } from 'crypto';
import { MemoryBundleService, type MemoryBundle } from '@/lib/memory/MemoryBundle';
import { resolveMemoryMode, type MemoryMode } from '@/lib/memory/MemoryGate';
import { processNameChangeIfDetected } from '@/lib/consciousness/nameChangeDetection';

// Import for build verification compatibility (not used in session-based implementation)
// @ts-ignore
import type { AetherConsciousnessInterface } from '@/lib/consciousness/aether/AetherConsciousnessInterface';

// Skip during static export (Capacitor builds)

// Serverless platform config (prevents platform killing long-running DEEP requests)
export const runtime = 'nodejs';
export const maxDuration = 60; // seconds

const DEMO_MODE = process.env.MAIA_SOVEREIGN_DEMO_MODE === 'true';
const SAFE_MODE = process.env.MAIA_SAFE_MODE === 'true';

/**
 * Validate IANA timezone string
 * Returns true for valid timezones like "America/New_York", "Europe/London", "UTC"
 */
function isValidTimeZone(tz: string): boolean {
  if (!tz || typeof tz !== 'string') return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

//  🔒 Soft timeout for sovereign processing (increased for DEEP path with Opus consultation)
const SOVEREIGN_TIMEOUT_MS = 55000; // FAST: ~2s, CORE: ~4s, DEEP: ~20-45s (full consciousness + Opus + long history)

// Step tracer for debugging hangs
function msSince(t0: number) {
  return Date.now() - t0;
}

async function withTimeoutLabeled<T>(
  label: string,
  promise: Promise<T>,
  ms: number,
  t0: number
): Promise<T> {
  let timeoutId: NodeJS.Timeout | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      const err = new Error(`[MAIA timeout] ${label} exceeded ${ms}ms`);
      (err as any).code = 'SOVEREIGN_TIMEOUT';
      reject(err);
    }, ms);
  });

  try {
    const result = await Promise.race([promise, timeout]);
    console.log(`[MAIA step] ${label} ok in ${msSince(t0)}ms`);
    return result as T;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

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
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  const start = Date.now();
  const requestId = randomUUID();

  console.log(`[MAIA] start rid=${requestId}`);
  console.log(`[MAIA] env DATABASE_URL=${process.env.DATABASE_URL ? 'set' : 'unset'}`);

  // 🛡️ SCHEMA GATE: Fail fast if required migrations are missing
  try {
    await withTimeoutLabeled('ensureSchemaReady', ensureSchemaReady(), 5000, start);
  } catch (schemaErr: any) {
    console.error('❌ [SchemaGate] DB schema behind code:', schemaErr.message);
    return jsonWithCors(req, {
      error: 'DB_SCHEMA_BEHIND',
      message: 'Database schema is behind code. Run migrations.',
      details: schemaErr.message,
    }, 503);
  }

  try {
    const body = await withTimeoutLabeled('req.json', req.json().catch(() => ({})), 2000, start);
    const { sessionId, message, includeAudio, voiceProfile, userId, timezone: rawTimezone, ...meta } = body as {
      sessionId?: string;
      message?: string;
      includeAudio?: boolean;
      voiceProfile?: 'default' | 'intimate' | 'wise' | 'grounded';
      userId?: string;
      timezone?: string;
      [key: string]: unknown;
    };

    // Validate and sanitize timezone (default to UTC if invalid)
    const timezone = (rawTimezone && isValidTimeZone(rawTimezone)) ? rawTimezone : 'UTC';

    console.log(`[MAIA step] body parsed rid=${requestId} dt=${msSince(start)}ms`);

    if (DEMO_MODE) {
      const duration = Date.now() - start;
      if (duration > 500) {
        console.warn(
          `⚠️ DEMO sovereign request took ${duration}ms (should be near-instant)`
        );
      }
      return jsonWithCors(req, defaultSovereignResponse(), 200);
    }

    if (!message || typeof message !== 'string') {
      const duration = Date.now() - start;
      console.warn(
        `⚠️ Sovereign request rejected in ${duration}ms: missing message`
      );
      return jsonWithCors(req, { error: 'Missing `message` in request body', code: 'NO_MESSAGE' }, 400);
    }

    // Initialize database tables if needed
    await withTimeoutLabeled('initializeSessionTable', initializeSessionTable(), 5000, start);

    const session = await withTimeoutLabeled('ensureSession', ensureSession(sessionId), 5000, start);

    // 🎯 NAME CHANGE DETECTION: Detect "call me X" patterns and update preferred name
    let nameChangeResult = null;
    if (userId && typeof userId === 'string' && !userId.startsWith('anon:')) {
      try {
        nameChangeResult = await processNameChangeIfDetected(message, userId);
        if (nameChangeResult.detected && nameChangeResult.updated) {
          console.log(`✨ [NAME_CHANGE] User asked to be called "${nameChangeResult.newName}" - updated`);
        }
      } catch (err) {
        console.warn('⚠️ [NAME_CHANGE] Detection failed (non-blocking):', err);
      }
    }

    // 🛡️ FIELD SAFETY GATE: Check if user is safe for field/symbolic work
    let cognitiveProfile = null;
    let fieldSafety = null;

    if (userId || session.id) {
      try {
        cognitiveProfile = await withTimeoutLabeled('getCognitiveProfile', getCognitiveProfile(userId || session.id), 5000, start);

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
            return jsonWithCors(req, {
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
            }, 200);
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
        memoryBundle = await withTimeoutLabeled(
          'MemoryBundleService.build',
          MemoryBundleService.build({
            userId: effectiveUserId,
            currentInput: message,
            sessionId: session.id,
            traceId,  // For memory usage audit trail
            scope: memoryMode === 'continuity' ? 'cross_session' : 'all',
            maxBullets: 5,
          }),
          5000,
          start
        );

        if (memoryBundle) {
          memoryContext = MemoryBundleService.formatForPrompt(memoryBundle);
          console.log(`📦 [Route/MemoryBundle] Retrieved: ${memoryBundle.retrievalStats.totalCandidates} candidates → ${memoryBundle.memoryBullets.length} bullets`);
        }
      } catch (memErr) {
        console.warn('⚠️ [Route/MemoryBundle] Build failed (non-blocking):', memErr);
      }
    }

    // 🎯 Use new three-tier processing system with voice integration
    orchestratorResult = await withTimeoutLabeled(
      'getMaiaResponse',
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
          timezone, // 📅 User's browser timezone for temporal grounding
          ...meta,
        },
      }),
      SOVEREIGN_TIMEOUT_MS,
      start,
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

    // 🔮 Standardize provider info for sovereignty verification
    const rawProvider = orchestratorResult.provider?.provider;
    const rawMode = orchestratorResult.provider?.mode;
    const rawModel = orchestratorResult.provider?.model;

    // Deterministic mapping: fallback first, then derive from provider
    // modeUsed = where it ran: cloud | local | fallback | unknown
    let modeUsed: 'cloud' | 'local' | 'fallback' | 'unknown';
    if (rawMode === 'fallback') {
      modeUsed = 'fallback';
    } else if (
      rawProvider === 'ollama' ||
      rawProvider === 'local' ||
      rawProvider === 'consciousness_engine' ||
      rawProvider === 'multi_engine'  // multi_engine = local Ollama model orchestra
    ) {
      modeUsed = 'local';
    } else if (rawProvider === 'anthropic' || rawProvider === 'openai') {
      modeUsed = 'cloud';
    } else {
      // unknown or any future providers → unknown
      modeUsed = 'unknown';
    }

    const providerUsed = rawProvider || 'unknown';
    const modelUsed = rawModel || 'unknown';

    // Unified response structure for new three-tier system with voice integration
    const responseData: any = {
      message: orchestratorResult.text,
      // 🔮 Top-level provider info for easy screenshot verification
      providerUsed,
      model: modelUsed,
      modeUsed,
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
        // 🔮 Provider info (mirrored from top-level for structured access)
        providerUsed,
        model: modelUsed,
        modeUsed,
        // ✨ Name change detection result (if user said "call me X")
        nameChange: nameChangeResult?.detected ? {
          newName: nameChangeResult.newName,
          updated: nameChangeResult.updated,
        } : undefined,
      },
    };

    // 🐛 Debug block: requires explicit ?debug=1 (dev: no key, prod: needs key)
    const debugRequested = req.nextUrl.searchParams.get('debug') === '1';
    const debugKey = req.headers.get('x-dev-key') || req.nextUrl.searchParams.get('key');
    const expectedKey = process.env.DEV_STATUS_KEY;

    const allowDebug =
      debugRequested && (
        process.env.NODE_ENV !== 'production' ||
        (expectedKey && debugKey === expectedKey)
      );

    if (allowDebug) {
      responseData._debug = {
        rawProvider: rawProvider ?? null,
        rawMode: rawMode ?? null,
        rawModel: rawModel ?? null,
      };
    }

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

    const response = jsonWithCors(req, responseData, 200, canonHeaders);
    return response;
  } catch (err: any) {
    const duration = Date.now() - start;

    // 🚨 PROVIDERS_UNAVAILABLE: All language models are down
    // Fail closed with clear status - never pretend to be MAIA
    if (err?.code === 'PROVIDERS_UNAVAILABLE') {
      console.error(`🚨 All providers unavailable after ${duration}ms:`, err.message);
      return jsonWithCors(req, {
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
      }, 503);
    }

    // 🔥 Timeout-specific handling
    if (err?.code === 'SOVEREIGN_TIMEOUT' || err?.message === 'SOVEREIGN_TIMEOUT') {
      console.error(`❌ Sovereign MAIA timeout after ${duration}ms`);
      return jsonWithCors(req, {
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
      }, 504);
    }

    console.error(`❌ Sovereign MAIA error after ${duration}ms:`, err);

    // Final fallback - neutral status message, not MAIA-voice
    return jsonWithCors(req, {
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
    }, 503);
  }
}