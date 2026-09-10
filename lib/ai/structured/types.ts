/**
 * AIN-STRUCTURED-INFERENCE-SEAM-01 — structured inference, provider-neutral.
 *
 * WHY THIS EXISTS. The sovereign text seam speaks one vocabulary: a system
 * prompt and one user string. Two proven cognitive callers cannot be expressed
 * in it without changing what they mean — one needs a tool contract and a
 * `tool_use` result, the other needs role-preserving multi-turn history, and
 * both pin the model whose identity becomes their provenance. Routing them
 * through plain text generation would not degrade those contracts; it would
 * delete them. So the seam is widened rather than the callers narrowed.
 *
 * NOT AN ANTHROPIC SHAPE. Nothing in this file imports, names, or is shaped by
 * `@anthropic-ai/sdk`. Only the approved provider adapter may do that. A neutral
 * type that quietly mirrors one vendor's wire format is a vendor lock-in wearing
 * an abstraction, and the next provider is where you find out.
 */

import type { ProviderName } from '../types';

export interface StructuredMessage {
  /** ROLES ARE PRESERVED, never flattened into one turn. */
  role: 'user' | 'assistant';
  content: string;
}

/**
 * WHETHER THE PROVIDER MUST ENFORCE THE SCHEMA DURING GENERATION.
 *
 * `best_effort`      the schema is a contract the model is asked to honour. A
 *                    response that violates it is the caller's to detect and
 *                    refuse. This is the default and the historical behaviour.
 * `provider_enforced` the provider must constrain generation so the returned
 *                    tool input conforms to the schema. A provider that cannot
 *                    guarantee it must REFUSE — it may not silently downgrade.
 *
 * NEUTRAL BY CONSTRUCTION, like `execution.completion` above it: this states the
 * REQUIREMENT, and each adapter chooses its own mechanism. No vendor term
 * appears here. Anthropic happens to satisfy it with grammar-constrained
 * generation; another provider might satisfy it differently or not at all, and
 * this seam must be able to say so without borrowing anyone's wire format.
 *
 * Founder ruling 2026-09-08, after G8 attempt #3 stopped at Window 4: the
 * provider returned a completed `tool_use` whose array-typed field arrived as a
 * JSON string containing corrupt JSON. That is a post-cognition contract
 * failure — no retry (C5) — and the lawful response is not to tolerate it
 * downstream but to stop asking for schema-invalid arguments in the first place.
 */
export type SchemaConformance = 'best_effort' | 'provider_enforced';

export interface StructuredTool {
  name: string;
  description?: string;
  /** JSON Schema, passed through verbatim. The seam does not rewrite contracts. */
  inputSchema: Record<string, unknown>;
  /**
   * Omitted means `best_effort`, which is the historical behaviour and stays the
   * default: a caller that does not ask for enforcement gets a byte-identical
   * request to the one it got before this field existed.
   */
  inputSchemaConformance?: SchemaConformance;
}

export type StructuredToolChoice =
  | { type: 'auto' }
  /** Must answer through SOME tool. Prose in a text block is not an answer. */
  | { type: 'any' }
  | { type: 'tool'; name: string };

export interface StructuredRequest {
  /**
   * PINNED BY THE CALLER. The seam must never run a model-selection policy over
   * a structured request: the resolved model is what `readerProvenance` records
   * as having read someone's Work, and a router that quietly picked a different
   * one would make that record false.
   */
  model: string;
  system: string;
  messages: StructuredMessage[];
  maxTokens: number;
  /** Absent means absent — never an empty array, never a present-but-undefined key. */
  tools?: StructuredTool[];
  toolChoice?: StructuredToolChoice;
  /**
   * HOW LONG THE COMPLETION MAY TAKE — an execution requirement, not a request.
   *
   * SEPARATED FROM THE SEMANTIC CONTRACT DELIBERATELY. An earlier cut carried
   * `stream: true` here, which mistook one vendor's transport for the meaning of
   * the inference: the caller that needs it does not consume a stream as part of
   * its cognition, it consumes one completed message. What it actually requires
   * is that a long completion not be cut off — and a future provider might
   * satisfy that by streaming, by long-polling a job, or by simply not having
   * the same timeout.
   *
   * So the neutral vocabulary states the REQUIREMENT and each adapter chooses
   * its own mechanism. Omitted means `ordinary`, which is the common case.
   */
  execution?: { completion: CompletionRequirement };
}

/**
 * `ordinary`     — a normal completion.
 * `long-running` — may take long enough that an ordinary request would be cut
 *                  off. For one caller this is the difference between a reading
 *                  and a timeout, so it is part of what it asked for.
 */
export type CompletionRequirement = 'ordinary' | 'long-running';

export type StructuredBlock =
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: unknown };

export type ModelAgreement = 'agreed' | 'differs' | 'unreported';

