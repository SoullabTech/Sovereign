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
  CHAPTER_LINEAGE_SYSTEM,
  type ChapterLineageCandidate,
  type ChapterLineageScan,
} from '@/lib/writersStudio/intellectualLineageChapter';
import type { BibliographyEntry } from '@/lib/writersStudio/intellectualLineageScan';

export const dynamic = 'force-dynamic';

const TOOL = 'return_chapter_lineage';
const MODEL = process.env.MAIA_LINEAGE_CHAPTER_MODEL || 'claude-opus-5';

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
    const section = sections[i]!;
    if (section.heading?.trim().toLowerCase() === 'additional resources') break;
    for (const rawLine of section.body.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line.startsWith('- ')) continue;
      n += 1;
      out.push({
        key: `B${n}`,
        chapterLabel: section.heading?.trim() || 'Bibliography',
        raw: line.slice(2).trim(),
      });
    }
  }
  return out;
}

function sampleAcross<T>(items: readonly T[], limit: number): T[] {
  if (items.length <= limit) return [...items];
  const out: T[] = [];
  const used = new Set<number>();
  for (let i = 0; i < limit; i += 1) {
    const index = Math.round(i * (items.length - 1) / (limit - 1));
    if (used.has(index)) continue;
    used.add(index);
    out.push(items[index]!);
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
        minItems: 1,
        maxItems: 12,
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['kind', 'statement', 'sectionIds', 'bibliographyKeys', 'why', 'uncertainty'],
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
            statement: { type: 'string' },
            sectionIds: {
              type: 'array',
              minItems: 1,
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
      questionsToInvestigate: {
        type: 'array',
        maxItems: 6,
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

  const raw = await req.json().catch(() => null);
  if (!raw || typeof raw !== 'object' || typeof (raw as any).chapterRootId !== 'string') {
    return NextResponse.json({ error: 'chapterRootId_required' }, { status: 400 });
  }
  const chapterRootId = String((raw as any).chapterRootId);

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
    return NextResponse.json({ error: 'no_written_chapter_lineage_in_pre_manuscript' }, { status: 409 });
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

  const rootIndex = sections.findIndex((section) =>
    section.id === chapterRootId
    && section.headingDepth === 1
    && explicitRole(section.heading) === 'chapter',
  );
  if (rootIndex < 0) {
    return NextResponse.json({ error: 'chapter_root_not_found' }, { status: 404 });
  }

  let end = sections.length;
  for (let i = rootIndex + 1; i < sections.length; i += 1) {
    if (sections[i]!.headingDepth === 1) {
      end = i;
      break;
    }
  }
  let chapterSections = sections.slice(rootIndex, end);
  if (manuscriptState === 'partial-manuscript') {
    chapterSections = chapterSections.filter((section) =>
      section.id === chapterRootId || section.body.trim().length > 0,
    );
  }
  if (chapterSections.length === 0) {
    return NextResponse.json({ error: 'chapter_has_no_written_text' }, { status: 409 });
  }

  const wholeScope = sections.map((section) => section.id);
  const bibliography = bibliographyEntries(sections);
  const chapterHeading = sections[rootIndex]!.heading?.trim() || 'Chapter';
  const chapterBib = bibliography.filter((entry) =>
    entry.chapterLabel.toLowerCase().includes(chapterHeading.toLowerCase())
    || chapterHeading.toLowerCase().includes(entry.chapterLabel.toLowerCase()),
  );

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

  const positionBySection = new Map(sections.map((section) => [section.id, section.position] as const));
  const wholeOrientation: Array<{
    lens: string;
    observation: string;
    sectionIds: string[];
  }> = [];

  for (const lens of DEVELOPMENTAL_LENSES) {
    const row = latestByLens.get(lens);
    if (!row || row.outcome !== 'reading' || !Array.isArray(row.observations)) continue;
    const converted = row.observations.map((observation: any) => {
      const ids: string[] = [];
      for (const ref of Array.isArray(observation.evidenceRefs) ? observation.evidenceRefs : []) {
        for (const id of sectionIdsOf(ref)) {
          if (!ids.includes(id)) ids.push(id);
        }
      }
      const firstPosition = ids.length
        ? Math.min(...ids.map((id) => positionBySection.get(id) ?? Number.MAX_SAFE_INTEGER))
        : Number.MAX_SAFE_INTEGER;
      const text = String(observation.observation ?? '');
      return {
        lens,
        observation: text.length > 650 ? text.slice(0, 650) + '…' : text,
        sectionIds: ids,
        firstPosition,
      };
    }).sort((a: any, b: any) => a.firstPosition - b.firstPosition);

    wholeOrientation.push(...sampleAcross(converted, 2).map(({ firstPosition: _p, ...rest }) => rest));
  }

  type CandidatePayload = Omit<ChapterLineageCandidate, 'id'>;
  const chapterSectionSet = new Set(chapterSections.map((section) => section.id));
  const chapterBibliographySet = new Set(chapterBib.map((entry) => entry.key));
  const kinds = new Set([
    'writer-original',
    'source-derived-claim',
    'quotation',
    'paraphrase',
    'writer-synthesis',
    'uncertain-attribution',
  ]);

  /* C15R2 — complete chapter coverage without one oversized structured act.
     Every prose-bearing section is read exactly once across bounded windows.
     Each window retains the same chapter identity and compact whole-Work
     orientation, then the route merges only fully validated candidates. */
  const windows: typeof chapterSections[] = [];
  let currentWindow: typeof chapterSections = [];
  let currentCharacters = 0;
  for (const section of chapterSections) {
    const chars = section.body.length;
    if (
      currentWindow.length > 0
      && (currentWindow.length >= 12 || currentCharacters + chars > 30_000)
    ) {
      windows.push(currentWindow);
      currentWindow = [];
      currentCharacters = 0;
    }
    currentWindow.push(section);
    currentCharacters += chars;
  }
  if (currentWindow.length > 0) windows.push(currentWindow);

  type WindowScan =
    | {
        ok: true;
        candidates: CandidatePayload[];
        questions: string[];
        provider: string;
        model: string;
        reportedModel: string | null;
      }
    | {
        ok: false;
        error: string;
        detail: Record<string, unknown>;
      };

  async function scanWindow(
    windowSections: typeof chapterSections,
    windowLabel: string,
  ): Promise<WindowScan> {
    const structured = await runStructured({
      model: MODEL,
      system: CHAPTER_LINEAGE_SYSTEM,
      messages: [{
        role: 'user',
        content: [
          'CHAPTER:',
          chapterHeading,
          '',
          `CHAPTER WINDOW: ${windowLabel}`,
          'This is one complete segment of the chapter. Do not infer claims about omitted chapter sections.',
          '',
          'WHOLE-WORK ORIENTATION:',
          JSON.stringify(wholeOrientation),
          '',
          'CHAPTER SECTIONS WITH PROSE IN THIS WINDOW:',
          JSON.stringify(windowSections.map((section) => ({
            sectionId: section.id,
            position: section.position,
            heading: section.heading,
            body: section.body,
          }))),
          '',
          'BIBLIOGRAPHY ENTRIES FILED UNDER THIS CHAPTER:',
          JSON.stringify(chapterBib),
        ].join('\n'),
      }],
      maxTokens: 4000,
      tools: [{
        name: TOOL,
        inputSchema: schema(
          windowSections.map((section) => section.id),
          chapterBib.map((entry) => entry.key),
        ),
        description: 'Return evidence-bound intellectual-lineage candidates from this chapter window. Follow-up questions are optional.',
      }],
      toolChoice: { type: 'tool', name: TOOL },
      execution: { completion: 'long-running' },
    });

    if (!structured.ok) {
      return {
        ok: false,
        error: structured.refusal,
        detail: {
          stage: 'window-structured-refusal',
          window: windowLabel,
          detail: structured.detail ?? null,
        },
      };
    }
    if (structured.result.provenance.modelAgreement !== 'agreed') {
      return {
        ok: false,
        error: 'model_unattributable',
        detail: { stage: 'window-model-attribution', window: windowLabel },
      };
    }

    const input = toolInput(structured.result.content);
    const payload = input && typeof input === 'object'
      ? input as {
          candidates?: CandidatePayload[];
          questionsToInvestigate?: string[];
        }
      : null;

    /* A large window may produce an empty/partial tool envelope even though
       smaller windows are stable. Split only this failed window and preserve
       complete coverage. Nothing is silently dropped. */
    if (!payload || !Array.isArray(payload.candidates)) {
      if (windowSections.length > 1) {
        const midpoint = Math.ceil(windowSections.length / 2);
        const [left, right] = await Promise.all([
          scanWindow(windowSections.slice(0, midpoint), `${windowLabel}.1`),
          scanWindow(windowSections.slice(midpoint), `${windowLabel}.2`),
        ]);
        if (!left.ok) return left;
        if (!right.ok) return right;
        return {
          ok: true,
          candidates: [...left.candidates, ...right.candidates],
          questions: [...left.questions, ...right.questions],
          provider: left.provider || right.provider,
          model: left.model || right.model,
          reportedModel: left.reportedModel ?? right.reportedModel,
        };
      }
      return {
        ok: false,
        error: 'chapter_lineage_unreadable',
        detail: {
          stage: 'window-payload-shape',
          window: windowLabel,
          sectionId: windowSections[0]?.id ?? null,
          stopReason: structured.result.stopReason,
          blockTypes: structured.result.content.map((block) => block.type),
          inputKeys: input && typeof input === 'object'
            ? Object.keys(input as Record<string, unknown>)
            : [],
        },
      };
    }

    const windowSectionSet = new Set(windowSections.map((section) => section.id));
    const candidates: CandidatePayload[] = [];
    for (const rawCandidate of payload.candidates) {
      const candidate = rawCandidate as any;
      const bibliographyKeys = Array.isArray(candidate?.bibliographyKeys)
        ? candidate.bibliographyKeys
        : candidate?.kind === 'writer-original'
          ? []
          : null;
      const valid = Boolean(
        candidate
        && typeof candidate === 'object'
        && kinds.has(candidate.kind)
        && typeof candidate.statement === 'string'
        && candidate.statement.trim().length > 0
        && Array.isArray(candidate.sectionIds)
        && candidate.sectionIds.length > 0
        && candidate.sectionIds.every((id: unknown) => typeof id === 'string' && windowSectionSet.has(id))
        && Array.isArray(bibliographyKeys)
        && bibliographyKeys.every((key: unknown) => typeof key === 'string' && chapterBibliographySet.has(key))
        && typeof candidate.why === 'string'
        && candidate.why.trim().length > 0
        && (candidate.uncertainty === null || typeof candidate.uncertainty === 'string')
      );
      if (!valid) {
        return {
          ok: false,
          error: 'chapter_lineage_unreadable',
          detail: {
            stage: 'window-candidate-validation',
            window: windowLabel,
            candidate,
          },
        };
      }
      candidates.push({
        ...candidate,
        bibliographyKeys,
      } as CandidatePayload);
    }

    const questions = Array.isArray(payload.questionsToInvestigate)
      ? payload.questionsToInvestigate.filter(
          (question): question is string =>
            typeof question === 'string' && question.trim().length > 0,
        ).map((question) => question.trim())
      : [];

    return {
      ok: true,
      candidates,
      questions,
      provider: structured.result.provenance.provider,
      model: structured.result.provenance.model,
      reportedModel: structured.result.provenance.reportedModel,
    };
  }

  const windowResults = await Promise.all(
    windows.map((windowSections, index) =>
      scanWindow(windowSections, String(index + 1)),
    ),
  );

  const mergedCandidates: CandidatePayload[] = [];
  const mergedQuestions: string[] = [];
  let provider = '';
  let model = '';
  let reportedModel: string | null = null;

  for (const result of windowResults) {
    if (!result.ok) {
      return NextResponse.json({
        error: result.error,
        detail: result.detail,
      }, { status: 502 });
    }
    provider ||= result.provider;
    model ||= result.model;
    reportedModel ??= result.reportedModel;
    mergedCandidates.push(...result.candidates);
    for (const question of result.questions) {
      if (!mergedQuestions.includes(question)) mergedQuestions.push(question);
    }
  }

  if (mergedCandidates.length === 0) {
    return NextResponse.json({ error: 'no_chapter_lineage_candidates' }, { status: 409 });
  }

  const deduped = new Map<string, CandidatePayload>();
  for (const candidate of mergedCandidates) {
    const key = [
      candidate.kind,
      [...candidate.sectionIds].sort().join(','),
      candidate.statement.trim().toLowerCase(),
    ].join('::');
    if (!deduped.has(key)) deduped.set(key, candidate);
  }
  const candidates = [...deduped.values()];

  const scan: ChapterLineageScan = {
    manuscriptId,
    revisionNumber,
    chapterRootId,
    chapterHeading,
    sectionIds: chapterSections.map((section) => section.id),
    bibliographyEntries: chapterBib,
    candidates: candidates.map((candidate, index) => ({
      id: `chapter-lineage-${index + 1}`,
      ...candidate,
    })),
    questionsToInvestigate: mergedQuestions.slice(0, 8),
  };

  return NextResponse.json({
    scan,
    manuscriptState,
    provenance: {
      provider,
      model,
      reportedModel,
    },
  });
}
