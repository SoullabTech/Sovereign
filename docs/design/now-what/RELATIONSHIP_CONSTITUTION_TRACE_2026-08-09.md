# Relationship Constitution Trace — Evidence Record

**Date:** 2026-08-09
**Authorization:** Founder, 2026-08-09 — R-Q1a ratified; §8.4 authorized as the critical path. **Gate before any My Coaching work.**
**Governing canon:** [`FOUNDER_RULING_1_COMMITMENT_AUTHORITY_2026-08-09.md`](../practitioner-portal/FOUNDER_RULING_1_COMMITMENT_AUTHORITY_2026-08-09.md)
**Baseline:** `origin/clean-main-no-secrets @ ced4ab513`. Production `b1399f693`.
**Evidence:** executable path followed line by line; **read-only** production schema + aggregate counts (no PHI, no row content).
**Status:** TRACE ONLY — no repair performed.

---

## RATIFIED PRINCIPLE GOVERNING THIS TRACE

> **A contact can exist unilaterally. A relationship cannot.**

`practitioner_clients` may own administrative facts — roster, billing, CRM metadata, invitations, preparation for relationship. `relationship_spaces` is the constitutional referent for the existence, consent, scope and state of the relationship itself. **No migration, backfill, inference, convenience join, or product fallback may promote the former into the latter.**

The type distinction being established:

```
contact  ≠  client record  ≠  invitation  ≠  interaction  ≠  commitment  ≠  relationship
```

Connectable. Never collapsible.

---

## 1. VERDICT

**The pathway is complete, reachable, and constitutionally sound. It has never been exercised past its first precondition.**

Against the founder's classification list:

| Candidate explanation | Verdict |
| --- | --- |
| pathway never exercised | ✅ **THIS** — blocked at gate 0 |
| pathway unreachable | ❌ refuted — both UIs are mounted on canonical trunk |
| pathway incomplete | ⚠️ **partially** — the *forward* path is complete; **revocation and ending are absent** (§5) |
| pathway defective | ❌ no defect found in the forward path |
| pathway superseded | ❌ no competing constitution mechanism exists |
| data written elsewhere | ❌ no other table holds constituted relationships |
| constitution delayed to a later act | ❌ the constitutive act is identified and immediate (§3) |

**The founder's hypothesis is confirmed: the architecture correctly contained the concept; the application never completed the ceremony.** This is not a broken subsystem. It is an unstarted one.

---

## 2. THE EXECUTABLE LIFECYCLE

Followed through actual code, not route names.

```
GATE 0   practice_fields.status must be 'live'
         lib/practiceField/practiceFieldService.ts:124
           status = readiness.is_live ? 'live' : 'pending'
         UI: components/maia/practice-field/PracticeFieldEditor.tsx
             mounted at app/maia/vision-studio/page.tsx:51
                    ⛔ PRODUCTION: 2 practice_fields, BOTH 'pending'
                    ⇓  invite refuses 422 — the ceremony cannot begin
─────────────────────────────────────────────────────────────────────
STEP 1   POST /api/practitioner/practice-field/invite       [practitioner act]
         · requires authenticated member
         · refuses if field missing (422) or status='pending' (422)
         · refuses duplicate live invite for (steward, email) → 409
         · INSERT relationship_spaces
             steward_member_id      = memberId        ← a MEMBER, not a profile
             participant_member_id  = NULL
             client_email           = <email>
             status                 = 'invited'
             consent_status         = 'pending'
             created_from           = 'invite'
             invite_token           = 24 random bytes, 30-day expiry
         · createSnapshot(field.id, spaceId)  — formation record, immutable
         · sends email
         ⇒ ROW EXISTS. ⛔ NOT A COMMITMENT.
─────────────────────────────────────────────────────────────────────
STEP 2   GET /api/join/[token]                              [public read]
         · no auth; validates token, archived (410), expiry (410)
         · returns practitioner_display_name, welcome_message, already_member
         · UI: app/join/[token]/page.tsx
─────────────────────────────────────────────────────────────────────
STEP 3   member registers or signs in                       [member identity act]
         /api/members/register  or  /api/members/signin
         ⇒ the participant becomes a governed member identity
─────────────────────────────────────────────────────────────────────
STEP 4   POST /api/join/[token]/accept                      [member act]
         · requires authenticated member
         · refuses steward accepting own invitation (400)
         · refuses if already claimed by another member (409)
         · refuses expired (410)
         · UPDATE participant_member_id = memberId, client_email = NULL
           guarded: WHERE participant_member_id IS NULL OR = $2
         · comment, verbatim: "status stays 'invited' until consent accepted"
         ⇒ BOTH PARTIES IDENTIFIED. ⛔ STILL NOT A COMMITMENT.
─────────────────────────────────────────────────────────────────────
STEP 5   GET  /api/relationship-spaces/[spaceId]/threshold  [member reads terms]
         UI: app/relationship/[spaceId]/threshold/page.tsx
─────────────────────────────────────────────────────────────────────
STEP 6   POST /api/relationship-spaces/[spaceId]/consent    [★ CONSTITUTIVE ACT]
         · requires authenticated member
         · requires participant_member_id === memberId, else 403
         · idempotent: already accepted → {already_accepted:true}
         · UPDATE consent_status='accepted', consent_accepted_at=NOW(),
                  consent_items=$2, status='active'
         ⇒ ★ THE RELATIONSHIP IS NOW CONSTITUTIONALLY REAL ★
```

