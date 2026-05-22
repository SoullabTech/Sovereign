'use client';

/**
 * Field Lab — bounded experimental ecology.
 *
 * Invariant (negative form, load-bearing — do not soften):
 *   Field Lab is NOT a beta-features showcase, a power-user unlock, or a
 *   preview pipeline for features in development.
 *   Field Lab is NOT optimized for tester conversion, return rate, or
 *   experiment uptake.
 *   The shelf only reflects what is genuinely walkable, with honest framing
 *   about incompleteness, and explicit naming of what each surface is
 *   exploring.
 *
 * If the next editor finds themselves adding:
 *   - a "popular experiments" sort
 *   - usage statistics on cards
 *   - a "new" badge that decays
 *   - a tester leaderboard, level, or progression
 *   - email digests of new experiments
 * — stop. That is the optimization-funnel inversion the canon warns about.
 *
 * Spec: docs/specs/RELATIONAL_NAVIGATION_ROOM.md
 */

import { motion } from 'framer-motion';
import { FieldLabFrame } from '@/components/maia/field-lab/FieldLabFrame';
import { ExperimentCard } from '@/components/maia/field-lab/ExperimentCard';
import { EXPERIMENTS } from '@/lib/maia/fieldLab/experiments';

export default function FieldLabIndexPage() {
  return (
    <FieldLabFrame title="">
      <FieldLabHero />
      <section className="space-y-4">
        {EXPERIMENTS.map((exp) => (
          <ExperimentCard key={exp.slug} exp={exp} />
        ))}
      </section>
      <FieldLabFooter />
    </FieldLabFrame>
  );
}

function FieldLabHero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-10"
    >
      <h2 className="text-2xl font-light text-stone-800 tracking-wide mb-3">
        Surfaces being shaped, walked together.
      </h2>
      <p className="text-[15px] leading-relaxed text-stone-600 max-w-2xl">
        Field Lab is where new MAIA surfaces live while they are still being
        formed. None of them are finished. Some may change shape. Some may be
        removed. They are offered here because the next thing they need is
        contact with members — not more refinement in the absence of contact.
      </p>
      <p className="text-[14px] leading-relaxed text-stone-500 max-w-2xl mt-3 italic">
        What is collected from these rooms is observation — what surprised you,
        what felt off, what subtly pulled — not engagement.
      </p>
    </motion.section>
  );
}

function FieldLabFooter() {
  return (
    <footer className="mt-16 pt-8 border-t border-stone-200/60">
      <p className="text-[12.5px] leading-relaxed text-stone-500 max-w-xl">
        Anything you notice in Field Lab — friction, surprise, drift, a moment
        of release or pull — is what helps these surfaces find their shape.
        Bring observations directly to the stewardship team.
      </p>
    </footer>
  );
}
