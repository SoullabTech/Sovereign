'use client';

/**
 * Arrival — the ruled Soullab threshold.
 *
 *   SIGN UP / VERIFY → NAME → WHAT IS ASKING FOR YOUR ATTENTION? → ONE DOORWAY → MAIA BEGINS
 *
 * This replaces the legacy first-run path (ten philosophical lenses → birth data
 * → elemental lesson). Under sixty seconds to meaningful MAIA contact.
 *
 * NAME is not asked again here: UnifiedAuth already collects it at signup
 * ("What should MAIA call you?"), so re-asking would be the profile-completion
 * pattern this threshold exists to remove. The name is greeted, not requested.
 *
 * The safeguard from MLX-R1, which governs every future change to this file:
 *
 *   The doorway must never become another questionnaire. One tap, then MAIA
 *   starts. Anything that adds a second gate violates this ruling rather than
 *   extending it.
 *
 * Deliberately NOT here: birth date/time/place, elemental classification,
 * philosophical lens selection, relational stance (a parked MLX-05 candidate),
 * or any other profile field.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DOORWAYS,
  DOORWAY_UNSURE,
  writeArrivalContext,
  type DoorwayId,
} from '@/lib/maia/arrivalContext';

const SERIF = 'Spectral, Georgia, serif';

interface ArrivalThresholdProps {
  /** The member's own name, already given at signup. */
  name: string;
  /** Called once the member has crossed. Marks onboarding complete, opens MAIA. */
  onCross: (attention: string, doorway: DoorwayId) => void | Promise<void>;
  /** True while completion is being recorded. */
  busy?: boolean;
}

export function ArrivalThreshold({ name, onCross, busy = false }: ArrivalThresholdProps) {
  const [attention, setAttention] = useState('');
  const [crossing, setCrossing] = useState(false);

  const cross = async (doorway: DoorwayId) => {
    if (crossing || busy) return;
    setCrossing(true);
    // Session-scoped only (MLX-R3). Written before navigation so the context
    // survives the handoff into /maia.
    writeArrivalContext(attention, doorway);
    await onCross(attention, doorway);
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden bg-[#0A1628] text-[#F5F7FB]">
      {/* Atmosphere: light and depth, never icons. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(90rem 60rem at 18% 12%, rgba(24,42,72,0.55), transparent 60%),' +
            'radial-gradient(70rem 50rem at 82% 78%, rgba(18,34,60,0.5), transparent 62%)',
        }}
      />

      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[720px] flex-col justify-center px-6 py-16 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-slate-400">
            Welcome to Soullab{name ? `, ${name}` : ''}
          </p>

          <h1
            className="mt-4 text-[28px] font-light leading-[1.25] tracking-[-0.01em] text-slate-50 sm:text-[36px]"
            style={{ fontFamily: SERIF, textWrap: 'balance' }}
          >
            What is asking for your attention?
          </h1>

          <p className="mt-4 max-w-[52ch] text-[14px] leading-relaxed text-slate-400">
            You don&rsquo;t need to know what to ask, or how to use AI. Say as much or as little as
            you like.
          </p>

          <label htmlFor="arrival-attention" className="sr-only">
            What is asking for your attention?
          </label>
          <textarea
            id="arrival-attention"
            value={attention}
            onChange={(e) => setAttention(e.target.value)}
            rows={3}
            disabled={crossing || busy}
            placeholder="Whatever is here."
            className="mt-7 w-full resize-none rounded-xl border border-white/[0.09] bg-[#0b1728]/60 px-4 py-3.5 text-[16px] leading-relaxed text-slate-100 placeholder:text-slate-600 transition-colors duration-300 hover:border-white/[0.14] focus:border-[#B8860B]/45 focus:outline-none focus:ring-0 disabled:opacity-60"
            style={{ fontFamily: SERIF }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-10"
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-slate-400">
            Where would you like to begin?
          </p>

          {/* One tap and MAIA starts. No cards, no survey, no second gate. */}
          <div className="mt-3 grid grid-cols-1 gap-x-10 sm:grid-cols-2">
            {DOORWAYS.map((d) => (
              <button
                key={d.id}
                type="button"
                disabled={crossing || busy}
                onClick={() => cross(d.id)}
                className="min-h-[48px] border-b border-white/[0.07] py-3 text-left text-[17px] font-light leading-snug text-slate-300 transition-all duration-300 hover:pl-2 hover:text-slate-50 focus-visible:pl-2 focus-visible:text-slate-50 focus-visible:outline-none disabled:opacity-50"
                style={{ fontFamily: SERIF }}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* First-class, never a fallback. */}
          <button
            type="button"
            disabled={crossing || busy}
            onClick={() => cross(DOORWAY_UNSURE.id)}
            className="mt-5 min-h-[48px] py-2 text-left text-[16px] font-light italic leading-snug text-slate-500 transition-colors duration-300 hover:text-[#D4AF37] focus-visible:text-[#D4AF37] focus-visible:outline-none disabled:opacity-50"
            style={{ fontFamily: SERIF }}
          >
            {DOORWAY_UNSURE.label}
          </button>
        </motion.div>

        <AnimatePresence>
          {(crossing || busy) && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-8 text-[13px] italic text-slate-500"
              style={{ fontFamily: SERIF }}
              role="status"
            >
              MAIA is here.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ArrivalThreshold;
