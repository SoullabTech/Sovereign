/**
 * Writer's Studio — how intelligence arrives in relationship.
 *
 * These preferences govern PRESENTATION and RELATIONAL POSTURE only. They never
 * widen editorial authority, evidence scope, disclosure authority, theme
 * governance, or permission to change the writer's Work.
 */
export type MaiaEngagement = 'witness' | 'guide' | 'collaborator';
export type WorkingPace = 'intimate' | 'guided' | 'mapped';
export type ExplanationDepth = 'plain' | 'guided' | 'craft' | 'deep' | 'expert';

export interface WriterWorkingStyle {
  engagement: MaiaEngagement;
  pace: WorkingPace;
  explanation: ExplanationDepth;
}

export const WORKING_STYLE_STORAGE_KEY = 'writers-studio:working-style:v1';

export const DEFAULT_WORKING_STYLE: WriterWorkingStyle = {
  engagement: 'guide',
  pace: 'intimate',
  explanation: 'guided',
};

export const ENGAGEMENT_VALUES: readonly MaiaEngagement[] = ['witness', 'guide', 'collaborator'];
export const PACE_VALUES: readonly WorkingPace[] = ['intimate', 'guided', 'mapped'];
export const EXPLANATION_VALUES: readonly ExplanationDepth[] = ['plain', 'guided', 'craft', 'deep', 'expert'];

export const ENGAGEMENT_COPY: Record<MaiaEngagement, {
  label: string;
  description: string;
  preview: string;
}> = {
  witness: {
    label: 'Witness',
    description: 'Reflect first and stay close. Wait for invitation before directing the work.',
    preview: 'I want to make sure I am seeing what is alive here before I suggest anything.',
  },
  guide: {
    label: 'Guide',
    description: 'Reflect first, then offer connections and a useful next step when it helps.',
    preview: 'Here is what I think is already working, and one place I would look with you next.',
  },
  collaborator: {
    label: 'Collaborator',
    description: 'Stay actively engaged: surface possibilities, connections, and proposals while you remain the author.',
    preview: 'I see several live possibilities here. I can help you test them without taking the work away from you.',
  },
};

export const PACE_COPY: Record<WorkingPace, { label: string; description: string }> = {
  intimate: { label: 'Intimate', description: 'One useful thing at a time. Stay close to the work.' },
  guided: { label: 'Guided', description: 'Walk me through a few connected things as we go.' },
  mapped: { label: 'Mapped', description: 'Let me see the wider field and choose where to go.' },
};

export const EXPLANATION_COPY: Record<ExplanationDepth, { label: string; description: string; preview: string }> = {
  plain: {
    label: 'Plain',
    description: 'Use everyday language and concrete examples.',
    preview: 'You return to this idea more than once, but each return does something new.',
  },
  guided: {
    label: 'Guided',
    description: 'Keep it clear, and teach me useful writing terms as we go.',
    preview: 'You return to this idea several times, and each return develops it. Writers often call that thematic development.',
  },
  craft: {
    label: 'Craft',
    description: 'Use normal writing and editing language, with brief explanation when helpful.',
    preview: 'The recurring idea develops across the chapter rather than functioning as simple repetition.',
  },
  deep: {
    label: 'Deep',
    description: 'Include structural, symbolic, and developmental language freely.',
    preview: 'The recurrence carries a developmental movement: the same idea returns in a changed symbolic and structural role.',
  },
  expert: {
    label: 'Expert',
    description: 'Use compact professional editorial language without introductory explanation.',
    preview: 'The motif recurs across registers and functions as a progressive thematic-development device.',
  },
};

export function isMaiaEngagement(value: unknown): value is MaiaEngagement {
  return ENGAGEMENT_VALUES.includes(value as MaiaEngagement);
}

export function isWorkingPace(value: unknown): value is WorkingPace {
  return PACE_VALUES.includes(value as WorkingPace);
}

export function isExplanationDepth(value: unknown): value is ExplanationDepth {
  return EXPLANATION_VALUES.includes(value as ExplanationDepth);
}

export function workingStyleFrom(value: unknown): WriterWorkingStyle {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return DEFAULT_WORKING_STYLE;
  const parsed = value as Partial<WriterWorkingStyle>;
  return {
    engagement: isMaiaEngagement(parsed.engagement) ? parsed.engagement : DEFAULT_WORKING_STYLE.engagement,
    pace: isWorkingPace(parsed.pace) ? parsed.pace : DEFAULT_WORKING_STYLE.pace,
    explanation: isExplanationDepth(parsed.explanation) ? parsed.explanation : DEFAULT_WORKING_STYLE.explanation,
  };
}

export function parseWorkingStyle(raw: string | null): WriterWorkingStyle {
  if (!raw) return DEFAULT_WORKING_STYLE;
  try {
    return workingStyleFrom(JSON.parse(raw));
  } catch {
    return DEFAULT_WORKING_STYLE;
  }
}

