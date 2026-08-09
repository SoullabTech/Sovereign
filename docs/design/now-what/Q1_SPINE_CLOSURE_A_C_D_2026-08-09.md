# Q1 Spine Closure — A · C · D

**Date:** 2026-08-09
**Status:** EVIDENCE + RATIFICATION INSTRUMENT. **No implementation. No code. No inferred linking.**
**Requested by:** founder, 2026-08-09 — *"Q1 now needs closure, not expansion… return to the remaining
Q1 gates in dependency order."*

⭐ **Canonical homes (not restated here):** identity/contact/commitment ruling **R-Q1a** →
`Q1_CLIENT_IDENTITY_DECISION_INSTRUMENT_2026-08-09.md` (which also now carries the granular-consent
semantics, §10). Enrollment ruling **R-Q1e** → `Q1E_ENROLLMENT_DECISION_INSTRUMENT_2026-08-09.md`.
This document holds only what closes **A, C, D**.

**Method:** static trace of trunk `ced4ab513`; read-only production queries against `maia_consciousness`
on minisforum. No writes. No rows manufactured. The five R-Q1e deferrals are untouched.

---

## Q1-A — PRACTITIONER IDENTITY (ratification instrument)

### The single question

> **Is a practitioner constitutionally a member identity carrying practitioner role/profile state,
> rather than a separate kind of constitutional person?**

### Decisive evidence

| Fact | Value | Source |
|---|---|---|
| `practitioners.member_id` populated | **18 / 18** | production, read-only, 2026-08-09 |
| `practitioner_clients.practitioner_id` resolves to `practitioners.id` | **13 / 13** | production |
| `practitioner_clients.practitioner_id` resolves to `members.id` | **0 / 13** | production |
| `relationship_spaces.steward_member_id` | → `members` **NOT NULL** | schema — the practitioner side is *already* a member, with no separate constitutional person |
| R-Q1a.7 | resolution chain `practitioner_clients.practitioner_id → practitioners.id → practitioners.member_id → members.id` | already ruled |

### Contradictory evidence found

**One, and it is a code defect rather than an ontology claim.** `app/api/now-what/home/route.ts`
joins `pc.practitioner_id` directly to `members.id` — satisfied by **0 of 13 rows**. This is the
already-recorded wrong-referent join. It contradicts the ruling only in the sense that live code
assumes a shape production does not have; it is evidence *for* Q1-A, not against it.

**No evidence was found for a practitioner as a separate constitutional person.** Nothing treats a
`practitioners` row as a party to a relationship; `relationship_spaces` uses member ids on both sides.

### What ratification would settle

That `practitioners` is **role/profile state attached to a member identity** — a projection, never a
party. Consequences already implied: Larry needs the ordinary path (member identity → practitioner
profile → commitments), and no exceptional identity path is created for any practitioner.

⇒ **Evidence is complete. This gate needs a founder ratification, not more investigation.**

---

## Q1-C — ADMINISTRATIVE CLIENT → MEMBER CLAIM PATH

> **Question as scoped by the founder:** not whether the 12 null `member_id` values should be
> backfilled (⛔ ruled: they must not), but *by what legitimate act can an administrative
> `practitioner_clients` record become linked to a member identity* — and **does such a path already
> exist?**

### ✅ Answer: a conforming path EXISTS in code — and it is unreachable

`lib/coachField/invitation.ts` — its own docstring states the constitutional position exactly:

> *"A relationship may exist before the person does. `practitioner_clients.member_id` is nullable
> ONLY for that window, and write-once after it (enforced in the database by
> `practitioner_client_link_guard`, not merely here)."*

| Property | Evidence |
|---|---|
| Write is **write-once** | `SET member_id = COALESCE(member_id, $2)` (`:130`) |
| Enforced in the **database**, not just app code | trigger `practitioner_client_link_guard` — **verified present in production** |
| Exported acts | `acceptInvitation(…)`, `createPendingRelationship(…)` |
| **Callers** | 🔴 **ZERO.** No import anywhere in `app/` or `lib/`. |

⇒ The conforming claim path is **designed, DB-enforced, and dead.**

### 🔴 The contradiction: the *reachable* claim path is the frozen one

Two routes named "claim" **do** run in production:

- `app/api/portal/[slug]/claim/route.ts`
- `app/api/portal/[slug]/invites/claim/route.ts`

Both set `portal_email`, `portal_password_hash`, `portal_claimed_at` on `practitioner_clients` —
and **neither sets `member_id`**. That is the **secondary portal-credential identity** that R-Q1a.5
explicitly **froze** from further architectural expansion.

> **So today: the path that creates a second, parallel auth identity is live; the path that would
> link a contact to a governed member identity is dead code.** A person can "claim" their portal
> account and still not exist as a member.

