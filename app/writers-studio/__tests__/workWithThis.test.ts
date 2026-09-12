import * as fs from 'fs';
import * as path from 'path';
import type { EvidenceRef } from '@/lib/manuscript/development/evidenceRef';
import { focusAnchorsFor, hasFocusAnchors, type FocusAnchor } from '@/lib/writersStudio/focusAnchors';
import {
  decodeAnchors, encodeAnchors, requestedOrigin, workWithThisHref,
} from '../workWithThis';
import {
  activeMember, resolveFocusSet, utf16IndexOf, withActive, type FocusSet,
} from '../field/focusSet';

/**
 * WORK WITH THIS — W1–W12, predeclared by the founder BEFORE implementation.
 *
 * The gesture means exactly: take this historical developmental finding into
 * the living Work so I can work on it now. Everything below exists to hold it
 * to that and to nothing more — in particular, to keep it NARROWER than the
 * eventual MAIA crossing, so the two boundaries cannot collapse into one.
 */

const S = { a: 'aaaaaaaa-0000-4000-8000-000000000001', b: 'aaaaaaaa-0000-4000-8000-000000000002', c: 'aaaaaaaa-0000-4000-8000-000000000003' };

const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
const raw = (...p: string[]) => fs.readFileSync(path.join(__dirname, '..', ...p), 'utf8');
const roomRaw = raw('develop', 'DevelopRoom.tsx');
const room = strip(roomRaw);
const panel = strip(raw('field', 'FocusSetPanel.tsx'));

/**
 * The `Work with this` control and NOTHING around it — sliced from the raw
 * source before comments go, so the section markers are still there to slice
 * on. A boundary test that silently widened to the whole file would pass by
 * accident and fail by accident, which is the one thing a boundary test may
 * not do.
 */
const doorStart = roomRaw.indexOf('function WorkWithThis(');
const doorEnd = roomRaw.indexOf('/* ── your standing');
if (doorStart < 0 || doorEnd <= doorStart) throw new Error('the Work with this control could not be located');
const door = strip(roomRaw.slice(doorStart, doorEnd));

const SECTIONS = [
  { id: S.a, position: 0, heading: 'Arrival' },
  { id: S.b, position: 1, heading: null },
  { id: S.c, position: 2, heading: 'After' },
];
const BODIES: Record<string, string> = {
  [S.a]: 'The fire was already lit when we came down the path.',
  [S.b]: 'Someone had banked it. 🜂 Nobody said whose watch it had been.',
  [S.c]: 'By morning the circle of stones was cold again.',
};
const bodyOf = (id: string) => BODIES[id] ?? '';

function seed(anchors: FocusAnchor[], originRevision = 7, currentRevision: number | null = 7): FocusSet {
  return resolveFocusSet({ anchors, originRevision, currentRevision, sections: SECTIONS, bodyOf, label: 'o1 · recurrence' });
}

/* ══ W5 · the anchors are EXACTLY the ones cited ═══════════════════════════ */

