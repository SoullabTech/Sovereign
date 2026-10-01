import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const page = fs.readFileSync(path.join(root, 'app/admin/beta-testers/page.tsx'), 'utf8');
const legacy = fs.readFileSync(path.join(root, 'app/labtools/admin/beta-testers/page.tsx'), 'utf8');

describe('authoritative beta tester dashboard', () => {
  it('reads the guarded server roster rather than browser-local beta authority', () => {
    expect(page).toContain("adminFetch('/api/admin/beta-testers'");
    expect(page).not.toContain("localStorage.getItem('maia_beta_testers')");
    expect(page).not.toContain("localStorage.setItem('maia_beta_testers')");
  });

  it('states that ordinary platform access and Early Field are separate authorities', () => {
    expect(page).toContain('Beta access and Early Field are separate');
    expect(page).toContain('Subscription does not gate this');
    expect(page).toContain('Ordinary Living Field');
  });

  it('collapses the old Lab Tools duplicate into the canonical admin surface', () => {
    expect(legacy).toContain("redirect('/admin/beta-testers')");
    expect(legacy).not.toContain('maia_beta_testers');
  });
});
