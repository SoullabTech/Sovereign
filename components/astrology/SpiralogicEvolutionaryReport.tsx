'use client';

/**
 * Spiralogic Evolutionary Report — Renderer
 *
 * Renders the full AI-generated report in MAIA's dark/gold aesthetic.
 * Follows the Spiralogic template: Fire → Water → Earth → Air → Karmic → Balance → Rituals → Timeline.
 */

import { motion } from 'framer-motion';
import type { SpiralogicEvolutionaryReportData, SpiralogicFacetReport, ElementReport } from '@/lib/astrology/spiralogicReportTypes';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SpiralogicEvolutionaryReportProps {
  report: SpiralogicEvolutionaryReportData;
  memberName: string;
  onRegenerate?: () => void;
}

// ---------------------------------------------------------------------------
// Style helpers
// ---------------------------------------------------------------------------

const ELEMENT_COLORS: Record<string, { border: string; accent: string; bg: string; text: string }> = {
  fire: {
    border: 'border-orange-700/50',
    accent: '#fb923c',
    bg: 'rgba(120, 53, 15, 0.15)',
    text: '#fed7aa',
  },
  water: {
    border: 'border-blue-700/50',
    accent: '#60a5fa',
    bg: 'rgba(30, 58, 138, 0.15)',
    text: '#bfdbfe',
  },
  earth: {
    border: 'border-emerald-700/50',
    accent: '#34d399',
    bg: 'rgba(6, 78, 59, 0.15)',
    text: '#a7f3d0',
  },
  air: {
    border: 'border-violet-700/50',
    accent: '#a78bfa',
    bg: 'rgba(76, 29, 149, 0.15)',
    text: '#ddd6fe',
  },
};

function stageBadge(stage: string): string {
  switch (stage) {
    case 'vector': return 'Intelligence';
    case 'circle': return 'Intention';
    case 'spiral': return 'Goal';
    default: return stage;
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-serif mb-4 tracking-wide" style={{ color: '#D88A2D', fontWeight: 300 }}>
      {children}
    </h2>
  );
}

function Divider() {
  return <div className="my-8 border-t" style={{ borderColor: '#9B6B3C40' }} />;
}

