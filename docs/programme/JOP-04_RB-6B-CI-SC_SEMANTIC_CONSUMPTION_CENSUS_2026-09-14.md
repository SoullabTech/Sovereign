# JOP-04 · RB-6B-CI-SC — Semantic Consumption Census

**Run:** 2026-09-14 · **Method:** read-only, every handler in `scripts/builder/deterministic.mjs` read in full
⛔ **No registry repair · no default moved · no schema deleted · no hashing · no RB-6B implementation.**

> **Before you can authorize an act, the system has to be able to say what act it is actually going
> to perform.**

---

## 0 · L6, frozen

> **L6 — Act identity is defined by the canonical semantic inputs actually consumed by execution, not
> by the request shape or declared schema alone.**
>
> **Corollary: the thing whose identity is bound must be the thing the handler actually consumes.**

Neither of these is safe:

```text
hash(request)         hash(validatedArgs)
```

⭐ **Both produce a perfectly deterministic identity for the wrong thing.**

```text
H1   schema UNDER-specifies    {}         declared  ·  HEAD    performed
H2   schema OVER-specifies     format:'a' declared  ·  ignored performed
```

## 1 · ⛔ Correction to the CI design

The CI design said hidden defaults appear in **six** capabilities. **It is eight defaults across
seven capabilities.** My grep pattern `args\.[a-z_]*` could not match the digits in `ref1` / `ref2`,
so `git.diff_stat` was missed. Corrected here; the CI design's §4 is superseded on the count, not on
the finding.

## 2 · Semantic consumption matrix — all 15 capabilities

**Legend:** D declared · V validated · **F** defaulted-in-handler · N normalized · R resolved ·
**C** consumed · **I** ignored · **X** derived/transformed

| Capability | Arg | D | V | F | R | C | I | X | Identity consequence |
|---|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|---|
| `git.rev_parse` | `ref` | ✓ | ✓ | **HEAD** | | ✓ | | | 🔴 default must be materialized |
| `git.log` | `format` | ✓ | ✓ | | | | **✓** | | 🔴 **H2** — declared, never read |
| | `max_count` | ✓ | ✓ | | | cond | | | conditional (`if (args.max_count)`) |
| | `path` | ✓ | ✓ | | | cond | | | raw to git; ⚠️ not resolved |
| `git.show_stat` | `ref` | ✓ | ✓ | **HEAD** | | ✓ | | | 🔴 default |
| `git.diff_stat` | `ref1` | ✓ | ✓ | **HEAD~1** | | ✓ | | | 🔴 default *(missed by the CI design)* |
| | `ref2` | ✓ | ✓ | **HEAD** | | ✓ | | | 🔴 default *(missed)* |
| `git.branch_contains` | `branch` | ✓ | ✓ | | | ✓ | | | |
| | `commit` | ✓ | ✓ | **HEAD** | | ✓ | | | 🔴 default |
| `git.file_history` | `file` | ✓ | ✓ | | | ✓ | | | ⚠️ path-shaped, raw to git |
| | `max_count` | ✓ | ✓ | | | cond | | | |
| `repo.grep` | `pattern` | ✓ | ✓ | | | ✓ | | | ⚠️ boundary may path-check it (§5) |
| | `max_results` | ✓ | ✓ | **200** | | | **✓** | | 🔴🔴 **H3 — defaulted, bound-checked, then NEVER APPLIED** |
| `repo.find_file` | `pattern` | ✓ | ✓ | | | ✓ | | | ⚠️ path-shaped, raw to `git ls-files` |
| `repo.locate_symbol` | `symbol` | ✓ | ✓ | | | | | **`\b…\b`** | 🔴 executed value ≠ bound value |
| `check.run` | `test_type` | ✓ | ✓ | | | ✓ | | | ⚠️ see §7 — argv is not the act |
| `inventory.migrations` | `dir` | ✓ | ✓ | **database/migrations** | | ✓ | | | 🔴 default |
| `inventory.routes` | `dir` | ✓ | ✓ | **app** | | ✓ | | | 🔴 default |
| `verify.file_exists` | `path` | ✓ | ✓ | | **✓** | ✓ | | | ⭐ handler resolves AND consumes resolved |
| `verify.sha256` | `path` | ✓ | ✓ | | **✓** | ✓ | | | ⭐ same |
| `verify.count_matches` | `pattern` | ✓ | ✓ | | | ✓ | | | compiled to `RegExp` |
| | `file` | ✓ | ✓ | | **✓** | ✓ | | | ⭐ same |

