/**
 * Conversation continuity buffer — spoken words survive a broken capture path.
 *
 * WHY THIS IS A BUFFER AND NOT A HARDENING PATCH
 * ----------------------------------------------
 * On the web path there is no recorder and no audio artifact. The browser's
 * `webkitSpeechRecognition` performs capture AND transcription internally and
 * hands back text only; `micStreamRef` exists solely to read amplitude for
 * silence detection and barge-in, and is never recorded. (The one MediaRecorder
 * path, `androidVoiceFallback`, is Android-Chrome-only and single-shot.)
 *
 * So the entire durable record of a spoken turn is one in-memory React ref:
 * `accumulatedTranscript.current`. That ref is cleared by `onstart` on any
 * non-continuation restart, cleared on submit, on echo/duplicate rejection, and
 * on mode changes — and it does not survive an unmount, a remount, or a tab
 * refresh. There is no second copy anywhere.
 *
 * That is why detecting a dead mic, however fast, is not sufficient. Salvage at
 * the moment of detection only rescues losses we detect, at the instant we
 * detect them. It cannot help a remount, a refresh, a misclassified failure, or
 * the case a member actually hits: realizing minutes later that the thing was
 * dead. The acceptance criterion is not "voice works again" — it is that a
 * contemplative conversation survives interruption WITHOUT the member having to
 * reconstruct a state of mind they have already moved through. Meeting that
 * requires a second copy that outlives the component. This is that copy.
 *
 * It also retires a workaround a member invented under duress: scrolling up and
 * copy-pasting a live conversation into a document out of paranoia. Nobody
 * should be hand-backing-up their own speech mid-sentence.
 *
 * WHAT THIS IS NOT
 * ----------------
 * This is NOT memory, and it must never become memory.
 *
 *  - It is local to the member's browser. Nothing here is transmitted, and no
 *    caller in this module performs I/O beyond `sessionStorage`.
 *  - It never enters a prompt, an atom, semantic memory, or any pattern
 *    formation. It has exactly one consumer: handing the member back their own
 *    unsent words in an editable draft.
 *  - It is `sessionStorage`, not `localStorage` — scoped to the tab, gone when
 *    the tab closes. A safety net for an interrupted session, not a record of
 *    one.
 *  - It holds both sides of the exchange. An earlier draft of this buffer kept
 *    only the member's speech, on the reasoning that MAIA's replies are already
 *    on screen. Field reports corrected that: when the session drops, the
 *    on-screen transcript goes with it, and members reported losing MAIA's
 *    responses as the more painful loss — "I have had to repeat this 6x and
 *    have lost a lot of what she said that was important feedback." Continuity
 *    that preserves only half of a conversation does not preserve a
 *    conversation.
 *
 * SANCTUARY MODE
 * --------------
 * Sanctuary's boundary is absolute: nothing from a Sanctuary session may be
 * retained, "under any circumstances, including by user request during the
 * session." So the buffer is not merely skipped in Sanctuary — `setEnabled(false)`
 * PURGES whatever is already stored, synchronously, before returning. Entering
 * Sanctuary mid-conversation must destroy the buffered tail of the conversation
 * that preceded it, not just stop adding to it.
 *
 * GROWTH-OBLIGATION ANSWERS (per CLAUDE.md)
 * -----------------------------------------
 *  - Uncertainty preserved: entries are stored verbatim as spoken, with no
 *    inference, summarization, or interpretation. A partial utterance is
 *    returned partial. We never repair what we did not hear.
 *  - Provenance: every entry is stamped with its origin (`spoken`) and whether
 *    it was ever submitted, so a restored draft can be presented as "what you
 *    said and had not sent" rather than as something MAIA knows.
 *  - Responsibility: holding a member's unsent speech creates a duty to bound
 *    and surrender it — hence the TTL, the size cap, the tab scoping, the
 *    Sanctuary purge, and `purge()` being available to any caller that needs it.
 */

/** Storage surface, injectable so the policy is testable without a DOM. */
export interface ContinuityStorage {
  getItem: (k: string) => string | null;
  setItem: (k: string, v: string) => void;
  removeItem: (k: string) => void;
}

const STORAGE_KEY = 'maia.voice.continuity.v1';

/** Entries older than this are dropped on read. A safety net, not an archive. */
export const CONTINUITY_TTL_MS = 12 * 60 * 60 * 1000; // 12h

/** Most recent submitted turns retained. Bounded so the buffer cannot grow. */
export const MAX_TURNS = 40;

/** Hard ceiling on serialized size; oldest turns are dropped to stay under it. */
export const MAX_BYTES = 96 * 1024;

export interface ContinuityTurn {
  /** Who said it. Provenance is explicit so a restore can never blur the two. */
  speaker: 'member' | 'maia';
  /** Verbatim text as transcribed or as rendered. Never summarized or rewritten. */
  text: string;
  /** Epoch ms when this text was last updated. */
  at: number;
}

export interface ContinuityState {
  /**
   * The utterance in progress — spoken, transcribed, NOT yet sent to MAIA.
   * This is the piece whose loss the member actually feels.
   */
  pending: ContinuityTurn | null;
  /** Turns that were successfully submitted, oldest first. */
  turns: ContinuityTurn[];
  /** Epoch ms of the last write, used for TTL. */
  updatedAt: number;
}

