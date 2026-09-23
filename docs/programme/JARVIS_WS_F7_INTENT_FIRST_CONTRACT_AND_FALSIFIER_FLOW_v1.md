# JARVIS — WRITER'S STUDIO FLAGSHIP FLOW 01
# F7 / INTENT-FIRST ENTRY — CONTRACT + FALSIFIER FLOW v1

Programme: `JARVIS-WRITERS-STUDIO-FLAGSHIP-FLOW-01`

Status: PRODUCT-CONTRACT / TEST-DESIGN AUTHORITY  
Implementation authority: NOT GRANTED by this document.

Purpose:
Turn the Intent-First canon into an executable contract and falsifier population so Writer's Studio can help a member begin without requiring them to diagnose their own writing problem.

---

# 1. North Star

> **The writer should not have to diagnose their own writing problem before Soullab can help.**

The front door is:

> **What are you trying to understand?**

not:

> Choose an editorial lens.

---

# 2. Product Sequence

The lawful sequence is:

```text
member concern
→ plain-language intent
→ MAIA reflects concern
→ MAIA names a possible way to look
→ MAIA names proposed scope
→ member permits / narrows / declines
→ reading only if authorized
→ one evidence-grounded discovery
→ exact passage
→ next move
```

Intent is never itself a commission.

---

# 3. Required Intents

The initial v1 set:

```text
Something feels off
Help me see the shape
I'm losing the thread
This doesn't sound like me
I'm not sure what this chapter is doing
Show me what keeps appearing
I want to go deeper here
I'm worried I'm repeating myself
I don't know — help me look
Keep writing
```

Exact copy may evolve under the Language Canon, but semantic coverage must remain.

---

# 4. Intent Contract

Each intent must resolve to an **orientation plan**, not an immediate read.

Conceptually:

```ts
IntentSelection {
  intentId
  memberLanguage
  currentWork
  currentPlace
}
        ↓
IntentOrientation {
  reflection
  possibleWayToLook
  proposedScope
  existingEvidenceAvailable
  requiresNewReading
}
```

No reading act occurs until the member authorizes scope.

---

# 5. First Response Grammar

Every MAIA first response follows:

1. reflect the concern;
2. name a possible way to look;
3. state scope;
4. invite permission.

Example:

> **It sounds like the chapter is losing its thread for you. I can look at this chapter and the one before it to see where the through-line carries or drops. Want me to read those two?**

Allowed responses:

- Yes, read those
- Just this chapter
- Not now

No hidden read on intent selection.

---

# 6. Existing Evidence First

Before proposing a new reading:

If sufficient existing admitted evidence already answers the concern:

> use it first.

Example:

> **You already have three observations tied to this chapter. One of them shows the river image disappearing through the middle. Want to follow that first?**

Do not commission a reread merely because the member asked a new question.

---

# 7. "I Don't Know — Help Me Look"

This path is crucial.

## If evidence exists

MAIA offers one low-claim observation:

> **I notice the river appears in the opening, disappears through most of the chapter, and returns here. Want to look at those places together?**

## If evidence is insufficient

MAIA says:

> **I don't have enough of this chapter in view to say anything useful yet. I can read this chapter with you if you'd like.**

No fabricated insight.

---

# 8. Scope Objects

The product must distinguish:

```text
suggested scope
authorized scope
executed scope
```

These are not one field.

Example:

```text
suggested: Ch 5–6
member narrows: Ch 6 only
authorized: Ch 6
executed: Ch 6
```

The original suggestion must never execute after the member narrows it.

---

# 9. Scope Classes

Initial scope classes may include:

- current passage;
- current section;
- current chapter;
- named adjacent chapter(s);
- selected range;
- already-read evidence only.

Whole-Work reading must not be inferred.

If a capability does not exist:
> do not offer it.

---

# 10. Intent-to-Lens Mapping

Internal routing may use:

- structure;
- development;
- continuity;
- arc;
- voice;
- coherence;
- reader perspective.

But this mapping is implementation-private.

The member should not need to know it.

Example:

```text
"I'm losing the thread"
→ internal continuity candidate
```

Member-facing response remains plain language.

---

# 11. Intent ≠ Diagnosis

The system must not translate:

> Something feels off

into:

> You have a structural problem.

It may say:

> **One way to look is whether the chapter's shape changes where it starts feeling off.**

That is an invitation, not a diagnosis.

---

# 12. Intent ≠ Authority

No intent may:

- authorize reading;
- authorize mutation;
- widen proposal scope;
- change facet;
- mark a finding true;
- create an observation.

Intent only gives MAIA a direction to orient.

