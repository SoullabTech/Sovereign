'use client';

import { useState } from 'react';
import type {
  RebuildEditorialThread,
  RebuildEditorialVersion,
} from '@/lib/writersStudio/rebuild/editorialCollaboration';
import type { EditorialDepth } from '@/lib/writersStudio/editorialDepth';
import type { CurrentPostureRead } from '@/lib/sanctuary/currentClientPosture';
import { craftPrimerPrompt } from '@/lib/writersStudio/craftCanvas';

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
  return clean.length <= 520 ? clean : clean.slice(0, 517).trimEnd() + '…';
}

export default function HermesCraftPanel(props: HermesCraftPanelProps) {
  const [draft, setDraft] = useState('');

  const ordinary = props.sessionPosture.resolved && !props.sessionPosture.sanctuary;
  const memberVersion = props.version?.author === 'member' ? props.version : null;
  const maiaVersion = props.version?.author === 'maia' ? props.version : null;
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
      'Here is what I want to work through with you:',
      text,
      '',
      'Respond as my Craftsman guide. Keep the carried conversation in view.',
      'If wording would help, show it as a bounded possibility in the manuscript rather than replacing my voice.',
      'Nothing is applied automatically.',
    ].join('\n'));
    setDraft('');
  };

  return (
    <section className="p4r1-hermes-craft" data-hermes-craft>
      <header className="p4r1-hermes-craft-head">
        <div>
          <span className="p4r1-eyebrow">Hermes · with MAIA</span>
          <h3>{props.title}</h3>
          <p>What you discovered comes with you. We work directly in the writing from here.</p>
        </div>
        <button type="button" onClick={props.onReturn}>Back to conversation</button>
      </header>

      {!props.sessionPosture.resolved ? (
        <div className="p4r1-hermes-threshold">
          <p><b>One choice before we begin.</b> How should this Craft session be held?</p>
          <div>
            <button type="button" onClick={() => props.onChooseSessionPosture(false)}>Ordinary</button>
            <button type="button" onClick={() => props.onChooseSessionPosture(true)}>Sanctuary</button>
          </div>
          <small>Hermes will not guess your privacy posture. Your Craft gesture is held while you choose.</small>
        </div>
      ) : props.sessionPosture.sanctuary ? (
        <div className="p4r1-hermes-threshold">
          <p><b>Sanctuary is on.</b> Persistent Craft revisions are not opened in Sanctuary.</p>
          <button type="button" onClick={() => props.onChooseSessionPosture(false)}>Switch to Ordinary for this Craft session</button>
        </div>
      ) : null}

      {ordinary ? (
        <>
          <div className="p4r1-hermes-now">
            <span className="p4r1-eyebrow">Here with you</span>
            {props.busy ? (
              <p>Working this into the copy…</p>
            ) : props.lastMaiaTurn?.body ? (
              <p>{compact(props.lastMaiaTurn.body)}</p>
            ) : maiaVersion ? (
              <p>I’ve marked one possible move in the manuscript. Treat it as a primer, not an answer.</p>
            ) : (
              <p>I’m with the passage. We can talk, try wording, learn from it, or go deeper without leaving this canvas.</p>
            )}
            {props.message ? <small role="status">{props.message}</small> : null}
          </div>

          <div className="p4r1-hermes-moves" aria-label="Ways to work with Hermes">
            {!maiaVersion && !memberVersion ? (
              <button
                type="button"
                disabled={props.busy}
                onClick={() => send(craftPrimerPrompt(), undefined, { proposalPolicy: 'allow', proposalRequested: true })}
              >
                Show me a way
              </button>
            ) : null}
            <button
              type="button"
              disabled={props.busy}
              onClick={() => send([
                'Show me one genuinely different way this exact passage could carry the intention from our conversation.',
                'Keep it bounded and close to my voice. Explain the move briefly.',
              ].join('\n'), undefined, { proposalPolicy: 'allow', proposalRequested: true })}
            >
              Another way
            </button>
            <button
              type="button"
              disabled={props.busy}
              onClick={() => send([
                'Make the current craft move lighter.',
                'Restore more of my original wording and rhythm while keeping only the useful gain.',
              ].join('\n'), undefined, { proposalPolicy: 'allow', proposalRequested: true })}
            >
              Lighter
            </button>
            <button
              type="button"
              disabled={props.busy}
              onClick={() => send([
                'Help this passage carry more bodily and relational experience without becoming overwritten.',
                'Show one bounded possibility in my voice and explain what makes it more embodied.',
              ].join('\n'), undefined, { proposalPolicy: 'allow', proposalRequested: true })}
            >
              More embodied
            </button>
            <button
              type="button"
              disabled={props.busy}
              onClick={() => send([
                'Teach me the craft move at work in this exact passage using my own words as the example.',
                'Keep it plain first. Do not propose replacement wording unless it genuinely helps the explanation.',
              ].join('\n'), 'learning', { proposalPolicy: 'reply_only' })}
            >
              Teach me
            </button>
            <button
              type="button"
              disabled={props.busy}
              onClick={() => send([
                'Go deeper on this exact passage.',
                'Separate meaning from style, evidence from interpretation, and reader-effect hypotheses from facts.',
                'Stay in relationship with what I am trying to accomplish.',
              ].join('\n'), 'direct', { proposalPolicy: 'reply_only' })}
            >
              Go deeper
            </button>
            {props.version ? (
              <button type="button" disabled={props.busy} onClick={props.onKeep}>Keep mine</button>
            ) : null}
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
              placeholder="Tell Hermes what you want the writing to do…"
              aria-label="Work with Hermes"
              rows={4}
            />
            <button type="button" disabled={props.busy || !draft.trim()} onClick={sendDraft}>
              Work it through
            </button>
          </div>

          {memberVersion ? (
            <div className="p4r1-hermes-version">
              <span>{applied ? 'This version is in the manuscript.' : 'Your version is ready when you are.'}</span>
              {applied && props.onUndo ? (
                <button type="button" disabled={props.busy} onClick={props.onUndo}>Undo</button>
              ) : (
                <button type="button" disabled={props.busy} onClick={props.onApply}>Apply my version</button>
              )}
            </div>
          ) : (
            <p className="p4r1-hermes-hint">
              Use the marks in the manuscript to keep, reject, question, or reshape individual changes.
            </p>
          )}
        </>
      ) : null}
    </section>
  );
}
