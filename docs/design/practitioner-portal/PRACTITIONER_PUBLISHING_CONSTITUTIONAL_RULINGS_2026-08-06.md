# Practitioner Publishing — Track 2 Constitutional Review

**Status: CANDIDATE — recommended rulings for founder act.** ⛔ This document rules nothing. Each
section ends in a *recommendation*; a ruling exists only when the founder makes it. ⛔ No schema, no
migration, no code, no route, no table selection beyond naming an existing substrate as the current
expression of a constitutional definition.

**Scope, as set:** the four rulings in the founder's Track 2 sequence
([Implementation Map §"Track 2 — ruling order"](PRACTITIONER_PUBLISHING_IMPLEMENTATION_MAP_2026-08-06.md)),
in order, ⛔ stopping after the fourth.

**Source set read:** [Implementation Map](PRACTITIONER_PUBLISHING_IMPLEMENTATION_MAP_2026-08-06.md) ·
[Production Measurement](PRACTITIONER_PUBLISHING_PRODUCTION_MEASUREMENT_2026-08-06.md) ·
[Substrate Verification](PRACTITIONER_PUBLISHING_SUBSTRATE_VERIFICATION_2026-08-06.md) ·
[Candidate Model Synthesis](../now-what/PRACTITIONER_PUBLISHING_CANDIDATE_MODEL_SYNTHESIS_2026-08-06.md) ·
[Permissions](PRACTITIONER_PUBLISHING_PERMISSIONS_2026-08-06.md) ·
[Events](PRACTITIONER_PUBLISHING_EVENTS_2026-08-06.md).
**Also load-bearing:** [Event Specification](PRACTITIONER_PUBLISHING_EVENT_SPECIFICATION_2026-08-06.md) ·
[Act Grammar Fact-Class Test](ACT_GRAMMAR_FACT_CLASS_TEST_2026-08-06.md) ·
[`AUTHORITY_IS_AUTHORED_OR_HELD`](../../canon/AUTHORITY_IS_AUTHORED_OR_HELD_2026-08-06.md) ·
[`EVIDENCE_SCOPE_RULE`](../../canon/EVIDENCE_SCOPE_RULE_2026-08-06.md) ·
[`SUBSTRATE_DISPOSITION_TEST`](../../canon/SUBSTRATE_DISPOSITION_TEST_2026-08-06.md).

**Evidence scope for every production claim below:** deployed commit **`b1399f693`**, database
`maia_consciousness` on `minisforum` (primary, `pg_is_in_recovery = f`), measured
**2026-08-06 ~19:11 UTC**, read-only. ⛔ No claim here is derived from migration files where
production evidence exists.

⭐ **The governing discipline of this document**, stated at founder direction:

> **If a proposed solution requires choosing a schema before a constitutional ruling exists, stop.
> Report that implementation would silently decide governance. Do not continue.**

§5 records every point at which this review stopped for that reason.

---

# Ruling 1 — Commitment Authority

> ⛔⛔ **SUPERSEDED 2026-08-09 — this section is the RECOMMENDATION, not the act.**
> ⭐ Operative successor: [`FOUNDER_RULING_1_COMMITMENT_AUTHORITY_2026-08-09.md`](FOUNDER_RULING_1_COMMITMENT_AUTHORITY_2026-08-09.md).
> **Where they differ, the ruling governs.**
>
> ⭐⭐⭐ **Retained as history, ⛔ not deleted.** The founder made **three amendments and one wording
> correction** to this recommendation; ⛔ ruling §5 is unreadable without the text it amended. ⭐ Read
> this section as *what was proposed*, ⛔ never as *what is law*.
>
> 📌 Full classification: [`RULING_1_CONSTITUTIONAL_PROPAGATION_AUDIT_2026-08-09.md`](RULING_1_CONSTITUTIONAL_PROPAGATION_AUDIT_2026-08-09.md) §S1.

## The question

**What is the constitutional object representing the shared developmental commitment?**

## Evidence

**`relationship_spaces`** *(`20260701000001`; verified live)*

| | |
|---|---|
| Rows | ⛔ **0** |
| `relationship_type` | `practitioner_client \| teacher_student \| coach_client \| supervisor_supervisee` |
| `status` | `invited \| active \| paused \| archived` |
| `consent_status` | `pending \| accepted \| declined \| withdrawn` — ⭐ **a separate column, not folded into status** |
| Party FKs | `steward_member_id → members` (RESTRICT) · `participant_member_id → members` (SET NULL, ⚠️ **nullable**) |
| Other FKs | `practitioner_client_id → practitioner_clients` |
| Integrity | `CHECK (steward_member_id <> participant_member_id)` |

