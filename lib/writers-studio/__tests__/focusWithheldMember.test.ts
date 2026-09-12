/**
 * FOCUS-W5 — W5-1 … W5-10, predeclared by the founder BEFORE the repair.
 *
 * ⭐⭐ THE LAW THIS LANE RATIFIED:
 *
 *   A withheld Focus member may remain present as attention, but Focus may not
 *   supply enough identity or semantics for MAIA to present claims about its
 *   current content as though she read it.
 *
 *   ATTENTION MEMBERSHIP  ≠  CONTENT DISCLOSURE
 *
 * ── WHAT FOCUS-W5 WAS ─────────────────────────────────────────────────────
 *
 * Act `d7cb7317` disclosed four of five members. §56 (`f2`) was given no
 * boundary-authorized body at all — `body_available f`, no crossed receipt.
 * MAIA nonetheless wrote:
 *
 *   "Section 56 gives the same sequence again and attaches meanings to it —
 *    dampness as spiritual distraction, the flames as a change in energy
 *    under challenge…"
 *
 * and called the set "the five places I actually saw". She saw four.
 *
 * ⛔ THE DEFECT IS NOT THAT SHE MENTIONED §56. Membership MUST reach her, or
 * she cannot tell the writer her view is partial. The defect is SOURCE
 * COLLAPSE: given the NAME of a place she was not given, a claim sourced from
 * somewhere else — an earlier reading, an inference from §45 — is presented in
 * the voice of having read the current Work, and the writer cannot tell the
 * difference.
 *
 * ⛔ SO THE REPAIR IS NOT STRONGER PROSE IN THE PROMPT. The prompt already told
 * her not to do this. The repair is structural: the section identity travels
 * with the body or not at all.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  focusParticipation, renderFocusMembers, renderFocusMembership, renderFocusBodies,
  type FocusParticipationMember,
} from '../focusParticipation';

const SRC = (rel: string) => fs.readFileSync(path.join(process.cwd(), rel), 'utf8');
const CODE = (rel: string) => SRC(rel).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

/** The witness's own set: §45 · §56 · §57 · §58 · §62, with §56 withheld. */
const S = {
  s45: 'cd816b2b-fc76-493c-83de-cc1219d85b4c',
  s56: '1e58bb81-f1bf-4c60-99c1-5422b62b5e91',
  s57: 'c9234752-b5bb-4fca-8ed5-83992047166d',
  s58: '6313036b-4ad2-44ff-baae-c90ed468dc80',
  s62: '70f8c7fd-bb9e-4a27-acf7-028f3721ee0b',
};

const readable = (id: string, ord: number, ref: string, content: string): FocusParticipationMember =>
  ({ focusMemberId: id, ordinal: ord, sectionRef: ref, status: 'readable', active: false, bodyAvailable: true, content });

/** ⭐ A withheld member is built WITHOUT a section identity. That is the law. */
const withheld = (id: string, ord: number): FocusParticipationMember =>
  ({ focusMemberId: id, ordinal: ord, status: 'unverified', active: false, bodyAvailable: false });

const theSet = (over: Partial<FocusParticipationMember>[] = []) => focusParticipation({
  members: over.length ? (over as FocusParticipationMember[]) : [
    readable('f1', 1, S.s45, 'the fire caught slowly'),
    withheld('f2', 2),
    readable('f3', 3, S.s57, 'by morning the stones were cold'),
    readable('f4', 4, S.s58, 'he banked it before bed'),
    readable('f5', 5, S.s62, 'this is the part I love most'),
  ],
  activeMemberId: null,
});

/* ══ W5-1 · W5-2 · W5-3 — what a withheld member is, and is not ══════════ */

describe('W5-1 — a withheld member reaches cognition as membership', () => {
  it('it is in the set, with its focus-local identity and its ordinal', () => {
    const p = theSet();
    const f2 = p.members.find((m) => m.focusMemberId === 'f2');
    expect(f2).toBeDefined();
    expect(f2!.ordinal).toBe(2);
    expect(f2!.status).toBe('unverified');
    expect(f2!.bodyAvailable).toBe(false);
  });

  it('and it is rendered, so the writer’s attention is not silently narrowed', () => {
    expect(renderFocusMembers(theSet())).toMatch(/F2 · /);
  });
});

describe('W5-2 — a withheld member carries NO Focus-authorized section identity', () => {
  it('the member object has none', () => {
    expect(theSet().members.find((m) => m.focusMemberId === 'f2')!.sectionRef).toBeUndefined();
  });

  it('⭐⭐ and the withheld section id appears NOWHERE in anything MAIA is given', () => {
    const p = theSet();
    const everything = [renderFocusMembership(p), renderFocusMembers(p), renderFocusBodies(p)].join('\n');
    expect(everything).not.toContain(S.s56);
    /* ⛔ Nor by any prefix of it — a truncated identity is still an identity. */
    expect(everything).not.toContain(S.s56.slice(0, 8));
  });

  it('the withheld line says plainly that she does not know which section it is', () => {
    expect(renderFocusMembers(theSet()))
      .toMatch(/F2 ·[\s\S]{0,240}you do not know which section it is/);
  });
});

