'use client';

import { motion } from 'framer-motion';
import { Flame, Droplet, Sprout, Wind, Sparkles, Eye, HelpCircle, type LucideIcon } from 'lucide-react';
import { ELEMENT_META, type YearAhead, type ElementKey } from '@/lib/soulPortrait/schema';

/**
 * YearAheadSection — Part II of a Soul Portrait (seasonal).
 *
 * A Spiralogic "Seasonal Spiral": development-centered — the year's transits read
 * as ecological forces moving the reader through Earth → Fire → Water → Air →
 * Aether. Rendered only when a portrait carries `yearAhead`. Static, no AI, no
 * memory. The natal portrait above it is Part I (timeless); this is the season.
 *
 * Colours read the portrait-theme tokens (`--sp-*`) set by SoulPortraitRenderer
 * on the page root — this section must render inside it (it always does).
 */

const ELEMENT_ICONS: Record<ElementKey, LucideIcon> = {
  fire: Flame,
  water: Droplet,
  earth: Sprout,
  air: Wind,
  aether: Sparkles,
};

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, ease: 'easeOut' },
} as const;

function Para({ text }: { text: string }) {
  return (
    <div className="space-y-5">
      {text.trim().split(/\n{2,}/).map((p, i) => (
        <p key={i} className="font-cormorant text-[1.05rem] leading-relaxed text-[var(--sp-ink-80)]">{p}</p>
      ))}
    </div>
  );
}

