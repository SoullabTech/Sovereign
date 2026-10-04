import { getDoorwayAudience } from './doorways';

/** C7B1 is a local interaction rehearsal. These types confer NO member authority. */
export const PREVIEW_ACTIVITIES = [
  { id: 'discussed_passage', label: 'I discussed a passage with MAIA.' },
  { id: 'considered_revision', label: 'I considered a revision, whether or not I used it.' },
] as const;
export const PREVIEW_USEFULNESS = [
  { id: 'helped', label: 'Yes, it helped me move the work forward.' },
  { id: 'partly', label: 'Partly.' },
  { id: 'not_sure', label: 'I am not sure yet.' },
  { id: 'did_not_help', label: 'No, it did not help this time.' },
  { id: 'prefer_not_to_answer', label: 'I prefer not to answer.' },
] as const;
export type PreviewActivity = typeof PREVIEW_ACTIVITIES[number]['id'];
export type PreviewUsefulness = typeof PREVIEW_USEFULNESS[number]['id'];

export interface ParticipationPreviewDraft {
  schema: 'constellation-participation-preview.v1';
  standing: 'preview_only_not_submitted';
  doorway: 'writers-studio';
  basis: 'member_reported_example';
  activity: PreviewActivity;
  usefulness: PreviewUsefulness;
  invitation?: { id: string; source: 'member_confirmed_example' };
}

type Editing = {
  phase: 'editing'; activity: PreviewActivity | null;
  usefulness: PreviewUsefulness | null; invitationId: string | null;
};
export type ParticipationPreviewState =
  | { phase: 'invitation' }
  | Editing
  | { phase: 'review' | 'complete'; draft: ParticipationPreviewDraft }
  | { phase: 'cleared' };
export type ParticipationPreviewAction =
  | { type: 'begin_preview' }
  | { type: 'choose_activity'; value: PreviewActivity }
  | { type: 'choose_usefulness'; value: PreviewUsefulness }
  | { type: 'choose_attribution'; invitationId: string | null }
  | { type: 'review_preview' }
  | { type: 'edit_preview' }
  | { type: 'finish_preview' }
  | { type: 'clear_preview' }
  | { type: 'restart_preview' };

export function initialParticipationPreview(): ParticipationPreviewState {
  return { phase: 'invitation' };
}

/** Explicitly enumerate fields; never spread input into the inspectable report. */
export function preparePreviewDraft(state: ParticipationPreviewState): ParticipationPreviewDraft | null {
  if (state.phase === 'review' || state.phase === 'complete') return state.draft;
  if (state.phase !== 'editing' || !state.activity || !state.usefulness) return null;
  return {
    schema: 'constellation-participation-preview.v1',
    standing: 'preview_only_not_submitted',
    doorway: 'writers-studio', basis: 'member_reported_example',
    activity: state.activity, usefulness: state.usefulness,
    ...(state.invitationId ? { invitation: { id: state.invitationId, source: 'member_confirmed_example' as const } } : {}),
  };
}

/** Pure transitions only. No network, clock, storage, counters, profile, or consent store. */
export function transitionParticipationPreview(
  state: ParticipationPreviewState,
  action: ParticipationPreviewAction,
): ParticipationPreviewState {
  if (action.type === 'clear_preview') return { phase: 'cleared' };
  if (action.type === 'restart_preview' && (state.phase === 'cleared' || state.phase === 'complete')) {
    return initialParticipationPreview();
  }
  if (action.type === 'begin_preview' && state.phase === 'invitation') {
    return { phase: 'editing', activity: null, usefulness: null, invitationId: null };
  }
  if (action.type === 'edit_preview' && state.phase === 'review') {
    return { phase: 'editing', activity: state.draft.activity, usefulness: state.draft.usefulness,
      invitationId: state.draft.invitation?.id ?? null };
  }
  if (action.type === 'finish_preview' && state.phase === 'review') {
    return { phase: 'complete', draft: state.draft };
  }
  if (state.phase !== 'editing') return state;
  switch (action.type) {
    case 'choose_activity':
      if (!PREVIEW_ACTIVITIES.some(choice => choice.id === action.value)) return state;
      return { ...state, activity: action.value,
        usefulness: action.value === state.activity ? state.usefulness : null };
    case 'choose_usefulness':
      if (!state.activity || !PREVIEW_USEFULNESS.some(choice => choice.id === action.value)) return state;
      return { ...state, usefulness: action.value };
    case 'choose_attribution':
      if (action.invitationId !== null && !getDoorwayAudience('writers-studio', action.invitationId)) return state;
      return { ...state, invitationId: action.invitationId };
    case 'review_preview': {
      const draft = preparePreviewDraft(state);
      return draft ? { phase: 'review', draft } : state;
    }
    default:
      return state;
  }
}
