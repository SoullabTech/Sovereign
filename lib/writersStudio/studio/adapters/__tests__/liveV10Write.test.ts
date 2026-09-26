import {
  alternativesFromThread, maiaCopyFromThread, presentationPhase, versionHistoryFromThread,
} from '../liveV10Write';
import type { RebuildEditorialThread } from '@/lib/writersStudio/rebuild/editorialCollaboration';

const base = (): RebuildEditorialThread => ({
  threadId: 'thread-1', chainId: 'chain-1', locusText: 'My original words.',
  targetSectionId: 'section-1', sectionLabel: 'A passage', legacyLocus: false,
  turns: [
    { turnIndex: 0, speaker: 'author', body: 'Can we try another wording?', at: '2026-09-26T12:00:00Z' },
    { turnIndex: 1, speaker: 'maia', body: 'Yes. Here is one possibility.', at: '2026-09-26T12:00:01Z' },
  ],
  versions: [{
    id: 'v-maia', author: 'maia', wording: 'One possible wording.', supersedes: null,
    rationale: 'Editorial purpose: Quieter ending\nKeeps the movement but changes the cadence.',
  }],
  headVersionId: 'v-maia', application: null,
});

describe('exact V10 live Write projection', () => {
  it('uses a visual conversation phase without inventing an observation identity', () => {
    const phase = presentationPhase({
      panelOpen: true, thread: { ...base(), versions: [], headVersionId: null },
      heldSectionId: 'section-1', previewVersionId: null, selectedVersionId: null, undoConfirmed: false,
    });
    expect(phase).toEqual({ name: 'conversation' });
    expect('observation' in phase).toBe(false);
  });

  it('keeps the author original as a first-class unranked alternative', () => {
    const set = alternativesFromThread(base())!;
    expect(set.items[0]).toEqual({
      id: 'keep-original', name: 'Keep my original', text: null,
      rationale: 'Leave this passage exactly as you wrote it.',
    });
    expect(set.items[1]).toMatchObject({ id: 'v-maia', name: 'Quieter ending' });
    for (const item of set.items) {
      expect(item).not.toHaveProperty('rank');
      expect(item).not.toHaveProperty('score');
      expect(item).not.toHaveProperty('recommended');
    }
  });
  it('does not expose Apply until the exact version is read in context', () => {
    const thread = base();
    const alternatives = presentationPhase({
      panelOpen: true, thread, heldSectionId: 'section-1',
      previewVersionId: null, selectedVersionId: 'v-maia', undoConfirmed: false,
    });
    expect(alternatives.name).toBe('alternatives');
    const context = presentationPhase({
      panelOpen: true, thread, heldSectionId: 'section-1',
      previewVersionId: 'v-maia', selectedVersionId: 'v-maia', undoConfirmed: false,
    });
    expect(context).toMatchObject({ name: 'context-review', selected: 'v-maia' });
  });

  it('shows applied only from the durable application receipt', () => {
    const thread = base();
    thread.application = {
      authorizationId: 'auth-1', versionId: 'v-maia', resultingVersion: 9,
      undone: false, canUndo: true,
    };
    const phase = presentationPhase({
      panelOpen: true, thread, heldSectionId: 'section-1',
      previewVersionId: null, selectedVersionId: 'v-maia', undoConfirmed: false,
    });
    expect(phase).toMatchObject({
      name: 'applied',
      applied: { version: 9, sectionId: 'section-1', alternativeId: 'v-maia', alternativeName: 'Quieter ending' },
    });
  });
  it('projects an undone application as undone rather than erasing the act', () => {
    const thread = base();
    thread.application = {
      authorizationId: 'auth-1', versionId: 'v-maia', resultingVersion: 9,
      undone: true, canUndo: false,
    };
    const phase = presentationPhase({
      panelOpen: true, thread, heldSectionId: 'section-1',
      previewVersionId: null, selectedVersionId: 'v-maia', undoConfirmed: true,
    });
    expect(phase).toMatchObject({ name: 'undone', selected: 'v-maia' });
  });

  it('carries only actual turn text into MAIA copy', () => {
    expect(maiaCopyFromThread(base())).toEqual({
      memberAsk: 'Can we try another wording?',
      opening: 'Yes. Here is one possibility.',
    });
  });

  it('history is derived only from saved versions and does not invent timestamps', () => {
    expect(versionHistoryFromThread(base())).toEqual([{
      when: 'Saved alternative', time: '', what: 'Quieter ending', current: true,
    }]);
  });
});
