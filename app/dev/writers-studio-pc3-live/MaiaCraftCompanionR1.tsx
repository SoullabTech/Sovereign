'use client';

import { useEffect, useRef, useState } from 'react';
import type {
  RebuildEditorialThread,
  RebuildEditorialVersion,
} from '@/lib/writersStudio/rebuild/editorialCollaboration';
import { editorialServiceFailureMessage } from '@/lib/writersStudio/editorialServiceFailure';
import type { EditorialDepth } from '@/lib/writersStudio/editorialDepth';
import type { CurrentPostureRead } from '@/lib/sanctuary/currentClientPosture';
import type { CraftDialogueTurn, CraftSendOptions } from '@/lib/writersStudio/craftDialogueR1';
import { craftTargetKey, type CraftFocusTarget } from '@/lib/writersStudio/craftFocusR1';
import {
  EDITORIAL_LATITUDES,
  LATITUDE_BANDS,
  type EditorialLatitude,
} from '@/lib/manuscript/editorialScope/contract';

export type MaiaCraftCompanionR1Props = {
  title: string;
  thread: RebuildEditorialThread | null;
  version: RebuildEditorialVersion | null;
  lastMaiaTurn: RebuildEditorialThread['turns'][number] | null;
  busy: boolean;
  message: string | null;
  activity: string | null;
  readingNotice?: string | null;
  currentFocus?: CraftFocusTarget | null;
  focusSuggestions?: readonly CraftFocusTarget[];
  onMoveFocus?: (target: CraftFocusTarget) => boolean;
  onMoveFocusAndSuggest?: (target: CraftFocusTarget) => boolean;
  dialogue: readonly CraftDialogueTurn[];
  editLatitude: EditorialLatitude;
  onEditLatitude: (value: EditorialLatitude) => void;
  mayRemoveParagraphs: boolean;
  onMayRemoveParagraphs: (value: boolean) => void;
  mayProposeImmediately: boolean;
  onMayProposeImmediately: (value: boolean) => void;
  sessionPosture: CurrentPostureRead;
  onChooseSessionPosture: (sanctuary: boolean) => void;
  onSend: (text?: string, options?: CraftSendOptions) => void;
  /** Presentation-only access to author-owned unsent wording in this mounted focus. */
  onConnect?: (port: MaiaCraftComposerPort | null) => void;
  onDepth: (depth: EditorialDepth) => void;
  onReturn: () => void;
};

export type MaiaCraftComposerSnapshot = {
  focusKey: string;
  text: string;
  requestUnconfirmed: boolean;
};
export type MaiaCraftComposerPort = {
  snapshot: () => MaiaCraftComposerSnapshot | null;
};

/** Local author-authored presentation only: not a durable author turn or delivery receipt. */
type LocalAuthorAttempt = {
  readonly key: string;
  readonly focusKey: string;
  readonly body: string;
  readonly afterIndex: number;
};

