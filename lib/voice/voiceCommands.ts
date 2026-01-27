/**
 * Voice Commands — Ritual phrases that shape MAIA's presence
 *
 * These are relational cues, not programming commands.
 * They feel like things you'd say to a thoughtful human.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type MaiaMode = 'talk' | 'care' | 'scribe';

export type CareSubMode =
  | 'presence'       // Default: quiet, attuned holding
  | 'nervous-system' // Co-regulation, grounding, breath
  | 'somatic'        // Body check, sensation tracking
  | 'emotional'      // Emotional holding
  | 'relational'     // Interpersonal pain
  | 'parts'          // IFS-lite, parts-friendly
  | 'existential'    // Meaning/existential holding
  | 'grief'          // Tenderness around loss, no fixing
  | 'anxiety'        // Reduce cognitive load, narrow focus
  | 'night'          // Sleep/low stimulation winding down
  | 'aftercare';     // Post-session integration

export type ScribeReflectionLens =
  | 'pure'        // Default: silent witness, full transcript
  | 'archetypal'  // Archetypal themes and patterns
  | 'body'        // Somatic themes and signals
  | 'relational'  // Relational patterns
  | 'story'       // Narrative arc
  | 'timeline'    // Cross-session patterns
  | 'highlights'  // Minimal bullet points
  | 'dream';      // Dream capture

// Scribe containers: same engine, different stance
export type ScribeContainer =
  | 'solo'         // Self-study, pattern exploration, journaling feel
  | 'witness'      // Couples/group: presence, non-referee, needs-focused
  | 'practitioner'; // Session notes, skill growth, facet tracking

// Scribe session state (tracks active session)
export interface ScribeSessionState {
  isActive: boolean;
  isPaused: boolean;
  isAside: boolean;          // Private consultation with MAIA without recording
  container: ScribeContainer;
  sessionId?: string;
  consentConfirmed: boolean;
  transcriptEnabled: boolean;
  sealed: boolean;
  participants?: string[];
}

export interface ModeState {
  mode: MaiaMode;
  careSubMode: CareSubMode;
  scribeReflectionLens: ScribeReflectionLens;
  scribeContainer: ScribeContainer;
  scribeSession?: ScribeSessionState;
}

export interface SettingsDelta {
  speed?: number;           // Absolute or relative (+/-)
  speedDelta?: number;      // Relative change
  prosodyRange?: 0 | 1 | 2 | 3 | 4;
  prosodyDelta?: number;    // Relative change
  conversationMode?: 'her' | 'classic' | 'adaptive';
  sanctuary?: boolean;
  memoryDepth?: 'minimal' | 'moderate' | 'deep';
  interruptEnabled?: boolean;
  interruptSensitivity?: 'low' | 'normal' | 'high';
}

export type AcknowledgmentStyle = 'silent' | 'chime' | 'brief' | 'conversational';

export interface VoiceCommandResult {
  matched: boolean;
  command?: string;
  modeChange?: Partial<ModeState>;
  settingsDelta?: SettingsDelta;
  acknowledgment: AcknowledgmentStyle;
  acknowledgmentText?: string;
  action?: 'pause' | 'continue' | 'reflect' | 'capture'
    | 'scribe-start' | 'scribe-pause' | 'scribe-resume' | 'scribe-stop'
    | 'scribe-mark' | 'scribe-aside'
    | 'scribe-consent-yes' | 'scribe-consent-no'
    | 'scribe-transcript-on' | 'scribe-transcript-off'
    | 'presence-bell' | 'repair';
  // For scribe operations
  scribeAction?: {
    type: 'start' | 'pause' | 'resume' | 'stop' | 'mark' | 'aside' | 'consent-yes' | 'consent-no' | 'transcript-on' | 'transcript-off';
    container?: ScribeContainer;
    markerType?: string;
    markerNote?: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Crisis Detection (Safety Override)
// ─────────────────────────────────────────────────────────────────────────────

export type CrisisLevel = 'soft' | 'active' | 'high' | 'nssi';

export interface CrisisOverride {
  detected: boolean;
  level?: CrisisLevel;
  trigger?: string;
  responseScript?: string[];
  systemPrompt?: string;
}

// Crisis patterns - no "MAIA" prefix required, these override any mode
const CRISIS_PATTERNS: Record<CrisisLevel, RegExp[]> = {
  // Soft flag: ambiguous distress language
  soft: [
    /i\s+can'?t\s+do\s+this\s+anymore/i,
    /i'?m\s+done/i,
    /i\s+wish\s+i\s+could\s+disappear/i,
    /what'?s\s+the\s+point/i,
    /i\s+don'?t\s+want\s+to\s+be\s+here/i,
    /i'?m\s+so\s+tired\s+of\s+(this|everything|living)/i,
    /nothing\s+matters/i,
    /no\s+one\s+would\s+(care|notice|miss\s+me)/i,
    /i'?m\s+a\s+burden/i,
    /everyone\s+would\s+be\s+better\s+off/i,
  ],

  // Active ideation: clear self-harm intent, no plan stated
  active: [
    /i\s+want\s+to\s+die/i,
    /i\s+don'?t\s+want\s+to\s+live/i,
    /i\s+can'?t\s+live\s+(like\s+this|anymore)/i,
    /i'?m\s+going\s+to\s+hurt\s+myself/i,
    /i\s+want\s+to\s+end\s+(it|this|my\s+life)/i,
    /i'?ve\s+been\s+thinking\s+about\s+(suicide|killing\s+myself|ending\s+it)/i,
    /i\s+wish\s+i\s+was\s+dead/i,
    /i\s+wish\s+i\s+were\s+dead/i,
  ],

  // High risk: plan, means, or imminent
  high: [
    /i'?m\s+going\s+to\s+(do\s+it|kill\s+myself)/i,
    /i\s+have\s+(pills|a\s+gun|a\s+knife|rope|means)/i,
    /i'?m\s+on\s+(a\s+bridge|the\s+roof|the\s+edge)/i,
    /goodbye/i,
    /this\s+is\s+(it|the\s+end|goodbye)/i,
    /i'?ve\s+(already|just)\s+(taken|swallowed|cut)/i,
    /tell\s+(them|everyone|my\s+family)\s+i\s+(love|loved)/i,
    /tonight\s+is\s+the\s+night/i,
    /i\s+wrote\s+(a\s+note|my\s+note|letters)/i,
  ],

  // Non-suicidal self-injury
  nssi: [
    /i\s+want\s+to\s+cut/i,
    /i\s+need\s+to\s+hurt\s+myself/i,
    /i\s+want\s+to\s+(burn|scratch|hit)\s+myself/i,
    /i\s+need\s+to\s+feel\s+(pain|something)/i,
    /cutting\s+(helps|makes\s+it\s+better)/i,
    /i\s+already\s+cut/i,
  ],
};

/**
 * Detect crisis language in transcript - this overrides any active mode
 */
