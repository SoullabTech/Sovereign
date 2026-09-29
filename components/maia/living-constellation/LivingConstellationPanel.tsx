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
    title: 'What feels close to hand right now?',
    lede: 'A few places you have already given words to are here. Nothing shown first is being treated as more important than the rest of your life.',
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
  if (node.authorship === 'maia_candidate') return 'MAIA noticed this — not yet yours';
  if (node.authorship === 'member_confirmed') return 'you confirmed this';
  if (node.authorship === 'practitioner_authored') return 'you authored this for your practice';
  return 'your words';
}

function privacyLabel(node: ConstellationProjectionNode): string | null {
  if (node.privacy === 'member_shared_with_practitioner') return 'shared with your practitioner';
  if (node.privacy === 'practitioner_private') return 'private';
  return null;
}

function standingLabel(standing: string): string {
  if (standing === 'active') return 'currently held here';
  if (standing === 'candidate') return 'not yet confirmed';
  if (standing === 'contained') return 'contained';
  if (standing === 'carried') return 'carried forward';
  if (standing.startsWith('carried:')) return 'carried forward';
  return standing.replace(/_/g, ' ');
}

function standingLine(node: ConstellationProjectionNode): string {
  const privacy = privacyLabel(node);
  return [authorityLabel(node), privacy, standingLabel(node.standing)]
    .filter(Boolean)
    .join(' · ');
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

function LivingPresence({
  node,
  index,
  quiet = false,
}: {
  node: ConstellationProjectionNode;
  index: number;
  quiet?: boolean;
}) {
  const memberLanguage = node.excerpt?.trim();

  return (
    <article
      className={[
        'relative min-w-0 px-2 py-4 transition-opacity',
        STAGGER[index % STAGGER.length],
        quiet ? 'opacity-[0.78]' : 'opacity-100',
      ].join(' ')}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-4 -inset-y-3 -z-10 rounded-[45%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.48),rgba(255,255,255,0.13)_48%,transparent_74%)] blur-xl"
      />

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-serif text-sm text-[#735f47]">{node.label}</span>
        <span className="text-[10px] uppercase tracking-[0.13em] text-[#9b8a73]">
          {recencyLabel(node)}
        </span>
      </div>

      {memberLanguage ? (
        <p className="mt-3 max-w-[34rem] font-serif text-[20px] leading-[1.55] text-[#443a31] md:text-[22px]">
          {memberLanguage}
        </p>
      ) : (
        <p className="mt-3 max-w-[32rem] text-[15px] leading-7 text-[#6f6254]">
          This part of your Living Field is here when you want to return to it.
        </p>
      )}

      <p className="mt-3 text-[11px] leading-relaxed text-[#8f7d66]">
        {standingLine(node)}
      </p>
    </article>
  );
}

function PerspectivePresence({
  node,
  index,
}: {
  node: ConstellationProjectionNode;
  index: number;
}) {
  return (
    <article
      className={['relative min-w-0 px-2 py-4', STAGGER[index % STAGGER.length]].join(' ')}
    >
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

function AmbientLifeField({ wide }: { wide: boolean }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(251,247,240,0.98),rgba(242,234,222,0.96))]" />
      <div
        className={[
          'absolute rounded-full bg-[radial-gradient(circle,rgba(214,183,132,0.25),rgba(214,183,132,0.08)_42%,transparent_72%)] blur-3xl transition-all duration-700',
          wide
            ? '-left-[20%] top-[2%] h-[74%] w-[74%]'
            : '-left-[12%] top-[8%] h-[58%] w-[58%]',
        ].join(' ')}
      />
      <div
        className={[
          'absolute rounded-full bg-[radial-gradient(circle,rgba(127,166,154,0.20),rgba(127,166,154,0.06)_44%,transparent_72%)] blur-3xl transition-all duration-700',
          wide
            ? 'right-[-18%] top-[12%] h-[70%] w-[70%]'
            : 'right-[-10%] top-[22%] h-[54%] w-[54%]',
        ].join(' ')}
      />
      <div
        className={[
          'absolute rounded-full bg-[radial-gradient(circle,rgba(186,148,130,0.18),rgba(186,148,130,0.05)_45%,transparent_72%)] blur-3xl transition-all duration-700',
          wide
            ? 'bottom-[-30%] left-[10%] h-[76%] w-[76%]'
            : 'bottom-[-22%] left-[22%] h-[58%] w-[58%]',
        ].join(' ')}
      />
      <div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(rgba(111,93,72,0.22)_0.6px,transparent_0.6px)] [background-size:18px_18px]" />
    </div>
  );
}

function FieldHorizon() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -inset-x-[6%] top-16 bottom-8 rounded-[50%] border border-stone-900/90" />
      <div className="absolute inset-x-[9%] top-28 bottom-16 rounded-[50%] border border-stone-900/70" />
      <div className="absolute inset-x-[24%] top-40 bottom-28 rounded-[50%] border border-stone-900/60" />
    </div>
  );
}

function nodeTimestamp(node: ConstellationProjectionNode): number {
  const value = node.updatedAt ?? node.createdAt;
  if (!value) return 0;
  const stamp = new Date(value).getTime();
  return Number.isFinite(stamp) ? stamp : 0;
}

