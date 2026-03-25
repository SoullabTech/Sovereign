'use client';

/**
 * SpiralogicReportView
 *
 * Renders a complete Spiralogic Evolutionary Report from structured data.
 * Used by both the member-facing astrology dashboard and the practitioner client view.
 *
 * Props:
 *   reportId   - UUID of the saved report (used for PDF download URL)
 *   report     - SpiralogicReport data object
 *   birthData  - Birth information for the header
 *   isDownloading - optional controlled state (defaults to internal)
 */

import { useState } from 'react';

// ---- Types (mirrors spiralogicAstrologyService.ts) -------------------------

interface PlanetPlacement {
  planet: string;
  sign: string;
  house: number;
  degree: number;
  retrograde: boolean;
}

interface ElementalInsight {
  element: string;
  strength: number;
  planets: PlanetPlacement[];
  interpretation: string;
  challenges: string[];
  gifts: string[];
  practices: string[];
}

interface KarmicPoint {
  placement: PlanetPlacement;
  interpretation: string;
  lessons: string[];
  evolutionary_direction: string;
}

interface ReflectiveProtocol {
  name: string;
  element: string;
  description: string;
  steps: string[];
  timing: string;
  materials?: string[];
}

interface ElementalBalanceOverview {
  fire: number;
  water: number;
  earth: number;
  air: number;
  dominantElement: string;
  underactiveElement: string;
  balanceSummary: string;
}

interface NextAction {
  actions: string[];
  watchFor: string;
  journalPrompt: string;
}

interface EvolutionDelta {
  sinceLastReport: string;
  repeatedPatterns: string[];
  emergingStrengths: string[];
  decompensatingPatterns?: string[];
}

interface CurrentPhase {
  spiralogicPhase: string;
  activeTransits: string[];
  majorLifeLesson: string;
  edgeChallenge: string;
  emergentGift: string;
}

export interface SpiralogicReportData {
  userId?: string;
  birthChartId?: string;
  personalOverview: string;
  beingArchetype: string;
  becomingArchetype: string;
  currentPhase?: CurrentPhase;
  elementalBalanceOverview?: ElementalBalanceOverview;
  elementalInsights: {
    fire: ElementalInsight;
    water: ElementalInsight;
    earth: ElementalInsight;
    air: ElementalInsight;
  };
  karmicAxis: {
    northNode: KarmicPoint;
    southNode: KarmicPoint;
    saturn: KarmicPoint;
    pluto: KarmicPoint;
  };
  reflectiveProtocols: ReflectiveProtocol[];
  nextAction?: NextAction;
  evolutionDelta?: EvolutionDelta | null;
  generatedAt?: string;
}

export interface BirthDataShape {
  date: string;
  time: string;
  name?: string;
  location?: {
    placeName?: string;
    lat?: number;
    lng?: number;
    timezone?: string;
  };
}

interface Props {
  reportId: string;
  report: SpiralogicReportData;
  birthData: BirthDataShape;
}

// ---- Color palette ----------------------------------------------------------

const ELEMENT_COLORS: Record<string, { border: string; text: string; bg: string; badge: string }> = {
  fire: {
    border: 'border-amber-500/40',
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
    badge: 'bg-amber-500/20 text-amber-300',
  },
  water: {
    border: 'border-indigo-500/40',
    text: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    badge: 'bg-indigo-500/20 text-indigo-300',
  },
  earth: {
    border: 'border-green-500/40',
    text: 'text-green-400',
    bg: 'bg-green-500/10',
    badge: 'bg-green-500/20 text-green-300',
  },
  air: {
    border: 'border-slate-400/40',
    text: 'text-slate-300',
    bg: 'bg-slate-500/10',
    badge: 'bg-slate-500/20 text-slate-300',
  },
  aether: {
    border: 'border-purple-500/40',
    text: 'text-purple-400',
    bg: 'bg-purple-500/10',
    badge: 'bg-purple-500/20 text-purple-300',
  },
};

const elementColor = (elem: string) =>
  ELEMENT_COLORS[elem.toLowerCase()] ?? ELEMENT_COLORS.aether;

// ---- Sub-components --------------------------------------------------------

function SectionHeader({ label, sub }: { label: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-light text-white tracking-wide">{label}</h2>
      {sub && <p className="text-sm text-gray-500 mt-1">{sub}</p>}
      <div className="mt-3 h-px bg-gradient-to-r from-gray-600 to-transparent" />
    </div>
  );
}

