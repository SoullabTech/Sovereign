'use client';

// Floating "Report a bug" affordance. Mounted globally; renders only for a
// signed-in member (so it stays off public/onboarding surfaces). One tap →
// a small composer. Route + browser are captured automatically so the report
// arrives with context. Posts to /api/bugs, which persists + mirrors to #bugs.

import { useEffect, useState } from 'react';
import { Bug, X } from 'lucide-react';
import { apiFetch, getValidMemberId } from '@/lib/http/apiBase';
import { BUG_SEVERITIES, type BugSeverity } from '@/lib/bugs/types';

type Phase = 'idle' | 'open' | 'sending' | 'sent' | 'error';

export default function BugReportButton() {
  const [hasMember, setHasMember] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<BugSeverity>('normal');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Only show for signed-in members. Checked on mount (client-only).
  useEffect(() => {
    setHasMember(getValidMemberId() !== null);
  }, []);

  if (!hasMember) return null;

  async function submit() {
    const text = message.trim();
    if (!text) return;
    setPhase('sending');
    setErrorMsg(null);
    try {
      const res = await apiFetch('/api/bugs', {
        method: 'POST',
        body: JSON.stringify({
          message: text,
          severity,
          url: typeof window !== 'undefined' ? window.location.pathname + window.location.search : null,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
          context:
            typeof window !== 'undefined'
              ? { viewport: `${window.innerWidth}x${window.innerHeight}`, href: window.location.href }
              : {},
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || `Failed (${res.status})`);
        setPhase('error');
        return;
      }
      setPhase('sent');
      setMessage('');
      setSeverity('normal');
      setTimeout(() => setPhase('idle'), 2200);
    } catch (e) {
      setErrorMsg((e as Error).message);
      setPhase('error');
    }
  }

  function close() {
    setPhase('idle');
    setErrorMsg(null);
  }

  return (
    <>
      {/* Launcher */}
      {(phase === 'idle' || phase === 'sent') && (
        <button
          onClick={() => setPhase('open')}
          aria-label="Report a bug"
          title="Report a bug"
          className="fixed bottom-4 right-4 z-[60] flex items-center gap-2 rounded-full border border-white/15 bg-[#1A1513]/90 px-3 py-2 text-xs text-white/70 shadow-lg backdrop-blur transition hover:text-white hover:border-white/30"
        >
          {phase === 'sent' ? (
            <span className="text-emerald-300">✓ Reported</span>
          ) : (
            <>
              <Bug className="h-4 w-4" />
              <span className="hidden sm:inline">Report a bug</span>
            </>
          )}
        </button>
      )}

      {/* Composer */}
      {(phase === 'open' || phase === 'sending' || phase === 'error') && (
        <div className="fixed bottom-4 right-4 z-[60] w-[min(360px,calc(100vw-2rem))] rounded-xl border border-white/15 bg-[#1A1513] p-4 text-white shadow-2xl">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-light tracking-wide">
              <Bug className="h-4 w-4 text-amber-300" />
              Report a bug
            </div>
            <button onClick={close} aria-label="Close" className="text-white/40 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mb-2 text-[11px] leading-relaxed text-white/40">
            What went wrong? Your current screen and browser are attached automatically.
          </p>

          <textarea
            autoFocus
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit();
            }}
            rows={4}
            maxLength={5000}
            placeholder="e.g. The journal button opens the wrong page"
            className="w-full resize-none rounded-lg border border-white/10 bg-black/30 p-2.5 text-sm text-white placeholder:text-white/25 focus:border-amber-300/40 focus:outline-none"
          />

          <div className="mt-2 flex items-center justify-between gap-2">
            <label className="flex items-center gap-1.5 text-[11px] text-white/40">
              Severity
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as BugSeverity)}
                className="rounded border border-white/10 bg-black/30 px-1.5 py-1 text-[11px] text-white/80 focus:outline-none"
              >
                {BUG_SEVERITIES.map((s) => (
                  <option key={s} value={s} className="bg-[#1A1513]">
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <button
              onClick={submit}
              disabled={phase === 'sending' || !message.trim()}
              className="rounded-lg border border-amber-300/40 bg-amber-300/10 px-3 py-1.5 text-xs text-amber-200 transition hover:bg-amber-300/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {phase === 'sending' ? 'Sending…' : 'Send report'}
            </button>
          </div>

          {errorMsg && <div className="mt-2 text-[11px] text-rose-300">{errorMsg}</div>}
          <div className="mt-1.5 text-right text-[10px] text-white/25">⌘/Ctrl + Enter to send</div>
        </div>
      )}
    </>
  );
}
