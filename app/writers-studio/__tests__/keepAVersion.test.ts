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

  it('checkpoints SERVER TRUTH without sending manuscript bytes', () => {
    /* The 2026-09-06 production defect: handing 185 server-returned sections
       back through PUT /draft produced a ~381 KB JSON body. Next middleware
       sometimes consumed/locked that stream before the route could run.
       Keep now carries only the server-acknowledged version + idempotency key;
       the checkpoint endpoint reads the sections from the database itself. */
    expect(surface).toContain('checkpointServerDraft');
    /* The guard is the SETTLED version — the value settling returned, never a
       fresh read taken beside it. `settleDraft` is now shared with Export
       precisely so two gestures cannot grow two ideas of when a draft is
       settled; its mechanics are pinned in lib/writersStudio/__tests__. */
    expect(surface).toContain('baseRevisionId: settled.version');
    expect(surface).not.toContain('const before = await loadDraft(');
    expect(surface).not.toContain('sections: before.sections');
    expect(surface).not.toMatch(/sections:\s*writing\.sections/);
    expect(surface).not.toContain('flattenDraftSections');
  });

  it('refuses rather than keeps a half-saved state', () => {
    expect(surface).toContain("setPhase('unsettled')");
    expect(surface).toMatch(/if \(!settled\.ok\)[\s\S]{0,60}unsettled/);
    /* And the refusal returns — a settle that reports failure and then keeps
       anyway is the exact defect, so the early return is the assertion. */
    expect(surface).toMatch(/if \(!settled\.ok\) \{[^}]*return; \}/);
  });

  it('uses the dedicated bodyless checkpoint endpoint, not an alternate revision store', () => {
    expect(surface).toContain('checkpointServerDraft');
    expect(surface).not.toContain('putDraftSections');
    expect(surface).not.toMatch(/fetch\(\s*['"`]\/api\/sovereign\/manuscripts\/\$\{[^}]*\}\/draft/);
  });

  it('sends the pending keystroke before keeping, so a version cannot omit it', () => {
    /* Order in the executable path, not merely in the contract prose. */
    expect(surface.indexOf('await settleDraft(writing)')).toBeGreaterThan(-1);
    expect(surface.indexOf('await settleDraft(writing)')).toBeLessThan(
      surface.indexOf('checkpointServerDraft('),
    );
    /* The base comes from the serialized save queue after settling, never from
       a second manuscript snapshot and never from a private checkpoint ref. */
    expect(surface).not.toMatch(/useRef\(baseVersion\)/);
    /* ⛔ And never a version read beside the settle. `settleDraft` returns the
       version it settled to; reading the queue again here would reintroduce
       the window the settle exists to close. */
    expect(surface).not.toContain('writing.currentRevisionId()');
    expect(lib('settleDraft.ts')).toContain('currentRevisionId');
    expect(lib('useSectionWriting.ts')).toContain('currentRevisionId');
    expect(lib('useSectionWriting.ts')).toContain('queue.state().version');
  });

  it('⛔ Keep and Export settle through ONE helper, not two look-alikes', () => {
    /* Two gestures now name a draft state to the server. If they each carried
       their own flush/poll/read they would drift, and the drift would be
       invisible: both would still "settle", just not the same way. */
    expect(surface.match(/settleDraft\(/g) ?? []).toHaveLength(1);
    expect(surface).toContain('exportCurrentDraft');
    expect(surface).not.toContain('SETTLE_TIMEOUT_MS = ');
    expect(surface).not.toContain('SETTLE_POLL_MS = ');
  });

  it('does not retry a conflict — a moved Work is reported, never overwritten', () => {
    /* Exactly one checkpoint call site: a retry would re-send this session's
       snapshot over whatever moved the draft. */
    expect(surface.match(/checkpointServerDraft\(/g) ?? []).toHaveLength(1);
    expect(surface).toContain("res.kind === 'conflict'");
    expect(surface).toContain('Nothing was changed. Reload, then keep a version.');
  });
});

describe('the authority stays where it belongs', () => {
  it('Develop cannot checkpoint, and does not try to', () => {
    const develop = src('develop', 'DevelopRoom.tsx');
    expect(develop).not.toContain('checkpoint');
    expect(develop).not.toContain('putDraftSections');
    expect(develop).not.toContain('checkpointServerDraft');
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
