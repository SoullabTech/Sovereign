# MAIA-MAVEN-T1 — TRUTHFUL AWARENESS CHARTER

**Status:** FUTURE PROGRAMME CHARTER. ⛔ **NOT implementation authorization.**
**Lane:** `MAIA-MAVEN-CANON-01` — documentation only.
**Date:** 2026-09-17
**Opens on:** an explicit founder act, after adjudication of the canonicalization report.
**⭐ AMENDED 2026-09-17 by founder adjudication** — §1.2 resolved by **R8**. T1-A is now OPEN as
its own narrowly chartered lane: `MAIA-MAVEN-T1A_KEEP_INVOCATION_CHARTER_2026-09-17.md`.

---

## 0. Purpose

T1 is the **first implementation tranche** of `MAIA-MAVEN-01`. Its theme is *truthful
awareness*: MAIA may retrieve what the member explicitly chose to hold, and may say truthfully
what she is using — **before** she is given any power to capture, infer, remind, or act.

⛔ Nothing in this charter is authorized. T1-A and T1-B are *eventual builds*; T1-C and T1-D are
*censuses only*. Opening any of them requires a named founder act.

---

## ⚠️ 1. Two corrections to the tranche as handed down

The reconciliation census changed two premises. Both are recorded here rather than silently
absorbed.

### 1.1 T1-A is further along than "build eventually" implies

A member-keeps READ route **already exists with a doctrine and a passing doctrine suite**:
`app/api/sovereign/keeps/route.ts` + `__tests__/keepsReadDoctrine.test.ts` (8 assertions),
enforcing member-scoping by credential, refusal on unauthenticated read, provenance carried
with every line, unaltered characters, a bounded read a caller cannot unbound, and — decisively
for T1 — *"⛔ orders by the member act only — it never ranks, scores or selects"* and *"⛔ never
reads section body text."*

⭐ **T1-A's remaining work is therefore not the route and not the doctrine. It is the invocation
seam** (see §1.2 and report finding F-1). The charter is amended accordingly below.

### 1.2 "Keeps" denotes at least three different objects

| Object | Substrate | What it holds |
|---|---|---|
| **Press keeps** | `app/api/sovereign/keeps/route.ts` | verbatim passages the member marked inside their own manuscript sections |
| **Portfolio keep gesture** | `app/api/psyche/portfolio/keep/route.ts` | a *formation event* recording the act of keeping material into the psyche portfolio, typed to `MemoryAtomSourceType` |
| **House "Keeps" room** | destination `keeps` → `/maia/keep-capture`, tooltip *"Moments you have held onto"* | a member-facing surface whose backing store is not established by this census |

⭐ **RESOLVED BY R8 — solved ontologically, not by arbitrary renaming.**

> **Keep is the family concept / member gesture. Each implementation must carry a qualified
> identity.**

The organism keeps the deeper idea of *keeping* without pretending three different objects are
one object. **The naming portion of T1-A is unblocked; ⛔ its invocation seam is NOT authorized.**

**Original text, kept verbatim:** ⛔⛔ T1-A may not open until it is ruled WHICH Keep object
"Personal Keeps READ" means.

⭐ This is the same defect class the `JARVIS-CIRCLES-01` I0 census already found and named:
*"'Commons' denotes THREE different existing things and NONE matches ratified FR-02."* The
remedy there was to rule the term before building. The same remedy applies here. ⛔ **Do not
resolve it by having MAIA read all three** — that would be a capability arriving through
vocabulary ambiguity rather than through a governed act.

---

## 2. T1-A — Personal Keeps READ

**Status:** ⭐ **OPEN at J4** under `MAIA-MAVEN-T1A_KEEP_INVOCATION_CHARTER_2026-09-17.md`.
⛔ J5 build NOT authorized. *(Original status: BLOCKED on the object ruling — resolved by R8.)*

**Purpose:**

> Allow MAIA to retrieve what the member explicitly chose to Keep.

**Constraints:** ⛔ no affinity ranking · ⛔ no proactive retrieval · ⛔ no CAPTURE.

**Layer standing (NODE-16 §V):** Memory = **YES, explicit member standing**.
Continuation = **NO automatically** — ⭐ a Keep can matter without asking for return.

