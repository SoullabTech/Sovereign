// backend: app/api/between/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { generateMaiaTurn, generateSimpleMaiaResponse } from '@/lib/consciousness/maiaOrchestrator';
import {
  ruptureDetectionService,
  enhanceResponseIfRuptureDetected,
  type RuptureDetectionResult
} from '@/lib/consultation/rupture-detection-middleware';
import { getConversationHistory, initializeSessionTable } from '@/lib/sovereign/sessionManager';
import { loadRelationshipMemory } from '@/lib/memory/RelationshipMemoryService';
import { getWisdomPrimerForUser } from '@/lib/consciousness/WisdomFieldPrimer';
import { developmentalMemory } from '@/lib/memory/DevelopmentalMemory';
import { loadVoiceCanonRules } from '@/lib/voice/voiceCanon';
import { renderVoice } from '@/lib/voice/voiceRenderer';

const SAFE_MODE = process.env.MAIA_SAFE_MODE === 'true';
const IS_PROD = process.env.NODE_ENV === 'production';

// Audit fingerprint secret - must be set in production for secure correlation
const AUDIT_FINGERPRINT_SECRET =
  process.env.MAIA_AUDIT_FINGERPRINT_SECRET ||
  (IS_PROD ? '' : 'dev-only-secret'); // Dev fallback OK, prod requires real secret

