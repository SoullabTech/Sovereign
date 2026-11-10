# Writer's Studio Develop — P0 observation-state qualification

**Owner record:** Writer's Studio #1800 · continuity #1982 · draft PR #2208 · spec PR #2207
**Candidate:** `a70bd1cc66b0ce74a4f2626eff4247e53c39d6a9` (`feature/ws-develop-density-b1-20261109`), detached checkout, never committed to
**Environment:** isolated cloud container · fictional writers and manuscripts · throwaway PostgreSQL 16 · local stub model · no production, no member data, no real model
**Standing:** documentation only. **Release HOLD. H1 Class A, R20, merge and deploy holds all untouched.** Isolated browser qualification is not deployment acceptance.

## 1 · Answer to the gating question

> **Does the arrival of a reading automatically select an observation?  YES.**

Two sites in `P4R1DevelopView.tsx`, both choosing `observations[0]`: the initial `useState` (≈L2087) and a `useEffect` keyed on `props.reading?.id` (≈L2265). Every other setter (L3063–3102) is inside a writer-click handler. A reading is selected by the `?r=` URL parameter (`P4R1DevelopController.tsx:108`), so the selection fires on **mount with `?r=` (refresh, bookmark, history, resume)** and on **`r` changing under a mounted Develop**.

Effect when it fires on the overview, **with no writer act**:

| | no reading (control) | reading arrives |
|---|---|---|
| calm stage | present | **gone** (`useStage` requires `!selectedObservation`) |
| the writer's chapter text | central | **not on screen** |
| centre of the room | the manuscript | the generic "Explore your Work" menu |
| MAIA's panel | editorial companion | **"With this observation — Shall we talk about what I noticed?"** |
| the observation itself | n/a | **not shown anywhere** |

The last row is the defect. On `overview` no render branch draws a selected observation, so the room **speaks of something it does not show**.

## 2 · Reachability — kept apart on purpose

| route | observed | classification |
|---|---|---|
| `?r=` present at mount (refresh · bookmark · resume) | stage dropped, manuscript replaced | **DEMONSTRATED** |
| browser Back into an entry holding `?r=` (Develop → Write → Back) | observation state re-entered | **DEMONSTRATED** |
| `r` changes under a mounted overview (client navigation) | stage dropped | **DEMONSTRATED** (via `history.pushState`) |
| writer opens a saved reading through the product's own list | lands on the reading's **lens page**; observation "1 of 4" shown with *Talk with MAIA about this · Show me in the manuscript · See another · Back to your questions* | **COHERENT — by design, not a defect** |
| a reading arriving from MAIA's own conversation or a live commission | not exercised (fixture bypasses both model calls) | **NOT TESTED** |

The lens-page route is the product working as intended and **must not be conflated with the overview defect.** The saved-readings list is not reachable from the calm stage at all.

## 3 · Minimal diff (proposal; not applied to any branch)

`WS-DEVELOP_P0_PATCH-3_OBSERVATION_NO_AUTOSELECT_FOR_PR2208_2026-11-10.diff` — **+5 / −2, one file.** `sha256` prefix `30709f35e124b0a3`. Gates the two **automatic** selections on `props.field === 'overview'`. Explicit setters, lens pages and the effect's dependency list are unchanged.

Verified in a disposable copy, then reverted: **applies cleanly to pristine `a70bd1cc6`**; with it, a reading arriving (J3, S9-b) leaves the **stage, the manuscript and the Quiet View in place** at 1440 / 1024 / 768 / 390; lens-page behaviour unchanged; database invariants identical; **zero page errors**; **`npm run typecheck`: 214 errors vs baseline 214, no regressions, exit 0**; `check:no-supabase` clean.

⚠️ **Source-owner authorization is required before this touches #2208.** Applying it fixes the headless state; it does **not** decide whether a reading should also surface *somewhere* on the overview. That is a founder design question (§7).

## 4 · Scenario results

