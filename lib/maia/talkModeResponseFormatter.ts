/**
 * Talk Mode Response Formatter
 *
 * Generates the four-part response structure for Talk mode:
 * 1. Field-read (1 sentence) - Name the moment
 * 2. Clarifying choice-question - Open the decision space
 * 3. 2-3 phase-aligned options - Provide pathways
 * 4. Micro-commit + timing - Make it actionable
 */

import type { FieldIntelligence } from './talkModeFieldIntelligence';
import {
  getFieldReadPhrase,
  getChoiceQuestion,
  getMicroCommitPrompt,
  getSpiralScaleQuestion,
  type Element,
  type Phase
} from './talkModePhraseLibrary';
import { getWisdomMove, type WisdomField } from './wisdomFieldMoves';

export interface TalkModeResponse {
  fieldRead: string;
  choiceQuestion: string;
  options?: string[];
  microCommit: string;
  wisdomMove?: string;
  fullResponse: string;
}

/**
 * Generate phase-aligned options (2-3 pathways forward)
 */
function generatePhaseOptions(
  element: Element,
  phase: Phase,
  userState: string
): string[] {
  const options: Record<Element, Record<Phase, string[]>> = {
    Fire: {
      Intelligence: [
        "Zoom in on one piece of the vision to make it concrete",
        "Map the whole vision first, then prioritize",
        "Name the feeling behind the vision—what's the core desire?"
      ],
      Intention: [
        "Make a bold, imperfect choice and adjust as you go",
        "Narrow to your top 2 options and sleep on it",
        "Ask: which path lights you up more?"
      ],
      Goal: [
        "Pick the smallest first step and do it today",
        "Build a simple plan: 3 steps, 3 days",
        "Find one accountability checkpoint to keep momentum"
      ]
    },

    Water: {
      Intelligence: [
        "Let the feeling move through you without analysis",
        "Name the emotion precisely: what's the core feeling?",
        "Ask your body: where do you feel this most strongly?"
      ],
      Intention: [
        "Choose to trust the process, even if it's uncomfortable",
        "Set a boundary that protects your emotional space",
        "Release the need to control how this unfolds"
      ],
      Goal: [
        "Do one small ritual to honor the emotion",
        "Take one physical action that matches the feeling",
        "Share this with one person you trust"
      ]
    },

    Earth: {
      Intelligence: [
        "List what's actually concrete and measurable",
        "Identify the one constraint that's blocking progress",
        "Get grounded: what can you see, touch, organize?"
      ],
      Intention: [
        "Commit to one structure or routine",
        "Set one non-negotiable boundary",
        "Choose consistency over perfection"
      ],
      Goal: [
        "Build the system: schedule, checklist, or habit",
        "Take one physical action today",
        "Organize one thing that's been chaotic"
      ]
    },

    Air: {
      Intelligence: [
        "Write out the clearest version of the question",
        "Talk it through with someone to find the pattern",
        "Zoom out: what's the frame you've been using?"
      ],
      Intention: [
        "Choose the story you want to tell about this",
        "Declare your perspective out loud or in writing",
        "Commit to communicating this clearly to one person"
      ],
      Goal: [
        "Have the conversation you've been avoiding",
        "Write/speak the message that needs to be shared",
        "Get feedback from one trusted source"
      ]
    },

    Aether: {
      Intelligence: [
        "Ask: what's the deeper yes I'm protecting?",
        "Sense into the essence: what really matters here?",
        "Name the value or purpose that's asking to be served"
      ],
      Intention: [
        "Make the choice that honors your deepest alignment",
        "Set a vow or commitment that reflects the sacred yes",
        "Release what's out of integrity, even if it's comfortable"
      ],
      Goal: [
        "Take one action that serves the purpose",
        "Create a practice or ritual that keeps you aligned",
        "Share your commitment with someone who holds you accountable"
      ]
    }
  };

  // Get options for element and phase
  const elementOptions = options[element][phase];

  // If user is dysregulated/overwhelmed, simplify to 2 options
  if (userState === 'dysregulated' || userState === 'overwhelmed') {
    return elementOptions.slice(0, 2);
  }

  return elementOptions;
}

