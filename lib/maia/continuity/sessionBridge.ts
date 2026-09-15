/**
 * C1-BRIDGE-02 · member-grounded two-hop recovery.
 *
 * Authority: founder ruling 2026-09-15, after R1 rejected the recurrence repair and
 * C1-BRIDGE-01 established that the production corpus contains a member-grounded path.
 * Acceptance: P1 / N1 / N2, frozen BEFORE this file existed.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE PROBLEM THIS SOLVES, AND THE ONE IT DOES NOT.
 *
 * One-hop ranking asks: *which displaced exchange resembles the current utterance?*
 * For an opaque retrospective ask — "what was that phrase I shared earlier" — the
 * honest answer is NONE. The utterance names only the ACT of remembering; it carries
 * no evidence about the object. Production proved this: ranking returned [2,3,36]
 * while the marker sat at 22, and a recurrence repair moved the field around without
 * touching the term that decided it.
 *
 * But the conversation may already contain the missing relation:
 *
 *     current ask  →  recent turn that refers back  →  the earlier material
 *
 * ⭐ That is a TWO-HOP CONTINUITY problem, not a one-hop ranking problem.
 *
 * ⛔⛔ WHAT THIS DOES NOT SOLVE. Bridge recovery serves REPEATED or LINKED retrospective
 * retrieval. It does NOT solve first-ask opaque memory. In the production corpus the
 * bridge exists only because the member had already asked once and named the target in
 * the asking; strip that turn and no path remains. A green P1 must never be read as
 * "memory fixed" — what eventually solves the ordinary single-ask case probably needs
 * significance preserved WHEN THE MOMENT OCCURRED, not reconstructed afterwards from
 * the wording of the request.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ⭐⭐ ABSTENTION IS A FIRST-CLASS RESULT, NOT A FAILED SEARCH.
 *
 *   ABSENCE OF A BRIDGE IS EVIDENCE. It must not become permission to invent a weaker
 *   one. DC-3 — the defeat candidate that isolated N2 — had a CORRECT bridge and died
 *   anyway, because when it found nothing it reached for something. Its defect was not
 *   the bridge. Its defect was refusing to stop.
 *
 * ⛔ So: no fallback retrieval · no threshold lowering · no assistant-echo bridging ·
 *    no semantic backfill · no "best available" · no widening. If no member-grounded
 *    path exists, this returns an explicit abstention and the caller recovers nothing.
 */

export interface BridgeExchange {
  readonly index: number;
  readonly userMessage: string;
  readonly maiaResponse: string;
}

export interface BridgeRecovered {
  readonly index: number;
  /** The member's own tokens that carried the second hop. Provenance, not decoration. */
  readonly carriedBy: string[];
  /** Index of the prefix exchange the path traversed. */
  readonly viaPrefixIndex: number;
}

export type BridgeOutcome =
  | { readonly kind: 'recovered'; readonly exchanges: BridgeRecovered[] }
  | {
      readonly kind: 'abstained';
      readonly reason:
        | 'no-member-link-to-recent-context'
        | 'recent-context-names-nothing-earlier';
    };

export const BRIDGE_MAX_RECOVERED = 3;

const STOPWORDS = new Set([
  'a','an','the','and','or','but','if','of','to','in','on','at','by','for','with',
  'about','as','is','are','was','were','be','been','being','it','its','this','that',
  'these','those','i','you','we','they','he','she','me','my','your','our','their',
  'do','does','did','have','has','had','not','no','so','than','then','there','here',
  'what','which','who','whom','when','where','why','how','can','could','would',
  'should','will','just','from','up','out','into','over','again','more','some','any',
  'all','very','really','like','get','got','know','think','one','thing','things',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOPWORDS.has(t));
}

/**
 * ⭐ ORIGIN-AWARE AT BOTH HOPS. Only the MEMBER'S OWN WORDS carry a bridge.
 *
 * MAIA's replies are read nowhere in this function. That is not caution, it is
 * measured: from the production corpus's prior-ask turn, SIXTEEN displaced exchanges
 * become reachable through MAIA's echo alone. An origin-blind bridge admits all of
 * them, which is the recurrence inquiry's defect — MAIA's language manufacturing
 * member significance — reappearing in the topology.
 */
export function recoverViaBridge(input: {
  probe: string;
  activePrefix: readonly BridgeExchange[];
  displaced: readonly BridgeExchange[];
  maxRecovered?: number;
}): BridgeOutcome {
  const { probe, activePrefix, displaced } = input;
  const maxRecovered = input.maxRecovered ?? BRIDGE_MAX_RECOVERED;

  const probeTokens = new Set(tokenize(probe));
  if (probeTokens.size === 0) {
    return { kind: 'abstained', reason: 'no-member-link-to-recent-context' };
  }

  // ── HOP 1 · which recent turn is the ask reaching for? ────────────────────
  // Member words only. A prefix turn linked to the probe solely through MAIA's reply
  // is not the member reaching back — it is MAIA having used a similar word.
  const hops = activePrefix.filter(p =>
    tokenize(p.userMessage).some(t => probeTokens.has(t))
  );
  if (hops.length === 0) {
    return { kind: 'abstained', reason: 'no-member-link-to-recent-context' };
  }

  // ── HOP 2 · what did THAT turn name, that the probe did not? ──────────────
  // ⭐ Tokens already in the probe are EXCLUDED as carriers. The probe's own words
  // cannot tell us what the recent turn was pointing at — only the words the recent
  // turn ADDS can. Without this exclusion an incidental shared word (in production,
  // the member's own "remember") drags in unrelated exchanges.
  const candidates = new Map<number, BridgeRecovered>();
  for (const hop of hops) {
    const carriers = new Set(
      tokenize(hop.userMessage).filter(t => !probeTokens.has(t))
    );
    if (carriers.size === 0) continue;

    for (const d of displaced) {
      const shared = [...new Set(tokenize(d.userMessage))].filter(t => carriers.has(t));
      if (shared.length === 0) continue;
      const prior = candidates.get(d.index);
      if (!prior || shared.length > prior.carriedBy.length) {
        candidates.set(d.index, {
          index: d.index, carriedBy: shared, viaPrefixIndex: hop.index,
        });
      }
    }
  }

  if (candidates.size === 0) {
    return { kind: 'abstained', reason: 'recent-context-names-nothing-earlier' };
  }

  const exchanges = [...candidates.values()]
    .sort((a, b) => b.carriedBy.length - a.carriedBy.length || a.index - b.index)
    .slice(0, maxRecovered);

  // ⛔ NO FALLBACK BELOW THIS LINE. There is deliberately nothing here.
  return { kind: 'recovered', exchanges };
}
