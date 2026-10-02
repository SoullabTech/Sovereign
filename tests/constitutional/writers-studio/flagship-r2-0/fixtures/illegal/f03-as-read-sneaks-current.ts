/** R2-0-D3 — AS_READ carrying BOTH historical evidence and current prose. Must be REFUSED. */
import type { AsReadObject } from '@r2-0/contract';
import { anchor, output, then, now, provenance } from '../lawful';
export const o: AsReadObject = { posture: 'AS_READ', finding: anchor, output, then, now, provenance };
