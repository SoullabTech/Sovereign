# AIN-CONTEXT-01 · ACT 3 — SPIRALOGIC RUNTIME & PROCESS-CONTINUITY CENSUS

**Lane**: `AIN-CONTEXT-01` · **Act**: 3 of 9 · **CENSUS ONLY, READ-ONLY.**
**Opened by**: founder act, 2026-09-15, routing §A10.5's declared gap here rather than inferring it.
**Date**: 2026-09-15 · **Branch**: `claude/sweet-mayer-on4m5x` · **Tree**: post-`e099b9b`
**Method**: source and migration reading only. ⛔ No database, no traffic, no tokens, no model call,
no repair. Same limits as ACT 1 and ACT 2.

**The question, as narrowed by the founder** — ⛔ not *how does Spiralogic work*:

> **Where does the current runtime assign, persist, infer, retrieve, modify and inject
> elemental/spiral state, and which of those paths violate or can support LC-16…LC-18?**

And the caution carried in:

> **[F]** *Do not assume the existing thing called "spiral state" is actually a spiral. It may turn
> out to be a current-state classifier with Spiralogic vocabulary.*

---

## 0. THE ONE-SENTENCE ANSWER

> **The caution was correct. What the runtime calls spiral state is a current-state classifier
> wearing Spiralogic vocabulary — one element per member, no process identity, no sequence, no
> recurrence.** Its stabilising mechanism is structurally the Freedom Test failure (novelty must
> clear a two-turn bar the incumbent never faces), and Bridge D extends that bar's reach from two
> turns to across sessions. ⭐ **And none of it reaches the canonical prompt.** What *does* reach the
> prompt is elemental, **moment**-attributed, and already guarded by a prose boundary that states
> the anti-typing law and the Freedom Test more clearly than anything in the memory layer.

---

## 1. THE FIVE-REQUIREMENT TEST

**[F]** A real spiral requires, at minimum: *process identity · temporal sequence · differentiated
moments · recurrence · change across recurrence.*

Applied to `member_spiral_state` + `spiralStatePersistence.ts` + `conductor.ts`:

| Requirement | Present? | What exists instead |
|---|:--:|---|
| **Process identity** | ⛔ **no** | one row keyed `member_id`. There is no spiral object, no process id, no way to say *which* process this element belongs to |
| **Temporal sequence** | ⛔ **no** | the row is **upserted**. `updated_at` moves; no prior value survives |
| **Differentiated moments** | ⛔ **no** | only a current state; no moment is retained as a moment |
| **Recurrence** | ⛔ **no** | ⚠️ `return_count` counts the member returning **to the platform after autonomy**, ⛔ not a process recurring. Name collision, opposite meaning |
| **Change across recurrence** | ⛔ **no** | `motion` is a three-value label attached to the present row, ⛔ not a comparison between two occurrences of one process |

> **VERDICT: 0 of 5. It is a state snapshot.** ⛔ This is not a criticism of what it was built for —
> §4 — it is the answer to the question the founder told the census to ask first.

⭐ The practical consequence for the lane: **`member_spiral_state` cannot be extended into layer 3
(§A4).** A spiral store is a different object with a different key. ⛔ Do not let "we already have
spiral state" be read as "the substrate exists."

---

## 2. ⭐⭐ THE HYSTERESIS ASYMMETRY — THE FREEDOM TEST, IN A RUNNING MECHANISM

`lib/voice/conductor.ts:55-107`, `applyHysteresis(memberId, proposed, intensity)`:

- an in-memory `Map` holds one `{ confirmed, candidate, candidateCount }` per member;
- a **new** element must appear **2 turns in a row** to displace `confirmed`;
- the **incumbent** element is re-affirmed by doing nothing — `proposed === buf.confirmed` resets
  the candidate counter;
- the one escape is `intensity >= HIGH_INTENSITY_THRESHOLD` (0.8) — *"trust the signal, switch
  immediately"*;
