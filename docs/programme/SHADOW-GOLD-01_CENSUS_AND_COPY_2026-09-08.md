# SHADOW & GOLD — `SHADOW-GOLD-01` · CENSUS + AUTHORED COPY

**Date** 2026-09-08 · **Status** ⛔ **CENSUS + RECORDED COPY. NOTHING BUILT. NOT AUTHORIZED.**

---

## 1 · The authored member copy — recorded verbatim, founder-authored

> ### Shadow & Gold
> *Ourselves Reflected*
>
> Shadow & Gold is a space for exploring parts of yourself that may be easier to see through your
> reactions to other people, relationships, dreams, conflicts, attractions, and recurring patterns.
>
> **Shadow does not mean "bad."** It means something may have been left outside the version of
> yourself you learned to identify with.
>
> And sometimes what has been left out is not darkness at all. It may be confidence, creativity,
> authority, tenderness, desire, play, or some other quality you have difficulty recognizing as your
> own. This is sometimes called the **golden shadow**.
>
> **You might come here when…**
> · someone affects you much more strongly than you understand
> · the same relationship pattern keeps repeating
> · you feel unusually irritated, fascinated, jealous, ashamed, or drawn to someone
> · a dream or image stays with you
> · you notice a quality in another person that you deeply admire or reject
> · you sense there is something in yourself you have not fully met
>
> **What MAIA does here**
> MAIA will help you explore, **not diagnose you**. She may help you notice patterns, ask questions,
> consider projection, or look at what an encounter might be revealing about you.
>
> **But the other person remains real.** Not everything is a projection, and MAIA will not reduce
> someone who hurt, loved, challenged, or inspired you to "just a mirror."
>
> The guiding question is simply: ***What of me might be becoming visible through this encounter?***
>
> You decide what resonates, what belongs to you, and what does not.
>
> **MAIA holds the lantern. You decide where to look.**
>
> **Begin** — bring a person, reaction, dream, conflict, attraction, recurring pattern — or simply say:
> *"I want to explore something through Shadow & Gold."*

**Placement direction (founder):** a **visible Shadow & Gold card/Field in MAIA**, not hidden inside
general conversation, with a simple **Explore Shadow & Gold** entry. MAIA may **recognize** an explicit
request (*"Can we do shadow work?"*) and **offer** to enter the Field — ⛔ **never silently interpret
the conversation through it.** ⭐ **It should be in the House.**

---

## 2 · ⚠️ THREE FINDINGS FROM THE CENSUS — read before designing

### 2.1 ⭐⭐ "House" already denotes TWO different things, and shadow work is bound to the OTHER one

| | |
|---|---|
| **the navigation House** | `components/maia/MaiaHouseSheet.tsx` — *"one quiet doorway opens the whole world"*, governed by a **NAVIGATION CONTRACT (2026-07-27)** |
| **the astrological house** | `SacredHouseWheel.tsx` · `TraditionalHouseWheel.tsx` · `HouseDeepDiveSheet.tsx` · migration `20260522000004_house_system_porphyry_default` — houses **1–12** |

⭐ **The existing shadow substrate is keyed to the ASTROLOGICAL house**: `lib/consciousness/shadowWorkFlows`
exports **`generateHouseShadowFlow`**, and `/api/consciousness/shadow-work` takes `?house=1-12`.

> ⛔ **"Put Shadow & Gold in the House" is therefore ambiguous in the codebase's own vocabulary.** The
> founder means the **navigation doorway**. An implementer reading `generateHouseShadowFlow` could
> reasonably conclude otherwise. **This is the `FieldPhase` / `CircleConstitutionState` collision
> (CA-14) in a third location** — same strings, different questions, no compiler help.

### 2.2 ⚠️ "Shadow" also already denotes an auth defect, not a practice

`app/api/__tests__/practitionerShadowContainment.test.ts` is **AUTH-01-D3** — *practitioner **shadow**
authority containment*, where "shadow" means a **duplicate route-local `getMemberFromRequest` shadowing
the hardened module**. ⛔ **Nothing to do with shadow work.** Recorded so a future session does not read
it as prior constitutional governance of this practice — it is not.

### 2.3 ⭐ A shadow-work substrate ALREADY EXISTS, and its status is unestablished

