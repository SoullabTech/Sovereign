// Production requires force-dynamic for per-user database access
export const dynamic = 'force-dynamic';
// backend: app/api/between/chat/route.ts

/**
 * ROUTING INVARIANT:
 * Set originRoute + (optional) processingProfileOverride HERE at the HTTP boundary.
 * Do not infer these deeper in the stack.
 */

// Force Node.js runtime (Edge runtime can't handle crypto, some libs)
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

export const revalidate = false;
import crypto from 'crypto';
import { generateMaiaTurn, generateSimpleMaiaResponse } from '@/lib/consciousness/maiaOrchestrator';
import { detectIntent, getIntentRoute, buildUiAction } from '@/lib/consciousness/intentRouter';
import {
  ruptureDetectionService,
  enhanceResponseIfRuptureDetected,
  type RuptureDetectionResult
} from '@/lib/consultation/rupture-detection-middleware';
import { getConversationHistory, getUserConversationHistory, initializeSessionTable, ensureSession, addConversationExchange } from '@/lib/sovereign/sessionManager';
import { ensureSchemaReady } from '@/lib/db/schemaGate';
import { loadRelationshipMemory } from '@/lib/memory/RelationshipMemoryService';
import { loadSignificantMoments, formatSignificantMomentsAddendum } from '@/lib/memory/SignificantMomentsService';
// 🜨 Durable divination memory in the live member room (MEMORY-DIVINATION-BETWEEN-ROOM-01).
// Same loader, same three authorships, same bounds as the /list wiring — no second formatter.
import { loadRecentIChingReadings, formatDivinationForPrompt, summarizeDivinationForLog } from '@/lib/maia/divinationRecallLoader';
import { memberRef } from '@/lib/privacy/memberRef';
import { inferAwarenessFromRelationship, type AwarenessLevel } from '@/lib/consciousness/awareness-levels';
import { scoreKnowledgeGate, type SourceContribution, type KnowledgeGateInput } from '@/lib/ain/knowledge-gate';
import { getAwarenessLevelDescription } from '@/lib/ain/awareness-levels';
import { buildGateContext, recommendConsultation, type GateContext } from '@/lib/ain/gates';
import { consult } from '@/lib/ain/consultation';
import type { ConsultationDecision, ConsultationResult } from '@/lib/ain/types';
import { getWisdomPrimerForUser } from '@/lib/consciousness/WisdomFieldPrimer';
import { inferStateVector, getDefaultStateVector, getDefaultPracticeRecommendation } from '@/lib/maia/state-vector/stateDefaults';
import { buildMemoryInfluencePlan, summarizePlanForLog } from '@/lib/maia/memoryOrchestrator';
import {
  loadMemberMemoryAtomsForPrompt,
  formatAtomsForPrompt,
  summarizeAtomsForLog,
} from '@/lib/maia/memoryAtomsLoader';
import {
  buildMemoryHealth,
  summarizeMemoryHealthForLog,
  isBaseChainDegraded,
} from '@/lib/maia/memoryHealth';
import { detectForwardReadiness, buildForwardReadinessBlock } from '@/lib/maia/forwardReadiness';
import { loadRecentDevelopmentalMemories, loadRecentThemeSignals } from '@/lib/maia/memoryLoaders';
import { developmentalMemory } from '@/lib/memory/DevelopmentalMemory';
import { loadVoiceCanonRules } from '@/lib/voice/voiceCanon';
import { buildEpistemicPathAddendum, type EpistemicPathSelection } from '@/lib/consciousness/epistemicPathPrompt';
import { getFrameworkPromptAddendum, getReflectionLensAddendum, type TherapeuticFramework, type ReflectionLens } from '@/lib/consciousness/therapeuticFrameworks';
import { renderVoice } from '@/lib/voice/voiceRenderer';
import { calculateBirthChart, type BirthChart, type BirthData, type PlanetPosition } from '@/lib/astrology/ephemerisCalculator';
import { calculateCurrentTransits, findTransitAspects, type TransitPositions, type AspectPattern } from '@/lib/astrology/transitCalculator';
import { loadSelfletContext, processSelfletAfterResponse, ensureInitialSelflet, type SelfletLoadResult, type Element } from '@/lib/memory/selflet';
import { validateSocraticResponse, type SocraticValidationResult } from '@/lib/validation/socraticValidator';
import { makeCanonHeaders } from '@/lib/sovereign/http/canonHeaders';
import { processNameChangeIfDetected } from '@/lib/consciousness/nameChangeDetection';
import { decisionPreflight, buildGovernorAddendum, type DecisionPacket } from '@/lib/sovereign/decisionGovernor';
import { buildRelationshipAddendumForUser } from '@/lib/consciousness/relationshipPolicy';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { hasContinuityAccess, toMemberTier } from '@/lib/auth/tierAccess';
import { normalizeConversationMode, isRelationshipMode, type ConversationMode } from '@/lib/api/conversationMode';
import { query } from '@/lib/db/postgres';
import { getSystemSetting } from '@/lib/system/systemSettings';
import { LimitsEnforcer, getMemberTier, type MemberTier, type EnforcementDecision } from '@/lib/limits/LimitsEnforcer';
import {
  computeMemberSpiralState,
  buildSpiralSnapshot,
  generateSnapshotPromptAddendum,
  type ConversationTurn
} from '@/lib/consciousness/spiralSnapshot';
import { isMaintenanceEnabled } from '@/lib/system/systemSettings';
import { isKnownActiveSession, touchActiveSession } from '@/lib/system/activeSessions';
import {
  checkResponseIntegrity,
  applyMinimalRevision,
  generateLensSwitchOptions,
  type IntegrityResult,
  type LensConsent
} from '@/lib/consciousness/integrityCheck';
import {
  computeWuXingMoment,
  computeWuXingConstitution,
  buildWuXingSnapshot,
  generateWuXingPromptAddendum,
  type BaZiProfile,
  type WuXingSnapshot
} from '@/lib/consciousness/wuxingSnapshot';
import {
  buildBridgedSnapshot,
  generateBridgePromptAddendum,
  type BridgedSnapshot,
  type SpiralSnapshotInput
} from '@/lib/consciousness/bridgedSnapshot';
import { resolveMemberDisplayName } from '@/lib/stellium/clients';
import { detectThemes, storeThemeSignal } from '@/lib/consciousness/participatoryRealityHelper';
import { storeTrustObservation, inferEngagementProxy, classifyResponseType, isTrustObservationEnabled } from '@/lib/trust/trustObservationService';
import { detectIdeaCandidate } from '@/lib/consciousness/ideaDetection';
import { logAINShapeTelemetry } from '@/lib/db/ainShapeTelemetry';
import { assessAINResponseShape } from '@/lib/ai/quality/ainResponseShape';
import { classifyAssistantTurn } from '@/lib/ai/quality/assistantTurnType';

// ═══════════════════════════════════════════════════════════════
// CONTEXT PLUMBING HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Tight gating for relationship memory: only returns true if memory has real content.
 * Avoids false positives from placeholder objects like {} or { version: "" }.
 */
function hasMeaningfulRelationshipMemory(m: unknown): boolean {
  if (!m || typeof m !== 'object') return false;
  const mem = m as Record<string, unknown>;
  // Shape drift escape hatch: recognize future markers
  if (typeof mem.kind === 'string' && (mem.kind as string).length > 0) return true;
  if (typeof mem.version === 'string' && (mem.version as string).length > 0) return true;
  // Real memory signals: summary text or populated arrays
  if (typeof mem.summary === 'string' && (mem.summary as string).trim().length > 0) return true;
  if (Array.isArray(mem.themes) && mem.themes.length > 0) return true;
  if (Array.isArray(mem.patterns) && mem.patterns.length > 0) return true;
  if (Array.isArray(mem.events) && mem.events.length > 0) return true;
  return false;
}

/**
 * Exhaustive switch tripwire: ensures all EnforcementDecision actions are handled.
 * - Compile-time: TS forces you to handle new actions if EnforcementDecision evolves
 * - Runtime: catches `as any` escapes or JSON drift with a loud error
 */
function assertNeverEnforcement(x: never): never {
  throw new Error(`[E_INVARIANT_ENFORCEMENT_ACTION] Unexpected enforcement action: ${JSON.stringify(x)}`);
}

// ═══════════════════════════════════════════════════════════════
// SELFLET SIGNAL INFERENCE (fallback when orchestrator doesn't compute)
// ═══════════════════════════════════════════════════════════════

function inferElementFromText(text: string): Element | undefined {
  const t = text.toLowerCase();

  const scores: Record<Element, number> = {
    fire: 0,
    water: 0,
    earth: 0,
    air: 0,
    aether: 0,
  };

  const bump = (el: Element, words: string[]) => {
    for (const w of words) if (t.includes(w)) scores[el] += 1;
  };

  bump('fire', ['decide', 'will', 'courage', 'anger', 'rage', 'passion', 'ignite', 'purpose', 'vision', 'drive']);
  bump('water', ['feel', 'feeling', 'grief', 'sad', 'cry', 'tears', 'heartbreak', 'longing', 'love', 'shame']);
  bump('earth', ['body', 'health', 'money', 'home', 'work', 'schedule', 'plan', 'practical', 'ground', 'stable']);
  bump('air', ['think', 'thought', 'mind', 'analyze', 'understand', 'logic', 'words', 'communicate', 'clarity']);
  bump('aether', ['soul', 'spirit', 'meaning', 'synchronic', 'dream', 'archetype', 'initiation', 'mystery']);

  const best = (Object.entries(scores) as Array<[Element, number]>)
    .sort((a, b) => b[1] - a[1])[0];

  // require at least one hit to avoid random element assignment
  return best && best[1] > 0 ? best[0] : undefined;
}

function inferBreakthroughFromText(userText: string): boolean {
  // Only check USER text to avoid false positives from MAIA's own response language
  const t = userText.toLowerCase();
  return /(it (just )?clicked|i realize|i realised|now i see|this makes sense|breakthrough|something shifted|aha\b)/i.test(t);
}

function inferEmotionalShiftFromText(userText: string): { from?: string; to: string; intensity: number } | undefined {
  const t = userText.toLowerCase();

  // lightweight: detect "to" state + intensity by keywords
  const high = ['overwhelmed', 'panicked', 'terrified', 'devastated', 'furious', 'desperate'];
  const mid = ['sad', 'anxious', 'stressed', 'angry', 'confused', 'hurt'];
  const low = ['uneasy', 'uncertain', 'tired', 'flat', 'off'];

  const hit = (arr: string[]) => arr.find(w => t.includes(w));

  if (hit(high)) return { to: hit(high)!, intensity: 0.85 };
  if (hit(mid)) return { to: hit(mid)!, intensity: 0.55 };
  if (hit(low)) return { to: hit(low)!, intensity: 0.30 };

  return undefined;
}

// ═══════════════════════════════════════════════════════════════
// 🌟 ASTROLOGICAL CONTEXT BUILDER
// ═══════════════════════════════════════════════════════════════

interface BirthDataInput {
  date?: string;
  time?: string;
  location?: {
    lat: number;
    lng: number;
    name?: string;
    timezone?: string;
  };
}

/**
 * Format a planet position for display
 */
function formatPlanetPosition(planet: string, pos: PlanetPosition, includeHouse: boolean = true): string {
  const retrograde = pos.retrograde ? ' ℞' : '';
  const house = includeHouse ? ` (House ${pos.house})` : '';
  return `${planet}: ${pos.sign} ${pos.degree.toFixed(1)}°${retrograde}${house}`;
}

/**
 * Format an aspect for display
 */
function formatAspect(aspect: AspectPattern): string {
  const orb = aspect.orb < 1 ? '(exact)' : `(${aspect.orb.toFixed(1)}° orb)`;
  const applying = aspect.applying ? 'applying' : 'separating';
  return `Transit ${aspect.transitPlanet} ${aspect.aspectType} natal ${aspect.natalPlanet} ${orb} - ${applying}`;
}

/**
 * Build full astrological context with calculated natal chart and current transits.
 * This gives MAIA deep astrological awareness for personalized cosmic insights.
 */
async function buildAstrologicalContextAddendum(birthData: BirthDataInput | undefined): Promise<string | null> {
  if (!birthData?.date) return null;

  const parts: string[] = [];
  parts.push('🌟 ASTROLOGICAL CONTEXT');
  parts.push('');

  // Check if we have enough data for full chart calculation
  const hasTime = !!birthData.time;
  const hasLocation = birthData.location?.lat !== undefined && birthData.location?.lng !== undefined;
  const canCalculateFullChart = hasTime && hasLocation;

  if (canCalculateFullChart) {
    try {
      // Calculate natal chart
      const chartData: BirthData = {
        date: birthData.date,
        time: birthData.time!,
        location: {
          lat: birthData.location!.lat,
          lng: birthData.location!.lng,
          timezone: birthData.location?.timezone || undefined,
        },
      };

      const natalChart = await calculateBirthChart(chartData);
      const currentTransits = await calculateCurrentTransits(new Date());
      const transitAspects = findTransitAspects(currentTransits, natalChart);

      // Format natal chart
      parts.push('═══ NATAL CHART ═══');
      parts.push('');
      parts.push('☉ LUMINARIES & PERSONAL PLANETS:');
      parts.push(formatPlanetPosition('Sun', natalChart.sun));
      parts.push(formatPlanetPosition('Moon', natalChart.moon));
      parts.push(formatPlanetPosition('Mercury', natalChart.mercury));
      parts.push(formatPlanetPosition('Venus', natalChart.venus));
      parts.push(formatPlanetPosition('Mars', natalChart.mars));
      parts.push('');

      parts.push('♃ SOCIAL PLANETS:');
      parts.push(formatPlanetPosition('Jupiter', natalChart.jupiter));
      parts.push(formatPlanetPosition('Saturn', natalChart.saturn));
      parts.push('');

      parts.push('♅ OUTER PLANETS (Generational):');
      parts.push(formatPlanetPosition('Uranus', natalChart.uranus));
      parts.push(formatPlanetPosition('Neptune', natalChart.neptune));
      parts.push(formatPlanetPosition('Pluto', natalChart.pluto));
      parts.push('');

      parts.push('☊ LUNAR NODES & CHIRON:');
      parts.push(formatPlanetPosition('North Node', natalChart.northNode));
      parts.push(formatPlanetPosition('South Node', natalChart.southNode));
      parts.push(formatPlanetPosition('Chiron', natalChart.chiron));
      parts.push('');

      parts.push('⬆ ANGLES:');
      parts.push(`Ascendant (Rising): ${natalChart.ascendant.sign} ${natalChart.ascendant.degree.toFixed(1)}°`);
      parts.push(`Midheaven (MC): ${natalChart.midheaven.sign} ${natalChart.midheaven.degree.toFixed(1)}°`);
      parts.push('');

      // Key natal aspects
      const majorAspects = natalChart.aspects.filter(a =>
        ['conjunction', 'opposition', 'square', 'trine'].includes(a.type) && a.orb < 5
      );
      if (majorAspects.length > 0) {
        parts.push('⚝ KEY NATAL ASPECTS:');
        majorAspects.slice(0, 8).forEach(a => {
          const marker = a.exact ? '★' : '•';
          parts.push(`${marker} ${a.planet1} ${a.type} ${a.planet2} (${a.orb.toFixed(1)}°)`);
        });
        parts.push('');
      }

      // Current transits
      parts.push('═══ CURRENT TRANSITS ═══');
      parts.push(`As of: ${new Date().toLocaleDateString()}`);
      parts.push('');

      // Filter to significant transits (outer planet aspects to personal planets)
      const significantTransits = transitAspects.filter(a => {
        const outerPlanets = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
        const personalPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];
        const isOuter = outerPlanets.includes(a.transitPlanet);
        const isPersonal = personalPlanets.includes(a.natalPlanet) ||
                          a.natalPlanet === 'Sun' || a.natalPlanet === 'Moon';
        return isOuter && isPersonal && a.orb < 5;
      });

      if (significantTransits.length > 0) {
        parts.push('☍ ACTIVE TRANSITS TO NATAL CHART:');
        significantTransits.slice(0, 6).forEach(t => {
          parts.push(`• ${formatAspect(t)}`);
        });
        parts.push('');
      } else {
        parts.push('No major outer planet transits to personal planets currently active.');
        parts.push('');
      }

    } catch (error) {
      console.error('[Astrology] Chart calculation error:', error);
      // Fall back to basic birth data
      parts.push(`Birth Date: ${birthData.date}`);
      parts.push(`Birth Time: ${birthData.time}`);
      if (birthData.location?.name) {
        parts.push(`Birth Location: ${birthData.location.name}`);
      }
      parts.push('');
      parts.push('(Full chart calculation unavailable - use general astrological knowledge)');
      parts.push('');
    }
  } else {
    // No time or location - just provide basic info
    parts.push(`Birth Date: ${birthData.date}`);
    if (!hasTime) {
      parts.push('Birth Time: Unknown');
    }
    if (!hasLocation) {
      parts.push('Birth Location: Unknown');
    }
    parts.push('');
    parts.push('Without birth time and location, focus on:');
    parts.push('- Sun sign qualities and general planetary positions');
    parts.push('- Avoid house placements, rising sign, or precise aspects');
    parts.push('');
  }

  // Guidelines
  parts.push('═══ INTEGRATION GUIDELINES ═══');
  parts.push('• Offer astrological insights when the conversation touches on patterns, timing, or self-understanding');
  parts.push('• Never lead with astrology unless asked specifically');
  parts.push('• Frame transits as invitations and weather, not predictions or fate');
  parts.push('• Connect archetypal patterns to their lived experience');
  parts.push('• Use phrases like "archetypally speaking" or "through an astrological lens"');
  parts.push('• Remember: astrology is pattern recognition, not fortune-telling');

  return parts.join('\n');
}

