import { VoicePreset } from '../types/daimonic';

export const DAIMONIC_VOICE_PRESETS: Record<string, VoicePreset> = {
  'trickster-caution': {
    name: 'trickster-caution',
    pace: 'measured',
    tone: 'grounded',
    pauses: true
  },
  
  'threshold': {
    name: 'threshold',
    pace: 'soft',
    tone: 'thoughtful',
    pauses: true
  },
  
  'both-and': {
    name: 'both-and',
    pace: 'normal',
    tone: 'warm',
    pauses: false
  },
  
  'anti-solipsism': {
    name: 'anti-solipsism',
    pace: 'normal',
    tone: 'neutral',
    pauses: false,
    humor: 'gentle'
  },
  
  'natural': {
    name: 'natural',
    pace: 'normal',
    tone: 'neutral',
    pauses: false
  }
};

export const VOICE_TAGS = {
  pace: {
    soft: '[soft pace]',
    measured: '[measured]',
    spacious: '[spacious]'
  },
  
  tone: {
    thoughtful: '[thoughtful pause]',
    grounded: '[grounded tone]',
    warm: '[warm]'
  },
  
  special: {
    pauses: '[thoughtful pause]',
    gentleHumor: '[gentle humor]'
  }
};

export const GROUNDING_PROMPTS = {
  general: [
    "Let's take this slowly…",
    "Try one small check-in with reality before moving."
  ],
  
  threshold: [
    "Notice what feels solid and real right now."
  ],
  
  trickster: [
    "Ask one grounding question before proceeding."
  ]
};

export const MICRO_PROMPTS = {
  trickster: "Ask one grounding question.",
  spirit: "Do one finishable step.",
  soul: "Name one small truth aloud.",
  liminal: "Sit with the unfamiliar for a moment.",
  general: "Notice what feels solid and real right now."
};

export const PRACTICE_TILES = {
  trickster: "Kitchen-table check-in (5 min)",
  bothAnd: "Fact & symbol journaling (7 min)",
  spirit: "One-step embodiment (3 min walk + breath)"
};

// Copy patterns for different scenarios
export const NARRATIVE_OPENINGS = {
  liminal: {
    dawn: "You're at a threshold time—ideas arrive fresh. Insight tends to slip in sideways here.",
    dusk: "You're at a threshold time—reflection deepens. Insight tends to slip in sideways here.",
    midnight: "You're at a threshold time—the veil thins. Insight tends to slip in sideways here.",
    transition: "You're at a threshold time—change moves. Insight tends to slip in sideways here."
  },
  
  steady: "Today feels steady enough to tell the truth gently."
};

export const SPIRIT_SOUL_GUIDANCE = {
  spirit: "There's lift in the system. Meet it with one embodied step you can finish today.",
  soul: "Depth is leading; keep it specific—body, breath, kitchen-table truths.",
  integrated: "Ascent and descent are in dialogue—conditions favor clean moves."
};

export const BOTH_AND_GUIDANCE = 
  "Hold fact and symbol at once; don't collapse the mystery into either box.";

export const TRICKSTER_CAUTIONS = {
  high: "This may be a teaching riddle. Slow the pace, verify with reality, and ask one grounding question.",
  moderate: "Teaching patterns may be at work—stay curious and verify with the real."
};

export const CLOSINGS = {
  individual: "Let what meets you remain a little unfamiliar. That gap is where something new can happen.",
  group: "The group is practicing honest descent this week—simple, specific actions tend to move everyone forward.",
  antiSolipsism: "Perfect agreement can mean you're only hearing yourself. Leave a little room for surprise."
};

export const COLLECTIVE_MYTHS = {
  highTricksterIntensity: "Learning through sacred mischief and teaching riddles",
  highBothAndIntensity: "Practicing the art of holding multiple truths simultaneously", 
  highIntensity: "Navigating threshold times with careful attention",
  spiritHeavy: "Seeking grounded expression for elevated insights",
  soulHeavy: "Deepening into embodied wisdom and practical truth",
  default: "Learning to hold paradox with grace"
};

export const CULTURAL_COMPENSATIONS = [
  "Balancing abstraction with embodiment",
  "Balancing overwhelm with a single clear view", 
  "Balancing speed with depth",
  "Balancing individual insight with collective wisdom",
  "Balancing certainty with healthy mystery",
  "Balancing action with reflection"
];