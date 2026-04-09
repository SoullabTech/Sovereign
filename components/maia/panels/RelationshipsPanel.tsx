'use client';

/**
 * RelationshipsPanel — Right panel for the Relationships world
 *
 * Relational awareness. Threads of connection that have surfaced in conversation.
 * Lightweight — the relational field is felt, not managed.
 */

import { useRouter } from 'next/navigation';
import { Activity, Heart, Users, Waves, Wind } from 'lucide-react';

interface RelationshipsPanelProps {
  explorerId: string;
}

export function RelationshipsPanel({ explorerId }: RelationshipsPanelProps) {
  const router = useRouter();

  return (
    <div className="space-y-3">
      <p className="text-xs text-stone-500 font-light mb-4">
        Relational threads and patterns from your conversations.
      </p>

      {/* Relational overview */}
      <button
        onClick={() => router.push('/relationships')}
        className="w-full flex items-start gap-3 p-3 rounded-xl bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/30 transition-all text-left"
      >
        <Heart className="w-4 h-4 text-rose-400/70 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-rose-300/90 font-light">Relational Field</p>
          <p className="text-xs text-stone-500 mt-0.5">Outer and inner relationships, made visible</p>
        </div>
      </button>

      {/* Relational tools — scaffolds drawn from attested traditions */}
      <div className="pt-2 pb-1">
        <p className="text-[10px] text-stone-600 uppercase tracking-wider font-light mb-2 px-1">
          Relational Tools
        </p>
        <div className="space-y-1.5">
          <button
            onClick={() => router.push('/labtools/relational-field')}
            className="w-full flex items-start gap-2.5 p-2.5 rounded-lg bg-rose-500/[0.03] hover:bg-rose-500/[0.08] border border-rose-500/10 hover:border-rose-500/20 transition-all text-left"
          >
            <Waves className="w-3.5 h-3.5 text-rose-300/60 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-rose-200/80 font-light">Sense the field</p>
              <p className="text-[10px] text-stone-600 truncate">Tone in a bond, right now</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/labtools/dynamics-map')}
            className="w-full flex items-start gap-2.5 p-2.5 rounded-lg bg-rose-500/[0.03] hover:bg-rose-500/[0.08] border border-rose-500/10 hover:border-rose-500/20 transition-all text-left"
          >
            <Activity className="w-3.5 h-3.5 text-rose-300/60 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-rose-200/80 font-light">Map the dynamic</p>
              <p className="text-[10px] text-stone-600 truncate">Patterns, not identities</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/labtools/repair-path')}
            className="w-full flex items-start gap-2.5 p-2.5 rounded-lg bg-rose-500/[0.03] hover:bg-rose-500/[0.08] border border-rose-500/10 hover:border-rose-500/20 transition-all text-left"
          >
            <Wind className="w-3.5 h-3.5 text-rose-300/60 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-rose-200/80 font-light">Repair path</p>
              <p className="text-[10px] text-stone-600 truncate">Possible moves after rupture</p>
            </div>
          </button>
        </div>
      </div>

      {/* Community */}
      <button
        onClick={() => router.push('/commons/circles')}
        className="w-full flex items-start gap-3 p-3 rounded-xl bg-[#D4B896]/5 hover:bg-[#D4B896]/10 border border-[#3a2a1f]/30 hover:border-[#D4B896]/20 transition-all text-left"
      >
        <Users className="w-4 h-4 text-[#D4B896]/60 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-[#D4B896]/90 font-light">Community Circles</p>
          <p className="text-xs text-stone-500 mt-0.5">Shared spaces and collective work</p>
        </div>
      </button>

      {/* Guidance */}
      <div className="pt-4 text-center">
        <p className="text-[10px] text-stone-600 font-light">
          Tools draw from IFS, Bowen, polyvagal, Gottman, NVC, EFT.
        </p>
      </div>
    </div>
  );
}
