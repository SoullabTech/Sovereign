/**
 * MAIA-UNIFIED-COGNITION-CONVERGENCE-01 · Cut 1A
 * Trusted orientation convergence — SHADOW ONLY.
 *
 * The whole-organism census (docs/programme/MAIA_WHOLE_ORGANISM_CENSUS_01.md) established
 * two facts that this module exists to join:
 *
 *   1. `/list` and `/between/chat` both converge on getMaiaResponse().
 *   2. `/between` already computes a FacetDecisionPacket — the Spiralogic circulatory
 *      governor — hands it across that convergence point, and it is read zero times.
 *
 * This module resolves ONE trusted orientation contract at the shared boundary and makes it
 * reachable from every tier. It deliberately does NOT give that contract any authority over
 * a member-facing response: Cut 1A stops before influence (founder ruling, 2026-09-04).
 *
 * The contract IS the FacetDecisionPacket. No second elemental representation is invented
 * here — the packet is already a structured decision object (active facet, posture,
 * integrity flags, regulation, handoff, language hints).
 *
 * ── SOVEREIGNTY BOUNDARY (load-bearing) ─────────────────────────────────────────────────
 *
 * `meta` on MaiaRequest begins life as the CLIENT's request-body rest-spread: any
 * unrecognised key a caller sends lands in it (PBR-001, app/api/sovereign/app/maia/list).
 * Server-authored fields are safe there only because the route overwrites them after the
 * spread. An orientation governor read from `meta` would therefore be forgeable by any
 * caller — a client could manufacture MAIA's supposedly sovereign elemental posture,
 * integrity risks and language hints.
 *
 * So the trusted packet travels as a SERVER-INTERNAL TOP-LEVEL FIELD on MaiaRequest, and
 * `meta.facetDecision` is NEVER cognition authority. resolveOrientationContract() reads the
 * top-level field only; it has no access to meta by construction.
 */

import { createHash } from 'crypto';
import { computeFacetDecision, type FacetDecisionPacket } from '../../consciousness/FacetDecisionLoop';

export type OrientationContract = FacetDecisionPacket;

/** Where the contract in play came from. `none` means no contract exists for this turn. */
export type OrientationSource = 'upstream' | 'service' | 'none';

export type OrientationHistoryEntry =
  | { role?: string; content?: string }
  | { userMessage?: string; maiaResponse?: string };

/**
 * Normalize either history shape to the `{ role, content }` pairs computeFacetDecision
 * expects. A ConversationExchange becomes the two speech turns it actually represents.
 */
export function normalizeOrientationHistory(
  history: readonly OrientationHistoryEntry[] = [],
): Array<{ role: string; content: string }> {
  const out: Array<{ role: string; content: string }> = [];
  for (const h of history) {
    if (h && ('role' in h || 'content' in h)) {
      const e = h as { role?: string; content?: string };
      if (e.content) out.push({ role: e.role || 'user', content: e.content });
      continue;
    }
    const e = h as { userMessage?: string; maiaResponse?: string };
    if (e?.userMessage) out.push({ role: 'user', content: e.userMessage });
    if (e?.maiaResponse) out.push({ role: 'assistant', content: e.maiaResponse });
  }
  return out;
}

export interface ResolvedOrientation {
  readonly contract: OrientationContract | null;
  readonly source: OrientationSource;
  /** Present only when a contract exists. Content-free structural digest. */
  readonly digest: string | null;
}

export interface ResolveOrientationInput {
  /**
   * A packet already computed by an upstream SERVER path (today: /between via
   * maiaOrchestrator). Must arrive as a typed top-level field — never out of `meta`.
   */
  readonly trusted?: OrientationContract | null;
  readonly input: string;
  /**
   * Accepts either history shape the two surfaces carry: the role/content pairs
   * maiaOrchestrator builds, or the ConversationExchange records getMaiaResponse loads.
   * Normalized below rather than cast, because an exchange is two turns of speech and
   * flattening it to one would misrepresent the conversation to the facet detector.
   */
  readonly conversationHistory?: readonly OrientationHistoryEntry[];
  /**
   * Sanctuary posture for this turn. When true the contract is absolute-null: nothing is
   * computed, nothing is accepted, nothing derived is logged.
   */
  readonly sanctuary: boolean;
}

/**
 * Content-free structural digest of a contract.
 *
 * Deliberately excludes every free-text field the packet carries —
 * `regulation.invitationPhrase` and `handoff.transitionPhrase` are member-derived language
 * and never enter telemetry. Only the structural decision shape is hashed, so two turns
 * that reached the same orientation produce the same digest without either turn's content
 * being recoverable from it.
 */
