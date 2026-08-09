# Containment vs Release Authority — Precedent Record + Smallest Ruling

**Date:** 2026-08-09 · **Status:** EVIDENCE + RULING REQUEST. No implementation. `feature/governance-containment` held at review.
**Question, narrowly:** *who is authorized to release which containment, and on what basis?*
**Constraint accepted:** no role invention. Surface existing authority, or report the gap.
**Related:** [`GOVERNANCE_CONTAINMENT_2026-08-09.md`](GOVERNANCE_CONTAINMENT_2026-08-09.md) · [`RELATIONSHIP_CONSTITUTION_TRACE_2026-08-09.md`](../now-what/RELATIONSHIP_CONSTITUTION_TRACE_2026-08-09.md)

---

## 1. HEADLINE

**A legitimate governance authority already exists. Nothing needs inventing.**

`members.admin_role` (migration `20260612100001_admin_roles.sql`) with `admin_role_grants` provenance and an owners-only grant boundary is a working, exercised, audited authority model. The containment route can adopt it rather than invent anything.

**And the codebase already implements asymmetric release for the same stored state** — `auth_sessions.revoked` is written by four different paths with three different authorities. So "same storage, different release authority" is not a new idea here; it is established practice.

---

## 2. PRECEDENT — WHAT EXISTS

### 2.1 Platform authority (the one to reuse)

| Element | Where |
| --- | --- |
| Roles | `members.admin_role ∈ founder · cto · practitioner_admin · operations · tester` |
| Gate | `checkAdminAuth(req, ROLES)` — `lib/admin/adminAuth.ts`, role-scoped |
| **Owners** | `OWNER_ROLES = ['founder','cto']` — `app/api/admin/members/admin-role/route.ts:30` |
| Provenance | `admin_role_grants` (actor_id, actor_via, target_id, old_role, new_role, created_at) |
| Anti-lockout | last `founder` cannot be revoked or downgraded |
| Jurisdiction limit | *"admin authority is platform stewardship ONLY — this route writes `members.admin_role` and nothing else, it never touches relationship data"* |

**Production:** `founder=1`, `cto=1`, 2 grants logged. **Exercised, not theoretical.**

A second, weaker gate exists — `isAdminRequest` (shared `LABTOOLS_ADMIN_PASSWORD`, `lib/admin/requireAdmin.ts`), used by monitoring and `/api/admin/security/*`. A third, `lib/founder/founderAuth.ts`, reads `FOUNDER_MEMBER_IDS` from env. **Three overlapping admin gates is itself latent debt** — noted, not in scope.

### 2.2 Asymmetric release — the direct analogue

`auth_sessions.revoked` / `revoked_reason`, one column, four writers:

| Path | Authority | `revoked_reason` |
| --- | --- | --- |
| `/api/members/signout` | the subject | `user_signout` |
| `/api/auth/session/revoke-others` | the subject | `bulk_revoke` |
| **`/api/admin/security/sessions`** | **admin only** (`isAdminRequest`) | **`admin_revoke`** |
| `/api/members/delete-account` | system | `account_deleted` |

**The reason column records which authority acted.** This is precisely the pattern under discussion, already in the codebase.

### 2.3 Quarantine vocabulary — declared, never exercised

`commons_room_events.moderation_status ∈ visible · quarantined · hidden · removed` (default `visible`). **Zero code reads or writes it.** Precedent for the *vocabulary* only; it establishes no authority model. Stated honestly rather than cited as support.

### 2.4 Consent revocation

`consent_state ∈ pending · active · revoked`; `relationship_spaces.consent_status ∈ pending · accepted · declined · withdrawn`; `living-field/[fieldKey]/consent` sets `revoked_at`. **Subject-held consent is subject-revocable** — but that is the subject withdrawing *their own grant*, not clearing a restraint imposed on them.

### 2.5 The decisive negative finding

**Nowhere in the codebase does a subject clear a restraint imposed on them by another party.**

Every self-service reversal found is the subject reducing their *own* privilege or withdrawing their *own* grant. Admin-imposed session revocation cannot be undone by the subject — it cannot be undone at all. The last-founder guard shows the system already recognises that self-action can defeat a control.

