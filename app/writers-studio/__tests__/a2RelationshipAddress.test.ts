import {
  CANVAS_RELATIONSHIP_PARAM,
  canvasWithEditorialThread,
  canvasWithoutEditorialThread,
  canvasWithRelationship,
  canvasWithoutRelationship,
  relationshipIdFrom,
} from '../canvasIdentity';
import { locationForSection } from '@/lib/writersStudio/placeInWork';

const BASE = '/writers-studio/rebuild';
const REL = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const THREAD = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

const queryOf = (href: string) =>
  new URLSearchParams(href.includes('?') ? href.slice(href.indexOf('?')) : '');

describe('A2 parent relationship address', () => {
  it('pins the canonical parameter name', () => {
    expect(CANVAS_RELATIONSHIP_PARAM).toBe('relationship');
  });

  it('has no fallback when no relationship is named', () => {
    expect(relationshipIdFrom(new URLSearchParams('m=manuscript'))).toBeNull();
  });

  it('round-trips the exact explicit relationship identity', () => {
    const href = canvasWithRelationship(BASE, '?m=manuscript&s=section', REL);
    expect(relationshipIdFrom(queryOf(href))).toBe(REL);
  });

  it('preserves manuscript, section and Editorial child-thread addresses', () => {
    const href = canvasWithRelationship(
      BASE,
      '?m=manuscript&s=section&editorialThread=' + encodeURIComponent(THREAD),
      REL,
    );
    const p = queryOf(href);
    expect(p.get('m')).toBe('manuscript');
    expect(p.get('s')).toBe('section');
    expect(p.get('editorialThread')).toBe(THREAD);
    expect(p.get('relationship')).toBe(REL);
  });

  it('section navigation preserves the exact parent', () => {
    const first = canvasWithRelationship(BASE, '?m=manuscript&s=one', REL);
    const moved = locationForSection(BASE, first.slice(first.indexOf('?')), 'two');
    const p = queryOf(moved);
    expect(p.get('s')).toBe('two');
    expect(p.get('relationship')).toBe(REL);
  });

  it('opening and clearing an Editorial child thread preserves the parent', () => {
    const parent = canvasWithRelationship(BASE, '?m=manuscript&s=section', REL);
    const withThread = canvasWithEditorialThread(
      BASE, parent.slice(parent.indexOf('?')), THREAD,
    );
    expect(queryOf(withThread).get('relationship')).toBe(REL);

    const withoutThread = canvasWithoutEditorialThread(
      BASE, withThread.slice(withThread.indexOf('?')),
    );
    expect(queryOf(withoutThread).get('relationship')).toBe(REL);
    expect(queryOf(withoutThread).get('editorialThread')).toBeNull();
  });

  it('leaving the parent removes only the parent address', () => {
    const href = canvasWithoutRelationship(
      BASE,
      '?m=manuscript&s=section&editorialThread=' + THREAD + '&relationship=' + REL,
    );
    const p = queryOf(href);
    expect(p.get('relationship')).toBeNull();
    expect(p.get('m')).toBe('manuscript');
    expect(p.get('s')).toBe('section');
    expect(p.get('editorialThread')).toBe(THREAD);
  });
});
