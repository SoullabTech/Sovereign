import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { splitStoredSection } from '@/lib/manuscript/sections/sectionProjection';
import { runStructured } from '@/lib/ai/structured/router';
import type { StructuredBlock } from '@/lib/ai/structured/types';
import {
  LINEAGE_SCAN_SYSTEM,
  type BibliographyEntry,
  type IntellectualLineageScan,
  type LineageCandidate,
  type LineageScanSection,
} from '@/lib/writersStudio/intellectualLineageScan';

export const dynamic = 'force-dynamic';

const TOOL = 'return_lineage_scan';
const MODEL = process.env.MAIA_LINEAGE_MODEL
  || process.env.MAIA_DEVELOPMENTAL_READER_MODEL
  || 'claude-opus-5';

type SectionRow = {
  id: string;
  position: number;
  text: string;
  heading: string | null;
};

type WorkStateRow = {
  manuscript_state: 'pre-manuscript' | 'partial-manuscript' | 'existing-manuscript' | null;
};

function toolInput(blocks: readonly StructuredBlock[]): unknown | null {
  const calls = blocks.filter(
    (b): b is Extract<StructuredBlock, { type: 'tool_use' }> =>
      b.type === 'tool_use' && b.name === TOOL,
  );
  return calls.length === 1 ? calls[0]!.input : null;
}

function bibliographyEntries(sections: readonly LineageScanSection[]): BibliographyEntry[] {
  const start = sections.findIndex((s) => s.heading?.trim().toLowerCase() === 'bibliography');
  if (start < 0) return [];
  const out: BibliographyEntry[] = [];
  let n = 0;
  for (let i = start + 1; i < sections.length; i += 1) {
    const s = sections[i]!;
    if (s.heading?.trim().toLowerCase() === 'additional resources') break;
    const lines = s.body.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
    for (const line of lines) {
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

function schema(sectionIds: readonly string[], bibliographyKeys: readonly string[]) {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['candidates'],
    properties: {
      candidates: {
        type: 'array',
        maxItems: 80,
        items: {
          type: 'object',
          additionalProperties: false,
          required: [
            'kind', 'standing', 'statement', 'manuscriptSectionIds',
            'bibliographyKeys', 'why', 'uncertainty',
          ],
          properties: {
            kind: {
              type: 'string',
              enum: [
                'writer-original',
                'source-derived-claim',
                'quotation',
                'paraphrase',
                'writer-synthesis',
                'uncertain-attribution',
              ],
            },
            standing: {
              type: 'string',
              enum: [
                'evidenced-in-manuscript',
                'relevant-to-planned-work',
                'prospective-research-direction',
                'unresolved',
              ],
            },
            statement: { type: 'string' },
            manuscriptSectionIds: {
              type: 'array',
              items: { type: 'string', enum: [...sectionIds] },
            },
            bibliographyKeys: {
              type: 'array',
              items: { type: 'string', enum: [...bibliographyKeys] },
            },
            why: { type: 'string' },
            uncertainty: { anyOf: [{ type: 'string' }, { type: 'null' }] },
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

  const workState = await query<WorkStateRow>(
    `SELECT w.manuscript_state
       FROM living_work_expressions e
       JOIN living_works w ON w.id = e.living_work_id
      WHERE e.expression_type = 'manuscript'
        AND e.expression_id = $1
        AND w.member_id = $2
      LIMIT 1`,
    [manuscriptId, memberId],
  );
  if (workState.rows.length !== 1) {
    return NextResponse.json({ error: 'work_unresolved' }, { status: 404 });
  }
  const declaredState = workState.rows[0]!.manuscript_state;
  if (declaredState === 'pre-manuscript') {
    return NextResponse.json({
      error: 'pre_manuscript_has_no_manuscript_lineage_scan',
      detail: 'Use prospective source/research discovery instead.',
    }, { status: 409 });
  }

  const revision = await query<{ revision_number: number }>(
    `SELECT r.revision_number
       FROM manuscript_working_drafts d
       JOIN working_draft_revisions r ON r.draft_id = d.id
      WHERE d.manuscript_id = $1 AND d.member_id = $2
      ORDER BY r.revision_number DESC
      LIMIT 1`,
    [manuscriptId, memberId],
  );
  if (revision.rows.length !== 1) {
    return NextResponse.json({ error: 'working_draft_revision_required' }, { status: 409 });
  }

  const rows = await query<SectionRow>(
    `SELECT ds.id, ds.position, ds.text, ms.heading
       FROM manuscript_draft_sections ds
       JOIN manuscript_working_drafts d ON d.id = ds.draft_id
       LEFT JOIN manuscript_sections ms ON ms.id = ds.source_section_id
      WHERE d.manuscript_id = $1 AND d.member_id = $2
      ORDER BY ds.position ASC`,
    [manuscriptId, memberId],
  );

  const allSections: LineageScanSection[] = rows.rows.map((row) => {
    const split = splitStoredSection(row.text, row.heading);
    return {
      sectionId: row.id,
      position: row.position,
      heading: row.heading,
      body: split ? split.body : row.text,
    };
  });

  const scannedSections = declaredState === 'partial-manuscript'
    ? allSections.filter((s) => s.body.trim().length > 0)
    : allSections;

  if (scannedSections.length === 0) {
    return NextResponse.json({ error: 'no_written_manuscript_text' }, { status: 409 });
  }

  const bibliography = bibliographyEntries(allSections);
  const structured = await runStructured({
    model: MODEL,
    system: [
      LINEAGE_SCAN_SYSTEM,
      declaredState === 'partial-manuscript'
        ? 'This is a PARTIAL manuscript. Make claims only about the written sections supplied. Do not treat missing or planned material as written.'
        : 'This is an EXISTING manuscript. You may reason across the whole supplied manuscript.',
    ].join('\n\n'),
    messages: [{
      role: 'user',
      content: [
        'MANUSCRIPT SECTIONS:',
        JSON.stringify(scannedSections),
        '',
        'BIBLIOGRAPHY ENTRIES:',
        JSON.stringify(bibliography),
      ].join('\n'),
    }],
    maxTokens: 12000,
    tools: [{
      name: TOOL,
      inputSchema: schema(
        scannedSections.map((s) => s.sectionId),
        bibliography.map((b) => b.key),
      ),
      description: 'Return evidence-bound intellectual-lineage candidates only.',
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
  if (!raw || typeof raw !== 'object' || !Array.isArray((raw as any).candidates)) {
    return NextResponse.json({ error: 'lineage_scan_unreadable' }, { status: 502 });
  }

  const candidates = (raw as { candidates: Omit<LineageCandidate, 'id'>[] }).candidates
    .map((candidate, index) => ({ id: `lineage-${index + 1}`, ...candidate }));

  const scan: IntellectualLineageScan = {
    manuscriptId,
    revisionNumber: Number(revision.rows[0]!.revision_number),
    scannedSectionIds: scannedSections.map((s) => s.sectionId),
    bibliographyEntries: bibliography,
    candidates,
  };

  return NextResponse.json({
    scan,
    declaredState,
    provenance: {
      provider: structured.result.provenance.provider,
      model: structured.result.provenance.model,
      reportedModel: structured.result.provenance.reportedModel,
    },
  });
}
