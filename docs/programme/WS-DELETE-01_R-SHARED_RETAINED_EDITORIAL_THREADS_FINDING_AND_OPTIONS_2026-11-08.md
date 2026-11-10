# WS-DELETE-01 · R-SHARED — Retained editorial threads after Remove: what the four routes do, and the options

**Status: MEASURED · DECIDED (founder, 2026-11-08: option b-narrow, undo left open, copy clause yes, option c design-only with the migration held) · IMPLEMENTED ON A BRANCH FOR A DRAFT PULL REQUEST (section 8) · NOT MERGED · NOT DEPLOYED.** Sections 1 to 7 are the measurement and the options as they stood before the decision; they are kept as written, with the two facts that changed marked in place. This record answers the finding raised and not closed in the lane record, section 6.9.1 ("A separate founder finding, raised and not closed here"). PR [#2169](https://github.com/SoullabTech/Sovereign/pull/2169) merged on 2026-11-08 17:58 UTC, so that section is now on the base. No migration, compose, env or key file was changed. No deploy. Fictional data only.

Evidence classes (the register's): **EXECUTED** = run in this lane on a fictional PostgreSQL 16; **SOURCE** = read in code at the commit named; **REPORTED** = said, not located. Base: `clean-main-no-secrets` at `0446c5c0` (the working tree this ran on); re-run on the head of #2169 (`836ab1e1`) with the same result, see section 3.

## 1. The answer in one table (EXECUTED)

A member's Work is removed through the real `DELETE /api/sovereign/living-works/[id]` handler. The writing, its editorial threads (opened through the real thread route, one per section), their turns, chains, versions and both origin rows stay. The editorial relationship row is gone (cascade). Then each route is called by the same member, with `WRITERS_STUDIO_EDITORIAL_ENABLED=1`:

| Route | Request | After Remove | What it means |
|---|---|---|---|
| `POST /api/writers-studio/editorial/adoption` | member + thread id + version id | **200 `applied`**, `permission.established: true`, `byThisGesture: true`; **the writing's section text changes** and the draft version advances; an authorization row is minted and spent. Works for MAIA's offered version and for the member's own retained version | A removed Work does not stop a retained conversation from changing the writing |
| `POST /api/writers-studio/editorial/undo` | member + authorization id | **200 `undone`**; the writing is restored to the text before an application made *before* the Remove | Recovery of the member's own earlier text still works |
| `GET /api/writers-studio/editorial/relationships` | member + section id | **200**, lists the retained thread with the **frozen passage text** (`locusText`), `turnCount`, `versionCount`, dates. No relationship or Work id in the answer | The list needs no Work and is not filtered by one |
| `GET /api/sovereign/manuscripts/[id]/ask?thread=` | member (+ manuscript ownership) + thread id | **200**, the **whole thread**, including the member's own act text as an author turn and MAIA's reply. Byte-identical to the answer before the Remove | Nothing about the Work enters this answer, before or after |

**Flag off** (`WRITERS_STUDIO_EDITORIAL_ENABLED` not `1`): adoption, undo and relationships answer **404 with an empty body** and write nothing. The ask route has **no flag** and answers 200 regardless. Production's value was unread when the lane record was written (6.9.5); the founder-run readout of 2026-11-08 found it **on** (section 5), so the table above is the production-relevant case, subject to the running build containing these routes (its commit was not read).

**Controls — the gated paths, same removed Work:**

| Path | After Remove |
|---|---|
| thread GET (read a thread) | 409 `origin_unavailable`, no turns in the body (200 before the Remove) |
| thread POST (open a new conversation) under the removed relationship | 400 `origin_unavailable`, no thread or chain written |
| version POST (the member writes a version) | 409 `origin_unavailable`, `persisted: false`, no row written |
| turn POST, MAIA opens (stops at its preflight; no model call) | 404 `relationship_not_found`, `persisted: false`, no turn written |

**Another member** gets nothing from any of the four, before or after the Remove (adoption 404 `thread_not_found`, undo 409 `unknown_application`, relationships 200 with an empty list, ask 404). **The finding concerns the member's own retained data. It is not a cross-member exposure.**

**The shared-writing case** (the one #2162 built a Remove exit for): with a second Work still holding the writing, the relationships list still offers the removed Work's thread for that section, and opening it under the second Work's relationship is refused 409 `origin_unavailable`. The list names a conversation that the next call will not open. (The Write-mode controller does not resume it: it re-verifies each match by origin and, when none verifies, opens a new conversation and shows a notice that is untrue for this case, already recorded as 6.9.5(b).)

**The only way a member can remove this history today** (EXECUTED): deleting the *writing*. After a Remove, `DELETE /api/sovereign/manuscripts/[id]` returns 200 and removes the threads, turns, chains, versions, spent authorizations and both origin rows; afterwards the routes above find nothing (adoption 404).

## 2. What this means (the reframing)

The four routes are **not where the retention lives**. The editorial history, including the member's own words, exists after a Remove whether or not these routes answer. The routes only decide who can read or act on it, and that is already only the owner. Two different questions are tangled in the finding:

- **Consistency (H2, H3).** The open, read, turn and version paths refuse a removed Work; the list, adoption and undo do not. Effects: the list offers threads that cannot be opened (above); a stale tab holding an open conversation can still adopt or undo after the Work is gone. SOURCE: the live client `adoptEditorialVersion` (`lib/writersStudio/rebuild/editorialCollaboration.ts:476-490`) checks the origin itself, by reading the bound thread, before it calls adoption; the route does not. `adoption.ts` already says the principle about a different guard: *"A BROWSER CHECK IS NOT A GUARD."* No safety harm was found: the act is the owner's own explicit gesture on their own writing.
- **Custody (H1, H4).** The member removed the Work and the editing conversations about its writing stay, with no member-visible way to see or delete them short of deleting the writing. That is the sovereignty question ("no stealth memory"; consent for memory), and **gating routes does not touch it**. Gating makes the history *less reachable to its owner*, which raises the weight of the custody question rather than lowering it.

Options (a) and (b) answer the first. Only (c) answers the second.

## 3. Method and limits (EXECUTED, with what it is not)

- `tests/constitutional/ws-delete/dynamic/retainedEditorial.probe.test.ts` (16 probes, RT-0 to RT-8, RT-C1 to RT-C4, RT-X1) run by `run-retained-editorial-pg16.sh`: its own PostgreSQL 16 cluster on loopback, the delete harness's stub schema for the governance tables only, the **real** DDL for the Work tables and **28 real migrations** (editorial relationship, chains, versions, authorizations, recovery, thread origins, turn bindings, R20 editorial erasure). Run here as root: **16 of 16 pass**. The existing delete harness still passes (59 of 59) on the same tree.
- Re-run on a scratch worktree at the head of #2169 (`836ab1e1`): **16 of 16**. #2169 changes Remove (lock first, deletion manifest and tombstone) and nothing in this finding.
- The real route handlers and libraries run. **The only seam replaced is the session resolver** (`getMemberIdFromRequest`), as the sibling probes do; `resolveCanonicalIdentity` runs for real. The R20 ledger seal is replaced by a switch that seals (RT-8 only). No model provider is reached.
- Not a browser, not real HTTP/middleware, not production. Turns and versions are inserted directly (as the turn route's persist step would write them); the routes under test read them.
- **Not exercised:** the Save-working path (SOURCE: gated by `lockCurrentEditorialOriginWithClient`, the same function the thread read uses); `POST …/ask` with a retained editorial thread id (editorial threads have a NULL anchor; reading suggests it cannot proceed; not run); any UI.
- The probes assert today's behaviour. If a route is gated, the corresponding probe fails with a named obligation and this record must be updated.

## 4. Options

### (a) Accept as is, and say so in the record

- **Change:** none in code. Record the table in section 1 as a declared state and mark the 6.9.1 sentence "code reading only; nothing was executed" as superseded by this file when #2169 merges.
- **Leaves:** the dead-end card in the shared-writing case; stale-tab adoption and undo after a Remove; the untrue Write-mode notice (6.9.5(b)); and the whole custody question (retention without a member door).
- **Cost:** a docs change. **Reasonable only with the copy clause of 6.9.5(e)** (the Remove dialogs say the passage-by-passage conversations are kept with the writing, and that no Work will offer them again): that is a deliberate edit to `removeCopyConversations.test.ts`, which forbids blanket phrasings such as "cannot be opened". Without it the dialog stays silent about the one class of retained history that has no door.

### (b) Gate adoption, undo and the list on the originating origin

Two variants. They differ in cost and in who they strand.

**(b-narrow) refuse only the provably orphaned.** The predicate: the thread *has* an origin row, and the relationship that origin names no longer exists. Derived server-side from the thread id; no new request field.
- *Adoption:* refuse before act 1 (no permission minted) with `origin_unavailable` → 409, the status the version and thread paths already use; the closed body (`threadId`, `versionId`, `adoption/route.ts:53`) is unchanged.
- *Relationships:* omit orphaned threads from the list. This fits the route's own words ("the relationships already open on a passage"): a thread whose A2 relationship is gone is not one. It removes the shared-writing dead end.
- *Undo:* **left open (recommended).** Undo restores bytes the member already had from a server-held snapshot and authors nothing. Refusing it after a Remove would strip the only way back from an adoption the member made earlier. If the founder wants it gated anyway, it should be a separate, explicit ruling.
- *Unchanged:* threads with **no** origin row (opened before `20261020000001`; the origin migration is explicit that they are not backfilled) behave as today, so the 2026-11-01 ruling and its notice for older conversations are untouched. No migration, no client change, no flag change.
- *Honest limit:* a pre-check, not the mutation boundary. A Remove committing between the check and the write lets one adoption through. The lane's FR-18 history (`093379e8d`) is the reason to say so. Here the residual is not a safety defect (the member's own gesture on their own writing); putting the check inside `executeAuthorization`'s transaction would be authoritative but changes a shared function. Not recommended without a reason.

**(b-strict) the same `lockCurrentEditorialOriginWithClient` the open/read/version paths use.**
- Needs a `relationshipId` on adoption (an API contract change; the live client has it in scope, the canvas `EditorialConversation` does not and already calls thread GET without one, which that route refuses with 400 `relationship_required`: SOURCE).
- Refuses every origin-less (older) thread and, if applied to undo, strands undo for them and after any Remove.
- Not recommended: more blast radius, and it takes away recovery.

**What (b) does not do:** it does not change retention, and it adds nothing the member can see.
**Plan if chosen (ws-delete style):** falsifiers — orphaned adoption refused with no authorization row and the writing byte-identical; live origin still applied; origin-less thread unchanged; list omits orphaned, keeps live and origin-less; undo unchanged. Defeat candidates — gate on the Work row but not the relationship; gate on the flag; filter the list but not adoption; refuse origin-less threads; mint the permission before refusing; refuse undo. Draft PR.

### (c) A member-facing way to see and delete retained editorial history without the Work

- **(c1) See — no migration.** A "conversations kept with this writing" view: frozen passage, dates, counts, the member's own words, per writing. The relationships route already lists by section; a writing-level read and a surface are new. Class A (it shows the member's own words).
- **(c2) Delete — needs a migration, and a constitutional change.** SOURCE (`20261021000002_writer_r20_editorial_erasure.sql`): editorial history is append-only, and the only exception is a transaction holding a member-deletion manifest whose **tombstone names the chain's manuscript**. So deleting a thread while the writing lives needs a *new deletion authority* in the database (a tombstone that names the chain or thread, with triggers that honour it), matching handling in `scripts/restore-governed.sh`, a decision on sealing (register C4), a Delete dialog that says truthfully what goes (turns, versions, spent authorizations, and the undo snapshots), and a restore witness. It is the only option that closes the custody question, and the only one that cannot be done under this task's standing limit ("do not touch migrations").
- **Cost:** a lane of its own, with its own authorization for the migration. Class A.

## 5. Recommendation, sequencing, and what is needed

1. **Floor, now, no code:** (a) plus the copy clause (6.9.5(e)). It makes the dialog true about the class of history that has no door.
2. **Next, because the flag is on:** (b-narrow), adoption and the list only, undo open. It closes the consistency gap at small cost and cannot strand anyone.
3. **Its own lane:** (c), starting with c1 and an explicit ruling on c2's migration. (b) does not substitute for it, and it raises its urgency.

**Production readout (REPORTED, founder-run, read-only, 2026-11-08): `WRITERS_STUDIO_EDITORIAL_ENABLED` is ON on `maia-sovereign`.** The command printed only on/off, no value. This is the case the earlier draft of this section called "if on": the flag is not holding the three flagged routes dormant, so **(b-narrow) should not wait on (c)**. Two things the readout does not establish: the commit the running container holds (so whether the container's build contains all four routes as read here was not checked), and whether any production member holds a retained editing thread whose Work was removed (nothing was counted). The check, for the record:

```bash
ssh soullab@minisforum 'docker exec maia-sovereign sh -c '\''test "$WRITERS_STUDIO_EDITORIAL_ENABLED" = 1 && echo on || echo off'\'''
```

Rulings still needed (the readout answers the former question 1; nothing below has been decided): **R1** (a), (b-narrow), (b-strict) or (c)? **R2** is undo gated (recommended: no)? **R3** the copy clause of 6.9.5(e)? **R4** is a (c) lane, including the c2 migration, authorized?

## 6. Not established

The commit the production container ran at the flag readout; whether any production member holds a retained editing thread whose Work was removed (nothing was counted); browser behaviour of any surface; the Save-working path and ask POST with an editorial thread id (section 3); the legacy-chain question of 6.9.5 (chains left by writings deleted before the R20 erase function existed).

PR [#2169](https://github.com/SoullabTech/Sovereign/pull/2169) was, when sections 1 to 7 were written, open, **not draft** and unmerged (head `836ab1e1`); **it merged the same day, 17:58 UTC.**

## 7. Reproduce

```bash
bash tests/constitutional/ws-delete/dynamic/run-retained-editorial-pg16.sh   # as root; PostgreSQL 16 binaries at /usr/lib/postgresql/16/bin
```

## 8. Decision and implementation (2026-11-08)

**Decision (founder, relayed in the session).** (a) recorded as the floor; **(b-narrow)** now; **undo not gated**; **the copy clause of 6.9.5(e): yes**; **(c): authorize design and testing first, hold the migration pending review.** Production readouts, founder-run, read-only, names and counts only, 2026-11-08: `WRITERS_STUDIO_EDITORIAL_ENABLED` is **on**; `writer_editorial_thread_origins` rows whose relationship is gone: **0 threads, 0 members** (the origin table exists in production). So the gap is closed before the first member reaches it. It is prevention, not repair of a case that exists. REPORTED, not reproduced here; the container's commit was not read.

**What was built** (branch `claude/relaxed-hamilton-hoxzy6`, draft pull request; two commits so the copy can be split off):
- `lib/writers-studio/orphanedEditorialOrigin.ts` — the one definition: the thread has an origin row **and** the relationship that row names no longer exists. The list embeds its SQL; adoption asks the function.
- **Adoption** refuses such a thread **before act 1** with `relationship_refusal` / `origin_unavailable`, HTTP **409** (the code the thread, open and version paths already use). No permission row is minted. The body stays two keys.
- **Relationships list** omits such a thread. Live threads and threads with no origin row are returned whole as before.
- **Undo, and the ask route's `?thread=` read, are unchanged** (declared; RT-4 and RT-2).
- **Copy** (separate commit): each Remove dialog now ends with *"The conversations you worked through passage by passage are among them, and no Work will offer them again."* It says what the Studio offers, never what can be reached.

**Evidence (EXECUTED here).**
- PostgreSQL 16 probe: **20 of 20** (`retainedEditorial.probe.test.ts`, was 16). RT-3 and RT-3b now assert 409, no authorization row, the writing byte-identical; RT-3c a live origin still applies; RT-3d the refusal precedes the legacy-locus guard (non-vacuous: the same adoption answers `legacy_locus` on a live origin); RT-9 older origin-less threads untouched; RT-10 the declared gap.
- Hermetic: `orphanedOriginGate.test.ts` (16) and `originUnavailable.test.ts` (4). The lane's 19 hermetic suites: **492 of 492**. The original delete PG harness: **77 of 77**. `npm run typecheck`: no regressions.
- **Defeat candidates: 26 of 26 killed**, each on the test written for it (OG1 to OG14 in `tests/constitutional/ws-delete/mutants/run.mjs`, with a `p` twin where a database can see it; CX10 to CX12 for the clause). Two candidate-hygiene corrections found on the way: OG4's first replacement changed operator precedence and was killed partly for the wrong reason (rewritten so it embodies one error); a probe, RT-3d, first passed vacuously because a headingless section can never be legacy (rebuilt, and made to prove the legacy guard fires first). **No candidate for "gate on the Work row instead of the relationship"**: the relationship is deleted by cascade from the Work, so no observable behaviour tells them apart (irreducible).

**Stated limits.**
- A **pre-check, not the mutation boundary**: a Remove committing between the check and the write lets one adoption through. Not a safety defect here (the owner's explicit gesture on their own writing); moving it inside `executeAuthorization` changes a function other callers share.
- **The declared gap (RT-10, ruling R5 owed).** A Work that still exists but **withdrew the writing's declaration** (the expressions route deletes that row and nothing else) keeps its relationship, so the thread is not orphaned by this definition although the gated paths refuse it: the list still offers it and adoption still applies. Widening the definition to "relationship **or** declaration gone" is a small change to the one definition and would flip RT-10; it was not made because the approved predicate was the relationship only.
- The ask route's `?thread=` read stays open on purpose: it is the member's only sight of what is retained until (c) gives them a door.
- Not exercised: Save-working; any browser surface; `POST …/ask` with an editorial thread id.
- **Pre-existing, not mine, found on the way:** (1) `run.mjs --check` fails on the base for J3 and S3: the manuscripts DELETE route now has a second `viaWork` block (the offline-cabin branch), so those two anchors match twice; (2) `lib/writers-studio/__tests__/relationshipCarry.test.ts` and `relationshipCarrySources.test.ts` fail 7 of 7 with and without this change.

**(c) design.** Not started in this change. The constraint it must design around is in section 4: deleting editorial history while the writing lives needs a new database deletion authority, because the only one today requires a member-deletion tombstone that names the chain's manuscript.

**Rulings still owed:** **R5** widen the orphan definition to include a withdrawn declaration? (recommended: yes, as its own small change, once someone has looked at the withdraw flow's intent.) **R6** when does (c) get its design record, and who reviews the migration?

## 9. Reproduce (as built)

```bash
bash tests/constitutional/ws-delete/dynamic/run-retained-editorial-pg16.sh                       # 20 probes; as root, PG16 binaries
node tests/constitutional/ws-delete/mutants/run.mjs OG1 OG1p OG2 OG2p OG3 OG3p OG4p OG5 OG5p OG7 OG7p OG8 OG8p OG9 OG9p OG10 OG10p OG11 OG12 OG13 OG14 OG14p CX10 CX10b CX11 CX12
```