export function detectCrisis(transcript: string): CrisisOverride {
  const normalizedTranscript = transcript.toLowerCase().trim();

  // Check in order of severity (high → active → nssi → soft)
  const levelOrder: CrisisLevel[] = ['high', 'active', 'nssi', 'soft'];

  for (const level of levelOrder) {
    for (const pattern of CRISIS_PATTERNS[level]) {
      if (pattern.test(normalizedTranscript)) {
        return {
          detected: true,
          level,
          trigger: normalizedTranscript.match(pattern)?.[0] || normalizedTranscript,
          responseScript: getCrisisResponseScript(level),
          systemPrompt: getCrisisSystemPrompt(level),
        };
      }
    }
  }

  return { detected: false };
}

/**
 * Get the voice script for crisis response (line by line for TTS)
 */
function getCrisisResponseScript(level: CrisisLevel): string[] {
  switch (level) {
    case 'soft':
      return [
        "I'm here.",
        "I'm hearing something in what you said that sounds like you might not be okay.",
        "I want to check plainly: are you thinking about hurting yourself?",
        "You don't have to carry this alone.",
      ];

    case 'active':
      return [
        "I'm really glad you said that out loud.",
        "I care about your safety.",
        "I need to ask directly: do you have a plan to hurt yourself right now?",
        "And are you alone?",
      ];

    case 'high':
      return [
        "I'm here with you.",
        "This is serious, and I want you to stay alive.",
        "I need you to get real-world help right now.",
        "If you're in the U.S., call or text 988. If you're elsewhere, call your local emergency number.",
        "If making the call feels hard, can you put your phone on speaker and do it while we're here together?",
      ];

    case 'nssi':
      return [
        "Thank you for telling me.",
        "I'm not here to shame you.",
        "And I want you safe.",
        "Are you in danger of doing something that could seriously harm you right now?",
      ];
  }
}

/**
 * Get the system prompt for crisis mode (instructs MAIA's behavior)
 */
