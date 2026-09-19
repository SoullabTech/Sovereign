'use client';
import { useLayoutEffect, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './insight.css';

/** A stable portal keeps the conversation and unsaved draft mounted when its
 * manuscript anchor moves, collapses, or is temporarily outside the chapter. */
export default function InlineWorkspace({ anchor, open, children, revealKey }: {
  anchor: HTMLElement | null; open: boolean; children: ReactNode; revealKey?: string;
}) {
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    const node = document.createElement('div');
    node.className = 'ws-insight wsi-inline';
    setHost(node);
    return () => node.remove();
  }, []);
  useLayoutEffect(() => {
    if (!host) return;
    if (anchor) anchor.appendChild(host); else host.remove();
    host.hidden = !open || !anchor;
  }, [host, anchor, open]);
  const revealed = useRef<string | null>(null);
  useEffect(() => {
    if (!open) { revealed.current = null; return; }
    if (!host || !anchor || !revealKey || revealed.current === revealKey) return;
    // Wait for the manuscript's section jump and portal placement, then reveal
    // the actual conversation. Later replies must not steal the writer's scroll.
    const frame = requestAnimationFrame(() => {
      host.scrollIntoView({ block: 'center', behavior: 'auto' });
      revealed.current = revealKey;
    });
    return () => cancelAnimationFrame(frame);
  }, [host, anchor, open, revealKey]);
  return host ? createPortal(children, host) : null;
}
