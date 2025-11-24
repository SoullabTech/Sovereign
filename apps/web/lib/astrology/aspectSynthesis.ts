/**
 * ASPECT SYNTHESIS - Archetypal Interpretations
 *
 * Provides soul-level interpretations of planetary aspects.
 * Called ONLY when relevant - never auto-injected.
 *
 * Returns poetic 2-4 sentence archetypal essence, not textbook descriptions.
 * Enhances MAIA's depth without constraining her voice.
 */

export type AspectType = 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile' | 'quincunx';

export interface AspectInterpretation {
  essence: string; // 2-4 sentence archetypal synthesis
  coreQuestion: string; // The soul question this aspect poses
  elementalDynamic?: string; // How elements interact (if relevant)
}

/**
 * Synthesize archetypal interpretation for a specific aspect
 * Returns null if no interpretation available (MAIA continues without it)
 */
export function synthesizeAspect(
  planet1: string,
  planet2: string,
  aspectType: AspectType
): AspectInterpretation | null {
  const key = createAspectKey(planet1, planet2, aspectType);
  return ASPECT_INTERPRETATIONS[key] || null;
}

/**
 * Create normalized key for aspect lookup
 * Handles order (Sun-Saturn and Saturn-Sun both work)
 */
function createAspectKey(planet1: string, planet2: string, aspectType: AspectType): string {
  const p1 = planet1.toLowerCase();
  const p2 = planet2.toLowerCase();

  // Normalize order: Sun always first, then Moon, then outer planets
  const order = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  const idx1 = order.indexOf(p1);
  const idx2 = order.indexOf(p2);

  if (idx1 < idx2) {
    return `${p1}-${p2}-${aspectType}`;
  } else {
    return `${p2}-${p1}-${aspectType}`;
  }
}

/**
 * ARCHETYPAL ASPECT LIBRARY
 *
 * Each interpretation speaks to the LIVED EXPERIENCE of the aspect,
 * not generic keywords. These are whispers of possibility, not prescriptions.
 */