### 2.1 The authoritative transition

**`POST /api/relationship-spaces/[spaceId]/consent`, performed by the authenticated participant, is the single act at which a relationship becomes constitutionally real.** Before it, every artifact is preparation. After it, Ruling 1's three-part test is satisfiable:

```sql
participant_member_id IS NOT NULL AND status = 'active' AND consent_status = 'accepted'
```

**Does the transition work?** No defect found by inspection. **Never executed in production** — unverifiable by observation. Claimed as *sound by reading*, **not** as *proven by running*.

---

## 3. CONFORMANCE WITH FOUNDER RULING 1

| Requirement | Verdict | Evidence |
| --- | --- | --- |
| Bilateral between **two governed member identities** | ✅ | `steward_member_id` and `participant_member_id` both → `members` |
| A practitioner profile is **not** a separate constitutional person | ✅ | steward is the member id; the route reads `members` for display name only. `practitioners` is never the party. |
| Both participants identified | ✅ | `participant_member_id` NOT NULL required |
| Active lifecycle state | ✅ | `status='active'` |
| Consent a state **distinct from lifecycle** | ⚠️ | distinct *columns*, **one act** — see §5.1 |
| A record authored by one party alone does not constitute | ✅ | invite yields `invited`/`pending`/participant NULL |
| No conversion of contact/roster/invitation into commitment by migration or inference | ✅ | no route performs it; no backfill exists |
| Neither party may unilaterally assert mutual relationship | ✅ | steward cannot self-accept (400); consent requires participant identity (403) |

**The forward path is conformant.** Notably, the schema comment at `20260630000008_member_relationships.sql:39-42` — *"practitioner_clients owns billing/roster; relationship_spaces owns consent/relational scope · Nullable, non-authorizing, non-cascading"* — **predates Ruling 1 and already states it.**

---

## 4. WHY PRODUCTION HAS ZERO ROWS

Measured 2026-08-09, read-only:

| Measure | Value |
| --- | --- |
| `practice_fields` | **2 rows — both `pending`** |
| `practice_field_snapshots` | 0 |
| `relationship_spaces` | **0** |
| constituted commitments | **0** |
| `relationship_space_messages` | 0 |
| `practitioners` (with `member_id`) | 18 (18) |
| `members` | 87 |

**Causal chain — single blocking condition:**

```
No practitioner has completed a Practice Field to 'live'
   → getPracticeField().status === 'pending'
   → POST /invite returns 422 before any INSERT
   → no relationship_spaces row is ever created
   → no invite token exists to accept
   → no participant is ever identified
   → no consent can be given
   → 0 constituted commitments
   → My Coaching is empty  ✅ correctly
```

