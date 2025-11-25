"use client";

import { useState, useEffect } from "react";
import { getToneFromSoulprint } from "@/apps/web/lib/voice/adaptive-tone-engine";
import type { SoulprintSnapshot } from "@/lib/memory/soulprint";

export function ToneDebugOverlay() {
  const [soulprint, setSoulprint] = useState<SoulprintSnapshot | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fetchSoulprint = async () => {
      try {
        const response = await fetch('/api/maia/soulprint');
        if (response.ok) {
          const data = await response.json();
          if (data.soulprint) {
            setSoulprint(data.soulprint);
          }
        }
      } catch (error) {
        console.warn('Failed to fetch soulprint for debug overlay:', error);
      }
    };

    fetchSoulprint();
    const interval = setInterval(fetchSoulprint, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        setVisible(v => !v);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!visible || !soulprint) return null;

  const tone = getToneFromSoulprint(soulprint);
  const currentPhase = soulprint.spiralHistory?.[soulprint.spiralHistory.length - 1] || "unknown";

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/70 text-white p-3 rounded-xl shadow-lg text-sm font-mono">
      <div>🔥 <b>Element:</b> {soulprint.dominantElement}</div>
      <div>🌀 <b>Phase:</b> {currentPhase}</div>
      <div>🎤 <b>Style:</b> {tone.style}</div>
      <div>📈 Pitch: {tone.pitch.toFixed(2)}</div>
      <div>⏱ Rate: {tone.rate.toFixed(2)}</div>
      <div className="text-xs text-gray-400 mt-2">⌘/Ctrl+D to toggle</div>
    </div>
  );
}