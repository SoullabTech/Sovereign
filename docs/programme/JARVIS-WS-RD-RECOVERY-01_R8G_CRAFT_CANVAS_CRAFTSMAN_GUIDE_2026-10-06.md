# JARVIS-WS-RD-RECOVERY-01 · R8G — Craft Canvas / Craftsman Guide
## Founder design ruling · 2026-10-06

**Founder finding:**

> There is a third creative/craftsman function missing between insight/information and MAIA conversation. The informational field and the conversational field need to converge on an interactive canvas where the actual making happens.

**Standing:** IMPLEMENTED CANDIDATE · FOUNDER EXPERIENCE WITNESS REQUIRED

## 1. The missing layer

Writer's Studio currently has two strong but incomplete states:

1. **Seeing / insight**
   - what MAIA notices;
   - evidence;
   - chapter movement;
   - what may need attention.

2. **Relating / conversation**
   - writer intention;
   - disagreement;
   - meaning;
   - clarification;
   - shared understanding.

Neither is, by itself, the place where the prose is actually made.

The missing state is:

3. **Craft / making**
   - the exact passage is present;
   - MAIA can demonstrate craft possibilities;
   - the writer can use those examples as a primer;
   - the writer shapes language in their own truth;
   - MAIA can refine copy, rhythm, clarity, convention, and reader effect around the writer-authored version;
   - nothing enters the manuscript until an explicit Apply act.

## 2. MAIA's Craftsman Guide faculty

The Craftsman Guide is **not another personality** and is not a new authority tier.

It is a faculty MAIA can use once the writer has chosen to move from understanding into making.

Its job is to:

- turn abstract editorial insight into concrete, visible craft;
- offer 2–4 illustrative examples or worked possibilities when useful;
- explain what each example demonstrates;
- invite the writer to borrow the move rather than the wording;
- help the writer draft their own version;
- treat the writer's rewritten wording as the new authority;
- then narrow toward copy/convention/clarity work unless the writer reopens meaning.

A craftsman example is a **primer**, not a proposal to paste.

## 3. The governing sequence

```text
SEE
  MAIA notices something in the Work
      ↓
RELATE
  writer + MAIA discover what matters / what is intended
      ↓
CHOOSE TO MAKE
  explicit writer act: “show me,” “let's work this out,” “help me shape it”
      ↓
CRAFT CANVAS
  current passage + carried understanding + MAIA craftsman examples
      ↓
WRITER AUTHORS
  writer rewrites / combines / rejects / creates
      ↓
MAIA REFINES
  copy · syntax · rhythm · convention · reader orientation
      ↓
APPLY
  explicit writer act
      ↓
REVIEW
  local fit · chapter fit · whole-Work fit
```

The transition from Relate → Craft must feel like one continuous relationship, not navigation into another product.

## 4. UI law — convergence, not a third permanent column

The solution is **not** to add another permanent panel between Develop and MAIA.

When the writer chooses to make something, the current insight/conversation composition **converges into one Craft Canvas**.

At rest:
- manuscript / Work remains primary;
- Develop insight is contextual;
- MAIA conversation is contextual.

At making time:
- the informational and conversational fields recede;
- a dedicated interactive Craft Canvas opens;
- exact passage, working version, examples, and MAIA guidance share one making surface;
- the writer can resize / stack the surface without being forced into narrow columns.

## 5. Existing substrate to reuse

The current `IsolatedEditorialRoom` already contains much of the latent Craft Canvas:

- exact passage focus;
- resizable / balanced / stacked layouts;
- “Show me examples”;
- “Give me ideas”;
- revision directions;
- editable **Your working version**;
- “Talk it through”;
- Apply flow;
- reading-size / spacing controls.

The recovery should **promote and recompose this existing substrate**, not invent another room.

## 6. R8G interaction model

### Entry from conversation

Once a writer has explicitly chosen to act, the conversation should offer:

> **Work this into the copy →**

or, when the locus is not exact yet:

> **Find the passage and work this out →**

The writer should not need to close MAIA, return to Develop, choose another card, and reconstruct the intent.

### Craft Canvas arrival

The Canvas opens with:

**What we're trying to do**
- a short server-resolved statement of the shared understanding;
- source-attributed internally;
- not a new model summary invented by the browser.

**Current passage**
- exact writer text;
- readable;
- never silently replaced.

**Craft examples**
- 2–4 examples / mini-demonstrations;
- unranked;
- explicitly labeled **Examples to spark your own version**;
- examples may be more substantial than the eventual edit because their purpose is to teach / evoke the move.

**Your working version**
- editable immediately;
- can start from original, an example, a hybrid, or blank;
- the writer owns what they type.

**MAIA — Craftsman Guide**
- “Show me another way”
- “Make the example more embodied”
- “What is the craft move here?”
- “Help me keep my cadence”
- “Copyedit my version”
- “Check whether I lost the meaning”
- free conversation.

## 7. Example vs proposal

This distinction is binding.

### Example
Purpose:
- teach;
- evoke;
- demonstrate;
- give the writer something concrete to react against or borrow from.

Standing:
- not a recommendation;
- not manuscript text;
- no Apply affordance directly from the example.

### Proposal
Purpose:
- offer wording that could become the actual passage.

Standing:
- bounded by revision latitude;
- comparison visible;
- explicit Apply required.

The Studio should default to **examples before proposals** when the writer is still discovering their own language.

