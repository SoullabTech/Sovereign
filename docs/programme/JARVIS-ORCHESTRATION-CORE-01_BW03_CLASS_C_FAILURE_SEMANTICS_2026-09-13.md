# BW-03 — CLASS-C FAILURE SEMANTICS

**Founder-authorized 2026-09-13.** One crossing only: focus. ⛔ No migration of the 20, no generic
framework, no schema redesign, no ownership extraction.

**Question**: *can a Class-C path preserve disclosure symmetry BEFORE authority while becoming
unmistakably loud when materialization fails AFTER authority?*

**Answer: yes, and it was proved on a known-bad input before the input was repaired.**

---

## 1. The three domains that were one value

```
1. AUTHORIZATION FAILURE    "you may not cross this boundary"
2. ABSENCE                  "there is no authorized resource here"
3. MATERIALIZATION FAILURE  "authority was established; the resource could not be loaded"
```

Before BW-01 the focus crossing collapsed all three into `null`. **That is why W7 could hide for the
life of the feature.** BW-01 separated (1) structurally; BW-03 separates (2) from (3).

## 2. The algebra

`lib/writers-studio/focusMaterialization.ts`

| Outcome | Meaning | Layer |
|---|---|---|
| `UNAVAILABLE` | authority not established — **outwardly symmetric** | the binder, pre-authority |
| `loaded` | authorized content obtained | assembler |
| `empty` | authorized, and genuinely nothing to read — **a true answer** | assembler |
| `materialization_failed` | authority established; the content operation failed | assembler |
| `invariant_failed` | impossible state / contract violation | assembler + crossing |

⛔ **`empty` is deliberately NOT a failure.** An authorized Work with nothing in it yet is a true
answer. Folding it into `materialization_failed` would be loud and wrong; folding a failure into it
is the W7 defect. *The point of the algebra is that the two stop being the same value, so collapsing
them in either direction defeats it.*

⭐ **`BW-LAW-2` is enforced by the type, not by discipline**: `FocusMaterialization` **cannot
express** the pre-authority refusal. A content loader consumes authority and returns content or a
materialization failure; it cannot return "not authorized", because it has no word for it.

### 2.1 Disclosure changes at the authority line

```
PRE-AUTHORITY    foreign Work · absent Work        → same external presentation   (AUTH-04)
POST-AUTHORITY   materialization failure           → explicit operational failure (AUTH-05)
```

Post-authority, the system has already proved **this member may access this Work**. Telling them
*"your Focus is there, but I couldn't load it just now"* discloses nothing about anybody else's
resource. ⭐ **That is a direct dividend of separating authorization from materialization** — it was
not sayable before, because saying it would have been a leak.

`state` remains `did_not_cross` in every failing case — truthfully, nothing crossed. What changed is
that the writer is no longer told the same sentence as an unauthorized caller.

---

## 3. ⭐ The falsification, in the order that makes it evidence

W7 was used as a **negative control** and repaired only after the mechanism was shown to catch it.

### 3.1 KNOWN-BAD run — the broken query still in place

```
W7  SCHEMA FACT      `manuscripts`.`user_id` absent · real shape is `member_manuscripts`.`member_id`
W8  KNOWN-BAD        kind=materialization_failed · stage=query · operator sees the exact schema fault
W9  KNOWN-BAD        post-authority failure is DISTINGUISHABLE from pre-authority refusal
W10 pre-authority symmetry   foreign ≡ absent — loudness did not leak backwards
                                                                        11 passed · 0 failed
```

The three prohibitions, asserted directly: **must NOT return `null` · must NOT be `unavailable` ·
must NOT resemble a foreign or absent Work.** All held against the real defect on a real database.

### 3.2 REPAIRED run — same witness, same database, `manuscripts → member_manuscripts`, `user_id → member_id`

```
W8  REPAIRED         kind=loaded · content materialized
W9  REPAIRED         authorized focus reaches cognition
W10 pre-authority symmetry   foreign ≡ absent — loudness did not leak backwards
                                                                        11 passed · 0 failed
```

⭐ **This is the first time a Work has been materialized at the focus crossing.**

### 3.3 Why the order is the whole point

```
KNOWN-BAD   loudly MATERIALIZATION_FAILED
REPAIRED    LOADED
```

Had the query been repaired first, the mechanism would have been green with nothing to catch — the
same condition under which the defect survived for the life of the feature. ⛔ **A mechanism that
has not been shown failing on a known-bad input has not been shown to work.**

---

## 4. What the repair is and is not

⛔ **The repair is not what makes this safe.** The classification is.

> A wrong query can no longer impersonate a truthful answer about the member's world.

That is the property. The corrected SQL is one instance of it being exercised.

## 5. Superseded in place, not deleted

`focusCrossing.test.ts` **C8** previously asserted that an unowned Work and an **unreadable** Work
present identically. That was the conservative reading under A1 and is **wrong under BW-03**: the
symmetry obligation belongs strictly *before* the authority line. C8 now asserts symmetry between two
pre-authority cases, and **C8b** asserts that a post-authority failure presents differently and never
claims the Work is empty. The reasoning is recorded in the test body rather than dropped.

Also hardened: an assembler returning nothing at all is now `invariant_failed` — unreachable through
the types, reachable through a stale caller, and **never silently treated as absence**.

## 6. Laws this earns — ⛔ candidates, derived not canonized

> **AUTH-05 — Authorized failure may not masquerade as absence.** Once authority has been
> established, failure to materialize the authorized resource must remain distinguishable from
> legitimate absence at the operational boundary.

> **BW-LAW-2 — Content loaders consume authority and return content or a materialization failure;
> they do not return "not authorized."**

Both are now **demonstrated at one crossing**, which is the condition the founder set for deriving
them through BW-03 rather than canonizing them in advance. ⛔ Ratification is a separate act.

## 7. What BW-03 does NOT authorize

- ⛔ The C1–C4 refinement of the 20 Class-C paths. *Doctrine first demonstrated, then classified
  against* — that sequencing was the ruling, and it is not yet complete beyond this one crossing.
- ⛔ Migration of any other Class-C path. Baseline still **33**.
- ⛔ A generic materialization framework. `FocusMaterialization` is focus-shaped on purpose.
- ⛔ Any schema change, deploy, or production witness.

## 8. Gates

| Gate | Result |
|---|---|
| BW-01R/BW-03 witness — KNOWN-BAD | **11 passed · 0 failed** |
| BW-01R/BW-03 witness — REPAIRED | **11 passed · 0 failed** |
| `jarvis` · `writers-studio` · `writersStudio` · `manuscript` · `canonical-turn` · `disclosure` | **94 suites · 1675 passed · 0 failed** |
| `npm run typecheck` | **0 regressions** |
| `npm run check:no-supabase` | clean |

## 9. Standing

**BW-03 COMPLETE AT ONE CROSSING · KNOWN-BAD AND REPAIRED RUNS BOTH RECORDED · AUTH-05 AND BW-LAW-2
DEMONSTRATED, NOT RATIFIED · C1–C4 CENSUS NOT OPENED · BASELINE STILL 33 · NO SCHEMA · NO DEPLOY ·
NO PRODUCTION WITNESS · BP-1/BP-2/BP-3/BP-4 OPEN · OPEN-1 UNTOUCHED.**

> *When MAIA says "there is nothing there", the architecture should be able to distinguish that from
> "I failed to see what was there."*
