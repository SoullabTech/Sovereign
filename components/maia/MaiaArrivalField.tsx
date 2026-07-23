'use client';

/**
 * MaiaArrivalField — the contained Arrival composition (remodel, UI-only).
 *
 * One composed encounter, not scattered layers. The approved visual logic:
 *   Greeting → Invitation → Jewel → Primary action → Composer → The House.
 *
 * Rendered inside OracleConversation's greeting state (`!hasActivated`) so it
 * has the REAL greeting text, the REAL send handler, and real activation. On
 * activation ("I'm ready") or send (composer) the parent activates and this
 * field gives way to the conversation. No logic, routing, auth, or flags are
 * changed here — this is presentation of the arrival state only.
 *
 * Arrival owns the ceremonial greeting. It is deliberately NOT repeated as a
 * transcript turn after activation — the conversation opens clean and empty,
 * and MAIA speaks only once the member actually speaks or types.
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

const SERIF = 'Spectral, Georgia, serif';

export interface MaiaArrivalFieldProps {
  greeting: string;          // e.g. "Good evening, Kelly"
  subtext: string;           // e.g. "I'm here when you're ready — just tell me what you need."
  userInitial?: string;      // avatar letter
  /** Submit the first message (the real handleTextMessage). Activates conversation. */
  onSend: (text: string) => void;
  /**
   * Cross the threshold without authoring speech. "I'm ready" is the member's
   * answer to "I'm here when you're ready" — a gesture, not an utterance. It
   * opens the conversation empty rather than injecting a literal member turn.
   */
  onActivate: () => void;
  /** Open The House sheet (the real registry). */
  onOpenHouse: () => void;
  /** Save the moment — the existing "capture the spirit" gesture. */
  onKeep?: () => void;
}

export function MaiaArrivalField({ greeting, subtext, userInitial = 'K', onSend, onActivate, onOpenHouse, onKeep }: MaiaArrivalFieldProps) {
  const [draft, setDraft] = useState('');
  // Portal to <body>: OracleConversation renders inside MaiaCenterField's z-10
  // stacking context, which would trap this field beneath the top bar (z-70)
  // and rail (z-80). Portaling escapes it so the arrival reads as one field.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
  };

  if (!mounted) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16, scale: 0.98 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center px-5"
      style={{
        // Opaque field so the arrival reads as ONE contained composition,
        // covering the scattered conversation layers + chrome behind it.
        // Matches the approved mockup: violet bloom over warm near-black.
        background:
          'radial-gradient(66% 42% at 50% 16%, rgba(150,95,205,0.42), rgba(110,70,180,0.12) 34%, transparent 60%), linear-gradient(180deg,#1b1614 0%,#141010 46%,#0b0908 100%)',
      }}
    >
      {/* Compact header — a solid bar spanning the full width, so the top of
          the field reads as one edge rather than chrome floating on the bloom.
          The House lives here as a quiet icon at the upper left: still exactly
          ONE doorway, moved from the base of the composition. */}
      <div className="absolute inset-x-0 top-0 z-10 flex h-[54px] items-center justify-between bg-[#0a0807] px-4 md:px-6">
        <button
          type="button"
          onClick={onOpenHouse}
          title="The House"
          aria-label="Open The House"
          className="flex items-center text-[rgba(201,165,78,0.75)] transition-colors hover:text-[#c9a54e] focus:outline-none"
        >
          <Home className="h-[19px] w-[19px]" strokeWidth={1.5} />
        </button>
        <div className="flex items-center gap-3 text-[#b7ad9c]">
          {onKeep && (
            <button type="button" onClick={onKeep} title="Keep this moment" aria-label="Keep this moment"
              className="text-[rgba(230,169,74,0.85)] transition-colors hover:text-[#e6a94a] focus:outline-none">
              <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
              </svg>
            </button>
          )}
          <span className="text-[12px] font-semibold tracking-[0.26em]">MAIA</span>
          <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-[rgba(230,169,74,0.5)] text-[12px] font-semibold text-[#e6a94a]">
            {userInitial}
          </span>
        </div>
      </div>

      {/* One contained field — everything stacked and attached, max readable
          width. Lifted off dead-centre so the jewel sits higher in the frame
          and the composition reads as arriving rather than resting. */}
      <div className="-mt-[8vh] flex w-full max-w-[560px] flex-col items-center">
        {/* Greeting */}
        <h1
          className="text-center text-[clamp(28px,5vw,42px)] font-light leading-[1.1] text-maia-spice-500"
          style={{ fontFamily: SERIF, letterSpacing: '-0.01em', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
        >
          {greeting}
        </h1>

        {/* Invitation — attached to the greeting */}
        <p className="mt-3 text-center text-[clamp(14px,2.2vw,18px)] text-[#cbbfe0]" style={{ fontFamily: SERIF }}>
          {subtext}
        </p>

        {/* Jewel — holds the center, directly beneath the invitation.
            Deliberately NOT interactive here: voice belongs to the conversation,
            not the threshold (Kelly ruling). It was previously a button with an
            onTapJewel handler the parent never passed and a "Tap the flower to
            speak" aria-label — an affordance that promised voice and did
            nothing. Presence, not a control. */}
        <motion.img
          src="/logo_flower 2.png"
          alt="MAIA"
          className="mt-5 h-[clamp(140px,26vw,184px)] w-[clamp(140px,26vw,184px)] object-contain"
          style={{ filter: 'drop-shadow(0 0 26px rgba(150,95,205,0.40))' }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* The one invitation. Nothing on this screen may compete with it —
            Arrival Principle 3. Board weight: bordered, gold, generous.
            This is a threshold gesture: it activates, it does not speak. */}
        <button
          type="button"
          onClick={onActivate}
          className="mt-8 rounded-full border border-[rgba(230,169,74,0.55)] px-10 py-2.5 text-[clamp(15px,2vw,17px)] text-[#e6c48c] transition-colors duration-200 hover:border-[rgba(230,169,74,0.95)] hover:text-[#f2d9aa] focus-visible:border-[rgba(230,169,74,0.95)] focus:outline-none"
          style={{ fontFamily: SERIF }}
        >
          I&rsquo;m ready
        </button>

        {/* Composer — available, deliberately secondary to the invitation above */}
        <form
          className="mt-6 flex w-full items-center gap-3 rounded-[24px] border border-white/[0.07] bg-white/[0.03] px-5 py-3 backdrop-blur-md"
          onSubmit={(e) => { e.preventDefault(); send(draft); setDraft(''); }}
        >
          <span className="text-lg text-[#a99]" aria-hidden>+</span>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Message MAIA…"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-slate-100 placeholder:text-[#9a9182] focus:outline-none"
            style={{ fontFamily: SERIF }}
          />
          {/* Real submit control. The form has one text input and previously no
              button, so implicit submission never fired and Enter silently
              swallowed the member's first words. Rendering the existing glyph
              as type="submit" restores both Enter and tap-to-send without
              adding a new visual element. */}
          <button
            type="submit"
            aria-label="Send"
            className="text-[rgba(230,169,74,0.7)] transition-colors hover:text-[rgba(230,169,74,1)] focus:outline-none"
          >
            ◍
          </button>
        </form>

        {/* The House now lives as the icon at the upper left — deliberately not
            repeated here, so the composition still offers exactly one doorway. */}
      </div>
    </motion.div>,
    document.body
  );
}