**Both doors are mounted on canonical trunk**, so this is not an access problem:

| Side | Surface | On trunk? |
| --- | --- | --- |
| Practitioner | `PracticeFieldEditor` → `app/maia/vision-studio/page.tsx:51` | ✅ |
| Member | `app/join/[token]/page.tsx` | ✅ |
| Member | `app/relationship/[spaceId]/threshold/page.tsx` | ✅ |

**Cross-reference to Ruling 2 (R2 salvage):** the branch-only `/now-what/admin` **also mounts `PracticeFieldEditor`** (`app/now-what/admin/page.tsx:207`). It is a *second door to the practitioner ceremony*. That is directly material to the R2 disposition and should be carried into that trace — it may be the strongest argument that "admin" in fact means practitioner stewardship.

---

## 5. GAPS — WHERE THE PATHWAY IS INCOMPLETE

### 5.1 Consent and lifecycle are set by one act ⚠️

The consent route sets `consent_status='accepted'` **and** `status='active'` in a single `UPDATE`.

Ruling 1 requires consent be *"explicitly accepted as a state distinct from relationship lifecycle."* They are distinct **columns**, and both conditions are genuinely satisfied by a member act — so this is **not a violation of the letter**. But they are not distinct **acts**, which has two consequences: the system cannot represent *consent accepted, relationship paused*; and any future "pause" or "resume" must be built so it never implies a consent transition. **Recommendation: keep the columns independent in every future write. Do not add a code path that sets one from the other.**

### 5.2 Consent cannot be declined or withdrawn ⛔ — the material gap

`consent_status` permits `'declined'` and `'withdrawn'`. **No code path writes either value.** Likewise `status='archived'` is never written, and `'paused'` is never written.

**Consent that cannot be withdrawn is weaker than consent.** This is a genuine constitutional gap, not a feature request: the schema anticipated revocation and the application never implemented it. It is the one part of the pathway I would call *incomplete* rather than *unstarted*.

### 5.3 No relationship ending

No route archives or ends a relationship. Combined with 5.2, the constitution is currently **one-way**: constitutable, not dissolvable.

---

## 6. WHERE ADMINISTRATIVE RECORDS ARE MISTAKEN FOR RELATIONSHIP TRUTH

Every surface currently claiming relationship state, classified:

| Surface | Reads | Verdict |
| --- | --- | --- |
| `app/api/sovereign/app/maia/list/route.ts:708` | `relationship_spaces` — `participant_member_id = $1 AND status='active' AND consent_status='accepted'` | ✅ **CONFORMANT EXEMPLAR.** The full three-part test, written correctly. Use as the reference pattern. |
| `app/api/relationship-spaces/[spaceId]/consent` | participant identity check | ✅ conformant |
| `app/api/join/[token]/accept` | steward/participant/expiry checks | ✅ conformant |
| **`app/api/now-what/home/route.ts`** — coach name | `practitioner_clients` + wrong join to `members.id` | ⛔ **CATEGORY ERROR.** Derives a relational fact ("who is my coach") from a unilaterally authored record. Prohibited by Ruling 1. |
| **`app/api/now-what/home/route.ts`** — upcoming sessions | `sessions JOIN practitioner_clients ON pc.member_id = $1` | ⛔ **CATEGORY ERROR.** Session visibility gated on contact-record association, not on a commitment. |
| **`app/now-what/coaching/page.tsx`** | renders the above | ⛔ inherits the error |
| **`app/api/member/portal/route.ts:26`** | `relationship_spaces` — `status IN ('active','invited')` | ⚠️ **NEEDS REVIEW.** Surfacing an `invited` space may be legitimate (showing a pending invitation) but it must never be *narrated* as a constituted relationship. Verify the rendering, not just the query. |
| `app/api/portal/[slug]/*` | `portal_email` / `portal_password_hash` | ⚠️ frozen legacy shadow auth (R-Q1a.5) |
| `practitioner_clients.relationship_status`, `_started_at`, `_ended_at`, `intended_scope`, `linked_at` | — | ✅ **ZERO code readers or writers.** Grep across `app`, `lib`, `scripts`, `database` returns nothing. Clean deprecation target. |