### The six distinctions, mapped to what exists

| Distinction | Exists? | Where |
|---|---|---|
| practitioner assertion | ✅ live | `POST /api/studio/clients`, gmail/phone import — creates contacts unilaterally |
| invitation | ✅ live (two unrelated kinds) | portal invite (credential) · practice-field invite (relationship — see Q1-D) |
| member authentication | ✅ live | ordinary member auth |
| member claim / acceptance | ⚠️ **two kinds, only one conforming** | portal claim (credential, live) ⊥ `acceptInvitation` (member link, **dead**) |
| identity matching | ⛔ prohibited (R-Q1a.6) | — no matcher found in code, correctly |
| relationship constitution | separate act entirely | `relationship_spaces` (Q1-D) |

⇒ **A legitimate claim path already exists and does not need inventing** — it needs a caller, and a
ruling on whether the frozen portal-credential path is retired, bounded, or left inert.
⛔ Nothing here authorizes wiring it.

---

## Q1-D — RELATIONSHIP CONSTITUTION TRACE (completed)

> **Not** *"does `relationship_spaces` exist"* — it does. **The question:** does the executable
> pathway actually produce the ruled constitutional state, and **why does production contain zero
> such rows?**

### The pathway is complete and wired end-to-end

```
PracticeFieldEditor.tsx:126
   └─ POST /api/practitioner/practice-field/invite        [auth: getMemberIdFromRequest + getAuthoredField]
        └─ INSERT relationship_spaces (steward_member_id = practitioner-as-member, client_email)
             └─ invite email (lib/practiceField/inviteEmail.ts)
                  └─ /join/[token]  →  POST /api/join/[token]/accept
                       └─ SET participant_member_id            ← identity joins the space
                            └─ /relationship/[spaceId]/threshold  →  POST …/consent
                                 └─ SET consent_status='accepted', consent_accepted_at, status='active'
                                      ⇒ CONSTITUTED
```

Every arrow was verified to have a real caller. The ruled predicate
(`participant_member_id IS NOT NULL AND status='active' AND consent_status='accepted'`) is exactly
what the last step produces. **No missing link, no orphan route.** It also independently reproduces
R-Q1a's shape: identity join and consent are **two separate acts**, matching granular-consent semantics.

### 🔴 Why production has zero rows — the pathway is not missing, it is REFUSING

`app/api/practitioner/practice-field/invite/route.ts:39`:

```ts
if (field.status === 'pending') {
  return 422 'Practice Field is PENDING. Complete the required sections before sending invitations.'
}
```

Production `practice_fields` — **both rows** (read-only, 2026-08-09):

| `field_slug` | `status` | `status_reason` |
|---|---|---|
| *(null slug)* | **pending** | — |
| `now-what-demo` | **pending** | *"contained 2026-08-03: active content was Soullab candidate material composed as Larry program corpus; preserved as evidence pending governance decision"* |

⇒ **No invitation can be sent from any production field today.** Zero commitments is not evidence of
an unbuilt pathway; it is the pathway **correctly refusing at its first gate** — one of the two
refusals being the 2026-08-03 containment itself. Combined with the separately-recorded fact that
**no Larry practitioner exists in production**, the emptiness is fully explained without any defect
in the constitution machinery.

### ⚠️ One adjacent finding, recorded without ruling

The gate is **readiness status** (`checkPracticeFieldReadiness` — computed from required sections
being complete). A prior ruling holds that *no composition gate may use readiness status as a proxy
for authority*. This is a **different** use — gating invitation, not composition — so that ruling is
not violated. But it raises a question this instrument does not answer:

> Is *form completeness* the right precondition for **constituting a relationship**, or is the
> invitation gate a place where an authority condition should sit instead?

Recorded as evidence only, per the instruction to record without ruling.

---

## CONTRADICTIONS ACROSS A / C / D

| # | Contradiction | Prevents a coherent spine? |
|---|---|---|
| 1 | **Reachable claim path is the frozen portal-credential model; the R-Q1a-conforming member-link path is dead code.** (Q1-C) | ⚠️ **Yes, if left as is** — the only live "claim" makes a parallel identity instead of linking a governed one. Needs a ruling, not a build. |
| 2 | `home/route.ts` joins `pc.practitioner_id → members.id` (0/13) while the FK targets `practitioners`. | No — a code defect, already recorded, consistent with Q1-A. |
| 3 | Relationship constitution requires a **non-pending practice field**; both production fields are pending, one by containment. | No — explains the zero rows; may warrant its own ruling (adjacent finding above). |

**Spine coherence verdict:** A, C and D **do** form one coherent `identity → relationship` spine at
the level of substrate and constitutive acts. The single structural threat is contradiction **#1** —
not a missing capability, but a live path that bypasses the governed one.

