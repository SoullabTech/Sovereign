# Boundary-Crossing Acts — Trace

**Status: EVIDENCE — 2026-08-09.** ⛔ No repairs · ⛔ no code · ⛔ no schema · ⛔ Ruling 2 held.
⛔ `assertClientOwned()` was **not** applied to `clients/[id]/patterns`, per founder direction.

⭐ Analytical act vocabulary used here — ⛔ **not canonical**, per founder:
`author-about` · `read-about` · `assign-to` · `disclose-to` · `send-to` · `act-on`.

⭐ Axis notation (five axes, ⛔ **not five mandatory checks** — dimensions from which an act's
predicate is *composed*): **ID**entity · **OWN**ership · **REL**ationship/participation ·
**CON**sent · **CONF**identiality.

---

# Trace 1 — `clients/[id]/patterns` · `read-about`

> ⭐⭐⭐ **The practitioner did not author this material. Ownership provides zero authority.**

## Call path

```text
GET /api/studio/clients/[id]/patterns
  → getCurrentPractitioner()            ← member-first; returns { memberId, practitionerId }
  → getClientMemberId(memberId, practitionerId)
        SELECT member_id FROM practitioner_clients WHERE member_id=$1 AND practitioner_id=$2
  → getPatternsForClient(memberId, practitionerId)      [lib/patterns/getMemberPatterns.ts:44]
        SELECT … FROM member_patterns WHERE member_id=$1 AND practitioner_id=$2
```

## ⭐⭐⭐ The decisive finding — asymmetric epistemic exposure

| Reader | Predicate | Statuses returned |
|---|---|---|
| **Practitioner** ([`:44`](../../../lib/patterns/getMemberPatterns.ts)) | `member_id = $1 AND practitioner_id = $2` | ⛔⛔ **ALL** — in-code: *"all patterns for a client (all statuses)"* |
| **The member themself** ([`:58`](../../../lib/patterns/getMemberPatterns.ts)) | `member_id = $1` | ⭐ `offered` · `confirmed` · `rejected` — in-code: *"emerging is practitioner-internal"* |

> ⛔⛔ **The practitioner can read `emerging` patterns about a member that the member has never been
> offered and cannot see.**

⭐ This is **the identical exposure** that [`pattern-ledger`](../../../app/api/studio/clients/%5Bid%5D/pattern-ledger/route.ts)
fails closed against — ⛔ the containment was applied to `pattern_ledger` and **not** to
`member_patterns`.

⚠️ **The counter-argument, stated fairly:** the in-code comment *"emerging is practitioner-internal"*
is a **design claim** that pre-offer material legitimately belongs to the practitioner's working
side — a hypothesis they have not yet put to the person. ⭐ That is a defensible position and it is
⛔ **not for this trace to decide.**

## ⭐ Provenance and epistemic status of what can be returned

| Column | Meaning |
|---|---|
| `status` | `emerging` → ⛔ pre-offer · `offered` → ⭐ crossed to the member · `confirmed` / `rejected` → ⭐ **the member's own act** |
| `confidence` | numeric — ⚠️ present on inferred material |
| `source` | `practitioner` (authored) vs `maia` (⛔ **system-inferred**) |
| `member_response` · `member_responded_at` · `member_label` | ⭐ **the member's authored response** |

⭐ A **disclosure ladder already exists in the schema**: `emerging → offered → member_response →
confirmed/rejected`, with [`/api/members/patterns/[id]/label`](../../../app/api/members/patterns/%5Bid%5D/label/route.ts)
as a member act. ⛔ **No route consults it as an authorization predicate.**

## ⚠️ Realized vs. structural

📌 **`member_patterns` has 0 rows in production** (measured 2026-08-09; `pattern_ledger` has 8).

> ⭐⭐⭐ **The exposure is structural, ⛔ not currently realized.** ⚠️ It is a live disclosure surface
> awaiting data — ⛔ which is exactly when it is cheapest to govern.

## The act

