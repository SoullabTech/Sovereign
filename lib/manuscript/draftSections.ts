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
  id: string;
  heading: string | null;
  body: string;
}

/**
 * One source section's exact contribution to the composed draft.
 *
 * THE MAPPING IS STRUCTURAL, NOT POSITIONAL. `manuscript_draft_sections` already
 * carries `source_section_id` as provenance — which Source section a boundary
 * came from. Returning bare strings would make the route re-establish that by
 * array position (`slices[i] belongs to sourceRows[i]`), an external convention
 * that no test holds and that a later `ORDER BY` change would silently break.
 */
export interface ComposedDraftSlice {
  sourceSectionId: string;
  text: string;
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
  slices: ComposedDraftSlice[];
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
  const slices: ComposedDraftSlice[] = [];
  let cursor = 0;
  for (let i = 0; i < starts.length; i += 1) {
    const from = starts[i];
    const to = i + 1 < starts.length ? starts[i + 1] : parts.length;
    /* Length of parts[from..to) joined, plus the separator that follows this
       run when another run comes after it. */
    let len = 0;
    for (let j = from; j < to; j += 1) len += parts[j].length + (j > from ? 1 : 0);
    if (to < parts.length) len += 1;
    slices.push({ sourceSectionId: sections[i].id, text: content.slice(cursor, cursor + len) });
    cursor += len;
  }

  return { content, slices };
}

/* ── conversion ──────────────────────────────────────────────────────────── */

export type ConversionPlan =
  | { status: 'lossless'; slices: ComposedDraftSlice[] }
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
  /* PRESENCE, NOT VALID TYPE. Checking `typeof body.content === 'string'` would
     let `{ content: 123, sections: [...] }` through: the content is not a valid
     string, so it is silently ignored and the section write proceeds. But the
     caller DID supply content — it believes content is writable authority, and
     on a converted draft it is not. The ratified rule is about the key, so the
     check is about the key. */
  const contentSupplied = Object.prototype.hasOwnProperty.call(body, 'content');
  const sectionsSupplied = Object.prototype.hasOwnProperty.call(body, 'sections');

  /* Both supplied: which one is authority? The server will not pick, because
     picking is how a stale editor silently overwrites a section-aware save.
     Decided before either value is validated, so a malformed one cannot make
     the ambiguity disappear. */
  if (contentSupplied && sectionsSupplied) {
    return refuse('ambiguous_write_authority',
      'a converted draft is written by sections; content is derived and must not be sent');
  }
  if (!sectionsSupplied || !Array.isArray(body.sections)) {
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

  /* REFUSAL PRECEDENCE, FROZEN. An id this draft does not own is
     `unknown_section_id`, always — checked before any topology reasoning.
     Topology refusals are reserved for payloads whose ids are ALL known and
     whose set or order is nonetheless wrong. Without a fixed order an added id
     could return either refusal depending on evaluation order, and a client
     cannot map an ambiguous refusal to member-facing behaviour. */
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

/* ── the section↔revision relation ────────────────────────────────────────── */

/**
 * One section's character range within an immutable revision's content.
 *
 * AUTHORIZED SCOPE. This is the relation the BUILD-07A recoverability ruling
 * chose (option 2, mechanism (d)): freeze `(revisionNumber, charRange)` against
 * the append-only `working_draft_revisions` rather than duplicating manuscript
 * prose into a second custody domain. It carries NO TEXT — ids and offsets
 * only — so the Work's words continue to exist in exactly one place, with one
 * deletion cascade, one retention answer and one Sanctuary boundary.
 *
 * ⛔ OFFSETS ARE ONLY STABLE BECAUSE THE TARGET IS IMMUTABLE. A revision is
 * append-only and never rewritten, so a range into it means the same characters
 * forever. The same offsets against LIVE draft content would rot on the next
 * keystroke. Never carry these ranges over to `manuscript_working_drafts`.
 */
export interface RevisionSectionRange {
  sectionId: string;
  /** Inclusive start offset, in UTF-16 code units, into the revision content. */
  start: number;
  /** Exclusive end offset. */
  end: number;
}

export type RestoreRefusal = 'partition_not_recorded' | 'topology_change_requires_explicit_command';

export type RestoreCheck =
  | { ok: true; value: DraftSectionState[] }
  | { ok: false; refusal: RestoreRefusal; detail: string };

const refuseRestore = (refusal: RestoreRefusal, detail: string): RestoreCheck =>
  ({ ok: false, refusal, detail });

/**
 * The partition to freeze alongside a revision, derived from the exact sections
 * that produced its content.
 *
 * Derived from the same array the content was flattened from, in one pass, so
 * the ranges cannot describe a different partition than the one saved.
 */
export function partitionFromSections(
  sections: readonly DraftSectionState[],
): RevisionSectionRange[] {
  const out: RevisionSectionRange[] = [];
  let cursor = 0;
  for (const s of sections) {
    out.push({ sectionId: s.id, start: cursor, end: cursor + s.text.length });
    cursor += s.text.length;
  }
  return out;
}

/**
 * Rebuild a revision's sections from its frozen partition.
 *
 * ⛔ NOTHING IS INFERRED HERE. If the partition was not recorded, this refuses
 * rather than re-partitioning the older content — re-partitioning yields
 * boundaries with NO id continuity to the sections that exist now, which is the
 * failure mode option (c) was rejected for. A restore that silently reassigns
 * identities is worse than a restore that will not run.
 */
export function sectionsFromPartition(
  content: string,
  partition: readonly RevisionSectionRange[] | null | undefined,
  currentOrderedIds: readonly string[],
): RestoreCheck {
  if (!partition || partition.length === 0) {
    return refuseRestore('partition_not_recorded',
      'this revision predates the draft becoming section-addressable, '
      + 'so its section boundaries were never recorded and cannot be inferred');
  }

  /* Contiguous, zero-based, and covering the content exactly. A partition that
     does not is not a weaker record of the same thing — it is a record of a
     different text, and restoring from it would drop or duplicate characters
     the member wrote. */
  let cursor = 0;
  for (const [i, r] of partition.entries()) {
    if (r.start !== cursor || r.end < r.start) {
      return refuseRestore('partition_not_recorded',
        `the recorded partition is not contiguous at index ${i}`);
    }
    cursor = r.end;
  }
  if (cursor !== content.length) {
    return refuseRestore('partition_not_recorded',
      `the recorded partition covers ${cursor} of ${content.length} characters`);
  }

  /* Restoring a partition whose identities differ from the draft's own is a
     topology change — sections appearing, disappearing or reordering. Explicit
     topology commands are not part of this slice, so it is refused rather than
     performed silently. */
  const sameSet =
    partition.length === currentOrderedIds.length
    && partition.every((r, i) => r.sectionId === currentOrderedIds[i]);
  if (!sameSet) {
    return refuseRestore('topology_change_requires_explicit_command',
      'this revision was partitioned into a different set or order of sections '
      + 'than the draft now holds');
  }

  return {
    ok: true,
    value: partition.map((r) => ({ id: r.sectionId, text: content.slice(r.start, r.end) })),
  };
}
