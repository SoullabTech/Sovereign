/**
 * LIVING VOICE — the writer's side of one creative encounter.
 *
 * ── WHAT THIS HOOK IS FOR ─────────────────────────────────────────────────
 *
 *   This is not MAIA gaining permission to read the Work.
 *   It is the writer offering MAIA one passage for one creative encounter.
 *
 * So the hook holds exactly one offer at a time, and holds it in memory only.
 * There is no store, no key, no draft of it anywhere. Closing the encounter
 * does not delete a record — there was never a record. That is LV-H's
 * non-durability expressed as construction rather than as policy.
 *
 * ── THE THREE ACTS, KEPT DISTINCT ─────────────────────────────────────────
 *
 *   SELECTION      establishes the subject. It reaches nothing. (LV-A)
 *   OFFERING       opens the encounter. A grant, not an occasion.
 *   ASKING A LENS  is the act. Only this sends the passage.
 *
 * A lens is an invitation to look, not a classification of the passage, and
 * the writer chooses it every time. Nothing here remembers which lens they
 * chose before, because remembering it would begin to be a reading of them.
 *
 * ── SILENCE IS A LAWFUL OUTCOME ───────────────────────────────────────────
 *
 * The server returns `{ response: null }` when MAIA had nothing that held to
 * its own rules. That is not an error, not a retry, and not a gap to fill: the
 * writer asked to look at their own sentence, and the honest answer was that
 * looking produced nothing worth saying. `phase: 'silent'` says exactly that.
 */
'use client';

import { useCallback, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import {
  checkPassage,
  passageRefusalCopy,
  type LivingVoiceLens,
} from './livingVoice';

export interface LivingVoiceOffer {
  /** The writer's own words, exactly as they selected them. Never trimmed to fit. */
  passage: string;
  /** Where the passage came from, for the anchor only. The body is never read. */
  sectionId: string | null;
}

export type LivingVoicePhase =
  /** No encounter is open. */
  | 'closed'
  /** A passage has been offered; no lens has been asked. Nothing has been sent. */
  | 'offered'
  /** A lens was asked and the encounter is in flight. */
  | 'asking'
  /** MAIA answered. */
  | 'answered'
  /** MAIA had nothing to say that held to its own rules. Lawful, not an error. */
  | 'silent'
  /** The offer itself could not be accepted — too long, or empty. */
  | 'refused'
  /** The encounter could not happen. Distinct from silence on purpose. */
  | 'error';

export interface LivingVoice {
  phase: LivingVoicePhase;
  offer: LivingVoiceOffer | null;
  /** The lens most recently asked, for THIS encounter only. Never carried forward. */
  lens: LivingVoiceLens | null;
  response: string | null;
  /** Refusal or error copy, addressed to the writer. */
  note: string | null;
  /** Open an encounter around a passage the writer chose. Sends nothing. */
  open: (passage: string, sectionId?: string | null) => void;
  /** The act. Only this sends the passage. */
  ask: (lens: LivingVoiceLens) => Promise<void>;
  /** End the encounter. The passage and the response go with it. */
  close: () => void;
}

export function useLivingVoice(manuscriptId: string | null): LivingVoice {
  const [phase, setPhase] = useState<LivingVoicePhase>('closed');
  const [offer, setOffer] = useState<LivingVoiceOffer | null>(null);
  const [lens, setLens] = useState<LivingVoiceLens | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const close = useCallback(() => {
    setPhase('closed');
    setOffer(null);
    setLens(null);
    setResponse(null);
    setNote(null);
  }, []);

  const open = useCallback((passage: string, sectionId: string | null = null) => {
    setLens(null);
    setResponse(null);

    /* LV-I is checked HERE as well as on the server, so the writer learns the
       bound from their own selection rather than from a failed round trip.
       Refused, never truncated: silently cutting the selection would be the
       system deciding which part of what they chose mattered. */
    const checked = checkPassage(passage);
    if (!checked.ok) {
      setOffer({ passage, sectionId });
      setNote(passageRefusalCopy(checked.refusal));
      setPhase('refused');
      return;
    }

    setOffer({ passage: checked.passage, sectionId });
    setNote(null);
    setPhase('offered');
  }, []);

  const ask = useCallback(async (chosen: LivingVoiceLens) => {
    if (!manuscriptId || !offer) return;
    setLens(chosen);
    setResponse(null);
    setNote(null);
    setPhase('asking');

    try {
      const res = await apiFetch(
        `/api/sovereign/manuscripts/${manuscriptId}/living-voice`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            passage: offer.passage,
            lens: chosen,
            sectionId: offer.sectionId ?? undefined,
          }),
        },
      );
      const data = await res.json().catch(() => null) as
        | { response?: string | null; error?: string }
        | null;

      if (!res.ok) {
        setNote(data?.error ?? 'That could not be looked at just now.');
        setPhase(res.status === 400 ? 'refused' : 'error');
        return;
      }

      const text = typeof data?.response === 'string' ? data.response : null;
      if (!text) { setPhase('silent'); return; }
      setResponse(text);
      setPhase('answered');
    } catch {
      setNote('That could not be looked at just now.');
      setPhase('error');
    }
  }, [manuscriptId, offer]);

  return { phase, offer, lens, response, note, open, ask, close };
}
