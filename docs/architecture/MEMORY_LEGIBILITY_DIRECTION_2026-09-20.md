# Memory Legibility Direction

**Status**: Directional architecture document. **Not canon. Not a lane. Not authorization.**
**Date**: 2026-09-20
**Altitude**: three mechanisms harvested from an external memory agent, translated into MAIA's own law, and resolved into one question that is already open and deliberately unanswered.
**Category** (six-category typology): Cat 1 — preserved direction. Held, not authorized.
**Source survey**: `docs/research/EXTERNAL_SUBSTRATE_SURVEY_2026-09-20.md` §2.1.

---

## What this document is

Three mechanisms from **memanto** (`moorcheh-ai/memanto`, MIT wrapper over a vendor engine — refused as a
dependency in the survey) were admitted as design inputs. This document does the translation: what each
mechanism actually is, what MAIA already has in its place, where the real gap is, and what may and may not
transfer.

Same posture as `TEMPORAL_MEMORY_DIRECTION_2026-09-06.md`: frozen reference, not standing permission. If a
future PR cites this as authority to ship a surface, a schema, a retention policy, or a member-facing memory
view, that PR has misread it.

## What this document is NOT

- not authorization to open a lane
- not a build plan for Episodic Phase 2 (still unauthored)
- not a decision on Clause 2 refinement (c) — it is *evidence for* that decision
- not a change to `confidenceDecay`, the Cut-1 SQL, `valid_to` semantics, or any retrieval behaviour
- not an adoption of memanto's retention model, which §3.2 finds **unlawful here as written**

## The governing sentence

> **Traceability answers the operator. Legibility answers the member. MAIA has built the first and left the
> second unwired.**

---

## 1. The correction that reframed this harvest

The survey (§2.1, §3) asserted that memanto's labelled-expiry idea *"bears directly on the open Cut-1
traceability non-conformance."* **That is stale and is corrected here.**

`TEMPORAL-MEMORY-CUT1-TRACEABILITY-01` **closed in production on 2026-09-16**. Verified in the repository
2026-09-20: `lib/memory/cut1Trace.ts` is live and wired at `lib/memory/MemoryBundle.ts:270` and `:295`.
`CUT1_OBSERVED_NONVECTOR_SQL` computes the live score and the decay-neutral score **in the same
`MATERIALIZED` pass**, takes both top-12 sets, and persists them to `memory_cut1_trace_runs` per retrieval,
keyed by `retrieval_id` with `ON CONFLICT DO NOTHING` and an equivalence check that throws
`Cut1TraceIdempotencyConflict` rather than silently accepting a divergent rewrite.
`deriveDecayExcludedIds()` returns neutral-top members absent from live-top.

**Cut-1 traceability is satisfied.** The earlier framing is withdrawn, not deleted.

⚠️ **One scope note, so the instrument is not later over-read.** `deriveDecayExcludedIds()` is bounded to
the neutral top-12. It records memories **decay displaced across the boundary** — not the full excluded pool
(*eligible − 12*, unbounded above). That is correct scoping, not a defect: a memory ranking outside *both*
top-12s was excluded by the cutoff, not by decay, and attributing it to decay would be false. But the trace
is **a decay-displacement record, never a complete exclusion log**, and must not be cited as one.

**What the correction does to the harvest is make it sharper.** The question is no longer *can we trace
this?* — we can. It is: **traceable to whom?**

---

## 2. Current state, verified in-repository 2026-09-20

| Capability | memanto | MAIA | Reading |
| --- | --- | --- | --- |
| Per-memory expire / restore | `[EXPIRED]` state + `memory restore` | `valid_to = NOW()` / `valid_to = NULL` in `PreferenceConfirmationStore.record()` | **MAIA has it, and MAIA's is stricter** — see §3.1. |
| Expired memory still surfaces in recall | Yes, labelled with retirement reason | **No.** Cut-1 SQL filters `AND (valid_to IS NULL OR valid_to > NOW())` — an expired memory disappears from recall entirely | The one real divergence. Contested; see §6. |
| Per-turn record of what ranking excluded | None | `memory_cut1_trace_runs` (live_top + neutral_top + eligible_count + captured_at, bound to `message_id`) | **MAIA is ahead.** memanto has no per-turn ranking record at all. |
| Decay may set validity | Yes — policy-executed expiry by elapsed time | **Structurally impossible.** Every `valid_to` write in the codebase is in `PreferenceConfirmationStore.record()` and member-originated | Clause 1 satisfied structurally, not by discipline. |
| Retention declared where a member can read it | `~/.memanto/policies/<agent>.yaml` | **Nothing.** The live `0.40` decay weight has no member-facing expression | Real gap — but see §3.2 on what may transfer. |
| Point-in-time query interface | `--as-of` | Raw material only: `memory_cut1_trace_runs.captured_at` + the two ranked sets. No query surface | Partial substrate, no interface. |
| Member-facing route to any of this | CLI, first-class | **Zero.** Built and unwired — see below | The finding. |