`lib/consciousness/shadowWorkFlows` · `/api/consciousness/shadow-work` ·
`components/consciousness/ShadowWorkGuide.tsx` · `ShadowWorkSheet.tsx` ·
`app/api/_backend/src/agents/ShadowAgent.ts` (a **live Corpus Callosum voice**, per the anchor) ·
`shadowWorkModule.ts` · `spiralogic_kb/shadow_evolution.json` · `app/dashboard/shadow` ·
`app/api/elemental-alchemy/shadow` · `app/labtools/parts-shadow`.

⛔ **Whether these are live, dormant, or Cat 3/4 is NOT established by this census** — that is a
read-only classification act nobody has performed.

> ⚠️ **This is the I0 "Commons denotes three things" pattern repeating.** Building Shadow & Gold fresh
> **or** adopting/renaming existing substrate is a **real fork with a real cost either way**, and it
> must not be decided by whichever file an implementer opens first.

---

## 3 · The navigation contract Shadow & Gold would be entering

`MaiaHouseSheet` is explicit: every destination comes from **one authoritative model**,
`lib/navigation/houseDestinations`, **dispatched by kind** — native route · member sheet · web bridge.

> *"That is what stops the registry, the mobile allowlist, and the native bundle from drifting apart
> and producing silent white screens on iPhone."*

⛔ So adding a House card is **not** adding a card. It is a registry entry **plus** a dispatch kind
**plus** allowlist/bundle agreement. The known failure mode is a **dead button on iPhone**.

Also load-bearing, and already true of the House: *"No new data, no persistence, no inference; opening
the House is a member act."*

---

## 4 · Constitutional bindings the copy already satisfies

