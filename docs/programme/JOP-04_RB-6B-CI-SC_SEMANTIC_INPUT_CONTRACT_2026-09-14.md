# JOP-04 · RB-6B-CI-SC — Semantic Input Contract · Description

**Date:** 2026-09-14 · **Mode:** ⛔ **DESCRIPTION ONLY**
⛔ No defaults moved · no schema deleted · no `max_results` repair · no path repair ·
no canonical hashes · no execution decision · no object shape designed.

> **The contract describes REALITY, including defects. It must not pretend the intended semantics
> already exist.**

---

## 0 · Rulings frozen into this contract

**R1 — H1 / H2 / H3 are distinct contract failures and are not collapsed.**

```text
H1  HIDDEN SEMANTIC INPUT              a default exists only inside the handler
H2  DECLARED BUT SEMANTICALLY UNUSED   the schema distinguishes values the act does not
H3  DECLARED + DEFAULTED + VALIDATED,  the boundary reasons about a value that never
    BUT NOT EXECUTED                   reaches the act
```

⭐ **H3 is the most consequential: the system currently appears to have enforced semantics it did not
actually execute.** A future authority layer could falsely believe `repo.grep` was bounded.

**R2 — Argument role is declared, never inferred.**

> **Path semantics are a property of the argument contract, never inferred from the characters
> contained in a string.**

⛔ Spelling-based path inference in `runCapability` is **ARCHITECTURALLY SUPERSEDED** — ⚠️ **recorded,
not repaired.**

**R4 — Semantic source is a first-class capability property** (§3).
**R5 — `check.run` is held from RB-6B authority** (§5).
**R6 — Option (a) survives conditionally** (§6).

## 1 · ⭐ Role taxonomy — with one category the registry forced

The proposed roles were `PATH · REF · PATTERN/REGEX · SYMBOL · ENUM · COUNT/LIMIT · BOOLEAN · FREE TEXT`.
**The registry requires a ninth:**

```text
PATHSPEC   a git pathspec — NOT a filesystem path and NOT a regex
```

`git.log.path`, `git.file_history.file`, `repo.find_file.pattern`, `inventory.*.dir` are all passed
to `git ls-files` / `git log -- <spec>`. **A git pathspec is its own language**: glob semantics,
directory-prefix matching, and magic prefixes (`:(exclude)`, `:(glob)`, `:(icase)`) that change what
is matched.