**`practitioner_clients`** *(merged across three migrations; verified live)*

| | |
|---|---|
| Rows | **13** — the live relationships in practice |
| `member_id` | nullable → `members`; ⛔ **1 of 13 populated** |
| `practitioner_id` | → `practitioners` ⚠️ **not `members`** (`practitioners.member_id` is 17/17, so the practitioner side resolves in two hops) |
| `relationship_status` | `pending \| active \| paused \| ended` |
| Consent | ⛔ **no consent column of any kind** |
| Integrity | three coherence CHECKs (`link_coherence`, `pending_reachable`, `ended_coherence`); ⛔ **0 unique constraints** |

**The constitutional requirement the object must satisfy** — Permissions §3 source 2: *"an `active`
relationship space with `consent_status='accepted'` **between the acting person and the
recipient**."* Event Specification §4.2 rule 4 makes that a fail-closed write condition.

## Constitutional analysis

### Alternatives considered

| | Candidate | Disposition |
|---|---|---|
| **A** | `practitioner_clients` — the populated one | ⛔ **refused** — see below |
| **B** | `relationship_spaces` — the consent-shaped one | ⭐ **recommended** |
| **C** | a new constitutional object | ⛔ unwarranted — B satisfies the definition |
| **D** | layered: `practitioner_clients` = contact record, `relationship_spaces` = commitment | ⭐ **recommended, and already encoded in the schema** by `relationship_spaces.practitioner_client_id` |

### Why population is not the deciding evidence

The tempting argument for A is that it holds the 13 real relationships while B holds none. ⛔ That
argument is disqualified before it is weighed:

> ⭐⭐⭐ **A `practitioner_clients` row is authored by the practitioner alone.**

Twelve of thirteen name only an email address; ⛔ none required an act by the member. Adopting it as
the commitment would mean **the practitioner's own roster is the source of the practitioner's
authority over the member.** That is `membership → authority` — the first collapse
`AUTHORITY_IS_AUTHORED_OR_HELD` forbids, and the standing ruling
`feedback_list_filter_is_not_authorization_boundary` in its original form. ⭐ **One party cannot
unilaterally constitute the container that grants them authority over the other.** This holds at 13
rows and would hold at 13,000.

### The Substrate Disposition Test, applied

| Substrate | State | Consequence |
|---|---|---|
| `practitioner_clients` **as the commitment** | ⭐ **incompatible** | it has no consent gate at all; `relationship_status` conflates lifecycle with consent and contains no `accepted`. ⛔ Per the test, the requirement may **never** be weakened to fit the substrate |
| `practitioner_clients` **as a contact record** | ⭐ **already governing** | it decides today how a practitioner holds a pre-member contact, under three coherence constraints. ⛔ Ruling it out as the commitment must not be read as retiring it |
| `relationship_spaces` | **compatible, unexercised** | correct types, both gates as separate columns, both parties FK to `members`, self-reference refused. ⚠️ 0 rows — ⛔ compatible ≠ live |

### The refinement the evidence forces

⚠️ `participant_member_id` is **nullable** and `status` includes `invited`. So the table can hold a
row that is *not yet* a commitment. Without an explicit threshold, the nullable column silently
admits a one-party commitment — reintroducing exactly the defect that disqualifies A.

> ⭐⭐⭐ **A commitment exists constitutionally only when `participant_member_id IS NOT NULL` **and**
> `status = 'active'` **and** `consent_status = 'accepted'`.** Below that threshold the row is an
> **invitation**, and an invitation confers no authority whatsoever.

## Recommended ruling

> ⭐⭐⭐ **The shared developmental commitment is a bilaterally-constituted relationship between two
> governed members, holding an accepted consent state distinct from its lifecycle state. Today that
> object is expressed by `relationship_spaces` at the constituted threshold.**
>
> ⭐ **`practitioner_clients` is a practitioner-authored contact record.** A commitment may reference
> one; ⛔ a contact record confers no authority, is not a commitment, and never becomes one by
> population.

