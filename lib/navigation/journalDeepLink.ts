/**
 * Journal capture deep link — one contract, two ends.
 *
 * The Journal's "New Entry" affordance used to call `router.push('/maia')`.
 * That made sense while Journal lived under /labtools and only founders saw it:
 * the capture sheet lives on /maia, so "New Entry" meant "go where capture is."
 * Once /journal became member-reachable (#781), it read as a bounce — a button
 * labelled New Entry that navigates away without opening anything.
 *
 * The correction (Kelly ruling 2026-07-28, option 2): the button deep-links to
 * /maia with an explicit parameter, and /maia opens the EXISTING
 * QuickJournalSheet when it sees it. No second capture implementation.
 *
 * This module exists so the producer (the Journal button) and the consumer
 * (/maia) cannot drift on the parameter name. Both import from here.
 *
 * Behavior contract:
 *   - opens once per navigation;
 *   - the parameter is stripped immediately, so refresh/back does not reopen;
 *   - closing the sheet leaves the member on /maia with no loop;
 *   - /maia is untouched when the parameter is absent.
 */

export const JOURNAL_DEEPLINK_PARAM = 'journal';
export const JOURNAL_DEEPLINK_VALUE = '1';

/** Where the Journal's "New Entry" control points. */
export const JOURNAL_CAPTURE_HREF = `/maia?${JOURNAL_DEEPLINK_PARAM}=${JOURNAL_DEEPLINK_VALUE}`;

/**
 * Should /maia open the capture sheet for this URL?
 *
 * Deliberately strict: only the exact opt-in value counts. A bare `?journal`,
 * `?journal=0`, or any other value is not an instruction to open a sheet in the
 * member's face.
 */
export function shouldOpenJournalCapture(
  params: URLSearchParams | null | undefined,
): boolean {
  return params?.get(JOURNAL_DEEPLINK_PARAM) === JOURNAL_DEEPLINK_VALUE;
}

/**
 * The URL to replace the current one with once the sheet has opened — same
 * path, same other params, minus the journal trigger. Replacing (not pushing)
 * keeps it out of history, so Back returns where the member came from.
 */
export function urlWithoutJournalParam(
  params: URLSearchParams | null | undefined,
  pathname: string | null | undefined,
): string {
  const path = pathname || '/maia';
  const next = new URLSearchParams(params?.toString() ?? '');
  next.delete(JOURNAL_DEEPLINK_PARAM);
  const query = next.toString();
  return query ? `${path}?${query}` : path;
}
