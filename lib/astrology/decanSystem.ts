/**
 * The 36 Faces - Complete Decan System
 *
 * Integrating Austin Coppock's traditional decan framework with Spiralogic
 *
 * Each zodiac sign (30°) is divided into 3 decans (10° each)
 * 36 total decans = 12 signs × 3 decans
 *
 * Traditional Chaldean Order: Saturn → Jupiter → Mars → Sun → Venus → Mercury → Moon
 *
 * Each decan contains:
 * - Planetary ruler (Chaldean order)
 * - Archetypal image (from Picatrix, 36 Airs, etc.)
 * - Tarot minor arcana correspondence
 * - Magical/symbolic essence
 * - Spiralogic integration (alchemical micro-phase, consciousness layer)
 */

export type PlanetaryRuler = 'Mars' | 'Venus' | 'Mercury' | 'Moon' | 'Sun' | 'Jupiter' | 'Saturn';
export type Element = 'Fire' | 'Water' | 'Earth' | 'Air';
export type Modality = 'Cardinal' | 'Fixed' | 'Mutable';
export type SpiralogicPhase = 'begins' | 'deepens' | 'integrates';

export interface Decan {
  // Core Identity
  sign: string;
  signSymbol: string;
  element: Element;
  modality: Modality;
  decanNumber: 1 | 2 | 3;

  // Degree Range
  startDegree: number;  // Absolute zodiacal degree (0-360)
  endDegree: number;
  startDegreeInSign: number; // Degree within sign (0-30)
  endDegreeInSign: number;

  // Traditional Rulership
  ruler: PlanetaryRuler;

  // Archetypal Identity (Austin Coppock style)
  name: string;           // "The Ram", "The Crown", etc.
  image: string;          // Picatrix/36 Airs description
  archetype: string;      // Core essence
  symbolism: string;      // Deeper meaning

  // Tarot Correspondence
  tarotCard: string;      // "2 of Wands", "3 of Cups", etc.
  tarotSuit: 'Wands' | 'Cups' | 'Swords' | 'Pentacles';
  tarotNumber: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  // Spiralogic Integration
  spiralogicElement: 'fire' | 'water' | 'earth' | 'air';
  spiralogicPhase: 1 | 2 | 3;
  spiralogicMicroPhase: SpiralogicPhase;
  alchemicalStage: string;
  consciousnessLayer: string;
  brainActivation: string;

  // Interpretation
  natalMeaning: string;   // What it means in birth chart
  transitMeaning: string; // What it means when planets transit through
  gifts: string[];        // Natural talents/abilities
  challenges: string[];   // Shadow/difficulties

  // Magical/Ritual (traditional)
  magicalPower: string;   // What this decan grants
  ritualTiming: string;   // Best time to work with this energy
}

/**
 * THE 36 FACES - Complete Decan Library
 * Organized by Element and Modality (Spiralogic order)
 */
