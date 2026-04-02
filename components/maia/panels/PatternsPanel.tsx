'use client';

/**
 * PatternsPanel — Right panel content for the Patterns world
 *
 * Shows: pattern threads, archetypal journey link, weaving visualization link.
 * These were previously scattered across drawer items and query params.
 */

import { useRouter } from 'next/navigation';
import { Sparkles, Compass, Eye } from 'lucide-react';

interface PatternsPanelProps {
  explorerId: string;
}

export function PatternsPanel({ explorerId }: PatternsPanelProps) {
  const router = useRouter();

  const items = [
    {
      icon: Compass,
      label: 'Archetypal Journey',
      description: 'Your cosmic spiral & elemental blueprint',
      action: () => router.push('/journey'),
    },
    {
      icon: Sparkles,
      label: 'Weaving Visualization',
      description: 'Watch your wisdom threads unfold',
      action: () => router.push('/maia?panel=journey'),
    },
    {
      icon: Eye,
      label: 'Your Cosmos',
      description: 'Songlines & soul signature',
      action: () => router.push('/labtools/songlines'),
    },
  ];

  return (
    <div className="space-y-3">
      <p className="text-xs text-stone-500 font-light mb-4">
        Recurring themes and archetypal patterns from your conversations.
      </p>

      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.label}
            onClick={item.action}
            className="w-full flex items-start gap-3 p-3 rounded-xl bg-[#D4B896]/5 hover:bg-[#D4B896]/10 border border-[#3a2a1f]/30 hover:border-[#D4B896]/20 transition-all text-left"
          >
            <Icon className="w-4 h-4 text-[#D4B896]/60 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-[#D4B896]/90 font-light">{item.label}</p>
              <p className="text-xs text-stone-500 mt-0.5">{item.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
