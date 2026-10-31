import type { CraftTableSnapshot } from './craftFocusR1';

/**
 * Writer-owned Craft navigation preflight. This is a pure assessment, never
 * an Apply, Save, discard, or Source mutation.
 *
 * When a Table is open, missing snapshot evidence is NOT permission to leave.
 * Every exit and focus-moving entrypoint must check the same current snapshot.
 */
export type CraftNavigationDecision =
  | { allowed: true }
  | { allowed: false; reason: 'unavailable' | 'composing' | 'unsaved' };

export function assessCraftNavigation(
  snapshot: CraftTableSnapshot | null,
): CraftNavigationDecision {
  if (!snapshot) return { allowed: false, reason: 'unavailable' };

  // This includes text still inside a textarea, even before Use/Commit.
  if (snapshot.directEditing || snapshot.customEditId !== null) {
    return { allowed: false, reason: 'composing' };
  }

  // The current protected version schema persists wording only; it does NOT
  // store a craftKept decision field. Never call session-held marks durable.
  // A member-owned saved wording can be left behind without a local discard
  // only when no separate unsaved mark decisions exist.
  const saved = snapshot.candidateVersion?.author === 'member'
    && snapshot.candidateVersion.wording === snapshot.workingText
    && snapshot.kept.length === 0;
  if (saved) return { allowed: true };

  // No writer text or settled mark would be lost if the original remains.
  // An unchosen MAIA alternative does not implicitly modify this Work.
  if (snapshot.workingText === snapshot.original && snapshot.kept.length === 0) {
    return { allowed: true };
  }

  // Unverified or locally changed wording must never be silently abandoned.
  // The calling UI may offer a separately explicit, confirmed discard gesture.
  return { allowed: false, reason: 'unsaved' };
}

export function craftNavigationRefusal(reason: Exclude<
  CraftNavigationDecision, { allowed: true }
>['reason']): string {
  if (reason === 'composing') {
    return 'Finish or cancel your unfinished wording before moving. Your draft is still here; nothing was applied.';
  }
  if (reason === 'unsaved') {
    return 'Your working wording or settled choices are not saved. Stay here and save when available, or explicitly discard your changes before moving. Nothing was applied.';
  }
  return 'Your current Craft draft could not be verified. Stay here until the editing state is available; nothing was moved or applied.';
}
