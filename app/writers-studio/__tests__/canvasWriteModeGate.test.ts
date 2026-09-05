/**
 * WS2-04B — the Canvas's write-mode gate, at source level.
 *
 * The routing seam is the part with production blast radius: every draft that
 * exists today is `continuous`, so the branch's only live path is the one that
 * must stay exactly as it was. These assertions are about the SEAM, not the
 * section machinery, which is covered elsewhere.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { chooseMount, type WriteState } from '@/lib/writersStudio/writeStateClient';

const page = readFileSync(join(process.cwd(), 'app/writers-studio/canvas/page.tsx'), 'utf8');
const session = readFileSync(
  join(process.cwd(), 'app/writers-studio/canvas/SectionWritingSession.tsx'), 'utf8');
const surface = readFileSync(
  join(process.cwd(), 'app/writers-studio/canvas/SectionWritingSurface.tsx'), 'utf8');

describe('the mode gate routes to the right surface', () => {
  const cases: [string, WriteState | null, 'loading' | 'ready' | 'error', string][] = [
    ['continuous → Worktable', { mode: 'continuous', version: 1, content: '', notice: { title: '', body: '' } }, 'ready', 'worktable'],
    ['no_draft → Worktable (preserves beginDraft)', { mode: 'no_draft' }, 'ready', 'worktable'],
    ['continuous_unprovable → Worktable', { mode: 'continuous_unprovable', version: 1, content: '', notice: { title: 't', body: 'b' } }, 'ready', 'worktable'],
    ['section_aware → sections', { mode: 'section_aware', version: 1, rows: [], sections: [] }, 'ready', 'sections'],
    ['loading → neither engine', null, 'loading', 'pending'],
    ['failure → neither engine', null, 'error', 'unavailable'],
  ];
  it.each(cases)('%s', (_l, state, phase, expected) => {
    expect(chooseMount(phase, state).mount).toBe(expected);
  });

  it('a GET failure never resolves to continuous', () => {
    // An infrastructure failure must not look like a legitimate manuscript
    // mode: a section manuscript would open in the whole-manuscript editor.
    expect(chooseMount('error', null).mount).not.toBe('worktable');
    expect(chooseMount('ready', null).mount).not.toBe('worktable');
  });
});

describe('the section outline and canvas share ONE session', () => {
  it('the page renders the section outline only when a session exists', () => {
    // Both must come from the same lifted object. Two useSectionWriting calls
    // would give the outline a different queue, active id and statuses — the
    // bug this file exists to make hard to reintroduce.
    expect(page).toContain("writeMount.mount === 'sections' && writing");
    expect(page).toContain('activeId={writing.activeId}');
    expect(page).toContain('statusOf={writing.statusOf}');
    expect(page).toContain('onSelect={writing.goToSection}');
  });

  it('only ONE component in the canvas calls useSectionWriting', () => {
    const callers = [page, session, surface]
      .filter((src) => /useSectionWriting\s*\(/.test(src));
    expect(callers).toHaveLength(1);
    expect(session).toMatch(/useSectionWriting\s*\(/);
  });

  it('the surface receives the session rather than creating one', () => {
    expect(surface).toContain('writing: SectionWriting');
    expect(surface).not.toMatch(/useSectionWriting\s*\(/);
  });
});

describe('one outline namespace at a time', () => {
  it('the Source outline branch passes no navigation callbacks', () => {
    // Source rows carry manuscript_sections ids; giving them onSelect would
    // send the wrong namespace to a queue that would miss every click.
    const sourceBranch = page.slice(page.indexOf('<ManuscriptOutline', page.indexOf(') : (')));
    const upToClose = sourceBranch.slice(0, sourceBranch.indexOf('/>'));
    expect(upToClose).not.toContain('onSelect');
    expect(upToClose).not.toContain('activeId');
    expect(upToClose).not.toContain('statusOf');
  });

  it('the section outline is fed write-state rows, not Source sections', () => {
    expect(page).toContain('sections={writeMount.rows}');
  });
});

describe('the continuous path is unchanged', () => {
  it('still mounts Worktable with the same three props', () => {
    expect(page).toMatch(/<Worktable\s+manuscriptId=\{manuscript\.id\}\s+onMeta=\{onMeta\}\s+onCheckpointed=\{onCheckpointed\}/);
  });
});

describe('the published session is referentially stable', () => {
  const hook = readFileSync(
    join(process.cwd(), 'lib/writersStudio/useSectionWriting.ts'), 'utf8');

  it('the session object is memoized, not rebuilt every render', () => {
    // The Canvas lifts this object into state. A fresh literal per render would
    // feed itself: publish → setState → rerender → new object → publish → …
    // One session republished by unstable identity, not two sessions.
    const ret = hook.slice(hook.lastIndexOf('return useMemo('));
    expect(ret).toMatch(/^return useMemo\(/m);
    expect(ret).toContain('activeId');
    expect(ret).toContain('activeBody');
    expect(ret).toContain('statusOf');
  });

  it('its identity depends on observable writing state', () => {
    const deps = hook.slice(hook.lastIndexOf('[initialSections'));
    for (const signal of ['activeId', 'activeBody', 'statusOf', 'goToSection']) {
      expect(deps).toContain(signal);
    }
  });

  it('statusOf and hasUnsavedWork are stable callbacks, not inline arrows', () => {
    // An inline arrow in the returned object would change identity every
    // render and defeat the memo it sits inside.
    expect(hook).toMatch(/const statusOf = useCallback\(/);
    expect(hook).toMatch(/const hasUnsavedWork = useCallback\(/);
  });

  it('those callbacks re-read through the queue and staged revisions', () => {
    // Without queueVersion/stagedTick in their deps they would close over a
    // stale view and the outline would show yesterday's markers.
    const seg = hook.slice(hook.indexOf('const statusOf = useCallback('));
    expect(seg).toContain('queueVersion');
    expect(seg).toContain('stagedTick');
  });
});
