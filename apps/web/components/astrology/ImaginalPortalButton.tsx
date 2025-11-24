'use client';

/**
 * Imaginal Portal Button
 *
 * Gateway from the house hover panel into active imagination dialogue
 */

import { Circle } from 'lucide-react';

export interface ImaginalPortalButtonProps {
  onOpen: () => void;
  disabled?: boolean;
}

export function ImaginalPortalButton({
  onOpen,
  disabled = false,
}: ImaginalPortalButtonProps) {
  return (
    <button
      onClick={onOpen}
      disabled={disabled}
      className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-orange-950/30 border border-orange-800/40 px-4 py-2.5 text-orange-300/90 hover:text-orange-200 hover:border-orange-700/60 hover:bg-orange-950/40 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
      title="Enter the Chamber"
    >
      <Circle className="w-4 h-4" strokeWidth={1.5} />
      <span className="text-sm font-serif tracking-wide">Enter Chamber</span>
    </button>
  );
}
