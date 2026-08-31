# Authority Map · Canonical Model · Embodiment Matrix · Drift Classification

**Program:** `MAIA-WHOLE-INTELLIGENCE-CONVERGENCE-01` — Phases 2, 3, 5, 6
**Status:** READ ONLY · **proposal**, not ratified · no repair authorized
**Companion:** `docs/architecture/MAIA_INTELLIGENCE_FIELD_CENSUS_01_2026-08-31.md` (Phases 1, 4)
**Audited at:** `fc66b47`

---

## §2 — AUTHORITY MAP (Phase 2, proposal)

Not a ranking algorithm. A **constitutional direction of authority** — what may outrank what when two sources disagree about the same member.

```text
  ┌──────────────────────────────────────────────────┐
  │  PROTECTION / CONSENT                            │  ← gates eligibility;
  │  Sanctuary · consent flags · provenance          │    nothing below overrides
  └──────────────────────────────────────────────────┘
                        ▼
     live member-authored experience (this utterance)
                        ▼
     member-declared significance (marks, breakthroughs, atoms)
                        ▼
     current relational context (member-handed-off)
                        ▼
     recent conversational continuity
                        ▼
     member-authored durable memory
                        ▼
     system-observed / inferred memory
                        ▼
     relationship / developmental intelligence
                        ▼
     symbolic / archetypal lenses (Spiralogic, mythic, astrology)
                        ▼
     corpus / teaching / manuscript
                        ▼
     field / collective inference
```

**The load-bearing case:** MAIA may hold something from Elemental Alchemy that is relevant. She may not use the book to overrule what the person says is happening to them. Corpus sits below member-authored experience — always, in every embodiment.

### Authority conformance at `fc66b47`

| Boundary | Enforced? | Evidence |
|---|---|---|
| Consent gates eligibility | ✅ structurally | `MemoryGate` / `TurnPosture` / `allowCrossSessionMemory` short-circuit before any loader |
| Member-declared > system-inferred | ✅ in episodic + atoms | `loadRecentMarkedEpisodes` is member-marked only; `is_breakthrough` never system-set |
| Corpus below member experience | **UNENFORCED** | corpus/manuscript never reaches the member turn at all (census row 29) — the boundary is untested, not upheld |
| Symbolic below member experience | **UNENFORCED** | ordering is *append order in a prompt*, which encodes no precedence |
| Field/collective lowest | **UNENFORCED** | `fieldWisdomAddendum` is appended like any other addendum |

**Finding A2 — authority is currently expressed as prompt append order, which carries no precedence semantics.** Every source arrives as a peer string concatenated onto one prompt (`appendAllContextAddenda`, `maiaVoice.ts:489`). The hierarchy above exists in canon and in the loaders' consent gates, but **nothing downstream of retrieval encodes it.** Whether the model honours it is left to the model.

This is why the Conductor (§3) matters more than any individual wiring fix.

---

## §3 — CANONICAL INTELLIGENCE MODEL (Phase 3, proposal)

Stop treating every service as a peer. Seven layers, not dozens of services.

```text
1. PRESENT FIELD          current utterance · immediate conversation · affect / rhythm
2. PERSONAL CONTINUITY    conversational · episodic · member-marked · developmental
3. RELATIONAL FIELD       relationships · encounters · relational history · authorized collective
4. PATTERN INTELLIGENCE   semantic retrieval · pattern recognition · resonance · trajectories
5. SYMBOLIC INTELLIGENCE  Spiralogic · elemental · mythic/archetypal · astrology
6. KNOWLEDGE / CORPUS     books · manuscripts · guides · practitioner material · platform knowledge
7. CONDUCTOR              relevance · restraint · authority · consent · composition
```

**The Conductor is not layer 7 of a list. It is not another intelligence source.** Layers 1–6 supply candidates; the Conductor governs participation. It is the only component permitted to answer *"should this speak now?"*

### Layer health at `fc66b47`

