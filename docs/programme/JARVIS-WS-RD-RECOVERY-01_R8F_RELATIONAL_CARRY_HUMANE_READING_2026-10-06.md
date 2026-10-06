# JARVIS-WS-RD-RECOVERY-01 · R8F — Relational Carry + Humane Reading
## Founder ruling / design contract · 2026-10-06

**Founder ruling:**

> **Once writer and MAIA have reached enough shared understanding to act, the Studio should carry that understanding forward automatically. The writer should never have to translate a conversation into software operations.**

Founder-described working pattern:

> MAIA noticed where content or context was missing, made a suggestion, the writer rewrote it to fit his truth, then MAIA edited that writer-authored version to fit copy and conventions.

**Standing:** RATIFIED DIRECTION · TYPOGRAPHY IMPLEMENTED · RELATIONAL CARRY IMPLEMENTATION NEXT
**Does not authorize:** silent manuscript mutation, model-inferred assent, or replacing the writer's own rewording.

## 1. Conversation is not pre-processing

Writer–MAIA conversation is part of the editorial act.

The Studio must not require the writer to:
- restate what was just established;
- translate a shared understanding into editorial terminology;
- reselect a mode merely to preserve context;
- manually reconstruct why a passage was chosen;
- carry MAIA's insight from Develop into Write by copying and pasting it.

A room transition may change tools and scale. It must not reset the relationship.

## 2. The threshold for action is a writer act

MAIA may sense that enough shared understanding exists, but may not silently declare agreement.

The action threshold is crossed by an explicit writer act, for example:

- “yes, that's what I mean” followed by “work on this”;
- “show me the smallest change”;
- clicking **When you're ready · choose a passage to work on →**;
- selecting an exact passage after a section-level observation;
- approving a displayed revision.

The model does not award itself permission.

## 3. Relational handoff packet

When the writer chooses to act, Write should receive a server-resolved handoff packet containing only the lawful, relevant context:

1. **source relationship identity**
   - Work conversation thread;
   - relevant turn range;
   - no browser-supplied transcript.

2. **current shared understanding**
   - writer's latest clarification / correction;
   - the specific MAIA observation or proposal being acted on;
   - writer-established protections and intentions.

3. **epistemic context**
   - current chapter reading identity;
   - Chapter Conversation Context source classes;
   - exact current manuscript revision.

4. **locus**
   - exact passage when lawfully established;
   - otherwise section-level orientation plus a requirement that the writer select exact words.

5. **intervention permission**
   - current relational posture;
   - requested action;
   - revision latitude;
   - nothing broader than the writer invited.

The packet is derived on the server from persisted identities. The browser may carry identifiers; it may not author the context.

## 4. The preferred authoring loop

The golden loop is:

```text
MAIA notices
→ conversation establishes meaning / intention
→ writer chooses to act
→ Studio carries understanding into Write
→ exact passage is established
→ MAIA offers the smallest useful possibility
→ writer rewrites / modifies / keeps / rejects
→ writer-authored wording becomes the current authority
→ MAIA may copyedit / conform to requested conventions without changing truth
→ writer applies
→ Review tests fit locally, in chapter, and in Work
→ relationship returns with provenance and Undo
```

The writer's rewrite is not treated as a rough draft that MAIA may restore toward her earlier version.

Once the writer changes the wording, **their current wording is the authority**.

## 5. MAIA's role after the writer rewrites to truth

If the writer says, in effect:

> “This is what I actually mean.”

MAIA's next editorial job is usually narrower:

- clarity;
- syntax;
- grammar;
- copy consistency;
- formatting/convention;
- reader orientation;
- small rhythm repair.

MAIA does not reopen ontology, meaning, or the earlier editorial argument unless:
- the writer asks;
- the new wording creates a material contradiction;
- Review finds that the intended effect was lost.

This preserves the pattern:
**MAIA helps locate → writer authors truth → MAIA helps the truth cross cleanly into prose.**

## 6. Review after Apply

After a revision is applied, MAIA checks:

### Local
Did the exact passage improve the issue being worked on?

### Chapter
Did voice, rhythm, ceremonial movement, meaning, and surrounding transitions still hold?

### Work
Does the change still fit the book's established arc, protections, and writer intention?

Review may conclude:
- the edit worked;
- the edit partly worked;
- the original was stronger;
- a lighter intervention is preferable.

Review is never required to justify the edit merely because MAIA proposed it.

## 7. Humane conversational reading

Founder witness of the first repaired Chapter 10 conversation:

> MAIA's insight was good, but the font was too small/dense and the response appeared as a solid field of text.

R8F reading law:

- MAIA's primary conversational prose uses a larger reading size;
- generous line spacing;
- maximum readable measure;
- short visual paragraphs;
- one idea allowed to land before the next;
- no compressed “inspector log” aesthetic.

Implementation candidate:
- MAIA chapter-turn body: 17.5px, 1.82 line height, max 64ch;
- 18px on wide desktop;
- short paragraph spacing;
- composer increased to 16.5px / 1.7;
- Intimate / Guided / Mapped prompt laws now request breathable paragraphs;
- if a model returns one long paragraph, the UI may segment its exact stored sentences into visual two-sentence paragraphs for display only.

The persisted turn is never rewritten by this presentation transform.

## 8. Experience-custody gates

R8F fails if:

1. Develop understanding disappears on entry to Write.
2. The writer must manually restate what was just agreed.
3. MAIA treats her earlier proposal as more authoritative than the writer's subsequent rewrite.
4. A section-level observation silently becomes a model-chosen exact edit locus.
5. “Agreement” is inferred without a writer act.
6. Apply occurs without the writer knowing the exact wording affected.
7. Review merely praises the applied edit rather than testing it.
8. MAIA conversation renders as a dense wall of text during Intimate/Guided use.
9. room transition changes the relational posture or explanation register without the writer asking.

## 9. Next implementation act

After the current Chapter 10 G2–G3 re-witness passes:

**R8F-1 — bind Work-conversation source identity into the Develop → Write handoff**, then:

**R8F-2 — derive bounded shared-understanding context server-side for the editorial runtime**, then:

**R8F-3 — prove writer-rewrite → copy/convention refinement → Apply → Review-fit loop.**

R8M-T1 tester deployment remains downstream of this golden-slice custody.
