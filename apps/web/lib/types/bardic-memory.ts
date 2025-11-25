/**
 * Bardic Memory Type Definitions
 *
 * Core types for MAIA's morphic resonance memory system.
 * Implements Fire-Air temporal bridge, portal-based navigation,
 * and sacred witness pathways.
 *
 * @module lib/types/bardic-memory
 * @see docs/BARDIC-MEMORY-IMPLEMENTATION.md
 */

// ============================================================================
// ELEMENTAL STATE
// ============================================================================

/**
 * Elemental state representing the five ways consciousness engages with time.
 *
 * - Fire: Future/teleological pull (0-1)
 * - Air: Past-present/narrative continuity (0-1)
 * - Water: Timeless depth/felt truth (0-1)
 * - Earth: Present moment/incarnation (0-1)
 * - Aether: Beyond time/witnessing field (0-1)
 */
export interface ElementalState {
  /** Fire: Future pressure, what wants to become */
  fire: number;
  /** Air: Past-present continuity, narrative field */
  air: number;
  /** Water: Timeless depth, felt truth */
  water: number;
  /** Earth: Present incarnation, embodiment */
  earth: number;
  /** Aether: Witnessing field, sacred space */
  aether: number;
}

/**
 * Element names for type-safe referencing
 */
export type ElementName = 'fire' | 'air' | 'water' | 'earth' | 'aether';

/**
 * The 12 facets of developmental progression through elemental stages
 */
export type FacetName =
  | 'fire_spark' | 'fire_blaze' | 'fire_phoenix'
  | 'air_breath' | 'air_wind' | 'air_word'
  | 'water_mist' | 'water_depth' | 'water_source'
  | 'earth_seed' | 'earth_root' | 'earth_mountain'
  | 'aether_witness' | 'aether_field' | 'aether_mysterium';

// ============================================================================
// SENSORY CUES (Portals for Re-entry)
// ============================================================================

/**
 * Sensory cues that serve as portals to re-enter episodes.
 * Based on Proustian "madeleine moment" - memory bound to sensory experience.
 */
export interface SenseCues {
  /** Olfactory cue (e.g., "cedar smoke", "rain on pavement") */
  smell?: string;
  /** Auditory cue (e.g., "wind through pines", "distant traffic") */
  sound?: string;
  /** Music reference (Spotify URI, YouTube link, or description) */
  music?: string;
  /** Tactile cue (e.g., "rough bark", "cold water") */
  texture?: string;
  /** Gustatory cue (rare, but powerful when present) */
  taste?: string;
  /** Visual cue (image URL or description) */
  image?: string;
}

/**
 * Type of sensory cue for indexing
 */
export type CueType = 'place' | 'smell' | 'sound' | 'music' | 'texture' | 'taste' | 'image';

// ============================================================================
// RECALIBRATION & THRESHOLDS
// ============================================================================

/**
 * Types of recalibration thresholds - moments of significant transformation
 */
export type RecalibrationType =
  | 'liminal'        // Threshold crossing, betwixt and between
  | 'death_rebirth'  // Profound transformation, ego death
  | 'integration'    // Synthesis of fragmented parts
  | 'breakthrough';  // Sudden insight or shift

// ============================================================================
// EPISODE (The "Room" That Can Be Re-entered)
// ============================================================================

/**
 * An episode is a lived moment that can be re-entered through bardic memory.
 * Not just a record - a room with portals (place, sense cues, affect binding).
 *
 * @see docs/BARDIC-MEMORY-IMPLEMENTATION.md Section 4.1
 */
export interface Episode {
  /** Unique identifier */
  id?: string;

  /** User who lived this episode */
  userId: string;

  /** When this episode occurred */
  datetime: Date;

  // ─────────────────────────────────────────────────────────────────────
  // THE STANZA (Poetic Compression for Re-entry)
  // ─────────────────────────────────────────────────────────────────────

  /**
   * Scene stanza: poetic compression of episode (≤300 chars)
   * Used to reconstitute felt-sense during re-entry
   * Example: "The lake at dusk. Cedar smoke drifting. You named the grief that had no name."
   */
  sceneStanza?: string;

  /** Link to full conversation transcript (optional) */
  transcriptLink?: string;

  // ─────────────────────────────────────────────────────────────────────
  // PORTALS (How to Re-enter This Episode)
  // ─────────────────────────────────────────────────────────────────────

