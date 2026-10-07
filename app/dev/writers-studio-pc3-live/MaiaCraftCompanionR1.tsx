'use client';

import { useState } from 'react';
import type {
  RebuildEditorialThread,
  RebuildEditorialVersion,
} from '@/lib/writersStudio/rebuild/editorialCollaboration';
import type { EditorialDepth } from '@/lib/writersStudio/editorialDepth';
import type { CurrentPostureRead } from '@/lib/sanctuary/currentClientPosture';
import {
  EDITORIAL_LATITUDES,
  LATITUDE_BANDS,
  type EditorialLatitude,
} from '@/lib/manuscript/editorialScope/contract';

type SendOptions = {
  proposalPolicy?: 'allow' | 'reply_only';
  proposalRequested?: boolean;
};

export type MaiaCraftCompanionR1Props = {
  title: string;
  thread: RebuildEditorialThread | null;
  version: RebuildEditorialVersion | null;
  lastMaiaTurn: RebuildEditorialThread['turns'][number] | null;
  busy: boolean;
  message: string | null;
  activity: string | null;
  editLatitude: EditorialLatitude;
  onEditLatitude: (value: EditorialLatitude) => void;
  mayRemoveParagraphs: boolean;
  onMayRemoveParagraphs: (value: boolean) => void;
  mayProposeImmediately: boolean;
  onMayProposeImmediately: (value: boolean) => void;
  sessionPosture: CurrentPostureRead;
  onChooseSessionPosture: (sanctuary: boolean) => void;
  onSend: (text?: string, options?: SendOptions) => void;
  onDepth: (depth: EditorialDepth) => void;
  onReturn: () => void;
};

export default function MaiaCraftCompanionR1(props: MaiaCraftCompanionR1Props) {
  const [draft, setDraft] = useState('');
  const [toolsOpen, setToolsOpen] = useState(false);

  const ordinary = props.sessionPosture.resolved && !props.sessionPosture.sanctuary;

  const send = (
    text: string,
    depth?: EditorialDepth,
    options?: SendOptions,
  ) => {
    if (!ordinary || props.busy) return;
    if (depth) props.onDepth(depth);
    props.onSend(text, options);
  };

  const sendDraft = () => {
    const request = draft.trim();
    if (!request) return;
    send([
      'Stay with the exact passage on the Craftsman\'s Table and keep the conversation that brought us here in view.',
      '',
      'What I want the writing to do:',
      request,
      '',
      'Respond to my intention first. If wording would help, offer a bounded craft move directly against this passage.',
      'Preserve my voice, meaning, cadence, imagery, worldview, and intentional ambiguity unless I explicitly ask to change one of them.',
      'Nothing is applied automatically.',
    ].join('\n'));
    setDraft('');
  };

  return (
    <section className="p4r1-maia-craft-r1" data-maia-craft-companion-r1>
      <header>
        <div>
          <span className="p4r1-eyebrow">MAIA</span>
          <h3>{props.title}</h3>
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
          <div className="p4r1-maia-craft-r1-response">
            {props.activity ? (
              <p>{props.activity}</p>
            ) : props.busy ? (
              <p>Working with the passage…</p>
            ) : props.lastMaiaTurn?.body ? (
              <p>{props.lastMaiaTurn.body}</p>
            ) : props.version?.author === 'maia' ? (
              <p>I have placed one provisional craft move on the table. Treat it as something to work with, not an answer.</p>
            ) : (
              <p>
                Tell me what you want this passage to do. I can help you see it, try wording,
                compare possibilities, or refine the version you are actually shaping on the page.
              </p>
            )}
            {props.message ? <small role="status">{props.message}</small> : null}
          </div>

          <div className="p4r1-maia-craft-r1-compose">
            <textarea
              value={draft}
              disabled={props.busy}
              rows={5}
              placeholder="What do you want the writing to do?"
              aria-label="Talk with MAIA about the writing"
              onChange={(event) => setDraft(event.target.value)}
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
                Work it through
              </button>
            </div>

            {toolsOpen ? (
              <div className="p4r1-maia-craft-r1-menu" aria-label="Ways to work with MAIA">
                <button
                  type="button"
                  disabled={props.busy}
                  onClick={() => send(
                    'Talk with me about what is happening in this exact passage before changing it. Reflect what you notice and ask me one useful question.',
                    undefined,
                    { proposalPolicy: 'reply_only' },
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
