# JOP-04 · D1 — Magic-Pathspec Policy · ⭐ RATIFIED

**Date:** 2026-09-14 (founder ruling) · ⛔ **No implementation. No handler touched.**

> **A path is an identity. A pathspec is a selection program. Caller path text carries identity,
> never selection authority.**

---

## 1 · Ruling

**Caller-supplied path identity is literal data. It is never Git selection authority.**

| | |
|---|---|
| **D1.1 · Literal identity** | Any value admitted as a caller-supplied path MUST reach Git with **literal path semantics**. Its characters may not acquire glob, magic, exclusion, case-folding, attribute-selection, repository-root-selection or other pathspec meaning merely because Git recognizes that spelling. Applies to ordinary pathspec pattern syntax **and** explicit magic forms. |
| **D1.2 · No syntax-derived authority** | Caller text MUST NOT gain selection authority through wildcards/globs · `top` · `icase` · `attr` · `exclude` · short-form magic · long-form `:(…)` · or any other pathspec feature that changes which objects are selected. **The caller may identify a path. The caller may not smuggle a selector through the path channel.** |
| **D1.3 · Magic-looking names remain names** | A filename MUST NOT become invalid solely because its spelling resembles pathspec syntax. ⛔ Rejecting every magic-looking pathname would let **Git's command grammar silently define part of Soullab's allowable repository namespace.** Literal-looking-like-control stays literal data: it does not become control, **and it is not rejected for resembling control.** |
| **D1.4 · Normalization may not change the semantic class** | **Data before normalization remains data after normalization.** No transformation may move, strip, decode, prepend or remove characters such that a value admitted as a literal path becomes an interpreted pathspec. The sanitizer normalizes only within authority granted elsewhere; **it may not manufacture selection semantics as a side effect.** |
| **D1.5 · Selection requires a separate authority surface** | Any legitimate future pathspec selection needs (1) an explicitly named operation or typed capability, (2) an authorized selection vocabulary, (3) an explicit caller/authority boundary, (4) tests proving the literal-path channel cannot reach it. **A raw path string MUST NOT double as identity and selector. Selection authority belongs in the API, not in the spelling of data.** |
| **D1.6 · `--` does not satisfy this ruling** | `--` separates options/revisions from pathnames. ⛔ **It does not make those arguments literal.** An implementation that inserts `--` while leaving caller path text subject to pathspec interpretation **FAILS D1.** |
| **D1.7 · What D1 does not decide** | `..` traversal · absolute vs repo-relative · containment · symlinks · existence · canonicalization · Unicode/case · forbidden bytes · permitted subtrees · recursion · mutation authority. ⭐ **Literal does not mean valid.** |

⭐ **Three superficially plausible alternatives, all wrong for different reasons:** *pass pathspecs
through* gives data selection authority · *reject anything magic-looking* lets Git grammar annex
legitimate filename space · *escape/rewrite what looks dangerous* makes the sanitizer infer intent.
**D1 avoids all three by separating identity from selection capability.**

## 2 · Falsifiers — acceptance FAILS if any holds

```text
D1-F1  SELECTION INJECTION      caller path text can widen, narrow, negate, glob, case-fold,
                                attribute-filter or otherwise alter Git's selected object set
D1-F2  NAMESPACE ANNEXATION     a literal repository pathname is rejected solely because its
                                characters resemble pathspec syntax
D1-F3  NORMALIZATION PROMOTION  a value entering as literal path data becomes an interpreted
                                selector after sanitization or normalization
D1-F4  SEPARATOR SUBSTITUTION   the implementation relies on `--` as though it disabled pathspec
                                semantics
D1-F5  DUAL-USE STRING          one untyped caller-controlled channel represents either an exact
                                path or an executable selection expression depending on contents
D1-F6  HIDDEN SELECTOR          a genuine pathspec capability exists without a distinct, expressly
                                authorized interface
```

