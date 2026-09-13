# JWS-01 — Writer's Studio Ecosystem & Capability Census — Programme Charter

**Opened:** 2026-09-13 (founder act)
**Lane state:** **CENSUS ONLY.** No WS programme lane opened. No architecture change authorized.
**Branch:** ⚠️ authored on `claude/voice-2026-research-ici0ph` — see §11, branch hygiene.
**Authority:** founder (Kelly Nezat). Jarvis may discover, compare, test and recommend.
**Base commit at opening:** `c90d95ea`

---

## 1. The distinction this lane exists to hold

The founder's ruling, as stated:

> This is best treated as a Jarvis research/census flow feeding Writer's Studio, **not** as four new
> Writer's Studio implementation lanes automatically.

The Chapter analysis did two different things at once:

1. **studied an outside system** and asked *what mechanisms are worth understanding?*
2. **converted those observations into candidate Writer's Studio capabilities** — Whole Work
   Intelligence, Research & Evidence Graph, Authorial Voice Field, Expression Pipeline.

Activity (1) is Jarvis-shaped. Activity (2) is a programme act. **Running them in one motion is how
external research becomes architecture without an authorizing act** — the same structural defect the
2026-09-07 finding named in the deploy lane: *merging to canonical is latent deploy authorization*.
Here the equivalent would be: **naming a capability in a census is latent roadmap authorization.**

### Constitutional boundary

> **Jarvis may discover, compare, test, and recommend. External capability discovery cannot itself
> authorize adoption or alter Writer's Studio architecture.**

Status: **RATIFIED for this lane** by the founder act opening it.

## 2. The lane's job

**Not:** go build what competitors have.

**Is:** survey the emerging writing/intelligence ecosystem, identify capabilities and architectural
ideas, compare them against Writer's Studio as it actually exists, and surface genuine gaps
**without importing another product's assumptions.**

The Chapter analysis is the proof this separation is needed. It found commercially useful mechanisms
— persistent project cognition, whole-manuscript checking, flexible intake, source verification,
voice modeling — **and simultaneously rejected Chapter's central authorship philosophy.** Chapter is
an AI production/ghostwriting system; Writer's Studio is becoming an authorship environment. A lane
that could not hold both findings at once would have to choose between importing the philosophy with
the mechanism, or discarding the mechanism with the philosophy. **Both are losses.**

## 3. ⭐ The disqualifier, stated in the Studio's own law

Writer's Studio already carries the line that rejects Chapter's philosophy. It does not need a new
one. `docs/programme/WRITERS_STUDIO_PROGRAMME_BOARD.md` §Programme invariant:

```text
SOURCE / MATERIAL → MAIA MAY NOTICE → WRITER MAY RECOGNIZE
                  → WRITER MAY DECIDE → WORK MAY CHANGE
```

> ⛔ **No automatic arrow. Every arrow may stop.**

**Therefore the import test is mechanical, not aesthetic:**

> **A mechanism is importable if and only if it can be implemented without collapsing an arrow.**

A whole-manuscript consistency analyzer that *reports contradictions* preserves every arrow —
MAIA notices, the writer recognizes, the writer decides. The same analyzer that *applies fixes*
collapses three arrows at once and is refused **however good its output is**. Ghostwriting is not
refused because it is distasteful; it is refused because it runs `SOURCE → WORK CHANGES` with no
writer in the path.

⭐ This makes "import mechanism / do not import philosophy" a **verdict a census can actually
render**, rather than a judgement call that drifts under commercial pressure.

## 4. The census record format

One record per external capability. No prose substitute.

```text
EXTERNAL SYSTEM        <product · paper · repo · model>
CAPABILITY             <what it does for a user>
MECHANISM              <how it does it — the part that is portable>
VALUE                  HIGH | MEDIUM | LOW | NEGATIVE
WS STATUS              LIVE | PARTIAL | ZERO-CALLERS | IN ACCEPTANCE | BLOCKED
                       | DESIGNED | ABSENT | UNVERIFIED       ← board vocabulary, §5
WS BINDING             <A4 row / board node / repo path this maps onto, or NONE>
ARROW TEST             PRESERVES ALL ARROWS | COLLAPSES <which>      ← §3
IMPORT MECHANISM?      YES | NO | PARTIAL
IMPORT PHILOSOPHY?     NO        ← in practice always NO; a YES is a founder act, not a census output
CANDIDATE DISPOSITION  ALREADY PRESENT | STRENGTHEN EXISTING | INVESTIGATE MORE | ABSENT-GENUINE
EVIDENCE               <primary source link · repo path · dated record>
ARCHITECTURAL CHANGE   NONE AUTHORIZED
```

⛔ **The last line is not decoration.** It is the line that keeps a census from becoming a roadmap.
It appears on every record, including the ones with the best findings.

⚠️ **`WS STATUS` may never be filled from a roadmap, a spec, or memory.** It is artifact-derived,
read from canonical, per board discipline: *a node's state must be bindable to an artifact; if it
cannot be, it is `UNVERIFIED`.* `UNVERIFIED` is not a claim of absence.

