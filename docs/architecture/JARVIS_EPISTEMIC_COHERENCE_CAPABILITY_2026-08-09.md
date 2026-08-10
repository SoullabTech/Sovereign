# JARVIS — Epistemic Coherence Capability (Assessment + Record)

**Date:** 2026-08-09 · **Authority:** founder architectural mandate ·
**Mode:** ASSESS + RECORD ONLY — no implementation, no knowledge graph, no Obsidian
rewrite, no production mutation, no autonomous remediation, no worker routing changes,
no Claude adapter.

**Sequencing note (directive §21):** MVJ Unit 5 (canonical Work Unit reconciliation) is
**complete** as of this document — `docs/architecture/BUILDER_OS_CANONICAL_WORK_UNIT_2026-08-09.md`,
37/37 proofs, 256/256 full regression, committed. MVJ Unit 6 (Claude as a governed worker)
is **not started** — founder-gated, correctly not implemented here. This assessment
therefore proceeds against a real Unit 5 substrate, not a hoped-for one, and explicitly
does not build anything Unit 6 would own.

---

## 1. The mandate, restated precisely

> JARVIS does not merely retrieve information about AIN. It maintains disciplined
> awareness of what kind of claim each piece of information can support.
>
> Keep Intended AIN, Implemented AIN, and Lived AIN in intelligible relationship while the
> system changes.

This is an **enduring responsibility**, not a feature. What follows assesses how much of
it the existing substrate already discharges versus how much remains prose-bound — it does
not build the destination.

---

## 2. The three realities — already lived, not new

This session is itself evidence the distinction already operates, informally, at high
cost:

| Reality | Question | Example already encountered this session |
|---|---|---|
| **Intended** | What is AIN authorized to be? | The Master Directive, founder rulings, `docs/canon/*`, the Rehabilitation Map's disposition column |
| **Implemented** | What exists in code? | `ain-delegate.sh` existed in the working tree but **had never entered git** — implemented, but not durably so |
| **Lived** | What is actually happening? | `member_daily_anchors` holds 0 rows despite the feature being "verified LIVE" on 2026-07-03 — the July 2026-08-09 founder correction on that exact point is the canonical example of collapsing Implemented into Lived |

The corpus already names this collapse as a recurring failure mode (`"LIVE" means code +
schema deployed and exercised; it does not mean in use by members` — CLAUDE.md, 2026-08-09
correction). **This mandate generalizes an already-learned lesson**, it does not introduce
a new one.

---

## 3. Source authority is typed — already partially enforced, not yet systematic

