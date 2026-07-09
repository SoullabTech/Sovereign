/**
 * Context Assembly — the interface, NOT an implementation.
 *
 * Candidate invariant (2026-07-08): no encounter surface constructs its own
 * conversational intelligence; every surface obtains MAIA through a Context
 * Assembly that produces THIS shape. This file is that shape — the smallest
 * contract that `/maia`, the Living Field, and What Now? can each honestly
 * satisfy WITHOUT changing behavior. It is derived from the common contract the
 * three already share (named prompt blocks + provenance + an emptiness signal),
 * not lifted from whichever assembler was written first.
 *
 * Authority: ZERO. Assembly gathers and formats member-authored material into
 * prompt-ready blocks; it never synthesizes higher-order meaning. This mirrors
 * `lib/maia/living-field/encounterContext.ts`'s stance ("context assembly, not
 * synthesis") and the constitutional direction-of-authority rule at the OS
 * boundary: a surface may situate, never synthesize.
 *
 * The interface is the invariant; the callers are its embodiments. The seam is
 * a composition boundary, not a file — none of the existing assemblers is the
 * ancestor of this contract; all three are (or become) its clients.
 *
 * See:
 *   docs/architecture/CONTEXT_ASSEMBLY_INVARIANT_CANDIDATE_2026-07-08.md
 *   docs/architecture/CONTEXT_ASSEMBLY_SEAM_GAP_2026-07-08.md
 *
 * STANDING: CANDIDATE. This file defines the contract and provides the render
 * helpers a caller needs to adopt it. It does NOT yet mandate that every surface
 * route through a single entry — that convergence is the work this contract
 * enables, proven one caller at a time.
 */

/**
 * One named, prompt-ready fragment.
 * `key` is provenance-facing — which source produced this block
 * (e.g. 'atoms', 'memoryInfluence', 'conversational', 'gatheredMaterial').
 */
export interface AssembledBlock {
  key: string;
  text: string;
}

/**
 * What every Context Assembly produces: ordered named blocks, a provenance list,
 * and an emptiness signal. This is the common denominator of the three existing
 * assemblers — not their union. Surface-specific *sources* differ; this *shape*
 * does not.
 */
export interface AssembledContext {
  /** Ordered, non-empty prompt fragments. Order is meaningful and caller-owned. */
  blocks: AssembledBlock[];
  /** True iff at least one non-empty block was gathered (the "hasAnything" signal). */
  hasAnything: boolean;
  /** Provenance: which sources contributed (labels / titles / keys). May be empty. */
  sources: string[];
}

/**
 * The contract a surface's assembler satisfies. `Profile` carries the
 * surface-specific configuration (the "Field Configuration") — field key,
 * mode, phase, member id, whatever situates this particular encounter. The
 * intelligence is unchanged across surfaces; only the Profile differs.
 */
export interface ContextAssembler<Profile = unknown> {
  assemble(profile: Profile): Promise<AssembledContext>;
}

/**
 * Construct an AssembledContext from candidate blocks. Empty/whitespace-only
 * blocks are dropped, and `hasAnything` is derived from what survives — so a
 * caller cannot accidentally claim presence it does not have.
 */
export function assembledContext(
  blocks: AssembledBlock[],
  sources: string[] = [],
): AssembledContext {
  const nonEmpty = blocks.filter((b) => b.text && b.text.trim().length > 0);
  return {
    blocks: nonEmpty,
    hasAnything: nonEmpty.length > 0,
    sources,
  };
}

/**
 * Render an AssembledContext to a single prompt string.
 *
 * The default separator ('\n\n') mirrors what the existing callers already use,
 * so adopting this interface is byte-identical to their prior hand-joins. A
 * caller that composes blocks differently (e.g. `/maia`'s order-sensitive
 * addenda with per-block boundaries) passes its own separator or renders block
 * texts directly — the contract does not force a house style, it names the shape.
 */
export function renderAssembledContext(ctx: AssembledContext, separator = '\n\n'): string {
  return ctx.blocks.map((b) => b.text).join(separator);
}
