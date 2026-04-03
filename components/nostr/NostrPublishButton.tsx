'use client';

/**
 * NOSTR PUBLISH BUTTON
 *
 * "Release to Nostr" — appears on publishable content.
 * Opens NostrPublishModal for consent preview before publishing.
 *
 * This is sovereign expression, not social sharing.
 * Language: "Release this reflection" — not "Post" or "Share".
 */

import { useState } from 'react';
import { Radio } from 'lucide-react';
import { NostrPublishModal } from './NostrPublishModal';
import type { PublishContentType } from '@/lib/nostr/memberPublish';

interface NostrPublishButtonProps {
  memberId: string;
  content: string;
  contentType: PublishContentType;
  /** Optional label override */
  label?: string;
  /** Compact mode — icon only */
  compact?: boolean;
}

export function NostrPublishButton({
  memberId,
  content,
  contentType,
  label,
  compact = false,
}: NostrPublishButtonProps) {
  const [showModal, setShowModal] = useState(false);

  // Check if member has a Nostr identity (privkey in localStorage)
  const hasIdentity = typeof window !== 'undefined' &&
    localStorage.getItem(`nostr_privkey_${memberId}`) !== null;

  if (!hasIdentity) return null;

  const defaultLabels: Record<PublishContentType, string> = {
    reflection: 'Release this reflection',
    journal: 'Release this entry',
    field_note: 'Release this note',
    insight: 'Release this insight',
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-1.5 text-violet-300/70 hover:text-violet-300
                    transition-colors ${compact ? 'p-1.5' : 'px-3 py-1.5 text-xs'}`}
        title={label ?? defaultLabels[contentType]}
      >
        <Radio className="w-3.5 h-3.5" />
        {!compact && <span>{label ?? defaultLabels[contentType]}</span>}
      </button>

      {showModal && (
        <NostrPublishModal
          memberId={memberId}
          content={content}
          contentType={contentType}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

export default NostrPublishButton;
