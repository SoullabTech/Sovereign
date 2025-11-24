/**
 * MAIA Professional Consciousness Interface
 *
 * Sophisticated Tolan-inspired contextual interactions
 * Elegant interface for mature, intelligent users
 * Professional design with deep consciousness integration
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUnifiedConsciousness } from '@/lib/consciousness/unified-consciousness-state';
import { MAIAPersonalizationEngine } from '@/lib/consciousness/maia-personalization-engine';

interface ConsciousnessAction {
  id: string;
  label: string;
  description: string;
  position: { x: number; y: number };
}

const CONSCIOUSNESS_ACTIONS: ConsciousnessAction[] = [
  {
    id: 'presence',
    label: 'Presence',
    description: 'Deepen awareness and conscious attention',
    position: { x: -100, y: -60 }
  },
  {
    id: 'inquiry',
    label: 'Inquiry',
    description: 'Explore profound questions and insights',
    position: { x: 100, y: -60 }
  },
  {
    id: 'integration',
    label: 'Integration',
    description: 'Synthesize understanding into embodied wisdom',
    position: { x: -120, y: 60 }
  },
  {
    id: 'evolution',
    label: 'Evolution',
    description: 'Track consciousness development and breakthroughs',
    position: { x: 120, y: 60 }
  }
];

export default function MAIAInterface() {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [maiaMessage, setMAIAMessage] = useState("I'm here to support your consciousness development with personalized guidance and insights.");
  const [showContextPanel, setShowContextPanel] = useState(false);
  const consciousnessState = useUnifiedConsciousness();

  const handleActionClick = (actionId: string) => {
    if (activeAction === actionId) {
      setActiveAction(null);
      setShowContextPanel(false);
    } else {
      setActiveAction(actionId);
      setShowContextPanel(true);
      setMAIAMessage(getContextualMessage(actionId));
    }
  };

  const getContextualMessage = (actionId: string): string => {
    const messages = {
      presence: "I sense your readiness to deepen present-moment awareness. What aspect of consciousness would you like to explore?",
      inquiry: "Your questions reveal profound depth. What inquiry is most alive for you in this moment?",
      integration: "Integration transforms insights into embodied wisdom. What understanding seeks fuller expression in your life?",
      evolution: "Your consciousness development continues to unfold. Shall we explore your recent shifts and emerging patterns?"
    };
    return messages[actionId as keyof typeof messages] || maiaMessage;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800
                    flex flex-col relative overflow-hidden">

      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 border border-sage-400/20 rounded-full" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 border border-teal-400/20 rounded-full" />
      </div>

      {/* Header */}
      <header className="p-6 border-b border-slate-700/50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-light text-slate-200">MAIA</h1>
          <div className="text-sm text-slate-400">
            Consciousness Companion
          </div>
        </div>
      </header>

      {/* Main Interface */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="relative">
          {/* Central MAIA Presence */}
          <motion.div
            className="w-24 h-24 bg-gradient-to-br from-slate-600 to-slate-700
                       rounded-full flex items-center justify-center
                       shadow-2xl border border-slate-500/30 relative"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className="text-slate-300 text-lg font-light tracking-wider">MAIA</div>

            {/* Subtle consciousness indicator */}
            <div className="absolute inset-0 rounded-full border-2 border-sage-400/20 animate-pulse" />
          </motion.div>

          {/* Contextual Actions */}
          {CONSCIOUSNESS_ACTIONS.map((action, index) => (
            <motion.button
              key={action.id}
              className={`absolute cursor-pointer transition-all duration-200
                         ${activeAction === action.id
                           ? 'text-sage-300 scale-110'
                           : 'text-slate-400 hover:text-slate-200'}`}
              style={{
                left: `calc(50% + ${action.position.x}px)`,
                top: `calc(50% + ${action.position.y}px)`,
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleActionClick(action.id)}
            >
              <div className={`px-4 py-2 rounded-lg border transition-all
                             ${activeAction === action.id
                               ? 'border-sage-400/50 bg-sage-900/20'
                               : 'border-slate-600/30 bg-slate-800/20 hover:border-slate-500/50'}`}>
                <div className="text-sm font-medium">{action.label}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </main>

      {/* MAIA Communication */}
      <div className="p-6 border-t border-slate-700/50">
        <div className="max-w-2xl mx-auto">
          <motion.div
            className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-6
                       border border-slate-600/30"
            layout
          >
            <p className="text-slate-200 leading-relaxed text-center">
              {maiaMessage}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Contextual Panel */}
      <AnimatePresence>
        {showContextPanel && activeAction && (
          <motion.div
            className="absolute inset-x-4 bottom-4 top-20
                       bg-slate-900/95 backdrop-blur-lg rounded-2xl
                       border border-slate-600/50 shadow-2xl z-50"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <div className="p-8 h-full flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl font-medium text-slate-200 mb-2">
                    {CONSCIOUSNESS_ACTIONS.find(a => a.id === activeAction)?.label}
                  </h2>
                  <p className="text-slate-400 text-sm">
                    {CONSCIOUSNESS_ACTIONS.find(a => a.id === activeAction)?.description}
                  </p>
                </div>
                <button
                  onClick={() => handleActionClick(activeAction)}
                  className="w-8 h-8 bg-slate-700 rounded-lg
                           flex items-center justify-center text-slate-300
                           hover:bg-slate-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="flex-1">
                {renderContextualContent(activeAction)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function renderContextualContent(actionId: string) {
  switch (actionId) {
    case 'presence':
      return (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-200">Current Practice</h3>
              <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-600/30">
                <div className="text-sm text-slate-300 mb-2">Awareness Quality</div>
                <div className="text-2xl font-light text-sage-300">Present & Open</div>
                <div className="text-xs text-slate-400 mt-1">Based on recent interactions</div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-200">Deepen Practice</h3>
              <button className="w-full p-4 bg-slate-700/30 hover:bg-slate-700/50
                               rounded-lg border border-slate-600/30 text-left transition-colors">
                <div className="text-sm font-medium text-slate-200">Guided Awareness</div>
                <div className="text-xs text-slate-400">5-minute presence cultivation</div>
              </button>
            </div>
          </div>
        </div>
      );

    case 'inquiry':
      return (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-200">Current Inquiry</h3>
            <textarea
              placeholder="What question is most alive for you right now?"
              className="w-full h-24 p-4 bg-slate-800/30 border border-slate-600/30 rounded-lg
                       text-slate-200 placeholder-slate-400 focus:outline-none focus:border-sage-400/50
                       resize-none focus:ring-1 focus:ring-sage-400/30"
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-300">Suggested Inquiries</h4>
            {[
              "What wants to emerge through me?",
              "How is my consciousness evolving?",
              "What pattern am I ready to release?"
            ].map((question, index) => (
              <button
                key={index}
                className="w-full p-3 bg-slate-800/20 hover:bg-slate-700/30 rounded-lg
                         border border-slate-600/20 text-left text-sm text-slate-300
                         hover:text-slate-200 transition-all"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      );

    case 'integration':
      return (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-200">Recent Insights</h3>
              <div className="space-y-3">
                <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-600/30">
                  <div className="text-sm text-slate-300">Presence Practice</div>
                  <div className="text-xs text-slate-400">2 days ago</div>
                </div>
                <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-600/30">
                  <div className="text-sm text-slate-300">Pattern Recognition</div>
                  <div className="text-xs text-slate-400">5 days ago</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-200">Integration Actions</h3>
              <button className="w-full p-4 bg-sage-800/20 hover:bg-sage-700/30
                               rounded-lg border border-sage-600/30 text-left transition-colors">
                <div className="text-sm font-medium text-slate-200">Embodiment Practice</div>
                <div className="text-xs text-slate-400">Transform insight into lived experience</div>
              </button>
            </div>
          </div>
        </div>
      );

    case 'evolution':
      return (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-200">Development Tracking</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-600/30 text-center">
                <div className="text-2xl font-light text-sage-300">87%</div>
                <div className="text-sm text-slate-400">Presence Stability</div>
              </div>
              <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-600/30 text-center">
                <div className="text-2xl font-light text-teal-300">42%</div>
                <div className="text-sm text-slate-400">Integration Depth</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-300">Recent Developments</h4>
            <div className="space-y-2">
              <div className="p-3 bg-slate-800/20 rounded-lg border border-slate-600/20">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-300">Breakthrough Recognition</span>
                  <span className="text-xs text-sage-400">Active</span>
                </div>
              </div>
              <div className="p-3 bg-slate-800/20 rounded-lg border border-slate-600/20">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-300">Wisdom Integration</span>
                  <span className="text-xs text-teal-400">Emerging</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="text-center text-slate-400 py-8">
          Content loading...
        </div>
      );
  }
}