function recencyLabel(node: ConstellationProjectionNode): string {
  const value = node.updatedAt ?? node.createdAt;
  if (!value) return 'already in your Living Field';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'already in your Living Field';
  return `last updated · ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
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
        <p className="text-sm text-[#847563]">
          The wider field can be revisited in a moment.
        </p>
      </div>
    );
  }

  if (!projection) {
    return (
      <div className={`py-5 ${className}`}>
        <p className="text-sm text-[#8f806c]">Gathering the wider field…</p>
      </div>
    );
  }

  const perspective = PERSPECTIVE[focus];
  const focusedDomain = FOCUS_DOMAIN[focus];
  const localNodes = grouped[focusedDomain];

  const livingByRecency = [...grouped.living_field].sort(
    (a, b) => nodeTimestamp(b) - nodeTimestamp(a),
  );

  const visibleLivingNodes =
    focus === 'living'
      ? expanded
        ? livingByRecency
        : livingByRecency.slice(0, 4)
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

  const isLiving = focus === 'living';
  const fieldIsWide = isLiving && expanded;
  const hasDatedLivingMaterial = livingByRecency.some((node) => nodeTimestamp(node) > 0);
  const livingSelectionCopy = expanded
    ? hasDatedLivingMaterial
      ? 'Wider view · more of what is already in your Living Field, ordered by last update. That order is not a judgment of importance.'
      : 'Wider view · more of what is already in your Living Field. This is a partial presentation, not a ranking of your life.'
    : hasDatedLivingMaterial
      ? 'A partial view, ordered by when these expressions were last updated. That order is not a judgment of importance.'
      : 'A partial view of what is already here. What appears first is not being ranked as more important.';

  return (
    <section
      className={[
        isLiving
          ? 'relative isolate overflow-hidden rounded-[40px] bg-[#f5eee3] px-6 py-8 text-[#433a31] sm:px-8 sm:py-10'
          : 'relative isolate overflow-hidden py-2 text-stone-100',
        'min-h-[560px] md:min-h-[620px]',
        className,
      ].join(' ')}
    >
      {isLiving ? <AmbientLifeField wide={fieldIsWide} /> : <FieldHorizon />}

      <div className="relative z-10 max-w-3xl">
        <p
          className={
            isLiving
              ? 'text-[11px] uppercase tracking-[0.18em] text-[#8f806c]'
              : 'text-[11px] uppercase tracking-[0.18em] text-stone-600'
          }
        >
          {perspective.eyebrow}
        </p>
        <h2
          className={
            isLiving
              ? 'mt-2 max-w-2xl font-serif text-3xl font-normal leading-tight text-[#40372f] md:text-4xl'
              : 'mt-2 max-w-2xl font-serif text-3xl font-normal leading-tight text-stone-100 md:text-4xl'
          }
        >
          {perspective.title}
        </h2>
        <p
          className={
            isLiving
              ? 'mt-3 max-w-2xl text-sm leading-7 text-[#6e6255] md:text-base'
              : 'mt-3 max-w-2xl text-sm leading-7 text-stone-400 md:text-base'
          }
        >
          {perspective.lede}
        </p>

        {fieldIsWide && (
          <p className="mt-4 text-sm text-[#847563]">
            More of your life comes into view without making what was already here less true.
          </p>
        )}

        {projection.partial && (
          <p className="mt-4 text-xs text-amber-700/90">
            This view is showing the parts currently within reach.
          </p>
        )}
      </div>

      <div className="relative z-10 mt-7 max-w-2xl">
        <p
          className={
            isLiving
              ? 'text-[12px] leading-6 text-[#817260]'
              : 'text-xs leading-6 text-stone-600'
          }
        >
          {isLiving
            ? livingSelectionCopy
            : `${perspective.eyebrow} · current perspective`}
        </p>
      </div>

      {focus === 'living' ? (
        <div className="relative z-10 mt-12">
          <div className="grid grid-cols-1 gap-x-20 gap-y-14 md:grid-cols-2">
            {visibleLivingNodes.map((node, index) => (
              <LivingPresence
                key={node.projectionId}
                node={node}
                index={index}
                quiet={expanded && index >= 4}
              />
            ))}
          </div>

          {visibleLivingNodes.length === 0 && (
            <p className="max-w-md text-sm leading-7 text-[#8f806c]">
              This field is ready for whatever begins to matter here.
            </p>
          )}

          {!expanded ? (
            <div className="mt-12 flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <span className="text-sm text-[#6e6255]">Looking for something else?</span>
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="text-sm text-[#8b6128] underline decoration-[#c3a77b] underline-offset-4 transition hover:text-[#6f4b1e]"
              >
                See more of my life →
              </button>
            </div>
          ) : (
            <div className="mt-12">
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="rounded-full border border-[#b69a70]/55 bg-white/25 px-4 py-2 text-xs text-[#795b34] transition hover:bg-white/45"
              >
                Return to a quieter view
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="relative z-10 mt-12">
          <div className="grid grid-cols-1 gap-x-16 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
            {localNodes.map((node, index) => (
              <PerspectivePresence
                key={node.projectionId}
                node={node}
                index={index}
              />
            ))}
          </div>

          {localNodes.length === 0 && (
            <p className="max-w-md text-sm leading-7 text-[#8f806c]">
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

      <p
        className={
          isLiving
            ? 'relative z-10 mt-16 max-w-2xl border-t border-[#c3b39a]/35 pt-4 text-[10px] leading-relaxed text-[#9b8a73]'
            : 'relative z-10 mt-16 max-w-2xl border-t border-stone-900 pt-4 text-[10px] leading-relaxed text-stone-700'
        }
      >
        These are presentations of material already in your wider field. They do not claim hidden importance, causation, psychological connection, or a complete picture of your life.
      </p>
    </section>
  );
}
