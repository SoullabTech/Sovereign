'use client';

/**
 * JournalPanel — Right panel content for the Journal world
 *
 * Shows: quick capture trigger, reflections link, scribe sessions link.
 * These were previously in the drawer under KNOWLEDGE BASE section.
 */

import { useRouter } from 'next/navigation';
import { PenLine, BookOpen, Sparkles, Moon, Compass, Waves } from 'lucide-react';

interface JournalPanelProps {
  explorerId: string;
  onOpenJournalSheet: () => void;
  onOpenShadowWork: () => void;
}

export function JournalPanel({ explorerId, onOpenJournalSheet, onOpenShadowWork }: JournalPanelProps) {
  const router = useRouter();

  return (
    <div className="space-y-3">
      <p className="text-xs text-stone-500 font-light mb-4">
        Capture, reflect, and track your inner life.
      </p>

      {/* Quick Capture — opens journal sheet */}
      <button
        onClick={onOpenJournalSheet}
        className="w-full flex items-start gap-3 p-3 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/30 transition-all text-left"
      >
        <PenLine className="w-4 h-4 text-amber-400/70 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-amber-300/90 font-light">Quick Capture</p>
          <p className="text-xs text-stone-500 mt-0.5">Journal entry, dream, or thought</p>
        </div>
      </button>

      {/* Reflections */}
      <button
        onClick={() => router.push('/reflections')}
        className="w-full flex items-start gap-3 p-3 rounded-xl bg-[#D4B896]/5 hover:bg-[#D4B896]/10 border border-[#3a2a1f]/30 hover:border-[#D4B896]/20 transition-all text-left"
      >
        <Sparkles className="w-4 h-4 text-[#D4B896]/60 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-[#D4B896]/90 font-light">Reflections</p>
          <p className="text-xs text-stone-500 mt-0.5">Your distilled moments and insights</p>
        </div>
      </button>

      {/* Full Journal — the member route, not the founder-gated Lab Tools one */}
      <button
        onClick={() => router.push('/journal')}
        className="w-full flex items-start gap-3 p-3 rounded-xl bg-[#D4B896]/5 hover:bg-[#D4B896]/10 border border-[#3a2a1f]/30 hover:border-[#D4B896]/20 transition-all text-left"
      >
        <BookOpen className="w-4 h-4 text-[#D4B896]/60 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-[#D4B896]/90 font-light">All Entries</p>
          <p className="text-xs text-stone-500 mt-0.5">Captures, journals, and scribe sessions</p>
        </div>
      </button>

      {/* Shadow Work */}
      <button
        onClick={onOpenShadowWork}
        className="w-full flex items-start gap-3 p-3 rounded-xl bg-[#D4B896]/5 hover:bg-[#D4B896]/10 border border-[#3a2a1f]/30 hover:border-[#D4B896]/20 transition-all text-left"
      >
        <Moon className="w-4 h-4 text-[#D4B896]/60 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-[#D4B896]/90 font-light">Shadow Work</p>
          <p className="text-xs text-stone-500 mt-0.5">Guided depth exploration</p>
        </div>
      </button>

      {/* Decisions */}
      <button
        onClick={() => router.push('/studio/decisions')}
        className="w-full flex items-start gap-3 p-3 rounded-xl bg-[#D4B896]/5 hover:bg-[#D4B896]/10 border border-[#3a2a1f]/30 hover:border-[#D4B896]/20 transition-all text-left"
      >
        <Compass className="w-4 h-4 text-[#D4B896]/60 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-[#D4B896]/90 font-light">Decisions</p>
          <p className="text-xs text-stone-500 mt-0.5">Choices you are weighing</p>
        </div>
      </button>

      {/* Changes */}
      <button
        onClick={() => router.push('/studio/changes')}
        className="w-full flex items-start gap-3 p-3 rounded-xl bg-[#D4B896]/5 hover:bg-[#D4B896]/10 border border-[#3a2a1f]/30 hover:border-[#D4B896]/20 transition-all text-left"
      >
        <Waves className="w-4 h-4 text-[#D4B896]/60 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-[#D4B896]/90 font-light">Changes</p>
          <p className="text-xs text-stone-500 mt-0.5">Shifts you are tracking</p>
        </div>
      </button>
    </div>
  );
}
