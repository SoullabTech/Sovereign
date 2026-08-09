# Founder Ruling — Dual Authority for Practitioner-Authored Material

**Status: ⭐⭐⭐ RATIFIED — 2026-08-09.** Founder act. ⛔ Ruling text is founder-authored; ⛔ it may not
be paraphrased by a later session. Settles unresolved question 1 of the
[authority propagation trace](STUDIO_AUTHORITY_PROPAGATION_TRACE_2026-08-09.md) §12.

---

## 1. ⭐⭐⭐ The distinction

> ⭐⭐⭐ **Ownership answers *"whose record is this?"*
> Authority answers *"what entitles me to act in relation to the person this record concerns?"***

⭐ `practitioner_id = session-derived practitioner` is **strong protection** against one practitioner
reading or altering another's objects. ⛔ It **cannot, by itself, authorize naming any arbitrary
person inside a practitioner-owned object.**

## 2. ⭐⭐⭐ The ruling (verbatim)

> For **practitioner-authored material about a person**, authority is **dual**:
>
> **The practitioner owns the authored artifact.
> The relationship/participation context governs whom that artifact may legitimately concern.**
>
> So neither axis substitutes for the other.

⭐ **The conceptual error this names:** a practitioner observation can legitimately be *my
observation* ⛔ without making the person being observed *mine*. ⭐ That is precisely the error in the
five nonconformant routes.

## 3. ⭐⭐⭐ The invariant (verbatim)

> **Practitioner ownership authorizes control of the practitioner-authored object; it does not
> authorize the practitioner to establish arbitrary person-reference. Any persisted reference to
> another person must derive from a valid governed relationship, participation, or other explicitly
> recognized authority substrate.**

⭐⭐ **Deliberately broader than `relationship_spaces`.**

---

## 4. ⛔⛔ What this ruling does NOT require

> ⛔⛔ **`relationship_spaces` is NOT to be retrofitted as a universal authorization gate across
> Studio.** ⭐ Founder position, 2026-08-09: **B constrained by C**.

⭐ AIN has **several legitimate authority substrates**. The architecture must eventually answer:

> ⭐⭐⭐ **What authority permits this particular act concerning this particular person?**
> ⛔ **NOT:** *does a `relationship_spaces` row exist?*

⛔ **Do not collapse** encounter participation · Co-Lab membership · practitioner-client
administration · relationship constitution into one generic "relationship."

⚠️ **The overcorrection this forecloses:** after discovering that many supposedly practitioner-owned
routes reach members, the tempting fix is a universal gate. ⛔ That would be **as ontologically wrong
as ignoring the substrate**.

---

## 5. ⭐⭐⭐ The Authority Object model

⭐ Not code yet. ⭐ First make the existing forms **legible**. For every action concerning another
person, identify four things:

> ⭐⭐⭐ **Actor → Authority substrate → Subject → Act**

| Example |
|---|
| `practitioner → practitioner-client relationship → member → write observation` |
| `facilitator → encounter participation → participant → record threshold` |
| `member → team membership → collaborator → send channel message` |

⭐ Authorization then becomes **a predicate over that relationship**, ⛔ rather than an accident of
whichever table owns the resulting row.

### 5.1 ⭐⭐ The act matters

⭐ Authority is ⛔ not `user → role → permission`. It is:

```text
member → relationship/participation → object → permitted act
```

⭐ Someone may be authorized to **witness an encounter** without being authorized to access someone's
**longitudinal memory**; authorized to **receive a protocol** without being a **client**; authorized
to **participate in a Co-Lab** without becoming part of a practitioner's **caseload**.

> ⭐⭐⭐ **This is where AIN can become substantially better than conventional RBAC.**

---

## 6. ⭐⭐⭐ The five axes that must stay separate

> ⭐⭐⭐ **Identity** tells AIN **who is acting**.
> ⭐⭐⭐ **Ownership** tells AIN **whose artifact it is**.
> ⭐⭐⭐ **Relationship or participation** tells AIN **why this actor may act concerning another person**.
> ⭐⭐⭐ **Consent** constrains **what that relationship permits**.
> ⭐⭐⭐ **Confidentiality** governs **how resulting information may be handled**.

⛔ **These are five different things.** ⭐ Keeping them separate may be one of the most important
consequences of this whole rehabilitation effort.

📌 **Consequence for the PHI accessor.** [`lib/security/phiAccessors/*`](../../../lib/security/phiAccessors/encounterTranscripts.ts)
answers *how protected information may be handled*. ⛔ It does **not** establish the relational
authority to create or read the underlying claim. ⭐ **Keep that separation.**

---

## 7. ⛔ Standing holds after this ruling

| Item | State |
|---|---|
| **Ruling 2 — Custodial Authority** | ⛔ still **held** |
| The five caller-supplied-person-reference routes | ⛔ **confirmed authority defects** — ⛔ but **not repaired individually yet**: five slightly different patches would create a **seventh authority idiom** |
| The correct control for those five | ⚠️ `assert-client-owned` **may** be the immediate correct control for legacy practitioner-client paths — ⛔ **must be demonstrated from their semantics, not assumed** |
| The ten `unresolved-rule` routes | ⛔ **remain unresolved** — ⛔ especially `encounters/[id]/threshold`. ⛔ Do **not** force them through client ownership merely because it is available |
| `pattern-ledger` | ⭐ **stays fail-closed** |
| Repairs · migrations · staging · commits | ⛔ **none** |

⭐ *"This person is my client"* and *"this person is legitimately participating in this encounter"* are
⛔ **different relationships with different scopes of authority.**

📌 Evidence produced under this ruling: [`AUTHORITY_SUBSTRATE_MAP_2026-08-09.md`](AUTHORITY_SUBSTRATE_MAP_2026-08-09.md).
