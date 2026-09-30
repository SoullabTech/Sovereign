# HOUSE-STUDIO-CIRCULATION-01 — Census (read-only)

**Date:** 2026-09-30 · **Base:** canonical `04005ca7` · **Kind:** census / design reconciliation
**Standing:** ⛔ NO CODE CHANGED · ⛔ NO LANE OPENED · ⛔ NO CROSSING REGISTERED · founder rulings owed (§6)

Occasioned by the HOUSE-CONTEXT-04 proposal (context provider / `activeWork` / `activeIntent` /
stored context), inspected as 04D and found to duplicate existing governance and to breach
ratified law. This record fixes what the repository already says before any design proceeds.

---

## 1 · The defect (the only one this census establishes)

`app/house/page.tsx` lists up to two living Works under **WHAT'S ALIVE** and links every one of
them to bare `/writers-studio`. The member points at a specific Work; the identity is dropped at
the door. **That is the circulation gap.** Nothing else in the House→Studio path is broken.

## 2 · Existing authority (what must be built *through*, not around)

| Object | What it governs | Consequence |
|---|---|---|
| `lib/house/livingOrientation.ts` → `FACET_CROSSINGS` | Declarative crossing law: `from · to · gesture · carries · mode · authority · standing · evidence · law` | A new portal/provider would be a second, ungoverned copy. ⛔ Rejected. |
| `lib/house/facetCrossing.server.ts` → `ALLOWED_CROSSINGS` | **Content-carry** allowlist (server-built packets with excerpt + `returnHref`, ownership-validated) | ⚠️ Not the navigation layer. A pure identity-carrying navigation crossing does **not** belong here (§4.2). |
| `app/writers-studio/workContext.ts` (WS2-03B) | Current Work derived from member declarations; never stored; only manuscript id (`?m=`) persists; 0 / 1 / 2+ kept as three cases; *"first one" / "most recent" = a guess wearing the costume of a default* | `activeWork = livingWorks[0]`, `contextStore`, router state, `localStorage` all ⛔ refused by existing law. |
| `app/house/passingContext.ts` | Daily public quote only; *no member identity, private content or model input* | ⛔ Not a context spine; not to be merged with anything. |
| Intention custody (WRITERS-STUDIO-ELEMENTAL-ARRIVAL-01 §10) | MAIA may notice · reflect · propose · ask; **the member declares** | System-assigned `activeIntent` / *"Last movement: developing the transformation theme"* ⛔ refused. |

## 3 · Three findings that correct the 04D/05 plan

### 3.1 ⚠️ The House is not a crossing endpoint
`OrientationEndpoint = HousePlaceId | 'maia'`. The House lobby is the **whole**, not a place;
`from: 'house'` does not typecheck. Every existing crossing runs place→place or place→MAIA.
Registering `house-open-work-in-studio` therefore requires **either** (a) adding the lobby as an
endpoint — a vocabulary change to the crossing law, a governed act — **or** (b) declaring the
lobby→place entry as *not a facet crossing* (the lobby already links to places via
`HOUSE_PLACES[].href`, e.g. `writing → /writers-studio?from=house`, with no registry entry).
⛔ Not decided here.

### 3.2 ⚠️ WS2-03B resolves in the *opposite direction*
`resolveWorkContext(phase, works, manuscriptId)` maps **manuscript → Work**. Arrival with a Work
id needs **Work → manuscript**: the inverse relation over the *same* declarations
(`living_work_expressions` where `expressionType = 'manuscript'`). Lawful, because it reads the
same source of truth — but it is **new code**, not reuse, and must keep three cases as three:
0 manuscripts (Work exists without one — `/materials`, D-018 already models this) · 1 · 2+ (member
chooses; ⛔ no recency, ⛔ no first row).

### 3.3 ⚠️⚠️ The sharpest question: does a crossing gesture count as a declaration?
Member arrives from Work **W**, lands on manuscript **M**; M is also declared in **W2**.
WS2-03B then resolves `ambiguous` — honest, but it discards the choice the member made one click
earlier. The only ways to keep W are to carry it in the URL beside `?m=` or to store it, and
WS2-03B permits only the manuscript id to persist. So:

