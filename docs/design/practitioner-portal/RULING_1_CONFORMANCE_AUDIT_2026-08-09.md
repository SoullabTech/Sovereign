# Ruling 1 — Standing Conformance Audit

**Status: EVIDENCE — 2026-08-09.** ⛔ This document repairs nothing, proposes nothing, and authorizes
nothing. It answers one question only:

> ⭐⭐⭐ **Where does the running system violate [Founder Ruling 1](FOUNDER_RULING_1_COMMITMENT_AUTHORITY_2026-08-09.md)?**

⭐ The two questions the founder directed be kept separate:

| Question | Settled by | State |
|---|---|---|
| **What is now law?** | ⭐ the founder | ✅ [Ruling 1, ratified 2026-08-09](FOUNDER_RULING_1_COMMITMENT_AUTHORITY_2026-08-09.md) |
| **Where does the running system violate it?** | ⭐ **evidence** | this document |

---

## 0. ⚠️ Evidence scope — read before citing any finding

| | |
|---|---|
| **Method** | static source read of the working tree at branch `feature/labtools-redesign` |
| **Searched** | `app/**`, `lib/**`, `components/**` for `practitioner_clients` · `relationship_spaces` · `member_id` co-occurrence and gate shape |
| ⛔ **NOT done** | ⛔ no production database query · ⛔ no runtime trace · ⛔ no audit of UI components or `lib/` services · ⛔ no execution of any route |
| ⚠️ **Consequence** | findings below are **source-shaped**, not runtime-observed. ⛔ A route that looks nonconforming may be unreachable; a route that looks conforming may be bypassed by a caller not read here |

⛔ **No finding below is a repair instruction.** Classification into *must fix* / *acceptable* /
*re-rule* is a founder act that has not occurred.

---

## 1. ⭐⭐⭐ The structural finding

> ⭐⭐⭐ **17 routes reference both `practitioner_clients` and `member_id`. ⛔ Zero of them reference
> `relationship_spaces`.**

⭐ The constituting machinery and the consuming surface are **disjoint route sets**. The Studio
surface authorizes on the **contact record**; the ratified constitutional object is consulted only by
a separate set of routes that Studio does not call.

📌 This is the finding that matters most, because it is ⛔ **not a bug in one route** — it is the
shape of the surface. Any conformance work is therefore architectural, not a patch.

⚠️ **Stated precisely:** the disjointness is *evidence of a gap*, ⛔ not itself a violation. A route
that never touches a member's material may legitimately never consult a commitment. Which of the 17
actually cross into member-scoped authority is §2.

---

## 2. ⛔ Candidate violations

⚠️ **"Candidate" is exact** — each is a source pattern that appears to derive authority over a member
from a unilaterally authored record, which Ruling 1 §2.1 prohibits. ⛔ Founder classification pending.

### 2.1 ⛔⛔ Member patterns gated by the practitioner's own contact row

**[`app/api/studio/clients/[id]/patterns/route.ts:13`](../../../app/api/studio/clients/%5Bid%5D/patterns/route.ts)**

The route's own comment states the gate: *"Verify the client (by member_id) belongs to the
practitioner."* The check is:

```sql
SELECT member_id FROM practitioner_clients WHERE member_id = $1 AND practitioner_id = $2
```

⛔ **The practitioner's access to a member's patterns is authorized by the practitioner's own
contact record.** ⭐ Under Ruling 1 that record *"confers no authority over the other party."* This is
the textbook shape the ruling names.

⚠️ Note the phrasing *"the client … belongs to the practitioner."* ⛔ Ruling 1's boundary clause is
precisely that the commitment *"does not confer ownership of … either member."*

### 2.2 ⛔ Practitioner-authored protocols attached to a member

**[`app/api/studio/protocols/route.ts:154`](../../../app/api/studio/protocols/route.ts)** ·
**[`app/api/studio/protocols/[id]/route.ts:120`](../../../app/api/studio/protocols/%5Bid%5D/route.ts)**

```sql
SELECT id FROM practitioner_clients WHERE id = $1 AND practitioner_id = $2 AND member_id = $3
```

⭐ On success the route inserts a `studio_pattern_protocols` row carrying `member_id` — a
practitioner-authored claim **attached to a member identity**, gated only by the contact record.

⚠️ **The open question this raises, ⛔ not answered here:** whether authoring a protocol *about* a
member is an act *"occurring within the shared developmental relationship"* (Ruling 1) or an act of
the practitioner's own practice that merely references a person. ⭐ The answer changes whether this is
a violation or a correctly-scoped practitioner-owned fact. ⛔ That is a ruling, not an audit finding.

---

## 3. ✅ Conforming findings

### 3.1 ⭐⭐⭐ The constituting machinery already implements the ratified threshold

| Route | Behavior | Verdict |
|---|---|---|
| [`/api/relationship-spaces/[spaceId]/consent`](../../../app/api/relationship-spaces/%5BspaceId%5D/consent/route.ts) | verifies the acting member **is** `participant_member_id` before accepting; then sets `consent_status='accepted'` **and** `status='active'` together | ✅ **bilateral by construction** — the steward cannot accept on the member's behalf |
| [`/api/join/[token]/accept`](../../../app/api/join/%5Btoken%5D/accept/route.ts) | links `participant_member_id`; in-code comment: *"status stays `invited` until consent accepted"*; refuses when the actor is the steward | ✅ **an invitation confers nothing** |
| [`/api/practitioner/practice-field/invite`](../../../app/api/practitioner/practice-field/invite/route.ts) | creates the row with `steward_member_id` + `client_email`, no participant | ✅ creates an **invitation**, ⛔ not a commitment |