### 6.1 Competing sources of relational state — inventory

1. **`relationship_spaces`** — the authoritative referent. ✅
2. **`practitioner_clients` + `member_id`** — administrative; **currently mistaken for authority** in `/api/now-what/home`. ⛔
3. **`practitioner_clients.relationship_*` columns** — dead in code; a latent trap. Deprecate in intent now.
4. **`portal_email` / `portal_password_hash`** — a second auth identity. Frozen.
5. **`sessions.client_id`** — interaction history used as a visibility gate. Interaction is not commitment. ⛔
6. **`field_program_positions`** — sovereign member declaration, Catalog §8. Not relationship state; correctly separate. ✅

---

## 7. MINIMUM COHERENT STRUCTURAL REPAIR

Ordered. **None authorized by this document.**

| # | Repair | Nature | Affects |
| --- | --- | --- | --- |
| **A** | **Adoption, not repair** — complete a Practice Field to `live` and run the ceremony end to end once, in a controlled walk. This is what converts "sound by reading" into "proven by running." | operational | nothing existing |
| **B** | Implement **decline / withdraw consent** and **archive** (§5.2–5.3) | new code + routes | nothing existing; closes the constitutional gap |
| **C** | Repoint `/api/now-what/home` relational reads at `relationship_spaces`, using the `maia/list:708` predicate as the reference pattern | code | My Coaching, Calendar |
| **D** | Separate **absence** from **failure** in non-fatal reads | code | a wrong-referent join logged a warning for weeks and rendered identically to honest absence |
| **E** | Correct the `pc.practitioner_id → members.id` join **only where a genuinely administrative fact is wanted** | code | studio surfaces |
| **F** | Deprecate the vestigial `relationship_*` columns in intent; document; **do not drop** | docs now, migration later | zero code dependencies confirmed |
| **G** | Freeze `stellium_clients` and portal credentials | convention + optional lint | 4 call sites |

**B is the highest-value item after A**, and it is not a product feature — it is the missing half of a consent model.

### 7.1 Preservation requirements

Repair must not cost currently working capability.

| Must be preserved | Why |
| --- | --- |
| **Portal booking continues to work** | it creates *contacts* and *sessions*. Legitimate under R-Q1a.1. Do not gate booking on a commitment. |
| **Studio caseload / clients / import** | practitioner-side administration over contacts. Legitimate. Unaffected. |
| **Sessions substrate** (34 rows) | operational scheduling. A session may exist without a commitment; only *member-facing relational visibility* moves to the commitment. |
| **`practitioner_clients` data, all 48 columns** | contact + PHI + billing. Nothing dropped. Deprecation is *intent*, not deletion. |
| **The five-room ontology and its drift tests** | 60/60 passing; unaffected by this layer |
| **Honest-absence rendering** | My Coaching must stay empty until commitments exist. Repair must not fill it. |
| **Catalog §8** | positions remain practitioner-unreadable |
| **Formation snapshots** | `createSnapshot` at invite time is a FORMATION_AS_RECORD guarantee. Preserve the timing. |
| **Historical evidence in the vestigial columns** | if they hold real history, disposition must preserve it while removing them as a *competing source of truth* |

**Do not preserve the category error merely because `/now-what/coaching` currently depends on it.**

---

## 8. REGRESSION INVARIANT — FOUNDER-STATED, FOR EXECUTABLE ENFORCEMENT

> **RI-1.** No surface may represent, authorize, narrate, or infer a constituted practitioner–member relationship unless the authoritative commitment substrate establishes that relationship according to its consent semantics.
>
> **RI-1 (converse).** Administrative association, historical interaction, invitation, roster membership, contact status, payment, session history, or practitioner assertion alone can never satisfy that predicate.

**Executable form** — the only admissible predicate:

