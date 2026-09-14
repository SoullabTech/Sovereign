# JOP-04 · D5 — Grep Pattern Language: DECISION PACKET

**Status:** ⭐ **D5 RATIFIED — founder, 2026-09-14.** `repo.grep.pattern` is **POSIX BRE, explicitly
pinned by the capability contract.** Ambient git configuration carries **zero semantic authority**.
`repo.locate_symbol.symbol` remains **OPEN — D6**. The ruling is recorded in §8 below; §§1–7 are the
evidence and options as prepared, kept unedited except where a founder correction is applied in place.

> ⛔ **No handler repair is authorized by this ruling.** Handlers touched: **0**.

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

~~⭐ **`repo.locate_symbol` is functional under three of the four pattern languages and structurally
inert under the fourth** — and nothing in the registry, the contract or the invocation says which one
it will get.~~

> ⚠️ **CORRECTED IN PLACE — founder, 2026-09-14. "Matches nothing, ever" was too strong.** Under
> fixed-string semantics `\b` is not a disabled operator producing emptiness; it is two ordinary
> characters that can and do occur in a tree — this packet itself contains them. The true invariant is
> stronger and more useful:
>
> **Under fixed-string semantics the derived query ceases to mean *"this identifier at word
> boundaries."* It MISSES the real source occurrence and MAY instead match literal representations of
> the pattern elsewhere.**
>
> Measured at the amended witness: `declareRoutingEligibility` is declared at
> `scripts/builder/routing-eligibility.mjs:32`; BRE/ERE/PCRE reach that defining source, fixed-strings
> does not — while still returning one file, namely the prose in this packet. **The failure mode is
> not an empty answer. It is a confident wrong one.**

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
INSTRUMENT   scripts/jop04/d5-grep-language-evidence.sh   read-only · 6 passed · 0 failed (amended)
SUBJECT      scripts/builder/deterministic.mjs            repo.grep · repo.locate_symbol handlers
ENVIRONMENT  git 2.43.0 · grep.patternType UNSET at all four scopes
CLASS        E (runtime fact) for E0–E4 · source-proof for the handler asymmetry (F-D)
SCOPE        one machine, one day — the ambientness is what generalizes, not the value
```

---

## 8 · ⭐ D5 — RATIFIED (founder, 2026-09-14)

> **The caller authors the pattern. The capability contract authors the language.
> The environment authors neither.**

```text
repo.grep.pattern
ROLE                 GREP_PATTERN
LANGUAGE             POSIX BRE
SEMANTIC SOURCE      REGISTRY_DEFINED
AMBIENT CONFIG       NO AUTHORITY
CALLER TERM          exact pattern expression
CONTRACT TERM        BRE language
```

**D5.1 — The language is registry-defined.** `grep.patternType`, `grep.extendedRegexp` and equivalent
repository, user, system or environment state carry **zero authority** over what a caller's pattern
means for this capability.

**D5.2 — Why BRE.** The narrowest decision supported by the existing capability without inventing
semantics: fixed-string would *remove* presently available pattern semantics; ERE and PCRE would
*enlarge* the accepted language (PCRE adding an implementation dependency); ambient selection would
preserve F-B. BRE removes the ambient dependency while preserving the nominal default semantic class
already associated with `git grep`. ⛔ **A governance ruling, not a claim that BRE is the ideal
human-facing regex syntax.**

**D5.3 — No caller-selectable dialect.** The caller supplies the expression and never selects its
dialect — not by argument, not by pattern spelling, not by configuration, environment, or any
indirect channel. A future capability may deliberately expose a selectable language; that is a
different contract surface requiring its own authorization. It does not exist here.

**D5.4 — Pattern text remains caller-authored.** D5 authorizes **no** escaping, rewriting, or
compilation into another expression language.

```text
CALLER TERM              expression = <exact supplied string>
CAPABILITY-CONTRACT TERM language   = POSIX_BRE
```

⛔ The record **MUST NOT** represent the language as though the caller supplied `"basic"`. This is the
same attribution discipline D4 established: *a term may participate in the executed act without
becoming falsely attributed to the caller.*

**D5.5 — Pattern language is part of act identity.** The same character sequence read as BRE, ERE,
fixed string or PCRE does not necessarily describe the same search. Any eventual canonical execution
identity **MUST bind** the fact that `repo.grep.pattern` is interpreted as BRE — directly, or
inherited through a bound capability-contract identity. **Two executions with identical pattern
strings but different pattern languages are not the same canonical act.** D5 does not choose the
representation or hashing mechanism.

**D5.6 — Grep-backed capabilities need not share one language.** There is no organism-wide "git grep
language." Pattern language belongs to the semantic contract of the capability *using* the engine.
`repo.grep`, `repo.locate_symbol` and future grep-backed capabilities **MAY** use different matching
languages when their contracts require different acts — each explicitly declared, none inheriting
meaning from ambient configuration.

**D5.7 — D6 remains fully open.** Whether `repo.locate_symbol.symbol` is an *identifier* or a
*grep-pattern fragment* is undecided. ⛔ D5 does **not** force it to BRE merely because its current
implementation invokes `git grep`. **Shared implementation does not imply shared semantic language.**

**D5.8 — Ambient state may affect results, not meaning.**

```text
ALLOWED    same expression + different repository contents → possibly different matching lines
FORBIDDEN  same expression + different grep configuration  → different interpretation of the expression
```

The first is execution against different subject state. The second is semantic drift.

### D5 falsifiers

```text
D5-F1  ambient dialect            the same canonical repo.grep request can mean BRE/ERE/fixed/PCRE
                                  depending on grep.patternType, grep.extendedRegexp or equivalent
