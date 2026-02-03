/**
 * Archetypal Voice Dictionary
 *
 * Planet × Sign essences for Spiralogic integration
 * Each entry is a distilled metaphor - one verse in the cosmic poem
 *
 * Structure: [Planet][Sign] → archetypal essence (1-2 sentences, mythic + psychological)
 */

// Planet Archetypes - Core Functions
export const PLANET_ARCHETYPES = {
  Sun: {
    title: 'The Core / Hero',
    essence: 'Conscious will, identity, vitality',
    voice: 'Your solar consciousness illuminates who you are becoming.',
    nature: 'The Sun represents the organizing center of the psyche—the conscious will that chooses and creates. It\'s the part that says "I am" and means it. Where the Sun shines in your chart shows where you\'re learning to become fully yourself, to radiate rather than reflect.',
    inRelationship: 'The Sun seeks recognition and wants to be seen for what it truly is. In relationship, it asks: can I be myself here? Does this connection support my becoming? Solar energy gives warmth but can also overshadow.',
    whenConscious: 'Clear sense of purpose, authentic self-expression, creative vitality, the ability to lead without dominating',
    whenUnconscious: 'Ego inflation, need for constant validation, identity defined by external achievement, dimming yourself to avoid threatening others',
  },
  Moon: {
    title: 'The Soul / Mystic',
    essence: 'Emotion, memory, instinct',
    voice: 'Your lunar depths hold the waters of feeling and ancestral knowing.',
    nature: 'The Moon represents the feeling body—not just emotions, but the entire realm of instinct, memory, and unconscious response. It\'s what you need to feel safe, how you nurture and want to be nurtured. The Moon holds your past and your roots.',
    inRelationship: 'The Moon seeks emotional safety and belonging. In relationship, it asks: can I be vulnerable here? Will you hold what I feel? Lunar energy connects through feeling but can also cling or withdraw.',
    whenConscious: 'Emotional intelligence, the ability to nurture without smothering, secure attachment, access to intuition and ancestral wisdom',
    whenUnconscious: 'Moodiness, emotional manipulation, inability to self-soothe, patterns inherited from family without examination',
  },
  Mercury: {
    title: 'The Messenger / Magician',
    essence: 'Thought, translation, perception',
    voice: 'Your mercurial mind translates world into word, chaos into pattern.',
    nature: 'Mercury represents the mind\'s ability to perceive, process, and communicate. It\'s how you think, learn, speak, and make connections between things. Mercury is the bridge between inner and outer, translating experience into language.',
    inRelationship: 'Mercury seeks understanding and exchange. In relationship, it asks: can we think together? Will you engage with my ideas? Mercurial energy connects through conversation but can also intellectualize feeling or talk instead of listen.',
    whenConscious: 'Clear thinking, effective communication, curiosity, the ability to hold multiple perspectives, learning for its own sake',
    whenUnconscious: 'Overthinking, anxiety, saying what you don\'t mean, mental noise that drowns out other ways of knowing',
  },
  Venus: {
    title: 'The Lover / Artist',
    essence: 'Attraction, harmony, value',
    voice: 'Your venusian heart knows what beauty means, what love costs.',
    nature: 'Venus represents what you find beautiful, valuable, and worth loving. It\'s your aesthetic sense, your relational style, your capacity for pleasure and receptivity. Venus draws things toward you rather than reaching out to grasp.',
    inRelationship: 'Venus seeks harmony and appreciation. In relationship, it asks: do you value me? Can we create beauty together? Venusian energy attracts and softens but can also avoid conflict or lose itself in pleasing.',
    whenConscious: 'Genuine appreciation, ability to receive, creating beauty and harmony, knowing what you value and choosing accordingly',
    whenUnconscious: 'People-pleasing, vanity, measuring worth by desirability, staying in unhealthy situations because leaving feels ugly',
  },
  Mars: {
    title: 'The Warrior / Initiator',
    essence: 'Drive, courage, boundary',
    voice: 'Your martial fire cuts through hesitation with blade and boundary.',
    nature: 'Mars represents the capacity to act, assert, and pursue. It\'s your drive, your anger, your sexual energy, your ability to say no and mean it. Mars cuts through ambiguity with decisive action—it wants what it wants and goes after it.',
    inRelationship: 'Mars seeks respect and independence. In relationship, it asks: is there room for my desire? Can I be strong here? Martial energy protects and pursues but can also dominate or create conflict unnecessarily.',
    whenConscious: 'Healthy assertion, courage to act, clear boundaries, energy directed toward what matters, sexuality as vitality',
    whenUnconscious: 'Aggression, impatience, picking fights, suppressed anger that leaks sideways, confusing domination with strength',
  },
  Jupiter: {
    title: 'The Sage / Explorer',
    essence: 'Growth, faith, expansion',
    voice: 'Your jupiterian vision seeks horizons where meaning multiplies.',
    nature: 'Jupiter represents the drive to expand, explore, and find meaning. It\'s your faith—not necessarily religious, but your sense that life has purpose, that growth is possible, that the horizon is worth reaching. Jupiter seeks the bigger picture.',
    inRelationship: 'Jupiter seeks growth and shared meaning. In relationship, it asks: are we going somewhere together? Does this expand my world? Jupiterian energy inspires and elevates but can also preach or promise more than it delivers.',
    whenConscious: 'Genuine optimism, philosophical depth, generosity of spirit, the ability to find meaning in difficulty, teaching from wisdom',
    whenUnconscious: 'Excess, over-promising, spiritual bypassing, using philosophy to avoid feeling, assuming your truth is universal',
  },
  Saturn: {
    title: 'The Architect / Mentor',
    essence: 'Structure, responsibility, mastery',
    voice: 'Your saturnian craft builds temples from limitation and time.',
    nature: 'Saturn represents structure, limitation, and time. It\'s the taskmaster that demands you earn your mastery, the boundary that teaches through constraint. Saturn is not punishment but training—it shows where serious work is required.',
    inRelationship: 'Saturn seeks reliability and respect. In relationship, it asks: can I count on you? Are you serious? Saturnian energy commits and endures but can also withhold, control, or turn intimacy into obligation.',
    whenConscious: 'Discipline that serves growth, healthy boundaries, responsibility taken willingly, authority earned through mastery, aging with grace',
    whenUnconscious: 'Rigidity, fear of change, using rules to avoid risk, authority wielded through fear, chronic self-criticism',
  },
  Uranus: {
    title: 'The Liberator / Rebel',
    essence: 'Innovation, disruption, freedom',
    voice: 'Your uranian lightning shatters patterns that cage the possible.',
    nature: 'Uranus represents the drive to break free, innovate, and awaken. It\'s the part that can\'t stand limitation, that sees beyond convention, that would rather be authentic than acceptable. Uranus disrupts what has become too rigid to grow.',
    inRelationship: 'Uranus seeks freedom and uniqueness. In relationship, it asks: is there room for who I\'m becoming? Can we evolve together? Uranian energy liberates and innovates but can also detach or prioritize freedom over connection.',
    whenConscious: 'Authentic individuality, innovation in service of something real, breaking patterns that need breaking, genius used for collective good',
    whenUnconscious: 'Rebellion for its own sake, emotional detachment disguised as freedom, disruption without building anything, alienation from ordinary life',
  },
  Neptune: {
    title: 'The Dreamer / Mystic',
    essence: 'Imagination, transcendence, dissolution',
    voice: 'Your neptunian mist dissolves borders between self and soul.',
    nature: 'Neptune represents the longing to transcend ordinary reality—to merge with something greater, to dream, to escape solid form. It\'s compassion without boundaries, imagination without edges, the part of you that knows everything is connected.',
    inRelationship: 'Neptune seeks transcendence and unconditional love. In relationship, it asks: can we dissolve the boundary between us? Can you see my soul? Neptunian energy idealizes and merges but can also deceive or disappear.',
    whenConscious: 'Genuine compassion, artistic and spiritual vision, the ability to sense what\'s invisible, love that doesn\'t need edges',
    whenUnconscious: 'Escapism, addiction, deception (of self or others), martyrdom, losing yourself in fantasy rather than building in reality',
  },
  Pluto: {
    title: 'The Alchemist / Shadow',
    essence: 'Transformation, death-rebirth, power',
    voice: 'Your plutonian depths compost death into rebirth, shadow into gold.',
    nature: 'Pluto represents the power of transformation—the death that makes rebirth possible, the shadow that contains gold, the intensity that burns away what\'s no longer true. Pluto doesn\'t do surface. It takes you to the underworld and asks what survives.',
    inRelationship: 'Pluto seeks depth and transformation. In relationship, it asks: will you go with me into the dark? Can we be changed by this? Plutonian energy transforms and empowers but can also control, obsess, or destroy.',
    whenConscious: 'Transformational power used wisely, facing shadow without being possessed by it, rebirth after necessary endings, empowering others',
    whenUnconscious: 'Power plays, manipulation, destructive intensity, refusing to let go, projecting shadow onto others',
  },
  Chiron: {
    title: 'The Wounded Healer',
    essence: 'Wound, healing, teaching through suffering',
    voice: 'Your chiron scar is also a doorway—where you hurt most, you can heal most.',
    nature: 'Chiron represents the wound that doesn\'t fully heal—not as punishment, but as initiation. It\'s the pain that becomes wisdom, the injury that becomes a teaching. Where Chiron sits in your chart shows where you\'ve been broken in ways that open you to helping others with the same break.',
    inRelationship: 'Chiron seeks acceptance of imperfection. In relationship, it asks: can you love what\'s broken in me? Can we be wounded together? Chironic energy heals through presence and acceptance but can also get stuck in identifying as wounded.',
    whenConscious: 'Healing presence for others, wisdom earned through suffering, teaching from scar rather than theory, integration of the wound',
    whenUnconscious: 'Identifying with being wounded, helping others to avoid your own pain, reopening wounds compulsively, spiritual bypassing',
  },
  NorthNode: {
    title: 'The Soul\'s Direction',
    essence: 'Growth edge, destiny, unfamiliar mastery',
    voice: 'Your north node points toward what feels strange but calls you forward.',
    nature: 'The North Node represents the direction of growth—not what comes naturally, but what you\'re learning to become. It\'s the unfamiliar territory that your soul chose for this life. Moving toward the North Node often feels uncomfortable precisely because it\'s new.',
    inRelationship: 'The North Node seeks growth and evolution. In relationship, it asks: does this connection help me become? Am I stretching toward new capacities? North Node energy pulls forward but can also create anxiety about "getting it right."',
    whenConscious: 'Intentional growth, courage to move toward what\'s unfamiliar, developing new capacities, fulfilling potential',
    whenUnconscious: 'Avoiding growth because it\'s uncomfortable, staying stuck in South Node patterns, treating destiny as obligation rather than invitation',
  },
  SouthNode: {
    title: 'The Familiar Ground',
    essence: 'Past mastery, comfort zone, karmic patterns',
    voice: 'Your south node holds what you\'ve already mastered—and what you\'re ready to release.',
    nature: 'The South Node represents what comes naturally—skills, patterns, and ways of being that feel like home. Some interpret this as past life material; regardless, it\'s the default setting. The work isn\'t to abandon it but to stop using it as a hiding place.',
    inRelationship: 'The South Node seeks the familiar and safe. In relationship, it asks: can I be comfortable here? Will you let me be who I\'ve always been? South Node energy offers gifts but can also keep you from growing.',
    whenConscious: 'Using natural gifts without getting stuck in them, releasing patterns that once served but no longer do, gratitude for what you\'ve already learned',
    whenUnconscious: 'Defaulting to familiar patterns when challenged, using past mastery to avoid present growth, staying comfortable at the cost of becoming',
  },
  Lilith: {
    title: 'The Wild Feminine / Exile',
    essence: 'Repressed power, wild nature, refusal to submit',
    voice: 'Your Lilith carries what you were told to bury—and will not stay buried.',
    nature: 'Lilith represents the part of nature that refuses to be tamed, controlled, or made acceptable. Often connected to repressed feminine power, sexuality, and rage, Lilith is what got exiled because it was too wild, too inconvenient, too true. She returns.',
    inRelationship: 'Lilith seeks freedom and raw truth. In relationship, it asks: is there room for my wildness? Will you accept what I\'m not willing to hide? Lilith energy liberates and empowers but can also sabotage or create crisis to escape constraint.',
    whenConscious: 'Owning power that was suppressed, integrating wildness without destroying, fierce authenticity, reclaiming exile parts',
    whenUnconscious: 'Acting out rather than owning, sabotaging to escape, using sexuality or rage as weapons, perpetuating your own exile',
  },
} as const;

