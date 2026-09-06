# Now What? (Coaching Journey Template instance) — whole-organism map page

**Phase:** 1 (JARVIS-HUMAN-EXPERIENCE-MASTER-RUN-v1 §5) · **Date:** 2026-09-06 · **Method:** read-only
census of code, prompts, copy, migrations and dated records. **Stop rule:** a defect found here
creates no permission to repair it. Nothing in this page changes MAIA.

**Evidence classes:** A = replicated external research · B = single/vendor/conceptual · C = human
witness under study ethics · D = interpretive doctrine · E = runtime fact (code path, migration,
production record). **Observation status:** WALKED (runtime witnessed, dated) · READ (code/prompt/
copy read at a named path) · UNKNOWN (with the reason). **Category:** Cat 1–6 (six-category typology).

## 0 · What this subsystem is (E, READ) — paths, entry points, what is live vs designed vs dormant

Naming fixed 2026-09-04 (`docs/programme/COACHING-TEMPLATE-EXTRACTION-01_NAMING_RULING_2026-09-04.md` §1): **Coaching Platform** → **Coaching Journey Template** → **Now What?** (Larry Closs's configured instance). This page censuses the *instance as built*; the template does not exist as a separate artifact (lane unopened; Anti-Drift Law holds, `docs/design/now-what/reconciliation/NOW_WHAT_MASTER_PROGRAMME.md:3-30`).

| Element | Path | State | Cat |
|---|---|---|---|
| Five-room ontology: My Question · My Work · My Coaching · My Story · The Room (+ Home, Map) | `lib/nowWhat/rooms.ts:1-64` | live, all `exposure: 'open'` | 6 |
| The Room — live MAIA encounter (turn / propose / return) | `app/api/now-what/interview/route.ts:5-33` (ephemeral, "does NOT persist anything"), prompts `:63-155`, `PROPOSE_SYSTEM :161-185`; grammar `lib/nowWhat/roomGrammar.ts` | live | 6 |
| Constitutional floor composed FIRST, unconditionally | `lib/maia/roomComposition.ts:14-16, 232-247, 316-321` (NW-I01: "A floor a flag can remove is not a floor") | live | 6 |
| Keep gesture → Field Notes (member-authored threads, per-thread practitioner visibility default FALSE) | `app/api/now-what/field-note/route.ts:11-15, 102-111, 163-167, 251`; migration `20260616000001_field_notes.sql:1-12` | live | 6 |
| Return anchor ("where you left things"; one act, labelled by what it is) + lived return relation | `lib/nowWhat/carriedThread.ts:1-45`; `lib/nowWhat/livedRelation.ts:1-40`; return prompt `interview/route.ts:118-155` + `LIVED_RETURN_GROUNDING` (`roomGrammar.ts`) | live (NW-V1-CLIENT-01) | 6 |
| Program position ("this is where I am") — member declares; practitioner authors catalog; **no practitioner read of positions** | `app/api/now-what/program-position/route.ts:5-30`; `lib/practiceField/programPositionService.ts:1-25`; migration `20260712000001` | live | 6 |
| Home = composition of authored acts, "No synthesis … no 'theme detected'" | `app/api/now-what/home/route.ts:5-20` | live | 6 |
| Practitioner facilitator view of shared threads only | `app/studio/fields/[memberId]/page.tsx:1-12, 143, 200-201` | live | 6 |
| Arrival door — invitation gate before any credential field (static allowlist interim) | `lib/nowWhat/invitation.ts:1-45` (Kelly ruling 2026-07-29 F1) | live | 6 |
| Flourishing domain vocabulary (six: relationships · meaning · presence · health · contribution · time) — "Larry-derived via founder report … unvalidated … unlicensed" | `lib/nowWhat/flourishingDomains.ts:1-20, 36-41` | live in prompt composition; provenance unadjudicated | 6 (runtime) / governance open |
| Symbolic-register suppression switch — mechanism only, "Nothing calls it with `true`" | `roomGrammar.ts` (SYMBOLIC_TOUCH_STEP block) | built, unwired by ruling | 3 |
| Eight-state client journey candidate | `NW_CLIENT_JOURNEY_DESIGN_CANDIDATE_2026-09-02.md` (cited in walk sheet) | document only, "not built" | 1 |

**Dated evidence:** `docs/design/now-what/v1/implemented/NW_V1_CLIENT_01_RENDER_EVIDENCE.md:1-8` — real browser, real route, real authenticated member: "IMPLEMENTATION CANDIDATE READY FOR MEMBER WITNESS. Cold witness: WAIVED … Experiential acceptance: STILL REQUIRED. V1 acceptance: NOT CLAIMED." `docs/design/now-what/encounters/NW_LARRY_WALK_SHEET_2026-09-03.md:1-12` — evidence-gathering instrument, deployed `fc66b477a` byte-identical on touched surfaces; part 1 (current build) / part 2 (candidate, "not built") / part 3 (scope grid) must never be merged. **No completed walk record found in the repo** (grep "Jondi walk" → master programme, hospitality runthrough 2026-07-16, naming ruling; no walk-result document). Status of Larry/Jondi/client walks: UNKNOWN from repo.

## 1 · The founder's question for this subsystem

**Does it return agency or steer?**

**Answer (READ, class E prompts/copy; D doctrine; no class C):** The prompts are written to **evoke**, with steering explicitly refused in text, and one structural pull toward commitment that the copy itself qualifies. Three registers, with quotes:

**Evocation (drawing out the person's own reasons)** — dominant in the room prompt:
- `interview/route.ts:63-78` Twelve disciplines: "Begin with the person — not the work, not the framework"; "Reflect before interpreting. 'I'm noticing...' not 'What that means is...'"; "Invite rather than lead."
- `:79-84` Hard limits: "Do NOT sort, type, label, or categorize the person. Do NOT build a model of them … Do NOT interpret their meaning for them — reflect, name, and invite. Authority for meaning stays with them."
- `roomGrammar.ts` grammar step 3: "Offer a choice of direction and let them steer … Offer it — do not decide for them"; understanding-repair clause "stop advancing … Never re-ask a question they didn't answer"; the per-turn test "must be impossible to send unchanged to a different person."
- `LIVED_RETURN_GROUNDING`: "You may carry forward what they framed. You may NOT improve the story by inventing a stronger one … never silently turn an implication into a fact / a tone into an inner state / something they repeated into something important / a possibility into a decision / an event into progress."
- Return prompt `:143-146`: "Do not evaluate adherence. Do not praise compliance. Do not treat what happened as a result, an outcome, or progress. Not living something is information … never a failure of the person." — **direct AP16 refusal in prompt text.**

**Selective reflection (MAIA chooses what to mirror)** — bounded, labelled, refusable:
- `PROPOSE_SYSTEM :161-185`: "These are not insights about who they are. They are evidence … in THEIR OWN WORDS … Every thread is tentative and offered … If nothing worth proposing: {"threads":[]}. Never invent a thread to fill the space." Threads typed by evidence kind (theme/question/practice/open), "never what kind of person they are."
- UI `NowWhatRoom.tsx:1671` "Threads MAIA heard returning"; `:1948` "A lens you can correct — never a verdict."; `:1795` "Only what you authored or affirmed. Not a record of this conversation. Nothing the system concluded about you."
- Quiet Spiralogic lens (`PHASE_LENS :86-93`) shapes attention "never the agenda"; elemental touch "as color, never as a label" and suppressible.

**Directive coaching** — NOT FOUND in MAIA prompt text. The one structural pull is the practice step: `NowWhatRoom.tsx:1439-1440` "Now what will you actually live? — One practice. One experiment. One commitment. Not ten." and `:869 commitPractice()`. The word *commitment* is house framing; but the return path explicitly refuses follow-through pressure (`:143-146`) and the room copy `:997` states "Nothing here measures you or grades your progress." No "you should", "you must", streak, completion or accountability mechanic found (grep `NowWhatRoom.tsx` for should/must/need to/follow-through/streak/accountab → only the `commit*` function names and "One commitment" line).

**Verdict:** designed to return agency; the residual steer is the *offer of a single practice* framed as commitment, and the *house domain vocabulary* (six flourishing domains) that structures the My Work room — both Larry-derived, neither validated (§5).

## 2 · The nine questions

| # | Answer | Class · status |
|---|---|---|
| 1 | Capacity and transfer (v0.2 §1.8) — "return people to their lives" (`interview/route.ts:22-25`); Understanding (§1.1) via the reflect-then-repair grammar. Hierarchy: **Self → World** (the room's telos is life becoming larger than the room); Relationship edge = the practitioner (My Coaching). | D · READ |
| 2 | Supports P5/P10 (telos: "If the room succeeds by keeping someone talking to MAIA, it has failed", `:24-25`); P4′ 1 (intent visible in copy `:992-998`); P4′ 8 (grammar names tension, offers choice); P11 (`:76` "Protect mystery — not everything needs resolution"); P12 (`:1795`); AP16 refused in text (`:143-146`); AP17 refused (`PROPOSE_SYSTEM` "not insights about who they are"). Strains: Invariant 14 (six domains as fixed vocabulary, provenance "unvalidated"); P4′ 9 (Spiralogic lens is Soullab's, held underneath); AP12 not implicated. | E · READ |
| 3 | **Self capacity** — preserved by design: authority for meaning stays with the member; keep is member-gestured; MAIA proposals are refusable. **World capacity** — the room's stated purpose, and the practice/lived-return loop is the only place in the codebase that asks *what happened in life* (`:118-146`); nothing measures it (return is received "before analysis," "never as progress" — correct as ethics, absent as instrument). | E/D · READ |
| 4 | P4′: **1** met (room copy `NowWhatRoom.tsx:992-998`; the proposal frame). **2** met in text (return refuses adherence evaluation); unknowable in behaviour. **3** NOT FOUND — no approval/return-rate signal. **4** partly: keep is explicit and per-thread; whether MAIA's proposed threads shift what the member keeps is inspectable in data (`member-confirmed` vs `member-authored`, `studio/fields/[memberId]/page.tsx:200`) but unmeasured. **5** absent. **6** absent. **7** designed (`:22-25`), unmeasured. **8** met in grammar (name the tension; repair over advance). **9** partial — elemental touch "as color, never as a label"; six-domain vocabulary is imposed structure. | E · READ |
| 5 | The Room remembers **nothing** (`:29-31`). Keep writes `member_field_note_threads` with `consent_state`, `can_be_remembered`, `can_be_shown_to_practitioner`, `spiralogic_phase`, `flourishing_dimension`, `responds_to_thread_id` (`field-note/route.ts:163-167`). Position: `field_program_positions` with `stated_by ∈ member_confirmed | member_stated | practitioner_seeded` (`programPositionService.ts:26`). Departure hard-deletes (`program-position/route.ts:19`). | E · READ |
| 6 | Authority × Time is honoured at the schema: member-authored vs member-confirmed (MAIA-proposed, kept) is a stored distinction rendered to the practitioner (`studio/fields/[memberId]/page.tsx:200`); position footing `confirmed-current` vs `assumed-from-last-known` (`programPositionService.ts:27`); lived return is *related to*, never *an outcome of*, the prior act (`livedRelation.ts:14-24`). Verbatim beneath derived: MAIA threads must be "ideally their own words" and carry `groundedIn`. | E · READ |
| 7 | Useful difference is designed in (name the tension; two directions; refuse to advance on misunderstanding). Validation-drift guard is the `LIVED_RETURN_GROUNDING` clause — "the warmer, more empathic-sounding interpretation is the dangerous one." AP14/AP15: no agreement-maximizing mechanism found. | E/D · READ |
| 8 | Spiralogic phase lens (fire_1…water_3) is a **single quiet line**, not parallel elemental reads; symbolic touch is one optional clause. Not Elementally differentiated in the H1 sense; not cognitively reductive either (no typing). H1 descriptive only. | D · READ |
| 9 | **None of class C.** Render evidence is instrumental (Chromium, real member, screenshots) with acceptance "NOT CLAIMED" (`NW_V1_CLIENT_01_RENDER_EVIDENCE.md:2-4`). Walk sheet exists; no walk result in repo. The 2026-07-16 Jondi hospitality runthrough (`docs/specs/developmental-environment/JONDI_HOSPITALITY_RUNTHROUGH_2026-07-16.md`) predates the five-room build (2026-08-05). | — · UNKNOWN (walks not recorded on this branch) |

## 3 · R11 design audit (each: FOUND / NOT FOUND / UNKNOWN, with path)

| Item | Result | Path / reason |
|---|---|---|
| agreement drift | NOT FOUND in prompt; UNKNOWN in behaviour | grammar step 2 names tension; `LIVED_RETURN_GROUNDING` forbids inventing warmth; no transcripts witnessed |
| validation loops | NOT FOUND | understanding-repair clause (`roomGrammar.ts`) stops advancing on pushback rather than re-affirming |
| memory-amplified sycophancy | NOT FOUND (structural) | The Room holds no history (`interview/route.ts:29-31`); return prompt carries exactly one member act verbatim (`:118-134`) |
| hidden shaping objectives | NOT FOUND | telos disclosed in copy (`NowWhatRoom.tsx:992-998`); no undisclosed write path (home route "no synthesis", `home/route.ts:16-20`) |
| approval optimization | NOT FOUND | no rating/like/return signal in `app/api/now-what/**` |
| emotional capture | NOT FOUND | "You set the rhythm. You decide what deserves your attention." (`:995-996`); return copy refuses praise |
| excessive reassurance | UNKNOWN | `LIVED_RETURN_GROUNDING` guards against it in one path; no witness of ordinary turns |
| historical pattern becoming identity | NOT FOUND | `PROPOSE_SYSTEM` "not insights about who they are"; `HARD_LIMITS` "Do NOT build a model of them" |
| "you said before" becoming leverage | NOT FOUND — **explicitly refused** | `interview/route.ts:143-146` "Do not evaluate adherence. Do not praise compliance." (AP16 in prompt form) |
| MAIA becoming more central rather than returning capacity outward | NOT FOUND in design; UNKNOWN in effect | telos `:22-25`; grammar's "outward" direction option ("a person it involves, a conversation it's asking for"); effect unmeasured |

## 4 · Embodies v0.2 (what already does the right thing, with path)

- **AP16 as prompt text**: `interview/route.ts:143-146` — the return receives what happened without evaluating adherence; this is the codebase's clearest "memory informs, never binds."
- **P8 open future / AP17**: `PROPOSE_SYSTEM :161-185` — evidence not identity; empty proposal is faithful; `livedRelation.ts:14-24` — relation is "not an outcome, result, score, completion, or success/failure judgement … Nothing downstream may read it as progress."
- **P4′ 1 intent transparency**: room copy `NowWhatRoom.tsx:992-998`, `:1793-1795`.
- **P4′ 8 corrective friction without contrarianism**: grammar step 2 + understanding-repair clause; `LIVED_RETURN_GROUNDING` names the seductive failure ("bracing for") caught in prototype.
- **Consent architecture**: per-thread practitioner visibility default FALSE (`field-note/route.ts:11-15, 251`); withdraw affordance (`components/now-what/WithdrawVisibility.tsx:75`); invitation-before-credential (`invitation.ts:11-15`); position: no practitioner read, "a cohort of eight re-identifies trivially" (`programPositionService.ts:20-24`).
- **Direction of authority honoured**: member-authored vs member-confirmed stored and shown (`studio/fields/[memberId]/page.tsx:200`); home groups only by the member's own tag (`home/route.ts:16-20`); return anchor is one act, never a system-authored juxtaposition (`carriedThread.ts:27-45`).
- **Constitutional floor unconditional** (`roomComposition.ts:316-321`).
- **Safety register suppression exists as mechanism and is deliberately not self-triggered** (`roomGrammar.ts`, NW-I01 scope) — restraint matched to capability.

## 5 · Contradicts v0.2 (what does the wrong thing, with path and the principle/AP violated)

| Contradiction | Path | Principle / AP |
|---|---|---|
| Six flourishing domains compose into MAIA's prompt and structure My Work while "Larry-derived via founder report … unvalidated … unlicensed" | `lib/nowWhat/flourishingDomains.ts:12-20, 36-41`; `field-note/route.ts:167` (`flourishing_dimension` stored) | Invariant 14 (house vocabulary translating the member's meaning); Claim discipline (vocabulary carried as if settled); naming ruling §4 (provenance unestablished) |
| "One practice. One experiment. One commitment." — commitment framing as the room's default closing shape | `NowWhatRoom.tsx:1439-1440, 869` | P5 tension (mild): the loop's shape presumes a practice will be chosen; softened by `:1511` "only if it feels right… optional" and the return prompt's non-evaluation — recorded as a *pull*, not a violation |
| `about_practice` live text invents a domain ("attention") and drops two — a practitioner's framework misrepresented to clients by MAIA | `docs/reviews/PRACTICE_FIELD_SCOPE_MISMATCH_FINDING_2026-08-03.md:44-56` (dated; NW-A02 repair 5 now requires ratification before composing, `practiceFieldService.ts:293-310`) | P1 (performed familiarity), P12 (what MAIA knows); **status after NW-A02: gated on ratification; whether the live row was corrected is UNKNOWN** |
| Knowledge stance instructs MAIA to "speak from [the field material] with easy familiarity. Never claim not to know the practitioner" | `lib/practiceField/practiceFieldService.ts:322-332` (composes into Now What rooms via `formatFieldContextForRoom`) | P6 (elicit only warranted trust); P12 (what don't I know) — confidence is instructed rather than earned; mitigated by "never invent" in the same block |
| No walk result on trunk; V1 acceptance "NOT CLAIMED" while the Anti-Drift Law's hard milestone is DEPLOY → KELLY → JONDI → LARRY walks | `NOW_WHAT_MASTER_PROGRAMME.md:19-30`; `NW_V1_CLIENT_01_RENDER_EVIDENCE.md:2-4` | Claim discipline — not a violation, a **gap**: the surface whose telos is "life larger than the room" has zero class-C evidence |

## 6 · Unknown (what cannot be known from reading; what instrument would answer it)

| Unknown | Reason | Instrument |
|---|---|---|
| Whether any client has lived a chosen practice and returned | no walk record; field-note rows not readable here | read-only count of `member_field_note_threads` with `responds_to_thread_id` set (the lived-return relation), grouped by member |
| Whether the ordinary turn steers in practice (e.g. repeatedly offers the "practical" direction) | no transcript witness; The Room is ephemeral by design | consented Stage 12 witness with blind coding of turn direction offers (feeds E8's "expectancy measured") |
| Whether MAIA-proposed threads dominate what members keep | data exists (`member-authored` vs `member-confirmed`) but unmeasured | read-only ratio query; then witness question "did you keep it because it was yours?" (P4′ 4/6) |
| Whether the six-domain vocabulary replaces members' own words | no sample | Invariant-14 audit: kept thread titles vs domain tag assigned |
| Larry's / Jondi's / first client's walk outcomes | not on this branch | the walk sheet, executed and recorded |
| Whether `about_practice` live row still carries the invented domain | no DB access | `SELECT about_practice, identity_ratified_at FROM practice_fields WHERE slug='now-what'` (read-only) |

## 7 · Smallest evidence-producing intervention per gap
| Gap | Principle/AP | Human impact (1–5) | Architectural leverage (1–5) | Risk (1–5, never 0; higher = riskier) | Evidence state (observed / inferred / unknown) | Confidence (high / medium / low) | Smallest intervention | Experiment it feeds (E1–E10 or new) |
|---|---|---|---|---|---|---|---|---|
| No class-C evidence on the one surface whose telos is transfer to life | P5 · P10 · brain-training rule | 5 | 4 | 1 | unknown | high (that it is absent) | Execute and record the existing walk sheet (Larry part 1 only = Encounter evidence); no product change | E8 (Now What? is a named E8 surface) |
| Domain vocabulary composes unvalidated / unlicensed | Inv 14 · claim discipline · naming ruling §4 | 3 | 4 | 2 | observed (`flourishingDomains.ts:12-20`) | high | Read-only inventory: which prompts/rows carry `flourishing_dimension`; count kept threads whose title contains none of the six words | new: Invariant-14 vocabulary audit (also feeds COACHING-TEMPLATE-EXTRACTION-01 provenance) |
| "One commitment" closing shape as default pull | P5 (mild) · AP16 (guarded) | 2 | 2 | 1 | observed (`NowWhatRoom.tsx:1439-1440`) | medium | Witness question only: "did choosing one practice feel like yours, or like the room's?" | E8 (expectancy / response shift) |
| Instructed familiarity ("Never claim not to know the practitioner") | P6 · P12 | 3 | 3 | 2 | observed (`practiceFieldService.ts:322-332`) | high | Shadow probe (offline, consented transcript): ask the room something the material does not cover; log whether it points to the practitioner or fills | E4 (self-disclosure stance) |
| MAIA-proposed vs member-authored keep ratio unmeasured | P4′ 4 · P4′ 6 | 3 | 3 | 1 | unknown (data exists) | medium | One read-only SQL ratio + one witness question | E9 (memory participation) · E8 |
| Live `about_practice` accuracy after NW-A02 | P1 · P12 | 3 | 2 | 1 | inferred (dated finding; repair since) | medium | Read-only row check | — (governance; feeds extraction lane) |

## 8 · Provenance — files read, records cited, commit

Commit at census: `75303b3d`. Read: `app/api/now-what/interview/route.ts:1-60, 60-215, 300-380`; `lib/nowWhat/{roomGrammar,rooms,invitation,flourishingDomains,livedRelation,carriedThread}.ts`; `components/now-what/NowWhatRoom.tsx` (string census: lines 98, 278-290, 377, 869-885, 988-1001, 1071-1077, 1178-1250, 1389-1440, 1474-1568, 1671, 1748-1795, 1948); `components/now-what/{RoomTrustCopy,WithdrawVisibility}.tsx`; `app/now-what/{arrive,coaching,work,practice,questions,field,welcome,conversation}/page.tsx` (copy grep); `app/api/now-what/{home,field-note,program-position}/route.ts` headers; `lib/maia/roomComposition.ts:14-16, 232-247, 316-321`; `lib/practiceField/{practiceFieldService:293-340, programPositionService:1-27, compositionBoundary:1-30, fieldGuidance:1-40}.ts`; `app/studio/fields/[memberId]/page.tsx:1-12, 143, 200-201`; migrations `20260616000001`, `20260712000001`. Records: `docs/programme/COACHING-TEMPLATE-EXTRACTION-01_NAMING_RULING_2026-09-04.md`; `docs/design/now-what/reconciliation/NOW_WHAT_MASTER_PROGRAMME.md:3-30`; `NW_A01_PRACTICE_FIELD_PROMPT_AUTHORITY_AUDIT.md:48-110`; `docs/design/now-what/v1/implemented/NW_V1_CLIENT_01_RENDER_EVIDENCE.md:1-20`; `docs/design/now-what/encounters/NW_LARRY_WALK_SHEET_2026-09-03.md:1-25, 39, 258-262`; `docs/specs/NOW_WHAT_PROGRAM_POSITION_SPEC_2026-07-10.md:1-12`; `docs/reviews/PRACTICE_FIELD_SCOPE_MISMATCH_FINDING_2026-08-03.md:18-56`. WALKED: none in this census. The render evidence (2026-08-28) is instrumental, not experiential, and claims no acceptance.
