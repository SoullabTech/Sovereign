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

  // === Sacramental & Liturgical Dimensions (Phase 4.2C expansion) ===

  /**
   * Sacramental emphasis and observances
   * Which sacraments are central to spiritual practice
   */
  sacramental_emphasis?: ('Baptism' | 'Eucharist' | 'Reconciliation' | 'Confirmation' | 'Marriage' | 'Holy Orders' | 'Anointing of the Sick')[];

  /**
   * Eucharistic frequency
   * How often communion/eucharist is received
   */
  eucharistic_frequency?: 'daily' | 'weekly' | 'monthly' | 'seasonally' | 'rarely';

  /**
   * Sacramental theology
   * Understanding of how sacraments function
   */
  sacramental_theology?: 'symbolic' | 'real presence' | 'memorial' | 'transformative';

  // === Prayer & Contemplative Traditions ===

  /**
   * Active prayer traditions and modalities
   * Specific spiritual practices engaged regularly
   */
  prayer_traditions?: ('Ignatian' | 'Lectio Divina' | 'Centering Prayer' | 'Contemplative Prayer' | 'Liturgy of the Hours' | 'Prayer of Examen' | 'Jesus Prayer' | 'Rosary' | 'Intercessory Prayer')[];

  /**
   * Contemplative practice frequency
   * Regularity of silent/contemplative prayer
   */
  contemplative_frequency?: 'daily' | 'weekly' | 'occasional' | 'rare';

  /**
   * Charismatic openness (0-1 scale)
   * Comfort with charismatic expressions (tongues, prophecy, healing)
   */
  charismatic_openness?: number;

  /**
   * Mystical tradition affinity (0-1 scale)
   * Resonance with mystical/contemplative Christianity
   */
  mystical_tradition_affinity?: number;

  /**
   * Prayer language preference
   * Preferred mode of addressing the divine
   */
  prayer_language?: 'formal' | 'informal' | 'liturgical' | 'spontaneous' | 'mixed';

  // === Theological & Doctrinal Framework ===

  /**
   * Ecclesiology
   * View of church structure and authority
   */
  ecclesiology?: 'episcopal' | 'presbyterian' | 'congregational' | 'ecumenical' | 'non-hierarchical';

  /**
   * Soteriology emphasis
   * Understanding of salvation
   */
  soteriology?: 'faith alone' | 'faith and works' | 'universal reconciliation' | 'process oriented';

  /**
   * Pneumatology emphasis
   * Theology of Holy Spirit
   */
  pneumatology?: 'trinitarian' | 'charismatic' | 'subtle' | 'symbolic';

  /**
   * Christology emphasis
   * Understanding of Christ's nature and role
   */
  christology?: 'high' | 'low' | 'cosmic' | 'liberationist';

  /**
   * Eschatology perspective
   * View of end times and ultimate destiny
   */
  eschatology?: 'premillennial' | 'postmillennial' | 'amillennial' | 'realized' | 'process';

  /**
   * Biblical hermeneutics approach
   * How scripture is interpreted
   */
  biblical_hermeneutics?: 'literal' | 'historical-critical' | 'allegorical' | 'narrative' | 'liberation' | 'contemplative';

  /**
   * Theological influences
   * Key theologians, saints, or traditions that shape perspective
   */
  theological_influences?: string[];

  // === Spiritual Formation & Growth ===

  /**
   * Faith journey stage
   * Current phase of spiritual development
   */
  faith_journey_stage?: 'seeker' | 'new believer' | 'growing' | 'maturing' | 'dark night' | 'illuminative' | 'unitive';

  /**
   * Spiritual formation priorities
   * Primary focus areas for growth
   */
  spiritual_formation_priorities?: ('prayer' | 'scripture' | 'community' | 'service' | 'contemplation' | 'justice' | 'sacrament')[];

  /**
   * Desert/wilderness seasons
   * Current experience of spiritual dryness or challenge
   */
  in_desert_season?: boolean;

  /**
   * Spiritual direction engagement
   * Active work with a spiritual director
   */
  has_spiritual_director?: boolean;

  /**
   * Retreat practice
   * Engagement with extended silent/guided retreats
   */
  retreat_frequency?: 'annual' | 'semi-annual' | 'occasional' | 'rare' | 'never';

  // === Community & Ecclesial Life ===

  /**
   * Church attendance pattern
   * Regularity of worship service participation
   */
  church_attendance?: 'multiple weekly' | 'weekly' | 'bi-weekly' | 'monthly' | 'occasional' | 'rare';

  /**
   * Small group involvement
   * Participation in Bible study, prayer group, etc.
   */
  small_group_involvement?: boolean;

  /**
   * Ministry leadership roles
   * Active service in church ministries
   */
  ministry_roles?: string[];

  /**
   * Ecumenical openness (0-1 scale)
   * Comfort with inter-denominational engagement
   */
  ecumenical_openness?: number;

  /**
   * Interfaith engagement (0-1 scale)
   * Openness to dialogue with other faith traditions
   */
  interfaith_openness?: number;

  // === Justice & Transformation ===

  /**
   * Social justice emphasis (0-1 scale)
   * Priority given to justice, advocacy, and liberation themes
   */
  social_justice_emphasis?: number;

  /**
   * Creation care priority (0-1 scale)
   * Emphasis on environmental stewardship
   */
  creation_care_priority?: number;

  /**
   * Liberation theology affinity (0-1 scale)
   * Resonance with liberation/contextual theologies
   */
  liberation_theology_affinity?: number;

  /**
   * Active justice ministries
   * Specific areas of justice engagement
   */
  justice_ministries?: ('poverty' | 'racism' | 'immigration' | 'environment' | 'peacemaking' | 'LGBTQ+ inclusion')[];

  // === Pastoral Care & Spiritual Needs ===

  /**
   * Current pastoral needs
   * Areas requiring spiritual support or guidance
   */
  pastoral_needs?: ('grief' | 'discernment' | 'healing' | 'reconciliation' | 'vocational clarity' | 'spiritual dryness' | 'doubt/questions')[];

  /**
   * Spiritual gifts identified
   * Recognized charisms or gifts
   */
  spiritual_gifts?: string[];

  /**
   * Healing prayer openness (0-1 scale)
   * Comfort with prayers for physical/emotional healing
   */
  healing_prayer_openness?: number;

  /**
   * Deliverance ministry openness (0-1 scale)
   * Comfort with spiritual warfare/deliverance themes
   */
  deliverance_openness?: number;

  // === Scripture Engagement ===

  /**
   * Scripture reading frequency
   * Regularity of Bible engagement
   */
  scripture_frequency?: 'daily' | 'several times weekly' | 'weekly' | 'occasional' | 'rare';

  /**
   * Preferred Bible translations
   * Versions used for study and devotion
   */
  bible_translations?: ('ESV' | 'NRSV' | 'NIV' | 'KJV' | 'NASB' | 'The Message' | 'CEB' | 'CSB')[];

  /**
   * Lectionary following
   * Use of liturgical lectionary for scripture reading
   */
  follows_lectionary?: boolean;

  /**
   * Favorite biblical books or themes
   * Scriptures that resonate most deeply
   */
  favorite_scriptures?: string[];

  // === Cultural & Historical Context ===

  /**
   * Primary worship tradition style
   * Liturgical aesthetic and cultural expression
   */
  worship_style?: 'high liturgical' | 'contemporary' | 'traditional' | 'blended' | 'emerging' | 'contemplative';

  /**
   * Preferred worship postures
   * Physical expressions during worship
   */
  worship_postures?: ('standing' | 'kneeling' | 'sitting' | 'prostration' | 'hands raised' | 'silence')[];

  /**
   * Music tradition preferences
   * Styles of sacred music that resonate
   */
  music_preferences?: ('chant' | 'hymns' | 'contemporary' | 'gospel' | 'Taizé' | 'classical' | 'folk')[];

  /**
   * Liturgical year observance
   * Engagement with church calendar
   */
  liturgical_year_observance?: 'full' | 'major seasons only' | 'minimal' | 'none';

  // === Mystical & Experiential Dimensions ===

  /**
   * Mystical experience frequency
   * Regularity of profound spiritual encounters
   */
  mystical_experience_frequency?: 'frequent' | 'occasional' | 'rare' | 'none reported';

  /**
   * Apophatic theology affinity (0-1 scale)
   * Resonance with "via negativa" / unknowing
   */
  apophatic_affinity?: number;

  /**
   * Kataphatic theology affinity (0-1 scale)
   * Resonance with "via positiva" / affirming imagery
   */
  kataphatic_affinity?: number;

  /**
   * Visions and revelations
   * Openness to direct divine communication
   */
  visions_openness?: number;

  /**
   * Monastic spirituality affinity (0-1 scale)
   * Resonance with monastic rhythm and practices
   */
  monastic_affinity?: number;
}
