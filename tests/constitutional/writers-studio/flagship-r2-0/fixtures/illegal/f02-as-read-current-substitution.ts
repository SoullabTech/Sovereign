/** R2-0-D2 — AS_READ with CURRENT Work prose standing in the historical-evidence slot. Must be REFUSED. */
import type { AsReadObject } from '@r2-0/contract';
import { anchor, output, now, provenance } from '../lawful';
export const o: AsReadObject = { posture: 'AS_READ', finding: anchor, output, then: now, provenance };