> ⛔⛔ **THE PHRASE *"never becomes one by population"* IS SUPERSEDED — founder wording correction,
> Ruling 1 §5.1 (2026-08-09).** ⭐ Retained above as history; ⛔ **it is not the operative rule.**
>
> ⭐⭐⭐ **Operative (ratified):** *population itself is not prohibited.* ⛔ **Unilateral** population
> cannot constitute the commitment. ⭐ A **legitimate bilateral constituting process may persist its
> result** by populating the authoritative relationship substrate.
>
> | ⛔ Forbidden | ⭐ Permitted |
> |---|---|
> | `unilateral persistence` treated as a **constitutive act** | a valid **constitutive act** that then **produces persisted state** |
>
> ⛔⛔ **Do not read the correction in the opposite direction either:** ⛔ *population establishes
> relationship* is **false**. ⭐ The ratified prohibition is conversion of a unilateral record into a
> bilateral commitment *"by migration, inference, or administrative population **in place of the
> absent member act**."*
>
> ⚠️ **Why the superseded wording was dangerous:** as written it forbids **any** population, which
> would outlaw the persistence of a genuinely valid relational act — ⛔ a constitution cannot say
> database creation can never represent constitution. Ruling 1 §5.1: *"A legitimate constituting
> process **will eventually populate a row**."*

**Definitional primacy:** the ruling names the *object*, not the table. `relationship_spaces` is the
current expression of the definition. ⛔ If a future substrate expresses it better, the definition
governs and the table follows — ⛔ never the reverse.

## Consequences

1. ⭐ **The count of constituted commitments in production is zero.** `relationship_space:<id>:steward`
   resolves for nobody. ⛔ No Placement, Attestation, or Uptake is presently writable — and that is the
   honest state, not a defect to engineer around.
2. ⛔⛔ **Backfilling `relationship_spaces` from `practitioner_clients` is constitutionally
   forbidden.** It is the obvious helpful move and it **manufactures the member's consent**. The 13
   rows cannot become 13 commitments by any migration, because the missing element is a member act
   that has not occurred.
3. ⭐ **Track-1 blocker 1 (identity linkage) is reclassified.** Substrate Verification §5 called it
   *operational adoption*. Under this ruling it is **partly constitutional**: even a fully linked
   `member_id` on all 13 rows would not produce a commitment. ⛔ It is not backfillable — it is
   *earnable*, one member act at a time.
   > 📌 **Consequences 2 and 3 are no longer proposals — they are RATIFIED** by Ruling 1 §2.1
   > (2026-08-09), which prohibits *"backfilling bilateral commitments from unilateral contact records
   > where the member's constituting act did not occur."* ⭐ Cite the ruling, ⛔ not this
   > recommendation, as authority.
4. ⭐ `authority_instance` (Event Spec §4.1) now has a settled referent, and §4.2 rule 4 is
   revealed as already stating this ruling's threshold — ⭐ **independent convergence**, reached from
   the write-validation side before the container was ruled.
5. ⚠️ **Cohort still has no object.** Ontology §9.4 stands; Announcement remains unmappable.

## Unresolved implications

- ⚠️ **`practitioners` is a separate identity space from `members`.** The steward of a commitment is
  a *member who stewards*, so `practitioners` is a professional profile, not a party. ⛔ Not ruled
  here, and it bears on Ruling 2 (to whom a mandate is issued).
  > ⛔⛔ **"Not ruled here" is SUPERSEDED — Ruling 1 Amendment 3 (2026-08-09) settled it inside
  > Ruling 1**, expressly so it would ⛔ **not** be carried into Ruling 2. ⭐ Ratified: a practitioner
  > profile *"is not a separate constitutional person and does not itself confer authority over
  > another member."* Constitutional authority attaches to **governed member identities**.
  > ⭐ Consequence: **Ruling 2's dependency on Ruling 1 is narrower than this line implies** — the
  > identity question is no longer among the premises Ruling 2 inherits.
- ⚠️ **No UNIQUE on `(practitioner_id, member_id)`,** and `relationship_type` has four values — so
  two simultaneous commitments between the same pair (coach_client *and* supervisor_supervisee) may
  be representable. If permitted, ⛔ `commitment_ref` can **never** be derived from the party pair.
  Unruled.
- 🟡 **The commitment's own lifecycle and event stream** (Synthesis §12 item 6) remains open. Ruling 4
  settles ownership of acts *within* a commitment, ⛔ not the commitment's own formation.

---

# Ruling 2 — Custodial Authority

## The question

**Should Custodial Mandate become the fifth authority source?**

## Evidence

- ⭐ [`AUTHORITY_IS_AUTHORED_OR_HELD`](../../canon/AUTHORITY_IS_AUTHORED_OR_HELD_2026-08-06.md)
  already records the founder specifying custodial mandate as **source 5** (2026-08-06), with seven
  required instrument fields, and states explicitly that **the instrument is not designed there.**
- ⚠️ Permissions §3 still states **four**, with *"Every permission below derives from exactly one of
  these. Nothing else grants."* Permissions §2 places platform admin as *"operational only; ⛔ never a
  publishing principal."*
