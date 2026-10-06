import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { splitStoredSection } from '@/lib/manuscript/sections/sectionProjection';
import { sectionIdsOf } from '@/lib/manuscript/development/evidenceRef';
import { DEVELOPMENTAL_LENSES } from '@/lib/manuscript/developmentalReader/contract';
import { runStructured } from '@/lib/ai/structured/router';
import type { StructuredBlock } from '@/lib/ai/structured/types';
import { explicitRole } from '@/lib/writersStudio/focus/outlineTree';
import {
  LINEAGE_ORIENTATION_SYSTEM,
  type IntellectualLineageOrientation,
  type IntellectualTerrain,
} from '@/lib/writersStudio/intellectualLineageOrientation';
import type { BibliographyEntry } from '@/lib/writersStudio/intellectualLineageScan';

export const dynamic = 'force-dynamic';

const TOOL = 'return_lineage_orientation';
const MODEL = process.env.MAIA_LINEAGE_ORIENTATION_MODEL
  || process.env.MAIA_LOCAL_STRUCTURED_MODEL
  || 'claude-sonnet-5';

type SectionRow = {
  id: string;
  position: number;
  text: string;
  heading: string | null;
  heading_depth: number | null;
};

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
    (b): b is Extract<StructuredBlock, { type: 'tool_use' }> =>
      b.type === 'tool_use' && b.name === TOOL,
  );
  return calls.length === 1 ? calls[0]!.input : null;
}

function bibliographyEntries(
  sections: readonly { heading: string | null; body: string }[],
): BibliographyEntry[] {
  const start = sections.findIndex((s) => s.heading?.trim().toLowerCase() === 'bibliography');
  if (start < 0) return [];
  const out: BibliographyEntry[] = [];
  let n = 0;
  for (let i = start + 1; i < sections.length; i += 1) {
    const s = sections[i]!;
    if (s.heading?.trim().toLowerCase() === 'additional resources') break;
    for (const rawLine of s.body.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line.startsWith('- ')) continue;
      n += 1;
      out.push({
        key: `B${n}`,
        chapterLabel: s.heading?.trim() || 'Bibliography',
        raw: line.slice(2).trim(),
      });
    }
  }
  return out;
}

