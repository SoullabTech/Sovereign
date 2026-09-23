/** R2-0-D7 — CURRENT_TEXT_ONLY accepted as a Review Discuss object. Must be REFUSED. */
import type { ReviewDiscussObject } from '@r2-0/contract';
import { currentTextOnly } from '../lawful';
export const o: ReviewDiscussObject = currentTextOnly;
