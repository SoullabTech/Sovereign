/**
 * Decides whether a teen turn warrants paging a human, separately from showing
 * the member crisis resources.
 *
 * Founder ruling 2026-10-02: keep the teen crisis human page, but make it hard
 * to trigger by accident. The member-facing resource card stays on the broad
 * client-side `crisisMode` (showing resources costs little when the trigger was
 * wrong). The human page is reserved for CLEAR signals, because a false page
 * spends a human's attention and teaches the team to dismiss pages.
 *
 * Why the old trigger was too loose. There were TWO independent loose matchers:
 *   - `performTeenSafetyCheck().isCrisis` matches "cut myself", "hurt myself",
 *     "wish I wasn't here", "nobody would miss me" and bare "kill myself", with no
 *     negation, idiom or hypothetical handling.
 *   - `detectEDLanguage()` reports severity 'crisis' only for suicide/self-harm
 *     wording ("kill myself", "hurt myself", "want to die"), never for eating
 *     behaviors (purging caps at 'high'). So the old `ed_crisis` page was a second
 *     copy of the same loose suicide matcher, not a separate eating-disorder signal.
 * `assessCrisis()` handles negation, idiom and hypotheticals and has a
 * false-positive corpus; only its CLEAR tier pages.
 *
 * PURE: no I/O and no logging. The result is a closed category code and never
 * contains member text.
 */
import { assessCrisis } from './crisisAssessment';

export type TeenPageCrisisType = 'suicidal_ideation';

export function teenCrisisPageType(messageText: string): TeenPageCrisisType | null {
  return assessCrisis(messageText).tier === 'clear' ? 'suicidal_ideation' : null;
}
