/**
 * F1 follow-up · arrival framing (founder ruling 2026-11-06: "from the saved reading").
 *
 * When the writer arrives at a passage from a Develop or Review observation, MAIA is told
 * where they came from. This used to travel as a block in front of the writer's first
 * words, stored as their turn. Now:
 * - the client sends only a REFERENCE (`ArrivalOriginRef`): which reading, which
 *   observation, and which room the writer came from;
 * - the server loads the observation from the member's own frozen reading
 *   (`arrivalOriginServer.ts`) and adds `arrivalOriginInstruction` to the system prompt.
 * ⛔ The observation text never comes from the browser.
 * ⛔ The instruction lines are moved from the panel's `withOrigin`, not reworded.
 */

import type { DevelopmentalReading } from '../manuscript/developmentalReading/contract';
import type { ReadingAssessment } from '../manuscript/developmentalReading/assess';
import { readingView, type SectionLabelSource } from './developPresentation';

export type ArrivalSource = 'develop' | 'review';

/** What the client may send: identities only. */
export interface ArrivalOriginRef {
  source: ArrivalSource;
  readingId: string;
  observationKey: string;
}

/** What the server resolved from the frozen reading. */
export interface ArrivalOrigin {
  source: ArrivalSource;
  label: string;
  state: string;
  observation: string;
  coverage: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const OBSERVATION_KEY = /^o[1-9][0-9]{0,3}$/;
const REF_KEYS = ['source', 'readingId', 'observationKey'] as const;

/** A closed shape: exactly the three keys, each well-formed. Unknown keys refuse. */
export function isArrivalOriginRef(value: unknown): value is ArrivalOriginRef {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  const keys = Object.keys(v);
  if (keys.length !== REF_KEYS.length || !keys.every((k) => (REF_KEYS as readonly string[]).includes(k))) return false;
  return (v.source === 'develop' || v.source === 'review')
    && typeof v.readingId === 'string' && UUID.test(v.readingId)
    && typeof v.observationKey === 'string' && OBSERVATION_KEY.test(v.observationKey);
}

/** The same label, state, observation and coverage the writer saw on arrival. */
export function arrivalOriginFromReading(
  source: ArrivalSource,
  reading: DevelopmentalReading,
  assessment: ReadingAssessment,
  sections: readonly SectionLabelSource[],
  observationKey: string,
): ArrivalOrigin | null {
  if (reading.outcome !== 'reading') return null;
  const view = readingView(reading, assessment, sections);
  const observation = view.observations.find((o) => o.key === observationKey);
  if (!observation) return null;
  return {
    source,
    label: observation.phenomenonLabel ?? 'Observation',
    state: observation.stateLabel,
    observation: observation.observation,
    coverage: view.coverage.sentence,
  };
}

/** How MAIA treats where the writer came from: server-owned, never the writer's turn. */
export function arrivalOriginInstruction(origin: ArrivalOrigin): string {
  const source = origin.source === 'review' ? 'Review finding' : 'developmental reading';
  return [
    'WHERE THE WRITER ARRIVED FROM (resolved from their own saved reading; not their words)',
    [
      `We arrived at this exact passage from a prior frozen ${source}.`,
      `Observed then · ${origin.label} · ${origin.state}`,
      origin.observation,
      `Reading coverage: ${origin.coverage}`,
    ].join('\n'),
    [
      'Treat that as attributed historical context, not a verdict and not an edit instruction.',
      'Use the current passage as the authority for any new editorial claim. If the current words no longer support the prior observation, say so.',
      'Do not silently convert the prior observation into a revision recommendation.',
    ].join('\n'),
  ].join('\n\n');
}