function schema(chapterIds: readonly string[], bibliographyKeys: readonly string[]) {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['terrains', 'questionsToInvestigate'],
    properties: {
      terrains: {
        type: 'array',
        minItems: 1,
        maxItems: 6,
        items: {
          type: 'object',
          additionalProperties: false,
          required: [
            'label',
            'description',
            'chapterSectionIds',
            'bibliographyKeys',
            'uncertainty',
          ],
          properties: {
            label: { type: 'string' },
            description: { type: 'string' },
            chapterSectionIds: {
              type: 'array',
              items: { type: 'string', enum: [...chapterIds] },
            },
            bibliographyKeys: {
              type: 'array',
              items: { type: 'string', enum: [...bibliographyKeys] },
            },
            uncertainty: { anyOf: [{ type: 'string' }, { type: 'null' }] },
          },
        },
      },
      questionsToInvestigate: {
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
  const { id: manuscriptId } = await params;

  const current = await query<{ revision_number: number; manuscript_state: string | null }>(
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
    return NextResponse.json({
      error: 'pre_manuscript_requires_prospective_orientation',
    }, { status: 409 });
  }

  const rows = await query<SectionRow>(
    `SELECT ds.id, ds.position, ds.text, ms.heading, ms.heading_depth
       FROM manuscript_draft_sections ds
       JOIN manuscript_working_drafts d ON d.id = ds.draft_id
       LEFT JOIN manuscript_sections ms ON ms.id = ds.source_section_id
      WHERE d.manuscript_id = $1 AND d.member_id = $2
      ORDER BY ds.position ASC`,
    [manuscriptId, memberId],
  );

  const sections = rows.rows.map((row) => {
    const split = splitStoredSection(row.text, row.heading);
    return {
      id: row.id,
      position: row.position,
      heading: row.heading,
      headingDepth: row.heading_depth,
      body: split ? split.body : row.text,
    };
  });

  const wholeScope = sections.map((s) => s.id);
  const chapterRoots = sections.filter(
    (s) => s.headingDepth === 1 && explicitRole(s.heading) === 'chapter',
  );
  const chapterIds = chapterRoots.map((s) => s.id);
  const bibliography = bibliographyEntries(sections);

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
    return NextResponse.json({
      error: 'current_whole_manuscript_readings_required',
    }, { status: 409 });
  }

  const readingIds: string[] = [];
  const observations: Array<{
    lens: string;
    observation: string;
    sectionIds: string[];
    doesNotEstablish: string[];
  }> = [];
  const positionBySection = new Map(sections.map((section) => [section.id, section.position] as const));
  const sampleAcross = <T,>(items: readonly T[], limit: number): T[] => {
    if (items.length <= limit) return [...items];
    const picked: T[] = [];
    const used = new Set<number>();
    for (let i = 0; i < limit; i += 1) {
      const index = Math.round(i * (items.length - 1) / (limit - 1));
      if (!used.has(index)) {
        used.add(index);
        picked.push(items[index]!);
      }
    }
    return picked;
  };

  for (const lens of DEVELOPMENTAL_LENSES) {
    const row = latestByLens.get(lens)!;
    readingIds.push(row.id);
    if (row.outcome !== 'reading' || !Array.isArray(row.observations)) continue;

    const lensObservations = row.observations.map((observation: any) => {
      const ids: string[] = [];
      const refs = Array.isArray(observation.evidenceRefs) ? observation.evidenceRefs : [];
      for (const ref of refs) {
        for (const id of sectionIdsOf(ref)) {
          if (!ids.includes(id)) ids.push(id);
        }
      }
      const firstPosition = ids.length > 0
        ? Math.min(...ids.map((id) => positionBySection.get(id) ?? Number.MAX_SAFE_INTEGER))
        : Number.MAX_SAFE_INTEGER;
      const rawObservation = String(observation.observation ?? '');
      return {
        lens,
        observation: rawObservation.length > 900
          ? rawObservation.slice(0, 900) + '…'
          : rawObservation,
        sectionIds: ids,
        doesNotEstablish: Array.isArray(observation.doesNotEstablish)
          ? observation.doesNotEstablish.map(String)
          : [],
        firstPosition,
      };
    }).sort((a: any, b: any) => a.firstPosition - b.firstPosition);

    for (const observation of sampleAcross(lensObservations, 8)) {
      observations.push({
        lens: observation.lens,
        observation: observation.observation,
        sectionIds: observation.sectionIds,
        doesNotEstablish: observation.doesNotEstablish,
      });
    }
  }

  const structured = await runStructured({
    model: MODEL,
    system: LINEAGE_ORIENTATION_SYSTEM,
    messages: [{
      role: 'user',
      content: [
        'MANUSCRIPT STATE:',
        manuscriptState ?? 'undeclared',
        '',
        'CHAPTER ROOTS:',
        JSON.stringify(chapterRoots.map((chapter) => ({
          sectionId: chapter.id,
          position: chapter.position,
          heading: chapter.heading,
        }))),
        '',
        'WHOLE-MANUSCRIPT DEVELOPMENTAL OBSERVATIONS:',
        JSON.stringify(observations),
        '',
        'BIBLIOGRAPHY ENTRIES:',
        JSON.stringify(bibliography),
      ].join('\n'),
    }],
    maxTokens: 4500,
    tools: [{
      name: TOOL,
      inputSchema: schema(chapterIds, bibliography.map((b) => b.key)),
      description: 'Return macro intellectual terrains and investigation questions only.',
    }],
    toolChoice: { type: 'tool', name: TOOL },
    execution: { completion: 'long-running' },
  });

  if (!structured.ok) {
    console.error('[C15/lineage-orientation] structured refusal', {
      refusal: structured.refusal,
      detail: structured.detail ?? null,
      model: MODEL,
      observationCount: observations.length,
      bibliographyCount: bibliography.length,
    });
    return NextResponse.json(
      { error: structured.refusal, detail: structured.detail ?? null },
      { status: 502 },
    );
  }
  if (structured.result.provenance.modelAgreement !== 'agreed') {
    console.error('[C15/lineage-orientation] model attribution mismatch', {
      requested: structured.result.provenance.model,
      reported: structured.result.provenance.reportedModel,
      agreement: structured.result.provenance.modelAgreement,
    });
    return NextResponse.json({ error: 'model_unattributable' }, { status: 502 });
  }

  const raw = toolInput(structured.result.content);
  if (!raw || typeof raw !== 'object') {
    console.error('[C15/lineage-orientation] tool envelope unreadable', {
      stopReason: structured.result.stopReason,
      blockTypes: structured.result.content.map((block) => block.type),
    });
    return NextResponse.json({ error: 'lineage_orientation_unreadable' }, { status: 502 });
  }
  const payload = raw as {
    terrains?: Omit<IntellectualTerrain, 'id'>[];
    questionsToInvestigate?: string[];
  };
  if (!Array.isArray(payload.terrains) || !Array.isArray(payload.questionsToInvestigate)) {
    console.error('[C15/lineage-orientation] payload shape unreadable', {
      hasTerrains: Array.isArray(payload.terrains),
      hasQuestions: Array.isArray(payload.questionsToInvestigate),
      stopReason: structured.result.stopReason,
    });
    return NextResponse.json({ error: 'lineage_orientation_unreadable' }, { status: 502 });
  }

  const chapterSet = new Set(chapterIds);
  const bibliographySet = new Set(bibliography.map((entry) => entry.key));
  const terrainShapeValid = payload.terrains.every((terrain) =>
    terrain
    && typeof terrain === 'object'
    && typeof terrain.label === 'string'
    && typeof terrain.description === 'string'
    && Array.isArray(terrain.chapterSectionIds)
    && terrain.chapterSectionIds.every((id) => typeof id === 'string' && chapterSet.has(id))
    && Array.isArray(terrain.bibliographyKeys)
    && terrain.bibliographyKeys.every((key) => typeof key === 'string' && bibliographySet.has(key))
    && (terrain.uncertainty === null || typeof terrain.uncertainty === 'string')
  );
  const questionsValid = payload.questionsToInvestigate.every(
    (question) => typeof question === 'string' && question.trim().length > 0,
  );
  if (!terrainShapeValid || !questionsValid) {
    console.error('[C15/lineage-orientation] model returned malformed terrain payload', {
      terrainCount: payload.terrains.length,
      questionsValid,
    });
    return NextResponse.json({ error: 'lineage_orientation_unreadable' }, { status: 502 });
  }

  const orientation: IntellectualLineageOrientation = {
    manuscriptId,
    revisionNumber,
    readingIds,
    bibliographyEntries: bibliography,
    terrains: payload.terrains.map((terrain, index) => ({
      id: `terrain-${index + 1}`,
      ...terrain,
    })),
    questionsToInvestigate: payload.questionsToInvestigate,
  };

  return NextResponse.json({
    orientation,
    manuscriptState,
    provenance: {
      provider: structured.result.provenance.provider,
      model: structured.result.provenance.model,
      reportedModel: structured.result.provenance.reportedModel,
    },
  });
}