**Built and unreachable, confirmed by search 2026-09-20:**

- `components/memory/PreferenceConfirmation.tsx` — exported through `components/memory/index.ts`,
  **imported by no page or route**.
- `app/api/memory/stale-preferences/route.ts` — exists, GET and POST, authenticated by `x-user-id`.
  **No member-facing caller.**
- `shouldPromptForConfirmation()` (`lib/memory/confidenceDecay.ts:199`) — **zero callers**; the only
  occurrence in the repository is its own definition.

The detect→ask surface is **built end to end and connected to nobody.** This was routed out as observation
(4) on 2026-09-15 and remains unrepaired and unowned.

---

## 3. The three mechanisms, translated

### 3.1 Labelled retirement — *the one where MAIA is already stronger, and still has the gap*

**memanto's mechanism.** A retired memory becomes `[EXPIRED]`, keeps its content, **still surfaces in
recall carrying its retirement reason**, and `memanto memory restore` puts it back. Deletion is a separate
explicit act.

**What MAIA already has, and why it is better.** `PreferenceConfirmationStore.record()` implements
`expired` / `restored` as `valid_to = NOW()` / `valid_to = NULL`, plus an asymmetry memanto does not have:
a `confirmed` or `updated` action carries `AND (valid_to IS NULL OR valid_to > NOW())`, so **a confirmation
may refresh a live record but may not resurrect a member-withdrawn one**; the refusal is reported as
`withdrawn_by_member` rather than silently no-op'ing. The in-code law is exact:

> *Correction is not temporary disagreement. New evidence may create a new perception; it may not resurrect
> the old assertion.*

memanto's `restore` is symmetric and has no equivalent protection. **Nothing to import here.**

**The actual gap.** Two of memanto's three properties are absent: the retirement **reason** is not carried
on the memory (it lives in the confirmation ledger, not on the row), and an expired memory **vanishes from
recall** rather than surfacing labelled.

**What transfers:** the principle that *a state change to a memory should be legible at the point of recall,
carrying why*. **What does not transfer:** memanto's symmetric restore, and any assumption that surfacing an
expired memory is obviously correct — see §6.

### 3.2 Retention as declared law — *the form transfers; the content is unlawful here*

**memanto's mechanism.** `retention: {context: 7d, event: 30d, preference: never}` plus named rules that pin
against the table, first match wins, in a file the operator reads and edits.

**⛔ As written, this is forbidden in MAIA.** A retention table keyed on elapsed time **is a timer setting
validity**, which Clause 1 prohibits absolutely: *decay may never determine validity*, and the ratified
temporal law holds that *the system never sets `valid_to` from a timer*. MAIA satisfies this structurally —
there is no sweep, no job, no timer anywhere. Importing a retention table would be the single most
destructive thing on this list: it would reintroduce, as a feature, the exact mechanism the temporal law
exists to forbid.

**What transfers is the form alone, and it is genuinely valuable:** *the policy governing a member's memory
should be expressed as something the member can read, not only as a coefficient inside a scorer.* Today the
live Cut-1 ranking weights elapsed time at `0.40` and the member's own explicit confirmation at
`0.15 × 0.15 = 0.0225` — a ratio previously measured at ≈17.8:1 — and **no member has ever been shown either
number, or told that such a trade-off exists.**

**If this form is ever built, it may govern availability and salience only. It may never govern validity.**
That boundary is Clause 1 and is not negotiable by a policy file.

### 3.3 Axis-explicit point-in-time query — *substrate exists, interface does not*

**memanto's mechanism.** `--as-of` reconstructs past state, including memories expired since, with the
temporal axis named in the query itself.

**What MAIA already has.** `memory_cut1_trace_runs` carries, per retrieval, `captured_at`, `eligible_count`,
`live_top`, `neutral_top`, bound to `user_id` / `session_id` / `message_id`. That is literally *what was
available at turn X, and what would have been available with decay neutralized* — an as-of index for Cut 1,
in production.

**Three honest limits.** It covers **Cut 1 only** (not Cut 2, not the text path beyond what `MemoryBundle`
sees); it begins **2026-09-16** (14 traces at the closure witness — there is no history before the
instrument); and it is **operator-readable only**, with no query interface over it.

**What transfers:** the ruling we already made — *temporal recall must identify the axis it resolved on* —
should be visible **in the interface**, not only honoured inside the resolver. memanto is independent
confirmation that putting the axis in the query surface is the natural place for it.

---

## 4. The synthesis — these are not three ideas

Labelled retirement with a restore act, retention a member can read in advance, and an as-of query a member
can ask afterward are **three components of one surface: the member's route back**.

