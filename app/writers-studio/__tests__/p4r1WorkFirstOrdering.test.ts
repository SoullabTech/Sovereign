import fs from 'node:fs';
import path from 'node:path';

/**
 * W1 — returning writers must meet their existing Work before creation tools.
 * Presentation-only ordering; the creation/import controls remain available.
 *
 * A structural guard accompanies the separately required Chromium/WebKit walk.
 */
const home = fs.readFileSync(
  path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1HomeView.tsx'),
  'utf8',
);

function between(start: string, end: string): string {
  const from = home.indexOf(start);
  const until = home.indexOf(end, from + start.length);
  expect(from).toBeGreaterThanOrEqual(0);
  expect(until).toBeGreaterThan(from);
  return home.slice(from, until);
}

function requireBefore(section: string, first: string, second: string) {
  const one = section.indexOf(first);
  const two = section.indexOf(second);
  expect(one).toBeGreaterThanOrEqual(0);
  expect(two).toBeGreaterThanOrEqual(0);
  expect(one).toBeLessThan(two);
}

describe('W1 — existing writing is the first invitation', () => {
  it('puts the carried Work before optional creation/import controls', () => {
    const segment = between('if (props.returnWork) {', "} else if (props.arrival.kind === 'begin') {");
    requireBefore(segment, '<WorkAnchor', '{creationControls}');
    expect(segment).toContain('onStartWriting={props.onStartWriting}');
  });

  it('puts a resumed Work before the secondary start/import tools', () => {
    const segment = between("} else if (props.arrival.kind === 'continue' && props.arrival.resume) {", '} else if (unclaimed.length > 0) {');
    requireBefore(segment, '<WorkAnchor', '{creationControls}');
  });

  it('puts existing unclaimed writing before the optional creation controls', () => {
    const segment = between('} else if (unclaimed.length > 0) {', '} else {\n    work = (');
    requireBefore(segment, 'className="fr-home-writing-list"', '{creationControls}');
  });

  it('puts the Work shelf before secondary creation controls', () => {
    const start = home.indexOf('className="fr-home fr-home-many"');
    expect(start).toBeGreaterThanOrEqual(0);
    const segment = home.slice(start);
    requireBefore(segment, 'className="fr-home-shelf fr-home-shelf-4"', '{creationControls}');
  });

  it('preserves the new/begin path without a compulsory relationship setup', () => {
    const segment = between("} else if (props.arrival.kind === 'begin') {", "} else if (props.arrival.kind === 'continue' && props.arrival.resume) {");
    expect(segment).toContain('{HOME_COPY.beginWelcome}');
    expect(segment).toContain('Start writing');
    expect(segment).toContain('onClick={() => props.onBegin(title)}');
    expect(segment).not.toContain('Guided / Learning / Direct');
  });
});