// Sign Tones - How the archetype speaks
export const SIGN_VOICES = {
  // FIRE - Vision, activation, willpower
  Aries: {
    element: 'fire' as const,
    modality: 'cardinal' as const,
    tone: 'Pioneer · Raw initiation',
    voice: 'Breaks ground with instinctive courage. The challenge—speed without recklessness.',
  },
  Leo: {
    element: 'fire' as const,
    modality: 'fixed' as const,
    tone: 'Sovereign · Creative radiance',
    voice: 'Shines through authentic expression. The challenge—generosity without ego.',
  },
  Sagittarius: {
    element: 'fire' as const,
    modality: 'mutable' as const,
    tone: 'Philosopher · Expansive wisdom',
    voice: 'Seeks meaning through exploration. The challenge—truth without dogma.',
  },

  // WATER - Emotion, healing, flow
  Cancer: {
    element: 'water' as const,
    modality: 'cardinal' as const,
    tone: 'Nurturer · Protective depths',
    voice: 'Holds space for tender growth. The challenge—care without smothering.',
  },
  Scorpio: {
    element: 'water' as const,
    modality: 'fixed' as const,
    tone: 'Alchemist · Penetrating intensity',
    voice: 'Sees beneath surface to hidden truth. The challenge—depth without obsession.',
  },
  Pisces: {
    element: 'water' as const,
    modality: 'mutable' as const,
    tone: 'Mystic · Boundless compassion',
    voice: 'Dissolves into universal feeling. The challenge—empathy without losing self.',
  },

  // EARTH - Structure, manifestation, purpose
  Capricorn: {
    element: 'earth' as const,
    modality: 'cardinal' as const,
    tone: 'Builder · Strategic mastery',
    voice: 'Climbs toward lasting achievement. The challenge—ambition without isolation.',
  },
  Taurus: {
    element: 'earth' as const,
    modality: 'fixed' as const,
    tone: 'Steward · Embodied presence',
    voice: 'Grounds in sensory richness. The challenge—stability without stagnation.',
  },
  Virgo: {
    element: 'earth' as const,
    modality: 'mutable' as const,
    tone: 'Healer · Discerning service',
    voice: 'Refines through humble craft. The challenge—precision without perfectionism.',
  },

  // AIR - Thought, communication, connection
  Libra: {
    element: 'air' as const,
    modality: 'cardinal' as const,
    tone: 'Diplomat · Relational clarity',
    voice: 'Seeks harmony through exchange. The challenge—balance without losing center.',
  },
  Aquarius: {
    element: 'air' as const,
    modality: 'fixed' as const,
    tone: 'Visionary · Collective innovation',
    voice: 'Imagines systems that liberate all. The challenge—ideals without detachment.',
  },
  Gemini: {
    element: 'air' as const,
    modality: 'mutable' as const,
    tone: 'Weaver · Curious multiplicity',
    voice: 'Connects threads of thought and story. The challenge—adaptability without scatter.',
  },
} as const;

