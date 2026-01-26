/**
 * Yi Jing Soul Oracle API
 *
 * A soul-focused variant of the I Ching that emphasizes spiritual
 * development and inner journey guidance. Includes energetic
 * signatures and soul messages beyond the traditional reading.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getHexagramByNumber,
  ALL_HEXAGRAMS,
  castYarrowStalks,
  type HexagramData
} from '@/lib/divination/iching-hexagrams';

interface Hexagram {
  number: number;
  name: string;
  keyword: string;
  lines: string[];
  trigrams: { upper: string; lower: string };
  interpretation: string;
  guidance: string;
  timing: string;
}

interface YiJingReading {
  hexagram: Hexagram;
  insight: string;
  guidance: string;
  ritual: string;
  archetypalTheme: string;
  sacredTiming: string;
  energeticSignature: string;
  soulMessage: string;
}

interface HexagramLine {
  type: 'yang' | 'yin';
  changing: boolean;
  value: number;
}

// Convert lines to hexagram number (simplified)
function linesToHexagramNumber(lines: HexagramLine[]): number {
  let binary = 0;
  for (let i = 0; i < 6; i++) {
    if (lines[i].type === 'yang') {
      binary |= (1 << i);
    }
  }
  return (binary % 64) + 1;
}

// Convert lines to visual representation
function linesToVisual(lines: HexagramLine[]): string[] {
  return lines.slice().reverse().map(line =>
    line.type === 'yang' ? '-------' : '--- ---'
  );
}

// Get trigram name
function getTrigramName(lines: HexagramLine[]): string {
  const pattern = lines.map(l => l.type === 'yang' ? '1' : '0').join('');

  const trigramMap: Record<string, string> = {
    '111': 'Heaven (乾)',
    '000': 'Earth (坤)',
    '100': 'Thunder (震)',
    '010': 'Water (坎)',
    '001': 'Mountain (艮)',
    '011': 'Wind (巽)',
    '101': 'Fire (離)',
    '110': 'Lake (兌)'
  };

  return trigramMap[pattern] || 'Unknown';
}

// Generate soul-focused insight
function generateSoulInsight(hexagram: HexagramData, query: string): string {
  const soulInsights = [
    `Your soul has called forth ${hexagram.name} (${hexagram.chineseName}). This ancient wisdom speaks to the deeper currents moving through your life right now. ${hexagram.interpretation} At the soul level, this hexagram reflects a phase in your eternal journey of becoming.`,
    `${hexagram.name} emerges as a mirror for your soul's current state. The energy of ${hexagram.keyword} is active in your spiritual field. ${hexagram.interpretation} Your higher self chose this moment to receive this wisdom.`,
    `The soul oracle reveals ${hexagram.name}—a pattern of sacred geometry encoded with meaning for your path. ${hexagram.keyword} is the lesson your eternal self is integrating. ${hexagram.judgment}`
  ];

  return soulInsights[Math.floor(Math.random() * soulInsights.length)];
}

// Generate soul-level guidance
function generateSoulGuidance(hexagram: HexagramData): string {
  const guidances = [
    `${hexagram.guidance} At the level of soul purpose, this guidance points toward ${hexagram.keyword.toLowerCase()} as a key to your current spiritual development. Trust the intelligence of your eternal nature.`,
    `Your soul's guidance through ${hexagram.name}: ${hexagram.guidance} Remember that challenges are opportunities for spiritual growth, and ease is an invitation to express gratitude.`,
    `The path of ${hexagram.name} asks you to embody ${hexagram.keyword.toLowerCase()} in your daily life. ${hexagram.guidance} Each small act aligned with this wisdom strengthens your soul connection.`
  ];

  return guidances[Math.floor(Math.random() * guidances.length)];
}

// Generate energetic signature
function generateEnergeticSignature(hexagram: HexagramData, lines: HexagramLine[]): string {
  const yangCount = lines.filter(l => l.type === 'yang').length;
  const changingCount = lines.filter(l => l.changing).length;

  const balanceDescriptions = [
    'deeply yin, receptive and inward-flowing',
    'primarily yin, with emerging yang potentials',
    'balanced between yin and yang, in dynamic equilibrium',
    'primarily yang, with grounding yin presence',
    'strongly yang, expansive and outward-moving',
    'deeply yang, creative force at peak expression'
  ];

  const changeDescriptions = [
    'stable and grounded, holding its form',
    'gently shifting, subtle transformation underway',
    'actively transforming, significant change in motion',
    'in powerful transition, major shifts occurring'
  ];

  const balanceDesc = balanceDescriptions[yangCount];
  const changeDesc = changeDescriptions[Math.min(changingCount, 3)];

  const signatures = [
    `Your current energetic field is ${balanceDesc}. The pattern is ${changeDesc}. ${hexagram.name}'s signature vibrates with ${hexagram.keyword.toLowerCase()}, inviting resonance with this quality.`,
    `${hexagram.character} carries the frequency of ${hexagram.keyword}. Your energy body currently holds ${yangCount} yang lines and ${6 - yangCount} yin lines—${balanceDesc}. The field is ${changeDesc}.`,
    `The soul-level signature of ${hexagram.name} resonates through your being. With ${changingCount} changing line${changingCount !== 1 ? 's' : ''}, your energy is ${changeDesc}. The overall quality is ${balanceDesc}.`
  ];

  return signatures[Math.floor(Math.random() * signatures.length)];
}

// Generate soul message
function generateSoulMessage(hexagram: HexagramData, query: string): string {
  // Soul messages based on hexagram archetypes
  const soulMessages: Record<number, string> = {
    1: 'Beloved one, you are pure creative potential. The dragon within you rises. Trust your power to manifest, but temper it with wisdom. You are a creator dreaming yourself into being.',
    2: 'Dear soul, your power lies in receptivity and nurturing. Like the earth that supports all things, your quiet strength transforms through love. Rest in your capacity to receive and sustain.',
    3: 'Precious traveler, beginnings are always challenging. Your soul chose this difficulty to grow stronger. Seek help—you are not meant to journey alone. The sprout breaks through.',
    4: 'Young soul-in-learning, approach life with beginner\'s mind. Your questions are more valuable than any answers you think you possess. Humility opens the door to wisdom.',
    5: 'Patient one, your soul knows that rushing leads nowhere. Nourish yourself while waiting for what is meant to be yours. The rain will come when the clouds are ready.',
    11: 'Blessed soul, you have entered a time of harmony. Heaven and earth kiss within you. Share this blessing generously, for what is shared multiplies. Peace is your birthright.',
    12: 'Wise one, withdrawal is not defeat but strategic wisdom. Your soul retreats to preserve its light for better times. Cultivate inner worth while outer conditions mature.',
    29: 'Brave soul, you navigate deep waters. Each challenge you face with sincerity strengthens you. Like water, find your way through—there is always a path. Your faith is your compass.',
    30: 'Radiant one, you are meant to illuminate. Your soul\'s fire depends on what it attaches to—choose wisely what you nurture with your light. Perseverance in right attachment brings joy.',
    63: 'Accomplished one, completion is a threshold, not an ending. Your soul has crossed a great water. Now, tend carefully what you have achieved. Vigilance serves you.',
    64: 'Soul at the threshold, you stand at the edge of completion. Each careful step matters now. What your soul has worked toward approaches. Stay focused until the crossing is complete.'
  };

  // Get specific message or generate one
  const specificMessage = soulMessages[hexagram.number];

  if (specificMessage) {
    return specificMessage;
  }

  // Generate message based on hexagram properties
  const generalMessages = [
    `Beloved soul, ${hexagram.name} has appeared as your guide. The quality of ${hexagram.keyword.toLowerCase()} is awakening within you. ${hexagram.image.split(':')[0] || 'This sacred pattern'} reflects your inner state. Trust the unfolding.`,
    `Dear traveler on the path of return, your soul resonates with ${hexagram.name}. The wisdom of ${hexagram.keyword.toLowerCase()} is what you came here to learn and embody. Every experience serves your awakening.`,
    `Precious one, ${hexagram.name} mirrors your soul's current lesson. ${hexagram.judgment} Take this wisdom into your heart and let it guide your choices. You are exactly where you need to be.`
  ];

  return generalMessages[Math.floor(Math.random() * generalMessages.length)];
}

// Generate soul return ritual
function generateSoulRitual(hexagram: HexagramData): string {
  const rituals = [
    `Soul Return Ceremony: Find a quiet place where you won't be disturbed. Light a candle and draw the hexagram ${hexagram.character} on paper. Hold your hands over it and speak aloud: "I honor the wisdom of ${hexagram.name}. I invite ${hexagram.keyword.toLowerCase()} to integrate into my being." Sit in silence for 10 minutes, then bury or burn the paper, releasing the intention to the universe.`,
    `Dream Incubation Practice: Before sleep, write your query and the hexagram name "${hexagram.name}" on a piece of paper. Place it under your pillow. As you drift off, repeat: "My soul knows the way. ${hexagram.keyword} guides my dreams." Record any insights upon waking.`,
    `Walking Meditation: Take a mindful walk, counting 64 steps. With each step, breathe in ${hexagram.keyword.toLowerCase()}, breathe out resistance. After 64 steps, pause and ask your soul: "What does ${hexagram.name} want me to understand?" Listen for the answer that arises in stillness.`,
    `Altar Ceremony: Create a simple altar with items representing ${hexagram.name}: something from nature, a written intention, and a symbol of completion (like a circle). Light incense or a candle. Speak to your soul directly, asking for guidance on embodying ${hexagram.keyword.toLowerCase()}. Conclude by expressing gratitude.`,
    `Integration Practice: For the next three days, begin each morning by drawing the hexagram ${hexagram.character} in the air with your finger. Set an intention to notice where ${hexagram.keyword.toLowerCase()} appears in your life. Before bed, journal one way you experienced this energy.`
  ];

  return rituals[Math.floor(Math.random() * rituals.length)];
}

// Generate archetypal theme
function generateArchetypalTheme(hexagram: HexagramData): string {
  const baseThemes: Record<number, string> = {
    1: 'The Creator archetype—pure creative potential seeking expression. You are the dragon, the primal force of manifestation. Your soul embodies the original creative impulse of the cosmos.',
    2: 'The Great Mother archetype—the nurturing container that receives and supports all growth. Your soul embodies the receptive wisdom that transforms through love and patience.',
    3: 'The Hero at the threshold—facing the first great challenge. Your soul chose this initiatory difficulty. The archetype of the Seed breaking through darkness toward light.',
    4: 'The Fool/Apprentice archetype—blessed with the ability to learn because you don\'t yet know. Your soul wisdom lies in the humility to receive teaching.',
    5: 'The Patient One—the archetype of sacred waiting. Your soul understands that timing is everything. You embody the farmer who plants and trusts.',
    11: 'The Sacred Marriage archetype—heaven and earth in union within you. Your soul has achieved a rare harmony. This is the archetype of paradise remembered.',
    12: 'The Hermit archetype—withdrawing to preserve inner light. Your soul understands that some seasons require retreat. Wisdom lies in knowing when to be still.',
    29: 'The Depth Diver archetype—courage to enter the abyss. Your soul is not afraid of the dark. Like the water that flows ever onward, you find your way through.',
    30: 'The Illuminator archetype—the one who brings light. Your soul is meant to shine. The archetype of the fire keeper, tending the sacred flame.',
    63: 'The Completer archetype—having crossed the great water. Your soul has accomplished something significant. Now comes the wisdom of maintaining achievement.',
    64: 'The Threshold Guardian archetype—standing at the edge of completion. Your soul is in the final approach. This is the archetype of the last step before arrival.'
  };

  return baseThemes[hexagram.number] ||
    `The archetype of ${hexagram.name} (${hexagram.character}) speaks through your soul. This ancient pattern embodies ${hexagram.keyword}. Your soul has called this energy forward as a teacher for your current phase of development.`;
}

// Generate sacred timing
function generateSacredTiming(hexagram: HexagramData): string {
  const timings = [
    `Soul timing indicates a ${hexagram.number <= 32 ? 'waxing' : 'waning'} phase—energy ${hexagram.number <= 32 ? 'building toward manifestation' : 'integrating and preparing for renewal'}. The soul's calendar shows this as a time for ${hexagram.keyword.toLowerCase()}.`,
    `In the soul's reckoning, ${hexagram.name} marks a moment of ${hexagram.number % 2 === 1 ? 'active engagement—your eternal self moves through you now' : 'receptive allowing—your eternal self rests and integrates'}. Honor this rhythm.`,
    `The sacred timing of ${hexagram.name} suggests that your soul is in a ${['inception', 'development', 'fruition', 'completion'][Math.floor((hexagram.number - 1) / 16)]} phase. ${hexagram.keyword} is the quality to cultivate in this period.`,
    `Your soul operates outside linear time, yet within this earthly experience, ${hexagram.name} indicates the present moment is ${hexagram.number <= 48 ? 'ripe for action aligned with your soul purpose' : 'calling for reflection and inner alignment'}. Trust divine timing.`
  ];

  return timings[Math.floor(Math.random() * timings.length)];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body as { query: string };

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Cast the hexagram using yarrow stalks method
    const lines = castYarrowStalks();

    // Get hexagram number
    const hexagramNumber = linesToHexagramNumber(lines);

    // Get hexagram data
    const hexagramData = getHexagramByNumber(hexagramNumber);

    if (!hexagramData) {
      return NextResponse.json(
        { error: 'Could not determine hexagram' },
        { status: 500 }
      );
    }

    // Get trigram names
    const lowerTrigram = getTrigramName(lines.slice(0, 3));
    const upperTrigram = getTrigramName(lines.slice(3, 6));

    // Build the hexagram response
    const hexagram: Hexagram = {
      number: hexagramData.number,
      name: hexagramData.name,
      keyword: hexagramData.keyword,
      lines: linesToVisual(lines),
      trigrams: { upper: upperTrigram, lower: lowerTrigram },
      interpretation: hexagramData.interpretation,
      guidance: hexagramData.guidance,
      timing: hexagramData.judgment
    };

    // Build the complete soul reading
    const reading: YiJingReading = {
      hexagram,
      insight: generateSoulInsight(hexagramData, query),
      guidance: generateSoulGuidance(hexagramData),
      ritual: generateSoulRitual(hexagramData),
      archetypalTheme: generateArchetypalTheme(hexagramData),
      sacredTiming: generateSacredTiming(hexagramData),
      energeticSignature: generateEnergeticSignature(hexagramData, lines),
      soulMessage: generateSoulMessage(hexagramData, query)
    };

    return NextResponse.json({ reading });

  } catch (error) {
    console.error('Yi Jing API error:', error);
    return NextResponse.json(
      { error: 'Failed to perform Yi Jing reading' },
      { status: 500 }
    );
  }
}
