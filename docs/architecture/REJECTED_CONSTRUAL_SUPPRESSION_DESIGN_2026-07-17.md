# Rejected-Construal Suppression — Design Note — 2026-07-17

**Status**: Design only. Not authorized for implementation. Commissioned by Kelly's
Gold Reflection rulings (2026-07-17); see
`GOLD_REFLECTION_DECISION_REGISTER_2026-07-17.md`.

**Ratified ground** (register R7): when a member marks a construal `not-true`, that
wording must not become memory; the interpretation must not persist as established
context; it must not enter collective learning; it must not be rephrased and re-offered;
the rejection is retained only as a boundary, never as a psychological fact.

**Internal meaning of rejection**:
```text
Do not use this construal again without materially new evidence.
```
Never:
```text
Member resists this truth.
```

---

## 1. What exactly is rejected

The rejected object is a **construal**: a specific interpretive claim MAIA offered,
consisting of (a) the interpretation text, (b) the evidence set it was drawn from, and
(c) the semantic gist that survives paraphrase. It is **not**:

- the member's underlying material (marks, atoms, utterances) — that remains theirs,
  untouched, fully available;
- the member's response itself — which is a boundary record, not content;
- the topic. Rejecting "craft-with-your-hands keeps returning" does not make craft
  unmentionable; it kills *that construal of those moments*. The member may raise craft
  freely, and MAIA may respond to what the member raises — MAIA may not *reintroduce the
  construal*.

Proposed record shape (extends the Doc A reflection object; no migration authorized):

```ts
type SuppressedConstrual = {
  reflectionId: string          // the rejected reflection
  gist: string                  // short canonical statement of the construal's meaning,
                                // written for matching, not for display
  evidenceIds: string[]         // the evidence set it construed
  rejectedAt: string
  scope: "construal"            // never "topic", never "member-trait"
  reopenedBy?: string           // reflectionId of a member-invited successor, if any
}
```

## 2. Preventing semantically equivalent restatements

The hard problem: suppression by exact string is trivially evaded by paraphrase
("craft keeps returning" → "making things with your hands seems central"). Three layers,
cheapest first:

1. **Suppression at the assembly layer, not the language layer.** The generator never
   sees the suppressed construal as candidate material because the *assembly* step —
   which gathers evidence and candidate observations before prompt-time — excludes any
   candidate whose evidence set substantially overlaps a suppressed construal's
   `evidenceIds` **and** whose framing matches its gist. Prevention upstream beats
   filtering downstream.
2. **Gist matching, not string matching.** The suppression check compares a candidate
   observation against suppressed `gist` entries semantically (the platform already runs
   local embeddings — nomic — for semantic memory; similarity against a handful of gists
   per member is cheap). Above a conservative threshold → candidate dropped, and the
   drop is logged with a discoverable marker for verification.
3. **Prompt-side boundary instruction as backstop only.** The prompt may carry "do not
   offer interpretations the member has said are not true for them" as general
   discipline, but the design must not *rely* on the model's restraint — layers 1–2 are
   the enforcement; the prompt line is defense-in-depth.

**Explicit non-goal**: no classifier over the member's messages, no model of "topics the
member is sensitive about." Matching runs against MAIA's own candidate outputs, never
against the member's inputs.

## 3. What happens to the underlying evidence

Nothing. Evidence is member property and remains fully available: visible in
`/maia/moments`, quotable when the member pulls it, usable in *other, non-equivalent*
construals. Suppression removes one reading of the evidence, not the evidence. This is
the structural expression of "the system never rejects a member's experience; the member
may always reject the system's interpretation."

Edge: if **every** construal over an evidence set has been rejected, the assembly layer
must not respond by generating ever-more-distant construals of the same set — after N
(propose 2) rejected construals over substantially the same evidence, that evidence set
becomes **member-initiative-only** for reflection purposes: MAIA stops proposing readings
of it entirely until the member reopens it.

## 4. "Materially new evidence" — the reopening standard

