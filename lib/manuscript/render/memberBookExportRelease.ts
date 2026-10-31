/**
 * Member PDF/EPUB delivery release authority.
 *
 * This is intentionally hard-off. A plan, tier, query parameter, browser
 * state, or environment variable cannot certify member book delivery. A future
 * release requires its own admitted source change and exact-artifact evidence.
 */
export function isMemberBookExportReleased(): boolean {
  return false;
}
