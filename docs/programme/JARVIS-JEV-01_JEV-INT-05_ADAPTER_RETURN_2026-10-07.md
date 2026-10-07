# JARVIS-JEV-01 / JEV-INT-05 — Inactive HTTP Adapter: Return

**Date:** 2026-10-07 · **Status:** ⭐ TESTED ADAPTER · ⛔ **INACTIVE · NOT WIRED · NOT RATIFIED · AUTHORIZES NOTHING**
**Code HEAD:** `0dadf2f8a3567a653a8d644a2a1a26afad57289b` (docs-only commits follow). Builds on the Mac closure `262057a370e72bd4d5da9da45413e32e2719d5a3`;
the checkpoint protocol, completed repairs, regression tests, frozen J1 files and PILOT-01's deferral are untouched.
**Not done:** no real credential · no contact with TypeSafe (loopback mock + dummy credential only) · no provider registration/assignment · no authorization-record admission ·
no spend · no inference · no ratification · no merge · no deploy · no labels.

## 1 · What was built

| File | Role |
|---|---|
| `scripts/builder/jev-wire-http-adapter-v1.mjs` | `createJevHttpTransport({endpoint, credential, allowRemote=false, timeoutMs, maxResponseBytes})` → `{ send(bodyJson, {signal, bodyHash}) }`, the transport the existing runner already accepts. |
| `scripts/builder/__tests__/jev-wire-http-adapter-v1-proof.mjs` | 15 checks (A1, A1b, A2–A14) against a loopback mock server of the hosted service. |
| `scripts/builder/__tests__/jev-wire-http-adapter-v1-matrix.mjs` | 18 defeat candidates, each must die on its named check. |
| `docs/ops/JEV_INT05_INTERRUPTED_RUN_INSPECTION_RUNBOOK.md` | Read-only triage + stop rules for an authorized operator. **Assigns no operator; automates nothing.** |
| `jev-wire-v1.mjs` (one line) | the runner now also passes the recorded pre-send hash (`bodyHash`) to the transport. |

Facts taken from the captured schema (`a191f8a7…60d5`, read from the review branch): `POST /v1/systemone`, `HTTPBearer`, response members `model`, `answers`, `usage{input_tokens,output_tokens}`.
**This resolves the earlier open question: the model identity is the top-level `model`, matching the descriptor.**

## 2 · Behavior (each item has a committed check and defeat candidate)

- **Exact bytes.** Sends exactly the serialized body the runner hands over; never parses, rebuilds, extends or substitutes it. If the pre-send hash is supplied, bytes that do not hash to it are refused **before any connection** (A2).
- **Endpoint policy.** Loopback is the default. A remote endpoint needs `allowRemote === true` **and** exactly `https://api.typesafe.ai/v1/systemone` (no port, credentials, query); nothing in the product tree sets that option (A1, A14). Construction of the pinned endpoint sends nothing.
- **Credential.** Supplied by the caller (string or function), validated (printable ASCII, no whitespace), used only for the `Authorization` header; no environment or file reads, no logging; absent from every error and from captured console output (A1, A1b, A9, A14).
- **One request, no retries, no redirects.** Every HTTP failure is exactly one request carrying only `.status`; 3xx is refused and the target is never contacted (A4, A5).
- **Deadline through the response body.** One total deadline covers connect, headers and body: stalled headers, stalled body and a slow trickle all end in `ADAPTER_TIMEOUT` and a destroyed socket (A6). A call cannot outlive its deadline.
- **Cancellation and late arrivals.** The runner's abort signal destroys the request; a pre-aborted call opens no connection; after any settlement the server finds the socket already destroyed (A7, A8, A12).
- **Reply validation.** Non-JSON content type, bad JSON, oversize and truncated bodies are refused; schema checks remain the runner's strict parser (A3, A11).
- **Composition.** Through the checkpointed runner against the mock, **all 31 approved attempts complete (A10)**: each request's bytes hash to the pre-send hash recorded in the ledger; at the instant each request arrived the checkpoint already covered its reservation; observations (p, tokens, model) are persisted; cost = 31 × 300 × $0.042/M; the 32nd (a replay) sends nothing.
- **Stop behavior.** For 10 failure modes (500, 429, bad JSON, wrong content type, redirect, truncation, three stall variants, wrong shape) exactly one request is made, uncertain delivery keeps its reservation (`cost_known:false`), and the next attempt is `HALTED` with **no further request** (A11). When the runner's own deadline fires first, the late answer is never recorded (A12).
- **Still off.** Through the committed runner (`witnessed: false`) the adapter is never called and the mock sees zero requests (A13).

## 3 · Results (container, Node v22.22.0; tree clean before and after)

