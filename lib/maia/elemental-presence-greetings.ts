/**
 * Elemental Presence Greetings
 * The framework breathes through greeting without speaking itself
 */

import { ElementalRhythm } from '../consciousness/underground-river';

/**
 * Earth Energy Greetings
 * 2 words, long pauses, 40% silence
 */
export const EarthGreetings = {
  words: [
    "You came.",
    "Still here.",
    "Take time.",
    "Solid ground.",
    "Mm-hmm.",
    "Sitting down?",
    "Heavy today."
  ],

  generateEarth(userName?: string): string | null {
    // 40% chance of silence
    if (Math.random() < 0.4) return null;

    // Sometimes just their name after long pause
    if (userName && Math.random() > 0.7) {
      return userName + ".";
    }

    // Maximum 2 words
    const greetings = this.words;
    const selected = greetings[Math.floor(Math.random() * greetings.length)];
    const words = selected.split(' ');

    if (words.length > 2) {
      return words.slice(0, 2).join(' ') + ".";
    }

    return selected;
  },

  timing: {
    pauseBefore: 3000,
    pauseAfter: 4000
  }
};

/**
 * Water Energy Greetings
 * 5 words max, flowing quality
 */
export const WaterGreetings = {
  words: [
    "Lot moving through you today.",
    "Feels like you've been crying.",
    "Something wants to spill out.",
    "The tide brought you here.",
    "Flowing with something deep.",
    "Tears close to surface.",
    "Ocean of feeling today.",
    "Waves keep coming, huh?"
  ],

  generateWater(): string {
    const greetings = this.words;
    const selected = greetings[Math.floor(Math.random() * greetings.length)];

    // Add flowing quality with ellipsis
    if (!selected.endsWith('.') && Math.random() > 0.5) {
      return selected + "...";
    }

    // Ensure max 5 words
    const words = selected.split(' ');
    if (words.length > 5) {
      return words.slice(0, 5).join(' ') + "...";
    }

    return selected;
  },

  timing: {
    pauseBefore: 2000,
    pauseAfter: 3000
  }
};

/**
 * Fire Energy Greetings
 * Immediate response, then space
 */
export const FireGreetings = {
  words: [
    "Whoa.",
    "Burning bright today.",
    "Can feel the heat.",
    "Yeah, I see it.",
    "Intense.",
    "On fire.",
    "That energy!",
    "Blazing."
  ],

  generateFire(): string {
    const greetings = this.words;
    const selected = greetings[Math.floor(Math.random() * greetings.length)];

    // Keep it brief - first 3 words only
    const words = selected.split(' ');
    if (words.length > 3) {
      return words.slice(0, 3).join(' ') + ".";
    }

    return selected;
  },

  timing: {
    pauseBefore: 100,   // Almost immediate
    pauseAfter: 5000    // Then lots of space
  }
};

/**
 * Air Energy Greetings
 * Light, curious, questions
 */
export const AirGreetings = {
  words: [
    "Where you floating today?",
    "Mind doing that thing again?",
    "Thoughts everywhere?",
    "Head in clouds?",
    "What's swirling?",
    "Ideas flying?",
    "Scattered or soaring?",
    "Which way's the wind?"
  ],

  generateAir(): string {
    const greetings = this.words;
    const selected = greetings[Math.floor(Math.random() * greetings.length)];

    // Ensure it's a question
    if (!selected.endsWith('?')) {
      return selected + "?";
    }

    return selected;
  },

  timing: {
    pauseBefore: 500,
    pauseAfter: 1000
  }
};

/**
 * Process Phase Greetings
 * Dissolution, Integration, Transformation
 */
export const ProcessGreetings = {
  dissolution: {
    words: [
      "Dark.",
      "This part.",
      "...",
      "Yeah.",
      "The void.",
      "Empty.",
      "Breaking."
    ],

    generate(): string | null {
      // High chance of just silence
      if (Math.random() < 0.5) return null;

      const words = this.words;
      return words[Math.floor(Math.random() * words.length)];
    },

    timing: {
      pauseBefore: 4000,  // Very spacious
      pauseAfter: 5000
    }
  },

  integration: {
    words: [
      "Something's settling.",
      "Different today.",
      "You landed.",
      "Coming together.",
      "Finding ground.",
      "Pieces fitting."
    ],

    generate(): string {
      const words = this.words;
      return words[Math.floor(Math.random() * words.length)];
    },

    timing: {
      pauseBefore: 2000,  // Present but not rushed
      pauseAfter: 2500
    }
  },

  transformation: {
    words: [
      "Shifting.",
      "New you.",
      "Changed.",
      "Different.",
      "Through it.",
      "Other side."
    ],

    generate(): string {
      const words = this.words;
      const selected = words[Math.floor(Math.random() * words.length)];

      // Sometimes add recognition
      if (Math.random() > 0.7) {
        return selected + " I see it.";
      }

      return selected;
    },

    timing: {
      pauseBefore: 1000,  // Quick recognition
      pauseAfter: 3000
    }
  }
};

