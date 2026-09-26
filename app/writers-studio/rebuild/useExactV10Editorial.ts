'use client';

import { useCallback, useEffect, useState, type MutableRefObject } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { readCurrentSanctuaryPosture } from '@/lib/sanctuary/currentClientPosture';
import {
  adoptBoundEditorialVersion, openBoundEditorialPassage, readBoundEditorialThread,
  sendBoundEditorialTurn, type EditorialCarrySelection, type RebuildEditorialThread,
} from '@/lib/writersStudio/rebuild/editorialCollaboration';
import type { SectionWriting } from '@/lib/writersStudio/useSectionWriting';
import { useEditingLatitude } from '../insight/EditingLatitude';
import {
  DEFAULT_EDITORIAL_DEPTH, editorialDirective, type EditorialDepth,
} from '@/lib/writersStudio/editorialDepth';
import {
  maiaCopyFromThread, presentationPhase, versionHistoryFromThread,
} from '@/lib/writersStudio/studio/adapters/liveV10Write';
import type { MaiaTab, WritePresentationPhase } from '../flagship/WriteRoom';
import type { ContextualMessage } from '../flagship/ContextualMaiaPanel';

export interface ExactHeldPassage {
  readonly sectionId: string;
  readonly start: number;
  readonly end: number;
  readonly text: string;
}

export interface ExactV10EditorialInput {
  readonly enabled: boolean;
  readonly manuscriptId: string;
  readonly focusId: string | null;
  readonly held: ExactHeldPassage | null;
  readonly writingRef: MutableRefObject<SectionWriting | null>;
  readonly contextVersion: number;
  readonly relationshipId?: string;
  readonly carry?: EditorialCarrySelection;
  readonly consumeCarry?: () => void;
  readonly refreshAfterMutation?: () => Promise<void>;
}

export interface ExactV10EditorialController {
  readonly panelOpen: boolean;
  readonly thread: RebuildEditorialThread | null;
  readonly draft: string;
  readonly busy: boolean;
  readonly failure: string | null;
  readonly tab: MaiaTab;
  readonly depth: EditorialDepth;
  readonly previewVersionId: string | null;
  readonly selectedVersionId: string | null;
  readonly historyOpen: boolean;
  readonly phase: WritePresentationPhase;
  readonly copy: ReturnType<typeof maiaCopyFromThread>;
  readonly history: ReturnType<typeof versionHistoryFromThread>;
  readonly message: ContextualMessage | null;
  readonly open: () => void;
  readonly close: () => void;
  readonly setDraft: (value: string) => void;
  readonly setTab: (tab: MaiaTab) => void;
  readonly setDepth: (depth: EditorialDepth) => void;
  readonly send: () => Promise<void>;
  readonly readInContext: (versionId: string) => void;
  readonly backToAlternatives: () => void;
  readonly keepOriginal: () => void;
  readonly apply: () => Promise<void>;
  readonly undo: () => Promise<void>;
  readonly openHistory: () => void;
  readonly closeHistory: () => void;
}

async function settleWriting(writing: SectionWriting | null): Promise<
  { ok: true } | { ok: false; message: string }
