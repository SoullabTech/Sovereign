export const dynamic = 'force-dynamic';
// backend: app/api/sovereign/app/maia/route.ts

/**
 * ROUTING INVARIANT:
 * Set originRoute + (optional) processingProfileOverride HERE at the HTTP boundary.
 * Do not infer these deeper in the stack.
 */
import { NextRequest, NextResponse } from 'next/server';
import { observeRelationalContent } from '@/lib/consciousness/relationalObserver';
import { detectRelationalSignal } from '@/lib/relationships/detectRelationalSignal';
import { persistDetectedSignal } from '@/lib/relationships/relationshipSignalService';

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
import { buildWisdomGuideAddendum } from '@/lib/wisdom/wisdomGuidePrompt';
import { loadActiveGuide } from '@/lib/wisdom/wisdomGuidePersistence';
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
import { getRelationshipAnamnesis, saveRelationshipEssence, loadRelationshipEssence } from '@/lib/consciousness/RelationshipAnamnesisPostgres';
import { buildMemberLiveContext, formatMemberWebForPrompt, describeLiveContext } from '@/lib/memory/MemberLiveContext';
import { MemoryWritebackService } from '@/lib/memory/MemoryWriteback';
import { getAstrologyContextForUser, type AstrologyContext } from '@/lib/services/maiaAstrologyContextService';

// 🧠 MEMORY ORCHESTRATOR (Phase 1.5) — wired here because THIS is the live
// sovereign-MAIA route the UI actually hits (not /api/sovereign/app/maia/route.ts,
// which is dormant). Without this wiring MAIA confabulates about her own memory
// because the orchestrator (which exists in lib/maia/) was previously only
// invoked from /api/oracle/conversation and /api/between/chat. The 'list' in
// this filename is misleading — it serves the chat path.
// Reference implementation: app/api/between/chat/route.ts lines 1847–1885.
import { buildMemoryInfluencePlan, summarizePlanForLog } from '@/lib/maia/memoryOrchestrator';
import { loadRecentDevelopmentalMemories, loadRecentThemeSignals, loadPriorCrossSessionExchanges, loadConversationalRecallPref } from '@/lib/maia/memoryLoaders';
import { detectThemeRecurrence } from '@/lib/maia/recurrenceDetector';
import { detectForwardReadiness, buildForwardReadinessBlock } from '@/lib/maia/forwardReadiness';
// 🧬 Cut 1 — Layer 5 (Semantic/atoms) + Layer 15 (memoryHealth)
import { loadMemberMemoryAtomsForPrompt, formatAtomsForPrompt, type MemoryAtomSnapshot } from '@/lib/maia/memoryAtomsLoader';
import { buildMemoryHealth, summarizeMemoryHealthForLog, isBaseChainDegraded, type MemoryHealth } from '@/lib/maia/memoryHealth';
// 💬 Phase 2 — Conversational recall (wire site correction per spec §IX, 2026-05-24).
// Live route wire — replaces oracle/conversation/route.ts which receives no real traffic.
import { formatPriorExchangesForPrompt, summarizePriorExchangesForLog, computeLastPriorSessionMinutesAgo } from '@/lib/maia/conversationalRecallBlock';
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
import { buildWuXingSnapshot, computeWuXingMoment, generateWuXingPromptAddendum, type WuXingSnapshot } from '@/lib/consciousness/wuxingSnapshot';
import { type BridgedSnapshot } from '@/lib/consciousness/bridgedSnapshot';
import { pool } from '@/lib/db/postgres';
import { surfaceExchangeTurns } from '@/lib/sovereign/surfaceExchangeTurns';
import { logAINShapeTelemetry } from '@/lib/db/ainShapeTelemetry';
import { assessAINResponseShape } from '@/lib/ai/quality/ainResponseShape';
import { classifyAssistantTurn } from '@/lib/ai/quality/assistantTurnType';

// ─── Direct Recall ─────────────────────────────────────────────────────────────
import { isDirectRecallEnabled, locateMemoryObjects, materializeMemoryObject } from '@/lib/memory/directRecall';
import { detectDirectRecallIntent, detectConfirmationIntent, pendingRecalls } from '@/lib/memory/directRecall/intentDetector';

