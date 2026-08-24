// @ts-nocheck - Prototype file, not type-checked
// backend: app/api/sovereign/app/maia/route.ts
//
// ═════════════════════════════════════════════════════════════════════════════
// STATUS:        dormant (see docs/architecture/MAIA_ROUTE_AUTHORITY_MAP.md)
// SUPERSEDED BY: /api/sovereign/app/maia/list (app/api/sovereign/app/maia/list/route.ts)
// SUPERSEDED ON: 2026-05-23
// REASON:        UI migrated to /list; 48h production-log audit on 2026-05-23
//                confirmed zero requests to this path (99 hits to /list, 0 here).
//
// Do not add new wiring here. Patches to this route will not reach live traffic.
// The Phase 1.5 memory orchestrator wiring present below was added in commit
// 930cc412e under the misapprehension that this was the canonical route; it has
// never fired in production and is preserved only as a no-op reference.
//
// For active runtime work on the sovereign MAIA chat path, edit
// /api/sovereign/app/maia/list/route.ts instead. See the Route Authority Map
// for the full surface inventory and the supersession protocol that produced
// this header (Divergence Pattern #5).
// ═════════════════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server';
import { getMaiaResponse } from '@/lib/sovereign/maiaService';
import { ensureSession, initializeSessionTable } from '@/lib/sovereign/sessionManager';
import { getCognitiveProfile } from '@/lib/consciousness/cognitiveProfileService';
import { enforceFieldSafety } from '@/lib/field/enforceFieldSafety';
import { isMaintenanceEnabled } from '@/lib/system/systemSettings';
import { isKnownActiveSession, touchActiveSession } from '@/lib/system/activeSessions';
import { observeRelationalContent } from '@/lib/consciousness/relationalObserver';
import { detectRelationalSignal } from '@/lib/relationships/detectRelationalSignal';
import { persistDetectedSignal } from '@/lib/relationships/relationshipSignalService';

// 🧠 MEMORY ORCHESTRATOR (Phase 1.5) — wired here so the live sovereign route
// receives the same memory plan + forward-readiness signals that /api/between/chat
// already gets. Without this wiring MAIA confabulates about her own memory because
// the orchestrator (which exists in lib/maia/) was previously only invoked from
// /api/oracle/conversation, a route the live UI no longer hits.
// Reference implementation: app/api/between/chat/route.ts lines 1847–1885.
import { buildMemoryInfluencePlan, summarizePlanForLog } from '@/lib/maia/memoryOrchestrator';
import { loadRecentDevelopmentalMemories, loadRecentThemeSignals } from '@/lib/maia/memoryLoaders';
import { detectForwardReadiness, buildForwardReadinessBlock } from '@/lib/maia/forwardReadiness';
import { probeAuthPosture } from '@/lib/auth/authPostureProbe';

