'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Droplets, Sprout, DoorOpen, Merge, Zap, Sun } from 'lucide-react';

interface NameYourChangeProps {
  onNext: (title: string, description: string, changeType: string) => void;
  onBack: () => void;
  initialTitle?: string;
  initialDescription?: string;
  initialChangeType?: string;
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
    selectedRing: 'ring-blue-500/60',
  },
  {
    type: 'emergence',
    icon: Sprout,
    label: 'Emergence',
    description: 'Something new is rising',
    color: 'from-cyan-500/20 to-cyan-600/20',
    borderColor: 'border-cyan-500/40',
    iconColor: 'text-cyan-400',
    selectedRing: 'ring-cyan-500/60',
  },
  {
    type: 'threshold',
    icon: DoorOpen,
    label: 'Threshold',
    description: "You're at a crossing point",
    color: 'from-purple-500/20 to-purple-600/20',
    borderColor: 'border-purple-500/40',
    iconColor: 'text-purple-400',
    selectedRing: 'ring-purple-500/60',
  },
  {
    type: 'integration',
    icon: Merge,
    label: 'Integration',
    description: 'Things coming together',
    color: 'from-emerald-500/20 to-emerald-600/20',
    borderColor: 'border-emerald-500/40',
    iconColor: 'text-emerald-400',
    selectedRing: 'ring-emerald-500/60',
  },
  {
    type: 'upheaval',
    icon: Zap,
    label: 'Upheaval',
    description: 'Ground is shaking',
    color: 'from-red-500/20 to-red-600/20',
    borderColor: 'border-red-500/40',
    iconColor: 'text-red-400',
    selectedRing: 'ring-red-500/60',
  },
  {
    type: 'ripening',
    icon: Sun,
    label: 'Ripening',
    description: 'Something reaching fullness',
    color: 'from-amber-500/20 to-amber-600/20',
    borderColor: 'border-amber-500/40',
    iconColor: 'text-amber-400',
    selectedRing: 'ring-amber-500/60',
  },
];

export default function NameYourChange({
  onNext,
  onBack,
  initialTitle = '',
  initialDescription = '',
  initialChangeType = '',
}: NameYourChangeProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [changeType, setChangeType] = useState(initialChangeType);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => titleRef.current?.focus(), 100);
  }, []);

  const handleContinue = () => {
    if (title.trim() && description.trim() && changeType) {
      onNext(title.trim(), description.trim(), changeType);
    }
  };

  const canContinue = title.trim().length > 0 && description.trim().length > 0 && changeType.length > 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-xl font-medium text-white">
          What is changing?
        </h3>
        <p className="text-stone-400 text-sm">
          Name this transition. Not what you want it to be — what's actually moving.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <label htmlFor="change-title" className="text-sm font-medium text-stone-300">
            In a few words
          </label>
          <input
            ref={titleRef}
            id="change-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Leaving my job, Relationship ending, Moving cities..."
            className="w-full px-4 py-3 bg-stone-800/50 border border-cyan-500/30 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all"
            maxLength={100}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="change-description" className="text-sm font-medium text-stone-300">
            What's happening?
          </label>
          <textarea
            id="change-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what's changing. What are you feeling? What questions are alive? Let it flow without editing..."
            rows={4}
            className="w-full px-4 py-3 bg-stone-800/50 border border-cyan-500/30 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 resize-none transition-all"
          />
          {description.length > 200 && (
            <div className="text-right text-xs text-stone-500">
              {description.length} characters
            </div>
          )}
        </div>
      </div>

      {/* Change Type Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-stone-300">
          What kind of change is this?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {CHANGE_TYPES.map((ct, index) => {
            const Icon = ct.icon;
            const isSelected = changeType === ct.type;

            return (
              <motion.button
                key={ct.type}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => setChangeType(ct.type)}
                className={`p-3 bg-gradient-to-r ${ct.color} border ${ct.borderColor} rounded-xl text-left transition-all ${
                  isSelected ? `ring-2 ${ct.selectedRing} scale-[1.02]` : 'hover:scale-[1.01]'
                }`}
                whileTap={{ scale: 0.97 }}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${ct.iconColor}`} />
                  <div className="min-w-0">
                    <div className="text-white text-sm font-medium leading-tight">{ct.label}</div>
                    <div className="text-stone-400 text-xs leading-tight mt-0.5 truncate">{ct.description}</div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Continue Button */}
      <motion.button
        onClick={handleContinue}
        disabled={!canContinue}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
          canContinue
            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 text-cyan-300'
            : 'bg-stone-800/50 border border-stone-700/50 text-stone-500 cursor-not-allowed'
        }`}
        whileTap={canContinue ? { scale: 0.98 } : {}}
      >
        <span>Continue</span>
        <ChevronRight className="w-4 h-4" />
      </motion.button>

      {/* Helper Text */}
      <p className="text-center text-xs text-stone-500 leading-relaxed">
        You're not committing to anything. This is just naming what's already here.
      </p>
    </div>
  );
}
