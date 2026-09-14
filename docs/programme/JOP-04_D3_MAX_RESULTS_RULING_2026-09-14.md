# JOP-04 · D3 — `repo.grep.max_results`: RATIFIED · **B · HANDLER WRONG**

**Status:** ⭐ **RATIFIED — founder, 2026-09-14.** ⛔ **No handler repair is authorized. Handlers touched: 0.**
**Witness:** `scripts/jop04/d3-max-results-evidence.mjs` — read-only, exercises only the registered
read capability `repo.grep` through the registry's own `runCapability()` · **5 passed · 0 failed**.

> **If the system asks the caller how many results to return, accepts the answer, and carries it into
> execution, it must honor that answer.**

```text
CAPABILITY            repo.grep
FIELD                 max_results
ROLE                  LIMIT
CALLER RANGE          integer 1…200
EXPLICIT N            caller-authored
OMISSION              caller-authored absence
HOST DEFAULT          200 · source=host_default
BOUND                 GLOBAL returned-result cardinality
SELECTION             prefix only · no new ranking authority
SEMANTIC SOURCE       REGISTRY_DEFINED

CURRENT RUNTIME       reads / defaults / checks N, then ignores it
CURRENT STATUS        DEFECT · H3
```

---

## Why D3 needed no second archaeology pass

The D2 census established that the **original authorial intent of these adopted bytes is
unrecoverable** — `HISTORICAL SUBJECT A · 0 commits anywhere · bytes unavailable`. `max_results`
shares that provenance exactly. ⛔ **Repeating the walk would not create evidence that no longer
exists.**

⭐ **But D3 has a materially different PRESENT-TENSE substrate, and that is what decides it.** Where
`format` is dormant — declared and never touched by execution — `max_results` is **read, resolved,
and re-validated by the handler itself**:

```text
const max_results = args.max_results || 200;              ← read + host default
if (max_results > 200) throw new Error(…);                ← re-validated
const cmd = ['grep', '-r', '--line-number', '--null', args.pattern, '.'];   ← never applied
```

⭐ **The runtime itself recognizes `max_results` as an operational term and then fails to discharge
it.** A field the handler goes out of its way to read and bound is not a field the handler believes is
vestigial. **That is stronger evidence than any provenance walk could have produced, and it is
present-tense rather than historical.**

---

## D3.1 — Caller term

```text
repo.grep { pattern: P, max_results: N }
```

`N` is caller-authored and means **return at most N results from this invocation.** The existing
accepted domain is ratified: `1 ≤ N ≤ 200`. ⛔ **A value accepted as `max_results: 1` may not produce
two result records.**

## D3.2 — Omission follows D4

⛔ Omission does **not** mean the caller asked for `200`.

```text
INVOCATION                     EXECUTION PLAN
caller_terms:                  host_terms:
  pattern: P                     max_results: 200
  max_results: UNSPECIFIED       source: host_default
```

These remain **distinct invocations** even though they presently execute with the same effective
bound:

```text
{ pattern: P }              ≠            { pattern: P, max_results: 200 }
```

D4's attribution rule applies unchanged.

## D3.3 — The limit is global

`max_results` means **at most N results for the invocation**, not N per file. ⛔ A repair that can
return 200 matches from each of ten files under `max_results: 200` **has not implemented D3.** This is
an operation-level limit.

## D3.4 — "Result" means one returned grep hit record

```text
IS        (path, line/location, matched source record)
IS NOT    one byte · one regex capture · one occurrence within a line · one file
```

The limit bounds **externally returned result records**. ⛔ It does **not** establish a CPU,
filesystem-read, scan or execution-time budget. An implementation may inspect more than N candidates
while returning at most N results.

## D3.5 — Limiting does not grant ranking authority

`max_results` **truncates the capability's existing ordered result stream.** ⛔ It does not authorize
the host to invent relevance scoring, ranking, sampling, deduplication, file preference, or "best N".

> **Prefix law.** For the same repository state and the same effective pattern semantics,
> `results(N)` MUST be the prefix of `results(M)` for `N < M`, whenever at least M results exist.

⭐ That gives D3 a **falsifiable semantic meaning without choosing an implementation.**

## D3.6 — Pattern semantics stay separate

