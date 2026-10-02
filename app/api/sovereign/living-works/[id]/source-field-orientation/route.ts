import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { runStructured } from '@/lib/ai/structured/router';
import type { StructuredBlock } from '@/lib/ai/structured/types';
import {
  SOURCE_FIELD_ORIENTATION_SYSTEM,
  type SourceFieldMaterialRef,
  type SourceFieldOrientation,
  type SourceFieldTerrain,
} from '@/lib/writersStudio/sourceFieldOrientation';

export const dynamic = 'force-dynamic';

const TOOL = 'return_source_field_orientation';
const MODEL = process.env.MAIA_SOURCE_FIELD_MODEL
  || process.env.MAIA_LINEAGE_ORIENTATION_MODEL
  || 'claude-sonnet-5';

const INLINE_MATERIAL_LIMIT = 12_000;

type MaterialRow = {
  material_type: string;
  material_id: string;
  relationship_sentence: string | null;
};

type SourceRow = {
  id: string;
  original_name: string;
  transcription_status: string;
  transcription_reviewed: string | null;
};

type IdeaRow = {
  id: string;
  title: string;
  framing: string | null;
};

type IdeaBlockRow = {
  idea_id: string;
  block_type: string;
  content: string;
  created_at: Date;
};

function oneTool(blocks: readonly StructuredBlock[]): unknown | null {
  const calls = blocks.filter(
    (block): block is Extract<StructuredBlock, { type: 'tool_use' }> =>
      block.type === 'tool_use' && block.name === TOOL,
  );
  return calls.length === 1 ? calls[0]!.input : null;
}

