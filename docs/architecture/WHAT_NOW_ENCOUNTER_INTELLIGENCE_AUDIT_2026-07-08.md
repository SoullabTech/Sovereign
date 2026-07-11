# What Now? Room — Encounter Intelligence Audit

**Date:** 2026-07-08
**Question audited:** *Not "can MAIA do this?" but "exactly what context is assembled before the LLM call, and is the room calling MAIA as MAIA — or calling a narrow interview route?"*
**Method:** Three independent read-only code traces (LLM provider internals; Spiralogic/facet wiring; full-stack vs. room context contrast). No redesign performed. This is a report.

---

## Verdict (one line)

**The room is not blocking MAIA because MAIA lacks ability. It is blocking MAIA because it is not calling MAIA as MAIA — it calls a bespoke thin route that assembles a static local prompt + the transcript, and nothing else.** This is Kelly's hypothesis #3, confirmed, with a #2 flavor: even the Spiralogic the room *does* touch is the thin keyword version, not the rich facet registry that already exists.

---

## 1. What `generateSimple()` adds — nothing (the load-bearing fact)

`lib/consciousness/LLMProvider.ts` → `generateSimple()` is a **pure passthrough**. It sends the caller's `systemPrompt` (as a plain `system` string) and `messages` (only trailing-assistant turns trimmed) straight to the model. No base constitutional preamble, no memory retrieval, no persona/voice, no tools, no RAG.

**Consequence:** there is no hidden MAIA layer that appears underneath the room. **Whatever `/api/now-what/interview` assembles is the entire world the model receives.** All enrichment is the caller's responsibility.

Per-tier model (production default, `LOCAL_TIER_ENABLED` off): `fast`→`claude-haiku-4-5`, `core`→`claude-sonnet-4-6`, `deep`→`claude-opus-4-6`. The room uses `core` for turns, `deep` for propose. (Ollama path, if ever enabled, drops multi-turn history — a latent trap, not active in prod.)

---

## 2. What `/api/now-what/interview` assembles (Path B — the room)

Total import surface: auth helpers, `getLLMProvider`/`ensureUserTerminal`, and `inferSpiralogicCell`. That is all.

Before the model call it assembles:

- **System prompt** — built inline in this file: `TWELVE_DISCIPLINES` + `RESPONSE_GRAMMAR` + one `PHASE_LENS` line + `HARD_LIMITS`. All hardcoded. **≈ 770 tokens, static.**
- **Messages** — only the current session transcript (`sanitizeHistory`, ≤40 turns) + at most one synthetic user turn.
- **Cross-session continuity** — only `returningPractice`, a ≤300-char string passed *from the client*. **Zero server-side retrieval.**
- **Cell inference** — `detectCellCandidate()` runs `inferSpiralogicCell` on the member's text and returns a `cellCandidate` to the browser (it tints the holoflower). **It is never injected into the prompt.**
- **Persistence** — none. The route is ephemeral (writes happen only via the separate `field-note` route, on explicit member gesture).

The model's entire world per turn ≈ **~770-token static prompt + the transcript.** Nothing about *this member* enters except what they typed in this session.

---

## 3. What the main MAIA route assembles (Path A — the reference)

Entry `app/api/sovereign/app/maia/list/route.ts` → `getMaiaResponse()` in `lib/sovereign/maiaService.ts`. System prompt = `MAIA_RUNTIME_PROMPT` (constitutional/persona base) **plus ~25 addenda**, drawing from:

- Constitutional/persona identity (`MAIA_RUNTIME_PROMPT`)
- Memory bundle: cross-session turns, bullets, relationship snapshot (encounter + breakthrough counts)
- Memory atoms (Layer 5), breakthrough flags (Layer 10), memory health (Layer 15)
- Developmental memories, theme signals, influence plan; prior cross-session exchanges; forward readiness
- Relationship anamnesis/essence; member live context; cognitive profile + field-safety gate
- Astrology; Wu Xing/BaZi; Practice Field context
- **Corpus Callosum**: parallel elemental agents (Fire/Water/Earth/Air/Aether) + MythicAtlas + MaiaVoice + Shadow, traced to `agent_runs`/`integration_passes`

Order-of-magnitude: Path A's assembled context is **many thousands of tokens** of member-specific + constitutional + multi-agent material. Path B is ~770 static tokens. That gap *is* the felt difference between "a relationship" and "a form."

---

## 4. The Spiralogic / 12-facet finding (this is the sharp one)

