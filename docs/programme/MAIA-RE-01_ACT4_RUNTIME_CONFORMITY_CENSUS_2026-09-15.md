# MAIA-RE-01 / ACT 4 — RE-009 Runtime Conformity Census

**Status:** ACT 4 output. **READ-ONLY.** ⛔ Nothing repaired, nothing changed.
**Date:** 2026-09-15. **Authority surface:** `docs/canon/PERCEPTION_WITHOUT_POSSESSION.md`
and its reconciled sources at `dcaac191`.
**Method rule honored:** no conclusion is drawn from the existence of a function, table, type
or route. Every conforming/nonconforming call below rests on a demonstrated write→read chain;
everything else is marked **UNVERIFIED**.

---

## 0. Headline

**F1 — ⭐⭐ The sharpest nonconformity is at Act 5, and it is durable.** System-originated
relational-dynamic attributions (`pursue_withdraw` · `overfunctioning` · `withdrawal` ·
`escalation` · `projection`) are written to `relationship_entries.pattern_hint` and
`relationship_entry_patterns` with a **30-day TTL**, on a live path, with no member
participation. RE-009 bounds ephemerality to the **conversational working context**. Thirty
days is not that.

**F2 — ⭐⭐ The existing control is an EXTERNAL-witness control, which RE-009 §3 says is
insufficient — and the prompt says so in its own words.**
`lib/relationships/buildRelationalContextBlock.ts:54` instructs: *"Do not name the themes you
have been told about… If a pattern is named, the user names it first… **You may know more
than you say.**"* That governs **what MAIA says**. It does not govern **what the inference is
allowed to do**. This is exactly the founder's `external: conforming / substrate: violating`
shape.

