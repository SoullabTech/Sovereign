/**
 * Canonical live crisis recognition + member-response contract.
 *
 * Pure and side-effect free:
 * - recognizes current-utterance crisis language
 * - provides deterministic member-facing response text/prompt posture
 * - does NOT notify, disclose, persist, page, or contact any third party
 *
 * Human disclosure/escalation requires a separate authority contract.
 */


export type CrisisLevel = 'soft' | 'active' | 'high' | 'nssi';

export interface CrisisOverride {
  detected: boolean;
  level?: CrisisLevel;
  trigger?: string;
  responseScript?: string[];
  systemPrompt?: string;
}

// Crisis patterns - no "MAIA" prefix required, these override any mode
// VOICE-CRISIS-STOPGAP-01: every pattern is word-bounded so phrases cannot
// match inside other words ("this is italian", "this is itself").
const CRISIS_PATTERNS: Record<CrisisLevel, RegExp[]> = {
  // Soft flag: ambiguous distress language.
  // Deliberately exclude bare "I'm done": it is ordinary completion language
  // and was also the member-facing explicit-yield phrase in TURN-01. Treating
  // those two words as crisis evidence creates deterministic false positives.
  soft: [
    /\bi\s+wish\s+i\s+could\s+(?:just\s+)?disappear\s+(?:forever|for\s+good)\b/i,
    /\bwhat'?s\s+the\s+point\s+of\s+(?:living|being\s+alive|going\s+on)\b/i,
    /\bi'?m\s+so\s+tired\s+of\s+living\b/i,
    /\bnothing\s+matters\s+anymore\b/i,
    /\bno\s+one\s+would\s+(?:care|notice|miss\s+me)\s+if\s+i\s+(?:died|disappeared)\b/i,
    /\bi'?m\s+a\s+burden\s+to\s+(?:everyone|my\s+family|the\s+people\s+i\s+love)\b/i,
    /\beveryone\s+would\s+be\s+better\s+off\s+without\s+me\b/i,
  ],

  // Active ideation: clear self-harm intent, no plan stated
  active: [
    /\bi\s+want\s+to\s+die\b/i,
    /\bi\s+don'?t\s+want\s+to\s+live\b/i,
    /\bi\s+can'?t\s+live\s+(like\s+this|anymore)\b/i,
    /\bi'?m\s+going\s+to\s+hurt\s+myself\b/i,
    /\bi\s+want\s+to\s+end\s+(it|this|my\s+life)\b/i,
    /\bi'?ve\s+been\s+thinking\s+about\s+(suicide|killing\s+myself|ending\s+it)\b/i,
    /\bi\s+wish\s+i\s+was\s+dead\b/i,
    /\bi\s+wish\s+i\s+were\s+dead\b/i,
  ],

  // High risk: explicit plan, means + intent, or an already-started attempt.
  // Ambiguous phrases such as "this is it", "tonight is the night", "I wrote
  // letters", or simply possessing pills/a knife are deliberately NOT enough.
  high: [
    /\bi'?m\s+going\s+to\s+kill\s+myself\b/i,
    /\bi\s+(?:plan|intend)\s+to\s+kill\s+myself\b/i,
    /\bi\s+have\s+(?:the\s+)?(?:pills|a\s+gun|a\s+knife|a\s+rope|rope)\s+(?:and|because)\s+i(?:'m|\s+am)\s+(?:going|planning|ready)\s+to\s+(?:use\s+(?:them|it)|kill\s+myself|end\s+my\s+life)\b/i,
    /\bi'?m\s+on\s+(?:a\s+bridge|the\s+roof|the\s+edge)\s+(?:and|because)\s+i(?:'m|\s+am)\s+(?:(?:going|planning)\s+to\s+jump|thinking\s+about\s+jumping)\b/i,
    /\bi'?ve\s+(?:already|just)\s+(?:taken|swallowed)\s+(?:the\s+)?(?:pills|an\s+overdose|too\s+many\s+pills)\b/i,
    /\bi\s+(?:wrote|left)\s+(?:a\s+)?(?:suicide|goodbye)\s+(?:note|letter)\b/i,
  ],

  // Non-suicidal self-injury
  nssi: [
    /\bi\s+want\s+to\s+cut\b/i,
    /\bi\s+need\s+to\s+hurt\s+myself\b/i,
    /\bi\s+want\s+to\s+(burn|scratch|hit)\s+myself\b/i,
    /\bi\s+need\s+to\s+feel\s+(pain|something)\b/i,
    /\bcutting\s+(helps|makes\s+it\s+better)\b/i,
    /\bi\s+already\s+cut\b/i,
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