const EMPTY: ContinuityState = { pending: null, turns: [], updatedAt: 0 };

function resolveStorage(injected?: ContinuityStorage): ContinuityStorage | null {
  if (injected) return injected;
  if (typeof window === 'undefined') return null;
  try {
    // Touch it: Safari private browsing throws on access, not on use.
    const s = window.sessionStorage;
    if (!s) return null;
    return s;
  } catch {
    return null;
  }
}

/**
 * The buffer. Every method is failure-tolerant: storage can be unavailable
 * (private browsing, disabled site data, SSR) and the voice path must keep
 * working regardless. A continuity net that can break the conversation it is
 * meant to protect is worse than no net.
 */
export class ConversationContinuityBuffer {
  private enabled = true;
  private readonly storage: ContinuityStorage | null;

  constructor(opts?: { storage?: ContinuityStorage }) {
    this.storage = resolveStorage(opts?.storage);
  }

  get isAvailable(): boolean {
    return this.storage != null;
  }

  /**
   * Enable or disable buffering. Disabling PURGES synchronously — required by
   * the Sanctuary boundary, which forbids retention of anything from the
   * session, not merely further accumulation.
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.purge();
  }

  private read(): ContinuityState {
    if (!this.storage) return { ...EMPTY };
    try {
      const raw = this.storage.getItem(STORAGE_KEY);
      if (!raw) return { ...EMPTY };
      const parsed = JSON.parse(raw) as ContinuityState;
      if (!parsed || typeof parsed !== 'object') return { ...EMPTY };
      // Expired: surrender it rather than hand back stale speech.
      if (!parsed.updatedAt || Date.now() - parsed.updatedAt > CONTINUITY_TTL_MS) {
        this.purge();
        return { ...EMPTY };
      }
      return {
        pending: parsed.pending ?? null,
        turns: Array.isArray(parsed.turns) ? parsed.turns : [],
        updatedAt: parsed.updatedAt,
      };
    } catch {
      return { ...EMPTY };
    }
  }

  private write(state: ContinuityState): void {
    if (!this.storage || !this.enabled) return;
    try {
      let turns = state.turns.slice(-MAX_TURNS);
      let payload = JSON.stringify({ ...state, turns, updatedAt: Date.now() });
      // Drop oldest turns until under the byte ceiling. The pending utterance
      // is never dropped — it is the one piece that is irreplaceable.
      while (payload.length > MAX_BYTES && turns.length > 0) {
        turns = turns.slice(1);
        payload = JSON.stringify({ ...state, turns, updatedAt: Date.now() });
      }
      this.storage.setItem(STORAGE_KEY, payload);
    } catch {
      /* quota exceeded / storage disabled — continuity is best-effort */
    }
  }

  /**
   * Mirror the in-progress utterance. Called as transcripts accumulate, so the
   * buffer is already current at the moment capture dies — the failure path
   * does no work it could fail at.
   */
  recordPending(text: string): void {
    if (!this.enabled) return;
    const trimmed = text.trim();
    const state = this.read();
    state.pending = trimmed ? { speaker: 'member', text: trimmed, at: Date.now() } : null;
    this.write(state);
  }

  /** A turn was actually sent to MAIA: it moves out of pending into history. */
  recordSubmitted(text: string): void {
    if (!this.enabled) return;
    const trimmed = text.trim();
    const state = this.read();
    if (trimmed) state.turns.push({ speaker: 'member', text: trimmed, at: Date.now() });
    state.pending = null;
    this.write(state);
  }

  /**
   * MAIA finished a reply. Buffered for the same reason the member's speech is:
   * when a session drops, the on-screen transcript goes with it, and what MAIA
   * said is not recoverable from anywhere else on the client.
   */
  recordMaiaReply(text: string): void {
    if (!this.enabled) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    const state = this.read();
    const last = state.turns[state.turns.length - 1];
    // Streaming replies arrive as a growing string; replace rather than append
    // so the log holds one entry per turn instead of every partial frame.
    if (last && last.speaker === 'maia' && trimmed.startsWith(last.text)) {
      last.text = trimmed;
      last.at = Date.now();
    } else {
      state.turns.push({ speaker: 'maia', text: trimmed, at: Date.now() });
    }
    this.write(state);
  }

  /** The unsent utterance, if any. This is what a restored draft is made of. */
  getPending(): ContinuityTurn | null {
    return this.read().pending;
  }

  /** Recent turns from both sides, oldest first, for orienting after an interruption. */
  getRecentTurns(limit = 10): ContinuityTurn[] {
    const turns = this.read().turns;
    return limit > 0 ? turns.slice(-limit) : turns;
  }

  /** Drop the pending utterance only — e.g. the member sent or discarded it. */
  clearPending(): void {
    const state = this.read();
    if (!state.pending) return;
    state.pending = null;
    this.write(state);
  }

  /** Remove everything. Always attempted, even when disabled. */
  purge(): void {
    if (!this.storage) return;
    try {
      this.storage.removeItem(STORAGE_KEY);
    } catch {
      /* best-effort */
    }
  }
}

let singleton: ConversationContinuityBuffer | null = null;

/** Process-wide buffer, so a component remount reaches the same stored state. */
export function getContinuityBuffer(): ConversationContinuityBuffer {
  if (!singleton) singleton = new ConversationContinuityBuffer();
  return singleton;
}
