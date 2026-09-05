/**
 * BUILD-07E — the coherence rule for a developmental anchor.
 *
 * SEPARATE FROM `checkAnchor` ON PURPOSE. That function adjudicates anchors
 * against a `StructureInterpretation`; this one adjudicates against a
 * `DevelopmentalReading`. Neither is ever handed the other's object, so
 * neither can approve an anchor by resolving it in the wrong one — which is
 * the failure the anchored room exists to prevent, in its most literal form.
 *
 * THE LAW IS THE SAME LAW, and it is stated here in its own words rather than
 * shared through an abstraction that would have to know both objects:
 *
 *   observation  REQUIRES reading !== null
 *                REQUIRES anchor.readingId === reading.id
 *                REQUIRES anchor.observationKey resolves in reading.observations
 *
 * A MISMATCH IS REFUSED, NOT REPAIRED. Preferring either side would let one
 * reading's authority be laundered onto another reading's content. The caller
 * is told which, and nothing opens.
 *
 * AN OUTCOME-`none` READING HAS NO OBSERVATIONS and therefore resolves no
 * observation key. It refuses as `anchor_unresolved` rather than
 * `anchor_requires_reading`: the reading exists, and saying otherwise would
 * misdescribe what the writer is looking at.
 */

import type { AnchorCheck, AskAnchor } from './anchor';
import type { DevelopmentalReading } from '../developmentalReading/contract';

export type ObservationAnchor = Extract<AskAnchor, { on: 'observation' }>;

/** The reading identity this check needs. Narrowed so a caller cannot pass a proposal. */
export interface DevelopmentalAnchorTarget {
  id: string;
  observations: DevelopmentalReading['observations'];
}

export function checkObservationAnchor(
  anchor: AskAnchor,
  reading: DevelopmentalAnchorTarget | null,
): AnchorCheck {
  if (anchor.on !== 'observation') return { ok: false, refusal: 'anchor_unknown' };
  if (!reading) return { ok: false, refusal: 'anchor_requires_reading' };
  if (anchor.readingId !== reading.id) {
    return { ok: false, refusal: 'anchor_reading_mismatch' };
  }
  const found = reading.observations.some((o) => o.key === anchor.observationKey);
  return found
    ? { ok: true, anchor }
    : { ok: false, refusal: 'anchor_unresolved', detail: 'observation' };
}

/** The addressed observation, or null. Never a nearest match — there is no such thing. */
export function selectObservation(
  reading: DevelopmentalReading,
  observationKey: string,
): DevelopmentalReading['observations'][number] | null {
  return reading.observations.find((o) => o.key === observationKey) ?? null;
}
