import fs from 'node:fs';
import path from 'node:path';

const HOME = fs.readFileSync(path.resolve(process.cwd(), 'app/home/page.tsx'), 'utf8');
const HOUSE = fs.readFileSync(path.resolve(process.cwd(), 'app/house/page.tsx'), 'utf8');
const THRESHOLD = fs.readFileSync(path.resolve(process.cwd(), 'app/house/MaiaThresholdLink.tsx'), 'utf8');

describe('Soullab home route authority', () => {
  it('/home renders the House experience as Home', () => {
    expect(HOME).toContain("import { HouseExperience } from '@/app/house/page';");
    expect(HOME).toContain('<HouseExperience current="home" />');
  });

  it('/house retains the same organism with House identity', () => {
    expect(HOUSE).toContain('<HouseExperience current="house" />');
  });

  it('House still opens the existing MAIA conversation route', () => {
    expect(THRESHOLD).toContain("router.push('/maia?from=house')");
    expect(THRESHOLD).not.toContain('/maia/encounter');
  });
});
