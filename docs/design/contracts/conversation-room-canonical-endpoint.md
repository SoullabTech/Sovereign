---
room: Conversation
human_activity: speaking or writing with MAIA — the member in live conversation, reaching the one MAIA rather than an unnamed substitute
surfaces:
  - components/OracleConversation.tsx
change_class: structural
principles:
  - MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION — "Voice may have a different capture path. It may not have a different mind"; a MAIA-branded surface must not reach a reduced or different cognition path
  - INHABITABLE_ARCHITECTURE_STANDARD design law 1, Every capability must have a home — "no orphan features"; a mount that names no route is an orphan reaching whichever home the default happens to point at
  - INHABITABLE_ARCHITECTURE_STANDARD design law 2, The interface reveals, it does not expose — a house does not display the plumbing, and it does not mislabel it either
reference_surfaces:
  - docs/design/contracts/conversation-room-voice-capture.md — the governing precedent; a narrow contract authored so a defect in a Conversation-room component could be fixed under the gate rather than around it, consulted for shape and for its stated principle that a governance gate must not become a permanent exemption
  - docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md — names this exact defect at :148-149 as the live way the gate's verdict could turn RED
  - __tests__/voice-non-degradation.test.ts — the source-property suite that pins the convergence point and the /maia mounts
shared_with_house: the House rule that a member reaches ONE MAIA — the same mind, the same memory, the same discernment, whichever door they came through and whichever modality they used; no room may silently substitute a thinner intelligence
distinct_to_room: this is the room where the substitution would be invisible, because a degraded conversational path still answers fluently — every other room fails visibly when miswired, so only here must the wiring itself be gated rather than the output
structural_rationale: Nothing renders differently. The change makes the existing `apiEndpoint` prop REQUIRED (removing a default), corrects a comment that described a path the Deep-Intelligence Gate proved false, and corrects two console.log strings that named that same false path. No layout, copy, gesture, timing, state or route in live use changes — all five existing mounts already pass the canonical endpoint explicitly, so runtime behaviour before and after is identical. The only behavioural difference is at COMPILE time, on a mount that does not yet exist: omitting the prop is now TS2741 rather than a silent reroute. There is no member-visible surface to screenshot and no experiential difference to verify; asserting one would be manufacturing evidence.
---

# Conversation (canonical endpoint) — Experience Contract

**Scope, stated plainly.** This contract governs `components/OracleConversation.tsx`
for one structural property: **that the conversational route a surface reaches is
named at the mount and can never be inherited from a default.** It is **not** the
Conversation room's experiential contract. It does not describe how the room
should feel, look, sound, or behave, and it must not be cited as though it did.

## The defect this was written to close

`apiEndpoint` carried a default of `/api/between/chat` and was overridden to
`/api/sovereign/app/maia/list` at every real mount. A surface that mounted this
component and forgot the prop would silently reach a different conversational
route — a different cognition path — with no error, no warning, and output that
still looked like MAIA.

That is degradation by **omission** rather than by intent, and it is the failure
the Deep-Intelligence Gate exists to prevent. The doctrine names it directly:

> the omission hazard at `apiEndpoint` standing as the live way it could turn RED
> without anyone deciding to make it so.

The house rule it violates is design law 1. A mount that names no route is an
orphan capability — it still has a home, but nobody chose which.

## Why this is a room question and not only a wiring question

A miswired route in any other room produces something a member can see: a blank
panel, a failed save, a missing entry. Here it produces a fluent answer. The
member experiences a conversation that works, with a MAIA who is quietly thinner —
less memory, less continuity, less discernment — and has no way to tell. The
degradation is invisible from inside the encounter.

That is why this room's wiring is gated where other rooms' output is gated. The
member's only protection is that the substitution cannot be made by accident.

## ⚠️ Over-coverage this contract creates — named, not hidden

The design-canon gate treats a surface as covered if **any** contract's `surfaces`
glob matches it. This contract claims `components/OracleConversation.tsx` with
`change_class: structural`, which waives the screenshot and
`experience_verification` requirements.

**Consequence:** until the Conversation room's real experiential contract is
authored, a genuinely *experiential* change to the app's primary conversational
component can satisfy the gate by matching this structural contract, and ship with
no desktop/mobile evidence and no experiential verification.

This is a real reduction in gate strength on the most member-facing component in
the app, and it is larger in effect than the same move in
`conversation-room-voice-capture.md` — that contract claimed a component with no
importers, where the coverage cost was nil. This one claims a live surface.

It is recorded here rather than left to be discovered because the alternative was
worse in both directions: refusing to land a fail-closed safety fix until a large
unauthored design work is complete, or asserting experiential evidence for a change
that renders nothing.

**Therefore, held open and owed:** the Conversation room's experiential contract
remains **unauthored work**, and this contract raises its priority rather than
discharging it. When it is authored, it should claim
`components/OracleConversation.tsx` as an `experiential` surface, and this
contract should be narrowed or retired. Until then, treat any experiential change
to this component as **ungated in practice** and require its evidence by hand.

## What was verified

Structure only. This contract makes no claim about the quality of the intelligence
reached through the canonical endpoint — that remains the human witness the
Deep-Intelligence Gate reserves, and no test or contract substitutes for it.

| Claim | Evidence |
|---|---|
| Omitting the prop is refused at compile time | probe: removing `apiEndpoint` from one mount yields `TS2741: Property 'apiEndpoint' is missing … but required in type 'OracleConversationProps'`; probe reverted |
| No call site relied on the removed default | all five mounts pass `apiEndpoint` explicitly — `app/maia/page.tsx:843,:1540`, `app/studio/maia/page.tsx`, `app/field/talk/page.tsx`, `components/maia/presence/MaiaPresence.tsx` |
| Live routing unchanged | no mount's endpoint value was edited |
| Invariant still pinned | `__tests__/voice-non-degradation.test.ts` 5/5 |
| No type regressions | `npm run typecheck` — 231 errors vs baseline 239, identical to the pre-change run |

## What is NOT claimed

- Not that the Conversation room has been designed, described, or contracted.
- Not that voice and text produce equally good conversation — only that they reach
  the same cognition boundary.
- Not that a mistyped-but-present route would be caught. Omission is closed; a typo
  is not. That remains open work.
