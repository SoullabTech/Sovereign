# WS2-00 — Design ⇄ Repository Reconciliation Census

**Date:** 2026-08-27 · **Type:** census record · **Programme:** WRITER'S STUDIO R2
**Authority:** subordinate. The **Master Brief** governs meaning; the **Programme Board** remains the
**one live cockpit**. This file is evidence, and evidence only.

```text
NORMATIVE AUTHORITY   docs/programme/WRITERS_STUDIO_MASTER_BRIEF.md
LIVE COCKPIT          docs/programme/WRITERS_STUDIO_PROGRAMME_BOARD.md
THIS FILE             census evidence · NOT a roadmap · NOT a second cockpit
```

⛔ **This file creates no unit, authorizes no build, and re-sequences nothing.** The board's
one-live-cockpit rule stands: *"two cockpits diverge, and the divergence is invisible until it costs
a decision."* A `WRITERS_STUDIO_V2_ROADMAP` in `docs/architecture/` was proposed and **deliberately
not authored** — it would have been that second cockpit.

```text
FOUNDER RULING — WS2-00 (2026-08-27)
  SEMANTIC RECONCILIATION   COMPLETE
  VISUAL RECONCILIATION     OPEN — awaiting the eight design images
```

⚠️ **Design-source limitation, stated up front.** The eight screens were described to this session in
**prose**, not supplied as images. Every design-intent statement below derives from the founder's
five-field written description of 2026-08-27. Findings that depend on *visual* detail — layout,
specific affordances, displayed metrics, the visual system itself — are marked **NEEDS IMAGES** and
are not settled here.

---

## 1 · ⭐ Headline finding — the "fourteen Studios" are a naming collision, not a distributed product

The working hypothesis was hopeful: *"a significant proportion of the beautiful new Studio may
already exist as scattered organs; the job may be composition rather than construction."*

**The evidence does not support it.** Of the fourteen `studio`-ish route families, **four** belong to
Writer's Studio. Nine are different products that share an English word.

| Route family | Pages | Verdict | Evidence |
|---|---:|---|---|
| `app/writers-studio` | 2 | ⭐ **CANONICAL** | `HomeView` · `useLivingWorks` · `homeState` · `shellIdentity` · `studioMap` · `canvas/` |
| `app/book-studio` | 11 | **PREDECESSOR LINEAGE** | `book · canvas · drafts · passages · read · ready-to-write · render · workbench · illustrations · design-system` |
| `app/press/manuscript` | — | **ACTIVE, writer-facing** | imports `writers-studio` |
| `app/press/studio` | 1 | **ALREADY SUPERSEDED** | body is `redirect('/writers-studio')` — cleanly retired |
| `app/studio` | **61** | ⛔ **DIFFERENT PRODUCT** | Co-Lab / practitioner: `clients · caseload · encounters · booking · comms · groups · programs`. **Zero** references to `living_work` or `manuscript` |
| `app/model-studio` | 9 | different product | `ModelServicesPage` |
| `app/vision-studio`, `app/maia/vision-studio` | 2 | different product | vision boards |
| `app/maia/songwriter` | 2 | different product | `SongsPage` |
| `app/soullab-studio` | 1 | different product | static content page |
| `app/studio-on-mobile` | 1 | interstitial | *"Studio works best on desktop"* |
| `app/fields/[field]/studio` | 1 | different product | fields |

⭐ **Consequence for cost and timeline — and it runs the wrong way.** There is no hidden reservoir of
Writer's Studio organs to harvest. The concentration is real (`writers-studio` + `book-studio` +
`press/*`) and it is exactly where the existing Capability Mandate Census already says the mass sits:
**manuscript editing and intake**. The four newer design fields have little to compose *from*.

⚠️ **`app/studio` (61 pages) is the largest surface carrying the word and is not this programme's.**
Any future census, cleanup or "Studio" refactor that sweeps it in would damage the Co-Lab product.
Recorded here so the collision is discovered by reading rather than by breakage.

---

## 2 · The five design fields, mapped onto the existing A4 census

The board's Capability Mandate Census (Amendment 4, artifact-derived from `bd87d497f`) already
carries 25 rows. The designs do **not** introduce a new capability vocabulary — they are a *surface
expression* of capabilities A4 already mandates. That is a good result: it means the designs and the
constitution agree, and the census does not need re-founding.