## 5. ⭐⭐ The WS current-state check already has an apparatus — bind to it, do not build a second

`WRITERS_STUDIO_PROGRAMME_BOARD.md` already carries the **CAPABILITY MANDATE CENSUS (Amendment 4)**:
25 rows, artifact-derived, with states, evidence on canonical, dependency, vertical slice, Real-Work
acceptance and blocker. Current reading: **eight ABSENT · seven PARTIAL · four UNVERIFIED · five
DESIGNED · one ZERO-CALLERS.**

**JWS-01's `WS CURRENT-STATE CHECK` step binds to that table. It does not create a parallel one.**
A second capability inventory beside the first is precisely the failure the board exists to catch —
*how excellent work becomes invisible and is later rebuilt beside itself.*

### Immediate consequence for the four candidate capabilities

⭐ **Three of the four already have rows. They are not new capabilities; they are existing rows with
external evidence attached.** Reading them as new would author duplicates of work already on the board.

| Candidate name | Already on the board as | Current state | What the census actually adds |
|---|---|---|---|
| **Whole Work Intelligence** | A4.6 structure-aware lenses (continuity · sequencing · arc) + A4.2 living manuscripts | DESIGNED + PARTIAL | Chapter evidences that cross-work inspection is commercially viable at manuscript scale. Dependency (authoritative Work Structure) was **satisfied 2026-09-02** (`27729b31e`). The row waits on authorization, not on substrate. |
| **Research & Evidence Graph** | A4.8 memory with provenance — *eight kinds of knowing* | **UNVERIFIED / TO CENSUS** — board: *"never censused as **one** provenance model"* | ⭐ The gap is a **census**, not a build. See §6. |
| **Authorial Voice Field** | closest is A4.15 human authorship made visible | UNVERIFIED / TO CENSUS | ⚠️ The only candidate with **no clean row**. Genuinely a gap — and the one most at risk of importing philosophy (§7). |
| **Expression Pipeline** | A4.13 expression & publishing support | PARTIAL | ⛔ Board already carries the correct framing: *"a lecture is not a book in bullets — re-expression, not export."* |

## 6. ⭐⭐ The strongest finding is architectural, and it is already half-built

The founder's read is correct that the important findings are not features:

> distinguishing what the writer **knows**, what the writer **believes**, what a **source says**,
> what MAIA **inferred**, what is **contested**, and what remains **unverified**.

**That is not a new invention for MAIA. It is the same lattice MAIA has already ratified twice:**

- **Authority × Time** — the working decomposition for memory
  (`docs/research/human-experience/frameworks/memory/AUTHORITY_X_TIME_2026-09-06.md`), with
  *verbatim beneath derived*, *derived stays visibly derived*, and *member statement overrides as
  present self-report — it does not rewrite history*.
- **Epistemic kind × product maturity** — the two independent axes on every substantive public
  sentence (`docs/canon/MARKETING_CLAIM_DISCIPLINE.md`, the Accounted For lane).

**And the substrate exists.** BUILD-07A landed typed, digest-verified, unforgeable evidence on
canonical: `lib/manuscript/development/{evidenceRef,readState,bind,resolve,capture}.ts` — an
`EvidenceRef` that carries no live offset, a frozen `readState`, `recoverEvidence` (historical,
digest-verified) versus `locateCurrent` (three-state, never fuzzy), and `BoundEvidence` obtainable
only through `bindEvidence`.

⭐ **Therefore: "Research & Evidence Graph" is `PARTIAL`, not `ABSENT`, and the honest next act is
A4.8's owed census — read the eight kinds of knowing as ONE provenance model against the
Authority × Time frame and the existing `EvidenceRef` substrate — not a new graph beside them.**

⛔ **Recommendation only. Not authorized here.** A4.8's census is a Writer's Studio act.

## 7. ⚠️ Where philosophy import is most likely — named in advance

**Authorial Voice Field is the dangerous one.** "Voice modeling" in the commercial ecosystem means
*a model that writes in your voice*. That collapses the entire arrow chain in a single mechanism and
is the purest form of the philosophy this lane refuses.

The admissible form — and the only one the census may recommend investigating:

```
voice model as MIRROR:    MAIA notices, describes and evidences the writer's voice back to them
                          → writer recognizes → writer decides
voice model as GHOST:     MAIA produces text in the writer's voice
                          → REFUSED, arrows collapsed
```

`docs/book-studio/MANUSCRIPT_VOICE_AUDIT_v1.md` and `INVITATIONAL_VOICE_PASS_v1.md` already exist
and should be read before this row is censused — the Studio may be closer to the mirror form than
the board's `UNVERIFIED` suggests.

Same discipline applies to the Sovereignty Invariant check (`CLAUDE.md` §6) on any recommendation:
does it increase the writer's agency · push life outward · reduce the system's centrality over time.
A voice model that makes the writer need MAIA to sound like themselves fails all three.

## 8. Lane flow

