'use client';

/**
 * ChangeLandscape — Visual Change Type Selector
 *
 * Shows the 6 change types as selectable cards with icons and descriptions.
 * Selected card has amber border highlight.
 */

import { Droplets, Sprout, DoorOpen, Merge, Zap, Sun } from 'lucide-react';
import type { ChangeTypeName } from '@/lib/studio/changes/changeTypes';

interface ChangeLandscapeProps {
  selected: ChangeTypeName | null;
  onSelect: (type: ChangeTypeName) => void;
}

const CHANGE_TYPES: Array<{
  type: ChangeTypeName;
  icon: typeof Droplets;
  color: string;
  label: string;
  description: string;
}> = [
  {
    type: 'dissolution',
    icon: Droplets,
    color: 'text-blue-400',
    label: 'Dissolution',
    description: 'Something ending, falling apart, being released.',
  },
  {
    type: 'emergence',
    icon: Sprout,
    color: 'text-cyan-400',
    label: 'Emergence',
    description: 'Something new forming, not yet clear.',
  },
  {
    type: 'threshold',
    icon: DoorOpen,
    color: 'text-purple-400',
    label: 'Threshold',
    description: 'Standing at a crossing point, before and after.',
  },
  {
    type: 'integration',
    icon: Merge,
    color: 'text-emerald-400',
    label: 'Integration',
    description: 'Bringing disparate parts together after disruption.',
  },
  {
    type: 'upheaval',
    icon: Zap,
    color: 'text-red-400',
    label: 'Upheaval',
    description: 'Forced change, external disruption, loss of ground.',
  },
  {
    type: 'ripening',
    icon: Sun,
    color: 'text-amber-400',
    label: 'Ripening',
    description: 'Slow change becoming undeniable, timing arriving.',
  },
];

export default function ChangeLandscape({ selected, onSelect }: ChangeLandscapeProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {CHANGE_TYPES.map(({ type, icon: Icon, color, label, description }) => {
        const isSelected = selected === type;
        return (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className={`p-4 rounded-lg border transition-all text-left ${
              isSelected
                ? 'border-amber-500/50 bg-amber-950/20 ring-1 ring-amber-500/30'
                : 'border-slate-800/60 bg-slate-900/30 hover:border-slate-700/70'
            }`}
          >
            <div className="flex items-start gap-3">
              <Icon className={`w-5 h-5 ${color} mt-0.5 flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-slate-200 mb-1">{label}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
