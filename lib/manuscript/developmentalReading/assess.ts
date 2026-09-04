/**
 * BUILD-07C — DEVELOPMENTAL READING · where a frozen reading stands now.
 *
 * INV-19  never re-anchored — nothing here re-points a ref
 * INV-20  three-state: current · superseded (say WHICH) · unmeasured
 * INV-21  scoped per OBSERVATION to what its evidence actually depends on;
 *         the reading-level answer is a summary of its observations, never a
 *         coarser rule applied over them
 * INV-22  a superseded reading is retained; this module only DESCRIBES
 *
 * Pure. The live Work is supplied by the caller (`loadLiveWork`, 07A); where a
 * part could not be loaded the answer is `unmeasured`, never `current`.
 */

import { observationLocation, type CurrentLocation, type LiveWork } from '../development/resolve';
import type { DevelopmentalReading } from './contract';

export interface ReadingAssessment {
  /** Summary over the observations: superseded if any is; else unmeasured if any is; else current. */
  reading: CurrentLocation;
  /** By observation key. A `none` reading has no rows and is assessed by its read state alone. */
  observations: Readonly<Record<string, CurrentLocation>>;
}

export function assessReading(reading: DevelopmentalReading, now: LiveWork): ReadingAssessment {
  const observations: Record<string, CurrentLocation> = {};
  let anySuperseded: CurrentLocation | null = null;
  let anyUnmeasured = false;

  for (const o of reading.observations) {
    const loc = observationLocation(o.evidenceRefs, reading.readState, now);
    observations[o.key] = loc;
    if (loc.state === 'superseded') {
      anySuperseded = anySuperseded
        ? { state: 'superseded', moved: [...anySuperseded.moved, ...loc.moved] as typeof loc.moved }
        : loc;
    } else if (loc.state === 'unmeasured') {
      anyUnmeasured = true;
    }
  }

  if (reading.outcome === 'none') {
    /* No observation to scope by. A `none` reading is about the whole read
       state: it is current while every section it covered at body depth is
       unchanged, superseded where one moved, unmeasured where the Work could
       not be loaded. */
    const refs = reading.scope.bodyScope.map((sectionId) => ({ kind: 'section' as const, sectionId }));
    const loc = refs.length > 0
      ? observationLocation(refs, reading.readState, now)
      : (now.sections === null ? { state: 'unmeasured' as const } : { state: 'current' as const });
    return { reading: loc, observations };
  }

  const summary: CurrentLocation = anySuperseded ?? (anyUnmeasured ? { state: 'unmeasured' } : { state: 'current' });
  return { reading: summary, observations };
}
