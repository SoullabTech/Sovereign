# AIN OS — Regulatory Capacity for Platform-Builder Clients
**Status:** CANDIDATE (2026-07-09, rev 2 after review) — names existing capacity; does NOT open the deployment-tenancy gate (Cat 1 HELD per `project_ain_os_field_tenancy_candidate` / open-source strategy). Not legal advice; no external certification claimed.
**Thesis:** what a client building a platform on AIN OS inherits is not a feature set but **regulatory capacity** — an emergent property of the constitutional architecture as a whole. *Capacity*, not *compliance*: compliance is relative to a particular regulation and must be rewritten when frameworks change; capacity is architectural and survives changing law. Every claim below is anchored to a behavior verified in production or a structure present in the repo, and this document applies that standard to itself (see Known Gap).

## The two-layer structure

**Layer 1 — Constitutional Capacity (the platform; invariant).** Properties that exist whether or not anyone has heard of HIPAA, the AI Act, or a licensing board: authority is distributed rather than centralized · consent is explicit and versioned · provenance is preserved · refusal is executable · interpretation remains human-owned · deployments inherit constitutional constraints · auditability is intrinsic · governance is testable.

**Layer 2 — Regulatory Mapping (the deployment; per-context).** A given deployment maps capacities onto its regulatory frame:

| Constitutional Capacity | Example Regulatory Mapping |
|---|---|
| Refusal Registry | AI-Act-style risk controls |
| Consent Ledger | HIPAA-style authorization |
| Provenance axes | AI transparency requirements |
| Jurisdictional separation | Scope-of-practice |
| Append-only ledgers | Audit evidence |

Regulations evolve; the capacities don't. Mapping is per-deployment counsel work — a different act, with different liability, never claimed here.

## The core claim — stated at two tiers, deliberately

