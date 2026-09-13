/**
 * BCS-01A · Step 2 · W-P7 — a cancellation request is not a cancellation.
 * The interval between request and actual termination must be witnessable (F-J9.7).
 */

import {
  recordCancelRequest,
  observeCancellation,
  completeExecution,
  type CancelRequest,
  type ExecutionState,
} from '../executionState';

const RUNNING: ExecutionState = { executionId: 'x1', status: 'running' };
const REQUEST: CancelRequest = {
  requestedBy: 'member:m1',
  authority: 'member',
  requestedAt: '2026-09-13T12:00:00.000Z',
  reason: 'no longer wanted',
};

describe('W-P7 · cancel-request and cancelled are separate predicates', () => {
  it('T1–T2 — the request exists and the execution is STILL RUNNING', () => {
    const r = recordCancelRequest(RUNNING, REQUEST);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.state.cancelRequest).toEqual(REQUEST);
    expect(r.state.status).toBe('running'); // the whole point
  });

  it('RED CONTROL — a handler that sets `cancelled` on request is caught at T2', () => {
    // The prohibited behaviour, expressed deliberately.
    const badCancel = (s: ExecutionState, req: CancelRequest): ExecutionState => ({
      ...s,
      cancelRequest: req,
      status: 'cancelled',
    });

    const bad = badCancel(RUNNING, REQUEST);
    expect(bad.status).toBe('cancelled'); // the known-bad is genuinely bad

    const lawful = recordCancelRequest(RUNNING, REQUEST);
    expect(lawful.ok && lawful.state.status).toBe('running');
    expect(lawful.ok && lawful.state.status).not.toBe(bad.status);
  });

  it('T3–T4 — only the execution path reaching its boundary produces CANCELLED', () => {
    const requested = recordCancelRequest(RUNNING, REQUEST);
    expect(requested.ok).toBe(true);
    if (!requested.ok) return;

    const terminated = observeCancellation(requested.state);
    expect(terminated.ok).toBe(true);
    expect(terminated.ok && terminated.state.status).toBe('cancelled');
  });

  it('refuses to produce CANCELLED without an actual request', () => {
    const r = observeCancellation(RUNNING);
    expect(r.ok).toBe(false);
    expect(!r.ok && r.refusal).toBe('no_cancel_request');
  });

  it('LAWFUL CONTROL — no request + normal terminus → COMPLETED', () => {
    const r = completeExecution(RUNNING);
    expect(r.ok && r.state.status).toBe('completed');
  });

  it('a COMPLETED execution cannot be retroactively cancelled', () => {
    const done = completeExecution(RUNNING);
    expect(done.ok).toBe(true);
    if (!done.ok) return;

    const late = recordCancelRequest(done.state, REQUEST);
    expect(late.ok).toBe(false);
    expect(!late.ok && late.refusal).toBe('already_terminal');

    const forced = observeCancellation(done.state);
    expect(forced.ok).toBe(false);
    expect(!forced.ok && forced.refusal).toBe('already_terminal');
  });
});
