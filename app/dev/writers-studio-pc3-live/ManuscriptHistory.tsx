'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { apiFetch } from '@/lib/http/apiBase';
import { loadRevisions, formatWhen, type RevisionSummary } from '@/app/press/manuscript/workingDraftClient';
import { keepHistoryVersion, restoreHistoryVersion } from '@/lib/writersStudio/historyActions';
import type { SectionWriting } from '@/lib/writersStudio/useSectionWriting';
import { useStudioTopbarAccessoriesHost } from '../writers-studio-p4r1/useStudioTopbarAccessoriesHost';
import styles from './ManuscriptHistory.module.css';

export default function ManuscriptHistory({manuscriptId, writing, restoreBlockedReason, actionBlocked, onRestored}: {
  manuscriptId: string; writing: SectionWriting; restoreBlockedReason: string | null;
  actionBlocked: boolean; onRestored: () => void;
}) {
  const host = useStudioTopbarAccessoriesHost();
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<RevisionSummary[] | null>(null);
  const [selected, setSelected] = useState<RevisionSummary | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const running = useRef(false), generation = useRef(0), alive = useRef(true);
  const latest = useRef({writing, restoreBlockedReason, actionBlocked, onRestored});
  latest.current = {writing, restoreBlockedReason, actionBlocked, onRestored};
  useEffect(() => {alive.current = true; return () => {alive.current = false; generation.current += 1;};}, [manuscriptId]);

  async function readHistory() {
    const at = ++generation.current;
    setRows(null);
    const result = await loadRevisions(apiFetch, manuscriptId);
    if (at !== generation.current || !alive.current) return;
    if (result.kind === 'ok') setRows(result.revisions);
    else setMessage('History could not be read. This is not an empty history; your writing has not been replaced.');
  }
  useEffect(() => {
    const node = dialog.current;
    if (!node || !open) return;
    node.showModal();
    void readHistory();
    return () => {node.close();};
  }, [open, manuscriptId]);
  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => {if (running.current) {event.preventDefault(); event.returnValue = '';}};
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, []);

  const close = () => {if (running.current) return; generation.current += 1; setOpen(false); setSelected(null);};
  async function act(kind: 'keep' | 'restore') {
    if (running.current || latest.current.actionBlocked) return;
    const target = selected;
    if (kind === 'restore' && (!target || latest.current.restoreBlockedReason)) return;
    running.current = true; setBusy(true); setMessage('');
    try {
      if (kind === 'keep') {
        const result = await keepHistoryVersion(apiFetch, manuscriptId, latest.current.writing);
        if (!alive.current) return;
        setMessage(result.acknowledged ? 'Version kept. Your manuscript and editorial drafts remain open.'
          : 'Version kept. Reopen after saving your local drafts before another history action.');
        await readHistory();
      } else {
        await restoreHistoryVersion(apiFetch, manuscriptId, latest.current.writing, target!, () =>
          !alive.current ? 'The history window was left. Restore was not sent.' : latest.current.actionBlocked ? 'Another writing action is still running.' : latest.current.restoreBlockedReason);
        if (!alive.current) return;
        // The modal kept the editing surface inert. Refuse a reload if unexpected local work appeared.
        if (latest.current.writing.hasUnsavedWork() || latest.current.restoreBlockedReason) {
          setMessage('The server restored the version, but local work appeared. It is still held here; no reload was performed.');
          return;
        }
        running.current = false;
        latest.current.onRestored();
      }
    } catch (error) {
      if (alive.current) setMessage(error instanceof Error ? error.message : 'The history action could not be confirmed. No automatic retry was made.');
    } finally {running.current = false; if (alive.current) setBusy(false);}
  }
  if (!host) return null;
  return createPortal(<>
    <button type="button" className={styles.trigger} onClick={() => {setMessage('');setSelected(null);setOpen(true);}}
      aria-haspopup="dialog">History</button>
    {open && <dialog ref={dialog} className={styles.dialog} aria-labelledby="manuscript-history-title"
      onCancel={event => {event.preventDefault(); close();}}>
      <header className={styles.header}>
        <div><span className={styles.eyebrow}>Whole-manuscript versions</span><h2 id="manuscript-history-title">Manuscript history</h2></div>
        <button type="button" disabled={busy} onClick={close} aria-label="Close manuscript history">Close</button>
      </header>
      <p className={styles.intro}>Keep a snapshot of your complete writing. Passage alternatives and MAIA conversations remain separate. Opening this window does not save or restore anything.</p>
      <div className={styles.actions}>
        <button type="button" disabled={busy || actionBlocked} onClick={() => void act('keep')}>Keep a version</button>
        <button type="button" disabled={busy} onClick={() => {setMessage('');void readHistory();}}>Refresh history</button>
      </div>
      {message && <p role="status" className={styles.notice}>{message}</p>}
      {restoreBlockedReason && <p className={styles.notice}>{restoreBlockedReason} You can still view history and keep a manuscript snapshot.</p>}
      {selected && <section className={styles.confirm} aria-label="Confirm manuscript restore">
        <h3>Restore version {selected.revisionNumber}?</h3>
        <p>Your current saved manuscript will first be kept as another version. Then this exact snapshot will be restored and the writing reopened. Earlier versions and saved passage alternatives are not deleted.</p>
        <button type="button" disabled={busy || actionBlocked || !!restoreBlockedReason} onClick={() => void act('restore')}>Keep current and restore version {selected.revisionNumber}</button>
        <button type="button" disabled={busy} onClick={() => setSelected(null)}>Cancel restore</button>
      </section>}
      {rows === null ? <p>{message ? 'History is unavailable.' : 'Reading kept versions…'}</p> : rows.length === 0 ? <p>No versions have been kept yet.</p> :
        <ol className={styles.versions} aria-label="Kept manuscript versions">{rows.map(row => <li key={row.revisionNumber}>
          <div><strong>Version {row.revisionNumber}</strong><span>{row.note || 'Kept manuscript snapshot'}</span><small>{formatWhen(row.createdAt)} · {row.contentChars.toLocaleString()} characters</small>
          {!row.restorable && <small>Section boundaries were not recorded; this version cannot be restored here.</small>}</div>
          <button type="button" disabled={busy || actionBlocked || !row.restorable || !!restoreBlockedReason}
            onClick={() => setSelected(row)} aria-label={'Restore version '+row.revisionNumber}>Restore…</button>
        </li>)}</ol>}
    </dialog>}
  </>, host);
}
