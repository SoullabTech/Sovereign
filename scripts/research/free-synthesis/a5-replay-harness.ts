import { createHash, randomUUID } from 'node:crypto';
import {
  assertEvidenceIdentical,
  renderCompactNarrativeContext,
  renderRelationalStructureContext,
  type RenderedA4Context,
} from './a4-context-renderers';
import type { GestaltResearchField } from './a4-gestalt-prototype';

/**
 * JARVIS-MAIA-FREE-SYNTHESIS-01 · A5
 *
 * OFFLINE R&D ONLY.
 *
 * This module deliberately has NO model provider import, NO database import, NO MAIA
 * serving import and NO default execution path. A caller must inject an explicit model
 * function. That separation prevents the research harness from becoming a serving seam.
 */

export type A5ConditionId =
  | 'current_context'
  | 'reduced_direction'
  | 'compact_narrative_gestalt'
  | 'relational_structure_gestalt';

export interface A5ModelSpec {
  readonly provider: string;
  readonly model: string;
  readonly temperature: number;
  readonly maxTokens: number;
}

export interface A5ReplayFixture {
  readonly benchmarkId: string;
  readonly incomingMemberTurn: string;
  /** Existing/current standing system direction, captured as a replay artifact. */
  readonly currentSystemDirection: string;
  /** A3-derived candidate semantic floor. Research text only, not production authority. */
  readonly reducedSystemDirection: string;
  /** Same immediate conversational evidence for all four conditions. */
  readonly sharedRecentContext: string;
  readonly field: GestaltResearchField;
  readonly gestaltId: string;
  readonly model: A5ModelSpec;
}

export interface A5Condition {
  readonly id: A5ConditionId;
  readonly systemPrompt: string;
  readonly userInput: string;
  readonly model: A5ModelSpec;
  readonly contextChars: number;
  readonly contextDigest: string;
  readonly evidenceRootIds?: readonly string[];
  readonly evidenceLedgerDigest?: string;
}

export interface A5ReplayModelResult {
  readonly text: string;
  readonly provider: string;
  readonly model: string;
  readonly latencyMs: number;
  readonly usage?: {
    readonly inputTokens?: number;
    readonly outputTokens?: number;
    readonly totalTokens?: number;
  };
}

export interface A5ReplayResult {
  readonly runId: string;
  readonly benchmarkId: string;
  readonly conditionId: A5ConditionId;
  readonly conditionDigest: string;
  readonly provider: string;
  readonly model: string;
  readonly temperature: number;
  readonly maxTokens: number;
  readonly inputChars: number;
  readonly outputChars: number;
  readonly latencyMs: number;
  readonly usage?: A5ReplayModelResult['usage'];
  readonly text: string;
}

export type A5ModelCaller = (args: {
  readonly systemPrompt: string;
  readonly userInput: string;
  readonly model: A5ModelSpec;
  readonly conditionId: A5ConditionId;
}) => Promise<A5ReplayModelResult>;

const digest = (text: string): string =>
  createHash('sha256').update(text).digest('hex');

function nonBlank(name: string, value: string): void {
  if (!value.trim()) throw new Error(`A5 fixture ${name} must be non-blank`);
}

function composeSystem(direction: string, recentContext: string, historical?: string): string {
  return [
    direction.trim(),
    '',
    '--- REPLAY RECENT CONTEXT ---',
    recentContext.trim(),
    ...(historical
      ? ['', '--- REPLAY HISTORICAL / GESTALT CONTEXT ---', historical.trim()]
      : []),
  ].join('\n');
}

function renderedEvidenceDigest(rendered: RenderedA4Context): string {
  return digest(rendered.evidenceLedger);
}

/**
 * Build four conditions while exposing exactly what differs.
 *
 * C and D are representation-identical at the primary-evidence layer.
 * A/B and B/C are intentionally NOT evidence-identical experiments; their causal contrast
 * is different and is reported explicitly in the A5 programme record.
 */
export function buildA5Conditions(fixture: A5ReplayFixture): readonly A5Condition[] {
  nonBlank('benchmarkId', fixture.benchmarkId);
  nonBlank('incomingMemberTurn', fixture.incomingMemberTurn);
  nonBlank('currentSystemDirection', fixture.currentSystemDirection);
  nonBlank('reducedSystemDirection', fixture.reducedSystemDirection);
  nonBlank('sharedRecentContext', fixture.sharedRecentContext);
  nonBlank('model.provider', fixture.model.provider);
  nonBlank('model.model', fixture.model.model);

  if (!Number.isFinite(fixture.model.temperature)) throw new Error('A5 model temperature must be finite');
  if (!Number.isInteger(fixture.model.maxTokens) || fixture.model.maxTokens <= 0) {
    throw new Error('A5 maxTokens must be a positive integer');
  }

  const narrative = renderCompactNarrativeContext(fixture.field, fixture.gestaltId);
  const relational = renderRelationalStructureContext(fixture.field, fixture.gestaltId);
  assertEvidenceIdentical(narrative, relational);

  const currentPrompt = composeSystem(
    fixture.currentSystemDirection,
    fixture.sharedRecentContext,
  );
  const reducedPrompt = composeSystem(
    fixture.reducedSystemDirection,
    fixture.sharedRecentContext,
  );
  const narrativePrompt = composeSystem(
    fixture.reducedSystemDirection,
    fixture.sharedRecentContext,
    narrative.text,
  );
  const relationalPrompt = composeSystem(
    fixture.reducedSystemDirection,
    fixture.sharedRecentContext,
    relational.text,
  );

  const shared = {
    userInput: fixture.incomingMemberTurn,
    model: fixture.model,
  } as const;

  return [
    {
      id: 'current_context',
      ...shared,
      systemPrompt: currentPrompt,
      contextChars: currentPrompt.length,
      contextDigest: digest(currentPrompt),
    },
    {
      id: 'reduced_direction',
      ...shared,
      systemPrompt: reducedPrompt,
      contextChars: reducedPrompt.length,
      contextDigest: digest(reducedPrompt),
    },
    {
      id: 'compact_narrative_gestalt',
      ...shared,
      systemPrompt: narrativePrompt,
      contextChars: narrativePrompt.length,
      contextDigest: digest(narrativePrompt),
      evidenceRootIds: narrative.evidenceRootIds,
      evidenceLedgerDigest: renderedEvidenceDigest(narrative),
    },
    {
      id: 'relational_structure_gestalt',
      ...shared,
      systemPrompt: relationalPrompt,
      contextChars: relationalPrompt.length,
      contextDigest: digest(relationalPrompt),
      evidenceRootIds: relational.evidenceRootIds,
      evidenceLedgerDigest: renderedEvidenceDigest(relational),
    },
  ];
}