That surface is **Clause 2 refinement (c)** — *decay may exclude only where the member has a live route
back* — which was offered on 2026-09-15 and **explicitly NOT chosen**, on the stated ground that it is
*"more specific than the temporal law needs, and dependent on surfaces not yet adjudicated."*

**memanto has independently built (c).** Not as ethics — as a product decision about agent memory. That it
converged there from an entirely different problem domain is the finding worth keeping.

**And the reason (c) was deferred has partly dissolved.** The surfaces are no longer un-built:

| Component of (c) | Status |
| --- | --- |
| Expire / restore semantics | ✅ **Exists**, and stricter than memanto's |
| Durable record of what ranking excluded | ✅ **Exists** in production (`memory_cut1_trace_runs`) |
| Detection of memories needing member attention | ✅ **Exists**, zero callers (`shouldPromptForConfirmation`) |
| API to list them and record a member act | ✅ **Exists**, no member caller (`/api/memory/stale-preferences`) |
| UI to present one | ✅ **Exists**, mounted nowhere (`PreferenceConfirmation.tsx`) |
| A route connecting a member to any of the above | ❌ **Does not exist** |
| Retirement reason carried at recall | ❌ Does not exist |
| As-of query interface | ❌ Does not exist |

**Four of seven are built and unwired.** Refinement (c) is closer to adoptable than it was when it was
deferred — and *that*, not any borrowed mechanism, is what this harvest contributes.

⛔ **This is not a recommendation to adopt (c).** It is the cost information that a ruling on (c) needs, and
it was not available on 2026-09-15.

---

## 5. What is owed before (c) could be ruled on

1. **The Invariant question in §6 must be answered first.** It can invalidate the whole surface.
2. **A census of the unwired surfaces** — are they correct, or merely present? Three objects built and never
   called have never been exercised; their existence is not evidence that they work, and the S3 lane's own
   discipline says a built-but-unreached object is exactly where wrong assumptions survive.
3. **Scope ruling.** `/api/memory/stale-preferences` operates on preference-type developmental memories;
   Cut-1 decay operates on all developmental memories (the ACT 2 population was entirely
   `memory_type = 'pattern'`). **These are not the same set**, and a member surface that silently conflates
   them would misrepresent what it is showing.
4. **A falsifier for the central risk** — a member-facing memory surface that increases the member's sense
   of obligation to curate MAIA's memory has inverted the sovereignty relation. *The route back must not
   become homework.*

---

## 6. The contested question, returned rather than answered

**Should an expired developmental memory surface in recall, labelled, rather than vanish?**

**For** — Clause 2 requires exclusion be *traceable and recoverable*; "recoverable by an operator SQL query"
is a weaker reading than "visible to the person whose life it is, at the moment it would have been used,
with a restore act available." memanto shows the stronger reading is buildable.

**Against, and it is grounded in our own law** — `valid_to = NOW()` on a developmental memory is
**member-originated withdrawal**. Re-presenting it, even labelled, is MAIA surfacing something the member
yielded. That engages the **Right to Remain Unpossessed** and the in-code law that *new evidence may create
a new perception; it may not resurrect the old assertion.* A label is not obviously enough to keep
*surfacing* from becoming *resurrecting*.

**The distinction that probably resolves it, offered and not taken:** memanto's expiry is **policy-caused**
— the system retired it, so showing the member is accountability. MAIA's expiry is **member-caused** — the
member retired it, so showing it back may be intrusion. If that asymmetry holds, the answer is: labelled
resurfacing is appropriate **only for exclusions the system caused** (decay displacement at Cut 1, which
`memory_cut1_trace_runs` already records) and **never for withdrawals the member authored**.

⛔ Not ruled here. Founder question.

---

## 7. Provenance

**Verified by reading the repository 2026-09-20:** `lib/memory/cut1Trace.ts` (whole file),
`lib/memory/MemoryBundle.ts:25-26,270,295`, `lib/memory/stores/PreferenceConfirmationStore.ts:70-125`,
`app/api/memory/stale-preferences/route.ts`, `lib/memory/confidenceDecay.ts:199`, and corpus searches for
callers of `PreferenceConfirmation`, `shouldPromptForConfirmation`, `recordCut1Trace`.

**Taken from memanto's own documentation, not its source:** the `[EXPIRED]` label, retention YAML format,
and `--as-of` behaviour. These are claims about memanto's behaviour, verified against nothing. **They ground
no decision here** — each is used only to prompt a question answered from MAIA's own substrate.

**Not done, and therefore not claimed:** no production read, no database query, no runtime observation. §2's
claims about production standing are inherited from the closure records, not re-witnessed.

**Nothing in this document was executed, wired, migrated, or deployed. Production untouched.**
