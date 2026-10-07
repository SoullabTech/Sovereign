'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';
import type {
  RebuildEditorialThread,
  RebuildEditorialVersion,
} from '@/lib/writersStudio/rebuild/editorialCollaboration';
import { editorialSegments } from '@/lib/writersStudio/editorialDiff';
import {
  composeCraftWorkingCopy,
  craftWorkingEdits,
  decisionCount,
  initialCraftDecisions,
  type CraftDecision,
  type CraftWorkingEdit,
} from '@/lib/writersStudio/craftWorkingCopy';
import type { MemberRevisionDraft } from '@/app/writers-studio/insight/RevisionDesk';

export type CraftHeldPassage = {
  draftSectionId: string;
  start: number;
  end: number;
  text: string;
  revisionNumber: number;
};

type SendOptions = {
  proposalPolicy?: 'allow' | 'reply_only';
  proposalRequested?: boolean;
};

export type CraftsmansTableR1Props = {
  sections: readonly RebuildSection[];
  bodyOf: (sectionId: string) => string;
  held: CraftHeldPassage | null;
  thread: RebuildEditorialThread | null;
  version: RebuildEditorialVersion | null;
  busy: boolean;
  onSend: (text?: string, options?: SendOptions) => void;
  onSaveMember: (draft: MemberRevisionDraft) => Promise<boolean>;
  onApply: () => void;
  appliedVersionId: string | null;
  onUndo?: () => void;
  /** The exact writer-owned working state, before Save or Apply. */
  onWorkingTextChange?: (text: string) => void;
};

function editKind(edit: CraftWorkingEdit): 'Insert' | 'Delete' | 'Replace' {
  if (edit.from && edit.to) return 'Replace';
  if (edit.from) return 'Delete';
  return 'Insert';
}

function decisionFor(
  decisions: ReadonlyMap<number, CraftDecision>,
  id: number,
): CraftDecision {
  return decisions.get(id) ?? { mode: 'original' };
}

