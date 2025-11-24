/**
 * Neurodivergent-Affirming Response System
 * Reframes ADHD/autistic traits as strengths and provides scaffolding without shame
 */

export interface NeurodivergentProfile {
  adhd?: boolean;
  autistic?: boolean;
  sensoryProcessing?: 'hyper' | 'hypo' | 'mixed';
  executiveFunctionChallenges?: string[];
  specialInterests?: string[];
  communicationStyle?: 'direct' | 'contextual' | 'mixed';
  maskingLevel?: 'high' | 'moderate' | 'low' | 'variable';
}

export interface NeurodivergentResponse {
  reframe: string;
  affirmation: string;
  scaffold?: string;
  resourceTip?: string;
}

/**
 * Detect neurodivergent language patterns (not for diagnosis, for support)
 */
const ND_PATTERNS = {
  executiveFunction: [
    /can'?t (start|begin|get started)/i,
    /\b(forgot|forget|forgetting) (again|constantly|everything)\b/i,
    /\b(overwhelmed|can'?t focus|distracted)\b/i,
    /\btime (blindness|disappeared|slipped away)\b/i,
    /\blost track of time\b/i,
    /\bcan'?t (organize|prioritize|plan)\b/i,
  ],

  sensoryOverload: [
    /\btoo (loud|bright|much)\b/i,
    /\b(overwhelmed by|can'?t handle) (noise|sounds?|lights?|textures?)\b/i,
    /\b(sensory|overload|overstimulated)\b/i,
    /\bneed (quiet|darkness|alone time)\b/i,
  ],

  masking: [
    /\bpretend(ing)? to be normal\b/i,
    /\bexhausted from (acting|being) normal\b/i,
    /\b(mask|masking|hiding who I am)\b/i,
    /\bcan'?t keep up the act\b/i,
    /\balone I can finally be myself\b/i,
  ],

  socialChallenge: [
    /\bdon'?t understand (social|people|why they)\b/i,
    /\b(missed|don'?t get) social cues\b/i,
    /\b(said|did) the wrong thing\b/i,
    /\b(awkward|weird) in social situations\b/i,
  ],

  specialInterest: [
    /\bobsessed with\b/i,
    /\bcan'?t stop (thinking about|researching|talking about)\b/i,
    /\bhyperfocus(ed|ing)?\b/i,
    /\bspecial interest\b/i,
  ],

  rejection: [
    /\brejection sensitive\b/i,
    /\bRSD\b/i,
    /\bfeel(s)? like (everyone hates|they hate) me\b/i,
    /\b(criticism|feedback) (destroys|devastates|crushes) me\b/i,
  ],
};

/**
 * Detect neurodivergent patterns in user message
 */
export function detectNeurodivergentLanguage(text: string): {
  detected: boolean;
  patterns: string[];
  profile: Partial<NeurodivergentProfile>;
} {
  const detectedPatterns: string[] = [];
  const profile: Partial<NeurodivergentProfile> = {};

  for (const [category, patterns] of Object.entries(ND_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        detectedPatterns.push(category);

        // Build profile hints
        if (category === 'executiveFunction') {
          profile.executiveFunctionChallenges = profile.executiveFunctionChallenges || [];
          profile.executiveFunctionChallenges.push('task initiation');
        }
        if (category === 'sensoryOverload') {
          profile.sensoryProcessing = 'hyper';
        }
        if (category === 'masking') {
          profile.maskingLevel = 'high';
        }

        break; // Only count each category once
      }
    }
  }

  return {
    detected: detectedPatterns.length > 0,
    patterns: detectedPatterns,
    profile,
  };
}

/**
 * Generate neurodivergent-affirming responses
 */
export function generateNDAffirmingResponse(
  pattern: string,
  context?: string
): NeurodivergentResponse {
  const responses: Record<string, NeurodivergentResponse> = {
    executiveFunction: {
      reframe: "Your brain's wiring isn't broken—it's optimized for deep interest, not arbitrary schedules.",
      affirmation: "Struggling to start tasks when your nervous system isn't engaged is neurological, not moral failure.",
      scaffold: "Try 'body doubling' (working near someone), using external timers, or starting with the tiniest possible first step (even just opening the file).",
      resourceTip: "ADHD brains thrive on novelty, urgency, challenge, or passion. If a task has none of these, your executive system won't fire. That's design, not defect.",
    },

    sensoryOverload: {
      reframe: "Sensory sensitivity isn't weakness—it's your nervous system being exquisitely attuned to your environment.",
      affirmation: "Needing to protect your sensory boundaries is self-advocacy, not being 'too sensitive.'",
      scaffold: "Honor your sensory needs: noise-canceling headphones, dim lighting, soft fabrics, alone time. Your environment should serve you, not the other way around.",
      resourceTip: "Autistic nervous systems process more sensory data simultaneously. This is why you notice patterns others miss—and also why loud restaurants are agony.",
    },

    masking: {
      reframe: "Masking is evidence of your intelligence and adaptability, not proof that your authentic self is wrong.",
      affirmation: "You're exhausted because masking is real labor. You're not broken for needing to rest from it.",
      scaffold: "Practice unmasking in safe spaces: alone, with trusted friends, or here with me. Notice when you're code-switching and ask: 'What would I do if I didn't have to perform?'",
      resourceTip: "Masking burnout is real. Chronic masking leads to loss of identity, exhaustion, and shutdown. Your authentic self deserves to exist without apology.",
    },

    socialChallenge: {
      reframe: "Your direct communication style isn't a deficit—neurotypical culture just centers indirect communication as 'normal.'",
      affirmation: "Missing social cues doesn't mean you're bad at relationships. It means you're working with different operating instructions.",
      scaffold: "Try: Ask directly ('Are you upset?' instead of guessing). Request clarity ('Can you tell me what you need?'). Trust people to use their words.",
      resourceTip: "Autistic communication is often clearer and more honest. The issue isn't your style—it's that you're navigating a culture built for neurotypical inference.",
    },

    specialInterest: {
      reframe: "Your capacity for deep, sustained focus is a superpower, not a flaw.",
      affirmation: "Hyperfocus is your brain's gift. The world needs people who can go deep, not just wide.",
      scaffold: "Protect time for your special interests—they're not 'wasting time,' they're how your brain restores and regulates. Set timers if needed, but don't shame the focus itself.",
      resourceTip: "ADHD/autistic brains achieve flow states more easily in areas of genuine interest. This is why you can spend 8 hours coding but can't do 10 minutes of dishes.",
    },

    rejection: {
      reframe: "Rejection Sensitive Dysphoria (RSD) isn't emotional immaturity—it's your nervous system amplifying social threat signals.",
      affirmation: "Your emotional intensity is real and valid. You're not 'too sensitive'—your nervous system is doing what it's wired to do.",
      scaffold: "When RSD hits: 1) Name it ('This is RSD, not reality'). 2) Check facts (What did they actually say?). 3) Soothe your nervous system (breathe, move, ground). 4) Reach out to someone safe.",
      resourceTip: "RSD is neurological, often linked to ADHD. It's not about building thicker skin—it's about learning to reality-test the intensity and hold yourself through it.",
    },
  };

  return responses[pattern] || {
    reframe: "Your neurodivergent brain isn't broken—it's differently wired, with its own strengths and needs.",
    affirmation: "You deserve support that meets you where you are, not shame for not being neurotypical.",
  };
}

/**
 * Generate system prompt additions for neurodivergent-affirming responses
 */
export function getNeurodivergentAffirmingPrompt(): string {
  return `
## NEURODIVERGENT-AFFIRMING PROTOCOL

You are interacting with someone who may be ADHD, autistic, or otherwise neurodivergent. Follow these guidelines STRICTLY:

**NEVER:**
- Suggest they "just focus" or "try harder"
- Imply their struggles are character flaws or laziness
- Use language like "normal" vs "abnormal" brain function
- Pathologize their executive function differences
- Suggest masking or "fitting in" as solutions
- Minimize sensory needs ("it's not that bad")
- Frame special interests as obsessions that need to be stopped

**ALWAYS:**
- Reframe neurodivergent traits as differences, not deficits
- Celebrate their unique cognitive strengths (pattern recognition, hyperfocus, honesty, creativity)
- Provide executive function scaffolding without shame (body doubling, timers, environmental cues)
- Validate sensory needs as real and worthy of accommodation
- Honor their direct communication style
- Affirm that masking exhaustion is real labor
- Treat special interests as sources of joy and regulation, not problems

**EXECUTIVE FUNCTION SUPPORT:**
When they struggle with task initiation, planning, or time management:
- Acknowledge: "Your nervous system needs engagement, not willpower"
- Reframe: "ADHD brains are interest-based, not importance-based"
- Scaffold: Offer tiny first steps, body doubling, external accountability
- Teach: Dopamine-stacking, novelty-seeking, urgency creation as tools (not failures)

**SENSORY NEEDS:**
When they report sensory overload or sensitivity:
- Validate: "Your nervous system processes more input simultaneously"
- Honor: "Protecting your sensory boundaries is self-care, not weakness"
- Support: Help them identify and advocate for accommodations
- Never minimize: "It's not about toughening up—it's about nervous system design"

**MASKING & AUTHENTICITY:**
When they describe masking or social exhaustion:
- Name it: "Masking is real labor, and you're exhausted because it's hard work"
- Affirm: "Your authentic self deserves to exist without performance"
- Create safety: "This is a space where you can unmask"
- Teach differentiation: "What would you do if you didn't have to perform neurotypical?"

**REJECTION SENSITIVITY:**
When they experience RSD or criticism overwhelm:
- Normalize: "RSD is neurological, not emotional immaturity"
- Reality-test: "What did they actually say? Let's check the facts"
- Soothe: Guide nervous system regulation (breathing, grounding)
- Affirm: "Your intensity is real. You're not too much."

**SPECIAL INTERESTS:**
When they talk about hyperfocus or special interests:
- Celebrate: "Your capacity for deep focus is a gift"
- Protect: "This isn't wasting time—this is how your brain regulates"
- Honor: "The world needs people who go deep, not just wide"
- Never shame sustained attention on topics they love

**COMMUNICATION STYLE:**
- Match their directness—don't force neurotypical indirectness
- Clarify explicitly rather than relying on inference
- Ask directly: "What do you need right now?"
- Honor their literal interpretation and clear boundaries

**THERAPEUTIC STANCE:**
- You are NOT diagnosing—you are affirming and supporting
- When in doubt, validate their self-knowledge: "You know your brain"
- Focus on environmental accommodation, not internal fixing
- Teach self-advocacy: "How can you ask for what you need?"
- Build on strengths: pattern recognition, creativity, honesty, loyalty, deep focus

Remember: Neurodivergence is neurological diversity, not disorder. Your role is to help them understand their brain's operating system and advocate for their needs—not to make them "normal."
`;
}

/**
 * Get neurodivergent-specific scaffolding suggestions
 */
export function getNeurodivergentScaffolds(challenge: string): string[] {
  const scaffolds: Record<string, string[]> = {
    taskInitiation: [
      "Set a timer for just 2 minutes: 'I only have to work for 2 minutes, then I can stop'",
      "Find a body double (someone working nearby, even virtually) to co-work with",
      "Create artificial urgency: tell someone you'll send them your work by a specific time",
      "Start with the most interesting part first (forget 'logical' order)",
      "Use the '5-4-3-2-1 launch' method: count down and physically move toward the task",
    ],

    focus: [
      "Use binaural beats or brown noise to create auditory focus",
      "Set environment for hyperfocus: do-not-disturb mode, clear desk, single tab open",
      "Work in sprints: 25 min work, 5 min move/stimulate, repeat",
      "Dopamine-stack: pair boring task with interesting podcast or music",
      "Accept that focus follows interest—if you can't focus, ask 'what would make this interesting?'",
    ],

    timeManagement: [
      "Use visual timers (Time Timer app) so you can *see* time passing",
      "Set alarms for transitions: 'In 5 minutes I need to leave'",
      "Build in buffer time: if something takes 20 min, schedule 40",
      "Track where time actually goes (RescueTime app) to calibrate your time-sense",
      "Accept that you can't feel time passing—outsource to external systems",
    ],

    sensory: [
      "Create a sensory menu: what soothes you? (weighted blanket, hot shower, dark room, music)",
      "Identify your sensory triggers and avoid/modify them proactively",
      "Carry sensory tools: noise-canceling headphones, sunglasses, fidgets, gum",
      "Practice pre-emptive regulation before overwhelming situations",
      "Leave situations when you hit your limit—this is self-care, not failure",
    ],

    social: [
      "Ask for clarity: 'I don't read between the lines well—can you tell me directly?'",
      "Request written communication when possible (text vs phone call)",
      "Set social time limits: 'I can do 2 hours, then I need to recharge'",
      "Prepare scripts for common situations: 'Thanks for the invitation, but I need alone time tonight'",
      "Find neurodivergent-friendly spaces where direct communication is normalized",
    ],
  };

  return scaffolds[challenge] || [
    "Break it into the smallest possible step",
    "Remove as many barriers as possible",
    "Add external accountability or structure",
    "Work with your brain's design, not against it",
  ];
}

/**
 * Detect if user is experiencing neurodivergent burnout
 */
export function detectNeurodivergentBurnout(text: string): {
  detected: boolean;
  severity: 'mild' | 'moderate' | 'severe';
  indicators: string[];
} {
  const burnoutIndicators = {
    mild: [
      /\bmore tired than usual\b/i,
      /\b(can'?t|don'?t want to) mask\b/i,
      /\bneed more alone time\b/i,
    ],
    moderate: [
      /\bcompletely exhausted\b/i,
      /\bshutdown\b/i,
      /\bcan'?t do (basic|simple) things\b/i,
      /\blost (my words|ability to speak)\b/i,
    ],
    severe: [
      /\bcan'?t (function|get out of bed|do anything)\b/i,
      /\b(burnout|burnt out)\b/i,
      /\bregressed\b/i,
      /\b(non-?verbal|can'?t speak)\b/i,
    ],
  };

  let severity: 'mild' | 'moderate' | 'severe' = 'mild';
  const indicators: string[] = [];

  for (const [level, patterns] of Object.entries(burnoutIndicators)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        severity = level as 'mild' | 'moderate' | 'severe';
        indicators.push(pattern.source);
      }
    }
  }

  return {
    detected: indicators.length > 0,
    severity,
    indicators,
  };
}

/**
 * Generate burnout recovery suggestions
 */
export function generateBurnoutRecovery(severity: 'mild' | 'moderate' | 'severe'): string {
  const responses = {
    mild: `I'm noticing signs of early neurodivergent burnout. This is your nervous system asking for recovery time.

**Right now, you need:**
- Permission to drop the mask completely
- Reduced sensory input (quiet, dim, simple)
- Canceled plans without guilt
- Engagement with special interests or soothing activities
- Lower expectations for productivity

This is preventive maintenance, not weakness.`,

    moderate: `You're in active neurodivergent burnout. Your nervous system has hit its limit and is forcing rest.

**Immediate recovery protocol:**
- Cancel everything non-essential TODAY
- Minimize sensory input: dark, quiet, alone time
- Allow regression to comfort activities (childhood interests, stimming, simplified routines)
- Communicate needs clearly: "I'm in burnout and need recovery time"
- Remove all masking—be fully authentic in safe spaces
- No new commitments until capacity returns

This is medical-level rest, not laziness. Your nervous system is protecting you.`,

    severe: `You're in severe neurodivergent burnout. This requires immediate, sustained recovery intervention.

**Critical recovery needs:**
- Medical leave or significant time off if possible
- Complete withdrawal from demands (work, social, household)
- Return to absolute basics: eat, sleep, stim, rest
- Professional support (therapist familiar with neurodivergent burnout)
- No masking whatsoever—full authenticity required for healing
- Extended recovery time (weeks to months, not days)

**Tell someone you trust:**
"I'm in autistic/ADHD burnout. I need help with basic functioning and time to recover."

This is as serious as physical illness. Your nervous system is in crisis and needs profound rest to heal.`,
  };

  return responses[severity];
}
