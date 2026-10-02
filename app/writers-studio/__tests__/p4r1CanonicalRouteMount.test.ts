import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const proxy = fs.readFileSync(path.join(ROOT, 'proxy.ts'), 'utf8');

describe('P4R1 canonical route mount', () => {
  it('mounts compatibility redirects only for equivalent legacy Write and Develop doors', () => {
    expect(proxy).toContain("import { canonicalStudioRoute } from './lib/writersStudio/canonicalStudioRoute'");
    expect(proxy).toContain("pathname === '/writers-studio/rebuild' || pathname === '/writers-studio/develop'");
    expect(proxy).toContain('canonicalStudioRoute(pathname, req.nextUrl.search)');
    expect(proxy).toContain('NextResponse.redirect(new URL(decision.href, req.url))');
  });

  it('does not broadly redirect Canvas, Source Intake, or historical Review', () => {
    const start = proxy.indexOf("/* Writer's Studio convergence.");
    const end = proxy.indexOf('const response = forwardSanitized', start);
    const slice = proxy.slice(start, end);
    expect(slice).not.toContain("'/writers-studio/canvas'");
    expect(slice).not.toContain("'/writers-studio/sources'");
    expect(slice).not.toContain("'/writers-studio/review'");
  });
});
