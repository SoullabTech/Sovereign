# T1-A — KEEP INVOCATION

**Status:** CHARTERED 2026-09-17 by founder act. Scope NARROW. ⛔ Implementation NOT authorized.
**Opened by:** the founder adjudication closing the Maven rulings — `docs/canon/MAVEN_FOUNDER_ADJUDICATION_2026-09-17.md`.
**Gate position:** J0 ✓ · J1 ✓ · J2 ✓ · J3 ✓ · **J4 (experience / semantic contract) ← CURRENT** · T1-A

---

## The question

⛔ **NOT** *"How do we build Keeps?"* The repository already contains much of that.

⭐ **The question is:**

> **What member act legitimately invokes Keep, what exactly is being kept, and how does MAIA assist
> without becoming the selector?**

Only after that contract is explicit may the existing route and doctrine be connected to `/maia`.

---

## Inherited law (binding, not re-litigated here)

- **Keeps may order what the member has chosen; they never select on the member's behalf.**
- **Keep is the family concept / member gesture. Each implementation must carry a qualified identity.**
- **A capability declaration does not establish capability availability** (R3) — so no Keep surface reaches
  `Live` on the strength of a route existing.
- **Sanctuary content may not cross the boundary** (R5) — ⛔ **there is no Keep-out-of-Sanctuary act.**
  This constrains T1-A directly and is not negotiable inside this lane.
- Member Manual v1 §5 (*what Keep means*), §6 (*Keep vs Journal*), §7 (*leave open*), §14 (*MAIA does not
  decide what matters most*) are the member-side semantic inputs. §12 is superseded in part; read its
  current-law block, not the original.

---

## J3 — repository truth, read-only (verified 2026-09-17)

Objects presently bearing the name *Keep*:

| Object | Path | Note |
|---|---|---|
| Keep capture surface | `app/maia/keep-capture/page.tsx` | member-facing |
| Sovereign keeps route | `app/api/sovereign/keeps/route.ts` | carries `__tests__/keepsReadDoctrine.test.ts` |
| Manuscript keeps | `app/api/sovereign/manuscripts/[id]/keeps/route.ts` | Work-scoped |
| Writer's Studio hook | `app/writers-studio/useManuscriptKeeps.ts` | + `__tests__/keepAVersion.test.ts` |
| Psyche portfolio keep | `app/api/psyche/portfolio/keep/route.ts` | |
| Conversational keep | `app/api/psyche/conversational-keep/respond/route.ts` | |
| Keep-**open** capsule | `app/api/capsules/__tests__/keepOpenNonPersistent.test.ts` | ⚠️ see below |

### ⭐ Two findings the census hands to J4

**(1) The ontology needs more than three qualified identities.** The ruling named three branches
(Press-qualified · Psyche/portfolio-qualified · Capture). Repository truth shows at least **five distinct
objects** wearing the name, including a Work-scoped manuscript Keep and a version Keep (`keepAVersion`) that
neither of those three branches covers. ⛔ The tree is not wrong — it is **incomplete**, and completing it is
J4 work, not an implementation detail.

> ⛔ **FINDING (2) BELOW IS WITHDRAWN AS TO ITS EVIDENCE — 2026-09-17.**
> `keepOpenNonPersistent` parses as **(keep-open)(non-persistent)** — *opening the Keep panel must write
> nothing* — not *(keep)(open)*. It is a Keep-authority guard, not a Continuation collision. Claim withdrawn.
> ⭐ **The concern was correct and the true evidence is worse**: `lib/consciousness/keepIntent.ts` recognizes
> *"keep this open"* and *"keep this question open"* as `keep_material` (preservation) — a witnessed, live
> collapse of CONTINUE into KEEP. See `MAVEN-CUSTODY-01_RECONCILIATION_2026-09-17.md` §7.
> Original text retained below as authored.

**(2) ⚠️ "Keep" and "Keep open" are different acts sharing a verb.** Manual §5 (*a Keep is something you
deliberately choose to preserve*) and §7 (*leave this open — something you intend to return to*) are already
separated in member language, and §7 states the distinction explicitly: *something can be worth keeping
without being unfinished.* But `keepOpenNonPersistent` puts both senses on one lexeme inside the codebase.

⭐ This is the same defect class R4 ruled on — **one canonical term, one canonical referent** — arriving from
the member's side of the membrane rather than the canon's. A member who says *"keep that open"* has performed
**Continuation**, not **Keep** (Manual §11's four-way distinction). If the invocation seam cannot tell those
two apart, it will silently convert an intention-to-return into a preservation act, or the reverse.

⛔ Named, **not repaired here.**

---

## What T1-A must produce

A written invocation contract answering, with no implementation:

1. **The invoking act** — what the member does or says that legitimately constitutes *Keep*. Distinguished
   from adjacent acts: Journal, leave-open/Continuation, remind, share.
2. **The object** — what exactly is kept. A sentence? A turn? A span the member indicated? Whose boundaries
   are they, and who drew them?
3. **MAIA's assistance without selection** — how MAIA may help (disambiguate, confirm, order, retrieve)
   while the *choice of what matters* remains the member's. The falsifier for this clause is the load-bearing
   one: **a candidate mechanism in which MAIA's assistance is indistinguishable from MAIA selecting must fail.**
4. **The ambiguity rule** — Manual §6: *if MAIA is ever unsure what you mean, she should ask.* What triggers
   the ask, and what does the ask cost the member?
5. **The qualified-identity map** — which of the five-plus existing objects the contract governs, and which
   are out of scope with a reason.

---

## ⛔ Explicitly outside this lane

No work in T1-A may touch:

- `CAPABILITY_REGISTRY` or capability-availability architecture (**NODE-05 stays open at J5**)
- memory redesign of any kind
- Sanctuary modification (R5 is binding input, never a subject)
- `/maia` redesign
- the Keeps **invocation seam** itself — chartering the contract is not authorizing the wiring
- schema, migration, route, or UI mutation
- production

The Keeps **naming** portion is unblocked by the founder ruling. **The invocation seam is not.**

---

## Standing

```text
T1-A KEEP INVOCATION
CHARTER:            OPEN
GATE:               J4 — experience / semantic contract
CONTRACT:           ⛔ NOT AUTHORED
IMPLEMENTATION:     ⛔ NOT AUTHORIZED
INVOCATION SEAM:    ⛔ NOT AUTHORIZED
PRODUCTION:         UNTOUCHED
```
