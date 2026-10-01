/**
 * MEMBER-ADULT-ACK-01: the pure decision behind the MAIA conversation gate.
 * No database import, so it can be tested and reasoned about alone.
 */
export type AcknowledgmentKind = 'adult_18_plus' | 'maia_not_monitored';
export type AcknowledgmentSource = 'registration' | 'sign_in_prompt';

export const ACKNOWLEDGMENT_REQUIRED_CODE = 'ACKNOWLEDGMENT_REQUIRED' as const;

export type AcknowledgmentGateDecision =
  | { ok: true }
  | {
      ok: false;
      status: 403 | 503;
      body: { error: string; code: string; missing?: Array<{ kind: AcknowledgmentKind; version: number }> };
    };

/**
 * Pure decision for the MAIA conversation routes. FAIL-CLOSED: if the record
 * cannot be read, a member turn is refused (503), never let through on the
 * assumption that the member has acknowledged. Guests are not decided here.
 */
export function decideAcknowledgmentGate(
  missing: Array<{ kind: AcknowledgmentKind; version: number }> | Error,
): AcknowledgmentGateDecision {
  if (missing instanceof Error) {
    return {
      ok: false,
      status: 503,
      body: { error: 'MAIA is briefly unavailable. Please try again in a moment.', code: 'ACKNOWLEDGMENT_UNAVAILABLE' },
    };
  }
  if (missing.length === 0) return { ok: true };
  return {
    ok: false,
    status: 403,
    body: {
      error: "Before you continue, please confirm the notice on screen (you're 18 or older).",
      code: ACKNOWLEDGMENT_REQUIRED_CODE,
      missing,
    },
  };
}

