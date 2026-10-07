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
  canvasWithEditorialThread,
  canvasWithoutEditorialThread,
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
  returnLocusText,
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
import { resolveCraftSuggestionPolicy } from '@/lib/writersStudio/craftSuggestionPolicyR1';
import {
  CRAFT_HINT_END,
  CRAFT_HINT_START,
  CRAFT_SOURCE_MAIA_TURN,
  CRAFT_SOURCE_THREAD,
  INSIGHT_OBSERVATION,
  INSIGHT_READING,
  loadCanvasInsight,
  type CanvasInsight,
  type InsightPassage,
} from '@/lib/writersStudio/insightCanvas';
import type { MemberRevisionDraft } from '@/app/writers-studio/insight/RevisionDesk';
import {
  createA2Relationship,
  listA2Relationships,
  readA2Relationship,
  readEligibleCarrySources,
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
import { runCraftReread } from '@/lib/writersStudio/craftRereadR1';
import {
  craftTargetKey, craftParagraphLabel, paragraphTargets, referencedCraftTargets,
  targetStillMatches, parseCraftCanvasCommand, resolveNamedCraftTarget, adjacentCraftTarget, makeCraftTarget,
  type CraftFocusTarget, type CraftTablePort, type CraftTableSnapshot, type CraftCanvasReceipt,
} from '@/lib/writersStudio/craftFocusR1';
import {
  appendCraftDialogue,
  craftMaiaDialogueTurn,
  type CraftDialogueTurn,
  type CraftSendOptions,
} from '@/lib/writersStudio/craftDialogueR1';

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

export default function FlagshipWriteEditController({
  surfaceMode = 'write',
}: {
  surfaceMode?: 'write' | 'develop-craft';
} = {}) {
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
  const craftSourceThreadId = params?.get(CRAFT_SOURCE_THREAD) ?? null;
  const craftSourceMaiaTurnRaw = params?.get(CRAFT_SOURCE_MAIA_TURN) ?? null;
  const craftSourceMaiaTurnIndex = craftSourceMaiaTurnRaw !== null && Number.isInteger(Number(craftSourceMaiaTurnRaw))
    ? Number(craftSourceMaiaTurnRaw)
    : null;
  const craftHintStartRaw = params?.get(CRAFT_HINT_START) ?? null;
  const craftHintEndRaw = params?.get(CRAFT_HINT_END) ?? null;
  const craftHintStart = craftHintStartRaw !== null && Number.isInteger(Number(craftHintStartRaw))
    ? Number(craftHintStartRaw)
    : null;
  const craftHintEnd = craftHintEndRaw !== null && Number.isInteger(Number(craftHintEndRaw))
    ? Number(craftHintEndRaw)
    : null;
  const craftHintRange = craftHintStart !== null
    && craftHintEnd !== null
    && craftHintStart >= 0
    && craftHintEnd > craftHintStart
    ? { start: craftHintStart, end: craftHintEnd }
    : null;
  const craftArrival = Boolean(
    craftSourceThreadId
    && craftSourceMaiaTurnIndex !== null
    && (incomingAction === 'craft-passage' || incomingAction === 'choose-craft-passage')
  );
  const developCraft = surfaceMode === 'develop-craft' || params?.get('developCraft') === '1';
  const arrivalSectionRef = useRef(requestedSection);
  arrivalSectionRef.current = requestedSection;
  // Craft already has the chapter on the table. Section moves must not reload it.
  const contextLoadSection = developCraft ? null : requestedSection;
  const craftMode = craftArrival || developCraft;
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
  const [relationshipChoices, setRelationshipChoices] = useState<readonly RebuildEditorialRelationship[]>([]);
  const [a2Relationship, setA2Relationship] = useState<A2RelationshipSummary | null>(null);
  const [a2RelationshipChoices, setA2RelationshipChoices] = useState<readonly A2RelationshipSummary[]>([]);
  const [a2RelationshipPhase, setA2RelationshipPhase] = useState<'idle' | 'loading' | 'ready' | 'unavailable'>('idle');
  const [a2RelationshipBusy, setA2RelationshipBusy] = useState(false);
  const [a2RelationshipMessage, setA2RelationshipMessage] = useState<string | null>(null);
  const carryChooserGen = useRef(0);
  const [carryChooser, setCarryChooser] = useState<CarryChooserState>({ kind: 'closed' });
  const [selectedCarrySource, setSelectedCarrySource] = useState<SelectedCarrySource | null>(null);
  const [carryPostureAvailable, setCarryPostureAvailable] = useState(false);
  const a2RelationshipIdRef = useRef<string | null>(null);
  const editorialThreadIdRef = useRef<string | null>(null);
  a2RelationshipIdRef.current = a2Relationship?.id ?? null;
  editorialThreadIdRef.current = editorialThread?.threadId ?? null;
  const [editorialDraft, setEditorialDraft] = useState('');
  const [editorialDepth, setEditorialDepth] = useState<EditorialDepth>(DEFAULT_EDITORIAL_DEPTH);
  const [suggestedVersionId, setSuggestedVersionId] = useState<string | null>(null);
  const [appliedVersionId, setAppliedVersionId] = useState<string | null>(null);
  const [editorialBusy, setEditorialBusy] = useState(false);
  const [craftWorkingText, setCraftWorkingText] = useState<string | null>(null);
  const [craftActivity, setCraftActivity] = useState<string | null>(null);
  const [craftReadNotice, setCraftReadNotice] = useState<string | null>(null);
  const craftRequestInFlight = useRef(false);
  const craftMounted = useRef(true);
  const craftLiveIdentity = useRef('');
  const [craftDialogue, setCraftDialogue] = useState<readonly CraftDialogueTurn[]>([]);
  const craftDialogueSeq = useRef(0);
  const seenCraftMaiaTurn = useRef<string | null>(null);
  const craftTablePort = useRef<CraftTablePort | null>(null);
  const craftFocusDrafts = useRef(new Map<string, { snapshot: CraftTableSnapshot; thread: RebuildEditorialThread | null; target: CraftFocusTarget }>());
  const [craftRestoreSnapshot, setCraftRestoreSnapshot] = useState<CraftTableSnapshot | null>(null);
  const [craftActionReceipt, setCraftActionReceipt] = useState<string | null>(null);
  const [craftContinuationTick, setCraftContinuationTick] = useState(0);
  const [craftFocusLabel, setCraftFocusLabel] = useState<string | null>(null);
  const craftPriorThread = useRef<{ threadId: string; turnIndex: number } | null>(null);
  const ignoredCraftThread = useRef<string | null>(null);
  const craftSettledChoices = useRef(new Map<string, string>());
  const pendingCraftContinuation = useRef<{ text: string; options: CraftSendOptions; focusKey?: string } | null>(null);
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

  craftLiveIdentity.current = JSON.stringify([
    requested, context?.manuscriptId, context?.version, focusId, developCraft,
    selectedPassage?.draftSectionId, selectedPassage?.start, selectedPassage?.end,
    selectedPassage?.text, craftWorkingText,
  ]);
  useEffect(() => {
    craftMounted.current = true;
    return () => { craftMounted.current = false; };
  }, []);

  // The table publishes the writer-owned copy. Never overwrite a restored
  // draft with the canonical locus merely because focus changed.

  useEffect(() => {
    let recovered: readonly CraftDialogueTurn[] = [];
    try {
      const key = 'ws-craft-conversation-recovery:' + requested;
      const raw = window.sessionStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) recovered = parsed.filter(t => t && typeof t.body === 'string'
          && typeof t.key === 'string' && ['writer', 'maia', 'action'].includes(t.speaker));
      }
    } catch { /* Start empty rather than inventing history. */ }
    setCraftDialogue(recovered);
    setCraftReadNotice(null);
    craftDialogueSeq.current = recovered.length;
    seenCraftMaiaTurn.current = null;
    craftFocusDrafts.current.clear();
    craftSettledChoices.current.clear();
    craftPriorThread.current = null;
  }, [requested]);

  const connectCraftTable = useCallback((port: CraftTablePort | null) => {
    craftTablePort.current = port;
  }, []);

  const receiveCraftReceipt = useCallback((receipt: CraftCanvasReceipt) => {
    setCraftActionReceipt(receipt.message);
    setCraftDialogue(turns => appendCraftDialogue(turns, {
      key: `action:${++craftDialogueSeq.current}`, speaker: 'action', body: receipt.message,
    }));
    if (receipt.ok && receipt.reopened && selectedPassage) {
      craftSettledChoices.current.delete(JSON.stringify([selectedPassage.draftSectionId,
        selectedPassage.start + receipt.reopened.start, selectedPassage.start + receipt.reopened.end]));
    }
    if (receipt.ok && receipt.settled && selectedPassage) {
      const key = JSON.stringify([selectedPassage.draftSectionId, selectedPassage.start + receipt.settled.start,
        selectedPassage.start + receipt.settled.end]);
      craftSettledChoices.current.set(key, receipt.settled.text);
    }
  }, [selectedPassage]);


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
    resolved: editingSettingsResolved,
  } = useEditingLatitude(context?.manuscriptId ?? '');

  const focusInsightConsumed = useRef<string | null>(null);
  const autoProposalKey = useRef<string | null>(null);
  const workspaceReturn = useRef<{
    focusId: string | null;
    selectedPassage: Pc3HeldPassage | null;
    thread: RebuildEditorialThread | null;
    versionId: string | null;
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
      const place = resolveInitialSection(arrivalSectionRef.current, body.sections.map((s) => s.draftSectionId));
      setFocusId(place.sectionId);
      if (place.rewriteLocation && typeof window !== 'undefined') {
        replacePlaceAddress(locationForSection(window.location.pathname, window.location.search, place.sectionId));
      }
      setPhase('ready');
    } catch {
      setPhase('error');
      setMessage('The Writer’s Studio could not read this manuscript just now. Nothing has changed.');
    }
  }, [requested, contextLoadSection]);

  useEffect(() => { void load(); }, [load]);

  const focusSection = context?.sections.find((s) => s.draftSectionId === focusId) ?? null;
  const chapter = context && focusId ? chapterSpanFor(context.sections, focusId) : null;
  const visibleSections = chapter?.sections ?? (focusSection ? [focusSection] : []);
  // HOUSE-STUDIO-CIRCULATION-01R1: a carried Work is honoured only while it validates.
  const workContext = resolveSituatedWorkContext(
    worksPhase, works, context?.manuscriptId ?? null, carriedWorkId,
  );
  const work = currentWork(workContext);
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
    setA2RelationshipPhase('loading');
    setA2RelationshipMessage(null);

    void (async () => {
      const listed = await listA2Relationships(work.id, context.manuscriptId);
      if (cancelled) return;
      if (!listed.ok) {
        setA2Relationship(null);
        setA2RelationshipChoices([]);
        setA2RelationshipPhase('unavailable');
        setA2RelationshipMessage('Your MAIA relationships could not be read just now. Nothing was changed.');
        return;
      }
      setA2RelationshipChoices(listed.relationships);

      let targetId = requestedRelationship;
      if (!targetId) {
        const saved = await readRelationshipReturnClient(scope);
        if (cancelled) return;
        targetId = saved.ok ? saved.relationshipId : null;
      }

      if (!targetId) {
        setA2Relationship(null);
        setA2RelationshipPhase('ready');
        return;
      }

      const addressed = await readA2Relationship(targetId);
      if (cancelled) return;
      if (
        !addressed.ok
        || addressed.relationship.livingWorkId !== work.id
        || addressed.relationship.manuscriptId !== context.manuscriptId
      ) {
        setA2Relationship(null);
        setA2RelationshipPhase('ready');
        setA2RelationshipMessage('That MAIA relationship is not available for this Work.');
        if (requestedRelationship) replaceA2RelationshipAddress(null);
        else void clearRelationshipReturnClient(scope);
        return;
      }

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

  const beginA2Relationship = useCallback(async () => {
    if (!context || !work || workContext.kind !== 'work' || a2RelationshipBusy) return;
    setA2RelationshipBusy(true);
    setA2RelationshipMessage(null);
    const out = await createA2Relationship(work.id, context.manuscriptId);
    if (!out.ok) {
      setA2RelationshipMessage('The Studio could not begin that MAIA relationship just now. Nothing else changed.');
      setA2RelationshipBusy(false);
      return;
    }
    setA2Relationship(out.relationship);
    setA2RelationshipChoices((choices) => [...choices, out.relationship]);
    replaceA2RelationshipAddress(out.relationship.id);
    void writeRelationshipReturnClient(
      { livingWorkId: work.id, manuscriptId: context.manuscriptId },
      out.relationship.id,
    );
    setA2RelationshipBusy(false);
  }, [a2RelationshipBusy, context, replaceA2RelationshipAddress, work, workContext.kind]);

  const chooseA2Relationship = useCallback(async (relationshipId: string) => {
    if (!context || !work || workContext.kind !== 'work' || a2RelationshipBusy) return;
    setA2RelationshipBusy(true);
    setA2RelationshipMessage(null);
    const out = await readA2Relationship(relationshipId);
    if (
      !out.ok
      || out.relationship.livingWorkId !== work.id
      || out.relationship.manuscriptId !== context.manuscriptId
    ) {
      setA2RelationshipMessage('That MAIA relationship is not available for this Work.');
      setA2RelationshipBusy(false);
      return;
    }
    setA2Relationship(out.relationship);
    replaceA2RelationshipAddress(out.relationship.id);
    void writeRelationshipReturnClient(
      { livingWorkId: work.id, manuscriptId: context.manuscriptId },
      out.relationship.id,
    );
    setA2RelationshipBusy(false);
  }, [a2RelationshipBusy, context, replaceA2RelationshipAddress, work, workContext.kind]);

  const leaveA2Relationship = useCallback(() => {
    if (context && work && workContext.kind === 'work') {
      void clearRelationshipReturnClient({
        livingWorkId: work.id,
        manuscriptId: context.manuscriptId,
      });
    }
    setA2Relationship(null);
    setA2RelationshipMessage(null);
    replaceA2RelationshipAddress(null);
  }, [context, replaceA2RelationshipAddress, work, workContext.kind]);

  useEffect(() => {
    carryChooserGen.current += 1;
    setCarryChooser({ kind: 'closed' });
    setSelectedCarrySource(null);
  }, [a2Relationship?.id, editorialThread?.threadId, focusId, context?.manuscriptId, workspaceOpen]);

  useEffect(() => {
    const allowed = Boolean(
      workspaceOpen
      && a2Relationship
      && editorialThread
      && sessionPosture.resolved
      && !sessionPosture.sanctuary
    );
    setCarryPostureAvailable(allowed);
    if (!allowed) {
      carryChooserGen.current += 1;
      setCarryChooser({ kind: 'closed' });
    }
  }, [workspaceOpen, a2Relationship, editorialThread, sessionPosture]);

  const editorialScope = JSON.stringify([
    context?.manuscriptId,
    focusId,
    selectedPassage?.draftSectionId === focusId ? selectedPassage.text : null,
  ]);

  const suggestedVersion = editorialThread
    ? exactVersion(editorialThread, suggestedVersionId ?? editorialThread.headVersionId)
    : null;
  const lastMaiaEditorialTurn = editorialThread
    ? [...editorialThread.turns].reverse().find((turn) => turn.speaker === 'maia') ?? null
    : null;

  useEffect(() => {
    if (!developCraft || !editorialThread || !lastMaiaEditorialTurn) return;
    const reply = craftMaiaDialogueTurn(editorialThread.threadId, lastMaiaEditorialTurn);
    if (!reply || seenCraftMaiaTurn.current === reply.key) return;
    seenCraftMaiaTurn.current = reply.key;
    setCraftDialogue((current) => appendCraftDialogue(current, reply));
  }, [
    developCraft,
    editorialThread?.threadId,
    lastMaiaEditorialTurn?.turnIndex,
    lastMaiaEditorialTurn?.body,
  ]);

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
    if (typeof window !== 'undefined') {
      window.history.replaceState(
        null,
        '',
        canvasWithoutEditorialThread(window.location.pathname, window.location.search),
      );
    }
    setRelationshipChoices([]);
    setSuggestedVersionId(null);
    setAppliedVersionId(null);
    setAdoptionOutcome(null);
    setEditorialFailure(null);
    setUndoMessage(null);
    setVoiceNotice(null);
  }, []);

  const moveCraftFocus = useCallback((target: CraftFocusTarget): boolean => {
    if (!context || editorialBusy || craftActivity || craftRequestInFlight.current || adoptionBusy || memberVersionBusy) {
      receiveCraftReceipt({ ok: false, message: 'Finish the current action before moving focus. Your draft is still here.' });
      return false;
    }
    const section = context.sections.find(s => s.draftSectionId === target.sectionId);
    const body = writingRef.current?.bodyOf(target.sectionId) ?? section?.body ?? '';
    const revision = writingRef.current?.currentRevisionId() ?? context.version;
    if (!section || !targetStillMatches(target, body, revision)) {
      receiveCraftReceipt({ ok: false, message: 'Those words changed since this focus was offered. Select them again; nothing was moved.' });
      return false;
    }
    // A later navigation supersedes a queued focus-and-suggest gesture. It
    // must never fire unexpectedly when the writer returns to an old target.
    pendingCraftContinuation.current = null;
    const current = craftTablePort.current?.snapshot();
    const targetKey = craftTargetKey(target);
    if (selectedPassage && !current) {
      receiveCraftReceipt({ ok: false, message: 'The current draft is not ready to carry yet. Nothing was moved.' });
      return false;
    }
    if (current?.key === targetKey) {
      receiveCraftReceipt({ ok: true, message: 'Staying with this passage. No wording changed.' });
      return true;
    }
    if (current && selectedPassage) craftFocusDrafts.current.set(current.key, {
      snapshot: current, thread: editorialThread,
      target: { sectionId: selectedPassage.draftSectionId, ...selectedPassage,
        label: craftFocusLabel ?? craftParagraphLabel(selectedPassage.text),
        sectionLabel: context.sections.find(s => s.draftSectionId === selectedPassage.draftSectionId)?.heading ?? 'Earlier passage',
        source: 'writer' },
    });
    const last = editorialThread?.turns.filter(t => t.speaker === 'maia').at(-1);
    if (editorialThread && last) craftPriorThread.current = { threadId: editorialThread.threadId, turnIndex: last.turnIndex };
    const returning = craftFocusDrafts.current.get(targetKey);
    // The active editor now owns this snapshot. Do not retain a stale dirty
    // duplicate after the writer returns and then cancels or saves that draft.
    if (returning) craftFocusDrafts.current.delete(targetKey);
    ignoredCraftThread.current = editorialThread?.threadId ?? requestedEditorialThread;
    clearEditorial();
    setCraftRestoreSnapshot(returning?.snapshot ?? null);
    setFocusId(target.sectionId);
    setSelectedPassage({ draftSectionId: target.sectionId, start: target.start, end: target.end,
      text: target.text, revisionNumber: revision });
    setCraftWorkingText(returning?.snapshot.workingText ?? target.text);
    setCraftFocusLabel(target.label);
    setWorkspaceOpen(true);
    if (returning?.thread) {
      setEditorialThread(returning.thread);
      setSuggestedVersionId(returning.thread.headVersionId);
      setAppliedVersionId(returning.thread.application && !returning.thread.application.undone
        ? returning.thread.application.versionId : null);
    }
    writingRef.current?.goToSection(target.sectionId);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('s', target.sectionId);
      url.searchParams.set('craftStart', String(target.start));
      url.searchParams.set('craftEnd', String(target.end));
      url.searchParams.set('insightAction', 'craft-passage');
      if (returning?.thread) url.searchParams.set('editorialThread', returning.thread.threadId);
      else url.searchParams.delete('editorialThread');
      window.history.replaceState(null, '', url.pathname + url.search);
    }
    const heldDraft = current && (current.workingText !== current.original || current.directEditing || current.customEditId !== null);
    receiveCraftReceipt({ ok: true, message: `Focus moved to ${target.label}. No wording changed.`
      + (heldDraft ? ' Previous working draft held on this page, not saved or applied.' : '')
      + (returning ? ' Your earlier working copy is restored.' : '') });
    return true;
  }, [context, editorialBusy, craftActivity, adoptionBusy, memberVersionBusy,
    editorialThread, selectedPassage, requestedEditorialThread, clearEditorial, receiveCraftReceipt, craftFocusLabel]);

  // External in-Work addresses use the same protected handoff, not a Work reload.
  useEffect(() => {
    if (!developCraft || phase !== 'ready' || !context || !requestedSection
      || requestedSection === focusId || (requested && context.manuscriptId !== requested)) return;
    // Ignore a render with the old search params during our own replaceState.
    if (new URL(window.location.href).searchParams.get(SECTION_PARAM) !== requestedSection) return;
    const section = context.sections.find(s => s.draftSectionId === requestedSection);
    if (!section) return;
    const body = writingRef.current?.bodyOf(requestedSection) ?? section.body;
    const revision = writingRef.current?.currentRevisionId() ?? context.version;
    const range = craftHintRange;
    const text = range ? Array.from(body).slice(range.start, range.end).join('') : body;
    const target = makeCraftTarget(section, body, text, revision, 'writer');
    if (target && (!range || (target.start === range.start && target.end === range.end))) moveCraftFocus(target);
  }, [developCraft, phase, context, requested, requestedSection, focusId,
    craftHintStart, craftHintEnd, moveCraftFocus]);

  // Leaving the page must not silently lose drafts held while visiting another focus.
  useEffect(() => {
    const protect = (event: BeforeUnloadEvent) => {
      const snapshots = [...craftFocusDrafts.current.values()].map(entry => entry.snapshot);
      const active = craftTablePort.current?.snapshot();
      if (active) snapshots.push(active);
      if (snapshots.some(s => s.workingText !== s.original || s.directEditing || s.customEditId !== null)) {
        event.preventDefault(); event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', protect);
    return () => window.removeEventListener('beforeunload', protect);
  }, []);

  const focusWritingSection = useCallback((sectionId: string) => {
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
  }, [focusId, clearEditorial, context, work, workContext.kind]);

  const holdPassage = useCallback((section: RebuildSection, start: number, end: number, text: string) => {
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
  }, [context, focusId, clearEditorial, work, workContext.kind]);

  const bindEditorialThread = useCallback((thread: RebuildEditorialThread): boolean => {
    if (!focusId || thread.targetSectionId !== focusId) {
      setEditorialFailure('That revision conversation belongs to a different place in the Work.');
      return false;
    }

    const live = writingRef.current?.bodyOf(focusId) ?? focusSection?.body ?? '';
    const returnLocus = returnLocusText(thread);
    if (returnLocus !== live) {
      const located = locateUniquePassage(live, returnLocus);
      if (!located) {
        setEditorialFailure('This conversation’s passage is no longer uniquely present here. Nothing was changed.');
        return false;
      }
      setSelectedPassage({
        draftSectionId: focusId,
        start: located.start,
        end: located.end,
        text: returnLocus,
        revisionNumber: writingRef.current?.currentRevisionId() ?? context?.version ?? 0,
      });
    }

    setEditorialThread(thread);
    if (typeof window !== 'undefined') {
      window.history.replaceState(
        null,
        '',
        canvasWithEditorialThread(
          window.location.pathname,
          window.location.search,
          thread.threadId,
        ),
      );
    }
    setSuggestedVersionId(thread.headVersionId);
    setAppliedVersionId(thread.application && !thread.application.undone ? thread.application.versionId : null);
    setRelationshipChoices([]);
    setEditorialFailure(null);
    return true;
  }, [focusId, focusSection, context?.version]);

  useEffect(() => {
    let cancelled = false;
    if (!requestedEditorialThread || !focusId) return;
    if (developCraft && requestedEditorialThread === ignoredCraftThread.current) return;
    if (editorialThread?.threadId === requestedEditorialThread) return;

    void readBoundEditorialThread(requestedEditorialThread, focusId).then((out) => {
      if (cancelled) return;
      if (!out.ok || !bindEditorialThread(out.thread)) {
        setEditorialFailure('The revision conversation named by this link could not be resumed at this place. Nothing was changed.');
        return;
      }
      setWorkspaceOpen(true);
    });

    return () => { cancelled = true; };
  }, [requestedEditorialThread, focusId, editorialThread?.threadId, bindEditorialThread]);

  const chooseRelationship = useCallback(async (threadId: string) => {
    if (!focusId || editorialBusy) return;
    const out = await readBoundEditorialThread(threadId, focusId);
    if (!out.ok || !bindEditorialThread(out.thread)) {
      setEditorialFailure('The saved revision conversation could not be safely resumed.');
    }
  }, [focusId, editorialBusy, bindEditorialThread]);

  const startNewEditorial = useCallback(async (): Promise<RebuildEditorialThread | null> => {
    if (!focusId || !context) return null;
    if (!(await settleWriting())) return null;
    const posture = await readCurrentSanctuaryPosture();
    const passage = selectedPassage?.draftSectionId === focusId ? selectedPassage : null;
    const revision = writingRef.current?.currentRevisionId() ?? context.version;
    const opened = passage
      ? await openBoundEditorialPassage(focusId, { start: passage.start, end: passage.end }, revision, posture)
      : await openBoundEditorialThread(focusId, posture);

    if (!opened.ok) {
      setEditorialFailure(
        opened.reason === 'sanctuary_unavailable'
          ? 'Editorial revision is unavailable in Sanctuary. Nothing was changed.'
          : opened.reason === 'posture_unresolved'
            ? 'Choose Ordinary or Sanctuary above before opening a persistent editorial relationship. Your Craft request is still held here.'
            : 'The revision relationship could not be opened just now. Nothing was changed.',
      );
      return null;
    }

    return bindEditorialThread(opened.thread) ? opened.thread : null;
  }, [focusId, context, selectedPassage, settleWriting, bindEditorialThread]);

  const resolveEditorialForAct = useCallback(async (): Promise<RebuildEditorialThread | null> => {
    if (!focusId || !focusSection) return null;
    const desired = selectedPassage?.draftSectionId === focusId ? selectedPassage.text : focusSection.body;

    if (editorialThread?.targetSectionId === focusId && editorialThread.locusText === desired) {
      return editorialThread;
    }

    const found = await discoverEditorialRelationships(focusId);
    if (!found.ok) {
      setEditorialFailure('The Studio could not check your existing revision conversations just now.');
      return null;
    }

    const matching = found.relationships.filter((relationship) => relationship.locusText === desired);
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

  const openCarryChooser = useCallback(() => {
    if (!workspaceOpen || !a2Relationship || !editorialThread || editorialBusy) return;
    const posture = readCurrentSanctuaryPosture();
    if (!posture.resolved || posture.sanctuary) {
      setCarryPostureAvailable(false);
      carryChooserGen.current += 1;
      setCarryChooser({ kind: 'closed' });
      return;
    }
    const relationshipId = a2Relationship.id;
    const receiverThreadId = editorialThread.threadId;
    const generation = ++carryChooserGen.current;
    setCarryChooser({ kind: 'loading', relationshipId, receiverThreadId, generation });
    void readEligibleCarrySources(relationshipId, receiverThreadId).then((out) => {
      if (
        generation !== carryChooserGen.current
        || a2RelationshipIdRef.current !== relationshipId
        || editorialThreadIdRef.current !== receiverThreadId
      ) return;
      if (!out.ok) {
        setCarryChooser({ kind: 'unavailable', relationshipId, receiverThreadId, generation });
        return;
      }
      setCarryChooser({ kind: 'ready', relationshipId, receiverThreadId, generation, sources: out.sources });
    });
  }, [workspaceOpen, a2Relationship, editorialThread, editorialBusy]);

  const closeCarryChooser = useCallback(() => {
    carryChooserGen.current += 1;
    setCarryChooser({ kind: 'closed' });
  }, []);

  const selectCarrySource = useCallback((source: EligibleCarrySource) => {
    if (carryChooser.kind !== 'ready') return;
    const relationshipId = a2Relationship?.id ?? null;
    const receiverThreadId = editorialThread?.threadId ?? null;
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
  }, [carryChooser, a2Relationship?.id, editorialThread?.threadId]);

  const removeCarrySource = useCallback(() => setSelectedCarrySource(null), []);

  const sendEditorial = useCallback(async (
    requestText?: string,
    options?: { proposalPolicy?: ProposalPolicy; proposalRequested?: boolean },
  ) => {
    const text = (requestText ?? editorialDraft).trim();
    if (!focusId || !text || editorialBusy) return;

    setEditorialBusy(true);
    setEditorialFailure(null);
    setAdoptionOutcome(null);
    setVoiceNotice(null);

    try {
      const thread = await resolveEditorialForAct();
      if (!thread) return;
      const posture = await readCurrentSanctuaryPosture();
      const proposalRequested = options?.proposalRequested === true;
      const actionDirective = proposalRequested
        ? [
            'The writer explicitly requested proposed wording in this turn.',
            'Do not delay that requested proposal by asking what you need before suggesting a change; the writer has already authorized this bounded wording act.',
            'Keep the requested proposal within the declared revision latitude. If no lawful proposal can satisfy the request, explain that instead of repeating the current proposal.',
          ].join(' ')
        : '';
      const exactWords = [text, editorialDirective(editorialDepth), actionDirective].filter(Boolean).join('\n\n');
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
          mayProposeImmediately: mayProposeImmediately || proposalRequested,
        },
        {
          ...(options ?? {}),
          ...(developCraft && craftPriorThread.current && craftPriorThread.current.threadId !== thread.threadId ? {
            craftPassThreadId: craftPriorThread.current.threadId,
            craftPassTurnIndex: craftPriorThread.current.turnIndex,
          } : {}),
          ...(a2Relationship ? { relationshipId: a2Relationship.id } : {}),
          ...(carry ? { carry } : {}),
          ...(craftArrival && craftSourceThreadId && craftSourceMaiaTurnIndex !== null ? {
            workConversationThreadId: craftSourceThreadId,
            workConversationMaiaTurnIndex: craftSourceMaiaTurnIndex,
          } : {}),
        },
      );

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
              `This revision goes beyond your current “${current}” latitude. It would fit at “${needed}.” Nothing was changed. You can change Revision latitude in Preferences, then choose Revise from this again.`,
            );
          } else {
            setEditorialFailure(outcome.voice?.note
              ?? outcome.detail
              ?? `This revision goes beyond your current “${LATITUDE_BANDS[editLatitude].label}” latitude. Nothing was changed. Review Revision latitude in Preferences before trying again.`);
          }
        } else if (outcome.reason === 'sanctuary_unavailable') {
          setEditorialFailure('Editorial revision is unavailable in Sanctuary. Nothing was changed.');
        } else {
          setEditorialFailure(outcome.detail
            ?? 'MAIA could not complete that editorial turn. Nothing was changed.');
        }
        return;
      }

      setEditorialThread(outcome.thread);
      setVoiceNotice(outcome.voice?.note ?? null);
      if (outcome.producedVersionId) setSuggestedVersionId(outcome.producedVersionId);
      if (!requestText) setEditorialDraft('');
    } finally {
      setEditorialBusy(false);
    }
  }, [
    focusId,
    editorialDraft,
    editorialBusy,
    resolveEditorialForAct,
    editorialDepth,
    editLatitude,
    mayRemoveParagraphs,
    mayProposeImmediately,
    a2Relationship,
    selectedCarrySource,
    craftArrival,
    craftSourceThreadId,
    craftSourceMaiaTurnIndex,
  ]);

  const sendCraftEditorial = useCallback(async (
    requestText?: string,
    options?: CraftSendOptions,
  ) => {
    const text = (requestText ?? editorialDraft).trim();
    if (!text || !context || !focusId || editorialBusy || craftActivity
      || !editingSettingsResolved || craftRequestInFlight.current) return;
    const visibleRequest = options?.displayText ?? text;
    const command = options?.skipCanvasCommands ? null : parseCraftCanvasCommand(visibleRequest);
    if (command) {
      setCraftDialogue(turns => appendCraftDialogue(turns, {
        key: `writer:${++craftDialogueSeq.current}`, speaker: 'writer', body: visibleRequest,
      }));
      const port = craftTablePort.current;
      if (!port) { receiveCraftReceipt({ ok: false, message: 'The canvas is not ready for that command. Nothing changed.' }); return; }
      if (command.kind === 'keep') {
        const result = port.keepOriginal(command.word);
        if (result.ok && /\b(?:read|review|look|tell|show|move|focus)\b/iu.test(command.remainder)) {
          pendingCraftContinuation.current = { text, options: { ...options, skipCanvasCommands: true, suppressWriterEcho: true } };
          setCraftContinuationTick(n => n + 1);
        }
      } else if (command.kind === 'replace') port.replaceWorking(command.from, command.to);
      else if (command.kind === 'view') port.setView(command.view);
      else if (command.kind === 'stay') receiveCraftReceipt({ ok: true, message: 'Staying with this passage. No wording changed.' });
      else {
        const sections = chapterSpanFor(context.sections, focusId)?.sections ?? [focusSection!].filter(Boolean);
        const targets = paragraphTargets(sections, id => writingRef.current?.bodyOf(id)
          ?? context.sections.find(s => s.draftSectionId === id)?.body ?? '', writingRef.current?.currentRevisionId() ?? context.version);
        const current = selectedPassage ? { ...selectedPassage, sectionId: selectedPassage.draftSectionId, label: craftFocusLabel ?? '', sectionLabel: focusSection?.heading ?? '', source: 'writer' as const } : null;
        const target = command.kind === 'step'
          ? adjacentCraftTarget(targets, current, command.direction, command.unit)
          : resolveNamedCraftTarget(targets, command.name);
        if (target) moveCraftFocus(target);
        else receiveCraftReceipt({ ok: false, message: 'That focus is not unique. Select its words or choose a paragraph with Work here.' });
      }
      return;
    }
    const posture = readCurrentSanctuaryPosture();
    if (!posture.resolved || posture.sanctuary) {
      setEditorialFailure('Choose how this session is held before asking MAIA to read or retain a Craft reply. Nothing was sent.');
      return;
    }
    craftRequestInFlight.current = true;
    const identity = craftLiveIdentity.current;
    const revisionNumber = writingRef.current?.currentRevisionId() ?? context.version;
    const stillCurrent = () => {
      const livePosture = readCurrentSanctuaryPosture();
      return craftMounted.current && craftLiveIdentity.current === identity
        && (writingRef.current?.currentRevisionId() ?? context.version) === revisionNumber
        && livePosture.resolved && !livePosture.sanctuary;
    };
    try {
      const displayText = options?.displayText?.trim() ?? '';
      if (displayText && !options?.suppressWriterEcho) {
        setCraftDialogue(current => appendCraftDialogue(current, {
          key: `writer:${++craftDialogueSeq.current}`, speaker: 'writer', body: displayText,
        }));
      }
      const currentWorking = craftWorkingText ?? selectedPassage?.text ?? '';
      const intentText = options?.displayText ?? text;
      const effectiveOptions = resolveCraftSuggestionPolicy({
        request: intentText, proactive: mayProposeImmediately,
        proposalPolicy: options?.proposalPolicy, proposalRequested: options?.proposalRequested,
      });
      setCraftReadNotice(null);
      const read = await runCraftReread({
        request: intentText, manuscriptId: context.manuscriptId,
        sections: context.sections, activeSectionId: focusId, revisionNumber, stillCurrent,
        onProgress: activity => { if (stillCurrent()) setCraftActivity(activity); },
      });
      if (!stillCurrent()) return;
      if (read.kind === 'stopped') {
        setCraftReadNotice(read.notice);
        return;
      }
      if (read.kind === 'read') setCraftReadNotice(read.notice);
      const prompt = [
        text,
        read.kind === 'read' ? read.context : [
          read.notice,
          'Answer only from the active passage and evidence actually supplied. Do not claim a fresh chapter or whole-book reading.',
          'A broader-scope mention, quotation, negative request or uncertain instruction is not a reading commission. Clarify the requested scope if it is necessary to answer.',
        ].join('\n'),
        'Writer-owned choices explicitly settled on this page (keep these; do not reopen unless the writer asks):',
        JSON.stringify([...craftSettledChoices.current.values()]),
        'CURRENT EDITING FOCUS (earlier passages in the conversation are historical):',
        `${focusSection?.heading ?? 'Current section'} — ${craftFocusLabel ?? craftParagraphLabel(selectedPassage?.text ?? '')}`,
        'Writer-owned current working passage:', currentWorking,
        'Treat this as the wording the writer is shaping now. An empty working passage is intentional, not missing context. Do not silently restore an earlier MAIA proposal.',
        'Broader reading informs discussion; it does not authorize a wider rewrite or Apply. Any proposed wording stays inside the active locus.',
      ].join('\n\n');
      setCraftActivity(null);
      await sendEditorial(prompt, effectiveOptions);
    } catch {
      if (stillCurrent()) setEditorialFailure('That Craft request was interrupted. No retry was made and your manuscript is unchanged.');
    } finally {
      craftRequestInFlight.current = false;
      if (craftMounted.current) setCraftActivity(null);
    }
  }, [
    editorialDraft, context, focusId, editorialBusy, craftActivity, editingSettingsResolved,
    mayProposeImmediately, sendEditorial, craftWorkingText, selectedPassage?.text,
    receiveCraftReceipt, moveCraftFocus, focusSection, craftFocusLabel, selectedPassage,
  ]);

  useEffect(() => {
    const pending = pendingCraftContinuation.current;
    if (!pending || editorialBusy || craftActivity || craftRequestInFlight.current) return;
    if (pending.focusKey) {
      const snapshot = craftTablePort.current?.snapshot();
      if (!snapshot || snapshot.key !== pending.focusKey || snapshot.workingText !== craftWorkingText) return;
    }
    pendingCraftContinuation.current = null;
    void sendCraftEditorial(pending.text, pending.options);
  }, [craftWorkingText, editorialBusy, craftActivity, sendCraftEditorial, craftContinuationTick]);

  const moveCraftFocusAndSuggest = useCallback((target: CraftFocusTarget): boolean => {
    const posture = readCurrentSanctuaryPosture();
    if (!posture.resolved || posture.sanctuary) {
      receiveCraftReceipt({ ok: false, message: 'Choose the session privacy setting before asking MAIA for an edit. Nothing moved.' });
      return false;
    }
    if (!moveCraftFocus(target)) return false;
    // One explicit gesture: wait for the new table snapshot before dispatch.
    pendingCraftContinuation.current = {
      focusKey: craftTargetKey(target),
      text: 'Work from the newly focused passage and our carried conversation. Show one small, useful edit directly in marked copy. Preserve the writer-owned working version, voice and settled choices. Do not apply anything.',
      options: { proposalPolicy: 'require', proposalRequested: true,
        displayText: `Suggest one small edit to ${target.label}.` },
    };
    setCraftContinuationTick(n => n + 1);
    return true;
  }, [moveCraftFocus, receiveCraftReceipt]);

  const refreshContext = useCallback(async (): Promise<ContextReady | null> => {
    if (!context) return null;
    const response = await apiFetch(
      '/api/writers-studio/rebuild/context?manuscriptId=' + encodeURIComponent(context.manuscriptId),
    );
    if (!response.ok) return null;
    const body = await response.json() as ContextPayload;
    if (body.state !== 'section_aware') return null;
    setContext(body);
    return body;
  }, [context]);

  const applySuggested = useCallback(async () => {
    if (!focusId || !editorialThread || !suggestedVersion || adoptionBusy) return;
    setAdoptionBusy(true);
    setEditorialFailure(null);
    setUndoMessage(null);

    try {
      if (!(await settleWriting())) return;
      const result = await adoptBoundEditorialVersion(
        editorialThread.threadId,
        focusId,
        suggestedVersion.id,
      );
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

      const reread = await readBoundEditorialThread(editorialThread.threadId, focusId);
      if (reread.ok) setEditorialThread(reread.thread);
    } finally {
      setAdoptionBusy(false);
    }
  }, [
    focusId,
    editorialThread,
    suggestedVersion,
    adoptionBusy,
    settleWriting,
    refreshContext,
  ]);

  const undoSuggested = useCallback(async () => {
    const application = editorialThread?.application;
    if (!application?.canUndo || adoptionBusy) return;

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
      if (response.ok && body?.kind === 'undone') {
        setUndoMessage('That application was undone. The original passage is restored.');
        setAppliedVersionId(null);
        await refreshContext();
      } else {
        setUndoMessage('That application could not be undone just now. Nothing else was changed.');
      }

      if (focusId && editorialThread) {
        const reread = await readBoundEditorialThread(editorialThread.threadId, focusId);
        if (reread.ok) setEditorialThread(reread.thread);
      }
    } finally {
      setAdoptionBusy(false);
    }
  }, [editorialThread, adoptionBusy, refreshContext, focusId]);

  const saveMemberRevision = useCallback(async (draft: MemberRevisionDraft): Promise<boolean> => {
    if (memberVersionBusy || !editorialThread || !focusId) return false;
    if (draft.threadId !== editorialThread.threadId || draft.sectionId !== focusId) return false;

    setMemberVersionBusy(true);
    setEditorialFailure(null);
    setAdoptionOutcome(null);
    try {
      const response = await apiFetch('/api/writers-studio/editorial/version', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          threadId: draft.threadId,
          supersedes: draft.supersedes,
          replacementText: draft.text,
          ...(draft.purpose ? { purpose: draft.purpose } : {}),
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok || typeof body?.versionId !== 'string') {
        setEditorialFailure(response.status === 409
          ? 'This conversation gained another version. Your wording is retained here; nothing was applied.'
          : 'Your revision could not be saved. Its wording is still held here; nothing was applied.');
        return false;
      }

      setSuggestedVersionId(body.versionId);
      const reread = await readBoundEditorialThread(draft.threadId, draft.sectionId);
      if (reread.ok) setEditorialThread(reread.thread);
      return true;
    } catch {
      setEditorialFailure('The save could not be confirmed. Your wording is still held here.');
      return false;
    } finally {
      setMemberVersionBusy(false);
    }
  }, [memberVersionBusy, editorialThread, focusId]);
  const openWorkspace = useCallback((insight?: { readingId: string; key: string }) => {
    if (!workspaceOpen) {
      workspaceReturn.current = {
        focusId,
        selectedPassage,
        thread: editorialThread,
        versionId: suggestedVersionId,
      };
    }
    if (insight) setWorkspaceInsight(insight);
    setWorkspaceOpen(true);
  }, [workspaceOpen, focusId, selectedPassage, editorialThread, suggestedVersionId]);

  const closeWorkspace = useCallback(() => {
    if (editorialBusy || adoptionBusy || memberVersionBusy) return;
    setWorkspaceOpen(false);
  }, [editorialBusy, adoptionBusy, memberVersionBusy]);

  const returnToStartingPassage = useCallback(() => {
    if (editorialBusy || adoptionBusy || memberVersionBusy) return;
    const previous = workspaceReturn.current;
    if (previous) {
      setFocusId(previous.focusId);
      setSelectedPassage(previous.selectedPassage);
      setEditorialThread(previous.thread);
      setSuggestedVersionId(previous.versionId);
      if (previous.focusId && typeof window !== 'undefined') {
        replacePlaceAddress(locationForSection(window.location.pathname, window.location.search, previous.focusId));
      }
    }
    setWorkspaceOpen(false);
  }, [editorialBusy, adoptionBusy, memberVersionBusy]);

  const reviseInsightPassage = useCallback((passage: InsightPassage, authorNotes = '') => {
    if (!context || editorialBusy || adoptionBusy || memberVersionBusy || !passage.verified) return;
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
  ]);

  const chooseOwnPassage = useCallback(() => {
    setWorkspaceOpen(false);
  }, []);

  useEffect(() => {
    if (
      incomingAction !== 'craft-passage'
      || !craftArrival
      || arrivalInsight
      || !craftHintRange
      || !requestedSection
      || !context
      || workspaceOpen
    ) return;
    const section = context.sections.find(
      (candidate) => candidate.draftSectionId === requestedSection,
    );
    if (!section?.editable) return;
    const points = Array.from(section.body);
    if (craftHintRange.end > points.length) return;
    const exact = points.slice(craftHintRange.start, craftHintRange.end).join('');
    if (!exact.trim()) return;

    const key = [
      'resolved-craft-hint',
      craftSourceThreadId ?? 'no-thread',
      String(craftSourceMaiaTurnIndex ?? -1),
      requestedSection,
      craftHintRange.start,
      craftHintRange.end,
    ].join(':');
    if (focusInsightConsumed.current === key) return;
    focusInsightConsumed.current = key;
    holdPassage(section, craftHintRange.start, craftHintRange.end, exact);
    openWorkspace();
  }, [
    incomingAction,
    craftArrival,
    arrivalInsight,
    craftHintRange,
    requestedSection,
    context,
    workspaceOpen,
    craftSourceThreadId,
    craftSourceMaiaTurnIndex,
    holdPassage,
    openWorkspace,
  ]);

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
    if ((incomingAction === 'focus' || incomingAction === 'try-revision' || incomingAction === 'craft-passage') && !passage.range) return;

    const section = context.sections.find((candidate) => candidate.draftSectionId === passage.sectionId);
    if (!section) return;

    /* A section-level Attention Map observation is truthful orientation, not an
       exact revision locus. Bring the writer to the evidenced section and wait
       for their own passage selection before opening Focus or asking MAIA for a
       proposal. */
    if (incomingAction === 'choose-revision-passage' || incomingAction === 'choose-craft-passage') {
      setSelectedPassage(null);
      setWorkspaceOpen(false);
      return;
    }

    const range = passage.range ?? { start: 0, end: Array.from(passage.body).length };
    const exact = Array.from(passage.body).slice(range.start, range.end).join('');

    /* A Develop → Craft focus handoff is one arrival act. Once the carried
       evidence has been re-verified against the current draft, hold the exact
       passage and open the craft field in the same turn. Waiting for a later
       effect to observe the held state created a race where the writer arrived
       with valid evidence but no editorial room. */
    if ((incomingAction === 'focus' || incomingAction === 'try-revision' || incomingAction === 'craft-passage') && passage.range) {
      const key = [
        incomingAction,
        arrivalInsight.readingId,
        arrivalInsight.observation.key,
        section.draftSectionId,
        passage.range.start,
        passage.range.end,
      ].join(':');
      if (focusInsightConsumed.current === key) return;
      focusInsightConsumed.current = key;
      holdPassage(section, range.start, range.end, exact);
      openWorkspace({ readingId: arrivalInsight.readingId, key: arrivalInsight.observation.key });
      return;
    }

    holdPassage(section, range.start, range.end, exact);
  }, [arrivalInsight, context, requestedSection, incomingAction, holdPassage, openWorkspace]);

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

  useEffect(() => {
    if (
      (incomingAction !== 'choose-revision-passage' && incomingAction !== 'choose-craft-passage')
      || !arrivalInsight
      || !selectedPassage
      || workspaceOpen
    ) return;
    if (requestedSection && selectedPassage.draftSectionId !== requestedSection) return;

    const key = [
      incomingAction === 'choose-craft-passage' ? 'chosen-craft-passage' : 'chosen-revision-passage',
      arrivalInsight.readingId,
      arrivalInsight.observation.key,
      selectedPassage.draftSectionId,
      selectedPassage.start,
      selectedPassage.end,
    ].join(':');
    if (focusInsightConsumed.current === key) return;
    focusInsightConsumed.current = key;
    openWorkspace({ readingId: arrivalInsight.readingId, key: arrivalInsight.observation.key });
  }, [
    incomingAction,
    arrivalInsight,
    selectedPassage,
    workspaceOpen,
    requestedSection,
    openWorkspace,
  ]);

  useEffect(() => {
    if (
      incomingAction !== 'choose-craft-passage'
      || !craftArrival
      || arrivalInsight
      || !selectedPassage
      || workspaceOpen
    ) return;
    if (requestedSection && selectedPassage.draftSectionId !== requestedSection) return;

    const key = [
      'chosen-conversation-craft-passage',
      craftSourceThreadId ?? 'no-thread',
      String(craftSourceMaiaTurnIndex ?? -1),
      selectedPassage.draftSectionId,
      selectedPassage.start,
      selectedPassage.end,
    ].join(':');
    if (focusInsightConsumed.current === key) return;
    focusInsightConsumed.current = key;
    openWorkspace();
  }, [
    incomingAction,
    craftArrival,
    arrivalInsight,
    selectedPassage,
    workspaceOpen,
    requestedSection,
    craftSourceThreadId,
    craftSourceMaiaTurnIndex,
    openWorkspace,
  ]);

  useEffect(() => {
    if (
      (incomingAction !== 'try-revision' && incomingAction !== 'choose-revision-passage')
      || !arrivalInsight
      || !workspaceOpen
      || !selectedPassage
      || !focusId
      || editorialBusy
      || suggestedVersionId
    ) return;
    if (
      workspaceInsight?.readingId !== arrivalInsight.readingId
      || workspaceInsight.key !== arrivalInsight.observation.key
      || selectedPassage.draftSectionId !== focusId
    ) return;

    if (incomingAction === 'try-revision') {
      const passage = arrivalInsight.passages.find((candidate) =>
        candidate.sectionId === focusId
        && candidate.verified
        && candidate.editable
        && candidate.range,
      );
      if (!passage?.range) return;
      const exact = Array.from(passage.body).slice(passage.range.start, passage.range.end).join('');
      if (exact !== selectedPassage.text) return;
    }

    /* For a section-level observation, the writer's manual selection is the
       exact locus. The model did not choose it; the writer did. */
    const key = [
      arrivalInsight.readingId,
      arrivalInsight.observation.key,
      focusId,
      selectedPassage.start,
      selectedPassage.end,
      selectedPassage.text,
    ].join(':');
    if (autoProposalKey.current === key) return;
    autoProposalKey.current = key;

    void sendEditorial([
      'Offer one possible revision of this selected passage in response to the developmental observation.',
      'Preserve my voice, style, subject, imagery, cadence, vocabulary, medicine, and intentional ambiguity.',
      'Use the smallest sufficient intervention. Do not rewrite merely because smoother wording is possible.',
      'Do not assume the noticed pattern is a defect or that revision is improvement.',
      'Consider the strongest case for keeping the original unchanged.',
      'Treat possible reader effects as hypotheses.',
      'Make clear what changed, why, and what may be lost.',
      'Nothing is to be applied automatically.',
    ].join('\n'), { proposalRequested: true });
  }, [
    incomingAction,
    arrivalInsight,
    workspaceOpen,
    workspaceInsight,
    selectedPassage,
    focusId,
    editorialBusy,
    suggestedVersionId,
    sendEditorial,
  ]);



  /* Hermes carries context into Craft without manufacturing an invisible author
     turn. Proactive wording remains available on the writer's NEXT visible turn
     through resolveCraftSuggestionPolicy(); entering the room itself is not a
     persisted editorial act. */


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
  const onMode = useCallback((mode: 'home' | 'write' | 'develop' | 'review') => {
    if (mode === 'home') {
      const query = studioHomeReturnSearch(params?.toString() ?? '');
      router.push(`${pathname}${query ? `?${query}` : ''}`);
      return;
    }
    const next = new URLSearchParams(params?.toString() ?? '');
    next.set('mode', mode);
    next.delete('developCraft');
    next.delete('insightReading');
    next.delete('insightObservation');
    next.delete('insightAction');
    next.delete(CRAFT_SOURCE_THREAD);
    next.delete(CRAFT_SOURCE_MAIA_TURN);
    next.delete(CRAFT_HINT_START);
    next.delete(CRAFT_HINT_END);
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
            workspaceOpen={workspaceOpen}
            surfaceMode={developCraft ? 'develop-craft' : 'write'}
            craftMode={craftMode}
            carriedInsight={arrivalInsight}
            carriedInsightReturnMode={carriedInsightReturnMode}
            attentionReturnItemId={attentionReturnItemId}
            attentionReturnRequiresSelection={incomingAction === 'choose-revision-passage' || incomingAction === 'choose-craft-passage'}
            lineageReturnChapterId={lineageReturnChapterId}
            lineageReturnCandidateId={lineageReturnCandidateId}
            workspaceInsight={workspaceInsight}
            editorialThread={editorialThread}
            relationshipChoices={relationshipChoices}
            maiaRelationship={a2Relationship}
            maiaRelationshipChoices={a2RelationshipChoices}
            maiaRelationshipPhase={a2RelationshipPhase}
            maiaRelationshipBusy={a2RelationshipBusy}
            maiaRelationshipMessage={a2RelationshipMessage}
            carrySourceAvailable={carryPostureAvailable && Boolean(a2Relationship) && Boolean(editorialThread)}
            carryChooser={carryChooser.kind === 'ready'
              ? { kind: 'ready', sources: carryChooser.sources }
              : { kind: carryChooser.kind }}
            selectedCarrySource={selectedCarrySource}
            suggestedVersion={suggestedVersion}
            appliedVersionId={editorialThread?.application && !editorialThread.application.undone
              ? editorialThread.application.versionId
              : appliedVersionId}
            editorialDraft={editorialDraft}
            editorialDepth={editorialDepth}
            editLatitude={editLatitude}
            mayRemoveParagraphs={mayRemoveParagraphs}
            mayProposeImmediately={mayProposeImmediately}
            voiceNotice={voiceNotice}
            sessionPosture={sessionPosture}
            onChooseSessionPosture={chooseSessionPosture}
            editorialBusy={editorialBusy}
            craftWorkingText={craftWorkingText}
            onCraftWorkingTextChange={setCraftWorkingText}
            craftFocus={developCraft ? {
              current: selectedPassage ? {
                sectionId: selectedPassage.draftSectionId, start: selectedPassage.start, end: selectedPassage.end,
                text: selectedPassage.text, revisionNumber: selectedPassage.revisionNumber,
                label: craftFocusLabel ?? craftParagraphLabel(selectedPassage.text),
                sectionLabel: focusSection?.heading ?? 'Current section', source: 'writer',
              } : null,
              restoreSnapshot: craftRestoreSnapshot,
              earlier: [...craftFocusDrafts.current.values()].map(entry => entry.target)
                .filter(t => !selectedPassage || t.sectionId !== selectedPassage.draftSectionId || t.start !== selectedPassage.start || t.end !== selectedPassage.end),
              receipt: craftActionReceipt,
              suggestions: context && focusId ? referencedCraftTargets(
                paragraphTargets(chapterSpanFor(context.sections, focusId)?.sections ?? [focusSection!].filter(Boolean),
                  id => writingRef.current?.bodyOf(id) ?? context.sections.find(s => s.draftSectionId === id)?.body ?? '',
                  writingRef.current?.currentRevisionId() ?? context.version),
                lastMaiaEditorialTurn?.body ?? '',
              ).filter(t => !selectedPassage || t.sectionId !== selectedPassage.draftSectionId
                || t.end <= selectedPassage.start || t.start >= selectedPassage.end) : [],
              onMove: moveCraftFocus,
              onMoveAndSuggest: moveCraftFocusAndSuggest,
              onStay: () => receiveCraftReceipt({ ok: true, message: 'Staying with this passage. No wording changed.' }),
              onAsk: () => void sendCraftEditorial(
                'Read this chapter for reader experience. Identify one or two useful passages outside the current focus, quoting exact words from the verified reading. Respect settled choices. Do not propose replacement wording yet. A next passage will be selected separately.',
                { proposalPolicy: 'reply_only', displayText: 'Read this chapter for reader experience and show me where we could work next. Do not change anything yet.' },
              ),
              onConnect: connectCraftTable,
              onReceipt: receiveCraftReceipt,
            } : undefined}
            craftActivity={craftActivity}
            craftReadNotice={craftReadNotice}
            craftDialogue={craftDialogue}
            adoptionBusy={adoptionBusy}
            memberVersionBusy={memberVersionBusy}
            editorialFailure={editorialFailure}
            adoptionOutcome={adoptionOutcome}
            undoMessage={undoMessage}
            lastMaiaEditorialTurn={lastMaiaEditorialTurn}
            onOpenWorkspace={openWorkspace}
            onDismissCarriedInsight={() => {
              setArrivalInsight(null);
              setWorkspaceInsight(null);
            }}
            onCloseWorkspace={closeWorkspace}
            onReturnToStartingPassage={returnToStartingPassage}
            canReturnToStartingPassage={Boolean(
              workspaceReturn.current?.focusId
              && workspaceReturn.current.focusId !== focusId
            )}
            onDepth={setEditorialDepth}
            onInstruction={setEditorialDraft}
            onSendEditorial={(text, options) => void (
              developCraft
                ? sendCraftEditorial(text, options)
                : sendEditorial(text, options)
            )}
            onSelectVersion={(id) => {
              setSuggestedVersionId(id);
              setAdoptionOutcome(null);
              setEditorialFailure(null);
            }}
            onApply={() => void applySuggested()}
            onUndo={editorialThread?.application?.canUndo ? () => void undoSuggested() : undefined}
            onSaveMember={saveMemberRevision}
            onKeep={() => {
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