/**
 * THE ONE DERIVATION. Single-owned so no adapter can spell the three-way
 * comparison its own way, and so no fixture can hand back an agreement
 * inconsistent with the two facts it is supposed to summarise (SP-6).
 */
export function deriveModelAgreement(
  requested: string,
  reported: string | null,
): ModelAgreement {
  if (reported === null) return 'unreported';
  return reported === requested ? 'agreed' : 'differs';
}

export interface StructuredResult {
  /**
   * THE BLOCKS SURVIVE. A missing or malformed tool call must remain DETECTABLE
   * by the caller — never coerced into text, and never presented as a successful
   * reading. That detection is the caller's contract, not the seam's to make
   * convenient.
   */
  content: StructuredBlock[];
  stopReason: string | null;
  usage: { inputTokens: number; outputTokens: number };
  provenance: {
    provider: ProviderName;
    /**
     * THE MODEL REQUESTED AND SENT — the caller's pinned model, taken from the
     * request that went up the wire. Its meaning has never changed and must not:
     * `readerIdentity()` carries it into frozen `DevelopmentalReading` provenance
     * that is already persisted and already shown to members, so redefining it
     * would retroactively alter what those rows assert about what read someone's
     * Work.
     *
     * It is NOT the model the provider says answered. That is `reportedModel`.
     */
    model: string;
    /**
     * WHAT THE PROVIDER SAYS ANSWERED, read from the response — never from the
     * request. `null` where a provider does not report model identity.
     *
     * REQUIRED, not optional (founder ruling 2026-09-08). An optional field would
     * let "nobody supplied the fact" look indistinguishable from normal, which is
     * the shape of the defect this repair exists to remove: a missing fact must
     * remain visible as missing.
     */
    reportedModel: string | null;
    /**
     * SYNTACTIC agreement between `model` and `reportedModel`, mechanically
     * derived — never asserted by a provider or a fixture.
     *
     * It is not authorization, not proof of endpoint identity, and not a judgment
     * that a differing string is necessarily an unlawful substitution. Aliases are
     * deliberately NOT normalized: deciding two identifiers are equivalent is its
     * own policy question, and `differs` simply stops acceptance so a person can
     * look.
     */
    modelAgreement: ModelAgreement;
    latencyMs: number;
  };
}

export type StructuredRefusal =
  /**
   * The mode forbids the only provider that can honour this contract, and no
   * local structured provider exists. Refusing is the whole ruling: a local
   * text model that cannot honour a tool contract is not a fallback, it is a
   * different operation wearing the same name.
   */
  | 'structured_inference_unavailable'
  /** The authorized provider failed. NOT a cue to try something else. */
  | 'provider_unavailable'
  /**
   * The deployment's inference mode is not a mode. Refused rather than defaulted,
   * because defaulting a typo would silently pick the most permissive policy and
   * turn a sovereign deployment into a primary one.
   */
  | 'invalid_inference_mode'
  | 'not_configured'
  /**
   * A tool required `provider_enforced` schema conformance and the authorized
   * provider does not guarantee it.
   *
   * REFUSED BEFORE COGNITION, never downgraded. Running the request anyway as
   * ordinary tool use would answer a question the caller did not ask: it asked
   * for a guarantee, and receiving an unguaranteed answer that happens to
   * validate is not the same thing. A caller that wants best-effort can say so.
   */
  | 'schema_conformance_unavailable';

export type StructuredOutcome =
  | { ok: true; result: StructuredResult }
  | { ok: false; refusal: StructuredRefusal; detail?: string };

/**
 * What a provider must be able to do to serve a structured request AT ALL.
 *
 * A provider that cannot honour tools, roles and a pinned model does not
 * partially implement this interface — it does not implement it.
 */
/**
 * ⭐⭐ THE HANDOFF SIGNAL. Not a callback for progress or telemetry: the one
 * moment a disclosure receipt may lawfully move `attempted → crossed`.
 *
 *   The receipt is evidence of disclosure, not of successful inference.
 *   Response success is not disclosure evidence — handoff is.
 *
 * ⛔ A PROVIDER MUST CALL IT IMMEDIATELY BEFORE DISPATCH AND NOWHERE ELSE.
 * Entering `execute` is not a handoff — a provider can still refuse, and its
 * client can still fail to construct, after that point. Signalling early would
 * record a crossing for prose that never left the process; signalling late (on
 * the response) would record no crossing for prose that did.
 */
export interface StructuredHooks {
  readonly onHandoff?: () => void;
}

export interface StructuredProvider {
  name: ProviderName;
  /**
   * Whether this provider can GUARANTEE that a returned tool input conforms to
   * the tool's schema.
   *
   * REQUIRED, not optional — a new provider must state it rather than inherit a
   * guarantee by saying nothing. `false` is a lawful answer; silence is not.
   */
  enforcesInputSchema: boolean;
  execute(req: StructuredRequest, hooks?: StructuredHooks): Promise<StructuredResult>;
}
