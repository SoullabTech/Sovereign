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
  type Facet, type NavActions, type NavDestination,
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
  /** e.g. "Novel · 82,400 words". ⛔ A description, ⛔ never a destination.
   *  C1B: OPTIONAL — a live host that holds no such fact omits it. */
  readonly workKind?: string;
}

/**
 * C1B · how a navigation item is rendered.
 *   'reference'   — the controlled witness: `<button data-nav>` (unchanged).
 *   'orientation' — a LIVE host with no lawful navigation action yet renders
 *                   the destination as non-interactive orientation. ⛔ A live
 *                   surface never mounts a button-shaped control that does
 *                   nothing merely because the reference draws one.
 * R1-1C · `nav` — a LIVE host supplies the lawful action behind a destination
 *   (a location as `<a href>`, or an act as `<button>`), rendered with
 *   `data-affordance="navigate"`. A destination WITHOUT an action — the current
 *   one — still renders as orientation. ⛔ Reference and orientation output are
 *   byte-identical to C1B when `nav` is absent.
 */
export type NavAffordance = 'reference' | 'orientation';

export interface MemberIdentity { readonly initials: string; readonly name: string; readonly org: string }

/**
 * C1A · ⭐ `destinations` lets a LIVE host render only the modes that genuinely
 * exist in its runtime. A temporarily smaller set is lawful; a false
 * destination is not. Default = the full approved three-mode reference, so the
 * controlled witness is unchanged. ⛔ Never a link to a legacy room.
 */
export function StudioRail({ current, project, member, destinations = NAV_DESTINATIONS, affordance = 'reference', nav }: {
  current: NavDestination; project?: ProjectIdentity; member?: MemberIdentity;
  destinations?: readonly NavDestination[]; affordance?: NavAffordance; nav?: NavActions;
}) {
  return (
    <nav className="fs-rail" aria-label="Studio navigation">
      <div className="fs-mark" aria-hidden="true" />
      {destinations.map((d) => {
        const action = affordance === 'reference' ? undefined : nav?.[d];
        if (affordance === 'reference') return (
          <button key={d} type="button" className="fs-nav"
            aria-current={d === current ? 'page' : undefined} data-nav={d}>
            <span className="fs-ic" aria-hidden="true">{ICON[d]}</span>{NAV_LABEL[d]}
          </button>
        );
        if (action && action.kind === 'link') return (
          <a key={d} className="fs-nav" data-nav={d} data-affordance="navigate" href={action.href} onClick={action.onSelect}>
            <span className="fs-ic" aria-hidden="true">{ICON[d]}</span>{NAV_LABEL[d]}
          </a>
        );
        if (action && action.kind === 'act') return (
          <button key={d} type="button" className="fs-nav" data-nav={d} data-affordance="navigate" onClick={action.onAct}>
            <span className="fs-ic" aria-hidden="true">{ICON[d]}</span>{NAV_LABEL[d]}
          </button>
        );
        return (
          <span key={d} className="fs-nav" data-nav={d} data-affordance="orientation"
            aria-current={d === current ? 'page' : undefined}>
            <span className="fs-ic" aria-hidden="true">{ICON[d]}</span>{NAV_LABEL[d]}
          </span>
        );
      })}
      {/* C1B · identity blocks render only what the host actually holds. */}
      {project ? (
        <>
          <div className="fs-railsep" />
          <div className="fs-railhead">Your work</div>
          <div className="fs-railwork">
            <div className="fs-railworkname">{project.workTitle}</div>
            {project.workKind ? <div className="fs-railworkkind">{project.workKind}</div> : null}
          </div>
        </>
      ) : null}
      {member ? (
        <div className="fs-railfoot">
          <div className="fs-av" aria-hidden="true">{member.initials}</div>
          <div className="fs-who">{member.name}<small>{member.org}</small></div>
        </div>
      ) : null}
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

/** ⭐ Same semantic names as the rail. ⛔ Develop is never renamed to Explore. */
export function MobileNav({ current, destinations = NAV_DESTINATIONS, affordance = 'reference', nav }: {
  current: NavDestination; destinations?: readonly NavDestination[]; affordance?: NavAffordance; nav?: NavActions;
}) {
  return (
    <nav className="fs-mobilenav" aria-label="Studio navigation">
      {MOBILE_PRIMARY.filter((d) => destinations.includes(d)).map((d) => {
        const action = affordance === 'reference' ? undefined : nav?.[d];
        if (affordance === 'reference') return (
          <button key={d} type="button" className="fs-mn"
            aria-current={d === current ? 'page' : undefined} data-nav={d}>
            <i aria-hidden="true">{ICON[d]}</i>{NAV_LABEL[d]}
          </button>
        );
        if (action && action.kind === 'link') return (
          <a key={d} className="fs-mn" data-nav={d} data-affordance="navigate" href={action.href} onClick={action.onSelect}>
            <i aria-hidden="true">{ICON[d]}</i>{NAV_LABEL[d]}
          </a>
        );
        if (action && action.kind === 'act') return (
          <button key={d} type="button" className="fs-mn" data-nav={d} data-affordance="navigate" onClick={action.onAct}>
            <i aria-hidden="true">{ICON[d]}</i>{NAV_LABEL[d]}
          </button>
        );
        return (
          <span key={d} className="fs-mn" data-nav={d} data-affordance="orientation"
            aria-current={d === current ? 'page' : undefined}>
            <i aria-hidden="true">{ICON[d]}</i>{NAV_LABEL[d]}
          </span>
        );
      })}
    </nav>
  );
}

export function StudioShell({ current, project, member, focus = false, destinations = NAV_DESTINATIONS, affordance = 'reference', nav, children }: {
  current: NavDestination; project?: ProjectIdentity; member?: MemberIdentity;
  focus?: boolean; destinations?: readonly NavDestination[]; affordance?: NavAffordance; nav?: NavActions; children: React.ReactNode;
}) {
  return (
    <div className="fs-root" data-focus={focus ? 'true' : 'false'} data-studio-mode={current}>
      <StudioRail current={current} project={project} member={member} destinations={destinations} affordance={affordance} nav={nav} />
      <div className="fs-content">
        <AtmosphereBand />
        {children}
      </div>
      <MobileNav current={current} destinations={destinations} affordance={affordance} nav={nav} />
    </div>
  );
}

export function CrumbBar({ work, chapter, place, saved, actions, facet }: {
  /** C1B: optional — a host with no Work name and no manuscript title omits it. */
  work?: string; chapter?: string; place?: string; saved?: string;
  actions?: React.ReactNode; facet?: Facet;
}) {
  return (
    <div className="fs-bar">
      <div className="fs-crumb">
        {work ? <b>{work}</b> : null}
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
