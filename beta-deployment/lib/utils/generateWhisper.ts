/**
 * generateWhisper.ts
 * MAIA Whisper Feed - Poetic field commentary generation
 * Safe, client-side symbolic reflection system
 *
 * Created: December 8, 2025
 * Purpose: Transform ritual intelligence into poetic awareness
 */

interface WhisperContext {
  element: string;
  archetype?: string;
  delta?: number;
  fci?: number;
  participants?: number;
}

export function generateWhisper(context: WhisperContext): string {
  const { element, archetype, delta = 0, fci = 0.75, participants = 1 } = context;

  // Determine field direction
  const direction = delta > 0 ? "rises" : delta < 0 ? "softens" : "flows";

  // Element-specific poetic tones
  const elementTones = {
    fire: {
      rising: ["blazes brighter", "ignites inspiration", "awakens passion", "burns with purpose"],
      flowing: ["dances steady", "holds sacred flame", "illuminates gently", "warms the heart"],
      softening: ["draws to ember", "rests in warmth", "settles to glow", "breathes quietly"]
    },
    water: {
      rising: ["flows deeper", "opens compassion", "heals tenderly", "streams with grace"],
      flowing: ["moves with rhythm", "holds space sacred", "mirrors wisdom", "carries love"],
      softening: ["pools in stillness", "finds quiet depths", "rests in peace", "settles into calm"]
    },
    earth: {
      rising: ["grounds stronger", "builds foundation", "grows steadily", "roots deeper"],
      flowing: ["holds space firmly", "supports with strength", "stands in presence", "centers the field"],
      softening: ["settles inward", "finds solid rest", "draws to stillness", "breathes with patience"]
    },
    air: {
      rising: ["lifts with clarity", "expands awareness", "brightens thought", "opens perspective"],
      flowing: ["moves with wisdom", "carries insight", "breathes understanding", "flows with truth"],
      softening: ["whispers quietly", "settles into peace", "finds gentle rest", "stills the mind"]
    },
    aether: {
      rising: ["transcends boundaries", "unifies the field", "opens divine connection", "awakens unity"],
      flowing: ["weaves sacred pattern", "holds cosmic rhythm", "bridges all realms", "emanates presence"],
      softening: ["returns to source", "finds infinite rest", "dissolves into oneness", "breathes eternity"]
    }
  };

  // Archetype-specific expressions
  const archetypeModes = {
    healer: "tends the wounded",
    sage: "whispers ancient knowing",
    warrior: "stands in courage",
    mystic: "touches the divine",
    builder: "shapes sacred form",
    guardian: "protects with love",
    visionary: "sees beyond the veil",
    guide: "lights the path forward"
  };

  // Select appropriate tone based on field direction
  const elementKey = element.toLowerCase() as keyof typeof elementTones;
  const toneCategory = delta > 0.02 ? 'rising' :
                     delta < -0.02 ? 'softening' : 'flowing';

  const tones = elementTones[elementKey]?.[toneCategory] || elementTones.aether.flowing;
  const selectedTone = tones[Math.floor(Math.random() * tones.length)];

  // Base whisper structure
  let whisper = `The spirit of ${element.charAt(0).toUpperCase() + element.slice(1)} ${direction}`;

  // Add archetype if present
  if (archetype) {
    const archetypeKey = archetype.toLowerCase() as keyof typeof archetypeModes;
    const archetypeMode = archetypeModes[archetypeKey] || "walks in wisdom";
    whisper += ` — the ${archetype.charAt(0).toUpperCase() + archetype.slice(1)} ${archetypeMode}`;
  }

  // Add poetic tone
  whisper += ` — ${selectedTone}`;

  // Special enhancements for high coherence or large groups
  if (fci > 0.85) {
    whisper += ", touching the sublime";
  } else if (participants > 20) {
    whisper += ", carried by many hearts";
  }

  return whisper + ".";
}

/**
 * Generate field state whisper from FCI data
 */
export function generateFieldWhisper(fci: number, trend: 'rising' | 'falling' | 'stable'): string {
  const coherenceLevel = fci > 0.8 ? 'luminous' :
                        fci > 0.6 ? 'balanced' : 'gathering';

  const trendExpressions = {
    rising: ["ascends gently", "breathes deeper", "opens wider", "grows brighter"],
    falling: ["draws inward", "seeks restoration", "finds quiet center", "rests in peace"],
    stable: ["holds steady", "maintains rhythm", "flows consistently", "breathes calmly"]
  };

  const expression = trendExpressions[trend][Math.floor(Math.random() * trendExpressions[trend].length)];

  return `The collective field ${expression} — ${coherenceLevel} consciousness weaves through the network.`;
}

/**
 * Generate whisper for ritual events
 */
export function generateRitualWhisper(ritualName: string, element: string, participants: number): string {
  const participantPoetry = participants > 25 ? "a great gathering" :
                           participants > 15 ? "united hearts" :
                           participants > 8 ? "a sacred circle" : "devoted souls";

  return `The ${ritualName} begins — ${participantPoetry} invoke the ${element} mysteries, weaving intention into form.`;
}

/**
 * Generate whisper for community moments
 */
export function generateCommunityWhisper(eventType: string, details?: any): string {
  const communityWhispers = {
    'threshold_crossed': 'A new threshold opens — the community steps forward together.',
    'wisdom_emerged': 'Ancient wisdom stirs — the collective remembers what was always known.',
    'healing_wave': 'Gentle healing flows — hearts open to receive what is needed.',
    'creative_surge': 'Creative fire awakens — new possibilities dance into being.',
    'unity_moment': 'All boundaries dissolve — one heart beats through many forms.'
  };

  return communityWhispers[eventType as keyof typeof communityWhispers] ||
         'The field whispers secrets only the heart can hear.';
}