| Layer | Assessment |
|---|---|
| 1 · Present field | **Healthy.** Turns, session, posture all live |
| 2 · Personal continuity | **Healthy but tier-uneven.** Developmental reaches FAST only (census F1) |
| 3 · Relational field | **Partially healthy.** Read path live; observation write path swallows errors |
| 4 · Pattern intelligence | **Absent.** Both backing stores unmigrated; semantic path is write-only (census F2) |
| 5 · Symbolic intelligence | **Split.** Spiralogic/elemental/WuXing/astrology live; MythicAtlas broken |
| 6 · Knowledge / corpus | **Absent from the turn.** Knowledge-gate scoring is live; corpus content is not |
| 7 · Conductor | **Does not exist as a component.** See below |

**Finding A3 — there is no Conductor.** The census (§5) found composition authority to be *single at the prompt seam and plural at the ranking layer*: one mouth, twelve appetites. What performs composition today is a **fixed-order string concatenation** over `ADDENDA_SPECS`. It has no notion of relevance, no notion of authority, and no capacity for restraint beyond a source being absent.

`buildMaiaRuntimeContext` is explicitly documented in-repo as *"observer, not orchestrator"* (`ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` §IX). The Conductor named throughout the canon is, at the intelligence-composition layer, **aspirational**. `lib/voice/conductor.ts` is a real component but governs elemental hysteresis, not intelligence participation.

This is the single largest gap between MAIA's described mind and her operating mind — larger than any missing table.

---

## §5 — EMBODIMENT MATRIX (Phase 5)

> Does the same intelligence reach all MAIAs, in all frameworks and media?

### Cognition entry points found at `fc66b47`

Only **three** routes call the canonical `getMaiaResponse()`. **Six more run their own model calls with their own prompt stacks.**

| # | Endpoint | Cognition | Lines | Verdict |
|---|---|---|---|---|
| 1 | `/api/sovereign/app/maia/list` | `getMaiaResponse` | 1797 | **canonical** |
| 2 | `/api/sovereign/app/maia` | `getMaiaResponse` | 532 | canonical |
| 3 | `/api/now-what/interview` | `getMaiaResponse` + **own `systemPrompt` composition** | 440 | **DIVERGENT (partial)** |
| 4 | `/api/between/chat` | **own stack** — own addenda assembly | **2665** | **RED — separate cognition implementation** |
| 5 | `/api/voice/stream-conversation` | **own stack** — own `buildMaiaContext` | 1639 | **RED — separate cognition implementation** |
| 6 | `/api/maia/relational-navigation` | own inline `systemPrompt` | 306 | DIVERGENT |
| 7 | `/api/portal/[slug]/chat` | `buildVirtualPractitionerPrompt` | 475 | DIVERGENT (may be valid — different persona) |
| 8 | `/api/journal/reflect` | module-const `SYSTEM_PROMPT` | 204 | DIVERGENT (narrow task) |
| 9 | `/api/studio/session-followup/generate` | `buildFollowupPrompt` | 188 | DIVERGENT (narrow task) |
| 10 | `/api/oracle/conversation` | own stack | — | **ORPHANED but still referenced** (see below) |

`/api/between/chat` is the sharpest case. At 2,665 lines it assembles its *own* parallel set of addenda — `SignificantMomentsService`, `epistemicPathPrompt`, `therapeuticFrameworks`, `decisionGovernor`, `relationshipPolicy`, snapshot addenda — none of it shared with `appendAllContextAddenda`. It is not a thinner MAIA. **It is a second MAIA mind of comparable sophistication, built in parallel.**

### The component-level fork

`components/OracleConversation.tsx` — the primary MAIA interface — **calls all three of endpoints 1, 4, and 5**, and its `apiEndpoint` prop defaults to `/api/between/chat` (`OracleConversation.tsx:626`), *not* the canonical route.

```text
OracleConversation.tsx
  ├─ apiEndpoint prop (default '/api/between/chat')   ← DEFAULT IS NON-CANONICAL
  ├─ explicit canonical fetch (line ~823)
  └─ voice branch → /api/voice/stream-conversation (line ~7214,
        documented in-code: "operates its own Claude")
```

