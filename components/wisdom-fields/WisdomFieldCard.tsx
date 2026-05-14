'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface WisdomFieldCardProps {
  slug: string;
  masterName: string;
  masterDates?: string | null;
  masterDomain?: string | null;
  orientation?: string | null;
  aiPosture: 'contextual' | 'none';
  fieldType: 'wisdom_keeper' | 'masters_field';
  memberCount?: number;
  index?: number;
}

export function WisdomFieldCard({
  slug,
  masterName,
  masterDates,
  masterDomain,
  orientation,
  aiPosture,
  fieldType,
  memberCount,
  index = 0,
}: WisdomFieldCardProps) {
  // First sentence of orientation as the card description
  const shortDesc = orientation?.split(/\.\s+/)[0]?.replace(/\.$/, '') ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link
        href={`/commons/fields/${slug}`}
        className="block rounded-2xl border border-maia-navy-700 bg-maia-navy-850 p-6 transition-colors hover:border-maia-navy-600 hover:bg-maia-navy-800"
      >
        {/* Type label */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs tracking-widest text-maia-ink-40 uppercase">
            {fieldType === 'wisdom_keeper' ? 'Wisdom Keeper' : "Master's Field"}
          </span>
          {aiPosture === 'none' && (
            <span className="rounded-full border border-maia-navy-600 px-2 py-0.5 text-xs text-maia-ink-40">
              MAIA quiet
            </span>
          )}
        </div>

        {/* Name + dates */}
        <h2 className="text-xl font-semibold text-maia-ink-100">{masterName}</h2>
        {masterDates && (
          <p className="mt-0.5 text-sm text-maia-ink-40">{masterDates}</p>
        )}

        {/* Domain */}
        {masterDomain && (
          <p className="mt-2 text-sm text-maia-ink-60">{masterDomain}</p>
        )}

        {/* Short description */}
        {shortDesc && (
          <p className="mt-3 text-sm leading-relaxed text-maia-ink-60 line-clamp-3">
            {shortDesc}.
          </p>
        )}

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between">
          {memberCount != null && memberCount > 0 ? (
            <span className="text-xs text-maia-ink-40">
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </span>
          ) : (
            <span />
          )}
          <span className="text-sm text-maia-spice-400">Enter field →</span>
        </div>
      </Link>
    </motion.div>
  );
}
