/**
 * T1 — client seam attribution guard.
 *
 * The Ask MAIA client handler has a single outer catch. If that catch names a
 * literal seam, every throw in the gesture is attributed to that one seam and
 * client-side fault localization silently collapses — an autosave transport
 * failure and a malformed-response parse failure would read identically.
 *
 * The handler is a React page component and is not exercised here; this is a
 * structural guard on the property, and it is stated as such rather than
 * dressed up as a behavioral test.
 */
import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'fs';
import { join } from 'path';
import { CLIENT_SEAMS } from '../faultLocalization';

const PAGE = join(process.cwd(), 'app/maia/ideas/[id]/page.tsx');
const src = readFileSync(PAGE, 'utf8');

describe('client seam attribution', () => {
  it('attributes a thrown error to the seam in flight, not a hard-coded seam', () => {
    expect(src).toContain("emitStage(t1, t1Seam, 'failed'");
    for (const seam of CLIENT_SEAMS) {
      expect(src).not.toContain(`emitStage(t1, '${seam}', 'failed', {\n        reason: 'threw'`);
    }
  });

  it('advances the tracker before entering each client seam', () => {
    for (const seam of ['client.ask_request', 'client.render']) {
      const assign = src.indexOf(`t1Seam = '${seam}'`);
      const entered = src.indexOf(`emitStage(t1, '${seam}', 'entered'`);
      expect(assign).toBeGreaterThan(-1);
      expect(entered).toBeGreaterThan(assign);
    }
  });

  it('brackets response parsing inside client.render, not client.ask_request', () => {
    // A malformed body is a render fault, not a transport fault. The parse
    // must sit between render:entered and render:completed.
    const renderEntered = src.indexOf("emitStage(t1, 'client.render', 'entered')");
    expect(renderEntered).toBeGreaterThan(-1);
    const parse = src.indexOf('await res.json()', renderEntered);
    const renderCompleted = src.indexOf("emitStage(t1, 'client.render', 'completed'", renderEntered);
    expect(parse).toBeGreaterThan(renderEntered);
    expect(renderCompleted).toBeGreaterThan(parse);
  });

  it('carries the attempt_id on every request the gesture makes', () => {
    const asks = src.split('apiFetch(`/api/ideas/${idea.id}/').length - 1;
    const carried = src.split('headers: t1Headers').length - 1;
    expect(asks).toBeGreaterThanOrEqual(2);
    expect(carried).toBe(2);
  });

  it('never mints or sends a request_id from the client', () => {
    expect(src).not.toContain('newRequestId');
    expect(src).toContain('requestId: null');
  });
});
