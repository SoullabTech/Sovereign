import {
  EMPTY_COVER_SESSION, activeCoverEdition, coverSessionReducer, startCoverSession,
} from '../coverDesignSession';

const apply = (s: ReturnType<typeof startCoverSession>, ...actions: Parameters<typeof coverSessionReducer>[1][]) =>
  actions.reduce(coverSessionReducer, s);

describe('Cover study undo/redo is author-owned and does not create a second Source store', () => {
  it('seeds independent in-memory Paperback / Hardcover / Kindle variants from verified title', () => {
    const session = startCoverSession('Fictional Book');
    expect(session.present?.selected).toBe('paperback');
    expect(session.present?.editions.paperback.title).toBe('Fictional Book');
    expect(session.present?.editions.hardcover.title).toBe('Fictional Book');
    expect(session.present?.editions.kindle.title).toBe('Fictional Book');
    expect(session.past).toEqual([]);
    expect(session.future).toEqual([]);
    expect(session.present?.editions.paperback).not.toBe(session.present?.editions.kindle);
  });

  it('keeps each author-edited edition separate across target switching and Undo', () => {
    let s = apply(startCoverSession('Fictional Book'),
      { type: 'text', field: 'title', value: 'Paperback Own Words' },
      { type: 'target', value: 'kindle' },
      { type: 'text', field: 'title', value: 'Kindle Own Words' },
      { type: 'palette', value: 'ink' },
    );
    expect(s.present?.editions.paperback.title).toBe('Paperback Own Words');
    expect(s.present?.editions.kindle.title).toBe('Kindle Own Words');
    expect(s.present?.editions.hardcover.title).toBe('Fictional Book');
    expect(s.present && activeCoverEdition(s.present).palette).toBe('ink');
    s = coverSessionReducer(s, { type: 'undo' });
    expect(s.present && activeCoverEdition(s.present).palette).toBe('forest');
    s = coverSessionReducer(s, { type: 'undo' });
    expect(s.present?.editions.kindle.title).toBe('Fictional Book');
    s = coverSessionReducer(s, { type: 'redo' });
    expect(s.present?.editions.kindle.title).toBe('Kindle Own Words');
    expect(s.present?.editions.paperback.title).toBe('Paperback Own Words');
  });

  it('moves only the current edition title in bounded reversible pixel steps', () => {
    let s = startCoverSession('Book');
    s = coverSessionReducer(s, { type: 'moveTitle', delta: -12 });
    expect(s.present?.editions.paperback.titleOffsetPx).toBe(-12);
    expect(s.present?.editions.hardcover.titleOffsetPx).toBe(0);
    for (let i = 0; i < 10; i++) s = coverSessionReducer(s, { type: 'moveTitle', delta: -12 });
    expect(s.present?.editions.paperback.titleOffsetPx).toBe(-48);
    const same = coverSessionReducer(s, { type: 'moveTitle', delta: -12 });
    expect(same).toBe(s);
    expect(s.past.length).toBe(4);
    s = coverSessionReducer(s, { type: 'undo' });
    expect(s.present?.editions.paperback.titleOffsetPx).toBe(-36);
  });

  it('bounds text length and history; changed-text Undo/Redo remains deterministic', () => {
    let s = startCoverSession('Fiction');
    s = coverSessionReducer(s, { type: 'text', field: 'backText', value: 'c'.repeat(2500) });
    expect(s.present?.editions.paperback.backText).toHaveLength(850);
    for (let i = 0; i < 55; i++) {
      s = coverSessionReducer(s, { type: 'text', field: 'title', value: 'Author draft ' + i });
    }
    expect(s.past.length).toBe(40);
    const current = s.present?.editions.paperback.title;
    s = coverSessionReducer(s, { type: 'undo' });
    expect(s.present?.editions.paperback.title).not.toBe(current);
    s = coverSessionReducer(s, { type: 'text', field: 'title', value: 'Author changes the sentence' });
    expect(s.future).toEqual([]);
    const noRedo = coverSessionReducer(s, { type: 'redo' });
    expect(noRedo).toBe(s);
  });

  it('closing/reset and starting another Work cannot resurrect words from the first Work', () => {
    const first = apply(startCoverSession('Private invented title'),
      { type: 'text', field: 'backText', value: 'Private fictional copy that must disappear' },
    );
    const cleared = coverSessionReducer(first, { type: 'clear' });
    expect(cleared).toBe(EMPTY_COVER_SESSION);
    expect(JSON.stringify(cleared)).not.toContain('Private fictional copy');
    expect(coverSessionReducer(cleared, { type: 'undo' })).toBe(cleared);
    const newWork = coverSessionReducer(cleared, { type: 'start', title: 'A Second Fictional Book' });
    expect(JSON.stringify(newWork)).not.toContain('Private fictional');
    expect(newWork.past).toHaveLength(0);
  });
});
