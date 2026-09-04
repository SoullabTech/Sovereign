# REFLECTIONS-MAIA-01 · In-place conversation on a kept reflection

> **CANONICAL IMPLEMENTATION LANDED 2026-09-04** — see *Closure* at the foot of
> this document. Everything above that section is the **contract as originally
> written**, preserved unedited for provenance. Where the contract and the
> shipped implementation diverge, the Closure section governs.
>
> **The original title said "ephemeral". That term is retired** — see *Wording
> correction* in the Closure. It was never established for the MAIA turns, and
> the record must not be read as establishing it. The file was renamed with the
> closure (founder ruling 2026-09-04) from
> `REFLECTIONS-MAIA-01_IN_PLACE_EPHEMERAL_CONVERSATION_2026-09-04.md`, which
> carried a claim this document supersedes; nothing referenced that path. This
> remains one record with one address.

> **Contract only. No implementation is authorized by this document.**
> Founder ruling 2026-09-04. Opened out of the #1195 Reflections lane after the
> shipped behaviour was witnessed working and judged the wrong shape.

## What prompted it

`/reflections/[id]` ships a **Discuss this with MAIA** section that seeds the
existing one-shot prompt channel and navigates to `/maia`, with a return chip
back to the reflection. The full round trip was witnessed on production
(`cf6ce3ce`): payload delivered, chip rendered "Return to Abundance Meets
Resistance".

The mechanism works. The shape is wrong. The reflection should be *where the
conversation happens*, not a launchpad the member is thrown out of — a place to
return to what mattered stops being a place if attending to it ejects you.

## The governing distinction

> **A Keep is a confirmed member artifact. A conversation about a Keep is not
> permission to rewrite the Keep.**

This is not a preference. `app/api/capsules/route.ts` carries the Keep
Authority Contract (Kelly ruling 2026-08-28):

```text
OPEN KEEP     = UI/navigation act      = zero persistence
PREPARE KEEP  = distill for preview    = ephemeral only, zero durable write
CONFIRM KEEP  = explicit member action = persistence permitted
```

An in-reflection conversation that appended MAIA's replies to the capsule would
write to a member-governed artifact without the governing gesture. Ideas may
persist an ask-MAIA reply in-thread because Ideas is a *workspace*; a Keep is
something the member already confirmed and closed.

## Composition, not mutation

Even after an explicit confirm, **do not mutate the original reflection by
default**:

```text
original Keep          remains intact
conversation           happens around it, ephemeral
something emerged      member may confirm a NEW Keep from it
```

This preserves provenance and keeps the history legible. "What I kept then"
must not gradually absorb "what MAIA later said about it" — otherwise the
member's own record of a moment is silently rewritten by a model, which is the
precise failure the Keep Authority Contract exists to prevent.

## First contract — narrow

1. Render the exchange **inside** the reflection detail view.
2. Reuse the closest existing MAIA interaction seam where appropriate.
3. **No new persistence** for the conversation.
4. **No mutation** of the source capsule.
5. The existing explicit Keep/confirm gesture remains the **only** write authority.
6. Persistence or linkage between a source reflection and any later Keep is
   **not authorized yet** unless an existing contract already supplies it.

## Invariant — ephemerality must be legible

> **Ephemerality must be legible to the member.** The interface must not imply
> that an in-reflection MAIA exchange has been saved when it has not. Before the
> member leaves the exchange, the persistence status must be understandable
> **without knowing the underlying architecture**.

Bound as an invariant 2026-09-04, ahead of any implementation. It authorizes no
copy, no UI treatment, no persistence and no build — it exists to prevent a
future implementation from being technically sovereign while experientially
misleading.

The symmetry is the point:

```text
silent persistence      prohibited
silent disappearance    also prohibited
```

Member authority requires both. MAIA cannot quietly write into the Keep, and the
interface cannot quietly let a meaningful conversation vanish under the member's
reasonable assumption that it was stored. A system that is correct in its code
and misleading in its surface has not honoured the member — it has only honoured
the audit.

## Existing seams (evidence, not a decision)

Scoped in-place MAIA conversation already exists in three shapes on canonical:

```text
app/api/ideas/[id]/ask-maia/route.ts             single-shot, PERSISTS to member_idea_blocks
app/api/studio/changes/[id]/mentor/chat/route.ts
app/api/studio/encounters/[id]/chat/route.ts
```

Ideas is the closest structural precedent and the clearest contrast: its
persistence is exactly what this lane must NOT copy. Which seam to reuse is an
implementation question this contract does not settle.

## Not authorized here

- Any write to `capsules` arising from the conversation
- Conversation history storage of any kind
- Changing the Keep Authority Contract
- Removing the existing seed-prompt hand-off before a replacement is witnessed
- UI design beyond "the exchange renders in the reflection detail view"

## Growth-obligation answers (CLAUDE.md), for the record

- **What uncertainty is introduced, and how is it preserved?** None about the
  reflection itself: it is immutable during the exchange, so whatever the member
  kept stays exactly what they kept. The conversation's status as *not yet
  meaning anything* is preserved by its ephemerality — it becomes durable only
  by a member act.
- **What provenance and ownership boundaries does this require?** A hard line
  between member-authored kept content and model-authored conversation. The
  composition model above is that line: separate artifacts, separate acts.
- **What new responsibility does this create?** That an exchange which felt
  significant is not silently lost either — the member must be able to see that
  nothing was saved, rather than assume it was. Ephemeral must be *legible*,
  not merely true.

