# Practitioner Publishing — Event Grammar (candidate)

**Status: CANDIDATE — design only.** ⛔ No schema, no migration, no code, no route. Session 3 of the
founder-set sequence, completing the trio with
[Ontology](PRACTITIONER_PUBLISHING_ONTOLOGY_2026-08-06.md) and
[Permissions](PRACTITIONER_PUBLISHING_PERMISSIONS_2026-08-06.md).

Events are the **historical expression** of the constitutional model, not a log bolted onto it. An
event log that can record an unauthorized act is not a record; it is a laundering mechanism.

---

## ✅ Rulings — founder, 2026-08-06

⭐ Recorded as outcomes. The reasoning below is **preserved unedited** — the candidate stays
historically true; these rulings become operationally true.

| # | Question | Ruling |
|---|---|---|
| **R1** | §2 ledger fork | ✅ **Separate publishing event ledger.** ⛔ Do not widen `member_field_note_events` — widening would make its name and constraints lie. The test *"whose authorship does this row assert?"* is accepted as the naming rule. |
| **R2** | §6 Attestation | ✅ **A third authored act, not a fifth publishing object.** The independence test resolved it: an attestation can exist with no host Placement or Uptake, and a modality needs a host. ⭐ The ontological argument is sufficient on its own — the Observation Primitive is *precedent*, and ⛔ does not decide the model. |
| **R3** | §3 `authority_source_invoked` | ✅ Mandatory at write time, **and must identify the concrete authority instance, not its category** — `relationship_space:<id>:steward`, not `relationship`. Validity is checked at write time and preserved in the row; ⛔ later role or relationship changes must never retroactively authorize or invalidate a recorded act. |
| **R4** | §4 deliberate absences | ✅ Held. Absence from the vocabulary is stronger than collecting and promising not to render. ⭐ **Delivery infrastructure may record technical delivery separately; it may never be promoted into the publishing event ledger.** |

**The ruled act grammar** — five human acts, no additional domain objects:

| Act | Author | Fact created |
|---|---|---|
| **Placement** | practitioner | the practitioner placed an object into the commitment |
| **Uptake** | member | the member declared a relationship to what was placed |
| **Attestation** | practitioner | the practitioner recorded having witnessed or heard something |
| **Withdrawal** | relevant party | availability or visibility changed through that party's act |
| **Ratification** | authorized governor | a candidate acquired constitutional force |

**Next step is not implementation** — it is the completed event specification around these acts:
exact fact language · visibility · authority-instance references · supersession · erasure handling.
→ [`PRACTITIONER_PUBLISHING_EVENT_SPECIFICATION_2026-08-06.md`](PRACTITIONER_PUBLISHING_EVENT_SPECIFICATION_2026-08-06.md).
The ontology's implementation block may be reconsidered once that is complete.

---

## 0. The governing rule — already written, in a migration comment

The Lane V migration (`20260730000002`) refused to reuse two near-fitting event types, and stated
why with unusual precision: `released` was *"wrong act"*, `consent_changed` was *"wrong subject, and
unsafe."* From that:

> ⭐⭐⭐ **An act gets its own event type when no existing type describes it truthfully. A near-fit
> is a misdescription, and a misdescription in an append-only ledger is permanent.**

Two corollaries the same migration establishes, which this grammar adopts wholesale:

1. **Forward-only vocabulary.** Widen the accepted set; ⛔ never narrow it — narrowing orphans rows
   already written.
2. ⚠️ **No member record may sit in a delete path.** That migration found
   `scripts/repro/consent_gate_proof.mjs` DELETEs rows of `consent_changed` as test cleanup. Reusing
   that type would have put real member records in a test's delete path. ⭐ **Check the delete paths
   of any event type before reusing it** — this is now a standing trap, not a one-off.

---

## 1. What already exists

**[O] Observed 2026-08-06.**

