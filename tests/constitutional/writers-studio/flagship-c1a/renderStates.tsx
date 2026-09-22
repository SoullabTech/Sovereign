/**
 * C1A — the six accepted controlled Write states, rendered exactly as the
 * browser witness renders them (same fixtures, same StudioShell page wrap).
 * Pure: renderToStaticMarkup only. Used by the golden capture and by law L8.
 */
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StudioShell } from '../../../../app/writers-studio/flagship/StudioChrome';
import { WriteRoom } from '../../../../app/writers-studio/flagship/WriteRoom';
import type { StudioState } from '../../../../lib/writersStudio/studio/machine';
import type { ManuscriptView, MaiaCopy, VersionEntry } from '../../../../app/writers-studio/flagship/WriteRoom';
import type { ProjectIdentity, MemberIdentity } from '../../../../app/writers-studio/flagship/StudioChrome';

/**
 * ⭐ ONE SOURCE OF FIXTURES: the browser witness's own. Loaded at runtime rather
 * than imported, so the strict flagship program (`tsconfig.ws-flagship.json`)
 * checks the NEW pure code without absorbing the witness module graph, which
 * carries pre-existing diagnostics under `noUncheckedIndexedAccess` that are
 * not this act's to repair. The shape is pinned here; drift fails loudly.
 */
interface WitnessFixtures {
  readonly MEMBER: MemberIdentity; readonly PROJECT: ProjectIdentity;
  readonly MANUSCRIPT: ManuscriptView; readonly VERSIONS: readonly VersionEntry[];
  readonly MAIA_DISCUSS: MaiaCopy; readonly MAIA_REVISE: MaiaCopy; readonly MAIA_ARRIVED: MaiaCopy;
  readonly S_REST: StudioState; readonly S_HELD: StudioState; readonly S_ALTS: StudioState;
  readonly S_CTX: StudioState; readonly S_APPLIED: StudioState; readonly S_ARRIVED: StudioState;
}
// eslint-disable-next-line @typescript-eslint/no-require-imports
const FX = require('../../../../scripts/witness/flagship/fixtures') as WitnessFixtures;
const {
  MEMBER, PROJECT, MANUSCRIPT, VERSIONS,
  MAIA_DISCUSS, MAIA_REVISE, MAIA_ARRIVED,
  S_REST, S_HELD, S_ALTS, S_CTX, S_APPLIED, S_ARRIVED,
} = FX;

export type RoomLike = typeof WriteRoom;

export const WRITE_STATE_IDS = [
  '1-write-rest', '2-write-maia', '3-write-alternatives',
  '4-write-read-in-context', '5-write-applied-undo', '5b-arrived-from-review',
] as const;

export function renderWriteStates(Room: RoomLike = WriteRoom): Record<string, string> {
  const nodes: Record<string, React.ReactElement> = {
    '1-write-rest': <Room state={S_REST} view={MANUSCRIPT} copy={MAIA_DISCUSS} />,
    '2-write-maia': <Room state={S_HELD} view={MANUSCRIPT} copy={MAIA_DISCUSS} tab="Discuss" />,
    '3-write-alternatives': <Room state={S_ALTS} view={MANUSCRIPT} copy={MAIA_REVISE} tab="Revise" />,
    '4-write-read-in-context': <Room state={S_CTX} view={MANUSCRIPT} copy={MAIA_REVISE} tab="Revise" />,
    '5-write-applied-undo': <Room state={S_APPLIED} view={{ ...MANUSCRIPT, words: 1246, wordDelta: 0 }} copy={MAIA_REVISE} tab="Revise" history={VERSIONS} />,
    '5b-arrived-from-review': <Room state={S_ARRIVED} view={MANUSCRIPT} copy={MAIA_ARRIVED} tab="Discuss" />,
  };
  const out: Record<string, string> = {};
  for (const id of WRITE_STATE_IDS) {
    out[id] = renderToStaticMarkup(
      <StudioShell current="write" project={PROJECT} member={MEMBER}>{nodes[id]!}</StudioShell>,
    );
  }
  return out;
}
