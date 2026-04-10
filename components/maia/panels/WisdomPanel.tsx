'use client';

/**
 * WisdomPanel — Right panel content for the Wisdom world
 *
 * Shows: sacred texts, wisdom council, academy, personal library, deep research.
 * These were previously scattered across drawer (WISDOM COUNCIL, KNOWLEDGE BASE)
 * and account bottom sheet (Library, Wisdom Keepers).
 */

import { useRouter } from 'next/navigation';
import { Library, Scroll, GraduationCap, Sparkles, BookOpen, Search } from 'lucide-react';

interface WisdomPanelProps {
  explorerId: string;
  onOpenAcademy: () => void;
  onChooseGuide: () => void;
  onShowCurrentElder: () => void;
}

export function WisdomPanel({ explorerId, onOpenAcademy, onChooseGuide, onShowCurrentElder }: WisdomPanelProps) {
  const router = useRouter();

  return (
    <div className="space-y-3">
      <p className="text-xs text-stone-500 font-light mb-4">
        Sacred texts, wisdom traditions, and guided learning.
      </p>

      {/* Sacred Texts */}
      <button
        onClick={() => router.push('/wisdom-keepers/wisdom')}
        className="w-full flex items-start gap-3 p-3 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/30 transition-all text-left"
      >
        <Scroll className="w-4 h-4 text-amber-400/70 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-amber-300/90 font-light">Sacred Texts</p>
          <p className="text-xs text-stone-500 mt-0.5">Wisdom Keepers library</p>
        </div>
      </button>

      {/* Choose Your Guide */}
      <button
        onClick={onChooseGuide}
        className="w-full flex items-start gap-3 p-3 rounded-xl bg-[#D4B896]/5 hover:bg-[#D4B896]/10 border border-[#3a2a1f]/30 hover:border-[#D4B896]/20 transition-all text-left"
      >
        <Sparkles className="w-4 h-4 text-[#D4B896]/60 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-[#D4B896]/90 font-light">Choose Your Guide</p>
          <p className="text-xs text-stone-500 mt-0.5">39 wisdom traditions as harmonic frequencies</p>
        </div>
      </button>

      {/* Current Teaching */}
      <button
        onClick={onShowCurrentElder}
        className="w-full flex items-start gap-3 p-3 rounded-xl bg-[#D4B896]/5 hover:bg-[#D4B896]/10 border border-[#3a2a1f]/30 hover:border-[#D4B896]/20 transition-all text-left"
      >
        <BookOpen className="w-4 h-4 text-[#D4B896]/60 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-[#D4B896]/90 font-light">Current Teaching</p>
          <p className="text-xs text-stone-500 mt-0.5">See which wisdom guides you now</p>
        </div>
      </button>

      {/* Academy */}
      <button
        onClick={onOpenAcademy}
        className="w-full flex items-start gap-3 p-3 rounded-xl bg-[#D4B896]/5 hover:bg-[#D4B896]/10 border border-[#3a2a1f]/30 hover:border-[#D4B896]/20 transition-all text-left"
      >
        <GraduationCap className="w-4 h-4 text-[#D4B896]/60 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-[#D4B896]/90 font-light">Soullab Academy</p>
          <p className="text-xs text-stone-500 mt-0.5">Guided learning paths & wisdom domains</p>
        </div>
      </button>

      {/* Personal Library */}
      <button
        onClick={() => router.push('/library')}
        className="w-full flex items-start gap-3 p-3 rounded-xl bg-[#D4B896]/5 hover:bg-[#D4B896]/10 border border-[#3a2a1f]/30 hover:border-[#D4B896]/20 transition-all text-left"
      >
        <Library className="w-4 h-4 text-[#D4B896]/60 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-[#D4B896]/90 font-light">Personal Library</p>
          <p className="text-xs text-stone-500 mt-0.5">Your curated knowledge collection</p>
        </div>
      </button>

      {/* Deep Research */}
      <button
        onClick={() => router.push('/maia/library')}
        className="w-full flex items-start gap-3 p-3 rounded-xl bg-[#D4B896]/5 hover:bg-[#D4B896]/10 border border-[#3a2a1f]/30 hover:border-[#D4B896]/20 transition-all text-left"
      >
        <Search className="w-4 h-4 text-[#D4B896]/60 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-[#D4B896]/90 font-light">Deep Research</p>
          <p className="text-xs text-stone-500 mt-0.5">Explore across your wisdom library</p>
        </div>
      </button>
    </div>
  );
}