- Synthesis §12 item 4: the carve-out boundary is recorded as **unstated**.
- Event Specification §4.1 already reserves the instance form `custodial_mandate:<id>`, flagged *not
  yet designed*; §5 gives custodial acts **no visibility to either party** ("custodial log only");
  §7 assigns statutory erasure and account closure to a custodial mandate.
- **Production:** `admin_role_grants` exists. ⛔ No mandate instrument. ⛔ No key registry.
  ⚠️ `sponsored_access_grants` observed, ⛔ not adopted.

## Constitutional analysis

**Exception or source — the whole question.** An exception is not required to name itself; it
accumulates *outside* the grid, and every future operational need finds it. A fifth source stays
*inside* the discipline that makes an invalid act detectable at all (Events §3: every act names
exactly one authority source, fail-closed).

⭐ **The structural asymmetry that keeps the fifth source safe** is already written in the canon
candidate: the other four make you a **party**; a custodial mandate makes you a **custodian**. A
custodian acts *on* the system, ⛔ never *within* the relationship. So naming it a source does **not**
make a custodian a publishing principal — Permissions §2 survives unamended on that point, and must
be seen to survive.

⭐ **What the fifth source buys, concretely:** Event Spec §7 already assigns statutory erasure to a
custodial mandate. Today that means **the one obligation the system is most likely to face has no
lawful authority form at all.** The fifth source does not create a power; it gives an unavoidable
power a constrained shape.

## Recommended ruling

> ⭐⭐⭐ **Yes. Custodial Mandate is the fifth authority source** — bounded, named, and subject to the
> same one-source-per-act discipline as the other four.

**Definitions, filling the gaps the canon candidate left open:**

| | |
|---|---|
| **Issuing authority** | ⭐ a **founder act**, or a named delegate acting under a written, revocable delegation authored by the founder. ⛔ Never self-issued — **issuer ≠ holder, always**. ⛔ Never derived from `admin_role_grants`, an admin role string, employment, seniority, or on-call rotation. Where law compels the action, the legal obligation is the **occasion**; ⛔ the mandate is still a founder act |
| **Scope** | enumerated **permitted actions**, named **systems**, named **subjects**. ⛔ *"administrative access"* is not a scope. Minimum necessary to discharge the named duty, and no more |
| **Duration** | ⛔ **never open-ended.** An expiry timestamp or a stated completion condition. Expiry is **automatic**, ⛔ not a revocation the issuer must remember to perform |
| **Revocation** | by the issuer at any time, effective immediately; automatic at expiry or on discharge of the duty. ⭐ Revocation ⛔ **never** retroactively invalidates acts lawfully performed under it — the same rule as Event Spec §4.3, in both directions |
| **Audit** | every act under a mandate writes a **custodial row**: mandate id · holder · occasioning duty · action · subjects touched · timestamp. ⭐ **Fail-closed** — an act that cannot write its custodial row **cannot be performed** |
| **Relation to the other four** | ⛔ **disjoint and non-convertible.** A mandate never confers authorship, relational standing, declaration on another's behalf, or ratification, and ⛔ never composes with them. A person holding both acts under **one at a time**, named per act. ⭐ A custodial act leaves a **custodial** trace, ⛔ never a relational one |

### ⚠️ The amendment to Permissions §3 — explicit, not silent

Permissions §3 must be revised by the same founder act:

1. *"The four authority sources"* → **five**.
2. ⭐ The invariant sentence is **preserved verbatim**: *"Every permission below derives from exactly
   one of these. Nothing else grants."* Its force is what the fifth source is joining, ⛔ not escaping.
3. §2's *"platform admin — operational only; ⛔ never a publishing principal"* is **retained and
   sharpened**: a custodian is not a principal in this model. A mandate authorizes acts **on the
   substrate**, ⛔ never acts **within a commitment**.
4. The §4 permission grid is ⛔ **unchanged** — no custodial row is added to it, because no custodial
   act is a publishing gesture.

## Consequences

1. ⭐ **Custodial acts become positively authorized and therefore constrained.** The alternative was
   not "no custodial access" — it was custodial access with no name, no bound, and no audit.
2. ⛔ **No custodial act is presently performable.** No instrument exists. ⭐ That is the correct
   state, not a gap to close by convenience.
3. 🔴 **`admin_role_grants` is definitively excluded as an authority source.** ⚠️ **Unmeasured, and
   flagged rather than chased:** whether any live operational path today reaches member material on
   the strength of an admin role has **not** been audited by this review. If such a path exists, it
   is unauthorized under this ruling. ⛔ Naming it is not remediation and no remediation is authorized
   here.
