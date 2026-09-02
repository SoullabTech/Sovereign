/**
 * WS2-07 prerequisite — SECTION-ADDRESSABLE DRAFT LIVENESS.
 *
 * THE RULED CONTRACT (2026-09-02, Option 3):
 *
 *     SECTION-NATIVE CLIENT STATE
 *   + SERVER-DERIVED WHOLE-DRAFT CONTENT
 *   + EXPLICIT TOPOLOGY COMMANDS
 *   + NO INFERRED BOUNDARY MUTATION
 *
 * WHY THIS MODULE IS PURE. Every refusal this contract makes is decided here,
 * with no database and no request. The route validates by calling in, so the
 * rules can be proven without a Postgres, and so a defect in them is a unit-test
 * failure rather than a 500 discovered by a member.
 *
 * WHAT `content` BECOMES ON A CONVERTED DRAFT. Derived, never supplied. Two
 * DEFERRED constraint triggers (migration 20260830000001) raise at COMMIT when a
 * section-addressable draft's content is not the exact flattening of its
 * sections. The old route sent `content` and no sections, so it could not write
 * a converted draft at all — that is the liveness defect this closes. Deriving
 * content server-side makes the triggers satisfiable BY CONSTRUCTION rather than
 * by two client-held representations happening to agree.
 *
 * ⛔ NO BOUNDARY IS EVER INFERRED. Nothing here diffs text to guess which
 * section changed, split or merged. A wrong guess silently transfers a durable
 * identity that authored structure and developmental evidence both depend on,
 * and the corruption is invisible at write time.
 */

/** A source section as stored in `manuscript_sections`. */
export interface SourceSection {
  heading: string | null;
  body: string;
}

/** One section of a section-addressable draft, as the client holds it. */
export interface DraftSectionState {
  id: string;
  text: string;
}

export type SaveRefusal =
  /** A converted draft received a content-only save. */
  | 'section_state_required'
  /** Both writable `content` and `sections` were supplied. */
  | 'ambiguous_write_authority'
  /** The id set or its order would change through the ordinary save path. */
  | 'topology_change_requires_explicit_command'
  /** The payload names an identity that does not belong to this draft. */
  | 'unknown_section_id'
  /** Conversion cannot prove the boundaries exactly. */
  | 'boundary_confirmation_required';

export type SaveCheck<T> =
  | { ok: true; value: T }
  | { ok: false; refusal: SaveRefusal; detail?: string };

const refuse = <T>(refusal: SaveRefusal, detail?: string): SaveCheck<T> =>
  detail ? { ok: false, refusal, detail } : { ok: false, refusal };

/* ── composition ─────────────────────────────────────────────────────────── */

/**
 * The source-derived draft text AND the exact slice each source section
 * contributes to it.
 *
 * DERIVED IN ONE PASS, NEVER RE-DERIVED. The slices are built by the same loop
 * that builds the text, so `slices.join('') === content` holds by construction
 * rather than by a second function agreeing with the first. That matters because
 * the slices are NOT uniform: every section contributes a trailing blank line
 * except the last, which contributes a single newline — a consequence of
 * `parts.join('\n')` over a trailing empty element. Hand-deriving that boundary
 * is exactly the kind of near-miss that would put every section id one character
 * out of place.
 */
export function composeDraftSlices(sections: readonly SourceSection[]): {
  content: string;
  slices: string[];
} {
  const parts: string[] = [];
  /** Index into `parts` at which each section's contribution begins. */
  const starts: number[] = [];

  for (const s of sections) {
    starts.push(parts.length);
    const heading = s.heading?.trim();
    if (heading) {
      parts.push(heading);
      parts.push('');
    }
    parts.push(s.body);
    parts.push('');
  }

  const content = parts.join('\n');

  /* Reconstruct each section's slice as the exact substring of `content` its
     parts occupy, separators included. Working in the joined string rather than
     re-joining per section is what keeps the boundary between "\n\n" and the
     final "\n" correct without special-casing it. */
  const slices: string[] = [];
  let cursor = 0;
  for (let i = 0; i < starts.length; i += 1) {
    const from = starts[i];
    const to = i + 1 < starts.length ? starts[i + 1] : parts.length;
    /* Length of parts[from..to) joined, plus the separator that follows this
       run when another run comes after it. */
    let len = 0;
    for (let j = from; j < to; j += 1) len += parts[j].length + (j > from ? 1 : 0);
    if (to < parts.length) len += 1;
    slices.push(content.slice(cursor, cursor + len));
    cursor += len;
  }

  return { content, slices };
}

/* ── conversion ──────────────────────────────────────────────────────────── */

export type ConversionPlan =
  | { status: 'lossless'; slices: string[] }
  | { status: 'refused'; refusal: 'boundary_confirmation_required'; detail: string };

