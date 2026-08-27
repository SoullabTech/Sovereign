import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { intakeMessage, type IntakeStage } from '../intakeReason';

const STAGES: IntakeStage[] = ['read', 'cuts', 'save'];

describe('intakeMessage — what the member is told when intake stops', () => {
  /* The product rule, asserted rather than asserted-about:
     if intake refuses, the member is told where it stopped and why. */

  it("repeats the server's own words when there are any", () => {
    expect(intakeMessage('save', 400, { error: 'too many sections (max 400)' })).toBe(
      'too many sections (max 400)',
    );
    expect(
      intakeMessage('read', 413, { error: 'File too large (25 MB max)' }),
    ).toBe('File too large (25 MB max)');
  });

  it('never answers with nothing, at any stage, for any status', () => {
    for (const stage of STAGES) {
      for (const status of [0, 400, 401, 413, 415, 422, 500, 502]) {
        for (const body of [undefined, null, {}, { error: '' }, { error: '   ' }, { error: 7 }]) {
          const msg = intakeMessage(stage, status, body as never);
          expect(msg.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('names the stage that stopped when the server said nothing', () => {
    expect(intakeMessage('read', 500, {})).toContain('reading that file');
    expect(intakeMessage('cuts', 500, {})).toContain('reading the cuts in that text');
    expect(intakeMessage('save', 500, {})).toContain('saving your manuscript');
  });

  it('carries the status when there is no message to carry instead', () => {
    expect(intakeMessage('cuts', 502, {})).toContain('HTTP 502');
  });

  it('distinguishes a refusal from a Press that was never reached', () => {
    /* Different facts about the world, different next moves. */
    expect(intakeMessage('read', 0, {})).toContain('could not reach the Press');
    expect(intakeMessage('read', 500, {})).not.toContain('could not reach');
  });

  it('tells the member nothing was lost, because they cannot see that themselves', () => {
    expect(intakeMessage('read', 500, {})).toContain('your file is unchanged');
    expect(intakeMessage('cuts', 500, {})).toContain('your text is unchanged');
    expect(intakeMessage('save', 500, {})).toContain('your cuts are still here'.replace('your', 'Your'));
  });

  it('an apology never stands where a fact belongs', () => {
    /* The line this replaced: "Could not save. Please try again." */
    for (const stage of STAGES) {
      const msg = intakeMessage(stage, 400, {});
      expect(msg).not.toMatch(/please try again\.?$/i);
    }
  });
});

/**
 * The rule has to hold at the call sites, not only in the module.
 *
 * The founder's gate for this candidate: prove the CLIENT receives and renders
 * the server's reason, not merely that the route logs it. There is no React
 * render harness in this repo (jest matches .ts only, no testing-library), and
 * adding one for a single page is the wrong trade — so the member-visible
 * sentence is a pure value, asserted above, and this pins that every intake
 * exit in the room actually produces it and renders it.
 */
describe('the Press room routes every intake exit through the contract', () => {
  const source = readFileSync(
    join(__dirname, '..', '..', '..', '..', 'app', 'press', 'manuscript', 'page.tsx'),
    'utf8',
  );
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

  it('imports the contract rather than restating it', () => {
    expect(source).toMatch(
      /import\s*\{\s*intakeMessage\s*\}\s*from\s*'@\/lib\/manuscript\/ingest\/intakeReason'/,
    );
  });

  it('covers all three stages, on refusal and on no answer at all', () => {
    for (const call of [
      "intakeMessage('read', res.status, data)",
      "intakeMessage('read', 0)",
      "intakeMessage('cuts', res.status, data)",
      "intakeMessage('cuts', 0)",
      "intakeMessage('save', res.status, data)",
      "intakeMessage('save', 0)",
    ]) {
      expect(code).toContain(call);
    }
  });

  it('renders what it produced — a reason computed and not shown is not a reason', () => {
    expect(code).toMatch(/setWarnings\(\[intakeMessage\(/);
    expect(code).toMatch(/setSaveMessage\(intakeMessage\(/);
    expect(code).toMatch(/\{warnings\.map\(/);
    expect(code).toMatch(/\{saveMessage \?\? intakeMessage\('save', 0\)\}/);
  });

  it('no hand-written refusal sentence survives beside the contract', () => {
    expect(code).not.toContain('Could not save. Please try again.');
    expect(code).not.toContain('We could not read that file. Please try again.');
    expect(code).not.toMatch(/data\.error \|\|/);
  });
});