| copy | binding |
|---|---|
| *"help you explore, **not diagnose**"* | Canon — no guru stance, no diagnosis, no authority |
| *"**the other person remains real** … not just a mirror"* | ⭐ guards against **interpretive displacement**; the strongest line in the piece |
| *"**You** decide what resonates, what belongs to you"* | member sovereignty over meaning; facts may be derived, **meaning is declared** |
| *"MAIA holds the lantern. **You** decide where to look."* | Interface Humility (Invariant 16) |
| **golden shadow** | refuses the pathologizing frame — what was left out may be confidence, play, authority |
| **explicit entry; offer, never silently interpret** | ⭐ the **no-ambient-appropriation** shape (FR-06's logic, one domain over) |

---

## 5 · Two questions the copy does not yet answer

### D-S1 · ⭐ What happens to material about a third party who never consented?

Shadow & Gold invites a member to bring **a person** — *someone who hurt, loved, challenged or inspired
you.* That produces MAIA-held content **about a named third party who has no account, no consent, and
no standing here.**

- Does it enter long-term memory, or is Shadow & Gold **Sanctuary-shaped by default**?
- The lane's own doctrine is relevant: **an interest declaration is an act against nobody** — but
  *"here is what I think is really going on with my brother"* **is not**.

⛔ Not decided. **This is the first question, ahead of any build.**

### D-S2 · Does the invitation to look at projection become a way to dismiss a real grievance?

The copy already guards it (*"not everything is a projection"*). ⚠️ The residual is **behavioural, not
copy**: under what conditions does MAIA **decline** to read an encounter as projection — for example
where a member describes harm? *A lantern pointed at the wrong thing is still a lantern.*

---

## 6 · Standing

```
SHADOW-GOLD-01     CENSUS + AUTHORED COPY RECORDED
FORK               build fresh vs adopt existing substrate — OPEN (§2.3)
D-S1 · D-S2        OPEN
IMPLEMENTATION     NOT AUTHORIZED
HOUSE REGISTRY     UNTOUCHED
```

⛔ Nothing built · no registry entry · no route · no component · no schema.

---

# ADDENDUM I — FOUNDER RULING TEXT (D-S1, D-S2) · D-S3 OPENED · AUDIT FRAME
**2026-09-08 · authored by founder act · ⚠️ D-S1 and D-S2 stand as READY FOR RATIFICATION, NOT RATIFIED.**

⛔ Jarvis does not promote a ruling to ratified. The founder's standing block names both as
`READY FOR RATIFICATION`; the text below is recorded as authored so that ratification, when it
occurs, is an act against a fixed text rather than a re-drafting.

## D-S1 · Third-party containment — READY FOR RATIFICATION

> **Shadow & Gold may contain a member's reflections about another person, but it may not convert
> those reflections into knowledge about that person.**

```text
member says:
"I think my brother is terrified of intimacy"

VALID RECORD
Kelly reflected that he experiences his brother as withdrawing around intimacy.

INVALID DERIVATION
Brother -> afraid of intimacy
Brother -> attachment style X
Brother -> shadow pattern Y
```

The third party may exist as a **referent inside the member's authored experience**. They do not
thereby become a **subject of MAIA's knowledge**.

Consequences:
- ⛔ no third-party psychological profile created from Shadow & Gold;
- ⛔ no inferred traits, diagnoses, motives, archetypes, shadow material, or memory atoms about them;
- ⛔ no later retrieval that silently converts attribution into fact;
- ✅ MAIA may explore the member's reaction, meaning, attraction, anger, fear, projection, or history;
- ✅ MAIA should resist invitations to explain the unconsenting person's hidden psychology.

An explicit **Keep** of a Shadow & Gold reflection may preserve what the member said or discovered
about **their own experience**. ⛔ That does not authorize extracting claims about the other person
into general memory.

**Core law:** *Reflection about another person remains knowledge of the member's experience, not
knowledge of the other person.*

⭐ This closes the most dangerous storage path **without pretending members can never talk about
people in their lives.**

## D-S2 · Grievance outranks projection — READY FOR RATIFICATION

Stronger than a tone guideline:

> **A projection hypothesis may never be used to reduce the standing of a reported external harm,
> violation, or grievance.**

Where a member describes concrete harm — coercion, abuse, betrayal, intimidation, exploitation,
boundary violation, violence, manipulation, stalking, or similar conduct — MAIA **first treats that
as an account of something that happened between people.**

⛔ It does not answer `"Perhaps this is really your shadow."` or `"What are you projecting onto
them?"` as a **reinterpretation of the event**.

Inside Shadow & Gold the inward question is **parallel, never corrective**:

```text
OUTWARD
What happened?
What did they actually do?
What boundary or response is needed?

INWARD - only if the member wants this lens
What is this encounter stirring in you?
What of yourself becomes visible through it?
```

**One does not cancel the other.** This preserves the line already in the member paper:
*what we meet is not only ourselves.*

⭐ Closed with an **anti-invalidation rule**, ⛔ **not** a taxonomy of situations in which projection
is permitted.

## D-S3 · Voice custody — OPEN, AND CARRIED **BEFORE** THE FORK

The standing MAIA invariant:

```text
MAIA                  = member-facing host voice
specialists/agents    = internal consultation
```

⛔ Shadow & Gold must not become:

```text
Member
  |- MAIA
  \- Shadow Agent
```

✅ It must remain:

```text
Member
   ^
   v
 MAIA
   ^
   v
internal Shadow & Gold consultation
```

*The member may enter a distinct Field; the host does not fragment into personas.*
⭐ Carried **before** the fork because it materially changes what "adopt existing substrate" means.

### Source findings bearing on D-S3 (read-only, this session)

**S3-F1 · `ShadowAgent` denotes TWO different implementations.**
`app/api/_backend/src/agents/ShadowAgent.ts` (registered in `voiceProfiles.ts:51` as
`ShadowAgent: "shadow_agent"`, mapped `AgentRole.ELEMENTAL` in `agentRoleMapping.ts:47`) **and** a
separate class `ShadowAgent` in `lib/maia/complete-agent-field-system.ts:298` (`name = "Shadow"`,
`frequency = 288`, keyword detector over `ashamed | hide | secret | can't say | denied`),
instantiated at `:604`. ⚠️ A fourth same-string collision in this lane.

**S3-F2 · ⭐ THE SUBSTRATE ALREADY DETECTS PROJECTION SILENTLY, AND EMITS CONTENT.**
`app/api/_backend/src/services/agentOrchestrator-shadow-integration.ts` calls
`processExtendedQuery()`, branches on `response.metadata?.shadowActivated`, carries a
`reasoning: 'No projection detected'` default, and on activation returns
`{ content: response.content, response: response.content, metadata }` (`:56-79`).
⛔ **This is the behaviour the founder's placement direction excludes** — *MAIA offers to enter the
Field on explicit request rather than silently interpreting the conversation through it.* The
existing path interprets first and decides afterwards whether to speak. ⚠️ Whether that content
reaches a member today is **NOT established here**; what is established is that the **mechanism is
built and wired into the orchestrator**, so "adopt" would inherit it.

**S3-F3 · A per-agent voice profile exists for `shadow`.**
`voiceProfiles.ts:116` gives `shadow` its own TTS entry with distinct settings
(`stability 0.7 / similarity_boost 0.9`). ⚠️ **Precisely:** the `voiceId` is currently *identical*
to `narrator` and the transcendent profile (`LcfcDJNUP1GQjkzn1xUU`), so the divergence today is
**settings-level, not a different speaker**. The hazard is structural rather than currently audible:
**a populated per-agent voice slot is the mechanism by which an internal consultation acquires a
member-facing voice**, and a different voice in the member's ear is attribution whether or not a
name is rendered.

**S3-F4 · `member` is already overloaded.**
`lib/services/decisionPersistenceService.ts:34` declares `member: string; // "shadow_agent",
"cbt_agent", "dream_agent"` — in the deliberation record a *"member"* is an **agent**, not a person
(weights at `:510` and `deliberationPersistenceService.ts:295`). ⛔ Do not let Shadow & Gold
architecture inherit this word in that sense.

**Open, unanswered by these findings:** *does `ShadowAgent` output ever reach the member attributed
as `ShadowAgent`?* Settling it requires tracing the orchestrator's response assembly to a
member-facing surface, which was not done here. ⛔ Not asserted either way.

## Audit frame for the fork (replaces all-or-nothing)

After D-S1, D-S2 and D-S3, the existing substrate is audited **against them** and split:

```text
REUSE               generic mechanics that already obey the new laws
ADAPT               useful machinery currently bound to astrology
RETAIN SEPARATELY   astrological-house shadow work that is genuinely astrology-specific
RETIRE / CONTAIN    interpretive or voice behavior incompatible with Shadow & Gold
BUILD FRESH         the member-facing Field / House doorway where no safe substrate exists
```

⭐ Better than an all-or-nothing "reuse the shadow system" decision.

## Naming discipline (founder direction)

```text
MAIA House        navigation / member doorway
Astrology House   houses 1-12
```

⛔ **No generic `House`** in new Shadow & Gold architecture where the distinction matters.

## Standing

```text
SHADOW-GOLD-01

CENSUS                 COMPLETE
D-S1                   READY FOR RATIFICATION
                       third-party reflection != third-party knowledge
D-S2                   READY FOR RATIFICATION
                       grievance/harm cannot be invalidated by projection
D-S3                   OPEN
                       ShadowAgent member-facing voice custody
FRESH vs ADOPT         HOLD
HOUSE CARD / ROUTING   HOLD
SCHEMA                 UNCHANGED
IMPLEMENTATION         NOT AUTHORIZED

I0.5                   UNCHANGED / DEPLOY LANE HELD
```

> ⭐ *Shadow & Gold becomes a field for self-inquiry without becoming a machine for psychoanalyzing
> absent people — or explaining away what actually happened to someone.*

---

# ADDENDUM II — D-S1 AND D-S2 RATIFIED · D-S4 OPENED AND CENSUSED
**Founder ratification act · 2026-09-08**

⭐ **D-S1 and D-S2 are no longer candidate language.** They are **constraints that any future
Shadow & Gold design — memory, retrieval, prompts, consultation, and Keep semantics — must satisfy.**
The ruling text recorded in ADDENDUM I is promoted **unchanged** from `READY FOR RATIFICATION` to
`RATIFIED`; ⛔ nothing in it was re-drafted at ratification.

## D-S1 · Third-party containment — **RATIFIED**

> **Reflection about another person remains knowledge of the member's experience, not knowledge of
> the other person.**

```text
PERMITTED
member-authored experience
member's interpretation
member's reaction
member's remembered encounter
member's own insight arising from that encounter

NOT PERMITTED
third-party psychological profile
third-party diagnosis
inferred motives stored as fact
third-party archetype/shadow attribution
memory atoms asserting inferred traits about the other person
later retrieval laundering member attribution into system knowledge
```

*A third party may remain a **referent** inside the member's experience without thereby becoming a
**subject** of MAIA's knowledge.*

## D-S2 · Anti-invalidation — **RATIFIED**

> **A projection hypothesis may never be used to reduce the standing of a reported external harm,
> violation, or grievance.**

Where a member reports coercion, abuse, betrayal, intimidation, exploitation, manipulation, boundary
violation, violence, stalking or comparable harm, MAIA **first preserves the reality-status of the
reported encounter.** The inward lens is **parallel, never corrective**; neither inquiry cancels the
other.

> *What we meet is not only ourselves.*

⛔ **Shadow & Gold must never become a mechanism for explaining away harm by telling a member the
problem is "really their projection."**

---

# D-S4 · LEGACY SILENT-PROJECTION REACHABILITY CENSUS
**Opened by founder 2026-09-08 · read-only census run same day · ⛔ nothing modified**

**Question:** is the pre-existing silent projection-detection path (S3-F2) reachable in production?

## ⭐ FINDING — IT IS NOT REACHABLE. IT IS CAT 3, NOT CAT 6.

`agentOrchestrator-shadow-integration.ts` lives under `app/api/_backend/`. Two independent facts
place it outside every deployed surface:

```text
NEXT APP ROUTER
  find app/api/_backend -name route.ts   ->  0 files
  it exposes no Next route at all

maia-api CONTAINER  (docker-compose.production.yml, dockerfile apps/api/Dockerfile)
  COPY apps/api/ ./          <- only apps/api is copied
  CMD ["node", "dist/index.js"]
  no reference to _backend or server-minimal anywhere under apps/api/
```

The module is mounted only by `app/api/_backend/src/server-minimal.ts` (`app.use('/api/orchestrator',
orchestratorRoutes)`) and `src/routes/index.ts` — an **Express application that no production compose
service builds.**

> ⭐ **The silent projection detector is built, wired to an orchestrator, and served by nothing.**
> **Cat 3 — built substrate, zero live callers.** It cannot be reached by a member today; it would
> become reachable the moment "adopt the existing substrate" wired it to a live route. **That is
> exactly the fork's hidden cost, now measured rather than assumed.**

## ⚠️ FIFTH COLLISION — `ShadowConversationOrchestrator` IS NOT SHADOW WORK

`lib/consciousness/ShadowConversationOrchestrator.ts` is **agent backchanneling** — its own header:
*"Explicit orchestration layer for sophisticated agent backchanneling… Shadow layer communication
between agents during member interactions."* Marked `@ts-nocheck - Prototype file`.

⚠️ **It IS imported by a live App Router route** — `app/api/empowerment/orchestrate/route.ts`. So a
naive D-S4 sweep on the string `shadow` would have reported *"shadow work is reachable from a live
route"* — **a false positive that would have inverted the fork decision.** ⛔ Record this: the word
`shadow` now denotes **five** distinct things in this codebase (shadow work · the AUTH-01-D3 variable
shadowing defect · the astrological-house shadow flow · agent backchanneling · disposable shadow
databases).

## Not established — stated as unresolved, not as absence

- `lib/maia/complete-agent-field-system.ts` (the **second** `ShadowAgent` class) has importers, but
  all are themselves `lib/` orchestrators, demos and phase controllers
  (`MaiaOrchestrator`, `resonance-field-shadow-runner`, `phase3-sunset-controller`,
  `phase4-field-dominance`, `telesphorus-demo`, `self-auditing-orchestrator`,
  `ResonanceFieldOrchestrator`). ⛔ **Reachability from a live member route was NOT established.**
- ⚠️ `CLAUDE.md` records `ShadowAgent` as one of eight **live** Corpus Callosum voices producing
  `agent_runs` rows under production traffic. **Which `ShadowAgent` produces those rows is
  unresolved** — it is neither of the two paths ruled out above by these checks. ⛔ **Do not read
  this census as "the shadow substrate is dormant."** It establishes precisely one thing: **the
  silent projection-detection path is not reachable in production.**

## D-S4 standing

```text
D-S4  CENSUSED, NOT CLOSED
      silent projection path        NOT REACHABLE (Cat 3)
      lib/maia ShadowAgent          reachability NOT ESTABLISHED
      live Corpus Callosum voice    identity UNRESOLVED
```

## SHADOW-GOLD-01 standing

```text
D-S1    RATIFIED    third-party reflection != third-party knowledge
D-S2    RATIFIED    projection may not invalidate reported harm/grievance
D-S3    OPEN        voice-custody findings established, disposition pending
D-S4    OPEN        censused above; two questions remain

FRESH vs LEGACY     HOLD
HOUSE UI / ROUTING  HOLD
SCHEMA              UNCHANGED
IMPLEMENTATION      NOT AUTHORIZED
```

---

# ADDENDUM III — D-S4 RESOLVED AT CODE LEVEL · OUTCOME C
**Read-only census, 2026-09-08 · ⛔ nothing modified · no production read required to reach this**

## The chain, end to end

```text
agent_runs  <-  lib/services/corpusCallosumService.ts:120  logAgentRun()
                THE ONLY WRITER anywhere in the tree

imports:        ../db/postgres · ../sanctuary/turnPosture
                ⛔ NEITHER ShadowAgent implementation

agent_name:     input.agentName — A CALLER-SUPPLIED STRING
                'MythicAtlas' · 'MaiaVoice' · 'WisdomRouter' are literals in the service;
                every other row arrives as agent.agentName from the caller (:435, :460)

'shadow' here:  an ELEMENT UNION VALUE
                'fire'|'water'|'earth'|'air'|'aether'|'shadow'  (:51, :229)
                mapped to 'relational' (:303), and explicitly distinguished from the
                "classical five" (:505-508)

live caller:    app/api/sovereign/app/maia/list/route.ts
                ⛔ imports NEITHER ShadowAgent implementation
```

## ⭐ THE DECISIVE FINDING — `agent_runs` CANNOT ATTRIBUTE AN IMPLEMENTATION

D-S4 asked *which implementation produces production `agent_runs` rows attributed to ShadowAgent.*

> **The row does not carry that information.** `agent_name` is a **string the caller chose**, not a
> record of what executed. A row reading `ShadowAgent` proves only that **a caller passed that
> string** — it is not evidence that either `ShadowAgent` class ran.

⛔ **Attribution must come from the call site, never from the ledger.** And at the call site, the
live route imports neither implementation.

## Disposition: OUTCOME C

```text
A. silent-projection ShadowAgent      RULED OUT — not imported by the writer or the live route
B. complete-agent-field ShadowAgent   RULED OUT — same
C. another implementation / stale documentation   ✅ THIS ONE
```

⚠️ **`CLAUDE.md`'s Corpus Callosum bullet lists `ShadowAgent` among eight live voices.** What is live
is a Corpus Callosum voice **whose `element` is `'shadow'`** — ⛔ **not the `ShadowAgent` class**, of
which there are two and neither is on the live path. The documentation names a class where the
runtime has an **element label**.

⛔ **NOT CORRECTED HERE.** That bullet is a **Cat 6 liveness claim**; amending it changes the live
runtime inventory and is a founder act, not a lane edit. **Flagged, not changed.**

**Optional confirming production read** (read-only, narrow, no longer load-bearing):

```sql
SELECT DISTINCT agent_name, element FROM agent_runs
WHERE created_at > NOW() - INTERVAL '30 days' ORDER BY 1;
```

It would show which **names** appear — useful for correcting the documentation. ⛔ It cannot, and
need not, identify an implementation.

## ⚠️ SIXTH MEANING OF "SHADOW"

Every `shadow` hit in the live route is **CMT-01 shadow-mode canonical-turn construction**
(`MAIA_CANONICAL_SHADOW`, `[MAIA/shadow]`, `cognitionPath: 'shadow'`) — shadow **deployment**, a
sixth distinct sense:

```text
1 shadow work                    5 shadow databases (disposable verification)
2 AUTH-01-D3 variable shadowing  6 CMT-01 shadow-mode evaluation
3 astrological house/shadow
4 agent backchanneling
```

⛔ **A string-level `shadow` census is not a valid instrument for anything in this codebase.**
Semantic classification precedes every routing conclusion.

## ⭐ THE SAME LESSON, THIRD TIME TODAY

```text
self-registering migrations   the runner already owned insertion
checksum column               created "for future compatibility", never written
agent_name                    a caller-supplied string, not an execution record
```

⚠️ **REFINED BY FOUNDER RULING, 2026-09-08.** An earlier Jarvis form read *"evidence of the write,
**never** of the thing the write describes."* ⛔ **"Never" goes too far** — a ledger *can* be evidence
of an underlying event when its writer is **structurally bound to observing** that event.

**The ratified law:**

> ***A ledger is evidence only for facts its writer actually observes or is structurally constrained
> to encode. A field's name does not grant it provenance its write path does not establish.***

```text
migration filename   -> proves the runner recorded that filename
checksum = NULL      -> proves no checksum was recorded
agent_name           -> proves a caller supplied that name
                        NOT that a class with that name executed
```

## D-S4 standing

```text
D-S4  RESOLVED AT CODE LEVEL — OUTCOME C
      silent-projection path     Cat 3, not reachable (ADDENDUM II)
      neither ShadowAgent class  on the agent_runs write path
      CLAUDE.md liveness claim   REQUIRES FOUNDER CORRECTION (flagged, not made)
      closure                    founder act
```

## SHADOW-GOLD-01 standing

```text
D-S1    RATIFIED
D-S2    RATIFIED
D-S3    OPEN — voice custody; ⭐ materially eased: neither ShadowAgent is member-facing
                today, because neither is on the live path at all
D-S4    RESOLVED AT CODE LEVEL (Outcome C) · closure = founder act

FRESH vs LEGACY     HOLD — ⭐ the legacy case is now weakest it has been:
                    the relevant paths are unreachable AND unattributed
HOUSE UI / ROUTING  HOLD
SCHEMA              UNCHANGED
IMPLEMENTATION      NOT AUTHORIZED
```


---

# ADDENDUM IV — D-S4 CLOSED · CLAUDE.md CORRECTED · D-S3 REFRAMED
**Founder rulings, 2026-09-08**

## D-S4 — CLOSED

**Outcome C, sharpened:** ⭐ **stale documentation / label-to-class conflation.**

> *We did not find a mysterious third `ShadowAgent`. We found that **the premise of the attribution
> question was invalid**.*

```text
silent-projection path      CAT 3 / NOT LIVE
complete-agent-field class  NOT ON LIVE PATH
agent_runs                  NOT IMPLEMENTATION PROVENANCE
Outcome                     C — STALE DOC / LABEL CONFLATION
production query required   NO
status                      CLOSED
```

⛔ The optional `SELECT DISTINCT agent_name, element` could inventory current **labels**, but cannot
improve the implementation-attribution proof — **not a closure condition.**

## `CLAUDE.md` Cat 6 correction — MADE (lane branch)

⛔ **Attribution only.** The Corpus Callosum substrate is **NOT downgraded from Cat 6**; production
frequency observations and preserved unknowns are untouched. ⛔ Not a redesign.
Canonical landing remains its own PR/merge act.

## Jarvis correction carried

⚠️ The earlier `zsh`-error attribution was **Jarvis's and was wrong** — those shell errors were not
produced by this lane. ⛔ **That claim must not be carried into any record.** Nothing in
SHADOW-GOLD-01 touched production.

## D-S3 — REFRAMED, and now the last question before the fork

D-S4's closure changes what D-S3 must answer. It is **no longer a liveness question** — neither
implementation is member-facing, because neither is on the live path at all. It is a
**custody/content question**:

> **Is there anything in either legacy `ShadowAgent`'s authored logic, language, or psychological
> stance that deserves preservation as SOURCE MATERIAL for Shadow & Gold — independent of adopting
> its code?**

⭐ *Adopting a stance is a different act from adopting a substrate.* Whatever survives that reading
must still satisfy **D-S1** and **D-S2**, which are now ratified constraints, not candidates.

```text
D-S1  RATIFIED   D-S3  OPEN — the remaining pre-fork question
D-S2  RATIFIED   D-S4  CLOSED — Outcome C

FRESH vs LEGACY  HOLD      SCHEMA          UNCHANGED
HOUSE UI         HOLD      IMPLEMENTATION  NOT AUTHORIZED
```

---

# ADDENDUM V — D-S3 CLOSED · SOURCE WITHOUT ANCESTRY
**Founder ruling, 2026-09-08 · reading bound to exact ref `4111f72ec`**

## ⭐ THE RULING

> **MAIA remains the sole member-facing host voice in Shadow & Gold. No legacy `ShadowAgent`
> receives a member-facing persona, voice claim, or implementation authority.**
>
> **Legacy `ShadowAgent` material may be preserved as SOURCE MATERIAL without creating ANCESTRY.
> What survives must first pass D-S1 and D-S2.**

**PRESERVED:** non-shaming hospitality toward disowned material · member-initiated inquiry into one's
own participation · respect for protective defenses · timing and safety before interpretation ·
golden-shadow inquiry as an **optional** lens · mirroring without judgment.

**REJECTED:** automatic projection detection · projection-as-invalidation · third-party psychological
knowledge · "victim consciousness" · system-assigned awareness rank · defense circumvention · hidden
inward routing · a separate Shadow persona · unsupported energetic/frequency claims · any claim to
know unspoken material.

> ⭐⭐ **Preservation does not create implementation ancestry. A rejected substrate may contain
> worthwhile authored material; harvesting that material does not rehabilitate its authority.**

## ⚠️ CUSTODY CORRECTION

An earlier description of `lib/maia/complete-agent-field-system.ts` as a larger trauma/autonomic
`ShadowAgent` was **stale or misattributed**. At the D-S3 subject ref, that path holds the **thin
Telesphorus `ShadowAgent`**: a keyword detector (`ashamed|hide|secret|can't say|denied`), a random
intensity, and terse phrases. ⭐ **The exact-file reading governs; the stale description does not.**

⚠️ *Record-accuracy note, not a challenge:* the reject list names "174 Hz mythology"; the file at this
ref carries `frequency = 288`. The rejection of **frequency mythology** is unaffected — noted only so
a future reader is not confused by the number.

## The two substrates, disposed

**`_backend/.../ShadowAgent.ts` — STANCE REJECTED, selected source retained.** It treats grievance
language (`they always/never` · `toxic/narcissist` · `they made me feel` · `hate`) as **evidence for
projection**, assigns an awareness stage, and turns the inquiry inward. ⛔ **Exactly what D-S2
forbids.** Its formulations — *own the shadow rather than project it* · *not out there, in here* —
make the incompatibility **structural, not cosmetic**. ⛔ Not repairable by changing prompts.

**`lib/maia/complete-agent-field-system.ts` — HOSPITALITY RETAINED, PERSONA REJECTED.** Its real
contribution is tone, not analysis. The seed worth keeping:

> **Nothing the member brings has to pass a goodness test before it can be met.**

⚠️ Even its better phrases need translation: *"Your darkness belongs here too"* **essentializes** a
person as having darkness; *"I hear what you can't say"* **claims access to material never
communicated**. The safe inheritance is the **hospitality, not the literal voice** —
*what you're reluctant to show can be brought here too, if you want to.*

## Standing

```text
D-S1               RATIFIED
D-S2               RATIFIED
D-S3               CLOSED — SOURCE WITHOUT ANCESTRY
D-S4               CLOSED — Outcome C

legacy code        NO AUTHORITY GRANTED
legacy stance      NOT ADOPTED
legacy source      BOUNDED MATERIAL PRESERVED

FRESH vs LEGACY    READY FOR ADJUDICATION · STILL HOLD
HOUSE UI           HOLD
SCHEMA             UNCHANGED
IMPLEMENTATION     NOT AUTHORIZED
```

⛔ **D-S3 does not turn the fork green for FRESH.** It removes the last reason the fork had to treat
*preserve useful legacy thinking* and *adopt legacy implementation* as one choice. ⭐ **They are now
formally separate acts.**

---

# ADDENDUM VI — CONSTITUTIONAL WORK COMPLETE · THE FORK TEST, PINNED
**Founder, 2026-09-08 · ⛔ not an adjudication; the criteria the adjudication will run against**

D-S1…D-S4 **no longer travel with the fork as unresolved questions.** The fork now asks only:

> **Does any existing legacy machinery reduce implementation cost without importing rejected
> semantics, hidden assumptions, or unnecessary coupling?**

```text
LEGACY machinery may be ADAPTED only if:
  1. its mechanics are independently useful,
  2. its rejected psychological stance can be cleanly removed,
  3. adaptation is cheaper/safer than a fresh implementation,
  4. it does not acquire authority merely because source ideas were preserved,
  5. it satisfies D-S1 / D-S2 / D-S3 after adaptation.

Otherwise:
  FRESH wins by ECONOMY, not IDEOLOGY.
```

⭐ **The inverse matters equally: *"legacy is bad" is not yet a ruling.*** Unreachable code carrying a
rejected stance can still contain a useful **generic mechanism**. ⛔ D-S3 deliberately prevented the
constitutional findings from **prejudging the engineering question** — criterion 4 is the guard in
the other direction, and *"FRESH wins by economy, not ideology"* is the guard in this one.

## Standing

```text
D-S1  RATIFIED    D-S3  CLOSED
D-S2  RATIFIED    D-S4  CLOSED

CONSTITUTIONAL WORK   COMPLETE

FRESH vs LEGACY       READY FOR ADJUDICATION · HOLD
HOUSE UI              HOLD
SCHEMA                UNCHANGED
IMPLEMENTATION        NOT AUTHORIZED

production            891b33ee0
I0.5                  CLOSED
canonical PR          OWED for the three promoted laws
```

⛔ **Nothing moves until the fork adjudication or the canonical-landing act is opened.**