- the closing line is explicit: **`// Not enough evidence — hold current element`**.

> **That is LC-20's shape exactly: the accumulated state is harder to disconfirm than to maintain.
> Novelty clears a bar the incumbent never faced.**

**⚠️ And the honest proportion, which matters more than the match.** At conductor scope this is a
**two-turn smoothing filter**, in memory, reset on restart, over a routing decision. Its stated
purpose — *"don't twitch"* — is sound: an element flapping every turn would make MAIA's register
incoherent. ⛔ **A two-turn hysteresis is not "14 withdrawals make P unfalsifiable."** Reporting it
as such would be the inflation this project's discipline exists to refuse.

**⭐ What changes its character is Bridge D**, and the code says so itself (`:46`):

```
 * In-memory only — resets on server restart. Bridge D replaces this.
```

`conductor.ts:266-269` seeds `buf.confirmed` from `persistedState.dominant_element` when the member
has no buffer. So after Bridge D:

> **the two-turn bar no longer defends a state formed two turns ago. It defends a state that was
> persisted — possibly weeks ago, in another session, on another device — and the member's present
> evidence must clear it.**

That is no longer smoothing. That is **accumulated history exerting authority over the present**,
which is the thing LC-20 names. ⚠️ Classified **structural, not observed** — no traffic was read.

---

## 3. ⭐ THE LOOP HAS NO MEMBER IN IT

```
conversation → conductor infers element → applyHysteresis
     → upsertSpiralState (fire-and-forget)    [spiralStatePersistence.ts:148]
     → member_spiral_state.dominant_element  (upsert, prior value overwritten)
     → next session: seeds buf.confirmed      [conductor.ts:266]
     → resists displacement for 2 turns
     → conversation → conductor infers element → …
```

**Nowhere in that loop does the member ratify, see, or contest the element.** The element's
persistence derives from having previously been inferred, and its authority on the next turn
derives from having been persisted. ⛔ No `detect → ask → record`. ⛔ No member act anywhere.

**Against the candidate invariants:**

| | |
|---|---|
| **LC-16** (no member-level elemental predicate) | ⛔ **violated in shape** — `member_id` PK + `dominant_element NOT NULL`, no spiral, no window (ACT 2 §A6) |
| **LC-17** (spiral membership is salience until ratified) | ⛔ **violated** — nothing is ratified; inference persists directly as state |
| **LC-18** (no scoring of developmental direction) | ⛔ **violated in shape** — `motion IN ('ascending','stuck','breakthrough')` |
| **LC-20** (novelty may defeat history) | ⚠️ **obstructed by mechanism** — §2 |
| **LC-19** (layers do not collapse) | ⛔ **violated** — one `dominant_element` column answers *state*, and via Bridge D's persistence also stands in for *phase-level* continuity (§A3's four objects, one field) |

⚠️ **Five candidate invariants, none ratified.** This is a compliance reading against proposed law,
⛔ not a finding of wrongdoing against ratified law.

---

## 4. WHAT IT WAS BUILT FOR — STATED BEFORE ANY VERDICT IS TAKEN

Bridge D's own words (CLAUDE.md, and `member_spiral_state`'s table comment):

> *"Prevents MAIA from treating returning members like brand-new people. **NOT personalization. NOT
> psychometrics.** Just continuity."* · *"Anti-regression state: structural spiral position per
> member. **NOT conversation content.** Updated fire-and-forget."*

⭐ **That purpose is good, and it is the same purpose this lane has.** Bridge D exists because
element resetting on server restart made returning members strangers — an ACT-1-class continuity
failure, correctly identified and repaired months earlier at the layer then available.

> **The finding is not that Bridge D is wrong. It is that Bridge D solved a continuity problem with
> a state-shaped tool, and the state shape is the one LC-16 prohibits.** Its authors said in the
> comment that it is not psychometrics; nothing in the schema enforces that, and the column group
> is titled `-- Elemental Identity`.

