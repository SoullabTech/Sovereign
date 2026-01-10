'use client';

export function RlmFileViewer(props: {
  filePath: string | null;
  content: string | null;
  truncated?: boolean;
  onClose?: () => void;
}) {
  const { filePath, content, truncated, onClose } = props;

  if (!filePath) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-white/50">Open file</div>
          <div className="truncate text-sm font-semibold text-white">
            {filePath}
          </div>
          {truncated ? (
            <div className="text-xs text-amber-200/70">
              Showing first chunk (truncated)
            </div>
          ) : null}
        </div>

        {onClose ? (
          <button
            onClick={onClose}
            className="rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-xs text-white/70 hover:bg-white/10"
          >
            Close
          </button>
        ) : null}
      </div>

      <pre className="max-h-[60vh] overflow-auto rounded-lg border border-white/10 bg-black/40 p-3 text-xs text-white/80">
        {content ?? 'Loading...'}
      </pre>
    </div>
  );
}
