'use client';

/**
 * Relational Navigation Room — Personal Portal
 *
 * Invariant (negative form, load-bearing — do not soften):
 *   This surface does NOT model, profile, or hold continuity about the
 *   absent person the member is navigating with.
 *   This surface does NOT answer "what did they really mean?"
 *   This surface does NOT issue directives or diagnoses.
 *   MAIA accompanies the MEMBER's own discernment, options, and next steps.
 *   Authority returns to the member at the close of every reflection.
 *
 * If a future change adds:
 *   - a relationships list, dossier, or graph
 *   - a "MAIA suggests this lens" affordance
 *   - a notification, reminder, or streak around important conversations
 *   - a transcript / live mediation mode
 * — stop. That is the elegant inversion the Spiral Continuity Engine warns
 *   about, dressed in helpful-feature language. Re-read the spec.
 *
 * Spec: docs/specs/RELATIONAL_NAVIGATION_ROOM.md
 * Prior canon: docs/canon/THE_CLEARING.md
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Holoflower } from '@/components/ui/Holoflower';
import {
  PrepareFlow,
  IntegrateFlow,
} from '@/components/maia/relational-navigation/Flows';
import type { FlowMode } from '@/lib/maia/relationalNavigation/types';

export default function RelationalNavigationPage() {
  const router = useRouter();
  const [mode, setMode] = useState<FlowMode>('prepare');

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          'linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%)',
      }}
    >
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#f8f7f5]/80 border-b border-stone-200/40">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center gap-5">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-stone-700 hover:text-stone-900 hover:-translate-x-0.5 transition-all"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          </button>
          <div className="h-4 w-px bg-stone-300/60" />
          <h1 className="text-sm font-medium tracking-wide text-stone-600 uppercase">
            Relational Navigation
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 mx-auto mb-8">
            <Holoflower
              size="md"
              glowIntensity="medium"
              animate={true}
              theme="light"
              customColor="rgba(90, 122, 111, 0.6)"
            />
          </div>
          <h2 className="text-2xl font-light mb-4 text-stone-800 tracking-wide">
            A place to become more conscious before and after important
            conversations.
          </h2>
          <p className="text-[15px] leading-relaxed text-stone-600 max-w-xl mx-auto">
            MAIA accompanies your own discernment — options, lenses, boundaries.
            She does not interpret the other person, and does not carry them in
            memory across sessions. The reading is always yours to make.
          </p>
        </motion.div>

        <motion.div
          className="mb-10 flex items-center justify-center gap-2 rounded-full border border-stone-200 bg-white/60 p-1.5 max-w-md mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <ModeButton
            active={mode === 'prepare'}
            onClick={() => setMode('prepare')}
            label="Prepare for"
            sublabel="before"
          />
          <ModeButton
            active={mode === 'integrate'}
            onClick={() => setMode('integrate')}
            label="Integrate after"
            sublabel="after"
          />
        </motion.div>

        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {mode === 'prepare' ? <PrepareFlow /> : <IntegrateFlow />}
        </motion.div>

        <footer className="mt-20 pt-8 border-t border-stone-200/60 text-center">
          <p className="text-[12.5px] leading-relaxed text-stone-500 max-w-lg mx-auto">
            MAIA refuses requests shaped as &ldquo;what did they really
            mean?&rdquo; or &ldquo;what is wrong with them?&rdquo; — gently. The
            other person is not in this room, and remains more than any reading
            of them.
          </p>
        </footer>
      </main>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  label,
  sublabel,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  sublabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex-1 rounded-full px-5 py-2.5 text-left transition-all',
        active
          ? 'bg-[#5a7a6f] text-white shadow-sm'
          : 'text-stone-600 hover:bg-stone-100/60',
      ].join(' ')}
      aria-pressed={active}
    >
      <div className="text-[14px] font-medium tracking-wide">{label}</div>
      <div
        className={[
          'text-[11px] uppercase tracking-wider mt-0.5',
          active ? 'text-white/70' : 'text-stone-400',
        ].join(' ')}
      >
        {sublabel}
      </div>
    </button>
  );
}
