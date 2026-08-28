import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The capture harness must be able to tell the two failures apart.
 *
 * WS2-01. Witness 1 is not "the harness stopped because it was signed out". It
 * is the whole chain — fresh browser, WriterCanvas reaches its unauthorized
 * state, the intended sign-in invitation renders, no React error boundary. A
 * generic stop before rendering witnesses nothing.
 *
 * The gate was a single boolean: does the body contain the invitation copy? On
 * a crash that text is absent, the boolean reads false, and the harness walked
 * past the error boundary and photographed it under a `[capture:ok]` line. A
 * crash would have been filed as the field, and the divergence pass would have
 * scored ten dimensions against a picture of `app/error.tsx`.
 *
 * Plausible evidence is more dangerous than obvious failure when provenance is
 * uncertain. These pins keep the three outcomes distinct.
 */
const harness = readFileSync(
  join(__dirname, '..', '..', '..', 'scripts', 'capture-studio-field.mjs'),
  'utf8',
);

describe('the capture harness classifies what the room rendered', () => {
  it('reads three outcomes, not a boolean', () => {
    expect(harness).toContain("return 'crash'");
    expect(harness).toContain("return 'signed-out'");
    expect(harness).toContain("return 'field'");
  });

  it('matches the copy the app actually renders, from both boundaries', () => {
    /* app/error.tsx and app/global-error.tsx both render this title-cased. The
       sentence-cased "Something went wrong" used by many pages for inline
       errors is deliberately NOT the probe — it would refuse captures of rooms
       that are fine. */
    expect(harness).toContain("const ROOM_CRASH = 'Something Went Wrong'");
    expect(harness).toContain("const ROOM_SIGNED_OUT = 'opens only to you'");

    const boundary = readFileSync(join(__dirname, '..', '..', 'error.tsx'), 'utf8');
    expect(boundary).toContain('Something Went Wrong');
    const room = readFileSync(join(__dirname, '..', 'canvas', 'page.tsx'), 'utf8');
    expect(room).toContain('opens only to you');
  });

  it('refuses a crash instead of capturing it', () => {
    const gate = harness.slice(harness.indexOf("if (state === 'crash')"));
    expect(gate.length).toBeGreaterThan(0);
    /* The refusal has to come before the screenshot, or it is not a refusal. */
    expect(gate.indexOf('process.exit(1)')).toBeLessThan(gate.indexOf('page2.screenshot'));
  });

  it('says Witness 1 out loud on the first load, before any sign-in prompt', () => {
    /* Observed BEFORE the headful sign-in pause — otherwise the pre-session
       render is gone by the time anything looks at it. */
    const firstLoad = harness.indexOf('const firstLoad = await readRoomState');
    const prompt = harness.indexOf('press Enter here');
    expect(firstLoad).toBeGreaterThan(0);
    expect(prompt).toBeGreaterThan(0);
    expect(firstLoad).toBeLessThan(prompt);
    expect(harness).toContain('[witness-1] PASS');
    expect(harness).toContain('[witness-1] FAIL');
  });
});

/**
 * A borrowed server may not render an image that gets named for HEAD.
 *
 * `--serve` means "start the app from this checkout". When something was
 * already listening the script used to warn and carry on — and with `--sha`
 * naming the output `writing-field-<sha>.png`, that deposits a file whose name
 * asserts a tree that did not necessarily render it. Same shape as an
 * all-CACHED deploy reporting a fresh SHA: the stamp is right, the code is
 * unknown. A warning scrolls past; the filename stays in the record.
 */
describe('--serve refuses a server it did not start', () => {
  it('exits rather than borrowing', () => {
    const branch = harness.slice(harness.indexOf('} else if (serve) {'));
    expect(branch.length).toBeGreaterThan(0);
    const stop = branch.indexOf('process.exit(1)');
    expect(stop).toBeGreaterThan(0);
    /* Before the browser is launched, so no capture can follow it. */
    expect(stop).toBeLessThan(branch.indexOf('puppeteer.launch'));
  });

  it('names the misattribution rather than only the inconvenience', () => {
    expect(harness).toContain('lsof -ti:3000 | xargs kill');
    expect(harness).toMatch(/while an unknown tree rendered it/);
  });

  it('still allows a server the caller vouches for, without --serve', () => {
    /* The refusal is scoped to the contradiction — asking the script to start
       the app when one is already up. Pointing --url at a server you started
       yourself is a judgment the caller is entitled to make. */
    expect(harness).toContain('if (serve && !(await alreadyUp(origin)))');
    expect(harness).toContain('Or drop --serve to vouch for that server yourself.');
  });
});

/**
 * OBSERVATION-PROVENANCE-01 clause 4 — the filename is observed, not requested.
 *
 * `--sha` was written into the output name on trust, which makes the caller's
 * typing the evidence. A dirty tree is the sharper case: the render is
 * `<sha> + uncommitted diff` while the name claims a clean commit.
 */
describe('the capture is named for the tree that rendered it', () => {
  it('reads HEAD itself rather than trusting --sha', () => {
    expect(harness).toContain("run(['rev-parse', '--short', 'HEAD'])");
    expect(harness).toContain('const observed = observedTree()');
  });

  it('refuses a --sha that disagrees with the tree', () => {
    expect(harness).toMatch(/would assert provenance the render does not have/);
  });

  it('marks a dirty tree in the name instead of hiding it', () => {
    expect(harness).toContain("`${head}-dirty`");
    expect(harness).toContain('committed code PLUS uncommitted changes');
  });
});
