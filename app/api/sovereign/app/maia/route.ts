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
import {
  resolveExplicitRelationshipId,
  readRequestedRelationshipId,
  logAttachmentOutcome,
} from '@/lib/relationships/resolveExplicitRelationshipId';
import { RELATIONAL_METHOD_ADDENDUM } from '@/lib/relationships/relationalWorkingMethod';
import { enforceArticleIIIConversational } from '@/lib/relationships/articleIIIConversational';
import { assessActionabilityFloor } from '@/lib/relationships/actionabilityFloor';
import { correctVerdictOverreach } from '@/lib/relationships/verdictOverreachDetector';
import { judgeVerdictOverreach } from '@/lib/relationships/verdictJudge';

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

    // Touch active session for maintenance mode tracking
    await touchActiveSession({
      sessionId: session.id,
      memberId: userId,
      anonId: null,
    });

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

    // ═══ MEMORY ORCHESTRATOR (Phase 1.5 — live activation in sovereign route) ═══
    // Build memory plan + forward-readiness BEFORE generation. Both flow into
    // maiaService through meta.memoryInfluenceAddendum / meta.forwardReadinessAddendum,
    // which the FAST/CORE/DEEP prompt assembly already reads
    // (lib/sovereign/maiaService.ts lines 1164 and 1170).
    // Loaders are graceful — empty arrays on failure, conversation continues.
    // Skipped for sanctuary sessions and anon/guest users.
    const isSanctuary = !!(meta as any)?.sanctuary;

    // 🤝 RELATIONAL WORKING METHOD — how MAIA works something live with another
    // person: the know/imagine instrument, the reply shape, the third-party
    // boundary, and the safety guardrail that stops mutual-dynamics work where
    // it would do harm.
    //
    // Server-owned constant, applied only when the turn genuinely came from a
    // Relationship Room. The client says WHICH relationship; it never supplies
    // the method, so this cannot become a prompt-injection surface.
    //
    // Skipped entirely under Sanctuary, like every other relational path here.
    const relationalMethodAddendum =
      !isSanctuary && readRequestedRelationshipId(meta)
        ? RELATIONAL_METHOD_ADDENDUM
        : undefined;
    if (relationalMethodAddendum) {
      console.log('🤝 [relational] working-method addendum applied');
    }

    let memoryInfluenceAddendum: string | undefined;
    let forwardReadinessAddendum: string | undefined;
    if (!isSanctuary && userId && userId !== 'guest' && !userId.startsWith('anon:')) {
      try {
        const [recentDevelopmentalMemories, recentThemeSignals] = await Promise.all([
          loadRecentDevelopmentalMemories(userId, 3),
          loadRecentThemeSignals(userId, 10),
        ]);
        const memoryPlan = buildMemoryInfluencePlan({
          message,
          userId,
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
            userId,
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
        reason: isSanctuary ? 'sanctuary' : !userId ? 'no-userid' : 'anon-or-guest',
        userId: userId ?? null,
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
        meta: {
          chatType: 'sovereign-interface',
          endpoint: '/api/sovereign/app/maia',
          safeMode: SAFE_MODE,
          userId: userId, // 🧠 Pass userId for Dialectical Scaffold logging
          cognitiveProfile, // 🧠 Pass cognitive profile for downstream use
          fieldRouting: fieldSafety?.fieldRouting, // 🛡️ Pass field routing decision
          fieldWorkSafe: fieldSafety?.allowed ?? true, // 🛡️ Pass safety flag
          ...meta,
          // 🧠 MEMORY ORCHESTRATOR (Phase 1.5) — placed AFTER ...meta so server-built
          // addenda cannot be overridden by stale client-supplied meta.
          memoryInfluenceAddendum,
          forwardReadinessAddendum,
          // 🤝 RELATIONAL WORKING METHOD — placed AFTER ...meta, with the same
          // reasoning as the memory addenda above: server-built, so a client
          // cannot inject or override prompt text. The room supplies only WHICH
          // relationship it is (validated), never the method itself.
          ...(relationalMethodAddendum ? { relationalMethodAddendum } : {}),
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

    // ── ARTICLE III — STRUCTURAL enforcement on the conversational reply ──
    //
    // The narrowest boundary able to inspect the COMPLETED response before it
    // becomes user-visible. Scoped to Relationship Room turns only, so general
    // MAIA conversation is untouched; a Sanctuary turn never reaches here with
    // a relationship id, so it is excluded by construction.
    //
    // This is a HARD BOUNDARY. The guidance in relationalWorkingMethod.ts is
    // convention the model may ignore — and did: "She probably does keep a
    // running tally" reached a member with that prompt rule already in force.
    let deliveredText: string = orchestratorResult.text;
    if (relationalMethodAddendum && typeof deliveredText === 'string') {
      const guarded = enforceArticleIIIConversational(deliveredText, message);
      if (guarded.fired) {
        console.warn(
          `⛔ [ArticleIII/conversational] enforced — ${guarded.actions
            .filter((a) => a.kind !== 'kept')
            .map((a) => `${a.kind}: ${(a as any).reason}`)
            .join(' | ')}`,
        );
        deliveredText = guarded.text;
      }

      // ── VERDICT / ADJUDICATION OVERREACH — STRUCTURAL, separate instrument ──
      // Different question from Article III: not "does MAIA claim to know the
      // OTHER person's interior" but "does MAIA settle the MEMBER'S OWN
      // experience for them" — "That is coercion. You didn't choose freely."
      // Consent is the member's to determine about their own life; MAIA
      // deciding it, in either direction, is a sovereignty violation.
      // Independently frozen from this point: do not fold into Article III.
      const verdictGuarded = correctVerdictOverreach(deliveredText);
      if (verdictGuarded.fired) {
        console.warn(
          `⛔ [VerdictOverreach] enforced — ${verdictGuarded.corrections
            .map((c) => c.reason)
            .join(' | ')}`,
        );
        deliveredText = verdictGuarded.text;
      }

      // ── ACTIONABILITY FLOOR — OBSERVATION ONLY, never correction ──────────
      // Refusing to psychologize or mutualize danger is necessary but not
      // sufficient: the member must leave with something reachable. This
      // cannot be corrected here — writing a reachable element would fabricate
      // text, and appending a resource would be a referral dispenser, which is
      // jurisdiction- and culture-bound and actively dangerous (leaving is the
      // most dangerous period in coercive control). So the ABSENCE is made
      // visible and the correction stays prompt-side, where it belongs.
      // ⛔ This never alters the reply.
      const floor = assessActionabilityFloor(deliveredText, message);
      if (floor.floorMissed) {
        console.warn(
          `⚠️ [ActionabilityFloor] MISSED — member disclosed [${floor.riskLabels.join(', ')}] ` +
            'and the reply offered nothing reachable' +
            (floor.closedIntrospectively ? ' (closed on an introspective question)' : ''),
        );
      } else if (floor.disclosureRisk) {
        console.log(
          `✅ [ActionabilityFloor] met — [${floor.riskLabels.join(', ')}] → [${floor.reachableLabels.join(', ')}]`,
        );
      }

      // ── VERDICT JUDGE — OBSERVER ONLY, built because two regex patch
      // cycles left explicit-coercion transcripts at 0/4 truly clean.
      // Answers exactly one question: does this reply settle the member's
      // own experience, consent, agency, or inner state as fact? Logged
      // alongside the regex verdict detector for direct comparison.
      // ⛔ Never alters `deliveredText`. Fire-and-forget would lose the
      // result before it could be logged against this turn, so it is
      // awaited — but its outcome influences nothing about what is sent.
      // A future correction step is a separate authorization, not implied
      // by this wiring.
      try {
        const judged = await judgeVerdictOverreach(deliveredText);
        if (judged.unavailable) {
          console.warn('⚖️ [VerdictJudge] unavailable — classification could not run');
        } else if (judged.verdictPresent) {
          console.warn(
            `⚖️ [VerdictJudge] VERDICT_PRESENT=true confidence=${judged.confidence} reason="${judged.reason}" evidence="${judged.evidenceSpan}"`,
          );
        } else {
          console.log(`⚖️ [VerdictJudge] clean confidence=${judged.confidence}`);
        }
      } catch (judgeErr) {
        console.warn('⚖️ [VerdictJudge] error (non-blocking):', (judgeErr as Error)?.message || judgeErr);
      }
    }

    // Unified response structure for new three-tier system with voice integration
    const responseData: any = {
      message: deliveredText,
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
    const observerMemberId = userId || req.headers.get('x-member-id') || session?.id;
    if (observerMemberId && message && orchestratorResult.text && !isSanctuary) {
      // 🔗 EXPLICIT RELATIONSHIP CONTEXT — "I am in this person's room".
      // Resolved INSIDE the sanctuary guard on purpose: explicit context must
      // never become a Sanctuary bypass, and a sanctuary turn performs no
      // relational lookup at all. Ownership is proved against the SERVER
      // session, never against `observerMemberId` — that value prefers a
      // body-supplied `userId`, so validating body-against-body would
      // authorize nothing. A refused id falls back to unattached behavior and
      // is logged distinguishably; it is never silently reassigned.
      const attachment = await resolveExplicitRelationshipId(meta);
      logAttachmentOutcome('sovereign/app/maia', attachment);
      const attachedRelationshipId =
        attachment.status === 'attached' ? attachment.relationshipId : null;

      observeRelationalContent(observerMemberId, message, orchestratorResult.text, {
        isSanctuary,
        explicitRelationshipId: attachedRelationshipId,
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
          persistDetectedSignal(observerMemberId, detected, attachedRelationshipId, sourceTurnId).catch((err) => {
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