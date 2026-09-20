# Cross-Lane Findings from MOTION-CENSUS-01

**2026-09-20** · derived from `MOTION-CENSUS-01` · **three CANDIDATE findings**
**Status** ⛔ **NOTHING HERE IS RATIFIED.** Each finding names where it would go
*if* the founder takes it. ⛔ No canon edited · no gate changed · no lane opened ·
no component touched · PRODUCTION UNTOUCHED.

---

The motion census and its finding-2 witness were about motion. These three are
not. They are properties of how MAIA's law, instruments and turn-path are built,
which the motion work made visible because it happened to stress all three at
once.

Each is recorded with its evidence, its proposed home, and what it does **not**
authorize.

---

## Finding 1 · A law written as a mitigation decays. The canon already knows this.

### Evidence

`docs/SOULLAB_DESIGN_CANON.md`, "Animations & Transitions":

> "Framer Motion animations **can cause rendering issues**. For critical content
> visibility: use CSS transitions instead of `motion.div`; avoid
> `initial={{ opacity: 0 }}` on important content."

Measured conformance: **493 of 780** member-facing motion files use the named
pattern; **6 of 6** examined conversation surfaces apply it to MAIA's own words.

### ⭐ The finding is not that it was ignored — it is *why* it reads as ignorable

The rule's premise is **contingent and falsifiable**: *framer has rendering
issues*. A contingent premise expires. A reader in 2026 reasonably assumes the
library was patched, or that their case differs, and the law goes with the
premise. Nobody inherits a workaround.

Compare the same concern stated as an invariant:

> MAIA's words must not depend on anything to become readable.

That premise — *MAIA's speech is critical* — is constitutional and does not
expire on a dependency's release notes.

### ⭐⭐ This is not an imported principle. It is the canon's own, and the motion rule is its only violation.

A sweep of the canon for mitigation-framed rules returned **three hits, and the
other two forbid exactly this reasoning**:

| source | says |
|---|---|
| `SOULLAB_DESIGN_CANON.md` | *"Framer Motion animations can cause rendering issues…"* — **the outlier** |
| `LONGITUDINAL_MEMORY_CATEGORY_GRADIENT.md` | *"the gradient itself needs revision — **not workarounds at the implementation layer**"* |
| `MAIA_SOVEREIGNTY_INVARIANTS.md` | lists as a violation: *"Asking the user to learn workarounds for the system's own design failures."* |

**The one rule drafted as a mitigation is the one rule that failed 493 times.**
One instance is not a trend — but the canon elsewhere already rejects the
drafting style, which makes the outlier a lapse against existing law rather than
a new discovery.

### Proposed: a drafting test, not a new charter

> **If a rule's premise could be discharged by a dependency's patch release, the
> rule will decay. Restate the premise constitutionally or do not write the rule.**

⛔ **Deliberately not proposed as a fifth canon document.** The contracts README
already ruled that *"a fifth charter would have joined the same unenforced
shelf."* This belongs as a line in whatever governs how canon is drafted, or
nowhere.

⛔ **Does not authorize** rewriting the motion rule. That rewrite is entangled
with the open ruling on whether motion gets law at all.

---

## Finding 2 · FR-14 is a general instrument law ratified in one lane

### Evidence

`FR-14 · Verifier coverage law`, **RATIFIED 2026-09-07**, states:

> **A verifier passes only when every executed assertion passes AND every
> required constitutional assertion is still present.**
>
> **An instrument can satisfy all of its remaining questions by forgetting to ask
> the difficult ones.**

It was **demonstrated, not theorized**: deleting four assertions left the
remainder passing and the verifier reported `0 failed`.

Every reference to FR-14 in the repository sits inside `JARVIS-CIRCLES-01`. Its
scope is the Circles verifier.

### ⭐ It paid again immediately, in an unrelated lane, on the first instrument that stressed it

`scripts/witness/maia-turn-visibility.ts` was told `MaiaBubble.tsx` renders turn
text. Its detector looked for `message.text`; that surface holds the turn in
`displayedText`. The instrument found nothing.

