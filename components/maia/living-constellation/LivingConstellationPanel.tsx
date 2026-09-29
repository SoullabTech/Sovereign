'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import type {
  ConstellationDomain,
  ConstellationFocus,
  ConstellationProjectionNode,
  LivingConstellationProjection,
} from '@/lib/maia/living-constellation/types';

interface Props {
  focus: ConstellationFocus;
  className?: string;
}

const FOCUS_DOMAIN: Record<ConstellationFocus, ConstellationDomain> = {
  living: 'living_field',
  vision: 'vision_studio',
  practice: 'practice_field',
};

const PERSPECTIVE = {
  living: {
    eyebrow: 'Living Field',
    title: 'See what is taking shape across your life.',
    lede: 'Some parts are being lived, some are becoming clearer, and some may be ready to develop or meet others.',
  },
  vision: {
    eyebrow: 'Vision Studio',
    title: 'Develop what wants to become more real.',
    lede: 'This work sits within your wider Living Field.',
  },
  practice: {
    eyebrow: 'Practice Field',
    title: 'Tend how your work meets other people.',
    lede: 'Your practice lives within the wider field of your life and work.',
  },
} as const;

function authorityLabel(node: ConstellationProjectionNode): string {
  if (node.authorship === 'maia_candidate') return 'suggested possibility';
  if (node.authorship === 'member_confirmed') return 'confirmed';
  if (node.authorship === 'practitioner_authored') return 'practitioner authored';
  return 'authored';
}

function privacyLabel(node: ConstellationProjectionNode): string | null {
  if (node.privacy === 'member_shared_with_practitioner') return 'shared with practitioner';
  if (node.privacy === 'practitioner_private') return 'private';
  return null;
}

function standingLine(node: ConstellationProjectionNode): string {
  const privacy = privacyLabel(node);
  return [authorityLabel(node), privacy, node.standing].filter(Boolean).join(' · ');
}

const STAGGER = [
  '',
  'md:translate-y-3',
  'md:-translate-y-2',
  'md:translate-y-4',
  'md:translate-y-1',
  'md:-translate-y-3',
  'md:translate-y-2',
  'md:translate-y-1',
  'md:-translate-y-1',
  'md:translate-y-3',
  'md:translate-y-2',
  'md:-translate-y-2',
];

function FieldPoint({
  node,
  index,
  active = false,
  quiet = false,
}: {
  node: ConstellationProjectionNode;
  index: number;
  active?: boolean;
  quiet?: boolean;
}) {
  return (
    <article
      className={[
        'relative min-w-0 max-w-sm pl-6 transition-opacity',
        STAGGER[index % STAGGER.length],
        quiet ? 'opacity-75' : 'opacity-100',
      ].join(' ')}
    >
      <span
        aria-hidden="true"
        className={[
          'absolute left-0 top-2 block h-2.5 w-2.5 rounded-full border',
          active
            ? 'border-amber-400/70 bg-amber-300/75 shadow-[0_0_0_7px_rgba(217,178,107,0.08)]'
            : 'border-amber-700/60 bg-stone-950',
        ].join(' ')}
      />
      <h3 className="font-serif text-[17px] leading-snug text-stone-200">
        {node.label}
      </h3>
      {node.excerpt && (
        <p className="mt-1.5 text-xs leading-relaxed text-stone-500">
          {node.excerpt}
        </p>
      )}
      <p className="mt-2 text-[10px] leading-relaxed text-stone-600">
        {standingLine(node)}
      </p>
    </article>
  );
}

function Pathway({
  href,
  title,
  body,
  tone = 'gold',
}: {
  href: string;
  title: string;
  body: string;
  tone?: 'gold' | 'teal';
}) {
  return (
    <Link
      href={href}
      className="group block max-w-xs border-l border-stone-800 pl-4"
    >
      <span
        className={
          tone === 'teal'
            ? 'text-sm text-teal-300/85 group-hover:text-teal-200'
            : 'text-sm text-amber-300/90 group-hover:text-amber-200'
        }
      >
        {title} →
      </span>
      <span className="mt-1.5 block text-[11px] leading-relaxed text-stone-600">
        {body}
      </span>
    </Link>
  );
}

function FieldHorizon({ wide = false }: { wide?: boolean }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className={[
          'absolute rounded-[50%] border border-stone-900/90 transition-all duration-700',
          wide ? '-inset-x-[22%] top-4 bottom-0' : '-inset-x-[6%] top-16 bottom-8',
        ].join(' ')}
      />
      <div
        className={[
          'absolute rounded-[50%] border border-stone-900/70 transition-all duration-700',
          wide ? '-inset-x-[7%] top-20 bottom-12' : 'inset-x-[9%] top-28 bottom-16',
        ].join(' ')}
      />
      <div
        className={[
          'absolute rounded-[50%] border border-stone-900/60 transition-all duration-700',
          wide ? 'inset-x-[10%] top-36 bottom-24' : 'inset-x-[24%] top-40 bottom-28',
        ].join(' ')}
      />
    </div>
  );
}

