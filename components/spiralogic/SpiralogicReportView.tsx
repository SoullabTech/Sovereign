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

// no React imports needed — all rendering uses JSX with no hooks

// ---- Types -----------------------------------------------------------------

interface ElementalBalance {
  fire: number;
  water: number;
  earth: number;
  air: number;
  dominantElement: string;
  underactiveElement: string;
  balanceSummary?: string;
}

interface CurrentPhase {
  element: string;
  phase: string;
  title: string;
  summary: string;
  majorLesson: string;
  edge: string;
  gifts: string[];
  currentTransits: string[];
}

interface SoulsJourney {
  stateOfBeing: string;
  stateOfBecoming: string;
  bridge: string;
}

interface ElementalFacet {
  facetKey: string;
  facetName: string;
  element: string;
  phase: string;
  archetype: string;
  natalSignature: string;
  currentActivation: string;
  growthEdge: string;
  gifts: string[];
  practices: string[];
}

interface KarmicSignature {
  title: string;
  description: string;
  lesson: string;
}

interface TimelineWindow {
  window: string;
  theme: string;
  interpretation: string;
  opportunity: string;
  caution: string;
}

interface IntegrationPractice {
  title: string;
  description: string;
  frequency?: string;
}

interface EvolutionDelta {
  sinceLastReport: string;
  repeatedPatterns: string[];
  emergingStrengths: string[];
  decompensatingPatterns?: string[];
}