describe('W5 — the Focus Set contains exactly the observation’s declared anchors', () => {
  it('a section, a passage and a run yield their own places and no others', () => {
    const refs: EvidenceRef[] = [
      { kind: 'section', sectionId: S.a },
      { kind: 'passage', sectionId: S.b, range: { space: 'stored_section_text', start: 3, end: 40 } },
      { kind: 'section-run', sectionIds: [S.b, S.c] },
    ];
    expect(focusAnchorsFor(refs)).toEqual([
      { kind: 'section', sectionId: S.a },
      { kind: 'passage', sectionId: S.b, range: { space: 'stored_section_text', start: 3, end: 40 } },
      { kind: 'section', sectionId: S.b },
      { kind: 'section', sectionId: S.c },
    ]);
  });

  it('no adjacent or “probably related” section is ever added', () => {
    const only = focusAnchorsFor([{ kind: 'section', sectionId: S.b }]);
    expect(only).toHaveLength(1);
    expect(only.map((a) => a.sectionId)).not.toContain(S.a);
    expect(only.map((a) => a.sectionId)).not.toContain(S.c);
  });

  it('structural evidence yields NO anchor — a division is not its sections', () => {
    expect(focusAnchorsFor([{ kind: 'structure-unit', unitId: 'u1' }])).toEqual([]);
    expect(focusAnchorsFor([{ kind: 'structure-units', unitIds: ['u1', 'u2'] }])).toEqual([]);
    expect(focusAnchorsFor([{ kind: 'structure-topology' }])).toEqual([]);
    expect(hasFocusAnchors([{ kind: 'structure-topology' }])).toBe(false);
  });

  it('the same place cited twice is one member; two ranges in one section are two', () => {
    const refs: EvidenceRef[] = [
      { kind: 'section', sectionId: S.a },
      { kind: 'section', sectionId: S.a },
      { kind: 'passage', sectionId: S.a, range: { space: 'stored_section_text', start: 0, end: 5 } },
      { kind: 'passage', sectionId: S.a, range: { space: 'stored_section_text', start: 6, end: 9 } },
      { kind: 'passage', sectionId: S.a, range: { space: 'stored_section_text', start: 0, end: 5 } },
    ];
    expect(focusAnchorsFor(refs)).toHaveLength(3);
  });

  /**
   * ⭐⭐ THE NEGATIVE FALSIFIER, predeclared by the founder:
   *
   *   Replace "exact cited anchors" with "all sections implicated by the
   *   phenomenon." THAT MUST FAIL.
   *
   * A recurrence spanning §a and §c plainly "implicates" §b — it is between
   * them, a reader passes through it, and an implementation that reached for
   * the span would feel more helpful. It would also have turned an
   * evidence-bound observation into model-authorized scope on the way through
   * the door. This test exists so that implementation cannot pass.
   */
  it('the WIDENED implementation fails this suite’s own W5 assertion', () => {
    const widened = (refs: readonly EvidenceRef[]): FocusAnchor[] => {
      const cited = focusAnchorsFor(refs);
      const positions = cited
        .map((a) => SECTIONS.findIndex((s) => s.id === a.sectionId))
        .filter((i) => i >= 0);
      if (!positions.length) return cited;
      const lo = Math.min(...positions);
      const hi = Math.max(...positions);
      /* "everything the phenomenon is about" */
      return SECTIONS.slice(lo, hi + 1).map((s) => ({ kind: 'section', sectionId: s.id }));
    };
    const refs: EvidenceRef[] = [
      { kind: 'section', sectionId: S.a },
      { kind: 'section', sectionId: S.c },
    ];
    const exact = focusAnchorsFor(refs);
    const wide = widened(refs);
    expect(exact.map((a) => a.sectionId)).toEqual([S.a, S.c]);
    expect(wide.map((a) => a.sectionId)).toEqual([S.a, S.b, S.c]);
    // The assertion W5 makes of the real implementation, made of the widened one:
    expect(() => expect(wide.map((a) => a.sectionId)).not.toContain(S.b)).toThrow();
  });
});

/* ══ W11 · nothing authored travels ════════════════════════════════════════ */

describe('W11 — no authored manuscript text is serialized into the route', () => {
  const anchors: FocusAnchor[] = [
    { kind: 'section', sectionId: S.a },
    { kind: 'passage', sectionId: S.b, range: { space: 'stored_section_text', start: 3, end: 40 } },
  ];
  const href = workWithThisHref('/writers-studio/canvas', {
    manuscriptId: 'm-1', readingId: 'r-7', observationKey: 'o1',
    revisionNumber: 7, anchors, phenomenon: 'recurrence',
  });

  it('the href carries identities, a version and a closed vocabulary token — and no prose', () => {
    const decoded = decodeURIComponent(href);
    for (const body of Object.values(BODIES)) {
      for (const word of body.split(' ')) {
        if (word.length > 5) expect(decoded).not.toContain(word);
      }
    }
    expect(decoded).toContain('m=m-1');
    expect(decoded).toContain('from=r-7');
    expect(decoded).toContain('o=o1');
    expect(decoded).toContain('rev=7');
    expect(decoded).toContain('p=recurrence');
  });

  it('round-trips through the URL exactly, offsets and order intact', () => {
    const params = new URLSearchParams(href.slice(href.indexOf('?') + 1));
    const back = requestedOrigin(params);
    expect(back.kind).toBe('origin');
    if (back.kind !== 'origin') return;
    expect(back.origin).toEqual({
      manuscriptId: 'm-1', readingId: 'r-7', observationKey: 'o1',
      revisionNumber: 7, anchors, phenomenon: 'recurrence',
    });
  });

  it('a phenomenon outside the ratified family is dropped, never displayed', () => {
    const p = new URLSearchParams(href.slice(href.indexOf('?') + 1));
    p.set('p', 'campfire vibes');
    const back = requestedOrigin(p);
    expect(back.kind).toBe('origin');
    if (back.kind === 'origin') expect(back.origin.phenomenon).toBeNull();
  });
});

