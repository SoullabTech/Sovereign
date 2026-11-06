'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * The page's notices: messages the member must still hear after the card or line that raised them is gone (the re-read an act runs
 * can remove it before the act reports). One stack serves Home and History, so a message raised on one is still there when the
 * member moves to the other. A later notice never replaces an earlier one the member has not dismissed, and each is dismissed on
 * its own.
 */
export interface Notice { readonly id: number; readonly message: string; readonly urgent: boolean }

export interface NoticeStack {
  readonly notices: ReadonlyArray<Notice>;
  /** `urgent` (the default) is announced at once (a custody message); otherwise it is a polite status. */
  readonly notify: (message: string, urgent?: boolean) => void;
  readonly dismiss: (id: number) => void;
  readonly ref: React.MutableRefObject<HTMLDivElement | null>;
}

export function useNoticeStack(): NoticeStack {
  const [notices, setNotices] = useState<ReadonlyArray<Notice>>([]);
  const nextId = useRef(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const notify = useCallback((message: string, urgent = true) => {
    nextId.current += 1;
    const id = nextId.current;
    setNotices((current) => [...current, { id, message, urgent }]);
  }, []);
  const dismiss = useCallback((id: number) => setNotices((current) => current.filter((n) => n.id !== id)), []);
  // The card the member pressed is gone by the time this is shown, and the page may be long: bring the newest message into view.
  useEffect(() => { if (notices.length > 0) ref.current?.scrollIntoView?.({ block: 'nearest' }); }, [notices.length]);
  return { notices, notify, dismiss, ref };
}

export function NoticeList({ stack }: { stack: NoticeStack }) {
  if (stack.notices.length === 0) return null;
  return (
    <div ref={stack.ref} data-delete-notices>
      {stack.notices.map((notice) => (
        <p key={notice.id} role={notice.urgent ? 'alert' : 'status'} className="p4r1-home-delete-notice" data-delete-notice>
          {notice.message} <button type="button" onClick={() => stack.dismiss(notice.id)}>Dismiss</button>
        </p>
      ))}
    </div>
  );
}