function FacetCard({ facet, elementColor }: { facet: SpiralogicFacetReport; elementColor: typeof ELEMENT_COLORS[string] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`p-5 border mb-4`}
      style={{ backgroundColor: elementColor.bg, borderColor: elementColor.accent + '40' }}
    >
      {/* Facet header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xs font-mono mr-2" style={{ color: elementColor.accent, opacity: 0.7 }}>
            House {facet.house}
          </span>
          <span className="text-xs px-2 py-0.5 border" style={{ color: elementColor.accent, borderColor: elementColor.accent + '40' }}>
            {stageBadge(facet.stage)}
          </span>
        </div>
        {facet.planets.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-end">
            {facet.planets.map((p) => (
              <span key={p} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: elementColor.accent + '25', color: elementColor.accent }}>
                {p}
                {facet.planetSigns[p] ? ` · ${facet.planetSigns[p]}` : ''}
              </span>
            ))}
          </div>
        )}
      </div>

      <h4 className="text-base font-serif mb-1" style={{ color: elementColor.text, fontWeight: 400 }}>
        {facet.label}
      </h4>
      <p className="text-sm italic mb-3" style={{ color: elementColor.accent, fontWeight: 300 }}>
        {facet.keyTheme}
      </p>

      <p className="text-sm mb-4 leading-relaxed" style={{ color: '#E7E2CF', fontWeight: 300 }}>
        {facet.narrative}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="text-xs p-3 border" style={{ borderColor: '#22c55e40', backgroundColor: 'rgba(20,83,45,0.2)' }}>
          <div className="mb-1 font-medium" style={{ color: '#86efac' }}>Lean Into</div>
          <div style={{ color: '#E7E2CF', fontWeight: 300 }}>{facet.leanInto}</div>
        </div>
        <div className="text-xs p-3 border" style={{ borderColor: '#f9731640', backgroundColor: 'rgba(124,45,18,0.2)' }}>
          <div className="mb-1 font-medium" style={{ color: '#fdba74' }}>Watch For</div>
          <div style={{ color: '#E7E2CF', fontWeight: 300 }}>{facet.watchFor}</div>
        </div>
      </div>
    </motion.div>
  );
}

function ElementSection({ el }: { el: ElementReport }) {
  const colors = ELEMENT_COLORS[el.element] ?? ELEMENT_COLORS.fire;
  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">{el.emoji}</span>
        <div>
          <h3 className="text-lg font-serif" style={{ color: colors.accent, fontWeight: 300 }}>
            {el.element.charAt(0).toUpperCase() + el.element.slice(1)} Pathway
          </h3>
          <p className="text-xs" style={{ color: '#E7E2CF', fontWeight: 300 }}>{el.subtitle}</p>
        </div>
        <div className="ml-auto text-right">
          <span className="text-sm font-mono" style={{ color: colors.accent }}>{el.percentage}%</span>
          <div className="w-24 h-1.5 mt-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${el.percentage}%`, backgroundColor: colors.accent }}
            />
          </div>
        </div>
      </div>

      {el.facets.map((f) => (
        <FacetCard key={f.house} facet={f} elementColor={colors} />
      ))}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SpiralogicEvolutionaryReport({ report, memberName, onRegenerate }: SpiralogicEvolutionaryReportProps) {
  const formattedDate = new Date(report.generatedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" style={{ color: '#E7E2CF' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <p className="text-xs tracking-widest uppercase mb-2" style={{ color: '#9B6B3C', fontWeight: 300 }}>
          Spiralogic Evolutionary Report
        </p>
        <h1 className="text-3xl font-serif mb-1" style={{ color: '#D88A2D', fontWeight: 300 }}>
          {memberName}
        </h1>
        <p className="text-sm" style={{ color: '#E7E2CF', fontWeight: 300 }}>
          Born {report.birthDate} · {report.birthLocation}
        </p>
        <div className="flex justify-center gap-6 mt-4">
          <span className="text-xs" style={{ color: '#fb923c' }}>Sun {report.big3.sun}</span>
          <span className="text-xs" style={{ color: '#60a5fa' }}>Moon {report.big3.moon}</span>
          <span className="text-xs" style={{ color: '#a78bfa' }}>Rising {report.big3.rising}</span>
        </div>
        <p className="text-xs mt-2 italic" style={{ color: '#9B6B3C', fontWeight: 300 }}>
          Generated {formattedDate}
        </p>
      </motion.div>

      {/* Introduction */}
      <section className="mb-8 p-6 border" style={{ borderColor: '#9B6B3C40', backgroundColor: 'rgba(155, 107, 60, 0.07)' }}>
        <SectionTitle>Your Evolutionary Theme</SectionTitle>
        <p className="text-base leading-relaxed font-serif italic" style={{ color: '#E7E2CF', fontWeight: 300 }}>
          {report.introduction}
        </p>
      </section>

      {/* Current Phase */}
      <section className="mb-8">
        <SectionTitle>Current Evolutionary Phase</SectionTitle>
        <div className="p-5 border mb-4" style={{ borderColor: '#D88A2D40', backgroundColor: 'rgba(216, 138, 45, 0.08)' }}>
          <p className="text-sm font-medium mb-2" style={{ color: '#D88A2D' }}>{report.currentPhase.majorLesson}</p>
          <p className="text-sm leading-relaxed" style={{ color: '#E7E2CF', fontWeight: 300 }}>
            {report.currentPhase.narrative}
          </p>
        </div>
        {report.currentPhase.majorTransits.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {report.currentPhase.majorTransits.map((t, i) => (
              <div key={i} className="text-xs p-3 border" style={{ borderColor: '#D88A2D30', color: '#E7E2CF', fontWeight: 300 }}>
                <span style={{ color: '#D88A2D' }}>{t.planet}</span> — {t.theme}
              </div>
            ))}
          </div>
        )}
      </section>

      <Divider />

      {/* Elemental Mapping */}
      <section className="mb-2">
        <SectionTitle>Your Elemental Map — 12 Spiralogic Facets</SectionTitle>
        {report.elements.map((el) => (
          <ElementSection key={el.element} el={el} />
        ))}
      </section>

      <Divider />

      {/* Karmic Insights */}
      <section className="mb-8">
        <SectionTitle>Karmic Insights</SectionTitle>
        <p className="text-sm leading-relaxed mb-5" style={{ color: '#E7E2CF', fontWeight: 300 }}>
          {report.karmicInsights.narrative}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 border" style={{ borderColor: '#9B6B3C40' }}>
            <div className="text-xs mb-1" style={{ color: '#9B6B3C' }}>South Node (Past)</div>
            <div className="text-sm font-serif mb-1" style={{ color: '#E7E2CF' }}>
              {report.karmicInsights.southNode.sign} · House {report.karmicInsights.southNode.house}
            </div>
            <div className="text-xs" style={{ color: '#E7E2CF', fontWeight: 300 }}>{report.karmicInsights.southNode.description}</div>
          </div>
          <div className="p-4 border" style={{ borderColor: '#D88A2D40' }}>
            <div className="text-xs mb-1" style={{ color: '#D88A2D' }}>North Node (Direction)</div>
            <div className="text-sm font-serif mb-1" style={{ color: '#E7E2CF' }}>
              {report.karmicInsights.northNode.sign} · House {report.karmicInsights.northNode.house}
            </div>
            <div className="text-xs" style={{ color: '#E7E2CF', fontWeight: 300 }}>{report.karmicInsights.northNode.description}</div>
          </div>
          <div className="p-4 border" style={{ borderColor: '#60a5fa40' }}>
            <div className="text-xs mb-1" style={{ color: '#60a5fa' }}>Saturn (Mastery Lesson)</div>
            <div className="text-sm font-serif mb-1" style={{ color: '#E7E2CF' }}>
              {report.karmicInsights.saturn.sign} · House {report.karmicInsights.saturn.house}
            </div>
            <div className="text-xs" style={{ color: '#E7E2CF', fontWeight: 300 }}>{report.karmicInsights.saturn.lesson}</div>
          </div>
          <div className="p-4 border" style={{ borderColor: '#a78bfa40' }}>
            <div className="text-xs mb-1" style={{ color: '#a78bfa' }}>Pluto (Transformation)</div>
            <div className="text-sm font-serif mb-1" style={{ color: '#E7E2CF' }}>
              {report.karmicInsights.pluto.sign} · House {report.karmicInsights.pluto.house}
            </div>
            <div className="text-xs" style={{ color: '#E7E2CF', fontWeight: 300 }}>{report.karmicInsights.pluto.transformation}</div>
          </div>
        </div>
        {report.karmicInsights.twelfthHousePlanets.length > 0 && (
          <div className="mt-4 text-xs p-3 border" style={{ borderColor: '#60a5fa30', color: '#bfdbfe', fontWeight: 300 }}>
            12th House (Hidden Realm): {report.karmicInsights.twelfthHousePlanets.join(', ')}
          </div>
        )}
      </section>

      <Divider />

      {/* Elemental Balance */}
      <section className="mb-8">
        <SectionTitle>Elemental Balance</SectionTitle>
        <p className="text-sm leading-relaxed mb-5" style={{ color: '#E7E2CF', fontWeight: 300 }}>
          {report.elementalBalance.narrative}
        </p>

        {/* Balance bars */}
        <div className="space-y-3 mb-5">
          {(Object.entries(report.elementalBalance.percentages) as Array<[string, number]>).map(([elem, pct]) => {
            const colors = ELEMENT_COLORS[elem] ?? ELEMENT_COLORS.fire;
            return (
              <div key={elem} className="flex items-center gap-3">
                <span className="w-14 text-xs capitalize" style={{ color: colors.accent }}>{elem}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: colors.accent }}
                  />
                </div>
                <span className="w-8 text-xs text-right font-mono" style={{ color: colors.accent }}>{pct}%</span>
              </div>
            );
          })}
        </div>

        {/* Dominance may be null (the versioned rule declined the claim) —
            render balanced/none honestly. Copy is PROPOSED pending review. */}
        <div className="text-xs p-3 border mb-4" style={{ borderColor: '#9B6B3C40', color: '#E7E2CF', fontWeight: 300 }}>
          Dominant: <span style={{ color: '#D88A2D' }}>{report.elementalBalance.dominant ?? 'none — balanced'}</span>
          &nbsp; · &nbsp;
          Underactive: <span style={{ color: '#9B6B3C' }}>{report.elementalBalance.underactive ?? 'none'}</span>
        </div>

        {report.elementalBalance.integrationPractices.length > 0 && (
          <div>
            <p className="text-xs mb-2" style={{ color: '#9B6B3C' }}>Integration Practices</p>
            <ul className="space-y-2">
              {report.elementalBalance.integrationPractices.map((p, i) => (
                <li key={i} className="text-sm flex gap-2" style={{ color: '#E7E2CF', fontWeight: 300 }}>
                  <span style={{ color: '#D88A2D' }}>·</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <Divider />

      {/* Practical Rituals */}
      {report.practicalRituals.length > 0 && (
        <section className="mb-8">
          <SectionTitle>Practical Rituals</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {report.practicalRituals.map((ritual, i) => (
              <div key={i} className="p-4 border" style={{ borderColor: '#D88A2D40', backgroundColor: 'rgba(216,138,45,0.05)' }}>
                <div className="text-xs mb-1" style={{ color: '#D88A2D' }}>{ritual.planet}</div>
                <div className="text-sm font-serif mb-2" style={{ color: '#E7E2CF', fontWeight: 400 }}>{ritual.title}</div>
                <div className="text-xs leading-relaxed" style={{ color: '#E7E2CF', fontWeight: 300 }}>{ritual.practice}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Timeline */}
      {report.timeline.length > 0 && (
        <section className="mb-8">
          <SectionTitle>Timeline — Coming Cycles</SectionTitle>
          <div className="space-y-3">
            {report.timeline.map((t, i) => (
              <div key={i} className="p-4 border" style={{ borderColor: '#9B6B3C40' }}>
                <div className="text-xs mb-1 font-medium" style={{ color: '#D88A2D' }}>{t.period}</div>
                <div className="text-sm" style={{ color: '#E7E2CF', fontWeight: 300 }}>{t.themes}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <Divider />

      {/* Closing */}
      <section className="mb-8 text-center">
        <p className="text-base leading-relaxed font-serif italic" style={{ color: '#E7E2CF', fontWeight: 300 }}>
          {report.closing}
        </p>
      </section>

      {/* Regenerate */}
      {onRegenerate && (
        <div className="text-center mt-8">
          <button
            onClick={onRegenerate}
            className="text-xs px-5 py-2 border transition-colors"
            style={{
              borderColor: '#9B6B3C60',
              color: '#9B6B3C',
              backgroundColor: 'transparent',
            }}
          >
            Regenerate Report
          </button>
          <p className="text-xs mt-2 italic" style={{ color: '#9B6B3C', fontWeight: 300, opacity: 0.6 }}>
            This will replace your current report
          </p>
        </div>
      )}
    </div>
  );
}
