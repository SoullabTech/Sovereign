/**
 * The way forward from a manuscript the section-aware rooms cannot open.
 *
 * Write, Develop and Review address a manuscript BY SECTION. A draft that has
 * not been given section identity (a "continuous" draft — every import the
 * member has not confirmed into sections) is refused by all three. Before this
 * component the refusal was a single unstyled sentence on a dark page with no
 * control on it: to the writer, a black screen. Reported by a member, 2026-11-04.
 *
 * ⭐ It adds no capability and no write. The Canvas has always opened a
 * continuous draft and let the member keep writing in it; this only NAMES that
 * door instead of leaving the member facing a wall. The refusal itself is
 * unchanged — the rooms still will not guess at a structure.
 *
 * ⛔ It offers no conversion. Making a draft's breaks durable is a member act
 * with its own surface; a way-in link must never become that act by another door.
 */
import { canvasForManuscript } from '@/app/writers-studio/canvasIdentity';

export const CANVAS_PATH = '/writers-studio/canvas';
export const STUDIO_HOME_PATH = '/writers-studio';

/** The two places a member can go from here. Pure, so the wiring is testable. */
export function continuousDraftWayInHrefs(manuscriptId: string | null): {
  canvas: string | null;
  home: string;
} {
  return {
    canvas: manuscriptId ? canvasForManuscript(CANVAS_PATH, manuscriptId) : null,
    home: STUDIO_HOME_PATH,
  };
}

/**
 * Where Write sends a manuscript it cannot open, instead of stopping on the way-in.
 *
 * Studio Home's Open always lands in Write, and Home does not know whether a
 * draft has sections. So a member whose whole book is a continuous draft pressed
 * Open and met this refusal page, which to them read as an empty Work (reported
 * by a tester, 2026-11-13). The Canvas is the door this component already names;
 * Write now goes through it on the member's behalf.
 *
 * ⛔ Only `continuous`: a draft that exists and holds words. Any other state, or
 * an unknown manuscript, returns null and the way-in page stands as before.
 * ⛔ Still no conversion and no write — this is the same link, followed.
 */
export function writeForwardFor(state: string, manuscriptId: string | null): string | null {
  if (state !== 'continuous') return null;
  return continuousDraftWayInHrefs(manuscriptId).canvas;
}

export default function ContinuousDraftWayIn({
  manuscriptId,
  room,
}: {
  manuscriptId: string | null;
  /** Which room refused, in the member's words: "Write", "Develop", "Review". */
  room: string;
}) {
  const hrefs = continuousDraftWayInHrefs(manuscriptId);
  const link = {
    color: 'inherit',
    textDecoration: 'underline',
    textUnderlineOffset: 3,
  } as const;
  return (
    <section
      data-continuous-draft-way-in="true"
      style={{ maxWidth: 520, margin: '0 auto', padding: 32, lineHeight: 1.6, color: 'inherit' }}
    >
      <p style={{ margin: '0 0 12px', fontSize: '1.0625rem' }}>
        This writing has not been divided into sections yet, so {room} cannot open it.
      </p>
      <p style={{ margin: '0 0 20px' }}>
        Your words are safe and unchanged. You can keep writing in them now.
      </p>
      <p style={{ margin: 0, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {hrefs.canvas ? <a href={hrefs.canvas} style={link}>Keep writing here</a> : null}
        <a href={hrefs.home} style={link}>Back to your Studio</a>
      </p>
    </section>
  );
}
