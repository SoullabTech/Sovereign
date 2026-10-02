/**
 * Writer's Studio — how intelligence arrives.
 *
 * These preferences govern PRESENTATION only. They never widen editorial
 * authority, evidence scope, disclosure authority, or theme governance.
 */
export type WorkingPace = 'intimate' | 'guided' | 'mapped';
export type ExplanationDepth = 'plain' | 'guided' | 'craft' | 'deep' | 'expert';

export interface WriterWorkingStyle {
  pace: WorkingPace;
  explanation: ExplanationDepth;
}

export const WORKING_STYLE_STORAGE_KEY = 'writers-studio:working-style:v1';

export const DEFAULT_WORKING_STYLE: WriterWorkingStyle = {
  pace: 'intimate',
  explanation: 'guided',
};

export const PACE_VALUES: readonly WorkingPace[] = ['intimate', 'guided', 'mapped'];
export const EXPLANATION_VALUES: readonly ExplanationDepth[] = ['plain', 'guided', 'craft', 'deep', 'expert'];

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

export function isWorkingPace(value: unknown): value is WorkingPace {
  return PACE_VALUES.includes(value as WorkingPace);
}

export function isExplanationDepth(value: unknown): value is ExplanationDepth {
  return EXPLANATION_VALUES.includes(value as ExplanationDepth);
}

export function parseWorkingStyle(raw: string | null): WriterWorkingStyle {
  if (!raw) return DEFAULT_WORKING_STYLE;
  try {
    const value = JSON.parse(raw) as Partial<WriterWorkingStyle>;
    return {
      pace: isWorkingPace(value.pace) ? value.pace : DEFAULT_WORKING_STYLE.pace,
      explanation: isExplanationDepth(value.explanation) ? value.explanation : DEFAULT_WORKING_STYLE.explanation,
    };
  } catch {
    return DEFAULT_WORKING_STYLE;
  }
}
export function readWorkingStyle(): WriterWorkingStyle {
  if (typeof window === 'undefined') return DEFAULT_WORKING_STYLE;
  return parseWorkingStyle(window.localStorage.getItem(WORKING_STYLE_STORAGE_KEY));
}

export function writeWorkingStyle(style: WriterWorkingStyle): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(WORKING_STYLE_STORAGE_KEY, JSON.stringify(style));
    window.dispatchEvent(new CustomEvent('writers-studio-working-style-changed', { detail: style }));
  } catch {
    // Presentation preference failure must never block writing.
  }
}

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
