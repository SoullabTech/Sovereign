'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

/**
 * What is held for the member that is not part of a Work, and the door to remove it (D3).
 *
 * An upload that never finished, or an original that was stored but never attached to a Work, sits in the member's
 * custody with nothing on screen that says so. This lists those items and lets the member remove each one. It is the
 * member's own removal right over what is held for them, so it does not depend on the intake hold, the pilot roster or
 * Sanctuary: the routes behind it are not gated on any of them, and this component is mounted whenever the room is a
 * real (server) session rather than a local review.
 *
 * It says what happened and never more. A removal the server could not fully finish is reported as STARTED, not as
 * done; a failure is reported as a failure. Nothing here renders file contents: the only member-authored string is the
 * filename of an original the member themselves uploaded, shown as escaped text.
 */

export const UNFINISHED_UPLOADS_COPY = {
  heading: 'Held for you, not in a Work',
  intro: 'These files were uploaded but never became part of a Work. They are stored encrypted, and only you can remove them. Anything already saved in a Work is not affected.',
  unlabeled: 'Unfinished upload',
  kind: {
    incomplete: 'Upload that did not finish',
    unclaimed: 'Original not attached to a Work',
  },
  remove: 'Remove',
  confirmQuestion: 'Remove this from storage?',
  confirmBody: 'The stored file, and any text read from it, will be deleted. This cannot be undone. Your Works are not changed.',
  confirm: 'Remove permanently',
  keep: 'Keep it',
  working: 'Removing…',
  removed: 'Removed. The stored file and any text read from it have been deleted.',
  pending: 'Removal started. Your record is gone, but the stored copy is not yet confirmed deleted. It stays queued and will finish on its own.',
  gone: 'That item was already gone.',
  inProgress: 'This upload may still be finishing. Try again in about ten minutes.',
  alreadyRecorded: 'This upload finished while you were looking. It now appears as an original not attached to a Work.',
  attached: 'That original belongs to a Work. It is removed when you delete the Work.',
  failed: 'We could not confirm the removal, so nothing is reported as deleted. Try again.',
  unavailable: 'We could not check for unfinished uploads just now.',
} as const;

type Kind = 'incomplete' | 'unclaimed';
type Item = { id: string; kind: Kind; createdAt: string; filename: string | null; bytes: number | null };
type Tone = 'status' | 'alert';
type Notice = { tone: Tone; text: string };
type Load = 'loading' | 'ready' | 'unavailable';

function isItem(value: unknown): value is Item {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === 'string' && (v.kind === 'incomplete' || v.kind === 'unclaimed') &&
    typeof v.createdAt === 'string' && (v.filename === null || typeof v.filename === 'string') &&
    (v.bytes === null || typeof v.bytes === 'number');
}

