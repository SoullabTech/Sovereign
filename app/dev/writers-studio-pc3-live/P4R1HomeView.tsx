'use client';

import { useEffect, useMemo, useState } from 'react';
import { Shell } from '@/app/writers-studio/full-redesign/Shell';
import { HOME_GEOMETRY } from '@/app/writers-studio/full-redesign/tokens';
import { HOME_COPY, REMOVE_OR_DELETE } from '@/app/writers-studio/full-redesign/fixtures';
import { useWorkVisual } from '@/app/writers-studio/useWorkVisual';
import type { LivingWork } from '@/app/writers-studio/useLivingWorks';
import type { CurrentManuscript } from '@/app/writers-studio/useCurrentManuscript';
import type { Arrival } from '@/app/writers-studio/homeState';
import {
  homeWritingExtent,
  manuscriptIdsOf,
  manuscriptsForWork,
  manuscriptsInOrder,
} from '@/app/writers-studio/homeState';
import type { SectionActivity } from '@/lib/writersStudio/sectionActivity';
import type { MarkedLine } from '@/app/writers-studio/useMarkedLines';
import type { StudioAct } from '@/app/writers-studio/studioHistory';
import { sentenceFor } from '@/app/writers-studio/studioHistory';
import P4R1WorkMaterialsSummary from './P4R1WorkMaterialsSummary';
import { WritingDeleteConfirm } from './WritingDeleteConfirm';
import { INITIAL_DOOR, useWorkDeleteDoor, writingDeleteKindFor, type DoorState } from './useWorkDeleteDoor';
import { P4R1HistoryContainer } from './P4R1HistoryPage';
import { NoticeList, useNoticeStack } from './useNoticeStack';
import { DeletionNotice, DeletionSharedMaterial, DeletionUnconfirmed, deleteConfirmCopy, type ActResult } from '@/lib/writersStudio/deleteWork';
import P4R1ProducePanel from './P4R1ProducePanel';
import type { Appearance } from '@/app/writers-studio/full-redesign/types';

function fixedDate(iso: string | null | undefined): string {
  if (!iso) return 'date not recorded';
  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) return 'date not recorded';
  const now = new Date();
  const sameYear = value.getFullYear() === now.getFullYear();
  return value.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

function wordsFromChars(chars: number): number {
  return Math.max(0, Math.round(chars / 6));
}

function workFacts(work: LivingWork, manuscripts: readonly CurrentManuscript[]): { extent: string; written: string } {
  const choices = manuscriptsForWork(work, manuscripts);
  if (choices.length > 1) {
    return {
      extent: `${choices.length} manuscripts`,
      written: 'Choose a manuscript to continue',
    };
  }
  const manuscript = choices[0] ?? null;
  if (!manuscript) return { extent: 'No manuscript yet', written: 'not yet written here' };
  const extent = homeWritingExtent(manuscript);
  const words = wordsFromChars(extent);
  return {
    extent: manuscript.sectionCount > 0
      ? `${manuscript.sectionCount} section${manuscript.sectionCount === 1 ? '' : 's'} · ~${words.toLocaleString()} words`
      : words > 0 ? `~${words.toLocaleString()} words` : 'No writing yet',
    written: manuscript.lastMemberDraftActivityAt
      ? `worked ${fixedDate(manuscript.lastMemberDraftActivityAt)}`
      : 'no authored return date recorded',
  };
}

function LiveWorkVisual({ workId, title }: { workId: string; title: string }) {
  const visual = useWorkVisual(workId);
  if (!visual.src) return null;
  return <img className="p4r1-home-work-image" src={visual.src} alt={`${title} — the image this Work carries`} />;
}

