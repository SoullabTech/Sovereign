'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';
import type {
  RebuildEditorialThread,
  RebuildEditorialVersion,
} from '@/lib/writersStudio/rebuild/editorialCollaboration';
import {
  composeSelected,
  editIds,
  editorialSegments,
  type Segment,
} from '@/lib/writersStudio/editorialDiff';
import type { MemberRevisionDraft } from '@/app/writers-studio/insight/RevisionDesk';

export type CraftHeldPassage = {
  draftSectionId: string;
  start: number;
  end: number;
  text: string;
  revisionNumber: number;
};

type CraftEdit = {
  id: number;
  kind: 'insert' | 'delete' | 'replace';
  from: string;
  to: string;
  protectedSpan: boolean;
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
};

function editsFromSegments(segments: readonly Segment[]): CraftEdit[] {
  const byId = new Map<number, CraftEdit>();
  for (const segment of segments) {
    if (segment.editId === null) continue;
    const existing = byId.get(segment.editId) ?? {
      id: segment.editId,
      kind: 'insert' as const,
      from: '',
      to: '',
      protectedSpan: false,
    };
    if (segment.kind === 'del') existing.from += segment.text;
    if (segment.kind === 'ins') existing.to += segment.text;
    existing.protectedSpan = existing.protectedSpan || segment.protectedSpan;
    existing.kind = existing.from && existing.to
      ? 'replace'
      : existing.from
        ? 'delete'
        : 'insert';
    byId.set(segment.editId, existing);
  }
  return [...byId.values()].sort((a, b) => a.id - b.id);
}

function editLabel(edit: CraftEdit): string {
  if (edit.kind === 'replace') return 'Replace';
  if (edit.kind === 'delete') return 'Delete';
  return 'Insert';
}

