/**
 * Expression vocabulary — the practitioner lens, resolved at RENDER time.
 *
 * ── The rule this module exists to enforce (CF-D5 / CF-D5a / CF-D5c) ─────────
 *
 *   The universal layer owns the VERBS. Practitioners own the VOCABULARY.
 *
 *   Expression vocabulary resolves at RENDER time. It does not become part of
 *   the member-authored object.
 *
 * Say RENDER, not READ. "Read" is ambiguous — database read, API read, memory
 * retrieval, document load. Render names the exact boundary: where
 * interpretation enters experience. The rule is NOT "do not fetch vocabulary".
 * It is: do not store or substitute meaning-bearing vocabulary into the
 * artifact layer. Resolve the lens at the point of presentation.
 *
 *   ✅ member artifact → universal structure → contextual lens → rendered
 *   ⛔ member artifact → practitioner vocabulary written into the record
 *
 * ── Why this is a code table and not a database registry ────────────────────
 *
 * CF-D5b — who may author the lens — is UNRULED. A vocabulary table built now
 * would bake an unruled answer into schema. For a single-practitioner pilot the
 * labels live here, provisionally, and the substrate is earned by an OBSERVED
 * second practitioner, never an imagined one.
 *
 * ⛔ This file is NON-PRECEDENTIAL. That `nowWhat` exists below is not a ruling
 *    that practitioners may author vocabulary, nor that the platform may.
 */

/**
 * The universal verbs. Capability primitives — not Larry's terms, not a coach's
 * terms, not a modality's terms. This set is the closed domain of the lens:
 * CF-D5a (RULED) — an expression may rename, order, or omit a universal verb;
 * it may NEVER introduce a zone that has no universal verb behind it.
 * Otherwise vocabulary becomes a capability-creation channel and CF-D2 is
 * bypassed through naming rather than through code.
 */
export const UNIVERSAL_VERBS = [
  'current_work',
  'practice',
  'explore',
  'keep',
  'connect',
] as const;

export type UniversalVerb = (typeof UNIVERSAL_VERBS)[number];

/** A lens may rename and omit. It may not add. Hence Partial, never Record+extra. */
export type ExpressionLabels = Partial<Record<UniversalVerb, string>>;

export interface Expression {
  /** Stable id. Never rendered to a member. */
  readonly key: string;
  /** Who authored these labels. Rendering a lens without this is absorption. */
  readonly authoredBy: 'platform' | 'practitioner';
  /**
   * True once the authoring practitioner has a signed rights instrument.
   * Larry's rights instrument is UNSIGNED as of 2026-08-03, which is why the
   * leadership lens below is not selectable for a real member yet.
   */
  readonly rightsCleared: boolean;
  readonly labels: ExpressionLabels;
}

/**
 * The default. Platform-authored, deliberately plain, and the only lens that
 * needs no rights clearance because it claims no practitioner's language.
 */
const UNIVERSAL: Expression = {
  key: 'universal',
  authoredBy: 'platform',
  rightsCleared: true,
  labels: {
    current_work: 'Current work',
    practice: 'Practice',
    explore: 'Explore',
    keep: 'Keep',
    connect: 'Connect',
  },
};

/**
 * The Now What? lens — one expression, not the ontology.
 *
 * ⚠️ `rightsCleared: false`. These labels are leadership-domain language staged
 *    for the founder walk. They may NOT be rendered to a member until the
 *    practitioner's rights instrument is signed. `resolveExpression` enforces
 *    this; it is not left to the caller to remember.
 *
 * ⛔ Nothing here is authored by engineering on a practitioner's behalf. If a
 *    practitioner's own wording differs, theirs replaces this — that is the
 *    whole point of the lens being separable.
 */
const NOW_WHAT: Expression = {
  key: 'now_what',
  authoredBy: 'practitioner',
  rightsCleared: false,
  labels: {
    current_work: 'Leadership focus',
    practice: 'Leadership practice',
    explore: 'Leadership insights',
    keep: 'Leadership commitments',
    connect: 'Coach relationship',
  },
};

const EXPRESSIONS: Record<string, Expression> = {
  [UNIVERSAL.key]: UNIVERSAL,
  [NOW_WHAT.key]: NOW_WHAT,
};

export interface ResolveOptions {
  /**
   * Set only for a founder/internal walk. Permits an expression whose rights
   * instrument is unsigned. Never set this on a path a real member reaches.
   */
  allowUnclearedRights?: boolean;
}

/**
 * Resolve the lens for presentation.
 *
 * Fails SAFE: an unknown key, or a lens whose rights are not cleared, falls
 * back to the universal labels rather than throwing or rendering unlicensed
 * language. A missing lens must degrade to plain speech, never to a blank
 * surface and never to someone else's words.
 */
export function resolveExpression(
  expressionKey: string | null | undefined,
  options: ResolveOptions = {},
): Expression {
  if (!expressionKey) return UNIVERSAL;
  const found = EXPRESSIONS[expressionKey];
  if (!found) return UNIVERSAL;
  if (!found.rightsCleared && !options.allowUnclearedRights) return UNIVERSAL;
  return found;
}

/**
 * The label a member should see for a universal verb, under a given lens.
 * Falls through to the universal wording whenever the lens omits the verb —
 * omission is permitted (CF-D5a), silence is not.
 */
export function labelFor(
  verb: UniversalVerb,
  expression: Expression,
): string {
  return expression.labels[verb] ?? UNIVERSAL.labels[verb] ?? verb;
}

/**
 * Attribution line for a lens, or null when there is nothing to attribute.
 *
 * CF-D5c: contextual attribution is admissible only while the relationship is
 * live, and it names the CONTEXT an object emerged in — never the identity of
 * the object. Callers pass `relationshipLive: false` when the engagement has
 * ended, and the attribution simply stops appearing. A line that outlives its
 * context has become identity, which is the prohibited form.
 *
 * ⛔ Never render this over a member-authored object. It belongs to the lens
 *    and to practitioner-authored material only.
 */
export function lensAttribution(
  expression: Expression,
  practitionerName: string | null,
  relationshipLive: boolean,
): string | null {
  if (expression.authoredBy !== 'practitioner') return null;
  if (!relationshipLive) return null;
  if (!practitionerName) return null;
  return `Within your work with ${practitionerName}`;
}
