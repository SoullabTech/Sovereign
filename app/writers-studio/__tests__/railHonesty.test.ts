import { readFileSync } from 'fs';
import { join } from 'path';
import { STUDIO_MAP, visibleDestinations } from '../studioMap';

const source = readFileSync(
  join(process.cwd(), 'app/writers-studio/rebuild/RebuildStudioClient.tsx'),
  'utf8',
);

describe('D2 · the rebuilt rail tells the truth', () => {
  it('does not render destination-shaped rows for unavailable places', () => {
    expect(source).not.toContain("['Manuscript', 'Materials', 'Notes', 'Versions', 'Goals']");
    expect(source).not.toContain("x === 'Versions' ? '5'");
    expect(source).not.toContain("x === 'Materials' ? '0'");
  });

  it('keeps the real manuscript outline rather than replacing it with another rail', () => {
    expect(source).toContain('data-workbench-scope="manuscript"');
    expect(source).toContain('OUTLINE');
    expect(source).toContain('<OutlineBranch');
  });

  it('member-visible Studio destinations are actionable destinations only', () => {
    const groups = visibleDestinations(true, STUDIO_MAP);
    const destinations = groups.flatMap((group) => group.destinations);
    expect(destinations.length).toBeGreaterThan(0);
    for (const destination of destinations) {
      expect(destination.availability).toBe('available');
      expect(destination.href).toBeTruthy();
    }
    expect(destinations.some((destination) => destination.id === 'materials')).toBe(false);
    expect(destinations.some((destination) => destination.id === 'versions')).toBe(false);
  });
});
