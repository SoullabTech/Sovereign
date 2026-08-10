# Unit C — Relationship Ceremony: Gate Report and Prerequisite

**Status: EVIDENCE — 2026-08-09.** ⛔ No repair. ⛔ No migration. ⛔ No seeding. ⛔ No release.
⛔ **Unit C did not begin.** It is blocked at two gates, both of which require a founder act.

**Trunk / production:** `d2db55d7b` · **Evidence:** read-only production measurement (aggregates,
lengths, and system-generated reasons only — ⛔ no authored content read)
**Authority:** [`RELATIONSHIP_CONSTITUTION_TRACE_2026-08-09.md`](RELATIONSHIP_CONSTITUTION_TRACE_2026-08-09.md) ·
[`Q1_CLIENT_IDENTITY_DECISION_INSTRUMENT_2026-08-09.md`](Q1_CLIENT_IDENTITY_DECISION_INSTRUMENT_2026-08-09.md) ·
[`FOUNDER_RULING_IDENTITY_TO_AUTHORITY_BRIDGE_2026-08-09.md`](../practitioner-portal/FOUNDER_RULING_IDENTITY_TO_AUTHORITY_BRIDGE_2026-08-09.md)

---

## GATE 1 — ⛔⛔ `§8.4` is a phantom referent

Unit C was authorized *"only through the §8.4 gate."* ⛔ **No document defines a section 8.4.**

| Checked | Result |
|---|---|
| `RELATIONSHIP_CONSTITUTION_TRACE_2026-08-09.md` | §8 = *REGRESSION INVARIANT*, then **§9** directly. ⛔ No §8.1–8.4 |
| `Q1_CLIENT_IDENTITY_DECISION_INSTRUMENT_2026-08-09.md` | §8 = *THE DECISION REQUESTED*. ⛔ No subsections |
| Every other `*2026-08-09*.md` in `now-what/` + `practitioner-portal/` | ⛔ **none** defines a heading `8.4` |

⭐ The string `§8.4` appears in exactly **two** live places, and both are the *citation*, never the
*referent*: the trace's own authorization header (L4) and the rehabilitation map's Layer 0 row.
⭐ A third hit — `PRACTITIONER_PUBLISHING_RENDERING_CONFORMANCE_2026-08-06.md` — points at
`EVENT_SPECIFICATION §8.4`, an **unrelated document** in a different lane.

⛔⛔ **The gate is not resolvable by reading.** Two candidates exist and they authorize different acts:

| Candidate | What it would authorize |
|---|---|
| **Trace §8** — the RI-1 regression invariant + its 6 executable test shapes | ⭐ *Encode RI-1 as tests **before** any repair.* An **engineering** act, performable now |
| **Trace §9 item 2 / §7A** — *"the next act is adoption, not engineering: complete one Practice Field to `live` and walk the ceremony once"* | ⭐ An **adoption** act, requiring a practitioner and a live field — see Gate 2 |

⛔ **This session did not guess.** ⭐ Resolving a constitutional referent by inference is the exact
failure class this corpus exists to prevent — cf. the *Lost Capability Recovery Audit* phantom
recorded in [`MEMORY_ECOLOGY_AND_COMPLETENESS_2026-08-09.md`](../../canon/MEMORY_ECOLOGY_AND_COMPLETENESS_2026-08-09.md).

> ⭐ **Founder act required:** name the referent — trace **§8** (encode RI-1 first) or trace
> **§9.2/§7A** (walk the ceremony first) — or state a third. ⛔ Until then Unit C cannot begin.

---

## GATE 2 — ⛔⛔ The ceremony has no legitimate runway

⭐ Even with Gate 1 resolved toward adoption, the act is **not performable**. Measured in production:

### 2.1 Larry is not a practitioner in the substrate

| Member | id | Practitioner row |
|---|---|---|
| `Larry` (real, onboarded 2026-07-11) | `28a66591` | ⛔ **none** |
| `Larry Closs (Demo)` | `60cc538d` | ⛔ **none** |

⭐ `practitioners` holds **18 rows, all 18 linked** to a governed member — ⛔ **none of them Larry.**
⭐ Per the Identity-to-Authority Bridge ruling, a practitioner profile is *the professional role of a
governed member*. ⛔ That role does not presently exist for Larry.

