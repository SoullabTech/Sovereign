/**
 * FOCUS-W6 — W6-1 … W6-9, predeclared by the founder BEFORE the repair.
 *
 * ⭐⭐ THE LAW:
 *
 *   A disclosed place needs both a machine identity and a writer-facing name.
 *   A withheld place gets membership identity only.
 *
 * ── WHAT FOCUS-W6 WAS ─────────────────────────────────────────────────────
 *
 * Cognition received `F5 · 70f8c7fd-bb9e-4a27-acf7-028f3721ee0b` while the
 * writer's panel said *Section 62 · "THE GLOWING EMBERS"*. MAIA could keep the
 * bodies distinct — which is all F7 ever required — but could not NAME a single
 * one of them.
 *
 * ⭐ THE CONSEQUENCE, and it is the reason this is repaired before the final
 * cognition witness: every section name MAIA has ever used came from the
 * OBSERVATION text, because Focus never gave her one. That independently
 * confirms the FOCUS-W5 mechanism — and it would have made the final witness
 * unreadable, since "she preserved distinct-place understanding" and "she
 * borrowed the names from the historical reading" would look identical.
 */

import * as fs from 'fs';
import * as path from 'path';
import { writerFacingLabel } from '../currentDraftRead';
import {
  focusParticipation, renderFocusMembers, renderFocusMembership, renderFocusBodies,
  type FocusParticipationMember,
} from '../focusParticipation';
import type { EditableSection } from '@/lib/manuscript/sections/saveSection';