| | |
|---|---|
| **Actor** | member acting as practitioner |
| **Authority substrate** | ⛔⛔ **contact record only** (`practitioner_clients`) |
| **Subject** | the member |
| **Act** | ⭐ `read-about` |
| **Object** | member-originated + system-inferred patterns |
| **Recipient** | ⛔ none (read) |
| **Axes engaged** | ✅ **ID** · ⛔ **OWN** *(does not apply — practitioner is not the author)* · ⛔ **REL** absent · ⛔ **CON** absent · ⛔ **CONF** absent |

⛔ **Under the founder's stronger default, a practitioner-client administrative association alone does
not grant this access.** ⭐ An explicit disclosure authority would be required.

---

# Trace 2 — outbound sends · `send-to`

## Call path — creation

```text
POST /api/studio/scheduled-sends
  → recipientEmail / recipientName / subject / body / scheduled_for   ← ⛔ ALL caller-authored
  → consentConfirmed === true                                        ← ⭐ REQUIRED; route header: "the warrant"
  → INSERT INTO scheduled_sends (practitioner_id, author_member_id, recipient_email, …, consent_confirmed)
```

## Call path — delivery

```text
GET /api/cron/scheduled-sends   (Bearer CRON_SECRET)
  → SELECT … WHERE s.status='pending' AND s.consent_confirmed = true AND s.scheduled_for <= now()
  → EmailRouter.send(...) → UPDATE status='sent'
```

## ⭐⭐ Finding — a real consent axis, ⚠️ but attested, not granted

⭐ This is the **only** traced Studio act where a consent axis is **enforced at the boundary**:
`consent_confirmed = true` is required to author **and** re-checked by the worker before delivery.
⭐ In-code: *"sends ONLY what a human authored and explicitly permitted."* ⭐ **Fail-closed.**

> ⚠️⚠️ **But `consent_confirmed` is set by the practitioner, ⛔ not by the recipient.** ⭐ It is the
> **author's attestation that they have permission** — a *warrant*, ⛔ not the recipient's consent
> act. ⛔ No recipient-side record is consulted.

⭐ **Notable discipline elsewhere:** [`scheduled-sends/test`](../../../app/api/studio/scheduled-sends/test/route.ts)
restricts the recipient to **the author's own email** — in-code: *"The author's own email is the ONLY
permitted recipient"*, *"consent implicit: recipient is self."* ⭐ That is an act-scoped authority
predicate, ⛔ and it is the only one of its kind found.

📌 `session-followup/send` also gates on `consentConfirmed`.

## The act

| | |
|---|---|
| **Actor** | practitioner |
| **Substrate** | ⚠️ **self-attested warrant** (`consent_confirmed`) |
| **Subject / Recipient** | ⛔ an **arbitrary email address** — ⛔ no member, no client, no relationship referenced |
| **Act** | ⭐ `send-to` — ⛔ crosses into another person's attention |
| **Object** | practitioner-authored message |
| **Axes** | ✅ **ID** · ✅ **OWN** · ⛔ **REL** absent · ⚠️ **CON** *attested, not granted* · ⛔ **CONF** n/a |

⭐ **Cancellation** (`DELETE …/[id]`) remains ✅ conformant — ⭐ withdrawing one's own pending act.

📌 **3 rows in production.**

---

# Trace 3 — protocol assignment · `assign-to`

## Call path

```text
POST /api/studio/protocol-assignments
  → clientId | decisionId | changeId from body   ← ⛔ at least one scope required; ⛔ NO ownership check
  → INSERT INTO studio_protocol_assignments (practitioner_id, client_id, protocol_id, …)
```

## ⭐⭐⭐ Finding — the act is presently **latent**

> ⭐⭐⭐ **No member-facing surface reads `studio_protocol_assignments` or `studio_pattern_protocols`.**

⭐ Every reader is under `app/api/studio/**` plus one library
([`lib/studio/patternInquiryProtocol.ts`](../../../lib/studio/patternInquiryProtocol.ts)). ⛔ No
notification path, ⛔ no member route, ⛔ no delivery.