```sql
EXISTS (SELECT 1 FROM relationship_spaces
         WHERE participant_member_id = :member
           AND steward_member_id     = :practitioner
           AND status                = 'active'
           AND consent_status        = 'accepted')
```

**Proposed test shape** (to be built with repair B/C, in the manner of `lib/nowWhat/__tests__/rooms.test.ts`, which is the reason this whole class of error was catchable):

- no member-facing surface derives a *relational* claim from `practitioner_clients`, `sessions`, `marketing_contacts`, or `portal_*`;
- every relational read includes all three conjuncts — `participant`, `active`, `accepted`;
- `status IN ('active','invited')` is not admissible as a relational predicate;
- no code path writes `participant_member_id` other than `join/[token]/accept`;
- no code path writes `consent_status='accepted'` other than the consent route;
- no migration inserts into `relationship_spaces`.

The last three are the mechanical guarantee against future backfill.

---

## 9. RECOMMENDED DISPOSITION

1. **Do not repair My Coaching.** Its emptiness is correct. Any repair before a commitment exists would encode a false ontology.
2. **The next act is adoption, not engineering** (§7A): complete one Practice Field to `live` and walk the ceremony once, end to end, in production or a faithful staging. That is the only way to move the pathway from *sound by reading* to *proven by running* — and it is also how Larry's practitioner identity gets established **through the ordinary path**, with no hard-coding and no exceptional insertion.
3. **Then build revocation** (§7B). Consent without withdrawal is incomplete consent.
4. **Then repoint the readers** (§7C–D), with RI-1 encoded as a test *before* the repair, not after.
5. **Record now, act later:** deprecate the vestigial columns in intent (§7F); freeze the legacy aliases (§7G).
6. **Unchanged, separate:** the plaintext-name security pair remains in the security/privacy lane; the `/now-what/admin` disposition remains with the R2 salvage trace — informed by §4's finding that it is a second door to this same ceremony.

---

## 10. WHAT THIS TRACE DOES NOT CLAIM

- **Not claimed:** that the consent transition works. It has never run in production. Soundness here is by code reading only.
- **Not claimed:** that the two `pending` Practice Fields are pending for a *good* reason. Why `readiness.is_live` is false for both is unexamined — it may be missing required sections, or it may itself be defective. **This is the single most important open question for step §7A** and should be the first thing checked when adoption is attempted.
- **Not claimed:** that `/api/member/portal` renders `invited` spaces incorrectly — only that the query admits them and the rendering was not inspected.
- **Not examined:** the other eight `relationship_*` tables (`relationship_entries`, `relationship_essence`, `relationship_field_state`, `relationship_patterns`, and others). They exist; their conformance to Ruling 1 is unaudited and is a candidate follow-on scope.

---

## ADDENDUM — `readiness.is_live` TRACE (authorized narrow act, 2026-08-09)

**Scope:** the readiness predicate only. Read-only. No state changes.
**Question:** are the two `pending` Practice Fields correctly pending, or falsely blocked?
**Answer: one of each — and the second is blocked for a reason the predicate cannot express.**

### A.1 The predicate is sound

`lib/types/practiceField.ts:124`:

```ts
export function checkPracticeFieldReadiness(field: Partial<PracticeField>): PracticeFieldReadiness {
  const missing: string[] = [];
  if (!field.welcome_message?.trim())         missing.push('Welcome message');
  if (!field.how_we_work_together?.trim())    missing.push('How We Work Together');
  if (!field.how_maia_supports?.trim())       missing.push('How MAIA Supports Our Work');
  if (!field.professional_practice?.trim())   missing.push('Professional Practice declarations');
  return { is_live: missing.length === 0, missing };
}
```

Four required non-empty text fields. The schema agrees — `professional_practice TEXT, -- jurisdictional declarations (required for LIVE)`. **No defect. The gate is not wrong.**

### A.2 The two fields (lengths and system-generated reasons only — no authored content read)

