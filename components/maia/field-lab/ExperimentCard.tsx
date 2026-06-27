'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { GoverningUncertainty } from '@/lib/maia/fieldLab/governance';

export interface Experiment {
  slug: string;
  name: string;
  oneLiner: string;
  status: string[]; // e.g. ['Experimental', 'Observation phase', 'No persistence yet']
  exploring: string;
  phase: 'phase-1' | 'phase-2' | 'phase-3'; // observability build-phase, NOT lifecycle position
  /**
   * The one principal uncertainty this room exists to reduce, plus the audit trail
   * of its declared baton-passes. Required: no room reaches the shelf without one.
   * Builder-facing governance — deliberately NOT rendered on the member card.
   * See docs/canon/THE_GOVERNING_UNCERTAINTY.md and lib/maia/fieldLab/governance.ts.
   */
  governingUncertainty: GoverningUncertainty;
}

export function ExperimentCard({ exp }: { exp: Experiment }) {
  return (
    <Link
      href={`/maia/field-lab/${exp.slug}`}
      className="block rounded-2xl border border-amber-500/15 bg-stone-900/40 backdrop-blur-md p-6 hover:border-amber-400/30 hover:bg-stone-900/55 hover:shadow-[0_8px_40px_rgba(61,40,23,0.5)] transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2 mb-3">
            {exp.status.map((s, i) => (
              <span
                key={i}
                className="text-[10.5px] uppercase tracking-wider text-amber-100/60 bg-stone-900/50 rounded-full px-2.5 py-0.5 border border-amber-500/15"
              >
                {s}
              </span>
            ))}
          </div>
          <h3 className="font-cormorant text-[22px] font-medium text-amber-50/90 tracking-wide mb-2">
            {exp.name}
          </h3>
          <p className="text-[14.5px] leading-relaxed text-soullab-text-secondary mb-3">
            {exp.oneLiner}
          </p>
          <p className="text-[13px] leading-relaxed text-soullab-text-muted italic">
            <span className="not-italic text-amber-300/70 text-[11px] uppercase tracking-wider mr-2">
              exploring
            </span>
            {exp.exploring}
          </p>
        </div>
        <ArrowUpRight
          className="w-5 h-5 text-soullab-text-muted group-hover:text-amber-300 transition-colors shrink-0"
          strokeWidth={2}
        />
      </div>
    </Link>
  );
}