function ElementCard({ insight, elem }: { insight: ElementalInsight; elem: string }) {
  const colors = elementColor(elem);
  return (
    <div className={`rounded-lg border ${colors.border} ${colors.bg} p-5`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-lg font-medium ${colors.text}`}>{insight.element}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${colors.badge}`}>
          {Math.round(insight.strength)}%
        </span>
      </div>

      {/* Strength bar */}
      <div className="h-1.5 bg-gray-700 rounded-full mb-4">
        <div
          className={`h-full rounded-full ${colors.text.replace('text-', 'bg-')}`}
          style={{ width: `${Math.min(100, Math.round(insight.strength))}%` }}
        />
      </div>

      <p className="text-sm text-gray-300 leading-relaxed mb-4">{insight.interpretation}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <p className="text-gray-500 uppercase tracking-widest mb-1">Gifts</p>
          <ul className="space-y-1">
            {insight.gifts.map((g, i) => (
              <li key={i} className="text-gray-300">- {g}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-gray-500 uppercase tracking-widest mb-1">Watch for</p>
          <ul className="space-y-1">
            {insight.challenges.map((c, i) => (
              <li key={i} className="text-gray-300">- {c}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-gray-500 uppercase tracking-widest mb-1">Practices</p>
          <ul className="space-y-1">
            {insight.practices.map((p, i) => (
              <li key={i} className="text-gray-300">- {p}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function KarmicCard({ label, point, colorKey }: { label: string; point: KarmicPoint; colorKey: string }) {
  const colors = elementColor(colorKey);
  return (
    <div className={`rounded-lg border ${colors.border} p-5`}>
      <h4 className={`text-base font-medium ${colors.text} mb-2`}>{label}</h4>
      <p className="text-sm text-gray-300 leading-relaxed mb-3">{point.interpretation}</p>
      {point.lessons.length > 0 && (
        <ul className="text-xs text-gray-400 space-y-1">
          {point.lessons.map((l, i) => (
            <li key={i}>- {l}</li>
          ))}
        </ul>
      )}
      {point.evolutionary_direction && (
        <p className={`text-xs mt-3 italic ${colors.text}`}>{point.evolutionary_direction}</p>
      )}
    </div>
  );
}

function ProtocolCard({ protocol }: { protocol: ReflectiveProtocol }) {
  const colors = elementColor(protocol.element);
  return (
    <div className={`rounded-lg border ${colors.border} ${colors.bg} p-5`}>
      <div className="flex items-start justify-between mb-2">
        <h4 className={`text-base font-medium ${colors.text}`}>{protocol.name}</h4>
        <span className="text-xs text-gray-500">{protocol.timing}</span>
      </div>
      <p className="text-sm text-gray-400 italic mb-3">{protocol.description}</p>
      <ol className="space-y-1 text-sm text-gray-300">
        {protocol.steps.map((step, i) => (
          <li key={i} className="flex gap-2">
            <span className={`font-mono text-xs ${colors.text} shrink-0 mt-0.5`}>{i + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      {protocol.materials && protocol.materials.length > 0 && (
        <p className="text-xs text-gray-500 mt-3">
          Materials: {protocol.materials.join(', ')}
        </p>
      )}
    </div>
  );
}

function CurrentPhaseHero({ phase }: { phase: CurrentPhase }) {
  return (
    <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 to-indigo-950/40 p-7">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <p className="text-xs text-purple-400 uppercase tracking-widest mb-1">Current Spiralogic Phase</p>
          <h3 className="text-2xl font-light text-white">{phase.spiralogicPhase}</h3>
        </div>
        {phase.activeTransits.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {phase.activeTransits.map((t, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/20">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-sm">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Major Life Lesson</p>
          <p className="text-gray-200 leading-relaxed">{phase.majorLifeLesson}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">The Edge</p>
          <p className="text-gray-300 leading-relaxed">{phase.edgeChallenge}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Emergent Gift</p>
          <p className="text-gray-300 leading-relaxed">{phase.emergentGift}</p>
        </div>
      </div>
    </div>
  );
}

function ElementalBalanceOverview({
  overview,
  insights,
}: {
  overview?: ElementalBalanceOverview;
  insights: SpiralogicReportData['elementalInsights'];
}) {
  const elements = [
    { key: 'fire' as const, label: 'Fire', icon: '🔥' },
    { key: 'water' as const, label: 'Water', icon: '💧' },
    { key: 'earth' as const, label: 'Earth', icon: '🌍' },
    { key: 'air' as const, label: 'Air', icon: '🌬' },
  ];

  // Use explicit overview fields if present, else fall back to elementalInsights strengths
  const getStrength = (key: 'fire' | 'water' | 'earth' | 'air') =>
    overview ? Math.round(overview[key]) : Math.round(insights[key].strength);

  const dominantElement = overview?.dominantElement ?? (() => {
    return elements.reduce((a, b) =>
      getStrength(a.key) >= getStrength(b.key) ? a : b
    ).key;
  })();

  const underactiveElement = overview?.underactiveElement ?? (() => {
    return elements.reduce((a, b) =>
      getStrength(a.key) <= getStrength(b.key) ? a : b
    ).key;
  })();

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900/40 p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
        <p className="text-xs text-gray-500 uppercase tracking-widest">Elemental Balance</p>
        <div className="flex gap-3 text-xs">
          <span className={`px-2 py-1 rounded-full ${elementColor(dominantElement).badge}`}>
            ↑ {dominantElement.charAt(0).toUpperCase() + dominantElement.slice(1)} dominant
          </span>
          <span className="px-2 py-1 rounded-full bg-gray-700/60 text-gray-400">
            ↓ {underactiveElement.charAt(0).toUpperCase() + underactiveElement.slice(1)} underactive
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {elements.map(({ key, label, icon }) => {
          const colors = elementColor(key);
          const strength = getStrength(key);
          const isDominant = key === dominantElement;
          return (
            <div key={key} className="flex items-center gap-3">
              <span className="text-base w-5 shrink-0">{icon}</span>
              <span className={`text-xs w-10 shrink-0 ${colors.text}`}>{label}</span>
              <div className="flex-1 h-2 bg-gray-800 rounded-full">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${colors.text.replace('text-', 'bg-')}`}
                  style={{ width: `${strength}%` }}
                />
              </div>
              <span className={`text-xs w-8 text-right tabular-nums ${isDominant ? colors.text : 'text-gray-500'}`}>
                {strength}%
              </span>
            </div>
          );
        })}
      </div>

      {overview?.balanceSummary && (
        <p className="text-xs text-gray-400 italic leading-relaxed border-t border-gray-700 pt-4">
          {overview.balanceSummary}
        </p>
      )}
    </div>
  );
}

function NextActionBlock({ nextAction }: { nextAction: NextAction }) {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-7 space-y-6">
      <p className="text-xs text-amber-500 uppercase tracking-widest">Your Next Steps</p>

      <div className="space-y-4">
        {nextAction.actions.map((action, i) => (
          <div key={i} className="flex gap-4 items-start">
            <span className="flex-shrink-0 w-7 h-7 rounded-full border border-amber-500/40 bg-amber-500/10
                             text-amber-400 text-xs font-mono flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <p className="text-gray-200 text-sm leading-relaxed">{action}</p>
          </div>
        ))}
      </div>

      {nextAction.watchFor && (
        <div className="border-t border-amber-500/20 pt-5">
          <p className="text-xs text-amber-400/70 uppercase tracking-widest mb-2">Watch for</p>
          <p className="text-gray-300 text-sm leading-relaxed">{nextAction.watchFor}</p>
        </div>
      )}

      {nextAction.journalPrompt && (
        <div className="rounded-lg bg-gray-800/40 border border-gray-700 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Journal Prompt</p>
          <p className="text-gray-300 text-sm italic leading-relaxed">"{nextAction.journalPrompt}"</p>
        </div>
      )}
    </div>
  );
}

function EvolutionDeltaBlock({ delta }: { delta: EvolutionDelta }) {
  return (
    <div className="rounded-xl border border-gray-600/40 bg-gray-900/30 p-6 space-y-5">
      <p className="text-xs text-gray-500 uppercase tracking-widest">
        Evolution Since Last Report
      </p>

      <p className="text-sm text-gray-300 leading-relaxed italic">
        {delta.sinceLastReport}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
        {delta.repeatedPatterns.length > 0 && (
          <div>
            <p className="text-gray-500 uppercase tracking-widest mb-2">Recurring</p>
            <ul className="space-y-1.5">
              {delta.repeatedPatterns.map((p, i) => (
                <li key={i} className="flex gap-2 text-gray-400">
                  <span className="text-gray-600 shrink-0">&#x27F3;</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}

        {delta.emergingStrengths.length > 0 && (
          <div>
            <p className="text-gray-500 uppercase tracking-widest mb-2">Emerging</p>
            <ul className="space-y-1.5">
              {delta.emergingStrengths.map((s, i) => (
                <li key={i} className="flex gap-2 text-gray-400">
                  <span className="text-green-600 shrink-0">&#x2191;</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {delta.decompensatingPatterns && delta.decompensatingPatterns.length > 0 && (
          <div className="sm:col-span-2">
            <p className="text-gray-500 uppercase tracking-widest mb-2">Watch</p>
            <ul className="space-y-1.5">
              {delta.decompensatingPatterns.map((d, i) => (
                <li key={i} className="flex gap-2 text-gray-400">
                  <span className="text-amber-600 shrink-0">&#x25B3;</span>
                  {d}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Main component --------------------------------------------------------

export function SpiralogicReportView({ reportId, report, birthData }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadError(null);
    try {
      const res = await fetch(`/api/spiralogic-report/${reportId}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? 'Download failed');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const name = (birthData.name ?? 'report').replace(/[^a-z0-9]/gi, '-').toLowerCase();
      a.href = url;
      a.download = `spiralogic-evolutionary-report-${name}-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const birthDate = birthData.date
    ? new Date(birthData.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="max-w-4xl mx-auto space-y-12 text-gray-200">

      {/* ---- Header ---- */}
      <div className="text-center space-y-3 pb-8 border-b border-gray-700">
        <p className="text-xs text-gray-500 uppercase tracking-widest">Spiralogic Evolutionary Report</p>
        {birthData.name && (
          <h1 className="text-4xl font-extralight text-white">{birthData.name}</h1>
        )}
        {birthDate && (
          <p className="text-sm text-gray-400">
            Born {birthDate}
            {birthData.time ? ` at ${birthData.time}` : ''}
            {birthData.location?.placeName ? ` in ${birthData.location.placeName}` : ''}
          </p>
        )}
        {report.generatedAt && (
          <p className="text-xs text-gray-600">
            Generated {new Date(report.generatedAt).toLocaleDateString()}
          </p>
        )}

        {/* Download button */}
        <div className="pt-4">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600/80 hover:bg-amber-500
                       disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm rounded-lg
                       transition-colors duration-200"
          >
            {downloading ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                Generating PDF...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </>
            )}
          </button>
          {downloadError && (
            <p className="text-xs text-red-400 mt-2">{downloadError}</p>
          )}
        </div>
      </div>

      {/* ---- Current Phase (prominent) ---- */}
      {report.currentPhase && (
        <section>
          <CurrentPhaseHero phase={report.currentPhase} />
        </section>
      )}

      {/* ---- Introduction / Overview ---- */}
      <section>
        <SectionHeader label="Your Soul's Journey" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-5">
            <p className="text-xs text-amber-500 uppercase tracking-widest mb-2">State of Being</p>
            <p className="text-xl text-white font-light">{report.beingArchetype}</p>
          </div>
          <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/5 p-5">
            <p className="text-xs text-indigo-400 uppercase tracking-widest mb-2">State of Becoming</p>
            <p className="text-xl text-white font-light">{report.becomingArchetype}</p>
          </div>
        </div>
        <p className="text-base text-gray-300 leading-relaxed">{report.personalOverview}</p>
      </section>

      {/* ---- Elemental Mapping ---- */}
      <section>
        <SectionHeader
          label="Elemental Mapping"
          sub="Four elements, three facets each — your evolutionary architecture"
        />
        <ElementalBalanceOverview overview={report.elementalBalanceOverview} insights={report.elementalInsights} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          {(['fire', 'water', 'earth', 'air'] as const).map((elem) => (
            <ElementCard key={elem} elem={elem} insight={report.elementalInsights[elem]} />
          ))}
        </div>
      </section>

      {/* ---- Karmic Insights ---- */}
      <section>
        <SectionHeader
          label="Karmic Insights"
          sub="Nodes, Saturn, and Pluto — the deep structural forces"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <KarmicCard label="North Node — Evolutionary Direction" point={report.karmicAxis.northNode} colorKey="aether" />
          <KarmicCard label="South Node — Innate Gifts" point={report.karmicAxis.southNode} colorKey="earth" />
          <KarmicCard label="Saturn — Path of Mastery" point={report.karmicAxis.saturn} colorKey="earth" />
          <KarmicCard label="Pluto — Deepest Transformation" point={report.karmicAxis.pluto} colorKey="water" />
        </div>
      </section>

      {/* ---- Practices ---- */}
      {report.reflectiveProtocols.length > 0 && (
        <section>
          <SectionHeader
            label="Sacred Practices"
            sub="Tailored rituals for integration and embodiment"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {report.reflectiveProtocols.map((p, i) => (
              <ProtocolCard key={i} protocol={p} />
            ))}
          </div>
        </section>
      )}

      {/* ---- Evolution Delta ---- */}
      {report.evolutionDelta && (
        <section>
          <EvolutionDeltaBlock delta={report.evolutionDelta} />
        </section>
      )}

      {/* ---- Next Action ---- */}
      {report.nextAction && (
        <section>
          <NextActionBlock nextAction={report.nextAction} />
        </section>
      )}

      {/* ---- Footer CTA ---- */}
      <div className="text-center pb-8 border-t border-gray-700 pt-8">
        <p className="text-sm text-gray-500 leading-relaxed max-w-lg mx-auto mb-6">
          This report is a reflective mirror, not a prescription. Bring what resonates
          into dialogue with a practitioner or with MAIA for deeper integration.
        </p>
        <a
          href="/maia"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-colors"
          style={{
            backgroundColor: 'rgba(216,138,45,0.85)',
            color: '#1a0f00',
          }}
        >
          Talk with MAIA about your chart
        </a>
      </div>
    </div>
  );
}
