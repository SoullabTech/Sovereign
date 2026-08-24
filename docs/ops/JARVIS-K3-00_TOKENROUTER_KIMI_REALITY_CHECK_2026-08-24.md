# JARVIS-K3-00 — TokenRouter / Kimi K3 Reality Check

**Date**: 2026-08-24
**Status**: **CLOSED — VERDICT D. Not adopted.** (closed by Kelly, 2026-08-24)
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
account:          ABSENT — signup incomplete (captcha failure, 2026-08-24)
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
     As of 2026-08-24 also UNEXECUTABLE — no account exists.

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

## Blocker 0 — no TokenRouter account (added 2026-08-24, after initial report)

Kelly reports being **unable to complete TokenRouter signup — the captcha does not
work**. This blocker is upstream of the other two: with no account, there is no
key to provision and nothing to authenticate against, so the proof is currently
unexecutable *by anyone*, not merely unexecutable from this container.

This was not independently verified: `tokenrouter.com` is on the same denied
egress path as the API, so no assessment was made of whether the captcha failure
is general or specific to Kelly's browser/network.

**Standing observation, held as observation and not as a finding**: a provider
being promoted this week, whose free-tier alias is not on its public model page,
and whose signup flow does not complete, is a thin foundation to build a JARVIS
lane on. That is a reason to spend no further effort here without a specific
motivating need — it is not evidence of anything wrong with the provider.

## Operator run 1 — 2026-08-24, Mac Studio (egress available)

`scripts/jarvis-k3-00-probe.sh` executed successfully as tooling. Result:

```
GET /v1/models -> HTTP 401  {"error":{"message":"Invalid token", ...}}
CATALOG UNAVAILABLE
```

Tokens spent: 0. Credit spent: $0. The free-alias guard never had to fire —
the run stopped at authentication, before any billable call.

`scripts/jarvis-k3-00-keyshape.sh` then indicated the supplied value was **not
in API-key format**: 27 characters, no vendor prefix marker, and a character
composition typical of a human-chosen password rather than an issued
credential. No whitespace damage, so the paste was not truncated in transit —
the wrong secret was supplied, not a damaged one.

**Security consequence, actioned**: because the probe authenticates with
whatever it is given, that value was transmitted to `api.tokenrouter.com` as a
bearer token and is expected to appear in TokenRouter's server-side logs as a
rejected token (their 401 carried a request id). Operator advised to rotate it,
and to change it anywhere it is reused.

**Tooling defect this exposed**: the shape check ran *after* the authenticated
call. It should run *before*, so a non-key value is refused locally and never
transmitted. Fixed by folding the shape gate into the probe's preflight.

## Re-run conditions

**Precondition (blocker 0)**: a working TokenRouter account must exist.

Then `JARVIS-K3-00` should be re-run unchanged once either:

- the host is allowlisted **and** the key is provisioned to that session; or
- an operator runs steps 3–5 from a machine with existing egress and pastes the
  raw API responses (key redacted) back for analysis.

`JARVIS-K3-01` (opt-in experimental worker lane, Claude untouched as the trusted
default reasoning path) remains **unauthorized** and is gated on a `VERDICT: A`
from a completed `JARVIS-K3-00`.


---

# CLOSURE — JARVIS-K3-00, VERDICT D

**Closed by**: Kelly, 2026-08-24.

## Disposition

**Not adopted. Marketing claim remains unverified. No integration, no spend, no
production change.**

**Re-open only if** TokenRouter exposes a verifiable K3 catalog entry, or an
explicit 50M-token allocation is visible on the account.

## Decision-quality evidence (sufficient without completing the probe)

1. The claimed free K3 route is **not publicly listed** — `moonshotai/kimi-k3-free`
   does not appear on TokenRouter's public model page.
2. The account shows a **$20 balance, not a visible 50M-token allocation**. If a
   50M free grant were live, it would be expected to appear *as an allocation*.
   Dollars are the shape you would expect if the promotion did not apply.
3. The remaining friction is **account/key plumbing, not evidence about K3**.

Continuing would have spent more attention proving access mechanics than
evaluating the thing actually under question.

## Final ledger

```text
tokens spent      : 0
credit spent      : $0
production changes: none
routing changes   : none
Claude/OpenAI path: untouched
data sent to TR   : none (no repo, member, MAIA or proprietary content)
catalog answer    : never obtained
50M claim         : UNVERIFIED — neither confirmed nor refuted
```

## Credential hygiene — closed out

A 27-character value later identified as not API-key shaped was supplied during
run 1. Exposure assessment:

- **Chat**: never entered. No credential was pasted into the conversation.
- **Shell history**: never entered — `read -rs` held; `grep` over `~/.zsh_history`
  returned nothing.
- **Third-party logs**: **exposed once.** It was transmitted to
  `api.tokenrouter.com` as a bearer token before the shape preflight existed, and
  the 401 response carried a request id, so it is recorded server-side as a
  rejected credential.

**Action**: rotate that value, and change it anywhere it is reused. The
third-party log exposure alone is sufficient grounds.

## What this job was worth

The proof cost zero tokens, zero dollars, and zero production changes, and it
stopped an unverified third-party marketing claim from becoming a JARVIS
integration. The `prove first, integrate second` sequencing did exactly the work
it was chosen to do.

Two artifacts remain reusable if this is ever re-opened:
`scripts/jarvis-k3-00-probe.sh` (now shape-gated in preflight, so a non-key value
is refused locally and never transmitted) and `scripts/jarvis-k3-00-keyshape.sh`.

## Downstream

`JARVIS-K3-01` — the opt-in experimental worker lane — is **not authorized** and
has no path to authorization without a VERDICT A. Claude remains the trusted
default reasoning path, unmodified.

Standing note for any future provider evaluation: JARVIS still has **no
credential lane** (no keytar, no Electron `safeStorage`, no keychain, zero
`API_KEY` references). Any external model provider requires that seam to be
designed first — it is `JARVIS-K3-01`'s true prerequisite, not the model wiring.
