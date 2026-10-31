import type { RebuildEditorialThread } from '../editorialCollaboration';
import {
  confirmsExactMemberSaveReadback,
  type ExactMemberSaveReadback,
} from '../memberSaveReadbackR1';

const authored = 'The lantern 🜂\r\nturns toward the river.';
const expected: ExactMemberSaveReadback = {
  threadId: 'fiction-thread-a',
  workId: 'fiction-manuscript-a',
  sectionId: 'fiction-section-a',
  locusText: 'The earlier fictional passage.',
  versionId: 'fiction-saved-v2',
  supersedes: 'fiction-maia-v1',
  text: authored,
};
const previous = {
  id: 'fiction-maia-v1', author: 'maia' as const,
  wording: 'A different invented suggestion.',
  supersedes: null, rationale: null,
};
const saved = {
  id: expected.versionId, author: 'member' as const,
  wording: authored, supersedes: expected.supersedes, rationale: null,
};

function read(
  patch: Partial<RebuildEditorialThread> = {},
): RebuildEditorialThread {
  return {
    threadId: expected.threadId,
    chainId: 'fiction-chain',
    workId: expected.workId,
    locusText: expected.locusText,
    targetSectionId: expected.sectionId,
    sectionLabel: 'Fictional passage',
    legacyLocus: false,
    turns: [],
    versions: [previous, saved],
    headVersionId: saved.id,
    ...patch,
  };
}

describe('JARVIS exact member Save readback — no invented confirmation', () => {
  it('confirms only exact member-owned wording including emoji and original CRLF', () => {
    expect(confirmsExactMemberSaveReadback(read(), expected)).toBe(true);
    expect(confirmsExactMemberSaveReadback(read(), { ...expected, text: authored.replace('\r\n', '\n') })).toBe(false);
    expect(confirmsExactMemberSaveReadback(read(), { ...expected, text: authored.replace('🜂', '') })).toBe(false);
  });

  it('allows a deliberately empty authored version with an actual readback', () => {
    const blank = { ...expected, text: '', versionId: 'fiction-empty-root', supersedes: null };
    const actual = read({
      versions: [{ id: blank.versionId, author: 'member', wording: '', supersedes: null, rationale: null }],
      headVersionId: blank.versionId,
    });
    expect(confirmsExactMemberSaveReadback(actual, blank)).toBe(true);
  });

  it.each([
    ['absent response', null],
    ['other thread', read({ threadId: 'fiction-thread-b' })],
    ['other Work', read({ workId: 'fiction-manuscript-b' })],
    ['unproven Work', read({ workId: undefined })],
    ['other section', read({ targetSectionId: 'fiction-section-b' })],
    ['other locus text', read({ locusText: 'The passage changed.' })],
    ['other head', read({ headVersionId: previous.id })],
    ['missing version', read({ versions: [previous] })],
    ['duplicate version IDs', read({ versions: [previous, saved, { ...saved }] })],
    ['MAIA impersonation', read({ versions: [previous, { ...saved, author: 'maia' }] })],
    ['changed wording', read({ versions: [previous, { ...saved, wording: 'A different passage.' }] })],
    ['rebased predecessor', read({ versions: [previous, { ...saved, supersedes: null }] })],
  ] as const)('refuses %s instead of asserting Save', (_label, actual) => {
    expect(confirmsExactMemberSaveReadback(actual, expected)).toBe(false);
  });

  it('refuses altered request identity even when the returned version looks familiar', () => {
    const actual = read();
    expect(confirmsExactMemberSaveReadback(actual, { ...expected, threadId: 'fiction-thread-b' })).toBe(false);
    expect(confirmsExactMemberSaveReadback(actual, { ...expected, workId: 'fiction-manuscript-b' })).toBe(false);
    expect(confirmsExactMemberSaveReadback(actual, { ...expected, sectionId: 'fiction-section-b' })).toBe(false);
    expect(confirmsExactMemberSaveReadback(actual, { ...expected, locusText: 'A new locus' })).toBe(false);
    expect(confirmsExactMemberSaveReadback(actual, { ...expected, versionId: 'fiction-maia-v1' })).toBe(false);
    expect(confirmsExactMemberSaveReadback(actual, { ...expected, supersedes: null })).toBe(false);
  });

  it('never substitutes the returned head for the exact ID acknowledged by Save', () => {
    expect(confirmsExactMemberSaveReadback(read(), {
      ...expected, versionId: 'fiction-version-not-in-receipt',
    })).toBe(false);
  });
});