The rich architecture **exists in runtime code — richer than the room uses:**

- `lib/consciousness/spiralogic-core.ts` (~1,900 lines) defines `COMPLETE_ELEMENTAL_FACETS_REGISTRY` — all 12 facets, each with archetypal image, core function, developmental theme, **shadow pattern, gold medicine**, language cues, "MAIA's job," and canonical questions.
- **None of that descriptor richness reaches inference.** The room injects only a one-line phase *lens* + the disciplines + grammar.
- `inferSpiralogicCell` is **keyword matching, single-cell, fixed 0.7 confidence** (the code comment itself says "in production this would use LLM classification"). It returns *one* cell and defaults to Fire when nothing matches. Its confidence number is cosmetic.
- **There is no hypothesis layer.** Nothing forms multiple simultaneous weighted facet hypotheses (your perceptual-field model). Nothing lets MAIA notice "Earth/stewardship and Air/relationship are both alive here" and *choose* what to explore.
- "Great Interviewer" exists only as the `TWELVE_DISCIPLINES` string in the prompt — a covenant, not a reasoning layer.

So Spiralogic today **drives** (a fixed phase selects a lens; a keyword picks a cell to tint the UI) rather than **perceives** (a field of weighted facet hypotheses informing MAIA's attention). The framework is elegant; it is wired to the wrong altitude.

---

## 5. Where MAIA's agency is constrained — classified

**A — Constitutional (intentional; must remain):**
- Ephemeral; no memory written without an explicit member gesture (Sanctuary/consent). *Reconnecting memory **retrieval** does not violate this — retrieval ≠ write.*
- MAIA proposes; the participant authors. No sorting/typing/labeling. Authority for meaning stays with the member.

**B — UX (may change):**
- Control affordances (Send/Speak/Upload styling, text size, contrast) — partly addressed already.
- The single opening question presented by the UI — fine.

**C — Encounter scripting (accidental; candidates for reconnection):**
- **Room locked to one phase** (fixed URL prop, never advances) → every turn draws the same phase lens. The phase should not drive at all.
- **Static room-local system prompt instead of MAIA's constitutional identity** — the room reinvented a thin prompt rather than calling `MAIA_RUNTIME_PROMPT`.
- **No server-side memory/identity retrieval** — the member arrives anonymous every turn.
- **Spiralogic used as keyword-tint, not perception** — the rich facet registry is never consulted at inference; no hypothesis field.

**D — Technical (implementation debt):**
- `inferSpiralogicCell` is a known keyword stub (per its own comment).
- Ollama fallback drops conversation history (latent; inactive in prod).

**The pattern:** the constraints that make MAIA *trustworthy* (A) are intact and good. The constraints that make MAIA feel *generic* (C) are all **accidental** — a thin route standing between MAIA and the person, not a deliberate boundary.

---

## 6. Smallest reconnection path to AIN OS

The correct framing (yours): **AIN OS governs context, memory, consent, provenance, constraints. MAIA provides presence, discernment, repair, accompaniment. The What Now? room must become an *encounter surface for MAIA*, not a separate interview engine.**

Because `generateSimple` is passthrough and Path A's enrichment lives in the **route/service layer** (largely inline in the list route + `maiaService.ts`), reconnection means assembling MAIA's context in the room's route. Three graduated options:

- **Option 1 — thin reconnect (smallest, recommended first step).** In the now-what route, before building the prompt: (a) base the system prompt on `MAIA_RUNTIME_PROMPT` (constitutional identity) with the Great-Interviewer grammar + phase lens *layered on top* as a What-Now addendum; (b) retrieve this member's memory (atoms / `loadRecentAnchors` / memory bundle) and inject it. Preserves ephemerality (retrieval only, no writes). Turns "an anonymous interviewer" into "MAIA, who knows this person, present in this room." *Prerequisite check:* confirm `MAIA_RUNTIME_PROMPT`, the atoms loader, and `loadRecentAnchors` are cleanly importable as standalone functions (they appear to be) — one short trace before implementing.
- **Option 2 — call MAIA as MAIA.** Route the room through `getMaiaResponse()` (Path A entry) with a What-Now mode/addendum, inheriting the full stack (memory, relationship, Corpus Callosum). Larger; requires checking `getMaiaResponse` for write coupling and route-shape assumptions that could conflict with the room's ephemerality/governance.
- **Option 3 — facet perception layer (deepest, net-new).** Add a perception pass that consults `COMPLETE_ELEMENTAL_FACETS_REGISTRY` to form *multiple weighted facet hypotheses* per turn, held underneath, informing (never dictating) MAIA's attention — your perceptual-field model. The registry exists; the perception pass does not.

**Suggested sequence:** Option 1 (identity + memory) → verify it feels like MAIA → then Option 3 (perception) → consider Option 2 only if we want full Corpus Callosum parity. Each is reversible and independently shippable.

### Proof 1 evaluation protocol — two levels, encounter-first

This inquiry did not begin with a log line. It began with a *felt* judgment — "this doesn't feel like MAIA" — which became the evidence trail that produced ADR-013. Proof 1 must therefore be evaluated in the same domain it exists to serve. Two levels, and the order matters:

**Level 2 — Encounter (phenomenological) is evaluated FIRST.** Before any logs or diffs are opened, the founder uses the room and answers one question:

> **Founder evaluation (do this before looking at implementation or logs):** *"Did this feel recognizably like MAIA?"* — then say why.

Reading the logs first would let the architecture tell you it succeeded; answering the felt question first forces the architecture to succeed where it actually matters. Supporting phenomenological cues (evidence, not checkboxes): Did she feel like she *remembered me*? Was the conversation specific to me? Did I stop wondering where the questions came from? Did I feel *accompanied* rather than *interviewed*?

**Level 1 — Engineering (objective) is verified SECOND**, to explain the felt result — not to substitute for it:

- constitutional identity assembled · relevant memory retrieved · retrieval-only (no writes) · Great-Interviewer discipline preserved · ephemerality preserved · no architectural regressions.

**Why this order is a safeguard.** The two levels can disagree, and each disagreement is a distinct lesson:
- *Architecturally correct but "still doesn't feel like MAIA"* → the boundary is not yet sufficient; something real is still missing. **This is the most important thing Proof 1 can teach**, and log-first evaluation would hide it.
- *Modest code change but "there she is"* → evidence the boundary is touching the right thing.

**Experiential power** is the name for this dimension: the boundary exists to organize *relationship*, not only software, so lived encounter is admissible evidence. It is **evidence, not a ratification criterion** — the gate remains the four proofs (Reconnection / Contextual embodiment / Continuity / Jurisdiction). Experiential power does not enter the gate; it informs whether Proof 1 actually reconnected anything worth generalizing.

---

## Status of the already-deployed prompt change (`6648497e5`)

It removed the canned question menu, installed `RESPONSE_GRAMMAR` (reflect → name tension → offer choice → optional elemental touch), added the understanding-repair override, and baked in the anti-generic acceptance test; plus UI affordance upgrades. **It improves the *manners* of the thin route. It does not give MAIA her presence** — it makes the ~770-token prompt better, not the context richer. It is orthogonal to reconnection and should **stand as a foundation**: the Great-Interviewer grammar and repair branch remain necessary after Options 1/3. (As of this writing the build is still deploying; container remains on `5dd38dc48`.)

---

## What is NOT proven / open questions

- Exact token magnitude of Path A (estimated many thousands; not measured turn-by-turn).
- Whether `getMaiaResponse()` can be called without side-effect writes (needed only if Option 2 is chosen).
- Whether the memory loaders are cleanly importable standalone (needed for Option 1 — a short pre-implementation trace).
- The member-facing felt effect of any reconnection is unmeasured until walked — the First Witness question, not a code question.

**No further changes until you choose a direction.**

---

## Appendix A — Encounter-vs-Utility Classification of LLM Call Sites (2026-07-08)

**Purpose.** Evidence-gathering for the ADR-013 *extraction gate* (§7 of the ADR), **not** ratification. Before any surface can be migrated onto Context Assembly, we must know *which* surfaces are true encounters (a person meeting MAIA — must route through Context Assembly / MAIA Runtime) versus utilities (mechanical transforms — may keep calling the provider directly). This appendix classifies every `getLLMProvider()` / `generateSimple()` call site. It authorizes nothing; it does not touch ADR-013.

**Method.** Grepped `app/**` for `getLLMProvider` (34 route files) plus `generateSimple`-only surfaces (`between/chat`). For each: checked imports of `getMaiaResponse` / `buildMaiaRuntimeContext`, memory loaders (atoms / anchors / semantic / developmental), `memberId`, conversation shape, and the `systemPrompt` construction.

**Headline finding (the gate-relevant one): 34 / 34 route surfaces import neither `getMaiaResponse` nor `buildMaiaRuntimeContext`. The bypass of the MAIA runtime contract is universal, not specific to What Now?.** Every surface below — encounter and utility alike — reaches the model through its own inline `systemPrompt`. This is exactly the fragmentation ADR-013 names: there is no single place where "AIN OS becomes MAIA," so each surface improvises one.

> **The load-bearing sentence.** The absence of a shared MAIA Runtime is *not a missing feature* — it is the absence of **the constitutional boundary at which AIN OS assembles the world that MAIA inhabits**. (Precise phrasing matters here: AIN OS does not *produce* or *become* the intelligence — MAIA's relational presence already exists at the runtime. What AIN OS contributes is the coherent world — memory, relationship, governance, capabilities, encounter state — within which MAIA exercises judgment. The boundary is the transition *from assembled world to relational presence*, not a place where the OS turns into the intelligence. AIN OS does not become MAIA; MAIA does not become the OS.) The discovery is not Context Assembly; it is the *absence of the boundary*. Every encounter is independently deciding who MAIA is, what she knows, what she remembers, and how she should behave. Each room assembles its own world and improvises its own temporary MAIA. That is precisely what constitutional integrity is supposed to prevent — and its absence is a single cause with wide explanatory reach: it explains why What Now? felt scripted, why partner platforms risk diverging, why constitutional behavior cannot currently emerge consistently, and why MAIA feels different across surfaces. One missing boundary explains all four.

The `between/chat` row below sharpens this. The problem is **not** "the room has no memory" — `between/chat` *has* memory. The problem is that every surface **assembles reality independently**, so there is no single place where constitutional behavior can emerge. Memory is necessary but not sufficient; a shared boundary is what's missing.

### Progression of discovery (evidence, not history)

This is recorded deliberately. It is not a narrative of *what we did* — it is evidence that the boundary was **found because a simpler explanation stopped accounting for the observations**, not invented first and justified afterward. That distinction is what earns it the right to be tested for constitutional status.

| Step | |
|---|---|
| **Observed behavior** | MAIA felt *scripted* in What Now?. |
| **Initial hypothesis** | Improve the prompt. |
| **Contradictory evidence** | `generateSimple()` is a pure passthrough — a better prompt cannot supply presence the route never assembled. |
| **Expanded observation** | Not one room: **34/34** encounter routes bypass a shared runtime; each assembles its own world. |
| **Candidate explanation** | A single missing cause — the absence of a **constitutional boundary** where AIN OS assembles the world MAIA inhabits — explains four independent symptoms (scripted What Now?, diverging partners, no consistent constitutional behavior, MAIA feeling different across surfaces). |
| **Proposed boundary** | Context Assembly (ADR-013, Proposed). |
| **Ratification method** | Four independent proofs — three inside the boundary, one outside — not a single demonstration. |

Each row was forced by the row above it. The prompt hypothesis was abandoned *because* of the passthrough finding; the single-room framing was abandoned *because* of the 34/34 finding. The architecture is downstream of the evidence, which is the only order in which a boundary can honestly claim to be constitutional.

**Legend — disposition:** `→CA` must eventually route through Context Assembly / MAIA Runtime · `direct-OK` may remain a direct provider call · `founder` needs a founder decision.

### A. Encounter surfaces — a person is meeting MAIA (must eventually → Context Assembly)

| File | Route/purpose | Context it assembles now | Bypasses runtime? | Disposition |
|---|---|---|---|---|
| `app/api/now-what/interview/route.ts` | What Now? room — live encounter | static ~770-tok prompt + transcript + 1 client string; no member context | yes | →CA (canonical first migration) |
| `app/api/between/chat/route.ts` | The Between — two-party relational chat | **partial inline assembly**: developmental memories, theme signals, atoms — but via `generateSimple`, not the contract | yes (assembles inline, still off-contract) | →CA (already proves memory belongs here) |
| `app/api/ask-maia/ask/route.ts` | Ask MAIA — conversational Q&A | `SYSTEM_PROMPT` + message history; no member memory | yes | →CA |
| `app/api/ask/route.ts` | Public landing "ask MAIA" | `LANDING_SYSTEM_PROMPT` + single message; anonymous by design | yes | →CA (anonymous Field Config — minimal context, still MAIA) |
| `app/api/maia/field-lab/interview/route.ts` | Field Lab — "The Crossing" interview | scenario `system` + transcript; no member memory | yes | →CA |
| `app/api/maia/vision-studio/interview/route.ts` | Vision Studio — Spiralogic interview | mode-based `systemPrompt` + transcript | yes | →CA |
| `app/api/fields/[slug]/oracle/route.ts` | Per-field MAIA (field's `maia.systemPromptBlock`) | field-authored prompt + messages | yes | →CA (this IS the Field Configuration case — should inherit, not replace, constitutional base) |
| `app/api/reader/ask/route.ts` | Book companion ("engage deeply with Elemental Alchemy") | inline MAIA prompt + question | yes | →CA |
| `app/api/soul-portrait/[slug]/mentor/route.ts` | Soul Portrait MAIA mentor | portrait-derived `systemPrompt` + message | yes | →CA |
| `app/api/astrology/chinese/discuss/route.ts` | Wu Xing discussion with MAIA | profile-context prompt + conversationHistory | yes | →CA |
| `app/api/studio/encounters/[id]/chat/route.ts` | Encounter-grounded MAIA chat | transcript-scoped `systemPrompt` + message | yes | →CA |
| `app/api/studio/changes/[id]/mentor/chat/route.ts` | Change mentor — streaming conversation | `MENTOR_CHAT_SYSTEM` + change context + history | yes | →CA (practitioner-facing accompaniment) |
| `app/api/studio/changes/[id]/mentor/route.ts` | Change mentor (non-stream) | `MENTOR_SYSTEM_PROMPT` + single turn | yes | →CA |
| `app/api/studio/decisions/[id]/mentor/route.ts` | Decision mentor | `MENTOR_SYSTEM_PROMPT` + single turn | yes | →CA |

### B. Utility surfaces — mechanical transform, no relational presence (may stay direct)

| File | Purpose | Assembles | Disposition |
|---|---|---|---|
| `app/api/scribe/action-items/route.ts` | extract action items from transcript | self-contained extract prompt | direct-OK |
| `app/api/scribe/partial-summary/route.ts` | summarize last N minutes | summary prompt + segment | direct-OK |
| `app/api/scribe/export-report/route.ts` | format session report | self-contained prompt | direct-OK |
| `app/api/scribe/review-session/route.ts` | review/summarize session | self-contained prompt | direct-OK |
| `app/api/studio/encounters/[id]/moments/extract/route.ts` | extract candidate moments | `EXTRACT_SYSTEM` + transcript | direct-OK |
| `app/api/studio/review/analyze/route.ts` | clinical-lens analysis | lens `systemPrompt` + material | direct-OK |
| `app/api/studio/review/series/analyze/route.ts` | cross-session pattern analysis | supervisor prompt + digest | direct-OK |
| `app/api/studio/sessions/.../draft-note/route.ts` | draft note from voice transcript | self-contained prompt | direct-OK |
| `app/api/stellium/maia/train/route.ts` | extract voice/framework patterns | analysis prompts | direct-OK |
| `app/api/stellium/maia/generate/route.ts` | generate marketing content | persona prompt + user prompt | direct-OK |
| `app/api/stellium/maia/prepare/route.ts` | prep/transform persona context | persona prompt | direct-OK |
| `app/api/songwriter/refine/route.ts` | refine lyrics | self-contained prompt | direct-OK |
| `app/api/story/chapters/route.ts` | revise story chapter | self-contained prompt | direct-OK |
| `app/api/spiralogic-report/route.ts` | generate evolutionary report | self-contained prompt | direct-OK |
| `app/api/practitioner/clients/[clientId]/spiralogic-report/route.ts` | generate client report | self-contained prompt | direct-OK |
| `app/api/focus/draft-message/route.ts` | draft a message | `DRAFT_SYSTEM_PROMPT` + prompt | direct-OK |
| `app/api/masters/[field]/author/route.ts` | synthesize master-field content | synthesis prompt | direct-OK |

### C. Ambiguous — founder decision (may become encounter-bearing)

| File | Purpose | Why ambiguous | Disposition |
|---|---|---|---|
| `app/api/changes/[id]/interpret/route.ts` | member I Ching interpretation | member-facing meaning-making, but single-shot & memoryless — is this MAIA present, or an oracle utility? | founder |
| `app/api/studio/changes/[id]/interpret/route.ts` | studio I Ching interpretation | same question, studio context | founder |
| `app/api/guidance/insight/route.ts` | ambient feature "whisper" (`WHISPER_SYSTEM`) | micro-guidance to a member — presence or notification? | founder |
| `app/api/studio/scribe/live-prompts/route.ts` | mid-session "witness mode" prompts to practitioner | "a practitioner is asking you a question during a live session" reads as an encounter, but currently brief/utility | founder |

### Notes / out of scope

- **`between/chat` is the load-bearing example.** It already assembles member memory inline yet stays off-contract. It proves (a) that memory belongs in the assembly layer and (b) that inline assembly is exactly the drift ADR-013 forbids — the right context reached through the wrong path.
- **`fields/[slug]/oracle` is the fractal test.** It is a Field-Configured MAIA today (uses the field's `systemPromptBlock`) but *replaces* the constitutional base rather than *layering over* it. Under ADR-013 the field block should be a Field Configuration composed on top of the constitutional identity, not a substitute for it. This is the surface that most directly validates or breaks the "one MAIA, contextually embodied" claim.
- **Lib-level `generateSimple` callers are not surfaces.** `lib/consciousness/maiaOrchestrator.ts`, `lib/services/MaiaOrchestrator.ts`, `lib/consciousness/SovereigntyProtocol.ts`, `lib/sacred-mirror-variety.ts`, `lib/prompts/maya-intelligence-governor.ts` are runtime internals (or `@ts-nocheck` prototypes); `_backend/src/services/SHIFtInferenceService.ts` and `SingularityNETAgent.ts` are experimental/dead. They are components of (or candidates for) the MAIA Runtime, not independent encounter entry points, and are excluded from this classification.

### What this establishes for the ADR-013 extraction gate

- **Count:** 14 encounter surfaces (A), 17 utilities (B), 4 ambiguous (C) — 35 sites total.
- **The migration surface is bounded and named — and it yields a four-proof progression that tests four *different* problems. The first three prove what belongs *inside* the boundary; the fourth proves what belongs *outside* it:**

  | Proof | Surface | Question it tests | Constitutional property |
  |---|---|---|---|
  | **Proof 1** | What Now? | Can we reconnect a thin route to the boundary at all? | *baseline reconnection* |
  | **Proof 2** | `fields/[slug]/oracle` (Field Oracle) | Can one MAIA become **contextually embodied** through a Field Configuration **without losing identity**? | *fractal plasticity* |
  | **Proof 3** | `between/chat` | Can a **memory-rich** encounter **stop assembling itself independently** and route through the shared boundary? | *constitutional continuity* |
  | **Proof 4** | a utility surface (e.g. `scribe/action-items`, `stellium/maia/train`) | Does the architecture naturally say *"no — this is a utility, it does **not** need constitutional MAIA"*? | ***jurisdiction*** — the boundary includes what belongs and excludes what doesn't |

  *(On the property name: the test is "scope discrimination"; the constitutional **property** it demonstrates is **jurisdiction** — a constitution is defined by what it governs* and *what it declines to govern. Proof 4 gives the boundary a positive property, not merely a procedural check.)*

  Field Oracle is arguably more important than What Now?: it is already *trying* to solve this problem, but with the opposite architecture — today the field prompt **replaces** the MAIA prompt, when the boundary requires the field prompt to **compose over** the constitutional identity (`AIN OS → Context Assembly → constitutional MAIA → Field Layer → Conversation`; the field embodies MAIA, never replaces her).

  **Proof 4 is as load-bearing as the other three.** A constitutional boundary must have *discriminative power* — it must tell you both what belongs inside and what belongs outside. If everything routes through Context Assembly, it is not a boundary; it is a funnel, an "everything goes through here" abstraction with no constitutional meaning. This audit already supplies Proof 4's evidence: **17 utility surfaces (set B) that are legitimate direct provider calls** — not MAIA meeting a person, but mechanical transforms (summarize, extract, format, generate). If, after extraction, those 17 *stay* outside the boundary without strain, that is positive evidence the boundary is a constitutional line for *encounters*, not an architectural funnel for every LLM call. A boundary that fails to exclude the utilities would be self-refuting.

  If all four proofs resolve as expected — the three encounters naturally routing *through* the *same* boundary, and the utilities naturally staying *outside* it — the extraction gate has been met against four independent problems, three inside and one outside, rather than one case repeated.
- **The utility set (B) justifies §4's scope discriminator empirically** — half the call sites are *not* MAIA meeting a person, so an invariant that captured all 35 would be false. The discriminator ("is a person meeting MAIA here?") cleanly separates them.
- **Nothing here ratifies or implements.** This is the evidence the extraction gate requires, collected while ADR-013 remains **Proposed**.
