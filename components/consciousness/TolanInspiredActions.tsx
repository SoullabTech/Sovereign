'use client';

/**
 * Tolan-Inspired Floating Actions
 *
 * Adds contextual floating actions to any page using existing sage-teal design
 * Can be overlaid on any existing page without reconstruction
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Action {
  id: string;
  label: string;
  description: string;
  position: { x: number; y: number };
}

const CONSCIOUSNESS_ACTIONS: Action[] = [
  {
    id: 'presence',
    label: 'Presence',
    description: 'Deepen awareness and conscious attention',
    position: { x: -80, y: -50 }
  },
  {
    id: 'inquiry',
    label: 'Inquiry',
    description: 'Explore profound questions and insights',
    position: { x: 80, y: -50 }
  },
  {
    id: 'integration',
    label: 'Integration',
    description: 'Synthesize understanding into embodied wisdom',
    position: { x: -90, y: 50 }
  },
  {
    id: 'evolution',
    label: 'Evolution',
    description: 'Track consciousness development',
    position: { x: 90, y: 50 }
  }
];

interface TolanInspiredActionsProps {
  onActionSelect?: (actionId: string) => void;
  className?: string;
}

export function TolanInspiredActions({ onActionSelect, className = '' }: TolanInspiredActionsProps) {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState(false);

  const handleActionClick = (actionId: string) => {
    if (activeAction === actionId) {
      setActiveAction(null);
      setShowPanel(false);
    } else {
      setActiveAction(actionId);
      setShowPanel(true);
      onActionSelect?.(actionId);
    }
  };

  return (
    <div className={`fixed bottom-8 right-8 z-50 ${className}`}>
      {/* Central MAIA Hub */}
      <div className="relative">
        {/* MAIA Central Presence - using your sage-teal colors */}
        <motion.div
          className="w-16 h-16 rounded-full flex items-center justify-center relative"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 195, 174, 0.9) 0%, rgba(0, 105, 92, 0.8) 100%)',
            border: '2px solid rgba(251, 191, 36, 0.3)',
            boxShadow: '0 8px 25px -5px rgba(0, 105, 92, 0.3)'
          }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <span className="text-white text-xs font-medium">MAIA</span>

          {/* Subtle consciousness pulse */}
          <div className="absolute inset-0 rounded-full border-2 border-[#8BC3AE]/40 animate-pulse" />
        </motion.div>

        {/* Floating Actions */}
        {CONSCIOUSNESS_ACTIONS.map((action, index) => (
          <motion.button
            key={action.id}
            className={`absolute cursor-pointer transition-all duration-200 ${
              activeAction === action.id
                ? 'text-[#00695C] scale-110'
                : 'text-[#8BC3AE] hover:text-[#00695C]'
            }`}
            style={{
              left: `calc(50% + ${action.position.x}px)`,
              top: `calc(50% + ${action.position.y}px)`,
              transform: 'translate(-50%, -50%)'
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: activeAction === action.id ? 1.1 : 1 }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 400 }}
            onClick={() => handleActionClick(action.id)}
          >
            <div className={`px-3 py-2 rounded-lg border transition-all text-xs font-medium ${
              activeAction === action.id
                ? 'border-[#00695C] bg-[#00695C]/10'
                : 'border-[#8BC3AE]/30 bg-white/80 hover:border-[#00695C]/50'
            }`}>
              {action.label}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Contextual Panel */}
      <AnimatePresence>
        {showPanel && activeAction && (
          <motion.div
            className="absolute bottom-20 right-0 w-72 p-4 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(251, 211, 156, 0.95) 0%, rgba(245, 158, 11, 0.9) 30%, rgba(217, 119, 6, 0.88) 60%, rgba(251, 191, 36, 0.92) 100%)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)'
            }}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            {/* Close button */}
            <button
              onClick={() => handleActionClick(activeAction)}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#00695C]/20 text-[#00695C]
                       text-xs flex items-center justify-center hover:bg-[#00695C]/30 transition-colors"
            >
              ✕
            </button>

            {/* Panel content */}
            <div className="pt-2">
              <h3 className="text-lg font-semibold text-[#00695C] mb-2">
                {CONSCIOUSNESS_ACTIONS.find(a => a.id === activeAction)?.label}
              </h3>
              <p className="text-sm text-[#00695C]/80 mb-4">
                {CONSCIOUSNESS_ACTIONS.find(a => a.id === activeAction)?.description}
              </p>

              {renderActionContent(activeAction)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function renderActionContent(actionId: string) {
  const baseButtonClass = "w-full p-3 bg-[#00695C]/10 hover:bg-[#00695C]/20 rounded-lg border border-[#00695C]/20 text-left text-sm text-[#00695C] transition-colors";

  switch (actionId) {
    case 'presence':
      return (
        <div className="space-y-3">
          <div className="text-center">
            <div className="text-2xl mb-2">🧘‍♀️</div>
            <div className="text-sm text-[#00695C]/70">Current awareness: Present & open</div>
          </div>
          <button className={baseButtonClass}>
            Begin 5-minute presence meditation
          </button>
        </div>
      );

    case 'inquiry':
      return (
        <div className="space-y-3">
          <input
            placeholder="What question is most alive for you?"
            className="w-full p-2 bg-white/50 border border-[#8BC3AE]/30 rounded text-sm text-[#00695C]
                     placeholder-[#00695C]/50 focus:outline-none focus:border-[#00695C]/50"
          />
          <div className="text-xs text-[#00695C]/60">Suggested inquiries:</div>
          {['What wants to emerge through me?', 'How is my consciousness evolving?'].map((question, i) => (
            <button key={i} className={`${baseButtonClass} text-xs py-2`}>
              {question}
            </button>
          ))}
        </div>
      );

    case 'integration':
      return (
        <div className="space-y-3">
          <div className="text-xs text-[#00695C]/60">Recent insights:</div>
          <div className="space-y-2">
            <div className="p-2 bg-[#00695C]/5 rounded text-xs text-[#00695C]">Presence practice deepening</div>
            <div className="p-2 bg-[#00695C]/5 rounded text-xs text-[#00695C]">Pattern recognition emerging</div>
          </div>
          <button className={baseButtonClass}>
            Create embodiment practice
          </button>
        </div>
      );

    case 'evolution':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-[#00695C]/5 rounded">
              <div className="text-lg font-medium text-[#00695C]">87%</div>
              <div className="text-xs text-[#00695C]/60">Presence</div>
            </div>
            <div className="text-center p-2 bg-[#00695C]/5 rounded">
              <div className="text-lg font-medium text-[#8BC3AE]">42%</div>
              <div className="text-xs text-[#00695C]/60">Integration</div>
            </div>
          </div>
          <div className="text-xs text-[#00695C]/60">Recent developments:</div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#00695C]">Breakthrough Recognition</span>
              <span className="text-[#8BC3AE]">Active</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#00695C]">Wisdom Integration</span>
              <span className="text-teal-400">Emerging</span>
            </div>
          </div>
        </div>
      );

    default:
      return <div className="text-center text-[#00695C]/60 py-4">Loading...</div>;
  }
}