Because it was written to **fail closed**, it reported `INSTRUMENT FAILURE` —
*the render shape moved, do NOT read this as a pass* — rather than green. The
investigation that followed found the **most severe violation in the set**: turn
text keyed on its own streaming content under `AnimatePresence mode="wait"`, so
every token remounts the node and restarts the fade from invisible.

**Had that instrument scored its own silence as success, the worst violation
would have been invisible to the instrument as well as to the member.**

### The distinction that keeps this from over-applying

Two different silences, and only one is a defect:

| situation | correct report |
|---|---|
| no targets in scope | **pass** — legitimately nothing to check (`check-design-canon.ts` does this correctly) |
| target in scope, detector found nothing inside it | ⛔ **never a pass** — the instrument does not know what it did not find |

### Proposed

Promote FR-14 from the Circles charter to **general instrument law**, and audit
each committed gate against it once: `check:no-supabase` · `check:design-canon` ·
`verify-constitution-colab` · the typecheck gate · the refusal registry · the S3
substrate guards · `verify:deploy-provenance`.

The audit question is one sentence: **when it finds nothing, does it report
*nothing is wrong* or *I found nothing*?**

⛔ **Does not authorize** changing any gate. The audit is a read; each repair
would be its own act.

---

## Finding 3 · A recurring defect class — MAIA's turn contingent on a subsystem with no stake in it

### The three instances

| date | MAIA's turn was contingent on | which has no stake in |
|---|---|---|
| **2026-09-07** ✅ repaired | TTS success — the only non-streaming append sat inside `maiaSpeak()`'s success branch | the transcript |
| **2026-09-20** ⚠️ open | an entrance animation completing — turn text renders at `opacity: 0` on 6 surfaces incl. live `/maia` | readability |
| **2026-05-24** ⚠️ open | `buildComprehensiveVoicePrompt` iterating addenda — it does not, so DEEP-tier memory reaches `MaiaContext` and never the prompt (`ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` §II.B) | memory |

A fourth, repaired alongside the first: `showVoiceText` — **a render preference
deciding what MAIA could remember saying**, since a turn that never entered
`messages` was absent from the next turn's `conversationHistory`.

### ⭐ Why this is a class and not three coincidences

Each is a different subsystem, a different layer, a different lane, found by a
different method — and the shape is identical every time. MAIA's turn is
produced correctly and then made **dependent on a component that has no reason
to care whether it survives**. TTS is indifferent to the transcript. An
animation is indifferent to readability. A prompt builder that does not know
about a channel is indifferent to memory. A render preference is indifferent to
what can be remembered.

⚠️ **None of the three open items is an observed member-facing failure.** The
2026-09-07 instance was measured and repaired; the other two are **structural
exposure**. The class is an argument for looking, ⛔ never evidence of harm.

### Candidate invariant — ⛔ NOT ratified

> **MAIA's turn — its content, its record, and its legibility — may not be
> contingent on any subsystem that has no stake in it.**

Sovereignty Invariants currently run to **17**; this would be **candidate 18** if
taken.

⭐ **It is checkable, which is why it is worth having.** It converts to a design
question any reviewer can ask of any new path: *does MAIA's turn now depend on
this, and does this care?* That is the same shape as the growth-obligation check
already in `CLAUDE.md` — answered, not passed.

⛔ **Does not authorize** repairing the two open instances. Both have their own
pending founder rulings.

---

## Standing

**CANDIDATE ×3 · ⛔ NONE RATIFIED · ⛔ NO CANON EDITED · ⛔ NO GATE CHANGED · ⛔ NO
LANE OPENED · ⛔ NO COMPONENT TOUCHED · PRODUCTION UNTOUCHED.**

Each finding is a founder ruling: take it, narrow it, or refuse it. ⭐ Finding 2
is the only one that is cheap and almost certainly correct — FR-14 is already
ratified law, and the proposal is only that its scope was drawn too small.