function WorkAnchor({ work, allWorks, manuscripts, activity, onOpen, onStartWriting, busy, produceInitially = false, onDeleteWork, onRemoveWork, onDeletionNotice, doorFor }: {
  work: LivingWork;
  /** Every Work the member has: the hero Work is a Work like any other, with the same way to delete or remove it. */
  allWorks: readonly LivingWork[];
  onDeleteWork: (workId: string, manuscriptId: string | null) => Promise<ActResult | void>;
  onRemoveWork: (workId: string) => Promise<ActResult | void>;
  onDeletionNotice: (message: string, urgent?: boolean) => void;
  /** This Work's delete/remove state lives in the page (keyed by Work id), so a re-read that moves the Work between cards loses nothing. */
  doorFor: (workId: string) => { readonly state: DoorState; readonly update: (patch: Partial<DoorState>) => void };
  manuscripts: readonly CurrentManuscript[];
  activity: SectionActivity | null;
  onOpen: (manuscriptId: string, sectionId?: string) => void;
  onStartWriting: (workId: string) => void;
  busy: boolean;
  produceInitially?: boolean;
}) {
  const choices = manuscriptsForWork(work, manuscripts);
  const manuscript = choices.length === 1 ? choices[0] : null;
  const [producing, setProducing] = useState(produceInitially);

  useEffect(() => {
    if (produceInitially) setProducing(true);
  }, [produceInitially]);
  const facts = workFacts(work, manuscripts);
  const title = work.title?.trim() || 'Untitled Work';
  const sectionId = activity?.kind === 'distinct' ? activity.sectionId : undefined;
  const hasManuscriptExpression = work.expressions.some((expression) => expression.expressionType === 'manuscript');
  const del = useWorkDeleteDoor({ work, title, manuscripts, allWorks, ...doorFor(work.id), onDeleteWork, onRemoveWork, onDeletionNotice });
  if (del.settled) {
    return (
      <section className="fr-home-anchor fr-home-return p4r1-home-anchor" data-field="anchor" data-removed>
        <p role="status">{del.settled}</p>
      </section>
    );
  }
  if (del.dialog) {
    return (
      <section
        className="fr-home-anchor fr-home-return p4r1-home-anchor"
        data-field="anchor"
        data-deleting-confirmation
        {...(del.dialogKind === 'remove-shared' ? { 'data-shared-writing': '' } : {})}
        {...(del.dialogKind === 'remove-many' ? { 'data-many-writings': '' } : {})}
      >
        {del.dialog}
      </section>
    );
  }
  return (
    <section className="fr-home-anchor fr-home-return p4r1-home-anchor" data-field="anchor">
      <header className="fr-home-arrive">
        <p className="fr-home-eyebrow">{HOME_COPY.returnEyebrow}</p>
        <h1 className="fr-home-greeting">{HOME_COPY.returnWelcome(title)}</h1>
        {activity?.kind === 'distinct' ? (
          <p className="fr-home-place" data-home-place="distinct">Pick up where you left off.</p>
        ) : (
          <p className="fr-home-place" data-home-place="work">Open it and carry on.</p>
        )}
      </header>
      <div className="fr-home-recognize p4r1-home-recognize">
        <LiveWorkVisual workId={work.id} title={title} />
        <div className="p4r1-home-work-copy">
          <span className="fr-home-chip fr-home-chip-work">Work</span>
          <h2>{title}</h2>
          <p className="fr-home-kind">{work.form?.trim() || 'Work'}</p>
          <p className="fr-home-facts">{facts.extent} <span className="fr-home-dot">·</span> {facts.written}</p>
          {work.purpose?.trim() ? <blockquote className="p4r1-home-purpose">“{work.purpose.trim()}”</blockquote> : null}
          {manuscript ? (
            <>
              <div className="fr-home-actions">
                <button type="button" className="fr-home-primary" onClick={() => onOpen(manuscript.id, sectionId)}>
                  {HOME_COPY.returnAction}
                </button>
                <button
                  type="button"
                  className="fr-home-quiet"
                  aria-expanded={producing}
                  onClick={() => setProducing((value) => !value)}
                >
                  Publish
                </button>
              </div>
              {producing ? (
                <P4R1ProducePanel
                  manuscriptId={manuscript.id}
                  onClose={() => setProducing(false)}
                />
              ) : null}
            </>
          ) : choices.length > 1 ? (
            <ManuscriptChooser
              manuscripts={choices}
              heading="Choose a manuscript to continue"
              onChoose={(id) => onOpen(id, sectionId)}
            />
          ) : !hasManuscriptExpression ? (
            <div className="fr-home-actions">
              <button
                type="button"
                className="fr-home-primary"
                disabled={busy}
                onClick={() => onStartWriting(work.id)}
              >
                {busy ? 'Opening writing…' : 'Start writing'}
              </button>
              <span className="p4r1-home-start-note">
                Begins a blank writing place. Materials stay where they are.
              </span>
            </div>
          ) : null}
          {del.door}
        </div>
      </div>
      <P4R1WorkMaterialsSummary work={work} />
    </section>
  );
}

