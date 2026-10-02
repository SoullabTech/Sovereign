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

  // H1-close-2 (2026-09-30), layered: Home is the place and the return action;
  // THE HOUSE names the containing whole on the threshold. Supersedes the
  // 2026-09-28 assertion that the label read HOME — the route, return copy and
  // aria above are unchanged, and "Return to House" stays forbidden.
  it('labels the threshold as the containing whole while returning Home', () => {
    expect(source).toContain('<span>THE HOUSE</span>');
    expect(source).not.toContain('<span>HOME</span>');
    expect(source).toContain('Return Home →');
  });
});
