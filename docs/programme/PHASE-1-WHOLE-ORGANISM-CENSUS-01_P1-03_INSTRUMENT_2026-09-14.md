# PHASE-1-WHOLE-ORGANISM-CENSUS-01 · P1-03 · NORMALIZATION INSTRUMENT

```text
STEP        P1-03 · COMMON EVIDENCE SCHEMA — normalize without interpreting
SUBJECT     1a5554300e855d3581085849301a39cbb10ab385
AUTHORIZED  founder, 2026-09-14
TYPE        RECORD ONLY
INPUT       the nine P1-02 domain records — CLOSED, and not reopened by this step
OUTPUT      one normalized capability register
```

> ⭐ **P1-03 restates. It does not decide.**
> Where a P1-02 record did not determine a field, this step writes
> **`NOT DETERMINED BY SOURCE RECORD`** — ⛔ it does not fill the gap.

---

## 1 · ⚠️ Label ambiguity, declared rather than guessed

The authorization reads: *"normalization under the founder amendment and E1/E2/E3/E4 inference
contract."* **`E1/E2/E3/E4` has no unambiguous referent in this lane's records**, and there are
two candidates:

| Candidate | Problem |
|---|---|
| **E-1 · E-2 · E-3** — the P1-00 **declared exceptions** (shallow clone · branch policy · branch naming) | There are **three**, not four, and ⛔ **they are not inference rules.** E-1 is an evidence constraint; E-2 and E-3 are governance and clerical debt. |
| The **prohibited inferences** ruled in the instrument and Amendment 1 | These *are* inference rules — but they were never labelled `E-n`, and ⛔ reusing `E-n` for them would create precisely the vocabulary collision this census spent P1-01 and P1-02 documenting. |

⛔ **Neither is adopted by assumption.** The inference contract is therefore given its own
non-colliding prefix below, assembled **only from already-ruled material, with each rule's
ruling source named.** All five are applied, because a prohibition set can only constrain — a
superset is safe where a guess is not. **If `E1–E4` names a different or narrower set, say so and
this file is corrected.**

⛔ `E-1`, `E-2` and `E-3` keep their existing P1-00 meanings unchanged.

---

## 2 · ⭐ The inference contract — `INF-1` … `INF-5`

Every prohibition below is already ruled. This section binds them into one checkable list.

```text
INF-1   WIRED            ↛  LIVE
        source: P1-02 instrument §3, LIVE calibration
        LIVE needs a traced path AND a dated in-repo runtime witness. Both, or not LIVE.

INF-2   CI-GATED         ↛  RUNTIME GOVERNED
        source: Amendment 1 §2, on domain A's refusal-registry result
        A static or build-time instrument is not a request-time gate.

INF-3   CONFIG-SELECTED  ↛  AUTHORIZED
        source: Amendment 1 §2, on domain G's environment-selected failure semantics
        An env var or request flag selecting behaviour authorizes nothing.

INF-4   IMPLEMENTED      ↛  GOVERNED
        source: P1-02 instrument constraint 6 — governance absence survives
        implementation discovery. Finding the code does not make the behaviour governed.

INF-5   ONE FAMILY       ↛  ORGANISM-WIDE
        source: Amendment 1 §1, the coverage rule
        A capability found on one MAIA-claiming path is not organism-wide until
        coverage across the other MAIA-claiming families is established.
```

⭐ **`INF-5` is the one this step can most easily break.** A register is a flat list, and a flat
list silently reads as *"the system."* Every row therefore carries an explicit **coverage** field;
⛔ a row may not be written without one.

---

## 3 · The normalized row

One row per **named object**, never per word (the hard vocabulary rule stands).

```text
ROW ID              P3-<DOMAIN>-<n>
DOMAIN              A · B · C · D · E · F · G · H · I
NAMED OBJECT        the concrete artifact, path, table, function or column
ARTIFACT            file path (file:line where the source record gave one)
STATUS              LIVE · PARTIAL · OBSERVATION-ONLY · WIRED-BUT-UNOBSERVED · DORMANT
                    · ORPHANED · BLOCKED · SUPERSEDED · DOCUMENTATION-ONLY · UNKNOWN
ALTITUDE            any of: EXISTS · WIRED · RUNTIME-GATED · CI-GATED · CONFIG-SELECTED
                    · OBSERVED · GOVERNED   (a set, not a single value)
COVERAGE            which MAIA-claiming cognition families this holds for,
                    or NOT APPLICABLE, or NOT DETERMINED BY SOURCE RECORD
LADDER              EXISTS · PARTICIPATES · KNOWS · CONSIDERS · CONTRIBUTES · DECIDES
                    · HAS AUTHORITY
                    ⛔ ONLY where the source record already established it.
                    Otherwise NOT DETERMINED BY SOURCE RECORD.
GOVERNANCE GATE     the gate, with its altitude — or NONE FOUND
GOVERNING SOURCE    the P1-01 governing source, or NONE LOCATED
SOURCE RECORD       the P1-02 domain file and section this row restates
```

### ⛔ Prohibited in this step

- ⛔ Assigning a `LADDER` position the source record did not establish.
- ⛔ Upgrading a `STATUS` — including `WIRED-BUT-UNOBSERVED` → `LIVE` (`INF-1`).
- ⛔ Resolving a contradiction, or dropping either side of one.
- ⛔ Merging two rows because they share a word (the vocabulary rule).
- ⛔ Splitting one row into two to make a status tidier.
- ⛔ Adding any capability not present in a P1-02 record.
- ⛔ Re-reading source code to settle a question a domain left open — **that would be
  re-running P1-02, not normalizing it.**
- ⛔ Citing, awaiting, or answering **AUTH-EXPOSURE-01**. It is separately owned. Its findings
  return to this lane later **as new evidence**, ⛔ never as a retroactive change to what P1-02
  observed at the subject.

---

## 4 · Lane boundary — non-absorption, both directions

```text
PHASE-1-WHOLE-ORGANISM-CENSUS        AUTH-EXPOSURE-01
P1-03 🟢 · P1-04 · P1-05             🟠 RUNNING IN PARALLEL

may CITE the authorization findings    may USE P1-02 domain I as opening evidence
as organism evidence                   ⛔ may not take over P1-03/04/05
⛔ may not investigate them             ⛔ may not rewrite the organism census
⛔ may not repair or redesign them      results return LATER, as new evidence
⛔ may not wait for that lane
```