Changing `max_results` may change **how many** result records are returned. ⛔ It may not change the
BRE interpretation ratified by D5, the repository search scope, what constitutes a match, caller
pattern authorship, or ambient configuration authority.

```text
MATCH SET / STREAM     determined by repo state + D5 pattern semantics
LIMIT                  bounds how much of that stream is returned
```

**Separate authorities.**

## D3.7 — The current state is H3, not a harmless no-op

```text
read N → default N → validate N → discard N → execute unbounded return
```

⭐ This is precisely the dangerous **H3** shape the contract already named: **the boundary appears to
enforce semantics that execution does not honor.** D3 adjudicates the ambiguity:

```text
DECLARED + DEFAULTED + VALIDATED + READ, BUT NOT APPLIED
  → unfinished execution
  → NOT vestigial schema
```

The current runtime is **defective relative to the ratified contract.** ⛔ No repair is authorized
merely by naming that defect.

---

## D3 falsifiers

```text
D3-F1  max_results=N returns more than N result records
D3-F2  the limit is applied per-file rather than globally
D3-F3  changing N changes BRE interpretation, search scope, or match semantics
D3-F4  omission is canonicalized as though the caller supplied 200
D3-F5  limiting re-ranks, samples, scores, or selects anything other than the prefix
D3-F6  an explicit max_results value is validated and accepted but does not affect
       returned cardinality when more than N hits exist
D3-F7  "200" is treated as a caller term when it actually arose from the host default
D3-F8  the limit is represented as an execution/scan-resource ceiling even though the
       contract only bounds returned results
```

### ⭐ D3-F1 and D3-F6 are LIVE — witnessed, not inferred

Exercised through the registered capability itself at `293824d4b`:

```text
runCapability('repo.grep', { pattern: 'declareRoutingEligibility', max_results: 1 })
  → 34 records returned

max_results: 200 → 34      omitted → 34      max_results: 1 → 34
```

⭐ **`max_results: 1` was accepted and returned thirty-four results.** Every N is indistinguishable
from every other N and from omission: **the term is inert at execution while being fully live at the
boundary.** From source, the same shape: `reads=true · defaults=true · re-validates=true ·
reaches the command=false`.

**D3-F7 is recorded as an obligation, asserted by nothing.** Omission and an explicit `200` currently
return identically — ⛔ **identical effect is not identical authorship**, and a canonical record that
collapses them would be defective even though the runtime cannot presently tell them apart. No
canonicalizer exists yet, so there is nothing to test; the obligation is written down so a future one
cannot be built past it.

---

## Programme state after D3

```text
D4   ⭐ RATIFIED     omission belongs to the caller; default resolution belongs to the host
D1   ⭐ RATIFIED     a path is an identity; a pathspec is a selection program
D5   ⭐ RATIFIED     repo.grep.pattern = POSIX BRE, pinned; ambient config has no authority
D6   ⭐ RATIFIED     symbol is a literal identifier; caller has no regex authority
D3   ⭐ RATIFIED     max_results is a real global LIMIT; the handler is wrong

D2   🔎 DISCOVERY CLOSED · ⚠️ CONSTITUTIONAL RULING STILL OWED

F-D  OPEN — repo.locate_symbol no-match semantics
F-E  OPEN — git.log.format solicited, validated, accepted, discarded
```

⭐ **D2 is now the last original semantic decision, and it has changed kind.** There is nothing left
to discover about it; the next act is to **decide what `git.log` shall be.**

### ⛔ Implementation stays BLOCKED after D2 too — until F-D is ruled

D6 says what a *symbol* means. It does not say what **"symbol absent"** means, and that word still has
two possible public semantics:

```text
valid ZERO-RESULT              (repo.grep's shape — catches status===1)
vs  EXECUTION FAILURE          (repo.locate_symbol's shape — throws)
```

⭐ **A repair written before F-D is ruled would decide F-D accidentally** — whichever branch the
implementer happened to write would become the public contract by deployment rather than by ruling.
That is precisely the *merge-to-canonical* failure mode this programme exists to refuse, in miniature.

```text
LANE OPEN · IMPLEMENTATION ⛔ BLOCKED · HANDLER CHANGES ⛔ NOT AUTHORIZED · HANDLERS TOUCHED 0
```