/* ══ W12 · unknown or missing origin refuses honestly ══════════════════════ */

describe('W12 — a missing or unknown origin refuses rather than inventing a Focus', () => {
  it('no origin params at all is ABSENCE, not an error', () => {
    expect(requestedOrigin(new URLSearchParams('m=m-1')).kind).toBe('none');
    expect(requestedOrigin(new URLSearchParams('')).kind).toBe('none');
  });

  for (const [q, why] of [
    ['from=r-7&o=o1&rev=7&at=' + S.a, 'no work was named'],
    ['m=m-1&o=o1&rev=7&at=' + S.a, 'no reading was named'],
    ['m=m-1&from=r-7&rev=7&at=' + S.a, 'no observation was named'],
    ['m=m-1&from=r-7&o=o1&at=' + S.a, 'the version it was read at is missing or unreadable'],
    ['m=m-1&from=r-7&o=o1&rev=seven&at=' + S.a, 'the version it was read at is missing or unreadable'],
    ['m=m-1&from=r-7&o=o1&rev=7', 'the places it cited could not be read'],
    ['m=m-1&from=r-7&o=o1&rev=7&at=', 'the places it cited could not be read'],
    [`m=m-1&from=r-7&o=o1&rev=7&at=${S.a}@x-3`, 'the places it cited could not be read'],
    [`m=m-1&from=r-7&o=o1&rev=7&at=${S.a}@9-3`, 'the places it cited could not be read'],
  ] as const) {
    it(`refuses: ${why} — ${q.slice(0, 44)}`, () => {
      const r = requestedOrigin(new URLSearchParams(q));
      expect(r.kind).toBe('malformed');
      if (r.kind === 'malformed') expect(r.why).toBe(why);
    });
  }

  it('one unreadable anchor refuses the WHOLE list — never a silently short set', () => {
    expect(decodeAnchors(`${S.a},${S.b}@bad`)).toBeNull();
    expect(decodeAnchors(`${S.a},`)).toBeNull();
    expect(encodeAnchors([{ kind: 'section', sectionId: S.a }])).toBe(S.a);
  });
});

/* ══ W6 · W8 · W9 — arrival, resolution, staleness ═════════════════════════ */

describe('W6 — no edit target is inferred on arrival', () => {
  it('a five-place set arrives with no active target', () => {
    const set = seed([
      { kind: 'section', sectionId: S.a },
      { kind: 'passage', sectionId: S.b, range: { space: 'stored_section_text', start: 0, end: 4 } },
      { kind: 'section', sectionId: S.c },
    ]);
    expect(set.members).toHaveLength(3);
    expect(set.activeIndex).toBeNull();
    expect(activeMember(set)).toBeNull();
  });

  it('the writer chooses it, and may unchoose it', () => {
    const set = seed([{ kind: 'section', sectionId: S.a }, { kind: 'section', sectionId: S.c }]);
    const chosen = withActive(set, 1);
    expect(chosen.activeIndex).toBe(1);
    expect(activeMember(chosen)?.anchor.sectionId).toBe(S.c);
    expect(withActive(chosen, null).activeIndex).toBeNull();
    // Membership is untouched by choosing: five declared places stay five.
    expect(chosen.members).toHaveLength(set.members.length);
  });

  it('a member that cannot stand cannot become the edit target', () => {
    const set = seed([{ kind: 'passage', sectionId: S.a, range: { space: 'stored_section_text', start: 9000, end: 9001 } }]);
    expect(set.members[0].state).toBe('stale');
    expect(withActive(set, 0).activeIndex).toBeNull();
    expect(withActive(set, 42).activeIndex).toBeNull();
  });
});

