/** Human-facing wording for the pending source-upload release gate.
 * This unit never returns "saving enabled": that requires a separate,
 * explicitly admitted server authorization, not MAIA's local Sanctuary switch.
 */
import type { SourcePostureDisplay } from './sourcePostureDisplay';
export type SourcePostureNotice = Readonly<{ heading: string; detail: string }>;
export function sourcePostureNotice(state: SourcePostureDisplay): SourcePostureNotice {
  const heading = 'Materials saving paused';
  switch (state) {
    case 'sanctuary': return { heading, detail: 'The server confirms Sanctuary for this session’s source protection.' };
    case 'ordinary-unverified': return { heading, detail: 'Ordinary mode is recorded, but that does not authorize saving material.' };
    default: return { heading, detail: 'Server confirmation is unavailable. New material will not be saved.' };
  }
}