export function YearAheadSection({ yearAhead }: { yearAhead: YearAhead }) {
  const y = yearAhead;
  return (
    <section className="border-t border-[rgba(var(--sp-accent-rgb),0.15)] bg-gradient-to-b from-[var(--sp-ground-deep)] via-[var(--sp-ground)] to-[var(--sp-ground-deep)]">
      {/* ── Movement header ──────────────────────────────────────────── */}
      <motion.div {...fadeUp} className="mx-auto w-full max-w-3xl px-6 pt-20 pb-6 text-center sm:pt-28">
        <p className="font-raleway text-xs uppercase tracking-[0.3em] text-[var(--sp-accent)]">Part II</p>
        <h2 className="mt-4 font-cinzel text-3xl text-[var(--sp-ink-100)] sm:text-4xl">{y.title}</h2>
        {y.subtitle && (
          <p className="mt-3 font-raleway text-sm uppercase tracking-[0.22em] text-[var(--sp-ink-50)]">{y.subtitle}</p>
        )}
        {y.timeframe && (
          <p className="mt-2 font-cormorant text-lg italic text-[var(--sp-ink-60)]">{y.timeframe}</p>
        )}
      </motion.div>

      {/* ── Opening theme ────────────────────────────────────────────── */}
      <motion.div {...fadeUp} className="mx-auto w-full max-w-3xl px-6 pb-4">
        <div className="rounded-3xl border border-[rgba(var(--sp-accent-rgb),0.25)] bg-[rgba(var(--sp-surface-rgb),0.5)] p-7 shadow-[0_0_18px_var(--sp-glow)] sm:p-9">
          {y.openingHeadline && (
            <p className="mb-5 text-center font-cormorant text-[1.2rem] italic leading-relaxed text-[var(--sp-ink-100)]">
              {y.openingHeadline}
            </p>
          )}
          <Para text={y.openingTheme} />
        </div>
      </motion.div>

      {/* ── The five elemental phases ────────────────────────────────── */}
      <div className="mx-auto w-full max-w-3xl space-y-4 px-6 py-8">
        {y.phases.map((phase) => {
          const meta = ELEMENT_META[phase.element];
          const Icon = ELEMENT_ICONS[phase.element];
          const elColor = `var(--sp-el-${phase.element})`;
          return (
            <motion.div
              key={phase.element + phase.title}
              {...fadeUp}
              className="rounded-2xl border bg-[rgba(var(--sp-surface-rgb),0.4)] p-6"
              style={{
                borderColor: `var(--sp-el-${phase.element}-border)`,
                boxShadow: `0 0 24px var(--sp-el-${phase.element}-glow)`,
              }}
            >
              <div className="mb-3 flex items-center gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `var(--sp-el-${phase.element}-chip)` }}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.6} style={{ color: elColor }} />
                </span>
                <div>
                  <p className="font-raleway text-[0.7rem] uppercase tracking-[0.18em]" style={{ color: elColor }}>
                    {meta.label}{phase.timeframe ? ` · ${phase.timeframe}` : ''}
                  </p>
                  <h3 className="font-cinzel text-lg text-[var(--sp-ink-100)]">{phase.title}</h3>
                </div>
              </div>
              {phase.transits.length > 0 && (
                <p className="mb-3 font-raleway text-[0.68rem] uppercase tracking-[0.14em] text-[var(--sp-ink-40)]">
                  Traces to&nbsp;·&nbsp;{phase.transits.join(' · ')}
                </p>
              )}
              <Para text={phase.body} />
              {phase.question && (
                <p className="mt-4 font-cormorant text-[1.05rem] italic" style={{ color: elColor }}>
                  {phase.question}
                </p>
              )}
              {phase.practice && (
                <div className="mt-4 rounded-xl border border-[var(--sp-border)] bg-[rgba(var(--sp-ground-rgb),0.5)] p-4">
                  {phase.practice.label && (
                    <p className="mb-1 font-raleway text-[0.62rem] uppercase tracking-[0.18em] text-[var(--sp-accent)]">
                      {phase.practice.label}
                    </p>
                  )}
                  <p className="font-cormorant text-[0.98rem] leading-relaxed text-[var(--sp-ink-70)]">{phase.practice.prompt}</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ── The weather pattern ──────────────────────────────────────── */}
      {y.weatherPattern && y.weatherPattern.length > 0 && (
        <motion.div {...fadeUp} className="mx-auto w-full max-w-3xl px-6 py-6">
          <p className="mb-4 text-center font-raleway text-[0.7rem] uppercase tracking-[0.2em] text-[var(--sp-ink-50)]">
            The weather pattern
          </p>
          <div className="overflow-hidden rounded-2xl border border-[var(--sp-border)]">
            {y.weatherPattern.map((row, i) => {
              const meta = ELEMENT_META[row.element];
              return (
                <div
                  key={i}
                  className="flex items-center gap-4 border-b border-[var(--sp-border-soft)] bg-[rgba(var(--sp-surface-rgb),0.4)] px-5 py-3 last:border-b-0"
                >
                  <span className="w-28 shrink-0 font-cormorant text-[0.95rem] text-[var(--sp-ink-60)]">{row.season}</span>
                  <span
                    className="w-20 shrink-0 font-raleway text-[0.7rem] uppercase tracking-[0.14em]"
                    style={{ color: `var(--sp-el-${row.element})` }}
                  >
                    {meta.label}
                  </span>
                  <span className="font-cormorant text-[1.0rem] text-[var(--sp-ink-80)]">{row.invitation}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── The Golden Thread ────────────────────────────────────────── */}
      <motion.div {...fadeUp} className="mx-auto w-full max-w-3xl px-6 py-8">
        <div className="rounded-3xl border border-[rgba(var(--sp-accent-rgb),0.3)] bg-[rgba(var(--sp-surface-rgb),0.5)] p-7 shadow-[0_0_18px_var(--sp-glow)] sm:p-9">
          <div className="mb-4 flex items-center gap-3">
            <Eye className="h-5 w-5 text-[var(--sp-accent)]" strokeWidth={1.6} />
            <h3 className="font-cinzel text-xl text-[var(--sp-ink-100)]">The Golden Thread</h3>
          </div>
          <Para text={y.goldenThread} />
        </div>
      </motion.div>

      {/* ── Living questions ─────────────────────────────────────────── */}
      {y.questions.length > 0 && (
        <motion.div {...fadeUp} className="mx-auto w-full max-w-3xl px-6 pb-20 pt-2">
          <div className="mb-6 flex items-center gap-3">
            <HelpCircle className="h-5 w-5 text-[var(--sp-accent)]" strokeWidth={1.6} />
            <h3 className="font-cinzel text-xl text-[var(--sp-ink-100)]">Questions to Carry Through the Year</h3>
          </div>
          <ol className="space-y-4">
            {y.questions.map((q, i) => (
              <li key={i} className="flex gap-4">
                <span className="font-cinzel text-lg text-[rgba(var(--sp-accent-rgb),0.7)]">{i + 1}</span>
                <span className="font-cormorant text-[1.05rem] leading-relaxed text-[var(--sp-ink-80)]">{q}</span>
              </li>
            ))}
          </ol>
        </motion.div>
      )}

      {/* ── A closing word / blessing for the year (optional) ────────── */}
      {y.closing && (
        <motion.div {...fadeUp} className="mx-auto w-full max-w-3xl px-6 pb-24 pt-2">
          <div className="rounded-3xl border border-[rgba(var(--sp-accent-rgb),0.3)] bg-[rgba(var(--sp-surface-rgb),0.5)] p-7 shadow-[0_0_18px_var(--sp-glow)] sm:p-9">
            {y.closing.title && (
              <p className="mb-5 text-center font-raleway text-[0.7rem] uppercase tracking-[0.25em] text-[var(--sp-accent)]">
                {y.closing.title}
              </p>
            )}
            <Para text={y.closing.body} />
          </div>
        </motion.div>
      )}
    </section>
  );
}

export default YearAheadSection;
