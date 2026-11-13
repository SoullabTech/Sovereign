/**
 * JARVIS-WRITERS-STUDIO-INSPIRATION-OPENING-01 · Studio paths (founder 2026-11-13: "we will have many of these sub
 * functions within writers studio"; first path: college essay, beta with Nathan Kane and Liam, ledger #1938).
 *
 * F17 a path is chosen only by the member's own link, matched exactly, never inferred
 * F18 the path's first prompt replaces the Spark question only where the door would show anyway
 * F19 a recommended Work setting is applied only when the member confirms it at Begin; never silently
 * F20 the path's frame comes from the registry by id; the client never supplies prompt text
 */
import {
  STUDIO_PATHS,
  pathFromParam,
  pathBeginPatch,
  pathFrameFor,
  visibleArc,
} from '../studioPaths';

describe('F17 · a path is chosen only by the member’s own link', () => {
  it('finds the college essay path by its exact id', () => {
    expect(pathFromParam('college-essay')?.id).toBe('college-essay');
  });
  it('never guesses: unknown, empty, cased, padded or absent ids open no path', () => {
    for (const p of [null, undefined, '', 'college', 'College-Essay', ' college-essay', 'college-essay/', 'essay']) {
      expect(pathFromParam(p as string | null | undefined)).toBeNull();
    }
  });
  it('every registered path has a unique id, a name, a first prompt and a suggested title', () => {
    const ids = STUDIO_PATHS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of STUDIO_PATHS) {
      expect(p.name.trim()).not.toBe('');
      expect(p.firstPrompt.trim()).not.toBe('');
      expect(p.suggestedTitle.trim()).not.toBe('');
    }
  });
  it('the essay path opens on the coaching arc’s Discover prompt, verbatim', () => {
    expect(pathFromParam('college-essay')!.firstPrompt).toBe(
      'A moment that stays with me: what ordinary moment do you remember clearly, and what can you still notice about it?',
    );
  });
});

describe('F21 · each path is its own environment, and shows only what exists today', () => {
  it('every path declares its arena and an arc', () => {
    for (const p of STUDIO_PATHS) {
      expect(p.arena.trim()).not.toBe('');
      expect(p.arc.length).toBeGreaterThan(0);
    }
  });
  it('unbuilt stages are never shown: the essay path shows only Discover today', () => {
    expect(visibleArc(pathFromParam('college-essay')!)).toEqual(['Discover']);
  });
});

describe('F19 · recommended settings only by the member’s own confirmation', () => {
  const essay = pathFromParam('college-essay')!;
  it('the essay path recommends "MAIA asks, never rewrites"', () => {
    expect(essay.recommended.maiaRevisionsPaused).toBe(true);
  });
  it('confirmed at Begin: the setting is sent with the member’s title, through their own act', () => {
    expect(pathBeginPatch({ path: essay, title: 'College essay', revisionsPausedConfirmed: true, purpose: null }))
      .toEqual({ title: 'College essay', maiaRevisionsPaused: true });
  });
  it('unticked: the setting is not sent at all, so nothing is set for them', () => {
    const patch = pathBeginPatch({ path: essay, title: 'College essay', revisionsPausedConfirmed: false, purpose: null });
    expect('maiaRevisionsPaused' in patch).toBe(false);
  });
  it('the title is the member’s, exactly; an emptied title is left unnamed, never filled in for them', () => {
    expect(pathBeginPatch({ path: essay, title: '  My Grandmother’s Kitchen ', revisionsPausedConfirmed: false, purpose: null }).title)
      .toBe('  My Grandmother’s Kitchen ');
    expect('title' in pathBeginPatch({ path: essay, title: '   ', revisionsPausedConfirmed: false, purpose: null })).toBe(false);
  });
  it('a held spark travels in the same member act; none is invented', () => {
    expect(pathBeginPatch({ path: essay, title: 'x', revisionsPausedConfirmed: false, purpose: 'the kitchen' }).purpose).toBe('the kitchen');
    expect('purpose' in pathBeginPatch({ path: essay, title: 'x', revisionsPausedConfirmed: false, purpose: null })).toBe(false);
  });
});

describe('F20 · the path frame comes from the registry by id', () => {
  it('names the path’s own question and keeps the door’s law', () => {
    const frame = pathFrameFor('college-essay')!;
    expect(frame).toContain('A moment that stays with me');
    for (const phrase of ['Do not write', 'Do not define', 'Plain text only', 'Am I hearing that right?']) {
      expect(frame).toContain(phrase);
    }
  });
  it('an unknown id has no frame', () => {
    expect(pathFrameFor('anything-else')).toBeNull();
  });
});