> **Is "I opened M *from* W" a member declaration of current context, scoped to this visit and
> valid only while W still declares M?**

Yes → a governed amendment to WS2-03B (a second URL-carried identity, re-validated on every
render so a withdrawn declaration cannot survive). No → arrival lands `ambiguous` and the member
re-chooses. ⛔ Not decided here. This, not button wording, is where the crossing law is set.

## 4 · Corrections to the proposed contract

1. ⛔ **`memberId` must not be carried.** Identity comes from the server session; a carried
   member id is a forgeable claim. The crossing carries `livingWorkId` only.
2. ⛔ **Not an `ALLOWED_CROSSINGS` entry** (see §2) — that table builds content packets.
   Navigation crossings (e.g. `astrology-discuss-with-maia`) live in the registry alone.
3. ⛔ **Arrival must re-validate ownership** of `livingWorkId` server-side and treat an unknown or
   foreign id as absent — the refusal discloses nothing (no title, no existence verdict).
4. ⛔ **"Recently entered: Elemental Alchemy" on return is stored state.** It needs a record
   somewhere; that is the second source of truth WS2-03B refused. The lawful return is the link
   back (`returnHref`), not a House memory of the visit.
5. ⛔ **Studio arrival menu may offer only what has substrate.** *"Review related material"* has
   none today; under `assertStudioMapHonest()` it may not appear. Lawful set: open the declared
   manuscript · choose among declared manuscripts · create/declare one.
6. ⚠️ **Gesture wording.** *Continue* presumes an unfinished state the system would have to
   infer; *Write* narrows the Studio to one act. **Open in Studio** names the place, not the
   member's purpose. Recommended, ⛔ not ruled.

## 5 · Adjacent observation (routed, not repaired)
`livingWorksForHouse()` is `ORDER BY updated_at DESC LIMIT 2` — WHAT'S ALIVE shows the two most
recently touched Works and silently omits the rest. Order is not ranking, but **truncation by
recency is a selection** the member did not make. ⛔ Outside this census; named so it is not
mistaken for settled.

## 6 · Founder rulings owed before any code

| # | Question | Recommendation (⛔ not taken) |
|---|---|---|
| R1 | Lane: convergence step, or own lane? | **Convergence step 2 (Work-primary composition)**, with the return path under step 3. Entering the Studio *by Work* is L1 directly; step 3 as chartered is the in-Studio breadcrumb + *Back to manuscript*, which this work touches only at the return. A separate lane would compete with the convergence gate (*no new product-capability lane until the spine is walked*). |
| R2 | House as crossing endpoint (§3.1) | (b) — lobby→place entry is not a facet crossing; carry the id on the existing `writing` place href. Smallest change; no vocabulary edit. |
| R3 | Crossing gesture as declaration (§3.3) | Ask the founder; genuinely open. |
| R4 | Visual authority | Commit the approved House screens (`ea-house.md`, currently only on the Mac Studio) before any House presentation change, so code follows approved experience. |

## 7 · Build shape, once R1–R4 are ruled (for orientation only)
1. House: each WHAT'S ALIVE Work links to `/writers-studio?from=house&work=<id>`.
2. Studio host: new intake param; server-validated ownership; Work → manuscript resolution
   (0 / 1 / 2+), no default.
3. Per R3: either carry W beside `?m=` with re-validation, or land `ambiguous` honestly.
4. Falsifiers before implementation (S3 Class-B discipline): *first-row default* · *recency
   default* · *foreign work id admitted* · *stored last-Work* · *withdrawn declaration survives
   via URL* — each a defeat candidate that must die.
5. Founder walk: House → choose Work → Studio asks the right question → return without loss of place.

⛔ No provider · ⛔ no store · ⛔ no inferred Work · ⛔ no inferred intent · ⛔ no MAIA
interpretation at the crossing · ⛔ field/relationship questions (HOUSE-FIELD-01) not opened.

---

## 8 · Founder rulings (2026-09-30)

