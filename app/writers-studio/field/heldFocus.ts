/**
 * HELD FOCUS — substrate-native, not DOM-native.
 *
 * ⭐ THE LAW, recovered from the accepted form:
 *
 *   Held Focus survives browser-selection loss and the composer taking
 *   keyboard focus. What the writer framed stays framed while they type about
 *   it.
 *
 * ⛔ THE PROTOTYPE'S IMPLEMENTATION DOES NOT COME ACROSS. It used the CSS
 * Custom Highlight API over `contentEditable` divs. The real Whole Manuscript
 * substrate renders each editable section as a `<textarea>`, whose value is not
 * a DOM text node any highlight API can address. Porting the mechanism
 * literally would have required replacing the textarea — building a second,
 * editable manuscript in order to obtain a highlight. Preserve the law; leave
 * the mechanism behind.
 *
 * ── WHAT A FOCUS IS ────────────────────────────────────────────────────────
 *
 * Section identity plus explicit text offsets, and the text those offsets named
 * at capture. Never a DOM Range, never a similarity search, never anything MAIA
 * inferred.
 *
 * ⭐ THIS IS WHAT MAKES IT SURVIVE VIRTUALIZATION. Whole Manuscript mounts only
 * the editors in a window and keeps every shell alive, so a DOM-owned focus
 * would vanish at exactly the moment the writer scrolled far enough for its
 * editor to leave — and reappear as nothing. Coordinates do not evict. When the
 * section remounts, the same coordinates name the same words, and the visual
 * focus can simply reappear.
 *
 * ── WHEN THE TEXT MOVES UNDER IT ───────────────────────────────────────────
 *
 * ⛔ If the held coordinates no longer name the captured text, the focus is
 * INVALID and is released. It is never silently relocated because similar words
 * exist elsewhere. A focus that quietly moved would be the system deciding what
 * the writer meant to be looking at — and it would do so most confidently in
 * the exact case where the writer had just changed their mind on the page.
 */

export type FocusScale = 'selection' | 'paragraph' | 'section' | 'work';

export interface HeldFocus {
  scale: FocusScale;
  /** In document order. One section for selection/paragraph/section; many for work. */
  sectionIds: string[];
  /** Offset into the FIRST section's body. */
  start: number;
  /** Offset into the LAST section's body. */
  end: number;
  /**
   * The exact text these coordinates named when the writer framed it. The
   * focus's own witness: it is what makes invalidation a comparison rather than
   * a guess.
   */
  capturedText: string;
}

/** How the room reads section bodies. The model never fetches and never caches. */
export type BodyOf = (sectionId: string) => string;

export interface SectionRef {
  id: string;
  position: number;
  heading: string | null;
}

const JOIN = '\n\n';

/** The text a focus currently names, or null if any of its sections is gone. */
export function textOf(focus: HeldFocus, bodyOf: BodyOf): string | null {
  const parts: string[] = [];
  focus.sectionIds.forEach((id, i) => {
    const body = bodyOf(id);
    if (body === undefined || body === null) return;
    const first = i === 0;
    const last = i === focus.sectionIds.length - 1;
    parts.push(body.slice(first ? focus.start : 0, last ? focus.end : body.length));
  });
  if (parts.length !== focus.sectionIds.length) return null;
  return parts.join(JOIN);
}

/**
 * ⭐ THE ONE QUESTION ASKED OF A HELD FOCUS BEFORE IT IS USED.
 *
 * Not "is there still something like this?" — "do these coordinates still name
 * what the writer framed?" Any other answer releases it.
 */
export function isValid(focus: HeldFocus, bodyOf: BodyOf): boolean {
  return textOf(focus, bodyOf) === focus.capturedText;
}

/** Capture a selection the writer made, in the section they made it in. */
export function capture(
  sectionId: string, start: number, end: number, bodyOf: BodyOf,
): HeldFocus | null {
  if (end <= start) return null;
  const body = bodyOf(sectionId);
  if (!body) return null;
  const a = Math.max(0, Math.min(start, body.length));
  const b = Math.max(0, Math.min(end, body.length));
  if (b - a < 1) return null;
  const text = body.slice(a, b);
  if (!text.trim()) return null;
  return { scale: 'selection', sectionIds: [sectionId], start: a, end: b, capturedText: text };
}

