# JARVIS-JEV-01 / JEV-INT-05 — Adapter Hardening E1/E2/E3

**Date:** 2026-10-07 · **Status:** ⭐ REVIEWABLE · ⛔ **ADAPTER INACTIVE · NOT WIRED · NOT RATIFIED · AUTHORIZES NOTHING**
**Code HEAD:** `493be1cef3b33fd8285cb7a30220acd6fa35fc11` · responds to the Mac adapter review at `ba12a237694de5071005e03135a5600a40f2c576`
(read, not merged). C1/C2, the checkpoint protocol and the stop-window repair are **not reopened**. Loopback mock + dummy credential only: no real credential, no provider call,
no spend, no permission change, no ratification, no PILOT-01 activity.

## Decision on the credential callback
**Kept, made safe** (rather than removed): the callback is the only way a caller can supply a credential without holding it for the transport's lifetime. If you prefer string-only,
deleting the function branch is a three-line change and every test below still applies to strings.

## E1 — a throwing callback leaked its original exception
Repair: the callback runs inside a guard; any throw becomes `ADAPTER_CREDENTIAL_ERROR`, carrying no message, stack, or `cause` from the original. `send()` never throws synchronously
(it returns a rejected promise). A callback returning a promise or non-string is `ADAPTER_CREDENTIAL_INVALID` and never trusted. No connection is opened by any failing callback.

## E2 — cancellation inside the callback was missed
Repair: cancellation is re-checked **immediately after the callback and before the request is created**. A call cancelled inside the callback sends nothing (`ADAPTER_ABORTED`);
the earlier pre-abort and asynchronous-abort cases (A7) are unchanged.

## E3 — `NaN` / `Infinity` disabled the response bound
Repair: `maxResponseBytes` must be a safe positive integer, validated at construction (`ADAPTER_CONFIG_INVALID`, no connection). `NaN`, `±Infinity`, `0`, negatives, fractions, strings,
`null`, `2^53` and objects are refused; `undefined` means the default. Controls: the default still refuses an over-limit body; a finite override both tightens (1000) and loosens (1,000,000).

## Regression and defeat candidates
New checks **A15** (E1), **A16** (E2), **A17** (E3). Five new named defeat candidates, each dies on its check: `DC-AD-CALLBACK-ERROR-ESCAPES`, `DC-AD-CALLBACK-ERROR-CAUSE-KEPT` (A15),
`DC-AD-CANCEL-NOT-RECHECKED` (A16), `DC-AD-LIMIT-UNVALIDATED`, `DC-AD-LIMIT-ONLY-SIGN-CHECKED` (A17).

**Reproduced on the old adapter, fixed on the new** — the same proof run against the adapter as committed at `0dadf2f8a` (`JEV_AD_SOURCE_COMMIT`): **15 passed · 3 failed** (A15, A16, A17 exactly); on this tree **18 passed · 0 failed**.

## Results (container, Node v22.22.0; tree clean before and after)

| Command | Exit | Result | Log sha256 |
|---|---:|---|---|
| adapter proof against **old** adapter `0dadf2f8a` | 1 | 15 passed · 3 failed (A15–A17) | `ec4158ff4264…8091c` |
| `node …/jev-wire-http-adapter-v1-proof.mjs` ×3 | 0 | **18 passed · 0 failed** each | `c70c8da1d057…2ead` |
| `node …/jev-wire-http-adapter-v1-matrix.mjs` | 0 | **23/23 killed on named check · 0 problems** | `c6ccc4c3e4c4…a733` |
| checkpoint proof ×3 / matrix | 0 | 16 passed each / 28/28 killed | `ff53951f50af…3069c` / `100ce9ead479…8e5` |
| wire proof / matrix | 0 | 37 passed / 49/49 killed | `0e51e3214803…32951` / `405138486b00…98` |
| `…/jev-wire-v1-findings-repro.mjs old` / `new` | 0 / 0 | old 8/8 · repair 0/8 | `3953f2a0b6d3…` / `816de9258ec1…` |
| J1 freeze · host proof | 0 · 0 | 0 violations · PASS | `c77942443850…5f17` · `2272eddabf1b…ac1` |
| frozen J1 matrix · `tsc -p tsconfig.jarvis-jev-j1.json` | 0 · 0 | survivors 0 · strict J1 only | `9ba90f54d0ff…a80` · `8ee5d01b9c54…92e7` |

TypeScript rows used the session scratchpad toolchain; the Mac project-dependency run of this HEAD is **NOT RUN** here. Not tested by me: TLS, DNS, the real TypeSafe service, Windows/NFS, power loss.

Blob ids: adapter `5c4a3bf9…` · adapter proof `6cb6a505…` · adapter matrix `8676af57…` · `jev-wire-v1.mjs cb91b545…` and checkpoint module `bf30fa98…` (unchanged) · host `8138beeb…` (unchanged).

## Unchanged: what remains before a live run
The consolidated list in `…_ADAPTER_RETURN_2026-10-07.md` §5 stands: J1R5-WIRE ratification, the Route A chain, the execution grant, DPA/terms review, a real credential supplied at run time,
a live-run wrapper that does not exist yet (enables the remote option, holds the credential, opens `witnessed` via a reviewed change), real storage volumes and a named operator, a Mac run of this HEAD.