export function LivingConstellationPanel({ focus, className = '' }: Props) {
  const [projection, setProjection] = useState<LivingConstellationProjection | null>(null);
  const [failed, setFailed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    apiFetch('/api/maia/living-constellation')
      .then(async (response) => {
        if (!response.ok) throw new Error('projection unavailable');
        return response.json();
      })
      .then((data) => {
        if (!cancelled) setProjection(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const grouped = useMemo(() => {
    const empty: Record<ConstellationDomain, ConstellationProjectionNode[]> = {
      living_field: [],
      vision_studio: [],
      practice_field: [],
    };
    for (const node of projection?.nodes ?? []) empty[node.domain].push(node);
    return empty;
  }, [projection]);

  if (failed) {
    return (
      <div className={`py-3 ${className}`}>
        <p className="text-sm text-stone-500">
          The wider field can be revisited in a moment.
        </p>
      </div>
    );
  }

  if (!projection) {
    return (
      <div className={`py-5 ${className}`}>
        <p className="text-sm text-stone-600">Gathering the wider field…</p>
      </div>
    );
  }

  const perspective = PERSPECTIVE[focus];
  const focusedDomain = FOCUS_DOMAIN[focus];
  const localNodes = grouped[focusedDomain];

  const visibleLivingNodes =
    focus === 'living'
      ? expanded
        ? grouped.living_field
        : grouped.living_field.slice(0, 3)
      : [];

  const adjacent =
    focus === 'vision'
      ? {
          visible: grouped.practice_field.length > 0,
          href: '/maia/vision-studio?tab=practice',
          title: 'See how this meets others',
          body: 'Practice Field is available as another direction — not a claim that these threads are already linked.',
          tone: 'teal' as const,
        }
      : focus === 'practice'
        ? {
            visible: grouped.vision_studio.length > 0,
            href: '/maia/vision-studio?tab=vision',
            title: 'Develop the work further',
            body: 'Vision Studio is available as another direction when something here wants more form.',
            tone: 'gold' as const,
          }
        : null;

  const fieldIsWide = focus === 'living' && expanded;

  return (
    <section
      className={[
        'relative isolate overflow-hidden py-2 text-stone-100',
        'min-h-[560px] md:min-h-[640px]',
        className,
      ].join(' ')}
    >
      <FieldHorizon wide={fieldIsWide} />

      <div className="relative z-10 max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.18em] text-stone-600">
          {perspective.eyebrow}
        </p>
        <h2 className="mt-2 max-w-2xl font-serif text-3xl font-normal leading-tight text-stone-100 md:text-4xl">
          {perspective.title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-400 md:text-base">
          {perspective.lede}
        </p>

        {fieldIsWide && (
          <p className="mt-4 text-sm text-stone-500">
            The view widens; the field itself changes scale.
          </p>
        )}

        {projection.partial && (
          <p className="mt-4 text-xs text-amber-700/90">
            This view is showing the parts currently within reach.
          </p>
        )}
      </div>

      <div className="relative z-10 mt-12 flex items-center gap-2 text-xs text-stone-600">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-600/70" aria-hidden="true" />
        <span>
          {focus === 'living'
            ? fieldIsWide
              ? 'You are here · wider view'
              : 'You are here'
            : `${perspective.eyebrow} · current perspective`}
        </span>
      </div>

      {focus === 'living' ? (
        <div className="relative z-10 mt-12">
          <div className="grid grid-cols-1 gap-x-16 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
            {visibleLivingNodes.map((node, index) => (
              <FieldPoint
                key={node.projectionId}
                node={node}
                index={index}
                active={index === 0}
                quiet={expanded && index >= 4}
              />
            ))}
          </div>

          {visibleLivingNodes.length === 0 && (
            <p className="max-w-md text-sm leading-7 text-stone-600">
              This field is ready for whatever begins to matter here.
            </p>
          )}

          <div className="mt-14 grid gap-8 md:grid-cols-2">
            <Pathway
              href="/maia/vision-studio?tab=vision"
              title="Develop something"
              body="Give an emerging idea or body of work more form."
            />
            <Pathway
              href="/maia/vision-studio?tab=practice"
              title="Meet others through your work"
              body="Tend how what you do enters relationship with other people."
              tone="teal"
            />
          </div>

          <div className="mt-14 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="rounded-full border border-amber-800/50 px-4 py-2 text-xs text-amber-300/90 transition hover:border-amber-700 hover:text-amber-200"
            >
              {expanded ? 'Return to quiet view' : 'See the wider field'}
            </button>
          </div>
        </div>
      ) : (
        <div className="relative z-10 mt-12">
          <div className="grid grid-cols-1 gap-x-16 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
            {localNodes.map((node, index) => (
              <FieldPoint
                key={node.projectionId}
                node={node}
                index={index}
                active={index === 0}
              />
            ))}
          </div>

          {localNodes.length === 0 && (
            <p className="max-w-md text-sm leading-7 text-stone-600">
              This area is available when something wants to take shape here.
            </p>
          )}

          {adjacent?.visible && (
            <div className="mt-14">
              <Pathway
                href={adjacent.href}
                title={adjacent.title}
                body={adjacent.body}
                tone={adjacent.tone}
              />
            </div>
          )}

          <div className="mt-14 flex flex-wrap gap-3">
            <Link
              href="/maia/living-field"
              className="rounded-full border border-amber-800/50 px-4 py-2 text-xs text-amber-300/90 transition hover:border-amber-700 hover:text-amber-200"
            >
              Widen to Living Field
            </Link>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="rounded-full border border-stone-800 px-4 py-2 text-xs text-stone-500 transition hover:border-stone-700 hover:text-stone-300"
            >
              Return to where you were
            </button>
          </div>
        </div>
      )}

      <p className="relative z-10 mt-16 max-w-2xl border-t border-stone-900 pt-4 text-[10px] leading-relaxed text-stone-700">
        These points show where something currently lives in Soullab. They do not claim
        that the things themselves are psychologically or semantically connected.
      </p>
    </section>
  );
}
