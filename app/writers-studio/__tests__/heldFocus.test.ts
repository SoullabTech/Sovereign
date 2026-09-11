import {
  capture,
  covers,
  isValid,
  label,
  narrow,
  quote,
  textOf,
  widen,
  type HeldFocus,
  type SectionRef,
} from '../field/heldFocus';

const S1 = 'The first paragraph sits here.\n\nA second paragraph follows it.\n\nAnd a third.';
const S2 = 'Another section entirely.';
const SECTIONS: SectionRef[] = [
  { id: 'a', position: 0, heading: 'One' },
  { id: 'b', position: 1, heading: 'Two' },
];
const bodies: Record<string, string> = { a: S1, b: S2 };
const bodyOf = (id: string) => bodies[id];

describe('a held focus is coordinates, not a DOM range', () => {
  it('captures section identity and explicit offsets', () => {
    const f = capture('a', 4, 9, bodyOf)!;
    expect(f.sectionIds).toEqual(['a']);
    expect(f.start).toBe(4);
    expect(f.end).toBe(9);
    expect(f.capturedText).toBe('first');
    expect(f.scale).toBe('selection');
  });

  it('refuses an empty or whitespace-only frame', () => {
    expect(capture('a', 5, 5, bodyOf)).toBeNull();
    expect(capture('a', 9, 8, bodyOf)).toBeNull();
    expect(capture('a', 30, 32, bodyOf)).toBeNull(); /* the blank line between paragraphs */
  });

  /**
   * ⭐ THE VIRTUALIZATION PROPERTY. Whole Manuscript mounts only the editors in
   * a window. A focus that lived in the DOM would vanish when its editor was
   * evicted. These coordinates do not evict — nothing here reads the document
   * at all.
   */
  it('survives its editor being evicted, because it never held one', () => {
    const f = capture('a', 4, 9, bodyOf)!;
    /* Eviction changes nothing the model can see. */
    expect(isValid(f, bodyOf)).toBe(true);
    expect(textOf(f, bodyOf)).toBe('first');
  });
});

describe('when the text moves under a held focus', () => {
  const f = capture('a', 4, 9, bodyOf)!;

  it('stays held while the coordinates still name what was framed', () => {
    expect(isValid(f, bodyOf)).toBe(true);
  });

  /** ⛔ Invalidate. Never relocate because similar words exist elsewhere. */
  it('is invalid once the coordinates name different words', () => {
    const edited = (id: string) =>
      id === 'a' ? 'XX ' + S1 : bodies[id];
    expect(isValid(f, edited)).toBe(false);
    expect(textOf(f, edited)).not.toBe('first');
  });

  it('does not go looking for the captured text somewhere else', () => {
    /* The same word still exists in the edited body, further along. A model
       that searched would call this valid; this one compares coordinates. */
    const edited = (id: string) => (id === 'a' ? 'XX ' + S1 : bodies[id]);
    expect(edited('a')).toContain('first');
    expect(isValid(f, edited)).toBe(false);
  });

  it('is invalid when its section is gone entirely', () => {
    const gone = (id: string) => (id === 'a' ? '' : bodies[id]);
    expect(isValid(f, gone)).toBe(false);
  });
});

describe('the ladder is structural, never semantic', () => {
  it('widens a selection to its paragraph', () => {
    const sel = capture('a', 10, 19, bodyOf)!;
    const p = widen(sel, SECTIONS, bodyOf)!;
    expect(p.scale).toBe('paragraph');
    expect(p.capturedText).toBe('The first paragraph sits here.');
  });

  it('widens a paragraph to its section', () => {
    const sel = capture('a', 10, 19, bodyOf)!;
    const p = widen(sel, SECTIONS, bodyOf)!;
    const s = widen(p, SECTIONS, bodyOf)!;
    expect(s.scale).toBe('section');
    expect(s.capturedText).toBe(S1);
    expect(s.start).toBe(0);
    expect(s.end).toBe(S1.length);
  });

  it('widens a section to the whole Work, in document order', () => {
    const sel = capture('a', 10, 19, bodyOf)!;
    const s = widen(widen(sel, SECTIONS, bodyOf)!, SECTIONS, bodyOf)!;
    const w = widen(s, SECTIONS, bodyOf)!;
    expect(w.scale).toBe('work');
    expect(w.sectionIds).toEqual(['a', 'b']);
    expect(w.capturedText).toContain(S2);
    expect(isValid(w, bodyOf)).toBe(true);
  });

  it('stops at the whole Work', () => {
    let f: HeldFocus | null = capture('a', 10, 19, bodyOf)!;
    const seen: string[] = [f.scale];
    for (let i = 0; i < 6; i++) {
      const next: HeldFocus | null = widen(f as HeldFocus, SECTIONS, bodyOf);
      if (!next) break;
      f = next;
      seen.push(next.scale);
    }
    expect(seen).toEqual(['selection', 'paragraph', 'section', 'work']);
    expect(widen(f as HeldFocus, SECTIONS, bodyOf)).toBeNull();
  });

  /** A selection that already is its paragraph skips the rung rather than
   *  offering a Wider that visibly does nothing. */
  it('does not offer a rung that would not move', () => {
    const whole = capture('a', 0, 30, bodyOf)!;
    const next = widen(whole, SECTIONS, bodyOf)!;
    expect(next.scale).toBe('section');
  });

  /** Narrowing is memory. Deriving a smaller focus would invent an attention
   *  the writer never had. */
  it('narrows only to an aperture the writer actually came from', () => {
    const sel = capture('a', 10, 19, bodyOf)!;
    const p = widen(sel, SECTIONS, bodyOf)!;
    const r = narrow([sel, p]);
    expect(r.focus).toBe(p);
    expect(r.ladder).toEqual([sel]);
    expect(narrow([]).focus).toBeNull();
  });
});

describe('one name for what is held', () => {
  it('names a passage by the section it sits in', () => {
    expect(label(capture('a', 4, 9, bodyOf)!, SECTIONS)).toBe('passage in section 1');
  });

  it('names a paragraph as a paragraph', () => {
    const p = widen(capture('a', 10, 19, bodyOf)!, SECTIONS, bodyOf)!;
    expect(label(p, SECTIONS)).toBe('paragraph in section 1');
  });

  it('names a section and the whole work plainly', () => {
    const s: HeldFocus = { scale: 'section', sectionIds: ['b'], start: 0, end: S2.length, capturedText: S2 };
    expect(label(s, SECTIONS)).toBe('section 2');
    const w: HeldFocus = { scale: 'work', sectionIds: ['a', 'b'], start: 0, end: 0, capturedText: '' };
    expect(label(w, SECTIONS)).toBe('whole work');
  });

  it('quotes a marker, never the whole passage', () => {
    const s: HeldFocus = { scale: 'section', sectionIds: ['a'], start: 0, end: S1.length, capturedText: S1 };
    const q = quote(s, bodyOf, 20)!;
    expect(q.length).toBeLessThanOrEqual(21);
    expect(q.endsWith('…')).toBe(true);
    expect(q).not.toContain('\n');
  });

  it('knows which sections it covers', () => {
    const w: HeldFocus = { scale: 'work', sectionIds: ['a', 'b'], start: 0, end: 0, capturedText: '' };
    expect(covers(w, 'b')).toBe(true);
    expect(covers(null, 'b')).toBe(false);
    expect(covers(capture('a', 4, 9, bodyOf)!, 'b')).toBe(false);
  });
});
