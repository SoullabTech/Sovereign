/**
 * KEEP A VERSION — the writer's act, in the place the writer writes.
 *
 * Found by the founder's integration walk, 2026-09-05: Develop refused to read
 * a Work that had moved past its last kept version, told the writer to keep one
 * in Write, and Write — now section-native — had no way to do it. The loop
 * dead-ended at the boundary it exists to protect.
 *
 * These assertions hold the shape of the repair, not its styling: the gesture
 * is the member's, it reuses the existing checkpoint, it does not overwrite a
 * Work that moved, and Develop does not acquire the authority instead.
 */

import * as fs from 'fs';
import * as path from 'path';

const src = (...p: string[]) => fs.readFileSync(path.join(__dirname, '..', ...p), 'utf8');
const lib = (...p: string[]) =>
  fs.readFileSync(path.join(__dirname, '..', '..', '..', 'lib', 'writersStudio', ...p), 'utf8');

const surface = src('canvas', 'SectionWritingSurface.tsx');

describe('the section-native writer can keep a version', () => {
  it('offers the gesture, and it is a gesture — not a timer', () => {
    expect(surface).toContain('data-keep-a-version');
    expect(surface).toContain('Keep a version');
    expect(surface).toContain('onClick={keep}');
  });

  it('checkpoints SERVER TRUTH, never a client-held snapshot of the Work', () => {
    /* The 2026-09-05 defect: the payload was built from writing.sections —
       the MOUNT-TIME bodies — so keeping a version rewrote the draft from a
       client snapshot (496 -> 485 bytes, headings gone, leading space added).
       The sections handed to the checkpoint must be the ones the server just
       returned, and nothing else. */
    expect(surface).toContain('const before = await loadDraft(');
    expect(surface).toContain('sections: before.sections');
    expect(surface).toContain('baseRevisionId: before.revisionId');
    /* No reconstruction of any kind reaches the checkpoint. */
    expect(surface).not.toMatch(/sections:\s*writing\.sections/);
    expect(surface).not.toMatch(/sections:\s*writing\.sections\.map/);
    expect(surface).not.toContain('flattenDraftSections');
    expect(surface).toContain('before.sectionAddressable');
  });

  it('refuses rather than keeps a half-saved state', () => {
    expect(surface).toContain("setPhase('unsettled')");
    expect(surface).toContain('writing.hasUnsavedWork()');
    /* Settle comes before the read, or the read captures pre-flush text. */
    expect(surface.indexOf('writing.flushPending()')).toBeLessThan(surface.indexOf('const before = await loadDraft('));
  });

  it('reuses the existing checkpoint rather than inventing a second one', () => {
    expect(surface).toContain('putDraftSections');
    expect(surface).toContain('checkpoint: true');
    /* The append-only revision store is written one way, by one call. */
    expect(surface).not.toMatch(/fetch\(\s*['"`]\/api\/sovereign\/manuscripts\/\$\{[^}]*\}\/draft/);
  });

  it('sends the pending keystroke before keeping, so a version cannot omit it', () => {
    expect(surface).toContain('writing.flushPending()');
    /* Order in the CALL, not in the prose above it: the doc comment names
       `checkpoint: true` before either appears in code. */
    expect(surface.indexOf('writing.flushPending()')).toBeLessThan(surface.indexOf('putDraftSections('));
    /* The base is the server's, never one the client remembered. (makeSectionSave
       legitimately takes a baseVersion for a SECTION save; the checkpoint may
       not hold one of its own.) */
    expect(surface).not.toMatch(/useRef\(baseVersion\)/);
    expect(surface).not.toMatch(/baseRevisionId:\s*base\b/);
    expect(lib('useSectionWriting.ts')).toContain('flushPending');
  });

  it('does not retry a conflict — a moved Work is reported, never overwritten', () => {
    /* Exactly one checkpoint call site: a retry would re-send this session's
       snapshot over whatever moved the draft. */
    expect(surface.match(/putDraftSections\(/g) ?? []).toHaveLength(1);
    expect(surface).toContain("res.kind === 'conflict'");
    expect(surface).toContain('Nothing was changed. Reload, then keep a version.');
  });
});

describe('the authority stays where it belongs', () => {
  it('Develop cannot checkpoint, and does not try to', () => {
    const develop = src('develop', 'DevelopRoom.tsx');
    expect(develop).not.toContain('checkpoint');
    expect(develop).not.toContain('putDraftSections');
    /* It may only NAME the act and point at where it lives. */
    expect(develop).toContain('Keep a version in the Writer Canvas');
  });

  it('nothing keeps a version on the member’s behalf', () => {
    /* The autosave path writes sections; it must never checkpoint them. */
    /* Prose may name the act; neither file may perform it. */
    expect(lib('sectionSaveQueue.ts')).not.toContain('checkpoint: true');
    expect(lib('useSectionWriting.ts')).not.toContain('checkpoint: true');
    expect(lib('useSectionWriting.ts')).not.toContain('putDraftSections');
  });
});
