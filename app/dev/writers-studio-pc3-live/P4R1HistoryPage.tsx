'use client';

import { useState } from 'react';
import type { StudioAct } from '@/app/writers-studio/studioHistory';
import { beneath, byDay, sentenceFor } from '@/app/writers-studio/studioHistory';
import { historyActionFor } from '@/app/writers-studio/historyActions';
import { useStudioHistory, type StudioHistoryPhase } from '@/app/writers-studio/useStudioHistory';
import type { LivingWork } from '@/app/writers-studio/useLivingWorks';
import type { CurrentManuscript } from '@/app/writers-studio/useCurrentManuscript';
import { DeletionNotice, DeletionSharedMaterial, DeletionUnconfirmed, deleteConfirmCopy, type ActResult } from '@/lib/writersStudio/deleteWork';
import { WritingDeleteConfirm } from './WritingDeleteConfirm';
import { writingDeleteKindFor } from './useWorkDeleteDoor';
import { NoticeList, useNoticeStack, type NoticeStack } from './useNoticeStack';

/** The route's own ceiling (MAX_LIMIT in /api/sovereign/studio/history). */
export const FULL_HISTORY_LIMIT = 300;

export interface P4R1HistoryPageProps {
  phase: StudioHistoryPhase;
  acts: readonly StudioAct[];
  manuscripts: readonly CurrentManuscript[];
  works: readonly LivingWork[];
  onOpen: (manuscriptId: string) => void;
  /** The same governed erase Home uses. Rejects with a member-facing message; resolves only when the server said ok. */
  onDeleteWriting: (manuscriptId: string) => Promise<ActResult | void>;
  onRetry: () => void;
  onBack: () => void;
  /** The page's notices, when the page lives inside Home (its stack outlives this view, so Back to Home loses nothing). Standalone, the page keeps its own. */
  noticeStack?: NoticeStack;
}

/**
 * HISTORY, in full. Acts grouped under dates, in the order they happened, in
 * the same words Home uses. A date gathers acts; nothing here summarizes them.
 *
 * A line is actionable only while its subject is still held (historyActionFor).
 * Delete means the writing itself is deleted — there is no hide, and success is
 * never shown before the server has said so.
 */
