import { redirect } from 'next/navigation';

/**
 * /studio/scribe now redirects to /studio/session-room
 *
 * Session Room is the upgraded version with global recording context
 * (recording survives navigation), dual audio capture, and persistent banner.
 * Keeping this route so any existing bookmarks or links still work.
 */
export default function ScribeRedirect() {
  redirect('/studio/session-room');
}
