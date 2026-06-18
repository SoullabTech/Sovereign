/**
 * AudioSourcesStatus — the Session Room "what MAIA can hear right now" surface.
 *
 * Frames audio capture as a positive checklist of sources rather than only an
 * error banner, so a practitioner can always see whether MAIA is hearing the
 * guest. Display-only: it reflects RecordingContext state and never changes
 * capture, consent, Sanctuary, or transcription.
 *
 * Pre-Phase-3, the guest's voice reaches MAIA ONLY via shared browser-tab audio
 * (getDisplayMedia); a native desktop meeting app can't be captured. The
 * `sources` array is the seam for future capture modes (e.g. a native LiveKit
 * room) — add a row, don't restructure.
 */
export function AudioSourcesStatus({ hasTabAudio }: { hasTabAudio: boolean }) {
  const sources = [
    { label: 'Your microphone', status: 'Connected', connected: true },
    {
      label: 'Meeting participants',
      status: hasTabAudio ? 'Browser tab audio connected' : 'Not connected',
      connected: hasTabAudio,
    },
  ];

  return (
    <div className="mb-4 rounded-xl border border-slate-800/60 bg-[#1e1e38] px-3.5 py-3">
      <div className="mb-2.5 text-[10px] uppercase tracking-wider text-slate-500">
        Audio sources
      </div>
      <div className="space-y-2">
        {sources.map((s) => (
          <div key={s.label} className="flex items-center gap-2.5 text-xs">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                s.connected ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span className="text-slate-300">{s.label}</span>
            <span className="ml-auto text-slate-400">{s.status}</span>
          </div>
        ))}
      </div>
      {!hasTabAudio && (
        <p className="mt-2.5 border-t border-slate-800/60 pt-2.5 text-[11px] leading-relaxed text-slate-500">
          Share your meeting&apos;s browser tab with audio (Chrome or Edge) to let MAIA
          hear everyone. Desktop meeting apps can&apos;t be captured by the browser.
        </p>
      )}
    </div>
  );
}
