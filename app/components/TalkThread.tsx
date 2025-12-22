'use client';

/**
 * TALK THREAD COMPONENT
 * Phase 4.7: Meta-Dialogue Integration
 *
 * Purpose:
 * - Display chronological dialogue exchanges between user and MAIA
 * - Show meta-layer badges and facet references
 * - Render MAIA responses with reflective context
 */

import { useEffect, useRef } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface DialogueExchange {
  id: string;
  sessionId: string;
  speaker: 'user' | 'maia';
  content: string;
  exchangeType: 'user_query' | 'maia_response' | 'maia_self_query';
  referencedFacets?: string[];
  referencedMetaLayer?: 'Æ1' | 'Æ2' | 'Æ3';
  synthesisMethod?: string;
  confidenceScore?: number;
  createdAt: string | Date;
}

interface TalkThreadProps {
  exchanges: DialogueExchange[];
  autoScroll?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function TalkThread({ exchanges, autoScroll = true }: TalkThreadProps) {
  const threadEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new exchanges arrive
  useEffect(() => {
    if (autoScroll && threadEndRef.current) {
      threadEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [exchanges, autoScroll]);

  if (exchanges.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <p>No dialogue exchanges yet. Start a conversation with MAIA.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {exchanges.map((exchange) => (
        <DialogueMessage key={exchange.id} exchange={exchange} />
      ))}
      <div ref={threadEndRef} />
    </div>
  );
}

// ============================================================================
// MESSAGE COMPONENT
// ============================================================================

function DialogueMessage({ exchange }: { exchange: DialogueExchange }) {
  const isUser = exchange.speaker === 'user';
  const isMaia = exchange.speaker === 'maia';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
        }`}
      >
        {/* Speaker Label */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold opacity-70">
            {isUser ? 'You' : 'MAIA'}
          </span>

          {/* Meta-layer badge */}
          {isMaia && exchange.referencedMetaLayer && (
            <MetaLayerBadge layer={exchange.referencedMetaLayer} />
          )}

          {/* Synthesis method indicator */}
          {isMaia && exchange.synthesisMethod && (
            <span className="text-xs opacity-50">
              {exchange.synthesisMethod === 'ollama' ? '🤖' : '📝'}
            </span>
          )}
        </div>

        {/* Message content */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {exchange.content}
        </div>

        {/* Facet references */}
        {isMaia && exchange.referencedFacets && exchange.referencedFacets.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {exchange.referencedFacets.map((facet) => (
              <FacetBadge key={facet} code={facet} />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs opacity-50 mt-2">
          {formatTimestamp(exchange.createdAt)}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// BADGE COMPONENTS
// ============================================================================

function MetaLayerBadge({ layer }: { layer: 'Æ1' | 'Æ2' | 'Æ3' }) {
  const config = {
    'Æ1': { label: 'Æ1', title: 'Intuition/Signal', color: 'bg-purple-500' },
    'Æ2': { label: 'Æ2', title: 'Union/Numinous', color: 'bg-indigo-500' },
    'Æ3': { label: 'Æ3', title: 'Emergence/Creative', color: 'bg-pink-500' },
  };

  const { label, title, color } = config[layer];

  return (
    <span
      className={`${color} text-white text-xs px-2 py-0.5 rounded-full font-medium`}
      title={title}
    >
      {label}
    </span>
  );
}

function FacetBadge({ code }: { code: string }) {
  const elementColor = getFacetElementColor(code);

  return (
    <span
      className={`${elementColor} text-xs px-2 py-0.5 rounded border border-current opacity-70`}
      title={getFacetTitle(code)}
    >
      {code}
    </span>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function getFacetElementColor(code: string): string {
  if (code.startsWith('W')) return 'text-blue-500 dark:text-blue-400';
  if (code.startsWith('F')) return 'text-red-500 dark:text-red-400';
  if (code.startsWith('E')) return 'text-green-500 dark:text-green-400';
  if (code.startsWith('A')) return 'text-yellow-500 dark:text-yellow-400';
  if (code.startsWith('Æ')) return 'text-purple-500 dark:text-purple-400';
  return 'text-gray-500 dark:text-gray-400';
}

function getFacetTitle(code: string): string {
  const facetNames: Record<string, string> = {
    W1: 'Water-1: Spring/Safety',
    W2: 'Water-2: River/Shadow',
    W3: 'Water-3: Ocean/Compassion',
    F1: 'Fire-1: Spark/Activation',
    F2: 'Fire-2: Flame/Challenge',
    F3: 'Fire-3: Forge/Vision',
    E1: 'Earth-1: Seed/Grounding',
    E2: 'Earth-2: Root/Integration',
    E3: 'Earth-3: Harvest/Abundance',
    A1: 'Air-1: Breath/Awareness',
    A2: 'Air-2: Voice/Perspective',
    A3: 'Air-3: Wisdom/Meta',
    Æ1: 'Aether-1: Intuition/Signal',
    Æ2: 'Aether-2: Union/Numinous',
    Æ3: 'Aether-3: Emergence/Creative',
  };

  return facetNames[code] || code;
}

function formatTimestamp(timestamp: string | Date): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return 'Just now';
  if (diffMins === 1) return '1 minute ago';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