```text
                    JARVIS
                      │
             External ecosystem
                      │
        ┌─────────────┼─────────────┐
     Products       Papers        Repos
        └─────────────┼─────────────┘
                      ↓
              CAPABILITY CENSUS          ← §4 record format
                      ↓
             MECHANISM EXTRACTION        ← the portable part, stripped of philosophy
                      ↓
             WS CURRENT-STATE CHECK      ← §5 binds to the A4 table, artifact-derived
                      ↓
                 GAP ANALYSIS
                      ↓
                 DISPOSITION
                      │
       ┌──────────────┼──────────────┐
       ↓              ↓              ↓
   ALREADY       INVESTIGATE       ABSENT
   PRESENT          MORE         (genuine)
       └──────────────┼──────────────┘
                      ↓
              ARCHITECTURE GATE          ← ⛔ FOUNDER ACT. Nothing crosses on its own.
                      ↓
           possible WS programme lane     ← new charter, new branch, new authorization
```

**The Architecture Gate is the whole point of drawing the flow.** Every stage above it is Jarvis.
Nothing below it is. A disposition of `ABSENT (genuine)` with `VALUE: HIGH` does not open a lane;
it produces a docket row the founder rules on.

## 9. Survey scope

Named by the founder for the same apparatus:

**Products** — Chapter · Reactive Writers · MindCopilot · Sudowrite · Novelcrafter · Scrivener ·
Atticus · Lex · Granola-style memory systems.
**Repos & models** — relevant GitHub projects · Hugging Face models.
**Research** — HCI · computational creativity · authorship & provenance · long-context research
systems · citation engines.

⚠️ **Bounded, as the Voice lane is bounded.** The survey is sized to answer *which mechanisms and
architectural ideas are genuinely absent from Writer's Studio*, not to produce a complete market map.
A SaaS feature checklist is a failure output — the lane is looking for things at the level of §6.

⛔ **The Chapter analysis is not in this repository.** It is the founder's document and currently
exists outside the record. **First act of this lane: file it as census record E-01** with its
primary sources, so every downstream claim has an artifact behind it. Until then, every statement
in this charter about Chapter is sourced to the founder's message of 2026-09-13 and is **Class B**.

## 10. Evidence and claim discipline

Classes, as in use across the programme: **A** replicated external research · **B** single/vendor/
conceptual · **C** human witness under study ethics · **D** interpretive doctrine · **E** runtime
fact (code path, migration, production record).

- A product's marketing page is **Class B**, always. A demo is Class B. A benchmark the vendor ran
  is Class B.
- **A capability another product ships is evidence that it is buildable and saleable. It is not
  evidence that Writer's Studio needs it**, and it is never evidence about a member.
- `WS STATUS` is Class E or it is `UNVERIFIED`.
- `docs/canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md` governs this lane's own outputs: census may
  inform a docket, a docket may inform a ruling, a ruling may open a lane. **Never the reverse.**

## 11. Standing prohibitions

⛔ Not authorized in this lane, under any finding:

- **No Writer's Studio code change. No schema change. No migration. No dependency added.**
- **No WS programme lane opened** — including the four candidate capabilities. `ARCHITECTURAL
  CHANGE: NONE AUTHORIZED` on every record.
- **No edit to the A4 capability table** except to *cite external evidence against an existing row*.
  ⛔ **No new A4 row, no state change** — board discipline requires a state change be made *as part
  of the work it describes*, and this lane describes no WS work.
- **No competitor product installed, integrated, or given member data.** Study only.
- **No member material used in any comparison.** No Sanctuary content, ever.
- **No adoption of an external product's vocabulary into MAIA's canon** — "ghostwriter", "AI
  production", "content pipeline" and their relatives stay outside the record except as quoted
  description of the system being censused.

⚠️ **Branch hygiene — named, not hidden.** This charter is authored on
`claude/voice-2026-research-ici0ph`, the branch authorized for this session, which belongs to
`VOICE-2026-RESEARCH-01`. **Two lanes on one branch is the exact shape of the 2026-09-06 collision**
(`JARVIS-LANE-SPLIT_HUMAN-EXPERIENCE_ACCOUNTED-FOR_2026-09-06.md`), where a live session pushed one
lane's act onto another lane's PR branch. It is committed here **separately and atomically** so it
can be cherry-picked whole. ⭐ **Recommended founder act: move this commit to its own `jws-01`
branch before any further JWS-01 work, and make that branch single-writer.**

## 12. Stop condition

This lane stops, and produces a docket rather than proceeding, if:

- A finding is being carried straight into a build without an Architecture Gate act.
- A census record cannot fill `ARROW TEST` — the mechanism has not been understood well enough to
  import it.
- `WS STATUS` is being inferred rather than read from canonical.
- The output is becoming a feature checklist rather than an architectural reading.

---

**Standing at opening:** E-01 (Chapter) **not filed** · survey not started · no census record
authored · no gap analysis · no disposition · Architecture Gate not approached · no WS lane opened ·
no WS code, schema or board state touched.

> **Jarvis becomes Writer's Studio's continuous technological intelligence layer —
> and a continuous intelligence layer that can change the architecture it observes
> is not an intelligence layer. It is an unauthorized architect.**