4. ⭐ Interaction with Ruling 4: because a custodian is not a party, **custodial acts do not enter the
   commitment ledger.** See Ruling 4.

## Unresolved implications

- 🟡 **Safety intervention** is the clause where custodial acts come closest to relational. An act
  that *speaks to a member* is arguably not custodial at all — ⛔ a custodian who addresses a person
  has become a party. Unruled, and it is the seam most likely to be leaned on.
- ⛔ **Delegation grant (HC1) remains separate and unruled.** ⭐⭐ Custodial mandate must **never** be
  used as a delegation substitute — that is precisely the escape hatch the fifth source exists to
  prevent. An assistant is not a custodian.
- ⚠️ To *whom* a mandate is issued depends on Ruling 1's carried question — whether `practitioners`
  is an identity or a profile.
- ⛔ **Where the instrument is stored is not decided here.** See §5.

---

# Ruling 3 — Attestation Governance

## The question

**What survives, what is erasable, what is irreversible?** ⛔ Attestation is not redesigned — R2
(third authored act) and the fact-class test's independent confirmation both stand.

## Evidence

- **Fact class:** *testimonial* — ⭐ *"the only fact the system records without asserting"*
  (Fact-Class Test §1, §2.3). Truth-value **deliberately undetermined**.
- **The open case, verbatim** (Event Spec §7): *member erases an attestation about them* —
  ⚠️ *"a genuine conflict of two authorships and ⛔ should not be settled by implementation."*
- ⭐ **Gate 2, criterion 5** (Fact-Class Test §0): *"a fact about private material that cannot be
  erased cannot be admitted."*
- 🔴 **Production, measured:** exactly one key id (`k1`) protects **16,647 rows across multiple
  subjects and multiple tables**. ⛔ No key registry. ⭐ **Per-subject cryptographic erasure is
  structurally impossible today.**
- **Permissions HC7 binding conditions:** renders as *"Larry recorded that you told him…"* · silence
  is not confirmation · unconfirmed attestations never compose as member declarations · **N10**.
- **Tombstone purity** (Event Spec §7): ⛔ no summaries, embeddings, classifications, excerpts, topic
  labels, sentiment — binding on `library_chunks`, `library_distillates`, and every derived index.

## Constitutional analysis

### The conflict dissolves once the two authorships are seen to address different objects

Act · Fact · Record separates them cleanly:

| Layer | Whose | Governed by |
|---|---|---|
| **The act** — *P recorded something* | P's authorship | **authorship** |
| **The content** — *the words attributed to M's speech* | ⭐ M is the **subject** | ⭐ **subject-standing**, ⛔ not authorship |
| **The response** — *confirm / dispute* | M's own authored stance fact | **declaration** |

> ⭐⭐⭐ **This is not a balance to strike; it is a boundary to locate.** Authorship governs whether
> the *record* exists. Subject-standing governs whether the *content* persists. Neither overrides the
> other, because they do not address the same object.

### The asymmetry check — why attestation differs from placement

Event Spec §7's neighbouring row refuses member erasure of the practitioner's **placement words**.
Why is attestation different?

⭐ Because in a placement the practitioner's words are **the practitioner's own speech**. In an
attestation the content **is the member's speech, reported.** The subject of the content is the other
party in a way it never is for a placement.

⭐ **The line is therefore narrow and statable:** it reaches content whose subject is *another party's
speech or private material* — ⛔ not content merely *about* a relationship, ⛔ not the practitioner's
own framing, ⛔ not the practitioner's clinical judgment.

### The consequence the evidence forces

Gate 2 criterion 5 and the measured `k1` finding meet head-on:

> 🔴 **Attestation content is admissible in principle and inadmissible in practice**, because the
> erasability condition it must satisfy cannot be honoured on the deployed substrate.

⛔ Stating the governance model without stating this would let implementation ship attestation content
that cannot be erased — **silently repealing criterion 5 by shipping.**

## Recommended ruling

**Three tiers, plus two closures.**

### 1 · Irreversible — survives every later act by any party

The **fact that an attestation occurred**: act · both parties · `occurred_at` ·
`authority_instance` · `authority_snapshot` · supersession links. This persists as a **tombstone**
after content erasure.

⛔ Not erasable at the member's request. ⛔ Not erasable at the practitioner's request. ⭐ Neither party
may make it un-have-happened.

### 2 · Erasable — at the member's unilateral declaration

The **attestation content** — the reported statement. Erased by key destruction; `content_ref`
resolves to *erased*.

