export const dynamic = 'force-dynamic';
// backend: app/api/sovereign/app/maia/route.ts

/**
 * ROUTING INVARIANT:
 * Set originRoute + (optional) processingProfileOverride HERE at the HTTP boundary.
 * Do not infer these deeper in the stack.
 */
import { NextRequest, NextResponse } from 'next/server';
import { toAudioResponsePayload } from '@/lib/voice/audioResponsePayload';
import { observeRelationalContent } from '@/lib/consciousness/relationalObserver';
import { detectRelationalSignal } from '@/lib/relationships/detectRelationalSignal';
import { persistDetectedSignal } from '@/lib/relationships/relationshipSignalService';
import { getMemberActiveRelationalContext } from '@/lib/relationships/relationshipContextService';
import { formatRelationalContextForPrompt } from '@/lib/relationships/formatRelationalContextForPrompt';
import { emitSignal } from '@/lib/observation/observationService';
import { computeInterruptionMetadata } from '@/lib/consciousness/interruptionLedger';
import { validatePlaceContext, buildPlaceAddendum } from '@/lib/maia/presence/place';
import { logAgentRun } from '@/lib/services/corpusCallosumService';

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
// F1 durable turn acceptance (audit 2026-08-10): this route is the serving
// boundary that ACCEPTS a member utterance, so it is where the utterance must
// become durable — not the browser, later, once a pair exists.
import { TurnsStore } from '@/lib/memory/stores/TurnsStore';
import { TurnPosture } from '@/lib/sanctuary/turnPosture';
import { TurnGeneration } from '@/lib/provenance/turnGeneration';
import { scrubMemoryAmnesia } from '@/lib/maia/prompts/memoryCanonGuard';
import { ensureSession, initializeSessionTable } from '@/lib/sovereign/sessionManager';
import { ensureSchemaReady } from '@/lib/db/schemaGate';
import { getCognitiveProfile } from '@/lib/consciousness/cognitiveProfileService';
import { enforceFieldSafety } from '@/lib/field/enforceFieldSafety';
import { makeCanonHeaders } from '@/lib/sovereign/http/canonHeaders';
import { randomUUID } from 'crypto';
import { MemoryBundleService, type MemoryBundle } from '@/lib/memory/MemoryBundle';
import { resolveMemoryMode, type MemoryMode } from '@/lib/memory/MemoryGate';
import { processNameChangeIfDetected } from '@/lib/consciousness/nameChangeDetection';
import { resolveMemberIdentity } from './resolveIdentity';
import { getRelationshipAnamnesis, saveRelationshipEssence, loadRelationshipEssence } from '@/lib/consciousness/RelationshipAnamnesisPostgres';
import { buildMemberLiveContext, formatMemberWebForPrompt, describeLiveContext } from '@/lib/memory/MemberLiveContext';
import { MemoryWritebackService } from '@/lib/memory/MemoryWriteback';
import { getAstrologyContextForUser, type AstrologyContext } from '@/lib/services/maiaAstrologyContextService';
// Conversational Keep — explicit member-instruction filing only (no salience offers).
// Mirrors the high-confidence filing path in app/api/oracle/conversation/route.ts.
import { parseFilingInstruction, applyConversationalKeepResult, type FilingInstruction } from '@/lib/psyche/conversational-keep';

// 🧠 MEMORY ORCHESTRATOR (Phase 1.5) — wired here because THIS is the live
// sovereign-MAIA route the UI actually hits (not /api/sovereign/app/maia/route.ts,
// which is dormant). Without this wiring MAIA confabulates about her own memory
// because the orchestrator (which exists in lib/maia/) was previously only
// invoked from /api/oracle/conversation and /api/between/chat. The 'list' in
// this filename is misleading — it serves the chat path.
// Reference implementation: app/api/between/chat/route.ts lines 1847–1885.
import { buildMemoryInfluencePlan, summarizePlanForLog } from '@/lib/maia/memoryOrchestrator';
import { loadRecentDevelopmentalMemories, loadRecentThemeSignals, loadPriorCrossSessionExchanges, loadConversationalRecallPref, loadRecentMarkedEpisodes, loadEpisodicRecallPref } from '@/lib/maia/memoryLoaders';
import { detectForwardReadiness, buildForwardReadinessBlock } from '@/lib/maia/forwardReadiness';
// 🧬 Cut 1 — Layer 5 (Semantic/atoms) + Layer 15 (memoryHealth)
import { loadMemberMemoryAtomsForPrompt, formatAtomsForPrompt, type MemoryAtomSnapshot } from '@/lib/maia/memoryAtomsLoader';
import { buildMemoryHealth, summarizeMemoryHealthForLog, isBaseChainDegraded, type MemoryHealth } from '@/lib/maia/memoryHealth';
import { recordMemoryTransitions } from '@/lib/maia/memoryTransitionRecord';
// 💬 Phase 2 — Conversational recall (wire site correction per spec §IX, 2026-05-24).
// Live route wire — replaces oracle/conversation/route.ts which receives no real traffic.
import { formatPriorExchangesForPrompt, summarizePriorExchangesForLog, computeLastPriorSessionMinutesAgo } from '@/lib/maia/conversationalRecallBlock';
// 📖 Episodic Phase 2 — member-marked moments (substrate lane only; does NOT
// open Themes/Reflections). Mirrors the conversational Phase 2 wire pattern.
import { formatMarkedEpisodesForPrompt, summarizeMarkedEpisodesForLog } from '@/lib/maia/episodicRecallBlock';
// 🔐 De-frag step 3 — runtime contract: every getMaiaResponse() call must pass through this
import { buildMaiaRuntimeContext, formatRuntimeContextForResponse } from '@/lib/maia/maiaRuntimeContext';
// 🔐 De-frag step 5 — provider health guard: throws before generation, never soft-returns
import { assertProviderAvailable, ProviderUnavailableError } from '@/lib/maia/assertProviderAvailable';
// 🌀 Cut 2 — Spiral Orientation (read-only developmental context)
// PARKED: Cut 2 is design-only / parked. Orientation must not enter the MAIA
// prompt automatically yet (preserves Path B: Journey surfaces orientation first,
// MAIA only receives what is brought into the room). Restore this import +
// call site + meta passthrough only after Cut 2 is explicitly authorized AND
// the import path / return-shape are reconciled with the actual implementation.
// import { buildMemberSpiralOrientation, type SpiralOrientationResult } from '@/lib/maia/spiralOrientation';

// 🚪 AIN Knowledge Gate (Phase 1): Local regex scoring, zero latency
import { scoreKnowledgeGate, type SourceContribution, type KnowledgeGateInput } from '@/lib/ain/knowledge-gate';

// 🌿 Wu Xing (Five Elements) integration
import { buildWuXingSnapshot, computeWuXingConstitution, computeWuXingMoment, generateWuXingPromptAddendum, type BaZiProfile, type WuXingSnapshot } from '@/lib/consciousness/wuxingSnapshot';
import { type BridgedSnapshot } from '@/lib/consciousness/bridgedSnapshot';
import { calculateDaYun } from '@/lib/astrology/daYunCalculator';
import { pool } from '@/lib/db/postgres';
import { logAINShapeTelemetry } from '@/lib/db/ainShapeTelemetry';
import { buildPracticeFieldContext, formatPracticeFieldContextForPrompt } from '@/lib/practiceField/practiceFieldService';
import { assessAINResponseShape } from '@/lib/ai/quality/ainResponseShape';
import { classifyAssistantTurn } from '@/lib/ai/quality/assistantTurnType';

// Import for build verification compatibility (not used in session-based implementation)
// @ts-ignore
import type { AetherConsciousnessInterface } from '@/lib/consciousness/aether/AetherConsciousnessInterface';
import { memberRef } from '@/lib/privacy/memberRef';

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

