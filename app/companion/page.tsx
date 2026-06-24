'use client';

/**
 * MAIA Companion — narrow sidebar surface (Zen web panel, Edge side panel, mobile).
 *
 * A focused, full-height MAIA conversation tuned for ~400px width. It renders the
 * SAME live conversation as the full app (OracleConversation against
 * /api/sovereign/app/maia/list) and shares the daily session thread, so the panel
 * and the full app are one continuous conversation — not a degraded mock.
 *
 * Sovereignty boundary: this surface has NO browser/page access. MAIA only ever
 * sees what the member types here, exactly like the web app. Any future "reflect
 * on this page/selection" capability must arrive through an extension with explicit
 * per-use consent — never ambient tab-reading. See docs/integrations/ZEN_BROWSER.md.
 */

import { useState, useEffect, useCallback } from 'react';
import { Sparkles, Maximize2 } from 'lucide-react';
import { OracleConversation } from '@/components/OracleConversation';
import { getValidMemberId, apiFetch } from '@/lib/http/apiBase';

type CompanionStatus = 'loading' | 'unauthenticated' | 'ready';

export default function CompanionPage() {
  const [status, setStatus] = useState<CompanionStatus>('loading');
  const [memberId, setMemberId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [sessionId, setSessionId] = useState<string>('');

  const init = useCallback(() => {
    const id = getValidMemberId();
    if (!id) {
      setMemberId(null);
      setSessionId('');
      setStatus('unauthenticated');
      return;
    }

    const name =
      localStorage.getItem('explorerPreferredName') ||
      localStorage.getItem('explorerName') ||
      undefined;

    // Share the full app's daily session thread (same keys, daily reset).
    const todayDate = new Date().toDateString();
    const existing = localStorage.getItem('maia_session_id');
    const lastDate = localStorage.getItem('maia_session_date');
    let sid: string;
    if (existing && lastDate === todayDate) {
      sid = existing;
    } else {
      sid = `session_${Date.now()}`;
      localStorage.setItem('maia_session_id', sid);
      localStorage.setItem('maia_session_date', todayDate);
    }

    // Register/touch session with backend (non-blocking — never gates the UI).
    apiFetch('/api/maia/session/start', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: sid,
        memberId: id,
        privacyMode: 'standard',
        maiaMode: 'normal',
      }),
    }).catch(() => {});

    setMemberId(id);
    setUserName(name);
    setSessionId(sid);
    setStatus('ready');
  }, []);

  useEffect(() => {
    init();
    // Pick up sign-in that happens in another tab/the full app (same origin).
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || ['memberId', 'explorerId', 'beta_user'].includes(e.key)) {
        init();
      }
    };
    const onFocus = () => {
      if (status !== 'ready') init();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [init]);

  const openFull = useCallback(() => {
    window.open('/maia', '_blank', 'noopener');
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-[#1A1513] text-white/70">
        <Sparkles className="h-5 w-5 animate-pulse text-amber-300/70" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex h-[100dvh] w-full flex-col items-center justify-center gap-6 bg-[#1A1513] px-6 text-center text-white">
        <Sparkles className="h-7 w-7 text-amber-300/80" />
        <div className="space-y-1">
          <h1 className="text-lg font-medium tracking-wide">MAIA</h1>
          <p className="text-sm text-white/60">Sign in to begin a conversation.</p>
        </div>
        <div className="flex w-full max-w-[260px] flex-col gap-2">
          <a
            href="/signin"
            target="_blank"
            rel="noopener"
            className="rounded-lg bg-amber-300/90 px-4 py-2 text-sm font-medium text-[#1A1513] transition hover:bg-amber-300"
          >
            Sign in
          </a>
          <a
            href="/begin"
            target="_blank"
            rel="noopener"
            className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:border-white/30 hover:text-white"
          >
            New here? Begin
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-[#1A1513] text-white">
      <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-3 py-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-300/80" />
          <span className="text-sm font-medium tracking-wide">MAIA</span>
        </div>
        <button
          type="button"
          onClick={openFull}
          title="Open full MAIA"
          aria-label="Open full MAIA"
          className="rounded-md p-1.5 text-white/50 transition hover:bg-white/5 hover:text-white/90"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </header>

      <div className="relative flex-1 overflow-hidden">
        <OracleConversation
          userId={memberId ?? undefined}
          userName={userName}
          sessionId={sessionId}
          voiceEnabled={true}
          voice="maia_core"
          voiceSpeed={0.95}
          voiceModel="maia_core"
          voiceVolume={0.8}
          initialMode="normal"
          apiEndpoint="/api/sovereign/app/maia/list"
          consciousnessType="maia"
          initialShowChatInterface={true}
        />
      </div>
    </div>
  );
}
