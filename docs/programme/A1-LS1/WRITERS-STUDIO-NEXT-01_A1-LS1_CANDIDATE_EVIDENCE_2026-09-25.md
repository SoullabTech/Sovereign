# WRITERS-STUDIO-NEXT-01 / A1-LS1 — CANDIDATE EVIDENCE (STOPPED)

**Status:** CANDIDATE ONLY · ⛔ **§11 STOP RAISED — one additive mutant SURVIVED the authoritative run** · no merge · no deploy · no production contact.
**Date:** 2026-09-25 · **Builder:** CC

| Identity | Value |
|---|---|
| Parent packet | `WRITERS-STUDIO-NEXT-01_A1-LS1_EXECUTION_PACKET_2026-09-25.md` · SHA-256 `290883cd4106747e643c9e28f0536b480fe40efa07fa9121d4339c2e783a0334` · 12,371 B |
| Amendment | `A1-LS1-R3` · SHA-256 `d722648ead906ebfc52cdbdacf914ba4056f2a081d1b605fb26cbdcccefe5e29` · 6,307 B (transport `aa9b152a`) |
| Exact base | `e886888416062c7fcbcf899040e3827bc8013835` (candidate parent — verified `HEAD^`) |
| **Candidate** | **`c723dc8cc9599e68b61f95d6be012ed53988e571`** on `feature/ws-a1-ls1-authorship-safety-20260925` |
| Frozen LS0 instrument manifest | SHA-256 `c256514c0c149032104b351a11f139d9e74b962b41d45605a99408557d2ce026` — re-verified byte-for-byte before the run, every file matching |
| **Frozen LS1 instrument manifest** | **SHA-256 `86d572539f7bf6dbeb768f7c98ab08cfb36d2c320aca9731322db4139a264b97`** (frozen 2026-09-25T04:31:17Z, before the authoritative run) |
| Authoritative run | 2026-09-25T04:31:27Z → 07:09:03Z · `ls0_matrix_exit=0` · `ls1_auth_exit=0` |

---

## 0. The stop, first

`M-A3-outside-lock-check` **SURVIVED** the authoritative run (§5). The packet's §11 names this a stop condition: *additive acceptance cannot distinguish a deliberately broken repair.* It is reported here, not repaired: the frozen instruments were not edited and nothing was re-run under a changed instrument.

- **What the mutant does.** It reads the section body **before** taking the draft row lock and compares the observed digest against that early read.
- **What the frozen check does.** It fires three rounds of 8 concurrent same-observation saves and requires exactly one winner per round (`lockedComparisonSingleWinner`).
- **Practice run.** The saves' reads interleaved before the first commit, so the mutant got more than one winner and was KILLED.
- **Authoritative run.** The requests were served one after another, so each read the already-committed body. The mutant scored `[1,1,1]` winners and passed.
- **What that means.** The check rejects an outside-the-lock comparison only when timing happens to expose it; nothing in the check forces that timing. That is a defect in the instrument, not the candidate. The candidate's comparison is under the lock (§8).

A **proposed** repair is in `proposal/` (§11). It is not frozen and not evidence. It forces the interleaving deterministically, and in practice it killed the mutant 3/3 while the candidate passed 3/3. Using it would require founder authorization to re-freeze the instruments and repeat the authoritative run.

---

## 1. Changed-path census (base → candidate)

| Path | +/− | Repair |
|---|---|---|
| `app/writers-studio/rebuild/RebuildStudioClient.tsx` | +92 −20 | R1 arrival · R2 whole-draft save truth, Draft vN removed · R3 rail + section markers · R5 focus hold / restore |
| `app/writers-studio/rebuild/RebuildAuthoredBody.tsx` | +49 −5 | R5 selection capture and restore; the editor node is never replaced |
| `app/writers-studio/rebuild/RebuildWritingBoundary.tsx` | +75 −2 | R3 observed-body digests · R4 `beforeunload` guard + keepalive transport |
| `lib/writersStudio/sectionSaveQueue.ts` | +32 −4 | R3 per-section containment; base version advances only on a version-path acceptance |
| `lib/writersStudio/sectionSaveClient.ts` | +42 −4 | R3 digest carriage + acceptance path · R4 keepalive within a 48 KiB budget |
| `lib/manuscript/sections/saveSection.ts` | +57 −4 | R3 section-local precondition under the existing lock |
| `app/api/sovereign/manuscripts/[id]/sections/[sectionId]/route.ts` | +10 −2 | R3 digest pass-through; reports acceptance path and saved-body digest |

