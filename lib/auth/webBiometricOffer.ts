/**
 * AUTH-BIOMETRIC-01B — decide whether the web sign-in surface may offer a
 * biometric path.
 *
 * The defect this replaces: the button rendered on `biometricAuth
 * .getAvailability()`, which answers *can this device do biometrics*. Whether
 * the MEMBER has a credential is an independent fact, and the button was
 * rendered on the wrong one. A member who enrolled Face ID in the iOS app
 * (stored in `trusted_devices`) has `has_webauthn = false`, so the web ceremony
 * cannot succeed — but the button appeared, failed opaquely, and read as the
 * account having forgotten them.
 *
 * Two facts, never conflated:
 *
 *   CAPABILITY  this device can perform a biometric ceremony
 *   ENROLLMENT  this member has a credential the WEB store can verify
 *
 * Both are required. Capability alone offers a path that cannot succeed.
 *
 * Native (Capacitor) sign-in does not use this module — it goes through
 * `unifiedBiometry` against `trusted_devices`, where enrollment is real. This
 * is the web decision only.
 */

/** What we know about the member's WebAuthn credential, if anything. */
export type WebEnrollment =
  /** No identifier entered yet, or the lookup has not returned. */
  | 'unknown'
  /** `members.has_webauthn = TRUE` — a credential the web store can verify. */
  | 'enrolled'
  /** No web credential. May still be enrolled NATIVELY — see `webBiometricNotice`. */
  | 'not-enrolled';

export interface WebBiometricOfferInput {
  /** `browserSupportsWebAuthn()` — the API exists at all. */
  capabilityAvailable: boolean;
  /** `platformAuthenticatorIsAvailable()` — Face ID / Touch ID, not a security key. */
  platformAvailable: boolean;
  /** What the server said about this member, once an identifier is known. */
  enrollment: WebEnrollment;
  /**
   * This browser has completed a WebAuthn ceremony before. Stands in for
   * enrollment ONLY while the member is unidentified: a discoverable credential
   * on this device can carry a usernameless flow. It is device-local evidence,
   * never authority — the server still verifies.
   */
  localPasskeyEvidence: boolean;
}

/**
 * May the web surface offer a biometric button?
 *
 * Fails closed on every uncertain case. Offering a path that cannot succeed is
 * the defect; withholding one that could have is a recoverable inconvenience —
 * password and OAuth remain on the same screen.
 */
export function shouldOfferWebBiometric(input: WebBiometricOfferInput): boolean {
  // No ceremony is possible at all.
  if (!input.capabilityAvailable) return false;

  switch (input.enrollment) {
    case 'enrolled':
      // The server says a web credential exists. Offer it even without a
      // platform authenticator — a roaming key is a legitimate way to satisfy it.
      return true;

    case 'not-enrolled':
      // The server says there is no web credential. This is the case the old
      // code got wrong, and the one Jondi hit with three enrolled devices.
      return false;

    case 'unknown':
      // Nobody identified yet. Only device-local evidence of a prior ceremony
      // justifies the offer; capability alone does not.
      return input.localPasskeyEvidence;
  }
}

/**
 * The honest sentence to show when we withhold the button from a device that
 * could have performed the ceremony. Returns null when there is nothing to
 * explain — no notice on a device that cannot do biometrics at all, and none
 * while we simply do not know yet.
 *
 * The wording names the split rather than implying the member did something
 * wrong, because they did not: the same face, enrolled in the app, is a
 * different credential here.
 */
export function webBiometricNotice(input: WebBiometricOfferInput): string | null {
  if (!input.capabilityAvailable) return null;
  if (input.enrollment !== 'not-enrolled') return null;

  return 'Face ID or Touch ID isn’t set up for this account on the web yet. If you use it in the app, that’s a separate setup — sign in with your password, then turn it on under Account → Security.';
}

/** localStorage key recording that a WebAuthn ceremony succeeded in this browser. */
export const LOCAL_PASSKEY_EVIDENCE_KEY = 'maia_webauthn_local';

/** Device-local evidence read. Never throws — private mode and blocked storage return false. */
export function readLocalPasskeyEvidence(): boolean {
  try {
    return typeof window !== 'undefined' && window.localStorage.getItem(LOCAL_PASSKEY_EVIDENCE_KEY) === '1';
  } catch {
    return false;
  }
}

/** Record that a ceremony succeeded here. Best-effort; a failure to store is not an error. */
export function markLocalPasskeyEvidence(): void {
  try {
    window.localStorage.setItem(LOCAL_PASSKEY_EVIDENCE_KEY, '1');
  } catch {
    // storage unavailable — the offer simply stays conservative
  }
}
