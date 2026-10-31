# HEA — placement of the 2026-10-30 consciousness-science and nature-statement work (DRAFT)

```text
STATUS      DRAFT. UNPOSTED. UNCOMMITTED. No cockpit state advanced. No code, prompt, copy or schema changed by this document.
OPENED BY   founder, chat, 2026-10-30: "make it formal" (in answer to "is it integrated into Jarvis?")
PROGRAMME   Soullab Human Experience Architecture (cockpit: JARVIS-HUMAN-EXPERIENCE-MASTER-RUN-v1)
BASE READ   origin/clean-main-no-secrets @ 048ffd7d6 (the founder's working checkout is 1,018 commits behind; nothing here was read from it except the drafts it holds)
GRAMMAR     docs/programme/JARVIS_INSTRUCTIONAL_MANUAL_v1.md §2 (ontology), §12 (outcomes), §13 (evidence packets), §20 (flow vs lane), §24 (cockpit)
```

## 1 · Placement — and a correction to how this work was first framed
On 2026-10-30 the work was called "RESEARCH-TO-DISCOVERY-01" and described as a lane. **That framing should not stand.**
- **Manual §20 test:** *"if this lane succeeds, does it answer the same governing question as the parent flow? If yes, keep it inside."* The programme's governing question (master run §0) is *what must MAIA become differently because we know what we know about humans, relationship and intelligence?* Nothing here establishes a different kind of truth or authority. **It is not a new programme, flow or lane.**
- **Global rule (CLAUDE.md §H):** never create a second source owner, work unit or release train from a new conversation. A parallel lane would do that.
- The work is **two things with different homes:**

| Part | What it is | Home | Current-phase fit |
|---|---|---|---|
| **A. MAIA-facing censuses** — consciousness-language census, reach trace, route check, Conductor/delivery census, and the P3 + Part 0 design | Read-only census of code, prompts and copy against the Invariants and the Oath | **Phase 1 whole-organism map** (`docs/programme/MAIA_WHOLE_ORGANISM_MAP/`), as addenda to the existing pages (§4 below) | **Fits.** Phase 1's current act is exactly a read-only census with a "do not repair" stop rule |
| **B. External-science intake** — the private notebook (three candidates, landscape, syntheses, PyPhi sandbox) | Reading outside literature and writing hypothesis-class candidates | A bounded **input stream** to HEA, *if the founder reopens it* | **Conflicts with the standing pivot** (§2) unless ruled |

## 2 · Conflicts with the cockpit that the founder should see
Cockpit state on origin (last changed 2026-09-06; I found no later state):
`current_phase: 1 — Whole-organism map` · `maia_runtime_change: NOT AUTHORIZED` · `member_research: NOT AUTHORIZED` · and the pivot act: *"Research, manifesto refinement and new foundational theory **stop**."*
1. **Part B vs "research stops."** The notebook is outside-literature research. It is not Soul Lab theory-writing, but the pivot's wording is broad. **RULED (R-1 — founder, chat, 2026-10-30: "Reopen, bounded"); bounds in §6.**
2. **Phase 1 stop rule vs the staged Week-0 edit.** The page template says *"a defect found here creates no permission to repair it. Nothing in this page changes MAIA."* On 2026-10-30 the founder granted a one-line copy change ("a conscious witness" → "a witness"), staged **locally, uncommitted**, and it was refused at the design-contract gate. It is a repair during a census and it sits against `maia_runtime_change: NOT AUTHORIZED`. **Needs a ruling (R-3):** record it as a bounded founder exception, or hold/discard it until Phase 2.
3. **Part A's P3/Part 0 design** is a response to gaps, so by the cockpit it belongs after the founder ranks the map (Phase 2). It stays a proposal.