The platform is **constitutionally incapable** of certain classes of behavior, and those constraints are executable, versioned, and independently verifiable. ("Constitutionally," not merely "structurally": the limitation is part of the governing architecture that future implementations inherit — an obligation, not an accident of today's codebase.)

A hostile reader will press on "incapable," so this document splits it before they do:

- **Tier 1 — Structural incapacity (deterministic; provable by absence).** The code path does not exist and a test asserts its absence: append-only triggers (UPDATE/DELETE physically blocked), FK boundary integrity (orphan field-links rejected by the schema — verified live 2026-07-08), the registration profile carrying **no** `dominant_element` field (INV-3 conformance test asserts the key's absence), write-once columns. This is physics.
- **Tier 2 — Versioned, test-guarded refusal (probabilistic layer, guarded behavior).** Anything governing generative output is a guard over a probabilistic component: the CI guards prove refusals execute under tested conditions — continuously, citably — not that a model layer can never emit a forbidden token. This is tested discipline, and it is stated as such.

The two-tier honesty is itself the differentiator: *"we know precisely which of our guarantees are physics and which are tested discipline, and here is the ledger of each"* survives an adversarial live demo; an undifferentiated "incapable" does not.

**Tier 1 is perishable where it rests on absence — and the tier assignment is therefore itself a guarded invariant.** Any Tier-1 status earned by *absence* (missing key, missing consumer, missing code path) holds only until someone builds the missing piece — and the builder will not know they are demoting a compliance claim. Rule: **every Tier-1 entry names its absence-dependency, and the evidence pack asserts those absences on every run**, so a wiring crossing that breaks one fails loudly instead of silently downgrading this document. Worked example: R17 is Tier-1-protected today *only because no case→field reader exists*; the moment `loadAdmissibleCaseCrossings` wires in, R17's protection becomes Tier 2 (guard + ledger) by design — that transition must be an explicit re-tiering event, not an accident.

**The refusal ledger, precisely:** R01–R11 and R13–R16 carry executable CI guards (`tests/constitutional/refusal-registry/`, 15 guards). **R17** (case→field crossings) is *Proposed*: substrate built and locally verified, deliberately unwired — absence-dependency: *no case→field reader* (grep-confirmed). **R12: reserved-vacant** — the number was skipped in assignment order and is held vacant rather than backfilled, because refusal IDs are stable append-only identifiers; the next new refusal takes R18. Stated so the hole has a story before anyone asks.

## Regulatory inheritance — the category the instruments share

The eight instruments of rev 1 are not eight unrelated controls. They are one property:

> **Every deployment inherits constitutional safeguards automatically, and may only narrow them further — never widen past them.**

This is the same inheritance chain already running at every layer of the system: MAIA inherits AIN OS's constitution; Practitioner Studios inherit MAIA's floor (Guidance narrow-only, refused live with 422 + zero residue, 2026-07-08); Larry inherits Studio; Larry's clients inherit Larry's field — protected *from* him by the same floor that protects MAIA's authority from configuration. Regulatory properties propagate down the identical chain. A deployment is not a compliance project; it is another link that inherits.

*(Pattern note: this is the third independent sighting of "core defines, periphery narrows, conflicts resolve toward the versioned center" — Guidance, the C-fence interpretive rule, and now deployment inheritance. Tracked as a canon candidate.)*

## The inherited instruments

1. **The constitutional floor, binding on everyone — including the vendor.** Narrow-only configuration; not a policy waivable for a large customer. (Tier 2, guarded + live-demonstrated.)
2. **Refusal Registry as control catalog** — refusals citable by ID the way security teams cite controls; ledger above. (Tier 2, with Tier-1 members.)
3. **Consent as authoritative ledger**, not checkbox — Path B pattern, Sanctuary non-retention, default-off sharing. (Mixed: ledger immutability is Tier 1; behavioral honoring is Tier 2.)
4. **Jurisdictional separation** — *system stores; participant recognizes; practitioner interprets.* The system may say "Michael shared three reflections," never "Michael is entering a deeper stage of transformation." **KNOWN GAP, tracked:** three renderer-local dominance computations (`spiralogicEngine.ts:108-114`, `journey/page.tsx:1868`, `ElementalBalanceDisplay.tsx:55-56`) currently perform interpretation in unguarded places; closes with the single-interpretive-rule PR (Q6=C fence), which this document is the third independent justification for. Until it lands, this instrument is claimed as *designed and partially enforced*, not complete.
5. **Two-axis provenance** on every rendered artifact (`grammar_version` + model label, joined by `interpretation_version`). (Tier 1 at the schema, once Gate 3 lands it as required columns.)
6. **Data sovereignty as deployment property** — self-hosted, no third party in the traffic path, air-gap capable. (Tier 1.)
7. **Defense in depth below the constitution** — schema/trigger-level guarantees the application layer cannot edit. (Tier 1.)
8. **Deploy-lane governance** — commit-bound container provenance; the container itself answers "what code is running and how did it get here?" (Tier 1 per artifact; lane serialization in progress.)

## The evidence pack — the demo as artifact, not performance

"I can show you the refusal executing" must never depend on live improvisation. The maturation artifact is a **regenerable evidence pack** — one command that produces: the 422 refusal exchange (request + response + post-state showing zero residue) · CI guard runs keyed to registry IDs · an append-only trigger rejection log · the container's commit-bound provenance answer · the conformance suite result against the versioned grammar · **and assertions of every named Tier-1 absence-dependency**, so tier status is re-proven per run, never assumed from the last edition of this document. A client's auditor runs it without us in the room. **Not yet built** — named here as the first deliverable when the Cat 1 gate is eventually walked, and buildable earlier for Larry's field, where real evidence-pack runs accumulate history before any deployment promise exists.

## Larry becomes the proof — evidence instead of assertion

The sequencing this document serves:
1. Not *"AIN OS is compliant."* Rather: *"Larry's platform inherits these constitutional capacities."*
2. After real deployment in his professional context: *"Here is how those capacities satisfied the requirements of this field"* — regulatory mappings grounded in observed behavior, not marketing.

## Honest boundaries (travel with every claim above)

- **No external certification.** Architectural affordance, not counsel-audited compliance. Layer-2 mapping is future, per-deployment work.
- **Deployment tenancy is Cat 1 HELD.** This names inherited capacity; the governance gate has not been walked, and naming a destination does not walk it.
- **One deployment exists.** Portability of guarantees to a client-operated instance is exactly the engineering test the What Now? paper defines — designed for, not demonstrated.
- **Authority moves upward.** Deployments inherit what member use has proven; the capacity matures through the reference implementation before it is offered as a promise.
