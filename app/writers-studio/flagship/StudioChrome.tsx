/**
 * FLAGSHIP STUDIO — SHELL, RAIL, ATMOSPHERE, MOBILE NAVIGATION
 *
 * ⭐ One Soullab Studio shell. Write · Develop · Review are member-facing modes
 * inside it, ⛔ not three products.
 *
 * ⭐ Every component here is a PURE FUNCTION OF ITS PROPS — no hooks, no fetch,
 * no state. That is what lets the visual witness render each acceptance state
 * deterministically, and what lets V9/F13 assert over real rendered output
 * rather than over a mockup.
 */

import * as React from 'react';
import {
  FACET_COPY, MOBILE_PRIMARY, NAV_DESTINATIONS, NAV_LABEL,
  type Facet, type NavDestination,
} from './flagshipTokens';

const ICON: Readonly<Record<NavDestination, string>> = {
  write: '✎', develop: '◈', review: '◉',
};

/**
 * ⭐ The facet control, quiet, beside the Work identity — ⛔ never a mode
 * selector in a settings page and ⛔ never a question about the member.
 * It names **the relationship the member wants of MAIA**, ⛔ not their level.
 */
export function FacetControl({ facet }: { facet: Facet }) {
  return (
    <button type="button" className="fs-facet" data-facet={facet}
      aria-label={`How MAIA works with you: ${FACET_COPY[facet].label}. ${FACET_COPY[facet].line}`}>
      {FACET_COPY[facet].label}<span className="fs-caret" aria-hidden="true">⌄</span>
    </button>
  );
}

/**
 * ⭐ IDENTITY ONLY — the Work's name and what it is.
 *
 * ⚠️ An earlier version carried `places: ['Chapters', 'Notes', 'Research']`.
 * ⛔ None of those has a route. It was the same defect this lane flagged in an
 * external reference, reproduced here: **a plausible label costs nothing to
 * write and reads as a promise.** The field is gone rather than emptied, so it
 * cannot quietly refill.
 */
export interface ProjectIdentity {
  readonly workTitle: string;
  /** Optional because the live substrate has no canonical Work-kind fact yet. */
  readonly workKind?: string;
}

export interface MemberIdentity {
  readonly initials: string;
  readonly name: string;
  readonly org?: string;
}

export interface StudioNavigationProps {
  readonly destinations?: readonly NavDestination[];
  readonly onNavigate?: (destination: NavDestination) => void;
  /** Controlled reference keeps button geometry; live hosts may request labels. */
  readonly inertNavigation?: 'controls' | 'labels';
}

export function StudioRail({
  current, project, member, destinations = NAV_DESTINATIONS, onNavigate,
  inertNavigation = 'controls',
}: {
  current: NavDestination; project: ProjectIdentity; member: MemberIdentity;
} & StudioNavigationProps) {
  return (
    <nav className="fs-rail" aria-label="Studio navigation">
      <div className="fs-mark" aria-hidden="true" />
      {destinations.map((d) => {
        const content = <><span className="fs-ic" aria-hidden="true">{ICON[d]}</span>{NAV_LABEL[d]}</>;
        return onNavigate || inertNavigation === 'controls' ? (
          <button key={d} type="button" className="fs-nav" data-clickable={onNavigate ? 'true' : 'false'}
            aria-current={d === current ? 'page' : undefined} data-nav={d}
            onClick={onNavigate ? () => onNavigate(d) : undefined}>{content}</button>
        ) : (
          <div key={d} className="fs-nav" data-clickable="false"
            aria-current={d === current ? 'page' : undefined} data-nav={d}>{content}</div>
        );
      })}
      <div className="fs-railsep" />
      <div className="fs-railhead">Your work</div>
      <div className="fs-railwork">
        <div className="fs-railworkname">{project.workTitle}</div>
        {project.workKind ? <div className="fs-railworkkind">{project.workKind}</div> : null}
      </div>
      <div className="fs-railfoot">
        <div className="fs-av" aria-hidden="true">{member.initials}</div>
        <div className="fs-who">{member.name}{member.org ? <small>{member.org}</small> : null}</div>
      </div>
    </nav>
  );
}

/**
 * ⭐ ATMOSPHERE — quiet environmental identity.
 * ⛔ Zero text, zero controls, zero data: `ATMOSPHERE.maxInformationElements` is
 * 0 and this component renders no children, so the law holds structurally.
 * ⭐ Recedes entirely in Focus mode via `--band`.
 */
export function AtmosphereBand() {
  return <div className="fs-band" aria-hidden="true" />;
}

/**
 * Token/root seam for a live host that needs flagship visual roles without
 * inheriting the final navigation grid. It contributes presentation only.
 */
export function FlagshipVisualRoot({ children, focus = false }: {
  children: React.ReactNode; focus?: boolean;
}) {
  return <div className="fs-theme" data-focus={focus ? 'true' : 'false'}>{children}</div>;
}

/** ⭐ Same semantic names as the rail. ⛔ Develop is never renamed to Explore. */
export function MobileNav({
  current, destinations = MOBILE_PRIMARY, onNavigate, inertNavigation = 'controls',
}: { current: NavDestination } & StudioNavigationProps) {
  const visible = MOBILE_PRIMARY.filter((d) => destinations.includes(d));
  return (
    <nav className="fs-mobilenav" aria-label="Studio navigation">
      {visible.map((d) => {
        const content = <><i aria-hidden="true">{ICON[d]}</i>{NAV_LABEL[d]}</>;
        return onNavigate || inertNavigation === 'controls' ? (
          <button key={d} type="button" className="fs-mn" data-clickable={onNavigate ? 'true' : 'false'}
            aria-current={d === current ? 'page' : undefined} data-nav={d}
            onClick={onNavigate ? () => onNavigate(d) : undefined}>{content}</button>
        ) : (
          <div key={d} className="fs-mn" data-clickable="false"
            aria-current={d === current ? 'page' : undefined} data-nav={d}>{content}</div>
        );
      })}
    </nav>
  );
}

export function StudioShell({
  current, project, member, focus = false, children,
  destinations = NAV_DESTINATIONS, onNavigate, inertNavigation = 'controls',
}: {
  current: NavDestination; project: ProjectIdentity; member: MemberIdentity;
  focus?: boolean; children: React.ReactNode;
} & StudioNavigationProps) {
  return (
    <div className="fs-root" data-focus={focus ? 'true' : 'false'} data-studio-mode={current}>
      <StudioRail current={current} project={project} member={member}
        destinations={destinations} onNavigate={onNavigate} inertNavigation={inertNavigation} />
      <div className="fs-content">
        <AtmosphereBand />
        {children}
      </div>
      <MobileNav current={current} destinations={destinations} onNavigate={onNavigate}
        inertNavigation={inertNavigation} />
    </div>
  );
}

export function CrumbBar({ work, chapter, place, saved, actions, facet }: {
  work: string; chapter?: string; place?: string; saved?: string;
  actions?: React.ReactNode; facet?: Facet;
}) {
  return (
    <div className="fs-bar">
      <div className="fs-crumb">
        <b>{work}</b>
        {facet ? <FacetControl facet={facet} /> : null}
        {chapter ? <><span className="sl" aria-hidden="true">/</span><span>{chapter}</span></> : null}
        {place ? <><span className="sl" aria-hidden="true">/</span><span className="now">{place}</span></> : null}
      </div>
      {saved ? <span className="fs-saved">{saved}</span> : null}
      <span className="fs-sp" />
      {actions}
    </div>
  );
}
