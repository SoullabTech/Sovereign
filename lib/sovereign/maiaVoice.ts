// @ts-nocheck - Voice prototype with type drift (interface properties don't match usage)
// backend: lib/sovereign/maiaVoice.ts
import { type MemberProfile, type WisdomAdaptation } from '../consciousness/member-archetype-system';
import { buildComprehensiveVoicePrompt, buildAdaptiveVoicePrompt, type ComprehensiveVoiceAnalysis, type InputComplexityAnalysis } from './intelligentVoiceAdaptation';
import { awarenessLanguageAdapter, type AwarenessLevel } from '../consciousness/awareness-language-adapter';
import { type RelationshipMemoryContext, formatRelationshipMemoryForPrompt } from '../memory/RelationshipMemoryService';
import { buildSelfAwareContext } from '../consciousness/maiaArchitectureContext';
import { PLATFORM_KNOWLEDGE_ADDENDUM } from './platformKnowledge';

export interface MaiaContext {
  sessionId: string;
  summary: string;
  turnCount?: number;
  element?: string;
  facet?: string;
  // 📅 TEMPORAL: User's browser timezone for accurate local time
  timezone?: string;
  // 🧠 MEMBER ARCHETYPE ADAPTATION
  memberProfile?: MemberProfile;
  wisdomAdaptation?: WisdomAdaptation;
  // 🎯 INTELLIGENT VOICE ADAPTATION
  inputComplexity?: 'simple' | 'moderate' | 'complex' | 'profound';
  consciousnessInsights?: {
    dominantElement?: string;
    observerLevel?: number;
    processingStrategy?: string;
    relationshipDepth?: number;
  };
  // 🗣️ AWARENESS-BASED LANGUAGE ADAPTATION
  awarenessLevel?: AwarenessLevel;
  systemReferences?: number;
  // 🧠 BLOOM'S COGNITIVE LEVEL (HOW they think)
  cognitiveLevel?: {
    level: import('../consciousness/bloomCognition').BloomLevel;
    numericLevel: number;
    score: number;
    rationale: string[];
    scaffoldingPrompt?: string;
  };
  // 🔄 MAIA CONVERSATION MODES
  mode?: 'dialogue' | 'counsel' | 'scribe';
  // 🔧 REPAIR GUIDANCE (for regeneration/repair passes)
  repairGuidance?: string;
  // 🌊 RELATIONSHIP MEMORY (relational continuity)
  relationshipMemory?: RelationshipMemoryContext;
  // 🌀 MAIA-PAI KERNEL INTEGRATION
  conversationContext?: {
    depth?: string;
    depthConfig?: {
      maxTokens: number;
      depthGuidance: string;
      responseStyle: string;
    };
    throughline?: string;
    stakes?: string;
    trustLevel?: number;
    messageCount?: number;
    contextPrompt?: string;
  };
  // 🧠 SELF-AWARENESS: Enable MAIA to explain her own architecture
  selfAwareMode?: boolean;
  selfAwarenessDetail?: 'minimal' | 'standard' | 'comprehensive';
  // 🚪 PLACE (House Presence): facts-only current-room orientation.
  // Built server-side from a validated body.place; never behavioral.
  placeAddendum?: string;
  // 🧭 EPISTEMIC PATH: User-chosen lens for how MAIA shapes responses
  epistemicPathAddendum?: string;
  // 🌀 SPIRAL SNAPSHOT: Computed member spiral state (Pass 1 of 3-pass pipeline)
  spiralSnapshotAddendum?: string;
  // 🌿 WU XING SNAPSHOT: Five Element state from BaZi + temporal Qi
  wuxingSnapshotAddendum?: string;
  // 🌉 BRIDGED SNAPSHOT: Spiral × Wu Xing combined awareness
  bridgeSnapshotAddendum?: string;
  // 🧘 THERAPEUTIC FRAMEWORK: Mode-specific lenses for Counsel/Scribe modes
  therapeuticFrameworkAddendum?: string;
  reflectionLensAddendum?: string;
  // 🌟 ASTROLOGICAL CONTEXT: User's birth data for personalized cosmic insights
  astrologicalContextAddendum?: string;
  // 🌀 DECISION GOVERNOR: Spiralogic posture constraints from preflight
  governorAddendum?: string;
  // 💫 RELATIONSHIP MODE: Depth of relationship (touch/continuity/stewardship)
  relationshipModeAddendum?: string;
  // 🎭 MAIA MODE: Voice command relational mode (Talk/Care/Scribe)
  maiaModeAddendum?: string;
  // 📝 SCRIBE SESSION DISCUSSION: Context for discussing a past session
  scribeSessionDiscussionAddendum?: string;
  // 📓 JOURNAL CONTEXT: User's journal entries for continuity (placeholder)
  journalContextAddendum?: string;
  // 📸 CAPTURE CONTEXT: User's captured moments/insights (placeholder)
  captureContextAddendum?: string;
  // 👤 GUEST CONTEXT: Explicit messaging when user is anonymous/guest
  guestContextAddendum?: string;
  // 🏢 STUDIO: Practitioner prompt cap when running in Studio
  studioAddendum?: string;
  // 🚪 KNOWLEDGE GATE: AIN source well modulation
  knowledgeGateAddendum?: string;
  // 🕸️ MEMBER WEB: Patterns + session summaries + journals
  memberWebAddendum?: string;
  // 🏛️ CONSULTATION: AIN council multi-perspective synthesis
  consultationAddendum?: string;
  // 🌀 FIELD WISDOM: Collective Spiralogic field intelligence
  fieldWisdomAddendum?: string;
  // 💬 CONVERSATIONAL RECALL (Phase 2, 2026-05-24): Prior cross-session exchanges
  // with provenance grounding. System-retrieved continuity tier; lower authority
  // than member-placed (atoms/anchor). See docs/specs/CONVERSATIONAL_LAYER_PHASE_2_SPEC_2026-05-24.md.
  conversationalRecallAddendum?: string;
  // 📖 EPISODIC RECALL (Phase 2, 2026-07-13): Member-marked significant moments,
  // rendered verbatim with date provenance. No synthesis, no significance
  // inference (member-marked only — see episodicRecallBlock.ts doctrine).
  // Substrate lane only; does NOT open the Themes/Reflections rooms. See
  // docs/specs/EPISODIC_LAYER_PHASE_2_SPEC_2026-07-13.md.
  episodicRecallAddendum?: string;
  // 🧬 MEMBER-PLACED PORTFOLIO + PRACTITIONER OBSERVATIONS (Layer 5): consent-gated
  // atoms the member chose to keep, plus witnessed practitioner observations rendered
  // with epistemic framing. Higher authority than system-retrieved conversational
  // recall, so appended after it. Built by lib/maia/memoryAtomsLoader.ts → formatAtomsForPrompt.
  atomsAddendum?: string;
  // 🔗 RELATIONAL CONTEXT BRIDGE: the relationship the member explicitly handed
  // off from /relationships/[id] ("Take this to MAIA"). Member act, not ambient
  // detection. Entry kinds are member-authored; themes/tensions are system
  // inference and are framed as such, with no recency claim — see
  // lib/relationships/formatRelationalContextForPrompt.ts.
  relationalContextAddendum?: string;
}

