'use client';

/**
 * MAIA Identity Audit — Public Landing Page
 * /audit
 *
 * Marketing entry point — no auth required.
 * Shows intake form, runs audit via /api/audit/identity, renders report.
 */

import { useState } from 'react';
import { IdentityAuditForm } from '@/components/audit/IdentityAuditForm';
import { IdentityAuditReport } from '@/components/audit/IdentityAuditReport';
import type { IdentityAuditIntake, IdentityAuditResult } from '@/lib/maia/prompts/identityAuditPrompt';

type PageState =
  | { phase: 'intro' }
  | { phase: 'form' }
  | { phase: 'loading' }
  | { phase: 'result'; result: IdentityAuditResult; name?: string }
  | { phase: 'error'; message: string };

export default function AuditPage() {
  const [state, setState] = useState<PageState>({ phase: 'intro' });

  const handleSubmit = async (intake: IdentityAuditIntake) => {
    setState({ phase: 'loading' });

    try {
      const res = await fetch('/api/audit/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(intake),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? 'Audit generation failed.');
      }

      setState({
        phase: 'result',
        result: data.result as IdentityAuditResult,
        name: intake.name,
      });
    } catch (err) {
      setState({
        phase: 'error',
        message: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <div className="max-w-2xl mx-auto px-6 py-16">

        {/* Intro */}
        {state.phase === 'intro' && (
          <div className="space-y-10">
            <div>
              <p className="text-xs uppercase tracking-widest text-amber-500/70 mb-4">Soullab</p>
              <h1 className="text-3xl font-light text-stone-100 mb-4 leading-snug">
                A high-resolution map of how your system actually works.
              </h1>
              <p className="text-stone-400 text-base leading-relaxed">
                Not personality. Not surface behavior.
                Structure, patterns, and realignment.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-stone-600">What we analyze</p>
              <ul className="space-y-2 text-sm text-stone-400">
                {[
                  'Core identity axis',
                  'How you meet the world',
                  'Pattern distortions',
                  'Elemental balance',
                  'Strategic shifts',
                  '30-day integration path',
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="text-amber-500/50">·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-stone-600">Who this is for</p>
              <div className="flex flex-wrap gap-2">
                {['Founders', 'Creators', 'Guides', 'Operators', 'Anyone who knows something deeper is happening'].map((who) => (
                  <span key={who} className="px-3 py-1.5 border border-stone-800 rounded text-xs text-stone-500">
                    {who}
                  </span>
                ))}
              </div>
            </div>

            {/* Example output */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-stone-600">Sample output</p>
                <span className="text-xs text-stone-700 italic">From a founder audit (anonymized)</span>
              </div>

              <div className="space-y-3 border border-stone-800/80 rounded-lg overflow-hidden">
                {/* Block 1 */}
                <div className="px-5 pt-5 pb-4 border-b border-stone-800/60">
                  <p className="text-xs uppercase tracking-widest text-amber-500/50 mb-3">Core Structure</p>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-stone-500">Core axis —</span> <span className="text-stone-300">Internally visionary and pattern-oriented, driven by meaning and synthesis.</span></p>
                    <p><span className="text-stone-500">Presentation axis —</span> <span className="text-stone-300">Externally structured and responsible, leading through organization and delivery.</span></p>
                    <p className="text-stone-400 pt-1 leading-relaxed">
                      There is a gap between how you think and how you present. This gap creates friction in execution and communication.
                    </p>
                  </div>
                </div>

                {/* Block 2 */}
                <div className="px-5 py-4 border-b border-stone-800/60">
                  <p className="text-xs uppercase tracking-widest text-amber-500/50 mb-3">Primary Tension</p>
                  <p className="text-sm text-stone-400 leading-relaxed mb-3">
                    You generate ideas from a high-level pattern recognition layer but express them through structured execution.
                  </p>
                  <ul className="space-y-1.5 text-sm text-stone-500">
                    <li className="flex gap-2"><span className="text-amber-500/30 shrink-0">·</span>Difficulty translating vision into action without over-engineering first</li>
                    <li className="flex gap-2"><span className="text-amber-500/30 shrink-0">·</span>Others perceive you as structured — you experience yourself as exploratory</li>
                  </ul>
                </div>

                {/* Block 3 */}
                <div className="px-5 py-4">
                  <p className="text-xs uppercase tracking-widest text-amber-500/50 mb-3">Strategic Shift</p>
                  <p className="text-sm text-stone-400 leading-relaxed">
                    Shift from structuring your thinking <em>before</em> expression
                    <span className="text-stone-600 mx-2">→</span>
                    to expressing earlier and letting structure emerge from what you actually produce.
                  </p>
                </div>
              </div>

              <p className="text-xs text-stone-700 leading-relaxed">
                This is a simplified excerpt. Full audits include elemental mapping, distortion patterns, and a 30-day integration path.
              </p>
            </div>

            <button
              onClick={() => setState({ phase: 'form' })}
              className="w-full py-4 bg-amber-500 text-stone-950 rounded text-sm font-medium tracking-wide hover:bg-amber-400 transition-colors"
            >
              Request Your Audit
            </button>

            <p className="text-xs text-stone-700 text-center">
              No account required. Takes 5–10 minutes.
            </p>
          </div>
        )}

        {/* Form */}
        {(state.phase === 'form' || state.phase === 'loading') && (
          <div>
            <div className="mb-10">
              <p className="text-xs uppercase tracking-widest text-amber-500/70 mb-3">
                MAIA Identity Audit
              </p>
              <h1 className="text-2xl font-light text-stone-100 mb-2">Intake</h1>
              <p className="text-sm text-stone-500">
                Answer as honestly as you can. Precision in → precision out.
              </p>
            </div>
            <IdentityAuditForm
              onSubmit={handleSubmit}
              isLoading={state.phase === 'loading'}
            />
          </div>
        )}

        {/* Loading */}
        {state.phase === 'loading' && (
          <div className="fixed inset-0 bg-stone-950/80 flex items-center justify-center z-50">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto" />
              <p className="text-stone-400 text-sm">Generating your audit…</p>
              <p className="text-stone-600 text-xs">This takes 20–40 seconds.</p>
            </div>
          </div>
        )}

        {/* Error */}
        {state.phase === 'error' && (
          <div className="space-y-6">
            <p className="text-stone-400 text-sm">{state.message}</p>
            <button
              onClick={() => setState({ phase: 'form' })}
              className="text-amber-500 text-sm hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Result */}
        {state.phase === 'result' && (
          <IdentityAuditReport
            result={state.result}
            name={state.name}
            onReset={() => setState({ phase: 'intro' })}
          />
        )}

      </div>
    </div>
  );
}