### 2.2 Larry's only Practice Field is the contained one

| Field | Holder | Status | Containment | Readiness |
|---|---|---|---|---|
| `8be895ad` | Larry Closs (Demo) | pending | ⛔ **`governance_hold`** | all 4 sections populated |
| `87c28398` | **Michael (Demo)** | pending | none | ⛔ `welcome_message` **length 0** → fails |

⛔⛔ **The only Practice Field that is materially complete is the one under governance containment** —
contained 2026-08-03, *"active content was Soullab candidate material composed as Larry program
corpus; preserved as evidence pending governance."*

⛔ It **must not** be used. Unit B closed on exactly this: the hold is releasable only by a separate
founder act under **R-GC2a**, and the directive states plainly — ⛔ *do not release or use the
contained legacy field for testing.* ⭐ Unit B's guarantee would be worth nothing if Unit C spent it.

⭐ The one releasable field belongs to a **different demo persona**, is one section short of
readiness, and its holder also has **no practitioner row**.

### 2.3 Gate 0 stands, and is now sharper than the trace recorded it

```
Larry has no practitioner role
  → and his only complete Practice Field is under governance_hold
  → and the sole un-contained field belongs to another persona and fails readiness
  → no field can legitimately reach 'live'
  → POST /invite returns 422 (or 409 if contained) before any INSERT
  → 0 relationship_spaces   ← measured: 0 total · 0 with participant · 0 constituted
  → My Coaching is empty ✅ correctly
```

⭐ **Production counts (2026-08-09):** `relationship_spaces` **0** · constituted commitments **0** ·
`practitioner_clients` **13** (⛔ only **1** carries `member_id`) · `members` **87**.

---

## 3. ⭐ The legitimate prerequisite — stated, not performed

⛔ **None of this may be manufactured.** Each is a real act by the party who holds the authority:

| # | Act | Who | ⛔ Why not CC |
|---|---|---|---|
| 1 | Establish Larry's **practitioner role** against governed member `28a66591` | founder / Larry | ⛔ Creating an authority record is a constitutional act, not a fixture |
| 2 | Larry authors a **new, un-contained Practice Field** with all four sections | Larry | ⛔ It is his authored material; ⛔ seeding it would fabricate practitioner content |
| 3 | Readiness recomputes → `status='live'` | system, from (2) | ⭐ Automatic and correct once (2) is real |
| 4 | Larry invites a **real member** who accepts and consents | Larry + that member | ⛔ *A contact can exist unilaterally. A relationship cannot.* ⛔ Consent may never be inferred |

⛔⛔ **Explicitly refused this session:** creating a `practitioners` row · seeding or completing a
Practice Field · releasing the `governance_hold` · backfilling the 12 null
`practitioner_clients.member_id` rows · inferring consent from email or contact matching · inserting
into `relationship_spaces`. ⭐ Each would have produced a green walk over a false ontology.

---

## 4. ⚠️ Correction owed to the trace

⭐ The trace's **Addendum §A.3** — *"THE CONTAINMENT IS UNDEFENDED — the significant finding"* — is
**superseded as of `d2db55d7b`**. Unit B defended it: the hold is now typed `governance_hold`,
holder-release is refused **403**, readiness recompute cannot touch containment columns, and the DB
CHECK `practice_fields_containment_has_provenance` makes an unprovenanced containment impossible.
⛔ A future session reading §A.3 as current would act on a closed defect. ⭐ See
[`GOVERNANCE_CONTAINMENT_CLOSURE_2026-08-09.md`](../../ops/GOVERNANCE_CONTAINMENT_CLOSURE_2026-08-09.md).

---

## 5. Disposition

**Unit C — HOLD.** ⛔ Blocked on Gate 1 (name the referent) and Gate 2 (the prerequisite chain).

⭐ **Available now without either gate**, if the founder wants motion: encode **RI-1** as executable
tests against the current readers — the trace §8 test shapes, which are written to be built *before*
the repair. ⛔ That is an engineering act on invariants, ⛔ not an adoption act, and ⛔ it constitutes
no relationship. It would make the *next* repair verifiable rather than hopeful.

⛔ Scope held: no expansion into Unit A, Dual Authority, the 7 open §E questions, Ruling 2, or the
23 uncommitted `requireSelfScopedMember` call-sites.
