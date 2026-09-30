import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const layout = fs.readFileSync(path.join(root, 'app/writers-studio/layout.tsx'), 'utf8');
const threshold = fs.readFileSync(path.join(root, 'components/house/HouseEntryThreshold.tsx'), 'utf8');
const roomThreshold = fs.readFileSync(path.join(root, 'components/house/HouseRoomThreshold.tsx'), 'utf8');

describe('H1-R3 — Writer Studio → House return', () => {
  it('reuses the canonical House threshold at the Studio outer boundary', () => {
    expect(layout).toContain("import { HouseEntryThreshold } from '@/components/house/HouseEntryThreshold';");
    expect(layout).toContain('<HouseEntryThreshold room="WRITER\'S STUDIO" />');
  });

  it('shows the threshold only for explicit House entry provenance', () => {
    expect(threshold).toContain("searchParams?.get('from') !== 'house'");
  });

  it('returns through canonical Home rather than the legacy House route', () => {
    expect(roomThreshold).toContain('href="/home"');
    expect(roomThreshold).toContain('Return Home →');
    expect(roomThreshold).not.toContain('href="/house"');
  });

  it('does not introduce a crossing or persistence seam', () => {
    expect(layout).not.toContain('member_facet_crossings');
    expect(layout).not.toContain('FacetCrossing');
    expect(layout).not.toContain('sessionStorage');
    expect(layout).not.toContain('localStorage');
  });
});