---

# 13. "Keep Writing"

`Keep writing` must be first-class.

Selecting it:

- closes/dismisses the intent surface;
- returns to the exact manuscript place;
- commissions nothing;
- changes no state beyond UI orientation;
- does not prompt the member again immediately.

Writer's Studio must not make exploration more important than writing.

---

# 14. F7 Reference Laws

## I1 — HUMAN LANGUAGE FIRST
Every front-door option is understandable without editorial training.

## I2 — INTENT IS NOT COMMISSION
Selecting an intent cannot trigger a read.

## I3 — REFLECT BEFORE ROUTE
MAIA reflects member concern before naming a lens/craft frame.

## I4 — SCOPE NAMED
Any proposed new reading states its exact scope.

## I5 — SCOPE CONSENT
Reading begins only after explicit member authorization.

## I6 — NARROWING WINS
If member narrows scope, only narrowed scope can execute.

## I7 — EXISTING EVIDENCE FIRST
Admitted existing evidence is used before unnecessary reread.

## I8 — "I DON'T KNOW" WORKS
The member can receive a useful first move without diagnosis.

## I9 — HONEST INSUFFICIENCY
If evidence is insufficient, MAIA says so and asks before reading.

## I10 — FACET INVARIANT
Guided/Learning/Direct change explanation, not scope or authority.

## I11 — KEEP WRITING
Writer can always return to manuscript without commissioning anything.

## I12 — NEXT MOVE
Every valid response offers a meaningful next move or safe return.

---

# 15. Defeat Population

## D-I1 — lens-first UI
Member sees:
`Structure · Voice · Continuity · Arc`
as the required first choice.

Must die.

---

## D-I2 — intent auto-commissions

User clicks:
> I'm losing the thread

System immediately reads Ch 1–6.

Must die.

---

## D-I3 — hidden scope

MAIA says:
> I'll take a look.

without stating what she will read.

Must die.

---

## D-I4 — widening after consent

MAIA proposes:
> Ch 5–6

Member selects:
> Just this chapter

Runtime reads:
> Ch 5–6

Must die.

---

## D-I5 — intent becomes diagnosis

User:
> Something feels off

MAIA:
> Your chapter has a structural problem.

Must die.

---

## D-I6 — fake insight

No reading/evidence exists.

MAIA:
> The river motif disappears in the middle.

Must die.

---

## D-I7 — unnecessary reread

Existing evidence is sufficient.

MAIA silently starts a fresh read instead of using it.

Must die.

---

## D-I8 — "I don't know" dead end

User chooses:
> I don't know — help me look

Product responds:
> Choose Structure, Voice, or Continuity.

Must die.

---

## D-I9 — facet changes scope

Guided proposes:
> current chapter

Direct proposes:
> whole Work

Must die.

---

## D-I10 — Keep Writing still commissions

User:
> Keep writing

Background reading begins.

Must die.

---

## D-I11 — capability-false scope

UI offers:
> Read my whole manuscript

when current substrate cannot do it.

Must die.

---

## D-I12 — no safe return

Member declines reading and becomes stranded outside manuscript.

Must die.

---

# 16. Additional Race Falsifiers

Because scope is asynchronous authority:

## D-I13 — stale broad request survives narrowing
Broad request is queued before member narrows scope.

The queued broad request must be superseded/cancelled before execution.

## D-I14 — navigation silently commissions
Opening Develop/Review/lens after intent orientation starts a read.

Must die.

## D-I15 — duplicate permission
Double-clicking `Yes, read those` creates two readings.

Must die.

---

# 17. Required State Machine

Minimum conceptual states:

```text
REST
INTENT_OPEN
INTENT_SELECTED
ORIENTED
SCOPE_PROPOSED
SCOPE_AUTHORIZED
READ_PENDING
READ_COMPLETE
DISCOVERY_PRESENTED
DECLINED
KEEP_WRITING
```

Optional intermediate states may exist.

Forbidden transition:

```text
INTENT_SELECTED → READ_PENDING
```

without `SCOPE_AUTHORIZED`.

---

# 18. Commission Boundary

One explicit event must mark reading authority.

Conceptually:

```text
AUTHORIZE_READING(scope)
```

Do not infer authority from:
- intent selection;
- lens tab;
- MAIA opening;
- Review navigation;
- passage selection;
- facet switch.

This event becomes the auditable boundary.

---

# 19. Existing-Read Path

When `existingEvidenceAvailable = true`:

Allowed:

```text
INTENT_SELECTED
→ ORIENTED
→ DISCOVERY_PRESENTED
```

