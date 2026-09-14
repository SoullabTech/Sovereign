# JOP-04 · D2 + F-D — the two closing semantic rulings

**Status:** ⭐ **BOTH RATIFIED — founder, 2026-09-14.**
⛔ **No schema, form, handler, canonicalizer or production repair is authorized by these rulings.
Handlers touched: 0.**

---

# D2 — `git.log.format` · ⭐ RATIFIED · **A · SCHEMA WRONG**

> **A declared field is an offer of authority. `git.log` does not offer the caller authority over its
> output language.**

```text
CAPABILITY            git.log
FIELD                 format
PUBLIC STATUS         NOT AUTHORIZED
CALLER AUTHORITY      NONE
OUTPUT FORMAT OWNER   HOST / CAPABILITY CONTRACT
CURRENT SCHEMA        DEFECT
CURRENT FORM          DEFECT · F-E evidence
CANONICAL TERM        NONE
```

**Why this is constitution, not discovery.** The D2 census established that the provenance needed to
discover intent **does not exist** — `HISTORICAL SUBJECT A · 0 commits anywhere · bytes unavailable`.
The ruling is therefore an act of deciding what the act *shall* be, made on the present-tense
substrate: the handler already carries a **fixed host-defined log representation**, and the system
nevertheless **exposes `format` to humans while execution ignores it.**

### D2.1 — `format` is not a caller term

The authorized public invocation does not contain `format`. ⛔ These are therefore **not** two valid
invocations of one act:

```text
git.log { format: 'a' }        git.log { format: 'b' }
```

After D2 they are **both invalid invocations containing an undeclared argument.** This supersedes any
earlier canonical-equivalence example that treated differing `format` strings as valid requests
denoting the same act.

### D2.2 — Output representation belongs to the capability

The output representation of `git.log` is host/capability-authored. The handler already fixes that
representation rather than consulting caller input. ⛔ D2 ratifies **that ownership boundary**, not
arbitrary git pretty-format syntax. *The caller asks for log information; the capability determines
the representation in which that information is returned.*

### D2.3 — Bounded repair must preserve observable output

⛔ D2 does **not** authorize redesigning the log output. Invocations that do not currently supply
`format` must **retain their existing observable output representation**. Removing the dead
caller-facing field must not become an excuse to change:

```text
fields returned · ordering of those fields · date treatment · quoting ·
record ordering · any other observable log-output semantics
```

Any future output-format redesign is a **separate contract act**.

### D2.4 — No hidden pretty-format language

The capability does **not** acquire the full language of `git --pretty=format:<…>` as an undeclared
caller language. A future product need for caller-selectable formatting requires a **separately
authorized interface** with its own accepted language and canonical semantics. ⛔ **It may not be
introduced by restoring this field during implementation.**

### D2.5 — F-E is disposed by D2

```text
F-E (census)   shows format → accepts → validates → carries → execution discards
D2-A chosen    → the field MUST NOT BE SOLICITED
```

F-E is **disposed as a semantic question.** It remains **evidence of the present defect until
repair.**

### D2.6 — ⭐ Canonical identity consequence

```text
canonical git.log act identity  MUST NOT bind a format caller term
```

⛔ Nor may a canonicalizer **silently accept and erase one.** A request containing `format` must
**fail admission** rather than be normalized into a different request — because **ACCEPT + IGNORE
would preserve the exact false affordance D2 is closing.**

### D2 falsifiers

```text
D2-F1  `format` remains an accepted public argument
D2-F2  the Desktop form continues soliciting `format`
D2-F3  caller-supplied `format` is accepted and silently ignored
D2-F4  caller-supplied `format` begins controlling git pretty-format without a new explicit ruling
D2-F5  canonical invocation identity includes `format`
D2-F6  canonicalization silently DELETES an unauthorized `format` instead of REFUSING the invocation
D2-F7  removing the field changes existing git.log output semantics for otherwise valid invocations
D2-F8  the repair treats all git pretty-format syntax as implicitly authorized
```

---

# F-D — `repo.locate_symbol` no-match semantics · ⭐ RATIFIED

> **"I searched successfully and found none" is an answer, not a failure to answer.**

```text
CAPABILITY            repo.locate_symbol
SYMBOL PRESENT        success + occurrence records
SYMBOL ABSENT         success + ZERO result records
ORDINARY NO-MATCH     NOT AN ERROR
GENUINE TOOL FAILURE  ERROR
SEMANTIC SOURCE       REGISTRY_DEFINED
```

`repo.locate_symbol` is a **read/query** capability. A literal symbol not occurring within the bound
repository and the capability's authorized search scope is a **normal answer to that query.**
⭐ The capability differs from `repo.grep` **only** in failing to normalize git's ordinary "no
matches" status.

