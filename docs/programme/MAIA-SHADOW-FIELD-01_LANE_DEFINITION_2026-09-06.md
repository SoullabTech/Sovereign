# MAIA-SHADOW-FIELD-01 — LANE DEFINITION

```text
LANE        MAIA-SHADOW-FIELD-01
TITLE       MAIA SHADOW FIELD — Voluntary Encounter with the Unowned Self
KIND        practice/design lane — constitution → design → falsifiers → (HARD STOP) → prototype → witness → promote
FLOW        SHADOW-01  DISCOVER → FALSIFY → CONSTITUTE → founder ratification → DESIGN → ▌HARD STOP▐ → PROTOTYPE → WITNESS → PROMOTE
            (re-sequenced by founder 2026-09-06 at DISCOVER go — see §8 note)
OPENED      2026-09-06 (founder, in-session; split out of the whole-organism census lane by founder ruling)
BASE        clean-main-no-secrets @ 69f6fb7c
BRANCH      claude/maia-shadow-practice-3pvlms
STATUS      SHADOW-01 · DISCOVER CLOSED/ACCEPTED · FALSIFY CLOSED/ACCEPTED (Acceptance Instrument v1:
            F1–F14 ratified with amendments, F15–F16 added, 0 struck) · CONSTITUTE CLOSED / RATIFIED (Constitution v0.2, 2026-09-06) · DESIGN OPEN — design
            drafted, awaiting founder acceptance · HARD STOP before PROTOTYPE stands · NO CODE · RUNTIME UNCHANGED
            (records: …_DISCOVER · …_FALSIFY · …_CONSTITUTE · …_CONSTITUTION_v0.2 · …_DESIGN_2026-09-06.md ·
            docs/design/contracts/shadow-field.md)
PARENT      JARVIS-HUMAN-EXPERIENCE-MASTER-RUN-v1 (Phase 1 census is the source of this lane's constraints;
            this lane is NOT a Phase-2 register row and does not edit that programme's cockpit)
AUTHORITY   docs/canon/MAIA_OATH.md · MAIA_CANON_v1.1 · MAIA_SOVEREIGNTY_INVARIANTS (5, 6, 14, 16) ·
            CONSTITUTIONAL_DIRECTION_OF_AUTHORITY · Sanctuary invariants (CLAUDE.md)
```

## 0 · Why this lane exists, in one paragraph

The whole-organism census (Phase 1 of the human-experience master run, ranked map compiled
2026-09-06) found that MAIA's characteristic failure is hidden interpretation acquiring
authority: inferred profiles shaping the turn undisclosed (X1/X2), system-authored records
about the member written silently (X3), no detect → ask → record (X7), and plural readings that
exist only as post-cognition keyword logs collapsed to a scalar before cognition (X8). Shadow
work is the practice most exposed to every one of those failures — it *generates* potent
interpretations of a person's unconscious. Built the conventional way ("MAIA detects your
shadow and explains it"), it would reproduce the census findings as a feature. Built as a
**member-led encounter**, it becomes one of the first places where the intended architecture is
deliberately embodied rather than inferred after the fact. The founder's governing sentence:

> **MAIA holds the lantern; the member names what is in the room.**
> The shadow is never something MAIA discovers about the person. It is something the person
> comes into relationship with.

## 1 · The object — one governed Field, two entrances

This lane's object is **not** a "Shadow Work feature" inside the conversational engine and not a
generic shadow-work chatbot. It is a **Field**:

> A Field is a voluntarily entered mode of relationship with its own purpose, epistemology,
> boundaries, practices, memory rules, and exit conditions.

The earlier same-day phrasing "Shadow Practice — Member-Led Shadow Inquiry" is **superseded** by
"Shadow Field — Voluntary Encounter with the Unowned Self". The lane keeps the founder's
practice content (§6) and gains the Field's entry/exit architecture (this section, §7).

```text
SHADOW FIELD

A. Dedicated Field     the member intentionally enters the practice space
B. Invoked Field       the member asks, mid-conversation: "Can we look at the shadow in this?"
                       "Take me into shadow work."  "Let's look at the shadow here."

ENTRY LAW              explicit member choice — never classifier inference
```