> {
  if (!writing) return { ok: true };
  const blocked = () => writing.sections.some((section) => {
    const status = writing.statusOf(section.id);
    return status === 'conflict' || status === 'error';
  });

  if (blocked()) {
    return { ok: false, message: 'Your latest writing needs attention before MAIA reads or changes the Work. Nothing else was sent.' };
  }
  writing.flushPending();
  const deadline = Date.now() + 5000;
  while (writing.hasUnsavedWork()) {
    if (blocked() || Date.now() > deadline) {
      return { ok: false, message: 'Your latest writing is not safely settled yet. MAIA will wait rather than read an older copy.' };
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return { ok: true };
}

function refusalCopy(reason: string, detail?: string): string {
  if (reason === 'posture_unresolved') {
    return 'Your Sanctuary setting could not be read on this device, so nothing was sent. Open MAIA here once, then try again.';
  }
  if (reason === 'sanctuary_unavailable') {
    return 'Sanctuary is on. This conversation is durable by construction, so it cannot hold your words until Sanctuary is off. Nothing was written.';
  }
  if (reason === 'scope_refused') {
    return detail ?? 'That suggestion went beyond your editing latitude. Nothing was changed.';
  }
  if (reason === 'unavailable') {
    return 'Revision collaboration is not enabled in this build yet. Nothing was written.';
  }
  return 'MAIA could not complete this revision turn. Your manuscript was not changed.';
}

export function useExactV10Editorial(input: ExactV10EditorialInput): ExactV10EditorialController {
  const [panelOpen, setPanelOpen] = useState(false);
  const [thread, setThread] = useState<RebuildEditorialThread | null>(null);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [tab, setTab] = useState<MaiaTab>('Discuss');
  const [depth, setDepth] = useState<EditorialDepth>(DEFAULT_EDITORIAL_DEPTH);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [previewVersionId, setPreviewVersionId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { latitude, mayRemoveParagraphs, mayProposeImmediately } = useEditingLatitude(input.manuscriptId);

  useEffect(() => {
    setPanelOpen(false);
    setThread(null);
    setDraft('');
    setFailure(null);
    setSelectedVersionId(null);
    setPreviewVersionId(null);
    setHistoryOpen(false);
  }, [
    input.manuscriptId, input.focusId, input.relationshipId,
    input.held?.sectionId, input.held?.start, input.held?.end, input.held?.text,
  ]);

  const open = useCallback(() => {
    if (!input.enabled || !input.held) return;
    setFailure(null);
    setPanelOpen(true);
  }, [input.enabled, input.held]);

  const close = useCallback(() => {
    setPanelOpen(false);
    setHistoryOpen(false);
  }, []);

  const resolveThread = useCallback(async (): Promise<RebuildEditorialThread | null> => {
    const held = input.held;
    const focusId = input.focusId;
    if (!held || !focusId || held.sectionId !== focusId) return null;
    if (thread?.targetSectionId === focusId && thread.locusText === held.text) return thread;

    const settled = await settleWriting(input.writingRef.current);
    if (!settled.ok) {
      setFailure(settled.message);
      return null;
    }
    const posture = readCurrentSanctuaryPosture();
    const revision = input.writingRef.current?.currentRevisionId() ?? input.contextVersion;
    const opened = await openBoundEditorialPassage(
      focusId, { start: held.start, end: held.end }, revision, posture,
    );
    if (!opened.ok) {
      setFailure(refusalCopy(opened.reason, opened.detail));
      return null;
    }
    setThread(opened.thread);
    setSelectedVersionId(opened.thread.headVersionId);
    return opened.thread;
  }, [input.held, input.focusId, input.contextVersion, input.writingRef, thread]);

  const send = useCallback(async () => {
    if (!input.enabled || !panelOpen || !draft.trim() || busy) return;
    const posture = readCurrentSanctuaryPosture();
    if (!posture.resolved) {
      setFailure(refusalCopy('posture_unresolved'));
      return;
    }
    setBusy(true);
    setFailure(null);
    try {
      const current = await resolveThread();
      if (!current || !input.focusId) return;
      const carry = input.carry;
      /* One explicit carry act: consume locally immediately before transport. */
      if (carry) input.consumeCarry?.();
      const out = await sendBoundEditorialTurn(
        current.threadId,
        input.focusId,
        draft + '\n\n' + editorialDirective(depth),
        posture,
        { latitude, mayRemoveParagraphs, mayProposeImmediately },
        input.relationshipId,
        carry,
      );
      if (!out.ok) {
        setFailure(refusalCopy(out.reason, out.detail));
        return;
      }
      setThread(out.thread);
      const chosen = out.producedVersionId ?? out.thread.headVersionId;
      setSelectedVersionId(chosen);
      setPreviewVersionId(null);
      setDraft('');
    } finally {
      setBusy(false);
    }
  }, [
    input.enabled, input.focusId, input.relationshipId, input.carry, input.consumeCarry,
    panelOpen, draft, busy, resolveThread, depth, latitude, mayRemoveParagraphs, mayProposeImmediately,
  ]);

  const readInContext = useCallback((versionId: string) => {
    if (versionId === 'keep-original') {
      setSelectedVersionId(null);
      setPreviewVersionId(null);
      return;
    }
    if (!thread?.versions.some((version) => version.id === versionId)) return;
    setSelectedVersionId(versionId);
    setPreviewVersionId(versionId);
  }, [thread]);

  const backToAlternatives = useCallback(() => setPreviewVersionId(null), []);
  const keepOriginal = useCallback(() => {
    setSelectedVersionId(null);
    setPreviewVersionId(null);
    setHistoryOpen(false);
  }, []);

  const apply = useCallback(async () => {
    if (!thread || !input.focusId || !previewVersionId || busy) return;
    setBusy(true);
    setFailure(null);
    try {
      const settled = await settleWriting(input.writingRef.current);
      if (!settled.ok) {
        setFailure(settled.message);
        return;
      }
      const out = await adoptBoundEditorialVersion(thread.threadId, input.focusId, previewVersionId);
      if (!out.ok) {
        setFailure('The Studio would not apply wording that could not be proven to belong to this exact revision conversation.');
        return;
      }
      if (out.outcome.kind === 'applied' || out.outcome.kind === 'work_moved') {
        await input.refreshAfterMutation?.();
      }
      const reread = await readBoundEditorialThread(thread.threadId, input.focusId);
      if (reread.ok) setThread(reread.thread);
      setPreviewVersionId(null);
    } finally {
      setBusy(false);
    }
  }, [thread, input.focusId, input.writingRef, input.refreshAfterMutation, previewVersionId, busy]);

  const undo = useCallback(async () => {
    const application = thread?.application;
    if (!application || !input.focusId || busy) return;
    setBusy(true);
    setFailure(null);
    try {
      const settled = await settleWriting(input.writingRef.current);
      if (!settled.ok) {
        setFailure(settled.message);
        return;
      }
      const res = await apiFetch('/api/writers-studio/editorial/undo', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ authorizationId: application.authorizationId }),
      });
      const out = await res.json().catch(() => null);
      if (!res.ok || out?.kind !== 'undone') {
        setFailure('Undo was not performed: the manuscript has changed or this application is no longer reversible. Your current writing is retained.');
        return;
      }
      await input.refreshAfterMutation?.();
      const reread = await readBoundEditorialThread(thread!.threadId, input.focusId);
      if (reread.ok) setThread(reread.thread);
    } finally {
      setBusy(false);
    }
  }, [thread, input.focusId, input.writingRef, input.refreshAfterMutation, busy]);

  const phase = presentationPhase({
    panelOpen,
    thread,
    heldSectionId: input.held?.sectionId ?? null,
    previewVersionId,
    selectedVersionId,
    undoConfirmed: Boolean(thread?.application?.undone),
  });
  const copy = maiaCopyFromThread(thread);
  const history = versionHistoryFromThread(thread);
  const message: ContextualMessage | null = failure
    ? { text: failure, speaker: 'studio' }
    : busy
      ? { text: 'MAIA is working with this passage…', speaker: 'studio' }
      : null;

  return {
    panelOpen, thread, draft, busy, failure, tab, depth,
    previewVersionId, selectedVersionId, historyOpen,
    phase, copy, history, message,
    open, close, setDraft, setTab, setDepth, send,
    readInContext, backToAlternatives, keepOriginal, apply, undo,
    openHistory: () => setHistoryOpen(true),
    closeHistory: () => setHistoryOpen(false),
  };
}
