# JOP-04 — jurisdiction correction · R32 may not be held by this programme

**Founder ruling, 2026-09-20.** Records a structural defect found while assessing three
commits produced by the JOP-04 MCP substrate census. Discovery was valid; governance and
runtime change were not authorized by it.

---

## The defect

`JOP-04` inherited a **MAIA exclusion boundary**, in writing, in its own continuity ruling:

```text
JARVIS_LIVING_SPIRAL_JURISDICTION_2026-08-16.md · R1
    "It does not live inside MAIA."      Placement inside MAIA: REFUSED

JOP-04_CONTINUITY_RULING_2026-09-13.md · "Inherited without reopening"
    | MAIA exclusion boundary | same, R1 |
```

**R32 governs ingress into MAIA cognition.** A refusal of that kind cannot sit in a
programme whose ratified jurisdiction explicitly refuses placement inside MAIA. This is not
a naming collision and is not repairable by relabelling: **the lane's authority does not
reach the domain the refusal governs.**

## The evidence, preserved deliberately

`c71710aeb` did two things in one commit:

```text
registered R32 in the canonical refusal registry index   (governance)
modified lib/consciousness/maiaOrchestrator.ts           (MAIA runtime)
```

It is kept in the record because it demonstrates the principle exactly:
**jurisdiction must precede implementation, and cannot be inferred from whoever discovered
the need.** The census was authorized to discover MAIA-side facts. It was not authorized to
establish MAIA runtime governance, and discovering a boundary did not confer authority to
govern or modify it.

⚠️ The underlying finding is sound and is not disputed here: an unsolicited per-turn
member-context acquisition existed on a MAIA cognition path with no named consent boundary,
its output unconsumed. *Dormancy is not sovereignty.* The reasoning is right; its placement
is not.

## Ruling

```text
1 TARGET      clean-main-no-secrets. Census a4ba99ac4 cherry-picked, docs-only.
              NOT consolidated into feature/jarvis-ws2-sel0-production-discovery-2026-09-08,
              which is jurisdictionally unrelated.

2 HOLD        NOT CLEARED. The hold over MAIA runtime change remains in force.
              c71710aeb is NOT authorized to merge or deploy in its present form.

3 R32         REHOME TO MAIA JURISDICTION.
              Preserve R32 as the next standing registry identity — do NOT renumber.
              Relocate its normative authority to a MAIA-side cognition/runtime
              boundary lane. The Human Experience master run may record the census
              finding and its provenance; it does not thereby become the governing
              authority for MAIA ingress.
```

⛔ **Do not repair `c71710aeb` in place by changing labels or lane names.** The valid
discovery must be separated from the unauthorized governance and runtime change, not
renamed into legitimacy.

⛔ **Renumbering R32 is refused.** Its first placement was invalid; its identity was not.
Renumbering would convert an architectural correction into historical rewriting.

## Required sequence

```text
JOP-04 discovery
    -> census record                      (done — a4ba99ac4)
    -> MAIA-side authority established     (NOT DONE)
    -> R32 jurisdiction corrected          (NOT DONE)
    -> runtime implementation considered under that authority
```

## Standing

```text
a4ba99ac4  census               CHERRY-PICKED · docs-only
c71710aeb  quarantine + R32     HELD · not authorized to merge or deploy
96b258c79  JOP-04 spec v0.3     remains with JOP-04 documentation;
                                no consolidation into WS2 authorized
R32                             identity PRESERVED · authority UNPLACED
MAIA cognition change           NOT AUTHORIZED
merge / deploy                  NOT AUTHORIZED by this ruling
```
