# MAIA-TURN-COMPOSITION-MAP-01 — turn-composition map

**Date:** 2026-08-30 · **Base:** `674ef416d` (branch `fix/canonical-maia-endpoint-01`)
**Kind:** read-only census. **No finding in this document was repaired.**

> **Governing rule observed:** restraint is the integration. Four repairable defects
> and one lying instrument were found. None were touched. One in-flight repair
> (a test correction) was reverted when this mandate arrived.

**Evidence classes.** EXISTS · REACHABLE · CALLED · PRODUCED · ADMITTED (reaches the
downstream composition/response path) · UNKNOWN (causal influence not established).
`CALLED` and `PRODUCED` are never promoted to "influences MAIA."

---

## 1 · The canonical turn, as implemented

Traced from the HTTP boundary, not from the architecture diagram.

```
member text
  → app/api/sovereign/app/maia/list/route.ts        (1,797 lines)
      · resolveMemberIdentity
      · TurnsStore.addExchangeTurn                  ← relational event, written EARLY
      · session + cognitiveProfile + nameChange     (parallel)
      · memoryBundle + wuxing + astrology           (parallel)
      · buildMemberLiveContext · practiceField · relationalContext
      · atoms · conversationalRecall · episodicRecall
      · [ buildMemberSpiralOrientation — COMMENTED OUT :1163-1175 ]
  → buildMaiaRuntimeContext                         (de-frag step 3, required contract)
  → getMaiaResponse({ input, meta: ~15 addenda })   lib/sovereign/maiaService.ts
  → tier split: FAST | CORE | DEEP
  → scrubMemoryAmnesia → identity guard → sovereignText
  → MemoryWritebackService.writeBack + applyConversationalKeepResult
```

The conceptual sequence given in the mandate and the implementation agree on
**order** but diverge on **admission**. Context is assembled generously and
admitted conditionally.

---

## 2 · The admission seam — where the map's weight sits

All ~15 server-built addenda arrive in `meta` at
[route.ts:1196-1251](../../app/api/sovereign/app/maia/list/route.ts). Whether
they reach a prompt depends entirely on tier.

| tier | prompt builder | addenda seam | verdict |
|---|---|---|---|
| FAST | `buildMaiaWisePrompt` | `appendAllContextAddenda` — [maiaVoice.ts:894](../../lib/sovereign/maiaVoice.ts) | **ADMITTED** |
| CORE | `buildMaiaWisePrompt` | same, :894 | **ADMITTED** |
| DEEP · repair | `buildMaiaComprehensivePrompt` | `appendAllContextAddenda` — [maiaVoice.ts:956](../../lib/sovereign/maiaVoice.ts) | **ADMITTED** (§II.B closed) |
| DEEP · primary | consciousnessOrchestrator | **none by construction** | **PRODUCED, NOT ADMITTED** |

**Correction recorded against my own first inference.** `buildComprehensiveVoicePrompt`
contains zero `Addendum` references, which looks like non-admission. It is not:
admission happens in the *wrapper* one level up. A property of the inner function
was nearly reported as a property of the path. The 0-reference fact is true and
means nothing on its own.

---

## 3 · Findings

### F1 · DEEP-primary composes without member context — **DISCONNECTED** ⚠️ most consequential

The DEEP tier's primary path is the local consciousness orchestrator, which
*"weaves templates, it does not read a system prompt"*
([maiaService.ts:2268-2270](../../lib/sovereign/maiaService.ts)). It therefore has
no seam through which any of the ~15 addenda can enter.

Its **only** addenda seam is the Claude-consultation lane, which admits **4 of ~15**
(conversational recall, episodic recall, atoms, relational context) — and is gated on:

```ts
const enableClaudeConsultation = process.env.MAIA_USE_CLAUDE_CONSULTATION === 'true';
```

`MAIA_USE_CLAUDE_CONSULTATION` is set in **no** env template, compose file, or
deployment config anywhere in the repository. Only two references exist, both
describing how to turn it on.

**Consequence, stated carefully:** on the current configuration, a DEEP turn taking
the primary path composes with none of the member context the route spent the whole
request assembling. The tier that fires for explicit depth requests is the tier that
brings the least. That is an inversion of the architecture's intent.

- EXISTS ✓ REACHABLE ✓ CALLED ✓ PRODUCED ✓ **ADMITTED ✗**
- **UNKNOWN:** what fraction of production DEEP turns take primary vs repair. Absent
  evidence: no per-path counter is emitted, and no runtime witness was taken (this is
  a source census). Runtime distribution is required before sizing the impact.

### F2 · The Memory Palace is disconnected from the canonical turn — **DISCONNECTED**

`MemoryPalaceOrchestrator` and the five services beneath it — `CoherenceFieldService`,
`EpisodicMemoryService`, `SomaticMemoryService`, `MorphicPatternService`,
`QuantumFieldMemory` — are reachable from exactly one route:
`app/api/oracle/conversation/route.ts`, which project canon records as receiving
**~zero live traffic**.

Neither the canonical route, `maiaService`, nor `maiaOrchestrator` reaches any of them.
The two files that appeared to bridge them do not:
`lib/memory/MemoryWriteback.ts:592` and `lib/consciousness/fieldMonitorTelemetry.ts`
reference `MemoryPalaceOrchestrator` **only inside comments**.