  /**
   * Place cue - primary portal for re-entry
   * Example: "lake at dusk", "kitchen threshold", "mountain ridge"
   */
  placeCue?: string;

  /**
   * Sensory cues - additional portals
   * Smell, sound, music, texture bind memory to body
   */
  senseCues?: SenseCues;

  /** People present during this episode */
  people?: string[];

  // ─────────────────────────────────────────────────────────────────────
  // AFFECT BINDING (Water Element)
  // ─────────────────────────────────────────────────────────────────────

  /**
   * Affect valence: -1 (very negative) to +1 (very positive)
   * Measures emotional tone on pleasant-unpleasant axis
   */
  affectValence?: number;

  /**
   * Affect arousal: 0 (calm) to 1 (intense)
   * Measures activation level - used for titration/safety
   */
  affectArousal?: number;

  /** Keywords describing emotional quality (e.g., ["grief", "recognition", "relief"]) */
  affectKeywords?: string[];

  // ─────────────────────────────────────────────────────────────────────
  // ELEMENTAL STATE
  // ─────────────────────────────────────────────────────────────────────

  /** Five-element state snapshot during this episode */
  elementalState?: ElementalState;

  /** Which element was most active (for pattern matching) */
  dominantElement?: ElementName;

  /** Developmental facet user was in (optional, for tracking growth) */
  currentFacet?: FacetName;

  // ─────────────────────────────────────────────────────────────────────
  // THRESHOLD MARKERS
  // ─────────────────────────────────────────────────────────────────────

  /** True if this was a recalibration threshold */
  isRecalibration?: boolean;

  /** Type of recalibration if applicable */
  recalibrationType?: RecalibrationType;

  // ─────────────────────────────────────────────────────────────────────
  // SACRED BOUNDARY
  // ─────────────────────────────────────────────────────────────────────

  /**
   * Sacred flag: if true, this episode is WITNESS ONLY
   * - No embeddings created
   * - No similarity matching
   * - No pattern analysis
   * - Pure presence without reduction
   */
  sacredFlag?: boolean;

  // ─────────────────────────────────────────────────────────────────────
  // FIELD METADATA
  // ─────────────────────────────────────────────────────────────────────

  /** Depth of THE BETWEEN field (0-1) during this episode */
  fieldDepth?: number;

  /** Session identifier for grouping episodes */
  sessionId?: string;

  /** Timestamps */
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// EPISODE VECTORS (Morphic Resonance Matching)
// ============================================================================

/**
 * Vector embedding for episode similarity matching via morphic resonance.
 * Not just semantic similarity - includes affect, place, elemental resonance.
 */
export interface EpisodeVector {
  /** Reference to parent episode */
  episodeId: string;

  /**
   * Embedding vector (typically 1536 dimensions for OpenAI ada-002)
   * Used for cosine similarity matching
   */
  embedding: number[];

  /**
   * SimHash for fast approximate matching
   * Allows drift-tolerant pattern recognition
   */
  similarityHash?: string;

  /**
   * Resonance strength (decays over time)
   * Allows recent episodes to have stronger pull
   */
  resonanceStrength?: number;

  /** Rate of resonance decay */
  decayRate?: number;

  /** Custom morphic signature (metadata for pattern matching) */
  morphicSignature?: Record<string, any>;

  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// EPISODE LINKS (Narrative Threads)
// ============================================================================

/**
 * Relationship types between episodes - how they connect in narrative time
 */
export type RelationType =
  | 'repeats'    // Same pattern recurring
  | 'contrasts'  // Opposite or complementary pattern
  | 'fulfills'   // Later episode completes earlier one
  | 'echoes'     // Similar but different context
  | 'resolves'   // Closes an open thread
  | 'deepens'    // Takes pattern to new depth
  | 'diverges';  // Intentional departure from pattern

/**
 * Link between episodes creating narrative continuity.
 * This is Air function - maintaining story threading across time.
 */
export interface EpisodeLink {
  id?: string;

  /** Source episode */
  episodeA: string;

  /** Destination episode */
  episodeB: string;

  /** How these episodes relate */
  relationType: RelationType;

  /** Strength of relationship (0-1) */
  relationStrength?: number;

  /** Optional explanation of the link */
  notes?: string;