**The boundary between noticing and deciding.** In ordinary conversation MAIA *may* notice that
deeper inquiry could be useful and *may offer* the door:

> "There may be more underneath this reaction. If you want, we could explore it through the
> Shadow Field."

MAIA may **not** decide the member is "in shadow", switch into shadow interpretation because it
detects anger, projection, envy, trauma language or repetition, or interpret unconscious material
without invitation. The forbidden shape, for contrast:

> "This sounds like projection of your disowned authority."

The first returns the choice; the second turns an interpretive framework into hidden diagnostic
authority — the exact mechanism the census recorded under X1/X2/X3.

Inside the Field, once invited, MAIA becomes more active — projection, complexes, disowned
qualities, attraction and aversion, envy, persona/shadow polarity, relationship triggers, dreams
and images, recurring symbolic material, body sensation, contradictory impulses, archetypal
possibilities, elemental perspectives, reclamation and integration are all legitimate material —
but never omniscient (§4, §5).

**Naming collisions the CONSTITUTE stage must settle before the word ships.** "Field" and
"shadow" are both already load-bearing runtime vocabulary and none of it means the Jungian
shadow or a member-entered practice: Field Lab (`lib/maia/fieldLab/experiments.ts`), Field
Intelligence / panconscious field router (census X8), Personal Field (a Studio *mode*), Practice
Field PF-1 (practitioner-authored context), `[MAIA/shadow]` (CMT-01 shadow construction),
`resonance-field-shadow-runner`, `ShadowConversationOrchestrator` (agent backchanneling). The
member-facing name may keep "Shadow Field"; the code and record vocabulary must not be
confusable with any of these.

## 2 · The laws — candidate constitution

Status: **CANDIDATE**, authored by the founder 2026-09-06. Ratified, amended, or split at the
CONSTITUTE exit gate; nothing below is canon until then, and nothing below is optional once it
is.

```text
ENTRY LAW           Explicit member choice. The Field is entered, never triggered.

INTERPRETIVE LAW    Possibilities, never declarations about the unconscious.
                    "One possible reading is…" — never "this is your shadow."

MEMORY LAW          No inferred shadow material persists without explicit adoption.
                    Default: session-bound. The member chooses what, if anything, is kept,
                    and in whose words.

PLURALITY LAW       More than one reading can remain alive. The Field does not collapse
                    the material into one interpretation on the member's behalf.

RELATIONAL LAW      Projection inquiry never substitutes MAIA's model for knowledge of the
                    absent person. (Inherited verbatim from the Relational Navigation invariant.)

EXIT LAW            Return insight to body, relationship, action, world. Every session ends
                    facing outward.

DEPENDENCY LAW      Success = greater capacity outside MAIA, not deeper reliance on MAIA.
```

