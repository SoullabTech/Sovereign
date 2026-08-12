/**
 * Relational Handoff — lifetime & consent contract
 *
 * The member presses "Take this to MAIA" on /relationships/[id]. That is an explicit
 * member act, and it is the ONLY thing that may start a handoff. Nothing here infers
 * a relationship from conversation content, recency, or the return path.
 *
 * THE INVARIANT THIS FILE EXISTS TO HOLD:
 *
 *   If the interface says a relationship has been taken to MAIA, the request
 *   transport must carry that relationship, or the interface must stop saying it.
 *
 * Before this module, the visible claim ("Return to <relationship>") was backed by
 * localStorage and survived remount, while the transported `relationshipContextId`
 * was backed by a React useRef seeded once from a one-shot localStorage seed — so it
 * did NOT survive remount. UI continuity outlived request continuity. This module
 * makes both read one record, so they cannot diverge.
 *
 * LIFETIME OWNER — the existing conversation session, not a new primitive.
 * `maia_session_id` (canonical identity module, restored across reloads by
 * app/maia/page.tsx) already owns "which conversation is this". The handoff is stamped
 * with that sessionId, mirroring how `maia_conversation_${sessionId}` already stores
 * per-session message history. A read whose stamp does not match the caller's current
 * session/member returns null — so termination is structural rather than a timer.
 *
 * Termination events (derived from existing app behavior, not invented):
 *   - a new conversation session begins        → sessionId stamp no longer matches
 *   - a different member is signed in          → userId stamp no longer matches
 *   - a new explicit handoff arrives           → same key overwritten (latest wins)
 *   - the member dismisses or follows the pill → explicit clear
 *
 * Sanctuary is a SUSPENSION, not a termination — see isHandoffEligible(). Sanctuary
 * must not silently destroy an explicit member act, and must not let one travel.
 */

export const RELATIONAL_HANDOFF_KEY = 'maia_relational_handoff';

export interface RelationalHandoff {
  /** The relationship the member explicitly handed off. */
  contextId: string;
  /** Human-readable label for the visible claim. Display only — never an identity. */
  label?: string;
  /**
   * Where the visible "return" affordance points. Carried INSIDE the record rather than
   * in the separate `maia_return_path` key on purpose: that key has no session stamp and
   * outlives the handoff, so a pill rendered from it could keep naming a relationship
   * after the id stopped travelling. Rendering the relational pill from this field ties
   * the claim's lifetime to the handoff's lifetime structurally.
   *
   * This is a destination, never an identity — nothing may derive a relationship from it.
   */
  returnTo?: string;
  /** Conversation session this handoff belongs to. */
  sessionId: string;
  /** Member who performed the handoff. Client-side defense in depth; the server
   *  scopes relationship reads to the authenticated member independently. */
  userId: string;
}

/**
 * Record an explicit handoff. Overwrites any prior handoff — latest explicit act wins.
 */
export function setRelationalHandoff(handoff: RelationalHandoff): void {
  if (typeof window === 'undefined') return;
  if (!handoff.contextId || !handoff.sessionId || !handoff.userId) return;
  try {
    localStorage.setItem(RELATIONAL_HANDOFF_KEY, JSON.stringify(handoff));
  } catch {
    // Storage unavailable (private mode, quota). Fail closed: no stored handoff means
    // no claim and no transport — divergence is impossible, continuity is merely lost.
  }
}

/**
 * Read the handoff for this session and member. Returns null when the stored stamp
 * does not match — which is how a handoff ends, rather than by expiry.
 *
 * This is the single source for BOTH the visible claim and the request payload.
 */
export function readRelationalHandoff(
  sessionId: string | null | undefined,
  userId: string | null | undefined,
): RelationalHandoff | null {
  if (typeof window === 'undefined') return null;
  if (!sessionId || !userId) return null;
  try {
    const raw = localStorage.getItem(RELATIONAL_HANDOFF_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<RelationalHandoff>;
    if (!parsed?.contextId || !parsed.sessionId || !parsed.userId) return null;
    // Stale session — a new conversation began. Not this handoff's session.
    if (parsed.sessionId !== sessionId) return null;
    // Different member. Never hand one member's relationship to another.
    if (parsed.userId !== userId) return null;
    return {
      contextId: parsed.contextId,
      label: parsed.label,
      returnTo: parsed.returnTo,
      sessionId: parsed.sessionId,
      userId: parsed.userId,
    };
  } catch {
    return null;
  }
}

/** End the handoff outright. Clears the claim and the transport together. */
export function clearRelationalHandoff(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(RELATIONAL_HANDOFF_KEY);
  } catch {
    // no-op
  }
}

/**
 * Whether an active handoff may travel on this turn.
 *
 * Sanctuary suppresses relational-context reading server-side, so a Sanctuary turn must
 * not carry the id AND must not display an active-handoff claim — otherwise the interface
 * asserts a continuity the request does not have, which is the exact defect this unit
 * repairs, relocated. The stored record is deliberately retained: leaving Sanctuary
 * restores the member's own explicit act rather than silently discarding it.
 *
 * Callers must use this ONE predicate for both the claim and the payload.
 */
export function isHandoffEligible(
  handoff: RelationalHandoff | null,
  isSanctuary: boolean,
): boolean {
  return !!handoff && !isSanctuary;
}
