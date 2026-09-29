export const BETA_FEEDBACK_SIGNALS = [
  'lost_thread',
  'maia_misunderstood',
  'too_much_too_quickly',
  'wanted_more_help',
  'felt_like_my_voice',
  'changed_how_i_see_work',
  'not_ready_to_decide',
  'something_else',
] as const;

export type BetaFeedbackSignal = typeof BETA_FEEDBACK_SIGNALS[number];

export const BETA_FEEDBACK_LABEL: Record<BetaFeedbackSignal, string> = {
  lost_thread: 'I lost the thread',
  maia_misunderstood: 'MAIA misunderstood me',
  too_much_too_quickly: 'Too much too quickly',
  wanted_more_help: 'I wanted more help',
  felt_like_my_voice: 'This felt like my voice',
  changed_how_i_see_work: 'This changed how I see the Work',
  not_ready_to_decide: 'I’m not ready to decide',
  something_else: 'Something else',
};

export function isBetaFeedbackSignal(value: unknown): value is BetaFeedbackSignal {
  return typeof value === 'string'
    && (BETA_FEEDBACK_SIGNALS as readonly string[]).includes(value);
}

export type BetaOrientationContext = {
  developField?: string;
  developmentalMovement?: string;
  sectionId?: string;
  attentionReturn?: string;
  reviewFinding?: string;
  lineageCandidate?: string;
};
