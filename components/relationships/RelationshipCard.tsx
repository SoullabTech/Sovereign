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

  const initial = relationship.name.trim().charAt(0).toUpperCase() || '•';

  return (
    <motion.button
      onClick={onClick}
      whileHover={reduceMotion ? undefined : { y: -3, scale: 1.002 }}
      whileTap={reduceMotion ? undefined : { scale: 0.997 }}
      transition={{ duration: 0.2 }}
      className="group relative w-full overflow-hidden rounded-[1.5rem] border border-[#c8c0b2]/60 bg-[#fffaf3]/92 px-5 py-5 text-left shadow-[0_10px_34px_rgba(76,66,51,0.06)] transition-all hover:border-[#98a98b]/65 hover:bg-[#fffdf8] hover:shadow-[0_16px_42px_rgba(76,66,51,0.10)] md:px-6 md:py-6"
      data-relational-presence
    >
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-[#dce7d4]/55 blur-3xl"
        whileHover={reduceMotion ? undefined : { scale: 1.12, x: -8, y: 6 }}
      />

      <div className="relative flex items-start gap-4 md:gap-5">
        <div
          aria-hidden="true"
          className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#a8b49c]/55 bg-[#edf2e8] text-sm font-light text-[#536853] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
        >
          {initial}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-xl font-light tracking-wide text-[#3f5544] transition-colors group-hover:text-[#304235]">
            {relationship.name}
          </div>

          {descriptor && (
            <div className="mt-1 text-xs capitalize tracking-wide text-[#7b776f]">
              {descriptor}
            </div>
          )}

          {relationship.note && (
            <p className="mt-4 max-w-2xl text-sm font-light italic leading-relaxed text-[#4f4d47] md:text-[15px]">
              “{relationship.note}”
            </p>
          )}
        </div>

        <span className="mt-2 shrink-0 text-[#7e9275] transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-[#50674f]">
          →
        </span>
      </div>
    </motion.button>
  );
}
