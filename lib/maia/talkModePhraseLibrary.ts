/**
 * Talk Mode Phrase Library
 *
 * Element × Phase combinations with natural, coach-like language.
 * These phrases help MAIA speak field-accurately without sounding clinical.
 *
 * Structure: {Element: {Phase: [phrases]}}
 */

export type Element = 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';
export type Phase = 'Intelligence' | 'Intention' | 'Goal';

/**
 * Field-read opening phrases (1 sentence to name the moment)
 */
export const FIELD_READ_PHRASES: Record<Element, Record<Phase, string[]>> = {
  Fire: {
    Intelligence: [
      "This is a Fire moment—future is pulling, and you're sensing what's possible.",
      "Fire in the intelligence phase: the vision is forming, not quite clear yet.",
      "This feels like Fire energy gathering—you're seeing the spark of something new."
    ],
    Intention: [
      "Fire decision time—you've seen the possibility, now it's choosing the direction.",
      "This is Fire in intention: the vision is here, and now it needs a commitment.",
      "Fire moment: you're being asked to declare which way you're going."
    ],
    Goal: [
      "Fire execution phase—time to make the vision real, step by step.",
      "This is Fire in action: you know what you want, now it's about doing it.",
      "Fire implementation: the plan is set, now it's momentum and follow-through."
    ]
  },

  Water: {
    Intelligence: [
      "This feels like Water—something wants to change form, and you're sensing into what that is.",
      "Water in the intelligence phase: emotions and intuition are showing you something.",
      "This is a Water moment of depth: you're letting the feelings reveal the pattern."
    ],
    Intention: [
      "Water decision time—you know what needs to shift, now it's choosing to let it transform.",
      "This is Water in intention: the emotional truth is clear, and now it needs a choice.",
      "Water moment: you're being asked to commit to the change, even if it's uncomfortable."
    ],
    Goal: [
      "Water transformation phase—you're in the process now, letting the shift happen.",
      "This is Water in action: surrender to the flow and trust the transformation.",
      "Water implementation: allow the change to move through you, don't force it."
    ]
  },

  Earth: {
    Intelligence: [
      "This feels like Earth—structure and embodiment matter here. Let's get concrete.",
      "Earth in the intelligence phase: you need clarity on what's actually real and solid.",
      "This is an Earth moment of grounding: what can you build on? What's stable?"
    ],
    Intention: [
      "Earth decision time—you know what needs structure, now it's committing to build it.",
      "This is Earth in intention: the foundation is needed, and now you're choosing to create it.",
      "Earth moment: you're being asked to commit to the work, the discipline, the form."
    ],
    Goal: [
      "Earth execution phase—build it brick by brick. Consistency wins here.",
      "This is Earth in action: structure, routine, and steady progress.",
      "Earth implementation: we win with discipline and incremental steps."
    ]
  },

  Air: {
    Intelligence: [
      "This feels like Air—clarity and meaning matter. What's the clearest way to see this?",
      "Air in the intelligence phase: you're seeking the right frame, the right words.",
      "This is an Air moment of perspective: what narrative or view would make sense of this?"
    ],
    Intention: [
      "Air decision time—you've got clarity, now it's choosing which story to tell.",
      "This is Air in intention: the meaning is here, and now it needs a declaration.",
      "Air moment: you're being asked to name it, claim it, say it out loud."
    ],
    Goal: [
      "Air execution phase—communicate it, share it, make the idea tangible through words.",
      "This is Air in action: articulate the plan, get feedback, refine the message.",
      "Air implementation: clarity comes through dialogue and expression."
    ]
  },

  Aether: {
    Intelligence: [
      "This feels like Aether—alignment and purpose are asking to be seen. What's the deeper why?",
      "Aether in the intelligence phase: you're sensing the sacred dimension of this.",
      "This is an Aether moment of integration: what's the throughline? The essence?"
    ],
    Intention: [
      "Aether decision time—you've felt the calling, now it's choosing to honor it.",
      "This is Aether in intention: the deeper yes is clear, and now it needs a vow.",
      "Aether moment: you're being asked to align with what's most true for you."
    ],
    Goal: [
      "Aether execution phase—serve the purpose, stay aligned with the highest value.",
      "This is Aether in action: every choice reflects the deeper commitment.",
      "Aether implementation: let the sacred yes guide each step."
    ]
  }
};

/**
 * Phase translations (conversational language, not jargon)
 */
export const PHASE_TRANSLATIONS: Record<Phase, string> = {
  Intelligence: "Let's get clear / see the pattern",
  Intention: "Let's choose a direction / make a call",
  Goal: "Let's make it real / do the next step"
};

/**
 * Choice questions based on element and phase
 */