// ─── Noticing Experiment (Experiment 01 — "Something I noticed") ──────────────
// Flag OFF by default. Enable only for explicit tester pilots.
import { checkNoticingGate } from '@/lib/maia/noticingGate';
import { extractNoticingReferents } from '@/lib/maia/noticingObservations';

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

    // ─── DIRECT RECALL GATE ────────────────────────────────────────────────────
    // Short-circuits the full memory bundle + LLM call when the member explicitly
    // asks for something they saved. Two-turn flow:
    //   Turn 1: detect recall phrasing → locate → offer title/excerpt → store pending ref
    //   Turn 2: detect confirmation → materialize → return full content
    //
    // Invariants: fail-closed (any error falls through), never runs in Sanctuary,
    // only for recognized users, gated by DIRECT_RECALL_ENABLED=1.
    // ──────────────────────────────────────────────────────────────────────────
    if (isDirectRecallEnabled() && isRecognizedUser && !isSanctuary && userId) {
      try {
        const hasPending = pendingRecalls.has(userId);

        // Turn 2: confirmation of a previously offered recall
        if (hasPending && detectConfirmationIntent(message)) {
          const ref = pendingRecalls.get(userId)!;
          pendingRecalls.delete(userId);
          const materialized = await materializeMemoryObject(userId, ref, { isSanctuary });
          if (materialized) {
            const dateStr = materialized.createdAt.toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric',
            });
            const titlePart = materialized.title ? `"${materialized.title}"` : 'your saved note';
            const recallMsg =
              `Here it is — ${titlePart} (${materialized.provenance.sourceKind}, ${dateStr}):\n\n${materialized.body}`;
            console.log(`[MAIA/directRecall] materialized { sourceKind: "${materialized.provenance.sourceKind}", sourceId: "${ref.sourceId}" }`);
            return jsonWithCors(req, {
              message: recallMsg,
              route: {
                endpoint: '/api/sovereign/app/maia',
                type: 'Sovereign Consciousness Interface',
                operational: true,
                mode: 'direct-recall-materialized',
              },
              session: { id: session.id, turns: session.turns },
              metadata: {
                recallState: 'materialized',
                sourceKind: materialized.provenance.sourceKind,
                sourceId: ref.sourceId,
              },
            }, 200);
          }
          // Materialization returned null (ownership check failed / row gone) —
          // fall through so the LLM can respond gracefully.
        }

        // Clear stale pending when the member's next turn is not a confirmation
        if (hasPending && !detectConfirmationIntent(message)) {
          pendingRecalls.delete(userId);
        }

        // Turn 1: detect explicit recall phrasing → locate candidates → offer top result
        const { isRecall, query } = detectDirectRecallIntent(message);
        if (isRecall) {
          const refs = await locateMemoryObjects(userId, query, { isSanctuary });
          if (refs.length > 0) {
            const top = refs[0];
            pendingRecalls.set(userId, top);
            const dateStr = top.createdAt.toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric',
            });
            const titlePart = top.title ? `"${top.title}"` : 'something saved';
            const excerptPart = top.excerpt ? `\n\n> ${top.excerpt}` : '';
            const offerMsg =
              `I found ${titlePart} from ${top.provenance.sourceKind} (${dateStr}).${excerptPart}\n\nWould you like the full text?`;
            console.log(`[MAIA/directRecall] offered { sourceKind: "${top.provenance.sourceKind}", sourceId: "${top.sourceId}", confidence: ${top.confidence.toFixed(2)}, totalFound: ${refs.length} }`);
            return jsonWithCors(req, {
              message: offerMsg,
              route: {
                endpoint: '/api/sovereign/app/maia',
                type: 'Sovereign Consciousness Interface',
                operational: true,
                mode: 'direct-recall-offered',
              },
              session: { id: session.id, turns: session.turns },
              metadata: {
                recallState: 'offered',
                sourceKind: top.provenance.sourceKind,
                confidence: top.confidence,
                totalFound: refs.length,
              },
            }, 200);
          }
          // No results found — fall through so LLM can respond with context
          console.log(`[MAIA/directRecall] no results for query="${query.slice(0, 80)}"`);
        }
      } catch (recallErr) {
        // Fail-closed: any error falls through to normal conversational LLM path
        console.warn('[MAIA/directRecall] guard error (non-blocking):', recallErr instanceof Error ? recallErr.message : String(recallErr));
      }
    }
    // ─── END DIRECT RECALL GATE ────────────────────────────────────────────────

    // ─── NOTICING EXPERIMENT GATE (Experiment 01 — "Something I noticed") ──────
    // Pre-LLM, deterministic. Returns a fixed-string response; never calls getMaiaResponse.
    // OFF by default — enabled only via NOTICING_EXPERIMENT_ENABLED=1.
    // Architecture mirrors the Direct Recall gate above.
    //
    // Invariants: fail-closed, Sanctuary excluded, tester-gated, opt-in (DEFAULT FALSE),
    // no LLM, no inference. Full spec: docs/specs/EXPERIMENT_01_ATTENTION_MADE_VISIBLE_2026-06-20.md
    // ─────────────────────────────────────────────────────────────────────────────
    if (process.env.NOTICING_EXPERIMENT_ENABLED === '1' && isRecognizedUser && userId) {
      try {
        const noticingMeta = (meta as any)?.noticingReply as string | undefined;
        const noticingAnswer = (meta as any)?.noticingAnswer as string | undefined;
        const noticingUsefulness = (meta as any)?.noticingUsefulness as string | undefined;

        // ── Recognition branch: member has answered the reflective question ──────
        // DOCTRINE — the first articulation of recognition is constitutionally
        // protected space. MAIA records the answer and acknowledges the ACT of
        // sharing (never the content): no interpretation, affirmation, synthesis,
        // encouragement, or coaching. The first recognition is still forming, and
        // anything MAIA said now would change the conditions under which it develops.
        // The LLM is NEVER invoked here. (Continuing the thread — "Inquiry" — happens
        // only if the member explicitly asks, on a separate turn, not this one.)
        if (noticingAnswer) {
          await pool.query(
            `INSERT INTO noticing_events (member_id, event_type, answer_text) VALUES ($1, 'answered', $2)`,
            [userId, noticingAnswer],
          );
          console.log(`[MAIA/sovereign] noticing answered { memberIdPrefix: "${userId.slice(0, 8)}" }`);
          return jsonWithCors(req, {
            message: 'Thank you for sharing that.',
            route: {
              endpoint: '/api/sovereign/app/maia',
              type: 'Sovereign Consciousness Interface',
              operational: true,
              mode: 'noticing-acknowledged',
            },
            session: { id: session.id, turns: session.turns },
            metadata: { noticingState: 'acknowledged' },
          }, 200);
        }

        if (noticingUsefulness && ['yes', 'no', 'not_sure'].includes(noticingUsefulness)) {
          await pool.query(
            `INSERT INTO noticing_events (member_id, event_type, usefulness) VALUES ($1, 'usefulness', $2)`,
            [userId, noticingUsefulness],
          );
          console.log(`[MAIA/sovereign] noticing usefulness { memberIdPrefix: "${userId.slice(0, 8)}", value: "${noticingUsefulness}" }`);
          // Fall through — usefulness is a side-effect write; main response from LLM
        }

        if (noticingMeta === 'decline') {
          await pool.query(
            `INSERT INTO noticing_events (member_id, event_type) VALUES ($1, 'declined')`,
            [userId],
          );
          console.log(`[MAIA/sovereign] noticing declined { memberIdPrefix: "${userId.slice(0, 8)}" }`);
          return jsonWithCors(req, {
            message: 'Okay — I\'ll leave it.',
            route: {
              endpoint: '/api/sovereign/app/maia',
              type: 'Sovereign Consciousness Interface',
              operational: true,
              mode: 'noticing-declined',
            },
            session: { id: session.id, turns: session.turns },
            metadata: { noticingState: 'declined' },
          }, 200);
        }

        if (noticingMeta === 'accept') {
          // Compute referents at accept time (so the stored referents_json is current)
          const observations = await extractNoticingReferents(userId);
          const referents = observations?.referents ?? [];
          const referentsJson = JSON.stringify(referents.map((r) => ({ text: r.text, count: r.distinctTurnCount })));

          await pool.query(
            `INSERT INTO noticing_events (member_id, event_type, referents_json) VALUES ($1, 'accepted', $2)`,
            [userId, referentsJson],
          );
          console.log(`[MAIA/sovereign] noticing accepted { memberIdPrefix: "${userId.slice(0, 8)}", referentCount: ${referents.length} }`);

          const observationLines = referents
            .map((r) => r.observationSentence)
            .join('\n\n');
          const acceptMessage = referents.length > 0
            ? `${observationLines}\n\n${observations!.question}`
            : 'I don\'t have enough from our recent conversations to share just yet.';

          return jsonWithCors(req, {
            message: acceptMessage,
            route: {
              endpoint: '/api/sovereign/app/maia',
              type: 'Sovereign Consciousness Interface',
              operational: true,
              mode: 'noticing-observations',
            },
            session: { id: session.id, turns: session.turns },
            metadata: { noticingState: 'accepted', referentCount: referents.length },
          }, 200);
        }

        // ── Offer branch: check eligibility and surface the opening question ────
        // CONSTITUTIONAL RULE — the offer is subordinate to the conversation:
        // checkNoticingGate withholds it whenever the member's current message could
        // be an immediate human concern (only a clear, low-concern opener is eligible).
        // An attention experiment must never interrupt the very attention it tests.
        if (!noticingMeta && !noticingAnswer && !noticingUsefulness) {
          const gate = await checkNoticingGate({
            memberId: userId,
            isSanctuary,
            currentMessage: message,
          });

          if (gate.eligible && gate.observations) {
            // Record offer + stamp throttle column
            const referentsJson = JSON.stringify(
              gate.observations.referents.map((r) => ({ text: r.text, count: r.distinctTurnCount })),
            );
            await pool.query(
              `INSERT INTO noticing_events (member_id, event_type, referents_json) VALUES ($1, 'offered', $2)`,
              [userId, referentsJson],
            );
            await pool.query(
              `UPDATE members SET noticing_last_offered_at = NOW() WHERE id = $1`,
              [userId],
            );
            console.log(`[MAIA/sovereign] noticing offered { memberIdPrefix: "${userId.slice(0, 8)}", referentCount: ${gate.observations.referents.length} }`);

            return jsonWithCors(req, {
              message: 'I\'ve noticed something across our conversations. Would you like me to share it?',
              route: {
                endpoint: '/api/sovereign/app/maia',
                type: 'Sovereign Consciousness Interface',
                operational: true,
                mode: 'noticing-offer',
              },
              session: { id: session.id, turns: session.turns },
              metadata: { noticingState: 'offered' },
            }, 200);
          }
        }
      } catch (noticingErr) {
        // Fail-closed: any error falls through to normal conversational path
        console.warn(
          '[MAIA/noticing] gate error (non-blocking):',
          noticingErr instanceof Error ? noticingErr.message : String(noticingErr),
        );
      }
    }
    // ─── END NOTICING EXPERIMENT GATE ─────────────────────────────────────────

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
            console.log(`🧠 [Route/MemoryBundle] ATTEMPTING retrieval for user="${effectiveUserId}" mode="${memoryMode}"`);
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
              let baziProfile = null;
              let westernBirthData: { birth_date: string | null; birth_time: string | null; birth_location_name: string | null; birth_timezone: string | null } | null = null;
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

              // Moment-only Wu Xing ("today's field"). The prior code called
              // computeWuXingSnapshot() / createBridgedSnapshot() — neither symbol exists
              // in the current wuxingSnapshot / bridgedSnapshot modules, so it threw on
              // every turn and the catch below swallowed it (Chinese / Wu Xing silently
              // dark). Real builders: computeWuXingMoment + buildWuXingSnapshot +
              // generateWuXingPromptAddendum.
              //
              // Constitution (BaZi Day Master) is intentionally null: member_bazi_profile
              // has 0 rows and its real schema (user_id, pillars_json, wuxing_balance_json,
              // dominant_elements) differs from the legacy SELECT above. Wiring the
              // constitution path is a separate task gated on generating a profile row.
              const moment = computeWuXingMoment(new Date(), timezone);
              const snapshot = buildWuXingSnapshot({ constitution: null, moment });
              const addendum = generateWuXingPromptAddendum(snapshot);
              const bridged: BridgedSnapshot | null = null;

              console.log(`🌿 [WU XING] Computed: moment dominant=${snapshot.moment.momentDominant.join('/')}, ${baziProfile ? 'with' : 'without'} BaZi profile`);
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
      astrologyAddendum = astrologyContext.contextHeader + detail;
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
        `🕸️ [CONTEXT] user=${effectiveUserId.slice(0, 8)} ` +
        `patterns=${ctxDesc.patterns} summaries=${ctxDesc.sessions} ` +
        `journals=${ctxDesc.journal} essence=${ctxDesc.hasEssence ? 'Y' : 'N'} ` +
        `t_web=${t_web_ms}ms dt=${msSince(start)}ms`
      );
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
    // 🧬 Developmental layer — declared outside the memory-orchestrator try block
    // so the count is in scope when buildMemoryHealth() reads it below. Prior bug:
    // loader ran every turn and orchestrator used the rows, but health input was
    // never wired → runtime_events.memory_layers.developmental reported 'empty'
    // despite 675 rows across 10 members in production. See DEVELOPMENTAL_LAYER_AUDIT_2026-05-26.md.
    let developmentalCount = 0;
    // 🔁 Recurrence (#2, single-member) — declared outside the try block so the
    // pattern count is in scope at buildMemoryHealth(). themeSignalCount feeds
    // memoryHealth.pattern (closing the prior 0/100/0 watched-empty omission;
    // theme_signals IS the pattern substrate). recurringThemeCount is the
    // single-member recurrence receipt. Neither crosses member boundaries —
    // this is NOT Morphic (held behind the consent + aggregation gate).
    let themeSignalCount = 0;
    let recurringThemeCount = 0;
    if (allowCrossSessionMemory && userId) {
      try {
        const [recentDevelopmentalMemories, recentThemeSignals] = await Promise.all([
          loadRecentDevelopmentalMemories(userId, 3),
          loadRecentThemeSignals(userId, 10),
        ]);
        developmentalCount = recentDevelopmentalMemories.length;
        themeSignalCount = recentThemeSignals.length;

        // 🔁 Single-member recurrence (#2, Observation stage) — does one of THIS
        // member's own themes recur across distinct days in their recent history?
        // Member-scoped (WHERE member_id), read-only, graceful. Leaves a
        // discoverable receipt; does NOT surface to the member yet (surfacing is
        // gated behind members.recurrence_recall_enabled, wired in the next stage).
        // Explicitly not Morphic: no cross-member access.
        try {
          const recurrence = await detectThemeRecurrence(userId);
          recurringThemeCount = recurrence.recurringThemes.length;
          if (recurringThemeCount > 0) {
            const top = recurrence.recurringThemes[0];
            console.log('[MAIA/sovereign] recurrence', {
              memberIdPrefix: userId.slice(0, 8),
              recurringCount: recurringThemeCount,
              windowDays: recurrence.windowDays,
              topTheme: top.theme,
              topDistinctDays: top.distinctDays,
            });
          } else {
            console.log('[MAIA/sovereign] recurrence: none above threshold', {
              memberIdPrefix: userId.slice(0, 8),
              themeSignalCount,
            });
          }
        } catch (recErr) {
          console.warn('[MAIA/sovereign] recurrence error (non-fatal):', recErr);
        }

        // 🧬 Developmental block — substrate discoverability marker (matches the
        // [MAIA/sovereign] *-block ops grep pattern used by atoms / conversational).
        // Emission ≠ prompt-influence: orchestrator usage is logged separately in
        // the [MAIA/sovereign] memory-plan line below. This log proves the loader
        // returned rows for this member this turn — the substrate-side of axis 2
        // (emitted ↔ discoverable) of the substrate-crossing scaffold.
        console.log('[MAIA/sovereign] developmental-block', {
          count: recentDevelopmentalMemories.length,
          userId: userId.slice(0, 8) + '...',
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
            userId: userId.slice(0, 8) + '...',
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
          console.log('[MAIA/sovereign] atoms loaded:', { count: loadedAtoms.length, userId: userId.slice(0, 8) + '...' });
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
            userId: userId.slice(0, 8) + '...',
          });
        } catch (err) {
          console.warn('[MAIA] conversational-block error (non-fatal):', err);
        }

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
        userId: userId ? userId.slice(0, 8) + '...' : null,
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
        memberIdPrefix: userId ? userId.slice(0, 8) : null,
        markedCount: markedBreakthroughCount,
      });
    }

    // 🎯 EVIDENCE ENGINE: Governing question awareness for MAIA's prompt.
    // Injected only when still_alive atoms exist, not Sanctuary, and not the first turn.
    // MAIA holds this orientation silently — InvitationCard renders the offer; MAIA does not narrate it.
    let evidenceEngineAddendum: string | undefined;
    if (!isSanctuary && atomsResult.length > 0 && session.turns >= 1) {
      const hasStillAlive = atomsResult.some((a: any) => a.status === 'still_alive');
      if (hasStillAlive) {
        evidenceEngineAddendum = `🎯 EVIDENCE ENGINE — governing question

Still-alive living threads are present for this member. A representation has been made available alongside this response. You do not need to mention or narrate this — the invitation appears separately in the interface.

Governing question: "What evidence would help answer the next question we are trying to answer together?"

Hold these threads lightly. If the inquiry being worked with would genuinely benefit from knowing what has continued, trust that the evidence will reach the member through the interface. Do not surface thread titles or describe what the representation contains. Your response holds the conversation; the evidence system holds the retrieval.`;
      }
    }

    // 🔬 Layer 15 — memoryHealth: what loaded, what failed, what is unknown (canon §VII)
    const memoryHealth: MemoryHealth = buildMemoryHealth({
      recentTurns: { count: session.turn_count ?? 0 },
      session: { present: !!session },
      relational: { present: !!(memoryBundle as any)?.recentTurns?.length || !!memoryBundle },
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
      // 🧬 Developmental layer (wire site fix, 2026-05-26). loadRecentDevelopmentalMemories
      // runs every turn (line ~682) and the orchestrator uses the rows; the binding from
      // loader → health was missing, causing runtime_events.memory_layers.developmental to
      // report 'empty' despite 675 rows across 10 members in production. Same call-site
      // omission archetype as the FAST conversational fix in commit f74ab4204.
      // See DEVELOPMENTAL_LAYER_AUDIT_2026-05-26.md §XII.
      developmental: { count: developmentalCount },
      // 🔁 Pattern layer — theme_signals is the pattern substrate. Binding the
      // loaded count closes the prior 0/100/0 watched-empty omission (loader ran
      // per turn; loader→health bind was missing). Single-member theme recurrence
      // evidence — NOT Morphic / cross-member.
      pattern: { count: themeSignalCount },
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
        memberWeb: memberWebAddendum || undefined,
        astrology: astrologyAddendum || undefined,
        studio: studioAddendum || undefined,
        knowledgeGate: knowledgeGateAddendum || undefined,
        wuxing: wuxingAddendum || undefined,
        // 💬 Phase 2 — conversational recall observability (PROMPT_BLOCK_CHARS sums this).
        // Emission detail lives in [MAIA] conversational-block log line above.
        conversational: conversationalRecallAddendum,
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

    // 🧭 ARCHETYPAL STANDING SOURCE (member-chosen) — durable continuity (Guide-as-Operating-Lens Phase 1).
    // The persisted selection is the source of truth across sessions/devices; the
    // client meta.wisdomGuide (from localStorage) is a same-session fast-path
    // override so a just-made choice applies immediately without awaiting the write.
    let effectiveWisdomGuide = (meta as any)?.wisdomGuide;
    let wisdomGuideSelectedAt: string | undefined;
    if (!effectiveWisdomGuide) {
      const persistedGuide = await loadActiveGuide(effectiveUserId);
      if (persistedGuide) {
        effectiveWisdomGuide = persistedGuide.guide;
        wisdomGuideSelectedAt = persistedGuide.selectedAt;
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
          memberWebAddendum: memberWebAddendum || undefined, // 🕸️ Member web: patterns + summaries + journals
          astrologyAddendum: astrologyAddendum || undefined, // 🌟 Natal chart + cosmic weather context
          ...meta,
          // 🧭 ARCHETYPAL STANDING SOURCE (member-chosen) — built from the effective guide resolved above
          // (client meta.wisdomGuide for same-session immediacy, else the
          // server-persisted standing guide). Placed AFTER ...meta so it is
          // server-authoritative and cannot be overridden by client-supplied meta.
          wisdomGuideAddendum: buildWisdomGuideAddendum(effectiveWisdomGuide, { selectedAt: wisdomGuideSelectedAt }),
          // 🧠 MEMORY ORCHESTRATOR (Phase 1.5) — placed AFTER ...meta so server-built
          // addenda cannot be overridden by stale client-supplied meta.
          memoryInfluenceAddendum,
          forwardReadinessAddendum,
          atomsAddendum,               // 🧬 Layer 5 — member-placed portfolio atoms
          conversationalRecallAddendum, // 💬 Phase 2 — system-retrieved cross-session continuity (per spec §IX)
          evidenceEngineAddendum,       // 🎯 Evidence Engine — still-alive governing question awareness
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

    // 🎯 CLOSING ANCHOR: Deterministic post-generation repair (ported from between/chat)
    // Conditions: Care/counsel mode + turn 3+ + meaningful length + no anchor already present + not sanctuary
    // Applied before telemetry so the shape evaluator sees the final anchored text.
    let sovereignText = orchestratorResult.text ?? '';
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

    // 🔖 EPISODIC MARK ENABLEMENT (turn-primary provenance): surface the real
    // conversation_turns ids for THIS exchange so the client can offer the member
    // a "remember this" gesture. Read-only enablement — the episodic-mark guard
    // re-verifies ownership + Sanctuary at mark time. Skipped for Sanctuary
    // (a sanctuary moment must never be offered for persistence).
    const conversationTurns = isSanctuary ? null : await surfaceExchangeTurns(session.id);

    // Unified response structure for new three-tier system with voice integration
    const responseData: any = {
      message: sovereignText,  // Uses closing-anchored text for counsel mode turns
      // 🔖 Real conversation_turns ids for this exchange (member-mark enablement).
      conversationTurns,
      // 🌀 STATE VECTOR: Consciousness state reading (if check-in detected)
      stateVector: orchestratorResult.stateVector || null,
      // 🌿 PRACTICE: Recommended practice from state vector routing
      practiceRecommendation: orchestratorResult.practiceRecommendation || null,
      // 🗓️ PROPOSAL: pending calendar event awaiting member confirm (MAIA_CONSENT_GATES Art. 2)
      proposal: orchestratorResult.proposal || null,
      // 🎯 EVIDENCE ENGINE: Representation offers — evidence invited into conversation when it deepens understanding.
      // Computed server-side from loaded atoms. Only offered when: member has still_alive atoms + not first turn + not Sanctuary.
      // Governing doc: docs/architecture/EVIDENCE_ENGINE_2026-06-24.md
      representations: (() => {
        if (isSanctuary || !atomsResult || session.turns < 1) return null;
        const hasStillAlive = atomsResult.some((a: any) => a.status === 'still_alive');
        if (!hasStillAlive) return null;
        return [{
          id: 'still-alive',
          componentId: 'still-alive-panel',
          questionAnswered: 'What has remained alive?',
          invitationText: 'Would it help to look at what has continued?',
          evidenceSource: 'member_memory_atoms',
          confidence: 0.85,
        }];
      })(),
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

    // 🔗 RELATIONAL OBSERVER: Silent background attunement (fire-and-forget)
    if (userId && message && orchestratorResult.text) {
      observeRelationalContent(userId, message, orchestratorResult.text);

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