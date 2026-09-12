import * as fs from 'fs';
import * as path from 'path';
import { codePointLength } from '@/lib/manuscript/draftSections';
import { spacedRange, type SpacedRange } from '@/lib/manuscript/sections/coordinateSpace';
import { passageIsProjectable, resolveFocusPassage } from '../focusPassage';
import { resolveFocusCurrency } from '../focusCurrency';
import { sha256, type DevelopmentalReadState } from '@/lib/manuscript/development/readState';
import type { EditableSection } from '@/lib/manuscript/sections/saveSection';

/**
 * WS-FOCUS-PASSAGE-01 — R1–R13, predeclared by the founder BEFORE the repair.
 *
 * ⭐⭐ THE LAW THIS LANE RATIFIED:
 *
 *   An identifier is meaningless without its namespace.
 *   An offset is meaningless without its text.
 *
 * ── WHAT FOCUS-W3 WAS ─────────────────────────────────────────────────────
 *
 * Developmental passage anchors are code points into the section AS READ — the
 * STORED text, heading prefix included. The crossing applied them to the
 * PROJECTED body, which is that text with the prefix removed. Measured on the
 * founder's own manuscript:
 *
 *   §56  stored 1692 · prefix 23 · body 1669   range 22–1692  → overflowed → REFUSED ✅
 *   §45  stored 2874 · prefix 41 · body 2833   range 60–1700  → FIT → shifted 41 ⛔
 *   §62  stored  887 · prefix 20 · body  867   range 22–400   → FIT → shifted 20 ⛔
 *
 * ⭐ THE STRONGEST MUTATION IS NOT THE OVERFLOW. It is the case that still
 * FITS: a successful slice in the wrong space is more dangerous than a refusal,
 * because nothing anywhere says it happened. So R3 and R5 assert TEXT IDENTITY
 * — the exact span the historical range names — never merely that a result
 * came back or that it had the right length.
 */

const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
const src = (...p: string[]) => strip(fs.readFileSync(path.join(__dirname, '..', ...p), 'utf8'));
const passageSrc = src('focusPassage.ts');
const draftReadSrc = src('currentDraftRead.ts');
const currencySrc = src('focusCurrency.ts');
const anchorsSrc = strip(fs.readFileSync(
  path.join(__dirname, '..', '..', 'writersStudio', 'focusAnchors.ts'), 'utf8'));

/**
 * ⛔⭐ A HOMOGENEOUS FIXTURE CANNOT DETECT A SHIFT — found by running this file.
 *
 * The first draft of these falsifiers built bodies from `'x'.repeat(n)`, and
 * R3's mutation — the untranslated slice, the one that FITS — passed against
 * the defect, because in a body of identical characters every offset returns
 * the same string. The instrument would have blessed FOCUS-W3 itself.
 *
 * So every position now carries its own character. The period is 94, and the
 * three real prefixes are 41 · 23 · 20 — none a multiple of it — so a shift by
 * any of them is visible. `fixtureDetectsAShift` asserts that rather than
 * trusting the arithmetic.
 */
const bodyChar = (i: number) => String.fromCodePoint(0x21 + (i % 94));
const bodyOf = (n: number) => Array.from({ length: n }, (_, i) => bodyChar(i)).join('');

/** The founder's three real sections, to the exact measured lengths. */
const stored = (heading: string, bodyChars: number) =>
  `${heading}\n\n${bodyOf(bodyChars)}`;

const S45 = { heading: 'PERSONAL ANECDOTE: TENDING THE CAMPFIRE', body: 2833 };
const S56 = { heading: 'THE CAMPFIRE METAPHOR', body: 1669 };
const S62 = { heading: 'THE GLOWING EMBERS', body: 867 };

const storedOf = (s: { heading: string; body: number }) => stored(s.heading, s.body);
const prefixOf = (s: { heading: string }) => codePointLength(`${s.heading}\n\n`);

const inStored = (start: number, end: number): SpacedRange =>
  ({ space: 'stored_section_text', start, end });
const inBody = (start: number, end: number): SpacedRange =>
  ({ space: 'projected_section_body', start, end });

/** The historical intended span: sliced from the STORED text, in code points. */
const intended = (s: { heading: string; body: number }, start: number, end: number) =>
  [...storedOf(s)].slice(start, end).join('');

/* ══ R0 — the instrument before the law ═════════════════════════════════ */

