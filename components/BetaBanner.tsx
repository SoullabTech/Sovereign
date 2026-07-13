/**
 * BetaBanner — platform-wide beta watermark.
 *
 * A small, persistent, non-interactive indicator that the current platform is
 * in beta. Mounted once in the root layout so it appears on every route.
 *
 * Feature-flagged: renders ONLY when `NEXT_PUBLIC_SHOW_BETA_BADGE === "true"`.
 * Ending beta is a config change, not a code change — set the flag to false
 * (or remove it) and rebuild. Note: `NEXT_PUBLIC_*` env vars are inlined at
 * BUILD time, so the flag takes effect on the next build/deploy (the standard
 * Docker `up -d --build` already rebuilds), not at container runtime.
 *
 * Scope: this is purely a global platform-maturity marker. It is deliberately
 * NOT a notification/attention surface — messaging and alerts belong to the
 * Command Center / Co-lab attention layer, not to this banner.
 *
 * Design notes:
 * - `pointer-events: none` — purely informational; never blocks clicks or
 *   interferes with any page's own header/controls beneath it (incl. admin /
 *   substrate / debug diagnostics).
 * - Anchored top-RIGHT, not top-center: pages center their wordmarks in the
 *   header (e.g. "Now What?" on /now-what/map), and a centered badge occludes
 *   the name at every viewport width — violating the name-legibility ruling
 *   (PR #598: "the environment's name always reads"). The right corner stays
 *   clear of centered titles and of the top-left back/nav affordances.
 * - `z-30`, deliberately below page chrome (e.g. /maia's header bar, z-60),
 *   toasts (z-50), and modals: a maturity watermark floats over the canvas,
 *   never over attention or interaction surfaces. On surfaces whose own
 *   chrome occupies the top-right corner, the chrome wins and the badge
 *   yields — it must never visually cover a control (the account chip on
 *   /maia sits exactly there).
 * - Respects `env(safe-area-inset-top)` / `env(safe-area-inset-right)` so it
 *   clears the iOS notch in the PWA / Capacitor build.
 * - Persistent / non-dismissable by design: beta status is an honest claim about
 *   the platform's maturity, in keeping with the representation discipline
 *   (docs/canon/MARKETING_CLAIM_DISCIPLINE.md).
 */
export function BetaBanner() {
  if (process.env.NEXT_PUBLIC_SHOW_BETA_BADGE !== "true") {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed right-0 top-0 z-30 flex justify-end"
      style={{
        paddingTop: "calc(env(safe-area-inset-top) + 6px)",
        paddingRight: "calc(env(safe-area-inset-right) + 10px)",
      }}
    >
      <div
        role="note"
        aria-label="This platform is in beta"
        className="pointer-events-none select-none flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-[#1A1513]/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-amber-200/80 shadow-sm backdrop-blur-sm"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400/80" aria-hidden="true" />
        Beta
      </div>
    </div>
  );
}
