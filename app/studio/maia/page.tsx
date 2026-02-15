'use client';

/**
 * STUDIO MAIA — Talk to MAIA inside Soullab Studio
 *
 * Practitioner-facing voice/text conversation with Studio context.
 * Uses the real OracleConversation (same as /maia) but with:
 * - surface="studio" → triggers operational prompt cap
 * - studioContext → passes clientId, pathname for context-aware responses
 * - Draft-only actions: MAIA can propose SMS/email but never send
 */

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { OracleConversation } from '@/components/OracleConversation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function StudioMAIAContent() {
  const searchParams = useSearchParams();

  // User identity — load from localStorage (same pattern as /maia)
  const [userId, setUserId] = useState('guest');
  const [userName, setUserName] = useState('Friend');
  const [isMounted, setIsMounted] = useState(false);

  // Session — unique per Studio MAIA visit
  const sessionId = useMemo(() => `studio-${Date.now()}`, []);

  // MAIA mode state
  const [maiaMode, setMaiaMode] = useState<'normal' | 'patient' | 'session'>('normal');
  const [showChatInterface, setShowChatInterface] = useState(true); // Default to text in Studio
  const [showSessionSelector, setShowSessionSelector] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(false);

  // Voice defaults (can load from localStorage later)
  const voiceEnabled = true;
  const selectedVoice = 'maia_core';
  const voiceSpeed = 0.95;
  const voiceModel = 'maia_core';
  const [voiceVolume] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('maia_voice_volume');
      return saved ? parseFloat(saved) : 1.0;
    }
    return 1.0;
  });

  // Studio context from URL
  const clientId = searchParams?.get('clientId') || undefined;

  // Load user identity on mount
  useEffect(() => {
    setIsMounted(true);
    if (typeof window === 'undefined') return;

    // Try beta_user first (canonical auth source)
    const betaUser = localStorage.getItem('beta_user');
    if (betaUser) {
      try {
        const userData = JSON.parse(betaUser);
        if (userData.id) setUserId(userData.id);
        const name = userData.preferredName || userData.name || userData.displayName || userData.username;
        if (name) setUserName(name);
      } catch { /* ignore */ }
    }

    // Fallback to explorerId/explorerName
    if (!betaUser) {
      const id = localStorage.getItem('explorerId');
      const name = localStorage.getItem('explorerPreferredName') || localStorage.getItem('explorerName');
      if (id) setUserId(id);
      if (name) setUserName(name);
    }
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-amber-400 animate-pulse">Loading MAIA...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Minimal header — back to Command Center */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-sm">
        <Link
          href="/studio"
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Studio
        </Link>
        <span className="text-slate-700">|</span>
        <span className="text-sm text-teal-400 font-medium">MAIA</span>
        {clientId && (
          <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded">
            Client context
          </span>
        )}
      </div>

      {/* OracleConversation — full height */}
      <div className="flex-1 overflow-hidden">
        <OracleConversation
          userId={userId}
          userName={userName}
          sessionId={sessionId}
          voiceEnabled={voiceEnabled}
          voice={selectedVoice}
          voiceSpeed={voiceSpeed}
          voiceModel={voiceModel}
          voiceVolume={voiceVolume}
          initialMode={maiaMode}
          onModeChange={setMaiaMode}
          apiEndpoint="/api/sovereign/app/maia/list"
          consciousnessType="maia"
          initialShowChatInterface={showChatInterface}
          onShowChatInterfaceChange={setShowChatInterface}
          showSessionSelector={showSessionSelector}
          onCloseSessionSelector={() => setShowSessionSelector(false)}
          onSessionActiveChange={setHasActiveSession}
          initialAction={searchParams?.get('action') || undefined}
          surface="studio"
          studioContext={{
            surface: 'studio',
            clientId,
            pathname: '/studio/maia',
          }}
        />
      </div>
    </div>
  );
}

export default function StudioMAIAPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-amber-400 animate-pulse">Loading MAIA...</div>
      </div>
    }>
      <StudioMAIAContent />
    </Suspense>
  );
}