The **Witness Jurisdiction Corollary** and the **Measurement ⊥ Governance ⊥
Implementation** rule (both ratified canon, cited throughout `orient.mjs`'s design) are
exactly this principle, already constitutionalized:

- *what currently exists?* → production/runtime is the strongest witness
- *what may exist?* → founder ruling/canon is the strongest witness, production has no
  standing on this axis
- *how does it become?* → executable gate + committed artifact outranks prose procedure

`/orient`'s packet classification (`confirmed | drifted | contradicted | not_measurable |
governance_witness`) is a **working instance** of typed source authority for exactly one
artifact class (continuation packets). It does not yet generalize to canon docs, code, or
production evidence as a first-class typed-witness system — but the *rule* it enforces is
already ratified, not invented by this document.

---

## 4. Canonical truth vs navigation — already the operating discipline for this session's own output

Every evidence doc produced across Units 1–5 this session cites its sources by path
(`docs/ops/CLAUDE_CODE_RESET_WINDOW_ATTRIBUTION_2026-08-09.md`, `AIN_RESULT_CONTRACT.md`,
etc.) rather than restating their content inline — this is the "reference, don't replace"
discipline already in force. No generated summary in this session has been treated as more
authoritative than the file it summarizes. Obsidian's actual current role is **unassessed
in this session** — no investigation of the existing Obsidian setup was performed here, and
this document does not claim to know its current state (see §9.N).

---

## 5. Epistemic states — recovered vocabulary, not invented

**Existing, ratified, and NOT duplicated here:**

- The proof ladder `EXISTS → CORRECT → SECURE → CONNECTED → REACHABLE → EXERCISED →
  OBSERVABLE → SUSTAINED` — cited throughout the Rehabilitation Map and this session's own
  evidence docs (e.g. Horizon III's own honest status: *"EXISTS ✓ CORRECT ✓ CONNECTED ✓
  REACHABLE ✓ · EXERCISED ✗ OBSERVABLE ✗ SUSTAINED ✗"*).
- The Rehabilitation Map's disposition vocabulary: `PRESERVE · RECONNECT · REPAIR ·
  RECONCILE · CONSOLIDATE · COMPLETE · DEPRECATE · BUILD · HOLD`.
- MVJ Unit 5's Work Unit lifecycle (§4 of that record): `proposed/ready, blocked,
  needs_founder, claimed/running, ready_to_integrate, integrated, failed, contended`, plus
  the preserved-but-unreachable deployment states.

**Not yet reconciled with each other.** These are three genuinely different vocabularies
answering three different questions (capability status · disposition-of-a-repair ·
one-Work-Unit's-lifecycle) — this document does not merge them, and flags that a future
unit doing so would need to justify *why* rather than assume convergence is free.

---

## 6. Current-state-must-be-recomputable — the strongest existing substrate

This is where the system is genuinely furthest along, because it is exactly what
`/orient` + Unit 5's `work-unit.mjs` already do:

| Claim | Recomputed from | Proven this session |
|---|---|---|
| Current branch/SHA/dirty state | Git, live | `/orient`, 33/33 |
| Current Work Unit lifecycle | packet + session registry + result(s), live | Unit 5, 37/37 — proven against the *real* `proving-case-add-fn` |
| Current Builder ownership/capacity | `session.mjs` registry, live | Horizon III, 54/54 |
| Current local request rate | transcript files, live | `rate.mjs`, 24/24 |
| Current production SHA | `docker exec maia-sovereign printenv GIT_COMMIT` | documented in CLAUDE.md, not re-verified in this session |
| Current callers/importers | deterministic grep/ctx_execute | used constantly this session, never systematized into a queryable index |

**This is READY NOW as a pattern, PARTIAL as coverage** — it works for exactly the objects
Units 1–5 built (Work Units, Builder sessions, git state, local rate). It does not yet
extend to capabilities, canon, or production schema as first-class recomputable objects.

---

## 7. Contradiction taxonomy — named, not yet detected automatically

Every category in the mandate's §6 has a **real historical instance already on record in
this repository**, discovered by a human/LLM audit, never by an automated check:

| Category | Real instance already on record |
|---|---|
| DESIGNED BUT ABSENT | RFI/UFI — held directions with no runtime authority, per `SOVEREIGNTY_LAYER_STATE` |
| IMPLEMENTED BUT UNWIRED | `memory_links` table + store exist, 0 importers, 0 rows |
| WIRED BUT UNEXERCISED | Horizon III concurrency governance itself, right now — *"not yet exercised under real multi-lane load"* |
| DOCUMENTATION DRIFT | The Daily Anchor "verified LIVE" correction — 0 production rows despite the July claim |
| STALE EVIDENCE | The exact failure mode `/orient`'s `VERIFIED never survives a SHA change` rule exists to prevent |

**Conclusion: the taxonomy is empirically validated, not speculative** — every category has
a real, named instance. **Detecting these automatically is entirely unbuilt.** Every
instance above was found by a directed human/LLM investigation, not a running check.

---

## 8. Worker-proposal governance — a role this session performed manually, repeatedly

This session's own conduct is the closest existing evidence of what §7 (worker-proposal
governance) would formalize:

- When asked to reconcile Attempt A's classification, this session did **not** silently
  accept "worker incompetence" — it re-derived the claim from Kimi's corroborating
  evidence and reclassified with a stated reason (harness permission failure).
- When Unit 3's convergence proof exposed a path-canonicalization defect, it was fixed and
  **regression-locked**, not silently patched over.
- When U4 failed on first run, the response was root-cause the counter logic, not weaken
  the assertion.

**This is the pattern §7 wants automated. It does not exist as a checkable mechanism today
— it exists only as this session's disposition, which does not persist or generalize
beyond one conversation.** That gap is real and is the actual reason this mandate exists.

---

## 9. Bounded substrate assessment (A–O)

| | Capability | Status | Basis |
|---|---|---|---|
| A | Canonical-source resolution | **PARTIAL** | Paths are citable and stable; nothing resolves "capability X" → governing doc set automatically. `scripts/memory/RESOLUTION_CONTRACT.md` solves an adjacent, narrower problem (memory `[[link]]` resolution), not this one. |
| B | Git/current implementation inspection | **READY NOW** | Deterministic, exercised constantly this session (`git`, `grep`, `ctx_execute`). |
| C | Production-state inspection | **PARTIAL** | Documented, governed SSH/SQL patterns exist (CLAUDE.md ops diagnostics); nothing generalized or automatic. |
| D | Proof-ladder/status representation | **PARTIAL → READY for Work Units specifically** | Unit 5's `deriveLifecycle` is a real, proven instance for one object class; the 8-rung capability ladder exists as vocabulary only, computed by hand in every audit. |
| E | Founder ruling lookup | **PARTIAL** | Rulings are real, dated, path-addressable; no index, grep-only discovery. |
| F | Rehabilitation Map lookup | **PARTIAL** | The Map is real structured markdown; not machine-queryable — reading it means reading prose. |
| G | Decision Docket lookup | **PARTIAL** | Same shape as E/F — structured by convention, not by schema. |
| H | Capability → implementation references | **MISSING** (general) | Present per-row for the specific capabilities already audited into the Rehabilitation Map; not systematic. |
| I | Capability → production evidence references | **MISSING** (general) | Exists as one-off SQL per audit; not queryable as a standing index. |
| J | Contradiction detection | **MISSING** | §7 above — every known instance was found by directed investigation, never by a check. |
| K | Staleness detection | **PARTIAL** | Real for one object class (`/orient`'s SHA-scoped `VERIFIED` invalidation); not general. |
| L | Compact Work Packet generation | **PARTIAL — building block READY, generator MISSING** | Unit 5 supplies the exact target shape (`AIN_WORK_PACKET_CONTRACT.md` + `work-unit.mjs`). Nothing yet turns *"continue capability X"* into a populated packet. |
| M | Worker-proposal governance check | **MISSING** | §8 above — performed manually this session, not mechanized. |
| N | Obsidian projection | **UNASSESSED** | Not investigated in this session. This document does not claim to know current Obsidian state and explicitly declines to guess. |
| O | Temporal verification metadata | **PARTIAL** | Real for continuation packets (`/orient`'s drift-probe model); Work Unit results carry only relative `duration_s`, not absolute timestamps (a named Unit 5 limitation, §9.4 of that record). |

**Honest summary:** the *deterministic-recomputation* half of epistemic coherence (B, D
for Work Units, K for packets, O for packets) is real and proven. The *cross-reality
linkage and contradiction-detection* half (H, I, J, M) is entirely unbuilt — every instance
of it this session performed was manual.

---

## 10. The smallest useful vertical slice

The directive's candidate slice (*"continue capability X" → resolve → packet*) is
evaluated, not assumed, against the actual A–O results above:

**It is not yet buildable end-to-end.** The chain requires H (capability → implementation)
and a working F/G query layer, both **MISSING/PARTIAL**, before "resolve capability" can be
anything but an LLM re-reading prose — which is the exact expensive pattern this mandate
exists to reduce.

**What genuinely is buildable now, using only READY/PARTIAL-strong substrate:**

> **Work-Unit-scoped packet regeneration**: given an *existing* `work_unit_id` (not yet a
> free-text capability name), deterministically reconstruct a compact, current Work
> Packet from `work-unit.mjs status` — objective, authority, scope, acceptance criteria,
> current lifecycle, latest result, current git SHA vs. the packet's `canonical_sha` (drift
> check) — without any LLM re-derivation.

This is strictly narrower than the directive's candidate slice (it starts from a known
Work Unit id, not a founder utterance), but it is the part of the chain that is **actually
ready**, and it is exactly the missing half of what `ain-delegate.sh claim` +
`work-unit.mjs status` already almost do separately. Capability-name resolution (turning
*"MAIA memory"* into a `work_unit_id` or a Rehabilitation Map row) is the genuinely missing
piece and depends on **H** — not yet buildable without it.

---

## 11. Context/cost avoided by the slice above, if built

Measurable, not invented:

- A fresh Claude session re-orienting on a known Work Unit today re-reads the packet, the
  session registry, and the result by hand — roughly the token cost of 3–4 tool calls per
  orientation (observed pattern throughout this session: `cat packet.json`, `session.mjs
  status`, `cat result.json`, `git log`).
- `work-unit.mjs status --json` already collapses this to **one deterministic call**,
  proven in §6 of `BUILDER_OS_CANONICAL_WORK_UNIT_2026-08-09.md` against real evidence.
- No dollar figure is claimed. The concrete, measurable unit is: **N tool-call round-trips
  of manual reconstruction → 1 deterministic query**, for every session that resumes a
  known Work Unit rather than starting one.

---

## 12. Dependencies

- **MVJ Unit 5**: satisfied — this assessment depends on the canonical Work Unit existing,
  and it does.
- **MVJ Unit 6** (Claude as governed worker): **not required** for the slice in §10 — that
  slice is read-only query, not execution. It **is** required before any packet generated
  this way could be *automatically* handed to Claude-as-worker rather than reviewed by a
  human first.
- **Capability → implementation index (H)**: required before the directive's originally
  proposed slice (free-text capability name → packet) is honestly buildable. Not started.
- **Obsidian assessment (N)**: required before any Obsidian-projection work is authorized.
  Not started, not assumed.

---

## 13. Exact next bounded unit, when authorized

Two independent candidates, deliberately not both proposed at once:

1. **Work-Unit-scoped packet regeneration** (§10) — smallest, uses only proven substrate,
   no new investigation required, directly reduces the manual-reconstruction pattern
   observed in every unit this session.
2. **Capability → implementation reference index (H), narrowly scoped** — e.g. extend the
   Rehabilitation Map's existing per-row evidence into a machine-readable sidecar for the
   ~10-20 capabilities already audited, rather than a general index over all of AIN. This
   is the genuine prerequisite for the directive's original candidate slice, kept
   deliberately small per §14/§16 of the mandate (*"do not build a giant knowledge graph"*).

Neither is authorized by this document. Both require their own founder gate, per §22 of
the mandate (*"STOP... No broad implementation"*).
