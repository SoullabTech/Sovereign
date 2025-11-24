// frontend
// apps/web/components/ui/SacredLabDrawer.tsx

'use client';

import React from 'react';

export interface SacredLabDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
  children?: React.ReactNode;
}

/**
 * Temporary stub for the Lab drawer MAIA opens from the Book icon.
 * Just enough so OracleConversation can render without blowing up.
 */
const SacredLabDrawer: React.FC<SacredLabDrawerProps> = ({
  isOpen = false,
  onClose,
  title = 'Sacred Lab',
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="flex-1 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div className="w-full max-w-md bg-zinc-950/95 border-l border-amber-500/30 shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-amber-500/20">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-amber-200">
            {title}
          </h2>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-amber-200/70 hover:text-amber-100"
            >
              Close
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 text-sm text-amber-50/80">
          {children ?? (
            <p className="opacity-80">
              Lab tools will live here. For now, this is a placeholder so MAIA
              can open the drawer without errors.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SacredLabDrawer;
export { SacredLabDrawer };