export interface SpiralogicReportData {
  // New schema fields
  title?: string;
  subjectName?: string;
  oracleWelcome?: string;
  memberOverviewStory?: string;
  currentPhase?: CurrentPhase;
  soulsJourney?: SoulsJourney;
  elementalMapping?: ElementalFacet[];
  karmicSignatures?: KarmicSignature[];
  timelineForecast?: TimelineWindow[];
  integrationPractices?: IntegrationPractice[];
  evolutionDelta?: EvolutionDelta | null;
  generatedAt?: string;
  // Server-injected
  elementalBalanceOverview?: ElementalBalance;
  chartSignature?: Record<string, unknown>;
  // Legacy fields (backward compat — kept for older saved reports)
  personalOverview?: string;
  beingArchetype?: string;
  becomingArchetype?: string;
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

// ---- New schema section components ----------------------------------------

function OracleWelcomeSection({ text }: { text: string }) {
  return (
    <section className="mb-8 rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6 sm:p-8">
      <p className="text-xs uppercase tracking-[0.22em] text-amber-300/80">Oracle Welcome</p>
      <div className="mt-4 max-w-4xl whitespace-pre-wrap text-base leading-8 text-white/90">
        {text}
      </div>
    </section>
  );
}

function MemberOverviewStorySection({ text }: { text: string }) {
  return (
    <section className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
      <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/80">Member Overview Story</p>
      <h2 className="mt-2 text-2xl font-light tracking-tight text-white">Your Astrological Walk</h2>
      <div className="mt-4 max-w-4xl whitespace-pre-wrap text-base leading-8 text-white/85">
        {text}
      </div>
    </section>
  );
}

function CurrentPhaseSection({ phase }: { phase: CurrentPhase }) {
  const colors = elementColor(phase.element);
  return (
    <section className={`mb-8 rounded-3xl border ${colors.border} ${colors.bg} p-6 sm:p-8`}>
      <p className={`text-xs uppercase tracking-[0.22em] ${colors.text}`}>Current Spiralogic Phase</p>
      <h2 className="mt-2 text-2xl font-light tracking-tight text-white">{phase.title || phase.phase}</h2>
      <p className="mt-4 text-base leading-8 text-white/80">{phase.summary}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wider text-white/40 mb-2">Major Lesson</p>
          <p className="text-sm text-white/80">{phase.majorLesson}</p>
        </div>
        <div className="rounded-xl bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wider text-white/40 mb-2">Growth Edge</p>
          <p className="text-sm text-white/80">{phase.edge}</p>
        </div>
      </div>
      {phase.gifts?.length > 0 && (
        <div className="mt-4">
          <p className="text-xs uppercase tracking-wider text-white/40 mb-2">Gifts Activated</p>
          <div className="flex flex-wrap gap-2">
            {phase.gifts.map((g, i) => (
              <span key={i} className={`text-xs px-3 py-1 rounded-full ${colors.badge}`}>{g}</span>
            ))}
          </div>
        </div>
      )}
      {phase.currentTransits?.length > 0 && (
        <div className="mt-4">
          <p className="text-xs uppercase tracking-wider text-white/40 mb-2">Active Transits</p>
          <div className="space-y-2">
            {phase.currentTransits.map((t, i) => (
              <p key={i} className="text-sm text-white/60 leading-relaxed">• {t}</p>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function SoulsJourneySection({ journey }: { journey: SoulsJourney }) {
  return (
    <section className="mb-8 rounded-3xl border border-purple-500/20 bg-purple-500/5 p-6 sm:p-8">
      <p className="text-xs uppercase tracking-[0.22em] text-purple-300/80">Soul&apos;s Journey</p>
      <h2 className="mt-2 text-2xl font-light tracking-tight text-white">The Arc of Becoming</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wider text-white/40 mb-2">State of Being</p>
          <p className="text-sm leading-relaxed text-white/80">{journey.stateOfBeing}</p>
        </div>
        <div className="rounded-xl bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wider text-white/40 mb-2">Bridge</p>
          <p className="text-sm leading-relaxed text-white/80">{journey.bridge}</p>
        </div>
        <div className="rounded-xl bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wider text-white/40 mb-2">State of Becoming</p>
          <p className="text-sm leading-relaxed text-white/80">{journey.stateOfBecoming}</p>
        </div>
      </div>
    </section>
  );
}

function ElementalMappingSection({ facets }: { facets: ElementalFacet[] }) {
  return (
    <section className="mb-8">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.22em] text-white/50">Elemental Mapping</p>
        <h2 className="mt-2 text-2xl font-light tracking-tight text-white">The Spirals in Motion</h2>
      </div>
      <div className="space-y-6">
        {facets.map((facet) => {
          const colors = elementColor(facet.element);
          return (
            <div key={facet.facetKey} className={`rounded-2xl border ${colors.border} ${colors.bg} p-6`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className={`text-xs uppercase tracking-wider ${colors.text}`}>{facet.element}</p>
                  <h3 className="mt-1 text-lg font-light text-white">{facet.facetName}</h3>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full ${colors.badge}`}>{facet.archetype}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 mt-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/40 mb-1">Natal Signature</p>
                  <p className="text-sm text-white/70 leading-relaxed">{facet.natalSignature}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/40 mb-1">Currently Active</p>
                  <p className="text-sm text-white/70 leading-relaxed">{facet.currentActivation}</p>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs uppercase tracking-wider text-white/40 mb-1">Growth Edge</p>
                <p className="text-sm text-white/70 leading-relaxed">{facet.growthEdge}</p>
              </div>
              {(facet.gifts?.length > 0 || facet.practices?.length > 0) && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {facet.gifts?.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-white/40 mb-2">Gifts</p>
                      <div className="flex flex-wrap gap-1">
                        {facet.gifts.map((g, i) => (
                          <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${colors.badge}`}>{g}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {facet.practices?.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-white/40 mb-2">Practices</p>
                      <ul className="space-y-1">
                        {facet.practices.map((p, i) => (
                          <li key={i} className="text-xs text-white/60">• {p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function KarmicSignaturesSection({ items }: { items: KarmicSignature[] }) {
  return (
    <section className="mb-8 rounded-3xl border border-rose-500/20 bg-rose-500/5 p-6 sm:p-8">
      <p className="text-xs uppercase tracking-[0.22em] text-rose-300/80">Karmic &amp; Archetypal Signatures</p>
      <h2 className="mt-2 text-2xl font-light tracking-tight text-white">The Recurring Thread</h2>
      <div className="mt-6 space-y-5">
        {items.map((item, i) => (
          <div key={i} className="rounded-xl bg-white/5 p-4">
            <h3 className="text-sm font-medium text-white/90 mb-2">{item.title}</h3>
            <p className="text-sm text-white/70 leading-relaxed mb-2">{item.description}</p>
            <p className="text-xs text-rose-300/80 italic">Evolutionary invitation: {item.lesson}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TimelineForecastSection({ items }: { items: TimelineWindow[] }) {
  return (
    <section className="mb-8">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.22em] text-white/50">Timeline Forecast</p>
        <h2 className="mt-2 text-2xl font-light tracking-tight text-white">What is Emerging</h2>
      </div>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-white/60">{item.window}</span>
              <h3 className="text-sm font-medium text-white/90">{item.theme}</h3>
            </div>
            <p className="text-sm text-white/70 leading-relaxed mb-3">{item.interpretation}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wider text-emerald-400/70 mb-1">Opportunity</p>
                <p className="text-xs text-white/60">{item.opportunity}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-amber-400/70 mb-1">Watch For</p>
                <p className="text-xs text-white/60">{item.caution}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function IntegrationPracticesSection({ items }: { items: IntegrationPractice[] }) {
  return (
    <section className="mb-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6 sm:p-8">
      <p className="text-xs uppercase tracking-[0.22em] text-emerald-300/80">Integration Practices</p>
      <h2 className="mt-2 text-2xl font-light tracking-tight text-white">What is Being Asked</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {items.map((item, i) => (
          <div key={i} className="rounded-xl bg-white/5 p-4">
            <h3 className="text-sm font-medium text-white/90 mb-1">{item.title}</h3>
            {item.frequency && (
              <span className="text-xs text-emerald-300/70 mb-2 inline-block">{item.frequency}</span>
            )}
            <p className="text-sm text-white/70 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---- Main component --------------------------------------------------------

export function SpiralogicReportView({ reportId, report, birthData }: Props) {
  // Parse as local date (avoid UTC-offset shift that moves date back by 1 day)
  const birthDate = (() => {
    if (!birthData.date) return '';
    const [y, m, d] = birthData.date.split('-').map(Number);
    const dt = new Date(y, m - 1, d); // local midnight, no UTC shift
    return dt.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  })();

  return (
    <div className="w-full max-w-none overflow-x-hidden">
      {/* ── Report Header ─────────────────────────────────────────────── */}
      <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.22em] text-white/40">Spiralogic Evolutionary Report</p>
            <h1 className="mt-2 text-3xl font-extralight tracking-tight text-white break-words">
              {report.title || (report.subjectName ? `Report for ${report.subjectName}` : 'Your Evolutionary Report')}
            </h1>
            {birthData.name && (
              <p className="mt-1 text-sm text-white/50">{birthData.name}</p>
            )}
            <p className="mt-2 text-sm text-white/40">{birthDate}</p>
            {birthData.location?.placeName && (
              <p className="text-sm text-white/30">{birthData.location.placeName}</p>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            {report.elementalBalanceOverview && (
              <div className="flex flex-wrap gap-1.5">
                {(['fire','water','earth','air'] as const).map((el) => {
                  const val = report.elementalBalanceOverview![el as keyof typeof report.elementalBalanceOverview] as number;
                  if (typeof val !== 'number') return null;
                  const colors = elementColor(el);
                  return (
                    <span key={el} className={`text-xs px-2 py-0.5 rounded-full ${colors.badge}`}>
                      {el} {val}%
                    </span>
                  );
                })}
              </div>
            )}
            <a
              href={`/api/spiralogic-report/${reportId}/download`}
              download
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-xs text-white/70 hover:bg-white/20 transition-colors"
            >
              &#x2193; Download PDF
            </a>
          </div>
        </div>
      </div>

      {/* ── Oracle Welcome ─────────────────────────────────────────────── */}
      {report.oracleWelcome && <OracleWelcomeSection text={report.oracleWelcome} />}

      {/* ── Member Overview Story ──────────────────────────────────────── */}
      {(report.memberOverviewStory || report.personalOverview) && (
        <MemberOverviewStorySection text={report.memberOverviewStory || report.personalOverview || ''} />
      )}

      {/* ── Current Spiralogic Phase ───────────────────────────────────── */}
      {report.currentPhase && <CurrentPhaseSection phase={report.currentPhase} />}

      {/* ── Soul's Journey ─────────────────────────────────────────────── */}
      {report.soulsJourney && <SoulsJourneySection journey={report.soulsJourney} />}

      {/* ── Elemental Mapping ──────────────────────────────────────────── */}
      {report.elementalMapping && report.elementalMapping.length > 0 && (
        <ElementalMappingSection facets={report.elementalMapping} />
      )}

      {/* ── Karmic Signatures ──────────────────────────────────────────── */}
      {report.karmicSignatures && report.karmicSignatures.length > 0 && (
        <KarmicSignaturesSection items={report.karmicSignatures} />
      )}

      {/* ── Timeline Forecast ──────────────────────────────────────────── */}
      {report.timelineForecast && report.timelineForecast.length > 0 && (
        <TimelineForecastSection items={report.timelineForecast} />
      )}

      {/* ── Integration Practices ──────────────────────────────────────── */}
      {report.integrationPractices && report.integrationPractices.length > 0 && (
        <IntegrationPracticesSection items={report.integrationPractices} />
      )}

      {/* ── Evolution Delta (returning members) ───────────────────────── */}
      {report.evolutionDelta && (
        <section className="mb-8 rounded-3xl border border-violet-500/20 bg-violet-500/5 p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.22em] text-violet-300/80">Evolution Delta</p>
          <h2 className="mt-2 text-2xl font-light tracking-tight text-white">Since Your Last Report</h2>
          <p className="mt-4 text-base text-white/80 leading-relaxed">{report.evolutionDelta.sinceLastReport}</p>
          {report.evolutionDelta.emergingStrengths?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wider text-white/40 mb-2">Emerging Strengths</p>
              <ul className="space-y-1">
                {report.evolutionDelta.emergingStrengths.map((s, i) => (
                  <li key={i} className="text-sm text-white/70">• {s}</li>
                ))}
              </ul>
            </div>
          )}
          {report.evolutionDelta.repeatedPatterns?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wider text-white/40 mb-2">Recurring Patterns</p>
              <ul className="space-y-1">
                {report.evolutionDelta.repeatedPatterns.map((p, i) => (
                  <li key={i} className="text-sm text-white/60">• {p}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