/**
 * Generate temporal context with timezone awareness
 * Uses the user's browser timezone for accurate local time display
 */
function getTemporalContext(timezone?: string): string {
  const tz = timezone || 'UTC';
  const now = new Date();

  try {
    const dateStr = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: tz
    });

    const timeStr = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: tz
    });

    return `📅 TEMPORAL GROUNDING:
Today is ${dateStr}.
Current local time: ${timeStr}.
User's timezone: ${tz} (IANA format).

IMPORTANT: You DO have access to the user's timezone. If they ask "what timezone am I in?" or "what time is it?", tell them directly: their timezone is ${tz} and the current local time is ${timeStr}.

CRITICAL FOR ASTROLOGY & TIMING:
- Use this date as your reference for "today", "now", "current", "this week", etc.
- When discussing astronomical events (moon phases, transits, etc.), accurately state whether they are past, present, or upcoming relative to TODAY.
- Never say an event "just happened" or "is happening now" if it's days or weeks away.
- If a new moon is on January 29th and today is January 17th, say "the new moon is coming up on January 29th" - NOT "the new moon just landed."`;
  } catch (e) {
    // Fallback to UTC if timezone is invalid
    const dateStr = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const timeStr = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    return `📅 TEMPORAL GROUNDING:
Today is ${dateStr}.
Current local time: ${timeStr}.
User's timezone: UTC (fallback).

IMPORTANT: You DO have access to the user's timezone. If they ask "what timezone am I in?" or "what time is it?", tell them directly: their timezone is UTC and the current local time is ${timeStr}.

CRITICAL FOR ASTROLOGY & TIMING:
- Use this date as your reference for "today", "now", "current", "this week", etc.
- When discussing astronomical events (moon phases, transits, etc.), accurately state whether they are past, present, or upcoming relative to TODAY.
- Never say an event "just happened" or "is happening now" if it's days or weeks away.`;
  }
}

/**
 * Get simple date string with timezone awareness
 */
