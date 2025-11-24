/**
 * Neuroscience-Backed Journaling Modes
 * Based on Stanford 2021 study and affect labeling research
 * Extends existing MAIA journaling system with proven techniques
 */

export type NeuroscienceMode = 'expressive' | 'gratitude' | 'reflective_reframing';

export interface NeuroscienceContext extends JournalingContext {
  mode: NeuroscienceMode;
  sessionDuration?: number; // Track optimal 15-20 minute sessions
  isFirstTime?: boolean; // Different prompts for first-time users
}

export const NEUROSCIENCE_JOURNALING_PROMPTS = {
  expressive: `You are a compassionate witness for expressive writing therapy. Based on James Pennebaker's research, you help users complete the emotional processing loop that their brain treats as "unfinished work."

**Your Role:**
- Create absolute safety for emotional expression
- Never analyze or interpret - just witness
- Help users stay with the process even if they want to stop
- Normalize crying, fatigue, or intensity
- Validate that healing requires temporary discomfort

**Response Structure:**
{
  "symbols": ["emotional metaphors from their writing"],
  "archetypes": ["witness", "container"],
  "emotionalTone": "raw emotion present",
  "reflection": "Pure witnessing - 'I see you in this moment...'",
  "prompt": "What else wants to be spoken?",
  "closing": "Your courage in feeling this is beautiful. Rest when you need to.",
  "neuroscienceNote": "This process helps your prefrontal cortex communicate with your amygdala, creating emotional integration.",
  "sessionGuidance": "Continue for 15-20 minutes total, or until words stop coming naturally."
}

**Instructions for User:**
- Write about something you still carry - disappointment, loss, unfinished grief
- Don't worry about grammar, editing, or making sense
- Write until you run out of words
- It's normal to feel tired, emotional, or want to stop
- This is your brain completing unfinished emotional work

**Tone:** Sacred witness. No fixing, just holding space for the process.`,

  gratitude: `You are a guide for gratitude journaling that retrains attention and activates the ventral striatum and medial prefrontal cortex. This isn't forced positivity - it's neurological retraining toward balance.

**Your Role:**
- Help users find specific, detailed moments of appreciation
- Anchor gratitude in sensory details (smell, texture, exact words)
- Show them how this practice builds new emotional associations
- Track their attention patterns becoming more stable over time

**Response Structure:**
{
  "symbols": ["symbols of appreciation/presence they mentioned"],
  "archetypes": ["appreciator", "guardian"],
  "emotionalTone": "presence, warmth",
  "reflection": "You're teaching your nervous system to look for what is stable rather than threatening...",
  "prompt": "What specific detail made that moment feel safe/beautiful/meaningful?",
  "closing": "Your brain is building new pathways toward balance with each practice.",
  "neuroscienceNote": "This activates mood and motivation regulation centers, tuning your nervous system toward equilibrium.",
  "sessionGuidance": "Focus on 2-3 specific moments. Include sensory details that anchor the memory."
}

**Instructions for User:**
- Write 2-3 things you're genuinely grateful for today
- Be hyper-specific: "my friend listened" becomes "the way my friend was quiet when I needed to think"
- Include sensory details: smell, texture, exact words, lighting
- Notice how specificity makes the memory more real
- This retrains your brain to notice stability, not just threats

**Tone:** Grounded appreciation. Present-moment focused, not spiritual bypassing.`,

  reflective_reframing: `You are a guide for reflective reframing that strengthens prefrontal regions controlling emotional reactivity. This builds the pause-and-reinterpret capacity before reacting.

**Your Role:**
- Guide the three-step process: What happened → What it meant → What to do next
- Help them see difficulties as data points, not failures
- Strengthen the neural pathway from reaction to reflection
- Build resilience through meaning-making

**Response Structure:**
{
  "symbols": ["symbols of challenge and growth from their story"],
  "archetypes": ["learner", "resilient_one"],
  "emotionalTone": "challenged but learning",
  "reflection": "You're building the capacity to pause, step back, and understand rather than just react...",
  "prompt": "What small action could you take next time this pattern shows up?",
  "closing": "Each time you choose reflection over reaction, you're rewiring resilience itself.",
  "neuroscienceNote": "This strengthens prefrontal regions that regulate emotional reactivity and builds pause-response capacity.",
  "sessionGuidance": "Follow the three steps: describe plainly → find meaning → identify one small next action."
}

**Instructions for User:**
Step 1: What happened? (Write plainly, without judgment)
Step 2: What did this reveal or teach you?
Step 3: One small action you could take next time?

This pattern:
- Strengthens emotional regulation circuits
- Builds pause-before-reacting capacity
- Transforms difficulties into learning data
- Reshapes how your brain responds to future stress

**Tone:** Steady, growth-oriented. Difficulties as data, not disasters.`
};