export default function CraftsmansTableR1(props: CraftsmansTableR1Props) {
  const [view, setView] = useState<'markup' | 'preview'>('markup');
  const [decisions, setDecisions] = useState<ReadonlyMap<number, CraftDecision>>(new Map());
  const [activeEditId, setActiveEditId] = useState<number | null>(null);
  const [customEditId, setCustomEditId] = useState<number | null>(null);
  const [customDraft, setCustomDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const locusRef = useRef<HTMLSpanElement | null>(null);

  const original = props.held?.text ?? '';
  const proposal = props.version?.wording ?? original;
  const segments = useMemo(
    () => editorialSegments(original, proposal),
    [original, proposal],
  );
  const edits = useMemo(
    () => craftWorkingEdits(original, proposal),
    [original, proposal],
  );

  useEffect(() => {
    setDecisions(initialCraftDecisions(edits, props.version?.author ?? null));
    setActiveEditId(null);
    setCustomEditId(null);
    setCustomDraft('');
    setLocalMessage(null);
  }, [
    props.held?.draftSectionId,
    props.held?.start,
    props.held?.end,
    props.version?.id,
    props.version?.author,
    original,
    proposal,
  ]);

  const workingText = useMemo(
    () => composeCraftWorkingCopy(original, edits, decisions),
    [original, edits, decisions],
  );
  const chosenCount = useMemo(
    () => decisionCount(edits, decisions),
    [edits, decisions],
  );

  useEffect(() => {
    props.onWorkingTextChange?.(workingText);
  }, [workingText, props.onWorkingTextChange]);

  useEffect(() => {
    if (!props.held || !locusRef.current) return;
    const frame = window.requestAnimationFrame(() => {
      locusRef.current?.scrollIntoView({ block: 'center', behavior: 'auto' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [props.held?.draftSectionId, props.held?.start, props.held?.end]);

  const activeEdit = activeEditId === null
    ? null
    : edits.find((edit) => edit.id === activeEditId) ?? null;

  const setDecision = (id: number, decision: CraftDecision) => {
    setDecisions((current) => {
      const next = new Map(current);
      next.set(id, decision);
      return next;
    });
    setLocalMessage(null);
  };

  const beginCustom = (edit: CraftWorkingEdit) => {
    const current = decisionFor(decisions, edit.id);
    setCustomEditId(edit.id);
    setCustomDraft(
      current.mode === 'custom'
        ? current.text
        : edit.to || edit.from,
    );
  };

  const commitCustom = (edit: CraftWorkingEdit) => {
    const text = customDraft;
    setDecision(edit.id, text.length > 0
      ? { mode: 'custom', text }
      : { mode: 'original' });
    setCustomEditId(null);
    setCustomDraft('');
  };

  const saveWorkingVersion = async () => {
    if (
      !props.thread
      || !props.held
      || !props.version
      || chosenCount === 0
      || saving
    ) return;
    setSaving(true);
    setLocalMessage(null);
    try {
      const ok = await props.onSaveMember({
        threadId: props.thread.threadId,
        sectionId: props.held.draftSectionId,
        supersedes: props.version.id,
        text: workingText,
        purpose: 'Writer-shaped Craft version',
      });
      setLocalMessage(ok
        ? 'Saved as your version. The manuscript is still unchanged.'
        : 'Your version could not be saved just now. Your wording and choices remain here.');
    } finally {
      setSaving(false);
    }
  };

  const askAbout = (
    edit: CraftWorkingEdit,
    kind: 'another' | 'why' | 'teach',
  ) => {
    const decision = decisionFor(decisions, edit.id);
    const localWorking = decision.mode === 'custom'
      ? ` My current wording here is "${decision.text.trim()}".`
      : decision.mode === 'proposal'
        ? ' I currently have this proposed move in my working version.'
        : ' I am currently keeping my original here.';

    const subject = !edit.from
      ? `the proposed insertion "${edit.to.trim()}"`
      : !edit.to
        ? `the proposed deletion "${edit.from.trim()}"`
        : `the proposed change from "${edit.from.trim()}" to "${edit.to.trim()}"`;

    if (kind === 'another') {
      props.onSend([
        `Show me one genuinely different way to handle ${subject}.${localWorking}`,
        'Stay inside this exact local edit. Preserve my intention, voice, cadence, imagery, worldview, and intentional ambiguity.',
        'Do not broaden the rewrite. Return one bounded alternative and explain its tradeoff briefly.',
        '',
        'My current working passage:',
        workingText,
      ].join('\n'), { proposalPolicy: 'allow', proposalRequested: true });
      return;
    }
    if (kind === 'why') {
      props.onSend([
        `Explain why you proposed ${subject}.${localWorking}`,
        'Use evidence from my exact words. Tell me what the change may gain and what it could cost.',
        'Make the strongest case for keeping my original too. Do not propose new wording in this answer.',
        '',
        'My current working passage:',
        workingText,
      ].join('\n'), { proposalPolicy: 'reply_only' });
      return;
    }
    props.onSend([
      `Teach me the craft involved in ${subject}.${localWorking}`,
      'Use my sentence as the example. Plain language first, then professional terminology if useful.',
      'Do not propose new wording unless I ask.',
      '',
      'My current working passage:',
      workingText,
    ].join('\n'), { proposalPolicy: 'reply_only' });
  };

  const insertionIndex = useMemo(() => {
    const first = new Map<number, number>();
    segments.forEach((segment, index) => {
      if (segment.kind === 'ins' && segment.editId !== null && !first.has(segment.editId)) {
        first.set(segment.editId, index);
      }
    });
    return first;
  }, [segments]);

  const applied = Boolean(
    props.version?.author === 'member'
    && props.appliedVersionId === props.version.id,
  );

  return (
    <section className="p4r1-craft-r1" data-craftsmans-table-r1>
      <header className="p4r1-craft-r1-bar">
        <div>
          <span className="p4r1-eyebrow">Develop · Craftsman's Table</span>
          <strong>The writing is the workbench.</strong>
          <small>Red leaves. Blue enters. Nothing changes until your version is applied.</small>
        </div>
        <div className="p4r1-craft-r1-view" role="group" aria-label="Craft view">
          <button type="button" aria-pressed={view === 'markup'} onClick={() => setView('markup')}>Markup</button>
          <button type="button" aria-pressed={view === 'preview'} onClick={() => setView('preview')}>Preview</button>
        </div>
      </header>

      <div className="p4r1-craft-r1-scroll">
        <article className="p4r1-craft-r1-page">
          {props.sections.map((section) => {
            const body = props.bodyOf(section.draftSectionId);
            const active = props.held?.draftSectionId === section.draftSectionId;
            const Heading = section.headingDepth === 1 ? 'h1' : section.headingDepth === 2 ? 'h2' : 'h3';

            if (!active || !props.held) {
              return (
                <section key={section.draftSectionId} className="p4r1-craft-r1-section">
                  {section.heading?.trim() ? <Heading>{section.heading.trim()}</Heading> : null}
                  <div className="p4r1-craft-r1-prose">{body}</div>
                </section>
              );
            }

            const points = Array.from(body);
            const before = points.slice(0, props.held.start).join('');
            const exact = points.slice(props.held.start, props.held.end).join('');
            const after = points.slice(props.held.end).join('');
            const authoritative = exact === props.held.text;

            return (
              <section
                key={section.draftSectionId}
                className="p4r1-craft-r1-section"
                data-craft-active-section
              >
                {section.heading?.trim() ? <Heading>{section.heading.trim()}</Heading> : null}
                <div className="p4r1-craft-r1-prose">
                  {before}
                  <span
                    ref={locusRef}
                    className="p4r1-craft-r1-locus"
                    data-craft-authoritative={authoritative ? 'true' : 'false'}
                  >
                    {view === 'preview' ? (
                      <span className="p4r1-craft-r1-preview">{workingText || exact}</span>
                    ) : segments.length > 0 && props.version ? (
                      segments.map((segment, index) => {
                        if (segment.kind === 'same') return <span key={index}>{segment.text}</span>;
                        if (segment.editId === null) return <span key={index}>{segment.text}</span>;

                        const decision = decisionFor(decisions, segment.editId);
                        const chosen = decision.mode !== 'original';
                        const common = {
                          'data-edit-id': segment.editId,
                          'data-selected': chosen ? 'true' : undefined,
                          'data-decision': decision.mode,
                          onClick: () => setActiveEditId(segment.editId),
                          title: `Change ${segment.editId} · click to work with this mark`,
                        };

                        if (segment.kind === 'del') {
                          const edit = edits.find((candidate) => candidate.id === segment.editId);
                          const customWithoutInsertion = decision.mode === 'custom'
                            && edit
                            && !edit.to
                            && decision.text;
                          return (
                            <span key={index}>
                              <del {...common}>{segment.text}</del>
                              {customWithoutInsertion ? (
                                <ins {...common} className="p4r1-craft-r1-custom">{decision.text}</ins>
                              ) : null}
                            </span>
                          );
                        }

                        const displayed = decision.mode === 'custom'
                          ? insertionIndex.get(segment.editId) === index
                            ? decision.text
                            : ''
                          : segment.text;
                        return displayed ? <ins key={index} {...common}>{displayed}</ins> : null;
                      })
                    ) : (
                      <span className="p4r1-craft-r1-held">{exact}</span>
                    )}
                  </span>
                  {after}
                </div>

                {!authoritative ? (
                  <p className="p4r1-craft-r1-warning" role="status">
                    This passage changed after Craft opened. Re-anchor before making wording decisions.
                  </p>
                ) : null}

                {view === 'markup' && activeEdit ? (
                  <div className="p4r1-craft-r1-local" data-craft-local-edit={activeEdit.id}>
                    <div>
                      <span>Change {activeEdit.id} · {editKind(activeEdit)}</span>
                      <p>
                        {activeEdit.from ? <del>{activeEdit.from.trim()}</del> : null}
                        {activeEdit.from && activeEdit.to ? <span aria-hidden="true"> → </span> : null}
                        {activeEdit.to ? <ins>{activeEdit.to.trim()}</ins> : null}
                      </p>
                    </div>

                    {customEditId === activeEdit.id ? (
                      <div className="p4r1-craft-r1-own-wording">
                        <label>
                          <span>Your wording</span>
                          <textarea
                            value={customDraft}
                            autoFocus
                            rows={3}
                            onChange={(event) => setCustomDraft(event.target.value)}
                            aria-label="Write your wording for this edit"
                          />
                        </label>
                        <div>
                          <button type="button" onClick={() => commitCustom(activeEdit)}>Use my wording</button>
                          <button type="button" onClick={() => {
                            setCustomEditId(null);
                            setCustomDraft('');
                          }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <button
                          type="button"
                          aria-pressed={decisionFor(decisions, activeEdit.id).mode === 'proposal'}
                          onClick={() => setDecision(activeEdit.id, { mode: 'proposal' })}
                        >
                          Use this
                        </button>
                        <button
                          type="button"
                          aria-pressed={decisionFor(decisions, activeEdit.id).mode === 'original'}
                          onClick={() => setDecision(activeEdit.id, { mode: 'original' })}
                        >
                          Keep mine · Stet
                        </button>
                        <button
                          type="button"
                          aria-pressed={decisionFor(decisions, activeEdit.id).mode === 'custom'}
                          onClick={() => beginCustom(activeEdit)}
                        >
                          Write it
                        </button>
                        <button type="button" disabled={props.busy} onClick={() => askAbout(activeEdit, 'another')}>Another way</button>
                        <button type="button" disabled={props.busy} onClick={() => askAbout(activeEdit, 'why')}>Why?</button>
                        <button type="button" disabled={props.busy} onClick={() => askAbout(activeEdit, 'teach')}>Teach me</button>
                      </div>
                    )}
                  </div>
                ) : null}
              </section>
            );
          })}
        </article>
      </div>

      {props.held && props.version && edits.length > 0 ? (
        <footer className="p4r1-craft-r1-footer">
          <span>
            {chosenCount === 0
              ? 'Your original is still the working version.'
              : `${chosenCount} of ${edits.filter((edit) => !edit.protectedSpan).length} craft change${edits.filter((edit) => !edit.protectedSpan).length === 1 ? '' : 's'} in your working version.`}
          </span>
          <div>
            {chosenCount > 0 ? (
              <button type="button" disabled={props.busy || saving} onClick={() => void saveWorkingVersion()}>
                {saving ? 'Saving…' : 'Save my version'}
              </button>
            ) : null}
            {props.version.author === 'member' && !applied ? (
              <button type="button" className="p4r1-craft-r1-primary" disabled={props.busy} onClick={props.onApply}>
                Apply my version
              </button>
            ) : null}
            {applied && props.onUndo ? (
              <button type="button" disabled={props.busy} onClick={props.onUndo}>Undo</button>
            ) : null}
          </div>
          {localMessage ? <small role="status">{localMessage}</small> : null}
        </footer>
      ) : null}
    </section>
  );
}
