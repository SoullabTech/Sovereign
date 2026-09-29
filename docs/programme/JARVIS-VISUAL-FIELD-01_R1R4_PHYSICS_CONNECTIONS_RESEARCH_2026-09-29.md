# JARVIS-VISUAL-FIELD-01 · R1R4 — Physics + Connections Research / Model Selection

**Parent flow:** JARVIS-VISUAL-FIELD-01
**Reason opened:** Founder accepts recursive containment direction but identifies missing Obsidian-like physics, visible connections, and cursor-over insight.
**Current implementation subject:** `c7715a4aa17d170ff49db50118aa6df67f691217`
**Standing:** R1R3 proves recursive containment + continuous camera zoom. It does not yet prove living relational physics.

## Governing question

What spatial / physics model best combines:
- Grokker-style recursive containment;
- Obsidian-like force dynamics;
- visible semantic relations;
- hover / cursor-over insight;
- stable mental-map preservation;
- progressive disclosure rather than graph hairball?

## Research findings

### Grokker
The original Grokker interaction is a recursive circular information map: category circles contain nested subcategory circles and zoom transitions preserve orientation while moving into them.

### Obsidian
Obsidian Graph View exposes four direct physics controls:
- center force;
- repel force;
- link force;
- link distance.

Its local graph narrows the visible network around an active node and allows depth to increase level by level.

### ForceAtlas2 / Gephi
ForceAtlas2 treats network layout as a continuously running physical system:
- nodes repel;
- connected nodes attract;
- edge weight can influence attraction;
- adaptive local/global speed is used to keep the layout fluid while reducing oscillation.

Strength: organic relational maps.
Limitation for Soullab WORLD: ordinary ForceAtlas2 does not provide recursive compound containment.

### Cytoscape / fCoSE
fCoSE is a high-quality force-directed layout with explicit support for compound graphs and placement constraints. Per-node repulsion and per-edge ideal length / elasticity can be customized.

Strength: strongest off-the-shelf candidate for compound graph physics.
Limitation: its native visual grammar is graph/compound layout, not Grokker circular enclosure; matching the exact bubble-world aesthetic would still require custom rendering.

### Sigma / Graphology
Sigma is strong for large relational graphs, WebGL rendering, camera interaction, and hover layers. Modern Sigma patterns include hovering a node to highlight its neighborhood while unrelated nodes/edges fade.

Strength: excellent future WEB / Local Field renderer.
Limitation: no native nested bubble containment.

### Focus+context research
Semantic/fisheye zoom research supports enlarging the area of interest while retaining meaningful surrounding context. This directly addresses the risk that zooming hides the relationships the person needs to stay oriented.

### Information visualization law
Overview first → zoom/filter → details on demand. The field should not expose every label and every edge at the wide view.

## Architectural options

### A · D3 Pack only
Status: current R1R3 substrate.

Pros:
- true recursive bubbles;
- stable hierarchy;
- straightforward semantic zoom.

Cons:
- no relational physics;
- no meaningful edge forces;
- static cluster interiors.

Verdict: necessary foundation, insufficient final model.

### B · Pure ForceAtlas2 / Sigma
Pros:
- excellent physics;
- strong hover / relation affordances;
- scalable.

Cons:
- destroys recursive containment as the primary spatial grammar.

Verdict: ideal for future WEB mode, not ideal as the WORLD substrate.

### C · Pure fCoSE compound graph
Pros:
- compound graph support;
- force physics;
- constraints;
- high-quality relational layout.

Cons:
- does not naturally preserve circular enclosure / Grokker bubble semantics;
- would require custom circular compound rendering and semantic zoom.

Verdict: serious challenger implementation, worth benchmarking.

### D · Hybrid Grokker + constrained force field
**Preferred research candidate.**

1. D3 hierarchy / circle pack defines canonical containment and initial geography.
2. A continuous D3 force simulation runs on visible nodes within each parent:
   - sibling repulsion;
   - collision;
   - semantic link springs;
   - parent-center cohesion;
   - custom circular containment force;
   - positional anchor / inertia toward the pack geometry;
   - drag force.
3. Parent circles remain stable enough to preserve the mental map.
4. Cross-parent relations appear as routed threads and may weakly influence cluster placement, but do not destroy containment.
5. Physics sleeps after settling and reheats locally on interaction.

This preserves Grokker's nested world while giving it Obsidian's living movement.

## Proposed Soullab force model

For a visible node n:

F(n) =
  sibling_repulsion
+ collision
+ semantic_link_springs
+ parent_center_cohesion
+ circular_containment
+ pack_anchor_inertia
+ user_drag

### sibling_repulsion
Keeps nodes from collapsing together.

### collision
Respects visible node radius and label affordance.