// Planet × Sign Composite Voices
// Key format: "{Planet}_{Sign}" → e.g., "Sun_Aries", "Moon_Scorpio"
export const COMPOSITE_VOICES: Record<string, string> = {
  // SUN COMPOSITES
  Sun_Aries: 'Hero-Pioneer. Identity forged in bold action. You become yourself by daring first steps.',
  Sun_Taurus: 'Hero-Steward. Identity rooted in embodied presence. You become yourself through sensory devotion.',
  Sun_Gemini: 'Hero-Weaver. Identity expressed through multiplicity. You become yourself by connecting worlds.',
  Sun_Cancer: 'Hero-Nurturer. Identity anchored in emotional safety. You become yourself by tending roots.',
  Sun_Leo: 'Hero-Sovereign. Identity radiates through creative fire. You become yourself by shining authentically.',
  Sun_Virgo: 'Hero-Healer. Identity refined through humble craft. You become yourself by perfecting service.',
  Sun_Libra: 'Hero-Diplomat. Identity formed in relational mirror. You become yourself through balanced exchange.',
  Sun_Scorpio: 'Hero-Alchemist. Identity forged in depths and shadow. You become yourself by facing what\'s hidden.',
  Sun_Sagittarius: 'Hero-Philosopher. Identity expands through meaning-seeking. You become yourself by exploring truth.',
  Sun_Capricorn: 'Hero-Builder. Identity earned through mastery. You become yourself by climbing toward legacy.',
  Sun_Aquarius: 'Hero-Visionary. Identity expressed through collective innovation. You become yourself by liberating systems.',
  Sun_Pisces: 'Hero-Mystic. Identity dissolves into universal compassion. You become yourself by surrendering boundaries.',

  // MOON COMPOSITES
  Moon_Aries: 'Soul-Warrior. Emotions ignite instantly. You feel through instinctive action.',
  Moon_Taurus: 'Soul-Garden. Emotions need grounding and beauty. You feel through sensory abundance.',
  Moon_Gemini: 'Soul-Storyteller. Emotions seek language and connection. You feel through conversation.',
  Moon_Cancer: 'Soul-Ocean. Emotions flow in protective tides. You feel through ancestral memory.',
  Moon_Leo: 'Soul-Theater. Emotions crave recognition and warmth. You feel through creative expression.',
  Moon_Virgo: 'Soul-Ritual. Emotions organize through careful tending. You feel through acts of service.',
  Moon_Libra: 'Soul-Mirror. Emotions balance in relationship. You feel through harmony and exchange.',
  Moon_Scorpio: 'Soul-Psychologist. Emotions dive into hidden depths. You feel through transformation and intensity.',
  Moon_Sagittarius: 'Soul-Wanderer. Emotions expand toward meaning. You feel through adventure and philosophy.',
  Moon_Capricorn: 'Soul-Mountain. Emotions stabilize through structure. You feel through responsibility and achievement.',
  Moon_Aquarius: 'Soul-Collective. Emotions detach to serve the whole. You feel through ideals and innovation.',
  Moon_Pisces: 'Soul-Oracle. Emotions dissolve all boundaries. You feel through universal empathy and dream.',

  // MERCURY COMPOSITES
  Mercury_Aries: 'Mind-Blade. Thought cuts quickly to action. You think by doing.',
  Mercury_Taurus: 'Mind-Root. Thought moves slowly, thoroughly. You think by embodying.',
  Mercury_Gemini: 'Mind-Network. Thought weaves infinite connections. You think by multiplying.',
  Mercury_Cancer: 'Mind-Memory. Thought flows through feeling. You think by remembering.',
  Mercury_Leo: 'Mind-Stage. Thought performs with drama. You think by creating.',
  Mercury_Virgo: 'Mind-Scalpel. Thought refines with precision. You think by analyzing.',
  Mercury_Libra: 'Mind-Scale. Thought balances perspectives. You think by relating.',
  Mercury_Scorpio: 'Mind-Detective. Thought penetrates hidden patterns. You think by probing.',
  Mercury_Sagittarius: 'Mind-Arrow. Thought seeks ultimate meaning. You think by synthesizing.',
  Mercury_Capricorn: 'Mind-Blueprint. Thought builds lasting structures. You think by strategizing.',
  Mercury_Aquarius: 'Mind-Lightning. Thought invents radical patterns. You think by innovating.',
  Mercury_Pisces: 'Mind-Mist. Thought dissolves into intuition. You think by dreaming.',

  // VENUS COMPOSITES
  Venus_Aries: 'Love-Conquest. Desire ignites through pursuit. You love by initiating.',
  Venus_Taurus: 'Love-Garden. Desire roots in sensory pleasure. You love by savoring.',
  Venus_Gemini: 'Love-Curiosity. Desire multiplies through variety. You love by exploring.',
  Venus_Cancer: 'Love-Nest. Desire craves emotional safety. You love by nurturing.',
  Venus_Leo: 'Love-Theater. Desire shines through romance. You love by celebrating.',
  Venus_Virgo: 'Love-Ritual. Desire serves through daily acts. You love by perfecting.',
  Venus_Libra: 'Love-Balance. Desire seeks harmonious partnership. You love by mirroring.',
  Venus_Scorpio: 'Love-Depths. Desire transforms through intensity. You love by merging.',
  Venus_Sagittarius: 'Love-Adventure. Desire expands through freedom. You love by exploring.',
  Venus_Capricorn: 'Love-Commitment. Desire builds through loyalty. You love by enduring.',
  Venus_Aquarius: 'Love-Friendship. Desire liberates through equality. You love by innovating.',
  Venus_Pisces: 'Love-Dissolution. Desire surrenders all boundaries. You love by transcending.',

  // MARS COMPOSITES
  Mars_Aries: 'Warrior-Ram. Action pure, instinctive, immediate. Strength without hesitation.',
  Mars_Taurus: 'Warrior-Bull. Action steady, persistent, immovable. Strength through endurance.',
  Mars_Gemini: 'Warrior-Trickster. Action quick, adaptive, verbal. Strength through strategy.',
  Mars_Cancer: 'Warrior-Protector. Action defends emotional territory. Strength through caring.',
  Mars_Leo: 'Warrior-Performer. Action expressed with dramatic courage. Strength through visibility.',
  Mars_Virgo: 'Warrior-Craftsman. Action refined through precision. Strength through competence.',
  Mars_Libra: 'Warrior-Diplomat. Action tempered by fairness. Strength through balance.',
  Mars_Scorpio: 'Warrior-Shadow. Action strikes from hidden depths. Strength through intensity.',
  Mars_Sagittarius: 'Warrior-Crusader. Action driven by conviction. Strength through belief.',
  Mars_Capricorn: 'Warrior-General. Action disciplined and strategic. Strength through mastery.',
  Mars_Aquarius: 'Warrior-Rebel. Action disrupts old systems. Strength through innovation.',
  Mars_Pisces: 'Warrior-Mystic. Action flows with compassion. Strength through surrender.',

  // JUPITER COMPOSITES
  Jupiter_Aries: 'Sage-Pioneer. Growth through bold adventure. Faith ignites action.',
  Jupiter_Taurus: 'Sage-Abundance. Growth through material blessing. Faith grounds in beauty.',
  Jupiter_Gemini: 'Sage-Teacher. Growth through endless learning. Faith multiplies knowledge.',
  Jupiter_Cancer: 'Sage-Ancestor. Growth through emotional wisdom. Faith nurtures roots.',
  Jupiter_Leo: 'Sage-Celebrant. Growth through joyful expression. Faith radiates generosity.',
  Jupiter_Virgo: 'Sage-Servant. Growth through humble craft. Faith perfects service.',
  Jupiter_Libra: 'Sage-Partner. Growth through relationship. Faith seeks harmony.',
  Jupiter_Scorpio: 'Sage-Transformer. Growth through crisis. Faith dives deep.',
  Jupiter_Sagittarius: 'Sage-Philosopher. Growth through meaning. Faith expands horizons.',
  Jupiter_Capricorn: 'Sage-Elder. Growth through responsibility. Faith builds legacy.',
  Jupiter_Aquarius: 'Sage-Liberator. Growth through collective vision. Faith reforms systems.',
  Jupiter_Pisces: 'Sage-Oracle. Growth through transcendence. Faith dissolves boundaries.',

  // SATURN COMPOSITES
  Saturn_Aries: 'Architect-Warrior. Mastery through disciplined action. Structure forged in fire.',
  Saturn_Taurus: 'Architect-Steward. Mastery through patient building. Structure rooted in earth.',
  Saturn_Gemini: 'Architect-Scholar. Mastery through focused thought. Structure woven from knowledge.',
  Saturn_Cancer: 'Architect-Elder. Mastery through emotional maturity. Structure built on foundation.',
  Saturn_Leo: 'Architect-Sovereign. Mastery through authentic authority. Structure radiates from center.',
  Saturn_Virgo: 'Architect-Craftsman. Mastery through humble perfection. Structure refined by detail.',
  Saturn_Libra: 'Architect-Judge. Mastery through balanced judgment. Structure holds fairness.',
  Saturn_Scorpio: 'Architect-Alchemist. Mastery through confronting shadow. Structure forged in depths.',
  Saturn_Sagittarius: 'Architect-Teacher. Mastery through wisdom transmission. Structure built on truth.',
  Saturn_Capricorn: 'Architect-Master. Mastery through long discipline. Structure climbs toward peak.',
  Saturn_Aquarius: 'Architect-Reformer. Mastery through social responsibility. Structure innovates systems.',
  Saturn_Pisces: 'Architect-Mystic. Mastery through surrender. Structure dissolves into flow.',

  // URANUS COMPOSITES
  Uranus_Aries: 'Rebel-Pioneer. Liberation through instant action. Freedom cuts new ground.',
  Uranus_Taurus: 'Rebel-Revolutionary. Liberation disrupts material security. Freedom shakes foundations.',
  Uranus_Gemini: 'Rebel-Inventor. Liberation through radical ideas. Freedom multiplies possibilities.',
  Uranus_Cancer: 'Rebel-Reformer. Liberation of emotional patterns. Freedom restructures home.',
  Uranus_Leo: 'Rebel-Artist. Liberation through authentic expression. Freedom shines uniquely.',
  Uranus_Virgo: 'Rebel-Healer. Liberation through new methods. Freedom perfects systems.',
  Uranus_Libra: 'Rebel-Diplomat. Liberation of relationship structures. Freedom seeks new balance.',
  Uranus_Scorpio: 'Rebel-Transformer. Liberation through crisis. Freedom breaks taboos.',
  Uranus_Sagittarius: 'Rebel-Philosopher. Liberation of belief systems. Freedom expands truth.',
  Uranus_Capricorn: 'Rebel-Architect. Liberation of authority. Freedom rebuilds institutions.',
  Uranus_Aquarius: 'Rebel-Visionary. Liberation for collective good. Freedom innovates humanity.',
  Uranus_Pisces: 'Rebel-Mystic. Liberation through transcendence. Freedom dissolves all limits.',

  // NEPTUNE COMPOSITES
  Neptune_Aries: 'Dreamer-Warrior. Vision quests through action. Imagination ignites.',
  Neptune_Taurus: 'Dreamer-Artist. Vision grounds in beauty. Imagination embodies.',
  Neptune_Gemini: 'Dreamer-Poet. Vision weaves through words. Imagination multiplies stories.',
  Neptune_Cancer: 'Dreamer-Oracle. Vision flows through feeling. Imagination nurtures.',
  Neptune_Leo: 'Dreamer-Creator. Vision shines through art. Imagination performs.',
  Neptune_Virgo: 'Dreamer-Healer. Vision serves through compassion. Imagination purifies.',
  Neptune_Libra: 'Dreamer-Muse. Vision harmonizes relationship. Imagination balances.',
  Neptune_Scorpio: 'Dreamer-Shaman. Vision penetrates mysteries. Imagination transforms.',
  Neptune_Sagittarius: 'Dreamer-Mystic. Vision seeks ultimate meaning. Imagination expands.',
  Neptune_Capricorn: 'Dreamer-Builder. Vision manifests slowly. Imagination structures.',
  Neptune_Aquarius: 'Dreamer-Visionary. Vision serves collective. Imagination liberates.',
  Neptune_Pisces: 'Dreamer-Ocean. Vision dissolves all boundaries. Imagination becomes universal.',

  // PLUTO COMPOSITES
  Pluto_Aries: 'Alchemist-Warrior. Power through decisive action. Shadow confronts instantly.',
  Pluto_Taurus: 'Alchemist-Steward. Power through material transformation. Shadow guards resources.',
  Pluto_Gemini: 'Alchemist-Magician. Power through penetrating thought. Shadow speaks truth.',
  Pluto_Cancer: 'Alchemist-Healer. Power through emotional depth. Shadow protects vulnerability.',
  Pluto_Leo: 'Alchemist-Sovereign. Power through authentic presence. Shadow owns authority.',
  Pluto_Virgo: 'Alchemist-Purifier. Power through meticulous transformation. Shadow perfects.',
  Pluto_Libra: 'Alchemist-Judge. Power through relationship crisis. Shadow balances.',
  Pluto_Scorpio: 'Alchemist-Phoenix. Power through death-rebirth. Shadow becomes gold.',
  Pluto_Sagittarius: 'Alchemist-Prophet. Power through truth-seeking. Shadow expands meaning.',
  Pluto_Capricorn: 'Alchemist-Reformer. Power through structural change. Shadow rebuilds authority.',
  Pluto_Aquarius: 'Alchemist-Revolutionary. Power through collective transformation. Shadow liberates.',
  Pluto_Pisces: 'Alchemist-Mystic. Power through spiritual dissolution. Shadow transcends.',
};

// Helper function to get composite voice
export function getArchetypeVoice(planet: string, sign: string): string {
  const key = `${planet}_${sign}`;
  return COMPOSITE_VOICES[key] || `${planet} in ${sign} - archetypal essence awaiting interpretation.`;
}

// Helper function to get full archetypal context
export function getArchetypeContext(planet: string, sign: string) {
  const planetArchetype = PLANET_ARCHETYPES[planet as keyof typeof PLANET_ARCHETYPES];
  const signVoice = SIGN_VOICES[sign as keyof typeof SIGN_VOICES];
  const compositeVoice = getArchetypeVoice(planet, sign);

  return {
    planet: planetArchetype,
    sign: signVoice,
    composite: compositeVoice,
  };
}
