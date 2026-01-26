'use client';

/**
 * ThreadSelector: Link entries to storylines
 *
 * Allows users to select which thread(s) an entry belongs to,
 * or create a new thread from MAIA's suggestion.
 */

import { useState } from 'react';

interface Thread {
  id: string;
  title: string;
  domain: string | null;
  status: string;
  currentPhase: string | null;
  elementalSignature: Record<string, number>;
}

interface ThreadSuggestion {
  thread: Thread;
  relevance: number;
  matchingBeads: string[];
  reason: string;
}

interface NewThreadSuggestion {
  title: string;
  domain: string | null;
  reason: string;
}

interface ThreadSelectorProps {
  suggestions: ThreadSuggestion[];
  newThreadSuggestion?: NewThreadSuggestion | null;
  onSelectThread: (threadId: string) => void;
  onCreateThread: (title: string, domain: string | null) => void;
  onSkip?: () => void;
  selectedThreadId?: string | null;
}

const DOMAIN_COLORS: Record<string, string> = {
  vocation: 'text-amber-400',
  relationship: 'text-pink-400',
  health: 'text-green-400',
  creativity: 'text-purple-400',
  spirituality: 'text-indigo-400',
  family: 'text-rose-400',
  money: 'text-emerald-400',
  identity: 'text-cyan-400',
  community: 'text-blue-400',
  other: 'text-gray-400'
};

const DOMAIN_ICONS: Record<string, string> = {
  vocation: '\u{1F3AF}',      // target
  relationship: '\u{1F495}',  // hearts
  health: '\u{1F33F}',        // herb
  creativity: '\u{1F3A8}',    // palette
  spirituality: '\u{1F54E}',  // menorah (spiritual symbol)
  family: '\u{1F3E0}',        // house
  money: '\u{1F4B0}',         // money bag
  identity: '\u{1F9D1}',      // person
  community: '\u{1F465}',     // group
  other: '\u{1F4DD}'          // memo
};

export function ThreadSelector({
  suggestions,
  newThreadSuggestion,
  onSelectThread,
  onCreateThread,
  onSkip,
  selectedThreadId
}: ThreadSelectorProps) {
  const [showNewThreadForm, setShowNewThreadForm] = useState(false);
  const [newTitle, setNewTitle] = useState(newThreadSuggestion?.title || '');
  const [newDomain, setNewDomain] = useState<string | null>(newThreadSuggestion?.domain || null);

  const handleCreateThread = () => {
    if (newTitle.trim()) {
      onCreateThread(newTitle.trim(), newDomain);
      setShowNewThreadForm(false);
    }
  };

  // If no suggestions and no new thread suggestion, don't render
  if (suggestions.length === 0 && !newThreadSuggestion) {
    return null;
  }

  return (
    <div className="space-y-3 p-3 rounded-lg bg-black/20 border border-white/10">
      <div className="text-sm text-white/60">
        Link to a storyline:
      </div>

      {/* Existing thread suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.thread.id}
              onClick={() => onSelectThread(suggestion.thread.id)}
              className={`
                w-full text-left p-2.5 rounded-lg border transition-all
                ${selectedThreadId === suggestion.thread.id
                  ? 'bg-white/10 border-white/30'
                  : 'bg-black/20 border-white/5 hover:border-white/20'
                }
              `}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {suggestion.thread.domain && (
                      <span title={suggestion.thread.domain}>
                        {DOMAIN_ICONS[suggestion.thread.domain] || DOMAIN_ICONS.other}
                      </span>
                    )}
                    <span className="font-medium text-white/90">
                      {suggestion.thread.title}
                    </span>
                    {suggestion.thread.currentPhase && (
                      <span className="text-xs text-white/40">
                        {suggestion.thread.currentPhase}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-white/50 mt-0.5">
                    {suggestion.reason}
                  </div>
                </div>
                <div className="text-xs text-white/40">
                  {Math.round(suggestion.relevance * 100)}%
                </div>
              </div>

              {/* Elemental signature mini-bar */}
              <div className="flex gap-0.5 mt-2 h-1">
                {Object.entries(suggestion.thread.elementalSignature)
                  .filter(([_, v]) => v > 0.1)
                  .sort(([_, a], [__, b]) => b - a)
                  .map(([element, value]) => (
                    <div
                      key={element}
                      className={`rounded-full ${getElementBgClass(element)}`}
                      style={{ width: `${value * 100}%`, minWidth: '4px' }}
                      title={`${element}: ${Math.round(value * 100)}%`}
                    />
                  ))
                }
              </div>
            </button>
          ))}
        </div>
      )}

      {/* New thread suggestion */}
      {newThreadSuggestion && !showNewThreadForm && (
        <button
          onClick={() => setShowNewThreadForm(true)}
          className="w-full text-left p-2.5 rounded-lg border border-dashed border-white/20
                     bg-black/10 hover:bg-black/20 hover:border-white/30 transition-all"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">+</span>
            <div>
              <div className="text-white/80">
                Start new thread: <span className="font-medium">{newThreadSuggestion.title}</span>
              </div>
              <div className="text-xs text-white/50">{newThreadSuggestion.reason}</div>
            </div>
          </div>
        </button>
      )}

      {/* New thread form */}
      {showNewThreadForm && (
        <div className="p-3 rounded-lg bg-black/30 border border-white/10 space-y-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Thread title..."
            className="w-full px-3 py-2 rounded bg-black/30 border border-white/10
                       text-white placeholder-white/30 focus:border-white/30 focus:outline-none"
          />

          <div className="flex flex-wrap gap-1.5">
            {Object.keys(DOMAIN_COLORS).filter(d => d !== 'other').map((domain) => (
              <button
                key={domain}
                onClick={() => setNewDomain(domain === newDomain ? null : domain)}
                className={`
                  px-2 py-1 rounded text-xs transition-all
                  ${newDomain === domain
                    ? `${DOMAIN_COLORS[domain]} bg-white/10`
                    : 'text-white/40 hover:text-white/60'
                  }
                `}
              >
                {DOMAIN_ICONS[domain]} {domain}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCreateThread}
              disabled={!newTitle.trim()}
              className="flex-1 px-3 py-1.5 rounded bg-white/10 text-white/90
                         hover:bg-white/20 disabled:opacity-50 transition-all"
            >
              Create Thread
            </button>
            <button
              onClick={() => setShowNewThreadForm(false)}
              className="px-3 py-1.5 rounded text-white/50 hover:text-white/70 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Skip option */}
      {onSkip && (
        <button
          onClick={onSkip}
          className="w-full text-center text-xs text-white/40 hover:text-white/60 transition-colors"
        >
          Skip for now
        </button>
      )}
    </div>
  );
}

function getElementBgClass(element: string): string {
  switch (element) {
    case 'fire': return 'bg-orange-500';
    case 'water': return 'bg-blue-500';
    case 'earth': return 'bg-amber-600';
    case 'air': return 'bg-cyan-400';
    case 'aether': return 'bg-purple-500';
    default: return 'bg-gray-500';
  }
}

export default ThreadSelector;
