import {
  DEFAULT_EDITORIAL_SCALE,
  EDITORIAL_SCALES,
  EDITORIAL_ZOOM_LAW,
  mayDescend,
  nextScale,
} from '@/lib/writersStudio/editorialZoom';

describe('Writer Studio editorial zoom law', () => {
  it('begins at the whole Work and descends macro to micro', () => {
    expect(DEFAULT_EDITORIAL_SCALE).toBe('whole-work');
    expect(EDITORIAL_SCALES).toEqual([
      'whole-work', 'part', 'chapter', 'section', 'passage', 'language',
    ]);
    expect(nextScale('whole-work')).toBe('part');
    expect(nextScale('chapter')).toBe('section');
    expect(nextScale('language')).toBeNull();
  });

  it('does not descend merely because detail exists', () => {
    expect(mayDescend('whole-work', 'chapter', false)).toBe(false);
    expect(mayDescend('whole-work', 'chapter', true)).toBe(true);
  });

  it('requires the local edit to remain inside the larger editorial question', () => {
    expect(EDITORIAL_ZOOM_LAW.join(' ')).toContain(
      'Never let a local edit silently redefine the larger editorial question.',
    );
    expect(EDITORIAL_ZOOM_LAW.join(' ')).toContain(
      'Always preserve a return path',
    );
  });
});
