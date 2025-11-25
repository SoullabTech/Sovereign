'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, AlertCircle, CheckCircle } from 'lucide-react';

interface PulseCheckProps {
  type: 'landing' | 'resonance' | 'session-end';
  onResponse: (response: string) => void;
  onDismiss?: () => void;
}

export default function PulseCheck({ type, onResponse, onDismiss }: PulseCheckProps) {
  const [sessionWord, setSessionWord] = useState('');

  const configs = {
    landing: {
      question: "How did that land?",
      options: ['Too much', 'Just right', 'Need more'],
      icon: Heart,
      color: 'text-amber-400'
    },
    resonance: {
      question: "Does this resonate?",
      options: ['Yes', 'Partially', 'No'],
      icon: AlertCircle,
      color: 'text-blue-400'
    },
    'session-end': {
      question: "One word for today's session:",
      options: null, // Text input instead
      icon: CheckCircle,
      color: 'text-green-400'
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  const handleResponse = (response: string) => {
    onResponse(response);
    if (onDismiss) onDismiss();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed bottom-24 right-6 z-40"
      >
        <div className="bg-gray-900/95 backdrop-blur-md rounded-xl p-4 border border-gray-700/50 shadow-xl max-w-sm">
          <div className="flex items-start space-x-3">
            <Icon className={`w-5 h-5 ${config.color} mt-0.5`} />
            <div className="flex-1">
              <p className="text-sm text-gray-300 mb-3">{config.question}</p>

              {config.options ? (
                <div className="flex flex-wrap gap-2">
                  {config.options.map(option => (
                    <button
                      key={option}
                      onClick={() => handleResponse(option)}
                      className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (sessionWord.trim()) {
                    handleResponse(sessionWord);
                  }
                }}>
                  <input
                    type="text"
                    value={sessionWord}
                    onChange={(e) => setSessionWord(e.target.value)}
                    placeholder="Type one word..."
                    className="w-full px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 placeholder-gray-500 focus:border-blue-500/50 focus:outline-none"
                    autoFocus
                  />
                </form>
              )}

              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="mt-2 text-xs text-gray-500 hover:text-gray-400"
                >
                  Skip
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}