⭐ **Both parties FK to `members`** in this path — consistent with the founder's amendment 3
(constitutional authority attaches to governed member identities).

### 3.2 ⭐⭐ Independent convergence in the live MAIA route

**[`app/api/sovereign/app/maia/list/route.ts:703`](../../../app/api/sovereign/app/maia/list/route.ts)**

```sql
FROM relationship_spaces rs
WHERE rs.participant_member_id = $1 AND rs.status = 'active' AND rs.consent_status = 'accepted'
```

⭐⭐⭐ **This is the ratified threshold, written before the ruling existed** — participant identified,
active, accepted. ⛔ Convergence is corroboration, ⛔ not authorization; it is recorded because it
shows the threshold is implementable and already implemented somewhere in the live path.

### 3.3 ⭐ Direction matters — the member reading their own material

**[`app/api/now-what/home/route.ts:226`](../../../app/api/now-what/home/route.ts)**

Joins `sessions → practitioner_clients ON pc.member_id = $1` where `$1` **is the member themself**.

✅ ⛔ **No authority over another party is derived** — the member is the subject, reading their own
schedule, with an explicit safe-fields-only comment. ⭐ Ruling 1 governs authority *over* a member;
it does not forbid a contact record from serving as a **join path** for a member's own data.

⚠️ **Recorded as coupling, ⛔ not violation:** a member-facing surface is load-bearing on a
practitioner-authored table. If that table's disposition ever changes, this surface breaks.

### 3.4 ⭐⭐ Already contained, in anticipation of this ruling

**[`app/api/studio/clients/[id]/pattern-ledger/route.ts:27`](../../../app/api/studio/clients/%5Bid%5D/pattern-ledger/route.ts)**

The route **fails closed before the read**, with an in-code rationale: *`pattern_ledger` holds
system-INFERRED claims about the member, including `status='emerging'` rows the member has never been
offered … Surfacing them here puts the practitioner upstream of the member's own recognition* — and
it names *"the coming authority ruling"* as the condition for reopening.

⭐ That ruling has now been made. ⛔ **This audit does not reopen it.** The containment is correct
under Ruling 1 and should be **re-read against the ratified text** as its own act.

---

## 4. ⚠️ A question the audit surfaced that Ruling 1 does not settle

⛔⛔ **CORRECTION, 2026-08-09 — this section as first written was wrong about the direction of the
auth path, and the error favored the wrong conclusion.** It is corrected here rather than deleted,
because the audit is an evidence record.

⛔ **What this section originally claimed:** that `getCurrentPractitioner()` *"yields a `practitionerId`,
not a member id"*, and that member identity resolves *"in two hops, through the profile."*

⭐ **What the source actually shows** ([`lib/auth/getCurrentPractitioner.ts:31`](../../../lib/auth/getCurrentPractitioner.ts)):
the function **begins from the member identity** — `getMemberIdFromRequest(request)` — and looks the
profile up *from* it (`WHERE p.member_id = $1 AND p.status = 'active'`). The returned
`PractitionerIdentity` carries **both** `memberId` and `practitionerId`.

> ⭐⭐⭐ **The auth layer already resolves member-first.** ⛔ The gap is not authentication. It is that
> routes then evaluate the relationship using `identity.practitionerId` against `practitioner_clients`
> — **discarding the member identity they are already holding.**

📌 The bridge question this raises is taken up in full, with production constraint evidence, in
[`IDENTITY_TO_AUTHORITY_BRIDGE_2026-08-09.md`](IDENTITY_TO_AUTHORITY_BRIDGE_2026-08-09.md). ⛔ Not
ruled here.

---

## 5. ⛔ What this audit did not cover

- ⛔ `lib/**` services and `components/**` — only `app/api/**` gate shapes were read.
- ⛔ Any runtime or production-data verification of the 17 routes' reachability.
- ⛔ The remaining Studio routes that touch `practitioner_clients` **without** `member_id` (bookings,
  calendar, groups, decisions, changes, imports) — they may be pure practitioner-own-practice
  surfaces, ⭐ but that was **assumed from the absence of `member_id`, ⛔ not verified**.
- ⛔ Whether any **non-conforming write has already occurred** in production under the pre-ruling
  behavior. ⚠️ Ruling 1 is new law; ⛔ this audit makes no claim about the status of facts written
  before it.

---

## 6. Summary

| Class | Count | Items |
|---|---|---|
| ⛔ **Candidate violation** | **2** | member patterns gate (§2.1) · member-attached protocols (§2.2) |
| ✅ **Conforming** | **5** | consent · join/accept · invite · MAIA threshold read · member-own-data join |
| ⭐ **Already contained** | **1** | pattern-ledger fail-closed (§3.4) |
| ⚠️ **Surfaced, unruled** | **1** | profile-keyed auth vs member-keyed constitution (§4) |
| ⛔ **Structural** | **1** | 17 routes on the contact record, 0 consulting the commitment (§1) |

⛔ **No repair has been made or proposed.** ⭐ The next act is the founder's: classify §2.1 and §2.2,
then decide whether §4 is ruled now or carried into Ruling 2.