/**
 * Build the complete four-part Talk mode response
 */
export function buildTalkModeResponse(
  fieldIntelligence: FieldIntelligence,
  includeOptions: boolean = true,
  includeSpiralCheck: boolean = false
): TalkModeResponse {
  const { element, phase, spiralScale, userState, recommendedWisdomField } = fieldIntelligence;

  // 1. FIELD-READ (1 sentence)
  const fieldRead = getFieldReadPhrase(element, phase);

  // 2. CHOICE QUESTION (clarifying)
  let choiceQuestion = getChoiceQuestion(element, phase);

  // Optionally include spiral scale check first
  if (includeSpiralCheck) {
    const scaleQuestion = getSpiralScaleQuestion();
    choiceQuestion = `${scaleQuestion} Then: ${choiceQuestion}`;
  }

  // 3. OPTIONS (2-3 pathways) - optional
  const options = includeOptions
    ? generatePhaseOptions(element, phase, userState)
    : undefined;

  // 4. MICRO-COMMIT (actionable + timing)
  const microCommit = getMicroCommitPrompt();

  // OPTIONAL: WISDOM MOVE (if field confidence is high)
  const wisdomMove = fieldIntelligence.confidence > 0.6
    ? getWisdomMove(recommendedWisdomField)
    : undefined;

  // BUILD FULL RESPONSE
  let fullResponse = `${fieldRead}\n\n${choiceQuestion}`;

  if (options && options.length > 0) {
    fullResponse += `\n\nHere are some ways forward:\n${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}`;
  }

  if (wisdomMove) {
    fullResponse += `\n\nOne more question: ${wisdomMove}`;
  }

  fullResponse += `\n\n${microCommit}`;

  return {
    fieldRead,
    choiceQuestion,
    options,
    microCommit,
    wisdomMove,
    fullResponse
  };
}

/**
 * Build a simplified Talk mode response (for greetings or simple exchanges)
 */
export function buildSimpleTalkModeResponse(
  fieldIntelligence: FieldIntelligence
): string {
  const { element, phase } = fieldIntelligence;

  const fieldRead = getFieldReadPhrase(element, phase);
  const choiceQuestion = getChoiceQuestion(element, phase);

  return `${fieldRead}\n\n${choiceQuestion}`;
}

/**
 * Build an advanced Talk mode response with wisdom move emphasis
 */
export function buildAdvancedTalkModeResponse(
  fieldIntelligence: FieldIntelligence,
  emphasizeWisdomMove: boolean = true
): TalkModeResponse {
  const response = buildTalkModeResponse(fieldIntelligence, true, false);

  // If emphasizing wisdom move, put it earlier in the response
  if (emphasizeWisdomMove && response.wisdomMove) {
    const fullResponse = `${response.fieldRead}\n\n${response.wisdomMove}\n\n${response.choiceQuestion}\n\nHere are some ways forward:\n${response.options?.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}\n\n${response.microCommit}`;

    return {
      ...response,
      fullResponse
    };
  }

  return response;
}

/**
 * Format response for logging/debugging
 */
export function formatTalkModeResponseForLogging(
  response: TalkModeResponse,
  fieldIntelligence: FieldIntelligence
): Record<string, any> {
  return {
    element: fieldIntelligence.element,
    phase: fieldIntelligence.phase,
    spiralScale: fieldIntelligence.spiralScale,
    userState: fieldIntelligence.userState,
    complexity: fieldIntelligence.complexity,
    wisdomField: fieldIntelligence.recommendedWisdomField,
    confidence: fieldIntelligence.confidence,
    responseLength: response.fullResponse.length,
    includedOptions: response.options ? response.options.length : 0,
    includedWisdomMove: !!response.wisdomMove
  };
}