Which MAIA a member meets depends on whether the mounting page remembered to pass a prop.

### Surface → cognition matrix

| Surface | Mount | Endpoint | Canonical cognition | Verdict |
|---|---|---|---|---|
| Web `/maia` | `app/maia/page.tsx:843,1540` | `sovereign/app/maia/list` | ✅ | **CORRECT** |
| Field Talk | `app/field/talk/page.tsx:415` | `sovereign/app/maia/list` | ✅ | CORRECT |
| Studio MAIA | `app/studio/maia/page.tsx:118` | `sovereign/app/maia/list` | ✅ | CORRECT |
| MAIA Presence | `components/maia/presence/MaiaPresence.tsx:239` | `sovereign/app/maia/list` | ✅ | CORRECT |
| **Voice (any surface)** | `OracleConversation.tsx:~7214` | `voice/stream-conversation` | ❌ own Claude | **RED** |
| **Embedded MAIA chat** | `components/oracle/EmbeddedMAIAChat.tsx` | `between/chat` (default) | ❌ | **DIVERGENT** |
| **Book chat (Elemental Alchemy)** | `components/elemental-alchemy/BookChat.tsx` | `between/chat` | ❌ | DIVERGENT |
| **Between chat interface** | `components/consciousness/BetweenChatInterface.tsx` | `between/chat` | ❌ | DIVERGENT |
| Now What? Room | `components/now-what/NowWhatRoom.tsx` | `now-what/interview` | ⚠️ partial | DIVERGENT (partial) |
| Relational Navigation | `components/maia/relational-navigation/Flows.tsx` | `maia/relational-navigation` | ❌ | DIVERGENT |
| Journal Reflection | `components/journal/room/Reflection.tsx` | `journal/reflect` | ❌ | DIVERGENT (narrow) |
| Practitioner Portal | `components/portal/*` | `portal/[slug]/chat` | ❌ | DIVERGENT (may be valid) |
| **Partners onboarding prelude** | `app/partners/onboarding/prelude/page.tsx:556` | **`/api/oracle/conversation`** | ❌ dead route | **RED — live surface on a route CLAUDE.md records as ~zero-traffic** |
| PWA / Desktop / iOS | share the web bundle | inherits above | inherits | inherits — **no separate cognition found** |

**Good news, stated plainly:** PWA, Desktop, and iOS do **not** fork cognition. They render the same web surfaces. The medium axis (per the voice doctrine) is clean *except for voice*, which forks at endpoint 5.

**Finding A5 — the fork is not by device. It is by surface and by component default.** The platform's device story is sound; its *surface* story is not.

---

## §6 — DRIFT CLASSIFICATION (Phase 6)

Every finding gets exactly one verdict. **A finding is not permission to repair.**

