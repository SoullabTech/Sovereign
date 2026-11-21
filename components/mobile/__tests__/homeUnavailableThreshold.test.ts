/**
 * @jest-environment node
 *
 * Platform identity canon (2026-09-28): Home is the entrance and MAIA is entered
 * deliberately. In the iPhone app, where Home cannot run, the member is offered
 * MAIA as a choice. The app never opens the MAIA conversation on its own.
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(process.cwd(), 'components/mobile/MobileRouteGuard.tsx'), 'utf8');

function code(text: string): string {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map((line) => line.replace(/(^|\s)\/\/.*$/, '$1'))
    .join('\n');
}

describe('Home in the iPhone app', () => {
  const guard = code(source);

  it('does not open MAIA automatically', () => {
    expect(guard).not.toMatch(/router\.replace\(['"]\/maia/);
  });

  it('offers MAIA as a deliberate choice', () => {
    const screen = guard.slice(guard.indexOf('function HomeUnavailableScreen'), guard.indexOf('function OpenInWebScreen'));
    expect(screen).toContain('Continue to MAIA');
    expect(screen).toContain("router.push('/maia/encounter')");
    expect(screen).toContain('Open Home in your browser');
  });

  it('uses that screen for both Home routes', () => {
    expect(guard).toMatch(/pathname === '\/home' \|\| pathname === '\/house'/);
    expect(guard).toMatch(/if \(isNativeUnavailableHome\(pathname\)\) return <HomeUnavailableScreen/);
  });
});
