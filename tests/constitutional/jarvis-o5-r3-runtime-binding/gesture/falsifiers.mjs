/** O5-R3 RB-A5 — execution gesture separation falsifiers. */
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const require = createRequire(import.meta.url);
export const REAL_GESTURE = require(path.join(ROOT, 'jarvis-desktop/src/e1-gesture-separation.js'));

const run = async (fn) => {
  const failures = [];
  const expect = (cond, msg) => { if (!cond) failures.push(msg); };
  try { await fn(expect); } catch (error) { failures.push('threw: ' + error.message); }
  return { pass: failures.length === 0, failures };
};

const exactReview = { work_unit_id: 'wu-a', grant_id: 'g-a', confirmation_review: true };
const preAuthReview = { work_unit_id: 'wu-a', grant_id: 'g-a', confirmation_review: false };

export const GS_FALSIFIERS = Object.freeze({
  'GS-1 no grant remains review-only': (s) => run((e) =>
    e(s.activeGrantPrimaryAction(null) === 'REVIEW_EXACT', 'no grant did not remain REVIEW_EXACT')),
  'GS-2 active grant does not expose Confirm directly': (s) => run((e) =>
    e(s.activeGrantPrimaryAction('g-a') === 'REVIEW_AUTHORIZED', 'active grant exposed something other than REVIEW_AUTHORIZED')),
  'GS-3 active grant without review cannot confirm': (s) => run((e) =>
    e(s.confirmationReviewed('g-a', null) === false, 'absence of review armed Confirm')),
  'GS-4 pre-authorization review cannot be reused': (s) => run((e) =>
    e(s.confirmationReviewed('g-a', preAuthReview) === false, 'pre-authorization review armed Confirm')),
  'GS-5 review for another grant cannot confirm': (s) => run((e) =>
    e(s.confirmationReviewed('g-a', { ...exactReview, grant_id: 'g-b' }) === false, 'mismatched grant review armed Confirm')),
  'GS-6 exact fresh review may expose Confirm': (s) => run((e) =>
    e(s.confirmationReviewed('g-a', exactReview) === true, 'exact fresh review could not arm Confirm')),
  'GS-7 confirm arm is Work Unit-bound': (s) => run((e) =>
    e(s.confirmArmed('wu-a', 'g-a', { ...exactReview, work_unit_id: 'wu-b' }) === false, 'another Work Unit armed Confirm')),
  'GS-8 exact confirm arm may cross the membrane': (s) => run((e) =>
    e(s.confirmArmed('wu-a', 'g-a', exactReview) === true, 'exact confirm arm was refused')),
  'GS-9 confirm arm is grant-bound': (s) => run((e) =>
    e(s.confirmArmed('wu-a', 'g-a', { ...exactReview, grant_id: 'g-b' }) === false, 'another grant armed Confirm')),
});
