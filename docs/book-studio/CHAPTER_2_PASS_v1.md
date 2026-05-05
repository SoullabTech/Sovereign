# Chapter 2 (Torus of Change) Pass — v1 (Light-Touch, Side-by-Side)

**Source:** [`ELEMENTAL_ALCHEMY_MANUSCRIPT.md`](./ELEMENTAL_ALCHEMY_MANUSCRIPT.md), Ch 2 = L1059–L1302 (~244 lines).

**Method:** Tier A (safe formatting/parity fixes) + Tier B flagged-not-applied. Same discipline as Ch 1, Ch 5.

**Chapter character (read first):** Ch 2 establishes the *patterns of change* — torus, circle, spiral — and is structurally cleaner than Ch 5 with shorter sub-sections and a workbook-style ending. Already has good heading hierarchy. Pass is mostly artifact cleanup + epigraph parity.

---

## Movement Map (calibration only — not for the manuscript)

1. **Opening** — L1059–L1063 (Watts epigraph, image)
2. **The Dance of Transformation** — L1065–L1069 (intro + chapter framing)
3. **Awareness triad** — L1075–L1085 (Nature of Change / Necessity of Awareness / Living in the Moment)
4. **Rediscovering Ancient Wisdom** — L1089–L1101 (call back to inner wisdom)
5. **The Torus of Being and Becoming** — L1107–L1117 (the central metaphor)
6. **Change Occurs Within the Same Geometry** — L1123–L1165 (Circle + Spiral as sub-sections under this parent)
7. **Sacred Geometry** — L1171–L1191 (Kepler, mandala, holograms)
8. **Power of Focus: Mountain Biking** — L1193–L1209 (autobiographical anchor)
9. **Choosing an Authentic Path** — L1211–L1217 (Shakespeare)
10. **The Vision of the Crystalline Mandala** — L1221–L1248 (dream sequence + Four Focal Points)
11. **The Spiraling Path of Personal Development** — L1250–L1258
12. **An Example of Elemental Influence: Sarah's Evening** — L1260–L1278 (fictional illustration through 5 elements)
13. **Continuing the Dialogue** — L1280–L1289 (workbook section — inconsistent pattern flagged earlier)

---

## Tier A — Safe formatting / parity fixes (proposing to apply)

### Item A1 — Remove empty heading artifacts (10 instances)

**Locations of empty heading lines** (heading marker followed by no text):

| Line | Current | Proposal |
|------|---------|----------|
| L1071 | `### ` | remove |
| L1103 | `### ` | remove |
| L1119 | `### ` | remove |
| L1127 | `#### ` | remove |
| L1147 | `#### ` | remove |
| L1167 | `### ` | remove |
| L1219 | `### ` | remove |
| L1293 | `# ` | remove |
| L1295 | `# ` | remove |
| L1297 | `# ` | remove |
| L1301 | `# ` | remove |

Image-divider headings (e.g., `### ![][image11]`) are kept — those are intentional structural elements. Only the *empty* headings get removed.

**Decision:** ___

---

### Item A2 — Italicize five plain-text epigraphs for parity

Five epigraphs in the chapter are in plain text while every other epigraph in the chapter and the book is italicized. Same parity fix we've applied in Ch 1 (Jung, Teasdale, Yeats), Ch 2 (Watts, before this pass), Ch 5 (Rumi).

**Locations:**

| Line | Current | Proposed |
|------|---------|----------|
| L1195 | `"Where your attention goes, energy flows." — James Redfield` | wrap in `*…*` |
| L1213 | `"To thine own self be true." — William Shakespeare` | wrap in `*…*` |
| L1223 | `"A mandala symbolizes a microcosm of the universe from the human perspective." — Carl Jung` | wrap in `*…*` |
| L1268 | `"We are like islands in the sea, separate on the surface but connected in the deep." – William James` | wrap in `*…*` |
| L1276 | `"The mind is everything. What you think you become." – Buddha` | wrap in `*…*` |

Pure markup; no text content changed.

**Decision:** ___

---

## Tier B — Flagged for your read, not applied

### Flag B1 — Two horizontal-rule `---` separators

Two `---` markdown horizontal rules appear in the chapter:
- **L1135**: between the Black Elk epigraph for *The Circle* and the body paragraph "While sitting in a circle of participants…"
- **L1197**: between the Redfield epigraph for *Mountain Biking* and the body paragraph "As an undergraduate psychology student…"

These are the only two horizontal rules in Ch 2 (and likely the only two in the chapter). They sit between an epigraph and the autobiographical/anecdotal body that follows.

Three possibilities:
- **(a)** Intentional — visual breaks signaling *"now we shift from epigraph-frame to lived narrative."* Both spots are exactly that mode shift.
- **(b)** Artifact — leftover from the original document conversion that should be removed for consistency with the rest of the manuscript.
- **(c)** Underused pattern — should appear consistently before every personal anecdote across the book, or removed.

**My read:** they look intentional (both spots have the same function), but they're under-used so they read as inconsistent. Your call — don't think I should resolve this in Tier A.

**Decision (keep / remove / extend pattern / defer):** ___

---

### Flag B2 — *"Continuing the Dialogue"* workbook ending (L1280–L1289)

Already flagged earlier as part of the *workbook-vs-lyrical chapter ending* inconsistency across the book (Ch 1 + Ch 2 have workbook endings; Ch 3 + Ch 4 + others close lyrically). This belongs to the later pattern-consistency pass — not for this Ch 2 local pass.

**No action proposed in this pass.** Logging only.

---

### Flag B3 — Heading hierarchy under *Change Occurs Within the Same Geometry*

The structure works:
- L1123 `### Change Occurs Within the Same Geometry of Life` (parent)
  - L1131 `#### The Circle: A Model of Wholeness` (child)
  - L1151 `#### The Spiral: A Model of Change` (child)

This is a clean parent/child structure. **No change proposed.** Logging as confirmation.

---

## What I deliberately did NOT touch

- The Mountain Biking story and Crystalline Mandala dream — distinct content, intentional autobiographical anchors
- The 4 Focal Points list (Ideal / Challenges / Resources / Personal Goal) — structured teaching content
- Sarah's Evening section — fictional illustration of the elements; intentional teaching device
- The Watts epigraph at chapter open — already italicized from earlier pass

---

## What I'd need from you

For each Tier A item: ✅ / ✏️ / ❌ / ⏸.
For each Tier B flag: ✅ / ✏️ / ❌ / ⏸.

When you send back, Tier A approvals get applied as one focused commit (formatting/parity only, no text change). Tier B items only get touched if you give explicit ✏️ with direction.

Then we stop and continue to the next chapter.
