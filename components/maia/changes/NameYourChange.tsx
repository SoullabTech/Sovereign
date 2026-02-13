'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface NameYourChangeProps {
  onNext: (title: string, description: string) => void;
  onBack: () => void;
  initialTitle?: string;
  initialDescription?: string;
}

export default function NameYourChange({
  onNext,
  onBack,
  initialTitle = '',
  initialDescription = '',
}: NameYourChangeProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus title field on mount
    setTimeout(() => titleRef.current?.focus(), 100);
  }, []);

  const handleContinue = () => {
    if (title.trim() && description.trim()) {
      onNext(title.trim(), description.trim());
    }
  };

  const canContinue = title.trim().length > 0 && description.trim().length > 0;

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
            rows={6}
            className="w-full px-4 py-3 bg-stone-800/50 border border-cyan-500/30 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 resize-none transition-all"
          />
          {description.length > 200 && (
            <div className="text-right text-xs text-stone-500">
              {description.length} characters
            </div>
          )}
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
