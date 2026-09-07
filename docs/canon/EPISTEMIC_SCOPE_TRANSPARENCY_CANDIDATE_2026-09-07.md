# Epistemic Scope Transparency — CANDIDATE

**Status:** **RATIFICATION-READY — NOT SEALED.** Revised 2026-09-07 against three founder precision
corrections; **D1–D6 adjudicated and recorded below as founder rulings**. Sealing is a separate
founder act on inspection of this diff. Until then this document governs nothing.
**Type:** Candidate canon — a *constraint on disclosure*. It grants no capability and widens no access.
**Occasioned by:** the Studio Council truth-in-UI correction (`f3dbf11a`), recorded as **Specimen 01**.
**Compressed as:** Invariant 17 — Epistemic Scope Integrity (`MAIA_SOVEREIGNTY_INVARIANTS.md`, pending the same seal).
**Sibling canon:** [Intelligence Field Access Map](./INTELLIGENCE_FIELD_ACCESS_MAP.md) · [Longitudinal Memory Category Gradient](./LONGITUDINAL_MEMORY_CATEGORY_GRADIENT.md) · [Interface Humility](./INTERFACE_HUMILITY.md) · [Right to Remain Unpossessed](./RIGHT_TO_REMAIN_UNPOSSESSED.md) · [MAIA Sovereignty Invariants](./MAIA_SOVEREIGNTY_INVARIANTS.md)

---

## Candidate core

> **A member must be able to know what an intelligence-bearing act is authorized to retrieve
> before that authority is exercised on their behalf** — before invocation for an act they
> invoke; at the enabling or authorization boundary, and inspectable for as long as the
> authority stands, for an act that is ongoing or system-initiated.
>
> **Any declaration of epistemic scope must be true of the actual retrieval boundary.**

Two requirements, inseparable. Either alone is worthless: a scope no one can learn is not a
boundary, and a scope declared falsely is worse than none, because it converts a member's
reasonable caution into misplaced trust.

The second clause of the first requirement closes a loophole the first draft left open. A law
written only around a button press exempts every process that never presents one. Standing
authorization is still authorization; it is where scope must be knowable, and it must stay
inspectable while it holds. **This states where the obligation attaches. It authorizes no audit
of any background process now.**

---

## 1 · What "epistemic scope" means

> **Epistemic scope is the runtime evidence and context the system is authorized to retrieve,
> receive, or call into an intelligence-bearing act.**

It covers: the current object · memory of any category · prior sessions · other people's
material · private fields · corpora injected at runtime · files · connectors · web and tool
calls · anything a sub-agent retrieves on the act's behalf.

**It does not mean the model's general pretrained capability.** A Council can read only one
decision while still possessing ordinary language and world knowledge; parametric knowledge is
not an item in a disclosure inventory. The exception is a *stronger product claim* — "answers
only from this corpus", "grounded solely in your material" — which asserts something about the
model's use of its own knowledge and must then be true.

Scope is **authorization, not usage.** A source the path may reach but did not reach this time
is inside scope. The boundary is what the code *can* retrieve for this act.

Scope is **per-act**, not per-product. The same surface may hold different scope for different
acts; the obligation attaches to the act, not the screen.

**Distinction from the sibling instrument.** `INTELLIGENCE_FIELD_ACCESS_MAP` is a system-facing
reachability audit — what exists, what loads, what reaches inference. This instrument is the
member-facing contract layer: *can the member know it, and is what they would learn true?* The
access map can be perfectly accurate while this law is wholly unmet. Specimen 01 is that case.

---

## 2 · Two layers: manifest and representation

An exhaustive source set is the right internal object and the wrong member-facing one. No
member should have to read `member_live_context`, `episodic_memories`, or a loader filename to
understand what they are about to invoke.

```
SCOPE MANIFEST                    exact · exhaustive · system-facing
  what the declared path may actually retrieve
        │
        │  truthful compression
        ▼
SCOPE REPRESENTATION              member-facing · materially complete
  expressed in human source classes
```

> **The representation may compress implementation detail. It may never compress away a
> material boundary.**

So *"this consultation uses this decision, material attached to it, and your MAIA memory"* is
true even where the manifest beneath names twelve tables and loaders — and it is false if the
manifest also reaches a source class the sentence omits.

This is what reconciles the completeness requirement with the prohibition on clutter: the
manifest bears completeness, the representation bears comprehension. Failing either is a
failure of the same law, in opposite directions — §7.2 (stale) and §7.6 (under-declaration)
attach to the manifest; §7.3 (vague) and §7.8 (clutter) attach to the representation.

---

## 3 · When disclosure is owed — the material divergence test (D1)

**This law is not "put privacy microcopy under every button."** Disclosure spent where it is
not owed is disclosure unavailable where it is: a member who has learned to skip small grey
text is less protected than one who never saw it.

> **Disclosure is owed when actual runtime retrieval scope *materially diverges* from the scope
> a reasonable member would infer from the visible context, a standing scope declaration,
> active consent or settings, or an explicit product promise — in either direction.**

**Material** means the difference could reasonably alter the member's understanding of:

1. **privacy** — what of theirs was available to the act
2. **authority** — what the output is entitled to speak to
3. **provenance** — where the judgment came from
4. **competence / context** — how much the intelligence had to work with
5. **their own decision** — whether they would invoke or authorize the act at all

Materiality is what keeps "reasonable expectation" from collapsing into designer intuition, and
what keeps trivial implementation differences from generating notices. The four anchors —
visible context, standing declaration, active consent, product promise — are what expectation
is measured *against*; a member's expectation is not a guess about their psychology but a
reading of what the product has already told them.

Divergence runs both ways, and the second direction is what Specimen 01 exposed:

- **Over-reach** — the act reaches further than the anchors suggest. Declare what it reaches.
- **Under-reach** — the act reaches *less*, and the surrounding environment makes narrowness
  surprising. Declare what it does not reach. A companion described as remembering creates a
  standing expectation of continuity; an object-scoped intelligence beside it genuinely
  surprises, and that surprise bears on authority, provenance, and competence — not only privacy.

Where scope and anchors agree, **silence is honest**. That is the ordinary case and must remain
the ordinary case.

| Class | Default | Why |
|---|---|---|
| Scope obvious from the immediate object | **no disclosure** | expectation matches reality |
| Scope extends beyond the visible object | **disclosure owed** | over-reach; the member cannot see what was consulted |
| Scope involves memory or prior conversations | **disclosure owed** | over-reach, in the category where mistaken assumption costs most |
| Scope narrow *inside a memory-bearing environment* | **disclosure owed** | under-reach — Specimen 01 |
| Cross-person / collective material | **disclosure owed, both directions** | the member cannot reason about others' material from their own view; see §6 for the consent chain it does *not* discharge |
| External connected sources | **disclosure owed** | leaving the sovereign boundary is never a reasonable default assumption |
| A member act that intentionally widens scope | **disclosure at the act, and consent required** | authorization, not notice — §5 |

**Ruled:** material divergence, not reach-alone. Reach-alone is simpler and cheaper to apply,
and would have found Specimen 01 compliant on the day a beta tester had to ask.

---

## 4 · Acceptance test

```
BEFORE THE AUTHORITY IS EXERCISED    Can the member know the scope?
  (invocation, or the enabling boundary for a standing authority)

AT RUNTIME                           Is the represented scope true of the retrieval path?
```

Neither half is sufficient. Part one without part two is a comforting fiction. Part two without
part one is Specimen 01: a boundary held perfectly and known to no one.

**Portable audit question, usable across products:**

> *Before the member invokes this intelligence — or authorizes it to run — do they know what it
> is allowed to know for this act, and is that representation true?*

---

## 5 · The change law

> **A change in retrieval authority is a change in the member-facing epistemic contract.**

An implementation may not widen input scope while leaving an older declaration standing. The
declaration is part of the feature, not documentation of it. *"The feature still works"* is no
defence: the feature the member consented to was the narrow one.

Corollary: a declaration must live where it breaks if the boundary moves — co-located with the
retrieval path, single-sourced, subject-true. A notice that can drift out of truth silently is
a latent false statement. The enforcement counterpart is the tripwire in §8.

---

## 6 · Disclosure is not authorization (D4, D6)

**Transparency requires meaningful availability-to-know. Authorization remains governed
separately by consent law.** There is no general acknowledgment requirement — a mandatory "I
acknowledge" adds nothing a member can use and turns sovereignty into checkbox bureaucracy.

```
scope already authorized, and divergent      → salient disclosure
scope widening needs new authority           → explicit consent, with the scope it grants visible
generic acknowledgment gesture               → adds nothing; not required
```

Where a new scope requires new authorization, **the consent act itself must show what scope it
grants.** Disclosure never discharges consent; consent granted blind is not consent.

**Two people, two different obligations (D6).** Where the invoker and the person whose material
enters scope are different — a practitioner consulting a Council over a client's inquiry:

> **The invoker must know the scope. The person whose material enters the scope must have
> granted the authority.**

- **Practitioner (invoker)** — must be able to know what the Council may use. This is *this* law.
- **Client (data subject)** — must have authorized their material for this *class* of use. This
  is consent law, not this law.

Consequences, both directions: if the client's material was gathered under an authorization that
already includes practitioner deliberation and Council analysis, the client does **not**
reconfirm each invocation — and a Council notice is not shown to them per act. If that
authorization does not exist, a perfectly accurate scope notice shown to the practitioner
**cannot make the client's material eligible.**

Where one human occupies both roles, one interface may discharge both. Where they are different
people, **the two chains must not be collapsed.**

---

## 7 · SPECIMEN 01 — Studio Council

Cited as the occasion of discovery. **The law is not defined in its terms.**

