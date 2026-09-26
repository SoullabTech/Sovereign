'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';
import { SECTION_PARAM } from '@/lib/writersStudio/placeInWork';
import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';
import { useLivingWorks } from '../useLivingWorks';
import { useMemberIdentity } from '../useMemberIdentity';
import { currentWork, resolveWorkContext } from '../workContext';
import { DevelopRoom, STRUCTURE_DEVELOP_CAPABILITIES, type LensId } from '../flagship/DevelopReview';
import { StudioShell, type MemberIdentity, type ProjectIdentity } from '../flagship/StudioChrome';
import type { NavActions } from '../flagship/flagshipTokens';
import { factsOnlyDevelopOverview } from './liveDevelopOverview';

interface ContextReady {
  state: 'section_aware';
  manuscriptId: string;
  title: string | null;
  version: number;
  updatedAt: string;
  sections: RebuildSection[];
}
type ContextPayload = ContextReady | { state: 'no_draft' | 'continuous'; manuscriptId: string; title: string | null };
type Phase = 'loading' | 'ready' | 'unauthorized' | 'unavailable';

function memberForShell(identity: ReturnType<typeof useMemberIdentity>): MemberIdentity | undefined {
  if (identity.phase !== 'ready' || !identity.name?.trim()) return undefined;
  const name = identity.name.trim();
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '').join('');
  return { name, initials: initials || name.slice(0, 2).toUpperCase() };
}

export default function FlagshipDevelopHost() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const manuscriptId = params?.get('m') ?? null;
  const sectionId = params?.get(SECTION_PARAM) ?? null;
  const requestedLens = params?.get('lens') ?? 'overview';
  const lens: LensId | 'overview' = requestedLens === 'structure' ? 'structure' : 'overview';
  const [phase, setPhase] = useState<Phase>('loading');
  const [context, setContext] = useState<ContextReady | null>(null);
  const { phase: worksPhase, works } = useLivingWorks();
  const identity = useMemberIdentity();

  useEffect(() => {
    let cancelled = false;
    if (!manuscriptId) {
      setContext(null);
      setPhase('unavailable');
      return () => { cancelled = true; };
    }
    setPhase('loading');
    void (async () => {
      try {
        const res = await apiFetch(
          `/api/writers-studio/rebuild/context?manuscriptId=${encodeURIComponent(manuscriptId)}`,
          { method: 'GET' },
        );
        if (cancelled) return;
        if (res.status === 401) { setPhase('unauthorized'); return; }
        if (!res.ok) { setPhase('unavailable'); return; }
        const body = await res.json() as ContextPayload;
        if (cancelled) return;
        if (body.state !== 'section_aware' || !Array.isArray(body.sections)) {
          setPhase('unavailable');
          return;
        }
        setContext(body);
        setPhase('ready');
      } catch {
        if (!cancelled) setPhase('unavailable');
      }
    })();
    return () => { cancelled = true; };
  }, [manuscriptId]);

  const workContext = resolveWorkContext(worksPhase, works, context?.manuscriptId ?? manuscriptId);
  const work = currentWork(workContext);
  const member = useMemo(() => memberForShell(identity), [identity]);

  if (phase !== 'ready' || !context) {
    return (
      <main className="fs-tokens fsw-state" data-develop-phase={phase}>
        {phase === 'loading' && 'Opening Develop…'}
        {phase === 'unauthorized' && 'Sign in to open Develop.'}
        {phase === 'unavailable' && 'Develop cannot open this Work here yet. Nothing about your Work has changed.'}
      </main>
    );
  }

  const view = factsOnlyDevelopOverview({
    manuscriptTitle: context.title,
    workTitle: work?.title ?? null,
    workForm: work?.form ?? null,
    sections: context.sections,
  });

  const writeParams = new URLSearchParams({ m: context.manuscriptId });
  if (sectionId && context.sections.some((section) => section.draftSectionId === sectionId)) {
    writeParams.set(SECTION_PARAM, sectionId);
  }
  const writeHref = `/writers-studio/rebuild?${writeParams.toString()}`;
  const nav: NavActions = {
    write: { kind: 'link', href: writeHref },
  };
  const project: ProjectIdentity | undefined = view.work === 'This work'
    ? undefined
    : { workTitle: view.work, ...(work?.form ? { workKind: work.form } : {}) };
  const onLens = (nextLens: LensId | 'overview') => {
    if (nextLens !== 'overview' && nextLens !== 'structure') return;
    const next = new URLSearchParams(params?.toString() ?? '');
    if (nextLens === 'overview') next.delete('lens');
    else next.set('lens', nextLens);
    const q = next.toString();
    router.push(`${pathname ?? '/writers-studio/develop'}${q ? `?${q}` : ''}`);
  };
  const structureNavigation = {
    hrefFor: (targetSectionId: string) => {
      const target = new URLSearchParams({ m: context.manuscriptId, [SECTION_PARAM]: targetSectionId });
      return `/writers-studio/rebuild?${target.toString()}`;
    },
    onGo: (_targetSectionId: string, href: string) => router.push(href),
  };

  return (
    <StudioShell
      current="develop"
      destinations={['write', 'develop', 'review']}
      affordance="orientation"
      nav={nav}
      project={project}
      member={member}
    >
      <DevelopRoom
        view={view}
        lens={lens}
        capabilities={STRUCTURE_DEVELOP_CAPABILITIES}
        onLens={onLens}
        structureNavigation={structureNavigation}
      />
    </StudioShell>
  );
}