describe('W8 — members are resolved against the CURRENT Work, not copied blindly', () => {
  it('a whole-section anchor names the current body, at any version', () => {
    const set = seed([{ kind: 'section', sectionId: S.a }], 7, 11);
    expect(set.members[0].state).toBe('current');
    expect(set.members[0].focus?.capturedText).toBe(BODIES[S.a]);
    expect(set.members[0].position).toBe(1);
    expect(set.members[0].heading).toBe('Arrival');
  });

  it('code-point evidence offsets are converted to the UTF-16 units the substrate speaks', () => {
    // §b holds an astral character at code point 22; after it the two units diverge.
    const body = BODIES[S.b];
    expect([...body].length).not.toBe(body.length);
    const set = seed([{ kind: 'passage', sectionId: S.b, range: { space: 'stored_section_text', start: 0, end: 30 } }]);
    expect(set.members[0].focus?.capturedText).toBe([...body].slice(0, 30).join(''));
    // The un-converted implementation would have cut here instead:
    expect(set.members[0].focus?.capturedText).not.toBe(body.slice(0, 30));
    expect(utf16IndexOf(body, 30)).toBe(31);
    expect(utf16IndexOf('abc', 9)).toBeNull();
  });

  it('a section no longer in the Work is GONE — reported, never dropped', () => {
    const set = seed([
      { kind: 'section', sectionId: S.a },
      { kind: 'section', sectionId: 'deleted-section' },
    ]);
    expect(set.members).toHaveLength(2);
    expect(set.members[1].state).toBe('gone');
    expect(set.members[1].focus).toBeNull();
    expect(set.members[1].position).toBeNull();
  });
});

describe('W9 — a stale historical range cannot silently relocate or widen', () => {
  it('a range past the end of the current section is STALE, and is not clamped', () => {
    const set = seed([{ kind: 'passage', sectionId: S.a, range: { space: 'stored_section_text', start: 10, end: 999 } }]);
    expect(set.members[0].state).toBe('stale');
    expect(set.members[0].focus).toBeNull();
    // Clamping to the section end would have produced a focus. It did not.
    expect(set.members[0].anchor).toEqual({ kind: 'passage', sectionId: S.a, range: { space: 'stored_section_text', start: 10, end: 999 } });
  });

  it('a later kept version makes a fitting range UNVERIFIED — never current', () => {
    const set = seed([{ kind: 'passage', sectionId: S.a, range: { space: 'stored_section_text', start: 4, end: 8 } }], 7, 11);
    expect(set.members[0].state).toBe('unverified');
    expect(set.members[0].focus).not.toBeNull();
  });

  it('an unknown current version cannot license a currency claim', () => {
    const set = seed([{ kind: 'passage', sectionId: S.a, range: { space: 'stored_section_text', start: 4, end: 8 } }], 7, null);
    expect(set.members[0].state).toBe('unverified');
  });

  it('the same version, and only then, is the claim CURRENT', () => {
    const set = seed([{ kind: 'passage', sectionId: S.a, range: { space: 'stored_section_text', start: 4, end: 8 } }], 7, 7);
    expect(set.members[0].state).toBe('current');
  });

  it('the historical anchor is never rewritten by resolution, in any state', () => {
    const anchors: FocusAnchor[] = [
      { kind: 'passage', sectionId: S.a, range: { space: 'stored_section_text', start: 4, end: 8 } },
      { kind: 'passage', sectionId: S.a, range: { space: 'stored_section_text', start: 10, end: 999 } },
      { kind: 'section', sectionId: 'deleted-section' },
    ];
    const before = JSON.parse(JSON.stringify(anchors));
    const set = seed(anchors, 7, 11);
    expect(set.members.map((m) => m.anchor)).toEqual(before);
    expect(anchors).toEqual(before);
  });
});

/* ══ W1–W4, W7, W10 — the door itself ═════════════════════════════════════ */

