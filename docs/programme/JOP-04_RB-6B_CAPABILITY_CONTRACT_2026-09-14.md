# JOP-04 · RB-6B — Capability Contract (11 repair-required entries)

**Date:** 2026-09-14 · **Mode:** ⛔ **CONTRACT ONLY — NO IMPLEMENTATION, NO HANDLER REPAIR**
**Status:** CENSUS CLOSED · CONTRACT DISCOVERY COMPLETE · **RB-6B IMPLEMENTATION BLOCKED**

⛔ Where the code does not determine an answer, this contract records **OPEN** and routes it to §4.
**Inventing an answer here would convert contract into design.**

---

## 0a · ⭐ RATIFIED REFINEMENTS (founder, 2026-09-14)

**The `PATTERN` role SPLITS. There is no single pattern language.**

```text
GREP_PATTERN   consumed by git grep          repo.grep.pattern · repo.locate_symbol.symbol
JS_REGEX       consumed by new RegExp(·)     verify.count_matches.pattern
```

⛔ Calling both `PATTERN` would hide a real semantic difference. **The role taxonomy is now TEN:**
`PATH · PATHSPEC · REF · GREP_PATTERN · JS_REGEX · SYMBOL · ENUM · COUNT/LIMIT · BOOLEAN · FREE TEXT`.

**`SYMBOL` is currently misnamed.** Its present runtime semantics are `GREP_PATTERN_FRAGMENT` —
the value can alter the surrounding pattern. ⛔ **Do not silently fix that by escaping it until D6
says a literal identifier is the intended act.**

**F-B's ambientness must eventually be ELIMINATED**, not merely declared: the contract should
explicitly choose the grep language. ⛔ Which one is **D5**; that it must be chosen is ratified.

> ⭐ **`same registry request + different environment = potentially different meaning` violates the
> whole goal of canonical execution.**

### ⭐ Decision order — FROZEN

```text
D4  omission / authorship semantics     ← FIRST · establishes the model the rest live inside
D1  pathspec language
D5  grep pattern language
D6  symbol language
D2  git.log.format
D3  max_results
```

### ⚠️ Evidence-class correction on F-B — two halves, only one proven

```text
PROVEN (source)      no -E / -F / -P flag is pinned, so the language is NOT fixed by the registry
⛔ UNOBSERVED        what grep.patternType EFFECTIVELY resolves to in the bound environment
```

⛔ **A single successful `git grep` would not establish the accepted language** — it would show one
outcome under one unread configuration. Establishing the second half needs the effective config read
directly, with its origin:

```bash
git -C <bound-root> config --show-origin --get grep.patternType
```

⭐ **The latent defect stands either way.** Even if the value is unset everywhere today — making
current behaviour BRE — **the ambientness is the finding**, and it is proven from source. The runtime
read would establish only *what the language happens to be right now*.

## 0b · ⭐⭐ Two findings that change the "accepted language" column

### F-A · The PATTERN role covers **two different regex languages**

```text
repo.grep.pattern            → git grep      · POSIX BRE by default
repo.locate_symbol.symbol    → git grep      · same
verify.count_matches.pattern → new RegExp(·) · JavaScript / ECMAScript
```

⭐ Two arguments both reasonably labelled `PATTERN` accept **incompatible languages**. `\d` is a digit
in JS and a literal `d` in BRE; `(a|b)` alternates in JS and is literal in BRE. **A single `PATTERN`
role would misdescribe at least one of them.**

### F-B · 🔴 The grep language is **not fixed by the registry** — it is ambient

```js
['grep', '-r', '--line-number', '--null', args.pattern, '.']   // no -E, -P, -F
```

No pattern-type flag is pinned. `git grep` therefore honours **`grep.patternType`** — a git config
value readable from the **repository**, the user's global config, or the system config
(`basic` / `extended` / `fixed` / `perl`).

> ⭐ **The accepted language of `repo.grep.pattern` and `repo.locate_symbol.symbol` is determined by
> git configuration in the bound environment, not by the registry.**

⚠️ **This is a second instance of the `check.run` species — milder, but the same shape:** the object
under authority partly authors what the authorized act means. ⛔ Not reclassified to
`REPOSITORY_DEFINED` here; recorded as **`LANGUAGE_AMBIENT`** pending §4 **D5**.

### F-C · `SYMBOL` is not an identifier language

```js
`\\b${args.symbol}\\b`      // interpolated UNESCAPED
```

A symbol containing grep metacharacters participates in matching. **The de facto accepted language
of `symbol` is "a git grep pattern fragment," not "an identifier."** ⛔ §4 **D6**.

## 1 · Contract — eight pinned fields per input

**Legend:** `OPEN` = requires a founder ruling (§4) · `DELEGATED` = repository/ambient semantics

### `git.rev_parse` · `git.show_stat` · `git.diff_stat` · `git.branch_contains` — REF group

