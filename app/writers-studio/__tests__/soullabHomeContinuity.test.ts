import fs from 'node:fs';
import path from 'node:path';

const read = (rel: string) => fs.readFileSync(path.join(process.cwd(), rel), 'utf8');

describe("Writer's Studio continuity with Soullab Home", () => {
  const home = read('app/writers-studio/HomeView.tsx');
  const shell = read('app/writers-studio/studio/WriterStudioShell.tsx');
  const flagship = read('app/writers-studio/flagship/StudioChrome.tsx');

  it('Studio Home always offers a quiet return to Soullab Home', () => {
    expect(home).toContain('href="/home"');
    expect(home).toContain('← Soullab Home');
    expect(home).toContain('aria-label="Return to Soullab Home"');
    expect(home).not.toContain('href="/house"');
    expect(home).not.toContain('← House');
  });

  it('standard manuscript chrome distinguishes Soullab Home from Studio Home', () => {
    expect(shell).toContain('href="/home"');
    expect(shell).toContain('Return to Soullab Home');
    expect(shell).toContain('href="/writers-studio"');
    expect(shell).toContain('Return to Writer’s Studio Home');
  });

  it('flagship manuscript rail uses its existing mark as the Soullab Home door', () => {
    expect(flagship).toContain('<a className="fs-mark" href="/home" aria-label="Return to Soullab Home" />');
  });
});
