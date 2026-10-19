/**
 * P0 public discovery source contract. Strictly no private member/test data.
 * Does not claim human acceptance, physical Safari, CI, or production release.
 */
import { readFileSync } from 'fs';
import path from 'path';
import { PUBLIC_DOORWAYS, publicDoorwayForSlug } from '../publicDoorwaysP0';
import { matchRule, checkAccess } from '@/config/accessMatrix';

const expected = [
  'writers-studio', 'pro-studio', 'astrology-pro', 'maia', 'ain-os',
  'sound-resonance', 'elemental-academy',
];

const src = (relative: string) =>
  readFileSync(path.join(process.cwd(), relative), 'utf8');

describe('P0 public discovery: mutually independent, public-only doors', () => {
  it('has exactly the seven governed doors and no duplicates', () => {
    const slugs = PUBLIC_DOORWAYS.map((p) => p.slug);
    expect(slugs).toEqual(expected);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it.each(expected)('%s is public by exact rule for a signed-out visitor', (slug) => {
    const path = '/explore/' + slug;
    expect(matchRule(path)).toMatchObject({ exact: path, public: true });
    expect(checkAccess(path, 'free', [], false).allowed).toBe(true);
    expect(publicDoorwayForSlug(slug)).toBeDefined();
  });

  it('root discovery is publicly reachable without account credentials', () => {
    expect(matchRule('/explore')).toMatchObject({ exact: '/explore', public: true });
    expect(checkAccess('/explore', 'free', [], false).allowed).toBe(true);
  });

  it('refuses to give arbitrary nested discovery paths explicit public standing', () => {
    for (const suspect of [
      '/explore/private', '/explore/admin', '/explore/writers-studio/delete',
      '/explore/maia/encounter', '/explore/ain-os/download',
    ]) {
      expect(matchRule(suspect)?.public).not.toBe(true);
      expect(publicDoorwayForSlug(suspect.replace('/explore/',''))).toBeUndefined();
    }
  });

  it('leaves the protected workspaces and API routes unauthenticated-deny', () => {
    for (const protectedPath of [
      '/writers-studio', '/studio', '/maia/encounter',
      '/api/studio/files', '/api/studio/calendar/events',
    ]) {
      expect(matchRule(protectedPath)?.public).not.toBe(true);
      expect(checkAccess(protectedPath, 'free', [], false).allowed).toBe(false);
    }
  });

  it.each(PUBLIC_DOORWAYS)('$slug includes availability and disclosure limits', (door) => {
    expect(door.audience.length).toBeGreaterThan(16);
    expect(door.headline.length).toBeGreaterThan(10);
    expect(door.invitations).toHaveLength(3);
    expect(door.introduction.length).toBeGreaterThan(80);
    expect(door.statusDetail.length).toBeGreaterThan(40);
    expect(door.limitation.length).toBeGreaterThan(75);
    expect(/preview|development|research|public introduction/i.test(door.status)).toBe(true);
  });

  it('does not misrepresent AIN OS as an available licensed download', () => {
    const ain = publicDoorwayForSlug('ain-os');
    expect(ain?.status).toContain('Research');
    expect(ain?.limitation).toContain('not a claim');
    expect(ain?.limitation).toContain('open-source');
  });

  it('clinical processing and private manuscripts remain visibly held', () => {
    expect(publicDoorwayForSlug('pro-studio')?.limitation).toContain('not publicly qualified');
    expect(publicDoorwayForSlug('writers-studio')?.limitation).toContain('Do not submit manuscripts');
    expect(publicDoorwayForSlug('astrology-pro')?.limitation).toContain('not received final public release approval');
  });

  it('public discovery has no uncontrolled forms, upload or model request path', () => {
    const root = src('app/explore/page.tsx');
    const leaf = src('app/explore/[slug]/page.tsx');
    for (const text of [root, leaf]) {
      expect(text).not.toMatch(/<form\b|<input\b|<textarea\b|request\.json|fetch\(|apiFetch|generateSimple|query\(/);
    }
    expect(leaf).toContain('dynamicParams = false');
    expect(root).toContain('index: false');
    expect(leaf).toContain('index: false');
  });

  it('links into discovery without replacing canonical /home entry', () => {
    const home = src('app/home/HomeThreshold.tsx');
    const landing = src('components/landing/PlatformSection.tsx');
    expect(home).toContain('href="/signup?next=/home"');
    expect(home).toContain('href="/signin?next=/home"');
    expect(home).toContain('href="/explore"');
    expect(landing).toContain('href="/home"');
    expect(landing).toContain('href="/explore"');
  });

  it('keeps a closed explicit ACL and does not add a wildcard', () => {
    const matrix = src('config/accessMatrix.ts');
    expect(matrix).not.toMatch(/\{\s*prefix:\s*['"]\/explore/);
    expect(matrix).not.toMatch(/\{\s*regex:\s*\/\^\\\/explore/);
  });
});