function sizeOf(bytes: number | null): string | null {
  if (bytes === null || !Number.isFinite(bytes) || bytes < 0) return null;
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function dayOf(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export default function P4R1UnfinishedUploads() {
  const [items, setItems] = useState<Item[]>([]);
  const [load, setLoad] = useState<Load>('loading');
  const [confirming, setConfirming] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const inFlightRef = useRef(false);
  const aliveRef = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const response = await apiFetch('/api/sovereign/manuscripts/unfinished-uploads', { method: 'GET' });
      if (!aliveRef.current) return;
      if (!response.ok) { setLoad('unavailable'); return; }
      const body: unknown = await response.json().catch(() => null);
      const raw = body && typeof body === 'object' ? (body as { items?: unknown }).items : null;
      if (!Array.isArray(raw)) { setLoad('unavailable'); return; }
      setItems(raw.filter(isItem));
      setLoad('ready');
    } catch {
      if (aliveRef.current) setLoad('unavailable');
    }
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    void refresh();
    return () => { aliveRef.current = false; };
  }, [refresh]);

  const discard = useCallback(async (item: Item) => {
    if (inFlightRef.current) return; // a double press must never send two removals
    inFlightRef.current = true;
    setBusyId(item.id);
    setNotice(null);
    const drop = () => setItems((current) => current.filter((x) => x.id !== item.id));
    try {
      const response = await apiFetch('/api/sovereign/manuscripts/unfinished-uploads/discard', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: item.id, kind: item.kind }),
      });
      const body: unknown = await response.json().catch(() => null);
      const result = body && typeof body === 'object' ? (body as { result?: unknown }).result : null;
      if (!aliveRef.current) return;
      if (response.status === 200 && result === 'removed') { drop(); setNotice({ tone: 'status', text: UNFINISHED_UPLOADS_COPY.removed }); }
      else if (response.status === 202 && result === 'removal_pending') { drop(); setNotice({ tone: 'status', text: UNFINISHED_UPLOADS_COPY.pending }); }
      else if (response.status === 404 && result === 'not_found') { drop(); setNotice({ tone: 'status', text: UNFINISHED_UPLOADS_COPY.gone }); }
      else if (response.status === 409 && result === 'in_progress') { setNotice({ tone: 'alert', text: UNFINISHED_UPLOADS_COPY.inProgress }); }
      else if (response.status === 409 && result === 'already_recorded') { setNotice({ tone: 'status', text: UNFINISHED_UPLOADS_COPY.alreadyRecorded }); await refresh(); }
      else if (response.status === 409 && result === 'attached_to_work') { setNotice({ tone: 'status', text: UNFINISHED_UPLOADS_COPY.attached }); await refresh(); }
      else setNotice({ tone: 'alert', text: UNFINISHED_UPLOADS_COPY.failed });
    } catch {
      if (aliveRef.current) setNotice({ tone: 'alert', text: UNFINISHED_UPLOADS_COPY.failed });
    } finally {
      inFlightRef.current = false;
      if (aliveRef.current) { setBusyId(null); setConfirming(null); }
    }
  }, [refresh]);

  // Say nothing when there is nothing to say: no item, no outcome to report, and no failure to admit.
  if (load === 'loading') return null;
  if (load === 'ready' && items.length === 0 && !notice) return null;

  return (
    <section className="p4r1-import-unfinished" data-unfinished-uploads aria-labelledby="p4r1-unfinished-heading">
      {load === 'unavailable' ? (
        <p role="status" className="p4r1-import-unfinished-note">{UNFINISHED_UPLOADS_COPY.unavailable}</p>
      ) : (
        <>
          {items.length > 0 ? (
            <>
              <h2 id="p4r1-unfinished-heading">{UNFINISHED_UPLOADS_COPY.heading}</h2>
              <p>{UNFINISHED_UPLOADS_COPY.intro}</p>
              <ul>
                {items.map((item) => {
                  const label = item.filename ?? UNFINISHED_UPLOADS_COPY.unlabeled;
                  const detail = [UNFINISHED_UPLOADS_COPY.kind[item.kind], sizeOf(item.bytes), dayOf(item.createdAt)].filter(Boolean).join(' · ');
                  const busy = busyId === item.id;
                  return (
                    <li key={item.id} data-item-kind={item.kind}>
                      <div>
                        <b>{label}</b>
                        <span>{detail}</span>
                      </div>
                      {confirming === item.id ? (
                        <div role="alertdialog" aria-label={`${UNFINISHED_UPLOADS_COPY.confirmQuestion} ${label}`} className="p4r1-import-unfinished-confirm">
                          <p><b>{UNFINISHED_UPLOADS_COPY.confirmQuestion}</b> {UNFINISHED_UPLOADS_COPY.confirmBody}</p>
                          <div>
                            <button type="button" disabled={busy} onClick={() => void discard(item)}>
                              {busy ? UNFINISHED_UPLOADS_COPY.working : UNFINISHED_UPLOADS_COPY.confirm}
                            </button>
                            <button type="button" disabled={busy} onClick={() => setConfirming(null)} autoFocus>
                              {UNFINISHED_UPLOADS_COPY.keep}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button type="button" disabled={busyId !== null} aria-label={`${UNFINISHED_UPLOADS_COPY.remove} ${label}`}
                          onClick={() => { setNotice(null); setConfirming(item.id); }}>
                          {UNFINISHED_UPLOADS_COPY.remove}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          ) : null}
          {notice ? (
            <p role={notice.tone} className={`p4r1-import-unfinished-note${notice.tone === 'alert' ? ' p4r1-import-unfinished-error' : ''}`}>
              {notice.text}
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}
