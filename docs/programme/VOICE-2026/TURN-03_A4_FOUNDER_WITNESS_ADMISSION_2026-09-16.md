# TURN-03 A4 — Founder Witness Admission

**Date:** 2026-09-16
**State:** ADMITTED · NOT EXECUTED · LOCAL/ADMIN-ONLY REQUEST · EXPLICIT-FLOOR REQUIRED

## Entry truth

The sealed A4 observer at `cd41562b6704f7166a11486b001abf25c1434d98` was shadow-safe, but founder-witness admission testing found the server telemetry receiver would silently discard eight already-emitted TURN-01/02/A4 event names. A founder walk under that condition could look locally successful while producing an empty server witness.

## Repair

- `/api/telemetry/client` now admits the eight existing turn-taking diagnostic events.
- A founder A4 walk is requested only by `?turnA4Shadow=1`.
- The request is passed downstream only when `useSession().isAdmin` is true.
- The request is non-persistent; it is not stored in localStorage or sessionStorage.
- `ContinuousConversation` still independently requires explicit floor mode (`I'm Done`) before A4 observation runs.
- No member-facing settings, endpoint threshold, send path, cognition path, TTS path, or predictor authority changed.

## Qualification

- founder admission + receiver vocabulary + A4/ownership/capture regressions: **106/106 PASS**;
- TypeScript no-regression: **PASS** (`229` diagnostics vs `239` baseline; `0` new regressions);
- `git diff --check`: **PASS**.

## Execution boundary

This act only makes a truthful founder instrumentation witness possible. It does not execute that witness, open the A4 human population, authorize threshold tuning, grant TURN-04 authority, or deploy anything.
