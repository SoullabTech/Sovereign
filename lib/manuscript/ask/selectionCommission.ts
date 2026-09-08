/**
 * SEL-0 · the writer's selection commission.
 *
 * A COMMISSION IS NOT AN ANCHOR, and this file exists so that stays true.
 *
 * `SUPPORTED_ANCHORS` and both anchor parsers in the ask route are frozen
 * (contract §2.1). A commission is a separate field with a separate parser and
 * a separate shape, so no future edit can widen an anchor into a permission to
 * select — the two boundaries cannot be confused because they are not the same
 * kind of thing.
 *
 * ⛔ ABSENCE OF `observationKey` IS NEVER PERMISSION. The contract is explicit:
 * a request that merely fails to name an observation has not commissioned
 * anything. Selection runs only on an explicit, writer-originating act, carried
 * here as its own field. Nothing about the *shape* of a request may be read as
 * a commission — not room load, not scope selection, not navigation, not the
 * completion of another dialogue, not ambiguous free text.
 *
 * OFFER MEMORY IS COMMISSION-SCOPED (Q8). `offered` is the record of what MAIA
 * has already offered inside THIS commission, and it travels with the
 * commission rather than being persisted as selector-consumable state. A new
 * commission carries a new `commissionId` and therefore an empty record, which
 * is how "prior offers confer no authority on future selection" is made
 * structural instead of remembered.
 *
 * WHY THE CLIENT CARRIES IT. The alternative — persisting offer memory
 * server-side — would create exactly the durable, selector-readable record Q8
 * forbids, and would then need a second rule to stop the selector reading it.
 * The writer's own client is the commission's lifetime. A client that misreports
 * `offered` can only re-offer or skip the writer's own observations; it cannot
 * confer standing, alter lifecycle, or reach another commission.
 */

export interface SelectionCommission {
  /** The frozen reading the commission is made against. */
  readonly readingId: string;
  /** Identity of THIS commission. A new value is a new commission. */
  readonly commissionId: string;
  /** Observation keys already offered in this commission, and nothing else. */
  readonly offered: readonly string[];
}

/**
 * Strict, closed parse. An unexpected key is a refusal rather than something
 * ignored: a commission that silently tolerated extra fields is a place where a
 * prohibited signal could later be smuggled to the selector.
 */
export function parseSelectionCommission(v: unknown): SelectionCommission | null {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return null;
  const o = v as Record<string, unknown>;
  const keys = Object.keys(o).sort().join(',');
  if (keys !== 'commissionId,offered,readingId') return null;
  if (typeof o.readingId !== 'string' || o.readingId.length === 0) return null;
  if (typeof o.commissionId !== 'string' || o.commissionId.length === 0) return null;
  if (!Array.isArray(o.offered)) return null;
  if (!o.offered.every((k) => typeof k === 'string' && k.length > 0)) return null;
  return {
    readingId: o.readingId,
    commissionId: o.commissionId,
    offered: o.offered as readonly string[],
  };
}

/** Exported for the falsifiers, which assert the parser cannot be widened. */
export const __parseSelectionCommissionForTest = parseSelectionCommission;
