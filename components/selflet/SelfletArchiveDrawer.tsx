'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { X } from 'lucide-react';

type ArchivedMessage = {
  id: string;
  messageType: string;
  title?: string;
  content: string;
  relevanceThemes?: string[];
  createdAt: string;
  archivedAt: string;
  archivedReason?: string;
};

type ArchiveResponse = {
  ok: boolean;
  items: ArchivedMessage[];
  nextCursor: string | null;
  error?: string;
};

function labelForType(t?: string | null) {
  if (!t) return 'Past Self';
  if (t === 'letter') return 'Letter';
  if (t === 'wisdom_seed') return 'Wisdom Seed';
  if (t === 'symbolic_state') return 'Symbolic State';
  if (t === 'future_projection') return 'Future Projection';
  return 'Past Self';
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function ArchivedCard({ message }: { message: ArchivedMessage }) {
  const [expanded, setExpanded] = useState(false);
  const preview =
    message.content.length > 120
      ? message.content.slice(0, 117) + '...'
      : message.content;
  const hasMore = message.content.length > 120 || message.content.includes('\n');

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="inline-block rounded-full bg-amber-200/60 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-800/40 dark:text-amber-200">
          {labelForType(message.messageType)}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(message.archivedAt)}
        </span>
      </div>

      {/* Title */}
      {message.title && (
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          {message.title}
        </div>
      )}

      {/* Content */}
      <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        {expanded ? (
          <div className="whitespace-pre-wrap">{message.content}</div>
        ) : (
          <span>{preview}</span>
        )}
      </div>

      {/* Expand/Collapse */}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs font-medium text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 transition-colors"
          aria-expanded={expanded}
        >
          {expanded ? '▲ Show less' : '▼ Read more'}
        </button>
      )}

      {/* Relevance Themes */}
      {message.relevanceThemes && message.relevanceThemes.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {message.relevanceThemes.map((theme) => (
            <span
              key={theme}
              className="inline-block rounded-full bg-gray-200/60 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700/60 dark:text-gray-300"
            >
              {theme}
            </span>
          ))}
        </div>
      )}

      {/* Archive reason */}
      {message.archivedReason && message.archivedReason !== 'card_archive' && (
        <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          Reason: {message.archivedReason}
        </div>
      )}
    </div>
  );
}

interface SelfletArchiveDrawerProps {
  open: boolean;
  onClose: () => void;
  userId?: string;
}

export function SelfletArchiveDrawer({ open, onClose, userId }: SelfletArchiveDrawerProps) {
  const [items, setItems] = useState<ArchivedMessage[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArchive = useCallback(async (cursor?: string) => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ userId });
      if (cursor) params.set('cursor', cursor);

      const resp = await fetch(`/api/selflet/archive?${params}`);
      const data = (await resp.json()) as ArchiveResponse;

      if (!resp.ok || !data.ok) {
        setError(data.error || 'Failed to load archive');
        setLoading(false);
        return;
      }

      if (cursor) {
        setItems((prev) => [...prev, ...data.items]);
      } else {
        setItems(data.items);
      }
      setNextCursor(data.nextCursor);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load on open
  useEffect(() => {
    if (open && userId) {
      fetchArchive();
    }
  }, [open, userId, fetchArchive]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setItems([]);
      setNextCursor(null);
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Close archive drawer"
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Archived Messages
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Past-self messages you've dismissed
            </p>
          </div>
          <button
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Error state */}
          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
              {error}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && items.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📭</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                No archived messages yet
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Messages you dismiss will appear here
              </div>
            </div>
          )}

          {/* Message list */}
          {items.map((msg) => (
            <ArchivedCard key={msg.id} message={msg} />
          ))}

          {/* Load more */}
          {nextCursor && (
            <button
              className="w-full py-2 text-sm font-medium text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 transition-colors disabled:opacity-50"
              onClick={() => fetchArchive(nextCursor)}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load more'}
            </button>
          )}

          {/* Loading indicator (initial) */}
          {loading && items.length === 0 && (
            <div className="text-center py-12 text-sm text-gray-500 dark:text-gray-400">
              Loading...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
