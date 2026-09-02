import { isCaptureStalled, CAPTURE_STALL_MS } from '../captureHeartbeat';

const T = 1_000_000;
const at = (over: Partial<Parameters<typeof isCaptureStalled>[0]>) =>
  isCaptureStalled({
    now: T,
    lastFrameAt: T - 100,
    listening: true,
    armedAt: T - 60_000,
    ...over,
  });

describe('captureHeartbeat', () => {
  it('reports no stall while frames keep arriving', () => {
    expect(at({ lastFrameAt: T - 100 })).toBe(false);
  });

  it('reports a stall once frames stop for the threshold', () => {
    expect(at({ lastFrameAt: T - CAPTURE_STALL_MS })).toBe(true);
  });

  it('does not flag an ordinary hands-free re-arm gap', () => {
    // The backoff schedule tops out at 2500ms; frames pause for that long
    // during healthy operation and must not read as failure.
    expect(at({ lastFrameAt: T - 2_500 })).toBe(false);
  });

  it('says nothing when the app is not listening', () => {
    expect(at({ listening: false, lastFrameAt: 0 })).toBe(false);
  });

  it('says nothing inside the arming grace window', () => {
    // Frames legitimately lag the arm while the audio session spins up.
    expect(at({ armedAt: T - 500, lastFrameAt: 0 })).toBe(false);
  });

  it('says nothing before capture has ever been armed', () => {
    expect(at({ armedAt: 0, lastFrameAt: 0 })).toBe(false);
  });

  it('reports a stall when capture was armed long ago and no frame ever came', () => {
    // Capture that never started is the most important stall to surface.
    expect(at({ armedAt: T - 30_000, lastFrameAt: 0 })).toBe(true);
  });
});