- **Scope.** Seven paths: the live `rebuild/` host and the directly supporting persistence. None falls in a forbidden category (§9).
- **Schema.** `git diff --name-only e8868884 c723dc8 -- database/ '*.sql'` → **0 paths**. No migration, no schema change, and nothing new is persisted (§8).

---

## 2. Frozen LS0 regression on the candidate

The frozen LS0 matrix ran **unchanged** on candidate HEAD across all six flag configurations. `evidence/ls0-regression/matrix.log`:

| Scenario | Candidate, all six configs | Required | |
|---|---|---|---|
| S1 arrival | `CANONICAL_PREVENTS_IT` | no longer RED | ✅ |
| S2 Home place | `RED_REPRODUCED` | RED, unchanged | ✅ |
| S3 Home place | `RED_REPRODUCED` | RED, unchanged | ✅ |
| S4 save truth | `INSTRUMENT_FAILURE` | amendment §5 | see §2a |
| S5 conflict latch | `INSTRUMENT_FAILURE` | amendment §4 | see §2b |
| S6 departure | `CANONICAL_PREVENTS_IT` | no longer RED | ✅ |
| S7 Full Canvas | `CANONICAL_PREVENTS_IT` | no longer RED | ✅ |
| S8 revisions | `RED_REPRODUCED` | RED, unchanged | ✅ |
| S9 checkpoint control | `GREEN_CONTROL_ESTABLISHED` | GREEN, unchanged | ✅ |

- Across the six flag configurations: `governing=[]` and `obsVariance=[]` for every scenario.
- `CANONICAL_PREVENTS_IT` is **not** taken as acceptance (packet §5); A1, A4 and A5 are the oracles.
- **S2, S3 and S8 did not change, and S9 did not change. No scope-escape stop.**

### 2a. Frozen S4 — two causes, of which the amendment names one

The basis is `precondition not established` (`evidence/ls0-regression/C0-all-off/results.json`).

1. **The anchor (amendment §5, as expected).** Frozen `footerStatus` looks for `/words · draft v\d+/`. R2 removed that text, so `found:false`, `footerLabelsSeen:[]`, and the frozen observer cannot see any label.
2. **The injected fault (not named in §5).** S4(b) creates its failure by bumping **only** the draft version (`UPDATE … SET version = version + 1`) and then saving Scene 1.1. Under R3 that section's body is unchanged and its digest matches, so the save is **accepted: `editRefusedStatus: 200`, where frozen S4 needs 409**.
   - This is the same R3 consequence that amendment §4 addresses for S5: a draft-version change that does not touch the section being saved no longer conflicts.

**This is flagged for adjudication, not self-classified.** A2 is the save-truth oracle. On the candidate it is GREEN in all six configurations, including off-chapter error and off-chapter conflict visibility, each created by a fault that does reach it.

### 2b. Frozen S5 — as amendment §4 expects

The basis is `conflict precondition not established`. Session A edits a **different** section on an older draft version, gets `sessionAFirstRefusal: 200` instead of 409, and the later section also persisted. This is exactly what the amendment describes; A3 is the oracle.

---

## 3. Additive A1–A5 — authoritative, frozen instruments

The frozen `ls1-e1-acceptance.mjs` ran on candidate HEAD. Each configuration was freshly provisioned (frozen LS0 provision), used the loopback stub, and ran the server under `env -i` (frozen LS0 launcher).

