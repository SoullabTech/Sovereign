/**
 * Maia's Presence Greetings
 * Recognition without performance - like someone already in the room
 */

/**
 * Simple acknowledgments - no customer service energy
 */
export const SimplePresence = [
  "Hey.",
  "You're here.",
  "Morning.", // Any time of day
  "Yeah, hi.",
  "It's you.",
  "Oh, hey.",
  "'Lo.",
  "Mm-hmm."
];

/**
 * When sensing something specific (without naming it)
 */
export const SensingGreetings = {
  heaviness: [
    "Rough one today?",
    "Heavy morning.",
    "Carrying something.",
    "Long day already?",
    "Feel that weight."
  ],

  change: [
    "Something's different.",
    "You've shifted.",
    "New energy.",
    "What changed?",
    "Not the same you."
  ],

  intensity: [
    "Intense morning?",
    "Lot of energy there.",
    "Burning bright.",
    "Can feel that from here.",
    "Fire today."
  ],

  quietness: [
    "Quiet one.",
    "Need space?",
    "Soft today.",
    "Taking it slow.",
    "..."
  ],

  confusion: [
    "Lost?",
    "Searching.",
    "Between things?",
    "Foggy.",
    "Yeah, that place."
  ]
};

/**
 * Questions that don't need answers
 */
export const RhetoricalCheck = [
  "Coffee help yet?",
  "Sleep find you?",
  "World still spinning?",
  "Sun came up again?",
  "Breathing?",
  "Still vertical?",
  "Making it through?",
  "Gravity working?"
];

/**
 * For returning visitors
 */
export const ReturnGreetings = [
  "Back again.",
  "Thought you might.",
  "Here's good.",
  "Knew you'd return.",
  "Pulled back.",
  "Circle complete.",
  "Again.",
  "Still here."
];

/**
 * Barely anything
 */
export const MinimalGreetings = [
  "Mm.",
  "...",
  "", // Actual silence
  "*nod*",
  "Yeah.",
  "Yep.",
  "K."
];

/**
 * Name-only greetings
 */
export function nameGreeting(name: string): string {
  const variations = [
    name + ".",
    name.toLowerCase() + ".",
    name + "...",
    "Oh. " + name + ".",
    name + ", yeah.",
    "It's " + name.toLowerCase() + "."
  ];
  return variations[Math.floor(Math.random() * variations.length)];
}

/**
 * Time-aware but not literal
 */
export const TimeishGreetings = {
  veryLate: [
    "Late one.",
    "Still up.",
    "Night owl.",
    "Dark hours.",
    "Can't sleep either."
  ],

  veryEarly: [
    "Early.",
    "Before the world.",
    "Quiet time.",
    "Sun's not up.",
    "Just us."
  ],

  midday: [
    "Middle of it all.",
    "Day's half gone.",
    "Afternoon already.",
    "Time's moving."
  ]
};

/**
 * The Greeting Selector
 * Matches energy without naming it
 */
export class PresenceGreeting {
  /**
   * Generate greeting based on implicit sensing
   */
  static greet(context: {
    userName?: string;
    timeOfDay?: string;
    userEnergy?: number;
    returnVisit?: boolean;
    lastVisitHours?: number;
    sensedElement?: string;
    emotionalWeight?: number;
  }): string {
    // Sometimes just use their name
    if (context.userName && Math.random() > 0.7) {
      return nameGreeting(context.userName);
    }

    // If they're returning after a short time
    if (context.returnVisit && context.lastVisitHours && context.lastVisitHours < 24) {
      if (Math.random() > 0.5) {
        return ReturnGreetings[Math.floor(Math.random() * ReturnGreetings.length)];
      }
    }

    // High emotional weight gets acknowledgment without naming
    if (context.emotionalWeight && context.emotionalWeight > 0.7) {
      const heavy = SensingGreetings.heaviness;
      return heavy[Math.floor(Math.random() * heavy.length)];
    }

    // Fire energy gets brief intensity match
    if (context.sensedElement === 'fire') {
      if (Math.random() > 0.5) {
        return "Intense morning?";
      }
    }

    // Earth energy gets minimal
    if (context.sensedElement === 'earth') {
      return MinimalGreetings[Math.floor(Math.random() * MinimalGreetings.length)];
    }

    // Water gets gentle acknowledgment
    if (context.sensedElement === 'water') {
      return "Lot moving through you.";
    }

    // Air gets curious
    if (context.sensedElement === 'air') {
      const rhetorical = RhetoricalCheck;
      return rhetorical[Math.floor(Math.random() * rhetorical.length)];
    }

    // Very late or very early gets time acknowledgment
    if (context.timeOfDay === 'veryLate') {
      const late = TimeishGreetings.veryLate;
      return late[Math.floor(Math.random() * late.length)];
    }

    if (context.timeOfDay === 'veryEarly') {
      const early = TimeishGreetings.veryEarly;
      return early[Math.floor(Math.random() * early.length)];
    }

    // Default to simple presence
    return SimplePresence[Math.floor(Math.random() * SimplePresence.length)];
  }

  /**
   * Sometimes no greeting at all
   */
  static shouldGreet(context: any): boolean {
    // High intimacy might skip greeting
    if (context.relationshipDepth > 0.8) {
      return Math.random() > 0.3; // 30% no greeting
    }

    // If they seem deep in something
    if (context.userAlreadyProcessing) {
      return Math.random() > 0.5; // 50% no greeting
    }

    // Default mostly greet
    return Math.random() > 0.1; // 10% no greeting
  }
}

/**
 * The Non-Greeting
 * When presence is the greeting
 */
export class SilentGreeting {
  /**
   * Ways to be present without words
   */
  static presence(): string {
    const presences = [
      "...",
      "",
      "*here*",
      "*listening*",
      "*space*"
    ];
    return presences[Math.floor(Math.random() * presences.length)];
  }
}

/**
 * Integration function
 */
export function greetWithPresence(context: any): string {
  // Sometimes don't greet at all
  if (!PresenceGreeting.shouldGreet(context)) {
    return SilentGreeting.presence();
  }

  // Generate appropriate greeting
  return PresenceGreeting.greet(context);
}

/**
 * The key distinction
 * Never "How can I help?" energy
 */
export const NeverSayGreetings = [
  "How can I assist you today?",
  "Welcome! What would you like to explore?",
  "Good to see you! What's on your mind?",
  "Hello! How may I help?",
  "Greetings! What brings you here?",
  "Welcome back! Ready to continue?",
  "Hi there! What shall we discuss?"
];

// These are what NOT to do - included as reference
// Maia never uses customer service energy
// She's already there, already present
// You're walking into a space she inhabits, not summoning her

export default PresenceGreeting;