const SAFE_MODE = process.env.MAIA_SAFE_MODE === 'true';
const IS_PROD = process.env.NODE_ENV === 'production';
const INCLUDE_PROVIDER_META = process.env.MAIA_INCLUDE_PROVIDER_META === '1';

// Boot log: warn if simulation headers are enabled (helps debug unexpected behavior)
if (!IS_PROD && process.env.MAIA_MEMORY_SIM_HEADERS === '1') {
  console.warn('[Boot] ⚠️ MAIA_MEMORY_SIM_HEADERS=1 — simulation headers are ENABLED');
}

// MAIA_TRUST_BODY_ID_IN_PROD is permanently disabled — it used to let a client
// spoof userId via a body field in production (impersonation footgun). Warn
// loudly if the stale env var is still set so it gets removed.
if (IS_PROD && process.env.MAIA_TRUST_BODY_ID_IN_PROD === '1') {
  console.warn(
    '[Boot] MAIA_TRUST_BODY_ID_IN_PROD is set but IGNORED — body-id trust is permanently disabled in production. Remove this env var.'
  );
}

// Audit fingerprint secret - must be set in production for secure correlation
const AUDIT_FINGERPRINT_SECRET =
  process.env.MAIA_AUDIT_FINGERPRINT_SECRET ||
  (IS_PROD ? '' : 'dev-only-secret'); // Dev fallback OK, prod requires real secret

// Log warning at boot if missing (but don't throw - check inside handler instead)
if (IS_PROD && !process.env.MAIA_AUDIT_FINGERPRINT_SECRET) {
  console.error('🚨 WARNING: MAIA_AUDIT_FINGERPRINT_SECRET not set - will return 500 on requests');
}

