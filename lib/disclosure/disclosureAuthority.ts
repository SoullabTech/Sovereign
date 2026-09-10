/**
 * THE DISCLOSURE CAPABILITY — authority made unforgeable, and enforced where the
 * consequential act occurs.
 *
 *   ⭐⭐ A prose crossing is lawful not because every caller remembered to ask
 *       permission, but because cognition-bound manuscript content cannot exist
 *       in the developmental path without fresh disclosure authority.
 *
 * ARCHITECTURE C, LOADER-BOUND. An earlier shape branded the loader's OUTPUT.
 * That protects consumers and nothing else: anyone able to call the loader still
 * obtained branded content. So the load happens INSIDE `discloseUnder` — the
 * `load` closure is invoked only after provenance, freshness and applicability
 * all hold. A forgotten capability is not a missed check; there is no reachable
 * path on which the load runs at all.
 *
 * TWO INDEPENDENT FACTS, BOTH AT THE LOAD:
 *
 *   PROVENANCE    did the canonical boundary mint this capability?
 *   APPLICABILITY does it authorize THIS member, Work and locus?
 *
 * A WeakSet proves the first and says nothing about the second. Authority for
 * Work A that loads Work B is genuine and unlawful at once — the same shape as
 * a precheck that passes while the mutation it was supposed to govern proceeds
 * unguarded.
 *
 * ⛔ NOT AUTHORITY: a receipt. A receipt proves a crossing occurred; it can
 * never construct, deserialize, resume or renew a capability. Nothing here is
 * serializable, persisted or resumable, and the one-shot rule closes the same
 * loophole in live memory that the receipt rule closes in the database.
 *
 * ⛔ NOT GOVERNED HERE: `loadLiveWork`. Possession of plaintext is not
 * disclosure. An integrity operation may hold authored characters for a digest
 * comparison provided they terminate inside it; putting that behind this gate
 * would make Focus a general permission system for every function that touches
 * a manuscript, which is not what was constituted.
 */

/** Where in the Work the authority reaches. Runtime provenance — NOT receipt vocabulary. */
export type DisclosureLocus =
  | { readonly scopeKind: 'whole_work' }
  | { readonly scopeKind: 'section'; readonly sectionRef: string }
  /**
   * ⭐ The containing section is here and NEVER in the receipt. The capability
   * must distinguish this passage from another; the durable record must not
   * narrow reconstruction of what was selected. Runtime provenance and durable
   * evidence serve different purposes, and implementation convenience must not
   * use one to reopen the other.
   */
  | { readonly scopeKind: 'passage'; readonly sectionRef: string; readonly range: { readonly start: number; readonly end: number } }
  /** One authored division and the sections it lawfully holds, in document order. */
  | { readonly scopeKind: 'unit'; readonly unitRef: string; readonly sectionRefs: readonly string[] }
  /** One bounded contiguous run. The bounds ARE its identity; the members prove the run. */
  | { readonly scopeKind: 'range'; readonly fromSectionRef: string; readonly toSectionRef: string; readonly sectionRefs: readonly string[] }
  /**
   * ADDENDUM-02 · the prose-bearing evidence of one developmental observation.
   *
   * ⭐ `members` are OPAQUE canonical identity strings, derived by the consumer
   * that owns the evidence vocabulary. This module deliberately knows nothing
   * about `EvidenceRef`: keying belongs where the type is defined, and importing
   * the manuscript model here would let a disclosure primitive drift with it.
   *
   * ⭐⭐ AUTHORITY ANSWERS WHAT MAY CROSS; ORDERING ANSWERS HOW WHAT CROSSED IS
   * PRESENTED. They are not the same question — so membership is compared
   * order-independently, while the live evidence array keeps its own sequence for
   * rendering. Same scope does not therefore mean same act: if order changes the
   * prompt, act identity may still distinguish the two.
   */
  | { readonly scopeKind: 'evidence_set'; readonly members: readonly string[] };

/** What a capability authorizes, and what a load must match. */
export interface DisclosureRequest {
  readonly memberId: string;
  readonly workRef: string;
  readonly locus: DisclosureLocus;
}

/**
 * ⭐ Unforgeable by construction: a private field no other module can produce,
 * plus module-private provenance. The repository's own idiom — `BoundEvidence`
 * and the minted `MemberIdentity` are the same shape for the same reason.
 *
 * ⛔ RESIDUAL, STATED PLAINLY: nothing in the type system stops another module
 * in this package from calling `mintDisclosureAuthority`. Only the canonical
 * boundary may, and a falsifier asserts there is exactly one non-test caller.
 * That is a discipline with a guard, not a structural impossibility — recorded
 * here rather than left for a reader to assume away.
 */
export class DisclosureAuthority {
  /** @internal Never read. Its existence is what makes the class unconstructable elsewhere. */
  private readonly __disclosureAuthority!: never;
  /** @internal */ readonly grant!: DisclosureRequest;
  /** @internal One-shot. A completed crossing does not leave reusable authority behind. */
  spent = false;
}

const MINTED = new WeakSet<object>();

/** True iff this object was produced here. The provenance half of the check. */
export function isMintedAuthority(a: unknown): a is DisclosureAuthority {
  return typeof a === 'object' && a !== null && MINTED.has(a);
}

/**
 * ⛔ THE SOLE MINT, and it belongs to `establishDisclosureBoundary` alone.
 * Freshness is structural rather than declared: this object exists only inside
 * the invocation that established the boundary, is never returned to a client,
 * and cannot be reconstructed from any durable row.
 */
