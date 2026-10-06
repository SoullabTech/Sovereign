import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
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
import { validateAttentionMap } from '@/lib/writersStudio/studio/attentionMap';
import { writerUnderstandingContextForManuscript } from '@/lib/writersStudio/writerUnderstandingServer';

export const dynamic = 'force-dynamic';

const TOOL = 'return_attention_map';
const MODEL = process.env.MAIA_ATTENTION_MAP_MODEL
  || process.env.MAIA_LOCAL_STRUCTURED_MODEL
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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const { id: manuscriptId } = await params;

  const raw = await req.json().catch(() => null);
  if (!raw || typeof raw !== 'object') {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }
  const body = raw as Record<string, unknown>;
  if (!strings(body.readingIds) || typeof body.request !== 'string') {
    return NextResponse.json({ error: 'readingIds_and_request_required' }, { status: 400 });
  }
  const readingIds = [...new Set(body.readingIds)];
  const deepLenses = DEVELOPMENTAL_LENSES.filter((lens) => lens !== 'overview');
  if (readingIds.length !== 1 && readingIds.length !== deepLenses.length) {
    return NextResponse.json({ error: 'overview_or_complete_eight_lens_set_required' }, { status: 409 });
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
    return NextResponse.json({ error: 'working_draft_revision_required' }, { status: 409 });
  }
  const revisionNumber = Number(current.rows[0]!.revision_number);

  const readings: DevelopmentalReading[] = [];
  for (const id of readingIds) {
    const reading = await loadReading(id, memberId);
    if (!reading || reading.manuscriptId !== manuscriptId) {
      return NextResponse.json({ error: 'reading_mismatch' }, { status: 409 });
    }
    readings.push(reading);
  }

  const lenses = new Set(readings.map((r) => r.scope.commissionedLens));
  const overviewMode = readings.length === 1 && readings[0]!.scope.commissionedLens === 'overview';
  const deepMode = readings.length === deepLenses.length
    && deepLenses.every((lens) => lenses.has(lens));
  if (!overviewMode && !deepMode) {
    return NextResponse.json({ error: 'overview_or_complete_eight_lens_set_required' }, { status: 409 });
  }
  if (readings.some((r) => r.readState.revisionNumber !== revisionNumber)) {
    return NextResponse.json({ error: 'current_revision_moved' }, { status: 409 });
  }

  const firstScope = JSON.stringify(readings[0]!.scope.bodyScope);
  if (readings.some((r) => JSON.stringify(r.scope.bodyScope) !== firstScope)) {
    return NextResponse.json({ error: 'scope_mismatch' }, { status: 409 });
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
    return NextResponse.json({ error: 'whole_manuscript_scope_required' }, { status: 409 });
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
    return NextResponse.json({ error: 'no_observations_to_synthesize' }, { status: 409 });
  }

  const commissionedAt = new Date().toISOString();
  const commission: AttentionSynthesisCommission = {
    manuscriptId,
    revisionNumber,
    commissionedAt,
    readingIds,
    observations,
    request: body.request,
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
    maxTokens: 8000,
    tools: [{
      name: TOOL,
      inputSchema: inputSchemaFor(observations.map((observation) => observation.synthesisRef)),
      description: 'Return the evidence-bound whole-manuscript attention map.',
    }],
    toolChoice: { type: 'tool', name: TOOL },
    execution: { completion: 'long-running' },
  });

  if (!structured.ok) {
    return NextResponse.json(
      { error: structured.refusal, detail: structured.detail ?? null },
      { status: 502 },
    );
  }
  if (structured.result.provenance.modelAgreement !== 'agreed') {
    return NextResponse.json({ error: 'model_unattributable' }, { status: 502 });
  }

  const input = oneTool(structured.result.content);
  if (!input || typeof input !== 'object') {
    return NextResponse.json({ error: 'attention_map_unreadable' }, { status: 502 });
  }

  let map;
  try {
    map = buildAttentionMap(commission, input as AttentionSynthesisResult);
  } catch {
    return NextResponse.json({ error: 'attention_map_unbound_evidence' }, { status: 502 });
  }
  const valid = validateAttentionMap(map);
  if (!valid.ok) {
    return NextResponse.json({ error: valid.reason }, { status: 502 });
  }

  return NextResponse.json({
    map,
    provenance: {
      provider: structured.result.provenance.provider,
      model: structured.result.provenance.model,
      reportedModel: structured.result.provenance.reportedModel,
      readingIds,
    },
  });
}