/**
 * ── THE LADDER ─────────────────────────────────────────────────────────────
 *
 * selection → paragraph → section → work, and back down by memory.
 *
 * ⛔ DETERMINISTIC AND STRUCTURAL. Widening reads paragraph breaks and section
 * boundaries — nothing else. No semantic interpretation is needed to widen,
 * and none is permitted: a ladder that asked what the passage was ABOUT in
 * order to decide how far to reach would make the aperture MAIA's opinion
 * rather than the writer's act.
 */
export function widen(
  focus: HeldFocus, sections: SectionRef[], bodyOf: BodyOf,
): HeldFocus | null {
  if (focus.scale === 'work') return null;
  const firstId = focus.sectionIds[0];
  const body = bodyOf(firstId);
  if (body === undefined || body === null) return null;

  if (focus.scale === 'selection') {
    /* To the paragraph that contains it: back to the previous blank line,
       forward to the next one. */
    const before = body.lastIndexOf(JOIN, Math.max(0, focus.start - 1));
    const from = before < 0 ? 0 : before + JOIN.length;
    const after = body.indexOf(JOIN, focus.end);
    const to = after < 0 ? body.length : after;
    if (from < focus.start || to > focus.end) {
      return {
        scale: 'paragraph', sectionIds: [firstId], start: from, end: to,
        capturedText: body.slice(from, to),
      };
    }
    /* The selection already was the whole paragraph — skip a rung rather than
       offering a "Wider" that visibly does nothing. */
  }

  if (focus.scale === 'selection' || focus.scale === 'paragraph') {
    return {
      scale: 'section', sectionIds: [firstId], start: 0, end: body.length,
      capturedText: body,
    };
  }

  /* section → the whole Work, in document order. */
  const ids = sections.map((s) => s.id);
  if (!ids.length) return null;
  const lastBody = bodyOf(ids[ids.length - 1]);
  if (lastBody === undefined || lastBody === null) return null;
  const whole: HeldFocus = {
    scale: 'work', sectionIds: ids, start: 0, end: lastBody.length, capturedText: '',
  };
  const text = textOf(whole, bodyOf);
  if (text === null) return null;
  return { ...whole, capturedText: text };
}

/**
 * Narrowing is memory, not computation. The writer returns to the aperture they
 * came from — deriving a "smaller" focus would invent an attention they never
 * had.
 */
export function narrow(ladder: HeldFocus[]): { focus: HeldFocus | null; ladder: HeldFocus[] } {
  if (!ladder.length) return { focus: null, ladder };
  const next = ladder.slice();
  const focus = next.pop() ?? null;
  return { focus, ladder: next };
}

/**
 * ⭐ THE STRIP AND MAIA'S PROSE MUST NEVER NAME THE SAME FOCUS DIFFERENTLY.
 * One label function, so there is one name for what is held.
 */
export function label(focus: HeldFocus, sections: SectionRef[]): string {
  if (focus.scale === 'work') return 'whole work';
  const byId = new Map(sections.map((s) => [s.id, s]));
  const positions = focus.sectionIds
    .map((id) => byId.get(id)?.position)
    .filter((p): p is number => p !== undefined)
    .map((p) => p + 1);
  const span = positions.length > 1
    ? `sections ${positions[0]}–${positions[positions.length - 1]}`
    : positions.length === 1 ? `section ${positions[0]}` : 'this work';
  if (focus.scale === 'section') return span;
  const kind = focus.scale === 'paragraph' ? 'paragraph' : 'passage';
  return `${kind} in ${span}`;
}

/** A short quotation for the strip. Never the whole passage — the strip is a marker. */
export function quote(focus: HeldFocus, bodyOf: BodyOf, max = 70): string | null {
  const text = textOf(focus, bodyOf);
  if (text === null) return null;
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat.length > max ? `${flat.slice(0, max)}…` : flat;
}

/** Whether a given section currently carries any part of the held focus. */
export function covers(focus: HeldFocus | null, sectionId: string): boolean {
  return !!focus && focus.sectionIds.includes(sectionId);
}