| Substrate | Standing |
|---|---|
| **`member_field_note_events`** — vocabulary `proposed · kept · revised · split · discarded · created · consent_changed · released · practitioner_visibility_withdrawn` | ⭐ **The authorship ledger.** Shared substrate: Field Lab, Vision Studio, Now What?. Member-side, keyed to field notes. |
| **Observation Primitive** (`20260701000003`) — three deliberately separated layers: `signals` (automated facts, no interpretation) · `observations` (`witnessed_by`, `witness_text` — human witness records) · `recognitions` (`authored_by`, cross-observation synthesis) | ⭐ Bears directly on the Attestation question — see §6. ⚠️ Observation substrates were deliberately **NOT merged** during inference containment; that decision stands. |
| `field_program_positions.stated_by` + `member_confirmed_at` | The attribution primitive. |
| `practitioner_file_access_log` | Operational access logging. ⛔ Not a publishing event source. |
| **56+ existing event / ledger / log tables** | ⚠️ The hazard: a 57th needs justification, not convenience. |

---

## 2. The fork: one ledger or two?

Publishing acts land in **two fields at once** — Larry's practice and the member's field — which is
exactly why this is not obvious.

| Option | For | Against |
|---|---|---|
| **A. Widen `member_field_note_events`** | one ledger; the member's history stays in one place | ⛔ it is keyed to *field notes*, written by three surfaces; practitioner-authored acts on practitioner-owned objects do not belong in a member-field-note ledger. Widening it to carry Placement would make the table mean two things. |
| **B. A publishing act ledger** (recommended) | acts on publishing objects have one home; the member's field ledger stays clean | a 57th table; requires a join to read a member's full history |

⭐ **Recommendation: B, with one crossing rule.** A publishing act is recorded once, in the
publishing ledger. When a member's **own declaration** changes what is present in *their* field —
Uptake, and member visibility withdrawal — that also earns a row in the existing authorship ledger,
because that ledger's subject is *the member's authorship of their own field*, and this is exactly
that. ⛔ Practitioner acts never write to the member's authorship ledger.

The distinguishing question, stated so future surfaces can apply it: **whose authorship does this
row assert?** That names the ledger, not who was affected.

---

## 3. The event record

Every publishing event carries:

| Field | Why |
|---|---|
| `occurred_at` | the fact |
| `act` | from the vocabulary (§4) — never free text |
| `acting_principal` | who performed it |
| `authoring_principal` | who authored the thing acted on — differs only under a ruled delegation |
| ⭐ **`authority_source_invoked`** | `authorship \| relationship \| declaration \| ratification` |
| `relationship_space_id` | the held relationship, where one is required |
| `object_ref` + `object_version` | what, at which version |
| `audience` | member, cohort, or self |
| `gesture_force` | `share \| recommend \| assign`, for Placement only |
| `visible_to` | which parties may see this row |
| `supersedes` | the prior event this act replaces, where applicable |

⭐ **`authority_source_invoked` is recorded as *invoked*, never derived at read time.** A row that
says *"performed under relationship X"* can be checked against whether relationship X held at
`occurred_at`. A row that merely names an actor lets a later role change silently re-authorize
history. **This single column is what makes an invalid act detectable rather than laundered.**

⛔ **Fail-closed:** an act that cannot name its authority source **cannot be written**. No
`authority_source = 'unknown'`, no nullable column, no default. Writing the event and validating
later is the failure mode.

---

## 4. The vocabulary

Each term earns its place by describing an act no other term describes truthfully (§0).

**Practitioner acts** — `work_authored` · `work_revised` · `work_ratified` · `work_deratified` ·
`work_withdrawn_from_placement` · `arrangement_composed` · `arrangement_revised` · `placed` ·
`placement_withdrawn` · `attested`

**Member acts** — `taken_up` · `set_down` · `attestation_confirmed` · `attestation_disputed` ·
`practitioner_visibility_withdrawn` *(existing — reuse, do not duplicate)*

Deliberately **absent**, and the absence is the design:

⛔ `viewed` · `opened` · `downloaded` · `completed` (as anything but a member declaration) ·
`overdue` · `reminded` · `progressed` · `recommended_by_maia`

⭐ **There are no member-viewing events.** Not omitted for later — **structurally absent.** If no
event type exists for *the member looked at this*, no surface can render it, no aggregate can count
it, and no MAIA context can carry it. This is where engagement telemetry would enter, and the
vocabulary is the gate.

