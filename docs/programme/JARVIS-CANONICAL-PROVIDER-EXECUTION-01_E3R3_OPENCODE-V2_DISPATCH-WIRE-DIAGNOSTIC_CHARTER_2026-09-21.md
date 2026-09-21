# CUSTODY NOTICE — DRAFT ONLY

> Repository presence does **not** issue this act, confer authority, mint any grant, authorize S0/S1/S2, or change the standing recorded below. This file is durable custody of an unissued charter only.

# DRAFT — NOT ISSUED

# `JARVIS-CANONICAL-PROVIDER-EXECUTION-01 / E3R3 — OPENCODE V2 DISPATCH-WIRE DIAGNOSTIC`

## I. OPENING STANDING

Accept the following as prior standing:

- `E3R2` terminated:
  - `INSTRUMENT FAILURE`;
  - authority `SPENT`;
  - `NOT RE-RUNNABLE`;
  - Qwen `NOT RE-WITNESSED`.
- E3R2 permanently contains a historical `CLAIMED` event.
- E3R2 nevertheless established:
  - `Authorize Once ≠ Confirm Execute`;
  - `CLAIMED` before provider-process creation;
  - exact Qwen provider/model/adapter selection;
  - D2 containment during provider invocation;
  - exactly one canonical provider attempt;
  - private OpenCode service termination at closure;
  - clean repository before/after.
- During the actual E3R2 execution window, OpenCode accepted the full positional prompt and launched:

`opencode run --standalone --agent jarvis-readonly --model ollama/qwen3-coder:30b <bounded Work Unit prompt>`

- OpenCode started its private `serve --stdio` service.
- During the E3R2 attempt, no Ollama model-generation request was emitted.
- Therefore the remaining unresolved seam is:

> **between OpenCode accepting the governed run and OpenCode emitting the first provider HTTP request.**

E3R3 is a **diagnostic act**, not a provider-execution act.

---

# II. E3R2 AUTHORITY DOES NOT GOVERN E3R3

E3R2's historical `CLAIMED` event permanently forecloses re-running **E3R2**.

It does **not** block E3R3.

E3R3 has its own act identity and creates no provider-execution authority.

The E3R2 ledger may be read as prior evidence only.

Do not interpret:

- E3R2 `CLAIMED`;
- E3R2 `CONSUMED`;
- the spent E3R2 grant;

as live E3R3 authority state.

No E3R3 execution grant exists or is required.

---

# III. AUTHORIZED HOST + SUBSTRATE

Run E3R3 only on:

`Kellys-Mac-Studio.local`

Bind the diagnostic to exact repaired source:

`b40558cdac92258472053cdfdf11f4846431bb1d`

Require before each diagnostic run:

- exact source SHA;
- clean worktree;
- OpenCode v2 locally available;
- D2 governed runtime/config materialization available;
- no active E3R2/E3R3 diagnostic process left from a prior run;
- no real model invocation in progress from this lane.

Do not:

- merge;
- deploy;
- mutate production;
- update OpenCode;
- update Ollama;
- change the bound source during the diagnostic series.

---

# IV. ZERO-AUTHORITY / ZERO-INFERENCE BOUNDARY

E3R3 authorizes **no model execution**.

It must mint:

- no E1 grant;
- no provider-execution grant;
- no `ISSUED`;
- no `ACTIVE`;
- no `CLAIMED`;
- no `CONSUMED`.

It must invoke:

- no real Ollama inference;
- no Qwen inference;
- no GPT-OSS inference;
- no external provider.

The diagnostic endpoint must be a founder-controlled localhost stub.

The stub must:

- never proxy;
- never forward;
- never fall through;
- never redirect;
- never contact Ollama;
- never contact an external network destination.

Any attempt by the diagnostic harness to forward a captured provider request is `RED`.

An independent Ollama-log guard must confirm that no model-generation request occurred during each diagnostic run.

---

# V. PRIMARY DIAGNOSTIC QUESTION

E3R3 asks:

> **Does the governed OpenCode v2 ****`run --standalone`**** path emit the first provider HTTP request after accepting the bounded positional prompt?**

If yes:

> What request semantics did OpenCode actually ask for, including endpoint and streaming mode?

Only after S0 answers that question may response/drain behavior be tested.

Do not assume the response format before observing the request.

---

# VI. CONTROLLED LOOPBACK STUB

Replace the real governed Ollama-compatible base URL for this diagnostic only with a founder-controlled localhost stub.

The substitution must occur inside the same D2-owned configuration mechanism used for the repaired path.

Preserve all other relevant runtime properties:

