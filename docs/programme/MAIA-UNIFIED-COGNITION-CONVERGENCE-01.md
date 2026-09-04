# MAIA-UNIFIED-COGNITION-CONVERGENCE-01

```text
LANE       MAIA-UNIFIED-COGNITION-CONVERGENCE-01
BASE       clean-main-no-secrets @ d5741ce6c
BRANCH     claude/maia-unified-cognition-convergence-01
OPENED     2026-09-04 · founder authorization
PREREQ     MEMORY-PRODUCER-PARTITION-01 canonical ✅
           MAIA-WHOLE-ORGANISM-CENSUS-01 closed, Gate 2 MET, Gate 3 D → C′ ✅
STATE      DEFINITION RECORDED · NO CODE WRITTEN · FIRST CUT NOT YET AUTHORIZED
```

## 1. Governing law

> **Do not build another intelligence. Make the intelligences MAIA already computes
> participate through the convergence point she already has.**

## 2. Why this lane exists before P6

The census changed the dependency. Provenance cannot land on fragmented cognition.

```text
BEFORE   memory → truthful provenance → unified intelligence
AFTER    memory → SHARED PARTICIPATION SEAM → truthful provenance → unified intelligence
```

The two facts that make this lane small rather than large, both established at
`d5741ce6c` and recorded in `MAIA_WHOLE_ORGANISM_CENSUS_01.md`:

1. **The convergence point already exists.** `/list` and `/between/chat` both reach
   `getMaiaResponse()` — `/between` via `maiaOrchestrator.generateMaiaTurn`
   (`lib/consciousness/maiaOrchestrator.ts:480`).
2. **The orientation already exists and is dropped.** `computeFacetDecision`
   (`lib/consciousness/FacetDecisionLoop.ts:201`) produces `activeFacet`, `posture`,
   `integrityFlags`, `languageHints`, `handoff`, `regulation` — the *Spiralogic circulatory
   governor* — and hands it into `getMaiaResponse` at `maiaOrchestrator.ts:525`, where
   `facetDecision`, `activeFacet`, `integrityFlags` and `languageHints` are read **zero
   times** in `maiaService.ts` and `maiaVoice.ts`.

## 3. Gate 3 ruling this lane implements

```text
D   reuse the existing convergence point (getMaiaResponse)
    reuse FacetDecisionLoop
    reuse ranked MemoryBundle selection
    make existing structured orientation actually participate

C′  establish ONE shared participation contract across FAST / CORE / DEEP
    WITHOUT requiring one identical prompt builder
```

`FacetDecisionLoop` is not by itself MAIA's unified intelligence. Relational,
developmental, symbolic, provenance and eventually field intelligence still need a truthful
common participation contract. **A pile of addenda must not be replaced by one governor
owning everything.**

## 4. First cut — the smallest embodiment of D

```text
/list            produces the same structured orientation contract
/between         continues producing it
getMaiaResponse  actually consumes the contract
FAST/CORE/DEEP   receive the same governing orientation
                 while preserving legitimate tier-specific cognition
```

Then C′: shared participation membership across tiers — without P6 attribution framing and
without M3 authority.

## 5. Explicitly out of scope

```text
no new Elemental engine
no new Conductor
no Epistemic Tone redesign
no P6 attribution framing
no M3
no /between rewrite
no Resonant / Unified Field resurrection
no fixing every census defect
```

The census's thirteen findings (C-1 … C-13) are **a map, not a backlog**. A finding is
touched by this lane only if the first cut cannot be built without it, and then it is named
in this record before it is touched.

## 6. Standing constraints inherited

- **Runtime obligation returns here.** Gate 2 was met on source with runtime `UNWITNESSED`.
  That ceiling was acceptable for a map. This lane builds and will claim a live behavioural
  change, so it does **not** close on source evidence: it requires a production witness.
- **Sanctuary is absolute.** Any orientation contract must be empty on Sanctuary turns, and
  carry no content that a Sanctuary turn produced.
- **The witness privacy boundary holds unchanged**: passive shadow observation allowed;
  never enter another member's account, cause or request their turn, inspect atom content,
  retrieve content to verify shape, or target a member by identity. No member data is
  manufactured or modified to satisfy a witness.