  createdAt?: Date;
}

// ============================================================================
// CUES (Sensory Portals Database)
// ============================================================================

/**
 * A registered cue that can be used to access multiple episodes.
 * Cues are portals - "MAIA, open the lake threshold room"
 */
export interface Cue {
  id?: string;

  /** User who created this cue */
  userId: string;

  /** Type of sensory cue */
  cueType: CueType;

  /** The actual cue value (e.g., "cedar smoke", "lake at dusk") */
  cueValue: string;

  /** Optional description/context */
  description?: string;

  createdAt?: Date;
}

/**
 * Many-to-many relationship: episodes can have multiple cues,
 * cues can access multiple episodes
 */
export interface EpisodeCue {
  episodeId: string;
  cueId: string;

  /** How strongly this cue evokes this episode (0-1) */
  strength?: number;
}

// ============================================================================
// TELOI (Future Pressures - Fire Element)
// ============================================================================

/**
 * A telos (plural: teloi) is a future pressure, a teleological attractor.
 * Not a goal or intention - but something that "wants to become" through the user.
 *
 * This is Fire cognition: sensing what pulls from the future.
 */
export interface Telos {
  id?: string;
  userId: string;

  /**
   * Concise phrase naming the telos
   * Example: "Restore voice in relationships"
   */
  phrase: string;

  /** Episode where this telos first emerged (optional) */
  originEpisodeId?: string;

  /** Current strength of this telos (0-1) */
  strength?: number;

  /** Timeframe for crystallization (in days, typically 48 or less) */
  horizonDays?: number;

  /** Micro-signals that indicate convergence toward this telos */
  signals?: any[];

  /** Whether this telos is currently active */
  isActive?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Log entry tracking how an episode aligns with a telos.
 * Delta: -1 (diverging) to +1 (crystallizing)
 */
export interface TelosAlignmentLog {
  id?: string;
  episodeId: string;
  telosId: string;

  /**
   * Alignment delta:
   * -1 = diverging from telos
   * 0 = neutral
   * +1 = crystallizing toward telos
   */
  delta: number;

  /** Explanation of alignment assessment */
  notes?: string;

  createdAt?: Date;
}

// ============================================================================
// MICROACTS (Virtue Accreting - Earth Element)
// ============================================================================

/**
 * A microact is a small repeated action that accretes into virtue over time.
 * This is Earth function: embodiment, practice, habit formation.
 *
 * Example: "Set clear boundary" repeated 9 times becomes virtue of "Sovereignty"
 */
export interface Microact {
  id?: string;
  userId: string;

  /**
   * Description of the action
   * Example: "Set clear boundary", "Named difficult feeling"
   */
  actionPhrase: string;

  /**
   * Virtue category this builds toward
   * Example: "sovereignty", "courage", "clarity"
   */
  virtueCategory?: string;

  /** Total count of times this action has been performed */
  totalCount?: number;

  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Individual occurrence of a microact
 */
export interface MicroactLog {
  id?: string;
  microactId: string;

  /** Episode during which this microact occurred (optional) */
  episodeId?: string;

  /** When this occurred */
  occurredAt?: Date;

  /** Brief context note */
  contextNote?: string;

  createdAt?: Date;
}

// ============================================================================
// FIELD EDGES (Topological Memory for Drift Support)
// ============================================================================

/**
 * Edge types for topological memory structure.
 * Supports drift-tolerant continuity without identity fixation.
 */
export type EdgeType =
  | 'before_after'      // Temporal sequence
  | 'center_periphery'  // Importance gradient
  | 'inside_outside';   // Boundary crossing

/**
 * Field edge representing topological relationship between episodes.
 * Allows "memory without fixation" - continuity that allows drift.
 */
export interface FieldEdge {
  id?: string;
  userId: string;

  /** Type of topological relationship */
  edgeType: EdgeType;

  /** Array of episode IDs in topological order */
  episodes: string[];

  /** Description of this edge */
  description?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// RETRIEVAL PROTOCOL TYPES (Recognize → Re-enter → Recall)
// ============================================================================

/**
 * Input for Recognition stage - detecting morphic resonance
 */
export interface RecognitionInput {
  userId: string;

  /** Recent message/text to match against */
  recentText: string;

  /** Current affect state */
  affect?: {
    valence: number;  // -1 to +1
    arousal: number;  // 0 to 1
  };

