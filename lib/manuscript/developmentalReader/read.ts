/**
 * BUILD-07B — DEVELOPMENTAL READER · the host loop.
 *
 *     validate → render → runStructured → parse → bind → Result
 *
 * WHAT THIS MODULE MAY REACH. The 07A vocabulary and proof (`bindEvidence`),
 * the request renderer and parser beside it, and the platform's structured
 * inference seam. It holds no database client, no draft loader, no capture,
 * no live Work. Prose enters only inside `request.recovered`, which the
 * validator proves was recovered under the request's frozen state
 * (contract A6, F1, F3). The gate that keeps it that way is
 * `__tests__/readerCannotBypass.test.ts`.
 *
 * NO SECOND DOOR. There is no `client`, `provider`, `mode` or `seam` option.
 * The platform decides whether inference is authorized here
 * (lib/ai/structured/policy.ts); under `sovereign` / `local_only` the seam
 * refuses and this loop returns that refusal unchanged — no fallback, no
 * retry with another model (F14). Tests exercise the post-seam path through
 * `resultFromBlocks`, which is pure.
 *
 * NO STATE. Nothing is cached across invocations (F19). Nothing is stored:
 * a `DevelopmentalReaderResult` is a value the caller holds, with no
 * identity and no row (A1). Minting identity and freezing are BUILD-07C.
 */

import { runStructured } from '../../ai/structured/router';
import type { StructuredBlock } from '../../ai/structured/types';
import { bindEvidence } from '../development/bind';
import type { NonEmptyArray } from '../development/evidenceRef';
import type { ReaderIdentity } from '../structure/readerProvenance';
import {
  refused,
  type DevelopmentalReaderRequest,
  type DevelopmentalReaderResult,
  type ReaderClaimDraft,
} from './contract';
import { parseReaderBlocks } from './parse';
import { promptContractHash, READER_SYSTEM, READER_VERSION, readerTool, renderRequest } from './render';
import { validateRequest } from './validate';

export interface ReadOptions {
  /* No `client`, no `provider`, no `mode`. The platform authorizes the seam. */
  model?: string;
  maxTokens?: number;
}

const DEFAULT_MODEL = process.env.MAIA_DEVELOPMENTAL_READER_MODEL || 'claude-opus-5';
const DEFAULT_MAX_TOKENS = 16_000;

/**
 * From the seam's blocks to a result, with every reference proven. Pure.
 *
 * ONE UNPROVABLE REF REFUSES THE WHOLE RESULT. A result is never returned with
 * the bindable subset (F8): a reading whose claims were quietly thinned is a
 * different reading from the one the model made, under the same name.
 */
export function resultFromBlocks(
  blocks: readonly StructuredBlock[],
  request: DevelopmentalReaderRequest,
  reader: ReaderIdentity,
): DevelopmentalReaderResult {
  const parsed = parseReaderBlocks(blocks);
  if (!parsed.ok) return refused(parsed.refusal, parsed.detail, parsed.index);
  if (parsed.outcome === 'none') return { outcome: 'none', reader };

  const claims: ReaderClaimDraft[] = [];
  for (const [i, c] of parsed.claims.entries()) {
    const bound = bindEvidence(c.refs, request.evidence);
    if (!bound.ok) {
      return refused('claim_unbindable', `claims[${i}] ${bound.refusal}: ${bound.detail}`, i);
    }
    claims.push({ text: c.text, refs: bound.value.refs, doesNotEstablish: c.doesNotEstablish });
  }
  return { outcome: 'claims', claims: claims as unknown as NonEmptyArray<ReaderClaimDraft>, reader };
}

/** The reader's identity for a given pinned model. `frozenAt` is a store's to stamp — BUILD-07C. */
export function readerIdentity(model: string): ReaderIdentity {
  return { provider: 'anthropic', model, promptHash: promptContractHash(), readerVersion: READER_VERSION };
}

/**
 * One commissioned read: exactly one lens, one frozen evidence object, the
 * prose recovered under it. Returns claims, none, or a typed refusal.
 */
export async function readDevelopmentally(
  request: DevelopmentalReaderRequest,
  opts: ReadOptions = {},
): Promise<DevelopmentalReaderResult> {
  const model = opts.model ?? DEFAULT_MODEL;
  const maxTokens = opts.maxTokens ?? DEFAULT_MAX_TOKENS;

  const valid = validateRequest(request);
  if (!valid.ok) return refused(valid.refusal, valid.detail, valid.index);

  const tool = readerTool();
  const outcome = await runStructured({
    model,
    maxTokens,
    system: READER_SYSTEM,
    tools: [{ name: tool.name, description: tool.description, inputSchema: tool.input_schema }],
    /* She must answer THROUGH the tool. Prose in a text block is not a reading. */
    toolChoice: { type: 'any' },
    messages: [{ role: 'user', content: renderRequest(request) }],
    execution: { completion: 'long-running' },
  });

  if (!outcome.ok) {
    /* The seam's refusal, unchanged. Not a cue to try something else. */
    return refused(outcome.refusal, outcome.detail ?? outcome.refusal);
  }
  const { provenance } = outcome.result;
  if (provenance.provider !== 'anthropic') {
    /* `ReaderIdentity.provider` is the literal the store knows. A provider the
       identity cannot name is a configuration this reader was never ruled for. */
    return refused('not_configured',
      `provider ${String(provenance.provider)} cannot be recorded as this reader's identity`);
  }
  return resultFromBlocks(
    outcome.result.content,
    request,
    /* The model ACTUALLY SENT, from the seam — never the default's name. */
    readerIdentity(provenance.model),
  );
}
