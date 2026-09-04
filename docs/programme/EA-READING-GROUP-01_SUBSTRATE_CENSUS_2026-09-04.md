# EA-READING-GROUP-01 — Substrate Census

**Date**: 2026-09-04 · **Lane**: `EA-READING-GROUP-01` (INSTANCE OPEN)
**Kind**: evidence census + substrate ruling. Configures nothing; builds nothing.
**Method**: canonical file presence, schema, importer count and route presence — never intention.
**Canonical at census**: `40532a5a5` (clean-main-no-secrets) + this branch.

The lane's first question is narrow and answerable: **can Andrea host a real reading group on what
already exists, and where exactly does the existing substrate stop?**

---

## 1. Answer

**Yes — substantially.** The group-shaped substrate the instance needs already exists and is
closer to a reading group than expected: membership, a typed facilitator role, token invitations
with revocation, per-member consent, explicit sharing with summary/full-text modes and revocation,
and a one-open-question-at-a-time inquiry primitive with typed member responses.

Four gaps are real (§6). None of them is *"we need a group primitive."*

## 2. Substrate ruling

> **The Elemental Alchemy Reading Group is configured on Circles (`lib/circles`), not on
> `client_groups` (`app/api/studio/groups`).**

Two group-shaped substrates exist on canonical. They are not interchangeable:

| | **Circles** | **client_groups** |
|---|---|---|
| Migration | `20260213000004_circles_commons.sql` + `20260402100001_circle_living_fields.sql` | `20260202300001_client_groups.sql` |
| Tenancy | member-scoped | **practitioner-scoped** (`getPractitionerIdForMember`) |
| Roles | `member · helper · facilitator` | client roster |
| Consent | `consent_mode` per membership | not modeled |
| Sharing | `shared_artifacts`, `summary_only \| full_text`, revocable | not modeled |
| Group shape | not predetermined | **`group_type ∈ cohort · ongoing · program · category`** |
| Member-facing UI | `app/commons/circles/**` | `app/studio/groups/**` (practitioner-facing) |

Three reasons Circles wins, in order of weight:

1. **Consent and sharing are modeled; in `client_groups` they are not.** Constraints C3 and C4 are
   satisfiable by configuration on Circles and would require inventing infrastructure on
   `client_groups` — which the lane boundary forbids.
2. **`client_groups` is practitioner-scoped.** A reading group is not a clinical caseload. Using it
   would place readers in a practitioner's client roster, which is the wrong relational frame and
   the wrong permission model.
3. **`client_groups` already answers the club/cohort question** with a `group_type` enum. Lane §7a
   holds that question open on purpose. Adopting the enum would fossilize the answer before the
   discovery.

⛔ This ruling does not deprecate `client_groups`. It is the right substrate for practitioner
caseloads. Which of the two is canonical *in general* is **not** this lane's question and is not
answered here.

## 3. Circles — what exists, verbatim from schema

```text
circles                    id · created_by · name · description
                           visibility  ∈ invite_only | open        (default invite_only)
                           invite_enabled

circle_memberships         circle_id · member_id
                           role         ∈ member | helper | facilitator
                           status       ∈ active | left | removed
                           consent_mode ∈ manual | not_now
                           consented_at

circle_invites             token (unique) · created_by · revoked_at

shared_artifacts           circle_id · shared_by · artifact_type · artifact_ref
                           content_mode ∈ summary_only | full_text
                           shared_title · shared_summary · shared_text · revoked_at
                           -- "wrapper only, not raw private objects"
                           -- revoked_at: "removed from feed. Original source item untouched."

circle_inquiries           question · status ∈ open | closed | integrating
                           -- "One active inquiry at a time per circle."

circle_inquiry_responses   response_type ∈ reflection | witness | offering
                           -- "One response per member per inquiry. Prevents thread collapse."
```

Derived state: `FieldPhase ∈ forming | active | integrating | quiet` (`lib/circles/types.ts`).

Routes on canonical (~16 under `app/api/circles/**`): create/list, detail, members, invite, join,
leave, consent, feed, shared + revoke, pulse, pulse-summary, inquiries + respond + close.
Member-facing UI: `app/commons/circles/page.tsx`, `app/commons/circles/[circleId]/page.tsx`,
`components/circles/CircleInquiry.tsx`.

