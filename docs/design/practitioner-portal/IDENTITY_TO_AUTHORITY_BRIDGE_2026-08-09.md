# Identity-to-Authority Bridge — Decision Instrument

**Status: DECISION INSTRUMENT — 2026-08-09.** ⛔ Rules nothing. Arises from
[Founder Ruling 1](FOUNDER_RULING_1_COMMITMENT_AUTHORITY_2026-08-09.md) amendment 3 and the
[conformance audit](RULING_1_CONFORMANCE_AUDIT_2026-08-09.md) §4. ⛔ **Ruling 2 is held** until this
is settled.

## The question

> ⭐⭐⭐ **When constitutional authority attaches to a governed member identity, may Studio authenticate
> through a practitioner profile provided that the profile resolves uniquely to that member, or must
> authorization resolve the member identity explicitly before evaluating the constituted
> relationship?**

---

## 1. ⭐ EVIDENCE — the actual auth path

⚠️ **The audit's first statement of this path was wrong in direction and is corrected here.**

**[`lib/auth/getCurrentPractitioner.ts`](../../../lib/auth/getCurrentPractitioner.ts)**

```text
request
  ↓  getMemberIdFromRequest(request)          ← ⭐ MEMBER identity is the entry credential
memberId
  ↓  SELECT … FROM practitioners p JOIN members m ON m.id = p.member_id
     WHERE p.member_id = $1 AND p.status = 'active' LIMIT 1
PractitionerIdentity { memberId, practitionerId, slug, portalType, studioMode }
```

> ⭐⭐⭐ **The auth layer already resolves member-first, and returns *both* identifiers.**

⛔ So the founder's preferred order is **not** absent from the system — it is implemented at the
door. ⭐ What happens **after** the door is the whole of the problem:

```text
identity.memberId       ← ⛔ present, and discarded by the relationship check
identity.practitionerId → practitioner_clients → authority over a member
```

---

## 2. ⭐ EVIDENCE — is the mapping unique, and is it enforced?

📌 **Measured directly against production**, `maia_consciousness` on `minisforum`, read-only,
**2026-08-09**:

| Property | Measured value |
|---|---|
| Constraint on `practitioners.member_id` | ⚠️ **FOREIGN KEY only** — `REFERENCES members(id) ON DELETE CASCADE` |
| ⛔ **UNIQUE constraint** | ⛔⛔ **NONE** |
| Indexes | `idx_practitioners_member`, `idx_practitioners_member_id` — ⚠️ both **non-unique** (and duplicated) |
| `member_id` nullable | ⚠️ **YES** |
| Rows | **18** · distinct `member_id` **18** · null `member_id` **0** |
| Members with >1 active profile | **0** |

> ⭐⭐⭐ **The mapping is unique in fact, ⛔ not unique by construction.**

⚠️ Three consequences follow directly, ⛔ none of them speculative:

1. ⛔ Nothing prevents a second active profile for one member. The auth query's **`LIMIT 1`** would
   then **silently select one** — ⛔ no error, no ambiguity signal.
2. ⚠️ `member_id` is **nullable**, so a profile that resolves to **no** governed member is
   representable today.
3. 📌 **The substrate moved.** Ruling 1's evidence recorded **17/17** at `b1399f693` (2026-08-06);
   today it measures **18/18**. ⭐ The invariant held across the change — ⛔ but it held **by
   practice, not by constraint**, which is exactly what an unenforced invariant looks like right up
   until it doesn't.

---

## 3. The viable interpretations

| | Interpretation | Authorizes | Forbids |
|---|---|---|---|
| **A** | **Profile-sufficient.** A profile that resolves uniquely to a member *is* the member for authority purposes | Studio may evaluate authority using `practitionerId` alone | nothing new |
| **B** | **Resolve-then-evaluate** *(founder inclination)*. Profile is a valid **entry credential**; authority evaluation must resolve to the governed member identity **before** the relationship check | profile authentication; role surfaces; professional identity | ⛔ evaluating a commitment against a profile identifier; ⛔ any authority path that never names the member |
| **C** | **Member-only.** The profile plays no part in authorization at all | member-keyed authorization | ⛔ also forbids profile-scoped *practice* surfaces that have nothing to do with a member |

⚠️ **A is not straw.** Its real argument: the mapping *is* unique in production, the auth layer
already returns `memberId`, and requiring an explicit resolution step adds ceremony without changing
any current outcome. ⛔ Its cost is that correctness rests on an **unenforced** invariant (§2) and on
`LIMIT 1` never mattering.

