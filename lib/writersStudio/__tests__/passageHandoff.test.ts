import { decidePassageHandoff, decodePassageHandoff, encodePassageHandoff } from '../passageHandoff';

const base = { sectionIds: ['s1'], saveStateOf: () => 'clean', bodyOf: () => 'The rain kept its counsel. The town had no name.' };
it('holds exact, unique words in a saved chapter, and nothing else', () => {
  expect(decidePassageHandoff({ ...base, handoff: { sectionId: 's1', text: 'The town had no name.' } }))
    .toEqual({ kind: 'hold', sectionId: 's1', start: 27, end: 48, text: 'The town had no name.' });
  expect(decidePassageHandoff({ ...base, handoff: { sectionId: 's1', text: 'The town had a name.' } })).toMatchObject({ kind: 'refuse', reason: 'missing' });
  expect(decidePassageHandoff({ ...base, handoff: { sectionId: 's1', text: 'The' } })).toMatchObject({ kind: 'refuse', reason: 'ambiguous' });
  expect(decidePassageHandoff({ ...base, saveStateOf: () => 'saving', handoff: { sectionId: 's1', text: 'The town' } })).toMatchObject({ reason: 'unsaved' });
  expect(decidePassageHandoff({ ...base, saveStateOf: () => undefined, handoff: { sectionId: 's1', text: 'The town' } })).toMatchObject({ reason: 'not_ready' });
  expect(decidePassageHandoff({ ...base, handoff: { sectionId: 'other', text: 'The town' } })).toMatchObject({ reason: 'no_section' });
});
it('round-trips and rejects malformed hand-offs', () => {
  expect(decodePassageHandoff(encodePassageHandoff({ sectionId: 's1', text: 'x y' }))).toEqual({ sectionId: 's1', text: 'x y' });
  expect(decodePassageHandoff('{"sectionId":1}')).toBeNull();
  expect(decodePassageHandoff('not json')).toBeNull();
  expect(decodePassageHandoff(null)).toBeNull();
});
