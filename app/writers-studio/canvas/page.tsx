/**
 * THE WRITER'S STUDIO ROUTE — WS-EDITORIAL-UI-01A · THE SERVER BOUNDARY.
 *
 * ⭐⭐ ONE FLAG, ONE AUTHORITY. `WRITERS_STUDIO_EDITORIAL_ENABLED` is read
 * HERE, once, on the server, and handed down as a boolean. The room below is
 * a client component and cannot read the environment; this is the only place
 * in the client tree where that fact enters.
 *
 * ⛔ WHAT THIS REFUSES, AND WHY EACH WAS REFUSED:
 *
 *   a `NEXT_PUBLIC_` mirror   a second, independently-settable source of
 *                             truth for one flag. Two copies can disagree,
 *                             and the disagreement is invisible until a
 *                             member is looking at the wrong surface.
 *
 *   404 read as "disabled"    a client inferring POLICY from a status code.
 *                             That is the same family as inferring an act
 *                             from prose, which this programme has spent the
 *                             whole editorial lane refusing.
 *
 *   a feature-status API      a new endpoint, a new ontology, and a second
 *                             thing to keep in step with the routes.
 *
 * ⭐ AND THE BOOLEAN IS PRESENTATION STATE, NOT AUTHORIZATION. A member who
 * edits it in the browser gains nothing: both editorial routes re-read the
 * real server flag and refuse independently. It decides which surface is
 * drawn, never what may be done.
 *
 * `force-dynamic` because an environment flag read at build time would freeze
 * one deployment's answer into the HTML of every later one.
 */
import CanvasClient from './CanvasClient';

export const dynamic = 'force-dynamic';

export default function WritersStudioCanvasRoute() {
  return (
    <CanvasClient
      editorialEnabled={process.env.WRITERS_STUDIO_EDITORIAL_ENABLED === '1'}
    />
  );
}
