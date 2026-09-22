 'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';
import { AppearanceMenu } from '../atmosphere/AppearanceMenu';
import { useCanvasSurfaceVariables } from '../atmosphere/StudioAtmosphere';
import { StudioModeBar } from '../studio/StudioModeBar';
import { SERIF, SANS } from '../studioTheme';
import { useLivingWorks } from '../useLivingWorks';
import { useStudioSources } from '../useStudioSources';
import { SOURCE_INTAKE_HREF } from '../studioMap';
import { currentWork, resolveWorkContext } from '../workContext';
import { fetchStructure, refusalCopy as structureRefusalCopy, type StructureNodeDTO, type StructureTreeDTO } from '@/lib/writersStudio/structureClient';
import RebuildWritingBoundary from './RebuildWritingBoundary';
import RebuildAuthoredBody from './RebuildAuthoredBody';
import GoldLine from '../insight/GoldLine';
import MaiaListen from '../insight/MaiaListen';
import InlineWorkspace from '../insight/InlineWorkspace';
import ManuscriptPassage, { type EditAction, type MarkedEdit } from '../insight/ManuscriptPassage';
import { editorialSegments, editIds, composeSelected } from '@/lib/writersStudio/editorialDiff';
import {
  DEFAULT_EDITORIAL_DEPTH, DEPTH_CHOICES, editorialDirective, type EditorialDepth,
} from '@/lib/writersStudio/editorialDepth';
import InsightReadings from '../insight/InsightReadings';
import { appendEditorialNote } from '@/lib/writersStudio/editorialApproaches';
import RevisionDesk, { type MemberRevisionDraft } from '../insight/RevisionDesk';
import { useEditingLatitude } from '../insight/EditingLatitude';
import { INSIGHT_READING, INSIGHT_OBSERVATION, type InsightPassage } from '@/lib/writersStudio/insightCanvas';
import { INSIGHT_READING, INSIGHT_OBSERVATION, loadCanvasInsight, type CanvasInsight, type InsightPassage } from '@/lib/writersStudio/insightCanvas';
import type { SectionWriting } from '@/lib/writersStudio/useSectionWriting';
import { asOutline, chapterSpanFor, isConfirmedChapterRoot, wordCount, type RebuildSection } from '@/lib/writersStudio/rebuild/model';
import type { OutlineNode } from '@/lib/writersStudio/focus/outlineTree';
import { DEVELOPMENTAL_LENSES, type DevelopmentalLens } from '@/lib/manuscript/developmentalReader/contract';
import { focusOn, focusRequest, composerPrompt } from '@/lib/writersStudio/focus/studioFocus';
import {
  runChapterReview, rehydrateChapterReview, findingsForSection, lensCounts,
  type ChapterReviewBundle,
} from '@/lib/writersStudio/rebuild/chapterReview';
import {
  loadChapterReviewManifest, saveChapterReviewManifest,
} from '@/lib/writersStudio/rebuild/chapterReviewManifest';
import { canvasWithEditorialThread, canvasWithoutEditorialThread, CANVAS_EDITORIAL_THREAD_PARAM } from '../canvasIdentity';
import { locationForSection, replacePlaceAddress, SECTION_PARAM } from '@/lib/writersStudio/placeInWork';
import {
  adoptBoundEditorialVersion, changedSpan, discoverEditorialRelationships, exactVersion,
  locateUniquePassage, openBoundEditorialPassage, openBoundEditorialThread,
  readBoundEditorialThread, sendBoundEditorialTurn,
  type AdoptionWireOutcome, type RebuildEditorialRelationship, type RebuildEditorialThread,
} from '@/lib/writersStudio/rebuild/editorialCollaboration';

interface ContextReady {
  state: 'section_aware';
  manuscriptId: string;
  title: string | null;
  version: number;
  updatedAt: string;
  sections: RebuildSection[];
}
type ContextPayload = ContextReady | { state: 'no_draft' | 'continuous'; manuscriptId: string; title: string | null };
type Phase = 'loading' | 'ready' | 'unauthorized' | 'error';
type MaiaMode = 'chapter' | 'passage';
type PassageTab = 'interpret' | 'suggest' | 'explore' | 'ask';
interface PassageSelection {
  draftSectionId: string; start: number; end: number; text: string; revisionNumber: number;
}

const C = {
  shell: 'var(--ws-ground-base, #F2F0EA)',
  panel: 'var(--ws-ground-raised, #EAE6DC)',
  field: 'var(--ws-ground-field, #F7F4ED)',
  active: 'var(--ws-ground-active, #DED5C0)',
  ink: 'var(--ws-ink-primary, #26231E)',
  secondary: 'var(--ws-ink-secondary, #4C473E)',
  muted: 'var(--ws-ink-muted, #766E61)',
  quiet: 'var(--ws-ink-quiet, #9A9185)',
  rule: 'var(--ws-rule, #CFC7B8)',
  soft: 'var(--ws-rule-soft, #DDD6CA)',
  gold: 'var(--ws-gold-text, #8A6727)',
  goldFill: 'var(--ws-gold-fill, #CDBD91)',
};

function labelWithoutPrefix(h: string | null): string {
  if (!h) return 'Untitled section';
  return h.replace(/^Chapter\s+\d+\s*:\s*/i, '').trim() || h;
}

function selectionFromThread(
  section: RebuildSection | null, version: number | null, thread: RebuildEditorialThread,
): PassageSelection | null {
  if (!section || version === null || thread.targetSectionId !== section.draftSectionId) return null;
  if (thread.locusText === section.body) return null;
  const located = locateUniquePassage(section.body, thread.locusText);
  return located ? {
    draftSectionId: section.draftSectionId,
    start: located.start, end: located.end, text: thread.locusText, revisionNumber: version,
  } : null;
}