- **Shadow before authority.** The census showed a shadow-first construction already works
  in this codebase (`lib/maia/canonical-turn/shadow.ts`). Consumption of the contract should
  be demonstrable as a no-op diff before it is permitted to change a response.
- **The three unresolved mixed producers** — `retrieved.member_web`,
  `retrieved.conversational_recall`, `member.episodic_recall` — remain excluded from any
  attribution-closure claim. This lane makes no attribution claim at all.

## 7. Open questions for the first cut, not decided here

1. Where does `/list` get a `FacetDecisionPacket` from — call `computeFacetDecision` in the
   route, or inside `getMaiaResponse` so both surfaces are served once?
2. Does the contract *replace* any existing addendum, or sit beside them in the first cut?
   (Census reading: beside, with zero-diff shadow, before anything is replaced.)
3. What does DEEP-primary do with the contract, given its local draft has no prompt seam by
   construction?
4. Does the ranked `MemoryBundle` reach CORE and DEEP in this cut, or is that a second cut?
   (Census: CORE and DEEP each carry an explicit annotation that they do not read it —
   changing that is a behavioural change, not a wiring fix.)

## 8. State

```text
DEFINITION       recorded
CODE             none written
FIRST CUT        NOT YET AUTHORIZED
P6               CLOSED until this prerequisite is built AND witnessed
```

---

## 9. Cut 1A — trusted orientation shadow convergence · BUILT

```text
AUTHORIZED   2026-09-04 · founder
STATE        BUILT · local gates PASS · PRODUCTION WITNESS PENDING
AUTHORITY    ZERO — the contract does not reach any prompt
```

### 9.1 What was built

| File | What |
|---|---|
| `lib/maia/orientation/contract.ts` *(new)* | `resolveOrientationContract` (sanctuary → null; trusted → verbatim; else compute once), `orientationDigest` (content-free), `renderOrientationForCognition` (**built, never applied**), `emitOrientationShadow`, `normalizeOrientationHistory` |
| `lib/sovereign/maiaService.ts` | `MaiaRequest.orientationContract` — server-internal, top-level; resolution at the shared boundary; contract threaded into all three tiers; shadow emitted per tier |
| `lib/consciousness/maiaOrchestrator.ts` | sanctuary gate before `computeFacetDecision`; trusted packet passed top-level, not via `meta` |
| `lib/maia/orientation/__tests__/orientationContract.test.ts` *(new)* | 14 tests, one per founder acceptance line |

### 9.2 Ruling 1 — the authority boundary

The contract travels as a **typed top-level field on `MaiaRequest`**, never through `meta`.
`meta` begins as the client's request-body rest-spread (PBR-001), so a governor read from it
would be forgeable: a caller could manufacture MAIA's elemental posture, integrity risks and
language hints. `resolveOrientationContract` has **no `meta` parameter by construction** —
the forgery path does not exist to be closed. The pre-existing `meta.facetDecision` on
`/between` is left untouched for telemetry parity and is read by nothing.

```text
trusted top-level packet present  → use verbatim, never recompute   (source: upstream)
no trusted packet                 → compute once at the boundary     (source: service)
meta.facetDecision                → NEVER cognition authority
```

### 9.3 Rulings 2–4 as built

- **Ruling 2 · beside, replacing nothing.** No addendum is removed or rewritten. No
  membership changed on any tier.
- **Ruling 3 · DEEP gets the structure, not a fake seam.** The contract is threaded into
  `deepPathResponse`. DEEP stage 1 has no prompt seam by construction and none was invented;
  the zero-diff claim is made against `consultationRecallAddenda`, the only prompt seam on
  DEEP-primary.
- **Ruling 4 · MemoryBundle held.** Untouched. CORE and DEEP still do not read
  `meta.memoryContext`. That expansion is a separate, separately adjudicated cut.

### 9.4 Sanctuary

Enforced twice, deliberately:

1. **At source** (`maiaOrchestrator`) — `computeFacetDecision` derives facet, integrity
   risks, handoff and language hints *from the member's message*, so on a sanctuary turn the
   derivation does not happen at all. Skipped via an internal sentinel so it is never logged
   as an error.
2. **At the boundary** (`resolveOrientationContract`) — sanctuary is checked before anything
   is computed *or accepted*, so a trusted packet supplied on a sanctuary turn is refused.

