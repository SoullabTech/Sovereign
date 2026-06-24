# Elemental Vantage, Not Verdict — Architectural Rule + Constraint

**Date:** 2026-06-07
**Status:** Exploratory doctrine (Kelly-authored principle; jurisdiction clause + constraint derived in session). The *principle* is doctrine and Kelly's to seal. The *output constraint* is built, tested, and unwired. The *trigger constraint* is specced, not built.
**Lineage:** Closes the elemental-lens thread of the Air arc (`docs/lenses/AIR_PROBE_PREREGISTRATION_2026-06-07.md`, `AIR_FUNCTION_PROBE_PREREGISTRATION_2026-06-07.md`). Sits under the Earth test (member-reported lived-use) and the Sovereignty Invariants.

---

## 1. The principle (Kelly)

The elements are **distinct modes of attending** — not things, categories, diagnoses, or personality types. Ways attention organizes itself.

> Fire *attends toward* emergence. Water *attends toward* feeling. Earth *attends toward* embodiment and form. Air *attends toward* intelligibility, distinction, meaning-crossing. Aether *attends toward* wholeness, context, the larger field.

The element no longer makes claims about reality; it describes the orientation of attention. So MAIA never says "you are in Air" — it can only say, internally, "I am attending in an Air direction." **The element belongs to the system's attention, never to the member's interior.**

| Mode | Attends toward |
|---|---|
| **Fire-attention** | emergence · possibility · becoming · vitality |
| **Water-attention** | feeling · value · resonance · relationship |
| **Earth-attention** | embodiment · form · practice · consequence |
| **Air-attention** | distinction · articulation · perspective · intelligibility |
| **Aether-attention** | pattern · context · integration · mystery |

> **Elements are modes of attending. They orient inquiry; they do not classify persons.**

## 2. The jurisdiction clause (the part the bare rule omits)

"Do not classify persons" read literally would also forbid the verdicts MAIA *must* keep. The breach is not verdicts as such — it is verdicts **crossing into the member's interior.**

> Verdicts over MAIA's **own domain** — its conduct, its vows, what is true about the work — are *required* (else MAIA has no spine: it cannot say "I won't," "that isn't built," "this breaks the Oath").
> Verdicts that cross into the **member's interior** are *forbidden*.
> Same grammatical act; jurisdiction is the whole difference. "We don't have an Air lens" and "you need clarity" are the same move and opposite ethics.

## 3. The breach, made precise (three safe sources, one forbidden)

The sovereignty question was never *noticing* — it is what happens *after* MAIA notices. An offer is clean when it originates from:

- **Member-authoring** — "help me think this through, not feel it."
- **Material-structure** — a feature of the *content on the table* MAIA can point at and the member can veto: "the word 'freedom' seems to be carrying several meanings — does that fit?"

…and forbidden when it originates from **member-state inference** surfaced as a declaration — "you're in Air," "you need grounding," "you're intellectualizing." Invitation-phrasing does not rescue it: a humble read MAIA generates *by reading the member* and surfaces as a verdict is still a verdict. The fix is structural (the channel), not epistemic (the tone).

## 4. The constraint (principle → gate with a test)

A principle is a sentence you admire; a constraint is a gate with a test. Two halves:

### 4a. Output gate — BUILT + tested + unwired

A drafted elemental invitation may surface only if it carries **no verdict-about-the-member**. Fail-closed: any blocking category present ⇒ it does not surface.

- `lib/consciousness/epistemicLint.ts` — new `DeclaringCategory: 'member_state_verdict'` (severity 3 ⇒ escalates the lint verdict to `inflated`). Four rules: element-capture ("trapped in Water"), element placed on the member ("you're in Air"), elemental/quality deficit ("you need grounding", "you lack clarity"), interior-state diagnosis ("you're intellectualizing"). It deliberately does **not** fire on a lens looked-*from* ("I'm attending in an Air direction") or a material-pointer ("the word seems to carry several meanings").
- `lib/consciousness/lenses/invitationGate.ts` — `gateElementalInvitation(text)` / `maySurfaceToMember(text)`: blocks `member_state_verdict` + `identity_declaration` + `imperative_command` + the borrowed-authority categories. Errs toward blocking — a false positive costs one suppressed invitation; a false negative costs a breach.
- Tests: `lib/consciousness/__tests__/epistemicLint.test.ts`, `lib/consciousness/lenses/__tests__/invitationGate.test.ts`. **Full `lib/consciousness` suite: 216/216 green (2026-06-07).**
- **Limit (stated, not hidden):** detection is the existing heuristic — the gate is only as complete as the lint, and it MEASURES; wiring it to actually filter member-facing output is a separate, explicit step (vessel discipline: inspectable before powerful).

### 4b. Trigger gate — derivation BUILT + tested; static guard remains

There must be **no code path from an inferred member-state to a surfaced offer.** An offer fires only on an inspectable feature of the member's own text — never on MAIA's inference about the member's interior.

- `lib/consciousness/lenses/contentFeature.ts` — `deriveContentFeature(memberText)`: a pure function whose *only* parameter is member-authored text, so there is no parameter through which an inferred member-state could enter. That signature is the wire's absence as a property, not a promise. Implements the cleanly-inspectable subset of the boundary rule ("if it can be shown back to the member as text-on-the-table, it counts"): explicit mode-request, reported communication event, repeated term, multiple bundled questions. **Deliberately excludes** "contradictions" and "unclear referents" — detecting *those* is itself interpretation, which would re-import the wire; they return only behind their own guard.
- `lib/consciousness/lenses/invitationGate.ts` — `mayOfferElementalInvitation(memberText, draft)`: composes the two halves — trigger *derived* (not asserted) AND draft clean. Emotional content with a perfectly clean draft still yields no offer (`no-inspectable-content-feature`): MAIA cannot trigger an elemental offer by *feeling* the member is emotional.
- Tests: `lib/consciousness/lenses/__tests__/contentFeature.test.ts` + extended gate tests. **Full `lib/consciousness` suite: 228/228 (2026-06-07).**
- **Still remaining (the genuinely structural part):** a static call-site guard (`check:no-supabase`-style) ensuring no caller bypasses `deriveContentFeature` and that `memberText` is never MAIA's own draft; and the **accumulation** gap — the gate is stateless, so repeated clean offers across turns (a diagnosis in installments) are invisible to it. That needs cross-turn state, not a regex.

## 5. Altitude (honest status)

- The principle is finished and good.
- The output gate is real, tested, and **not wired** to any member-facing path.
- The trigger gate is specced only.
- Above both sits the **Earth test**, which only the *member* answers: did attending this way help, by their own report? The gate keeps the move from breaching sovereignty; it does not show the move helps. That remains untested in lived use (zero runs).

> The framework organizes attention. The person remains the author — and the only one who says whether it mattered.