- JARVIS-owned neutral workspace;
- private OpenCode `--standalone` service;
- governed `OPENCODE_CONFIG_DIR`;
- rebound `HOME`, `TMPDIR`, XDG roots;
- canonical child-environment allowlist;
- `jarvis-readonly`;
- same bounded prompt form;
- same model identity requested by OpenCode;
- no ambient OpenCode configuration.

The synthetic endpoint is an instrument, not a provider participant.

---

# VII. THREE STUB VARIANTS

## S0 — CAPTURE ONLY

Purpose:

> Determine whether OpenCode emits a provider request at all.

The stub:

- accepts a localhost connection;
- captures:
  - timestamp;
  - HTTP method;
  - path;
  - selected non-secret headers needed to characterize protocol;
  - request content type;
  - request body structure;
  - requested model identifier;
  - explicit or implicit streaming flag;
- does **not** provide a successful provider response.

It may:

- hold the connection;
- close deterministically;
- or return a deliberately neutral diagnostic termination,

provided the behavior is predeclared.

S0 does **not** diagnose response handling.

S0 licenses only:

### Finding A

`REQUEST_EMITTED`

or:

### Finding B

`NO_REQUEST_OBSERVED_WITHIN_BOUND`

or:

`INSTRUMENT FAILURE`

A request reaching S0 establishes dispatch independently of response semantics.

Failure of the CLI to exit during S0 is not evidence of an OpenCode drain defect.

---

## S1 — MINIMAL CONFORMING RESPONSE

S1 may be constructed only after S0 has captured the actual request semantics.

S1 must honor what S0 observed.

If S0 shows streaming requested:

- S1 must provide the minimal valid response in the actual streaming protocol OpenCode requested;
- framing and terminal event must conform to that protocol.

If S0 shows non-streaming requested:

- S1 must return a minimal valid complete response in that protocol.

Do not decide streaming behavior from documentation, expectation, or prior versions.

Use S0's captured request.

S1 asks:

> **Given a minimally conforming synthetic provider response, does OpenCode consume the response and terminate the governed ****`run`**** normally?**

Capture:

- provider request;
- synthetic response bytes/events;
- OpenCode stdout/stderr;
- OpenCode exit code;
- time from final response byte/event to CLI termination;
- private-server lifecycle.

---

## S2 — DELIBERATELY MALFORMED RESPONSE

S2 uses the same request shape as S1 but intentionally violates a predeclared response requirement.

Examples may include one bounded defect such as:

- invalid JSON;
- malformed stream framing;
- missing terminal stream event;
- structurally invalid provider object;
- protocol-invalid completion payload.

Use one deliberate defect per S2 run where practical.

S2 asks:

> **Can the diagnostic distinguish a valid response from a deliberately invalid one?**

---

# VIII. STUB DISCRIMINATION LAW

S1 and S2 exist to validate the instrument itself.

If S1 and S2 produce materially identical OpenCode behavior where the malformed response should have been distinguishable:

> **the stub/instrument has not demonstrated discrimination.**

Classify the response/drain question:

`INSTRUMENT FAILURE`

Do **not** conclude that OpenCode has a response-drain defect.

S0 remains independently valid for the narrower dispatch question if its request capture was sound.

Therefore:

- S0 can establish dispatch without S1/S2.
- S1/S2 are required for claims about response consumption or CLI drain.
- failure of S1/S2 discrimination does not erase a valid S0 dispatch observation.

---

# IX. 60-SECOND BOUND

Each S0, S1, or S2 diagnostic invocation has a maximum observation window of:

`60 seconds`

A dispatch expected from a healthy CLI/provider path should occur well within that bound.

The 60-second bound is diagnostic instrumentation, not provider execution authority.

On timeout:

- terminate only the diagnostic OpenCode invocation and its private child service;
- record the process state;
- verify cleanup;
- verify zero Ollama inference;
- preserve captured stub evidence.

Do not convert timeout alone into a substantive OpenCode finding beyond what the relevant variant can support.

---

# X. E3R3 IS DELIBERATELY RE-RUNNABLE

Unlike E3R2, E3R3 spends no model-execution authority.

Therefore:

> **E3R3 may be re-run repeatedly as needed with controlled stub variants.**

Re-runs may vary only diagnostic parameters admitted by this charter, including:

- S0 / S1 / S2;
- streaming versus non-streaming response after S0 establishes the requested form;
- one deliberately malformed property at a time;
- bounded timing behavior;
- diagnostic logging verbosity.

No grant is minted or consumed by any E3R3 run.

There is no `CLAIMED` spend boundary because E3R3 creates no execution authority.

A previous E3R3 run does not make a later E3R3 run unauthorized merely because it executed OpenCode.

Re-runnability does **not** authorize:

