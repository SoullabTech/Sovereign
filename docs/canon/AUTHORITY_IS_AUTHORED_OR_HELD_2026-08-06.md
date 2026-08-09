# Authority Is Authored or Held — candidate constitutional principle

**Status: PROPOSED — candidate for the Sovereignty Invariants.** ⛔ Not ratified. Incorporation
requires a distinct founder act, on the same pattern as the North Star Hierarchy in
`PROJECT_ORIENTATION.md`. Until then this is a **referenceable statement of a principle already
operating**, not a new rule being introduced.

Extracted at founder suggestion (2026-08-06) from
[`PRACTITIONER_PUBLISHING_PERMISSIONS_2026-08-06.md`](../design/practitioner-portal/PRACTITIONER_PUBLISHING_PERMISSIONS_2026-08-06.md)
§0, where it was doing work larger than publishing.

---

## The principle

> ⭐⭐⭐ **Authority to act comes from what you authored and what relationship you personally hold —
> never from what list you appear on.**

## The four collapses it forbids

| Collapse | Reads as | Is actually |
|---|---|---|
| **membership → authority** | *I am on this team, so I may act here* | a scope |
| **aggregation → authority** | *many instances, therefore a right* | a count |
| **role → authority** | *my role is named X, so I may do X* | a label |
| **visibility → authority** | *I can see it, so I may act on it* | a view |

Each is the same error in a different costume: **authority inferred from classification rather than
earned by an authored act or a held relationship.**

## The five legitimate sources

*Founder-specified 2026-08-06. The fifth was added to close the operational-access tension before
ratification: ⭐ an exception becomes a hole, so custodial access is defined as its own bounded
source rather than as a carve-out from the other four.*

1. **Authorship** — authority over what one authored. Immutable, non-transferable, and the reason
   withdrawal and revision are authorship acts rather than administrative ones.
2. **Held relationship** — authority granted by a specific consented commitment that *you
   personally hold*. ⛔ Not a commitment someone adjacent to you holds.
3. **Declaration** — authority over one's own stated experience or decision. ⛔ Cannot be supplied
   by another party on your behalf.
4. **Ratification** — constitutional authority created by the proper governing act.
5. **Custodial mandate** — see below.

> ⭐ **Custodial authority arises from an explicitly imposed duty to protect the system or persons;
> it grants only the minimum access required to perform that duty, and never confers authorship,
> relational standing, or interpretive authority.**

Custodial mandate covers incident response · security investigation · legal preservation or erasure
· infrastructure repair · narrowly governed safety intervention.

⛔ **Custodial access may inspect or act upon infrastructure under a named mandate. It may never
become** practitioner authority · relationship membership · permission to interpret member material
· permission to reuse content · a durable relational fact about the people involved.

⭐ The structural difference: the other four sources make you a **party**; a custodial mandate makes
you a **custodian**. A custodian acts *on* the system, never *within* the relationship — and leaves
no relational trace, only a custodial one.

Everything outside these five is a filter, a scope, or a view. Filters, scopes, and views are
useful; ⛔ none of them grants.

## Where this already governs (this is a description, not an expansion)

- **`feedback_list_filter_is_not_authorization_boundary`** — the standing ruling this generalizes.
  `/api/caseload`'s `isPractitioner(memberId)` is a list filter, not a per-client boundary.
- **N7** (binding via P2) — aggregation cannot manufacture a rights grant unavailable at the
  individual level. *That is `aggregation → authority`, named.*
- **N8** (binding via P2) — popularity, frequency, and consensus may not harden into normative
  authority. *Aggregation again, in the corpus.*
- **N9** — readiness or completion status is not authority and may never proxy for it.
  *That is `visibility → authority`.*
- **N10** — revision proves change, never review, adoption, permission, or ratification.
- **Practitioner Inference Containment (2026-08-06)** — *"visibility, acknowledgment, confidence,
  recurrence, and professional role never create authorship or permission."* Four of the collapses,
  in one sentence, already ruled.
- **`field_events`** — *"the person authors their time"*; permission is not obligation.
- **`field_program_positions.stated_by`** — a practitioner-seeded position is not a member
  declaration until the member's own gesture lands.

⭐ The principle is not new. It has been discovered independently in at least six places. Naming it
once lets the seventh domain reference it instead of rediscovering it.

## The design test

For any surface that lets someone act on someone else's object or field, ask:

1. **What did this person author?**
2. **What relationship do they personally hold, and did the other party consent?**

If the answer to both is *nothing*, and the surface still permits the act, the authority is being
manufactured from a classification — and the surface is wrong regardless of how reasonable the
permission feels.

## What this principle does not settle

⛔ It does not say who *should* hold a relationship, nor how relationships form. ⛔ It does not
forbid delegation — it requires that delegation be an **authored, revocable act** rather than an
inference from role. ⛔ It does not rule supervision, organizational rights, or any open question in
the practitioner lane.

## Tension resolved before ratification

⚠️→✅ **Operational and safety access** was the one gap in the first draft: platform administration,
incident response, and legal obligation require access no one authored and no one holds a
relationship for. **Resolved by the founder 2026-08-06** as source 5 rather than as an exception —
custodial mandate is *bounded and named*, where an exception would have been open-ended.

**Remaining before ratification:** ⛔ **"Admin" cannot be the authority source.** A custodial mandate
must be an identifiable instrument carrying (founder, 2026-08-06):

| Field | |
|---|---|
| **issuer** | who imposed the duty |
| **holder** | who carries it |
| **purpose** | the duty being discharged |
| **permitted actions** | enumerated, ⛔ not "administrative access" |
| **scope** | which systems, which subjects |
| **duration or revocation condition** | ⛔ never open-ended |
| **audit requirements** | what the holder must record |

⛔ Without that instrument, custodial authority becomes the generic escape hatch this principle
exists to prevent. The instrument is ⛔ not designed here.