| Law | C0 | C1 | C2 | C3 | C4 | C5 | Checks |
|---|---|---|---|---|---|---|---|
| A1 Arrival | GREEN | GREEN | GREEN | GREEN | GREEN | GREEN | 10 |
| A2 Save truth | GREEN | GREEN | GREEN | GREEN | GREEN | GREEN | 7 |
| A3 Conflict | GREEN | GREEN | GREEN | GREEN | GREEN | GREEN | 12 |
| A4 Departure | GREEN | GREEN | GREEN | GREEN | GREEN | GREEN | 13 |
| A5 Full Canvas | GREEN | GREEN | GREEN | GREEN | GREEN | GREEN | 9 |

C0 all off · C1 editorial · C2 focus · C3 discuss · C4 standing · C5 all four on.

Named checks:
- **A1:** `validExplicitPlaceHonoured`, `absent|stale|invalidResolvesToFirstSection`, `absent|stale|invalidAddressRepairedToResolved`, `noChapter10Heuristic`, `zeroArrivalScroll`, `zeroArrivalScrollCalls`.
- **A2:** `savedAfterInitialLoad`, `unsavedWhileStaged`, `savingWhileInFlight`, `savedAfterAcknowledgement`, `offChapterErrorVisible`, `offChapterConflictVisible`, `draftCounterAbsent`.
- **A3:** `differentSectionSaves`, `sameSectionConflicts`, `conflictVisibleWholeDraft`, `conflictMarkedAtSection`, `unrelatedSavesWhileConflicted`, `conflictPersistsAfterUnrelatedSave`, `noResolutionUi`, `missingDigestFallsBackToVersionRule`, `invalidDigestFallsBackToVersionRule`, `lockedComparisonSingleWinner`, `digestOverExactDeliveredBytes`, `latestAcknowledgedDigestWins`.
- **A4:**
  - Guarding and keepalive: `dirtyDepartureGuarded`, `textSurvivesRefusedDeparture`, `eligibleDepartureUsesKeepalive`, `eligibleDeparturePersistsAfterLeave`, `acknowledgedDepartureNotGuarded`, `oversizedSaveNotKeepalive`.
  - Unconfirmed saves: `unconfirmedNeverClaimsSaved`, `unconfirmedDepartureGuarded`, `unconfirmedEligibleNeverClaimsSaved`, `unconfirmedEligibleDepartureGuarded`.
  - No local copy of prose: `noLocalStorageProse`, `noSessionStorageProse`, `noIndexedDbProse`.
- **A5:** `pointerEntryPreservesTuple`, `pointerReturnPreservesTuple`, `pointerPathSameEditorNode`, `sectionNeverRemounted`, `keyboardEnterEntryRestoresTuple`, `keyboardSpaceEntryRestoresTuple`, `escapeReturnsFromFullCanvas`, `escapeReturnPreservesTuple`, `noNewKeyboardShortcut`.

Evidence records identities, states, statuses, offsets and booleans only; no prose.

---

## 4. The late-digest race (founder-directed attack)

The positive law is `latestAcknowledgedDigestWins`: *the digest associated with the latest acknowledged body always wins, regardless of promise-resolution order.*

- **Construction (not timing-dependent).**
  - Every page-side SHA-256 is held for 12 s. These are the mount-time digests of the delivered bodies.
  - Two saves of Scene 2.1 are acknowledged **first**; the witness **asserts** that no held digest has resolved yet (else `INSTRUMENT_FAILURE`).
  - All held digests are then allowed to resolve, **last**, including the stale digest of B's delivered body.
  - Another writer then changes a different section, and a third save of B must be accepted (200) **and persist**.
- **Design that makes it hold.** The observed digest after a save is set **synchronously from the acknowledgement**; the server returns the SHA-256 of exactly the body it stored. The queue serializes acknowledgements, so they decide the observed state in the order they happened. A mount-time digest is dropped for any section a save has already advanced. No outstanding computation can reorder the result.
- **Mutant `M-A3-late-digest-overwrite`** removes that guard and is **KILLED** on `latestAcknowledgedDigestWins`: the stale digest lands last, and B's next save is falsely refused.

---

## 5. Mutants (authoritative, C0, frozen suite) — 28 KILLED · **1 SURVIVED**

Each mutant is the committed candidate with its exact-match edit(s) applied to a second clean checkout of `c723dc8`, running on its own dev server. Only the targeted law is run.

