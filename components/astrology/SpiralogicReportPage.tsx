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

  const [showForm, setShowForm] = useState(true);

  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const [history, setHistory] = useState<ReportSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [activeReport, setActiveReport] = useState<LoadedReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  // Load member name from localStorage if available
  useEffect(() => {
    try {
      const stored = localStorage.getItem('beta_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name) setMemberName(parsed.name);
      }
    } catch {
      // ignore
    }
  }, []);

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
            name: memberName || undefined,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0d1220] to-[#0a0f1a]">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Page header */}
        <div className="flex items-start justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-extralight text-white tracking-tight mb-1">
              Spiralogic Evolutionary Report
            </h1>
            {!activeReport && (
              <p className="text-gray-500 font-light text-sm mt-2 max-w-lg leading-relaxed">
                Your birth chart read through the Spiralogic lens — elemental mapping, karmic
                insights, and practices for your arc.
              </p>
            )}
          </div>
          {activeReport && (
            <button
              onClick={() => setShowForm(f => !f)}
              className="shrink-0 px-4 py-2 text-xs text-gray-400 border border-gray-700
                         rounded-lg hover:border-gray-500 hover:text-gray-200 transition-colors whitespace-nowrap"
            >
              {showForm ? 'Hide Form' : 'New Report'}
            </button>
          )}
        </div>

        {/* Generate form — shown when no report, or toggled open */}
        {(showForm || !activeReport) && (
          <div className="mb-10 bg-gray-900/60 border border-gray-700 rounded-xl p-6">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-5">
              {activeReport ? 'Generate New Report' : 'Generate Report'}
            </h2>
            <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Name (optional)</label>
                <input type="text" value={memberName} onChange={(e) => setMemberName(e.target.value)}
                  placeholder="e.g. Aria"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm
                             placeholder-gray-600 focus:outline-none focus:border-amber-500/50" />
              </div>

              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Life Stage (optional)</label>
                <input type="text" value={lifeStage} onChange={(e) => setLifeStage(e.target.value)}
                  placeholder="e.g. Career transition"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm
                             placeholder-gray-600 focus:outline-none focus:border-amber-500/50" />
              </div>

              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Birth Date</label>
                <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm
                             focus:outline-none focus:border-amber-500/50" />
              </div>

              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Birth Time</label>
                <input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm
                             focus:outline-none focus:border-amber-500/50" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Birth Place (optional)</label>
                <div className="flex gap-2">
                  <input type="text" value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)}
                    placeholder="e.g. Baton Rouge, LA"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm
                               placeholder-gray-600 focus:outline-none focus:border-amber-500/50" />
                  <button type="button" onClick={geocodePlace} disabled={geocoding || !birthPlace.trim()}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600
                               text-gray-300 text-xs rounded-lg transition-colors shrink-0">
                    {geocoding ? '...' : 'Locate'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Latitude</label>
                <input type="number" value={birthLat} onChange={(e) => setBirthLat(e.target.value)}
                  step="0.0001" min="-90" max="90" placeholder="e.g. 30.4494"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm
                             placeholder-gray-600 focus:outline-none focus:border-amber-500/50" />
              </div>

              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Longitude</label>
                <input type="number" value={birthLng} onChange={(e) => setBirthLng(e.target.value)}
                  step="0.0001" min="-180" max="180" placeholder="e.g. -91.1870"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm
                             placeholder-gray-600 focus:outline-none focus:border-amber-500/50" />
              </div>

              {generateError && (
                <p className="sm:col-span-2 text-xs text-red-400">{generateError}</p>
              )}
              {(birthLat || birthLng) && (
                <p className="sm:col-span-2 text-xs text-amber-500/70">Ascendant sign will be included in report.</p>
              )}

              <div className="sm:col-span-2">
                <button type="submit" disabled={generating}
                  className="w-full py-2.5 bg-amber-600/80 hover:bg-amber-500 disabled:bg-gray-700
                             disabled:text-gray-500 text-white text-sm rounded-lg transition-colors">
                  {generating ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Past reports strip — shown when report is active and form is hidden */}
        {activeReport && !showForm && history.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-8">
            {history.map((r) => (
              <button key={r.id} onClick={() => loadReport(r.id)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                  activeReport?.id === r.id
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                    : 'border-gray-700 bg-gray-800/40 text-gray-400 hover:border-gray-500'
                }`}>
                {r.beingArchetype ? r.beingArchetype.split(' — ')[0] : 'Report'} · {new Date(r.createdAt).toLocaleDateString()}
              </button>
            ))}
          </div>
        )}

        {/* Loading skeleton */}
        {reportLoading && (
          <div className="space-y-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-800/60 rounded-xl" />
            ))}
          </div>
        )}

        {reportError && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
            <p className="text-red-400 text-sm">{reportError}</p>
          </div>
        )}

        {/* Report view — full width */}
        {!reportLoading && !reportError && activeReport && (
          <>
            <SpiralogicReportView
              reportId={activeReport.id}
              report={activeReport.reportData}
              birthData={activeReport.birthData}
            />

            {/* MAIA entry points */}
            <div className="mt-10 pt-8 border-t border-gray-800 space-y-4">
              <a
                href={`/maia?reportPhase=${encodeURIComponent(activeReport.reportData.currentPhase?.spiralogicPhase ?? '')}&openWith=report`}
                className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600/80 hover:bg-indigo-500
                           text-white text-sm rounded-xl transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Talk with MAIA about this report
              </a>
              <p className="text-center text-xs text-gray-600">MAIA already knows where you are in this cycle.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {[
                  { label: 'Work with my current phase', icon: '◎',
                    prompt: `I want to work with my current Spiralogic phase: ${activeReport.reportData.currentPhase?.spiralogicPhase ?? 'my current phase'}. Where do I begin?` },
                  { label: 'Help me understand this transit', icon: '⟳',
                    prompt: `I want to understand the life-cycle transit I'm in right now and what it's asking of me.` },
                  { label: 'Guide me through my next action', icon: '→',
                    prompt: `I want to work through my first next action from my Spiralogic report. Can you help me get concrete about it?` },
                  { label: 'What am I missing?', icon: '◇',
                    prompt: `Based on what you know about my elemental pattern and current phase, what do you think I might be avoiding or not seeing clearly?` },
                ].map(({ label, prompt, icon }) => (
                  <a key={label} href={`/maia?q=${encodeURIComponent(prompt)}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-700
                               hover:border-gray-500 bg-gray-800/40 hover:bg-gray-800/70
                               text-sm text-gray-300 hover:text-white transition-all duration-150">
                    <span className="text-gray-500 font-mono shrink-0 text-base">{icon}</span>
                    <span>{label}</span>
                  </a>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Empty state */}
        {!reportLoading && !reportError && !activeReport && !historyLoading && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 mb-6 text-gray-700">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-gray-500 font-light max-w-xs leading-relaxed">
              Enter your birth information and generate your first Spiralogic Evolutionary Report.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
