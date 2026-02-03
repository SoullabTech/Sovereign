'use client';

import { useState } from 'react';

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function RlmFileViewer(props: {
  filePath: string | null;
  content: string | null;
  truncated?: boolean;
  startLine?: number;
  highlight?: string;
  onClose?: () => void;
}) {
  const { filePath, content, truncated, startLine = 1, highlight } = props;

  if (!filePath) return null;

  const terms = (highlight ?? '')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3)
    .slice(0, 8);

  const re =
    terms.length > 0
      ? new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'ig')
      : null;

  const lines = (content ?? '').split('\n');

  const [copiedLine, setCopiedLine] = useState<number | null>(null);

  async function copyLineRef(lineNo: number, lineText: string, withText: boolean) {
    if (!filePath) return;

    const ref = `${filePath}:${lineNo}`;
    const payload = withText ? `${ref}\n${lineText}` : ref;

    await navigator.clipboard.writeText(payload);
    setCopiedLine(lineNo);
    window.setTimeout(() => setCopiedLine(null), 900);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <div className="text-xs text-white/60 font-mono truncate">
          {filePath}
          {truncated ? <span className="ml-2 text-white/40">(truncated)</span> : null}
        </div>
      </div>

      {!content ? (
        <div className="p-3 text-sm text-white/50">Loading...</div>
      ) : (
        <div className="p-3 overflow-auto max-h-[60vh]">
          <pre className="text-xs leading-5 text-white/80 font-mono whitespace-pre">
            {lines.map((line, i) => {
              const n = startLine + i;
              const parts = re ? line.split(re) : [line];

              return (
                <div key={i} className="flex gap-3">
                  <button
                    type="button"
                    title="Copy path:line (Shift-click copies line text too)"
                    onClick={(e) => {
                      void copyLineRef(n, line, e.shiftKey);
                    }}
                    className="w-10 shrink-0 text-right text-white/30 select-none hover:text-white/70 cursor-copy"
                  >
                    {copiedLine === n ? '✓' : n}
                  </button>
                  <span className="min-w-0">
                    {parts.map((p, j) => {
                      const isHit = re ? re.test(p) : false;
                      // reset lastIndex side effects since we used re.test
                      if (re) re.lastIndex = 0;

                      return isHit ? (
                        <mark
                          key={j}
                          className="rounded px-0.5 bg-amber-500/20 text-amber-100"
                        >
                          {p}
                        </mark>
                      ) : (
                        <span key={j}>{p}</span>
                      );
                    })}
                  </span>
                </div>
              );
            })}
          </pre>
        </div>
      )}
    </div>
  );
}