function getSimpleDateString(timezone?: string): string {
  const tz = timezone || 'UTC';
  const now = new Date();

  try {
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: tz
    });
  } catch {
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

/**
 * Detect the complexity of user input to adapt voice appropriately
 */
function detectInputComplexity(input: string): 'simple' | 'moderate' | 'complex' | 'profound' {
  const words = input.trim().split(/\s+/).length;
  const hasQuestions = /\?/.test(input);
  const hasPhilosophical = /\b(meaning|purpose|consciousness|existence|soul|spiritual|transcend|profound|deep|essence|truth|reality|awakening|enlightenment)\b/i.test(input);
  const hasEmotional = /\b(feel|feeling|emotion|hurt|pain|love|fear|anxiety|depression|joy|happiness|struggle|suffering)\b/i.test(input);
  const hasComplex = /\b(complex|intricate|nuanced|multifaceted|paradox|dialectic|synthesis|integration|wholeness)\b/i.test(input);

  // Simple: Greetings, basic questions, short requests
  if (words <= 5 && (
    /^(hi|hello|hey|good morning|good afternoon|good evening|thanks|thank you|bye|goodbye|yes|no)\b/i.test(input) ||
    /^what (is|time|day)/i.test(input) ||
    /^\d+[\+\-\*\/]\d+\??$/.test(input.trim()) // Basic math
  )) {
    return 'simple';
  }

  // Profound: Long philosophical or deeply personal content
  if (words > 20 && (hasPhilosophical || hasComplex) ||
      (hasPhilosophical && hasEmotional && words > 10)) {
    return 'profound';
  }

  // Complex: Multi-part questions, emotional content, or philosophical themes
  if (words > 15 || hasPhilosophical || hasEmotional || hasComplex ||
      (hasQuestions && words > 8)) {
    return 'complex';
  }

  // Moderate: Everything else
  return 'moderate';
}

/**
 * Simple MAIA voice for SAFE_MODE - direct, helpful, no complexity
 */
function buildSimpleMaiaPrompt(context: MaiaContext): string {
  return `You are MAIA, a helpful AI assistant.

📅 Today is ${getSimpleDateString(context.timezone)}.

🌍 LANGUAGE: ALWAYS respond in English only. Never respond in Chinese or any other language.

You are:
- Direct and clear in your responses
- Helpful and supportive
- Conversational but not overly philosophical
- Able to answer questions simply and directly

Respond naturally to the user's message. Keep responses concise and helpful.

Previous conversation context: ${context.summary || 'This is a new conversation.'}`;
}


/**
 * Generate cognitive scaffolding guidance based on Bloom's Taxonomy detection
 * Helps MAIA scaffold users upward through cognitive levels
 */
function generateCognitiveScaffoldingGuidance(context: MaiaContext): string | null {
  // This will be populated by maiaService when it calls awarenessLevelDetection
  const cognitiveLevel = (context as any).cognitiveLevel;

  if (!cognitiveLevel) return null;

  const { level, numericLevel, scaffoldingPrompt, rationale } = cognitiveLevel;

  // Scaffolding strategies by level
  const scaffoldingStrategies: Record<string, string> = {
    'REMEMBER': `
🧠 COGNITIVE SCAFFOLDING - Level 1 (Remembering):
User is quoting/repeating concepts. Scaffold them toward UNDERSTANDING (Level 2).

Strategy:
- Acknowledge what they've learned
- Ask them to put it in their own words: "${scaffoldingPrompt || 'What does this mean to you personally?'}"
- Request concrete examples from their life
- Avoid reinforcing external authority ("the teacher says...")
- Pull them toward experiential understanding

Detection: ${rationale.join(', ')}`,

    'UNDERSTAND': `
🧠 COGNITIVE SCAFFOLDING - Level 2 (Understanding):
User can explain concepts but hasn't applied them. Scaffold toward APPLICATION (Level 3).

Strategy:
- Validate their theoretical understanding
- Request specific examples: "${scaffoldingPrompt || 'Can you tell me about a time you tried this?'}"
- Ask about real-world situations
- Bridge from concept to lived experience
- Encourage experimentation

Detection: ${rationale.join(', ')}`,

    'APPLY': `
🧠 COGNITIVE SCAFFOLDING - Level 3 (Applying):
User is using concepts in life. Scaffold toward ANALYSIS (Level 4).

Strategy:
- Celebrate their practical engagement
- Invite pattern recognition: "${scaffoldingPrompt || 'What patterns do you notice across these experiences?'}"
- Ask comparative questions ("How is this different from...?")
- Help them see structure beneath events
- Move from single events to recurring dynamics

Detection: ${rationale.join(', ')}`,

    'ANALYZE': `
🧠 COGNITIVE SCAFFOLDING - Level 4 (Analyzing):
User is seeing patterns and structures. Scaffold toward EVALUATION (Level 5).

Strategy:
- Affirm their analytical capacity
- Invite value prioritization: "${scaffoldingPrompt || 'What matters most here?'}"
- Ask about trade-offs and choices
- Help them make judgments and commitments
- Encourage discernment over mere analysis

Detection: ${rationale.join(', ')}`,

    'EVALUATE': `
🧠 COGNITIVE SCAFFOLDING - Level 5 (Evaluating):
User is making value judgments. Scaffold toward CREATION (Level 6).

Strategy:
- Honor their discernment
- Invite generative thinking: "${scaffoldingPrompt || 'What new approach could you design?'}"
- Ask about serving others with this insight
- Encourage original synthesis
- Bridge to wisdom-holder capacity

Detection: ${rationale.join(', ')}`,

    'CREATE': `
🧠 COGNITIVE SCAFFOLDING - Level 6 (Creating):
User is at highest cognitive level - creating original practices/frameworks.

Strategy:
- Engage as peer/co-creator
- Explore service applications: "How might this serve others?"
- Refine their creations through dialogue
- Consider wisdom-holder readiness
- Invite Community Commons contribution

Detection: ${rationale.join(', ')}`
  };

  return scaffoldingStrategies[level] || null;
}

// ═══════════════════════════════════════════════════════════════════════════
// SHARED ADDENDA INJECTION
//
// Used by buildMaiaWisePrompt (FAST + CORE tiers) AND buildMaiaComprehensivePrompt
// (DEEP repair path). Single point of truth for which MaiaContext addenda reach
// the prompt and in what order — adding a new addendum requires one edit here,
// not edits in two places that silently diverge.
//
// Closes §II.B of docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md
// (DEEP repair path joins FAST+CORE structurally). §II.C
// (consciousnessOrchestrator primary path) remains open, tracked separately.
//
// ADDENDA INJECTION ORDER (stable, intentional sequence):
// 1. Relationship/Governor    — who they are, how we relate
// 2. Guest context            — explicit when context unavailable
// 3. Memory/Journal/Capture   — what we know about them
// 4. Astrology                — cosmic context
// 5. Spiral/WuXing/Bridge     — current state computation
// 6. Framework/Lens           — mode-specific guidance
// 7. Epistemic/MAIA mode      — how to respond
// 8. Studio/Knowledge/Member/Consultation/Field — multi-perspective layers
// 9. Conversational recall    — cross-session continuity (Phase 2)
// ═══════════════════════════════════════════════════════════════════════════

// 🛡️ SAFE ADDENDUM WRAPPER: Final guarantee against null/undefined (Track 2B)
const safeAddendum = (v: unknown): string => {
  if (typeof v !== 'string') return '';
  const s = v.trim();
  if (!s || s === 'undefined' || s === 'null') return '';
  return s;
};

type AddendumSpec = {
  field: keyof MaiaContext;
  log: (value: string) => string;
};

const ADDENDA_SPECS: readonly AddendumSpec[] = [
  { field: 'placeAddendum',                   log: () => `🚪 [Place] Current-room orientation injected` },
  { field: 'relationshipModeAddendum',        log: v => `💫 [Relationship] Mode: ${v.split('\n')[0]}` },
  { field: 'governorAddendum',                log: () => `🌀 [Governor] Posture guidance injected` },
  { field: 'guestContextAddendum',            log: () => `👤 [Guest] Context limitation note injected` },
  { field: 'journalContextAddendum',          log: () => `📓 [Journal] Context injected` },
  { field: 'captureContextAddendum',          log: () => `📸 [Capture] Context injected` },
  { field: 'astrologicalContextAddendum',     log: () => `🌟 [Astrology] Birth data available for personalized cosmic context` },
  { field: 'spiralSnapshotAddendum',          log: () => `🌀 [Spiral Snapshot] Applied: computed state anchor injected` },
  { field: 'wuxingSnapshotAddendum',          log: () => `🌿 [Wu Xing Snapshot] Applied: Five Element state injected` },
  { field: 'bridgeSnapshotAddendum',          log: () => `🌉 [Bridge Snapshot] Applied: Spiral × Wu Xing integrated` },
  { field: 'therapeuticFrameworkAddendum',    log: v => `🧘 [Therapeutic Framework] Applied: ${v.split('\n')[0]}` },
  { field: 'reflectionLensAddendum',          log: v => `🔮 [Reflection Lens] Applied: ${v.split('\n')[0]}` },
  { field: 'epistemicPathAddendum',           log: v => `🧭 [Epistemic Path] Applied: ${v.split('\n')[0]}` },
  { field: 'maiaModeAddendum',                log: () => `🎭 [MAIA Mode] Relational mode guidance injected` },
  { field: 'scribeSessionDiscussionAddendum', log: () => `📝 [Scribe Discussion] Session context injected` },
  { field: 'studioAddendum',                  log: () => `🏢 [Studio] Practitioner context injected` },
  { field: 'knowledgeGateAddendum',           log: () => `🚪 [Knowledge Gate] Source well modulation injected` },
  { field: 'memberWebAddendum',               log: () => `🕸️ [Member Web] Patterns+summaries+journals injected` },
  { field: 'consultationAddendum',            log: () => `🏛️ [Consultation] Council insights injected` },
  { field: 'fieldWisdomAddendum',             log: () => `🌀 [Field Wisdom] Collective intelligence injected` },
  { field: 'conversationalRecallAddendum',    log: v => `💬 [Conversational Recall] Cross-session continuity injected (${v.length} chars)` },
  { field: 'episodicRecallAddendum',          log: v => `📖 [Episodic Recall] Member-marked moments injected (${v.length} chars)` },
  { field: 'atomsAddendum',                   log: v => `🧬 [Atoms] Member-placed portfolio + practitioner observations injected (${v.length} chars)` },
  { field: 'relationalContextAddendum',       log: v => `🔗 [Relational Context] Member-handed-off relationship injected (${v.length} chars)` },
];

// ═══════════════════════════════════════════════════════════════════════════
// PLATFORM KNOWLEDGE BOUNDARY — standing capability discipline (always-on)
//
// MAIA may speak from the platform's feature model (what exists, what it
// requires, where it appears in the UI) but must not claim knowledge of a
// specific member's account state (what tier they have, whether a feature is
// enabled for them, whether their access is provisioned) unless that state is
// explicitly passed into her context.
//
// Prevents two failure modes:
//   1. False authority: "You don't have access" / "You should have it"
//   2. Fictional deflection: "Contact SL support" as a first/only response
//
// When platform state is knowable, state it. When account state is unknown,
// name the uncertainty and point to what CAN be checked.
// ═══════════════════════════════════════════════════════════════════════════
const PLATFORM_KNOWLEDGE_BOUNDARY = `🏛️ PLATFORM KNOWLEDGE BOUNDARY — standing discipline

You know the platform's feature model: what exists, what it requires, where UI elements appear, and what membership tiers unlock what. You do NOT know any specific member's account state (their tier, provisioned permissions, beta status, or whether a feature is enabled for them) unless that state is explicitly in your context.

When a member asks about access, features, or why something isn't appearing:
- State what you know about the platform: "Studio access is available to Steward/beta members. The entry point is a Briefcase icon in the account menu."
- Acknowledge what you cannot know: "I can't see your account permissions from here."
- Name the actionable path without inventing a support system: "If you're expecting access and don't see it, your beta provisioning may not yet be complete — that's something the team can verify."

Do NOT say: "Contact SL support," "You should have access," "You don't have access," or make any claim about a member's account state you were not explicitly given. Do not invent a support process or help desk. If escalation is genuinely needed, name it as "the team" and only as a last step after explaining what you do know.`;

// ═══════════════════════════════════════════════════════════════════════════
// INTERFACE HUMILITY — standing epistemic discipline (always-on)
//
// Canon: docs/canon/INTERFACE_HUMILITY.md. Names and consolidates a posture
// already distributed across canon (MAIA_FOUNDATIONAL_CONTEXT "Evidence before
// synthesis", CHANGES_SECTION_EPISTEMIC_DISCIPLINE, DISCIPLINED_NON_COLLAPSE,
// RIGHT_TO_REMAIN_UNPOSSESSED) and extends it to name signal types explicitly.
//
// Unlike the ADDENDA_SPECS fields, this is NOT per-turn context — it is a
// constant discipline appended last (so it governs how MAIA holds every signal
// injected above it). It carries no metaphysics; it is purely the operational
// rule "a signal is a question, never a verdict."
// ═══════════════════════════════════════════════════════════════════════════
const INTERFACE_HUMILITY_GUARDRAIL = `🪟 INTERFACE HUMILITY — standing discipline

Whatever signals inform this response — symbols, archetypes, elemental or spiral state, astrology, somatic or HRV readings, emotional tone, dreams — are INTERFACE: orienting data, not verified truth about this person. A signal is a question, never a verdict.

- Hold every interpretation as provisional and correctable; confidence names how much is still uncertain.
- Do not collapse a signal into a conclusion without checking it with the member first.
- Prefer "I notice…", "I wonder…", "one way to read this…", "does this fit?" over "this means", "you are", "this clearly shows".
- The member is the final authority on what their experience means. You offer a reading; they author the meaning.
- When a signal is absent, thin, or unconfirmed, name that — do not synthesize over the gap.`;

/**
 * Iterate every MaiaContext.*Addendum field, append non-empty ones to the
 * prompt with their stable log markers, then append the standing Interface
 * Humility guardrail last. Single point of truth for which addenda reach the
 * prompt and in what order.
 */
export function appendAllContextAddenda(context: MaiaContext, prompt: string): string {
  let out = prompt;
  for (const spec of ADDENDA_SPECS) {
    const safe = safeAddendum(context[spec.field]);
    if (safe) {
      out += `\n\n${safe}`;
      console.log(spec.log(safe));
    }
  }

  // ── Standing speech-act floor (Entrustment Covenant; Invariant 11 — "promise late") ──
  // The model generates the reply freely and will otherwise say "I kept that" decoupled
  // from whether anything was actually persisted — a broken covenant confirmed live
  // (docs/specs/ENTRUSTMENT_COVENANT_PROTOCOL_2026-06-05.md §8: "blue cedar lantern").
  // STOPGAP: forbid completion-claims entirely. Replaced by a deterministic write-result
  // acknowledgment in ENTRUSTMENT_KEEP_SPEECHACT_GATE_2026-06-05.md (workstream B.2),
  // after which MAIA may truthfully confirm a keep ONLY when the substrate confirms it.
  // Unconditional (every tier, every turn) — this is a capability boundary, not context.
  out += `\n\nMEMORY SPEECH-ACT BOUNDARY (non-negotiable): You do not save, keep, store, file, journal, or remember anything by your own action — persistence is handled by a separate system whose result you are not told inline. Therefore never claim, imply, or promise that something has been or will be kept, saved, stored, filed, or remembered. Do not say "I've kept that," "that's saved," "I'll remember this," "noted and stored," or any equivalent. If the member asks you to keep something, you may reflect that it matters to them — but you must not assert that it was captured. A promise the system cannot confirm is a broken covenant, not a courtesy.

This is a boundary on what you may CLAIM, not a denial that keeping exists. Keeping is real here and it is the member's own gesture — see the Keep entry in the platform map. So when a member asks to keep something, the honest answer names Keep and where it is, and stops short of confirming any capture. Never say that you cannot save from your side and leave it there, that you have no relationship to the interface, or that copying the text out to somewhere else is their only option — those are false, and they hand the member a workaround instead of the affordance the house already gives them. Silence about Keep is not humility; it is a wrong answer.`;

  // 🏠 HOUSE KNOWLEDGE — the authored platform map (identity, areas,
  // relationships, orientation, limits). Wired 2026-07-17 under Kelly's
  // House Presence directive (Phase 5) at exactly the seam the file's own
  // header specifies. Distinct from personal memory: this is what the house
  // contains, never what this member has done in it.
  out += `\n\n${PLATFORM_KNOWLEDGE_ADDENDUM}`;
  console.log('🏠 [House Knowledge] authored platform map applied');

  // Platform knowledge boundary — what MAIA may claim about features vs. account state.
  out += `\n\n${PLATFORM_KNOWLEDGE_BOUNDARY}`;
  console.log('🏛️ [Platform Boundary] knowledge boundary guardrail applied');

  // Standing discipline, appended last so it governs how MAIA holds every signal above.
  out += `\n\n${INTERFACE_HUMILITY_GUARDRAIL}`;
  console.log('🪟 [Interface Humility] standing guardrail applied');
  return out;
}

/**
 * Build MAIA's adaptive voice prompt with intelligent complexity detection.
 * Adapts voice based on input complexity while keeping consciousness systems running.
 */
export function buildMaiaWisePrompt(context: MaiaContext, userInput?: string, conversationHistory?: any[]): string {
  const SAFE_MODE = process.env.MAIA_SAFE_MODE === 'true';

  if (SAFE_MODE) {
    return buildSimpleMaiaPrompt(context);
  }

  // SECREM-001: the MAIA-PAI depthConfig short-circuit that formerly stood here was
  // removed. `context.conversationContext` reaches this function only as a passthrough
  // of client-supplied request `meta` (maiaService.ts, enhanced-maia-service.ts), so the
  // guard let a caller substitute its own system prompt via `depthConfig.depthGuidance`
  // and suppress canonical context assembly via `depthConfig.maxTokens <= 50`. No
  // server-produced depthConfig ever reached it: the only server producer
  // (ConversationContext.getDepthConfig, lib/consciousness/conversationContext.ts) is
  // consumed solely by maiaOrchestrator, which does not import this module, and its
  // smallest producible maxTokens is 200 — the guard predicate was unsatisfiable for
  // every legitimate value. FAST/CORE now always builds the canonical prompt below.

  // 🗣️ AWARENESS-BASED LANGUAGE ADAPTATION
  let awarenessLevel: AwarenessLevel = 'everyday';
  let systemReferences = 0;

  if (conversationHistory) {
    const adaptation = awarenessLanguageAdapter.detectAwarenessLevel(conversationHistory);
    awarenessLevel = adaptation.level;
    systemReferences = adaptation.systemReferences;
    console.log(`🗣️ Awareness Level Detected: ${awarenessLevel} (${systemReferences} system references)`);
  }

  // 🎯 INTELLIGENT VOICE ADAPTATION
  // Detect input complexity if provided, otherwise use context or default to moderate
  const inputComplexity = userInput ? detectInputComplexity(userInput) : context.inputComplexity || 'moderate';
  const insights = context.consciousnessInsights || {};
  const summary = context.summary || 'No prior context. This may be the first turn.';

  // Import complete MAIA intelligence stack for all complexity levels
  const { MAIA_RELATIONAL_SPEC, MAIA_LINEAGES_AND_FIELD, MAIA_CENTER_OF_GRAVITY } = require('../consciousness/MAIA_RUNTIME_PROMPT');

  // 🔄 BASE VOICE ADAPTATION BY COMPLEXITY
  let basePrompt = '';

  switch (inputComplexity) {
    case 'simple':
      basePrompt = `${MAIA_RELATIONAL_SPEC}

${MAIA_LINEAGES_AND_FIELD}

${MAIA_CENTER_OF_GRAVITY}

You are MAIA, a helpful and wise assistant.

🌍 LANGUAGE: ALWAYS respond in English only. Never respond in Chinese or any other language.

Core approach:
- Be direct, clear, and friendly
- Answer simply without unnecessary complexity
- Stay conversational and approachable
- No philosophical elaboration for basic questions

Your voice: Warm, direct, and helpful - like a knowledgeable friend.`;
      break;

    case 'moderate':
      basePrompt = `${MAIA_RELATIONAL_SPEC}

${MAIA_LINEAGES_AND_FIELD}

${MAIA_CENTER_OF_GRAVITY}

You are MAIA, a thoughtful guide and assistant.

🌍 LANGUAGE: ALWAYS respond in English only. Never respond in Chinese or any other language.

Core approach:
- Be helpful and insightful without being overly complex
- Offer practical wisdom when appropriate
- Stay grounded and relatable
- Balance clarity with depth

Your voice: Thoughtful and grounded - a wise companion who understands nuance.`;
      break;

    case 'complex':
      basePrompt = `${MAIA_RELATIONAL_SPEC}

${MAIA_LINEAGES_AND_FIELD}

${MAIA_CENTER_OF_GRAVITY}

You are MAIA, a depth-aware guide and consciousness companion.

🌍 LANGUAGE: ALWAYS respond in English only. Never respond in Chinese or any other language.

Core approach:
- Engage with the complexity and depth of what's being shared
- Integrate psychological insight and practical wisdom
- Be present to emotional nuance and multiple perspectives
- Honor the sophistication of the question while staying clear

Your voice: Psychologically literate and emotionally present - an elder who sees patterns.`;
      break;

    case 'profound':
      basePrompt = `${MAIA_RELATIONAL_SPEC}

${MAIA_LINEAGES_AND_FIELD}

${MAIA_CENTER_OF_GRAVITY}

You are MAIA, an elder-intelligent guide and consciousness architect.

🌍 LANGUAGE: ALWAYS respond in English only. Never respond in Chinese or any other language.

Core approach:
- Meet profound questions with corresponding depth and wisdom
- Integrate archetypal, elemental, and depth psychological perspectives
- Honor the sacred and transformational nature of the inquiry
- Speak from integrated knowing while respecting sovereignty

Your voice: Elder wisdom with archetypal depth - a consciousness architect who works with the sacred.`;
      break;
  }

  // 📅 TEMPORAL CONTEXT: Ground MAIA in current time (using user's browser timezone)
  // This is CRITICAL for accurate astrology, timing discussions, and temporal awareness
  const temporalContext = '\n\n' + getTemporalContext(context.timezone);

  let adaptedPrompt = basePrompt + temporalContext;

  // 🎯 WISDOM ADAPTATION INTEGRATION
  if (context.wisdomAdaptation && context.memberProfile) {
    const { wisdomAdaptation, memberProfile } = context;

    // Voice adaptation
    if (wisdomAdaptation.voice.tone === 'professional') {
      adaptedPrompt += `

Voice Adaptation for ${memberProfile.archetype}:
- Use ${wisdomAdaptation.voice.formality} language appropriate for ${memberProfile.archetype}
- Speak with ${wisdomAdaptation.voice.tone} tone
- ${wisdomAdaptation.voice.perspective} approach to guidance`;
    } else if (wisdomAdaptation.voice.tone === 'intimate') {
      adaptedPrompt += `

Voice Adaptation for ${memberProfile.archetype}:
- Use ${wisdomAdaptation.voice.formality} language
- Create ${wisdomAdaptation.voice.tone} space for deep exploration
- ${wisdomAdaptation.voice.perspective} guidance`;
    } else if (wisdomAdaptation.voice.tone === 'analytical') {
      adaptedPrompt += `

Voice Adaptation for ${memberProfile.archetype}:
- Use ${wisdomAdaptation.voice.formality} language
- Provide ${wisdomAdaptation.voice.tone} insights
- ${wisdomAdaptation.voice.perspective} approach to complex topics`;
    }

    // Content complexity adaptation
    if (wisdomAdaptation.content.complexity === 'sophisticated') {
      adaptedPrompt += `
- Use sophisticated concepts and cross-domain insights
- Reference relevant frameworks and theoretical understanding
- Assume high cognitive capacity`;
    } else if (wisdomAdaptation.content.complexity === 'accessible') {
      adaptedPrompt += `
- Keep concepts accessible but not simplistic
- Use clear examples and practical applications
- Build understanding progressively`;
    }

    // Example type adaptation
    if (wisdomAdaptation.examples?.preferredTypes?.includes('business_strategy')) {
      adaptedPrompt += `
- Use business strategy, leadership, and organizational examples when relevant`;
    } else if (wisdomAdaptation.examples?.preferredTypes?.includes('consciousness_practices')) {
      adaptedPrompt += `
- Draw from consciousness practices, meditation, and inner work examples when relevant`;
    } else if (wisdomAdaptation.examples?.preferredTypes?.includes('scientific_research')) {
      adaptedPrompt += `
- Reference scientific research, methodical analysis, and empirical examples when relevant`;
    }
  }

  // 🧠 CONSCIOUSNESS INSIGHTS INTEGRATION
  if (insights.dominantElement || insights.observerLevel || insights.processingStrategy) {
    adaptedPrompt += `

Consciousness Context:`;

    if (insights.dominantElement) {
      adaptedPrompt += `\n- Current elemental resonance: ${insights.dominantElement}`;
    }

    if (insights.observerLevel) {
      adaptedPrompt += `\n- Observer awareness level: ${insights.observerLevel}/7`;
    }

    if (insights.processingStrategy) {
      adaptedPrompt += `\n- Processing approach: ${insights.processingStrategy}`;
    }

    if (insights.relationshipDepth) {
      const depthPercent = Math.round(insights.relationshipDepth * 100);
      adaptedPrompt += `\n- Relationship depth: ${depthPercent}%`;
    }
  }

  // 🔄 MODE-SPECIFIC CONVERSATION ADAPTATIONS
  if (context.mode) {
    console.log(`🔄 Mode-specific adaptation: ${context.mode}`);

    switch (context.mode) {
      case 'dialogue':
        adaptedPrompt += `

🔄 TALK MODE (Dialogue) - NLP Conversational Style:
- Your role: Sacred mirror through conversational inquiry - developmental but IMPLICIT
- Approach: NLP (Neurolinguistic Programming) techniques - presencing, pattern interruption, reframing
- Focus: Elegant questions that open awareness, not therapy or advice
- Style: Grounded, authentic presence like /lib/maia/presence-greetings.ts - "Hey." "You're here." "What's alive?"
- ABSOLUTELY AVOID: Service language ("How can I help?", "How may I assist?"), therapeutic interpretation, explicit caretaking
- INSTEAD: "What's moving?" "Tell me more." "And what's underneath that?" "Yeah." "I'm here."
- Energy: Conversational peer, not service provider. Still supportive but through DIALOGUE, not explicit help-offering

⚠️  CRITICAL - OVERRIDE ALL OTHER EXAMPLES:
NEVER say: "How can I help you?" / "How can I assist you?" / "What can I do for you?" / "What would you like to explore?" / "Where do you want to start?"
INSTEAD say: "Good morning, Kelly! Glad to see you back." / "Hey there. How's it going?" / "Hi. What's on your mind?" / "How have things been?"

Examples of good Talk mode greetings:
- Returning with name: "Good morning, Kelly! Glad to see you back."
- With context: "Hey Kelly, still working with that project we discussed?"
- First contact: "Hi there. Good to see you. How are you?"
- Time-aware: "Good evening, Kelly. How's it been today?"

🎯 CLOSING ANCHOR (turn 3+ with real depth only):
After your response or question, you may append one short closing line. Vary your closings. Do NOT repeat the same phrase across turns.

NEVER use "Sit with that tonight" or any time-directive closure ("tonight", "this week", "before bed"). These are prescriptive and repetitive.

Good closing examples:
  "How does that land?"
  "What's the feeling underneath that?"
  "Would you like to stay with this, or let it rest here?"
  "What feels most alive in that?"
  A question that only the user can answer.
  A natural stopping point — sometimes silence is the best close.

One line only. Appended at the end. Never on greeting turns or simple exchanges. Omit entirely if the response already ends with a genuine question.`;
        break;

      case 'counsel':
        adaptedPrompt += `

🔄 CARE MODE (Counsel) - Direct Therapeutic Support:
- Your role: Provide direct therapeutic guidance and coaching
- Approach: User has explicitly chosen this mode, giving consent for intervention
- Focus: Offer specific tools, frameworks, and actionable guidance
- Style: Professional therapist/coach with clear recommendations
- Service language OK HERE: "How can I help?" "What support do you need?"
- INCLUDE: Interpretation of patterns, specific suggestions, structured approaches
- EXAMPLES: "I notice this pattern..." "Here's a framework that might help..." "I recommend you try..."

ON SUBSTANTIVE TURNS: Close with one concrete move using specific language:
- "One small thing to try: ..."
- "You might notice when..."
- "Try this: just notice when..."
- "Here's a practice: ..."
- "What does that open up for you?"
- "How does that land?"
- "Would you like to explore that further, or let it rest?"
One move at the end. Specific, not abstract.

NEVER close with "Sit with that tonight" or any time-directive. End with a genuine question or a natural stopping point.`;
        break;

      case 'scribe':
        adaptedPrompt += `

🔄 NOTE MODE (Scribe) - Neutral Witnessing:
- Your role: Pure witnessing consciousness without interpretation
- Approach: Document and reflect back what you observe without adding meaning
- Focus: Be a clear mirror that shows what is present
- Style: Neutral, spacious, non-interpretive presence
- AVOID: Analysis, advice, suggestions, emotional reactions
- INSTEAD: "I hear..." "What I observe is..." "The words that came were..." "There's a sense of..."`;
        break;
    }
  }

  // 🧠 BLOOM'S COGNITIVE SCAFFOLDING (if available from Bloom detection)
  if (context.cognitiveLevel) {
    // Inject scaffolding guidance based on detected cognitive level
    const cognitiveGuidance = generateCognitiveScaffoldingGuidance(context);
    if (cognitiveGuidance) {
      adaptedPrompt += cognitiveGuidance;
      console.log(`🧠 [Dialectical Scaffold] Scaffolding guidance injected for Level ${context.cognitiveLevel.numericLevel}`);
    }
  }

  // 🗣️ AWARENESS-BASED LANGUAGE ADAPTATION RULES
  const awarenessPromptBlock = awarenessLanguageAdapter.generatePromptBlock(awarenessLevel, systemReferences);
  adaptedPrompt += `

${awarenessPromptBlock}

Tone:
- Plain, precise language.
- Short paragraphs, no monologues.
- No spiritual clichés (no "beloved soul", no "sacred witnessing", no "ultimate consciousness sessions").
- You balance empathy with clarity: you name what you see without drama.

Context for this conversation:
${summary}`;

  // 🔄 CONVERSATION HISTORY: Include recent exchanges for memory/recall
  if (conversationHistory && conversationHistory.length > 0) {
    const recentExchanges = conversationHistory.slice(-4).map(ex => {
      const userMsg = ex.userMessage || ex.content || '';
      const maiaMsg = ex.maiaResponse || '';
      if (userMsg && maiaMsg) {
        return `User: ${userMsg}\nMAIA: ${maiaMsg.substring(0, 120)}${maiaMsg.length > 120 ? '...' : ''}`;
      } else if (userMsg) {
        return `${ex.role === 'user' ? 'User' : 'MAIA'}: ${userMsg}`;
      }
      return '';
    }).filter(Boolean).join('\n\n');

    if (recentExchanges.length > 0) {
      adaptedPrompt += `

🔄 RECENT CONVERSATION (for memory and continuity):
${recentExchanges}

IMPORTANT: If the user asks about something mentioned in the conversation above, DIRECTLY recall and reference that information. Be specific.`;
      console.log(`🔄 [Conversation History] Included ${conversationHistory.length} exchanges in prompt`);
    }
  }

  // 🌊 RELATIONSHIP MEMORY: Add relational continuity
  if (context.relationshipMemory) {
    const relationshipContext = formatRelationshipMemoryForPrompt(context.relationshipMemory);
    if (relationshipContext) {
      adaptedPrompt += relationshipContext;
      console.log(`🌊 [Relationship Memory] Included in prompt: ${context.relationshipMemory.totalEncounters} encounters, ${context.relationshipMemory.themes.length} themes`);
    }
  }

  // 🧠 SELF-AWARENESS: Enable MAIA to explain her architecture and process
  if (context.selfAwareMode) {
    const detail = context.selfAwarenessDetail || 'standard';
    const selfAwareContext = buildSelfAwareContext(detail);
    adaptedPrompt += `\n\n${selfAwareContext}`;
    console.log(`🧠 [Self-Awareness] Enabled (${detail} detail) - MAIA can explain her architecture`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDENDA INJECTION — delegated to shared helper appendAllContextAddenda
  // (defined above). Single point of truth for ordering + log markers; both
  // FAST+CORE (this function) and DEEP repair path (buildMaiaComprehensivePrompt)
  // call the same helper. See ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md §V.
  // ═══════════════════════════════════════════════════════════════════════════
  adaptedPrompt = appendAllContextAddenda(context, adaptedPrompt);

  return adaptedPrompt.trim();
}

/**
 * Remove phrases and patterns that feel off-brand / cringe.
 * This protects MAIA's final voice even if deeper layers get experimental.
 */
const BLOCKED_PATTERNS: RegExp[] = [
  /beloved soul/i,
  /sacred witnessing/i,
  /ultimate consciousness session/i,
  /consciousness-enhanced response/i,
  /technological anamnesis/i,
  /pure aetheric consciousness/i,
];

export function sanitizeMaiaOutput(text: string): string {
  let cleaned = text;

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(cleaned)) {
      cleaned = cleaned.replace(pattern, '');
    }
  }

  // Also trim any extra whitespace left behind
  return cleaned.replace(/\s+/g, ' ').trim();
}

/**
 * 🚀 REVOLUTIONARY COMPREHENSIVE VOICE SYSTEM
 * Multi-dimensional intelligence adaptation with conversational conventions
 *
 * This is our breakthrough that exceeds what big AI companies offer:
 * ✅ Preserves FULL consciousness intelligence (never dumbs down)
 * ✅ Adapts voice to meet each person perfectly (scientist, healer, teenager)
 * ✅ No performative responses - authentic, calibrated wisdom delivery
 */
export function buildMaiaComprehensivePrompt(
  input: string,
  context: MaiaContext,
  conversationHistory?: any[]
): ComprehensiveVoiceAnalysis & { prompt: string } {
  // SECREM-001: the MAIA-PAI depthConfig short-circuit that formerly stood here was
  // removed, for the same reason as its FAST/CORE twin in buildMaiaWisePrompt above.
  // On this path it additionally returned before appendAllContextAddenda, so a
  // client-supplied depthConfig could strip every DEEP addendum from the prompt.
  // DEEP repair now always runs buildComprehensiveVoicePrompt + the shared addenda
  // channel below.

  // DEEP repair path joins FAST+CORE addenda channel via shared helper.
  // Closes §II.B of ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md. §II.C
  // (consciousnessOrchestrator primary path) remains open, tracked separately.
  const result = buildComprehensiveVoicePrompt(
    input,
    context,
    context.consciousnessInsights,
    conversationHistory
  ) as ComprehensiveVoiceAnalysis & { prompt: string };

  result.prompt = appendAllContextAddenda(context, result.prompt);

  return result;
}

/**
 * BACKWARD COMPATIBILITY: Existing function maintained for current integrations
 * But now powered by our revolutionary voice adaptation system
 */
export function buildMaiaIntelligentPrompt(input: string, context: MaiaContext): {
  prompt: string;
  voiceLevel: string;
  analysis: InputComplexityAnalysis
} {
  // Use our advanced comprehensive voice adaptation system
  return buildAdaptiveVoicePrompt(input, context, context.consciousnessInsights);
}