export function P4R1HistoryPage(props: P4R1HistoryPageProps) {
  const [confirming, setConfirming] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Page notices, in order, each naming its writing: a second never replaces a first the member has not dismissed.
  const ownStack = useNoticeStack();
  const stack = props.noticeStack ?? ownStack;
  const notify = stack.notify;

  const lines = props.acts.filter((a) => sentenceFor(a) !== null);
  const days = byDay(lines as StudioAct[]);

  const confirmDelete = async (manuscriptId: string, writing: string) => {
    if (busyId) return;
    setBusyId(manuscriptId);
    setError(null);
    try {
      const result = await props.onDeleteWriting(manuscriptId);
      setConfirming(null);
      if (result && !result.refreshed) notify(`“${writing}” was deleted. We could not reload this page, so reload it to see what is current.`, false);
    } catch (err) {
      // The line this question lives on may be gone by now (the re-read the act ran removed the writing, or put it into a Work),
      // so anything the member must still hear goes to the page, not to a dialog that may no longer exist.
      if (err instanceof DeletionUnconfirmed) {
        setConfirming(null);
        notify(`“${writing}”: ${err.message}`, true);
      } else if (err instanceof DeletionNotice || err instanceof DeletionSharedMaterial) {
        setConfirming(null);
        notify(`“${writing}”: ${err.message}`, false);
      } else {
        setError(err instanceof Error ? err.message : 'That writing could not be deleted just now. Nothing was removed. Please try again.');
      }
    } finally {
      setBusyId(null);
    }
  };

  let body: React.ReactNode;
  if (props.phase === 'loading') {
    body = <p className="fr-home-facts">Opening your history…</p>;
  } else if (props.phase === 'unauthorized') {
    body = <p className="fr-home-facts">Sign in to see your history.</p>;
  } else if (props.phase === 'error') {
    body = (
      <p className="fr-home-facts" role="alert">
        Your history could not be read just now. Try again to see what is current.{' '}
        <button type="button" className="fr-home-quiet" onClick={props.onRetry}>Try again</button>
      </p>
    );
  } else if (days.length === 0) {
    body = <p className="fr-home-facts">Nothing has been recorded yet.</p>;
  } else {
    body = days.map((day) => (
      <section key={day.key} className="p4r1-history-day" aria-label={day.label}>
        <p className="fr-home-eyebrow">{day.label}</p>
        <ol className="p4r1-history-acts">
          {day.acts.map((act) => {
            const action = historyActionFor(act, props.manuscripts, props.works);
            const second = beneath(act);
            if (action.kind === 'open_delete' && confirming === action.manuscriptId) {
              // Say what THIS deletion reaches: a Work that held only this writing goes with it.
              const words = deleteConfirmCopy(writingDeleteKindFor(action.manuscriptId, props.works), action.title);
              return (
                <li key={act.id} className="p4r1-history-act" data-deleting-confirmation>
                  <WritingDeleteConfirm
                    title={action.title}
                    question={words.question}
                    body={words.body}
                    busy={busyId === action.manuscriptId}
                    error={error}
                    onConfirm={() => void confirmDelete(action.manuscriptId, action.title)}
                    onCancel={() => { if (!busyId) { setConfirming(null); setError(null); } }}
                  />
                </li>
              );
            }
            return (
              <li key={act.id} className="p4r1-history-act">
                <div className="p4r1-history-act-text">
                  <span>{sentenceFor(act)}</span>
                  {second ? <span className="p4r1-history-act-beneath">{second}</span> : null}
                </div>
                {action.kind !== 'none' ? (
                  <div className="fr-home-actions">
                    <button type="button" className="fr-home-quiet" onClick={() => props.onOpen(action.manuscriptId)}>
                      Open writing
                    </button>
                    {action.kind === 'open_delete' ? (
                      <button
                        type="button"
                        className="fr-home-quiet p4r1-home-delete-open"
                        onClick={() => { setConfirming(action.manuscriptId); setError(null); }}
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                ) : null}
                {action.kind === 'open' && action.why === 'shared' ? (
                  <span className="p4r1-history-act-beneath">
                    This writing is in {action.sharedBy} of your Works, so it cannot be deleted from here. On Home, press Delete on one of those Works and, when asked, choose “Remove this Work”. Repeat until one Work holds it, then delete it.
                  </span>
                ) : null}
                {action.kind === 'open' && action.why === 'several-writings' ? (
                  <span className="p4r1-history-act-beneath">
                    This writing is in a Work that holds more than one writing, so it cannot be deleted from here. On Home, press Remove on that Work: that removes the Work and what you built inside it, and deletes none of its writings. Then delete this writing.
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
      </section>
    ));
  }

  return (
    <div className="fr-home p4r1-history-page">
      <div className="fr-home-field" data-field="room">
        <div className="fr-home-actions">
          <button type="button" className="fr-home-quiet" onClick={props.onBack}>← Back to Home</button>
        </div>
        <h2 className="p4r1-history-title">History</h2>
        <NoticeList stack={stack} />
        {body}
      </div>
    </div>
  );
}

/** Reads up to the route's maximum and reloads after a deletion, so the page shows what the server now holds. */
export function P4R1HistoryContainer(props: Omit<P4R1HistoryPageProps, 'phase' | 'acts' | 'onRetry' | 'onDeleteWriting'> & {
  onDeleteWriting: (manuscriptId: string) => Promise<ActResult | void>;
}) {
  const { phase, acts, reload } = useStudioHistory(FULL_HISTORY_LIMIT);
  return (
    <P4R1HistoryPage
      {...props}
      phase={phase}
      acts={acts}
      onRetry={() => void reload()}
      onDeleteWriting={async (id) => {
        let result: ActResult | void;
        try {
          result = await props.onDeleteWriting(id);
        } catch (err) {
          // Removed-but-unconfirmed also throws; the list must still be re-read.
          await reload();
          throw err;
        }
        const read = await reload();
        // This page's own list is part of what "reloaded" means: when it could not be read, the page may still list the writing.
        return result && !read ? { ...result, refreshed: false } : result;
      }}
    />
  );
}
