# EARLY-FIELD-01 — Merge and Deployment Record

**Date:** 2026-10-01 · **Kind:** operational record. This is evidence about **deployment**, not
part of the certified implementation.

> **Authority (founder ruling, 2026-10-01):** this record is a **convergence / observation record and defers**. Deployment and rollback history: **`PRODUCTION_DEPLOYMENT_HISTORY_2026-09-30.md` (#1561) is authoritative** where the two overlap. H1 production activation: **`H1-COHORT-GATE_PRODUCTION_ROLLOUT_2026-09-30.md` (#1565) is authoritative.** Where this record and those disagree, they govern. Founder ruling: production history around admission is
kept out of the candidate (#1547 stayed frozen at its certified head) and recorded here.

> Production history belongs to the operational record. Certified implementation stays
> immutable between CI evidence and merge.

---

## 1 · Merge record (#1547)

| Item | Value |
|---|---|
| Merge commit = new canonical | **`cc1c5b4d79793dd7911d6aea0054e8c678d01bcb`** on `clean-main-no-secrets` |
| Merge parents | `71859c3a3` (canonical before merge) · `0e29c65df` (PR head) |
| Merged by | founder, merge commit (lineage preserved) |
| Certified code lineage | `c31b85a34` (certified) → `700d9d361` (canonical `89f7876e8` merged in) → `0e29c65df` (canonical `71859c3a3` merged in) — **all three are ancestors of `cc1c5b4d7`** |
| Why the head moved after certification | #1544 (docs only: one file, `H1-EXPOSURE_CENSUS_AND_RULINGS_2026-09-30.md`) landed on canonical; the branch was updated onto it at 00:05Z. No implementation commit was added. |
| Implementation identity | `diff(89f7876e8 → 700d9d361)` **==** `diff(71859c3a3 → cc1c5b4d7)`, byte for byte: the same 8 files, +601 / −2. |
| CI | All checks green on **both** `700d9d361` and `0e29c65df` (10/10 on `0e29c65df`, `build` completed 00:16:07Z). |
| Supersedes | #1542 (closed; same certified code) · #1541 (closed; alternative design) |

**Merge declaration, as admitted:**

> EARLY-FIELD-01 is admitted only for the governed object `LivingFieldInstrument`. Nothing
> about admission alters universal Living Field access, authorship, navigation or
> circulation. The server is authoritative; the client bundle is not authorization. The
> default state remains closed.

**Merged ≠ deployed.** At the time of writing, production does not run `cc1c5b4d7` (§2).

## 2 · Production sequence, 2026-09-30 → 2026-10-01

Facts are from the founder's terminal output relayed in session. Times not captured in that
output are marked as not recorded, never inferred.

| # | Act | Running after | Instrument exposure |
|---|---|---|---|
| 0 | (before) | `04005ca7c` | **None.** `04005ca7c` does not contain `LivingFieldInstrument`. |
| 1 | Quick-lane deploy at **23:28Z** by `soullab@soullab`, **out of intended order**: canonical was deployed before EARLY-FIELD-01 existed as a merge candidate, against the deployment law (EARLY-FIELD-01 record §7). | `7ec42ce6f` | **Ungated, all members.** `7ec42ce6f` includes #1539, which mounts the instrument unconditionally. |
| 2 | Forward deploy, `pre-deploy-gate.sh deploy-maia 89f7876e8` (time not recorded) | `89f7876e8` | Ungated, unchanged. |
| 3 | `deploy-production.sh rollback` (time not recorded); "Rollback complete! Now running: 7ec42ce6f"; alert send failed (non-critical, per script) | `7ec42ce6f` | Ungated, unchanged. |
| 4 | Redeploy, `deploy-maia 89f7876e8` (built from cache; time not recorded); verified `GIT_COMMIT=89f7876e8` from `printenv` **and** `Config.Env` | **`89f7876e8`** | Ungated, unchanged. |

**Remedy taken:** deploy forward rather than revert. `89f7876e8` carries the H1 failed-read
fix (#1540), which `7ec42ce6f` lacked.

### Rollback tags after act 4

- `maia-sovereign:previous` → **`7ec42ce6f`**.
- **`04005ca7c` is no longer a rollback target** (pruned). A rollback now lands on
  `7ec42ce6f`, which also exposes the instrument ungated. The only pre-instrument image is
  no longer one command away.

### No widening beyond the exposure that began at act 1

Verified in source, not asserted: between `7ec42ce6f` and `89f7876e8` there is **no
change** under `components/maia/living-field`, `app/maia/living-field` or
`app/api/maia/living-field`, and both mount `<LivingFieldInstrument />` at the same line
(`PersonalLivingFieldDashboard.tsx:122`), ungated. Acts 2–4 therefore did not widen who
meets the instrument. ⚠️ This is a statement about code, not about member observation:
**no telemetry was added**, and no member report is claimed either way.

### Standing at the time of writing

- **Production:** `89f7876e8`, **ungated**. Every signed-in member who opens the Living
  Field dashboard can meet `LivingFieldInstrument`. It has been ungated since act 1 at
  23:28Z.
- **Canonical:** `cc1c5b4d7` = `89f7876e8` + #1544 (docs) + EARLY-FIELD-01.
- **The exposure closes only on the canonical deploy** in §3, not on the merge.

## 3 · Next production act (owed, founder-run)

1. **Re-check the environment** on minisforum immediately before deploying; don't rely on
   the earlier check: `EARLY_FIELD_ENABLED` unset or `false` · `EARLY_FIELD_MEMBER_IDS`
   empty.
2. **Deploy the canonical SHA `cc1c5b4d7`**, not the PR head `0e29c65df`:
   `scripts/pre-deploy-gate.sh deploy-maia cc1c5b4d7` (EARLY-FIELD-01 has no migration).
3. **Verify provenance on both channels:** `docker exec maia-sovereign printenv GIT_COMMIT`
   **and** the container `Config.Env` both report `cc1c5b4d7`.

## 4 · Closure witness: non-cohort first (owed)

This is the condition currently failing in production and the reason this deployment
matters, so it is witnessed **before** the admitted path or the full H1 browser witness.

With a **signed-in ordinary member** (not in any cohort list):

| Check | Expected |
|---|---|
| Reaches the Living Field | ✅ The Living Field still loads. **EARLY-FIELD gates the instrument, never the Living Field.** |
| `LivingFieldInstrument` | **Absent** |
| `GET /api/early-field/admission` | `{"admitted":false}` |

A result is recorded here as observed, with the runtime SHA. Until it is recorded,
EARLY-FIELD-01 is **merged, not deployed and not witnessed in production**.

## 5 · Witness origins, kept separate

- **#1539 witness:** `http://127.0.0.1:3139`, origin-preservation evidence. ⚠️ This origin
  is **not yet written on canonical**. The only canonical mention of 3139 (H1 census §,
  cookie-collision note) calls it `localhost` 3139 as an explanation of that collision. That
  mention is **not** the #1539 origin law and does not replace it. The origin belongs in
  #1539's own evidence record.
- **H1 admission witness:** `http://localhost:3100`, the clean single-port canonical
  admission environment. Authorized by H1's own record
  (`HOUSE-STUDIO-CIRCULATION-01_CENSUS_2026-09-30.md`: "the admission build
  (`localhost:3100`)", 3100 = `h1-admission`).
- Browsers treat `127.0.0.1` and `localhost` as different cookie hosts, so the separation
  also keeps the two databases' member claims apart, which was the cause of the earlier
  401s. Clearing site data before each walk remains prudent.

H1 remains **merged, not admitted** until its browser witness passes.

---

## 6 · Addendum: canonical deploy taken, then superseded (2026-10-01)

Facts from the founder's terminal output.

| # | Act | Running after |
|---|---|---|
| 5 | Environment re-witnessed before deploy: `EARLY_FIELD_ENABLED` and `EARLY_FIELD_MEMBER_IDS` both unset in the container (earlier check: `<unset>`, length 0). | `89f7876e8` |
| 6 | `pre-deploy-gate.sh deploy-maia cc1c5b4d7`: Co-Lab gate 33/0/0, no pending migrations, built image verified `cc1c5b4d7`, running container verified `printenv == Config.Env == cc1c5b4d7`. Rollback tags: `:previous` → `89f7876e8`; `7ec42ce6f` pruned. | **`cc1c5b4d7`** |
| 7 | **A later deploy superseded act 6.** The founder's provenance check afterwards returned `GIT_COMMIT=3421a2096` on both channels. Who ran it and when were **not captured** in the relayed output and are not inferred here. | **`3421a2096`** |

**`3421a2096` = canonical merge of #1551** (`feature/h1-cohort-gate-20260930`, "gate H1 Work-context arrival by cohort"), parents `cc1c5b4d7` + `ad7b2d3ea`.

- `c31b85a34`, `0e29c65df` and `cc1c5b4d7` are all ancestors, so **EARLY-FIELD-01 is in the running image.**
- #1551 touches **no EARLY-FIELD file**: `lib/access/earlyFieldAccess.ts`, `app/api/early-field/**` and `components/maia/living-field/**` are unchanged. The dashboard still has one gated render path: `{earlyFieldAdmitted && <LivingFieldInstrument />}`.
- #1551 adds a **separate** authority, `HOUSE_STUDIO_H1_ENABLED` / `HOUSE_STUDIO_H1_MEMBER_IDS` (`.env.example` default closed), and `GET /api/house-studio/admission` (exact, non-public `free` rule). Like EARLY_FIELD, it is unset in production, so **H1 explicit Work-context arrival is closed for every member** until a cohort is configured.

### Standing

- **Production:** `3421a2096`. The `LivingFieldInstrument` exposure that began at 23:28Z is **closed in code**, because the gate is deployed with the environment unset. It has **not been witnessed in production** yet.
- **Owed next (unchanged):** the non-cohort witness from §4, run against `3421a2096`.
- **Consequence for H1 admission:** the H1 browser witness (`localhost:3100`) now needs the walking member listed in `HOUSE_STUDIO_H1_*` on that dev server. Otherwise the arrival is correctly closed, and the walk would test the gate, not H1. That belongs to the H1 lane record and is noted here only as a cross-reference.

---

## 7 · `EARLY-FIELD-01 · ROLLOUT-R2`: production non-cohort + dual-gate composition witness

**Status: owed, founder-run. ⛔ No configuration change before or during it.** It replaces §4 as the next production act and runs against the **actual running SHA `3421a2096`**, not `cc1c5b4d7`.

### Law under test

> **Independent feature admission gates compose monotonically: admitting or denying one feature never silently changes the admission state of another.**

EARLY-FIELD-01 (`EARLY_FIELD_*` → `LivingFieldInstrument`) and H1 (`HOUSE_STUDIO_H1_*` → explicit Work-context arrival) are two separate authorities in one running image. R2 witnesses the **deny × deny** cell of their composition. Deny × admit, admit × deny and admit × admit belong to later, deliberate cohort acts. They are not inferred from this one.

### Expected production truth

| Surface | Gate | Expected |
|---|---|---|
| `LivingFieldInstrument` | EARLY-FIELD-01 | **Closed** (settings unset) |
| Living Field itself | none | **Open** |
| House → Writer's Studio situated arrival | H1 | **Closed** (settings unset) |
| Writer's Studio itself | none | **Open** |

### Pre-witness reads (minisforum, read-only)

```bash
docker images maia-sovereign
docker inspect maia-sovereign --format '{{.Config.Image}} {{range .Config.Env}}{{println .}}{{end}}' \
  | grep -E 'GIT_COMMIT|EARLY_FIELD|HOUSE_STUDIO_H1'
history | grep -E 'deploy|maia-sovereign|3421a2096'
```

Pass: `GIT_COMMIT=3421a2096`; no `EARLY_FIELD_*` or `HOUSE_STUDIO_H1_*` lines, or `false` / empty; `:previous` resolves to a gated image (expected `cc1c5b4d7`).

⛔ **Deployer provenance is not inferred from commit authorship.** The merge author, the GitHub actor, the local shell user and the person who initiated the production deploy are four different claims. Record only what a deploy artifact shows. If it shows nothing, record *not established*.

### The walk (one signed-in, ordinary, non-cohort member · one browser session · `https://soullab.life`)

| # | Act | Pass condition | Gate exercised |
|---|---|---|---|
| W1 | Open `/maia/living-field` | The Living Field loads and its existing content is present | none: universality preserved |
| W2 | Look for the instrument | `LivingFieldInstrument` is **absent** | EARLY-FIELD deny |
| W3 | Same session: open `/api/early-field/admission` | Exactly `{"admitted":false}`, HTTP 200 | EARLY-FIELD server answer |
| W4 | Open `/house`; inspect the Work's **Writing →** link before clicking | `href` is exactly `/writers-studio`, with **no** `from=` and **no** `work=` | H1 deny at the doorway |
| W5 | Click **Writing →** | Writer's Studio opens through its ordinary arrival. No Work-arrival panel, no THE HOUSE · WRITER'S STUDIO mark, no Return Home pill (it renders only on `from=house`) | H1 deny, Studio universal |
| W6 | Use the Studio normally: open a manuscript, switch Write / Develop / Review | All usable | none: universality preserved |
| W7 | Same session: open `/api/house-studio/admission` | Exactly `{"admitted":false}`, HTTP 200 | H1 server answer |
| W8 | Hand-enter `/writers-studio?from=house&work=<a real Work id of this member>` | The claim is **dropped**: the Studio shows its ordinary arrival with no one-manuscript panel and no "Begin" for that Work. ("Opening Writer's Studio…" may appear briefly while it asks the server.) | H1 deny is server-side; a URL confers nothing |
| W9 | Cross-check composition: after W5–W8, reload `/maia/living-field` | The instrument is still absent and W3 still answers `false`. Nothing about the H1 path changed EARLY-FIELD's answer | monotonic composition |

**Result vocabulary:** PASS (all nine) · FAIL (name the row; ⛔ no configuration change and no source edit in response, return for a ruling) · NO EVIDENCE (the session was not ordinary or not authenticated, the SHA was not `3421a2096`, or a row was not observed). A partial run is recorded as such, never as a pass.

**Record shape:** runtime SHA · timestamp (UTC) · member described as "ordinary, non-cohort" (⛔ no member id in the record) · W1–W9 each PASS / FAIL / not observed · pre-witness read output verbatim.

### What R2 establishes, and what it does not

- ✅ On pass: both gates deny in production on the deployed SHA, both universal surfaces remain open, and the deny × deny composition is monotonic.
- ⛔ It does **not** establish that either gate *admits* correctly in production. That is the first cohort act.
- ⛔ It does **not** admit H1: the H1 browser witness (`localhost:3100`, member in `HOUSE_STUDIO_H1_*` on that dev server) is still owed.
- ⛔ It does **not** authorize opening any cohort. That stays a separate, deliberate founder act after R2 passes.

### Reusable pattern (proposed, ⛔ not ratified)

The rule *independent admission gates compose monotonically* generalizes beyond these two features. Proposed for preservation as a House/runtime governance pattern:
- each gate has its own authority, environment and endpoint;
- no gate reads another gate's configuration;
- every gate fails closed;
- composition is witnessed per cell, never assumed from the cells already witnessed.

Ratification is a founder act. This entry only names it.

---

## 8 · ROLLOUT-R2 result: **NO EVIDENCE · PRECONDITION NOT MET** (founder-run pre-walk, 2026-10-01)

Read-only on minisforum. No configuration was changed.

| Check | Observed | Result |
|---|---|---|
| Running commit | `3421a2096` | PASS |
| `:previous` | image for `cc1c5b4d7` (gated) | PASS |
| `EARLY_FIELD_*` | not present | PASS: closed |
| `HOUSE_STUDIO_H1_ENABLED` | `true` | **STOP** |
| `HOUSE_STUDIO_H1_MEMBER_IDS` | populated, 4 members | **STOP** |
| Deployer of this runtime | shell history does not establish it | NOT ESTABLISHED |

> At runtime `3421a2096`, EARLY-FIELD is closed, but `HOUSE_STUDIO_H1_ENABLED=true` with a populated H1 cohort. The intended `(EARLY_FIELD=closed, H1=closed)` composition was not the state under observation, so W1–W9 were **not entered**.

This is **not** a W1 failure and **not** an H1 failure. There is no evidence H1 is malfunctioning. Its production cohort had already been opened. ⛔ H1 is not turned off to make §7 convenient. The state actually running is preserved and witnessed as its own case (§10).

## 9 · Provenance of the H1 activation (read-only, repository side)

An operational record for the activation **exists on canonical**. Its existence is recorded here as a finding. ⛔ Authorization is **not inferred from the environment** existing.

| Record | Canonical | What it says |
|---|---|---|
| `H1-EXPOSURE_CENSUS_AND_RULINGS_2026-09-30.md` §3 | via #1544 | Founder law: *existing room remains universal; experimental crossing is cohort-controlled* |
| `H1-COHORT-GATE_ADMISSION_2026-09-30.md` | #1560 | Two-population browser witness PASS on `3421a2096`. *"An admission claim, not a production deployment claim"* |
| `PRODUCTION_DEPLOYMENT_HISTORY_2026-09-30.md` | #1561 | At its writing: image `3421a2096` created `01:08:27Z`, container created `01:12:19Z`, **H1 unset**. **Superseded on the H1 line by the next row.** |
| `H1-COHORT-GATE_PRODUCTION_ROLLOUT_2026-09-30.md` | #1565 | `.env.production` changed from no H1 config to `ENABLED=true` + **"4 founder-designated members"**; 4/4 UUIDs resolved read-only, no extras; only `maia` recreated from the current image (no rebuild, no migration); pre-change backup `.env.production.h1-20261001T012910Z.bak`; post-restart health ok, unauthenticated admission `401`; **"member-visible production witness with a signed-in cohort member and a signed-in ordinary member remains the final observational step"** |
| `H1-FIRST-HUMAN-WITNESS_PROTOCOL_2026-09-30.md` | #1572 | Pre-registered human-experience witness for a cohort member. Explicitly does **not** re-prove mechanics |

**What is and is not established:**
- ✅ An operational record of the activation exists. It names the act, the time (backup stamped `2026-10-01T01:29:10Z`), the scope, the rollback and the post-restart checks.
- ✅ #1561's "H1 unset" was true at its writing and is superseded by #1565. It is not a contradiction.
- ⚠️ **"Founder-designated"** is the rollout record's own statement. The only person who can confirm it is the founder. **Owed: one founder line confirming (or denying) that those four members were designated.** On confirmation, the activation counts as authorized. Without it, it stands as a configuration-governance finding.
- ⛔ **Who ran the `3421a2096` deploy and the `01:29Z` recreate: not established.** No deploy artifact seen names an initiator. Commit authorship, GitHub actor and shell user are not used as substitutes.
- ⚠️ **Overlap:** #1561 independently recorded the same deployment lineage and rollback tags as §2/§6 here. Two records of one history must not drift. This branch's record defers to #1561 on deployment lineage where they cover the same facts. Whether this branch is merged at all is a founder call.

## 10 · ROLLOUT-R3 (draft, ⛔ not run): `(EARLY_FIELD 0, H1 1)` composition witness

**Runs only after** §9's founder confirmation. It discharges the rollout record's own *"final observational step"* and EARLY-FIELD widening criterion 3 in one sitting, on the state actually running. ⛔ No configuration change before, during or after.

**Discipline (from #1565 and #1572):** each member uses their **own existing session**. No facilitator obtains, copies or inspects credentials. No telemetry, recording or new instrumentation. No member id, email, Work title or excerpt in the record.

### Population A: one H1 cohort member

⚠️ To avoid priming #1572: run A with a cohort member who is **not** the #1572 participant, or only **after** #1572's untouched first attempt is complete. #1572 forbids re-proving mechanics with the participant, and A *is* mechanics.

| # | Act | Pass | Cell |
|---|---|---|---|
| A1 | `/maia/living-field` | Loads; `LivingFieldInstrument` **absent** | EARLY-FIELD deny holds while H1 admits |
| A2 | `/api/early-field/admission` | `{"admitted":false}` | EARLY-FIELD answer independent of H1 |
| A3 | `/api/house-studio/admission` | `{"admitted":true}` | H1 admit |
| A4 | House **Writing →** `href` | `/writers-studio?from=house&work=<that Work>` | H1 doorway open |
| A5 | Click | Work arrival panel, THE HOUSE · WRITER'S STUDIO mark, Return Home pill; manuscript opens only on an explicit gesture | H1 arrival |
| A6 | After A5, reload Living Field; re-ask A2 | Instrument still absent; still `false` | monotonic: admitting H1 did not open EARLY-FIELD |

### Population B: one ordinary, non-cohort member

§7 W1–W9 unchanged (deny on both gates; both universal surfaces open). This is also EARLY-FIELD widening criterion 3.

**Result:** PASS (A1–A6 and W1–W9 all observed) · FAIL (name the row; ⛔ no reactive change, return for a ruling) · NO EVIDENCE (wrong SHA, wrong population, unauthenticated, or a row not observed).

**What R3 establishes on pass:** the `(0,1)` row of the matrix, for both an admitted and a non-admitted member, plus the deny × deny behaviour from the non-cohort side. ⛔ It says nothing about `(1,0)` or `(1,1)`. Each needs its own deliberate cohort act and its own witness.

---

## 11 · Founder rulings (2026-10-01): authorization confirmed · R3 opened

- **H1 production cohort is founder-authorized.** The founder confirmed designating the four members configured in production. The confirmation holds on the condition that the four configured member ids are exactly those four people, which #1565 records as 4/4 resolved with no extras. ⛔ Names and ids are deliberately **not** copied here, following #1565's discipline: production configuration stays the operational authority.
- **#1565 is authoritative** for H1 production activation. **#1561 is authoritative** for deployment and rollback history. This record defers to both (header note).
- **Deployer of `3421a2096` and of the ~01:29Z recreate: not established.** No provenance is manufactured.
- **§9's owed item is discharged.** R3 (§10) is **open**, against the running `(EARLY_FIELD 0, H1 1)` state, with **no configuration change**. ⛔ H1 is **not** turned off to fill `(0,0)`. *The matrix governs evidence; it does not dictate production churn.* Combinations are witnessed when rollout naturally reaches them.
- **R3 populations:** (A) one H1 cohort member **other than the #1572 participant**, unless #1572's unprompted first attempt has already happened; (B) one ordinary non-cohort member.
- **Guard built before R3, as ruled:** `lib/access/__tests__/monotonicIndependentGates.test.ts` on `chore/monotonic-gates-guard-20261001` (`f188aeae0`, no PR). It walks each gate's whole admission path (authority + endpoint + client hook, transitively), so coupling cannot migrate into a route, hook or shared helper unseen. 15/15, with 8 defeat candidates each caught by its intended mechanism. ⚠️ It is **frozen only on merge**. Until then it is a candidate guard on a branch.

On R3 PASS, the matrix in `MONOTONIC-INDEPENDENT-GATES-01_RATIFICATION_2026-10-01.md` updates `(0,1)` → **witnessed**. Every other row stays *not yet witnessed*.

---

## 12 · R3 rulings (founder, 2026-10-01) and the run-ready procedure

### Two separate evidentiary acts

- **Guard PR opened:** [SoullabTech/Sovereign#1584](https://github.com/SoullabTech/Sovereign/pull/1584) (test-only; current with canonical `e28118ba0`; 15/15, access suites 72/72).
- ⛔ **R3 does not depend on #1584's merge.** The guard proves the shape of the code. R3 witnesses production behaviour. Merging the guard later makes the law durable in CI **without rewriting what R3 meant**.

### B: gate denial is not feature breakage

For the ordinary member, `false` from both endpoints is **necessary but not sufficient**. W1 and W6 carry the weight: the Living Field and Writer's Studio must be **normally usable through their ungated paths**. A row where an endpoint correctly says `false` but the underlying room misbehaves is a **FAIL**, recorded as feature breakage and kept distinct from gate denial.

### A5: bind the visible arrival to the governed seam

In canonical source at `3421a2096`, `work=` has **exactly one reader**. `readStudioWorkParam` is called only inside `useHouseStudioH1WorkClaim`, and all four Studio controllers (Home, Write, Develop, Review) take the carried Work only from that hook. The hook returns the claim **only on `{"admitted":true}`** from `/api/house-studio/admission`. On the House side, the `work=` link is chosen server-side by `canUseHouseStudioH1(member.id)`.

So during A4–A5, with DevTools → Network open (observation only, no new test, no instrumentation):

| Bind | Observe | Ties A5 to |
|---|---|---|
| A4b | House page source / link inspector shows the `from=house&work=…` href | server-side H1 decision on the House render |
| A5b | **One** `GET /api/house-studio/admission` → `200 {"admitted":true}`, issued **before** the arrival panel renders | the governed seam: the server answer gates the claim |
| A5c | No other request or client step supplies the Work. The arrival panel is the resolution of the admitted claim against the member's own Works | no client-side reinterpretation of `work=` |

The **mirror** for B: on W8, the same request returns `200 {"admitted":false}` and no arrival panel appears.

Together these make A5 evidence of the **deployed architecture** (the #1551 seam that the #1584 guard pins structurally), not only of the visible UI.

### Closing language (only on PASS of A1–A6 + A4b/A5b/A5c, and W1–W9)

- Matrix row `EARLY_FIELD 0 / H1 1` → **WITNESSED**. Rows `(0,0)`, `(1,0)` and `(1,1)` stay **not yet witnessed**. ⛔ They are not extrapolated.
- R3 standing:

> **CONTROLLED COHORT WITNESS PASSED FOR ONE H1 MEMBER AND ONE ORDINARY MEMBER; GATE INDEPENDENCE OBSERVED IN PRODUCTION FOR THE CLOSED/OPEN AND CLOSED/CLOSED STATES.**

⚠️ *"CLOSED/CLOSED"* in that sentence means **both gates denying for the ordinary member** (B). It is a per-member observation inside the running configuration. It does **not** witness the global `(0,0)` configuration row, which requires `HOUSE_STUDIO_H1_ENABLED` off and stays unwitnessed until rollout reaches it.

## 13 · Two further production deploys (2026-10-01): `68af62fda` (unattributed) → `bde0f6590` (founder)

### 13.1 `68af62fda` — deploy found in flight, deployer ⛔ NOT ESTABLISHED

The founder's first attempt to deploy `bde0f6590` was **refused by the deploy-lane lock**: the holder record named pid `3051458`, target `68af62fda`, started `02:46:50Z`. ⛔ Who ran that deploy is not established, and it is not inferred from commit authorship. The lock refused the second deploy as designed; the lockfile was not touched. Once the holder exited, `68af62fda` was live. It carried #1578 and #1545 but not #1563.

### 13.2 `bde0f6590` — full deploy, founder-run, ✅ WITNESSED

`scripts/deploy-production.sh deploy bde0f6590`, run by the founder from minisforum. Witnessed from the deploy output and from separate checks afterwards:

| Check | Result |
|---|---|
| Built image provenance | `maia-sovereign:prod GIT_COMMIT=bde0f6590` |
| Migrations | none pending (565 recorded, 513 files); run **before** the swap |
| Rollback tags | `:previous` = `46d49fd54f8d` = `68af62fda` · `:current` = `:bde0f6590` = `c344292669b0` · `cc1c5b4d7` pruned |
| Running provenance (deploy script) | `printenv` == `Config.Env` == asserted `bde0f6590` |
| Running provenance (separate check) | `printenv GIT_COMMIT` → `bde0f6590`; `Config.Env` `GIT_COMMIT=bde0f6590` |
| `/api/health` (in container, 03:09:26Z) | `health: ok` · `version: bde0f6590` · `uptime: 89` · database/tables/memory ok |
| Smoke tests | health · version · ready · main page · two auth locks (503) — all PASS |
| Constitutional verification (Co-Lab + Memory + Relationships + Development + MAIA) | PASSED |
| H1 configuration | `HOUSE_STUDIO_H1_ENABLED=true` in `Config.Env` — unchanged by the deploy |
| Early Field configuration (founder check after the deploy) | `printenv EARLY_FIELD_ENABLED` → not set — **R3 precondition A0 met** |

**Not witnessed (recorded, not inferred):**
- The H1 member list being unchanged: not read here, deliberately, since records list no member IDs. R3 confirms membership by behaviour.

**Observations (routed, ⛔ not repaired):**
- The full deploy recreated **nine** containers, not only `maia-sovereign`: `maia-api`, the three workers, `maia-rlm`, `maia-nostr-relay`, `demo-plaster` and `oldhead-plaster`. All came up healthy. This matches the S3-O1 observation that a full deploy's `up` covers every service.
- `[deploy-tag] WARNING: failed to remove maia-sovereign:staging (in use by a container?)`: retention housekeeping only, not a deploy failure.
- `[WARN] Alert send failed (non-critical)`: the notification channel did not deliver. This deploy still has no external alert record.
- `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` unset warnings: pre-existing and unrelated.

### 13.3 Standing

Production runtime = **`bde0f6590`**, rollback point `68af62fda`. Of the H1 work this includes #1551 and #1578. **R3 now targets `bde0f6590`**, with no configuration change and with H1 left on. The `(0,1)` row stays **RUNNING · R3 OPEN** until R3 passes. ⛔ This deploy witness is not R3 and does not mark any matrix row as witnessed.

### 13.4 Correction (2026-10-01): the `68af62fda` deploy is now attributed

§13.1 recorded the `68af62fda` deployer as **not established**, which was accurate when it was written. Canonical now carries `docs/programme/H1-COHORT-GATE-01_R3_RUNTIME_CONVERGENCE_WITNESS_2026-10-01.md` (commit `dbc9a63bb`, merged via #1587, authored by the founder). That record says the governed entry point `./scripts/deploy-production.sh deploy 68af62fda…` was run on minisforum to deploy the #1578 merge. It also records: no pending migrations, `:previous` preserved, provenance stamped on both channels, the four-person cohort preserved, and the human-lived witness **PENDING**. The attribution now rests on that founder record, not on commit authorship. §13.1 is left as written.

⚠️ **Two acts share the name "R3".** `H1-COHORT-GATE-01 · R3` is the **runtime-convergence deployment witness** of #1578 and is PASS. `ROLLOUT-R3` in this record (§10–§12) is the **`(EARLY_FIELD 0, H1 1)` composition witness**: one cohort member and one ordinary member, A1–A6 + A4b/A5b/A5c and W1–W9. ROLLOUT-R3 is **still open**. A pass on one does not discharge the other, and the `(0,1)` matrix row stays RUNNING until ROLLOUT-R3 passes.
