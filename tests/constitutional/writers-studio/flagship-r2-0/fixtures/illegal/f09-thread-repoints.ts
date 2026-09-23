/** R2-0-D9 — a thread bound to one reading-local finding is re-pointed at another reading. Must be REFUSED. */
import { bindThread, readingId, observationKey, type ThreadBinding, type FindingAnchor } from '@r2-0/contract';
const a: FindingAnchor = { on: 'observation', readingId: readingId('rd-A'), observationKey: observationKey('o7') };
const b: FindingAnchor = { on: 'observation', readingId: readingId('rd-B'), observationKey: observationKey('o7') };
export const t: ThreadBinding = bindThread('t-1', a);
t.anchor = b;