| Design field | A4 rows it expresses | Current state |
|---|---|---|
| **1 · WORK HOME** | A4.1 Work-Centered Home · Formless Work | **PARTIAL** — route live; the six questions **UNVERIFIED**; *"surface still presents the manuscript as the anchor"* |
| **2 · WRITING** | A4.2 Living manuscripts · find/replace · return continuity | **PARTIAL** — editor real; `findInDraft` **0 files**; return continuity **UNVERIFIED** |
| **3 · MATERIALS STUDIO** | A4.3 intake · A4.3 never-silently-transform · A4.4 materials at data level | **PARTIAL + IN ACCEPTANCE** — ⭐ `living_work_materials` already carries `material_type`, `declared_by`, **`relationship_sentence`** |
| **4 · STRUCTURE + VERSIONS** | A4.9 structural perspective · A4.11 draft & revision continuity · A4.6 structure-aware lenses | ⛔ **ABSENT · ABSENT · BLOCKED** — `manuscript_versions`/`version_history` → **0 files** |
| **5 · DEVELOPMENTAL REVIEW** | A4.6 Developmental Editor · A4.10 eight dispositions | ⛔ **DESIGNED · ABSENT** — `DevelopmentalEditor` → **0 files** |

⭐ **The design has already been anticipated in the schema, in one place.** The Materials screen's
*"explicit relationship-to-work"* is not new work — `living_work_materials.relationship_sentence`
exists, and the board already reads it correctly: *"belonging is already a declared writer act, not a
styling choice."* Design and substrate agree here. **Preserve it; do not re-model it.**

⛔ **The dispositions workflow appears in TWO design fields** (the focused Writing variant and
Developmental Review) and is A4.10, currently **ABSENT**, and flagged on the board as *"where
interpretation silently becomes authority."* A surface that renders dispositions before A4.10's
substrate exists would be that failure, drawn beautifully.

### What the designs genuinely supersede
Nothing constitutionally. They supersede **surface arrangement** only — principally A4.1's
manuscript-as-anchor defect, which the Work Home screen resolves by putting the *Work* first.
That was already a known defect, not a design discovery.

---

## 3 · The WS2-00 → WS2-13 hypothesis, tested against evidence

Supplied as *"hypotheses to test, collapse, split, rename or reject where repository evidence
requires."* **Six survive intact; two are rejected as already-existing units; two must split; two are
not units; two need inputs this census lacks.**

| Proposed | Verdict | Evidence |
|---|---|---|
| WS2-00 reconciliation | ⭐ **RENAME** → this census record. Not a build unit. | — |
| WS2-01 work/manuscript/content identity | ⭐ **ACCEPT, PROMOTE to prerequisite, and SPLIT** (ruling 3) — **01A** identity census / trace / proof design **MAY OPEN NOW, read-only**; **01B** identity repair **HELD** behind WS-01 acceptance | A4.1: substrate makes Work the anchor; the surface still makes the manuscript the anchor. Fields 1, 3, 4 all read wrong until this is settled. Waiting to *understand* it gains nothing; letting a code-changing unit in while build mode is CLOSED would muddy the custody this census defends |
| WS2-02 visual/design system | ⚠️ **NEEDS IMAGES** — cannot be sized from prose. Note `app/book-studio/design-system` exists | — |
| WS2-03 persistent shell + navigation | **ACCEPT, smaller than proposed** | `shellIdentity.ts` · `studioMap.ts` · `layout.tsx` already exist |
| WS2-04 Writing / editor | ⛔ **WITHDRAWN AS A DUPLICATE UNIT ID** (ruling 4). ⚠️ The **requirement is not withdrawn** — it maps into the frozen **WS-02** | Board: `BUILD MODE CLOSED — Canvas / Phase 1 freeze BINDING`. Brief §11–13 already rules what to harvest and reject from PR #995. Opening WS2-04 would fork a frozen unit |
| WS2-05 Work Home | **ACCEPT** — depends on WS2-01 | A4.1 PARTIAL |
| WS2-06 Materials Studio | **ACCEPT** — ⛔ **gated on WS-01**, the current unit, at P0-D | A4.3 IN ACCEPTANCE |
| WS2-07 Structure + versions | ⭐ **SPLIT** — they are not one unit | A4.9 (Work Structure) is a **dependency of** the structure-aware lenses; A4.11 (restore floor, A1.6) is **independent** and buildable now |
| WS2-08 Developmental Review + lenses | ⭐ **SPLIT** | Brief: pre-structure stances `DISCOVER · GATHER · SHAPE` need **no structure** and are named *"the first buildable slices"*; structure-aware lenses are **BLOCKED** on Work Structure |
| WS2-09 MAIA contextual integration | **CENSUS BEFORE UNIT** | A4.5 **UNVERIFIED / TO CENSUS** — *"census what, if anything, already serves Reflect/Question/Notice/Connect"* |
| WS2-10 supporting tools | ⛔ **REJECT as a unit** — a bucket, and A1.9 rules on some of its contents | — |
| WS2-11 Publish / export / share-review | **ACCEPT, late** | A4.13 PARTIAL; ⛔ *"a lecture is not a book in bullets"* — re-expression, not export |
| WS2-12 integration / permissions / migrations / regression | ⛔ **NOT A UNIT** — a **gate on every unit** | Co-Lab Release Gate already binding at 31/31 |
| WS2-13 production experiential acceptance | ⛔ **WITHDRAWN AS A DUPLICATE UNIT ID** (ruling 4). ⚠️ The **requirement is not withdrawn** — it maps into existing **A2.5** (with A1.10) | The founder experience test and the definition of full fruition already exist in custody |

