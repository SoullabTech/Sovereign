# Authority Substrate Map

**Status: EVIDENCE — 2026-08-09.** ⛔ No repairs. ⛔ No migrations. ⛔ Ruling 2 held. Produced under
[Founder Ruling — Dual Authority](FOUNDER_RULING_AUTHORED_MATERIAL_DUAL_AUTHORITY_2026-08-09.md).

Two parts: **(1)** the database-constraint verification the trace left open; **(2)** the substrate map
over the six observed idioms and the ten `unresolved-rule` routes.

---

# PART 1 — Database-constraint verification

⭐ **Question:** does a database constraint prove the application-level finding in
[trace §4](STUDIO_AUTHORITY_PROPAGATION_TRACE_2026-08-09.md) materially incomplete?

📌 **Measured directly against production**, read-only, `maia_consciousness` on `minisforum`,
**2026-08-09.**

| Table | FK on `client_id` | FK on `practitioner_id` | Any composite `(practitioner_id, client_id)` |
|---|---|---|---|
| `studio_practitioner_observations` | ⛔⛔ **NONE** | ⛔⛔ **NONE** | ⛔ none |
| `studio_field_signals` | ⛔⛔ **NONE** | ⛔⛔ **NONE** | ⛔ none |
| `session_occupancy_ratings` | ⛔⛔ **NONE** | ⛔⛔ **NONE** | ⛔ none |
| `studio_protocol_assignments` | ⚠️ `→ practitioner_clients(id) ON DELETE SET NULL` | ⛔ none | ⛔ none |
| `studio_changes` | ⚠️ `→ practitioner_clients(id) ON DELETE SET NULL` · `member_id → members(id) ON DELETE CASCADE` · `CHECK (practitioner_id IS NOT NULL OR member_id IS NOT NULL)` | ⚠️ `→ practitioners(id)` | ⛔ none |

## ⭐⭐⭐ Verdict

> ⭐⭐⭐ **The database evidence does NOT weaken the finding. It STRENGTHENS it.**

1. ⛔⛔ **Three of the five tables have no foreign key on `client_id` at all** — nor on
   `practitioner_id`. ⭐ A caller-supplied `clientId` in those paths need not reference **any real
   client**; it is an unvalidated UUID persisted as a person-reference.
2. ⚠️ The two FKs that **do** exist prove only that the referenced row **exists**. ⛔ They prove
   **nothing about whose it is** — `ON DELETE SET NULL` on a foreign practitioner's client would
   silently null the reference rather than refuse the write.
3. ⛔⛔ **No constraint anywhere binds `client_id` to the acting practitioner.**

⭐ `studio_changes.chk_change_owner` (`practitioner_id IS NOT NULL OR member_id IS NOT NULL`) is an
**ownership** check — ⛔ it constrains *whose object it is*, ⛔ never *whom it may concern*. ⭐ It is
the ownership/authority conflation of the dual-authority ruling, ⛔ expressed in a CHECK constraint.

> ⭐⭐⭐ **The five routes stand as confirmed authority defects.** ⛔ Not repaired — per founder hold,
> five separate patches would create a **seventh authority idiom**.

---

# PART 2 — The substrate map

⭐ Columns per founder specification:
**actor · owned object · person/subject referenced · act · current authority predicate · candidate
authority substrate · confidence · unresolved founder question.**

⚠️ **"Candidate substrate" is a hypothesis for founder consideration, ⛔ never a proposal to
implement.**

## A. ⛔ Confirmed defects — substrate absent entirely

| Route | Actor | Owned object | Subject | Act | Current predicate | Candidate substrate | Confidence | Question |
|---|---|---|---|---|---|---|---|---|
| `practitioner-observations` POST | practitioner | observation | ⛔ arbitrary `client_id` | write claim about a person | ⛔ **none** | practitioner-client administration ⭐ **if demonstrated from semantics** | ⭐ **high** (app + DB) | ⛔ is admin stewardship sufficient to author *about* a person? |
| `field-signals` POST | practitioner | signal | ⛔ arbitrary `client_id` | write observation of a person's field | ⛔ **none** | same | ⭐ high | same |
| `occupancy-ratings` POST | practitioner | rating | ⛔ arbitrary `client_id` | rate a session with a person | ⛔ **none** | same | ⭐ high | same |
| `protocol-assignments` POST | practitioner | assignment | ⛔ arbitrary `client_id` | assign practice **to** a person | ⛔ **none** (FK exists, ⛔ not owner-bound) | ⚠️ *to* a person ≠ *about* — may need **uptake/consent** | ⭐ high | ⛔ may a protocol be assigned without the person's act? |
| `changes` POST | practitioner | change | ⛔ `client_id`/`member_id` from query string | bind a person to a change | ⛔ **none** | mixed-row semantics | ⭐ high | ⛔ what authority binds `member_id` to a practitioner object? |

⭐ **Common shape:** ⛔ the person-reference has **no substrate at all** — ⛔ not even the contact
record. ⭐ These are decided by the already-ratified invariant.

## B. ⛔ `unresolved-rule` — substrate plausibly exists but is unruled

