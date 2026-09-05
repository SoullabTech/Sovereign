/**
 * WS2-03B correction 1 — scrollbars that belong to the room.
 *
 * The first authenticated capture showed three bright native scrollbar tracks
 * running down the rail, the outline and the writing field. On a macOS profile
 * set to "always show scrollbars" they render as near-white strips, and they
 * were the single most conspicuous thing in a warm-dark composition — louder
 * than gold, which is supposed to be the scarcest emphasis in the Studio.
 *
 * They could not be fixed where every other surface is styled. Scrollbars are
 * reachable only through pseudo-elements, and this system styles inline; a
 * `::-webkit-scrollbar` rule has nowhere to live in a style object. Hence a
 * stylesheet — the only one in the Studio, scoped to the room's own attribute
 * so it cannot leak into any other surface of the app.
 *
 * The values are tokens, not hexes: the thumb is the ramp's `raised` step
 * against a transparent track, so a scrollbar reads as a quiet lift off
 * whatever surface it sits on rather than as a foreign control. `active` on
 * hover, matching every other interactive row in the room.
 *
 * Both engines are covered — `scrollbar-color` for Firefox and the WebKit
 * pseudo-elements for Chromium and Safari — because the reviewing browser is
 * Chromium and the member's is not necessarily.
 */
'use client';

import { GROUND } from '../studioTheme';

/** The attribute the shell root carries. The stylesheet may not outlive it. */
export const STUDIO_ROOM_ATTR = 'writers-studio';

export function StudioScrollbars() {
  const scope = `[data-room='${STUDIO_ROOM_ATTR}']`;
  const css = `
${scope} * {
  scrollbar-width: thin;
  scrollbar-color: ${GROUND.raised} transparent;
}
${scope} ::-webkit-scrollbar { width: 8px; height: 8px; }
${scope} ::-webkit-scrollbar-track { background: transparent; }
${scope} ::-webkit-scrollbar-thumb {
  background: ${GROUND.raised};
  border-radius: 999px;
}
${scope} ::-webkit-scrollbar-thumb:hover { background: ${GROUND.active}; }
${scope} ::-webkit-scrollbar-corner { background: transparent; }
`;
  return <style>{css}</style>;
}