⛔ **Not repaired. No lane opened. Do not migrate this table opportunistically** — it serves a live
conductor seam and its repair is its own governed act.

---

## 5. REACHABILITY — WHAT ACTUALLY GETS INTO COGNITION

The compliance findings above are bounded by this section, and it changes their severity.

| Path | Reaches `/list` prompt? | Evidence |
|---|:--:|---|
| `member_spiral_state` / `dominant_element` | ⛔ **no** | no occurrence in `app/api/sovereign/app/maia/list/route.ts` |
| `conductor.ts` / `applyHysteresis` | ⛔ **no** | no occurrence in the route |
| Bridge D (`spiralStatePersistence`) | ⛔ **no** on `/list` | wired into `app/api/oracle/conversation/route.ts` per CLAUDE.md — the route CMT-01 §1.4 classifies as receiving ~zero live traffic |
| Other `member_spiral_state` readers | admin only | `admin/command-center/members`, `admin/activity-feed`, `spiralogic-report` (write), `innerGuideFieldPersistence` (write) |
| **`wuxingSnapshotAddendum`** | ✅ **yes** | `/list`, gated `shouldComputeWuXing = isRecognizedUser && !isSanctuary` |

⚠️ **Grep ceiling, stated**: absence of a string is not absence of a path. Indirect reach through a
helper would not appear. This is the ceiling CMT-01 §1.1 named and it applies unchanged.

> **⭐ So the LC-16/17/18/19/20 violations in §3 are latent, not live, on the canonical surface.**
> Same structure as C3 and §A6: the wrong shape exists, is not yet load-bearing in cognition, and
> can therefore be ruled on cheaply. **That is the third time this lane has arrived before the
> cost.**

---

## 6. THE ELEMENTAL MATERIAL THAT *DOES* REACH THE PROMPT

`WuXingSnapshot` (`lib/consciousness/wuxingSnapshot.ts:64`) carries two distinct things, and the
distinction is the whole of its LC-16 standing:

| Component | Attribution | LC-16 |
|---|---|---|
| `moment: WuXingMoment` → `momentDominant: WuXingElement[]` (`wuxingBridge.ts:90`) | **the moment** | ⭐ **compliant in shape** — a present-moment reading, not a member predicate |
| `WuXingConstitution` (`wuxingBridge.ts:41`) — from BaZi + birth data read at `route.ts:588` | the member, natally | ⚠️ **different epistemic class** — see below |

**⭐ `momentDominant` is the shape LC-16 asks for and did not expect to find already in use.** It
attaches an element to *now* rather than to the person. It is missing the other half — a spiral and
a window, so it cannot yet say *"Water has been recurring for several weeks in this relationship"* —
but it is **not** typing, and an implementation of LC-16 has a compliant precedent in the tree.

**On the constitution**: a natal chart is member-supplied birth data interpreted through a declared
traditional system. ⛔ That is **not** MAIA inferring a developmental type from conversation, which
is what LC-16 governs. ⚠️ It is nonetheless a member-level elemental predicate, and whether LC-16
should reach it is a **founder question this census does not answer**.

---

## 7. ⭐⭐ THE ASYMMETRY THAT IS THE MOST IMPORTANT FINDING IN THIS ACT

`app/api/sovereign/app/maia/list/route.ts:282` — `SYMBOLIC_LENS_BOUNDARY`, shipped, in the prompt:

> *"These are traditional interpretive lenses — NOT facts, NOT predictions, NOT evidence about this
> member's actual life. **Possessing a framework gives you NO grounds to assert anything about who
> they are, what phase they are in, or where they are heading.** You still know only what they have
> actually told you. Do not lead with a lens or announce 'you are entering / this means / your chart
> shows' as fact… and **when a lens conflicts with their lived experience, their experience wins.**"*