| scenario | result |
|---|---|
| **S9** view stays Quiet when an observation opens | **PASS** — path B's own control ("How much of Develop to show") reads Quiet |
| S9 *dense layout never appears unfolded* | **PASS (mechanical)** — 41 controls vs 37 on the stage; nowhere near the 92 authored |
| S9 *Talk, Let rest, Undo and what MAIA read visible on the open observation* | **FAIL on overview** — *Let rest* and *Undo* absent, observation not shown. Lens page: *Talk* present, *Let rest*/*Undo* **not visible at first paint** — **NOT TESTED** whether they appear on interaction |
| **S13** journey (Quiet → observation → talk → All tools → Quiet → leave → resume) | **PARTIAL — see below** |
| S13 View and chapter survive leave-and-resume | **PASS** — Quiet and "The Letter" both held through Write and back |
| S13 manuscript unchanged | **PASS** — manuscript and draft digests identical before/after |
| S13 no unauthorised read | **PASS** — `work_reading_scope_events`, `writer_decision_events`, `development_plans`, `developmental_readings` counts unchanged |
| S13 *reading arrives without displacing the manuscript* | **FAIL before patch · PASS after** |
| S13 at **Chapter 10** | **NOT TESTED** — the fixture has 4 chapters; "The Letter" (ch. 3) stood in |
| S13 *talk with MAIA* | **NOT TESTED** — the dialogue UI opens, but no model call was made (no stub log), so no reply was exercised |
| S13 Quiet → All tools → Quiet inside the observation state | **PASS** — 45 → 56 → 45 controls (dialogue open throughout; 41 before it opened) |

## 5 · Other measured results

| check | result |
|---|---|
| Preference isolation, two writers, one browser | **PASS** — second writer sees Quiet; first returns to All tools; key is `writers-studio:presentation:v1:<memberId>` |
| Responsive 1440 / 1024 / 768 / 390 | **PASS (mechanical)** — no horizontal overflow on either path |
| MAIA keyboard reach | stage: **1 Tab** to *Message MAIA*; observation state: **26 Tabs** to *Talk with me about it*; *Send* is named |
| Both render paths | stage and path B both hold the writer's View; neither wrote an unrequested change **except as below** |

## 6 · Findings the owner should see

**F1 — "Show more ways to explore" silently writes All tools as the writer's saved View.** Stage → More → *More ways to explore*: View Quiet → **All tools**, and it is still All tools on reopening (`chooseDevelopView('full')` calls `writeStudioPresentation`). A navigation affordance persists a preference. Reproduced twice; **unchanged by PATCH-3.** Whether it is intended is a ruling.

**F2 — `developAskable.test` fails, and it fails on canonical too.** The one unclassified control is `data-depth`, a chapter-picker `<option>` attribute from #2201 — present and unclassified at `de8c3d04b` and at `a70bd1cc6`. **Inherited, not #2208's**, and not caused by PATCH-3.

**F3 — baseline failures in this environment:** `Test Suites: 9 failed, 274 passed` · `Tests: 5 failed, 2986 passed` over `app/writers-studio`, `app/dev/writers-studio-pc3-live`, `lib/writersStudio`. **Identical with and without PATCH-3** (compared). Only F2 was diagnosed; the other eight were not, and may be environmental.

**F4 — at 390×844 MAIA is below the fold**, and the floating *Beta journey* pill and bug button **overlap MAIA's helper text**. Present in the shell, not introduced by #2208.

**F5 — MAIA→working-style coupling** (#2208's own build record, §deviations): *"Gentle guidance"* sets pace and depth together, contradicting spec §separation. Disclosed by the candidate; **not repaired**.

## 7 · Founder approval discrepancy, #2207 vs #2208

Repository records only; **GitHub comments and review state were not readable this session.**

1. `ebe0715be` (20:33, *"density spec approved"*) is **self-contradictory**: its **title** reads *"DRAFT 2 APPROVED by founder 2026-11-09"* while its **Status line** still reads *"design spec for founder approval. Not ratified; authorizes no source change, build, merge or deploy."*
2. The Status line only flips to **"design APPROVED by the founder 2026-11-09 (draft 2 + §11-§13)"** in `090a6ba9e` (20:38) — five minutes later, in the commit titled *"corrections after review."*
3. That same commit **adds §13**, *"Corrections after ChatGPT review of `ebe0715be`… binding on the build"*, and rewrites R1 (≈30 handlers → 56). So the approval line claims coverage of text that **did not exist when the commit named "approved" was made**, and the corrections originate from an external review, not from the founder.
4. **No founder statement, quotation or comment id** is recorded in either document.
5. #2208's build record cites the spec as *"(approved; §10-§13)"*, on a PR (#2207) that is **still open**; approval's recorded scope is *"the design and the B1–B5 build on a branch"* — so #2208 as a branch is inside it; **merge and deploy are explicitly outside it.**
6. #2208 is based on `b1d013bca` and is **48 commits behind** canonical (trial merge: 0 conflicts on its three files).

**Reconciliation needed:** a founder statement, on the owner record, confirming approval of the **exact text at `090a6ba9e`** (or its successor after the PATCH-1 documentation diff) — in particular §13 and the 56-handler R1. Not inferable from the repository.

## 8 · Founder visual-acceptance questions

1. **Observation arrival.** When MAIA's reading arrives on the overview, should the writer's chapter stay central with the reading offered *beside* it (what PATCH-3 yields), or should something surface the reading — and where?
2. **Is lens-page auto-showing "observation 1 of 4" right?** It is coherent, but it is still a reading choosing what the writer sees first.
3. **"Show more ways to explore"** — a link, or a View change? If both, should the label say so?
4. **Is there a way back you can find?** Today the way from an observation to the manuscript is *clicking a chapter in the rail* — unlabelled.
5. **Does Balanced earn its place?** 38 controls vs Quiet's 38.
6. **At 390px** — does MAIA below the fold, and the overlapping pill, feel like a place to write?
7. **From Quiet, does All tools feel like the same room opening, or a different room?** (9 controls, inside the stage.)

## 9 · What this does not establish

A passing mechanical run is not evidence the experience is coherent; question 4 and the *"do I have to recover my place?"* test belong to the founder's walk. The fixture's observations are **hand-authored fiction frozen through the product's own capture/freeze/store** — the reader, the classifier and the grounding validation were **not exercised**.

## 10 · Custody

Candidate `a70bd1cc6` · canonical `de8c3d04b` · Living Voice `d6b2b1f23` untouched · `#2207` `090a6ba9e` untouched · no merge, push to any PR branch, deploy, migration, production or member-data access, and no JARVIS execution grant. Dependency install was **`npm ci`** with an untouched lockfile; its lifecycle scripts (`patch-package`, `prisma generate`) are visible in the install log.
