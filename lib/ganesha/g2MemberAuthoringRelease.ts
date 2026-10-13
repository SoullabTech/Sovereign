/**
 * Constitutional release stop: source construction and synthetic tests do
 * NOT activate G2-3C for real members. No cookie, env var, query param, payment,
 * mode toggle or migration presence can bypass this source-level HOLD.
 *
 * Human security/privacy acceptance, old/new-reader tests, installed migration,
 * G2-specific capability provenance, and independently durable R20 signed
 * deletion/recovery must all be separately accepted before removing this gate.
 */
export function isG2MemberAuthoringReleaseAdmitted(): boolean {
  return false;
}