// Deploy 2 — governance primitive: prefaces every symbolic addendum (astrology
// Western+Mayan, Wu Xing constitution) so the model holds them as lenses, not grounds
// for assertion about the member. Ablation-validated (scripts/repro/deploy2-boundary-
// ablation.ts): over-assertion index -3.63, every dimension correct direction; the
// bounded arm still engages the lens (symbolic_framing stayed high) — bounds, not kills.
// Da Yun keeps its own per-addendum boundary (Deploy 1).
const SYMBOLIC_LENS_BOUNDARY = `## HOW TO HOLD EVERY SYMBOLIC FRAMEWORK BELOW (astrology, Mayan, Chinese/Wu Xing, elements, cycles, archetypes)
These are traditional interpretive lenses — NOT facts, NOT predictions, NOT evidence about this member's actual life. Possessing a framework gives you NO grounds to assert anything about who they are, what phase they are in, or where they are heading. You still know only what they have actually told you. Do not lead with a lens or announce "you are entering / this means / your chart shows" as fact; offer one only when it genuinely illuminates what they are living or when they ask, frame it explicitly as a traditional association, and when a lens conflicts with their lived experience, their experience wins.`;

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
    const { sessionId, message, includeAudio, voiceProfile, userId: bodyUserId, timezone: rawTimezone, conversationId: bodyConversationId, exchangeId: clientExchangeId, ...meta } = body as {
      sessionId?: string;
      message?: string;
      includeAudio?: boolean;
      voiceProfile?: 'default' | 'intimate' | 'wise' | 'grounded';
      userId?: string;
      timezone?: string;
      conversationId?: string;
      // Client-minted exchange id. Correlates the durable member turn written at
      // acceptance with the MAIA turn written after generation, and with the
      // client's own later pair write — which then dedupes instead of doubling.
      // Destructured out of `meta` deliberately: it is plumbing, not prompt context.
      exchangeId?: string;
      [key: string]: unknown;
    };

    // 🔐 IDENTITY (security): resolve the member ONLY from a verified session
    // credential (maia_session cookie / x-session-token header, validated against
    // auth_sessions). A request-body `userId` is NEVER trusted for identity —
    // member UUIDs are client-exposed, so honoring a body id would let a caller
    // read/write another member's memory (impersonation). The legacy
    // `|| bodyUserId` fallback was removed once apiFetch shipped x-session-token
    // on every native path. See ./resolveIdentity.ts.
    const userId = await resolveMemberIdentity(req);

    // 🔍 IDENTITY DEBUG: observe resolution + flag a body id that was ignored
    // (stale client or spoof attempt) so it's visible without being trusted.
    console.log('[MAIA] userId resolved:', {
      fromSession: userId ? 'present' : 'null',
      bodyUserId:
        typeof bodyUserId === 'string' && bodyUserId.length > 0
          ? (bodyUserId === userId ? 'matches-session' : 'ignored')
          : 'absent',
      finalUserId: userId ? memberRef(userId) : 'null',
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

    // ─────────────────────────────────────────────────────────────────────────
    // 🧱 TURN ACCEPTANCE BOUNDARY (F1 — durable turn acceptance)
    //
    // This is the EARLIEST point at which the system has everything it needs to
    // call the utterance accepted: the member is authenticated (resolveMemberIdentity,
    // above), the message is present and well-formed, the client's sessionId is
    // known, and the Sanctuary posture is decidable from `meta`.
    //
    // The invariant this enforces:
    //   ONCE A MEMBER TURN HAS BEEN ACCEPTED FOR MAIA PROCESSING, THE MEMBER'S
    //   WORDS MUST NO LONGER DEPEND ON THE CLIENT REMAINING ALIVE.
    //
    // ⚠️ PLACEMENT IS LOAD-BEARING, and was corrected during this unit. The first
    // attempt sat lower — after initializeSessionTable / ensureSession / cognitive
    // profile — and a client that navigated away 250ms after Send aborted the
    // handler BEFORE the write was reached, so the member turn was still lost.
    // Durability must precede the preamble work, not follow it. Anything added
    // above this block widens the loss window again.
    //
    // We deliberately use the client's `sessionId` rather than the resolved
    // `session.id` (ensureSession echoes the same value back) so this write does
    // not have to wait on session upsert. Restore reads by this same sessionId.
    //
    // Scope discipline: this widens WHEN the same content is written, never WHAT
    // is written. Sanctuary still refuses (posture is re-enforced inside the
    // store), and only recognized members are recorded — exactly the population
    // the authenticated client-side write already covered.
    // ─────────────────────────────────────────────────────────────────────────
    const isSanctuary = (meta as any)?.sanctuary === true;

    // 🛡️ IDENTITY GUARD: Only attempt cross-session memory for recognized users
    // Anonymous sessions (no userId) can still have in-session context but won't
    // trigger "0 memories found" alarms from cross-session retrieval
    const isRecognizedUser = typeof userId === 'string' &&
      userId.length > 0 &&
      userId !== 'guest' &&
      userId !== 'anonymous' &&
      !userId.startsWith('anon:');

    const turnPosture = TurnPosture.resolve({ sanctuary: isSanctuary });
    // ⛔ Generation is resolved from the member's declared action class, never
    // from role, content, includeAudio or voiceProfile — the last two describe
    // whether MAIA should SPEAK, not whether the member did. A client that
    // declares nothing yields `unknown-generation`.
    const turnGeneration = TurnGeneration.resolve(meta);
    // Reuse the client's exchange id when supplied so the later client-side pair
    // write collapses onto this same exchange instead of duplicating it. Falling
    // back to requestId keeps older clients working exactly as before.
    const exchangeId =
      typeof clientExchangeId === 'string' && clientExchangeId.length > 0
        ? clientExchangeId
        : requestId;
    const acceptedSessionId =
      typeof sessionId === 'string' && sessionId.trim() ? sessionId.trim() : undefined;
    let memberTurnDurable = false;

    if (isRecognizedUser && !isSanctuary) {
      try {
        memberTurnDurable = await TurnsStore.addExchangeTurn(turnPosture, turnGeneration, {
          userId: userId!,
          sessionId: acceptedSessionId,
          role: 'user',
          content: message,
          exchangeId,
        });
        console.log(
          `🧱 [MAIA/durability] member turn accepted+durable exchange=${exchangeId.slice(0, 8)} durable=${memberTurnDurable} dt=${msSince(start)}ms`
        );
      } catch (durabilityErr: any) {
        // Never fail the member's turn because bookkeeping failed — but say so
        // loudly, because this is exactly the silent-loss condition F1 is about.
        console.error(
          `❌ [MAIA/durability] member turn NOT durable exchange=${exchangeId.slice(0, 8)}:`,
          durabilityErr?.message ?? durabilityErr
        );
      }
    }

    // ⚡ LATENCY FIX: Parallelize session init with cognitive profile + name change detection.
    // Previously these ran sequentially (~200-500ms each).
    // Session init must complete before ensureSession, but cognitive profile and
    // name change detection are independent and can overlap.
    await withTimeoutLabeled('initializeSessionTable', initializeSessionTable(), 5000, start);

    // Run session creation, cognitive profile, and name change in parallel
    const isRecognizedForProfile = typeof userId === 'string' && userId.length > 0 && !userId.startsWith('anon:');
    const [session, cognitiveProfileResult, nameChangeResult] = await Promise.all([
      withTimeoutLabeled('ensureSession', ensureSession(sessionId), 5000, start),
      (userId || sessionId)
        ? withTimeoutLabeled('getCognitiveProfile', getCognitiveProfile(userId || sessionId!), 5000, start)
            .catch(err => { console.warn('⚠️ [Field Safety] Could not fetch cognitive profile:', err); return null; })
        : Promise.resolve(null),
      (isRecognizedForProfile && message)
        ? processNameChangeIfDetected(message, userId!)
            .then(r => { if (r.detected && r.updated) console.log(`✨ [NAME_CHANGE] User asked to be called "${r.newName}" - updated`); return r; })
            .catch(err => { console.warn('⚠️ [NAME_CHANGE] Detection failed (non-blocking):', err); return null; })
        : Promise.resolve(null),
    ]);

    console.log(`[MAIA step] parallel init complete dt=${msSince(start)}ms`);

    // 🛡️ FIELD SAFETY GATE: Check if user is safe for field/symbolic work
    let cognitiveProfile = cognitiveProfileResult;
    let fieldSafety = null;

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

    let orchestratorResult;

    // 🧠 MEMORY BUNDLE: Build compressed context from multi-bucket retrieval
    const traceId = randomUUID();

    const effectiveUserId = isRecognizedUser ? userId : session.id;
    const allowCrossSessionMemory = isRecognizedUser && !isSanctuary;

    // 🔍 MEMORY DEBUG: Log identity state for debugging memory issues
    console.log(`🧠 [Route/MemoryDebug] userId="${memberRef(userId)}" isRecognized=${isRecognizedUser} effectiveUserId="${memberRef(effectiveUserId)}" sanctuary=${isSanctuary} allowCross=${allowCrossSessionMemory}`);


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

    // ⚡ LATENCY FIX: Run MemoryBundle and BaZi/WuXing in parallel.
    // These are independent and previously ran sequentially (~500ms-2s each).
    const shouldBuildMemory = !isSanctuary && allowCrossSessionMemory && memoryMode !== 'ephemeral';
    const shouldComputeWuXing = isRecognizedUser && !isSanctuary;

    if (!shouldBuildMemory) {
      if (isSanctuary) console.log('🛡️ [Route/MemoryBundle] Skipped - Sanctuary mode');
      else if (!allowCrossSessionMemory) console.log('🛡️ [Route/MemoryBundle] Skipped - Anonymous session');
      else console.log(`🛡️ [Route/MemoryBundle] Skipped - memoryMode is "${memoryMode}"`);
    }

    const shouldLoadAstrology = isRecognizedUser && !isSanctuary;

    const [memoryBundleResult, wuxingResult, astrologyContextResult] = await Promise.all([
      // Memory bundle (parallel leg 1)
      shouldBuildMemory
        ? (async () => {
            console.log(`🧠 [Route/MemoryBundle] ATTEMPTING retrieval for user="${memberRef(effectiveUserId)}" mode="${memoryMode}"`);
            try {
              return await withTimeoutLabeled(
                'MemoryBundleService.build',
                MemoryBundleService.build({
                  userId: effectiveUserId,
                  currentInput: message,
                  sessionId: session.id,
                  traceId,
                  scope: memoryMode === 'continuity' ? 'cross_session' : 'all',
                  maxBullets: 5,
                }),
                5000,
                start
              );
            } catch (memErr) {
              console.warn('⚠️ [Route/MemoryBundle] Build failed (non-blocking):', memErr);
              return null;
            }
          })()
        : Promise.resolve(null),

      // Wu Xing / BaZi (parallel leg 2)
      shouldComputeWuXing
        ? (async (): Promise<{ wuxingSnapshot: WuXingSnapshot | null; bridgedSnapshot: BridgedSnapshot | null; wuxingAddendum: string }> => {
            try {
              let baziProfile: BaZiProfile | null = null;
              let westernBirthData: { birth_date: string | null; birth_time: string | null; birth_location_name: string | null; birth_timezone: string | null } | null = null;
              try {
                // Schema-correct loader (the legacy SELECT queried member_id / year_pillar /
                // element_counts — none of which exist; it threw every turn and the row was
                // never read). Real schema: user_id + *_json + dominant/deficient_elements.
                const baziResult = await pool.query(
                  `SELECT birth_datetime_utc, birth_timezone, location_text, pillars_json,
                          day_master, day_master_element, day_master_yinyang,
                          wuxing_balance_json, wuxing_percentages_json,
                          dominant_elements, deficient_elements, balance_score
                   FROM member_bazi_profile
                   WHERE user_id = $1`,
                  [effectiveUserId]
                );
                if (baziResult.rows.length > 0) {
                  const r = baziResult.rows[0];
                  baziProfile = {
                    userId: String(effectiveUserId),
                    birthDatetimeUtc: new Date(r.birth_datetime_utc),
                    birthTimezone: r.birth_timezone,
                    locationText: r.location_text ?? undefined,
                    pillars: r.pillars_json,
                    dayMaster: r.day_master,
                    dayMasterElement: r.day_master_element,
                    dayMasterYinYang: r.day_master_yinyang,
                    elementTally: r.wuxing_balance_json,
                    wuxingBalancePercentages: r.wuxing_percentages_json,
                    dominantElements: r.dominant_elements,
                    deficientElements: r.deficient_elements,
                    balanceScore: r.balance_score,
                  };
                }
              } catch (baziErr) {
                console.log(`🌿 [WU XING] BaZi profile not loaded (optional):`, baziErr instanceof Error ? baziErr.message : 'unknown');
              }

              // 🌟 WESTERN BIRTH DATA + IDENTITY CONTEXT: Fetch birth data + pronouns for astrological and identity context
              try {
                const birthResult = await pool.query(
                  `SELECT birth_date, birth_time, birth_location_name, birth_timezone, pronouns
                   FROM members WHERE id = $1`,
                  [effectiveUserId]
                );
                if (birthResult.rows.length > 0) {
                  if (birthResult.rows[0].birth_date) {
                    westernBirthData = birthResult.rows[0];
                  }
                  // Surface pronouns as identity context for MAIA
                  if (birthResult.rows[0].pronouns) {
                    (meta as any).pronouns = birthResult.rows[0].pronouns;
                  }
                }
              } catch (birthErr) {
                console.log(`🌟 [BIRTH] Western birth data not found (optional)`);
              }

              // Wu Xing snapshot: personal constitution (from BaZi) + today's field.
              // When a member_bazi_profile row exists we derive the WuXingConstitution
              // (Day Master + element balance); otherwise constitution stays null and the
              // snapshot falls back to moment-only ("today's field").
              const moment = computeWuXingMoment(new Date(), timezone);
              const constitution = baziProfile ? computeWuXingConstitution(baziProfile) : null;
              const snapshot = buildWuXingSnapshot({ constitution, moment });
              let addendum = SYMBOLIC_LENS_BOUNDARY + '\n\n' + generateWuXingPromptAddendum(snapshot);
              const bridged: BridgedSnapshot | null = null;

              // Da Yun (10-year Luck Pillar) — a SEPARATE, available interpretive lens,
              // only computed when a personal chart exists. Appended to the Wu Xing
              // addendum so the whole Chinese/BaZi lens travels one channel. Framed as
              // available-not-imposed: MAIA decides if/when it actually illuminates.
              if (baziProfile) {
                try {
                  const pronouns = (meta as any)?.pronouns as string | undefined;
                  const gender: 'male' | 'female' = /\b(she|her)\b/i.test(pronouns || '') ? 'female' : 'male';
                  const dyFmt = new Intl.DateTimeFormat('en-US', { timeZone: baziProfile.birthTimezone, timeZoneName: 'shortOffset' });
                  const dyTzPart = dyFmt.formatToParts(baziProfile.birthDatetimeUtc).find(p => p.type === 'timeZoneName')?.value || 'UTC';
                  const dyTzm = dyTzPart.match(/GMT([+-])(\d+)/);
                  const dyTzOffset = dyTzm ? (dyTzm[1] === '+' ? 1 : -1) * parseInt(dyTzm[2]) * 60 : 0;
                  const dy = calculateDaYun(baziProfile.birthDatetimeUtc, gender, undefined, dyTzOffset);
                  const cp = dy.currentPeriod;
                  const progressPct = Math.round((dy.periodProgress ?? 0) * 100);
                  // Reframed framing (epistemic boundaries) — ablation-proven to remove the
                  // over-assertion the original framing caused: on general prompts the lens
                  // stays holstered; on explicit Chinese-cycle requests it engages but
                  // calibrated ("traditional associations, not a window into your actual life").
                  // See scripts/repro/dayun-ablation.ts. Deliberately omits the age/progress
                  // anchor the original arm latched onto as a personal-fact cue.
                  addendum += `\n\n## DA YUN — traditional 10-year-cycle REFERENCE DATA (not a reading, not evidence)\n`
                    + `EPISTEMIC BOUNDARIES (read before using):\n`
                    + `- The lines below are traditional symbolic associations for this cycle TYPE. They are NOT predictions, NOT facts about this member, NOT evidence about their current situation.\n`
                    + `- Possessing this framework gives you NO grounds to assert anything about the member's life. You still know only what they have actually told you. If you lack their story, say so — do not let the framework substitute for it.\n`
                    + `- Use ONLY if the member explicitly asks about their Chinese astrology or cycle. Do not volunteer it; do not reach for it on general life questions.\n`
                    + `- If an association conflicts with the member's lived experience, the lived experience wins.\n`
                    + `Reference (cycle type, ages ${cp.ageRange.start}-${cp.ageRange.end}): ${cp.element}, traditionally themed "${cp.lifeTheme}"; relation to Day Master ${baziProfile.dayMasterElement}: ${cp.natalHarmony}.\n`
                    + `Traditional associations for this cycle type (NOT claims about the member): ${cp.opportunities.join('; ')}. Frictions traditionally noted: ${cp.challenges.join('; ')}.`;
                  console.log(`🌿 [DA YUN] Current period: ${cp.element} ages ${cp.ageRange.start}-${cp.ageRange.end}, harmony=${cp.natalHarmony}, ${progressPct}% through`);
                } catch (dyErr) {
                  console.warn(`🌿 [DA YUN] Computation failed (proceeding without):`, dyErr instanceof Error ? dyErr.message : 'unknown');
                }
              }

              console.log(`🌿 [WU XING] Computed: moment dominant=${snapshot.moment.momentDominant.join('/')}, ${baziProfile ? `with BaZi profile (Day Master ${baziProfile.dayMaster}/${baziProfile.dayMasterElement}, dominant ${baziProfile.dominantElements.join('/')})` : 'without BaZi profile'}`);
              return { wuxingSnapshot: snapshot, bridgedSnapshot: bridged, wuxingAddendum: addendum };
            } catch (wuxingErr) {
              console.warn(`🌿 [WU XING] Computation failed (proceeding without):`, wuxingErr instanceof Error ? wuxingErr.message : 'unknown');
              return { wuxingSnapshot: null, bridgedSnapshot: null, wuxingAddendum: '' };
            }
          })()
        : Promise.resolve({ wuxingSnapshot: null as WuXingSnapshot | null, bridgedSnapshot: null as BridgedSnapshot | null, wuxingAddendum: '' }),

      // Astrology context (parallel leg 3)
      shouldLoadAstrology
        ? getAstrologyContextForUser(effectiveUserId).catch((e: unknown) => {
            console.warn('⚠️ [Astrology] Context load failed (non-blocking):', e instanceof Error ? e.message : e);
            return null;
          })
        : Promise.resolve(null as AstrologyContext | null),
    ]);

    console.log(`[MAIA step] memory+wuxing+astrology parallel complete dt=${msSince(start)}ms`);

    // Unpack memory bundle result
    let memoryBundle: MemoryBundle | null = memoryBundleResult;
    let memoryContext = '';

    if (memoryBundle) {
      memoryContext = MemoryBundleService.formatForPrompt(memoryBundle);
      console.log(`📦 [Route/MemoryBundle] Retrieved: ${memoryBundle.retrievalStats.totalCandidates} candidates → ${memoryBundle.memoryBullets.length} bullets`);
      console.log(`📦 [Route/MemoryBundle] Turns: ${memoryBundle.retrievalStats.turnsRetrieved} (same-session: ${memoryBundle.retrievalStats.turnsSameSession}, cross: ${memoryBundle.retrievalStats.turnsCrossSession})`);
      console.log(`📦 [Route/MemoryBundle] Relationship: encounters=${memoryBundle.relationshipSnapshot.encounterCount}, breakthroughs=${memoryBundle.relationshipSnapshot.breakthroughCount}`);
      if (memoryContext.length > 0) {
        console.log(`📦 [Route/MemoryBundle] Context preview (first 300 chars): ${memoryContext.slice(0, 300)}...`);
      } else {
        console.warn(`⚠️ [Route/MemoryBundle] memoryContext is EMPTY despite retrieval!`);
      }
    } else if (shouldBuildMemory) {
      console.warn(`⚠️ [Route/MemoryBundle] Build returned null`);
    }

    // Unpack Wu Xing result
    const { wuxingSnapshot, bridgedSnapshot, wuxingAddendum } = wuxingResult;

    // 🌟 Unpack astrology context
    const astrologyContext: AstrologyContext | null = astrologyContextResult;
    let astrologyAddendum: string | undefined;
    if (astrologyContext) {
      const detail = astrologyContext.contextDetail.length > 3000
        ? astrologyContext.contextDetail.slice(0, 3000) + '\n...[astrology detail capped]\n'
        : astrologyContext.contextDetail;
      astrologyAddendum = SYMBOLIC_LENS_BOUNDARY + '\n\n' + astrologyContext.contextHeader + detail;
      if (astrologyContext.hasBirthData) {
        console.log('🌟 [Astrology] Birth chart loaded:', {
          sun: astrologyContext.birthChart?.sun?.sign,
          moon: astrologyContext.birthChart?.moon?.sign,
          rising: astrologyContext.birthChart?.ascendant?.sign,
          retrogrades: astrologyContext.currentTransits.filter((t: any) => t.retrograde).map((t: any) => t.planet).join(', ') || 'none',
        });
      } else {
        console.log('🌟 [Astrology] No birth data - using cosmic weather only');
      }
    }

    // 🕸️ MEMBER WEB: Canonical context assembly via buildMemberLiveContext.
    // Single source of truth for patterns + summaries + journals — used by both
    // sovereign and oracle routes. Format via formatMemberWebForPrompt().
    let memberWebAddendum = '';
    let memberLiveCtx = null;
    if (isRecognizedUser && !isSanctuary) {
      const t_web_start = Date.now();
      const userName = (meta as any)?.userName as string | undefined;
      memberLiveCtx = await buildMemberLiveContext(effectiveUserId, {
        displayName: userName,
        maxSessions: 3,
        maxPatterns: 4,
        maxJournal: 5,
      });
      memberWebAddendum = formatMemberWebForPrompt(memberLiveCtx);
      const t_web_ms = Date.now() - t_web_start;
      const ctxDesc = describeLiveContext(memberLiveCtx);
      console.log(
        `🕸️ [CONTEXT] user=${memberRef(effectiveUserId)} ` +
        `patterns=${ctxDesc.patterns} summaries=${ctxDesc.sessions} ` +
        `journals=${ctxDesc.journal} essence=${ctxDesc.hasEssence ? 'Y' : 'N'} ` +
        `t_web=${t_web_ms}ms dt=${msSince(start)}ms`
      );
    }

    // 🚪 PLACE (House Presence, 2026-07-17): facts-only current-room context.
    // Arrives ONLY inside a member-sent message body; validated to a strict
    // allowlist of declarative fields (lib/maia/presence/place.ts). Renders a
    // present-tense orientation block that explicitly forbids inferring why
    // the member is there. Invalid/absent place → no block, never an error.
    const placeContextValidated = validatePlaceContext((body as any)?.place);
    const placeAddendum = placeContextValidated ? buildPlaceAddendum(placeContextValidated) : undefined;
    if (placeAddendum) {
      console.log(`🚪 [Route] place context applied: ${placeContextValidated!.placeId} (${placeContextValidated!.route})`);
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

    // 🤝 PRACTICE FIELD CONTEXT: Inject practitioner's accompaniment context when member
    // is a participant in an active Relationship Space. Received as context, not instructions.
    // Constitutional behavior is invariant across all Practice Fields.
    let practiceFieldAddendum: string | null = null;
    if (isRecognizedUser && !isSanctuary) {
      try {
        const spaceResult = await pool.query(
          `SELECT rs.id, rs.practitioner_display_name
           FROM relationship_spaces rs
           WHERE rs.participant_member_id = $1 AND rs.status = 'active' AND rs.consent_status = 'accepted'
           ORDER BY rs.created_at DESC LIMIT 1`,
          [userId]
        );
        if (spaceResult.rows.length) {
          const space = spaceResult.rows[0];
          const pfCtx = await buildPracticeFieldContext(space.id, space.practitioner_display_name);
          if (pfCtx) {
            practiceFieldAddendum = formatPracticeFieldContextForPrompt(pfCtx);
            console.log(`🤝 [Route] Practice Field context injected for space ${space.id.slice(0, 8)}…`);
          }
        }
      } catch (err) {
        console.warn('[Route] Practice Field context load failed (non-blocking):', err);
      }
    }

    // 🚪 AIN KNOWLEDGE GATE: Score 5 wells × awareness level (local regex, zero latency)
    let knowledgeGateResult: { source_mix: SourceContribution[]; awarenessState: any; awarenessDescription: string } | null = null;
    let knowledgeGateAddendum: string | null = null;
    if (process.env.AIN_KNOWLEDGE_GATE_ENABLED === '1' && !isSanctuary) {
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

    // ═══ MEMORY ORCHESTRATOR (Phase 1.5 — live activation in sovereign chat route) ═══
    // Build memory plan + forward-readiness BEFORE generation. Both flow into
    // maiaService through meta.memoryInfluenceAddendum / meta.forwardReadinessAddendum,
    // which the FAST/CORE/DEEP prompt assembly already reads
    // (lib/sovereign/maiaService.ts lines 1164 and 1170).
    // Gated by the same allowCrossSessionMemory check that gates the existing
    // memory bundle build — recognized user, not sanctuary.
    let memoryInfluenceAddendum: string | undefined;
    let forwardReadinessAddendum: string | undefined;
    // 🧬 Cut 1 — atoms (Layer 5) and health tracking (Layer 15)
    let atomsResult: MemoryAtomSnapshot[] = [];
    let atomsError = false;
    let atomsAddendum: string | undefined;
    // 💬 Phase 2 — Conversational recall (cross-session continuity, wire site
    // corrected per spec §IX). Block is built inside the if-block below, consumed
    // by maiaService.ts via meta.conversationalRecallAddendum.
    let conversationalRecallAddendum: string | undefined;
    let priorExchangesCount = 0;
    // 📖 Episodic Phase 2 — member-marked moments (substrate lane only). Block is
    // built inside the if-block below, consumed by maiaService.ts via
    // meta.episodicRecallAddendum. Does NOT open Themes/Reflections.
    let episodicRecallAddendum: string | undefined;
    let markedEpisodesCount = 0;
    // 🔗 RELATIONAL CONTEXT BRIDGE — read side.
    //
    // The member pressed "Take this to MAIA" on /relationships/[id]; the client
    // then rides `relationshipContextId` on every POST for the session
    // (components/OracleConversation.tsx). The reader has existed since the
    // bridge shipped, but its ONLY importer was app/api/oracle/conversation —
    // retired 410 (S2, 2026-07-17). Net effect in production: MAIA wrote
    // relational content on every live turn (observeRelationalContent below)
    // and never once read it back. This closes that loop on the live route.
    //
    // 🔒 SANCTUARY: symmetric with the observeRelationalContent gate below — a
    // sanctuary turn neither feeds nor reads Relationship Field retrieval.
    //
    // Explicit-handoff only. `allowRecentThreadFallback` stays off by the
    // service's own instruction ("ambient detection is membrane leakage if it
    // arrives before observation") — every fire here is a known member act.
    let relationalContextAddendum: string | undefined;
    let relationalContextId: string | undefined;
    if (userId && !isSanctuary) {
      const handoffId = (body as any)?.relationshipContextId;
      if (typeof handoffId === 'string' && handoffId.length > 0) {
        try {
          const relCtx = await getMemberActiveRelationalContext(userId, {
            relationshipId: handoffId,
          });
          if (relCtx) {
            relationalContextAddendum = formatRelationalContextForPrompt(relCtx);
            relationalContextId = relCtx.relationshipId;
            console.log('[MAIA/sovereign] relational-context', {
              memberRef: memberRef(userId),
              relationshipId: relCtx.relationshipId,
              mode: relCtx.mode,
              realm: relCtx.realm,
              continuitySignals: relCtx.continuitySignals.length,
              salientThemes: relCtx.salientThemes.length,
              currentTensions: relCtx.currentTensions.length,
              chars: relationalContextAddendum.length,
              emitted: true,
            });
          }
        } catch (err) {
          // Never block the turn on relational context — matches the Event Arc
          // convention the service was written against.
          console.warn('[MAIA/sovereign] relational-context load failed (non-critical):', err);
        }
      }
    }
    // 🧬 Developmental layer — declared outside the memory-orchestrator try block
    // so the count is in scope when buildMemoryHealth() reads it below. Prior bug:
    // loader ran every turn and orchestrator used the rows, but health input was
    // never wired → runtime_events.memory_layers.developmental reported 'empty'
    // despite 675 rows across 10 members in production. See DEVELOPMENTAL_LAYER_AUDIT_2026-05-26.md.
    let developmentalCount = 0;
    if (allowCrossSessionMemory && userId) {
      try {
        const [recentDevelopmentalMemories, recentThemeSignals] = await Promise.all([
          loadRecentDevelopmentalMemories(userId, 3),
          loadRecentThemeSignals(userId, 10),
        ]);
        developmentalCount = recentDevelopmentalMemories.length;

        // 🧬 Developmental block — substrate discoverability marker (matches the
        // [MAIA/sovereign] *-block ops grep pattern used by atoms / conversational).
        // Emission ≠ prompt-influence: orchestrator usage is logged separately in
        // the [MAIA/sovereign] memory-plan line below. This log proves the loader
        // returned rows for this member this turn — the substrate-side of axis 2
        // (emitted ↔ discoverable) of the substrate-crossing scaffold.
        console.log('[MAIA/sovereign] developmental-block', {
          count: recentDevelopmentalMemories.length,
          userId: memberRef(userId),
        });

        const memoryPlan = buildMemoryInfluencePlan({
          message,
          userId,
          conversationHistory: [],
          recentDevelopmentalMemories,
          recentThemeSignals,
          // The list route loads memory via MemoryBundleService (not the
          // relationshipMemory variable used by /api/between/chat). Pass false
          // for both flags — the orchestrator degrades gracefully on default-false.
          hasMemberLiveContext: false,
          hasRelationshipAnamnesis: false,
        });
        if (
          memoryPlan.shouldUseMemory ||
          memoryPlan.contradictionDetected ||
          memoryPlan.reinforcementCandidate ||
          memoryPlan.semanticCandidate ||
          memoryPlan.somaticCandidate ||
          memoryPlan.morphicCandidate
        ) {
          console.log('[MAIA/sovereign] memory-plan', summarizePlanForLog(memoryPlan));
        } else {
          console.log('[MAIA/sovereign] memory-plan inactive', {
            userId: memberRef(userId),
            developmentalCount: recentDevelopmentalMemories.length,
            themeCount: recentThemeSignals.length,
            msgLen: message.length,
          });
        }
        memoryInfluenceAddendum = memoryPlan.promptBlock || undefined;

        // 🧬 Layer 5 — member-placed portfolio atoms (consent-gated, non-synthesized)
        const loadedAtoms = await loadMemberMemoryAtomsForPrompt(userId);
        atomsResult = loadedAtoms;
        const atomsBlock = formatAtomsForPrompt(loadedAtoms);
        if (atomsBlock) {
          atomsAddendum = atomsBlock;
          console.log('[MAIA/sovereign] atoms loaded:', { count: loadedAtoms.length, userId: memberRef(userId) });
        } else {
          console.log('[MAIA/sovereign] atoms: none surfacable for this member');
        }

        // 💬 Phase 2 — Conversational recall (live route wire site per spec §IX).
        // Surfaces prior cross-session exchanges into the prompt with provenance
        // grounding. Suppression rules (opt-out / Sanctuary / empty / session-
        // resumption) live in the formatter; emission is logged here so production
        // verification can confirm the layer is participating. Sanctuary path is
        // structurally blocked above by allowCrossSessionMemory, but mode is
        // passed explicitly as defense-in-depth.
        try {
          const conversationalRecallEnabled = await loadConversationalRecallPref(userId);
          const priorCrossSessionExchanges = await loadPriorCrossSessionExchanges(userId, session.id, 6);
          priorExchangesCount = priorCrossSessionExchanges.length;
          const conversationalRecall = formatPriorExchangesForPrompt(priorCrossSessionExchanges, {
            recallEnabled: conversationalRecallEnabled,
            mode: isSanctuary ? 'Sanctuary' : null,
            currentSessionTurnCount: session.turn_count ?? 0,
            lastPriorSessionMinutesAgo: computeLastPriorSessionMinutesAgo(priorCrossSessionExchanges),
          });
          if (conversationalRecall.block) {
            conversationalRecallAddendum = conversationalRecall.block;
          }
          console.log('[MAIA] conversational-block', {
            candidateCount: priorCrossSessionExchanges.length,
            ...summarizePriorExchangesForLog(conversationalRecall),
            userId: memberRef(userId),
          });
        } catch (err) {
          console.warn('[MAIA] conversational-block error (non-fatal):', err);
        }

        // 📖 Episodic Phase 2 — member-marked moments only (never significance/
        // emotional_intensity/breakthrough_level inference). Suppression rules
        // (opt-out / Sanctuary / empty / non-recent) live in the formatter;
        // emission is logged here for production verification. Sanctuary path
        // is structurally blocked above by allowCrossSessionMemory, but mode is
        // passed explicitly as defense-in-depth.
        try {
          const episodicRecallEnabled = await loadEpisodicRecallPref(userId);
          const markedEpisodes = await loadRecentMarkedEpisodes(userId, 5);
          markedEpisodesCount = markedEpisodes.length;
          const episodicRecall = formatMarkedEpisodesForPrompt(markedEpisodes, {
            recallEnabled: episodicRecallEnabled,
            mode: isSanctuary ? 'Sanctuary' : null,
          });
          if (episodicRecall.block) {
            episodicRecallAddendum = episodicRecall.block;
          }
          console.log('[MAIA] episodic-block', {
            candidateCount: markedEpisodes.length,
            ...summarizeMarkedEpisodesForLog(episodicRecall),
            userId: memberRef(userId),
          });
        } catch (err) {
          console.warn('[MAIA] episodic-block error (non-fatal):', err);
        }

        // 🧾 Sprint 1 (Truth Layer) — Memory Transition Records: per-source
        // accountability for this turn's memory pathway (available → retrieved
        // → eligible → offered → injected, reasons as sentences, never scores).
        // Fire-and-forget observability: never blocks or alters the conversation.
        // Authority: MEMORY_SELECTION_PHILOSOPHY_RULING_INSTRUMENT_2026-08-04.md
        // (Stage 2), MAIA_OPERATIONAL_MEMORY_STAGED_REBUILD_CHARTER_2026-08-04.md §IV.
        recordMemoryTransitions({
          memberId: userId,
          sessionId: session.id ?? null,
          atoms: {
            retrieved: atomsResult.length,
            offered: atomsAddendum ? atomsResult.length : 0,
          },
          conversational: {
            retrieved: priorExchangesCount,
            offered: conversationalRecallAddendum ? priorExchangesCount : 0,
          },
          episodic: {
            retrieved: markedEpisodesCount,
            offered: episodicRecallAddendum ? markedEpisodesCount : 0,
          },
          developmental: {
            retrieved: developmentalCount,
            offered: memoryInfluenceAddendum ? developmentalCount : 0,
          },
        });

        const readiness = detectForwardReadiness(message);
        if (readiness.ready) {
          console.log('[MAIA/sovereign] forward-readiness', {
            signals: readiness.signals,
            preview: message.slice(0, 120),
          });
          forwardReadinessAddendum = buildForwardReadinessBlock();
        }
      } catch (memOrchErr) {
        atomsError = true;
        console.warn('[MAIA/sovereign] memory orchestrator non-fatal:', memOrchErr);
      }
    } else {
      console.log('[MAIA/sovereign] memory orchestrator skipped', {
        reason: isSanctuary ? 'sanctuary' : !userId ? 'no-userid' : 'anon-or-unrecognized',
        userId: userId ? memberRef(userId) : null,
      });
    }

    // 🌟 Layer 10 — breakthrough: count of member-marked atoms among those
    // surfaced. Atoms loader orders is_breakthrough DESC; a non-zero count
    // means a member-marked breakthrough reached the prompt block this turn.
    // Marker aligned with the production grep contract so the substrate
    // crossing is discoverable from ops, not just emitted into the void.
    const markedBreakthroughCount = atomsResult.filter((a) => a.isBreakthrough).length;
    if (markedBreakthroughCount > 0) {
      console.info('[MAIA/sovereign] breakthrough surfaced:', {
        memberRef: userId ? memberRef(userId) : null,
        markedCount: markedBreakthroughCount,
      });
    }

    // 🔬 Layer 15 — memoryHealth: what loaded, what failed, what is unknown (canon §VII)
    const memoryHealth: MemoryHealth = buildMemoryHealth({
      recentTurns: { count: session.turn_count ?? 0 },
      session: { present: !!session },
      relational: { present: !!(memoryBundle as any)?.recentTurns?.length || !!memoryBundle },
      // Layer 5 keeps its canon §VII name, but what feeds it is the atoms
      // loader ROW COUNT — no semantic retrieval exists on this path. The log
      // summary emits this truthfully as `atoms:` + `semantic_retrieval: false`
      // (Sprint 1 truth repair, 2026-08-04).
      semantic: { count: atomsResult.length, error: atomsError },
      // Breakthrough is a property of surfaced atoms (member-marked, never
      // system-set). If the atoms loader errored, breakthrough state is
      // unknown too — same dependency.
      breakthrough: { count: markedBreakthroughCount, error: atomsError },
      // Conversational layer (Phase 2, wire site corrected per spec §IX, 2026-05-24):
      // count is the retriever's candidate count (does NOT distinguish emitted from
      // suppressed — emission detail lives in the [MAIA] conversational-block log line).
      // 'ok' here means "the substrate carried candidate material this turn." Whether
      // that material actually reached the prompt is a separate signal.
      conversational: { count: priorExchangesCount },
      // 📖 Episodic layer (Phase 2, 2026-07-13): count is the retriever's
      // member-marked candidate count (does NOT distinguish emitted from
      // suppressed — emission detail lives in the [MAIA] episodic-block log
      // line). 'ok' here means "the member has marked moments this turn."
      episodic: { count: markedEpisodesCount },
      // 🧬 Developmental layer (wire site fix, 2026-05-26). loadRecentDevelopmentalMemories
      // runs every turn (line ~682) and the orchestrator uses the rows; the binding from
      // loader → health was missing, causing runtime_events.memory_layers.developmental to
      // report 'empty' despite 675 rows across 10 members in production. Same call-site
      // omission archetype as the FAST conversational fix in commit f74ab4204.
      // See DEVELOPMENTAL_LAYER_AUDIT_2026-05-26.md §XII.
      developmental: { count: developmentalCount },
    });
    if (isBaseChainDegraded(memoryHealth)) {
      console.warn('[MAIA/sovereign] memoryHealth — base chain degraded:', summarizeMemoryHealthForLog(memoryHealth));
    } else {
      console.log('[MAIA/sovereign] memoryHealth:', summarizeMemoryHealthForLog(memoryHealth));
    }

    // 🔐 De-frag step 3 — buildMaiaRuntimeContext: required contract before getMaiaResponse()
    // Validates routeId, inspects provider config, emits canonical 8-field observability log.
    // Non-blocking: unknown routeId = warn + passthrough (CI guard upgrade deferred to step 6).
    const runtimeContext = buildMaiaRuntimeContext({
      routeId: 'sovereign/app/maia/list',
      member: {
        userId: userId || null,
        sessionId: session.id,
        isSanctuary: isSanctuary || false,
        allowCrossSessionMemory: allowCrossSessionMemory || false,
      },
      memoryHealth,
      addenda: {
        memoryInfluence: memoryInfluenceAddendum,
        forwardReadiness: forwardReadinessAddendum,
        atoms: atomsAddendum,
        // 🔗 Relational Context Bridge — observability for the read side.
        relationalContext: relationalContextAddendum,
        memberWeb: memberWebAddendum || undefined,
        astrology: astrologyAddendum || undefined,
        studio: studioAddendum || undefined,
        knowledgeGate: knowledgeGateAddendum || undefined,
        wuxing: wuxingAddendum || undefined,
        // 💬 Phase 2 — conversational recall observability (PROMPT_BLOCK_CHARS sums this).
        // Emission detail lives in [MAIA] conversational-block log line above.
        conversational: conversationalRecallAddendum,
        // 📖 Phase 2 — episodic recall observability. Emission detail lives in
        // the [MAIA] episodic-block log line above.
        episodic: episodicRecallAddendum,
      },
    });

    // 🌀 Cut 2 — Spiral Orientation: read-only developmental context (no writes, no assertions)
    // PARKED: orientation thread is design-only until spine is verified. See import
    // block above for full reasoning. Do not re-enable without:
    //   1. explicit Cut 2 authorization,
    //   2. reconciliation of import path (lib/maia vs lib/orientation),
    //   3. reconciliation of return shape (SpiralOrientationResult vs DomainOrientation[]),
    //   4. and the Path A vs Path B decision.
    // let spiralOrientation: SpiralOrientationResult | undefined;
    // try {
    //   spiralOrientation = await buildMemberSpiralOrientation(userId);
    //   const { dataPresence } = spiralOrientation;
    //   console.log('[MAIA/sovereign] spiralOrientation:', {
    //     intentions: spiralOrientation.activeIntentions.length,
    //     themes: spiralOrientation.activeThemes.length,
    //     thresholds: spiralOrientation.recentThresholds.length,
    //     threads: spiralOrientation.thinkingThreads.length,
    //     hasAny: dataPresence.hasIntentions || dataPresence.hasThemes || dataPresence.hasThresholds || dataPresence.hasThreads,
    //   });
    // } catch (err) {
    //   console.warn('[MAIA/sovereign] spiralOrientation failed (non-blocking):', err);
    // }

    // 🔐 De-frag step 5 — assertProviderAvailable: throws before generation, never soft-returns.
    // ProviderUnavailableError is a named class — the outer catch handles it specifically.
    // Fail path returns 503 from infrastructure channel, never from MAIA's voice channel.
    await assertProviderAvailable();

    // 🎯 Use new three-tier processing system with voice integration
    orchestratorResult = await withTimeoutLabeled(
      'getMaiaResponse',
      getMaiaResponse({
        sessionId: session.id,
        input: message,
        includeAudio: includeAudio || false,
        voiceProfile: voiceProfile,
        // R1 serving-route witness (2026-08-13): declared at the HTTP boundary. Note
        // meta.endpoint below reports the SIBLING path '/api/sovereign/app/maia' — a
        // pre-existing mislabel left untouched by this diagnostic — which is exactly
        // why attribution must come from this explicit literal instead.
        originRoute: '/api/sovereign/app/maia/list',
        meta: {
          // 🔒 PROMPT-AUTHORITY INVARIANT (PBR-001, 2026-08-12)
          //
          //   Client-carried metadata may not override server-authored context that
          //   enters MAIA's system prompt.
          //
          // `meta` is the client request-body rest-spread (see the destructure at the
          // top of this handler): every unrecognised key the caller sends lands in it.
          // This spread previously sat BELOW the server-built fields, so a caller could
          // supply e.g. `memberWebAddendum` and overwrite the server's value. Those
          // fields are read straight out of meta by maiaService (`memberWebAddendum` at
          // :1180) and interpolated into the FAST system prompt (:1297) — i.e. the same
          // authority inversion SECREM-001 closed on the depthConfig channel.
          //
          // Moving the spread to the TOP restores the invariant for every server-authored
          // field at once, rather than re-sorting them one at a time and having the next
          // addition land on the wrong side. Client meta still reaches downstream
          // consumers that legitimately read it (sanctuary, pronouns, userName, surface,
          // studioContext, conversationHistory, mode); it simply cannot win a collision
          // with a field this handler computed.
          //
          // Statically established from source. Production exploitability NOT demonstrated
          // and deliberately not tested.
          ...meta,
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
          practiceFieldAddendum, // 🤝 Practice Field: practitioner accompaniment context
          knowledgeGateAddendum, // 🚪 AIN Knowledge Gate: source well modulation (Phase 1)
          memberWebAddendum: memberWebAddendum || undefined, // 🕸️ Member web: patterns + summaries + journals
          astrologyAddendum: astrologyAddendum || undefined, // 🌟 Natal chart + cosmic weather context
          // 🧠 MEMORY ORCHESTRATOR (Phase 1.5) — placed AFTER ...meta so server-built
          // addenda cannot be overridden by stale client-supplied meta.
          memoryInfluenceAddendum,
          forwardReadinessAddendum,
          atomsAddendum,               // 🧬 Layer 5 — member-placed portfolio atoms
          atomsLoadedCount: atomsResult.length, // 🔭 context-inventory: retrieved-atom count (loaded vs injected)
          conversationalRecallAddendum, // 💬 Phase 2 — system-retrieved cross-session continuity (per spec §IX)
          episodicRecallAddendum, // 📖 Phase 2 — member-marked moments (episodic layer, substrate lane only)
          relationalContextAddendum, // 🔗 Relational Context Bridge — member-handed-off relationship (explicit act)
          relationalContextId, // 🔭 context-inventory: which relationship was handed off
          placeAddendum, // 🚪 House Presence — facts-only current-room orientation
          // 🧱 CANONICAL EXCHANGE IDENTITY (F1 / U1 identity unification)
          //
          // ONE LOGICAL USER SEND = ONE CANONICAL EXCHANGE ID.
          //
          // This is the same id the acceptance-boundary write used above. Passing
          // it here stops getMaiaResponse from minting a second identity for the
          // SAME utterance — which is what turned one member send into two stored
          // exchanges (verification ruling D, 2026-08-10).
          //
          // `meta` is the established channel for this: sessionManager's
          // addConversationExchange already reads `meta.exchangeId` for exactly
          // this purpose. Placed AFTER ...meta so stale client meta cannot
          // override the server's canonical identity.
          exchangeId,
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

    // 🛡️ Canon §V post-generation scrubber — output-side memory guard.
    //
    // The §V prohibition also ships in the system prompt (MEMORY_CANON_GUARD_PROMPT,
    // injected via maiaService). That is an instruction the model can override, and on
    // 2026-08-04 it did: MAIA told an authenticated member "I don't have memory of
    // previous conversations each time we talk, I'm starting fresh" on this route while
    // atoms/episodic/developmental were all loaded and injected.
    //
    // scrubMemoryAmnesia was already wired into app/api/oracle/conversation/route.ts —
    // a route that receives ~zero live traffic — so production ran unprotected. Both
    // routes now call the same canonical guard from the same module; the enforcement
    // point lives where the traffic is.
    //
    // Applied immediately after generation and written back to orchestratorResult.text
    // so persistence (relationship essence, conversation history) and the client payload
    // all see the corrected text. This changes nothing about retrieval, the memory model,
    // or the consent posture — it only constrains what MAIA may claim about herself.
    //
    // hasLoadedContext selects the §VI replacement shape. It reports whether any memory
    // layer actually reached this turn — never whether one *could have*.
    if (orchestratorResult?.text) {
      const _memoryScrub = scrubMemoryAmnesia(orchestratorResult.text, {
        hasLoadedContext:
          atomsResult.length > 0 ||
          !!conversationalRecallAddendum ||
          !!episodicRecallAddendum ||
          !!memberWebAddendum ||
          !!memoryContext,
      });
      if (_memoryScrub) {
        console.warn('[MAIA] §V scrub fired', {
          rid: requestId,
          userId: memberRef(effectiveUserId),
          original_preview: orchestratorResult.text.slice(0, 200),
          replacement_preview: _memoryScrub.slice(0, 200),
        });
        orchestratorResult.text = _memoryScrub;
      }
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

    // 🎯 CLOSING ANCHOR: Deterministic post-generation repair (ported from between/chat)
    // Conditions: Care/counsel mode + turn 3+ + meaningful length + no anchor already present + not sanctuary
    // Applied before telemetry so the shape evaluator sees the final anchored text.
    let sovereignText = orchestratorResult.text ?? '';

    // 🧱 MAIA TURN DURABLE (F1 — second half of durable turn acceptance)
    //
    // The member's words became durable at acceptance; MAIA's words can only
    // become durable once they actually exist. That asymmetry is deliberate:
    // a generation that produced nothing must leave the member's utterance
    // standing alone rather than being erased alongside it, and must never
    // fabricate a MAIA turn to keep the pair symmetrical.
    //
    // Same exchangeId, seq 1, ON CONFLICT DO NOTHING — so the client's later
    // pair write for this same turn is a no-op instead of a duplicate.
    if (memberTurnDurable && sovereignText) {
      try {
        await withTimeoutLabeled(
          'durableMaiaTurn',
          TurnsStore.addExchangeTurn(turnPosture, null, {
            // Assistant half: generation is `synthesis` by role, so no member
            // action class applies and none is asserted.
            // Same sessionId as the member half, so both rows of the exchange
            // restore together under the session the client will ask for.
            userId: userId!,
            sessionId: acceptedSessionId,
            role: 'assistant',
            content: sovereignText,
            exchangeId,
          }),
          5000,
          start
        );
        console.log(`🧱 [MAIA/durability] MAIA turn durable exchange=${exchangeId.slice(0, 8)}`);
      } catch (durabilityErr: any) {
        // Member turn already stands. Losing the response here degrades the
        // record; it must not erase what the member said.
        console.error(
          `❌ [MAIA/durability] MAIA turn NOT durable exchange=${exchangeId.slice(0, 8)}:`,
          durabilityErr?.message ?? durabilityErr
        );
      }
    }

    const _conversationMode = (meta as any)?.mode ?? (meta as any)?.maiaMode?.mode ?? null;
    const _convHistory = (meta as any)?.conversationHistory;
    const _historyLen = Array.isArray(_convHistory) ? _convHistory.length : 0;
    // NOTE (2026-04-10): Hardcoded "sit with that tonight" closing-anchor REMOVED.
    // See app/api/between/chat/route.ts for rationale. Closing quality is now
    // governed by the system prompt CLOSING ANCHOR section only.

    // 📐 AIN SHAPE TELEMETRY: Continuity-stack metrics (fire-and-forget, never blocks)
    // Written from the sovereign route so continuity fields are populated for production traffic.
    if (!isSanctuary && sovereignText &&
        (process.env.AIN_SHAPE_TELEMETRY === '1' || process.env.NODE_ENV !== 'production')) {
      // _conversationMode and _convHistory already defined above (anchor block)
      const _voiceMode = _conversationMode;
      const _turnIndex = _historyLen;
      const _text = sovereignText;
      const _ainShape = assessAINResponseShape(message as string, _text);
      logAINShapeTelemetry({
        pass: _ainShape.pass,
        score: _ainShape.score,
        flags: _ainShape.flags,
        menuSignals: _ainShape.signals ?? null,
        route: 'sovereign/app/maia/list',
        model: rawModel ?? undefined,
        explorerId: effectiveUserId ?? undefined,
        sessionId: session.id,
        turnIndex: _turnIndex,
        mode: _voiceMode,
        activeThreadPresent: null,
        activeThreadConfidence: null,
        correctionDetected: _ainShape.flags.mirror === false &&
          /\b(i'?m sorry|let me clarify|that came out wrong|let me try that again|let'?s reset|i misspoke)\b/i.test(_text),
        optionResolutionMatched: null,
        optionResolutionNearMiss: null,
        ruptureFlag: false,
        ruptureType: null,
        assistantTurnType: classifyAssistantTurn(_text),
      }).catch((err) => {
        console.warn('[sovereign/maia/list] AIN shape telemetry write failed:', err?.message);
      });
    }

    // 📓 INTERRUPTION LEDGER (fire-and-forget, observation-only): per-turn friction/novelty/elegance
    // evidence of the runtime being changed by encounter. No raw content persisted — scores and
    // markers only, into agent_runs.meta. Sanctuary turns are refused here AND inside the module.
    // Observation instrument, not an interpreter: rows accumulate; nothing is concluded or surfaced.
    if (!isSanctuary && sovereignText && process.env.INTERRUPTION_LEDGER_ENABLED !== '0') {
      try {
        const _priorResponses = (Array.isArray(_convHistory) ? _convHistory : [])
          .map((h: any) => h?.maiaResponse ?? (h?.role === 'assistant' ? h?.content : null))
          .filter((t: any): t is string => typeof t === 'string' && t.length > 0)
          .slice(-5);
        const _ledger = computeInterruptionMetadata({
          memberMessage: message as string,
          assistantResponse: sovereignText,
          priorResponses: _priorResponses,
          sanctuary: isSanctuary,
        });
        if (_ledger) {
          console.log('[MAIA] interruption-ledger', {
            isInterruption: _ledger.isInterruption,
            markers: _ledger.friction.markers,
            novelty: Number(_ledger.novelty.toFixed(3)),
          });
          logAgentRun({
            sessionId: session.id,
            userId: effectiveUserId ?? undefined,
            agentName: 'interruption-ledger',
            epistemicMode: 'structured',
            source: 'interruption-ledger',
            status: 'ok',
            latencyMs: duration,
            meta: { ..._ledger, turnIndex: _historyLen },
            originRoute: '/api/sovereign/app/maia/list',
          }).catch(() => { /* fire-and-forget; never blocks the turn */ });
        }
      } catch (ledgerErr: any) {
        console.warn('[MAIA] interruption-ledger failed (non-blocking):', ledgerErr?.message);
      }
    }

    // 💫 ANAMNESIS WRITE (fire-and-forget): Capture relationship essence after each turn.
    // This ensures relationship_essences is updated even when using the sovereign route.
    if (effectiveUserId && !isSanctuary && orchestratorResult.text) {
      (async () => {
        try {
          const existingEssence = await loadRelationshipEssence(effectiveUserId);
          const anamnesis = getRelationshipAnamnesis();
          const userName = (meta as any)?.userName || existingEssence?.userName;
          const updatedEssence = anamnesis.captureEssence({
            userId: effectiveUserId,
            userName,
            userMessage: message,
            maiaResponse: orchestratorResult.text,
            conversationHistory: [
              { role: 'user', content: message },
              { role: 'assistant', content: orchestratorResult.text },
            ],
            spiralDynamics: {
              currentStage: wuxingSnapshot?.moment?.momentDominant?.[0] || null,
              dynamics: wuxingSnapshot ? `${wuxingSnapshot.moment.momentDominant.join('/')} moment` : 'Listening for patterns',
              humanExperience: '',
            },
            sessionThread: { emergingAwareness: [] },
            archetypalResonance: {
              primaryResonance: (knowledgeGateResult?.source_mix?.[0]?.source) || 'depth_psychology',
              sensing: null,
            },
            recalibrationEvent: null,
            fieldState: { depth: 0.7 },
            existingEssence: existingEssence || undefined,
          });
          await saveRelationshipEssence(updatedEssence);
          console.log(`💫 [ANAMNESIS] Essence saved: encounters=${updatedEssence.encounterCount} morphic=${updatedEssence.morphicResonance.toFixed(2)}`);
        } catch (anamnesisErr) {
          console.warn('[ANAMNESIS] Write failed (non-blocking):', anamnesisErr);
        }
      })();
    }

    // 🧠 MEMORY WRITEBACK (fire-and-forget): Learn durable facts from this conversation turn.
    // Sovereign route is always longterm-capable — mode forced to 'longterm' for writeback only.
    // This does NOT change the route-level memoryMode semantics; it only enables the write pipeline.
    if (effectiveUserId && !isSanctuary && sovereignText) {
      (async () => {
        try {
          const result = await MemoryWritebackService.writeBack({
            userId: effectiveUserId,
            sessionId: session.id,
            userMessage: message,
            assistantResponse: sovereignText,
            facetCode: (meta as any)?.element,
            element: (meta as any)?.element,
            memoryMode: 'longterm', // forced for writeback only — sovereign is always longterm-capable
            route: 'sovereign',
            timestamp: new Date(),
          });
          if (result.wrote) {
            console.log(`✅ [Sovereign/Writeback] Memory formed: ${result.memoryId} (significance threshold met)`);
          } else {
            console.log(`📝 [Sovereign/Writeback] Skipped: ${result.reason}`);
          }
        } catch (err) {
          console.warn('[Sovereign/Writeback] Failed (non-blocking):', err);
        }
      })();
    }

    // Unified response structure for new three-tier system with voice integration
    const responseData: any = {
      message: sovereignText,  // Uses closing-anchored text for counsel mode turns
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
      // 🔬 Layer 15 — memoryHealth: per-turn continuity health (canon §VII)
      memoryHealth,
      // 🔐 De-frag step 3 — runtimeContext: route identity + provider + prompt block summary
      runtimeContext: formatRuntimeContextForResponse(runtimeContext),
      // 🌀 Cut 2 — spiralOrientation: PARKED (see import + call-site comments above)
      // spiralOrientation,
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

    // Add audio data if synthesis was successful.
    // DESKTOP-VOICE-SHAPE-01: getMaiaResponse returns `audio` as a raw Buffer
    // (synthesizeMaiaVoice's contract). Reading `.audioBase64` off it yielded
    // undefined for every field and put `"audio": {}` on the wire, which reads
    // as "voice unavailable" to every client. Normalize at the boundary.
    const audioPayload = toAudioResponsePayload(orchestratorResult.audio);
    if (audioPayload) {
      responseData.audio = audioPayload;
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

    // 🔗 RELATIONAL OBSERVER: Silent background attunement (fire-and-forget)
    // 🔒 SANCTUARY MODE: a sanctuary turn must never feed relational observation or signal
    // persistence — its content must not become available to Relationship Field retrieval.
    if (userId && message && orchestratorResult.text && !isSanctuary) {
      observeRelationalContent(userId, message, orchestratorResult.text, { isSanctuary });

      // 🌊 RELATIONAL FIELD CARD: Phase 4 detection (fire-and-forget).
      try {
        const detected = detectRelationalSignal(message, orchestratorResult.text);
        console.warn('[Phase4] detection:', { detected: detected.detected, confidence: detected.confidence, counterpart: detected.counterpartLabel, tone: detected.tone });
        if (detected.detected) {
          const turnIdRaw = orchestratorResult.metadata?.turnId;
          const sourceTurnId =
            typeof turnIdRaw === 'number' && Number.isFinite(turnIdRaw) && turnIdRaw > 0
              ? turnIdRaw
              : null;
          persistDetectedSignal(userId, detected, null, sourceTurnId).catch((err) => {
            console.warn('[relationalSignals] persist error (non-blocking):', err?.message || err);
          });
        }
      } catch (sigErr) {
        console.warn('[relationalSignals] detect error (non-blocking):', sigErr);
      }
    }

    // ═══════════════════════════════════════════════════════════════════
    // Conversational Keep — explicit entrustment on the live route.
    // Detects ONLY member-directed filing instructions ("keep this",
    // "save this as an idea") via parseFilingInstruction — the member's own
    // words. Does NOT solicit keeps from salience (evaluateKeepOffer is
    // deliberately NOT ported): entrustment is declared by the member, never
    // inferred by the system. High-confidence filings are executed now (atom
    // written to member_memory_atoms — the SAME registry this route loads for
    // recall above), so an entrusted item becomes durable and visible to a
    // later session. Low-confidence filings are surfaced for confirmation.
    // Non-blocking and feature-flagged: any failure leaves keepIntent unset
    // and the conversational reply stands.
    // ═══════════════════════════════════════════════════════════════════
    if (userId && message && process.env.CONVERSATIONAL_KEEP_ENABLED === 'true') {
      try {
        const filing: FilingInstruction | null = parseFilingInstruction({ utterance: message });
        if (filing) {
          if (filing.confidence === 'high') {
            const atom = await applyConversationalKeepResult(userId, {
              kind: 'filing',
              instruction: filing,
              context: { sessionId },
            });
            responseData.keepIntent = {
              kind: 'filed',
              atomTitle: atom.title,
              destination: filing.destination,
            };
            console.log('[MAIA/sovereign] keep filed:', {
              userId: memberRef(userId),
              destination: filing.destination,
              atomId: atom.id,
            });
          } else {
            responseData.keepIntent = { kind: 'filing_confirmation', instruction: filing };
            console.log('[MAIA/sovereign] keep awaiting-confirm:', {
              userId: memberRef(userId),
              destination: filing.destination,
            });
          }
        }
      } catch (keepErr) {
        // Non-fatal: the conversational reply is never blocked by a keep failure.
        console.error('[MAIA/sovereign] keep sidecar error (non-fatal):', keepErr);
      }
    }

    if (userId) {
      emitSignal({ signal_type: 'conversation_started', context_type: 'member', context_id: userId, surface: 'maia/list' });
    }
    const response = jsonWithCors(req, responseData, 200, canonHeaders);
    return response;
  } catch (err: any) {
    const duration = Date.now() - start;

    // 🔐 PROVIDER_UNAVAILABLE: pre-generation guard fired — provider not configured or unreachable.
    // This path is structurally separate from MAIA's voice: the message below is never
    // generated by the provider that failed. It comes from this catch block only.
    // The client should render this as a system notice, not a MAIA chat turn.
    if (err instanceof ProviderUnavailableError) {
      console.error(`🚨 Provider unavailable (pre-generation) after ${duration}ms:`, err.message);
      return jsonWithCors(req, {
        error: 'PROVIDER_UNAVAILABLE',
        status: "Something went wrong in my processing layer just now. I'm not retrieving or responding reliably at the moment. Please try again in a moment.",
        route: {
          endpoint: '/api/sovereign/app/maia',
          type: 'Sovereign Consciousness Interface',
          operational: false,
          mode: 'provider-unavailable',
        },
        meta: {
          durationMs: duration,
          provider: err.provider,
          reason: err.reason,
        },
      }, 503);
    }

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