### semantic_link_springs
Explicit relations act like elastic links.
Strength and ideal distance depend on relation type / standing.

### parent_center_cohesion
Keeps children belonging to their containing region without forcing a rigid grid.

### circular_containment
Prevents children escaping their parent bubble.

### pack_anchor_inertia
Keeps the whole field recognizable across visits and interactions.

### user_drag
Allows direct manipulation. Nearby related nodes respond more than distant nodes.

## Physics behavior law

- The field may move while finding a meaningful arrangement.
- It should settle.
- Hover does not continuously destabilize the field.
- Drag or structural change locally reheats the simulation.
- Releasing a dragged node lets its neighborhood relax without randomizing the whole world.
- Camera zoom never recomputes topology.
- Returning to a wider view restores the same spatial world.

## Connections

WORLD requires two simultaneous structures:

1. **Containment relation**
   Parent ↔ child. Expressed primarily by enclosure.

2. **Semantic relation**
   Node ↔ node. Expressed by edges / threads.

Semantic edges must have:
- relation type;
- direction where relevant;
- epistemic standing;
- rationale / provenance;
- visibility policy.

The existence of a visible edge may never be inferred merely from spatial proximity.

## Edge visibility / anti-hairball law

Default wide view:
- show only major / currently relevant relations;
- suppress weak or long edges;
- preserve hidden edges in physics only when warranted.

Hover / focus:
- reveal the focused node's direct edges;
- highlight direct neighbors;
- fade unrelated nodes / edges;
- show edge labels on hover;
- optionally reveal second-degree neighbors on deliberate expansion.

This follows the practical graph-visualization lesson that force-directed graphs become unreadable when too much of the network is shown at once.

## Cursor-over / hover insight

Desktop hover should reveal without requiring a click:

### Node hover
- brighten node;
- enlarge label;
- highlight immediate neighbors;
- reveal connecting edges;
- fade unrelated field;
- show a small insight card:
  - node name;
  - one-line essence;
  - current inquiry;
  - 2–4 strongest visible relations;
  - relation/provenance standing where useful.

### Edge hover
- thicken/highlight edge;
- show relation verb;
- show concise rationale: "why these are connected";
- show standing (canonical / member-confirmed / candidate / source-supported).

### Cluster hover
- softly reveal the cluster's child labels;
- dim unrelated clusters;
- do not zoom until click.

### Mobile equivalent
No hover:
- first tap = focus / reveal neighborhood + insight;
- second tap = enter;
- tap surrounding field = release / widen.

## Obsidian-inspired local field

Add a LOCAL FIELD depth concept around the current focus:

Depth 0 — focus only
Depth 1 — direct relations
Depth 2 — relations of direct relations
Depth 3 — wider neighborhood

Do not expose this initially as a technical slider. It can appear as:
- Near
- Wider
- Wider still

The internal engine may still use graph depth 1/2/3.

## Semantic zoom / level of detail

Wide view:
- labels only for major clusters;
- semantic edges mostly latent.

Mid zoom:
- child labels appear;
- strongest relations become visible.

Near zoom:
- node inquiry / essence;
- hover relationship detail;
- local graph cues.

Deep focus:
- details on demand;
- sources / provenance later.

This prevents the current screenshot problem where every descendant competes for attention at once.

## Mental-map preservation

The field needs inertia:
- stable pack anchors;
- low global reheating;
- local relaxation;
- optional pin / hold;
- deterministic initialization;
- no random rearrangement when reopening the same represented field.

## Recommended technical split

### WORLD renderer
D3 hierarchy + D3 force + custom containment force.
Reason: maximum control over circular recursive world plus dynamic physics.

### WEB renderer (later)
Benchmark Sigma + Graphology/ForceAtlas2 against Cytoscape/fCoSE.
Reason: relational network performance and hover affordances matter more than circular containment in WEB.

### Challenger
Prototype fCoSE on the same ~70-node corpus to test whether compound-graph physics can outperform the custom D3 hybrid without sacrificing the desired bubble-world feel.

## R1R4 research conclusion

Do not keep polishing the current pack-only view.

The next meaningful prototype should compare:

**P1 — D3 hybrid: recursive pack + constrained force physics**
vs.
**P2 — fCoSE compound physics challenger**

Both must support:
- explicit semantic edges;
- local settling;
- drag;
- hover neighborhood;
- hover insight;
- progressive labels;
- stable return.

Founder witness chooses the spatial substrate based on felt behavior, not screenshots.

## Next boundary candidate

`VISUAL-FIELD-RUNTIME-01R1R5 — PHYSICS / CONNECTIONS A-B PROTOTYPE · D3 HYBRID VS fCoSE COMPOUND`

STOP before integrating memory, MAIA, WEB, FLOW, or autonomous relation generation.