function ImportedStructureBranch({
  node, focusId, onSelect, level = 0,
}: {
  node: OutlineNode; focusId: string | null;
  onSelect: (id: string, role: OutlineNode['role']) => void; level?: number;
}) {
  const containsFocus = node.draftSectionId === focusId || node.children.some((child) => child.draftSectionId === focusId || child.children.some((grand) => grand.draftSectionId === focusId));
  const [expanded, setExpanded] = useState(level === 0 || containsFocus);
  useEffect(() => { if (containsFocus) setExpanded(true); }, [containsFocus]);
  const label = node.heading ?? `Section ${node.position + 1}`;
  const roleLabel = node.role === 'part' ? 'Part' : node.role === 'chapter' ? 'Chapter' : node.depth === 2 ? 'Section' : node.depth === 3 ? 'Subsection' : 'Section';
  return (
    <div data-imported-structure-node={node.draftSectionId}>
      <div style={{ display: 'grid', gridTemplateColumns: '22px minmax(0,1fr)', alignItems: 'start' }}>
        <button type="button" aria-label={node.children.length ? (expanded ? 'Collapse' : 'Expand') : undefined}
          disabled={node.children.length === 0} onClick={() => node.children.length && setExpanded((value) => !value)}
          style={{ border: 0, background: 'transparent', color: C.quiet, padding: '8px 1px', cursor: node.children.length ? 'pointer' : 'default', opacity: node.children.length ? .8 : 0 }}>
          {expanded ? '⌄' : '›'}
        </button>
        <button type="button" onClick={() => onSelect(node.draftSectionId, node.role)}
          style={{ width: '100%', textAlign: 'left', border: 0, borderLeft: node.draftSectionId === focusId ? `3px solid ${C.gold}` : '3px solid transparent', borderRadius: 7, background: node.draftSectionId === focusId ? C.active : 'transparent', color: C.secondary, padding: `7px 8px 7px ${7 + level * 11}px`, cursor: 'pointer' }}>
          <span style={{ display: 'block', fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: node.role === 'chapter' ? C.gold : C.quiet, marginBottom: 2 }}>{roleLabel}</span>
          <span style={{ display: 'block', fontSize: node.role === 'chapter' ? 12.5 : 11.5, fontWeight: node.role === 'chapter' ? 700 : 500, lineHeight: 1.3 }}>{label}</span>
        </button>
      </div>
      {expanded && node.children.length > 0 && (
        <div style={{ marginLeft: 8 }}>
          {node.children.map((child) => (
            <ImportedStructureBranch key={child.draftSectionId} node={child} focusId={focusId} onSelect={onSelect} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function AuthoredStructureBranch({
  node, focusId, onSelect, level = 0,
}: {
  node: StructureNodeDTO; focusId: string | null;
  onSelect: (sectionId: string) => void; level?: number;
}) {
  const containsFocus = focusId ? node.derivedSectionIds.includes(focusId) : false;
  const firstSection = node.derivedSectionIds[0] ?? node.sectionIds[0] ?? null;
  const label = node.title ?? node.kind ?? 'Untitled division';
  const unit = (
    <>
      <span style={{ fontSize: 9.5, letterSpacing: '.12em', textTransform: 'uppercase', color: C.quiet, display: 'block', marginBottom: 2 }}>
        {node.kind ?? 'Division'}
      </span>
      <span>{label}</span>
    </>
  );
  if (node.children.length === 0) {
    return (
      <button type="button" disabled={!firstSection} onClick={() => firstSection && onSelect(firstSection)}
        data-authored-structure-unit={node.id}
        style={{ width: '100%', textAlign: 'left', border: 0, borderLeft: containsFocus ? `3px solid ${C.gold}` : '3px solid transparent', borderRadius: 7, background: containsFocus ? C.active : 'transparent', color: C.secondary, padding: `7px 9px 7px ${9 + level * 12}px`, cursor: firstSection ? 'pointer' : 'default' }}>
        {unit}
      </button>
    );
  }
  return (
    <details data-authored-structure-unit={node.id}>
      <summary style={{ cursor: 'pointer', marginLeft: 14 + level * 12, padding: '7px 5px', color: C.secondary }}>
        {unit}
      </summary>
      <div style={{ marginLeft: 4 }}>
        {node.children.map((child) => (
          <AuthoredStructureBranch key={child.id} node={child} focusId={focusId} onSelect={onSelect} level={level + 1} />
        ))}
      </div>
    </details>
  );
}

/**
 * ⭐⭐ ALL SIX COMMISSION STAGES, PLUS FETCH, PLUS THE UNKNOWN CASE.
 *
 * ⚠️ The first version of this mapped three of them, so `read`, `classify` and
 * `store` still collapsed into the generic sentence — a partial taxonomy that
 * LOOKED complete, which is worse than none, because it reads as though the
 * unnamed cases cannot happen.
 *
 * ⛔ WHERE the reading was lost, ⛔ never the internals of why: no schema,
 * provider, constraint or stack ever reaches the page.
 */
const FAILED_AT: Record<string, string> = {
  capture: 'Could not open the Work',
  recover: 'Could not open the Work',
  read: 'Could not finish this reading',
  classify: 'Read, but findings not prepared',
  freeze: 'Read, but not finalized',
  store: 'Read, but not recorded',
  fetch: 'Read, but not loaded back',
};

const FAILURE_SENTENCE: Record<string, string> = {
  capture: 'MAIA could not open this part of your Work to read it, so this lens did not run. Nothing was changed.',
  recover: 'MAIA could not open this part of your Work to read it, so this lens did not run. Nothing was changed.',
  read: 'MAIA could not finish reading with this lens. Nothing from it was kept, and nothing in your Work changed.',
  classify: 'MAIA finished reading with this lens, but its findings could not be prepared, so none were kept. Your Work is unchanged.',
  freeze: 'MAIA finished reading with this lens, but the result could not be finalized, so nothing from it was kept. Your Work is unchanged.',
  store: 'MAIA finished reading with this lens, but the result could not be recorded, so nothing from it was kept. Your Work is unchanged.',
  fetch: 'This lens completed, but its reading could not be loaded back. Nothing from it is shown, and nothing in your Work changed.',
  /* ⛔ The honest floor: we do not know where it was lost, and ⛔ saying so
     beats naming a stage we did not observe. */
  '': 'The result of this reading could not be confirmed, so nothing from it was kept. Your Work is unchanged.',
};

export default function RebuildStudioClient() {
  const params = useSearchParams();
  const requested = params?.get('m') ?? null;
  const requestedSection = params?.get(SECTION_PARAM) ?? null;
  const requestedEditorialThread = params?.get(CANVAS_EDITORIAL_THREAD_PARAM) ?? null;
  const [phase, setPhase] = useState<Phase>('loading');
  const [context, setContext] = useState<ContextReady | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [maiaMode, setMaiaMode] = useState<MaiaMode>('chapter');
  const [canvasExpanded, setCanvasExpanded] = useState(false);
  const [writingEpoch, setWritingEpoch] = useState(0);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [editorialAnchor, setEditorialAnchor] = useState<HTMLElement | null>(null);
  const [inlinePreview, setInlinePreview] = useState<{ scopeKey: string; original: string; wording: string; changes: boolean } | null>(null);
  const [workspaceInsight, setWorkspaceInsight] = useState<{ readingId: string; key: string } | null>(null);
  const [arrivalInsight, setArrivalInsight] = useState<CanvasInsight | null>(null);
  const [memberVersionBusy, setMemberVersionBusy] = useState(false);
  /* ⭐⭐ C6R2 — THE WORKING DECISION, HELD AND NOT PERSISTED.
     Which of MAIA's marks the writer has taken so far. ⛔ Not a version: a new
     row for every click would fill the history with combinations nobody chose
     to keep. It becomes a version once, at `Use selected changes`.
     ⚠️ Held here rather than in RevisionDesk — the desk and the marked page are
     siblings, and this is the only place that sees both. Same law, the one
     position that can carry it. */
  const [selectedEdits, setSelectedEdits] = useState<ReadonlySet<number>>(new Set());
  const workspaceIncoming = useRef<string | null>(null);
  const autoProposalKey = useRef<string | null>(null);
  const workspaceReturn = useRef<{
    focusId: string | null; selectedPassage: PassageSelection | null;
    thread: RebuildEditorialThread | null; versionId: string | null;
    tab: PassageTab; mode: MaiaMode; address: string;
    scrollTop: number; scrollLeft: number;
  } | null>(null);
  const [writingMessage, setWritingMessage] = useState<string | null>(null);
  const [selectedPassage, setSelectedPassage] = useState<PassageSelection | null>(null);
  const [passageTab, setPassageTab] = useState<PassageTab>('ask');
  const [mobilePane, setMobilePane] = useState<'outline' | 'manuscript' | 'maia'>('manuscript');
  const [review, setReview] = useState<ChapterReviewBundle | null>(null);
  const [reviewPhase, setReviewPhase] = useState<'idle' | 'reading' | 'ready' | 'partial'>('idle');
  const [reviewProgress, setReviewProgress] = useState<{ done: number; total: number; lens: string } | null>(null);
  const [reviewNeedsRefresh, setReviewNeedsRefresh] = useState(false);
  /* ⭐ C — kept beside the member sentence, never folded into it. */
  /* ⭐ C6R4 — member-declared, per-observation, changeable without ceremony.
     ⛔ Never assigned, never inferred, and the default is identical for every
     member rather than chosen from anything about this one. */
  const [editorialDepth, setEditorialDepth] = useState<EditorialDepth>(DEFAULT_EDITORIAL_DEPTH);
  /* ⭐ C6R7 — one request from a mark to open the writer's draft. */
  const [openDraftNonce, setOpenDraftNonce] = useState(0);
  const [reviewManifestRefusal, setReviewManifestRefusal] = useState<string | null>(null);
  const [reviewContinuityMessage, setReviewContinuityMessage] = useState<string | null>(null);
  const [reviewLens, setReviewLens] = useState<DevelopmentalLens | 'all'>('all');
  const [reviewFindingsOpen, setReviewFindingsOpen] = useState(true);
  const [maiaAsk, setMaiaAsk] = useState('');
  const [maiaResponse, setMaiaResponse] = useState<string | null>(null);
  const [maiaFailure, setMaiaFailure] = useState<string | null>(null);
  const [maiaBusy, setMaiaBusy] = useState(false);
  const [editorialThread, setEditorialThread] = useState<RebuildEditorialThread | null>(null);
  const [editorialDraft, setEditorialDraft] = useState('');
  const editorialDrafts = useRef(new Map<string, string>());
  const editorialScope = JSON.stringify([context?.manuscriptId, focusId,
    selectedPassage?.draftSectionId === focusId ? selectedPassage.text : null]);
  const showInlinePreview = useCallback((preview: { original: string; wording: string; changes: boolean } | null) => {
    setInlinePreview(preview ? { ...preview, scopeKey: editorialScope } : null);
  }, [editorialScope]);
  useEffect(() => { window.dispatchEvent(new Event('ws-stop-maia-reading')); }, [editorialScope]);
  const previousEditorialScope = useRef(editorialScope);
  useEffect(() => {
    if (previousEditorialScope.current === editorialScope) return;
    editorialDrafts.current.set(previousEditorialScope.current, editorialDraft);
    previousEditorialScope.current = editorialScope;
    setEditorialDraft(editorialDrafts.current.get(editorialScope) ?? '');
  }, [editorialScope, editorialDraft]);
  const [editorialBusy, setEditorialBusy] = useState(false);
  const [editorialFailure, setEditorialFailure] = useState<string | null>(null);
  const [suggestedVersionId, setSuggestedVersionId] = useState<string | null>(null);
  const [showChanges, setShowChanges] = useState(false);
  const [appliedVersionId, setAppliedVersionId] = useState<string | null>(null);
  const [undoMessage, setUndoMessage] = useState<string | null>(null);
  const [adoptionOutcome, setAdoptionOutcome] = useState<AdoptionWireOutcome | null>(null);
  const [lastEditorialInstruction, setLastEditorialInstruction] = useState('');
  const [relationshipChoices, setRelationshipChoices] = useState<readonly RebuildEditorialRelationship[]>([]);
  const [adoptionBusy, setAdoptionBusy] = useState(false);
  const [workDeclarationBusy, setWorkDeclarationBusy] = useState(false);
  const [workDeclarationMessage, setWorkDeclarationMessage] = useState<string | null>(null);
  const [authoredStructure, setAuthoredStructure] = useState<StructureTreeDTO | null>(null);
  const [structureNotice, setStructureNotice] = useState<string | null>(null);
  const sessionIdRef = useRef('');
  const writingRef = useRef<SectionWriting | null>(null);
  const sectionRefs = useRef(new Map<string, HTMLElement>());
  const { phase: worksPhase, works, reload: reloadWorks } = useLivingWorks();
  const { sources } = useStudioSources();

  const load = useCallback(async () => {
    setPhase('loading'); setMessage(null);
    let manuscriptId = requested;
    try {
      if (!manuscriptId) {
        const list = await apiFetch('/api/sovereign/manuscripts', { method: 'GET' });
        if (list.status === 401) { setPhase('unauthorized'); return; }
        if (!list.ok) throw new Error('manuscript list');
        const body = await list.json();
        const manuscripts = Array.isArray(body?.manuscripts) ? body.manuscripts : [];
        if (manuscripts.length !== 1) {
          setPhase('error');
          setMessage('Open the rebuild with a specific manuscript.');
          return;
        }
        manuscriptId = manuscripts[0].id;
      }
      const resolvedManuscriptId = manuscriptId;
      if (!resolvedManuscriptId) throw new Error('manuscript identity');
      const res = await apiFetch(`/api/writers-studio/rebuild/context?manuscriptId=${encodeURIComponent(resolvedManuscriptId)}`);
      if (res.status === 401) { setPhase('unauthorized'); return; }
      if (!res.ok) throw new Error('context');
      const body = await res.json() as ContextPayload;
      if (body.state !== 'section_aware') {
        setPhase('error');
        setMessage('This manuscript is not section-addressable yet. The rebuild will not guess at its structure.');
        return;
      }
      setContext(body);
      const requestedRow = requestedSection
        ? body.sections.find((s) => s.draftSectionId === requestedSection) ?? null
        : null;
      const chapter10 = body.sections.find((s) => /^Chapter 10\b/i.test(s.heading ?? ''));
      const initial = requestedRow ?? chapter10 ?? body.sections[0] ?? null;
      setFocusId(initial?.draftSectionId ?? null);
      setMaiaMode(isConfirmedChapterRoot(initial) ? 'chapter' : 'passage');
      setPhase('ready');
    } catch {
      setPhase('error');
      setMessage('The rebuilt Studio could not read this manuscript just now. Nothing has changed.');
    }
  }, [requested, requestedSection]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!context?.manuscriptId) return;
    let cancelled = false;
    setAuthoredStructure(null);
    setStructureNotice(null);
    void fetchStructure(context.manuscriptId).then((out) => {
      if (cancelled) return;
      if (out.ok) setAuthoredStructure(out.tree);
      else setStructureNotice(structureRefusalCopy(out.refusal));
    });
    return () => { cancelled = true; };
  }, [context?.manuscriptId]);
  useEffect(() => {
    if (!canvasExpanded) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setCanvasExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canvasExpanded]);

  useEffect(() => {
    if (!sessionIdRef.current && typeof crypto !== 'undefined') {
      sessionIdRef.current = `writers-studio-rebuild-${crypto.randomUUID()}`;
    }
  }, []);

  const focusSection = context?.sections.find((s) => s.draftSectionId === focusId) ?? null;
  const chapter = context && focusId ? chapterSpanFor(context.sections, focusId) : null;
  const hasImportedStructure = Boolean(context?.sections.some((section) => section.headingDepth !== null && section.headingSignal));
  const importedStructureTree = context && hasImportedStructure ? asOutline(context.sections) : [];
  useEffect(() => {
    if (!chapter && maiaMode === 'chapter') setMaiaMode('passage');
  }, [chapter, maiaMode]);
  const workContext = resolveWorkContext(worksPhase, works, context?.manuscriptId ?? null);
  const work = currentWork(workContext);
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const workSourceMaterials = (work?.materials ?? []).filter((material) => material.materialType === 'source_upload');
  const workContextSentence = workContext.kind === 'work'
    ? (work?.purpose ?? 'A Work you declared.')
    : workContext.kind === 'none'
      ? 'This manuscript is not yet declared as a Work.'
      : workContext.kind === 'ambiguous'
        ? `This manuscript belongs to ${workContext.works.length} Works. The Studio will not choose one for you.`
        : worksPhase === 'error'
          ? 'The Studio could not establish this manuscript’s Work context just now.'
          : 'Finding this manuscript’s Work context…';

  const makeThisAWork = useCallback(async () => {
    if (!context || workContext.kind !== 'none' || workDeclarationBusy) return;
    setWorkDeclarationBusy(true);
    setWorkDeclarationMessage(null);
    try {
      const create = await apiFetch('/api/sovereign/living-works', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify(context.title ? { title: context.title } : {}),
      });
      const created = await create.json().catch(() => ({}));
      const workId = typeof created?.work?.id === 'string' ? created.work.id : null;
      if (!create.ok || !workId) {
        setWorkDeclarationMessage('The Work could not be created just now. The manuscript has not changed.');
        return;
      }
      const declare = await apiFetch(`/api/sovereign/living-works/${workId}/expressions`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ expressionType: 'manuscript', expressionId: context.manuscriptId }),
      });
      await reloadWorks();
      if (!declare.ok) {
        setWorkDeclarationMessage('The Work was created, but this manuscript was not placed in it. Nothing about the manuscript changed.');
        return;
      }
      setWorkDeclarationMessage(null);
    } catch {
      setWorkDeclarationMessage('The Work could not be created just now. The manuscript has not changed.');
    } finally {
      setWorkDeclarationBusy(false);
    }
  }, [context, workContext.kind, workDeclarationBusy, reloadWorks]);

  const chapterRootId = chapter?.root.draftSectionId ?? null;
  const chapterScopeKey = chapter?.sections.map((section) => section.draftSectionId).join('|') ?? '';

  useEffect(() => {
    let cancelled = false;
    setReview(null);
    setReviewPhase('idle');
    setReviewProgress(null);
    setReviewNeedsRefresh(false);
    setReviewContinuityMessage(null);
    if (!chapterRootId || !context || !chapter) return () => { cancelled = true; };

    void (async () => {
      const loaded = await loadChapterReviewManifest(context.manuscriptId, chapterRootId);
      if (cancelled) return;
      if (!loaded.ok) {
        setReviewContinuityMessage('Saved chapter reviews could not be reached just now. Your frozen readings are unaffected.');
        return;
      }
      if (!loaded.run) return;
      const manifest = loaded.run;
      const restored = await rehydrateChapterReview(context.manuscriptId, manifest);
      if (cancelled) return;
      if (!restored.ok) {
        setReviewContinuityMessage('The saved chapter review could not be reopened just now. Its frozen readings have not changed.');
        return;
      }
      const currentIds = chapterScopeKey ? chapterScopeKey.split('|') : [];
      const sameScope = manifest.sectionIds.length === currentIds.length
        && manifest.sectionIds.every((id, i) => id === currentIds[i]);
      setReview(restored.bundle);
      setReviewPhase(restored.bundle.failures.length === 0 ? 'ready' : 'partial');
      setReviewNeedsRefresh(!sameScope || manifest.draftRevision !== context.version);
    })();
    return () => { cancelled = true; };
  }, [chapterRootId, chapterScopeKey, context?.manuscriptId, context?.version]);

  const reviewFindingsForMovement = useCallback((section: RebuildSection) => {
    if (!review || !chapter) return [];
    const movements = chapter.sections.filter((s) => s.headingDepth === 2);
    const idx = movements.findIndex((s) => s.draftSectionId === section.draftSectionId);
    if (idx < 0) return findingsForSection(review.findings, section.draftSectionId);
    const next = movements[idx + 1]?.position ?? Number.POSITIVE_INFINITY;
    const ids = new Set(chapter.sections.filter((s) => s.position >= section.position && s.position < next).map((s) => s.draftSectionId));
    return review.findings.filter((f) => f.sectionIds.some((id) => ids.has(id)));
  }, [review, chapter]);

  const settleWriting = useCallback(async (): Promise<boolean> => {
    const writing = writingRef.current;
    if (!writing) return true;
    setWritingMessage(null);
    const blocked = () => writing.sections.some((section) => {
      const status = writing.statusOf(section.id);
      return status === 'conflict' || status === 'error';
    });
    if (blocked()) {
      setWritingMessage('Your latest writing needs attention before MAIA reads or changes the Work. Nothing else was sent.');
      return false;
    }
    writing.flushPending();
    const deadline = Date.now() + 5000;
    while (writing.hasUnsavedWork()) {
      if (blocked() || Date.now() > deadline) {
        setWritingMessage('Your latest writing is not safely settled yet. MAIA will wait rather than read an older copy.');
        return false;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    return true;
  }, []);

  /* ⭐ `lenses` present = the member asked to continue the readings that were
     never attempted. ⛔ Absent = the ordinary whole-chapter gesture. */
  const runReview = useCallback(async (lenses?: readonly DevelopmentalLens[]) => {
    if (!chapter || !context || reviewPhase === 'reading') return;
    if (!(await settleWriting())) return;
    const reviewRevision = writingRef.current?.currentRevisionId() ?? context.version;
    setReviewContinuityMessage(null);
    const asked = lenses ?? DEVELOPMENTAL_LENSES;
    const carried = lenses && review
      ? { readingIds: [...review.readingIds], payloads: [...review.payloads],
          findings: [...review.findings], failures: [...review.failures], remaining: [] }
      : { readingIds: [], payloads: [], findings: [], failures: [], remaining: [] };
    setReview(carried);
    setReviewLens('all');
    setReviewFindingsOpen(false);
    setReviewPhase('reading');
    setReviewProgress({ done: 0, total: asked.length, lens: asked[0]! });
    const fresh = await runChapterReview(
      context.manuscriptId, chapter.sections,
      (done, total, lens) => setReviewProgress({ done, total, lens }),
      (partial) => setReview({
        ...partial,
        readingIds: [...carried.readingIds, ...partial.readingIds],
        payloads: [...carried.payloads, ...partial.payloads],
        findings: [...carried.findings, ...partial.findings],
        failures: [...carried.failures, ...partial.failures],
      }),
      asked,
    );
    /* ⛔ The earlier readings are not re-read and not replaced; a resumed
       gesture adds to what already completed. */
    const bundle = {
      ...fresh,
      readingIds: [...carried.readingIds, ...fresh.readingIds],
      payloads: [...carried.payloads, ...fresh.payloads],
      findings: [...carried.findings, ...fresh.findings],
      failures: [...carried.failures, ...fresh.failures],
    };
    setReview(bundle);
    setReviewNeedsRefresh(false);
    setReviewPhase(bundle.failures.length === 0 ? 'ready' : 'partial');
    const kept = await saveChapterReviewManifest(context.manuscriptId, {
      chapterRootSectionId: chapter.root.draftSectionId,
      sectionIds: chapter.sections.map((section) => section.draftSectionId),
      draftRevision: reviewRevision,
      readingIds: bundle.readingIds,
      failures: bundle.failures,
    });
    if (!kept.ok) {
      setReviewContinuityMessage('The readings are kept, but this chapter review could not be remembered as one set. Reload may not restore it yet.');
      /* ⭐ C — the member sentence is right and says nothing operational, so
         the refusal code is kept beside it rather than folded into it. Without
         this the only way to learn why the manifest save refused was to
         reconstruct it from the database afterwards. */
      setReviewManifestRefusal(kept.refusal);
    } else {
      setReviewManifestRefusal(null);
    }
  }, [chapter, context, reviewPhase, settleWriting, review]);

  const replaceAddress = useCallback((sectionId: string, threadId: string | null) => {
    if (typeof window === 'undefined') return;
    const placed = locationForSection(window.location.pathname, window.location.search, sectionId);
    const query = placed.includes('?') ? placed.slice(placed.indexOf('?')) : '';
    const next = threadId
      ? canvasWithEditorialThread(window.location.pathname, query, threadId)
      : canvasWithoutEditorialThread(window.location.pathname, query);
    replacePlaceAddress(next);
  }, []);

  const clearEditorial = useCallback(() => {
    setEditorialThread(null);
    setEditorialFailure(null);
    setRelationshipChoices([]);
    setSuggestedVersionId(null);
    setShowChanges(false);
    setAdoptionOutcome(null);
    setLastEditorialInstruction('');
  }, []);

  useEffect(() => {
    if (!requestedEditorialThread || !focusId) return;
    let cancelled = false;
    void readBoundEditorialThread(requestedEditorialThread, focusId).then((out) => {
      if (cancelled) return;
      if (out.ok) {
        setEditorialThread(out.thread);
        setSelectedPassage(selectionFromThread(focusSection, context?.version ?? null, out.thread));
        setSuggestedVersionId(out.thread.headVersionId);
        setMaiaMode('passage');
        setPassageTab('suggest');
        setEditorialFailure(null);
        replaceAddress(focusId, out.thread.threadId);
        return;
      }
      if (out.reason === 'locus_mismatch') {
        setEditorialFailure('This saved revision conversation belongs to a different place in the Work, so it was not opened here.');
        replaceAddress(focusId, null);
      }
    });
    return () => { cancelled = true; };
  }, [requestedEditorialThread, focusId, focusSection, context?.version, replaceAddress]);

  const holdPassage = useCallback((
    section: RebuildSection, start: number, end: number, exact: string,
  ) => {
    if (!context || !exact.trim()) return;
    const sameThread = editorialThread?.targetSectionId === section.draftSectionId
      && editorialThread.locusText === exact;
    if (!sameThread) clearEditorial();
    setFocusId(section.draftSectionId);
    setSelectedPassage({
      draftSectionId: section.draftSectionId, start, end, text: exact,
      revisionNumber: writingRef.current?.currentRevisionId() ?? context.version,
    });
    setMaiaMode('passage');
    replaceAddress(section.draftSectionId, sameThread ? editorialThread?.threadId ?? null : null);
  }, [context, editorialThread, clearEditorial, replaceAddress]);

  const focusWritingSection = useCallback((sectionId: string) => {
    const moved = sectionId !== focusId;
    if (moved) { clearEditorial(); setSelectedPassage(null); }
    setFocusId(sectionId);
    setMaiaMode('passage');
    replaceAddress(sectionId, moved ? null : editorialThread?.threadId ?? null);
  }, [focusId, clearEditorial, replaceAddress, editorialThread?.threadId]);

  const beginWriting = useCallback((sectionId: string) => {
    clearEditorial();
    setSelectedPassage(null);
    setFocusId(sectionId);
    setMaiaMode('passage');
    if (review) setReviewNeedsRefresh(true);
    replaceAddress(sectionId, null);
  }, [clearEditorial, review, replaceAddress]);

  const selectSection = useCallback((id: string, role: OutlineNode['role']) => {
    const moved = id !== focusId;
    const changedGrain = selectedPassage !== null;
    if (moved || changedGrain) clearEditorial();
    setFocusId(id);
    setSelectedPassage(null);
    setMaiaMode(role === 'chapter' ? 'chapter' : 'passage');
    setPassageTab('ask');
    setMobilePane('manuscript');
    replaceAddress(id, moved || changedGrain ? null : editorialThread?.threadId ?? null);
    requestAnimationFrame(() => sectionRefs.current.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, [focusId, selectedPassage, clearEditorial, replaceAddress, editorialThread?.threadId]);

  /* Every frozen review finding must have a member-facing door even when its
     evidence is whole-chapter or structural rather than attached to one of the
     movement headings below. A section-linked finding may also take the writer
     to the first exact section it names; absence of a section never hides the
     finding itself. */
  const openReviewFinding = useCallback((finding: ChapterReviewBundle['findings'][number]) => {
    const target = finding.sectionIds.find((id) => context?.sections.some((section) => section.draftSectionId === id));
    if (!target) return;
    /* Revealing review evidence is not the same gesture as entering Passage Work.
       Keep Chapter Review, lens selection, and review disclosure exactly where the
       writer left them; move only the manuscript locus. */
    const moved = target !== focusId;
    if (moved) { clearEditorial(); setSelectedPassage(null); }
    setFocusId(target);
    setMobilePane('manuscript');
    replaceAddress(target, moved ? null : editorialThread?.threadId ?? null);
    requestAnimationFrame(() => sectionRefs.current.get(target)?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  }, [context, focusId, clearEditorial, replaceAddress, editorialThread?.threadId]);

  const title = context?.title ?? 'Writer’s Studio';
  const chapterTitle = chapter?.root.heading ?? focusSection?.heading ?? 'Manuscript';
  const focusName = focusSection?.heading ?? 'this section';
  const chapterName = chapter ? labelWithoutPrefix(chapter.root.heading) : focusName;
  const counts = review ? lensCounts(review.findings) : {};
  const completedReviewLenses = new Set(
    review?.payloads.map((payload) => payload.reading.scope.commissionedLens) ?? [],
  );
  const reviewFailureFor = (lens: DevelopmentalLens) => review?.failures.find((failure) => failure.lens === lens) ?? null;
  const reviewFailureCopy = (lens: DevelopmentalLens): string => {
    const failure = reviewFailureFor(lens);
    if (!failure) return '';
    if (failure.refusal === 'claim_unbindable') {
      return 'MAIA could not bind one or more claims from this lens to the frozen evidence, so this lens was not kept. The other completed readings are unaffected.';
    }
    /* ⭐⭐ WHERE THE READING WAS LOST IS THE WRITER'S INFORMATION, NOT OURS.
       `ReviewFailure` has carried `stage` all along and this surface threw it
       away, so every outcome read as *MAIA could not complete* — and a lens
       that finished a full read and then failed to RECORD it was
       indistinguishable from one that failed to think. The writer waited out
       the whole read, lost it, and was told nothing that would let them tell
       the two apart or know whether reading again would help.
       ⛔ Still no schema names, no trigger names, no stack: WHERE it was lost,
       ⛔ never the internals of why. */
    return FAILURE_SENTENCE[failure.stage ?? ''] ?? FAILURE_SENTENCE['']!;
  };
  const visibleReviewFindings = review
    ? reviewLens === 'all' ? review.findings : review.findings.filter((finding) => finding.lens === reviewLens)
    : [];
  const reviewLensLabel = (lens: DevelopmentalLens): string => ({
    development: 'Development', structure: 'Structure', continuity: 'Continuity',
    arc: 'Arc', voice: 'Voice', coherence: 'Coherence', reader: 'Reader',
  }[lens]);
  const focusReviewFindings = focusSection && review ? findingsForSection(review.findings, focusSection.draftSectionId) : [];
  const passageReviewFindings = focusSection?.headingDepth === 2
    ? reviewFindingsForMovement(focusSection) : focusReviewFindings;
  const focusForMaia = focusSection && work && context ? focusOn({
    workRef: work.id,
    manuscriptId: context.manuscriptId,
    section: {
      draftSectionId: focusSection.draftSectionId,
      sourceSectionId: focusSection.sourceSectionId,
      position: focusSection.position,
      heading: focusSection.heading,
      depth: focusSection.headingDepth === 1 || focusSection.headingDepth === 2 || focusSection.headingDepth === 3
        ? focusSection.headingDepth : null,
    },
    selection: selectedPassage?.draftSectionId === focusSection.draftSectionId
      ? { from: selectedPassage.start, to: selectedPassage.end, revisionNumber: selectedPassage.revisionNumber }
      : null,
  }) : null;
  const focusWire = focusForMaia ? focusRequest(focusForMaia) : null;
  const baseAskPlaceholder = focusForMaia ? composerPrompt(focusForMaia) : 'Ask MAIA about this section…';
  const askPlaceholder = passageTab === 'interpret' ? 'What do you notice here?'
    : passageTab === 'explore' ? 'Explore this with me…'
      : baseAskPlaceholder;
  const suggestedVersion = editorialThread
    ? exactVersion(editorialThread, suggestedVersionId ?? editorialThread.headVersionId)
    : null;
  const suggestionChange = editorialThread && suggestedVersion
    ? changedSpan(editorialThread.locusText, suggestedVersion.wording) : null;
  const lastMaiaEditorialTurn = editorialThread
    ? [...editorialThread.turns].reverse().find((t) => t.speaker === 'maia') ?? null
    : null;

  const askMaia = useCallback(async () => {
    if (!context || !work || !focusWire || !maiaAsk.trim() || maiaBusy) return;
    setMaiaBusy(true); setMaiaFailure(null);
    try {
      if (!(await settleWriting())) return;
      const sessionId = sessionIdRef.current || `writers-studio-rebuild-${Date.now()}`;
      sessionIdRef.current = sessionId;
      const res = await apiFetch('/api/writers-studio/focus', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          sessionId, workRef: focusWire.workRef, scopeKind: focusWire.scopeKind,
          sectionRef: focusWire.sectionRef, range: focusWire.range,
          gesture: 'ask_maia', ask: maiaAsk,
        }),
      });
      if (res.status === 404) {
        setMaiaFailure('Passage cognition is not enabled in this build yet. Nothing was sent.');
        return;
      }
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMaiaFailure(typeof body?.message === 'string' ? body.message : 'MAIA could not receive this Focus.');
        return;
      }
      if (typeof body?.response === 'string' && body.response.trim()) {
        setMaiaResponse(body.response);
        setMaiaAsk('');
      } else {
        setMaiaFailure(typeof body?.message === 'string' ? body.message : 'MAIA received the Focus but did not return wording.');
      }
    } catch {
      setMaiaFailure('MAIA could not be reached just now. Nothing in the manuscript changed.');
    } finally { setMaiaBusy(false); }
  }, [context, work, focusWire, maiaAsk, maiaBusy, settleWriting]);

  const bindEditorialThread = useCallback((thread: RebuildEditorialThread): boolean => {
    if (!focusId || thread.targetSectionId !== focusId) {
      setEditorialFailure('This revision conversation is bound to a different place in the Work, so it cannot open here.');
      return false;
    }
    const live = focusSection ? {
      ...focusSection,
      body: writingRef.current?.bodyOf(focusSection.draftSectionId) ?? focusSection.body,
    } : null;
    setSelectedPassage(selectionFromThread(
      live,
      writingRef.current?.currentRevisionId() ?? context?.version ?? null,
      thread,
    ));
    setEditorialThread(thread);
    setRelationshipChoices([]);
    setSuggestedVersionId(thread.headVersionId);
    setEditorialFailure(null);
    setMaiaMode('passage');
    setPassageTab('suggest');
    replaceAddress(focusId, thread.threadId);
    return true;
  }, [focusId, focusSection, context, replaceAddress]);

  const chooseRelationship = useCallback(async (threadId: string) => {
    if (!focusId || editorialBusy) return;
    setEditorialBusy(true); setEditorialFailure(null);
    const out = await readBoundEditorialThread(threadId, focusId);
    if (out.ok) bindEditorialThread(out.thread);
    else setEditorialFailure('That saved revision conversation could not be opened here.');
    setEditorialBusy(false);
  }, [focusId, editorialBusy, bindEditorialThread]);

  const startNewEditorial = useCallback(async (): Promise<RebuildEditorialThread | null> => {
    if (!focusId || !context) return null;
    if (!(await settleWriting())) return null;
    const passage = selectedPassage?.draftSectionId === focusId ? selectedPassage : null;
    const revision = writingRef.current?.currentRevisionId() ?? passage?.revisionNumber ?? context.version;
    const opened = passage
      ? await openBoundEditorialPassage(
          focusId, { start: passage.start, end: passage.end }, revision,
        )
      : await openBoundEditorialThread(focusId);
    if (!opened.ok) {
      const refusal = 'refusal' in opened ? opened.refusal : undefined;
      setEditorialFailure(refusal === 'selection_ambiguous'
        ? 'Those exact words appear more than once in this section. Select a little more context so the Studio can hold the place without guessing.'
        : refusal === 'selection_stale'
          ? 'The Work changed after you selected those words. Reselect the passage you want to work on.'
          : opened.reason === 'unavailable'
            ? 'Revision collaboration is not enabled in this build yet. Nothing was written.'
            : 'The Studio could not open revision collaboration on this exact place.');
      return null;
    }
    return bindEditorialThread(opened.thread) ? opened.thread : null;
  }, [focusId, context, selectedPassage, bindEditorialThread, settleWriting]);

  const resolveEditorialForAct = useCallback(async (): Promise<RebuildEditorialThread | null> => {
    if (!focusId || !focusSection) return null;
    const desiredLocus = selectedPassage?.draftSectionId === focusId
      ? selectedPassage.text
      : (writingRef.current?.bodyOf(focusSection.draftSectionId) ?? focusSection.body);
    if (editorialThread?.targetSectionId === focusId
        && editorialThread.locusText === desiredLocus) return editorialThread;

    const found = await discoverEditorialRelationships(focusId);
    if (!found.ok) {
      setEditorialFailure(found.reason === 'unavailable'
        ? 'Revision collaboration is not enabled in this build yet. Nothing was written.'
        : 'The Studio could not safely look up revision conversations for this section.');
      return null;
    }
    const matching = found.relationships.filter((r) => r.locusText === desiredLocus);
    if (matching.length === 0) return startNewEditorial();
    if (matching.length === 1) {
      const out = await readBoundEditorialThread(matching[0]!.threadId, focusId);
      if (out.ok && bindEditorialThread(out.thread)) return out.thread;
      setEditorialFailure('The saved revision conversation could not be safely resumed.');
      return null;
    }
    setRelationshipChoices(matching);
    setEditorialFailure(null);
    return null;
  }, [focusId, focusSection, selectedPassage, editorialThread, startNewEditorial, bindEditorialThread]);

  /**
   * ⭐⭐ THE AUTHOR'S TWO EDITING CONTROLS (WS-EDITORIAL-SCOPE-01).
   *
   * ⛔ Held HERE rather than inside the desk so a remount cannot quietly reset
   * them — and taken from the shared hook so this surface and the canvas cannot
   * disagree about what the defaults are. The slider is remembered; the
   * paragraph permission opens off every visit, by construction.
   */
  const {
    latitude: editLatitude, setLatitude: setEditLatitude,
    mayRemoveParagraphs, setMayRemoveParagraphs,
    mayProposeImmediately, setMayProposeImmediately,
    /* ⭐ Per-Work: the override is keyed by the manuscript, not by the session.
       ⛔ `context` is `ContextReady | null` — the hook runs before the Work has
       loaded, and an empty key is the honest value for "no Work yet": the
       storage seam treats it as no-override rather than writing under a blank
       name. ⛔ Never `context!`, which would be a lie about the load order. */
  } = useEditingLatitude(context?.manuscriptId ?? '');
  /** ⭐ What the latest suggestion brought in that is not the writer's. */
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  const sendEditorial = useCallback(async (requestText?: string) => {
    if (!focusId || !(requestText ?? editorialDraft).trim() || editorialBusy) return;
    setEditorialBusy(true); setEditorialFailure(null); setAdoptionOutcome(null);
    setVoiceNotice(null);
    const exactWords = requestText ?? editorialDraft;
    /* ⭐⭐ C6R4 — ONE PLACE, SO NO TURN ESCAPES IT. Threading the directive
       through each caller would mean one of them eventually forgets, and the
       writer would get Direct-register prose from whichever path was missed
       with nothing on screen explaining why this answer reads differently.
       ⛔ APPENDED, never substituted: it governs the telling, and the
       substance of the turn above it is untouched. */
    const exactWords = `${requestText ?? editorialDraft}\n\n${editorialDirective(editorialDepth)}`;
    try {
      if (!(await settleWriting())) return;
      const thread = await resolveEditorialForAct();
      if (!thread) return;
      const out = await sendBoundEditorialTurn(thread.threadId, focusId, exactWords,
        { latitude: editLatitude, mayRemoveParagraphs, mayProposeImmediately });
      const observationContext = arrivalInsight && workspaceInsight?.readingId === arrivalInsight.readingId
        && workspaceInsight.key === arrivalInsight.observation.key
        && arrivalInsight.passages.some(p => p.sectionId === focusId)
        ? 'Developmental observation being discussed (an interpretation, not an instruction):\n'
          + arrivalInsight.observation.observation + '\n\n'
        : '';
      const out = await sendBoundEditorialTurn(thread.threadId, focusId,
        observationContext + 'My question:\n' + exactWords);
      if (!out.ok) {
        /* ⭐⭐ THE SCOPE REFUSAL IS REPORTED AS WHAT IT IS: the system held the
           line the writer drew. ⛔ Not "MAIA could not complete" — she could,
           and what she produced went further than the writer allowed. Saying it
           plainly is what lets the writer learn the control. */
        setEditorialFailure(
          out.reason === 'scope_refused'
            ? (out.detail ?? 'That suggestion went beyond your editing latitude. Nothing was changed.')
            : out.reason === 'unavailable'
              ? 'Revision collaboration is not enabled in this build yet. Nothing was written.'
              : 'MAIA could not complete this revision turn. Your manuscript was not changed.');
        return;
      }
      if (!bindEditorialThread(out.thread)) return;
      /* ⭐⭐ THE VOICE NOTICE TRAVELS WITH THE SUGGESTION, not after it.
         For a writer still finding their voice, noticing in time is the whole
         of the protection — a note read afterwards is a post-mortem. */
      setVoiceNotice(out.voice?.note ?? null);
      setLastEditorialInstruction(exactWords);
      if (out.producedVersionId) setSuggestedVersionId(out.producedVersionId);
      setShowChanges(false);
      setEditorialDraft('');
    } finally {
      setEditorialBusy(false);
    }
  }, [editorialDepth, focusId, editorialDraft, editorialBusy, resolveEditorialForAct, bindEditorialThread, settleWriting, arrivalInsight, workspaceInsight]);

  const refreshContext = useCallback(async (): Promise<ContextReady | null> => {
    if (!context) return null;
    try {
      const res = await apiFetch(`/api/writers-studio/rebuild/context?manuscriptId=${encodeURIComponent(context.manuscriptId)}`);
      if (!res.ok) return null;
      const body = await res.json() as ContextPayload;
      if (body.state === 'section_aware') { setContext(body); return body; }
      return null;
    } catch {
      /* The adoption outcome remains authoritative. A failed refresh is not
         rewritten as a failed adoption; the next reload will re-read the Work. */
      return null;
    }
  }, [context]);

  const applySuggested = useCallback(async () => {
    if (!focusId || !editorialThread || !suggestedVersion || adoptionBusy) return;
    setAdoptionBusy(true); setEditorialFailure(null);
    try {
      if (!(await settleWriting())) return;
      const out = await adoptBoundEditorialVersion(
        editorialThread.threadId, focusId, suggestedVersion.id,
      );
      if (!out.ok) {
        setEditorialFailure('The Studio would not apply wording that could not be proven to belong to this exact revision conversation.');
        return;
      }
      setAdoptionOutcome(out.outcome);
      /* ⭐ The immediate receipt is local presentation state. ⛔ Only an
         actually-applied outcome may set it; a moved or refused Work must not
         render as though this click changed the manuscript. */
      setAppliedVersionId(out.outcome.kind === 'applied' ? suggestedVersion.id : null);
      if (out.outcome.kind === 'applied' || out.outcome.kind === 'work_moved') {
        if (review) setReviewNeedsRefresh(true);
        const fresh = await refreshContext();
        if (out.outcome.kind === 'applied' && fresh) {
          setWritingEpoch((n) => n + 1);
          const section = fresh.sections.find((x) => x.draftSectionId === focusId) ?? null;
          const located = section ? locateUniquePassage(section.body, suggestedVersion.wording) : null;
          setSelectedPassage(section && located ? {
            draftSectionId: section.draftSectionId,
            start: located.start, end: located.end, text: suggestedVersion.wording,
            revisionNumber: fresh.version,
          } : null);
        } else {
          setSelectedPassage(null);
        }
      }
      /* ⭐⭐ RECOVERY IS READ AFTER THE WORK HAS SETTLED. The application row
         is the authority for Undo; reading it before the context refresh made
         the inline desk depend on a race between two post-apply projections. */
      const reread = await readBoundEditorialThread(editorialThread.threadId, focusId);
      if (reread.ok) {
        setEditorialThread(reread.thread);
        replaceAddress(focusId, reread.thread.threadId);
      }
    } finally {
      setAdoptionBusy(false);
    }
  }, [focusId, editorialThread, suggestedVersion, adoptionBusy, review, refreshContext, settleWriting, replaceAddress]);

  const undoSuggested = useCallback(async () => {
    const application = editorialThread?.application;
    if (!application || adoptionBusy) return;
    setAdoptionBusy(true); setUndoMessage(null);
    try {
      if (!(await settleWriting())) return;
      const res = await apiFetch('/api/writers-studio/editorial/undo', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ authorizationId: application.authorizationId }),
      });
      const out = await res.json();
      if (out.kind === 'undone') {
        setUndoMessage('That application was undone. The original passage is restored.');
        setAppliedVersionId(null); setAdoptionOutcome(null);
        const fresh = await refreshContext();
        if (fresh) {
          setWritingEpoch(n => n + 1);
          const section = fresh.sections.find(s => s.draftSectionId === focusId);
          const located = section && editorialThread ? locateUniquePassage(section.body, editorialThread.locusText) : null;
          setSelectedPassage(section && located ? { draftSectionId: section.draftSectionId, ...located,
            text: editorialThread!.locusText, revisionNumber: fresh.version } : null);
        }
      } else setUndoMessage('Undo was not performed: the manuscript has changed or this application is no longer reversible. Your current writing is retained.');
      if (editorialThread && focusId) {
        const reread = await readBoundEditorialThread(editorialThread.threadId, focusId);
        if (reread.ok) setEditorialThread(reread.thread);
      }
    } catch { setUndoMessage('Undo could not be confirmed. Reload the manuscript before trying again.'); }
    finally { setAdoptionBusy(false); }
  }, [editorialThread, adoptionBusy, settleWriting, refreshContext, focusId]);

  const tryAnother = useCallback(() => {
    setPassageTab('suggest');
    setEditorialDraft('');
    setSuggestedVersionId(null);
    setShowChanges(false);
    setAdoptionOutcome(null);
    setEditorialFailure(null);
  }, []);

  const discussSuggestion = useCallback(() => {
    setPassageTab('suggest');
    setEditorialDraft('');
    setEditorialFailure(null);
  }, []);

  const openWorkspace = useCallback((insight?: { readingId: string; key: string }) => {
    if (!workspaceOpen) {
      const scroll = document.querySelector<HTMLElement>('[data-manuscript-scroll]');
      workspaceReturn.current = { focusId, selectedPassage, thread: editorialThread,
        versionId: suggestedVersionId, tab: passageTab, mode: maiaMode,
        address: window.location.pathname + window.location.search,
        scrollTop: scroll?.scrollTop ?? 0, scrollLeft: scroll?.scrollLeft ?? 0 };
    }
    if (insight) setWorkspaceInsight(insight);
    setMobilePane('manuscript');
    setWorkspaceOpen(true);
  }, [workspaceOpen, focusId, selectedPassage, editorialThread, suggestedVersionId, passageTab, maiaMode]);

  const returnToStartingPassage = useCallback(() => {
    if (editorialBusy || adoptionBusy || memberVersionBusy) return;
    const previous = workspaceReturn.current;
    if (previous) {
      if (previous.focusId !== focusId) {
        setFocusId(previous.focusId); setSelectedPassage(previous.selectedPassage);
        setEditorialThread(previous.thread); setSuggestedVersionId(previous.versionId);
        setPassageTab(previous.tab); setMaiaMode(previous.mode);
        replacePlaceAddress(previous.address);
      }
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const scroll = document.querySelector<HTMLElement>('[data-manuscript-scroll]');
        if (scroll) { scroll.scrollTop = previous.scrollTop; scroll.scrollLeft = previous.scrollLeft; }
      }));
    }
    window.dispatchEvent(new Event('ws-stop-maia-reading'));
    setWorkspaceOpen(false);
  }, [editorialBusy, adoptionBusy, memberVersionBusy, focusId]);

  const closeWorkspace = useCallback(() => {
    if (editorialBusy || adoptionBusy || memberVersionBusy) return;
    window.dispatchEvent(new Event('ws-stop-maia-reading'));
    setWorkspaceOpen(false);
  }, [editorialBusy, adoptionBusy, memberVersionBusy]);

  const incomingSection = requestedSection;
  const incomingReading = params?.get(INSIGHT_READING) ?? null;
  const incomingObservation = params?.get(INSIGHT_OBSERVATION) ?? null;
  const incomingAction = params?.get('insightAction') ?? null;
  useEffect(() => {
    if (phase !== 'ready' || !context?.manuscriptId || !incomingReading || !incomingObservation) {
      setArrivalInsight(null);
      return;
    }
    let cancelled = false;
    setArrivalInsight(null);
    void loadCanvasInsight(context.manuscriptId, incomingReading, incomingObservation).then(insight => {
      if (cancelled) return;
      setArrivalInsight(insight);
      if (!insight) setEditorialFailure('The observation could not be opened. Your manuscript is unchanged.');
    });
    return () => { cancelled = true; };
  }, [phase, context?.manuscriptId, incomingReading, incomingObservation]);

  /* ⭐⭐ C6R1 — ONE MARKED CHANGE, FIVE PLAIN CHOICES.
     ⛔ None of these invents a mutation path. Every one either starts a
     conversation on the existing governed turn — and therefore reaches the
     Teaching bridge — or does nothing at all. `Accept` and `Change it` ask
     MAIA for a narrower proposal rather than quietly applying a slice of the
     current one: applying part of a proposal is a DIFFERENT text from the one
     the member is looking at, and it would arrive with no version of its own
     to review, adopt or undo. The writer still decides in the desk above. */
  /* ⭐⭐ C6R2 — THE COMPOSITION, AND ITS PROVENANCE.
     Three outcomes, and the distinction between them is the history we want:

       none selected  → the writer's own words. ⛔ Nothing to persist.
       all selected   → MAIA's exact proposal, chosen by the writer. ⛔ Do NOT
                        mint a duplicate member version that says the writer
                        wrote what MAIA wrote.
       a subset       → a text that is neither MAIA's nor the original, so it
                        is the WRITER'S, and it goes through the member-version
                        route and carries their authorship.

     ⭐ *MAIA proposed three edits; the writer accepted two; the revision is the
     writer's* is a true sentence the record can support. */
  const composition = useMemo(() => {
    if (!editorialThread || !suggestedVersion) return null;
    const segs = editorialSegments(editorialThread.locusText, suggestedVersion.wording);
    const all = editIds(segs);
    return {
      text: composeSelected(segs, selectedEdits),
      taken: selectedEdits.size, total: all.length,
      everyMark: all.length > 0 && all.every((id) => selectedEdits.has(id)),
    };
  }, [editorialThread, suggestedVersion, selectedEdits]);

  /* ⛔ A new proposal is a new set of marks; carrying selections across would
     let a number chosen against one wording silently mean another. */
  useEffect(() => { setSelectedEdits(new Set()); }, [suggestedVersionId]);

  const editAction = useCallback((action: EditAction, edit: MarkedEdit) => {
    const it = edit.from.trim()
      ? `"${edit.from.trim()}" to "${edit.to.trim()}"`
      : `adding "${edit.to.trim()}"`;
    /* ⭐⭐ ACCEPT SELECTS A MARK THAT ALREADY EXISTS. ⛔ It does not call MAIA
       and ⛔ it does not touch the manuscript. Asking her to re-propose the
       change she has already proposed is a model turn the writer did not need
       and cannot tell they are paying for. */
    if (action === 'accept' || action === 'keep') {
      setEditorialFailure(null);
      setSelectedEdits((prev) => {
        const next = new Set(prev);
        if (action === 'accept') next.add(edit.id); else next.delete(edit.id);
        return next;
      });
      return;
    }
    /* ⭐ Change it opens the CURRENT COMPOSITION as the writer's own draft —
       what the page is showing them, not MAIA's full proposal, which they may
       never have taken whole. */
    /* ⭐⭐ C6R7 — `Change it` OPENS THE WRITER'S DRAFT. It used to scroll toward
       the desk, which left the only visible editable field the one labelled
       *Discuss this passage* — so the plain promise *I see this edit → Change
       it → now I rewrite this edit* was answered by a conversation box, and
       rewriting still required finding another control.
       ⭐ It opens the CURRENT COMPOSITION, which is what the page is showing:
       the marks taken so far, ⛔ not MAIA's whole proposal, which the writer
       may never have accepted entire.
       ⛔ Still no model call and ⛔ still no mutation — the draft is the
       writer's until they save it. */
    if (action === 'change') {
      setPassageTab('suggest');
      setEditorialFailure(null);
      setOpenDraftNonce((n) => n + 1);
      requestAnimationFrame(() =>
        document.querySelector('[data-revision-desk] .wsi-revision')
          ?.scrollIntoView({ block: 'center' }));
      return;
    }
    const ask = action === 'challenge'
      ? `Why did you change ${it}? Show me the words in my sentence that led you there, and make the strongest case for keeping mine. Do not propose new wording in this answer.`
      : `What writing technique is at work in changing ${it}? Describe what it does for a reader, what it may cost, and when my original would be the better choice. Do not test me and do not propose new wording.`;
    void sendEditorial(ask);
  }, [sendEditorial]);

  const reviseInsightPassage = useCallback((passage: InsightPassage, authorNotes = '') => {
    if (!context || editorialBusy || adoptionBusy || memberVersionBusy || !passage.verified) return;
    const section = context.sections.find(s => s.draftSectionId === passage.sectionId);
    const live = writingRef.current?.bodyOf(passage.sectionId) ?? section?.body;
    if (!section || !section.editable || live !== passage.body) {
      setEditorialFailure('This passage changed after the comparison opened. Reopen the observation before selecting its evidence.');
      return;
    }
    const range = passage.range ?? { start: 0, end: Array.from(passage.body).length };
    const exact = Array.from(passage.body).slice(range.start, range.end).join('');
    const nextScope = JSON.stringify([context.manuscriptId, passage.sectionId, exact]);
    if (authorNotes.trim()) {
      const prior = nextScope === editorialScope ? editorialDraft : editorialDrafts.current.get(nextScope) ?? '';
      const combined = prior.includes(authorNotes) ? prior : appendEditorialNote(prior, authorNotes);
      editorialDrafts.current.set(nextScope, combined);
      if (nextScope === editorialScope) setEditorialDraft(combined);
    }
    holdPassage(section, range.start, range.end, exact);
    setPassageTab('suggest');
    requestAnimationFrame(() => document.querySelector('[data-revision-desk]')?.scrollIntoView({ block: 'start' }));
  }, [context, editorialBusy, adoptionBusy, memberVersionBusy, holdPassage, editorialScope, editorialDraft]);

  /* ⭐ C6 null-target ruling — the member goes and chooses an exact passage
     THEMSELVES, by selecting text in their own manuscript. The existing
     selection seam (RebuildAuthoredBody -> onSelectPassage -> holdPassage)
     then binds it, and the desk's conversation runs through the editorial
     runtime from there.
     ⛔ This selects nothing, widens nothing and promotes no section reference
     into a passage — it moves the member to where their own choice is made. */
  const chooseOwnPassage = useCallback(() => {
    setPassageTab('suggest');
    requestAnimationFrame(() =>
      document.querySelector('[data-authored-body]')?.scrollIntoView({ block: 'start' }));
  }, []);

  useEffect(() => {
    if (!arrivalInsight || !context || phase !== 'ready'
        || incomingReading !== arrivalInsight.readingId
        || incomingObservation !== arrivalInsight.observation.key) return;
    const key = arrivalInsight.manuscriptId + ':' + arrivalInsight.readingId + ':'
      + arrivalInsight.observation.key + ':' + (incomingSection ?? '') + ':'
      + (requestedEditorialThread ?? 'new');
    if (workspaceIncoming.current === key) return;
    workspaceIncoming.current = key;
    openWorkspace({ readingId: arrivalInsight.readingId, key: arrivalInsight.observation.key });
    if (requestedEditorialThread) return;
    const passage = arrivalInsight.passages.find(p => p.sectionId === incomingSection)
      ?? arrivalInsight.passages.find(p => p.verified && p.editable)
      ?? arrivalInsight.passages[0];
    if (passage?.verified && passage.editable) reviseInsightPassage(passage);
    else setEditorialFailure('This reading no longer identifies verified editable wording here. Read its context before choosing a passage to revise.');
  }, [arrivalInsight, context, phase, incomingSection, incomingReading, incomingObservation,
    requestedEditorialThread, openWorkspace, reviseInsightPassage]);

  useEffect(() => {
    if (incomingAction !== 'try-revision' || !arrivalInsight || !workspaceOpen
        || !selectedPassage || !focusId || editorialBusy || suggestedVersionId) return;
    if (workspaceInsight?.readingId !== arrivalInsight.readingId
        || workspaceInsight.key !== arrivalInsight.observation.key) return;
    if (selectedPassage.draftSectionId !== focusId) return;
    const passage = arrivalInsight.passages.find(p => p.sectionId === focusId && p.verified && p.editable);
    if (!passage) return;
    const range = passage.range ?? { start: 0, end: Array.from(passage.body).length };
    const exact = Array.from(passage.body).slice(range.start, range.end).join('');
    if (exact !== selectedPassage.text) return;
    const key = `${arrivalInsight.readingId}:${arrivalInsight.observation.key}:${focusId}:${exact}`;
    if (autoProposalKey.current === key) return;
    autoProposalKey.current = key;
    void sendEditorial([
      'Offer one possible revision of this selected passage in response to the developmental observation.',
      'Preserve my voice, style, subject, and intentional ambiguity.',
      'Do not assume the noticed pattern is a defect or that revision is improvement.',
      'Consider the strongest case for keeping the original.',
      'Treat possible reader effects as hypotheses.',
      'Begin the rationale with "Editorial purpose: <short descriptive name>".',
      'Nothing is to be applied automatically.',
    ].join('\n'));
  }, [incomingAction, arrivalInsight, workspaceOpen, workspaceInsight, selectedPassage, focusId,
    editorialBusy, suggestedVersionId, sendEditorial]);

  const saveMemberRevision = useCallback(async (draft: MemberRevisionDraft): Promise<boolean> => {
    if (memberVersionBusy || !editorialThread || draft.threadId !== editorialThread.threadId || draft.sectionId !== focusId) return false;
    setMemberVersionBusy(true); setEditorialFailure(null); setAdoptionOutcome(null);
    try {
      const res = await apiFetch('/api/writers-studio/editorial/version', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ threadId: draft.threadId, supersedes: draft.supersedes, replacementText: draft.text, ...(draft.purpose ? { purpose: draft.purpose } : {}) }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || typeof body?.versionId !== 'string') {
        setEditorialFailure(res.status === 409
          ? 'This conversation gained another version. Your wording and the version you answered are retained; nothing was applied.'
          : 'Your revision could not be saved. Its wording is still held here; nothing was applied.');
        return false;
      }
      setSuggestedVersionId(body.versionId);
      const reread = await readBoundEditorialThread(draft.threadId, draft.sectionId);
      if (reread.ok) { setEditorialThread(reread.thread); setSuggestedVersionId(body.versionId); }
      else setEditorialFailure('Your version was saved, but the conversation could not be refreshed. Reopen it before applying. Nothing was applied.');
      return true;
    } catch {
      setEditorialFailure('The save could not be confirmed. Your wording is held here. Reopen the conversation to check before submitting again.');
      return false;
    } finally { setMemberVersionBusy(false); }
  }, [memberVersionBusy, editorialThread, focusId]);

  const useSelectedChanges = useCallback(async () => {
    if (!composition || !editorialThread || !focusId || !suggestedVersion) return;
    if (composition.taken === 0) return;
    /* ⛔ Every mark taken IS MAIA's proposal. It is already a version; a second
       one would only misattribute it. */
    if (composition.everyMark) { await applySuggested(); return; }
    await saveMemberRevision({
      threadId: editorialThread.threadId, sectionId: focusId,
      supersedes: suggestedVersion.id, text: composition.text,
    });
  }, [composition, editorialThread, focusId, suggestedVersion,
      applySuggested, saveMemberRevision]);

  /* The PAGE's variables. The ROOM's arrive from the Studio layout's
     provider and are simply inherited — this room states none of its own.
     Applied to the writing field alone, per the law at their definition:
     Dark emits {} and the field then inherits whatever room the writer
     chose. `--ws-bg` is never among them, so a page can never repaint the
     room around it. */
  const canvasSurfaceVars = useCanvasSurfaceVariables();

  if (phase !== 'ready' || !context) {
    return (
      <main style={{ minHeight: '100vh', background: '#F2F0EA', color: '#26231E', display: 'grid', placeItems: 'center', fontFamily: SANS }}>
        <div style={{ maxWidth: 480, textAlign: 'center', padding: 32 }}>
          {phase === 'loading' && 'Opening the rebuilt Writer’s Studio…'}
          {phase === 'unauthorized' && 'Sign in to open your Writer’s Studio.'}
          {phase === 'error' && (message ?? 'The Studio could not be opened.')}
        </div>
      </main>
    );
  }

  return (
    <>
    <RebuildWritingBoundary
      key={`${context.manuscriptId}:${writingEpoch}`}
      manuscriptId={context.manuscriptId}
      version={context.version}
      sections={context.sections}
      initialSectionId={focusId}
      epoch={writingEpoch}
    >
      {(writing) => {
        writingRef.current = writing;
        const liveChapterSections = (chapter?.sections ?? (focusSection ? [focusSection] : [])).map((section) => ({
          ...section, body: writing.bodyOf(section.draftSectionId),
        }));
        const liveChapterWords = wordCount(liveChapterSections);
        const statuses = liveChapterSections.map((section) => writing.statusOf(section.draftSectionId));
        const saveState = statuses.includes('conflict') ? 'Needs attention'
          : statuses.includes('error') ? 'Save unavailable'
            : statuses.includes('dirty') ? 'Unsaved'
              : statuses.includes('saving') ? 'Saving…' : null;
        return (
    <main data-pure-canvas={canvasExpanded ? 'true' : 'false'} style={{ height: '100vh', overflow: 'hidden', background: C.shell, color: C.ink, fontFamily: SANS } as React.CSSProperties}>
      {!canvasExpanded && (<header className="wsr-header" style={{ height: 58, display: 'grid', gridTemplateColumns: '300px 1fr 300px', alignItems: 'center', padding: '0 20px', borderBottom: `1px solid ${C.soft}`, background: C.field }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <Link
            href="/maia"
            aria-label="Return to MAIA"
            title="Return to MAIA"
            style={{ color: C.ink, fontSize: 12, textDecoration: 'none', letterSpacing: '.08em' }}
          >
            <span aria-hidden="true">←</span> MAIA
          </Link>
          <span style={{ color: C.quiet, fontSize: 13 }}>|</span>
          <span style={{ fontFamily: SERIF, fontSize: 17 }}>Writer’s Studio</span>
        </div>
        <nav className="wsr-modebar" style={{ display: 'flex', justifyContent: 'center' }}>
          <StudioModeBar current="write" manuscriptId={context.manuscriptId} currentSectionId={focusId} />
        </nav>
        {/* ── APPEARANCE ───────────────────────────────────────────────────
            The SAME control Home and the Canvas mount, writing the SAME
            preference. Not a second setting that could disagree with them.
            It is absent from Pure Canvas by construction — this whole header
            is, and a writer who asked for nothing but the page should not be
            handed a toolbar. */}
        <div className="wsr-preview" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, fontSize: 12, color: C.muted }}>
          <span>Rebuild preview</span>
          <AppearanceMenu />
        </div>
      </header>)}
      {canvasExpanded && (
        <div className="wsr-pure-exit">
          <button type="button" className="wsr-return-workspace" onClick={() => setCanvasExpanded(false)} aria-label="Return to Writer’s Studio workspace">
            <span aria-hidden="true">←</span> Workspace
          </button>
          <Link className="wsr-return-workbench" href="/writers-studio" aria-label="Return to Writer’s Studio workbench">
            Workbench
          </Link>
        </div>
      )}

      <div className={`wsr-grid ${canvasExpanded ? 'wsr-pure-grid' : ''}`} style={{ height: canvasExpanded ? '100vh' : 'calc(100vh - 58px)', display: 'grid', gridTemplateColumns: canvasExpanded ? 'minmax(0, 1fr)' : workspaceOpen ? '250px minmax(0, 1fr)' : '286px minmax(520px, 1fr) 390px' }}>
        {!canvasExpanded && (<aside className={`wsr-outline ${mobilePane !== 'outline' ? 'wsr-mobile-hidden' : ''}`} style={{ borderRight: `1px solid ${C.soft}`, background: C.panel, overflowY: 'auto', padding: 16 }}>
          <Link href="/writers-studio" aria-label="Return to all Writer’s Studio works" style={{ display: 'inline-block', color: C.muted, fontSize: 12, padding: '3px 2px 15px', textDecoration: 'none' }}>‹ All Works</Link>
          <div style={{ border: `1px solid ${C.soft}`, borderRadius: 12, background: C.field, padding: 14, marginBottom: 18 }}>
            <div style={{ fontFamily: SERIF, fontSize: 17, marginBottom: 4 }}>{title}</div>
            <div data-work-context={workContext.kind} style={{ fontSize: 11.5, lineHeight: 1.45, color: C.muted }}>
              {workContextSentence}
            </div>
            {workContext.kind === 'none' && (
              <button type="button" data-make-this-a-work onClick={() => void makeThisAWork()} disabled={workDeclarationBusy}
                style={{ marginTop: 9, border: 0, background: 'transparent', padding: 0, color: C.gold, fontSize: 11.5, cursor: workDeclarationBusy ? 'wait' : 'pointer', textDecoration: 'underline', textUnderlineOffset: 4 }}>
                {workDeclarationBusy ? 'Making this a Work…' : 'Make this a Work'}
              </button>
            )}
            {workContext.kind === 'ambiguous' && (
              <div style={{ marginTop: 7, fontSize: 10.5, color: C.quiet }}>
                {workContext.works.map((candidate) => candidate.title ?? 'Unnamed Work').join(' · ')}
              </div>
            )}
            {workDeclarationMessage && <div role="status" style={{ marginTop: 7, fontSize: 10.5, color: C.muted }}>{workDeclarationMessage}</div>}
          </div>
          {/* D2 — the rail names only what this surface can actually do.
              The old block rendered Materials, Notes, Versions and Goals as
              destination-shaped rows although none had a route or panel here;
              Versions also carried a literal `5` and Materials a literal `0`.
              The rail below now projects member-authored book structure; imported section order is navigation only, never book hierarchy. */}
          <div data-workbench-scope="manuscript" style={{ padding: '1px 6px 8px', color: C.quiet, fontSize: 10.5, letterSpacing: '.14em', fontWeight: 700 }}>BOOK STRUCTURE</div>
          {structureNotice ? (
            <div role="status" style={{ fontSize: 11, lineHeight: 1.45, color: C.muted, padding: '4px 6px 12px' }}>{structureNotice}</div>
          ) : authoredStructure ? (
            authoredStructure.roots.length > 0 ? (
              <div data-authored-structure style={{ display: 'grid', gap: 2 }}>
                <div style={{ fontSize: 10, color: C.quiet, padding: '0 6px 7px' }}>Member-authored structure</div>
                {authoredStructure.roots.map((node) => (
                  <AuthoredStructureBranch key={node.id} node={node} focusId={focusId}
                    onSelect={(id) => selectSection(id, 'section')} />
                ))}
                {authoredStructure.unplacedSectionIds.length > 0 && (
                  <details data-unplaced-structure style={{ marginTop: 8 }}>
                    <summary style={{ cursor: 'pointer', fontSize: 11, color: C.muted, padding: '6px' }}>
                      {authoredStructure.unplacedSectionIds.length} sections not organized yet
                    </summary>
                    <div style={{ display: 'grid', gap: 1, marginTop: 4 }}>
                      {authoredStructure.unplacedSectionIds.map((id) => {
                        const section = context.sections.find((candidate) => candidate.draftSectionId === id);
                        if (!section) return null;
                        return (
                          <button key={id} type="button" onClick={() => selectSection(id, 'section')}
                            style={{ width: '100%', textAlign: 'left', border: 0, borderLeft: focusId === id ? `3px solid ${C.gold}` : '3px solid transparent', borderRadius: 6, background: focusId === id ? C.active : 'transparent', color: C.secondary, padding: '6px 8px', fontSize: 11.5, cursor: 'pointer' }}>
                            {section.heading ?? `Section ${section.position + 1}`}
                          </button>
                        );
                      })}
                    </div>
                  </details>
                )}
              </div>
            ) : hasImportedStructure ? (
              <div data-imported-structure style={{ display: 'grid', gap: 2 }}>
                <div style={{ fontSize: 10, lineHeight: 1.35, color: C.quiet, padding: '0 6px 7px' }}>Structure carried by the manuscript source</div>
                {importedStructureTree.map((node) => (
                  <ImportedStructureBranch key={node.draftSectionId} node={node} focusId={focusId} onSelect={selectSection} />
                ))}
              </div>
            ) : (
              <div data-authored-structure style={{ display: 'grid', gap: 2 }}>
                <div style={{ fontSize: 11, lineHeight: 1.45, color: C.muted, padding: '4px 6px 10px' }}>No book hierarchy is established in this manuscript yet.</div>
                {authoredStructure.unplacedSectionIds.length > 0 && (
                  <details data-unplaced-structure style={{ marginTop: 4 }}>
                    <summary style={{ cursor: 'pointer', fontSize: 11, color: C.muted, padding: '6px' }}>{authoredStructure.unplacedSectionIds.length} sections not organized yet</summary>
                    <div style={{ display: 'grid', gap: 1, marginTop: 4 }}>
                      {authoredStructure.unplacedSectionIds.map((id) => {
                        const section = context.sections.find((candidate) => candidate.draftSectionId === id);
                        if (!section) return null;
                        return <button key={id} type="button" onClick={() => selectSection(id, 'section')} style={{ width: '100%', textAlign: 'left', border: 0, background: focusId === id ? C.active : 'transparent', color: C.secondary, padding: '6px 8px', fontSize: 11.5, cursor: 'pointer' }}>{section.heading ?? `Section ${section.position + 1}`}</button>;
                      })}
                    </div>
                  </details>
                )}
              </div>
            )
          ) : (
            <div style={{ fontSize: 11, color: C.quiet, padding: '4px 6px' }}>Reading the book structure…</div>
          )}

          {work && (
            <div data-work-materials style={{ marginTop: 22, paddingTop: 16, borderTop: `1px solid ${C.soft}` }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, padding: '0 6px 8px' }}>
                <div style={{ color: C.quiet, fontSize: 10.5, letterSpacing: '.14em', fontWeight: 700 }}>MATERIALS</div>
                <a href={SOURCE_INTAKE_HREF} style={{ color: C.gold, fontSize: 10.5, textDecoration: 'underline', textUnderlineOffset: 3 }}>bring in</a>
              </div>
              {workSourceMaterials.length > 0 ? (
                <div style={{ display: 'grid', gap: 7 }}>
                  {workSourceMaterials.map((material) => {
                    const source = sourceById.get(material.materialId);
                    return (
                      <div key={`source:${material.materialId}`} style={{ padding: '7px 8px', borderRadius: 6, background: C.field }}>
                        <a href={`/api/writers-studio/sources/${material.materialId}/file`} target="_blank" rel="noreferrer"
                          style={{ display: 'block', color: C.secondary, fontSize: 11.5, lineHeight: 1.35, textDecoration: 'none', overflowWrap: 'anywhere' }}>
                          {source?.originalName ?? 'Source material'}
                        </a>
                        {material.sentence && <div style={{ marginTop: 3, color: C.quiet, fontSize: 10.5, lineHeight: 1.35 }}>{material.sentence}</div>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <a href={SOURCE_INTAKE_HREF} style={{ display: 'block', padding: '4px 6px', color: C.muted, fontSize: 11, lineHeight: 1.45, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                  Bring notes or source material to this Work
                </a>
              )}
            </div>
          )}
        </aside>)}

        <section
          className={canvasExpanded ? 'wsr-manuscript wsr-pure-manuscript' : `wsr-manuscript ${mobilePane !== 'manuscript' ? 'wsr-mobile-hidden' : ''}`}
          data-panel-role="writing-field"
          data-canvas-surface={canvasSurfaceVars['--ws-ground-field'] ? 'material' : 'studio'}
          style={{
            ...canvasSurfaceVars,
            /* The page's ink, stated on the page itself. Setting the variables
               is not enough alone: anything inheriting its colour resolves
               against whatever ancestor last declared one, and that ancestor
               is the room. Declaring it here makes the field the nearest
               answer for everything inside it. */
            background: C.field, color: C.ink,
            minWidth: 0, minHeight: 0, height: '100%', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
          } as React.CSSProperties}
        >
          {!canvasExpanded && (<div style={{ minHeight: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, padding: '10px 24px', borderBottom: `1px solid ${C.soft}` }}>
            <div style={{ minWidth: 0, fontSize: 12.5, color: C.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <strong style={{ color: C.secondary, fontWeight: 600 }}>{title}</strong>
              <span style={{ padding: '0 7px', color: C.quiet }}>/</span>{chapterTitle}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
              <button type="button" className="ws-inline-open" aria-pressed={workspaceOpen} disabled={editorialBusy || adoptionBusy || memberVersionBusy} onClick={() => workspaceOpen ? closeWorkspace() : openWorkspace()}>{workspaceOpen ? 'Clean manuscript' : 'Show editorial layer'}</button>
              <button type="button" disabled={!chapter} title={chapter ? 'Switch between chapter and passage focus' : 'Chapter focus becomes available when this section belongs to a confirmed chapter.'}
                onClick={() => chapter && setMaiaMode(maiaMode === 'chapter' ? 'passage' : 'chapter')}
                style={{ border: `1px solid ${C.rule}`, borderRadius: 999, background: C.panel, padding: '8px 12px', color: C.secondary, fontSize: 11.5, cursor: chapter ? 'pointer' : 'default', opacity: chapter ? 1 : .72 }}>
                {maiaMode === 'chapter' ? `▣ Reviewing entire chapter` : selectedPassage ? `◎ Focused passage · ${focusName}` : `◎ Focused section · ${focusName}`}{chapter ? ' ⌄' : ''}
              </button>
              <button type="button" data-pure-canvas-toggle aria-label="Open Pure Canvas" title="Pure Canvas" onClick={() => setCanvasExpanded(true)}
                style={{ border: 0, background: 'transparent', color: C.quiet, padding: '7px 5px', fontSize: 16, lineHeight: 1, cursor: 'pointer', opacity: .58 }}>
                ↗
              </button>
            </div>
          </div>)}

          <div data-manuscript-scroll className={canvasExpanded ? 'wsr-pure-scroll' : undefined} style={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', padding: canvasExpanded ? '72px clamp(40px, 14vw, 220px) 120px' : '48px clamp(34px, 7vw, 100px) 90px' }}>
            <article style={{ maxWidth: workspaceOpen ? 1040 : canvasExpanded ? 840 : 760, margin: '0 auto', fontFamily: SERIF }}>
              {chapter ? (
                <>
                  <div data-canvas-heading-level="chapter" style={{ color: C.gold, fontFamily: SANS, fontSize: 10.5, letterSpacing: '.16em', fontWeight: 700, marginBottom: 9 }}>CHAPTER {chapter.root.heading?.match(/Chapter\s+(\d+)/i)?.[1] ?? ''}</div>
                  <h1 style={{ fontSize: 'clamp(34px, 4vw, 56px)', lineHeight: 1.05, fontWeight: 420, margin: '0 0 14px' }}>{chapterName}</h1>
                </>
              ) : (
                <>
                  <div data-canvas-heading-level="unplaced" style={{ color: C.quiet, fontFamily: SANS, fontSize: 10, letterSpacing: '.16em', fontWeight: 700, marginBottom: 8 }}>SECTION · STRUCTURE NOT YET CONFIRMED</div>
                  <h1 style={{ fontSize: 'clamp(28px, 3.2vw, 42px)', lineHeight: 1.08, fontWeight: 430, margin: '0 0 12px' }}>{focusName}</h1>
                </>
              )}
              <div style={{ height: 1, background: C.soft, marginBottom: 28 }} />

              {maiaMode === 'chapter' && chapter && !canvasExpanded && (
                <div style={{ border: `1px solid ${C.soft}`, background: C.panel, borderRadius: 12, padding: '13px 15px', marginBottom: 34, fontFamily: SANS, display: 'flex', justifyContent: 'space-between', gap: 20 }}>
                  <div><strong style={{ fontSize: 12.5 }}>Full chapter in review</strong><div style={{ fontSize: 11.5, color: C.muted, marginTop: 3 }}>MAIA will read positions {chapter?.sections[0]?.position}–{chapter?.sections.at(-1)?.position}. Select any section to work there directly.</div></div>
                  <span style={{ color: C.gold, fontSize: 12, whiteSpace: 'nowrap' }}>{chapter?.sections.length ?? 0} sections</span>
                </div>
              )}

              {(chapter?.sections ?? [focusSection].filter(Boolean) as RebuildSection[]).map((section) => {
                const focused = !canvasExpanded && section.draftSectionId === focusId && maiaMode === 'passage';
                const isRoot = chapter ? section.draftSectionId === chapter.root.draftSectionId : section.draftSectionId === focusId;
                const held = selectedPassage?.draftSectionId === section.draftSectionId
                  ? selectedPassage : null;
                const liveBody = writing.bodyOf(section.draftSectionId);
                return (
                  <section key={section.draftSectionId}
                    ref={(el) => { if (el) sectionRefs.current.set(section.draftSectionId, el); else sectionRefs.current.delete(section.draftSectionId); }}
                    data-rebuild-section={section.draftSectionId}
                    style={{ scrollMarginTop: 24, marginBottom: 34, padding: focused ? '2px 0 2px 16px' : 0, borderLeft: focused ? `2px solid ${C.gold}` : '2px solid transparent', background: 'transparent' }}>
                    {!isRoot && section.heading && (
                      section.headingDepth === 2 ? (
                        <div data-canvas-heading-level="section" style={{ margin: '42px 0 16px' }}>
                          <div style={{ fontFamily: SANS, fontSize: 9.5, letterSpacing: '.15em', fontWeight: 700, color: C.gold, marginBottom: 7 }}>SECTION</div>
                          <h2 style={{ fontSize: 27, lineHeight: 1.16, fontWeight: 480, margin: 0, color: C.ink }}>{section.heading}</h2>
                        </div>
                      ) : section.headingDepth === 3 ? (
                        <h3 data-canvas-heading-level="subsection" style={{ fontSize: 19, lineHeight: 1.24, fontWeight: 600, margin: '30px 0 12px', color: C.secondary }}>{section.heading}</h3>
                      ) : (
                        <h3 data-canvas-heading-level="unconfirmed" style={{ fontFamily: SANS, fontSize: 15.5, lineHeight: 1.3, fontWeight: 650, letterSpacing: '.025em', margin: '26px 0 11px', color: C.muted }}>{section.heading}</h3>
                      )
                    )}
                    {workspaceOpen && review && <div className="ws-section-observations" aria-label="Section observations">
                      {findingsForSection(review.findings, section.draftSectionId).map((finding, index) => <button key={finding.id} type="button"
                        disabled={editorialBusy || adoptionBusy || memberVersionBusy}
                        onClick={() => { focusWritingSection(section.draftSectionId); openWorkspace({ readingId: finding.readingId, key: finding.id.slice(finding.readingId.length + 1) }); }}>
                        {index + 1} · {reviewLensLabel(finding.lens)}{reviewNeedsRefresh ? ' · earlier reading' : ''}
                      </button>)}
                    </div>}
                    <div hidden={workspaceOpen && section.draftSectionId === focusId}><RebuildAuthoredBody
                      section={section}
                      body={liveBody}
                      held={held ? { start: held.start, end: held.end } : null}
                      onEdit={(body) => writing.editSection(section.draftSectionId, body)}
                      onEditingBegan={() => beginWriting(section.draftSectionId)}
                      onFocusPlace={() => focusWritingSection(section.draftSectionId)}
                      onCaptureBeforeBlur={(body) => writing.captureForUnmount(section.draftSectionId, body)}
                      onSelectPassage={(start, end, text) => holdPassage(section, start, end, text)}
                    /></div>
                    {section.draftSectionId === focusId && <div hidden={!workspaceOpen}>
                      <ManuscriptPassage body={liveBody} range={held}
                        proposal={inlinePreview?.scopeKey === editorialScope ? inlinePreview : null}
                        onEditAction={editAction}
                        selectedEdits={selectedEdits}
                        proposalRationale={suggestedVersion?.rationale ?? null}>
                        {composition && composition.total > 0 && <div className="ws-compose-bar" data-compose-bar>
                          <span>{composition.taken === 0
                            ? `${composition.total} suggested change${composition.total === 1 ? '' : 's'} · none taken`
                            : `${composition.taken} of ${composition.total} taken`}</span>
                          <button type="button" className="wsi-primary"
                            disabled={composition.taken === 0 || adoptionBusy || memberVersionBusy || editorialBusy}
                            onClick={() => void useSelectedChanges()}>
                            {composition.everyMark ? 'Use all of these changes' : 'Use selected changes'}
                          </button>
                          {composition.taken > 0 && <button type="button"
                            onClick={() => setSelectedEdits(new Set())}>Keep all of mine</button>}
                        </div>}
                        <div ref={setEditorialAnchor} data-inline-editorial-anchor />
                      </ManuscriptPassage>
                    </div>}
                    {workspaceOpen && section.editable && <button type="button" className="ws-inline-open" disabled={editorialBusy || adoptionBusy || memberVersionBusy} onClick={() => { focusWritingSection(section.draftSectionId); setWorkspaceOpen(true); setMobilePane('manuscript'); }}>
                      {section.draftSectionId === focusId && workspaceOpen ? 'Editorial passage open' : 'Explore this section with MAIA'}
                    </button>}
                  </section>
                );
              })}
            </article>
          </div>
          {!canvasExpanded ? (
            <footer style={{ height: 44, borderTop: `1px solid ${C.soft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', fontSize: 11.5, color: C.muted }}>
              <span>{liveChapterWords.toLocaleString()} words · draft v{writing.currentRevisionId()}{saveState ? ` · ${saveState}` : ''}</span>
              <span>✦ Ask MAIA &nbsp;&nbsp; Aa⌄ &nbsp;&nbsp; ☷</span>
            </footer>
          ) : saveState ? (
            <div className="wsr-pure-save-state" role="status">{saveState}</div>
          ) : null}
        </section>

        {!canvasExpanded && !workspaceOpen && (<aside className={`wsr-maia ${mobilePane !== 'maia' ? 'wsr-mobile-hidden' : ''}`} style={{ borderLeft: `1px solid ${C.soft}`, background: C.panel, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '18px 18px 14px', borderBottom: `1px solid ${C.soft}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <div style={{ fontFamily: SERIF, fontSize: 19 }}>✦ MAIA</div>
                <div style={{ color: C.muted, fontSize: 11.5, marginTop: 2 }}>
                  In relation to {work ? 'Work' : 'manuscript'}: <strong style={{ color: C.secondary }}>{work?.title ?? title}</strong>
                </div>
              </div>
              <span style={{ color: C.quiet }}>•••</span>
            </div>
            <GoldLine manuscriptId={context.manuscriptId} />
            <button type="button" data-write-work-on-canvas onClick={() => openWorkspace()}
              style={{ width: '100%', marginBottom: 12, padding: '10px 12px', borderRadius: 9, border: `1px solid ${C.rule}`, color: C.ink, background: C.active, cursor: 'pointer' }}>Work on canvas</button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: C.field, border: `1px solid ${C.soft}`, borderRadius: 999, padding: 3 }}>
              <button type="button" disabled={!chapter} title={chapter ? 'Review the confirmed chapter' : 'Chapter Review needs a confirmed chapter boundary.'}
                onClick={() => chapter && setMaiaMode('chapter')} style={{ border: 0, borderRadius: 999, padding: '8px 10px', cursor: chapter ? 'pointer' : 'default', opacity: chapter ? 1 : .45, background: maiaMode === 'chapter' ? C.goldFill : 'transparent', color: C.ink, fontWeight: maiaMode === 'chapter' ? 700 : 450, fontSize: 11.5 }}>Chapter Review</button>
              <button type="button" onClick={() => setMaiaMode('passage')} style={{ border: 0, borderRadius: 999, padding: '8px 10px', cursor: 'pointer', background: maiaMode === 'passage' ? C.goldFill : 'transparent', color: C.ink, fontWeight: maiaMode === 'passage' ? 700 : 450, fontSize: 11.5 }}>Passage Work</button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 18 }}>
            {maiaMode === 'chapter' ? (
              <div>
                <div style={{ border: `1px solid ${C.soft}`, borderRadius: 14, background: C.field, padding: 18, marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: C.gold, fontWeight: 750, letterSpacing: '.08em', marginBottom: 8 }}>CHAPTER REVIEW</div>
                  <h3 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 500, margin: '0 0 8px' }}>
                    {reviewPhase === 'ready' ? 'Chapter review complete'
                      : reviewPhase === 'partial' ? 'Chapter review partially complete'
                      : `Read ${chapterName} as a whole`}
                  </h3>
                  <p style={{ fontSize: 12.5, lineHeight: 1.55, color: C.muted, margin: '0 0 16px' }}>
                    {reviewPhase === 'reading' && reviewProgress
                      ? `MAIA is reading ${reviewProgress.lens} · ${Math.min(reviewProgress.done + 1, reviewProgress.total)} of ${reviewProgress.total}.`
                      : reviewPhase === 'ready'
                        ? `MAIA read all ${chapter?.sections.length ?? 0} sections through ${DEVELOPMENTAL_LENSES.length} developmental lenses. Her frozen findings stay available as you work.`
                        : reviewPhase === 'partial'
                          ? ((review?.remaining.length ?? 0) > 0
                            /* ⭐ *Not attempted* is not *failed*, and the writer
                               is owed the difference: one says the reading was
                               refused, the other says it was never asked for
                               and is theirs to ask for now. */
                            ? `${review?.readingIds.length ?? 0} of ${DEVELOPMENTAL_LENSES.length} readings completed and are kept. MAIA stopped after a reading could not finish, rather than working through the rest. ${review?.remaining.length} were not attempted.`
                            : `MAIA kept every reading that completed. ${review?.failures.length ?? 0} lens${review?.failures.length === 1 ? '' : 'es'} could not complete, so this is not labeled a full review.`)
                          : 'MAIA will read this chapter first, then keep her findings available while you move into individual sections.'}
                  </p>
                  {/* ⭐⭐ A NEW MEMBER GESTURE, ⛔ NOT A HIDDEN RETRY. It
                      commissions only the lenses that were never asked; a lens
                      that refused stays refused, because one commission is one
                      reading. */}
                  {reviewPhase === 'partial' && (review?.remaining.length ?? 0) > 0 && (
                    <button type="button" data-continue-remaining
                      disabled={reviewPhase !== 'partial'}
                      onClick={() => void runReview(review!.remaining)}
                      style={{ border: `1px solid ${C.gold}`, borderRadius: 9, background: C.field, padding: '8px 12px', fontSize: 12, color: C.secondary, cursor: 'pointer', margin: '0 0 12px' }}>
                      Continue the {review!.remaining.length} remaining reading{review!.remaining.length === 1 ? '' : 's'}
                    </button>
                  )}
                  {reviewManifestRefusal && (
                    <div data-manifest-refusal={reviewManifestRefusal} hidden />
                  )}
                  {reviewContinuityMessage && (
                    <div role="status" data-review-continuity-message style={{ borderRadius: 9, background: C.panel, padding: '9px 10px', fontSize: 10.5, lineHeight: 1.45, color: C.muted, margin: '-5px 0 12px' }}>
                      {reviewContinuityMessage}
                    </div>
                  )}
                  {reviewNeedsRefresh && review && (
                    <div role="status" style={{ borderRadius: 9, background: C.panel, padding: '9px 10px', fontSize: 10.5, lineHeight: 1.45, color: C.muted, margin: '-5px 0 12px' }}>
                      The Work has changed since this reading. These findings are kept as what MAIA noticed then; review again whenever you want her to read the changed chapter.
                    </div>
                  )}
                  <button type="button" data-review-chapter onClick={() => void runReview()} disabled={reviewPhase === 'reading'}
                    style={{ width: '100%', border: 0, borderRadius: 10, padding: '11px 14px', background: C.goldFill, color: C.ink, fontWeight: 750, cursor: reviewPhase === 'reading' ? 'wait' : 'pointer', opacity: reviewPhase === 'reading' ? .65 : 1 }}>
                    {reviewPhase === 'reading' ? '✦ MAIA is reading…' : review ? '↻ Review this chapter again' : '✦ Review this chapter'}
                  </button>
                </div>
                <div data-review-lenses style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 10 }}>
                  {DEVELOPMENTAL_LENSES.map((lens) => {
                    const active = reviewLens === lens;
                    const count = counts[lens] ?? 0;
                    const failure = reviewFailureFor(lens);
                    const readingNow = reviewPhase === 'reading' && reviewProgress?.lens === lens;
                    const complete = completedReviewLenses.has(lens);
                    /* ⭐ The card is the at-a-glance surface, and three cards all
                       reading *Could not complete* is the same undifferentiated
                       state one layer up: the writer must open each one to learn
                       that they failed in different places. Short here, full
                       sentence below. */
                    const failedAt = FAILED_AT[failure?.stage ?? ''] ?? 'Could not be confirmed';
                    const status = failure ? failedAt
                      : readingNow ? 'Reading…'
                        : complete ? (count === 0 ? 'Complete · no observations' : active ? 'Showing findings from this lens.' : 'Open findings from this lens.')
                          : reviewPhase === 'reading' ? 'Waiting in this review.' : review ? 'No completed reading in this review.' : 'Waiting for MAIA’s chapter reading.';
                    const badge = failure ? '!' : readingNow ? '…' : complete ? String(count) : '—';
                    return (
                      <button key={lens} type="button" data-review-lens={lens} data-review-lens-state={failure ? 'failed' : readingNow ? 'reading' : complete ? 'complete' : 'waiting'}
                        aria-pressed={active} aria-expanded={active && reviewFindingsOpen}
                        disabled={!review} onClick={() => { setReviewLens(lens); setReviewFindingsOpen((open) => reviewLens === lens ? !open : true); }}
                        style={{ border: `1px solid ${active ? C.gold : C.soft}`, borderRadius: 11, background: active ? C.active : C.field, padding: 12, minHeight: 74, textAlign: 'left', color: C.secondary, cursor: review ? 'pointer' : 'default', opacity: review ? 1 : .72 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 11.5, fontWeight: 700 }}>
                          <span>{reviewLensLabel(lens)}</span><span style={{ color: failure ? C.muted : C.gold }}>{badge}</span>
                        </div>
                        <div style={{ fontSize: 11, color: failure ? C.muted : active ? C.muted : C.quiet, marginTop: 6 }}>{status}</div>
                      </button>
                    );
                  })}
                </div>
                {review && (review.findings.length > 0 || review.failures.length > 0) && (
                  <div data-review-findings-navigator style={{ marginBottom: 18 }}>
                    {review.findings.length > 0 && (
                      <button type="button" data-review-all-findings aria-pressed={reviewLens === 'all'} aria-expanded={reviewLens === 'all' && reviewFindingsOpen} onClick={() => { setReviewLens('all'); setReviewFindingsOpen((open) => reviewLens === 'all' ? !open : true); }}
                        style={{ width: '100%', textAlign: 'left', border: `1px solid ${reviewLens === 'all' ? C.gold : C.soft}`, borderRadius: 11, background: reviewLens === 'all' ? C.active : C.field, padding: '10px 12px', color: C.secondary, cursor: 'pointer', fontSize: 11.5, fontWeight: 700 }}>
                        Every finding · {review.findings.length}<span style={{ float: 'right', color: C.quiet }}>{reviewLens === 'all' && reviewFindingsOpen ? '▾' : '▸'}</span>
                      </button>
                    )}
                    {reviewFindingsOpen && reviewLens !== 'all' && reviewFailureFor(reviewLens) && (
                      <section data-review-lens-failure={reviewLens} role="status"
                        style={{ border: `1px solid ${C.soft}`, borderRadius: 11, background: C.field, marginTop: 8, padding: '11px 12px' }}>
                        <strong style={{ fontSize: 11.5, color: C.secondary }}>{reviewLensLabel(reviewLens)} · could not complete</strong>
                        <p style={{ fontSize: 11.5, lineHeight: 1.5, color: C.muted, margin: '6px 0 0' }}>{reviewFailureCopy(reviewLens)}</p>
                      </section>
                    )}
                    {reviewFindingsOpen && (reviewLens === 'all' || !reviewFailureFor(reviewLens)) && (reviewLens === 'all' || completedReviewLenses.has(reviewLens)) && (
                      <section data-review-findings-panel aria-label={reviewLens === 'all' ? 'Every chapter review finding' : `${reviewLensLabel(reviewLens)} findings`}
                        style={{ border: `1px solid ${C.soft}`, borderRadius: 11, background: C.field, marginTop: 8, maxHeight: 'min(46vh, 520px)', overflowY: 'auto', overscrollBehavior: 'contain' }}>
                        <div style={{ position: 'sticky', top: 0, zIndex: 1, display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline', padding: '10px 12px 8px', background: C.field, borderBottom: `1px solid ${C.soft}` }}>
                          <strong style={{ fontSize: 11.5, color: C.secondary }}>{reviewLens === 'all' ? 'Every finding' : reviewLensLabel(reviewLens)}</strong>
                          <span style={{ fontSize: 10, color: C.quiet }}>{visibleReviewFindings.length} observation{visibleReviewFindings.length === 1 ? '' : 's'}</span>
                        </div>
                        <div data-review-findings-scroll style={{ display: 'grid', gap: 9, padding: '10px 12px 12px' }}>
                          {visibleReviewFindings.length === 0 && reviewLens !== 'all' ? (
                            <p style={{ fontSize: 11.5, lineHeight: 1.5, color: C.muted, margin: 0 }}>MAIA completed this lens and reported no observations.</p>
                          ) : visibleReviewFindings.map((finding, index) => {
                            const target = finding.sectionIds.find((id) => context?.sections.some((section) => section.draftSectionId === id)) ?? null;
                            return (
                              <article key={finding.id} data-review-finding={finding.id} style={{ borderTop: index === 0 ? 0 : `1px solid ${C.soft}`, paddingTop: index === 0 ? 0 : 9 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
                                  <span style={{ fontSize: 10.5, color: C.gold, fontWeight: 750 }}>{reviewLensLabel(finding.lens)}</span>
                                  <span style={{ fontSize: 9.5, color: C.quiet }}>{finding.state}</span>
                                </div>
                                <p style={{ fontSize: 12, lineHeight: 1.5, color: C.secondary, margin: '4px 0 0' }}>{finding.observation}</p>
                                <button type="button" onClick={() => openWorkspace({ readingId: finding.readingId, key: finding.id.slice(finding.readingId.length + 1) })}
                                  data-review-work-on-canvas={finding.id}
                                  style={{ border: `1px solid ${C.soft}`, borderRadius: 7, padding: '7px 9px', marginTop: 8, color: C.ink, background: C.panel, cursor: 'pointer' }}>Work on canvas</button>
                                {target && (
                                  <button type="button" onClick={() => openReviewFinding(finding)} data-open-review-finding={finding.id}
                                    style={{ border: 0, background: 'transparent', color: C.gold, padding: '7px 0 0', fontSize: 10.5, cursor: 'pointer' }}>
                                    Show in manuscript →
                                  </button>
                                )}
                              </article>
                            );
                          })}
                        </div>
                      </section>
                    )}
                  </div>
                )}
                <div style={{ fontSize: 11, color: C.quiet, letterSpacing: '.08em', fontWeight: 700, marginBottom: 8 }}>FINDINGS BY SECTION</div>
                {(chapter?.sections.filter((s) => s.headingDepth === 2) ?? []).map((movement) => {
                  const findings = reviewFindingsForMovement(movement);
                  const first = findings[0];
                  return (
                    <button key={movement.draftSectionId} type="button" onClick={() => selectSection(movement.draftSectionId, 'section')}
                      style={{ width: '100%', textAlign: 'left', border: `1px solid ${C.soft}`, borderRadius: 10, background: C.field, padding: '11px 12px', marginBottom: 7, cursor: 'pointer', color: C.secondary }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
                        <span style={{ fontSize: 12, fontWeight: 650 }}>{movement.heading}</span>
                        <span style={{ color: C.quiet, fontSize: 11 }}>{findings.length ? `${findings.length} finding${findings.length === 1 ? '' : 's'} ›` : '›'}</span>
                      </div>
                      <div style={{ fontSize: 11, lineHeight: 1.45, color: C.muted, marginTop: 4 }}>
                        {first?.summary ?? (review ? 'No section-specific observation in this review.' : 'Review the chapter to see MAIA’s findings here.')}
                      </div>
                      {first && <div style={{ marginTop: 6, display: 'inline-block', borderRadius: 999, background: C.active, padding: '3px 7px', fontSize: 9.5, textTransform: 'capitalize', color: C.gold }}>{first.lens}</div>}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div>
                <button type="button" onClick={() => setMaiaMode('chapter')} style={{ border: 0, background: 'transparent', color: C.gold, padding: 0, fontSize: 11.5, cursor: 'pointer', marginBottom: 14 }}>← Back to chapter findings</button>
                <div style={{ border: `1px solid ${C.soft}`, borderRadius: 11, background: C.field, padding: 12, marginBottom: 14 }}>
                  <div style={{ color: C.quiet, fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em' }}>FROM CHAPTER REVIEW</div>
                  {passageReviewFindings.length > 0 ? (
                    <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
                      {passageReviewFindings.map((finding) => (
                        <article key={finding.id} data-section-review-finding={finding.id}>
                          <div style={{ fontSize: 10, color: C.gold, fontWeight: 750, textTransform: 'capitalize' }}>{finding.lens}</div>
                          <div style={{ fontSize: 12, lineHeight: 1.5, color: C.secondary, marginTop: 3 }}>{finding.observation}</div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, lineHeight: 1.5, color: C.muted, marginTop: 5 }}>
                      {review ? 'No section-specific finding was attached here; whole-chapter findings remain available in Chapter Review.' : 'Run Chapter Review first and its section-linked findings will stay here while you work.'}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 11.5, color: C.muted, marginBottom: 7 }}>{selectedPassage ? '◎ Working with selected passage in' : '◎ Working on'}</div>
                <h3 style={{ fontFamily: SERIF, fontSize: 21, margin: '0 0 14px', fontWeight: 500 }}>{focusName}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: `1px solid ${C.soft}`, marginBottom: 16 }}>
                  {([['interpret', 'Interpret'], ['suggest', 'Suggest'], ['explore', 'Explore'], ['ask', 'Ask']] as const).map(([id, label]) => (
                    <button key={id} type="button" onClick={() => setPassageTab(id)}
                      style={{ border: 0, borderBottom: passageTab === id ? `2px solid ${C.gold}` : '2px solid transparent', background: 'transparent', padding: '9px 2px', color: passageTab === id ? C.ink : C.muted, fontSize: 11, cursor: 'pointer' }}>
                      {label}
                    </button>
                  ))}
                </div>

                {passageTab === 'suggest' ? (
                  <div>
                    {relationshipChoices.length > 1 && !editorialThread ? (
                      <div style={{ border: `1px solid ${C.soft}`, borderRadius: 12, background: C.field, padding: 14, marginBottom: 14 }}>
                        <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 5 }}>Continue a revision conversation</div>
                        <div style={{ fontSize: 11.5, lineHeight: 1.5, color: C.muted, marginBottom: 10 }}>You have more than one conversation about this exact section. Choose the one you mean; the Studio will not guess.</div>
                        {relationshipChoices.map((r) => (
                          <button key={r.threadId} type="button" onClick={() => void chooseRelationship(r.threadId)}
                            style={{ width: '100%', textAlign: 'left', border: `1px solid ${C.soft}`, borderRadius: 9, background: C.panel, color: C.secondary, padding: '10px 11px', marginBottom: 7, cursor: 'pointer' }}>
                            <div style={{ fontSize: 11.5, lineHeight: 1.45 }}>{r.locusText.slice(0, 120)}{r.locusText.length > 120 ? '...' : ''}</div>
                            <div style={{ fontSize: 10, color: C.quiet, marginTop: 5 }}>{r.turnCount} turn{r.turnCount === 1 ? '' : 's'} / {r.versionCount} suggestion{r.versionCount === 1 ? '' : 's'}</div>
                          </button>
                        ))}
                        <button type="button" onClick={() => { setEditorialBusy(true); void startNewEditorial().finally(() => setEditorialBusy(false)); }}
                          style={{ border: 0, background: 'transparent', color: C.gold, padding: '5px 0 0', fontSize: 11, cursor: 'pointer' }}>Start a new conversation instead</button>
                      </div>
                    ) : (
                      <>
                        {lastMaiaEditorialTurn && (
                          <div style={{ border: `1px solid ${C.soft}`, borderRadius: 12, background: C.field, padding: 15, marginBottom: 14 }}>
                            <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 7 }}>MAIA's perspective</div>
                            <MaiaListen key={focusId} text={lastMaiaEditorialTurn.body} />
                            <div style={{ fontSize: 12.5, lineHeight: 1.58, color: C.muted, whiteSpace: 'pre-wrap' }}>{lastMaiaEditorialTurn.body}</div>
                          </div>
                        )}

                        {suggestedVersion && editorialThread && (
                          <div data-suggested-revision style={{ border: `1px solid ${C.rule}`, borderRadius: 13, background: C.field, padding: 15, marginBottom: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline', marginBottom: 10 }}>
                              <div><div style={{ fontWeight: 750, fontSize: 12 }}>Suggested revision</div>
                                {suggestedVersion.rationale && <div style={{ fontSize: 10.5, lineHeight: 1.4, color: C.quiet, marginTop: 3 }}>{suggestedVersion.rationale}</div>}
                              </div>
                              <button type="button" onClick={() => setShowChanges((v) => !v)}
                                style={{ border: `1px solid ${C.soft}`, borderRadius: 999, background: C.panel, color: C.muted, padding: '5px 9px', fontSize: 10, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                {showChanges ? 'Side by side' : 'Show changes'}
                              </button>
                            </div>
                            {showChanges && suggestionChange ? (
                              <div style={{ fontFamily: SERIF, fontSize: 13.5, lineHeight: 1.65, borderRadius: 9, background: C.panel, padding: 12, whiteSpace: 'pre-wrap' }}>
                                {suggestionChange.before}<mark style={{ background: 'color-mix(in srgb, var(--ws-gold-fill, #CDBD91) 60%, transparent)', color: 'inherit', padding: '1px 0' }}>{suggestionChange.changed}</mark>{suggestionChange.after}
                              </div>
                            ) : (
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 18px 1fr', gap: 8, alignItems: 'start' }}>
                                <div><div style={{ fontSize: 9.5, color: C.quiet, marginBottom: 5 }}>CURRENT</div><div style={{ fontFamily: SERIF, fontSize: 11.5, lineHeight: 1.55, background: C.panel, borderRadius: 8, padding: 9, whiteSpace: 'pre-wrap' }}>{editorialThread.locusText}</div></div>
                                <div style={{ color: C.gold, paddingTop: 28 }}>-&gt;</div>
                                <div><div style={{ fontSize: 9.5, color: C.quiet, marginBottom: 5 }}>SUGGESTED</div><div style={{ fontFamily: SERIF, fontSize: 11.5, lineHeight: 1.55, background: 'color-mix(in srgb, var(--ws-gold-fill, #CDBD91) 24%, transparent)', borderRadius: 8, padding: 9, whiteSpace: 'pre-wrap' }}>{suggestedVersion.wording}</div></div>
                              </div>
                            )}
                            {editorialThread.legacyLocus ? (
                              <div style={{ fontSize: 10.5, color: C.muted, marginTop: 10 }}>This older revision conversation can be read and discussed, but it cannot be safely applied to the Work.</div>
                            ) : (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 12 }}>
                                <button type="button" onClick={() => openWorkspace()} disabled={adoptionBusy}
                                  style={{ border: 0, borderRadius: 9, background: C.goldFill, color: C.ink, padding: '9px 11px', fontWeight: 750, fontSize: 10.5, cursor: adoptionBusy ? 'wait' : 'pointer' }}>
                                  {adoptionBusy ? 'Working...' : 'Review in context'}
                                </button>
                                <button type="button" onClick={tryAnother} style={{ border: `1px solid ${C.soft}`, borderRadius: 9, background: C.panel, color: C.secondary, padding: '9px 11px', fontSize: 10.5, cursor: 'pointer' }}>Try another</button>
                                <button type="button" onClick={discussSuggestion} style={{ border: `1px solid ${C.soft}`, borderRadius: 9, background: C.panel, color: C.secondary, padding: '9px 11px', fontSize: 10.5, cursor: 'pointer' }}>Discuss this</button>
                              </div>
                            )}
                            {adoptionOutcome && appliedVersionId === suggestedVersion?.id && <div role="status" style={{ fontSize: 10.5, lineHeight: 1.45, color: C.gold, marginTop: 9 }}>
                              {adoptionOutcome.kind === 'applied' ? 'Applied to this exact place in the Work.'
                                : adoptionOutcome.kind === 'work_moved' ? 'You have written here since this suggestion was made. Nothing was changed.'
                                  : adoptionOutcome.kind === 'legacy_locus' ? 'This older suggestion cannot be safely applied. Nothing was changed.'
                                  /* ⭐ Says what it is in the writer's terms, and says plainly
                                     that NOTHING was applied — not even the part of the change
                                     that fell outside the quotation. */
                                  : adoptionOutcome.kind === 'protected_quotation' ? 'This suggestion would change the words inside a quotation. Nothing was applied. MAIA can shorten it, move it, cut it, or revise your wording around it.'
                                    : 'The Studio could not apply this suggestion. Nothing was changed.'}
                            </div>}
                          </div>
                        )}

                        {editorialThread && !suggestedVersion && lastMaiaEditorialTurn && (
                          <div style={{ fontSize: 10.5, lineHeight: 1.45, color: C.quiet, margin: '-5px 0 12px' }}>MAIA responded without proposing replacement wording. You can continue the conversation below.</div>
                        )}

                        <textarea value={editorialDraft} onChange={(e) => setEditorialDraft(e.target.value)}
                          placeholder={suggestedVersion ? 'What would you like to discuss or change about this suggestion?' : lastEditorialInstruction ? "Tell MAIA what you'd like different in the next version..." : 'Describe what you want to deepen, change, preserve, or try...'}
                          style={{ width: '100%', minHeight: 92, resize: 'vertical', border: `1px solid ${C.rule}`, borderRadius: 12, background: C.field, color: C.ink, padding: 12, fontFamily: SANS, fontSize: 12.5, outline: 'none', boxSizing: 'border-box' }} />
                        <button type="button" onClick={() => void sendEditorial()} disabled={editorialBusy || !editorialDraft.trim()}
                          style={{ marginTop: 9, width: '100%', border: 0, borderRadius: 10, padding: '11px 14px', background: C.goldFill, color: C.ink, fontWeight: 750, cursor: editorialBusy ? 'wait' : 'pointer', opacity: editorialBusy || !editorialDraft.trim() ? .55 : 1 }}>
                          {editorialBusy ? 'MAIA is working...' : editorialThread ? 'Continue with MAIA' : 'Work with MAIA'}
                        </button>
                        {editorialFailure && <div role="status" style={{ fontSize: 11, lineHeight: 1.45, color: C.gold, marginTop: 9 }}>{editorialFailure}</div>}
                      </>
                    )}
                  </div>
                ) : (
                  <div>
                    <div style={{ border: `1px solid ${C.soft}`, borderRadius: 12, background: C.field, padding: 15, marginBottom: 14 }}>
                      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 7 }}>MAIA's perspective</div>
                      {maiaResponse && <MaiaListen key={focusId} text={maiaResponse} />}
                      <div style={{ fontSize: 12.5, lineHeight: 1.58, color: C.muted, whiteSpace: 'pre-wrap' }}>
                        {maiaResponse ?? (passageTab === 'interpret'
                          ? 'Stay with this part of the Work and ask MAIA what she notices in its meaning, movement, tone, or pattern.'
                          : passageTab === 'explore'
                            ? 'Follow possibilities here without changing the Work. Nothing becomes revision until you explicitly move into Suggest.'
                            : 'Ask MAIA about this exact place. The visible section and the Focus she receives are the same subject.')}
                      </div>
                      {maiaFailure && <div role="status" style={{ fontSize: 11, lineHeight: 1.45, color: C.gold, marginTop: 9 }}>{maiaFailure}</div>}
                    </div>
                    <textarea value={maiaAsk} onChange={(e) => setMaiaAsk(e.target.value)} placeholder={askPlaceholder}
                      style={{ width: '100%', minHeight: 92, resize: 'vertical', border: `1px solid ${C.rule}`, borderRadius: 12, background: C.field, color: C.ink, padding: 12, fontFamily: SANS, fontSize: 12.5, outline: 'none', boxSizing: 'border-box' }} />
                    <button type="button" onClick={() => void askMaia()} disabled={maiaBusy || !focusWire || !work || !maiaAsk.trim()}
                      style={{ marginTop: 9, width: '100%', border: 0, borderRadius: 10, padding: '11px 14px', background: C.goldFill, color: C.ink, fontWeight: 750, cursor: maiaBusy ? 'wait' : 'pointer', opacity: maiaBusy || !focusWire || !work || !maiaAsk.trim() ? .55 : 1 }}>
                      {maiaBusy ? 'MAIA is reading...' : passageTab === 'explore' ? 'Explore with MAIA' : passageTab === 'interpret' ? 'Ask what MAIA notices' : 'Ask MAIA'}
                    </button>
                    {workContext.kind === 'none' && <div style={{ fontSize: 10.5, color: C.quiet, marginTop: 7 }}>This manuscript is not yet declared as a Work. MAIA will not invent that relationship.</div>}
                    {workContext.kind === 'ambiguous' && <div style={{ fontSize: 10.5, color: C.quiet, marginTop: 7 }}>This manuscript belongs to several Works. MAIA will not guess which one you mean.</div>}
                    {workContext.kind === 'unknown' && <div style={{ fontSize: 10.5, color: C.quiet, marginTop: 7 }}>The Studio has not established a Work context for MAIA yet.</div>}
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>)}
      </div>

      {!canvasExpanded && (<div className="wsr-mobile-nav">
        <button type="button" onClick={() => setMobilePane('outline')} data-active={mobilePane === 'outline'}>Outline</button>
        <button type="button" onClick={() => setMobilePane('manuscript')} data-active={mobilePane === 'manuscript'}>Manuscript</button>
        <button type="button" onClick={() => { setWorkspaceOpen(false); setMobilePane('maia'); }} data-active={mobilePane === 'maia'}>MAIA</button>
      </div>)}
      {writingMessage && <div className="wsr-writing-alert" role="status">{writingMessage}</div>}

    </main>
        );
      }}
    </RebuildWritingBoundary>
      <InlineWorkspace anchor={editorialAnchor} open={workspaceOpen}>
        <header className="wsi-inline-header"><strong>01 · {focusName}</strong>
          {workspaceReturn.current?.focusId && workspaceReturn.current.focusId !== focusId && <button type="button" disabled={editorialBusy || adoptionBusy || memberVersionBusy} onClick={returnToStartingPassage}>Return to starting passage</button>}
          <button type="button" disabled={editorialBusy || adoptionBusy || memberVersionBusy} onClick={closeWorkspace}>Clean manuscript · Collapse</button>
        </header>

        <RevisionDesk active={workspaceOpen} inline onPreview={showInlinePreview}
          composedText={composition && composition.taken > 0 ? composition.text : null}
          depth={editorialDepth} onDepth={setEditorialDepth}
          openDraftNonce={openDraftNonce}
          scopeKey={editorialScope} showInspiration={!workspaceInsight} manuscriptId={context.manuscriptId} title={focusName}
          currentText={selectedPassage?.draftSectionId === focusId
            ? Array.from((writingRef.current?.bodyOf(focusId!) ?? focusSection?.body ?? '')).slice(selectedPassage.start, selectedPassage.end).join('')
            : focusId ? (writingRef.current?.bodyOf(focusId) ?? focusSection?.body ?? '') : ''}
          sectionBody={focusId ? (writingRef.current?.bodyOf(focusId) ?? focusSection?.body ?? '') : ''}
          appliedVersionId={editorialThread?.application && !editorialThread.application.undone
            ? editorialThread.application.versionId : appliedVersionId}
          onUndo={editorialThread?.application?.canUndo ? () => void undoSuggested() : undefined}
          undoMessage={undoMessage}
          thread={editorialThread} version={suggestedVersion} instruction={editorialDraft}
          onInstruction={setEditorialDraft} onSend={text => void sendEditorial(text)}
          voiceNotice={voiceNotice}
          latitude={editLatitude} onLatitude={setEditLatitude}
          mayProposeImmediately={mayProposeImmediately} onMayProposeImmediately={setMayProposeImmediately}
          mayRemoveParagraphs={mayRemoveParagraphs} onMayRemoveParagraphs={setMayRemoveParagraphs}
          onSelectVersion={id => { setSuggestedVersionId(id); setAdoptionOutcome(null); setEditorialFailure(null); }} onApply={() => void applySuggested()}
          onSaveMember={saveMemberRevision} busy={editorialBusy || adoptionBusy || memberVersionBusy}
          response={lastMaiaEditorialTurn?.body ?? null}
          message={editorialFailure ?? (adoptionOutcome && appliedVersionId === suggestedVersion?.id ? adoptionOutcome.kind === 'applied'
            ? null : 'The Work could not accept this revision. Nothing was changed.' : null)}
          onKeep={() => { setSuggestedVersionId(null); setAdoptionOutcome(null); setEditorialFailure('Current wording retained. Your saved alternatives remain in the version list.'); }} />
        {workspaceInsight && <details className="wsi-related" open={!suggestedVersionId}>
          {/* ⭐ C6R1 — forced open, this was the second live workspace under the
              decision. Once MAIA has proposed, it closes and renames itself to
              what it now is: the reason for the marks on the page. */}
          <summary>{suggestedVersionId ? 'Reading behind these edits' : 'Observation and related passages'}</summary><InsightReadings key={context.manuscriptId} refreshKey={context.version}
          manuscriptId={context.manuscriptId} readingId={workspaceInsight.readingId} observationKey={workspaceInsight.key}
          onRevise={reviseInsightPassage} onChoosePassage={chooseOwnPassage}
          proposalActive={Boolean(suggestedVersionId)}
          busy={editorialBusy || adoptionBusy || memberVersionBusy} /></details>}
        {relationshipChoices.length > 1 && <div className="wsi-bar" aria-label="Choose revision conversation">
          {relationshipChoices.map((choice, i) => <button key={choice.threadId} type="button" disabled={editorialBusy}
            onClick={() => void chooseRelationship(choice.threadId)}>Conversation {i + 1} · {choice.turnCount} turns</button>)}
        </div>}
      </InlineWorkspace>
    </>
  );
}