| Route | Actor | Owned object | Subject | Act | Current predicate | Candidate substrate | Confidence | Question |
|---|---|---|---|---|---|---|---|---|
| `encounters` POST | facilitator | encounter | participant `member_id` | bind participant | team scope only | ⭐ **encounter participation** | ⚠️ medium | ⛔ is participation its own authority form? |
| `encounters/[id]/threshold` | facilitator | encounter | participants | read participants · record threshold | encounter ownership | ⭐ **participation + `encounter_consent_events`** | ⚠️ medium | ⛔ does ownership of an encounter authorize reading who is in it? |
| `encounters/[id]/chat` | facilitator | transcript | participants | read·write co-produced material | encounter ownership | participation | ⚠️ medium | ⛔ who governs **jointly produced** material? |
| `encounters/[id]/transcript` · `moments` · `moments/extract` | facilitator | transcript/moments | participants | read · extract · interpret | encounter ownership | participation ⚠️ + **extraction may exceed it** | ⚠️ medium | ⛔ does *extracting interpretation* require more than presence? |
| `protocols` · `[id]` · `observations` | practitioner | protocol | `member_id` | author · revise · observe | ownership + contact record | ⚠️ **dual** (ruled) — ⛔ relational axis unnamed | ⭐ high on defect · ⚠️ low on remedy | ⛔ which substrate supplies the relational axis? |
| `protocols/[id]/council` | practitioner | council output | `member_id` (indirect) | generate about a person | ownership | inherits protocol | ⚠️ medium | ⛔ inherits the protocol question |
| `clients/[id]/notes` | practitioner | note | `client_id` | author about a person | ⭐ `assertClientOwned` | practitioner-client administration | ⚠️ medium | ⛔ **is admin stewardship enough to author about someone?** |
| `clients/[id]/patterns` | practitioner | — | `member_id` | ⛔ **read member's patterns** | ⛔ contact record | ⛔ **⚠️ reading a member's own material is not authoring** | ⭐ **high** | ⛔ what authorizes reading material the **member** owns? |
| `voice-notes/[noteId]/audio` | practitioner | recording | `client_id` | ⭐ **stream media** | ownership | ⚠️ depends: practitioner's artifact vs. capture **of** the person | ⚠️ medium | ⛔ does person-scoped media need more than ownership? |
| `field/attention` · `pulse` | practitioner | attention/aggregate | indirect, via `studio_changes` | aggregate · display | ownership + team | ⚠️ **composition** — team authority over person-bearing inputs | ⚠️ **low** | ⛔ may a team surface aggregate person-bearing rows? |

⚠️ **`clients/[id]/patterns` is the sharpest of these:** the other rows concern material the
**practitioner authored**. ⭐ This one **reads material about the member that the member did not give
the practitioner** — ⛔ the dual-authority ruling's ownership axis does not even apply, because the
practitioner is ⛔ not the author.

## C. ✅ Substrate present and sufficient

| Route | Actor | Substrate | Act | Confidence |
|---|---|---|---|---|
| `team/channels/[id]/decisions` | member | ⭐ **team/channel membership** (`requireChannelAccess`) | read·write in a shared space | ⭐ **high** — exemplar |
| `field` · `field/[id]` | member (as practitioner) | ⭐ **self** (`member_id = identity.memberId`) | own material | ⭐ high |
| `field/notes` · `events` · `people` · `attention/[id]` | practitioner | ⭐ **team** (`practitioner_id` + `team_id`, ⛔ no person columns) | team-owned work | ⭐ high |
| `availability` · `modules` · `profile` | practitioner | ⭐ **authorship/ownership** | own practice objects | ⭐ high |
| `scheduled-sends/[id]` DELETE | practitioner | ⭐ **authorship** | ⭐ withdraw one's **own** pending act | ⭐ high |
| `pattern-ledger` | — | ⭐ **containment refusal** | ⛔ none | ⭐ high — ⭐ **stays fail-closed** |

## D. The six idioms, mapped to substrate

| Idiom | Substrate it actually encodes | Legitimate for | ⛔ Insufficient for |
|---|---|---|---|
| **I** ownership predicate on reads | authorship | practitioner's own objects | ⛔ person-reference inside them |
| **II** `assert-client-owned` | practitioner-client **administration** | ⚠️ administrative acts — ⛔ scope unruled | ⛔ constituted relational authority (Ruling 1) |
| **III** ⛔ no validation | ⛔⛔ **nothing** | ⛔ nothing | ⛔ everything — Part 1 |
| **IV** member-first (`requireChannelAccess`) | team/channel membership | shared team spaces | ⛔ practitioner-client acts |
| **V** containment refusal | ⭐ absence of any established substrate | ⭐ fail-closed holding | — |
| **VI** PHI accessor | ⭐ **confidentiality** — ⛔ orthogonal | how information is handled | ⛔ **whether the claim may exist or be read** |

> ⭐⭐⭐ **Five axes, per the ruling: Identity · Ownership · Relationship/participation · Consent ·
> Confidentiality.** ⭐ Studio currently implements **Identity** (well), **Ownership** (well), and
> **Confidentiality** (for encounters). ⛔ **Relationship/participation is implemented only in the
> team/channel idiom.** ⛔ **Consent is implemented nowhere in Studio** — it exists only in the
> `relationship_spaces` consent path, which ⛔ no Studio route consults.

---

## E. ⛔ Questions carried to the founder

1. ⛔ **Is practitioner-client administration a sufficient relational substrate for authoring material
   *about* a person** — and if so, for which acts? ⭐ Governs group A's remedy and `clients/[id]/notes`.
2. ⛔ **Is encounter participation an independent authority form?** ⭐ If yes, `encounters/*` is
   governed by participation + consent events, ⛔ not by client administration.
3. ⛔ **Does extracting interpretation from jointly-produced material exceed participation?**
4. ⛔ **What authorizes *reading* material the member owns** (`clients/[id]/patterns`) — ⭐ where the
   ownership axis does not apply at all?
5. ⛔ **Is assigning a protocol *to* a person a different act from authoring *about* one** — ⭐ and does
   it require the person's uptake?
6. ⛔ **May a team-scoped surface aggregate person-bearing rows** (`field/attention`, `pulse`)?
7. ⛔ **What authority is required to send *to* a person?** ⭐ Cancellation is conformant; ⛔ the
   creating path remains untraced.

⛔ **No repairs. No migrations. Ruling 2 remains held.**
