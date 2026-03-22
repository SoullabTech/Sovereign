'use client';

/**
 * AuditExampleBlock — Sample output for /audit and field audit pages.
 *
 * archetype: 'founder' → Kelly field / inner-world positioning
 * archetype: 'systems' → Nathan field / operational positioning
 */

interface ExampleData {
  label: string;
  coreAxis: string;
  presentationAxis: string;
  keyInsight: string;
  tensionLead: string;
  tensionPoints: string[];
  shiftFrom: string;
  shiftTo: string;
  close: string;
}

const FOUNDER: ExampleData = {
  label: 'From a founder audit (anonymized)',
  coreAxis: 'Internally driven by pattern recognition, meaning, and synthesis. You naturally see connections and deeper structures others miss.',
  presentationAxis: 'Externally operating through responsibility and structure, presenting as organized and dependable.',
  keyInsight: 'You are translating a fluid, intuitive inner process into a fixed external structure — creating friction between how you think and how you act.',
  tensionLead: 'You generate insight from a nonlinear, pattern-based layer, but attempt to execute through linear structure.',
  tensionPoints: [
    'Hesitation before action — ideas feel incomplete until fully formed',
    'Over-refinement before expression, even when early sharing would accelerate the work',
    'A sense of "not fully being seen" despite strong internal clarity',
  ],
  shiftFrom: 'trying to fully organize your thinking before expressing it',
  shiftTo: 'expressing earlier and allowing structure to emerge through interaction',
  close: 'This is a simplified excerpt. Full audits include elemental mapping, pattern distortions, and a 30-day integration path.',
};

const SYSTEMS: ExampleData = {
  label: 'From a systems audit (anonymized)',
  coreAxis: 'Oriented toward systems coherence, optimization, and structural integrity. You naturally think in architectures and dependencies.',
  presentationAxis: 'Engaging selectively, often holding back full perspective until a system is fully formed or validated.',
  keyInsight: 'There is a gap between your internal system clarity and your external level of engagement — limiting the system\'s ability to evolve through interaction.',
  tensionLead: 'You are evaluating systems at a high level of precision, but not externalizing that evaluation early enough into the shared environment.',
  tensionPoints: [
    'Delayed decision cycles — validation loops run longer than the system requires',
    'Underutilization of system-level insight by collaborators who can\'t see what you see',
    'Gaps between architecture and active iteration, slowing adaptation',
  ],
  shiftFrom: 'validating systems internally before engagement',
  shiftTo: 'introducing partial models earlier and refining them through interaction',
  close: 'This is a simplified excerpt. Full audits include structural mapping, system tensions, and implementation-level recommendations.',
};

interface Props {
  archetype: 'founder' | 'systems';
}

export function AuditExampleBlock({ archetype }: Props) {
  const ex = archetype === 'systems' ? SYSTEMS : FOUNDER;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-stone-600">Sample output</p>
        <span className="text-xs text-stone-700 italic">{ex.label}</span>
      </div>

      <div className="border border-stone-800/80 rounded-lg overflow-hidden">
        {/* Core Structure */}
        <div className="px-5 pt-5 pb-4 border-b border-stone-800/60">
          <p className="text-xs uppercase tracking-widest text-amber-500/50 mb-3">Core Structure</p>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-stone-500">Core axis — </span>
              <span className="text-stone-300">{ex.coreAxis}</span>
            </p>
            <p>
              <span className="text-stone-500">Presentation axis — </span>
              <span className="text-stone-300">{ex.presentationAxis}</span>
            </p>
            <p className="text-stone-400 pt-1 leading-relaxed">{ex.keyInsight}</p>
          </div>
        </div>

        {/* Primary Tension */}
        <div className="px-5 py-4 border-b border-stone-800/60">
          <p className="text-xs uppercase tracking-widest text-amber-500/50 mb-3">Primary Tension</p>
          <p className="text-sm text-stone-400 leading-relaxed mb-3">{ex.tensionLead}</p>
          <ul className="space-y-1.5 text-sm text-stone-500">
            {ex.tensionPoints.map((pt) => (
              <li key={pt} className="flex gap-2">
                <span className="text-amber-500/30 shrink-0">·</span>
                {pt}
              </li>
            ))}
          </ul>
        </div>

        {/* Strategic Shift */}
        <div className="px-5 py-4">
          <p className="text-xs uppercase tracking-widest text-amber-500/50 mb-3">Strategic Shift</p>
          <p className="text-sm text-stone-400 leading-relaxed">
            Shift from {ex.shiftFrom}
            <span className="text-stone-600 mx-2">→</span>
            to {ex.shiftTo}
          </p>
        </div>
      </div>

      <p className="text-xs text-stone-700 leading-relaxed">{ex.close}</p>
    </div>
  );
}
