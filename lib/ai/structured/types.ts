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

export interface StructuredTool {
  name: string;
  description?: string;
  /** JSON Schema, passed through verbatim. The seam does not rewrite contracts. */
  inputSchema: Record<string, unknown>;
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
   * Streamed and consumed whole.
   *
   * NOT A PERFORMANCE FLAG. A long reading with adaptive thinking can outrun a
   * non-streaming HTTP timeout, so for one caller streaming is the difference
   * between a reading and an error. It is part of the request's meaning and is
   * therefore expressed here rather than decided for the caller.
   */
  stream?: boolean;
}

export type StructuredBlock =
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: unknown };

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
    /** The model ACTUALLY SENT, resolved — never the default's name. */
    model: string;
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
  | 'not_configured';

export type StructuredOutcome =
  | { ok: true; result: StructuredResult }
  | { ok: false; refusal: StructuredRefusal; detail?: string };

/**
 * What a provider must be able to do to serve a structured request AT ALL.
 *
 * A provider that cannot honour tools, roles and a pinned model does not
 * partially implement this interface — it does not implement it.
 */
export interface StructuredProvider {
  name: ProviderName;
  execute(req: StructuredRequest): Promise<StructuredResult>;
}
