# F5-D — CONTENT-ADDRESSED RESIDUE CENSUS

**Status: READ-ONLY CENSUS · COMPLETE · ⛔ NO REPAIR · ⛔ F5 LANE NOT OPENED**
**Date:** 2026-09-20
**Occasion:** an external failure shape observed in `vellum-ai/vellum-assistant` @ `99620e258`
(`docs/research/VELLUM_ASSISTANT_COMPARATIVE_STUDY_2026-09-20.md` §4B) and checked against our own
erasure organism, as that study said was owed before any F5 repair.
**Standing it does not disturb:** `F5 ERASURE CONFORMANCE — FAIL / STOP` (`F5_ERASURE_TRACE_ADJUDICATION_2026-09-17.md`).

---

## 0 · The shape being looked for

In the external system, a member deleting a conversation purges thirteen conversation-keyed tables and
leaves a fourteenth — `memory_v3_pool_texts`, keyed by content hash rather than by owner. Its own source
comment states the reason: *"its companion texts table is content-addressed and page-derived, so it has
no conversation rows to purge."* The purge is best-effort and calls what remains *"harmless garbage."*

The generative move is **deduplication by content hash**. Storing each distinct text once is a storage
win that severs the ownership edge: the row is no longer *this member's text*, it is *a text*, and
nothing points from the owner to it. Deletion then cannot reach it, because deletion follows ownership
and ownership is what the optimization removed.

**Question for this census: does MAIA hold any store of that shape?**

---

## 1 · RESULT — the shape is absent, structurally

**No content-addressed store dedupes member material across owners anywhere in the schema.**

A sweep of `database/migrations/*.sql` for hash-keyed or digest-keyed storage returns only:

| Site | What it is | Why it is not the shape |
| --- | --- | --- |
| `token_hash` (`20260614000002_session_join_tokens.sql:18`), `passkey_hash`, `portal_password_hash`, `password_algo` | credential digests | single-owner secrets, not content; no dedup |
| `sha256` (`20260705000002_encounter_stream_lifecycle.sql:25`) | integrity column on an owned row | attached to the owner's row, travels with it |
| `last_idempotency_payload_hash` (`20260731000001_draft_concurrency.sql:30`) | concurrency guard | column on an owned row |
| `relational_field_shadow_runs` (`20260916211500`) | source refs + digests | its own comment: *"Historical member transcript text is not duplicated here."* |

**The file vault is id-addressed, not content-addressed.** `lib/storage/fileVault.ts:56` writes
`path.join(namespace, `${fileId}.${ext}`)`. Identical bytes uploaded by two members produce two files.
There is no shared blob and therefore nothing to orphan. `destroyVaultBytes` additionally *proves*
absence rather than assuming it (`lib/storage/fileVault.ts:88-105`): it throws unless the path is gone
afterwards, and read-only-mount / declined-traversal cases are treated as failures to destroy rather
than as success.

**`vault_erasure_queue` is the sharpest counter-example in the codebase.** Its migration states what it
may hold: *"A vault path and nothing else. … no member id, no manuscript id, no title, no source text,
**no hash**. … this row OUTLIVES the erasure it serves — it must never be capable of reconstructing,
identifying, or attributing the writing it came from."*

⭐ That is the external system's exact failure, anticipated and refused, in a table written for a
different reason (the rows-first / bytes-first seam) three days before the F5 trace. **The immunity is
architectural, not accidental** — but it was also never named as a class, which is what §2 is about.

---

## 2 · FINDING — the F5 instrument cannot see the class it correctly names

`F5_ERASURE_TRACE_ADJUDICATION_2026-09-17.md` §2 closes its findings with:

> *"Several member-associated stores have no FK relationship to `members(id)` and therefore survive
> deletion unless separately governed."*

That sentence is correct and it is the right class. But the census that produced the trace enumerates
**by foreign key to `members(id)`** — 242 tables across four disposition classes (161 CASCADE, 24
RESTRICT, 43 NO ACTION, 30 SET NULL). A search of `F5-A_ERASURE_ARCHITECTURE_CENSUS_2026-09-17.md` and
`F5-C_MEMBER_INFORMATION_CUSTODY_GRAPH_2026-09-17.md` for `content.address|hash|dedup|digest|blob`
returns **nothing**.

⭐⭐ **An FK-enumerating census cannot discover a store that has no FK.** The no-FK class is named as a
finding but is not reached by the method; it is populated by whatever the authors happened to recall.
The external defect lived precisely there, and would have been invisible to our instrument had it
existed here.

⛔ **This is not a new violation and does not reopen the trace.** It is a stated limit on the instrument
the FAIL/STOP ruling rests on. Naming it strengthens that ruling: the ruling says the organism cannot
presently account for the complete disposition, and this says one reason why is that the census method
has a blind class rather than merely an incomplete list.

---

## 3 · FINDING — the governed list is a hand-maintained literal with no guard

`GOVERNED_CONTENT` (`app/api/members/delete-account/route.ts:78`) is a hand-written array of
`{ table, column, label }`. The adjudication's central arithmetic — **242 member-linked tables, 43
governed** — is therefore a snapshot of a list nothing holds in place.

`package.json` declares sixteen `check:*` guards. One of them, `check:phi-inventory`
(`scripts/check-phi-columns-inventory.ts`), does exactly this job for a different sensitivity class:
it reconciles a declared inventory (`docs/security/phi-columns.md`) against the codebase and fails on
an undocumented column.

**There is no equivalent for erasure.** Table 243 lands without notice, and so does column
`member_id` on a table that never declares a foreign key.

---

## 4 · OBSERVATION — routed out, ⛔ not repaired, ⛔ no lane opened

`app/api/members/delete-account/route.ts:163` swallows a per-table failure:

> *"Table absent in this environment. Absence of a table is not evidence of absence of content, so it is
> not counted — and because the posture is refuse-by-default, an uncounted table cannot cause a wrongful
> deletion."*

The reasoning is sound for a *missing* table. It also means a **renamed or misspelled** table name
silently contributes zero to the preflight count, so content that should have produced a governed 409
refusal does not. Whether that is a defect depends on what "wrongful deletion" is taken to govern — if
it means *deleting material the member was never told was retained*, the guarantee runs the other way.

⛔ F5 did not adjudicate this specific line. ⛔ It is not repaired here. ⛔ The lane that finds a defect
does not thereby own it: this route is the account-deletion boundary and any change to it is F5 territory.

---

## 5 · STANDING

* Content-addressed residue shape: ✅ **ABSENT from MAIA**, structurally (id-addressed vault, no
  cross-owner dedup, `vault_erasure_queue` explicitly hash-free).
* F5 census method: ⚠️ **BLIND TO THE NO-FK CLASS IT NAMES** — limit recorded, trace not reopened.
* Governed-list drift: ⚠️ **UNGUARDED** — 43 of 242 is a snapshot with no instrument holding it.
* Preflight catch semantics: ⚠️ **OBSERVATION, ROUTED OUT, UNREPAIRED.**

⛔ F5 REPAIR LANE NOT OPENED · ⛔ NO SCHEMA · ⛔ NO MIGRATION · ⛔ NO ROUTE CHANGE · ⛔ NO GUARD AUTHORED ·
⛔ PRODUCTION UNTOUCHED · `F5 ERASURE CONFORMANCE — FAIL / STOP` UNDISTURBED.

⭐ *The thing we do not have, we do not have on purpose. The thing we cannot see, we could not have seen.*