describe('R0 — the fixture can tell a shifted slice from the intended one', () => {
  it('⛔ a body of identical characters would bless the defect, so this one is not', () => {
    for (const s of [S45, S56, S62]) {
      const body = [...storedOf(s)].slice(prefixOf(s)).join('');
      /* Exactly the mutation: the stored range applied to the body. */
      const shifted = [...body].slice(30, 400).join('');
      expect(shifted).toHaveLength(370);
      expect(shifted).not.toBe(intended(s, 30, 400));
    }
  });
});

/* ══ R1 · R2 — the stored range is never applied to the body directly ═════ */

describe('R1 — a stored-text range is never applied to the projected body', () => {
  it('the resolver translates by the prefix the projector returned', () => {
    const r = resolveFocusPassage({
      storedText: storedOf(S45), heading: S45.heading, range: inStored(60, 1700),
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.prefixCodePoints).toBe(prefixOf(S45));
    expect(r.inBody).toEqual({
      space: 'projected_section_body', start: 60 - prefixOf(S45), end: 1700 - prefixOf(S45),
    });
  });

  it('⛔ nothing on the path slices a body with an untranslated stored range', () => {
    expect(draftReadSrc).toMatch(/resolveFocusPassage\(\{/);
    expect(draftReadSrc).not.toMatch(/codePointBoundaries\(section\.body\)/);
    expect(draftReadSrc).not.toMatch(/section\.body\.slice\(bounds/);
  });
});

describe('R2 — splitStoredSection is the projection authority, reused', () => {
  it('the resolver calls it and computes no prefix of its own', () => {
    expect(passageSrc).toMatch(/splitStoredSection\(storedText, heading\)/);
    /* ⛔ The attractive repair, forbidden: `heading.length + 2` assumes the
       separator and uses UTF-16 units for a code-point offset. */
    expect(passageSrc).not.toMatch(/heading\.length|heading\?\.length|\+ 2\b/);
    expect(passageSrc).toMatch(/codePointLength\(split\.headingPrefix\)/);
  });

  it('⭐ the prefix is measured in CODE POINTS, so an astral heading cannot drift', () => {
    const heading = 'A 🜂 HEADING';
    const text = stored(heading, 50);
    const prefix = codePointLength(`${heading}\n\n`);
    expect(prefix).not.toBe(`${heading}\n\n`.length);   // UTF-16 differs
    const r = resolveFocusPassage({ storedText: text, heading, range: inStored(prefix, prefix + 10) });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.text).toBe(bodyOf(10));
  });
});

/* ══ R3 · R4 · R5 — the three real sections, by TEXT IDENTITY ════════════ */

describe('R3 — §45-class: a range that fits BOTH spaces returns the intended span', () => {
  it('the resolved text is the historical span, not merely text of that length', () => {
    const r = resolveFocusPassage({
      storedText: storedOf(S45), heading: S45.heading, range: inStored(60, 1700),
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.text).toBe(intended(S45, 60, 1700));
    expect(r.text).toHaveLength(1700 - 60);
  });

  it('⭐⭐ THE MUTATION THAT MATTERS — the untranslated slice FITS and is WRONG', () => {
    /* This is what the crossing did. It returns a string of the right length,
       from the right section, and it is the wrong 1640 characters. A length
       assertion would pass; an identity assertion does not. */
    const body = [...storedOf(S45)].slice(prefixOf(S45)).join('');
    const untranslated = [...body].slice(60, 1700).join('');
    expect(untranslated).toHaveLength(1700 - 60);          // it FITS
    expect(untranslated).not.toBe(intended(S45, 60, 1700)); // and it is WRONG
    const r = resolveFocusPassage({
      storedText: storedOf(S45), heading: S45.heading, range: inStored(60, 1700),
    });
    if (r.ok) expect(r.text).not.toBe(untranslated);
  });
});

describe('R4 — §56-class: a range reaching the stored end resolves after translation', () => {
  it('a range ending at stored 1692 — the exact stored length — resolves', () => {
    /* ⛔ Untranslated, an end of 1692 against a 1669-code-point body was
       `range_out_of_bounds`: the safe failure that exposed the whole defect,
       and the reason §56 alone was refused while §45 and §62 were handed over
       shifted. Translated, the same end is exactly the end of the body. */
    const r = resolveFocusPassage({
      storedText: storedOf(S56), heading: S56.heading, range: inStored(30, 1692),
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.text).toBe(intended(S56, 30, 1692));
    expect(r.inBody.end).toBe(1692 - prefixOf(S56));
    expect(r.inBody.end).toBe(S56.body);   // exactly the end of the body
  });

  it('and a range that genuinely exceeds the section still refuses', () => {
    const r = resolveFocusPassage({
      storedText: storedOf(S56), heading: S56.heading, range: inStored(30, 99999),
    });
    expect(r).toEqual({ ok: false, refusal: 'range_out_of_bounds' });
  });

  it('⛔ FOCUS-W4 · a range beginning ON THE SEPARATOR refuses — it is not nudged', () => {
    /**
     * ⭐ FOUND BY RUNNING THIS FILE, and reported rather than designed around.
     *
     * §56's prefix is 23 (`THE CAMPFIRE METAPHOR` + `\n\n`). A historical
     * anchor starting at 22 therefore begins on the second newline — one code
     * point before the body — and translates to −1.
     *
     * ⛔ The tempting repair is a one-character tolerance: "it only misses by
     * the separator, start at 0." That is clamping with a smaller number, and
     * a rule with a tolerance is a rule that gets widened. The refusal is the
     * founder's ruling applied literally: a range that begins where the body
     * does not begin does not name a span of the member's body.
     *
     * CONSEQUENCE, stated rather than hidden: if a real anchor starts inside
     * its prefix, that member resolves `needs_confirmation` and MAIA is not
     * given it. Fewer places read, none of them mis-framed.
     */
    const r = resolveFocusPassage({
      storedText: storedOf(S56), heading: S56.heading, range: inStored(22, 1692),
    });
    expect(r).toEqual({ ok: false, refusal: 'range_precedes_body' });
  });
});

describe('R5 — §62-class: a short passage carries no prefix-length shift', () => {
  it('22–400 returns the intended span', () => {
    const r = resolveFocusPassage({
      storedText: storedOf(S62), heading: S62.heading, range: inStored(22, 400),
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.text).toBe(intended(S62, 22, 400));
    expect(r.prefixCodePoints).toBe(20);
  });

  it('⛔ a range beginning INSIDE the heading prefix refuses — it is not clamped', () => {
    /* Clamping to 0 would hand MAIA a passage starting where the writer never
       framed one, and would do it most confidently where the heading is longest. */
    const r = resolveFocusPassage({
      storedText: storedOf(S62), heading: S62.heading, range: inStored(5, 400),
    });
    expect(r).toEqual({ ok: false, refusal: 'range_precedes_body' });
  });
});

/* ══ R6 · R7 — varying and absent headings ══════════════════════════════ */

describe('R6 — the mapping holds as heading length varies', () => {
  it('all three real sections translate by their own prefix', () => {
    for (const s of [S45, S56, S62]) {
      const r = resolveFocusPassage({
        storedText: storedOf(s), heading: s.heading, range: inStored(prefixOf(s), prefixOf(s) + 40),
      });
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(r.prefixCodePoints).toBe(prefixOf(s));
        expect(r.text).toBe(bodyOf(40));
      }
    }
  });
});

describe('R7 — no heading means the identity mapping', () => {
  it('a section with no heading translates by zero', () => {
    const r = resolveFocusPassage({
      storedText: 'the whole thing is body', heading: null, range: inStored(4, 9),
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.prefixCodePoints).toBe(0);
    expect(r.text).toBe('whole');
    expect(r.inBody).toEqual({ space: 'projected_section_body', start: 4, end: 9 });
  });

  it('a blank heading is the same case', () => {
    const r = resolveFocusPassage({ storedText: 'abcdef', heading: '   ', range: inStored(1, 3) });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.text).toBe('bc');
  });

  it('a single-newline separator is accepted by the projector, and measured', () => {
    const r = resolveFocusPassage({ storedText: 'H\nbody here', heading: 'H', range: inStored(2, 6) });
    expect(r.ok).toBe(true);
    if (r.ok) { expect(r.prefixCodePoints).toBe(2); expect(r.text).toBe('body'); }
  });

  it('⛔ a slice whose stored text does not begin with the heading is not projectable', () => {
    const r = resolveFocusPassage({
      storedText: 'something else entirely', heading: 'H', range: inStored(0, 4),
    });
    expect(r).toEqual({ ok: false, refusal: 'section_not_projectable' });
  });
});

/* ══ R8 — code points, not code units ═══════════════════════════════════ */

describe('R8 — astral characters before and inside the passage', () => {
  const heading = 'H';
  const text = 'H\n\nab🜂cd🜂ef';

  it('the span lands on whole characters and matches the stored slice', () => {
    const r = resolveFocusPassage({ storedText: text, heading, range: inStored(5, 9) });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.text).toBe([...text].slice(5, 9).join(''));
    /* ⛔ The UTF-16 implementation would have cut here, mid-surrogate. */
    expect(r.text).not.toBe(text.slice(5, 9));
  });

  it('the whole body, addressed to its last code point, resolves', () => {
    const cp = [...text].length;
    const r = resolveFocusPassage({ storedText: text, heading, range: inStored(3, cp) });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.text).toBe([...text].slice(3).join(''));
  });
});

/* ══ R9 · R13 — a range without, or in the wrong, space ═════════════════ */

describe('R9 — a range with no coordinate space is refused, never assumed', () => {
  it('the resolver refuses it', () => {
    const r = resolveFocusPassage({
      storedText: storedOf(S62), heading: S62.heading,
      range: { start: 22, end: 400 } as unknown as SpacedRange,
    });
    expect(r).toEqual({ ok: false, refusal: 'coordinate_space_unknown' });
  });

  it('the parser refuses it, and refuses an unrecognised one', () => {
    expect(spacedRange({ start: 1, end: 2 })).toBeNull();
    expect(spacedRange({ space: 'somewhere', start: 1, end: 2 })).toBeNull();
    expect(spacedRange({ space: 'stored_section_text', start: 1, end: 2 }))
      .toEqual({ space: 'stored_section_text', start: 1, end: 2 });
  });

  it('⛔ and there is no default anywhere — a default IS the defect', () => {
    const spaceSrc = strip(fs.readFileSync(path.join(
      __dirname, '..', '..', 'manuscript', 'sections', 'coordinateSpace.ts'), 'utf8'));
    expect(spaceSrc).not.toMatch(/\?\?\s*'(stored_section_text|projected_section_body|revision_content)'/);
    expect(passageSrc).not.toMatch(/\?\?\s*'stored_section_text'/);
  });
});

describe('R13 — a revision_content range cannot pass as section-relative', () => {
  it('it refuses at the contract boundary rather than being reinterpreted', () => {
    const r = resolveFocusPassage({
      storedText: storedOf(S56), heading: S56.heading,
      range: { space: 'revision_content', start: 22, end: 400 },
    });
    expect(r).toEqual({ ok: false, refusal: 'coordinate_space_unsupported' });
  });

  it('⭐ the three spaces exist and are named — one shape, three origins', () => {
    const spaceSrc = fs.readFileSync(path.join(
      __dirname, '..', '..', 'manuscript', 'sections', 'coordinateSpace.ts'), 'utf8');
    for (const s of ['stored_section_text', 'projected_section_body', 'revision_content']) {
      expect(spaceSrc).toContain(s);
    }
  });

  it('⛔ and the door refuses to encode a space its format cannot carry', () => {
    const door = strip(fs.readFileSync(path.join(
      __dirname, '..', '..', '..', 'app', 'writers-studio', 'workWithThis.ts'), 'utf8'));
    expect(door).toMatch(/a\.range\.space !== 'stored_section_text'/);
    expect(door).toMatch(/throw new Error\(/);
  });

  it('the space is stamped where the knowledge is — at the lift out of evidence', () => {
    expect(anchorsSrc).toMatch(/space: 'stored_section_text'/);
    /* ⭐ And it is part of the anchor's identity, so the same numbers in two
       spaces are two places rather than one deduplicated one. */
    expect(anchorsSrc).toMatch(/\$\{a\.range\.space\}/);
  });
});

/* ══ R10 · R11 — preflight and Ask cannot disagree ══════════════════════ */

describe('R10 — preflight and Ask consume the same resolver', () => {
  it('currency asks projectability through the shared function', () => {
    expect(currencySrc).toMatch(/import \{ passageIsProjectable \} from '\.\/focusPassage'/);
    expect(currencySrc).toMatch(/passageIsProjectable\(\{/);
  });

  it('and the body read goes through the same module', () => {
    expect(draftReadSrc).toMatch(/import \{ resolveFocusPassage \} from '\.\/focusPassage'/);
  });

  it('⛔ neither re-implements passage geometry', () => {
    for (const s of [currencySrc, draftReadSrc]) {
      expect(s).not.toMatch(/splitStoredSection|headingPrefix|codePointBoundaries/);
    }
  });
});

describe('R11 — preflight cannot say READY where Ask would reject', () => {
  it('projectability is part of readiness, for every refusal the resolver can make', () => {
    for (const range of [
      inStored(22, 99999),                                   // out of bounds
      inStored(5, 400),                                      // precedes body
      { space: 'revision_content', start: 1, end: 2 } as SpacedRange,
      { start: 1, end: 2 } as unknown as SpacedRange,        // no space
    ]) {
      const input = { storedText: storedOf(S62), heading: S62.heading, range };
      expect(passageIsProjectable(input)).toBe(resolveFocusPassage(input).ok);
      expect(passageIsProjectable(input)).toBe(false);
    }
  });

  /**
   * ⛔ THESE ARE BEHAVIOURAL, AND THAT IS DELIBERATE. The first draft asserted
   * over `focusCurrency.ts`'s source that `passageIsProjectable` was not near
   * the word `unavailable` — and it failed, because the word appears in the
   * `MemberCurrency` union a few lines below the import. That is the C21 class
   * again: a scan over vocabulary matching a TYPE, not a behaviour. So the
   * currency resolver is run, and what it RETURNS is asserted.
   */
  const sectionOf = (s: { heading: string; body: number }, id: string): EditableSection => ({
    id, position: 1, heading: s.heading, storedText: storedOf(s),
    body: [...storedOf(s)].slice(prefixOf(s)).join(''), editable: true,
  });

  const readStateOver = (id: string, s: { heading: string; body: number }) => ({
    draftId: 'd', revisionNumber: 7, revisionDigest: 'r', sectionTopology: [id],
    inputFingerprint: 'f',
    sections: {
      [id]: { revisionNumber: 7, range: { start: 0, end: 1 }, digest: sha256(storedOf(s)) },
    },
  }) as unknown as DevelopmentalReadState;

  const currencyFor = (range: SpacedRange) => {
    const id = 's56';
    return resolveFocusCurrency({
      anchors: [{ kind: 'passage', sectionId: id, range, focusMemberId: 'f1' }],
      readState: readStateOver(id, S56),
      sections: new Map([[id, sectionOf(S56, id)]]),
      draftVersion: 34,
    }).members[0].currency;
  };

  it('⭐ an unprojectable passage is NEEDS CONFIRMATION, not unavailable', () => {
    /* The digest matches — the section is plainly still in the Work, unchanged.
       Only the projection fails. Calling that `unavailable` would be a second
       untruth on top of the first. */
    expect(currencyFor(inStored(22, 1692))).toBe('needs_confirmation');   // precedes body
    expect(currencyFor(inStored(30, 99999))).toBe('needs_confirmation');  // out of bounds
  });

  it('a projectable, digest-matching passage is the only READY case', () => {
    expect(currencyFor(inStored(30, 1692))).toBe('ready');
    expect(passageIsProjectable({
      storedText: storedOf(S56), heading: S56.heading, range: inStored(30, 1692),
    })).toBe(true);
  });

  it('⛔ and a section that left the Work is the ONE unavailable case', () => {
    const got = resolveFocusCurrency({
      anchors: [{ kind: 'passage', sectionId: 'gone', range: inStored(30, 1692), focusMemberId: 'f1' }],
      readState: readStateOver('s56', S56),
      sections: new Map([['s56', sectionOf(S56, 's56')]]),
      draftVersion: 34,
    }).members[0].currency;
    expect(got).toBe('unavailable');
  });
});

/* ══ R12 — whole-section Focus is untouched ═════════════════════════════ */

describe('R12 — a whole-section member needs no passage translation', () => {
  it('the body read takes the projected body directly when there is no range', () => {
    expect(draftReadSrc).toMatch(/if \(!range\) \{/);
    expect(draftReadSrc).toMatch(/ok: true, body: section\.body/);
  });

  it('and currency answers it before any digest or projection', () => {
    expect(currencySrc).toMatch(/anchor\.kind === 'section'\) return 'ready'/);
  });
});

/* ══ ⭐ the body-space case, for the future Canvas selection ════════════ */

describe('a range already in body coordinates needs no translation', () => {
  it('projected_section_body is the identity case', () => {
    const r = resolveFocusPassage({
      storedText: storedOf(S62), heading: S62.heading, range: inBody(0, 10),
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.text).toBe(bodyOf(10));
    expect(r.inBody).toEqual({ space: 'projected_section_body', start: 0, end: 10 });
  });

  it('⛔ and it is NOT silently equated with the stored-space range of the same numbers', () => {
    const a = resolveFocusPassage({
      storedText: storedOf(S62), heading: S62.heading, range: inBody(22, 400),
    });
    const b = resolveFocusPassage({
      storedText: storedOf(S62), heading: S62.heading, range: inStored(22, 400),
    });
    expect(a.ok && b.ok).toBe(true);
    if (a.ok && b.ok) expect(a.inBody).not.toEqual(b.inBody);
  });
});
