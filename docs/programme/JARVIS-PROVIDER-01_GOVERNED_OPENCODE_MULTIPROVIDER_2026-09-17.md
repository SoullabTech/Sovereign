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
| `nemotron-zen` | `opencode/nemotron-3-ultra-free` (plus allowlisted free Zen variant) | yes | no | **interactive-only · delegated automation blocked** |
| `nemotron-tinker` | `tinker/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` (Ultra allowlisted) | yes | yes | external-candidate |
| `inkling-tinker` | `tinker/thinkingmachines/Inkling-Small:peft:262144:sampling-nvfp4` (full Inkling allowlisted) | yes | yes | **evaluation-only** |

Registration is not activation. No external provider is a default model.

## OpenCode V1 execution boundary

V1 deliberately supports **read-only provider evaluation only**.

For providers that admit governed automation (`qwen-local`, direct NVIDIA Nemotron, Tinker
Nemotron, and Tinker/Inkling), the project-scoped `jarvis-readonly` OpenCode agent:

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

### OpenCode Zen Free live restriction — 2026-09-17

The Zen credential and model are real and usable **inside native OpenCode**:

```text
opencode -m opencode/nemotron-3-ultra-free
→ NEMOTRON CONNECTED
```

A minimal unmodified headless native `build` run also returned successfully. But the live Zen Free
gateway rejects every tested form of the JARVIS read-only boundary with:

```text
Error from provider (Console): OpenCode's free tier can only be used from within OpenCode
```

The restriction reproduced with:

- `--agent jarvis-readonly`;
- runtime `OPENCODE_CONFIG_CONTENT` permission denial;
- a custom `OPENCODE_CONFIG` permission file; and
- a normal `.opencode/opencode.json` override of the native `build` agent.

The unmodified native `build` agent is not an acceptable substitute: its default tool surface is
broader than the JARVIS V1 permission contract. Therefore **JARVIS does not weaken its boundary to
obtain free-provider access**. `nemotron-zen` remains registered for truthful capability discovery
and manual OpenCode use, but automated JARVIS delegation fails closed with
`PROVIDER_AUTOMATION_UNSUPPORTED` after `network.external` authority is checked and before worktree
acquisition.

Direct NVIDIA Nemotron remains one governed automated Nemotron candidate once a direct provider
credential and `provider.spend` authority are both present. Tinker now provides a second governed
Nemotron candidate behind the same `TINKER_API_KEY` planned for Inkling: Nemotron 3.5 Lightning is
the cost-conscious default and Nemotron 3 Ultra is an explicit allowlisted override. Both remain
metered and require `network.external` + `provider.spend`. If Zen later admits the same read-only
permission envelope, its delegated standing may be re-evaluated from new evidence.

## Provider configuration

`opencode.json` registers:

- the existing local Ollama models;
- NVIDIA NIM at `https://integrate.api.nvidia.com/v1`, credential by `NVIDIA_API_KEY`; and
- Thinking Machines Tinker at
  `https://tinker.thinkingmachines.dev/services/tinker-prod/oai/api/v1`, credential by
  `TINKER_API_KEY`, with an exact bounded model set: Inkling-Small serverless, full Inkling
  serverless, Nemotron 3.5 Lightning, and Nemotron 3 Ultra.

OpenCode Zen is a built-in OpenCode provider discovered from the user-level Zen credential/model
catalog; it is not registered by repository `opencode.json`. No credential is committed and no
external model is selected as the repository default.

### External credential handling

Tinker and direct-NVIDIA credentials are resolved locally in this order:

1. the provider-specific environment variable when already populated;
2. on macOS, the provider's Keychain generic-password service for the current user.

Current Keychain services:

- Tinker: `soullab.tinker.api` → `TINKER_API_KEY`;
- NVIDIA: `ai.soullab.jarvis.nvidia-api-key` → `NVIDIA_API_KEY`.

The adapter performs a credential-free `authorize` pass first. `repo.read`, `network.external`,
read-only scope, and (for metered providers) `provider.spend` must all pass **before** JARVIS reads
Keychain. Only then may the secret be read into a local, non-exported shell variable. It is injected
only into the final credential-bearing provider-resolution child and the provider worker child.
Post-worker verification commands do **not** inherit it. The secret is not written to the Work Unit,
OpenCode arguments, result contract, logs, or repository.

