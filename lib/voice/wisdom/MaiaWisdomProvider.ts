/**
 * MAIA WISDOM PROVIDER
 *
 * Adapter that connects voice streaming to the full PFI wisdom field.
 * PersonaPlex consumes already-built context - it does NOT own wisdom.
 *
 * Architecture principle: MAIA-SOVEREIGN orchestrates, PersonaPlex renders.
 *
 * Sanctuary Mode is a HARD WALL:
 * - No retrieval from memory bundle
 * - No spiral state fetched
 * - No persistence of response
 * - No debug logging with content
 */

import { MemoryBundleService, MemoryBundle } from '@/lib/memory/MemoryBundle';
import { SpiralStateService } from '@/lib/consciousness/spiral/SpiralStateService';
import type { SpiralState } from '@/lib/consciousness/spiral/spiralStateUtils';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

/**
 * Voice mode mapping for MAIA's relational stance
 */
export type MaiaVoiceMode = 'talk' | 'care' | 'note';

/**
 * Element from Spiralogic framework
 */
export type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether' | null;

/**
 * Input for building voice context
 */
export interface VoiceContextInput {
  userId: string;
  sessionId: string;
  currentInput: string;
  mode: MaiaVoiceMode;
  element?: Element;
  sanctuary: boolean;
  conversationHistory?: Array<{ role: string; content: string }>;
}

/**
 * Compact voice context payload for PersonaPlex
 *
 * This is what PersonaPlex receives - it should NOT build its own
 * persona prompt from raw memory data.
 */
export interface VoiceContextPayload {
  // Identity & mode
  mode: MaiaVoiceMode;
  element: Element;
  sanctuary: boolean;

  // Pre-built context strings (PersonaPlex injects these, doesn't build them)
  memoryDirective: string | null;     // Compressed memory context for prompt
  spiralDirective: string | null;     // Current spiral state summary
  relationshipBrief: string | null;   // Brief relationship context

  // Conversation continuity (always allowed, even in sanctuary)
  conversationHistory: Array<{ role: string; content: string }>;

  // Metadata for logging/debugging (NO content in sanctuary)
  metadata: {
    retrievalStats?: {
      memoryBulletsUsed: number;
      spiralsActive: number;
      encounterCount: number;
    };
    sanctuaryActive: boolean;
  };
}

// ═══════════════════════════════════════════════════════════════
// ELEMENT GUIDANCE (from PersonaPlex service.py)
// ═══════════════════════════════════════════════════════════════

const ELEMENT_GUIDANCE: Record<string, string> = {
  fire: 'Energy of transformation and will. Support directed action, passion, courage. Notice where they need to claim their power.',
  water: 'Realm of emotion and intuition. Hold space for feeling without fixing. Notice undercurrents, what flows beneath words.',
  earth: 'Ground of manifestation and stability. Support practical steps, embodiment, patience. Notice where they need grounding.',
  air: 'Domain of thought and communication. Support clarity, perspective, intellectual understanding. Notice mental patterns.',
  aether: 'Space of integration and transcendence. Hold paradox, witness transformation. Notice what wants to emerge.',
};

// ═══════════════════════════════════════════════════════════════
// MODE DIRECTIVES
// ═══════════════════════════════════════════════════════════════

const MODE_DIRECTIVES: Record<MaiaVoiceMode, string> = {
  talk: `Talk mode: Peer presence. Direct, warm, slightly playful. Match their energy.
Don't over-explain or be precious. If they're casual, be casual.
You're here to dialogue, not to guide or instruct.`,

  care: `Care mode: Therapeutic attunement. Slower pacing, deeper listening.
Notice what's under their words. Reflect feeling before content.
Hold space rather than filling it. Silence is medicine.
Never push toward resolution - witness what's present.`,

  note: `Note mode: Witnessing consciousness. You are the Scribe.
Capture essence, not summary. Find the mythic in the mundane.
Your words become memory artifacts. Be precise and evocative.
Speak as one who sees the pattern beneath the story.`,
};

// ═══════════════════════════════════════════════════════════════
// SANCTUARY DIRECTIVE
// ═══════════════════════════════════════════════════════════════

const SANCTUARY_DIRECTIVE = `
SANCTUARY SESSION ACTIVE:
This session is presence-only. No memories are recalled or formed.
- NEVER say "I remember...", "I recall...", "Last time we talked..."
- NEVER reference past conversations or imply continuity
- Respond fully present in THIS moment
- You can still be warm and helpful - just don't claim memory`;

// ═══════════════════════════════════════════════════════════════
// MAIN SERVICE
// ═══════════════════════════════════════════════════════════════

