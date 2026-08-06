'use client';

import type { ReactNode } from 'react';

/**
 * THE AIN CANVAS — the shell.
 *
 * "The AIN Canvas is an identifiable, ceremonial, reliable place where human
 *  work can grow — from a fleeting thought to a lifetime of contribution."
 *  (Founder, 2026-08-05.)
 *
 * The canonical spatial grammar of AIN. Every discipline is a specialization
 * — writing, coaching reflection, research, course-building, design — and
 * the governing law is: **the work changes; the canvas remains.**
 *
 * Grammar extracted from the reference implementation, the publishing
 * sibling (public/book-studio-canvas.html): a quiet toolbar strip; a
 * workspace of navigator (220px) · easel (1fr) · context (240px); the easel
 * is the ONE scroll region and the work surface it centers carries physical
 * weight. Theme is tokenized per deployment so each sibling keeps its own
 * identity (Book Studio its cool graphite, Writer Studio its warm espresso);
 * the proportions and the feeling of place are what stay constant.
 *
 * Four extension points, no content opinions:
 *   toolbar    — top strip; essential actions for the work at center.
 *   navigator  — left rail; how this discipline finds its way around the work.
 *   support    — right column; what quietly supports the work (context,
 *                sources, reflection). May be empty: emptiness is honest.
 *   children   — THE WORK. The dominant central object, on the easel.
 *
 * Constitutionally excluded from this framework: publishing machinery
 * (blocks, page types, templates, typesetting, proofing, export state) and
 * any tool that exists only because it exists elsewhere. Every surrounding
 * control must support the work currently at the center.
 */

export interface CanvasTheme {
  /** Chrome panels: toolbar, rails. */
  chrome: string;
  /** The void the easel floats in — darker than chrome, calmer than black. */
  voidBg: string;
  /** Hairlines between chrome regions (the only borders the shell owns). */
  border: string;
  text: string;
  dim: string;
  accent: string;
}

interface CanvasShellProps {
  theme: CanvasTheme;
  toolbar?: ReactNode;
  navigator?: ReactNode;
  support?: ReactNode;
  /** The work — rendered on the easel, centered, in the one scroll region. */
  children: ReactNode;
}

export default function CanvasShell({
  theme,
  toolbar,
  navigator,
  support,
  children,
}: CanvasShellProps) {
  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: theme.voidBg, color: theme.text }}
    >
      {toolbar && (
        <div
          className="shrink-0 border-b"
          style={{ background: theme.chrome, borderColor: theme.border }}
        >
          {toolbar}
        </div>
      )}

      {/* The workspace: rails are chrome; the easel is the place. Rails
          collapse away on small screens rather than crowding the work. */}
      <div className="flex-1 min-h-0 flex">
        {navigator && (
          <aside
            className="hidden md:block w-[220px] shrink-0 border-r overflow-y-auto"
            style={{ background: theme.chrome, borderColor: theme.border }}
          >
            {navigator}
          </aside>
        )}

        {/* The easel — the ONE scroll region. The work floats centered in
            the void with room to breathe; nothing inside it scrolls. */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="min-h-full flex justify-center px-4 md:px-8 py-8">{children}</div>
        </main>

        {support && (
          <aside
            className="hidden lg:block w-[240px] shrink-0 border-l overflow-y-auto"
            style={{ background: theme.chrome, borderColor: theme.border }}
          >
            {support}
          </aside>
        )}
      </div>
    </div>
  );
}