## 3 · ⭐ A third hazard class: H3 — defaulted, validated, then ignored

```js
const max_results = args.max_results || 200;
if (max_results > 200) throw new Error('max_results cannot exceed 200');
const cmd = ['grep', '-r', '--line-number', '--null', args.pattern, '.'];   // ← max_results absent
```

`repo.grep`'s `max_results` is **defaulted, bound-checked, and never applied to the output.** It is
neither H1 nor H2 — it is both. ⛔ **Classified `DECLARED-BUT-UNCONSUMED`; which side is defective is
NOT decided here.**

## 4 · ⛔ Ignored vs irrelevant — not adjudicated

For H2 and H3 two possibilities remain open, and the census refuses to choose:

```text
A. the SCHEMA is wrong   — the argument should not exist
B. the HANDLER is wrong  — the argument was intended to affect execution
```

⭐ **That keeps CI from silently repairing API semantics while trying to identify an act.** ⚠️ Note
H3 is the more suspicious of the two: a bound check written for a value that is then discarded reads
much more like **B** than like a deliberately vestigial field.

## 5 · ⭐⭐ Path identity — three regimes, and a boundary that cannot tell them apart

**The CI design's framing was too uniform. There are three:**

```text
(i)  RESOLVED AND CONSUMED   verify.file_exists · verify.sha256 · verify.count_matches
     handler does resolve(cwd, value) itself and uses the resolved form   ⭐ already BOUND = EXECUTED
(ii) RAW TO GIT              git.log.path · git.file_history.file · repo.find_file.pattern
     · inventory.*.dir       git interprets relative to cwd by ITS rules, not Node's
(iii) NOT A PATH AT ALL      repo.grep.pattern · repo.locate_symbol.symbol · verify.count_matches.pattern
```

🔴 **And the boundary cannot distinguish them.** `runCapability`'s containment loop applies to **every
declared string argument with a `maxLength`**, gated only on `value.startsWith('/') || value.includes('../')`.
So `repo.grep { pattern: 'a/../b' }` — a **regex** — is resolved against `cwd` and path-checked.

> **The boundary has no notion of which arguments are paths. It infers it from the spelling of the
> value.**

⚠️ Consequences already recorded and still unresolved: prefix containment (`startsWith(cwd)`),
`realpath`/symlink semantics never consulted, and a purely relative path taking **no check at all**.

## 6 · Undeclared host inputs that affect the performed act

| Input | Where | Affects |
|---|---|---|
| `cwd` (`currentRoot()`) | **every** capability | ✅ host-controlled — but it is *scope*, and scope is act identity (§6 of CI) |
| repository state (HEAD, refs, history, index) | all `git.*`, `repo.*` | ⭐ what `HEAD` **means** |
| working-tree / filesystem content | `verify.*`, `repo.grep` | the result, not the act |
| `PATH` / `git` binary resolution | all `execFileSync('git', …)` | which git runs |
| ⭐ **a file inside the bound repo** | `check.run` → `join(cwd,'scripts/builder/run-check.mjs')` | **§7** |
| node runtime, `npm`, `package.json`, `node_modules`, env | via `run-check.mjs` → `npm run typecheck` / `lint` | **§7** |
| time | none observed | — |

⭐ **The CI design's separation holds and is reinforced:**

```text
CANONICAL INVOCATION   "run git.rev_parse with ref HEAD against root X"
OBSERVED WORLD STATE   "HEAD resolved to commit Y when executed"
```

⛔ Act identity must **not** absorb mutable world state — it would become impossible to establish
before execution, which is exactly when a decision must be made. The receipt records what the act
encountered.

## 7 · 🔴🔴 `check.run` — the falsifier for option (a)

```js
execFileSync('node', [join(cwd, 'scripts/builder/run-check.mjs'), args.test_type], { cwd })
```

and `run-check.mjs` maps `typecheck → npm run typecheck`, `lint → npm run lint`.