/**
 * Whether an existing draft may be converted automatically.
 *
 * ⛔ LOSSLESS MEANS MECHANICALLY EXACT. The only admissible proof is that the
 * current draft content is BYTE-IDENTICAL to the flattening of the
 * source-derived partition. Heading matching, similarity, inferred boundaries
 * and diff attribution are not weaker evidence of the same thing — they are a
 * different claim, and none of them may be described as lossless.
 *
 * A member-assisted boundary confirmation may later serve the refused case. It
 * is not required for the first liveness slice, and its absence is why the
 * refusal is typed rather than a fallback.
 */
export function planConversion(
  currentContent: string,
  sourceSections: readonly SourceSection[],
): ConversionPlan {
  if (sourceSections.length === 0) {
    return {
      status: 'refused',
      refusal: 'boundary_confirmation_required',
      detail: 'the manuscript has no source sections to partition from',
    };
  }

  const { content, slices } = composeDraftSlices(sourceSections);

  /* Compared as bytes, not as strings: two different sequences of code points
     can compare equal after normalization, and a normalized match would let a
     partition off by an invisible character call itself exact. */
  const a = Buffer.from(content, 'utf8');
  const b = Buffer.from(currentContent, 'utf8');
  if (!a.equals(b)) {
    return {
      status: 'refused',
      refusal: 'boundary_confirmation_required',
      detail: `the draft has diverged from its source partition `
        + `(source ${a.length} bytes, draft ${b.length} bytes)`,
    };
  }

  return { status: 'lossless', slices };
}

/* ── the ordinary save ───────────────────────────────────────────────────── */

export interface SectionSaveRequest {
  /** Present only on an unconverted draft. */
  content?: unknown;
  /** Present only on a converted draft. */
  sections?: unknown;
}

/**
 * Validate an ordinary save against a converted draft.
 *
 * COMPLETE-STATE PAYLOAD. Every current section, exactly once, in the current
 * order.
 *
 * ⛔ OMISSION IS NEVER A DELETION. A short list means the payload is incomplete
 * or is attempting a topology change this endpoint cannot perform. It does NOT
 * mean the member asked to remove a section, and intent is never inferred from
 * absence — the refusal writes nothing and names what is missing.
 */
export function validateSectionSave(
  body: SectionSaveRequest,
  currentOrderedIds: readonly string[],
): SaveCheck<DraftSectionState[]> {
  const hasContent = typeof body.content === 'string';
  const hasSections = Array.isArray(body.sections);

  /* Both supplied: which one is authority? The server will not pick, because
     picking is how a stale editor silently overwrites a section-aware save. */
  if (hasContent && hasSections) {
    return refuse('ambiguous_write_authority',
      'a converted draft is written by sections; content is derived and must not be sent');
  }
  if (!hasSections) {
    return refuse('section_state_required',
      'this draft is section-addressable: send ordered sections [{ id, text }]');
  }

  const raw = body.sections as unknown[];
  const parsed: DraftSectionState[] = [];
  for (const [i, r] of raw.entries()) {
    if (typeof r !== 'object' || r === null) {
      return refuse('section_state_required', `sections[${i}] is not an object`);
    }
    const { id, text } = r as { id?: unknown; text?: unknown };
    if (typeof id !== 'string' || id.length === 0) {
      return refuse('section_state_required', `sections[${i}].id must be a non-empty string`);
    }
    /* Asserted, not coerced: an absent `text` coerced to '' would empty a
       section the member never touched. */
    if (typeof text !== 'string') {
      return refuse('section_state_required', `sections[${i}].text must be a string`);
    }
    parsed.push({ id, text });
  }

  const known = new Set(currentOrderedIds);
  for (const s of parsed) {
    if (!known.has(s.id)) {
      return refuse('unknown_section_id', s.id);
    }
  }

  const seen = new Set<string>();
  for (const s of parsed) {
    if (seen.has(s.id)) {
      return refuse('topology_change_requires_explicit_command', `duplicate section ${s.id}`);
    }
    seen.add(s.id);
  }

  if (parsed.length !== currentOrderedIds.length) {
    const missing = currentOrderedIds.filter((id) => !seen.has(id));
    return refuse('topology_change_requires_explicit_command',
      missing.length > 0
        /* Named explicitly, so the client is told what to include rather than
           left to infer that omission meant something. */
        ? `the payload is incomplete: ${missing.length} section(s) missing, `
          + `beginning with ${missing[0]}. Omission is not a deletion.`
        : `expected ${currentOrderedIds.length} sections, received ${parsed.length}`);
  }

  for (let i = 0; i < parsed.length; i += 1) {
    if (parsed[i].id !== currentOrderedIds[i]) {
      return refuse('topology_change_requires_explicit_command',
        `order changed at position ${i}: expected ${currentOrderedIds[i]}, received ${parsed[i].id}`);
    }
  }

  return { ok: true, value: parsed };
}

/** The whole-draft content a converted draft must hold, given its sections. */
export function flattenSections(sections: readonly DraftSectionState[]): string {
  return sections.map((s) => s.text).join('');
}
