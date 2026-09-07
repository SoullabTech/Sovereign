# CIRCLE-04 · R3 verified · R4 implemented

## 1. R3 — verification of record

**Candidate:** `d1742472`
**Method:** founder-run against a local disposable shadow database restored from the full production
schema, with the R2 migration applied **locally only** and synthetic disjoint Circle principals
seeded. Shadow database **and** worktree deleted afterwards. **Production received no writes.**

```text
34 passed · 1 failed · 0 warned · 0 skipped   →   exit 1

remaining:  C6  response_count  → R4
```

```text
S4a  1 active member  → FORMING   PASS
S4b  2 active members → FORMING   PASS
S4c  3 active members → ACTIVE    PASS
S4d  3 → 2            → FORMING   PASS
S4e  2 → 3            → ACTIVE    PASS
C14                              PASS
```

**Containment:** shadow held 0 removal rows, 0 verifier shares, 0 verifier responses; shadow and
worktree deleted. Production unchanged — R2 table **ABSENT**, `4 circles · 4 memberships · 0 shares
· 0 inquiries · 0 responses`.

```text
R1 = R2 = R3 = VERIFIED ON CANDIDATE / PRODUCTION CLOSURE PENDING eventual deploy
```

### C14 kept (founder ruling)

Authorized to remain. It is a **dependency-boundary falsifier**, useful even though it cannot make
TypeScript's structural typing safe by itself. **CA-14 stays open** — identical string values still
permit structural mix-ups *outside* those two modules. **C14 is containment, not resolution.**
FieldPhase is not renamed or refactored.

---

## 2. R4 — the participation count

**Status:** IMPLEMENTED · ⛔ **NOT VERIFIED — no database or dependencies in a remote session.**
**No migration. No schema change.**

### Removed, not hidden

The founder's census matched exactly three sites, all now gone:

| | |
|---|---|
| `lib/circles/inquiryService.ts` | the correlated `COUNT(*)` in `listInquiries()` |
| same | `response_count` in the return type |
| `components/circles/FieldMemory.tsx` | the stale client type declaration |

`listInquiries()` computed the count; **nothing consumed it** — `FieldMemory.tsx` declared the field
and never rendered it. So there was no internal operational metric to preserve while suppressing
presentation. It was simply **unnecessary member-facing data**, and it is removed rather than
cosmetically hidden.

⛔ **Not substituted with** `has_responses` · percentages · progress · participation ratios ·
completed-member counts · badges · any qualitative proxy derived from participation quantity.

> **The repair is about not turning participation into a social signal in the first place.**

That reasoning is recorded **at the site**, so the count is not reintroduced later as a convenience.

### Scope, stated where it can be read

⛔ **This does not mean PostgreSQL may never count rows.** FR-08.7 concerns **Circle social surfaces
and member-facing status mechanics.** Counts remain legitimate wherever technically required —
constitutional derivation, authorization, integrity checks, verification, operations.

`constitutionState.ts` counting active memberships to derive FORMING/ACTIVE **is constitutional
derivation, not social ranking**, and remains valid.

### C6 — destination-aware

C6 matched one historical token. It now asks one question of **two destinations**: does the
member-facing inquiry listing, or a Circle surface component, carry a participation quantity —
`response_count` · `responseCount` · `participation_count` · `participationCount`?

⛔ **It deliberately does not sweep Circle code for `COUNT(*)`**, which would flag the legitimate
constitutional derivation. Comments are stripped before matching, so the site's own explanation of
why the count was removed cannot read as the defect returning.

## 3. Expected direction — an expectation, not evidence

If R4 is correct, **VERIFY should reach its first full candidate `0 failed`.** ⛔ No required total
is manufactured. R4 adds no migration; the shadow database is still needed to carry R2's.

## 4. ⭐ Principle recorded (founder, cross-lane)

Not ratified as Circle law — articulated by the founder as a general architectural principle, and
recorded so it is not lost:

> **Prefer derived facts over declared system state when the authoritative fact already exists and
> the derivation is deterministic.**

Broader and safer than *all state should be derived*. A Circle's **plurality** can be derived.
Whether a Circle is **complete**, whether a relationship is **repaired**, whether something new is
**being born** — cannot. Those require **human acts of meaning and authority.**

```text
FACT DERIVATION        the system reads what is already true
MEANING DECLARATION    a person authors what it means
```

This may be one of the cleaner principles emerging across MAIA. It also names precisely why
FR-13 works and why CA-04's richer lifecycle must stay separate.

## 5. Next — R5 before anything else

If the run reaches `0 failed`, **do not proceed to INVOKE.** `R5 · CLASS-B RE-CENSUS` comes first:
re-read every remaining Class-B item against the repaired candidate and classify each as
**STILL DEFECT · RESOLVED INDIRECTLY · SUPERSEDED BY CONSTITUTION · DEFER TO INVOKE · DEFER TO
OBSERVATION · DOCUMENTATION / PROVENANCE ONLY**. ⛔ **No repair during that census.**

## 6. What R4 does not do

No migration · no deploy · R2 migration not applied to production · FieldPhase untouched · no
facilitator assignment · founder gate untouched · no cohort · **R5 not started.**