⛔ **No practitioner consent required.** ⛔ **No reason required.** ⛔ **No notice to the practitioner
beyond the tombstone itself** — the practitioner sees *that* content was erased, ⛔ never why.
⭐ Tombstone purity binds **absolutely**, including every distillate, chunk, embedding, and any
MAIA-side derivative.

### 3 · Survives as its own act — erasable only by its own author

`attestation_confirmed` / `attestation_disputed` are **M's authored stance facts**. Erasing the
attestation content does ⛔ **not** erase the member's response.

⭐ **Rendering must degrade with the content.** After erasure, *"You confirmed this"* has no *this*.
The only admissible rendering is *a statement Larry recorded, since erased, which you
confirmed / disputed* — ⛔ never a reconstruction, ⛔ never an excerpt, ⛔ never a paraphrase.

### Closure A · The practitioner may not erase their own attestation content

⛔ P may not delete the content of an attestation to escape a dispute. **Correction is supersession**
(Event Spec §6), never deletion.

### Closure B · Silence stays silence

⛔ Erasure of content **never** converts an unresponded attestation into a dispute, a withdrawal, or a
confirmation. An unconfirmed attestation whose content is erased remains **unconfirmed**.

### The admissibility gate

> 🔴 **`attested` rows carrying content are unwritable until per-subject cryptographic erasure
> exists.** Fail-closed. ⛔ Not because the act is unruled — it is ruled — but because the erasability
> condition cannot be honoured.

## Consequences

1. ⭐ **The two-authorship conflict is settled, and Attestation is simultaneously blocked on a
   measured substrate condition.** Both are outputs of this ruling; ⛔ neither cancels the other.
2. ⭐⭐ **Per-subject keying is now a constitutional dependency, not an engineering preference.** Under
   the Substrate Disposition Test the `k1` substrate is **incompatible**, and ⛔ the requirement may
   never be relaxed to fit it — ⛔ not by row deletion, ⛔ not by "erase at account closure only",
   ⛔ not by redaction-in-place.
3. ⭐ **A general rule falls out, reusable beyond attestation:** *content whose subject is another
   party's speech or private material is erasable at that party's declaration; the act that produced
   it is not.* ⚠️ This plausibly reaches `practitioner_client_notes` (3 rows, encrypted) — ⛔ noted,
   ⛔ not ruled, ⛔ out of Track 2's scope.
4. ⭐ **The practitioner loses nothing they authored.** They keep the complete record of their own
   act. What they lose is a record of **another person's words** — which was never solely theirs.

## Unresolved implications

- 🟡 **`attestation_confirmed` as class-conversion** (Fact-Class Test §4) remains open. This ruling
  governs the resulting facts; ⛔ it does not resolve whether conversion is its own fact class.
- 🟡 **The disputed-attestation edge:** where an attestation is itself the subject of a complaint, its
  content is simultaneously the evidence. ⛔ Analyzed nowhere in the source set. My read is that this
  creates **no exception** — the member's erasure right does not bend to the practitioner's
  evidentiary interest — ⛔ but it is an edge the founder should rule on knowingly rather than inherit.
- ⚠️ **Pseudonymised tombstones at account closure** (Event Spec §7) collide with tier 1: a tombstone
  whose parties are pseudonymised no longer names both parties. Unruled.
- ⛔ **What "per-subject" means is not decided here.** See §5 — this is the sharpest guardrail case in
  the review.

---

# Ruling 4 — Commitment Event Home

## The question

**Which ledger constitutionally owns commitment events?** ⛔ Ownership only — ⛔ no migration, ⛔ no
table, ⛔ no column.

## Evidence

- **R1** (ruled): a **separate publishing event ledger**; ⛔ do not widen `member_field_note_events`.
- **The naming rule** (Events §2): ⭐ *"whose authorship does this row assert?"* — that names the
  ledger, ⛔ not who was affected.
- **The crossing rule** (Events §2): a member's own declaration that changes what is present in
  *their* field also earns a row in the authorship ledger. ⛔ Practitioner acts never write there.
- **Lane V, verified live:** `practitioner_visibility_withdrawn` is deployed as an `event_type` inside
  `member_field_note_events` (constraint confirmed on `b1399f693`); the table holds **3 rows total**,
  all types combined.
- ⚠️ **An internal tension:** Event Spec §2 lists `practitioner_visibility_withdrawn` under Withdrawal
  marked *"(existing — reuse)"*, which sits uneasily with R1.
- **Fact-Class Test §4:** member visibility withdrawal is ⭐ *revocation of a grant made to someone
  else* — constitutionally distinct from practitioner withdrawal.
