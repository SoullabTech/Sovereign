# Practitioner Publishing — Permissions (candidate)

**Status: CANDIDATE — design only.** ⛔ No schema, no migration, no code, no route. Session 2 of the
founder-set sequence. Companion to
[`PRACTITIONER_PUBLISHING_ONTOLOGY_2026-08-06.md`](PRACTITIONER_PUBLISHING_ONTOLOGY_2026-08-06.md),
which ⛔ remains implementation-blocked until Permissions **and** Events are complete.

Permissions comes before Events because it determines **which events are valid**. An event log that
records unauthorized acts is not a record; it is a laundering mechanism.

---

## 0. The governing rule

> ⭐ **Authority to act comes from what you authored and what relationship you personally hold —
> never from what list you appear on.**

This restates the standing ruling `feedback_list_filter_is_not_authorization_boundary` in publishing
terms. Nearly every hard case below resolves by applying it.

---

## 1. What already exists — and three hazards

**[O] Observed 2026-08-06.**

| Substrate | Where | Relevance |
|---|---|---|
| **`relationship_spaces`** — `steward_member_id`, `participant_member_id`, `status ∈ invited\|active\|paused\|archived`, `consent_status ∈ pending\|accepted\|declined\|withdrawn`, `consent_items JSONB`, `team_id`, `practice_display_name` | `20260701000001` | ⭐ **The authority container for Placement.** A directed act needs a held relationship with accepted consent; this is where that lives. |
| `studio_teams` / `studio_team_members` (`role ∈ owner\|admin\|member\|viewer`) | `20260202100001` | Co-Lab. A **scope**, not an authority. |
| `field_program_positions.stated_by ∈ member_confirmed \| member_stated \| practitioner_seeded` + `member_confirmed_at` | `20260712000001` | ⭐ The **attribution primitive** — already the right shape for hard case 7. |
| `library_sources.review_status` + `ratified_by` | `20260714000001` | Object-side gate: only the practitioner's own gesture ratifies. |
| Member visibility withdrawal ledger | `20260730000002` (Lane V) | The member-side revocation authority. |
| Co-Lab boundary gate — 31 checks, prod-required before any tester wave | `scripts/verify-colab-boundaries.ts` | Where new publishing surfaces must acquire checks. |

**Three hazards found:**

1. ⚠️ **"Role" means eight different things.** At least eight unrelated role enums exist across
   migrations — `(participant, steward, keeper)`, `(member, helper, facilitator)`,
   `(owner, admin, member, viewer)`, `(member, facilitator, observer)`,
   `(practitioner, client, supervisor)`, `(practitioner, client, supervisor, observer)`, and more.
   ⛔ **Permissions therefore cannot be defined over `role`.** A permission model keyed on a word
   that means eight things is not a boundary.
2. ⚠️ **No delegation primitive exists.** Every `delegate` / `on_behalf` hit in the schema is
   unrelated (agent tasks, Nostr keys, studio task assignment). There is **no substrate for one
   person acting as another** anywhere in the practitioner surfaces. Hard case 1 has no floor.
3. ⚠️ **No organization entity exists.** `practice_display_name` is a **display string** on
   `relationship_spaces`; `studio_teams.owner_id` is a **member**. There is no org rights-holder,
   so no org authority may be inferred. Hard case 3 has no rights-holder to grant.

---

## 2. Principals

| Principal | Exists in substrate? | Standing in this model |
|---|---|---|
| **Member** | yes | sole author of Uptake |
| **Practitioner** (steward of a relationship space) | yes | author of Work, Arrangement, Placement |
| **Co-Lab teammate / co-coach** | yes (`studio_team_members`) | ⚠️ scope only — no publishing authority *qua* teammate |
| **Practitioner's assistant** | ⛔ **no** | undefined — see hard case 1 |
| **Supervisor** | partially (role strings only) | ⛔ explicitly unruled; must not be modelled as `practitioner_role + extra read access` |
| **Organization / practice** | ⛔ **no** | no rights-holder exists |
| **MAIA** | n/a | ⭐ **not a principal.** Absent from the model, not denied within it |
| **Platform admin** | yes (`admin_role_grants`) | operational only; ⛔ never a publishing principal |

---

## 3. The four authority sources

Every permission below derives from exactly one of these. Nothing else grants.

1. **Authorship** — you may act on what you authored. Immutable, non-transferable.
2. **Relationship** — an `active` relationship space with `consent_status='accepted'` **between the
   acting person and the recipient**. Not "between the recipient and someone on the actor's team."
