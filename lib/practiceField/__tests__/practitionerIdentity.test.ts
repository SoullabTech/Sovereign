/**
 * Practitioner identity — single-source invariant for Now What?.
 *
 * INVARIANT: every member-facing reference to the practitioner in a field
 * resolves from PracticeFieldContext.practitioner_name, reaching the UI only
 * through `practitionerIdentity`. No surface may carry its own literal, and a
 * missing configuration must render neutral copy rather than a guessed name.
 *
 * Structural assertions here carry the vacuity risk recorded in
 * [[project-journal-session-identity-gate]] — an assertion that also passes on
 * the pre-fix source proves nothing. The `control (pre-fix source)` block pins
 * that by asserting the guards FAIL on the real pre-fix file, read from git.
 */
import { execFileSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';
import { NEUTRAL_PRACTITIONER, practitionerDisplayName } from '../practitionerIdentity';

const ROOM = join(process.cwd(), 'components/now-what/NowWhatRoom.tsx');
const ROUTE = join(process.cwd(), 'app/api/now-what/field-note/route.ts');

/** Strip comments so historical prose naming the old literals cannot trip
 *  (or satisfy) a match. Only executable code is asserted on. */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

/** Pre-fix source of a path, straight from the deployed commit. */
function preFix(path: string): string {
  return execFileSync('git', ['show', `471bdf85c:${path}`], { encoding: 'utf8', maxBuffer: 20e6 });
}

const PRACTITIONER_LITERALS = [/Larry Closs/, /\bKelly\b/, /Larry&apos;s/, /Larry's/];

describe('practitionerDisplayName — neutral copy for a configuration gap', () => {
  it('returns the configured name when present', () => {
    expect(practitionerDisplayName('Larry Closs (Demo)')).toBe('Larry Closs (Demo)');
  });

  it('never manufactures an identity when unconfigured', () => {
    for (const empty of [null, undefined, '', '   ']) {
      expect(practitionerDisplayName(empty)).toBe(NEUTRAL_PRACTITIONER);
    }
  });

  it('neutral copy is not a person name', () => {
    expect(NEUTRAL_PRACTITIONER).toBe('your practitioner');
    for (const lit of PRACTITIONER_LITERALS) {
      expect(NEUTRAL_PRACTITIONER).not.toMatch(lit);
    }
  });

  it('changing configuration changes what is rendered', () => {
    expect(practitionerDisplayName('A. Coach')).not.toBe(practitionerDisplayName('B. Coach'));
  });
});

describe('NowWhatRoom — no practitioner literals remain', () => {
  const room = stripComments(readFileSync(ROOM, 'utf8'));

  it('carries no hard-coded practitioner name in executable code', () => {
    for (const lit of PRACTITIONER_LITERALS) {
      expect(room).not.toMatch(lit);
    }
  });

  it('resolves one name through the single source', () => {
    expect(room).toMatch(/import \{ practitionerDisplayName \} from '@\/lib\/practiceField\/practitionerIdentity'/);
    expect(room).toMatch(/const practitioner = practitionerDisplayName\(practitionerName\)/);
  });

  it('parameterises the consent frame rather than embedding a name', () => {
    expect(room).toMatch(/buildOpeningFrame = \(practitioner: string\)/);
    // The consent sentence must interpolate, twice — visible host and share target.
    const consent = room.match(/One thing to name clearly:[\s\S]*?choose to share\./)?.[0] ?? '';
    expect(consent).toContain('${practitioner} can accompany');
    expect(consent).toContain('Sharing any thread with ${practitioner}');
  });

  it('renders the resolved name at every member-facing site', () => {
    expect(room).toMatch(/Now What\? · with \{practitioner\}/);
    expect(room).toMatch(/This room holds \{practitioner\}&apos;s work/);
    expect(room).toMatch(/\{openingFrame\}/);
  });
});

describe('field-note GET — identity rides the existing wire', () => {
  const route = stripComments(readFileSync(ROUTE, 'utf8'));

  it('adds no new endpoint — resolution happens in the existing GET', () => {
    expect(route).toMatch(/resolvePractitionerName/);
    expect(route).toMatch(/practitionerIdentity\.server/);
  });

  it('preserves the existing threads + arrival contract', () => {
    expect(route).toMatch(/threads: res\.rows/);
    expect(route).toMatch(/arrival,?/);
    expect(route).toMatch(/practitionerName/);
  });

  it('treats resolution failure as non-fatal', () => {
    const block = route.match(/let practitionerName[\s\S]*?\n    \}/)?.[0] ?? '';
    expect(block).toMatch(/try \{/);
    expect(block).toMatch(/catch/);
  });
});

/**
 * CONTROL — proves the guards above discriminate. Run against the real
 * pre-fix files from the deployed commit, not a hand-written string.
 */
describe('control (pre-fix source at 471bdf85c)', () => {
  it('pre-fix room DOES contain practitioner literals', () => {
    const room = stripComments(preFix('components/now-what/NowWhatRoom.tsx'));
    const hits = PRACTITIONER_LITERALS.filter((l) => l.test(room));
    expect(hits.length).toBeGreaterThan(0);
  });

  it('pre-fix room names TWO different practitioners — the defect itself', () => {
    const room = stripComments(preFix('components/now-what/NowWhatRoom.tsx'));
    expect(room).toMatch(/Larry Closs/);
    expect(room).toMatch(/\bKelly\b/);
  });

  it('pre-fix route did NOT carry practitioner identity', () => {
    const route = stripComments(preFix('app/api/now-what/field-note/route.ts'));
    expect(route).not.toMatch(/practitionerName/);
  });
});