| Command | Exit | Result | Log sha256 |
|---|---:|---|---|
| `node …/jev-wire-http-adapter-v1-proof.mjs` ×3 | 0 | **15 passed · 0 failed** each | `b004c815d57f…741c9` |
| `node …/jev-wire-http-adapter-v1-matrix.mjs` | 0 | **18/18 killed on named check · 0 problems** | `ece3feb9834a…179dc` |
| `node …/jev-wire-checkpoint-v1-proof.mjs` ×3 | 0 | 16 passed each | `ff53951f50af…3069c` |
| `node …/jev-wire-checkpoint-v1-matrix.mjs` | 0 | 28/28 killed | `100ce9ead479…8e5` |
| `node …/jev-wire-v1-proof.mjs` | 0 | 37 passed | `0e51e3214803…32951` |
| `node …/jev-wire-v1-matrix.mjs` | 0 | 49/49 killed | `405138486b00…98` |
| `node …/jev-wire-v1-findings-repro.mjs old` / `new` | 0 / 0 | old 8/8 · repair 0/8 | `3953f2a0b6d3…` / `816de9258ec1…` |
| `node scripts/verify-jarvis-jev-j1-freeze.mjs` | 0 | 0 violations | `c77942443850…5f17` |
| `node …/jev-judgment-host-v1-proof.mjs` | 0 | PASS | `2272eddabf1b…ac1` |
| `tsx …/jarvis-jev-j1/matrix.ts` · `tsc -p tsconfig.jarvis-jev-j1.json` | 0 · 0 | survivors 0 · strict J1 only | `9ba90f54d0ff…a80` · `8ee5d01b9c54…92e7` |

TypeScript rows used the session scratchpad toolchain; the Mac project-dependency run of this HEAD is **NOT RUN** here.

Blob ids: adapter `562f1ec3…` · `jev-wire-v1.mjs cb91b545…` (one line changed) · checkpoint module `bf30fa98…` (unchanged) · adapter proof `f3c08042…` · adapter matrix `a901a102…` · host `8138beeb…` (unchanged). Table/fixture hashes unchanged (`6bb269d8…`, `a0f4a26c…`).

### Test-instrument lessons recorded
The first matrix run reported one **wrong-death**: the mock counted a request's own `close` (fired when the request completes) as "the client left", so a candidate that never destroyed the socket still passed the socket-closure check. The measurement now counts **server-side socket closure**. The adapter's own header comment had also contained the activation literal that its static guard forbids; reworded. Three candidates that would otherwise hang the proof (no deadline, idle-only deadline, ignored abort) are bounded in the tests so each dies on its named check rather than timing out.

## 4 · Limits of this evidence
Loopback HTTP only: **TLS behavior, certificate validation, DNS, proxies, HTTP/2 and real TypeSafe behavior (rate limits, 429 semantics, response variations, latency) are untested.** The mock is my reading of the captured schema, not the vendor's service. `Authorization` handling is tested against a dummy. Timeouts are tested at hundreds of milliseconds, not the production 30 s. macOS/Windows/NFS and power-loss behavior are untested.

## 5 · Consolidated list: what remains before the first live run
1. **Founder act — ratify J1R5-WIRE** as a J1 reopening (INT-03R1 §6 route b), then flip nothing until the items below exist.
2. **Route A chain:** Class-A prior-authorization record (status `ratified` by you), canonical admission, `typesafe-jev` registration (lab tier), later assignment candidate. Remember the assignment is **standing**; the one-experiment restriction lives in the execution grant.
3. **Execution grant** (`provider.execute:typesafe-jev`, `network.external`, `provider.spend`, `disclosure.repository_derived_metadata`) naming: table hash, fixture-list hash, model `jev-1.13.0`, pinned endpoint, one experiment id, the $1 / 31-attempt caps, expiry.
4. **DPA / retention / terms review** (not zero-retention) and the account's billing terms.
5. **Credential:** a real key issued and supplied by you into the runner's process at run time; the adapter reads no environment or file.
6. **A live-run wrapper that does not exist yet:** something that constructs the adapter with `allowRemote` enabled, holds the credential, picks real store paths, and opens `RESPONSE_SHAPE.witnessed` through a **reviewed code change** (the flag is currently an in-source constant). None of this is built and none is authorized here.
7. **Durable placement and operator:** ledger and checkpoint on different real volumes (mount verification), and a named operator who owns the runbook. The runbook assigns nobody.
8. **Mac project-dependency run** of this HEAD, and a decision on TLS/real-service dry-run limits (e.g. whether one live call precedes the 31).
9. **Real-work evaluation and INT-04 §9.5** remain a separate, later decision; this experiment makes no claim about Jev's judgment quality.