⚠️ **C over-forbids.** Ruling 1 explicitly preserves the professional profile as legitimate. A
practitioner's own bookings, calendar, and practice settings are profile-scoped and touch no member;
C would make them constitutionally suspect for no gain.

---

## 4. What **B** would authorize and forbid

```text
authenticated practitioner profile
        ↓
resolve practitioner.member_id
        ↓
governed member identity
        ↓
relationship_spaces threshold      ← both identified · active · accepted
        ↓
authority within commitment
```

⛔ **Not:**

```text
practitioner profile
        ↓
practitioner_clients
        ↓
authority over member
```

⭐ **B preserves the professional profile as a legitimate role surface ⛔ without making it the
constitutional person.**

⚠️ **What B does *not* by itself require** — ⛔ recorded so it is not assumed into existence:
B fixes the **order of resolution**. It does ⛔ **not** decide whether the unenforced uniqueness of
§2 must be made structural (a UNIQUE constraint, a NOT NULL). ⭐ That is a separate act; B is
satisfiable with the constraint absent, ⚠️ though the `LIMIT 1` ambiguity survives if it is.

---

## 5. Implications for the 17 Studio routes

⛔ **No route is repaired, and none is reclassified by this instrument.**

| Class | Effect under B |
|---|---|
| Routes touching **no** `member_id` (bookings · calendar · groups · decisions · changes · imports) | ✅ **unaffected** — profile-scoped practice surfaces, no commitment to evaluate |
| [`clients/[id]/patterns`](../../../app/api/studio/clients/%5Bid%5D/patterns/route.ts) | ⛔ remains an **open conformance finding** under Ruling 1; B would additionally name *what the correct path looks like* — ⛔ it does not itself authorize the change |
| [`protocols`](../../../app/api/studio/protocols/route.ts) · [`protocols/[id]`](../../../app/api/studio/protocols/%5Bid%5D/route.ts) | ⛔ **held open** — ⛔ **not** to be classified as violating until *the authority object of practitioner-authored material* is ruled (founder, 2026-08-09) |
| [`pattern-ledger`](../../../app/api/studio/clients/%5Bid%5D/pattern-ledger/route.ts) | ⭐ **stays fail-closed.** ⛔ Ruling 1's existence does **not** reopen it; reopening is a **separate conformance act** |
| [`now-what/home`](../../../app/api/now-what/home/route.ts) | ✅ unaffected — the member reads their own material; no authority over another party |

> ⭐⭐⭐ **The reconciliation is authority-path shaped, ⛔ not route-fix shaped.** Ruling 1 is **ahead of
> the consuming architecture**: the constituting side already knows what a commitment is; much of
> Studio still authorizes through the contact model.

📌 **And this is convergence work, ⛔ not replacement.** Five conforming paths — consent, join/accept,
invite, the MAIA threshold read, member-own-data — show the ratified threshold is ⛔ **not alien to
this codebase**. Parts of AIN independently arrived at it. ⭐ The task is **bringing the remaining
authority paths into coherence with a principle the system already embodies in places.**

---

## 6. Implications for Ruling 2 (Custodial Authority)

⭐ Ruling 2 must name **to whom a mandate is issued**. That recipient is unstatable until this is
settled:

| If | Then Ruling 2 |
|---|---|
| **A** | may issue a mandate **to a profile** — ⚠️ and a profile is not a governed person under Ruling 1, so the mandate's holder would be constitutionally undefined |
| **B** | issues to a **governed member identity**, optionally *acting in* a role — ⭐ the holder is defined, and the role is describable without being sovereignty-bearing |
| **C** | issues to a member with ⛔ no role expression available |

> ⚠️ **Under A, Ruling 2 would be making this ruling silently by choosing a recipient** — the exact
> failure the lane's governing discipline exists to prevent.

---

## 7. ⭐ The smallest founder ruling required

> **Authentication may proceed through a practitioner profile. Authorization may not. Before any
> constituted relationship is evaluated, the acting identity must be resolved to the governed member
> identity, and the commitment must be evaluated against that member identity. A professional profile
> is an entry credential and a role surface; it is never the party to a commitment.**

⭐ Ratify, amend, or reject. ⚠️ Three adjacent questions this formulation deliberately leaves open —
⛔ each is a separate act:

1. Whether the **unenforced uniqueness** of §2 (no UNIQUE, nullable `member_id`, `LIMIT 1`) must be
   made structural.
2. Whether a member may hold **more than one** practitioner profile.
3. Whether the two candidate Ruling 1 findings are violations — ⛔ explicitly **held open**, and for
   `protocols`, held until the authority object of practitioner-authored material is ruled.
