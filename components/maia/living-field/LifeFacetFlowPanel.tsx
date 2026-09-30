'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';
import { seedMaiaPrompt } from '@/lib/maia/seedPrompt';
import { useMaiaPresence } from '@/components/maia/presence/MaiaPresence';

type FlowFacet = 'journal' | 'reflections' | 'changes' | 'decisions' | 'divination' | 'astrology';
type LensId = 'elemental' | 'spiralogic' | 'developmental' | 'relational' | 'temporal' | 'symbolic';

type FlowEndpoint = {
  facet: FlowFacet;
  refId: string;
  label: string;
  href: string;
};

type FacetFlow = {
  id: string;
  crossingId: string;
  source: FlowEndpoint | null;
  target: FlowEndpoint | null;
  createdAt: string;
};

type FlowEvidence = {
  flowId: string;
  crossingId: string;
  source: FlowEndpoint & { excerpt: string };
  target: FlowEndpoint & { excerpt: string };
  createdAt: string;
};

const FACET_LABEL: Record<FlowFacet, string> = {
  journal: 'Journal',
  reflections: 'Reflections',
  changes: 'Change',
  decisions: 'Decision',
  divination: 'Divination',
  astrology: 'Astrology',
};

const LENSES: Array<{ id: LensId; label: string; question: string }> = [
  {
    id: 'elemental',
    label: 'Elemental',
    question:
      'What modes of participation — Fire, Water, Earth, Air, or the larger Fifth — might this movement invite me to notice? Hold each element as a living mode that can change with context.',
  },
  {
    id: 'spiralogic',
    label: 'Spiralogic',
    question:
      'What movement, differentiation, integration, return, or threshold might this path invite me to notice? Hold stage language lightly and provisionally.',
  },
  {
    id: 'developmental',
    label: 'Developmental',
    question:
      'What trajectory, tension, threshold, or developing capacity might this path invite me to consider? Keep any developmental reading provisional and member-correctable.',
  },
  {
    id: 'relational',
    label: 'Relational',
    question:
      'What might become visible if we attend to the relationship between these two moments rather than reducing the relation to either one?',
  },
  {
    id: 'temporal',
    label: 'Temporal',
    question:
      'What changes when this movement is understood in its actual sequence and lived time, without treating sequence as causation?',
  },
  {
    id: 'symbolic',
    label: 'Symbolic',
    question:
      'What possibilities become visible symbolically here? Keep symbol as an opening for meaning, never as fact, diagnosis, or prediction.',
  },
];

function when(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  });
}

function Endpoint({
  endpoint,
  role,
}: {
  endpoint: FlowEndpoint | null;
  role: 'source' | 'target';
}) {
  if (!endpoint) {
    return (
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.18em] text-stone-700">
          {role === 'source' ? 'Earlier source' : 'Later place'}
        </p>
        <p className="mt-1 text-xs italic text-stone-700">This place sits beyond the current view.</p>
      </div>
    );
  }

  return (
    <a href={endpoint.href} className="group block min-w-0">
      <p className="text-[10px] uppercase tracking-[0.18em] text-stone-600 group-hover:text-stone-500">
        {FACET_LABEL[endpoint.facet]}
      </p>
      <p className="mt-1 truncate text-sm font-light text-stone-300 group-hover:text-stone-100">
        {endpoint.label}
      </p>
    </a>
  );
}

function buildLensPrompt(evidence: FlowEvidence, lens: LensId): string {
  const lensConfig = LENSES.find((item) => item.id === lens)!;
  const sourceFacet = FACET_LABEL[evidence.source.facet];
  const targetFacet = FACET_LABEL[evidence.target.facet];

  return [
    'I want to explore a path I explicitly made in Soullab.',
    '',
    `SOURCE — ${sourceFacet}: "${evidence.source.label}"`,
    evidence.source.excerpt,
    '',
    `TARGET — ${targetFacet}: "${evidence.target.label}"`,
    evidence.target.excerpt,
    '',
    `I want to look at this through ${lensConfig.id === 'elemental' ? 'an' : 'a'} ${lensConfig.label} lens.`,
    lensConfig.question,
    '',
    'Please distinguish what is directly present in the source and target from what this lens suggests. Treat the lens as a perspective. Let lived meaning remain with me, and invite reflection on what the lens opens.',
  ].join('\n');
}