| Mutant | Law | Verdict | Failed checks |
|---|---|---|---|
| `M-A1-stale-address-retained` | A1 | KILLED | absent/stale/invalidAddressRepairedToResolved |
| `M-A1-chapter10-restored` | A1 | KILLED | absent/stale/invalidResolvesToFirstSection, …AddressRepaired…, noChapter10Heuristic |
| `M-A1-repair-coupled-to-scroll` | A1 | KILLED | zeroArrivalScroll, zeroArrivalScrollCalls |
| `M-A2-chapter-scoped-status` | A2 | KILLED | offChapterErrorVisible, offChapterConflictVisible |
| `M-A2-saved-never-shown` | A2 | KILLED | savedAfterInitialLoad, savedAfterAcknowledgement |
| `M-A2-false-saved-despite-failure` | A2 | KILLED | offChapterErrorVisible, offChapterConflictVisible |
| `M-A2-draft-counter-restored` | A2 | KILLED | draftCounterAbsent |
| `M-A4-silent-leave` | A4 | KILLED | dirtyDepartureGuarded, textSurvivesRefusedDeparture, eligibleDeparturePersistsAfterLeave, unconfirmed…Guarded |
| `M-A4-saved-on-keepalive-attempt` | A4 | KILLED | unconfirmedEligibleNeverClaimsSaved, unconfirmedEligibleDepartureGuarded |
| `M-A4-local-prose-backup` | A4 | KILLED | noLocalStorageProse |
| `M-A4-keepalive-dropped` | A4 | KILLED | eligibleDepartureUsesKeepalive, eligibleDeparturePersistsAfterLeave, unconfirmedEligibleNeverClaimsSaved |
| `M-A5-entry-loses-focus` | A5 | KILLED | pointerPathSameEditorNode |
| `M-A5-return-loses-focus` | A5 | KILLED | pointerPathSameEditorNode |
| `M-A5-escape-broken` | A5 | KILLED | escapeReturnsFromFullCanvas, escapeReturnPreservesTuple |
| `M-A5-editor-remounted` | A5 | KILLED | pointerEntry/ReturnPreservesTuple, pointerPathSameEditorNode, sectionNeverRemounted |
| `M-A5-keyboard-restore-dropped` | A5 | KILLED | keyboardEnter/SpaceEntryRestoresTuple, escapeReturnPreservesTuple |
| `M-A3-draft-wide-only` ⁱ | A3 | KILLED | differentSectionSaves (+4 downstream) |
| `M-A3-same-section-overwrite` ⁱ | A3 | KILLED | sameSectionConflicts (+5 downstream) |
| **`M-A3-outside-lock-check` ⁱ** | **A3** | **⛔ SURVIVED** | **— (race produced `[1,1,1]`; see §0)** |
| `M-A3-missing-digest-bypass` ⁱ | A3 | KILLED | missing/invalidDigestFallsBackToVersionRule |
| `M-A3-conflict-disappears` ⁱ | A3 | KILLED | conflictPersistsAfterUnrelatedSave |
| `M-A3-unrelated-blocked` ⁱ | A3 | KILLED | unrelatedSavesWhileConflicted |
| `M-A3-rail-marker-hidden` | A3 | KILLED | conflictMarkedAtSection, conflictPersistsAfterUnrelatedSave |
| `M-A3-section-marker-hidden` | A3 | KILLED | conflictMarkedAtSection, conflictPersistsAfterUnrelatedSave |
| `M-A3-resolution-control` | A3 | KILLED | noResolutionUi |
| `M-A3-late-digest-overwrite` | A3 | KILLED | latestAcknowledgedDigestWins |
| `M-A3-version-adopted-after-digest-acceptance` | A3 | KILLED | sameSectionConflicts (+3 downstream) |
| `M-A3-accepted-by-misreported` | A3 | KILLED | sameSectionConflicts (+3 downstream) |
| `M-A3-digest-normalized` | A3 | KILLED | digestOverExactDeliveredBytes (+4) |

ⁱ = amendment §6 mandatory set. **5 of the 6 mandatory mutants were killed; `outside-lock-check` was not.**

