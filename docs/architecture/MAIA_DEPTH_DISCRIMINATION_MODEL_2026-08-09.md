# MAIA Depth Discrimination — evidence and proposed model (Gate 3 pre-work)

**Date:** 2026-08-09 · **Status:** ⛔ **PROPOSAL — no routing or threshold change is authorized by this document.** Returned for founder review per the Gate 3 clarification.
**Directive:** AIN's member population is depth-oriented; DEEP is not an edge-case capability. Near-zero DEEP execution is evidence the eligibility model is misaligned with product intent. Do not lower a threshold — re-evaluate what the system means by depth.

---

## Part I — What the router currently means by "depth" (evidence)

All routing lives in `lib/consciousness/processingProfiles.ts`; single entry `chooseProcessingProfile` (`:49`), called from `lib/sovereign/maiaService.ts:2778-2786`.

**There are exactly two doors into DEEP:**

1. **Explicit phrases** (`:107-119`), substring-matched: *take me deeper · go deep with me · go as deep as you can · i want to go deep · shadow work · guide me into the shadow · help me with my trauma · take me into the roots · ritualize this · let's do a ritual · initiation work*.
2. **`looksLikeCoreWound && relationshipDeveloped`** (`:133-138`): message length **> 700 chars** AND one of six stock phrases (`:124-131` — *pattern that keeps repeating · i always end up · no matter what i do · core wound · deepest fear · i don't want to keep living this way*) AND **turnCount ≥ 5**.

Plus one cognitive upgrade: CORE→DEEP if `fieldWorkSafe && textLength > 400` (`:263-268`), where "field-safe" means a rolling **Bloom-taxonomy** average ≥ 4.0 with low bypass frequencies (`cognitiveProfileService.ts:95-96`).

**The structural finding**: to reach DEEP a member must either **speak the system's own vocabulary** (ritual/shadow/trauma jargon) or **already score Bloom ≥ 4.0 and write 400+ characters**. Depth of *content* is never measured — only depth of *vocabulary* and *length*. That is why the tier is empty: it is not that members lack depth; it is that the router cannot see any depth that does not announce itself in the system's own words.

### Forms-of-depth gap table

| Form of depth | Recognized? | Evidence |
|---|---|---|
| Emotional | **No** | no affect predicates exist; *anxiety/panic/depression* route to CORE (`:180-182`) |
| Relational | **No** | *relationship/family/partner/marriage* are CORE keywords (`:183-186`) — a CORE ceiling |
| Developmental / transformational | **No** | *healing/transformation* are CORE keywords (`:195-196`) |
| Existential | **No** | *meaning/purpose* are CORE keywords (`:178-179`) |
| Grief / loss / transition | **No predicate exists at all** | "died", "death", "grief", "loss" appear in no list in the file |
| Symbolic / imaginal | **Negative-partial** | only via system jargon (*ritualize this*); dreams unrecognized (`dreams: false // layer not wired`, `maiaService.ts:2895`) |
| Sustained self-reflection | **Only** via the 700-char + stock-phrase + turn-count combination |
| Creative depth | **No** | no predicate |
| Consequential decisions | **No** | *don't know what to do* → CORE (`:198`) |
| Longitudinal significance | **No** | the router never receives memory or history; `lastDepth` is defined but never passed by the caller (`maiaService.ts:2778-2785`) |

### The simple-language / high-depth traces (what the router does today)

| Utterance | Route | Why |
|---|---|---|
| "My father died this morning." | **FAST** (turnCount < 3) → CORE later | 29 chars, ends in `.`; "father" is not a keyword ("family" is); bereavement has no predicate |
| "I don't know if I love him anymore." | **FAST** early / CORE later | 35 chars; no matching keyword |
| "Something in me has changed." | **FAST** early / CORE later | 28 chars; no predicate for transformation-in-progress |
| "I keep having the same dream about the house." | **FAST** early / CORE later | no dream predicate; doesn't match *pattern that keeps repeating* |
| "I think I need to leave my job but I'm terrified." | **CORE**, never DEEP | matches *job* (`:188`) — a life-transition decision routed as a work topic |

A bereavement disclosure can route **FAST**. This is the finding that most directly contradicts product intent.

### The down-regulators remove capacity without changing stance

DEEP→CORE caps fire on low cognitive altitude (`avg < 2.5`, `:240-244`) and on bypassing (`spiritualBypass > 0.4 || intellectualBypass > 0.4`, `:247-252`). Both **only reassign the profile string and rewrite a `reasoning` field** that is logged (`maiaService.ts:2794`) and **never reaches any prompt**. The promised behaviors — "structured guidance," "grounding before deep work" — have no implementation. So the cap does exactly what the founder clarification forbids: it removes depth capacity rather than changing how MAIA meets the person. (Ironically, the Bloom scaffolding that *would* ground the response lives inside `deepPathResponse` — the lane the cap just removed.)

### What DEEP actually buys today

- **Primary lane**: `consciousnessWrapper.processConsciousnessEvolution` raced against a **4.5s timeout** (`maiaService.ts:2048-2053`); on timeout the response is the hardcoded stub *"I'm here with you. Let's explore what you're bringing."* (`:2064`). No prompt seam exists; provider is recorded as `unknown/consciousness-wrapper`.
- **Consultation lane**: flag-gated **off by default** (`MAIA_USE_CLAUDE_CONSULTATION === 'true'`, `:2080-2082`). When on, it now carries the Gate 1 recall addenda.
- **Repair lane**: full addenda via `buildMaiaComprehensivePrompt` → `appendAllContextAddenda`, but fires only on Socratic regeneration.

**Therefore, as deployed: DEEP-primary carries no member memory in any prompt.** With consultation off, a DEEP turn gets a timeout-raced local wrapper or a stub — *minus* the recall CORE would have given. The tier that should be most relationally situated is the least, and being routed there is currently a downgrade.

---

## Part II — Proposed model (for review, not implementation)

### Principle

**Processing depth may add capability; it may never subtract relationship.** DEEP is not a different MAIA — it is the same MAIA, who remembers the same things, given more room to integrate.

### 1. Architecture: CORE as foundation, DEEP as a layer

Restructure `deepPathResponse` so it **builds the CORE prompt** (the `corePathResponse` assembly: `buildMaiaWisePrompt` + `appendAllContextAddenda`, `maiaService.ts:1560-1589`) and **appends a deep-integration block**, instead of entering the separate `consciousnessWrapper` lane. The DEEP-repair lane already proves this works — the same builders run with DEEP's context today (`maiaVoice.ts:1044`).

`consciousnessWrapper` demotes from *response of record* to an **optional pre-pass whose output feeds the prompt** (a synthesis input, not a spoken answer). Kept: relationship memory, elemental instrumentation, Socratic validation. Gained: real provider tracking (currently `unknown`) and — the point — every memory layer CORE has. Lost: nothing member-visible; the stub disappears with the lane that produced it.

This makes the tiers: **FAST** = lightweight ordinary interaction · **CORE** = relational foundation · **DEEP** = CORE + integration capacity.

### 2. Depth signals — ten, replacing "jargon or length"

Each signal is evidence *that this moment asks for room*, never a classification of the person. Signals are recognized in ordinary language, and **length is never a gate**.

| # | Signal | Recognized by (sketch) |
|---|---|---|
| D1 | **Loss / grief / mortality** | bereavement and mortality language in plain words ("died", "funeral", "she's gone", "diagnosis", "hospice") |
| D2 | **Relational rupture or reappraisal** | doubt/ending/change-of-feeling about a named relationship ("don't know if I love", "we've grown apart", "she stopped speaking to me") |
| D3 | **Consequential decision under stakes** | decision framing + stakes/fear ("need to leave", "I have to choose", "terrified") |
| D4 | **Self-in-transformation** | change predicated of the self, not of circumstances ("something in me has changed", "I'm not who I was") |
| D5 | **Existential inquiry** | meaning/mortality/purpose asked as a question about one's life, not as a topic |
| D6 | **Symbolic / imaginal** | dreams, recurring images, symbols the member brings unprompted |
| D7 | **Sustained self-reflection** | reflective density across the current session — several consecutive inward turns, regardless of individual length |
| D8 | **Creative work in progress** | making something and struggling with it |
| D9 | **Longitudinal significance** | *from memory, not the utterance*: this touches a member-kept atom, a marked episode, an unresolved thread, or a superseded/corrected understanding |
| D10 | **Explicit invitation** | the member asks for depth in any words — the current jargon list is a subset |

**D9 is the one that requires the router to change shape**: it must receive the already-loaded memory context (atoms, marked episodes, correction state) that the route computes *before* generation. Today the router is content-only. This is also the signal most aligned with the founder's framing — significance arising from accumulated history rather than the current utterance alone.

### 3. Eligibility rule (proposed)

DEEP when **any single D1–D6 or D10 signal is present**, or **two or more of D7–D9**. No length threshold anywhere. No requirement that the member use system vocabulary. Cognitive altitude is **removed as a DEEP gate entirely** — it measures intellectual complexity, which is not depth.

### 4. Down-regulators become response-shaping, not capacity-removing

Low altitude and bypassing stop being DEEP→CORE demotions. They become a **grounding modifier carried into the DEEP prompt**: stay closer to lived experience, less interpretive expansion, concrete over symbolic, shorter. The member still gets the depth lane — with a MAIA who meets them plainly. (This finally implements what the current `reasoning` strings only promise.)

### 5. Cost and safety notes

DEEP becoming normal has real cost: it is the slowest lane (6–20s) and the most expensive. Two mitigations to evaluate before implementation: (a) DEEP-as-CORE-plus-layer is *cheaper* than today's DEEP because it drops the racing local wrapper; (b) the elemental/Corpus Callosum instrumentation on DEEP can stay sampled rather than universal. Safety unchanged: `fieldWorkSafe` continues to govern *field work* specifically — that is a distinct question from whether the conversation deserves depth, and this proposal keeps them separate.

---

## Part III — Representative test corpus (proposed acceptance set)

Every case is scored on route **and** on whether member memory reached the prompt. "Simple language, real depth" is the spine of the corpus.

**Must route DEEP (simple language):** "My father died this morning." (D1) · "I don't know if I love him anymore." (D2) · "Something in me has changed." (D4) · "I keep having the same dream about the house." (D6) · "I think I need to leave my job but I'm terrified." (D3) · "What's the point of any of it." (D5) · "She hasn't spoken to me in a year." (D2) · "I'm scared of the scan on Thursday." (D1)

**Must route DEEP (longitudinal, D9):** an ordinary-looking message that touches a member-kept atom or a marked episode — e.g. "I went back to that place we talked about" where the earlier material exists in memory. Same sentence with an empty memory field: CORE. *This pair is the D9 proof.*

**Must NOT route DEEP:** "what's the weather" · "thanks, that helps" · "can you fix this bug" · "remind me what I said about the invoice" · a long technical paste with no self-reference (length must not promote) · "shadow work" used as a topic label by a member asking a factual question (jargon must not auto-promote).

**Down-regulator cases:** a D1 utterance from a member with low rolling altitude → **DEEP with grounding modifier**, never CORE · a D5 utterance with high spiritual-bypass score → **DEEP, grounded and concrete**, never CORE.

**Continuity cases (the hard principle):** every DEEP route above must be asserted to carry — conversational recall, atoms, episodic marks, correction/supersession state (Gate 1), member web. A DEEP turn that renders less memory than the equivalent CORE turn is a **failure**, regardless of response quality.

**Regression:** the corpus runs against the live router and the live prompt assembly, not mocks.

---

## Part IV — Sequencing and open questions

**Sequencing:** this proposal is Gate 3 pre-work. Gate 2 (unified authority-aware context assembly) should land first if the DEEP restructure is to inherit one governed contract rather than re-implementing addenda handling — otherwise Gate 3 rebuilds what Gate 2 is about to standardize.

**Open questions for founder ruling:**
1. **Cost posture** — if DEEP becomes normal for a depth-oriented population, what share of turns is acceptable? (Today: ~0%. The proposed rule could plausibly reach 15–30% for this population; that is a product decision, not an engineering one.)
2. **D9 scope** — should longitudinal significance be able to route DEEP *by itself*, or only in combination? Routing on memory alone means the system decides depth from its own record rather than from the member's present act.
3. **Does the `consciousnessWrapper` keep any role?** The proposal demotes it to an optional pre-pass; retiring it entirely is also defensible and simpler.
4. **Latency honesty** — DEEP is 6–20s. Should the member be told MAIA is taking more time, and if so how (a surface question, not a routing one)?

*Nothing here is implemented. Routing, thresholds, and the DEEP lane are unchanged pending review.*
