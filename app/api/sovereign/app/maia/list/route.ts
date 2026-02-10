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
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

// 🚪 AIN Knowledge Gate (Phase 1): Local regex scoring, zero latency
import { scoreKnowledgeGate, type SourceContribution, type KnowledgeGateInput } from '@/lib/ain/knowledge-gate';

// 🌿 Wu Xing (Five Elements) integration
import { computeWuXingSnapshot, type WuXingSnapshot } from '@/lib/consciousness/wuxingSnapshot';
import { createBridgedSnapshot, type BridgedSnapshot } from '@/lib/consciousness/bridgedSnapshot';
import { pool } from '@/lib/db/postgres';

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
    const { sessionId, message, includeAudio, voiceProfile, userId: bodyUserId, timezone: rawTimezone, conversationId: bodyConversationId, ...meta } = body as {
      sessionId?: string;
      message?: string;
      includeAudio?: boolean;
      voiceProfile?: 'default' | 'intimate' | 'wise' | 'grounded';
      userId?: string;
      timezone?: string;
      conversationId?: string;
      [key: string]: unknown;
    };

    // 🔐 AUTH-DERIVED USER ID: Prefer cookie/header-based auth over body
    // This fixes iOS memory loss after app resume (body state can be lost, cookies persist)
    const memberIdFromAuth = await getMemberIdFromRequest(req);
    const userId = memberIdFromAuth ||
      (typeof bodyUserId === 'string' && bodyUserId.length > 0 ? bodyUserId : null);

    // 🔍 IDENTITY DEBUG: Log userId resolution for debugging memory issues
    console.log('[MAIA] userId resolved:', {
      memberIdFromAuth: memberIdFromAuth ? 'present' : 'null',
      bodyUserId: typeof bodyUserId === 'string' ? 'present' : 'null',
      finalUserId: userId ? userId.slice(0, 8) + '...' : 'null',
    });

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

    // 🔍 MEMORY DEBUG: Log identity state for debugging memory issues
    console.log(`🧠 [Route/MemoryDebug] userId="${userId}" isRecognized=${isRecognizedUser} effectiveUserId="${effectiveUserId}" sanctuary=${isSanctuary} allowCross=${allowCrossSessionMemory}`);

    // Resolve memory mode (server-side permission check)
    // 🔧 FIX: Default to 'continuity' for recognized users instead of respecting client's request
    // This ensures cross-session memory is always attempted for authenticated users
    const requestedMode = isRecognizedUser ? ((meta as any)?.memoryMode || 'continuity') : 'ephemeral';
    const modeResolution = resolveMemoryMode(effectiveUserId, requestedMode);
    const memoryMode = modeResolution.effective;

    console.log(`🧠 [Route/MemoryDebug] requestedMode="${requestedMode}" resolvedMode="${memoryMode}"`);

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
      console.log(`🧠 [Route/MemoryBundle] ATTEMPTING retrieval for user="${effectiveUserId}" mode="${memoryMode}"`);
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
          // 🔍 DEBUG: Log what actually came back
          console.log(`📦 [Route/MemoryBundle] Turns: ${memoryBundle.retrievalStats.turnsRetrieved} (same-session: ${memoryBundle.retrievalStats.turnsSameSession}, cross: ${memoryBundle.retrievalStats.turnsCrossSession})`);
          console.log(`📦 [Route/MemoryBundle] Relationship: encounters=${memoryBundle.relationshipSnapshot.encounterCount}, breakthroughs=${memoryBundle.relationshipSnapshot.breakthroughCount}`);
          if (memoryContext.length > 0) {
            console.log(`📦 [Route/MemoryBundle] Context preview (first 300 chars): ${memoryContext.slice(0, 300)}...`);
          } else {
            console.warn(`⚠️ [Route/MemoryBundle] memoryContext is EMPTY despite retrieval!`);
          }
        } else {
          console.warn(`⚠️ [Route/MemoryBundle] Build returned null`);
        }
      } catch (memErr) {
        console.warn('⚠️ [Route/MemoryBundle] Build failed (non-blocking):', memErr);
      }
    } else {
      console.log(`🛡️ [Route/MemoryBundle] Skipped - memoryMode is "${memoryMode}"`);
    }

    // 🌿 WU XING BRIDGE: Five Elements awareness (enhancement, not dependency)
    let wuxingSnapshot: WuXingSnapshot | null = null;
    let bridgedSnapshot: BridgedSnapshot | null = null;
    let wuxingAddendum = '';

    if (isRecognizedUser && !isSanctuary) {
      try {
        // Fetch BaZi profile if stored
        let baziProfile = null;
        try {
          const baziResult = await pool.query(
            `SELECT birth_datetime, birth_timezone, day_master, day_master_element,
                    year_pillar, month_pillar, day_pillar, hour_pillar,
                    element_counts, dominant_element, element_balance_score
             FROM member_bazi_profile
             WHERE member_id = $1`,
            [effectiveUserId]
          );
          if (baziResult.rows.length > 0) {
            baziProfile = baziResult.rows[0];
          }
        } catch (baziErr) {
          console.log(`🌿 [WU XING] BaZi profile not found (optional enhancement)`);
        }

        // Compute Wu Xing snapshot (works with or without BaZi)
        wuxingSnapshot = computeWuXingSnapshot({
          constitution: baziProfile ? {
            dayMasterElement: baziProfile.day_master_element,
            elementCounts: baziProfile.element_counts,
            dominantElement: baziProfile.dominant_element,
          } : undefined,
          currentMoment: new Date(),
          timezone: timezone,
        });

        // Create bridged snapshot if we have spiral data
        const spiralSnapshot = (meta as any)?.spiralSnapshot;
        if (spiralSnapshot || wuxingSnapshot) {
          bridgedSnapshot = createBridgedSnapshot(
            spiralSnapshot || null,
            wuxingSnapshot,
            baziProfile
          );

          // Format Wu Xing addendum for prompt
          if (bridgedSnapshot) {
            const wx = bridgedSnapshot.wuxing;
            const alignment = bridgedSnapshot.crossSystemInsights?.elementAlignment || 'unknown';
            wuxingAddendum = `
🌿 WU XING AWARENESS (Five Elements):
- Dominant moment energy: ${wx?.momentElement || 'Earth'} (${wx?.momentPhase || 'stable'})
${baziProfile ? `- Constitutional element: ${baziProfile.day_master_element} (Day Master)` : '- No birth chart on file (using moment energy only)'}
- Element alignment: ${alignment}
${bridgedSnapshot.crossSystemInsights?.practicalGuidance ? `- Guidance: ${bridgedSnapshot.crossSystemInsights.practicalGuidance}` : ''}

Use this awareness to attune your tone and suggestions to the current elemental qualities.
Wood = growth, vision, initiative | Fire = clarity, passion, connection
Earth = stability, nourishment, integration | Metal = precision, release, boundaries
Water = depth, reflection, wisdom`;
          }
        }

        console.log(`🌿 [WU XING] Computed: ${wuxingSnapshot?.momentElement || 'none'} moment, ${baziProfile ? 'with' : 'without'} BaZi profile`);
      } catch (wuxingErr) {
        console.warn(`🌿 [WU XING] Computation failed (proceeding without):`, wuxingErr instanceof Error ? wuxingErr.message : 'unknown');
        // Wu Xing is enhancement, not dependency - continue without it
      }
    }

    // 🏢 STUDIO SURFACE: Build prompt addendum when running inside Soullab Studio
    const surfaceMode = (meta as any)?.surface as string | undefined;
    const studioCtx = (meta as any)?.studioContext as { surface?: string; clientId?: string; pathname?: string } | undefined;
    const studioAddendum = surfaceMode === 'studio'
      ? `🏢 STUDIO MODE — PRACTITIONER CONTEXT:
You are MAIA operating inside Soullab Studio for a practitioner (not a community member).
Be concise, operational, and action-oriented. Keep responses tighter than normal.
You may draft messages (SMS, email), checklists, plans, and session notes — but DO NOT send anything.
When proposing outreach, produce a DRAFT and say "Ready to send — confirm in Studio."
${studioCtx?.clientId ? `Client context ID: ${studioCtx.clientId}` : 'No specific client selected.'}`
      : undefined;

    if (studioAddendum) {
      console.log(`🏢 [Route] Studio surface detected — practitioner prompt cap applied`);
    }

    // 🚪 AIN KNOWLEDGE GATE: Score 5 wells × awareness level (local regex, zero latency)
    let knowledgeGateResult: { source_mix: SourceContribution[]; awarenessState: any; awarenessDescription: string } | null = null;
    let knowledgeGateAddendum: string | null = null;
    if (process.env.AIN_KNOWLEDGE_GATE_ENABLED === '1') {
      try {
        const conversationHistory = ((meta as any)?.conversationHistory || []) as Array<{ role?: string; userMessage?: string; maiaResponse?: string; content?: string }>;
        const kgInput: KnowledgeGateInput = {
          userId: effectiveUserId,
          userMessage: message,
          conversationHistory: conversationHistory.slice(-6).map((h: any) => ({
            role: (h.role || 'user') as 'user' | 'assistant',
            content: h.userMessage || h.maiaResponse || h.content || '',
          })),
          contextHint: (meta as any)?.voiceSettings?.mode === 'counsel' ? 'counsel'
            : (meta as any)?.voiceSettings?.mode === 'scribe' ? 'journal'
            : undefined,
        };
        knowledgeGateResult = scoreKnowledgeGate(kgInput);

        // Build addendum string for system prompt
        const sortedSources = [...knowledgeGateResult.source_mix].sort((a, b) => b.weight - a.weight);
        const sourceLines = sortedSources.map(s =>
          `- ${s.source} (${Math.round(s.weight * 100)}%): ${s.notes || ''}`
        ).join('\n');
        knowledgeGateAddendum = `AIN KNOWLEDGE GATE (Source Weighting)\nDraw from these knowledge wells in proportion:\n${sourceLines}\nAwareness depth: Level ${knowledgeGateResult.awarenessState.level} (${knowledgeGateResult.awarenessDescription})\nUse as background intelligence. Do not quote this section directly.`;

        console.log(`[AIN KG] 🚪 Source mix: ${knowledgeGateResult.source_mix.map(s => `${s.source}:${Math.round(s.weight * 100)}%`).join(' | ')} | Awareness: L${knowledgeGateResult.awarenessState.level} (${knowledgeGateResult.awarenessDescription})`);
      } catch (err) {
        console.warn('[AIN KG] Scoring failed (non-blocking):', err);
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
          wuxingSnapshotAddendum: wuxingAddendum, // 🌿 Wu Xing elemental awareness (mapped to existing field)
          wuxingSnapshot, // 🌿 Raw Wu Xing data for downstream processing
          bridgedSnapshot, // 🌿 Combined Spiral × Wu Xing snapshot
          conversationId: bodyConversationId || session.id, // 📝 Stable conversation ID for thread continuity
          studioAddendum, // 🏢 Studio prompt cap (when surface === 'studio')
          knowledgeGateAddendum, // 🚪 AIN Knowledge Gate: source well modulation (Phase 1)
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
      // 🌀 STATE VECTOR: Consciousness state reading (if check-in detected)
      stateVector: orchestratorResult.stateVector || null,
      // 🌿 PRACTICE: Recommended practice from state vector routing
      practiceRecommendation: orchestratorResult.practiceRecommendation || null,
      // 🚪 AIN KNOWLEDGE GATE: Source well scoring (Phase 1)
      ainState: knowledgeGateResult ? {
        sourceMix: knowledgeGateResult.source_mix.map(s => ({
          source: s.source,
          weight: s.weight,
          notes: s.notes,
        })),
        awarenessLevel: knowledgeGateResult.awarenessState.level,
        awarenessConfidence: knowledgeGateResult.awarenessState.confidence,
        awarenessDescription: knowledgeGateResult.awarenessDescription,
      } : null,
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