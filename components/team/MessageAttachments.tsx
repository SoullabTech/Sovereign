'use client';

import type { MessageAttachment } from '@/lib/team/types';

/**
 * Thumbnail grid for a message's image attachments. Thumbnails are CSS-scaled
 * originals (no server-side thumbnailing in v1); clicking opens the full image in a
 * new tab via the same conversation-scoped serve URL.
 */
export function MessageAttachments({ attachments }: { attachments?: MessageAttachment[] }) {
  if (!attachments || attachments.length === 0) return null;

  const images = attachments.filter(a => a.kind === 'image');
  if (images.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {images.map(att => (
        <a
          key={att.id}
          href={att.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
          title={att.filename}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={att.url}
            alt={att.filename}
            loading="lazy"
            className="max-h-48 max-w-[16rem] w-auto rounded-lg border border-white/10 object-cover hover:opacity-90 transition-opacity"
          />
        </a>
      ))}
    </div>
  );
}