// Helper to check required env vars inside handlers (avoids module-load crashes)
function checkRequiredEnvVars(): { ok: true } | { ok: false; error: string } {
  if (IS_PROD && !process.env.MAIA_AUDIT_FINGERPRINT_SECRET) {
    return { ok: false, error: 'MAIA_AUDIT_FINGERPRINT_SECRET is required in production' };
  }
  return { ok: true };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔍 AUDIT LOGGING: Privacy-safe structured events
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create a privacy-safe fingerprint for correlation without exposing raw values.
 * In dev: shows masked value (first 4 + last 4 chars)
 * In prod: shows HMAC-based fingerprint using secret from env
 */
function fingerprint(value: string | undefined, label: string): string {
  if (!value) return 'none';
  if (!IS_PROD) {
    // Dev: show masked value for debugging
    if (value.length <= 8) return `${value.slice(0, 2)}…${value.slice(-2)}`;
    return `${value.slice(0, 4)}…${value.slice(-4)}`;
  }
  // Prod: require secret for secure fingerprinting
  if (!AUDIT_FINGERPRINT_SECRET) return 'fp_unconfigured';

  // HMAC with secret + label + value (label prevents cross-field correlation attacks)
  const hmac = crypto.createHmac('sha256', AUDIT_FINGERPRINT_SECRET);
  hmac.update(label);
  hmac.update(':');
  hmac.update(value);
  return `fp_${hmac.digest('hex').slice(0, 12)}`;
}

/**
 * Generate a unique request ID for correlation across logs.
 */
function generateReqId(): string {
  return `req_${crypto.randomBytes(8).toString('hex')}`;
}

/**
 * Structured audit log for identity resolution decisions.
 * Never logs raw IDs in production - only booleans and fingerprints.
 */
function logIdentityResolution(reqId: string, data: {
  mode: string;
  explorerId?: string;
  bodyUserId?: string;
  effectiveUserId: string;
  sessionId: string;
  bodySessionIdProvided: boolean;
  cookieWasNew: boolean;
}) {
  console.log('[Audit:IdentityResolution]', {
    reqId,
    ts: new Date().toISOString(),
    env: IS_PROD ? 'prod' : 'dev',
    mode: data.mode,
    // Booleans - safe for any environment
    hasExplorerId: !!data.explorerId,
    hasBodyUserId: !!data.bodyUserId,
    bodySessionIdProvided: data.bodySessionIdProvided, // True if client sent sessionId (which we ignore)
    cookieWasNew: data.cookieWasNew,
    // Fingerprints - privacy-safe correlation
    effectiveUserFp: fingerprint(data.effectiveUserId, 'user'),
    sessionFp: fingerprint(data.sessionId, 'session'),
    // Guardrail flags
    devTrustEnabled: process.env.MAIA_DEV_TRUST_BODY_ID === '1',
  });
}

/**
 * Structured audit log for memory pipeline decisions.
 * Logs modes, gates, and counts - never content.
 * Ties identity → retrieval → injection under same reqId for incident timeline.
 */
function logMemoryPipelineDecision(reqId: string, data: {
  userId: string;
  sessionId: string;
  memoryModeEffective: string;
  sensitiveInput: boolean;
  counts: {
    turnsRetrieved: number;
    turnsSameSession: number;
    turnsCrossSession: number;
    semanticHits: number;
    breakthroughsFound: number;
    bulletsInjected: number;
  };
  relationshipEncounters: number;
  injected: boolean;
  bundleChars: number;
  recallQuality: number;
  bloatRisk: number;
  healthFlags: string[];
  reason?: string;
}) {
  console.log('[Audit:MemoryPipeline]', {
    reqId,
    ts: new Date().toISOString(),
    env: IS_PROD ? 'prod' : 'dev',
    userFp: fingerprint(data.userId, 'user'),
    sessionFp: fingerprint(data.sessionId, 'session'),
    mode: data.memoryModeEffective,
    sensitiveInput: data.sensitiveInput,
    counts: data.counts,
    relationshipEncounters: data.relationshipEncounters,
    injected: data.injected,
    bundleChars: data.bundleChars,
    recallQuality: data.recallQuality,
    bloatRisk: data.bloatRisk,
    healthFlags: data.healthFlags,
    reason: data.reason ?? null,
    longtermGate: {
      envEnabled: process.env.MAIA_LONGTERM_WRITEBACK === '1',
    },
  });

  // Optional warning log (gated by env)
  if (process.env.MAIA_MEMORY_ALERTS === '1' && data.healthFlags.length > 0) {
    console.warn('[Audit:MemoryPipeline:WARN]', {
      reqId,
      healthFlags: data.healthFlags,
      rq: data.recallQuality,
      br: data.bloatRisk,
      bc: data.bundleChars,
    });
  }
}

/**
 * Structured audit log for request completion.
 * Gives "incident timeline in 3 greps": identity → memory → complete
 */
function logRequestComplete(reqId: string, data: {
  ok: boolean;
  status: number;
  route: string;
  latencyMs: number;
  responseChars?: number;
  safeMode?: boolean;
  path?: 'simple' | 'orchestrator' | 'canon';
  errorCode?: string;
}) {
  console.log('[Audit:RequestComplete]', {
    reqId,
    ts: new Date().toISOString(),
    env: IS_PROD ? 'prod' : 'dev',
    ...data,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔒 SESSION MANAGEMENT: Cookie-based server-issued session IDs
// ═══════════════════════════════════════════════════════════════════════════════

// Cookie name: __Host- prefix in production for extra hardening
// (requires Secure + Path=/ + no Domain, prevents cookie injection/shadowing)
const SESSION_COOKIE_NAME = process.env.NODE_ENV === 'production' ? '__Host-maia_sid' : 'maia_sid';

/**
 * Build a session cookie string for the given session ID.
 * Extracted helper so we can set cookies for both generated and overridden sessions.
 */
function buildSessionCookie(sid: string): string {
  const isProd = process.env.NODE_ENV === 'production';
  const secure = isProd ? '; Secure' : '';
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(sid)}; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=${60 * 60 * 24 * 30}`;
}

/**
 * Get session ID from cookie or create a new one.
 * This prevents clients from spoofing session IDs via request body.
 * Uses NextRequest cookies API (more robust than regex parsing).
 */
function getOrCreateSessionId(req: NextRequest): { sid: string; setCookie?: string } {
  // Use Next.js cookies API - handles parsing edge cases
  const existingCookie = req.cookies.get(SESSION_COOKIE_NAME);
  if (existingCookie?.value) {
    return { sid: existingCookie.value };
  }

  // Create new server-issued session ID
  const sid = `sid_${crypto.randomBytes(16).toString('hex')}`;
  const setCookie = buildSessionCookie(sid);
  return { sid, setCookie };
}

/**
 * Helper to add Set-Cookie header to a NextResponse if needed.
 * Uses append() so additional cookies can be added later without overwriting.
 */
function withSessionCookie(res: NextResponse, setCookie?: string): NextResponse {
  if (setCookie) {
    res.headers.append('Set-Cookie', setCookie);
  }
  return res;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔮 CANON BYPASS: Detect identity/canon questions and return canon beads directly
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Detect if the user's question is about identity/canon that can be answered from canon beads
 */
function isCanonQuery(message: string): boolean {
  const m = message.toLowerCase();

  const canonPatterns = [
    // Identity / origin
    /who (is|are) kelly/,
    /kelly nezat/,
    /who created (this|maia)/,
    /who (made|built|designed) (this|maia)/,
    /who (is|are) (the )?founder/,

    // Framework canon
    /what is spiralogic/,
    /spiralogic (framework|model|phases)/,
    /what are the (12 )?phases/,
    /what is elemental alchemy/,
    /wisdom field/,

    // MAIA definition
    /what is maia/,
    /tell me about (maia|spiralogic|elemental alchemy|wisdom field)/,

    // MAIA architecture (PFI vs LLM)
    /is maia an llm/,
    /(do we|do you) have (an )?llm/,
    /\bpfi\b/,
    /panentheistic field intelligence/,
    /field intelligence/,
    /orchestration system/,
    /model-agnostic/,
    /swap (models|llms)/,
    /what kind of (model|system) is maia/,

    // MAIA capabilities / usage
    /what can maia do/,
    /what does maia do/,
    /what are maia'?s (capabilities|features)/,
    /(how|what) (does|can) maia (work|help)/,
    /how do i use maia/,
    /how to use maia/,
    /how does this platform work/,
    /what is this platform/,
    /what does this platform do/,

    // Modes
    /what are the modes/,
    /\b(talk|care|note)\b mode/,
    /talk mode/,
    /care mode/,
    /(note|scribe) mode/,
    /explain.*(talk|care|note).*modes?/,
    /tell me about.*\b(talk|care|note)\b.*(mode|modes)/,

    // Processing paths
    /what are.*(processing )?paths?/,
    /\b(fast|core|deep)\b.*(path|mode|processing)/,
    /explain.*(fast|core|deep)/,
    /tell me about.*\b(fast|core|deep)\b.*(path|paths|processing)/,

    // Sanctuary / privacy / consent
    /sanctuary/,
    /sanctuary mode/,
    /save as/,
    /privacy/,
    /three veils/,
    /sovereignty/,
    /consent/,

    // Memory / beads / context packs
    /beads/,
    /memory lattice/,
    /context packs/,
    /fields of wisdom/,
    /wisdom packs/,
  ];

  return canonPatterns.some((re) => re.test(m));
}

/**
 * Detect if this is a capabilities/usage question that needs multiple canon beads
 */
function isCapabilitiesQuery(message: string): boolean {
  const m = message.toLowerCase();
  return /what can maia do|capabilit|features|how does maia work|how do i use maia|modes|sanctuary|privacy|beads|context packs/.test(m);
}

/**
 * Query canon beads from database using tag-first routing + semantic search
 * Fixes acronym drift (e.g., "PFI" matching wrong beads or falling through to LLM)
 */
async function queryCanonBeads(message: string): Promise<string | null> {
  try {
    const m = message.toLowerCase();

    const wantsLLM =
      /\bllm\b/.test(m) ||
      m.includes('model-agnostic') ||
      m.includes('orchestration system') ||
      m.includes('swap models') ||
      m.includes('swap llms');

    const wantsPFI =
      /\bpfi\b/.test(m) ||
      m.includes('panentheistic field intelligence') ||
      m.includes('field intelligence');

    const wantsModes =
      /modes?|talk mode|care mode|note mode/.test(m);

    const wantsPaths =
      /processing\s+paths?/.test(m) ||
      /\b(fast|core|deep)\b.*(path|paths|processing)/.test(m);

    const wantsDoctrine = wantsModes || wantsPaths;

    // 1) TAG-FIRST (beats embeddings for acronyms + intent-specific canon)
    if (wantsLLM || wantsPFI || wantsDoctrine) {
      const tagHints: string[] = [];
      if (wantsLLM) tagHints.push('not-an-llm', 'architecture', 'orchestration');
      if (wantsPFI) tagHints.push('pfi', 'field-intelligence');
      if (wantsDoctrine) tagHints.push('voice:doctrine', 'doctrine');

      const tagged = await developmentalMemory.retrieveMemories({
        userId: 'CANON_GLOBAL',
        entities: tagHints,
        limit: 5,
      });

      const taggedWithText = tagged.filter(b => b.contentText);
      if (taggedWithText.length > 0) return taggedWithText[0].contentText!;
    }

    // 2) SEMANTIC (dynamic threshold; acronyms need a lower bar)
    const threshold = wantsPFI ? 0.25 : 0.6;

    const canonMatches = await developmentalMemory.semanticSearch(
      'CANON_GLOBAL',
      message,
      5,
      threshold
    );

    if (canonMatches.length === 0) return null;

    // 3) HEURISTIC PICK (if the question is LLM/PFI-ish, prefer that bead even if rank #2)
    if (wantsLLM || wantsPFI) {
      const preferred = canonMatches.find(b => {
        const tags = (b.entityTags ?? []).map(t => t.toLowerCase());
        const text = (b.contentText ?? '').toLowerCase();
        return (
          tags.includes('not-an-llm') ||
          tags.includes('pfi') ||
          tags.includes('field-intelligence') ||
          text.includes('not an llm model') ||
          text.includes('panentheistic field intelligence')
        );
      });

      if (preferred?.contentText) return preferred.contentText;
    }

    // Default: top match with text
    return canonMatches.find(b => b.contentText)?.contentText ?? null;
  } catch (error) {
    console.error('[CANON BYPASS] ❌ Error querying canon beads:', error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  const reqId = generateReqId();
  const startTime = Date.now();

  // 🔒 Fail-closed: check required env vars INSIDE handler (no module-load crash)
  const envCheck = checkRequiredEnvVars();
  if (envCheck.ok === false) {
    return NextResponse.json(
      { error: envCheck.error, errorCode: 'MISSING_ENV_VAR' },
      { status: 500 }
    );
  }

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
        errorCode: 'SCHEMA_BEHIND',
      },
      { status: 503 }
    );
  }

  try {
    // Initialize database tables if needed
    await initializeSessionTable();

    const body = await req.json();
    const { message, sessionId, mode: rawMode, userId: bodyUserId, userName, meta, sanctuary, localHour, epistemicPath, dominantElement, therapeuticFramework, reflectionLens, birthData } = body as {
      message?: string;
      sessionId?: string;
      mode?: 'dialogue' | 'counsel' | 'scribe' | 'normal' | 'patient' | 'session'; // Accept both naming conventions
      userId?: string;
      userName?: string;
      meta?: { explorerId?: string; sessionId?: string };
      sanctuary?: boolean;
      localHour?: number; // Client's local hour (0-23) for correct time-of-day greetings
      epistemicPath?: EpistemicPathSelection; // 🧭 User-chosen epistemic path
      dominantElement?: 'water' | 'fire' | 'earth' | 'air'; // User's elemental signature
      therapeuticFramework?: 'auto' | 'jungian' | 'cbt' | 'somatic' | 'ifs' | 'relational' | 'humanistic' | 'existential';
      reflectionLens?: 'auto' | 'jungian' | 'somatic' | 'relational' | 'narrative';
      birthData?: { // 🌟 User's birth data for astrological context
        date?: string;
        time?: string;
        location?: {
          lat: number;
          lng: number;
          name?: string;
          timezone?: string;
        };
      };
    };

    // 🔄 MODE NORMALIZATION: Map client mode names to API mode names
    // Client uses: normal/patient/session, API expects: dialogue/counsel/scribe
    const mode = normalizeConversationMode(rawMode);

    // 🔒 SANCTUARY MODE: Session-level memory exclusion (consent boundary)
    // When true: no content retention, no patterns formed, no training data
    const isSanctuary = sanctuary === true;

    // Voice Renderer request flags
    const voiceEngine = (body?.voiceEngine as 'local' | 'claude' | undefined) ?? 'local';
    const allowRemoteRendering = body?.allowRemoteRendering === true;

    // Canon Wrap: Two-key turn (server must allow + client must request)
    const serverAllowsCanonWrap = process.env.CANON_WRAP_ENABLED === '1';
    const allowCanonWrap = serverAllowsCanonWrap && body?.allowCanonWrap === true;

    // 🔒 SESSION: Get server-issued session ID from cookie (prevents spoofing)
    const { sid: generatedSessionId, setCookie: generatedCookie } = getOrCreateSessionId(req);

    // DEV/E2E override: allow explicit body.sessionId only when you opt-in.
    // (Prod stays server-owned.)
    const allowBodySessionId =
      process.env.NODE_ENV !== 'production' &&
      process.env.MAIA_ALLOW_BODY_SESSION_ID === '1';

    const requestedSessionId =
      typeof sessionId === 'string' ? sessionId.trim() : '';

    const safeSessionId =
      allowBodySessionId && requestedSessionId
        ? requestedSessionId
        : generatedSessionId;

    // If we override, ALSO set cookie to match safeSessionId
    // so subsequent requests without sessionId stay in the same session.
    const sessionCookie =
      allowBodySessionId && requestedSessionId
        ? buildSessionCookie(safeSessionId)
        : generatedCookie;

    // ═══════════════════════════════════════════════════════════════════════
    // 🚧 MAINTENANCE MODE: Block new sessions, allow existing ones to finish
    // ═══════════════════════════════════════════════════════════════════════
    const { enabled: maintenanceOn, message: maintenanceMsg } = await isMaintenanceEnabled();
    if (maintenanceOn) {
      const isKnown = await isKnownActiveSession(safeSessionId);
      if (!isKnown) {
        return withSessionCookie(
          NextResponse.json(
            { error: 'MAINTENANCE_MODE', message: maintenanceMsg },
            { status: 503 }
          ),
          sessionCookie
        );
      }
    }

    if (!message || typeof message !== 'string') {
      return withSessionCookie(
        NextResponse.json({ error: 'Message is required' }, { status: 400 }),
        sessionCookie
      );
    }

    // ✅ IDENTITY RESOLUTION: Server-authoritative in production, flexible in dev
    const explorerId = meta?.explorerId;

    // 🔐 DEV-ONLY: Trust body ID is a local-testing convenience and can NEVER
    // apply in production. The MAIA_TRUST_BODY_ID_IN_PROD prod escape hatch was
    // removed — it let a client spoof identity via a body field (impersonation).
    const TRUST_BODY_ID =
      process.env.MAIA_DEV_TRUST_BODY_ID === '1' && !IS_PROD;

    // =========================================================================
    // SERVER-SIDE IDENTITY: Validate session and derive identity server-side
    // This prevents "Kelly" name bleed where stale localStorage sends wrong name
    // =========================================================================
    let authUserId: string | null = null;
    let serverUserName = 'Friend'; // Safe fallback
    try {
      const serverSession = await getCurrentSession();
      if (serverSession) {
        authUserId = serverSession.memberId;
        // Derive userName from database - never trust client-sent name
        const memberResult = await query(
          `SELECT name, preferred_name FROM members WHERE id = $1`,
          [serverSession.memberId]
        );
        if (memberResult.rows.length > 0) {
          const member = memberResult.rows[0];
          serverUserName = resolveMemberDisplayName(member, 'Friend');
        }
      }
    } catch (err) {
      console.warn('[Chat API] Could not validate server session:', err);
      // Graceful degradation - continue without server auth
    }

    let effectiveUserId: string;
    if (authUserId) {
      // ✅ Server-verified identity (future: from NextAuth, Clerk, etc.)
      effectiveUserId = authUserId;
    } else if (TRUST_BODY_ID) {
      // 🧪 Trust enabled (local dev OR explicit prod opt-in for testing)
      effectiveUserId = explorerId
        ? explorerId
        : (typeof bodyUserId === 'string' && bodyUserId.trim().length > 0)
          ? bodyUserId.trim()
          : `anon:${safeSessionId}`;
    } else if (IS_PROD) {
      // 🔒 Production: Always session-scoped, never trust client body
      effectiveUserId = `anon:${safeSessionId}`;
    } else {
      // 🔒 Dev mode without trust: Session-scoped (safe default)
      effectiveUserId = `anon:${safeSessionId}`;
    }

    // 🌀 SELFLET eligibility (allow override for local testing)
    const SELFLET_ALLOW_ANON = process.env.MAIA_SELFLET_ALLOW_ANON === '1';
    const isAnon = effectiveUserId.startsWith('anon:');

    // Stable anon ID for usage tracking - prefer header (shared with voice routes)
    // This ensures Free tier limits accumulate consistently across text AND voice
    const headerAnonId = req.headers.get('x-maia-anon-id') ?? undefined;
    if (isAnon && !headerAnonId) {
      console.warn('[limits] Missing x-maia-anon-id header; text usage may not accumulate properly');
    }
    const stableAnonId = isAnon ? (headerAnonId || effectiveUserId) : undefined;
    const selfletEligible = SELFLET_ALLOW_ANON || !isAnon;

    // 🔒 ACTIVE SESSION: Mark this session as active (for maintenance mode tracking)
    await touchActiveSession({
      sessionId: safeSessionId,
      memberId: authUserId,
      anonId: stableAnonId,
    });

    // 👤 GUEST CONTEXT: Explicit messaging when context is unavailable
    // Prevents MAIA from hallucinating "I remember you" or assuming prior history
    const guestContextAddendum = isAnon
      ? `👤 GUEST CONTEXT NOTE:
This user is in guest mode (no authenticated identity).
- Do NOT assume long-term memory, profile, or prior sessions
- Do NOT say "I remember" or reference past conversations
- Keep responses self-contained and complete
- If continuity context would help, ask ONE gentle clarifying question
- Journal and capture context are unavailable in guest mode`
      : null;

    // ═══════════════════════════════════════════════════════════════════════
    // 🚦 LIMITS ENFORCEMENT: Check usage before processing
    // ═══════════════════════════════════════════════════════════════════════
    const memberTier: MemberTier = isAnon
      ? 'free'
      : authUserId
        ? await getMemberTier(authUserId)
        : 'free';

    const limitsCheck = await LimitsEnforcer.checkUsage({
      memberId: isAnon ? undefined : authUserId ?? undefined,
      anonId: stableAnonId,
      tier: memberTier,
      resource: 'text',
    });

    // Handle enforcement decisions (exhaustive switch for structural safety)
    // - Compile-time: TS forces handling of new actions if EnforcementDecision evolves
    // - Runtime: default case catches `as any` escapes or JSON drift
    let limitNudge: Extract<EnforcementDecision, { action: 'nudge' }> | null = null;

    switch (limitsCheck.action) {
      case 'block':
        console.log(`[Chat API] 🚫 Usage blocked for ${effectiveUserId}: ${limitsCheck.message}`);
        return NextResponse.json({
          message: limitsCheck.message,
          blocked: true,
          tier: memberTier,
        }, {
          status: 429,
          headers: makeCanonHeaders({ requestId: reqId, pipeline: 'direct', source: 'direct' }),
        });

      case 'nudge':
        limitNudge = limitsCheck;
        console.log(`[Chat API] 💬 Usage nudge for ${effectiveUserId}: ${limitsCheck.nudgeType}`);
        break;

      case 'allow':
      case 'suggest_addon':
        break;

      default:
        // If types drift or something came in as `any`, fail loudly
        assertNeverEnforcement(limitsCheck);
    }

    // Log-safe enforcement snapshot (for diagnostic warnings, not response body)
    // Only stable scalars + reason codes — never log `message` (user-facing content)
    const enforcementForLog = {
      action: limitsCheck.action,
      nudgeType: limitsCheck.action === 'nudge' ? limitsCheck.nudgeType : null,
      addonType: limitsCheck.action === 'suggest_addon' ? limitsCheck.addonType : null,
    };

    // 🔍 AUDIT: Structured identity resolution log (privacy-safe)
    const identityMode = authUserId ? 'auth' : IS_PROD ? 'prod-anon' : TRUST_BODY_ID ? 'dev-trusted' : 'dev-anon';
    logIdentityResolution(reqId, {
      mode: identityMode,
      explorerId,
      bodyUserId,
      effectiveUserId,
      sessionId: safeSessionId,
      bodySessionIdProvided: !!sessionId,
      cookieWasNew: !!sessionCookie,
    });

    // Build normalized meta for consistent downstream propagation
    const normalizedMeta = {
      ...(meta ?? {}),
      explorerId: explorerId ?? undefined,
      userId: effectiveUserId,      // 👈 explicit for downstream consumers
      sessionId: safeSessionId,
      reqId,                        // 👈 for audit correlation (cognitive events + logs)
      sanctuary: isSanctuary,       // 🔒 session-level memory exclusion flag
    };

    // Log mode for debugging
    console.log('[Chat API] Mode parameter:', mode || 'not provided (will default to dialogue)');
    console.log('[Chat API] Effective userId:', effectiveUserId);
    console.log('[Chat API] 📦 Normalized meta:', normalizedMeta);

    // 🌀 DECISION GOVERNOR: Spiralogic posture selection (preflight)
    const decision = decisionPreflight(message);
    (normalizedMeta as Record<string, unknown>).decision = decision;
    console.log('[Chat API] 🧭 Decision Governor:', {
      activeElement: decision.activeElement,
      handoffEligibility: decision.handoffEligibility,
      modeHint: decision.modeHint,
      integrityFlags: Object.entries(decision.integrityFlags).filter(([, v]) => v).map(([k]) => k),
    });

    // 💾 ENSURE SESSION EXISTS: Create or update session record for persistence
    await ensureSession(safeSessionId);
    console.log(`[Chat API] Session ensured: ${safeSessionId}`);

    // 🏷️ NAME CHANGE DETECTION: Check if user wants to change what MAIA calls them
    if (!effectiveUserId.startsWith('anon:')) {
      const nameChangeResult = await processNameChangeIfDetected(message, effectiveUserId);
      if (nameChangeResult.detected && nameChangeResult.updated) {
        console.log(`[Chat API] 🏷️ Name change detected and updated: "${nameChangeResult.newName}"`);
      }
    }

    // 📚 LOAD CONVERSATION HISTORY: Get recent exchanges for continuity
    // First try session-level, then fall back to cross-session user history
    let conversationHistory = await getConversationHistory(safeSessionId, 20);
    let historySource = 'session';

    // If this is a new session with no history, load cross-session memory
    // This is what gives MAIA continuity across conversations
    if (conversationHistory.length === 0 && effectiveUserId && !effectiveUserId.startsWith('anon:')) {
      conversationHistory = await getUserConversationHistory(effectiveUserId, 10, safeSessionId);
      historySource = 'cross-session';
    }

    console.log(`[Chat API] Loaded ${conversationHistory.length} conversation turns (source: ${historySource})`);

    // Add messageCount to meta for voice tier selection (Opus vs Sonnet)
    (normalizedMeta as Record<string, unknown>).messageCount = conversationHistory.length;

    // 🧠 LOAD RELATIONSHIP MEMORY: Get relational context (skip for anonymous users)
    let relationshipMemory: Awaited<ReturnType<typeof loadRelationshipMemory>> | null = null;
    if (!effectiveUserId.startsWith('anon:')) {
      try {
        relationshipMemory = await loadRelationshipMemory(effectiveUserId, {
          includeThemes: true,
          includeBreakthroughs: true,
          includePatterns: true,
          maxThemes: 5,
          maxBreakthroughs: 3
        });
        if (relationshipMemory) {
          console.log(`[Chat API] Loaded relationship memory: ${relationshipMemory.totalEncounters} encounters, phase: ${relationshipMemory.relationshipPhase}`);
        }
      } catch (err) {
        console.warn('[Chat API] Could not load relationship memory:', err);
        // Graceful degradation - continue without relationship memory
      }
    }

    // 🎭 AWARENESS LEVEL: Infer developmental stage for voice tier selection
    let awarenessLevel: AwarenessLevel = 1; // Default: Newcomer
    if (relationshipMemory) {
      awarenessLevel = inferAwarenessFromRelationship({
        totalEncounters: relationshipMemory.totalEncounters,
        relationshipDuration: relationshipMemory.relationshipDuration,
        relationshipPhase: relationshipMemory.relationshipPhase,
        trustLevel: relationshipMemory.trustLevel,
        breakthroughCount: relationshipMemory.breakthroughs?.length || 0
      });
      console.log(`[Chat API] 🎭 Awareness level: ${awarenessLevel} (based on ${relationshipMemory.totalEncounters} encounters, phase: ${relationshipMemory.relationshipPhase})`);
    }
    // Add awarenessLevel to meta for Opus/Sonnet routing
    (normalizedMeta as Record<string, unknown>).awarenessLevel = awarenessLevel;

    // 🚪 AIN KNOWLEDGE GATE: Score 5 wells × awareness level (local regex, zero latency)
    // Sanctuary suppression: no meta overlays in sanctuary for visual clarity
    let knowledgeGateResult: { source_mix: SourceContribution[]; awarenessState: any; awarenessDescription: string } | null = null;
    if (process.env.AIN_KNOWLEDGE_GATE_ENABLED === '1' && !isSanctuary) {
      try {
        const kgInput: KnowledgeGateInput = {
          userId: effectiveUserId,
          userMessage: message,
          conversationHistory: conversationHistory.slice(-6).map((h: any) => ({
            role: (h.role || 'user') as 'user' | 'assistant',
            content: h.userMessage || h.maiaResponse || h.content || '',
          })),
          contextHint: mode === 'counsel' ? 'counsel' : mode === 'scribe' ? 'journal' : undefined,
        };
        knowledgeGateResult = scoreKnowledgeGate(kgInput);
        console.log(`[AIN KG] 🚪 Source mix: ${knowledgeGateResult.source_mix.map(s => `${s.source}:${Math.round(s.weight * 100)}%`).join(' | ')} | Awareness: L${knowledgeGateResult.awarenessState.level} (${knowledgeGateResult.awarenessDescription})`);
      } catch (err) {
        console.warn('[AIN KG] Scoring failed (non-blocking):', err);
      }
    }

    // 🏛️ AIN CONSULTATION GATE: Assess whether council input would be valuable
    // All local regex scoring — zero latency. Actual consultation runs in parallel later.
    let consultationDecision: ConsultationDecision | null = null;
    if (process.env.AIN_CONSULTATION_ENABLED === '1' && !isSanctuary) {
      try {
        const gateContext = buildGateContext(
          message,
          conversationHistory.length,
          0.7, // Default trust level — could be derived from relationship memory depth
          undefined // element determined later
        );
        consultationDecision = recommendConsultation(gateContext);
        if (consultationDecision.wantsCouncil) {
          console.log(`[AIN Council] 🏛️ Consultation recommended: ${consultationDecision.council} council — ${consultationDecision.reason}`);
        } else {
          console.log(`[AIN Council] 🏛️ No consultation needed: ${consultationDecision.reason}`);
        }
      } catch (err) {
        console.warn('[AIN Council] Gate assessment failed (non-blocking):', err);
      }
    }

    // 🔮 INJECT WISDOM FIELD: Load Spiralogic metaphysical canon
    let wisdomField: string | null = null;
    try {
      const currentThemes = relationshipMemory?.themes.map(t => t.theme) || [];
      wisdomField = getWisdomPrimerForUser(effectiveUserId);
      console.log('[Chat API] 🔮 Wisdom Field canon injected - length:', wisdomField?.length || 0, 'chars');
      console.log('[Chat API] 🔮 Themes for vault query:', currentThemes.slice(0, 3));
    } catch (err) {
      console.warn('[Chat API] Could not load wisdom field:', err);
      // Graceful degradation - continue without wisdom field
    }

    // 📌 SIGNIFICANT MOMENTS: Load captures, breakthroughs, journals (what matters most)
    let significantMomentsAddendum = '';
    if (!effectiveUserId.startsWith('anon:')) {
      try {
        const significantMoments = await loadSignificantMoments(effectiveUserId, {
          maxCaptures: 15,
          maxBreakthroughs: 10,
          maxJournals: 5
        });
        significantMomentsAddendum = formatSignificantMomentsAddendum(significantMoments);
        if (significantMomentsAddendum) {
          console.log(`[Chat API] 📌 Significant moments loaded: ${significantMoments.summary.totalCaptures} captures, ${significantMoments.summary.totalBreakthroughs} breakthroughs, ${significantMoments.summary.totalJournals} journals`);
        }
      } catch (err) {
        console.warn('[Chat API] Could not load significant moments:', err);
        // Graceful degradation - continue without significant moments
      }
    }

    // 🜨 DIVINATION RECALL (MEMORY-DIVINATION-BETWEEN-ROOM-01, 2026-09-04)
    //
    // The member's durable I Ching readings, rendered as THREE provenance-separated
    // blocks because the record carries three authorships in separable columns:
    //   member question/notes (member-authored) · the cast (system-computed under the
    //   member's invocation) · the corpus interpretation (house-authored).
    //
    // Production census 2026-09-04: /api/between/chat is the live member conversation
    // surface (agent_runs), while the divination wiring landed on /list only. Same
    // loader, same producers, same bounds — this is a room registration, not a new
    // memory path. Gate mirrors the memory-orchestrator block below: recognized member,
    // not Sanctuary. The formatter refuses under Sanctuary again, and MIPA holds all
    // three producers under Sanctuary a third time (requires.notSanctuary).
    let divinationIntentAddendum: string | undefined;
    let divinationCastAddendum: string | undefined;
    let divinationInterpretationAddendum: string | undefined;
    if (!isSanctuary && effectiveUserId && !effectiveUserId.startsWith('anon:')) {
      try {
        const readings = await loadRecentIChingReadings(effectiveUserId);
        const divination = formatDivinationForPrompt(readings, { sanctuary: isSanctuary });
        divinationIntentAddendum = divination.intent;
        divinationCastAddendum = divination.cast;
        divinationInterpretationAddendum = divination.interpretation;
        console.log('[MAIA/between] divination-block', {
          candidateCount: readings.length,
          ...summarizeDivinationForLog(divination),
          userId: memberRef(effectiveUserId),
        });
      } catch (err) {
        console.warn('[MAIA/between] divination-block error (non-fatal):', err);
      }
    }

    // 🌀 SELFLET CONTEXT: Load temporal identity awareness
    console.log('[Chat API] 🌀 SELFLET: Starting selflet context loading for:', effectiveUserId);
    let selfletContext: SelfletLoadResult | null = null;
    try {
      const currentThemes = relationshipMemory?.themes.map(t => t.theme) || [];

      // Ensure user has initial selflet (creates on first interaction if needed)
      if (selfletEligible) {
        console.log('[Chat API] 🌀 SELFLET: Calling ensureInitialSelflet for:', effectiveUserId);
        await ensureInitialSelflet(effectiveUserId);
      }

      // Load selflet context for temporal awareness
      const selfletLoad = await loadSelfletContext(effectiveUserId, currentThemes, message);
      selfletContext = selfletLoad;

      if (selfletLoad.promptInjection) {
        console.log('[Chat API] 🌀 Selflet context loaded, prompt injection:', selfletLoad.promptInjection.length, 'chars');
      }
      if (selfletLoad.shouldSurfaceReflection && selfletLoad.pendingReflection) {
        console.log('[Chat API] 💭 Temporal reflection available from past self');
      }
    } catch (err) {
      // Graceful degradation - selflet system is optional
      console.error('[SELFLET ERROR] loadSelfletContext failed:', err);
    }

    // 🔮 CANON BYPASS: Check if this is an identity/canon question
    if (isCanonQuery(message)) {
      console.log('[Chat API] 🔮 CANON QUERY DETECTED - attempting bypass');

      try {
        const canonResponse = await queryCanonBeads(message);

        if (canonResponse) {
          console.log('[Chat API] ✅ CANON BYPASS SUCCESS - canon bead found');

          // CANON WRAP: Add mode-appropriate framing if requested (all modes)
          const normalizedMode = mode === 'counsel' ? 'care' : mode === 'scribe' ? 'note' : 'talk';
          if (allowCanonWrap) {
            console.log(`[Chat API] 🗣️ CANON WRAP - wrapping canon with ${normalizedMode.toUpperCase()} voice`);

            const { rules, doctrine } = await loadVoiceCanonRules(normalizedMode);

            const wrappedResult = await renderVoice({
              userId: effectiveUserId,
              sessionId: safeSessionId,
              mode: normalizedMode,
              contentDraft: canonResponse,
              engine: voiceEngine === 'claude'
                ? { kind: 'claude' as const, model: 'claude-sonnet-4' }
                : { kind: 'local' as const, model: 'qwen2.5:7b-instruct' },
              guardrails: {
                noNewFacts: true,
                preserveCanonVerbatim: true,
                maxLengthMultiplier: 1.35,
                forbidNewNumbers: true,
                forbidNewProperNouns: true,
                allowGentleFraming: true,
              },
              consent: { allowRemoteRenderer: allowRemoteRendering },
              rules,
              wrapOnly: true,
            });

            const wrappedText = typeof wrappedResult === 'string' ? wrappedResult : wrappedResult.renderedText;
            const wrappedCompliance = typeof wrappedResult === 'string' ? undefined : wrappedResult.compliance;

            // 💾 PERSIST CONVERSATION: Save to database
            await addConversationExchange(safeSessionId, message, wrappedText, {
              type: 'canon-wrap',
              voiceMode: normalizedMode,
              userId: effectiveUserId,
            });

            logRequestComplete(reqId, {
              ok: true,
              status: 200,
              route: '/api/between/chat',
              latencyMs: Date.now() - startTime,
              responseChars: wrappedText.length,
              safeMode: false,
              path: 'canon',
            });

            return withSessionCookie(NextResponse.json({
              message: wrappedText,
              route: {
                endpoint: '/api/between/chat',
                type: 'Canon Bypass + Voice Wrap',
                operational: true,
                mode: `canon-wrap-${normalizedMode}`,
                safeMode: false,
              },
              session: {
                id: safeSessionId,
              },
              metadata: {
                canonBypass: true,
                processingPath: 'CANON_BEAD_WRAPPED',
                bypassedLLM: true,
                hallucinationPrevented: true,
                voiceMode: normalizedMode,
                voiceRenderer: wrappedCompliance,
              },
            }), sessionCookie);
          }

          // NO WRAP: Return canon bead directly
          // 💾 PERSIST CONVERSATION: Save to database
          await addConversationExchange(safeSessionId, message, canonResponse, {
            type: 'canon-direct',
            userId: effectiveUserId,
          });

          logRequestComplete(reqId, {
            ok: true,
            status: 200,
            route: '/api/between/chat',
            latencyMs: Date.now() - startTime,
            responseChars: canonResponse.length,
            safeMode: false,
            path: 'canon',
          });

          return withSessionCookie(NextResponse.json({
            message: canonResponse,
            route: {
              endpoint: '/api/between/chat',
              type: 'Canon Bypass',
              operational: true,
              mode: 'canon-bypass',
              safeMode: false,
            },
            session: {
              id: safeSessionId,
            },
            metadata: {
              canonBypass: true,
              processingPath: 'CANON_BEAD_DIRECT',
              bypassedLLM: true,
              hallucinationPrevented: true,
            },
          }), sessionCookie);
        } else {
          console.log('[Chat API] ⚠️ CANON BYPASS MISS - no canon bead found, falling through to LLM');
        }
      } catch (err) {
        console.error('[Chat API] ❌ CANON BYPASS ERROR:', err);
        // Fall through to normal LLM processing
      }
    }

    // 🔍 RUPTURE DETECTION: Check for relational ruptures in user input
    const ruptureDetection = ruptureDetectionService.detectRupture(message);
    console.log('[RuptureDetection]', {
      detected: ruptureDetection.ruptureDetected,
      type: ruptureDetection.ruptureType,
      confidence: ruptureDetection.confidence,
      patterns: ruptureDetection.patterns,
      inputChars: message.length, // Never log message content
    });

    if (SAFE_MODE) {
      // In safe mode, use simplified orchestrator without full consciousness pipeline
      const simpleResult = await generateSimpleMaiaResponse(message, safeSessionId, {
        mode: mode || 'dialogue', // Pass mode for Talk/Care/Note awareness
        meta: normalizedMeta, // ✅ Normalized identity for downstream persistence
      });

      // ✨ RUPTURE ENHANCEMENT: Check if we need to enhance response due to detected rupture
      let finalMessage = simpleResult.message;
      let ruptureProcessingResult: RuptureDetectionResult | undefined;

      if (ruptureDetection.ruptureDetected && ruptureDetection.ruptureType !== 'none') {
        try {
          const enhancement = await enhanceResponseIfRuptureDetected(
            {
              query: { q: message },
              headers: { 'x-session-id': safeSessionId },
              body: { message, sessionId: safeSessionId }
            } as any,
            simpleResult.message,
            [] // No conversation history in safe mode
          );

          finalMessage = enhancement.finalResponse;
          ruptureProcessingResult = enhancement.ruptureProcessingResult;

          console.log('[RuptureDetection] Safe mode enhancement:', {
            enhanced: enhancement.ruptureProcessingResult?.consultationUsed || false,
            originalLength: simpleResult.message.length,
            finalLength: finalMessage.length
          });
        } catch (error) {
          console.error('[RuptureDetection] Safe mode enhancement failed:', error);
        }
      }

      const crystallization = detectCrystallization(message, finalMessage);

      // 🗣️ VOICE RENDERER: Rewrite for warmth/clarity without adding facts
      let outboundText = finalMessage;
      let voiceMetrics: { compliance: unknown; metrics: unknown } | null = null;

      const voiceMode = mode === 'counsel' ? 'care' : mode === 'scribe' ? 'note' : 'talk';
      const { rules, doctrine } = await loadVoiceCanonRules(voiceMode);

      const voiceOutput = await renderVoice({
        userId: effectiveUserId,
        sessionId: safeSessionId,
        mode: voiceMode,
        contentDraft: finalMessage,
        canonSegments: undefined,
        engine: { kind: 'local', model: 'qwen2.5:7b-instruct' },
        guardrails: {
          noNewFacts: true,
          preserveCanonVerbatim: true,
          maxLengthMultiplier: 1.35,
          forbidNewNumbers: true,
          forbidNewProperNouns: true,
          allowGentleFraming: true,
        },
        consent: { allowRemoteRenderer: false },
        rules,
      });

      outboundText = typeof voiceOutput === 'string' ? voiceOutput : voiceOutput.renderedText;
      voiceMetrics = typeof voiceOutput === 'string' ? null : {
        compliance: voiceOutput.compliance,
        metrics: voiceOutput.metrics,
      };

      // 🧹 STRIP INTERNAL METADATA + MARKDOWN: Clean response for user display (safe mode path)
      const showMetaSafe = await getSystemSetting<boolean>('show_soul_metadata') === true;
      const showMarkdownSafe = await getSystemSetting<boolean>('show_markdown') === true;

      if (!showMetaSafe) {
        outboundText = outboundText
          .replace(/---SOUL_METADATA---[\s\S]*?---END_METADATA---/g, '')
          .replace(/---SOUL_METADATA---[\s\S]*/g, '')
          // Strip STATE_VECTOR fenced code blocks (safe mode path, same as full path)
          .replace(/```STATE_VECTOR[\s\S]*?```/g, '')
          .replace(/```STATE_VECTOR[\s\S]*/g, '');
      }
      if (!showMarkdownSafe) {
        outboundText = outboundText
          .replace(/^#{1,6}\s+/gm, '')
          .replace(/\*\*([^*]+)\*\*/g, '$1')
          .replace(/\*([^*]+)\*/g, '$1')
          .replace(/^[-*]{3,}\s*$/gm, '')
          .replace(/`([^`]+)`/g, '$1')
          .replace(/→/g, '➝')
          .replace(/\n{3,}/g, '\n\n');
      }
      outboundText = outboundText.trim();

      // 🛡️ SOCRATIC VALIDATOR: Canon v1.1 linguistic integrity check
      let socraticValidation: SocraticValidationResult | null = null;
      try {
        socraticValidation = validateSocraticResponse({
          userMessage: message,
          draft: outboundText,
          element: inferElementFromText(message)?.toLowerCase(),
        });

        if (!socraticValidation.passes) {
          console.warn(`⚠️ [Socratic Validator SAFE] Canon violation detected:`, {
            decision: socraticValidation.decision,
            ruptures: socraticValidation.ruptures.map(r => r.code),
          });
        }
      } catch (err) {
        console.error('[Socratic Validator SAFE] Validation failed (non-blocking):', err);
      }

      // 💾 PERSIST CONVERSATION: Save to database (unless Sanctuary mode)
      if (isSanctuary) {
        console.log('🛡️ [Sanctuary] Skipping conversation persistence - speak freely');
      } else {
        await addConversationExchange(safeSessionId, message, outboundText, {
          type: 'safe-mode',
          mode: mode || 'dialogue',
          userId: effectiveUserId,
        });
      }

      // Audit: request complete (simple path)
      logRequestComplete(reqId, {
        ok: true,
        status: 200,
        route: '/api/between/chat',
        latencyMs: Date.now() - startTime,
        responseChars: outboundText.length,
        safeMode: true,
        path: 'simple',
      });

      // 🌀 STATE VECTOR SAFETY NET: Ensure every response carries a stateVector
      // If the simple orchestrator didn't produce one, infer locally from user text
      const simpleStateVector = isSanctuary ? null : inferStateVector(message, effectiveUserId, safeSessionId);
      const simplePracticeRec = isSanctuary ? null : getDefaultPracticeRecommendation(simpleStateVector?.primary.element);
      if (simpleStateVector) {
        console.log(`[Chat API] 🌀 State Vector (inferred/simple): ${simpleStateVector.primary.element} | kairos: ${simpleStateVector.kairos.assessment} | confidence: ${simpleStateVector.confidence.toFixed(2)}`);
      }

      // 🛡️ CANON HEADERS: Provenance stamps for all MAIA responses
      const canonHeaders = makeCanonHeaders({
        requestId: reqId,
        pipeline: 'orchestrator.generateMaiaTurn',
        source: 'direct',
        mode: isSanctuary ? 'SANCTUARY' : 'STANDARD',
        validation: socraticValidation,
        repaired: false,
      });

      // 🌀 BEHAVIORAL LOOP: Relational detection for suggested actions
      const relationalSignals = [
        'partner', 'relationship', 'friend', 'mother', 'father', 'parent',
        'husband', 'wife', 'spouse', 'daughter', 'son', 'sibling', 'brother', 'sister',
        'conflict', 'boundary', 'boundaries', 'arguing', 'fight', 'divorce',
        'betrayal', 'trust', 'attachment', 'intimacy', 'codependent', 'client',
      ];
      const lowerMsg = message.toLowerCase();
      const relHits = relationalSignals.filter(s => lowerMsg.includes(s));
      const betweenSuggestedActions = relHits.length >= 1
        ? [{ id: 'open_relationship', label: 'Map this relationship', priority: Math.min(0.5 + relHits.length * 0.12, 0.92), kind: 'relational', route: '/relationships' }]
        : undefined;

      const response = NextResponse.json({
        message: outboundText,
        // 🌀 BEHAVIORAL LOOP: Suggested actions for inline rendering
        suggestedActions: betweenSuggestedActions,
        // 🌀 STATE VECTOR: Always present (inferred if not from orchestrator)
        stateVector: simpleStateVector,
        // 🌿 PRACTICE: Element-aware recommendation
        practiceRecommendation: simplePracticeRec,
        // 🚪 AIN Knowledge Gate: source mix + awareness level (null in Sanctuary)
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
        route: {
          endpoint: '/api/between/chat',
          type: 'Member Chat',
          operational: true,
          mode: 'safe-mode-simple',
          safeMode: true,
        },
        session: {
          id: safeSessionId,
        },
        metadata: {
          ...simpleResult.metadata,
          crystallization,
          voiceRenderer: voiceMetrics,
          sanctuary: isSanctuary,  // 🔒 Sanctuary mode flag for UI verification
          ruptureDetection: ruptureDetection.ruptureDetected ? {
            detected: ruptureDetection.ruptureDetected,
            type: ruptureDetection.ruptureType,
            confidence: ruptureDetection.confidence,
            enhanced: ruptureProcessingResult?.consultationUsed || false
          } : undefined,
          // 🔮 Sovereignty auditing: actual provider info when enabled
          ...(INCLUDE_PROVIDER_META && simpleResult.metadata?.provider ? {
            sovereignty: {
              provider: simpleResult.metadata.provider
            }
          } : {}),
          // 🛡️ Canon validation result (for client observability)
          socraticValidation: socraticValidation ? {
            decision: socraticValidation.decision,
            isGold: socraticValidation.isGold,
            passes: socraticValidation.passes,
          } : undefined,
        },
      });

      // Apply canon headers to response
      Object.entries(canonHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return withSessionCookie(response, sessionCookie);
    }

    // 🧭 EPISTEMIC PATH: Build path-specific addendum for system prompt
    const effectivePath: EpistemicPathSelection = epistemicPath || 'auto';
    const epistemicPathAddendum = buildEpistemicPathAddendum({
      path: effectivePath,
      dominantElement,
    });

    // 🌀 SPIRAL SNAPSHOT: Compute member's spiral state (Pass 1 of 3-pass pipeline)
    // This is the "always-on substrate" — computed BEFORE response generation
    // Transform ConversationExchange[] to ConversationTurn[] for spiral analysis
    const spiralTurns: ConversationTurn[] = conversationHistory.flatMap(exchange => [
      { role: 'user' as const, content: exchange.userMessage },
      { role: 'assistant' as const, content: exchange.maiaResponse }
    ]);
    const memberSpiralState = computeMemberSpiralState(spiralTurns, message);
    const effectiveFramework = (therapeuticFramework as TherapeuticFramework) || 'auto';
    const spiralSnapshot = buildSpiralSnapshot(memberSpiralState, effectiveFramework);
    const spiralSnapshotAddendum = generateSnapshotPromptAddendum(spiralSnapshot);

    // 🌀 LOG: Spiral Snapshot for observability
    console.log(`🌀 [SPIRAL SNAPSHOT] Phase: ${spiralSnapshot.primaryPhase.phase.name} (${spiralSnapshot.primaryPhase.phase.element}-${spiralSnapshot.primaryPhase.phase.refinement}), Confidence: ${(spiralSnapshot.primaryPhase.confidence * 100).toFixed(0)}%`);
    console.log(`🌀 [SPIRAL SNAPSHOT] State: NS=${spiralSnapshot.state.nervous_system}, Resources=${spiralSnapshot.state.resource_level}, Need=${spiralSnapshot.state.integration_need}`);
    console.log(`🌀 [SPIRAL SNAPSHOT] Wisest Move: ${spiralSnapshot.wisestMove}`);

    // 🌀 AIN FIELD BRIDGE (Efferent): Fetch collective wisdom for system prompt
    let fieldWisdomAddendum: string | null = null;
    if (!isSanctuary && process.env.AIN_FIELD_BRIDGE_ENABLED === '1') {
      try {
        const { ainSpiralogicBridge } = await import('@/lib/ain/AINSpiralogicBridge');
        const element = spiralSnapshot.primaryPhase.phase.element;
        const phase = spiralSnapshot.primaryPhase.phase.refinement; // cardinal/fixed/mutable
        fieldWisdomAddendum = await ainSpiralogicBridge.getWisdomForPrompt(element, phase);
        if (fieldWisdomAddendum) {
          fieldWisdomAddendum = `AIN COLLECTIVE FIELD (Background Wisdom)\n${fieldWisdomAddendum}\nUse as background intelligence. Do not quote this section directly.`;
          console.log(`🌀 [AIN Bridge] Efferent wisdom injected: ${fieldWisdomAddendum.length} chars`);
        }
      } catch (err) {
        console.warn('[AIN Bridge] Efferent fetch failed (non-blocking):', err);
      }
    }

    // 🌿 WU XING SNAPSHOT: Compute Five Element state from BaZi + temporal Qi
    // Fetch BaZi profile if exists (non-blocking - gracefully handle missing)
    let baziProfile: BaZiProfile | null = null;
    try {
      const baziResult = await query(
        `SELECT * FROM member_bazi_profile WHERE user_id = $1 LIMIT 1`,
        [effectiveUserId]
      );
      if (baziResult.rows.length > 0) {
        const row = baziResult.rows[0];
        baziProfile = {
          userId: row.user_id,
          birthDatetimeUtc: new Date(row.birth_datetime_utc),
          birthTimezone: row.birth_timezone,
          locationText: row.location_text,
          pillars: row.pillars_json,
          dayMaster: row.day_master,
          dayMasterElement: row.day_master_element,
          dayMasterYinYang: row.day_master_yinyang,
          elementTally: row.wuxing_balance_json,
          wuxingBalancePercentages: row.wuxing_percentages_json,
          dominantElements: row.dominant_elements || [],
          deficientElements: row.deficient_elements || [],
          balanceScore: row.balance_score
        };
      }
    } catch (err) {
      console.log(`🌿 [WU XING] BaZi profile fetch skipped (table may not exist yet):`, err instanceof Error ? err.message : 'unknown');
    }

    // 🌿 WU XING + BRIDGE COMPUTATION (resilient - failures don't block chat)
    // Wu Xing is an enhancement, not a dependency
    let wuxingSnapshot: WuXingSnapshot | null = null;
    let wuxingSnapshotAddendum: string | null = null;
    let bridgedSnapshot: BridgedSnapshot | null = null;
    let bridgeSnapshotAddendum: string | null = null;

    try {
      // Compute Wu Xing moment (always available - based on current time)
      const wuxingMoment = computeWuXingMoment(new Date());

      // Compute constitution if BaZi profile exists
      const wuxingConstitution = baziProfile ? computeWuXingConstitution(baziProfile) : null;

      // Build Wu Xing snapshot
      wuxingSnapshot = buildWuXingSnapshot({
        constitution: wuxingConstitution,
        moment: wuxingMoment,
        recentIching: undefined // TODO: Fetch recent I Ching reading if any
      });

      // Generate Wu Xing prompt addendum
      wuxingSnapshotAddendum = generateWuXingPromptAddendum(wuxingSnapshot);

      // 🌉 BRIDGED SNAPSHOT: Combine Spiral + Wu Xing for unified awareness
      // Transform spiralSnapshot to the SpiralSnapshotInput format expected by bridgedSnapshot
      const bridgeCompatibleSpiralSnapshot: SpiralSnapshotInput = {
        primaryPhase: {
          phase: {
            element: spiralSnapshot.primaryPhase.phase.element,
            name: spiralSnapshot.primaryPhase.phase.name,
            refinement: spiralSnapshot.primaryPhase.phase.refinement
          },
          confidence: spiralSnapshot.primaryPhase.confidence
        },
        state: {
          nervous_system: spiralSnapshot.state.nervous_system,
          resource_level: spiralSnapshot.state.resource_level,
          integration_need: spiralSnapshot.state.integration_need
        }
      };

      bridgedSnapshot = buildBridgedSnapshot(
        bridgeCompatibleSpiralSnapshot,
        wuxingSnapshot
      );
      bridgeSnapshotAddendum = generateBridgePromptAddendum(bridgedSnapshot);

      // 🌿 LOG: Wu Xing Snapshot for observability
      console.log(`🌿 [WU XING SNAPSHOT] Day: ${wuxingMoment.dayStem} | Hour: ${wuxingMoment.hourBranch} | Season: ${wuxingMoment.seasonalQi}`);
      if (wuxingConstitution) {
        console.log(`🌿 [WU XING SNAPSHOT] Day Master: ${wuxingConstitution.dayMaster} (${wuxingConstitution.dayMasterYinYang}) | Balance: ${wuxingSnapshot.analysis.score.toFixed(0)}/100`);
      }
      console.log(`🌉 [BRIDGE] Alignment: ${bridgedSnapshot.combinedState.alignment} | Suggest TCM: ${bridgedSnapshot.suggestTcm} | Offer I Ching: ${bridgedSnapshot.offerIching}`);
    } catch (wuxingErr) {
      // Wu Xing computation failed - proceed without it (chat should not fail)
      console.warn(`🌿 [WU XING] Computation failed, proceeding without:`, wuxingErr instanceof Error ? wuxingErr.message : 'unknown');
    }

    // 🧘 THERAPEUTIC FRAMEWORK: Mode-specific lens addendums
    const effectiveLens = (reflectionLens as ReflectionLens) || 'auto';
    const therapeuticFrameworkAddendum = mode === 'counsel' ? getFrameworkPromptAddendum(effectiveFramework) : null;
    const reflectionLensAddendum = mode === 'scribe' ? getReflectionLensAddendum(effectiveLens) : null;

    // 🧘 LOG: Framework application status
    if (mode === 'counsel') {
      console.log(`🧘 [COUNSEL MODE] Framework: ${effectiveFramework}, Addendum applied: ${therapeuticFrameworkAddendum ? 'YES' : 'NO'}`);
    }
    if (mode === 'scribe') {
      console.log(`🔮 [SCRIBE MODE] Lens: ${effectiveLens}, Addendum applied: ${reflectionLensAddendum ? 'YES' : 'NO'}`);
    }

    // 🌟 ASTROLOGICAL CONTEXT: User's birth data for personalized cosmic insights
    const astrologicalContextAddendum = await buildAstrologicalContextAddendum(birthData);

    // 🌀 DECISION GOVERNOR: Build addendum for system prompt injection
    const governorAddendum = buildGovernorAddendum(decision);

    // 💫 RELATIONSHIP MODE: Tier-based relationship depth
    const relationshipResult = await buildRelationshipAddendumForUser(effectiveUserId);
    const relationshipModeAddendum = relationshipResult?.addendum ?? null;

    // ═══════════════════════════════════════════════════════════════════════════
    // 🛡️ SAFE ADDENDA: Normalize all addenda to safe strings (Track 2B)
    // Prevents null/undefined/"undefined"/"null" from reaching MAIA
    // ═══════════════════════════════════════════════════════════════════════════
    const asSafeAddendum = (v: unknown): string => {
      if (typeof v !== 'string') return '';
      const s = v.trim();
      // Guard against accidental stringified null/undefined
      if (s === 'undefined' || s === 'null' || s === '') return '';
      return s;
    };

    // 🚪 AIN KNOWLEDGE GATE ADDENDUM: Format source mix for system prompt
    let knowledgeGateAddendum: string | null = null;
    if (knowledgeGateResult) {
      const sortedSources = [...knowledgeGateResult.source_mix].sort((a, b) => b.weight - a.weight);
      const sourceLines = sortedSources.map(s =>
        `- ${s.source} (${Math.round(s.weight * 100)}%): ${s.notes || ''}`
      ).join('\n');
      knowledgeGateAddendum = `AIN KNOWLEDGE GATE (Source Weighting)\nDraw from these knowledge wells in proportion:\n${sourceLines}\nAwareness depth: Level ${knowledgeGateResult.awarenessState.level} (${knowledgeGateResult.awarenessDescription})\nUse as background intelligence. Do not quote this section directly.`;
    }

    const safeAddenda = {
      relationshipMode: asSafeAddendum(relationshipModeAddendum),
      governor: asSafeAddendum(governorAddendum),
      guest: asSafeAddendum(guestContextAddendum),
      journal: asSafeAddendum(null), // Placeholder: wire when journal table exists
      capture: asSafeAddendum(significantMomentsAddendum), // Captures, breakthroughs, journals
      astro: asSafeAddendum(astrologicalContextAddendum),
      spiral: asSafeAddendum(spiralSnapshotAddendum),
      wuxing: asSafeAddendum(wuxingSnapshotAddendum),
      bridge: asSafeAddendum(bridgeSnapshotAddendum),
      therapeuticFramework: asSafeAddendum(therapeuticFrameworkAddendum),
      reflectionLens: asSafeAddendum(reflectionLensAddendum),
      epistemicPath: asSafeAddendum(epistemicPathAddendum),
      knowledgeGate: asSafeAddendum(knowledgeGateAddendum),
      fieldWisdom: asSafeAddendum(fieldWisdomAddendum),
      // 🜨 Divination — three blocks kept separate all the way to cognition.
      divinationIntent: asSafeAddendum(divinationIntentAddendum ?? null),
      divinationCast: asSafeAddendum(divinationCastAddendum ?? null),
      divinationInterpretation: asSafeAddendum(divinationInterpretationAddendum ?? null),
    };

    // 📊 DIAGNOSTIC: Context plumbing visibility (catches null/undefined instantly)
    console.log('[MAIA CONTEXT]', {
      effectiveUserId: effectiveUserId.substring(0, 8) + '...',
      recognized: !isAnon,
      relationshipLen: safeAddenda.relationshipMode.length,
      governorLen: safeAddenda.governor.length,
      journalLen: safeAddenda.journal.length,
      captureLen: safeAddenda.capture.length,
      astroLen: safeAddenda.astro.length,
      spiralLen: safeAddenda.spiral.length,
      wuxingLen: safeAddenda.wuxing.length,
    });

    // 🚨 SELF-ALERTING: Warn when addenda should exist but arrived empty
    // Greppable codes: W_ASTRO_EMPTY, W_REL_EMPTY, W_CAPTURE_EMPTY
    const CAPTURE_ADDENDUM_ENABLED =
      process.env.CAPTURE_ADDENDUM_ENABLED === '1' ||
      process.env.CAPTURE_ADDENDUM_ENABLED === 'true';

    // ═══════════════════════════════════════════════════════════════════════
    // CONTEXT WARNINGS (self-alerting diagnostic system)
    // TAXONOMY: W_* investigate | E_INVARIANT_* blow up | CANARY intentional
    // ═══════════════════════════════════════════════════════════════════════
    const contextWarnings: string[] = [];

    if (birthData?.date && safeAddenda.astro.length === 0) {
      contextWarnings.push('W_ASTRO_EMPTY');
    }
    if (!isAnon && hasMeaningfulRelationshipMemory(relationshipMemory) && safeAddenda.relationshipMode.length === 0) {
      contextWarnings.push('W_REL_EMPTY');
    }
    if (CAPTURE_ADDENDUM_ENABLED && selfletContext?.surfacedMessageId && safeAddenda.capture.length === 0) {
      contextWarnings.push('W_CAPTURE_EMPTY');
    }

    // Note: warnings logged AFTER orchestratorResult for route context

    // 🏛️ AIN CONSULTATION: Launch council deliberation in parallel (if gates opened)
    // Consultation runs alongside primary response — zero latency impact.
    // Failure is non-blocking: if consultation errors, primary response proceeds normally.
    const consultationPromise: Promise<ConsultationResult | null> =
      (consultationDecision?.wantsCouncil && !isSanctuary && process.env.AIN_CONSULTATION_ENABLED === '1')
        ? consult({
            council: (consultationDecision.council || 'deliberation') as any,
            question: message,
            context: {
              conversationHistory: conversationHistory.slice(-6),
              urgency: 'medium',
            },
          }).catch((err) => {
            console.warn('[AIN Council] Consultation failed (non-blocking):', err);
            return null;
          })
        : Promise.resolve(null);

    // ═══ MEMORY ORCHESTRATOR (live runtime activation) ═══
    // Build memory influence plan + forward-readiness signal BEFORE generation.
    // Both blocks flow to maiaService via the context addendum chain. Loaders
    // are graceful: empty arrays on failure, conversation continues normally.
    // Skipped for sanctuary sessions (no cross-session memory should bleed in).
    let memoryInfluenceAddendum: string | undefined;
    let forwardReadinessAddendum: string | undefined;
    if (!isSanctuary && effectiveUserId && !effectiveUserId.startsWith('anon:')) {
      try {
        const [recentDevelopmentalMemories, recentThemeSignals, memberMemoryAtoms] = await Promise.all([
          loadRecentDevelopmentalMemories(effectiveUserId, 3),
          loadRecentThemeSignals(effectiveUserId, 10),
          // CUT 1 — member-placed portfolio reader. Filters enforce canon:
          // status active/still_alive, sacred_protected excluded, return_preference
          // != member_pulled (member opt-in for ambient surfacing). See
          // lib/maia/memoryAtomsLoader.ts + docs/specs/CUT_1_SUBSTRATE_RESTORATION.md.
          loadMemberMemoryAtomsForPrompt(effectiveUserId, 8),
        ]);
        const memoryPlan = buildMemoryInfluencePlan({
          message,
          userId: effectiveUserId,
          conversationHistory,
          recentDevelopmentalMemories,
          recentThemeSignals,
          hasMemberLiveContext: !!relationshipMemory,
          hasRelationshipAnamnesis: !!relationshipMemory,
        });
        if (memoryPlan.shouldUseMemory || memoryPlan.contradictionDetected || memoryPlan.reinforcementCandidate) {
          console.log('[MAIA/between] memory-plan', summarizePlanForLog(memoryPlan));
        }
        memoryInfluenceAddendum = memoryPlan.promptBlock || undefined;

        // CUT 1 — append atoms block to the orchestrator addendum. Same prompt slot
        // (member-authorship carve-out). Discipline lives inside formatAtomsForPrompt:
        // no cross-atom synthesis, no system inference, atoms render as the member
        // declared them. Empty string if no atoms surface (no injection).
        const atomsContextBlock = formatAtomsForPrompt(memberMemoryAtoms);
        if (atomsContextBlock) {
          console.log('[MAIA/between] atoms-block emitted', {
            atomCount: memberMemoryAtoms.length,
            summary: summarizeAtomsForLog(memberMemoryAtoms),
          });
          memoryInfluenceAddendum = memoryInfluenceAddendum
            ? `${memoryInfluenceAddendum}\n\n${atomsContextBlock}`
            : atomsContextBlock;
        }

        // CUT 1 — Canon §VII memoryHealth telemetry. Tracks which of the 12 canon
        // layers loaded successfully this turn. Subsequent cuts populate currently-
        // empty layers; the full shape is built now so dashboards are stable.
        const memoryHealth = buildMemoryHealth({
          recentTurns: { count: conversationHistory.length },
          session: { present: !!relationshipMemory },
          developmental: { count: recentDevelopmentalMemories.length },
          semantic: { count: memberMemoryAtoms.length },
          relational: { present: !!relationshipMemory },
          pattern: { count: recentThemeSignals.length },
        });
        console.log('[MAIA/between] memoryHealth', summarizeMemoryHealthForLog(memoryHealth));
        if (isBaseChainDegraded(memoryHealth)) {
          console.warn('[MAIA/between] memoryHealth: base chain degraded — §VI fallback amplified', {
            health: summarizeMemoryHealthForLog(memoryHealth),
          });
        }

        const readiness = detectForwardReadiness(message);
        if (readiness.ready) {
          console.log('[MAIA/between] forward-readiness', {
            signals: readiness.signals,
            preview: message.slice(0, 120),
          });
          forwardReadinessAddendum = buildForwardReadinessBlock();
        }
      } catch (memOrchErr) {
        console.warn('[MAIA/between] memory orchestrator non-fatal:', memOrchErr);
      }
    }

    // Use full fail-soft consciousness orchestrator — runs in parallel with consultation
    const [orchestratorResult, consultationResult] = await Promise.all([
      generateMaiaTurn({
        message,
        userId: effectiveUserId,
        sessionId: safeSessionId,
        conversationHistory, // ✅ Now loaded from database
        meta: normalizedMeta, // ✅ Normalized identity for downstream persistence
        context: {
          chatType: 'between-member',
          endpoint: '/api/between/chat',
          mode, // Pass mode (Talk/Care/Note) for appropriate system prompts — typed ConversationMode
          userName: serverUserName, // Server-derived, not client-sent (prevents "Kelly" name bleed)
          localHour, // Client's local hour (0-23) for correct time-of-day greetings
          relationshipMemory, // ✅ Relational continuity
          wisdomField, // ✅ Spiralogic metaphysical canon
          selfletContext, // 🌀 Temporal identity awareness
          // ═══ ADDENDA (ordered per maiaVoice.ts stable sequence, safe-wrapped) ═══
          relationshipModeAddendum: safeAddenda.relationshipMode || undefined,
          governorAddendum: safeAddenda.governor || undefined,
          guestContextAddendum: safeAddenda.guest || undefined,
          journalContextAddendum: safeAddenda.journal || undefined,
          captureContextAddendum: safeAddenda.capture || undefined,
          astrologicalContextAddendum: safeAddenda.astro || undefined,
          spiralSnapshotAddendum: safeAddenda.spiral || undefined,
          wuxingSnapshotAddendum: safeAddenda.wuxing || undefined,
          bridgeSnapshotAddendum: safeAddenda.bridge || undefined,
          therapeuticFrameworkAddendum: safeAddenda.therapeuticFramework || undefined,
          reflectionLensAddendum: safeAddenda.reflectionLens || undefined,
          epistemicPathAddendum: safeAddenda.epistemicPath || undefined,
          // 🚪 AIN KNOWLEDGE GATE: Source well modulation (Phase 1)
          knowledgeGateAddendum: safeAddenda.knowledgeGate || undefined,
          // 🌀 AIN FIELD BRIDGE: Collective Spiralogic wisdom (Phase 3)
          fieldWisdomAddendum: safeAddenda.fieldWisdom || undefined,
          // 🜨 DIVINATION RECALL: member intent · computed cast · house interpretation.
          // Read by maiaService (FAST template + CORE/DEEP MaiaContext) exactly as on /list.
          divinationIntentAddendum: safeAddenda.divinationIntent || undefined,
          divinationCastAddendum: safeAddenda.divinationCast || undefined,
          divinationInterpretationAddendum: safeAddenda.divinationInterpretation || undefined,
          // 🧠 MEMORY ORCHESTRATOR: Runtime memory coordination plan
          memoryInfluenceAddendum,
          // ▶️ FORWARD READINESS: Counter the depth-first reflex when user signals execution-ready
          forwardReadinessAddendum,
        },
        // Route/profile tracing for corpus callosum filtering
        originRoute: '/api/between/chat',
        processingProfileOverride: 'BETWEEN',
      }),
      consultationPromise,
    ]);

    if (consultationResult) {
      console.log(`[AIN Council] 🏛️ Consultation complete: ${consultationResult.insights.length} insights, ${consultationResult.tensions.length} tensions, emergence: ${consultationResult.emergenceRating || 'recombination'}`);
    }

    // PARTICIPATORY REALITY: Detect and persist theme signals (fire-and-forget)
    // Runs after orchestrator so it never blocks the response. Sanctuary excluded.
    // UUID_REGEX: only store for recognised members (valid UUID = exists in members table).
    const isRecognisedMember = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(effectiveUserId ?? '');
    if (!isSanctuary && isRecognisedMember) {
      const currentElement = orchestratorResult.metadata?.stateVector?.primary?.element as string | undefined;
      const scored = detectThemes(message, currentElement as any);
      const topSignal = scored.length > 0 ? scored[0] : null;
      console.info('[participatory] member=%s element=%s topTheme=%s resonance=%s',
        effectiveUserId?.slice(0, 8), currentElement ?? 'none',
        topSignal?.theme ?? 'none', topSignal?.resonance_strength?.toFixed(2) ?? '0.00');
      if (topSignal && topSignal.resonance_strength >= 0.55) {
        storeThemeSignal(effectiveUserId!, topSignal, { sessionId: safeSessionId });
      }
    } else {
      console.info('[participatory] skipped — anon=%s sanctuary=%s', !isRecognisedMember, isSanctuary);
    }

    // TRUST OBSERVATION: Phase 3 behavioral signal capture (fire-and-forget)
    if (isTrustObservationEnabled() && isRecognisedMember && effectiveUserId) {
      const responseType = classifyResponseType({
        activeFrameworks: orchestratorResult.metadata?.frameworks as string[] | undefined,
        careLensActive: mode === 'counsel',
      });
      storeTrustObservation({
        memberId: effectiveUserId,
        sessionId: safeSessionId,
        responseType,
        engagementProxy: inferEngagementProxy({
          replyLength: message.length,
          conversationDepth: conversationHistory?.length ?? 0,
        }),
        context: {
          element: orchestratorResult.metadata?.stateVector?.primary?.element,
          mode,
          route: 'between/chat',
        },
      });
    }

    // 🚨 SELF-ALERTING: Log warnings with route context (deferred from before orchestrator)
    // Note: `mode` is the actual conversation mode (dialogue/counsel/scribe), not orchestrator.route.mode
    // (orchestrator.route.mode is hardcoded to 'fail-soft-orchestration' and doesn't reflect conversation mode)

    // Tier-aware + mode-aware filtering for W_REL_EMPTY
    // Only warn when: continuity tier + relationship-expecting mode + meaningful memory + empty addendum
    const accessTier = toMemberTier(memberTier); // Canonical mapping from LimitsEnforcer → tierAccess
    const continuityExpected = hasContinuityAccess({ tier: accessTier });
    const modeShouldHaveRelationship = isRelationshipMode(mode);
    const hasRel = hasMeaningfulRelationshipMemory(relationshipMemory);

    const filteredWarnings = contextWarnings.filter(w => {
      if (w === 'W_REL_EMPTY' && (!continuityExpected || !modeShouldHaveRelationship || !hasRel)) {
        return false;
      }
      return true;
    });

    if (filteredWarnings.length > 0) {
      console.warn('[MAIA CONTEXT]', {
        warnings: filteredWarnings,
        reqId,
        userId: effectiveUserId ? effectiveUserId.slice(0, 8) : 'anon',
        recognized: !isAnon,
        limitsTier: memberTier,  // LimitsEnforcer vocabulary
        accessTier,              // tierAccess vocabulary (mapped)
        enforcement: enforcementForLog, // Policy decision (allow/nudge/block)
        // Conversation mode (actual mode, not orchestrator.route.mode which is hardcoded)
        conversationMode: mode, // dialogue | counsel | scribe
        // Orchestrator route object (non-sensitive diagnostic context)
        orchestratorRoute: orchestratorResult.route
          ? {
              mode: orchestratorResult.route.mode,
              type: orchestratorResult.route.type,
              safeMode: orchestratorResult.route.safeMode,
              operational: orchestratorResult.route.operational,
              endpoint: orchestratorResult.route.endpoint,
            }
          : null,
        // "Why this should exist" signals
        continuityExpected,
        modeShouldHaveRelationship, // true only for 'counsel' (Care mode)
        birthDataPresent: !!birthData?.date,
        hasRelationshipMemory: hasRel,
        hasSurfacedCapture: !!selfletContext?.surfacedMessageId,
      });
    }

    // 📊 AUDIT: Memory pipeline metrics (content-free)
    // Dev-only simulation headers for calibration testing
    // Requires MAIA_MEMORY_SIM_HEADERS=1 env var AND the header (double-gate)
    const simHeadersEnabled =
      process.env.NODE_ENV !== 'production' &&
      process.env.MAIA_MEMORY_SIM_HEADERS === '1';

    // Detect sim header attempts when gate is disabled (audit breadcrumb)
    const simHeadersAttempted = [
      'x-maia-simulate-pipeline-missing',
      'x-maia-simulate-zero-semantic',
      'x-maia-simulate-big-bundle',
      'x-maia-simulate-low-thresholds',
    ].filter(h => req.headers.get(h) === '1');

    if (!simHeadersEnabled && simHeadersAttempted.length > 0) {
      const isProd = process.env.NODE_ENV === 'production';
      const simEnvSet = process.env.MAIA_MEMORY_SIM_HEADERS === '1';
      console.log('[Audit:MemoryPipeline:SIM_IGNORED]', {
        reqId,
        headers: simHeadersAttempted,
        reason: isProd ? 'production' : 'gate_disabled',
        gate: { nonProd: !isProd, simEnvEnabled: simEnvSet },
      });
    }

    const simulatePipelineMissing =
      simHeadersEnabled &&
      req.headers.get('x-maia-simulate-pipeline-missing') === '1';

    const simulateZeroSemantic =
      simHeadersEnabled &&
      req.headers.get('x-maia-simulate-zero-semantic') === '1';

    const simulateBigBundle =
      simHeadersEnabled &&
      req.headers.get('x-maia-simulate-big-bundle') === '1';

    // Threshold override: force low thresholds to trigger bloat_high_recall_low
    const simulateLowThresholds =
      simHeadersEnabled &&
      req.headers.get('x-maia-simulate-low-thresholds') === '1';

    const memPipeline = simulatePipelineMissing
      ? null
      : orchestratorResult.metadata?.memoryPipeline;
    const memRetrieval = memPipeline?.retrieval;

    // Configurable thresholds (tune via env without code changes)
    // simulateLowThresholds: WARN_BLOAT=0, WARN_RECALL=100 → any real data triggers flag
    const WARN_BLOAT = simulateLowThresholds ? 0 : parseInt(process.env.MAIA_MEMORY_WARN_BLOAT || '70', 10);
    const WARN_RECALL = simulateLowThresholds ? 100 : parseInt(process.env.MAIA_MEMORY_WARN_RECALL || '40', 10);

    // Compute health flags (content-free signals for grep-able alerting)
    const rq = memPipeline?.recallQuality ?? 0;
    const br = memPipeline?.bloatRisk ?? 0;

    const bcRaw = memPipeline?.bundleChars ?? 0;
    const bc = memPipeline && simulateBigBundle ? Math.max(bcRaw, 2000) : bcRaw;

    const turnsRetrieved = memRetrieval?.turnsRetrieved ?? 0;
    const turnsSameSession = memRetrieval?.turnsSameSession ?? 0;
    const turnsCrossSession = memRetrieval?.turnsCrossSession ?? 0;

    const semanticHitsRaw = memRetrieval?.semanticHits ?? 0;
    const semanticHits = memPipeline && simulateZeroSemantic ? 0 : semanticHitsRaw;

    const breakthroughsFound = memRetrieval?.breakthroughsFound ?? 0;
    const bulletsInjected = memRetrieval?.bulletsInjected ?? 0;

    const healthFlags: string[] = [];

    // Pipeline failure modes
    if (!memPipeline) {
      healthFlags.push('pipeline_missing');
    } else if (turnsRetrieved === 0 && bc === 0) {
      healthFlags.push('retrieval_zero');
    }

    // Bloat/quality issues
    if (br > WARN_BLOAT && rq < WARN_RECALL) healthFlags.push('bloat_high_recall_low');
    if (bc > 1800 && semanticHits === 0) healthFlags.push('big_bundle_zero_semantic');

    // Cross-session pattern (only flag when meaningful: enough turns, actually injected)
    if (turnsCrossSession > 0 && turnsSameSession === 0 && turnsRetrieved >= 8 && bulletsInjected > 0) {
      healthFlags.push('all_cross_session');
    }

    logMemoryPipelineDecision(reqId, {
      userId: effectiveUserId,
      sessionId: safeSessionId,
      memoryModeEffective: memPipeline?.mode || 'unknown',
      sensitiveInput: orchestratorResult.metadata?.sensitiveInput || false,
      counts: {
        turnsRetrieved,
        turnsSameSession,
        turnsCrossSession,
        semanticHits,
        breakthroughsFound,
        bulletsInjected,
      },
      relationshipEncounters: memPipeline?.relationshipSnapshot?.encounterCount ?? 0,
      injected: bulletsInjected > 0 && bc > 0,
      bundleChars: bc,
      recallQuality: rq,
      bloatRisk: br,
      healthFlags,
      reason: memRetrieval ? undefined : 'no_retrieval',
    });

    // ✨ RUPTURE ENHANCEMENT: Check if we need to enhance response due to detected rupture
    let finalMessage = orchestratorResult.message;
    let ruptureProcessingResult: RuptureDetectionResult | undefined;

    if (ruptureDetection.ruptureDetected && ruptureDetection.ruptureType !== 'none') {
      try {
        const enhancement = await enhanceResponseIfRuptureDetected(
          {
            query: { q: message },
            headers: { 'x-session-id': safeSessionId },
            body: { message, sessionId: safeSessionId }
          } as any,
          orchestratorResult.message,
          [] // Could include conversation history in future
        );

        finalMessage = enhancement.finalResponse;
        ruptureProcessingResult = enhancement.ruptureProcessingResult;

        console.log('[RuptureDetection] Full consciousness enhancement:', {
          enhanced: enhancement.ruptureProcessingResult?.consultationUsed || false,
          originalLength: orchestratorResult.message.length,
          finalLength: finalMessage.length
        });
      } catch (error) {
        console.error('[RuptureDetection] Full consciousness enhancement failed:', error);
      }
    }

    const crystallization = detectCrystallization(message, finalMessage);

    // 🎯 CLOSING ANCHOR: Deterministic post-generation repair
    // Conditions: Care mode + turn 3+ + meaningful response length + no anchor already present + not sanctuary
    // Appended BEFORE voice renderer so it naturalises with the rest of the response.
    const ANCHOR_ALREADY_PRESENT = /sit with (this|that|it)|you might (try|notice|sit)|one small thing|how does that land|notice what (happens|surfaces)|would you like to stay|let it rest/i;
    // NOTE (2026-04-10): Hardcoded "sit with that tonight" closing-anchor REMOVED.
    // It was appended mechanically to every counsel response (turn 3+), producing
    // a prescriptive templated closure that violated voice integrity.
    // Closing quality is now governed entirely by the system prompt's CLOSING ANCHOR
    // section, which instructs the LLM to produce varied, non-prescriptive endings.
    // See also: maiaService.ts and maiaVoice.ts CLOSING ANCHOR rewrites (same date).

    // 🗣️ VOICE RENDERER: Rewrite for warmth/clarity without adding facts
    let outboundText2 = finalMessage;
    let voiceMetrics2: { compliance: unknown; metrics: unknown } | null = null;

    const voiceMode2 = mode === 'counsel' ? 'care' : mode === 'scribe' ? 'note' : 'talk';
    const { rules: rules2, doctrine: doctrine2 } = await loadVoiceCanonRules(voiceMode2);

    const voiceOutput2 = await renderVoice({
      userId: effectiveUserId,
      sessionId: safeSessionId,
      mode: voiceMode2,
      contentDraft: finalMessage,
      canonSegments: undefined,
      engine: { kind: 'local', model: 'qwen2.5:7b-instruct' },
      guardrails: {
        noNewFacts: true,
        preserveCanonVerbatim: true,
        maxLengthMultiplier: 1.35,
        forbidNewNumbers: true,
        forbidNewProperNouns: true,
        allowGentleFraming: true,
      },
      consent: { allowRemoteRenderer: false },
      rules: rules2,
    });

    outboundText2 = typeof voiceOutput2 === 'string' ? voiceOutput2 : voiceOutput2.renderedText;
    voiceMetrics2 = typeof voiceOutput2 === 'string' ? null : {
      compliance: voiceOutput2.compliance,
      metrics: voiceOutput2.metrics,
    };

    // 🌀 INTEGRITY CHECK (Pass 3): Enforce mode fidelity, consent, structure, and Wu Xing awareness
    const lensConsent = (body as { lensConsent?: LensConsent })?.lensConsent ?? null;

    // TODO: Remove after verification - temporary debug log
    console.log('[bridge]', { hasBridge: !!bridgedSnapshot, hasBazi: !!baziProfile });

    const integrityResult = checkResponseIntegrity({
      framework: effectiveFramework,
      mode: mode as 'dialogue' | 'counsel' | 'scribe' | undefined,
      responseText: outboundText2,
      lensConsent,
      bridgedSnapshot: bridgedSnapshot ?? undefined, // Pass bridged snapshot for Wu Xing-informed suggestions
    });

    console.log(`🌀 [INTEGRITY CHECK] Decision: ${integrityResult.decision}${integrityResult.reasons.length > 0 ? `, Reasons: ${integrityResult.reasons.join('; ')}` : ''}`);

    // Apply revision if needed
    if (integrityResult.decision === 'revise') {
      outboundText2 = applyMinimalRevision(outboundText2, integrityResult.reasons);
      console.log(`🌀 [INTEGRITY CHECK] Applied minimal revision`);
    }

    // Generate lens switch options if needed (for client display)
    const lensSwitchOptions = integrityResult.decision === 'offer_switch'
      ? generateLensSwitchOptions(effectiveFramework, integrityResult.suggested)
      : null;

    // 🛡️ SOCRATIC VALIDATOR: Canon v1.1 linguistic integrity check
    let socraticValidation2: SocraticValidationResult | null = null;
    try {
      socraticValidation2 = validateSocraticResponse({
        userMessage: message,
        draft: outboundText2,
        element: inferElementFromText(message)?.toLowerCase(),
      });

      if (!socraticValidation2.passes) {
        console.warn(`⚠️ [Socratic Validator ORCH] Canon violation detected:`, {
          decision: socraticValidation2.decision,
          ruptures: socraticValidation2.ruptures.map(r => r.code),
        });
      }
    } catch (err) {
      console.error('[Socratic Validator ORCH] Validation failed (non-blocking):', err);
    }

    // 🧹 STRIP INTERNAL METADATA + MARKDOWN: Clean response for user display
    // Admin can enable show_soul_metadata or show_markdown to see raw output
    const showMetadata = await getSystemSetting<boolean>('show_soul_metadata') === true;
    const showMarkdown = await getSystemSetting<boolean>('show_markdown') === true;

    let cleanedText = outboundText2;

    // Strip SOUL_METADATA blocks (internal processing data)
    if (!showMetadata) {
      cleanedText = cleanedText
        .replace(/---SOUL_METADATA---[\s\S]*?---END_METADATA---/g, '')
        .replace(/---SOUL_METADATA---[\s\S]*/g, '') // partial block at end
        // Strip STATE_VECTOR code blocks — model sometimes emits these as
        // fenced code (```STATE_VECTOR {...} ```) which bypasses the
        // SOUL_METADATA stripper. This is internal processing output that
        // must never reach the member's conversation surface.
        .replace(/```STATE_VECTOR[\s\S]*?```/g, '')
        .replace(/```STATE_VECTOR[\s\S]*/g, ''); // partial block at end
    }

    // Strip markdown artifacts that look messy in plain text UI
    if (!showMarkdown) {
      cleanedText = cleanedText
        // Remove markdown headers (## Header)
        .replace(/^#{1,6}\s+/gm, '')
        // Remove bold/italic markers (**text** or *text*)
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        // Remove horizontal rules (--- or ***)
        .replace(/^[-*]{3,}\s*$/gm, '')
        // Remove inline code backticks
        .replace(/`([^`]+)`/g, '$1')
        // Clean up arrows to be more readable
        .replace(/→/g, '➝')
        // Remove excessive newlines from stripped content
        .replace(/\n{3,}/g, '\n\n');
    }

    cleanedText = cleanedText.trim();

    // 📐 AIN SHAPE TELEMETRY: Continuity-stack metrics (fire-and-forget, never blocks)
    if (!isSanctuary && (process.env.AIN_SHAPE_TELEMETRY === '1' || process.env.NODE_ENV !== 'production')) {
      const _ainShape = assessAINResponseShape(message, cleanedText);
      logAINShapeTelemetry({
        pass: _ainShape.pass,
        score: _ainShape.score,
        flags: _ainShape.flags,
        menuSignals: _ainShape.signals ?? null,
        route: 'between/chat',
        processingProfile: undefined,
        model: orchestratorResult.metadata?.provider?.model ?? undefined,
        explorerId: effectiveUserId ?? undefined,
        sessionId: safeSessionId,
      }).catch((err) => {
        console.warn('[between/chat] AIN shape telemetry write failed:', err?.message);
      });
    }

    // 💾 PERSIST CONVERSATION: Save to database (unless Sanctuary mode)
    if (isSanctuary) {
      console.log('🛡️ [Sanctuary] Skipping conversation persistence - speak freely');
    } else {
      await addConversationExchange(safeSessionId, message, cleanedText, {
        type: 'orchestrator',
        mode: mode || 'dialogue',
        userId: effectiveUserId,
        layers: orchestratorResult.metadata?.consciousnessLayers?.successful || [],
      });
    }

    // Audit: request complete (orchestrator path)
    logRequestComplete(reqId, {
      ok: true,
      status: 200,
      route: '/api/between/chat',
      latencyMs: Date.now() - startTime,
      responseChars: outboundText2.length,
      safeMode: false,
      path: 'orchestrator',
    });

    // 🌀 SELFLET POST: boundary detection + message delivery (non-blocking)
    const SELFLET_WRITE_ENABLED =
      process.env.MAIA_SELFLET_WRITE_ENABLED === '1' &&
      selfletEligible;

    if (SELFLET_WRITE_ENABLED) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const c = orchestratorResult?.consciousness as any;

      // Derive signals: prefer orchestrator values, fallback to text inference
      const derivedElement =
        (c?.conversationalElemental?.dominant as Element | undefined) ??
        (c?.elementalField?.dominant as Element | undefined) ??
        inferElementFromText(message);

      const derivedBreakthrough =
        Boolean(c?.breakthrough) || inferBreakthroughFromText(message);

      const derivedEmotionalShift =
        (c?.emotionalShift as { from?: string; to: string; intensity: number } | undefined) ??
        inferEmotionalShiftFromText(message);

      processSelfletAfterResponse(effectiveUserId, {
        userMessage: message,
        assistantResponse: outboundText2,
        // Phase 2C: Pass surfaced message info for delivery tracking
        surfacedSelfletMessageId: selfletContext?.surfacedMessageId,
        surfacedDeliveryContext: selfletContext?.surfacedDeliveryContext,
        // Derived consciousness signals (orchestrator + text inference fallback)
        currentElement: derivedElement,
        breakthroughDetected: derivedBreakthrough,
        emotionalShift: derivedEmotionalShift,
      }).catch(err => {
        console.error('[SELFLET] processSelfletAfterResponse failed:', err);
      });
    }

    // 🌀 AIN FIELD BRIDGE (Afferent): Send individual pattern to collective field
    // Fire-and-forget — never blocks the response. Sanctuary sessions NEVER contribute.
    if (!isSanctuary && process.env.AIN_FIELD_BRIDGE_ENABLED === '1') {
      import('@/lib/ain/AINSpiralogicBridge').then(({ ainSpiralogicBridge }) => {
        const c = orchestratorResult?.consciousness as any;
        const element = c?.conversationalElemental?.dominant || spiralSnapshot.primaryPhase.phase.element || 'aether';
        const phase = spiralSnapshot.primaryPhase.phase.refinement || 'cardinal';
        const isBreakthrough = Boolean(c?.breakthrough) || inferBreakthroughFromText(message);

        ainSpiralogicBridge.sendToField(
          {
            timestamp: new Date(),
            element,
            domain: 'conversation',
            symbols: [],
            breakthrough: isBreakthrough,
          } as any,
          {
            phase,
            state: spiralSnapshot.wisestMove || 'present',
            confidence: spiralSnapshot.primaryPhase.confidence,
          } as any,
          {
            userId: effectiveUserId,
            sessionId: safeSessionId,
            isBreakthrough,
            consciousnessLevel: c?.consciousnessLevel || 0.5,
          }
        ).catch(err => console.error('[AIN Bridge] Afferent send failed:', err));
      }).catch(err => console.error('[AIN Bridge] Import failed:', err));
    }

    // 🌀 SELFLET PHASE 2H: Construct pastSelf payload for UI card
    const pastSelf = selfletContext?.surfacedMessageId ? {
      id: selfletContext.surfacedMessageId,
      title: selfletContext.surfacedDeliveryContext?.messageTitle,
      content: selfletContext.surfacedDeliveryContext?.messageContent,
      messageType: selfletContext.surfacedDeliveryContext?.messageType,
      relevanceThemes: selfletContext.surfacedDeliveryContext?.relevanceThemes,
      fromSelfletId: selfletContext.surfacedDeliveryContext?.fromSelfletId,
      surfacedAt: selfletContext.surfacedDeliveryContext?.surfacedAt,
    } : undefined;

    // 🛡️ CANON HEADERS: Provenance stamps for all MAIA responses
    const canonHeaders2 = makeCanonHeaders({
      requestId: reqId,
      pipeline: 'orchestrator.generateMaiaTurn',
      source: 'direct',
      mode: isSanctuary ? 'SANCTUARY' : 'STANDARD',
      validation: socraticValidation2,
      repaired: false,
    });

    // 🌀 STATE VECTOR SAFETY NET: Guarantee stateVector is never null
    const orchestratorStateVector = orchestratorResult.metadata?.stateVector || null;
    const orchestratorPractice = orchestratorResult.metadata?.practiceRecommendation || null;
    const finalStateVector = isSanctuary ? null
      : orchestratorStateVector || inferStateVector(message, effectiveUserId, safeSessionId);
    const finalPracticeRec = isSanctuary ? null
      : orchestratorPractice || getDefaultPracticeRecommendation(finalStateVector?.primary?.element);
    if (finalStateVector && !orchestratorStateVector) {
      console.log(`[Chat API] 🌀 State Vector (inferred/full): ${finalStateVector.primary.element} | kairos: ${finalStateVector.kairos.assessment} | confidence: ${finalStateVector.confidence.toFixed(2)}`);
    }

    // 🚪 RELATIONAL ROUTING: detect intent from the conversational field (user + MAIA)
    const intentResult = detectIntent({ userInput: message, maiaResponse: cleanedText });
    const intentRoute = intentResult.intent !== 'unknown' ? getIntentRoute(intentResult.intent) : null;
    const doorwayAction = intentRoute ? buildUiAction(intentRoute, intentResult.confidence) : null;
    if (intentResult.intent !== 'unknown') {
      console.log('[Doorway] shown', { intent: intentResult.intent, confidence: intentResult.confidence });
    }

    // 💡 IDEA FIELD: Heuristic detection of generative moments
    // Detection weighted toward user message (sovereignty: MAIA suggests, user decides)
    const ideaCandidate = !isSanctuary ? detectIdeaCandidate(message, cleanedText) : null;
    if (ideaCandidate) {
      console.info('[idea-field]', {
        title: ideaCandidate.title,
        confidence: ideaCandidate.confidence,
        fingerprint: ideaCandidate.fingerprint,
      });
    }

    // 🌀 BEHAVIORAL LOOP: Relational detection for suggested actions (full-consciousness path)
    const relationalSignals2 = [
      'partner', 'relationship', 'friend', 'mother', 'father', 'parent',
      'husband', 'wife', 'spouse', 'daughter', 'son', 'sibling', 'brother', 'sister',
      'conflict', 'boundary', 'boundaries', 'arguing', 'fight', 'divorce',
      'betrayal', 'trust', 'attachment', 'intimacy', 'codependent', 'client',
    ];
    const lowerMsg2 = message.toLowerCase();
    const relHits2 = relationalSignals2.filter(s => lowerMsg2.includes(s));
    const fullSuggestedActions = relHits2.length >= 1
      ? [{ id: 'open_relationship', label: 'Map this relationship', priority: Math.min(0.5 + relHits2.length * 0.12, 0.92), kind: 'relational', route: '/relationships' }]
      : undefined;

    const response2 = NextResponse.json({
      message: cleanedText,
      // 🌀 BEHAVIORAL LOOP: Suggested actions for inline rendering
      suggestedActions: fullSuggestedActions,
      consciousness: orchestratorResult.consciousness,
      // 🌀 STATE VECTOR: Always present — from orchestrator or inferred (null in Sanctuary)
      stateVector: finalStateVector,
      // 🌿 PRACTICE: Element-aware recommendation — from orchestrator or default
      practiceRecommendation: finalPracticeRec,
      // 🌀 SELFLET PHASE 2H: Structured past-self message for UI rendering
      pastSelf,
      // 🌀 INTEGRITY CHECK: Pass 3 result for client-side lens switching UI
      integrity: integrityResult,
      lensSwitchOptions,
      route: {
        endpoint: '/api/between/chat',
        type: 'Member Chat with Full Consciousness',
        operational: orchestratorResult.route.operational,
        mode: 'fail-soft-orchestration',
        safeMode: false,
      },
      session: {
        id: safeSessionId,
      },
      // 🚪 AIN STATE: Knowledge Gate source mix + awareness level
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
      // 🏛️ AIN CONSULTATION: Council deliberation results (parallel, non-blocking)
      consultation: consultationResult ? {
        council: consultationDecision?.council || 'deliberation',
        insights: consultationResult.insights,
        tensions: consultationResult.tensions,
        recommendation: consultationResult.recommendation,
        framingsUsed: consultationResult.framingsUsed,
        emergenceRating: consultationResult.emergenceRating || 'recombination',
        framingWeights: consultationResult.framingWeights || null,
      } : null,
      // 🌀 AIN FIELD: Collective field state (Phase 3)
      fieldState: fieldWisdomAddendum ? {
        wisdomPresent: true,
      } : null,
      // 💡 IDEA FIELD: Heuristic idea candidate for user confirmation
      ideaCandidate: ideaCandidate ?? undefined,
      // 🚪 RELATIONAL ROUTING: intent-driven doorway for frontend rendering
      intent: doorwayAction ? intentResult.intent : undefined,
      uiAction: doorwayAction?.type !== 'none' ? doorwayAction : undefined,
      metadata: {
        ...orchestratorResult.metadata,
        consciousnessLayers: orchestratorResult.metadata.consciousnessLayers,
        failSoftMode: true,
        crystallization,
        voiceRenderer: voiceMetrics2,
        sanctuary: isSanctuary,  // 🔒 Sanctuary mode flag for UI verification
        ruptureDetection: ruptureDetection.ruptureDetected ? {
          detected: ruptureDetection.ruptureDetected,
          type: ruptureDetection.ruptureType,
          confidence: ruptureDetection.confidence,
          enhanced: ruptureProcessingResult?.consultationUsed || false
        } : undefined,
        // 🔮 Sovereignty auditing: actual provider info when enabled
        ...(INCLUDE_PROVIDER_META && orchestratorResult.metadata?.provider ? {
          sovereignty: {
            provider: orchestratorResult.metadata.provider
          }
        } : {}),
        // 🛡️ Canon validation result (for client observability)
        socraticValidation: socraticValidation2 ? {
          decision: socraticValidation2.decision,
          isGold: socraticValidation2.isGold,
          passes: socraticValidation2.passes,
        } : undefined,
        // 🚦 Usage limits nudge (for gentle client-side messaging)
        limitNudge: limitNudge ? {
          message: limitNudge.message,
          nudgeType: limitNudge.nudgeType,
        } : undefined,
        tier: memberTier,
      }
    });

    // Apply canon headers to response
    Object.entries(canonHeaders2).forEach(([key, value]) => {
      response2.headers.set(key, value);
    });

    // ═══════════════════════════════════════════════════════════════════════
    // 🚦 LIMITS: Record usage after successful response (non-blocking)
    // ═══════════════════════════════════════════════════════════════════════
    LimitsEnforcer.recordUsage({
      memberId: isAnon ? undefined : authUserId ?? undefined,
      anonId: stableAnonId,
      tier: memberTier,
      resource: 'text',
      tokensIn: orchestratorResult.metadata?.tokensUsed?.input ?? 0,
      tokensOut: orchestratorResult.metadata?.tokensUsed?.output ?? 0,
    }).catch(err => {
      console.error('[LimitsEnforcer] Failed to record usage:', err);
    });

    return withSessionCookie(response2, sessionCookie);
  } catch (err: any) {
    // Audit: request failed
    logRequestComplete(reqId, {
      ok: false,
      status: 500,
      route: '/api/between/chat',
      latencyMs: Date.now() - startTime,
      errorCode: 'MAIA_TEMPORARY_ERROR',
    });

    console.error('Chat route error:', err);
    // Error responses don't need session cookie - no session continuity for failed requests
    return NextResponse.json(
      {
        error: 'MAIA_TEMPORARY_ERROR',
        message:
          "I'm experiencing some difficulty processing right now, but I'm here with you. Could you try again?",
      },
      { status: 500 },
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Crystallization Detection - Identifies breakthrough moments for episode capture
// ═══════════════════════════════════════════════════════════════════════════════

function detectCrystallization(userMessage: string, assistantResponse: string) {
  const text = `${userMessage}\n${assistantResponse}`.toLowerCase();

  const markers = [
    'aha', 'epiphany', 'it clicked', 'now i see', 'i see now',
    'i realize', 'i realised', 'i finally', 'this changes',
    'breakthrough', 'core insight', 'something shifted',
  ];

  const hit = markers.some((m) => text.includes(m));

  // conservative default: mostly false
  return {
    shouldCapture: hit,
    fireAirAlignment: hit ? 0.85 : 0.5,
    suggestedStanza: hit ? assistantResponse.split('\n')[0]?.slice(0, 160) : undefined,
  };
}
