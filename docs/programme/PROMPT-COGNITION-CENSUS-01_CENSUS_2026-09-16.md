# PROMPT-COGNITION-CENSUS-01 — SOURCE-GROUNDED CENSUS

**Status:** COMPLETE · READ-ONLY · STOP AFTER THIS RECORD
**Subject:** canonical `e0adfb1bad8e780bc90311063bb909bdaf09c1a2`
**Opening:** `b959bc48eee2693c8704cf53d61431795df627b0`
**Date:** 2026-09-16

## 1. Governing question

> Of everything presently injected into MAIA's prompt, what genuinely requires token-resident cognition every turn, and what can instead operate structurally without occupying the cognitive aperture?

This is a source census, not an ablation result. `structural candidate` means only that source shape does not establish a need for standing token residency. It is not removal authority.

## 2. First architectural finding: there is no single MAIA prompt

FAST, CORE, and DEEP are materially different cognitive environments.

- FAST constructs `baseSystemPrompt` directly in `lib/sovereign/maiaService.ts:1603+`.
- CORE uses `buildMaiaWisePrompt()` (`lib/sovereign/maiaVoice.ts:572+`) and then appends further material afterward (`maiaService.ts:2005+`).
- DEEP-primary uses `consciousnessWrapper.processConsciousnessEvolution()` rather than the shared FAST/CORE prompt seam; consultation is separately gated; regeneration uses `buildMaiaComprehensivePrompt()`.

Therefore an every-turn cognition claim must be tier-specific.

## 3. Source-determinable standing burden

Approximate tokens use `chars / 4` only as a rough comparative measure.

| Object | Chars | ~tokens | Current residency |
| --- | ---: | ---: | --- |
| Expanded `MEMORY_AUTHORITY_BLOCK` | 3,672 | 918 | FAST standing |
| `MAIA_RELATIONAL_SPEC` | 1,614 | 404 | FAST + CORE/repair |
| `MAIA_LINEAGES_AND_FIELD` | 2,828 | 707 | FAST + CORE/repair |
| `MAIA_CENTER_OF_GRAVITY` | 401 | 100 | FAST + CORE/repair |
| Expanded `MAIA_RUNTIME_PROMPT` | 22,954 | 5,738 | FAST standing |
| `PLATFORM_KNOWLEDGE_ADDENDUM` | 14,559 | 3,640 | FAST + CORE/repair standing |
| `MEMORY_SPEECH_ACT_BOUNDARY` | 1,300 | 325 | CORE/repair standing |
| `PLATFORM_KNOWLEDGE_BOUNDARY` | 1,224 | 306 | CORE/repair standing |
| `INTERFACE_HUMILITY_GUARDRAIL` | 833 | 208 | CORE/repair standing |

**FAST source-determinable static floor:** `46,028 chars ≈ 11,507 rough tokens`.

**CORE source-determinable static floor:** `22,759 chars ≈ 5,690 rough tokens`.

Both are floors. They exclude turn-specific identity, mode, time, scaffolding, recent conversation, A6, relationship memory, retrieved memory, elemental/field context and other conditional additions.

## 4. Standing/base classification

