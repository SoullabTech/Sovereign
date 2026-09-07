/**
 * WS-DEV-SCOPE-01 — the writer chooses what MAIA reads.
 *
 * Founder ruling 2026-09-07, on witnessing `ceiling_exceeded` against a
 * 211-page book. The reading always attempted the whole draft and the ceiling
 * then refused it, so the capability could not succeed on its own subject: a
 * real book met a dead end, not a choice.
 *
 * The ceiling is NOT the defect and is NOT changed here. "Refused whole,
 * nothing trimmed" is right — a reading that silently read a fifth of a book
 * and reported on "the work" would be the worse failure. What was missing is
 * that refusal was the ONLY outcome, because nobody could ask for less.
 *
 * ── The frozen contract this implements ───────────────────────────────────
 *   WRITER CHOOSES    current section · chapter/part · explicit range · whole
 *   ROUTE RECEIVES    structural identifiers only — never prose, never an
 *                     observation
 *   COVERAGE RECORDS  every section, at the depth it was actually read
 *   NEVER             silently trim · choose "important" sections · rank
 *                     chapters · infer what the writer meant · report on the
 *                     whole work after a partial read
 *
 * ── Why this file is pure ────────────────────────────────────────────────
 * The scope law is where a mistake would be invisible: an off-by-one range, a
 * silently-dropped id, an empty scope quietly becoming "everything". None of
 * those need a database to be wrong, so none of them need one to be caught.
 * The caller supplies the member's own topology and unit membership; this
 * decides, and refuses in the member's own terms.
 */

/** Structural identifiers ONLY. There is no shape here that can carry prose. */
export type ReadingScope =
  | { readonly kind: 'whole' }
  | { readonly kind: 'section'; readonly sectionId: string }
  | { readonly kind: 'unit'; readonly unitId: string }
  | { readonly kind: 'range'; readonly fromSectionId: string; readonly toSectionId: string };

export type ScopeRefusal =
  /** A shape the contract does not name. Never coerced into the nearest one. */
  | 'invalid_scope'
  /** An id that is not in this member's own topology, or names no sections. */
  | 'unknown_scope_target'
  /** A range whose ends are in the wrong order — see the note on refusing it. */
  | 'range_inverted'
  /** The scope resolved to nothing. Never silently promoted to the whole work. */
  | 'empty_scope';

export type ScopeOutcome =
  | { readonly ok: true; readonly bodyScope: readonly string[] }
  | { readonly ok: false; readonly refusal: ScopeRefusal; readonly detail: string };

const refuse = (refusal: ScopeRefusal, detail: string): ScopeOutcome => ({ ok: false, refusal, detail });

/** A structural scope, and nothing that could be mistaken for one. */
export function isReadingScope(value: unknown): value is ReadingScope {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  const only = (...keys: string[]) => {
    const own = Object.keys(v);
    return own.length === keys.length + 1 && keys.every((k) => typeof v[k] === 'string' && v[k]);
  };
  switch (v.kind) {
    case 'whole':
      return Object.keys(v).length === 1;
    case 'section':
      return only('sectionId');
    case 'unit':
      return only('unitId');
    case 'range':
      return only('fromSectionId', 'toSectionId');
    default:
      return false;
  }
}

export interface ScopeInputs {
  /** The member's own sections, in document order. The only source of order. */
  readonly topology: readonly string[];
  /** Section ids belonging to each structure unit the member authored. */
  readonly unitSections: Readonly<Record<string, readonly string[]>>;
}

/**
 * The chosen scope, as an ordered list of section ids — or a refusal.
 *
 * Order always comes from the TOPOLOGY, never from the request. A client that
 * lists sections out of order does not thereby reorder the book, and a range
 * is read the way the work is written.
 */
export function resolveScope(scope: ReadingScope, inputs: ScopeInputs): ScopeOutcome {
  const { topology, unitSections } = inputs;
  const known = new Set(topology);

  switch (scope.kind) {
    case 'whole':
      /* Still allowed, and still subject to the ceiling. The point of the door
         is not that the whole work becomes readable — it is that refusing it
         is no longer the end of the road. */
      return topology.length === 0
        ? refuse('empty_scope', 'this work has no readable sections')
        : { ok: true, bodyScope: [...topology] };

    case 'section':
      if (!known.has(scope.sectionId)) {
        return refuse('unknown_scope_target', `section ${scope.sectionId} is not in this work`);
      }
      return { ok: true, bodyScope: [scope.sectionId] };

    case 'unit': {
      const members = unitSections[scope.unitId];
      if (!members) {
        return refuse('unknown_scope_target', `no division ${scope.unitId} in this work`);
      }
      /* A member's division may name a section that has since left the draft.
         Those are dropped from the READ, never from the coverage record — the
         reading still says it did not read them. */
      const inScope = topology.filter((id) => members.includes(id));
      return inScope.length === 0
        ? refuse('empty_scope', `division ${scope.unitId} contains no sections of this draft`)
        : { ok: true, bodyScope: inScope };
    }

    case 'range': {
      const from = topology.indexOf(scope.fromSectionId);
      const to = topology.indexOf(scope.toSectionId);
      if (from === -1 || to === -1) {
        const missing = from === -1 ? scope.fromSectionId : scope.toSectionId;
        return refuse('unknown_scope_target', `section ${missing} is not in this work`);
      }
      if (from > to) {
        /* ⛔ NOT silently swapped. Reversing the ends would be inferring what
           the writer meant to scope, which the contract forbids by name — and
           a reader who asked for chapters 9 through 4 has made a mistake worth
           seeing rather than a request worth guessing at. */
        return refuse(
          'range_inverted',
          'the range ends before it begins; name the sections in the order the work is written',
        );
      }
      return { ok: true, bodyScope: topology.slice(from, to + 1) };
    }

    default:
      /* Unreachable given isReadingScope, and refused rather than assumed. */
      return refuse('invalid_scope', 'unrecognised scope');
  }
}
