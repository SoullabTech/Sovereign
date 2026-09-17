# JARVIS Dual Execution Engine Adapter — 2026-09-17

**Status:** bounded candidate implementation; not canonical until reviewed/merged.
**Branch:** `chore/jarvis-dual-engine-20260917`
**Base:** `cfe4529ec74671c9be9c4271e37cb190c239bfad`

## Finding

JARVIS already has the correct authority substrate: canonical Work Units, isolated
worktrees, Builder ownership, permission envelopes, independent verification, compact
results, and an evidence ledger. OpenCode and Backboard R-CLI therefore enter as
**execution engines**, not as new authorities, memories, or task lanes.

> Engine selection may change how work is executed. It must not change what work is
> authorized.

## Adapter boundary

`scripts/builder/jarvis-execution-engine.mjs` translates the existing
`repo_write_scope` into harness-specific controls. It never grants scope itself.

- `none` → read/reason only.
- `worktree` → edits may occur inside the isolated worktree.
- Any unknown scope or engine fails closed.
### OpenCode

Default witnessed model: `ollama/qwen2.5:7b` (local, no provider credential). `opencode/nemotron-3-ultra-free` remains selectable explicitly; on 2026-09-17 its OpenCode free-tier gateway returned `403 FreeTierError`, so it is not the fail-open default.

The JARVIS adapter runs OpenCode in pure, non-interactive mode with an inline permission
profile. Reads/search/LSP are allowed. Edits are allowed only for `worktree` scope.
Shell, external-directory access, web tools, sub-agents, and question tools are denied.
The adapter never passes OpenCode's blanket `--auto` permission flag.

### Backboard R-CLI

R-CLI runs with `--memory off --fresh`, so its session memory cannot become JARVIS
or MAIA memory. Worktree writes use `acceptEdits`; read-only work stays in `manual`.
The `Execute`, `WebSearch`, and `Agent` tools are removed from these JARVIS runs.
The adapter never uses `bypass`.

R-CLI defaults to the no-auth `jarvis-local/qwen2.5:7b` custom provider, pointed at local Ollama. An explicit model override may select another configured provider. The adapter does not copy credentials from OpenCode or another provider. R-CLI writes local checkpoint/session state under `.backboard/sessions`; JARVIS removes that ephemeral directory after a run when it did not pre-exist, while preserving the external JARVIS execution log.

## Integration authority

Both engines receive an explicit final boundary: do not commit, push, merge, deploy,
contact production, or change governance/authority. They leave edits uncommitted.
JARVIS re-runs packet verification commands independently and remains the integration
actor.

This is intentionally stricter than the historical local/Kimi worker harness. Existing
lanes are not silently retrofitted in this change.
## Command surface

The existing packet remains unchanged:

```bash
scripts/ain-delegate.sh opencode <work_unit_id> [provider/model]
scripts/ain-delegate.sh rcli     <work_unit_id> [provider/model]
```

Each command reads the packet's existing `execution_lane`; the engine choice does not
rewrite it. Result and ledger records gain additive `engine` provenance.

## Proof obligations

`scripts/builder/__tests__/execution-engine-adapter-proof.mjs` verifies:

1. OpenCode defaults to the witnessed local Qwen model.
2. OpenCode never receives blanket auto approval.
3. OpenCode cannot use shell, external directories, web, or sub-agents.
4. Read-only Work Units cannot be edited.
5. R-CLI removes Execute and disables memory.
6. R-CLI uses acceptEdits/manual, never bypass.
7. R-CLI does not invent a provider/model.
8. JARVIS retains commit/push/merge/deploy authority.
9. Unknown engine/scope values fail closed.

The proof is appended to the repository's existing `npm run jarvis:proof` gate.

## Explicit non-scope

No deploy, production database access, canonical merge, automatic engine routing,
MAIA/member memory integration, credential migration, or automatic founder decision is
authorized by this adapter.
