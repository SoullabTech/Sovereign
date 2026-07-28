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

/**
 * GEOMETRY INVARIANT (#704): with the software keyboard open, the complete
 * Arrival focal object remains visible within the usable VISUAL viewport,
 * without device-specific offsets.
 *
 * `position: fixed; inset: 0` pins a box to the LAYOUT viewport, which iOS
 * does not shrink when the keyboard opens. When the focused composer input
 * scrolls into view above the keyboard, `visualViewport.offsetTop` becomes
 * nonzero — but a fixed box tracks the layout viewport, not the visual one,
 * so it does not move with that scroll. The top of the box (the holoflower)
 * scrolls out of the visible window above it. That is the measured crop.
 *
 * `window.visualViewport` is the platform API built for exactly this: it
 * tracks the actually-visible rectangle, independent of keyboard, URL-bar
 * collapse, or pinch-zoom, and fires `resize`/`scroll` as it changes. This is
 * feature detection, not UA parsing — it has shipped in iOS Safari (and
 * WKWebView, so Chrome-on-iOS too) since iOS 13, which covers the observed
 * fleet. Browsers without it fall back to the old inset-0 behavior; the
 * effect below simply never updates the box away from that default.
 */
function useVisualViewportBox() {
  const [box, setBox] = useState(() => ({
    top: 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  }));

  useEffect(() => {
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    if (!vv) return; // no API — box stays at the SSR-safe fallback above
    const update = () => setBox({ top: vv.offsetTop, height: vv.height });
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  return box;
}

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
  const viewportBox = useVisualViewportBox();

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
      className="fixed left-0 right-0 z-[90] flex flex-col items-center overflow-y-auto px-5"
      style={{
        // GEOMETRY INVARIANT (#704): top/height come from the VISUAL viewport,
        // not `inset-0`/100%, so the field tracks the keyboard-reduced visible
        // area instead of the static layout viewport. See useVisualViewportBox.
        top: viewportBox.top,
        height: viewportBox.height,
        // `safe center`: centers the content when it fits, but falls back
        // toward the start rather than clipping it off-screen when the
        // available height is too short to fit everything (a small keyboard
        // + landscape phone) — the plain `center` keyword can otherwise make
        // the very top of the content unreachable, even with overflow:auto.
        // Unsupported browsers ignore the value and get top-alignment, which
        // is the safe direction to fail in (no crop), not a wrong one.
        //
        // REACHABILITY FIX: `safe center`'s fallback only works if the item
        // has no negative margin. This container previously relied on the
        // content wrapper's `-mt-[8vh]` for its "lifted above dead-centre"
        // framing — but a negative margin inside an `overflow-y:auto` box
        // pulls the item's border box above the container's own top edge,
        // i.e. to a negative coordinate. `scrollTop` cannot go negative, so
        // that content became permanently unreachable by scroll whenever it
        // didn't fit (measured: top-marker at -70px, scrollTop stuck at 0) —
        // reproducing the exact #704 crop this field exists to prevent, just
        // by a different mechanism. The lift is now expressed entirely as
        // container padding instead:
        //  - paddingTop reserves the header's REAL height — 54px PLUS the top
        //    safe-area inset the header itself honors (line ~168). Reserving a
        //    flat 54px let the inset-sized band under the notch crop the crown
        //    of the holoflower on notched devices: the `safe` fallback's
        //    top-aligned content started UNDER the header, not below it (native
        //    device walk, 2026-07-27). With the inset reserved it clears, and is
        //    visible at scrollTop: 0.
        //  - paddingBottom carries the old margin's ~8vh lift PLUS a bare 54px.
        //    Because paddingTop now also carries the inset, the centered
        //    (fits-fine) content sits ~inset/2 lower than the pre-inset version
        //    — exactly the "move it down a bit so the whole flower shows" the
        //    notch requires. No negative margin exists anywhere in the
        //    scrollable coordinate space, in either the fits or overflow case.
        justifyContent: 'safe center',
        paddingTop: 'calc(54px + max(env(safe-area-inset-top), 0px))',
        paddingBottom: 'calc(54px + 8vh)',
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
      {/* NATIVE/PWA: safe-area term must stay IDENTICAL to the House box in
          MaiaShell — the two doorways swap beneath the member and must occupy
          the same content row. env is 0 in desktop browsers (web unchanged);
          on device it keeps the row below the status bar, with this header's
          background still covering the notch zone.

          RECONCILED with #763 (reconcile-not-stack, 2026-07-28): the native
          lane's grown-box height (background covers the notch) carries the
          founder's 6px breath inside ONE padding source. Do not reintroduce a
          second inset via style — that is the double-inset this note guards. */}
      <div className="absolute inset-x-0 top-0 z-10 flex h-[calc(54px+env(safe-area-inset-top,0px))] items-center justify-between bg-[#0a0807] pt-[calc(env(safe-area-inset-top,0px)+6px)] px-4 md:px-6">
        {/* The doorway. Icon + label, 44px tall, matching MaiaShell's doorway
            exactly so it does not move or change shape when Arrival gives way to
            conversation. It was a bare 19x19 glyph — under half the 44px minimum,
            and it is the only way out of Arrival, so a missed tap is a trapped
            member. Same reasoning as the send arrow. */}
        <button
          type="button"
          onClick={onOpenHouse}
          title="The House — your places and practices"
          aria-label="Open The House"
          className="group -ml-1 flex h-11 min-w-[44px] items-center gap-2 rounded-full px-2 text-[rgba(201,165,78,0.75)] transition-colors hover:text-[#c9a54e] focus:outline-none"
        >
          <Home className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
          {/* Label revealed on hover/focus, exactly as the shell doorway does.
              These two must stay identical — the doorway is one place to the
              member even though two components render it. Change both or
              neither, and verify by measuring, not by reading. */}
          <span
            className="max-w-0 overflow-hidden whitespace-nowrap text-[15px] leading-none opacity-0 transition-all duration-300 group-hover:max-w-[8rem] group-hover:opacity-100 group-focus-visible:max-w-[8rem] group-focus-visible:opacity-100"
            style={{ fontFamily: SERIF }}
            aria-hidden="true"
          >
            The House
          </span>
        </button>
        <div className="flex items-center gap-3 text-[#b7ad9c]">
          {onKeep && (
            <button type="button" onClick={onKeep} title="Keep this moment" aria-label="Keep this moment"
              className="flex h-11 w-11 items-center justify-center text-[rgba(230,169,74,0.85)] transition-colors hover:text-[#e6a94a] focus:outline-none">
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
          width. The "lifted off dead-centre" framing now lives entirely in
          the parent's padding (see the paddingTop/paddingBottom comment
          above) — this wrapper carries no margin, so nothing here can push
          content to an unreachable negative scroll coordinate. */}
      <div className="flex w-full max-w-[560px] flex-col items-center">
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
            // 16px, not 15px: iOS Safari auto-zooms the page on focus for
            // any input under 16px. The project deliberately never caps
            // zoom (userScalable: true, app/layout.tsx — WCAG 1.4.4), so
            // this can't be suppressed that way; 16px is the only fix that
            // doesn't also block a member's own zoom.
            className="min-w-0 flex-1 bg-transparent text-[16px] text-slate-100 placeholder:text-[#9a9182] focus:outline-none"
            style={{ fontFamily: SERIF }}
          />
          {/* Real submit control. The form has one text input and previously no
              button, so implicit submission never fired and Enter silently
              swallowed the member's first words. Rendering the existing glyph
              as type="submit" restores both Enter and tap-to-send without
              adding a new visual element. */}
          {/* The glyph's own box is ~10x24px, far under the 44px minimum — and
              this is the only tap-to-send control on the composer, which is the
              only place a member can author their first words here (the jewel is
              presence; "I'm ready" crosses the threshold without speech). A
              missed tap is a missed arrival.

              The ::before pseudo gives it a 44x44 hit area and adds no layout,
              being absolutely positioned, so the glyph stays 10x24 at 16px and
              the composition is untouched. The quiet target grows; the visible
              arrow is deliberately NOT enlarged into a button. */}
          <button
            type="submit"
            aria-label="Send"
            className="relative text-[rgba(230,169,74,0.7)] transition-colors hover:text-[rgba(230,169,74,1)] focus:outline-none before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']"
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
