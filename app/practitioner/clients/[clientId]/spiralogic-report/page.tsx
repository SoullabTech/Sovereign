'use client';

/**
 * Practitioner — Client Spiralogic Report
 * /practitioner/clients/[clientId]/spiralogic-report
 *
 * Allows a practitioner to:
 * 1. Generate a Spiralogic report for a client
 * 2. View the report in-app
 * 3. Download it as PDF
 * 4. Browse previously generated reports for this client
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

export default function PractitionerClientReportPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;

  const [clientName, setClientName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('12:00');
  const [birthPlace, setBirthPlace] = useState('');
  const [lifeStage, setLifeStage] = useState('');
  const [notes, setNotes] = useState('');

  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const [history, setHistory] = useState<ReportSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [activeReport, setActiveReport] = useState<LoadedReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, [clientId]);

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/practitioner/clients/${clientId}/spiralogic-report`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.reports ?? []);
        if (data.reports?.length > 0 && !activeReport) {
          loadReport(data.reports[0].id);
        }
      }
    } catch {
      // silently ignore
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
      const res = await fetch(`/api/practitioner/clients/${clientId}/spiralogic-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthData: {
            date: birthDate,
            time: birthTime,
            name: clientName || undefined,
            location: { placeName: birthPlace || undefined },
          },
          lifeStage: lifeStage || undefined,
          personalityNotes: notes
            ? notes.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
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
          name: clientName || undefined,
          location: { placeName: birthPlace || undefined },
        },
        reportData: data.report,
        createdAt: new Date().toISOString(),
      });

      loadHistory();
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <header className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-medium text-white">Spiralogic Report</h1>
            <p className="text-sm text-gray-500">
              {clientName ? `Client: ${clientName}` : 'Generate for client'}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">

            {/* Generate form */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h2 className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-5">
                Generate for Client
              </h2>

              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">
                    Client Name (optional)
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Noemi"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white
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
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white
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
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white
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
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white
                               text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">
                    Life Stage / Context (optional)
                  </label>
                  <input
                    type="text"
                    value={lifeStage}
                    onChange={(e) => setLifeStage(e.target.value)}
                    placeholder="e.g. Post-retreat, career transition"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white
                               text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">
                    Practitioner Notes (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Creative, highly sensitive"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white
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
            {!historyLoading && history.length > 0 && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
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
                          : 'border-gray-700 hover:border-gray-600 bg-gray-900/40'
                      }`}
                    >
                      <p className="text-xs text-white">{r.beingArchetype ?? 'Report'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Main: report view */}
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
              <SpiralogicReportView
                reportId={activeReport.id}
                report={activeReport.reportData}
                birthData={activeReport.birthData}
              />
            )}

            {!reportLoading && !reportError && !activeReport && !historyLoading && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-gray-500 font-light max-w-xs leading-relaxed">
                  Enter birth data and generate a Spiralogic report for this client.
                  It will be saved here for future reference.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
