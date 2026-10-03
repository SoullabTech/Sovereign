import fs from 'node:fs';
import path from 'node:path';
import {
  CANONICAL_STUDIO_PATH,
  canonicalStudioRoute,
} from '@/lib/writersStudio/canonicalStudioRoute';
import { unifiedModeFrom } from '@/app/dev/writers-studio-p4r1/P4R1StudioHost';

const ROOT = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const paramsOf = (href: string) => {
  const q = href.indexOf('?');
  return new URLSearchParams(q >= 0 ? href.slice(q + 1) : '');
};

describe('C3 canonical route compatibility', () => {
  it('canonical root is mounted on the unified host with Home as its default', () => {
    const page = read('app/writers-studio/page.tsx');
    expect(page).toContain("P4R1StudioHost");
    expect(page).toContain('defaultMode="home"');
    expect(page).toContain("title: 'Writer’s Studio · Soullab'");
    expect(page).not.toContain('REBUILD_HREF');

    expect(canonicalStudioRoute('/writers-studio', '')).toEqual({
      kind: 'canonical',
      href: '/writers-studio?mode=home',
      mode: 'home',
      from: '/writers-studio',
    });
    expect(canonicalStudioRoute('/writers-studio', '?mode=develop&m=m1')).toMatchObject({
      kind: 'canonical',
      mode: 'develop',
    });
    expect(unifiedModeFrom(null, 'home')).toBe('home');
    expect(unifiedModeFrom('nonsense', 'home')).toBe('home');
  });

  it('legacy Rebuild becomes unified Write without losing exact addresses', () => {
    const old =
      '?m=m1&s=s22&editorialThread=t9&insightReading=r7&insightObservation=o3'
      + '&insightAction=focus&reviewRun=rr1&reviewFinding=rf2&appearance=night';
    const decision = canonicalStudioRoute('/writers-studio/rebuild', old);
    expect(decision.kind).toBe('canonical');
    if (decision.kind !== 'canonical') return;

    expect(decision.href.startsWith(CANONICAL_STUDIO_PATH + '?')).toBe(true);
    const p = paramsOf(decision.href);
    expect(p.get('mode')).toBe('write');
    expect(p.get('m')).toBe('m1');
    expect(p.get('s')).toBe('s22');
    expect(p.get('editorialThread')).toBe('t9');
    expect(p.get('insightReading')).toBe('r7');
    expect(p.get('insightObservation')).toBe('o3');
    expect(p.get('insightAction')).toBe('focus');
    expect(p.get('reviewRun')).toBe('rr1');
    expect(p.get('reviewFinding')).toBe('rf2');
    expect(p.get('appearance')).toBe('night');
  });

  it('legacy Develop becomes unified Develop without losing Work/place/reading', () => {
    const decision = canonicalStudioRoute(
      '/writers-studio/develop',
      '?m=m1&s=s22&r=reading-7&developField=continuity&developIntent=thread',
    );
    expect(decision.kind).toBe('canonical');
    if (decision.kind !== 'canonical') return;
    const p = paramsOf(decision.href);
    expect(p.get('mode')).toBe('develop');
    expect(p.get('m')).toBe('m1');
    expect(p.get('s')).toBe('s22');
    expect(p.get('r')).toBe('reading-7');
    expect(p.get('developField')).toBe('continuity');
    expect(p.get('developIntent')).toBe('thread');
  });

  it('does not reinterpret historical structure-proposal Review as saved Review', () => {
    expect(canonicalStudioRoute('/writers-studio/review', '?m=m1&p=proposal-4')).toEqual({
      kind: 'retain-legacy',
      href: '/writers-studio/review?m=m1&p=proposal-4',
      reason: 'structure-proposal-review-is-not-saved-review',
    });
  });

  it('keeps Canvas and Source Intake separate until separately retired', () => {
    expect(canonicalStudioRoute('/writers-studio/canvas', '?m=m1')).toMatchObject({
      kind: 'retain-legacy',
      reason: 'canvas-has-distinct-semantics',
    });
    expect(canonicalStudioRoute('/writers-studio/sources', '')).toMatchObject({
      kind: 'retain-legacy',
      reason: 'source-intake-is-auxiliary',
    });
  });

  it('unified Write reads exact editorialThread addresses through the existing strict binder', () => {
    const write = read('app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx');
    expect(write).toContain('editorialThreadIdFrom,');
    expect(write).toContain('canvasWithEditorialThread,');
    expect(write).toContain('canvasWithoutEditorialThread,');
    expect(write).toContain('const requestedEditorialThread = params ? editorialThreadIdFrom(params) : null;');
    expect(write).toContain('readBoundEditorialThread(requestedEditorialThread, focusId)');
    expect(write).toContain('bindEditorialThread(out.thread)');
    expect(write).toContain('canvasWithEditorialThread(');
    expect(write).toContain('canvasWithoutEditorialThread(');
    expect(write).toContain('window.history.replaceState(');
    expect(write).toContain('setWorkspaceOpen(true)');
    expect(write).toContain('The revision conversation named by this link could not be resumed at this place.');
  });
});