---

## WHAT IS REQUESTED

1. **Ratify Q1-A** — practitioner = member identity + role/profile state.
2. **Rule Q1-C** — the conforming claim path exists; decide its status and the disposition of the
   frozen portal-credential path (retire · bound · leave inert). ⛔ No wiring authorized by this document.
3. **Accept the Q1-D trace** — pathway complete; emptiness explained by the pending-field gate plus the
   containment, not by an unbuilt constitution.
4. Optionally rule the adjacent question: whether readiness is the right precondition for invitation.

**Preserved untouched:** the five R-Q1e deferrals (retention/history · member-initiated enrollment ·
end-vs-invalidate · surfaces · schema). Nothing in this document rules on them, and no evidence here
was used to settle them.

**Standing:** no implementation · no My Coaching fill · no enrollment work · no inferred member linking.
My Coaching remains correctly empty, and its emptiness is now fully accounted for.

---

# ADDENDUM — the two directed audits (2026-08-09, after Q1-A ratification + R-Q1c)

Founder direction: *"freeze/deprecate their identity authority first; then audit callers and retire
them safely if nothing legitimate remains"* and *"separately test that readiness dependency before
changing Q1-D."* Both audits are read-only. ⛔ No implementation.

## AUDIT 1 — Portal credentials: caller inventory and residual use

### The parallel domain is complete, not vestigial

| Surface | Role |
|---|---|
| `app/api/portal/[slug]/claim/route.ts` · `…/invites/claim/route.ts` | write credentials (`portal_email`, `portal_password_hash`, `portal_claimed_at`) |
| `app/api/portal/[slug]/client-auth/signin/route.ts` | **verifies `portal_password_hash` and issues a session** — a full second auth domain |
| `app/api/portal/[slug]/my-chart/route.ts` | *"Requires valid client portal session"* — serves birth-chart data, `practitioner_sessions`, and **`practitioner_resources`** |
| `app/api/portal/[slug]/invites/create/route.ts` · `app/api/studio/portal/route.ts` · `app/studio/portal/page.tsx` | practitioner-side issuance + management |
| `lib/portal/bookingTools.ts` · `lib/stellium/types.ts` | booking + typing |

⚠️ **Consequence to hold:** the portal is the **only** live surface that serves
`practitioner_resources` to a client-side reader. §I.3's "resources are unsurfaced" was true of the
member-facing rooms; the portal serves them **to a portal identity, outside member governance.**
Retiring the portal without a governed replacement would remove a live capability — this is exactly
the "residual legitimate operational use" the founder anticipated.

### Production usage — measured

| Measure | Value |
|---|---|
| contacts with `portal_claimed_at` | **1 of 13** |
| contacts with `portal_password_hash` | **1 of 13** |
| contacts with `member_id` | **1 of 13** |
| **overlap** | **the same single row has BOTH** · the other **12 have neither** |

🔴 **Exactly one person in production exists simultaneously as a governed member and as a parallel
portal identity** — the dual-identity condition R-Q1c.1 prohibits, instantiated exactly once. Twelve
contacts have no identity of either kind.

⇒ **Disposition is cheap and can be done in the ruled order.** Freezing identity authority (done,
R-Q1c.3) affects one live credential. Retirement is blocked only by the resources/booking capability
the portal uniquely serves, not by user volume.

## AUDIT 2 — Readiness as a prerequisite for relationship formation

### What "readiness" actually tests

`checkPracticeFieldReadiness()` — the whole of it:

```
welcome_message · how_we_work_together · how_maia_supports · professional_practice
   → is_live = all four non-empty
```

**Four text fields being non-empty.** No consent condition, no safety condition, no authority condition.

### Where it gates

`app/api/practitioner/practice-field/invite/route.ts:39` is the **only functional consumer of
`field.status` in the codebase.** (Other `status === 'pending'` hits are unrelated objects —
invitations, helper-fund applications, agreements, agent tasks.)

⇒ **The single thing practice-field readiness gates in the entire system is the constitution of a
relationship.**

### The founder's distinction, tested against the four fields

> *"Are we in a relationship?" is not necessarily the same question as "Is my practitioner field
> fully ready to publish?"*

The evidence **supports the distinction, and refines it** — the four fields are not homogeneous:

| Field | Presentation polish | Plausibly required for *informed* consent |
|---|---|---|
| `welcome_message` | ✅ | — |
| `how_maia_supports` | ✅ | — |
| `how_we_work_together` | — | ⚠️ arguably yes — what the person is agreeing to |
| `professional_practice` | — | ⚠️ arguably yes — credentials/scope disclosure |