⭐ **Calling these `PATH` would misdescribe the act.** `inventory.routes { dir: 'app' }` does not open
a directory — it asks git to list tracked files matching a pathspec. ⚠️ And a value carrying a magic
prefix is a *matching directive*, not a location — a distinction the boundary's `startsWith('/') ||
includes('../')` heuristic cannot make at all.

⛔ **Named as a role, not repaired.**

## 2 · Per-capability semantic input contract

**Consumption:** `CONSUMED` · `CONDITIONAL` · `H1` hidden default · `H2` unused · `H3` defaulted-then-ignored · `DERIVED`
**Regime:** `(i)` resolved & consumed · `(ii)` pathspec to git · `(iii)` not a path

| Capability | Input | Role | Required | Default | Normalization | Executed representation | Consumption | Authority-relevant |
|---|---|---|---|---|---|---|---|---|
| **`git.rev_parse`** | `ref` | REF | no | **`HEAD`** *(handler)* | none | `['rev-parse', ref]` | **H1** | yes |
| **`git.log`** | `format` | ⚠️ **UNDETERMINED** | no | — | none | ⛔ **none** | **H2** | ⚠️ unknowable |
| | `max_count` | COUNT | no | — | none | `-N` | CONDITIONAL | yes |
| | `path` | **PATHSPEC** (ii) | no | — | none | `-- <spec>` | CONDITIONAL | yes |
| **`git.show_stat`** | `ref` | REF | no | **`HEAD`** | none | `['show','--stat',ref]` | **H1** | yes |
| **`git.diff_stat`** | `ref1` | REF | no | **`HEAD~1`** | none | `['diff','--stat',r1,r2]` | **H1** | yes |
| | `ref2` | REF | no | **`HEAD`** | none | ″ | **H1** | yes |
| **`git.branch_contains`** | `branch` | REF | **yes** | — | none | `merge-base --is-ancestor` | CONSUMED | yes |
| | `commit` | REF | no | **`HEAD`** | none | ″ | **H1** | yes |
| **`git.file_history`** | `file` | **PATHSPEC** (ii) | **yes** | — | none | `-- <spec>` | CONSUMED | yes |
| | `max_count` | COUNT | no | — | none | `-N` | CONDITIONAL | yes |
| **`repo.grep`** | `pattern` | PATTERN | **yes** | — | none | `git grep -r … <pattern> .` | CONSUMED | yes |
| | `max_results` | LIMIT | no | **`200`** | bound-checked ≤200 | ⛔ **none** | 🔴 **H3** | ⚠️ **falsely appears bounded** |
| **`repo.find_file`** | `pattern` | **PATHSPEC** (ii) | **yes** | — | none | `ls-files <spec>` | CONSUMED | yes |
| **`repo.locate_symbol`** | `symbol` | SYMBOL | **yes** | — | none | **`\b${symbol}\b`** | **DERIVED** | yes |
| **`check.run`** | `test_type` | ENUM | **yes** | — | enum-checked | `node <repo>/scripts/builder/run-check.mjs <t>` | CONSUMED | ⚠️ **§5** |
| **`inventory.migrations`** | `dir` | **PATHSPEC** (ii) | no | **`database/migrations`** | none | `ls-files <spec>` | **H1** | yes |
| **`inventory.routes`** | `dir` | **PATHSPEC** (ii) | no | **`app`** | none | `ls-files <spec>` | **H1** | yes |
| **`verify.file_exists`** | `path` | PATH (i) | **yes** | — | **`resolve(cwd,·)`** | **the resolved path** | ⭐ CONSUMED | yes |
| **`verify.sha256`** | `path` | PATH (i) | **yes** | — | **`resolve(cwd,·)`** | **the resolved path** | ⭐ CONSUMED | yes |
| **`verify.count_matches`** | `pattern` | PATTERN | **yes** | — | `new RegExp(·,'g')` | compiled regex | DERIVED | yes |
| | `file` | PATH (i) | **yes** | — | **`resolve(cwd,·)`** | **the resolved path** | ⭐ CONSUMED | yes |

⚠️ **`git.log.format`'s role is `UNDETERMINED` and that is the honest entry.** Because nothing consumes
it, **its intended semantics cannot be recovered from the code.** ⛔ Assigning it a role would be
inventing the contract rather than describing it — §4's A-or-B in miniature.

## 3 · Capability-level contract

| Capability | Semantic source | Ambient dependencies | Repo-authored execution? | `BOUND = EXECUTED` | Canonicalization status |
|---|---|---|---|---|---|
| `git.rev_parse` · `git.show_stat` · `git.diff_stat` · `git.branch_contains` | REGISTRY_DEFINED | `cwd` · repo refs/history · `git` binary | no | ❌ H1 | **REQUIRES CONTRACT REPAIR** |
| `git.log` | REGISTRY_DEFINED | ″ | no | ❌ H2 | **REQUIRES CONTRACT REPAIR** |
| `git.file_history` | REGISTRY_DEFINED | ″ | no | ⚠️ pathspec role undeclared | **REQUIRES CONTRACT REPAIR** |
| `repo.grep` | REGISTRY_DEFINED | `cwd` · index/worktree · `git` | no | ❌ H3 | **REQUIRES CONTRACT REPAIR** |
| `repo.find_file` | REGISTRY_DEFINED | ″ | no | ⚠️ pathspec role undeclared | **REQUIRES CONTRACT REPAIR** |
| `repo.locate_symbol` | REGISTRY_DEFINED | ″ | no | ❌ derived | **REQUIRES CONTRACT REPAIR** |
| `inventory.migrations` · `inventory.routes` | REGISTRY_DEFINED | ″ | no | ❌ H1 + pathspec | **REQUIRES CONTRACT REPAIR** |
| `verify.file_exists` · `verify.sha256` | REGISTRY_DEFINED | `cwd` · filesystem · Node | no | ⭐ **✅ YES** | ⭐ **READY** |
| `verify.count_matches` | REGISTRY_DEFINED | ″ | no | ⭐ **✅ YES** | ⭐ **READY** |
| 🔴 **`check.run`** | 🔴 **REPOSITORY_DEFINED** | `cwd` · **a script in the bound repo** · `package.json` scripts · `node_modules` · toolchain · env | 🔴 **YES** | ❌ inputs do not determine the act | 🔴 **BLOCKED — DELEGATED REPOSITORY EXECUTION** |

```text
READY                            3 / 15
REQUIRES CONTRACT REPAIR        11 / 15
BLOCKED BY DELEGATED EXECUTION   1 / 15
```

## 4 · ⛔ Ignored vs irrelevant — still not adjudicated

```text
A. the SCHEMA is wrong   — the argument should not exist
B. the HANDLER is wrong  — the argument was intended to affect execution
```

⚠️ For **H3** (`repo.grep.max_results`) the evidence leans to **B**: a bound check written for a value
that is then discarded is not a vestigial field, it is an unfinished one. ⛔ **Leaning is not ruling.**
For **H2** (`git.log.format`) there is no evidence either way — hence `UNDETERMINED`.

## 5 · 🔴 Unresolved record — `check.run`

```text
CAPABILITY                 check.run
SEMANTIC SOURCE            REPOSITORY_DEFINED
CANONICALIZATION STATUS    BLOCKED — DELEGATED REPOSITORY EXECUTION
```

**Frozen law:**

> **A repository-defined capability may not receive a canonical act identity as though the registry
> fully determines its semantics.**

⛔ **RB-6B may not later issue an execution decision for `check.run(typecheck)` from only**
`capability = check.run · test_type = typecheck · repo_root = X` — **those facts do not specify the
act performed.**

**Unresolved semantic substrate (at least):**

```text
scripts/builder/run-check.mjs      ← inside the bound repository
package.json script resolution     ← typecheck → npm run typecheck
executable / toolchain dependencies
relevant environment
possibly more
```

⛔ **Not decided:** repository commit/tree identity · script/content digest · executable-plan
materialization · pinned toolchain identity · some combination. **Each needs its own census.**

⭐ **This is a different authority relationship, not another ambient dependency.** The system is not
saying *"run this operation against the repository."* It is partly saying: ***"let the repository tell
us what this operation means."***

⚠️ **And note where that lands constitutionally:** `check.run` is a *read* capability by effect, but
its meaning is authored by the same repository a future write capability would act upon. **It is the
one place the current registry already delegates code authority.**

## 6 · Option (a) — the precise result

```text
SUPPORTED       capabilities whose act semantics are registry-defined and fully reconstructible
BLOCKED         unresolved H2 / H3 contracts
NOT SUFFICIENT  repository-defined execution such as check.run
```

⭐ **The census did not disprove the mechanism. It disproved its universality.** The three `verify.*`
handlers are **positive evidence already in the organism**: *canonicalize before dispatch → execute
the canonical value* is a proven pattern here, not a proposal.

## 7 · ⭐ Invocation identity vs execution-plan identity

For registry-defined capabilities these may closely coincide:

```text
canonical invocation → deterministic argv
```

`check.run` shows they can come apart:

```text
canonical invocation → repository program → execution plan
```

> **A future authority system may need to bind an EXECUTION PLAN for this class, rather than merely
> an invocation request.**

⛔ A later question — **named now so `check.run` is not forced into the wrong abstraction**, which is
exactly what would happen if it were quietly canonicalized alongside the other fourteen.

---

```text
CAPABILITIES CONTRACTED     15 / 15 · description only
ROLE TAXONOMY               9 roles — PATHSPEC forced by the registry
UNDETERMINED ROLE           git.log.format — intended semantics unrecoverable from code
H1 · H2 · H3                frozen as distinct failures
SPELLING-BASED PATH INFER.  ARCHITECTURALLY SUPERSEDED — recorded, not repaired
SEMANTIC SOURCE             14 REGISTRY_DEFINED · 1 REPOSITORY_DEFINED
BOUND = EXECUTED            3 / 15
STATUS                      READY 3 · REQUIRES CONTRACT REPAIR 11 · BLOCKED 1
check.run                   HELD from RB-6B authority · own unresolved record
OPTION (a)                  supported / blocked / not sufficient — not universal

NOTHING REPAIRED · RB-6B IMPLEMENTATION STILL BLOCKED
```

> **Before the system can truthfully bind an act, each capability must declare not merely what
> arguments it accepts, but where the meaning of the act comes from.**