// Fail-closed: production MUST have fingerprint secret configured
if (IS_PROD && !process.env.MAIA_AUDIT_FINGERPRINT_SECRET) {
  console.error('🚨 FATAL: MAIA_AUDIT_FINGERPRINT_SECRET is required in production');
  throw new Error('MAIA_AUDIT_FINGERPRINT_SECRET is required in production');
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
    semanticHits: number;
    breakthroughsFound: number;
    bulletsInjected: number;
  };
  relationshipEncounters: number;
  injected: boolean;
  bundleChars: number;
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
    reason: data.reason ?? null,
    longtermGate: {
      envEnabled: process.env.MAIA_LONGTERM_WRITEBACK === '1',
    },
  });
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
  const isProd = process.env.NODE_ENV === 'production';
  const secure = isProd ? '; Secure' : '';
  // Note: __Host- prefix requires Path=/ and no Domain attribute (which we comply with)
  const setCookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(sid)}; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=${60 * 60 * 24 * 30}`;
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
        authority: 'CANON',
        scope: 'GLOBAL',
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
      threshold,
      { authority: 'CANON', scope: 'GLOBAL' }
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

  try {
    // Initialize database tables if needed
    await initializeSessionTable();

    const body = await req.json();
    const { message, sessionId, mode, userId: bodyUserId, userName, meta } = body as {
      message?: string;
      sessionId?: string;
      mode?: 'dialogue' | 'counsel' | 'scribe';
      userId?: string;
      userName?: string;
      meta?: { explorerId?: string; sessionId?: string };
    };

    // Voice Renderer request flags
    const voiceEngine = (body?.voiceEngine as 'local' | 'claude' | undefined) ?? 'local';
    const allowRemoteRendering = body?.allowRemoteRendering === true;

    // Canon Wrap: Two-key turn (server must allow + client must request)
    const serverAllowsCanonWrap = process.env.CANON_WRAP_ENABLED === '1';
    const allowCanonWrap = serverAllowsCanonWrap && body?.allowCanonWrap === true;

    // 🔒 SESSION: Get server-issued session ID from cookie (prevents spoofing)
    const { sid: safeSessionId, setCookie: sessionCookie } = getOrCreateSessionId(req);
    // Note: body.sessionId is now ignored for identity - server controls session assignment

    if (!message || typeof message !== 'string') {
      return withSessionCookie(
        NextResponse.json({ error: 'Message is required' }, { status: 400 }),
        sessionCookie
      );
    }

    // ✅ IDENTITY RESOLUTION: Server-authoritative in production, flexible in dev
    const explorerId = meta?.explorerId;
    const devTrustBodyId = process.env.MAIA_DEV_TRUST_BODY_ID === '1';

    // TODO: When auth is implemented, authUserId should come from verified session/token
    const authUserId: string | null = null; // Placeholder for future auth integration

    let effectiveUserId: string;
    if (authUserId) {
      // ✅ Server-verified identity (future: from NextAuth, Clerk, etc.)
      effectiveUserId = authUserId;
    } else if (IS_PROD) {
      // 🔒 Production: Always session-scoped, never trust client body
      effectiveUserId = `anon:${safeSessionId}`;
    } else if (devTrustBodyId) {
      // 🧪 Dev mode with trust enabled: Allow client-supplied IDs for testing
      effectiveUserId = explorerId
        ? explorerId
        : (typeof bodyUserId === 'string' && bodyUserId.trim().length > 0)
          ? bodyUserId.trim()
          : `anon:${safeSessionId}`;
    } else {
      // 🔒 Dev mode without trust: Session-scoped (safe default)
      effectiveUserId = `anon:${safeSessionId}`;
    }

    // 🔍 AUDIT: Structured identity resolution log (privacy-safe)
    const identityMode = authUserId ? 'auth' : IS_PROD ? 'prod-anon' : devTrustBodyId ? 'dev-trusted' : 'dev-anon';
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
    };

    // Log mode for debugging
    console.log('[Chat API] Mode parameter:', mode || 'not provided (will default to dialogue)');
    console.log('[Chat API] Effective userId:', effectiveUserId);
    console.log('[Chat API] 📦 Normalized meta:', normalizedMeta);

    // 📚 LOAD CONVERSATION HISTORY: Get recent exchanges for continuity
    const conversationHistory = await getConversationHistory(safeSessionId, 20);
    console.log(`[Chat API] Loaded ${conversationHistory.length} conversation turns`);

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

    // 🔮 INJECT WISDOM FIELD: Load Spiralogic metaphysical canon
    let wisdomField = null;
    try {
      const currentThemes = relationshipMemory?.themes.map(t => t.theme) || [];
      wisdomField = await getWisdomPrimerForUser(effectiveUserId, {
        detail: 'standard',
        currentThemes: currentThemes.slice(0, 3) // Top 3 themes for vault queries
      });
      console.log('[Chat API] 🔮 Wisdom Field canon injected - length:', wisdomField?.length || 0, 'chars');
      console.log('[Chat API] 🔮 Themes for vault query:', currentThemes.slice(0, 3));
    } catch (err) {
      console.warn('[Chat API] Could not load wisdom field:', err);
      // Graceful degradation - continue without wisdom field
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

            const wrapped = await renderVoice({
              userId: effectiveUserId,
              sessionId: safeSessionId,
              mode: normalizedMode,
              contentDraft: canonResponse,
              engine: voiceEngine === 'claude'
                ? { kind: 'remote', vendor: 'claude', model: 'claude-sonnet-4' }
                : { kind: 'local', model: 'qwen2.5:7b-instruct' },
              guardrails: {
                noNewFacts: true,
                preserveCanonVerbatim: true,
                maxLengthMultiplier: doctrine?.constraints.maxLengthMultiplier ?? 1.35,
                forbidNewNumbers: doctrine?.constraints.forbidNewNumbers ?? true,
                forbidNewProperNouns: doctrine?.constraints.forbidNewProperNouns ?? true,
                allowGentleFraming: true,
              },
              consent: { allowRemoteRenderer: allowRemoteRendering },
              rules,
              wrapOnly: true,
            });

            logRequestComplete(reqId, {
              ok: true,
              status: 200,
              route: '/api/between/chat',
              latencyMs: Date.now() - startTime,
              responseChars: wrapped.renderedText.length,
              safeMode: false,
              path: 'canon',
            });

            return withSessionCookie(NextResponse.json({
              message: wrapped.renderedText,
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
                voiceRenderer: wrapped.compliance,
              },
            }), sessionCookie);
          }

          // NO WRAP: Return canon bead directly
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
      let voiceMetrics = null;

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
          maxLengthMultiplier: doctrine?.constraints.maxLengthMultiplier ?? 1.35,
          forbidNewNumbers: doctrine?.constraints.forbidNewNumbers ?? true,
          forbidNewProperNouns: doctrine?.constraints.forbidNewProperNouns ?? true,
          allowGentleFraming: true,
        },
        consent: { allowRemoteRenderer: false },
        rules,
      });

      outboundText = voiceOutput.renderedText;
      voiceMetrics = {
        compliance: voiceOutput.compliance,
        metrics: voiceOutput.metrics,
      };

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

      return withSessionCookie(NextResponse.json({
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
          ruptureDetection: ruptureDetection.ruptureDetected ? {
            detected: ruptureDetection.ruptureDetected,
            type: ruptureDetection.ruptureType,
            confidence: ruptureDetection.confidence,
            enhanced: ruptureProcessingResult?.consultationUsed || false
          } : undefined
        },
      }), sessionCookie);
    }

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
        userName: userName || 'Explorer',
        relationshipMemory, // ✅ Relational continuity
        wisdomField, // ✅ Spiralogic metaphysical canon
      }
    });

    // 📊 AUDIT: Memory pipeline metrics (content-free)
    const memPipeline = orchestratorResult.metadata?.memoryPipeline;
    const memRetrieval = memPipeline?.retrieval;
    logMemoryPipelineDecision(reqId, {
      userId: effectiveUserId,
      sessionId: safeSessionId,
      memoryModeEffective: memPipeline?.mode || 'unknown',
      sensitiveInput: orchestratorResult.metadata?.sensitiveInput || false,
      counts: {
        turnsRetrieved: memRetrieval?.turnsRetrieved ?? 0,
        semanticHits: memRetrieval?.semanticHits ?? 0,
        breakthroughsFound: memRetrieval?.breakthroughsFound ?? 0,
        bulletsInjected: memRetrieval?.bulletsInjected ?? 0,
      },
      relationshipEncounters: memPipeline?.relationshipSnapshot?.encounterCount ?? 0,
      injected: (memRetrieval?.bulletsInjected ?? 0) > 0,
      bundleChars: 0, // Bundle text length not exposed; could add if needed
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
    let voiceMetrics2 = null;

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
        maxLengthMultiplier: doctrine2?.constraints.maxLengthMultiplier ?? 1.35,
        forbidNewNumbers: doctrine2?.constraints.forbidNewNumbers ?? true,
        forbidNewProperNouns: doctrine2?.constraints.forbidNewProperNouns ?? true,
        allowGentleFraming: true,
      },
      consent: { allowRemoteRenderer: false },
      rules: rules2,
    });

    outboundText2 = voiceOutput2.renderedText;
    voiceMetrics2 = {
      compliance: voiceOutput2.compliance,
      metrics: voiceOutput2.metrics,
    };

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

    return withSessionCookie(NextResponse.json({
      message: outboundText2,
      consciousness: orchestratorResult.consciousness,
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
        ruptureDetection: ruptureDetection.ruptureDetected ? {
          detected: ruptureDetection.ruptureDetected,
          type: ruptureDetection.ruptureType,
          confidence: ruptureDetection.confidence,
          enhanced: ruptureProcessingResult?.consultationUsed || false
        } : undefined
      }
    }), sessionCookie);
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