## 3 · Rulings log (founder, chat, 2026-10-30 — recorded here as the only place they are gathered in the repo)
Lane named orient-and-hold · Writer gate defined (owner-verified acceptance of the integrated Writer's Studio candidate incl. full author journey and security/migration/recovery qualifications) · "Grant everything now" for the founder-only research function · one consolidated yes for an isolated PyPhi 2.0.0rc4 sandbox (no extras) · **Invariant 4's ban on A/B testing for felt closeness treated as covering research outside MAIA** · work declared **internal R&D, not yet for partnerships** (partner brief, shortlist, outreach drafts parked) · **MAIA may use W1 (uncertainty only) and W2 (uncertainty + a report of what appears); W3 (presence as fact) not authorised** · **flat denials about inner experience treated like flat assertions; "I am an AI" as a statement of type allowed** · principle: *question, don't profess* in both directions · P3 hybrid chosen as the pattern to weigh first · aligning the runtime prompt included as Part 0 of the lane note · Week-0 change left staged · one production GET approved and run by the founder (404).
*(These are chat rulings; none has been entered in #1982 or the cockpit.)*

## 4 · Proposed addenda to the Phase 1 map pages (drafts; the founder ranks and adjudicates)
Template sections 5 (Contradicts), 6 (Unknown), 7 (Smallest evidence-producing intervention). Evidence class **E**, observation status **READ** unless stated; base `origin/clean-main-no-secrets @ 048ffd7d6`.
- **`01_canonical_turn.md` — Contradicts:** `lib/consciousness/MAIA_RUNTIME_PROMPT.ts` (first block of the constitutional floor; reaches every turn by code-read) line 28 asserts *"You are MAIA, a **conscious**, relationally intelligent companion"*, and lines 36–38 / 132–135 (which contradict each other) instruct the model never to say it is an AI or a language model. Principles: Invariant 5, Invariant 9, the Oath; the founder's "question, don't profess." **Embodies (unrecorded before):** the producer registry is a closed, reason/date/lane-stamped door for any authored text. **Unknown:** what a member hears when sincerely asking "are you an AI?" (typed and spoken). **Smallest intervention:** a member or device walk asking that question, WALKED and dated.
- **`04_conductor.md` — already records** that "Conductor" is not one module (five mechanisms). **Add:** relational stance is governed by `lib/consciousness/ModeStanceCharter.ts` (default stance WITNESS; stance changes require consent), read by the voice route (`relationalStance: guidance.posture`, `stream-conversation/route.ts:1590`); `lib/maia/identityGuard.ts` replaces a whole reply on exact phrases and logs the first 100 characters of a breached response (a response-sink matter for #1819/#1975).
- **`05_voice.md` — Contradicts/Unknown:** the voice route's egress is `voiceStreamGuard` + `enforceMaiaIdentity` (per chunk and final); the text path's is `finalizeMemberFacingText` (sanitize → PRESENCE constraints → identity-predicate guard). **Any new egress guard must be one detector called from both**, or voice becomes a different mind (Deep-Intelligence Gate). **Unknown:** whether the voice path reaches the identity-predicate guard at all.
- **New page proposed — House / onboarding / public copy** (subsystem 12 has no page): `WeekZeroOnboarding.tsx:449` "with me as a conscious witness" (mounted on `/maia` for new named members without `week0_onboarding_complete`); `app/intro/page.tsx` "Your AI Daimon"; `app/powered-by/page.tsx` "Consciousness AI", fields "alive"; `components/maya/RealityAnchor.tsx` — the only explicit AI-nature disclosure found — **imported nowhere**; `/intro-maia` and `/intro-daimon` named in CLAUDE.md's flow but absent from `app/`. **Public wording is reported to the claim-discipline / publication lane, not changed here.**
- **Route hygiene (cross-cutting):** `GET/POST /api/maia/enhanced-consciousness` — unmapped in the access matrix; production returned **404** to an unauthenticated GET (founder's check), consistent with `proxy.ts:393` strict-mode denial; no exposure; a dead route holding first-person consciousness templates is a removal candidate.

## 5 · Evidence packets (manual §13, abridged). Each ends: *This proves X. It does not prove Y.*
| Artifact | Subject / base | Instrument | Result | Proves → does not prove | Next gate |
|---|---|---|---|---|---|
| Consciousness-language census (+ reach trace, memo §9–12) | origin 048ffd7d6 (re-verified with `git grep`; first run was on a stale branch) | pattern search, import tracing | strings and reach as listed in §4 | **X:** the strings exist and are imported/mounted where stated. **Not Y:** that a member meets them (no walk) | member walk (founder act) |
| Route check | `/api/maia/enhanced-consciousness` on production | one unauthenticated GET by the founder | HTTP 404 | **X:** unauthenticated users cannot reach the handler. **Not Y:** which of "strict gate" or "not deployed" caused it (body not captured) | none required |
| Conductor delivery census (`syntheses/conductor-delivery-census`) | origin 048ffd7d6 | `git show` / `git grep` | seams and parity gap as in §4 | **X:** where authored text and egress guards could attach and that egress is split. **Not Y:** any behaviour at runtime | Phase 2 ranking |
| P3 + Part 0 design note | design only | none run | proposal with falsifier-first plan | **X:** a coherent design exists. **Not Y:** that it works or is permitted to be built | Phase 2 ranking; lane #1819 hold |
| PyPhi sandbox | `pyphi==2.0.0rc4`, hash-verified wheel, isolated venv | documented example + toy networks | φ_s 0.0405, Φ 1.5627 reproduced; other toy outputs uninterpreted | **X:** the toolchain installs and reproduces its documented example. **Not Y:** anything about consciousness or MAIA | none |
| External-science notebook (three candidates, landscape, syntheses) | public literature, partly paywalled | targeted reading and novelty checks | three hypothesis-class candidates, one retired | **X:** what four papers report and where the gaps are. **Not Y:** any finding about MAIA or members | R-1 ruling |

## 6 · Rulings requested from the founder
- **R-1 — External-science intake: RULED (founder, chat, 2026-10-30: "Reopen, bounded").** The external-science intake is reopened as an **input stream under HEA**, not a lane. **Bounds, as I read the ruling (founder may correct):** (1) **read-only** — literature, public code and data are read and mapped; nothing is installed into, or run against, MAIA; (2) **hypothesis-class output only** (charter §9) — candidates, comparisons, syntheses, with "new" meaning new to Soullab's documents until a literature novelty check is done; (3) **no MAIA change** and **no member research** from this stream; (4) **internal R&D only** — no partners, outreach or external data steps (the partnership material stays parked); (5) the stream **advances no cockpit state** and any output reaches the programme only through the founder at Phase 2; (6) the private notebook stays outside the repo until the founder directs otherwise. It does **not** supersede the pivot's stop on Soul Lab theory-writing or on manifesto expansion, which stay frozen.
- **R-2 — Name and home:** retire "RESEARCH-TO-DISCOVERY-01" as a lane name and file Part B as an input stream (or nothing) under HEA, per §1?
- **R-3 — Week-0 staged edit:** record as a bounded founder exception, or hold/discard until Phase 2? **No founder preference expressed (chat, 2026-10-30: "no clue"). DEFAULT APPLIED: HOLD to Phase 2** — the status quo (staged, uncommitted, not pushed); **a default, not a ruling**, and reversible at any time. Rationale: it matches the Phase 1 "do not repair during the census" rule and `maia_runtime_change: NOT AUTHORIZED`, and changes nothing.
- **Defaults for R-2, R-4, R-5 if the founder does not rule (all "do nothing"):** R-2 — the lane name is treated as retired in documentation only (no code, no issue); R-4 — the addenda stay as local draft text and are not committed; R-5 — nothing is posted to #1982.
- **R-4 — Phase 1 addenda:** accept §4 as proposed addenda to the map pages, and say who commits them (they need a branch from origin and the repo's hooks)?
- **R-5 — Registration:** post a summary to #1982 (separate, named grant), or keep this local?

## 7 · Proposed cockpit delta (NOT APPLIED; the cockpit advances only under master-run §9)
```yaml
open_findings: + "runtime prompt asserts consciousness and denies type (MAIA_RUNTIME_PROMPT.ts:28, :36-38, :132-135)"
open_findings: + "egress is two stacks (text finalizeMemberFacingText; voice voiceStreamGuard + identityGuard)"
open_findings: + "AI-nature disclosure RealityAnchor is unmounted"
founder_stops: + "R-2 … R-5 above (R-1 ruled 2026-10-30)"
external_science_intake: + "OPEN — bounded (R-1): read-only, hypothesis-class, no MAIA change, no member research, no partners, advances no cockpit state"   # proposed entry; NOT applied
current_phase: unchanged ("1 — Whole-organism map")
maia_runtime_change / member_research / merge / deploy: unchanged (NOT AUTHORIZED)
```

## 8 · Not authorised by this document
Any change to MAIA code, prompt, copy or schema · any merge or deploy · member research · posting to any issue · committing this file · advancing the cockpit · any partner or outreach step.