- Every killed mutant failed its **intended** positive law, not an instrument crash. There were no INCONCLUSIVE results and no match failures.
- Per-mutant JSON: `evidence/ls1/C0-all-off/mutants/`.

---

## 6. Defect found by A3 in practice, repaired before freeze (amendment §3)

- **Defect (first R3 build).** After a save was accepted on the **body** rule, the client queue adopted the server's new draft version. That version included changes made elsewhere that this client had not seen. A later save of a section **changed elsewhere** then carried a matching version and passed **without its body ever being compared**: a silent same-section overwrite.
- **How it was found.** Practice A3 observed the stale same-section save return `200`, with state `Saved` and no markers.
- **Repair (in the candidate).** The server reports `acceptedBy: 'version' | 'observed_body'` and the SHA-256 of the body saved.
  - The queue advances its base only on a `version` acceptance (`sectionSaveQueue.ts:245`).
  - The observed digest is set from the acknowledgement.
- **Mutants that reintroduce it.** Both are KILLED on `sameSectionConflicts`:
  - `M-A3-version-adopted-after-digest-acceptance`: the client-side reintroduction.
  - `M-A3-accepted-by-misreported`: the server-side reintroduction.

---

## 7. Digest input definition (amendment §2)

- **Client.** SHA-256, lowercase hex, over the UTF-8 bytes of the section body **exactly as the context route delivered it**. The route derives it with `splitStoredSection(row.text, row.heading)` (`app/api/writers-studio/rebuild/context/route.ts:84`). After a successful save, the digest is the one the server returns for exactly the body stored.
- **Server.** Under the lock, it reads `manuscript_draft_sections.text`, applies the same `splitStoredSection`, and takes `sectionBodySha256(split.body)` (`saveSection.ts:161`, `createHash('sha256').update(body,'utf8')`). **No normalization of any kind.**
- **Proof.** `digestOverExactDeliveredBytes` is GREEN in all six configs:
  - a body containing a decomposed accent, indented and trailing whitespace, and trailing blank lines comes back from context byte-for-byte;
  - a digest over the exact bytes is accepted;
  - a digest over the NFC-and-trim form is refused (409).
  - `M-A3-digest-normalized` is KILLED.
- **Missing or invalid digest.** Only `/^[0-9a-f]{64}$/` is accepted (`saveSection.ts:158`). Anything else is treated as absent and the version rule decides alone: `missing|invalidDigestFallsBackToVersionRule` GREEN, `M-A3-missing-digest-bypass` KILLED.
- **Custody of the digest.** It is not displayed, not persisted, and not a version: no column, no migration (§1), held only in memory.

## 8. The comparison is under the lock — source proof

In `saveSection.ts`, inside `transaction(...)` → `saveSectionInTransaction`:

- `:193` `SELECT … FROM manuscript_working_drafts … FOR UPDATE` — takes the draft row lock.
- `:212` the version comparison.
- `:230` `splitStoredSection` over the section row read **after** `:193`.
- `:233` the digest comparison.
- Then the UPDATE of the section and the draft, in the same transaction.

**Nothing is read before the lock.**
- The existing callers `revisionAuthorization/execute.ts` and `editorialRuntime/recovery.ts` pass no digest, so they keep the version rule.
- ⛔ This section is source-level proof. **The authoritative behavioural witness for it is the check that failed to discriminate (§0)**, so the behavioural proof is presently **not established by the frozen suite**. The proposed deterministic witness (§11) supplies it in practice only.

## 9. No resolution UI

- `grep -rn "takeLocalVersion|discardLocalVersion" app/writers-studio/rebuild/` → **0**.
- The markers are a `●` `role="img"` span on the rail and a `role="note"` paragraph in the section. Neither contains a control.
- `noResolutionUi` GREEN in all six configs; `M-A3-resolution-control` KILLED.

## 10. Test succession, gates, migration sufficiency, integrity

