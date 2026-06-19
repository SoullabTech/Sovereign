'use client';

/**
 * SoulPortraitRenderer
 * ────────────────────────────────────────────────────────────────────────
 * Renders any object conforming to `SoulPortrait` as a long-form, letter-like
 * page. Reusable across people — the renderer never needs to change when a new
 * portrait (static or generated) is added.
 *
 * The ethical framing (symbolic-not-fate · companions-not-cages ·
 * becoming-not-fixed) is rendered UNCONDITIONALLY, near the top and again at
 * the close. That is the structural enforcement of the design law.
 */

import { motion } from 'framer-motion';
import {
  Flame,
  Droplet,
  Sprout,
  Wind,
  Sparkles,
  BookOpen,
  Fingerprint,
  Eye,
  Compass,
  Mountain,
  Sunrise,
  HelpCircle,
  Users,
  Quote,
  type LucideIcon,
} from 'lucide-react';
import {
  ELEMENT_META,
  RESONANCE_LABEL,
  type SoulPortrait,
  type ElementKey,
} from '@/lib/soulPortrait/schema';
import { SoulPortraitMentor } from '@/components/soulPortrait/SoulPortraitMentor';

const ELEMENT_ICONS: Record<ElementKey, LucideIcon> = {
  fire: Flame,
  water: Droplet,
  earth: Sprout,
  air: Wind,
  aether: Sparkles,
};

/** Split a block of text into paragraphs (blank-line separated), preserving
 * single line breaks within a paragraph as <br/>. */
