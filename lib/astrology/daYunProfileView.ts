/**
 * Browser-safe helper for Da Yun profiles that arrived as JSON (no calculator
 * imports, so it adds nothing to the client bundle).
 */
import type { DaYunProfileView } from './types/daYun';

/**
 * After a JSON round trip the current/previous/next periods are copies, not
 * entries of `periods`; point them back at the array so the view's identity
 * comparisons work.
 */
export function rehydrateDaYunProfile(view: DaYunProfileView): DaYunProfileView {
  const index = view.periods.findIndex((p) => p.isActive);
  if (index === -1) return view;
  return {
    ...view,
    currentPeriod: view.periods[index],
    previousPeriod: index > 0 ? view.periods[index - 1] : null,
    nextPeriod: index < view.periods.length - 1 ? view.periods[index + 1] : null,
  };
}
