'use client';

// Floating "Report a bug" affordance. Mounted globally; renders only for a
// signed-in member (so it stays off public/onboarding surfaces). One tap →
// a small composer. Route + browser are captured automatically so the report
// arrives with context. Posts to /api/bugs, which persists + mirrors to #bugs.
//
// Screenshots: paste (⌘/Ctrl+V after a screen grab) or attach up to 5 images.
// They ride the SAME submission as evidence on this one report — never a
// separate upload or intake. With images the request becomes multipart/form-data;
// text-only stays JSON.

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ClipboardEvent } from 'react';
import { Bug, X, ImagePlus, CheckCircle2 } from 'lucide-react';
import { apiFetch, getValidMemberId } from '@/lib/http/apiBase';
import { BUG_SEVERITIES, type BugSeverity } from '@/lib/bugs/types';

// Client-side UX hints only; the server (/api/bugs) is the authoritative gate on type/size/count.
const ACCEPT_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
const ACCEPT_IMAGE_ATTR = ACCEPT_IMAGE_TYPES.join(',');
const MAX_IMAGES = 5;

type Phase = 'idle' | 'open' | 'sending' | 'sent' | 'error';

export default function BugReportButton() {
  const [hasMember, setHasMember] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<BugSeverity>('normal');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  // What was just submitted — kept after the composer resets so the 'sent' phase can
  // reflect the report back to the member (confirming we captured what they experienced).
  const [confirmed, setConfirmed] = useState<{ message: string; severity: BugSeverity; imageCount: number; page: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local preview URLs for pending screenshots; revoked when images change / on unmount.
  const previewUrls = useMemo(() => images.map((f) => URL.createObjectURL(f)), [images]);
  useEffect(() => () => { previewUrls.forEach((u) => URL.revokeObjectURL(u)); }, [previewUrls]);

  // Only show for signed-in members. Checked on mount (client-only).
  useEffect(() => {
    setHasMember(getValidMemberId() !== null);
  }, []);

  // Other surfaces (e.g. the Beta Hub "Report a Bug" tile) open the ONE canonical bug flow
  // via a lightweight event — decoupled, no shared ownership between components.
  useEffect(() => {
    const open = () => setPhase('open');
    window.addEventListener('soullab:open-bug-report', open);
    return () => window.removeEventListener('soullab:open-bug-report', open);
  }, []);

  if (!hasMember) return null;

  const addFiles = (files: File[]) => {
    const picked = files.filter((f) => ACCEPT_IMAGE_TYPES.includes(f.type));
    if (picked.length) setImages((prev) => [...prev, ...picked].slice(0, MAX_IMAGES));
  };
  const handleFilePick = (e: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files ?? []));
    e.target.value = ''; // allow re-selecting the same file
  };
  const removeImage = (i: number) => setImages((prev) => prev.filter((_, idx) => idx !== i));
  // Paste a screenshot straight into the description (⌘/Ctrl+V after a screen grab).
  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const imgs: File[] = [];
    for (const item of Array.from(e.clipboardData.items)) {
      if (item.kind === 'file' && ACCEPT_IMAGE_TYPES.includes(item.type)) {
        const f = item.getAsFile();
        if (f) imgs.push(f);
      }
    }
    if (imgs.length) { e.preventDefault(); addFiles(imgs); }
  };

  function resetComposer() {
    setMessage('');
    setSeverity('normal');
    setImages([]);
  }

  async function submit() {
    const text = message.trim();
    // A bug needs words or a screenshot (image-only is valid: "here's the broken screen").
    if (!text && images.length === 0) return;
    setPhase('sending');
    setErrorMsg(null);

    const url = typeof window !== 'undefined' ? window.location.pathname + window.location.search : null;
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null;
    const context =
      typeof window !== 'undefined'
        ? { viewport: `${window.innerWidth}x${window.innerHeight}`, href: window.location.href }
        : {};

    try {
      let res: Response;
      if (images.length > 0) {
        // Multipart so screenshots upload alongside the report (evidence on this bug).
        const form = new FormData();
        form.append('message', text);
        form.append('severity', severity);
        if (url) form.append('url', url);
        if (userAgent) form.append('userAgent', userAgent);
        form.append('context', JSON.stringify(context));
        images.forEach((img) => form.append('images', img));
        res = await apiFetch('/api/bugs', { method: 'POST', body: form });
      } else {
        res = await apiFetch('/api/bugs', {
          method: 'POST',
          body: JSON.stringify({ message: text, severity, url, userAgent, context }),
        });
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || `Failed (${res.status})`);
        setPhase('error');
        return;
      }
      // Capture what was reported BEFORE resetting, so the confirmation can reflect it back.
      setConfirmed({
        message: text,
        severity,
        imageCount: images.length,
        page: url ?? 'this screen',
      });
      setPhase('sent');
      resetComposer();
      setTimeout(() => setPhase('idle'), 6000);
    } catch (e) {
      setErrorMsg((e as Error).message);
      setPhase('error');
    }
  }

  function close() {
    setPhase('idle');
    setErrorMsg(null);
  }

  const canSend = (message.trim().length > 0 || images.length > 0) && phase !== 'sending';

  return (
    <>
      {/* Launcher */}
      {phase === 'idle' && (
        <button
          onClick={() => setPhase('open')}
          aria-label="Report a bug"
          title="Report a bug"
          className="fixed bottom-4 right-4 z-[60] flex items-center gap-2 rounded-full border border-white/15 bg-[#1A1513]/90 px-3 py-2 text-xs text-white/70 shadow-lg backdrop-blur transition hover:text-white hover:border-white/30"
        >
          <Bug className="h-4 w-4" />
          <span className="hidden sm:inline">Report a bug</span>
        </button>
      )}

      {/* Confirmation — reflects the submitted report back to the member so they can see
          we captured what they're experiencing (not just a generic "sent" flash). */}
      {phase === 'sent' && confirmed && (
        <div className="fixed bottom-4 right-4 z-[60] w-[min(360px,calc(100vw-2rem))] rounded-xl border border-emerald-400/25 bg-[#1A1513] p-4 text-white shadow-2xl">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-light tracking-wide text-emerald-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              Report received — thank you
            </div>
            <button
              onClick={() => setPhase('idle')}
              aria-label="Dismiss"
              className="text-white/40 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mb-2 text-[11px] leading-relaxed text-white/40">
            We&rsquo;ve logged what you&rsquo;re experiencing on <span className="text-white/60">{confirmed.page}</span> and flagged it as{' '}
            <span className="text-white/60">{confirmed.severity}</span>. Our team will look into it.
          </p>

          {confirmed.message && (
            <blockquote className="rounded-lg border-l-2 border-emerald-400/40 bg-black/30 px-2.5 py-2 text-[12px] italic leading-relaxed text-white/70">
              &ldquo;{confirmed.message}&rdquo;
            </blockquote>
          )}

          {confirmed.imageCount > 0 && (
            <div className="mt-2 flex items-center gap-1 text-[11px] text-white/40">
              <ImagePlus className="h-3.5 w-3.5" />
              {confirmed.imageCount} screenshot{confirmed.imageCount === 1 ? '' : 's'} attached
            </div>
          )}
        </div>
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
            What went wrong? Your current screen and browser are noted automatically. Paste or attach a screenshot to show it.
          </p>

          <textarea
            autoFocus
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onPaste={handlePaste}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit();
            }}
            rows={4}
            maxLength={5000}
            placeholder="e.g. The journal button opens the wrong page"
            className="w-full resize-none rounded-lg border border-white/10 bg-black/30 p-2.5 text-sm text-white placeholder:text-white/25 focus:border-amber-300/40 focus:outline-none"
          />

          {/* Pending screenshots */}
          {images.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {images.map((file, i) => (
                <div key={`${file.name}-${i}`} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrls[i]}
                    alt={file.name}
                    className="h-14 w-14 rounded-lg border border-white/15 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-black text-xs leading-none text-white/70 transition-colors hover:bg-rose-500/80 hover:text-white"
                    aria-label={`Remove ${file.name}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
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

              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT_IMAGE_ATTR}
                multiple
                hidden
                onChange={handleFilePick}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={images.length >= MAX_IMAGES}
                title={images.length >= MAX_IMAGES ? `Max ${MAX_IMAGES} screenshots` : 'Attach screenshot'}
                className="flex items-center gap-1 rounded border border-white/10 px-1.5 py-1 text-[11px] text-white/50 transition hover:text-white/80 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ImagePlus className="h-3.5 w-3.5" />
                {images.length > 0 ? `${images.length}/${MAX_IMAGES}` : 'Screenshot'}
              </button>
            </div>

            <button
              onClick={submit}
              disabled={!canSend}
              className="rounded-lg border border-amber-300/40 bg-amber-300/10 px-3 py-1.5 text-xs text-amber-200 transition hover:bg-amber-300/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {phase === 'sending' ? 'Sending…' : 'Send report'}
            </button>
          </div>

          {errorMsg && <div className="mt-2 text-[11px] text-rose-300">{errorMsg}</div>}
          <div className="mt-1.5 text-right text-[10px] text-white/25">⌘/Ctrl + Enter to send · paste to attach</div>
        </div>
      )}
    </>
  );
}
