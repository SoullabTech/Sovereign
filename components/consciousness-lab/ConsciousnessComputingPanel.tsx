/**
 * ConsciousnessComputingPanel - Core interface for consciousness sessions
 */

import React, { useState } from 'react';

interface AwarenessData {
  level: number;
  confidence: number;
}

interface Suggestion {
  title: string;
  body: string;
}

export interface ConsciousnessComputingPanelProps {
  awareness?: AwarenessData;
  suggestions?: Suggestion[];
  showAwarenessLevel?: boolean;
  showSuggestions?: boolean;
  onNewSession?: (prompt: string) => void;
  loading?: boolean;
  className?: string;
}

export const ConsciousnessComputingPanel: React.FC<ConsciousnessComputingPanelProps> = ({
  awareness,
  suggestions = [],
  showAwarenessLevel = true,
  showSuggestions = true,
  onNewSession,
  loading = false,
  className = ""
}) => {
  const [sessionInput, setSessionInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionInput.trim() && onNewSession) {
      onNewSession(sessionInput.trim());
      setSessionInput('');
    }
  };

  const getAwarenessColor = (level: number) => {
    if (level >= 4) return 'text-green-400 border-green-400/50 bg-green-400/10';
    if (level >= 3) return 'text-blue-400 border-blue-400/50 bg-blue-400/10';
    if (level >= 2) return 'text-yellow-400 border-yellow-400/50 bg-yellow-400/10';
    return 'text-purple-400 border-purple-400/50 bg-purple-400/10';
  };

  return (
    <div className={`
      bg-black/20 border border-white/20 rounded-lg p-6
      backdrop-blur-sm ${className}
    `}>

      {/* Awareness Level Display */}
      {showAwarenessLevel && awareness && (
        <div className="mb-6">
          <h3 className="text-white/90 text-lg font-medium mb-3">
            Current Awareness
          </h3>
          <div className={`
            flex items-center space-x-4 p-4 rounded-lg border
            ${getAwarenessColor(awareness.level)}
          `}>
            <div className="text-2xl font-bold">
              Level {awareness.level}
            </div>
            <div className="flex-1">
              <div className="text-sm opacity-80 mb-1">
                Confidence: {Math.round(awareness.confidence * 100)}%
              </div>
              <div className={`
                h-2 bg-black/30 rounded-full overflow-hidden
              `}>
                <div
                  className="h-full bg-current rounded-full transition-all duration-500"
                  style={{ width: `${awareness.confidence * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Session Input */}
      <div className="mb-6">
        <h3 className="text-white/90 text-lg font-medium mb-3">
          Start New Session
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            <textarea
              value={sessionInput}
              onChange={(e) => setSessionInput(e.target.value)}
              placeholder="Share what's present for you right now... What are you feeling, thinking, or experiencing?"
              className="
                w-full p-4 bg-black/30 border border-white/20 rounded-lg
                text-white placeholder-white/50 resize-none h-24
                focus:outline-none focus:border-purple-400/50
                transition-colors duration-200
              "
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !sessionInput.trim()}
              className="
                w-full py-3 px-6 bg-purple-600/80 hover:bg-purple-600
                disabled:bg-gray-600/50 disabled:cursor-not-allowed
                border border-purple-400/50 rounded-lg
                text-white font-medium transition-all duration-200
                flex items-center justify-center space-x-2
              "
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Begin Consciousness Computing</span>
                  <span className="text-purple-300">🧠</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Suggestions Display */}
      {showSuggestions && suggestions.length > 0 && (
        <div>
          <h3 className="text-white/90 text-lg font-medium mb-3">
            Consciousness Insights
          </h3>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="
                  p-4 bg-white/5 border border-white/10 rounded-lg
                  hover:bg-white/10 transition-colors duration-200
                "
              >
                <h4 className="text-white font-medium mb-2">
                  {suggestion.title}
                </h4>
                <p className="text-white/80 text-sm leading-relaxed">
                  {suggestion.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsciousnessComputingPanel;