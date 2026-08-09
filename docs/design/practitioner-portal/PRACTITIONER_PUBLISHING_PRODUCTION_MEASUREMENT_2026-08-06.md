# Practitioner Publishing — Production Measurement (evidence)

**Bounded, read-only measurement. Authorized by the founder 2026-08-06 as measurement only —
⛔ it does not authorize any remediation.** This document records what was measured. It is
**evidence**, not judgment, and ⛔ must not be edited to match later conclusions.

## Provenance

| | |
|---|---|
| Host | `minisforum` (`soullab`), LAN `192.168.0.104` ✅ matches router forward target |
| Database | `maia_consciousness` as `soullab`, `pg_is_in_recovery = f` (primary, not replica) |
| App commit | `GIT_COMMIT = b1399f693`, `DEPLOY_LANE = deploy-lane` |
| App container created | `2026-08-06T03:58:24Z` |
| Postgres container up since | `2026-07-11T00:11:36Z` |
| Query timestamp | `2026-08-06T19:11:21Z` (UTC) |
| Posture | `BEGIN TRANSACTION READ ONLY` → `current_setting('transaction_read_only') = on` → `ROLLBACK` |
| SQL | `scratchpad/publishing_reconciliation.sql`; raw output `scratchpad/reconciliation_result.txt` (370 lines) |
| Mutations | ⛔ none. No schema change, no row repair, no index, no test insert. Metadata + counts only; ⛔ no content bodies, ⛔ nothing decrypted |

⚠️ **Output artifact:** `RAISE NOTICE` does not support `%-32s` padding, so the Q2b count lines
render as `tablename-32s Ns` (e.g. `library_sources-32s 2228s`). The **values are unaffected**; only
the padding directive printed literally.

---

## 1. Classification summary

**Four implementation states (founder, 2026-08-06):** **present and exercised** (live substrate with
meaningful production use) · **present but unexercised** (live schema, ~zero domain data) ·
**absent** (no substrate) · ⭐ **present but incompatible** (exists, but cannot satisfy the
constitutional requirement).

| Substrate | State | Note |
|---|---|---|
| `practitioner_clients` identity | **present but unexercised** | governed schema; **1 of 13** rows linked |
| `relationship_spaces` | **present but unexercised** | correct types + both gates; **0 rows** |
| `library_sources` as Work home | **present but unexercised** *(for practitioners)* | 2228 rows, but **0** scoped, **0** ratified |
| `practitioner_materials` | **present but unexercised** → retire | **0 rows**, legacy |
| `field_programs` + lessons + revisions | **present but unexercised** | 0 / 0 / 0 |
| `coach_client_shared_items` (Bring Forward) | **present but unexercised** | ⭐ shipped **with verifiers** — see the [provenance review](BRING_FORWARD_PROVENANCE_REVIEW_2026-08-06.md) |
| Placement substrate | **absent** | — |
| Work versioning | **absent** | Arrangement lineage exists; Work lineage does not |
| Organization rights-holder · delegation grant · custodial mandate | **absent** | — |
| ⭐ **Per-subject cryptographic erasure** | ⭐ **present but incompatible** | the encryption system exists and works; it ⛔ **cannot express per-subject erasure**. One `k1` protects 16,647 rows across subjects and tables |
| Single role referent | **present but incompatible** | 14 live role CHECKs; ⛔ cannot carry a single authority meaning |

⭐ **Present-but-incompatible is the category that matters most**, because it is the one that looks
like progress from a distance. ⛔ It must never be resolved by weakening the requirement to fit the
substrate.

⚠️ **Correction to the search method (2026-08-06, after the Bring Forward review).** Absence claims
in this lane were made by grepping the **checked-out branch**, whose local `clean-main-no-secrets`
is **402 commits behind `origin`**. ⭐ **The deployed commit `b1399f693` is the only reliable
reference for what shipped** — every prior "not in the repository" statement must be re-checked
against it before being relied on.

---

## 1b. Assumption-level findings

| Assumption | Classification | Consequence |
|---|---|---|
| `practitioner_clients` has a governed member identity | ⭐ **different but sufficient** *(structure)* — ⚠️ **1 of 13 rows populated** | ⛔ publishing **blocked on identity reconciliation** |
| One Work substrate | ⭐ **resolved** — `practitioner_materials` = **0 rows** (dead), `library_sources` = the home | disposition is now empirical, not contested |
| Work ratification lifecycle in use | 🔴 **structurally present, entirely unused** — **0** practitioner-scoped, **0** ratified of 2228 | no Work is eligible to be placed today |
| Work versioning / version pinning | 🔴 **missing** | ⛔ Placement blocked — historical delivery cannot be preserved |
| Per-subject cryptographic erasure | 🔴 **missing** | ⛔ crypto-erasure design is **unimplementable**, ⛔ not to be approximated with deletion |
| `relationship_spaces` as authority container | ⭐ **confirmed structurally** — ⚠️ **0 rows** | the authority instance resolves for nobody today |
| Organization rights-holder | 🔴 **missing** | HC3 stands: no entity to grant |
| Delegation grant instrument | 🔴 **missing** | delegated acts remain unwritable, as ruled |
| Single role referent | 🔴 **ambiguous** — **14** live role CHECK constraints | worse than the 8 found in migration files |

---

## 2. ⭐ Correction to the reconciliation candidate §3.1

**The claim was wrong about the schema.** The candidate inferred that three `CREATE TABLE IF NOT
EXISTS practitioner_clients` declarations meant one arbitrary definition won and the others
no-opped.

**Production shows a single, well-governed merged table** — 48 columns, later migrations having
`ALTER`ed it into a superset:

- ✅ `member_id UUID NULL REFERENCES members(id) ON DELETE SET NULL`
- ✅ `practitioner_id → practitioners(id)` (the `→ members(id)` variant did **not** win)
- ✅ Three **coherence CHECK constraints** that encode identity discipline directly:
  - `link_coherence` — `(member_id IS NULL) = (linked_at IS NULL)`
  - `pending_reachable` — `relationship_status <> 'pending' OR member_id IS NOT NULL OR normalized_invitation_email IS NOT NULL`
  - `ended_coherence` — `(relationship_status = 'ended') = (relationship_ended_at IS NOT NULL)`
- ✅ `relationship_status ∈ pending | active | paused | ended`
- ✅ **0** duplicate `(practitioner_id, lower(email))` groups

⭐ **The severity does not disappear; it moves.** The column exists and is constraint-governed. What
fails the founder's rule — *"the column exists" is not sufficient if production rows do not use it"*
— is the **population**:

> **13 `practitioner_clients` rows. 1 has `member_id`. 1 distinct member.**

12 of 13 clients are reachable only as an email address. A Placement addressed to them has no
governed person to be addressed to, no subject for an Uptake, and no `{party}` to render.

## 3. The Work substrate, measured

| Table | Rows |
|---|---|
| `practitioner_materials` | ⭐ **0** — legacy, empirically dead |
| `library_sources` | 2228 |
| `library_chunks` | 55760 |
| `library_distillates` | 0 |
| `practitioner_files` | 0 |
| `field_programs` / `_lessons` / `_revisions` / `_positions` | 0 / 0 / 0 / 0 |
| `relationship_spaces` | ⭐ **0** |
| `practice_fields` | 2 |
| `member_field_note_events` | 3 |
| `practitioner_client_notes` | 3 |
| `pattern_ledger` | 8 |
| `observations` / `signals` / `recognitions` | 1 / 359 / 0 |

**Lifecycle distribution — one row, and it is decisive:**

```
review_status = uploaded   practitioner_scoped = false   count = 2228
```

⭐ **Every one of the 2228 `library_sources` rows is unscoped and unratified.** There are **zero
practitioner-scoped Works and zero ratified Works in production.** The 2228 are the pre-platform
house corpus — which is precisely what the `20260714000001` migration comment intended
(*"Pre-existing rows … default to 'uploaded' … must not silently become composable"*). ⭐ **That
guard worked exactly as designed.**

> ⭐ **Headline: the practitioner publishing substrate is structurally present and empirically
> empty.** No Work, no Arrangement, no relationship space, no file. Nothing in this lane is Cat 6.

## 4. Versioning, measured

**[O]** 38 tables carry a lineage-shaped column. `library_sources` carries **none** — no `version`,
`supersedes`, `parent_id`, `replaces`, `revision`.

Version lineage that **does** exist: `field_program_revisions.revision_number` (Arrangements) ·
`practice_field_revisions.revision_number` · `practitioner_client_notes.version` ·
`corpus_documents.version` · `artifact_lineage.parent_id`.

⭐ **New finding — a placement-shaped table already exists:** `coach_client_shared_items`, carrying
**`snapshot_version`** and **`snapshot_enc_meta`**. Snapshotting content at share time is exactly
the *"a Placement pins the version it placed"* behaviour the Event Specification §6 requires.
⚠️ **0 rows.** Sibling: `coach_position_share_consents`.

⚠️ This was not found in Session 1 and makes **seven** candidate share/placement tables:
`artifact_shares` · `coach_client_shared_items` · `coach_position_share_consents` ·
`practitioner_file_shares` · `shared_artifacts` · `studio_protocol_assignments` ·
`sms_delivery_status`. ⛔ Their disposition must precede any Placement schema design.

## 5. Encryption and erasure, measured

**[O]** 26 `*_enc_meta` columns across 19 tables. Distinct `kid` values in use:

| Table | `kid` | Rows |
|---|---|---|
| `supervision_transcript_segments` | `k1` | **16644** |
| `practitioner_client_notes` | `k1` | 3 |
| `comms_messages` | *(null at meta root)* | 8 |
| `practitioner_clients.name_enc_meta` | *(null at meta root)* | 13 |
| `practitioner_clients.preferred_name_enc_meta` | *(null at meta root)* | 13 |
| `v_legacy_client_messages` | *(null at meta root)* | 6 |
| all others | — | 0 |

**Key-registry search** (`key|kms|wrap|secret|dek|kek`) returns only `gift_passkeys` and
`maia_nostr_service_keys` — ⛔ neither is a data-encryption-key or wrapped-key registry.

> 🔴 **Exactly one key id (`k1`) protects 16,647 rows spanning multiple subjects and multiple
> tables. No per-subject key exists, and no substrate exists to hold one.**

⭐ **Conclusion: individual cryptographic erasure is structurally impossible today.** Destroying `k1`
would erase every encrypted record in the system. Per the founder's standing consequence, the
Event Specification §7 erasure design is **marked unimplementable**, ⛔ and must not be approximated
with row deletion.

⚠️ **Separate observation, outside this lane:** four tables hold encrypted blobs whose meta JSON has
no `kid` at its root (34 rows). `phiEncryption.ts` decrypts via `getKeyById(blob.kid)`. Either those
rows use a different meta shape or they carry no key id. **[I]** Not investigated — flagged, not
chased.

## 6. Authority container, measured

**`relationship_spaces` — confirmed structurally, unused in practice.**

- ✅ `relationship_type ∈ practitioner_client | teacher_student | coach_client | supervisor_supervisee`
  — ⭐ resolves reconciliation §4.2: the practitioner↔client relation **is** a valid type.
- ✅ Both gates present as separate columns: `status ∈ invited|active|paused|archived`,
  `consent_status ∈ pending|accepted|declined|withdrawn`.
- ✅ FKs to `members(id)` (steward RESTRICT, participant SET NULL) and to `practitioner_clients(id)`.
- ⚠️ **0 rows.** `relationship_space:<id>:steward` currently resolves for **no one**, so ⛔ no
  Placement could pass write-time validation today.

**Organization / delegation search** returns `admin_role_grants` · `maia_nostr_delegation_certs`
(Nostr keys, unrelated) · `member_organizing_principles` (unrelated) · `sponsored_access_grants`.
⛔ **No organization entity. No delegation grant instrument.** ⚠️ `sponsored_access_grants` is an
access-granting table not previously surfaced — noted for disposition, ⛔ not adopted.

**Role vocabulary — 14 live CHECK constraints** naming a `role`: `circle_memberships` ·
`client_contacts` · `client_group_members` · `commons_room_members` · `conversation_turns` ·
`encounter_participants` · `encounter_reflections` · `members.admin_role` · `studio_person_roles` ·
`studio_team_invites` · `studio_team_members` · `team_channel_members` · `wisdom_field_memberships`
(+ `threshold_events` matching on `role_shift`). ⭐ **Worse than the migration-file count of 8.**

## 7. What the measurement changes

1. ⭐ **Nothing in practitioner publishing is live.** Every table is empty or holds only pre-platform
   corpus. There is no production behaviour to preserve, ⛔ and no basis for any Cat-6 claim in this
   lane.
2. **Identity reconciliation is the first blocker** — not schema repair, but the fact that 12 of 13
   clients are email addresses rather than governed persons.
3. **`practitioner_materials` disposition is settled empirically:** 0 rows, retire. ⛔ The ruling is
   still a ruling; the evidence no longer contests it.
4. **Two blockers are confirmed hard:** Work version pinning (missing) and per-subject erasure
   (impossible). Each independently blocks Placement.
5. **Seven share-shaped tables** must be dispositioned before Placement is designed —
   `coach_client_shared_items` in particular already implements version-snapshot-at-share.

## 8. Not authorized

⛔ Remediation of anything above · ⛔ schema change, row repair, backfill, or index · ⛔ resolving any
duplication · ⛔ adopting `coach_client_shared_items` or `sponsored_access_grants` · ⛔ lifting the
ontology's implementation block — a founder act.