describe('W1 — the gesture appears on a valid developmental observation', () => {
  it('the room renders it from the observation’s declared anchors', () => {
    expect(door).toMatch(/data-work-with-this=\{o\.key\}/);
    expect(door).toMatch(/anchors: o\.anchors/);
    expect(room).toMatch(/anchors=\{?o\.anchors|anchors: o\.anchors/);
  });

  it('it is absent when the observation has nowhere to stand', () => {
    expect(door).toMatch(/if \(!o\.anchors\.length\) return null;/);
  });
});

describe('W2 · W3 · W4 — it rereads nothing, calls no model, writes nothing', () => {
  it('the control is a link: there is no request in it at all', () => {
    expect(door).toMatch(/<Link/);
    expect(door).not.toMatch(/apiFetch|fetch\(|onClick|useState|useEffect/);
    expect(door).not.toMatch(/method:\s*'(POST|PUT|PATCH|DELETE)'/);
  });

  it('nothing on the path names a reader, a model, or a save', () => {
    for (const src of [door, panel]) {
      expect(src).not.toMatch(/developmentalAskReader|requestDevelopmentalReading|fetchReading\b/);
      expect(src).not.toMatch(/anthropic|claude|generate|completion/i);
      expect(src).not.toMatch(/saveSection|beginDraft|writeState|keepVersion/i);
    }
  });

  /**
   * ⭐⭐ NARROWED, NOT WEAKENED — and the narrowing is the whole point.
   *
   * This obligation used to assert that NEITHER the door nor the set panel knew
   * the crossing's route existed. That was correct for the `Work with this`
   * act, where no crossing was authorized anywhere in the flow.
   *
   * The founder has since authorized the Ask MAIA gesture ON THE PANEL. The
   * DOOR's narrowness is unchanged and is what this obligation exists for:
   * navigation must never be able to acquire a crossing's authority by sitting
   * next to one. A member arriving from Develop has crossed nothing; they have
   * only arrived somewhere a separate, deliberate act is possible.
   *
   * ⛔ So the door is asserted harder than before, not less: it may not name the
   * route, the gestures, or the panel's sender.
   */
  it('⭐ the DOOR does not reach the MAIA crossing — arriving is not asking', () => {
    expect(door).not.toMatch(/api\/writers-studio\/focus/);
    expect(door).not.toMatch(/work_with_this|ask_maia|widen_focus/);
    expect(door).not.toMatch(/askRequestBody|askReducer|apiFetch/);
  });

  it('⛔ and the panel does not cross merely because a Focus Set arrived', () => {
    // The gesture is a separate deliberate act: a press, with a question in it.
    expect(panel).toMatch(/onClick=\{\(\) => void send\(\)\}/);
    expect(panel).toMatch(/ask\.trim\(\)\.length > 0/);
    // ⛔ Nothing sends on mount, on arrival, or on choosing a member.
    expect(panel).not.toMatch(/useEffect\([^)]*send/);
    expect(panel).not.toMatch(/onSet=[^}]*send|send\(\).*withActive/);
  });
});

describe('W7 — the origin stays identifiable behind the Focus Set', () => {
  it('reading, observation, version and cited anchors all survive the trip', () => {
    const anchors: FocusAnchor[] = [{ kind: 'passage', sectionId: S.b, range: { space: 'stored_section_text', start: 3, end: 40 } }];
    const href = workWithThisHref('/writers-studio/canvas', {
      manuscriptId: 'm-1', readingId: 'r-7', observationKey: 'o1',
      revisionNumber: 7, anchors, phenomenon: 'recurrence',
    });
    const back = requestedOrigin(new URLSearchParams(href.slice(href.indexOf('?') + 1)));
    expect(back.kind).toBe('origin');
    if (back.kind !== 'origin') return;
    expect(back.origin.readingId).toBe('r-7');
    expect(back.origin.observationKey).toBe('o1');
    expect(back.origin.revisionNumber).toBe(7);
    expect(back.origin.anchors).toEqual(anchors);
  });

  it('the set names itself from identity and closed vocabulary, never prose', () => {
    const set = seed([{ kind: 'section', sectionId: S.a }]);
    expect(set.label).toBe('o1 · recurrence');
    expect(panel).toMatch(/\{set\.label\}/);
  });
});

describe('W10 — returning to Develop shows the reading unchanged', () => {
  it('the door writes nothing back and holds no state of its own', () => {
    expect(door).not.toMatch(/setState|useState|onStanding|postStanding/);
  });

  /**
   * ⭐ NARROWED, NOT WEAKENED. The panel now NAMES the reading — it must, so
   * the server can reach the frozen digests and establish currency for itself.
   * The obligation was never "the panel must not know the reading"; it was that
   * going to Focus changes nothing about the reading it came from.
   */
  it('the destination never WRITES to the reading it came from', () => {
    expect(panel).not.toMatch(/standing|postStanding|\/readings?\//);
    const routes = [...panel.matchAll(/'(\/api\/[^']+)'/g)].map((m) => m[1]).sort();
    expect(routes).toEqual(['/api/writers-studio/focus', '/api/writers-studio/focus/currency']);
  });

  it('the set panel changes no text and offers no repair', () => {
    /* ⭐ The panel now holds ONE input — the writer's question to MAIA — so a
       bare `onChange` ban would fail on the question box. The obligation is
       about the WORK: no editor, no manuscript field, no write path. */
    expect(panel).not.toMatch(/contentEditable|<textarea/i);
    expect(panel).not.toMatch(/re-?locate|repair|fix it/i);
    expect(panel).not.toMatch(/saveSection|beginDraft|writeState/i);
    /* The only thing the writer can type into is their own question. */
    const inputs = [...panel.matchAll(/<input\b/g)];
    expect(inputs).toHaveLength(1);
    expect(panel).toMatch(/data-focus-ask-input/);
  });
});
