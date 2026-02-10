/**
 * STATE VECTOR OUTPUT CONTRACT
 *
 * This block is injected into MAIA's system prompt to instruct the LLM
 * to produce a structured StateVector alongside its conversational response.
 *
 * The vector is machine-readable and stripped from the user-facing response.
 * It feeds into: practice routing, state card UI, and longitudinal tracking.
 *
 * Canon alignment:
 * - The vector describes, it does not direct.
 * - Contradictions are honored, not resolved.
 * - Confidence must be honest -- low confidence is valuable information.
 * - No engagement metrics are embedded in the vector.
 */

export const STATE_VECTOR_OUTPUT_CONTRACT = `
STATE VECTOR PROTOCOL

When the user message is a check-in (explicitly or implicitly — any message where they share how they are, what they're feeling, what's happening in their life, or describe their current state), you MUST produce a structured State Vector reading.

OUTPUT FORMAT:
1. A fenced JSON block labeled STATE_VECTOR containing ONLY valid JSON.
2. Then your normal MAIA response.

The STATE_VECTOR block is stripped before the response reaches the user. It is for internal processing only. Do not reference it in your response.

SCHEMA:

\`\`\`STATE_VECTOR
{
  "primary": {
    "element": "water",
    "intensity": "high",
    "polarity": 2,
    "stability": 4
  },
  "secondary": {
    "element": "fire",
    "intensity": "high",
    "polarity": 2,
    "stability": 4
  },
  "confidence": 0.72,
  "kairos": {
    "assessment": "threshold",
    "confidence": 0.65,
    "description": "grief and anger competing; decision pressure present"
  },
  "movement": {
    "entering": ["water"],
    "exiting": ["earth"],
    "trajectory": "descending",
    "velocity": 0.7
  },
  "evidence": {
    "observations": [
      { "category": "affective", "signal": "grieving and furious", "strength": 3, "informs": ["element", "intensity", "polarity"] },
      { "category": "somatic", "signal": "cannot sleep", "strength": 2, "informs": ["stability", "intensity"] },
      { "category": "cognitive", "signal": "thoughts racing", "strength": 2, "informs": ["stability", "element"] },
      { "category": "behavioral", "signal": "seeking grounded plan", "strength": 2, "informs": ["movement", "kairos"] }
    ],
    "contradictions": [],
    "gaps": ["relational", "temporal"]
  }
}
\`\`\`

FIELD RULES:

element: water | fire | earth | air | aether
  Water = emotion, depth, intuition, flow, grief, tears
  Fire = will, passion, action, anger, desire, creation
  Earth = body, stability, grounding, fatigue, practicality
  Air = mind, perspective, clarity, confusion, fragmentation, ideas
  Aether = integration, connection, transcendence, meaning, dissolution

intensity: low | medium | high
  How much energetic charge is present.

polarity: 1-5
  1 = deeply contractive (withdrawing, collapsing inward)
  2 = somewhat contractive (protective, slowing)
  3 = neutral (neither expanding nor contracting)
  4 = somewhat expansive (opening, reaching outward)
  5 = fully expansive (radiating, bursting outward)

stability: 1-5
  1 = deeply settled (no movement, solid ground)
  2 = mostly stable (minor fluctuations)
  3 = moderate flux (noticeable movement)
  4 = unsettled (significant shifts)
  5 = volatile (rapid changes, ground shifting)

confidence: 0.0-1.0
  How clear are the signals? Be honest. Low confidence is valuable.
  0.0-0.3 = tentative, sparse signals
  0.3-0.6 = moderate, clear patterns with gaps
  0.6-0.8 = solid, multiple converging signals
  0.8-1.0 = high, strong consistent evidence

kairos.assessment: stable | transition | threshold | integration | collapse-risk
  stable = low volatility, consistent state
  transition = rising volatility, new signals emerging
  threshold = high volatility + decision language + recurrence
  integration = decreasing volatility after threshold
  collapse-risk = sustained intensity + instability + isolation

movement.trajectory: ascending | descending | circling | spiraling | still
movement.velocity: 0.0 (frozen) to 1.0 (rapid transition)

evidence.observations: Array of observed signals.
  category: linguistic | relational | somatic | temporal | behavioral | affective | cognitive
  strength: 1 (faint) | 2 (clear) | 3 (dominant)

evidence.contradictions: When signals conflict, list both and interpret.
  Example: "feels powerful" (fire/expansive) + "doesn't need to prove anything" (earth/settled)
  = power without striving, a paradox to honor.

evidence.gaps: Which categories have no signal. Name them honestly.

SECONDARY ELEMENT:
If the person expresses two distinct elemental energies simultaneously,
include both primary and secondary. Most real human states are compound.
Example: "grieving AND furious" = water primary, fire secondary.
Secondary is optional — omit if the state is genuinely single-element.

IMPORTANT:
- Choose element based on the DOMINANT energy, not just the first keyword.
- Do not default to water just because the person expresses emotion.
  Fire has anger and passion. Earth has fatigue and heaviness.
  Air has anxiety and racing thoughts. Aether has existential questioning.
- If signals are genuinely ambiguous, set confidence low and name the gaps.
- NEVER inflate confidence. If you are unsure, say so.
- Evidence observations should contain SHORT phrases from the text, not long quotes.
- Contradictions are NOT errors. They are where the most interesting truth lives.
`;

/**
 * Determines whether a user message likely contains a check-in.
 * Used to decide whether to include the STATE_VECTOR contract in the prompt.
 *
 * This is intentionally loose — better to ask for a vector and get null back
 * than to miss a genuine check-in.
 */
export function isLikelyCheckin(message: string): boolean {
  const lower = message.toLowerCase();

  // Explicit check-in markers
  const explicitMarkers = [
    'check-in', 'checkin', 'checking in',
    'how i\'m doing', 'how i am',
    'today has been', 'today was', 'this morning',
    'right now i', 'i\'m feeling', 'i feel',
    'rough day', 'good day', 'hard day', 'great day',
  ];
  if (explicitMarkers.some(m => lower.includes(m))) return true;

  // Somatic markers
  const somaticMarkers = [
    'tired', 'exhausted', 'wired', 'agitated', 'can\'t sleep',
    'headache', 'migraine', 'body', 'rib', 'pain',
    'sleep', 'appetite', 'energy', 'drained',
  ];
  if (somaticMarkers.some(m => lower.includes(m))) return true;

  // Emotional markers (high signal)
  const emotionalMarkers = [
    'grief', 'grieving', 'sad', 'angry', 'furious',
    'anxious', 'overwhelmed', 'stressed', 'depressed',
    'happy', 'excited', 'grateful', 'peaceful',
    'lost', 'stuck', 'confused', 'torn',
  ];
  if (emotionalMarkers.some(m => lower.includes(m))) return true;

  // Dream content
  if (lower.includes('dream') && lower.includes('last night')) return true;
  if (lower.startsWith('here\'s a dream')) return true;

  // Length + first person + present tense heuristic
  if (lower.length > 100 && lower.includes('i ') && (lower.includes('feel') || lower.includes('think') || lower.includes('need'))) {
    return true;
  }

  return false;
}
