// backend: app/api/between/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
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
    /tell me about.*(modes?|talk|care|note)/,

    // Processing paths
    /what are.*(processing )?paths?/,
    /\b(fast|core|deep)\b.*(path|mode|processing)/,
    /explain.*(fast|core|deep)/,
    /tell me about.*(fast|core|deep)/,

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
  try {
    // Initialize database tables if needed
    await initializeSessionTable();

    const body = await req.json();
    const { message, sessionId, mode, userId: bodyUserId, userName } = body as {
      message?: string;
      sessionId?: string;
      mode?: 'dialogue' | 'counsel' | 'scribe';
      userId?: string;
      userName?: string;
    };

    // Voice Renderer request flags
    const voiceEngine = (body?.voiceEngine as 'local' | 'claude' | undefined) ?? 'local';
    const allowRemoteRendering = body?.allowRemoteRendering === true;

    // Canon Wrap: Two-key turn (server must allow + client must request)
    const serverAllowsCanonWrap = process.env.CANON_WRAP_ENABLED === '1';
    const allowCanonWrap = serverAllowsCanonWrap && body?.allowCanonWrap === true;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 },
      );
    }

    // ✅ IDENTITY RESOLUTION: Use provided userId or create session-scoped pseudo-user
    const safeSessionId = sessionId || `chat-${Date.now()}`;
    const effectiveUserId = (typeof bodyUserId === 'string' && bodyUserId.trim().length > 0)
      ? bodyUserId.trim()
      : `anon:${safeSessionId}`; // Session-scoped continuity without cross-user leakage

    // Log mode for debugging
    console.log('[Chat API] Mode parameter:', mode || 'not provided (will default to dialogue)');
    console.log('[Chat API] Effective userId:', effectiveUserId);

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

            return NextResponse.json({
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
            });
          }

          // NO WRAP: Return canon bead directly
          return NextResponse.json({
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
          });
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
      userInput: message.substring(0, 50) + '...'
    });

    if (SAFE_MODE) {
      // In safe mode, use simplified orchestrator without full consciousness pipeline
      const simpleResult = await generateSimpleMaiaResponse(message, safeSessionId, {
        mode: mode || 'dialogue' // Pass mode for Talk/Care/Note awareness
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

      return NextResponse.json({
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
      });
    }

    // Use full fail-soft consciousness orchestrator
    const orchestratorResult = await generateMaiaTurn({
      message,
      userId: effectiveUserId,
      sessionId: safeSessionId,
      conversationHistory, // ✅ Now loaded from database
      context: {
        chatType: 'between-member',
        endpoint: '/api/between/chat',
        mode: mode || 'dialogue', // Pass mode (Talk/Care/Note) for appropriate system prompts
        userName: userName || 'Explorer',
        relationshipMemory, // ✅ Relational continuity
        wisdomField, // ✅ Spiralogic metaphysical canon
      }
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

    return NextResponse.json({
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
    });
  } catch (err: any) {
    console.error('Chat route error:', err);
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