Under sanctuary the shadow line carries `contractPresent: false`, `contractDigest: null`, and
no facet or risk data by construction.

### 9.5 Telemetry

```text
[MAIA/orientation-shadow] {
  tier, contractPresent, contractSource,
  applied: false, legacyPromptDigest, sentPromptDigest, zeroPromptDiff, sanctuary
}
```

**Two corrections after founder review of `18330ba54` (2026-09-04).** Both are proof and
privacy corrections; neither changes scope or response behaviour.

1. **`zeroPromptDiff` is literal byte equality**, not a comparison of the two digests. Both
   full strings are in hand at the emit site, so a 48-bit truncated-digest match was
   probabilistic evidence standing in for the exact claim the lane makes. The prompt digests
   remain in the line as correlation telemetry and carry no authority. Two added tests hold
   the line: a one-character difference reports `false`, and a 50,000-character pair differing
   in its last byte reports `false`.

2. **`contractDigest` is removed from production telemetry entirely.** Excluding the
   packet's free text is not the same as being content-free: the structural state space it
   hashed is small and enumerable — one facet from a handful, one posture, five booleans,
   three small enums, two element pairs — so anyone holding the logs could precompute every
   possible digest and recover the derived orientation. That is pseudonymization of the
   orientation, not content-free telemetry. Cut 1A does not need it: the witness proves
   transport, not what the orientation decided. `digest` was also dropped from
   `ResolvedOrientation` so no latent path remains by which it could be logged;
   `orientationDigest()` survives as a pure function for tests. A test asserts the emitted
   line has exactly the eight authorized keys and no orientation vocabulary.

The line now says that an orientation existed and where it came from, never what it decided.

### 9.6 Acceptance — local

```text
/list-shaped · service computes                    PASS
/between-shaped · trusted packet survives          PASS  (same object reference)
client meta.facetDecision ignored                  PASS  (no meta channel exists)
sanctuary · nothing produced or accepted           PASS
sanctuary · no orientation body logged             PASS
computeFacetDecision throws · fail-soft            PASS
FAST / CORE / DEEP · contract reach                PASS
FAST / CORE / DEEP · zeroPromptDiff, applied false  PASS
guard-on-the-guard · appended render → diff false  PASS
telemetry content-free                             PASS

jest lib/maia          329 passed, 16 suites
npm run typecheck      no regressions
npm run check:no-supabase  clean
```

### 9.6b Custody rules (standing, derived in this lane)

**CI evidence belongs to the SHA returned by the check API, never to the SHA in the
notification that caused us to look.** `get_check_runs` on a pull request reports checks for
the PR's *current head*, which can already have moved past the SHA a wake event named. This
lane produced one real instance of the error: an "8/8 green on `bbe5a5bb6`" report on #1197
that was in fact the check state of its successor `716cb19c9`. The result was genuine and
changed no decision; the attribution was wrong. Related: a red ✗ on a superseded commit is
usually `cancelled`, not `failure` — GitHub kills in-flight runs when a new head lands and
renders the cancellation as a red mark.

**If a candidate is going to earn production witness, make the candidate current before
witnessing it whenever the drift is known, conflict-free, and cheap to absorb.** Leaving a
candidate behind canonical is technically defensible when the drift cannot affect the thing
being witnessed, but it buys an avoidable provenance qualification — *witnessed tree ≠
eventual canonical tree* — for the price of one clean merge and one CI cycle. Cut 1A took
that cycle rather than that qualification (founder ruling, 2026-09-04).

**The deploy candidate is the branch head, not the implementation commit.** `7bbec9b3d` is
what the candidate must *contain*; the head is a merge commit carrying canonical as well.
Both are asserted separately in the custody check, never conflated.

### 9.7 Stop condition

```text
PRODUCTION SHADOW WITNESS       PENDING — required, not yet obtained
MEMBER-FACING INFLUENCE         NOT AUTHORIZED
CUT 1B (orientation authority)  NOT OPENED
P6                              CLOSED
```

This session has no production access, so the witness cannot be taken here. What it must
show: `[MAIA/orientation-shadow]` on an ordinary signed-in turn with `applied: false`,
`zeroPromptDiff: true`, and a `contractSource` matching the surface — `service` for `/list`,
`upstream` for `/between`.
