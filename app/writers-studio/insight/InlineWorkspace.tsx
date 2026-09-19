'use client';
import { useLayoutEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './insight.css';

/** A stable portal keeps the conversation and unsaved draft mounted when its
 * manuscript anchor moves, collapses, or is temporarily outside the chapter. */
export default function InlineWorkspace({ anchor, open, children }: {
  anchor: HTMLElement | null; open: boolean; children: ReactNode;
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
  return host ? createPortal(children, host) : null;
}
