# Founder Ruling 1 — Commitment Authority

**Status: ⭐⭐⭐ RATIFIED — 2026-08-09.** Founder act. ⛔ This is not a recommendation, a summary, or a
candidate. It is constitutional law for the practitioner publishing lane and for any domain that
represents a shared developmental commitment.

- **Ruling text below is founder-authored and verbatim.** ⛔ It may not be paraphrased, compressed, or
  "clarified" by a later session. Amendment is a founder act.
- **Candidate superseded:** [`PRACTITIONER_PUBLISHING_CONSTITUTIONAL_RULINGS_2026-08-06.md`](PRACTITIONER_PUBLISHING_CONSTITUTIONAL_RULINGS_2026-08-06.md)
  §"Ruling 1" was the *recommendation*. This document is the *act*. Where they differ, this governs.
- **Evidence scope of the findings the ruling rests on:** deployed commit **`b1399f693`**, database
  `maia_consciousness` on `minisforum` (primary), measured **2026-08-06 ~19:11 UTC**, read-only.

---

## 1. ⭐⭐⭐ The decisive principle

> ⭐⭐⭐ **A practitioner cannot become the source of their own authority over another person by
> creating a record about that person.**

⭐ The human relationship may **pre-exist the system**. ⭐⭐ The system's **governed commitment** begins
when **both parties participate in constituting it**. ⛔ That the roster contains real human
relationships does not make a unilateral database row the constitutional act by which shared
authority comes into existence.

---

## 2. ⭐⭐⭐ The ruling (verbatim founder text)

> **Founder Ruling 1 — Commitment Authority**
> **RATIFIED — 2026-08-09**
>
> The shared developmental commitment is a bilaterally constituted relationship between two governed
> member identities.
>
> A member may hold a practitioner profile or other professional role, but such a profile is not a
> separate constitutional person and does not itself confer authority over another member.
>
> A commitment exists only when:
>
> * both participating members are identified;
> * the relationship is in an active lifecycle state; and
> * consent has been explicitly accepted as a state distinct from relationship lifecycle.
>
> A record authored or created by one party alone does not constitute the shared commitment and
> confers no authority over the other party. No unilateral contact, roster, invitation, or
> practitioner-authored record may be converted into a bilateral commitment by migration, inference,
> or administrative population in place of the absent member act.
>
> `practitioner_clients` may remain a legitimate contact and operational record. Its existence,
> population, or association with a member does not establish the constitutional commitment and does
> not confer relational authority.
>
> The commitment authorizes only those acts subsequently governed as occurring within the shared
> developmental relationship. It does not confer ownership of, or generalized authority over, either
> member, their identity, history, data, memories, or activity outside the constituted relationship.
>
> The present schema expression of this constitutional object is `relationship_spaces` where both
> parties are identified, `status = 'active'`, and `consent_status = 'accepted'`. This identifies the
> presently conforming implementation of the ruling; the constitutional principle is the bilaterally
> constituted relationship, not the table name itself.

### 2.1 Consequences (verbatim founder text)

> The following are prohibited:
>
> * deriving authority over a member from `practitioner_clients` or another unilaterally authored
>   record;
> * treating an invitation as a constituted commitment;
> * treating a relationship lacking an identified participating member as a commitment;
> * weakening the independent consent requirement in order to accommodate an existing implementation;
> * backfilling bilateral commitments from unilateral contact records where the member's constituting
>   act did not occur.

### 2.2 ⛔ What this ruling does not yet decide (verbatim founder text)

> * whether multiple simultaneous commitments may exist between the same two members;
> * the commitment's formation event stream;
> * cohort constitution;
> * Announcement mapping;
> * custodial authority within the commitment;
> * attestation governance; or
> * the event home for acts within the commitment.
>
> Those remain for their appropriate rulings.

---

## 3. ⭐⭐⭐ The decision grammar

> **Authority → Holder → Object → Boundary → Prohibition**

