# JARVIS-PROVIDER-01 — Governed OpenCode Multi-Provider Execution

**Date:** 2026-09-17  
**State:** IMPLEMENTED ON BOUNDED BRANCH · NOT MERGED · NOT DEPLOYED  
**Base:** `d1d735e1186ed19defef235d91d4e896631de493`  
**Branch:** `feature/jarvis-provider-01-opencode-multiprovider-20260917`

## Founder grant

Current founder act: **“lets do. this!!!”**, issued immediately after the bounded proposal to
integrate Inkling through the existing JARVIS/OpenCode work while preserving JARVIS as authority,
registering Qwen + Nemotron + Inkling behind one seam, and keeping Inkling evaluation-only with
paid external execution disabled by default.

This grant authorizes this contained provider-integration lane. It does **not** authorize merge,
deployment, production mutation, provider spend, or external model execution.

## Question

Can JARVIS employ OpenCode as a provider-neutral execution surface without allowing a model,
provider, credential, or model registry entry to acquire Work Unit authority?

## Answer

Yes, with one crossing.

```text
Canonical Work Unit
      ↓
provider-agnostic permission envelope
      ↓
OpenCode provider registry
      ↓
governed adapter
      ↓
OpenCode
      ↓
Qwen | Nemotron | Inkling
```

The provider registry may select capability. It may not broaden permission. Model output remains
attempt evidence only; existing verification, result, session, collision, and integration authority
remain unchanged.

## V1 authority additions

Two provider-relevant acts are added to the existing provider-agnostic envelope:

- `network.external`
- `provider.spend`

Both are **denied by default** for every existing Work Unit. External metered providers require
both acts explicitly authorized on the Work Unit plus the provider credential.

## Registered provider classes

| JARVIS provider id | OpenCode model | Network | Metered | V1 standing |
|---|---|---:|---:|---|
| `qwen-local` | `ollama/qwen3-coder:30b` (plus allowlisted local variants) | no | no | local-established |
| `nemotron-nvidia` | `nvidia/nemotron-3-ultra-550b-a55b` | yes | yes | external-candidate |
| `nemotron-zen` | `opencode/nemotron-3-ultra-free` (plus allowlisted free Zen variant) | yes | no | external-free-candidate |
| `inkling-tinker` | `tinker/thinkingmachines/Inkling` | yes | yes | **evaluation-only** |

Registration is not activation. No external provider is a default model.

## OpenCode V1 execution boundary

V1 deliberately supports **read-only provider evaluation only**.

The project-scoped `jarvis-readonly` OpenCode agent:

- allows repository read / glob / grep / list / LSP;
- denies edit;
- denies shell;
- denies web fetch/search;
- denies subagents and skills;
- denies external-directory access;
- never receives OpenCode `--auto`.

The delegate records OpenCode attempts through the same result contract used by existing workers,
including the exact `provider/model` identity. A later founder act may open a separate proof for
write-capable OpenCode execution; this lane does not smuggle that authority in.

## Provider configuration

`opencode.json` registers:

- the existing local Ollama models;
- OpenCode Zen's built-in `opencode/nemotron-3-ultra-free` / `opencode/nemotron-3.5-lightning-free` models;
- NVIDIA NIM at `https://integrate.api.nvidia.com/v1`, credential by `NVIDIA_API_KEY`;
- Thinking Machines Tinker at
  `https://tinker.thinkingmachines.dev/services/tinker-prod/oai/api/v1`, credential by
  `TINKER_API_KEY`.

OpenCode Zen authentication remains in the user-level OpenCode credential store; no credential is committed. No external model is selected as the repository default.

## Evidence

Targeted provider proof:

```text
node scripts/builder/__tests__/opencode-adapter-governance-proof.mjs
23 passed · 0 failed
```

It proves registration, local Qwen resolution, Zen Nemotron external-network gating without a spend grant, V1 read-only refusal, conjunctive external-network
and provider-spend authority for metered providers, missing-credential refusal, Inkling evaluation-only standing,
deny-before-worktree behavior, exact model provenance, no `--auto`, and secret-free configuration.

Syntax/config gates also passed locally:

```text
node --check scripts/builder/opencode-provider.mjs
node --check scripts/builder/__tests__/opencode-adapter-governance-proof.mjs
bash -n scripts/ain-delegate.sh
JSON parse: opencode.json + package.json
```

A full `npm run jarvis:proof` regression run progressed green through the pre-existing session,
rate, incident, Work Unit, run-check, convergence, and liveness suites, then stopped in the
pre-existing Claude adapter proof with filesystem `ENOSPC` while another active JARVIS lane was
using a large temporary worktree. This is recorded as **ENVIRONMENTALLY BLOCKED**, not PASS and not
a code assertion failure. The other lane was not killed or deleted.

## What did not happen

- no NVIDIA API request;
- no Tinker/Inkling API request;
- no provider spend;
- no real external credential was created or committed;
- no production member data was read or transmitted;
- no production mutation;
- no merge;
- no deployment;
- no change to JARVIS truth/provenance authority.

## Next gate

After independent review of this read-only seam, the next distinct question is whether OpenCode may
become a governed **write-capable** worker. That requires a separate proof of permission mapping and
must not be inferred from provider registration.
