/**
 * Epistemic Source Tagger
 *
 * Tags memory references with their epistemic source so MAIA uses
 * the correct register (tone) when referencing them.
 *
 * @see docs/canon/MAIA_EPISTEMIC_TONE_SPEC_v1.0.md
 */

import {
  EpistemicSource,
  EpistemicContext,
  buildEpistemicKernel,
} from './epistemicToneKernels';

// ============================================================================
// Types
// ============================================================================

export interface MemoryReference {
  id: string;
  type: 'capture' | 'breakthrough' | 'journal' | 'conversation_turn' | 'pattern' | 'oracle_cast';
  content: string;
  createdAt: string;
  /** For patterns only */
  confidence?: number;
  /** For patterns only */
  evidenceRefs?: string[];
}

export interface TaggedMemory {
  reference: MemoryReference;
  epistemicSource: EpistemicSource;
  context: EpistemicContext;
  kernel: string;
}

export interface PatternLedgerEntry {
  id: string;
  statement: string;
  confidence: number;
  status: 'emerging' | 'offered' | 'confirmed' | 'partial' | 'rejected' | 'retired';
  evidenceRefs: Array<{ type: string; id: string; excerpt?: string }>;
  scope: string;
}

// ============================================================================
// Source Determination
// ============================================================================

/**
 * Determine the epistemic source for a memory reference.
 *
 * CURATED: Captures, breakthroughs, journals (member-authored significance)
 * ARCHIVE: Conversation turns, oracle casts (raw history)
 * PATTERN: Pattern ledger entries (MAIA-noticed, offered for consideration)
 * PRESENT: No memory reference (default)
 */
export function determineEpistemicSource(ref: MemoryReference): EpistemicSource {
  switch (ref.type) {
    case 'capture':
    case 'breakthrough':
    case 'journal':
      return 'curated';

    case 'conversation_turn':
    case 'oracle_cast':
      return 'archive';

    case 'pattern':
      return 'pattern';

    default:
      return 'present';
  }
}

/**
 * Build full epistemic context for a memory reference.
 */
export function buildEpistemicContext(
  ref: MemoryReference,
  interpretationConsented: boolean = false
): EpistemicContext {
  const source = determineEpistemicSource(ref);

  const context: EpistemicContext = {
    source,
    interpretationConsented,
  };

  if (source === 'curated') {
    context.curatedType = ref.type as 'capture' | 'breakthrough' | 'journal';
  }

  if (source === 'pattern') {
    context.patternConfidence = ref.confidence;
    context.evidenceRefs = ref.evidenceRefs;
  }

  return context;
}

/**
 * Tag a memory reference with its epistemic source and get the appropriate kernel.
 */
export function tagMemory(
  ref: MemoryReference,
  interpretationConsented: boolean = false
): TaggedMemory {
  const source = determineEpistemicSource(ref);
  const context = buildEpistemicContext(ref, interpretationConsented);
  const kernel = buildEpistemicKernel(context);

  return {
    reference: ref,
    epistemicSource: source,
    context,
    kernel,
  };
}

/**
 * Tag multiple memory references and group by source.
 */
export function tagMemories(
  refs: MemoryReference[],
  interpretationConsented: boolean = false
): {
  curated: TaggedMemory[];
  archive: TaggedMemory[];
  pattern: TaggedMemory[];
} {
  const result = {
    curated: [] as TaggedMemory[],
    archive: [] as TaggedMemory[],
    pattern: [] as TaggedMemory[],
  };

  for (const ref of refs) {
    const tagged = tagMemory(ref, interpretationConsented);

    switch (tagged.epistemicSource) {
      case 'curated':
        result.curated.push(tagged);
        break;
      case 'archive':
        result.archive.push(tagged);
        break;
      case 'pattern':
        result.pattern.push(tagged);
        break;
    }
  }

  return result;
}

// ============================================================================
// Pattern Ledger Integration
// ============================================================================

