'use client';

import { motion } from 'framer-motion';
import { Droplets, Sprout, DoorOpen, Merge, Zap, Sun } from 'lucide-react';

interface ChangeLandscapeVisualProps {
  onSelect: (changeType: string) => void;
  onBack: () => void;
}

const CHANGE_TYPES = [
  {
    type: 'dissolution',
    icon: Droplets,
    label: 'Dissolution',
    description: 'Something is dissolving or ending',
    color: 'from-blue-500/20 to-blue-600/20',
    borderColor: 'border-blue-500/40',
    iconColor: 'text-blue-400',
  },
  {
    type: 'emergence',
    icon: Sprout,
    label: 'Emergence',
    description: 'Something new is rising',
    color: 'from-cyan-500/20 to-cyan-600/20',
    borderColor: 'border-cyan-500/40',
    iconColor: 'text-cyan-400',
  },
  {
    type: 'threshold',
    icon: DoorOpen,
    label: 'Threshold',
    description: 'You're at a crossing point',
    color: 'from-purple-500/20 to-purple-600/20',
    borderColor: 'border-purple-500/40',
    iconColor: 'text-purple-400',
  },
  {
    type: 'integration',
    icon: Merge,
    label: 'Integration',
    description: 'Things coming together',
    color: 'from-emerald-500/20 to-emerald-600/20',
    borderColor: 'border-emerald-500/40',
    iconColor: 'text-emerald-400',
  },
  {
    type: 'upheaval',
    icon: Zap,
    label: 'Upheaval',
    description: 'Ground is shaking',
    color: 'from-red-500/20 to-red-600/20',
    borderColor: 'border-red-500/40',
    iconColor: 'text-red-400',
  },
  {
    type: 'ripening',
    icon: Sun,
    label: 'Ripening',
    description: 'Something reaching fullness',
    color: 'from-amber-500/20 to-amber-600/20',
    borderColor: 'border-amber-500/40',
    iconColor: 'text-amber-400',
  },
];

export default function ChangeLandscapeVisual({
  onSelect,
  onBack,
}: ChangeLandscapeVisualProps) {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-xl font-medium text-white">
          What kind of change is this?
        </h3>
        <p className="text-stone-400 text-sm">
          Choose what feels closest. This will shape how MAIA reflects with you.
        </p>
      </div>

      {/* Change Type Cards */}
      <div className="grid grid-cols-1 gap-3">
        {CHANGE_TYPES.map((changeType, index) => {
          const Icon = changeType.icon;

          return (
            <motion.button
              key={changeType.type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(changeType.type)}
              className={`p-4 bg-gradient-to-r ${changeType.color} border ${changeType.borderColor} rounded-xl text-left hover:scale-[1.02] transition-all`}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Icon className={`w-6 h-6 ${changeType.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium mb-0.5">
                    {changeType.label}
                  </h4>
                  <p className="text-stone-400 text-sm">
                    {changeType.description}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Helper Text */}
      <p className="text-center text-xs text-stone-500 leading-relaxed">
        You can change this later. Trust your first instinct.
      </p>
    </div>
  );
}
