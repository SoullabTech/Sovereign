'use client';

import { motion, useReducedMotion } from 'framer-motion';

export interface RelationshipSummary {
  id: string;
  name: string;
  realm: 'outer' | 'inner' | 'transpersonal';
  bondType: string | null;
  note: string | null;
  fieldTone: string | null;
  activeSignals: string[] | null;
  lastCheckinAt: string | null;
  createdAt: string;
}

export default function RelationshipCard({
  relationship,
  onClick,
}: {
  relationship: RelationshipSummary;
  onClick: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const realmLabel = {
    outer: null,
    inner: 'inner figure',
    transpersonal: 'larger field',
  }[relationship.realm];

  const descriptor = relationship.bondType
    ? relationship.bondType.replace(/_/g, ' ')
    : realmLabel;

  return (
    <motion.button
      onClick={onClick}
      whileHover={reduceMotion ? undefined : { y: -2, scale: 1.003 }}
      whileTap={reduceMotion ? undefined : { scale: 0.997 }}
      transition={{ duration: 0.2 }}
      className="group relative w-full overflow-hidden rounded-[1.35rem] border border-jade-sage/10 bg-jade-forest/[0.045] px-5 py-5 text-left transition-colors hover:border-jade-sage/24 hover:bg-jade-forest/[0.09]"
    >
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-20 h-40 w-40 rounded-full bg-jade-sage/[0.045] blur-3xl"
        whileHover={reduceMotion ? undefined : { scale: 1.15, x: -8, y: 6 }}
      />

      <div className="relative flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <div className="text-xl font-extralight tracking-wide text-jade-jade transition-colors group-hover:text-jade-sage">
            {relationship.name}
          </div>
          {descriptor && (
            <div className="mt-1 text-xs capitalize tracking-wide text-jade-mineral/58">
              {descriptor}
            </div>
          )}
          {relationship.note && (
            <p className="mt-4 max-w-xl text-sm font-light italic leading-relaxed text-jade-mineral/72">
              “{relationship.note}”
            </p>
          )}
        </div>

        <span className="mt-1 text-jade-mineral/25 transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-jade-sage/70">
          →
        </span>
      </div>
    </motion.button>
  );
}