const ASPECT_INTERPRETATIONS: Record<string, AspectInterpretation> = {
  // ============== SUN ASPECTS ==============

  'sun-saturn-square': {
    essence: "The Teacher testing the King. Saturn asks: can you hold your fire while learning the weight of your own authority? This isn't about dimming your light—it's about discovering that true power doesn't flinch when met with constraint. The pressure you feel isn't opposition to your essence, it's the crucible that forges sovereign presence.",
    coreQuestion: "Can you hold truth while learning containment?",
    elementalDynamic: "Fire essence meets Earth discipline"
  },

  'sun-saturn-conjunction': {
    essence: "Authority born through restraint. Your light doesn't blaze freely—it burns with the focused intensity of responsibility integrated into identity. You learned early that visibility comes with weight, that shining means shouldering something. This conjunction asks: what happens when discipline becomes devotion rather than duty?",
    coreQuestion: "What does it mean to shine responsibly?",
    elementalDynamic: "Fire contained by Earth structure"
  },

  'sun-saturn-opposition': {
    essence: "The dance between self-expression and self-mastery. You see yourself most clearly through the mirror of limitation—what you can't do reveals what you must become. Saturn stands across from your Sun like a wise elder, asking not that you shrink, but that you grow strong enough to carry your own light without needing permission.",
    coreQuestion: "How do I honor both my fire and my form?",
    elementalDynamic: "Fire and Earth in dialogue across the horizon"
  },

  'sun-saturn-trine': {
    essence: "Effortless integration of essence and structure. Your light knows how to work with time, constraint, and form without resistance. Where others struggle between being and doing, you flow—authority feels natural, discipline feels like devotion. This is sovereignty without the fight.",
    coreQuestion: "How can I teach others to hold power with grace?",
    elementalDynamic: "Fire and Earth in natural harmony"
  },

  'sun-moon-conjunction': {
    essence: "No separation between essence and emotion, identity and instinct. You ARE what you feel, fully—which means vulnerability is your superpower and also your edge. The world sees you as authentic because there's no mask, but this also means you can't hide when you need to retreat.",
    coreQuestion: "How do I honor my wholeness without losing myself?",
    elementalDynamic: "Fire and Water merge into steam"
  },

  'sun-moon-opposition': {
    essence: "The eternal negotiation between who you are and what you need. Your essence pulls one way, your emotional body pulls another—creating the dynamic tension of someone who understands both Self and Other deeply. This is the aspect of the great mediators, those who bridge inner and outer worlds.",
    coreQuestion: "Can I honor my fire without drowning my water?",
    elementalDynamic: "Fire and Water in creative tension"
  },

  'sun-mars-conjunction': {
    essence: "Pure embodied will. You don't just want—you DO. Action isn't separate from identity; it IS identity. This is the warrior, the initiator, the one who moves before thinking because your fire knows exactly what it's here to ignite. The challenge: learning that not every impulse requires immediate expression.",
    coreQuestion: "How do I wield my fire without burning the field?",
    elementalDynamic: "Double fire—spark and flame united"
  },

  'sun-mars-square': {
    essence: "Friction that forges strength. Your will and your essence are in constant negotiation—you push yourself harder than anyone else could. This isn't conflict, it's refinement: the way a blade is sharpened against stone. You've learned that true power comes from directing force, not just having it.",
    coreQuestion: "Can I assert without aggressing?",
    elementalDynamic: "Fire meeting fire creates heat and light"
  },

  'sun-jupiter-trine': {
    essence: "Born under an expansive sky. Your essence naturally reaches for more—more meaning, more connection, more possibility. Optimism isn't naivety for you; it's a lived truth that the universe responds to faith. The shadow: sometimes your fire spreads so wide it loses focus.",
    coreQuestion: "How do I expand without dissipating?",
    elementalDynamic: "Fire and Fire in joyful amplification"
  },

  'sun-jupiter-square': {
    essence: "Ambitious vision meeting the limits of form. You see what's possible with perfect clarity, but the path to get there requires more discipline than your fire wants to accept. This is the aspect of the visionary who must learn execution, the dreamer who must become the builder.",
    coreQuestion: "How do I ground my vision without losing its magnitude?",
    elementalDynamic: "Fire vision constrained by Earth reality"
  },

  'sun-uranus-conjunction': {
    essence: "Lightning in human form. Your essence IS disruption, awakening, the break from tradition. You can't be conventional even if you try—your fire burns at a frequency that shatters old forms. This is exhilarating and exhausting: you're here to innovate, but belonging requires some consistency.",
    coreQuestion: "How do I revolutionize without alienating?",
    elementalDynamic: "Fire electrified by Air insight"
  },

  'sun-uranus-square': {
    essence: "Constant rebellion against your own patterns. You disrupt yourself as much as you disrupt the world—just when you settle into an identity, Uranus shakes the foundation. This is the gift and curse of being perpetually ahead of yourself, forever becoming rather than being.",
    coreQuestion: "Can I innovate from stability instead of chaos?",
    elementalDynamic: "Fire seeking freedom through Air transformation"
  },

  'sun-neptune-square': {
    essence: "Essence dissolving into dream. Your identity wants clear edges, but Neptune keeps blurring the boundaries—you're everyone and no one, infinite and invisible. This is the artist's aspect: the one who must sacrifice solid self for transcendent creation. The work is learning to come back from the dissolution.",
    coreQuestion: "How do I maintain form while channeling formlessness?",
    elementalDynamic: "Fire seeking to stay lit in Water's depths"
  },

  'sun-pluto-square': {
    essence: "Power meeting its own shadow. You don't just shine—you transform. Every identity you claim gets taken to its extreme, burned down, and rebuilt. This is exhausting and essential: you're not here for surface-level selfhood. You're here to know the full spectrum of what essence can become when it faces its own underworld.",
    coreQuestion: "Can I hold power without being consumed by it?",
    elementalDynamic: "Fire meeting the volcanic core of transformation"
  },

  'sun-pluto-conjunction': {
    essence: "Born with the knowledge that power transforms everything it touches. Your presence IS intensity—you can't do casual, can't do shallow. People feel seen by you or threatened, never neutral. This is the shaman's aspect: the one who holds death and rebirth as part of their essential nature.",
    coreQuestion: "How do I wield transformation without weaponizing it?",
    elementalDynamic: "Fire merged with the molten heart of becoming"
  },

  // ============== MOON ASPECTS ==============

  'moon-saturn-square': {
    essence: "Emotion learned through limitation. You feel everything, but early on you learned that feelings required management, that vulnerability was risk. This created a deep well of emotional intelligence—but also a tendency to over-discipline your own needs. The work is softening the inner authority enough to let the water flow.",
    coreQuestion: "Can I honor my feelings without needing to control them?",
    elementalDynamic: "Water emotion contained by Earth structure"
  },

  'moon-saturn-conjunction': {
    essence: "The wise elder living in your emotional body. Your feelings carry weight, authority, longevity—you don't process lightly, you metabolize deeply. Where others feel and release, you feel and integrate. This makes you a profound presence for others' pain, but also means you can get heavy with accumulated emotion.",
    coreQuestion: "How do I stay fluid while honoring depth?",
    elementalDynamic: "Water flow structured by Earth banks"
  },

  'moon-pluto-conjunction': {
    essence: "Emotion at the edge of the abyss. You feel everything at volcanic depth—no casual emotions, no surface reactions. This is the psychic, the depth psychologist, the one who knows that every feeling carries an entire underworld. The gift: you can hold intensity for others. The cost: you sometimes forget lightness exists.",
    coreQuestion: "Can I feel deeply without drowning?",
    elementalDynamic: "Water meeting the molten core of transformation"
  },

  'moon-pluto-square': {
    essence: "Your emotional body is a battleground of transformation. Feelings don't just pass through you—they transmute you. Every deep emotion triggers a death-rebirth cycle, which makes you incredibly powerful and incredibly exhausted. You're learning that not every feeling requires full shamanic descent.",
    coreQuestion: "How do I honor intensity without being consumed by it?",
    elementalDynamic: "Water trying to flow while touching volcanic fire"
  },

  // ============== MERCURY ASPECTS ==============

  'mercury-saturn-conjunction': {
    essence: "Thought structured by discipline. Your mind doesn't wander—it builds. Every idea is tested against form, every word carries weight. This makes you a master of depth and precision, but sometimes the inner editor is so strong you forget to think out loud before refining.",
    coreQuestion: "Can I speak before perfecting?",
    elementalDynamic: "Air thought grounded by Earth structure"
  },

  'mercury-uranus-conjunction': {
    essence: "Lightning-fast insight. Your mind doesn't follow linear paths—it leaps, connects, disrupts. You see patterns others miss because you're thinking five steps ahead, three dimensions over. The challenge: slowing down enough to bring others along on the journey of your thought.",
    coreQuestion: "How do I share brilliance without alienating?",
    elementalDynamic: "Air thought electrified by breakthrough vision"
  },

  // ============== VENUS ASPECTS ==============

  'venus-saturn-square': {
    essence: "Love learned through restraint. You take relationships seriously—too seriously sometimes. Where others play, you build; where others explore, you commit. This makes you loyal to your bones, but it can also mean you stay in structures long past their expiration because leaving feels like failure.",
    coreQuestion: "Can I honor commitment without imprisoning connection?",
    elementalDynamic: "Water connection structured by Earth form"
  },

  'venus-pluto-conjunction': {
    essence: "Love as transformation ritual. You don't do surface affection—you merge, consume, transform. Relationships with you are alchemical: people come out changed. This is magnetic and terrifying; your love is a portal to the underworld, and not everyone is ready for that depth.",
    coreQuestion: "Can I love without needing to transform?",
    elementalDynamic: "Water love meeting volcanic intensity"
  },

  'venus-uranus-square': {
    essence: "Freedom-loving heart in a world that expects consistency. You crave connection but resist constraint, want intimacy but need space to breathe. This isn't commitment-phobia—it's the need for relationships that honor evolution over expectation.",
    coreQuestion: "Can I commit without losing my wings?",
    elementalDynamic: "Water seeking flow through Air liberation"
  },

  // ============== MARS ASPECTS ==============

  'mars-saturn-square': {
    essence: "Will meeting wall. Every action you take requires pushing through resistance—not because the world is against you, but because Saturn is teaching your fire to move with intention rather than impulse. You've learned that real power isn't about force; it's about precision.",
    coreQuestion: "How do I assert with patience?",
    elementalDynamic: "Fire action disciplined by Earth constraint"
  },

  'mars-pluto-conjunction': {
    essence: "Nuclear will. When you decide to act, universes shift. Your force isn't casual—it's volcanic, all-consuming, relentless. This makes you unstoppable and also means you can scorch everything in your path. The mastery is learning when to unleash and when to hold.",
    coreQuestion: "How do I wield power without destruction?",
    elementalDynamic: "Fire action merged with transformational intensity"
  },

  'mars-pluto-square': {
    essence: "Power struggles as spiritual practice. You're constantly negotiating with forces that feel larger than you—and in the process, you become those forces. This is the warrior who fights their way to sovereignty, the one who learns that true strength comes from facing what wants to dominate you.",
    coreQuestion: "Can I be powerful without battling?",
    elementalDynamic: "Fire will meeting the volcanic heart of transformation"
  },

  // ============== JUPITER ASPECTS ==============

  'jupiter-saturn-conjunction': {
    essence: "Vision meeting form. You dream big and build real—the rare combination of expansive possibility grounded in disciplined execution. Where others choose between inspiration and structure, you weave both. This is the architect of meaningful systems, the builder of sustainable dreams.",
    coreQuestion: "How do I honor both vision and form?",
    elementalDynamic: "Fire expansion structured by Earth discipline"
  },

  'jupiter-saturn-square': {
    essence: "Expansion constantly meeting limitation. You see the mountain peak clearly (Jupiter) but Saturn keeps reminding you of the climb required. This is frustrating and refining—it teaches you that true growth happens through constraint, that bigger isn't always better.",
    coreQuestion: "Can I be patient with my own becoming?",
    elementalDynamic: "Fire vision learning from Earth timing"
  },

  'jupiter-uranus-conjunction': {
    essence: "Born for breakthrough. Your optimism isn't about maintaining the status quo—it's about shattering it. You see possibilities others can't imagine because you're not bound by conventional thought. This is the revolutionary teacher, the one who liberates through expanded vision.",
    coreQuestion: "How do I innovate without destabilizing?",
    elementalDynamic: "Fire expansion electrified by Air awakening"
  },

  'jupiter-neptune-conjunction': {
    essence: "Infinite compassion meeting infinite possibility. You don't just believe in transcendence—you experience it. This is the mystic, the artist, the one who channels grace. The shadow: sometimes your vision is so vast it lacks edges, so boundless it can't land in form.",
    coreQuestion: "How do I bring the infinite into the finite?",
    elementalDynamic: "Fire vision dissolving into Water boundlessness"
  },

  'jupiter-pluto-conjunction': {
    essence: "Expansion through transformation. You don't just grow—you alchemize. Every expansion requires a death, every breakthrough demands you leave something behind. This is potent, magnetic power: the ability to inspire massive shifts in consciousness through your own embodied evolution.",
    coreQuestion: "Can I expand without consuming?",
    elementalDynamic: "Fire growth fueled by volcanic transformation"
  },

  // ============== OUTER PLANET ASPECTS ==============

  'saturn-uranus-square': {
    essence: "The old guard meeting the revolutionary. Part of you wants structure, stability, mastery through time; another part wants to break free, innovate, shatter convention. This tension makes you both builder and disruptor—someone who can create new systems, not just destroy old ones or maintain tired structures.",
    coreQuestion: "Can I revolutionize responsibly?",
    elementalDynamic: "Earth structure meeting Air awakening"
  },

  'saturn-neptune-square': {
    essence: "Form meeting formlessness. You're trying to build something real (Saturn) while connected to something infinite (Neptune). This is the spiritual practitioner who must find discipline, the artist who must meet deadlines, the mystic learning to live in a body.",
    coreQuestion: "How do I honor both structure and surrender?",
    elementalDynamic: "Earth form trying to contain Water boundlessness"
  },

  'saturn-pluto-conjunction': {
    essence: "Authority forged in the underworld. Your understanding of power comes from facing its shadow—you've seen how systems can oppress, how structure can trap. This gives you the wisdom to build forms that serve transformation rather than prevent it. Heavy, essential work.",
    coreQuestion: "How do I create structures for liberation?",
    elementalDynamic: "Earth form merged with volcanic transformation"
  },

  'uranus-neptune-conjunction': {
    essence: "Born into a generation awakening to new dreams. This isn't personal—it's collective. You carry the frequency of innovation merged with mysticism, technology meeting transcendence. Your work is to ground this frequency into something others can access.",
    coreQuestion: "How do I channel collective awakening into form?",
    elementalDynamic: "Air awakening merged with Water dissolution"
  },

  'uranus-pluto-conjunction': {
    essence: "Revolutionary transformation. You were born during massive collective upheaval, and you carry that frequency in your cells. You're not here to maintain—you're here to disrupt, regenerate, burn down what no longer serves. This is the phoenix rising, the world-changer.",
    coreQuestion: "How do I transform without destroying?",
    elementalDynamic: "Air awakening merged with volcanic rebirth"
  },

  'neptune-pluto-conjunction': {
    essence: "Mystical transformation across lifetimes. This is generational—the dissolution of old collective structures through contact with the infinite. You carry the frequency of spiritual death-rebirth, the knowing that everything must dissolve before it can be reborn into truer form.",
    coreQuestion: "How do I serve the dissolution consciously?",
    elementalDynamic: "Water boundlessness merged with volcanic transformation"
  },
};