**F3 — ⭐ The read-back gate is genuinely good, and one asymmetry undercuts it.** Ambient
flow is off by default with an explicit warning (*"Ambient detection is membrane leakage if
it arrives before observation"*), and the fallback query deliberately excludes the observer's
catch-all bucket. **But the explicit-handoff path does not exclude it, and the member-facing
relationship list does not filter it** — so the bucket of system attributions is visible,
selectable, and hands off into the prompt.

**F4 — ⭐ Two dormant writers have LIVE readers in the prompt path.** `saveConversationTheme`
and `saveRelationshipPattern` each have **zero external callers**, while
`loadRelationshipMemory` → `formatRelationshipMemoryForPrompt` is live at
`lib/sovereign/maiaVoice.ts:888`. Capability present, path not live. ⛔ **Not a current
violation** — recorded as a latent conformity hazard, per the founder's distinction.

**F5 — ⭐ Real conformance exists and should be recorded as such.** Sanctuary refuses the
observer outright as defence in depth; the detector runs on the **member's message only** so
it *"cannot chase its own output"*; the persisted `content` is the member's own words with
*"no AI interpretation"*; and the prompt labels provenance honestly — *"Themes the system
observed"*, never "your themes."

---

## 1. Traced paths (reachability demonstrated)

```
LIVE WRITE PATH
  app/api/oracle/conversation/route.ts:1638      ─┐
  app/api/sovereign/app/maia/route.ts:438         ├─► observeRelationalContent()
  app/api/sovereign/app/maia/list/route.ts        ─┘        │
                                                            ▼
                              detectPatterns(userMessage only)
                                                            │
                    ┌───────────────────────────────────────┤
                    ▼                                       ▼
   relationship_entries                     relationship_entry_patterns
     .content   = member's words (≤200ch)     .pattern_id  = SYSTEM ATTRIBUTION
     .pattern_hint = SYSTEM ATTRIBUTION       .evidence    = member's words (snippet)
                    │                         .expires_at  = NOW + 30 days
                    ▼
LIVE READ PATH (gated)
  getMemberActiveRelationalContext(memberId, { relationshipId })   ← explicit handoff ONLY
                    │        allowRecentThreadFallback: never passed by either caller
                    ▼
  loadRelationshipContext → salientThemes  ← pattern_hint accumulates here
                    │
                    ▼
  formatRelationalContextForPrompt.ts:64
     "- Themes the system observed across those entries: {themes}"
                    │
                    ▼
                PROMPT
```

---

## 2. The six acts — classification

### Act 1 · NOTICE — **CONFORMS**

**Substrate:** `relationalObserver.ts` detects relational content over a ~40-term signal list,
threshold `confidence >= 0.35`. Live on three routes (demonstrated). **External:** none.
RE-009 §1 permits perception. Sanctuary refuses outright (`posture.isSanctuary` → return),
documented as defence in depth because *"the boundary must not rest on a single conditional."*

### Act 2 · HYPOTHESIS FORMATION — **CONFORMS at formation; see Act 5 for what happens next**

Hypotheses are formed as `detectPatterns()` hits carrying `patternId`, `confidence`,
`evidence`. RE-009 §2 permits this. ⚠️ **Where they live is the problem, not that they form.**

### Act 3 · OPERATIONAL USE — **AMBIGUOUS**

**Substrate witness:** system attributions reach the prompt as *"Themes the system observed
across those entries."* Demonstrated chain above. **External witness:** the prompt block
forbids naming them.

**Why AMBIGUOUS rather than NONCONFORMS:** RE-009 §3 *permits* an unconfirmed inference to
shape inquiry, pacing and caution. Provenance is labeled honestly, so the model is not told
these are the member's own themes. **Why not CONFORMS:** nothing in the path distinguishes
*shaping inquiry* from *shaping treatment*. *"You may know more than you say"* is a
disclosure instruction; it places no limit on advice, presumed truth, or direction derived
from the attribution. **The Act 3 line is simply not drawn anywhere in this path.**

⛔ Per RE-009 §3, output humility cannot settle this — resolving it requires observing
whether the attribution changes consequential behavior, which this census did not do
(no model execution).

### Act 4 · INTRODUCTION — **CONFORMS** (⚠️ stricter than canon now requires)

`buildRelationalContextBlock.ts:54` forbids introduction outright: *"If a pattern is named,
the user names it first."* RE-009 §4 **permits** corrigible invitation. ⚠️ Recorded as a
finding in the other direction: **current runtime is more restrictive than the reconciled
canon.** ⛔ Not a violation; ⛔ not an authorization to loosen it.

### Act 5 · PERSISTENCE — 🔴 **NONCONFORMS**

| Required field | Finding |
|---|---|
| **Canonical rule violated** | RE-009 §5 — *may not preserve the system's unadopted interpretation as knowledge about the member*; §*Where "ephemeral" ends* — must not cross the session boundary as a person-level inference |
| **Exact runtime path** | `relationalObserver.ts:189-217` → `relationship_entries.pattern_hint` + `relationship_entry_patterns.pattern_id` |
| **Observable effect** | Relational-dynamic attributions (`projection`, `pursue_withdraw`, `overfunctioning`, `withdrawal`, `escalation`) persist per member for **30 days** (`DEFAULT_PATTERN_TTL_DAYS = 30`) |
| **Member-visible** | Indirectly — surfaced at `app/api/relationships/[id]/entries` and `app/founder/relational-patterns` |
| **Durable** | **Yes** — database rows, TTL-bounded, cross session and conversation boundaries |
| **Currently reachable** | **Yes** — write path live on three routes (demonstrated) |
| **Falsifier / reproduction** | Send a message matching a pattern regex on any of the three routes outside Sanctuary; assert a row appears in `relationship_entry_patterns` with `expires_at ≈ NOW + 30d` and no member act in between |

**Applying the §5 test:** `content` and `evidence` **describe an utterance** → permissible.
`pattern_id` / `pattern_hint` **attribute a relational pattern to the member** → the
prohibited category, named explicitly in RE-009 §5.

⚠️ **Trap-1 discipline applied.** This is not a vocabulary judgment. `evidence` holds the
member's matched words and is fine. The nonconformity is `pattern_id`, whose provenance is a
system regex classifier, whose referent is the member, and whose **use** is accumulation into
`salientThemes`. **Same row, two epistemic objects, classified separately.**

⭐ The TTL is a real design control and is recorded as such — the code calls relational
dynamics *"stateful, not fixed traits."* It bounds persistence; it does not bound it to the
conversational working context RE-009 requires.

### Act 6 · PROMOTION — **AMBIGUOUS**

⛔ **No code path was found that converts a system inference into a member-authored object.**
Promotion in the RE-009 §6 sense (recognition → durable member-level standing) appears
**absent rather than violated** — there is no promotion mechanism at all.

⚠️ **Two findings recorded instead:**

**(a) The handoff is a member act about a different object.** Supplying `relationshipContextId`
is a member act concerning *a relationship thread*. The `pattern_hint` attributions ride along
on it. The member never named, recognized, revised or adopted the pattern — RE-009 §6's
required acts. **Operational standing is conferred by a member act that was about something
else.**

**(b) ⭐ The system auto-creates a member-visible durable object, and the exclusion is
asymmetric.** `observeRelationalContent` creates a `member_relationships` row named
**"Unresolved Relational Field"**. The *fallback* query excludes it by name
(`relationshipContextService.ts:87`) — a deliberate control. The **explicit-handoff path does
not**, and `app/api/relationships/route.ts:27` filters only on `member_id` and `archived_at`,
so the bucket **appears in the member's own relationship list** and can be handed off.
⚠️ Its name is itself mildly attributive — it asserts the member has an unresolved relational
field. **Whether an auto-created, system-named, member-visible container is an Act 6 concern
or merely a container is a doctrinal question this census does not answer.**

---

## 3. Latent conformity hazards — CAPABILITY PRESENT, PATH NOT LIVE

⛔ **None of these is a current violation.** Recorded because the readers are live.

| Writer | External callers | Reader | Reader live? |
|---|---|---|---|
| `saveConversationTheme` | **0** | `loadRelationshipMemory` → `formatRelationshipMemoryForPrompt` → `maiaVoice.ts:888` | **Yes** |
| `saveRelationshipPattern` | **0** | `RelationshipMemoryService` reads `relationship_patterns` | reader live; field not in the prompt formatter's destructure |

⭐ **Restating the ACT 2 generalization, now with the reader chain demonstrated:** *the absence
of a caller is not a constitutional boundary.* One function call would move system-originated
themes into Act 3 and Act 4 with **no gate crossed and no guard firing** — and unlike the
relational-context path, this one has **no explicit-handoff gate at all**.

---

## 4. UNVERIFIED — honest gaps

| Item | Why unverified |
|---|---|
| `relationship_essences` | Written by `RelationshipAnamnesisStorage.ts` / `RelationshipAnamnesisPostgres.ts`; **writer reachability not traced**. Read by `RelationshipMemoryService` into the live prompt path as `essence`. ⚠️ *If those writers are live and the essence is system-synthesized, this is a second Act 5 candidate.* **Not asserted.** |
| Whether an attribution changes consequential behavior (Act 3) | Requires model execution; none performed |
| `breakthrough_moments` | 11 external callers, reaches prompt; member-marked gesture per project record, so likely evidence — **provenance not traced in this census** |
| `member_relationships` note text | System-authored (`'Auto-created by relational observer…'`); member-visible; not classified |
| Sibling routes beyond the three traced | Not exhaustively enumerated |

---

## 5. Summary

| Act | Classification | Witness split |
|---|---|---|
| 1 Notice | **CONFORMS** | — |
| 2 Hypothesis | **CONFORMS** (at formation) | — |
| 3 Operational use | **AMBIGUOUS** | external: conforming · substrate: **unbounded at the inquiry/treatment line** |
| 4 Introduction | **CONFORMS** (stricter than canon) | — |
| 5 Persistence | 🔴 **NONCONFORMS** | external: silent · substrate: **30-day durable attribution** |
| 6 Promotion | **AMBIGUOUS** | no promotion mechanism; two adjacent findings |

⭐ **The census's own shape is the argument for two witness surfaces.** Read only as external
witness, this runtime looks clean: MAIA is instructed never to name a pattern, and does not.
The single 🔴 and both AMBIGUOUS calls are **only visible in the substrate.**

---

## 6. Standing

```
ACT 4                     ✅ COMPLETE — read-only
NONCONFORMS               1 (Act 5 · durable attribution · reachable · reproducible)
AMBIGUOUS                 2 (Act 3 · Act 6)
CONFORMS                  3 (Acts 1, 2, 4)
LATENT HAZARDS            2 dormant writers with live readers
UNVERIFIED                5 items, named
SEVERITY SCORING          ⛔ NONE — would begin intervention planning
REPAIR PRIORITY           ⛔ NONE — same reason
REPAIR                    ⛔ NOT AUTHORIZED · ⛔ NOT PERFORMED
SCHEMA · PROMPTS · GUARDS ⛔ UNTOUCHED
relationalObserver        ⛔ UNTOUCHED
CANON                     ⛔ UNCHANGED — no doctrine authored, no terminology unified
BENCHMARK · INKLING       ⛔ NONE
PRODUCTION                ⛔ UNTOUCHED
```

> ⛔ **Discovery of a violation does not authorize its repair.** The Act 5 finding is stated
> with a reproduction path so that a future authorized act can falsify it independently
> rather than inherit it on this census's word.
