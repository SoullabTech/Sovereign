# FOCUS-PRODUCER-01 — census of the canonical prompt seam

**2026-09-09 · READ ONLY.** No repair authored. Route unchanged. `#1275` frozen.

> ⭐⭐ **We successfully governed whether MAIA may see the Work before we had
> actually made MAIA capable of seeing it.**

## F1 · The meta channel is dead, and confirmed unlawful

`grep writerFocusContext` across `lib/` and `app/` returns **one** hit: the line
that writes it. **Zero consumers.** The path today is:

```text
Focus authorized → receipt minted → Work assembled
   → handed to getMaiaResponse as meta.writerFocusContext
   → nothing reads it
   → MAIA thinks without it
```

⭐ And it is the wrong channel by the Writer's Studio contract's own words.
`lib/writers-studio/harnessContext.ts` already names `(meta as any)` addenda as
*"the open channel CMT-01 was opened to close"*, and its `FORBIDDEN_KEYS` refuses
`meta`, `addendum`, `studioAddendum`, `prompt`, `systemPrompt` **outright rather
than ignoring them** — because a silent drop is invisible where a refusal is not.

⛔ **The repair is not to make that field start working.** *A dead unlawful
channel should be removed, not activated.*

⚠️ **Containment note (acted on nowhere else in this record):** while the channel
is inert, §3a's `crossed_accounted` would tell a writer *MAIA received this
Focus* when MAIA's cognition never reads it. The route is off by default
(`WRITERS_STUDIO_FOCUS_ENABLED`), and **it must stay off until this lane lands** —
otherwise the surface tells a truth about the boundary that reads as a falsehood
about the mind.

## F2 · ⭐⭐ There is no single tier seam. There are three, and they diverge.

| Tier | Assembly | Reads `MaiaContext` addenda? |
|---|---|---|
| FAST | `baseSystemPrompt` built by inline string concatenation (`+= formatFieldAddendum(...)` etc.) | ⛔ no — it is not a `MaiaContext` path at all |
| CORE | `buildMaiaWisePrompt(context, …)` | ⭐ yes, via `safeAddendum` iteration |
| DEEP-repair | `buildMaiaComprehensivePrompt` → `buildComprehensiveVoicePrompt` | ⛔ **no** — the documented divergence debt |
| DEEP-primary | `consciousnessOrchestrator` | ⛔ unwired entirely |

⭐⭐ **Therefore P5 (tier invariance) is structurally unreachable by adding an
addendum.** Any addendum-shaped Focus would appear in CORE, vanish in FAST and
DEEP, and the failure would look like MAIA being inattentive rather than blind.
That is precisely the *"works in FAST, vanishes in CORE"* bug named in the gates
— and it is the current state of the codebase for every addendum, not a
hypothetical.

> **Tier invariance cannot be achieved by adding a participant. Only by rendering
> one already-adjudicated turn into every tier.**

## F3 · The lawful renderer exists and has zero live callers

- `renderTurnForCognition(turn, strategy)` — one renderer; floor first, admitted
  participants in registry order, floor last. Its own header: *"M1 standing: zero
  live callers. Becomes the tier prompt seam at M3."* **Still true.**
- `constructCanonicalTurn(inputs)` — one caller in the whole repository:
  `app/api/sovereign/app/maia/list/route.ts:1295`, in **shadow** mode
  (`cognitionPath: 'shadow'`), on `sovereign_chat`. It is not reached from
  `getMaiaResponse` at all.

⛔ So the Focus route calls `getMaiaResponse`, which is upstream of **nothing
canonical**. This is not "wire one producer"; it is "give this room a canonical
prompt path where none exists yet".

## F4 · Candidates are currently DERIVED FROM legacy addenda

`candidatesFromLegacyAddenda(legacy, partitions)` maps legacy meta keys onto
producer ids. That is right for a shadow comparison and **backwards for a
producer that should be typed at origin**: adding Focus as a legacy addendum
would make the canonical block a derivative of the very channel this lane exists
to avoid.

⭐ The Writer's Studio producers are already registered and admitted to the room
(`member.writer_focus`, `retrieved.writer_work_context`, `computed.writer_structure`,
`member.writer_intention`, `member.writer_commission`, …), and
`ROOM_POLICIES.writers_studio` exists. **Nothing about them is missing except a
path.** Grep confirms none is referenced outside the registry, membrane, policy
and tests — they have never been constructed.

## F5 · The smallest lawful seam

The renderer fixes membership at **construction** and lets `TierStrategy` vary
only scaffold and repair instruction. So P5 is satisfied *by construction* if the
turn is built once, before tier routing, and each tier renders it instead of
assembling its own participant portion:

```text
writers_studio turn
   → parseWriterStudioContext (typed, validated, forbidden keys refused)
   → CandidateBlocks, one per producer, authored separately
   → constructCanonicalTurn({ room: ROOM_POLICIES.writers_studio, … })   ← MIPA here
   → renderTurnForCognition(turn, { tier })                              ← membership fixed
   → FAST | CORE | DEEP receive the SAME participants, different strategy
```

⛔ **This requires a branch inside `getMaiaResponse`**, entered only when the turn
declares the `writers_studio` room. That is the narrowest honest option: it gives
one room a canonical path without attempting M3 for the whole organism, and it
cannot leak — a room that does not declare itself does not take the branch (P3).

## Producer split for the first crossing

| Producer | Carries | Authority |
|---|---|---|
| `member.writer_focus` | where the writer placed attention — aperture identity, scope, label | member-placed, over attention |
| `retrieved.writer_work_context` | the Work MAIA may read around that aperture | member-authored context, **never instruction** |
| `computed.writer_structure` | part↔whole location | ⛔ **only if the route actually retrieves it — it does not today** |

⛔ **One generic block must not swallow all three** — that recreates the
mixed-authority problem the registry exists to prevent. And ⛔ **producer
availability follows what was actually assembled**: the route retrieves exactly
the authorized scope, so whole-Work context must not be manufactured merely
because a producer for it exists.

## Gate readiness

| | Reachable today? |
|---|---|
| P1 no meta channel | ⭐ yes — delete the field, construct typed candidates |
| P2 registered producers only | ⭐ yes — the producers exist |
| P3 room adjudication | ⭐ yes — `ROOM_POLICIES.writers_studio` + MIPA |
| P4 Work ≠ instruction | ⭐ yes — ask stays `cognitionRequest`; Work is a participant |
| P5 tier invariance | ⛔ **only via F5's seam.** Unreachable by any addendum. |
| P6 manifest truth | ⭐ yes — `constructCanonicalTurn` emits the manifest |
| P7 hostile mutation | ⭐ yes |

**Standing: FOCUS-PRODUCER-01 CENSUS COMPLETE · repair NOT AUTHORIZED · the seam
in F5 needs a founder act because it opens a canonical prompt path inside
`getMaiaResponse` · route stays disabled · human witness HOLD · `#1275` FROZEN.**
