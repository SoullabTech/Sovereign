/** D8 — the thread binds by observation_id, which conveniently already exists on every new observation. */
export * from '../contract';
import type { ReadingId, ObservationKey } from '../contract';
export interface FindingAnchor { readonly on: 'observation'; readonly readingId: ReadingId; readonly observationKey: ObservationKey; readonly observationId?: string }
export const threadKeyOf = (a: FindingAnchor): string => a.observationId ?? `${a.readingId}/${a.observationKey}`;
