'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Brain } from 'lucide-react';
import DepthCalibration from './DepthCalibration';
import type { AwarenessLevel, SessionPreference } from '@/lib/awareness/awarenessModel';

interface DepthTriggerProps {
  currentLevel?: AwarenessLevel;
  onLevelChange?: (level: AwarenessLevel | SessionPreference) => void;
  className?: string;
}

export default function DepthTrigger({
  currentLevel,
  onLevelChange,
  className = ''
}: DepthTriggerProps) {
  const [showCalibration, setShowCalibration] = useState(false);

  const handleSelection = (selection: AwarenessLevel | SessionPreference) => {
    setShowCalibration(false);
    onLevelChange?.(selection);
    console.log('🧠 Depth level updated:', selection);
  };

  const handleSkip = () => {
    setShowCalibration(false);
  };

  if (showCalibration) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <DepthCalibration
            type={currentLevel ? 'session' : 'initial'}
            currentLevel={currentLevel}
            onSelection={handleSelection}
            onSkip={handleSkip}
          />
        </div>
      </div>
    );
  }

  return (
    <motion.button
      onClick={() => setShowCalibration(true)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg
        bg-slate-800/60 hover:bg-slate-700/60
        border border-slate-600 hover:border-slate-500
        text-slate-300 hover:text-white
        transition-all duration-200
        ${className}
      `}
    >
      <Brain className="w-4 h-4" />
      <span className="text-sm font-medium">
        {currentLevel ? `Depth: L${currentLevel}` : 'Set Depth'}
      </span>
      <Settings className="w-3 h-3 opacity-60" />
    </motion.button>
  );
}