| Field | Role | Accepted language | Canonical representation | Validation invariant | Execution consumer | Omission meaningful? | Delegated? |
|---|---|---|---|---|---|---|---|
| `ref` (rev_parse, show_stat) | REF | git revision expression (`gitrevisions`) | **OPEN — D4** | string · `maxLength 1000` | `['rev-parse', ref]` / `['show','--stat',ref]` | **OPEN — D4** (`{}` → `HEAD`) | resolution of `HEAD` is repo state, not language |
| `ref1` / `ref2` (diff_stat) | REF | ″ | **OPEN — D4** | ″ | `['diff','--stat',r1,r2]` | **OPEN — D4** (`HEAD~1` / `HEAD`) | ″ |
| `branch` (branch_contains) | REF | ″ | the supplied value | required · string | `merge-base --is-ancestor` | n/a — required | ″ |
| `commit` (branch_contains) | REF | ″ | **OPEN — D4** | ″ | ″ | **OPEN — D4** (`HEAD`) | ″ |

⚠️ **The REF language is wider than it looks.** `gitrevisions` admits `HEAD@{2.days.ago}`, `:/text`,
`ref^{tree}`. ⛔ Whether the authorized language is *all* of `gitrevisions` or a restricted subset is
**not decided by the code** — it is decided by what `git` accepts. Recorded, not ruled.

### `git.log`

| Field | Role | Accepted language | Canonical representation | Validation invariant | Execution consumer | Omission meaningful? | Delegated? |
|---|---|---|---|---|---|---|---|
| `format` | ⚠️ **UNDETERMINED** | **OPEN — D2** | **OPEN — D2** | string · `maxLength 1000` | 🔴 **NONE** | **OPEN — D2** | — |
| `max_count` | COUNT | integer | the supplied value | `1 ≤ n ≤ 10000` | `-N` | **no** — omitted ⇒ unbounded | no |
| `path` | **PATHSPEC** | git pathspec — **OPEN — D1** | **OPEN — D1** | string · `maxLength 1000` | `-- <spec>` | **no** — omitted ⇒ whole repo | git pathspec matching |

### `git.file_history`

| Field | Role | Accepted language | Canonical representation | Validation invariant | Execution consumer | Omission meaningful? | Delegated? |
|---|---|---|---|---|---|---|---|
| `file` | **PATHSPEC** | **OPEN — D1** | **OPEN — D1** | required · string | `-- <spec>` | n/a — required | git pathspec matching |
| `max_count` | COUNT | integer | supplied value | `1 ≤ n ≤ 10000` | `-N` | **no** | no |

### `repo.grep`

| Field | Role | Accepted language | Canonical representation | Validation invariant | Execution consumer | Omission meaningful? | Delegated? |
|---|---|---|---|---|---|---|---|
| `pattern` | PATTERN | 🔴 **`LANGUAGE_AMBIENT`** — `grep.patternType` (**OPEN — D5**) | **OPEN — D5** | required · string | `git grep … <pattern> .` | n/a | 🔴 **yes — F-B** |
| `max_results` | LIMIT | integer | **OPEN — D3** | ⚠️ `n ≤ 200` **enforced at the boundary** | 🔴 **NONE — H3** | **OPEN — D3** | — |

⛔ **`max_results` currently carries an enforced invariant with no execution consumer.** The contract
records the invariant as **real at the boundary and absent from the act** — it must not be written as
though results are bounded.

### `repo.find_file`

| Field | Role | Accepted language | Canonical representation | Validation invariant | Execution consumer | Omission meaningful? | Delegated? |
|---|---|---|---|---|---|---|---|
| `pattern` | **PATHSPEC** ⚠️ *(named `pattern`, but consumed as a pathspec)* | **OPEN — D1** | **OPEN — D1** | required · string | `ls-files <spec>` | n/a | git pathspec matching |

⚠️ **The field name misdescribes the role.** ⛔ Renaming is not proposed; the contract records that the
declared name and the semantic role disagree.

### `repo.locate_symbol`

| Field | Role | Accepted language | Canonical representation | Validation invariant | Execution consumer | Omission meaningful? | Delegated? |
|---|---|---|---|---|---|---|---|
| `symbol` | SYMBOL | 🔴 **de facto grep pattern fragment (F-C)** — **OPEN — D6** | **OPEN — D6** | required · string | **`\b${symbol}\b`** — derived, unescaped | n/a | 🔴 **yes — F-B** |

### `inventory.migrations` · `inventory.routes`

| Field | Role | Accepted language | Canonical representation | Validation invariant | Execution consumer | Omission meaningful? | Delegated? |
|---|---|---|---|---|---|---|---|
| `dir` | **PATHSPEC** | **OPEN — D1** | **OPEN — D1 + D4** | string · `maxLength 1000` | `ls-files <spec>` | **OPEN — D4** (`database/migrations` · `app`) | git pathspec matching |

## 2 · The three READY capabilities — recorded for contrast

`verify.file_exists` · `verify.sha256` · `verify.count_matches`