**argv is reconstructible from canonical inputs. The ACT is not.** What `check.run typecheck`
*performs* is determined by a **script inside the bound repository**, the repo's `package.json`
scripts, its `node_modules`, and the environment.

> ⭐ **`check.run`'s act identity is only as stable as a file in the repository it operates on.**

⛔ This is the capability that **breaks the central hypothesis as stated**. Canonicalizing its inputs
cannot determine the act, because its inputs are not what determines the act.

⚠️ **It is not "unfixable"** — it may need scope-content binding (the act is bound to the *content* of
what it will run), or reclassification as a different kind of capability. ⛔ **Not decided here.**

## 8 · Capabilities that cannot satisfy `BOUND VALUE = EXECUTED VALUE` today

```text
8 hidden defaults (7 capabilities)  bound {} · executed HEAD / 'app' / 200 / HEAD~1
git.log.format          (H2)        bound distinguishes · execution does not
repo.grep.max_results   (H3)        bound distinguishes · execution ignores
repo.locate_symbol      (X)         bound `symbol` · executed `\bsymbol\b`
regime (ii) path args               bound spelling · executed via git's own interpretation
check.run               (§7)        bound inputs do not determine the act at all

SATISFIED TODAY:  verify.file_exists · verify.sha256 · verify.count_matches(file)
                  ⭐ the three that resolve internally and consume the resolved value
```

⭐ **3 of 15 already meet the law** — and they meet it by exactly the mechanism option (a) proposes:
canonicalize, then consume the canonical value.

## 9 · Does option (a) survive the whole registry?

> **Hypothesis:** *every registered capability can be given an explicit semantic input contract such
> that canonicalization occurs before dispatch and the handler consumes only the canonical result.*

```text
SURVIVES        12 / 15    mechanically — defaults materialized, derived values (locate_symbol)
                           computed at the boundary, path regime declared per argument
NEEDS RULING     2 / 15    git.log.format · repo.grep.max_results — §4's A-or-B is a
                           semantics decision, not a canonicalization one
🔴 FALSIFIES     1 / 15    check.run — its act is determined by repository content, not by its inputs
```

> ⛔ **Option (a) does not survive as stated. It survives with a named exception.**

⭐ **The exception is informative rather than fatal:** `check.run` is the only capability that
executes *repository-authored code*. Every other capability performs an act the registry fully
describes. That is a **category difference**, and a permit system that cannot see it would bind an
identity to `check.run typecheck` while the repository decides what that means.

## 10 · Smallest subsequent design act

> **A per-capability SEMANTIC INPUT CONTRACT — declared, not inferred.**

For each capability, per argument: **participates in the act** (yes/no) · **canonical form**
(including materialized defaults) · **argument kind** (path / pattern / ref / enum / scalar) ·
**derivation** (e.g. `\b…\b`) · **who resolves it**.

⭐ Three properties make this the right next act:

1. It **discharges H1, H2, H3 and the derived-value case by construction** — the contract states what
   participates, so act identity stops being inferred from a schema that cannot carry the answer.
2. It **makes the path regimes explicit** rather than inferred from a value's spelling (§5).
3. It **forces `check.run` to declare what it cannot promise**, surfacing §7 as a contract fact rather
   than a hidden exception.

⛔ **Not a repair.** The contract is a *description* first; whether the runtime is then changed to
consume canonical values (option (a)) is a later act, and `check.run` must be ruled before it.

---

```text
CAPABILITIES CENSUSED        15 / 15 · every handler read in full
HIDDEN DEFAULTS              8 across 7 capabilities  (CI design said 6 — corrected)
DECLARED-BUT-UNCONSUMED      git.log.format · repo.grep.max_results  ⛔ A-or-B not adjudicated
DERIVED EXECUTED VALUE       repo.locate_symbol
PATH REGIMES                 3, and the boundary infers them from value spelling
UNDECLARED HOST INPUTS       cwd · repo state · git binary · ⭐ repository-authored code (check.run)
BOUND = EXECUTED today       3 / 15
OPTION (a)                   survives 12 · needs ruling 2 · 🔴 FALSIFIED BY check.run
NEXT                         per-capability semantic input contract — declared, not inferred

READ-ONLY · NOTHING REPAIRED · RB-6B IMPLEMENTATION STILL BLOCKED
```

> **STOP.**