> ⭐⭐ **Today `assign-to` produces no obligation, visibility, notification, or behavior for the
> recipient.** ⭐ It is an **internal practitioner record that names a person**, ⛔ not yet a directed
> act **toward** them.

⚠️ **Two consequences, and they pull in opposite directions:**

1. ⭐ The founder's stronger-authority requirement for `assign-to` is presently **unexercised** — ⛔ the
   directed relationship `practitioner → protocol → recipient` does not reach the recipient.
2. ⛔⛔ **The moment any member-facing surface reads this table, `assign-to` becomes a real
   boundary-crossing act — governed by rows written today under NO authority predicate at all.**
   ⭐ `studio_protocol_assignments` already holds **2 rows**.

## The act

| | |
|---|---|
| **Actor** | practitioner |
| **Substrate** | ⛔⛔ **none** (FK proves the client row exists, ⛔ not whose it is) |
| **Subject** | client → member |
| **Act** | ⭐ `assign-to` — ⚠️ **currently latent** |
| **Object** | protocol |
| **Recipient** | ⛔ **unreached** |
| **Axes** | ✅ **ID** · ✅ **OWN** · ⛔ **REL** absent · ⛔ **CON** absent · ⛔ **CONF** n/a |

---

# Summary — which axes actually participate

| Act | Route | ID | OWN | REL | CON | CONF | Status |
|---|---|---|---|---|---|---|---|
| `read-about` | `clients/[id]/patterns` | ✅ | ⛔ n/a | ⛔ | ⛔ | ⛔ | ⛔ **disclosure authority absent** — ⚠️ structural (0 rows) |
| `send-to` | `scheduled-sends` POST | ✅ | ✅ | ⛔ | ⚠️ attested | — | ⚠️ **warrant, not recipient consent** |
| `send-to` (self) | `scheduled-sends/test` | ✅ | ✅ | ⭐ self | ⭐ implicit | — | ✅ **conformant** — ⭐ act-scoped predicate |
| delivery | `cron/scheduled-sends` | — | — | ⛔ | ✅ **enforced** | — | ⭐ fail-closed on the warrant |
| `assign-to` | `protocol-assignments` POST | ✅ | ✅ | ⛔ | ⛔ | — | ⛔ **no substrate** · ⚠️ **latent** |
| `write-about` | observations · field-signals · ratings | ✅ | ✅ | ⛔ | ⛔ | — | ⛔ **confirmed defect** (3 · 1 rows exist) |

> ⭐⭐⭐ **The founder's refinement is confirmed by the evidence: the five axes are NOT five mandatory
> checks.** ⭐ `field/notes` legitimately engages ID + OWN + team only. ⛔ What is missing is not
> "consent everywhere" — it is that **every boundary-crossing act composes its predicate from ID +
> OWN alone**, ⭐ with the single exception of the send warrant.

---

## ⛔ Questions carried to the founder

1. ⭐⭐⭐ **Is `emerging` legitimately practitioner-internal**, or is pre-offer material about a person
   already member-scoped? ⭐ The code asserts the first; ⛔ `pattern-ledger`'s containment assumes the
   second. ⛔ **Two live surfaces currently disagree.**
2. ⭐ **Is a practitioner's self-attested warrant an acceptable consent substrate for `send-to`**, or
   must a recipient-side grant exist?
3. ⭐ **Should `assign-to` be governed now, while latent** — ⛔ or at the moment a member-facing reader
   is built? ⚠️ Rows written today would be governed by whatever is decided then.
4. ⭐ **Does `send-to` need any relational substrate at all**, given the recipient is an arbitrary
   email with no member, client, or relationship reference?

## ⛔ Not done — available on request

⛔ Whether any existing row (**3** observations · **1** field signal · **2** assignments) actually
names a client belonging to a **different** practitioner. ⭐ That is a UUID-join integrity check, ⛔ not
a content read — ⛔ but it was not among the traces authorized, so it was not run.