| Field | welcome | how_we_work | how_maia | prof_practice | stored `status_reason` | predicate recomputed |
| --- | --- | --- | --- | --- | --- | --- |
| `87c28398` | **NULL** | 644 | 530 | 263 | **(null)** | **correctly pending** |
| `8be895ad` | 129 | 434 | 507 | 225 | *"contained 2026-08-03: active content was Soullab candidate material composed as Larry program corpus; preserved as evidence pending governance decision"* | ⚠️ **WOULD BE LIVE** |

**`87c28398` — correctly pending.** `welcome_message` is NULL; the predicate agrees. But `status_reason` is null where `syncStatus` would have written `"Missing: Welcome message"`. Its status is therefore the schema **DEFAULT `'pending'`** — this row has never been through the recompute path at all. Correctly pending, but by default rather than by evaluation.

**`8be895ad` — falsely blocked by the predicate, correctly blocked by governance.** All four required sections are populated. The predicate, recomputed against live data, returns **is_live = true**. It is `pending` because a human wrote a containment reason into `status_reason` on 2026-08-03. This is not a readiness failure; it is a deliberate act the type system has no vocabulary for.

### A.3 ⛔ THE CONTAINMENT IS UNDEFENDED — the significant finding

`lib/practiceField/practiceFieldService.ts:118-130`, `syncStatus`, *"Called after every update"*:

```ts
const status = readiness.is_live ? 'live' : 'pending';
const reason = readiness.is_live ? null : `Missing: ${readiness.missing.join(', ')}`;
await client.query(
  `UPDATE practice_fields SET status = $2, status_reason = $3 WHERE id = $1 RETURNING *`, …);
```

**Both columns are overwritten unconditionally.** There is no containment column (`status` CHECK admits only `pending` / `warning` / `live`), no guard in the service, the API route, or the type layer — a grep for containment guards across `lib/practiceField`, `lib/types/practiceField.ts` and the route returns nothing. The containment exists **solely as a string in a column that the normal write path erases**, and it is recorded nowhere in git or docs.

**Consequence chain — a single save on `8be895ad` through `PracticeFieldEditor` would:**

1. recompute `is_live = true` → set `status = 'live'`;
2. overwrite `status_reason = NULL`, **destroying the only record of the containment**;
3. thereby satisfy Gate 0 and **arm the invitation pathway** for a field whose content was contained as *Soullab candidate material misattributed as Larry program corpus*;
4. and, on the first invite, freeze that content into an **immutable formation snapshot** (`createSnapshot`, FORMATION_AS_RECORD).

This engages the audit's §C.4 content gap and the founder's §9 rule directly: *the system must never speak in Larry's voice merely because a content slot needs filling.* Here the mechanism by which it could do so is a routine save.

### A.4 Ordering hazard for the authorized adoption step

The authorized sequence is *"complete one Practice Field through the ordinary practitioner path and move it to `live`."* **Applied to `8be895ad`, that act would erase a governance containment and publish contained content.** The adoption step and the containment sit on the same column.

**Recommendation — no state change performed, none proposed without ruling:**

- **Do not touch `8be895ad`.** Not to complete it, not to inspect it through the editor — the editor's save path is the hazard.
- **Give containment a durable representation before any Practice Field is edited.** Minimum viable: a distinct column (or a `'contained'` status outside the readiness computation) that `syncStatus` cannot overwrite, plus a test asserting the recompute cannot clear it. Until then the containment is one keystroke from gone.
- **Adoption should use `87c28398`** (legitimately incomplete, needs only a welcome message) **or a newly created field** — subject to a founder ruling on whose practice it represents, since Larry has no practitioner record.
- **Record the 2026-08-03 containment in docs**, so it survives independently of a database string.

### A.5 Answer to the authorized question

**The predicate is sound; the pathway is not falsely blocked by defective readiness.** Gate 0 held for a legitimate reason in one case and for a deliberate governance reason in the other. The ceremony was genuinely never startable — correctly so.

**But the trace surfaced a second constitutional deficit alongside the one-way consent model:** governance containment has no representation in the type system, and the routine write path silently destroys it. Both are the same shape — *the schema models entrance but not the acts that restrain or reverse it.*