**Owed before opening:**
1. the object ruling (§1.2);
2. which capability class this is (`READ`, not `CAPTURE`);
3. the invocation seam decision (F-1) — because a read route MAIA cannot reach is not a
   capability;
4. a negative control: MAIA must be unable to return a line the member did not keep.

---

## 3. T1-B — Journal READ

**Status:** eventual build. ⛔ Not authorized.

**Purpose:**

> Allow MAIA to retrieve canonical Journal entries factually.

⭐⭐ **Journal READ must read Journal, not derived episodic memory.** This is the load-bearing
constraint of T1-B and the reason it is a separate tranche item rather than a memory feature.

**Journal CAPTURE remains WITHHELD.**

**Substrate today:** `app/api/journal/{list,quick,reflect,chart-integration}`;
`lib/navigation/journalDeepLink.ts`; `lib/navigation/__tests__/journalReachability.test.ts`.

**Owed before opening:** a falsifier proving the read path cannot silently substitute
`episodic_memories` for a Journal entry. ⚠️ Note NODE-15 §4: episodic rows presently blur
History and Memory roles, which makes a substitution *plausible* rather than merely
hypothetical — so the falsifier is the point, not a formality.

---

## 4. T1-C — Writer's Studio Continuity Census

**Status:** CENSUS ONLY. ⛔ No build. ⛔ No schema.

Determine whether repository truth supports, as **distinct** states:

- last touched
- active locus
- explicit paused state
- explicit return state
- unresolved editorial state
- member-marked open question

> ⛔⛔ **Do not conflate these.** *Recent editing alone is not necessarily Continuation*
> (NODE-16 §IX). A census that returns "last touched" and calls it an active locus would
> manufacture the exact inferred unfinishedness law 4.3 forbids.

**Known starting points:** `lib/writers-studio/*`; `app/api/sovereign/studio/history/route.ts`
(⭐ its doctrine — *"never reads current state — every act is an immutable record"* — means
**history is not a continuity source**, and the census must not treat it as one);
`lib/manuscript/*`; revision/succession objects in the WS2 lanes.

---

## 5. T1-D — Presence Frame Census

**Status:** CENSUS ONLY. ⛔ **No Presence Frame implementation is authorized.**

Determine what the current runtime already knows **mechanically** about: member · workspace ·
surface · active object · active relationship · conversational focus · recent referents ·
Sanctuary state · pending confirmations · device/modality.

Classify each as: `EXPLICIT` · `DOMAIN STATE` · `SESSION STATE` · `MODEL INFERENCE` · `ABSENT`

⭐ **The classification is the deliverable.** The value of T1-D is discovering which elements of
MAIA's apparent situational awareness are actually *model inference dressed as knowledge* — the
distinction that makes the "right to inspect" (NODE-16 §XXII) answerable truthfully rather than
plausibly.

**One element is already classifiable from this census:** Sanctuary state = `EXPLICIT` /
`SESSION STATE` resolved per-turn at the serving boundary (`lib/sanctuary/turnPosture.ts`), and
⭐ it is the only element found with a forgery-resistant representation.

---

## 6. Sequencing law

T1-C and T1-D are **censuses and come first** in evidence terms even though they are numbered
last: T1-A and T1-B both depend on the invocation seam question, and T1-D is where the shape of
that seam becomes visible.

> ⭐ Ordering by number is not ordering by dependency. The censuses cost nothing and unblock
> both builds.

---

## 7. Standing

| Item | Standing |
|---|---|
| T1 as a whole | CHARTERED · T1-A OPEN at J4 · T1-B/C/D ⛔ NOT OPENED |
| T1-A Keeps READ | ⭐ **OPEN at J4** as `MAIA-MAVEN-T1A` — naming unblocked by R8; ⛔ invocation seam NOT authorized |
| T1-B Journal READ | ⛔ NOT AUTHORIZED; CAPTURE WITHHELD |
| T1-C Studio continuity census | ⛔ NOT OPENED (census only when opened) |
| T1-D Presence Frame census | ⛔ NOT OPENED (census only when opened) |
| Implementation | ⛔ NOT AUTHORIZED |
| Production | UNTOUCHED |
