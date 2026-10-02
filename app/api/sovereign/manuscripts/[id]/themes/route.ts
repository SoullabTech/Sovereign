/**
 * D5C5 — Writer's Studio Themes live boundary.
 *
 * GET projects only already-frozen evidence and member-governed Theme state.
 * POST performs explicit governance acts. Neither method commissions cognition.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { loadLiveWork } from '@/lib/manuscript/development/capture';
import { assessReading } from '@/lib/manuscript/developmentalReading/assess';
import { loadReading } from '@/lib/manuscript/developmentalReading/store';
import type { DevelopmentalReading } from '@/lib/manuscript/developmentalReading/contract';
import {
  declareMemberTheme,
  governMaiaThemeCandidate,
  governWorkTheme,
  listWorkThemeOccurrences,
  listWorkThemes,
} from '@/lib/writersStudio/themes/store';
import { deriveMaiaThemeOccurrences } from '@/lib/writersStudio/themes/occurrences';
import { projectThemePresence } from '@/lib/writersStudio/themes/projection';
import type {
  LiveGovernedTheme,
  LiveThemeCandidate,
  LiveThemeSection,
  LiveThemesPayload,
  ThemeMutation,
  ThemeSourceState,
} from '@/lib/writersStudio/themes/liveTypes';

export const dynamic = 'force-dynamic';
async function ownsWork(manuscriptId: string, memberId: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `SELECT id FROM member_manuscripts WHERE id = $1 AND member_id = $2`,
    [manuscriptId, memberId],
  );
  return rows.rows.length === 1;
}

async function currentSections(
  manuscriptId: string,
  memberId: string,
): Promise<LiveThemeSection[]> {
  const rows = await query<{
    id: string; position: number; heading: string | null;
  }>(
    `SELECT s.id, s.position, ms.heading
       FROM manuscript_draft_sections s
       JOIN manuscript_working_drafts d ON d.id = s.draft_id
       JOIN member_manuscripts m ON m.id = d.manuscript_id
       LEFT JOIN manuscript_sections ms ON ms.id = s.source_section_id
      WHERE d.manuscript_id = $1 AND m.member_id = $2
      ORDER BY s.position ASC`,
    [manuscriptId, memberId],
  );
  return rows.rows.map((row, index) => ({
    sectionId: row.id,
    position: row.position,
    label: row.heading?.trim() || `Section ${index + 1}`,
  }));
}
async function themeReadingIds(
  manuscriptId: string,
  memberId: string,
): Promise<string[]> {
  const rows = await query<{ id: string }>(
    `SELECT id
       FROM developmental_readings
      WHERE manuscript_id = $1 AND member_id = $2
        AND commissioned_lens = 'themes'
      ORDER BY frozen_at DESC, id DESC
      LIMIT 50`,
    [manuscriptId, memberId],
  );
  return rows.rows.map((row) => row.id);
}

function sourceState(
  reading: DevelopmentalReading | null,
  observationId: string | null,
  assessment: ReturnType<typeof assessReading> | null,
): ThemeSourceState {
  if (!reading || !observationId || !assessment) return 'not-evidenced';
  if (reading.outcome !== 'reading') return assessment.reading.state;
  const observation = reading.observations.find((item) => item.observationId === observationId);
  if (!observation) return 'unmeasured';
  return assessment.observations[observation.key]?.state ?? 'unmeasured';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const { id: manuscriptId } = await params;
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (!(await ownsWork(manuscriptId, memberId))) {
    return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  }

  const [sections, themes, occurrences, readingIds, liveWork] = await Promise.all([
    currentSections(manuscriptId, memberId),
    listWorkThemes(memberId, manuscriptId),
    listWorkThemeOccurrences(memberId, manuscriptId),
    themeReadingIds(manuscriptId, memberId),
    loadLiveWork(manuscriptId, memberId),
  ]);

  const requiredReadingIds = new Set(readingIds);
  for (const theme of themes) {
    if (theme.sourceReadingId) requiredReadingIds.add(theme.sourceReadingId);
  }
  const loaded = await Promise.all(
    [...requiredReadingIds].map(async (id) => [id, await loadReading(id, memberId)] as const),
  );
  const readings = new Map<string, DevelopmentalReading>();
  for (const [id, reading] of loaded) {
    if (reading) readings.set(id, reading);
  }
  const assessments = new Map<string, ReturnType<typeof assessReading>>();
  for (const [id, reading] of readings) {
    assessments.set(id, assessReading(reading, liveWork));
  }

  const governedBySource = new Set(
    themes
      .filter((theme) => theme.sourceReadingId && theme.sourceObservationId)
      .map((theme) => `${theme.sourceReadingId}:${theme.sourceObservationId}`),
  );
  const sectionById = new Map(sections.map((section) => [section.sectionId, section]));

  const candidates: LiveThemeCandidate[] = [];
  for (const id of readingIds) {
    const reading = readings.get(id);
    if (!reading || reading.outcome !== 'reading') continue;
    const assessment = assessments.get(id) ?? null;
    for (const observation of reading.observations) {
      if (!observation.themeLabel?.trim()) continue;
      if (governedBySource.has(`${id}:${observation.observationId}`)) continue;
      const derived = deriveMaiaThemeOccurrences(reading, observation);
      if (!derived.ok) continue;
      const state = assessment?.observations[observation.key]?.state ?? 'unmeasured';
      candidates.push({
        readingId: id,
        observationId: observation.observationId,
        observationKey: observation.key,
        label: observation.themeLabel.trim(),
        observation: observation.observation,
        frozenAt: reading.provenance.frozenAt,
        sourceState: state,
        evidence: derived.occurrences.map((occurrence) => ({
          sectionId: occurrence.sectionId,
          label: sectionById.get(occurrence.sectionId)?.label ?? 'Earlier section',
          range: occurrence.range,
          currentAddress: state === 'current' && sectionById.has(occurrence.sectionId),
        })),
        coverage: {
          read: Object.values(reading.coverage.sections).filter((depth) => depth === 'body').length,
          total: reading.readState.sectionTopology.length,
        },
      });
    }
  }

  const liveThemes: LiveGovernedTheme[] = themes.map((theme) => {
    const reading = theme.sourceReadingId ? readings.get(theme.sourceReadingId) ?? null : null;
    const assessment = theme.sourceReadingId ? assessments.get(theme.sourceReadingId) ?? null : null;
    const state = sourceState(reading, theme.sourceObservationId, assessment);
    const themeOccurrences = occurrences.filter((occurrence) => occurrence.themeId === theme.id);
    const projection = state === 'current' && reading
      ? projectThemePresence({
          theme,
          occurrences: themeOccurrences,
          sourceReading: reading,
          currentSections: sections,
        })
      : null;
    return {
      id: theme.id,
      label: theme.currentLabel,
      provenance: theme.provenance,
      standing: theme.standing,
      sourceState: theme.sourceReadingId ? state : 'not-evidenced',
      sourceReadingId: theme.sourceReadingId,
      sourceObservationId: theme.sourceObservationId,
      frozenAt: reading?.provenance.frozenAt ?? null,
      evidence: themeOccurrences.map((occurrence) => ({
        sectionId: occurrence.sectionId,
        label: sectionById.get(occurrence.sectionId)?.label ?? 'Earlier section',
        range: occurrence.range,
        currentAddress: state === 'current' && sectionById.has(occurrence.sectionId),
      })),
      projection: projection ? {
        cells: projection.cells,
        trajectory: projection.trajectory,
        coverage: projection.coverage,
        historicalUnmappedOccurrenceCount: projection.historicalUnmappedOccurrenceCount,
      } : null,
    };
  });

  const payload: LiveThemesPayload = {
    manuscriptId,
    sections,
    themes: liveThemes,
    candidates,
  };
  return NextResponse.json(payload);
}

function stringField(body: Record<string, unknown>, key: string): string | null {
  const value = body[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const { id: manuscriptId } = await params;
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (!(await ownsWork(manuscriptId, memberId))) {
    return NextResponse.json({ refusal: 'not_found' }, { status: 404 });
  }

  const body: unknown = await req.json().catch(() => null);
  if (!isRecord(body) || typeof body.action !== 'string') {
    return NextResponse.json({ refusal: 'malformed' }, { status: 400 });
  }
  const action = body.action as ThemeMutation['action'];

  if (action === 'declare') {
    const label = stringField(body, 'label');
    if (!label) return NextResponse.json({ refusal: 'invalid_label' }, { status: 400 });
    const out = await declareMemberTheme({ memberId, manuscriptId, label });
    return out.ok
      ? NextResponse.json({ ok: true, themeId: out.themeId }, { status: 201 })
      : NextResponse.json({ refusal: out.refusal }, { status: out.refusal === 'not_found' ? 404 : 400 });
  }

  if (action === 'accept-candidate' || action === 'rename-candidate' || action === 'reject-candidate') {
    const readingId = stringField(body, 'readingId');
    const observationId = stringField(body, 'observationId');
    if (!readingId || !observationId) {
      return NextResponse.json({ refusal: 'malformed' }, { status: 400 });
    }
    const governanceAction =
      action === 'accept-candidate' ? 'accept'
        : action === 'reject-candidate' ? 'reject'
          : 'rename';
    const label = action === 'rename-candidate' ? stringField(body, 'label') : null;
    if (action === 'rename-candidate' && !label) {
      return NextResponse.json({ refusal: 'invalid_label' }, { status: 400 });
    }
    const out = await governMaiaThemeCandidate({
      memberId,
      manuscriptId,
      readingId,
      observationId,
      action: governanceAction,
      ...(label ? { label } : {}),
    });
    return out.ok
      ? NextResponse.json({ ok: true, themeId: out.themeId })
      : NextResponse.json(
          { refusal: out.refusal },
          { status: out.refusal === 'not_found' ? 404 : 400 },
        );
  }

  if (action === 'rename-theme' || action === 'reject-theme' || action === 'restore-theme') {
    const themeId = stringField(body, 'themeId');
    if (!themeId) return NextResponse.json({ refusal: 'malformed' }, { status: 400 });
    const governanceAction =
      action === 'rename-theme' ? 'rename'
        : action === 'reject-theme' ? 'reject'
          : 'restore';
    const label = action === 'rename-theme' ? stringField(body, 'label') : null;
    if (action === 'rename-theme' && !label) {
      return NextResponse.json({ refusal: 'invalid_label' }, { status: 400 });
    }
    const out = await governWorkTheme({
      memberId,
      manuscriptId,
      themeId,
      action: governanceAction,
      ...(label ? { label } : {}),
    });
    return out.ok
      ? NextResponse.json({ ok: true })
      : NextResponse.json(
          { refusal: out.refusal },
          { status: out.refusal === 'not_found' ? 404 : 400 },
        );
  }

  return NextResponse.json({ refusal: 'invalid_action' }, { status: 400 });
}