| Object | Source | Classification | Source-grounded reason |
| --- | --- | --- | --- |
| MAIA relational role / center | `MAIA_RUNTIME_PROMPT.ts:27,113` | **cognition-required (functional)** | Some role/relational orientation must reach the model for MAIA-specific free-form generation. Source does not prove both current blocks are independently necessary. |
| `MAIA_LINEAGES_AND_FIELD` | `MAIA_RUNTIME_PROMPT.ts:68` | **uncertain / overlapping** | Rich lineage/context may affect quality, but source alone does not establish every-turn necessity. |
| `MEMORY_AUTHORITY_BLOCK` identity portion | `maiaService.ts:203+` | **duplicative/overlapping** | Identity is also carried by MAIA specs and protected after generation by identity scrubber / identity-predicate guard. |
| `MEMORY_CANON_GUARD_PROMPT` | `memoryCanonGuard.ts:47+` | **conditional cognition + duplicative** | Relevant to memory posture; FAST injects the exact guard twice: once through `MEMORY_AUTHORITY_BLOCK`, once inside expanded `MAIA_RUNTIME_PROMPT`. |
| expanded `MAIA_RUNTIME_PROMPT` | `MAIA_RUNTIME_PROMPT.ts:123+` | **duplicative/overlapping · uncertain** | Contains identity boundary, relational examples, rupture/repair, calibration, conversational conventions, integrative-alchemy prompt and memory guard. Source does not establish that the whole ~22.9k chars must be resident every FAST turn. |
| full Platform Knowledge map | `platformKnowledge.ts:71-197` | **structural candidate / conditional cognition** | It is a static house map (~14.6k chars) but is injected on unrelated FAST and CORE turns as standing context. Source gives no every-turn requirement. |
| Memory Speech-Act Boundary | `maiaVoice.ts:520+` | **structural candidate** | Governs save/keep claims. It is currently standing prose even on turns with no persistence speech act. |
| Platform Knowledge Boundary | `maiaVoice.ts:483+` | **structural candidate / conditional cognition** | Governs platform/account-state claims; source scope is narrower than every conversational turn. |
| Interface Humility | `maiaVoice.ts:507+` | **conditional cognition / structural candidate** | Governs interpretation of signals; overlaps later validator rules on imposition/certainty. |
| Temporal context | `maiaVoice.ts:96+` | **conditional cognition** | Time/date awareness can matter, but source does not establish every-turn relevance. |
| Awareness-language adaptation | `maiaVoice.ts:572+` | **conditional cognition** | Generated from detected awareness level; dynamic behavioral guidance. |
| Tone block | `maiaVoice.ts:~880+` | **duplicative/overlapping** | Standing style guidance overlaps role/mode/runtime voice rules. |
| Talk mode block | `maiaVoice.ts:787+` | **conditional cognition** | Dialogue-only; 2,181 chars (~545 rough tokens). Explicitly promotes inquiry/questions. |
| Counsel mode block | same switch | **conditional cognition** | Counsel-only; 1,076 chars. |
| Scribe mode block | same switch | **conditional cognition** | Scribe-only; 456 chars. |
| Recent conversation | `buildMaiaWisePrompt()` history section | **cognition-required when relevant** | Direct evidence needed for local continuity; exact 3/4/5 aperture is not established here as optimal. |
| Relationship memory | `buildMaiaWisePrompt()` | **conditional cognition** | Injected only when loaded; not standing by definition. |
| User identification | `maiaService.ts:2024+` | **conditional cognition / compensatory** | Source explicitly says it prevents contamination from prompt examples naming Kelly. One prompt object exists partly to repair another. |
| Cognitive scaffolding | `maiaVoice.ts:~285+` + service | **conditional cognition** | Only when cognitive level exists; explicitly instructs upward Socratic movement. |
| Policy adaptation | service tier paths | **conditional cognition** | Applied when policy exists. |
| Field intelligence addendum | service tier paths | **conditional cognition** | Appended after field-context build succeeds. |

## 5. `ADDENDA_SPECS` classification

All 28 registered addenda are injected only when their corresponding `MaiaContext` field is non-empty (`maiaVoice.ts:434-546`). Therefore none is source-supported as universally standing cognition.
| Addendum field | Classification | Note |
| --- | --- | --- |
| `sessionContinuityAddendum` | **conditional cognition** | A6 self-location; only meaningful when session history exists. |
| `placeAddendum` | **conditional cognition** | Current-room orientation. |
| `relationshipModeAddendum` | **conditional cognition** | Relational-depth guidance. |
| `governorAddendum` | **conditional cognition** | Posture guidance/constraints. |
| `guestContextAddendum` | **conditional cognition** | Guest-only context limitation. |
| `journalContextAddendum` | **conditional cognition** | Journal context only when present. |
| `captureContextAddendum` | **conditional cognition** | Capture context only when present. |
| `astrologicalContextAddendum` | **conditional cognition + duplicate risk** | Same astrology source is appended again manually in CORE via `meta.astrologyAddendum`. |
| `spiralSnapshotAddendum` | **conditional cognition** | Computed spiral state only when supplied. |
| `wuxingSnapshotAddendum` | **conditional cognition + duplicate** | Shared helper + manual CORE append. |
| `bridgeSnapshotAddendum` | **conditional cognition** | Spiral × Wu Xing bridge only when supplied. |
| `therapeuticFrameworkAddendum` | **conditional cognition** | Mode/lens-specific. |
| `reflectionLensAddendum` | **conditional cognition** | Reflection-lens-specific. |
| `epistemicPathAddendum` | **conditional cognition** | User-chosen epistemic lens. |
| `maiaModeAddendum` | **conditional cognition + duplicate** | Shared helper + manual CORE append. |
| `scribeSessionDiscussionAddendum` | **conditional cognition + duplicate** | Shared helper + manual CORE append. |
| `studioAddendum` | **conditional cognition + duplicate** | Shared helper + manual CORE append. |
| `knowledgeGateAddendum` | **conditional cognition / uncertain structural candidate** | Source-well modulation; whether it belongs in routing rather than prompt requires successor evidence. |
| `memberWebAddendum` | **conditional cognition** | Patterns/summaries/journals only when supplied. |
| `consultationAddendum` | **conditional cognition** | Council synthesis only when supplied. |
| `fieldWisdomAddendum` | **conditional cognition** | Collective field material only when supplied. |
| `conversationalRecallAddendum` | **conditional cognition** | Cross-session primary/recalled material. |
| `episodicRecallAddendum` | **conditional cognition** | Member-marked episodes only when supplied. |
| `atomsAddendum` | **conditional cognition** | Member-placed / practitioner-observed atoms only when supplied. |
| `divinationIntentAddendum` | **conditional cognition** | Member-authored divination intent. |
| `divinationCastAddendum` | **conditional cognition** | System-computed cast under member invocation. |
| `divinationInterpretationAddendum` | **conditional cognition** | House-authored interpretation. |
| `relationalContextAddendum` | **conditional cognition** | Explicit member handoff from Relationships. |