function Prose({ text, className = '' }: { text: string; className?: string }) {
  const paragraphs = text.trim().split(/\n{2,}/);
  return (
    <div className={`space-y-5 ${className}`}>
      {paragraphs.map((para, i) => {
        const lines = para.split('\n');
        return (
          <p key={i} className="text-[1.05rem] leading-relaxed text-maia-ink-80 font-cormorant">
            {lines.map((line, j) => (
              <span key={j}>
                {line}
                {j < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, ease: 'easeOut' },
} as const;

function Section({
  index,
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  index: number;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <motion.section {...fadeUp} className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-16">
      <div className="mb-7 flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-maia-navy-700 bg-maia-navy-850 text-sm font-raleway text-maia-gold">
          {index}
        </span>
        <Icon className="h-5 w-5 text-maia-gold" strokeWidth={1.6} />
        <div>
          <h2 className="font-cinzel text-xl text-maia-ink-100 sm:text-2xl">{title}</h2>
          {subtitle && (
            <p className="font-raleway text-xs uppercase tracking-[0.2em] text-maia-ink-50">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </motion.section>
  );
}

export function SoulPortraitRenderer({ portrait }: { portrait: SoulPortrait }) {
  const p = portrait;

  return (
    <main className="min-h-screen bg-gradient-to-b from-maia-navy-950 via-maia-navy-900 to-maia-navy-950 pb-24 text-maia-ink-80">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <header className="mx-auto w-full max-w-3xl px-6 pt-20 pb-10 text-center sm:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <p className="font-raleway text-xs uppercase tracking-[0.3em] text-maia-gold">
            A Spiralogic Soul Portrait
          </p>
          <h1 className="mt-4 font-cinzel text-3xl text-maia-ink-100 sm:text-4xl">{p.person.name}</h1>
          {p.person.age != null && (
            <p className="mt-3 font-cormorant text-lg italic text-maia-ink-60">
              {`age ${p.person.age}`}
            </p>
          )}
        </motion.div>
      </header>

      {/* ── Framing (always rendered, top) ───────────────────────────── */}
      <div className="mx-auto w-full max-w-3xl px-6">
        <div className="rounded-2xl border border-maia-navy-700 bg-maia-navy-850/60 p-6 shadow-maia-panel">
          <p className="mb-3 font-raleway text-[0.7rem] uppercase tracking-[0.2em] text-maia-ink-50">
            How to read this
          </p>
          <ul className="space-y-3">
            {p.framing.notes.map((note, i) => (
              <li key={i} className="flex gap-3 font-cormorant text-[1.02rem] leading-relaxed text-maia-ink-60">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-maia-gold/70" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 1. Opening Letter */}
      <Section index={1} title="Opening Letter" icon={BookOpen}>
        <Prose text={p.openingLetter} />
      </Section>

      {/* 2. Soul Signature */}
      <Section index={2} title="Soul Signature" subtitle={p.soulSignature.headline} icon={Fingerprint}>
        <Prose text={p.soulSignature.body} className="mb-8" />
        <div className="grid gap-3 sm:grid-cols-2">
          {p.natalChartSummary.placements.map((pl, i) => (
            <div key={i} className="rounded-xl border border-maia-navy-700 bg-maia-navy-850/50 p-4">
              <p className="font-cinzel text-sm text-maia-ink-100">
                {pl.body}
                {pl.sign && <span className="text-maia-gold"> · {pl.sign}</span>}
                {pl.house != null && <span className="text-maia-ink-50"> · {pl.house}th House</span>}
                {pl.angle && <span className="text-maia-ink-50"> · {pl.angle}</span>}
              </p>
              <p className="mt-2 font-cormorant text-[0.98rem] leading-relaxed text-maia-ink-60">{pl.meaning}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 font-cormorant text-[1.02rem] leading-relaxed text-maia-ink-80 italic">
          {p.natalChartSummary.synthesis}
        </p>
      </Section>

      {/* 3. Elemental Architecture */}
      <Section index={3} title="Elemental Architecture" subtitle="Fire · Water · Earth · Air · Aether" icon={Sparkles}>
        <div className="space-y-4">
          {p.elementalProfile.map((el) => {
            const meta = ELEMENT_META[el.element];
            const Icon = ELEMENT_ICONS[el.element];
            return (
              <div
                key={el.element}
                className="rounded-2xl border bg-maia-navy-850/40 p-5"
                style={{ borderColor: `${meta.color}40`, boxShadow: `0 0 24px ${meta.glow}` }}
              >
                <div className="mb-2 flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${meta.color}1f` }}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.6} style={{ color: meta.color }} />
                  </span>
                  <div>
                    <h3 className="font-cinzel text-lg text-maia-ink-100">{el.title}</h3>
                    <p className="font-raleway text-[0.7rem] uppercase tracking-[0.18em]" style={{ color: meta.color }}>
                      {el.keyword}
                    </p>
                  </div>
                </div>
                <p className="font-cormorant text-[1.02rem] leading-relaxed text-maia-ink-80">{el.body}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* 4. Archetypal Profile */}
      <Section
        index={4}
        title="Archetypal Profile"
        subtitle="Companions, not cages"
        icon={Compass}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {p.archetypalProfile.map((a) => (
            <div key={a.key} className="flex flex-col rounded-xl border border-maia-navy-700 bg-maia-navy-850/50 p-5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="font-cinzel text-base text-maia-ink-100">{a.name}</h3>
                <span className="font-raleway text-[0.62rem] uppercase tracking-wider text-maia-ink-50">
                  {RESONANCE_LABEL[a.resonance]}
                </span>
              </div>
              <p className="font-cormorant text-[0.98rem] leading-relaxed text-maia-ink-80">{a.essence}</p>
              <div className="mt-3 space-y-1.5 border-t border-maia-navy-700 pt-3">
                <p className="font-cormorant text-[0.92rem] leading-snug text-maia-ink-60">
                  <span className="text-maia-gold">Gift — </span>
                  {a.gift}
                </p>
                <p className="font-cormorant text-[0.92rem] leading-snug text-maia-ink-50">
                  <span className="text-maia-ink-40">Growth edge — </span>
                  {a.shadow}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 5. The Seer and the Prophet — the heart */}
      <motion.section {...fadeUp} className="mx-auto w-full max-w-3xl px-6 py-14 sm:py-20">
        <div className="rounded-3xl border border-maia-gold/30 bg-maia-navy-850/50 p-7 shadow-maia-spice-glow sm:p-10">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-maia-gold/40 bg-maia-navy-900 text-sm font-raleway text-maia-gold">
              5
            </span>
            <Eye className="h-5 w-5 text-maia-gold" strokeWidth={1.6} />
            <div>
              <h2 className="font-cinzel text-xl text-maia-ink-100 sm:text-2xl">{p.seerAndProphet.title}</h2>
              {p.seerAndProphet.subtitle && (
                <p className="font-raleway text-xs uppercase tracking-[0.2em] text-maia-gold">
                  {p.seerAndProphet.subtitle}
                </p>
              )}
            </div>
          </div>
          <Prose text={p.seerAndProphet.body} />
          {p.seerAndProphet.blessing && p.seerAndProphet.blessing.length > 0 && (
            <div className="mt-8 border-t border-maia-gold/20 pt-7 text-center">
              {p.seerAndProphet.blessing.map((line, i) => (
                <p key={i} className="font-cormorant text-[1.1rem] italic leading-relaxed text-maia-ink-80">
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* 6. Challenges as Training */}
      <Section index={6} title="Challenges as Training" icon={Mountain}>
        <Prose text={p.challengesAsTraining.body} className="mb-6" />
        {p.challengesAsTraining.trainings && (
          <div className="space-y-3">
            {p.challengesAsTraining.trainings.map((t, i) => (
              <div key={i} className="rounded-xl border border-maia-navy-700 bg-maia-navy-850/50 p-4">
                <p className="font-cormorant text-[0.98rem] leading-relaxed text-maia-ink-60">{t.challenge}</p>
                <p className="mt-2 font-cormorant text-[0.98rem] leading-relaxed text-maia-ink-80">
                  <span className="font-raleway text-[0.65rem] uppercase tracking-[0.18em] text-maia-gold">
                    Training&nbsp;·&nbsp;
                  </span>
                  {t.training}
                </p>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* 7. Becoming a Young Man */}
      <Section
        index={7}
        title={p.developmentalStage.label}
        subtitle={p.developmentalStage.ageRange}
        icon={Sunrise}
      >
        <Prose text={p.developmentalStage.body} />
      </Section>

      {/* 8. Questions for This Season */}
      <Section index={8} title="Questions for This Season" icon={HelpCircle}>
        <ol className="space-y-4">
          {p.reflectionQuestions.map((q, i) => (
            <li key={i} className="flex gap-4">
              <span className="font-cinzel text-lg text-maia-gold/70">{i + 1}</span>
              <span className="font-cormorant text-[1.05rem] leading-relaxed text-maia-ink-80">{q}</span>
            </li>
          ))}
        </ol>
      </Section>

      {/* 9. Parent / Guide Notes */}
      <Section index={9} title="Parent / Guide Notes" icon={Users}>
        <ul className="space-y-3">
          {p.guidanceForParents.map((g, i) => (
            <li key={i} className="flex gap-3 rounded-xl border border-maia-navy-700 bg-maia-navy-850/40 p-4">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-maia-gold/70" />
              <span className="font-cormorant text-[1.0rem] leading-relaxed text-maia-ink-80">{g}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── Closing: vocation + framing echo ─────────────────────────── */}
      <motion.footer {...fadeUp} className="mx-auto w-full max-w-3xl px-6 pt-8">
        <div className="rounded-3xl border border-maia-gold/30 bg-maia-navy-850/50 p-8 text-center shadow-maia-spice-glow">
          <Quote className="mx-auto mb-4 h-6 w-6 text-maia-gold/70" strokeWidth={1.5} />
          <p className="font-cormorant text-[1.15rem] italic leading-relaxed text-maia-ink-100">{p.soulVocation}</p>
        </div>
        <p className="mt-8 text-center font-cormorant text-[0.95rem] italic leading-relaxed text-maia-ink-50">
          {p.framing.notes[0]}
        </p>
      </motion.footer>

      {/* MAIA Mentor — a reflective companion. The design law (symbolic-not-fate ·
          companions-not-cages · becoming-not-fixed) and minor-safety live in the
          endpoint's system prompt; nothing asked here is retained. */}
      <SoulPortraitMentor
        slug={p.person.slug}
        name={p.person.name}
        starters={p.reflectionQuestions}
      />
    </main>
  );
}

export default SoulPortraitRenderer;