| | |
|---|---|
| **Prior state** | Decision and Change councils held true isolation: inputs bound to the object (`WHERE decision_id = $1` / `change_id = $1`); no conversational memory, atoms, or session loader anywhere in the path. |
| **Defect** | The member could not know that before invoking. A beta tester had to *ask* whether the Council read their MAIA conversations. Isolation held by implementation, declared nowhere. |
| **Divergence class** | **Under-reach, material.** Narrower than a member of a memory-bearing platform would infer — bearing on provenance, authority and competence, not only privacy. Reach-alone testing would have called it compliant. |
| **Repair** | A subject-true representation at all ten invocation points, rendered before invocation, single-sourced and co-located with the retrieval boundary. Copy only; no input, schema, or memory change. |
| **Roles** | Spans a member surface (`/maia` sheet) and a practitioner surface (`/studio`) over a client's material — the case that produced the D6 distinction. This repair discharged **invoker knowing only**; the client-authorization chain was not examined and is not claimed. |
| **Demonstrates** | Correct behaviour is not sufficient. A boundary a member cannot see is not yet a boundary they can rely on. |

---

## 8 · Anti-patterns

1. **Ambient widening** — memory or a new source wired in without the contract changing.
2. **Stale declaration** — implementation moved, notice did not. A false statement to a member.
3. **Vague scope** — "uses your context", "personalized to you". Names no boundary; unfalsifiable.
4. **Post-hoc disclosure** — scope revealed after the act. The member already acted.
5. **Disclosure laundering consent** — notice treated as authorization where authorization is required.
6. **Under-declaration** — declaring narrower scope than the path actually holds.
7. **Compliance by association** — one audited surface cited as evidence for unaudited ones.
8. **Disclosure clutter** — notices where scope and anchors already agree, degrading the notices that matter.
9. **Manifest as representation** — showing a member tables, loaders, or column names in place of source classes.
10. **Collapsed chains** — treating the invoker's knowing as the data subject's authorization (§6).
11. **Binding pass read as truth** — citing a static check as evidence the manifest matches the runtime path (§9).

---

## 9 · Enforcement shape (D5) — hybrid, with custody language

**Machine-checkable:**

- a declaration exists wherever this law owes one
- every invocation surface is bound to the **canonical** declaration for its path
- hand-written or divergent copies of a declaration are forbidden
- a declared source manifest exists for each declared path

**Not generally machine-provable:**

- that the manifest equals every source actually reachable at runtime

**Retrieval-authority change tripwire.** A change that adds or widens a runtime data read,
connector, tool call, memory loader, sub-agent source, or any other retrieval authority inside a
declared intelligence path **requires an Epistemic Scope review** — of the manifest, and of the
representation the manifest feeds.

**Custody language, mandatory in any claim made under this law:**

```
static binding PASS  ≠  scope truth verified
```

A surface earns a full acceptance claim only once the retrieval path itself has been traced and
witnessed. Calling the static half "verification" would reproduce, one level up, the exact error
this law exists to name.

---

## 10 · Applicability not yet established

**All non-Council intelligence surfaces remain UNAUDITED against this law.** No audit was
performed in this act and none is authorized by it. That the principle generalizes is not a
claim that it has been applied. Any statement of platform-wide compliance would be false today.

The first cross-surface census opens on the founder's seal, not on this revision.

---

## 11 · Founder rulings (2026-09-07)

Adjudicated by Kelly Nezat; recorded here as the disposition of the six decisions the first
draft surfaced.

| | Ruling |
|---|---|
| **D1 · Governing trigger** | **Material divergence test** (§3), not reach-alone. Materiality bounded by five axes; expectation anchored to visible context, standing declaration, active consent/settings, or explicit product promise. |
| **D2 · Placement** | **Both.** This document holds the full doctrine; **Invariant 17 — Epistemic Scope Integrity** carries the compressed load-bearing rule and points here — the Invariant 16 / `RECOGNITION_INTEGRITY.md` pattern. A ship constraint without 250 lines in the invariants document. |
| **D3 · MAIA's own surfaces** | **No per-turn notice; a durable inspectable scope surface is owed.** Sanctuary Mode governs protection, retention and exclusion; the Memory Canon governs what MAIA should remember and retrieve. Neither answers *"what can MAIA draw from when she responds to me?"* — so neither discharges this law. The eventual surface expresses source classes at the relationship/settings boundary (current conversation · prior conversations and memory · what the member explicitly kept · astrology context · connected sources where enabled · collective/field material where applicable), never implementation tables. Where a particular act temporarily widens scope — a newly connected source, a document brought into the exchange — the widening earns a just-in-time boundary. **A future design obligation. Not authorized to build in this act.** |
| **D4 · Strength** | **Availability-to-know is the transparency floor.** No general acknowledgment requirement. Consent stays separately governed; where new authority is required, the consent act shows the scope it grants (§6). |
| **D5 · Enforcement** | **Hybrid**, per §9. Static binding is machine-checkable; manifest-equals-runtime is not. Retrieval-authority change tripwire ratified. The hard half is **never** to be described as machine-verified. |
| **D6 · Whose knowing counts** | **Both, differently.** Invoker knowing (this law) and data-subject authorization (consent law) are distinct chains and must not be collapsed. §6 carries the rule. |

**Residual open, not blocking the seal:** the design of the D3 durable scope surface; the
client-authorization chain in Specimen 01, examined by neither this act nor the Council repair.

---

**Seal pending founder act. Until sealed, this document governs nothing.**