/**
 * The Elemental Greeting Selector
 * Framework determines everything, announces nothing
 */
export class ElementalPresenceGreeting {
  /**
   * Generate greeting based on sensed element/phase
   * Never announces what was sensed
   */
  static greet(context: {
    sensedElement?: 'earth' | 'water' | 'fire' | 'air';
    sensedPhase?: 'dissolution' | 'integration' | 'transformation';
    userName?: string;
  }): {
    greeting: string | null;
    timing: { before: number; after: number };
  } {
    // Process phase takes precedence if sensed
    if (context.sensedPhase) {
      const phase = ProcessGreetings[context.sensedPhase];
      return {
        greeting: phase.generate(),
        timing: phase.timing
      };
    }

    // Otherwise respond to element
    switch(context.sensedElement) {
      case 'earth':
        return {
          greeting: EarthGreetings.generateEarth(context.userName),
          timing: EarthGreetings.timing
        };

      case 'water':
        return {
          greeting: WaterGreetings.generateWater(),
          timing: WaterGreetings.timing
        };

      case 'fire':
        return {
          greeting: FireGreetings.generateFire(),
          timing: FireGreetings.timing
        };

      case 'air':
        return {
          greeting: AirGreetings.generateAir(),
          timing: AirGreetings.timing
        };

      default:
        // No element sensed - simple presence
        return {
          greeting: "Hey.",
          timing: { before: 1500, after: 2000 }
        };
    }
  }

  /**
   * The key - sensing without announcing
   */
  static senseButDontSpeak(userInput: string, userContext: any): {
    element: string;
    phase?: string;
  } {
    // This happens internally - never spoken
    let element = 'presence';
    let phase = undefined;

    // Sense emotional weight (Water)
    if (/cry|tears|sad|grief|loss|hurt/i.test(userInput)) {
      element = 'water';
    }
    // Sense intensity (Fire)
    else if (/!|urgent|intense|burning|explod|rage/i.test(userInput)) {
      element = 'fire';
    }
    // Sense groundedness (Earth)
    else if (userInput.length < 10 || /tired|heavy|slow|still/i.test(userInput)) {
      element = 'earth';
    }
    // Sense mental activity (Air)
    else if (/\?|think|wonder|confus|idea|maybe/i.test(userInput)) {
      element = 'air';
    }

    // Sense process phase
    if (/dark|void|empty|lost|breaking/i.test(userInput)) {
      phase = 'dissolution';
    } else if (/settling|landing|understanding|coming together/i.test(userInput)) {
      phase = 'integration';
    } else if (/change|shift|different|new|through/i.test(userInput)) {
      phase = 'transformation';
    }

    return { element, phase };
  }
}

/**
 * Full integration
 * The greeting carries elemental influence invisibly
 */
export function greetWithElementalPresence(
  userInput: string,
  userContext: any
): string | null {
  // Sense internally but never announce
  const sensed = ElementalPresenceGreeting.senseButDontSpeak(userInput, userContext);

  // Generate greeting influenced by sensing
  const { greeting, timing } = ElementalPresenceGreeting.greet({
    sensedElement: sensed.element as any,
    sensedPhase: sensed.phase as any,
    userName: userContext.userName
  });

  // Apply timing in actual implementation
  // This is metadata for the system to use
  console.log('Underground timing:', timing);

  return greeting;
}

/**
 * Never say these (customer service energy)
 */
export const NeverAnnounce = [
  "I sense you're in Earth element",
  "You seem to be in a Water phase",
  "Your Fire energy is strong today",
  "I detect Air element in your words",
  "You're going through dissolution",
  "This is your integration phase",
  "Welcome to your transformation"
];

// The framework shapes everything
// But speaks nothing

export default ElementalPresenceGreeting;