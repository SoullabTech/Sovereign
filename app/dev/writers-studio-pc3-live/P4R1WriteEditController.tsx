'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAtmosphere } from '@/app/writers-studio/atmosphere/StudioAtmosphere';
import { apiFetch } from '@/lib/http/apiBase';
import { readCurrentSanctuaryPosture, type CurrentPostureRead } from '@/lib/sanctuary/currentClientPosture';
import { useLivingWorks } from '@/app/writers-studio/useLivingWorks';
import { currentWork } from '@/app/writers-studio/workContext';
import { resolveSituatedWorkContext, studioHomeReturnSearch } from '@/app/writers-studio/situatedWork';
import { useHouseStudioH1WorkClaim } from '@/app/writers-studio/useHouseStudioH1WorkClaim';
import { h1AdmissionNeeded, resolveH1Arrival } from '@/app/writers-studio/h1Arrival';
import {
  canvasWithRelationship,
  canvasWithoutRelationship,
  editorialThreadIdFrom,
  relationshipIdFrom,
} from '@/app/writers-studio/canvasIdentity';
import RebuildWritingBoundary from '@/app/writers-studio/rebuild/RebuildWritingBoundary';
import type { SectionWriting } from '@/lib/writersStudio/useSectionWriting';
import { chapterSpanFor, type RebuildSection } from '@/lib/writersStudio/rebuild/model';
import { locationForSection, replacePlaceAddress, resolveInitialSection, SECTION_PARAM } from '@/lib/writersStudio/placeInWork';
import {
  adoptBoundEditorialVersion,
  discoverEditorialRelationships,
  exactVersion,
  locateUniquePassage,
  openBoundEditorialPassage,
  openBoundEditorialThread,
  readBoundEditorialThread,
  sendBoundEditorialTurn,
  type AdoptionWireOutcome,
  type RebuildEditorialRelationship,
  type RebuildEditorialThread,
} from '@/lib/writersStudio/rebuild/editorialCollaboration';
import { useEditingLatitude } from '@/app/writers-studio/insight/EditingLatitude';
import { DEFAULT_EDITORIAL_DEPTH, editorialDirective, type EditorialDepth } from '@/lib/writersStudio/editorialDepth';
import type { ProposalPolicy } from '@/lib/manuscript/editorialScope/sequence';
import {
  LATITUDE_BANDS,
  isEditorialLatitude,
} from '@/lib/manuscript/editorialScope/contract';
import { appendEditorialNote } from '@/lib/writersStudio/editorialApproaches';
import {
  INSIGHT_OBSERVATION,
  INSIGHT_READING,
  loadCanvasInsight,
  type CanvasInsight,
  type InsightPassage,
} from '@/lib/writersStudio/insightCanvas';
import type { MemberRevisionDraft } from '@/app/writers-studio/insight/RevisionDesk';
import type { CraftWorkingSaveDraft } from '@/lib/writersStudio/craftSaveContractR1';
import { confirmsExactMemberSaveReadback } from '@/lib/writersStudio/rebuild/memberSaveReadbackR1';
import { mayPublishEditorialResponse } from '@/lib/writersStudio/rebuild/editorialResponseScopeR1';
import {
  createA2Relationship,
  listA2Relationships,
  readA2Relationship,
  readEligibleCarrySources,
  resolveEditorialReturnBinding,
  type A2RelationshipSummary,
  type EligibleCarrySource,
} from '@/lib/writersStudio/rebuild/relationshipOrchestration';
import {
  clearRelationshipReturnClient,
  persistPlaceReturnOrdered,
  readPlaceReturnClient,
  readRelationshipReturnClient,
  writeRelationshipReturnClient,
} from '@/lib/writersStudio/rebuild/returnStateClient';
import { P4R1Pc3WriteEditView, type Pc3HeldPassage } from './P4R1Pc3WriteEditView';

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

type CarryChooserState =
  | { readonly kind: 'closed' }
  | { readonly kind: 'loading'; readonly relationshipId: string; readonly receiverThreadId: string; readonly generation: number }
  | { readonly kind: 'ready'; readonly relationshipId: string; readonly receiverThreadId: string; readonly generation: number; readonly sources: readonly EligibleCarrySource[] }
  | { readonly kind: 'unavailable'; readonly relationshipId: string; readonly receiverThreadId: string; readonly generation: number };

type SelectedCarrySource = EligibleCarrySource & {
  readonly relationshipId: string;
  readonly receiverThreadId: string;
};

type EditorialReturnCandidate = {
  readonly scope: string;
  readonly relationshipId: string;
  readonly threadId: string;
  readonly sectionId: string;
};

