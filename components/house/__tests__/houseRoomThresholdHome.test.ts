import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(
  path.join(process.cwd(), 'components/house/HouseRoomThreshold.tsx'),
  'utf8',
);

describe('HouseRoomThreshold canonical Home return', () => {
  it('returns facet rooms to canonical Soullab Home', () => {
    expect(source).toContain('href="/home"');
    expect(source).toContain('Return Home →');
    expect(source).toContain('Return to Soullab Home');
  });

  it('does not send facet returns through the legacy /house route', () => {
    expect(source).not.toContain('href="/house"');
    expect(source).not.toContain('Return to House');
  });

  it('presents Home as the orienting context rather than the old House label', () => {
    expect(source).toContain('<span>HOME</span>');
    expect(source).not.toContain('<span>THE HOUSE</span>');
  });
});
