# Entrustment Covenant Protocol

**Status:** PROPOSED — operationalizes **Invariant 11 (Declared Significance)** and **Invariant 12 (Design Burden)**. Does not seal. Sealing alongside the Invariants is Kelly's to do.
**Date:** 2026-06-05
**Relation:** `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md` §11–12 · `docs/canon/MARKETING_CLAIM_DISCIPLINE.md` (Live/Designed/Vision) · `docs/specs/DIRECT_RECALL_RESOLVER_SPEC_2026-06-04.md`

---

## 0. The distinction this protocol exists to hold

**Memory is a mechanism. Entrustment is a relationship.**

A memory system answers *"can it find something from last week?"* — a question of utility. Entrustment answers *"can I place something here and know it will be held?"* — a question of trust. The two are routinely collapsed because they share substrate, but they fail in different registers:

- A **continuity/memory failure** is experienced as a **capability gap** — "it isn't smart enough yet." Forgivable; the user keeps using the system.
- An **entrustment failure** is experienced as a **promise gap** — "I asked it to hold this, and it didn't." This changes the user's *willingness to entrust anything in the future*. It is not a missing feature; it is a broken covenant.

Invariant 11 already names this from the governance side: *"A promise the substrate cannot honor is a broken covenant, not a feature."* This protocol is the measurement instrument for that clause.

### Why this is the load-bearing frontier
When a member explicitly marks something significant, **the member has already done the ranking.** The system is no longer inferring importance — it is being *delegated stewardship*. Per Invariant 11's ranking ladder, member-declared significance outranks system-inferred significance and corpus intelligence. Therefore the platform's highest-value memories are not the ones the algorithm scores as important; they are the ones the member intentionally placed into its care. Better models, richer recall, deeper synthesis, relational continuity — all of it **amplifies** whatever answer the substrate gives to the entrustment question. None of it **substitutes** for that answer. If the covenant fails at the registry layer, more intelligence does not repair it; it only becomes more articulate about the failure.

---

## 1. The single load-bearing test

Not *"Can MAIA remember?"* — that is a model question.

> **Can a member place something in MAIA's care, return later, and verify that it was held?**

This is more demanding than the continuity test because it combines memory + provenance + retrieval + trust + sovereignty into one interaction — and because *verify* makes accountability part of the test, not just preservation.

---

## 2. The round-trip covenant check

Five stages. **Failure at each stage is a different failure** — that distinction is the point of the protocol, because the remedy and the relational cost differ at each layer.

| Stage | Verifies | Failure name | What the member experiences |
|---|---|---|---|
| 1. **Entrust** | Member can mark an item significant; system acknowledges receipt | Gesture missing | "There was no way to tell it this matters" |
| 2. **Durability** | Item survives session end, restart, return visit, summary generation, memory compaction | **Covenant broken** | "I told it, and it lost it" |
| 3. **Retrieval** | Item can be recalled through a direct request ("pull up what I marked") | Access broken | "It still has it but I can't get to it" |
| 4. **Honor** | Item surfaces when context makes it relevant, **carrying provenance that it was member-designated** | Relevance broken / Provenance broken | "It came back, but not as the thing I marked" |
| 5. **Visibility** | Member can see what has been entrusted and each item's current status | Accountability broken | "I can't tell whether it's held, used, or gone" |