function schema(handles: readonly string[]) {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['terrains', 'possibleDirections'],
    properties: {
      terrains: {
        type: 'array',
        minItems: 1,
        maxItems: 10,
        items: {
          type: 'object',
          additionalProperties: false,
          required: [
            'label',
            'description',
            'materialHandles',
            'tensions',
            'openQuestions',
            'uncertainty',
          ],
          properties: {
            label: { type: 'string' },
            description: { type: 'string' },
            materialHandles: {
              type: 'array',
              minItems: 1,
              items: { type: 'string', enum: [...handles] },
            },
            tensions: {
              type: 'array',
              maxItems: 8,
              items: { type: 'string' },
            },
            openQuestions: {
              type: 'array',
              maxItems: 8,
              items: { type: 'string' },
            },
            uncertainty: { anyOf: [{ type: 'string' }, { type: 'null' }] },
          },
        },
      },
      possibleDirections: {
        type: 'array',
        minItems: 1,
        maxItems: 8,
        items: { type: 'string' },
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
  const { id: workId } = await params;

  const work = await query<{ id: string; manuscript_state: string | null }>(
    `SELECT id, manuscript_state
       FROM living_works
      WHERE id = $1 AND member_id = $2`,
    [workId, memberId],
  );
  if (work.rows.length !== 1) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  if (work.rows[0]!.manuscript_state !== 'pre-manuscript') {
    return NextResponse.json(
      { error: 'source_field_orientation_is_for_pre_manuscript' },
      { status: 409 },
    );
  }

  const materials = await query<MaterialRow>(
    `SELECT material_type, material_id, relationship_sentence
       FROM living_work_materials
      WHERE living_work_id = $1
      ORDER BY declared_at ASC`,
    [workId],
  );

  const sourceIds = materials.rows
    .filter((row) => row.material_type === 'source_upload')
    .map((row) => row.material_id);
  const ideaIds = materials.rows
    .filter((row) => row.material_type === 'idea')
    .map((row) => row.material_id);

  const sources = sourceIds.length > 0
    ? await query<SourceRow>(
        `SELECT id, original_name, transcription_status, transcription_reviewed
           FROM workbench_uploads
          WHERE arranger_id = $1
            AND sanctuary = FALSE
            AND id = ANY($2::uuid[])`,
        [memberId, sourceIds],
      )
    : { rows: [] as SourceRow[] };

  const ideas = ideaIds.length > 0
    ? await query<IdeaRow>(
        `SELECT id, title, framing
           FROM member_ideas
          WHERE member_id = $1
            AND id = ANY($2::uuid[])`,
        [memberId, ideaIds],
      )
    : { rows: [] as IdeaRow[] };

  const ideaBlocks = ideaIds.length > 0
    ? await query<IdeaBlockRow>(
        `SELECT idea_id, block_type, content, created_at
           FROM member_idea_blocks
          WHERE member_id = $1
            AND idea_id = ANY($2::uuid[])
            AND block_type IN ('note','decision','change')
          ORDER BY created_at ASC`,
        [memberId, ideaIds],
      )
    : { rows: [] as IdeaBlockRow[] };

  const sourceById = new Map(sources.rows.map((row) => [row.id, row] as const));
  const ideaById = new Map(ideas.rows.map((row) => [row.id, row] as const));
  const blocksByIdea = new Map<string, IdeaBlockRow[]>();
  for (const block of ideaBlocks.rows) {
    const list = blocksByIdea.get(block.idea_id) ?? [];
    list.push(block);
    blocksByIdea.set(block.idea_id, list);
  }

  const refs: SourceFieldMaterialRef[] = [];
  const packets: Array<{
    handle: string;
    type: 'source-upload' | 'idea';
    label: string;
    relationshipSentence: string | null;
    coverage: 'full' | 'metadata-only';
    content: string | null;
  }> = [];

  for (const material of materials.rows) {
    if (material.material_type === 'source_upload') {
      const source = sourceById.get(material.material_id);
      if (!source) continue;
      const handle = `S:${source.id}`;
      const ref: SourceFieldMaterialRef = {
        type: 'source-upload',
        id: source.id,
        label: source.original_name,
        relationshipSentence: material.relationship_sentence,
      };
      refs.push(ref);

      const reviewed = source.transcription_status === 'reviewed'
        && typeof source.transcription_reviewed === 'string'
        ? source.transcription_reviewed.trim()
        : '';
      packets.push({
        handle,
        type: 'source-upload',
        label: source.original_name,
        relationshipSentence: material.relationship_sentence,
        coverage: reviewed && reviewed.length <= INLINE_MATERIAL_LIMIT ? 'full' : 'metadata-only',
        content: reviewed && reviewed.length <= INLINE_MATERIAL_LIMIT ? reviewed : null,
      });
      continue;
    }

    if (material.material_type === 'idea') {
      const idea = ideaById.get(material.material_id);
      if (!idea) continue;
      const handle = `I:${idea.id}`;
      const ref: SourceFieldMaterialRef = {
        type: 'idea',
        id: idea.id,
        label: idea.title,
        relationshipSentence: material.relationship_sentence,
      };
      refs.push(ref);

      const blocks = blocksByIdea.get(idea.id) ?? [];
      const content = [
        idea.framing ? `Framing: ${idea.framing}` : null,
        ...blocks.map((block) => `${block.block_type}: ${block.content}`),
      ].filter(Boolean).join('\n');
      packets.push({
        handle,
        type: 'idea',
        label: idea.title,
        relationshipSentence: material.relationship_sentence,
        coverage: content.length <= INLINE_MATERIAL_LIMIT ? 'full' : 'metadata-only',
        content: content.length <= INLINE_MATERIAL_LIMIT ? content : null,
      });
    }
  }

  if (packets.length === 0) {
    return NextResponse.json({ error: 'no_declared_sources_or_ideas' }, { status: 409 });
  }

  const structured = await runStructured({
    model: MODEL,
    system: SOURCE_FIELD_ORIENTATION_SYSTEM.join('\n'),
    messages: [{
      role: 'user',
      content: [
        'DECLARED WORK MATERIALS:',
        JSON.stringify(packets),
        '',
        'Coverage is explicit. metadata-only means MAIA has NOT read the material body in this pass.',
        'Orient to the field without pretending unread material has been understood.',
      ].join('\n'),
    }],
    maxTokens: 5000,
    tools: [{
      name: TOOL,
      inputSchema: schema(packets.map((packet) => packet.handle)),
      description: 'Return possible intellectual terrains for this pre-manuscript Work.',
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

  const raw = oneTool(structured.result.content);
  if (!raw || typeof raw !== 'object') {
    return NextResponse.json({ error: 'source_field_orientation_unreadable' }, { status: 502 });
  }
  const payload = raw as {
    terrains?: Array<{
      label: string;
      description: string;
      materialHandles: string[];
      tensions: string[];
      openQuestions: string[];
      uncertainty: string | null;
    }>;
    possibleDirections?: string[];
  };

  if (!Array.isArray(payload.terrains) || !Array.isArray(payload.possibleDirections)) {
    return NextResponse.json({ error: 'source_field_orientation_unreadable' }, { status: 502 });
  }

  const refByHandle = new Map<string, SourceFieldMaterialRef>(
    refs.map((ref) => [`${ref.type === 'source-upload' ? 'S' : 'I'}:${ref.id}`, ref]),
  );

  const terrains: SourceFieldTerrain[] = payload.terrains.map((terrain, index) => ({
    id: `terrain-${index + 1}`,
    label: terrain.label,
    description: terrain.description,
    materialRefs: terrain.materialHandles
      .map((handle) => refByHandle.get(handle))
      .filter((ref): ref is SourceFieldMaterialRef => Boolean(ref)),
    tensions: Array.isArray(terrain.tensions) ? terrain.tensions : [],
    openQuestions: Array.isArray(terrain.openQuestions) ? terrain.openQuestions : [],
    uncertainty: terrain.uncertainty ?? null,
  }));

  if (terrains.some((terrain) => terrain.materialRefs.length === 0)) {
    return NextResponse.json({ error: 'source_field_evidence_unbound' }, { status: 502 });
  }

  const orientation: SourceFieldOrientation = {
    workId,
    orientedAt: new Date().toISOString(),
    materialsConsidered: refs,
    terrains,
    possibleDirections: payload.possibleDirections,
  };

  return NextResponse.json({
    orientation,
    coverage: packets.map((packet) => ({
      type: packet.type,
      id: packet.handle.slice(2),
      coverage: packet.coverage,
    })),
    provenance: {
      provider: structured.result.provenance.provider,
      model: structured.result.provenance.model,
      reportedModel: structured.result.provenance.reportedModel,
    },
  });
}