- **Ruling 1 renames the question:** the home attaches to **the commitment**, ⛔ not to *publishing*.
- **Event Spec §5:** custodial acts are visible to ⛔ neither party — *"custodial log only."*
- ⚠️ **56+ existing event / ledger / log tables.** A 57th needs justification, ⛔ not convenience.

## Constitutional analysis

### Two subjects, therefore two ledgers

Applying the naming rule under Ruling 1:

| Ledger | Owns | Test |
|---|---|---|
| ⭐ **The commitment ledger** | every act whose subject is **the commitment** — every fact a second party has standing to see *because it occurred between them*. Both parties' acts land here | *does another party have standing in this fact?* |
| **`member_field_note_events`** | acts whose subject is **the member's own field alone** — the member's authorship of their own material, no counterparty | *is this the member's field, and nobody else's?* |

⭐ The crossing rule survives intact: an act may be recorded in **both** when it genuinely is both, and
the two rows assert **different facts** — one about the commitment, one about the member's field.
⛔ That is not duplication.

### ⭐ The rename is load-bearing, not cosmetic

Calling it a *publishing* ledger was always a poor fit for two of the five acts. **Attestation
publishes nothing.** **Member visibility withdrawal publishes nothing.** Once Ruling 1 settles the
container, the ledger's subject is the **commitment**, and publishing is simply *one family of acts
it holds*. ⭐ R1 is preserved exactly — a separate ledger, and ⛔ no widening of the field-note ledger —
while its scope becomes statable without stretching.

### The Lane V conflict, resolved on principle

`practitioner_visibility_withdrawn`'s subject is **a grant the member made to another party** —
commitment-scoped by the fact-class test. Constitutional ownership therefore belongs to the commitment
ledger, **prospectively**.

⚠️ But Lane V is ⭐ **already governing** (Substrate Disposition Test). Its migration reasoned
explicitly about near-fits — *"wrong act"*, *"wrong subject, and unsafe"* — and decided where this
event lives. ⛔ That decision may be superseded, but only **explicitly**, and never by accident:

1. ⛔ **Existing Lane V rows are not migrated.** Retro-locating recorded acts rewrites their
   provenance and violates append-only in spirit, if not in mechanism.
2. ⛔ **The event type is not removed** from `member_field_note_events`' vocabulary. **Forward-only
   vocabulary** — narrowing orphans rows already written.
3. ⭐ Lane V is **not a mistake.** It predates the commitment ledger. It recorded truthfully in the
   only ledger that existed.

### Custodial rows — where Ruling 2 lands

Because a custodian is **not a party** and leaves ⛔ no relational trace:

> ⭐⭐⭐ **Custodial acts do not enter the commitment ledger.** They are owned by a **custodial log**
> with its own governance. ⭐ The *effect* of a custodial act on the commitment — an erased
> `content_ref`, a tombstone — **is** a commitment-owned fact, recorded in the commitment ledger as a
> tombstone naming `custodial_mandate:<id>` as the authority that produced it.

⚠️ **This reconciles a real tension, and should be ruled knowing that.** Implementation Map and Event
Spec §7 both say *"the custodial act itself earns a row"*; Event Spec §5 says custodial acts are
visible to no party in this ledger. **The alternative — custodial rows inside the commitment ledger
with zero visibility — was considered and is rejected:** ⛔ a row in the relational ledger **is** a
relational trace regardless of who can see it. Splitting *act* (custodial log) from *effect*
(commitment tombstone) preserves both sources' intent.

## Recommended ruling

> ⭐⭐⭐ **The commitment ledger constitutionally owns every act whose subject is the commitment —
> both parties' acts, one ledger, keyed by `commitment_ref` to the object ruled in Ruling 1.**
>
> ⭐ It is a **commitment** ledger, ⛔ not a publishing ledger. Publishing is one family of acts within
> it.
>
> **`member_field_note_events` retains ownership of member-field-only authorship and is ⛔ not
> widened.** The Events §2 crossing rule stands.
>
> **Custodial acts are owned by a custodial log**; their effects on a commitment are recorded in the
> commitment ledger as tombstones naming the mandate.
>
> ⭐ **Lane V's `practitioner_visibility_withdrawn` is superseded prospectively, explicitly, and
> without migration.** ⛔ No existing row moves; ⛔ no vocabulary narrows.

## Consequences

1. ⭐ **Attestation and member visibility withdrawal now sit in the ledger without stretching its
   name** — which is evidence the container was the right thing to settle first.
