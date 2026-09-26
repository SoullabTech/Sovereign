'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { readCurrentSanctuaryPosture } from '@/lib/sanctuary/currentClientPosture';
import {
  createA2Relationship, listA2Relationships, readA2Relationship, readEligibleCarrySources,
  type A2RelationshipSummary, type EligibleCarrySource,
} from '@/lib/writersStudio/rebuild/relationshipOrchestration';
import {
  clearRelationshipReturnClient, persistPlaceReturnOrdered, readPlaceReturnClient,
  readRelationshipReturnClient, writeRelationshipReturnClient,
} from '@/lib/writersStudio/rebuild/returnStateClient';
import type { EditorialCarrySelection } from '@/lib/writersStudio/rebuild/editorialCollaboration';

export type RelationshipPhase = 'loading' | 'ready' | 'unavailable';

export type ExactCarryChooser =
  | { readonly kind: 'closed' }
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly sources: readonly EligibleCarrySource[] }
  | { readonly kind: 'unavailable' };

export interface SelectedExactCarry extends EligibleCarrySource {
  readonly relationshipId: string;
  readonly receiverThreadId: string;
}

export interface ExactV10RelationshipInput {
  readonly livingWorkId: string | null;
  readonly manuscriptId: string;
  readonly requestedRelationshipId: string | null;
  readonly requestedSectionId: string | null;
  readonly currentSectionId: string | null;
  readonly receiverThreadId: string | null;
  readonly validSectionIds: readonly string[];
  readonly onRelationshipAddress: (relationshipId: string | null) => void;
  readonly onRestorePlace: (sectionId: string) => void;
}

export interface ExactV10RelationshipController {
  readonly phase: RelationshipPhase;
  readonly relationship: A2RelationshipSummary | null;
  readonly choices: readonly A2RelationshipSummary[];
  readonly busy: boolean;
  readonly message: string | null;
  readonly chooserOpen: boolean;
  readonly carryChooser: ExactCarryChooser;
  readonly selectedCarry: SelectedExactCarry | null;
  readonly carrySelector?: EditorialCarrySelection;
  readonly begin: () => Promise<void>;
  readonly choose: (relationshipId: string) => Promise<void>;
  readonly leave: () => Promise<void>;
  readonly setChooserOpen: (open: boolean) => void;
  readonly rememberPlace: (sectionId: string) => void;
  readonly openCarryChooser: () => void;
  readonly closeCarryChooser: () => void;
  readonly selectCarry: (source: EligibleCarrySource) => void;
  readonly removeCarry: () => void;
  readonly consumeCarry: () => void;
}