A suppressed construal may be revisited only when **all three** hold:

1. **New member-authored evidence** exists that was not in the suppressed
   `evidenceIds` — new marks, new keeps, new explicit statements (not merely new
   conversation touching the topic).
2. **The member's own act points there**: they marked, kept, or explicitly returned to
   material bearing on the construal. System-detected recurrence alone never reopens.
3. **The reopening is offered as new and tentative**, with the history visible:
   "Earlier you told me X wasn't true for you. Something new you've kept seems related —
   do you want to look, or leave it?" The member's prior `not-true` is honored in the
   framing, and declining re-closes it without argument.

Reopening is thus **member-gated twice** (their new evidence, their consent to look).
MAIA never accumulates a private case file waiting to re-litigate.

## 5. Effects across the system

- **Prompts**: suppressed construals never enter any prompt tier as context. The
  boundary record itself enters prompts only as a terse negative constraint (assembly
  metadata), never as narrative about the member.
- **Theme signals** (once the pipeline is subsumed per register R4): a `not-true` on a
  construal derived from a theme signal marks that signal's *interpretive status* dead —
  the signal row may remain as raw recurrence data, but it is excluded from prompt
  injection and from any candidate-observation assembly. It must also be excluded from
  the Circles pulse (a rejected construal is the opposite of ratified — register R5/R6).
- **Collective eligibility**: structurally nil. `not-true` is a terminal state for
  collective purposes; no rephrasing, aggregation, or "anonymized" use of a rejected
  construal is permissible (ratified, register R7).
- **Existing memory**: if a construal was previously kept and the member later marks it
  not-true (revision of verdict), the kept object is retired-with-history (member-visible,
  member-deletable), and dependent surfacing stops.

## 6. Deletion and revision

- The member may **delete the rejection record itself** (the boundary). Effect: the
  suppression lifts — deletion is the member saying "I no longer need this fence," not
  an invitation to re-offer; the construal simply becomes offerable again only under the
  normal rules (fresh evidence, invitation).
- The member may **revise** a rejection into a `revised` response at any time ("it's not
  craft — it's finishing things"), which supersedes the suppression with member-authored
  meaning.
- Deleting underlying evidence cascades normally (Doc A §9 — no orphaned meaning); it
  never resurrects a suppressed construal.

## 7. Refusing the hidden-resistance profile

Named failure mode: rejection records accumulating into a covert "what the member won't
look at" model. Structural refusals:

1. Suppression records carry **no member-state fields** — no reason, no inferred
   emotion, no category. `gist + evidenceIds + timestamps` only (see §1 type).
2. **No aggregation over rejections**: no count surfaces to prompts ("member has
   rejected 7 reflections"), no analytics dimension, no cross-member rejection
   statistics. A healthy rejection rate is a *product* signal (Doc A §13) measured, if
   ever, only as an aggregate product metric under the same rules as any telemetry —
   never per-member-visible to MAIA's generation path.
3. **Member-visible ledger**: the member can see their own rejection records (they are
   boundaries they authored) and delete them. Nothing about rejections exists that the
   member cannot see.
4. **Constitutional test candidate**: a refusal-registry check (pattern:
   `tests/constitutional/refusal-registry/`) asserting no reader of suppression records
   exists outside the assembly-exclusion path and the member's own ledger — mirroring
   the proven `refusal-02` no-readers pattern.

## 8. Open questions for ruling (carried to register as U-items)

1. Gist-similarity threshold and its verification harness (how do we *test* that
   paraphrase evasion fails?). Propose: adversarial fixture set in the constitutional
   test suite before any implementation.
2. The N=2 "stop construing this evidence set" constant (§3).
3. Whether the reopening offer (§4.3) is itself too proactive for v0 — the conservative
   alternative is that suppressed construals reopen **only** on explicit member
   initiative, with MAIA never mentioning the history unprompted. Recommend the
   conservative form for v0.
4. Retention of suppression records when a member deletes their account: they delete
   with everything else (they are member data).
