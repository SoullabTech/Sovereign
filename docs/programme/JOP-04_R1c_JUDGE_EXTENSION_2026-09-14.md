# JOP-04 · R1c — Judge extension: three boundaries the frozen judge did not exercise

**Status:** ⭐ **SEALED. Instrument only.** ⛔ **No product edit. No pin re-sealed. Merge blocked.**

```text
CANDIDATE UNDER TEST   9e1798028      ⚠️ NOT ACCEPTED
JUDGE                  R1b 5ec93b4cc  → extended here
BOUNDARIES             13 → 16
```

> **The frozen judge was green on a candidate with three live semantic defects.** Passing a
> sealed witness is necessary, not sufficient — and this is the case that proves it.

---

## The three gaps, reproduced against `9e1798028`

### 1 · D6 full symbol domain — a narrowed domain, not just a removed authority

`--fixed-strings --word-regexp` correctly removes the caller's *regex authority*. ⛔ **But `-w`
imports git's word-character grammar, and argv position imports an option grammar** — and D6
explicitly permits **arbitrary literal symbol strings** while forbidding an accidental lexical
grammar.

```text
symbol '+foo'     tree contains  x+foo       → returned ZERO RECORDS
                  a word character sits to the left, so the word-boundary rule rejects it
                  ⭐ present, and reported absent — a CONFIDENT WRONG ANSWER, not an error

symbol '->next'   tree contains  p->next     → THREW
                  the leading '-' was consumed as a git OPTION rather than sought
```

⭐ **Removing the caller's authority over the matcher is not the same as narrowing the caller's
domain.** The first defect is the D5 species again: the failure is not an error, it is a wrong
answer. ARM 3 is a control — widening the domain must not resurrect absence-as-failure.

### 2 · Role confusion survives before execution

`runCapability()` still applies the old spelling-based containment test to **every** string
argument carrying a `maxLength`:

```text
repo.grep          { pattern: '../x' }   → REFUSED: "Path argument pattern resolves outside cwd"
repo.locate_symbol { symbol:  '../x' }   → REFUSED: "Path argument symbol resolves outside cwd"
```

⛔ **A GREP_PATTERN and a SYMBOL are adjudicated as PATHs because of how their value is
SPELLED.** That is inference-by-characters — the architecture D1/D5/D6 superseded — surviving
*upstream* of the handlers the repair corrected.

> **Role is assigned by the capability contract. It is never read off the value.**

⛔ **The control arm is the load-bearing half:** a real PATH field must *keep* refusing an
escape. Role separation must never be bought by dropping containment.

### 3 · D4 admission correspondence

`describeInvocation()` refuses unknown and missing-required arguments, but not the type/min/max
the executor enforces:

```text
repo.grep { max_results: 999 }   describe ADMITS · execute REFUSES
repo.grep { max_results: 0   }   describe ADMITS · execute REFUSES
repo.grep { pattern: 123     }   describe ADMITS · execute REFUSES
git.log   { max_count: 0     }   describe ADMITS · execute REFUSES
repo.grep { pattern: <valid> }   describe admits · execute admits      ← the positive control
```

⛔ **The seam describes "invocations" that are not invocations.** Admissibility is one
judgement; a record that disagrees with the executor about what an act even *is* cannot be the
basis of act identity.

---

## ⭐ The pinned fixture was not disturbed

The new vectors needed a subject. ⛔ **Any change to `buildFixture()`'s commits would move its
commit SHAs and break the D2.3 pin — an exact byte value this act has no authority to
re-seal.** So R1c adds a **separate** `buildSymbolDomainFixture()` repository and leaves the
pinned one untouched, proven by value:

```text
pinned fixture HEAD before R1c   3fac9c2fe3167a241f54b8e774d2bf48e30b55ef
pinned fixture HEAD after  R1c   3fac9c2fe3167a241f54b8e774d2bf48e30b55ef   IDENTICAL
pin files changed                0
product files changed            0
```

---

## Phase targets

All three were **RED at the unrepaired subject too** — no seam existed, the same spelling-based
path test applied, and the derived matcher already imported a grammar — so `pre` targets them
RED and `post` targets them GREEN, consistent with the existing thirteen.

```text
--phase pre    at 9e1798028   3 RED · 13 GREEN ·  8 mismatches · exit 1
--phase post   at 9e1798028   3 RED · 13 GREEN ·  3 mismatches · exit 1
```

⭐ **The three post-mode mismatches are exactly the three new boundaries. The thirteen the
candidate already discharged stayed GREEN** — the extension found new law, it did not disturb
settled law.

---

## Standing

```text
REPAIR 9e1798028       ⚠️ CANDIDATE · NOT ACCEPTED
R1c JUDGE              ✅ SEALED · 16 boundaries
PRODUCT CORRECTION     ⛔ awaits a founder act
MERGE · PRODUCTION     ⛔ BLOCKED
RB-6B · check.run      ⛔ OUT
```
