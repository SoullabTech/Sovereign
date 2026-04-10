'use client';

/**
 * IdeasPanel — Right panel for the Ideas world
 *
 * Generative emergence. A place for thoughts that are forming but not yet structured.
 * Intentionally sparse — this world is about open space, not density.
 */

import { Lightbulb, Sparkles } from 'lucide-react';

interface IdeasPanelProps {
  explorerId: string;
}

export function IdeasPanel({ explorerId }: IdeasPanelProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-stone-500 font-light mb-4">
        Thoughts that are forming. Not yet structured — just emerging.
      </p>

      {/* Capture prompt */}
      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 text-center">
        <Lightbulb className="w-5 h-5 text-amber-400/50 mx-auto mb-2" />
        <p className="text-sm text-amber-300/70 font-light">
          Speak your thoughts freely.
        </p>
        <p className="text-xs text-stone-500 mt-1">
          MAIA can capture ideas as they surface during conversation.
        </p>
      </div>

      {/* Future: idea cards will appear here as MAIA detects generative moments */}
      <div className="pt-4 text-center">
        <Sparkles className="w-4 h-4 text-stone-600 mx-auto mb-1" />
        <p className="text-[10px] text-stone-600 font-light">
          Ideas will gather here as they emerge
        </p>
      </div>
    </div>
  );
}
