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
import { professionalMarkFor } from '@/lib/writersStudio/craftProfessionalMarks';
import type { MemberRevisionDraft } from '@/app/writers-studio/insight/RevisionDesk';
import { typesetProseBlocks } from '@/app/writers-studio/full-redesign/manuscriptTypesetting';

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

function visibleBlockText(text: string): string {
  const trimmed = text.trim();
  const wrapped = /^(\*|_)([\s\S]+)\1$/.exec(trimmed);
  return wrapped ? wrapped[2]!.trim() : trimmed;
}

function CraftContextBlocks({ text, muted = false }: { text: string; muted?: boolean }) {
  if (!text.trim()) return null;
  const blocks = typesetProseBlocks(text);
  return (
    <div className={muted ? 'p4r1-craft-r1-context p4r1-craft-r1-context-muted' : 'p4r1-craft-r1-context'}>
      {blocks.map((block, index) => {
        const shown = visibleBlockText(block.text);
        if (!shown) return null;
        if (block.kind === 'epigraph') {
          return <blockquote key={index}>{shown}</blockquote>;
        }
        if (block.kind === 'subhead') {
          return <h4 key={index}>{shown}</h4>;
        }
        if (block.kind === 'list') {
          return (
            <div key={index} className="p4r1-craft-r1-list">
              {shown.split('\n').filter(Boolean).map((line, lineIndex) => <p key={lineIndex}>{line}</p>)}
            </div>
          );
        }
        return <p key={index}>{shown}</p>;
      })}
    </div>
  );
}

function splitActiveParagraph(before: string, after: string) {
  const breaks = /\n[ \t]*\n+/g;
  let prefixStart = 0;
  for (const match of before.matchAll(breaks)) {
    prefixStart = (match.index ?? 0) + match[0].length;
  }
  const next = /\n[ \t]*\n+/.exec(after);
  const suffixEnd = next?.index ?? after.length;
  const trailingStart = next ? suffixEnd + next[0].length : after.length;
  return {
    leading: before.slice(0, prefixStart),
    prefix: before.slice(prefixStart),
    suffix: after.slice(0, suffixEnd),
    trailing: after.slice(trailingStart),
  };
}

function compactRationale(text: string | null | undefined): string | null {
  const clean = text?.replace(/\s+/g, ' ').trim() ?? '';
  if (!clean) return null;
  return clean.length <= 360 ? clean : clean.slice(0, 357).trimEnd() + '…';
}

