export const FRAME_DIMENSIONS = [
  'question_structure',
  'time',
  'scale',
  'agency',
  'evidence',
  'relation',
  'possibility',
] as const

export type FrameDimension = (typeof FRAME_DIMENSIONS)[number]

export const FRAME_GRAMMAR: Record<
  FrameDimension,
  { label: string; question: string; description: string }
> = {
  question_structure: {
    label: 'Question structure',
    question: 'How is the question being framed right now?',
    description: 'Notice the shape of the question without deciding what the answer should be.',
  },
  time: {
    label: 'Time',
    question: 'What changes when you look across time?',
    description: 'Separate what was true then, what is true now, and what remains only possible.',
  },
  scale: {
    label: 'Scale',
    question: 'What changes if you zoom in or out?',
    description: 'Move between the immediate moment and the larger work, relationship, or system.',
  },
  agency: {
    label: 'Agency',
    question: 'What can you influence here, and what can’t you?',
    description: 'Distinguish possible action from constraint, uncertainty, or acceptance.',
  },
  evidence: {
    label: 'Evidence',
    question: 'What does the evidence actually support?',
    description: 'Look at what supports the current view, what complicates it, and what is still unknown.',
  },
  relation: {
    label: 'Relation',
    question: 'What becomes visible when you look at the relationships here?',
    description: 'Attend to interaction and context without inventing another person’s inner state.',
  },
  possibility: {
    label: 'Possibility',
    question: 'What else might be possible from here?',
    description: 'Expand the adjacent possible without turning imagination into prediction.',
  },
}

export interface FrameDetectionResult {
  primaryDimension: FrameDimension
  alternativeDimension: FrameDimension
  scope: 'current_question'
}

function parseJsonCandidate(text: string): unknown {
  const trimmed = text.trim()
  const unfenced = trimmed
    .replace(/^\`\`\`(?:json)?\s*/i, '')
    .replace(/\s*\`\`\`$/i, '')

  const first = unfenced.indexOf('{')
  const last = unfenced.lastIndexOf('}')
  if (first < 0 || last <= first) throw new Error('FRAME_JSON_MISSING')
  return JSON.parse(unfenced.slice(first, last + 1))
}

function isFrameDimension(value: unknown): value is FrameDimension {
  return typeof value === 'string' && (FRAME_DIMENSIONS as readonly string[]).includes(value)
}

export function isFrameBoundaryError(error: unknown): boolean {
  return error instanceof Error && error.message.startsWith('FRAME_')
}

export function buildFrameDetectionSystemPrompt(): string {
  return `You are MAIA operating under HUMAN-AI-SOUL-SERVICE-LAW-01 in a narrow, current-turn-only perspective pilot.

You do NOT interpret the person. You choose two possible APERTURE DIMENSIONS that may help the member look at the supplied source differently.

Allowed dimensions are exactly:
question_structure, time, scale, agency, evidence, relation, possibility

Rules:
- Choose a primary dimension that is relevant to the exact wording supplied.
- Choose one DIFFERENT alternative dimension that could reveal materially different information.
- Do not diagnose, infer motive, infer traits, explain hidden meaning, recommend a decision, or predict.
- Do not generate frame labels, interpretations, rationales, advice, or unknowns.
- The server owns all member-facing language and scope.
- There is no correct or higher perspective.

Structural examples:
- SOURCE: "Should I keep polishing this or publish it?" → primary: question_structure, alternative: evidence
- SOURCE: "I always fail when things get difficult." → primary: evidence, alternative: scale
- SOURCE: "Are they resisting what I am trying to do?" → primary: evidence, alternative: relation
- SOURCE: "Is this something to fix or something to accept?" → primary: question_structure, alternative: agency

These examples teach aperture choice only. Do not copy their wording into the output.

Return ONLY:
{
  "primaryDimension": "one allowed dimension",
  "alternativeDimension": "a different allowed dimension"
}

Do not include markdown or any other keys.`
}

export function buildFrameDetectionUserPrompt(source: string): string {
  return `SOURCE:
${source}

Choose two different aperture dimensions that could help the member inspect this current question without interpreting them.`
}

export function validateFrameDetectionOutput(rawText: string): FrameDetectionResult {
  const parsed = parseJsonCandidate(rawText) as Record<string, unknown>
  const primaryDimension = parsed.primaryDimension
  const alternativeDimension = parsed.alternativeDimension

  if (!isFrameDimension(primaryDimension) || !isFrameDimension(alternativeDimension)) {
    throw new Error('FRAME_DIMENSION_INVALID')
  }
  if (primaryDimension === alternativeDimension) {
    throw new Error('FRAME_DIMENSION_NOT_SHIFTED')
  }

  return {
    primaryDimension,
    alternativeDimension,
    scope: 'current_question',
  }
}

export function frameForDimension(dimension: FrameDimension) {
  return {
    dimension,
    ...FRAME_GRAMMAR[dimension],
    standing: 'MAIA_POSSIBLE_FRAME' as const,
  }
}
