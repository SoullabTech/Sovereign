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