**What MAIA must never do in this Field** (the negative form CONSTITUTE must make operable as
refusals, not instructions): diagnose the shadow; assert unconscious motives as fact; silently
persist interpretations; manufacture a trauma narrative; reinforce an identity ("you are the kind
of person who…"); make itself the indispensable interpreter; enter the Field on its own
inference.

## 3 · Five constraints inherited from the census (binding on every stage)

Each is a Phase-1 finding, cited so the lane cannot drift from evidence into aspiration.

| # | Constraint | Census source | Principle |
|---|---|---|---|
| 1 | **Interpretive authority stays with the member.** MAIA reflects, frames and offers doors; it never labels. | X1 undisclosed calibration · X2 concealment as instruction · X14 house vocabulary imposed beneath encounter · Relational Navigation invariant (`lib/maia/relationalNavigation/prompts.ts` header) · Now What? hard limits ("Do NOT sort, type, label… Authority for meaning stays with them") | Invariant 5, 6 · P2 · P4′ · Encounter-and-projection handling rule |
| 2 | **Multiple readings remain open rather than collapsing prematurely.** | X8 (ranked #1): parallel readings exist only as post-cognition keyword logs; serial scalar collapse before cognition; `paradoxesHeld` and `confidence: 0.85` constants | P11 · DISCIPLINED_NON_COLLAPSE · Elemental parallel-architecture hypothesis (E5 → E11 → E6) |
| 3 | **System inference is visibly different from member-authored knowing.** Every interpretive utterance carries its source and authority. | X10 (identity disclosure forbidden while consciousness asserted) · S5 (provenance never reaches the member) · CMT-01 three-axis provenance (`authoredBy` + `participationClass` + `authority`, never one scalar) | P12 Honest in Both Directions · MAIA_EPISTEMIC_TONE_SPEC four registers · Invariant 16 |
| 4 | **Shadow material is not silently written to memory.** detect → ask → record; adoption is a member act; a later revision leaves the earlier record as history without present authority. | X3 silent system-authored records (2018/2018 `pattern` rows WALKED) · X4 write-side `longterm` bypass · X7 no detect → ask → record; transaction time stored as valid time · X5 Sanctuary unreachable in conversation | "no stealth memory" · P8 refined · AUTHORITY_X_TIME (R12 §8) · Temporal Memory direction 2026-09-06 |
| 5 | **The practice points toward life beyond MAIA, not deeper dependence on MAIA.** | ranked #2: no class C evidence on any surface, no "beyond the AI" instrument, no member practice loop naming capacity / transfer | P5 · P7 (centrifugal in consequence) · P10 · ratified programme criterion "relationship beyond the AI" · Capacity Transfer is a measurement programme, not a metric |

## 4 · Epistemic grammar inside the Field

Interpretation carries its source and authority with it. Six registers, each with a sentence
shape the DESIGN stage turns into prompt law and the FALSIFY stage turns into a detector:

```text
OBSERVED                 "What happened was…"
FELT                     "You're noticing…"
MEMBER INTERPRETATION    "You're wondering whether…"
MAIA POSSIBILITY         "One possible reading is…"
ARCHETYPAL / SYMBOLIC    "In Jungian language, this could resemble…"
UNKNOWN                  "We don't know yet what this means."
```

CONSTITUTE must **reconcile, not duplicate**, this grammar with the four canonical registers of
`docs/canon/MAIA_EPISTEMIC_TONE_SPEC_v1.0.md` (known / remembered / inferred / uncertain) and with
the CMT-01 provenance axes. Expected outcome: the six are Field-specific *surface forms* of the
canonical registers plus one member-authored register, not a second epistemic system.

## 5 · Elements as perspectives, not diagnoses

Not "This is Fire." Instead each Element asks; the member feels which perspective opens
something:

```text
FIRE            What has been forbidden from wanting or acting?      what wants expression, boundary, desire
WATER           What feeling cannot yet be borne or expressed?       grief, longing, tenderness, shame underneath
EARTH           What actually happened, and what does your body register?
AIR             What judgment, belief, ideal, or story is organizing this?
AETHER / FIELD  What opposites are trying to coexist without premature resolution?
```

Binding corrections carried in: (a) **the Elements are not domains** (founder ruling
2026-09-06 in `ENCOUNTER_AND_PROJECTION`): do not map Self / Human / AI / Nature / World
one-to-one onto Elements; every encounter contains all five; (b) **no elemental score**: the Field
never assigns a dominant element, an intensity, or a confidence constant to the person (X8);
(c) the Field is a **bounded proving ground** for the Elemental parallel-processing hypothesis —
the one place where differentiated readings are deliberately kept alive long enough for the person
to encounter them — and a result inside the Field is evidence for the Field, not a claim about
the ordinary conversational engine.

## 6 · The arc — descent and return

```text
ENCOUNTER → STAY → DIFFERENTIATE → RECLAIM → CHOOSE → RETURN
```

The founder's five practice movements are DESIGN inputs placed on that arc:

1. **The disturbance** (Encounter / Stay) — start from something lived, never from a personality
   reading. *What happened? What did they do that affected you? What feeling or reaction is
   hardest to admit? What quality in them do you especially condemn — or envy?* Phenomenological
   throughout.
2. **The projection inquiry** (Differentiate) — MAIA gently opens possibilities: what this person
   may represent; where the quality lives in the member's own experience, even in a very different
   form; what would be difficult about admitting some version of it; whether the rejected quality
   is destructive or hides a healthy capacity. Always "one possibility…". The order of
   differentiation inherits the encounter-and-projection rule: what happened → what you
   experienced → what meaning it acquired → what it reminds you of → what may belong to the
   other → what may belong to your history → what remains unknown.
3. **Let the opposites coexist** (Differentiate, Aether) — the five elemental perspectives held
   simultaneously (§5); the tension is named, not resolved.
4. **Reclamation rather than eradication** (Reclaim) — not "how do I get rid of this?" but "what
   life-energy has become distorted because I could not consciously possess it?" Candidate doors,
   offered never assigned, the member says which has life in it:
   anger → boundary · envy → unlived desire · arrogance → unclaimed authority · neediness → longing
   for relationship · control → a frightened need for safety · passivity → refusal · judgment → a
   value not yet embodied.
5. **Take it outside MAIA** (Choose / Return) — every session ends here, and not with another
   MAIA conversation:
   *What do you now want to do differently? What needs expression rather than more
   interpretation? What belongs in a conversation with another person? What are you willing to
   embody? What remains genuinely unknown?*
   Candidate forms: say something normally withheld · establish a boundary · apologize · admit
   envy without acting it out · make something · ask someone a real question · notice the
   projection the next time it occurs · speak with a therapist, guide, partner or trusted friend ·
   embody the disowned quality in a safe, proportionate way.

Return is the measurement site for constraint 5 and the structural refusal of an introspective
dependency loop.

**Entry doors** (Dedicated Field; also the recognizable shapes of an Invoked request):

```text
PROJECTION            "Someone is really getting under my skin."
TRIGGER               "My reaction feels larger than what happened."
ENVY                  "Someone has something I can't stop thinking about."
RECURRING PATTERN     "I keep finding myself here."
DREAM / IMAGE         "Something strange keeps appearing."
DISOWNED GIFT         "There is something I want but judge myself for wanting."
RELATIONSHIP RUPTURE  "I can't understand why this relationship activates me so strongly."
```

## 7 · Memory covenant

Default: **shadow interpretations are session-bound unless the member explicitly chooses to keep
something.** At close MAIA asks, and the member selects — in the member's words:

```text
Leave this entirely here.
Remember the experience in my own words.
Remember a question I'm living with.
Remember a pattern I explicitly name.
Remember an integration practice.

NOT OFFERED, EVER:   "Remember MAIA's conclusion about my unconscious."
```

Worked form of the founder's example: MAIA never silently writes *"Kelly has a shadow around
authority."* It says: *"There was a theme around authority in this exploration. Do you want me
to remember that as something you're exploring, leave it only in this conversation, or phrase
it differently?"* Six months later, *"Actually, that wasn't about authority at all"* leaves the
earlier record as history and removes its present authority — the AUTHORITY_X_TIME rule
(supersession carried by the successor; nothing rewritten; nothing set by a timer).

This is the first member-facing implementation of **detect → ask → record** and therefore an
input to the Episodic Phase 2 spec, not a fork of it. Questions CONSTITUTE must answer, not
assume: what memory *class* an adopted item is (member-authored atom? a new provenance-tagged
class?); how the Field interacts with **Sanctuary** (a Sanctuary session inside the Field is
absolute — nothing adoptable, by the Sanctuary invariants; and X5 records that the Sanctuary
toggle is currently unreachable in conversation); and how the write-side `longterm` bypass (X4)
is kept out of the Field's write path structurally, not by instruction.

## 8 · SHADOW-01 — the flow

One persistent conductor (Jarvis), bounded stages, explicit gates. Each stage exits on a founder
act. **No code before the hard stop.**

**Re-sequencing (founder, 2026-09-06, at DISCOVER go).** The founder restated the sequence as
**DISCOVER → FALSIFY → CONSTITUTE → founder ratification → only then prototype**, with the
reason that DISCOVER must not decide its own conclusion before FALSIFY has done its job: the seven
laws stay a *candidate* constitution, prior art is recorded as *potential conflict with the
candidate laws*, and the failure tests are authored before the laws are ratified so the
constitution is disciplined by what would break it. FALSIFY therefore precedes CONSTITUTE; the
table below is read in that order. DESIGN was not placed in the restatement; this record assumes it
follows ratification and precedes the hard stop (design needs a ratified constitution; the stop
guards the prototype). If the founder intended DESIGN elsewhere, that is a one-line amendment.
The founder's opening constraint stands unchanged: **no "small harmless implementation" crosses the
hard stop.**

| Stage | Question | Outputs | Exit gate (founder act) |
|---|---|---|---|
| **DISCOVER** | What does MAIA already have that could participate, and what existing "shadow" code contradicts the laws? | read-only census of the prior-art register (§9): what is live / designed / dormant, what each asserts about the member, which candidate laws each appears to challenge (potential conflicts, not adjudicated — the laws are candidates until CONSTITUTE). Same discipline as the whole-organism map: paths, observation status, no repair. | founder accepts the census; names what is inherited, what is retired, what is quarantined from the Field |
| **CONSTITUTE** | What are the laws, and what must MAIA never do? | ratified law text (§2); operable negative form; epistemic-grammar reconciliation (§4); naming ruling (§1); memory-class and Sanctuary rulings (§7); which Sovereignty Invariants and principles the Field binds to | founder ratifies the constitution; any unresolved law → lane HOLDS |
| **DESIGN** | What is the member's journey? | both entrances; the arc with prompts per movement; elemental perspectives as questions; the close and its memory choice; Invoked-entry offer copy and its forbidden counterparts; a Field contract in the form of `docs/design/contracts/*` (arrival · gestures · forbidden here) | founder accepts the design as *designed*, not live |
| **FALSIFY** | How would we know MAIA broke a law? | pre-implementation failure tests, one per law at minimum: imposed interpretation · identity reinforcement · deepened dependence · manufactured trauma narrative · silent persistence of inferred material · autonomous entry · absent-person modeling · scalar collapse. Each names the detector (offline rater item, log marker, refusal test) and the refusal-registry entry it will become | founder ratifies the falsifiers as the acceptance instrument |
| **▌HARD STOP▐** | — | No prototype exists until FALSIFY, CONSTITUTE and DESIGN have each exited on a founder act. This is a stop, not a checkpoint. | explicit founder act to open PROTOTYPE |
| **PROTOTYPE** | Does a bounded surface obey the constitution? | a separate practice surface, **not** wired into ordinary MAIA conversation initially; falsifiers wired as tests; memory covenant enforced structurally; zero effect on `/list` cognition | falsifiers green; founder walk |
| **WITNESS** | What did a consenting person experience? | class C evidence under the Field Study ethics section and a consent design of its own: did it open perception · feel imposed · increase agency · transfer into life (Return is the site). Paired measures per `MEASUREMENT_VOCABULARY_v0.1` — never engagement | founder reads the witness; the witness is evidence, not truth about mechanism |
| **PROMOTE** | Should Shadow become a permanent Field / House capability? | decision record; only after evidence; whether the Field pattern (purpose · epistemology · boundaries · practices · memory rules · exit) becomes the template for Grief, Dream, Relationship, Creativity, Threshold, Purpose, Conflict | founder decides; promotion is a new act, not the end of this one |

**Lane stop conditions.** Any stage that would (a) enter the Field on system inference, (b) write
inferred shadow material to memory, (c) add a classifier or elemental score to the ordinary
conversational path, or (d) require CMT-01 M3 or any frozen lane to move — stops for a founder
ruling. A DISCOVER finding that looks like a one-line fix is recorded, not repaired.

## 9 · Prior-art register — for DISCOVER, not censused here

Pointers only. Presence of a path is not a claim about its state.

| Item | Path | Why it matters to the Field |
|---|---|---|
| Existing guided shadow flows | `lib/consciousness/shadowWorkFlows.ts` (495 lines; Recognition → Embodiment → Dialogue → Gold extraction → Integration; astrological house mapping; `suggestShadowFlow(context)`), callers `app/api/consciousness/shadow-work/route.ts`, `components/consciousness/ShadowWorkGuide.tsx` | closest prior art; carries a *system-suggested* flow (Entry Law) and house-keyed shadow (Invariant 14 / X14) — inherit, retire, or quarantine is a DISCOVER question |
| Shadow "progress" journal | `lib/features/ShadowIntegrationTracker.ts` (855 lines; "progress metrics", "measure transformation over time"), caller `app/api/elemental-alchemy/shadow/route.ts` | contradicts `ACCOMPANIMENT_MODEL` (no progress tracking, no growth mechanics) and the Dependency Law; Cat 4 candidate |
| Shadow detection for agent attunement | `lib/shadow-insight.ts` ("Not for user diagnosis"; `asymmetryScore`), caller `lib/agent-context.ts` | system-side inference about the member — exactly the pattern the Entry and Interpretive Laws forbid; must not feed the Field |
| Relational Navigation Room | `lib/maia/relationalNavigation/{prompts,types}.ts`, `app/api/maia/relational-navigation/route.ts`, `docs/specs/RELATIONAL_NAVIGATION_ROOM.md` | the Relational Law's source; the "returns authority at the close, every time" pattern; the Field's projection door is adjacent to this room and must not model the absent person |
| Now What? room grammar | `app/api/now-what/interview/route.ts` twelve disciplines, `lib/nowWhat/roomGrammar.ts`, `LIVED_RETURN_GROUNDING`, return prompt ("Not living something is information … never a failure") | evocation over compliance or diagnosis; the return-without-evaluation form the Field's Return inherits |
| Practice Field PF-1 and the canon posture | migration `20260701000001_practice_fields.sql`, `lib/practiceField/practiceFieldService.ts`; `docs/ACCOMPANIMENT_MODEL.md:153-185`; `docs/canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md` (Practice Fields as Developmental Ecology, not a rung) | whether a Field is a Practice Field, a House capability, or a new object; census 08 found "practice" names four unrelated substrates and no spec — the Field must not be a fifth unnamed one |
| Sanctuary | `lib/sanctuary/sanctuaryGuards.ts`, `lib/workbench/sanctuary.ts`; X5 defects | absolute boundary inside the Field; reachability defect is *not* this lane's to repair |
| Canonical turn + provenance | `lib/maia/canonical-turn/` (closed producer registry; practice-field/draft ALLOWLIST ruling; `[MAIA/shadow]` = CMT-01 construction, unrelated to this lane) | a Field prototype must not add an unregistered producer or reopen M3; a separate surface is the Invoked-entry question's hard part |
| Refusal registry | `tests/constitutional/refusal-registry/` (36 files; last numbered refusal-31) | FALSIFY outputs land here, numbered after the current tail at that time |
| Dreams / symbols | `lib/knowledge/DreamConversationWisdom.ts`; symbolic intelligence rows in the whole-organism census §14 (SOURCE-SHADOW = post-generation only) | the Dream/Image door; nothing here currently reaches cognition |
| Field Lab | `lib/maia/fieldLab/{experiments,shelf,governance}.ts` (relational-navigation · legacy-field · project-field) | the existing bounded-surface pattern PROTOTYPE would most likely reuse. **DISCOVER correction:** there is no tester flag, allowlist, or admission table — the bound is editorial (shelf membership + a validated `governingUncertainty` per room), not per-member |
| Epistemic tone spec | `docs/canon/MAIA_EPISTEMIC_TONE_SPEC_v1.0.md` | the four canonical registers §4 must reconcile with |
| Human-experience research corpus | `docs/research/human-experience/` on branch `claude/maia-human-experience-phase1-census`: `PROVISIONAL_PRINCIPLES_v0.1.md` (P1–P13, P4′), `ANTI_PATTERNS_v0.1.md`, `frameworks/encounter/ENCOUNTER_AND_PROJECTION_2026-09-06.md`, `frameworks/memory/AUTHORITY_X_TIME_2026-09-06.md`, `frameworks/elemental-experience/ELEMENTAL_PARALLEL_ARCHITECTURE_HYPOTHESIS_2026-09-06.md`, `measurements/MEASUREMENT_VOCABULARY_v0.1.md` | not yet on the default branch at lane opening; CONSTITUTE cites it by path and date, and retargets after that lane merges |

## 10 · Handoff — what the census lane records, in its own session

This lane does **not** write to `claude/maia-whole-organism-census-01` or
`claude/maia-human-experience-phase1-census`. The founder's ruling is that the census lane records
**one bounded Phase-2 opportunity and nothing else**. Proposed text, verbatim, for that lane's
own session to place in its register:

> **Member-led Shadow Field** — surfaced from census findings X1/X2 (undisclosed calibration,
> concealment), X3/X4/X7 (silent records, write-side bypass, no detect → ask → record), X8
> (scalar collapse before cognition), and ranked gap #2 (no "beyond the AI" instrument). Split
> to lane `MAIA-SHADOW-FIELD-01` (record:
> `docs/programme/MAIA-SHADOW-FIELD-01_LANE_DEFINITION_2026-09-06.md`). Must preserve
> interpretive authority, plural knowing, explicit memory consent, and beyond-the-AI transfer.
> No design or implementation in this lane.

## 11 · What this lane does NOT authorize at opening

- No code, migration, prompt, copy or route change. No branch other than this one.
- No classifier, detector, or elemental scoring on the ordinary conversational path — at any
  stage of this lane, including after PROMOTE.
- No touch on frozen or single-writer lanes: CMT-01 (M3 unauthorized, branch frozen), WS2-08
  (08B HOLD), Episodic Phase 2 (unauthored; this lane feeds it inputs, §7).
- No repair of census findings encountered during DISCOVER (X4, X5 included).
- No member-facing survey or witness collection before WITNESS opens with its own consent design.
- No claim above its rung: at opening the Shadow Field is **Designed-in-intent, not Designed**;
  it becomes Designed at the DESIGN exit and Live only after WITNESS.

## 12 · Sovereignty check at lane level (answered, not passed)

- **Agency** — increases it by construction: entry, interpretation, memory and exit are all member
  acts; MAIA's authority is bounded to offering doors.
- **Outward** — Return is mandatory and outward-facing; the Dependency Law makes capacity outside
  MAIA the success condition.
- **Reduces MAIA's centrality over time** — a session that ends in an apology, a boundary, a
  conversation with a friend or a therapist has moved the work off the platform.
- **Invariant 14 / cultural sovereignty** — "shadow", "projection", "archetype" are one lineage's
  vocabulary; the Field offers them as one language ("in Jungian language, this could
  resemble…") and preserves the member's own words for anything remembered. Whether the
  vocabulary is imposed is a FALSIFY item.
- **Growth obligation** (capability increase → matching provenance, restraint, transparency):
  *uncertainty preserved* by the UNKNOWN register and the Plurality Law; *provenance and
  ownership* by the six-register grammar and the adoption-only memory covenant; *new
  responsibility* — a Field that invites people to their most disowned material owes them a
  safe exit, a clear "what MAIA is and is not" at arrival (P12), and the failure boundaries
  of `docs/canon/MAIA_FAILURE_BOUNDARIES_v1.0.md` where a single reading must be acted on (P11 exception).

## 13 · Next act

```text
DONE      DISCOVER — CLOSED / ACCEPTED; founder dispositions in census §12
DONE      FALSIFY — CLOSED / ACCEPTED; Acceptance Instrument v1 in FALSIFY §7 (F1–F16)
DONE      CONSTITUTE decisions D1–D6 — RULED (CONSTITUTE record §9)
DONE      CONSTITUTE — CLOSED / RATIFIED (v0.2; C1, C2; naming; F12 PASS)
NOW       DESIGN — drafted (MAIA-SHADOW-FIELD-01_DESIGN_2026-09-06.md + docs/design/contracts/shadow-field.md); awaiting founder
          acceptance → the Field is *Designed* → ▌HARD STOP▐ → PROTOTYPE only on an explicit founder act
THEN      FALSIFY → CONSTITUTE → founder ratification → DESIGN → HARD STOP
NOT       any code, repair, migration, rename, prototype, or retirement decision
```
