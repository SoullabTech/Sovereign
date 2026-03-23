'use client';

/**
 * SpiralogicReportPage
 *
 * Shared page component rendered by /astrology/report.
 * Canonical member-facing surface for the Spiralogic Evolutionary Report.
 */

import { useState, useEffect } from 'react';
import { SpiralogicReportView, type SpiralogicReportData, type BirthDataShape } from '@/components/spiralogic/SpiralogicReportView';

// ---- Types -----------------------------------------------------------------

interface ReportSummary {
  id: string;
  birthData: BirthDataShape;
  createdAt: string;
  beingArchetype: string | null;
  becomingArchetype: string | null;
}

interface LoadedReport {
  id: string;
  birthData: BirthDataShape;
  reportData: SpiralogicReportData;
  createdAt: string;
}

// ---- Component -------------------------------------------------------------

export default function SpiralogicReportPage() {
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [birthLat, setBirthLat] = useState('');
  const [birthLng, setBirthLng] = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [lifeStage, setLifeStage] = useState('');

  // "Reading for someone else" mode — clears profile pre-fill, enables custom subject name
  const [readingForOther, setReadingForOther] = useState(false);
  const [subjectName, setSubjectName] = useState('');

  const [showForm, setShowForm] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const [history, setHistory] = useState<ReportSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [activeReport, setActiveReport] = useState<LoadedReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  // Load member name from localStorage, then fetch full profile birth data
  useEffect(() => {
    try {
      const stored = localStorage.getItem('beta_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name) setMemberName(parsed.name);
      }
    } catch { /* ignore */ }

    // Fetch profile to pre-fill birth data
    fetch('/api/members/profile')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.birthData) return;
        const bd = data.birthData;
        if (bd.date)  setBirthDate(bd.date);
        if (bd.time)  setBirthTime(bd.time);
        if (bd.location?.name) setBirthPlace(bd.location.name);
        if (bd.location?.lat)  setBirthLat(String(bd.location.lat));
        if (bd.location?.lng)  setBirthLng(String(bd.location.lng));
        setProfileLoaded(true);
      })
      .catch(() => { /* profile unavailable — form stays empty */ });
  }, []);

  // When switching to "someone else" mode, clear the pre-filled birth data
  function handleReadingForOtherToggle(on: boolean) {
    setReadingForOther(on);
    if (on) {
      setBirthDate('');
      setBirthTime('');
      setBirthPlace('');
      setBirthLat('');
      setBirthLng('');
      setSubjectName('');
    }
  }

  // Load report history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  async function geocodePlace() {
    if (!birthPlace.trim()) return;
    setGeocoding(true);
    try {
      const encoded = encodeURIComponent(birthPlace.trim());
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`,
        { headers: { 'User-Agent': 'MAIA-SOVEREIGN/1.0' } },
      );
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setBirthLat(parseFloat(data[0].lat).toFixed(4));
          setBirthLng(parseFloat(data[0].lon).toFixed(4));
        }
      }
    } catch {
      // non-fatal — user can enter manually
    } finally {
      setGeocoding(false);
    }
  }

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/spiralogic-report');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.reports ?? []);
        if (data.reports?.length > 0 && !activeReport) {
          loadReport(data.reports[0].id);
          setShowForm(false);
        }
      }
    } catch {
      // silently ignore history load failure
    } finally {
      setHistoryLoading(false);
    }
  }

  async function loadReport(reportId: string) {
    setReportLoading(true);
    setReportError(null);
    try {
      const res = await fetch(`/api/spiralogic-report/${reportId}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to load report');
      }
      const data = await res.json();
      setActiveReport({
        id: data.report.id,
        birthData: data.report.birthData,
        reportData: data.report.reportData,
        createdAt: data.report.createdAt,
      });
    } catch (err) {
      setReportError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setReportLoading(false);
    }
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!birthDate || !birthTime) {
      setGenerateError('Birth date and time are required.');
      return;
    }

    setGenerating(true);
    setGenerateError(null);

    try {
      const lat = parseFloat(birthLat);
      const lng = parseFloat(birthLng);
      const hasCoords = !isNaN(lat) && !isNaN(lng) &&
        lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

      const res = await fetch('/api/spiralogic-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthData: {
            date: birthDate,
            time: birthTime,
            name: (readingForOther ? subjectName : memberName) || undefined,
            location: {
              placeName: birthPlace || undefined,
              lat: hasCoords ? lat : undefined,
              lng: hasCoords ? lng : undefined,
            },
          },
          lifeStage: lifeStage || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Generation failed');
      }

      const data = await res.json();
      setActiveReport({
        id: data.reportId,
        birthData: {
          date: birthDate,
          time: birthTime,
          name: memberName || undefined,
          location: { placeName: birthPlace || undefined },
        },
        reportData: data.report,
        createdAt: new Date().toISOString(),
      });

      setShowForm(false);
      loadHistory();
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  }

  // ---- Form JSX (extracted for readability) ---------------------------------
  const formPanel = (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xs font-medium text-white/40 uppercase tracking-widest">
          {readingForOther ? 'Reading for Someone Else' : 'Generate Report'}
        </h2>
        <button type="button" onClick={() => handleReadingForOtherToggle(!readingForOther)}
          className={`text-xs px-3 py-1 rounded-lg border transition-colors ${
            readingForOther
              ? 'border-indigo-500/60 bg-indigo-500/10 text-indigo-300'
              : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
          }`}>
          {readingForOther ? '— Someone else' : '+ Reading for someone else'}
        </button>
      </div>
      {profileLoaded && !readingForOther && (
        <p className="text-xs text-amber-500/60 mb-4">Birth data pre-filled from your astrology profile.</p>
      )}
      <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {readingForOther ? (
          <div className="sm:col-span-2">
            <label className="block text-xs text-white/40 uppercase tracking-widest mb-1">Their Name</label>
            <input type="text" value={subjectName} onChange={(e) => setSubjectName(e.target.value)}
              placeholder="Name of the person this reading is for"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm
                         placeholder-white/20 focus:outline-none focus:border-indigo-500/50" />
          </div>
        ) : (
          <>
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-widest mb-1">Your Name (optional)</label>
              <input type="text" value={memberName} onChange={(e) => setMemberName(e.target.value)}
                placeholder="e.g. Kelly"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm
                           placeholder-white/20 focus:outline-none focus:border-amber-500/50" />
            </div>
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-widest mb-1">Life Stage (optional)</label>
              <input type="text" value={lifeStage} onChange={(e) => setLifeStage(e.target.value)}
                placeholder="e.g. Career transition"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm
                           placeholder-white/20 focus:outline-none focus:border-amber-500/50" />
            </div>
          </>
        )}

        <div>
          <label className="block text-xs text-white/40 uppercase tracking-widest mb-1">Birth Date</label>
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm
                       focus:outline-none focus:border-amber-500/50" />
        </div>

        <div>
          <label className="block text-xs text-white/40 uppercase tracking-widest mb-1">Birth Time</label>
          <input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} required
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm
                       focus:outline-none focus:border-amber-500/50" />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs text-white/40 uppercase tracking-widest mb-1">Birth Place (optional)</label>
          <div className="flex gap-2">
            <input type="text" value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)}
              placeholder="e.g. Baton Rouge, LA"
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm
                         placeholder-white/20 focus:outline-none focus:border-amber-500/50" />
            <button type="button" onClick={geocodePlace} disabled={geocoding || !birthPlace.trim()}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white/60 text-xs
                         rounded-lg border border-white/10 transition-colors shrink-0">
              {geocoding ? '...' : 'Locate'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs text-white/40 uppercase tracking-widest mb-1">Latitude</label>
          <input type="number" value={birthLat} onChange={(e) => setBirthLat(e.target.value)}
            step="0.0001" min="-90" max="90" placeholder="e.g. 30.4494"
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm
                       placeholder-white/20 focus:outline-none focus:border-amber-500/50" />
        </div>
        <div>
          <label className="block text-xs text-white/40 uppercase tracking-widest mb-1">Longitude</label>
          <input type="number" value={birthLng} onChange={(e) => setBirthLng(e.target.value)}
            step="0.0001" min="-180" max="180" placeholder="e.g. -91.1870"
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm
                       placeholder-white/20 focus:outline-none focus:border-amber-500/50" />
        </div>

        {(birthLat || birthLng) && (
          <p className="sm:col-span-2 text-xs text-amber-500/70">Ascendant sign will be included in report.</p>
        )}
        {generateError && (
          <p className="sm:col-span-2 text-xs text-red-400">{generateError}</p>
        )}

        <div className="sm:col-span-2">
          <button type="submit" disabled={generating}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40
                       text-black font-medium text-sm rounded-xl transition-colors">
            {generating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#061225] text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

        {!activeReport ? (
          /* ── FORM MODE: narrow centered column ─────────────────────────── */
          <div className="mx-auto max-w-xl">
            <div className="mb-8">
              <h1 className="text-4xl font-light tracking-tight">Spiralogic Evolutionary Report</h1>
              <p className="mt-3 text-base text-white/60 leading-relaxed">
                Your birth chart read through the Spiralogic lens — elemental mapping, karmic
                insights, and practices for your arc.
              </p>
            </div>

            {reportLoading ? (
              <div className="space-y-4 animate-pulse">
                {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-2xl" />)}
              </div>
            ) : (
              <>
                {reportError && (
                  <div className="mb-4 rounded-xl bg-red-900/20 border border-red-500/30 p-4">
                    <p className="text-red-400 text-sm">{reportError}</p>
                  </div>
                )}
                {formPanel}
                {history.length > 0 && (
                  <div className="mt-6">
                    <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Past Reports</p>
                    <div className="space-y-2">
                      {history.map((r) => (
                        <button key={r.id} onClick={() => { loadReport(r.id); setShowForm(false); }}
                          className="w-full text-left px-4 py-3 rounded-xl border border-white/10
                                     bg-white/5 hover:bg-white/8 transition-colors">
                          <p className="text-sm text-white">{r.beingArchetype ?? 'Report'}</p>
                          <p className="text-xs text-white/40 mt-0.5">{new Date(r.createdAt).toLocaleDateString()}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          /* ── REPORT MODE: full width, no competing columns ──────────────── */
          <div className="mx-auto w-full">
            {/* Report header bar */}
            <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-light tracking-tight">Spiralogic Evolutionary Report</h1>
                <p className="mt-1 text-sm text-white/50">
                  A living astrological and elemental reading of this phase of your journey.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {history.length > 1 && history.filter(r => r.id !== activeReport.id).map(r => (
                  <button key={r.id} onClick={() => loadReport(r.id)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs
                               text-white/60 hover:bg-white/10 transition">
                    {r.beingArchetype ? r.beingArchetype.split(' — ')[0] : 'Report'} · {new Date(r.createdAt).toLocaleDateString()}
                  </button>
                ))}
                <button onClick={() => { setActiveReport(null); setShowForm(true); }}
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm
                             text-white/80 hover:bg-white/10 transition">
                  New Report
                </button>
              </div>
            </div>

            {/* Report — full width, overflow guarded */}
            <div className="w-full overflow-x-hidden">
              <SpiralogicReportView
                reportId={activeReport.id}
                report={activeReport.reportData}
                birthData={activeReport.birthData}
              />
            </div>

            {/* MAIA entry points */}
            <div className="mt-12 pt-8 border-t border-white/10 space-y-4">
              <a href={`/maia?reportPhase=${encodeURIComponent((activeReport.reportData.currentPhase as any)?.phase ?? (activeReport.reportData.currentPhase as any)?.spiralogicPhase ?? '')}&openWith=report`}
                className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600/80
                           hover:bg-indigo-500 text-white text-sm rounded-xl transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Talk with MAIA about this report
              </a>
              <p className="text-center text-xs text-white/30">MAIA already knows where you are in this cycle.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Work with my current phase', icon: '◎',
                    prompt: `I want to work with my current Spiralogic phase: ${(activeReport.reportData.currentPhase as any)?.phase ?? (activeReport.reportData.currentPhase as any)?.spiralogicPhase ?? 'my current phase'}. Where do I begin?` },
                  { label: 'Help me understand this transit', icon: '⟳',
                    prompt: `I want to understand the life-cycle transit I'm in right now and what it's asking of me.` },
                  { label: 'Guide me through my next action', icon: '→',
                    prompt: `I want to work through my first next action from my Spiralogic report. Can you help me get concrete about it?` },
                  { label: 'What am I missing?', icon: '◇',
                    prompt: `Based on what you know about my elemental pattern and current phase, what do you think I might be avoiding or not seeing clearly?` },
                ].map(({ label, prompt, icon }) => (
                  <a key={label} href={`/maia?q=${encodeURIComponent(prompt)}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10
                               bg-white/5 hover:bg-white/8 text-sm text-white/70 hover:text-white transition-all">
                    <span className="text-white/30 font-mono shrink-0">{icon}</span>
                    <span>{label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