/**
 * Convert a pattern ledger entry to a memory reference.
 */
export function patternToMemoryRef(pattern: PatternLedgerEntry): MemoryReference {
  return {
    id: pattern.id,
    type: 'pattern',
    content: pattern.statement,
    createdAt: new Date().toISOString(),
    confidence: pattern.confidence,
    evidenceRefs: pattern.evidenceRefs.map((e) => e.id),
  };
}

/**
 * Check if a pattern is appropriate to offer right now.
 *
 * Rules:
 * - Must be 'emerging' or 'partial' status (confirmed patterns become curated)
 * - Confidence >= 0.3 (below this, wait for more evidence)
 * - Not rejected (never return to rejected patterns uninvited)
 * - Haven't offered recently (avoid pestering)
 */
export function shouldOfferPattern(
  pattern: PatternLedgerEntry,
  lastOfferedAt?: Date,
  minDaysBetweenOffers: number = 7
): boolean {
  // Never offer rejected patterns
  if (pattern.status === 'rejected' || pattern.status === 'retired') {
    return false;
  }

  // Confirmed patterns should use curated register, not pattern register
  if (pattern.status === 'confirmed') {
    return false;
  }

  // Too low confidence — wait for more evidence
  if (pattern.confidence < 0.3) {
    return false;
  }

  // Check recency
  if (lastOfferedAt) {
    const daysSinceOffered = (Date.now() - lastOfferedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceOffered < minDaysBetweenOffers) {
      return false;
    }
  }

  return true;
}

// ============================================================================
// Context Addendum Builder
// ============================================================================

/**
 * Build a context addendum for the system prompt that includes
 * properly tagged memory references.
 */
export function buildMemoryContextAddendum(
  taggedMemories: {
    curated: TaggedMemory[];
    archive: TaggedMemory[];
    pattern: TaggedMemory[];
  },
  interpretationConsented: boolean = false
): string {
  const sections: string[] = [];

  // Curated section (member-authored significance)
  if (taggedMemories.curated.length > 0) {
    sections.push(`## Member-Authored Significance [CURATED]

These moments were explicitly marked as important by the member.
You are a RETURN CHANNEL — acknowledge authorship, don't interpret without consent.

${taggedMemories.curated
  .map((t) => `- [${t.reference.type}] ${t.reference.content}`)
  .join('\n')}
`);
  }

  // Archive section (raw history)
  if (taggedMemories.archive.length > 0) {
    sections.push(`## Contextual History [ARCHIVE]

Raw conversation history. Use TENTATIVE language only.
Do not treat as authoritative or decisive.

${taggedMemories.archive
  .map((t) => `- ${t.reference.content}`)
  .join('\n')}
`);
  }

  // Pattern section (MAIA-noticed)
  if (taggedMemories.pattern.length > 0) {
    sections.push(`## Emerging Patterns [PATTERN]

MAIA-noticed patterns. You may OFFER these for consideration.
The member decides if they're significant. Frame as hypothesis, not finding.

${taggedMemories.pattern
  .map((t) => {
    const conf = t.reference.confidence ?? 0.5;
    const confLabel = conf > 0.7 ? 'strong' : conf > 0.4 ? 'emerging' : 'tentative';
    return `- [${confLabel}] ${t.reference.content}`;
  })
  .join('\n')}
`);
  }

  if (sections.length === 0) {
    return '';
  }

  const consentNote = interpretationConsented
    ? '\n\nMember has consented to interpretation of these references.'
    : '\n\nAsk before interpreting or connecting these references.';

  return `
# Memory Context (Epistemically Tagged)

${sections.join('\n\n')}
${consentNote}
`;
}

// ============================================================================
// Export
// ============================================================================

export const epistemicSourceTagger = {
  determineEpistemicSource,
  buildEpistemicContext,
  tagMemory,
  tagMemories,
  patternToMemoryRef,
  shouldOfferPattern,
  buildMemoryContextAddendum,
};
