# Larry Encounter — Walk Sheet & Capture Instrument

**Date:** 2026-09-03 · **Inspected trunk:** `2f8d97297` (2026-09-02) · **Deployed SHA:** `fc66b477a` (2026-08-31)
**Drift check: PASSED** — production is 52 commits behind trunk, but every surface this walk touches is byte-identical. See §0.
**Type:** ⭐ **evidence-gathering**, not design approval
**Status:** authorizes no route, no code, no production change. Records what Larry reveals.

## Structure — 25 minutes, three parts, in this order

| # | Part | Time | What it is | Evidence class |
|---|---|---|---|---|
| **1** | **Current build** | 5 min | "This is what works today." A walk of the deployed product. | **Encounter** — what he does |
| **2** | **Eight-state candidate** | 10 min | "This is the client experience we are considering. **It is not built.**" | **Reaction** — what he says about a proposal |
| **3** | **Scope Grid** | 10 min | Larry marks YES / NO / MAYBE. | **Instruction** — what he wants |

⛔ **Parts 1 and 2 produce different kinds of evidence and must never be merged in the record.** What a person does inside a working thing and what a person says about a described thing are not the same claim, and part 2 will feel more impressive than part 1 precisely because nothing in it can disappoint him yet.

⛔ **There is no built candidate.** The eight-state journey exists as a document — `NW_CLIENT_JOURNEY_DESIGN_CANDIDATE_2026-09-02.md` — with no routes and no screens behind it. Part 2 is reading and discussing a document. Say "not built" **out loud** at the top of part 2; a candidate shown minutes after the real product reads as built unless the boundary is spoken.

> Brief, concrete, one decision at a time.
> Part 1: show → watch → ask → record. **Do not rescue the experience by explaining it unless Larry asks.**
> Part 2: state the boundary, then walk the document.
> Part 3: he marks; you write.

---

## 0. Preflight — the entry condition is controlled, not discovered

**Routing is preflight evidence. Larry's response is encounter evidence.** They are different classes and must not be mixed. Which surface he lands on is never left to cookie chance — it is established before he arrives.

### Bind the walk to the runtime, not the branch

The inspected branch establishes **code truth**, not production truth. Record and verify what is actually deployed:

```bash
ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT'
```

**Result, verified 2026-09-02:** deployed `fc66b477a` (2026-08-31), an **ancestor** of the inspected trunk `2f8d97297`. Production is **52 commits behind** — but not in anything this walk touches:

| Path | deployed `fc66b477a` vs trunk `2f8d97297` |
|---|---|
| `middleware.ts` | **identical** |
| `app/now-what` | **identical** |
| `components/now-what` | **identical** |
| `lib/nowWhat` | **identical** |

(Tree-hash comparison, with a positive control: 94 files changed overall between the two, so the comparison is live, not a silent no-op.)

**Therefore the route map in §1 and the routing findings in §2 hold on the deployed build.** They are no longer provisional.

⚠️ One residue: code identity is not a behavioural check. Environment variables, build args and runtime config do not appear in a tree diff. So still walk the signed-out redirect **once yourself** on the deployed build before Larry arrives — that is preflight condition 2 below, and it costs thirty seconds.

### Establish the entry condition

| # | Condition | Verified how |
|---|---|---|
| 1 | **Clean Incognito session** | fresh private window, no prior cookies |
| 2 | **Exact invitation URL** | the real link, not a hand-typed path |
| 3 | **`fieldContext` verified present** | read it in the URL before the meeting |
| 4 | **Working sign-in** | tested end-to-end on the deployed build |
| 5 | **Fictional demo identity** | see the constraint below — this is the strictest condition and the easiest to fail |

### The demo identity must be fictional

The account Larry is shown must contain **invented content only**. "Larry-relevant" means *plausible for his clientele* — it does not license using his material or anyone's real life.

⛔ Must NOT appear in the demo account:

- **Unlicensed source material.** No text, phrasing, domain names, or framing drawn from Larry's talk, deck, or transcript. The Materials Agreement is unsigned and Attachment A §3 is empty — nothing of his is licensed for display, including back to him.
- **Real client information.** No actual member's kept acts, reflections, questions, or coaching content, from any field. Not anonymised, not lightly edited.
- **Kelly's own material.** Not because it is unlicensed, but because it makes the walk about the wrong person.

