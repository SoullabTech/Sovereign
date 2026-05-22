'use client';

/**
 * Relational Navigation Room — inside Field Lab.
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
import { motion } from 'framer-motion';
import { FieldLabFrame } from '@/components/maia/field-lab/FieldLabFrame';
import {
  PrepareFlow,
  IntegrateFlow,
} from '@/components/maia/relational-navigation/Flows';
import type { FlowMode } from '@/lib/maia/relationalNavigation/types';

export default function RelationalNavigationPage() {
  const [mode, setMode] = useState<FlowMode>('prepare');

  return (
    <FieldLabFrame
      title="Relational Navigation"
      status="Experimental · Observation phase · No persistence yet"
      exploring="Whether MAIA can support relational discernment — preparation for and integration after important conversations — without becoming an interpretive authority over the people you are navigating with."
    >
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-light text-stone-800 tracking-wide mb-3">
          A place to become more conscious before and after important
          conversations.
        </h2>
        <p className="text-[15px] leading-relaxed text-stone-600">
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
    </FieldLabFrame>
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
