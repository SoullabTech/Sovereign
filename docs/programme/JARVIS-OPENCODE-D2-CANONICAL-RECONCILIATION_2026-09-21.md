# JARVIS OpenCode D2 — Canonical Reconciliation

**Date:** 2026-09-21  
**Status:** RECONCILED CANONICAL RECORD  
**Applies to:** merged PR #1425 (`f4fbdd00421effd94034c61fe3b064145781d015`) and successor Qwen transport work.

## Why this record exists

Earlier D1b/D1c analysis on an experimental branch classified `OPENCODE_CONFIG_PROJECT_DISABLE` as a value that must be stripped because disabling project discovery would also remove the project-discovered governed agent. That conclusion was correct for the then-assumed delivery mechanism, but the premise changed before canonical implementation landed.

OpenCode v2 exposes project discovery control through the server-process environment mapping:

`OPENCODE_CONFIG_PROJECT_DISABLE=1` → `config.project=false`.

That disables the ancestor/project discovery walk directly.

## Canonical correction

PR #1425 moved JARVIS's governed OpenCode provider/agent configuration into one explicit inline `OPENCODE_CONFIG_CONTENT` channel. In that implementation:

- `HOME`, `XDG_CONFIG_HOME`, and `XDG_DATA_HOME` are rebound to private temporary roots;
- `OPENCODE_CONFIG` and `OPENCODE_CLI_CONFIG_CONTENT` are removed;
- project discovery is deliberately disabled with `OPENCODE_CONFIG_PROJECT_DISABLE=1` / `OPENCODE_DISABLE_PROJECT_CONFIG=1`;
- `jarvis-readonly` is supplied inline, so disabling project discovery no longer removes the governed agent;
- the project `.opencode` surface is removed before the private OpenCode server starts.

Therefore the earlier D1b statement **“MUST STRIP because it would drop the governed agent”** is superseded for this canonical implementation. The kill switch and the inline-agent channel are one composed containment mechanism.

## XDG cache asymmetry

`XDG_CACHE_HOME` is intentionally not rebound when an existing cache root is available. The purpose is reuse of already-installed provider/package cache material without reinstalling dependencies for every isolated run.

This cache is **not configuration authority** in the canonical envelope:

- configuration roots remain private;
- project discovery is disabled;
- provider and agent law come from explicit inline config;
- cache reuse does not widen repository, provider, network, or execution authority.

If a future OpenCode version begins treating XDG cache content as executable/configuration authority, this exception must be re-adjudicated rather than inherited.

## Qwen successor transport

The canonical Qwen verification lane subsequently proved that OpenCode's headless tool/session teardown was not reliable enough for one-shot E1 verification. Qwen verification therefore adopts the pre-existing Unit 9 native transport primitive from `chore/jarvis-unit-9-native-transport`:

`scripts/builder/jarvis-local-worker.mjs`

That worker is toolless by construction and sends exactly the bounded prompt to local Ollama `/api/generate`. The E1 Qwen transport binds to it as `ollama-direct`; OpenCode remains a separate governed development/review substrate rather than a required Qwen verification hop.

## Guard relocation after Qwen direct

When Qwen verification moved to `ollama-direct`, GPT-OSS remained the active local
`execution_adapter = opencode` reviewer. The D2 containment envelope therefore follows
the surviving local OpenCode adapter rather than the former Qwen-specific subject:
GPT-OSS launches with `--standalone`, private HOME/config/data roots, project discovery
disabled, and a single inline `jarvis-readonly` configuration. The containment test is
bound to that live GPT-OSS path instead of being deleted with the former Qwen/OpenCode path.

## Standing

- PR #1425 containment law: **correct under the inline-agent composition**.
- Earlier D1b/D1c contrary conclusion: **superseded by changed implementation premise**.
- `XDG_CACHE_HOME` sharing: **intentional cache-only exception; not authority**.
- Unit 9 native worker: **canonical transport primitive for direct local Qwen verification once the successor transport PR is merged**.
- No statement here grants merge, deploy, production, network, provider-spend, or authority-change capability.
