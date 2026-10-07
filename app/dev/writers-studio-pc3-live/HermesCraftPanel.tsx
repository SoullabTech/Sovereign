'use client';

import { useState } from 'react';
import type {
  RebuildEditorialThread,
  RebuildEditorialVersion,
} from '@/lib/writersStudio/rebuild/editorialCollaboration';
import type { EditorialDepth } from '@/lib/writersStudio/editorialDepth';
import type { CurrentPostureRead } from '@/lib/sanctuary/currentClientPosture';

type SendOptions = {
  proposalPolicy?: 'allow' | 'reply_only';
  proposalRequested?: boolean;
};

export interface HermesCraftPanelProps {
  title: string;
  thread: RebuildEditorialThread | null;
  version: RebuildEditorialVersion | null;
  lastMaiaTurn: RebuildEditorialThread['turns'][number] | null;
  appliedVersionId: string | null;
  busy: boolean;
  message: string | null;
  sessionPosture: CurrentPostureRead;
  onChooseSessionPosture: (sanctuary: boolean) => void;
  onSend: (text?: string, options?: SendOptions) => void;
  onDepth: (depth: EditorialDepth) => void;
  onKeep: () => void;
  onApply: () => void;
  onUndo?: () => void;
  onReturn: () => void;
}

function compact(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length <= 900 ? clean : clean.slice(0, 897).trimEnd() + '…';
}

export default function HermesCraftPanel(props: HermesCraftPanelProps) {
  const [draft, setDraft] = useState('');
  const [more, setMore] = useState(false);

  const ordinary = props.sessionPosture.resolved && !props.sessionPosture.sanctuary;
  const memberVersion = props.version?.author === 'member' ? props.version : null;
  const applied = Boolean(memberVersion && props.appliedVersionId === memberVersion.id);

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
    const text = draft.trim();
    if (!text) return;
    send([
      'Stay with the exact passage already active in the Craft canvas.',
      'Keep the conversation that brought us here in view.',
      '',
      'What I want to work through with you:',
      text,
      '',
      'Respond as my Craftsman guide. If wording would help, make it a bounded possibility in the manuscript.',
      'Nothing is applied automatically.',
    ].join('\n'));
    setDraft('');
  };

  return (
    <section className="p4r1-hermes-craft" data-hermes-craft>
      <header className="p4r1-hermes-craft-head">
        <div>
          <span className="p4r1-eyebrow">MAIA · Hermes</span>
          <h3>{props.title}</h3>
          <p>The manuscript is the workbench. I stay with you here while we shape it.</p>
        </div>
        <button type="button" onClick={props.onReturn}>Back</button>
      </header>

      {!props.sessionPosture.resolved ? (
        <div className="p4r1-hermes-threshold">
          <p><b>How should this Craft session be held?</b></p>
          <div>
            <button type="button" onClick={() => props.onChooseSessionPosture(false)}>Ordinary</button>
            <button type="button" onClick={() => props.onChooseSessionPosture(true)}>Sanctuary</button>
          </div>
        </div>
      ) : props.sessionPosture.sanctuary ? (
        <div className="p4r1-hermes-threshold">
          <p><b>Sanctuary is on.</b> Persistent Craft revisions stay off.</p>
          <button type="button" onClick={() => props.onChooseSessionPosture(false)}>Switch to Ordinary</button>
        </div>
      ) : null}

      {ordinary ? (
        <>
          <div className="p4r1-hermes-now">
            <span className="p4r1-eyebrow">With you in the writing</span>
            <p>
              {props.busy
                ? 'Working with the passage…'
                : props.lastMaiaTurn?.body
                  ? compact(props.lastMaiaTurn.body)
                  : 'Tell me what you want this passage to do. We can move from insight to wording without leaving the canvas.'}
            </p>
            {props.message ? <small role="status">{props.message}</small> : null}
          </div>

          <div className="p4r1-hermes-compose">
            <textarea
              value={draft}
              disabled={props.busy}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  sendDraft();
                }
              }}
              placeholder="What do you want the writing to do?"
              aria-label="Work with MAIA and Hermes"
              rows={5}
            />
            <div className="p4r1-hermes-compose-actions">
              <button
                type="button"
                className="p4r1-hermes-more"
                aria-expanded={more}
                onClick={() => setMore((value) => !value)}
              >
                {more ? 'Fewer options' : 'Ways to work'}
              </button>
              <button type="button" disabled={props.busy || !draft.trim()} onClick={sendDraft}>
                Work it through
              </button>
            </div>
          </div>

          {more ? (
            <div className="p4r1-hermes-quiet-options" aria-label="Ways to work with Hermes">
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
                  'Show me one bounded wording possibility that carries the intention from our conversation. Keep it close to my voice and explain the move briefly.',
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
                  'Show me two or three illustrative examples of how this craft move could work in this exact passage. Treat them as primers, not recommendations.',
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
                  'Give me several genuinely different directions this exact passage could take. Describe the intention of each before showing wording. Do not rank them.',
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
                  'Make the current craft move lighter. Restore more of my original wording, cadence, and imagery while keeping only the useful gain.',
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
                  'Keep more of my original wording and rhythm while preserving the useful part of the current craft move.',
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
                  'Go a little further with the same intention, but do not turn this into a major rewrite.',
                  undefined,
                  { proposalPolicy: 'allow', proposalRequested: true },
                )}
              >
                Go further
              </button>
              <button
                type="button"
                disabled={props.busy}
                onClick={() => send(
                  'Show me one genuinely different option for this same passage. Keep the same intention but take another craft path.',
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
                  'Explain the current craft move without proposing new wording. Tell me what changed, why, what it may do for a reader, and what it protects.',
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
                  'Teach me the craft already at work in this exact passage using my own words as the example. Plain language first.',
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
            </div>
          ) : null}


          {memberVersion ? (
            <div className="p4r1-hermes-version">
              <span>{applied ? 'Your version is in the manuscript.' : 'Your version is ready when you are.'}</span>
              {applied && props.onUndo ? (
                <button type="button" disabled={props.busy} onClick={props.onUndo}>Undo</button>
              ) : (
                <button type="button" disabled={props.busy} onClick={props.onApply}>Apply my version</button>
              )}
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
