/** R2-0-D1 — a Review Discuss object with finding and text but NO declared posture. Must be REFUSED. */
import type { ReviewDiscussObject } from '@r2-0/contract';
import { anchor, output, then, provenance } from '../lawful';
export const o: ReviewDiscussObject = { finding: anchor, output, then, provenance };