✅ What it should contain: invented kept acts, an invented carried thread, an invented coach name, written fresh for this walk.

The demo is a **vessel showing the shape of the product**, not a sample of its content. If Larry recognises his own language in it, the walk has demonstrated the one thing the governance work exists to prevent.

### The stop rule

> **If the refusal path appears, stop and classify the walk as PREFLIGHT BLOCKED.**
> Do not proceed. Do not interpret Larry's reaction to the wrong doorway as UX evidence.

A reaction to a refusal screen is evidence about our preflight, not about the product.

**Do not touch anything visual today.** Refinement before he sees it destroys the evidence.

---

# PART 1 — Current build (5 minutes)

**Opening line:** *"This is what works today."* Nothing more. No framing, no roadmap.

Six stops. Two states observed separately. Each stop: **show it, say nothing, watch, then ask the one question.**

| # | Stop | Route | The one question, asked only after silence |
|---|---|---|---|
| 1 | **Signed-out arrival** | `/now-what` → redirects to `/now-what/arrive` (see §2) | "What do you think this is?" |
| 2 | **Sign in** | `/now-what/arrive` | "What did you expect to happen next?" |
| 3 | **Today** (authenticated home) | `/now-what` | "What's here?" — then wait. Longer than is comfortable. |
| 4 | **The Room** | `/now-what/room` | "What would you say to it?" |
| 5 | **Keep** | gesture inside The Room | "What just happened to what you wrote?" |
| 6 | **Return** | back to `/now-what` | "What is it asking you?" |

**Stop 6 is the state in the screenshot.** It is the *authenticated Return state*, not the whole product. If it reads thin to Larry when shown cold, that is evidence about the walk's framing, not proof the screen is defective.

### The five rooms — show only if he asks "where is…?"

| Room | Route | Its question |
|---|---|---|
| My Question | `/now-what/questions` | what am I wrestling with? |
| My Work | `/now-what/work` | what am I living and cultivating? |
| My Coaching | `/now-what/coaching` | how is another person's presence shaping this work? |
| My Story | `/now-what/field` | what is becoming, over time? |
| The Room | `/now-what/room` | can I think this through, now? |

Do not tour the rooms. A tour turns an encounter into a demo.

---

## 2. Observe the two entry states separately

Finding: the screenshot was the **authenticated Return state**. Signed-out entry is a different surface and must be watched on its own.

**Unauthenticated requests to every *protected* `/now-what/*` route redirect to `/now-what/arrive?next=…`.** `/now-what/arrive` and `/now-what/welcome` remain publicly reachable — exemptions come from the middleware route matcher, so exactly which routes are protected is a **preflight check on the deployed build**, not a claim to carry into the room.

Three distinct signed-out surfaces exist. §0 fixes which one Larry meets; it is not left to cookie state:

| Surface | Reached how | Status |
|---|---|---|
| `/now-what/arrive` | middleware redirect, no session cookie | **the real signed-out path** — this is what an invited client hits |
| `NowWhatThreshold` in `ClientHome` | renders when a request passes middleware but the client resolves `session === 'out'` | **reachability unverified** — do not claim it is dead, do not claim it is live |
| `/now-what/welcome` | public landing, **zero inbound links by design** | outward face for a share card or deck CTA; not on the client path |

Walk **`/now-what/arrive`**, and only that.

⛔ **`/now-what/welcome` and `NowWhatThreshold` are not on tomorrow's walk.** Both remain **STILL UNKNOWN** and stay that way. Adding either to the tour would trade a controlled encounter for two unvalidated surfaces, and would answer a routing question with Larry's time — the wrong instrument. Their reachability is preflight work for another day.

---

## 3. Capture — his words, not our summary

For every stop, write what happened before writing what it meant.

```
STOP: ______________________  ROUTE: ______________________

EXACT WORDS (verbatim, including false starts and "hmm"):
  "

WHERE HE PAUSED / went quiet / got impatient:

WHAT HE EXPECTED TO FIND (said or reached for):

WHAT HE IGNORED (scrolled past, never clicked, never mentioned):

"TOO MUCH" reaction — what triggered it:

"WHERE IS ___?" — what he went looking for and could not find:
```

Verbatim beats paraphrase. A paraphrase is already a reading.

---