### F-D.1 — Public semantic

If execution completes correctly and finds no whole-symbol occurrences of `S`:

```text
RESULT = ZERO MATCHES        STATUS = SUCCESS
```

### F-D.2 — Absence and failure are different states

```text
ZERO RESULT                          EXECUTION FAILURE
  search executed correctly            search could not be validly performed
  authorized scope was searched        tool failed for a reason other than ordinary no-match
  no matching occurrence found         repo/tool/environment prevented completion
```

⛔ **These states may not collapse.**

### F-D.3 — Git exit status is transport, not public meaning

```text
underlying matcher rc = 1 SOLELY because no match exists  →  normalize to ZERO-RESULT success
other genuine execution failures                          →  remain failures
```

The bounded repair may use the existing query convention `{ exit_code: 0, stdout: '' }`. ⛔ **The
constitutional semantic is successful zero records, not that particular serialization.**

### F-D.4 — D6 remains intact

```text
D6    chooses WHAT IS SEARCHED     literal SYMBOL · host-authored whole-symbol lookup
F-D   chooses WHAT IT MEANS        when that valid search finds nothing
```

⛔ F-D does **not** choose GNU `\b`, an escaping strategy, fixed-string plus boundary checking, a
regex implementation, or any other matching mechanism.

### F-D.5 — ⚠️ Malformed execution is not absence

The current defective implementation lets caller punctuation corrupt the derived regex and make git
return a genuine parser error — **witnessed at D6**: `symbol='Eligibility\).*('` → `fatal: Unmatched (
or \(`, `rc=128`. ⛔ **That is not a zero-result.** After D6 is correctly implemented, literal caller
text must no longer be able to cause that class of matcher-program failure merely by containing
punctuation. ⛔ **F-D must not be used to swallow real execution errors.**

### F-D.6 — Scope of the negative claim

Zero results mean: *no whole-symbol occurrence was found within the bound repository state and
authorized search scope of this invocation.* ⛔ They do **not** mean the symbol does not exist
anywhere, never existed historically, cannot be generated, or is absent outside the searched subject.
**The negative claim is scoped to the act actually performed.**

### F-D falsifiers

```text
F-D-F1  ordinary no-match throws or returns execution failure
F-D-F2  matcher rc=1 for ordinary absence is exposed as a public error
F-D-F3  genuine matcher/tool failures are swallowed and returned as zero matches
F-D-F4  an empty result is represented as proof of global/non-scoped nonexistence
F-D-F5  zero-result behavior depends on ambient grep configuration
F-D-F6  implementation changes D6 matching semantics while claiming only to repair absence handling
```

---

## Record consequence applied with these rulings

`JOP-04_RB-6B-CI_CANONICAL_INVOCATION_IDENTITY_DESIGN_2026-09-14.md` carried the **H2** example
asserting that `{format:'a'}` and `{format:'b'}` are *different requests denoting one act*. That is
**superseded in place** (struck, pre-D2 reading retained beneath): they are now **two inadmissible
requests, not an equivalence pair**, and the canonicalizer must **refuse** rather than normalize
(D2.6 · D2-F6). The H2 hazard row is marked **DISPOSED BY D2** — the repair is **removal from the
public language, not consumption.**

---

## Programme state — all semantic questions closed

```text
D4   ⭐ RATIFIED     omission belongs to the caller; default resolution belongs to the host
D1   ⭐ RATIFIED     a path is an identity; a pathspec is a selection program
D5   ⭐ RATIFIED     repo.grep.pattern = POSIX BRE, pinned; ambient config has no authority
D6   ⭐ RATIFIED     symbol is a literal identifier; caller has no regex authority
D3   ⭐ RATIFIED     max_results is a real global LIMIT; the handler is wrong
D2   ⭐ RATIFIED     A · schema wrong — format is not an authorized caller term

F-C  DISPOSED BY D6      F-D  ⭐ RATIFIED — absence = valid zero-result
F-E  DISPOSED BY D2 — the field must not be solicited
```

### ⛔ The semantic gate is clear. That is not authorization to write code.

`04d7c09d1` left handlers untouched and implementation blocked pending exactly these rulings. **The
next legitimate act is a BOUNDED REPAIR SPECIFICATION + PREDECLARED WITNESS**, after which
implementation may be authorized **against that exact scope** — never wider.

⛔ **`check.run` is NOT pulled into that repair.** It remains separately blocked by its
delegated-execution problem, and none of these rulings reach it.

```text
NEXT ACT          bounded repair specification + predeclared witness   ⛔ awaits a founder act
IMPLEMENTATION    ⛔ BLOCKED until that spec exists and is authorized
HANDLERS TOUCHED  0
```
