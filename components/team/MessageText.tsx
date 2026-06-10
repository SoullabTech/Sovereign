'use client';

import { Fragment } from 'react';
import { parseMessageSegments } from '@/lib/team/linkify';

/**
 * Renders a chat message body with clickable links. Bare URLs are auto-linkified
 * and `[label](url)` produces a named link. Everything else stays plain text — we
 * deliberately do NOT render full markdown, so existing messages look unchanged.
 *
 * Emits inline nodes only (text + <a>), so it is safe to drop inside the existing
 * <p className="whitespace-pre-wrap">, which preserves the message's line breaks.
 */
export function MessageText({ body }: { body: string }) {
  const segments = parseMessageSegments(body);
  return (
    <>
      {segments.map((seg, i) =>
        seg.type === 'link' ? (
          <a
            key={i}
            href={seg.href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            onClick={e => e.stopPropagation()}
            className="text-amber-300/90 underline decoration-amber-300/30 underline-offset-2 hover:text-amber-200 hover:decoration-amber-200/60 break-all transition-colors"
          >
            {seg.value}
          </a>
        ) : (
          <Fragment key={i}>{seg.value}</Fragment>
        )
      )}
    </>
  );
}
