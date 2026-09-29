# SOULLAB-FIELD-TOPOLOGY-01R2 — Perspectival Constellation Presentation Spec

**Class:** design only
**Base:** `956ed92ac36121e0df4cfa64e40cb2d9d1642ebb`
**R1 presentation baseline:** observed from the current composite Living Constellation worktree; implementation remains untouched
**Replacement target:** `LivingConstellationPanel`

## 1. Governing idea

The constellation is not a menu of three peer products.

It is one living topology viewed from different positions.

The presentation must answer three human questions:

1. **Where am I now?**
2. **What wider context am I inside?**
3. **What adjacent movement is available from here?**

Living Field is the wider context. Vision Studio and Practice Field are distinct developmental perspectives within that wider field.

The projection remains read-only orientation. It does not create psychological, semantic, causal, or biographical relations.
## 2. R1 freeze

R1 is frozen as evidence, not adopted as final presentation.

Preserve from R1 / LC-02:

- one shared projection across Living Field, Vision Studio, and Practice Field;
- one authenticated member-scoped source population;
- the existing projection nodes and domain membership;
- member-center `orientation_only` standing;
- visible authorship / confirmation / MAIA-candidate standing;
- privacy and practitioner-sharing standing;
- partial-projection honesty;
- zero durable semantic edges;
- zero cross-domain copy or promotion;
- zero persistence or consent mutation;
- source provenance and source-surface identity.

Replace only the presentation logic that currently renders all three domains as peer cards around a center.

R2 does not alter API shape, source adapters, database reads, projection admission, or governance semantics.
## 3. Topological law

### Living Field

Living Field is **context**, not a peer destination when the member is already inside it.

In the Living Field perspective, do not render a `Living Field` domain card.

The whole constellation surface is already the Living Field.

Vision Studio and Practice Field appear as meaningful expressions or pathways within that field, while Living Field projection nodes remain visible as life material within the surrounding field.

### Vision Studio

Vision Studio is the foreground developmental perspective: **what the work is becoming**.

Living Field appears as the wider context and return path, never as a competing card.

Practice Field may appear as an adjacent pathway when the adjacency rule is satisfied.

### Practice Field

Practice Field is the foreground relational perspective: **how the work meets others**.

Living Field appears as the wider context and return path, never as a competing card.

Vision Studio may appear as an adjacent pathway when the adjacency rule is satisfied.
## 4. Living Field perspective

### Member-facing frame

**Eyebrow:** `Living Field`

**Primary line:** `See what is taking shape across your life.`

**Supporting line:** `Some parts are being lived, some are becoming clearer, and some may be ready to develop or meet others.`

### Presentation

The panel is a quiet field, not a card grid.

- Living Field source nodes appear as local points / strands in the field.
- Vision Studio appears as a secondary pathway labeled **Develop something**.
- Practice Field appears as a secondary pathway labeled **Meet others through your work**.
- The member-center projection may be rendered only as a small orientation marker: **You are here**. It must remain explicitly orientation-only.
- No `Living Field` card is rendered because the member is already inside the Living Field.

When Vision or Practice contains no admitted projection nodes, its pathway may remain latent until expansion rather than displaying an empty peer card.
## 5. Vision Studio perspective

### Member-facing frame

**Eyebrow:** `Vision Studio`

**Primary line:** `Develop what wants to become more real.`

**Context line:** `This work sits within your wider Living Field.`

### Presentation

Foreground Vision Studio material first.

The member sees:

- the current Vision threads / nodes as the primary local constellation;
- a quiet context control: **Widen to Living Field**;
- provenance and authority labels attached to Vision material exactly as projected;
- Practice Field only as an adjacent pathway when the adjacency rule is met.

Living Field is represented by context, boundary, and return—not by a peer card.

If adjacent Practice is shown, its label is **See how this meets others** rather than `Open Practice Field`.
## 6. Practice Field perspective

### Member-facing frame

**Eyebrow:** `Practice Field`

**Primary line:** `Tend how your work meets other people.`

**Context line:** `Your practice lives within the wider field of your life and work.`

### Presentation

Foreground Practice Field material first.

The member sees:

- the current Practice Field node / material as the primary local constellation;
- a quiet context control: **Widen to Living Field**;
- provenance, readiness, containment, and privacy standing without reinterpretation;
- Vision Studio only as an adjacent pathway when the adjacency rule is met.

Living Field is represented by context, boundary, and return—not by a peer card.

If adjacent Vision is shown, its label is **Develop the work further** rather than `Open Vision Studio`.
## 7. Vision ↔ Practice adjacency rule

Vision and Practice are **navigationally adjacent**, not semantically linked by default.

Show the adjacent pathway only when all of the following are true:

1. the member is currently in Vision Studio or Practice Field;
2. the other domain is available to that member;
3. showing the pathway does not require inventing a relation between individual nodes;
4. the pathway can be described as a possible next place, not as a claim that material has already crossed domains.

Preferred stronger trigger: the adjacent domain already contains at least one admitted projection node.

Permitted weaker trigger: the adjacent room exists and the member explicitly expands **Other directions**.

