/**
 * FLAGSHIP STUDIO — THE CONTEXTUAL MAIA PANEL (C1C1 · pure presentation seam)
 *
 * ⭐ Pure function of its props. ⛔ No hooks, no fetch, no persistence, no
 * minting, no inference. It draws what it is handed and calls the one action
 * it is handed (`onRelease`). Both the controlled witness (`MaiaPanel`) and the
 * live Write host compose THIS panel, so the accepted markup and the live
 * markup are one object rendered with different props.
 *
 * ⛔ It never manufactures an Observation / Reasoning / Teaching from a reply:
 * `message` is rendered as speech (`fs-say`) and nothing else.
 */

import * as React from 'react';

export interface ContextualMessage {
  readonly text: string;
  /** `maia` — her words, verbatim. `studio` — a truthful notice from the surface. */
  readonly speaker: 'maia' | 'studio';
}

export interface ContextualMaiaPanelProps {
  /** ⭐ The held sentence, echoed at the head of the sheet (visible only where she is a sheet). */
  readonly heldEcho?: string;
  /** The member's own ask, verbatim. */
  readonly memberAsk?: string;
  readonly message?: ContextualMessage;
  /** ⛔ Filters over one conversation; none commissions a reading. */
  readonly tabs: readonly string[];
  readonly activeTab: string;
  /** The composer, when a turn may be commissioned. Absent = no turn may be commissioned here. */
  readonly composer?: React.ReactNode;
  /** ⭐ Release, never cancel: the panel is hidden; nothing in flight is claimed stopped. */
  readonly onRelease?: () => void;
  /** Host-supplied extras: `lead` renders before the ask, `trail` after the message. */
  readonly supplemental?: { readonly lead?: React.ReactNode; readonly trail?: React.ReactNode };
  /** A presentation label the host may stamp (e.g. the Discuss state). Never read back. */
  readonly state?: string;
}

export function ContextualMaiaPanel({
  heldEcho, memberAsk, message, tabs, activeTab, composer, onRelease, supplemental, state,
}: ContextualMaiaPanelProps) {
  return (
    <aside className="fs-maia" data-maia-anchored="true" aria-label="MAIA, at this passage" data-discuss={state}>
      <div className="fs-mhead">
        <div className="fs-mdot" aria-hidden="true" />
        <div className="fs-mname">MAIA</div>
        <button type="button" className="fs-mx" data-event="RELEASE" aria-label="Close MAIA" onClick={onRelease}>✕</button>
      </div>
      <div className="fs-tabs" role="tablist">
        {tabs.map((t) => (
          <button key={t} type="button" role="tab" className="fs-tab"
            aria-selected={t === activeTab} data-tab={t}>{t}</button>
        ))}
      </div>
      <div className="fs-mbody">
        {heldEcho ? (
          <blockquote className="fs-heldquote" data-held-echo="true">{heldEcho}</blockquote>
        ) : null}
        {supplemental?.lead}
        {memberAsk ? <div className="fs-ask">{memberAsk}</div> : null}
        {message ? (
          message.speaker === 'maia'
            ? <p className="fs-say">{message.text}</p>
            : <p className="fs-say" data-notice="true">{message.text}</p>
        ) : null}
        {supplemental?.trail}
      </div>
      {composer !== undefined ? <div className="fs-minput">{composer}</div> : null}
    </aside>
  );
}