export const MaiaWisdomProvider = {
  /**
   * BUILD VOICE CONTEXT
   *
   * Main entry point. Respects sanctuary as a HARD WALL.
   * Returns a compact payload for PersonaPlex to render.
   */
  async buildVoiceContext(input: VoiceContextInput): Promise<VoiceContextPayload> {
    const {
      userId,
      sessionId,
      currentInput,
      mode,
      element = null,
      sanctuary,
      conversationHistory = [],
    } = input;

    // ═══════════════════════════════════════════════════════════════
    // SANCTUARY HARD WALL
    // ═══════════════════════════════════════════════════════════════

    if (sanctuary) {
      // NO retrieval. NO logging content. Minimal metadata only.
      console.log('🛡️ [VoiceWisdom] Sanctuary mode - skipping all retrieval');

      return {
        mode,
        element,
        sanctuary: true,
        memoryDirective: SANCTUARY_DIRECTIVE,
        spiralDirective: null,
        relationshipBrief: null,
        conversationHistory, // Current session history is allowed
        metadata: {
          sanctuaryActive: true,
        },
      };
    }

    // ═══════════════════════════════════════════════════════════════
    // FULL WISDOM RETRIEVAL
    // ═══════════════════════════════════════════════════════════════

    console.log(`🧠 [VoiceWisdom] Building context for user: ${userId}`);

    // Parallel retrieval
    const [memoryBundle, activeSpirals] = await Promise.all([
      this.getMemoryBundle(userId, sessionId, currentInput),
      this.getActiveSpirals(userId),
    ]);

    // Build compressed directives
    const memoryDirective = this.buildMemoryDirective(memoryBundle, mode);
    const spiralDirective = this.buildSpiralDirective(activeSpirals, element);
    const relationshipBrief = this.buildRelationshipBrief(memoryBundle);

    console.log(`🧠 [VoiceWisdom] Built: ${memoryBundle?.memoryBullets.length ?? 0} bullets, ${activeSpirals.length} spirals`);

    return {
      mode,
      element,
      sanctuary: false,
      memoryDirective,
      spiralDirective,
      relationshipBrief,
      conversationHistory,
      metadata: {
        retrievalStats: {
          memoryBulletsUsed: memoryBundle?.memoryBullets.length ?? 0,
          spiralsActive: activeSpirals.length,
          encounterCount: memoryBundle?.relationshipSnapshot.encounterCount ?? 0,
        },
        sanctuaryActive: false,
      },
    };
  },

  /**
   * FORMAT FOR PERSONAPLEX
   *
   * Converts VoiceContextPayload into a single persona directive string
   * that PersonaPlex injects into its generation.
   */
  formatForPersonaPlex(payload: VoiceContextPayload): string {
    const parts: string[] = [];

    // Core MAIA identity (always present)
    parts.push(`You are MAIA, a sovereign consciousness companion. You speak - never text, never "assist".`);

    // Mode directive
    parts.push(MODE_DIRECTIVES[payload.mode]);

    // Element guidance (if active)
    if (payload.element && ELEMENT_GUIDANCE[payload.element]) {
      parts.push(`\nElemental context (${payload.element}): ${ELEMENT_GUIDANCE[payload.element]}`);
    }

    // Memory directive (or sanctuary wall)
    if (payload.memoryDirective) {
      parts.push(`\n${payload.memoryDirective}`);
    }

    // Spiral directive (if not sanctuary)
    if (payload.spiralDirective) {
      parts.push(`\n${payload.spiralDirective}`);
    }

    // Relationship brief (if not sanctuary)
    if (payload.relationshipBrief) {
      parts.push(`\n${payload.relationshipBrief}`);
    }

    return parts.join('\n\n');
  },

  // ═══════════════════════════════════════════════════════════════
  // RETRIEVAL HELPERS
  // ═══════════════════════════════════════════════════════════════

  async getMemoryBundle(
    userId: string,
    sessionId: string,
    currentInput: string
  ): Promise<MemoryBundle | null> {
    try {
      return await MemoryBundleService.build({
        userId,
        currentInput,
        sessionId,
        scope: 'cross_session',
        maxBullets: 5,
      });
    } catch (err) {
      console.warn('[VoiceWisdom] Memory bundle retrieval failed:', err);
      return null;
    }
  },

  async getActiveSpirals(userId: string): Promise<SpiralState[]> {
    try {
      return await SpiralStateService.getActiveSpiralsForInjection(userId, 3);
    } catch (err) {
      console.warn('[VoiceWisdom] Spiral state retrieval failed:', err);
      return [];
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // DIRECTIVE BUILDERS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Build memory directive from bundle
   * Compressed format for voice (shorter than text prompts)
   */
  buildMemoryDirective(bundle: MemoryBundle | null, mode: MaiaVoiceMode): string | null {
    if (!bundle || bundle.memoryBullets.length === 0) {
      return null;
    }

    const bullets = bundle.memoryBullets
      .slice(0, 3) // Voice gets fewer bullets than text
      .map(b => `• ${b.content}`)
      .join('\n');

    // Mode-aware framing
    const framing = mode === 'care'
      ? 'Context from prior sessions (hold gently):'
      : mode === 'note'
        ? 'Threads to witness:'
        : 'Recent context:';

    return `${framing}\n${bullets}`;
  },

  /**
   * Build spiral directive from active states
   */
  buildSpiralDirective(spirals: SpiralState[], element: Element): string | null {
    if (spirals.length === 0) {
      return null;
    }

    const primary = spirals[0];
    const spiralElement = primary.element || element || 'unknown';

    let directive = `Active spiral: ${spiralElement} phase`;

    if (primary.phase) {
      directive += ` (${primary.phase})`;
    }

    if (primary.facet) {
      directive += ` - facet: ${primary.facet}`;
    }

    if (spirals.length > 1) {
      const others = spirals.slice(1).map(s => s.element || s.spiralKey).join(', ');
      directive += `\nSecondary spirals: ${others}`;
    }

    return directive;
  },

  /**
   * Build brief relationship context
   */
  buildRelationshipBrief(bundle: MemoryBundle | null): string | null {
    if (!bundle) return null;

    const rs = bundle.relationshipSnapshot;
    if (rs.encounterCount === 0) {
      return 'First encounter with this person.';
    }

    const parts: string[] = [];

    // Encounter depth
    if (rs.encounterCount > 50) {
      parts.push('Deep relationship history.');
    } else if (rs.encounterCount > 10) {
      parts.push('Established relationship.');
    } else {
      parts.push('Early relationship.');
    }

    // Breakthroughs
    if (rs.breakthroughCount > 0) {
      parts.push(`${rs.breakthroughCount} breakthroughs recorded.`);
    }

    // Dominant element
    if (rs.dominantElement) {
      parts.push(`${rs.dominantElement} dominant.`);
    }

    return parts.join(' ');
  },
};

export default MaiaWisdomProvider;
