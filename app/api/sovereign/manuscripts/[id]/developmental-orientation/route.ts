import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { DEVELOPMENTAL_LENSES } from '@/lib/manuscript/developmentalReader/contract';
import { sectionIdsOf } from '@/lib/manuscript/development/evidenceRef';
import { runStructured } from '@/lib/ai/structured/router';
import type { StructuredBlock } from '@/lib/ai/structured/types';
import { writerUnderstandingContextForManuscript } from '@/lib/writersStudio/writerUnderstandingServer';
import {
  DEVELOPMENTAL_ORIENTATION_SYSTEM,
  DEVELOPMENTAL_MOVE_IDS,
  type DevelopmentalOrientation,
  type DevelopmentalMovementReflection,
  type DevelopmentalEvidenceRef,
} from '@/lib/writersStudio/developmentalOrientation';
import { DEVELOPMENTAL_MOVEMENTS } from '@/lib/writersStudio/workDevelopment';

export const dynamic = 'force-dynamic';

const TOOL = 'return_developmental_orientation';
const MODEL = process.env.MAIA_DEVELOPMENTAL_ORIENTATION_MODEL
  || process.env.MAIA_LOCAL_STRUCTURED_MODEL
  || process.env.MAIA_ATTENTION_MAP_MODEL
  || 'claude-opus-5';

type ReadingRow = {
  id: string;
  commissioned_lens: string;
  scope: any;
  observations: any;
  outcome: 'reading' | 'none';
  frozen_at: Date;
};

function toolInput(blocks: readonly StructuredBlock[]): unknown | null {
  const calls = blocks.filter(
    (block): block is Extract<StructuredBlock, { type: 'tool_use' }> =>
      block.type === 'tool_use' && block.name === TOOL,
  );
  return calls.length === 1 ? calls[0]!.input : null;
}