| Term | Ruling 1 |
|---|---|
| **Authority** | authority to act within a governed shared developmental commitment |
| **Holder** | subsequently derived from the parties and roles governed within that commitment |
| **Object** | the bilaterally constituted relationship |
| **Boundary** | the commitment itself; ⛔ not the person as property or generalized object of authority |
| **Prohibition** | ⛔ no unilateral record may manufacture relational authority |

📌 **The Boundary term is a founder addition to the grammar (2026-08-09):** *what remains outside the
authority.* ⭐ Its purpose is structural — **it prevents a legitimate authority grant from silently
expanding into general ownership.**

---

## 4. ⭐ The constituting path

**Governing:**

```text
person/member identity
        │
        ├── may hold practitioner profile
        │
        └── may enter relationship with another member
                         │
                         ▼
                relationship_space
             both parties identified
                     active
              consent accepted
                         │
                         ▼
                 COMMITMENT
```

⛔ **Forbidden:**

```text
practitioner profile
        +
practitioner_clients row
        =
authority over client
```

---

## 5. ⭐⭐ Amendments the founder made to the candidate recommendation

⭐ The candidate recommended the object and the threshold. **Three amendments and one wording
correction were founder acts**, ⛔ not present in the recommendation:

| # | Amendment | Why |
|---|---|---|
| **1** | **The boundary clause is included now, not deferred** | ⛔ It is not decorative. Defining the commitment without defining what it does **not** reach leaves open precisely the **authority creep** this constitution exists to prevent |
| **2** | **`practitioner_clients` is explicitly preserved** as a contact/operational record — **D, not merely B** | ⛔ No reason to delegitimize the useful CRM function. The load-bearing prohibition is that **population is not consent** and confers no relational authority |
| **3** | **The identity question is settled here, ⛔ not carried into Ruling 2** | Constitutional authority attaches to **governed member identities**. `practitioners` may remain a member's professional/practice profile, ⛔ but must not become a separate sovereignty-bearing person-space — otherwise we recreate **two different kinds of person** with unclear authority between them |

### 5.1 ⭐⭐⭐ Wording correction — *population* vs. *unilateral population*

⛔ The candidate's formulation read: *"…and never becomes one by population."*

> ⭐⭐⭐ **Population itself is not the problem; unilateral population is.** ⭐ A legitimate constituting
> process **will eventually populate a row**. ⛔ The canon must not accidentally say that database
> creation can never represent constitution.

📌 The ratified text therefore prohibits **conversion of a unilateral record into a bilateral
commitment by migration, inference, or administrative population *in place of the absent member
act*** — ⭐ which forbids the manufacture of consent ⛔ without forbidding legitimate writes.

---

## 6. ⭐⭐ Definitional primacy over the substrate

> ⭐⭐⭐ **`relationship_spaces` is the current implementation referent, ⛔ not the constitution itself.**

⭐ Stated so that a future schema redesign would ⛔ **not appear to require changing constitutional law
merely because the table was renamed or replaced.** The definition governs; the table follows.
⛔ Never the reverse.

---

## 7. ⭐ Standing obligation created by this ruling

⭐ Ratification creates a **conformance obligation** that has ⛔ **not yet been measured**. The founder
directive, 2026-08-09:

> ⭐⭐⭐ **Record the founder act, then perform the standing conformance audit this ruling creates —
> ⛔ without repairing anything.**

⭐ The audit separates two questions that must not be merged:

| Question | Settled by |
|---|---|
| **What is now law?** | ⭐ the founder — done, above |
| **Where does the running system violate it?** | ⭐ **evidence** — the audit |

📌 Audit findings: [`RULING_1_CONFORMANCE_AUDIT_2026-08-09.md`](RULING_1_CONFORMANCE_AUDIT_2026-08-09.md).

⛔ **Ruling 2 (Custodial Authority) does not begin until the audit is complete** — so that it reasons
from an actual constitutional commitment rather than an unresolved proxy.
