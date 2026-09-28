import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const settings = fs.readFileSync(path.join(root, 'components/account/AccountSettings.tsx'), 'utf8');
const page = fs.readFileSync(path.join(root, 'app/account/settings/page.tsx'), 'utf8');

describe('Account Settings returns to Soullab Home', () => {
  it('returns top-level Settings to canonical Home', () => {
    expect(settings).toContain("window.location.href = '/home'");
    expect(settings).not.toContain("window.location.href = '/maia'");
  });

  it('identifies the room as Soullab rather than MAIA platform chrome', () => {
    expect(page).toContain("title: 'Account Settings | Soullab'");
    expect(page).not.toContain("title: 'Account Settings | MAIA'");
  });
});
