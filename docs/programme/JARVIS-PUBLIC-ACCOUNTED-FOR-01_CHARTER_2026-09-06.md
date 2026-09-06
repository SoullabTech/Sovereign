# JARVIS-PUBLIC-ACCOUNTED-FOR-01 — lane charter

**Date opened:** 2026-09-06
**Class:** Publication and evidence-custody lane. Not an R&D lane.
**Authorization:** Founder ruling 2026-09-06 — lane split from `JARVIS-RD-HUMAN-EXPERIENCE-ARCHITECTURE-01` (split record: `docs/programme/JARVIS-LANE-SPLIT_HUMAN-EXPERIENCE_ACCOUNTED-FOR_2026-09-06.md`).
**Why a second lane:** `/accounted-for` has become a distinct public artifact with its own lifecycle, while the Human Experience lane must pivot back into MAIA/AIN development. Two lanes may not own the same unresolved question. One lane develops the understanding; the other maintains the public account of that understanding.

---

## 1 · Purpose

Maintain `/accounted-for` as Soullab's public, claim-disciplined account of:

- what Soullab is;
- what MAIA and AIN actually do today;
- what is designed but not yet live;
- what Soullab believes;
- what Soullab is researching;
- what remains genuinely unknown;
- what Soullab explicitly refuses to claim.

## 2 · Governing question

> Does `/accounted-for` truthfully represent the current state of Soullab, MAIA and AIN without borrowing maturity from research, design, aspiration or rhetoric?

**Governing sentence:** *Accounted For does not decide what Soullab is. It makes Soullab answer publicly for what it says it is.*

## 3 · Custody (inherited at the split)

```text
PUBLIC SURFACE
app/accounted-for/page.tsx
https://soullab.life/accounted-for

PUBLIC SOURCE OF RECORD
docs/pitch/MAIA_PLATFORM_ACCOUNTING_2026-09-03.md
docs/programme/JARVIS-RD-HUMAN-EXPERIENCE-ARCHITECTURE-01_CLAIM_RECONCILIATION_2026-09-06.md
  (the current claim-reconciliation record — authored under the R&D lane, now
   custodied here as publication evidence; its content is not re-adjudicated here)

PAGE CONTRACT + RENDER EVIDENCE
docs/design/contracts/accounted-for.md
docs/design/contracts/screenshots/accounted-for-desktop.png
docs/design/contracts/screenshots/accounted-for-mobile.png

CURRENT PR
#1239 — https://github.com/SoullabTech/Sovereign/pull/1239
branch claude/maia-human-experience-arch-12g5r6

CURRENT PUBLICATION STATE
DRAFT PR · UNMERGED · UNDEPLOYED
MERGE    NOT AUTHORIZED
DEPLOY   NOT AUTHORIZED
```

Do not open a replacement PR unless the existing PR becomes technically unusable.

