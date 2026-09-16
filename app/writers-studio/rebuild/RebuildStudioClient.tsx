 'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';
import { AppearanceMenu } from '../atmosphere/AppearanceMenu';
import { useCanvasSurfaceVariables } from '../atmosphere/StudioAtmosphere';
import { StudioModeBar } from '../studio/StudioModeBar';
import { SERIF, SANS } from '../studioTheme';
import { useLivingWorks } from '../useLivingWorks';
import { currentWork, resolveWorkContext } from '../workContext';
import { fetchStructure, refusalCopy as structureRefusalCopy, type StructureNodeDTO, type StructureTreeDTO } from '@/lib/writersStudio/structureClient';
import RebuildWritingBoundary from './RebuildWritingBoundary';
import RebuildAuthoredBody from './RebuildAuthoredBody';
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
import { locationForSection, SECTION_PARAM } from '@/lib/writersStudio/placeInWork';
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
  const [writingMessage, setWritingMessage] = useState<string | null>(null);
  const [selectedPassage, setSelectedPassage] = useState<PassageSelection | null>(null);
  const [passageTab, setPassageTab] = useState<PassageTab>('ask');
  const [mobilePane, setMobilePane] = useState<'outline' | 'manuscript' | 'maia'>('manuscript');
  const [review, setReview] = useState<ChapterReviewBundle | null>(null);
  const [reviewPhase, setReviewPhase] = useState<'idle' | 'reading' | 'ready' | 'partial'>('idle');
  const [reviewProgress, setReviewProgress] = useState<{ done: number; total: number; lens: string } | null>(null);
  const [reviewNeedsRefresh, setReviewNeedsRefresh] = useState(false);
  const [reviewContinuityMessage, setReviewContinuityMessage] = useState<string | null>(null);
  const [reviewLens, setReviewLens] = useState<DevelopmentalLens | 'all'>('all');
  const [reviewFindingsOpen, setReviewFindingsOpen] = useState(true);
  const [maiaAsk, setMaiaAsk] = useState('');
  const [maiaResponse, setMaiaResponse] = useState<string | null>(null);
  const [maiaFailure, setMaiaFailure] = useState<string | null>(null);
  const [maiaBusy, setMaiaBusy] = useState(false);
  const [editorialThread, setEditorialThread] = useState<RebuildEditorialThread | null>(null);
  const [editorialDraft, setEditorialDraft] = useState('');
  const [editorialBusy, setEditorialBusy] = useState(false);
  const [editorialFailure, setEditorialFailure] = useState<string | null>(null);
  const [suggestedVersionId, setSuggestedVersionId] = useState<string | null>(null);
  const [showChanges, setShowChanges] = useState(false);
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

  const runReview = useCallback(async () => {
    if (!chapter || !context || reviewPhase === 'reading') return;
    if (!(await settleWriting())) return;
    const reviewRevision = writingRef.current?.currentRevisionId() ?? context.version;
    setReviewContinuityMessage(null);
    setReviewPhase('reading');
    setReviewProgress({ done: 0, total: DEVELOPMENTAL_LENSES.length, lens: DEVELOPMENTAL_LENSES[0]! });
    const bundle = await runChapterReview(context.manuscriptId, chapter.sections, (done, total, lens) => {
      setReviewProgress({ done, total, lens });
    });
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
    }
  }, [chapter, context, reviewPhase, settleWriting]);

  const replaceAddress = useCallback((sectionId: string, threadId: string | null) => {
    if (typeof window === 'undefined') return;
    const placed = locationForSection(window.location.pathname, window.location.search, sectionId);
    const query = placed.includes('?') ? placed.slice(placed.indexOf('?')) : '';
    const next = threadId
      ? canvasWithEditorialThread(window.location.pathname, query, threadId)
      : canvasWithoutEditorialThread(window.location.pathname, query);
    if (next !== window.location.pathname + window.location.search) {
      window.history.replaceState(window.history.state, '', next);
    }
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

  const sendEditorial = useCallback(async () => {
    if (!focusId || !editorialDraft.trim() || editorialBusy) return;
    setEditorialBusy(true); setEditorialFailure(null); setAdoptionOutcome(null);
    const exactWords = editorialDraft;
    try {
      if (!(await settleWriting())) return;
      const thread = await resolveEditorialForAct();
      if (!thread) return;
      const out = await sendBoundEditorialTurn(thread.threadId, focusId, exactWords);
      if (!out.ok) {
        setEditorialFailure(out.reason === 'unavailable'
          ? 'Revision collaboration is not enabled in this build yet. Nothing was written.'
          : 'MAIA could not complete this revision turn. Your manuscript was not changed.');
        return;
      }
      if (!bindEditorialThread(out.thread)) return;
      setLastEditorialInstruction(exactWords);
      setSuggestedVersionId(out.producedVersionId);
      setShowChanges(false);
      setEditorialDraft('');
    } finally {
      setEditorialBusy(false);
    }
  }, [focusId, editorialDraft, editorialBusy, resolveEditorialForAct, bindEditorialThread, settleWriting]);

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
    } finally {
      setAdoptionBusy(false);
    }
  }, [focusId, editorialThread, suggestedVersion, adoptionBusy, review, refreshContext, settleWriting]);

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
          <strong style={{ letterSpacing: '.18em', fontSize: 13 }}>SOULLAB</strong>
          <span style={{ color: C.quiet, fontSize: 13 }}>|</span>
          <span style={{ fontFamily: SERIF, fontSize: 17 }}>Writer’s Studio</span>
        </div>
        <nav className="wsr-modebar" style={{ display: 'flex', justifyContent: 'center' }}>
          <StudioModeBar current="write" manuscriptId={context.manuscriptId} />
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
        <button
          type="button"
          className="wsr-return-workspace"
          onClick={() => setCanvasExpanded(false)}
          aria-label="Return to Writer’s Studio workbench"
          title="Return to workbench"
        >
          <span aria-hidden="true">←</span> Workbench
        </button>
      )}

      <div className={`wsr-grid ${canvasExpanded ? 'wsr-pure-grid' : ''}`} style={{ height: canvasExpanded ? '100vh' : 'calc(100vh - 58px)', display: 'grid', gridTemplateColumns: canvasExpanded ? 'minmax(0, 1fr)' : '286px minmax(520px, 1fr) 390px' }}>
        {!canvasExpanded && (<aside className={`wsr-outline ${mobilePane !== 'outline' ? 'wsr-mobile-hidden' : ''}`} style={{ borderRight: `1px solid ${C.soft}`, background: C.panel, overflowY: 'auto', padding: 16 }}>
          <button type="button" style={{ border: 0, background: 'transparent', color: C.muted, fontSize: 12, padding: '3px 2px 15px', cursor: 'pointer' }}>‹ All Works</button>
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
            <article style={{ maxWidth: canvasExpanded ? 840 : 760, margin: '0 auto', fontFamily: SERIF }}>
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
                    <RebuildAuthoredBody
                      section={section}
                      body={liveBody}
                      held={held ? { start: held.start, end: held.end } : null}
                      onEdit={(body) => writing.editSection(section.draftSectionId, body)}
                      onEditingBegan={() => beginWriting(section.draftSectionId)}
                      onFocusPlace={() => focusWritingSection(section.draftSectionId)}
                      onCaptureBeforeBlur={(body) => writing.captureForUnmount(section.draftSectionId, body)}
                      onSelectPassage={(start, end, text) => holdPassage(section, start, end, text)}
                    />
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

        {!canvasExpanded && (<aside className={`wsr-maia ${mobilePane !== 'maia' ? 'wsr-mobile-hidden' : ''}`} style={{ borderLeft: `1px solid ${C.soft}`, background: C.panel, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
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
                          ? `MAIA kept every reading that completed. ${review?.failures.length ?? 0} lens${review?.failures.length === 1 ? '' : 'es'} could not complete, so this is not labeled a full review.`
                          : 'MAIA will read this chapter first, then keep her findings available while you move into individual sections.'}
                  </p>
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
                    return (
                      <button key={lens} type="button" data-review-lens={lens} aria-pressed={active} aria-expanded={active && reviewFindingsOpen}
                        disabled={!review} onClick={() => { setReviewLens(lens); setReviewFindingsOpen((open) => reviewLens === lens ? !open : true); }}
                        style={{ border: `1px solid ${active ? C.gold : C.soft}`, borderRadius: 11, background: active ? C.active : C.field, padding: 12, minHeight: 74, textAlign: 'left', color: C.secondary, cursor: review ? 'pointer' : 'default', opacity: review ? 1 : .72 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 11.5, fontWeight: 700 }}>
                          <span>{reviewLensLabel(lens)}</span><span style={{ color: C.gold }}>{review ? count : '—'}</span>
                        </div>
                        <div style={{ fontSize: 11, color: active ? C.muted : C.quiet, marginTop: 6 }}>{review ? (active ? 'Showing findings from this lens.' : 'Open findings from this lens.') : 'Waiting for MAIA’s chapter reading.'}</div>
                      </button>
                    );
                  })}
                </div>
                {review && review.findings.length > 0 && (
                  <div data-review-findings-navigator style={{ marginBottom: 18 }}>
                    <button type="button" data-review-all-findings aria-pressed={reviewLens === 'all'} aria-expanded={reviewLens === 'all' && reviewFindingsOpen} onClick={() => { setReviewLens('all'); setReviewFindingsOpen((open) => reviewLens === 'all' ? !open : true); }}
                      style={{ width: '100%', textAlign: 'left', border: `1px solid ${reviewLens === 'all' ? C.gold : C.soft}`, borderRadius: 11, background: reviewLens === 'all' ? C.active : C.field, padding: '10px 12px', color: C.secondary, cursor: 'pointer', fontSize: 11.5, fontWeight: 700 }}>
                      Every finding · {review.findings.length}<span style={{ float: 'right', color: C.quiet }}>{reviewLens === 'all' && reviewFindingsOpen ? '▾' : '▸'}</span>
                    </button>
                    {reviewFindingsOpen && (<section data-review-findings-panel aria-label={reviewLens === 'all' ? 'Every chapter review finding' : `${reviewLensLabel(reviewLens)} findings`}
                      style={{ border: `1px solid ${C.soft}`, borderRadius: 11, background: C.field, marginTop: 8, maxHeight: 'min(46vh, 520px)', overflowY: 'auto', overscrollBehavior: 'contain' }}>
                      <div style={{ position: 'sticky', top: 0, zIndex: 1, display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline', padding: '10px 12px 8px', background: C.field, borderBottom: `1px solid ${C.soft}` }}>
                        <strong style={{ fontSize: 11.5, color: C.secondary }}>{reviewLens === 'all' ? 'Every finding' : reviewLensLabel(reviewLens)}</strong>
                        <span style={{ fontSize: 10, color: C.quiet }}>{visibleReviewFindings.length} observation{visibleReviewFindings.length === 1 ? '' : 's'}</span>
                      </div>
                      <div data-review-findings-scroll style={{ display: 'grid', gap: 9, padding: '10px 12px 12px' }}>
                        {visibleReviewFindings.map((finding, index) => {
                          const target = finding.sectionIds.find((id) => context?.sections.some((section) => section.draftSectionId === id)) ?? null;
                          return (
                            <article key={finding.id} data-review-finding={finding.id} style={{ borderTop: index === 0 ? 0 : `1px solid ${C.soft}`, paddingTop: index === 0 ? 0 : 9 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
                                <span style={{ fontSize: 10.5, color: C.gold, fontWeight: 750 }}>{reviewLensLabel(finding.lens)}</span>
                                <span style={{ fontSize: 9.5, color: C.quiet }}>{finding.state}</span>
                              </div>
                              <p style={{ fontSize: 12, lineHeight: 1.5, color: C.secondary, margin: '4px 0 0' }}>{finding.observation}</p>
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
                    </section>)}
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
                                <button type="button" onClick={() => void applySuggested()} disabled={adoptionBusy}
                                  style={{ border: 0, borderRadius: 9, background: C.goldFill, color: C.ink, padding: '9px 11px', fontWeight: 750, fontSize: 10.5, cursor: adoptionBusy ? 'wait' : 'pointer' }}>
                                  {adoptionBusy ? 'Applying...' : 'Apply revision'}
                                </button>
                                <button type="button" onClick={tryAnother} style={{ border: `1px solid ${C.soft}`, borderRadius: 9, background: C.panel, color: C.secondary, padding: '9px 11px', fontSize: 10.5, cursor: 'pointer' }}>Try another</button>
                                <button type="button" onClick={discussSuggestion} style={{ border: `1px solid ${C.soft}`, borderRadius: 9, background: C.panel, color: C.secondary, padding: '9px 11px', fontSize: 10.5, cursor: 'pointer' }}>Discuss this</button>
                              </div>
                            )}
                            {adoptionOutcome && <div role="status" style={{ fontSize: 10.5, lineHeight: 1.45, color: C.gold, marginTop: 9 }}>
                              {adoptionOutcome.kind === 'applied' ? 'Applied to this exact place in the Work.'
                                : adoptionOutcome.kind === 'work_moved' ? 'You have written here since this suggestion was made. Nothing was changed.'
                                  : adoptionOutcome.kind === 'legacy_locus' ? 'This older suggestion cannot be safely applied. Nothing was changed.'
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
        <button type="button" onClick={() => setMobilePane('maia')} data-active={mobilePane === 'maia'}>MAIA</button>
      </div>)}
      {writingMessage && <div className="wsr-writing-alert" role="status">{writingMessage}</div>}
    </main>
        );
      }}
    </RebuildWritingBoundary>
  );
}