### Refinement: Stage 4 (Honor) is two failures, not one
"Relevance broken" (didn't surface when relevant) is the obvious one. The subtler one is **provenance broken**: the item surfaces, but stripped of its member-designated attribution, so it reads as the system's inference rather than the member's entrustment. Invariant 11 requires the item be *"returned with priority"* **and** experienced *as* the member's declared thing. This is not hypothetical: the recall synthesis path performs an unweighted UNION that flattens channel provenance (`synthesizeMemoryField`, traced in the recall-path analysis), so an entrusted item can surface with its "you marked this" attribution erased. Honor = relevance **and** provenance-of-designation.

### Language is gated by the verified stage (the "promise late" rule)
Invariant 11: *"Capture early; promise late… must not imply it will be recalled until round-trip retrieval is verified."* Operationally, **what MAIA is permitted to *say* at Entrust is bounded by which downstream stages are proven**:

- Durability unverified → MAIA may say *"I've noted this"* — **not** *"I'll remember this"* or *"I'll bring this back."*
- Retrieval verified → MAIA may say *"You can ask me to pull this up."*
- Honor verified → MAIA may say *"I'll bring this back when it's relevant."*

A promise ahead of its verified stage is the covenant breach Invariant 11 prohibits — and, per Invariant 12, transferring that broken promise onto the member's trust is transferring the system's design burden onto the user.

---

## 3. The shelf is the audit surface, not a UX feature

Without visibility, the member cannot distinguish four states that feel identical from outside:

- "MAIA lost it." (Durability failed)
- "MAIA still has it." (Durable, not yet surfaced)
- "MAIA has it but isn't using it." (Honor failed)
- "MAIA never received it." (Entrust failed)

A shelf — *here is what you asked me to hold, and the verified status of each* — collapses those ambiguities. This reframes the shelf from polish to **the accountability instrument for the entire covenant**. Two design notes:

1. **Entrusted memory dissolves the surveillance tension.** Surfacing *inferred* memory unprompted risks feeling watched; that is the hard part of the "invisible on screen" continuity problem. Surfacing *entrusted* memory is not surveillance — the member put it there; consent is in the gesture. So the shelf is both the highest-stakes surface and the one place where showing memory has zero consent ambiguity. It is the right thing to build first.
2. **Status display vs. fix (Inv 11 ⟂ Inv 12).** Showing "received but not yet durable" is honest *measurement* (Inv 11 permits naming the unverified) — but a removable durability gap must be **fixed, not captioned** (Inv 12: *"a caption on the trap is not a fix"*). Resolution: display status for the *irreducible* latency (e.g. compaction lag), close the *removable* gap (e.g. Keep→registry). The shelf must never become the place where a fixable broken covenant is permanently explained instead of repaired.

---

## 4. The honesty floor (so this protocol does not itself over-promise)

The covenant is **not** a guarantee of immortality. It is bounded by:
- **Sanctuary precedence** — a session-level "hold nothing" overrides a moment-level "remember this" (Invariant 11: the more protective declaration wins). Entrustment never overrides protection.
- **Uncertainty honesty** (Invariant 5) — the deepest form of the covenant is not *"this will never be lost"* but *"you will never be misled about its status."* If an entrusted item cannot be held, the member is told so — truthfully and visibly — rather than left to discover it. Being honestly told "this is gone" is the covenant **kept**, not broken; silent loss is the breach.

The sovereign form of the promise is therefore: *held under the terms you set, returned with your provenance, and honestly accounted for if ever it cannot be held.*

---

## 5. Current verdict (honest Live/Designed state, 2026-06-05)

Against the round-trip test, MAIA fails at **Durability — step one of the covenant proper** — and that is the worst place to fail, because it is the broken-promise layer rather than the missing-feature layer. But it is the **most tractable** frontier: one gesture to honor, one registry gap to close, one shelf to render, and the governance layer is already constitutional.

| Stage | State | Grade | Thread in flight |
|---|---|---|---|
| Entrust | `is_breakthrough` flag live (Cat-6); episodic mark built (deploy partial) | **A−** | member-mark path |
| Durability | **Keep→atoms gap: entrusted content lands in `member_ideas`/`blocks`/`breakthrough` but registers 0 atoms; recall reads the atoms registry → un-indexed, invisible** | **D** | `project_keep_capture_atoms_registry_gap` |
| Retrieval | Direct Recall Resolver built (federates native stores; `locate`+`materialize`); in-process E2E pending. May close part of Retrieval *independently* of the registry, by reading the stores where Keep actually lands | **C** | `DIRECT_RECALL_RESOLVER_SPEC` |
| Honor | Recall reaches prompt (FAST/CORE) but can be out-ranked by recency, and synthesis flattens provenance | **C−** | recall-path facet/provenance |
| Visibility | No shelf surface exists; continuity is "wired but invisible on screen" | **F** | post-verification arrival map |
| Governance | Sanctuary + Invariant 11 gate-first precedence | **A−** | sealed canon |

**Conclusion:** This is a **verification problem before it is a model problem.** The covenant is broken at the registry layer; intelligence applied above a broken registry only makes the failure more articulate. Sequence accordingly: **Durability (close Keep→registry) → Retrieval (resolver E2E) → Visibility (the shelf) → Honor (provenance-preserving rank).** Each stage has a falsifiable receipt (§6); none is a feature claim until its receipt exists.

---

## 6. Acceptance gates (a passing receipt per stage)

- **Entrust:** a member-issued mark writes a durable significance flag under authenticated load. *(Receipt: marked row with member designation.)*
- **Durability:** a marked item, after session-end + server restart + a compaction cycle, is found by the **recall registry the live path actually reads** — not merely present in a sibling store. *(Receipt: the marked item appears in the atoms/recall query the live route runs, under authenticated load, on a later day.)*
- **Retrieval:** a direct "pull up what I marked about X" returns the entrusted item via `materialize`. *(Receipt: resolver E2E against a real marked fixture, not adapter SQL alone.)*
- **Honor:** under relevant context, the item surfaces in-prompt **with member-designation provenance intact** and not displaced by recency. *(Receipt: ablation showing the marked item present and attributed; provenance not flattened by the UNION.)*
- **Visibility:** the member can open a shelf and read per-item status reflecting the four gates above. *(Receipt: shelf renders real per-item covenant state, distinguishing lost / held / held-unused / never-received.)*

---

## 7. What this does NOT authorize

- No member-facing claim that "your memory is held" / "I'll remember this" until **Durability + Retrieval + Visibility** pass their receipts. Until then, acknowledgment language is capped at the verified stage (§2).
- No collapse of entrustment into the continuity narrative. They are different value categories and different failure registers; conflating them re-imports the inflation the claim discipline exists to prevent.
- No treatment of the shelf as cosmetic. Under this protocol it is the accountability instrument; shipping the covenant without it leaves the member unable to *verify*, which is half the load-bearing test.

---

## 8. Verification ledger — 2026-06-05

**Diagnosis relocated (the meaningful finding).** Tracing the chain moved the defect from
> "Entrusted memory **fails** Durability" (a broken covenant)

to
> "Entrust was **never wired** on the live route" (a dark feature).

These are not the same defect, and the second is a *better* standing than the first: **the covenant was never offered, not broken.** The live conversation (`/api/sovereign/app/maia/list`) never emitted `keepIntent` (only the ~zero-traffic `/api/oracle/conversation` did); the `member_ideas` writes seen earlier were the Idea Field (system-inferred, lower tier — Inv 11), not the entrustment gesture. So the registry froze because nothing on the live path ever wrote to it — not because writes were lost.

**Fix (branch `feat/live-route-explicit-keep-durability`, commit `4bfb08a77`).** The live route now runs `parseFilingInstruction` on the member's message; a high-confidence explicit instruction writes `member_memory_atoms` immediately via `applyConversationalKeepResult`. `evaluateKeepOffer` (salience) deliberately NOT ported — *detect declared entrustment, never solicit it.* Feature-flagged, non-blocking. Client `KeepAffordance` render (Visibility) deferred to a separate branch.

**Branch receipt — PASS** (`scripts/entrustment-durability-receipt.ts`, substrate round-trip on a migrated DB): `"keep this"` → detected high-confidence → `member_memory_atoms` row → returned by `loadMemberMemoryAtomsForPrompt` → `return_preference=contextual_doorway`. Does not exercise the HTTP/auth layer.

**Production state — verified read-only 2026-06-05:**
- `member_memory_atoms.return_preference` default = `contextual_doorway` → **migration `20260523000001` IS applied in prod.** Surfacing precondition met; **no migration deploy needed.**
- `CONVERSATIONAL_KEEP_ENABLED` = `false` → feature **off** in prod. The *only* remaining gate is flag-flip + code deploy — not a schema gap.
- `member_memory_atoms` = 127 rows (frozen — consistent with: live route never wrote + flag off).

**Scorecard (this date):**

| Stage | Status |
|---|---|
| Entrust machinery | Built |
| Entrust on live route | Fixed on branch, unverified in production |
| Durability | Proven on branch (receipt); prod migration precondition **confirmed** (`contextual_doorway`) |
| Retrieval | Not yet re-graded |
| Visibility | Open (next branch) |
| Honor | Open |

**Remaining rungs to "verified live":** deploy branch → set `CONVERSATIONAL_KEEP_ENABLED=true` → one real member says "keep this" → atom appears on a later authenticated turn (`[MAIA/sovereign] keep filed` / `atoms loaded { count ≥1 }`). The Proposed→Verified flip is the steward's to make once that live receipt exists.

### Live test — FALSE PROMISE, covenant breach confirmed (2026-06-05, post-deploy)

Deployed (server flag on), Kelly typed: `Keep this: my test phrase is blue cedar lantern.` MAIA replied *"Blue cedar lantern is kept."* Production showed: **no `keep filed` marker; atom count unchanged at 127; zero new atoms; no row containing "blue cedar."** The acknowledgment was unbacked — **a broken covenant, live, caught by the receipt rather than masked by the acknowledgment.**

Two defects — the second is the more important:
1. **Detection too narrow.** `Keep this: X` does not match the `$`-anchored bare-command patterns → `parseFilingInstruction` returned null → no write. (Predicted; now confirmed in production.)
2. **Speech-act ungated — the covenant-critical defect.** The "kept" was produced by the **language model**, not the keep code (the sidecar emits no conversational text). MAIA promises keeps **decoupled from whether the substrate wrote anything**, and this is **pre-existing** — independent of the deploy. The plumbing makes the promise *true* only on narrow matches; for everything else the model promises and nothing lands.

**Priority reframe:** the covenant is not only a memory-plumbing problem; it is a **speech-act control** problem — *MAIA must not say "kept" / "saved" / "remembered" unless the substrate confirms the write.* This is Invariant 11 ("capture early, promise late") and §2 of this protocol (speech-act capped at the verified stage), and it makes the acknowledgment layer **covenant-enforcing, not cosmetic Visibility.**

**Correction to prior framing:** the deployed cut was called "silent durability." It is **not silent** — the model talks and over-promises. Shipping plumbing without acknowledgment-gating does not produce silence; it produces ungoverned (and, here, false) promises.

**Next cut scoped:** `docs/specs/ENTRUSTMENT_KEEP_SPEECHACT_GATE_2026-06-05.md`. The deployed flag stays on (rollback does not fix a language-layer promise and would remove the correct narrow-match capture); the breach is closed by the gate, not by reverting plumbing.
