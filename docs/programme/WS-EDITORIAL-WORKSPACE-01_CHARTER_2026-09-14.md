# `WS-EDITORIAL-WORKSPACE-01` — REPLACEMENT ARCHITECTURE · CHARTER

**Status:** CHARTER RETURNED · founder ruling 2026-09-14 · ⛔ NO CODE · NO SCHEMA · NO UI
**Governed by:** `JARVIS-WRITERS-STUDIO-EDITORIAL-01` · criterion `docs/canon/WRITERS_STUDIO_EDITORIAL_OBJECTIVE.md`
**Premise (founder, verbatim in substance):** *the current proposal card is DISPOSABLE. The next lane is a replacement architecture, not `ProposalCard v1.1`.*

> **The standard:** a writer should be able to enter one proposed edit and have a genuine
> editorial encounter with MAIA — from first observation through disagreement and revision
> to final decision — without leaving the manuscript.

---

## 1. Why the current surface cannot be improved into this

`app/writers-studio/ProposedChange.tsx` is a notification about a database row, and it is
honest about being one. Measured, not asserted:

- **`appendAuthoredVersion` — the function by which a WRITER authors a version — is called
  from ten places, all of them witnesses. ZERO UI.** The writer cannot author. The one verb
  that makes this a relationship rather than a delivery is unreachable from the product.
- **No surface in the application reaches a proposal chain at all.** Succession exists in the
  substrate and has never been rendered.
- The card therefore *cannot* show lineage, alternatives, authorship or conversation — not
  because it is badly designed, but because the objects it would need are unwired.

Its specific failures, each mapping to a missing object rather than to styling:

| the surface says | what it actually is |
|---|---|
| "It describes 1 change to the manuscript" | a **count** standing where the editorial thought belongs |
| "This proposal is for inspection… no control here will apply it" | the **frozen-instrumentation disclaimer leaking into the product as MAIA's voice.** The membrane executes now; this is the system apologising for a limitation it no longer has |
| "KEEP UNCHANGED" | the only affordance, and it is a **non-act** — *do nothing*, dressed as a decision |
| no input anywhere | MAIA speaks once and cannot be answered. **A verdict, not a conversation** |
| one card · one change | no succession, no counter-proposal, no comparison — though all three exist in the schema |

⛔ **It is retired, not refactored.** It survives only until the replacement is witnessed.

---

## 2. What the replacement can already stand on (census — reachable today)

| capability | substrate | state |
|---|---|---|
| authored succession, MAIA **and** member, in lineage order | `proposal_chains` · `proposal_versions` · `readProposalWork()` | ⭐ built, green, **unwired** |
| per-version rationale, absent-or-present | `proposal_versions.rationale` | built, unwired |
| the exact locus in the projected body | `ProposalWorkTarget.location` · `markableRange()` | ⭐ CUTOVER-01A, green |
| the conversation surviving a moved Work | R6 · `location.unavailable` ≠ mount lost | ⭐ green |
| paragraph-before / passage / paragraph-after | full section bodies + exact range | derivable, **no new substrate** |
| "show me the effect" (contextual diff) | `sentenceComparison(body, range, replacement)` | exists |
| version comparison | all versions returned in lineage order | derivable |
| the sovereign decision, exactly once | `RevisionAuthorization` · execute · duplicate-unspent law | ⭐ CUTOVER-01B.0, green |
| retry-safety under a lost response | same permission recovered, never a second | ⭐ green |

⭐ **The decision half of this design is finished.** What is missing is everything that happens
*before* the decision — which is the entire experience the founder is asking for.

---

## 3. ⭐⭐ THE FINDING — THREE OBJECTS DO NOT EXIST, AND THEY ARE NOT VERSIONS

The mock requires four things a `ProposalVersion` cannot carry, because a version is
**executable candidate wording** and the succession law exists to protect exactly that.

**(a) INSIGHT — MAIA's editorial observation.**
> *"This passage repeats an idea the previous paragraph already established, and the
> repetition slows the turn into your central argument."*

This is a reading of the Work, authored by MAIA, and it belongs to the **chain**, not to any
one formulation. `proposal_versions.rationale` is per-version and cannot hold it. There is no
column, no table, no object. ⛔ And per standing law it is a **separately authored insight,
never a member fact**.

**(b) DIRECTION — instruction without wording.**
> *"Give me a gentler option."* · *"Retain the spiral image without repeating the argument."*

The writer is not authoring a formulation; they are **instructing**. If a direction enters the
version chain it becomes authorizable, and `authorizeVersion` could be pointed at an
instruction. It needs its own home.

**(c) DISCOURSE — questions and answers in the thread.**
> *"Why do you think this is repetitive?"* → MAIA's reply.

A question is not a formulation. A thread that stores its questions as versions has corrupted
its own succession.

**(d) ⭐ THE RECOMMENDATION TO KEEP — and this one is the sharpest.**
> *"I would keep this. It looks redundant structurally, but the repetition is doing emotional
> work."*

The founder's own witness matrix names this case. **Today a chain exists only because there is
proposed wording.** An editorial act whose conclusion is *change nothing* has no
representation at all — MAIA cannot currently say "leave it," because saying anything requires
proposing a replacement. That is a genuine expressive hole in the ontology, and it is the
clearest proof that Insight must be able to exist with **no Suggestion beneath it**.

### ⛔ The collapse to refuse

```
    Insight      what MAIA sees                  authored, no wording
    Direction    what either party asks for      instruction, no wording
    Discourse    question and answer             not wording
    Suggestion   candidate wording               ProposalVersion — the ONLY authorizable thing
    Change       the member's act                RevisionAuthorization
```

