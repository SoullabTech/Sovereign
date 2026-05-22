'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export interface Experiment {
  slug: string;
  name: string;
  oneLiner: string;
  status: string[]; // e.g. ['Experimental', 'Observation phase', 'No persistence yet']
  exploring: string;
  phase: 'phase-1' | 'phase-2' | 'phase-3';
}

export function ExperimentCard({ exp }: { exp: Experiment }) {
  return (
    <Link
      href={`/maia/field-lab/${exp.slug}`}
      className="block rounded-2xl border border-stone-200 bg-white/60 p-6 hover:border-[#5a7a6f]/40 hover:bg-white/80 transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2 mb-3">
            {exp.status.map((s, i) => (
              <span
                key={i}
                className="text-[10.5px] uppercase tracking-wider text-stone-500 bg-stone-100 rounded-full px-2.5 py-0.5 border border-stone-200/70"
              >
                {s}
              </span>
            ))}
          </div>
          <h3 className="text-[18px] font-medium text-stone-800 tracking-wide mb-2">
            {exp.name}
          </h3>
          <p className="text-[14.5px] leading-relaxed text-stone-600 mb-3">
            {exp.oneLiner}
          </p>
          <p className="text-[13px] leading-relaxed text-stone-500 italic">
            <span className="not-italic text-stone-400 text-[11px] uppercase tracking-wider mr-2">
              exploring
            </span>
            {exp.exploring}
          </p>
        </div>
        <ArrowUpRight
          className="w-5 h-5 text-stone-400 group-hover:text-[#5a7a6f] transition-colors shrink-0"
          strokeWidth={2}
        />
      </div>
    </Link>
  );
}
