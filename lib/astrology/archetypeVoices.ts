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
  },
  Moon: {
    title: 'The Soul / Mystic',
    essence: 'Emotion, memory, instinct',
    voice: 'Your lunar depths hold the waters of feeling and ancestral knowing.',
  },
  Mercury: {
    title: 'The Messenger / Magician',
    essence: 'Thought, translation, perception',
    voice: 'Your mercurial mind translates world into word, chaos into pattern.',
  },
  Venus: {
    title: 'The Lover / Artist',
    essence: 'Attraction, harmony, value',
    voice: 'Your venusian heart knows what beauty means, what love costs.',
  },
  Mars: {
    title: 'The Warrior / Initiator',
    essence: 'Drive, courage, boundary',
    voice: 'Your martial fire cuts through hesitation with blade and boundary.',
  },
  Jupiter: {
    title: 'The Sage / Explorer',
    essence: 'Growth, faith, expansion',
    voice: 'Your jupiterian vision seeks horizons where meaning multiplies.',
  },
  Saturn: {
    title: 'The Architect / Mentor',
    essence: 'Structure, responsibility, mastery',
    voice: 'Your saturnian craft builds temples from limitation and time.',
  },
  Uranus: {
    title: 'The Liberator / Rebel',
    essence: 'Innovation, disruption, freedom',
    voice: 'Your uranian lightning shatters patterns that cage the possible.',
  },
  Neptune: {
    title: 'The Dreamer / Mystic',
    essence: 'Imagination, transcendence, dissolution',
    voice: 'Your neptunian mist dissolves borders between self and soul.',
  },
  Pluto: {
    title: 'The Alchemist / Shadow',
    essence: 'Transformation, death-rebirth, power',
    voice: 'Your plutonian depths compost death into rebirth, shadow into gold.',
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