describe('W5-3 — a withheld member carries no body, range, summary or description', () => {
  it('no content, and the contract refuses one', () => {
    expect(theSet().members.find((m) => m.focusMemberId === 'f2')!.content).toBeUndefined();
    expect(() => theSet([
      { ...withheld('f2', 1), content: 'anything' } as FocusParticipationMember,
    ])).toThrow(/carries content/);
  });

  it('⛔ the member type has no field a description could travel in', () => {
    const p = theSet();
    expect(Object.keys(p.members.find((m) => m.focusMemberId === 'f2')!).sort())
      .toEqual(['active', 'bodyAvailable', 'focusMemberId', 'ordinal', 'status']);
  });

  it('⛔ and no renderer emits a range, digest or length for any member', () => {
    const src = CODE('lib/writers-studio/focusParticipation.ts');
    for (const forbidden of [/\.range/, /digest/i, /\.length\b[^)]*chars/i]) {
      expect(src).not.toMatch(forbidden);
    }
  });
});

/* ══ W5-4 · W5-5 — what must NOT be lost ════════════════════════════════ */

describe('W5-4 — readable members keep distinct identity and bodies', () => {
  it('each readable member is attributable to its own section', () => {
    const bodies = renderFocusBodies(theSet());
    for (const ref of [S.s45, S.s57, S.s58, S.s62]) expect(bodies).toContain(ref);
    expect(bodies).toContain('the fire caught slowly');
    expect(bodies).toContain('this is the part I love most');
  });

  it('⛔ a readable member WITHOUT a section identity is refused — F7 attribution', () => {
    expect(() => theSet([
      { focusMemberId: 'f1', ordinal: 1, status: 'readable', active: false, bodyAvailable: true, content: 'x' },
    ])).toThrow(/readable member carries no section identity/);
  });
});

describe('W5-5 — the rendering still states both numbers', () => {
  it('total 5 and readable 4, in one sentence', () => {
    const p = theSet();
    expect(p.total).toBe(5);
    expect(p.readable).toBe(4);
    const line = renderFocusMembership(p);
    expect(line).toContain('5 places');
    expect(line).toContain('You can read 4 of 5');
    expect(line).toMatch(/partial view/);
  });
});

/* ══ W5-6 — absence is not the repair ═══════════════════════════════════ */

describe('W5-6 — removing the withheld member entirely FAILS', () => {
  it('⭐ a set of only the readable four reports a COMPLETE view, which is the lie', () => {
    const fourOnly = focusParticipation({
      members: [
        readable('f1', 1, S.s45, 'a'), readable('f3', 2, S.s57, 'b'),
        readable('f4', 3, S.s58, 'c'), readable('f5', 4, S.s62, 'd'),
      ],
      activeMemberId: null,
    });
    expect(fourOnly.total).toBe(4);
    expect(renderFocusMembership(fourOnly)).toMatch(/you can read all of them/);
    /* ⛔ THE POINT: dropping the withheld member is indistinguishable, to MAIA,
       from the writer having declared four places. The five-member set must
       therefore never collapse to this one. */
    expect(renderFocusMembership(theSet())).not.toMatch(/you can read all of them/);
  });
});

/* ══ W5-7 · W5-10 — the mutations ═══════════════════════════════════════ */

describe('W5-7 — reintroducing the section identity through the producer FAILS', () => {
  it('⭐⭐ W5-10 · THE MUTATION THAT MATTERS — identity without a body is REFUSED', () => {
    /* This is the CURRENT shape, before the repair: §56 named, §56 withheld.
       It passed every earlier gate and produced the source collapse. */
    expect(() => theSet([
      { ...withheld('f2', 1), sectionRef: S.s56 } as FocusParticipationMember,
    ])).toThrow(/carries a section identity/);
  });

  it('an unavailable member is refused on the same rule', () => {
    expect(() => theSet([
      { focusMemberId: 'f2', ordinal: 1, status: 'unavailable', active: false, bodyAvailable: false, sectionRef: S.s56 },
    ])).toThrow(/carries a section identity/);
  });

  it('⛔ and the crossing gives the identity ONLY on the readable branch', () => {
    const src = CODE('lib/writers-studio/focusCrossing.ts');
    expect(src).toMatch(/status === 'readable' \? \{ sectionRef: m\.sectionRef, content \} : \{\}/);
    /* ⛔ The unconditional form that produced W5 must not return. */
    expect(src).not.toMatch(/ordinal: i \+ 1, sectionRef: m\.sectionRef/);
  });

  it('the act record and the presence probe still use the real identity', () => {
    const src = CODE('lib/writers-studio/focusCrossing.ts');
    expect(src).toMatch(/\.map\(\(m\) => m\.sectionRef\)/);
  });
});

/* ══ W5-8 · W5-9 — source collapse ══════════════════════════════════════ */

describe('W5-8 — separately admitted material stays separately attributable', () => {
  it('⭐ Focus never claims to be the only source, and never absorbs another', () => {
    const line = renderFocusMembership(theSet());
    expect(line).toMatch(/If something you were given elsewhere/);
    expect(line).toMatch(/earlier developmental\s+reading/);
  });
});

describe('W5-9 — withheld material may not be described as current without a named source', () => {
  it('the instruction is explicit, and names both halves', () => {
    const line = renderFocusMembership(theSet());
    expect(line).toMatch(/Do not describe what they currently say/);
    expect(line).toMatch(/could not check it against the current Work/);
  });

  it('⛔ and it is only reachable because the identity is gone — prose alone was tried', () => {
    /* The pre-W5 prompt already forbade this in words, and MAIA did it anyway.
       The structural refusal is what makes the instruction enforceable, so the
       gate asserts BOTH exist. */
    const p = theSet();
    expect(renderFocusMembers(p)).not.toContain(S.s56);
    expect(renderFocusMembership(p)).toMatch(/you are not\s+told which sections they are/);
  });
});
