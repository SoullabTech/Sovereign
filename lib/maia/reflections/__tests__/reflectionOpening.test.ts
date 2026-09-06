import fs from 'fs';
import path from 'path';
import {
  REFLECTION_OPENING_V1,
  buildReflectionOpeningAddendum,
  parseReflectionOpening,
  composeReflectionOpeningText,
} from '../reflectionOpening';

/**
 * reflection_opening_v1 — the nine required guarantees (2026-09-06).
 *
 * Behavioural where the unit is pure (the form contract itself). SOURCE
 * INVARIANTS where the property lives in a React component or a 2k-line route
 * and this repo has no renderer wired into jest — the same instrument, and the
 * same caveat, as lib/maia/presence/__tests__/injection.test.ts. They pin the
 * properties that would break if the wiring were rewritten, which is the
 * regression that matters; they are weaker than a render/integration test and
 * should be replaced by one if that becomes available.
 */

const root = path.join(__dirname, '../../../..');
const routeSource = fs.readFileSync(
  path.join(root, 'app/api/sovereign/app/maia/list/route.ts'), 'utf8');
const discussSource = fs.readFileSync(
  path.join(root, 'components/reflections/DiscussWithMaia.tsx'), 'utf8');
const serviceSource = fs.readFileSync(
  path.join(root, 'lib/sovereign/maiaService.ts'), 'utf8');

/** Assert on CODE, not on prose that describes it. */
function code(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map(line => line.replace(/(^|\s)\/\/.*$/, '$1'))
    .join('\n');
}

const GOOD = 'NOTICED: The entry stops mid-scene.\nASKED: What happened when you got there?';

describe('R1 — a client cannot override reflection_opening_v1', () => {
  it('the form instruction is built server-side from a constant, not read from the request', () => {
    const c = code(routeSource);
    expect(c).toMatch(/reflectionOpeningAddendum\s*=\s*isReflectionOpeningSeam[\s\S]{0,80}buildReflectionOpeningAddendum\(\)/);
    // The addendum is never taken from the caller.
    expect(c).not.toMatch(/reflectionOpeningAddendum\s*[:=]\s*\(meta as any\)/);
  });

  it('the server-authored field is placed AFTER the client rest-spread (PBR-001)', () => {
    const c = code(routeSource);
    const spread = c.indexOf('...meta,');
    const field = c.indexOf('reflectionOpeningAddendum,', spread);
    expect(spread).toBeGreaterThan(-1);
    expect(field).toBeGreaterThan(spread);
  });

  it('the caller may only SIGNAL the seam, and the signal alone is not enough', () => {
    const c = code(routeSource);
    // The flag is a boolean request...
    expect(c).toMatch(/reflectionOpeningRequested\s*=\s*\(meta as any\)\?\.reflectionOpening === true/);
    // ...and recognition additionally requires the validated place.
    expect(c).toMatch(/isReflectionOpeningSeam[\s\S]{0,200}placeContextValidated\?\.placeId === 'reflections'/);
    expect(c).toMatch(/isReflectionOpeningSeam[\s\S]{0,240}placeContextValidated\?\.objectId/);
  });

  it('the service reads the addendum only from the server-populated meta field', () => {
    expect(code(serviceSource)).toMatch(/reflectionOpeningAddendum = \(meta as any\)\?\.reflectionOpeningAddendum/);
  });
});

describe('R2 — the UI never derives noticed/asked by splitting prose', () => {
  it('labels render only from the server-returned structured fields', () => {
    const c = code(discussSource);
    expect(c).toMatch(/data\?\.reflectionOpening/);
    expect(c).toMatch(/opening\?\.noticed && opening\?\.asked/);
  });

  it('no client-side parsing of the reply text exists', () => {
    const c = code(discussSource);
    // Any split/regex/indexOf over `message` would be the attribution defect.
    expect(c).not.toMatch(/data\.message[\s\S]{0,40}(split|match|indexOf|slice)/);
    expect(c).not.toMatch(/NOTICED:/);
    expect(c).not.toMatch(/ASKED:/);
  });
});

describe('R3 — noticed + asked are both present before labels render', () => {
  it('parses only when both parts are genuinely there', () => {
    expect(parseReflectionOpening(GOOD)).toEqual({
      noticed: 'The entry stops mid-scene.',
      asked: 'What happened when you got there?',
    });
  });

  it('FAILS TRUTHFULLY rather than coercing a partial or prose reply', () => {
    // No fallback: prose is never labelled.
    expect(parseReflectionOpening('You have come back to this one. That usually means something.')).toBeNull();
    expect(parseReflectionOpening('NOTICED: The entry stops mid-scene.')).toBeNull();
    expect(parseReflectionOpening('ASKED: What happened?')).toBeNull();
    expect(parseReflectionOpening('NOTICED:   \nASKED: What happened?')).toBeNull();
    expect(parseReflectionOpening('NOTICED: It stops.\nASKED:   ')).toBeNull();
    expect(parseReflectionOpening('ASKED: What happened?\nNOTICED: It stops.')).toBeNull();
    expect(parseReflectionOpening(null)).toBeNull();
    expect(parseReflectionOpening('')).toBeNull();
  });

  it('"asked" must actually be a question, or the label would be false', () => {
    expect(parseReflectionOpening('NOTICED: It stops.\nASKED: Tell me what happened.')).toBeNull();
  });

  it('the route renders null rather than a partial when the form did not come back', () => {
    const c = code(routeSource);
    expect(c).toMatch(/reflectionOpening = isReflectionOpeningSeam[\s\S]{0,60}parseReflectionOpening\(sovereignText\)[\s\S]{0,20}: null/);
    expect(c).toMatch(/reflectionOpening: reflectionOpening[\s\S]{0,200}: null/);
  });

  it('the client says so instead of labelling an unstructured reply', () => {
    const c = code(discussSource);
    expect(c).toMatch(/setNoticing\(null\)/);
  });
});

