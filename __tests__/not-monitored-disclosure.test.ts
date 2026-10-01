import { readFileSync } from 'fs';
import { join } from 'path';

const W = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

/** SAFETY-CRISIS-01 Option A: members are told plainly that no person is watching. */
describe('Option A disclosure', () => {
  it('the notice says no person monitors and names 988, 741741 and 911', () => {
    const notice = W('components/safety/NotMonitoredNotice.tsx');
    expect(notice).toContain('not monitored by a person');
    expect(notice).toContain('stored so MAIA can remember context');
    // The overstated claim must not return until the architecture supports it.
    expect(notice).not.toMatch(/conversations are private/i);
    expect(notice).toContain('no one will be notified');
    for (const n of ['988', 'HOME to 741741', '911']) expect(notice).toContain(n);
    // If storage is unavailable the notice must SHOW, never be skipped.
    expect(notice).toMatch(/catch \{\n\s*return false;/);
  });

  it('the notice is mounted on the MAIA conversation surface', () => {
    const page = W('app/maia/page.tsx');
    const enc = page.slice(page.indexOf('export function MaiaEncounterPage'));
    expect(enc).toContain('<NotMonitoredNotice />');
  });

  it('the terms carry a "Not an Emergency Service" section', () => {
    const terms = W('app/terms/page.tsx');
    expect(terms).toContain('Not an Emergency Service');
    expect(terms).toContain('is not monitored by any person');
    expect(terms).toContain('will not contact anyone, including emergency');
  });
});