| # | Ruling |
|---|---|
| R1 | **Convergence Step 2 — Work-primary composition.** |
| R2 | **(b).** The House remains the whole, not a place in the crossing vocabulary. The existing Writing doorway carries the Work id; `FACET_CROSSINGS` continues to govern movement *between* places. |
| R3 | **Yes — a scoped declaration of present context, not a durable declaration of relationship.** *Choice resolves context, not ontology.* Structural truth (durable declarations: M may belong to W and W2) and situational truth (the present act: "I am entering M as part of W right now") are kept apart. WS2-03B's ambiguity rule is **not weakened**; its precedence becomes **valid explicit context → inference → ambiguity**, and the resolved Work carries its authority (`member_explicit` \| `relationship_inferred`) so explicit context never masquerades as inference. The carried W has authority only while (1) the member holds M, (2) the member holds W, (3) the member has declared M into W — re-validated on every load; otherwise the URL is never trusted. |
| R4 | **Commit `ea-house.md` from the Mac first; implementation descends from that authority.** |

Governing sentence of the act: ***A member's explicit movement may declare the context in which
something is being encountered without declaring what that thing ultimately is or exclusively
belongs to.***

`WHAT'S ALIVE` (`LIMIT 2`, recency) is **not** solved in this unit; until member-directed
aliveness exists, UI wording must not imply choice or salience beyond recency. Its own later act.

## 9 · `HOUSE-STUDIO-CIRCULATION-01R1 — WORK-CONTEXT CONTINUITY` · progress

| Build item | Standing |
|---|---|
| 1 · commit `ea-house.md` | ⛔ **OWED — only on the Mac Studio; unreachable from a remote session** |
| 3 · Work → manuscripts reverse lookup (`resolveWorkArrival`) | ✅ law layer landed |
| 4 · none / one / several (+ `absent`, `unknown`) | ✅ |
| 6 · M↔W validation on every resolve | ✅ (`resolveSituatedWorkContext`) |
| 7 · WS2-03B precedence amendment | ✅ law layer; header of `workContext.ts` records it |
| 2 · House doorway carries Work id | ⏸ address builder `studioArrivalFromHouse` landed; **`app/house/page.tsx` not edited** (R4) |
| 5 · 8 · carry M+W through Studio navigation | ✅ **Studio side wired** (see §10) — inert until a link produces `work=` |
| 9 · return to W / to House | ⏸ design owed (§10.3) |
| 10 · no `memberId` / no `ALLOWED_CROSSINGS` packet / no "recently entered" / no "Review related material" | ✅ asserted structurally |