```text
PATH (i)   accepted language: filesystem path
           canonical representation: resolve(cwd, value)     ⭐ the handler consumes THIS
           validation invariant: fullPath.startsWith(cwd)    ⚠️ prefix test, not containment
           execution consumer: the resolved path
```

⚠️ **READY means `BOUND = EXECUTED` holds — it does not mean the invariant is correct.**
`startsWith(cwd)` is a string-prefix test: `/repo-evil` satisfies a `cwd` of `/repo`. ⛔ Recorded, not
repaired, and **not** a reason to downgrade READY — the two properties are independent.

⚠️ `verify.count_matches.pattern` is **JavaScript** regex (F-A) — a different language from the two
grep capabilities, under the same role name.

## 3 · `check.run` — unchanged

```text
SEMANTIC SOURCE   REPOSITORY_DEFINED
STATUS            BLOCKED — DELEGATED REPOSITORY EXECUTION
```

⛔ No contract is written for it. **A repository-defined capability may not receive a canonical act
identity as though the registry fully determines its semantics.**

## 4 · ⭐ Open decisions — authority questions, not sanitizer questions

### D1 · Git magic pathspecs — **the decision the founder named as unavoidable**

```text
Are :(exclude) :(glob) :(icase) :(attr) and the rest
  ☐ part of the authorized language
  ☐ a restricted subset
  ☐ forbidden entirely
```

⭐ **These are operators, not suspicious spellings of locations.** A hardened filesystem-path
validator would remain **completely porous** to them, because it validates against the wrong semantic
type. ⛔ **A sanitizer must not decide this accidentally.**

### D2 · `git.log.format` — schema wrong (A) or handler wrong (B)?
⛔ **No operational evidence exists either way.** Role stays `UNDETERMINED` until ruled.

### D3 · `repo.grep.max_results` — A or B?
⚠️ Evidence leans **B**: an encoded operational constraint (`≤ 200`) with an execution path that
behaves as though the field does not exist reads as **unfinished**, not vestigial. ⛔ **A lean is not
authority to choose.**

### D4 · ⭐⭐ Omission semantics — **FIRST. A constitutional question, not a technical one**

For all eight hidden defaults:

```text
MODEL A — REQUESTER DEFAULT
  requester says {} · the contract defines omission ≡ HEAD
  → canonicalization may legitimately produce { ref: 'HEAD' },
    because HEAD is part of the meaning of the request itself

MODEL B — HOST DEFAULT
  requester says {} · the HOST chooses HEAD
  → canonicalization MUST preserve the split:
        caller terms:  {}
        host terms:    { ref: 'HEAD' }
    otherwise a host decision is rewritten as though the caller supplied it
```

⭐ **Under RB-6B's own law — *the caller may request; the host decides* — a default supplied by the
host is a HOST CONTRIBUTION to the act.** If Reading 2 holds, materializing defaults into the caller's
canonical request would **silently attribute a host choice to the requester**, which is the
attribution error this entire lane exists to prevent.

⛔ **This must be ruled before any canonicalization is implemented.** It determines whether "fix H1"
means *materialize the default* or *record the default as a separate host-supplied term*.

### D5 · Pattern language — pinned or ambient?
```text
☐ the registry PINS the flavour (e.g. -F fixed, or -E extended) per capability
☐ the language remains ambient (grep.patternType) and the contract declares it DELEGATED
☐ the two PATTERN capabilities must share one language   ☐ they may differ, declared
```

### D6 · `SYMBOL` — identifier or pattern fragment?
```text
☐ SYMBOL is an identifier   → metacharacters escaped before interpolation (behaviour change)
☐ SYMBOL is a pattern fragment → current behaviour, and the role name is renamed to match
```

---

```text
CONTRACT WRITTEN            11 / 11 repair-required entries
READY (contrast)             3 · ⚠️ BOUND=EXECUTED ≠ invariant correct
BLOCKED                      1 · check.run, no contract written

NEW FINDINGS
  F-A   PATTERN covers two incompatible regex languages
  F-B   grep language is AMBIENT (grep.patternType) — a milder check.run species
  F-C   SYMBOL is de facto a grep pattern fragment, interpolated unescaped

RATIFIED                    PATTERN splits → GREP_PATTERN + JS_REGEX (taxonomy now 10)
                            SYMBOL currently = GREP_PATTERN_FRAGMENT
                            F-B ambientness must be ELIMINATED, not just declared

DECISION ORDER (frozen)     D4 → D1 → D5 → D6 → D2 → D3
                            ⭐ D4 establishes the model the rest live inside

F-B EVIDENCE                absence of pinning PROVEN from source
                            effective grep.patternType ⛔ UNOBSERVED

NOTHING REPAIRED · NO HANDLER TOUCHED · RB-6B IMPLEMENTATION BLOCKED
```

> **Only after these decisions exist can "canonicalize before dispatch" be applied without quietly
> designing semantics in code.**
