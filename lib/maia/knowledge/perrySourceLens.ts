/**
 * Glenn Perry / Soullab Stage B — source-bound, per-turn symbolic lens.
 *
 * Code-only preparation, NOT corpus admission, deployment, or permission to
 * reproduce Perry's books. The approved source is deliberately NULL.
 *
 * A request-body source selection is intent, never source authority.
 * Both founder source approval and existing exact-source corpus admission
 * must independently succeed before any prompt block can be returned.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';
import { getGlobalLibraryAuthorityKeys } from '@/lib/library/globalRetrievalAuthority';

export const PERRY_SOURCE_LENS_ID = 'glenn-perry-astropsychology' as const;

export type ApprovedPerryEditorialSource = Readonly<{
  sourcePath: string;
  sourceSha256: string;
  creditedTo: 'Soullab editorial synthesis';
  approvalRecord: string;
}>;

/** No approved source yet. This cannot be enabled by a client or env flag. */
export const APPROVED_PERRY_EDITORIAL_SOURCE: ApprovedPerryEditorialSource | null = null;

export interface PerryLensTurn {
  readonly requestedLens: unknown;
  readonly verifiedMemberId: string | null;
  readonly isSanctuary: boolean;
  /** An operational kill-switch, not an authorization. */
  readonly enabled: boolean;
}

export interface PerrySourceAuthorityKey {
  readonly filePath: string;
  readonly checksum: string;
}

export interface PerryLensServerDependencies {
  readonly approvedSource: ApprovedPerryEditorialSource | null;
  readonly authorityKeys: () => readonly PerrySourceAuthorityKey[];
  readonly readSource: (relativePath: string) => string;
}

function approvedPath(pathname: string): boolean {
  return pathname.startsWith('data/ain/source/')
    && pathname.length > 'data/ain/source/'.length
    && !pathname.includes('\\')
    && !pathname.includes('\0')
    && !pathname.split('/').includes('..')
    && path.posix.normalize(pathname) === pathname
    && pathname.endsWith('.md');
}

function hasReviewedRetrievalFrontmatter(content: string): boolean {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(content);
  if (!match) return false;
  return /^status:\s*stable\s*$/m.test(match[1])
    && /^safe_for_retrieval:\s*true\s*$/m.test(match[1]);
}

function permittedMember(id: string | null): boolean {
  return typeof id === 'string'
    && id.trim().length > 0
    && id !== 'guest'
    && id !== 'anonymous'
    && !id.startsWith('anon:')
    && !id.startsWith('guest:');
}

function isExplicitSourceSelection(value: unknown): boolean {
  return value === PERRY_SOURCE_LENS_ID;
}

/** Fixed, original editorial framing, not an excerpt from Perry's books. */
function authorizedPerryCommentaryBlock(source: ApprovedPerryEditorialSource): string {
  return [
    '[OPTIONAL ATTRIBUTED SYMBOLIC-INQUIRY LENS]',
    'Source: ' + source.creditedTo + ', inspired by Glenn Perry’s AstroPsychology.',
    'Provenance: exact governed Soullab source ' + source.sourcePath + ', sha256:' + source.sourceSha256 + '.',
    'This symbolic tradition is not a psychiatric or scientific diagnostic instrument.',
    'Use only because the member explicitly requested this lens in this turn.',
    'Begin with lived experience and tentative questions about emotions, needs, protection, and possibility.',
    'Separate Perry’s propositions from Soullab’s own member-centered adaptation.',
    'Never infer abuse, trauma, psychiatric disorders, personal history, or developmental rank from a chart.',
    'Never predict destiny or claim that a horoscope establishes a biography. Neither meaning nor fit is compulsory.',
    'Never invent natal placements, houses, Ascendant, calculations, or transit positions.',
    'Return interpretive authority to the member and withdraw the lens if they decline it.',
    'No text from Perry’s books or essays is included or authorized by this source lens.',
    '[/OPTIONAL ATTRIBUTED SYMBOLIC-INQUIRY LENS]',
  ].join('\n');
}

const LIVE_SERVER_DEPS: PerryLensServerDependencies = {
  approvedSource: APPROVED_PERRY_EDITORIAL_SOURCE,
  authorityKeys: () => getGlobalLibraryAuthorityKeys(process.cwd()),
  readSource: (rel) => fs.readFileSync(path.join(process.cwd(), rel), 'utf8'),
};

/**
 * Serving route calls without dependency overrides. Fictional test fixtures
 * may supply a mock trusted source and an admission proof. Every production
 * invocation returns null until a separately reviewed source approval change.
 */
export function buildPerrySourceLensAddendum(
  turn: PerryLensTurn,
  deps: PerryLensServerDependencies = LIVE_SERVER_DEPS,
): string | null {
  if (!turn.enabled || turn.isSanctuary || !permittedMember(turn.verifiedMemberId)
      || !isExplicitSourceSelection(turn.requestedLens)) {
    return null;
  }

  const source = deps.approvedSource;
  if (!source || source.creditedTo !== 'Soullab editorial synthesis'
      || !approvedPath(source.sourcePath)
      || !/^[a-f0-9]{64}$/i.test(source.sourceSha256)
      || !source.approvalRecord.startsWith('docs/corpus-authority/')) {
    return null;
  }

  // Deny BEFORE reading any unapproved source.
  const keys = deps.authorityKeys();
  if (!keys.some((key) => key.filePath === source.sourcePath
      && key.checksum.toLowerCase() === source.sourceSha256.toLowerCase())) {
    return null;
  }

  const content = deps.readSource(source.sourcePath);
  if (!hasReviewedRetrievalFrontmatter(content)) return null;
  const actualSha = createHash('sha256').update(content, 'utf8').digest('hex');
  if (actualSha !== source.sourceSha256.toLowerCase()) return null;

  return authorizedPerryCommentaryBlock(source);
}
