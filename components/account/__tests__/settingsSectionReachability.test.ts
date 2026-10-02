import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(
  path.resolve(process.cwd(), 'components/account/AccountSettings.tsx'),
  'utf8',
);

describe('Settings section reachability', () => {
  it('does not gate section-detail mounting behind an AnimatePresence wait exit', () => {
    const contentStart = source.indexOf('/* Content');
    const internalStart = source.indexOf('/* Internal: VoiceController', contentStart);
    expect(contentStart).toBeGreaterThan(-1);
    expect(internalStart).toBeGreaterThan(contentStart);
    const contentBlock = source.slice(contentStart, internalStart);
    expect(contentBlock).not.toContain('<AnimatePresence mode="wait">');
    expect(contentBlock).toContain("activeSection === 'memory-consent'");
    expect(contentBlock).toContain('<MemoryConsentSection />');
  });
});