⭐ Read against ACT 2, this block already contains, in prose:
- **LC-16** — *no grounds to assert… what phase they are in*;
- **LC-18** — *…or where they are heading*;
- **LC-20 / the Freedom Test** — *when a lens conflicts with their lived experience, their
  experience wins.*

> **The anti-typing law and the Freedom Test are already canon in this system — for borrowed
> lenses. They do not exist, in prose or in structure, for MAIA's own accumulated read of the
> member.**

⭐⭐ **The weaker-provenance source is the better-guarded one.** Astrology gets an explicit
prohibition; MAIA's own longitudinal inference gets `dominant_element NOT NULL` under a comment
reading `Elemental Identity`. ⚠️ And the reason is legible and sympathetic: a borrowed framework
*announces itself* as an interpretive claim, so it drew a guard. A system's own observation feels
like evidence rather than interpretation — which is exactly why it needs the stronger guard and has
the weaker one.

**[J] Recommendation, ⛔ not taken**: whatever LC-16 becomes, `SYMBOLIC_LENS_BOUNDARY` is its prose
ancestor and should be extended to self-derived developmental claims rather than re-invented beside
them. ⛔ Reuse the law, never the object.

---

## 8. WHAT THIS CENSUS DID NOT READ

⛔ Stated so the coverage is not overstated. **Not read**: `lib/maia/SpiralogicOrchestrator.ts` ·
`lib/maia/MaiaFieldOrchestrator.ts` · `lib/maia/FieldCoherenceEngine.ts` · the five elemental agents
and `agent-voice-grammars.ts` · `lib/maia/adaptive-resonance-system.ts` ·
`lib/consciousness/interpretiveLedger.ts` beyond its importers · the Corpus Callosum `agent_runs`
elemental voices · `lib/memory/ElementalState.ts` · `innerGuideFieldPersistence.ts` beyond its write
statement · the full `conductor.ts` scoring path (`scoreRoute`) that *produces* the proposed element.

⚠️ **The last one is a real gap**: this act censused how an element is **stabilised, persisted and
seeded**, ⛔ not how it is **inferred in the first place**. Whatever `scoreRoute` does is the actual
act of attributing an element to a member's utterance, and it is unread.

Also not established: whether the conductor path shares `session_id` space with `/list`; whether
any elemental predicate reaches cognition by an indirect path (§5 ceiling); and ⛔ **no traffic
evidence for anything** — the ~zero-traffic classification of the oracle route is inherited from
CMT-01 and is three months stale.

---

## 9. STANDING AND WHAT ACT 4 INHERITS

**ACT 3 CLOSED for authoring.** ⛔ Nothing repaired · nothing ratified · no schema touched ·
`member_spiral_state` untouched · Bridge D untouched · C4 still unrepaired · `writeSummary` still
inactive · the summary slot still empty.

Carried to ACT 4:

- **C4 remains the first measurement** — cheapest, highest-value, and unmoved by this act.
- ⭐ **A second cheap falsifier now exists**: Bridge D's cross-session hysteresis (§2). A member
  whose persisted element is `water` returning after weeks must supply two consecutive
  non-water turns before the conductor will move. **That is testable without a member** and is the
  Freedom Test's first concrete subject.
- **`scoreRoute` must be read before LC-16 can be drafted as an enforceable guard** (§8) — a guard
  on where elements are *stored* is defeated by an inference path that attributes them elsewhere.
- **The compliance matrix (ACT 3's own §3) is partial by construction.** It covers the state/persist
  /seed path. The inference path, the orchestrators and the elemental agents are unexamined, and
  ⛔ their absence from §3 is not a pass.
- ⚠️ **One open founder question, raised and not answered**: does LC-16 bind natal constitution
  (§6), or only conversation-derived predicates?

---

*A spiral requires process identity, sequence, differentiated moments, recurrence, and change
across recurrence. The runtime has one element per member and overwrites it. What is called spiral
state is the vocabulary of development applied to a snapshot — and the system's clearest statement
of the law it needs is already written, in the prompt, about somebody else's framework.*
