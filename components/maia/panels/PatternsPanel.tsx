'use client';

/**
 * PatternsPanel — Right panel content for the Patterns world
 *
 * Surfaces recurring themes and archetypal patterns from conversations.
 * The Archetypal Journey, Weaving Visualization, and Cosmos entries were
 * unlinked on 2026-04-09 because their target routes were broken. The
 * underlying components still exist and can be re-wired once stable.
 */

interface PatternsPanelProps {
  explorerId: string;
}

export function PatternsPanel({ explorerId }: PatternsPanelProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-stone-500 font-light mb-4">
        Recurring themes and archetypal patterns from your conversations.
      </p>

      <div className="p-4 rounded-xl bg-[#D4B896]/5 border border-[#3a2a1f]/30">
        <p className="text-sm text-[#D4B896]/80 font-light">
          Pattern views are being refined.
        </p>
        <p className="text-xs text-stone-500 mt-2 leading-relaxed">
          We're rebuilding how your archetypal patterns surface here so they reflect
          what's actually forming across your conversations. Check back soon.
        </p>
      </div>
    </div>
  );
}
