'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

type FlowFacet = 'journal' | 'reflections' | 'changes' | 'decisions';

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

const FACET_LABEL: Record<FlowFacet, string> = {
  journal: 'Journal',
  reflections: 'Reflections',
  changes: 'Change',
  decisions: 'Decision',
};

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
        <p className="mt-1 text-xs italic text-stone-700">No longer available.</p>
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
          Threads across your life
        </p>
        <p className="mt-2 text-xs text-stone-700">
          These paths are quiet right now. Nothing has been changed.
        </p>
      </section>
    );
  }

  if (flows === null) {
    return (
      <section className="border-t border-stone-900 pt-6" aria-label="Gathering life threads">
        <p className="text-[10px] uppercase tracking-[0.2em] text-stone-600">
          Threads across your life
        </p>
        <p className="mt-2 text-xs text-stone-700">Gathering the paths you chose to make…</p>
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
          Threads across your life
        </h2>
        <p className="mt-2 text-sm font-light leading-relaxed text-stone-500">
          Paths you chose to carry from one part of Soullab into another.
        </p>
      </div>

      {flows.length === 0 ? (
        <p className="mt-5 max-w-lg text-xs italic leading-relaxed text-stone-700">
          Nothing has crossed between these facets yet. When you choose to carry something
          forward, the path can remain visible here.
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