export function useExactV10Relationship(
  input: ExactV10RelationshipInput,
): ExactV10RelationshipController {
  const [phase, setPhase] = useState<RelationshipPhase>('loading');
  const [relationship, setRelationship] = useState<A2RelationshipSummary | null>(null);
  const [choices, setChoices] = useState<readonly A2RelationshipSummary[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [chooserOpen, setChooserOpen] = useState(false);
  const [carryChooser, setCarryChooser] = useState<ExactCarryChooser>({ kind: 'closed' });
  const [selectedCarry, setSelectedCarry] = useState<SelectedExactCarry | null>(null);
  const carryGeneration = useRef(0);
  const restoredPlaceKey = useRef<string | null>(null);
  const placeTouched = useRef(false);

  useEffect(() => {
    const workId = input.livingWorkId;
    if (!workId) {
      setRelationship(null);
      setChoices([]);
      setPhase('ready');
      setMessage(null);
      return;
    }
    let cancelled = false;
    const scope = { livingWorkId: workId, manuscriptId: input.manuscriptId };
    setPhase('loading');
    setMessage(null);
    void (async () => {
      const listed = await listA2Relationships(workId, input.manuscriptId);
      if (cancelled) return;
      if (!listed.ok) {
        setRelationship(null); setChoices([]); setPhase('unavailable');
        setMessage('Your MAIA relationships could not be read just now. Nothing was changed.');
        return;
      }
      setChoices(listed.relationships);
      let candidate = input.requestedRelationshipId;
      let remembered = false;
      if (!candidate) {
        const returned = await readRelationshipReturnClient(scope);
        if (cancelled) return;
        if (!returned.ok) {
          setRelationship(null); setPhase('ready');
          setMessage('Your saved MAIA relationship could not be recalled just now. Nothing was changed.');
          return;
        }
        candidate = returned.relationshipId;
        remembered = candidate !== null;
      }

      if (!candidate) {
        setRelationship(null); setPhase('ready'); return;
      }
      const addressed = await readA2Relationship(candidate);
      if (cancelled) return;
      if (!addressed.ok
        || addressed.relationship.livingWorkId !== workId
        || addressed.relationship.manuscriptId !== input.manuscriptId) {
        setRelationship(null); setPhase('ready');
        if (input.requestedRelationshipId) {
          setMessage('That MAIA relationship does not belong to this Work and manuscript, so it was not opened here.');
          input.onRelationshipAddress(null);
        } else if (remembered) {
          void clearRelationshipReturnClient(scope);
          setMessage('Your previously selected MAIA relationship is no longer available for this Work, so it was not reopened.');
        }
        return;
      }
      setRelationship(addressed.relationship);
      setPhase('ready');
      if (!input.requestedRelationshipId && remembered) {
        input.onRelationshipAddress(addressed.relationship.id);
      }
    })();
    return () => { cancelled = true; };
  }, [
    input.livingWorkId, input.manuscriptId, input.requestedRelationshipId,
    input.onRelationshipAddress,
  ]);

  useEffect(() => {
    const workId = input.livingWorkId;
    if (!workId || input.requestedSectionId) return;
    const key = `${workId}:${input.manuscriptId}`;
    if (restoredPlaceKey.current === key) return;
    restoredPlaceKey.current = key;
    let cancelled = false;
    void readPlaceReturnClient({ livingWorkId: workId, manuscriptId: input.manuscriptId }).then((returned) => {
      if (cancelled || placeTouched.current || !returned.ok || !returned.sectionId) return;
      if (!input.validSectionIds.includes(returned.sectionId)) return;
      input.onRestorePlace(returned.sectionId);
    });
    return () => { cancelled = true; };
  }, [
    input.livingWorkId, input.manuscriptId, input.requestedSectionId,
    input.validSectionIds, input.onRestorePlace,
  ]);

  useEffect(() => {
    carryGeneration.current += 1;
    setCarryChooser({ kind: 'closed' });
    setSelectedCarry(null);
  }, [relationship?.id, input.receiverThreadId, input.currentSectionId, input.manuscriptId]);

  const begin = useCallback(async () => {
    const workId = input.livingWorkId;
    if (!workId || busy) return;
    setBusy(true); setMessage(null);
    try {
      const created = await createA2Relationship(workId, input.manuscriptId);
      if (!created.ok) {
        setMessage('The Studio could not begin that MAIA relationship just now. Nothing else changed.');
        return;
      }
      setChoices((current) => [...current, created.relationship]);
      const kept = await writeRelationshipReturnClient(
        { livingWorkId: workId, manuscriptId: input.manuscriptId }, created.relationship.id,
      );
      if (!kept) {
        setMessage('The relationship was created, but the Studio could not safely remember it as your return relationship, so it was not selected.');
        return;
      }
      setRelationship(created.relationship);
      setChooserOpen(false);
      input.onRelationshipAddress(created.relationship.id);
    } finally {
      setBusy(false);
    }
  }, [input.livingWorkId, input.manuscriptId, input.onRelationshipAddress, busy]);

  const choose = useCallback(async (relationshipId: string) => {
    const workId = input.livingWorkId;
    if (!workId || busy) return;
    setBusy(true); setMessage(null);
    try {
      const found = await readA2Relationship(relationshipId);
      if (!found.ok
        || found.relationship.livingWorkId !== workId
        || found.relationship.manuscriptId !== input.manuscriptId) {
        setMessage('That MAIA relationship is not available for this Work.');
        return;
      }
      const kept = await writeRelationshipReturnClient(
        { livingWorkId: workId, manuscriptId: input.manuscriptId }, found.relationship.id,
      );
      if (!kept) {
        setMessage('The Studio could not safely remember that relationship for return, so your current selection was left unchanged.');
        return;
      }
      setRelationship(found.relationship);
      setChooserOpen(false);
      input.onRelationshipAddress(found.relationship.id);
    } finally {
      setBusy(false);
    }
  }, [input.livingWorkId, input.manuscriptId, input.onRelationshipAddress, busy]);

  const leave = useCallback(async () => {
    const workId = input.livingWorkId;
    if (!workId || busy) return;
    setBusy(true); setMessage(null);
    try {
      const cleared = await clearRelationshipReturnClient({
        livingWorkId: workId, manuscriptId: input.manuscriptId,
      });
      if (!cleared) {
        setMessage('The Studio could not safely forget this return relationship just now, so it remains selected.');
        return;
      }
      setRelationship(null);
      setChooserOpen(false);
      input.onRelationshipAddress(null);
    } finally {
      setBusy(false);
    }
  }, [input.livingWorkId, input.manuscriptId, input.onRelationshipAddress, busy]);

  const rememberPlace = useCallback((sectionId: string) => {
    const workId = input.livingWorkId;
    placeTouched.current = true;
    if (!workId || !input.validSectionIds.includes(sectionId)) return;
    void persistPlaceReturnOrdered(
      { livingWorkId: workId, manuscriptId: input.manuscriptId }, sectionId,
    ).then((ok) => {
      if (!ok) setMessage('Your place changed here, but the Studio could not remember it for your next visit just now.');
    });
  }, [input.livingWorkId, input.manuscriptId, input.validSectionIds]);

  const openCarryChooser = useCallback(() => {
    const receiverThreadId = input.receiverThreadId;
    if (!relationship || !receiverThreadId) return;
    const posture = readCurrentSanctuaryPosture();
    if (!posture.resolved || posture.sanctuary) {
      carryGeneration.current += 1;
      setCarryChooser({ kind: 'closed' });
      return;
    }
    const relationshipId = relationship.id;
    const generation = ++carryGeneration.current;
    setCarryChooser({ kind: 'loading' });
    void readEligibleCarrySources(relationshipId, receiverThreadId).then((out) => {
      if (generation !== carryGeneration.current) return;
      if (!out.ok) {
        setCarryChooser({ kind: 'unavailable' });
        return;
      }
      setCarryChooser({ kind: 'ready', sources: out.sources });
    });
  }, [relationship, input.receiverThreadId]);

  const closeCarryChooser = useCallback(() => {
    carryGeneration.current += 1;
    setCarryChooser({ kind: 'closed' });
  }, []);

  const selectCarry = useCallback((source: EligibleCarrySource) => {
    const receiverThreadId = input.receiverThreadId;
    if (!relationship || !receiverThreadId || carryChooser.kind !== 'ready') return;
    if (!carryChooser.sources.some((candidate) => candidate.sourceEpisodeSequence === source.sourceEpisodeSequence)) return;
    setSelectedCarry({ ...source, relationshipId: relationship.id, receiverThreadId });
    closeCarryChooser();
  }, [relationship, input.receiverThreadId, carryChooser, closeCarryChooser]);

  const removeCarry = useCallback(() => setSelectedCarry(null), []);
  const consumeCarry = useCallback(() => setSelectedCarry(null), []);

  const carrySelector = selectedCarry ? {
    kind: 'prior_maia_editorial_turn' as const,
    sourceEpisodeSequence: selectedCarry.sourceEpisodeSequence,
  } : undefined;

  return {
    phase, relationship, choices, busy, message, chooserOpen, carryChooser, selectedCarry,
    carrySelector, begin, choose, leave, setChooserOpen, rememberPlace,
    openCarryChooser, closeCarryChooser, selectCarry, removeCarry, consumeCarry,
  };
}
