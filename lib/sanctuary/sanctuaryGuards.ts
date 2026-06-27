/**
 * Sanctuary guards — the OUT-bound boundary: nothing from a Sanctuary session enters
 * persistence. Mirror of the recall opt-out (the IN-bound boundary, which keeps
 * withdrawn recall out of the prompt).
 *
 *   Recall   — member withdraws permission  ⇒ nothing enters the prompt.
 *   Sanctuary — member enters Sanctuary       ⇒ nothing enters persistence.
 *
 * One protects what comes INTO reasoning; the other protects what goes OUT into memory.
 * Together: *protected boundaries are honored in both directions.*
 *
 * Constitutional invariant (CLAUDE.md → Sanctuary Mode §1, §6): Sanctuary content is
 * never stored, indexed, or converted into long-term memory under any circumstances,
 * including by user request during the session.
 *
 * These are the named, testable forms of that invariant. "Defense-in-depth" means the
 * STORE enforces them regardless of caller — a writer must not depend on every caller
 * remembering to check Sanctuary first.
 */

/**
 * Summary write guard. Sanctuary sessions never persist summary content: the summary
 * is forced to `null` regardless of what the caller passed. Used by
 * SessionSummaryStore.writeSessionRecord — a *boundary-enforced* guard.
 */
export function sanctuarySafeSummary(
  isSanctuary: boolean,
  summaryText: string | null | undefined,
): string | null {
  return isSanctuary ? null : (summaryText ?? null);
}

/**
 * Turn persistence guard. `false` ⇒ do not write the turn at all.
 *
 * Today the turns vector is *caller-enforced*: the conversation-turns route returns
 * early on Sanctuary and the sovereign service checks per tier, but
 * `TurnsStore.addExchange` itself writes unconditionally. Wiring this guard at the
 * TurnsStore boundary would make the turns vector *boundary-enforced* (defense-in-depth)
 * like the summary vector — closing the asymmetry. (Proposed, not yet wired.)
 */
export function shouldPersistTurn(isSanctuary: boolean): boolean {
  return isSanctuary !== true;
}

/**
 * Library "keep" persistence guard. `false` ⇒ do not write the kept item at all.
 *
 * A kept item (Personal Wisdom Library) is long-term memory, so the same invariant
 * applies: a Sanctuary session must never persist one (arch §9.6 / CLAUDE.md →
 * Sanctuary Mode §1, §6). `POST /api/library/keep` checks this BEFORE any DB write,
 * so a Sanctuary keep creates zero rows.
 */
export function shouldPersistKeep(isSanctuary: boolean): boolean {
  return isSanctuary !== true;
}