Importer counts (2-5 each) are misleading: the bulk importer is
`lib/maia/substrateMap.ts`, a registry holding module paths **as strings**.

- EXISTS ✓ REACHABLE (canonical turn) ✗ → CALLED ✗

### F3 · Two complete conversational authorities — **REDUNDANT**

| | typed | default spoken |
|---|---|---|
| route | `/api/sovereign/app/maia/list` | `/api/voice/stream-conversation` (hardcoded, [useStreamingVoice.ts:633](../../hooks/useStreamingVoice.ts)) |
| cognition | `getMaiaResponse()` behind the de-frag contract | `getClaudeService()` directly, own prompt assembly |
| size | 1,797 lines | 1,639 lines |
| `getMaiaResponse`/`maiaService` refs | — | **0** |

`useStreamingVoice` accepts no endpoint parameter, so `CANONICAL-MAIA-ENDPOINT-01`
cannot constrain it. The gate that selects this path is hard-forced:

```ts
const [streamingVoiceMode, setStreamingVoiceMode] = useState(() => {
  // Force true for testing - revert after validation
  return true;
```
[OracleConversation.tsx:985-987](../../components/OracleConversation.tsx)

This is a genuine compositional duplicate, not a transport variant: two independently
maintained context assemblies, memory strategies, and identity guards.

### F4 · Spiral orientation is authored but commented out — **DISCONNECTED**

[route.ts:144, :1163-1175](../../app/api/sovereign/app/maia/list/route.ts) — the import
and the entire `buildMemberSpiralOrientation` block, including its logging, are
commented out in the canonical route. The module exists.
**UNKNOWN:** why, and whether deliberately. No adjacent note states a reason.

### F5 · The non-degradation suite reports GREEN over F3 — **lying instrument**

`__tests__/voice-non-degradation.test.ts` asserts `voicePath()` *contains*
`handleTextMessage(`. That is containment, not reachability: the `return` at
`OracleConversation.tsx:7263` sits above it. Its companion assertion scans for route
*literals*, which `sendStreamingMessage(...)` does not contain. Both pass while the
default spoken path diverges.

**Not repaired.** A correction was begun and reverted under this mandate's restraint rule.

### F6 · OVERACTIVE — **UNKNOWN, not asserted**

Corpus Callosum emits 8 parallel voices per turn with WisdomRouter selecting ~49%,
which is the shape of an overactive surface. But no evidence was found in this pass
that the unselected emissions reach the response, and no restraint gate was located
or ruled out. Classifying it OVERACTIVE would be inference disguised as measurement.
**Absent evidence:** admission tracing from `agent_runs` into `sovereignText`.

### F7 · A correctly-restrained instrument, recorded as the positive case

`fieldMonitorTelemetry.ts:55-66` replaced five structurally-guaranteed `false` flags
with an explicit `palace: 'not_run'` variant, on the reasoning that guaranteed-false
readings "read as five observations about memory. They were not observations at all."
This is the discipline this census is looking for, already present in the codebase.

---

## 4 · Governance topology

`CONVERSATION-ROOM-EXPERIENCE-CONTRACT-01` — **OWED**. The structural Experience
Contract added in `674ef416d` claims `components/OracleConversation.tsx`, and the
design-canon gate treats a surface as covered if *any* contract matches. Until the
Conversation room's experiential contract is authored, experiential changes to the
primary conversational component can ship through a structural contract with no
screenshots and no experience verification. Recorded, not repaired.

## 5 · Carried forward from CANONICAL-MAIA-ENDPOINT-01

All five known `OracleConversation` mounts explicitly supply the canonical
`apiEndpoint`; omission is now rejected by TypeScript. **This proves the endpoint
wiring seam is connected and nothing more.** F3 shows the default spoken path does
not pass through that seam at all.

## 6 · Recommended next unit — exactly one

```
VOICE-CANONICAL-CONVERGENCE-02     RESUME
```

**Diagnosis complete enough to proceed; repair not yet completed.** This unit was
already opened before this census: its 15 exits were mapped, the streaming route was
read far enough to establish that it **cannot be demoted to transport**, and the
standing ruling is *HOLD streaming voice / converge `handleVoiceTranscript` onto
canonical cognition*. This census did not discover the unit — it independently
re-derived F3 from source and returns the unit to the board.

**Why this one over F1.** F1 is the deeper compositional defect, but its blast radius
is unmeasured (the primary-vs-repair split is UNKNOWN) and its repair touches the
cognition core. F3 is fully established from source, is the defect that makes the
member's *default* modality reach a different mind, is the one the Deep-Intelligence
Gate already governs as RED, and is bounded by a single hard-forced flag whose comment
says it was never meant to persist. It also gates F5: the instrument cannot be made
honest while the path it describes is divergent.

**Board at MAP closure**

```
MAP-01                       CLOSED
VOICE-CANONICAL-CONVERGENCE  RESUME
DEEP admission / F1          RECORDED, HOLD
Memory Palace / F2           RECORDED, HOLD
Corpus Callosum / F6         UNKNOWN, HOLD
Experience Contract          OWED
```
