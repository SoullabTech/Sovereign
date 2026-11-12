/**
 * The whole-manuscript synthesis (MAIA's editorial pass, or a chapter overview), in ONE place, used by the attention-map route and by
 * the server-side editorial pass run (relational architecture step 4). Moved here unchanged from the route so that the route and the
 * run can never produce two different syntheses from the same readings.
 */
import { query } from '@/lib/db/postgres';
import { loadReading } from '@/lib/manuscript/developmentalReading/store';
import type { DevelopmentalReading } from '@/lib/manuscript/developmentalReading/contract';
import { DEVELOPMENTAL_LENSES, type DevelopmentalLens } from '@/lib/manuscript/developmentalReader/contract';
import { sectionIdsOf } from '@/lib/manuscript/development/evidenceRef';
import { runStructured } from '@/lib/ai/structured/router';
import type { StructuredBlock } from '@/lib/ai/structured/types';
import {
  ATTENTION_SYNTHESIS_VERSION,
  attentionSynthesisSystem,
  buildAttentionMap,
  type AttentionSynthesisCommission,
  type AttentionSynthesisResult,
  type FrozenAttentionObservation,
} from '@/lib/writersStudio/studio/attentionMapSynthesis';
import { validateAttentionMap, type WholeManuscriptAttentionMap } from '@/lib/writersStudio/studio/attentionMap';
import { writerUnderstandingContextForManuscript } from '@/lib/writersStudio/writerUnderstandingServer';
import { holdsWholeWork } from '@/lib/auth/entitlements';
import { WHOLE_WORK_REFUSAL } from '@/lib/writersStudio/wholeWorkAccess';

const TOOL = 'return_attention_map';
const MODEL = process.env.MAIA_ATTENTION_MAP_MODEL
  || process.env.MAIA_DEVELOPMENTAL_READER_MODEL
  || 'claude-opus-5';

const strings = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string' && x.length > 0);

function oneTool(blocks: readonly StructuredBlock[]): unknown | null {
  const calls = blocks.filter(
    (b): b is Extract<StructuredBlock, { type: 'tool_use' }> =>
      b.type === 'tool_use' && b.name === TOOL,
  );
  return calls.length === 1 ? calls[0]!.input : null;
}
function inputSchemaFor(evidenceRefs: readonly string[]) {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['version', 'items'],
    properties: {
      version: { type: 'string', enum: [ATTENTION_SYNTHESIS_VERSION] },
      items: {
        type: 'array',
        minItems: 1,
        maxItems: 24,
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['band', 'scale', 'label', 'notice', 'whyItMatters', 'uncertainty', 'evidenceRefs'],
          properties: {
            band: { type: 'string', enum: ['begin-here', 'next', 'later', 'watch'] },
            scale: { type: 'string', enum: ['whole-work', 'part', 'chapter', 'section', 'passage'] },
            label: { type: 'string' },
            notice: { type: 'string' },
            whyItMatters: { type: 'string' },
            uncertainty: { anyOf: [{ type: 'string' }, { type: 'null' }] },
            evidenceRefs: {
              type: 'array',
              minItems: 1,
              items: { type: 'string', enum: [...evidenceRefs] },
            },
          },
        },
      },
    },
  } as const;
}

/** Generous enough for a whole-book letter; an answer that still hits it is refused as incomplete, never used. */
export const SYNTHESIS_MAX_TOKENS = 32_000;

export type SynthesisOutcome =
  | { ok: true; map: WholeManuscriptAttentionMap; deepMode: boolean; revisionNumber: number; readingIds: string[];
      provenance: { provider: unknown; model: unknown; reportedModel: unknown } }
  | { ok: false; status: number; error: string; detail?: unknown };