describe('R4 — the first response is durable in the canonical thread', () => {
  it('the composed form becomes the persisted assistant text', () => {
    const c = code(routeSource);
    const compose = c.indexOf('sovereignText = composeReflectionOpeningText(reflectionOpening)');
    const persist = c.indexOf('content: sovereignText,');
    expect(compose).toBeGreaterThan(-1);
    // Composition happens BEFORE the durable write, so the thread carries the
    // same content the page displayed.
    expect(persist).toBeGreaterThan(compose);
  });

  it('the durable text carries no machine markers', () => {
    const text = composeReflectionOpeningText({ noticed: 'It stops.', asked: 'What happened?' });
    expect(text).not.toMatch(/NOTICED:|ASKED:/);
    expect(text).toContain('It stops.');
    expect(text).toContain('What happened?');
  });
});

describe('R5 + R6 — Continue performs zero generation and zero injection', () => {
  it('Continue opens presence with no argument', () => {
    expect(code(discussSource)).toMatch(/presence\.openMaia\(\)/);
  });

  it('Continue never injects — openMaiaWith is absent from this component', () => {
    expect(code(discussSource)).not.toMatch(/openMaiaWith/);
  });

  it('Continue issues no second POST', () => {
    const c = code(discussSource);
    expect(c.match(/fetch\('\/api\/sovereign\/app\/maia\/list'/g) || []).toHaveLength(1);
  });
});

describe('R7 — the same exchange survives inline -> sheet', () => {
  it('the sheet is opened only after the exchange exists', () => {
    const c = code(discussSource);
    expect(c).toMatch(/sent && presence\?\.canHost/);
    expect(c).toMatch(/setSent\(true\)/);
  });

  it('one member act mints one canonical exchange identity', () => {
    // The route still passes its single server-authored exchangeId; nothing in
    // this seam mints a second.
    expect(code(routeSource)).toMatch(/exchangeId,\n\s*\},/);
  });
});

describe('R8 — the existing Reflections threshold and editor remain intact', () => {
  it('the member still sees and can edit exactly what travels', () => {
    const c = code(discussSource);
    expect(c).toMatch(/What MAIA will receive/);
    expect(c).toMatch(/<textarea/);
    expect(c).toMatch(/setMessage\(e\.target\.value\)/);
  });

  it('the openings remain the member\'s questions', () => {
    expect(code(discussSource)).toMatch(/const OPENINGS/);
  });

  it('the unhosted fallback still moves the member with a way back', () => {
    const c = code(discussSource);
    expect(c).toMatch(/if \(presence\?\.canHost\)/);
    expect(c).toMatch(/returnTo: `\/reflections\/\$\{capsule\.id\}`/);
  });
});

describe('R9 — full /maia behaviour is unchanged', () => {
  it('everything in this seam is gated on the seam being recognised', () => {
    const c = code(routeSource);
    // Addendum, parse and response field are all conditional. A turn that is
    // not the Reflections handoff sees no form instruction and gets null.
    expect(c).toMatch(/reflectionOpeningAddendum = isReflectionOpeningSeam/);
    expect(c).toMatch(/reflectionOpening = isReflectionOpeningSeam/);
  });

  it('the prompt addendum is absent unless the route populated it', () => {
    expect(code(serviceSource)).toMatch(/\$\{reflectionOpeningAddendum \? '\\n\\n' \+ reflectionOpeningAddendum : ''\}/);
  });

  it('form identity is a constant, not a free string', () => {
    expect(REFLECTION_OPENING_V1).toBe('reflection_opening_v1');
    expect(buildReflectionOpeningAddendum()).toContain('reflection_opening_v1');
  });
});

describe('HARD STOP — CMT-01 was not touched', () => {
  it('this seam imports nothing from the canonical-turn lane', () => {
    // code(), not raw: the module's own header NAMES the lane it must not touch.
    // Matching prose here would fail the check it describes, and deleting the
    // comment would "fix" it.
    const mod = code(fs.readFileSync(path.join(__dirname, '../reflectionOpening.ts'), 'utf8'));
    expect(mod).not.toMatch(/canonical-turn/);
    expect(mod).not.toMatch(/constructCanonicalTurn|producerRegistry|adjudicateParticipation/);
  });
});
