/**
 * ChristianFaithContext
 *
 * Contextual binding for Christian spiritual framework integration.
 * Used when MAIA operates within Christian theological/liturgical contexts.
 *
 * Part of broader SpiritualProfile system supporting multi-tradition awareness.
 *
 * @phase Phase 4.2B Step 5 - Interface Expansion
 * @status Minimal stub - comprehensive fields pending Phase 4.2C
 */

/**
 * Christian denominational traditions
 */
export type ChristianDenomination =
  | 'Catholic'
  | 'Orthodox'
  | 'Protestant'
  | 'Anglican'
  | 'Baptist'
  | 'Methodist'
  | 'Lutheran'
  | 'Presbyterian'
  | 'Pentecostal'
  | 'Evangelical'
  | 'Non-denominational'
  | string; // Allow custom denominations

/**
 * Liturgical seasons in Christian calendar
 */
export type LiturgicalSeason =
  | 'Advent'
  | 'Christmas'
  | 'Epiphany'
  | 'Lent'
  | 'Holy Week'
  | 'Easter'
  | 'Pentecost'
  | 'Ordinary Time'
  | string;

/**
 * Main ChristianFaithContext interface
 */
export interface ChristianFaithContext {
  /** Unique identifier for this faith context */
  id: string;

  /**
   * Christian denomination/tradition
   * Used to tailor theological language and pastoral approach
   */
  denomination: ChristianDenomination;

  /**
   * Liturgical practices and observances
   * e.g., ['Daily Office', 'Eucharist', 'Contemplative Prayer']
   */
  practices?: string[];

  /**
   * Theological framework and doctrinal emphasis
   * e.g., 'Reformed', 'Thomistic', 'Charismatic', etc.
   */
  theological_framework?: string;

  /**
   * Preferred scriptural texts and translations
   * e.g., ['ESV', 'NRSV', 'KJV']
   */
  scriptural_focus?: string[];

  /**
   * Current liturgical season context
   * Informs seasonal spiritual direction
   */
  liturgical_season?: LiturgicalSeason;

  /**
   * Pastoral care preferences
   * Influences tone and approach in spiritual guidance
   */
  pastoral_care_preferences?: {
    prefer_directive?: boolean;
    prefer_contemplative?: boolean;
    prefer_scriptural?: boolean;
    prefer_sacramental?: boolean;
  };

  /**
   * Community connection indicators
   */
  community_context?: {
    has_pastor_connection?: boolean;
    has_spiritual_director?: boolean;
    has_christian_community?: boolean;
  };

  /**
   * Optional metadata for tradition-specific customization
   */
  metadata?: Record<string, any>;

  // TODO(phase4.2c): Add comprehensive fields:
  // - sacramental_emphasis: string[]
  // - prayer_traditions: ('Ignatian' | 'Lectio Divina' | 'Centering Prayer' | ...)[]
  // - ecclesiology: string (view of church structure)
  // - charismatic_openness: number (0-1 scale)
  // - mystical_tradition_affinity: number (0-1 scale)
  // - social_justice_emphasis: number (0-1 scale)
}