No addendum row above is authorization to alter or remove the carrier.

## 6. Additional conditional prompt objects outside `ADDENDA_SPECS`

FAST/CORE also carry prompt material through direct interpolation or post-builder append paths, including user identification, mode adaptation, time awareness, cognitive scaffolding, relationship context, Selflet context, Sanctuary instructions, wisdom routing, knowledge-field material, practice-field context, memory-influence / forward-readiness blocks, state-vector contract, youth support context and field-orchestrator context.

Classification: **conditional cognition** unless otherwise noted. Their presence depends on turn state, mode, identity, route, or feature context; source does not support counting them as universal every-turn necessities.

## 7. Validator / post-generation cognition and shaping

| Mechanism | Source | Classification | Effect |
| --- | --- | --- | --- |
| Socratic Validator | `maiaService.ts:696+`, `socraticValidator.ts:60+` | **validator/post-generation** | Checks five rule layers; CORE/DEEP may regenerate through another model call. |
| Mode-language filter | `maiaService.ts:339+` | **validator/post-generation** | Deterministically replaces short mode-inappropriate greeting responses. |
| Selflet delivery guard | `maiaService.ts:420+` | **validator/post-generation** | Ensures required past-self acknowledgment appears. |
| Output sanitization / state-vector stripping | `maiaService.ts:2847+` | **validator/post-generation** | Removes blocked/internal material at final mouth layer. |
| Presence-mode constraints | `presenceMode.ts:157+`, funnel at `maiaService.ts:2861+` | **validator/post-generation** | Can convert questions to statements and remove advancement language. |
| Identity-predicate guard | final funnel | **validator/post-generation** | Reframes system-authored identity assertions. |
| Identity/memory disclaimer scrubber | `maiaService.ts:271+`, final use `4343+` | **validator/post-generation** | On match, can replace the entire answer with a generic MAIA identity/continuity response. |
| AIN shape rewrite | `maiaService.ts:4230+` | **validator/post-generation / conditional second cognition** | When enabled and shape fails, may invoke another model call to rewrite menu-shaped output. |

## 8. Significant duplication / interaction findings

### F1 · FAST exact memory-guard duplication

`MEMORY_CANON_GUARD_PROMPT` is present twice in the FAST standing prompt:
1. composed into `MEMORY_AUTHORITY_BLOCK` (`maiaService.ts:203-238`), and
2. interpolated inside expanded `MAIA_RUNTIME_PROMPT` (`MAIA_RUNTIME_PROMPT.ts:470`).

This is exact standing duplication, not semantic resemblance.

### F2 · CORE duplicate addendum injection

`buildMaiaWisePrompt()` injects every non-empty registered addendum through `appendAllContextAddenda()` (`maiaVoice.ts:928-933`). After that builder returns, CORE manually appends five of those same inputs again when present:
- `maiaModeAddendum`;
- `scribeSessionDiscussionAddendum`;
- `wuxingSnapshotAddendum`;
- astrology (`astrologicalContextAddendum` built from `meta.astrologyAddendum`, then the same `meta.astrologyAddendum` appended manually);
- `studioAddendum`.

The source therefore supports literal double residency for these contexts on affected CORE turns.
### F3 · CORE regeneration changes cognitive environment

The first CORE generation receives `buildMaiaWisePrompt()` **plus** manual post-builder additions. If the Socratic Validator requests regeneration, the repair path rebuilds through `buildMaiaWisePrompt()` and policy adaptation, then adds the repair prompt — but does not replay the full post-builder sequence.

