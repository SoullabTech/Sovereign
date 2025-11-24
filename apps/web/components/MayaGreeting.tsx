"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface MaiaGreetingProps {
  userName: string;
  greetingText: string;
  memorySnippet?: string;
  memoryType?: 'journal' | 'phase' | 'element';
  onExpand?: () => void;
  className?: string;
}

export function MaiaGreeting({
  userName,
  greetingText,
  memorySnippet,
  memoryType,
  onExpand,
  className = ''
}: MaiaGreetingProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    // Trigger animation on mount
    setTimeout(() => setAnimateIn(true), 100);
  }, []);

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    if (onExpand) onExpand();
  };

  const getMemoryIcon = () => {
    switch (memoryType) {
      case 'journal': return '📓';
      case 'phase': return '🌀';
      case 'element': return '✨';
      default: return '🧠';
    }
  };

  if (isMobile) {
    // Mobile: Compact banner above input
    return (
      <div 
        className={`
          ${className}
          ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
          transition-all duration-500 ease-out
          bg-gradient-to-r from-amber-900/20 to-indigo-900/20
          border border-amber-700/30
          rounded-lg p-3 mb-3
          backdrop-blur-sm
        `}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-200 font-medium">
              {greetingText}
            </p>
            
            {memorySnippet && !isExpanded && (
              <button
                onClick={handleExpand}
                className="flex items-center gap-1 mt-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"
              >
                {getMemoryIcon()} Maia remembers
                <ChevronDownIcon className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {memorySnippet && isExpanded && (
          <div className="mt-3 p-2 bg-black/30 rounded border border-amber-700/20">
            <div className="flex items-start gap-2">
              <span className="text-lg">{getMemoryIcon()}</span>
              <p className="text-xs text-gray-300 italic">
                "{memorySnippet}"
              </p>
            </div>
            <button
              onClick={handleExpand}
              className="flex items-center gap-1 mt-2 text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              <ChevronUpIcon className="w-3 h-3" />
              Hide memory
            </button>
          </div>
        )}
      </div>
    );
  }

  // Desktop: Full header with expanded memory panel
  return (
    <div 
      className={`
        ${className}
        ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
        transition-all duration-700 ease-out
        bg-gradient-to-r from-amber-900/10 to-indigo-900/10
        border-b border-amber-700/30
        backdrop-blur-sm
      `}
    >
      <div className="px-6 py-4">
        <h2 className="text-lg font-medium text-gray-100">
          {greetingText}
        </h2>
        
        {memorySnippet && (
          <div className="mt-3">
            <button
              onClick={handleExpand}
              className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors"
            >
              {getMemoryIcon()}
              <span className="font-medium">Maia remembers</span>
              {isExpanded ? (
                <ChevronUpIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
            </button>
            
            {isExpanded && (
              <div className="mt-3 p-4 bg-black/20 rounded-lg border border-amber-700/20">
                <div className="flex gap-3">
                  <span className="text-2xl">{getMemoryIcon()}</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-300 italic leading-relaxed">
                      "{memorySnippet}"
                    </p>
                    {memoryType && (
                      <p className="mt-2 text-xs text-amber-400">
                        From your recent {memoryType === 'journal' ? 'journal entry' : 
                                          memoryType === 'phase' ? 'phase patterns' :
                                          'elemental resonance'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Wrapper component that fetches greeting data
export function MaiaGreetingContainer({ 
  userId,
  userName,
  sessionCount 
}: {
  userId: string;
  userName: string;
  sessionCount: number;
}) {
  const [greeting, setGreeting] = useState<{
    text: string;
    snippet?: string;
    type?: 'journal' | 'phase' | 'element';
  } | null>(null);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGreeting();
  }, [userId]);

  const fetchGreeting = async () => {
    try {
      const response = await fetch('/api/greeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          userName,
          sessionCount 
        })
      });
      
      const data = await response.json();
      
      setGreeting({
        text: data.greeting,
        snippet: data.memorySnippet,
        type: data.memoryType
      });
    } catch (error) {
      console.error('Failed to fetch greeting:', error);
      // Fallback greeting
      setGreeting({
        text: `Welcome back, ${userName}. How are you feeling today?`
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-20 bg-amber-900/10 rounded-lg"></div>
      </div>
    );
  }

  if (!greeting) return null;

  return (
    <MaiaGreeting
      userName={userName}
      greetingText={greeting.text}
      memorySnippet={greeting.snippet}
      memoryType={greeting.type}
    />
  );
}

// Export both named and container components
export { MaiaGreeting as MayaGreeting };
export { MaiaGreetingContainer as MayaGreetingContainer };