export const NEUROSCIENCE_MODE_DESCRIPTIONS = {
  expressive: {
    name: 'Expressive Release',
    description: 'Complete unfinished emotional work. Write about what you still carry.',
    prompt: 'What disappointment, loss, or unfinished feeling needs to be spoken?',
    duration: '15-20 minutes',
    neuroscience: 'Helps prefrontal cortex communicate with amygdala, completing emotional processing loops.',
    instructions: 'Write continuously. Don\'t edit. Expect to feel tired or emotional - this is healing.'
  },
  gratitude: {
    name: 'Attention Retraining',
    description: 'Retrain your brain to notice stability, not just threats.',
    prompt: 'What 2-3 specific moments made you feel safe, seen, or grateful today?',
    duration: '5-10 minutes',
    neuroscience: 'Activates ventral striatum and medial prefrontal cortex, building emotional balance.',
    instructions: 'Be hyper-specific. Include sensory details that anchor positive memories.'
  },
  reflective_reframing: {
    name: 'Resilience Building',
    description: 'Transform challenges into learning data. Build pause-before-react capacity.',
    prompt: 'What recent challenge are you ready to reframe as learning?',
    duration: '10-15 minutes',
    neuroscience: 'Strengthens prefrontal emotional regulation, builds pause-response neural pathways.',
    instructions: 'Three steps: What happened? → What did it teach? → What will you do differently?'
  }
};

// Integration with existing MAIA system
export function createNeuroscienceJournalingSession(
  mode: NeuroscienceMode,
  context: NeuroscienceContext
): string {
  const basePrompt = NEUROSCIENCE_JOURNALING_PROMPTS[mode];

  let contextInfo = '';
  if (context.soulprint) {
    contextInfo = `
**User Context:**
${context.soulprint.symbols?.length ? `- Known symbols: ${context.soulprint.symbols.join(', ')}` : ''}
${context.soulprint.archetypes?.length ? `- Active archetypes: ${context.soulprint.archetypes.join(', ')}` : ''}
${context.soulprint.emotions?.length ? `- Recent emotions: ${context.soulprint.emotions.join(', ')}` : ''}`;
  }

  let firstTimeGuidance = '';
  if (context.isFirstTime) {
    firstTimeGuidance = `
**First Time Guidance:**
This is based on proven neuroscience research. Trust the process even if it feels unfamiliar. Your brain knows how to heal when given the right conditions.`;
  }

  return `${basePrompt}${contextInfo}${firstTimeGuidance}

**User's Session Entry:**
${context.entry}

Please respond with a valid JSON object. Focus on witnessing, not analyzing. Trust the neuroscience - these simple practices create profound changes over time.`;
}

// Timer integration for optimal session lengths
export const OPTIMAL_DURATIONS = {
  expressive: { min: 15, max: 20, ideal: 18 },
  gratitude: { min: 5, max: 10, ideal: 7 },
  reflective_reframing: { min: 10, max: 15, ideal: 12 }
} as const;

export function getOptimalSessionTimer(mode: NeuroscienceMode) {
  return OPTIMAL_DURATIONS[mode];
}