Therefore validation can produce a second model pass with a materially different context from the pass it is repairing.

### F4 · Prompt machinery creates compensating prompt machinery

The CORE user-identification block explicitly says it exists to prevent name contamination from system-prompt examples that mention Kelly. This is direct source evidence that one prompt-resident object is required partly to counteract another prompt-resident object.

### F5 · Inquiry pressure is represented in multiple layers

Talk mode directs “conversational inquiry” and “elegant questions”; cognitive scaffolding supplies upward Socratic questions; Interface Humility prefers checking interpretations with the member; the Socratic Validator can request repair around imposition/certainty. Separately, Presence-mode egress can suppress questions and advancement language.

This establishes multiple independent forces acting on initiative/questioning. It does **not** establish that they cause the observed loss of gestalt; causal attribution belongs to replay/ablation, not this census.

### F6 · Identity and memory posture are multiply protected

Identity/memory behavior is represented in standing prompt prose, forbidden-pattern guards, a final identity-predicate guard, and an identity/memory disclaimer scrubber. The scrubber may replace a full generated response with a generic MAIA response.

Again: overlap is established; which layer can safely leave cognition is not.
### F7 · DEEP does not share the same standing cognition

DEEP-primary uses the local consciousness wrapper and a 5-exchange history aperture. Claude consultation is separately gated and disabled by default; if enabled it receives recall addenda and the 5-exchange slice. DEEP regeneration, however, enters `buildMaiaComprehensivePrompt()` and the shared addenda channel.

So DEEP-primary and DEEP-repair are distinct cognitive environments. A global statement such as “this block is always in MAIA's cognition” is false unless proven separately per seam.

## 9. Smallest source-supported every-turn cognition

The source does **not** support a lawful claim that any existing large prompt bundle, whole platform map, full runtime prompt, or all standing boundaries must occupy cognition every turn.

The narrowest functional set source evidence supports is:

1. **A MAIA role / relational center** — some non-duplicative representation of who is speaking and the relational stance. Source does not establish which current combination is minimal.
2. **The present member utterance.**
3. **Relevant immediate conversational evidence** when the turn depends on prior context.
4. **Turn-specific facts or laws only when the present turn actually requires them**, unless later ablation proves a particular standing rule must remain resident to prevent a failure that cannot be enforced structurally.

Items 2–3 are cognition content, not necessarily system-prompt prose. Item 4 is deliberately conditional.

This census cannot reduce the floor further without behavioral ablation, because source inspection can identify overlap and scope mismatch but cannot prove that removing an instruction leaves behavior intact.

## 10. Unresolved questions / required falsifiers

This lane does not answer these; it records what a successor experiment would have to discriminate.

- **Q1 — Platform map:** Does removing standing Platform Knowledge from unrelated conversational turns change lawful behavior when no platform question is asked?
- **Q2 — Runtime bundle:** Which parts of the expanded FAST `MAIA_RUNTIME_PROMPT` materially contribute to relational quality, and which merely duplicate other role/mode/validator obligations?
- **Q3 — Inquiry pressure:** Does removing one or more overlapping inquiry/scaffolding directives restore synthesis without increasing imposition or reducing useful curiosity?
- **Q4 — Identity/memory:** Which prompt-resident identity/memory rules remain necessary once deterministic final guards are held constant?
- **Q5 — CORE duplicate injection:** Does single versus double injection materially change output, or only consume tokens?
- **Q6 — regeneration divergence:** Can the same draft be regenerated under a composition identical to its first pass, and does that change repair quality?
- **Q7 — tier equivalence:** What is the minimum lawful cognitive floor shared across FAST/CORE/DEEP, if any?
- **Q8 — context budget:** How does response quality change when static instruction burden is traded for relevant conversational evidence while total model context remains fixed?

These are falsification questions, not implementation authority.

## 11. Architectural finding

The source establishes that constitutional machinery, platform knowledge, behavioral direction, memory context, and conversational evidence presently compete inside overlapping and tier-divergent cognitive surfaces. It also establishes several exact duplications and several post-generation protections that overlap obligations expressed in prompt prose.

The source does **not** establish that prompt pressure causes MAIA's perceived loss of gestalt. That remains a hypothesis for controlled replay/ablation.

## 12. STOP

`PROMPT-COGNITION-CENSUS-01` is complete with this record.

No prompt edit, consolidation, aperture change, memory change, gestalt generation, summarization, implementation experiment, or production act is authorized by this census.

Required sequence remains:

`census → architectural finding → governance of gestalt → only then implementation`.
