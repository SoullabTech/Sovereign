/**
 * Now What? V1 — the Home → Room draft hand-off (NW-V1-CLIENT-01).
 *
 * The member starts answering "What happened since?" on Home and finishes in
 * the Room. Her opening words travel in sessionStorage, never in the URL —
 * the same principle that keeps thread text out of query strings: what she
 * wrote is not link material, and links end up in history, logs and referrers.
 *
 * It carries a DRAFT, not a submission. The Room places it in the composer and
 * she still sends it herself, so the authorship gesture stays hers. Nothing
 * here is persisted, and a browser that refuses storage simply means she types
 * her opening in the Room instead.
 *
 * It lives in its own module so the Room does not have to import the Home
 * component to know the key.
 */
export const LIVED_DRAFT_KEY = 'nw_lived_draft';