- **Test succession: none required.**
  - The Jest set `(writers|Writers|manuscript|workbench|rebuild)` has **2,900 tests at base and 2,900 at the candidate**: 2,876 passed / 24 failed in 11 suites in both.
  - **0 new failures, 0 fixed.** All 24 fail identically at `e8868884`.
  - No existing test was edited, replaced or removed (`evidence/gates/jest-comparison.json`).
- **Gates on the candidate:**
  - `npm run typecheck`: no regressions, exit 0.
  - `check:no-supabase`: exit 0.
  - `check:design-canon`: 3 member-facing surfaces, covered by 2 Experience Contracts, exit 0.
  - `check:no-openai` and `check:no-direct-anthropic`: exit 0.
  - The pre-commit hook passed at commit (branch guard, the checks above, PHI gate).
- **Migration sufficiency.** For both the LS0 regression and the LS1 acceptance, in every configuration:
  - 498 migrations: 455 applied, 43 refused (no pgvector).
  - `runtimeDependent=0`, verdict **INDEPENDENT**, `pgErrors=0`.
  - The only touched object not created by an applied migration is `schema_migrations`, the migration instrument's own ledger, as in LS0.
- **Integrity** (frozen LS0 integrity instrument, 30 exercised paths): before and after, for both the candidate and mutant checkouts, `head=c723dc8…`, `dirty_paths=0`, `mismatches=0`.

## 11. Proposed instrument repair (NOT frozen · NOT evidence · founder authorization required)

`proposal/ls1-a3-lock-witness.mjs` forces the interleaving rather than hoping for it:

1. The witness takes the draft row lock itself (`SELECT … FOR UPDATE`).
2. It sends a stale-version save carrying the digest of the section's current body.
3. It waits until that save is observed **waiting on a lock** (`pg_stat_activity.wait_event_type='Lock'`; if not observed, `INSTRUMENT_FAILURE`).
4. It commits a change to that section's body.
5. It releases the lock.

A comparison under the lock sees the new body and refuses. A comparison against an earlier read accepts and overwrites.

Practice, non-evidential (`proposal/practice-non-evidential/`), 3 rounds each:

| Tree | Waited on lock | Status | Mark persisted | Other writer's change kept | Outcome |
|---|---|---|---|---|---|
| Candidate | 3/3 | 409 ×3 | no | yes | GREEN |
| `M-A3-outside-lock-check` | 3/3 | 200 ×3 | **yes** | **no — silently overwritten** | RED |

If authorized, the minimal act is:
1. Add this as an A3 check (e.g. `comparisonUnderLockRefusesChangedBody`), additive, leaving `lockedComparisonSingleWinner` in place.
2. Re-freeze the LS1 manifest.
3. Repeat the authoritative LS1 run on the **unchanged** candidate `c723dc8`.

The LS0 regression need not repeat unless directed.

## 12. Preserved limitations (packet §7)

- **This repair removes the hard-coded Chapter-10 fiction. It does not establish durable member place and does not repair Home's last-saved-as-place semantics.** Home may still produce a valid `?s` from last-saved evidence, and Write honours a valid explicit place. S2 and S3 remain RED as evidence of the external `OBSERVATION-ADDRESS-01` dependency.
- S8 remains RED: no revision or checkpoint on autosave or reading start, and no Keep-a-version. S9 proves only that the existing checkpoint substrate can clear `revision_not_current`.
- A held conflict has **no resolution path in LS1** by design. It stays Needs attention and unsaved until a later authorized mechanism.
- Keepalive is best-effort. A departure save above the 48 KiB budget is sent without keepalive, may be cut off, and is never claimed Saved; the guard stays armed.
- Production flag and migration state remain **UNKNOWN**. Everything here is E1: disposable, synthetic, loopback-stubbed.

## 13. Teardown

**E1 is held, not torn down**, pending the ruling on §0. A repaired-instrument re-run would use the same disposable cluster. It holds synthetic data only, has no network egress from the app, and no servers are running. Teardown is the LS0 procedure (stop cluster, remove `/tmp/ls0-e1-pg`, remove the run worktrees) and will be recorded when performed.

---

**FOUNDER ADJUDICATION — WRITERS-STUDIO-NEXT-01 / A1-LS1 CANDIDATE ONLY**
