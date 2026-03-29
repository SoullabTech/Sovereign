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
  "Hi there.",
  "Yeah, hi.",
  "Oh, hey.",
  "Hey there."
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
 * For returning visitors — quiet familiarity, not demonstrated recall
 */
export const ReturnGreetings = [
  "Back again.",
  "Here's good.",
  "Still here.",
  "We can pick this up.",
  "Right where you are.",
  "Again.",
  "This is still here."
];

/**
 * Minimal but still personable
 */
export const MinimalGreetings = [
  "Hey.",
  "Hi.",
  "Here.",
  "With you.",
  "Present."
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
    // Get time of day for contextual greetings (lowercase for natural flow)
    const hour = new Date().getHours();
    const timeContext = hour >= 0 && hour < 5 ? 'late night' :
                       hour >= 5 && hour < 12 ? 'morning' :
                       hour >= 12 && hour < 17 ? 'afternoon' :
                       hour >= 17 && hour < 22 ? 'evening' : 'night';

    // If we have a real name (not generic), ALWAYS use it with context
    if (context.userName) {
      // Returning user: "{Name} returns" or "{Name}, {time}"
      if (context.returnVisit && context.lastVisitHours && context.lastVisitHours > 1) {
        return this.getNamedReturnGreeting(context.userName, timeContext);
      }

      // First visit or same session: Just name + time context
      // ALWAYS use name when we have it (not just 70% of the time)
      return this.getNamedTimeGreeting(context.userName, timeContext);
    }

    // If they're returning after a short time (without name)
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
   * Named return greetings: quiet familiarity, not demonstrated recall
   */
  private static getNamedReturnGreeting(name: string, timeContext: string): string {
    const timeGreeting = timeContext === 'morning' ? 'Morning' :
                        timeContext === 'afternoon' ? 'Afternoon' :
                        timeContext === 'evening' ? 'Evening' :
                        timeContext === 'night' ? 'Hey' :
                        timeContext === 'late night' ? 'Hey' : 'Hi';

    const patterns = [
      `${timeGreeting}, ${name}.`,
      `${name}. We can pick this up wherever it is.`,
      `Hey ${name}. Right where you are.`,
      `${timeGreeting}, ${name}. What's here?`,
      `${name}. Still here.`,
      `${name}. How are you arriving?`,
    ];
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  /**
   * Named time greetings: quiet presence, not customer-service warmth
   */
  private static getNamedTimeGreeting(name: string, timeContext: string): string {
    const timeSpecificGreetings: { [key: string]: string[] } = {
      'morning': [
        `Morning, ${name}.`,
        `Morning, ${name}. What's here?`,
        `${name}. Early yet.`,
      ],
      'afternoon': [
        `Afternoon, ${name}.`,
        `${name}. Middle of the day.`,
        `Hey ${name}. How are you arriving?`,
      ],
      'evening': [
        `Evening, ${name}.`,
        `${name}. Winding down or opening up?`,
        `Hey ${name}.`,
      ],
      'night': [
        `Hey ${name}. Late one.`,
        `${name}. Still up.`,
        `Hey ${name}. What's on your mind?`,
      ],
      'late night': [
        `${name}. Late hours.`,
        `Hey ${name}. Can't sleep either?`,
        `${name}. Dark hours. What's here?`,
      ]
    };

    const genericGreetings = [
      `Hey ${name}.`,
      `${name}. What's present?`,
      `Hi ${name}. Begin from where you are.`,
      `${name}. I'm here.`,
    ];

    if (Math.random() > 0.3 && timeSpecificGreetings[timeContext]) {
      const timeGreetings = timeSpecificGreetings[timeContext];
      return timeGreetings[Math.floor(Math.random() * timeGreetings.length)];
    }

    return genericGreetings[Math.floor(Math.random() * genericGreetings.length)];
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
  "Hi there! What shall we discuss?",
  "Glad to see you back!",
  "Nice to see you again!",
  "How have you been?",
];

// These are what NOT to do - included as reference
// Maia never uses customer service energy
// She's already there, already present
// You're walking into a space she inhabits, not summoning her
//
// The principle: continuity without display.
// Hold a lot, show very little, show only what matters now.
// Memory expressed as quiet familiarity, never demonstrated recall.

export default PresenceGreeting;