  /** Soft cues to search for (e.g., ["lake", "dusk", "cedar"]) */
  softCues?: string[];
}

/**
 * Signal that recognition has detected resonance
 */
export interface RecognitionSignal {
  /** True if morphic resonance detected */
  resonanceDetected: boolean;

  /** Matched episodes with similarity scores */
  matchedEpisodes: Array<{
    episodeId: string;
    similarity: number;
    dominantElement: ElementName;
    placeCue?: string;
    sceneStanza?: string;
  }>;

  /** Dominant pattern detected across matches */
  dominantPattern?: string;

  /** Affect resonance strength (0-1) */
  affectResonance?: number;
}

/**
 * Experience of re-entering an episode (Stage 2)
 */
export interface ReentryExperience {
  /** The episode being re-entered */
  episode: Episode;

  /** Poetic stanza presentation */
  stanzaPresentation: string;

  /** Sensory context to reconstitute felt-sense */
  sensoryContext?: SenseCues;

  /** Warning if affect intensity is high */
  affectWarning?: string;

  /** Whether permission was granted to re-enter */
  permissionGranted: boolean;

  /** Related episodes that might be relevant */
  relatedEpisodes?: string[];
}

/**
 * Depth of recall requested
 */
export type RecallDepth = 'light' | 'medium' | 'deep';

/**
 * Full episode details (Stage 3)
 */
export interface EpisodeDetails {
  episode: Episode;

  /** Full transcript if available */
  fullTranscript?: string;

  /** Linked episodes (narrative threads) */
  linkedEpisodes: EpisodeLink[];

  /** Active teloi related to this episode */
  activeTeloi?: Telos[];

  /** Microacts observed during this episode */
  microactsObserved?: Microact[];

  /** Field position (topological relationships) */
  fieldPosition?: FieldEdge[];
}

// ============================================================================
// UX MICROFLOW TYPES
// ============================================================================

/**
 * Parameters for Drawer query ("Open the lake threshold room")
 */
export interface DrawerParams {
  userId: string;

  /** Natural language query */
  query?: string;

  /** Specific place cue */
  placeCue?: string;

  /** Specific sense cues */
  senseCue?: Partial<SenseCues>;

  /** Optional date range filter */
  dateRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * Result of drawer query
 */
export interface DrawerExperience {
  /** Episodes matching the drawer query */
  matchedEpisodes: Array<{
    episode: Episode;
    matchReason: string;
    resonanceScore: number;
  }>;

  /** Suggested portals the user might want to explore */
  suggestedPortals?: Array<{
    cue: Cue;
    episodeCount: number;
  }>;
}

/**
 * Parameters for Madeleine trigger ("Play cedar-dusk scene")
 */
export interface MadeleineParams {
  userId: string;
  cueType: CueType;
  cueValue: string;

  /** Whether to include music/ambient sound */
  withMusic?: boolean;
}

/**
 * Result of Madeleine trigger
 */
export interface MadeleineExperience {
  /** Episodes triggered by this sensory cue */
  triggeredEpisodes: Episode[];

  /** Sensory reconstruction */
  sensoryReconstruction: SenseCues;

  /** Emotional tone across triggered episodes */
  emotionalTone?: string;

  /** Music playlist if requested */
  playlist?: string;
}

/**
 * Parameters for marking a moment sacred
 */
export interface SacredMomentParams {
  userId: string;

  /** Optional scene stanza for witness record */
  sceneStanza?: string;

  /** Note about what's being witnessed */
  witnessNote?: string;
}

/**
 * Entry in virtue ledger showing habit accreting into virtue
 */
export interface VirtueLedgerEntry {
  microact: Microact;

  /** Recent occurrences (last 30 days) */
  recentOccurrences: MicroactLog[];

  /** Trend: building, stable, or fading */
  trend: 'building' | 'stable' | 'fading';

  /** Name of virtue this is building toward */
  virtueName: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Result of quota check (from usage tracking)
 */
export interface QuotaCheckResult {
  allowed: boolean;
  reason?: string;
  remainingMessages?: number;
  remainingTokens?: number;
}

/**
 * Safety/consent gate result
 */
export interface ConsentGateResult {
  granted: boolean;
  reason?: string;
  affectWarning?: string;
}