3. **Declaration** — the member's own gesture. The **only** source for Uptake, and it cannot be
   supplied by anyone else.
4. **Ratification** — `review_status='ratified'` on the Work. A gate on the **object**, not the
   person; it makes a Work eligible to be placed or composed, and never authorizes anyone.

⛔ **Not authority:** team membership · caseload visibility · role string · seniority · having
authored something else · organizational affiliation · MAIA suggestion · prior placement.

---

## 4. The permission grid

| Gesture | Who may perform | Relationship required | On whose object | Audience | Authority | Delegable | Reversible | Who sees it occurred |
|---|---|---|---|---|---|---|---|---|
| **Author / revise Work** | practitioner | none | own | none | authorship | ⛔ no | yes (new version supersedes) | practitioner only |
| **Ratify Work** | practitioner | none | own | none | authorship | ⛔ no | yes (de-ratify) | practitioner only |
| **Compose Arrangement** | practitioner | none | own ratified Works | none | authorship + ratification | ⛔ no | yes (revision) | practitioner only |
| **Place** (Share / Recommend / Assign) | practitioner | ⭐ **own active, consented** | own ratified Work | one member or own cohort | authorship + relationship | ⚠️ unruled — see HC1 | ⛔ **no** — a new Placement supersedes | practitioner **and** recipient |
| **Withdraw own Placement** | placing practitioner | the same one | own | same | authorship | ⚠️ unruled | ⛔ no (append-only) | both |
| **Withdraw Work from future placement** | authoring practitioner | none | own | none | authorship | ⛔ no | yes (re-publish) | practitioner; recipients unaffected |
| **Take up / set down (Uptake)** | ⭐ **member only** | own | anything placed to them | self | declaration | ⛔ **never** | yes | member; practitioner sees the declaration |
| **Withdraw practitioner visibility** | ⭐ **member only** | own | own field | self | declaration | ⛔ never | yes | member; practitioner sees *withdrawn*, not content |
| **Attest** (record what a member told you) | practitioner | own active | — | self + member | relationship | ⛔ no | yes | both — see HC7 |

⭐ **Placement is irreversible by design.** You cannot unsay something you said to someone. Removing
it from view is a *later act that is also recorded*, never an erasure of the first.

---

## 5. Gesture force — Share / Recommend / Assign

The founder's three gesture types are **degrees of the practitioner's illocutionary force**, all
authored by the practitioner:

| Gesture | What the practitioner is doing | What it may never create |
|---|---|---|
| **Share** | *here is something* | any expectation |
| **Recommend** | *I think this is for you* | any obligation |
| **Assign** | *I am asking you to do this* | ⛔ system-tracked obligation state on the member |

⚠️ **Reconciliation with the ontology §2.3.** That section said "Placement is not assignment." The
distinction that survives, and the one that matters: **Assign is a legitimate practitioner speech
act; what is forbidden is assignment *grammar* — `active_stage_number`, `target_occupancy`, due
dates, overdue flags, completion percentages, and any status the system computes about a person.**
An Assign records what Larry asked. It does not record whether the member complied — because only
the member can say that. `studio_protocol_assignments` is the shape to refuse, not the word.

Binding here: **N9** — readiness/completion status is not authority and may never proxy for it.

---

## 6. The seven hard cases

### HC1 — Can Larry's assistant place a Work authored by Larry?
⛔ **No, not under current substrate.** No delegation primitive exists (§1 hazard 2), and the
assistant holds no relationship space with the member. A Placement carries *the practitioner's own
words into a relationship*; an assistant sending it either forges authorship or delivers into a
relationship they do not hold.

If ruled permissible later, the minimum shape: an **explicit, per-relationship, time-bounded,
revocable grant** from Larry; the Placement records `acted_by ≠ authored_by`; and ⭐ **the member
sees both names.** ⛔ Never implicit from Co-Lab membership or an admin role.

### HC2 — Can a co-coach Recommend something?
✅ **Yes — but only from their own authority.** If the co-coach holds their own active, consented
relationship space with that member, they Recommend **as themselves**. Co-Lab membership grants
scope, not standing (§0). ⛔ They may not recommend *on Larry's behalf*; that is HC1.

### HC3 — Can an organization withdraw a practitioner-authored Work?
⛔ **No — there is no organization rights-holder to grant it** (§1 hazard 3). Withdrawal is an
authorship act, and authorship is non-transferable in this model. ⛔ Org authority may not be
inferred from `practice_display_name` (a display string) or from `studio_teams.owner_id` (a person).