function WorkShelfCard({ work, allWorks, manuscripts, onOpen, onStartWriting, busy, onDeleteWork, onRemoveWork, onDeletionNotice, doorFor }: {
  work: LivingWork;
  /** Every Work the member has, as Home last read them. Whether the writing is STILL shared is derived from this on every render. */
  allWorks: readonly LivingWork[];
  manuscripts: readonly CurrentManuscript[];
  onOpen: (manuscriptId: string) => void;
  onStartWriting: (workId: string) => void;
  busy: boolean;
  /** Permanently deletes this Work and its one manuscript (WS-DELETE-01). Rejects with a member-facing message. */
  onDeleteWork: (workId: string, manuscriptId: string | null) => Promise<ActResult | void>;
  /** Removes this Work only, leaving its writing(s) where they are. Offered after a shared-writing refusal, and for a Work with several writings. */
  onRemoveWork: (workId: string) => Promise<ActResult | void>;
  /** The card is unmounted once the server has removed the Work, so a message the member must still see lives with the page, not here. */
  onDeletionNotice: (message: string, urgent?: boolean) => void;
  doorFor: (workId: string) => { readonly state: DoorState; readonly update: (patch: Partial<DoorState>) => void };
}) {
  const choices = manuscriptsForWork(work, manuscripts);
  const manuscript = choices.length === 1 ? choices[0] : null;
  const facts = workFacts(work, manuscripts);
  const title = work.title?.trim() || 'Untitled Work';
  const hasManuscriptExpression = work.expressions.some((expression) => expression.expressionType === 'manuscript');
  const del = useWorkDeleteDoor({ work, title, manuscripts, allWorks, ...doorFor(work.id), onDeleteWork, onRemoveWork, onDeletionNotice });
  // The server removed this Work. Until the list is re-read (or if that read fails) the card says so and offers no door.
  if (del.settled) {
    return (
      <article className="fr-home-workcard p4r1-home-workcard" data-removed style={{ display: 'block' }}>
        <p role="status">{del.settled}</p>
      </article>
    );
  }
  if (del.dialog) {
    return (
      <article
        className="fr-home-workcard p4r1-home-workcard"
        data-deleting-confirmation
        {...(del.dialogKind === 'remove-shared' ? { 'data-shared-writing': '' } : {})}
        {...(del.dialogKind === 'remove-many' ? { 'data-many-writings': '' } : {})}
        style={{ display: 'block' }}
      >
        {del.dialog}
      </article>
    );
  }
  return (
    <article className="fr-home-workcard p4r1-home-workcard">
      <LiveWorkVisual workId={work.id} title={title} />
      <div>
        <span className="fr-home-chip fr-home-chip-work">Work</span>
        <h3>{title}</h3>
        <p className="fr-home-kind">{work.form?.trim() || 'Work'}</p>
        <p className="fr-home-facts">{facts.extent}<br />{facts.written}</p>
        {manuscript ? (
          <button type="button" className="fr-home-link" onClick={() => onOpen(manuscript.id)}>Open</button>
        ) : choices.length > 1 ? (
          <ManuscriptChooser
            manuscripts={choices}
            heading="Choose a manuscript"
            onChoose={onOpen}
          />
        ) : !hasManuscriptExpression ? (
          <div className="p4r1-home-shelf-start">
            <button
              type="button"
              className="fr-home-link"
              disabled={busy}
              onClick={() => onStartWriting(work.id)}
            >
              {busy ? 'Opening writing…' : 'Start writing'}
            </button>
            <span>Blank page. Materials stay where they are.</span>
          </div>
        ) : null}
        {del.door}
      </div>
    </article>
  );
}