2. ⭐ **Every row must resolve `commitment_ref` to a *constituted* commitment** (Ruling 1's threshold).
   Combined with 0 rows, ⛔ no event is presently writable. Correct and honest.
3. **Two ledgers, not one.** The 57th table is justified **by subject**, ⛔ never by convenience — the
   only justification Events §1 accepts.
4. ⚠️ **Reading a member's full history requires a join across two ledgers with different visibility
   rules.** ⭐ That cost is accepted deliberately: it is the price of not collapsing two subjects into
   one table, and collapsing them is what turns history into surveillance.
5. ⭐ **Track-1 blocker 4 is settled** — the visibility-withdrawal precedent no longer forces a choice
   between violating R1 and orphaning a deployed event type.

## Unresolved implications

- 🟡 **Commitment lifecycle events** (constituted · paused · ended) — Synthesis §12 item 6. This
  ruling owns acts *within* a commitment. ⚠️ Whether the commitment's own **formation** is an event in
  its own ledger is genuinely awkward: a formation row cannot reference a `commitment_ref` that does
  not yet exist. ⛔ Unruled, and it should be ruled before the ledger is built.
- ⛔ **Cohort-audience acts have no home.** `commitment_ref` presumes a bilateral commitment; a cohort
  has no object (Ontology §9.4). Announcement remains unmappable — ⛔ unchanged by this ruling.
- 🟡 **The custodial log's own retention and erasure.** ⭐ A log that records what was erased is itself
  a record about a person. Unruled, and it is the recursion the erasure design has not yet met.
- ⛔ **Whether the two ledgers are two tables is not decided here.** See §5.

---

# 5. ⛔⛔ Where implementation would silently decide governance

⭐ Recorded per the founder's standing instruction. At each of these points this review **stopped**
rather than continuing into a solution, because the schema choice **is** the constitutional choice:

| # | The schema question | What choosing it would silently decide |
|---|---|---|
| **1** | The **granularity of a per-subject key** — per member? per commitment? per act? | ⭐⭐ **the granularity of the erasure right itself.** A per-commitment key means a member cannot erase one attestation without erasing the commitment's content; a per-act key means erasure is act-by-act. ⛔ That is Ruling 3's substance, decided by a key schema |
| **2** | Whether the commitment ledger and `member_field_note_events` are **two tables, one table with a discriminator, or a table plus a view** | ⭐ whether a member's field history and their commitment history are **separable at all** — which is the exact distinction Ruling 4 draws. A discriminator column makes them one thing that is filtered; ⛔ filtering is not a boundary |
| **3** | Where the **custodial mandate instrument** is stored, and what issues a row in it | ⭐ **issuance semantics.** A table with an `admin_id` column decides that admins issue mandates — reversing Ruling 2's *"issuer ≠ holder, founder act"* before anyone rules on it |
| **4** | Whether `commitment_ref` is **nullable** | ⭐ whether an act can exist outside a commitment. A nullable column silently readmits the un-consented act Ruling 1 refuses |
| **5** | Whether a **commitment formation event** lives in the commitment ledger | ⭐ whether a commitment is constituted *by* an act in its own ledger or *prior to* it — Ruling 4's carried question, which a self-referencing FK would answer by accident |
| **6** | Disposition of the **seven share-shaped tables** (`coach_client_shared_items` et al.) | ⭐ ⚠️ **`coach_client_shared_items` is *already governing*** — it decides how member material crosses a field boundary, encrypted, with two verifiers. ⛔ Adopting or ignoring it as part of Placement design would overturn that decision without anyone performing the act of overturning it |

⭐ **Items 1–5 are consequences of the four rulings.** ⚠️ **Item 6 is not** — it belongs to Track 3
and is recorded here only because it is the disposition most likely to be made silently first.

---

# 6. What this document does not do

⛔ Rule anything — every section above is a **recommendation for a founder act** · ⛔ redesign
publishing, ontology, permissions, or rendering · ⛔ propose schema, migrations, or tables ·
⛔ solve identity linkage (12 of 13 relationships name no member) · ⛔ solve the eligible-Work corpus
(0 of 2228 ratified) · ⛔ solve adoption or work lifecycle · ⛔ create an implementation plan ·
⛔ lift the ontology's implementation block · ⛔ authorize the custodial or delegation instruments it
describes · ⛔ audit `admin_role_grants` usage (named as unmeasured in Ruling 2) · ⛔ enter Track 3.

⭐ **The two empirical gates are untouched by all four rulings**, and no ruling can satisfy either:
relationships must resolve to governed members, and practitioner-authored Works must reach
`ratified`. ⭐ After these four rulings Placement **design** is constitutionally grounded; ⛔ Placement
in **use** is not.

> ⭐⭐⭐ **A completed schema is not evidence that a capability exists.**
