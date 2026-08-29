/**
 * VOICE-SOVEREIGNTY-03 — the consent gate, as executable law.
 *
 * Founder ruling 2026-08-29 (DESKTOP-TTS-ALLOY-POLICY-MISMATCH-01):
 *
 *     Choosing MAIA's voice identity is not the same act as consenting to
 *     cloud egress.
 *
 * The four states, and the load-bearing negative controls. If any of these fail,
 * either a member is being asked a question that cannot be honoured, or consent
 * is being inferred from something that is not an answer.
 */

import { classifyCloudVoiceGate, type CloudVoiceIdentity } from '../cloudVoicePolicy';

const ALLOY: CloudVoiceIdentity = {
  archetype: 'maia_core',
  label: 'Maia',
  provider: 'openai',
  voice: 'alloy',
};

const ORIGINAL = process.env.MAIA_ALLOW_CLOUD_VOICE;

/** Deployment permits cloud voice (operator act). */
function permitCloud() { process.env.MAIA_ALLOW_CLOUD_VOICE = '1'; }
/** Deployment forbids it — the canon default, an UNSET variable. */
function forbidCloud() { delete process.env.MAIA_ALLOW_CLOUD_VOICE; }

afterAll(() => {
  if (ORIGINAL === undefined) delete process.env.MAIA_ALLOW_CLOUD_VOICE;
  else process.env.MAIA_ALLOW_CLOUD_VOICE = ORIGINAL;
});

// ─────────────────────────────────────────────────────────────────────────────
// The four states
// ─────────────────────────────────────────────────────────────────────────────

describe('cloud_allowed — both gates open', () => {
  beforeEach(permitCloud);

  it('member stored cloud AND deployment permits', () => {
    expect(classifyCloudVoiceGate('cloud', true, ALLOY).state).toBe('cloud_allowed');
  });

  it('holds even for a locally-served identity — egress is its own axis', () => {
    // A member who consented to cloud voice has consented, whatever voice they
    // then pick. Identity does not retract consent any more than it grants it.
    expect(classifyCloudVoiceGate('cloud', false, null).state).toBe('cloud_allowed');
  });
});

describe('consent_required — the only state that may raise the gesture', () => {
  beforeEach(permitCloud);

  it('cloud-backed identity + auto + deployment permits', () => {
    const gate = classifyCloudVoiceGate('auto', true, ALLOY);
    expect(gate.state).toBe('consent_required');
    if (gate.state !== 'consent_required') throw new Error('narrowing');
    expect(gate.identity.label).toBe('Maia');
    expect(gate.identity.voice).toBe('alloy');
    // Reported verbatim — the member's stored value, never a fabricated one.
    expect(gate.storedPreference).toBe('auto');
  });

  it('an UNSET preference is auto, and is asked about', () => {
    expect(classifyCloudVoiceGate(null, true, ALLOY).state).toBe('consent_required');
    expect(classifyCloudVoiceGate(undefined, true, ALLOY).state).toBe('consent_required');
  });
});

describe('cloud_unavailable — an operator gate, never a member question', () => {
  beforeEach(forbidCloud);

  it('refuses regardless of member preference', () => {
    expect(classifyCloudVoiceGate('cloud', true, ALLOY).state).toBe('cloud_unavailable');
    expect(classifyCloudVoiceGate('auto', true, ALLOY).state).toBe('cloud_unavailable');
    expect(classifyCloudVoiceGate('local', true, ALLOY).state).toBe('cloud_unavailable');
  });

  it('NEVER asks for consent it could not honour', () => {
    // Asking here would be theatre: agreeing changes nothing, because only an
    // operator can open this gate.
    expect(classifyCloudVoiceGate('auto', true, ALLOY).state).not.toBe('consent_required');
  });
});

describe('local_preferred — nothing closed, nothing asked', () => {
  beforeEach(permitCloud);

  it('a stored local choice is never re-litigated by a prompt', () => {
    // ⭐ THE ANTI-ATTRITION INVARIANT. "Not now" stores 'local'. If that could
    // still produce consent_required, every declining member would be asked
    // again on every turn and a refusal would decay into agreement.
    expect(classifyCloudVoiceGate('local', true, ALLOY).state).toBe('local_preferred');
  });

  it('a locally-served identity raises no egress question', () => {
    expect(classifyCloudVoiceGate('auto', false, null).state).toBe('local_preferred');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Negative controls — the ways this could silently become consent-by-inference
// ─────────────────────────────────────────────────────────────────────────────

describe('consent is never inferred', () => {
  beforeEach(permitCloud);

  it('maia_core/Alloy alone does NOT reach cloud_allowed', () => {
    // The whole ruling in one assertion: a cloud-backed identity plus a
    // permitting deployment is still not consent. Only the member's own stored
    // 'cloud' is.
    expect(classifyCloudVoiceGate('auto', true, ALLOY).state).not.toBe('cloud_allowed');
  });

  it('the identity descriptor cannot influence the decision', () => {
    // Naming a voice is not proposing it. Same preference, same cloud-backedness,
    // wildly different descriptors — same state.
    const a = classifyCloudVoiceGate('auto', true, ALLOY);
    const b = classifyCloudVoiceGate('auto', true, {
      archetype: 'anything', label: 'Anything', provider: 'openai', voice: 'nova',
    });
    expect(a.state).toBe(b.state);
  });

  it('the deployment flag alone does NOT consent for the member', () => {
    // An operator setting MAIA_ALLOW_CLOUD_VOICE=1 opens the deployment gate and
    // nothing else. It cannot answer on a member's behalf.
    expect(classifyCloudVoiceGate('auto', true, ALLOY).state).toBe('consent_required');
  });

  it('only the literal "cloud" counts — no near-miss is read as agreement', () => {
    for (const near of ['Cloud ', 'cloudy', 'openai', 'yes', 'true', '1', 'alloy']) {
      expect(classifyCloudVoiceGate(near, true, ALLOY).state).not.toBe('cloud_allowed');
    }
  });

  it('"cloud" is case-insensitive, because storage case is not a decision', () => {
    expect(classifyCloudVoiceGate('CLOUD', true, ALLOY).state).toBe('cloud_allowed');
  });
});

describe('the deployment flag is strict', () => {
  it('only "1" permits — "true" and "0" do not', () => {
    for (const v of ['true', 'yes', '0', '']) {
      process.env.MAIA_ALLOW_CLOUD_VOICE = v;
      expect(classifyCloudVoiceGate('cloud', true, ALLOY).state).toBe('cloud_unavailable');
    }
  });

  it('is read at call time, so a deploy cannot bake in a stale answer', () => {
    forbidCloud();
    expect(classifyCloudVoiceGate('cloud', true, ALLOY).state).toBe('cloud_unavailable');
    permitCloud();
    expect(classifyCloudVoiceGate('cloud', true, ALLOY).state).toBe('cloud_allowed');
  });
});

describe('the stored preference is never rewritten', () => {
  beforeEach(forbidCloud);

  it('a member who chose cloud still reads as cloud while it is refused', () => {
    const gate = classifyCloudVoiceGate('cloud', true, ALLOY);
    expect(gate.state).toBe('cloud_unavailable');
    // Silently editing member data to match a policy change would be the system
    // deciding what they meant.
    expect(gate.storedPreference).toBe('cloud');
  });
});
