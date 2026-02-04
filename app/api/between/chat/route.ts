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
import {
  ruptureDetectionService,
  enhanceResponseIfRuptureDetected,
  type RuptureDetectionResult
} from '@/lib/consultation/rupture-detection-middleware';
import { getConversationHistory, getUserConversationHistory, initializeSessionTable, ensureSession, addConversationExchange } from '@/lib/sovereign/sessionManager';
import { ensureSchemaReady } from '@/lib/db/schemaGate';
import { loadRelationshipMemory } from '@/lib/memory/RelationshipMemoryService';
import { loadSignificantMoments, formatSignificantMomentsAddendum } from '@/lib/memory/SignificantMomentsService';
import { inferAwarenessFromRelationship, type AwarenessLevel } from '@/lib/consciousness/awareness-levels';
import { getWisdomPrimerForUser } from '@/lib/consciousness/WisdomFieldPrimer';
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
import { query } from '@/lib/db/postgres';
import { LimitsEnforcer, getMemberTier, type MemberTier, type EnforcementDecision } from '@/lib/limits/LimitsEnforcer';
import {
  computeMemberSpiralState,
  buildSpiralSnapshot,
  generateSnapshotPromptAddendum,
  type ConversationTurn
} from '@/lib/consciousness/spiralSnapshot';
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
          timezone: birthData.location?.timezone || 'UTC',
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

// 🚨 LOUD WARNING: Body ID trust is enabled in production
// This allows clients to spoof userId - only for local Docker testing!
if (IS_PROD && process.env.MAIA_TRUST_BODY_ID_IN_PROD === '1') {
  console.error('');
  console.error('╔══════════════════════════════════════════════════════════════╗');
  console.error('║  🚨 SECURITY WARNING: MAIA_TRUST_BODY_ID_IN_PROD=1           ║');
  console.error('║  Client-supplied userId will be TRUSTED in production.       ║');
  console.error('║  This enables userId spoofing — use ONLY for local testing!  ║');
  console.error('║  If this is real production, REMOVE this env var immediately.║');
  console.error('╚══════════════════════════════════════════════════════════════╝');
  console.error('');
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
    const mode = rawMode === 'patient' ? 'counsel'
               : rawMode === 'session' ? 'scribe'
               : rawMode === 'normal' ? 'dialogue'
               : rawMode; // Pass through if already normalized

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

    if (!message || typeof message !== 'string') {
      return withSessionCookie(
        NextResponse.json({ error: 'Message is required' }, { status: 400 }),
        sessionCookie
      );
    }

    // ✅ IDENTITY RESOLUTION: Server-authoritative in production, flexible in dev
    const explorerId = meta?.explorerId;

    // 🔐 TWO-KEY SAFETY: Trust body ID requires explicit opt-in
    // In production, BOTH flags must be set to allow body ID trust (prevents accidental exposure)
    const TRUST_BODY_ID =
      process.env.MAIA_DEV_TRUST_BODY_ID === '1' &&
      (!IS_PROD || process.env.MAIA_TRUST_BODY_ID_IN_PROD === '1');

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
          serverUserName = member.preferred_name || member.name || 'Friend';
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
    const selfletEligible = SELFLET_ALLOW_ANON || !isAnon;

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
      anonId: isAnon ? effectiveUserId : undefined,
      tier: memberTier,
      resource: 'text',
    });

    // Handle enforcement decisions
    if (limitsCheck.action === 'block') {
      console.log(`[Chat API] 🚫 Usage blocked for ${effectiveUserId}: ${limitsCheck.message}`);
      return NextResponse.json({
        message: limitsCheck.message,
        upgradeHint: limitsCheck.upgradeHint,
        blocked: true,
        tier: memberTier,
      }, {
        status: 429,
        headers: makeCanonHeaders({ requestId: reqId, pipeline: 'direct', source: 'direct' }),
      });
    }

    // Store nudge for later injection into response (if applicable)
    const limitNudge = limitsCheck.action === 'nudge' ? limitsCheck : null;
    if (limitNudge) {
      console.log(`[Chat API] 💬 Usage nudge for ${effectiveUserId}: ${limitNudge.nudgeType}`);
    }

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

      // 🛡️ CANON HEADERS: Provenance stamps for all MAIA responses
      const canonHeaders = makeCanonHeaders({
        requestId: reqId,
        pipeline: 'orchestrator.generateMaiaTurn',
        source: 'direct',
        mode: isSanctuary ? 'SANCTUARY' : 'STANDARD',
        validation: socraticValidation,
        repaired: false,
      });

      const response = NextResponse.json({
        message: outboundText,
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

    // Use full fail-soft consciousness orchestrator
    const orchestratorResult = await generateMaiaTurn({
      message,
      userId: effectiveUserId,
      sessionId: safeSessionId,
      conversationHistory, // ✅ Now loaded from database
      meta: normalizedMeta, // ✅ Normalized identity for downstream persistence
      context: {
        chatType: 'between-member',
        endpoint: '/api/between/chat',
        mode: mode || 'dialogue', // Pass mode (Talk/Care/Note) for appropriate system prompts
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
        epistemicPathAddendum: safeAddenda.epistemicPath || undefined
      },
      // Route/profile tracing for corpus callosum filtering
      originRoute: '/api/between/chat',
      processingProfileOverride: 'BETWEEN',
    });

    // 🚨 SELF-ALERTING: Log warnings with route context (deferred from before orchestrator)
    const routeMode = orchestratorResult.route?.mode ?? 'unknown';

    // Route-aware filtering: only warn W_REL_EMPTY if route should have relationship context
    const routeShouldHaveRelationship = ['care', 'mentor', 'deep'].includes(routeMode);
    const filteredWarnings = contextWarnings.filter(w => {
      if (w === 'W_REL_EMPTY' && !routeShouldHaveRelationship) return false;
      return true;
    });

    if (filteredWarnings.length > 0) {
      console.warn('[MAIA CONTEXT]', {
        warnings: filteredWarnings,
        reqId,
        userId: effectiveUserId ? effectiveUserId.slice(0, 8) : 'anon',
        recognized: !isAnon,
        // Full route object (typed)
        route: orchestratorResult.route ? {
          mode: orchestratorResult.route.mode,
          type: orchestratorResult.route.type,
          safeMode: orchestratorResult.route.safeMode,
        } : null,
        // "Why this should exist" signals
        birthDataPresent: !!birthData?.date,
        hasRelationshipMemory: hasMeaningfulRelationshipMemory(relationshipMemory),
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

    // 💾 PERSIST CONVERSATION: Save to database (unless Sanctuary mode)
    if (isSanctuary) {
      console.log('🛡️ [Sanctuary] Skipping conversation persistence - speak freely');
    } else {
      await addConversationExchange(safeSessionId, message, outboundText2, {
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

    const response2 = NextResponse.json({
      message: outboundText2,
      consciousness: orchestratorResult.consciousness,
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
      anonId: isAnon ? effectiveUserId : undefined,
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
