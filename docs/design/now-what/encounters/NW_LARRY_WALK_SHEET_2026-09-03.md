# Larry Encounter — Walk Sheet & Capture Instrument

**Date:** 2026-09-03 · **Trunk:** `2f8d97297` (2026-09-02)
**Type:** ⭐ **evidence-gathering**, not design approval
**Status:** authorizes no route, no code, no production change. Records what Larry reveals.

> Brief, concrete, one decision at a time. Show → watch → ask → record.
> **Do not rescue the experience by explaining it unless Larry asks.**

---

## 0. Before he arrives — three checks, 5 minutes

| # | Check | Why | If it fails |
|---|---|---|---|
| 1 | Open the walk URL **in a private window**, signed out | The signed-out surface is the one finding we most need and the easiest to accidentally skip by using an already-authenticated browser | Use a second device |
| 2 | Confirm the invitation link carries `fieldContext` | Middleware sends every unauthenticated `/now-what/*` to `/now-what/arrive?next=…`. A URL without field context may land on the refusal path rather than the arrival | Get a link that carries it; do not walk the refusal path as though it were the door |
| 3 | Have the authenticated account ready in a second window | So the sign-in step can be observed *without* the walk stalling on a password | Pre-sign-in the second window |

**Do not touch anything visual today.** Refinement before he sees it destroys the evidence.

---

## 1. The shortest possible walk

Six stops. Two states observed separately. Each stop: **show it, say nothing, watch, then ask the one question.**

| # | Stop | Route | The one question, asked only after silence |
|---|---|---|---|
| 1 | **Signed-out arrival** | `/now-what` → redirects to `/now-what/arrive` | "What do you think this is?" |
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

Three distinct signed-out surfaces exist. Which one Larry meets depends on cookie state:

| Surface | Reached how | Status |
|---|---|---|
| `/now-what/arrive` | middleware redirect, no session cookie | **the real signed-out path** — this is what an invited client hits |
| `NowWhatThreshold` in `ClientHome` | renders when a request passes middleware but the client resolves `session === 'out'` | **reachability unverified** — do not claim it is dead, do not claim it is live |
| `/now-what/welcome` | public landing, **zero inbound links by design** | outward face for a share card or deck CTA; not on the client path |

Walk **`/now-what/arrive`**. Note which of the three he actually lands on — that itself is evidence.

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

## 4. Mark each candidate claim

The client-journey candidate under examination — a **dated design candidate**, not settled architecture:

```
LANDING → SIGN-IN → CHECK-IN → TODAY ⇄ FIELD → CONVERSATION → KEEP → RETURN → TODAY
```

Shared skeleton, one meaningful gesture per state, four marked fracture points.

After the walk, mark every claim with exactly one:

| Mark | Means |
|---|---|
| **CONFIRMED** | he showed or said it, unprompted |
| **CHALLENGED** | his behaviour or words contradicted it |
| **NEW EVIDENCE** | something we had not anticipated |
| **STILL UNKNOWN** | the walk did not test it — the honest and most common mark |

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

**Prepare the shortest possible walk. Let Larry encounter what exists. Preserve what he actually reveals.**

If the meeting produces only verbatim quotes and a column of STILL UNKNOWN, it succeeded.