export default function CraftsmansTableR1(props: CraftsmansTableR1Props) {
  const [view, setView] = useState<'markup' | 'preview'>('markup');
  const [notation, setNotation] = useState<'guided' | 'professional'>('guided');
  const [decisions, setDecisions] = useState<ReadonlyMap<number, CraftDecision>>(new Map());
  const [manualText, setManualText] = useState<string | null>(null);
  const [manualFromVersionId, setManualFromVersionId] = useState<string | null>(null);
  const [directDraft, setDirectDraft] = useState('');
  const [directEditing, setDirectEditing] = useState(false);
  const [activeEditId, setActiveEditId] = useState<number | null>(null);
  const [customEditId, setCustomEditId] = useState<number | null>(null);
  const [customDraft, setCustomDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const locusRef = useRef<HTMLSpanElement | null>(null);

  const original = props.held?.text ?? '';
  const proposal = props.version?.wording ?? original;
  const proposalEdits = useMemo(
    () => craftWorkingEdits(original, proposal),
    [original, proposal],
  );

  useEffect(() => {
    setDecisions(initialCraftDecisions(proposalEdits, props.version?.author ?? null));
    setManualText(null);
    setManualFromVersionId(null);
    setDirectDraft('');
    setDirectEditing(false);
    setActiveEditId(null);
    setCustomEditId(null);
    setCustomDraft('');
    setLocalMessage(null);
  }, [
    props.held?.draftSectionId,
    props.held?.start,
    props.held?.end,
    original,
  ]);

  /* A new MAIA proposal must never erase wording the writer is already shaping.
     When no writer-owned manual state exists, it can become the new candidate
     set. Once the writer has composed, MAIA's later proposal remains an
     alternative rather than becoming the working copy. */
  useEffect(() => {
    if (manualText !== null) {
      if (props.version?.author === 'member' && props.version.wording === manualText) {
        setManualText(null);
        setManualFromVersionId(null);
        setDecisions(initialCraftDecisions(proposalEdits, 'member'));
      }
      return;
    }
    setDecisions(initialCraftDecisions(proposalEdits, props.version?.author ?? null));
    setActiveEditId(null);
    setCustomEditId(null);
    setCustomDraft('');
  }, [props.version?.id, props.version?.author, proposal]);

  const selectedProposalText = useMemo(
    () => composeCraftWorkingCopy(original, proposalEdits, decisions),
    [original, proposalEdits, decisions],
  );

  const workingText = manualText ?? selectedProposalText;
  const displayText = manualText ?? proposal;
  const displaySegments = useMemo(
    () => editorialSegments(original, displayText),
    [original, displayText],
  );
  const displayEdits = useMemo(
    () => craftWorkingEdits(original, displayText),
    [original, displayText],
  );
  const displayDecisions = useMemo(
    () => manualText !== null
      ? initialCraftDecisions(displayEdits, 'member')
      : decisions,
    [manualText, displayEdits, decisions],
  );

  const proposalChosenCount = useMemo(
    () => decisionCount(proposalEdits, decisions),
    [proposalEdits, decisions],
  );
  const hasWriterChange = workingText !== original;

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
    : displayEdits.find((edit) => edit.id === activeEditId) ?? null;

  const applyDisplayDecision = (id: number, decision: CraftDecision) => {
    if (manualText === null) {
      setDecisions((current) => {
        const next = new Map(current);
        next.set(id, decision);
        return next;
      });
    } else {
      const next = new Map(initialCraftDecisions(displayEdits, 'member'));
      next.set(id, decision);
      setManualText(composeCraftWorkingCopy(original, displayEdits, next));
      setManualFromVersionId(props.version?.id ?? manualFromVersionId);
    }
    setLocalMessage(null);
  };

  const beginCustom = (edit: CraftWorkingEdit) => {
    const current = decisionFor(displayDecisions, edit.id);
    setCustomEditId(edit.id);
    setCustomDraft(
      current.mode === 'custom'
        ? current.text
        : edit.to || edit.from,
    );
  };

  const commitCustom = (edit: CraftWorkingEdit) => {
    applyDisplayDecision(edit.id, customDraft.length > 0
      ? { mode: 'custom', text: customDraft }
      : { mode: 'original' });
    setCustomEditId(null);
    setCustomDraft('');
  };

  const beginDirectComposition = (seed: string, versionId: string | null) => {
    setDirectDraft(seed);
    setDirectEditing(true);
    setManualFromVersionId(versionId);
    setView('preview');
    setLocalMessage(null);
  };

  const commitDirectComposition = () => {
    setManualText(directDraft);
    setDirectEditing(false);
    setActiveEditId(null);
    setLocalMessage('This is now your working copy. It is not yet saved or applied.');
  };

  const saveWorkingVersion = async () => {
    if (
      !props.thread
      || !props.held
      || !props.version
      || !hasWriterChange
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
    const localWorking = manualText !== null
      ? ' This mark is part of the writer’s own current working copy.'
      : decisionFor(decisions, edit.id).mode === 'proposal'
        ? ' The writer currently has this proposed move in the working copy.'
        : ' The writer is currently keeping the original here.';

    const subject = !edit.from
      ? `the insertion "${edit.to.trim()}"`
      : !edit.to
        ? `the deletion "${edit.from.trim()}"`
        : `the change from "${edit.from.trim()}" to "${edit.to.trim()}"`;

    if (kind === 'another') {
      props.onSend([
        `Show me one genuinely different way to handle ${subject}.${localWorking}`,
        'Stay inside this exact local edit. Preserve my intention, voice, cadence, imagery, worldview, and intentional ambiguity.',
        'Do not broaden the rewrite. Return one bounded alternative and explain its tradeoff briefly.',
      ].join('\n'), { proposalPolicy: 'allow', proposalRequested: true });
      return;
    }
    if (kind === 'why') {
      props.onSend([
        `Explain ${subject}.${localWorking}`,
        'Use evidence from my exact words. Tell me what the move may gain and what it could cost.',
        'Make the strongest case for my original too. Do not propose new wording in this answer.',
      ].join('\n'), { proposalPolicy: 'reply_only' });
      return;
    }
    props.onSend([
      `Teach me the craft involved in ${subject}.${localWorking}`,
      'Use my sentence as the example. Plain language first, then professional terminology if useful.',
      'Do not propose new wording unless I ask.',
    ].join('\n'), { proposalPolicy: 'reply_only' });
  };

  const insertionIndex = useMemo(() => {
    const first = new Map<number, number>();
    displaySegments.forEach((segment, index) => {
      if (segment.kind === 'ins' && segment.editId !== null && !first.has(segment.editId)) {
        first.set(segment.editId, index);
      }
    });
    return first;
  }, [displaySegments]);

  const firstChangeIndex = useMemo(() => {
    const first = new Map<number, number>();
    displaySegments.forEach((segment, index) => {
      if (segment.kind !== 'same' && segment.editId !== null && !first.has(segment.editId)) {
        first.set(segment.editId, index);
      }
    });
    return first;
  }, [displaySegments]);

  const applied = Boolean(
    props.version?.author === 'member'
    && props.appliedVersionId === props.version.id,
  );

  const newerMaiaAlternative = Boolean(
    manualText !== null
    && props.version?.author === 'maia'
    && props.version.id !== manualFromVersionId
    && props.version.wording !== manualText,
  );

  return (
    <section className="p4r1-craft-r1" data-craftsmans-table-r1>
      <header className="p4r1-craft-r1-bar">
        <div>
          <span className="p4r1-eyebrow">Develop · Craftsman's Table</span>
          <strong>The writing is the workbench.</strong>
          <small>Red leaves. Blue enters. Nothing changes until your version is applied.</small>
        </div>
        <div className="p4r1-craft-r1-controls">
          <div className="p4r1-craft-r1-view" role="group" aria-label="Craft view">
            <button type="button" aria-pressed={view === 'markup'} onClick={() => {
              setDirectEditing(false);
              setView('markup');
            }}>Markup</button>
            <button type="button" aria-pressed={view === 'preview'} onClick={() => setView('preview')}>Preview</button>
          </div>
          <details className="p4r1-craft-r1-notation">
            <summary>{notation === 'professional' ? 'Pro marks' : 'Marks'}</summary>
            <div>
              <button type="button" aria-pressed={notation === 'guided'} onClick={() => setNotation('guided')}>Guided</button>
              <button type="button" aria-pressed={notation === 'professional'} onClick={() => setNotation('professional')}>Professional</button>
            </div>
          </details>
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
                <section key={section.draftSectionId} className="p4r1-craft-r1-section p4r1-craft-r1-context-section">
                  {section.heading?.trim() ? <Heading>{section.heading.trim()}</Heading> : null}
                  <CraftContextBlocks text={body} muted />
                </section>
              );
            }

            const points = Array.from(body);
            const before = points.slice(0, props.held.start).join('');
            const exact = points.slice(props.held.start, props.held.end).join('');
            const after = points.slice(props.held.end).join('');
            const authoritative = exact === props.held.text;
            const activeContext = splitActiveParagraph(before, after);
            const marginRationale = compactRationale(props.version?.rationale);

            return (
              <section
                key={section.draftSectionId}
                className="p4r1-craft-r1-section"
                data-craft-active-section
              >
                {section.heading?.trim() ? <Heading>{section.heading.trim()}</Heading> : null}
                <div className="p4r1-craft-r1-workrow">
                  <div className="p4r1-craft-r1-worktext">
                    <CraftContextBlocks text={activeContext.leading} muted />

                    <div className="p4r1-craft-r1-active-paragraph">
                      {activeContext.prefix}
                      <span
                        ref={locusRef}
                        className="p4r1-craft-r1-locus"
                        data-craft-authoritative={authoritative ? 'true' : 'false'}
                      >
                        {directEditing ? (
                          <textarea
                            className="p4r1-craft-r1-direct"
                            value={directDraft}
                            autoFocus
                            rows={Math.max(4, Math.min(14, directDraft.split('\n').length + 2))}
                            aria-label="Edit your working passage"
                            onChange={(event) => setDirectDraft(event.target.value)}
                          />
                        ) : view === 'preview' ? (
                          <span className="p4r1-craft-r1-preview">{workingText || exact}</span>
                        ) : displaySegments.length > 0 && displayText !== original ? (
                          displaySegments.map((segment, index) => {
                            if (segment.kind === 'same') return <span key={index}>{segment.text}</span>;
                            if (segment.editId === null) return <span key={index}>{segment.text}</span>;

                            const decision = decisionFor(displayDecisions, segment.editId);
                            const chosen = decision.mode !== 'original';
                            const edit = displayEdits.find((candidate) => candidate.id === segment.editId) ?? null;
                            const proof = edit ? professionalMarkFor(edit, displayEdits, decision) : null;
                            const proofMark = notation === 'professional'
                              && proof
                              && firstChangeIndex.get(segment.editId) === index
                              ? <sup className="p4r1-craft-r1-proofmark" title={proof.label}>{proof.symbol}</sup>
                              : null;
                            const common = {
                              'data-edit-id': segment.editId,
                              'data-selected': chosen ? 'true' : undefined,
                              'data-decision': decision.mode,
                              onClick: () => setActiveEditId(segment.editId),
                              title: `Change ${segment.editId} · click to work with this mark`,
                            };

                            if (segment.kind === 'del') {
                              const customWithoutInsertion = decision.mode === 'custom'
                                && edit
                                && !edit.to
                                && decision.text;
                              return (
                                <span key={index} className="p4r1-craft-r1-mark-unit">
                                  {proofMark}
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
                            return displayed ? (
                              <span key={index} className="p4r1-craft-r1-mark-unit">
                                {proofMark}
                                <ins {...common}>{displayed}</ins>
                              </span>
                            ) : proofMark ? <span key={index}>{proofMark}</span> : null;
                          })
                        ) : (
                          <span className="p4r1-craft-r1-held">{exact}</span>
                        )}
                      </span>
                      {activeContext.suffix}
                    </div>

                    <CraftContextBlocks text={activeContext.trailing} muted />

                    {directEditing ? (
                      <div className="p4r1-craft-r1-direct-actions">
                        <button type="button" onClick={commitDirectComposition}>Use this as my working copy</button>
                        <button type="button" onClick={() => {
                          setDirectEditing(false);
                          setDirectDraft('');
                        }}>Cancel</button>
                      </div>
                    ) : null}

                    {!authoritative ? (
                      <p className="p4r1-craft-r1-warning" role="status">
                        This passage changed after Craft opened. Re-anchor before making wording decisions.
                      </p>
                    ) : null}
                  </div>

                  <aside className="p4r1-craft-r1-margin" aria-label="Editorial margin">
                    {marginRationale ? (
                      <div className="p4r1-craft-r1-margin-note">
                        <span>{props.version?.author === 'maia' ? 'MAIA · craft note' : 'Working version'}</span>
                        <p>{marginRationale}</p>
                      </div>
                    ) : (
                      <div className="p4r1-craft-r1-margin-guide">
                        <span>On the table</span>
                        <p>Red leaves. Blue enters. Click any mark to work with that exact change.</p>
                      </div>
                    )}

                    {view === 'markup' && activeEdit ? (
                      <div className="p4r1-craft-r1-local" data-craft-local-edit={activeEdit.id}>
                        <div>
                          <span>
                            Change {activeEdit.id} · {editKind(activeEdit)}
                            {notation === 'professional'
                              ? ` · ${professionalMarkFor(activeEdit, displayEdits, decisionFor(displayDecisions, activeEdit.id)).symbol}`
                              : ''}
                          </span>
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
                              aria-pressed={decisionFor(displayDecisions, activeEdit.id).mode === 'proposal'}
                              onClick={() => applyDisplayDecision(activeEdit.id, { mode: 'proposal' })}
                            >
                              Use this
                            </button>
                            <button
                              type="button"
                              aria-pressed={decisionFor(displayDecisions, activeEdit.id).mode === 'original'}
                              onClick={() => applyDisplayDecision(activeEdit.id, { mode: 'original' })}
                            >
                              {notation === 'professional' ? 'Stet · Keep mine' : 'Keep mine'}
                            </button>
                            <button
                              type="button"
                              aria-pressed={decisionFor(displayDecisions, activeEdit.id).mode === 'custom'}
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
                  </aside>
                </div>
              </section>
            );
          })}
        </article>
      </div>

      {props.held && props.version ? (
        <footer className="p4r1-craft-r1-footer">
          <span>
            {manualText !== null
              ? 'You are shaping your own working copy.'
              : proposalChosenCount === 0
                ? 'Your original is still the working version.'
                : `${proposalChosenCount} MAIA move${proposalChosenCount === 1 ? '' : 's'} are in your working version.`}
            {newerMaiaAlternative ? ' MAIA has also offered a newer alternative; your wording has not been replaced.' : ''}
          </span>
          <div className="p4r1-craft-r1-footer-actions">
            <details className="p4r1-craft-r1-compose-menu">
              <summary>Compose</summary>
              <div>
                <button type="button" onClick={() => beginDirectComposition(original, props.version?.id ?? null)}>
                  Write from mine
                </button>
                <button type="button" onClick={() => beginDirectComposition(workingText, props.version?.id ?? null)}>
                  Edit current hybrid
                </button>
                {props.version.author === 'maia' && proposal !== original ? (
                  <button type="button" onClick={() => beginDirectComposition(proposal, props.version?.id ?? null)}>
                    Start from MAIA
                  </button>
                ) : null}
              </div>
            </details>
            {hasWriterChange ? (
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
