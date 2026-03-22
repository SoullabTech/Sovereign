'use client';

/**
 * MAIA Identity Audit — Report View
 *
 * Client-facing report rendered from IdentityAuditResult.
 * Structured sections match the V1 report template specification.
 */

import type { IdentityAuditResult } from '@/lib/maia/prompts/identityAuditPrompt';

const ELEMENT_LABELS: Record<string, { label: string; descriptor: string }> = {
  fire:   { label: 'Fire',   descriptor: 'vision / drive' },
  water:  { label: 'Water',  descriptor: 'emotion / depth' },
  earth:  { label: 'Earth',  descriptor: 'structure / execution' },
  air:    { label: 'Air',    descriptor: 'thought / communication' },
  aether: { label: 'Aether', descriptor: 'integration / meaning' },
};

interface Props {
  result: IdentityAuditResult;
  name?: string;
  onReset: () => void;
}

export function IdentityAuditReport({ result, name, onReset }: Props) {
  const {
    coreAxis,
    presentationAxis,
    primaryTensions,
    elementalState,
    patternDistortions,
    strategicShifts,
    integrationPath30Days,
    summarySignal,
  } = result;

  const dominant = elementalState.dominant;
  const underdeveloped = elementalState.underdeveloped;

  return (
    <div className="space-y-14">

      {/* Header */}
      <div className="border-b border-stone-800 pb-8">
        <p className="text-xs uppercase tracking-widest text-amber-500/70 mb-3">MAIA Identity Audit</p>
        <h1 className="text-2xl font-light text-stone-100 mb-2">
          {name ? `${name}'s Identity Map` : 'Your Identity Map'}
        </h1>
        <p className="text-sm text-stone-500">
          A structural analysis — held as a map, not a verdict.
        </p>
      </div>

      {/* 2. Core Structure */}
      <section>
        <SectionLabel number="2" title="Core Structure" />
        <div className="space-y-6 mt-6">
          <StructureBlock
            label="Core Axis"
            sublabel="What you are organized around"
            content={coreAxis}
          />
          <StructureBlock
            label="Presentation Axis"
            sublabel="How you meet the world"
            content={presentationAxis}
          />
          {dominant && underdeveloped && (
            <p className="text-sm text-stone-500 italic border-l-2 border-stone-700 pl-4">
              Dominant element: <span className="text-amber-400/80">{dominant}</span>
              {' '}· Underdeveloped: <span className="text-stone-400">{underdeveloped}</span>
            </p>
          )}
        </div>
      </section>

      {/* 3. Primary Tensions */}
      {primaryTensions?.length > 0 && (
        <section>
          <SectionLabel number="3" title="Primary Tensions" />
          <ul className="mt-6 space-y-4">
            {primaryTensions.map((tension, i) => (
              <li key={i} className="flex gap-4">
                <span className="text-amber-500/40 text-sm mt-0.5 shrink-0">{i + 1}.</span>
                <p className="text-stone-300 text-sm leading-relaxed">{tension}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 4. Pattern Distortions */}
      {patternDistortions?.length > 0 && (
        <section>
          <SectionLabel number="4" title="Pattern Distortions" />
          <p className="text-xs text-stone-600 mt-2 mb-5">
            Where the system loops, collapses, or misroutes energy — not character flaws.
          </p>
          <ul className="space-y-4">
            {patternDistortions.map((distortion, i) => (
              <li key={i} className="flex gap-4">
                <span className="text-stone-600 text-sm mt-0.5 shrink-0">·</span>
                <p className="text-stone-300 text-sm leading-relaxed">{distortion}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 5. Elemental Mapping */}
      <section>
        <SectionLabel number="5" title="Elemental Mapping" />
        <div className="mt-6 space-y-5">
          {(['fire', 'water', 'earth', 'air', 'aether'] as const).map((el) => {
            const meta = ELEMENT_LABELS[el];
            const content = elementalState[el];
            const isDominant = dominant === el;
            const isUnder = underdeveloped === el;
            return (
              <div
                key={el}
                className={`border rounded p-4 ${
                  isDominant
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : isUnder
                    ? 'border-stone-700 bg-stone-900/50'
                    : 'border-stone-800 bg-stone-950'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-medium text-stone-200">{meta.label}</span>
                  <span className="text-xs text-stone-600">{meta.descriptor}</span>
                  {isDominant && (
                    <span className="text-xs text-amber-500/70 ml-auto">dominant</span>
                  )}
                  {isUnder && (
                    <span className="text-xs text-stone-600 ml-auto">underdeveloped</span>
                  )}
                </div>
                <p className="text-stone-400 text-sm leading-relaxed">{content}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Strategic Shifts */}
      {strategicShifts?.length > 0 && (
        <section>
          <SectionLabel number="6" title="Strategic Shifts" />
          <p className="text-xs text-stone-600 mt-2 mb-5">
            The three highest-leverage corrections available right now.
          </p>
          <div className="space-y-4">
            {strategicShifts.map((shift, i) => (
              <div key={i} className="border border-stone-800 rounded p-4 bg-stone-950">
                <div className="flex gap-4">
                  <span className="text-amber-500/60 text-xs font-medium mt-0.5 shrink-0">
                    SHIFT {i + 1}
                  </span>
                  <p className="text-stone-300 text-sm leading-relaxed">{shift}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. 30-Day Integration Path */}
      {integrationPath30Days?.length > 0 && (
        <section>
          <SectionLabel number="7" title="30-Day Integration Path" />
          <div className="mt-6 space-y-4">
            {integrationPath30Days.map((step, i) => (
              <div key={i} className="flex gap-4">
                <span className="text-xs text-stone-600 mt-1 shrink-0 w-14">Week {i + 1}</span>
                <p className="text-stone-300 text-sm leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8. Closing Signal */}
      {summarySignal && (
        <section className="border-t border-stone-800 pt-10">
          <SectionLabel number="8" title="Closing Signal" />
          <blockquote className="mt-6 pl-5 border-l-2 border-amber-500/40">
            <p className="text-stone-300 text-sm leading-relaxed italic">{summarySignal}</p>
          </blockquote>
        </section>
      )}

      {/* Footer actions */}
      <div className="border-t border-stone-800 pt-8 flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => window.print()}
          className="flex-1 py-3 rounded border border-stone-700 text-stone-400 text-sm hover:border-stone-500 hover:text-stone-300 transition-colors"
        >
          Print / Save as PDF
        </button>
        <button
          onClick={onReset}
          className="flex-1 py-3 rounded border border-stone-700 text-stone-400 text-sm hover:border-stone-500 hover:text-stone-300 transition-colors"
        >
          New Audit
        </button>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-xs text-stone-700">{number}.</span>
      <h2 className="text-base font-medium text-stone-200">{title}</h2>
    </div>
  );
}

function StructureBlock({
  label,
  sublabel,
  content,
}: {
  label: string;
  sublabel: string;
  content: string;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-sm font-medium text-stone-300">{label}</span>
        <span className="text-xs text-stone-600">{sublabel}</span>
      </div>
      <p className="text-stone-400 text-sm leading-relaxed pl-4 border-l border-stone-800">
        {content}
      </p>
    </div>
  );
}
