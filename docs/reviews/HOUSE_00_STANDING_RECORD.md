# House — 00 Standing Record

**Pass 1 complete · no-build · no recommendations · assembled 2026-07-29**

Produced under `docs/reviews/ECOSYSTEM_EXPERIENTIAL_REVIEW_CHARTER_2026-07-29.md` §3 (deliverable
"00 — Standing Record") and §7 Pass 1 ("Constitutional reconciliation… **No new recommendations in
Pass 1.**"). Per founder ruling **R-C1** this review runs as reconciliation, not clean-room
discovery. Per **R-C2** the three open PRs are **not ruled here**; they surface as pending evidence
(§F). Per **R-C3** this is a sitting, not a lane.

This document **merges**; it does not review. Every row below is a claim already on the record.
No finding, recommendation, design opinion, or adjudication has been added. Where sources
disagree, both accounts are recorded verbatim and marked **CONTRADICTORY** — none is resolved.
Vocabulary inconsistencies are registered, not reconciled.

**Assembled from:**

| Input | Date | IDs |
|---|---|---|
| MAIA House Presence Audit | 2026-07-17 | `HP-1 … HP-76` |
| Soullab House Coherence Audit | 2026-07-22 | `HC-1 … HC-49` |
| House Destination Coherence Audit | 2026-07-22 | `HD-1 … HD-25` |
| House Navigation Audit | 2026-07-27 | `HN-1 … HN-58` |
| Open PR #801 · #803 · #804 (navigation truthfulness lane) | 2026-07-29 | `PR801-*` `PR803-*` `PR804-*` `PR-X-*` |
| Standing rulings register (canon · ADR · memory · CLAUDE.md) | swept 2026-07-29 | `SR-1 … SR-62` · `F-1 … F-28` |

---

## 0. Two corrections carried into this record as fact

The caller verified both. They **override any source below that says otherwise**. Every affected
row is marked in place.

**Correction 1 — trunk IS branch-protected.** The repository is **`SoullabTech/Sovereign`**, not
`SoullabTech/MAIA-SOVEREIGN`. The prior *"`clean-main-no-secrets` has NO branch protection
(`gh api …/protection` → 404)"* finding was a **wrong-repo 404**. Live state:

```
required_status_checks: { strict: true, contexts: ["build", "check-diagrams"] }
enforce_admins: false · required_reviews: null
```

Consequence: **checks bind ordinary merges; admins bypass.** Anything premised on "no branch
protection" is premised on a falsified claim — notably **issue #807** and part of **#803's**
rationale, including the sentence baked into shipped source at
`lib/navigation/houseDestinations.ts`. Affects: **PR803-10** (§B6), **PR803-11**, **PR803-12**,
**SR-53** (§C).

**Correction 2 — ADR-013 has no file in this repo.** `docs/adr/` contains only `001`, `004`,
`010`, `012`, `README`, `template` (verified via `git ls-files`). ADR-013 is cited by four or more
documents as ratified direction ("ONE MAIA, many Field Configs") and is **unquotable at source**.
Affects: **SR-29** (§C).

---

## A. What the record is made of

| Source | Date | Tracked in git | Items | Character |
|---|---|---|---|---|
| `docs/architecture/MAIA_HOUSE_PRESENCE_AUDIT_2026-07-17.md` | 07-17 | **Yes — on trunk** | 76 | Code-read relationship audit: *"Do members leave MAIA in order to use a feature, or does MAIA accompany them?"* Self-labelled AUDIT ONLY; ends "Awaiting Kelly's review." |
| `docs/ux/SOULLAB_HOUSE_COHERENCE_AUDIT_2026-07-22.md` | 07-22 | **NO — untracked, no commit on any ref** | 49 IDs | Code inventory **plus a live authenticated walk** of 13 House destinations; adoption metrics, room identity briefs, Stage A–D roadmap. Claims to supersede the same-day HD audit. |
| `docs/ux/HOUSE_DESTINATION_COHERENCE_AUDIT_2026-07-22.md` | 07-22 | **NO — untracked, no commit on any ref** | 25 IDs | Narrower same-day code-read: two pass/fail tests — *can you get back to MAIA?* and *does it look like the same house?* Remediation set R1–R5. Contains no reference to HC. |
| `docs/architecture/HOUSE_NAVIGATION_AUDIT_2026-07-27.md` | 07-27 | **NO — see flag below** | 58 | Native-reachability inventory of 16/17 House destinations; "every page exists, almost none resolve on device"; 5-step plan; 3 decisions needed before code. |
| PRs **#801 · #803 · #804** | opened 07-29 | Branches only, all **OPEN, 29 behind trunk, 0 reviews** | 50 | Navigation-truthfulness lane: preserve the 07-27 audit · make the drift guard enforce · route surface audit outside the House. |
| Standing rulings register | swept 07-29 | Mixed (see §C) | 62 SR + 28 F | Canon · ADR · six memory topic files · `CLAUDE.md`. Binding force varies from ratified canon to memory-only index hooks. |

*The HC/HD pair yields **63 merged ledger entries** across its 74 IDs — 11 entries are joint
(one account carrying both an HC and an HD id).*

### ⚠️ FLAG — the 07-27 navigation audit is UNTRACKED

`docs/architecture/HOUSE_NAVIGATION_AUDIT_2026-07-27.md` **is not in the repository.** It exists as
an untracked file in the working tree of branch `chore/e2e-layout-invariants` — *"one `rm` from
gone"* (PR #801 body). Verified:

```
$ git show origin/clean-main-no-secrets:docs/architecture/HOUSE_NAVIGATION_AUDIT_2026-07-27.md
fatal: path '…' exists on disk, but not in 'origin/clean-main-no-secrets'
$ git ls-files --error-unmatch docs/architecture/HOUSE_NAVIGATION_AUDIT_2026-07-27.md
error: pathspec '…' did not match any file(s) known to git
```

**PR #801 is the only thing preserving it.** If #801 is not merged, the artifact can vanish — and
the version that survives in the working tree carries **no supersession note**, so it reads as
current state. The supersession note exists *only* on `origin/chore/preserve-house-nav-audit`.
Three mutually exclusive versions of one filename are in play (HN-43).

### ⚠️ FLAG — the same exposure extends further than the record notices

Verified during assembly (`git log --all -- <path>`), stated as fact, not as a recommendation:

| File | Status |
|---|---|
| `docs/ux/SOULLAB_HOUSE_COHERENCE_AUDIT_2026-07-22.md` | **No commit on any ref.** Working tree only. |
| `docs/ux/HOUSE_DESTINATION_COHERENCE_AUDIT_2026-07-22.md` | **No commit on any ref.** Working tree only. |
| `docs/canon/THE_HOUSE.md` | **No commit on any ref.** Working tree only. |
| `docs/architecture/HOUSE_NAVIGATION_AUDIT_2026-07-27.md` | On `origin/chore/preserve-house-nav-audit` (PR #801) only. |
| `docs/architecture/MAIA_HOUSE_PRESENCE_AUDIT_2026-07-17.md` | On trunk. |

`docs/canon/THE_HOUSE.md` is the source of **SR-1 … SR-6** — the House room-set, the governing
principle *"MAIA may open doors; it may not describe what is on the other side"*, the three-question
House test, and *"the House never moves them."* It is recorded as **"Ratified as direction by Kelly,
2026-07-28"** and it exists in no git ref. Four of the six inputs to this Standing Record, including
the House's own canon, are working-tree-only artifacts on a branch 300+ commits behind trunk.

---

## B. The ledger

**202 merged rows covering 245 categorized source items.** (Two of the 247 source items — `PR-X-1`
and `PR-X-2` — are mechanical statements about relations *between* the PRs rather than claims about
the House; they are recorded in §F rather than the ledger. `PR-X-2` is also absent from the PR
extract's own category tally.)

**Merge discipline applied:**

1. Rows merge only where sources assert the *same claim about the same surface*. Every contributing
   ID is listed.
2. **Each source ID appears in exactly one row.** Where merging moved an item into a different
   category than its source extract assigned it, the row says so.
3. Contradictions are never merged. Two accounts of one surface go to **B5**, verbatim, unresolved.
4. Two cross-source contradictions that no single extract names — surfaced only by putting the four
   audits side by side — are recorded in B5 and labelled **SURFACED BY THE MERGE**. These are
   merge artifacts, not new findings: both accounts were already on the record.

> **Standing correction applied throughout:** `PR803-10` / `SR-53` ("trunk has no branch
> protection") are **FALSIFIED** — see §0, Correction 1.

---

### B1 — Ruled and still active · **27 rows** (39 source items)

| ID(s) | Claim | Source anchor | Evidence type |
|---|---|---|---|
| HP-19 | What IS wired is `PLATFORM_KNOWLEDGE_BOUNDARY` — *"a discipline about what MAIA must not claim, not a map of the house."* | HP audit `:39`, restated `:120` | read-from-code (`maiaVoice.ts:437-498`) |
| HP-22 | *"`isOrientationAsk()` suppresses doorways on orientation questions (good — no routing-engine drift on 'show me around')."* | HP `:43`; restated as standing refusal `:135` | read-from-code (`intentRouter.ts`) |
| HP-28 | Home/landing has no MAIA present — *"No (by design pre-auth)."* Public/marketing/share surfaces excluded from any presence layer. | HP `:57`, `:109` | read-from-code |
| **HP-39 · HP-65 · HN-6 · PR801-10** | Now What? is deliberately outside the House. HP: *"own front door (`arrive`), own sign-in; **deliberately isolated** (founder direction)"*; *"Now What stays sovereign… unless Kelly rules otherwise."* HN/PR801: *"ruling, Kelly 2026-07-22 … a client build on AIN OS, not a native room of MAIA. **Its absence is a correctness condition**… asserted in the House verification harness."* | HP `:68`, `:95`, `:132`; HN 86–88; PR801 audit note | read-from-code + cited-to-founder-ruling. **Harness assertion itself unverified → HN-51 (B6)** |
| HP-53 | *"Quiet = size + silence, never hidden (per **quiet-≠-invisible discipline**)."* | HP `:111` | cited-to-another-doc (source doc not named) |
| **HC-1 · HC-2** | The design system being asked for *"already exists, is ratified canon, and is essentially unadopted."* `SOULLAB_THEME.md` specifies the four-layer field hierarchy (void → field → surface → signal), the palette, the prohibitions, §4 *"Variation by function, not by identity"* and the `data-domain` mechanism: *"same field, different signal."* | HC §0 L13–22 | cited-to-another-doc |
| HC-3 | `SOULLAB_THEME.md` §Prohibitions forbids light canvases in core member flows; **5 rooms currently use them** (Anchor, Journal, Wisdom partial, Lab Tools, Community Library). | HC §1 Counts L78 | read-from-code + cited-to-another-doc |
| HC-4 | Community Library is classified **"Legacy — canon violation"** (white + bright teal); ranked #1 *"Furthest below the MAIA bar."* | HC §1 row 12 L67; §7 L242 | observed-in-running-system + read-from-code |
| **HC-5 · HC-6 · HD-1** | Canon canvas is `#0A1628` and it is *"used by almost nobody."* Canon gold is `#B8860B`. Brand rule on file: *"**Cosmos = deep navy is the field. Espresso = Press only. Plum = atmosphere only.**"* | HC §1 Counts L77, L80; HD header L7–9 | read-from-code + cited-to-another-doc |
| HD-2 | Espresso in `MaiaLeftRail` / `MaiaBoundaryLayout` / Book Studio is *"Espresso (Press-only per brand rule)"* — the rail's espresso use is off-rule. | HD §B row 2 L46; break #2 L55–57 | read-from-code |
| HN-1 | Kelly's assignment: *"Audit and complete the House as the persistent navigation shell… Treat the House as the persistent operating-system menu for AIN, not an Arrival artifact. **Inventory first; code only after.**"* | HN 3–5 | asserted (quoted founder instruction) |
| **HN-2 · PR801-4** | *"`MOBILE_MAIA_KEEP=()` remains empty; every `/maia/*` sub-route is still stripped from the iOS bundle."* Tracked as `nativePolicy:'native', nativeReady:false` — the PR 2 deliverable. **The only audit claim the supersession note affirms as still true.** | HN 23–24; PR801 supersession "Still true" | read-from-code — **independently verified**: `origin/clean-main-no-secrets:scripts/capacitor-patch-routes.sh:56` |
| HN-4 | Settings → `/account/settings`, **Native ✅**, wired, page exists; trunk marks it `nativeReady: true, // reference implementation`. | HN 69 | read-from-code |
| HN-5 | Note ³ — *"Co-lab visibility is conditional (founder/practitioner **or** a pending count), not audience-based."* | HN 84 | read-from-code |
| **HN-7 · HN-8 · HN-9 · PR801-5** | The three "Decisions needed before code" — bundle-vs-open-web per destination · Decisions/Changes placement · delivery split — were **all ruled** 2026-07-27. Recorded outcomes: policy header *"Policy (founder ruling 2026-07-27)"* in `houseDestinations.ts:92`; *"Decisions removed from member grammar with Changes kept as a member-owned sheet"*; *"delivery split PR 1 / PR 2."* **The ruling, not the question, is what remains active.** | HN 118–120; PR801 supersession row 4 | asserted → cited-to-source. **The citation string was not re-read in the PR pass; no ruling document exists in `docs/` (→ HN-56, B7)** |
| PR801-8 | Boundary: *"Preservation is not endorsement… does not reopen the House decisions ruled 2026-07-27, and the audit's remediation plan should not be executed from this document."* | PR801 supersession note + body §Boundary | authored assertion |
| PR803-2 | `mobile-deploy.yml:52` swallowed test failure via `npm test \|\| echo "Tests passed with warnings"`. Left untouched by #803 **by design**. | PR803 body table row 1 | **verified in tree** |
| PR803-3 | `mobile-deploy.yml` triggers on `pull_request: branches: [main]`; trunk is `clean-main-no-secrets`, so it *"never fired for our PRs at all."* | PR803 body table row 2 | **verified in tree** at line 9 |
| PR803-5 | `npm run preflight` *"did not include it."* | PR803 body table row 4 | **verified** — trunk `package.json` has zero `house-nav-drift` occurrences |
| PR803-7 | Scope boundary: *"The general test suite and mobile-deploy's own quality-check behaviour are **left alone**. This is not a test-suite cleanup or a mobile-deploy redesign."* | PR803 body §"The fix (narrow)" | diff-verified (+6/−0) |
| PR803-9 | *"Jest collects the test on the required path (`testMatch: '**/__tests__/**/*.test.ts'`, not in `testPathIgnorePatterns`) — verified, not assumed."* | PR803 §"Red / green evidence" | **independently confirmed** (`jest.config.js:6`, `:19–25`) |
| PR803-13 | The mobile-deploy insertion is blocking because *"the native bundle is built from this config, so House navigation drift must stop the mobile build."* **Unstated consequence recorded in the extract:** the step inherits mobile-deploy's unchanged `branches: [main]` trigger — the never-fires condition the PR itself identifies as defect #2. | PR803 diff `mobile-deploy.yml` +73..+77 | diff-verified |
| PR804-2 | *"`houseDestinations.ts` models 15 destinations rigorously."* | PR804 body §"What this is" | **verified** — exactly 15 `id:` entries on trunk |
| PR804-8 | *"Intentional exposure is not a routing fact"* — a route being un-adjudicated *"is a statement about **the record**, not about the route."* | PR804 body + doc L34–36 | authored discipline (= SR-51) |
| PR804-12 | *"Exactly **one** route outside the House is both allowlisted and bundled: `/open-web` — the web bridge itself, which the drift guard explicitly requires."* | PR804 doc L81–82 | listing-consistent; guard requirement not re-read |
| PR804-16 | Stated limit 4: *"**'No access rule' does not mean 'unprotected.'** Middleware, layout-level guards, and server-side `requireFounder()` all protect routes without appearing in `accessMatrix.ts`. Gates are inherited from ancestor layouts — the chain must be walked, not the page."* | PR804 doc L228–231 | authored limit, consistent with standing memory |
| PR804-17 | Boundary: the document *"does not rank routes by risk · does not propose which routes should be exposed, withheld, or removed · does not reopen the House decisions ruled 2026-07-27, or the Now What? sequencing ruled 2026-07-29 · does not claim any route is unprotected. **Adjudication is a founder act.**"* | PR804 doc L235–243 | authored boundary |

*Moved out of B1 by the merge:* `HC-7 / HD-3` (the inversion) → **B3a**, because no ruling is cited
for it in any source. `HN-3` (Journal → `/labtools/journal`, native ✅) → **B5**, because trunk and
two other audits describe Journal differently.

---

### B2 — Ruled but superseded · **14 rows** (31 source items)

| ID(s) | Claim | Source anchor | Evidence type |
|---|---|---|---|
| HP-7 | *"The CONTINUITY INVARIANT comment confirms restore is **no longer gated by teardown flags**"* — an earlier teardown-flag gating of transcript restore replaced by unconditional rehydrate. | HP `:25` | read-from-code (`OracleConversation.tsx:2810-2824`) |
| HC-8 | *"Supersedes `HOUSE_DESTINATION_COHERENCE_AUDIT_2026-07-22.md` (narrower, same day)."* **HD contains no reciprocal reference and does not acknowledge supersession.** | HC header L5 | asserted |
| HD-4 | HD's remediation set **R1–R5** is *"Held for founder ruling (design changes)"* with explicit sequencing: *"R4 first (cheap, makes the canon legible), then R1, then R3, then R5, then R2."* Superseded **in form** by HC's Stage A–D — a different ordering of the same five moves. **Neither ordering is ruled.** | HD §C L71–82 | asserted |
| HD-5 | HD scopes itself to *"every place reachable from `MaiaHouseSheet`"* and to *"Two questions: **(A) can you get back to MAIA?** and **(B) does it look like the same house?**"* | HD header L3–6 | asserted |
| HN-10 | Sources of truth are the registry `lib/navigation/maiaNav.ts` (`MAIA_WORLDS`, `MAIA_BOUNDARIES`, `MAIA_UTILITIES`), renderer `MaiaHouseSheet.tsx`, native filter `capacitor-patch-routes.sh`, and the unused bridge `app/open-web/page.tsx`. → Superseded by `lib/navigation/houseDestinations.ts` as *"the single authoritative model for every place the House can open."* | HN 10–14 | read-from-code; successor confirmed on trunk |
| HN-11 | The headline — *"Every House destination page exists. Almost none resolve on the native device."* | HN 20 | asserted (synthesis) |
| **HN-12 · PR801-3** | *"On device, of 16 House destinations, only **Journal** and **Settings** (routes) plus **Account** and **Help** (in-app sheets) actually work."* → **Superseded:** *"Destinations not yet in the native bundle are now **withheld** on native rather than rendered as dead buttons."* | HN 25–26; PR801 supersession row 3 | asserted (derived from code read, **not device observation**) |
| HN-13 | *"The rest `router.push()` into routes that were moved to `.capacitor-mobile-backup/` at build time → dead."* | HN 26–27 | read-from-code + asserted device effect |
| **HN-14 · PR801-1** | *"`MaiaHouseSheet` calls `router.push(route)` for everything with **no native/`open-web` awareness**."* → Marked **False**: *"The sheet dispatches through `classifyReachability` / `dispatchHouseDestination` with an `isNative` context."* | HN 29–30; PR801 supersession row 1 | read-from-code; correction verified on trunk (`houseDestinations.ts:332`) |
| **HN-15 · PR801-2** | *"The `/open-web?to=<path>` bridge (opens `soullab.life` in Safari) exists but the House never uses it."* → Marked **False**: *"Web-only destinations route through the bridge and render a `web ↗` mark."* | HN 30–31; PR801 supersession row 2 | read-from-code; PR self-report, no diff evidence |
| **HN-16 · HN-17 · HN-18 · HN-19 · HN-20 · HN-21 · HN-22 · HN-23 · HN-24 · HN-25 · HN-26 · HN-27 · HN-28** (13 inventory rows, merged) | The 13 rows marked 🌐 web-only: page exists ✓, wired ✓, **Native 🌐 = "page exists, stripped from native bundle."** Per ID — **HN-16** Living Field `/maia/living-field` (Worlds, all) · **HN-17** Anchor `/maia/anchor` (Worlds, all) · **HN-18** Ideas `/maia/ideas` (Worlds, all) · **HN-19** Wisdom `/wisdom-keepers/wisdom` (Worlds, all) · **HN-20** Pro Studio `/studio` (Rooms, founder, separate shell²) · **HN-21** Book Studio `/book-studio` (Rooms, founder, separate shell²) · **HN-22** Circles `/commons/circles` (Rooms, founder, separate shell²) · **HN-23** Astrology `/astrology` (Rooms, **all**) · **HN-24** Lab Tools `/labtools` (Rooms, founder) · **HN-25** Community Library `/maia/community/library` (Rooms, **all**) · **HN-26** Vision Studio `/maia/vision-studio` (Rooms, founder) · **HN-27** Keeps `/maia/keep-capture` (Rooms, all) · **HN-28** Co-lab `/team/for-you` (Rooms, conditional³). Audience "**all**" on HN-23 and HN-25 despite native unreachability (→ HN-58). The *page-exists / wired* half is not retracted; the *native reachability* half is superseded by the withheld/bridged model. | HN 44–62 | read-from-code for route/wired/native; **none for the Return column** (→ HN-42) |
| **HN-29 · HN-30 · HN-32** | Decisions (`/studio/decisions`) and Changes (`/studio/changes`) exist as pages with `onOpenDecisions`/`onOpenChanges` props on `MaiaShell` but are **not in the House registry**; plan item 3 — *"Register Decisions & Changes… ruling needed on group (new 'Record'/'Governance' group vs under Rooms) and audience (founder-only today)."* → Ruled the other way: *"Decisions removed from member grammar"*; *"Changes kept as a member-owned sheet."* | HN 76–77, 104–105 | read-from-code + asserted proposal; cited-to-supersession-note |
| HN-31 | Plan item 1 — *"**Native routing model — the load-bearing fix.** … `Capacitor.isNativePlatform() && isWebOnly(route)` → `/open-web?to=<route>` (Safari); else `router.push`. This alone turns 14 dead links into working ones (in Safari) with no page rewrites."* → Implemented in a **different shape**: typed dispatch + withholding, not blanket bridging (→ HN-46). | HN 94–97 | asserted (proposal) |
| PR804-6 | #717 (`UNMAPPED_ROUTE_INVENTORY_2026-07-24.md`, `bd47a3264`) reported 417 static routes / 77 unmapped; #804 reports **418 / 79** — *"#717's counts substantially hold… now **verified** rather than inherited."* | PR804 doc L41–50 | `bd47a3264` verified to exist — **but its subject is a write-perimeter merge, not a route inventory** |

---

### B3 — Implemented but never ruled · **41 rows** (50 source items, net of 6 moves out and 1 in)

> **This is the load-bearing subsection.** These are shipped behaviours for which no source cites a
> founder decision.

**The test applied for the B3a/B3b split** (stated so it can be disputed, not defended):

> An item is **B3a — CONSEQUENTIAL** if the shipped behaviour exercises authority over any of:
> what a member may see · where MAIA may speak · what the House claims to remember · what is
> withheld from the member · what governs access or return. Such an item carries constitutional
> weight without a ruling — it is testable against §C's standing rulings even though no ruling
> authorized it.
>
> An item is **B3b — ORDINARY** if it is implementation detail that plausibly never needed a
> founder decision: build plumbing, component provenance, CI trigger shape, audit tooling.
>
> The split is a judgment, not a finding. Every item remains "implemented but never ruled" either
> way; only the escalation weight differs.

#### B3a — CONSEQUENTIAL · **34 rows**

| ID(s) | Claim | Source anchor | Evidence type |
|---|---|---|---|
| HP-1 | *"Today, members leave MAIA to use every feature. The relationship survives **underneath** (server memory) but not **experientially** (no presence, no room-awareness, four parallel 'MAIAs')."* | HP `:6` (verdict) | read-from-code (aggregate §A–C) |
| HP-3 | The canonical MAIA relationship surface is `components/OracleConversation.tsx`, mounted at `/maia`, `/studio/maia`, and `/field/talk`. *"Everywhere else in the house, it is unmounted."* | HP `:14-20` | read-from-code |
| **HP-4 · HP-15 · HC-7 · HD-3** | **The inversion.** *"There is **no `app/maia/layout.tsx`**; the conversation is a page, not a shell."* *"Each area supplies its own shell (stellium sidebar, studio rail, labtools sidebar, book-studio chrome, NowWhatShell hallway). **No shared inner shell spans areas.**"* HC/HD state the consequence in near-verbatim identical text: *"The House is better connected to its outbuildings than to its rooms"* — outer boundary rooms inherit `MaiaBoundaryLayout → MaiaLeftRail → MAIA` while inner Worlds under `/maia/*` inherit nothing. | HP `:20`, `:34`; HC §2 L106–110; HD §A L31–34 | read-from-code. **Source-category divergence:** HP filed this IMPLEMENTED-NEVER-RULED; HC/HD filed it RULED-AND-STILL-ACTIVE. No source cites a ruling. |
| HP-5 | *"Transcript = React component state, mirrored to localStorage `maia_conversation_${sessionId}` (last 50 msgs) and PostgreSQL `conversation_turns` via `POST /api/conversation/turns`."* | HP `:23` | read-from-code |
| HP-6 | *"`sessionId` minted in `app/maia/page.tsx:457` as `session_${Date.now()}`, cached in localStorage, **rotates daily**."* | HP `:24` | read-from-code |
| HP-8 | *"Same-day transcript survives navigation away and back — **via reload, not via a kept-mounted component**."* | HP `:26` | read-from-code |
| HP-10 | *"The prompt never loads `conversation_turns`; clients resend history (`list/route.ts:715-719` takes `meta.conversationHistory.slice(-6)`)."* | HP `:29` | read-from-code |
| HP-11 | *"Felt continuity comes from per-member server state independent of any client transcript: memory atoms, cross-session exchanges, developmental memories, Bridge D spiral state, anamnesis writes. This survives total client loss. **Relationship memory is more durable than the visible conversation.**"* | HP `:28-29` | read-from-code |
| HP-13 | *"Root layout (`app/layout.tsx`) mounts Subscription/SystemHealth/AethericConsciousness/FeatureTooltip providers, BetaBanner, BugReportButton, MobileRouteGuard — **no MAIA affordance**."* | HP `:32` | read-from-code |
| HP-16 | *"Request body carries no `currentRoom`/`route`/`pathname`. The only route-ish field, `studioContext.pathname`, is destructured server-side and **never used**."* | HP `:37` | read-from-code |
| HP-17 | *"Prompt layers (`maiaService.ts:1270`) include identity, mode, time, relationship, sanctuary, atoms, recall layers, etc. — **no page/room layer**."* | HP `:38` | read-from-code |
| HP-20 | *"MAIA can neither answer 'what is this room?' groundedly nor truthfully say 'I see you're in the Journal' — she **structurally cannot know**."* | HP `:40` ("[EXISTS — negative finding]") | read-from-code |
| HP-21 | *"`intentRouter.ts` keyword-matches 7 intents → `MaiaUiAction`; client `handleDoorwayAction` navigates via **`window.location.href`** — a full page load that tears down the SPA (transcript survives only via the rehydrate path)."* | HP `:42-43`, restated `:82` | read-from-code |
| **HP-24 · HP-47** | *"Four member-facing, MAIA-branded conversational surfaces exist **outside** OracleConversation, each with its own state and endpoint"* — `SessionReviewChat`, `MentorChat`, `MentorPanel`, `NowWhatRoom` — *"none sharing the main surface, thread, or memory write-path with the member's relationship… **The member meets 'MAIA' in four rooms and none of those MAIAs is the one who knows them.**"* Plus dormant/parallel endpoints: `/api/between/chat`, `/api/oracle/conversation`, `/api/library/ask-jeeves`, `/api/ask-maia`, `/api/maia/chat`, `/api/portal/[slug]/chat`. | HP `:45-46`, `:90-96` | read-from-code ("[EXISTS — already actualized]"). **Contradicts a ratified ruling → HP-46 (B5)** |
| HP-26 | **Current presence model, named:** *"MAIA is **available only on conversation pages**, with **duplicate room-local assistants** elsewhere, over a **durable server-side relational substrate** that the member cannot see from inside a room."* | HP `:48` | read-from-code (synthesis) |
| HP-27 | `/maia` baseline: OracleConversation + overlay sheets (QuickJournal, HelpHub) that **do NOT unmount conversation**; continuity Preserved; *"Full prompt stack; no room concept needed."* | HP `:56` | read-from-code |
| HP-29 | Studio: *"**No** on index; separate `/studio/maia` mounts real OracleConversation (back → `/studio`)"*; continuity *"Weakened (full unmount; same-day rehydrate on return)"*; *"`/studio/maia` exists but is a **second copy** of the surface"* — *"rather than a way back to **the** conversation."* | HP `:58`, `:88` | read-from-code |
| HP-30 | Ideas `/maia/ideas`: *"**No**; detail page has idea-scoped 'Continue thinking…' composer — a tool, **near duplicate-assistant line**"*; return path exists — *"'Return to MAIA' `router.push('/maia')`."* | HP `:59` | read-from-code |
| HP-32 | Changes `/studio/changes`: *"**No**; detail embeds `MentorChat` — separate SSE 'MAIA Mentor'"*; continuity *"**Broken** + duplicate assistant"*; return path *"**None** (studio-scoped nav only)."* | HP `:61` | read-from-code |
| HP-33 | Decisions `/studio/decisions`: *"**No**; detail embeds `MentorPanel` ('MAIA Mentor Panel')"*; continuity *"**Broken** + duplicate assistant"*; return path *"**None**."* | HP `:62` | read-from-code |
| HP-35 | Soul Portrait `/soul-portrait/[slug]`: *"No (server-rendered static)"*; continuity Weakened; return path *"`ReturnToSoullab` (**not** to `/maia`)."* | HP `:64` | read-from-code |
| HP-36 | Session Room `/studio/session-room`: *"**No**; embeds `SessionReviewChat` ('Post-session conversation with MAIA') — duplicate assistant"*; continuity *"**Broken**"*; *"'Return to sessions' only; **no** back-to-MAIA."* | HP `:65` | read-from-code |
| HP-37 | Moments `/maia/moments`: linked from within OracleConversation; MAIA not present; continuity *"Weakened (same-day rehydrate on return)"*; return path *"`router.back()` only — history-dependent, **breaks on deep-link**."* | HP `:66` | read-from-code |
| HP-40 | *"**The Journal sheet is the only room built as 'room over relationship' (overlay) rather than 'room instead of relationship' (route).** It is the existing proof that the desired shape works in this codebase."* | HP `:70` | read-from-code |
| HP-41 | Visual absence on *"every non-conversation route. No global dock/handle; `MaiaPresenceProvider` unmounted"* — inverting the principle *"'a member never needs a feature to be accompanied' into 'a member needs the conversation feature to be accompanied.'"* | HP `:76-77` | read-from-code |
| HP-44 | *"No room context ever reaches MAIA… Context loss is **structural, not accidental**: the map (`platformKnowledge.ts`) is authored+tested but has zero imports"*; *"the wired boundary discipline (correctly) forbids her pretending."* | HP `:84-85` ("[EXISTS — total]") | read-from-code |
| HP-45 | *"**Three inconsistent return grammars**: explicit 'Back/Return to MAIA' (Ideas, Guides), bare `router.back()` (Moments, Anchor history — breaks on deep links/refresh), and **none** (Changes, Decisions, Session Room, Soul Portrait, Encounters)."* Note: "Encounters" is named but has no row in the §B map. | HP `:87-88` | read-from-code |
| HP-48 | *"`MobileRouteGuard` allowlist means some rooms don't exist on iOS at all — **presence map differs per platform**."* | HP `:99` | read-from-code (`lib/mobile/mobileAllowlist.ts`) |
| **HC-9 · HD-6** | A shared `MaiaReturn` control was created *"giving the four dead-end surfaces a direct gold icon link home"* and wired into Living Field, Book Studio, Community Library, Vision Studio. | HD §C L68–69; HC §8 L255–257 | HD asserted (self-report of an action taken); HC read-from-code. **Whether it is applied or uncommitted is contradictory → HC-30/HD-15 (B5)** |
| HC-10 | `MaiaReturn` *"currently sits only in the authenticated branch — so the gated state stays trapped even after the fix."* | HC §2 L113–114 | read-from-code |
| HN-33 | *"`MOBILE_TOP_LEVEL` in `capacitor-patch-routes.sh` is an **allowlist** — only listed roots survive the iOS static export. `maia`, `labtools`, `account` are kept; `studio`, `astrology`, `wisdom-keepers`, `commons`, `team`, `book-studio` are **absent entirely**."* **No ruling is cited anywhere for which roots are on the allowlist.** | HN 22–24 | read-from-code |
| HN-36 | Note ² — *"Boundary transitions are separate shells (own back-nav on web; on native, opened in Safari → Safari back / app switch)."* Applies to Pro Studio, Book Studio, Circles, Co-lab. | HN 82–83 | asserted |
| HN-37 | The House renderer groups destinations as **Worlds**, **Rooms**, plus Account/Settings/Help; Worlds = `MAIA_WORLDS` minus `maia`; Rooms = `MAIA_BOUNDARIES` via `getVisibleBoundaries`. **No ruling cited for the two-group grammar**; HN-32 asks whether a third group should exist. | HN 12–13, 40, 50 | read-from-code |
| PR803-1 | The header of `houseDestinations.ts` asserted *"test-enforced AGREEMENT against the existing runtime allowlist and Capacitor build config"* while **no path failed on the guard** — *"a claim the code made about itself that was not true — the same class of misleading navigation claim this lane exists to repair, one level up."* | PR803 body §"The defect"; diff `houseDestinations.ts` +90..+97 | **verified** — trunk `package.json` has no such script; no workflow existed |

#### B3b — ORDINARY · **7 rows**

| ID(s) | Claim | Source anchor | Evidence type |
|---|---|---|---|
| HP-34 | Guides/HelpHub: *"Guides page: No (static). HelpHubSheet: static orientation panel, **not** an assistant — pushes to `/maia/guide`, `/guides`"*; return path *"**Yes** — `backHref='/maia'` 'Back to MAIA'."* | HP `:63` | read-from-code |
| HC-11 | The four `components/core/` primitives (`CorePage`, `CoreCard`, `CoreSection`, `DomainProvider`) *"were built on 2026-04-10"* and map to the requested room shell/surface/section/personality roles. | HC §0 table L23–30 | read-from-code |
| HN-34 | **Account** — footer utility, target `open-account` action, no route, **in-app sheet**, return = "closes sheet." | HN 68 | read-from-code |
| HN-35 | **Help** — footer utility, target `open-help` action, **in-app sheet**, return = "closes sheet." | HN 70 | read-from-code |
| PR803-6 | The new `house-nav-drift.yml` workflow triggers on **every** pull request with no base-branch filter (`on: pull_request:` with no `branches:` key) — the deliberate inverse of mobile-deploy's filter. | PR803 diff lines 36–39 | diff-verified |
| PR804-7 | *"Intentional exposure"* is established solely by *"an authored artifact naming the route"* — a nav link or an accessMatrix rule. Operationalized as a regex over `href\|route\|to\|push(\|replace(` string literals in `app`/`components`/`lib`. | PR804 doc L26–32; script L332–352 | diff-verified |
| PR804-18 | `scripts/audit/route-surface-audit.mjs` makes the counts *"reproducible rather than asserted"* — but the script is **not referenced by any npm script, workflow, or hook**; the `KIND()` heuristic and the `accessMatrix` regex parse are undocumented approximations that could silently drift from `config/accessMatrix.ts`'s real semantics. | PR804 body; diff | committed-but-unwired; contrast PR803 which wires its check into preflight + CI |

---

### B4 — Proposed and still open · **46 rows** (51 source items)

> Note preserved without adjudication: **HD's R1–R5 and HC's Stage A–D are the same five moves in
> two different orderings**, and HC never disposes of R1–R5 by name. They are therefore listed
> separately below, not merged. HD-25 (B7) is the open question about their relationship.

| ID(s) | Claim | Source anchor | Evidence type |
|---|---|---|---|
| HP-18 | The 5-layer platform map `lib/maia/platformKnowledge.ts` **[UNWIRED]** — self-labelled *"AUTHORED CANDIDATE — NOT WIRED"*; only its tests import it. | HP `:39` | read-from-code |
| **HP-50 · HP-54** | Design stance: *"**presence = shared state + place-awareness + one voice — not an icon.** The Journal sheet pattern, generalized and inverted: today the journal is a sheet over the conversation; the proposal makes the conversation a sheet over any room."* One **conversation sheet**: opening the handle slides the *same* OracleConversation state over the current room; closing returns to the room exactly as left. | HP `:104-106`, `:112` | none (proposal) |
| **HP-51 · HP-55 · HP-72** | A single `MaiaPresence` layer in the **root layout** (member-authenticated routes only; excluded on public/marketing/share/Now-What surfaces), owning the member's thread identity (sessionId + continuity policy). *"`MaiaPresenceContext.tsx` is the natural skeleton to revive — but as this conversation sheet, not the 'ambient voice coming soon' bubble it currently sketches."* Classified *"Achievable through the existing shell (small, reversible)."* | HP `:108-110`, `:113`, `:155-156` | none (proposal/recommendation) |
| HP-52 | One **quiet handle**: *"small, fixed, identical in every room — no badge, no pulse, no unprompted speech, dismissible per-session."* | HP `:111` | none (proposal) |
| HP-56 | *"What stays local to each room: Everything else… (the idea-notes composer is a **tool** and should stay one — labeled as a tool, not as MAIA). Rooms remain fully usable with the sheet never opened. No room imports conversation logic."* | HP `:115-116` | none (proposal) |
| HP-57 | Client: one field in the existing request body, e.g. `place: { room: 'decisions', detail?: … }` — derived from the pathname **at send time only**. *"**No dwell time, no click trail, no route-change events, no 'member has been idle.'** Context rides only on messages the member chooses to send; presence of context never triggers MAIA speech."* | HP `:118-119` | none (proposal) |
| HP-58 | Server: one small prompt layer (*"The member is currently in the Decisions room"*) + **wire `platformKnowledge.ts` AREAS layer** — *"currently authored, **tested 78/78**, unwired — awaiting Kelly's voice pass per standing note."* `PLATFORM_KNOWLEDGE_BOUNDARY` stays as the guardrail. | HP `:120` | none (proposal); **the "tested 78/78" figure is asserted without an anchor** |
| HP-59 | *"Decouple transcript restore from daily sessionId rotation: on open, load the member's recent turns (**member-scoped, not sessionId-scoped**) so day boundaries stop amputating the visible relationship."* | HP `:123` | none (proposal) |
| HP-61 | *"Replace `window.location.href` doorway navigation with `router.push` so MAIA-suggested movement stops being a teardown."* | HP `:124`, `:157` | none (proposal) |
| HP-62 | Summoning and dismissal: **Member-initiated only.** *"Handle → sheet opens (MAIA says nothing until spoken to; the room's name may appear as a quiet label, which is state, not speech). Dismiss → sheet closes, room untouched. Deep links and refreshes land in the room with the handle present and the sheet closed."* | HP `:126-127` | none (proposal) |
| HP-63 | *"What must NOT be centralized: Room logic and room tools (no 'MAIA renders the room')."* | HP `:129-130` | none (proposal) |
| HP-66 | Refusal set: *"No route-change auto-open. No per-room assistants. No screen narration. No behavior/inactivity monitoring. No inferred-intent expansion (the orientation guard's doorway-suppression stays). **No proactive 'I noticed you're in…'** — MAIA may **know** the room; she may not **volunteer** observations about the member's movement through it."* | HP `:134-135`, `:164` | none (refusal set) |
| **HP-67 · HP-68 · HP-69** | Three experience sketches under the proposed architecture: (1) Book idea → Studio — *"same transcript, same thread"*; MAIA answers with conversation context *and* `place: studio`; *"Sheet closes; Studio never moved."* (2) Independent Decisions use — *"MAIA neither appears nor speaks — the handle just exists… She does not know how long they were there, what they clicked, or why they came — structurally cannot."* (3) Soul Portrait → Journal — *"Returning to conversation is not a return at all — it never ended."* | HP `:141`, `:143`, `:145` | none (sketches) |
| HP-70 | *"Unify the return grammar — explicit 'Back to MAIA' (never bare `router.back()`) on Moments, Anchor history; add return paths to Soul Portrait, Changes, Decisions, Session Room. **Smallest real repair available today.**"* Classified *"Copy/interaction design only (no architecture)."* | HP `:151-152` | none (recommendation) |
| HP-71 | *"Naming pass on the mentor/review surfaces pending the one-voice ruling."* | HP `:153` | none (recommendation) |
| HP-74 | *"**Safest sequence:** 1 → 3 → 4 → (Kelly reviews this audit) → 5 → 6 → 7… nothing before step 5 changes what MAIA knows, only where she can be reached."* Items 5–7 labelled *"Architectural change (Kelly review first)."* | HP `:159-166` | none (recommendation) |
| HC-12 | Collection grammar — **Field**: *"Every room is `CorePage`. Void/field/surface/signal. **Never a light canvas in a member flow.** One dark: `#0A1628` canvas, `#060D18` deep."* | HC §4 L145–148 | asserted |
| HC-13 | **Signal** — *"One gold: `#B8860B` (soft `#D4AF37`). Retire `#c9a54e`, `#D4B896`, bare `amber-500` from chrome. Accent is meaning, never decoration."* | HC §4 L149–150 | asserted |
| HC-14 | **Type** — *"Display serif (Spectral) for room titles and MAIA's voice; Inter for controls… Ideas already does this correctly and can be the reference."* | HC §4 L151–153 | asserted + observed |
| HC-15 | **Return** — *"One `ReturnToMaia`: flame + 'MAIA', upper-left, stable, one tap to `/maia`, label 'Return to MAIA', **present in loading / empty / error / gated states too.** Room-adapted in material, never in position or meaning."* | HC §4 L154–156; §6 L197–198 | asserted |
| HC-16 | **Materials / Motion / Icons** — shared radius, border opacity, tonal-lift elevation; *"One pacing… No full-theme jumps between rooms"*; *"One family (lucide), one stroke weight (1.5), one size scale."* | HC §4 L158–166 | asserted |
| HC-17 | Room identity briefs assign each of 13 rooms a material metaphor, temperature, `data-domain` accent, and a "must stay unique" element — MAIA *"living hearth … the jewel, the plum bloom — **do not touch**"*; Book Studio *"**espresso lives here**"*; Community Library *"shelves and stacks — **not a product catalogue**."* | HC §5 table L173–187 | asserted (*"Derived from each room's actual purpose… not imposed"*) |
| HC-18 | Shared primitives — *"**Adopt (already built, 0 new code):** `CorePage` · `CoreCard` · `CoreSection` · `DomainProvider`"* and *"**Add (three, small):** `ReturnToMaia`, `RoomHeader`, `RoomStates`."* | HC §6 L193–202 | asserted |
| HC-19 | *"**Fix, don't add:** `MaiaLeftRail` — re-tone espresso → navy, single gold, responsive drawer under `md`. And consolidate **7 holoflower implementations** to one."* | HC §6 L204–206 | asserted |
| HC-20 | **Stage A — Belonging and return** (presentation-only, fully reversible): `ReturnToMaia` in all 13 rooms + gated/error states · Wisdom `← Back` → MAIA · Anchor `router.back()` → MAIA · `app/maia/layout.tsx` so Worlds inherit chrome. *"Risk: **low.**"* | HC §7 L211–214 | asserted |
| HC-21 | **Stage B — Foundation coherence**: retone `MaiaLeftRail` + `MaiaBoundaryLayout` espresso → navy, one gold, responsive drawer · one icon spec · `MaiaHouseSheet` hard hexes → tokens · Vision Studio white-PNG holoflower. *"Risk: **low–medium** (rail is shared by 4 rooms + 135 nested pages — that is the leverage)."* | HC §7 L216–219 | asserted |
| HC-22 | **Stage C — Room identity passes**, ordered Community Library → Anchor → Journal → Lab Tools → Living Field → Wisdom → Vision Studio → Pro Studio → Book Studio → Circles → Astrology. Each = wrap in `CorePage domain=…`, delete one-off palette, apply material. *"Risk: medium."* | HC §7 L221–225 | asserted |
| HC-23 | **Stage D — Nested and edge states**: 15 nested layouts · modals/sheets · tier gates · *"the two divergent auth refusals"* · mobile safe-area + keyboard. *"Risk: medium–high; **the auth-posture divergence is the only genuinely structural item and needs its own ruling.**"* | HC §7 L227–232 | asserted |
| HC-24 | Quick wins (hours): *"Vision Studio white PNG · Wisdom label · Anchor return · House sheet tokens · rail retone · Community Library teal → `archive` domain."* | HC §7 L233–235 | asserted |
| HC-25 | Deeper refactors needing sequencing: *"`app/maia/layout.tsx` without double-railing `/maia` · Community Library 1168-line rewrite · Studio's 670-line parallel nav vs the rail · 7 holoflowers → 1 · Journal's 12 pastel families."* | HC §7 L237–239 | asserted |
| HC-26 | Acceptance standard: *"Every room feels individually authored, yet every room clearly belongs to Soullab."* Stage A satisfies the return half; Stage B most of the belonging half; Stage C *"is where the rooms become **themselves**."* | HC L259–264 | asserted |
| HD-7 | **R1** — *"Retire espresso from `MaiaLeftRail` + `MaiaBoundaryLayout`; re-tone to `maia-navy-900/850`, icons to `maia-gold`. Confines espresso to Book Studio / Press, per the brand rule."* | HD §C L73–75 | asserted |
| HD-8 | **R2** — *"Convert the light surfaces (Anchor, Journal, Wisdom, Lab Tools, Community Library) to the navy field. Largest change; **Anchor's light gradient may be a deliberate contemplative choice — ask first.**"* | HD §C L76–77 | asserted |
| HD-9 | **R3** — *"Introduce `app/maia/layout.tsx` so Worlds inherit shared chrome, and give the rail a responsive treatment (drawer under `md`) instead of permanently eating 56px on phones."* | HD §C L78–79 | asserted |
| HD-10 | **R4** — *"Replace hard-coded hexes in `MaiaHouseSheet` with `maia-navy-*` / `maia-gold` tokens."* Sequenced **first** by HD; placed in Stage B (not first) by HC. | HD §C L79, L82 | asserted |
| HD-11 | **R5** — *"One icon spec: size, stroke weight, and gold, applied to House + rail together."* | HD §C L80 | asserted |
| HN-39 | Plan item 2 — *"**Bundle the few that should feel native.** Candidates that belong inside the app (e.g. Anchor, Ideas, Keeps, Living Field): add to `MOBILE_MAIA_KEEP` **and** make each static-export-safe (`x-member-id`/`apiFetch`, no `force-dynamic`/`cookies()` literals). Each carries a real cost — do only the ones worth it; the rest ride the `open-web` bridge."* Still open: this is *"the PR 2 deliverable"*; trunk marks the affected destinations `nativeReady: false, // PR 2`. | HN 99–102 | asserted (proposal) |
| HN-40 | Plan item 4 — *"**Return audit (Phase 2).** Confirm each destination has a back-to-House/MAIA affordance on native — House Presence doorway for `/maia/*`, Safari/app-switch for `open-web`, explicit for boundary shells."* **No record found of Phase 2 being performed.** | HN 107–108 | asserted (proposal) |
| HN-41 | Plan item 5 — *"**The original three, now scoped as shell work:** holoflower vertical clearance (safe-area), Keep button placement + native auth-race, and whether returning members land on the Arrival surface at all (`shouldRenderArrival`)."* | HN 110–112 | cited-to-another-doc (memory `project_native_device_walk_ledger`, 4 open threads) |
| PR801-7 | The audit's 5-step *"What 'complete the House' means"* plan is preserved in #801 — but the PR body explicitly says it *"should not be executed from this document."* | PR801 audit §"What 'complete the House' means" | preserved text |
| PR801-9 | Decisions (`/studio/decisions`) and Changes (`/studio/changes`) exist as pages with `onOpenDecisions`/`onOpenChanges` props on `MaiaShell` but are **not** in the House registry; each *"needs a registry entry + placement/audience ruling."* Trunk now has `id: 'changes'` but **no** `decisions` — partially superseded, and the supersession note does not say so. | PR801 audit §"Requested by Kelly but NOT in the House registry" | audit self-report (07-27 tree) |
| PR803-12 | *"Making it blocking needs branch protection enabled + `house-nav-drift` added to required checks — a repository admin setting, not a code change."* **Per §0 Correction 1 the first half is moot (protection exists); adding the context remains open and is nobody's assigned action in this PR.** | PR803 body §"⚠️ What this does NOT do" | assertion, half falsified |
| PR804-9 | Set A = **33 routes** (*"what governs a door we already opened?"*); Set B = **46 routes** (*"is this a door at all?"*). *"Same 79 routes, two different questions, two different kinds of work."* Named sub-clusters the document declines to rule on: `/now-what/*` (7 routes, linked, ungoverned); `/privacy` and `/terms` (*"almost certainly intentionally public. Nothing in the tree says so"*); largest un-adjudicated groups `/model-studio/*` (9) and `/maia/field-lab/*` (4). | PR804 doc §"What the third axis adds" + full listings | script-derived; both sets fully enumerated |
| PR804-10 | Five House destinations are governed by `houseDestinations.ts` **and by no accessMatrix rule** — `/maia/anchor`, `/maia/living-field`, `/maia/keep-capture`, `/maia/vision-studio`, `/press/manuscript`. *"Two governance systems, one surface, neither aware of the other. Whether that is a gap or a deliberate division of labour is **a founder question**."* | PR804 doc L135–139 | `/press/manuscript` **verified** as the `studio` destination's route on trunk (`// INTERIM`) |
| PR804-11 | *"**35 routes outside the House are in the runtime mobile allowlist but absent from the native bundle**"* (18 not-adjudicated · 17 linked) — *"the same failure the House contract was built to prevent, in the region the contract does not reach."* | PR804 doc L76–79 | static, script-derived, not re-run |
| PR804-15 | Stated limit 3: *"**910 `app/api/**/route.ts` files are a separate and larger sweep, still not run.** #717 said the same; it remains true."* | PR804 doc L226–227 | count not verified |

---

### B5 — Contradictory accounts · **20 rows** (27 source items)

> **No contradiction below is adjudicated.** Both accounts stand as written.

**B5-1 · `/api/between/chat` — sprawl or the canonical default?** · `HP-25`

| Account A | Account B |
|---|---|
| Listed among *"dormant/parallel endpoints"* contrasted with the canonical surface. | In the same sentence, parenthetically: *"**OracleConversation's default apiEndpoint**"* (`OracleConversation.tsx:560`). |

*Anchor:* HP `:46` (§A.7). *Note on record:* `CLAUDE.md` separately describes `between/chat` as "observe-only."

---

**B5-2 · Four MAIAs vs the ratified one-voice ruling** · `HP-46`

| Account A | Account B |
|---|---|
| Four parallel MAIA-branded assistants exist in production (HP-24/HP-47, §B3a). | *"This directly contradicts the ratified **one-MAIA/one-voice ruling (Jeeves ruling)**"* — *"Leaving four MAIAs standing is the one option the one-voice ruling forecloses."* |

*Anchor:* HP `:96`, restated `:131`. *Evidence:* read-from-code + cited-to-another-doc — **the Jeeves ruling is named with no file path anywhere in the audit.**

---

**B5-3 · Wisdom's return affordance** · `HC-27 / HD-12`

| Account A — HD (read-from-code, line-anchored) | Account B — HC (observed-in-running-system, live walk) |
|---|---|
| Wisdom → *"`href=\"/maia\"` :227 \| ✅"* | Wisdom → *"`← Back` — says **Back**, not MAIA … **wrong label**"* |

*Anchors:* HD §A row 6 L22; HC §2 row Wisdom L94. *Surface:* `/wisdom-keepers/wisdom`.

---

**B5-4 · Astrology's field colour** · `HC-28 / HD-13`

| Account A — HD (read-from-code) | Account B — HC (observed-in-running-system) |
|---|---|
| Astrology listed under *"**Pure black**"* — *"50× `bg-black`"*, an incompatible palette system. | *"navy + stars ✓"* and *"**Genuinely good** — navy field, drifting stars, warm gold headline. **Closest room to its own brief already.**"* |

*Anchors:* HD §B row 5 L50; HC §1 row 10 L65 and §3 L128. **Internal tension inside HC itself:** HC's own darks count lists `#000` *"(Astrology/Wisdom)"* (L77) against its "navy + stars ✓".

---

**B5-5 · Wisdom's field colour** · `HC-29 / HD-14`

| Account A — HD | Account B — HC |
|---|---|
| Wisdom is a *"**Light mode**"* surface (`#f8f7f5` gradient / `bg-white` / `bg-stone-50/100`). | Wisdom is *"`stone-950` + `black` + `white`"*, classified **Fragmented**; elsewhere counted as *"Wisdom partial"* among light canvases. |

*Anchors:* HD §B row 4 L48; HC §1 row 6 L61 and Counts L78. *Evidence:* **both read-from-code.**

---

**B5-6 · Status of the `MaiaReturn` work** · `HC-30 / HD-15`

| Account A — HD (asserted) | Account B — HC (read-from-code) |
|---|---|
| *"**Applied now** (functional defects, not design opinions)"* — presented as done and out of scope for founder ruling. | *"**uncommitted on the working tree** … They are Stage A candidates. **Revert or keep — your call.**"* — presented as an unresolved decision. |

*Anchors:* HD §C L68–69; HC §8 L255–257. *Surface:* `components/maia/MaiaReturn.tsx`. *Related:* the work itself is B3a (HC-9/HD-6); the open decision is B7 (HC-46).

---

**B5-7 · How many golds** · `HC-31 / HD-16`

| Account A — HD | Account B — HC |
|---|---|
| *"**Two golds.**"* — then enumerates three treatments (`#c9a54e` @18px sw1.5 · `#D4B896` @20px default · canon `#B8860B`): *"Same icons, three treatments."* | *"**Golds:** `#c9a54e` (House) · `#D4B896` (rail/topbar) · `#B8860B` (canon) · `amber-500` (many)"* — **four.** |

*Anchors:* HD §B break #4 L61–62; HC §1 Counts L80. *Evidence:* **both read-from-code.**

---

**B5-8 · How many palette systems / how many darks** · `HC-32 / HD-17`

| Account A — HD | Account B — HC |
|---|---|
| Heading *"**four incompatible systems**"* over a **five-row** table (Navy · Espresso · Stone/charcoal · Light mode · Pure black); break #3 says *"**Three darks that are not the same dark**"* then lists **four** (`#0B1A30` · `#0f0d0b` · `#0c0a09` · `#000`). | *"**Darks in use, none matching:**"* lists **six** (`#1a1a2e` · `#0f0d0b` · `#0c0a09` · `#0b0f1c` · `#000` · `#0A1628`); *"**Named palettes competing:**"* lists **four** families (Soullab Core · `maia.*` · Dune · raw Tailwind). |

*Anchors:* HD §B L41–50, L58–59; HC §1 Counts L77–79. *Evidence:* **both read-from-code.**

---

**B5-9 · Which navy is "the navy"** · `HC-33 / HD-18`

| Account A — HD | Account B — HC |
|---|---|
| *"Navy (canonical)"* in use = `#0B1A30`/`#071426` gradient, `maia-navy-850/900` (House sheet, Circles, signin); canon reference navy = `#0A1628`. | MAIA's own field is *"`#1a1a2e` indigo + plum bloom"* (MaiaShell); canon is *"`#0A1628` canvas, `#060D18` deep."* **`#0B1A30` does not appear in HC's darks list at all.** |

*Anchors:* HD header L7–9, §B row 1 L44–45; HC §1 row 1 L56, Counts L77, §4 L147–148.

---

**B5-10 · Vision Studio's return state** · `HC-34 / HD-19`

| Account A — HD (read-from-code) | Account B — HC (read-from-code + observed) |
|---|---|
| *"tab bar → Living Field only \| ❌ dead end"* — an affordance exists but points elsewhere. | *"**none** → `MaiaReturn` added (uncommitted) … was **dead end**"*; header grammar listed as "tab bar." |

*Anchors:* HD §A row 13 L29; HC §1 row 13 L68, §2 row Vision Studio L101. *Surface:* `/maia/vision-studio`.

---

**B5-11 · Community Library's return state** · `HC-35 / HD-20`

| Account A — HD (read-from-code) | Account B — HC (observed-in-running-system) |
|---|---|
| *"**none** (only in-page 'Back to Library')"*. | *"**none** → `MaiaReturn` added (uncommitted)"*; and on mobile the MAIA link is *"**clipped behind rail**."* |

*Anchors:* HD §A row 12 L28; HC §2 row Community Library L100. *Surface:* `/maia/community/library`.

---

**B5-12 · The Return column vs Note ¹** · `HN-42`

| Account A — the tables | Account B — the note |
|---|---|
| The Inventory tables populate a **Return** column for **all 17 rows**, presented as findings. | Note ¹ states *"**Return not individually verified in this pass.**"* |

*Anchors:* HN 42–70 vs HN 80–81. *Evidence:* **none, for the Return column itself.**

---

**B5-13 · The record exists in two mutually exclusive states** · `HN-43`

| Account A — working tree | Account B — PR #801 branch |
|---|---|
| An **untracked copy with no supersession note**, which still reads as current state. | An **unmerged branch copy** whose first block says *"Do not cite it as current state."* |

*Anchor:* working-tree line 1 vs `origin/chore/preserve-house-nav-audit` §"⚠️ SUPERSESSION NOTE". **Trunk has neither.** *Evidence:* observed-in-running-system (git).

---

**B5-14 · How many House destinations are there?** · `HN-44 · PR-X-3`

| Account A — the 07-27 audit's own figures | Account B — the shipped model |
|---|---|
| Headline: *"of **16** House destinations"*. Tables list **17** (5 Worlds + 9 Rooms + 3 footer). Plan item 1: the bridge *"turns **14** dead links into working ones"*, while the tables show **13** rows marked 🌐. | #804: *"`houseDestinations.ts` models **15** destinations rigorously"* — **verified**: exactly 15 `id:` entries on trunk. |

*Anchors:* HN 25, 42–70, 97; PR804 body ¶1; trunk `lib/navigation/houseDestinations.ts`. **#801's supersession note does not reconcile the count.** The extract records that 16-vs-15 is *plausibly* pre-contract registry vs post-contract model — *"but no artifact says so."*

---

**B5-15 · Decisions — register it, or remove it?** · `HN-45 · PR-X-4`

| Account A — the 07-27 audit | Account B — the ruling record + trunk |
|---|---|
| Decisions *"Needs a registry entry + placement/audience ruling."* Plan item 3 proposes registering **both** Decisions and Changes. | Supersession note: *"**Decisions removed from member grammar**"* with *"Changes kept as a member-owned sheet."* Trunk has `id: 'changes'` and **no** `decisions` entry. #801's table marks the three decisions *"All ruled"* **without recording what was ruled about Decisions**. #804 lists neither `/studio/decisions` nor `/studio/changes` in Set A or Set B. |

*Anchors:* HN 76, 104–105 vs supersession note row 4; trunk `houseDestinations.ts`. *Related memory:* `project_decisions_changes_split_ruling` (Changes = member, Decisions = practitioner) — itself recorded as partially superseded (SR-39, §C).

---

**B5-16 · Bridge everything, or withhold?** · `HN-46`

| Account A — the audit's proposal | Account B — the shipped model |
|---|---|
| *Bridge everything web-only to Safari* — *"turns 14 dead links into working ones (in Safari)"*. | **Withholds** unbundled destinations — *"withheld on native rather than rendered as dead buttons"* — so those items are **hidden, not bridged**. |

*Anchors:* HN 94–97 vs supersession row 3 and `classifyReachability` (`return d.nativeReady ? 'native' : 'hidden'`). *Evidence:* read-from-code (trunk `houseDestinations.ts:332–337`).

---

**B5-17 · Page-existence vs destination-existence** · `HN-47`

| Account A | Account B |
|---|---|
| *"**Every House destination page exists.**"* | A section titled *"**Requested by Kelly but NOT in the House registry**"* lists two pages (Decisions, Changes) that exist but are **not** House destinations. |

*Anchor:* HN 20 vs HN 72–77. The two terms are used interchangeably. *Evidence:* none.

---

**B5-18 · The five-state classification names a state that does not exist** · `PR804-3`

| Account A — the script header / PR title | Account B — the artifact |
|---|---|
| *"Produces the five-state classification Kelly ruled: exists · technically reachable (web/native) · **intentionally exposed** · **intentionally withheld** · not yet adjudicated"*. | The committed document defines **three dimensions** (Existence · Navigability · Intentional exposure). The classifier emits **four** exposure values (`exposed (linked + ruled)` · `exposed (linked, no access rule)` · `ruled, not linked` · `NOT ADJUDICATED`). **"Intentionally withheld" is computed nowhere, counted nowhere, and listed nowhere.** Two of the four emitted values are never surfaced as named sets. |

*Anchors:* `route-surface-audit.mjs` L253–255 vs `ROUTE_SURFACE_AUDIT_2026-07-29.md` L22–26 and script L368–372. *Related:* PR804-4 (B7) asks where "withheld" lives — `houseDestinations.ts` has a `hidden` outcome, but **inside** the House, outside this audit's scope.

---

**B5-19 · What and where is Journal?** · `HP-31 · HN-3 · PR801-6` — **SURFACED BY THE MERGE**

*Three preserved accounts of one destination. No single extract names this conflict.*

| Account A — HP (07-17) | Account B — HN (07-27) | Account C — PR #801 / trunk |
|---|---|---|
| *"`/journal` = **server redirect**; the real journal is **QuickJournalSheet overlay on `/maia`**"*; MAIA present *"**Yes** (as sheet — the one room that got this right)"*; continuity *"**Preserved** — conversation stays mounted beneath."* (`app/journal/page.tsx:3`, `app/maia/page.tsx:1679`) | Journal → **`/labtools/journal`**, *"**Native ✅ bundled (works in-app today)**"*; trunk `houseDestinations.ts` marks it `nativeReady: true, // reference implementation`. (HN line 45) | Journal's House route was **corrected** from `/labtools/journal` to **`/journal`**, annotated in-code *"was /labtools/journal — **founder-gated + stripped**."* **Verified in tree.** *"The correction appears nowhere in #801's supersession table."* |

*Cross-reference:* HC-43 (B6) records that `/labtools/journal` is *"reachable only through a middleware/cookie gate; not walkable with localStorage identity alone"* — i.e. HC could not walk the route HN calls the working reference implementation. HN-3 was filed RULED-AND-STILL-ACTIVE by its own extract; it is moved here because trunk and two other audits describe the same destination differently.

---

**B5-20 · Is there a deployed House Presence system?** · `HP-2 · HP-14 · HP-38 · HN-38` — **SURFACED BY THE MERGE**

*No single extract names this conflict. Ten days separate the two accounts; whether that is sequence or contradiction is not resolvable from the record.*

| Account A — HP (2026-07-17) | Account B — HN (2026-07-27) |
|---|---|
| *"A persistent icon does not exist — and notably, the one that was designed (`MaiaPresenceContext`) was never mounted."* · *"`lib/contexts/MaiaPresenceContext.tsx` **[UNWIRED]** — explicitly implements 'persistent companion across all pages' (fixed z-9999 floating overlay). **`MaiaPresenceProvider` has zero mount sites.** Its expanded state says 'Ambient voice coming soon.'"* · Anchor history `/maia/anchor/history`: MAIA not present; continuity Weakened; return path *"`router.back()` only."* | *"A **'House Presence doorway system'** is **deployed**"* and covers return for `/maia/*` destinations — the Return column for Living Field, Anchor, Ideas, Wisdom reads *"House Presence doorway¹"*. |

*Anchors:* HP `:6`, `:33`, `:67` vs HN 80–81 (Note ¹), 44–48. *Evidence:* HP read-from-code (zero mount sites); **HN asserted — stated as deployed with no anchor or verification given.** The same HN note simultaneously declares *"Return not individually verified in this pass"* (HN-50, B6; HN-42, B5-12).

---

### B6 — Unverified claims · **33 rows** (32 source items + `PR803-10` moved in)

> Charter definition: *"asserted; evidence is intention, not observation."*

| ID(s) | Claim | Source anchor | Evidence type |
|---|---|---|---|
| **PR803-10** | *"`clean-main-no-secrets` has **no branch protection configured** (`gh api …/protection` → 404)."* **⛔ FALSIFIED — see §0 Correction 1.** Protection returns **200** with `required_status_checks.contexts = ["build","check-diagrams"]`, `strict: true`, `enforce_admins: false`. The 404 was a **wrong-repo probe**. The narrower true statement is that `house-nav-drift` is not among the required contexts. **This claim is not only in the PR body — it is baked into shipped source** at `lib/navigation/houseDestinations.ts` +96..+97. It also propagated into the standing memory hook and into issue **#807**. | PR803 body §"⚠️ What this does NOT do"; `houseDestinations.ts` header | **falsified by live API 2026-07-29** |
| HP-9 | *"Cross-day, the rotated sessionId orphans the prior transcript (data persists in PG but **no UI path reloads an old sessionId** — [INFERRED] no such path found)."* | HP `:26` | asserted (author-labelled [INFERRED]; absence-of-evidence) |
| HP-12 | Relationship memory being more durable than the visible conversation is *"**the opposite of what the member experiences**."* | HP `:29` | asserted — no member observation or session data cited |
| HP-42 | *"Same-day, same-device: transcript survives via rehydrate. Not a kept relationship — a reconstructed one, but **the seam is invisible**."* | HP `:80` | asserted — code anchor given for the rehydrate; *invisibility of the seam* is not an observed finding |
| HP-43 | *"**Cross-day:** daily sessionId rotation orphans yesterday's thread; no UI reloads it. Next-day return = **visually blank slate** despite full PG history. This is the **largest pure state break**."* | HP `:81` | asserted — rests on the [INFERRED] finding at `:26`; no observed next-day session cited |
| HP-49 | *"Static Capacitor builds lose the PG restore path (API routes excluded) → transcript continuity degrades to localStorage-only; WebView resets then produce the known 'it forgot me' symptom while server memory silently remains intact — the worst version of the felt/actual continuity split."* | HP `:100` | asserted (author-labelled part-[INFERRED]); **no device or build observation cited** |
| HP-73 | *"The **provider slot in root layout already exists**"* — offered as why mounting the presence layer is small and reversible. | HP `:156` | asserted, **no line anchor**; §A.4 `:32` states the root layout has *"no MAIA affordance"* |
| HP-75 | Sovereignty check per CLAUDE.md §6: *"agency ↑ (member summons, never summoned-at); pushes outward…; psychological centrality ↓ over time… No framework imposition."* | HP `:168` | asserted — **evaluates an architecture that does not exist**; evidence is design intention, not observation |
| HC-36 | Adoption *"measured across 1,413 `.tsx` files in `app/` + `components/`"*: `bg-field-core` **1** · `bg-field-depth` **1** · `data-domain` **3** · `sl-atmosphere` **3** · `bg-soullab-canvas` **0** · `maia-navy-*` **63**. | HC §0 L32–41 | read-from-code — **no reproducible command recorded** |
| HC-37 | *"These 13 doorways lead to **203 nested pages**"* (`/studio` 61 · `/labtools` 61 · `/maia` 57 · `/book-studio` 11 · `/astrology` 10 · `/wisdom-keepers` 3 · `/commons/circles` 3), *"with 15 nested layouts that re-change the shell."* | HC §1 L70–73 | read-from-code — no reproducible command recorded |
| HC-38 | *"**Holoflower components: 7 separate implementations**"* — `components/Holoflower.tsx`, `ui/Holoflower.tsx`, `oracle/holoflower{,-oracle,-simple}.tsx`, `oracle/HoloflowerSurvey.tsx`, `holoflower/MiniHoloflower.tsx`. | HC §1 Counts L81 | read-from-code |
| HC-39 | Per-room entry-file line counts: `/maia` 2118 · Living Field 97 · Journal 893 · Anchor 208 · Ideas 282 · Wisdom 484 · Pro Studio 339 (+ *"own 670-line nav"*) · Book Studio 162 · Circles 216 · Astrology 1800 · Lab Tools 269 · Community Library 1168 · Vision Studio 85. | HC §1 L56–68 | read-from-code |
| HC-40 | *"Journal's **12 pastel families**"* / Journal is *"**light** + 12 pastel accents"*, *"light canvas + 12 unrelated accent families."* | HC §1 row 3 L58; §3 L130; §7 L239, L245 | read-from-code — **route is middleware-gated: "Code-read only"** |
| HC-41 | *"The rail is shared by **4 rooms + 135 nested pages** — that is the leverage."* | HC §7 Stage B L219 | read-from-code |
| HC-42 | Live-walk observations (desktop 800×455, mobile 375×812, seeded `demo.practitioner`, `localhost:3000`): Anchor shows *"Body text 'Could not load.' with no recovery"*; Vision Studio's *"holoflower renders as a hard white PNG square"*; Astrology *"Marred by a `spice-orange` CTA off-palette and a visible seam"*; Ideas *"Contrast is too low to read comfortably"*; Community Library on mobile = *"**three brands in one 375px viewport.**"* | HC method note L7–9; §3 L120–130 | observed-in-running-system — **screenshots stated as "captured in session"; not attached to the doc** |
| HC-43 | `†` rooms (Journal, Lab Tools) are *"reachable only through a middleware/cookie gate; not walkable with localStorage identity alone, so its live state is code-read, not eye-read."* | HC §1 legend L51–52; §3 L130 | observed-in-running-system (failed walk) |
| HD-21 | Light-mode surfaces use *"`#f8f7f5` gradient; **26× `bg-white`**; `bg-stone-50/100`"*; Astrology uses *"**50× `bg-black`**"*. | HD §B rows 4–5 L48–50 | read-from-code — counts, **no command recorded** |
| HD-22 | Line-anchored return mechanisms: Journal `push('/maia')` **:664** · Anchor `router.back()` **:119** · Ideas ArrowLeft → `push('/maia')` **:122** · Wisdom `href="/maia"` **:227** · Lab Tools `push('/maia')` **:32**. | HD §A table L19–27 | read-from-code — **line numbers as of 2026-07-22 only** |
| **HC-44 / HD-23** | The rail is *"`fixed w-14`"* with *"**no responsive treatment / hiding**"*, *"permanently eating 56px of a 375px phone"*; HD adds *"is absent everywhere else. **Neither state is designed.**"* | HC §3 L134–136; HD §A note L36–38 | HC observed-in-running-system; HD read-from-code |
| HN-48 | *"**Lineage audited:** `clean-main-no-secrets` (the device's actual lineage). The working checkout `chore/e2e-layout-invariants` is **308 behind** with a different, uncommitted impl — **not** audited."* | HN 7–8 | asserted — **no command output or SHA cited** |
| HN-49 | *"That single gap — not any individual broken link — is why 'the House has no active connections' on device."* | HN 30–31 | asserted (causal diagnosis); the quoted symptom is unattributed and **no device observation is presented** |
| HN-50 | Note ¹ — *"**Return not individually verified in this pass.**"* `/maia/*` destinations are *"covered by the deployed House Presence doorway system; others need a per-page confirm (Phase 2 below)."* | HN 80–81 | **none — self-declared as unverified** |
| HN-51 | The absence of Now What? from the House is *"asserted in the House verification harness"* — a named enforcement mechanism **given no file path or test name**, and no statement of whether it passes. | HN 87–88 | asserted. The only navigation-enforcement mechanism named on trunk is `lib/navigation/__tests__/houseNavDrift.test.ts`, **which the audit never mentions** |
| HN-52 | Every destination page *exists* and every listed item is *wired* — the ✓ marks in the **Page** and **Wired** columns for all 17 rows. | HN 42–70 | read-from-code asserted per row; **no per-row anchor or file evidence shown** |
| PR801-11 | The audit was *"authored 2026-07-27 and **never committed** … lived only as an untracked file in one working tree."* | PR801 body §Why | **unverifiable from the record** — an untracked file leaves no trace; absence from trunk is consistent but not proof |
| PR801-12 | *"The body is committed **exactly as authored**."* | PR801 body §"What this is — and is not" | **unfalsifiable** — no pre-image exists to diff against, by the PR's own account |
| PR801-14 | Supersession is by *"`a787ec736` … **plus eight follow-ups**, all present on `clean-main-no-secrets` at `acb757f87`."* | PR801 body + supersession note | `a787ec736` verified to exist with that exact subject; **the eight follow-ups are never enumerated anywhere in the PR** |
| PR803-4 | *"git hooks — none run tests."* | PR803 body table row 3 | **not re-verified in the PR pass** |
| PR803-8 | Red/green evidence — 4-step local sequence: intact → 12/12 pass, exit 0; controlled mismatch (`living-field` `nativeReady: false → true`) → gate exits **1**; restored → 12/12 pass. | PR803 body §"Red / green evidence" | **local, unrecorded, self-reported.** No CI artifact, no log, no transcript. The PR's own rollup shows `house-nav-drift=SUCCESS` — **the green half only; no red control ran in CI** |
| PR804-5 | 418 static page routes · 494 total page files · 76 dynamic `[param]` routes excluded · 79 unmapped · accessMatrix rules parsed as `exact` 188 / `prefix` 61 / `regex` 3. | PR804 doc §Reconciliation + §Method | reproducible in principle via the committed script, **but not re-run; the script is not wired to any CI so no run artifact exists** |
| PR804-13 | Stated limit 1: *"**Static only.** No route here was graded at runtime… **Nothing in this document licenses the sentence 'N routes are exposed.'**"* The allowlist finding *"does not establish that a member can arrive there — **that requires a device walk**."* | PR804 doc L84–86, 220–222 | self-declared limit |
| PR804-14 | Stated limit 2: *"'Linked' is a lower bound… **Set B is a candidate set, not a finding.**"* A literal scan misses computed hrefs, template interpolation, redirect chains. | PR804 doc L223–225 | self-declared; the regex at script line 346 confirms the limitation is real |
| PR-X-5 | **All three PRs cite a same-day founder ruling** (#801: "Kelly ruling" 07-29; #803: an implied lane assignment; #804: "Assignment (Kelly, 2026-07-29)") and **none links, quotes, or names the artifact carrying it.** Each asserts its own boundary, so *"the record's authority rests entirely on uncited attribution. This is the same class of self-referential claim #803 was opened to repair."* | across all three PR bodies | none |

---

### B7 — Questions the record cannot answer · **21 rows** (21 source items)

| ID(s) | Question | Source anchor | Evidence type |
|---|---|---|---|
| HP-23 | *"Caveat under the non-inference principle: `detectIntent` reads `field.userInput + maiaResponse` — it pattern-matches member **speech** (acceptable: explicit statements) but including MAIA's own response text in the match corpus is **a mild inference channel worth a ruling**."* **No ruling is recorded.** | HP `:43` | read-from-code (mechanism); none (the ruling) |
| HP-60 | *"(Whether yesterday's thread **should** be visible by default is **a Kelly ruling** — continuity vs. fresh-morning threshold; both are implementable.)"* Restated as a gate: item 6 *"needs the continuity-vs-threshold ruling."* | HP `:123`, `:161` | none |
| HP-64 | The four mentor/review chats' **voice** needs a ruling: *"fold each into the one MAIA (same surface, room context supplied) or explicitly rename/reframe them as tools that do not wear MAIA's name. **Leaving four MAIAs standing is the one option the one-voice ruling forecloses. This is Kelly's call per surface, not this audit's.**"* | HP `:131`, `:162` | none |
| HP-76 | *"This document is the deliverable. Nothing has been implemented. **Awaiting Kelly's review** of: the current-state map (§A–B), the relationship breaks (§C), and the smallest coherent solution (§D, sequenced in §F)."* **The record contains no response.** | HP `:172-174` | none |
| HC-45 | *"The auth-posture divergence is the only genuinely structural item and **needs its own ruling**"* — signed out, `/maia/living-field` renders *"a black void with 'Sign in to enter your Living Field.' and no way home"*; `/labtools/*` bounces to a full sign-in page. **"Same product, two unrelated refusals."** | HC §2 L111–114; §7 L227–232 | observed-in-running-system; **no ruling recorded in either doc** |
| HC-46 | Whether to keep or revert the uncommitted `MaiaReturn` + 4 wirings — *"Revert or keep — **your call**."* | HC §8 L255–257 | none (open decision) |
| HD-24 | *"Anchor's light gradient **may be a deliberate contemplative choice — ask first**."* | HD §C R2 L76–77 | none (open question). **HC answers it by fiat** — assigns Anchor *"sanctuary alcove … radical minimalism"* and ranks it #2 "Furthest below the MAIA bar" for its "full white page" — **without recording that HD had asked** |
| HC-47 | How to introduce *"`app/maia/layout.tsx` **without double-railing `/maia`**"* — listed as a deeper refactor "needing sequencing," **with no resolution given**. HD-9 (R3) proposes the same layout with **no double-rail caveat**. | HC §7 L238 | none |
| HC-48 | How Studio's *"670-line parallel nav vs the rail"* resolves — the dual nav is recorded as a fact; its resolution is not. | HC §1 row 7 L62; §7 L239 | read-from-code (the fact only) |
| HC-49 | **Why the canon system is unadopted.** The record establishes it is *"an **unenforced** one"* and reframes remediation as *"an **adoption** project,"* but records **no enforcement mechanism, no owner, and no reason for non-adoption since 2026-04-10.** | HC §0 L43–45 | none |
| HD-25 | Whether HD's own **R1–R5 remain live** after HC's supersession claim — **HD records no awareness of HC, and HC records no disposition of R1–R5 by name.** | HD §C L66–82; HC header L5 | none |
| HN-53 | **Was any part of the 07-27 inventory observed on an actual device?** The doc reports native behaviour throughout but cites **no device walk, screenshot, or trace**. | HN, whole document (esp. 20–31) | none |
| HN-54 | **Who said *"the House has no active connections"*, and against which build?** The phrase is quoted as the presenting symptom but has **no attribution or date**. | HN 31 | none |
| HN-55 | **What authority does the 07-27 audit carry, given it was never committed?** PR #801: it *"lived only as an untracked file in one working tree — one `rm` from gone."* | PR #801 body §"Why" | observed-in-running-system (git) |
| HN-56 | **Which specific destinations were ruled bundle-in-app vs open-in-web?** The ruling is recorded **only inside code comments** in `houseDestinations.ts` (*"Policy (founder ruling 2026-07-27)"*) — **no ruling document exists in `docs/`.** | HN 118 (the open question); trunk `houseDestinations.ts:92` | read-from-code |
| HN-57 | **Was the Phase 2 return audit (HN-40) ever run, and with what result?** Neither the audit, the supersession note, nor PR #801 records an outcome. | HN 107–108 | none |
| HN-58 | Two destinations carry audience *"**all**"* (Astrology, Community Library) yet are 🌐 unreachable on native. **The record does not say whether any member ever reached them, or whether the audience marking was aspiration or live state.** | HN 57, 59 | none |
| PR801-13 | The supersession note is attributed to a *"(Kelly ruling)"* dated 2026-07-29. **No ruling artifact is cited, linked, or quoted.** | PR801 diff line 1 of the note | none in the PR |
| PR803-11 | Was branch protection enabled between #803's authoring (2026-07-29T03:25Z) and extraction, or was the 404 observation wrong when made? **Per §0 Correction 1 the answer is now known: the probe hit the wrong repository.** The residual question — whether protection existed at authoring time — remains unrecorded; no protection change log was consulted. | PR803 body vs live `gh api` | none |
| PR804-1 | *"**Assignment (Kelly, 2026-07-29):** extend the navigation-truthfulness discipline to the route surface the House does not model. Distinguish five states; do not collapse them."* **No ruling artifact cited, linked, or quoted** — the same attribution pattern as PR801-13. | `ROUTE_SURFACE_AUDIT_2026-07-29.md` L10–12 | none |
| PR804-4 | **Where does "intentionally withheld" live?** `houseDestinations.ts` has a `hidden` reachability outcome (`return d.nativeReady ? 'native' : 'hidden'`), which is arguably the withheld state — but **inside** the House, i.e. outside this audit's declared scope. | trunk `classifyReachability`; PR804 script header | inferential, **not stated in either PR** |

---

## C. Standing rulings that bind the House

**62 rulings (`SR-1 … SR-62`), grouped by binding force.** Grouping is by the *status the record
itself assigns*, not by importance. **RV** = the extract flagged RE-VERIFICATION NEEDED
(37 of 62; four flagged **HIGH**). *"A memory file records what was true when written."* Nothing in
this register was re-verified against production or canonical HEAD.

### C.1 — Ratified canon · 23

*In-tree canon files, ratified. These bind regardless of the House review's conclusions.*

| ID | Ruling (compressed) | Source | RV |
|---|---|---|---|
| SR-7 | *"**Authority may only move upward through authored experience. The system must never skip a layer or manufacture higher-order meaning.**"* · *"**The member may jump around. The system may not.**"* Layers: Encounter → Reflection → Recognition → Living Field → Developmental Ecology. | `CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md` L43–63 (ratified 07-01, amended 07-21) | No |
| SR-8 | The initiation boundary: *"**Recognition may arise from the member's request or present movement; it may never arise from system initiative alone.**"* Present movement *"does **not** include notifications, ambient cards, scheduled resurfacing, or claims that 'MAIA noticed' something while the member was absent."* Binding implication: wiring any dormant pattern-reflection or push capability *"requires a new constitutional reconciliation before implementation."* | same, L108–118 (founder ruling 07-21) | **Yes** — rests on a dated "ambient paths present: 0" count |
| SR-9 | *"**MAIA never moves a person through the flow. It protects the constitutional boundaries within which a person's own development may occur.**"* · *"MAIA never infers identity from transcripts, uploads, or conversations."* | same, L95–106 | No |
| SR-10 | The layer design test: *"**What layer does this belong to, and does its authority respect the upward-only direction?**"* A feature that *"collapses two layers into one, or lets the system assert meaning at a layer above what the member has authored, is violating the constitution."* | same, L122–138 | No |
| SR-11 | *"**Developmental Ecology describes a shared relational medium, not a unified operational center or substrate.**"* Binds any attempt to model House rooms, studios, or Co-Labs as a ladder or as one consolidated substrate. | same, L77–91 | No |
| SR-12 | **Invariant 1 — Authority Return.** *"MAIA must not be the final authority on a person's life direction."* Litmus: *"the center of knowing must feel closer to the user, not MAIA."* | `MAIA_SOVEREIGNTY_INVARIANTS.md` §1 | No |
| SR-13 | **Invariant 7 — Human World Priority.** *"Aliveness happens outside the system."* Binds any House design that makes dwell time, return frequency, or in-app residency a goal. | §7 | No |
| SR-14 | **Invariant 8 — Conductor Authority.** All relational tone/bonding-risk logic enforced at the Conductor. Downstream layers may not add warmth, certainty, or emotional amplification. | §8 | No |
| SR-15 | **Invariant 9 — Builder Constraint.** *"If a design change makes MAIA feel more alive but reduces user agency, the change must be rejected."* Binds presence, animation, ambience, arrival. | §9 | No |
| SR-16 | **Invariant 10 — Mission Check.** Every major feature must increase real-world action, human connection, self-trust, time lived away. | §10 | No |
| SR-17 | **Invariant 11 — Declared Significance.** *"Member-declared significance outranks system-inferred significance."* Protection boundaries are *"an eligibility gate, not a ranked candidate."* Prohibits *"promising recall before retrieval is proven."* | §11 | No |
| SR-18 | **Invariant 12 — Design Burden.** *"The system absorbs avoidable complexity before asking the human to absorb it"* — but *"burden is not authority."* | §12 | No |
| SR-19 | **Invariant 13 — Claim-Type Floor.** *"The governor on a symbolic statement is its **claim type**, not its tradition."* Any framework may be offered *only as a lens*; consequential prediction is a hard refusal. Binds the Changes room directly. | §13 | **Yes** — names the deployed `SYMBOLIC_LENS_BOUNDARY` wrapper |
| SR-20 | **Invariant 14 — Cultural Sovereignty.** *"Ask, don't assume. Preserve, don't translate. Stay teachable."* Binds room naming and domain-object naming. | §14 | No (invariant); application memory-only |
| SR-21 | **Invariant 15 — Authored Adaptation.** No runtime behavioural adaptation of interaction strategy. *"A learned per-member style profile… is a persistent inference about the member — i.e., memory — and inherits the full consent regime."* | §15 | No |
| SR-22 | **Invariant 16 — Recognition Integrity.** *"MAIA does not optimize for **felt recognition**."* Constraints: quiet states that stay quiet · no fabricated orientation signal · bounded retrieval · explicit keeping · resealability · evidence before pattern. Review test: *"does this preserve the member's ability to **not** be recognized?"* | §16 + `RECOGNITION_INTEGRITY.md` | No |
| SR-23 | **The Constitutional Sentence.** *"**MAIA may offer presence, but must always return power.**"* · *"**If the system becomes more alive than the user, the system is failing.**"* Binds everything. | §"The Constitutional Sentence" | No |
| SR-24 | **The Oath.** *"I do not seek attachment, loyalty, or **return**… When continuity breaks, I name the rupture before resuming."* House-bearing: constrains return-driving design and silent recovery from session/nav loss. | `MAIA_OATH.md` — *"the irreducible standard"* | No |
| SR-25 | **Canon v1.1 absolute prohibitions.** Never persuade · never optimize for engagement · never manufacture lack · never mythologize too early. The Quiet Test: *"If a feature increases clarity but also increases urgency or certainty — suspect."* | `MAIA_CANON_v1.1.md` §II, §V | No |
| SR-26 | **Epistemic separation (Session Room governance invariant).** All artifacts declare type: `source_record` · `human_reflection` · `ai_candidate` · `accepted_recognition` · `developmental_synthesis`. *"**AI interpretations must never overwrite source records.**"* | `SESSION_ROOM_LIVING_ENCOUNTER.md` L188–210 | **Yes** — cites four documents that do not exist (see C.7) |
| SR-27 | *"**The system must not interpret the user faster than it understands them.**"* Not style guidance — *"a canon-level constraint on any synthesis surface."* Binds the Changes room and any future Review surface. | `CHANGES_SECTION_EPISTEMIC_DISCIPLINE.md` | **Yes** — names `lib/ain/synthesis/dialectical.md`, unconfirmed |
| SR-28 | **ADR-010.** *"Every member always has a Personal Field. It is not optional, not upgradable away from."* Contribution Field is additive; `studio_type` configures, not constrains; *"the platform never asserts what kind of person a member is."* *"Vision Studio is constitutionally part of the Personal Portal."* | `docs/adr/010-…` (**Accepted**, 07-01) | **Yes** — cites two absent canon docs and ADR-005/006/007, **none of which exist** |
| SR-48 | Admissible vs inadmissible continuity language: *"You've returned to courage nine times"* ✅ · *"your relationship with boundaries has shifted"* ⛔ (system authoring Recognition). Canon-backed — the identical example pair appears in `THE_HOUSE.md` L50–51. | memory + `THE_HOUSE.md` | No |

### C.2 — Ratified as direction (`THE_HOUSE.md`, Vision-class under claim discipline) · 5

> ⚠️ **`docs/canon/THE_HOUSE.md` exists in no git ref** (§A). It is recorded as *"Ratified as
> direction by Kelly, 2026-07-28"* and is a **Vision** document under `MARKETING_CLAIM_DISCIPLINE.md`
> — not a Live claim.

| ID | Ruling | RV |
|---|---|---|
| SR-1 | *"The House is not organized around software features. It is organized around **enduring human questions**… There is no room called **AI**. No room called **I Ching**. No room called **Journal App**. Those are means. **The rooms are destinations.**"* Binds room naming and room admission: a mechanism may not become a room. | No |
| SR-2 | The four rooms and their questions: *"Journal — What happened? … Changes — What is changing? … Commitments — How will I respond? … Becoming — Who am I becoming?"* *"Today: Journal and Changes are live; **Commitments and Becoming do not exist**."* | **Yes** — **the canon room-set and the shipped registry are recorded as divergent.** Build 2508 ships *"MAIA · Living Field · Journal · Anchor · Ideas · Keeps · Changes · Studio · Astrology · Community Library · Wisdom, Decisions ABSENT"*, and the record states *"'Journal/Changes/Commitments/Becoming' was PROPOSAL vocabulary, not the registry."* |
| SR-4 | *"The member may move between rooms in any order, or stay in one for a year. **The House never moves them.**"* Binds sequencing, onboarding funnels, recommended-next-room logic. | No |
| SR-5 | **The three-question House test:** *"1. Which room does this belong to — and does it name a human question, or a mechanism? 2. Who authors the meaning here — the member, or the system? 3. Does this open a door, or describe what is behind it?"* Binds *"every future feature, route, permission, and surface."* | No |
| SR-6 | *"MAIA is the host. The host welcomes, remembers, asks, and opens doors. **The host does not author the meaning of another person's life.**"* | No |

### C.3 — Candidate / not ratified · 6

*Named in the record with candidate, proposed, or explicitly-not-ratified status. A House review
**may not treat these as binding**.*

| ID | Ruling | Recorded status | RV |
|---|---|---|---|
| SR-3 | *"**MAIA may open doors. It may not describe what is on the other side of one in the member's own life.**"* An offer *"may carry a count and a question. It may not carry a characterization."* | **Dual status.** `THE_HOUSE.md`: "ratified as direction 07-28." Memory: **CANDIDATE stage**, *"⚠️ **Reconcile step NOT done**, cite from THE_HOUSE, **do not insert into the Invariants doc**"* — to be reconciled *"as a corollary of Invariant 16… not a 17th invariant."* | **Yes** — two statuses on record. **A House review must not treat it as an Invariant.** |
| SR-29 | **ADR-013 — "ONE MAIA, many Field Configs."** *"MAIA is not forked per platform. There is no 'Larry's MAIA.'"* Binds any proposal to give the House, a studio, or a client platform its own MAIA. | *"Ratified direction"* in the team paper; *"Proposed, 2026-07-08"* in the census; memory index: "Inv 17 PROP." | **YES — HIGH.** ⛔ **The ADR-013 file does not exist** (§0 Correction 2). Real in the record, **unquotable at source.** |
| SR-36 | *"House→Studio feed must be an **authored doorway, NOT auto-sync** — same publication-boundary ruling as Vault→Library NO-sync."* | *"peaceful-morse assessment, **not yet ruled**"* | **Yes** — explicitly not ruled at guard level |
| SR-38 | **Authored Crossing.** *"Crossing important boundaries requires an authored act"* — House→Studio, Vault→Library, private reflection→published work, Candidate→Ratified. *"Doorway Principle = authority at entry… Authored Crossing = authority at transition… They complement rather than duplicate."* | **Direction / ruling-grade refinement, not ratified**; ⚠️ **name collision** with the Doorway Principle candidate | **Yes** |
| SR-44 | *"`authorship` = `member_authored` \| `member_adopted`, with **NO `system`/`maia` value**. **The schema itself refuses a MAIA-created commitment** — the authority boundary becomes a CHECK constraint instead of a code convention a refactor can drop."* | *"Docs are **PROPOSALS at Candidate stage, not canon**; merging records the proposal and ratifies nothing."* (PR #794) | **Yes** — PR #794 open |
| SR-55 | **#806 governance candidate:** *"a route may not be declared native-reachable unless the native bundle contains it."* True inside the House (#803), absent outside it — **35 routes**. *"Deliberately not folded into #803."* | Governance candidate, **not ratified** | **Yes** — the 35-route figure is static at `acb757f87`; *"a device walk is what would establish arrival."* |

### C.4 — Doctrine / method (recorded discipline, direction-grade) · 8

| ID | Ruling | Recorded status | RV |
|---|---|---|---|
| SR-35 | *"**House** = the place you return to every day — personal continuity layer, mobile-first… **Studio** = sustained creative production, desktop-first… **'The House feeds the Studio. The Studio doesn't have to be squeezed into the House.'**"* | Direction conversation, **explicitly NO BUILD AUTHORIZATION** | **Yes** — cites RC1's native allowlist as validation (a build-state claim) |
| SR-37 | *"**Every Review item must be traceable to explicit provenance.**"* Admissible: counts of member-authored objects · timestamp arithmetic · counts of returns · state of explicit objects. Inadmissible: anything that cannot name a provenance class. Test: *"if it can't name its provenance, it doesn't render."* Also: *"'A thread becoming a pattern' is system-inferred synthesis — crosses into FROZEN Patterns territory"*; *"Review must be mirror not to-do list; no badges/streaks/urgency."* | *"durable rulings-grade refinements (still direction, no build)"* | **Yes** |
| SR-45 | **§7.4a — architecture leads, packaging follows.** *"A native-build detail must not silently decide product ontology. Sheet = contextual House surface entered and left; route = substantial navigation/deep-link/independent history… **when an implementation constraint and a product judgment agree, state the product reason first — otherwise convenience quietly becomes the architecture.**"* Recorded packaging fact: `MOBILE_MAIA_KEEP=()` strips every `app/maia/*` sub-route, *"and Changes survives **because** it is a sheet."* | Founder correction 07-28 | **Yes** |
| SR-46 | *"**Build from lived evidence outward, not from conceptual completeness.**"* Empirical gate: *"Build gated on real member marks; **zero exist in production**, so a room built now renders empty."* | Kelly's architectural reason, 07-28 | **Yes** — "zero marks" is a dated production claim |
| SR-51 | *"**Intentional exposure is not a routing fact.**"* Existence ← `app/**/page.tsx`; navigability ← native bundle + runtime allowlist; **intentional exposure ← an authored artifact naming the route — nothing else.** Absent that → **NOT ADJUDICATED**. *"This keeps the matrix from becoming a recommendation engine."* | *"the audit's spine"* — method ruling, applied in PR #804 | No (method); **Yes** (the counts it produced) |
| SR-52 | *"⚠️ The planned deliverable — a prose reachability matrix — **would have duplicated a test-enforced model**, creating the exact second source of truth the contract exists to prevent."* · *"**A code comment can be the misleading navigation claim.**"* · *"**Do not 'fix' the `houseDestinations.ts` header comment by claiming the guard is merge-blocking.**"* | Session finding + Kelly's framing, 07-29 | **Yes** — names #801/#803/#804, all *"await Kelly"* |
| SR-61 | *"**Declaration is not liveness; built ≠ wired; wired ≠ surfacing; surfacing ≠ verified.**"* Binds every claim a House review makes about what exists. | Standing project discipline + `docs/canon/VERIFICATION_STATES.md` | No |
| SR-62 | **Claim discipline.** *"Live/Designed/Vision · Center of Gravity · Failure Test… We do not tell tomorrow's story as if it were today's."* House application: *"Live = Keep (#749), Changes/Decisions (ribbon+sheets), Journal (native-ready). Designed/partial = Ideas. Vision = Questions, Threads, People, Walks, Review. **Don't collapse.**"* | Canon (discipline); House application memory-recorded 07-27 | **Yes** — the 07-27 assignment **conflicts in part with the 07-28 build-2508 registry (SR-2)** |

### C.5 — Memory-only rulings · 16

*Recorded only in memory topic files or index hooks. Real rulings; no canon artifact. Six of the
underlying topic files (`SR-30 … SR-34`) **were not opened in the extraction pass** — those four
rulings are extracted from **index lines only**.*

| ID | Ruling | RV |
|---|---|---|
| SR-30 | *"Client platforms ≠ MAIA ontology — builds on AIN OS, **NEVER House destinations**."* | **Yes** — index hook only |
| SR-31 | *"House replaces feature rail — **RATIFIED**; verbs **REJECTED**; integration pass **HELD**."* Binds House labelling grammar: destinations are nouns/places, not verbs. | **Yes** |
| SR-32 | *"Arrival jewel is presence — **RATIFIED**; **never restore `onTapJewel` / 'Tap to speak'**; re-entry → #687."* Companion: *"Arrival re-entry ruling — RULED (c) member-invoked return; ⚠️ (c) minus affordance == (a)."* | **Yes** — names a code symbol and PR #687, neither confirmed |
| SR-33 | *"Presence & distance — **MAIA never leaves; member sets distance** (= PLACE property)."* | **Yes** — index hook only |
| SR-34 | *"Session Room & Studio — **Room = accompaniment, Studio = stewardship**."* | **Yes** — index hook only |
| SR-39 | **The split ruling.** *"**Changes** → PERSONAL MEMBER tool… ⚠️ Do not lock this to founder/steward. **Decisions** → PRACTITIONER tool (Studio Decision Council)."* | **YES — HIGH. ⚠️ PARTIALLY SUPERSEDED — see C.6.** |
| SR-40 | *"⭐ `isPractitioner` gate is **DELIBERATELY NARROWER** than #766's House / `MaiaLeftRail` gate of `isAdmin \|\| isPractitioner` — **do NOT normalize the two**."* · *"⚠️ `'founder'` audience = coarse flag… **NO distinct steward-role primitive exists**; widen the audience model if a real steward role lands, don't overload 'founder'."* | **Yes** |
| SR-41 | Five 07-28 rulings: *"(1) remove member Decisions doorway until `commitments.member` exists — ruled, **NOT yet executed**; (2) **Becoming RATIFIED as fourth room, concept only not build**; (3) door principle RATIFIED as direction — ⚠️ Reconcile step NOT done; (4) `studio_changes` sharing acceptable now, structural separation is **named debt**; (5) security findings (§2.7) must be resolved **before** any capability implementation — **an ordering gate, not a fix authorization**."* | **Yes** |
| SR-42 | *"**'Practice' REJECTED as the domain object** — prior Invariant-14 ruling preserved. Object is **Becoming Thread**… Optional **member-selected** subtype… **never required, never inferred, never used to classify the member.**"* Slug: `becoming.member`, never `practice.member`. | **Yes** — tables *"Reserved but NOT specified… zero columns defined"* |
| SR-43 | *"**RULED 2026-07-28 — ambient, not interrogative.** 'A library doesn't force you to read. A chapel doesn't force you to pray.' ⭐ General form: **room names may be aspirational; room prompts may not be.**"* Origin: *"'who am I becoming?' posed to someone in cancer treatment can demand that suffering produce growth."* | No (self-contained), though memory-only |
| SR-47 | *"⚠️ **Activation gate for the Becoming doorway must be member-act-based** (member explicitly created/populated a Thread), **never MAIA-inferred readiness.**"* Binds, by pattern, **any conditional doorway**. | **Yes** |
| SR-49 | **Founder ruling on native destination policy (07-27):** *"treat `MOBILE_MODE=1` as canonical; per-destination policy = **native-in-app** (Ideas/LivingField/Settings/Journal/Keeps/Anchor) · **existing-sheets** (Decisions/Changes) · **web-bridge** (Wisdom/Astrology/CommunityLibrary/Colab/Circles/VisionStudio) · **Studio → INTERIM `/press/manuscript`** (NOT `/studio` Pro Studio, **NOT final ratification**). Two PRs."* | **YES — HIGH.** The "Decisions/Changes existing-sheets" line is later superseded for Decisions by SR-41. |
| SR-50 | *"Member-facing → **never auto-merge**; **final acceptance = iPhone walk not CI**."* · *"⭐ **RC1 candidate — NOT any PR — is the unit of acceptance**: evidence attaches to the installed artifact."* | **Yes** — the RC-train state is dated and moves |
| SR-53 | *"⚠️⚠️ `clean-main-no-secrets` has **NO branch protection**… **No status check can be marked required.**"* Kelly's framing: *"Navigation drift is technically enforceable. Repository configuration has not yet been brought into alignment."* | ⛔ **FALSIFIED — §0 Correction 1.** Protection exists; `build` + `check-diagrams` **are** required; `enforce_admins: false`. Issue **#807** rests on this falsified premise. |
| SR-54 | **#805** — *"Two navigation policy systems — `houseDestinations.ts` vs `accessMatrix` — **no declared relationship.** Answer **which is authoritative** or **what are the distinct responsibilities** — **before expanding either**."* | **Yes** — issue #805 open; `config/accessMatrix.ts` is modified in the current working tree |
| SR-56 | *"⭐ **The strict-mode prerequisite is NOT met** — `ACCESS_CONTROL_MODE` stays `permissive`."* Parent: issue **#732**. *"Untouched: 2 (910 API routes), 3 (76 dynamic), 4 (runtime grading)."* | **Yes** — names an env-flag state |
| SR-57 | *"Every House entry uses `router.push`; House button lives **ONLY on `/maia`** (`MaiaShell` not a layout) → **no consistent return**."* | **YES — HIGH. ⚠️ SUPERSEDED — see C.6.** |

*(SR-30 … SR-34, SR-39 … SR-43, SR-47, SR-49, SR-50, SR-53, SR-54, SR-56, SR-57 = 16 entries;
SR-39 and SR-57 also appear in C.6.)*

### C.6 — Rulings recorded as SUPERSEDED

**SR-39 — the Changes/Decisions split ruling · PARTIALLY SUPERSEDED.**
The 07-27 ruling ("Changes = member, Decisions = practitioner") is overtaken by the **2026-07-28**
ruling *"remove member Decisions doorway until `commitments.member` exists."* Recorded consequences:
**PR #770 (the practitioner-gate approach) was CLOSED UNMERGED** because *"it implemented the
practitioner-gate approach that the 07-28 ruling supersedes"*; **PR #785 (Decisions out of the
member House) was MERGED 07-28 23:33Z**; build-2508 evidence records *"Decisions ABSENT"* from the
shipped House grammar. **"A House review must read SR-39 and SR-41 together; SR-39 alone is stale."**

**SR-57 — House button only on `/maia` · SUPERSEDED FINDING.**
`a787ec736` *"feat(house): navigation contract"* + 8 follow-ups introduced
`lib/navigation/houseDestinations.ts` and *"falsified 'MaiaHouseSheet uses uniform router.push with
no native awareness'."* **Still true per 07-29:** `MOBILE_MAIA_KEEP=()` — every `/maia/*` sub-route
is still stripped from the iOS bundle (PR 2, `nativeReady:false`). Recorded as **the case study**
in `feedback_audit_finding_verification_states` / `feedback_urgent_findings_verify_deployed_sha`:
an untracked audit whose headline was *"superseded, not merely stale."*

### C.7 — Citations to documents that DO NOT EXIST

Rulings on the record cite artifacts that are absent from this tree. **The rulings are real; their
sources are unquotable.** Named in full:

| Missing artifact | Cited by | Consequence recorded |
|---|---|---|
| **`docs/adr/013-context-assembly-ainos-maia-boundary.md`** (ADR-013) | `AIN_FOUR_LAYER_MODEL_TEAM_PAPER_2026-07-16.md` L122/L184 · `SPIRALOGIC_COMPANION.md` L53 · `DEVELOPMENTAL_ENVIRONMENT_SURFACES_v1.md` L9/L100 | **SR-29.** `DRIFT_AUDIT_PASS1_EVIDENCE_2026-07-21.md` L43 already recorded it as *"a dangling reference on this branch."* Any House review relying on ADR-013 must first resolve where the file lives. §0 Correction 2. |
| **`docs/canon/EPISTEMIC_JURISDICTION.md`** | `SESSION_ROOM_LIVING_ENCOUNTER.md` | SR-26 |
| **`docs/canon/LIVING_FIELDS.md`** | `SESSION_ROOM_LIVING_ENCOUNTER.md` · ADR-010 | SR-26, SR-28 |
| **`docs/canon/PREPARATION_IS_NOT_AUTHORIZATION.md`** | `SESSION_ROOM_LIVING_ENCOUNTER.md` · ADR-010 | SR-26, SR-28 |
| **`docs/canon/CONSTITUTIONAL_METHODOLOGY.md`** | `CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md` L149 | Extraction gap 2 |
| **ADR-005 / ADR-006 / ADR-007** | ADR-010 §Related · `SESSION_ROOM_LIVING_ENCOUNTER.md` | SR-26, SR-28. `docs/adr/` holds only 001, 004, 010, 012, README, template. |

*Also recorded:* `docs/adr/README.md` indexes **only ADR-001** — 004, 010 and 012 are unindexed.

### C.8 — Working agreement / project invariant (`CLAUDE.md` anchor) · 4

| ID | Ruling | RV |
|---|---|---|
| SR-50 | *(also listed C.5)* Member-facing PRs never auto-merged; **the iPhone walk is acceptance, not CI.** | **Yes** |
| SR-58 | **Sanctuary Mode — absolute boundary.** *"Nothing from a Sanctuary session can be saved, extracted, inferred, or converted into long-term memory, **under any circumstances, including by user request during the session**."* Default off. Binds any House room that counts, keeps, or reviews. | **Yes** — memory records *"⚠️ Sanctuary gate UI-only"*, an unopened gap |
| SR-59 | **Onboarding invariants.** Universal flow · single entry `/begin` · one-time · **"No shortcuts — each step must be completed in sequence."** | **Yes.** ⚠️ **Tension a reviewer must not silently resolve:** SR-4 says *"the House never moves the member"*; SR-59 mandates a sequenced onboarding **before** the House. |
| SR-60 | **The Sovereignty Invariant Check** — does this increase agency? push life outward? reduce psychological centrality? *"If the honest answer to any is no, the feature does not ship."* | No |

*Group counts: C.1 = 23 · C.2 = 5 · C.3 = 6 · C.4 = 8 · C.5 = 16 · C.8 = 4 (SR-50 cross-listed
from C.5, not double-counted). **Total 62.***

---

## D. Frozen / held — do not reopen

**28 items (`F-1 … F-28`).** *"A House review may **name** these; it may not reopen them without the
named lift-gate."* **This table is the fence for Pass 2.**

| # | What is frozen / held | Recorded status | Named lift-gate |
|---|---|---|---|
| F-1 | **Patterns** — system-inferred pattern naming (*"a thread becoming a pattern"*) | **FROZEN** | **None stated in the swept files.** Guard recorded as *"lawful form = name the count… member authors the meaning (mechanism not mythology)"* |
| F-2 | **Relational Doorways candidate** | **SEALED** — *"Cat 1, do-not-reopen"* | *"lift = episodic evidence **+ Kelly**"* |
| F-3 | **Living Studio (developmental OS)** | **Cat 1 — held direction** | none named |
| F-4 | **Coherence / Field wire-up** | **Under freeze** | `COHERENCE_FIELD_WIRE_UP_SPEC` §0.C — *"lift requires Kelly directive"* |
| F-5 | **Morphic / Somatic / Achievements services** | **Later + named gates** | the named per-service gates (consent+aggregation · explicit input source · reframe as practice) |
| F-6 | **Pattern Attunement** | Held — *"downstream of episodic + tact"* | episodic + tact |
| F-7 | **Cross-layer synthesis; any member-facing "field state" / "coherence" / "RFI" / "UFI" surface** | **Still held under freeze** | Kelly directive |
| F-8 | **Becoming room (build)** | **Concept RATIFIED, build DEFERRED** | Four observable conditions — **G1** Commitments live+exercised · **G2** members voluntarily linking · **G3** something to gather / episodic marks ≠ 0 · **G4** observed use revealed *"at least one materially important need… the design did not predict"* — **plus an explicit founder ruling.** *"**Evidence alone does not lift it.**"* |
| F-9 | **`member_becoming_threads` / `becoming_returns` / slug `becoming.member`** | **Reserved but NOT specified — zero columns defined** | Same as F-8; *"specifying schema now IS the speculative work the scope ruling forbids"* |
| F-10 | **Commitments implementation** | **BLOCKED** | Ordering gate: journal auth fix (**PR #793**) reviewed and merged first; §2.7 security findings resolved |
| F-11 | **Journey Point analysis** | **PARKED, Cat-1** | *"the gap isn't technical, it's **WHO MAY AUTHOR MEANING**"*; ⚠️ *"zero marks → renders EMPTY"* |
| F-12 | **House "integration pass"** | **HELD** (alongside *"House replaces feature rail — RATIFIED; verbs REJECTED"*) | none named |
| F-13 | **PR 2 — native House rooms** (Ideas / Living Field / Keeps / Anchor) | **HELD until PR1 accepted+merged**; modelled `nativeReady:false` | PR1 (#766) accepted + merged, **then** allowlist + keeplist + static-export safety + Back-to-MAIA affordance |
| F-14 | **`ACCESS_CONTROL_MODE` strict mode** | **Prerequisite NOT met**; stays `permissive` | Issue **#732** — complete access-surface adjudication (items 2/3/4 untouched) |
| F-15 | **Expanding `houseDestinations.ts` or `accessMatrix`** | Held pending declared relationship | Issue **#805** — answer *which is authoritative* **before expanding either** |
| F-16 | **Studio → `/press/manuscript` House destination** | **INTERIM, explicitly NOT final ratification** | a ratification decision on the Studio destination |
| F-17 | **Now What? publication** | Blocked | *"publication blocked till Tier 0 merged"*; *"RULED gate lands BEFORE #667"* |
| F-18 | **Preference/consent vocabulary consolidation** | ⏸️ **HELD pending consolidation** | *"no third spelling; pick one existing grammar"*; canonical vocab = `surface_preference` |
| F-19 | **The "door principle" reconcile step** | *"⚠️ **Reconcile step NOT done**"* | Reconcile per Cand→Reconcile→Ratify→Living; *"cite from THE_HOUSE, **do not insert into the Invariants doc**"* |
| F-20 | **Authored Crossing → ratified name** | Direction only; ⚠️ **name collision** with the Doorway Principle candidate | *"likely wants its own name when/if it goes to the governance lifecycle"* |
| F-21 | **Structural separation of `studio_changes`** | **Named debt** | *"due before any third surface reads the table"* |
| F-22 | **Decisions-tightening to practitioner-only** | **CONDITIONAL fix HELD** | *"pending device evidence: if walk confirms… **No source change before evidence**"* (largely mooted by the 07-28 removal ruling, SR-41) |
| F-23 | **DDL exclusivity** — whether the Domain Definition Layer is the *only* lawful adaptation point | **Open constitutional question, not yet ratified** | *"held open for deliberate adoption rather than asserted here"* (Invariant 15) |
| F-24 | **Dormant ambient-capable systems** — `PatternReflectionService`, unwired web-push | Dormant; **may not be wired to surface recognition outside a member-occasioned encounter** | *"requires a **new constitutional reconciliation** before implementation"* |
| F-25 | **Creator-world primitives** | **HELD, Cat-1** | *"after founder + walker walks"* |
| F-26 | **Texting as relationship** (mobile direction) | **Cat 1 HELD** | none named |
| F-27 | **Mobile device verification infra** | **HELD** | *"gate = device + server-evidence + commit"* |
| F-28 | **"Sacred play vs gamification" — FieldStateIndicator ruling** | Ruling **pending**; *"Soulful Play — HELD"* | founder ruling |

> **Six of the 28 have no named lift-gate** (F-1, F-3, F-12, F-26, and — for practical purposes —
> F-7 and F-4, whose gate is "a Kelly directive" with no stated condition). Recorded, not resolved.

---

## E. Vocabulary register

Per charter §5 — *"Concepts are **not** silently unified across products."* Five terms carry
incompatible senses across the record. **No resolution is proposed here; each is recorded as found.**

### E.1 — INCONSISTENT

#### `studio` — three senses, plus an interim destination that is none of them cleanly

| Sense | Source | Definition as written |
|---|---|---|
| (a) The House/Studio production layer | `project_house_studio_continuity_boundary.md` (Kelly, 07-27) | *"Studio = sustained creative production, desktop-first: books, developmental editing, manuscript structure, publishing, long-form research, synthesis."* |
| (b) `studio_type`-configured Co-Labs, i.e. Contribution Field | ADR-010 | *"Vision Studio is constitutionally part of the Personal Portal… Professional Studios may surface and reference Vision Studio, but they do not own or redefine it."* |
| (c) Practitioner Studio / Studio Decision Council | `/api/studio/*`, `studio_changes`, SR-39 | *"Decisions → PRACTITIONER tool (Studio Decision Council)… Appears only for practitioners."* |
| (—) Room/Studio pairing | `project_session_studio.md` via index | *"Room = accompaniment, Studio = stewardship."* |

**Recorded observations, not resolutions:** the `studio_` database prefix spans (b) and (c). The
House destination labelled "Studio" currently points at **`/press/manuscript`**, an **INTERIM**
target (SR-49 / F-16) that is none of the three cleanly. HP-29 additionally records `/studio/maia`
as *"a **second copy** of the surface."*

#### `field` — five senses, unreconciled

| Sense | Source | Definition as written |
|---|---|---|
| (1) **Personal Field** — a member's whole personal layer | ADR-010 | *"Every member always has a Personal Field. It is not optional, not upgradable away from, and not replaced by any professional or contributory identity."* |
| (2) **Contribution Field** — a Co-Lab configuration | ADR-010 | *"Contribution Field is additive."* Naming note: *"the word **field** also aligns with the platform's broader constitutional language (Living Fields, Field Intelligence, field state)."* |
| (3) **Living Field** — a constitutional authority layer | `CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md` L72 | *"the current best member-authored expression of accumulated recognitions. Never a profile, never an AI portrait, always revisable."* |
| (4) **Field Config** — per-context MAIA assembly | ADR-013 (**file absent**, §C.7) | *"one MAIA, many field configs"* |
| (5) **"field state"** — the FIS primitive | `CLAUDE.md`, `FIS_FIELD_STATE_PRIMITIVE.md` | **FROZEN** (F-7): no member-facing "field state" / "coherence" / "RFI" / "UFI" surface |

**Recorded:** *"The record nowhere reconciles these five."* Additionally, **"Living Field" is
simultaneously a canon authority layer (3) and a shipped House destination** in build 2508 —
`/maia/living-field`, listed in HN-16 and in PR804's Set A.
A sixth adjacent usage appears in HC/HD: *"four-layer field hierarchy (void → **field** → surface →
signal)"* — a visual-design layer, not a developmental one.

#### `doorway` / `door` — three senses, plus an explicitly flagged name collision

| Sense | Source | Definition as written |
|---|---|---|
| (a) **door as an offer MAIA extends** | `THE_HOUSE.md` L45 (SR-3) | *"**MAIA may open doors. It may not describe what is on the other side of one in the member's own life.**"* |
| (b) **Doorway Principle — authority at entry** | Kelly, verbatim (SR-38) | *"the person declares where they are; the environment responds; it governs orientation."* |
| (c) **doorway as boundary-crossing affordance between domains** | SR-36, SR-38 | *"House→Studio feed must be an **authored doorway**, NOT auto-sync."* Renamed **Authored Crossing** *"precisely to stop the collision."* |
| (—) sealed usage | `CLAUDE.md`, Relational Doorways (F-2) | *"AIN does not preserve the field; it keeps the doorways."* |

**⚠️ The record explicitly flags this as a name collision to resolve at ratification time (F-20).**
Two further live usages: `intentRouter`'s **doorway actions** (HP-21 — UI navigation suggestions,
suppressed on orientation asks by HP-22), and the **House Presence doorway system** (HN-38 — a
return mechanism). Neither is reconciled with (a)–(c).

#### `thread` — three senses, plus a room name

| Sense | Source | Definition as written |
|---|---|---|
| (a) **Becoming Thread** — the member-named domain object | SR-42; `member_becoming_threads` | *"Object is **Becoming Thread**… Member-facing wording: 'Name a thread' / 'Something you are tending.'"* **Reserved but unspecified — zero columns defined (F-9).** |
| (b) a loose conversational / journal grouping | `project_house_studio_continuity_boundary.md` | *"one journal thread becoming a pattern"* — **flagged in the same file** as crossing into FROZEN Patterns territory (F-1) |
| (c) an existing DB column | same | *"`member_memory_atoms.thread_ids` already exists"* |
| (—) **"Threads"** as a room name | 07-27 claim-discipline list (SR-62) | listed as **Vision** status |

**Recorded:** *"The record does not reconcile these."* A fifth adjacent usage: HP-51 speaks of *"the
member's **thread identity** (sessionId + continuity policy)"* — the transcript thread, which
HP-6/HP-43 record as rotating daily.

#### `room` — canon and the shipped registry have diverged

| Sense | Source | Definition as written |
|---|---|---|
| Canon | `THE_HOUSE.md` L8–11 (SR-1) | Rooms are named for *"enduring human questions"*; *"there is no room called **AI**… Those are means. **The rooms are destinations.**"* Four rooms: **Journal · Changes · Commitments · Becoming** — *"Commitments and Becoming do not exist"* |
| Copy constraint | SR-43 | *"**room names may be aspirational; room prompts may not be.**"* |
| Shipped registry (build 2508) | `project_mobile_native_index.md` | *"MAIA · Living Field · Journal · Anchor · Ideas · Keeps · Changes · Studio · Astrology · Community Library · Wisdom, **Decisions ABSENT**"* — and explicitly: *"'Journal/Changes/Commitments/Becoming' was **PROPOSAL vocabulary, not the registry**."* |
| Audit usage | HP §B, HC §1 | 13 "rooms" / "destinations" enumerated from `lib/navigation/maiaNav.ts` — a third, different set |

**⚠️ Recorded verbatim: *"'Room' in canon ≠ 'destination' in the code registry."*** Three
non-identical room sets are in simultaneous use (4 canon · 11 shipped · 13 audited), and the House
renderer's own grammar is a two-group split — **Worlds** and **Rooms** (HN-37) — in which "Rooms"
names only one group.

### E.2 — CONSISTENT

| Term | Senses on record | Status |
|---|---|---|
| **House** | *"A home for a life, not an application."* · *"the place you return to every day — personal continuity layer, mobile-first."* · *"House replaces feature rail — RATIFIED; verbs REJECTED."* | **Consistent.** All three agree: the House is a place of return, not a feature surface. |
| **place** | *"House = **the place** you return to every day."* · *"member sets distance (= PLACE property)."* · *"places not features."* | **Consistent.** "Place" is the ontological category the House and its rooms belong to, opposed to "feature." |
| **route** | Existence ← `app/**/page.tsx`; navigability ← native bundle + runtime allowlist; intentional exposure ← *"an authored artifact naming the route — nothing else."* · *"route = substantial navigation/deep-link/independent history."* | **Consistent, and unusually precise** — the record deliberately separates existence, navigability, and intentional exposure as three orthogonal properties, and refuses to infer the third from the first two (SR-51). |
| **surface / sheet** (§7.4a) | *"Sheet = contextual House surface entered and left; route = substantial navigation/deep-link/independent history."* Generic: *"every future feature, route, permission, and **surface**."* | **Mostly consistent** — "surface" is the generic term for any member-visible thing, with **sheet** and **route** as its two House implementations. **One noted exception:** Invariant 16 and the initiation boundary use *to surface* as a **verb** (to bring prior material into view), not as a place. |

### E.3 — Contaminated / narrowed terms recorded in the register

- **`practice`** — *"already spent four ways (`practice_sessions`, `practice_worlds`,
  `practice_fields`, `/api/practice/growth`)"* and **rejected** as the Becoming domain object
  (SR-42). *"Reviewers should treat 'practice' as a contaminated term."*
- **`founder` (audience value)** — *"coarse flag; `isAdmin||isPractitioner` is the CURRENT
  APPROXIMATION of practitioner/steward — **NO distinct steward-role primitive exists**"* (SR-40).
- **`authored_by`** — *"already mean[s] two incompatible things in-repo (TEXT role string in
  `personal_living_fields` vs `members` FK in `encounters`/`recognitions`)"* — which is why
  `authorship` was named distinctly (SR-44).

---

## F. Open PRs as pending evidence

**Per founder ruling R-C2, these are NOT ruled here.** *"Ruling them ahead of the review would make
architectural decisions before the review has assembled the full record."* They surface as
unresolved questions in the final founder ruling queue.

### F.0 — Shared mechanical state

| | **#801** | **#803** | **#804** |
|---|---|---|---|
| Title | preserve the 2026-07-27 navigation audit with a supersession note | make the navigation drift guard actually enforce | route surface audit outside the House — five-state classification |
| State | OPEN, not draft | OPEN, not draft | OPEN, not draft |
| Head | `chore/preserve-house-nav-audit` @ `355777ceb` | `fix/house-nav-drift-enforcing` @ `22c1d5a32` | `chore/route-surface-audit` @ `3e45af0ef` |
| Position | **29 behind · 1 ahead** | **29 behind · 1 ahead** | **29 behind · 1 ahead** |
| mergeable | UNKNOWN | UNKNOWN | UNKNOWN |
| Reviews / comments | **0 / 0** | **0 / 0** | **0 / 0** |
| Checks | 4/4 ✅ | 5/5 ✅ (incl. `house-nav-drift`) | 4/4 ✅ |
| Self-classification | Class C (docs only) | **Class B (structural risk — CI/routing enforcement)** | Class C (docs + read-only enumerator) |

*"No reviewer has looked at any of them; the entire record for all three is the PR body plus the
diff."* Base for all three: `clean-main-no-secrets`. Trunk at PR-extraction time: `5e1c76092`; the
tree the PRs name as canonical is `acb757f87` — **an ancestor of trunk, but trunk has advanced past it.**

### F.1 — #801 · preserve the 07-27 navigation audit

**Stated intent.** The audit *"was authored 2026-07-27 and never committed — untracked in one working
tree, 'one `rm` from gone,' and the only record of the pre-contract House inventory. Same exposure
class as the capability-access ledger (#798)."*

**What the diff does.** One file, `+151 / −0`: a ~30-line supersession blockquote (dated 2026-07-29,
attributed to a Kelly ruling) prepended to the verbatim 07-27 audit body. **Runtime behavior: none.
Tests: none. Guards: none.**

**Unresolved questions the PR itself raises:**
- **Which eight follow-up commits constitute the supersession** — never enumerated (PR801-14, §B6).
- Whether the audit's 5-step plan is **preserved-but-dead or a live backlog** — *"the PR asserts the
  former without saying where the live version lives"* (PR801-7 vs PR801-8).
- **Whether Decisions ever got a registry ruling**, given `changes` landed and `decisions` did not
  (PR801-9, §B4; PR-X-4/HN-45, §B5-15).
- The supersession note is attributed to *"(Kelly ruling)"* with **no artifact cited** (PR801-13, §B7).
- The **Journal route correction** (`/labtools/journal` → `/journal`, *"founder-gated + stripped"*)
  *"appears nowhere in #801's supersession table"* (PR801-6, now §B5-19).

### F.2 — #803 · make the navigation drift guard actually enforce

**Stated intent.** `houseDestinations.ts` claims in its own header to hold *"test-enforced AGREEMENT
against the existing runtime allowlist and Capacitor build config."* The guard exists and is
well-written, but **nothing ever failed on it** — *"a claim the code made about itself that was not
true — the same class of misleading navigation claim this lane exists to repair, one level up."*

**What the diff does.** New `.github/workflows/house-nav-drift.yml` (+58, `on: pull_request` with no
base filter, run step with **no `|| echo`**) · a blocking step inserted into `mobile-deploy.yml`
(+6) · a 9-line header comment in `houseDestinations.ts` · `package.json` gains
`check:house-nav-drift` and `preflight` calls it. **Product runtime behavior: none. No test files
added or changed** — the existing `houseNavDrift.test.ts` is merely *invoked*.

**Unresolved questions:**
- ⛔ **The PR's stated precondition is FALSIFIED** (§0 Correction 1). *"`clean-main-no-secrets` has
  no branch protection (`gh api …/protection` → 404)"* is a wrong-repo 404. Protection exists;
  `build` and `check-diagrams` **are** required; `enforce_admins: false`. **This sentence is baked
  into shipped source** at `lib/navigation/houseDestinations.ts` +96..+97, not only the PR body, and
  it propagated to memory and to **issue #807** (PR803-10, §B6).
- **Who adds `house-nav-drift` to the required contexts** — named as out-of-scope and **assigned to
  nobody** (PR803-12, §B4).
- **Whether the mobile-deploy blocking step can ever run**, given its unchanged `branches: [main]`
  trigger — the never-fires condition the PR itself identifies as defect #2. *"The PR does not
  address this"* (PR803-13, §B1).
- **Red/green evidence is local, unrecorded, self-reported.** The PR's own rollup shows
  `house-nav-drift=SUCCESS` — the green half only; **no red control ran in CI** (PR803-8, §B6).
- Whether the same "claim-in-header-not-enforced" class exists elsewhere — the PR calls it *"the
  same class… one level up"* but scopes itself to *"this invariant only."*

### F.3 — #804 · route surface audit outside the House

**Stated intent.** *"`houseDestinations.ts` models 15 destinations rigorously; this audits the 418
static page routes it does not cover."* Explicitly labelled *"Evidence artifact. No ruling made.
Nothing here authorizes a code change."*

**What the diff does.** New doc (`+237`) and a new **read-only** node ESM enumerator (`+153`) that
walks `app/**/page.tsx`, parses `accessMatrix.ts`, `capacitor-patch-routes.sh` and
`mobileAllowlist.ts`, regex-scans for link literals, classifies, and prints to stdout. **No writes,
no imports of app code, and not wired into any npm script, workflow, or hook.**

**Unresolved questions:**
- ⚠️ **"Five-state classification" names a state the artifact neither computes nor lists.** The
  document defines **three dimensions**; the classifier emits **four** exposure values;
  **`intentionally withheld` has no computation and no list at all** (PR804-3, §B5-18). Where it
  lives is itself unanswered (PR804-4, §B7).
- **Two governance systems over one surface** — five House destinations governed by
  `houseDestinations.ts` and by **no accessMatrix rule**. *"Whether that is a gap or a deliberate
  division of labour is **a founder question**"* (PR804-10, §B4). Also **open issue #805** (SR-54)
  and held under **F-15**.
- Are `/privacy` and `/terms` intentionally public? *"The record is silent"*; adjudicating *"is a
  five-second founder act."*
- What to do with the 46-route candidate set once runtime grading exists (PR804-13/14, §B6).
- **The 910 API routes** — *"a separate and larger sweep, still not run"* (PR804-15, §B4).
- Whether the 33 linked-but-ungoverned routes need access rules at all, given limit 4 (PR804-16).

### F.4 — Dependencies between them

**`PR-X-1` — no file overlap.** *"The three PRs touch **disjoint file sets**… No merge conflict
between them on content. All three branch from the same region and are 29 behind trunk, so **each
carries the same rebase exposure independently.**"*

**`PR-X-2` — #804 presupposes #803's subject matter, not its code.** #804's central finding
(35 allowlisted-but-unbundled routes) is *framed* by the drift guard's coverage boundary. *"That
framing holds whether or not #803 merges, because #803 changes only **where the guard runs**, not
**what it covers**. **However:** if #803 does not land, #804's premise sentence ('Its drift guard
covers the 15 House destinations') is describing a guard that runs nowhere — the exact defect #803
exists to fix. The two PRs are logically coupled through the word 'covers' while being technically
independent."*

**`PR-X-5` — one shared authority gap** (§B6). All three cite a same-day founder ruling and **none
links, quotes, or names the artifact carrying it.** *"The record's authority rests entirely on
uncited attribution. This is the same class of self-referential claim #803 was opened to repair."*

**#801 is load-bearing for this Standing Record itself** — it is the only preservation of one of the
four source audits (§A).

### F.5 — Inconsistency between the PRs, recorded not resolved

**`PR804-18` vs `PR803`.** #803 wires its check into **preflight + CI**; #804 commits an auditor
**wired nowhere** — *"reproducibility requires knowing to invoke `node scripts/audit/route-surface-audit.mjs <ROOT>` by hand."*
*"The two PRs treat tooling durability inconsistently."*

---

## G. Counts

### G.1 — Source items as the extracts categorized them

| Category | HP (07-17) | HC/HD (07-22) | HN (07-27) | PRs (07-29) | **Total** |
|---|---|---|---|---|---|
| B1 Ruled and still active | 6 | 9 | 9 | 15 | **39** |
| B2 Ruled but superseded | 1 | 3 | 23 | 4 | **31** |
| B3 Implemented but never ruled | 35 | 4 | 6 | 5 | **50** |
| B4 Proposed and still open | 21 | 20 | 3 | 7 | **51** |
| B5 Contradictory accounts | 2 | 9 | 6 | 4 | **21** |
| B6 Unverified claims | 7 | 11 | 5 | 9 | **32** |
| B7 Questions the record cannot answer | 4 | 7 | 6 | 4 | **21** |
| **Categorized total** | **76** | **63** | **58** | **48** | **245** |
| Mechanical / cross-PR, not ledgered (→ §F) | — | — | — | 2 | **2** |
| **Source items total** | **76** | **63** | **58** | **50** | **247** |

*HC/HD: 63 entries across 74 IDs (`HC-1…HC-49` + `HD-1…HD-25`); 11 entries are joint.*

### G.2 — Merged rows in this Standing Record

| Category | Items after moves | **Merged rows** |
|---|---|---|
| B1 Ruled and still active | 37 | **27** |
| B2 Ruled but superseded | 31 | **14** |
| B3 Implemented but never ruled | 45 | **41** |
| — B3a **CONSEQUENTIAL** | — | **34** |
| — B3b ORDINARY | — | **7** |
| B4 Proposed and still open | 51 | **46** |
| B5 Contradictory accounts | 27 | **20** |
| B6 Unverified claims | 33 | **33** |
| B7 Questions the record cannot answer | 21 | **21** |
| **TOTAL** | **245** | **202** |

**Reconciliation.** 245 categorized source items − 43 absorbed by merging = **202 rows**.
Category totals differ between G.1 and G.2 by **seven items relocated** during the merge, each
recorded in place: `HC-7/HD-3` (B1→B3a) · `HN-3` (B1→B5) · `HP-31`, `PR801-6`, `HP-2`, `HP-14`,
`HP-38`, `HN-38` (B3→B5) · `PR803-10` (B5→B6).

### G.3 — Rulings and freezes

| Register | Count |
|---|---|
| Standing rulings `SR-1 … SR-62` | **62** |
| — Ratified canon (C.1) | 23 |
| — Ratified as direction, `THE_HOUSE.md` Vision-class (C.2) | 5 |
| — Candidate / not ratified (C.3) | 6 |
| — Doctrine / method (C.4) | 8 |
| — Memory-only (C.5) | 16 |
| — Working agreement / project invariant (C.8) | 4 |
| **RE-VERIFICATION NEEDED** | **37 of 62** (4 flagged HIGH: SR-29, SR-39, SR-49, SR-57) |
| Recorded as SUPERSEDED | 2 (SR-39 partially, SR-57) |
| ⛔ FALSIFIED by §0 corrections | 1 (SR-53) + `PR803-10` |
| Cited documents that do not exist | **8** (ADR-013 · ADR-005/006/007 · 4 canon files) |
| Frozen / held `F-1 … F-28` | **28** (6 with no named lift-gate) |

---

## H. Questions Pass 2 must answer that the record cannot

Distilled from **B7** and the contradictions in **B5**. These are the items where **more reading
produces nothing** — they can only be settled by looking at the running system. **They are the Pass 2
walk targets.** Per charter §7 Pass 3, each will receive exactly one verdict:
*Confirmed · Drifted · Revealed · Reopened.*

### H.1 — Nine contradictory surface accounts from the coherence audits (07-22)

**Two documents, same day, same 13 destinations, code-read vs live walk, nine disagreements.** Each
is a direct, cheap verification target — **one walk settles all nine.**

| # | Surface | Account A | Account B | Walk to perform |
|---|---|---|---|---|
| 1 | **Astrology field colour** (HC-28/HD-13) | HD: *"**Pure black** — 50× `bg-black`"*, incompatible palette | HC: *"navy + stars ✓… **Genuinely good** — closest room to its own brief already"* | Load `/astrology`. Read the computed canvas colour. Note HC's own internal tension (it lists `#000` "(Astrology/Wisdom)" in its darks count). |
| 2 | **Wisdom return control** (HC-27/HD-12) | HD: *"`href=\"/maia\"` :227 \| ✅"* | HC: *"`← Back` — says **Back**, not MAIA … **wrong label**"* | Load `/wisdom-keepers/wisdom`. Read the actual control's label *and* target. Both may be true — an `href` to `/maia` labelled "Back". |
| 3 | **`MaiaReturn` applied vs uncommitted** (HC-30/HD-15) | HD: *"**Applied now** (functional defects, not design opinions)"* | HC: *"**uncommitted on the working tree**… **Revert or keep — your call**"* | Determine whether `components/maia/MaiaReturn.tsx` and its four wirings exist **on trunk**, on a branch, or only in a working tree. This is a git question with a walkable consequence: do Living Field / Book Studio / Community Library / Vision Studio have a way home **for a real member**? |
| 4 | **Wisdom field colour** (HC-29/HD-14) | HD: *"**Light mode**"* (`#f8f7f5`, `bg-white`, `bg-stone-50/100`) | HC: *"`stone-950` + `black` + `white`"*, **Fragmented** | Same walk as #2. |
| 5 | **Vision Studio return** (HC-34/HD-19) | HD: *"tab bar → Living Field only \| ❌ dead end"* | HC: *"**none** → `MaiaReturn` added (uncommitted)"* | Load `/maia/vision-studio`. Is there a control? Where does it go? |
| 6 | **Community Library return** (HC-35/HD-20) | HD: *"**none** (only in-page 'Back to Library')"* | HC: *"**none** → `MaiaReturn` added (uncommitted)"*; on mobile the MAIA link is *"**clipped behind rail**"* | Load `/maia/community/library` at **375×812**. Verify the clipping claim. |
| 7 | **How many golds** (HC-31/HD-16) | HD: *"**Two golds**"* (three treatments enumerated) | HC: **four** values | Count them once, in the running app. |
| 8 | **How many darks / palette systems** (HC-32/HD-17) | HD: *"four incompatible systems"* over a five-row table; *"three darks"* then lists four | HC: **six** darks, **four** competing palette families | Same walk as #7. |
| 9 | **Which navy is "the navy"** (HC-33/HD-18) | HD: `#0B1A30`/`#071426` in use; canon `#0A1628` | HC: MAIA's field is `#1a1a2e` + plum bloom; canon `#0A1628`/`#060D18`. **`#0B1A30` absent from HC's list** | Read the actual canvas value on `/maia` and on the House sheet. |

### H.2 — Presence: does the House accompany a member, or not?

**`B5-20` — the sharpest unresolved account in the record.** HP (07-17): `MaiaPresenceProvider` has
**zero mount sites**; there is no global affordance. HN (07-27): a *"House Presence doorway system"*
is **deployed** and covers return for every `/maia/*` destination — **asserted with no anchor**, in
the same document that declares *"Return not individually verified in this pass"* (HN-50, HN-42).

**Walk:** open a `/maia/*` room as an authenticated member. Is there a way back to MAIA, and by what
control? Is it present in **loading, empty, error, and gated states** (HC-15)? Then repeat on device.

**Downstream questions this settles:** HP-2, HP-14, HP-37, HP-38, HP-41, HP-45, HN-38, HN-40,
HN-42, HN-50, HN-57 (*"was the Phase 2 return audit ever run?"*).

### H.3 — What and where is Journal?

**`B5-19`.** Three preserved accounts: a QuickJournal **sheet over `/maia`** (HP) · `/labtools/journal`,
**native-bundled, the reference implementation** (HN) · route **corrected to `/journal`** because
`/labtools/journal` was *"founder-gated + stripped"* (PR801-6, verified in tree). HC could not walk
`/labtools/journal` at all — *"middleware/cookie gate… code-read, not eye-read"* (HC-43).

**Walk:** as an authenticated member on web **and** on device, tap Journal in the House. Record where
it lands, whether it is a sheet or a route, and whether the member is refused.

### H.4 — The two divergent auth refusals

**`HC-45` — the only item the coherence audit calls *"genuinely structural"* and says *"needs its own
ruling."*** Signed out, `/maia/living-field` renders *"a black void with 'Sign in to enter your Living
Field.' and no way home"*; `/labtools/*` bounces to a full sign-in page. **"Same product, two
unrelated refusals."** Compounded by `HC-10`: `MaiaReturn` *"currently sits only in the authenticated
branch — so the gated state stays trapped even after the fix."*

**Walk:** sign out. Attempt both. Record what a refused member sees and whether they can get home.

### H.5 — Device reality: was any native claim ever observed?

**`HN-53` — *"Was any part of this inventory observed on an actual device? The doc cites no device
walk, screenshot, or trace."*** And `HN-54`: **who said *"the House has no active connections"*, and
against which build?** — *"the phrase is quoted as the presenting symptom but has no attribution or
date."*

Everything downstream is derived, not observed: `HN-12` (*"only 4 of 16 work"* — **A, derived**),
`HN-13`, `HN-49`, `HN-52` (all 17 rows' ✓ marks), `HN-46` (bridge vs withhold), `PR804-11` (35
allowlisted-but-unbundled routes — *"does not establish that a member can arrive there — **that
requires a device walk**"*), `PR804-13`.

**Walk:** open the House on the installed artifact. Tap every destination. Record what is **native**,
what is **bridged**, what is **withheld**, and what is a **dead button**. Standing discipline applies
(SR-50): *"final acceptance = iPhone walk not CI"*, and *"the RC candidate — not any PR — is the unit
of acceptance."* Also `HN-58`: two destinations marked audience **"all"** (Astrology, Community
Library) are 🌐 unreachable on native — *"the record does not say whether any member ever reached
them, or whether the audience marking was aspiration or live state."*

### H.6 — Four MAIAs: does a member meet more than one?

**`HP-46` / `HP-64`.** Four MAIA-branded conversational surfaces exist — `SessionReviewChat`,
`MentorChat`, `MentorPanel`, `NowWhatRoom` — *"and none of those MAIAs is the one who knows them."*
The audit says this *"directly contradicts the ratified **one-MAIA/one-voice ruling (Jeeves
ruling)**"* — **a ruling named with no file path anywhere in the record.**

**Walk:** enter Changes, Decisions, and Session Room as a member. Record the name each assistant
wears, whether it recalls the member, and whether there is a way back. Then locate the Jeeves ruling.

### H.7 — Continuity across a day boundary

**`HP-60`** — *"Whether yesterday's thread **should** be visible by default is **a Kelly ruling** —
continuity vs. fresh-morning threshold; both are implementable."* **No ruling recorded.** The claimed
consequence (`HP-43`: *"next-day return = **visually blank slate** despite full PG history… the
largest pure state break"*) rests on an **[INFERRED]** finding (`HP-9`) with **no observed next-day
session**.

**Walk:** return the next morning. Record what is on screen.

### H.8 — Adoption: why is the ratified design system unadopted?

**`HC-49`** — the record establishes the canon system is *"an **unenforced** one"* and reframes
remediation as *"an **adoption** project"* — but records **no enforcement mechanism, no owner, and no
reason for non-adoption since 2026-04-10**, when `components/core/` was built. Related unwalked
counts: `HC-36` (adoption metrics, no reproducible command), `HC-37`/`HC-41` (203 / 135 nested pages),
`HC-38` (7 holoflowers), `HC-42` (live-walk observations whose screenshots are *"not attached"*).

### H.9 — Questions Pass 2 cannot settle either (founder acts, recorded here for the queue)

These require a **decision**, not an observation. They are named so Pass 2 does not mistake them for
walk targets:

- `HP-64` — fold the four mentor/review surfaces into one MAIA, or rename them as tools?
  *"**This is Kelly's call per surface, not this audit's.**"*
- `HP-60` — continuity vs. fresh-morning threshold.
- `HP-23` — is including MAIA's own response text in `detectIntent`'s match corpus *"a mild inference
  channel worth a ruling"*?
- `HC-46` — keep or revert the uncommitted `MaiaReturn` work. *"Revert or keep — your call."*
- `HD-24` — is Anchor's light gradient *"a deliberate contemplative choice"*? **HD asks; HC answers
  by fiat without recording that the question was asked.**
- `HD-25` — do HD's R1–R5 remain live after HC's supersession claim? **HC never disposes of them by
  name.**
- `HC-47` — how to introduce `app/maia/layout.tsx` *"without double-railing `/maia`"*.
- `HC-48` — how Studio's *"670-line parallel nav vs the rail"* resolves.
- `HN-56` — which destinations were ruled bundle-in-app vs open-in-web? **The ruling exists only in a
  code comment; no ruling document exists in `docs/`.**
- `PR804-10` / `SR-54` / `#805` — `houseDestinations.ts` vs `accessMatrix`: *"which is authoritative,
  or what are the distinct responsibilities"* — **held (F-15) until answered.**
- `PR804-4` — where does *"intentionally withheld"* live?
- `PR801-13` · `PR804-1` · `PR-X-5` — three artifacts, three uncited founder rulings, one shared
  authority gap.
- `HP-76` — the 07-17 audit ends *"Awaiting Kelly's review."* **The record contains no response.**

### H.10 — Two structural facts Pass 2 inherits rather than investigates

1. **Four of the six inputs to this record are working-tree-only** (§A), including
   `docs/canon/THE_HOUSE.md`, the source of the House's own governing principles (`SR-1 … SR-6`).
   **PR #801 preserves exactly one of them.**
2. **The branch-protection premise is falsified** (§0 Correction 1) and is **baked into shipped
   source**, into memory, and into **issue #807**. Nothing in Pass 2 should be built on it.

---

*Pass 1 complete. This document contains no recommendations. Per charter §3, no Pass 2 walk may
begin until this Standing Record exists — it now does. Per §7, the walk reports only what is absent
from this record; anything already here is a Pass 3 verdict against an existing item, not a new
observation.*
