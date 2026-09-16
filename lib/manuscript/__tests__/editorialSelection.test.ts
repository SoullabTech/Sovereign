import { projectEditorialSelection } from '../editorialRuntime/selection';

describe('editorial passage selection', () => {
  it('projects Unicode code-point ranges, not UTF-16 units', () => {
    const body = 'A😀BC';
    const out = projectEditorialSelection(body, { start: 1, end: 3 });
    expect(out).toEqual({ ok: true, text: '😀B', range: { start: 1, end: 3 } });
  });

  it('refuses an empty selection', () => {
    expect(projectEditorialSelection('abc', { start: 1, end: 1 }))
      .toEqual({ ok: false, reason: 'empty_selection' });
  });

  it('refuses a range beyond the section', () => {
    expect(projectEditorialSelection('abc', { start: 0, end: 4 }))
      .toEqual({ ok: false, reason: 'invalid_range' });
  });

  it('refuses wording that occurs twice because the persisted locus has no range', () => {
    expect(projectEditorialSelection('again and again', { start: 0, end: 5 }))
      .toEqual({ ok: false, reason: 'selection_ambiguous' });
  });
});
