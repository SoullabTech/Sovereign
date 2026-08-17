'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';
import { ReturnToMaia } from '@/components/navigation/ReturnToMaia';
import { todayISODate } from '@/lib/maia/dailyAnchor';

function formatDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function yesterdayISODate(): string {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yyyy = y.getFullYear();
  const mm = String(y.getMonth() + 1).padStart(2, '0');
  const dd = String(y.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

interface YesterdayAnchor {
  date: string;
  prompt: string;
  response: string;
}

export default function AnchorPage() {
  const router = useRouter();
  const [date, setDate] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [saved, setSaved] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [showYesterday, setShowYesterday] = useState<boolean>(false);
  const [yesterday, setYesterday] = useState<YesterdayAnchor | null>(null);

  useEffect(() => {
    const iso = todayISODate();
    setDate(iso);
    (async () => {
      try {
        const res = await apiFetch(`/api/anchor/today?date=${iso}`, { method: 'GET' });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        setPrompt(data.prompt || '');
        if (typeof data.response === 'string' && data.response.length > 0) {
          setResponse(data.response);
          setSaved(true);
        }
      } catch {
        setError('Could not load.');
      } finally {
        setBusy(false);
      }
    })();
  }, []);

  const onHold = useCallback(async () => {
    const trimmed = response.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch('/api/anchor/today', {
        method: 'POST',
        body: JSON.stringify({ date, response: trimmed }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setResponse(trimmed);
      setSaved(true);
    } catch {
      setError('Could not save. Try again.');
    } finally {
      setBusy(false);
    }
  }, [date, response, busy]);

  const onToggleYesterday = useCallback(async () => {
    if (yesterday !== null) {
      setShowYesterday((s) => !s);
      return;
    }
    const yIso = yesterdayISODate();
    try {
      const res = await apiFetch(`/api/anchor/today?date=${yIso}`, { method: 'GET' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setYesterday({
        date: yIso,
        prompt: data.prompt || '',
        response: typeof data.response === 'string' ? data.response : '',
      });
      setShowYesterday(true);
    } catch {
      setYesterday({ date: yIso, prompt: '', response: '' });
      setShowYesterday(true);
    }
  }, [yesterday]);

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%)' }}
    >
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#f8f7f5]/80 border-b border-stone-200/40">
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center gap-5">
          {/* Was `router.back()` with an unlabelled arrow. Two defects: the
              history stack is empty on a cold start, a deep link, a restored
              PWA session or a fresh native WebView — so the only way out of
              Anchor was a no-op exactly when the member most needed it — and an
              unlabelled arrow never said where it went. This names the
              destination the House already declared for this route. */}
          <ReturnToMaia className="-ml-1 text-stone-700 hover:text-stone-900 text-sm" />
          <div className="h-4 w-px bg-stone-300/60" />
          <h1 className="text-sm font-medium tracking-wide text-stone-600 uppercase">
            Anchor
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16">
        {busy && !prompt ? (
          <div className="text-center text-stone-400 text-sm mt-16">…</div>
        ) : !prompt ? (
          <div className="text-center text-stone-500 text-sm mt-16">{error || 'Could not load.'}</div>
        ) : (
          <>
            <p className="text-[12px] text-stone-400 mb-10 tracking-wide">
              {formatDate(date)}
            </p>

            <p className="text-xl md:text-2xl font-light text-stone-800 leading-relaxed mb-10">
              {prompt}
            </p>

            <textarea
              value={response}
              onChange={(e) => {
                setResponse(e.target.value);
                if (saved) setSaved(false);
              }}
              rows={6}
              className="w-full p-5 rounded-xl border border-stone-200/80 bg-white/60 text-[15px] leading-relaxed text-stone-700 placeholder-stone-400 focus:outline-none focus:border-stone-300 focus:bg-white/80 transition-colors resize-none"
            />

            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={onHold}
                disabled={busy || response.trim().length === 0}
                className="px-5 py-2 rounded-lg bg-[#5a7a6f] hover:bg-[#4a6a5f] text-white text-[13px] font-medium tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saved ? 'Held.' : 'Hold'}
              </button>
              {error && (
                <span className="text-[12px] text-stone-500">{error}</span>
              )}
            </div>

            <div className="mt-24 pt-8 border-t border-stone-200/50 space-y-6">
              <button
                onClick={onToggleYesterday}
                className="text-[12px] text-stone-400 hover:text-stone-600 transition-colors tracking-wide"
              >
                {showYesterday ? 'hide yesterday' : 'yesterday'}
              </button>

              {showYesterday && yesterday && (
                <div>
                  {yesterday.response ? (
                    <>
                      <p className="text-[12px] text-stone-400 mb-3 italic">{yesterday.prompt}</p>
                      <p className="text-[14px] text-stone-600 leading-relaxed whitespace-pre-wrap">
                        {yesterday.response}
                      </p>
                    </>
                  ) : (
                    <p className="text-[12px] text-stone-400 italic">nothing held yesterday</p>
                  )}
                </div>
              )}

              <div>
                <button
                  onClick={() => router.push('/maia/anchor/history')}
                  className="text-[12px] text-stone-400 hover:text-stone-600 transition-colors tracking-wide"
                >
                  earlier
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