**N7** binds directly: *aggregation cannot manufacture a rights grant unavailable at the individual
level.* If an organization genuinely needs takedown authority, that is a **contractual/IP question
requiring its own instrument** — not a permission the platform may invent. Related and still open:
Larry's IP rights instrument is unsigned.

### HC4 — Can a member forward or re-place an object?
**Split the question.**
- ✅ A member may **share what they received** — it came to them, and their field is theirs.
- ⛔ A member may **not create a Placement.** Placement is practitioner authorship; a member act
  carries neither the practitioner's authority nor the Work's ratification, and must never render as
  though it did.
- ⚠️ **Open (IP, not permissions):** redistribution of a practitioner's Work beyond the relationship
  is a rights question the platform cannot settle. Needs a ruling before any share-outward surface.

### HC5 — Can MAIA create a Placement?
⛔ **No.** Concurring with the founder's current answer, and stating the structural form: **MAIA is
not a principal in this model at all** (§2). It is not "denied permission" — there is no seat.
Anything else manufactures practitioner authorship the practitioner did not exercise.

**N11** binds: MAIA may disclose state and available gestures; it may not nudge toward promotion or
authorship claims. MAIA may say *"Larry shared something with you"*; ⛔ it may not say *"you should
look at X"* where X is unplaced material, nor draft a Placement for Larry's approval — a one-click
approval of a machine-authored act is machine authorship with a human alibi.

### HC6 — Who can mark an Assignment completed?
⭐ **The member alone.** Confirming the founder. Completion is an Uptake — a declaration, never an
inference. ⛔ Not from opens, replies, dwell time, MAIA conversation, or elapsed time. If the member
did not declare it, the honest state is **unknown**, and the surface must render unknown rather than
absent-or-incomplete.

### HC7 — Can Larry record completion the member reported verbally, and how is attribution preserved?
✅ **Yes — as a practitioner *attestation*, which is a different object kind from a member
declaration.** ⭐ The substrate already has the exact shape:
`stated_by='practitioner_seeded'` with `member_confirmed_at IS NULL`.

Binding conditions:
1. It renders as **"Larry recorded that you told him you completed this"** — ⛔ never as "You
   completed this." The attribution is in the sentence, not only in a column.
2. The member may **confirm** it (promoting to `member_confirmed`), **dispute** it, or leave it
   unconfirmed. Silence is not confirmation.
3. ⛔ Unconfirmed attestations **never compose into MAIA as member declarations**, and never satisfy
   any gate that requires a member declaration.
4. **N10** binds — an attestation proves that Larry recorded something, never that the member
   adopted, permitted, or ratified it.

⭐ *This is the general instrument for everything that happens in the room and gets typed in
afterwards.* Attestation is likely a first-class act, not an edge case — and Session 3 must decide
whether it is a fifth object or an authored variant of Uptake.

---

## 7. What this model structurally forbids

1. **No permission derives from a list.** Caseload visibility, team membership, and role strings
   grant nothing.
2. **No delegation by default.** Absent an explicit grant instrument, every act is performed by its
   named author.
3. **No system-authored declaration.** There is no code path by which the platform or MAIA supplies
   an Uptake.
4. **No irreversible act is hidden.** Placement, withdrawal, and attestation are all visible to both
   parties.
5. **No organizational override** of an individual authorship act (N7).
6. **No completion inference** from engagement (N9).

---

## 8. What Session 3 (Events) must record

Each authorized act, append-only, with: acting principal · authoring principal (where different) ·
authority source invoked (§3) · relationship space · object + version · audience · gesture force ·
timestamp · visibility to each party. ⭐ **An event asserting an authority source that did not hold
at the time is the failure mode the event log exists to make detectable** — the authority source
must be recorded as *invoked*, not merely implied by the actor's role.

## 9. Open questions carried

1. **Delegation instrument** (HC1) — shape sketched, ⛔ not ruled.
2. **Member redistribution / IP** (HC4) — needs a rights instrument, not a permission.
3. **Supervision** — still explicitly unruled.
4. **Attestation's standing** — fifth object, or Uptake variant?
5. **Cohort** — Announcement's audience has no object yet.
6. **Role-vocabulary consolidation** (§1 hazard 1) — a prerequisite for implementing any of this.
7. Carried from Session 1: Field Object versioning · §7 crossing rule + MAIA classes A/B/C ·
   `practitioner_materials` disposition.

## 10. Not authorized by this document

⛔ Schema, migration, code, route, UI · ⛔ any ruling in §9 · ⛔ a delegation grant · ⛔ a MAIA
principal · ⛔ an organization rights-holder · ⛔ re-opening the P2 ratification bounds.
