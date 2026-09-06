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

**Owed amendment — R&D charter transfer section.** Append the text below to `docs/programme/JARVIS-RD-HUMAN-EXPERIENCE-ARCHITECTURE-01_CHARTER_2026-09-06.md` as its **next section number** (the §24 slot was taken at 17:36Z by the pivot act, see §7; do not renumber existing sections): by the R&D lane on its Phase 1 branch, or by the Accounted For lane as a custody-only commit on the PR branch (no other change to that file). Whichever lands first; the other is skipped.

```markdown
## 2N · Lane split — `/accounted-for` and PR #1239 transferred out (founder ruling, 2026-09-06)

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

## 7 · Collision observed at the split (2026-09-06, 17:27–17:43Z) — needs one founder ruling

While this split was being recorded, the original lane's session (`session_01A9AeaBFtEQRaQqjAaep6no`, still alive: "6 census agents running; will compile map when reports arrive") executed a **different** founder act of the same day and pushed it to the PR #1239 branch:

| Commit | Time | What it did |
|---|---|---|
| `210fa74f` | 17:36:06Z | Master run promoted to canonical cockpit (`docs/programme/JARVIS-HUMAN-EXPERIENCE-MASTER-RUN-v1.md`); Phase 1 opened; manifesto FROZEN; R&D charter gains **§24** (pivot, not the split); CLAUDE.md bullet rewritten |
| `c36d82ec` | 17:36:51Z | Whole-organism ranked-map skeleton (`docs/programme/MAIA_WHOLE_ORGANISM_MAP/00_RANKED_MAP.md`, `TEMPLATE.md`) |

Neither commit mentions this split or `JARVIS-PUBLIC-ACCOUNTED-FOR-01`. Three points of contact:

1. **Consistent with the split, inherited as a constraint.** The pivot's Act 3 freezes substantive manifesto expansion on `/accounted-for` (revised only at phase boundaries or when a label's warrant changes). The publication lane honours that freeze; it is the same "no expansion without a warrant" rule as charter §8 D.
2. **Contradicts the split — custody still claimed by the R&D cockpit.** Master run §4 (Phase 0.5) assigns to the R&D lane's Jarvis: *keep the page reconciled if v0.2 changes · keep render + gates green · paraphrase-check … re-read the page … maintain PR #1239 as DRAFT*; §4 OUTPUTS reserves the merge ruling as a charter section; §11 (Phase 7) assigns *revise `/accounted-for` at every phase boundary · maintain the public ledger*. Under the split those lines belong to `JARVIS-PUBLIC-ACCOUNTED-FOR-01`. The master run's `current_pr` / `current_public_artifact` state lines may remain as **pointers**, not as custody.
3. **Contradicts the split — Phase 1 outputs accreting on the publication PR.** The two commits add 514 lines of R&D cockpit and census material to PR #1239 after reconciliation, and the running census agents will add thirteen subsystem pages. Charter §9 item 1 (*no unrelated changes entered the branch after reconciliation*) now reads FAIL for as long as that continues.

**Proposed resolution (Jarvis proposes; founder rules):**

- PR #1239's branch becomes **single-writer = the publication lane** from `c36d82ec`. The two landed commits are docs-only, gates green, and are **kept and recorded** in the custody check rather than reverted; no history rewrite on that branch under any outcome.
- The R&D lane cuts a Phase 1 branch from `c36d82ec` for `docs/programme/MAIA_WHOLE_ORGANISM_MAP/**` and master-run state changes. Its PR merges independently of #1239.
- Master run §4 TASKS and §11 `/accounted-for` lines are re-homed to the publication lane by the R&D lane (its file), with the transfer section (§5 above) appended to its charter.
- A freshness merge of `clean-main-no-secrets` (now `69f6fb7c`, PR #1240 merged) into the PR branch is the publication lane's to make before the merge ruling; `git merge-tree` reports it clean.

**Delivery status — NOT DELIVERED.** A cross-session message carrying the §4 text plus the branch-topology consequence (marked *pending founder confirmation*) was attempted from this session at ~17:45Z and refused: the original session is not reachable from this one (no peer listing; the send tool reported no such agent). The message therefore reaches the R&D lane by one of: (a) the founder pasting §4 into that session, or (b) that session reading this record and the CLAUDE.md bullet once this branch merges. Until one of those happens, assume the R&D lane's census agents continue to write to the PR #1239 branch.

## 8 · Governing sentence

*Accounted For does not decide what Soullab is. It makes Soullab answer publicly for what it says it is.*
