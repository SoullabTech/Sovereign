'use client';

/**
 * Now What? — the shared surface (UX-02, 2026-08-26).
 *
 * UX-01 finding NOW-WHAT-DESIGN-SYSTEM-SPLIT-01: the member crossed between two
 * design languages four times in one walk. Arrival and the Room declared their
 * own ground (flat `#1f1b16`) and used Tailwind's COOL slate ramp; Home and the
 * rooms use PaperRoom's WARM `--nw-*` language. Same product, two materials.
 *
 * This consolidates onto the language that already exists. It does NOT invent a
 * third one, and it does NOT copy hex values into another component-local
 * palette — it maps the cool ramp onto the warm one SEMANTICALLY, by role, in
 * one place:
 *
 *     slate-100/200  → --nw-ink        the thing being read
 *     slate-300/400  → --nw-ink-soft   supporting voice
 *     slate-500      → --nw-ink-faint  quiet label
 *     slate-600/700  → derived dims    barely-there scaffolding
 *     border-slate-* → --nw-rule       hairline
 *
 * Why remap rather than rewrite 188 call sites: the founder's UX-02 boundary
 * permits consolidating duplicate visual declarations and forbids redesigning
 * the rooms wholesale. A scoped remap changes the MATERIAL while leaving every
 * room's own composition — its sizes, weights, spacing, rhythm — untouched.
 * Shared material system: yes. Identical typographic drama: not required, and
 * not imposed here.
 *
 * Specificity note: `.nw-surface .text-slate-400` is (0,2,0) against Tailwind's
 * (0,1,0), so it wins without `!important` and stays overridable by anything
 * more specific that genuinely needs to differ.
 */

import type { ReactNode } from 'react';
import { NW_PALETTE_CSS, NW_PALETTE_DARK_CSS } from '@/components/now-what/PaperRoom';

export const NW_SURFACE_CSS = `
  .nw-surface { ${NW_PALETTE_CSS} }
  @media (prefers-color-scheme: dark) {
    .nw-surface { ${NW_PALETTE_DARK_CSS} }
  }
  .nw-surface {
    --nw-ink-dim: color-mix(in srgb, var(--nw-ink-faint) 76%, transparent);
    --nw-ink-dimmer: color-mix(in srgb, var(--nw-ink-faint) 52%, transparent);
    min-height: 100vh;
    color: var(--nw-ink);
    background:
      radial-gradient(ellipse 90% 45% at 50% -5%, var(--nw-wash-a), transparent 60%),
      linear-gradient(var(--nw-bg-1), var(--nw-bg-2));
    -webkit-font-smoothing: antialiased;
  }

  /* Cool ramp → warm ramp, by role. */
  .nw-surface .text-slate-100,
  .nw-surface .text-slate-200 { color: var(--nw-ink); }
  .nw-surface .text-slate-300,
  .nw-surface .text-slate-400 { color: var(--nw-ink-soft); }
  .nw-surface .text-slate-500 { color: var(--nw-ink-faint); }
  .nw-surface .text-slate-600 { color: var(--nw-ink-dim); }
  .nw-surface .text-slate-700 { color: var(--nw-ink-dimmer); }

  .nw-surface [class*="border-slate-"] { border-color: var(--nw-rule); }
  .nw-surface [class*="placeholder:text-slate-"]::placeholder,
  .nw-surface ::placeholder { color: var(--nw-ink-dim); }
`;

/** Wraps a Now What? screen in the environment's one material language. */
export function NowWhatSurface({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`nw-surface ${className}`.trim()}>
      <style>{NW_SURFACE_CSS}</style>
      {children}
    </div>
  );
}
