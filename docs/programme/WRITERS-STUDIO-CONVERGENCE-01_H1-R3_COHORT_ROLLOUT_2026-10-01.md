# WRITERS-STUDIO-CONVERGENCE-01 · H1-R3 — CONTROLLED COHORT DEPLOYMENT AND ADMISSION WITNESS · 2026-10-01

```text
Class: A programme · rollout admission (no arrival semantics change)
Mechanism under test: #1578 (H1-R2 convergence) — DRAFT, merge held
Prior rollout: #1551 runtime 3421a2096 with the H1 cohort ALREADY OPEN (see §2)
Standing: R3 OPENED · CENSUS DONE · ⚠️ SEQUENCE AMENDED FOR A LIVE COHORT — FOUNDER RULING OWED (§4)
          · ⛔ cohort ledger not yet resolved · ⛔ no merge · ⛔ no deploy · ⛔ no env change
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

## 4 · Deployment sequence — amended for a live cohort (⚠️ founder ruling owed)

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

1. **Ledger custody (§3):** participant-neutral labels plus fingerprints in the repository, mapping in
   the private human record? (recommended)
2. **Sequence (§4):** close → deploy → verify closed → reopen? (recommended), or deploy under the live
   cohort?
3. **R3-F6 scope (§5):** population-level witness plus the mechanical per-member proof, or a nominated
   per-member removal?
4. **Who walks (step 13):** H1 grants no founder inheritance, so the founder's account cannot take the
   admitted path unless its id is added. That would make a fifth cohort member. Either the four walk
   it themselves, per the #1572 protocol, or the founder is explicitly added and recorded.