function inputSchema(evidenceRefs: readonly string[]) {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['movements'],
    properties: {
      movements: {
        type: 'array',
        minItems: 1,
        maxItems: 3,
        items: {
          type: 'object',
          additionalProperties: false,
          required: [
            'movement',
            'label',
            'reflection',
            'whyItMayMatter',
            'uncertainty',
            'evidenceRefs',
            'suggestedMoves',
            'questionForWriter',
          ],
          properties: {
            movement: { type: 'string', enum: [...DEVELOPMENTAL_MOVEMENTS] },
            label: { type: 'string' },
            reflection: { type: 'string' },
            whyItMayMatter: { type: 'string' },
            uncertainty: { anyOf: [{ type: 'string' }, { type: 'null' }] },
            evidenceRefs: {
              type: 'array',
              minItems: 1,
              items: { type: 'string', enum: [...evidenceRefs] },
            },
            suggestedMoves: {
              type: 'array',
              minItems: 1,
              maxItems: 5,
              uniqueItems: true,
              items: { type: 'string', enum: [...DEVELOPMENTAL_MOVE_IDS] },
            },
            questionForWriter: { type: 'string' },
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

  const current = await query<{
    revision_number: number;
    manuscript_state: string | null;
  }>(
    `SELECT r.revision_number, w.manuscript_state
       FROM manuscript_working_drafts d
       JOIN working_draft_revisions r ON r.draft_id = d.id
       JOIN living_work_expressions e
         ON e.expression_type = 'manuscript' AND e.expression_id = d.manuscript_id
       JOIN living_works w ON w.id = e.living_work_id AND w.member_id = d.member_id
      WHERE d.manuscript_id = $1 AND d.member_id = $2
      ORDER BY r.revision_number DESC
      LIMIT 1`,
    [manuscriptId, memberId],
  );
  if (current.rows.length !== 1) {
    return NextResponse.json({ error: 'working_draft_revision_required' }, { status: 409 });
  }

  const revisionNumber = Number(current.rows[0]!.revision_number);
  const manuscriptState = current.rows[0]!.manuscript_state;

  if (manuscriptState === 'pre-manuscript') {
    return NextResponse.json(
      { error: 'pre_manuscript_has_no_whole_manuscript_orientation' },
      { status: 409 },
    );
  }

  const sections = await query<{ id: string; text: string }>(
    `SELECT ds.id, ds.text
       FROM manuscript_draft_sections ds
       JOIN manuscript_working_drafts d ON d.id = ds.draft_id
      WHERE d.manuscript_id = $1 AND d.member_id = $2
      ORDER BY ds.position ASC`,
    [manuscriptId, memberId],
  );
  const wholeScope = sections.rows.map((row) => row.id);
  const totalCharacters = sections.rows.reduce((sum, row) => sum + row.text.length, 0);
  if (wholeScope.length === 0 || totalCharacters === 0) {
    return NextResponse.json({ error: 'manuscript_text_required' }, { status: 409 });
  }

  const readingRows = await query<ReadingRow>(
    `SELECT id, commissioned_lens, scope, observations, outcome, frozen_at
       FROM developmental_readings
      WHERE manuscript_id = $1
        AND member_id = $2
        AND revision_number = $3
      ORDER BY frozen_at DESC`,
    [manuscriptId, memberId, revisionNumber],
  );

  const latestByLens = new Map<string, ReadingRow>();
  for (const row of readingRows.rows) {
    if (latestByLens.has(row.commissioned_lens)) continue;
    const bodyScope = Array.isArray(row.scope?.bodyScope) ? row.scope.bodyScope : [];
    if (JSON.stringify(bodyScope) !== JSON.stringify(wholeScope)) continue;
    latestByLens.set(row.commissioned_lens, row);
  }

  if (DEVELOPMENTAL_LENSES.some((lens) => !latestByLens.has(lens))) {
    return NextResponse.json(
      { error: 'current_whole_manuscript_readings_required' },
      { status: 409 },
    );
  }

  const canonical = new Map<string, {
    readingId: string;
    observationKey: string;
    lens: string;
    sectionIds: string[];
    observation: string;
  }>();
  const observations: Array<{
    ref: string;
    lens: string;
    observation: string;
    sectionIds: string[];
    doesNotEstablish: string[];
  }> = [];

  let refIndex = 0;
  for (const lens of DEVELOPMENTAL_LENSES) {
    const row = latestByLens.get(lens)!;
    if (row.outcome !== 'reading' || !Array.isArray(row.observations)) continue;

    for (const observation of row.observations) {
      const sectionIds: string[] = [];
      const refs = Array.isArray(observation.evidenceRefs) ? observation.evidenceRefs : [];
      for (const ref of refs) {
        for (const sectionId of sectionIdsOf(ref)) {
          if (!sectionIds.includes(sectionId)) sectionIds.push(sectionId);
        }
      }
      if (sectionIds.length === 0) continue;
      refIndex += 1;
      const ref = `E${refIndex}`;
      const record = {
        readingId: row.id,
        observationKey: String(observation.key ?? ''),
        lens: String(observation.lens ?? lens),
        sectionIds,
        observation: String(observation.observation ?? ''),
      };
      canonical.set(ref, record);
      observations.push({
        ref,
        lens: record.lens,
        observation: record.observation,
        sectionIds,
        doesNotEstablish: Array.isArray(observation.doesNotEstablish)
          ? observation.doesNotEstablish.map(String)
          : [],
      });
    }
  }

  if (observations.length === 0) {
    return NextResponse.json({ error: 'no_observations_to_reflect_on' }, { status: 409 });
  }

  const authorContext = await writerUnderstandingContextForManuscript(memberId, manuscriptId);
  const structured = await runStructured({
    model: MODEL,
    system: [
      ...DEVELOPMENTAL_ORIENTATION_SYSTEM,
      authorContext
        ? [
            authorContext,
            'The writer-declared context may clarify what they are trying to preserve, challenge, or keep open.',
            'It may shape the reflection but is not manuscript evidence and must not be treated as one.',
          ].join('\n')
        : '',
    ].filter(Boolean).join('\n\n'),
    messages: [{
      role: 'user',
      content: [
        `MANUSCRIPT STATE: ${manuscriptState ?? 'undeclared'}`,
        `CURRENT REVISION: ${revisionNumber}`,
        `SECTIONS PRESENT: ${wholeScope.length}`,
        `TEXT CHARACTERS PRESENT: ${totalCharacters}`,
        '',
        'FROZEN WHOLE-MANUSCRIPT OBSERVATIONS:',
        JSON.stringify(observations),
        '',
        'Reflect on what developmental movements may be active in the Work now.',
        'Keep the whole Work primary and leave several ways forward open to the writer.',
      ].join('\n'),
    }],
    maxTokens: 5000,
    tools: [{
      name: TOOL,
      inputSchema: inputSchema(observations.map((observation) => observation.ref)),
      description: 'Return 1–3 evidence-bound developmental movement reflections and optional ways forward.',
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

  const raw = toolInput(structured.result.content);
  if (!raw || typeof raw !== 'object') {
    return NextResponse.json({ error: 'developmental_orientation_unreadable' }, { status: 502 });
  }
  const payload = raw as { movements?: Array<{
    movement: DevelopmentalMovementReflection['movement'];
    label: string;
    reflection: string;
    whyItMayMatter: string;
    uncertainty: string | null;
    evidenceRefs: string[];
    suggestedMoves: DevelopmentalMovementReflection['suggestedMoves'];
    questionForWriter: string;
  }> };

  if (!Array.isArray(payload.movements) || payload.movements.length < 1 || payload.movements.length > 3) {
    return NextResponse.json({ error: 'developmental_orientation_unreadable' }, { status: 502 });
  }

  const movements: DevelopmentalMovementReflection[] = [];
  for (const [index, movement] of payload.movements.entries()) {
    if (!DEVELOPMENTAL_MOVEMENTS.includes(movement.movement)) {
      return NextResponse.json({ error: 'developmental_movement_invalid' }, { status: 502 });
    }
    if (!Array.isArray(movement.evidenceRefs) || movement.evidenceRefs.length === 0) {
      return NextResponse.json({ error: 'developmental_evidence_required' }, { status: 502 });
    }
    const evidence: DevelopmentalEvidenceRef[] = [];
    for (const ref of movement.evidenceRefs) {
      const source = canonical.get(ref);
      if (!source) {
        return NextResponse.json({ error: 'developmental_evidence_unbound' }, { status: 502 });
      }
      evidence.push(source);
    }
    const suggestedMoves = Array.isArray(movement.suggestedMoves)
      ? movement.suggestedMoves.filter((move) => DEVELOPMENTAL_MOVE_IDS.includes(move))
      : [];
    if (suggestedMoves.length === 0) {
      return NextResponse.json({ error: 'developmental_next_moves_required' }, { status: 502 });
    }
    movements.push({
      id: `movement-${index + 1}`,
      movement: movement.movement,
      label: movement.label,
      reflection: movement.reflection,
      whyItMayMatter: movement.whyItMayMatter,
      uncertainty: movement.uncertainty,
      evidence,
      suggestedMoves,
      questionForWriter: movement.questionForWriter,
      provenance: 'maia-observed',
    });
  }

  const orientation: DevelopmentalOrientation = {
    manuscriptId,
    revisionNumber,
    manuscriptState,
    reflectedAt: new Date().toISOString(),
    movements,
  };

  return NextResponse.json({
    orientation,
    provenance: {
      provider: structured.result.provenance.provider,
      model: structured.result.provenance.model,
      reportedModel: structured.result.provenance.reportedModel,
    },
  });
}
