/**
 * Now What? — environment layout. One coherent warm register for every
 * route in the environment (founder ruling 2026-08-05: "make sure the UIUX
 * for Now What is all coherent brown, not this blue").
 *
 * The day rooms (Home, Coaching, Flourishing Field, Calendar) carry the
 * paper register themselves. The vestibule surfaces (threshold, session
 * room, field, map, arrive) were built in the old navy/slate palette; this
 * layout re-inks that palette into the brand's warm charcoal family —
 * cream ink, warm grays, bronze-gold — so the whole environment is one
 * house. Blue does not exist here.
 *
 * This is a scoped re-inking, not a per-file rewrite: the slate utility
 * ramp maps to the warm ramp inside .nww only. Rendering concern only —
 * no data, no behavior.
 */

import type { ReactNode } from 'react';

export default function NowWhatLayout({ children }: { children: ReactNode }) {
  return (
    <div className="nww">
      {children}
      <style
        // Scoped palette re-inking for the legacy dark surfaces.
        dangerouslySetInnerHTML={{
          __html: `
            .nww { --nww-bg-1: #211d18; --nww-bg-2: #1b1815; }

            /* Slate text ramp → warm ramp (cream to umber). */
            .nww .text-slate-100, .nww .text-slate-200 { color: #e9e2d4 !important; }
            .nww .text-slate-300 { color: #cfc5b2 !important; }
            .nww .text-slate-400 { color: #b6ac9a !important; }
            .nww .text-slate-500 { color: #99907e !important; }
            .nww .text-slate-600 { color: #857c6c !important; }
            .nww .text-slate-700 { color: #6b6355 !important; }
            .nww .hover\\:text-slate-100:hover, .nww .hover\\:text-slate-200:hover { color: #f2ecdf !important; }
            .nww .hover\\:text-slate-300:hover { color: #d8cfbc !important; }
            .nww .hover\\:text-slate-400:hover { color: #c2b8a5 !important; }

            /* Slate borders → warm rules. */
            .nww [class*="border-slate-4"] { border-color: rgba(233,226,212,0.28) !important; }
            .nww [class*="border-slate-6"] { border-color: rgba(233,226,212,0.18) !important; }
            .nww [class*="border-slate-7"] { border-color: rgba(233,226,212,0.13) !important; }
            .nww [class*="border-slate-8"] { border-color: rgba(233,226,212,0.10) !important; }

            /* Slate/white surface tints → warm paper glass. */
            .nww [class*="bg-slate-8"], .nww [class*="bg-slate-9"] { background-color: rgba(255,253,248,0.045) !important; }
            .nww [class*="bg-white\\/"] { background-color: rgba(255,253,248,0.05) !important; }

            /* Inputs: warm placeholders and carets on the charcoal. */
            .nww input::placeholder, .nww textarea::placeholder { color: #857c6c !important; }
            .nww input, .nww textarea { caret-color: #c9a35e; }

            /* Legacy navy wrappers already swept to #1f1b16; give them the
               brand's warm gradient depth. */
            .nww [class*="bg-[#1f1b16]"] {
              background: radial-gradient(ellipse 80% 45% at 50% 0%, rgba(196,164,110,0.07), transparent 60%),
                          linear-gradient(var(--nww-bg-1), var(--nww-bg-2)) !important;
            }
          `,
        }}
      />
    </div>
  );
}