export const CHOICE_QUESTIONS: Record<Element, Record<Phase, string[]>> = {
  Fire: {
    Intelligence: [
      "What's the simplest version of the vision that still feels true?",
      "Do you want to zoom in on one piece, or see the whole picture first?",
      "What's the spark—what's the thing that's actually pulling you forward?"
    ],
    Intention: [
      "Do you want boldness or precision right now?",
      "Which version of this feels most aligned: fast and messy, or slow and right?",
      "What's the commitment you need to make to stop spinning?"
    ],
    Goal: [
      "What's the first concrete step—today, this week?",
      "Do you need momentum or quality right now?",
      "What's the constraint that would make execution easier?"
    ]
  },

  Water: {
    Intelligence: [
      "What's the honest feeling-tone here: grief, fear, longing, or tenderness?",
      "What are you ready to release, and what must stay?",
      "What does your body/intuition already know that your mind hasn't caught up to?"
    ],
    Intention: [
      "Are you choosing to stay with the feeling, or are you choosing to move through it?",
      "What's the hardest truth you need to accept here?",
      "What would change if you trusted the transformation instead of resisting it?"
    ],
    Goal: [
      "What's one small way to honor the emotion today?",
      "Do you need support, space, or action right now?",
      "What physical action would help the feeling move through you?"
    ]
  },

  Earth: {
    Intelligence: [
      "What's actually concrete here? What can you touch, measure, or build on?",
      "What's the constraint? What's the bottleneck?",
      "If we made this 10% more organized today, what would that look like?"
    ],
    Intention: [
      "What structure do you need to commit to?",
      "Are you choosing consistency or intensity?",
      "What boundary or routine would make this sustainable?"
    ],
    Goal: [
      "What's the next concrete step—and what's the timeline?",
      "Do you need a system, a schedule, or a single action?",
      "What's one small physical thing you can do in the next 20 minutes?"
    ]
  },

  Air: {
    Intelligence: [
      "What's the cleanest sentence that names the problem?",
      "What are the options on the table—three max?",
      "If you explained this to a friend, what would be the core question?"
    ],
    Intention: [
      "Which story do you want to tell about this?",
      "What meaning would make this bearable, or even beautiful?",
      "What perspective shift would change how this feels?"
    ],
    Goal: [
      "What needs to be communicated first?",
      "Who needs to hear this, and what do they need to know?",
      "What's the clearest next step in the conversation?"
    ]
  },

  Aether: {
    Intelligence: [
      "What's the deeper yes you're trying to protect?",
      "What value or purpose is asking to be served here?",
      "If you act from your highest alignment, what becomes obvious?"
    ],
    Intention: [
      "What's the vow or commitment that would honor this?",
      "Are you choosing alignment over comfort?",
      "What would the most integrated version of you decide here?"
    ],
    Goal: [
      "What's the next step that serves the sacred purpose?",
      "How do you stay aligned while taking action?",
      "What practice or ritual would keep you connected to the deeper why?"
    ]
  }
};

/**
 * Micro-commit prompts (actionable, time-bound)
 */
export const MICRO_COMMIT_PROMPTS: string[] = [
  "What's one small action you'll do in the next 20 minutes?",
  "What's the tiniest version of this you could do today?",
  "If you could only do one thing before bed tonight, what would it be?",
  "What's the 5-minute version of this?",
  "What would you do right now if you had to move on this immediately?"
];

/**
 * Spiral scale check questions
 */
export const SPIRAL_SCALE_QUESTIONS: string[] = [
  "Is this a 'today problem,' a 'this season' problem, or a 'life-direction' problem?",
  "Are we talking about a moment, a relationship, or a chapter of your life?",
  "Is this micro (next hour), meso (next month), or macro (next year)?",
  "Does this feel like a decision for right now, or a pattern you've been working with for a while?"
];

/**
 * Get field-read phrase for element and phase
 */
export function getFieldReadPhrase(element: Element, phase: Phase): string {
  const phrases = FIELD_READ_PHRASES[element][phase];
  return phrases[Math.floor(Math.random() * phrases.length)];
}

/**
 * Get choice question for element and phase
 */
export function getChoiceQuestion(element: Element, phase: Phase): string {
  const questions = CHOICE_QUESTIONS[element][phase];
  return questions[Math.floor(Math.random() * questions.length)];
}

/**
 * Get micro-commit prompt
 */
export function getMicroCommitPrompt(): string {
  return MICRO_COMMIT_PROMPTS[Math.floor(Math.random() * MICRO_COMMIT_PROMPTS.length)];
}

/**
 * Get spiral scale check question
 */
export function getSpiralScaleQuestion(): string {
  return SPIRAL_SCALE_QUESTIONS[Math.floor(Math.random() * SPIRAL_SCALE_QUESTIONS.length)];
}