- real Ollama inference;
- model substitution;
- external provider use;
- expanding repository scope;
- production mutation.

---

# XI. PREDECLARED FINDING MATRIX

## S0

### `NO_REQUEST_OBSERVED_WITHIN_BOUND`

Establishes:

> The governed OpenCode run did not emit a provider request to the controlled endpoint within the diagnostic window.

This localizes the observed failure to:

> **OpenCode's pre-provider-dispatch path.**

It does not determine which internal OpenCode subsystem caused the stall.

### `REQUEST_EMITTED`

Establishes:

> OpenCode successfully crossed the dispatch boundary.

Record the actual request semantics.

Proceed to S1/S2 if response handling remains under investigation.

---

## S1 + S2

### S1 exits normally; S2 does not

Establishes:

> The stub discriminates conforming from malformed responses, and OpenCode's synthetic dispatch/drain path functions against the observed protocol.

The remaining real-provider defect is downstream of generic dispatch and compatible-response drain.

### S1 hangs/fails; S2 hangs/fails differently

Establishes:

> OpenCode dispatched, but conforming synthetic-response handling remains defective or incomplete.

Further localization may proceed without model inference.

### S1 and S2 behave materially identically

Establishes:

`INSTRUMENT FAILURE`

for any response/drain conclusion.

S0 dispatch evidence remains usable.

---

# XII. PREDECLARED RED FALSIFIERS

E3R3 is `RED` if:

1. an E1/provider-execution grant is minted;
2. any grant reaches `CLAIMED`;
3. Qwen inference occurs;
4. GPT-OSS inference occurs;
5. any real Ollama model-generation request occurs;
6. the stub proxies, forwards, redirects, or falls through to Ollama;
7. external network access occurs;
8. an external provider is contacted;
9. repository mutation occurs;
10. production is read or written contrary to the diagnostic boundary;
11. provider/model substitution occurs outside the controlled endpoint substitution;
12. ambient OpenCode configuration participates;
13. the diagnostic is run from a host other than the authorized Mac Studio;
14. the bound SHA differs from `b40558cdac92258472053cdfdf11f4846431bb1d`;
15. an S1/S2 response-behavior claim is made without first observing the actual request semantics in S0;
16. S1/S2 fail to discriminate but are nevertheless used to assert an OpenCode drain defect.

A falsifier may be reported PASS only where the observation required to test it was actually produced.

Otherwise record:

`NOT WITNESSED`

or:

`INSTRUMENT FAILURE`

as appropriate.

---

# XIII. REQUIRED EVIDENCE

For every run capture from the first line:

- run ID;
- variant `S0`, `S1`, or `S2`;
- exact source SHA;
- host;
- OpenCode version;
- diagnostic endpoint;
- process launch time;
- private-server PID/lifecycle;
- stub start time;
- first connection time;
- first request-byte time;
- complete request method/path;
- observed streaming semantics;
- bounded sanitized request shape;
- response variant and bytes/events sent, if any;
- OpenCode stdout;
- OpenCode stderr;
- OpenCode exit status;
- timeout status;
- private-service cleanup;
- repository cleanliness;
- Ollama generation-log guard;
- grant-store check confirming no E3R3 grant/`CLAIMED` state.

Distinguish:

`WITNESSED`

`ENTAILED`

`NOT WITNESSED`

---

# XIV. CLAIM CEILING

Even the strongest E3R3 outcome establishes only behavior of:

- OpenCode v2.0.12;
- on `Kellys-Mac-Studio.local`;
- through the D2-contained runtime;
- at exact source `b40558cdac92258472053cdfdf11f4846431bb1d`;
- against the controlled localhost synthetic endpoint;
- under the tested request/response variant.

E3R3 does **not** establish:

- successful Qwen execution;
- correctness of Ollama;
- correctness of Qwen;
- provider success against real Ollama;
- E3R2 success;
- production readiness;
- merge readiness;
- deployment readiness;
- universal OpenCode correctness.

Even if S1 yields a perfectly clean OpenCode exit:

> **Qwen remains ****`NOT RE-WITNESSED`****.**

Only a future separately authorized model-execution act could change that standing.

---

# XV. STOP BOUNDARY

E3R3 may continue through controlled S0/S1/S2 diagnostic repetitions until the dispatch/drain mechanism is sufficiently localized.

STOP before:

- any real model inference;
- any provider-execution authority;
- any E1 grant;
- any `CLAIMED`;
- any external provider;
- any production mutation;
- any merge;
- any deployment.

Return the narrowest mechanically supported finding.

> **E3R3 diagnoses the OpenCode dispatch wire. It does not spend model authority, and it does not re-witness Qwen.**