'use client';

/**
 * Render Print PDF — the studio's render trigger surface.
 *
 * Wires to the existing render scripts (scripts/render-book-print.ts,
 * lib/manuscript/render/pagedPdf.ts). This page surfaces the latest
 * output and a placeholder trigger button.
 *
 * Phase 1: shows status + last-known PDF link if present.
 * Phase 2: trigger render via API endpoint.
 */

import { useState } from 'react';

export default function RenderPage() {
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleRender = async () => {
    setRunning(true);
    setMessage('Render trigger not yet wired to API. Run locally: npx tsx scripts/render-book-print.ts');
    setRunning(false);
  };

  return (
    <div>
      <header className="mb-10">
        <p className="text-amber-200/40 text-[11px] tracking-[0.25em] uppercase mb-2">
          The Book Studio
        </p>
        <h1 className="text-amber-100/90 text-2xl md:text-3xl font-light tracking-wide">
          Render Print PDF
        </h1>
        <p className="text-amber-200/45 text-sm font-light italic mt-1">
          Trigger the print pipeline; review output.
        </p>
      </header>

      <section className="space-y-8 max-w-2xl">
        <div className="border border-amber-200/10 rounded-md p-6 bg-amber-300/[0.02]">
          <p className="text-amber-200/55 text-[11px] tracking-[0.25em] uppercase mb-3">
            Pipeline
          </p>
          <ul className="text-amber-50/75 text-sm font-light space-y-1.5 leading-relaxed">
            <li>Source: <code className="text-amber-300/70">docs/book-studio/ELEMENTAL_ALCHEMY_FROM_ORIGINAL_FULL.md</code></li>
            <li>Renderer: <code className="text-amber-300/70">lib/manuscript/render/pagedPdf.ts</code> (Paged.js)</li>
            <li>Stylesheet: <code className="text-amber-300/70">lib/manuscript/render/print.css</code></li>
            <li>Script: <code className="text-amber-300/70">scripts/render-book-print.ts</code></li>
          </ul>
        </div>

        <div>
          <button
            type="button"
            onClick={handleRender}
            disabled={running}
            className="text-amber-200/70 hover:text-amber-100 text-sm tracking-wide transition-colors duration-300 border border-amber-200/20 hover:border-amber-200/40 px-5 py-2 rounded-md disabled:opacity-50"
          >
            {running ? 'Rendering…' : 'Trigger render'}
          </button>
          {message && (
            <p className="mt-4 text-amber-200/55 text-sm font-light italic">
              {message}
            </p>
          )}
        </div>

        <p className="text-amber-200/35 text-xs italic">
          Note: render trigger via API not yet wired. For now, run the script locally
          and the PDF lands in <code>exports/</code>.
        </p>
      </section>
    </div>
  );
}
