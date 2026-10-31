const fetchMock = jest.fn();

jest.mock('@/lib/http/apiBase', () => ({
  apiFetch: (...args: unknown[]) => fetchMock(...args),
}));

import {
  parseReturnEditorialEpisode,
  readA2Relationship,
  resolveEditorialReturnBinding,
} from '../relationshipOrchestration';
import type { RebuildEditorialThread } from '../editorialCollaboration';

const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json' },
});

const relationship = {
  id: 'rel-1', livingWorkId: 'work-1', manuscriptId: 'manuscript-1',
  createdAt: '2026-10-28T12:00:00.000Z',
};

const editorial = (sequence: number, threadId: string) => ({
  sequence, childKind: 'EDITORIAL_TURN', continuationAuthorized: true,
  authorityClass: 'EDITORIAL_CHAIN', threadId,
});

describe('fresh Writer return thread authority', () => {
  beforeEach(() => fetchMock.mockReset());

  it('selects only the newest server-owned editorial episode', async () => {
    fetchMock.mockResolvedValueOnce(response({
      relationship,
      active: true,
      episodes: [
        editorial(2, 'thread-old'),
        { sequence: 4, childKind: 'REVIEW_DISCUSS', continuationAuthorized: false },
        editorial(7, 'thread-current'),
      ],
    }));
    const out = await readA2Relationship('rel-1');
    expect(out).toEqual({
      ok: true,
      relationship: {
        ...relationship,
        episodeCount: 3,
        latestEditorialThreadId: 'thread-current',
      },
    });
    expect(fetchMock).toHaveBeenCalledWith('/api/writers-studio/relationships/rel-1');
  });

  it('returns null when an active relationship has no editorial episode', () => {
    expect(parseReturnEditorialEpisode([
      { sequence: 1, childKind: 'REVIEW_DISCUSS', continuationAuthorized: false },
    ])).toEqual({ ok: true, latestEditorialThreadId: null });
  });

  it.each([
    ['non-array', {}],
    ['duplicate sequence', [editorial(1, 'a'), editorial(1, 'b')]],
    ['unknown child kind', [{ sequence: 1, childKind: 'UNKNOWN' }]],
    ['unauthorized editorial pointer', [{
      sequence: 1, childKind: 'EDITORIAL_TURN', continuationAuthorized: false,
      authorityClass: 'EDITORIAL_CHAIN', threadId: 'thread-1',
    }]],
    ['wrong authority class', [{
      sequence: 1, childKind: 'EDITORIAL_TURN', continuationAuthorized: true,
      authorityClass: 'R2_DISCLOSURE', threadId: 'thread-1',
    }]],
  ])('fails closed on %s episode metadata', async (_name, episodes) => {
    fetchMock.mockResolvedValueOnce(response({ relationship, active: true, episodes }));
    await expect(readA2Relationship('rel-1')).resolves.toEqual({ ok: false, reason: 'unreadable' });
  });
});

const returnThread = (overrides: Partial<RebuildEditorialThread> = {}): RebuildEditorialThread => ({
  application: null,
  threadId: 'thread-return',
  chainId: 'chain-return',
  workId: 'manuscript-1',
  locusText: 'Original exact passage.',
  targetSectionId: 'section-1',
  sectionLabel: null,
  legacyLocus: false,
  turns: [],
  versions: [],
  headVersionId: null,
  ...overrides,
});

describe('fresh Writer return visible-locus authority', () => {
  it('prefers the exact original locus while it remains uniquely present', () => {
    expect(resolveEditorialReturnBinding(
      returnThread(),
      'Before. Original exact passage. After.',
    )).toEqual({
      source: 'original_locus',
      text: 'Original exact passage.',
      start: 8,
      end: 31,
    });
  });

  it('binds the exact active applied version when Apply removed the original locus', () => {
    const applied = 'Author-controlled applied passage.';
    expect(resolveEditorialReturnBinding(returnThread({
      application: {
        authorizationId: 'authorization-1',
        versionId: 'member-version-1',
        resultingVersion: 3,
        undone: false,
        canUndo: true,
      },
      versions: [{
        id: 'member-version-1',
        author: 'member',
        wording: applied,
        supersedes: 'maia-version-1',
        rationale: null,
      }],
      headVersionId: 'member-version-1',
    }), applied)).toEqual({
      source: 'active_application',
      text: applied,
      start: 0,
      end: applied.length,
    });
  });

  it.each([
    ['no application', null, [{
      id: 'member-version-1', author: 'member', wording: 'Applied.', supersedes: null, rationale: null,
    }]],
    ['not current/undoable', {
      authorizationId: 'authorization-1', versionId: 'member-version-1',
      resultingVersion: 3, undone: false, canUndo: false,
    }, [{
      id: 'member-version-1', author: 'member', wording: 'Applied.', supersedes: null, rationale: null,
    }]],
    ['already undone', {
      authorizationId: 'authorization-1', versionId: 'member-version-1',
      resultingVersion: 3, undone: true, canUndo: false,
    }, [{
      id: 'member-version-1', author: 'member', wording: 'Applied.', supersedes: null, rationale: null,
    }]],
    ['missing named version', {
      authorizationId: 'authorization-1', versionId: 'missing-version',
      resultingVersion: 3, undone: false, canUndo: true,
    }, [{
      id: 'different-version', author: 'member', wording: 'Applied.', supersedes: null, rationale: null,
    }]],
  ] as const)('refuses applied-wording fallback for %s', (_name, application, versions) => {
    expect(resolveEditorialReturnBinding(returnThread({ application, versions }), 'Applied.')).toBeNull();
  });

  it('refuses ambiguous applied wording rather than choosing a position', () => {
    expect(resolveEditorialReturnBinding(returnThread({
      application: {
        authorizationId: 'authorization-1', versionId: 'member-version-1',
        resultingVersion: 3, undone: false, canUndo: true,
      },
      versions: [{
        id: 'member-version-1', author: 'member', wording: 'Applied.', supersedes: null, rationale: null,
      }],
    }), 'Applied. Between. Applied.')).toBeNull();
  });

  it('refuses similar but non-exact applied prose', () => {
    expect(resolveEditorialReturnBinding(returnThread({
      application: {
        authorizationId: 'authorization-1', versionId: 'member-version-1',
        resultingVersion: 3, undone: false, canUndo: true,
      },
      versions: [{
        id: 'member-version-1', author: 'member', wording: 'Applied exact wording.', supersedes: null, rationale: null,
      }],
    }), 'Applied almost-exact wording.')).toBeNull();
  });
});