# PART 2 — Eight-state candidate (10 minutes)

**Opening line, spoken before anything is shown:**

> *"This is the client experience we are considering. It is not built yet — there are no screens behind this. I want your reaction to the shape."*

The candidate under discussion — a **dated design candidate**, not settled architecture:

```
LANDING → SIGN-IN → CHECK-IN → TODAY ⇄ FIELD → CONVERSATION → KEEP → RETURN → TODAY
```

Shared skeleton, one meaningful gesture per state, four marked fracture points.

⚠️ **Before the meeting:** confirm the eight states in `NW_CLIENT_JOURNEY_DESIGN_CANDIDATE_2026-09-02.md` match the line above. That document lives outside this branch and was not read when this sheet was written — if it has drifted, the document governs and this line is corrected to match it, not the other way round.

### How to run part 2

- Walk the states **in order**, briefly. Do not defend any of them.
- The four fracture points are the valuable part. Name them as open, not as solved.
- If he asks "can I see it?" — the answer is **"not yet, it isn't built"**, not a jump back to part 1.
- If he starts designing, let him. Record it verbatim; do not steer it toward the candidate.

### What NOT to do in part 2

- Do not explain the full AIN vision. He has reacted to one concrete thing; that reaction is the asset.
- Do not present the eight states as decided, sequenced, or scheduled.
- Do not let part 1's screens stand in as illustrations of part 2's states. They are not the same product.

---

# PART 3 — Scope Grid (10 minutes)

Handled in §5 below. He marks; you write. One row at a time.

---

# AFTER — classify the evidence

## 4. Mark each candidate claim

After the walk, mark every claim with exactly one:

| Mark | Means |
|---|---|
| **CONFIRMED** | he showed or said it, unprompted |
| **CHALLENGED** | his behaviour or words contradicted it |
| **NEW EVIDENCE** | something we had not anticipated |
| **STILL UNKNOWN** | the walk did not test it — the honest and most common mark |
| **PREFLIGHT BLOCKED** | the walk never reached a valid doorway; nothing observed after that point is encounter evidence |

**Tag every mark with which part produced it — `[P1]`, `[P2]`, `[P3]`.** A claim confirmed in part 2 is confirmed as *a thing Larry liked the sound of*, which is a weaker fact than the same claim confirmed in part 1, where he met it. Untagged marks silently promote the weaker to the stronger.

⚠️ **STILL UNKNOWN is not a failure.** An eight-state journey cannot be validated in one sitting; recording six unknowns is a better outcome than manufacturing six confirmations.

---

## 5. The Scope Grid

Evidence-only against trunk `2f8d97297`. Larry marks **YES / NO / MAYBE** per row.

| Reading | Means |
|---|---|
| `LIVE` | retain |
| `PARTIAL` | complete |
| `NOT BUILT` | new scope |

⛔ The grid **does not determine navigation, hierarchy, or future IA.** It is an inventory he reacts to, nothing more.

---

## 6. Governance boundary — constraint, not agenda

Carry these. Do **not** open them as topics unless Larry raises them.

- **Attachment A §3 remains empty.** No inventory row enters except from Larry naming the item.
- **The taxonomy remains unratified.** No list of domains is settled. If domains come up, the sequence is: open question first, allowed to complete; only then the relation question, with "if at all" spoken.
- **Transcript custody and preservation remain unresolved.** Audio not held; speaker attribution unverified.
- **No raw transcript enters Git** until custody, confidentiality, and third-party status are resolved.
- **Branch state:** `claude/google-docs-link-review-6rj0yz @ f25a538`. No PR opened.

---

## 7. Leave behind

- Further visual refinement before he sees it.
- New features, rooms, or doctrine.
- Treating the eight-state candidate as settled architecture.
- Explaining the full AIN vision before he has reacted to the concrete experience.
- The assumption that the minimal Return screen is itself defective.

---

## The whole job

**Show what exists. Describe what is being considered, marked clearly as unbuilt. Let him mark what matters. Preserve what he actually reveals.**

If the meeting produces only verbatim quotes, a column of STILL UNKNOWN, and a marked grid, it succeeded.

The one failure mode worth naming: **leaving with him believing the eight-state journey exists.** That is not a communication slip, it is the inflation drift this project's claim discipline exists to prevent — and it happens by omission, not by assertion.