## 4. How the reading group maps onto it — configuration, not construction

| Reading-group need | Existing mechanism | Verdict |
|---|---|---|
| The group | `circles` row, `visibility=invite_only` | configure |
| Andrea as host | `circle_memberships.role = 'facilitator'` | configure |
| Host may open the gathering's question; members may not | `canOpenInquiry = role ∈ helper \| facilitator` (already enforced in UI **and** route) | configure |
| A gathering's prompt | `circle_inquiries.question`, one open at a time | configure |
| A member's reflection on a passage | `circle_inquiry_responses`, `response_type='reflection'` | configure |
| Witnessing another reader without advising | `response_type='witness'` | configure |
| Reflection private by default; sharing is a member act (C3) | member writes their own response; nothing is auto-published | satisfied |
| Host cannot read unshared material (C4) | `shared_artifacts` is a wrapper; source object untouched | satisfied |
| Un-share later | `shared_artifacts.revoked_at` | satisfied |
| Sharing a journal entry or passage into the group | `artifact_type` / `artifact_ref` are free-form `TEXT` | configure |
| Invitation | `circle_invites` token, revocable | configure |
| Leaving without deletion | `status='left'` | configure |
| No cross-member synthesis (C2) | no aggregation exists to disable | satisfied by absence |

**The strongest finding**: `circle_inquiries` + `circle_inquiry_responses` is, structurally, a
hosted reading-group gathering — one question, held open, one response per member, typed as
reflection/witness/offering, with no thread collapse. That primitive was not built for this and
fits it closely. It should be used as-is before anything is proposed.

## 5. The Work — Elemental Alchemy

```text
app/api/_backend/data/founder-knowledge/elemental-alchemy-full.json
  content.preface        17,196 chars
  content.introduction   51,709 chars
  content.chapters       10
  content.appendix    2,800,018 chars
```

Member-facing surfaces on canonical: `app/maia/community/elemental-alchemy/{page,reader,practices,
journal,assessment}`, API `{list,ask,journal}`, components `{BookChat,AskMaiaSheet}`. The journal
route derives member identity server-side from a verified session (`getMemberIdFromRequest`);
client-supplied `userId` is never trusted.

A reading sequence through 10 chapters + preface + introduction is a **content configuration**, not
a schema change.

## 6. Gaps — classified per lane §5

| # | Gap | Class | Disposition |
|---|---|---|---|
| G1 | No binding between a circle and a Work. A circle has `name` + `description` only; nothing says *this group is reading this*. | **Missing generic Reading Room behavior** | Record. For the instance, carry it in the description and the gathering questions. Do **not** add a `work_id` column in this lane. |
| G2 | No passage/position addressing. A gathering's question cannot cite "chapter 4" structurally. | **Missing generic Reading Room behavior** | Record. Instance carries the reference in the question text. |
| G3 | `visibility ∈ invite_only \| open` has no shape semantics — nothing distinguishes a cohort from a club. | **Open discovery question — lane §7a** | **Do not resolve.** Observe what the group actually does. |
| G4 | Circles UI lives at `app/commons/circles`, the EA reading surfaces at `app/maia/community/elemental-alchemy`. A reader crosses between two places. | **Missing generic Reading Room behavior** (discovery question 5: *where does discussion naturally want to live?*) | Record. Observe before designing a joined surface. |

None classifies as `STOP`. No new group primitive is required to run this group.

## 7. Not established by this census

- Whether any Circle is **live under member load** in production. File and route presence is not
  liveness; no runtime evidence was collected. Claim discipline: **Live (substrate)**, not Live.
- Whether the Co-Lab boundary gate passes with a reading-group configuration present (owed, §8 of
  the lane).
- Whether `client_groups` or `circles` is canonical in general (out of scope, §2).
- Whether Andrea's facilitation material may be generalized (provenance, unestablished).

## 8. Next executable step in the lane

A **configuration decision record**: the concrete Elemental Alchemy Reading Group configuration —
circle identity, Andrea's facilitator membership, Kelly's recorded role (C6), the reading sequence,
the gathering question shape, and which shape (§7a) the first group is *observed* to take rather
than declared to be. Written before anything is created, and it creates nothing by itself.
