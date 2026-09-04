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