// Import for build verification compatibility (not used in session-based implementation)
// @ts-ignore
import type { AetherConsciousnessInterface } from '@/lib/consciousness/aether/AetherConsciousnessInterface';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { unauthenticatedResponse } from '@/lib/auth/authFailure';

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

    // 🚧 Maintenance Mode Gate
    const effectiveSessionId = sessionId || 'default';
    const { enabled: maintenanceOn, message: maintenanceMsg } = await isMaintenanceEnabled();
    if (maintenanceOn) {
      const isKnown = await isKnownActiveSession(effectiveSessionId);
      if (!isKnown) {
        return NextResponse.json(
          { error: 'MAINTENANCE_MODE', message: maintenanceMsg },
          { status: 503 }
        );
      }
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

    // ─── AUTH-01-D · IDENTITY BOUNDARY ────────────────────────────────────────
    // Before this unit, `userId` came straight out of the request BODY and became
    // member identity with no credential anywhere in the handler. Any unauthenticated
    // caller could name any member and this route would read their developmental
    // memory into the prompt and write relational entries attributed to them — on the
    // route carrying ~99.6% of live conversation traffic.
    //
    // Anonymous conversation is preserved and is now STRUCTURALLY separate from member
    // identity:
    //   · member identity comes only from a verified session (getMemberIdFromRequest);
    //   · body `userId` is a CLAIM — it never selects a member, and a mismatch against
    //     the verified session fails closed;
    //   · no verified session ⇒ guest, and a guest reads no member material and writes
    //     nothing member-attributed.
    const verifiedMemberId = await getMemberIdFromRequest(req);
    const claimedUserId = typeof userId === 'string' ? userId.trim() : '';
    const isGuestMarker =
      claimedUserId === '' || claimedUserId === 'guest' || claimedUserId.startsWith('anon:');

    if (verifiedMemberId && claimedUserId && !isGuestMarker && claimedUserId !== verifiedMemberId) {
      console.warn(
        '[MAIA/sovereign] AUTH-01-D: body userId does not match the authenticated session — refusing (possible impersonation attempt)'
      );
      return unauthenticatedResponse('identity_mismatch');
    }

    // `memberId` is null for guests. Every member-scoped read/write below keys off it.
    const memberId: string | null = verifiedMemberId;

    // ⚠️ EXPLICIT GUEST NAMESPACE — required, not cosmetic.
    //
    // `cognitive_turn_events` is keyed by a bare `user_id` string
    // (lib/consciousness/cognitiveEventsService.ts:137 — `WHERE user_id = $1`). That
    // predicate is namespace-AGNOSTIC: it matches whatever string it is handed, with
    // nothing distinguishing a member id from a session id.
    //
    // And `session.id` is NOT trusted input — `ensureSession()` upserts whatever
    // `sessionId` arrived in the request BODY (lib/sovereign/sessionManager.ts:27).
    // So keying a guest's cognitive read on a bare `session.id` would hand the caller
    // an identity channel by another name: send `sessionId: "<a member's uuid>"` and the
    // profile read resolves to that member's rows.
    //
    // The `guest:` prefix makes collision with a member id structurally impossible —
    // member ids are bare UUIDs, and a prefixed string is not one. It is applied to the
    // WRITE path too (via `identityRef` below), so guest turns stay partitioned per
    // session instead of pooling into one shared bucket.
    //
    // ⚠️ Known and NOT closed here: `sessionId` itself is caller-supplied, so a caller
    // who knows another guest's session UUID can still join that conversation's guest
    // namespace. That is pre-existing session behaviour, out of AUTH-01-D's scope, and
    // it can no longer reach MEMBER material.
    const guestKey = `guest:${session.id}`;
    // A stable conversation label that is NOT an identity assertion.
    const identityRef: string = memberId ?? guestKey;
    // ──────────────────────────────────────────────────────────────────────────

    // Touch active session for maintenance mode tracking
    await touchActiveSession({
      sessionId: session.id,
      memberId: memberId ?? undefined,
      anonId: null,
    });

    // 🛡️ FIELD SAFETY GATE: Check if user is safe for field/symbolic work
    let cognitiveProfile = null;
    let fieldSafety = null;

    // AUTH-01-D: keyed to the VERIFIED member, or to the explicit guest namespace above
    // — never to a bare caller-supplied identifier. The protective field-safety gate
    // still runs for guests rather than being silently disabled for them.
    if (memberId || session.id) {
      try {
        cognitiveProfile = await getCognitiveProfile(identityRef);

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

    // ═══ MEMORY ORCHESTRATOR (Phase 1.5 — live activation in sovereign route) ═══
    // Build memory plan + forward-readiness BEFORE generation. Both flow into
    // maiaService through meta.memoryInfluenceAddendum / meta.forwardReadinessAddendum,
    // which the FAST/CORE/DEEP prompt assembly already reads
    // (lib/sovereign/maiaService.ts lines 1164 and 1170).
    // Loaders are graceful — empty arrays on failure, conversation continues.
    // Skipped for sanctuary sessions and anon/guest users.
    const isSanctuary = !!(meta as any)?.sanctuary;
    let memoryInfluenceAddendum: string | undefined;
    let forwardReadinessAddendum: string | undefined;
    // AUTH-01-D: gated on the VERIFIED member. The old guest/anon string checks are
    // gone because `memberId` is null for guests by construction — a guest can no
    // longer reach member developmental memory or theme signals by naming a member.
    if (!isSanctuary && memberId) {
      try {
        const [recentDevelopmentalMemories, recentThemeSignals] = await Promise.all([
          loadRecentDevelopmentalMemories(memberId, 3),
          loadRecentThemeSignals(memberId, 10),
        ]);
        const memoryPlan = buildMemoryInfluencePlan({
          message,
          userId: memberId,
          conversationHistory: [],
          recentDevelopmentalMemories,
          recentThemeSignals,
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
            userId: memberRef(memberId),
            developmentalCount: recentDevelopmentalMemories.length,
            themeCount: recentThemeSignals.length,
            msgLen: message.length,
          });
        }
        memoryInfluenceAddendum = memoryPlan.promptBlock || undefined;

        const readiness = detectForwardReadiness(message);
        if (readiness.ready) {
          console.log('[MAIA/sovereign] forward-readiness', {
            signals: readiness.signals,
            preview: message.slice(0, 120),
          });
          forwardReadinessAddendum = buildForwardReadinessBlock();
        }
      } catch (memOrchErr) {
        console.warn('[MAIA/sovereign] memory orchestrator non-fatal:', memOrchErr);
      }
    } else {
      console.log('[MAIA/sovereign] memory orchestrator skipped', {
        reason: isSanctuary ? 'sanctuary' : 'guest-or-unauthenticated',
        userId: memberId ? memberRef(memberId) : null,
      });
    }

    let orchestratorResult;

    // 🎯 Use new three-tier processing system with voice integration
    orchestratorResult = await withTimeout(
      getMaiaResponse({
        sessionId: session.id,
        input: message,
        includeAudio: includeAudio || false,
        voiceProfile: voiceProfile,
        // R1 serving-route witness (2026-08-13): declared at the HTTP boundary so the
        // turn record can be bound to the route that served it. meta.endpoint is NOT
        // usable for this — the /list sibling sets that field to this same path.
        originRoute: '/api/sovereign/app/maia',
        meta: {
          chatType: 'sovereign-interface',
          endpoint: '/api/sovereign/app/maia',
          safeMode: SAFE_MODE,
          // AUTH-01-D: verified member id, or a guest marker — never a caller-chosen member.
          userId: identityRef, // 🧠 Pass identity ref for Dialectical Scaffold logging
          cognitiveProfile, // 🧠 Pass cognitive profile for downstream use
          fieldRouting: fieldSafety?.fieldRouting, // 🛡️ Pass field routing decision
          fieldWorkSafe: fieldSafety?.allowed ?? true, // 🛡️ Pass safety flag
          ...meta,
          // 🧠 MEMORY ORCHESTRATOR (Phase 1.5) — placed AFTER ...meta so server-built
          // addenda cannot be overridden by stale client-supplied meta.
          memoryInfluenceAddendum,
          forwardReadinessAddendum,
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
      // 🌀 STATE VECTOR: Consciousness state reading (if check-in detected)
      stateVector: orchestratorResult.stateVector || null,
      // 🌿 PRACTICE: Recommended practice from state vector routing
      practiceRecommendation: orchestratorResult.practiceRecommendation || null,
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

    // 🔗 RELATIONAL OBSERVER: Silent background attunement (fire-and-forget)
    // 🔒 SANCTUARY MODE (RU-0, 2026-08-10): a sanctuary turn must never feed relational
    // observation or signal persistence — its content must not become available to
    // Relationship Field retrieval. This guard was present on the near-idle sibling
    // route (`./list/route.ts`) but MISSING here, on the route carrying ~99.6% of live
    // conversation traffic, so the containment boundary was effectively unenforced.
    // `observeRelationalContent` is not a logger: it auto-creates a `member_relationships`
    // row and writes `relationship_entries` whose content is MAIA's own summary of the
    // member's relational material. Those tables carry no `posture_at_creation`, so a
    // sanctuary-origin row could not be identified — let alone removed — afterwards.
    // Enforced by app/api/sovereign/app/maia/__tests__/relationalSanctuaryGuard.test.ts.
    probeAuthPosture(req); // [auth-posture] Phase 0 — log-only, high-traffic sample point
    // AUTH-01-D: relational entries are MEMBER-ATTRIBUTED, so they are written only for
    // a verified member. The old fallback chain (body userId → x-member-id header →
    // session id) let an unauthenticated caller write into another member's relational
    // field, and let a guest's material be attributed to a member.
    const observerMemberId = memberId;
    if (observerMemberId && message && orchestratorResult.text && !isSanctuary) {
      observeRelationalContent(observerMemberId, message, orchestratorResult.text, {
        isSanctuary,
      });

      // 🌊 RELATIONAL FIELD CARD: lightweight detection for /maia field card.
      // Fire-and-forget. Silent below the confidence threshold. Never blocks.
      // Captures the maia_turns.id (if present in the response metadata) so
      // the founder review page can join to the originating turn at render
      // time — the signal table itself never stores conversation content.
      try {
        const detected = detectRelationalSignal(message, orchestratorResult.text);
        if (detected.detected) {
          const turnIdRaw = orchestratorResult.metadata?.turnId;
          const sourceTurnId =
            typeof turnIdRaw === 'number' && Number.isFinite(turnIdRaw) && turnIdRaw > 0
              ? turnIdRaw
              : null;
          persistDetectedSignal(observerMemberId, detected, null, sourceTurnId).catch((err) => {
            console.warn('[relationalSignals] persist error (non-blocking):', err?.message || err);
          });
        }
      } catch (sigErr) {
        console.warn('[relationalSignals] detect error (non-blocking):', sigErr);
      }
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