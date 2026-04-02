'use client';

/**
 * DepthPanel — Right panel for the Depth world
 *
 * The meaning well. Shadow work, oracle consultation, consciousness map.
 * Lightweight and contextual — not a full feature surface yet.
 */

import { useRouter } from 'next/navigation';
import { Moon, Hexagon, Compass, Layers } from 'lucide-react';

interface DepthPanelProps {
  explorerId: string;
  onOpenShadowWork: () => void;
}

export function DepthPanel({ explorerId, onOpenShadowWork }: DepthPanelProps) {
  const router = useRouter();

  return (
    <div className="space-y-3">
      <p className="text-xs text-stone-500 font-light mb-4">
        The meaning well. Symbolic exploration and depth work.
      </p>

      {/* Shadow Work */}
      <button
        onClick={onOpenShadowWork}
        className="w-full flex items-start gap-3 p-3 rounded-xl bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/30 transition-all text-left"
      >
        <Moon className="w-4 h-4 text-purple-400/70 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-purple-300/90 font-light">Shadow Work</p>
          <p className="text-xs text-stone-500 mt-0.5">Guided depth exploration</p>
        </div>
      </button>

      {/* Oracle Consultation */}
      <button
        onClick={() => router.push('/oracle')}
        className="w-full flex items-start gap-3 p-3 rounded-xl bg-[#D4B896]/5 hover:bg-[#D4B896]/10 border border-[#3a2a1f]/30 hover:border-[#D4B896]/20 transition-all text-left"
      >
        <Hexagon className="w-4 h-4 text-[#D4B896]/60 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-[#D4B896]/90 font-light">Oracle Consultation</p>
          <p className="text-xs text-stone-500 mt-0.5">Intuitive guidance and insight</p>
        </div>
      </button>

      {/* I Ching */}
      <button
        onClick={() => router.push('/oracle/iching?return=/maia')}
        className="w-full flex items-start gap-3 p-3 rounded-xl bg-[#D4B896]/5 hover:bg-[#D4B896]/10 border border-[#3a2a1f]/30 hover:border-[#D4B896]/20 transition-all text-left"
      >
        <Layers className="w-4 h-4 text-[#D4B896]/60 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-[#D4B896]/90 font-light">I Ching</p>
          <p className="text-xs text-stone-500 mt-0.5">Ancient wisdom, living guidance</p>
        </div>
      </button>

      {/* Consciousness Map */}
      <button
        onClick={() => router.push('/labtools/field-protocol')}
        className="w-full flex items-start gap-3 p-3 rounded-xl bg-[#D4B896]/5 hover:bg-[#D4B896]/10 border border-[#3a2a1f]/30 hover:border-[#D4B896]/20 transition-all text-left"
      >
        <Compass className="w-4 h-4 text-[#D4B896]/60 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-[#D4B896]/90 font-light">Consciousness Map</p>
          <p className="text-xs text-stone-500 mt-0.5">Field protocol and awareness terrain</p>
        </div>
      </button>
    </div>
  );
}