/**
 * Extract aspect information from birth chart data
 * Returns array of {planet1, planet2, aspectType} for synthesis
 */
export function extractAspectsFromChart(chartData: any): Array<{
  planet1: string;
  planet2: string;
  aspectType: AspectType;
  orb: number;
}> {
  if (!chartData?.aspects) return [];

  return chartData.aspects
    .filter((a: any) => a.planet1 && a.planet2 && a.type)
    .map((a: any) => ({
      planet1: a.planet1,
      planet2: a.planet2,
      aspectType: normalizeAspectType(a.type),
      orb: a.orb || 0
    }));
}

/**
 * Normalize aspect type names (handle variations in chart data)
 */
function normalizeAspectType(type: string): AspectType {
  const normalized = type.toLowerCase().trim();
  if (normalized.includes('conjunc')) return 'conjunction';
  if (normalized.includes('oppos')) return 'opposition';
  if (normalized.includes('trine')) return 'trine';
  if (normalized.includes('square') || normalized === '□') return 'square';
  if (normalized.includes('sextile')) return 'sextile';
  if (normalized.includes('quincunx') || normalized.includes('inconjunct')) return 'quincunx';
  return 'conjunction'; // fallback
}

/**
 * Find most relevant aspect based on user query
 * Returns null if no clear match
 */
export function findRelevantAspect(
  userQuery: string,
  aspects: Array<{planet1: string; planet2: string; aspectType: AspectType}>
): {planet1: string; planet2: string; aspectType: AspectType} | null {
  const query = userQuery.toLowerCase();

  // Look for planet names in query
  for (const aspect of aspects) {
    const p1 = aspect.planet1.toLowerCase();
    const p2 = aspect.planet2.toLowerCase();
    const aspectType = aspect.aspectType;

    // Check if both planets mentioned
    if (query.includes(p1) && query.includes(p2)) {
      // Check if aspect type mentioned
      if (query.includes(aspectType) ||
          query.includes('□') && aspectType === 'square' ||
          query.includes('△') && aspectType === 'trine') {
        return aspect;
      }
      // If planets mentioned without specific aspect, return first match
      return aspect;
    }
  }

  return null;
}