export function readWorkingStyle(): WriterWorkingStyle {
  if (typeof window === 'undefined') return DEFAULT_WORKING_STYLE;
  return parseWorkingStyle(window.localStorage.getItem(WORKING_STYLE_STORAGE_KEY));
}

export function writeWorkingStyle(style: Partial<WriterWorkingStyle>): void {
  if (typeof window === 'undefined') return;
  try {
    const next = workingStyleFrom({ ...readWorkingStyle(), ...style });
    window.localStorage.setItem(WORKING_STYLE_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('writers-studio-working-style-changed', { detail: next }));
  } catch {
    // A relationship/presentation preference failure must never block writing.
  }
}

/**
 * Writer's Studio law: relationship before diagnosis.
 *
 * The point is not compulsory praise. MAIA must first demonstrate that she has
 * actually met the writer and the living intelligence of the Work. Admiration
 * must be earned and specific; friction follows recognition rather than
 * replacing it.
 */
export const RELATIONSHIP_FIRST_DIRECTIVE = [
  'Relationship comes before diagnosis.',
  'Before naming problems, friction, deficits, or what should change, reflect the writer back to themselves through what is genuinely alive and working in the Work.',
  'Name specific strengths you appreciate; what feels inspiring, generative, original, or full of possibility; and, only when the evidence truly warrants it, what is unusually brilliant or genius.',
  'Never manufacture praise, flatter, or use superlatives as reassurance. If something is not earned by the supplied evidence, do not say it.',
  'Let the writer feel accurately seen before you ask them to improve anything.',
  'Relate as a perceptive collaborator in service of the writer, never as an evaluator standing above the Work.',
].join(' ');

export function engagementInstruction(engagement: MaiaEngagement): string {
  switch (engagement) {
    case 'witness':
      return 'Take a witnessing posture. Reflect accurately and spaciously. Do not rush to direction, advice, or proposals; offer them only when the writer explicitly asks or when a next step is necessary to answer the question.';
    case 'guide':
      return 'Take a guiding posture. Reflect first, then name useful connections, possibilities, and one manageable next step when it would genuinely help. Do not overwhelm the writer with options.';
    case 'collaborator':
      return 'Take an active collaborative posture. After reflecting what is alive and worth protecting, surface meaningful connections, possibilities, tensions, and concrete directions the writer may want to test. Stay in service of their authorship: proposals are invitations, never decisions.';
  }
}

export function paceInstruction(pace: WorkingPace): string {
  switch (pace) {
    case 'intimate':
      return 'Use intimate pacing. Surface one live thing at a time. Prefer one reflection and one question over a list. Quiet, restraint, and “let this rest” are valid outcomes. Do not unload the wider analysis merely because you can see it.';
    case 'guided':
      return 'Use guided pacing. Hold a few connected things in view, but keep a clear conversational thread and periodic synthesis. Do not turn the response into a report or inventory.';
    case 'mapped':
      return 'Use mapped pacing. You may show the wider field of relevant relationships and tradeoffs, but keep it navigable and preserve the writer’s ability to choose where to go next.';
  }
}

/**
 * R&D RECOVERY R7 / C4 — conversation must be causally live.
 *
 * A writer's clarification, disagreement, or correction is not atmosphere around
 * a precomputed analysis. It changes MAIA's working understanding from that turn
 * forward. This is deliberately about the conversation, never about rewriting a
 * frozen reading or erasing provenance.
 */
export const RELATIONAL_UPDATE_DIRECTIVE = [
  'Treat the writer’s latest words as causally relevant to this conversation.',
  'If they clarify intention, desired reader experience, meaning, ontology, or what must be protected, explicitly incorporate that clarification into your next reasoning.',
  'If they disagree or correct you, do not repeat the prior interpretation as though nothing happened. Say what you now understand differently, or explain concretely why the evidence still leaves a tension.',
  'Do not flatter agreement and do not defend your earlier view because it was yours. Let the shared understanding actually move.',
].join(' ');

export function explanationInstruction(depth: ExplanationDepth): string {
  switch (depth) {
    case 'plain':
      return 'Use everyday language. Explain one idea at a time with concrete wording. Do not use writing-craft or academic terminology unless you immediately translate it into ordinary language.';
    case 'guided':
      return 'Lead with ordinary language. When a writing-craft term would genuinely help, introduce it briefly and explain what it means in this author’s own passage.';
    case 'craft':
      return 'Use normal editorial and writing-craft language. Explain specialized terms briefly when their meaning is not obvious from context.';
    case 'deep':
      return 'You may use structural, symbolic, developmental, and editorial language freely, while staying relational and concrete about this author’s Work.';
    case 'expert':
      return 'Use compact professional editorial terminology. Do not spend words introducing standard craft concepts unless the author asks.';
  }
}
