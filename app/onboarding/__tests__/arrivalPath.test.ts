/**
 * First-run path — pinned at the source.
 *
 * WHY: the legacy path (ten philosophical lenses -> birth data -> elemental
 * lesson -> /choose) was the live first experience for every new member. This
 * guard fails if any part of it returns to the first-run route, and if the
 * returning-member invariant or the canonical completion mechanism is broken.
 *
 * Comments are stripped before every check, so a docstring recording the old
 * flow cannot satisfy or trip the guard.
 *
 * NOT PROVEN HERE: rendering, navigation timing, production behavior. Source
 * shape only; the runtime walk is the acceptance test.
 */
import { readFileSync } from 'fs';
import path from 'path';

const REPO = path.resolve(__dirname, '../../..');
const read = (rel: string) => readFileSync(path.join(REPO, rel), 'utf8');
const strip = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

const onboarding = strip(read('app/onboarding/page.tsx'));
const auth = strip(read('components/auth/UnifiedAuth.tsx'));
const arrival = strip(read('components/arrival/ArrivalThreshold.tsx'));

describe('the legacy first-run experience is gone', () => {
  it('does not mount the legacy welcome flow', () => {
    expect(onboarding).not.toMatch(/CompleteWelcomeFlow/);
  });

  it('mounts the ruled Arrival threshold instead', () => {
    expect(onboarding).toMatch(/ArrivalThreshold/);
  });

  it('asks for no birth data and teaches no elemental lesson', () => {
    const surface = (onboarding + arrival).toLowerCase();
    for (const banned of ['birthdata', 'birth date', 'birthdate', 'sagetealwelcome', 'consciousnesspreparation']) {
      expect(surface).not.toContain(banned);
    }
  });
});

describe('the ruled spine', () => {
  it('asks what is asking for your attention', () => {
    expect(arrival).toMatch(/What is asking for your attention\?/);
  });

  it('offers one doorway set and a first-class way in for someone unsure', () => {
    expect(arrival).toMatch(/DOORWAYS/);
    expect(arrival).toMatch(/DOORWAY_UNSURE/);
  });

  it('does not re-ask the name already given at signup', () => {
    expect(arrival).not.toMatch(/What should MAIA call you/);
    expect(auth).toMatch(/Your name|placeholder="Your name"/);
  });

  it('ends at MAIA, not at the legacy fork', () => {
    expect(onboarding).toMatch(/router\.push\('\/maia'\)/);
    expect(onboarding).not.toMatch(/router\.push\('\/choose'\)/);
  });
});

describe('invariants that must not move', () => {
  it('still marks onboarding complete through the canonical server mechanism', () => {
    expect(onboarding).toMatch(/\/api\/members\/progress/);
    expect(onboarding).toMatch(/complete:\s*true/);
  });

  it('returning onboarded members are still sent to MAIA, never to Arrival', () => {
    expect(auth).toMatch(/onboarded\s*\?\s*`\/maia/);
    expect(onboarding).toMatch(/userData\.onboarded/);
  });

  it('a member arriving with a poisoned local id is still sent to re-authenticate', () => {
    expect(onboarding).toMatch(/local_/);
    expect(onboarding).toMatch(/router\.push\('\/signin'\)/);
  });
});

describe('the first contact can actually be seen (MLX-06 Unit 3B)', () => {
  const oracle = strip(read('components/OracleConversation.tsx'));

  it('gives a first contact that answers an arrival a visible turn id', () => {
    expect(oracle).toMatch(/firstContactId\(Boolean\(arrivalContext\)/);
  });

  it('filters the transcript through the named, tested predicate', () => {
    expect(oracle).toMatch(/\.filter\(isMemberVisibleTurn\)/);
    expect(oracle).not.toMatch(/\.filter\(m => !m\.id\?\.startsWith\('greeting-'\)\)/);
  });
});

describe('the arrival context stays session-scoped (MLX-R3)', () => {
  const ctx = strip(read('lib/maia/arrivalContext.ts'));

  it('uses sessionStorage and never localStorage', () => {
    expect(ctx).toMatch(/sessionStorage/);
    expect(ctx).not.toMatch(/localStorage/);
  });

  it('never writes spiral state or any durable member fact', () => {
    expect(ctx).not.toMatch(/member_spiral_state|INSERT|UPDATE\s+members/i);
  });

  it('keeps the member’s words off the URL', () => {
    expect(ctx).not.toMatch(/searchParams|URLSearchParams|encodeURIComponent/);
  });
});