## 8. Writer-authored truth resets authority

If the writer takes a MAIA example and writes:

> “No — this is what I mean.”

that new writer version becomes the current authority.

MAIA's earlier example is now historical craft context.

The Craftsman Guide then asks:
- does this say what you mean?
- can I help the copy carry it more clearly?
- did the cadence / image / ambiguity survive?
- does it still fit the chapter movement?

It does **not** pull the writer back toward MAIA's example merely because MAIA authored it.

## 9. Relational carry into Craft

The Craft Canvas must receive server-resolved continuity from the conversation that led there:

- source Work-conversation thread identity;
- relevant writer clarification(s);
- relevant MAIA craft insight / example;
- current Chapter Conversation Context identity;
- writer-established protections;
- current locus;
- current Working with MAIA state.

The browser may carry identifiers. It may not author the carry packet.

The exact turns remain speaker-attributed. A MAIA example must never be laundered into member-authored intention.

## 10. Experience-custody falsifiers

R8G fails if:

1. the writer has to restate the conversation on arrival in Craft;
2. Craft opens as another dashboard;
3. examples are presented as recommendations;
4. examples can be applied directly without an authored act;
5. the writer's rewrite is treated as subordinate to MAIA's earlier wording;
6. the system silently selects the exact passage from section-only evidence;
7. MAIA says “I can't help write this” when the lawful next act is demonstration or co-crafting;
8. the Canvas becomes a third narrow permanent column;
9. changing rooms loses the relationship / intention / chapter context;
10. the writer must understand Studio machinery to continue making.

## 11. Next bounded implementation sequence

### R8G-1 — Craftsman permission repair
Replace the old “I can't make changes for you” conversational law with:
- cannot silently mutate;
- **can** demonstrate, draft examples, brainstorm wording, and co-craft;
- explicit Apply remains the manuscript boundary.

### R8G-2 — Conversation → Craft handoff identity
Expose the active Work-conversation thread identity to the handoff and carry only server-verified identifiers into Write.

### R8G-3 — Server-resolved conversation carry
Resolve the relevant prior writer + MAIA turns as separate provenance blocks for the editorial runtime.

### R8G-4 — Promote `IsolatedEditorialRoom` to Craft Canvas
Recompose the existing passage / examples / working version / MAIA / Apply substrate under the Craft Canvas experience.

### R8G-5 — Example-first craftsman loop
Prove:
- MAIA example;
- writer uses it as primer;
- writer authors own wording;
- MAIA copy/refinement pass;
- explicit Apply;
- Review confirms fit.

## 12. Founder acceptance sentence

The slice passes only when the founder can say:

> **“This feels like how you and I actually wrote together: you helped me see it, showed me what the craft could do, I found my own words, and then you helped those words become finished prose.”**


## 13. R8G implementation witness · 2026-10-06

The first bounded Craft Canvas slice is now implemented as a candidate.

### Conversation → Craft identity
- the live Work conversation exposes only its durable thread id + selected MAIA boundary turn;
- no conversation transcript is authored into the URL;
- the server re-resolves ownership, manuscript identity, Work anchor, exact source turn, and exact prior turns before the editorial act persists;
- carry freezes at the selected MAIA turn so later conversation cannot leak backward into an earlier craft act;
- writer turns and MAIA turns enter canonical cognition as separate producers.

### Craft vs revision
- a conversation handoff uses `craft-passage` / `choose-craft-passage`, distinct from direct revision;
- exact evidence may open the exact passage;
- section-only evidence requires the writer to select the actual words;
- the first Craft turn is `reply_only`: MAIA demonstrates possibilities rather than authoring an apply-ready proposal.

### Craft Canvas
The existing isolated passage workspace now has an explicit Craft state:

> **Craft Canvas · See · Talk · Make**

It carries the relationship forward and tells the writer:

> **Your conversation has become craft.**

The Canvas presents MAIA as **Craftsman Guide**, labels her output **Examples to spark your own version**, and opens a real **Your working version** editor immediately. MAIA's examples are explicitly primers, not answers.

### Writer authority
The writer may borrow, reject, combine, or ignore MAIA's examples. Once the writer changes the working version, that wording is the current authority. `Work it through` sends that version back to MAIA under the rule that she must not restore her earlier example merely because it was hers.

Save → read in context → explicit Apply remains the manuscript boundary.

### Prompt-law correction
The prior conversational rule that could produce:

> “I can't make the changes for you — that's your work to do”

has been replaced.

The new boundary is:

> MAIA cannot silently mutate the Work. MAIA may help the writer create it.

Both Work and developmental dialogue now explicitly permit illustrative examples, provisional wording, sample rhythms, alternatives, and worked craft examples while reserving manuscript mutation for the explicit Craft / Apply path.

### Mechanical witness
Focused R8G / golden-slice population:

- **13 suites**
- **192 tests PASS**
- **0 failures**
- flagship Writer's Studio typecheck PASS
- source/diff hygiene PASS before staging

This is engineering evidence, not founder experiential PASS.

### Next human witness

The founder should now test on Chapter 10:

```text
MAIA conversation
→ Work this into the writing →
exact passage OR writer chooses exact words
→ Craft Canvas
→ Craftsman examples
→ writer creates their own version
→ Work it through with MAIA
→ Read in context
→ Save my version
→ Apply my version
```

The slice does not pass until this feels like one continuous act of making rather than a jump from conversation into software.
