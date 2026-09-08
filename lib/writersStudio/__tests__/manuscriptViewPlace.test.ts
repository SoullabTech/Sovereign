/**
 * WS-WHOLE-MANUSCRIPT-01 — falsifiers for the place the surfaces may assert.
 *
 * The founder's invariant, and the only thing these exist to protect:
 *
 *     the mode switch may TRANSFER place, but it may not INFER place.
 *
 * A representational surface — the outline's gold row, the `s=` parameter —
 * must consume what was observed. Reaching for the nearest available value
 * instead is how a system states a fact about a writer's position that nothing
 * established.
 */

import {
  openingWholeSection, placeForMode, returningSection,
} from '../manuscriptViewPlace';

describe('the place each view may assert', () => {
  it('Section view is placed by its one mounted editor', () => {
    expect(placeForMode('section', { sectionActiveId: 's20', wholePlaceId: null })).toBe('s20');
  });

  it('Whole view is placed by what Whole observed', () => {
    expect(placeForMode('whole', { sectionActiveId: 's20', wholePlaceId: 's118' })).toBe('s118');
  });

  it('⛔ Whole view NEVER falls back to the section the writer arrived from', () => {
    /* THE DEFECT THIS EXISTS FOR. `sectionActiveId` names where the writer was
       an hour ago. Substituting it would leave the rail's gold row and the URL
       both confidently naming a place the writer has long since left. */
    expect(placeForMode('whole', { sectionActiveId: 's20', wholePlaceId: null })).toBeNull();
  });

  it('null survives to the caller rather than being smoothed away', () => {
    /* A renderer may choose what to show when there is no known place. It may
       not launder that choice back into a claim that the writer was there. */
    expect(placeForMode('section', { sectionActiveId: null, wholePlaceId: 's118' })).toBeNull();
  });
});

describe('what the switch may carry across', () => {
  it('returning to Section opens where Whole was actually observed', () => {
    expect(returningSection('s118')).toBe('s118');
  });

  it('returning with nothing observed transfers nothing', () => {
    /* "Nothing to transfer" leaves Section view where it already was. It does
       not move the writer somewhere no one observed. */
    expect(returningSection(null)).toBeNull();
  });

  it('going to Whole opens at the section being left', () => {
    /* Section view's place is unambiguous — one editor is mounted, and it is
       where the writer is — so it transfers as an opening position. */
    expect(openingWholeSection('s20')).toBe('s20');
    expect(openingWholeSection(null)).toBeNull();
  });
});

describe('the two directions are not the same operation', () => {
  it('each reads only the side that observed something', () => {
    /* The asymmetry is the point: the views know where the writer is by
       different means, and collapsing them into one symmetric "restore" would
       reintroduce exactly the inference this bars. */
    const inputs = { sectionActiveId: 's20', wholePlaceId: 's118' };
    expect(placeForMode('section', inputs)).not.toBe(placeForMode('whole', inputs));
    expect(returningSection(inputs.wholePlaceId)).toBe('s118');
    expect(openingWholeSection(inputs.sectionActiveId)).toBe('s20');
  });
});