function ThreadLensExplorer({
  flow,
}: {
  flow: FacetFlow;
}) {
  const router = useRouter();
  const presence = useMaiaPresence();
  const [open, setOpen] = useState(false);
  const [lens, setLens] = useState<LensId | null>(null);
  const [evidence, setEvidence] = useState<FlowEvidence | null>(null);
  const [message, setMessage] = useState('');
  const [loadingEvidence, setLoadingEvidence] = useState(false);
  const [failed, setFailed] = useState(false);

  const selected = useMemo(() => LENSES.find((item) => item.id === lens) ?? null, [lens]);

  async function chooseLens(next: LensId) {
    setLens(next);
    setFailed(false);
    setLoadingEvidence(true);
    try {
      const response = await apiFetch(
        '/api/house/facet-flow-evidence?flowId=' + encodeURIComponent(flow.id),
      );
      if (!response.ok) throw new Error('flow evidence unavailable');
      const data = await response.json();
      const nextEvidence = data?.evidence as FlowEvidence | undefined;
      if (!nextEvidence?.source || !nextEvidence?.target) {
        throw new Error('flow evidence incomplete');
      }
      setEvidence(nextEvidence);
      setMessage(buildLensPrompt(nextEvidence, next));
    } catch {
      setEvidence(null);
      setMessage('');
      setFailed(true);
    } finally {
      setLoadingEvidence(false);
    }
  }

  function explore() {
    const prompt = message.trim();
    if (!prompt || !evidence || !lens) return;

    if (presence?.canHost) {
      presence.openMaiaWith(prompt);
      return;
    }

    seedMaiaPrompt({
      prompt,
      source: 'living-field:facet-flow',
      sourceLabel: selected ? selected.label + ' lens' : 'Life thread',
      returnTo: '/maia/living-field',
      contextId: evidence.flowId,
      tone: 'exploratory',
    });
    router.push('/maia');
    router.refresh();
  }

  if (!flow.source || !flow.target) return null;

  return (
    <div className="mt-4 border-t border-stone-900 pt-3">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-[11px] text-stone-600 transition-colors hover:text-stone-400"
        >
          Explore this thread →
        </button>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-stone-600">
              Look through a lens
            </p>
            <p className="mt-1 max-w-lg text-[11px] leading-relaxed text-stone-700">
              Choose a perspective and let the same thread come into view from another angle.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2" role="group" aria-label="Choose a lens for this thread">
            {LENSES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => void chooseLens(item.id)}
                aria-pressed={lens === item.id}
                className={
                  'text-[11px] transition-colors ' +
                  (lens === item.id
                    ? 'text-amber-300'
                    : 'text-stone-600 hover:text-stone-400')
                }
              >
                {item.label}
              </button>
            ))}
          </div>

          {loadingEvidence ? (
            <p className="text-[11px] text-stone-700">Gathering only this thread’s source and target…</p>
          ) : failed ? (
            <p className="text-[11px] text-stone-600">
              This thread’s evidence failed to load. Nothing has been sent. You can try again.
            </p>
          ) : evidence && lens ? (
            <div className="space-y-3">
              <label
                htmlFor={'facet-flow-message-' + flow.id}
                className="block text-[10px] uppercase tracking-[0.18em] text-stone-600"
              >
                What MAIA will receive
              </label>
              <textarea
                id={'facet-flow-message-' + flow.id}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={10}
                className="w-full resize-y rounded-xl border border-stone-800 bg-black/20 px-4 py-3 text-xs leading-relaxed text-stone-300 outline-none focus:border-amber-800/50"
              />
              <p className="max-w-lg text-[10px] leading-relaxed text-stone-700">
                Edit or clear this first. The lens is named as a perspective, and MAIA receives
                only the evidence shown here.
              </p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <button
                  type="button"
                  onClick={explore}
                  disabled={!message.trim()}
                  className="text-xs text-amber-400/80 transition-colors hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Follow this lens →
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setLens(null);
                    setEvidence(null);
                    setMessage('');
                    setFailed(false);
                  }}
                  className="text-[11px] text-stone-700 hover:text-stone-500"
                >
                  Close
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function LifeFacetFlowPanel() {
  const [flows, setFlows] = useState<FacetFlow[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;

    void apiFetch('/api/house/facet-flows?limit=8')
      .then(async (response) => {
        if (!response.ok) throw new Error('facet flows unavailable');
        return response.json();
      })
      .then((data) => {
        if (!live) return;
        setFlows(Array.isArray(data?.flows) ? data.flows : []);
      })
      .catch(() => {
        if (!live) return;
        setFailed(true);
      });

    return () => {
      live = false;
    };
  }, []);

  if (failed) {
    return (
      <section className="border-t border-stone-900 pt-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-stone-600">
          Threads in the journey
        </p>
        <p className="mt-2 text-xs text-stone-700">
          Threads failed to load. Nothing has been changed. You can try again.
        </p>
      </section>
    );
  }

  if (flows === null) {
    return (
      <section className="border-t border-stone-900 pt-6" aria-label="Gathering life threads">
        <p className="text-[10px] uppercase tracking-[0.2em] text-stone-600">
          Threads in the journey
        </p>
        <p className="mt-2 text-xs text-stone-700">Gathering the paths already carried forward…</p>
      </section>
    );
  }

  return (
    <section className="border-t border-stone-900 pt-6" aria-labelledby="life-facet-flow-heading">
      <div className="max-w-xl">
        <h2
          id="life-facet-flow-heading"
          className="text-[10px] uppercase tracking-[0.2em] text-stone-500"
        >
          Threads in the journey
        </h2>
        <p className="mt-2 text-sm font-light leading-relaxed text-stone-500">
          Paths carried from one part of the journey into another.
        </p>
      </div>

      {flows.length === 0 ? (
        <p className="mt-5 max-w-lg text-xs italic leading-relaxed text-stone-700">
          As something is carried from one place into another, its path can remain visible here.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {flows.map((flow) => (
            <article
              key={flow.id}
              className="rounded-xl border border-stone-900 bg-black/10 px-4 py-4"
            >
              <div className="grid items-center gap-3 sm:grid-cols-[minmax(0,1fr)_52px_minmax(0,1fr)]">
                <Endpoint endpoint={flow.source} role="source" />

                <div className="flex items-center gap-2 text-stone-700 sm:justify-center" aria-hidden="true">
                  <span className="h-px flex-1 bg-stone-800 sm:w-5 sm:flex-none" />
                  <span className="text-xs">→</span>
                  <span className="hidden h-px w-2 bg-stone-800 sm:block" />
                </div>

                <Endpoint endpoint={flow.target} role="target" />
              </div>

              <p className="mt-3 text-[10px] text-stone-700">
                You carried this path{when(flow.createdAt) ? ' · ' + when(flow.createdAt) : ''}
              </p>

              <ThreadLensExplorer flow={flow} />
            </article>
          ))}
        </div>
      )}

      <p className="mt-4 max-w-xl text-[10px] leading-relaxed text-stone-700">
        These lines record movement you explicitly made. They do not claim that the things
        are psychologically, causally, or developmentally connected.
      </p>
    </section>
  );
}
