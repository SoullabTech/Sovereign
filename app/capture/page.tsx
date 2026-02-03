'use client';

/**
 * Capture Page - Session Note Capture for Descript & Patreon Export
 *
 * Enables timestamped note-taking during sessions with one-click export
 * to Descript chapters format and Patreon draft format.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Radio } from 'lucide-react';
import { CaptureToggle } from '@/components/capture/CaptureToggle';

export default function CapturePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    // Get userId from localStorage
    const storedUserId = localStorage.getItem('explorerId') || localStorage.getItem('betaUserId');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      // Generate a temporary userId if none exists
      const tempId = `capture_${Date.now()}`;
      setUserId(tempId);
    }
  }, []);

  const handleBack = () => {
    router.push('/labtools');
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e] flex items-center justify-center">
        <div className="text-[#D4B896] animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e]">
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4B896]/10
                     border border-[#D4B896]/20 text-[#D4B896] hover:bg-[#D4B896]/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Lab Tools
          </button>
        </div>

        {/* Main Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-lg
                          flex items-center justify-center">
              <Radio className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#D4B896] tracking-wide">Capture</h1>
              <p className="text-[#D4B896]/60 text-sm">Session notes & export</p>
            </div>
          </div>

          <p className="text-white/60 max-w-xl mx-auto leading-relaxed">
            Capture timestamped notes during your sessions. Tag them as Ship, Fix, Decision, Blocked, or Next.
            Export to Descript chapters or Patreon draft format with one click.
          </p>
        </div>

        {/* Capture Toggle - Main Interface */}
        <div className="flex justify-center mb-8">
          <CaptureToggle userId={userId} />
        </div>

        {/* Instructions */}
        <div className="bg-white/5 border border-[#D4B896]/20 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-medium text-[#D4B896]">How to Use</h3>

          <div className="space-y-3 text-white/70 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-[#D4B896] font-mono">1.</span>
              <span>Click the Capture button above to open the capture sheet</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#D4B896] font-mono">2.</span>
              <span>Start a capture session to begin timestamping notes</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#D4B896] font-mono">3.</span>
              <span>Add notes with tags: Ship (deployed), Fix (bugs), Decision, Blocked, Next</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#D4B896] font-mono">4.</span>
              <span>Export to Descript chapters (MM:SS - TAG - Note) or Patreon draft format</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#D4B896]/10">
            <h4 className="text-sm font-medium text-[#D4B896] mb-2">Keyboard Shortcuts</h4>
            <div className="flex gap-4 text-xs text-white/50">
              <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded">Cmd+Shift+R</kbd> Toggle capture</span>
              <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded">Cmd+Shift+N</kbd> Open capture sheet</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
