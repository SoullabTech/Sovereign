'use client';

import React, { useMemo, useState } from 'react';

export type PastSelfPayload = {
  id: string;
  title?: string | null;
  messageType?: string | null;
  content: string;
  relevanceThemes?: string[] | null;
};

type ActionResp =
  | { ok: true; messageId: string; action: 'snooze'; snoozedUntil?: string | null }
  | { ok: true; messageId: string; action: 'archive' }
  | { ok: false; messageId?: string; action?: string; error?: string };

function labelForType(t?: string | null) {
  if (!t) return 'Past Self';
  if (t === 'letter') return 'Letter from Past Self';
  if (t === 'wisdom_seed') return 'Seed of Wisdom';
  if (t === 'symbolic_state') return 'Symbolic State';
  if (t === 'future_projection') return 'Future Projection';
  return 'Past Self';
}

interface PastSelfCardProps {
  pastSelf: PastSelfPayload;
  userId?: string; // Required for dev mode API calls
}

export default function PastSelfCard({ pastSelf, userId }: PastSelfCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [working, setWorking] = useState<'snooze' | 'archive' | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snoozeMinutes, setSnoozeMinutes] = useState<number>(60 * 24); // default: 24h

  const preview = useMemo(() => {
    if (!pastSelf.content) return '';
    const lines = pastSelf.content.split('\n').filter(Boolean);
    if (lines.length === 0) return '';
    const firstLine = lines[0];
    return firstLine.length > 80 ? firstLine.slice(0, 77) + '...' : firstLine;
  }, [pastSelf.content]);

  const hasMore = pastSelf.content.length > 80 || pastSelf.content.includes('\n');

  async function doAction(action: 'snooze' | 'archive') {
    try {
      setError(null);
      setWorking(action);

      const resp = await fetch('/api/selflet/action', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          messageId: pastSelf.id,
          action,
          snoozeMinutes: action === 'snooze' ? snoozeMinutes : undefined,
          userId, // For dev mode
        }),
      });

      const data = (await resp.json()) as ActionResp;

      if (!resp.ok || !data?.ok) {
        setError((data as { error?: string })?.error || 'Action failed');
        setWorking(null);
        return;
      }

      // Hide card after success
      setDismissed(true);
    } catch {
      setError('Network error');
      setWorking(null);
    }
  }

  if (dismissed) return null;

  return (
    <div
      className="mb-4 rounded-xl border border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-orange-50/60 p-4 shadow-sm dark:border-amber-700/40 dark:from-amber-950/30 dark:to-orange-950/20"
      role="region"
      aria-label={labelForType(pastSelf.messageType)}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg" role="img" aria-label="hourglass">
            ⏳
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-amber-700 dark:text-amber-400">
            {labelForType(pastSelf.messageType)}
          </span>
          {pastSelf.title && (
            <span className="text-sm font-medium text-amber-900 dark:text-amber-200">
              — {pastSelf.title}
            </span>
          )}
        </div>

        {/* Phase 2J: Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            className="rounded-lg border border-amber-300/50 bg-amber-50/50 px-2 py-1 text-xs text-amber-800 dark:border-amber-600/30 dark:bg-amber-900/30 dark:text-amber-200"
            value={snoozeMinutes}
            onChange={(e) => setSnoozeMinutes(Number(e.target.value))}
            disabled={!!working}
            aria-label="Snooze duration"
          >
            <option value={10}>10m</option>
            <option value={60}>1h</option>
            <option value={60 * 24}>1d</option>
            <option value={60 * 24 * 7}>7d</option>
          </select>

          <button
            className="rounded-lg border border-amber-300/50 bg-amber-100/50 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-200/50 disabled:opacity-50 dark:border-amber-600/30 dark:bg-amber-800/30 dark:text-amber-200 dark:hover:bg-amber-700/40 transition-colors"
            onClick={() => doAction('snooze')}
            disabled={!!working}
            title="Snooze - resurface later"
          >
            {working === 'snooze' ? '...' : '⏰'}
          </button>

          <button
            className="rounded-lg border border-red-300/50 bg-red-100/30 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-200/50 disabled:opacity-50 dark:border-red-600/30 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-800/30 transition-colors"
            onClick={() => doAction('archive')}
            disabled={!!working}
            title="Archive - never show again"
          >
            {working === 'archive' ? '...' : '✕'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="text-sm text-amber-900/90 dark:text-amber-100/90 leading-relaxed">
        {expanded ? (
          <div className="whitespace-pre-wrap">{pastSelf.content}</div>
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
          {expanded ? '▲ Show less' : '▼ Read full message'}
        </button>
      )}

      {/* Relevance Themes */}
      {pastSelf.relevanceThemes && pastSelf.relevanceThemes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {pastSelf.relevanceThemes.map((theme) => (
            <span
              key={theme}
              className="inline-block rounded-full bg-amber-200/60 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-800/40 dark:text-amber-200"
            >
              {theme}
            </span>
          ))}
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mt-2 text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
