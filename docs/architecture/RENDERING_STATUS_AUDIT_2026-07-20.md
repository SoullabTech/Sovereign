# Rendering-Status Audit — Member-Facing Surfaces

**Date:** 2026-07-20
**Status:** INVENTORY. Findings only — no fixes, no build authorized by this document.
**Serves:** Candidate ruling sentence D2c (*"Rendering cannot change constitutional status"* — `LIVING_PROFILE_BRIEFING_FOR_KELLY_2026-07-20.md`), filed in `LIVING_PROFILE_RECONCILIATION_2026-07-20.md` §6 candidate 3 with the note that it "generalizes past this paper: dashboards, summaries, reports, any future memory surface." This audit is the archaeological survey that note deferred. The principle awaits Kelly's ratification; this document supplies the evidence base, not the ruling.
**Method:** Four parallel read-only surveys of this checkout (spiral-state surfacing · Soul Portrait + /journey · holoflower variants · dashboards/summaries/practitioner views) plus one targeted verification pass. File:line citations are as of this date.
**Headline sentence (candidate, filed for Kelly's read alongside D2c — not a ruling):** *The platform already behaves as though rendering can change constitutional status; the audit exists precisely because it cannot.*

---

## 0. Classification key

Every member-facing pane carries one true constitutional status:

- **member-authored** — the member wrote, marked, or confirmed it (provenance attaches to a member act).
- **symbolic-rendering** — deterministic computation from the chart/spine (spiralogicEngine, house math). Authored by no one; a registration, not a claim.
- **system-inferred** — LLM prose, derived state (`member_spiral_state`, pattern detections, coherence), or anything the system concluded about the person.
- **fabricated-rendering** *(status discovered by this audit, not in the reconciliation's vocabulary)* — hardcoded or simulated values presented as member-derived. Neither inferred nor symbolic; there is no data under the rendering at all. The candidate sentence covers it a fortiori: if beautiful rendering cannot upgrade inferred content, it certainly cannot upgrade invented content.

The audit question for each surface: does the UI disclose the true status, or does it render inferred (or fabricated) content in the same visual/textual register as member-authored or symbolic content?

---

## 1. Headline finding — the Bridge D line is already crossed

The reconciliation (§1 table, F4) recorded Bridge D as "**Not member-surfaced** (seeds conductor; one read-only API)" and flagged `/api/members/spiral-state` as "sitting exactly on this line." **That record is now inaccurate: the API has one live member-facing consumer, and it renders the full inferred state in fact register with zero disclosure.**

| # | Surface | Evidence | Rendered | True status | Disclosure |
|---|---|---|---|---|---|
| F-01 | `/worlds/journey` (Journey World) | `app/worlds/journey/page.tsx:71` → `components/consciousness/ContinuityView.tsx` (fetches `/api/members/spiral-state`, ~line 143) | Element badge + name (Fire/Water/…), "Phase {n}", "Motion: {ascending/tending/breakthrough}", "Relational phase: {Orientation/…/Seasonal Return}", "Autonomy streak: {n} sessions" | **system-inferred** (`member_spiral_state`, written by conversation-derived inference) | **NO.** Ambient copy is "This has been unfolding." / "Gathering your arc…" — presents inference as the member's position. |
| F-02 | Account Settings → "Continuity" tab | `components/account/AccountSettings.tsx:2845`, heading `Your Current Position` (~2843), same `ContinuityView` | Same badge/phase/motion/relational/autonomy render | **system-inferred** | **NO.** The heading "Your Current Position" asserts the inference as fact. No "MAIA sensed / inferred / based on your conversations" language anywhere in the component. |

Per F4's own statement of the boundary: any member-facing rendering of `member_spiral_state` converts it from legitimate unsurfaced continuity infrastructure into a **stored assertion** — which requires the consent architecture + an authorship label it does not have. Bridge D's constitutional standing ("the one legitimate stored system-inference *because it does not surface*") no longer describes the repo. **Erratum for the reconciliation paper:** §1 table row "Bridge D — Not member-surfaced" and F4's "should be flagged when the layer is designed" both understate the situation; the flag condition has already fired.

Confirmed clean on the same question: `MemberLiveContext` contents reach only prompt assembly (oracle + sovereign routes; responses expose only a `hasMemberLiveContext` boolean) — no page renders it. This confirms reconciliation §3b's "MAIA-facing half feeds MAIA only." Admin surfaces (`app/labtools/admin/command-center/*`, `app/admin/platform-overview`) read spiral state but are not member-facing.

---

## 2. Soul Portrait — system-inferred prose without authorship disclosure (C1 confirmed in code)

| # | Surface | Evidence | Rendered | True status | Disclosure |
|---|---|---|---|---|---|
| F-03 | Portrait pages `/soul-portrait/[slug]`, `/view/[slug]` | `components/soulPortrait/SoulPortraitRenderer.tsx:124-422` | All 9 sections (Opening Letter, Soul Signature, Elemental Architecture, Archetypal Profile, Seer/Prophet, Challenges, North Star, Developmental Stage, Reflection Questions) | **system-inferred** — entire body is LLM JSON | **NO.** The only framing is the "Before You Begin" ethical note ("Read this as a mirror held up by love…"). No "written by MAIA," "generated," or provider attribution. `generation_provider`/`model` are stored in the DB (`portraitStore.ts`) but never rendered. |
| F-04 | Elemental Architecture section specifically | `SoulPortraitRenderer.tsx:233-267`; generation `lib/soulPortrait/generator/generatePortrait.ts:190-227` and `assemble()` :66-72 | Per-element title/body claims | **system-inferred.** Verified: `generateSoulPortrait()` → `calculateBirthChart` → `chartSummaryText` → LLM (`forceClaude:true`) → `parseModelJson`. **No call to `spiralogicEngine` anywhere in `lib/soulPortrait/`.** Only the element `keyword` comes from a static catalog; titles/bodies are model output. Conformance finding **C1 confirmed from code**: elemental claims are LLM echoes until Journey Framework step 2 (spine wire) lands. | **NO** — rendered in the identical letter-prose register as every other section; a member cannot distinguish "echo of your chart" from "chart-derived." |
| F-05 | Practitioner preview `/soul-portrait/preview/[id]` | `app/soul-portrait/preview/[id]/page.tsx` | Same renderer + banner | draft of system-inferred content | **NO (LLM authorship).** Banner discloses draft status ("Private practitioner preview — draft, not published…") but not that the content is AI-authored. |
| F-06 | Studio list `/studio/soul-portraits` | `app/studio/soul-portraits/page.tsx` | Draft/Sent rows, "Regenerate" link | — | No authorship label ("Drafts stay private until you send them"). The "Regenerate" affordance implicitly signals generation to practitioners; nothing equivalent reaches members. |

---

## 3. /journey — three statuses in one typographic register, including a fabricated pane

| # | Surface | Evidence | Rendered | True status | Disclosure |
|---|---|---|---|---|---|
| F-07 | Sacred House Wheel / birth-pattern line | `app/journey/page.tsx:1063`; `spiralogicHouseMapping.getSpiralogicPlanetDescription` (:29) | Chart placements, house wheel | **symbolic-rendering** (deterministic) | N/A — correctly symbolic. Listed to show it shares one register with F-08/F-09. |
| F-08 | **Elemental Balance bars** | `page.tsx:1866` `<ElementalBalanceDisplay balance={elementalBalance}/>`; values hardcoded at :153 (`useState({fire:0.28…})`) and :501 (`setElementalBalance({fire:0.25…})`, `// TODO: Make this more sophisticated`) | Elemental balance bars presented as chart-derived | **fabricated-rendering** — hardcoded on both code paths; in-code comment at :1868 already concedes "the crown was fiction for every member" (dominance crown since hidden, bars still render) | **NO.** Bars appear in the same chart-derived register as the house wheel. |
| F-09 | Spiralogic Report | `page.tsx:1608-1670`; `SpiralogicEvolutionaryReport`; `/api/astrology/spiralogic-report` (stored in `member_astrology_reports`, upsert at route :128) | LLM elemental narrative prose | **system-inferred** | **PARTIAL.** Pre-generation empty state says "MAIA can generate a personalized elemental narrative…" with a "Generate My Spiralogic Report" button — honest at the moment of creation. But the report is stored and re-rendered on later visits **without** the generation framing; on re-show nothing at the report itself marks it as generated. |
| F-10 | Living Mythology block | `page.tsx:1431` | LLM prose with badge "Co-authored with MAIA • Approved" | system-inferred | **PARTIAL (good direction)** — names MAIA's authorship and a member approval act; closest thing to the required label found on this page. |

**Cross-cutting register finding (F-11):** on both /journey and the Portrait, symbolic output, LLM prose, and (on /journey) fabricated bars share identical serif/letter typography and card styling. **No visual or textual channel anywhere in the codebase distinguishes "your chart's registration" from "generated reflection."** The disclosure vocabulary required by reconciliation §4 constraint 2 does not yet exist as a UI primitive.

---

## 4. Holoflower variants — inheritance audit ("inherits, never launders")

| # | Component | Data feed | Where rendered | True status of what it carries | Disclosure |
|---|---|---|---|---|---|
| F-12 | `components/liquid/RhythmHoloflower.tsx` (wraps `SacredHoloflower`) | `coherenceLevel` computed from voice rhythm metrics (`lib/liquid/ConversationalRhythm`) | `components/OracleConversation.tsx:7468` — **ambient**, center of the member conversation surface | **system-inferred** (coherence light-field + motion). Note: `userCheckIns` is NOT passed at the live call site, so petals stay dark — the visible animation is entirely system-derived. | **NO.** |
| F-13 | `components/ui/AdvancedHoloflower.tsx` | `holoflowerStateMachine` auto-detects element/coherence/intensity/"breakthrough" from voice + transcript | `oracle/OracleConversationInterface.tsx:225,376`; `voice/MAIAVoiceInterface.tsx:164,182` — ambient | **system-inferred** | **NO** (debug overlay exists, off in production). |
| F-14 | `components/oracle/holoflower-simple.tsx` (`SimpleHoloflower`) | `elementalSignature` → computed `dominantElement` | `holoflower-oracle.tsx:129`, `interactive-holoflower.tsx:385` (hardcoded demo signature), `app/oracle/interactive/page.tsx` | **system-inferred** (demo paths partly fabricated) | **NO.** |
| F-15 | `components/maia/vision-studio/RoomHoloflower.tsx` | Static PNG mark (never redrawn — confirmed) + radial glow: `proposedElement` (system-inferred `cellCandidate.element`, opacity 0.25) vs `confirmedElements` (member-confirmed, 0.45) | `NowWhatRoom.tsx:1501`, `VisionStudioRoom.tsx:706` (data-driven); header/arrival instances are decorative (`proposedElement={null}`) | mixed: system-inferred **until member confirms** | **YES — the exemplar.** Proposal renders only as faint glow; explicit confirm gate "This feels like {X}. Does that feel true for you?" (`NowWhatRoom.tsx:1588`); full warmth only after confirmation. The one inferred-state variant whose rendering grammar itself encodes the authorship transition. |
| F-16 | `components/oracle/HoloflowerSurvey.tsx` → `userCheckIns` → `SacredHoloflower` petals | **member-authored** check-ins — the reconciliation's F5 "only live member-authored elemental input" | **Zero instantiations found.** The survey is unwired; no live call site passes real `userCheckIns` into `SacredHoloflower`. | member-authored (dormant) | **Structural finding:** the one path constraint 5 sanctions for ambient member state is the one path that is not wired. The mark's live ambient animation is fed exclusively by system-inferred signals (F-12/F-13). |

Confirmed purely decorative (non-findings): `ui/Holoflower.tsx`, root `Holoflower.tsx`, `MiniHoloflower.tsx`, all raw `<Image src="/holoflower*">` uses (landing, auth, onboarding, pitch), header/arrival `RoomHoloflower` instances, room PNG asset. Archived `_backend/temp-frontend-files/*Holoflower*` variants are not in live member routes.

---

## 5. Dashboards, chat surfaces, and other member-facing panes

| # | Surface | Evidence | Rendered | True status | Disclosure |
|---|---|---|---|---|---|
| F-17 | **WisdomJourneyDashboard** | `components/maya/WisdomJourneyDashboard.tsx`, mounted member-facing at `app/maia/page.tsx:1568` | Inferred journey `phase` (Seeker→Wisdom Keeper), "Your Emerging Patterns" (:188-222), wisdom moments, `readinessScore` | **system-inferred**; **mixed pane** — each moment card (:255-270) places member verbatim `snippet` beside inferred `elementalSignature`/`recognizedPattern` in one register | **NO.** Declarative "Your…" framing; in-code comment says the intent is "showing them what MAIA sees" — but the UI never says so. Mitigation: `loadWisdomJourney` currently returns mock zeros (:85-95), so the live render is empty today; the undisclosed path ships regardless. |
| F-18 | **PatternChips / PatternDrawer** in member chat | `components/memory/PatternChips.tsx`, `PatternDrawer.tsx`, rendered at `OracleConversation.tsx:8320-8329` | Pattern detections as chips beneath MAIA replies (e.g. "Spiritual Bypassing 3×") | **system-inferred**; sits in the chat register beside MAIA prose | **PARTIAL.** Inline chip carries no inferred marker; disclosure lives one interaction deep (hover title "Show why MAIA detected this pattern"; drawer shows evidence, % confidence, Confirm / Not me / Refine). The drawer is exemplary; the chip's resting state is not. |
| F-19 | **Now What? proposed threads** | `components/now-what/NowWhatRoom.tsx:1324-1422`; `ProposedThread.source:'system_inferred'` (:69) | LLM-proposed thread title + reflection | **system-inferred until kept/revised** (then member-authored) | **PARTIAL (good direction).** Headed "Threads MAIA heard returning" / "Themes that emerged"; authorship transition is the keep/revise/leave gesture. Proposed vs. kept threads are visually similar; the `reflection` line (:1391) renders plainly with no per-line marker. |
| F-20 | **/oracle/reflections** (saved divination readings) | `app/oracle/reflections/page.tsx`; `/api/divination/list` | I Ching / Tarot / Runes readings: `interpretation_text`, `guidance_text`, `wyrd_message` | **system-inferred** (LLM oracle prose) | **NO.** Presented as "Saved Readings" / "Interpretation" / "Guidance" / "Message from Wyrd" — no marker that the prose is machine-generated. Live, full CRUD. |
| F-21 | **/maia/field-dashboard** | `app/maia/field-dashboard/page.tsx` | Coherence metrics (0.805, 0.742) animated with `Math.sin`/`Math.cos`; code comment "Simulate real-time field data" | **fabricated-rendering** — zero real data source | **NO — actively mislabeled**: badge reads **"LIVE"**, "Panconscious Field Intelligence Monitor," "Real-time consciousness field dynamics." Orphan route (no inbound nav) but reachable by direct URL. Doubly out of bounds: any member-facing "field state / coherence" surface is frozen (Cat 5 hold), and this one fabricates the numbers it claims are live. |
| F-22 | Practitioner: SessionReviewChat | `components/studio/SessionReviewChat.tsx` (`/studio/review`) | LLM overview/SOAP/DAP/elemental map of a member session | system-inferred from member-derived transcript | **YES** (practitioner audience): framed "Review with MAIA," lens captions "how MAIA answers," sr-staged sampling banner disclosing segment coverage. |

---

## 6. Clean surfaces (the pattern that already exists in-house)

These demonstrate that the disclosure discipline is achievable and already practiced — the codebase contains both grammars side by side:

- **/maia/orientation** — renders only member-placed evidence; header: *"This is what the system sees — only what you've explicitly placed."* Verified: it does **not** render `last_session_summary` or any LLM prose. (Separately confirmed: `last_session_summary` — `lib/session-persistence.ts:438` — is write-only; zero read/render sites repo-wide.)
- **/maia/moments** — member-marked verbatim text only; explicit copy: "Nothing here is titled, sorted, or interpreted…"; component contract forbids patterns/themes.
- **Anchor history** (`app/maia/anchor/history/page.tsx`) — member-authored anchors + the standing-consent toggle; no inference rendered.
- **RoomTrustCopy** (`components/now-what/RoomTrustCopy.tsx`) — reusable Holds / Never holds / Who sees / Your control disclosure block; existing infrastructure a disclosure grammar could build on.
- **RoomHoloflower confirm gate** (F-15) — the rendering-grammar exemplar for inferred→confirmed transitions.
- **/maia/soul-mirror** — deterministic curated book passages via rule-based routing; no inference, no misleading authorship.
- **Stellium digests / SessionBriefingCard** (practitioner) — rule-based synthesis explicitly bounded to counts/statuses ("no AI dependency"); practitioner-entered clinical fields, honestly presented.

---

## 7. Summary counts and structural observations

**By severity:**
- **Undisclosed system-inferred rendered to members:** F-01/F-02 (spiral state — the crossed Bridge D line), F-03/F-04 (Portrait, all sections incl. C1 elemental echoes), F-12/F-13/F-14 (ambient holoflower inference), F-17 (WisdomJourneyDashboard, mock-fed today), F-20 (divination prose).
- **Fabricated content rendered as real:** F-08 (elemental balance bars), F-21 (field-dashboard "LIVE" — also violates the Cat 5 field-surface freeze).
- **Partial disclosure:** F-09 (report loses its generation framing once stored), F-10 (co-authored badge), F-18 (hover-deep chip disclosure), F-19 (gesture-encoded authorship transition).
- **Practitioner-facing with adequate disclosure:** F-05 (draft-but-not-AI banner — the one practitioner gap), F-22 (clean).

**Structural observations (findings, not recommendations):**
1. **The Bridge D boundary statement in the reconciliation is already false in the repo** (F-01/F-02). F4's "should be flagged when the layer is designed" fired before the layer was designed.
2. **No disclosure primitive exists.** Every clean surface hand-rolled its own honesty copy; every violating surface simply omitted it. The three-status vocabulary of §4 constraint 2 ("your chart's registration…" / "you wrote…" / system-held) has no shared UI expression.
3. **One register, three statuses.** /journey and the Portrait render symbolic, inferred, and (on /journey) fabricated content in one typographic voice — the exact laundering the candidate sentence names.
4. **The sanctioned path is the dormant one.** The only member-authored elemental input (HoloflowerSurvey → userCheckIns) has zero call sites, while the system-inferred feeds animate the mark ambiently on the highest-traffic surface (F-16 vs F-12/F-13).
5. **A fourth status exists in the wild.** Fabricated-rendering (F-08, F-21) was not anticipated by the reconciliation's vocabulary; the audit records it so the eventual ruling can name it rather than discover it later.

**What this audit does not do:** prescribe fixes, propose the disclosure primitive, rank remediation, or authorize any change to the surfaces above. It is the evidence base for D2c's ratification decision and for the reconciliation erratum (observation 1). Reopen triggers: Kelly's read, or any of the flagged surfaces changing before the ruling lands.

---

## 8. Production-liveness addendum (2026-07-20, same day — reachability-is-a-claim)

Sections 1–7 establish repo-state. This section verifies which headline findings are **deployed and reachable in production**, per the methodology principle that reachability is itself a claim requiring verification.

**Method:** production container on minisforum runs `GIT_COMMIT=f60733616` (created 2026-07-20T14:37Z) — the same commit this audit's checkout is based on, so repo-state ≈ deployed-state for the audited files. Route checks ran on minisforum via the local Caddy path (`curl --resolve soullab.life:443:127.0.0.1`), unauthenticated; the direct-from-LAN probe fails on hairpin NAT as expected and was not treated as evidence.

| Finding | Route | Prod status | Reachability |
|---|---|---|---|
| F-01 (spiral state) | `/worlds/journey` | **307 → `/signin?next=…&reason=no_session_cookie`** — deployed, served to authenticated members | **Navigable from the primary member surface**: `components/OracleConversation.tsx:4071` — the `enter_journey` action does `router.push('/worlds/journey')`. Not URL-only. |
| F-02 (spiral state) | Account Settings → Continuity | deployed (same build) | Real tab in the settings tab list: `AccountSettings.tsx:163` `{ id: 'continuity', label: 'Continuity', icon: Sparkles }`. |
| F-21 (fabricated "LIVE" dashboard) | `/maia/field-dashboard` | **307 → signin** — deployed; any authenticated member who knows the URL gets the page | **Not fully orphan after all**: no web nav link, but the route is listed in `lib/mobile/mobileAllowlist.ts` — deliberately included in the iOS/Capacitor route set at some point. Strengthens F-21. |
| F-20 (divination prose) | `/oracle/reflections` | **200** (page shell served publicly; member data behind auth) | Linked from `app/oracle/page.tsx`. |
| — (comparison, clean surface) | `/maia/moments` | 200 | As expected. |
| F-01 substrate | `/api/members/spiral-state` | **401 unauthenticated** — endpoint live, auth enforced | Serves ContinuityView when authenticated. |

**Stage-language discipline:** this addendum upgrades the headline findings from *wired-in-repo* to *deployed-and-reachable in production*. Whether members **actually visit** these surfaces (traffic) remains unmeasured — deployed ≠ used, and this addendum does not claim usage. The one measurement that would close that gap (access logs for `/worlds/journey`, Continuity-tab telemetry) is noted, not run.