const CODE = (rel: string) => fs.readFileSync(path.join(process.cwd(), rel), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const S = {
  s45: 'cd816b2b-fc76-493c-83de-cc1219d85b4c',
  s56: '1e58bb81-f1bf-4c60-99c1-5422b62b5e91',
  s57: 'c9234752-b5bb-4fca-8ed5-83992047166d',
  s62: '70f8c7fd-bb9e-4a27-acf7-028f3721ee0b',
};

/** The founder's own sections, at their real 0-indexed positions. */
const section = (id: string, position: number, heading: string | null): EditableSection => ({
  id, position, heading, storedText: `${heading ?? ''}\n\nbody`, body: 'body', editable: true,
});

const readable = (
  id: string, ord: number, ref: string, sec: EditableSection, content: string,
): FocusParticipationMember => ({
  focusMemberId: id, ordinal: ord, sectionRef: ref, label: writerFacingLabel(sec),
  status: 'readable', active: false, bodyAvailable: true, content,
});

const withheld = (id: string, ord: number): FocusParticipationMember =>
  ({ focusMemberId: id, ordinal: ord, status: 'unverified', active: false, bodyAvailable: false });

const S45 = section(S.s45, 44, 'PERSONAL ANECDOTE: TENDING THE CAMPFIRE');
const S57 = section(S.s57, 56, 'THE PRESENT MOMENT');
const S62 = section(S.s62, 61, 'THE GLOWING EMBERS');

const theSet = (over?: FocusParticipationMember[], active: string | null = null) =>
  focusParticipation({
    members: over ?? [
      readable('f1', 1, S.s45, S45, 'the fire caught slowly'),
      withheld('f2', 2),
      readable('f3', 3, S.s57, S57, 'the crackling stills the world'),
      readable('f5', 4, S.s62, S62, 'this is the part I love most'),
    ],
    activeMemberId: active,
  });

/* ══ W6-1 · W6-3 · W6-7 — the name ══════════════════════════════════════ */

describe('W6-1 — a readable member carries the writer-facing current label', () => {
  it('⭐ the writer’s §45 is position 44, and it is named as the writer names it', () => {
    expect(writerFacingLabel(S45)).toBe('Section 45 · “PERSONAL ANECDOTE: TENDING THE CAMPFIRE”');
    expect(writerFacingLabel(S57)).toBe('Section 57 · “THE PRESENT MOMENT”');
    expect(writerFacingLabel(S62)).toBe('Section 62 · “THE GLOWING EMBERS”');
  });

  it('the label reaches cognition in the membership list and beside each body', () => {
    const p = theSet();
    expect(renderFocusMembers(p)).toContain('Section 45 · “PERSONAL ANECDOTE: TENDING THE CAMPFIRE”');
    expect(renderFocusBodies(p)).toContain('[F1 · Section 45 · “PERSONAL ANECDOTE: TENDING THE CAMPFIRE”]');
  });

  it('and the active target is named, not rendered as an id', () => {
    const line = renderFocusMembership(theSet(undefined, 'f5'));
    expect(line).toContain('They are working on Section 62 · “THE GLOWING EMBERS”');
    expect(line).not.toContain(S.s62);
  });
});

describe('W6-3 — readable members stay distinguishable by BOTH identities', () => {
  it('every readable member has a distinct F identity and a distinct name', () => {
    const p = theSet();
    const r = p.members.filter((m) => m.status === 'readable');
    expect(new Set(r.map((m) => m.focusMemberId)).size).toBe(r.length);
    expect(new Set(r.map((m) => m.label)).size).toBe(r.length);
    expect(new Set(r.map((m) => m.sectionRef)).size).toBe(r.length);
  });
});

describe('W6-7 — no heading means the number alone, never a guessed title', () => {
  it('⛔ a section with no heading is “Section 57” and nothing more', () => {
    expect(writerFacingLabel(section('x', 56, null))).toBe('Section 57');
    expect(writerFacingLabel(section('x', 56, '   '))).toBe('Section 57');
  });

  it('⛔ and nothing in the label path can invent one', () => {
    const src = CODE('lib/writers-studio/currentDraftRead.ts');
    expect(src).not.toMatch(/Untitled|untitled|\|\| 'Section|\?\? 'Section/);
  });
});

/* ══ W6-2 — one read, one version, one label ════════════════════════════ */

describe('W6-2 — the label and the body come from the SAME snapshot', () => {
  it('⭐⭐ the crossing derives it from the snapshot section that supplied the body', () => {
    const src = CODE('lib/writers-studio/focusCrossing.ts');
    expect(src).toMatch(/const section = snapshot\.snapshot\.sections\.get\(m\.sectionRef\)/);
    expect(src).toMatch(/label: writerFacingLabel\(section\)/);
  });

  it('⛔ and NOT from the observation, the client, or a second query', () => {
    const src = CODE('lib/writers-studio/focusCrossing.ts');
    /* The label must never be read off the request or the frozen reading. */
    expect(src).not.toMatch(/label: (m|req|reading|observation)\./);
    expect(src).not.toMatch(/loadEditableSections|SELECT/);
  });

  it('the label tracks the snapshot — a renamed heading renames the place', () => {
    const renamed = section(S.s62, 61, 'THE EMBERS');
    expect(writerFacingLabel(renamed)).toBe('Section 62 · “THE EMBERS”');
    expect(writerFacingLabel(renamed)).not.toBe(writerFacingLabel(S62));
  });
});

/* ══ W6-4 · W6-5 · W6-6 — the withheld member ═══════════════════════════ */

describe('W6-4 — a withheld member gets no section number and no title', () => {
  it('no label, no sectionRef, and neither appears anywhere MAIA is given', () => {
    const p = theSet();
    const f2 = p.members.find((m) => m.focusMemberId === 'f2')!;
    expect(f2.label).toBeUndefined();
    expect(f2.sectionRef).toBeUndefined();
    const everything = [renderFocusMembership(p), renderFocusMembers(p), renderFocusBodies(p)].join('\n');
    expect(everything).not.toContain(S.s56);
    expect(everything).not.toContain('Section 56');
    expect(everything).not.toContain('THE CAMPFIRE METAPHOR');
  });
});

describe('W6-5 — the withheld member still reaches cognition as membership', () => {
  it('⛔ W6 did not turn W5’s withholding into deletion', () => {
    const p = theSet();
    expect(p.total).toBe(4);
    expect(p.readable).toBe(3);
    expect(renderFocusMembers(p)).toMatch(/F2 · /);
    expect(renderFocusMembership(p)).toContain('You can read 3 of 4');
  });
});

describe('W6-6 — durable provenance may keep the UUID the projection omits', () => {
  it('⭐ the act record and the presence probe still use the real identity', () => {
    const src = CODE('lib/writers-studio/focusCrossing.ts');
    expect(src).toMatch(/\.map\(\(m\) => m\.sectionRef\)/);
    /* ⭐ And the receipt is still section-scoped — provenance is not weakened
       by the projection withholding a name. */
    expect(src).toMatch(/sectionRef/);
  });
});

/* ══ W6-8 · W6-9 — the mutations ════════════════════════════════════════ */

describe('W6-8 — UUID-only rendering for readable bodies FAILS', () => {
  it('⭐⭐ THE MUTATION THAT MATTERS — a body attributed to an id, not a name', () => {
    const src = CODE('lib/writers-studio/focusParticipation.ts');
    expect(src).toMatch(/\[F\$\{m\.ordinal\} · \$\{m\.label\}\]/);
    expect(src).not.toMatch(/\[F\$\{m\.ordinal\} · \$\{m\.sectionRef\}\]/);
  });

  it('a readable member with no name is REFUSED', () => {
    expect(() => theSet([
      { focusMemberId: 'f1', ordinal: 1, sectionRef: S.s45, status: 'readable',
        active: false, bodyAvailable: true, content: 'x' },
    ])).toThrow(/readable member carries no place name/);
  });
});

describe('W6-9 — giving a withheld place its human name through Focus FAILS', () => {
  it('⭐⭐ §56 named while withheld is REFUSED — a name is an identity', () => {
    expect(() => theSet([
      { ...withheld('f2', 1), label: 'Section 56 · “THE CAMPFIRE METAPHOR”' } as FocusParticipationMember,
    ])).toThrow(/carries a place name/);
  });

  it('an unavailable member is refused on the same rule', () => {
    expect(() => theSet([
      { focusMemberId: 'f2', ordinal: 1, status: 'unavailable', active: false,
        bodyAvailable: false, label: 'Section 56' },
    ])).toThrow(/carries a place name/);
  });
});
