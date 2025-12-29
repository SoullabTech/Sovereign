'use client';

import React, { useMemo, useState } from 'react';

export type PastSelfPayload = {
  id: string;
  title?: string | null;
  messageType?: string | null;
  content: string;
  relevanceThemes?: string[] | null;
};

function labelForType(t?: string | null) {
  if (!t) return 'Past Self';
  if (t === 'letter') return 'Letter from Past Self';
  if (t === 'wisdom_seed') return 'Seed of Wisdom';
  if (t === 'symbolic_state') return 'Symbolic State';
  if (t === 'future_projection') return 'Future Projection';
  return 'Past Self';
}

export default function PastSelfCard({ pastSelf }: { pastSelf: PastSelfPayload }) {
  const [expanded, setExpanded] = useState(false);

  const preview = useMemo(() => {
    if (!pastSelf.content) return '';
    const lines = pastSelf.content.split('\n').filter(Boolean);
    if (lines.length === 0) return '';
    // Show first line as preview, truncate if needed
    const firstLine = lines[0];
    return firstLine.length > 80 ? firstLine.slice(0, 77) + '...' : firstLine;
  }, [pastSelf.content]);

  const hasMore = pastSelf.content.length > 80 || pastSelf.content.includes('\n');

  return (
    <div
      className="mb-4 rounded-xl border border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-orange-50/60 p-4 shadow-sm dark:border-amber-700/40 dark:from-amber-950/30 dark:to-orange-950/20"
      role="region"
      aria-label={labelForType(pastSelf.messageType)}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
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
    </div>
  );
}
