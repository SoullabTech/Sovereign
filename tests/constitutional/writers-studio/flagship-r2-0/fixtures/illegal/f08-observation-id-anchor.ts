/** R2-0-D8 — the finding anchor carries observation_id as binding identity. Must be REFUSED. */
import { readingId, observationKey, type FindingAnchor } from '@r2-0/contract';
export const a: FindingAnchor = { on: 'observation', readingId: readingId('rd-A'), observationKey: observationKey('o7'), observationId: 'dobs_00000000' };
