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

### Custody check performed at the split (observed 2026-09-06, this session)

| Check | Observed |
|---|---|
| PR head | `cf6d9ebf` on `claude/maia-human-experience-arch-12g5r6` |
| PR base | `clean-main-no-secrets` at `b6f10a2f` — equals the current remote tip; the PR head already contains it (no conflict, no stale base) |
| Files changed | 39 (1 app file: `app/accounted-for/page.tsx`; 1 `CLAUDE.md` bullet; contract + 2 screenshots; pitch doc; 3 programme records; 30 research-spine files) |
| GitHub checks on `cf6d9ebf` | covenant-gates ×2 · Empty database reconstruction · TypeScript no-regression gate · auto-label · check-diagrams · Axis 1 adjudication · sovereignty — all **success**; `build` **in progress** at the time of the check (re-read before the final report) |
| `mergeable_state` | `blocked` — draft status / branch protection, not a conflict |

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