| ID | Finding | Verdict | Severity | Evidence |
|---|---|---|---|---|
| D1 | Health telemetry maps "backing store absent" and "member has no history" both to `'empty'`; degradation never fires | **UNOBSERVABLE** | **P0** | `memoryHealth.ts:122-130,141-146` |
| D2 | `memoryHealth.semantic` is fed the atoms row count; 4 of 12 layers never fed at all | **MIS-RANKED** | **P0** | `route.ts:1093-1095`; `memoryHealth.ts:105` |
| D3 | `/api/between/chat` is a second full cognition implementation (2,665 lines, own addenda set) | **DIVERGENT** | **P0** | `app/api/between/chat/route.ts` |
| D4 | `/api/voice/stream-conversation` operates its own Claude; voice forks after capture | **DIVERGENT** | **P0** | `OracleConversation.tsx:~7214` |
| D5 | `OracleConversation` defaults `apiEndpoint` to the non-canonical `between/chat` | **DIVERGENT** | **P0** | `OracleConversation.tsx:626` |
| D6 | No Conductor exists; composition is fixed-order string concatenation | **MISSING** | **P0** | `maiaVoice.ts:406-489` |
| D7 | Developmental memory + forward-readiness + knowledge-field reach FAST only | **DIVERGENT** | **P1** | absent from `ADDENDA_SPECS` |
| D8 | DEEP-primary has no prompt seam; only 4 addenda via consultation lane | **DIVERGENT** | **P1** | `maiaService.ts:2329-2332` |
| D9 | RLM client uses relative URL `'/api/rlm'`; fails 100% server-side | **BROKEN** | **P1** | `lib/rlm/client.ts:188,271` |
| D10 | `semantic_memory_vectors`: written, never read, no migration | **ORPHANED** | **P1** | `maiaService.ts:3524`; no `SELECT` in repo |
| D11 | `lattice_nodes`: read+written, no migration | **BROKEN** — adjudication open | **P1** | `ConsciousnessMemoryLattice.ts:500+` |
| D12 | ≥12 independent ranking implementations, no arbiter | **REDUNDANT** | **P1** | census §5 |
| D13 | Live partners-onboarding surface points at the ~zero-traffic `oracle/conversation` route | **DIVERGENT** | **P1** | `app/partners/onboarding/prelude/page.tsx:556` |
| D14 | `ConversationMemoryUsesStore` records *retrieved candidates*, not uses | **MIS-RANKED** (naming) | **P2** | `ConversationMemoryUsesStore.ts:148` |
| D15 | MythicAtlas 422 — external service reached, request body rejected | **BROKEN** (contract drift) | **P2** | `mythicAtlasService.ts:49,95` |
| D16 | Relational observation writes swallowed by `.catch()` | **UNOBSERVABLE** | **P2** | `relationalObserver.ts:139-140` |
| D17 | Corpus / manuscript intelligence never reaches the member turn | **ORPHANED** | **P2** | 0 refs in route + service |
| D18 | Somatic / Morphic / Coherence / QuantumField never called on turn | **INTENTIONALLY_RESTRAINED** (frozen plan) | — | `COHERENCE_FIELD_WIRE_UP_SPEC §0.C` |
| D19 | Sanctuary hard-gates all cross-session memory before any loader | **CORRECT** | — | `route.ts:518-526` |
| D20 | Member-marked episodic + `is_breakthrough` never system-set | **CORRECT** | — | `loadRecentMarkedEpisodes`; `route.ts:1097` |
| D21 | Canonical route audited by existing canon is the ~zero-traffic one | **DIVERGENT** (documentation) | **P2** | `docs/canon/INTELLIGENCE_FIELD_ACCESS_MAP.md` |

**Count: 21 findings — 6 P0, 7 P1, 6 P2, 2 CORRECT.**

Two `CORRECT` verdicts are recorded deliberately. The consent architecture is not among the problems, and a census that only reports defects would misdescribe the system as badly as one that only reports capabilities.

---

## §7 preview — what the target architecture must resolve

```text
                       ┌──────────────────────────┐
                       │   MAIA CONDUCTOR         │  ← D6: does not exist
                       │ relevance · restraint    │
                       │ consent · authority      │
                       └────────────┬─────────────┘
                                    │
              ┌─────────────────────┼──────────────────────┐
        Personal Field        Relational Field      Knowledge Field
        (tier-uneven, D7)     (write path D16)      (absent, D17)
              └─────────────────────┼──────────────────────┘
                                    ▼
                          CANONICAL COGNITION
                        ← D3, D4, D5, D8, D13 fork here
                                    │
                   ┌────────────────┼─────────────────┐
                 Text             Voice            Studio
                   │                │                 │
                Desktop          Mobile          Practitioner
                        (device axis is CLEAN)
```

The bottom arrows are **expression, not new minds.** Today, five of them are new minds.

**Ratification question for the human gate:** are `between/chat`, `voice/stream-conversation`, `now-what/interview`, `relational-navigation`, `portal/chat`, and `journal/reflect` — six independent prompt stacks — *legitimate medium/persona specialization*, or *historical accretion*? The census can prove they diverge. **It cannot decide which of them should.** That decision is Phase 7, and it belongs to a person.