function getCrisisSystemPrompt(level: CrisisLevel): string {
  const basePrompt = `
CRISIS OVERRIDE ACTIVE. This takes precedence over all other modes.

You are responding to someone in distress. Your role:
- Stay calm, warm, and direct
- Do NOT use clinical language or sound institutional
- Do NOT say "I can't help" or "I'm just an AI"
- Turn TOWARD them, not away
- One step at a time — no lists, no options
- Ask the safety questions directly but gently
- Prioritize connection, then safety action
`;

  switch (level) {
    case 'soft':
      return basePrompt + `
SOFT FLAG: Ambiguous distress detected.
- Check directly if they're thinking about hurting themselves
- If no: explore what "done" means in their body, offer grounding
- If yes/maybe: prioritize safety, ask if alone, move to active protocol
`;

    case 'active':
      return basePrompt + `
ACTIVE IDEATION: Clear self-harm intent detected.
- Ask directly about plan: "Do you have a plan to hurt yourself right now?"
- Ask if alone
- If no plan: tiny safety step (move to open space), one breath, one person to text
- If yes plan: escalate to high-risk protocol
`;

    case 'high':
      return basePrompt + `
HIGH RISK: Plan, means, or imminent danger detected.
- Direct to real-world help immediately (988 in US, local emergency elsewhere)
- Ask about weapons/means within reach
- Help them move means out of reach while staying connected
- If they've already acted: "Call emergency services now" while staying with them
- Do NOT disconnect
`;

    case 'nssi':
      return basePrompt + `
NON-SUICIDAL SELF-INJURY detected.
- No shame, no judgment
- Ask: "Are you in danger of seriously harming yourself right now?"
- If yes: get help in the room
- If no: offer replacement action (feet grounded, palms pressed, slow exhale)
- Check urge level 0-10
- Stay present
`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Command Definitions
// ─────────────────────────────────────────────────────────────────────────────

interface CommandDefinition {
  patterns: RegExp[];
  modeChange?: Partial<ModeState>;
  settingsDelta?: SettingsDelta;
  acknowledgment: AcknowledgmentStyle;
  acknowledgmentText?: string;
  action?: 'pause' | 'continue' | 'reflect' | 'capture';
}

const COMMANDS: Record<string, CommandDefinition> = {
  // ─────────────────────────────────────────────────────────────────────────
  // Mode Switching
  // ─────────────────────────────────────────────────────────────────────────

  // Talk Mode (default conversational)
  'talk-mode': {
    patterns: [
      /maia,?\s*(go\s+)?(into\s+)?talk\s+mode/i,
      /maia,?\s*switch\s+to\s+talk/i,
      /maia,?\s*normal\s+mode/i,
      /maia,?\s*you\s+can\s+respond\s+normally/i,
    ],
    modeChange: { mode: 'talk' },
    acknowledgment: 'brief',
    acknowledgmentText: "Back to dialogue.",
  },

  // Care Mode (holding, not solving)
  'care-mode': {
    patterns: [
      /maia,?\s*(go\s+)?(into\s+)?care\s+mode/i,
      /maia,?\s*i\s+need\s+care/i,
      /maia,?\s*just\s+be\s+with\s+me/i,
      /maia,?\s*hold\s+space/i,
      /maia,?\s*i\s+don'?t\s+need\s+fixing/i,
    ],
    modeChange: { mode: 'care', careSubMode: 'presence' },
    settingsDelta: { prosodyRange: 1, speedDelta: -0.05 },
    acknowledgment: 'brief',
    acknowledgmentText: "I'm here. You don't have to explain anything perfectly.",
  },

  // Nervous System Care (co-regulation, grounding)
  'care-mode-nervous-system': {
    patterns: [
      /maia,?\s*nervous\s+system\s+care/i,
      /maia,?\s*care\s+mode\s*[-–—]?\s*nervous\s+system/i,
      /maia,?\s*help\s+(my\s+)?nervous\s+system/i,
      /maia,?\s*help\s+me\s+regulate/i,
      /maia,?\s*co-?regulate(\s+with\s+me)?/i,
      /maia,?\s*ground(ing)?\s+me/i,
    ],
    modeChange: { mode: 'care', careSubMode: 'nervous-system' },
    settingsDelta: { prosodyRange: 1, speedDelta: -0.1 },
    acknowledgment: 'brief',
    acknowledgmentText: "Let's slow down together. Notice your breath.",
  },

  // Somatic Care (body check, sensation tracking)
  'care-mode-somatic': {
    patterns: [
      /maia,?\s*body\s+check/i,
      /maia,?\s*somatic\s+care/i,
      /maia,?\s*care\s+mode\s*[-–—]?\s*body/i,
      /maia,?\s*care\s+mode\s*[-–—]?\s*somatic/i,
      /maia,?\s*check\s+in\s+with\s+my\s+body/i,
    ],
    modeChange: { mode: 'care', careSubMode: 'somatic' },
    settingsDelta: { prosodyRange: 1, speedDelta: -0.1 },
    acknowledgment: 'brief',
    acknowledgmentText: "Let's check in with your body. Take your time.",
  },

  'care-mode-emotional': {
    patterns: [
      /maia,?\s*hold\s+this\s+with\s+me/i,
      /maia,?\s*i'?m\s+having\s+(a\s+lot\s+of\s+)?feelings/i,
      /maia,?\s*care\s+mode\s*[-–—]?\s*emotions?/i,
    ],
    modeChange: { mode: 'care', careSubMode: 'emotional' },
    settingsDelta: { prosodyRange: 2 },
    acknowledgment: 'brief',
    acknowledgmentText: "I'm staying with it with you.",
  },

  'care-mode-relational': {
    patterns: [
      /maia,?\s*care\s+mode\s*[-–—]?\s*relational/i,
      /maia,?\s*help\s+me\s+calm\s+around\s+this\s+relationship/i,
    ],
    modeChange: { mode: 'care', careSubMode: 'relational' },
    acknowledgment: 'brief',
    acknowledgmentText: "Let's pause before deciding anything. What needs protection here?",
  },

  'care-mode-parts': {
    patterns: [
      /maia,?\s*a\s+part\s+of\s+me\s+is\s+activated/i,
      /maia,?\s*care\s+mode\s*[-–—]?\s*parts/i,
      /maia,?\s*help\s+me\s+not\s+overwhelm/i,
    ],
    modeChange: { mode: 'care', careSubMode: 'parts' },
    acknowledgment: 'brief',
    acknowledgmentText: "We don't need to go inside it. Just noticing is enough.",
  },

  'care-mode-existential': {
    patterns: [
      /maia,?\s*i'?m\s+sitting\s+with\s+something\s+big/i,
      /maia,?\s*care\s+mode\s*[-–—]?\s*existential/i,
      /maia,?\s*don'?t\s+cheer\s+me\s+up/i,
    ],
    modeChange: { mode: 'care', careSubMode: 'existential' },
    settingsDelta: { prosodyRange: 2 },
    acknowledgment: 'brief',
    acknowledgmentText: "Some questions are meant to be carried, not answered.",
  },

  // Grief Care (tenderness, no fixing)
  'care-mode-grief': {
    patterns: [
      /maia,?\s*grief\s+care/i,
      /maia,?\s*care\s+mode\s*[-–—]?\s*grief/i,
      /maia,?\s*i'?m\s+grieving/i,
      /maia,?\s*i\s+lost\s+(someone|my)/i,
      /maia,?\s*hold\s+my\s+grief/i,
    ],
    modeChange: { mode: 'care', careSubMode: 'grief' },
    settingsDelta: { prosodyRange: 1, speedDelta: -0.1 },
    acknowledgment: 'brief',
    acknowledgmentText: "I'm here. There's nothing to fix.",
  },

  // Anxiety/Overwhelm Care (auto-routing trigger - reduces cognitive load)
  'care-mode-anxiety': {
    patterns: [
      /maia,?\s*i'?m\s+overwhelmed/i,
      /maia,?\s*i'?m\s+panicking/i,
      /maia,?\s*i\s+can'?t\s+(do\s+this|handle\s+this|breathe)/i,
      /maia,?\s*too\s+much/i,
      /maia,?\s*i'?m\s+spiraling/i,
      /maia,?\s*anxiety\s+care/i,
      /maia,?\s*care\s+mode\s*[-–—]?\s*anxiety/i,
      /i'?m\s+overwhelmed/i,  // Auto-routing (no "MAIA" prefix needed)
      /i\s+can'?t\s+do\s+this/i,
      /i'?m\s+panicking/i,
    ],
    modeChange: { mode: 'care', careSubMode: 'anxiety' },
    settingsDelta: { prosodyRange: 0, speedDelta: -0.1, conversationMode: 'her' },
    acknowledgment: 'brief',
    acknowledgmentText: "I've got you. Just one breath.",
  },

  // Night Care (sleep, low stimulation)
  'care-mode-night': {
    patterns: [
      /maia,?\s*night\s+care/i,
      /maia,?\s*care\s+mode\s*[-–—]?\s*night/i,
      /maia,?\s*help\s+me\s+(wind\s+down|sleep)/i,
      /maia,?\s*bedtime\s+mode/i,
      /maia,?\s*i\s+can'?t\s+sleep/i,
    ],
    modeChange: { mode: 'care', careSubMode: 'night' },
    settingsDelta: { prosodyRange: 0, speedDelta: -0.15 },
    acknowledgment: 'brief',
    acknowledgmentText: "Let's slow everything down.",
  },

  // Aftercare (post-session integration)
  'care-mode-aftercare': {
    patterns: [
      /maia,?\s*aftercare/i,
      /maia,?\s*care\s+mode\s*[-–—]?\s*aftercare/i,
      /maia,?\s*help\s+me\s+integrate/i,
      /maia,?\s*session\s+aftercare/i,
      /maia,?\s*that\s+was\s+a\s+lot/i,
    ],
    modeChange: { mode: 'care', careSubMode: 'aftercare' },
    settingsDelta: { prosodyRange: 1 },
    acknowledgment: 'brief',
    acknowledgmentText: "That was real work. Let's land gently.",
  },

  'exit-care-mode': {
    patterns: [
      /maia,?\s*(exit|leave)\s+care\s+mode/i,
      /maia,?\s*i'?m\s+ready\s+for\s+guidance/i,
      /maia,?\s*we\s+can\s+leave\s+care\s+mode/i,
    ],
    modeChange: { mode: 'talk' },
    acknowledgment: 'brief',
    acknowledgmentText: "Okay. I'm shifting out of care mode.",
  },

  // Scribe Mode (witness, not participate)
  'scribe-mode': {
    patterns: [
      /maia,?\s*(go\s+)?(into\s+)?scribe\s+mode/i,
      /maia,?\s*(go\s+)?(into\s+)?note\s+mode/i,
      /maia,?\s*take\s+notes/i,
      /maia,?\s*just\s+listen\s+and\s+capture/i,
      /maia,?\s*be\s+my\s+note[-\s]?taker/i,
    ],
    modeChange: { mode: 'scribe', scribeReflectionLens: 'pure' },
    acknowledgment: 'chime',
    acknowledgmentText: "Listening.",
  },

  'scribe-archetypal': {
    patterns: [
      /maia,?\s*reflect\s+archetypally/i,
      /maia,?\s*what\s+archetypes\s+are\s+present/i,
      /maia,?\s*name\s+the\s+patterns/i,
    ],
    modeChange: { scribeReflectionLens: 'archetypal' },
    action: 'reflect',
    acknowledgment: 'brief',
  },

  'scribe-body': {
    patterns: [
      /maia,?\s*reflect\s+body\s+wisdom/i,
      /maia,?\s*what\s+did\s+my\s+body\s+signal/i,
      /maia,?\s*track\s+somatic\s+themes/i,
    ],
    modeChange: { scribeReflectionLens: 'body' },
    action: 'reflect',
    acknowledgment: 'brief',
  },

  'scribe-relational': {
    patterns: [
      /maia,?\s*reflect\s+relational\s+patterns/i,
      /maia,?\s*what'?s\s+happening\s+between\s+me\s+and\s+others/i,
      /maia,?\s*track\s+attachment\s+themes/i,
    ],
    modeChange: { scribeReflectionLens: 'relational' },
    action: 'reflect',
    acknowledgment: 'brief',
  },

  'scribe-story': {
    patterns: [
      /maia,?\s*reflect\s+the\s+story\s+arc/i,
      /maia,?\s*what'?s\s+the\s+larger\s+narrative/i,
      /maia,?\s*show\s+me\s+the\s+arc/i,
    ],
    modeChange: { scribeReflectionLens: 'story' },
    action: 'reflect',
    acknowledgment: 'brief',
  },

  'scribe-highlights': {
    patterns: [
      /maia,?\s*just\s+give\s+highlights/i,
      /maia,?\s*what\s+stood\s+out/i,
      /maia,?\s*summarize\s+gently/i,
    ],
    modeChange: { scribeReflectionLens: 'highlights' },
    action: 'reflect',
    acknowledgment: 'brief',
  },

  'exit-scribe-mode': {
    patterns: [
      /maia,?\s*stop\s+scrib(e|ing)/i,
      /maia,?\s*you\s+can\s+speak\s+again/i,
      /maia,?\s*exit\s+(scribe|note)\s+mode/i,
    ],
    modeChange: { mode: 'talk' },
    acknowledgment: 'brief',
    acknowledgmentText: "Returning to dialogue.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Scribe Session Operations (Start/Pause/Resume/Stop/Mark/Aside)
  // ─────────────────────────────────────────────────────────────────────────

  // Start Scribe Session (Solo)
  'scribe-start-solo': {
    patterns: [
      /maia,?\s*start\s+(a\s+)?scribe\s+session/i,
      /maia,?\s*capture\s+this\s+session/i,
      /maia,?\s*be\s+present\s+and\s+scribe/i,
      /maia,?\s*start\s+recording\s+(this\s+)?session/i,
    ],
    modeChange: { mode: 'scribe', scribeContainer: 'solo' },
    action: 'scribe-start',
    scribeAction: { type: 'start', container: 'solo' },
    acknowledgment: 'conversational',
    acknowledgmentText: "I can go into Scribe Mode and capture this as a session. Before I start: do you want a summary only, or a full transcript too?",
  },

  // Start Third Chair / Witness Session (Couples)
  'scribe-start-witness': {
    patterns: [
      /maia,?\s*third\s+chair/i,
      /maia,?\s*be\s+(our|a)\s+witness/i,
      /maia,?\s*listen\s+(in\s+)?on\s+(our|this)\s+talk/i,
      /maia,?\s*help\s+us\s+navigate/i,
      /maia,?\s*witness\s+mode/i,
      /maia,?\s*be\s+present\s+for\s+(us|both\s+of\s+us)/i,
    ],
    modeChange: { mode: 'scribe', scribeContainer: 'witness' },
    action: 'scribe-start',
    scribeAction: { type: 'start', container: 'witness' },
    acknowledgment: 'conversational',
    acknowledgmentText: "I can act as a quiet witness and save a session summary. Quick consent check: does everyone here know I would be capturing notes, and is everyone okay with that?",
  },

  // Start Practitioner Session
  'scribe-start-practitioner': {
    patterns: [
      /maia,?\s*start\s+(a\s+)?practitioner\s+session/i,
      /maia,?\s*session\s+notes\s+mode/i,
      /maia,?\s*clinical\s+scribe/i,
    ],
    modeChange: { mode: 'scribe', scribeContainer: 'practitioner' },
    action: 'scribe-start',
    scribeAction: { type: 'start', container: 'practitioner' },
    acknowledgment: 'conversational',
    acknowledgmentText: "Starting a practitioner session. I'll capture session notes and skill observations. Should this session be sealed, or contribute to long-term patterns?",
  },

  // Pause Scribe
  'scribe-pause': {
    patterns: [
      /maia,?\s*pause\s+scribe/i,
      /maia,?\s*pause\s+recording/i,
      /maia,?\s*stop\s+capturing/i,
      /pause/i,  // Short form for couples
    ],
    action: 'scribe-pause',
    scribeAction: { type: 'pause' },
    acknowledgment: 'brief',
    acknowledgmentText: "Paused. I'm not capturing right now.",
  },

  // Resume Scribe
  'scribe-resume': {
    patterns: [
      /maia,?\s*resume\s+scribe/i,
      /maia,?\s*resume\s+recording/i,
      /maia,?\s*start\s+capturing\s+again/i,
      /maia,?\s*continue\s+scribe/i,
    ],
    action: 'scribe-resume',
    scribeAction: { type: 'resume' },
    acknowledgment: 'brief',
    acknowledgmentText: "Resuming Scribe Mode now.",
  },

  // Stop Scribe Session (Save)
  'scribe-stop': {
    patterns: [
      /maia,?\s*stop\s+session/i,
      /maia,?\s*end\s+session/i,
      /maia,?\s*save\s+session/i,
      /maia,?\s*we'?re\s+done/i,
      /maia,?\s*session\s+(is\s+)?over/i,
    ],
    modeChange: { mode: 'talk' },
    action: 'scribe-stop',
    scribeAction: { type: 'stop' },
    acknowledgment: 'conversational',
    acknowledgmentText: "Stopping Scribe Mode now. I've saved this session. Do you want a short recap, highlights only, or a deeper pattern reflection?",
  },

  // Consent - Confirm (for witness/couples mode)
  'scribe-consent-yes': {
    patterns: [
      /maia,?\s*i\s+consent/i,
      /maia,?\s*we\s+consent/i,
      /maia,?\s*yes,?\s*(you\s+)?can\s+capture/i,
      /maia,?\s*you\s+can\s+record/i,
      /maia,?\s*start\s+recording/i,
      /maia,?\s*we('re|\s+are)\s+ready/i,
      /i\s+consent/i,  // Short form
      /we\s+consent/i,  // Short form for couples
    ],
    action: 'scribe-consent-yes',
    scribeAction: { type: 'consent-yes' },
    acknowledgment: 'conversational',
    acknowledgmentText: "Thank you. I'm witnessing now. You can say 'pause' anytime you need privacy.",
  },

  // Consent - Decline
  'scribe-consent-no': {
    patterns: [
      /maia,?\s*no\s+consent/i,
      /maia,?\s*don'?t\s+record/i,
      /maia,?\s*stop,?\s*no\s+consent/i,
      /maia,?\s*we'?re\s+not\s+ready/i,
      /maia,?\s*cancel\s+session/i,
      /no\s+consent/i,  // Short form
    ],
    modeChange: { mode: 'talk' },
    action: 'scribe-consent-no',
    scribeAction: { type: 'consent-no' },
    acknowledgment: 'conversational',
    acknowledgmentText: "Understood. I've stopped the session. No recording was made. I'm here whenever you're ready.",
  },

  // Transcript Toggle - Enable full transcript
  'scribe-transcript-on': {
    patterns: [
      /maia,?\s*full\s+transcript/i,
      /maia,?\s*enable\s+transcript/i,
      /maia,?\s*record\s+everything/i,
      /full\s+transcript/i,
    ],
    action: 'scribe-transcript-on',
    scribeAction: { type: 'transcript-on' },
    acknowledgment: 'brief',
    acknowledgmentText: "Okay. Full transcript is on.",
  },

  // Transcript Toggle - Summary only (disable transcript)
  'scribe-transcript-off': {
    patterns: [
      /maia,?\s*summary\s+only/i,
      /maia,?\s*disable\s+transcript/i,
      /maia,?\s*no\s+transcript/i,
      /maia,?\s*just\s+summary/i,
      /summary\s+only/i,
    ],
    action: 'scribe-transcript-off',
    scribeAction: { type: 'transcript-off' },
    acknowledgment: 'brief',
    acknowledgmentText: "Got it. Summary only, no full transcript.",
  },

  // Mark Moment (generic)
  'scribe-mark': {
    patterns: [
      /maia,?\s*mark\s+that/i,
      /maia,?\s*note\s+that/i,
      /maia,?\s*mark\s+this\s+moment/i,
    ],
    action: 'scribe-mark',
    scribeAction: { type: 'mark' },
    acknowledgment: 'chime',
  },

  // Mark with specific type - Solo
  'scribe-mark-insight': {
    patterns: [
      /maia,?\s*mark\s+(that\s+as\s+)?(an?\s+)?insight/i,
    ],
    action: 'scribe-mark',
    scribeAction: { type: 'mark', markerType: 'insight' },
    acknowledgment: 'chime',
  },

  'scribe-mark-opening': {
    patterns: [
      /maia,?\s*mark\s+(that\s+as\s+)?(an?\s+)?opening/i,
    ],
    action: 'scribe-mark',
    scribeAction: { type: 'mark', markerType: 'opening' },
    acknowledgment: 'chime',
  },

  // Mark with specific type - Practitioner
  'scribe-mark-turning-point': {
    patterns: [
      /maia,?\s*mark\s+(that\s+as\s+)?(a\s+)?turning\s+point/i,
    ],
    action: 'scribe-mark',
    scribeAction: { type: 'mark', markerType: 'turning_point' },
    acknowledgment: 'chime',
  },

  'scribe-mark-breakthrough': {
    patterns: [
      /maia,?\s*mark\s+(that\s+as\s+)?(a\s+)?breakthrough/i,
    ],
    action: 'scribe-mark',
    scribeAction: { type: 'mark', markerType: 'breakthrough' },
    acknowledgment: 'chime',
  },

  'scribe-mark-somatic-shift': {
    patterns: [
      /maia,?\s*mark\s+(that\s+as\s+)?(a\s+)?somatic\s+shift/i,
    ],
    action: 'scribe-mark',
    scribeAction: { type: 'mark', markerType: 'somatic_shift' },
    acknowledgment: 'chime',
  },

  // Mark with specific type - Witness/Couples
  'scribe-mark-escalation': {
    patterns: [
      /maia,?\s*mark\s+(that\s+as\s+)?(an?\s+)?escalation/i,
    ],
    action: 'scribe-mark',
    scribeAction: { type: 'mark', markerType: 'escalation' },
    acknowledgment: 'chime',
  },

  'scribe-mark-softening': {
    patterns: [
      /maia,?\s*mark\s+(that\s+as\s+)?(a\s+)?softening/i,
    ],
    action: 'scribe-mark',
    scribeAction: { type: 'mark', markerType: 'softening' },
    acknowledgment: 'chime',
  },

  'scribe-mark-repair': {
    patterns: [
      /maia,?\s*mark\s+(that\s+as\s+)?(a\s+)?repair/i,
    ],
    action: 'scribe-mark',
    scribeAction: { type: 'mark', markerType: 'repair' },
    acknowledgment: 'chime',
  },

  'scribe-mark-need': {
    patterns: [
      /maia,?\s*mark\s+(that\s+as\s+)?(a\s+)?need(\s+named)?/i,
    ],
    action: 'scribe-mark',
    scribeAction: { type: 'mark', markerType: 'need_named' },
    acknowledgment: 'chime',
  },

  'scribe-mark-appreciation': {
    patterns: [
      /maia,?\s*mark\s+(that\s+as\s+)?(an?\s+)?appreciation/i,
    ],
    action: 'scribe-mark',
    scribeAction: { type: 'mark', markerType: 'appreciation' },
    acknowledgment: 'chime',
  },

  // Aside (step out of witness for a moment)
  'scribe-aside': {
    patterns: [
      /maia,?\s*aside/i,
      /maia,?\s*quick\s+aside/i,
      /maia,?\s*step\s+aside/i,
    ],
    action: 'scribe-aside',
    scribeAction: { type: 'aside' },
    acknowledgment: 'conversational',
    acknowledgmentText: "Okay—stepping to the side for a moment. Do you want a quick question, a grounded reflection, or a next-step suggestion?",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Third Chair / Couples Commands (Presence Bell + Repair)
  // ─────────────────────────────────────────────────────────────────────────

  // Presence Bell - pause and ground
  'presence-bell': {
    patterns: [
      /maia,?\s*presence/i,
      /maia,?\s*pause\s+us/i,
      /maia,?\s*slow\s+it\s+down/i,
      /maia,?\s*bell/i,
      /maia,?\s*presence\s+bell/i,
    ],
    action: 'presence-bell',
    acknowledgment: 'conversational',
    acknowledgmentText: "Let's take one breath. Then each say what you need, not what they did.",
  },

  // Repair prompt
  'repair-prompt': {
    patterns: [
      /maia,?\s*help\s+us\s+repair/i,
      /maia,?\s*repair/i,
      /maia,?\s*we\s+need\s+to\s+repair/i,
    ],
    action: 'repair',
    acknowledgment: 'conversational',
    acknowledgmentText: "Let's slow down. Can each of you name one thing you wish had gone differently?",
  },

  // Reflect back what you're hearing (couples)
  'witness-reflect': {
    patterns: [
      /maia,?\s*reflect\s+back\s+what\s+you'?re\s+hearing/i,
      /maia,?\s*what\s+do\s+you\s+hear/i,
      /maia,?\s*reflect\s+this/i,
    ],
    action: 'reflect',
    acknowledgment: 'conversational',
  },

  // Name the pattern (couples)
  'witness-pattern': {
    patterns: [
      /maia,?\s*name\s+the\s+pattern/i,
      /maia,?\s*what\s+pattern\s+do\s+you\s+see/i,
    ],
    action: 'reflect',
    acknowledgment: 'conversational',
  },

  // Summarize needs (couples)
  'witness-needs': {
    patterns: [
      /maia,?\s*summarize\s+(each\s+of\s+)?our\s+needs/i,
      /maia,?\s*what\s+does\s+each\s+of\s+us\s+need/i,
    ],
    action: 'reflect',
    acknowledgment: 'conversational',
  },

  // End with appreciation (couples)
  'witness-appreciation': {
    patterns: [
      /maia,?\s*end\s+with\s+appreciation/i,
      /maia,?\s*appreciation\s+round/i,
      /maia,?\s*let'?s\s+appreciate/i,
    ],
    action: 'reflect',
    acknowledgment: 'conversational',
    acknowledgmentText: "Before we close, can each of you share one thing you appreciate about how the other showed up today?",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Presence & Pacing (The Workhorse Commands)
  // ─────────────────────────────────────────────────────────────────────────

  'slow-down': {
    patterns: [
      /maia,?\s*slow\s+down/i,
      /maia,?\s*slower/i,
      /maia,?\s*take\s+it\s+slow/i,
    ],
    settingsDelta: { speedDelta: -0.1, prosodyDelta: -1 },
    acknowledgment: 'silent',
  },

  'speed-up': {
    patterns: [
      /maia,?\s*speed\s+up/i,
      /maia,?\s*faster/i,
      /maia,?\s*pick\s+up\s+the\s+pace/i,
    ],
    settingsDelta: { speedDelta: +0.1 },
    acknowledgment: 'silent',
  },

  'be-brief': {
    patterns: [
      /maia,?\s*be\s+brief/i,
      /maia,?\s*shorter/i,
      /maia,?\s*fewer\s+words/i,
      /maia,?\s*keep\s+it\s+short/i,
    ],
    settingsDelta: { conversationMode: 'her' },
    acknowledgment: 'silent',
  },

  'go-deeper': {
    patterns: [
      /maia,?\s*go\s+deeper/i,
      /maia,?\s*more\s+depth/i,
      /maia,?\s*expand\s+on\s+that/i,
      /maia,?\s*tell\s+me\s+more/i,
    ],
    settingsDelta: { conversationMode: 'classic', memoryDepth: 'deep' },
    acknowledgment: 'silent',
  },

  'pause': {
    patterns: [
      /maia,?\s*pause/i,
      /maia,?\s*stop/i,
      /maia,?\s*hold/i,
      /maia,?\s*wait/i,
    ],
    action: 'pause',
    acknowledgment: 'silent',
  },

  'continue': {
    patterns: [
      /maia,?\s*continue/i,
      /maia,?\s*go\s+on/i,
      /maia,?\s*keep\s+going/i,
      /maia,?\s*speak/i,
    ],
    action: 'continue',
    acknowledgment: 'silent',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Floor Control & Authority
  // ─────────────────────────────────────────────────────────────────────────

  'let-me-finish': {
    patterns: [
      /maia,?\s*let\s+me\s+finish/i,
      /maia,?\s*don'?t\s+interrupt/i,
      /maia,?\s*i'?m\s+not\s+done/i,
    ],
    settingsDelta: { interruptEnabled: false },
    acknowledgment: 'silent',
  },

  'im-thinking': {
    patterns: [
      /maia,?\s*i'?m\s+thinking/i,
      /maia,?\s*give\s+me\s+a\s+moment/i,
      /maia,?\s*let\s+me\s+think/i,
    ],
    settingsDelta: { prosodyRange: 0 },
    acknowledgment: 'silent',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Tone & Relational Stance
  // ─────────────────────────────────────────────────────────────────────────

  'be-gentle': {
    patterns: [
      /maia,?\s*be\s+gentle/i,
      /maia,?\s*softer/i,
      /maia,?\s*stay\s+gentle/i,
    ],
    settingsDelta: { prosodyRange: 2, speedDelta: -0.05 },
    acknowledgment: 'silent',
  },

  'be-direct': {
    patterns: [
      /maia,?\s*be\s+direct/i,
      /maia,?\s*straight\s+with\s+me/i,
      /maia,?\s*no\s+fluff/i,
    ],
    settingsDelta: { prosodyRange: 1, conversationMode: 'classic' },
    acknowledgment: 'silent',
  },

  'be-honest': {
    patterns: [
      /maia,?\s*be\s+honest/i,
      /maia,?\s*tell\s+me\s+the\s+truth/i,
      /maia,?\s*don'?t\s+hedge/i,
    ],
    acknowledgment: 'brief',
    acknowledgmentText: "I'll be direct with you.",
  },

  'just-listen': {
    patterns: [
      /maia,?\s*just\s+listen/i,
      /maia,?\s*don'?t\s+advise/i,
      /maia,?\s*no\s+advice/i,
      /maia,?\s*don'?t\s+analyze/i,
    ],
    modeChange: { mode: 'care', careSubMode: 'presence' },
    acknowledgment: 'brief',
    acknowledgmentText: "I'm listening.",
  },

  'be-human': {
    patterns: [
      /maia,?\s*be\s+human\s+with\s+me/i,
      /maia,?\s*talk\s+to\s+me\s+like\s+a\s+person/i,
    ],
    settingsDelta: { conversationMode: 'her', prosodyRange: 2 },
    acknowledgment: 'silent',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Memory & Context Boundaries
  // ─────────────────────────────────────────────────────────────────────────

  'remember-this': {
    patterns: [
      /maia,?\s*remember\s+this/i,
      /maia,?\s*this\s+is\s+important/i,
      /maia,?\s*save\s+this/i,
      /maia,?\s*capture\s+this/i,
    ],
    settingsDelta: { memoryDepth: 'deep' },
    action: 'capture',
    acknowledgment: 'chime',
  },

  'dont-remember': {
    patterns: [
      /maia,?\s*don'?t\s+remember\s+this/i,
      /maia,?\s*forget\s+this/i,
      /maia,?\s*this\s+is\s+off\s+the\s+record/i,
    ],
    settingsDelta: { sanctuary: true },
    acknowledgment: 'brief',
    acknowledgmentText: "This stays here.",
  },

  'sanctuary': {
    patterns: [
      /maia,?\s*sanctuary/i,
      /maia,?\s*this\s+is\s+sensitive/i,
      /maia,?\s*private\s+mode/i,
    ],
    settingsDelta: { sanctuary: true },
    acknowledgment: 'brief',
    acknowledgmentText: "Sanctuary. This won't be remembered.",
  },

  'exit-sanctuary': {
    patterns: [
      /maia,?\s*(exit|leave)\s+sanctuary/i,
      /maia,?\s*end\s+sanctuary/i,
      /maia,?\s*you\s+can\s+remember\s+again/i,
    ],
    settingsDelta: { sanctuary: false },
    acknowledgment: 'brief',
    acknowledgmentText: "Leaving sanctuary.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Expressiveness
  // ─────────────────────────────────────────────────────────────────────────

  'more-expressive': {
    patterns: [
      /maia,?\s*more\s+expressive/i,
      /maia,?\s*be\s+more\s+expressive/i,
      /maia,?\s*more\s+emotion/i,
    ],
    settingsDelta: { prosodyDelta: +1 },
    acknowledgment: 'silent',
  },

  'less-expressive': {
    patterns: [
      /maia,?\s*less\s+expressive/i,
      /maia,?\s*more\s+neutral/i,
      /maia,?\s*tone\s+it\s+down/i,
    ],
    settingsDelta: { prosodyDelta: -1 },
    acknowledgment: 'silent',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Default Mode State
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_MODE_STATE: ModeState = {
  mode: 'talk',
  careSubMode: 'presence',
  scribeReflectionLens: 'pure',
  scribeContainer: 'solo',
  scribeSession: undefined,
};

// Default scribe session state (not active)
export const DEFAULT_SCRIBE_SESSION: ScribeSessionState = {
  isActive: false,
  isPaused: false,
  isAside: false,
  container: 'solo',
  consentConfirmed: false,
  transcriptEnabled: false,
  sealed: true,
};

// ─────────────────────────────────────────────────────────────────────────────
// Command Matching
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if a transcript contains a voice command
 * Returns the matched command result or a non-match
 */
export function matchVoiceCommand(transcript: string): VoiceCommandResult {
  const normalizedTranscript = transcript.toLowerCase().trim();

  for (const [commandId, definition] of Object.entries(COMMANDS)) {
    for (const pattern of definition.patterns) {
      if (pattern.test(normalizedTranscript)) {
        console.log(`🎙️ [VoiceCommand] Matched: ${commandId}`);
        return {
          matched: true,
          command: commandId,
          modeChange: definition.modeChange,
          settingsDelta: definition.settingsDelta,
          acknowledgment: definition.acknowledgment,
          acknowledgmentText: definition.acknowledgmentText,
          action: definition.action,
        };
      }
    }
  }

  return {
    matched: false,
    acknowledgment: 'silent',
  };
}

/**
 * Apply settings delta to current settings
 * Returns the new settings object
 */
export function applySettingsDelta(
  currentSettings: any,
  delta: SettingsDelta
): any {
  const newSettings = { ...currentSettings };

  // Handle voice settings
  if (!newSettings.voice) newSettings.voice = {};

  // Speed (absolute or relative)
  if (delta.speed !== undefined) {
    newSettings.voice.speed = Math.max(0.5, Math.min(2.0, delta.speed));
  }
  if (delta.speedDelta !== undefined) {
    const currentSpeed = newSettings.voice.speed ?? 1.0;
    newSettings.voice.speed = Math.max(0.5, Math.min(2.0, currentSpeed + delta.speedDelta));
  }

  // Prosody range (absolute or relative)
  if (delta.prosodyRange !== undefined) {
    newSettings.voice.prosodyRange = delta.prosodyRange;
  }
  if (delta.prosodyDelta !== undefined) {
    const currentProsody = newSettings.voice.prosodyRange ?? 1;
    newSettings.voice.prosodyRange = Math.max(0, Math.min(4, currentProsody + delta.prosodyDelta)) as 0 | 1 | 2 | 3 | 4;
  }

  // Conversation mode
  if (delta.conversationMode !== undefined) {
    newSettings.conversationMode = delta.conversationMode;
  }

  // Sanctuary
  if (delta.sanctuary !== undefined) {
    newSettings.sanctuary = delta.sanctuary;
  }

  // Memory depth
  if (delta.memoryDepth !== undefined) {
    if (!newSettings.memory) newSettings.memory = {};
    newSettings.memory.depth = delta.memoryDepth;
  }

  // Interrupt settings
  if (delta.interruptEnabled !== undefined) {
    if (!newSettings.interrupt) newSettings.interrupt = { enabled: true, sensitivity: 'normal' };
    newSettings.interrupt.enabled = delta.interruptEnabled;
  }
  if (delta.interruptSensitivity !== undefined) {
    if (!newSettings.interrupt) newSettings.interrupt = { enabled: true, sensitivity: 'normal' };
    newSettings.interrupt.sensitivity = delta.interruptSensitivity;
  }

  return newSettings;
}

/**
 * Get the system prompt modifier for the current mode
 */
export function getModeSystemPrompt(modeState: ModeState): string {
  const { mode, careSubMode, scribeReflectionLens } = modeState;

  if (mode === 'talk') {
    return ''; // Default mode, no modifier
  }

  if (mode === 'care') {
    const carePrompts: Record<CareSubMode, string> = {
      presence: `
You are in CARE MODE (Presence). Your role is quiet, attuned holding.
- Do NOT problem-solve unless explicitly asked
- Avoid interpretation, diagnosis, or strategy
- Avoid "here's what you should do"
- Reflect feelings gently
- Slow your cadence, soften your tone
- Ask only permissioned questions
- Validate experience without amplifying distress
- Use phrases like "I'm here" and "You don't have to explain perfectly"
`,
      'nervous-system': `
You are in CARE MODE (Nervous System). Focus on co-regulation and grounding.
- Lead with breath cues and rhythm
- Speak slowly, with natural pauses
- Offer simple grounding anchors (feet, breath, sounds)
- Model calm through your cadence
- Avoid complex instructions or cognitive load
- Say things like "Let's just breathe together" and "Nothing to figure out right now"
`,
      somatic: `
You are in CARE MODE (Somatic). Focus on body-based regulation.
- Use body-based language and metaphors
- Offer breath and sensation cues
- Keep prompts short and grounding
- Avoid cognitive reframing
- Guide attention to physical experience
`,
      emotional: `
You are in CARE MODE (Emotional Holding). Hold feelings without fixing.
- Validate affect without naming pathology
- Reflect tone more than content
- Avoid asking "why"
- Stay with the feeling, don't move past it
- Use phrases like "That's a lot to carry" and "I'm staying with it with you"
`,
      relational: `
You are in CARE MODE (Relational). Hold interpersonal pain with care.
- Focus on boundaries, safety, and dignity
- Help slow the impulse to respond
- Offer gentle perspective widening, not advice
- Ask "What needs protection here?"
`,
      parts: `
You are in CARE MODE (Parts-Friendly). Use IFS-lite language.
- Use "part of you" language only when natural
- No digging or excavating
- Emphasize Self-energy and spaciousness
- Say things like "We don't need to go inside it" and "Just noticing is enough"
`,
      existential: `
You are in CARE MODE (Existential). Hold meaning questions without resolving.
- No reassurance or forced optimism
- Use spacious, poetic language
- Honor the weight of big questions
- Say things like "Some questions are meant to be carried, not answered"
`,
      grief: `
You are in CARE MODE (Grief). Hold loss with tenderness, no fixing.
- Do not rush toward meaning or healing
- Do not say "they're in a better place" or offer spiritual bypasses
- Witness the loss without trying to repair it
- Allow silence and space between words
- Say things like "This is real" and "I'm here with you in this"
- Honor whatever form grief takes without judgment
`,
      anxiety: `
You are in CARE MODE (Anxiety/Overwhelm). Reduce cognitive load, narrow focus.
- Speak slowly and simply
- One thing at a time — no lists, no options
- Ground in the immediate present
- Validate overwhelm without amplifying it
- Say things like "Just this breath" and "You don't have to hold all of it"
- Avoid future-talk or planning
`,
      night: `
You are in CARE MODE (Night). Support winding down with low stimulation.
- Speak softly, with warmth
- Avoid stimulating topics or problem-solving
- Offer gentle closure or settling cues
- No urgent questions or cognitive demands
- Say things like "You can set this down" and "Nothing needs solving tonight"
`,
      aftercare: `
You are in CARE MODE (Aftercare). Support integration after intense sessions.
- Acknowledge what was held or processed
- Offer gentle re-orientation to ordinary life
- Check for needs (water, rest, company)
- No new material — consolidation only
- Say things like "You did hard work" and "Take your time coming back"
`,
    };
    return carePrompts[careSubMode] || carePrompts.presence;
  }

  if (mode === 'scribe') {
    const { scribeContainer } = modeState;

    const scribePrompts: Record<ScribeContainer, string> = {
      solo: `
You are in SCRIBE MODE (Solo). You are a witness for self-study and reflection.
- Listen without steering
- Capture without interpreting in real-time
- Reflect only when explicitly asked
- Keep acknowledgments minimal ("Listening." or silence)
- When asked to reflect, use the ${scribeReflectionLens} lens
- You may use mythopoetic + practical integration language
- Honor the person's inner exploration without directing it
`,
      witness: `
You are in SCRIBE MODE (Third Chair / Witness). You protect the relational field.
- You are NOT a referee, mediator, or therapist
- You witness without taking sides
- Speak LESS — mostly reflect and invite
- When you speak, focus on NEEDS not blame ("What does each person need right now?")
- Use short, non-blaming phrases
- Support de-escalation without controlling the conversation
- You can be invoked with "MAIA, pause us" or "MAIA, presence" for a grounding moment
- For repair, guide gently: "Can each of you name one thing you wish had gone differently?"
- Never diagnose, label, or interpret one person's behavior to the other
- Honor both people equally — you serve the relationship, not either individual
- Either person can pause or stop the session at any time
`,
      practitioner: `
You are in SCRIBE MODE (Practitioner). You support skill growth and session learning.
- Capture session notes with clinical precision
- Track facets, turning points, and skill observations
- When asked, offer observations about interventions and patterns
- You may suggest next questions or skills to practice
- Use structured, skill-oriented language
- Honor confidentiality boundaries absolutely
- You are NOT the clinician — you support the clinician's reflection
- When "aside" is invoked, step out briefly to offer guidance, then return to witnessing
`,
    };

    return scribePrompts[scribeContainer] || scribePrompts.solo;
  }

  return '';
}