If neither environment nor Keychain yields a credential, final provider resolution remains
`PROVIDER_CREDENTIAL_MISSING`. Non-macOS hosts continue to use the environment-variable path.

## Evidence

Targeted provider proof:

```text
node scripts/builder/__tests__/opencode-adapter-governance-proof.mjs
51 passed · 0 failed
```

The 51-assertion proof passes on the reconciled provider head. It proves registration, local Qwen
resolution, Zen external-network gating, fail-closed Zen automation refusal before worktree
acquisition, V1 read-only refusal, conjunctive external-network and provider-spend authority for
metered providers, missing-credential refusal, exact namespaced NVIDIA NIM model identity,
Tinker Nemotron Lightning default + Ultra override, Inkling-Small default + full Inkling override,
authority-before-Keychain ordering for both Tinker and NVIDIA, zero Keychain access on denied spend,
secret non-leakage from Keychain-hydrated attempts, worker-only credential scoping, post-worker
verification isolation, deny-before-worktree behavior, explicit `--title` injection on governed
OpenCode runs, exact model provenance, no `--auto`, and secret-free configuration.

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

## Live-evaluation accounting

What **did** happen:

- an OpenCode Zen credential was installed in the user-level credential store;
- the Tinker API key was stored locally in macOS Keychain under `soullab.tinker.api`;
- the NVIDIA API key was stored locally in macOS Keychain under
  `ai.soullab.jarvis.nvidia-api-key`;
- manual/synthetic Zen Nemotron requests were made;
- one bounded voice-review delegation attempt reached the Zen path but could not execute under the
  required JARVIS read-only boundary; it was terminated and recorded as `reject` with zero files
  changed;
- the first bounded direct-NVIDIA witness used an unqualified model id and returned HTTP 404 before
  Nemotron produced a response;
- the authorized retry reached exact `providerID=nvidia` /
  `modelID=nvidia/nemotron-3-ultra-550b-a55b` and returned exactly
  `NEMOTRON DIRECT NVIDIA WITNESS PASS`, with zero files changed and recorded cost `$0.001831`;
- that retry did **not** close the one-call witness because OpenCode automatically made an additional
  small `agent=title` NVIDIA call before the primary `jarvis-synthetic-witness` call;
- JARVIS now supplies an explicit `--title "JARVIS <work-unit-id>"` for every governed OpenCode
  run. OpenCode creates the session with that title, so its title-generation path sees a non-default
  title and returns without making the extra title-model call.

What did **not** happen:

- no fresh live NVIDIA call was made after the explicit-title repair;
- no credential was committed;
- no production member data was read or transmitted;
- no production mutation;
- no merge;
- no deployment;
- no weakening of JARVIS truth/provenance or permission authority.

## Next gate

Two provider questions remain distinct:

1. **Direct NVIDIA single-call conformance witness** — transport, credential custody, and model
   identity are proved, but the prior successful response exceeded the one-call constraint because
   of OpenCode title generation. The explicit-title repair now needs one fresh founder-authorized
   synthetic witness before `nemotron-nvidia` is called CLOSED.
2. **Tinker live witnesses** — the credential is stored in macOS Keychain and the adapter hydrates
   it only after authority passes. Each real `inkling-tinker` / `nemotron-tinker` witness still
   requires its own explicit `provider.spend` authorization.

Zen Free remains manual-only unless its upstream restriction changes.

Write-capable OpenCode remains a separate later question and is not authorized by any provider
registration or live-model success.

## 2026-09-17 amendment — Tinker transport superseded

The Tinker-through-OpenCode execution path described earlier in this record is superseded by
`JARVIS-PROVIDER-02_DIRECT_TINKER_2026-09-17.md`.

Current standing:

- Qwen local remains a governed OpenCode worker;
- OpenCode Zen Nemotron remains manual/interactive under the observed Zen Free restriction;
- project `opencode.json` no longer carries a Tinker custom-provider block;
- `inkling-tinker` and `nemotron-tinker` now resolve to the JARVIS-native `tinker-direct`
  transport;
- Tinker models receive only a locally constructed bounded evidence bundle and no model-side tools.

This amendment does not erase the failed OpenCode/Tinker live witness; that failure remains the
evidence that caused the transport change.
