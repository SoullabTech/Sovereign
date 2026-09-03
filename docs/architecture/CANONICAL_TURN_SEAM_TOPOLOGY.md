# Canonical MAIA Turn Construction — topology

**Status: DISCOVERY — accepted by CMT-01 adjudication (2026-09-03). No code changed.**

The four open questions in §8 are adjudicated in
`docs/architecture/MAIA_CANONICAL_TURN_ARCHITECTURE_SPEC_v0.1.md` (§1, §2, §3, §5).
The registry discrepancy in §2.1 is recorded there as a **confirmed inaccurate
architectural assertion**, disposition *eliminated* (§9) — not repaired
opportunistically.

Lane opened 2026-09-03, immediately after Phase 0 closure. This document answers
one question from source: *do different routes assemble different MAIAs before
reaching the same cognition?* It does not propose the seam.

---

## 1. The condition being named

```text
iOS ───────┐
PWA ───────┼───────────────┐
Desktop ───┘               │
                           ▼
               CANONICAL TURN CONSTRUCTOR      ← does not exist yet
                           │
                    authenticated member
                           │
                  present encounter/context
                           │
                 MIPA participation boundary
                           │
              canonical intelligence-field bundle
                           │
                           ▼
                    getMaiaResponse()
```

Clients may differ in microphone, streaming, UI, transport and modality. They
may not silently differ in what MAIA knows or is permitted to think with.

---

## 2. Cognition entry points — the source-derived call set

`getMaiaResponse()` is defined once, at `lib/sovereign/maiaService.ts:2558`. Six
executable call sites reach it, in three modules:

| # | Call site | Reached from | Passes `buildMaiaRuntimeContext` |
|---|---|---|---|
| 1 | `app/api/sovereign/app/maia/list/route.ts:1197` | **A** — canonical-live ingress | **yes** (`:1138`) |
| 2 | `app/api/sovereign/app/maia/route.ts:343` | **B** — dormant predecessor | no |
| 3 | `app/api/sovereign/app/maia/route.ts:497` | **B** — its emergency path | no |
| 4 | `lib/consciousness/maiaOrchestrator.ts:480` (`generateMaiaTurn`) | **C** — `between/chat` | no |
| 5 | `lib/consciousness/maiaOrchestrator.ts:1027` (`generateSimpleMaiaResponse`) | **C** — `between/chat` | no |
| 6 | `lib/consciousness/maiaOrchestrator.ts:1160` (`consciousnessHealthCheck`) | health check, not a member turn | no |

**One of six call sites passes through the runtime-context wrapper.** Five reach
MAIA cognition having assembled themselves.

### 2.1 A registry claim that is not accurate about cognition

`lib/maia/maiaRuntimeContext.ts` registers `between/chat` as:

```ts
callsMaiaResponse: false,
description: 'Embedded oracle widget + dev chat-test (uses maiaOrchestrator, not getMaiaResponse)',
```

`app/api/between/chat/route.ts:18` imports `generateMaiaTurn` and
`generateSimpleMaiaResponse`; both call `getMaiaResponse` (sites 4 and 5). The
orchestrator is a **wrapper around the same cognition entry, not an alternative
to it**.

The claim is true of the *direct* call and false of the thing the field name
asks. Under the P3f lesson — *a gate placed inside one reader can be walked
around by opening a second one* — a registry that distinguishes direct from
transitive callers records the wrong property, because the guard it feeds is
about what reaches cognition.

Scope discipline: this is a **source-derived** finding. It establishes that the
route can reach cognition through the orchestrator, not that any particular
production turn did.

---

## 3. Divergence, measured

Import closure from each entry point, checking which governed-context modules
are reachable. **Read the absences, not the presences.** A module absent from a
closure *cannot* participate on that path — sound in the safe direction. A
module present is not proof that it composes; that asymmetry is the P3-CSC
ceiling (outcome C) and it is not evaded here.

| Governed module | A `…/maia/list` | B `…/maia` | C `between/chat` |
|---|:--:|:--:|:--:|
| runtime-context wrapper | ✅ | — | — |
| participation gate (P3) | ✅ | ✅ | ✅ |
| consent gates (P2) | ✅ | ✅ | ✅ |
| atoms loader (`return_preference` gate) | ✅ | — | ✅ |
| memory loaders (R24) | ✅ | ✅ | ✅ |
| `MemoryBundle` (R25 / R26) | ✅ | — | ✅ |
| `MemberLiveContext` (R27) | ✅ | — | — |
| relationship memory (P1c) | ✅ | ✅ | ✅ |
| breakthrough boundary (P3f) | ✅ | ✅ | ✅ |
| return authority (P6) | ✅ | — | — |
| sovereign corpus disposition (P1c) | — | — | — |
| `MemoryOrchestrator` recall block | ✅ | ✅ | ✅ |
| significant moments (P3f) | ✅ | — | ✅ |

Closure sizes: **A = 387 · B = 338 · C = 414**.

### What the absences establish

- **B cannot reach** the runtime-context wrapper, the atoms loader, `MemoryBundle`, `MemberLiveContext`, return authority, or significant moments.
- **C cannot reach** the runtime-context wrapper, `MemberLiveContext`, or return authority.
- **Only A** reaches the runtime-context wrapper at all.