export const DECANS: Decan[] = [

  // ============================================================================
  // FIRE ELEMENT - ARIES (Cardinal Fire, Phase 1: Self-Awareness)
  // Houses: 1, 5, 9 | Spiralogic: Right Prefrontal Cortex
  // ============================================================================

  {
    sign: 'Aries',
    signSymbol: '♈',
    element: 'Fire',
    modality: 'Cardinal',
    decanNumber: 1,
    startDegree: 0,
    endDegree: 10,
    startDegreeInSign: 0,
    endDegreeInSign: 10,
    ruler: 'Mars',
    name: 'The Ram',
    image: 'A warrior clad in armor, breaking through obstacles with pure force',
    archetype: 'The Pioneer',
    symbolism: 'Raw initiative, primal will, breakthrough energy',
    tarotCard: '2 of Wands',
    tarotSuit: 'Wands',
    tarotNumber: 2,
    spiralogicElement: 'fire',
    spiralogicPhase: 1,
    spiralogicMicroPhase: 'begins',
    alchemicalStage: 'Calcinatio ignites - burning away the old self',
    consciousnessLayer: 'Meta-Conscious awakening',
    brainActivation: 'Right Prefrontal - initial visionary spark',
    natalMeaning: 'Born with raw pioneering force. Natural ability to initiate, lead, and break new ground. Identity forged through courageous action.',
    transitMeaning: 'Time to START something bold. Take initiative. Break through resistance. Assert your will.',
    gifts: ['Courage', 'Initiative', 'Leadership', 'Breakthrough power', 'Fearless action'],
    challenges: ['Impulsiveness', 'Aggression', 'Burning out quickly', 'Lack of patience', 'Recklessness'],
    magicalPower: 'Grants courage and victory in battle. Invokes Mars for protection and conquest.',
    ritualTiming: 'March 21-30 (Sun transit). New Moon in Aries. Mars hour during Aries season.',
  },

  {
    sign: 'Aries',
    signSymbol: '♈',
    element: 'Fire',
    modality: 'Cardinal',
    decanNumber: 2,
    startDegree: 10,
    endDegree: 20,
    startDegreeInSign: 10,
    endDegreeInSign: 20,
    ruler: 'Sun',
    name: 'The Crown',
    image: 'A figure crowned with solar rays, radiating authority and self-sovereignty',
    archetype: 'The Sovereign Self',
    symbolism: 'Self-kingship, radiant authority, claiming one\'s throne',
    tarotCard: '3 of Wands',
    tarotSuit: 'Wands',
    tarotNumber: 3,
    spiralogicElement: 'fire',
    spiralogicPhase: 1,
    spiralogicMicroPhase: 'deepens',
    alchemicalStage: 'Calcinatio intensifies - solar purification of ego',
    consciousnessLayer: 'Meta-Conscious radiance',
    brainActivation: 'Right Prefrontal - sustained visionary fire',
    natalMeaning: 'Born to lead and shine. Natural authority and self-confidence. Identity as sovereign creator of your reality.',
    transitMeaning: 'Time to CLAIM your authority. Step into leadership. Shine your light boldly. Own your power.',
    gifts: ['Natural authority', 'Radiant confidence', 'Leadership presence', 'Self-sovereignty', 'Creative power'],
    challenges: ['Arrogance', 'Domination', 'Ego inflation', 'Need for constant recognition', 'Pride'],
    magicalPower: 'Bestows authority, confidence, and solar vitality. Invokes Sun for kingship and radiance.',
    ritualTiming: 'March 31-April 9 (Sun transit). Sunday sunrise during Aries season.',
  },

  {
    sign: 'Aries',
    signSymbol: '♈',
    element: 'Fire',
    modality: 'Cardinal',
    decanNumber: 3,
    startDegree: 20,
    endDegree: 30,
    startDegreeInSign: 20,
    endDegreeInSign: 30,
    ruler: 'Jupiter',
    name: 'The Archer\'s Aim',
    image: 'An archer drawing bow toward distant horizon, arrow aimed at the stars',
    archetype: 'The Visionary',
    symbolism: 'Expansive vision, philosophical fire, aiming higher',
    tarotCard: '4 of Wands',
    tarotSuit: 'Wands',
    tarotNumber: 4,
    spiralogicElement: 'fire',
    spiralogicPhase: 1,
    spiralogicMicroPhase: 'integrates',
    alchemicalStage: 'Calcinatio prepares transition - philosophical expansion',
    consciousnessLayer: 'Meta-Conscious synthesis',
    brainActivation: 'Right Prefrontal - visionary expansion toward meaning',
    natalMeaning: 'Born with philosophical fire and expansive vision. Natural optimism and desire to aim for higher meaning. Identity through growth.',
    transitMeaning: 'Time to EXPAND your vision. Think bigger. Aim higher. Seek meaning and adventure.',
    gifts: ['Optimism', 'Vision', 'Philosophical depth', 'Adventure-seeking', 'Growth mindset'],
    challenges: ['Over-extension', 'Restlessness', 'Lack of follow-through', 'Grandiosity', 'Idealism without grounding'],
    magicalPower: 'Grants vision, growth, and fortune. Invokes Jupiter for expansion and wisdom.',
    ritualTiming: 'April 10-19 (Sun transit). Jupiter hour during Aries season. Waxing Moon.',
  },

  // ============================================================================
  // FIRE ELEMENT - LEO (Fixed Fire, Phase 2: Self-In-World Awareness)
  // ============================================================================

  {
    sign: 'Leo',
    signSymbol: '♌',
    element: 'Fire',
    modality: 'Fixed',
    decanNumber: 1,
    startDegree: 120,
    endDegree: 130,
    startDegreeInSign: 0,
    endDegreeInSign: 10,
    ruler: 'Saturn',
    name: 'The Throne',
    image: 'A regal lion seated on a throne, embodying dignified authority',
    archetype: 'The King/Queen',
    symbolism: 'Earned authority, dignified power, structured creativity',
    tarotCard: '5 of Wands',
    tarotSuit: 'Wands',
    tarotNumber: 5,
    spiralogicElement: 'fire',
    spiralogicPhase: 2,
    spiralogicMicroPhase: 'begins',
    alchemicalStage: 'Calcinatio stabilizes - creative fire takes form',
    consciousnessLayer: 'Conscious self-expression',
    brainActivation: 'Right Prefrontal - grounded creative authority',
    natalMeaning: 'Born with dignified creative authority. Natural ability to build lasting structures of self-expression. Earned royalty.',
    transitMeaning: 'Time to BUILD your creative empire. Establish your authority. Create with discipline and mastery.',
    gifts: ['Disciplined creativity', 'Earned authority', 'Mature leadership', 'Structured self-expression', 'Dignified presence'],
    challenges: ['Rigidity', 'Controlling creativity', 'Fear of playfulness', 'Authoritarian tendencies', 'Creative blocks'],
    magicalPower: 'Bestows authority, structure, and mastery. Invokes Saturn for discipline in creative work.',
    ritualTiming: 'July 23-August 1 (Sun transit). Saturday during Leo season.',
  },

  {
    sign: 'Leo',
    signSymbol: '♌',
    element: 'Fire',
    modality: 'Fixed',
    decanNumber: 2,
    startDegree: 130,
    endDegree: 140,
    startDegreeInSign: 10,
    endDegreeInSign: 20,
    ruler: 'Jupiter',
    name: 'The Crown Bearer',
    image: 'A figure bearing a crown of light, radiating generosity and joy',
    archetype: 'The Generous Heart',
    symbolism: 'Expansive creativity, generous spirit, joyful abundance',
    tarotCard: '6 of Wands',
    tarotSuit: 'Wands',
    tarotNumber: 6,
    spiralogicElement: 'fire',
    spiralogicPhase: 2,
    spiralogicMicroPhase: 'deepens',
    alchemicalStage: 'Calcinatio expands - creative abundance flows',
    consciousnessLayer: 'Conscious creative flow',
    brainActivation: 'Right Prefrontal - abundant self-expression',
    natalMeaning: 'Born with generous heart and abundant creativity. Natural gift for inspiring others through joyful expression.',
    transitMeaning: 'Time to SHARE your gifts. Create with joy. Inspire others. Let your heart overflow.',
    gifts: ['Generosity', 'Inspirational creativity', 'Joy', 'Heart-centered leadership', 'Abundance mindset'],
    challenges: ['Over-giving', 'Attention-seeking', 'Extravagance', 'Drama', 'Burnout from constant performance'],
    magicalPower: 'Grants abundance, joy, and creative success. Invokes Jupiter for generosity and fortune.',
    ritualTiming: 'August 2-11 (Sun transit). Thursday during Leo season. Full Moon.',
  },

  {
    sign: 'Leo',
    signSymbol: '♌',
    element: 'Fire',
    modality: 'Fixed',
    decanNumber: 3,
    startDegree: 140,
    endDegree: 150,
    startDegreeInSign: 20,
    endDegreeInSign: 30,
    ruler: 'Mars',
    name: 'The Victor',
    image: 'A warrior crowned in victory, holding sword and laurel wreath',
    archetype: 'The Triumphant Creator',
    symbolism: 'Creative victory, passionate mastery, triumphant self-expression',
    tarotCard: '7 of Wands',
    tarotSuit: 'Wands',
    tarotNumber: 7,
    spiralogicElement: 'fire',
    spiralogicPhase: 2,
    spiralogicMicroPhase: 'integrates',
    alchemicalStage: 'Calcinatio culminates - creative fire victorious',
    consciousnessLayer: 'Conscious mastery of expression',
    brainActivation: 'Right Prefrontal - triumphant creative will',
    natalMeaning: 'Born to create and triumph. Natural competitive edge in creative expression. Victory through passionate self-assertion.',
    transitMeaning: 'Time to CONQUER creatively. Fight for your vision. Win through passionate expression. Claim victory.',
    gifts: ['Creative courage', 'Competitive drive', 'Passionate expression', 'Victory mindset', 'Warrior spirit'],
    challenges: ['Combativeness', 'Creative battles', 'Ego conflicts', 'Domination', 'Win-at-all-costs mentality'],
    magicalPower: 'Grants victory, courage, and triumph. Invokes Mars for creative conquest.',
    ritualTiming: 'August 12-22 (Sun transit). Tuesday during Leo season. Warrior rituals.',
  },

  // ============================================================================
  // FIRE ELEMENT - SAGITTARIUS (Mutable Fire, Phase 3: Transcendent Self-Awareness)
  // ============================================================================

  {
    sign: 'Sagittarius',
    signSymbol: '♐',
    element: 'Fire',
    modality: 'Mutable',
    decanNumber: 1,
    startDegree: 240,
    endDegree: 250,
    startDegreeInSign: 0,
    endDegreeInSign: 10,
    ruler: 'Mercury',
    name: 'The Arrow',
    image: 'A swift arrow in flight, carrying messages between worlds',
    archetype: 'The Messenger of Truth',
    symbolism: 'Swift wisdom, philosophical communication, truth-seeking',
    tarotCard: '8 of Wands',
    tarotSuit: 'Wands',
    tarotNumber: 8,
    spiralogicElement: 'fire',
    spiralogicPhase: 3,
    spiralogicMicroPhase: 'begins',
    alchemicalStage: 'Calcinatio refines - intellectual fire seeks truth',
    consciousnessLayer: 'Meta-Conscious communication',
    brainActivation: 'Right Prefrontal - philosophical synthesis begins',
    natalMeaning: 'Born to seek and communicate higher truth. Natural teacher, writer, philosopher. Swift mind seeking meaning.',
    transitMeaning: 'Time to SEEK wisdom. Communicate your truth. Study, teach, learn. Let your mind fly free.',
    gifts: ['Quick intellect', 'Philosophical insight', 'Teaching ability', 'Truth-telling', 'Mental freedom'],
    challenges: ['Mental restlessness', 'Scattered focus', 'Know-it-all tendency', 'Dogmatism', 'Intellectual arrogance'],
    magicalPower: 'Grants swiftness, communication, and mental clarity. Invokes Mercury for wisdom.',
    ritualTiming: 'November 22-December 1 (Sun transit). Wednesday during Sagittarius season.',
  },

  {
    sign: 'Sagittarius',
    signSymbol: '♐',
    element: 'Fire',
    modality: 'Mutable',
    decanNumber: 2,
    startDegree: 250,
    endDegree: 260,
    startDegreeInSign: 10,
    endDegreeInSign: 20,
    ruler: 'Moon',
    name: 'The Bow',
    image: 'A silver bow reflecting moonlight, curved like the crescent moon',
    archetype: 'The Lunar Archer',
    symbolism: 'Intuitive wisdom, emotional philosophy, lunar vision',
    tarotCard: '9 of Wands',
    tarotSuit: 'Wands',
    tarotNumber: 9,
    spiralogicElement: 'fire',
    spiralogicPhase: 3,
    spiralogicMicroPhase: 'deepens',
    alchemicalStage: 'Calcinatio integrates emotion - feeling wisdom',
    consciousnessLayer: 'Meta-Conscious emotional synthesis',
    brainActivation: 'Right Prefrontal - intuitive philosophical depth',
    natalMeaning: 'Born with intuitive wisdom and emotional philosophy. Natural ability to feel truth. Lunar vision guides expansion.',
    transitMeaning: 'Time to TRUST your intuition. Feel your way to wisdom. Let emotion guide philosophy.',
    gifts: ['Intuitive wisdom', 'Emotional intelligence', 'Empathic teaching', 'Lunar cycles awareness', 'Feeling truth'],
    challenges: ['Emotional philosophizing', 'Moodiness about beliefs', 'Restless feelings', 'Scattered emotions', 'Defensive idealism'],
    magicalPower: 'Grants intuitive wisdom and emotional insight. Invokes Moon for lunar philosophy.',
    ritualTiming: 'December 2-11 (Sun transit). Monday during Sagittarius season. Full Moon.',
  },

  {
    sign: 'Sagittarius',
    signSymbol: '♐',
    element: 'Fire',
    modality: 'Mutable',
    decanNumber: 3,
    startDegree: 260,
    endDegree: 270,
    startDegreeInSign: 20,
    endDegreeInSign: 30,
    ruler: 'Saturn',
    name: 'The Centaur',
    image: 'Half-human, half-horse, bridging animal instinct and divine wisdom',
    archetype: 'The Wise Teacher',
    symbolism: 'Mastered wisdom, structured philosophy, earned teaching authority',
    tarotCard: '10 of Wands',
    tarotSuit: 'Wands',
    tarotNumber: 10,
    spiralogicElement: 'fire',
    spiralogicPhase: 3,
    spiralogicMicroPhase: 'integrates',
    alchemicalStage: 'Calcinatio completes - wisdom crystallizes into teaching',
    consciousnessLayer: 'Meta-Conscious mastery',
    brainActivation: 'Right Prefrontal - complete spiritual synthesis',
    natalMeaning: 'Born to teach hard-won wisdom. Natural elder, mentor, guide. Philosophy through lived experience and discipline.',
    transitMeaning: 'Time to MASTER your teaching. Share earned wisdom. Build philosophical structures. Become the elder.',
    gifts: ['Earned wisdom', 'Teaching mastery', 'Disciplined philosophy', 'Elder energy', 'Structured spiritual growth'],
    challenges: ['Heavy philosophical burdens', 'Rigid beliefs', 'Teaching exhaustion', 'Cynicism', 'Dogmatic wisdom'],
    magicalPower: 'Grants mastery, wisdom, and teaching authority. Invokes Saturn for disciplined philosophy.',
    ritualTiming: 'December 12-21 (Sun transit). Saturday during Sagittarius season. Winter Solstice.',
  },

  // ============================================================================
  // WATER ELEMENT - CANCER (Cardinal Water, Phase 1: Emotional Intelligence)
  // Houses: 4, 8, 12 | Spiralogic: Right Hemisphere
  // ============================================================================

  {
    sign: 'Cancer',
    signSymbol: '♋',
    element: 'Water',
    modality: 'Cardinal',
    decanNumber: 1,
    startDegree: 90,
    endDegree: 100,
    startDegreeInSign: 0,
    endDegreeInSign: 10,
    ruler: 'Venus',
    name: 'The Pearl',
    image: 'A luminous pearl within protective shell, beauty born from irritation',
    archetype: 'The Nurturer',
    symbolism: 'Protective love, cultivated beauty, emotional sanctuary',
    tarotCard: '2 of Cups',
    tarotSuit: 'Cups',
    tarotNumber: 2,
    spiralogicElement: 'water',
    spiralogicPhase: 1,
    spiralogicMicroPhase: 'begins',
    alchemicalStage: 'Solutio begins - emotional dissolution into love',
    consciousnessLayer: 'Subconscious emotional foundation',
    brainActivation: 'Right Hemisphere - nurturing emotional presence',
    natalMeaning: 'Born with tender heart and protective love. Natural nurturer who creates beautiful emotional sanctuaries.',
    transitMeaning: 'Time to NURTURE. Create safety. Offer love. Build your emotional home. Protect what matters.',
    gifts: ['Tender nurturing', 'Protective love', 'Emotional beauty', 'Creating sanctuary', 'Caring presence'],
    challenges: ['Smothering', 'Over-protection', 'Emotional possessiveness', 'Dependency', 'Fear of abandonment'],
    magicalPower: 'Grants love, protection, and emotional sanctuary. Invokes Venus for nurturing.',
    ritualTiming: 'June 21-30 (Sun transit). Friday during Cancer season. Venus hour.',
  },

  {
    sign: 'Cancer',
    signSymbol: '♋',
    element: 'Water',
    modality: 'Cardinal',
    decanNumber: 2,
    startDegree: 100,
    endDegree: 110,
    startDegreeInSign: 10,
    endDegreeInSign: 20,
    ruler: 'Mercury',
    name: 'The Shell',
    image: 'A spiraling nautilus shell, containing ancient memory and protective wisdom',
    archetype: 'The Memory Keeper',
    symbolism: 'Emotional intelligence, protective communication, ancestral wisdom',
    tarotCard: '3 of Cups',
    tarotSuit: 'Cups',
    tarotNumber: 3,
    spiralogicElement: 'water',
    spiralogicPhase: 1,
    spiralogicMicroPhase: 'deepens',
    alchemicalStage: 'Solutio deepens - emotional intelligence develops',
    consciousnessLayer: 'Subconscious wisdom accessing',
    brainActivation: 'Right Hemisphere - emotional memory activation',
    natalMeaning: 'Born with emotional intelligence and memory. Natural ability to understand and communicate feelings. Ancestral wisdom keeper.',
    transitMeaning: 'Time to REMEMBER. Honor your roots. Communicate feelings. Access emotional wisdom.',
    gifts: ['Emotional intelligence', 'Memory', 'Feeling communication', 'Ancestral connection', 'Protective wisdom'],
    challenges: ['Rumination', 'Living in the past', 'Emotional over-analysis', 'Defensiveness', 'Clinging to old hurts'],
    magicalPower: 'Grants emotional wisdom and ancestral connection. Invokes Mercury for feeling intelligence.',
    ritualTiming: 'July 1-11 (Sun transit). Wednesday during Cancer season. Ancestral altars.',
  },

  {
    sign: 'Cancer',
    signSymbol: '♋',
    element: 'Water',
    modality: 'Cardinal',
    decanNumber: 3,
    startDegree: 110,
    endDegree: 120,
    startDegreeInSign: 20,
    endDegreeInSign: 30,
    ruler: 'Moon',
    name: 'The Tide',
    image: 'Moon-pulled ocean waves, the eternal rhythm of feeling',
    archetype: 'The Lunar Mother',
    symbolism: 'Pure emotional nature, lunar rhythms, tidal wisdom',
    tarotCard: '4 of Cups',
    tarotSuit: 'Cups',
    tarotNumber: 4,
    spiralogicElement: 'water',
    spiralogicPhase: 1,
    spiralogicMicroPhase: 'integrates',
    alchemicalStage: 'Solutio integrates - full emotional immersion',
    consciousnessLayer: 'Subconscious lunar connection',
    brainActivation: 'Right Hemisphere - complete emotional attunement',
    natalMeaning: 'Born with pure lunar nature. Deep connection to emotional tides. Natural psychic sensitivity and mothering instinct.',
    transitMeaning: 'Time to FEEL deeply. Honor your rhythms. Connect with the Moon. Let emotions flow.',
    gifts: ['Psychic sensitivity', 'Lunar wisdom', 'Deep feeling', 'Mothering instinct', 'Emotional authenticity'],
    challenges: ['Overwhelming emotions', 'Moodiness', 'Withdrawal', 'Emotional flooding', 'Lunar instability'],
    magicalPower: 'Grants lunar connection and psychic ability. Invokes Moon for emotional mastery.',
    ritualTiming: 'July 12-22 (Sun transit). Monday during Cancer season. Moon rituals, especially Full Moon.',
  },

  // ============================================================================
  // WATER ELEMENT - SCORPIO (Fixed Water, Phase 2: Personal Inner Transformation)
  // ============================================================================

  {
    sign: 'Scorpio',
    signSymbol: '♏',
    element: 'Water',
    modality: 'Fixed',
    decanNumber: 1,
    startDegree: 210,
    endDegree: 220,
    startDegreeInSign: 0,
    endDegreeInSign: 10,
    ruler: 'Mars',
    name: 'The Scorpion',
    image: 'Desert scorpion, deadly and protective, guardian of hidden treasure',
    archetype: 'The Alchemist',
    symbolism: 'Transformative power, protective intensity, death-rebirth initiation',
    tarotCard: '5 of Cups',
    tarotSuit: 'Cups',
    tarotNumber: 5,
    spiralogicElement: 'water',
    spiralogicPhase: 2,
    spiralogicMicroPhase: 'begins',
    alchemicalStage: 'Solutio intensifies - emotional death-rebirth begins',
    consciousnessLayer: 'Unconscious activation',
    brainActivation: 'Right Hemisphere - deep emotional transformation begins',
    natalMeaning: 'Born with alchemical power and protective intensity. Natural ability to transform through crisis. Warrior of the depths.',
    transitMeaning: 'Time to TRANSFORM. Face your shadow. Die to the old. Protect what\'s sacred. Alchemize pain.',
    gifts: ['Transformative power', 'Depth psychology', 'Protective intensity', 'Crisis wisdom', 'Alchemical ability'],
    challenges: ['Destructiveness', 'Vengefulness', 'Emotional warfare', 'Control through fear', 'Stinging when threatened'],
    magicalPower: 'Grants transformation and power over life-death. Invokes Mars for alchemical strength.',
    ritualTiming: 'October 23-November 2 (Sun transit). Tuesday during Scorpio season. Shadow work.',
  },

  {
    sign: 'Scorpio',
    signSymbol: '♏',
    element: 'Water',
    modality: 'Fixed',
    decanNumber: 2,
    startDegree: 220,
    endDegree: 230,
    startDegreeInSign: 10,
    endDegreeInSign: 20,
    ruler: 'Sun',
    name: 'The Phoenix',
    image: 'Golden bird rising from ashes, reborn through fire',
    archetype: 'The Regenerated One',
    symbolism: 'Death and rebirth, conscious transformation, golden resurrection',
    tarotCard: '6 of Cups',
    tarotSuit: 'Cups',
    tarotNumber: 6,
    spiralogicElement: 'water',
    spiralogicPhase: 2,
    spiralogicMicroPhase: 'deepens',
    alchemicalStage: 'Solutio purifies - golden transformation',
    consciousnessLayer: 'Unconscious gold emerging',
    brainActivation: 'Right Hemisphere - soul-level regeneration',
    natalMeaning: 'Born to die and be reborn. Natural ability for radical transformation. Phoenix energy that rises from every ending.',
    transitMeaning: 'Time to RISE from the ashes. Embrace rebirth. Let the old die completely. Claim your gold.',
    gifts: ['Regeneration', 'Phoenix resilience', 'Radical transformation', 'Soul rebirth', 'Finding gold in ashes'],
    challenges: ['Repeated destruction', 'Addiction to crisis', 'Burning bridges', 'Extremism', 'All-or-nothing patterns'],
    magicalPower: 'Grants rebirth and regeneration. Invokes Sun for phoenix transformation.',
    ritualTiming: 'November 3-12 (Sun transit). Sunday during Scorpio season. Death-rebirth rituals.',
  },

  {
    sign: 'Scorpio',
    signSymbol: '♏',
    element: 'Water',
    modality: 'Fixed',
    decanNumber: 3,
    startDegree: 230,
    endDegree: 240,
    startDegreeInSign: 20,
    endDegreeInSign: 30,
    ruler: 'Moon',
    name: 'The Serpent\'s Dream',
    image: 'Cosmic serpent dreaming the world, ouroboros eating its tail',
    archetype: 'The Mystic',
    symbolism: 'Psychic depth, dream wisdom, eternal transformation',
    tarotCard: '7 of Cups',
    tarotSuit: 'Cups',
    tarotNumber: 7,
    spiralogicElement: 'water',
    spiralogicPhase: 2,
    spiralogicMicroPhase: 'integrates',
    alchemicalStage: 'Solutio completes - full psychic immersion',
    consciousnessLayer: 'Unconscious mastery',
    brainActivation: 'Right Hemisphere - complete depth psychology activation',
    natalMeaning: 'Born with psychic mastery and dream wisdom. Natural mystic who understands unconscious realms. Serpent wisdom keeper.',
    transitMeaning: 'Time to DREAM the transformation. Access psychic depths. Master the unconscious. Embrace the mystery.',
    gifts: ['Psychic mastery', 'Dream wisdom', 'Unconscious fluency', 'Mystical depth', 'Serpent power'],
    challenges: ['Psychic overwhelm', 'Illusion', 'Escapism through depth', 'Drowning in unconscious', 'Obsession'],
    magicalPower: 'Grants psychic power and dream mastery. Invokes Moon for deep unconscious work.',
    ritualTiming: 'November 13-22 (Sun transit). Monday during Scorpio season. Dream work, psychic development.',
  },

  // ============================================================================
  // WATER ELEMENT - PISCES (Mutable Water, Phase 3: Deep Internal Self-Awareness)
  // ============================================================================

  {
    sign: 'Pisces',
    signSymbol: '♓',
    element: 'Water',
    modality: 'Mutable',
    decanNumber: 1,
    startDegree: 330,
    endDegree: 340,
    startDegreeInSign: 0,
    endDegreeInSign: 10,
    ruler: 'Saturn',
    name: 'The Whale\'s Dive',
    image: 'Great whale descending into deepest ocean, carrying ancient memory',
    archetype: 'The Soul Diver',
    symbolism: 'Structured dissolution, disciplined surrender, deep soul work',
    tarotCard: '8 of Cups',
    tarotSuit: 'Cups',
    tarotNumber: 8,
    spiralogicElement: 'water',
    spiralogicPhase: 3,
    spiralogicMicroPhase: 'begins',
    alchemicalStage: 'Solutio deepens to soul - structured spiritual dissolution',
    consciousnessLayer: 'Unconscious soul connection',
    brainActivation: 'Right Hemisphere - soul-level awareness begins',
    natalMeaning: 'Born to do deep soul work through disciplined surrender. Natural ability to structure spiritual dissolution.',
    transitMeaning: 'Time to DIVE deep. Do the soul work. Surrender with discipline. Let structures dissolve into spirit.',
    gifts: ['Deep soul work', 'Disciplined spirituality', 'Structured dissolution', 'Ancient wisdom', 'Elder mystic energy'],
    challenges: ['Spiritual depression', 'Crystallized grief', 'Rigid spirituality', 'Fear of dissolution', 'Martyrdom'],
    magicalPower: 'Grants depth, discipline, and soul wisdom. Invokes Saturn for structured spiritual work.',
    ritualTiming: 'February 19-28 (Sun transit). Saturday during Pisces season. Deep meditation.',
  },

  {
    sign: 'Pisces',
    signSymbol: '♓',
    element: 'Water',
    modality: 'Mutable',
    decanNumber: 2,
    startDegree: 340,
    endDegree: 350,
    startDegreeInSign: 10,
    endDegreeInSign: 20,
    ruler: 'Jupiter',
    name: 'The Ocean of Light',
    image: 'Infinite ocean glowing with bioluminescence, dissolving all boundaries',
    archetype: 'The Mystic Dreamer',
    symbolism: 'Boundless compassion, universal love, spiritual expansion',
    tarotCard: '9 of Cups',
    tarotSuit: 'Cups',
    tarotNumber: 9,
    spiralogicElement: 'water',
    spiralogicPhase: 3,
    spiralogicMicroPhase: 'deepens',
    alchemicalStage: 'Solutio expands - oceanic consciousness',
    consciousnessLayer: 'Unconscious unity',
    brainActivation: 'Right Hemisphere - boundless spiritual awareness',
    natalMeaning: 'Born with oceanic consciousness and boundless compassion. Natural mystic who experiences universal unity.',
    transitMeaning: 'Time to DISSOLVE into unity. Expand compassion. Experience oneness. Let boundaries disappear.',
    gifts: ['Universal love', 'Oceanic consciousness', 'Boundless compassion', 'Spiritual bliss', 'Unity consciousness'],
    challenges: ['Spiritual bypassing', 'Boundary dissolution', 'Loss of self', 'Addiction to transcendence', 'Martyrdom through love'],
    magicalPower: 'Grants universal love and spiritual expansion. Invokes Jupiter for oceanic consciousness.',
    ritualTiming: 'March 1-10 (Sun transit). Thursday during Pisces season. Full Moon. Oneness meditation.',
  },

  {
    sign: 'Pisces',
    signSymbol: '♓',
    element: 'Water',
    modality: 'Mutable',
    decanNumber: 3,
    startDegree: 350,
    endDegree: 360,
    startDegreeInSign: 20,
    endDegreeInSign: 30,
    ruler: 'Mars',
    name: 'The Sword in the Sea',
    image: 'Excalibur emerging from sacred waters, spiritual warrior awakened',
    archetype: 'The Spiritual Warrior',
    symbolism: 'Warrior compassion, sacred action, spirituality embodied',
    tarotCard: '10 of Cups',
    tarotSuit: 'Cups',
    tarotNumber: 10,
    spiralogicElement: 'water',
    spiralogicPhase: 3,
    spiralogicMicroPhase: 'integrates',
    alchemicalStage: 'Solutio completes - spirit embodied in action',
    consciousnessLayer: 'Unconscious warrior awakening',
    brainActivation: 'Right Hemisphere - spiritual will activated',
    natalMeaning: 'Born as spiritual warrior. Natural ability to embody transcendent wisdom in action. Compassionate force.',
    transitMeaning: 'Time to ACT on your spirituality. Be the spiritual warrior. Embody compassion with strength.',
    gifts: ['Spiritual warriorship', 'Compassionate action', 'Embodied transcendence', 'Sacred activism', 'Mystical strength'],
    challenges: ['Spiritual warfare', 'Righteous anger', 'Compassion fatigue', 'Burnout from service', 'Martyrdom through action'],
    magicalPower: 'Grants spiritual warriorship and sacred action. Invokes Mars for embodied spirituality.',
    ritualTiming: 'March 11-20 (Sun transit). Tuesday during Pisces season. Spring Equinox eve. Warrior ceremonies.',
  },

  // ============================================================================
  // EARTH ELEMENT - CAPRICORN (Cardinal Earth, Phase 1: Purpose, Mission, Service)
  // Houses: 10, 2, 6 | Spiralogic: Left Hemisphere
  // ============================================================================

  {
    sign: 'Capricorn',
    signSymbol: '♑',
    element: 'Earth',
    modality: 'Cardinal',
    decanNumber: 1,
    startDegree: 270,
    endDegree: 280,
    startDegreeInSign: 0,
    endDegreeInSign: 10,
    ruler: 'Jupiter',
    name: 'The Mountain',
    image: 'Majestic peak reaching toward heaven, founded on earth',
    archetype: 'The Builder of Worlds',
    symbolism: 'Ambitious vision, earned authority, structural expansion',
    tarotCard: '2 of Pentacles',
    tarotSuit: 'Pentacles',
    tarotNumber: 2,
    spiralogicElement: 'earth',
    spiralogicPhase: 1,
    spiralogicMicroPhase: 'begins',
    alchemicalStage: 'Coagulatio begins - vision crystallizes into structure',
    consciousnessLayer: 'Conscious structural initiation',
    brainActivation: 'Left Hemisphere - ambitious planning begins',
    natalMeaning: 'Born to build grand structures. Natural visionary architect who sees the mountain and begins the climb.',
    transitMeaning: 'Time to BUILD something great. Set ambitious goals. Begin the long climb. Found your empire.',
    gifts: ['Ambitious vision', 'Strategic building', 'Long-term planning', 'Earned authority', 'Structural mastery'],
    challenges: ['Over-ambition', 'Workaholism', 'Sacrificing present for future', 'Ruthless climbing', 'Status obsession'],
    magicalPower: 'Grants ambition, success, and structural power. Invokes Jupiter for expansive building.',
    ritualTiming: 'December 22-31 (Sun transit). Thursday during Capricorn season. Winter Solstice. New ventures.',
  },

  {
    sign: 'Capricorn',
    signSymbol: '♑',
    element: 'Earth',
    modality: 'Cardinal',
    decanNumber: 2,
    startDegree: 280,
    endDegree: 290,
    startDegreeInSign: 10,
    endDegreeInSign: 20,
    ruler: 'Mars',
    name: 'The Forge',
    image: 'Blacksmith hammering metal in sacred fire, creating tools of mastery',
    archetype: 'The Master Builder',
    symbolism: 'Forged strength, disciplined will, mastery through effort',
    tarotCard: '3 of Pentacles',
    tarotSuit: 'Pentacles',
    tarotNumber: 3,
    spiralogicElement: 'earth',
    spiralogicPhase: 1,
    spiralogicMicroPhase: 'deepens',
    alchemicalStage: 'Coagulatio intensifies - will forges reality',
    consciousnessLayer: 'Conscious mastery building',
    brainActivation: 'Left Hemisphere - disciplined execution',
    natalMeaning: 'Born to forge reality through disciplined will. Natural master craftsman who builds through persistent effort.',
    transitMeaning: 'Time to FORGE your reality. Work with discipline. Master your craft. Build through effort.',
    gifts: ['Disciplined will', 'Master craftsmanship', 'Persistent effort', 'Practical mastery', 'Forging power'],
    challenges: ['Brutal discipline', 'Workhorse mentality', 'Burning out', 'Harsh self-criticism', 'Rigidity'],
    magicalPower: 'Grants mastery, strength, and forging power. Invokes Mars for disciplined building.',
    ritualTiming: 'January 1-9 (Sun transit). Tuesday during Capricorn season. Forge rituals, tool consecration.',
  },

  {
    sign: 'Capricorn',
    signSymbol: '♑',
    element: 'Earth',
    modality: 'Cardinal',
    decanNumber: 3,
    startDegree: 290,
    endDegree: 300,
    startDegreeInSign: 20,
    endDegreeInSign: 30,
    ruler: 'Sun',
    name: 'The Crown of Achievement',
    image: 'Golden crown atop the mountain, earned through mastery',
    archetype: 'The Sovereign Authority',
    symbolism: 'Earned mastery, worldly authority, achieved greatness',
    tarotCard: '4 of Pentacles',
    tarotSuit: 'Pentacles',
    tarotNumber: 4,
    spiralogicElement: 'earth',
    spiralogicPhase: 1,
    spiralogicMicroPhase: 'integrates',
    alchemicalStage: 'Coagulatio stabilizes - achievement crystallizes',
    consciousnessLayer: 'Conscious authority achieved',
    brainActivation: 'Left Hemisphere - structural sovereignty',
    natalMeaning: 'Born to achieve mastery and worldly authority. Natural sovereign who earns the crown through demonstrated excellence.',
    transitMeaning: 'Time to CLAIM your mastery. Accept your authority. Wear the crown. Rule your domain.',
    gifts: ['Earned authority', 'Worldly mastery', 'Sovereign power', 'Achievement', 'Structural excellence'],
    challenges: ['Controlling', 'Status rigidity', 'Holding too tightly', 'Fear of losing position', 'Authoritarian'],
    magicalPower: 'Grants authority, achievement, and worldly power. Invokes Sun for sovereign mastery.',
    ritualTiming: 'January 10-19 (Sun transit). Sunday during Capricorn season. Authority rituals.',
  },

  // ============================================================================
  // EARTH ELEMENT - TAURUS (Fixed Earth, Phase 2: Resources, Plans, Outer Development)
  // ============================================================================

  {
    sign: 'Taurus',
    signSymbol: '♉',
    element: 'Earth',
    modality: 'Fixed',
    decanNumber: 1,
    startDegree: 30,
    endDegree: 40,
    startDegreeInSign: 0,
    endDegreeInSign: 10,
    ruler: 'Mercury',
    name: 'The Garden',
    image: 'Abundant garden tended with wisdom, nature cultivated through knowledge',
    archetype: 'The Wise Cultivator',
    symbolism: 'Intelligent cultivation, resourceful planning, natural wisdom',
    tarotCard: '5 of Pentacles',
    tarotSuit: 'Pentacles',
    tarotNumber: 5,
    spiralogicElement: 'earth',
    spiralogicPhase: 2,
    spiralogicMicroPhase: 'begins',
    alchemicalStage: 'Coagulatio grounds - wisdom takes root',
    consciousnessLayer: 'Conscious resource planning',
    brainActivation: 'Left Hemisphere - intelligent resource management',
    natalMeaning: 'Born with intelligent approach to resources. Natural ability to plan and cultivate abundance through wisdom.',
    transitMeaning: 'Time to PLAN your resources. Cultivate wisely. Use intelligence to build abundance.',
    gifts: ['Resourcefulness', 'Intelligent planning', 'Natural wisdom', 'Cultivation skills', 'Practical thinking'],
    challenges: ['Over-analyzing resources', 'Anxiety about scarcity', 'Mental hoarding', 'Analysis paralysis', 'Worry'],
    magicalPower: 'Grants resourcefulness and planning wisdom. Invokes Mercury for intelligent cultivation.',
    ritualTiming: 'April 20-29 (Sun transit). Wednesday during Taurus season. Garden planting.',
  },

  {
    sign: 'Taurus',
    signSymbol: '♉',
    element: 'Earth',
    modality: 'Fixed',
    decanNumber: 2,
    startDegree: 40,
    endDegree: 50,
    startDegreeInSign: 10,
    endDegreeInSign: 20,
    ruler: 'Moon',
    name: 'The Fertile Field',
    image: 'Rich soil under moonlight, nourishing all growth',
    archetype: 'The Nourisher',
    symbolism: 'Emotional grounding, nurturing abundance, lunar fertility',
    tarotCard: '6 of Pentacles',
    tarotSuit: 'Pentacles',
    tarotNumber: 6,
    spiralogicElement: 'earth',
    spiralogicPhase: 2,
    spiralogicMicroPhase: 'deepens',
    alchemicalStage: 'Coagulatio nourishes - emotional security builds',
    consciousnessLayer: 'Conscious emotional embodiment',
    brainActivation: 'Left Hemisphere - grounded emotional nourishment',
    natalMeaning: 'Born to nourish and be nourished. Natural ability to create emotional and material security through caring presence.',
    transitMeaning: 'Time to NOURISH yourself and others. Build emotional security. Create abundance through care.',
    gifts: ['Nurturing abundance', 'Emotional security', 'Fertile presence', 'Grounded care', 'Material mothering'],
    challenges: ['Emotional dependency on resources', 'Comfort eating', 'Material smothering', 'Hoarding for safety', 'Possessiveness'],
    magicalPower: 'Grants nourishment, fertility, and emotional grounding. Invokes Moon for material security.',
    ritualTiming: 'April 30-May 10 (Sun transit). Monday during Taurus season. Full Moon. Beltane.',
  },

  {
    sign: 'Taurus',
    signSymbol: '♉',
    element: 'Earth',
    modality: 'Fixed',
    decanNumber: 3,
    startDegree: 50,
    endDegree: 60,
    startDegreeInSign: 20,
    endDegreeInSign: 30,
    ruler: 'Saturn',
    name: 'The Foundation Stone',
    image: 'Ancient cornerstone, solid and immovable, holding all structures',
    archetype: 'The Master of Form',
    symbolism: 'Absolute stability, mastered resources, crystallized abundance',
    tarotCard: '7 of Pentacles',
    tarotSuit: 'Pentacles',
    tarotNumber: 7,
    spiralogicElement: 'earth',
    spiralogicPhase: 2,
    spiralogicMicroPhase: 'integrates',
    alchemicalStage: 'Coagulatio crystallizes - complete material mastery',
    consciousnessLayer: 'Conscious material sovereignty',
    brainActivation: 'Left Hemisphere - absolute structural stability',
    natalMeaning: 'Born with absolute material mastery. Natural ability to create lasting abundance and unshakeable foundations.',
    transitMeaning: 'Time to BUILD forever. Create unshakeable stability. Master material reality completely.',
    gifts: ['Absolute stability', 'Material mastery', 'Lasting abundance', 'Foundation building', 'Timeless structures'],
    challenges: ['Rigidity', 'Stagnation', 'Fear of change', 'Over-attachment to form', 'Crystallization'],
    magicalPower: 'Grants stability, mastery, and lasting abundance. Invokes Saturn for eternal foundations.',
    ritualTiming: 'May 11-20 (Sun transit). Saturday during Taurus season. Foundation rituals.',
  },

  // ============================================================================
  // EARTH ELEMENT - VIRGO (Mutable Earth, Phase 3: Well-Formed Plan of Action)
  // ============================================================================

  {
    sign: 'Virgo',
    signSymbol: '♍',
    element: 'Earth',
    modality: 'Mutable',
    decanNumber: 1,
    startDegree: 150,
    endDegree: 160,
    startDegreeInSign: 0,
    endDegreeInSign: 10,
    ruler: 'Sun',
    name: 'The Craftsman',
    image: 'Master artisan creating beauty through perfect skill',
    archetype: 'The Sacred Artisan',
    symbolism: 'Conscious craft, radiant service, skillful perfection',
    tarotCard: '8 of Pentacles',
    tarotSuit: 'Pentacles',
    tarotNumber: 8,
    spiralogicElement: 'earth',
    spiralogicPhase: 3,
    spiralogicMicroPhase: 'begins',
    alchemicalStage: 'Coagulatio refines - skill becomes art',
    consciousnessLayer: 'Conscious refinement begins',
    brainActivation: 'Left Hemisphere - precision skill activation',
    natalMeaning: 'Born to perfect craft and serve through excellence. Natural artisan who creates beauty through disciplined skill.',
    transitMeaning: 'Time to PERFECT your craft. Serve through skill. Create with precision. Make art of work.',
    gifts: ['Masterful craft', 'Sacred service', 'Precision skill', 'Artisan consciousness', 'Excellence'],
    challenges: ['Perfectionism', 'Self-criticism', 'Never good enough', 'Service martyrdom', 'Analysis paralysis'],
    magicalPower: 'Grants skill, precision, and mastery. Invokes Sun for radiant craftsmanship.',
    ritualTiming: 'August 23-September 1 (Sun transit). Sunday during Virgo season. Craft consecration.',
  },

  {
    sign: 'Virgo',
    signSymbol: '♍',
    element: 'Earth',
    modality: 'Mutable',
    decanNumber: 2,
    startDegree: 160,
    endDegree: 170,
    startDegreeInSign: 10,
    endDegreeInSign: 20,
    ruler: 'Venus',
    name: 'The Healer',
    image: 'Herbalist gathering sacred plants with reverence and love',
    archetype: 'The Sacred Healer',
    symbolism: 'Loving service, gentle healing, beautiful order',
    tarotCard: '9 of Pentacles',
    tarotSuit: 'Pentacles',
    tarotNumber: 9,
    spiralogicElement: 'earth',
    spiralogicPhase: 3,
    spiralogicMicroPhase: 'deepens',
    alchemicalStage: 'Coagulatio heals - order becomes medicine',
    consciousnessLayer: 'Conscious healing presence',
    brainActivation: 'Left Hemisphere - systematic healing wisdom',
    natalMeaning: 'Born to heal through loving service. Natural herbalist, healer, and caretaker who brings order as medicine.',
    transitMeaning: 'Time to HEAL through service. Offer your medicine. Create beautiful order. Serve with love.',
    gifts: ['Healing presence', 'Loving service', 'Herbal wisdom', 'Beautiful order', 'Gentle care'],
    challenges: ['Codependency', 'Over-giving', 'Healing without boundaries', 'Perfectionist caretaking', 'Self-neglect'],
    magicalPower: 'Grants healing and loving service. Invokes Venus for sacred medicine.',
    ritualTiming: 'September 2-12 (Sun transit). Friday during Virgo season. Harvest. Herbal preparations.',
  },

  {
    sign: 'Virgo',
    signSymbol: '♍',
    element: 'Earth',
    modality: 'Mutable',
    decanNumber: 3,
    startDegree: 170,
    endDegree: 180,
    startDegreeInSign: 20,
    endDegreeInSign: 30,
    ruler: 'Mercury',
    name: 'The Scribe',
    image: 'Sacred scribe recording divine wisdom with precision and devotion',
    archetype: 'The Wisdom Keeper',
    symbolism: 'Codified knowledge, systematic wisdom, sacred recording',
    tarotCard: '10 of Pentacles',
    tarotSuit: 'Pentacles',
    tarotNumber: 10,
    spiralogicElement: 'earth',
    spiralogicPhase: 3,
    spiralogicMicroPhase: 'integrates',
    alchemicalStage: 'Coagulatio completes - wisdom crystallizes into legacy',
    consciousnessLayer: 'Conscious wisdom codification',
    brainActivation: 'Left Hemisphere - complete systematic mastery',
    natalMeaning: 'Born to codify and preserve wisdom. Natural scribe, teacher, and keeper of sacred knowledge systems.',
    transitMeaning: 'Time to CODIFY your wisdom. Create systems. Record knowledge. Build lasting structures of learning.',
    gifts: ['Systematic wisdom', 'Sacred recording', 'Knowledge systems', 'Teaching mastery', 'Legacy building'],
    challenges: ['Over-systematizing', 'Knowledge hoarding', 'Rigid frameworks', 'Losing magic in method', 'Dry intellectualism'],
    magicalPower: 'Grants wisdom, teaching, and sacred knowledge. Invokes Mercury for codification mastery.',
    ritualTiming: 'September 13-22 (Sun transit). Wednesday during Virgo season. Equinox eve. Knowledge rituals.',
  },

  // ============================================================================
  // AIR ELEMENT - LIBRA (Cardinal Air, Phase 1: Interpersonal Relationship Patterns)
  // Houses: 7, 11, 3 | Spiralogic: Left Prefrontal Cortex
  // ============================================================================

  {
    sign: 'Libra',
    signSymbol: '♎',
    element: 'Air',
    modality: 'Cardinal',
    decanNumber: 1,
    startDegree: 180,
    endDegree: 190,
    startDegreeInSign: 0,
    endDegreeInSign: 10,
    ruler: 'Moon',
    name: 'The Scales',
    image: 'Perfectly balanced scales under moonlight, weighing souls',
    archetype: 'The Harmonizer',
    symbolism: 'Emotional balance, intuitive fairness, lunar justice',
    tarotCard: '2 of Swords',
    tarotSuit: 'Swords',
    tarotNumber: 2,
    spiralogicElement: 'air',
    spiralogicPhase: 1,
    spiralogicMicroPhase: 'begins',
    alchemicalStage: 'Sublimatio begins - emotions refined through relationship',
    consciousnessLayer: 'Conscious relational awareness',
    brainActivation: 'Left Prefrontal - intuitive balancing begins',
    natalMeaning: 'Born to balance emotions through relationship. Natural mediator who feels fairness and harmonizes through intuition.',
    transitMeaning: 'Time to BALANCE through feeling. Trust your relational intuition. Create emotional equilibrium.',
    gifts: ['Emotional balance', 'Intuitive fairness', 'Harmonizing presence', 'Relational sensitivity', 'Diplomatic feeling'],
    challenges: ['Emotional indecision', 'Over-compromising', 'People-pleasing', 'Losing self in balance', 'Conflict avoidance'],
    magicalPower: 'Grants harmony, balance, and intuitive justice. Invokes Moon for emotional equilibrium.',
    ritualTiming: 'September 23-October 2 (Sun transit). Monday during Libra season. Equinox. Balance rituals.',
  },

  {
    sign: 'Libra',
    signSymbol: '♎',
    element: 'Air',
    modality: 'Cardinal',
    decanNumber: 2,
    startDegree: 190,
    endDegree: 200,
    startDegreeInSign: 10,
    endDegreeInSign: 20,
    ruler: 'Saturn',
    name: 'The Contract',
    image: 'Sacred covenant written in stars, binding hearts through truth',
    archetype: 'The Sacred Partner',
    symbolism: 'Committed partnership, structured relating, sacred contracts',
    tarotCard: '3 of Swords',
    tarotSuit: 'Swords',
    tarotNumber: 3,
    spiralogicElement: 'air',
    spiralogicPhase: 1,
    spiralogicMicroPhase: 'deepens',
    alchemicalStage: 'Sublimatio deepens - relationship becomes sacred structure',
    consciousnessLayer: 'Conscious commitment',
    brainActivation: 'Left Prefrontal - relationship architecture',
    natalMeaning: 'Born to create sacred partnerships through commitment. Natural ability to honor contracts and build lasting relating structures.',
    transitMeaning: 'Time to COMMIT in relationships. Honor your contracts. Build sacred partnership structures.',
    gifts: ['Sacred commitment', 'Partnership mastery', 'Contract honoring', 'Structured relating', 'Loyal partnership'],
    challenges: ['Rigid relating', 'Fear of commitment', 'Contractual coldness', 'Staying in dead partnerships', 'Duty over love'],
    magicalPower: 'Grants commitment, loyalty, and sacred contracts. Invokes Saturn for partnership mastery.',
    ritualTiming: 'October 3-12 (Sun transit). Saturday during Libra season. Partnership ceremonies.',
  },

  {
    sign: 'Libra',
    signSymbol: '♎',
    element: 'Air',
    modality: 'Cardinal',
    decanNumber: 3,
    startDegree: 200,
    endDegree: 210,
    startDegreeInSign: 20,
    endDegreeInSign: 30,
    ruler: 'Jupiter',
    name: 'The Wedding',
    image: 'Two souls joined in cosmic celebration, union blessed by divine',
    archetype: 'The Sacred Union',
    symbolism: 'Joyful partnership, expanded relating, blessed union',
    tarotCard: '4 of Swords',
    tarotSuit: 'Swords',
    tarotNumber: 4,
    spiralogicElement: 'air',
    spiralogicPhase: 1,
    spiralogicMicroPhase: 'integrates',
    alchemicalStage: 'Sublimatio celebrates - relationship becomes blessing',
    consciousnessLayer: 'Conscious partnership celebration',
    brainActivation: 'Left Prefrontal - relational expansion and joy',
    natalMeaning: 'Born for joyful sacred union. Natural ability to create blessed partnerships that expand both souls.',
    transitMeaning: 'Time to CELEBRATE relationship. Bless your unions. Expand through partnership. Marry the beloved.',
    gifts: ['Joyful union', 'Sacred marriage', 'Partnership expansion', 'Blessed relating', 'Celebratory love'],
    challenges: ['Relationship idealism', 'Over-investment in partnership', 'Loss of self in union', 'Co-dependency', 'Honeymoon addiction'],
    magicalPower: 'Grants sacred union, joy, and blessed partnership. Invokes Jupiter for relationship expansion.',
    ritualTiming: 'October 13-22 (Sun transit). Thursday during Libra season. Handfasting. Wedding ceremonies.',
  },

  // ============================================================================
  // AIR ELEMENT - AQUARIUS (Fixed Air, Phase 2: Collective and Collaborative Dynamics)
  // ============================================================================

  {
    sign: 'Aquarius',
    signSymbol: '♒',
    element: 'Air',
    modality: 'Fixed',
    decanNumber: 1,
    startDegree: 300,
    endDegree: 310,
    startDegreeInSign: 0,
    endDegreeInSign: 10,
    ruler: 'Venus',
    name: 'The Network',
    image: 'Web of light connecting hearts across distance, beauty in connection',
    archetype: 'The Weaver',
    symbolism: 'Beautiful community, loving networks, aesthetic collaboration',
    tarotCard: '5 of Swords',
    tarotSuit: 'Swords',
    tarotNumber: 5,
    spiralogicElement: 'air',
    spiralogicPhase: 2,
    spiralogicMicroPhase: 'begins',
    alchemicalStage: 'Sublimatio networks - community as art form',
    consciousnessLayer: 'Meta-Conscious community building',
    brainActivation: 'Left Prefrontal - aesthetic collaboration',
    natalMeaning: 'Born to weave beautiful communities. Natural networker who creates aesthetic collaboration and loving connection.',
    transitMeaning: 'Time to WEAVE your network. Build beautiful community. Connect hearts. Create collaborative art.',
    gifts: ['Beautiful networking', 'Aesthetic collaboration', 'Loving community', 'Graceful connection', 'Social artistry'],
    challenges: ['Superficial networking', 'Social performance', 'Difficulty with conflict', 'Avoidance in groups', 'People-pleasing in community'],
    magicalPower: 'Grants networking, beauty, and social grace. Invokes Venus for community love.',
    ritualTiming: 'January 20-29 (Sun transit). Friday during Aquarius season. Community gatherings.',
  },

  {
    sign: 'Aquarius',
    signSymbol: '♒',
    element: 'Air',
    modality: 'Fixed',
    decanNumber: 2,
    startDegree: 310,
    endDegree: 320,
    startDegreeInSign: 10,
    endDegreeInSign: 20,
    ruler: 'Mercury',
    name: 'The Collective Mind',
    image: 'Infinite library of collective knowledge, minds joined in understanding',
    archetype: 'The Hive Mind',
    symbolism: 'Collective intelligence, shared knowledge, networked wisdom',
    tarotCard: '6 of Swords',
    tarotSuit: 'Swords',
    tarotNumber: 6,
    spiralogicElement: 'air',
    spiralogicPhase: 2,
    spiralogicMicroPhase: 'deepens',
    alchemicalStage: 'Sublimatio connects - individual mind joins collective',
    consciousnessLayer: 'Meta-Conscious collective thinking',
    brainActivation: 'Left Prefrontal - hive mind activation',
    natalMeaning: 'Born to access collective intelligence. Natural ability to think in networks and share knowledge across minds.',
    transitMeaning: 'Time to THINK collectively. Access the hive mind. Share knowledge freely. Join the network consciousness.',
    gifts: ['Collective intelligence', 'Network thinking', 'Shared wisdom', 'Group genius', 'Democratic knowledge'],
    challenges: ['Loss of individual thought', 'Groupthink', 'Information overload', 'Detachment from body', 'Mental hive dependency'],
    magicalPower: 'Grants collective intelligence and network wisdom. Invokes Mercury for hive mind access.',
    ritualTiming: 'January 30-February 8 (Sun transit). Wednesday during Aquarius season. Knowledge sharing circles.',
  },

  {
    sign: 'Aquarius',
    signSymbol: '♒',
    element: 'Air',
    modality: 'Fixed',
    decanNumber: 3,
    startDegree: 320,
    endDegree: 330,
    startDegreeInSign: 20,
    endDegreeInSign: 30,
    ruler: 'Moon',
    name: 'The Revolution',
    image: 'Lightning strike awakening collective heart, revolution of love',
    archetype: 'The Revolutionary',
    symbolism: 'Collective awakening, emotional revolution, utopian vision',
    tarotCard: '7 of Swords',
    tarotSuit: 'Swords',
    tarotNumber: 7,
    spiralogicElement: 'air',
    spiralogicPhase: 2,
    spiralogicMicroPhase: 'integrates',
    alchemicalStage: 'Sublimatio awakens - collective heart activated',
    consciousnessLayer: 'Meta-Conscious revolutionary awareness',
    brainActivation: 'Left Prefrontal - utopian vision manifesting',
    natalMeaning: 'Born to awaken collective consciousness. Natural revolutionary who feels the future and catalyzes group transformation.',
    transitMeaning: 'Time to AWAKEN the collective. Revolution of the heart. Break old paradigms. Birth the future.',
    gifts: ['Collective awakening', 'Revolutionary vision', 'Utopian feeling', 'Group catalyst', 'Future consciousness'],
    challenges: ['Revolutionary zeal', 'Detachment from present', 'Forcing change', 'Utopian idealism', 'Collective burnout'],
    magicalPower: 'Grants revolution, awakening, and future vision. Invokes Moon for collective heart activation.',
    ritualTiming: 'February 9-18 (Sun transit). Monday during Aquarius season. Revolutionary gatherings. Protest magic.',
  },

  // ============================================================================
  // AIR ELEMENT - GEMINI (Mutable Air, Phase 3: Codified Systems and Communications)
  // ============================================================================

  {
    sign: 'Gemini',
    signSymbol: '♊',
    element: 'Air',
    modality: 'Mutable',
    decanNumber: 1,
    startDegree: 60,
    endDegree: 70,
    startDegreeInSign: 0,
    endDegreeInSign: 10,
    ruler: 'Jupiter',
    name: 'The Teacher',
    image: 'Wise teacher surrounded by eager students, sharing knowledge joyfully',
    archetype: 'The Wisdom Teacher',
    symbolism: 'Expansive teaching, joyful learning, philosophical communication',
    tarotCard: '8 of Swords',
    tarotSuit: 'Swords',
    tarotNumber: 8,
    spiralogicElement: 'air',
    spiralogicPhase: 3,
    spiralogicMicroPhase: 'begins',
    alchemicalStage: 'Sublimatio teaches - wisdom becomes transmission',
    consciousnessLayer: 'Conscious wisdom sharing',
    brainActivation: 'Left Prefrontal - systematic teaching begins',
    natalMeaning: 'Born to teach wisdom joyfully. Natural educator who expands minds through generous knowledge sharing.',
    transitMeaning: 'Time to TEACH. Share your wisdom. Expand minds. Make learning joyful. Transmit knowledge.',
    gifts: ['Joyful teaching', 'Wisdom sharing', 'Expansive communication', 'Generous learning', 'Philosophical transmission'],
    challenges: ['Know-it-all syndrome', 'Over-teaching', 'Scattered instruction', 'Dogmatic wisdom', 'Preaching'],
    magicalPower: 'Grants teaching power and wisdom sharing. Invokes Jupiter for educational expansion.',
    ritualTiming: 'May 21-30 (Sun transit). Thursday during Gemini season. Teaching ceremonies.',
  },

  {
    sign: 'Gemini',
    signSymbol: '♊',
    element: 'Air',
    modality: 'Mutable',
    decanNumber: 2,
    startDegree: 70,
    endDegree: 80,
    startDegreeInSign: 10,
    endDegreeInSign: 20,
    ruler: 'Mars',
    name: 'The Messenger',
    image: 'Swift messenger carrying urgent news between worlds',
    archetype: 'The Herald',
    symbolism: 'Urgent communication, warrior words, decisive speech',
    tarotCard: '9 of Swords',
    tarotSuit: 'Swords',
    tarotNumber: 9,
    spiralogicElement: 'air',
    spiralogicPhase: 3,
    spiralogicMicroPhase: 'deepens',
    alchemicalStage: 'Sublimatio quickens - words become action',
    consciousnessLayer: 'Conscious active communication',
    brainActivation: 'Left Prefrontal - rapid systematic transmission',
    natalMeaning: 'Born to carry urgent messages. Natural herald who communicates with courage and decisiveness.',
    transitMeaning: 'Time to SPEAK with power. Deliver your message. Communicate decisively. Take verbal action.',
    gifts: ['Courageous communication', 'Swift messaging', 'Decisive speech', 'Warrior words', 'Active transmission'],
    challenges: ['Aggressive communication', 'Cutting words', 'Mental warfare', 'Impatient messaging', 'Verbal combat'],
    magicalPower: 'Grants swift communication and courageous speech. Invokes Mars for warrior words.',
    ritualTiming: 'May 31-June 9 (Sun transit). Tuesday during Gemini season. Communication rituals.',
  },

  {
    sign: 'Gemini',
    signSymbol: '♊',
    element: 'Air',
    modality: 'Mutable',
    decanNumber: 3,
    startDegree: 80,
    endDegree: 90,
    startDegreeInSign: 20,
    endDegreeInSign: 30,
    ruler: 'Sun',
    name: 'The Scribe of Light',
    image: 'Golden scribe recording divine truth, illuminating knowledge',
    archetype: 'The Illuminator',
    symbolism: 'Radiant knowledge, conscious communication, enlightened teaching',
    tarotCard: '10 of Swords',
    tarotSuit: 'Swords',
    tarotNumber: 10,
    spiralogicElement: 'air',
    spiralogicPhase: 3,
    spiralogicMicroPhase: 'integrates',
    alchemicalStage: 'Sublimatio completes - communication becomes light',
    consciousnessLayer: 'Conscious illuminated knowing',
    brainActivation: 'Left Prefrontal - complete systematic enlightenment',
    natalMeaning: 'Born to illuminate through communication. Natural light-bringer who makes knowledge radiant and transforms minds.',
    transitMeaning: 'Time to ILLUMINATE. Make knowledge light. Enlighten through words. Complete the teaching.',
    gifts: ['Illuminating communication', 'Enlightened teaching', 'Radiant knowledge', 'Consciousness transmission', 'Golden words'],
    challenges: ['Intellectual superiority', 'Blinding with brilliance', 'Mental burnout', 'Communication overwhelm', 'End of cycle exhaustion'],
    magicalPower: 'Grants illumination, enlightenment, and radiant teaching. Invokes Sun for golden knowledge.',
    ritualTiming: 'June 10-20 (Sun transit). Sunday during Gemini season. Summer Solstice eve. Illumination ceremonies.',
  },
];