**Containment (founder ruling 2026-09-06, split record §7a).** Intended transfer point `c36d82ec`; founder-named containment `6ce59f82`; **final containment `a7b42f29`** (split record §7b — the R&D session acknowledged, switched to `claude/maia-human-experience-phase1-census`, and that branch's merge-base with #1239 is `a7b42f29` exactly; operational transfer CLOSED ~17:58Z). Every R&D commit up to that bound is PRESERVED — never rewritten, never reverted — and carried as R&D-owned historical content. After it, **this lane is the only writer on the PR branch**; further R&D writes are NOT AUTHORIZED. The PR's title and body still describe it as the R&D integration vessel; that metadata is stale and is corrected by this lane once the split is canonical.

**Custody boundary on the PR branch.** PR #1239 also carries the R&D lane's research spine (`docs/research/human-experience/**`, the R&D charter, the integration flow). Those files travel with the PR for merge purposes only. This lane does not edit them. If a merge-readiness fix requires touching one (a conflict, a lint failure), the change is mechanical, recorded in this lane's log, and never alters meaning.

## 4 · Upstream authority

This lane consumes accepted outputs from `JARVIS-RD-HUMAN-EXPERIENCE-ARCHITECTURE-01`.

Current upstream synthesis: `docs/research/human-experience/SYNTHESIS_v0.2_2026-09-06.md` — status: **current programme synthesis; not doctrine; P1–P13 CANDIDATE; empirical postures provisional** (R&D charter §23).

The upstream lane determines: research findings · interpretation · candidate principles · anti-patterns · open questions · Elemental hypotheses · Human Question framing · Self / Relationship / World architecture · research adjudication.

This lane may **translate** those outputs for public understanding. It may not alter, ratify, weaken, strengthen or reinterpret them as authority.

### Direction of authority

```text
R&D / CANON / RUNTIME EVIDENCE
              ↓
      CLAIM RECONCILIATION
              ↓
       /accounted-for
              ↓
            PUBLIC
```

Never:

```text
marketing wording
      ↓
research doctrine
```

If public wording exposes a contradiction upstream, record the contradiction and return it to the owning lane. Do not resolve it inside this lane.

### The custody rule that matters most

If this lane encounters *"this principle is difficult to explain publicly"*, it cannot simplify the principle by changing its meaning. It may only:

- find better wording;
- downgrade the public claim;
- omit it;
- send a question back upstream.

That prevents marketing from becoming doctrine.

## 5 · What this lane owns

### 5.1 Public copy

Page hierarchy · prose · readability · sequencing · the Elemental five-part structure · explanation of Soul Lab · Human Question framing · participatory-laboratory invitation · public articulation of MAIA / AIN · withheld claims · open questions · testing language.

### 5.2 Claim discipline

Every substantive sentence must be classifiable on two independent axes.

| Axis | Values |
|---|---|
| Epistemic kind | OBSERVED · RESEARCH-SUPPORTED · SOULLAB INTERPRETATION · HYPOTHESIS · OPEN QUESTION |
| Product maturity | LIVE · PARTLY LIVE · DESIGNED · VISION |

Never use one axis to imply maturity on the other. A hypothesis may describe a Live subsystem. A well-supported human phenomenon may inform a Vision architecture. A Live capability does not validate a psychological interpretation.

Instruments (fixed): `docs/canon/MARKETING_CLAIM_DISCIPLINE.md` · `docs/canon/CLAIM_STATE_AUTHORITY.md` · `docs/research/human-experience/CLAIM_LADDER.md`.

### 5.3 Public evidence

For each Live claim, preserve its evidence chain:

```text
CLAIM → INSTRUMENT → SUBJECT REACHED? → WHAT DID IT ACTUALLY MEASURE? → SUPPORTED PUBLIC WORDING
```

No instrument may support a broader sentence than it measured.

### 5.4 Public withholding

This lane owns the explicit list of claims Soullab refuses to make. Current classes:

- MAIA is conscious;
- MAIA is not conscious;
- MAIA understands the member;
- MAIA cares;
- MAIA does not shape the member;
- remembered recurrence establishes identity;
- Elemental Consciousness is validated psychology or neuroscience;
- capacity gained with MAIA has been demonstrated to transfer into life;
- collective Soul Lab research exists before consent architecture exists;
- ordinary MAIA conversations constitute research participation.

Withholding is part of the product. Do not remove a withheld claim merely because the positive story reads better without it.

## 6 · What this lane does not own

Do not:

- conduct foundational R&D;
- open R13 merely because the page raises a question;
- modify candidate principles;
- ratify P1–P13;
- modify MAIA behavior, prompts, memory architecture, Elemental architecture, or the Conductor;
- build experiments;
- design the collective-research consent substrate;
- decide what MAIA should say about consciousness;
- adjudicate psychological or philosophical claims;
- change the Human Experience Architecture.

Those belong upstream.

## 7 · The page's public hierarchy (preserved structure)

Five-part Elemental sequence — a sequence of exposition, **not** a map assigning domains to Elements (R&D charter §17: the Elements are not domains). All five Elements are present within every domain.

| Part | Content |
|---|---|
| **I · IF · FIRE** — the wager | What if this works? What are we testing? What do we not know? What changes if we are wrong? |
| **II · WHY · WATER** — the Human Question | Who are we? Why are we here? How do we live well? Self · Relationship · World. AI as important new participant, not center. Projection / encounter. Why Soul Lab exists. |
| **III · HOW · EARTH** — the laboratory and governance | Evidence · consent · claim ladder · Oath · sovereignty · research method · accountability · external witness · how claims change. |
| **IV · WHAT · AIR** — the accounting | MAIA · AIN · memory · cognition · models · sovereignty planes · surfaces · Live / Partly Live / Designed / Vision · what exists today. |
| **V · WHO · AETHER** — participants and the larger whole | The member · MAIA · Soullab · practitioners · future consenting research participants · collective inquiry · Self ↔ Relationship ↔ World · the invitation to test. |

### Participatory laboratory language

The page may say Soullab is developing toward a distributed participatory inquiry. It must preserve:

- *The member is not an experimental object. The member is a participant in an inquiry.*
- *No collective laboratory exists yet.*
- *An ordinary MAIA conversation is not research participation.* Any future collective contribution requires a separate, explicit, member-originated consent act and a governed research architecture.

### Public human–AI hierarchy

```text
THE HUMAN QUESTION
        ↓
SELF ↔ RELATIONSHIP ↔ WORLD
        ↓
ARTIFICIAL INTELLIGENCE ENTERS
        ↓
MAIA PARTICIPATES
        ↓
CAPACITY RETURNS TO LIFE
```

Do not allow the page to gradually make the human–AI relationship the primary purpose of Soullab. AI is important, emergent, consequential — and secondary to the Human Question.

## 8 · Claim reconciliation run (the lane's standard operation)

Whenever an upstream authority changes, Jarvis performs:

| Step | Action |
|---|---|
| **A. Diff the authority** | What changed in accepted synthesis · canon · runtime evidence · architecture maturity · founder ruling? |
| **B. Find affected sentences** | Every sentence in `/accounted-for` whose meaning depends on that change. |
| **C. Classify each** | UNCHANGED · WORDING UPDATE · DOWNGRADE · UPGRADE · WITHHOLD · REMOVE · NEW OPEN QUESTION |
| **D. Prove any upgrade** | No maturity or evidence upgrade without a qualifying instrument. |
| **E. Update source of record** | Page and pitch/source document must not disagree. |
| **F. Render** | Desktop (1280×900) + mobile (390×844), headless Chromium against a local `next dev` render. |
| **G. Walk** | One H1 · five Elemental parts once each · expected eyebrows once each · no duplicated sections · no overflow regression beyond the recorded baseline (desktop 1597px at 1280px = pre-existing shared Table wrapper overflow; mobile 390px) · no missing content · responsive readability. |
| **H. Gates** | `npm run check:design-canon` · `npm run check:no-supabase` · `git diff --check` · `npm run typecheck` (no-regression) · page contract updated. |
| **I. Report** | WHAT CHANGED · WHY · CLAIM MOVEMENTS · EVIDENCE · RENDER RESULT · GATES · UNRESOLVED · MERGE STATUS |

## 9 · Current run — state at lane opening (2026-09-06)

```text
SYNTHESIS v0.2            ACCEPTED (R&D charter §23)
CLAIM RECONCILIATION      COMPLETE (32-row audit; no sentence promoted; no maturity label changed)
PAGE COPY                 RECONCILED (seventh revision)
RENDER WALK               PASS (contract: 1280×900 + 390×844; one H1; five parts once; 21 H2)
DESIGN-CANON              PASS
NO-SUPABASE               PASS
DIFF CHECK                PASS
TYPECHECK NO-REGRESSION   PASS (230 vs 239 baseline)

PR #1239                  DRAFT
MERGE                     NOT AUTHORIZED
DEPLOY                    NOT AUTHORIZED
```

### Custody check performed at the split (observed 2026-09-06, re-run at 17:43Z)

| Check | 17:27Z (first read) | 17:43Z (re-run) |
|---|---|---|
| PR head | `cf6d9ebf` | **`c36d82ec`** — two commits pushed by the R&D lane's session at 17:36Z (`210fa74f` master run + pivot; `c36d82ec` ranked-map skeleton); docs only; 514 lines; page, pitch, contract, screenshots **untouched** (last change to each = `cf6d9ebf`) |
| Base | `clean-main-no-secrets` `b6f10a2f`, contained in head | base moved to **`69f6fb7c`** (PR #1240 merged); PR now `mergeable_state: behind`; `git merge-tree` base→head **clean** — a freshness merge, no conflict |
| Unrelated changes after reconciliation | none | **YES — item 1 below reads FAIL** until the founder rules on the collision (split record §7) |
| Research statistics on the page | none found (`%`, study/participant counts, `n=` — one CSS width only) | unchanged |
| GitHub checks | 8/9 success, `build` in progress | on `c36d82ec`: sovereignty · check-diagrams · Empty database reconstruction · covenant-gates · TypeScript no-regression gate · auto-label · Axis 1 — all **success**; `build` **in progress** (started 17:37:00Z) |

### Before asking for merge

1. **Confirm PR custody** — PR #1239 still points at the intended branch; base is current `clean-main-no-secrets`; no conflicts; no unrelated code changes entered the branch after reconciliation (the diff above is the reference set; anything beyond it is reported, not absorbed).
2. **Confirm public claim ceiling** — no statistic from R8–R12 enters the page until its source has been page-read and paraphrase-checked (the backlog is open; the page is written so no sentence depends on a source's content). No unverified research detail smuggled into prose as fact.
3. **Confirm page/source agreement** — `app/accounted-for/page.tsx` and `docs/pitch/MAIA_PLATFORM_ACCOUNTING_2026-09-03.md` (incl. §7c) tell the same public story.
4. **Final render / gate pass** — repeat §8 F–H at the final PR head; re-read the `build` check.
5. **Stop.** Return the evidence to the founder. Do not merge.

## 10 · Merge stop · deploy stop

Only the founder may authorize merge of this lane's publication. Jarvis may say `READY FOR FOUNDER MERGE RULING`. Jarvis may not infer `gates green → merge authorized`.

Merge authorization is not deployment authorization:

```text
MERGED SHA → FOUNDER DEPLOY ACT → GOVERNED PRE-DEPLOY GATE → DEPLOY → PRODUCTION WITNESS
```

Deploy runs via `scripts/pre-deploy-gate.sh deploy-maia <sha>` from the Mac Studio (CLAUDE.md, Production Deployment). Only after the production witness (container `GIT_COMMIT` = merged SHA; `/accounted-for` renders on `soullab.life` with the walk of §8 G repeated against production) may the page be called **live**.

## 11 · After publication — the public ledger lane

This lane remains alive. It receives events such as: a MAIA capability becomes Live · a capability is downgraded · a principle becomes canon · a hypothesis fails · a research result changes Soullab's interpretation · a dependency changes · a public claim becomes unsupported · the collective laboratory becomes designed or live.

```text
UPSTREAM CHANGE
      ↓
DOES IT AFFECT A PUBLIC CLAIM?
      │
   NO ─┴─→ LOG / STOP
      │
     YES
      ↓
CLAIM RECONCILIATION (§8)
      ↓
RENDER / GATE
      ↓
FOUNDER PUBLICATION ACT
```

## 12 · Relationship to the primary R&D lane

| Lane | Asks |
|---|---|
| `JARVIS-PUBLIC-ACCOUNTED-FOR-01` | Are we telling the truth publicly about what we know and what exists? |
| `JARVIS-RD-HUMAN-EXPERIENCE-ARCHITECTURE-01` | Given what we now understand, what must MAIA and AIN become differently? |

The first lane does not block the second except where a public claim or governance dependency genuinely intersects it. The second lane proceeds into Phase 1 — Whole-Organism MAIA/AIN Mapping (its integration flow, Phase 1).

## 13 · Lane log

| Date | Event |
|---|---|
| 2026-09-06 | Lane opened by founder ruling (split). Custody of `/accounted-for`, PR #1239, source of record, contract, screenshots and reconciliation record transferred in. Custody check §9 performed. No page, pitch or PR-branch edit made by this lane yet. State: awaiting founder merge ruling. |
| 2026-09-06 ~18:25Z | **Publication run at the PR head — COMPLETE.** Founder authorization (bounded, 2026-09-06) executed in order: (1) canonical `2b4ec96a` merged into the branch as `18dfc0a2` (remote head verified `a7b42f29` before writing); (2) CLAUDE.md resolved keeping both bullets, split bullet above; (3) PR #1239 title/body rewritten to this lane's custody, R&D material through `a7b42f29` explained and preserved; (4) custody check: canonical contained, only app file `app/accounted-for/page.tsx` (unchanged since `cf6d9ebf`), pitch + contract unchanged since `cf6d9ebf`, no research statistic in page prose, every commit after `a7b42f29` is canonical history or the freshness merge; (5) render walk at 1280×900 + 390×844 PASS (contract `experience_verification`, eighth walk; screenshots byte-identical to the seventh revision); (6) contract updated with the observations; (7) gates: design-canon PASS · no-supabase PASS · diff --check PASS · typecheck no-regression PASS (230 vs 239); (8) pushed. **`READY FOR FOUNDER MERGE RULING`.** Merge NOT AUTHORIZED · deploy NOT AUTHORIZED; "live" only after a founder deploy act and production witness. |
| 2026-09-06 ~17:58Z | **Operational transfer CLOSED.** Final containment `a7b42f29` (test in split record §7b satisfied: R&D session on its Phase-1 branch, merge-base = `a7b42f29`, its charter §25 + master-run delegation landed there). Governance transfer still open on PR #1241 (7/8 checks green, `build` running). This lane is now the only writer on #1239. Next, after #1241 merges: freshness merge of `69f6fb7c`, both CLAUDE.md bullets kept, PR title/body to publication custody, custody check + gates rerun. |
| 2026-09-06 ~17:48Z | **Founder ruling on the collision — accepted with custody correction** (split record §7a): containment at `6ce59f82`, late arrivals recorded not erased (observed drift to `f7705937`), this lane sole writer thereafter, R&D commits preserved. Stop instruction relayed into the R&D session by Routine (`trig_01GpBz6zR8XtKLhSHyGxovsN`, run `cse_01WdfehBCtjB2gS5VuNYtgeR`). Sequence: governance PR merges first → #1239 absorbs `69f6fb7c` → both CLAUDE.md bullets kept → title/body to publication custody → custody check + gates rerun → then, and only then, `READY FOR FOUNDER MERGE RULING`. No merge ruling due yet (Docker Build · Canonical PR Quality Gate running at `6ce59f82`). |
| 2026-09-06 17:43Z | **Collision.** The R&D lane's session pushed the pivot act (master run, Phase 1 open, manifesto FROZEN, its charter §24) and a census skeleton onto the PR branch without recording the split; master run §4/§11 still assign `/accounted-for` tasks to the R&D cockpit. Custody item 1 = FAIL until ruled. Freeze inherited as a constraint. Transfer message to that session attempted and refused (session unreachable from here); founder relay needed. Founder ruling requested on branch topology (split record §7). `READY FOR FOUNDER MERGE RULING` **withheld** until the collision is ruled and the freshness merge from `69f6fb7c` is made. |
