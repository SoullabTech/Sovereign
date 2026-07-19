/**
 * Turn posture — server-derived, per-turn privacy posture (Sanctuary S1).
 *
 * Constitutional invariant (Kelly ruling, 2026-07-17):
 *   The privacy posture governing a turn is the posture in force when that
 *   turn occurred.
 *
 * Session-level mode is NOT authoritative — Sanctuary can be entered or exited
 * mid-session (proven by incident SANC-20260614-01, where a session whose
 * record read `standard` persisted five sanctuary exchanges). A TurnPosture is
 * resolved ONCE per request at the serving boundary and passed by reference to
 * every content writer. Protected stores refuse content writes when the
 * posture is sanctuary — and refuse when no resolvable posture instance is
 * provided at all (fail closed).
 *
 * The class has a private constructor so a posture cannot be forged downstream:
 * `{ sanctuary: false }` does not typecheck against TurnPosture, and a JS
 * caller bypassing types fails the `instanceof` check inside the store guard.
 * The only way to obtain one is `TurnPosture.resolve(...)` at the boundary.
 * Exiting Sanctuary mid-session does not retroactively change prior turns:
 * each turn's writes carry the posture resolved for THAT request.
 */

export class TurnPosture {
  readonly sanctuary: boolean;
  readonly resolvedAtIso: string;
  readonly source: 'request-meta';

  private constructor(sanctuary: boolean) {
    this.sanctuary = sanctuary;
    this.resolvedAtIso = new Date().toISOString();
    this.source = 'request-meta';
    Object.freeze(this);
  }

  /**
   * Resolve the posture for the current turn from request-derived input.
   * Accepts the route/service `meta` object (or an explicit `{ sanctuary }`).
   * ANY affirmative sanctuary signal wins — contradictory signals fail closed
   * to sanctuary (protective). Absence of any signal is an ordinary turn.
   */
  static resolve(meta: unknown): TurnPosture {
    const m = (meta ?? {}) as Record<string, unknown>;
    const nested = (m['meta'] ?? {}) as Record<string, unknown>;
    const signals = [m['sanctuary'], nested['sanctuary']];
    const sanctuary = signals.some((v) => v === true || v === 'true');
    return new TurnPosture(sanctuary);
  }
}

/**
 * Store-boundary guard: returns true only when CONTENT persistence may
 * proceed. Refusal logs are METADATA ONLY — never message content, never
 * caller-supplied strings other than the store name and a session-id prefix.
 * A missing or forged posture (anything that is not a TurnPosture instance)
 * fails closed: content is not persisted, and the refusal is loud.
 */
export function contentWritable(
  posture: TurnPosture,
  store: string,
  sessionId?: string | null
): boolean {
  const sessionIdPrefix = sessionId ? String(sessionId).slice(0, 12) : null;
  if (!(posture instanceof TurnPosture)) {
    console.error(
      '[SANCTUARY] write refused — posture missing or unresolved (fail closed)',
      { store, sessionIdPrefix }
    );
    return false;
  }
  if (posture.sanctuary) {
    console.log('[SANCTUARY] write refused', { store, sessionIdPrefix });
    return false;
  }
  return true;
}
