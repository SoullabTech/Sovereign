# Starter prompt — one Writer's Studio build pass

Paste this, substituting the field. It exists so a pass cannot quietly become
"we improved the current page".

---

Use `docs/design/writer-studio/references/<FILE>.png` as the visual
specification for **<FIELD>**.

Read it first. Then read
`docs/programmes/writers-studio-v2/FIELD-MAP.md` for what already exists
underneath this field, and build from that substrate — the census says which
capabilities are REUSE AS-IS, REUSE + RECOMPOSE, EXTEND, or NEW.

Recreate the composition faithfully in the existing Writer's Studio:

- match panel proportions
- match hierarchy
- match spacing rhythm
- match density
- match typography scale
- match the dark Soullab palette and gold emphasis
- match manuscript centrality
- match the placement of MAIA, Materials, Versions and Structure
- preserve real functionality and real data
- do not hard-code the reference's content as fixtures
- do not use generic placeholder cards where real components exist

Then:

```bash
node scripts/capture-studio-field.mjs <field> --url=<where the app runs> --sha=$(git rev-parse --short HEAD)
```

Put the reference and the capture side by side. Compare in this order —
composition, hierarchy, proportion, density, spacing rhythm, typography scale,
palette, states, interaction. Name the **largest** divergence. Repair that one.
Capture again. Repeat until the running surface is recognizably the same design.

Do not report the field finished on a green test suite. Functional green is not
acceptance for this programme. Acceptance is the pair of images.

Two things that outrank the reference: `DECISIONS.md` D-003 — no score, grade or
ranking MAIA produced ships as a measurement, in any field — and the sovereignty
invariants in `CLAUDE.md`. Where the image and a decision disagree, the decision
wins and the divergence is recorded, not silently resolved.
