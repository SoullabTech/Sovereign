'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { flushSync } from 'react-dom';
import { apiFetch } from '@/lib/http/apiBase';
import { SoulServiceAperturePilot } from './SoulServiceAperturePilot';
import type {
  ConstellationDomain,
  ConstellationFocus,
  ConstellationProjectionNode,
  LivingConstellationProjection,
} from '@/lib/maia/living-constellation/types';

interface Props {
  focus: ConstellationFocus;
  className?: string;
  enableSoulServiceAperturePilot?: boolean;
  projectionOverrideForWitness?: LivingConstellationProjection | null;
}

interface ReturnContinuitySnapshot {
  expanded: boolean;
  scrollY: number;
  openerId: string;
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> };
};

function transitionNameForPresence(node: ConstellationProjectionNode): string {
  return `living-presence-${node.projectionId.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
}

function transitionStyleForPresence(node: ConstellationProjectionNode): CSSProperties {
  return { viewTransitionName: transitionNameForPresence(node) } as CSSProperties;
}

function openerIdForPresence(node: ConstellationProjectionNode): string {
  return `living-presence-opener-${node.projectionId}`;
}

function runContinuityTransition(update: () => void): Promise<void> {
  if (typeof document === 'undefined') {
    update();
    return Promise.resolve();
  }

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const documentWithTransitions = document as ViewTransitionDocument;
  if (reducedMotion || !documentWithTransitions.startViewTransition) {
    flushSync(update);
    return Promise.resolve();
  }

  const transition = documentWithTransitions.startViewTransition(() => {
    flushSync(update);
  });

  return transition.finished.catch(() => undefined);
}

const FOCUS_DOMAIN: Record<ConstellationFocus, ConstellationDomain> = {
  living: 'living_field',
  vision: 'vision_studio',
  practice: 'practice_field',
};

const PERSPECTIVE = {
  living: {
    eyebrow: 'Living Field',
    title: 'What is here with you?',
    lede: '',
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

function presenceFragment(node: ConstellationProjectionNode): string {
  const text = node.excerpt?.trim();
  if (!text) return node.label;

  const firstSentence = text.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() ?? text;
  if (firstSentence.length <= 108) return firstSentence;
  return `${firstSentence.slice(0, 105).trimEnd()}…`;
}

function PresenceTeaser({
  node,
  onOpen,
  continuation = false,
}: {
  node: ConstellationProjectionNode;
  onOpen: () => void;
  continuation?: boolean;
}) {
  return (
    <button
      id={openerIdForPresence(node)}
      type="button"
      onClick={onOpen}
      style={transitionStyleForPresence(node)}
      className={[
        'group relative block min-w-0 text-left transition',
        continuation ? 'max-w-2xl py-5' : 'max-w-md py-4',
      ].join(' ')}
      aria-label={`Open ${node.label}`}
    >
      <span className="block text-[10px] uppercase tracking-[0.14em] text-[#9a8972]">
        {continuation ? 'Continue' : node.label}
      </span>
      <span
        className={[
          'mt-2 block font-serif leading-snug text-[#443a31] transition group-hover:text-[#72512d]',
          continuation ? 'text-2xl md:text-[28px]' : 'text-[19px] md:text-[21px]',
        ].join(' ')}
      >
        {presenceFragment(node)}
      </span>
      {continuation && (
        <span className="mt-2 block text-[11px] text-[#9a8972]">
          {node.label} · {recencyLabel(node)}
        </span>
      )}
    </button>
  );
}

function EnteredPresence({
  node,
  onReturn,
  enableSoulServiceAperturePilot = false,
}: {
  node: ConstellationProjectionNode;
  onReturn: () => void;
  enableSoulServiceAperturePilot?: boolean;
}) {
  return (
    <div
      className="relative z-10 mx-auto max-w-3xl py-8 md:py-14"
      style={transitionStyleForPresence(node)}
    >
      <button
        type="button"
        onClick={onReturn}
        className="text-sm text-[#806844] underline decoration-[#c3ad8b] underline-offset-4"
      >
        ← Living Field
      </button>

      <div className="mt-12">
        <p className="text-[11px] uppercase tracking-[0.17em] text-[#9a8972]">
          {node.label}
        </p>
        {node.excerpt ? (
          <p className="mt-4 font-serif text-3xl leading-[1.45] text-[#40372f] md:text-[40px]">
            {node.excerpt}
          </p>
        ) : (
          <p className="mt-4 font-serif text-3xl leading-[1.45] text-[#40372f]">
            {node.label}
          </p>
        )}
      </div>

      {enableSoulServiceAperturePilot && (
        <SoulServiceAperturePilot source={node.excerpt?.trim() || node.label} />
      )}

      <details className="mt-12 max-w-xl border-t border-[#c9b99f]/40 pt-4 text-sm text-[#7d6d59]">
        <summary className="cursor-pointer list-none text-[#7a5c34]">
          Why this is here
        </summary>
        <div className="mt-4 space-y-2 text-[12px] leading-6">
          <p>{standingLine(node)}</p>
          <p>{recencyLabel(node)}</p>
          <p>
            This is material already admitted to your Living Field. Its appearance here does not add new meaning or authority.
          </p>
        </div>
      </details>
    </div>
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

export function LivingConstellationPanel({
  focus,
  className = '',
  enableSoulServiceAperturePilot = false,
  projectionOverrideForWitness = null,
}: Props) {
  const [projection, setProjection] = useState<LivingConstellationProjection | null>(
    projectionOverrideForWitness,
  );
  const [failed, setFailed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [selectedPresenceId, setSelectedPresenceId] = useState<string | null>(null);
  const [returnSnapshot, setReturnSnapshot] = useState<ReturnContinuitySnapshot | null>(null);

  useEffect(() => {
    if (projectionOverrideForWitness) {
      setProjection(projectionOverrideForWitness);
      return;
    }

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
  }, [projectionOverrideForWitness]);

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
  const latestLiving =
    livingByRecency.length > 0 && nodeTimestamp(livingByRecency[0]) > 0
      ? livingByRecency[0]
      : null;
  const otherLiving = grouped.living_field
    .filter((node) => node.projectionId !== latestLiving?.projectionId)
    .sort((a, b) => a.label.localeCompare(b.label));
  const quietLiving = otherLiving.slice(0, latestLiving ? 3 : 4);
  const widenedLiving = [...(latestLiving ? [latestLiving] : []), ...otherLiving];
  const selectedPresence =
    grouped.living_field.find((node) => node.projectionId === selectedPresenceId) ?? null;

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

  const openPresence = (node: ConstellationProjectionNode) => {
    const snapshot: ReturnContinuitySnapshot = {
      expanded,
      scrollY: typeof window === 'undefined' ? 0 : window.scrollY,
      openerId: openerIdForPresence(node),
    };
    setReturnSnapshot(snapshot);
    void runContinuityTransition(() => setSelectedPresenceId(node.projectionId));
  };

  const returnFromPresence = () => {
    const snapshot = returnSnapshot;
    void runContinuityTransition(() => {
      setSelectedPresenceId(null);
      if (snapshot) setExpanded(snapshot.expanded);
      setReturnSnapshot(null);
    }).then(() => {
      if (!snapshot || typeof window === 'undefined') return;
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: snapshot.scrollY, behavior: 'auto' });
        const opener = document.getElementById(snapshot.openerId);
        if (opener instanceof HTMLButtonElement) {
          opener.focus({ preventScroll: true });
        }
      });
    });
  };

  if (isLiving && selectedPresence) {
    return (
      <section
        className={[
          'relative isolate min-h-[560px] overflow-hidden rounded-[40px] bg-[#f5eee3] px-6 py-8 text-[#433a31] sm:px-8 sm:py-10 md:min-h-[620px]',
          className,
        ].join(' ')}
      >
        <AmbientLifeField wide={false} />
        <EnteredPresence
          node={selectedPresence}
          onReturn={returnFromPresence}
          enableSoulServiceAperturePilot={enableSoulServiceAperturePilot}
        />
      </section>
    );
  }

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
        {!isLiving && (
          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-400 md:text-base">
            {perspective.lede}
          </p>
        )}
        {projection.partial && (
          <p className={isLiving ? 'mt-3 text-xs text-[#8c6f43]' : 'mt-4 text-xs text-amber-700/90'}>
            This view is showing only the parts currently within reach.
          </p>
        )}
      </div>

      {isLiving ? (
        <div className="relative z-10 mt-10">
          {!expanded ? (
            <>
              {latestLiving && (
                <PresenceTeaser
                  node={latestLiving}
                  continuation
                  onOpen={() => openPresence(latestLiving)}
                />
              )}

              <div className="mt-8 flex flex-wrap gap-x-16 gap-y-8 md:mt-10">
                {quietLiving.map((node) => (
                  <PresenceTeaser
                    key={node.projectionId}
                    node={node}
                    onOpen={() => openPresence(node)}
                  />
                ))}
              </div>

              {grouped.living_field.length === 0 && (
                <p className="max-w-lg font-serif text-2xl leading-relaxed text-[#5f5143]">
                  Nothing needs to be here yet.
                </p>
              )}

              {grouped.living_field.length > quietLiving.length + (latestLiving ? 1 : 0) && (
                <button
                  type="button"
                  onClick={() => setExpanded(true)}
                  className="mt-12 text-sm text-[#7d5a2d] underline decoration-[#c3ad8b] underline-offset-4 transition hover:text-[#67471f]"
                >
                  See more of my life →
                </button>
              )}
            </>
          ) : (
            <>
              <div className="flex flex-wrap gap-x-16 gap-y-9">
                {widenedLiving.map((node) => (
                  <PresenceTeaser
                    key={node.projectionId}
                    node={node}
                    onOpen={() => openPresence(node)}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="mt-12 text-sm text-[#7d5a2d] underline decoration-[#c3ad8b] underline-offset-4 transition hover:text-[#67471f]"
              >
                ← Quieter view
              </button>
            </>
          )}

          <details className="mt-14 max-w-xl border-t border-[#cabaa1]/35 pt-4 text-[12px] leading-6 text-[#8a7965]">
            <summary className="cursor-pointer list-none text-[#7d684d]">
              About this view
            </summary>
            <div className="mt-3 space-y-2">
              {latestLiving ? (
                <p>The first presence is offered only because it was updated most recently.</p>
              ) : (
                <p>No presence is being treated as more important than another.</p>
              )}
              <p>The remaining presences are shown alphabetically when the view is widened.</p>
              <p>They do not claim hidden importance, causation, psychological connection, or a complete picture of your life.</p>
            </div>
          </details>
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

          <p className="mt-16 max-w-2xl border-t border-stone-900 pt-4 text-[10px] leading-relaxed text-stone-700">
            These presentations do not claim psychological or semantic relationship between the material shown.
          </p>
        </div>
      )}
    </section>
  );
}