Three doors, three different assemblies, one cognition. That is the
architectural condition, evidenced.

`sovereignDisposition` is reachable from none of them and should be: it is the
export/participation ledger, not a turn-time module. Its absence here is
correct, and is recorded so the row is not later read as a gap.

---

## 4. What already exists, and what is deferred

`lib/maia/maiaRuntimeContext.ts` is a real prior asset — a route registry with
declared status, an eight-field per-turn observability record, and an explicit
sequence in its own header:

```text
step 3  buildMaiaRuntimeContext        ← built
step 5  assertProviderAvailable hard guard   ← DEFERRED
step 6  CI guard promoting unknown-routeId warnings to errors   ← DEFERRED
step 7  CI guard failing canonical-live routes absent from the registry   ← DEFERRED
```

Two facts about it matter for the seam:

1. **It observes; it does not construct.** Its own docblock says it "does NOT …
   modify the meta passed to `getMaiaResponse()` — the caller does that." The
   caller still assembles the turn. This is the same finding recorded in
   `CLAUDE.md` as *"`buildMaiaRuntimeContext` is observer, not orchestrator"*.
2. **It warns rather than refuses.** "Does NOT block requests on unknown
   routeId (warn + passthrough until CI guard step)."

So the target property —

> **No live `getMaiaResponse()` without canonical turn construction.**

— is not a new mechanism invented from nothing. It is the deferred half of a
sequence that was already designed, plus the promotion of the wrapper from
observer to constructor. The distinction the property must hold is between
*"all current callers seem to use it"* and *a fourth route failing certification
because it does not*.

---

## 5. Why convergence must not carry capability

The seam's first migration should preserve **the currently authorized
intelligence field** — not restore what P3 removed, not add semantic history.

```text
CANONICAL SEAM
      ↓
same governed context everywhere
      ↓
P3-global certification becomes possible
      ↓
THEN expand intelligence
```

Combining convergence with capability expansion in one migration destroys the
ability to attribute a behavioural change to either. Every certification in this
programme has depended on being able to say which change caused which effect.

Note the direction of the contraction this implies: converging B and C onto A's
governed context is mostly **additive gating** for them (they currently reach
*fewer* governed modules), and for the modules they reach but A does not, it is
removal. Neither is capability expansion, and the seam migration should be able
to state which of the two each module is.

---

## 6. Prior canon this lane must not contradict

`docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md` already names a
convergence point in code for **spoken vs typed** turns, pinned by
`__tests__/voice-non-degradation.test.ts` with two closed sets. It explicitly
disclaims being universal:

> *"This deliberately does not claim universal MAIA egress convergence."*

The canonical turn seam is the **generalization** of that invariant from one
modality pair to every door. It supersedes nothing: the voice gate stays, and
the seam must satisfy it rather than replace it.

---

## 7. The Turn Participation Manifest — what it would have to record

The question P3 could not answer from the current codebase is *what actually had
the ability to enter this MAIA turn?* The constructor is the only place that can
answer it, because it is the only place that would know:

```text
turn
├── identity resolved            (which member, by which credential path)
├── runtime-context version
├── policy version               (which refusal set was in force)
├── intelligence sources considered
├── sources admitted / held / excluded
├── reason codes                 (the existing ExclusionReason vocabulary)
├── provenance classes           (authored_by × authority_class)
└── cognition invocation
```

Every element already exists somewhere: `ExclusionReason` and the two-field
provenance model in `lib/maia/participationGate.ts`, the eight-field turn record
in `maiaRuntimeContext`, the corpus classes in `lib/maia/sovereignCorpus.ts`.
The manifest is their assembly at one point, not new vocabulary.

---

## 8. Open questions this discovery does not answer

1. Should B (`sovereign/app/maia`, dormant, zero production traffic per the
   2026-05-23 audit) be **converged or retired**? Retiring it removes two of the
   six call sites outright. That is a scope question, not a technical one.
2. Is `consciousnessHealthCheck` (site 6) a member turn? It appears not — but a
   health check invoking real cognition is worth an explicit disposition rather
   than an assumption.
3. Does the constructor own **retrieval**, or only **admission**? The manifest
   above records what was considered, which implies the constructor sees
   candidates it did not fetch.
4. What is the certification instrument for *"no live `getMaiaResponse()`
   without canonical turn construction"*? A call-site closed set is the
   established pattern (P3e, P3f, P6) and `getMaiaResponse` is a discrete named
   function, so the boundary looks tractable in the way P6's was and P3's global
   form was not.

---

## 9. Sequence

```text
PHASE 0                           ✅ done enough
   ↓
CANONICAL TURN SEAM               ← this lane
   ↓
P3 GLOBAL RECERTIFICATION
   ↓
W1 EXPLICIT LONG-TERM RECALL      ("Do you remember Louisiana?")
   ↓
DESKTOP / PWA / iOS PARITY WITNESS
   ↓
P4 / P5 richer memory relationship
```

W1 is explicit recollection only — the member says *look back*, and MAIA does so
faithfully. No proactive historical doorways. No system deciding which old thing
the member needs to hear. It requires neither P4 nor P5.