---

## 5. Irreversibility and visibility

- **Append-only. No updates, no deletes.** Withdrawal is a *new event that supersedes*, never a
  removal. ⭐ *You cannot unsay something you said to someone; you can only say something after it.*
- **Visibility is per-row and per-party**, recorded at write time. A member's withdrawal is visible
  to the practitioner **as the fact of withdrawal**, ⛔ never as its content or reason.
- **Reading your own history is not surveillance; reading someone else's behaviour is.** A
  practitioner may read every act *they* performed. They may read member acts **only where the
  member's declaration was directed at them** — Uptake of a Work that practitioner placed, or a
  confirmation of that practitioner's attestation. ⛔ Nothing else.
- ⛔ **The ledger is not a MAIA context source** by default. Whether MAIA may read class A/B events
  is exactly the §7 question — still unruled, and this grammar does not pre-answer it. It only
  ensures class C has no row to read.

---

## 6. Attestation — the question, narrowed, with new evidence

The founder's caution is well taken: making Attestation a fifth **object** would create objects
whose only purpose is to represent acts. The narrowed question stands:

> **Is Attestation a third authored act alongside Placement and Uptake, or a modality shared by
> multiple acts?**

**New evidence, found this session.** The **Observation Primitive** (`20260701000003`) already
separates witnessing into its **own layer**: `signals` (automated, no interpretation) → `observations`
(`witnessed_by`, `witness_text` — *a human recording that they witnessed something*) →
`recognitions` (`authored_by`, synthesis). ⭐ Layer 2 is an attestation shape, and the substrate
treats it as **a distinct layer, not a flag on the underlying fact.**

⚠️ That is suggestive, ⛔ not decisive — `observations` is about witnessing *in a context*, whereas
HC7 is about recording *what another person declared*. And observation substrates were deliberately
not merged during inference containment; that decision should not be quietly undone by reuse.

**A test that would distinguish the two possibilities:**

> **Can an attestation exist with no host act to be a modality of?**

If Larry can record *"she told me she has been doing this practice on her own"* — about material he
never placed, and which the member never took up in the system — then there is no Placement and no
Uptake for the attestation to be a modality **of**. A modality needs a host.

My read is that this case is ordinary rather than exotic: most of what a practitioner types after a
session concerns things that were never system objects. That points toward **a third authored act**.
⛔ But this is a ruling to make, not a conclusion to assume — the vocabulary in §4 lists `attested`
as an act precisely so the question stays visible instead of being settled by a schema choice.

Either way, the constraints from Permissions HC7 hold unchanged: renders as *"Larry recorded that
you told him…"* · silence is not confirmation · unconfirmed attestations never compose as member
declarations · **N10** binds.

---

## 7. Open questions carried

1. **Attestation: third act or modality** — §6. Now has a distinguishing test; ⛔ still unruled.
2. **Ledger fork** — §2 recommends B; ⛔ not ruled.
3. **MAIA read access to class A/B events** — the §7 crossing rule, still unruled.
4. Carried: delegation instrument · member redistribution / IP · supervision · cohort object ·
   role-vocabulary consolidation · Field Object versioning · `practitioner_materials` disposition.

## 8. Not authorized by this document

⛔ Schema, migration, code, route, UI · ⛔ any ruling in §7 · ⛔ widening
`member_field_note_events` · ⛔ a MAIA read path · ⛔ re-opening the P2 ratification bounds.

---

## 9. Where the trio now stands

| Session | Question | Outcome |
|---|---|---|
| 1 — Ontology | what exists | four objects; Placement was missing |
| 2 — Permissions | who may create which facts | four authority sources; role is not one |
| 3 — Events | what durable record an authorized act creates | one vocabulary, fail-closed on authority source |

⭐ The three are mutually constraining: an object with no authorized act cannot be created, an act
with no authority source cannot be written, and an event with no object has nothing to describe.
**Implementation remains blocked** pending the rulings in §7 — the design is complete enough to be
ruled on, which was the point.