## Lane state — frozen here

*(Historical: the state at contract-freeze, before implementation. Superseded by
the Closure block below — in particular the `MAIA exchange ephemeral` line,
which the implementation did not establish.)*

```text
REFLECTIONS-MAIA-01
  contract               OPEN
  implementation         UNAUTHORIZED

  source Keep            unchanged
  MAIA exchange          ephemeral
  automatic persistence  prohibited
  later Keep             explicit member confirmation only
  persistence status     must be legible
  exact UI/copy          deferred
```

---

# Closure — canonical implementation, 2026-09-04

## State

```text
REFLECTIONS-MAIA-01
  canonical implementation    YES — #1198 / 54cc0181
  production deployed         NO
  production witness          PENDING
```

Merged to `clean-main-no-secrets` at 2026-09-04T22:44:08Z from
`claude/maia-reflection-scope-v50j55`, head `0a3813e`, two commits, eight files.
All required CI green on `0a3813e` before merge — including `Docker Build Check`
(PASS 22:43:53Z, fifteen seconds ahead of the merge commit).

Deploys run from the Mac Studio and canonical has moved since; **nothing here is
live**. No production witness exists for this behaviour yet.

## Boundaries established

Three concepts, held apart. Collapsing them into one boolean is the drift to
refuse — a room may be fully MAIA-capable without every surface in it
advertising MAIA:

```text
canHost         eligibility / authority
showHandle      narrower affordance
openMaiaWith    explicit member invocation
```

```text
REFLECTIONS
  feed                     quiet
  detail                   object-scoped MAIA affordance
  general feed presence    UNRULED / intentionally held open
```

Encoded as `GoverendRoom.handleVisibility: 'room' | 'object'` in
`lib/maia/presence/place.ts` (defaults to `'room'`, so no existing room moved),
with pure `isMaiaHandleVisible()`. Visibility is always *narrower* than
eligibility: a registered place cannot buy a handle on an ungoverned route or a
full conversation surface. Whether MAIA should be generally present across
Reflections is deliberately **not** settled — `'object'` holds that question
open rather than answering it.

## Data / sovereignty

```text
source capsule              not mutated
sourceExcerpt               does not travel
member sees/edits payload   before sending
place context               type + id only
```

The member reads the full message in an editable field and can empty it before
sending; the original transcript excerpt stays on the page. Place context tells
MAIA only that a reflection is open and its id — never its contents.

## Wording correction — what was NOT established

The contract above records `MAIA exchange · ephemeral`. **Do not carry that
forward unqualified.** The implementation deliberately routes the member's
message into the **canonical ongoing MAIA conversation** through the ordinary
`handleTextMessage` path — the same handler as a typed turn, no second cognition
path, no second session.

The claim actually established is narrower:

> The discussion does not automatically persist into, or mutate, the source
> Keep/capsule. **No reflection-specific persistence is introduced.** Whatever
> persistence the ordinary canonical MAIA conversation already has remains
> governed by that conversation system; #1198 did not create a second
> reflection-thread persistence model.

Stated plainly so the earlier framing cannot later be read as a guarantee: **these
MAIA turns are not established to disappear.** They are turns in the member's
existing conversation and are governed by it. Contract items 3–6 (no new
persistence, no capsule mutation, confirm-only write authority) hold as written.

### Re-derived invariant — persistence DESTINATION must be legible

*Founder ruling 2026-09-04. Appended, not a rewrite: the original
"Ephemerality must be legible" invariant above stands as the record of what was
bound at contract time. This supersedes it for the shipped shape.*

The legible-ephemerality invariant was bound on the premise that the exchange
*is* ephemeral. The implementation changed that premise, so the invariant is
neither violated nor satisfiable as written. It is re-derived as:

> **The in-place exchange is part of the member's canonical MAIA conversation.
> It does not automatically become part of, append to, or mutate the source
> reflection/Keep. The interface must not imply otherwise. No special "this will
> disappear" warning is required, because disappearance is not established.**

What moved is *which* fact must be legible: not whether the exchange survives,
but **where it goes**. The durable symmetry:

```text
source Keep                    remains unchanged
MAIA turns                     enter canonical conversation
reflection-specific storage    none introduced
silent Keep mutation           prohibited
UI implying "saved into Keep"  prohibited
"ephemeral" guarantee          retired
```

**This documentation act authorizes no UI or copy change** — not unless the
existing surface is later shown to misrepresent the destination. Nothing was
added or removed on this basis.

## Evidence ceiling

```text
acceptance 2, 4     behavioral
acceptance 1, 3     source invariants, mutation-tested
rendered witness    still desirable after deployment
```

- **2** — same injected object re-renders → no duplicate send; a new nonce →
  explicit resend. Tested directly against pure `decideInjection()`.
- **4** — feed renders no quiet handle, detail does. Tested directly against
  pure `isMaiaHandleVisible()`.
- **1** — prior turns survive an injection. **3** — closing returns to the same
  reflection without navigation or reset. Both are **source invariants, not
  rendered interaction tests**: this repo has no React renderer in jest (node
  env, `.ts`-only `testMatch`, no `@testing-library/react`) and
  `OracleConversation` is ~11k lines. They assert on code with comments
  stripped, and were mutation-checked — inserting `setMessages([])` into the
  injection effect, and deleting the early `return` before `router.push`, each
  fail their guard.

A rendered interaction witness remains desirable, and a **production witness is
outstanding regardless**: nothing above was observed against live member use.