## 3 · ⭐⭐ Empirical verification (Evidence class E — run in this repository, read-only)

**A concern I was about to raise is disproved by measurement:** I expected literal semantics to break
`inventory.*`, whose purpose is *"list tracked files under this directory."* **It does not.**

```text
git ls-files app                              → 2856
git --literal-pathspecs ls-files app          → 2856    ⭐ IDENTICAL
GIT_LITERAL_PATHSPECS=1 git ls-files app      → 2856    ⭐ IDENTICAL

git ls-files 'app/*.ts'                       → 1861
git --literal-pathspecs ls-files 'app/*.ts'   → 0       🔴 glob is SELECTION — removed

git ls-files ':(exclude)app/api' 'app'        → 717
git --literal-pathspecs ':(exclude)…' 'app'   → 2856    🔴 magic NEUTRALIZED, not rejected
```

**Three results, each load-bearing:**

1. ⭐ **Directory-prefix matching is not magic** — it survives literal mode. **No capability's intended
   behaviour is lost.** `inventory.migrations`, `inventory.routes` and the other path arguments keep
   working exactly as they do today.
2. 🔴 **Glob IS selection authority, and it is LIVE today.** `repo.find_file { pattern: 'app/*.ts' }`
   currently selects 1861 objects through the path channel — **D1-F5 is presently true in the
   registry.**
3. ⭐ **Magic is neutralized without rejection** — `:(exclude)…` becomes a literal path that matches
   nothing. **That is D1.3 satisfied by construction, not by a rejection rule** — the value is treated
   as a name, and simply names nothing.

> ⭐ **D1 is implementable without changing any capability's intended behaviour. Only the smuggled
> selection authority disappears.**

⚠️ **`--literal-pathspecs` / `GIT_LITERAL_PATHSPECS` is a MECHANISM.** D1 rules the semantic class,
not the mechanism (D1.7). ⛔ **This section is evidence of implementability, not a selection of
implementation.**

## 4 · ⭐ Consequence for the contract — five arguments reclassify

D1 resolves the `accepted language` and `canonical representation` cells left **OPEN — D1**:

| Argument | Was | ⭐ Now under D1 |
|---|---|---|
| `git.log.path` | PATHSPEC | **PATH — literal identity** |
| `git.file_history.file` | PATHSPEC | **PATH — literal identity** |
| `repo.find_file.pattern` | PATHSPEC ⚠️ *(name misdescribes)* | **PATH — literal identity** |
| `inventory.migrations.dir` | PATHSPEC | **PATH — literal identity** |
| `inventory.routes.dir` | PATHSPEC | **PATH — literal identity** |

⭐ **The `PATHSPEC` role does not disappear — it is DEMOTED to describing a capability that does not
exist.** Under D1.5 it may only ever name a separately authorized selection surface. **No current
argument carries it.**

⚠️ **Current-state findings, recorded not repaired:** D1-F1 and D1-F5 are **live today** — both magic
and glob reach Git's selection through the caller path channel. And every one of the five passes raw
to git, so per D1.6 the current state also **fails D1-F4** if `--` were ever treated as sufficient.

## 5 · Standing

```text
D4   ⭐ RATIFIED — omission is caller-authored; default resolution is host-authored
D1   ⭐ RATIFIED — literal identity ≠ selection authority

D5   grep pattern language      OWED  ← NEXT
D6   symbol language            OWED
D2   git.log.format             OWED
D3   max_results                OWED

JOP-04 / RB-6B CONTRACT   ⭐ OPEN
IMPLEMENTATION            ⛔ BLOCKED
HANDLERS TOUCHED          0
WS-PROPOSAL-INTERACTION   ⛔ NO JURISDICTION
```

> ⭐ **"Literal does not mean valid"** keeps D1 from swallowing D5/D6/D2/D3. The semantic class of the
> input is decided. Where it may point, and whether JOP may act on it, is not.