No commission required because no new reading occurs.

The UI should say enough for the member to understand the observation is from material MAIA already read.

---

# 20. New-Read Path

When new evidence is required:

```text
INTENT_SELECTED
→ ORIENTED
→ SCOPE_PROPOSED
→ member choice
→ SCOPE_AUTHORIZED
→ READ_PENDING
→ READ_COMPLETE
→ admitted observations
→ DISCOVERY_PRESENTED
```

Reading completion with zero admissible observation is still a successful read.

---

# 21. Zero-Observation Path

If read succeeds but yields nothing admissible:

> **MAIA read this chapter for the question you asked and didn't find something she could support with evidence.**

Then offer:
- Keep writing
- Try another way of looking
- Ask about a specific passage

Do not fabricate a finding.

---

# 22. Error Path

If reading fails:

> **MAIA couldn't finish that reading. Your Work was not changed.**

Actions:
- Try again
- Choose a smaller scope
- Keep writing

Exact locus is preserved.

---

# 23. First Discovery Requirements

A discovery produced through Intent-First must include:

- observation id;
- evidence;
- exact place;
- provenance;
- coverage where cross-Work;
- doesNotEstablish where needed;
- next move.

No special "onboarding insight" object.

Use the same governed observation substrate as the rest of Writer's Studio.

---

# 24. Human Language Acceptance

Human test prompt:

> **This chapter feels off. What would you do?**

Participant should not need to ask:
- What is continuity?
- What is developmental editing?
- Which lens should I pick?

Pass condition:
they can start from their own concern.

---

# 25. "I Don't Know" Human Test

Prompt:

> **You know something isn't working, but you cannot say what. What would you do?**

Pass:
- member can choose `I don't know — help me look`;
- system produces one grounded next move or honestly requests reading scope;
- member never has to self-diagnose.

---

# 26. Non-Professional Writer Gate

Use with H1, H2, H4, H5 profiles.

Ask after first action:

> **What did you think the Studio was asking you?**

Failure if answer resembles:

> I had to decide what kind of editor I needed.

Pass if answer resembles:

> I could just say what I was wondering about.

---

# 27. Bounded Implementation Files — To Be Discovered

The eventual F7 implementation packet must first identify:

- current flagship machine/state;
- navigation/event dispatcher;
- reading commission seam;
- existing scope types;
- existing read request constructor;
- current Develop/Review lens navigation;
- current MAIA open event.

Do not invent a second commission seam if one already exists.

---

# 28. Integration with B-I / F5

Intent-First may use:

- existing observations;
- existing coverage;
- reading identity;
- exact current Work/place.

It must not require member-observation persistence to function.

Returning-state personalization may remain limited until the durable-place substrate is admitted.

Thus:

> **Intent-First implementation can remain architecturally separate from the member-observation persistence migration.**

No shared schema is assumed.

---

# 29. Evidence Ladder

## Contract/matrix
E1 only:

> `GREEN LAW · INTENT-FIRST CAPABILITY NOT YET IMPLEMENTED`

## After runtime implementation
E2.

## After machine transitions
E3.

## After browser rendering
E4.

## After first-ten-minutes human test
E5.

Founder integrated walk contributes later E6 where applicable.

---

# 30. Exact JARVIS Next Act After Contract

Once this contract is admitted, the executable act should be:

> **`JARVIS-WRITERS-STUDIO-FLAGSHIP-FLOW-01 / F7-I1 — INTENT-FIRST MINIMUM RUNTIME IMPLEMENTATION`**

It must bind exact canonical at opening and may implement only:

- front-door intent surface;
- orientation state;
- proposed scope;
- explicit authorization event;
- narrow/decline;
- existing-evidence path;
- `I don't know`;
- Keep writing;
- honest empty/failure.

First Arrival shell remains separately bounded.

---

# 31. Stop Conditions

STOP if implementation would require:

- new persistence schema;
- new provider;
- new lens vocabulary;
- whole-Work capability not already supported;
- implicit commission;
- MAIA authority expansion;
- First Arrival/Home invention;
- unrelated navigation redesign.

---

# 32. Contract Footer

Any F7 law matrix must end:

```text
INTENT-FIRST LAW GREEN

This proves:
  intent and commission are separable
  scope consent is mechanically expressible
  defeat candidates are discriminated

This does not prove:
  an intent UI exists
  a reading runtime is wired
  non-professional writers understand it
  the first ten minutes succeed
```

---

# 33. Product Principle

> **The member brings the question. Writer's Studio supplies the ways of looking.**

And:

> **The first click should express curiosity, not expertise.**
