# WRITERS-STUDIO-CONVERGENCE-01 · H1-R3 — CONTROLLED COHORT DEPLOYMENT AND ADMISSION WITNESS · 2026-10-01

```text
Class: A programme · rollout admission (no arrival semantics change)
Mechanism under test: #1578 (H1-R2 convergence) — DRAFT, merge held
Prior rollout: #1551 runtime 3421a2096 with the H1 cohort ALREADY OPEN (see §2)
Standing: R3 OPENED · CENSUS DONE · ⭐ FOUR RULINGS TAKEN (§7) · RUNBOOK READY (§8)
          · ⛔ step 1 not yet run · ⛔ no merge · ⛔ no deploy · ⛔ no env change
Untouched by this record: #1539, #1542, production
```

R3 does not modify arrival semantics. Its job is to prove that **the governed seam behaves
correctly for a deliberately bounded set of real people in production**, with code authority,
identity authority, URL interpretation, deployment and human admission each a separate observable act.

## 1 · R2 standing and the two rulings carried in

**H1-R2 — IMPLEMENTED · FALSIFIED · BUILD-PROVEN · PR OPEN (#1578, draft) · NOT YET DEPLOYED.**
The repair removed an authority rather than adding one: `work=` has exactly one interpreter
(`app/writers-studio/h1Arrival.ts`). Re-verified 2026-10-01 on #1578's current head `6e44edca3`
(another session merged canon `e28118ba0` into the branch; no H1 file changed): matrix lethal and
conformant, lane typecheck clean, 129/129 targeted tests.

**Ruling R2-T — the timeout is fail-closed and is NOT an admission decision.**
*Timeout does not mean "denied by authority". Timeout means "admission fact unavailable; therefore
do not admit."* The state machine is:

```text
unresolved
   ↓
resolved, server said admitted=true   → admitted
resolved, server said admitted=false  → not admitted                  (authority's decision)
timeout                               → not admitted / unavailable    (no decision was received)
error / non-2xx / malformed           → not admitted / unavailable    (no decision was received)
```

⚠️ The R2 code settles all four non-admitted cases to the same `{ admitted: false, resolved: true }`,
so the two meanings are **indistinguishable at runtime today**. That is correct for authority, since
both must not admit. It does matter for telemetry and debugging: any later instrumentation must
carry `unavailable` as its own reason and must never report a timeout as a denial. ⛔ Not changed in
R2 (no reopening); recorded here as the binding reading.

**Ruling R2-N — the hook keeps the #1551 name.** `useHouseStudioH1WorkClaim` now supplies only the
admission fact and does not hold the Work claim. Renaming during convergence would add semantic
churn and obscure lineage. Deferred until H1 is admitted and stable, and then only as its own cleanup.

## 2 · Census — production is not where the R3 plan assumed

The R3 plan assumed an empty cohort ("deploy the mechanism before installing the people"). Canon
records otherwise:

| Fact | Source |
|---|---|
| Production runtime is **`3421a2096`** (#1551), image `maia-sovereign:3421a2096` built 2026-10-01T01:08Z; `:current`/`:prod` → `3421a2096` | `PRODUCTION_DEPLOYMENT_HISTORY_2026-09-30.md` |
| The H1 cohort is **open**: `HOUSE_STUDIO_H1_ENABLED=true`, `HOUSE_STUDIO_H1_MEMBER_IDS=<4 UUIDs>`; configured 4, resolved 4 read-only against `members`, no extra ids | `H1-COHORT-GATE_PRODUCTION_ROLLOUT_2026-09-30.md` (#1565) |
| The four are "founder-designated"; their UUIDs were **deliberately kept out of source control**; production config is the operational authority | same |
| Opening act: `.env.production` edited (backup `.env.production.h1-20261001T012910Z.bak`), **only `maia` force-recreated** from the current image | same |
| A first human witness is **pre-registered, not yet run**, pinned to runtime `3421a2096`, and its repository record "does not preserve the member's name" | `H1-FIRST-HUMAN-WITNESS_PROTOCOL_2026-09-30.md` (#1572) |

Three consequences:

1. **#1578 and #1551 read the same env pair**, so deploying #1578 swaps the mechanism *under people
   who are already admitted*. Without a deliberate act, the "new mechanism + unchanged/empty cohort =
   nobody newly admitted" intermediate state does not exist.
2. **The four installed UUIDs have not been shown to be the four named people.** The rollout record
   names no one, so ledger step 1 must establish it.
3. **Where the ledger lives is already constrained.** Two canon records chose to keep UUIDs and names
   out of the repository. The ruling "names belong in the human record; IDs belong in authority" is
   consistent with that (authority = the production env), but a repository ledger listing name↔UUID
   pairs would not be (§3).

## 3 · Cohort-ID ledger

| # | Human (human record only) | Canonical member id | Resolved in `members` | Installed in production env |
|---|---|---|---|---|
| 1 | Nathan Kane | ⏳ owed | ⏳ | ⏳ |
| 2 | Jondi Whitis | ⏳ owed | ⏳ | ⏳ |
| 3 | Andrea Fagan | ⏳ owed | ⏳ | ⏳ |
| 4 | Andrea Nezat | ⏳ owed | ⏳ | ⏳ |
| — | Non-cohort witness (proposed: founder account; H1 grants no inheritance) | ⏳ owed | ⏳ | must be **absent** |

**Resolution procedure** (read-only, run on minisforum; no session or credential read):

```bash
ssh soullab@minisforum 'docker exec -i maia-postgres psql -U soullab maia_consciousness -At' <<'SQL'
SELECT id, name, username FROM members
 WHERE name ILIKE ANY (ARRAY['%Nathan Kane%','%Jondi Whitis%','%Andrea Fagan%','%Andrea Nezat%'])
 ORDER BY name;
SQL
```

Stop conditions: a name resolving to **0 or >1 rows** (both Andreas share a first name, so the full
name must match exactly one row) → stop and resolve by a founder-confirmed username, never by guess.
Then compare against the installed list **without printing it into any shared log**, e.g.
`grep -c` of each resolved id against `HOUSE_STUDIO_H1_MEMBER_IDS` on the host. Expected 4 of 4, plus
an id count of exactly 4.

⚠️ **Ruling owed: what this file may hold.** Recommended, consistent with #1565 and #1572: this
repository table keeps **rows 1–4 as participant-neutral labels (`C1`–`C4`) with a non-reversible
fingerprint per id** (first 12 hex of `sha256(id)`), the counts, and the match result. The
name↔id mapping lives in the founder's private human record. Fingerprints let a later witness prove
"the same four" without the repository ever pairing a person with an id.

## 4 · Deployment sequence — amended for a live cohort

> ⚠️ **SUPERSEDED by §8** (founder sequence, 2026-10-01). Kept as the proposal the ruling answered.

The frozen principle stands: **deploy the mechanism before installing the people, and never merge
code and membership into one opaque event.** Because people are already installed, honouring it
means closing the cohort first:

```text
 1. Resolve and record the cohort ledger (§3); confirm installed == the four named
 2. Record current production: container GIT_COMMIT, image, :current/:prod   (expect 3421a2096)
 3. Founder lifts the draft hold on #1578; record the PR head SHA
 4. Merge #1578; record the canonical merge SHA
 5. CLOSE the cohort: HOUSE_STUDIO_H1_ENABLED=false (env backup first); recreate maia ONLY
 6. Verify closed on 3421a2096: admitted-member admission → { admitted: false }; House → /writers-studio
 7. Deploy canonical by its SHA (scripts/pre-deploy-gate.sh deploy-maia <sha>)
 8. Verify production: container GIT_COMMIT == merge SHA (printenv AND Config.Env), image tags,
    /api/health, converged code present (h1Arrival.ts resolveH1Arrival in the image)
 9. Verify the admission endpoint fail-closed with the new mechanism and the cohort still closed:
    unauthenticated → 401 {admitted:false}; any member → {admitted:false}
10. REOPEN: HOUSE_STUDIO_H1_ENABLED=true with the ledger's four ids; recreate maia only
11. Verify exactly those four admitted (by fingerprint) — R3-F1
12. Verify one non-cohort member excluded — R3-F2
13. Walk House → Writer's Studio for cohort members; all four controller arrivals — R3-F3, R3-F4
14. Record evidence
15. Decide H1 admission
```

**The alternative, not recommended:** deploy #1578 under the live cohort (skip 5, 6 and 10) and witness
continuity across the swap. That is one step shorter, but it fuses a mechanism change with standing
membership into one event, so a defect could not be attributed to code versus cohort. The cost of
the recommended path is a short window in which the four lose the H1 crossing. Writer's Studio, their
Works and manuscripts are unaffected (the ruled scope of H1), and the human witness has not run, so
no observation is interrupted.

⚠️ **Two operational findings, recorded and not repaired here:**
- **Cohort mutation runs on the unlocked path.** Steps 5 and 10, like #1565's opening act, edit
  `.env.production` and recreate `maia` with a bare `compose up`. That path takes no deploy-lane lock
  and runs no provenance verify (2026-09-07 finding). Run cohort acts only when no deploy is in
  flight. `fuser -v ~/MAIA-SOVEREIGN/.deploy.lock` must show no holder.
- **The human witness protocol is pinned to `3421a2096`.** If it runs after step 7, it must be re-pinned
  to the merge SHA before it starts. Recommended: run it after step 13, on the converged runtime.

## 5 · R3 falsifiers

**Law (carried from R2):** *authority semantics identical across all four controllers; presentation
timing may differ.* Home may show "Opening…" while Write, Review and Develop render the ordinary
resolution (inherited from #1551). R3 tests the **decision**, never identical transitional UI.

| | Falsifier | Where it is witnessed |
|---|---|---|
| R3-F1 | A cohort member can enter the governed House → Studio path | production (step 11, step 13) |
| R3-F2 | A non-cohort member cannot enter it | production (step 12) |
| R3-F3 | A bare `work=` claim cannot manufacture admission | production: the non-cohort member hand-types an owned `work=` and gets the ordinary resolution |
| R3-F4 | Admission survives normal House → Studio navigation without another controller interpreting `work=` | production walk across Home → Write → Develop → Review, plus the R2 structural F8/F11 on the deployed SHA |
| R3-F5 | Admission endpoint failure, timeout or malformed response fails closed | **mechanically, not in production** (R2 unit + matrix F5). Production witnesses only the reachable case: unauthenticated → 401 `{admitted:false}`. ⛔ No fault injection into production |
| R3-F6 | Removing a member removes admission without changing Studio code | production: steps 5–6 witness it at **population** level on the same image (switch closed → everyone out, no code change). A **per-member** removal witness would remove a real person. ⚠️ Ruling owed: accept population-level plus the mechanical per-member proof (`houseStudioH1Access` H2), or nominate a removal |

## 6 · Rulings owed before step 1 runs

> ✅ **ALL FOUR TAKEN — see §7.**

1. **Ledger custody (§3):** participant-neutral labels plus fingerprints in the repository, mapping in
   the private human record? (recommended)
2. **Sequence (§4):** close → deploy → verify closed → reopen? (recommended), or deploy under the live
   cohort?
3. **R3-F6 scope (§5):** population-level witness plus the mechanical per-member proof, or a nominated
   per-member removal?
4. **Who walks (step 13):** H1 grants no founder inheritance, so the founder's account cannot take the
   admitted path unless its id is added. That would make a fifth cohort member. Either the four walk
   it themselves, per the #1572 protocol, or the founder is explicitly added and recorded.

## 7 · Founder rulings (2026-10-01)

| # | Question | Ruling |
|---|---|---|
| 1 | Ledger custody | **C1–C4 + a one-way fingerprint per id in the repository**; the name→id mapping (Nathan Kane, Jondi Whitis, Andrea Fagan, Andrea Nezat) stays outside source control. The record states only that the four fingerprints correspond to the founder-designated cohort. |
| 2 | Sequence | **Close cohort → deploy #1578 → verify closed → reopen cohort → walk.** Closure and reopening are recorded as **explicit production-state transitions**, never incidental config edits. A short interruption is preferable to changing the mechanism under admitted members and being unable to tell a code defect from a cohort-state defect. |
| 3 | R3-F6 | **Full cohort closure plus the existing per-member test is sufficient.** ⛔ No real member is removed to produce a prettier witness. Closure proves admission can be withdrawn by authority/configuration without changing Studio code; `houseStudioH1Access` (H2, H6) proves the per-member semantics. |
| 4 | Who walks | **One of C1–C4, under the pre-registered #1572 protocol.** ⛔ Kelly is not added as a fifth member, so the cohort stays stable and the witness does not mutate the population it observes. |

**Binding limitation (R3-F5):** production evidence covers the fail-closed denial paths that can be
observed safely: signed out → 401, a non-cohort member → `{ admitted: false }`, and the switch closed
→ nobody. **Timeout and malformed-response behaviour remain test-proven, not production-induced.**
⛔ Production is not broken to make the matrix symmetrical.

**Truth table.** R3 witnesses exactly two of the four Early Field × H1 states:
**Early Field CLOSED / H1 OPEN** and **Early Field CLOSED / H1 CLOSED**. The other two
(Early Field OPEN with H1 OPEN or CLOSED) are **explicitly unwitnessed**. Step 2 must confirm Early
Field is actually CLOSED in production. If it is not, stop: the two states named here would not be
the ones observed.

## 8 · Runbook (founder-run; nothing below has been executed)

**Evidence classes, never merged:** **WITNESSED** = a literal output line or a direct observation.
**ENTAILED** = follows from configuration plus code that has been read, without being observed for
that member. "Exactly these four are admitted" is ENTAILED from the installed fingerprints. It is
WITNESSED only for the member who walks.

**Fingerprint function** (used at steps 2, 5, 8 and 11). It reads the env **in force in the running
container**, not the file, prints only 12-hex sha256 prefixes of lower-cased ids, and never prints an id:

```bash
ssh soullab@minisforum 'docker exec maia-sovereign sh -c '"'"'
  echo "HOUSE_STUDIO_H1_ENABLED=${HOUSE_STUDIO_H1_ENABLED:-<unset>}"
  echo "EARLY_FIELD_ENABLED=${EARLY_FIELD_ENABLED:-<unset>}"
  echo "${HOUSE_STUDIO_H1_MEMBER_IDS:-}" | tr "," "\n" | tr -d " " | grep -v "^$" | tr "A-F" "a-f" \
    | while read id; do printf %s "$id" | sha256sum | cut -c1-12; done | sort | nl
'"'"''
```

The ledger fingerprints (rows C1–C4) are computed **privately** from the four resolved ids with the
same normalisation (`printf %s "<id lower-case>" | sha256sum | cut -c1-12`). Only the prefixes enter
this file.

| Step | Act | Evidence to record |
|---|---|---|
| 1 | Confirm no deploy is in progress: `ssh soullab@minisforum 'fuser -v ~/MAIA-SOVEREIGN/.deploy.lock'` | no holder (WITNESSED). Cohort acts take no lane lock, so this is the only guard |
| 2 | Capture production: `printenv GIT_COMMIT`, `Config.Env` GIT_COMMIT, `:current`/`:prod` tags, `/api/health`, the fingerprint function | expect `3421a2096`; `HOUSE_STUDIO_H1_ENABLED=true`; **4** fingerprints equal to ledger C1–C4; `EARLY_FIELD_ENABLED` not `true` (else **stop**, §7) |
| 3 | **TRANSITION T1 — H1 OPEN → CLOSED.** Back up `.env.production` (`cp .env.production .env.production.h1-r3-close-$(date -u +%Y%m%dT%H%M%SZ).bak`), set `HOUSE_STUDIO_H1_ENABLED=false`, **leave the id list untouched** | backup path; the diff of the env file is exactly one line (WITNESSED) |
| 4 | Recreate maia only: `docker compose -f docker-compose.production.yml up -d --no-deps --force-recreate maia` | container `Created` timestamp; still `3421a2096` |
| 5 | Verify closed on #1551 | fingerprint function → `ENABLED=false`, the same 4 fingerprints (WITNESSED). Signed out `GET /api/house-studio/admission` → 401 `{admitted:false}` (WITNESSED). Kelly signed in → `{admitted:false}` and the House Writing link → `/writers-studio` (WITNESSED). Cohort members → not admitted (**ENTAILED**). Studio, Works and manuscripts open normally for Kelly (WITNESSED) |
| 6 | Lift #1578's draft hold; merge; deploy by SHA: `scripts/pre-deploy-gate.sh deploy-maia <merge-sha>` (the full deploy path is not needed: no migration) | PR head SHA, merge SHA, gate output incl. Co-Lab `0 failed` |
| 7 | Verify the production commit and image | `printenv GIT_COMMIT` == `Config.Env` == merge SHA; `:current` → merge SHA, `:previous` → `3421a2096`; `/api/health` version; converged code present: `docker exec maia-sovereign sh -c 'grep -rl resolveH1Arrival .next/server \| head -1'` non-empty |
| 8 | Verify H1 still closed under the new mechanism | repeat step 5's checks on the merge SHA |
| 9 | **TRANSITION T2 — H1 CLOSED → OPEN, exactly C1–C4.** Back up, set `HOUSE_STUDIO_H1_ENABLED=true`, id list unchanged | backup path; one-line diff (WITNESSED) |
| 10 | Recreate maia only (as step 4) | `Created`; still the merge SHA |
| 11 | Verify exactly C1–C4 | fingerprint function → `ENABLED=true`, **exactly 4** fingerprints equal to the ledger (WITNESSED); admission for those four (**ENTAILED**) |
| 12 | #1572 admitted-member walk with **one of C1–C4** | per #1572, with the participant-neutral label only. **R3-F1 and R3-F4 WITNESSED** for that member. ⚠️ #1572 is pinned to runtime `3421a2096`; for this run the runtime is the merge SHA, recorded here as an amendment of that pin and never as a silent change |
| 13 | Ordinary-member denied path (Kelly, non-cohort) | House Writing link → `/writers-studio` (R3-F2); hand-typed owned `work=` → the ordinary resolution, identical to without it (R3-F3); `/api/house-studio/admission` → `{admitted:false}` (WITNESSED) |
| 14 | Record the two observed states | **Early Field CLOSED / H1 OPEN** (steps 11–13) and **Early Field CLOSED / H1 CLOSED** (steps 5 and 8) |
| 15 | Leave the other two states explicitly unwitnessed | Early Field OPEN × H1 {OPEN, CLOSED}: **UNWITNESSED** |

**Stop conditions.** Each of these stops the run and is reported, never worked around:
- step 1 shows a lock holder;
- step 2 fingerprints ≠ ledger, the count ≠ 4, or Early Field is open;
- any env diff larger than the one intended line;
- the step 7 provenance doesn't match the merge SHA (the deploy gate is fail-closed and aborts);
- any step 5 or 8 check admits anyone;
- step 11 shows a fingerprint not in the ledger.

**Rollback at any point.** Set `HOUSE_STUDIO_H1_ENABLED=false` and recreate maia (closes H1 for
everyone). For the code: `scripts/deploy-production.sh rollback` to `:previous` = `3421a2096`. Neither
hides Writer's Studio, Works or manuscripts.

### Ledger (to be filled at step 2 — fingerprints only)

| Label | Fingerprint (sha256[0:12]) | Matches installed |
|---|---|---|
| C1 | ⏳ | ⏳ |
| C2 | ⏳ | ⏳ |
| C3 | ⏳ | ⏳ |
| C4 | ⏳ | ⏳ |
| Non-cohort witness | (Kelly's account; fingerprint not recorded) | must be **absent** |
