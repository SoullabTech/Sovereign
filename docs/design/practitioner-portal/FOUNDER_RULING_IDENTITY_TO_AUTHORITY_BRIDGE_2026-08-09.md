# Founder Ruling — Identity-to-Authority Bridge

**Status: ⭐⭐⭐ RATIFIED — 2026-08-09.** Founder act. Arises from
[Founder Ruling 1](FOUNDER_RULING_1_COMMITMENT_AUTHORITY_2026-08-09.md) amendment 3. ⛔ Ruling text is
founder-authored and verbatim; ⛔ it may not be paraphrased by a later session.

Decision instrument this acts on: [`IDENTITY_TO_AUTHORITY_BRIDGE_2026-08-09.md`](IDENTITY_TO_AUTHORITY_BRIDGE_2026-08-09.md).

---

## 1. ⭐⭐⭐ The ruling (verbatim)

> A practitioner profile is a professional role of a governed member, not a separate constitutional
> person. Authentication may resolve through the practitioner profile, but authority over another
> member must be evaluated using the authenticated practitioner's governed `memberId` against the
> constituted relationship defined in Founder Ruling 1. `practitionerId` may govern
> practitioner-owned objects; it may not substitute for member identity when evaluating relational
> authority.

## 2. ⭐⭐⭐ Operational invariant (verbatim)

> Any active practitioner profile used for authenticated practice must resolve unambiguously to
> exactly one governed member identity. Missing or ambiguous resolution fails closed.

## 3. ⛔ Deliberately not decided (verbatim)

> Do not yet decide whether a member may hold multiple practitioner profiles. Do not add a UNIQUE
> constraint until that question is separately ruled.

⭐ **Why the invariant is narrower than a schema constraint.** The database today *happens to satisfy*
what it does not *enforce* — 18 profiles · 18 distinct member IDs · 0 nulls · 0 duplicate active
profiles, ⛔ with **no UNIQUE constraint**, a **nullable** `member_id`, and non-unique indexes
(measured against production, read-only, 2026-08-09). ⛔ A blanket `UNIQUE(practitioners.member_id)`
would silently decide whether one member may hold more than one practitioner profile — e.g. different
practices or professional contexts. ⭐ **The constitutional invariant binds resolution; the schema
question stays open for its own ruling.**

---

## 4. ⭐⭐⭐ The three questions that must never collapse into one identifier

> ⭐⭐⭐ **Profile** answers *"what professional role am I acting in?"*
> ⭐⭐⭐ **Member identity** answers *"who am I?"*
> ⭐⭐⭐ **Relationship** answers *"what authority exists between us?"*

⛔ Collapsing any two of these is the failure this ruling forecloses.

---

## 5. ⭐ The governing path

```text
authenticated identity
  ↓
identity.memberId
  ↓
relationship_spaces
  ↓
active + consent accepted
  ↓
authority for this act
```

⛔ **Forbidden:**

```text
practitionerId
  ↓
practitioner_clients
  ↓
"therefore I have authority over this member"
```

⭐ `practitionerId` **remains legitimate** for genuinely practitioner-owned things — practice
settings, professional profile, practitioner-authored resources, administrative objects. ⛔ It simply
**cannot substitute for the person** when constitutional authority over another member is evaluated.

---

## 6. 📌 What the system already satisfies

⭐⭐⭐ **`getCurrentPractitioner()` already satisfies the first half of this architecture.**
[`lib/auth/getCurrentPractitioner.ts:31`](../../../lib/auth/getCurrentPractitioner.ts) begins from
`getMemberIdFromRequest(request)`, resolves the profile *from* the member
(`WHERE p.member_id = $1 AND p.status = 'active'`), and returns **both** `memberId` and
`practitionerId`. So the constitutional ordering is **already correct at login**:

```text
request → member identity → practitioner profile → both IDs available
```

> ⭐⭐⭐ **The conformance gap lies in downstream routes that discard `memberId` and authorize through
> `practitioner_clients`.**

⚠️ Recorded because it changes the character of the remaining work: ⛔ this is **not** "replace
everything with a new constitution." ⭐ It is **bringing the remaining authority paths into coherence
with a principle parts of the system already embody** — five conforming paths (consent · join/accept ·
invite · the MAIA threshold read · member-own-data) show the ratified threshold is ⛔ not alien to
this codebase.

---

## 7. ⛔ Standing holds

| Item | State |
|---|---|
| **Ruling 2 — Custodial Authority** | ⛔ **held** until the conformance classification is complete |
| [`clients/[id]/patterns`](../../../app/api/studio/clients/%5Bid%5D/patterns/route.ts) | ⛔ open conformance finding — ⛔ **not repaired** |
| [`protocols`](../../../app/api/studio/protocols/route.ts) · [`protocols/[id]`](../../../app/api/studio/protocols/%5Bid%5D/route.ts) | ⛔ **unresolved** — ⛔ may not be classified as violating while *the authority object of practitioner-authored material* remains unsettled |
| [`pattern-ledger`](../../../app/api/studio/clients/%5Bid%5D/pattern-ledger/route.ts) | ⭐ **stays fail-closed.** ⛔ Reopening requires a separate conformance act |
| Runtime changes · staging · commits | ⛔ **none** |

📌 Classification: [`STUDIO_AUTHORITY_PATH_CLASSIFICATION_2026-08-09.md`](STUDIO_AUTHORITY_PATH_CLASSIFICATION_2026-08-09.md).