Artifacts: `app/writers-studio/situatedWork.ts` · `app/writers-studio/__tests__/situatedWork.test.ts`.
**Lethality first**: 8 laws (L1–L8), 9 defeat candidates (DC1 choice ignored · DC2 first-row
default · DC3 recency default · DC4 URL trusted · DC5 ownership without relationship · DC6
stored last-Work · DC7 authority collapsed · DC8 choice rewrites ontology · DC9 eager before
ready) — **every candidate dies on its named law; every law kills at least one candidate.**
Run: `jest app/writers-studio/__tests__/situatedWork.test.ts` → with the existing
`shellProjection` suite, **84/84 pass** (jest 29 / TS 5.6.3 from a scratchpad; the container has
no project `node_modules` — the founder's run is the evidence of record).

⛔ No UI · ⛔ no House presentation change · ⛔ no Studio host wired · ⛔ no schema · ⛔ no deploy.
Wiring (items 2, 5, 8, 9) opens once `ea-house.md` is committed.

## 10 · Increment 2 — Studio side wired (2026-09-30)

### 10.1 What changed
* **Canonical host corrected.** `/writers-studio` is the C11 unified host (`P4R1StudioHost`,
  modes by `?mode=`); `/writers-studio/rebuild` is not. `situatedManuscriptAddress` now builds
  `/writers-studio?mode=write&m=M&work=W`.
* **The three canonical controllers** (`P4R1WriteEditController` · `P4R1DevelopController` ·
  `P4R1ReviewController`) now resolve via `resolveSituatedWorkContext(…, readStudioWorkParam(params))`
  instead of `resolveWorkContext`. Same four kinds, so every existing branch (`none` /
  `ambiguous` copy — *"The Studio will not choose one for you."*) is untouched.
* **Carry (item 8) needed no code.** Every mode change in Home / Write / Develop / Review builds
  `new URLSearchParams(params.toString())`, so `work=` rides along; wherever the manuscript
  changes to one W does not declare, the claim stops validating and inference resumes.
* **Inert today**: nothing yet produces `work=`. Behaviour changes only once the House doorway
  (item 2) is wired.

### 10.2 Verification (scratchpad toolchain; founder's run is the record)
* `app/writers-studio/__tests__`: **76/76 suites · 809/809 tests** after; **75/75 · 780/780** at
  the prior commit (situatedWork excluded) — **0 regressions**. (A first run showed 13 suites
  "failing"; all were module-load failures — no `react` / jsdom in the container — ⛔ not
  assertions. Reinstalled and rerun rather than reported.)
* Isolated `tsc` over the three controllers + `situatedWork.ts`: **1 diagnostic before, the same
  1 after** (`P4R1WriteEditController.tsx:800`, outside the change, an artifact of partial
  dependencies). **0 new.** ⚠️ `npm run typecheck` (ship gate) not run — needs full deps.

### 10.3 Findings for the founder (⛔ not acted on)
1. ⚠️ **Design-contract tension.** `docs/design/contracts/house-continuity-thresholds.md` (the
   committed House→room membrane) says *"navigation never implies semantic carry, hidden context
   transfer"* and *"`from=house` … must not become hidden content context"*; it does **not**
   list the Studio among its surfaces. `work=` is **not hidden** (visible, member-editable URL),
   carries **identity, not content**, and is authorized by R3 — but the contract predates R3 and
   should record it before the House doorway ships, with `app/writers-studio` added and a
   witness. A founder-governed contract edit, ⛔ not made here.
2. ⚠️ **No return to House from the Studio.** `HOUSE_PLACES.writing.href` already carries
   `?from=house`, yet the Studio renders no `HouseRoomThreshold`. The component and grammar exist
   (*Soullab mark · THE HOUSE · destination · Return to House*). Adding it is a visual change in
   the Studio → wants the same design authority as item 2.
3. ⚠️ **Pre-existing recency defaults inside the Studio** (routed, not repaired):
   `useCurrentManuscript` — *"The most recent is the current book"*; `P4R1HomeController.onMode`
   falls back to `manuscripts[0]`. The House arrival must not flow into either: with `work=W`,
   the Home arrival must present `resolveWorkArrival`'s none/one/several, never the recency pick.
   That Home arrival surface (the *several* chooser) is new UI → design authority owed.
4. ⚠️ **`ea-house.md` still absent from every branch** (fetched 2026-09-30). The committed House
   contracts (`house-room.md`, `house-continuity-thresholds.md`, `house-return.md`) exist and
   cover `app/house/page.tsx`; whether they suffice for an **href-only** doorway change, or R4
   holds until `ea-house.md` lands, is the founder's call.

## 11 · Increment 3 — H1 built end to end (2026-09-30)

### 11.1 Founder rulings H1 (same day)
| # | Ruling |
|---|---|
| H1-1 | **Amend `house-continuity-thresholds.md`**: *a House crossing may carry an explicit Work identity when the member has chosen to continue an existing act of creation. The carried identity is a pointer, not meaning. Destination surfaces remain responsible for interpretation and presentation.* A strengthening, not a weakening. |
| H1-2 | **Studio → House return: yes.** A membrane that opens one way is a funnel. A quiet contextual return, not a browser-like back button. |
| H1-3 | **Arrival precedence: explicit Work → the Work's manuscripts → member chooses → existing fallback.** *Recency is an algorithmic substitute for relationship; the House has already supplied relationship.* Three states: one (name it, member opens) · several (no auto-select) · none (create nothing silently; *Begin this Work* / *Return*). |
| H1-4 | **R4 satisfied for the link** by the committed House contracts; `ea-house.md` remains authority for the larger House architecture. |

### 11.2 What landed
| Step | Artifact |
|---|---|
| A · governance | `docs/design/contracts/house-continuity-thresholds.md` — **Amendment 1** + Studio surfaces added. |
| B · House crossing | `app/house/page.tsx` — each WHAT'S ALIVE Work links via `studioArrivalFromHouse(work.id)` → `/writers-studio?from=house&work=W`; the empty-state link gains `?from=house` (the catalog's own href). ⛔ No visual change. |
| C · resolver | `resolveStudioArrival()` in `app/writers-studio/situatedWork.ts`: explicit Work > member choice > `fallback`. Offers only manuscripts the member **holds**, in **declaration** order; an unheld Work is `fallback` and discloses nothing. |
| D · arrival | `app/dev/writers-studio-pc3-live/P4R1WorkArrival.tsx` (the three states), mounted by `P4R1HomeController` inside the Studio shell. Mode tabs from the arrival go only to a *single* declared manuscript — ⛔ never `manuscripts[0]` / resume. *Begin this Work* reuses the existing C7 `onStartWriting(workId)` (blank manuscript + declaration, on the member's click). Chosen manuscripts open via the existing `open()`, which keeps `work` + `from` in the URL, so Write/Develop/Review resolve W as `member_explicit`. |
| E · return | `app/writers-studio/StudioHouseReturn.tsx`, mounted in `app/writers-studio/layout.tsx`: the shared `HouseRoomThreshold`, only on `from=house`, carrying nothing back. |

⚠️ **One deviation from the H1 text, made to keep R2:** H1-B/E speak of a crossing-registry extension and a *reciprocal crossing*. R2(b) ruled the House is **not** a crossing endpoint, so neither leg is a `FACET_CROSSINGS` entry — the doorway is the existing Writing href carrying `work`, and the return is the existing House threshold component. If you want both legs in the registry, R2 has to be reopened (it would add the House to the crossing vocabulary).

### 11.3 Verification (scratchpad toolchain; ⭐ the founder's run is the record)
* **Lethality**: `studioArrival.test.ts` — 7 arrival laws (A1–A7) × 8 defeat candidates (DA1 recency substitutes for relationship · DA2 first pre-selected · DA2b re-sorted by recency · DA3 silent creation · DA4 refusal discloses · DA5 declaration trusted over holding · DA6 arrival always on · DA7 eager verdict) — **all killed; every law kills one** — plus 5 source guards (House link, chooser pre-selects nothing, arrival never reaches the recency pick, nothing created without a click, return only on `from=house`).
* **Suites**: `app/writers-studio/__tests__` + `app/house` → **79/79 · 851/851**. `lib/navigation` + `app/home` + `components/house` + `lib/house` → 19/21; the **2 failures are pre-existing, identical with this change stashed** (`houseNavDrift` — `/maia/encounter` absent from the Capacitor keep-list; `journalReachability` — Journal route rendering). ⛔ Not caused here, ⛔ not repaired here.
* **An existing guard caught me**: `p4r1AppearanceContinuity` failed on the chooser CSS — I had used shell-local `--fr-*` colours inside the atmosphere membrane block. Repaired by moving to the `--ws-*` tokens (so the member's chosen theme holds on the chooser), ⛔ not by relocating the CSS out of the guard's reach.
* **Types**: isolated `tsc` over the six changed files with React types installed — **one real diagnostic found and fixed** (a redundant `'unknown'` comparison in the controller); the only remaining line is the unchanged `./house.module.css` import, an artifact of absent Next type declarations. ⚠️ `npm run typecheck` (ship gate) not run — needs the full dependency tree.
* **Visual witness — COMPONENT RENDER, ⛔ NOT AN AUTHENTICATED WALK**: the arrival panel's three states rendered through the real `StudioAtmosphere` (Day) + `Shell` + Studio CSS + House threshold band, screenshotted in Chromium at 1440×900 and 390×844 → `docs/design/contracts/screenshots/house-studio-circulation-01r1/arrival-{one,several,none}-{desktop,mobile}.png`. Web fonts absent (system serif stands in). No database, no session, no routing — the House → Studio → House walk is **owed**.

### 11.4 For the founder
1. ⚠️ **Double brand.** With `from=house`, the Soullab mark appears twice: the House band's and the Studio shell's own. The shell is a separate room (its own brand is correct there); whether the band should drop its mark in the Studio is a design call.
2. ⚠️ **Vocabulary drift, pre-existing.** The thresholds contract's grammar says *THE HOUSE · Return to House*; the shared `HouseRoomThreshold` renders *HOME · Return Home →* and links `/home` (which renders the House). I reused the component unchanged, so the Studio says what every other room says. Aligning them is one component edit, for every room at once.
3. ⚠️ **Arrival on "none" when declarations outlived their manuscripts.** A Work whose only declared manuscript was deleted arrives as *This Work has no manuscript yet.* — honest about what can be opened, slightly imprecise about history. Left as is.
4. ⭐ **Owed before members see it**: the authenticated walk (House → Work → Studio arrival → open/choose/begin → Write → Develop → Return Home), and `npm run typecheck` + `npm run preflight` on the Mac.

## 12 · H1 close — threshold rulings (2026-09-30)

| # | Ruling | Landed |
|---|---|---|
| H1-close-1 | The threshold is orientation, not branding: where the destination already carries the Soullab mark, don't repeat it — as **contextual behaviour of the shared component**, not a Studio hack. | `HouseRoomThreshold` gains `destinationCarriesMark` (default `false`, so every other room is unchanged); Writer's Studio declares it. On phones the room name returns when the mark is absent. Test `houseRoomThresholdMark.test.ts`. |
| H1-close-2 | **Both, layered — no canon reversal.** *Home* is the member-facing place (route, navigation, **Return Home**); *The House* names the containing whole in threshold/circulation language. A House threshold is a boundary of the whole, not a place. | Threshold label `HOME` → **`THE HOUSE`**; return stays **Return Home →** `/home`. The 2026-09-28 test (`8b7c6f3d4`) is **amended in place**, with its supersession stated: it now requires the THE HOUSE label and still forbids `Return to House`. The Platform Identity Canon is ⛔ not edited. Contract Amendment 2 records the layering and *return is not undo* (Home → Work → Studio → Home). |

⚠️ **Routed, not repaired — pre-existing vocabulary drift**: Anchor (×3), Oracle, Astrology (×2), Decisions, Practices and Commons still render their own *Return to House →* links to `/house`, outside the shared threshold. Under the layered ruling their action should read *Return Home* → `/home`. A separate sweep; ⛔ not in H1.

## 13 · H1 signed-in witness — ✅ 63/63 (2026-09-30)

**Stack (disposable, in the session container — ⛔ not production):** Postgres 16 + pgvector,
`scripts/bootstrap-database.sh` then `npm run db:migrate` (*all migrations applied + invariants
verified*); one member + one `auth_sessions` row; `next dev -p 3707`; Works and manuscripts
created **through the app's own APIs** (the same calls a member's clicks make). Manuscript
titles were set in SQL — test data, not behaviour under test. Seed design:

| Work | Declared manuscripts | Purpose |
|---|---|---|
| Witness One | Solo Draft | case 1 |
| Witness Several | Chapter 10 — The Alchemical Self · Introduction · Future revision notes | case 2 |
| Witness None | — | case 3 |
| Witness Other | Introduction | makes *Introduction* structurally **ambiguous** — tests R3 directly |
| *(none)* | **Recency Decoy** — newest manuscript, in no Work | any recency leak would pick it |

Each case **starts from a real click on Home** (WHAT'S ALIVE shows 2 Works by recency — §5 — so
the walk touches the chosen Work's `updated_at` first; that is seeding, not the behaviour under test).

| # | Founder's pass | Result |
|---|---|---|
| 1 | one manuscript — recognised, nothing invented | ✅ state `one`, names *Solo Draft*; link carries only `from` + `work` |
| 2 | several — no pre-selection, member chooses | ✅ 3 offered in **declaration** order, decoy absent, none checked, **Enter disabled** until a choice |
| 3 | none — *Begin this Work* explicit, nothing created on arrival | ✅ manuscript + declaration counts unchanged on arrival; *Return* → Home; *Begin* created **exactly one** manuscript, declared into the Work, opened within it |
| 4 | Write / Develop / Review stable, no recency | ✅ from *one* and from *several*: `m` stable, `work` carried, never the decoy, Work named in every mode. ⭐ *Introduction* (in two Works) arrived through *Witness Several* is named **Witness Several** — explicit context, not ambiguity |
| 5 | Return to Home carries nothing | ✅ lands on `/home` with **no query string at all** |
| 6 | plain entry — threshold is a crossing condition, not sticky | ✅ `/writers-studio`, `…?mode=write&m=Introduction`, and a reload: no threshold, no arrival; ⭐ without a carried Work the Studio **names no Work** for the ambiguous *Introduction* (WS2-03B unweakened) |
| + | forged Work id | ✅ unknown id → ordinary Studio home, nothing disclosed |
| + | threshold | ✅ reads *THE HOUSE · WRITER'S STUDIO · Return Home →*; no repeated mark |

**The first run was 61/63, and both failures were my instrument, recorded rather than smoothed:**
(1) Review was still *"Opening this Review…"* on first compile — the walk now waits for load;
(2) I asserted the ambiguity sentence was visible, but `workContextSentence` in
`P4R1WriteEditController` is **computed and never rendered** (pre-existing dead variable — routed,
not repaired). The correct observable — *no Work named* — is now what the walk checks.

**Two real defects the component render could not show, found and fixed here:**
- the fixed **Theme pill covered the threshold's *Return Home →*** (pill 1303–1424 px over a
  link ending at 1306). Fix keeps the pill's pre-existing relationship to the Studio bar, offset
  by the band (`body:has([data-house-return])`, 85 px desktop / 73 px mobile — measured, re-measured
  after: pill 85–119 inside bar 74–130; mobile 73–107 inside 62–118);
- **disabled *Enter* looked enabled** — now visibly unavailable (`:disabled` opacity).

**Project gates, with the full dependency tree installed:**
- `npm run typecheck` reports FAILED with 46 "new" diagnostics — **all `@prisma/client` exports,
  an artifact of installing with `--ignore-scripts` (no `prisma generate`)**. Run the same gate at
  canonical `04005ca7` in a worktree sharing the same `node_modules`: **identical 46, identical
  268 total**. Full `tsc -p tsconfig.ship.json` diagnostic sets at base vs HEAD: **268 = 268,
  byte-identical after line-number normalisation → 0 diagnostics attributable to H1.** HEAD's
  program has exactly 3 more files — the three H1 added. ⚠️ The gate's own green is still owed
  on the Mac with Prisma generated.
- Jest (house, studio, navigation, home): **99/101 suites, 1099/1101** — the 2 failures are the
  pre-existing `houseNavDrift` / `journalReachability` (§11.3).
- `check:no-supabase` ✅ · `check:design-canon` ✅.

**Standing: H1 ✅ WITNESSED ON A DISPOSABLE STACK · 63/63 · 0 attributable type diagnostics ·
⛔ NOT MERGED · ⛔ NOT DEPLOYED · ⛔ founder's own walk on the real stack still the record ·
no crossing-registry reopening (R2 holds).**

⚠️ Routed, not repaired: `workContextSentence` dead variable · WHAT'S ALIVE `LIMIT 2` recency (§5) ·
pre-existing *Return to House* links in six rooms (§12) · a dev-only *"Audio enabled"* toast on the
Studio home (unrelated to H1).

## 14 · Lineage and registry rulings (founder, 2026-09-30)

Three parallel implementations of the House → Writer's Studio crossing existed on the same day:
**HOUSE-STUDIO-CONTINUITY-01** (`claude/beautiful-mayer-mt9jc9`, #1534 stacked on it),
**H1-R1** (#1533, `claude/vigilant-edison-x0oxbf`), and this lane (#1536). Rulings:

1. **#1536 / HOUSE-STUDIO-CIRCULATION-01R1 is the canonical H1 lineage.**
2. **#1533 does not merge** — closed as superseded; its record is preserved as design history.
3. **The continuity branch is superseded, not merged.** Its records stay; individual laws or tests
   may be *ported* into this lineage, never carried as a second implementation.
4. **#1534 is rebuilt on canonical after #1536** as its own act. Law to carry:
   ***A Work containing multiple manuscripts must never silently resolve to the first manuscript***
   — tested for House arrival **and** ordinary Studio behaviour (`manuscriptIdOf()` and the
   `manuscripts[0]` mode fallback), because the defect is deeper than the crossing.
5. **`ea-house.md` is not a prerequisite for #1536.** It was a prerequisite named by the
   superseded continuity lane and governed that lane; no ratified canon makes it a precondition
   for a House crossing. (Checked: none of the three branches carries it.)

### ⭐ Architectural ruling — the House is a threshold origin, not a registry place

> **The House is a threshold origin, not a place in the crossing registry. H1 may carry House
> provenance without widening the registry vocabulary. Any future proposal to make `house` a
> first-class crossing origin is a separate governed architectural act.**

Two levels, kept apart: *conceptually*, "threshold origin" is exactly what the House is doing;
*architecturally*, that does not make `house` a member of `FACET_CROSSINGS`, whose existing
meaning is place-to-place circulation. H1 encodes the distinction locally — `from=house` plus
the situated-work semantics — which preserves the ontology without widening the registry. This
supersedes the H1-R1 D-01 threshold-origin registry entry for H1 and confirms R2(b).

### Port candidate from the continuity lane

Its **F7** — *carried Work authority ceases when the manuscript/Work relationship no longer
validates* — is already law here: `L5-withdrawn-declaration-does-not-survive` (killing
`DC6-stored-last-work`) and walk check 7 (forged id). A cross-reference port of its test is
worth doing in the #1534 rebuild; no second implementation.

## 15 · Founder real-stack walk: a defect found, H1 not yet admitted (2026-09-30)

**Witnesses at the time of writing:**

| Witness | Result |
|---|---|
| GitHub CI on #1536 | ✅ 11/11 green before merge |
| Mac gates on canonical `f5cd0211e` | ✅ `typecheck` "No TypeScript regressions" (222 vs baseline 239, Prisma generated) · ✅ `preflight` passed, including the Docker compose check |
| Real-stack walk | ⚠️ **defect found**, admission held |

**What the walk saw, on the admission build (`localhost:3100`) unless noted:**
- Plain Develop entry: no House bar; the Work is named only because exactly one Work declares the manuscript. ✅
- The House → ELEMENTAL_ALCHEMY → one-manuscript panel → Write → Develop sequence was seen on **port 3139**. That's the `pr1539-walk` worktree: it contains H1 but adds #1539 on top, so it isn't evidence for admission. The behaviour matched H1 in every step, including the theme pill resting on the Studio bar.

**⚠️ Defect (H1's): a failed read hung the arrival on "Opening Writer's Studio…".**
- `resolveStudioArrival` treated every non-ready phase (`unauthorized`, `error`) as `unknown`, meaning not read yet.
- The Home controller tests for `unknown` before it tests for `unauthorized`.
- So a member whose Studio API calls failed, arriving with `work=`, waited forever instead of seeing "Sign in…". The ordinary Studio showed "Sign in" in the same situation.
- **A sibling defect** came to light from reading that code: a failed manuscripts read counted as an empty pool, which would show *This Work has no manuscript yet* and offer **Begin this Work**, creating a duplicate beside existing manuscripts.
- **Repair:** `unknown` now means loading only. A failed Works or manuscripts read returns `fallback`, so the Studio's own handling is reached. Only a readable list, or a read that found none, can produce the arrival states.
- **Tests:** new rules **A8** (a failed read defers to the Studio and never hangs) and **A9** (a failed manuscripts read is not an empty Work). **DA8** and **DA9** reproduce the shipped behaviour exactly, and both are killed by those rules.
- **Results:** Studio and House suites 82/82, 880/880.

**Why the walk hit it (the dev environment, not H1):** two dev servers on `localhost` (3100 = `h1-admission`, 3139 = `pr1539-walk`) use different databases, where the member has different UUIDs. Browsers share `localhost` cookies across ports, so 3139's `maia_member_id` claim contradicted 3100's session. `getMemberIdFromRequest` then correctly refused every Studio API call as a possible impersonation, while the House page (session cookie only) still rendered. That put the arrival into the failed-read path, which is what exposed the defect.

**Also routed, not H1:** in Develop, selecting a section sets `s=` but the whole-Work Overview doesn't respond. It reproduces without the House crossing, so it predates H1; open PR #1532 is the likely home.

**Standing:** H1 is **merged, not admitted**. The repair goes on a fresh branch from canonical; the walk resumes on the repaired build.