export default function FlagshipWriteEditController() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname() ?? '/dev/writers-studio-p4r1';
  const requested = params?.get('m') ?? null;
  const requestedSection = params?.get(SECTION_PARAM) ?? null;
  const incomingReading = params?.get(INSIGHT_READING) ?? null;
  const incomingObservation = params?.get(INSIGHT_OBSERVATION) ?? null;
  const requestedEditorialThread = params ? editorialThreadIdFrom(params) : null;
  const requestedRelationship = params ? relationshipIdFrom(params) : null;
  const incomingAction = params?.get('insightAction') ?? null;
  const attentionReturnItemId = params?.get('attentionItem') ?? null;
  const lineageReturnChapterId = params?.get('lineageChapter') ?? null;
  const lineageReturnCandidateId = params?.get('lineageCandidate') ?? null;
  const reviewReturnRun = params?.get('reviewRun') ?? null;
  const reviewReturnFinding = params?.get('reviewFinding') ?? null;
  const hasDevelopReturn = Boolean(
    params?.get('r') || params?.get('developField') || params?.get('developIntent')
  );
  const carriedInsightReturnMode: 'develop' | 'review' | null =
    reviewReturnRun && reviewReturnFinding ? 'review'
      : incomingReading && hasDevelopReturn ? 'develop'
        : null;
  const { id: appearance } = useAtmosphere();
  const initialSearch = params && params.toString() ? `?${params.toString()}` : '';

  const [phase, setPhase] = useState<Phase>('loading');
  const [message, setMessage] = useState<string | null>(null);
  const [context, setContext] = useState<ContextReady | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [selectedPassage, setSelectedPassage] = useState<Pc3HeldPassage | null>(null);
  const writingRef = useRef<SectionWriting | null>(null);
  const { phase: worksPhase, works, reload: reloadWorks } = useLivingWorks();
  // H1 · R2: the seam produces the arrival; the hook only supplies the admission fact.
  const h1 = useHouseStudioH1WorkClaim(h1AdmissionNeeded(params));
  const { workId: carriedWorkId } = resolveH1Arrival(params, h1);

  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [workspaceInsight, setWorkspaceInsight] = useState<{ readingId: string; key: string } | null>(null);
  const [arrivalInsight, setArrivalInsight] = useState<CanvasInsight | null>(null);
  const [editorialThread, setEditorialThread] = useState<RebuildEditorialThread | null>(null);
  // A manuscript may be used by multiple Living Works. A manuscript-owned
  // server thread alone does not authorize reusing Work A's relational dialog
  // in Work B. This is a provisional fail-closed presentation/gesture fence,
  // not a product decision that all manuscript history is Work-local.
  const [editorialLivingWorkId, setEditorialLivingWorkId] = useState<string | null>(null);
  const [relationshipChoices, setRelationshipChoices] = useState<readonly RebuildEditorialRelationship[]>([]);
  const [a2Relationship, setA2Relationship] = useState<A2RelationshipSummary | null>(null);
  const [a2RelationshipChoices, setA2RelationshipChoices] = useState<readonly A2RelationshipSummary[]>([]);
  const [a2RelationshipPhase, setA2RelationshipPhase] = useState<'idle' | 'loading' | 'ready' | 'unavailable'>('idle');
  const [a2RelationshipBusy, setA2RelationshipBusy] = useState(false);
  const [a2RelationshipMessage, setA2RelationshipMessage] = useState<string | null>(null);
  const [editorialReturnCandidate, setEditorialReturnCandidate] = useState<EditorialReturnCandidate | null>(null);
  const editorialReturnPreparationRef = useRef<string | null>(null);
  // A refusal notice is only safe to show under its originating Work scope,
  // even when no active A2 relationship remains in presentation state.
  const a2MessageScopeRef = useRef<string | null>(null);
  const carryChooserGen = useRef(0);
  const [carryChooser, setCarryChooser] = useState<CarryChooserState>({ kind: 'closed' });
  const [selectedCarrySource, setSelectedCarrySource] = useState<SelectedCarrySource | null>(null);
  const [carryPostureAvailable, setCarryPostureAvailable] = useState(false);
  const a2RelationshipIdRef = useRef<string | null>(null);
  // If a previously current A2 relationship cannot be reconfirmed, retain
  // its history but suspend current-use authority for this exact Living Work.
  // A client flag never proves revocation or grants server permission.
  const a2SuspendedScopeRef = useRef<string | null>(null);
  const editorialThreadIdRef = useRef<string | null>(null);
  a2RelationshipIdRef.current = a2Relationship?.id ?? null;
  editorialThreadIdRef.current = editorialThread?.threadId ?? null;
  const [editorialDraft, setEditorialDraft] = useState('');
  const [editorialDepth, setEditorialDepth] = useState<EditorialDepth>(DEFAULT_EDITORIAL_DEPTH);
  const [suggestedVersionId, setSuggestedVersionId] = useState<string | null>(null);
  const [appliedVersionId, setAppliedVersionId] = useState<string | null>(null);
  const [editorialBusy, setEditorialBusy] = useState(false);
  const [adoptionBusy, setAdoptionBusy] = useState(false);
  const [memberVersionBusy, setMemberVersionBusy] = useState(false);
  const [editorialFailure, setEditorialFailure] = useState<string | null>(null);
  const [adoptionOutcome, setAdoptionOutcome] = useState<AdoptionWireOutcome | null>(null);
  const [undoMessage, setUndoMessage] = useState<string | null>(null);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [sessionPosture, setSessionPosture] = useState<CurrentPostureRead>({
    resolved: false,
    reason: 'no_live_settings',
  });

  useEffect(() => {
    const sync = () => setSessionPosture(readCurrentSanctuaryPosture());
    sync();
    window.addEventListener('maia-settings-changed', sync as EventListener);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('maia-settings-changed', sync as EventListener);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const chooseSessionPosture = useCallback((sanctuary: boolean) => {
    if (typeof window === 'undefined') return;
    let current: Record<string, unknown> = {};
    const raw = window.localStorage.getItem('maia_settings');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          setEditorialFailure('Your live privacy settings could not be read safely. Open Quick Settings before continuing.');
          return;
        }
        current = parsed as Record<string, unknown>;
      } catch {
        setEditorialFailure('Your live privacy settings could not be read safely. Open Quick Settings before continuing.');
        return;
      }
    }
    const next = { ...current, sanctuary };
    window.localStorage.setItem('maia_settings', JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('maia-settings-changed', { detail: next }));
    setSessionPosture({ resolved: true, sanctuary });
    setEditorialFailure(sanctuary
      ? 'Sanctuary is on. Persistent editorial collaboration stays unavailable until you explicitly switch this session to Ordinary.'
      : null);
  }, []);

  const {
    latitude: editLatitude, setLatitude: setEditLatitude,
    mayRemoveParagraphs, setMayRemoveParagraphs,
    mayProposeImmediately, setMayProposeImmediately,
  } = useEditingLatitude(context?.manuscriptId ?? '');

  const focusInsightConsumed = useRef<string | null>(null);
  const workspaceReturn = useRef<{
    focusId: string | null;
    selectedPassage: Pc3HeldPassage | null;
    thread: RebuildEditorialThread | null;
    versionId: string | null;
    livingWorkScope: string | null;
  } | null>(null);
  const load = useCallback(async () => {
    setPhase('loading');
    setMessage(null);
    try {
      let manuscriptId = requested;
      if (!manuscriptId) {
        const list = await apiFetch('/api/sovereign/manuscripts', { method: 'GET' });
        if (list.status === 401) { setPhase('unauthorized'); return; }
        if (!list.ok) throw new Error('manuscript list');
        const body = await list.json();
        const manuscripts = Array.isArray(body?.manuscripts) ? body.manuscripts : [];
        if (manuscripts.length !== 1) {
          setPhase('error');
          setMessage('Open the Studio with a specific manuscript.');
          return;
        }
        manuscriptId = manuscripts[0].id;
      }
      if (!manuscriptId) throw new Error('manuscript identity');
      let response = await apiFetch(
        '/api/writers-studio/rebuild/context?manuscriptId=' + encodeURIComponent(manuscriptId),
      );
      if (response.status === 401) { setPhase('unauthorized'); return; }
      if (!response.ok) throw new Error('context');
      let body = await response.json() as ContextPayload;

      /* Imported manuscripts arrive as immutable Source first. The unified
         Write room requires a section-addressable Working Draft, so opening an
         imported manuscript is the explicit member act that initializes the
         canonical verbatim draft from the already-confirmed Source sections.
         The draft route owns composition and section identity; this controller
         never guesses structure. */
      if (body.state === 'no_draft') {
        const seed = await apiFetch(
          '/api/sovereign/manuscripts/' + encodeURIComponent(manuscriptId) + '/draft',
          { method: 'POST' },
        );
        if (seed.status === 401) { setPhase('unauthorized'); return; }
        if (!seed.ok && seed.status !== 409) throw new Error('draft seed');

        response = await apiFetch(
          '/api/writers-studio/rebuild/context?manuscriptId=' + encodeURIComponent(manuscriptId),
        );
        if (response.status === 401) { setPhase('unauthorized'); return; }
        if (!response.ok) throw new Error('context after draft seed');
        body = await response.json() as ContextPayload;
      }

      if (body.state !== 'section_aware') {
        setPhase('error');
        setMessage('This manuscript is not section-addressable yet. The Studio will not guess at its structure.');
        return;
      }
      setContext(body);
      const place = resolveInitialSection(requestedSection, body.sections.map((s) => s.draftSectionId));
      setFocusId(place.sectionId);
      if (place.rewriteLocation && typeof window !== 'undefined') {
        replacePlaceAddress(locationForSection(window.location.pathname, window.location.search, place.sectionId));
      }
      setPhase('ready');
    } catch {
      setPhase('error');
      setMessage('The Writer’s Studio could not read this manuscript just now. Nothing has changed.');
    }
  }, [requested, requestedSection]);

  useEffect(() => { void load(); }, [load]);

  const focusSection = context?.sections.find((s) => s.draftSectionId === focusId) ?? null;
  const chapter = context && focusId ? chapterSpanFor(context.sections, focusId) : null;
  const visibleSections = chapter?.sections ?? (focusSection ? [focusSection] : []);
  // HOUSE-STUDIO-CIRCULATION-01R1: a carried Work is honoured only while it validates.
  const workContext = resolveSituatedWorkContext(
    worksPhase, works, context?.manuscriptId ?? null, carriedWorkId,
  );
  const work = currentWork(workContext);
  // A manuscript may be used in multiple Living Works. Its editorial chain
  // carries a manuscript ID, NOT the current LivingWork ID. No automatic
  // cross-Work relational continuity is authorized by matching Source text.
  const currentLivingWorkScope = workContext.kind === 'work' && work && context
    ? JSON.stringify([work.id, context.manuscriptId]) : null;
  const seenLivingWorkScope = useRef<string | null>(null);
  const workScopeEverEstablished = useRef(false);
  const workReentryRequired = useRef(false);
  // Client-only freshness and same-render duplicate guard for A2 metadata.
  // No Work/member authorization is inferred from these local tickets.
  const a2AsyncGenerationRef = useRef(0);
  const a2PendingGestureRef = useRef<{ scope: string; generation: number } | null>(null);
  const activeA2ScopeRef = useRef(currentLivingWorkScope);
  activeA2ScopeRef.current = currentLivingWorkScope;
  const a2StillCurrent = (scope: string | null, generation: number) => Boolean(
    scope && activeA2ScopeRef.current === scope
    && a2AsyncGenerationRef.current === generation,
  );
  if (currentLivingWorkScope && !workScopeEverEstablished.current) {
    // Initial asynchronous Work discovery is not a switch between Works.
    workScopeEverEstablished.current = true;
    seenLivingWorkScope.current = currentLivingWorkScope;
  } else if (workScopeEverEstablished.current
    && seenLivingWorkScope.current !== currentLivingWorkScope) {
    seenLivingWorkScope.current = currentLivingWorkScope;
    workReentryRequired.current = true;
    // Invalidate any former Work's pending relationship read/create before
    // its callback can alter the new Work's visible state or address.
    a2AsyncGenerationRef.current += 1;
    a2PendingGestureRef.current = null;
  }
  // The epoch is captured by each rendered author gesture. Even if a writer
  // later returns A→B→A, an old A callback is not granted new authority.
  const workGestureEpoch = a2AsyncGenerationRef.current;
  const currentContextGesture = () => activeA2ScopeRef.current === currentLivingWorkScope
    && a2AsyncGenerationRef.current === workGestureEpoch;
  const currentWorkGesture = () => Boolean(currentLivingWorkScope && currentContextGesture());
  const threadInCurrentLivingWork = Boolean(
    !workReentryRequired.current
    && currentLivingWorkScope && work && context && editorialThread
    && editorialLivingWorkId === work.id
    && editorialThread.workId === context.manuscriptId,
  );
  const scopedEditorialThread = threadInCurrentLivingWork ? editorialThread : null;
  const scopedA2Relationship = a2Relationship && work && context
    && a2Relationship.livingWorkId === work.id
    && a2Relationship.manuscriptId === context.manuscriptId
    && (!currentLivingWorkScope || a2SuspendedScopeRef.current !== currentLivingWorkScope)
    && !workReentryRequired.current ? a2Relationship : null;
  // A same-component Work switch invalidates the old conversation only in
  // presentation state. The legitimate old Work's saved history is preserved.
  useEffect(() => {
    if (!workReentryRequired.current) return;
    setEditorialThread(null);
    setEditorialLivingWorkId(null);
    setEditorialDraft('');
    setSelectedPassage(null);
    setWorkspaceOpen(false);
    setWorkspaceInsight(null);
    workspaceReturn.current = null;
    setSuggestedVersionId(null);
    setAppliedVersionId(null);
    setRelationshipChoices([]);
    setA2Relationship(null);
    setA2RelationshipChoices([]);
    setA2RelationshipPhase('idle');
    setA2RelationshipMessage(null);
    setEditorialReturnCandidate(null);
    setCarryPostureAvailable(false);
    setSelectedCarrySource(null);
    setCarryChooser({ kind: 'closed' });
    setAdoptionOutcome(null);
    setUndoMessage(null);
    setVoiceNotice(null);
    setEditorialBusy(false);
    setMemberVersionBusy(false);
    setAdoptionBusy(false);
  }, [currentLivingWorkScope]);
  // Presentation-side operation identity, never a server authorization claim.
  // Recheck after awaited network acts before publishing any Save receipt.
  const memberSaveScopeRef = useRef('');
  const workingSaveAttemptRef = useRef<{ scope: string; fingerprint: string; key: string } | null>(null);
  memberSaveScopeRef.current = JSON.stringify([
    context?.manuscriptId ?? null, work?.id ?? null, focusId,
    scopedEditorialThread?.threadId ?? null, scopedEditorialThread?.locusText ?? null,
  ]);
  // A late provider reply is a presentation candidate, not authority to
  // populate whatever Work is now visible. Selection changes and an explicit
  // new gesture invalidate outstanding editorial presentation receipts.
  const editorialActScope = JSON.stringify([
    context?.manuscriptId ?? null, work?.id ?? null, focusId,
    selectedPassage?.draftSectionId ?? null, selectedPassage?.start ?? null,
    selectedPassage?.end ?? null, selectedPassage?.revisionNumber ?? null,
    selectedPassage?.text ?? null,
  ]);
  const editorialActScopeRef = useRef(editorialActScope);
  editorialActScopeRef.current = editorialActScope;
  const editorialActGenerationRef = useRef(0);
  useEffect(() => {
    editorialActGenerationRef.current += 1;
    // A previous Work's in-flight request may no longer hold this Work busy.
    setEditorialBusy(false);
  }, [editorialActScope]);

  const workContextSentence = workContext.kind === 'work'
    ? (work?.purpose ?? 'A Work you declared.')
    : workContext.kind === 'none'
      ? 'This manuscript is not yet declared as a Work.'
      : workContext.kind === 'ambiguous'
        ? `This manuscript belongs to ${workContext.works.length} Works. The Studio will not choose one for you.`
        : 'The Studio has not established this manuscript’s Work context yet.';

  const replaceA2RelationshipAddress = useCallback((relationshipId: string | null) => {
    if (typeof window === 'undefined') return;
    const next = relationshipId
      ? canvasWithRelationship(window.location.pathname, window.location.search, relationshipId)
      : canvasWithoutRelationship(window.location.pathname, window.location.search);
    replacePlaceAddress(next);
  }, []);

  const placeReturnHydrated = useRef<string | null>(null);

  useEffect(() => {
    if (!context || workContext.kind !== 'work' || !work) return;
    const key = `${work.id}:${context.manuscriptId}`;
    if (placeReturnHydrated.current === key) return;

    /* An explicit address is the member's current instruction. Durable return
       fills only an absent place; it never overrides a place the member named. */
    if (requestedSection) {
      if (!focusId || !context.sections.some((section) => section.draftSectionId === focusId)) return;
      placeReturnHydrated.current = key;
      void persistPlaceReturnOrdered(
        { livingWorkId: work.id, manuscriptId: context.manuscriptId },
        focusId,
      );
      return;
    }

    placeReturnHydrated.current = key;
    let cancelled = false;
    void readPlaceReturnClient({
      livingWorkId: work.id,
      manuscriptId: context.manuscriptId,
    }).then((saved) => {
      if (cancelled || !saved.ok || !saved.sectionId) return;
      if (!context.sections.some((section) => section.draftSectionId === saved.sectionId)) return;
      setFocusId(saved.sectionId);
      writingRef.current?.goToSection(saved.sectionId);
      if (typeof window !== 'undefined') {
        replacePlaceAddress(
          locationForSection(window.location.pathname, window.location.search, saved.sectionId),
        );
      }
    });

    return () => { cancelled = true; };
  }, [context, focusId, requestedSection, work, workContext.kind]);

  useEffect(() => {
    if (!context) return;
    if (workContext.kind === 'unknown') {
      setA2RelationshipPhase('loading');
      return;
    }
    if (workContext.kind !== 'work' || !work) {
      setA2Relationship(null);
      setA2RelationshipChoices([]);
      setA2RelationshipPhase('ready');
      setA2RelationshipMessage(null);
      if (requestedRelationship) replaceA2RelationshipAddress(null);
      return;
    }

    let cancelled = false;
    const scope = { livingWorkId: work.id, manuscriptId: context.manuscriptId };
    const scopeAtRead = currentLivingWorkScope;
    const generationAtRead = a2AsyncGenerationRef.current;
    const fresh = () => !cancelled && a2StillCurrent(scopeAtRead, generationAtRead);
    if (scopeAtRead && a2SuspendedScopeRef.current === scopeAtRead) {
      // A later background list/read is not a fresh author decision and must
      // not resurrect a previously unconfirmed relationship under this Work.
      // A deliberate new creation/selection with fresh verification may
      // supersede the suspension; retained custody history is untouched.
      setA2Relationship(null);
      a2RelationshipIdRef.current = null;
      setA2RelationshipChoices([]);
      setA2RelationshipPhase('ready');
      a2MessageScopeRef.current = scopeAtRead;
      setA2RelationshipMessage('The earlier MAIA relationship is not available for current use. Begin a new relationship or explicitly check an authorized one.');
      return;
    }
    setA2RelationshipPhase('loading');
    setA2RelationshipMessage(null);

    void (async () => {
      const listed = await listA2Relationships(work.id, context.manuscriptId);
      if (!fresh()) return;
      if (!listed.ok) {
        // A failed fresh eligibility read cannot leave an old A2 current.
        a2SuspendedScopeRef.current = scopeAtRead;
        a2RelationshipIdRef.current = null;
        setA2Relationship(null);
        setA2RelationshipChoices([]);
        setA2RelationshipPhase('unavailable');
        a2MessageScopeRef.current = scopeAtRead;
        setA2RelationshipMessage('Your MAIA relationships could not be read just now. Current relationship use is unconfirmed; earlier history was not deleted.');
        return;
      }
      setA2RelationshipChoices(listed.relationships);

      let targetId = requestedRelationship;
      if (!targetId) {
        const saved = await readRelationshipReturnClient(scope);
        if (!fresh()) return;
        targetId = saved.ok ? saved.relationshipId : null;
      }

      if (!targetId) {
        setA2Relationship(null);
        setA2RelationshipPhase('ready');
        return;
      }

      const addressed = await readA2Relationship(targetId);
      if (!fresh()) return;
      if (
        !addressed.ok
        || addressed.relationship.id !== targetId
        || addressed.relationship.livingWorkId !== work.id
        || addressed.relationship.manuscriptId !== context.manuscriptId
      ) {
        // Neither manuscript similarity nor the current Work can authorize
        // a substituted or no-longer-confirmed relationship on auto-return.
        a2SuspendedScopeRef.current = scopeAtRead;
        a2RelationshipIdRef.current = null;
        setA2Relationship(null);
        // The specific saved return was refused. Leave fresh author-driven
        // Begin available without activating this unverified old relationship.
        setA2RelationshipPhase('ready');
        a2MessageScopeRef.current = scopeAtRead;
        setA2RelationshipMessage('That MAIA relationship is not available for this Work. Earlier history was not deleted. You may begin a new relationship.');
        if (requestedRelationship) replaceA2RelationshipAddress(null);
        else void clearRelationshipReturnClient(scope);
        return;
      }

      a2SuspendedScopeRef.current = null;
      a2RelationshipIdRef.current = addressed.relationship.id;
      setA2Relationship(addressed.relationship);
      setA2RelationshipPhase('ready');
      if (!requestedRelationship) replaceA2RelationshipAddress(addressed.relationship.id);
      void writeRelationshipReturnClient(scope, addressed.relationship.id);
    })();

    return () => { cancelled = true; };
  }, [
    context,
    requestedRelationship,
    replaceA2RelationshipAddress,
    work,
    workContext.kind,
  ]);

  useEffect(() => {
    const threadId = a2Relationship?.latestEditorialThreadId;
    if (!threadId || !context || !work || workContext.kind !== 'work'
      || !currentLivingWorkScope || workReentryRequired.current) return;

    const relationshipId = a2Relationship.id;
    const preparationKey = JSON.stringify([currentLivingWorkScope, relationshipId, threadId]);
    if (editorialReturnPreparationRef.current === preparationKey) return;

    const scopeAtRead = currentLivingWorkScope;
    const generationAtRead = a2AsyncGenerationRef.current;
    let cancelled = false;
    const stillCurrent = () => !cancelled
      && activeA2ScopeRef.current === scopeAtRead
      && a2AsyncGenerationRef.current === generationAtRead
      && a2RelationshipIdRef.current === relationshipId
      && !workReentryRequired.current;

    void (async () => {
      let sectionId = requestedSection && context.sections.some(
        (section) => section.draftSectionId === requestedSection,
      ) ? requestedSection : focusId;

      // Durable place is part of the return proof. A URL-named section remains
      // the writer's explicit instruction; otherwise the server-owned place wins.
      if (!requestedSection) {
        const saved = await readPlaceReturnClient({
          livingWorkId: work.id,
          manuscriptId: context.manuscriptId,
        });
        if (!stillCurrent()) return;
        if (saved.ok && saved.sectionId && context.sections.some(
          (section) => section.draftSectionId === saved.sectionId,
        )) {
          sectionId = saved.sectionId;
        }
      }

      if (!stillCurrent() || !sectionId || !context.sections.some(
        (section) => section.draftSectionId === sectionId,
      )) return;

      if (sectionId !== focusId) {
        setFocusId(sectionId);
        writingRef.current?.goToSection(sectionId);
        if (typeof window !== 'undefined') {
          replacePlaceAddress(
            locationForSection(window.location.pathname, window.location.search, sectionId),
          );
        }
      }
      editorialReturnPreparationRef.current = preparationKey;
      setEditorialReturnCandidate({
        scope: scopeAtRead,
        relationshipId,
        threadId,
        sectionId,
      });
    })();

    return () => { cancelled = true; };
  }, [
    a2Relationship?.id,
    a2Relationship?.latestEditorialThreadId,
    context,
    currentLivingWorkScope,
    focusId,
    requestedSection,
    work,
    workContext.kind,
  ]);

  // A fresh, server-returned A2 relationship is metadata for THIS Work only.
  // It does not import any manuscript-global editorial thread or MAIA turn.
  const admitFreshA2Relationship = (relationship: A2RelationshipSummary) => {
    if (workReentryRequired.current) {
      // Clear all former Work context before lifting the presentation fence.
      setEditorialThread(null);
      setEditorialLivingWorkId(null);
      setEditorialDraft('');
      setSelectedPassage(null);
      setWorkspaceOpen(false);
      setWorkspaceInsight(null);
      workspaceReturn.current = null;
      setSuggestedVersionId(null);
      setAppliedVersionId(null);
      setRelationshipChoices([]);
      setCarryPostureAvailable(false);
      setSelectedCarrySource(null);
      carryChooserGen.current += 1;
      setCarryChooser({ kind: 'closed' });
      setAdoptionOutcome(null);
      setUndoMessage(null);
      setVoiceNotice(null);
      setEditorialFailure(null);
      setEditorialBusy(false);
      setMemberVersionBusy(false);
      setAdoptionBusy(false);
      workReentryRequired.current = false;
    }
    // Only a fresh Work+manuscript-matched protected response can restore
    // local selection; active revocation still belongs to the server.
    a2SuspendedScopeRef.current = null;
    a2RelationshipIdRef.current = relationship.id;
    setA2Relationship(relationship);
    setA2RelationshipChoices((choices) =>
      choices.some((item) => item.id === relationship.id) ? choices : [...choices, relationship]);
    setA2RelationshipPhase('ready');
    setA2RelationshipMessage(null);
  };

  const beginA2Relationship = useCallback(async () => {
    if (!context || !work || workContext.kind !== 'work' || !currentLivingWorkScope
      || !currentWorkGesture() || a2RelationshipBusy
      || a2PendingGestureRef.current?.scope === currentLivingWorkScope) return;
    const scopeAtGesture = currentLivingWorkScope;
    const generation = ++a2AsyncGenerationRef.current;
    a2PendingGestureRef.current = { scope: scopeAtGesture, generation };
    const current = () => a2StillCurrent(scopeAtGesture, generation)
      && a2PendingGestureRef.current?.generation === generation;
    setA2RelationshipBusy(true);
    setA2RelationshipMessage(null);
    try {
      const out = await createA2Relationship(work.id, context.manuscriptId);
      if (!current()) return;
      if (!out.ok || out.relationship.livingWorkId !== work.id
        || out.relationship.manuscriptId !== context.manuscriptId) {
        a2MessageScopeRef.current = scopeAtGesture;
        setA2RelationshipMessage('The Studio could not verify a new MAIA relationship for this Work. Nothing was opened.');
        return;
      }
      // A deliberate current-Work gesture plus matching protected response
      // may admit A2 metadata, never the prior Work's manuscript dialogue.
      admitFreshA2Relationship(out.relationship);
      replaceA2RelationshipAddress(out.relationship.id);
      void writeRelationshipReturnClient(
        { livingWorkId: work.id, manuscriptId: context.manuscriptId },
        out.relationship.id,
      );
    } catch {
      if (current()) {
        a2MessageScopeRef.current = scopeAtGesture;
        setA2RelationshipMessage('The MAIA relationship could not be confirmed. Nothing was opened.');
      }
    } finally {
      if (current()) {
        a2PendingGestureRef.current = null;
        setA2RelationshipBusy(false);
      }
    }
  }, [a2RelationshipBusy, context, currentLivingWorkScope, replaceA2RelationshipAddress,
    work, workContext.kind, workGestureEpoch]);

  const chooseA2Relationship = useCallback(async (relationshipId: string) => {
    if (!context || !work || workContext.kind !== 'work' || !currentLivingWorkScope
      || !currentWorkGesture() || !relationshipId || a2RelationshipBusy
      || a2PendingGestureRef.current?.scope === currentLivingWorkScope) return;
    const scopeAtGesture = currentLivingWorkScope;
    const generation = ++a2AsyncGenerationRef.current;
    a2PendingGestureRef.current = { scope: scopeAtGesture, generation };
    const current = () => a2StillCurrent(scopeAtGesture, generation)
      && a2PendingGestureRef.current?.generation === generation;
    const recheckingCurrent = a2RelationshipIdRef.current === relationshipId;
    // The existing pending-gesture ticket blocks Send/carry during this
    // fresh check. Preserve the last confirmed B on a misbound *candidate*
    // reply, but retire B if its own requested ID becomes unavailable.
    setA2RelationshipBusy(true);
    setA2RelationshipMessage(null);
    try {
      const out = await readA2Relationship(relationshipId);
      if (!current()) return;
      if (!out.ok || out.relationship.id !== relationshipId
        || out.relationship.livingWorkId !== work.id
        || out.relationship.manuscriptId !== context.manuscriptId) {
        // A failed check of *the active ID* retires its current-use selection.
        // An unrelated/mismatched candidate must never replace a previously
        // verified active B or be silently written as a return target.
        if (recheckingCurrent && a2RelationshipIdRef.current === relationshipId
          && (!out.ok || (out.relationship.id === relationshipId
            && (out.relationship.livingWorkId !== work.id
              || out.relationship.manuscriptId !== context.manuscriptId)))) {
          a2SuspendedScopeRef.current = scopeAtGesture;
          a2RelationshipIdRef.current = null;
          setA2Relationship(null);
          // Keep the verified "Begin new" affordance accessible. A previously
          // retained ID is still not carried into any MAIA request.
          setA2RelationshipPhase('ready');
          setSelectedCarrySource(null);
          carryChooserGen.current += 1;
          setCarryChooser({ kind: 'closed' });
          setCarryPostureAvailable(false);
        }
        a2MessageScopeRef.current = scopeAtGesture;
        setA2RelationshipMessage(!out.ok && out.reason === 'unreadable'
          ? 'That MAIA relationship is not available for use until its status can be confirmed. Earlier history was not deleted.'
          : 'That MAIA relationship is not available for this Work.');
        return;
      }
      admitFreshA2Relationship(out.relationship);
      replaceA2RelationshipAddress(out.relationship.id);
      void writeRelationshipReturnClient(
        { livingWorkId: work.id, manuscriptId: context.manuscriptId },
        out.relationship.id,
      );
    } catch {
      if (current()) {
        if (recheckingCurrent && a2RelationshipIdRef.current === relationshipId) {
          a2SuspendedScopeRef.current = scopeAtGesture;
          a2RelationshipIdRef.current = null;
          setA2Relationship(null);
          setA2RelationshipPhase('ready');
          setSelectedCarrySource(null);
          carryChooserGen.current += 1;
          setCarryChooser({ kind: 'closed' });
          setCarryPostureAvailable(false);
        }
        a2MessageScopeRef.current = scopeAtGesture;
        setA2RelationshipMessage('That MAIA relationship is not available for use until its status can be confirmed. Earlier history was not deleted.');
      }
    } finally {
      if (current()) {
        a2PendingGestureRef.current = null;
        setA2RelationshipBusy(false);
      }
    }
  }, [a2RelationshipBusy, context, currentLivingWorkScope, replaceA2RelationshipAddress,
    work, workContext.kind, workGestureEpoch]);

  const leaveA2Relationship = useCallback(() => {
    if (!currentWorkGesture()) return;
    // A deliberate Leave invalidates outstanding reads and writes of this
    // relationship even if the corresponding network request later succeeds.
    a2AsyncGenerationRef.current += 1;
    a2PendingGestureRef.current = null;
    setA2RelationshipBusy(false);
    if (context && work && workContext.kind === 'work') {
      void clearRelationshipReturnClient({
        livingWorkId: work.id,
        manuscriptId: context.manuscriptId,
      });
    }
    setA2Relationship(null);
    setA2RelationshipMessage(null);
    replaceA2RelationshipAddress(null);
  }, [context, replaceA2RelationshipAddress, work, workContext.kind,
    workGestureEpoch]);

  useEffect(() => {
    carryChooserGen.current += 1;
    setCarryChooser({ kind: 'closed' });
    setSelectedCarrySource(null);
  }, [a2Relationship?.id, editorialThread?.threadId, focusId, context?.manuscriptId, workspaceOpen]);

  useEffect(() => {
    const allowed = Boolean(
      workspaceOpen
      && scopedA2Relationship
      && scopedEditorialThread
      && !workReentryRequired.current
      && sessionPosture.resolved
      && !sessionPosture.sanctuary
    );
    setCarryPostureAvailable(allowed);
    if (!allowed) {
      carryChooserGen.current += 1;
      setCarryChooser({ kind: 'closed' });
    }
  }, [workspaceOpen, scopedA2Relationship, scopedEditorialThread, sessionPosture]);

  const editorialScope = JSON.stringify([
    context?.manuscriptId,
    focusId,
    selectedPassage?.draftSectionId === focusId ? selectedPassage.text : null,
  ]);

  const suggestedVersion = scopedEditorialThread
    ? exactVersion(scopedEditorialThread, suggestedVersionId ?? scopedEditorialThread.headVersionId)
    : null;
  const lastMaiaEditorialTurn = scopedEditorialThread
    ? [...scopedEditorialThread.turns].reverse().find((turn) => turn.speaker === 'maia') ?? null
    : null;


  const settleWriting = useCallback(async (): Promise<boolean> => {
    const writing = writingRef.current;
    if (!writing) return true;

    const blocked = () => writing.sections.some((section) => {
      const status = writing.statusOf(section.id);
      return status === 'conflict' || status === 'error';
    });

    if (blocked()) {
      setEditorialFailure('Your latest writing needs attention before MAIA reads or changes the Work.');
      return false;
    }

    writing.flushPending();
    const deadline = Date.now() + 5000;
    while (writing.hasUnsavedWork()) {
      if (blocked() || Date.now() > deadline) {
        setEditorialFailure('Your latest writing is not safely settled yet. MAIA will wait rather than read an older copy.');
        return false;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    return true;
  }, []);

  const clearEditorial = useCallback(() => {
    setEditorialThread(null);
    setEditorialLivingWorkId(null);
    setRelationshipChoices([]);
    setSuggestedVersionId(null);
    setAppliedVersionId(null);
    setAdoptionOutcome(null);
    setEditorialFailure(null);
    setUndoMessage(null);
    setVoiceNotice(null);
  }, []);

  const focusWritingSection = useCallback((sectionId: string) => {
    if (!currentContextGesture()) return;
    if (sectionId !== focusId) {
      clearEditorial();
      setSelectedPassage(null);
    }
    setFocusId(sectionId);
    if (context && work && workContext.kind === 'work') {
      void persistPlaceReturnOrdered(
        { livingWorkId: work.id, manuscriptId: context.manuscriptId },
        sectionId,
      );
    }
    if (typeof window !== 'undefined') {
      replacePlaceAddress(locationForSection(window.location.pathname, window.location.search, sectionId));
    }
  }, [focusId, clearEditorial, context, work, workContext.kind, workGestureEpoch]);

  const holdPassage = useCallback((section: RebuildSection, start: number, end: number, text: string) => {
    if (!currentContextGesture()) return;
    const revisionNumber = writingRef.current?.currentRevisionId() ?? context?.version ?? 0;
    if (section.draftSectionId !== focusId) clearEditorial();
    setFocusId(section.draftSectionId);
    setSelectedPassage({
      draftSectionId: section.draftSectionId,
      start,
      end,
      text,
      revisionNumber,
    });
    if (context && work && workContext.kind === 'work') {
      void persistPlaceReturnOrdered(
        { livingWorkId: work.id, manuscriptId: context.manuscriptId },
        section.draftSectionId,
      );
    }
    if (typeof window !== 'undefined') {
      replacePlaceAddress(locationForSection(window.location.pathname, window.location.search, section.draftSectionId));
    }
  }, [context, focusId, clearEditorial, work, workContext.kind, workGestureEpoch]);

  const bindEditorialThread = useCallback((thread: RebuildEditorialThread): boolean => {
    // The server-owned thread must belong to the active manuscript as well as
    // its section. Matching paragraph text and a URL thread ID are insufficient.
    if (!context || !focusId || !thread.workId || !work
      || workContext.kind !== 'work' || workReentryRequired.current
      || !currentWorkGesture()
      || thread.workId !== context.manuscriptId
      || thread.targetSectionId !== focusId) {
      setEditorialFailure('That revision conversation could not be verified against the active Work and section. Nothing was changed.');
      return false;
    }

    const live = writingRef.current?.bodyOf(focusId) ?? focusSection?.body ?? '';
    const returnBinding = resolveEditorialReturnBinding(thread, live);
    if (!returnBinding) {
      setEditorialFailure('This conversation’s original or actively applied passage is no longer uniquely present here. Nothing was changed.');
      return false;
    }
    if (returnBinding.text !== live || returnBinding.source === 'active_application') {
      setSelectedPassage({
        draftSectionId: focusId,
        start: returnBinding.start,
        end: returnBinding.end,
        text: returnBinding.text,
        revisionNumber: writingRef.current?.currentRevisionId() ?? context?.version ?? 0,
      });
    }

    // An editor-local tag protects presentation of an explicitly bound thread.
    // It is NOT server proof that this transcript belongs to LivingWork.id.
    setEditorialLivingWorkId(work.id);
    setEditorialThread(thread);
    setSuggestedVersionId(thread.headVersionId);
    setAppliedVersionId(thread.application && !thread.application.undone ? thread.application.versionId : null);
    setRelationshipChoices([]);
    setEditorialFailure(null);
    return true;
  }, [focusId, focusSection, context?.version, context?.manuscriptId, work?.id,
    workContext.kind, workGestureEpoch]);

  useEffect(() => {
    const candidate = editorialReturnCandidate;
    if (!candidate || !focusId || candidate.sectionId !== focusId
      || candidate.scope !== currentLivingWorkScope
      || scopedA2Relationship?.id !== candidate.relationshipId
      || workReentryRequired.current
      || scopedEditorialThread?.threadId === candidate.threadId) return;

    const scopeAtRead = currentLivingWorkScope;
    const generationAtRead = a2AsyncGenerationRef.current;
    let cancelled = false;
    void readBoundEditorialThread(
      candidate.threadId,
      candidate.sectionId,
      candidate.relationshipId,
    ).then((out) => {
      if (cancelled
        || activeA2ScopeRef.current !== scopeAtRead
        || a2AsyncGenerationRef.current !== generationAtRead
        || a2RelationshipIdRef.current !== candidate.relationshipId
        || workReentryRequired.current) return;
      setEditorialReturnCandidate(null);
      if (!out.ok) {
        if (out.reason !== 'locus_mismatch') {
          setEditorialFailure('The Studio found saved revision history for this Work but could not verify it for the returned section. Nothing was opened or changed.');
        }
        return;
      }
      bindEditorialThread(out.thread);
    });

    return () => { cancelled = true; };
  }, [
    bindEditorialThread,
    currentLivingWorkScope,
    editorialReturnCandidate,
    focusId,
    scopedA2Relationship?.id,
    scopedEditorialThread?.threadId,
  ]);

  useEffect(() => {
    if (!requestedEditorialThread || !focusId || !currentLivingWorkScope) return;
    // The legacy editorial thread is bound to a manuscript, not a LivingWork.
    // A URL may name valid history but cannot authorize its relational context
    // in this Work. Hold until the backend can attest that exact relation.
    if (scopedEditorialThread?.threadId === requestedEditorialThread) return;
    setEditorialFailure('This saved manuscript conversation has not been verified for the current Living Work. Nothing was opened, sent, saved or applied.');
  }, [requestedEditorialThread, focusId, currentLivingWorkScope, scopedEditorialThread?.threadId]);

  const chooseRelationship = useCallback((_threadId: string) => {
    // Even explicit selection of an older manuscript thread is not an
    // independently verified LivingWork-specific grant. Do not interpret a
    // matching paragraph or current A2 relationship as thread ownership.
    setEditorialFailure('This manuscript conversation cannot be resumed here until its Living Work context is independently verified. No saved history was changed.');
  }, []);

  const startNewEditorial = useCallback(async (stillCurrent: () => boolean): Promise<RebuildEditorialThread | null> => {
    if (!focusId || !context || !work || workContext.kind !== 'work' || !scopedA2Relationship
      || workReentryRequired.current || !currentWorkGesture() || !stillCurrent()) return null;
    if (!(await settleWriting()) || !currentWorkGesture() || !stillCurrent()) return null;
    const posture = readCurrentSanctuaryPosture();
    if (!stillCurrent() || !posture.resolved || posture.sanctuary) return null;
    const passage = selectedPassage?.draftSectionId === focusId ? selectedPassage : null;
    const revision = writingRef.current?.currentRevisionId() ?? context.version;
    const opened = passage
      ? await openBoundEditorialPassage(focusId, { start: passage.start, end: passage.end }, revision, posture, scopedA2Relationship.id)
      : await openBoundEditorialThread(focusId, posture, scopedA2Relationship.id);

    const postureAfterOpen = readCurrentSanctuaryPosture();
    if (!stillCurrent() || !postureAfterOpen.resolved || postureAfterOpen.sanctuary) return null;
    if (!opened.ok) {
      setEditorialFailure(opened.reason === 'sanctuary_unavailable'
        ? 'Editorial revision is unavailable in Sanctuary. Nothing was changed.'
        : opened.reason === 'relationship_required' || opened.reason === 'origin_unavailable'
          ? 'Choose and confirm the current MAIA relationship for this Living Work before opening a revision conversation. Nothing was written.'
        : 'The revision relationship could not be opened just now. Nothing was changed.');
      return null;
    }

    return bindEditorialThread(opened.thread) ? opened.thread : null;
  }, [focusId, context, work, workContext.kind, selectedPassage, settleWriting,
    bindEditorialThread, scopedA2Relationship, workGestureEpoch]);

  const resolveEditorialForAct = useCallback(async (stillCurrent: () => boolean): Promise<RebuildEditorialThread | null> => {
    if (!focusId || !focusSection || !work || workContext.kind !== 'work'
      || workReentryRequired.current || !currentWorkGesture() || !stillCurrent()) return null;
    const desired = selectedPassage?.draftSectionId === focusId ? selectedPassage.text : focusSection.body;

    if (scopedEditorialThread?.targetSectionId === focusId
      && scopedEditorialThread.locusText === desired) {
      return scopedEditorialThread;
    }
    if (editorialThread && !scopedEditorialThread) return null;

    const found = await discoverEditorialRelationships(focusId);
    if (!stillCurrent()) return null;
    if (!found.ok) {
      setEditorialFailure('The Studio could not check your existing revision conversations just now.');
      return null;
    }

    const matching = found.relationships.filter((relationship) => relationship.locusText === desired);
    if (matching.length === 0) return startNewEditorial(stillCurrent);
    // All discovered historical threads are manuscript-global under the
    // current service contract. No result carries verified LivingWork
    // provenance, even when an A2 relationship exists for this Work.
    setRelationshipChoices([]);
    setEditorialFailure('This manuscript has prior editorial history, but the chosen Living Work has no verified binding to that conversation. No previous thread was reused or modified.');
    return null;
  }, [focusId, focusSection, selectedPassage, editorialThread, scopedEditorialThread,
    scopedA2Relationship, work?.id, workContext.kind, startNewEditorial, bindEditorialThread,
    workGestureEpoch]);

  const openCarryChooser = useCallback(() => {
    if (!workspaceOpen || !scopedA2Relationship || !scopedEditorialThread
      || editorialBusy || workReentryRequired.current || !currentWorkGesture()) return;
    const posture = readCurrentSanctuaryPosture();
    if (!posture.resolved || posture.sanctuary) {
      setCarryPostureAvailable(false);
      carryChooserGen.current += 1;
      setCarryChooser({ kind: 'closed' });
      return;
    }
    const relationshipId = scopedA2Relationship.id;
    const receiverThreadId = scopedEditorialThread.threadId;
    const scopeAtRequest = editorialActScopeRef.current;
    const generation = ++carryChooserGen.current;
    setCarryChooser({ kind: 'loading', relationshipId, receiverThreadId, generation });
    void readEligibleCarrySources(relationshipId, receiverThreadId).then((out) => {
      if (
        generation !== carryChooserGen.current
        || workReentryRequired.current
        || editorialActScopeRef.current !== scopeAtRequest
        || a2RelationshipIdRef.current !== relationshipId
        || editorialThreadIdRef.current !== receiverThreadId
      ) return;
      if (!out.ok) {
        setCarryChooser({ kind: 'unavailable', relationshipId, receiverThreadId, generation });
        return;
      }
      setCarryChooser({ kind: 'ready', relationshipId, receiverThreadId, generation, sources: out.sources });
    });
  }, [workspaceOpen, scopedA2Relationship, scopedEditorialThread, editorialBusy,
    workGestureEpoch]);

  const closeCarryChooser = useCallback(() => {
    carryChooserGen.current += 1;
    setCarryChooser({ kind: 'closed' });
  }, []);

  const selectCarrySource = useCallback((source: EligibleCarrySource) => {
    if (carryChooser.kind !== 'ready' || workReentryRequired.current
      || !currentWorkGesture()) return;
    const relationshipId = scopedA2Relationship?.id ?? null;
    const receiverThreadId = scopedEditorialThread?.threadId ?? null;
    if (
      !relationshipId
      || !receiverThreadId
      || carryChooser.relationshipId !== relationshipId
      || carryChooser.receiverThreadId !== receiverThreadId
      || !carryChooser.sources.some((candidate) => candidate.sourceEpisodeSequence === source.sourceEpisodeSequence)
    ) return;
    setSelectedCarrySource({ ...source, relationshipId, receiverThreadId });
    carryChooserGen.current += 1;
    setCarryChooser({ kind: 'closed' });
  }, [carryChooser, scopedA2Relationship?.id, scopedEditorialThread?.threadId,
    workGestureEpoch]);

  const removeCarrySource = useCallback(() => setSelectedCarrySource(null), []);

  const sendEditorial = useCallback(async (
    requestText?: string,
    options?: { proposalPolicy?: ProposalPolicy; displayText?: string },
  ) => {
    // displayText belongs to the local author-facing Craft presentation only.
    // It is neither a persistable author-turn field nor server authority.
    const text = (requestText ?? editorialDraft).trim();
    if (!focusId || !context || !work || !text || editorialBusy
      || !currentWorkGesture()) return;
    // A current or formerly current A2 that failed a fresh check is not an
    // invitation to silently fall through to manuscript-global legacy send.
    if (currentLivingWorkScope && (
      a2SuspendedScopeRef.current === currentLivingWorkScope
      || a2PendingGestureRef.current?.scope === currentLivingWorkScope
    )) {
      setEditorialFailure('The MAIA relationship is not available for current use or is being checked. Confirm a relationship for this Work before sending; your writing remains here.');
      return;
    }
    // A manuscript may remain the same while the Living Work changes. Never
    // launch a new request with an earlier Work's MAIA thread or context.
    if (workReentryRequired.current || (editorialThread && !scopedEditorialThread)) {
      setEditorialFailure('This is a different Living Work. The earlier MAIA conversation is not shared automatically. Reenter through an authorized Work relationship.');
      return;
    }

    // The writing queue is fresher than the parent context during a pending
    // save. A context-only scope can wrongly treat an older MAIA response as
    // current after the writer changes the Source without a context reload.
    const writingAtGesture = writingRef.current;
    const bodyAtGesture = writingAtGesture?.bodyOf(focusId);
    const revisionAtGesture = writingAtGesture?.currentRevisionId();
    const unsettled = (writing: SectionWriting) => writing.hasUnsavedWork()
      || ['dirty', 'saving', 'conflict', 'error'].includes(writing.statusOf(focusId));
    if (!writingAtGesture || typeof bodyAtGesture !== 'string'
      || !Number.isSafeInteger(revisionAtGesture) || Number(revisionAtGesture) < 0
      || unsettled(writingAtGesture)) {
      setEditorialFailure('Finish or reconcile your current manuscript writing before MAIA reads this passage. No editorial request was sent.');
      return;
    }
    const heldAtGesture = selectedPassage?.draftSectionId === focusId ? selectedPassage : null;
    if (heldAtGesture
      && (heldAtGesture.revisionNumber !== revisionAtGesture
        || Array.from(bodyAtGesture).slice(heldAtGesture.start, heldAtGesture.end).join('') !== heldAtGesture.text)) {
      setEditorialFailure('The selected manuscript words or revision changed. Select the current passage before requesting MAIA.');
      return;
    }
    const scopeAtGesture = editorialActScopeRef.current;
    const generation = ++editorialActGenerationRef.current;
    // The manuscript may move inside the write queue without a React context
    // rerender. That invalidates this reply, but the SAME author request must
    // still retire its own busy indicator. A different Work/new request must not.
    const sameVisibleRequest = () => editorialActScopeRef.current === scopeAtGesture
      && editorialActGenerationRef.current === generation;
    const stillCurrent = () => sameVisibleRequest()
      && currentWorkGesture()
      && !(currentLivingWorkScope && (
        a2SuspendedScopeRef.current === currentLivingWorkScope
        || a2PendingGestureRef.current?.scope === currentLivingWorkScope
      ))
      && writingRef.current !== null
      && writingRef.current.bodyOf(focusId) === bodyAtGesture
      && writingRef.current.currentRevisionId() === revisionAtGesture
      && !unsettled(writingRef.current);

    setEditorialBusy(true);
    setEditorialFailure(null);
    setAdoptionOutcome(null);
    setVoiceNotice(null);

    try {
      const thread = await resolveEditorialForAct(stillCurrent);
      if (!thread || !stillCurrent()) return;
      const desired = selectedPassage?.draftSectionId === focusId
        ? selectedPassage.text : focusSection?.body ?? '';
      if (thread.workId !== context.manuscriptId
        || thread.targetSectionId !== focusId || thread.locusText !== desired) {
        setEditorialFailure('The editorial conversation could not be matched to this exact Work and passage. Nothing was sent.');
        return;
      }
      const posture = readCurrentSanctuaryPosture();
      if (!stillCurrent() || !posture.resolved || posture.sanctuary) {
        if (stillCurrent()) setEditorialFailure('MAIA editorial work is unavailable in Sanctuary or before Ordinary is chosen. Nothing was sent.');
        return;
      }
      const exactWords = text + '\n\n' + editorialDirective(editorialDepth);
      const carry = selectedCarrySource
        && a2Relationship
        && selectedCarrySource.relationshipId === a2Relationship.id
        && selectedCarrySource.receiverThreadId === thread.threadId
        ? {
            kind: 'prior_maia_editorial_turn' as const,
            sourceEpisodeSequence: selectedCarrySource.sourceEpisodeSequence,
          }
        : undefined;
      if (selectedCarrySource && !carry) setSelectedCarrySource(null);
      if (carry) setSelectedCarrySource(null);

      const outcome = await sendBoundEditorialTurn(
        thread.threadId,
        focusId,
        exactWords,
        posture,
        {
          latitude: editLatitude,
          mayRemoveParagraphs,
          mayProposeImmediately,
        },
        {
          // Keep display-safe writer wording out of the orchestration/API
          // options. The client has no durable display-text custody contract.
          ...(options?.proposalPolicy ? { proposalPolicy: options.proposalPolicy } : {}),
          ...(a2Relationship ? { relationshipId: a2Relationship.id } : {}),
          ...(carry ? { carry } : {}),
        },
      );

      // A slow provider may complete after sign-out, focus change, Work switch,
      // privacy withdrawal, or a live writing-queue edit without context reload.
      // Never publish an obsolete reply as guidance on the current Source.
      if (!stillCurrent()) {
        if (sameVisibleRequest()) setEditorialFailure('MAIA’s earlier reply was withheld because the current Work, relationship, passage or writing could not be reconfirmed. No change was applied.');
        return;
      }
      const currentPosture = readCurrentSanctuaryPosture();
      if (!currentPosture.resolved || currentPosture.sanctuary) {
        setEditorialFailure('The session privacy posture changed during MAIA’s response. The old response was not shown.');
        return;
      }
      if (!outcome.ok) {
        if (outcome.reason === 'scope_refused') {
          if (outcome.scope?.wholeParagraphsRemoved) {
            setEditorialFailure(
              `This revision would remove ${outcome.scope.wholeParagraphsRemoved} whole paragraph${outcome.scope.wholeParagraphsRemoved === 1 ? '' : 's'}. Paragraph-removal proposals are a separate permission in Preferences. Nothing was changed.`,
            );
          } else if (isEditorialLatitude(outcome.scope?.wouldPassAtLatitude)) {
            const current = LATITUDE_BANDS[editLatitude].label;
            const needed = LATITUDE_BANDS[outcome.scope.wouldPassAtLatitude].label;
            setEditorialFailure(
              `This revision goes beyond your current “${current}” latitude. It would fit at “${needed}.” Nothing was changed. You can change Revision latitude in Preferences, then choose Show revision options again.`,
            );
          } else {
            setEditorialFailure(outcome.voice?.note
              ?? outcome.detail
              ?? `This revision goes beyond your current “${LATITUDE_BANDS[editLatitude].label}” latitude. Nothing was changed. Review Revision latitude in Preferences before trying again.`);
          }
        } else if (outcome.reason === 'sanctuary_unavailable') {
          setEditorialFailure('Editorial revision is unavailable in Sanctuary. Nothing was changed.');
        } else if (outcome.reason === 'accountability_unresolved') {
          setEditorialFailure('MAIA may have received the passage, but Soullab could not confirm the disclosure record. The response was withheld. Nothing was applied, and this request will not be retried automatically.');
        } else {
          setEditorialFailure(outcome.detail
            ?? 'MAIA could not complete that editorial turn. Nothing was changed.');
        }
        return;
      }

      if (!mayPublishEditorialResponse({
        scope: scopeAtGesture, generation, threadId: thread.threadId,
        workId: context.manuscriptId, sectionId: focusId,
      }, {
        scope: editorialActScopeRef.current,
        generation: editorialActGenerationRef.current,
        posture: currentPosture,
      }, outcome.thread)) {
        setEditorialFailure('An earlier MAIA response no longer belongs to the active Work and passage. It was not shown.');
        return;
      }
      setEditorialThread(outcome.thread);
      setVoiceNotice(outcome.voice?.note ?? null);
      if (outcome.producedVersionId) setSuggestedVersionId(outcome.producedVersionId);
      if (!requestText) setEditorialDraft('');
    } finally {
      if (sameVisibleRequest()) setEditorialBusy(false);
    }
  }, [
    focusId,
    context,
    work,
    focusSection,
    selectedPassage,
    editorialDraft,
    editorialBusy,
    scopedEditorialThread,
    editorialThread,
    resolveEditorialForAct,
    editorialDepth,
    editLatitude,
    mayRemoveParagraphs,
    mayProposeImmediately,
    a2Relationship,
    selectedCarrySource,
    workGestureEpoch,
  ]);

  const refreshContext = useCallback(async (publish = true): Promise<ContextReady | null> => {
    if (!context) return null;
    const manuscriptAtRequest = context.manuscriptId;
    const scopeAtRequest = editorialActScopeRef.current;
    const response = await apiFetch(
      '/api/writers-studio/rebuild/context?manuscriptId=' + encodeURIComponent(manuscriptAtRequest),
    );
    if (!response.ok) return null;
    const body = await response.json() as ContextPayload;
    if (body.state !== 'section_aware' || body.manuscriptId !== manuscriptAtRequest
      || editorialActScopeRef.current !== scopeAtRequest) return null;
    // A delayed old manuscript response never replaces the current Work.
    // Undo first reconciles its exact clean session before publishing this read.
    if (publish) setContext(body);
    return body;
  }, [context]);

  const applySuggested = useCallback(async () => {
    if (!focusId || !scopedEditorialThread || !scopedA2Relationship || !suggestedVersion || adoptionBusy
      || workReentryRequired.current || !currentWorkGesture()) return;
    // Client defense in depth ONLY. The adoption endpoint still needs a
    // separately authorized server-side current-posture/consent enforcement.
    const gesturePosture = readCurrentSanctuaryPosture();
    if (!gesturePosture.resolved || gesturePosture.sanctuary) {
      setEditorialFailure('Persistent editorial Apply is unavailable in Sanctuary or before Ordinary is chosen. Nothing was submitted for Apply.');
      return;
    }
    const scopeAtGesture = memberSaveScopeRef.current;
    setAdoptionBusy(true);
    setEditorialFailure(null);
    setUndoMessage(null);

    try {
      if (!(await settleWriting())) return;
      // Writing settlement awaits I/O. Never carry an old Ordinary/Work
      // snapshot across that await into an adoption request.
      const settledPosture = readCurrentSanctuaryPosture();
      if (!settledPosture.resolved || settledPosture.sanctuary) {
        setEditorialFailure('Persistent editorial Apply is unavailable in Sanctuary or before Ordinary is chosen. Nothing was submitted for Apply.');
        return;
      }
      if (memberSaveScopeRef.current !== scopeAtGesture || !currentWorkGesture()) {
        if (!currentWorkGesture()) return;
        setEditorialFailure('The active Work or revision changed before Apply. Nothing was submitted for Apply.');
        return;
      }
      const result = await adoptBoundEditorialVersion(
        scopedEditorialThread.threadId,
        focusId,
        suggestedVersion.id,
        scopedA2Relationship.id,
      );
      if (memberSaveScopeRef.current !== scopeAtGesture
        || workReentryRequired.current || !currentWorkGesture()) {
        // A completed service act does not confer permission to present an old
        // Work's receipt in a newly selected Living Work.
        return;
      }
      if (!result.ok) {
        setEditorialFailure('The Studio could not confirm that revision. Nothing was changed.');
        return;
      }

      setAdoptionOutcome(result.outcome);
      if (result.outcome.kind === 'applied') {
        setAppliedVersionId(suggestedVersion.id);
        const fresh = await refreshContext();
        if (fresh) {
          const section = fresh.sections.find((candidate) => candidate.draftSectionId === focusId);
          if (section) {
            setSelectedPassage(null);
          }
        }
      }

      const reread = await readBoundEditorialThread(scopedEditorialThread.threadId, focusId, scopedA2Relationship.id);
      if (memberSaveScopeRef.current === scopeAtGesture && !workReentryRequired.current
        && currentWorkGesture() && reread.ok) setEditorialThread(reread.thread);
    } finally {
      setAdoptionBusy(false);
    }
  }, [
    focusId,
    editorialThread,
    suggestedVersion,
    adoptionBusy,
    scopedEditorialThread,
    scopedA2Relationship,
    settleWriting,
    refreshContext,
    workGestureEpoch,
  ]);

  const undoSuggested = useCallback(async () => {
    const application = scopedEditorialThread?.application;
    if (!focusId || !application?.canUndo || !scopedA2Relationship || adoptionBusy || workReentryRequired.current
      || !currentWorkGesture()) return;
    const scopeAtGesture = memberSaveScopeRef.current;
    const writingAtGesture = writingRef.current;
    const observation = writingAtGesture?.observeCleanSection?.(focusId);
    if (!writingAtGesture || !observation
      || typeof writingAtGesture.reconcileCleanSection !== 'function') {
      setUndoMessage('Finish or reconcile your current writing before Undo. Nothing was submitted for Undo.');
      return;
    }
    // This stable callback identifies the mounted queue, including A→B→A
    // remounts that could otherwise happen to have matching body and revision.
    const revisionReader = writingAtGesture.currentRevisionId;
    const sameRequest = () => currentWorkGesture()
      && memberSaveScopeRef.current === scopeAtGesture
      && !workReentryRequired.current
      && writingRef.current?.currentRevisionId === revisionReader;
    let serverUndone = false;
    let visibleRestored = false;

    setAdoptionBusy(true);
    setUndoMessage(null);
    setEditorialFailure(null);
    try {
      const response = await apiFetch('/api/writers-studio/editorial/undo', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ authorizationId: application.authorizationId }),
      });
      const body = await response.json().catch(() => null);
      if (!sameRequest()) return;
      if (response.ok && body?.kind === 'undone') {
        serverUndone = true;
        const fresh = await refreshContext(false);
        if (!sameRequest()) return;
        const reconciled = fresh && writingRef.current?.reconcileCleanSection?.({
          observation,
          authoritativeRevision: fresh.version,
          authoritativeSections: fresh.sections.map((section) => ({
            id: section.draftSectionId, body: section.body, editable: section.editable,
          })),
        });
        if (reconciled && fresh) {
          visibleRestored = true;
          setContext(fresh);
          setSelectedPassage(null);
          setUndoMessage('That application was undone. The original passage is restored.');
        } else {
          setUndoMessage('Undo was saved on the server, but the current writing could not be safely refreshed. Your local writing has been preserved; review it before continuing.');
        }
        setAppliedVersionId(null);
      } else {
        setUndoMessage('That application could not be undone just now. Nothing else was changed.');
      }

      if (scopedEditorialThread) {
        const reread = await readBoundEditorialThread(scopedEditorialThread.threadId, focusId, scopedA2Relationship.id);
        if (reread.ok && sameRequest()) setEditorialThread(reread.thread);
      }
    } catch {
      if (sameRequest()) setUndoMessage(visibleRestored
        ? 'The original passage is restored. Its editorial history could not be refreshed just now.'
        : serverUndone
          ? 'Undo was saved on the server, but its current text could not be read. Your local writing has been preserved.'
          : 'The Studio could not confirm Undo just now. Your current writing has been preserved.');
    } finally {
      // A same-Work navigation may invalidate publication while this operation
      // still owns its busy state. The existing Work epoch fences newer Works.
      if (currentWorkGesture()) setAdoptionBusy(false);
    }
  }, [editorialThread, scopedEditorialThread, scopedA2Relationship, adoptionBusy, refreshContext, focusId,
    workGestureEpoch]);

  const saveWorkingRevision = useCallback(async (draft: CraftWorkingSaveDraft): Promise<boolean> => {
    if (memberVersionBusy || !focusId || !context || !work || workContext.kind !== 'work'
        || !scopedA2Relationship || workReentryRequired.current || !currentWorkGesture()) return false;
    if (draft.held.draftSectionId !== focusId) return false;
    const posture = readCurrentSanctuaryPosture();
    if (!posture.resolved || posture.sanctuary) {
      setEditorialFailure(posture.resolved
        ? 'Save is unavailable while Sanctuary is on. Nothing was written.'
        : 'The current privacy posture could not be confirmed. Nothing was written.');
      return false;
    }
    const scopeAtGesture = memberSaveScopeRef.current;
    const relationshipId = scopedA2Relationship.id;
    const fingerprint = JSON.stringify([
      scopeAtGesture, relationshipId, draft.held.draftSectionId,
      draft.held.start, draft.held.end, draft.held.revisionNumber,
      draft.threadId, draft.supersedes, draft.text, draft.kept ?? [],
    ]);
    let attempt = workingSaveAttemptRef.current;
    if (!attempt || attempt.scope !== scopeAtGesture || attempt.fingerprint !== fingerprint) {
      attempt = { scope: scopeAtGesture, fingerprint, key: globalThis.crypto.randomUUID() };
      workingSaveAttemptRef.current = attempt;
    }
    setMemberVersionBusy(true); setEditorialFailure(null);
    try {
      const res = await apiFetch('/api/writers-studio/editorial/save-working', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          idempotencyKey: attempt.key,
          relationshipId,
          sectionId: draft.held.draftSectionId,
          range: { start: draft.held.start, end: draft.held.end },
          revisionNumber: draft.held.revisionNumber,
          threadId: draft.threadId,
          supersedes: draft.supersedes,
          replacementText: draft.text,
          sanctuary: posture.sanctuary,
          kept: draft.kept ?? [],
        }),
      });
      const body = await res.json().catch(() => null);
      if (memberSaveScopeRef.current !== scopeAtGesture || !currentWorkGesture()
          || scopedA2Relationship.id !== relationshipId) return false;
      if (!res.ok) {
        const reason = typeof body?.error === 'string' ? body.error : 'save_refused';
        setEditorialFailure(reason === 'settled_choices_not_persisted'
          ? 'Save cannot yet preserve settled Craft choices separately. Your working text remains here and was not falsely marked saved.'
          : reason === 'origin_unavailable' || reason === 'relationship_required'
            ? 'The current Living Work relationship could not be reconfirmed. Nothing was saved.'
            : 'The working version could not be committed just now. Your text remains here.');
        return false;
      }
      if (typeof body?.threadId !== 'string' || typeof body?.versionId !== 'string'
          || body?.sectionId !== focusId || body?.supersedes !== draft.supersedes) return false;
      const readback = await readBoundEditorialThread(body.threadId, focusId, relationshipId);
      if (!readback.ok || memberSaveScopeRef.current !== scopeAtGesture
          || !currentWorkGesture() || scopedA2Relationship.id !== relationshipId) return false;
      const exact = confirmsExactMemberSaveReadback(readback.thread, {
        threadId: body.threadId,
        workId: context.manuscriptId,
        sectionId: focusId,
        locusText: draft.held.text,
        versionId: body.versionId,
        supersedes: draft.supersedes,
        text: draft.text,
      });
      if (!exact) {
        setEditorialFailure('The server did not read back the exact working version, so Save was not confirmed. Your text remains here.');
        return false;
      }
      setEditorialThread(readback.thread);
      setEditorialLivingWorkId(work.id);
      setSuggestedVersionId(body.versionId);
      setEditorialDraft(draft.text);
      setAdoptionOutcome(null);
      setUndoMessage(null);
      return true;
    } catch {
      if (memberSaveScopeRef.current === scopeAtGesture && currentWorkGesture()) {
        setEditorialFailure('Save could not be confirmed. Your working text remains here; retry will reuse the same save receipt.');
      }
      return false;
    } finally {
      if (memberSaveScopeRef.current === scopeAtGesture) setMemberVersionBusy(false);
    }
  }, [memberVersionBusy, focusId, context, work, workContext.kind, scopedA2Relationship,
    workGestureEpoch]);

  const saveMemberRevision = useCallback(async (draft: MemberRevisionDraft): Promise<boolean> => {
    if (memberVersionBusy || !scopedEditorialThread || !scopedA2Relationship || !focusId || !context || !work
      || workReentryRequired.current || !currentWorkGesture()) return false;
    if (draft.threadId !== scopedEditorialThread.threadId || draft.sectionId !== focusId
      || scopedEditorialThread.workId !== context.manuscriptId) {
      setEditorialFailure('The current Work or revision conversation could not be verified. Your words remain here; nothing was applied.');
      return false;
    }
    // This client-side posture check prevents accidental gestures, but does
    // NOT repair the older version endpoint's missing server-side posture gate.
    // Independent Class A review and server enforcement are still required.
    const atGesture = readCurrentSanctuaryPosture();
    if (!atGesture.resolved || atGesture.sanctuary) {
      setEditorialFailure('Persistent editorial Save is unavailable in Sanctuary or before you choose Ordinary. Nothing was saved or applied.');
      return false;
    }
    const scopeAtGesture = memberSaveScopeRef.current;
    const locusAtGesture = scopedEditorialThread.locusText;

    setMemberVersionBusy(true);
    setEditorialFailure(null);
    setAdoptionOutcome(null);
    try {
      const response = await apiFetch('/api/writers-studio/editorial/version', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          threadId: draft.threadId,
          relationshipId: scopedA2Relationship.id,
          sanctuary: atGesture.sanctuary,
          supersedes: draft.supersedes,
          replacementText: draft.text,
          ...(draft.purpose ? { purpose: draft.purpose } : {}),
        }),
      });
      const body = await response.json().catch(() => null);
      if (!currentWorkGesture() || workReentryRequired.current) return false;
      if (!response.ok) {
        setEditorialFailure(response.status === 409
          ? 'This conversation gained another version. Your wording is retained here; nothing was applied.'
          : 'Your revision could not be confirmed. Your wording is still held here; nothing was applied.');
        return false;
      }
      // A successful POST acknowledgment is not the readback of the author's
      // exact version. Never assume a missing or mismatched receipt succeeded.
      if (typeof body?.versionId !== 'string' || body.supersedes !== draft.supersedes) {
        setEditorialFailure('The Save acknowledgment could not be verified. Your wording remains here; nothing was applied.');
        return false;
      }
      const reread = await readBoundEditorialThread(draft.threadId, draft.sectionId, scopedA2Relationship.id);
      if (!reread.ok) {
        setEditorialFailure('The saved version could not be read back. Your wording remains here; nothing was applied.');
        return false;
      }
      const exact = confirmsExactMemberSaveReadback(reread.thread, {
        threadId: draft.threadId,
        workId: context.manuscriptId,
        sectionId: draft.sectionId,
        locusText: locusAtGesture,
        versionId: body.versionId,
        supersedes: draft.supersedes,
        text: draft.text,
      });
      const stillOrdinary = readCurrentSanctuaryPosture();
      if (!exact || memberSaveScopeRef.current !== scopeAtGesture
        || !stillOrdinary.resolved || stillOrdinary.sanctuary
        || !currentWorkGesture()) {
        setEditorialFailure('The saved version could not be verified against this Work and session. Your wording remains here; nothing was applied.');
        return false;
      }
      setEditorialThread(reread.thread);
      setSuggestedVersionId(body.versionId);
      return true;
    } catch {
      setEditorialFailure('The save could not be confirmed. Your wording is still held here.');
      return false;
    } finally {
      if (currentWorkGesture()) setMemberVersionBusy(false);
    }
  }, [memberVersionBusy, scopedEditorialThread, scopedA2Relationship, focusId, context, work,
    workGestureEpoch]);
  const openWorkspace = useCallback((insight?: { readingId: string; key: string }) => {
    if (!currentWorkGesture() || workReentryRequired.current) return;
    if (!workspaceOpen) {
      workspaceReturn.current = {
        focusId,
        selectedPassage,
        thread: scopedEditorialThread,
        versionId: suggestedVersionId,
        livingWorkScope: currentLivingWorkScope,
      };
    }
    if (insight) setWorkspaceInsight(insight);
    setWorkspaceOpen(true);
  }, [workspaceOpen, focusId, selectedPassage, scopedEditorialThread, suggestedVersionId,
    currentLivingWorkScope, workGestureEpoch]);

  const closeWorkspace = useCallback(() => {
    if (!currentWorkGesture() || editorialBusy || adoptionBusy || memberVersionBusy) return;
    setWorkspaceOpen(false);
  }, [editorialBusy, adoptionBusy, memberVersionBusy, workGestureEpoch]);

  const returnToStartingPassage = useCallback(() => {
    if (!currentWorkGesture() || editorialBusy || adoptionBusy || memberVersionBusy) return;
    const previous = workspaceReturn.current;
    if (previous?.livingWorkScope !== currentLivingWorkScope
      || workReentryRequired.current) {
      workspaceReturn.current = null;
      setWorkspaceOpen(false);
      return;
    }
    if (previous) {
      setFocusId(previous.focusId);
      setSelectedPassage(previous.selectedPassage);
      setEditorialThread(previous.thread);
      setSuggestedVersionId(previous.versionId);
      // Only return to a history scoped to the very same Living Work.
      setEditorialLivingWorkId(previous.thread ? work?.id ?? null : null);
      if (previous.focusId && typeof window !== 'undefined') {
        replacePlaceAddress(locationForSection(window.location.pathname, window.location.search, previous.focusId));
      }
    }
    setWorkspaceOpen(false);
  }, [editorialBusy, adoptionBusy, memberVersionBusy, currentLivingWorkScope, work?.id,
    workGestureEpoch]);

  const reviseInsightPassage = useCallback((passage: InsightPassage, authorNotes = '') => {
    if (!currentContextGesture() || !context || editorialBusy || adoptionBusy || memberVersionBusy || !passage.verified) return;
    const section = context.sections.find((candidate) => candidate.draftSectionId === passage.sectionId);
    const live = writingRef.current?.bodyOf(passage.sectionId) ?? section?.body;
    if (!section || !section.editable || live !== passage.body) {
      setEditorialFailure('This passage changed after the comparison opened. Reopen the observation before selecting its evidence.');
      return;
    }

    const range = passage.range ?? { start: 0, end: Array.from(passage.body).length };
    const exact = Array.from(passage.body).slice(range.start, range.end).join('');
    const nextScope = JSON.stringify([context.manuscriptId, passage.sectionId, exact]);

    if (authorNotes.trim()) {
      const combined = appendEditorialNote('', authorNotes);
      if (nextScope === editorialScope) setEditorialDraft(combined);
    }

    holdPassage(section, range.start, range.end, exact);
    setWorkspaceOpen(true);
  }, [
    context,
    editorialBusy,
    adoptionBusy,
    memberVersionBusy,
    holdPassage,
    editorialScope,
    workGestureEpoch,
  ]);

  const chooseOwnPassage = useCallback(() => {
    if (!currentContextGesture()) return;
    setWorkspaceOpen(false);
  }, [workGestureEpoch]);

  useEffect(() => {
    if (!context?.manuscriptId || !incomingReading || !incomingObservation) {
      setArrivalInsight(null);
      return;
    }

    let cancelled = false;
    void loadCanvasInsight(context.manuscriptId, incomingReading, incomingObservation).then((insight) => {
      if (cancelled) return;
      setArrivalInsight(insight);
      if (insight) {
        setWorkspaceInsight({ readingId: insight.readingId, key: insight.observation.key });
      }
    });
    return () => { cancelled = true; };
  }, [context?.manuscriptId, incomingReading, incomingObservation]);

  useEffect(() => {
    if (!arrivalInsight || !context) return;
    const passage = arrivalInsight.passages.find((candidate) => candidate.sectionId === requestedSection)
      ?? arrivalInsight.passages.find((candidate) => candidate.verified && candidate.editable)
      ?? null;
    if (!passage?.verified || !passage.editable) return;

    /* Orientation may legitimately name a whole section, but automatic editorial
       Focus may not. Only an exact passage range may become the held locus. */
    if (incomingAction === 'focus' && !passage.range) return;

    const section = context.sections.find((candidate) => candidate.draftSectionId === passage.sectionId);
    if (!section) return;
    const range = passage.range ?? { start: 0, end: Array.from(passage.body).length };
    const exact = Array.from(passage.body).slice(range.start, range.end).join('');
    holdPassage(section, range.start, range.end, exact);
  }, [arrivalInsight, context, requestedSection, incomingAction, holdPassage]);

  useEffect(() => {
    if (incomingAction !== 'focus' || !arrivalInsight || !selectedPassage || workspaceOpen) return;
    const passage = arrivalInsight.passages.find((candidate) =>
      candidate.sectionId === selectedPassage.draftSectionId
      && candidate.verified
      && candidate.editable
      && candidate.range,
    );
    if (!passage?.range) return;

    const exact = Array.from(passage.body).slice(passage.range.start, passage.range.end).join('');
    if (exact !== selectedPassage.text) return;

    const key = [
      arrivalInsight.readingId,
      arrivalInsight.observation.key,
      selectedPassage.draftSectionId,
      passage.range.start,
      passage.range.end,
    ].join(':');
    if (focusInsightConsumed.current === key) return;
    focusInsightConsumed.current = key;
    openWorkspace({ readingId: arrivalInsight.readingId, key: arrivalInsight.observation.key });
  }, [
    incomingAction,
    arrivalInsight,
    selectedPassage,
    workspaceOpen,
    openWorkspace,
  ]);



  const makeThisAWork = useCallback(async () => {
    if (!context || workContext.kind !== 'none') return;
    try {
      const create = await apiFetch('/api/sovereign/living-works', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(context.title ? { title: context.title } : {}),
      });
      const created = await create.json().catch(() => null);
      const workId = typeof created?.work?.id === 'string' ? created.work.id : null;
      if (!create.ok || !workId) {
        setEditorialFailure('The Work could not be created just now. The manuscript has not changed.');
        return;
      }

      const declare = await apiFetch('/api/sovereign/living-works/' + workId + '/expressions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ expressionType: 'manuscript', expressionId: context.manuscriptId }),
      });
      await reloadWorks();
      if (!declare.ok) {
        setEditorialFailure('The Work was created, but this manuscript was not placed in it. Nothing about the manuscript changed.');
      }
    } catch {
      setEditorialFailure('The Work could not be created just now. The manuscript has not changed.');
    }
  }, [context, workContext.kind, reloadWorks]);
  const onMode = useCallback((mode: 'home' | 'write' | 'develop' | 'review' | 'publish' | 'listen') => {
    if (mode === 'home') {
      const query = studioHomeReturnSearch(params?.toString() ?? '');
      router.push(`${pathname}${query ? `?${query}` : ''}`);
      return;
    }
    const next = new URLSearchParams(params?.toString() ?? '');
    next.set('mode', mode);
    next.delete('insightReading');
    next.delete('insightObservation');
    next.delete('insightAction');
    if (mode !== 'develop') {
      next.delete('developField');
      next.delete('r');
      next.delete('attentionItem');
    }
    if (mode !== 'review') {
      next.delete('reviewRun');
      next.delete('reviewFinding');
    }
    const query = next.toString();
    router.push(`${pathname}${query ? `?${query}` : ''}`);
  }, [params, pathname, router]);

  if (phase !== 'ready' || !context) {
    return (
      <main className="fs-p4-opening">
        {phase === 'loading' ? 'Opening Writer’s Studio…' : null}
        {phase === 'unauthorized' ? 'Sign in to open your Writer’s Studio.' : null}
        {phase === 'error' ? (message ?? 'The Studio could not be opened.') : null}
      </main>
    );
  }

  return (
    <RebuildWritingBoundary
      key={`${context.manuscriptId}:p4r1-pc3`}
      manuscriptId={context.manuscriptId}
      version={context.version}
      sections={context.sections}
      initialSectionId={focusId}
      epoch={0}
    >
      {(writing) => {
        writingRef.current = writing;
        return (
          <P4R1Pc3WriteEditView
            context={context}
            writing={writing}
            work={work}
            appearance={appearance}
            pathname={pathname}
            initialSearch={initialSearch}
            initial={focusId ?? ''}
            focusId={focusId}
            held={selectedPassage}
            onFocusSection={focusWritingSection}
            onHoldPassage={holdPassage}
            onMode={onMode}
            workspaceOpen={workspaceOpen && !workReentryRequired.current}
            carriedInsight={workReentryRequired.current ? null : arrivalInsight}
            carriedInsightReturnMode={carriedInsightReturnMode}
            attentionReturnItemId={attentionReturnItemId}
            lineageReturnChapterId={lineageReturnChapterId}
            lineageReturnCandidateId={lineageReturnCandidateId}
            workspaceInsight={workReentryRequired.current ? null : workspaceInsight}
            editorialThread={scopedEditorialThread}
            relationshipChoices={!workReentryRequired.current ? relationshipChoices : []}
            maiaRelationship={scopedA2Relationship}
            maiaRelationshipChoices={scopedA2Relationship ? a2RelationshipChoices : []}
            maiaRelationshipPhase={currentLivingWorkScope
              && (scopedA2Relationship || a2MessageScopeRef.current === currentLivingWorkScope)
              ? a2RelationshipPhase : 'idle'}
            maiaRelationshipBusy={Boolean(currentLivingWorkScope) && a2RelationshipBusy}
            maiaRelationshipMessage={currentLivingWorkScope
              && a2MessageScopeRef.current === currentLivingWorkScope
              ? a2RelationshipMessage : null}
            carrySourceAvailable={carryPostureAvailable
              && Boolean(scopedA2Relationship) && Boolean(scopedEditorialThread)}
            carryChooser={scopedA2Relationship && scopedEditorialThread
              ? carryChooser.kind === 'ready'
                ? { kind: 'ready', sources: carryChooser.sources }
                : { kind: carryChooser.kind }
              : { kind: 'closed' }}
            selectedCarrySource={scopedA2Relationship && scopedEditorialThread ? selectedCarrySource : null}
            suggestedVersion={suggestedVersion}
            appliedVersionId={scopedEditorialThread?.application
              && !scopedEditorialThread.application.undone
              ? scopedEditorialThread.application.versionId
              : scopedEditorialThread ? appliedVersionId : null}
            editorialDraft={workReentryRequired.current ? '' : editorialDraft}
            editorialDepth={editorialDepth}
            editLatitude={editLatitude}
            mayRemoveParagraphs={mayRemoveParagraphs}
            mayProposeImmediately={mayProposeImmediately}
            voiceNotice={scopedEditorialThread ? voiceNotice : null}
            sessionPosture={sessionPosture}
            onChooseSessionPosture={chooseSessionPosture}
            editorialBusy={editorialBusy && !workReentryRequired.current}
            adoptionBusy={adoptionBusy && !workReentryRequired.current}
            memberVersionBusy={memberVersionBusy && !workReentryRequired.current}
            editorialFailure={workReentryRequired.current
              ? 'This Living Work has its own MAIA context. Earlier manuscript conversations are not shared automatically.'
              : editorialFailure}
            adoptionOutcome={scopedEditorialThread ? adoptionOutcome : null}
            undoMessage={scopedEditorialThread ? undoMessage : null}
            lastMaiaEditorialTurn={lastMaiaEditorialTurn}
            onOpenWorkspace={openWorkspace}
            onDismissCarriedInsight={() => {
              if (!currentContextGesture()) return;
              setArrivalInsight(null);
              setWorkspaceInsight(null);
            }}
            onCloseWorkspace={closeWorkspace}
            onReturnToStartingPassage={returnToStartingPassage}
            canReturnToStartingPassage={Boolean(
              !workReentryRequired.current
              && workspaceReturn.current?.livingWorkScope === currentLivingWorkScope
              && workspaceReturn.current?.focusId
              && workspaceReturn.current.focusId !== focusId
            )}
            onDepth={(value) => { if (currentContextGesture()) setEditorialDepth(value); }}
            onInstruction={(text) => { if (currentContextGesture()) setEditorialDraft(text); }}
            onSendEditorial={(text, options) => void sendEditorial(text, options)}
            onSelectVersion={(id) => {
              if (!scopedEditorialThread || workReentryRequired.current
                || !currentWorkGesture()) return;
              setSuggestedVersionId(id);
              setAdoptionOutcome(null);
              setEditorialFailure(null);
            }}
            onApply={() => void applySuggested()}
            // A no-op guarded callback remains callable for an old mounted
            // control, but the UI only displays Undo with a current scoped
            // application. It must never use a stale Work A authorization.
            onUndo={() => void undoSuggested()}
            onSaveMember={saveMemberRevision}
            onSaveWorking={saveWorkingRevision}
            onKeep={() => {
              if (!scopedEditorialThread || workReentryRequired.current
                || !currentWorkGesture()) return;
              setSuggestedVersionId(null);
              setAdoptionOutcome(null);
              setEditorialFailure('Current wording retained. Your saved alternatives remain in the version list.');
            }}
            onLatitude={setEditLatitude}
            onMayRemoveParagraphs={setMayRemoveParagraphs}
            onMayProposeImmediately={setMayProposeImmediately}
            onReviseInsight={reviseInsightPassage}
            onChoosePassage={chooseOwnPassage}
            onChooseRelationship={(threadId) => void chooseRelationship(threadId)}
            onBeginMaiaRelationship={() => void beginA2Relationship()}
            onChooseMaiaRelationship={(relationshipId) => void chooseA2Relationship(relationshipId)}
            onLeaveMaiaRelationship={leaveA2Relationship}
            onOpenCarryChooser={openCarryChooser}
            onCloseCarryChooser={closeCarryChooser}
            onSelectCarrySource={selectCarrySource}
            onRemoveCarrySource={removeCarrySource}
          />
        );
      }}
    </RebuildWritingBoundary>
  );
}
