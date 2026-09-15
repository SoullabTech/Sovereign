/**
 * EXECUTION FIT — the one law that decides whether a permission can execute.
 *
 * ⭐⭐ CS-3, IN ITS TRUTHFUL SUCCESSOR FORM.
 *
 * The retired law said *preview and acceptance consume the same guard*, and the
 * protection inside it was real: a surface must never advertise a change the
 * boundary would refuse. ⛔ But rebuilding it wholesale would recreate R6's
 * collapse, where *not executable* silently meant *not discussable*.
 *
 *     OLD   preview and acceptance consume the same guard
 *     NEW   any surface that CLAIMS AN AUTHORIZATION IS EXECUTABLE must consume
 *           the same Work-fit law the execution seam consumes
 *
 * ⛔ AND NOT BY PROPOSAL DISCUSSABILITY. Nothing in this module answers whether
 * a writer and MAIA may keep working on a formulation. That question has a
 * different subject — the chain and its versions — and asking it here is the
 * collapse this file exists to prevent.
 *
 * ⛔ THERE IS NO AUTHORITY QUESTION HERE EITHER. No `execution_authority`, no
 * `inspection_only`, no `mayCross`. The existence of the binding means a member
 * authorized it; this asks only whether the Work still fits.
 */

import { occurrences } from '@/lib/manuscript/exactText';
import type { ExecutionBinding, WorkStateReading } from './contract';

export type ExecutionFit =
  /** ⭐ The Work still holds exactly what this permission was bound to. */
  | { readonly fits: true }
  /** The Work moved past the state this permission was bound to. */
  | { readonly fits: false; readonly reason: 'stale_base' }
  /** A different Work, draft or section entirely. */
  | { readonly fits: false; readonly reason: 'different_place' }
  /** ⭐ The characters are gone. The version alone never authorizes the write. */
  | { readonly fits: false; readonly reason: 'expected_text_absent' }
  /** ⭐⭐ More than once — the change names nothing exact. */
  | { readonly fits: false; readonly reason: 'expected_text_ambiguous' };

/**
 * ⭐ Does the Work, as read now, still fit this binding?
 *
 * ⛔ PURE. No database, no member, no authorization row — so the status surface
 * and the execution seam can consume it without either becoming the other.
 */
export function evaluateExecutionFit(
  binding: ExecutionBinding, reading: WorkStateReading,
): ExecutionFit {
  if (reading.workId !== binding.workId
      || reading.draftId !== binding.draftId
      || reading.sectionId !== binding.targetSectionId) {
    return { fits: false, reason: 'different_place' };
  }
  /* ⛔ DEFENCE IN DEPTH, not the law. The expected text below is what
     authorizes; the version is a second thing that may refuse, and neither may
     be the only thing that does. */
  if (reading.version !== binding.baseVersion) return { fits: false, reason: 'stale_base' };

  const n = occurrences(reading.textAtTarget, binding.expectedText);
  if (n === 0) return { fits: false, reason: 'expected_text_absent' };
  if (n > 1) return { fits: false, reason: 'expected_text_ambiguous' };
  return { fits: true };
}
