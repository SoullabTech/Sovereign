'use client';

/**
 * RelationshipsPanel — Right panel for the Relationships world
 *
 * Relational awareness. Threads of connection that have surfaced in conversation.
 * Lightweight — the relational field is felt, not managed.
 */

import { useRouter } from 'next/navigation';
import { Heart, Users, GitFork } from 'lucide-react';

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
        onClick={() => router.push('/dashboard/relationships')}
        className="w-full flex items-start gap-3 p-3 rounded-xl bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/30 transition-all text-left"
      >
        <Heart className="w-4 h-4 text-rose-400/70 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-rose-300/90 font-light">Relational Field</p>
          <p className="text-xs text-stone-500 mt-0.5">People and patterns in your life</p>
        </div>
      </button>

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

      {/* Future: relationship threads will appear here */}
      <div className="pt-4 text-center">
        <GitFork className="w-4 h-4 text-stone-600 mx-auto mb-1" />
        <p className="text-[10px] text-stone-600 font-light">
          Relational threads will surface as they emerge in conversation
        </p>
      </div>
    </div>
  );
}