Never infer adjacency from matching words, themes, Spiralogic phases, embeddings, MAIA interpretation, or proximity in the drawing.

An explicit member-authored crossing may later justify stronger presentation, but R2 introduces no such relation model.
## 8. Member-facing topology language

Use verbs that describe movement, not system architecture.

| Meaning | Member-facing language | Avoid |
|---|---|---|
| context | `Within your wider Living Field` | `parent domain`, `root`, `container` |
| widen | `Widen to Living Field` / `See the wider field` | `go up`, `back to root` |
| develop | `Develop this` / `Develop the work` | `open Vision node` |
| meet others | `See how this meets others` / `Bring this into practice` | `cross-domain transition` |
| return | `Return to where you were` | `back`, when the return address is meaningful |
| adjacency | `Another direction` / `You can also…` | `related`, unless relation is explicitly authored |

Navigation may name `Vision Studio` and `Practice Field`, but the first language should express what the movement means.
## 9. Collapsed and expanded states

### Collapsed — default

The topology stays quiet.

Show only:

- current perspective name;
- one sentence of orientation;
- up to three most relevant local projection nodes already admitted by the existing projection;
- one subtle **See the wider field** or **Other directions** affordance when useful.

Do not show all domains, all empty states, all pathways, or the full explanatory legend by default.

### Expanded — member asks for orientation

Expansion may reveal:

- additional local nodes;
- wider Living Field context;
- available adjacent pathway;
- authority / privacy legend if needed;
- partial-field notice;
- the return address to the exact perspective the member expanded from.

Expanded topology remains read-only. Expansion changes visibility, never standing.
## 10. Quiet-state rules

Empty space is not a deficit message.

When a pathway has no admitted material:

- collapsed state: omit it unless needed for orientation;
- expanded state: use `This area is available when something wants to develop here.`

When projection is partial:

- `This view is showing the parts currently within reach.`

When projection fetch fails:

- `The wider field can be revisited in a moment.`

Do not imply that absence means the member has no vision, no practice, no relationship, or no development in that part of life.

Do not show an empty peer card merely to preserve visual symmetry.
## 11. Projection and provenance invariants

The presentation contract must consume the current `LivingConstellationProjection` without rewriting its meaning.

For every visible node preserve:

- `projectionId`;
- `domain`;
- `sourceType`;
- `sourceId`;
- `label` / excerpt;
- `authorship`;
- `standing`;
- `privacy`;
- timestamps when surfaced;
- `source.table`;
- `source.sourceSurface`;
- persisted-center caveat where present;
- bounded details.

`member:center` remains `orientation_only`.

Presentation language may become warmer, but it must never flatten `maia_candidate`, `member_confirmed`, member-authored, practitioner-authored, private, or explicitly shared standing into one generic status.
## 12. Replacement presentation contract for `LivingConstellationPanel`

The replacement component remains one shared component with `focus="living" | "vision" | "practice"`.

Its presentation contract is:

**Input**

- current `focus`;
- current `LivingConstellationProjection`;
- no new persistence authority;
- no new relation data.

**Derived presentation state**

- `perspective`: living / vision / practice;
- `localNodes`: nodes belonging to the foreground perspective;
- `contextNodes`: Living Field nodes when context is expanded;
- `adjacentPathway`: at most one Vision ↔ Practice pathway under the adjacency rule;
- `expanded`: local UI disclosure state only;
- `returnAddress`: the exact perspective / room from which widening occurred.

**Output**

- foreground material;
- wider-context affordance;
- optional adjacent pathway;
- provenance / privacy standing;
- no inferred semantic edges.
## 13. Perspective matrix

| Current perspective | Foreground | Wider context | Adjacent pathway |
|---|---|---|---|
| Living Field | Living Field nodes / life material | already implicit in the whole surface | Vision and Practice as quiet possible directions |
| Vision Studio | Vision nodes | `Widen to Living Field` | Practice when adjacency rule passes |
| Practice Field | Practice material | `Widen to Living Field` | Vision when adjacency rule passes |

Critical rule:

> Living Field is never rendered as its own peer card inside the Living Field perspective, and never competes visually with the current room in Vision or Practice.

## 14. Visual hierarchy contract

1. **Current perspective** — strongest.
2. **Current admitted material** — primary content.
3. **Wider Living Field context** — quieter, spatially surrounding or above/below, never peer-weight.
4. **Adjacent pathway** — tertiary, optional, verb-led.
5. **Governance / provenance detail** — available but visually subordinate to the member's material.

The topology should feel like changing vantage point within one place, not navigating between three applications.
## 15. Non-goals / stop law

R2 does not:

- change projection queries;
- add or remove source nodes;
- create semantic edges;
- infer node relationships;
- create durable cross-domain links;
- alter authorship or privacy;
- alter consent or sharing;
- change Vision or Practice source semantics;
- repair persisted Vision center provenance;
- implement UI code;
- merge or deploy anything.

## 16. R2 standing

This spec replaces the **meaning of the map presentation**, not the underlying field projection.

The central shift is:

> **from three peer cards around a center → to one Living Field experienced from different perspectives, with context, widening, adjacency, and return.**

**STOP before implementation.**
