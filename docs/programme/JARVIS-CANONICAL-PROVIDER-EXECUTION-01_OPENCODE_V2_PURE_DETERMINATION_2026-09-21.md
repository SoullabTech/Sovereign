# JARVIS-CANONICAL-PROVIDER-EXECUTION-01 — OpenCode v2 `--pure` Determination

**Date:** 2026-09-21
**Lane:** E1 canonical provider execution — bounded repair act opened after the E3 STOP
**Status:** DETERMINATION COMPLETE · ⛔ REPAIR NOT TAKEN · ⛔ NO CODE CHANGED · ⛔ NO NEW GRANT MINTED

## 0. What this act was asked to do

After the E3 one-shot boundary, `DR1 = failed / DURABLE_NONZERO_EXIT` was traced
to the canonical E1 launch line:

```
opencode run --pure --agent jarvis-readonly --model ollama/qwen3-coder:30b <prompt>
```

against installed `opencode v2.0.12`, which answered
`Unrecognized flag: --pure in command opencode run`.

The authorized next move was: **determine the v2.0.12 replacement semantics for
`--pure`**, repair only the canonical command seam, prove the replacement does
not weaken `jarvis-readonly` / sandbox containment, and only then authorize a
fresh, distinct one-shot Qwen witness.

This record discharges the **first** clause only.

## 1. Evidence class

All findings below are **ENTAILED FROM VERSION-PINNED UPSTREAM SOURCE**, not
witnessed against the installed binary. The evidence object is a shallow clone
of `sst/opencode` at tag `v2.0.12`, commit
`2670273ff17da96f85c5826ced57aa1b368754fa`, plus tag `v1.4.9`
(`803d9eb7ad5f4dfd832d7506a7cad83ded52253e`) fetched for the v1 comparison.

The installed Mac Studio binary reports `opencode v2.0.12`, which matches the
tag. That match is an inference from a version string, not a hash. **§6 names
the one host probe that converts this determination from entailed to witnessed.**

## 2. ⭐ THE DETERMINATION — THERE IS NO REPLACEMENT

### 2.1 What `--pure` actually was

At `v1.4.9`, `packages/opencode/src/index.ts:83`:

```
.option("pure", { describe: "run without external plugins", type: "boolean" })
```

and the middleware at `:88` does exactly one thing — `process.env.OPENCODE_PURE = "1"`.

Its only two consumers:

- `packages/opencode/src/plugin/index.ts:163` — *"skipping external plugins in pure mode"*
- `packages/opencode/src/cli/cmd/tui/plugin/runtime.ts:994` — same, for TUI plugins

`--pure` was a **root-level global option**, which is why `opencode run --pure`
parsed under yargs at all.

⭐ **`--pure` was never a sandbox, config-isolation, session-purity or
permission control.** It carried exactly one property:

> **P-PURE — external plugins declared in loaded configuration are not loaded.**

### 2.2 What v2.0.12 offers

`opencode run` at v2.0.12 (`packages/cli/src/commands/commands.ts:354`) accepts:

`--continue/-c` · `--session/-s` · `--fork` · `--model/-m` · `--agent` ·
`--format` · `--file/-f` · `--title` · `--thinking`
· `--standalone` · `--server`
· `--auto` · `--yolo` (hidden) · `--dangerously-skip-permissions` (hidden)

- **No `--pure`.**
- **`OPENCODE_PURE` does not appear anywhere in the v2.0.12 tree.** The
  environment-variable path the flag used is gone as well, so "set the variable
  the flag used to set" is not available either.
- There is no plugin *disable* directive in the v2 schema: `ConfigPlugin.Plugins`
  (`packages/schema/src/config/plugin.ts`) is an ordered list of package
  declarations with no enablement/negation form.

⚠️ **`--auto` is not the successor.** The v1 compatibility bridge
(`packages/cli/src/run/v1.ts`) maps v1 `--dangerously-skip-permissions` onto
native `auto`. `--auto` auto-approves permissions that are not explicitly
denied — it moves containment in the **opposite** direction and must never be
reached for while looking for a `--pure` stand-in.

### 2.3 The consequence

**P-PURE has no flag-level or environment-level successor in v2.0.12.** The
repair is therefore *not* a flag rename. To preserve the property, P-PURE must
be re-established by a **different mechanism**, or it must be recorded as lost.

## 3. ⚠️ A SECOND PROPERTY IS AT RISK, AND IT WAS NOT IN THE ORIGINAL QUESTION

v2 introduces a **background service**. `--standalone` is documented as *"Run
with a private server instead of the background service"*, which makes the
background service the **default**.

`opencode run` does not execute the model in the spawned child. It drives a
server. Under the default, that server is a long-lived shared process whose
environment, configuration and plugin set were fixed **whenever it started** —
not by the environment `providerChildEnv()` builds, and not by the sandbox cwd
`materializeCanonicalEvidenceSandbox()` creates.

With `--standalone` (`packages/cli/src/services/standalone.ts`) the CLI spawns
`opencode serve --stdio --port 0` as its own child with `extendEnv: true`, so
the child environment **is** inherited, and the server's lease ends when the run
ends.

⭐⭐ **Therefore: deleting `--pure` and changing nothing else would not merely
drop P-PURE — it would silently relocate canonical provider execution from a
private process into a shared, long-lived server that JARVIS does not
parameterize.** That is a larger containment change than the one the repair was
opened to make, and it would have arrived as a side effect of deleting a dead
flag. Name it:

> **P-PRIVATE — the process that loads configuration, plugins and providers for a
> canonical run is created by, parameterized by, and destroyed with that run.**

P-PRIVATE was held implicitly by v1's one-shot process model. In v2 it is held
only by `--standalone`.

## 4. The mechanism that could re-establish P-PURE — ⛔ recommended, not taken

v2.0.12 reads the config entry set from (`packages/cli/src/server-process.ts`):

- `OPENCODE_CONFIG_DIR` — replaces the global config directory
- `OPENCODE_CONFIG` — explicit config file
- `OPENCODE_CONFIG_PROJECT_DISABLE` / `OPENCODE_DISABLE_PROJECT_CONFIG`
- project configuration discovered from the working directory

⭐ **In v1, `--pure` let JARVIS load the operator's global config — which is
where `ollama/qwen3-coder:30b` resolves from — while refusing the external
plugins declared beside it. v2.0.12 offers no such separation: configuration and
its plugins arrive together.** So P-PURE can only be re-established by **owning
the config entry set**: pointing `OPENCODE_CONFIG_DIR` at a sandbox-owned
directory holding a minimal configuration that declares the authorized provider
and nothing else.

That is **strictly stronger** than `--pure` — no foreign provider, no foreign
credential reference, no plugin declaration can be present to be skipped. It is
also **not a flag change**: it changes what
`materializeCanonicalEvidenceSandbox()` materializes. Today that function copies
exactly one file, `.opencode/agents/jarvis-readonly.md`; the provider definition
currently reaches the run from outside the sandbox.

⛔ **Two traps recorded so the next act does not walk into them:**

1. **Do not set `OPENCODE_DISABLE_PROJECT_CONFIG`.** Agents are loaded through
   `config.entries()` (`packages/core/src/config/plugin/agent.ts`), so disabling
   project configuration would plausibly drop `jarvis-readonly` itself — and a
   run that silently falls back to a default agent has lost the entire
   permission block, while still exiting 0.
2. **Do not treat "the model resolved" as evidence of containment.** Today the
   model ref resolves *because* foreign configuration is being read. A repair
   that keeps it resolving the same way has preserved the defect, not the
   property.

## 5. What the repair now needs from the founder

The determination changes the shape of the act. Three rulings are owed before
any line of the seam is edited:

- **R-A — P-PURE**: re-establish by sandbox-owned `OPENCODE_CONFIG_DIR` +
  materialized minimal provider config (recommended), or record P-PURE as
  deliberately surrendered with reasons.
- **R-B — P-PRIVATE**: add `--standalone` to the canonical command, or rule
  explicitly that canonical provider execution may run on the shared background
  service.
- **R-C — scope**: whether the same dead flag at
  `jarvis-desktop/src/frontier-worker.js:166` and `scripts/ain-delegate.sh:402,404`
  is repaired in this act or routed out. ⭐ *The lane that finds a defect does
  not thereby own it* — both are the identical v1-flag defect and both are
  outside E1's canonical seam. `jarvis-desktop/test/frontier-worker.test.mjs:80`
  asserts the dead flag positionally, so the frontier test currently **locks the
  defect in**.

## 6. Owed before anything is called witnessed

One read-only probe on the Mac Studio, which costs nothing and converts §2 from
entailed to witnessed against the binary that actually runs:

```
opencode --version
opencode run --help
```

Expected: version `2.0.12`; a flag list containing `--standalone`, `--agent`,
`--model`, `--auto`, and **no `--pure`**. ⛔ If the installed help shows `--pure`,
this determination is INSTRUMENT FAILURE and §2 is void — the installed binary
is not the tag it reports.

## 7. Falsifiers owed by any candidate repair (⛔ none authored)

- **F-P1** — a candidate that resolves `ollama/qwen3-coder:30b` while the
  operator's global config directory is unreadable to the child. Fails if
  resolution depended on foreign configuration.
- **F-P2** — a plugin declaration placed in the operator's global config is
  **not** loaded by a canonical run. Fails if P-PURE was not re-established.
- **F-P3** — the agent in force is `jarvis-readonly`, asserted from run output,
  **not** inferred from exit code 0. Guards trap §4.1.
- **F-P4** — the server process serving a canonical run exits when the run
  exits. Guards P-PRIVATE.
- **F-P5** — an `edit`/`bash` attempt inside the run is refused. This is the
  permission block, unchanged by this repair, and is the discriminator that
  proves the new command did not quietly widen authority.

## 8. Standing

```
--pure v1 semantics            ✅ DETERMINED (external plugins only)
v2.0.12 successor flag         ✅ DETERMINED — NONE EXISTS
OPENCODE_PURE env path         ✅ DETERMINED — REMOVED IN v2
P-PRIVATE risk                 ⚠️ FOUND, NOT IN THE ORIGINAL QUESTION
Host --help corroboration      ⛔ OWED
R-A / R-B / R-C rulings        ⛔ OWED
Canonical seam                 ⛔ UNCHANGED
frontier-worker / ain-delegate ⛔ UNCHANGED, ROUTED OUT
E3 grant                       ⛔ CONSUMED — NOT REUSABLE
New one-shot witness           ⛔ NOT AUTHORIZED
Repository mutation            documentation only
```

⭐ *The flag that broke was carrying one property, and the property it was
carrying is not the property its absence most endangers.*