D5-F2  silent enlargement         repair moves repo.grep to ERE/PCRE without a separate ruling
D5-F3  silent contraction         repair converts repo.grep to fixed-string without a separate ruling
D5-F4  caller-attribution defect  the record says or implies the caller supplied the BRE selection
D5-F5  unbound semantic constant  canonical identity binds the pattern text but not the language,
                                  directly or through the capability contract
D5-F6  implementation coupling    repo.locate_symbol forced into BRE solely for sharing the git command
D5-F7  hidden dialect selector    spelling, environment, configuration, repository state or any other
                                  undeclared channel can select a different regex language
```

---

## 9 · ⚠️ Witness correction — the first 5/5 could not survive its own documentation

**Founder finding, accepted without reservation.** The original script asserted that a
whole-repository **fixed-string** search for `\b<symbol>\b` returned **global zero**. That assertion
is **self-contaminating**: once this packet records the probe pattern, those literal characters exist
in the tree, and at the sealed commit `e7b7b797` the fixed-string search matches **exactly one file —
this packet.** The recorded `5 passed` therefore described an **earlier tree state, not the commit it
was recorded against.**

⭐ **Third occurrence of the same species** (C21; the `Symbol.for` canary; now this): *an instrument
that scans prose can fail — or falsely pass — on a file precisely because that file documents the
thing being tested.* It is no longer an incident. **It is a standing hazard of every source-scanning
obligation in this programme.**

**The repair keeps the whole-repository command shape and stops asserting global zero:**

```text
BRE    the known defining source  scripts/builder/routing-eligibility.mjs  MUST appear
FIXED  that defining source                                               MUST NOT appear
       fixed-string output MAY be non-empty — documentation legitimately contains \b<symbol>\b
```

E4 is restated accordingly:

```text
was   PRESENT IDENTIFIER              → necessarily zero results
now   PRESENT IDENTIFIER + WRONG DIALECT → the defining-source occurrence is LOST
```

**Rerun at the amended instrument: `6 passed · 0 failed`**, with `fixed-strings total_files=1`
printed as **expected and correct** rather than as a failure — the witness now survives its own
documentation and states the defect more precisely than the version it replaces.

Three further instrument defects were found and fixed during the rerun, none of them findings about
the subject:

```text
--null + -l    emitted NUL-separated names on ONE line → membership and count tests both wrong
sentinels      the absent-symbol sentinels appeared LITERALLY in the script, so the search that
               must find nothing found the probe itself — the same hazard, one layer down.
               They are now ASSEMBLED at runtime, never written contiguously.
-c + pathspec  prints "file:count", which was compared as an integer
```

### D1 custody correction (not a D1 semantic correction)

The terminal block that accompanied the D1 report **cannot serve as the witness**: it shows the shell
at `~`, and its git invocations end in `fatal: not a git repository`. The decorative `→`, `⭐`, `🔴`
and `…` are not executable probe syntax either. **D1's semantics are unchanged**; the counts required
a retained successful run from an explicitly bound root.

`scripts/jop04/d1-pathspec-evidence.sh` now names the root explicitly (`git -C "$ROOT"`) and was rerun
at `e7b7b797`:

```text
root /home/user/Sovereign @ e7b7b797
directory prefix   plain=2856   literal=2856      PASS  no capability loses behaviour
glob               plain=1861   literal=0         PASS  glob IS selection (D1-F5 live today)
magic :(exclude)   plain=717    literal=2856      PASS  neutralized, NOT rejected (D1.3)
exit=0
```

⭐ The counts reproduce exactly — so they stay in the evidentiary record, but they stay because **this
run** stands behind them, never because the earlier paste displayed them.

---

## 10 · Standing after D5

```text
D4   ⭐ RATIFIED     omission belongs to the caller; default resolution belongs to the host
D1   ⭐ RATIFIED     a path is an identity; a pathspec is a selection program
D5   ⭐ RATIFIED     repo.grep.pattern = POSIX BRE, explicitly pinned · per-capability languages
                     permitted · repo.locate_symbol remains OPEN

D6   symbol language — identifier or pattern fragment          ← NEXT
D2   git.log.format          D3   repo.grep.max_results         OWED
F-D  no-match as outcome vs error — OPEN · NOT disposed by D5

LANE OPEN · IMPLEMENTATION ⛔ BLOCKED · HANDLERS TOUCHED 0
```

⭐ **D6 is cleaner than it was before D5:** the fact that `repo.locate_symbol` happens to call
`git grep` no longer gets a vote in what a *symbol* is.
