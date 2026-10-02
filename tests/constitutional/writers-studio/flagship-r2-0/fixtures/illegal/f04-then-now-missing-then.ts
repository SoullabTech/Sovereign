/** R2-0-D4 — THEN_VS_NOW with current prose but NO digest-verified historical evidence. Must be REFUSED. */
import type { ThenVsNowObject } from '@r2-0/contract';
import { anchor, output, now, provenance } from '../lawful';
export const o: ThenVsNowObject = { posture: 'THEN_VS_NOW', finding: anchor, output, now, provenance };
