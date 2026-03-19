'use client';

/**
 * Member Spiralogic Evolutionary Report Page
 * /dashboard/spiralogic-report
 *
 * Allows a member to:
 * 1. Generate a new report by providing birth data
 * 2. View the latest generated report in structured form
 * 3. Download it as PDF
 * 4. Browse report history and load a past report
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

// ---- Page ------------------------------------------------------------------

export default function SpiralogicReportPage() {
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [memberName, setMemberName] = useState('');
  const [lifeStage, setLifeStage] = useState('');

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

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/spiralogic-report');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.reports ?? []);
        // Auto-load latest if no active report
        if (data.reports?.length > 0 && !activeReport) {
          loadReport(data.reports[0].id);
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
      const res = await fetch('/api/spiralogic-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthData: {
            date: birthDate,
            time: birthTime,
            name: memberName || undefined,
            location: { placeName: birthPlace || undefined },
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

      // Refresh history
      loadHistory();
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0d1220] to-[#0a0f1a]">
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Page header */}
        <div className="mb-12">
          <h1 className="text-4xl font-extralight text-white tracking-tight mb-3">
            Spiralogic Evolutionary Report
          </h1>
          <p className="text-gray-400 font-light max-w-2xl leading-relaxed">
            Your birth chart read through the Spiralogic lens — elemental mapping, karmic
            insights, and tailored practices for your evolutionary arc.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Sidebar: generate form + history */}
          <aside className="lg:col-span-1 space-y-6">

            {/* Generate form */}
            <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-6">
              <h2 className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-5">
                Generate Report
              </h2>

              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">
                    Your Name (optional)
                  </label>
                  <input
                    type="text"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    placeholder="e.g. Aria"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white
                               text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">
                    Birth Date
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white
                               text-sm focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">
                    Birth Time
                  </label>
                  <input
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white
                               text-sm focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">
                    Birth Place (optional)
                  </label>
                  <input
                    type="text"
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    placeholder="e.g. Basel, Switzerland"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white
                               text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">
                    Life Stage (optional)
                  </label>
                  <input
                    type="text"
                    value={lifeStage}
                    onChange={(e) => setLifeStage(e.target.value)}
                    placeholder="e.g. Career transition, post-retreat"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white
                               text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                {generateError && (
                  <p className="text-xs text-red-400">{generateError}</p>
                )}

                <button
                  type="submit"
                  disabled={generating}
                  className="w-full py-2.5 bg-amber-600/80 hover:bg-amber-500 disabled:bg-gray-700
                             disabled:text-gray-500 text-white text-sm rounded-lg transition-colors"
                >
                  {generating ? 'Generating...' : 'Generate Report'}
                </button>
              </form>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-6">
                <h2 className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-4">
                  Past Reports
                </h2>
                <div className="space-y-2">
                  {history.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => loadReport(r.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        activeReport?.id === r.id
                          ? 'border-amber-500/50 bg-amber-500/10'
                          : 'border-gray-700 hover:border-gray-600 bg-gray-800/40'
                      }`}
                    >
                      <p className="text-xs text-white">
                        {r.beingArchetype ?? 'Report'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Main content: report view */}
          <main className="lg:col-span-2">
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

            {!reportLoading && !reportError && activeReport && (
              <>
                <SpiralogicReportView
                  reportId={activeReport.id}
                  report={activeReport.reportData}
                  birthData={activeReport.birthData}
                />
                <div className="mt-8 text-center">
                  <a
                    href={`/maia?reportPhase=${encodeURIComponent(activeReport.reportData.currentPhase?.spiralogicPhase ?? '')}&openWith=report`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600/80 hover:bg-indigo-500
                               text-white text-sm rounded-lg transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Talk with MAIA about this report
                  </a>
                  <p className="text-xs text-gray-500 mt-2">
                    MAIA already knows where you are in this cycle.
                  </p>
                </div>

                {activeReport && (
                  <div className="mt-6 space-y-3">
                    <p className="text-xs text-gray-600 uppercase tracking-widest text-center">
                      or go deeper
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          label: 'Work with my current phase',
                          prompt: `I want to work with my current Spiralogic phase: ${activeReport.reportData.currentPhase?.spiralogicPhase ?? 'my current phase'}. Where do I begin?`,
                          icon: '◎',
                        },
                        {
                          label: 'Help me understand this transit',
                          prompt: `I want to understand the life-cycle transit I'm in right now and what it's asking of me.`,
                          icon: '⟳',
                        },
                        {
                          label: 'Guide me through my next action',
                          prompt: `I want to work through my first next action from my Spiralogic report. Can you help me get concrete about it?`,
                          icon: '→',
                        },
                        {
                          label: 'What am I missing?',
                          prompt: `Based on what you know about my elemental pattern and current phase, what do you think I might be avoiding or not seeing clearly?`,
                          icon: '◇',
                        },
                      ].map(({ label, prompt, icon }) => (
                        <a
                          key={label}
                          href={`/maia?q=${encodeURIComponent(prompt)}`}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-700
                                     hover:border-gray-500 bg-gray-800/40 hover:bg-gray-800/70
                                     text-sm text-gray-300 hover:text-white transition-all duration-150"
                        >
                          <span className="text-gray-500 font-mono shrink-0">{icon}</span>
                          <span>{label}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

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
          </main>
        </div>
      </div>
    </div>
  );
}
