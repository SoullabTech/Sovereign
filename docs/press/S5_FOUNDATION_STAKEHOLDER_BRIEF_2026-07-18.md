# What We Have Now: S5 Foundation — A Brief for the People Around MAIA

**Date**: 2026-07-18 · **Status**: Live in production, evidence-backed
**Audience**: consultants, marketers, developers, and testers working with MAIA
**Claim discipline**: everything in the "Live" sections below has production evidence
behind it (see the evidence trail at the end). Nothing in "Not yet true" may be
presented as current. *We do not tell tomorrow's story as if it were today's.*

---

## The one-paragraph version

On July 18, 2026, S5 Foundation entered production. Provenance minting, restore
governance, and constitutional memory became enforceable properties of the platform
itself. For the first time, MAIA can structurally account for why she knows what she
knows, under what conditions memory may persist, and under what conditions forgotten
content could return. Trust became infrastructure, and memory became constitutional.

## What became true (Live — production-verified)

1. **Consent is per-exchange, enforced by the database.** The privacy posture governing
   each conversational exchange is resolved and recorded server-side as it happens. A
   Sanctuary exchange is *structurally unable* to enter memory — the database refuses
   the write regardless of what any application code does.

2. **Every remembered turn knows its origin.** Each remembered conversation turn
   carries a server-minted, immutable record: who created it, what generated it, what
   consent posture governed it. A write without that record is refused at the storage
   layer — even raw SQL cannot create unattested memory.

3. **Forgetting survives backups.** Consent-driven deletions leave content-free
   markers (manifests and tombstones). Restoration is a governed operation that honors
   them: a tombstoned row re-inserted by a restore is refused, with evidence. Proven
   against production-generated artifacts on July 18.

4. **The past is honestly labeled.** The pre-existing corpus (37,839 conversation
   turns, 142 memory atoms) is explicitly marked *unknown provenance* rather than
   quietly relabeled — and unknown-provenance material is permanently excluded from any
   collective use. The platform manufactures no false certainty about its own history.

5. **Replay is distinct from creation.** The system now distinguishes a new memory
   being created from a legitimate historical memory returning under governance. An
   ungoverned replay of historical data fails loudly at the database.

## What this means, per audience

**For consultants and marketers.** The differentiating sentence is: *most platforms
bolt consent onto memory; here, memory is impossible without consent's paper trail.*
That claim is Live, not aspirational — it has production evidence. Say "the database
refuses it," not anything mystical; mechanism, never mythology. Do not claim
reflection, insight generation, or collective intelligence — those are deliberately
frozen (see below), and saying so honestly is itself the credibility.

**For developers.** The pattern to internalize: no layer trusts a caller. Posture is a
nominal class resolved once per request; provenance is minted server-side at the
store; the database gates verify independently; restores are governed. Before any new
durable write, apply the design test in the constitution
(`docs/architecture/S5_PROVENANCE_CONSTITUTION_2026-07-18.md` §10): can it answer the
seven questions at creation, server-side? Does the store refuse without them? Does its
deletion leave a manifest a restore must obey?

**For testers.** Observable behaviors you can verify: a Sanctuary exchange produces
zero rows in any content lane (and a `[SANCTUARY] write refused` marker); an ordinary
exchange produces turns with `posture_at_creation='normal'` and a complete provenance
record; attempts to write unattested rows produce loud `[PROVENANCE] mint failed`
errors, never silent success. If you ask MAIA how memory works here, her answer should
match this brief — she carries these facts as authored platform knowledge.

## What is NOT yet true (do not claim)

- **Reflection (gold reflection) is frozen** — by ruling, until provenance governance
  extends further. *"The system can only reflect safely if it first knows exactly what
  it is allowed to remember."*
- **Collective intelligence does not exist** — collective eligibility flows only from
  member acts, and no collective surfaces are built.
- **Not every memory lane is fully wired yet.** Turns and kept atoms are fully
  governed; episodic side-writers, theme signals, summaries, and async lanes are in
  the propagation ledger, in order. S5 *Foundation* is complete; S5 is not.

## The arc (how we got here)

```text
Sanctuary incident (June 14)         — content persisted that a promise said would not
Governance investigation             — honest audit, member-first remediation
Discovery of provenance              — "no durable object without knowing what governed its creation"
S5 Foundation (July 18)              — enforcement moved into the database itself
Production proof (July 18)           — migration, live minting, and restore governance verified live
```

The phase ahead is *Foundation → Propagation → Completion*, not
*Uncertainty → Discovery → Architecture*. That is a different kind of work.

## Evidence trail (for anyone who wants to check)

- Constitution: `docs/architecture/S5_PROVENANCE_CONSTITUTION_2026-07-18.md`
- Implementation + deployment evidence: `docs/architecture/S5_PROVENANCE_IMPLEMENTATION_2026-07-18.md`
- Merge-gate rehearsal (proofs A–E, incl. the two defects the process itself caught):
  `docs/architecture/S5_MERGE_GATE_REHEARSAL_2026-07-18.md`
- Refusal registry: R20 (forgotten things do not silently return) and R22 (no durable
  object without provenance) — `tests/constitutional/refusal-registry/`
- Founder's register note: *"July 2026 marked the transition from aspirational
  provenance to enforceable provenance. … This was the moment trust became
  infrastructure."* — and its companion: *"This was the moment memory became
  constitutional."*
