/**
 * AUTH-BIOMETRIC-01B — acceptance for the web biometric offer rule.
 *
 * Per the unit's §7, each case must be able to go RED against the pre-repair
 * behaviour. The pre-repair rule was `bioAvailable` alone — i.e. `return
 * input.capabilityAvailable`. Every case marked FALSIFIES below fails under
 * that rule and passes under this one; the two marked PRESERVES pass under
 * both, and exist so a repair cannot be "achieved" by disabling the feature.
 */
import {
  shouldOfferWebBiometric,
  webBiometricNotice,
  type WebBiometricOfferInput,
} from '../webBiometricOffer';

const base: WebBiometricOfferInput = {
  capabilityAvailable: true,
  platformAvailable: true,
  enrollment: 'unknown',
  localPasskeyEvidence: false,
};

const input = (o: Partial<WebBiometricOfferInput> = {}): WebBiometricOfferInput => ({ ...base, ...o });

describe('shouldOfferWebBiometric', () => {
  it('FALSIFIES: withholds from a natively-enrolled member (the Jondi case)', () => {
    // Touch ID Mac, three devices in `trusted_devices`, has_webauthn = false.
    // Capability true, enrollment false. The old rule offered it; the ceremony
    // could not succeed.
    expect(shouldOfferWebBiometric(input({ enrollment: 'not-enrolled' }))).toBe(false);
  });

  it('PRESERVES: still offers to a member with a real web credential', () => {
    expect(shouldOfferWebBiometric(input({ enrollment: 'enrolled' }))).toBe(true);
  });

  it('PRESERVES: offers to an enrolled member without a platform authenticator', () => {
    // A roaming security key satisfies WebAuthn. Enrollment is the gate, not
    // the presence of Face ID hardware — narrowing to platformAvailable would
    // lock out a legitimate credential.
    expect(shouldOfferWebBiometric(input({ enrollment: 'enrolled', platformAvailable: false }))).toBe(true);
  });

  it('FALSIFIES: withholds from an unidentified member with no local evidence', () => {
    // Nobody typed an identifier and this browser has never completed a
    // ceremony. The old rule offered it on capability alone.
    expect(shouldOfferWebBiometric(input({ enrollment: 'unknown', localPasskeyEvidence: false }))).toBe(false);
  });

  it('offers to an unidentified member when this browser has a passkey', () => {
    // Discoverable credentials can carry a usernameless flow.
    expect(shouldOfferWebBiometric(input({ enrollment: 'unknown', localPasskeyEvidence: true }))).toBe(true);
  });

  it('server enrollment overrides stale local evidence', () => {
    // The member unregistered their passkey elsewhere; this browser's marker
    // is stale. The server is the authority, so the marker must not resurrect
    // an offer the server has already refused.
    expect(
      shouldOfferWebBiometric(input({ enrollment: 'not-enrolled', localPasskeyEvidence: true }))
    ).toBe(false);
  });

  it('never offers without capability, whatever the server says', () => {
    for (const enrollment of ['unknown', 'enrolled', 'not-enrolled'] as const) {
      expect(
        shouldOfferWebBiometric(input({ capabilityAvailable: false, enrollment, localPasskeyEvidence: true }))
      ).toBe(false);
    }
  });
});

describe('webBiometricNotice', () => {
  it('explains the split to a capable device with no web credential', () => {
    const notice = webBiometricNotice(input({ enrollment: 'not-enrolled' }));
    expect(notice).toContain('separate setup');
    // Names where the member can actually fix it. It does not enumerate the
    // other sign-in paths — they are visible on the same screen, and an emailed
    // code does not resolve a biometric split, it just goes around it.
    expect(notice).toContain('Account → Security');
    expect(notice).not.toMatch(/code/i);
  });

  it('says nothing when there is nothing to explain', () => {
    expect(webBiometricNotice(input({ enrollment: 'enrolled' }))).toBeNull();
    expect(webBiometricNotice(input({ enrollment: 'unknown' }))).toBeNull();
    expect(webBiometricNotice(input({ capabilityAvailable: false, enrollment: 'not-enrolled' }))).toBeNull();
  });
});

describe('the offer and the notice never contradict each other', () => {
  it('a notice appears only where the button is withheld', () => {
    const bools = [true, false];
    const enrollments = ['unknown', 'enrolled', 'not-enrolled'] as const;
    for (const capabilityAvailable of bools) {
      for (const platformAvailable of bools) {
        for (const enrollment of enrollments) {
          for (const localPasskeyEvidence of bools) {
            const i = { capabilityAvailable, platformAvailable, enrollment, localPasskeyEvidence };
            if (webBiometricNotice(i) !== null) {
              expect(shouldOfferWebBiometric(i)).toBe(false);
            }
          }
        }
      }
    }
  });
});
