"use client";
import React, { useState, useEffect } from "react";
import { Sparkles, BookOpen, Clock, X } from "lucide-react";

interface MemoryIndicator {
  type: "element" | "theme" | "journal" | "phase";
  content: string;
  sessionCount: number;
  confidence: number;
}

interface SessionMemoryBannerProps {
  indicators: MemoryIndicator[];
  onDismiss?: () => void;
}

export default function SessionMemoryBanner({ 
  indicators, 
  onDismiss 
}: SessionMemoryBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (indicators && indicators.length > 0) {
      setIsVisible(true);
      setFadeOut(false);
    }
  }, [indicators]);

  if (!indicators || indicators.length === 0 || !isVisible) return null;

  const handleDismiss = () => {
    setFadeOut(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 300);
  };

  const getElementEmoji = (element: string) => {
    const elementMap: Record<string, string> = {
      fire: "🔥",
      water: "🌊",
      earth: "🌍",
      air: "💨",
      spirit: "✨",
      void: "🌑"
    };
    return elementMap[element.toLowerCase()] || "✨";
  };

  return (
    <div 
      className={`w-full bg-indigo-900/40 border border-indigo-700 text-white rounded-xl p-3 mt-3 flex flex-col gap-2 transition-opacity duration-300 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-300 text-sm font-semibold">
          <Sparkles className="w-4 h-4 animate-pulse" />
          Maya remembers...
        </div>
        <button
          onClick={handleDismiss}
          className="relative z-50 p-1 text-indigo-300 hover:text-white hover:bg-indigo-700/50 rounded-lg transition-all duration-200 flex-shrink-0"
          aria-label="Dismiss memory banner"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {indicators.map((m, idx) => (
        <div
          key={idx}
          className="flex justify-between items-center bg-indigo-800/50 p-2 rounded-lg text-sm animate-fade-in"
          style={{ animationDelay: `${idx * 100}ms` }}
        >
          <span className="flex-1">
            {m.type === "element" && (
              <>
                You&apos;ve been exploring {getElementEmoji(m.content)} {m.content} energy
              </>
            )}
            {m.type === "theme" && (
              <>
                <BookOpen className="w-3 h-3 inline mr-1" />
                You&apos;ve returned often to the theme: <em>{m.content}</em>
              </>
            )}
            {m.type === "journal" && (
              <>
                Last time you journaled about: <em>"{m.content}"</em>
              </>
            )}
            {m.type === "phase" && (
              <>
                You&apos;re in your {m.content} phase
              </>
            )}
          </span>
          {m.sessionCount > 1 && (
            <div className="flex items-center gap-1 text-xs text-indigo-400 ml-2">
              <Clock className="w-3 h-3" /> 
              {m.sessionCount} {m.sessionCount === 1 ? 'session' : 'sessions'}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}