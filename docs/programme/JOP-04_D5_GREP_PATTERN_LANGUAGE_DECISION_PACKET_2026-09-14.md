# JOP-04 · D5 — Grep Pattern Language: DECISION PACKET

**Status:** ⛔ **NOT RULED.** This is evidence and options prepared for a founder ruling.
Jarvis may discover, compare, test and recommend. It may not rule.

**Lane:** JOP-04 · RB-6B Capability Contract · decision order **D4 → D1 → *D5* → D6 → D2 → D3**
**Predecessors:** D4 RATIFIED (Model B) · D1 RATIFIED (*a path is an identity; a pathspec is a
selection program*)
**Reproduction:** `scripts/jop04/d5-grep-language-evidence.sh` — read-only, asserts relationships
never counts. Run here 2026-09-14: **5 passed · 0 failed**.

---

## 1 · The question D5 must answer

Two registered capabilities carry a `GREP_PATTERN` argument to `git grep`:

| capability | argument | command the handler builds |
|---|---|---|
| `repo.grep` | `pattern` | `git grep -r --line-number --null <pattern> .` |
| `repo.locate_symbol` | `symbol` | `git grep -r --line-number --null \b<symbol>\b .` |

**No pattern-type flag is pinned by either.** The language in which that text is read is therefore
decided by `grep.patternType` — git configuration that lives *outside the registry, outside the
repository declaration, and outside the invocation*.

> **The question:** is the pattern language a property of the capability, or a property of the
> machine the capability happens to run on?

---

## 2 · F-B is now proven in BOTH halves

The contract recorded F-B's second half as ⛔ UNOBSERVED and named the exact read required
(`git config --show-origin --get grep.patternType`). That read has now been performed.

```text
PROVEN (source)    no -E / -F / -P is pinned → the language is NOT fixed by the registry
OBSERVED (E0/E1)   grep.patternType is UNSET at system, global, local and worktree scope here
                   → git's built-in default applies → the effective language is BRE
```

⚠️ **Scope of the observation.** This resolves the language **in this environment, on git 2.43.0,
today**. It does not resolve it for the bound Jarvis host, and it cannot: the value is ambient by
construction, so every reading is a reading of one machine at one time. **That is the finding, not a
footnote.** The contract's original judgement stands and is strengthened, not softened:

> *Even if the value is unset everywhere today, the ambientness is the finding.*

The earlier ⛔ UNOBSERVED line is **superseded in place**, not deleted — it was true when written.

---

## 3 · ⭐ The new evidence that makes D5 more than a declaration question

F-B was previously arguable as a *hygiene* defect: the language is undeclared, so declare it.
The measured behaviour shows it is a **correctness** defect in one capability.

### E2 · The derived word boundary is language-dependent

`repo.locate_symbol` does not pass the caller's text to git. It **derives** a pattern:
`` `\b${args.symbol}\b` `` — unescaped, in the handler.

```text
pattern: \bdeclareRoutingEligibility\b        (files matched)
  ambient  12      BRE  12      ERE  12      fixed-strings  0
```

`\b` is a GNU regex word-boundary under BRE, ERE and PCRE. Under `--fixed-strings` it is a literal
backslash followed by a literal `b`, and **matches nothing, ever**.

⭐ **`repo.locate_symbol` is functional under three of the four pattern languages and structurally
inert under the fourth — and nothing in the registry, the contract or the invocation says which one
it will get.**

### E3/E4 · ⭐⭐ F-D — the failure is not visible as a failure

The two handlers treat git's no-match exit differently:

```text
repo.grep           catches err.status === 1  → returns { exit_code: 0, stdout: '' }   ZERO-RESULT
repo.locate_symbol  no catch                  → execFileSync THROWS                    ERROR
```

Both command shapes exit 1 on no-match (E3, measured). So under an ambient `-F`:

```text
E4   git grep --fixed-strings '\bdeclareRoutingEligibility\b'   →  rc=1
     …for a symbol that IS PRESENT in the tree, on the line the probe was written from.
```