export default function CraftsmansTableR1(props: CraftsmansTableR1Props) {
  const [view, setView] = useState<'markup' | 'preview'>('markup');
  const [selected, setSelected] = useState<ReadonlySet<number>>(new Set());
  const [activeEditId, setActiveEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const locusRef = useRef<HTMLSpanElement | null>(null);

  const proposal = props.version?.wording ?? props.held?.text ?? '';
  const segments = useMemo(
    () => editorialSegments(props.held?.text ?? '', proposal),
    [props.held?.text, proposal],
  );
  const edits = useMemo(() => editsFromSegments(segments), [segments]);
  const selectableIds = useMemo(() => editIds(segments), [segments]);

  useEffect(() => {
    if (!props.held) {
      setSelected(new Set());
      setActiveEditId(null);
      return;
    }
    if (props.version?.author === 'member') {
      setSelected(new Set(selectableIds));
    } else {
      setSelected(new Set());
    }
    setActiveEditId(null);
    setLocalMessage(null);
  }, [
    props.held?.draftSectionId,
    props.held?.start,
    props.held?.end,
    props.version?.id,
    props.version?.author,
    selectableIds.join(':'),
  ]);

  useEffect(() => {
    if (!props.held || !locusRef.current) return;
    const frame = window.requestAnimationFrame(() => {
      locusRef.current?.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [props.held?.draftSectionId, props.held?.start, props.held?.end]);

  const activeEdit = activeEditId === null
    ? null
    : edits.find((edit) => edit.id === activeEditId) ?? null;

  const preview = props.held
    ? composeSelected(segments, selected)
    : '';

  const toggle = (id: number, useProposal: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      if (useProposal) next.add(id);
      else next.delete(id);
      return next;
    });
    setLocalMessage(null);
  };

  const saveWorkingVersion = async () => {
    if (
      !props.thread
      || !props.held
      || !props.version
      || selected.size === 0
      || saving
    ) return;
    const text = composeSelected(segments, selected);
    setSaving(true);
    setLocalMessage(null);
    try {
      const ok = await props.onSaveMember({
        threadId: props.thread.threadId,
        sectionId: props.held.draftSectionId,
        supersedes: props.version.id,
        text,
        purpose: 'Writer-chosen Craft marks',
      });
      setLocalMessage(ok
        ? 'Saved as your working version. The manuscript is still unchanged.'
        : 'Your working version could not be saved just now. Your choices remain here.');
    } finally {
      setSaving(false);
    }
  };

  const askAbout = (
    edit: CraftEdit,
    kind: 'another' | 'why' | 'teach',
  ) => {
    const subject = edit.kind === 'insert'
      ? `the proposed insertion "${edit.to.trim()}"`
      : edit.kind === 'delete'
        ? `the proposed deletion "${edit.from.trim()}"`
        : `the proposed change from "${edit.from.trim()}" to "${edit.to.trim()}"`;

    if (kind === 'another') {
      props.onSend([
        `Show me one genuinely different way to handle ${subject}.`,
        'Stay inside this exact local edit. Preserve my intention, voice, cadence, imagery, and intentional ambiguity.',
        'Do not broaden the rewrite. Return one bounded alternative and explain its tradeoff briefly.',
      ].join('\n'), { proposalPolicy: 'allow', proposalRequested: true });
      return;
    }
    if (kind === 'why') {
      props.onSend([
        `Explain why you proposed ${subject}.`,
        'Use evidence from my exact words. Tell me what the change may gain and what it could cost.',
        'Make the strongest case for keeping my original too. Do not propose new wording in this answer.',
      ].join('\n'), { proposalPolicy: 'reply_only' });
      return;
    }
    props.onSend([
      `Teach me the craft involved in ${subject}.`,
      'Use my sentence as the example. Plain language first, then professional terminology if useful.',
      'Do not propose new wording unless I ask.',
    ].join('\n'), { proposalPolicy: 'reply_only' });
  };

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
          <small>Marks are possibilities until you make a version and apply it.</small>
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
                      <span className="p4r1-craft-r1-preview">{preview || exact}</span>
                    ) : segments.length > 0 && props.version ? (
                      segments.map((segment, index) => {
                        if (segment.kind === 'same') return <span key={index}>{segment.text}</span>;
                        if (segment.editId === null) return <span key={index}>{segment.text}</span>;
                        const chosen = selected.has(segment.editId);
                        const common = {
                          'data-edit-id': segment.editId,
                          'data-selected': chosen ? 'true' : undefined,
                          onClick: () => setActiveEditId(segment.editId),
                          title: `Edit ${segment.editId} · click to work with this change`,
                        };
                        return segment.kind === 'del'
                          ? <del key={index} {...common}>{segment.text}</del>
                          : <ins key={index} {...common}>{segment.text}</ins>;
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
                      <span>Change {activeEdit.id} · {editLabel(activeEdit)}</span>
                      <p>
                        {activeEdit.from ? <del>{activeEdit.from.trim()}</del> : null}
                        {activeEdit.from && activeEdit.to ? <span aria-hidden="true"> → </span> : null}
                        {activeEdit.to ? <ins>{activeEdit.to.trim()}</ins> : null}
                      </p>
                    </div>
                    <div>
                      <button
                        type="button"
                        aria-pressed={selected.has(activeEdit.id)}
                        onClick={() => toggle(activeEdit.id, true)}
                      >
                        Use this
                      </button>
                      <button
                        type="button"
                        aria-pressed={!selected.has(activeEdit.id)}
                        onClick={() => toggle(activeEdit.id, false)}
                      >
                        Keep mine
                      </button>
                      <button type="button" disabled={props.busy} onClick={() => askAbout(activeEdit, 'another')}>Another way</button>
                      <button type="button" disabled={props.busy} onClick={() => askAbout(activeEdit, 'why')}>Why?</button>
                      <button type="button" disabled={props.busy} onClick={() => askAbout(activeEdit, 'teach')}>Teach me</button>
                    </div>
                  </div>
                ) : null}
              </section>
            );
          })}
        </article>
      </div>

      {props.held && props.version && selectableIds.length > 0 ? (
        <footer className="p4r1-craft-r1-footer">
          <span>
            {selected.size === 0
              ? 'Your original is still the working version.'
              : `${selected.size} of ${selectableIds.length} craft change${selectableIds.length === 1 ? '' : 's'} in your working version.`}
          </span>
          <div>
            {selected.size > 0 ? (
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