⇒ The gate **conflates two different things**: publication polish, and the disclosures a person needs
in order to consent. A narrower gate keyed on *disclosure sufficient for informed consent* would let
a practitioner constitute a relationship before finishing their presentation material, without
letting anyone consent to an undisclosed practice. **Recorded as evidence; not ruled.**

### 🔴 THE COUPLING — do not relax this gate without separating containment first

`practice_fields.status` carries **two unrelated meanings on one value**:

| Row | `status` | Why |
|---|---|---|
| *(null slug)* | `pending` | incomplete |
| `now-what-demo` | `pending` | **contained** — *"contained 2026-08-03: active content was Soullab candidate material composed as Larry program corpus; preserved as evidence pending governance decision"* |

**Incompleteness and containment are indistinguishable at the gate.** A change that relaxes the
readiness precondition for invitations would, by the same edit, **release a contained field** — the
containment has no independent expression to fall back on.

⇒ **Containment must acquire its own representation before the readiness gate is touched.** This is
the general defect in its concrete form: *readiness is modeled; containment is not.*

## WHAT THE ADDENDUM ASKS

1. **Note** that portal retirement is capability-blocked (resources/booking), not volume-blocked, and
   that exactly one dual identity exists.
2. **Rule** whether the invitation precondition should be narrowed from *readiness* to *disclosure
   sufficient for informed consent* — ⛔ **not before** (3).
3. **Rule** that containment gets its own representation, independent of `status='pending'`, as a
   prerequisite to any change in (2).

⛔ Still no implementation, no My Coaching fill, no enrollment work, no inferred member linking.
The five R-Q1e deferrals remain untouched.

---

# SEQUENCE RULED + CONTAINMENT STATE VERIFIED (founder, 2026-08-09)

## The ruled order

| # | Step | Status |
|---|---|---|
| **1** | **Containment first** — give *"governance says this must not proceed"* its own durable state, separate from *"this field is incomplete."* | code exists, ⛔ not deployed — see below |
| **2** | **Then narrow invitation eligibility** — decide which Practice Field disclosures are actually necessary for **informed relationship consent**, rather than requiring every presentation field to be polished. | ⛔ blocked on (1) deployed + verified |
| **3** | **Keep Q1-D unchanged** — invitation → acceptance → consent → active relationship is already structurally correct. | ✅ no change authorized |
| **4** | **Do not retire the portal yet** — first move its legitimate capabilities, **especially resources**, into the governed member relationship experience; *then* retire the parallel credential identity deliberately. | ⛔ retirement not authorized |

**Why the order is structural, not procedural** (founder): *"A seemingly simple change like 'let
practitioners invite before their profile is fully polished' would currently also risk releasing a
field that governance intentionally contained. The UI problem looked local; the real issue was two
meanings collapsed into one status field."*

## Containment — verified state (measured, not assumed)

The founder noted containment architecture had been designed and implemented in later work. **Verified,
with the deployment qualifier that matters:**

| Fact | Value |
|---|---|
| Commit | `60eaa4aaa` *"feat(practice-field): governance containment — restraint as architectural state"* (2026-08-09 19:39) |
| Branch | `feature/governance-containment` (local + origin) |
| **On trunk** | 🔴 **NO** |
| **In production `b1399f693`** | 🔴 **NO** |
| Shape | `containment_status` (`none`\|`contained`) · `containment_reason` · `contained_at` / `contained_by` · `containment_reference` · `released_at` / `released_by` + index + CHECKs |
| Surface | `app/api/practitioner/practice-field/[id]/containment/route.ts` |
| Tests | `lib/practiceField/__tests__/governanceContainment.test.ts` (231 lines) |
| Invite gate | **conjunction added** — *"the gate is a conjunction: ready AND not contained"*; contained fields refuse with **409** and a distinct message, incomplete fields keep their **422**. Its own comment states the principle: *"Rendering them identically is how a hold becomes invisible."* |

⇒ **The prerequisite is met in code and unmet in production.** Both `practice_fields` rows are still
held by `status='pending'` alone; `now-what-demo`'s containment still lives only in a `status_reason`
string. **This audit's coupling finding stands for production and is resolved on the branch.**

⚠️ **Therefore step (2) remains blocked until `60eaa4aaa` is on trunk, deployed, and verified —
specifically that `now-what-demo` carries `containment_status='contained'` in production, not merely
`status='pending'`.** Until that migration runs, relaxing the readiness gate would release the held
field. *Designed ≠ deployed; the whole point of separating the two meanings is lost if the separation
exists only on a branch.*

⛔ Unchanged: no implementation authorized here, no My Coaching fill, no enrollment work, no inferred
member linking, no portal retirement. The five R-Q1e deferrals remain untouched.