export interface A5Preflight {
  readonly ok: boolean;
  readonly conditionCount: number;
  readonly sameIncomingTurn: boolean;
  readonly sameModelSpec: boolean;
  readonly distinctConditionContexts: boolean;
  readonly narrativeRelationalEvidenceIdentical: boolean;
  readonly narrativeRelationalEvidenceDigest?: string;
  readonly contrasts: readonly [string, string, string][];
}

/** Prove replay comparability before a paid or local model is called. */
export function preflightA5Conditions(conditions: readonly A5Condition[]): A5Preflight {
  if (conditions.length !== 4) throw new Error(`A5 requires exactly four conditions; received ${conditions.length}`);

  const byId = new Map(conditions.map((condition) => [condition.id, condition] as const));
  const expected: A5ConditionId[] = [
    'current_context',
    'reduced_direction',
    'compact_narrative_gestalt',
    'relational_structure_gestalt',
  ];
  for (const id of expected) if (!byId.has(id)) throw new Error(`A5 condition missing: ${id}`);

  const userInputs = new Set(conditions.map((condition) => condition.userInput));
  const modelSpecs = new Set(conditions.map((condition) => JSON.stringify(condition.model)));
  const contextDigests = new Set(conditions.map((condition) => condition.contextDigest));

  const narrative = byId.get('compact_narrative_gestalt')!;
  const relational = byId.get('relational_structure_gestalt')!;
  const sameEvidenceIds = JSON.stringify(narrative.evidenceRootIds) === JSON.stringify(relational.evidenceRootIds);
  const sameEvidenceDigest = Boolean(
    narrative.evidenceLedgerDigest &&
    narrative.evidenceLedgerDigest === relational.evidenceLedgerDigest,
  );

  const result: A5Preflight = {
    ok:
      userInputs.size === 1 &&
      modelSpecs.size === 1 &&
      contextDigests.size === 4 &&
      sameEvidenceIds &&
      sameEvidenceDigest,
    conditionCount: conditions.length,
    sameIncomingTurn: userInputs.size === 1,
    sameModelSpec: modelSpecs.size === 1,
    distinctConditionContexts: contextDigests.size === 4,
    narrativeRelationalEvidenceIdentical: sameEvidenceIds && sameEvidenceDigest,
    narrativeRelationalEvidenceDigest: narrative.evidenceLedgerDigest,
    contrasts: [
      ['current_context', 'reduced_direction', 'instruction pressure; same recent context'],
      ['reduced_direction', 'compact_narrative_gestalt', 'historical Gestalt availability; compact organization'],
      ['compact_narrative_gestalt', 'relational_structure_gestalt', 'representation organization only; primary evidence identical'],
    ],
  };

  if (!result.ok) throw new Error(`A5 preflight failed: ${JSON.stringify(result)}`);
  return result;
}

/**
 * Execute only through an injected caller. No provider fallback is permitted: if the
 * returned provider/model differs from the pinned spec, the run is refused.
 */
export async function runA5Replay(
  fixture: A5ReplayFixture,
  caller: A5ModelCaller,
  orderedConditionIds?: readonly A5ConditionId[],
): Promise<readonly A5ReplayResult[]> {
  const conditions = buildA5Conditions(fixture);
  preflightA5Conditions(conditions);
  const byId = new Map(conditions.map((condition) => [condition.id, condition] as const));
  const order = orderedConditionIds ?? conditions.map((condition) => condition.id);

  if (new Set(order).size !== 4 || order.length !== 4) {
    throw new Error('A5 execution order must contain each of the four conditions exactly once');
  }

  const results: A5ReplayResult[] = [];
  for (const id of order) {
    const condition = byId.get(id);
    if (!condition) throw new Error(`unknown A5 condition in execution order: ${id}`);
    const response = await caller({
      systemPrompt: condition.systemPrompt,
      userInput: condition.userInput,
      model: condition.model,
      conditionId: condition.id,
    });

    if (response.provider !== fixture.model.provider || response.model !== fixture.model.model) {
      throw new Error(
        `A5 same-model violation in ${condition.id}: expected ${fixture.model.provider}/${fixture.model.model}, ` +
        `received ${response.provider}/${response.model}`,
      );
    }

    results.push({
      runId: randomUUID(),
      benchmarkId: fixture.benchmarkId,
      conditionId: condition.id,
      conditionDigest: condition.contextDigest,
      provider: response.provider,
      model: response.model,
      temperature: fixture.model.temperature,
      maxTokens: fixture.model.maxTokens,
      inputChars: condition.systemPrompt.length + condition.userInput.length,
      outputChars: response.text.length,
      latencyMs: response.latencyMs,
      usage: response.usage,
      text: response.text,
    });
  }

  return results;
}
