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
  Star,
  type LucideIcon,
} from 'lucide-react';
import {
  RESONANCE_LABEL,
  isLiterarySoulPortrait,
  resolvePortraitTheme,
  portraitThemeCss,
  type SoulPortrait,
  type AnyPortrait,
  type LiterarySoulPortrait,
  type ElementKey,
} from '@/lib/soulPortrait/schema';
import { SoulPortraitMentor } from '@/components/soulPortrait/SoulPortraitMentor';
import { YearAheadSection } from '@/components/soulPortrait/YearAheadSection';

const ELEMENT_ICONS: Record<ElementKey, LucideIcon> = {
  fire: Flame,
  water: Droplet,
  earth: Sprout,
  air: Wind,
  aether: Sparkles,
};

/** Ordinal for house numbers: 1 → "1st", 2 → "2nd", 3 → "3rd", 11 → "11th". */
function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Split a block of text into paragraphs (blank-line separated), preserving
 * single line breaks within a paragraph as <br/>. */
function Prose({ text, className = '' }: { text: string; className?: string }) {
  const paragraphs = text.trim().split(/\n{2,}/);
  return (
    <div className={`space-y-5 ${className}`}>
      {paragraphs.map((para, i) => {
        const lines = para.split('\n');
        return (
          <p key={i} className="text-[1.05rem] leading-relaxed text-[var(--sp-ink-80)] font-cormorant">
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
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--sp-border)] bg-[var(--sp-surface)] text-sm font-raleway text-[var(--sp-accent)]">
          {index}
        </span>
        <Icon className="h-5 w-5 text-[var(--sp-accent)]" strokeWidth={1.6} />
        <div>
          <h2 className="font-cinzel text-xl text-[var(--sp-ink-100)] sm:text-2xl">{title}</h2>
          {subtitle && (
            <p className="font-raleway text-xs uppercase tracking-[0.2em] text-[var(--sp-ink-50)]">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </motion.section>
  );
}

export function SoulPortraitRenderer({ portrait }: { portrait: AnyPortrait }) {
  const p = portrait;

  // Literary (chapter-based) portraits render their own flowing body; the fixed
  // nine-section path below is left entirely untouched for the existing portraits.
  if (isLiterarySoulPortrait(p)) {
    return <LiteraryPortraitBody p={p} />;
  }

  // The giver-chosen visual theme, resolved to CSS custom properties scoped to
  // this page root (dark tokens + a designed light-mode override when the theme
  // has one). Every colour below reads a --sp-* token, so a theme is pure data.
  const theme = resolvePortraitTheme(p.theme);

  return (
    <main
      data-sp-theme={theme.key}
      className="min-h-screen bg-gradient-to-b from-[var(--sp-ground-deep)] via-[var(--sp-ground)] to-[var(--sp-ground-deep)] pb-24 text-[var(--sp-ink-80)]"
    >
      <style dangerouslySetInnerHTML={{ __html: portraitThemeCss(p.theme) }} />
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <header className="mx-auto w-full max-w-3xl px-6 pt-20 pb-10 text-center sm:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <p className="font-raleway text-xs uppercase tracking-[0.3em] text-[var(--sp-accent)]">
            A Spiralogic Soul Portrait
          </p>
          <h1 className="mt-4 font-cinzel text-3xl text-[var(--sp-ink-100)] sm:text-4xl">{p.person.name}</h1>
          {/* Age stays in the data but is not shown on gift / legacy portraits —
              a gift is about a becoming, not a number. (Kelly, 2026-06-20) */}
          {p.person.age != null && p.mode !== 'gift' && p.mode !== 'legacy' && (
            <p className="mt-3 font-cormorant text-lg italic text-[var(--sp-ink-60)]">
              {`age ${p.person.age}`}
            </p>
          )}
        </motion.div>
      </header>

      {/* ── Gift framing — the relational doorway ────────────────────────
          For gift / legacy / parent portraits that carry an opening: met
          directly under the hero, BEFORE "how to read this". Label + subline
          are fixed copy ("Offered with love" / "From <giver>"); the opening
          prose is the giver's. Settled, single-owner per Kelly 2026-06-20. */}
      {p.offeredBy?.giftOpening && (
        <div className="mx-auto mb-8 w-full max-w-3xl px-6">
          <div className="rounded-2xl border border-[rgba(var(--sp-accent-rgb),0.25)] bg-[rgba(var(--sp-surface-rgb),0.4)] p-7 text-center shadow-[0_0_18px_var(--sp-glow)] sm:p-9">
            <p className="font-raleway text-[0.7rem] uppercase tracking-[0.25em] text-[var(--sp-accent)]">
              Offered with love
            </p>
            {p.offeredBy.giverName && (
              <p className="mt-1 mb-5 font-cormorant text-base italic text-[var(--sp-ink-60)]">
                From {p.offeredBy.giverName}
              </p>
            )}
            {p.offeredBy.giftOpening.trim().split(/\n{2,}/).map((para, i) => (
              <p key={i} className="mb-3 font-cormorant text-[1.05rem] italic leading-relaxed text-[var(--sp-ink-80)]">
                {para}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* ── Framing (always rendered, top) ───────────────────────────── */}
      <div className="mx-auto w-full max-w-3xl px-6">
        <div className="rounded-2xl border border-[var(--sp-border)] bg-[rgba(var(--sp-surface-rgb),0.6)] p-6 shadow-maia-panel">
          <p className="mb-3 font-raleway text-[0.7rem] uppercase tracking-[0.2em] text-[var(--sp-ink-50)]">
            Before You Begin
          </p>
          <ul className="space-y-3">
            {p.framing.notes.map((note, i) => (
              <li key={i} className="flex gap-3 font-cormorant text-[1.02rem] leading-relaxed text-[var(--sp-ink-60)]">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[rgba(var(--sp-accent-rgb),0.7)]" />
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
            <div key={i} className="rounded-xl border border-[var(--sp-border)] bg-[rgba(var(--sp-surface-rgb),0.5)] p-4">
              <p className="font-cinzel text-sm text-[var(--sp-ink-100)]">
                {pl.body}
                {pl.sign && <span className="text-[var(--sp-accent)]"> · {pl.sign}</span>}
                {pl.house != null && <span className="text-[var(--sp-ink-50)]"> · {ordinal(pl.house)} House</span>}
                {pl.angle && <span className="text-[var(--sp-ink-50)]"> · {pl.angle}</span>}
              </p>
              <p className="mt-2 font-cormorant text-[0.98rem] leading-relaxed text-[var(--sp-ink-60)]">{pl.meaning}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 font-cormorant text-[1.02rem] leading-relaxed text-[var(--sp-ink-80)] italic">
          {p.natalChartSummary.synthesis}
        </p>
      </Section>

      {/* 3. Elemental Architecture */}
      <Section index={3} title="Elemental Architecture" subtitle="Fire · Water · Earth · Air · Aether" icon={Sparkles}>
        <div className="space-y-4">
          {p.elementalProfile.map((el) => {
            const Icon = ELEMENT_ICONS[el.element];
            const elColor = `var(--sp-el-${el.element})`;
            return (
              <div
                key={el.element}
                className="rounded-2xl border bg-[rgba(var(--sp-surface-rgb),0.4)] p-5"
                style={{
                  borderColor: `var(--sp-el-${el.element}-border)`,
                  boxShadow: `0 0 24px var(--sp-el-${el.element}-glow)`,
                }}
              >
                <div className="mb-2 flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: `var(--sp-el-${el.element}-chip)` }}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.6} style={{ color: elColor }} />
                  </span>
                  <div>
                    <h3 className="font-cinzel text-lg text-[var(--sp-ink-100)]">{el.title}</h3>
                    <p className="font-raleway text-[0.7rem] uppercase tracking-[0.18em]" style={{ color: elColor }}>
                      {el.keyword}
                    </p>
                  </div>
                </div>
                <p className="font-cormorant text-[1.02rem] leading-relaxed text-[var(--sp-ink-80)]">{el.body}</p>
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
            <div key={a.key} className="flex flex-col rounded-xl border border-[var(--sp-border)] bg-[rgba(var(--sp-surface-rgb),0.5)] p-5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="font-cinzel text-base text-[var(--sp-ink-100)]">{a.name}</h3>
                <span className="font-raleway text-[0.62rem] uppercase tracking-wider text-[var(--sp-ink-50)]">
                  {RESONANCE_LABEL[a.resonance]}
                </span>
              </div>
              <p className="font-cormorant text-[0.98rem] leading-relaxed text-[var(--sp-ink-80)]">{a.essence}</p>
              <div className="mt-3 space-y-1.5 border-t border-[var(--sp-border)] pt-3">
                <p className="font-cormorant text-[0.92rem] leading-snug text-[var(--sp-ink-60)]">
                  <span className="text-[var(--sp-accent)]">Gift — </span>
                  {a.gift}
                </p>
                <p className="font-cormorant text-[0.92rem] leading-snug text-[var(--sp-ink-50)]">
                  <span className="text-[var(--sp-ink-40)]">Growth edge — </span>
                  {a.shadow}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 5. The Seer and the Prophet — the heart */}
      <motion.section {...fadeUp} className="mx-auto w-full max-w-3xl px-6 py-14 sm:py-20">
        <div className="rounded-3xl border border-[rgba(var(--sp-accent-rgb),0.3)] bg-[rgba(var(--sp-surface-rgb),0.5)] p-7 shadow-[0_0_18px_var(--sp-glow)] sm:p-10">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgba(var(--sp-accent-rgb),0.4)] bg-[var(--sp-ground)] text-sm font-raleway text-[var(--sp-accent)]">
              5
            </span>
            <Eye className="h-5 w-5 text-[var(--sp-accent)]" strokeWidth={1.6} />
            <div>
              <h2 className="font-cinzel text-xl text-[var(--sp-ink-100)] sm:text-2xl">{p.seerAndProphet.title}</h2>
              {p.seerAndProphet.subtitle && (
                <p className="font-raleway text-xs uppercase tracking-[0.2em] text-[var(--sp-accent)]">
                  {p.seerAndProphet.subtitle}
                </p>
              )}
            </div>
          </div>
          <Prose text={p.seerAndProphet.body} />
          {p.seerAndProphet.blessing && p.seerAndProphet.blessing.length > 0 && (
            <div className="mt-8 border-t border-[rgba(var(--sp-accent-rgb),0.2)] pt-7 text-center">
              {p.seerAndProphet.blessing.map((line, i) => (
                <p key={i} className="font-cormorant text-[1.1rem] italic leading-relaxed text-[var(--sp-ink-80)]">
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
              <div key={i} className="rounded-xl border border-[var(--sp-border)] bg-[rgba(var(--sp-surface-rgb),0.5)] p-4">
                <p className="font-cormorant text-[0.98rem] leading-relaxed text-[var(--sp-ink-60)]">{t.challenge}</p>
                <p className="mt-2 font-cormorant text-[0.98rem] leading-relaxed text-[var(--sp-ink-80)]">
                  <span className="font-raleway text-[0.65rem] uppercase tracking-[0.18em] text-[var(--sp-accent)]">
                    Training&nbsp;·&nbsp;
                  </span>
                  {t.training}
                </p>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Forward-pointing beam — Your North Star (optional; e.g. a North Node
          reading). Rendered as an un-numbered featured panel between Challenges
          and the developmental stage, so portraits without it are unaffected. */}
      {p.northStar && (
        <motion.section {...fadeUp} className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-16">
          <div className="rounded-3xl border border-[rgba(var(--sp-accent-rgb),0.3)] bg-[rgba(var(--sp-surface-rgb),0.5)] p-7 shadow-[0_0_18px_var(--sp-glow)] sm:p-10">
            <div className="mb-6 flex items-center gap-3">
              <Star className="h-5 w-5 text-[var(--sp-accent)]" strokeWidth={1.6} />
              <div>
                <h2 className="font-cinzel text-xl text-[var(--sp-ink-100)] sm:text-2xl">{p.northStar.title}</h2>
                {p.northStar.subtitle && (
                  <p className="font-raleway text-xs uppercase tracking-[0.2em] text-[var(--sp-accent)]">
                    {p.northStar.subtitle}
                  </p>
                )}
              </div>
            </div>
            <Prose text={p.northStar.body} />
          </div>
        </motion.section>
      )}

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
              <span className="font-cinzel text-lg text-[rgba(var(--sp-accent-rgb),0.7)]">{i + 1}</span>
              <span className="font-cormorant text-[1.05rem] leading-relaxed text-[var(--sp-ink-80)]">{q}</span>
            </li>
          ))}
        </ol>
      </Section>

      {/* 9. Parent / Guide Notes — only for parent-child portraits */}
      {p.guidanceForParents && p.guidanceForParents.length > 0 && (
        <Section index={9} title="Parent / Guide Notes" icon={Users}>
          <ul className="space-y-3">
            {p.guidanceForParents.map((g, i) => (
              <li key={i} className="flex gap-3 rounded-xl border border-[var(--sp-border)] bg-[rgba(var(--sp-surface-rgb),0.4)] p-4">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[rgba(var(--sp-accent-rgb),0.7)]" />
                <span className="font-cormorant text-[1.0rem] leading-relaxed text-[var(--sp-ink-80)]">{g}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ── Closing: vocation + framing echo ─────────────────────────── */}
      <motion.footer {...fadeUp} className="mx-auto w-full max-w-3xl px-6 pt-8">
        <div className="rounded-3xl border border-[rgba(var(--sp-accent-rgb),0.3)] bg-[rgba(var(--sp-surface-rgb),0.5)] p-8 text-center shadow-[0_0_18px_var(--sp-glow)]">
          <Quote className="mx-auto mb-4 h-6 w-6 text-[rgba(var(--sp-accent-rgb),0.7)]" strokeWidth={1.5} />
          <p className="font-cormorant text-[1.15rem] italic leading-relaxed text-[var(--sp-ink-100)]">{p.soulVocation}</p>
        </div>
        <p className="mt-8 text-center font-cormorant text-[0.95rem] italic leading-relaxed text-[var(--sp-ink-50)]">
          {p.framing.notes[0]}
        </p>
      </motion.footer>

      {/* ── Part II — The Year Ahead (seasonal). Present only for portraits that
          carry a transit reading; the natal portrait above is Part I (timeless). */}
      {p.yearAhead && <YearAheadSection yearAhead={p.yearAhead} />}

      {/* MAIA Mentor — a reflective companion. Opt-in per portrait: the live
          dialogue surface is shown ONLY when this portrait explicitly enables it
          (mentorEnabled). The design law (symbolic-not-fate · companions-not-cages
          · becoming-not-fixed) and minor-safety live in the endpoint's system
          prompt; nothing asked here is retained. A portrait with no Mentor (e.g.
          a Gift Portrait prototype) renders the gift only. */}
      {p.mentorEnabled && (
        <SoulPortraitMentor
          slug={p.person.slug}
          name={p.person.name}
          starters={p.reflectionQuestions}
        />
      )}
    </main>
  );
}

/**
 * LiteraryPortraitBody — the chapter-based ("letter / essay") rendering.
 * Same hero, gift framing, and Before-You-Begin as the structured renderer, then
 * flowing, optionally element-accented chapters in place of the fixed sections.
 * The natal portrait above (structured mode) is untouched.
 */
function LiteraryPortraitBody({ p }: { p: LiterarySoulPortrait }) {
  const theme = resolvePortraitTheme(p.theme);
  return (
    <main
      data-sp-theme={theme.key}
      className="min-h-screen bg-gradient-to-b from-[var(--sp-ground-deep)] via-[var(--sp-ground)] to-[var(--sp-ground-deep)] pb-24 text-[var(--sp-ink-80)]"
    >
      <style dangerouslySetInnerHTML={{ __html: portraitThemeCss(p.theme) }} />
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <header className="mx-auto w-full max-w-3xl px-6 pt-20 pb-10 text-center sm:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <p className="font-raleway text-xs uppercase tracking-[0.3em] text-[var(--sp-accent)]">
            A Spiralogic Soul Portrait
          </p>
          <h1 className="mt-4 font-cinzel text-3xl text-[var(--sp-ink-100)] sm:text-4xl">{p.person.name}</h1>
          {p.person.age != null && p.mode !== 'gift' && p.mode !== 'legacy' && (
            <p className="mt-3 font-cormorant text-lg italic text-[var(--sp-ink-60)]">{`age ${p.person.age}`}</p>
          )}
        </motion.div>
      </header>

      {/* ── Gift framing ─────────────────────────────────────────────── */}
      {p.offeredBy?.giftOpening && (
        <div className="mx-auto mb-8 w-full max-w-3xl px-6">
          <div className="rounded-2xl border border-[rgba(var(--sp-accent-rgb),0.25)] bg-[rgba(var(--sp-surface-rgb),0.4)] p-7 text-center shadow-[0_0_18px_var(--sp-glow)] sm:p-9">
            <p className="font-raleway text-[0.7rem] uppercase tracking-[0.25em] text-[var(--sp-accent)]">
              Offered with love
            </p>
            {p.offeredBy.giverName && (
              <p className="mt-1 mb-5 font-cormorant text-base italic text-[var(--sp-ink-60)]">
                From {p.offeredBy.giverName}
              </p>
            )}
            {p.offeredBy.giftOpening.trim().split(/\n{2,}/).map((para, i) => (
              <p key={i} className="mb-3 font-cormorant text-[1.05rem] italic leading-relaxed text-[var(--sp-ink-80)]">
                {para}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* ── Before You Begin ─────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-3xl px-6">
        <div className="rounded-2xl border border-[var(--sp-border)] bg-[rgba(var(--sp-surface-rgb),0.6)] p-6 shadow-maia-panel">
          <p className="mb-3 font-raleway text-[0.7rem] uppercase tracking-[0.2em] text-[var(--sp-ink-50)]">
            Before You Begin
          </p>
          <ul className="space-y-3">
            {p.framing.notes.map((note, i) => (
              <li key={i} className="flex gap-3 font-cormorant text-[1.02rem] leading-relaxed text-[var(--sp-ink-60)]">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[rgba(var(--sp-accent-rgb),0.7)]" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Chapters ─────────────────────────────────────────────────── */}
      {p.chapters.map((ch, i) => {
        const Icon = ch.element ? ELEMENT_ICONS[ch.element] : BookOpen;
        return (
          <motion.section key={i} {...fadeUp} className="mx-auto w-full max-w-3xl px-6 py-11 sm:py-14">
            <div className="mb-6 flex items-center gap-3">
              <Icon
                className="h-5 w-5 text-[var(--sp-accent)]"
                strokeWidth={1.6}
                style={ch.element ? { color: `var(--sp-el-${ch.element})` } : undefined}
              />
              <div>
                <h2 className="font-cinzel text-2xl text-[var(--sp-ink-100)] sm:text-[1.7rem]">{ch.title}</h2>
                {ch.subtitle && (
                  <p className="font-raleway text-xs uppercase tracking-[0.2em] text-[var(--sp-accent)]">{ch.subtitle}</p>
                )}
              </div>
            </div>
            <Prose text={ch.body} />
          </motion.section>
        );
      })}

      {/* ── Part II — The Year Ahead (present only when a transit reading exists) ── */}
      {p.yearAhead && <YearAheadSection yearAhead={p.yearAhead} />}

      {/* ── MAIA Mentor — opt-in per portrait (off by default) ───────── */}
      {p.mentorEnabled && (
        <SoulPortraitMentor slug={p.person.slug} name={p.person.name} starters={[]} />
      )}
    </main>
  );
}

export default SoulPortraitRenderer;