**So the current containment route — where the field holder may release a hold placed on their field — has no precedent in this codebase.** It would be the first instance.

**Also absent:** any precedent for reason or provenance gating release authority. `revoked_reason` records who acted; it does not govern who may reverse. That mechanism would be new — which argues for a discriminator column over reason-string parsing.

### 2.6 Production fact bearing directly on the case

The holder of practice field `8be895ad` has **no `admin_role`**. Under an owners-only release rule they could not self-release, and no data migration would be needed to make that true.

---

## 3. THE SMALLEST RULING REQUESTED

> **R-GC2. Containment authority and release authority are distinct capabilities, discriminated by the kind of containment.**
>
> 1. **Two kinds, one storage.** Add `containment_kind ∈ ('voluntary_hold','governance_hold')`, NULL when `containment_status='none'`. Same columns, same GC-1/GC-2/GC-3 guarantees; **different release authority**.
> 2. **`voluntary_hold`** — *"pause my field"*, imposed by the field holder. **Self-release permitted.** The authority to enter carries the authority to leave, because the act was the holder's own.
> 3. **`governance_hold`** — *"this must not become effectively live until the reason is resolved"*. Imposed by an **owner** (`checkAdminAuth(req, ['founder','cto'])`). **Released only by an owner. The subject may never release it**, and a holder's readiness edits cannot lift it.
> 4. **A holder may not upgrade or downgrade a kind.** Converting `governance_hold` → `voluntary_hold` is a governance act, or the control is defeated by relabelling.
> 5. **Legacy row `8be895ad` is classified `governance_hold`** — on the evidence of its own surviving text, *"preserved as evidence pending governance decision"*. `contained_by` stays NULL (author unrecoverable); release requires an owner. **Evidence-based, and the safe direction: the more restrictive classification.**
> 6. **No new role.** Reuse `members.admin_role` + `checkAdminAuth` + `OWNER_ROLES`. Log every containment transition with actor and kind, in the manner of `admin_role_grants`.
>
> **GC-4 (invariant).** A resource must not become effectively live merely because its ordinary holder can mutate readiness state while a governance containment remains operative. **Containment is logically prior to readiness, and release authority is determined by the kind of containment, never by the subject's relationship to the resource.**

### 3.1 What this changes in the held branch

Small. The storage design, GC-1 binding, Gate 0 ordering, 409/422 distinction, history-preserving release, nullable historical actor, and all six invariants **stand unchanged**.

| Change | Size |
| --- | --- |
| `containment_kind` column + CHECK; migration sets legacy row to `governance_hold` | ~10 lines SQL |
| `POST` takes `kind`; `governance_hold` requires `checkAdminAuth(OWNER_ROLES)` | ~15 lines |
| `DELETE` branches on kind: holder for voluntary, owner for governance | ~15 lines |
| Containment transition log (actor, kind, old→new) | one small table |
| Invariants 7–9: subject cannot release a governance hold · holder cannot change kind · legacy row is `governance_hold` | ~40 lines test |

### 3.2 Open sub-question, flagged not assumed

**Who may impose a `governance_hold` on a field they do not hold?** R-GC2.3 proposes owners. But §2.1 records that admin authority is scoped to *"platform stewardship ONLY… never relationship data"*. A hold on a practitioner's Practice Field is arguably platform stewardship (it gates the invitation pathway), but it is adjacent to their practice content. **This needs your explicit word** — I have not assumed the jurisdiction extends.

Also unresolved: three overlapping admin gates (`admin_role`, `LABTOOLS_ADMIN_PASSWORD`, `FOUNDER_MEMBER_IDS`). R-GC2 uses the strongest (`admin_role`). Consolidation is separate work.

---

## 4. STATE OF THE HOLD

Unchanged and verified: `8be895ad` remains held by the existing `status_reason` mechanism. No merge, no migration applied, no deploy, no release. Representation change is not release, and the migration remains the constitutional handoff — to be verified as *preservation of the prohibition*, not run as ordinary schema deployment.