export default function MaiaCraftCompanionR1(props: MaiaCraftCompanionR1Props) {
  const [draft, setDraft] = useState('');
  const [lastRequested, setLastRequested] = useState<string | null>(null);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);
  const [localAuthorAttempts, setLocalAuthorAttempts] = useState<readonly LocalAuthorAttempt[]>([]);
  const attemptCounter = useRef(0);
  const sameTickSubmission = useRef(false);
  const focusKey = props.currentFocus ? craftTargetKey(props.currentFocus) : null;
  // Unsent wording remains in this mounted relationship only. Never hydrate a
  // composer from URL-indexed storage: neither URL m nor a thread identifier
  // establishes the current authenticated owner or grant.
  // A new server thread is NOT proof that an author-composed message was
  // delivered. Only a genuine focus/scope departure retires this local draft,
  // and every controlled departure must consult the parent navigation guard.
  useEffect(() => {
    setDraft('');
    setLastRequested(null);
    setDraftNotice(null);
    setLocalAuthorAttempts([]);
  }, [focusKey]);
  useEffect(() => {
    props.onConnect?.(focusKey ? {
      snapshot: () => ({ focusKey, text: draft, requestUnconfirmed: lastRequested !== null }),
    } : null);
    return () => props.onConnect?.(null);
  });
  const [toolsOpen, setToolsOpen] = useState(false);
  const transcriptRef = useRef<HTMLDivElement | null>(null);

  const ordinary = props.sessionPosture.resolved && !props.sessionPosture.sanctuary;

  // A Sanctuary/unresolved transition retires local attempted words rather
  // than resurrecting them on returning to Ordinary. No browser storage.
  useEffect(() => {
    if (!ordinary) setLocalAuthorAttempts([]);
  }, [ordinary]);

  // Only the actual author-composed, current-focus literal can become a You
  // bubble here. Server "author" bodies may contain private prompt scaffolding
  // and are NOT automatically presentation-safe or confirmation of delivery.
  const dialogue: CraftDialogueTurn[] = [...props.dialogue];
  const currentAttempts = ordinary && focusKey
    ? localAuthorAttempts.filter(turn => turn.focusKey === focusKey) : [];
  for (let i = currentAttempts.length - 1; i >= 0; i--) {
    const attempt = currentAttempts[i]!;
    dialogue.splice(Math.min(attempt.afterIndex, props.dialogue.length), 0, {
      key: attempt.key, speaker: 'writer', body: attempt.body,
    });
  }

  useEffect(() => {
    const node = transcriptRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [props.dialogue.length, props.activity, props.busy]);

  const send = (
    text: string,
    depth?: EditorialDepth,
    options?: CraftSendOptions,
    displayText?: string,
  ) => {
    if (!ordinary || props.busy) return;
    if (depth) props.onDepth(depth);
    props.onSend(text, displayText ? { ...options, displayText } : options);
  };

  const sendDraft = () => {
    // Test emptiness with trim; preserve the exact authored Unicode/spacing.
    const request = draft;
    if (!request.trim() || !ordinary || props.busy || !focusKey || sameTickSubmission.current) return;
    sameTickSubmission.current = true;
    // This is visibly "attempted · not confirmed", NOT a persisted transcript.
    // It stays scoped to the mounted exact focus and never includes the
    // internally constructed prompt below.
    const key = 'local-intent:' + focusKey + ':' + (++attemptCounter.current);
    setLocalAuthorAttempts(current => [...current, {
      key, focusKey, body: request, afterIndex: props.dialogue.length,
    }].slice(-8));
    try {
      send([
      'Keep our conversation in view. Follow the writer’s requested reading scope; keep any wording proposal inside the active editing passage. Wider reading does not itself move focus or authorize Apply.',
      '',
      'What I want the writing to do:',
      request,
      '',
      'Respond to my intention first. If wording would help, offer a bounded craft move directly against this passage.',
      'Preserve my voice, meaning, cadence, imagery, worldview, and intentional ambiguity unless I explicitly ask to change one of them.',
      'Nothing is applied automatically.',
    ].join('\n'), undefined, { displayText: request });
      // The onSend interface returns void. Calling it is not confirmation that
      // the service accepted or delivered the message. Never erase author text
      // on an uncertain acknowledgment or a later failure.
      setLastRequested(request);
      setDraftNotice('Request attempted, but delivery is not confirmed. Your wording remains here. Sending it again may duplicate a request.');
    } catch {
      setDraftNotice('The request could not be confirmed. Your wording remains here; nothing was applied.');
    } finally {
      // Prevent rapid twin clicks in one event loop without implying a server
      // idempotency guarantee or initiating any automatic retry.
      queueMicrotask(() => { sameTickSubmission.current = false; });
    }
  };

  return (
    <section className="p4r1-maia-craft-r1" data-maia-craft-companion-r1>
      <header>
        <div>
          <span className="p4r1-eyebrow">MAIA</span>
          <h3>{props.title}</h3>
          {props.currentFocus ? <p data-maia-current-focus><b>Working on: {props.currentFocus.label}</b></p> : null}
          <p>We are still in the same conversation. The manuscript beside us is where we make it real.</p>
        </div>
        <button type="button" onClick={props.onReturn}>Back</button>
      </header>

      {!props.sessionPosture.resolved ? (
        <div className="p4r1-maia-craft-r1-threshold">
          <p><b>How should this Craft session be held?</b></p>
          <div>
            <button type="button" onClick={() => props.onChooseSessionPosture(false)}>Ordinary</button>
            <button type="button" onClick={() => props.onChooseSessionPosture(true)}>Sanctuary</button>
          </div>
          <small>Your Craft gesture is held while you choose. MAIA will not guess your privacy posture.</small>
        </div>
      ) : props.sessionPosture.sanctuary ? (
        <div className="p4r1-maia-craft-r1-threshold">
          <p><b>Sanctuary is on.</b> Persistent editorial versions stay off.</p>
          <button type="button" onClick={() => props.onChooseSessionPosture(false)}>Switch to Ordinary for this Craft session</button>
        </div>
      ) : null}

      {ordinary ? (
        <>
          <div className="p4r1-maia-craft-r1-response" ref={transcriptRef}>
            {dialogue.length > 0 ? (
              <div className="p4r1-maia-craft-r1-transcript" aria-label="Craft conversation">
                {dialogue.map((turn) => (
                  <div
                    key={turn.key}
                    className="p4r1-maia-craft-r1-turn"
                    data-speaker={turn.speaker}
                  >
                    <span>
                      {turn.speaker === 'writer' ? 'You' : turn.speaker === 'action' ? 'Canvas' : 'MAIA'}
                      {turn.key.startsWith('local-intent:') ? ' · Not confirmed' : null}
                    </span>
                    <p>{turn.body}</p>
                  </div>
                ))}
              </div>
            ) : props.lastMaiaTurn?.body ? (
              <div className="p4r1-maia-craft-r1-transcript">
                <div className="p4r1-maia-craft-r1-turn" data-speaker="maia">
                  <span>MAIA</span>
                  <p>{props.lastMaiaTurn.body}</p>
                </div>
              </div>
            ) : props.version?.author === 'maia' ? (
              <p>I have placed one provisional craft move on the table. Treat it as something to work with, not an answer.</p>
            ) : (
              <p>
                Tell me what you want this passage to do. I can help you see it, try wording,
                compare possibilities, or refine the version you are actually shaping on the page.
              </p>
            )}

            {props.activity ? (
              <div className="p4r1-maia-craft-r1-activity" role="status">{props.activity}</div>
            ) : props.busy ? (
              <div className="p4r1-maia-craft-r1-activity" role="status">Working with the passage…</div>
            ) : null}

            {props.focusSuggestions?.length && props.onMoveFocus ? (
              <div className="p4r1-craft-focus-references" aria-label="Passages referenced by MAIA">
                <small>From MAIA’s reading · choose a place to work</small>
                {props.focusSuggestions.map(target => <div key={craftTargetKey(target)}>
                  <b>{target.label}</b>
                  <p>“{target.quote}”</p>
                  <button type="button" disabled={props.busy} onClick={() => props.onMoveFocus?.(target)}>Work here →</button>
                  {props.onMoveFocusAndSuggest ? <button type="button" disabled={props.busy} onClick={() => props.onMoveFocusAndSuggest?.(target)}>Work here &amp; suggest an edit</button> : null}
                </div>)}
              </div>
            ) : null}
            {props.readingNotice ? <small role="status" data-craft-reading-coverage>{props.readingNotice}</small> : null}
            {props.message ? (
              <div className="p4r1-maia-craft-r1-failure" role="alert">
                {editorialServiceFailureMessage(props.message) ?? props.message}
              </div>
            ) : null}
          </div>

          <div className="p4r1-maia-craft-r1-compose">
            <textarea
              value={draft}
              disabled={props.busy}
              rows={5}
              placeholder="What do you want the writing to do?"
              aria-label="Talk with MAIA about the writing"
              onChange={(event) => {
                setDraft(event.target.value);
                setLastRequested(null);
                setDraftNotice(null);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  sendDraft();
                }
              }}
            />
            <div>
              <button
                type="button"
                className="p4r1-maia-craft-r1-tools"
                aria-expanded={toolsOpen}
                onClick={() => setToolsOpen((open) => !open)}
              >
                {toolsOpen ? 'Close ways to work' : 'Ways to work'}
              </button>
              <button type="button" disabled={props.busy || !draft.trim()} onClick={sendDraft}>
                {lastRequested === draft ? 'Send again (may duplicate)' : 'Work it through'}
              </button>
              {draft ? <button type="button" disabled={props.busy} onClick={() => {
                setDraft('');
                setLastRequested(null);
                setDraftNotice(null);
                // This exact author gesture retires the unsaved You attempt
                // from this local session, not only the editable textarea.
                setLocalAuthorAttempts([]);
              }}>Clear draft</button> : null}
            </div>
            {draftNotice ? <small role="status" data-maia-unsent-send-receipt>{draftNotice}</small> : null}

            {toolsOpen ? (
              <div className="p4r1-maia-craft-r1-menu" aria-label="Ways to work with MAIA">
                <button
                  type="button"
                  disabled={props.busy}
                  onClick={() => send(
                    'Talk with me about what is happening in this exact passage before changing it. Reflect what you notice and ask me one useful question.',
                    undefined,
                    { proposalPolicy: 'reply_only' },
                    'Discuss this with me.',
                  )}
                >
                  Discuss
                </button>
                <button
                  type="button"
                  disabled={props.busy}
                  onClick={() => send(
                    'Show me one bounded wording possibility for this exact passage. Keep it close to my voice and explain the move briefly.',
                    undefined,
                    { proposalPolicy: 'allow', proposalRequested: true },
                    'Try wording here.',
                  )}
                >
                  Try wording
                </button>
                <button
                  type="button"
                  disabled={props.busy}
                  onClick={() => send(
                    'Show me two or three clearly different examples of how the craft move we are discussing could work here. Treat them as primers, not recommendations.',
                    'learning',
                    { proposalPolicy: 'reply_only' },
                    'Show me examples.',
                  )}
                >
                  Examples
                </button>
                <button
                  type="button"
                  disabled={props.busy}
                  onClick={() => send(
                    'Give me several genuinely different craft directions for this passage. Describe the intention of each before any wording and do not rank them.',
                    undefined,
                    { proposalPolicy: 'reply_only' },
                    'Give me some different ideas.',
                  )}
                >
                  Ideas
                </button>
                <button
                  type="button"
                  disabled={props.busy}
                  onClick={() => send(
                    'Make the current proposed move lighter. Restore more of my original wording and cadence while keeping only the useful gain.',
                    undefined,
                    { proposalPolicy: 'allow', proposalRequested: true },
                    'Make this lighter.',
                  )}
                >
                  Lighter
                </button>
                <button
                  type="button"
                  disabled={props.busy}
                  onClick={() => send(
                    'Keep more of my original wording, rhythm, and imagery while preserving the useful part of the current move.',
                    undefined,
                    { proposalPolicy: 'allow', proposalRequested: true },
                    'Keep more of my wording.',
                  )}
                >
                  Keep more of mine
                </button>
                <button
                  type="button"
                  disabled={props.busy}
                  onClick={() => send(
                    'Show me one genuinely different option for this same local problem. Do not broaden the locus.',
                    undefined,
                    { proposalPolicy: 'allow', proposalRequested: true },
                    'Show me another option.',
                  )}
                >
                  Another option
                </button>
                <button
                  type="button"
                  disabled={props.busy}
                  onClick={() => send(
                    'Explain the current proposed move without changing the wording. Tell me what it changes, why, what it may do for a reader, and what it protects. Make the strongest case for my original too.',
                    undefined,
                    { proposalPolicy: 'reply_only' },
                    'Why this?',
                  )}
                >
                  Why this?
                </button>
                <button
                  type="button"
                  disabled={props.busy}
                  onClick={() => send(
                    'Teach me the craft already at work in this passage using my own words as the example. Plain language first; professional terminology second.',
                    'learning',
                    { proposalPolicy: 'reply_only' },
                    'Teach me what is happening here.',
                  )}
                >
                  Teach me
                </button>
                <button
                  type="button"
                  disabled={props.busy}
                  onClick={() => send(
                    'Go deeper on this exact passage. Separate meaning from style, evidence from interpretation, reader-effect hypotheses from facts, and show the tradeoffs.',
                    'direct',
                    { proposalPolicy: 'reply_only' },
                    'Go deeper.',
                  )}
                >
                  Go deeper
                </button>
                <details className="p4r1-maia-craft-r1-strength">
                  <summary>
                    Edit strength · {LATITUDE_BANDS[props.editLatitude].label}
                  </summary>
                  <div>
                    <label>
                      <span>How much may one suggestion change?</span>
                      <input
                        type="range"
                        min={EDITORIAL_LATITUDES[0]}
                        max={EDITORIAL_LATITUDES[EDITORIAL_LATITUDES.length - 1]}
                        step={1}
                        value={props.editLatitude}
                        aria-valuetext={LATITUDE_BANDS[props.editLatitude].label}
                        onChange={(event) => props.onEditLatitude(Number(event.target.value) as EditorialLatitude)}
                      />
                    </label>
                    <p>
                      <b>{LATITUDE_BANDS[props.editLatitude].label}</b> · {LATITUDE_BANDS[props.editLatitude].description}
                    </p>
                    <label className="p4r1-maia-craft-r1-paragraphs">
                      <input
                        type="checkbox"
                        checked={props.mayRemoveParagraphs}
                        onChange={(event) => props.onMayRemoveParagraphs(event.target.checked)}
                      />
                      MAIA may suggest removing a whole paragraph
                    </label>
                    <small>
                      {props.mayRemoveParagraphs
                        ? 'Whole-paragraph removal is allowed in proposals for this visit. You still decide.'
                        : 'Even at Open, MAIA may discuss removing a paragraph but cannot arrive with it already gone.'}
                    </small>
                    <label className="p4r1-maia-craft-r1-paragraphs">
                      <input
                        type="checkbox"
                        checked={props.mayProposeImmediately}
                        onChange={(event) => props.onMayProposeImmediately(event.target.checked)}
                      />
                      MAIA may offer wording without waiting for me to ask
                    </label>
                    <small>
                      {props.mayProposeImmediately
                        ? 'MAIA may bring a bounded wording suggestion when it would help. It remains craft material, never an automatic edit.'
                        : 'MAIA discusses first. She offers wording when you explicitly ask for it.'}
                    </small>
                  </div>
                </details>
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </section>
  );
}