function WritingCard({ manuscript, works, onOpen, onMakeWork, onAddToWork, onAskDelete, deletion }: {
  manuscript: CurrentManuscript;
  works: readonly LivingWork[];
  onOpen: (id: string) => void;
  onMakeWork: (id: string, title: string | null) => void;
  onAddToWork: (manuscriptId: string, workId: string) => void;
  onAskDelete: (id: string) => void;
  deletion: { confirming: boolean; busy: boolean; error: string | null; onConfirm: () => void; onCancel: () => void };
}) {
  const [choosing, setChoosing] = useState(false);
  const extent = homeWritingExtent(manuscript);
  if (deletion.confirming) {
    const writingTitle = manuscript.title?.trim() || 'Untitled writing';
    const words = deleteConfirmCopy(writingDeleteKindFor(manuscript.id, works), writingTitle);
    return (
      <article className="fr-home-writing p4r1-home-writing" data-kind="writing" data-deleting-confirmation style={{ display: 'block' }}>
        <WritingDeleteConfirm
          title={writingTitle}
          question={words.question}
          body={words.body}
          busy={deletion.busy}
          error={deletion.error}
          onConfirm={deletion.onConfirm}
          onCancel={deletion.onCancel}
        />
      </article>
    );
  }
  return (
    <article className="fr-home-writing p4r1-home-writing" data-kind="writing">
      <span className="fr-home-page" aria-hidden="true">◇</span>
      <div className="fr-home-writing-body">
        <span className="fr-home-chip">Writing</span>
        <h3>{manuscript.title?.trim() || 'Untitled writing'}</h3>
        <p className="fr-home-facts">
          ~{wordsFromChars(extent).toLocaleString()} words
          {manuscript.lastMemberDraftActivityAt ? <> <span className="fr-home-dot">·</span> {fixedDate(manuscript.lastMemberDraftActivityAt)}</> : null}
        </p>
        <div className="fr-home-actions">
          <button type="button" className="fr-home-primary" onClick={() => onOpen(manuscript.id)}>Open writing</button>
          <button type="button" className="fr-home-quiet" onClick={() => onMakeWork(manuscript.id, manuscript.title)}>Make this a Work</button>
          {works.length > 0 ? (
            <button type="button" className="fr-home-quiet" onClick={() => setChoosing((v) => !v)}>Add to a Work</button>
          ) : null}
          <button type="button" className="fr-home-quiet p4r1-home-delete-open" onClick={() => onAskDelete(manuscript.id)}>Delete</button>
        </div>
        {choosing ? (
          <ul className="fr-home-chooser">
            {works.map((work) => (
              <li key={work.id}><button type="button" onClick={() => onAddToWork(manuscript.id, work.id)}>{work.title || 'Untitled Work'}</button></li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}

export interface P4R1HomeViewProps {
  appearance: Appearance;
  arrival: Arrival;
  works: readonly LivingWork[];
  manuscripts: readonly CurrentManuscript[];
  resumeActivity: SectionActivity | null;
  returnWork: LivingWork | null;
  returnActivity: SectionActivity | null;
  markedLines: readonly MarkedLine[];
  historyActs: readonly StudioAct[];
  busy: boolean;
  error: string | null;
  publishRequested: boolean;
  pendingMode: {
    mode: 'write' | 'develop' | 'review' | 'publish' | 'listen';
    manuscriptIds: readonly string[];
  } | null;
  onMode: (mode: 'home' | 'write' | 'develop' | 'review' | 'publish' | 'listen') => void;
  onChooseManuscript: (mode: 'write' | 'develop' | 'review' | 'publish' | 'listen', manuscriptId: string) => void;
  onBegin: (title: string) => void;
  onOpen: (manuscriptId: string, sectionId?: string) => void;
  onMakeWork: (manuscriptId: string, title: string | null) => void;
  onAddToWork: (manuscriptId: string, workId: string) => void;
  /** Permanently deletes one writing through the product's own erase (WS-DELETE-01). Rejects with a member-facing message. */
  onDeleteWriting: (manuscriptId: string) => Promise<ActResult | void>;
  /** Permanently deletes one Work with its manuscript through the same governed erase. */
  onDeleteWork: (workId: string, manuscriptId: string | null) => Promise<ActResult | void>;
  /** Removes one Work and keeps its writing, offered only when Delete was refused because another Work holds the same writing. */
  onRemoveWork: (workId: string) => Promise<ActResult | void>;
  onStartWriting: (workId: string) => void;
  onImport: () => void;
  onSources: () => void;
}

export default function P4R1HomeView(props: P4R1HomeViewProps) {
  const [beginning, setBeginning] = useState(false);
  // The full History view lives inside Home, so Back is this view's own state: nothing Home was showing is reset.
  const [viewingHistory, setViewingHistory] = useState(false);
  const [title, setTitle] = useState('');
  // Only one deletion question is ever open: a confirmation the author has lost track of has stopped confirming anything.
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // What the page has to tell the member about a deletion, in the order it happened. A card that was removed is gone once the list
  // is re-read, so what it had to say lives here, and a LATER notice can never replace an earlier one the member has not dismissed
  // (a plain "was removed" must not erase an unacknowledged custody alert).
  // Every Work's delete/remove state, by Work id (see DoorState).
  const [doors, setDoors] = useState<Readonly<Record<string, DoorState>>>({});
  const doorFor = (workId: string) => ({
    state: doors[workId] ?? INITIAL_DOOR,
    update: (patch: Partial<DoorState>) => setDoors((current) => ({ ...current, [workId]: { ...(current[workId] ?? INITIAL_DOOR), ...patch } })),
  });
  // The stack is shared with History (which is a view inside Home), so a message raised there is still here when the member goes back.
  const noticeStack = useNoticeStack();
  const showNotice = noticeStack.notify;
  const deletionFor = (manuscriptId: string) => ({
    confirming: confirmingDelete === manuscriptId,
    busy: deletingId === manuscriptId,
    error: confirmingDelete === manuscriptId ? deleteError : null,
    onCancel: () => { if (!deletingId) { setConfirmingDelete(null); setDeleteError(null); } },
    onConfirm: async () => {
      if (deletingId) return;
      setDeletingId(manuscriptId);
      setDeleteError(null);
      const writing = props.manuscripts.find((m) => m.id === manuscriptId)?.title?.trim() || 'Untitled writing';
      try {
        const result = await props.onDeleteWriting(manuscriptId);
        setConfirmingDelete(null);
        if (result && !result.refreshed) showNotice(`“${writing}” was deleted. We could not reload Home, so reload this page to see what is current.`, false);
      } catch (err) {
        // The card this question lives in may be gone by now (the re-read the act ran removed the writing from the loose list, or
        // moved it into a Work), so anything the member must still hear goes to the page, not to a dialog that may no longer exist.
        if (err instanceof DeletionUnconfirmed) {
          setConfirmingDelete(null);
          showNotice(`“${writing}”: ${err.message}`);
          return;
        }
        if (err instanceof DeletionNotice || err instanceof DeletionSharedMaterial) {
          setConfirmingDelete(null);
          showNotice(`“${writing}”: ${err.message}`, false);
          return;
        }
        setDeleteError(err instanceof Error ? err.message : 'That writing could not be deleted just now. Nothing was removed. Please try again.');
      } finally {
        setDeletingId(null);
      }
    },
  });

  const claimed = useMemo(
    () => new Set(props.works.flatMap(manuscriptIdsOf)),
    [props.works],
  );
  const unclaimed = props.manuscripts.filter((m) => !claimed.has(m.id));
  // ONE element, rendered once at the top of whichever layout the page falls into (including the welcome screen a member lands on
  // after deleting their last Work). A custody message is an alert (announced at once); a plain confirmation is a status.
  const deleteNoticeEl = noticeStack.notices.length > 0 ? <NoticeList stack={noticeStack} /> : null;
  // The mode-bar chooser keeps the order it was given (declaration order), never recency.
  const pendingManuscripts = props.pendingMode
    ? manuscriptsInOrder(props.pendingMode.manuscriptIds, props.manuscripts)
    : [];
  const recentHistory = props.historyActs.slice(0, 4).map(sentenceFor).filter((x): x is string => Boolean(x));

  // History stays a short, plain list on Home; the full record (up to the route's maximum, deletable where the writing is
  // still held) is one gesture away. The control is present even when the short list is empty, so a member is never left
  // without a way in.
  const historySection = (
    <section className="fr-home-region p4r1-home-history">
      <p className="fr-home-eyebrow">History</p>
      {recentHistory.length > 0 ? <ol>{recentHistory.map((line, i) => <li key={i}>{line}</li>)}</ol> : null}
      <button type="button" className="fr-home-quiet p4r1-home-history-all" onClick={() => setViewingHistory(true)}>
        See all history
      </button>
    </section>
  );

  const creationControls = (
    <section className="p4r1-home-create" aria-label="Start or bring writing">
      <div className="p4r1-home-create-copy">
        <p className="fr-home-eyebrow">Start or bring a Work</p>
        <p>Begin something new, or bring writing you already have into the Studio.</p>
      </div>
      {!beginning ? (
        <div className="fr-home-actions">
          <button type="button" className="fr-home-primary" onClick={() => setBeginning(true)}>New Work</button>
          <button type="button" className="fr-home-quiet" onClick={props.onImport}>Import writing</button>
          <button type="button" className="fr-home-quiet" onClick={props.onSources}>Notes &amp; sources</button>
        </div>
      ) : (
        <div className="p4r1-home-begin-form">
          <label htmlFor="p4r1-work-title">Give the new Work a name, or leave it blank for now.</label>
          <div>
            <input id="p4r1-work-title" autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !props.busy) props.onBegin(title); if (e.key === 'Escape') setBeginning(false); }} />
            <button type="button" className="fr-home-primary" disabled={props.busy} onClick={() => props.onBegin(title)}>
              {props.busy ? 'Beginning…' : 'Start writing'}
            </button>
            <button type="button" className="fr-home-quiet" onClick={() => setBeginning(false)}>Cancel</button>
          </div>
        </div>
      )}
      {props.error ? <p className="p4r1-error">{props.error}</p> : null}
      {props.pendingMode ? (
        <ManuscriptChooser
          manuscripts={pendingManuscripts}
          heading={
            props.pendingMode.mode === 'write'
              ? 'Choose a manuscript to write'
              : props.pendingMode.mode === 'develop'
                ? 'Choose a manuscript to develop'
                : props.pendingMode.mode === 'review'
                  ? 'Choose a manuscript to review'
                  : props.pendingMode.mode === 'publish'
                    ? 'Choose a manuscript to publish'
                    : 'Choose a manuscript to listen to'
          }
          onChoose={(id) => props.onChooseManuscript(props.pendingMode!.mode, id)}
        />
      ) : null}
    </section>
  );

  const unclaimedWriting = unclaimed.length > 0 ? (
    <section className="fr-home-region" aria-label="Writing not yet in a Work">
      <p className="fr-home-here">{HOME_COPY.writingHere}</p>
      <div className="fr-home-writing-list">
        {unclaimed.map((manuscript) => (
          <WritingCard key={manuscript.id} manuscript={manuscript} works={props.works}
            onOpen={(id) => props.onOpen(id)} onMakeWork={props.onMakeWork} onAddToWork={props.onAddToWork}
            onAskDelete={(id) => { setDeleteError(null); setConfirmingDelete(id); }} deletion={deletionFor(manuscript.id)} />
        ))}
      </div>
    </section>
  ) : null;

  let work: React.ReactNode;
  if (props.returnWork) {
    work = (
      <div className="fr-home fr-home-returning" data-home-return-work={props.returnWork.id}>
        <div className="fr-home-field" data-field="room">
          {deleteNoticeEl}
          <WorkAnchor
            key={props.returnWork.id}
            work={props.returnWork}
            manuscripts={props.manuscripts}
            activity={props.returnActivity}
            onOpen={props.onOpen}
            onStartWriting={props.onStartWriting}
            busy={props.busy}
            produceInitially={props.publishRequested}
            allWorks={props.works}
            onDeleteWork={props.onDeleteWork}
            onRemoveWork={props.onRemoveWork}
            onDeletionNotice={showNotice}
            doorFor={doorFor}
          />
          {unclaimedWriting}
          {creationControls}
          {/* Returning to one Work must never hide the writer's others: an
              import placed in another Work was saved yet invisible on Home. */}
          {props.works.some((item) => item.id !== props.returnWork!.id) ? (
            <section className="fr-home-region" aria-label="Your other Works" data-home-other-works>
              <p className="fr-home-eyebrow">Your other Works</p>
              <div className="fr-home-shelf">
                {props.works.filter((item) => item.id !== props.returnWork!.id).map((item) => (
                  <WorkShelfCard
                    key={item.id}
                    work={item}
                    manuscripts={props.manuscripts}
                    onOpen={props.onOpen}
                    onStartWriting={props.onStartWriting}
                    onDeleteWork={props.onDeleteWork}
                    onRemoveWork={props.onRemoveWork}
                    onDeletionNotice={showNotice}
                    doorFor={doorFor}
                    allWorks={props.works}
                    busy={props.busy}
                  />
                ))}
              </div>
            </section>
          ) : null}
          {historySection}
        </div>
      </div>
    );
  } else if (props.arrival.kind === 'begin') {
    work = (
      <div className="fr-home fr-home-begin">
        <div className="fr-home-field" data-field="room">
          {deleteNoticeEl}
          <section className="fr-home-anchor fr-home-threshold" data-field="anchor">
            <h1 className="fr-home-welcome">{HOME_COPY.beginWelcome}</h1>
            {!beginning ? (
              <div className="fr-home-actions">
                <button type="button" className="fr-home-primary" onClick={() => setBeginning(true)}>Start writing</button>
                <button type="button" className="fr-home-quiet" onClick={props.onImport}>Import writing</button>
                <button type="button" className="fr-home-quiet" onClick={props.onSources}>Bring notes &amp; sources</button>
              </div>
            ) : (
              <div className="p4r1-home-begin-form">
                <label htmlFor="p4r1-work-title">Give it a name, or leave it blank for now.</label>
                <div>
                  <input id="p4r1-work-title" autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !props.busy) props.onBegin(title); if (e.key === 'Escape') setBeginning(false); }} />
                  <button type="button" className="fr-home-primary" disabled={props.busy} onClick={() => props.onBegin(title)}>
                    {props.busy ? 'Beginning…' : 'Start writing'}
                  </button>
                  <button type="button" className="fr-home-quiet" onClick={() => setBeginning(false)}>Cancel</button>
                </div>
              </div>
            )}
            <p className="fr-home-trust">{HOME_COPY.trust}</p>
            {props.error ? <p className="p4r1-error">{props.error}</p> : null}
          </section>
        </div>
      </div>
    );
  } else if (props.arrival.kind === 'continue' && props.arrival.resume) {
    work = (
      <div className="fr-home fr-home-returning">
        <div className="fr-home-field" data-field="room">
          {deleteNoticeEl}
          <WorkAnchor
            key={props.arrival.resume.id}
            work={props.arrival.resume}
            manuscripts={props.manuscripts}
            activity={props.resumeActivity}
            onOpen={props.onOpen}
            onStartWriting={props.onStartWriting}
            busy={props.busy}
            allWorks={props.works}
            onDeleteWork={props.onDeleteWork}
            onRemoveWork={props.onRemoveWork}
            onDeletionNotice={showNotice}
            doorFor={doorFor}
          />
          {unclaimedWriting}
          {creationControls}
          {props.arrival.alsoWritten.length > 0 ? (
            <section className="fr-home-region">
              <p className="fr-home-eyebrow">Also written</p>
              <div className="fr-home-shelf">
                {props.arrival.alsoWritten.map((item) => (
                  <WorkShelfCard
                    key={item.id}
                    work={item}
                    manuscripts={props.manuscripts}
                    onOpen={props.onOpen}
                    onStartWriting={props.onStartWriting}
                    onDeleteWork={props.onDeleteWork}
                    onRemoveWork={props.onRemoveWork}
                    onDeletionNotice={showNotice}
                    doorFor={doorFor}
                    allWorks={props.works}
                    busy={props.busy}
                  />
                ))}
              </div>
            </section>
          ) : null}
          {/* The rest of the writer's Works. arrivalFor() puts every Work beyond
              the three most recently written (and every Work with no authored
              writing yet, such as an import) in `shelf`; this layout rendered
              none of it, so a saved import was invisible on Home. */}
          {props.arrival.shelf.length > 0 ? (
            <section className="fr-home-region" aria-label="Your other Works" data-home-shelf>
              <p className="fr-home-eyebrow">Your other Works</p>
              <div className="fr-home-shelf">
                {props.arrival.shelf.map((item) => (
                  <WorkShelfCard
                    key={item.id}
                    work={item}
                    manuscripts={props.manuscripts}
                    onOpen={props.onOpen}
                    onStartWriting={props.onStartWriting}
                    onDeleteWork={props.onDeleteWork}
                    onRemoveWork={props.onRemoveWork}
                    onDeletionNotice={showNotice}
                    doorFor={doorFor}
                    allWorks={props.works}
                    busy={props.busy}
                  />
                ))}
              </div>
            </section>
          ) : null}
          {historySection}
        </div>
      </div>
    );
  } else if (unclaimed.length > 0) {
    work = (
      <div className="fr-home fr-home-unclaimed">
        <div className="fr-home-field" data-field="room">
          {deleteNoticeEl}
          <p className="fr-home-here">{HOME_COPY.writingHere}</p>
          <div className="fr-home-writing-list">
            {unclaimed.map((manuscript) => (
              <WritingCard key={manuscript.id} manuscript={manuscript} works={props.works}
                onOpen={(id) => props.onOpen(id)} onMakeWork={props.onMakeWork} onAddToWork={props.onAddToWork}
            onAskDelete={(id) => { setDeleteError(null); setConfirmingDelete(id); }} deletion={deletionFor(manuscript.id)} />
            ))}
          </div>
          {creationControls}
          {props.works.length > 0 ? (
            <section className="fr-home-region">
              <p className="fr-home-eyebrow">Your Works</p>
              <div className="fr-home-shelf">
                {props.works.map((item) => (
                  <WorkShelfCard
                    key={item.id}
                    work={item}
                    manuscripts={props.manuscripts}
                    onOpen={props.onOpen}
                    onStartWriting={props.onStartWriting}
                    onDeleteWork={props.onDeleteWork}
                    onRemoveWork={props.onRemoveWork}
                    onDeletionNotice={showNotice}
                    doorFor={doorFor}
                    allWorks={props.works}
                    busy={props.busy}
                  />
                ))}
              </div>
            </section>
          ) : null}
          {historySection}
        </div>
      </div>
    );
  } else {
    work = (
      <div className="fr-home fr-home-many">
        <div className="fr-home-field" data-field="room">
          {deleteNoticeEl}
          <section className="fr-home-region">
            <p className="fr-home-eyebrow">Your Works</p>
            <div className="fr-home-shelf fr-home-shelf-4">
              {props.works.map((item) => (
                <WorkShelfCard
                  key={item.id}
                  work={item}
                  manuscripts={props.manuscripts}
                  onOpen={props.onOpen}
                  onStartWriting={props.onStartWriting}
                  onDeleteWork={props.onDeleteWork}
                  onRemoveWork={props.onRemoveWork}
                  onDeletionNotice={showNotice}
                  doorFor={doorFor}
                  allWorks={props.works}
                  busy={props.busy}
                />
              ))}
            </div>
          </section>
          {creationControls}
          {historySection}
        </div>
      </div>
    );
  }

  // A writer who chooses New Work enters a quiet threshold, not a form
  // squeezed beside the Work they just left. Home data stays available and
  // reappears on Cancel; no manuscript is modified or silently reselected.
  if (beginning && props.arrival.kind !== 'begin') {
    work = (
      <div className="fr-home fr-home-new-work">
        <div className="fr-home-field" data-field="room">
          {creationControls}
        </div>
      </div>
    );
  }

  if (viewingHistory) {
    return (
      <Shell
        mode="home"
        appearance={props.appearance}
        geometry={HOME_GEOMETRY}
        memberInitial=""
        onSelectMode={(mode) => { if (mode === 'home') setViewingHistory(false); else props.onMode(mode); }}
        work={
          <P4R1HistoryContainer
            manuscripts={props.manuscripts}
            works={props.works}
            onOpen={(id) => props.onOpen(id)}
            onDeleteWriting={props.onDeleteWriting}
            noticeStack={noticeStack}
            onBack={() => setViewingHistory(false)}
          />
        }
      />
    );
  }

  return (
    <Shell
      mode="home"
      appearance={props.appearance}
      geometry={HOME_GEOMETRY}
      memberInitial=""
      onSelectMode={props.onMode}
      work={work}
    />
  );
}

function ManuscriptChooser({
  manuscripts,
  heading = 'Choose a manuscript',
  onChoose,
}: {
  manuscripts: readonly CurrentManuscript[];
  heading?: string;
  onChoose: (manuscriptId: string) => void;
}) {
  if (manuscripts.length < 2) return null;

  return (
    <div className="mt-4" data-manuscript-choice="">
      <p className="text-[13px] opacity-55 mb-2">{heading}</p>
      <ul className="grid gap-2 max-w-xl" aria-label={heading}>
        {manuscripts.map((manuscript) => (
          <li key={manuscript.id}>
            <button
              type="button"
              onClick={() => onChoose(manuscript.id)}
              className="block w-full text-left px-4 py-3 border border-current rounded-[2px] opacity-75 hover:opacity-100 transition-opacity"
            >
              {manuscript.title?.trim() || 'Untitled manuscript'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
