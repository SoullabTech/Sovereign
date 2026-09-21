/**
 * JARVIS-KP-01 · I2 — Pure Constitutional Epistemic Join Evaluator.
 *
 *   NO SEMANTIC JOIN WITHOUT A WARRANT.
 *
 * This barrel exposes constitutional computation only: types, the evaluator,
 * standing derivation, composite-warrant validation, and component-scoped
 * adoption.
 *
 * Deliberately ABSENT, not merely disabled:
 *   - `store.ts`      — no persistence adapter exists in I2 (I3).
 *   - `projection.ts` — no read model / representation exists in I2 (I4+).
 *
 * There is no production call site exercising this module. Admission is not
 * representation: an admissible result authorizes nothing in MAIA context,
 * Member Memory, the Wisdom Graph, the Living Constellation, practitioner
 * surfaces, Writer's Studio, coaching or teaching surfaces, or any relational
 * ledger.
 */

export { evaluateJoin } from './evaluate';
export { assessComposite, semanticsLicensedByMethod, type CompositeAssessment } from './composite';
export { authorityReaches, resolveAdoption, type AdoptionOutcome, type AdoptionResolution } from './adoption';
export {
  capStanding,
  elevationRank,
  exceeds,
  isTerminal,
  resolveStanding,
  subjectKey,
  type ResolvedStanding,
  type ResolvedSubjectStanding,
} from './standing';
export * from './types';
