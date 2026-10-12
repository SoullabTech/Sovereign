import {
  initialParticipationPreview as initial, transitionParticipationPreview as conforming,
  preparePreviewDraft, type ParticipationPreviewState, type ParticipationPreviewAction,
} from '../participationPreview';

type Step = (state: ParticipationPreviewState, action: ParticipationPreviewAction) => ParticipationPreviewState;
const editing = () => conforming(initial(), { type: 'begin_preview' });
const ready = () => conforming(conforming(editing(), { type: 'choose_activity', value: 'considered_revision' }),
  { type: 'choose_usefulness', value: 'helped' });
interface Defeat { name: string; law: (step: Step) => void; candidate: Step }

// These deliberately wrong adapters are test-only. They do not become production options.
const defeats: Defeat[] = [
  {
    name: 'B1 — inferred participation',
    law: step => expect(step(initial(), { type: 'choose_activity', value: 'considered_revision' })).toEqual(initial()),
    candidate: (state, action) => conforming(state.phase === 'invitation' && action.type === 'choose_activity' ? editing() : state, action),
  },
  {
    name: 'B2 — bundled attribution',
    law: step => expect(step(initial(), { type: 'begin_preview' })).toMatchObject({ invitationId: null }),
    candidate: (state, action) => {
      const next = conforming(state, action);
      return next.phase === 'editing' && action.type === 'begin_preview' ? { ...next, invitationId: 'wisdom-carrier' } : next;
    },
  },
  {
    name: 'B3 — activity mistaken for usefulness',
    law: step => expect(preparePreviewDraft(step(editing(), { type: 'choose_activity', value: 'considered_revision' }))).toBeNull(),
    candidate: (state, action) => {
      const next = conforming(state, action);
      return next.phase === 'editing' && action.type === 'choose_activity' ? { ...next, usefulness: 'helped' } : next;
    },
  },
  {
    name: 'B3 — stale usefulness retained after a different act',
    law: step => expect(step(ready(), { type: 'choose_activity', value: 'discussed_passage' })).toMatchObject({ usefulness: null }),
    candidate: (state, action) => {
      const next = conforming(state, action);
      return next.phase === 'editing' && state.phase === 'editing' && action.type === 'choose_activity'
        ? { ...next, usefulness: state.usefulness } : next;
    },
  },
  {
    name: 'B4 — completion skips exact review',
    law: step => expect(step(ready(), { type: 'finish_preview' })).toEqual(ready()),
    candidate: (state, action) => action.type === 'finish_preview' && preparePreviewDraft(state)
      ? { phase: 'complete', draft: preparePreviewDraft(state)! } : conforming(state, action),
  },
  {
    name: 'B5 — unknown invitation accepted',
    law: step => expect(step(ready(), { type: 'choose_attribution', invitationId: 'invented' })).toEqual(ready()),
    candidate: (state, action) => action.type === 'choose_attribution' && state.phase === 'editing'
      ? { ...state, invitationId: action.invitationId } : conforming(state, action),
  },
  {
    name: 'B6 — cosmetic clearing leaves draft behind',
    law: step => expect(step(ready(), { type: 'clear_preview' })).toEqual({ phase: 'cleared' }),
    candidate: (state, action) => action.type === 'clear_preview' ? state : conforming(state, action),
  },
  {
    name: 'B7 — rehearsal mislabeled as persisted',
    law: step => {
      const reviewed = conforming(ready(), { type: 'review_preview' });
      expect(preparePreviewDraft(step(reviewed, { type: 'finish_preview' }))?.standing).toBe('preview_only_not_submitted');
    },
    candidate: (state, action) => {
      const next = conforming(state, action);
      return next.phase === 'complete'
        ? { ...next, draft: { ...next.draft, standing: 'submitted' } } as unknown as ParticipationPreviewState : next;
    },
  },
];

describe('C7B1 named wrong-design checks', () => {
  it.each(defeats)('$name: conforming passes, named defect fails', ({ law, candidate }) => {
    expect(() => law(conforming)).not.toThrow();
    expect(() => law(candidate)).toThrow();
  });
});
