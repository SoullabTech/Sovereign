# JARVIS-K3-00 — TokenRouter / Kimi K3 Reality Check

**Date**: 2026-08-24
**Status**: **BLOCKED — proof not executable in this environment**
**Scope**: proof-only. No integration, no routing change, no deploy.

---

## Outcome in one line

The empirical question — *"do we actually have 50M usable K3 tokens?"* — **was not
answered**, and could not be answered from this session. Two independent hard
blockers stopped the probe before any claim could be tested.

Nothing about the social-media claim was confirmed or refuted. It remains
**unverified**, exactly as it was before this job ran.

---

## Blocker 1 — no credential in this environment

`TOKENROUTER_API_KEY` is absent from:

- the process environment of this session
- every conventional env file in the repo (`.env`, `.env.local`, `.env.docker`,
  `.env.production`, `jarvis-desktop/.env`, …) — **none of these files exist here**
- the repository itself (zero references to `TOKENROUTER` in any tracked file)

**Scope of this finding**: this is an *ephemeral remote container*, freshly cloned
from the repo. It is not the Mac Studio and not minisforum. A key configured on
either of those machines would not appear here. So the correct reading is
"no credential is reachable from this session", **not** "Kelly has no key".

## Blocker 2 — egress policy denies the host

`api.tokenrouter.com:443` is not on this session's egress allowlist. The agent
proxy answered `403` to `CONNECT`, twice, recorded proxy-side as:

```
kind:   connect_rejected
detail: gateway answered 403 to CONNECT (policy denial or upstream failure)
host:   api.tokenrouter.com:443
```

The proxy documentation is explicit that organization policy denials must be
reported rather than retried or routed around. They were not retried or routed
around.

This blocker is the harder of the two: **even with a valid key, steps 3–5 of this
job could not run from this environment.**

---

## Evidence block

```text
JARVIS-K3-00

BINDING
repo:    SoullabTech/Sovereign  (JARVIS root: jarvis-desktop/)
branch:  claude/tokenrouter-kimi-k3-proof-f74ibx
HEAD:    be5b3b80241eb988e74f16cb8851888f135d45df  (be5b3b8)
tree:    clean (0 modified files at bind time)
runtime: Node v22.22.2, ephemeral remote container (not Mac Studio, not minisforum)

TOKENROUTER
credential:       ABSENT (this session only — see scope note)
endpoint:         https://api.tokenrouter.com/v1
catalog reachable: NO — egress policy 403 on CONNECT

KIMI
paid model:       NOT OBSERVED (catalog unreachable)
free model:       NOT OBSERVED (catalog unreachable)
free alias present: UNKNOWN — not tested

DIRECT PROBE
status:           NOT ATTEMPTED (gated on catalog + credential)
response:         n/a
resolved model:   n/a
latency:          n/a
input tokens:     n/a
output tokens:    n/a
reported cost:    n/a
quota metadata:   n/a

PROMOTION
50M allocation:   UNVERIFIED — no API contact made
expiration:       UNKNOWN
evidence:         none. No TokenRouter API response was obtained in this session.

VERDICT
D — blocked. Not incompatible, not disproven: untested.

NEXT ACTION
Kelly: decide whether to allowlist api.tokenrouter.com for a JARVIS session and
provision the key out-of-band, or run JARVIS-K3-00 from a machine with existing
egress; until then treat the 50M K3 claim as unverified marketing.
```

---

## What was deliberately NOT done

- No integration into JARVIS routing.
- No change to Claude / OpenAI / existing model routing.
- No Kimi fallback added.
- No routing framework installed.
- No Soullab, MAIA, member, client, or memory data sent anywhere.
- No API key printed, logged, or committed.
- No inference of a free model from a paid model.
- No conversion of any partial result into evidence for the 50M claim.

---

## How to add the credential securely (when Kelly chooses to)

Do **not** paste the key into chat, into a PR, or into a tracked file.

Notable finding: **JARVIS has no credential lane today.** `jarvis-desktop/` contains
no `keytar`, no Electron `safeStorage`, no keychain use, and zero `API_KEY`
references; `src/child-env.js` deliberately constructs a controlled child
environment. So this is a new seam, not an existing slot — which is itself an
argument for keeping K3 out of JARVIS until the lane is designed.

Two options, in order of preference:

1. **Local, untracked env file** — `.env.local` at the repo root is already
   gitignored (`.gitignore:107`). Add `TOKENROUTER_API_KEY=…` there on the machine
   that will run the probe. Never `git add -f` it.
2. **Shell-session export** — `export TOKENROUTER_API_KEY=…` in the operator's
   shell for the duration of the probe only. Leaves no file at rest.

For a *remote* session to run this proof, both must be true:
`api.tokenrouter.com` allowlisted in the environment's egress policy, **and** the
key supplied as an environment variable through the environment's secret
mechanism — not through the conversation.

---

## Re-run conditions

`JARVIS-K3-00` should be re-run unchanged once either:

- the host is allowlisted **and** the key is provisioned to that session; or
- an operator runs steps 3–5 from a machine with existing egress and pastes the
  raw API responses (key redacted) back for analysis.

`JARVIS-K3-01` (opt-in experimental worker lane, Claude untouched as the trusted
default reasoning path) remains **unauthorized** and is gated on a `VERDICT: A`
from a completed `JARVIS-K3-00`.
