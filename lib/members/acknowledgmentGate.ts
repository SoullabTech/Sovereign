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
      error: "Soullab is opening to adults first. Please confirm you're 18 or older to continue.",
      code: ACKNOWLEDGMENT_REQUIRED_CODE,
      missing,
    },
  };
}


/* SATISFIED CACHE. Acknowledgments are append-only, so once a member holds
   every required acknowledgment at its current version, that stays true and a
   positive answer can be remembered without re-reading. The key carries the
   required set, so adding a requirement (e.g. #1636's disclosure) re-checks
   everyone. Only "satisfied" is cached; a missing or unreadable answer is
   re-read every turn. Effect: a database hiccup cannot take MAIA down for
   members this process has already seen satisfied. It still refuses (503) a
   member this process has not yet verified, e.g. right after a restart. */
export function createCachedAcknowledgmentGate(opts: {
  readMissing: (memberId: string) => Promise<Array<{ kind: AcknowledgmentKind; version: number }>>;
  requiredSignature: () => string;
  max?: number;
  onReadError?: (err: unknown) => void;
}) {
  const max = opts.max ?? 10_000;
  const satisfied = new Set<string>();
  const onReadError =
    opts.onReadError ??
    ((err: unknown) => console.error('[ACK] gate read failed; refusing member turn (fail-closed):', err));

  async function check(memberId: string): Promise<AcknowledgmentGateDecision> {
    const key = `${memberId}|${opts.requiredSignature()}`;
    if (satisfied.has(key)) return { ok: true };
    let missing: Array<{ kind: AcknowledgmentKind; version: number }> | Error;
    try {
      missing = await opts.readMissing(memberId);
    } catch (err) {
      onReadError(err);
      missing = err instanceof Error ? err : new Error(String(err));
    }
    const decision = decideAcknowledgmentGate(missing);
    if (decision.ok) {
      if (satisfied.size >= max) {
        const oldest = satisfied.values().next().value;
        if (oldest !== undefined) satisfied.delete(oldest);
      }
      satisfied.add(key);
    }
    return decision;
  }

  return { check, clear: () => satisfied.clear(), size: () => satisfied.size };
}
