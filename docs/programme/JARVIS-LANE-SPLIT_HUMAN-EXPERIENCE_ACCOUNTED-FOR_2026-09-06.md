# Lane split — Human Experience Architecture ⇄ Accounted For (founder ruling, 2026-09-06)

**Act:** Founder ruling, 2026-09-06.
**Effect:** `JARVIS-RD-HUMAN-EXPERIENCE-ARCHITECTURE-01` is split. A second lane, `JARVIS-PUBLIC-ACCOUNTED-FOR-01`, is opened and inherits `/accounted-for`, PR #1239 and its publication evidence. The first lane resumes MAIA/AIN development.
**Why now:** not because the original lane became too large, but because a genuine programme boundary has been reached — one lane develops the understanding; the other maintains the public account of that understanding. Two lanes may not own the same unresolved question.

---

## 1 · The two lanes

### Lane 1 — `JARVIS-RD-HUMAN-EXPERIENCE-ARCHITECTURE-01` (continues)

Owns: Synthesis v0.2 · R&D evidence · principles / anti-patterns · Elemental Consciousness hypotheses · the Human Question (Self · Relationship · World) · whole-organism MAIA/AIN census · gap analysis · experiments · measurement · the future Jarvis Experience Review · changes to MAIA/AIN arising from the research.

No longer owns: editing `/accounted-for`; PR #1239.

Next act: **Phase 1 — Whole-Organism MAIA/AIN Mapping** (`JARVIS-RD-HUMAN-EXPERIENCE-ARCHITECTURE-01_INTEGRATION_FLOW_2026-09-06.md`, Phase 1; read-only; Field Study method). Governing question from here: *How must MAIA/AIN change because of what we now understand?*

### Lane 2 — `JARVIS-PUBLIC-ACCOUNTED-FOR-01` (opened)

Owns only: `/accounted-for` · its source-of-record pitch document · claim reconciliation · Live / Partly Live / Designed / Vision accuracy · public wording of hypotheses and unknowns · render / responsive layout · citations or evidence references used publicly · the claim-discipline gate · PR #1239 and its eventual merge and deploy.

Charter: `docs/programme/JARVIS-PUBLIC-ACCOUNTED-FOR-01_CHARTER_2026-09-06.md`. Governing question: *Does `/accounted-for` truthfully represent the current state of Soullab and MAIA without getting ahead of evidence or architecture?*

It does not conduct foundational research. It consumes the current synthesis as an upstream authority.

## 2 · Direction of authority between the lanes

```text
HUMAN EXPERIENCE R&D
        │
        │ publishes accepted synthesis / rulings
        ↓
ACCOUNTED-FOR LANE
        │
        │ reconciles public claims
        ↓
PUBLIC PAGE
```

Not the reverse. The Accounted For lane may translate R&D findings. It may not adjudicate or alter them. Where public wording exposes a contradiction upstream, the contradiction is recorded and returned to the owning lane; it is not resolved in the publication lane.

## 3 · Custody transfer — what moved, verbatim

| Item | From | To | State at transfer |
|---|---|---|---|
| `app/accounted-for/page.tsx` | R&D lane | Accounted For lane | reconciled to v0.2, seventh revision |
| `docs/pitch/MAIA_PLATFORM_ACCOUNTING_2026-09-03.md` | R&D lane | Accounted For lane | §7a/§7b updated, §7c reconciliation note |
| `docs/programme/JARVIS-RD-HUMAN-EXPERIENCE-ARCHITECTURE-01_CLAIM_RECONCILIATION_2026-09-06.md` | R&D lane (authored) | Accounted For lane (custodied as publication evidence; content not re-adjudicated) | RUN, 32 rows |
| `docs/design/contracts/accounted-for.md` + screenshots | R&D lane | Accounted For lane | walk PASS |
| PR #1239 (`claude/maia-human-experience-arch-12g5r6`, head `cf6d9ebf`) | R&D lane | Accounted For lane | DRAFT · merge NOT AUTHORIZED · deploy NOT AUTHORIZED |

**What did not move:** authority over the Human Experience Architecture. Synthesis v0.2, P1–P13, AP1–AP17, U1–U33, the inquiries R8–R12, the frameworks and the integration flow remain the R&D lane's. They ride on PR #1239 for merge purposes only; the Accounted For lane does not edit them (charter §3, custody boundary).

## 4 · Message to the original lane (to be read at its next session start)

> `/accounted-for` and PR #1239 have transferred to `JARVIS-PUBLIC-ACCOUNTED-FOR-01`. Do not edit or govern that surface from this lane. Resume at Phase 1: Whole-Organism MAIA/AIN Mapping.

## 5 · Where this record lands, and the one amendment still owed

This record and the new charter land on `claude/jarvis-lane-split-7uquoi`, based on `clean-main-no-secrets` at `b6f10a2f`, **independent of PR #1239**. The split is a governance act and must be mergeable without waiting on the publication PR's merge ruling. The R&D lane's charter (§1–§23) exists only on the PR #1239 branch and is therefore not amended here.

**Owed amendment — R&D charter §24.** Append the text below to `docs/programme/JARVIS-RD-HUMAN-EXPERIENCE-ARCHITECTURE-01_CHARTER_2026-09-06.md` at the earliest opportunity: by the Accounted For lane as a custody-only commit on the PR branch (no other change to that file), or by the R&D lane on its first branch after #1239 merges. Whichever lands first; the other is skipped.

```markdown
## 24 · Lane split — `/accounted-for` and PR #1239 transferred out (founder ruling, 2026-09-06)

**Founder act.** `/accounted-for`, its source of record, the claim-reconciliation record, the page
contract and screenshots, and PR #1239 transfer to `JARVIS-PUBLIC-ACCOUNTED-FOR-01`
(`docs/programme/JARVIS-PUBLIC-ACCOUNTED-FOR-01_CHARTER_2026-09-06.md`). This lane no longer
edits or governs that surface. Authority over the Human Experience Architecture — Synthesis v0.2,
P1–P13, AP1–AP17, U1–U33, R8–R12, the frameworks, the integration flow — stays here; the
publication lane translates accepted outputs and may not alter them. Split record:
`docs/programme/JARVIS-LANE-SPLIT_HUMAN-EXPERIENCE_ACCOUNTED-FOR_2026-09-06.md`.

**Next act:** Phase 1 — Whole-Organism MAIA/AIN Mapping (integration flow, Phase 1; read-only;
Field Study method). Governing question from here: *how must MAIA/AIN change because of what we
now understand?*
```

**CLAUDE.md note.** PR #1239 adds one priority-thread bullet for the R&D lane; this branch adds one for the split. Both insert at the head of the priority thread, so the two merges will produce a one-line textual conflict. Resolution: keep both bullets; the split bullet sits above the R&D bullet.

## 6 · Governing sentence

*Accounted For does not decide what Soullab is. It makes Soullab answer publicly for what it says it is.*
