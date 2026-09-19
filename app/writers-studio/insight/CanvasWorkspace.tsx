'use client';
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import './insight.css';

/** Native modality leaves the manuscript mounted and inert. Children remain
 * mounted on close, preserving drafts and comparison controls on return. */
export default function CanvasWorkspace({ open, title, onClose, children, busy = false, style }: {
  open: boolean; title: string; onClose: () => void; children: ReactNode; busy?: boolean; style?: CSSProperties;
}) {
  const [expanded, setExpanded] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const returnTo = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) {
      returnTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      el.showModal();
    } else if (!open && el.open) {
      el.close();
      returnTo.current?.focus({ preventScroll: true });
    }
  }, [open]);
  return <dialog ref={dialog} className="ws-insight" data-expanded={expanded} style={style} aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
    <header className="wsi-header">
      <div><span className="wsi-eyebrow">Writer’s Studio · Work on canvas</span><h2 id={titleId}>{title}</h2></div>
      <div className="wsi-window-controls">
        <button type="button" aria-pressed={expanded} onClick={() => setExpanded(value => !value)}>{expanded ? 'Restore size' : 'Expand workspace'}</button>
        <button type="button" onClick={onClose} disabled={busy} autoFocus>Return to manuscript</button>
      </div>
    </header>
    <div className="wsi-scroll">{children}</div>
  </dialog>;
}