⭐ **The decomposition's main error is SEMANTIC DUPLICATION, not documentary duplication.** It
re-proposes two units the programme already has (WS2-04 = WS-02; WS2-13 = A2.5). That is how a second
cockpit actually forms — not by declaring one, but by giving governed work new names until two
lineages describe the same thing and the old names stop being used.

⚠️ **Withdrawing an identifier is not withdrawing a requirement.** Both capabilities remain fully
mandated under their existing identities. A future session reading only the withdrawal must not
conclude the work was dropped.

---

## 4 · Dependencies, parallelism, risk

```text
WS-01  source custody            IN ACCEPTANCE at P0-D   ← the live unit; gates Materials
   │
   ├── WS2-01  Work/manuscript identity   PREREQUISITE — unblocks fields 1, 3, 4
   │      ├── WS2-05  Work Home
   │      └── WS2-06  Materials Studio  (also gated on WS-01)
   │
   ├── WS2-07a  Versions / restore floor  INDEPENDENT — buildable now (A1.6)
   │
   ├── WS2-08a  Pre-structure stances     INDEPENDENT — "first buildable slices", no structure
   │
   └── WS2-07b  Work Structure  ──────► WS2-08b  structure-aware lenses  (BLOCKED until 07b)

FROZEN:   WS-02 Canvas convergence — freeze BINDING, do not fork as WS2-04
GATE:     Co-Lab Release Gate 31/31 · A4.21 prohibition on partial success
```

### ⛔ Readiness language — corrected on founder review, 2026-08-27

An earlier draft of this file said WS2-07a and WS2-08a were *"runnable in parallel today."* **That was
wrong, and wrong in the specific way this census exists to prevent:** it quietly overrode the freeze
the same document had just correctly preserved.

```text
WS2-07a   ARCHITECTURALLY READY · HELD BY CURRENT WS-01 ACCEPTANCE
WS2-08a   ARCHITECTURALLY READY · HELD BY CURRENT WS-01 ACCEPTANCE
```

**Architecturally unblocked ≠ programme-eligible.** The distinction is load-bearing, and existing
authority settles it rather than leaving it to caution:

- **A2.4 build sequence** opens with **`Finish WS-01 →`**. The arrow is an order, not a list.
- The board reads `BUILD MODE CLOSED — Canvas / Phase 1 freeze BINDING` with `NEXT EXECUTABLE P0-D`.

⭐ **No existing programme authority permits a concurrent lane while WS-01 acceptance is open.**
Checked, not assumed — A2.4 and A3.4 were read for a concurrency permission and neither grants one.

**Highest risk, in order:**
1. **WS2-07b Work Structure** — A1.5 warns *"examples are not schema"*; the board forbids a universal
   `Part → Chapter → Section`. It blocks WS2-08b and it is the easiest place to accidentally impose an
   ontology on a writer.
2. **WS2-01 identity** — cheap to mis-scope, and everything downstream reads wrong if it is wrong.
3. **A4.10 dispositions** — *"where interpretation silently becomes authority."*

**What blocks experiential acceptance right now:** **A4.21.** Success may not be declared while the
gather, memory, structural, developmental, expression and authorship rows read ABSENT — and they do.

---

## 4A · ⛔ `app/book-studio` — replacement-witness scaffold (ruling 2: NO cleanup authorized)