export function orientationDigest(contract: OrientationContract): string {
  const structural = {
    activeFacet: contract.activeFacet,
    posture: contract.posture,
    integrityFlags: contract.integrityFlags,
    languageHints: contract.languageHints,
    hasRegulation: !!contract.regulation,
    regulationPair: contract.regulation
      ? `${contract.regulation.dominant}->${contract.regulation.complement}`
      : null,
    hasHandoff: !!contract.handoff,
    handoffPair: contract.handoff ? `${contract.handoff.from}->${contract.handoff.to}` : null,
  };
  return createHash('sha256').update(JSON.stringify(structural)).digest('hex').slice(0, 12);
}

/**
 * Resolve the one orientation contract for this turn, at the shared service boundary.
 *
 *   sanctuary            → null, always, before anything is computed or accepted
 *   trusted packet given → use it verbatim; never recompute (source: 'upstream')
 *   otherwise            → compute once here (source: 'service')
 *
 * Fail-soft by construction: if computeFacetDecision throws, the turn proceeds with no
 * contract rather than failing. Orientation is not permitted to break cognition — least of
 * all in a cut where it has no authority over the response anyway.
 */
export function resolveOrientationContract(args: ResolveOrientationInput): ResolvedOrientation {
  const NONE: ResolvedOrientation = { contract: null, source: 'none', digest: null };

  // Sanctuary is absolute and is checked first: no computation, no acceptance of an
  // upstream packet, no derived state anywhere downstream.
  if (args.sanctuary) return NONE;

  if (args.trusted) {
    return { contract: args.trusted, source: 'upstream', digest: orientationDigest(args.trusted) };
  }

  try {
    const contract = computeFacetDecision(
      args.input,
      normalizeOrientationHistory(args.conversationHistory),
    );
    return { contract, source: 'service', digest: orientationDigest(contract) };
  } catch (err) {
    console.warn('[MAIA/orientation] compute failed — proceeding without contract:', err);
    return NONE;
  }
}

/**
 * Render the contract as cognition-facing text.
 *
 * BUILT AND NOT APPLIED IN CUT 1A. This exists so the shadow can demonstrate that a real
 * rendering path is available and is deliberately not appended to any prompt — the same
 * discipline the partition lane used: build the transport, prove zero diff, then adjudicate
 * authority separately. Cut 1B decides whether and how this participates, and does so
 * without letting FacetDecisionLoop become a dictator over the other intelligences.
 */
export function renderOrientationForCognition(contract: OrientationContract): string {
  const risks = Object.entries(contract.integrityFlags)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const lines = [
    '🌀 ORIENTATION (Spiralogic facet decision):',
    `- Active facet: ${contract.activeFacet}`,
    `- Posture: ${contract.posture}`,
    `- Pace: ${contract.languageHints.pace} · Depth: ${contract.languageHints.depth} · Mode: ${contract.languageHints.mode}`,
  ];
  if (risks.length) lines.push(`- Integrity risks present: ${risks.join(', ')}`);
  if (contract.regulation) {
    lines.push(`- Regulation: ${contract.regulation.dominant} → ${contract.regulation.complement}`);
  }
  if (contract.handoff) {
    lines.push(`- Handoff ready: ${contract.handoff.from} → ${contract.handoff.to}`);
  }
  return lines.join('\n');
}

export interface OrientationShadowLine {
  readonly tier: string;
  readonly contractPresent: boolean;
  readonly contractSource: OrientationSource;
  readonly contractDigest: string | null;
  /** Cut 1A invariant: always false. The contract has no response authority. */
  readonly applied: false;
  readonly legacyPromptDigest: string;
  readonly sentPromptDigest: string;
  readonly zeroPromptDiff: boolean;
  readonly sanctuary: boolean;
}

const promptDigest = (s: string) => createHash('sha256').update(s).digest('hex').slice(0, 12);

/**
 * Emit the Cut 1A shadow line.
 *
 * `legacyPrompt` is the prompt as this tier builds it today. `sentPrompt` is what is
 * actually handed to the model. In Cut 1A they must be byte-identical — that identity is
 * the cut's central claim, and it is asserted here per turn rather than argued in a
 * document.
 *
 * Content-free: no member text, no derived interpretation, no invitation or transition
 * phrase, no contract body. On sanctuary turns there is no contract at all, so the line
 * carries no facet or risk data by construction.
 */
export function emitOrientationShadow(args: {
  tier: string;
  resolved: ResolvedOrientation;
  legacyPrompt: string;
  sentPrompt: string;
  sanctuary: boolean;
}): OrientationShadowLine {
  const legacyPromptDigest = promptDigest(args.legacyPrompt);
  const sentPromptDigest = promptDigest(args.sentPrompt);
  const line: OrientationShadowLine = {
    tier: args.tier,
    contractPresent: !!args.resolved.contract,
    contractSource: args.resolved.source,
    contractDigest: args.resolved.digest,
    applied: false,
    legacyPromptDigest,
    sentPromptDigest,
    zeroPromptDiff: legacyPromptDigest === sentPromptDigest,
    sanctuary: args.sanctuary,
  };
  console.log('[MAIA/orientation-shadow]', line);
  return line;
}