export async function synthesizeAttentionMap(memberId: string, manuscriptId: string, readingIdsIn: readonly string[], request: string): Promise<SynthesisOutcome> {
  const readingIds = [...new Set(readingIdsIn)];
  const deepLenses = DEVELOPMENTAL_LENSES.filter((lens) => lens !== 'overview');
  if (readingIds.length !== 1 && readingIds.length !== deepLenses.length) {
    return { ok: false, status: 409, error: 'overview_or_complete_eight_lens_set_required' };
  }

  const current = await query<{ revision_number: number }>(
    `SELECT r.revision_number
       FROM manuscript_working_drafts d
       JOIN working_draft_revisions r ON r.draft_id = d.id
      WHERE d.manuscript_id = $1 AND d.member_id = $2
      ORDER BY r.revision_number DESC
      LIMIT 1`,
    [manuscriptId, memberId],
  );
  if (current.rows.length !== 1) {
    return { ok: false, status: 409, error: 'working_draft_revision_required' };
  }
  const revisionNumber = Number(current.rows[0]!.revision_number);

  const readings: DevelopmentalReading[] = [];
  for (const id of readingIds) {
    const reading = await loadReading(id, memberId);
    if (!reading || reading.manuscriptId !== manuscriptId) {
      return { ok: false, status: 409, error: 'reading_mismatch' };
    }
    readings.push(reading);
  }

  const lenses = new Set(readings.map((r) => r.scope.commissionedLens));
  const overviewMode = readings.length === 1 && readings[0]!.scope.commissionedLens === 'overview';
  const deepMode = readings.length === deepLenses.length
    && deepLenses.every((lens) => lenses.has(lens));
  if (!overviewMode && !deepMode) {
    return { ok: false, status: 409, error: 'overview_or_complete_eight_lens_set_required' };
  }
  /* Free / Pro line (founder ruling 2026-11-11): the eight-lens synthesis is always whole-book (scope enforced below), so it is the
     whole-book editorial pass and needs `writing.wholeWork`. Here, so the route and the server run are gated by the same check.
     Overview mode serves chapter work and stays open. Refused before any model call; a failed lookup is 503, never "not Pro". */
  if (deepMode) {
    const entitled = await holdsWholeWork(memberId).catch(() => null);
    if (entitled === null) return { ok: false, status: 503, error: 'entitlement_unavailable' };
    if (!entitled) return { ok: false, status: 403, error: WHOLE_WORK_REFUSAL };
  }
  if (readings.some((r) => r.readState.revisionNumber !== revisionNumber)) {
    return { ok: false, status: 409, error: 'current_revision_moved' };
  }

  const firstScope = JSON.stringify(readings[0]!.scope.bodyScope);
  if (readings.some((r) => JSON.stringify(r.scope.bodyScope) !== firstScope)) {
    return { ok: false, status: 409, error: 'scope_mismatch' };
  }
  const sectionRows = await query<{ id: string }>(
    `SELECT ds.id
       FROM manuscript_draft_sections ds
       JOIN manuscript_working_drafts d ON d.id = ds.draft_id
      WHERE d.manuscript_id = $1 AND d.member_id = $2
      ORDER BY ds.position ASC`,
    [manuscriptId, memberId],
  );
  const wholeScope = sectionRows.rows.map((row) => row.id);
  if (deepMode && JSON.stringify(readings[0]!.scope.bodyScope) !== JSON.stringify(wholeScope)) {
    return { ok: false, status: 409, error: 'whole_manuscript_scope_required' };
  }

  const observations: FrozenAttentionObservation[] = [];
  let synthesisIndex = 0;
  for (const reading of readings) {
    if (reading.outcome !== 'reading') continue;
    for (const observation of reading.observations) {
      const sectionIds: string[] = [];
      for (const ref of observation.evidenceRefs) {
        for (const sectionId of sectionIdsOf(ref)) {
          if (!sectionIds.includes(sectionId)) sectionIds.push(sectionId);
        }
      }
      synthesisIndex += 1;
      observations.push({
        synthesisRef: `E${synthesisIndex}`,
        readingId: reading.id,
        observationKey: observation.key,
        lens: observation.lens as DevelopmentalLens,
        sectionIds,
        observation: observation.observation,
        doesNotEstablish: observation.doesNotEstablish,
      });
    }
  }
  if (observations.length === 0) {
    return { ok: false, status: 409, error: 'no_observations_to_synthesize' };
  }

  const commissionedAt = new Date().toISOString();
  const commission: AttentionSynthesisCommission = {
    manuscriptId,
    revisionNumber,
    commissionedAt,
    readingIds,
    observations,
    request,
  };
  const authorContext = await writerUnderstandingContextForManuscript(memberId, manuscriptId);
  const structured = await runStructured({
    model: MODEL,
    system: [
      attentionSynthesisSystem(overviewMode ? 'overview' : 'deep'),
      authorContext
        ? [
            authorContext,
            'Use declared context only to interpret editorial significance and tradeoffs.',
            'It may explain that an unusual pattern is intentional. It may also reveal a conflict between the manuscript and the writer’s stated intention.',
            'It does not erase or rewrite frozen observations, and it never becomes evidence that the manuscript itself says something.',
          ].join('\n')
        : '',
    ].filter(Boolean).join('\n\n'),
    messages: [{
      role: 'user',
      content: [
        'WRITER REQUEST:',
        commission.request,
        '',
        'FROZEN OBSERVATIONS:',
        JSON.stringify(commission.observations),
      ].join('\n'),
    }],
    /* EA walk 2026-11-12: a nine-reading whole-book letter outgrew 8,000 tokens and came back cut off mid-item. */
    maxTokens: SYNTHESIS_MAX_TOKENS,
    tools: [{
      name: TOOL,
      inputSchema: inputSchemaFor(observations.map((observation) => observation.synthesisRef)),
      description: 'Return the evidence-bound whole-manuscript attention map.',
    }],
    toolChoice: { type: 'tool', name: TOOL },
    execution: { completion: 'long-running' },
  });

  if (!structured.ok) {
    return { ok: false, status: 502, error: structured.refusal, detail: structured.detail ?? null };
  }
  if (structured.result.provenance.modelAgreement !== 'agreed') {
    return { ok: false, status: 502, error: 'model_unattributable' };
  }

  /* A reply cut off at the token ceiling is incomplete: its last item may be half-written. Refuse it by name; never build from it. */
  const stop = (structured.result as { stopReason?: string | null }).stopReason ?? null;
  if (stop === 'max_tokens' || stop === 'model_context_window_exceeded') {
    console.warn('[attention-map] synthesis incomplete', { stopReason: stop, observations: observations.length });
    return { ok: false, status: 502, error: 'attention_map_incomplete' };
  }
  const input = oneTool(structured.result.content);
  if (!input || typeof input !== 'object') {
    return { ok: false, status: 502, error: 'attention_map_unreadable' };
  }

  let map;
  try {
    map = buildAttentionMap(commission, input as AttentionSynthesisResult);
  } catch (err) {
    /* Counts and shape only — never manuscript text. */
    const items = Array.isArray((input as { items?: unknown }).items) ? (input as { items: unknown[] }).items : null;
    console.warn('[attention-map] synthesis unbound', {
      reason: err instanceof Error ? err.message : 'unknown', stopReason: stop, observations: observations.length,
      items: items ? items.length : 'missing',
      itemsWithRefs: items ? items.filter((i) => Array.isArray((i as { evidenceRefs?: unknown })?.evidenceRefs)).length : 0,
    });
    return { ok: false, status: 502, error: 'attention_map_unbound_evidence' };
  }
  if (map.droppedUnbound) console.warn('[attention-map] synthesis dropped unbound items', { dropped: map.droppedUnbound, kept: map.items.length });
  const valid = validateAttentionMap(map);
  if (!valid.ok) {
    return { ok: false, status: 502, error: valid.reason };
  }

  return {
    ok: true, map, deepMode, revisionNumber, readingIds,
    provenance: {
      provider: structured.result.provenance.provider,
      model: structured.result.provenance.model,
      reportedModel: structured.result.provenance.reportedModel,
    },
  };
}