§21 permits legacy cleanup **only after replacements are witnessed**. Predecessor lineage is not dead
code. The table below is the read-only evidence available now; the three right-hand columns are
**deliberately unfilled** — they require a witness, not an inference.

⭐ **Premise-changing finding.** `app/book-studio` touches **neither `living_works` nor
`member_manuscripts`** — 0 files each. Its APIs write to **`workbench_uploads` (11)** and
**`workbench_tables` (7)**. So this is **not a predecessor on the canonical substrate; it is a
parallel lineage on different tables.**

⭐ **Founder ruling, 2026-08-27:** retirement therefore requires a **data-custody decision**, not
merely route-replacement evidence. `workbench` is the **LIVE EDGE** — a custody census is required
**before** any retirement ruling can be made about it.

⛔ That reframes the cleanup question entirely. It is not *"which route replaces which"* — it is
**"does this data have a home in the canonical model at all?"** A route-by-route retirement that
ignored the substrate split would strand member data in tables nothing canonical reads.

| Route | pages | api files | inbound refs (outside book-studio) | intended capability | canonical replacement | replacement proven? | member data dependency | disposition |
|---|---:|---:|---:|---|---|---|---|---|
| `workbench` | 1 | **6** | **11** | gather / upload / tables | — | ⛔ NOT WITNESSED | ⚠️ **`workbench_uploads` · `workbench_tables`** | **HOLD** |
| `drafts` | 1 | 2 | 6 | draft management | — | ⛔ NOT WITNESSED | to census | HOLD |
| `render` | 1 | 2 | 5 | epub / render | A4.13 expression (PARTIAL) | ⛔ NOT WITNESSED | to census | HOLD |
| `read` | 1 | 0 | 3 | reading surface | — | ⛔ NOT WITNESSED | to census | HOLD |
| `book` | 1 | 0 | 1 | book view | — | ⛔ NOT WITNESSED | to census | HOLD |
| `canvas` | 1 | 0 | 1 | canvas | ⚠️ **frozen WS-02** | ⛔ frozen — cannot be witnessed yet | to census | **HOLD (freeze)** |
| `illustrations` | 1 | 0 | **0** | illustrations | — | ⛔ NOT WITNESSED | to census | HOLD — 0 refs is *not* proof of death |
| `passages` | 1 | 0 | **0** | passages | — | ⛔ NOT WITNESSED | to census | HOLD |
| `ready-to-write` | 1 | 0 | **0** | readiness | A4.14 (ABSENT) | ⛔ NOT WITNESSED | to census | HOLD |
| `design-system` | 1 | 0 | **0** | design tokens | ⚠️ **NEEDS IMAGES** — bears on WS2-02 | ⛔ NOT WITNESSED | none likely | HOLD |

⚠️ **Zero inbound references is not a replacement witness.** Four routes have no callers outside
their own tree. That makes them *candidates* for the question, never answers to it — a member can
reach a route by URL, and §21's bar is a witnessed replacement, not an absent link.

⛔ **No route on this table is authorized for deletion, redirect, or migration.** `app/press/studio`
remains the only cleanly retired route in the lineage, because it carries a real `redirect()` to the
canonical surface — that is what a witnessed replacement looks like.

---

## 5 · Founder decisions genuinely required

1. **The eight images.** WS2-02 cannot be sized from prose, and any visual finding here is provisional.
2. **`app/book-studio` disposition** — 11 pages of predecessor lineage. §21 permits legacy cleanup
   *only after replacements are witnessed*. Which of its eleven routes have witnessed replacements?
3. **Does WS2-01 open before WS-01 closes?** It is a prerequisite for three design fields but WS-01 is
   the live unit at P0-D. Sequential, or parallel?
4. **Confirm WS2-04 is withdrawn** in favour of the existing frozen WS-02, and WS2-13 in favour of A2.5.

---

## 6 · Changed programme understanding

1. The fourteen Studios are a **naming collision**; only four are this programme's, and `app/studio`
   (61 pages) belongs to Co-Lab.
2. There is **no reservoir of harvestable organs** — composition will not shortcut the four newer
   fields. Cost runs the opposite way to the hopeful hypothesis.
3. The designs **agree with the constitution**; they express A4 capabilities rather than adding to them.
4. The proposed decomposition **duplicates two existing units**, which is how second cockpits form.
5. **Two units are runnable in parallel today** without touching the freeze.
