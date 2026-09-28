import fs from 'node:fs';
import path from 'node:path';

const HOME = fs.readFileSync(path.resolve(process.cwd(), 'app/home/page.tsx'), 'utf8');
const HOUSE = fs.readFileSync(path.resolve(process.cwd(), 'app/house/page.tsx'), 'utf8');
const THRESHOLD = fs.readFileSync(path.resolve(process.cwd(), 'app/house/MaiaThresholdLink.tsx'), 'utf8');

describe('Soullab home route authority', () => {
  it('/home is the canonical Soullab entrance: threshold when signed out, House when signed in', () => {
    expect(HOME).toContain("import { HouseExperience } from '@/app/house/page';");
    expect(HOME).toContain("import { HomeThreshold } from './HomeThreshold';");
    expect(HOME).toContain("if (!(await hasAuthenticatedMember())) return <HomeThreshold />;");
    expect(HOME).toContain('<HouseExperience current="home" />');
  });

  it('/house retains the same organism with House identity', () => {
    expect(HOUSE).toContain('<HouseExperience current="house" />');
  });

  it('Home opens the explicit MAIA encounter route, never bare /maia', () => {
    expect(THRESHOLD).toContain("router.push('/maia/encounter?from=home')");
    expect(THRESHOLD).not.toContain("router.push('/maia?from=house')");
  });
});
