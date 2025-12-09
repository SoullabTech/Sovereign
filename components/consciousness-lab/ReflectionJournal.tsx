/**
 * ReflectionJournal - Sacred space for consciousness reflection and integration
 */

import React, { useState } from 'react';

export interface ReflectionJournalProps {
  prompt?: string;
  placeholder?: string;
  onSave?: (text: string) => void;
  autoSave?: boolean;
  className?: string;
  maxLength?: number;
}

export const ReflectionJournal: React.FC<ReflectionJournalProps> = ({
  prompt = "What felt most true in this session?",
  placeholder = "Take a moment to reflect on what emerged... What insights, feelings, or awareness wants to be captured?",
  onSave,
  autoSave = false,
  className = "",
  maxLength = 2000
}) => {
  const [reflection, setReflection] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const handleSave = async () => {
    if (!reflection.trim() || !onSave) return;

    setIsSaving(true);
    try {
      await onSave(reflection.trim());
      setLastSaved(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Failed to save reflection:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Auto-save with Cmd/Ctrl + S
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  const remainingChars = maxLength - reflection.length;
  const isNearLimit = remainingChars < 100;

  return (
    <div className={`
      bg-gradient-to-b from-indigo-900/20 to-purple-900/20
      border border-indigo-300/30 rounded-lg p-6
      backdrop-blur-sm ${className}
    `}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white/90 text-lg font-medium flex items-center space-x-2">
          <span>Reflection Journal</span>
          <span className="text-indigo-300">✨</span>
        </h3>

        {lastSaved && (
          <div className="text-indigo-300/70 text-sm">
            Last saved: {lastSaved}
          </div>
        )}
      </div>

      <div className="mb-4">
        <p className="text-indigo-200/80 text-sm font-medium mb-2">
          {prompt}
        </p>
        <p className="text-white/60 text-xs">
          This is your sacred space for integration and insight capture.
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={maxLength}
            className="
              w-full p-4 bg-black/30 border border-indigo-300/30 rounded-lg
              text-white placeholder-white/40 resize-none h-32
              focus:outline-none focus:border-indigo-400/60
              transition-colors duration-200
            "
          />

          <div className="absolute bottom-3 right-3 flex items-center space-x-3">
            {isNearLimit && (
              <span className={`
                text-xs px-2 py-1 rounded
                ${remainingChars < 50
                  ? 'bg-red-500/20 text-red-300 border border-red-400/30'
                  : 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
                }
              `}>
                {remainingChars} left
              </span>
            )}

            <div className="text-white/40 text-xs">
              {reflection.length}/{maxLength}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-white/50 text-xs">
            Cmd/Ctrl + S to save quickly
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving || !reflection.trim()}
            className="
              px-4 py-2 bg-indigo-600/80 hover:bg-indigo-600
              disabled:bg-gray-600/50 disabled:cursor-not-allowed
              border border-indigo-400/50 rounded-lg
              text-white text-sm font-medium transition-all duration-200
              flex items-center space-x-2
            "
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>Save Reflection</span>
                <span className="text-indigo-300">💎</span>
              </>
            )}
          </button>
        </div>

        {reflection.trim() && (
          <div className="pt-3 border-t border-indigo-300/20">
            <p className="text-indigo-200/60 text-xs">
              Your reflections contribute to the collective wisdom field and help
              evolve consciousness computing for everyone in the Community Commons.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReflectionJournal;