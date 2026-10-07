# JARVIS-WS-RD-RECOVERY-01 · R8H — Hermes Develop Craft Canvas

**Date:** 2026-10-06
**Status:** IMPLEMENTED CANDIDATE · founder visual/experiential witness required

## Founder ruling

Writer’s Studio has two different manuscript relationships and they must not collapse into one:

- **Write** is the clean authorship room. The writer writes.
- **Develop** is the craft room. The writer and MAIA work the writing.

Craft therefore belongs to **Develop**, not Write.

The manuscript substrate is shared, but the interaction contract differs.

## Hermes architecture

The Studio now recognizes four experiential layers:

1. **Orientation** — the whole field and what MAIA lawfully knows.
2. **Seeing** — perception of what is happening in this particular place.
3. **Dialogue** — writer and MAIA discover what wants to happen.
4. **Craft** — understanding becomes form.

Hermes is not a fifth room. Hermes is the continuity crossing between these layers.

> You do not have to explain everything again. What you and MAIA discovered comes with you.

A meaningful human gesture advances the relationship. A chapter selection carries attention. A conversation carries understanding. A passage selection carries locus. A writer-authored version carries authorship.

## R8H correction to R8G

R8G proved the constitutional carry and introduced the Craftsman Guide, but its principal craft workspace still behaved too much like a detached working-version/editorial room.

R8H changes the visual and interaction center:

**the manuscript page itself is the Craft Canvas.**

The side field may still hold MAIA, reasoning, examples, questions, and the writer’s alternate wording, but it is no longer the place the craft act is visually located.

## Write vs Develop

### Write Canvas

- clean manuscript;
- direct authorship;
- no persistent analytical markup;
- no editorial proposal layer unless explicitly summoned;
- ordinary writing remains primary.

### Develop Craft Canvas

- same canonical manuscript substrate;
- selectable but non-destructive prose;
- exact editorial locus;
- visible proposal marks on the manuscript;
- individual edit decisions;
- MAIA conversation and craft guidance alongside the page;
- no manuscript mutation until explicit Apply.

## Markup ↔ Preview

Develop Craft has two first-class perceptual views of one revision state.

### Markup — editor’s eye

Canonical prose remains visible.

Conventional editorial graphics communicate the proposal:

- red brackets / strike marks identify language proposed for deletion or replacement;
- blue insertion copy identifies proposed new language;
- each change remains individually addressable;
- a change can be used, rejected, questioned, taught, or redirected;
- selected changes compose a writer-owned version.

Markup is not mutation. It is a proposal layer.

### Preview — reader’s eye

Markup disappears.

The manuscript renders as it would read with the writer’s **currently chosen** changes.

- no Apply is required to preview;
- returning to Markup preserves the same selection state;
- if the head version is writer-authored, Preview shows that writer-authored wording as the authority;
- Preview never silently promotes an unchosen MAIA edit.

Thus the core loop becomes:

> **Markup → choose / change → Preview → read → Markup → refine → Preview → Apply**

## Hermes crossing law

The crossing no longer depends on MAIA already possessing an exact passage citation.

After a meaningful Work conversation:

> **Work this into the writing →**

is lawful whenever a current chapter/section is known.

Two outcomes remain lawful:

1. **Exact passage established** — Develop Craft opens at that locus.
2. **Only chapter/section established** — Develop Craft opens there and the writer selects the exact words.

In both cases the Work-conversation thread ID and selected MAIA turn are carried as identifiers only. The server re-resolves the exact conversation and preserves writer-authored and MAIA-authored turns as separate provenance.

## Conversation-only crossing

R8H explicitly repairs the failure witnessed in Chapter 10: a useful chapter conversation previously lost the Hermes affordance when the developmental reading did not name one exact section/passage.

Now:

- chapter conversation may cross into Craft without a prior passage citation;
- the writer chooses the locus if needed;
- the prior conversation is still re-resolved server-side;
- the writer does not restate the insight.

## Authorship and mutation boundary

The visual richness of Develop Craft does not weaken custody.

- red deletion marks do not delete;
- blue insertion marks do not insert;
- selecting a mark does not mutate the manuscript;
- Preview does not mutate the manuscript;
- saving a writer-owned version does not mutate the manuscript;
- only explicit **Apply** crosses the manuscript boundary;
- Undo remains available after a lawful application.

## Implementation seams

R8H reuses the existing canonical manuscript and editorial systems rather than introducing a second editor:

- P4R1StudioHost routes mode=develop&developCraft=1 to the shared manuscript/editing controller with a Develop Craft surface contract;
- WholeManuscriptSurface gains a read-only/selectable presentation used by Develop Craft while Write remains editable;
- P4R1Pc3WriteEditView owns Markup ↔ Preview presentation;
- RevisionManuscriptLayer provides in-page edit geometry and interaction;
- editorialDiff.composeSelected produces Preview from the writer’s chosen marks;
- member-authored saved wording remains authoritative in Preview;
- ordinary Develop conversations can now invoke the Hermes crossing directly.

## Focused engineering witness

Current R8H focused witness:

- flagship TypeScript check: **PASS**
- focused Hermes/Develop/Craft suite: **8 suites · 51 tests PASS**
- git diff --check: **PASS**
- localhost:3738: **HTTP 200**

This is engineering evidence only. Founder visual/experiential witness remains required.

## Founder witness

On localhost:3738:

1. Open Chapter 10 in Develop.
2. Continue a meaningful conversation with MAIA.
3. Choose **Work this into the writing →**.
4. Confirm Develop remains the selected room.
5. If no exact locus exists, select the passage yourself.
6. Confirm the manuscript stays central and the Craft Canvas appears.
7. Request/provoke wording possibilities.
8. Confirm red deletion/replacement marks and blue insertion language appear on the manuscript.
9. Select some but not all changes.
10. Toggle **Preview**.
11. Confirm only selected changes are rendered cleanly.
12. Toggle **Markup** and continue refining.
13. Confirm nothing changes in the manuscript until explicit **Apply**.

## Governing sentence

**Write is where I author. Develop is where I craft. Hermes ensures that what I discover with MAIA survives the crossing into form without surrendering authorship.**
