# WS2-02 / WS2-03 — Authority Audit

**Pass type**: plans only. **No code changed. No implementation begun.**
**Audited against**: `DESIGN-CONTRACT.md` · `CAPABILITY-COVENANT.md` ·
`DESIGN-DEVELOPMENT-PROTOCOL.md` · Creative-Distance Integrity (Protocol §19).
**Source of the plans**: `PROGRAMME.md` on `claude/writers-studio-organization-wxpb7q`.

| Unit | Planned scope, verbatim |
|---|---|
| **WS2-02** | Studio design system — typography, spacing, surfaces, gold treatment, navigation, panels, states, responsive rules |
| **WS2-03** | Studio shell — new application shell, persistent work context, navigation, MAIA region |

---

## The matrix

| # | Planned decision | Design Contract | Capability Covenant | Development Protocol | Creative-Distance Integrity | Verdict |
|---|---|---|---|---|---|---|
| 1 | **Typography / spacing / surfaces / gold** (02) | governed by the frozen pack | neutral | recompose, don't rebuild | neutral | **CLEAR** |
| 2 | **States / responsive rules** (02) | `08-writing-field-compact` governs compact | §8 continuity | §14 Q6 | must not sever distances on small surfaces | **CLEAR, with §14 Q6 as gate** |
| 3 | **Navigation** (02 + 03) | pack shows no global nav chrome | §1 Work-centered | §6 Work central, not navigation | ⚠️ risks six distances → six destinations | **ADJUDICATE** |
| 4 | **Panels** (02) | `04` foreground/background | §10 distances | §5 additive preservation | ⚠️ a panel per distance is a pipeline in disguise | **ADJUDICATE** |
| 5 | **Persistent work context** (03) | not a visual question | §1, §9 Work ≠ Material | §18 no silent collapse | Work is the center all distances view | 🔴 **CONFLICT RISK — highest** |
| 6 | **MAIA region** (03) | `08` governs disposition | §4 companion, not owner | §8 posture grammar | Relational is a distance, not a dock | 🔴 **CONFLICT RISK** |
| 7 | **Provenance in the model** | absent from the pack | §5 required | §9, §10 | underlies all distances | 🔴 **CONFLICT — scheduling** |
| 8 | **New application shell** (03) | pack is the composition | §15 non-regression | §4 decompose, don't replace | must not fragment movement | **ADJUDICATE** |
| 9 | **D-012 — new work lands inside** | — | — | §16 | — | **CLEAR, and correct** |
| 10 | **Per-room deploy from WS2-03** | — | — | §13 current referent | — | **CLEAR, with §13 as gate** |

---

## The three that need adjudication before implementation

### 🔴 A — "Persistent work context" does not name its object model

The single most load-bearing line in WS2-03, and it is one phrase. The Capability Covenant's first
WS2-02/03 constraint is explicit: **Work, Manuscript and Material must be different domain
objects — do not build a shell in which everything becomes "documents."**

A shell that persists "work context" as an opaque blob, a document id, or a route parameter
satisfies the sentence and forecloses the covenant. Protocol §18 names this exact collapse first:
*Work → document · Material → manuscript.*

**Required before WS2-03 implementation**: state the object model. Work, Manuscript and Material
as distinct, related, separately addressable — or an explicit founder ruling that they are not.

### 🔴 B — "MAIA region" is a UI slot where the covenant requires a relationship

A *region* is a place on a screen. The covenant requires that **MAIA interaction has somewhere to
belong relative to a Work without becoming manuscript content** — a relational fact, not a layout
slot. Protocol §8 sets the grammar: *SYSTEM carries. MAIA proposes. WRITER authorizes. THE RECORD
states what became authoritative.*

If the shell lands MAIA as a global panel, the Relational distance becomes a dock rather than a
way of standing toward the Work, and §19's rule is broken at the shell level — where it is most
expensive to fix. The predicted end state is the one the covenant names: *creative companionship
degenerating into chat pasted beside an editor.*

**Required**: say what a MAIA exchange belongs to, and where it is recorded, before the region is
positioned.

### 🔴 C — Provenance is scheduled after the shell it must live inside

`PROGRAMME.md` places provenance at **WS2-06 (MATERIALS)**. The Capability Covenant places it in
the underlying model at **WS2-02/03**: *the architecture must already be able to know — MAIA
suggested this · the writer wrote this · this came from a transcript · the writer later adopted
this.*

This is not a preference conflict; it is a **sequencing conflict between two controlling
documents**. A shell and data layer built without provenance will require retrofitting through
every surface WS2-04 onward, and Protocol §5's remedy does not apply — you cannot "preserve the
capability underneath and postpone the presentation" for a distinction that was never modelled.

**Required**: either move the provenance *model* (not its UI) into WS2-03, or record a founder
ruling that WS2-06 retrofit is accepted with its cost stated.

## Two flags — downstream, but set here

- **WS2-07 STRUCTURE reads "structure map, outline, movements…"** Protocol §18 forbids collapsing
  *structure → outline*, and §19 says `02-structure-versions` must not degenerate into a
  conventional sidebar. WS2-02 defines the panel treatment that will make that easy or hard.
  **Decide the distinction before the panel grammar is fixed.**
- **WS2-11 PUBLISH reads "export, manuscript assembly, sharing."** Covenant §11 requires
  *developing ≠ publishing*, and §12 keeps publication a deliberate human threshold. The shell's
  expression affordance is set at WS2-03. **A shell that treats export as an ordinary action has
  already decided it.**

## Clean — recorded so the audit is not only negative

Typography, spacing, surfaces and gold treatment are pure Design Contract territory and carry no
covenant exposure. States and responsive rules are clear, gated by §14 Q6. **D-012 is correct and
should be preserved** — it is the rule that prevents parallel legacy surfaces. Per-room deployment
from WS2-03 is sound provided §13 holds: **acceptance is always re-measured at the current
referent**, never inherited from a prior room's deploy.

## Disposition

**WS2-02 may not begin until A, B and C are adjudicated.** All three are architectural, all three
are cheap to settle now in words, and all three become expensive after the shell exists. None is a
design-taste question.

**No code was changed in this pass.**