⭐ **Under fixed-strings, a symbol that exists and a symbol that does not exist produce the identical
result.** In `repo.locate_symbol` that result is a thrown error, so the capability fails loudly for
the wrong reason; in `repo.grep` the analogous divergence returns a clean, confident, **empty**
answer. *A selection language that can be changed from outside the act can turn a true answer into an
empty one without turning it into an error.*

**F-D is a new finding, separately recorded here:** the two GREP_PATTERN capabilities disagree about
whether "no match" is an outcome or a failure. It is adjacent to D5 and **not decided by it**.

---

## 4 · How D1 bears on D5

D1 ratified: **caller path text carries identity, never selection authority.** The analogue holds
with one asymmetry that must not be flattened:

```text
D1 (PATH)        caller text is an IDENTITY          selection authority must not ride in on it
D5 (PATTERN)     caller text IS a selection program  ← unavoidable; a grep pattern selects, by nature
                 but the LANGUAGE that reads it is not the caller's, and is not today anyone's
```

So D5 is not "does the caller get selection authority" — under `repo.grep` the caller legitimately
does. D5 is: **who owns the interpreter?** Today the answer is *the ambient environment*, which is
the one answer that makes the act's identity unstable across machines. D4 Model B already ruled the
matching principle for omission — *omission belongs to the caller, default resolution belongs to the
host* — and the host is not resolving this one; git is.

---

## 5 · Options (founder ruling required)

```text
☐ A · REGISTRY PINS THE FLAVOUR, per capability
      each GREP_PATTERN argument declares its language; the handler passes the flag explicitly.
      + language becomes a property of the capability; act identity stops depending on the machine
      + repo.locate_symbol's \b becomes guaranteed, not lucky
      − a caller relying on today's ambient BRE sees no change only if BRE is what is pinned

☐ B · AMBIENT, DECLARED AS DELEGATED
      contract records LANGUAGE_AMBIENT and names grep.patternType as the resolver.
      + honest; zero behaviour change
      − ⛔ leaves E2/E4 standing: a config change elsewhere silently empties repo.grep results
        and inerts repo.locate_symbol. The contract's own standing judgement is that F-B's
        ambientness must be ELIMINATED, not merely declared.

☐ C · ONE SHARED LANGUAGE for both PATTERN capabilities
☐ D · THEY MAY DIFFER, each declared
      C and D are orthogonal to A/B and are only meaningful under A.
```

**Recommendation (advisory, not a ruling): A + D.**
A, because B is already refused by the contract's ratified line on F-B, and because E2/E4 show the
exposure is behavioural rather than documentary. D rather than C, because the two arguments are not
the same object: `repo.grep.pattern` is caller-authored and should be the most expressive language
the product wants to offer; `repo.locate_symbol.symbol` is a caller **identifier** that the host
wraps in a boundary it authored itself — its language is a host implementation detail, and forcing it
to share the caller-facing flavour would couple an identifier capability to a search-language choice
it has no stake in. That separation is exactly the D6 question, which is why **D5 should pin
`repo.grep` and leave `repo.locate_symbol`'s language explicitly OPEN to D6** rather than pre-deciding
it here.

⛔ **No implementation begins because D5 closes.** RB-6B implementation remains BLOCKED.

---

## 6 · What this packet does NOT decide

```text
D6   is SYMBOL an identifier or a pattern fragment (F-C) — the \b derivation is its substrate
F-D  zero-result vs error asymmetry between the two handlers — NEW, unassigned, not a D5 question
D2   git.log.format                      D3   repo.grep.max_results
     whether escaping/sanitizing is owed at all — deferred to D6 per the standing ruling
```

---

## 7 · Evidence ledger

```text
INSTRUMENT   scripts/jop04/d5-grep-language-evidence.sh   read-only · 5 passed · 0 failed
SUBJECT      scripts/builder/deterministic.mjs            repo.grep · repo.locate_symbol handlers
ENVIRONMENT  git 2.43.0 · grep.patternType UNSET at all four scopes
CLASS        E (runtime fact) for E0–E4 · source-proof for the handler asymmetry (F-D)
SCOPE        one machine, one day — the ambientness is what generalizes, not the value
```
