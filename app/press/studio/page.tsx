import { redirect } from 'next/navigation';

/**
 * /press/studio → /writers-studio (RULED 2026-08-05, Kelly).
 *
 * The Writer's Studio is the practice environment and does not live under
 * /press — writing is the practice; a book is one expression of it. This
 * redirect keeps every old link, bookmark, and House build working while the
 * route identity moves. The Manuscript Room (/press/manuscript) stays where
 * it is: it is the long-form instrument, and /press remains its address.
 */
export default function PressStudioRedirect() {
  redirect('/writers-studio');
}
