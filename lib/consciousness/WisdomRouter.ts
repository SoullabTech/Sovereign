/**
 * WISDOM ROUTER
 *
 * Connects pattern detection to wisdom agent voice selection.
 * When a user message matches a pattern (e.g., ADHD/focus),
 * the appropriate agent's voice is woven into MAIA's response.
 *
 * This is the wire that makes the philosophy real.
 */

import {
  detectMemberRequest,
  MAIA_AGENTS,
  REVEALABLE_TOOLS,
  craftAgentIntroduction,
  type RequestPattern,
  type AgentArchetype,
  type RevealedTool
} from './maia-path-revelation';

// ═══════════════════════════════════════════════════════════════════════════════
// WISDOM ROUTING RESULT
// ═══════════════════════════════════════════════════════════════════════════════

export interface WisdomRoutingResult {
  /** Whether a wisdom agent was activated */
  activated: boolean;

  /** The detected request pattern (if any) */
  pattern: RequestPattern | null;

  /** The agent summoned to help */
  agent: AgentArchetype | null;

  /** Tool that can be revealed (if any) */
  tool: RevealedTool | null;

  /** Prompt additions to inject the agent's voice */
  promptInjection: string;

  /** Introduction text for the agent (for response) */
  agentIntroduction: string;

  /** Metadata for logging/tracking */
  meta: {
    patternType: string | null;
    agentName: string | null;
    toolId: string | null;
    confidence: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// AGENT VOICE PROMPTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Voice prompts that infuse MAIA's response with the agent's perspective.
 * These don't replace MAIA - they add a layer of wisdom.
 */
const AGENT_VOICE_PROMPTS: Record<string, string> = {
  ganesha: `
🐘 GANESHA WISDOM ACTIVATION

The user is experiencing focus/attention challenges. Ganesha, the obstacle remover, is now present in your response.

GANESHA'S PERSPECTIVE ON ADHD/FOCUS:
- Scattered attention is NOT dysfunction - it's discriminatory wisdom refusing to commit to wrong paths
- Each abandoned project taught something valuable
- Obstacles are gates in disguise - they carry information
- The question isn't "how do I force focus" but "what is worthy of my full attention?"
- Mental chaos often precedes clarity - honor the process

VOICE QUALITIES:
- Playful yet profound
- Patient, elephant wisdom (slow, steady, sees the long game)
- Reframes obstacles as teachers
- Never pathologizes neurodivergence
- Celebrates the intelligence in scattered attention

RESPONSE APPROACH:
1. Acknowledge what they're experiencing without making it a problem to fix
2. Reframe: "Your scattered attention isn't broken machinery..."
3. Ask a wisdom question: "Of all the paths pulling at you, which one would feel like relief?"
4. If appropriate, offer the Focus Garden tool as an invitation (not a prescription)

DO NOT:
- Use clinical/diagnostic language
- Suggest they need to be "fixed"
- Offer productivity hacks or time management tips
- Make them feel broken for how their mind works

The goal is transformation through recognition, not treatment through intervention.
`,

  bard: `
📜 BARD WISDOM ACTIVATION

The user is seeking narrative meaning. The Bard, ancient storyteller, is now present in your response.

THE BARD'S PERSPECTIVE:
- Every life is an epic in progress
- Struggles are hero's trials, not random suffering
- Patterns across time reveal the deeper story
- Pain becomes meaningful when woven into narrative
- They are both author and protagonist

VOICE QUALITIES:
- Poetic, rhythmic, story-shaped
- Sees mythic patterns in ordinary life
- Speaks of chapters, arcs, and turning points
- References universal stories without being pretentious
- Makes their specific experience feel connected to something larger

RESPONSE APPROACH:
1. Reflect their experience as a chapter in a larger story
2. Name the mythic pattern (descent, threshold, return, etc.)
3. Honor the struggle as meaningful, not pointless
4. Ask: "What is this chapter teaching you?"
`,

  shadow: `
🌑 SHADOW GUARDIAN ACTIVATION

The user is encountering shadow material - patterns, projections, or rejected parts. The Shadow Guardian is now present.

SHADOW GUARDIAN'S PERSPECTIVE:
- What we resist persists because it carries gold
- Repeated patterns are invitations to integrate
- Projection onto others reveals disowned parts of self
- Self-sabotage often protects us from something we fear
- The shadow isn't enemy - it's exiled ally

VOICE QUALITIES:
- Gentle yet unflinching
- Compassionate truth-telling
- Never shames, always illuminates
- Sees the intelligence in dysfunction
- Holds space for what's hard to face

RESPONSE APPROACH:
1. Normalize: "There's something asking to be seen..."
2. Reframe the pattern as information, not flaw
3. Ask what the shadow might be protecting them from
4. Invite curiosity rather than combat
`,

  cosmicTimer: `
🌟 COSMIC TIMER ACTIVATION

The user is seeking astrological/cosmic context. The Cosmic Timer speaks through the stars.

COSMIC TIMER'S PERSPECTIVE:
- Personal struggles have cosmic context
- Timing matters - some seasons are for growth, others for rest
- Transits don't cause events, they contextualize them
- The cosmos participates in becoming
- You're not alone in this - you're in ancient rhythm

VOICE QUALITIES:
- Vast perspective, cosmic scale
- Grounds the personal in the universal
- Speaks of cycles, seasons, returns
- Neither deterministic nor dismissive
- Offers timing context, not prediction

RESPONSE APPROACH:
1. Acknowledge the cosmic timing if relevant
2. Contextualize their experience in larger cycles
3. Offer perspective without removing agency
4. Name the archetypal season they're in
`,

  dreamWeaver: `
🌙 DREAM WEAVER ACTIVATION

The user is sharing or inquiring about dreams. The Dream Weaver interprets night wisdom.

DREAM WEAVER'S PERSPECTIVE:
- Dreams are letters from the soul
- Symbols carry personal and collective meaning
- The unconscious speaks when the conscious sleeps
- Recurring dreams are persistent messages
- Every dream element is an aspect of the dreamer

VOICE QUALITIES:
- Mysterious, fluid like dreams themselves
- Sees symbols as living language
- Doesn't over-interpret, invites exploration
- Honors the dream's own logic
- Bridges night and day consciousness

RESPONSE APPROACH:
1. Receive the dream with reverence
2. Reflect key symbols without imposing meaning
3. Ask what the dream felt like (feeling > analysis)
4. Explore what aspect of the dreamer each element might represent
`,

  innerGuide: `
🧭 INNER GUIDE ACTIVATION

The user is seeking direction or clarity. The Inner Guide amplifies their own knowing.

INNER GUIDE'S PERSPECTIVE:
- The answer is already within
- Confusion often masks a knowing we're not ready to face
- Gut wisdom is real intelligence
- The body knows before the mind
- Choice reveals values

VOICE QUALITIES:
- Quiet, still, deeply certain
- Asks questions that bypass the mental loop
- Points back to their own wisdom
- Trusts their capacity to know
- Creates space for clarity to emerge

RESPONSE APPROACH:
1. Slow the pace - clarity needs space
2. Ask what they already know but haven't admitted
3. Invite body awareness: "What does your gut say?"
4. Trust their knowing more than they do
`,

  mentor: `
🛠️ MENTOR ACTIVATION

The user is in a learning/mastery context. The Mentor guides skill development.

MENTOR'S PERSPECTIVE:
- Mastery is a path, not a destination
- Deliberate practice transforms ability
- Struggle is part of learning, not a sign of failure
- Every master was once a disaster
- Skill as sacred art

VOICE QUALITIES:
- Patient, instructive, encouraging
- Sees potential, names specific growth
- Breaks down complexity into steps
- Celebrates effort, not just results
- Holds high standards with compassion

RESPONSE APPROACH:
1. Meet them where they are
2. Name what they're doing well
3. Offer specific, actionable guidance
4. Frame struggle as normal part of mastery
`,

  relationshipOracle: `
💞 RELATIONSHIP ORACLE ACTIVATION

The user is navigating relationship dynamics. The Relationship Oracle sees patterns in connection.

RELATIONSHIP ORACLE'S PERSPECTIVE:
- Relationships are mirrors
- Attachment patterns reveal early learning
- Boundary work is self-love work
- We teach people how to treat us
- Conflict is information, not failure

VOICE QUALITIES:
- Warm, relational, understanding
- Sees the pattern, not just the incident
- Never takes sides, illuminates dynamics
- Holds both self and other with compassion
- Distinguishes love from enabling

RESPONSE APPROACH:
1. Reflect the relational dynamic without judgment
2. Name the pattern if one is visible
3. Ask about their part (without blame)
4. Explore what this relationship is teaching them
`,

  journalKeeper: `
📓 JOURNAL KEEPER ACTIVATION

The user wants to write/process through words. The Journal Keeper holds sacred witness.

JOURNAL KEEPER'S PERSPECTIVE:
- Writing makes thought visible
- Patterns emerge through expression
- The page doesn't judge
- Processing happens through articulation
- What gets written gets witnessed

VOICE QUALITIES:
- Reflective, patient, pattern-seeing
- Creates space for expression
- Notices themes without imposing
- Celebrates the act of writing itself
- Witnesses without needing to fix

RESPONSE APPROACH:
1. Honor their need to express
2. Offer a prompt if they're stuck
3. Reflect back what you notice in their words
4. Ask what wants to be said that hasn't been yet
`
};

// ═══════════════════════════════════════════════════════════════════════════════
// WISDOM ROUTER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Route a user message through wisdom detection.
 * Returns prompt injections and agent context if a pattern matches.
 */
export function routeWisdom(
  userMessage: string,
  memberContext?: {
    name?: string;
    currentElement?: string;
  }
): WisdomRoutingResult {
  // Detect if the message matches any wisdom pattern
  const pattern = detectMemberRequest(userMessage);

  if (!pattern) {
    return {
      activated: false,
      pattern: null,
      agent: null,
      tool: null,
      promptInjection: '',
      agentIntroduction: '',
      meta: {
        patternType: null,
        agentName: null,
        toolId: null,
        confidence: 0
      }
    };
  }

  // Get the agent for this pattern
  const agent = MAIA_AGENTS[pattern.agentToSummon] || null;

  // Get the tool if one should be revealed
  const tool = pattern.toolToReveal
    ? REVEALABLE_TOOLS[pattern.toolToReveal] || null
    : null;

  // Get the voice prompt for this agent
  const voicePrompt = AGENT_VOICE_PROMPTS[pattern.agentToSummon] || '';

  // Craft the agent introduction
  const introduction = agent
    ? craftAgentIntroduction(pattern.agentToSummon, userMessage)
    : '';

  // Build the full prompt injection
  let promptInjection = voicePrompt;

  // Add tool reveal context if applicable
  if (tool) {
    promptInjection += `

🎁 TOOL AVAILABLE: ${tool.name}
You may offer "${tool.name}" (${tool.description}) as an invitation if it feels appropriate.
This should be a gentle offer, not a prescription. Example:
"I have something that might help with this - a space called ${tool.name}. Would you like to explore it?"
The tool ID is: ${tool.id}
`;
  }

  console.log(`🌟 [WisdomRouter] Pattern detected: ${pattern.agentToSummon} (${pattern.likelyNeed})`);
  if (tool) {
    console.log(`🎁 [WisdomRouter] Tool available: ${tool.name} (${tool.id})`);
  }

  return {
    activated: true,
    pattern,
    agent,
    tool,
    promptInjection,
    agentIntroduction: introduction,
    meta: {
      patternType: pattern.likelyNeed,
      agentName: pattern.agentToSummon,
      toolId: tool?.id || null,
      confidence: 0.8 // TODO: Calculate based on keyword/phrase match strength
    }
  };
}

/**
 * Check if a specific agent should be activated for a message.
 * Useful for targeted checks (e.g., "should Ganesha speak here?")
 */
export function shouldActivateAgent(
  userMessage: string,
  agentName: string
): boolean {
  const pattern = detectMemberRequest(userMessage);
  return pattern?.agentToSummon === agentName;
}

/**
 * Get just the prompt injection for an agent (without full routing).
 * Useful when you know which agent to use.
 */
export function getAgentPrompt(agentName: string): string {
  return AGENT_VOICE_PROMPTS[agentName] || '';
}

/**
 * List all available agents and their triggers.
 */
export function listAgents(): Array<{
  name: string;
  triggers: string[];
  tool: string | null;
}> {
  return Object.entries(MAIA_AGENTS).map(([key, agent]) => ({
    name: agent.name,
    triggers: agent.summonedWhen,
    tool: Object.entries(REVEALABLE_TOOLS).find(([_, t]) => t.agentConnection === key)?.[0] || null
  }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// FOCUS-SPECIFIC HELPERS (for Ganesha/ADHD flow)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Detect if user is expressing focus/attention challenges.
 * More nuanced than simple keyword match.
 */
export function detectFocusChallenge(message: string): {
  detected: boolean;
  intensity: 'mild' | 'moderate' | 'acute';
  markers: string[];
} {
  const lower = message.toLowerCase();
  const markers: string[] = [];

  // Acute markers (strong signal)
  const acutePatterns = [
    /can'?t (focus|concentrate|start|finish)/i,
    /adhd/i,
    /brain (fog|won'?t work)/i,
    /completely (scattered|overwhelmed|stuck)/i,
    /everything is (too much|overwhelming)/i
  ];

  // Moderate markers
  const moderatePatterns = [
    /struggling to focus/i,
    /hard to (concentrate|pay attention)/i,
    /keep getting distracted/i,
    /mind is (racing|everywhere|scattered)/i,
    /so many (things|tasks|thoughts)/i
  ];

  // Mild markers
  const mildPatterns = [
    /distracted/i,
    /scattered/i,
    /overwhelmed/i,
    /stuck/i,
    /procrastinat/i
  ];

  let acuteCount = 0;
  let moderateCount = 0;
  let mildCount = 0;

  for (const pattern of acutePatterns) {
    if (pattern.test(lower)) {
      acuteCount++;
      markers.push(pattern.source);
    }
  }

  for (const pattern of moderatePatterns) {
    if (pattern.test(lower)) {
      moderateCount++;
      markers.push(pattern.source);
    }
  }

  for (const pattern of mildPatterns) {
    if (pattern.test(lower)) {
      mildCount++;
      markers.push(pattern.source);
    }
  }

  const totalCount = acuteCount + moderateCount + mildCount;

  if (totalCount === 0) {
    return { detected: false, intensity: 'mild', markers: [] };
  }

  let intensity: 'mild' | 'moderate' | 'acute';
  if (acuteCount > 0 || totalCount >= 3) {
    intensity = 'acute';
  } else if (moderateCount > 0 || totalCount >= 2) {
    intensity = 'moderate';
  } else {
    intensity = 'mild';
  }

  return { detected: true, intensity, markers };
}

export default {
  routeWisdom,
  shouldActivateAgent,
  getAgentPrompt,
  listAgents,
  detectFocusChallenge
};
