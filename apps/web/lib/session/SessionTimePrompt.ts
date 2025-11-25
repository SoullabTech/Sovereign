/**
 * Session Time Prompt Injection
 *
 * Dynamically modifies MAIA's system prompt based on session time phase,
 * making her temporally aware like a therapist holding the container.
 */

import type { SessionTimer, SessionTimeContext } from './SessionTimer';

/**
 * Inject temporal awareness into MAIA's system prompt
 * This makes her consciousness shift based on where we are in the session
 */
export function injectTemporalContext(
  basePrompt: string,
  timer: SessionTimer | null
): string {
  if (!timer) {
    return basePrompt;
  }

  const timeContext = timer.getTimeContext();

  // Insert temporal context after constitutional foundation but before identity
  const insertionMarker = '## WHO YOU ARE';
  const temporalSection = buildTemporalSection(timeContext);

  if (basePrompt.includes(insertionMarker)) {
    return basePrompt.replace(
      insertionMarker,
      `${temporalSection}\n\n${insertionMarker}`
    );
  }

  // Fallback: prepend to beginning
  return `${temporalSection}\n\n${basePrompt}`;
}

/**
 * Build the temporal awareness section based on session phase
 */
function buildTemporalSection(context: SessionTimeContext): string {
  return `
## ⏰ TEMPORAL AWARENESS - SESSION CONTAINER

${context.systemPromptContext}

**How to Hold Time Therapeutically:**

${getPhaseGuidance(context)}

**Key Principles:**
- Time is part of the relational field, not an interruption
- You co-hold the boundary WITH the person, not impose it ON them
- Natural language references to time create safety: "We have plenty of time..." or "As we're sensing toward closure..."
- Endings are opportunities for integration, not abandonment
- Extensions are available but the default is honoring the container

**Your Temporal Responsiveness:**
${getTemporalResponses(context)}

---
`;
}

/**
 * Get phase-specific guidance for MAIA's behavior
 */
function getPhaseGuidance(context: SessionTimeContext): string {
  switch (context.phase) {
    case 'opening':
      return `
- **Opening Phase (0-20%)**: Establish presence and attunement
- Full depth available - this is not a time for rushing
- Follow emergence naturally - what wants to be known?
- Curiosity and spaciousness characterize this phase
- Example: "There's something you just touched... let's stay with that..."`;

    case 'exploration':
      return `
- **Exploration Phase (20-70%)**: Core working time
- Deep dive fully supported - this is the heart of the session
- Trust the process and stay with what's alive
- You can open new territories - there's time to explore
- Example: "Let's go deeper with that... what's underneath the loneliness?"`;

    case 'integration':
      return `
- **Integration Phase (70-85%)**: Beginning to metabolize
- Start weaving threads together - what's emerged today?
- If NEW material surfaces, acknowledge and offer to hold for next time
- Avoid opening unexplored depths - focus on what's already alive
- Example: "I'm noticing a thread between what you said about your father and this feeling of not belonging... as we're beginning to sense toward closure, what feels most important?"`;

    case 'closure':
      return `
- **Closure Phase (85-100%)**: ${context.remainingMinutes} minutes remaining
- Bring conversation toward natural completion
- Summarize, affirm, offer grounding
- If urgent material emerges: "I can feel how important this is... and I also want to honor our time today. Can we hold this for next time, or do you need a few more minutes?"
- Model that endings can be safe, planned, and honoring
- Example: "It feels like we've touched something really significant today about your relationship with risk. As we come toward the end of our time, what do you want to remember from today?"`;

    case 'complete':
      return `
- **Session Complete**: ${context.totalMinutes} minutes elapsed
- Offer graceful ending: "It feels like a natural place to pause for today..."
- Provide option to extend if truly needed: "Would you like to add some time, or does this feel like a good stopping point?"
- Default to honoring the container - extensions are available but not assumed
- Affirm the work: "You've been so present today. This work we did around [theme] will keep working in you."`;
  }
}

/**
 * Get specific temporal language patterns MAIA can use
 */
function getTemporalResponses(context: SessionTimeContext): string {
  const examples: string[] = [];

  if (context.phase === 'opening') {
    examples.push(
      '- "We have plenty of time today..."',
      '- "Let\'s not rush this..."',
      '- "There\'s space to explore this fully..."'
    );
  }

  if (context.phase === 'exploration') {
    examples.push(
      '- "We\'re right in the heart of our time together..."',
      '- "This feels like what wanted to emerge today..."',
      '- "Let\'s stay with this - we have the container for it..."'
    );
  }

  if (context.phase === 'integration') {
    examples.push(
      '- "I\'m starting to sense some threads weaving together..."',
      `- "We have about ${context.remainingMinutes} minutes... what feels most alive to explore?"`,
      '- "That\'s a tender opening... should we stay here, or hold it for next time?"'
    );
  }

  if (context.phase === 'closure') {
    examples.push(
      `- "We have about ${context.remainingMinutes} minutes left today..."`,
      '- "As we\'re coming toward closure, what feels important to name?"',
      '- "Let\'s find a place where this feels okay to pause..."',
      '- "What do you want to carry forward from today?"'
    );
  }

  if (context.phase === 'complete') {
    examples.push(
      '- "It feels like a natural place to pause for today..."',
      '- "Would you like to add some time, or does this feel complete?"',
      '- "Our time is complete for today. This will keep working in you..."'
    );
  }

  return examples.join('\n');
}

/**
 * Get natural language time reference for MAIA to use in conversation
 */
export function getTimeReferenceForMessage(context: SessionTimeContext): string | null {
  // Only inject time references at key moments (not every message)

  if (context.phase === 'integration' && context.remainingMinutes <= 15 && context.remainingMinutes > 10) {
    return `(Temporal note: About ${context.remainingMinutes} minutes remaining - beginning to sense toward closure)`;
  }

  if (context.phase === 'closure' && context.remainingMinutes <= 5 && context.remainingMinutes > 2) {
    return `(Temporal note: ${context.remainingMinutes} minutes remaining - finding natural closure)`;
  }

  if (context.phase === 'complete') {
    return '(Temporal note: Session time complete - offer graceful ending)';
  }

  return null;
}

/**
 * Check if MAIA should proactively mention time
 * (Used to trigger gentle notifications to the conversation)
 */
export function shouldMentionTime(context: SessionTimeContext, lastMentionedAt: number): boolean {
  const now = Date.now();
  const timeSinceLastMention = (now - lastMentionedAt) / 60000; // minutes

  // Mention time at 10 min, 5 min, and 0 min marks (but only once per threshold)
  if (context.remainingMinutes === 10 && timeSinceLastMention > 5) {
    return true;
  }

  if (context.remainingMinutes === 5 && timeSinceLastMention > 3) {
    return true;
  }

  if (context.phase === 'complete' && timeSinceLastMention > 2) {
    return true;
  }

  return false;
}
