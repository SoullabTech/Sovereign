# JARVIS-PROVIDER-02 — Direct Tinker Provider Seam — 2026-09-17

**Standing:** BOUNDED IMPLEMENTATION · OFFLINE PROOF GREEN · LIVE PROVIDER WITNESS NOT YET RE-RUN

## Why this lane exists

JARVIS-PROVIDER-01 proved that OpenCode is a useful governed execution surface for local Qwen
and that OpenCode Zen can provide manual Nemotron access. The live Tinker witness then exposed a
different fact: the custom Tinker provider path entered OpenCode bootstrap and stalled before a
Tinker model stream was ever created.

The response is architectural, not a workaround:

> OpenCode is one JARVIS execution transport. It is not the authority plane and it is not required
> to mediate every model provider.

JARVIS therefore keeps OpenCode for the workloads it handles well and adds a direct Tinker
transport for Inkling and Tinker-hosted Nemotron.

## Current topology

```text
JARVIS
│
├── OpenCode transport
│   ├── qwen-local
│   │   └── ollama/qwen3-coder:30b
│   ├── nemotron-nvidia
│   │   └── optional direct NVIDIA OpenCode provider
│   └── nemotron-zen
│       └── manual / interactive only under current Zen Free restriction
│
└── Direct Tinker transport
    ├── inkling-tinker
    │   ├── thinkingmachines/Inkling-Small   DEFAULT
    │   └── thinkingmachines/Inkling         explicit override
    └── nemotron-tinker
        ├── nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16   DEFAULT
        └── nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16       explicit override
```

No provider becomes JARVIS. JARVIS remains the authority, routing, evidence, custody, and
result-contract layer.

## Direct-provider authority boundary

The Tinker lane inherits the existing Work Unit laws:

- `repo.read` must be authorized;
- `repo.write:worktree` must remain `none`;
- `network.external` must be authorized;
- `provider.spend` must be authorized;
- the exact provider/model must be allowlisted;
- credential access occurs only after those authority checks pass.

The Tinker API key is resolved from an existing environment variable or the macOS Keychain service
`soullab.tinker.api`. It is injected only into the provider-resolution child and direct provider
worker. Post-worker verification does not inherit it.

## External evidence membrane

Direct Tinker models receive **no filesystem, shell, web, skill, or subagent tools**.

Instead, JARVIS locally constructs a bounded evidence bundle from the Work Unit's exact
`allowed_files` list.

The bundler:

- accepts exact relative files only;
- rejects globs;
- rejects path traversal;
- rejects symlinks;
- rejects directories;
- rejects `.env`, private-key/keystore formats, credential files, and `data/vault`;
- rejects binary files;
- caps one file at 128 KiB;
- caps the total bundle at 512 KiB;
- caps the bundle at 12 files.

A `NO FILES` sentinel produces an empty repository-evidence bundle for synthetic provider tests.

Therefore the external model cannot discover additional repository material on its own. What crosses
the network is what JARVIS explicitly admitted.

## Tinker transport

`scripts/builder/tinker-direct.mjs` uses Tinker's Anthropic-compatible Messages endpoint:

```text
https://tinker.thinkingmachines.dev/services/tinker-prod/anthropic/api/v1/messages
```

The transport:

- makes one HTTP request per JARVIS attempt;
- sends no tool definitions;
- accepts only allowlisted model ids;
- caps prompt bytes and output tokens;
- treats provider `tool_use` as a hard failure;
- discards reasoning/thinking blocks and returns only answer text;
- does not implement a client-side retry loop;
- never places the API key in request bodies, Work Units, logs, or result contracts.

Tinker documentation describes this compatible API as an internal/evaluation interface that accepts
Inkling, base models, and fine-tuned checkpoints. Nemotron remains registered as a base-model route;
a later live witness must still prove account/model availability for the exact selected model.

## OpenCode configuration change

The Tinker custom-provider block is removed from project `opencode.json`.

That removal is deliberate:

- the custom OpenCode Tinker path stalled at initialization during the founder-authorized live
  witness;
- JARVIS no longer depends on that path;
- OpenCode remains focused on its proven local/interactive responsibilities;
- Tinker credential custody no longer needs to enter OpenCode at all for normal JARVIS routing.

## Offline proof

Exact branch proof after the direct-provider implementation:

```text
node scripts/builder/__tests__/opencode-adapter-governance-proof.mjs
39 passed · 0 failed

node scripts/builder/__tests__/tinker-direct-proof.mjs
12 passed · 0 failed

node scripts/builder/__tests__/external-context-proof.mjs
9 passed · 0 failed
```

The proofs establish:

- five bounded provider classes remain explicit;
- Qwen continues through OpenCode;
- Zen automated delegation remains fail-closed;
- Tinker models resolve only after network + spend + credential authority;
- Tinker providers are marked `tinker-direct`;
- denied Tinker spend does not touch Keychain;
- Keychain secrets reach only the direct worker and do not leak to results/verification;
- direct Inkling routing preserves exact model provenance;
- the direct worker receives JARVIS-bundled allowlisted file evidence;
- direct HTTP makes exactly one request;
- no model tools are exposed;
- unexpected tool use and non-2xx provider results fail closed;
- hostile file paths and secret-bearing paths are refused.

## Live-witness accounting

The previous founder-authorized Tinker witness is **closed as failed/stopped**:

- Inkling-Small attempt count: 1;
- OpenCode stalled at initialization before a `providerID=tinker` model-stream record appeared;
- process was terminated after the bounded observation;
- result: reject;
- file changes: 0;
- secret-leak check: PASS;
- Nemotron-Tinker call: NOT MADE;
- no retry was attempted.

This new direct transport has **not** consumed another metered provider call.

## Current stop

```text
DIRECT TINKER IMPLEMENTATION      COMPLETE
OFFLINE PROOF                    PASS
LIVE INKLING DIRECT WITNESS      CLOSED / NOT AUTHORIZED
LIVE NEMOTRON DIRECT WITNESS     CLOSED / NOT AUTHORIZED
NORMAL TINKER USE                NOT AUTHORIZED
WRITE-CAPABLE EXTERNAL MODELS    NOT AUTHORIZED
MERGE                            NOT AUTHORIZED
DEPLOYMENT                       NOT AUTHORIZED
PRODUCTION                       UNTOUCHED
```

A new founder grant is required before re-running any paid Tinker inference against the direct seam.