export function mintDisclosureAuthority(grant: DisclosureRequest): DisclosureAuthority {
  const authority = Object.create(DisclosureAuthority.prototype) as DisclosureAuthority;
  Object.defineProperty(authority, 'grant', { value: Object.freeze({ ...grant }), enumerable: false });
  Object.defineProperty(authority, 'spent', { value: false, writable: true, enumerable: false });
  MINTED.add(authority);
  return authority;
}

/**
 * Cognition-bound manuscript prose. Constructable ONLY by an authorized load, so
 * possessing one is itself evidence that a matching capability was spent for it.
 */
export class DisclosedContent {
  /** @internal */ private readonly __disclosedContent!: never;
  /** @internal */ readonly text!: string;
}

const DISCLOSED = new WeakSet<object>();

/** Read the authorized characters. Refuses anything this module did not seal. */
export function readDisclosed(content: DisclosedContent): string {
  if (!DISCLOSED.has(content)) {
    throw new Error('[DISCLOSURE] not disclosed content — refusing to read');
  }
  return content.text;
}

export type DisclosureRefusal =
  | 'not_minted'
  | 'spent'
  | 'member_mismatch'
  | 'work_mismatch'
  | 'scope_kind_mismatch'
  | 'locus_mismatch';

export type DiscloseOutcome =
  | { readonly kind: 'disclosed'; readonly content: DisclosedContent }
  | { readonly kind: 'refused'; readonly reason: DisclosureRefusal }
  /** The authorized material could not be read. Authority held; the crossing did not. */
  | { readonly kind: 'unavailable' };

const sameOrder = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((v, i) => v === b[i]);

/**
 * Order-independent MULTISET equality.
 *
 * ⛔ NOT `new Set()`. Nothing in the evidence contract guarantees that an
 * observation cannot rest on the same reference twice, and collapsing duplicates
 * would manufacture a uniqueness guarantee the repository never made — quietly
 * letting `[A, A, C]` be satisfied by an authority over `[A, C]`. If uniqueness
 * is established later this degenerates to ordinary set comparison on its own.
 */
const sameMultiset = (a: readonly string[], b: readonly string[]) => {
  if (a.length !== b.length) return false;
  const counts = new Map<string, number>();
  for (const v of a) counts.set(v, (counts.get(v) ?? 0) + 1);
  for (const v of b) {
    const n = counts.get(v);
    if (!n) return false;
    counts.set(v, n - 1);
  }
  return true;
};

/**
 * APPLICABILITY. Exact match, never containment: authority over a division does
 * not authorize an arbitrary subset of it, because the disclosed thing is the
 * division as commissioned, not whichever sections a later caller asked for.
 */
function locusMatches(granted: DisclosureLocus, requested: DisclosureLocus): boolean {
  if (granted.scopeKind !== requested.scopeKind) return false;
  switch (granted.scopeKind) {
    case 'whole_work':
      return true;
    case 'section':
      return granted.sectionRef === (requested as Extract<DisclosureLocus, { scopeKind: 'section' }>).sectionRef;
    case 'passage': {
      const r = requested as Extract<DisclosureLocus, { scopeKind: 'passage' }>;
      return granted.sectionRef === r.sectionRef
        && granted.range.start === r.range.start
        && granted.range.end === r.range.end;
    }
    case 'unit': {
      const r = requested as Extract<DisclosureLocus, { scopeKind: 'unit' }>;
      return granted.unitRef === r.unitRef && sameOrder(granted.sectionRefs, r.sectionRefs);
    }
    case 'range': {
      const r = requested as Extract<DisclosureLocus, { scopeKind: 'range' }>;
      return granted.fromSectionRef === r.fromSectionRef
        && granted.toSectionRef === r.toSectionRef
        && sameOrder(granted.sectionRefs, r.sectionRefs);
    }
    case 'evidence_set': {
      const r = requested as Extract<DisclosureLocus, { scopeKind: 'evidence_set' }>;
      return sameMultiset(granted.members, r.members);
    }
  }
}

/**
 * ⭐⭐ THE GATE. `load` is a closure the caller supplies and this function
 * invokes — so an unauthorized or mismatched request does not merely fail a
 * check, it never reaches the query. That is the difference between architecture
 * C and the procedural discipline it replaced.
 *
 * The capability is SPENT before the load runs. A crossing that then fails
 * leaves its receipt truthfully `attempted`; it does not leave live authority
 * behind for a second attempt to find.
 */
export async function discloseUnder(
  authority: DisclosureAuthority,
  request: DisclosureRequest,
  load: () => Promise<string | null>,
): Promise<DiscloseOutcome> {
  if (!isMintedAuthority(authority)) return { kind: 'refused', reason: 'not_minted' };
  if (authority.spent) return { kind: 'refused', reason: 'spent' };

  const g = authority.grant;
  if (g.memberId !== request.memberId) return { kind: 'refused', reason: 'member_mismatch' };
  if (g.workRef !== request.workRef) return { kind: 'refused', reason: 'work_mismatch' };
  if (g.locus.scopeKind !== request.locus.scopeKind) return { kind: 'refused', reason: 'scope_kind_mismatch' };
  if (!locusMatches(g.locus, request.locus)) return { kind: 'refused', reason: 'locus_mismatch' };

  authority.spent = true;

  const text = await load();
  if (text === null) return { kind: 'unavailable' };

  const content = Object.create(DisclosedContent.prototype) as DisclosedContent;
  Object.defineProperty(content, 'text', { value: text, enumerable: false });
  DISCLOSED.add(content);
  return { kind: 'disclosed', content };
}
