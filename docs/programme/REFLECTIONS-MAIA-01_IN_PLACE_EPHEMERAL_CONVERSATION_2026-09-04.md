# REFLECTIONS-MAIA-01 · In-place ephemeral conversation

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
