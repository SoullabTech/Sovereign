# JARVIS-FOUNDER-WORKSPACE-01 — Programme Charter

**Opened:** 2026-09-23 — founder direction, same day, explicitly as a **new** JARVIS lane (⛔ not folded into `JARVIS-MERGE-AUTHORITY-01 / M1R1R1`, ⛔ not folded into any governance-infrastructure programme).
**Governing question:** How does the existing JARVIS machinery become the one coherent, humane, founder-facing workspace in which the founder does, sees, monitors and understands all work — by **composition** of organs that already exist, never by a parallel replacement?
**Subject:** The founder's daily working environment over JARVIS: the JARVIS operational console (`jarvis-desktop/`), the Builder OS runtime it projects (`scripts/builder/*`), and the ops / health / provenance substrate a monitor surface would compose.
**Current state:** ⭐ **F0 PASS (founder adjudication 2026-09-23, `…_F0_FOUNDER_ADJUDICATION_2026-09-23.md`) · F1 OPEN — INFORMATION ARCHITECTURE + LIVING PROTOTYPE OVER RECORDED EVIDENCE ONLY.** HU-1…HU-9 binding for F1; DC-1…DC-8 binding prototype constraints; D-01…D-08 ruled. *(Superseded text, preserved: this field read `F0 — CURRENT-STATE PRODUCT CENSUS + FOUNDER EXPERIENCE CONSTITUTION · DISCOVER / CENSUS · READ-ONLY · DOCUMENTARY`.)*
**Canonical base observed by F0:** `b4f73ac4ccd9cb96e6b2b6dc7b682e689c77771f` (`origin/clean-main-no-secrets` tip at the moment the census began; verified equal to the lane branch HEAD at that moment).
**Branch / custody:** `claude/sharp-cannon-cyrdeb` (remote session branch; ⚠️ `claude/*` is not in `scripts/check-branch-allowed.sh`'s allowlist — see `BRANCH_POLICY_AUTHORITY_FINDING_2026-09-13`; the interim rule *absence of the hook is never evidence of compliance* applies, and this lane records the fact rather than resolving it).
**Governance class:** Class B for F0 (documentary only, no runtime, no member-facing, no production, no provider, no merge/deploy subject). Later acts re-classify on their own opening.

## Mandatory lane preamble

```text
Class: B (F0)
Governing authority: founder opening act 2026-09-23 + docs/programme/JARVIS_INSTRUCTIONAL_MANUAL_v1.md (canonical, 2026-09-17) + ratified JARVIS operator / work-unit / routing / continuity / provider law (listed under Existing law)
Current gate: F0 — Current-State Product Census + Founder Experience Constitution
Evidence subject: clean-main-no-secrets @ b4f73ac4ccd9cb96e6b2b6dc7b682e689c77771f (read-only; the lane branch carries ZERO non-doc delta from it)
Stop boundary: no code change · no runtime mutation · no governance redesign · no merge-authority change · no model-routing redesign · no production access expansion · no speculative telemetry · no design intuition promoted to observed fact
```

## Authority

**Founder / designated authority:** Kelly (founder). The founder governs what the workspace *means*, which surfaces become the daily environment, and every act that changes runtime, authority, routing, provider, merge, deploy or production standing.

**JARVIS may autonomously (F0):**
- read-only census of `jarvis-desktop/`, `scripts/builder/`, `scripts/ops/`, `scripts/*` health/backup/deploy helpers, `app/api/health` and sibling status routes, and the JARVIS programme records;
- map the founder work journey as it exists **today**, with each step classified by manual §4 evidence state;
- register duplication, fragmentation and friction as OBSERVED findings;
- propose (⛔ not ratify) a humane UI law, a single-workspace information architecture, and a dashboard / graph / monitoring **contract**;
- name every gap as `UNOBSERVED`, `NOT FOUND`, or `NEEDS FOUNDER RULING`;
- prepare the F1 candidate boundary and a founder decision docket.

**Founder stops (F0 and after):**
- ratifying the humane UI law and the five-surface architecture as law;
- choosing which existing organ becomes the authority for any surface where two organs currently overlap;
- opening F1 (information architecture + living prototype) or any code-bearing act;
- any change to `JARVIS-MERGE-AUTHORITY-01 / M1R1R1`, which this lane may not read as a subject, edit, or re-describe;
- any change to routing law (`JARVIS-ROUTING-INTELLIGENCE-01` R1 · R4 · R5A · R5B), work-unit law (`JARVIS-WORK-UNIT-01` W0–W5), operator law (`JARVIS-ORCHESTRATION-OPERATOR-01` O0–O4), continuity law (`JARVIS-CONTINUITY-BRIDGE-01`), provider law (`JARVIS-PROVIDER-01/02`, `JARVIS-CANONICAL-PROVIDER-EXECUTION-01`), or the JEV / SVE constitutions;
- any production read that is not already an established read-only instrument.

If an act is not clearly inside the autonomous column, it is a stop (manual §3).

## Existing law

- `docs/programme/JARVIS_INSTRUCTIONAL_MANUAL_v1.md` — operating method; §4 evidence states; §7 *do not repair during the census*; §24 cockpit must be derivable from sovereign evidence; §25 "continue" = state recovery → next lawful act; §26 charter template (this document follows it).
- `docs/programme/JARVIS-ORCHESTRATION-OPERATOR-01_O0…O4` — operator constitution, intent contract, work graph, authority planner, capability-router contract; the console is *presentation over canonical Builder OS / router state*, **no business logic duplicated** (`jarvis-desktop/package.json` description).
- `docs/programme/JARVIS-WORK-UNIT-01_W0…W5` — canonical Work Unit contract, lifecycle, routing binding, append-only ledger; capability never expands permission.
- `docs/programme/JARVIS-ROUTING-INTELLIGENCE-01_R1/R4/R5A/R5B` + `J5_FOUNDER_RULING` — route contract, execution admission, immutable route binding, human provider-execution authorization.
- `docs/programme/JARVIS-CONTINUITY-BRIDGE-01_2026-09-17.md` — continuity LOCAL_ONLY by default; external bundle construction fails closed.
- `docs/programme/JARVIS-DESKTOP-OPERATOR-FLOW-02_2026-09-17.md` — local-first founder UX; external execution is a separate explicit act.
- `docs/ops/JOP-00…JOP-02`, `docs/programme/JOP-04_CHARTER_2026-09-13.md` — desktop canonicalization, legibility closure, installed acceptance, effect-bearing substrate census; status vocabulary law (`jarvis-desktop/test/jop-04-status-vocabulary.test.mjs`).
- `docs/programme/JARVIS-JEV-01_*` and `JARVIS-SVE-01_CONSTITUTION_2026-09-23.md` — judgment / evaluation constitutions; nothing in this lane reinterprets them.
- `docs/canon/MARKETING_CLAIM_DISCIPLINE.md` + `CLAIM_STATE_AUTHORITY.md` — a surface may not tell tomorrow's story as today's; *declaration is not liveness; built ≠ wired; wired ≠ surfacing; surfacing ≠ verified* (CLAUDE.md).
- `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md` — the founder workspace is an operator surface, but Invariant 14 (no imposed vocabulary) still shapes the humane-UI law: the machine's names are not the founder's names.

## Explicit non-authorizations

This lane, and F0 in particular, does **not** authorize:

- ⛔ any change to `jarvis-desktop/src/**`, `scripts/builder/**`, `scripts/ops/**`, `app/**`, `lib/**`, `database/**`, or any runtime, ledger, store, or schema;
- ⛔ any mutation, re-description, or reinterpretation of `JARVIS-MERGE-AUTHORITY-01 / M1R1R1`, whose standing remains exactly **AUTHORIZED · UNSPENT · IDLE PENDING CREDENTIALED EXECUTION CAPACITY** as stated by the founder — ⚠️ F0 records (§ census) that **no record of that programme exists in this checkout** (`grep -r "MERGE-AUTHORITY\|M1R1"` over tracked files and all commit messages: 0 hits); the protection is honoured by name and by non-mutation, ⛔ not by inspection;
- ⛔ silently redefining existing JARVIS law — a surface that presents an organ may not change what the organ means, what it may claim, or who may mutate it;
- ⛔ governance redesign, authority-planner redesign, model-routing redesign, provider addition, provider spend, external inference;
- ⛔ production access expansion (no new production reads, no SSH, no DB, no `docker` against minisforum from this lane);
- ⛔ speculative telemetry — no metric, score, "health %", cost estimate, or trend may appear in any contract unless a named existing instrument produces it;
- ⛔ merge, deploy, backfill, migration, or member-facing change of any kind;
- ⛔ promoting a proposed surface, law, or architecture from CANDIDATE to RATIFIED without a founder act.

## Freshness discipline (founder direction, binding)

```text
observed against  b4f73ac4ccd9cb96e6b2b6dc7b682e689c77771f   (census SHA — fixed at census start)
        ↓
candidate authored from that evidence                        (the F0 record's own commit, recorded in the record)
        ↓
later freshness reconciliation if canonical advances         (a separate, dated act — history is never rewritten to pretend the census saw the newer state)
```

If canonical advances while F0 is assembled, the record keeps the census SHA and states the drift; it does not re-observe silently.

## Flow

| Act | Name | Class | Mode | Exit |
|---|---|---|---|---|
| **F0** | Current-State Product Census + Founder Experience Constitution | B | READ-ONLY · DOCUMENTARY | founder can answer the five F0 questions from the record alone (below) |
| F1 | Founder Workspace information architecture + **living prototype** (⛔ not code-first runtime implementation) | founder opens; class set then | prototype over static/recorded evidence, no runtime mutation | founder walks Today · Work · Graph · Monitor · System and rules composition vs new capability per surface |
| F2 | Composition contract per surface (which organ is authority, which projection, which read path) | founder opens | contract | each surface bound to a named existing organ or explicitly `NEW CAPABILITY — needs its own lane` |
| F3+ | Implementation acts, one surface at a time, each with falsifiers and defeat candidates before code (S3 Class-B discipline) | founder opens | BUILD | per-act |

⛔ F1–F3+ are named for orientation only; **none is opened by this charter.**

## F0 — the five things it freezes around (founder direction)

1. **Exact observed substrate** — every existing founder-facing surface, work graph, continuity path, monitoring/health surface, provenance/governance surface, backup/ops substrate, and their actual entry points; each with a manual §4 evidence state.
2. **Founder work journey** — *I have something to do → orient → begin work → see progress → inspect evidence → intervene if needed → receive artifact/result → resume later* — mapped against what exists today, step by step.
3. **Humane UI law (candidate)** — ordinary language first; technical truth one layer down; no dashboard that merely restyles internal identifiers; no invented "health" scores where evidence does not support them.
4. **Single-workspace architecture (candidate)** — Home/Today · Work · Graph · Monitor · System as one coherent operator environment, composed from existing JARVIS organs rather than parallel replacements.
5. **Explicit non-goals** — as the non-authorizations above.

## F0 completion test (stronger than "charter written")

A founder reading the F0 record alone must be able to answer:

1. **What JARVIS already has** (named surfaces, organs, entry points, with evidence state).
2. **What is fragmented** (the same concept under several names or in several places).
3. **What is missing** (with `NOT FOUND` distinguished from `UNOBSERVED`).
4. **What should become the daily workspace** (as a CANDIDATE, for ruling).
5. **Which proposed surfaces are composition and which are genuinely new capability.**

If any of the five cannot be answered from the record, F0 is not complete.

## Current act

**2026-09-23 (P0 adjudication §VI):** B1+B2 authorized and DELIVERED — `…_B1B2_VIEWMODEL_AND_READ_ORGANS_EVIDENCE_2026-09-23.md`. FD-1…FD-6 ruled. ⛔ Hard stop after B2; B3/B4/B5 not open; F1 walk still owed before B5. Text below preserved as prior state.


**F2 — Surface Composition Contract + Implementation Sequence** (opened 2026-09-23 by founder direction; `…_F2_SURFACE_COMPOSITION_CONTRACT_AND_IMPLEMENTATION_SEQUENCE_2026-09-23.md`; ⚠️ the F1 experiential walk remains owed). *(Superseded, preserved:)* **F1** (opened by the F0 adjudication against exact candidate `8b8592d9`; F1 scope, prohibitions, product requirement, defeat conditions and exit are recorded verbatim in the adjudication record). *(Superseded, preserved:)* **F0 only.** Output: `docs/programme/JARVIS-FOUNDER-WORKSPACE-01_F0_PRODUCT_CENSUS_AND_FOUNDER_EXPERIENCE_CONSTITUTION_2026-09-23.md`.

## Exit gate

F0 exits when (a) the record exists on the lane branch, (b) it carries the census SHA and its own candidate commit separately, (c) every claim carries an evidence state, (d) the five completion questions are answerable from it, and (e) the founder decision docket in it is presented — at which point the lane **STOPS for founder adjudication**. Nothing about F1 opens on F0's exit.

## Outputs

- This charter.
- The F0 record (census + constitution + docket).
- A CLAUDE.md priority-thread bullet recording the opening and F0 standing.
- ⛔ No code, no runtime, no schema, no PR unless the founder asks.