**Nothing but a Suggestion may ever be authorizable.** The moment an insight, a direction or a
question can be reached by `authorizeVersion`, the whole Step-2 separation is undone from
above. This is the same family as every collapse this programme has caught: *proposal ≠
authorization · ruling ≠ wording · member declaration ≠ MAIA insight.*

⚠️ **A second correction to the mock, small and load-bearing.** It labels the tabs
`Original · Proposal 1 · Proposal 2`. Our versions carry **authorship** — MAIA's and the
writer's, interleaved. "Proposal 2" erases who wrote it, and a writer must never be unable to
tell their own sentence from MAIA's. The lineage renders authorship, always.

---

## 4. Sovereignty recedes into structure

Replace the three-sentence warning with one quiet line:

> **Nothing changes until you explicitly adopt a version.**

⭐ Under this architecture that sentence is **literally true and structurally enforced** —
which is precisely why it no longer has to shout. Provenance, authorship, authority and
proposal history move behind disclosure, available and not oppressive.

*Sovereignty is structural, not visually oppressive.*

---

## 5. Staged acts (each its own founder act)

```
W1  the thread replaces the card          lineage · authorship · rationale · read-only
W2  ⭐ FORMULATION COMPOSER                the writer authors the next candidate WORDING
                                          appendAuthoredVersion reaches the UI at last
                                          ⛔ questions and directions unavailable until W5
W3  the manuscript participates           locus reveal · highlight · per-version preview
                                          one interface, not two surfaces

W5  Insight · Direction · Discourse        the three missing objects; "I would keep this"
                                          becomes sayable          ← SCHEMA ACT
W4  MAIA answers inside the object        canonical turn — lawful ONLY once W5 exists

W6  comparison and the decision            Keep original · Revise · Adopt this version
W7  retire ProposedChange.tsx              only after the replacement is witnessed
```

⭐⭐ **CORRECTION 1 (founder, 2026-09-14) — W2 IS A FORMULATION COMPOSER, NOT A REPLY BOX.**
The first charter said *"authors, asks, directs"*, and those three verbs contradict §3 of this
same document. Before W5:

```
    writer authors wording     ✅  ProposalVersion
    writer asks a question     ⛔  Discourse has no home
    writer gives direction     ⛔  Direction has no home
```

So W2 lets the writer say *"No — I'd write it this way"* and create a `member` version. It must
**not** present as a generic box where *"why do you think this is repetitive?"* or *"give me a
gentler version"* could land in `replacementText`. ⭐ That still crosses the threshold that
matters — the system becomes **reciprocal authorship** rather than delivery — without falsely
calling reciprocal authorship *discourse*.

⛔ **And succession is the writer's act, not the UI's.** The store refuses a stale predecessor
with `not_successor_of_head`. No surface may synthesise succession after the fact or auto-retry
against a newer head.

⭐⭐ **CORRECTION 2 (founder) — W5 PRECEDES W4.** Until the missing objects exist, a question
and MAIA's answer have no durable home in this editorial object, so W4-first forces one of two
things the charter already forbids: storing MAIA's conversation **somewhere else** (a side
channel) or forcing question-and-answer into a `ProposalVersion` (succession corruption).
**W5 is the substrate that makes W4 lawful.** It does not block W1–W3.

W1–W3 need no new schema. **W5 takes its own authorized lane and branch** — the 2026-09-07
branch-gate defect is controlling.

⭐ **AND W1 IS BUILT MULTI-VERSION FROM DAY ONE.** The data we happen to hold today is mostly
one version per chain; **the contract is already multi-version** — `readProposalWork()` returns
the whole lineage and Step 1 exists precisely to preserve `MAIA v1 → member v2 → MAIA v3`.
⛔ The absence of UI-generated succession must not become a one-version UI architecture. W1 is
designed and witnessed against a real interleaved chain even though the first product visit may
encounter one version.

⛔ **THE FOURTH COLUMN MAY NOT BE FAKED WHILE W5 IS MISSING.** *"I recommend no change"* must
never be represented as `ProposalVersion(replacementText = the original text)` merely to satisfy
the schema we have. Until W5 lands that editorial act is **unrepresentable — and that is
preferable to a false representation.**

---

## 6. Acceptance — four genuinely different editorial acts × two views

```
            deletion   replacement   substantive rewrite   ⭐ MAIA recommends keeping
Section        ·            ·                ·                        ·
Whole          ·            ·                ·                        ·
```

Plus, on every cell: the locus illuminates in the manuscript · the writer types a real
objection and receives a real second proposal · versions compare with authorship visible ·
returning to the manuscript does not destroy editorial state · nothing moves until adoption.

⭐ **The fourth column is the discriminator.** A workspace that cannot represent *"I would keep
this"* is still a proposal vending machine with better typography.

---

## 7. Held

```
schema for Insight/Direction/Discourse   ⛔ own lane, own branch, founder act
Accept Changes orchestration (01B)       ⛔ HELD
old revisionProposal routes/runtime      ⛔ HELD until the replacement is witnessed
old-suite transfer · schema merge        ⛔ HELD
Step 2 closure                           ⛔ HELD
production                               UNTOUCHED
maia_focus_witness                       FROZEN
```

---

**The distinction the founder drew, kept:** the exact-locus work is **infrastructure, not the
redesign**. It matters because a sophisticated editorial experience cannot work if MAIA cannot
reliably point at the exact thing she is talking about. It is now green. It does not itself
constitute any part of the experience above.