/**
 * Helper function to get decan by absolute degree (0-360)
 */
export function getDecanByDegree(absoluteDegree: number): Decan | undefined {
  const normalizedDegree = absoluteDegree % 360;
  return DECANS.find(
    (decan) => normalizedDegree >= decan.startDegree && normalizedDegree < decan.endDegree
  );
}

/**
 * Helper function to get decan by sign and degree within sign
 */
export function getDecanBySignAndDegree(sign: string, degreeInSign: number): Decan | undefined {
  return DECANS.find(
    (decan) =>
      decan.sign === sign &&
      degreeInSign >= decan.startDegreeInSign &&
      degreeInSign < decan.endDegreeInSign
  );
}

/**
 * Helper function to get all decans for a specific sign
 */
export function getDecansBySign(sign: string): Decan[] {
  return DECANS.filter((decan) => decan.sign === sign);
}

/**
 * Helper function to get all decans for a specific element
 */
export function getDecansByElement(element: Element): Decan[] {
  return DECANS.filter((decan) => decan.element === element);
}

/**
 * Helper function to get all decans ruled by a specific planet
 */
export function getDecansByRuler(ruler: PlanetaryRuler): Decan[] {
  return DECANS.filter((decan) => decan.ruler === ruler);
}

/**
 * Helper function to get decan for a specific tarot card
 */
export function getDecanByTarot(tarotCard: string): Decan | undefined {
  return DECANS.find((decan) => decan.tarotCard === tarotCard);
}

/**
 * Helper function to interpret planet in decan
 */
export function interpretPlanetInDecan(
  planet: string,
  decan: Decan
): string {
  return `${planet} in ${decan.name} (${decan.sign} ${decan.signSymbol} Decan ${decan.decanNumber}):

Your ${planet.toLowerCase()} energy activates the ${decan.ruler}-ruled decan of "${decan.name}."

${decan.natalMeaning}

Archetype: ${decan.archetype}
Symbolism: ${decan.symbolism}

Spiralogic Integration:
- Element: ${decan.spiralogicElement.charAt(0).toUpperCase() + decan.spiralogicElement.slice(1)}
- Phase: ${decan.spiralogicPhase} (${decan.spiralogicMicroPhase})
- Alchemical: ${decan.alchemicalStage}
- Brain: ${decan.brainActivation}
- Consciousness: ${decan.consciousnessLayer}

Tarot: ${decan.tarotCard} - ${decan.tarotSuit}

Gifts: ${decan.gifts.join(', ')}
Challenges: ${decan.challenges.join(', ')}

${decan.magicalPower}`;
}

export default DECANS;
