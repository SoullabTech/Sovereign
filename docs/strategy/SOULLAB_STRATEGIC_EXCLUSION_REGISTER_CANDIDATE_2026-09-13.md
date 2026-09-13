# Soullab Strategic Exclusion Register — CANDIDATE

```text
STATUS      CANDIDATE. Every entry awaits founder adjudication. Nothing here has standing.
RULED BY    founder, 2026-09-13: "Authorize a read-only reconstruction, not a new lane and not a
            founder-from-memory composition. Mark every recovered entry CANDIDATE until you
            adjudicate it. Do not draft the strategic kernel yet."
METHOD      Jarvis reconstruction from existing rulings. No new research. No external sweep.
            No memory composition. Recovered language preserved with its original date.
NOT A LANE  This is strategic memory, not a programme lane. No build, no schema, no deploy.
HANDOFF     The question was exposed by UARE-01, which does not own the answer. UARE-01 hands
            off here and stops. (No UARE artifact exists in this repository; the handoff is a
            conversational act recorded here, not an amendment to a file.)
SEQUENCE    This register → founder adjudication → Phase 1 whole-organism census completes →
            kernel drafted from both → external challenge last. Market research challenges the
            strategy; it does not generate it.
```

---

## 0 · Why this instrument exists

The corpus has four strong layers and is missing a fifth.

| Layer | Where it lives | State |
|---|---|---|
| Prohibition | `MAIA_OATH`, `MAIA_SOVEREIGNTY_INVARIANTS`, `ANTI_FEATURES.md` | very strong |
| Epistemic | `CLAIM_LADDER`, `CLAIM_STATE_AUTHORITY`, source ledgers | very strong |
| Execution | programme lanes, verifiers, falsifiers | very strong |
| Representation | `MARKETING_CLAIM_DISCIPLINE` | very strong |
| **Choice** | — | **absent** |

Soullab keeps an extensive record of what it **refuses on ethical grounds** and almost none of
what it **declined on strategic grounds**. Those are different acts. The first is a floor; the
second is reversible, costly, and falsifiable. Without the distinction, *"we did not build X"*
slowly hardens into *"we believe X is wrong."*

**That hardening is not hypothetical in this corpus. It has already happened once, and required
a founder act to unwind — see F2.**

---

## 1 · The four classes

| Class | Meaning | Reopens on |
|---|---|---|
| **REFUSED** | Violates constitution or ethics | nothing — reopening is a constitutional amendment |
| **CHOSEN AGAINST** | A legitimate option deliberately not taken | changed circumstance or cost/benefit |
| **DEFERRED** | Potentially valid; not now — a sequencing decision | the named sequencing condition clearing |
| **UNPROVEN** | Withheld because evidence is insufficient | evidence arriving |

**Misclassification is the failure mode this register exists to prevent.** An UNPROVEN entry
wearing REFUSED clothing becomes a permanent doctrine Soullab never actually decided.

---

## 2 · Field provenance — read this before adjudicating

Each entry carries eight fields. They do **not** have equal standing, and the register would be
dishonest if it presented them as if they did.

| Marking | Meaning |
|---|---|
| **[R] RECOVERED** | Quoted or closely paraphrased from a dated ruling. Jarvis found this; Jarvis did not author it. |
| **[J] JARVIS-PROPOSED** | **Not in the record.** Reconstructed by inference. Requires founder adjudication before it carries any weight. |

`CHOICE`, `ALTERNATIVE`, `WHY` and `SOURCE` are almost always **[R]**.

`TRADEOFF` and `REOPEN CONDITION` are almost always **[J]** — because, per F3 below, the corpus
barely records them. **These are the two fields that convert a preference into a strategy, and
they are the two fields Jarvis is least entitled to assert.** They are proposals for the founder
to correct, replace, or strike — never findings.

`CLASS` is **[J]** unless the source ruling names the class itself.

---

## 3 · CHOSEN AGAINST

### X-01 · Self-hosted infrastructure
- **CHOICE** [R] Self-host the entire stack on owned hardware (minisforum, Docker, Caddy, PostgreSQL).
- **ALTERNATIVE** [R] Managed hosting and managed databases — Vercel, Netlify, Heroku, Supabase, PlanetScale, Neon, Cloudflare.
- **CLASS** [J] CHOSEN AGAINST. *Note:* the corpus states this as a non-negotiable, which reads as REFUSED. It is classed CHOSEN AGAINST here because the stated rationale is jurisdictional and architectural, not ethical-absolute — **this classification is the first thing to adjudicate.**
- **WHY** [R] *"Self-hosted by design: no cloud lock-in. Infrastructure choices … are part of the ethical architecture."* · *"No third party sits between users and their data. No jurisdiction concerns — we control the location. Complete air-gap capability if needed."*
- **SOURCE** [R] `CLAUDE.md` §Non-negotiables; §Infrastructure (Single Source of Truth).
- **TRADEOFF** [J] Full ops burden carried in-house: deploy-lane locks, provenance verification, LAN IP drift, no CDN, no managed failover. Several 2026-09 incidents are direct costs of this choice.
- **REOPEN CONDITION** [J] Likely none for member data. A narrower question — whether *static, non-member-data* assets may sit behind a CDN — appears never to have been asked separately.

### X-02 · Local PostgreSQL, never Supabase
- **CHOICE** [R] Local PostgreSQL via `lib/db/postgres.ts`.
- **ALTERNATIVE** [R] Supabase (and by extension any managed Postgres with RLS).
- **CLASS** [J] CHOSEN AGAINST, enforced as if REFUSED.
- **WHY** [R] *"We do NOT use Supabase. Never introduce Supabase."* · *"If you see Supabase in code, remove it; do not consolidate it."*
- **SOURCE** [R] `CLAUDE.md` §Database & Backend; enforced by `npm run check:no-supabase` in the pre-commit hook.
- **TRADEOFF** [J] Auth, realtime, storage and row-level security are hand-built or absent.
- **REOPEN CONDITION** [J] None identified. The enforcement guard makes this effectively constitutional in practice, whatever its formal class.

### X-03 · Provider replaceability, not provider loyalty
- **CHOICE** [R] Anthropic and Ollama in production; every provider governed by tier and capability.
- **ALTERNATIVE** [R] OpenAI in the production runtime.
- **CLASS** [R] Mixed by tier — OpenAI in prod is REFUSED; OpenAI as a gated lab benchmark is permitted.
- **WHY** [R] *"Providers are replaceable, governable infrastructure beneath MAIA's identity — never the identity itself."* · *"The point is not 'remove OpenAI.' The point is that no provider is load-bearing for who MAIA is."*
- **SOURCE** [R] `docs/canon/PROVIDER_GOVERNANCE.md` (canon, ratified 2026-07-07); `scripts/provider-policy.json`.
- **TRADEOFF** [J] Capability ceiling tracks the chosen providers; the allowlist carries enumerated migration debt.
- **REOPEN CONDITION** [R] Built in — the tier table is amendable as a reviewed governance act. **This entry is the corpus's best existing model of a strategic exclusion with a legitimate reopening path.**

### X-04 · Local-first development
- **CHOICE** [R] Default development to local Ollama; cloud Claude reserved for architecture, debugging, security.
- **ALTERNATIVE** [R] Cloud-first development.
- **CLASS** [R] CHOSEN AGAINST — the source records *"Reversible: Yes."*
- **WHY** [R] *"$200/month is unsustainable. Local models handle 70-90% of daily work. AIN context compensates for model capability gap."*
- **SOURCE** [R] `docs/decision-log.md`, 2026-02-11.
- **TRADEOFF** [R] *"Development speed may vary."*
- **REOPEN CONDITION** [R] *"Cloud is metered, not abandoned"* — `maia-cloud-now` available anytime.
- **STANDING** [J] **NEEDS FOUNDER REVIEW** — nineteen months old, economics and local model capability have both moved, and the decision log has recorded nothing since.

### X-05 · Circles scale by multiplication, not enlargement
- **CHOICE** [R] Collective scale through multiplication and nesting of small fields.
- **ALTERNATIVE** [R] Enlarging a single relational field.
- **CLASS** [R] CHOSEN AGAINST, with rationale ratified.
- **WHY** [R] *"Enlargement increasingly makes recognizability, participation, facilitation, differentiation and repair difficult to preserve."*
- **SOURCE** [R] FR-10, `docs/programme/JARVIS-CIRCLES-01_FOUNDER_RULINGS_2026-09-06.md`.
- **TRADEOFF** [J] Forgoes the network effects and content density that large-group platforms monetize.
- **REOPEN CONDITION** [R] Partially pre-answered: *"No numerical threshold attaches to this law"* — so the law cannot be reopened by a headcount argument.

### X-06 · Build the Commons fresh
- **CHOICE** [R] Build the FR-02 Commons from zero.
- **ALTERNATIVE** [R] Reuse the existing `community_*` forum and `commons_contributions` substrate.
- **CLASS** [R] CHOSEN AGAINST — the existing substrate is classified INERT LEGACY, *not* an offence.
- **WHY** [R] *"Reusing them as Circle substrate would import a status economy on day one"* — contribution tiers, points, accepted counts, and `min_cognitive_level` gating access on a measured attribute of a person.
- **SOURCE** [R] I0 census finding (2), `docs/programme/CIRCLES_INVOCATION_SUBSTRATE_CENSUS.md`; D-I2 BUILD FRESH.
- **TRADEOFF** [J] Full rebuild cost; working code left unused.
- **REOPEN CONDITION** [J] None for the status mechanics. Non-status pieces could in principle be salvaged; that question appears never to have been separated from the status question.

### X-07 · Guard the mutation, not the token
- **CHOICE** [R] Enforce FR-18 inside the membership upsert.
- **ALTERNATIVE** [R] Revoke the invite token on removal — the fix Jarvis originally recommended.
- **CLASS** [R] CHOSEN AGAINST, explicitly correcting Jarvis.
- **WHY** [R] The token is Circle-wide: *"revoking it withdraws the invitation from everyone to answer one person's standing."* The defect was that *"a generic bearer credential had enough authority to overwrite a recorded relational act."*
- **SOURCE** [R] FR-18, 2026-09-07; `docs/programme/JARVIS-CIRCLES-01_I0.5_ENTRY_SAFETY_2026-09-07.md`.
- **TRADEOFF** [J] Per-invitee tokens and invite expiry stay unbuilt and explicitly unauthorized.
- **REOPEN CONDITION** [R] Falsifier T10d is the guard: any future fix by token revocation passes T10a–T10c and **fails T10d**. The exclusion is machine-enforced.
- **Note** [R] This is the strongest exclusion in the corpus, because the alternative is not merely rejected — it is **made to fail a test**.

### X-08 · Reconcile forward on the I0.5 schema drift
- **CHOICE** [R] Accept I0.5 as current deployed state, subject to two independent witnesses.
- **ALTERNATIVE** [R] Revert the unauthorized migrations.
- **CLASS** [R] CHOSEN AGAINST.
- **WHY** [R] *"A governance-order failure is not evidence that the implementation is wrong, and tearing down a state that may be perfectly correct in order to manufacture the opposite order is the more destructive error."*
- **SOURCE** [R] Founder ruling 2026-09-07, `CLAUDE.md` §SCHEMA DRIFT.
- **TRADEOFF** [R] Named in the ruling: acceptance *"does not rewrite history; the deployment-order breach remains a separate operational finding with its own open provenance investigation."*
- **REOPEN CONDITION** [R] *"If the canonical verifier fails, adjudicate the failure on what failed — repair versus rollback is decided then, never pre-chosen."*

### X-09 · Voice may not have a different mind
- **CHOICE** [R] Spoken and typed turns converge before MAIA cognition begins.
- **ALTERNATIVE** [J] A voice-optimized cognition path, which the codebase previously had.
- **CLASS** [R] REFUSED at the cognition boundary; CHOSEN AGAINST at the capture boundary.
- **WHY** [R] *"Voice may have a different capture path; it may not have a different mind."*
- **SOURCE** [R] `docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md`; pinned by `__tests__/voice-non-degradation.test.ts`.
- **TRADEOFF** [R] Demonstrated 2026-09-07: convergence made voice turns non-streaming, which is what exposed the transcript defect. Latency and streaming affordances are the standing cost.
- **REOPEN CONDITION** [R] STT/TTS may change freely — *"sensory infrastructure"*. The mind may not be substituted. Divergence downstream of input acquisition = RED = voice does not ship.

### X-10 · Delegation capped at a primitive
- **CHOICE** [R] A bounded, trustworthy delegation primitive.
- **ALTERNATIVE** [R] Automatic task classification, automatic model selection, autonomous multi-agent swarms, automatic merging, automatic founder decisions.
- **CLASS** [R] CHOSEN AGAINST with an explicit evidence-gated reopening — arguably the corpus's only fully-formed UNPROVEN/CHOSEN-AGAINST hybrid.
- **WHY** [R] *"Lane selection stays a Claude/founder judgment call until this primitive has produced enough evidence to justify automating it — a separate, future authorization."*
- **SOURCE** [R] `docs/ops/AIN_DELEGATION_CONTROL_PLANE_2026-08-09.md` §9.
- **TRADEOFF** [J] Founder attention remains the routing bottleneck.
- **REOPEN CONDITION** [R] Evidence from the primitive's own operation, plus a separate authorization.

### X-11 · A north star may not be strip-mined
- **CHOICE** [R] Vision claims stay Vision.
- **ALTERNATIVE** [J] Demoting a Vision story to Designed so it becomes publishable this quarter.
- **CLASS** [R] REFUSED (representation), though its subject matter is strategic.
- **WHY** [R] *"The strongest narratives are sometimes the least shippable — and that is correct. They orient the organization; they do not sell this quarter."*
- **SOURCE** [R] `docs/canon/MARKETING_CLAIM_DISCIPLINE.md` §True-North Preservation.
- **TRADEOFF** [J] Soullab's most compelling material is structurally unavailable for near-term persuasion.
- **REOPEN CONDITION** [R] Ascent by evidence only, per `CLAIM_LADDER`.

### X-12 · Retire structurally, with a 410
- **CHOICE** [R] Retire `sovereign/app/maia` by serving 410 first.
- **ALTERNATIVE** [J] Silent deletion.
- **CLASS** [J] CHOSEN AGAINST.
- **SOURCE** [R] CMT-01 rulings, `CLAUDE.md`.
- **TRADEOFF** [J] Retirement takes two acts and a waiting period instead of one commit.
- **REOPEN CONDITION** [J] None — this looks like a general pattern worth promoting, not an exclusion worth reopening.

### X-13 · The typecheck gate measures regression, not absolute state
- **CHOICE** [R] Gate on *no new diagnostics* against a recorded baseline.
- **ALTERNATIVE** [J] Requiring a clean tree — driving 239 pre-existing errors to zero before shipping.
- **CLASS** [J] CHOSEN AGAINST.
- **WHY** [R] The 239 errors are *"debt, not a gate."* Re-baselining is *"a governed act: use it to lock in fixes or an intentional, reviewed coverage change — never to absorb a new error."*
- **SOURCE** [R] `CLAUDE.md` §Before Making Changes.
- **TRADEOFF** [R] Named honestly in-place: *"`npm run typecheck` green is not proof that everything typechecks — it is proof that nothing got worse."*
- **REOPEN CONDITION** [J] Unstated. No target date or threshold for burning the 239 down exists.

---

## 4 · DEFERRED

### X-14 · Generalized architecture extraction — Anti-Drift Law freeze
- **CHOICE** [R] Freeze generalized architecture and broad refactors.
- **ALTERNATIVE** [R] Extracting the Coaching Journey Template from the Now What? instance now.
- **WHY** [R] Naming was fixed first *"so that Larry is not encoded into the thing Soullab intends to keep and sell."* The ruling *"does not lift the freeze."*
- **SOURCE** [R] `docs/programme/COACHING-TEMPLATE-EXTRACTION-01_NAMING_RULING_2026-09-04.md`; `NOW_WHAT_MASTER_PROGRAMME.md`.
- **TRADEOFF** [J] Larry-specific structure keeps accreting into code that must later be separated.
- **REOPEN CONDITION** [R] **Explicit and dated in the source** — *"after the Anti-Drift Law's condition (Jondi walk) is met or explicitly waived."* **The only entry in this register whose reopen condition is fully recovered rather than proposed.**

### X-15 · Circle cohort membership
- **CHOICE** [R] Circle API authority stays founder-only; `CIRCLE_ACCESS_MEMBER_IDS` unconstituted.
- **ALTERNATIVE** [R] Constituting a cohort now.
- **WHY** [R] *"`CIRCLE_ACCESS_MEMBER_IDS` when a cohort is authorized, not before."* D-I3 defers identities to cohort authorization; *"do not touch `FOUNDER_MEMBER_IDS`."*
- **SOURCE** [R] I0 census; D-I3; FR rulings addendum.
- **TRADEOFF** [R] No member can reach any Circle surface. Named in the drift analysis as the reason member-facing exposure from the unauthorized migrations was nil.
- **REOPEN CONDITION** [R] Stage I8, plus `/commons/join` migrating to the same Circle-access authority.

### X-16 · The full memory field
- **CHOICE** [R] Arena-by-arena activation, each with its own Phase 2-equivalent spec.
- **ALTERNATIVE** [R] Wiring the coherence/field layer now.
- **WHY** [R] Held in Cat 5 — *"frozen plan with explicit 'does not authorize' language."*
- **SOURCE** [R] `docs/specs/COHERENCE_FIELD_WIRE_UP_SPEC_2026-05-24.md` §0.C; `MEMORY_EXPANSION_PLAN_2026-05-24.md` §5.
- **TRADEOFF** [J] The capability most responsible for MAIA being more than a chatbot stays partly inert.
- **REOPEN CONDITION** [R] The §0.C lift conditions, which remain unmet.

### X-17 · Practitioner-wisdom implementation
- **CHOICE** [R] Hold behind the BUILD GATE.
- **ALTERNATIVE** [R] Continuing practitioner-wisdom implementation on design direction alone.
- **WHY** [R] The gate is *"Larry IP inventory map before any further practitioner-wisdom implementation."* The SCOPE RULING holds: *"smallest six-month stewardship environment; next capability earned by use."*
- **SOURCE** [R] `docs/design/practitioner-portal/UNIVERSAL_PRACTITIONER_SEED_2026-08-05.md`.
- **TRADEOFF** [J] The clearest operational wedge advances slowly.
- **REOPEN CONDITION** [R] BUILD GATE clears; Prompt A and Prompt B run.

### X-18 · Dormant service cleanup
- **CHOICE** [R] Sequence cleanup after episodic ships.
- **ALTERNATIVE** [R] Cleaning up now.
- **WHY** [R] *"after episodic ships, not before."*
- **SOURCE** [R] `CLAUDE.md` §Next actions, item 6.
- **TRADEOFF** [J] ~3,000 LOC of dormant service keeps drawing narrative placement it has not earned — the inverse-drift risk named in the same file.
- **REOPEN CONDITION** [R] Episodic ships.

### X-19 · Trust-observation affinity weighting
- **CHOICE** [R] Observation-only.
- **ALTERNATIVE** [R] Phase 3 affinity weighting.
- **WHY** [R] *"observation-only by design … Phase 3 affinity weighting deliberately not yet wired."*
- **SOURCE** [R] `docs/canon/INTELLIGENCE_FIELD_ACCESS_MAP.md`.
- **TRADEOFF** [J] Trust data accumulates unused.
- **REOPEN CONDITION** [R] *"Future wiring would need category-gradient pass — system-inferred → non-form by default."*

---

## 5 · UNPROVEN

### X-20 · RFI / UFI
- **CHOICE** [R] Not built; not claimed.
- **CLASS** [R] UNPROVEN — and the source is unusually explicit that this is a *position of safety*, not of doubt about the idea.
- **WHY** [R] *"You are not behind because RFI/UFI are not built. You are safer because you now know they are not built. That distinction may be the most important outcome of the week."*
- **SOURCE** [R] Founder, 2026-05-24; `CLAUDE.md` Cat 1.
- **REOPEN CONDITION** [J] A measurable substrate. Per X-21, episodic is the named gate.

### X-21 · Member-facing coherence / field / resonance surfaces
- **CHOICE** [R] Withhold every member-facing "field state," "coherence," "RFI" or "UFI" surface.
- **WHY** [R] *"Until Episodic ships and stabilizes, resonant-field / coherence talk remains mostly metaphorical architecture language; only after that does it begin having a measurable substrate underneath it."*
- **SOURCE** [R] `CLAUDE.md` §Still held under freeze.
- **TRADEOFF** [J] Soullab's most distinctive vocabulary cannot be surfaced or marketed.
- **REOPEN CONDITION** [R] Episodic ships and stabilizes. **Phrasing rule attaches:** *"name the mechanism, not the mythology — metaphor after measurement, not before."*

### X-22 · The voice-mode repair is not yet a claim about MAIA
- **CHOICE** [R] Deployed, not demonstrated.
- **WHY** [R] *"A fix verified only by its author's tests is a claim about code, not about MAIA."* The decisive case — voice mode with MAIA's voice OFF — has no member falsifier.
- **SOURCE** [R] `CLAUDE.md`, 2026-09-07.
- **REOPEN CONDITION** [R] A member falsifier on the named case.

### X-23 · P1–P13 and the relational-intelligence definition
- **CHOICE** [R] Rung 1 (INTERNAL HYPOTHESIS); nothing on rungs 1–4 is marketed.
- **WHY** [R] *"A claim may occupy no rung higher than its evidence licenses. Ascent is by evidence; the act of claiming is the founder's."*
- **SOURCE** [R] `docs/research/human-experience/CLAIM_LADDER.md`.
- **REOPEN CONDITION** [R] Rung ascent, per the ladder. Descent is recorded, never quietly dropped.

### X-24 · Capacity transfer metric
- **CHOICE** [R] Not claimed.
- **WHY** [R] *"Empirical aspiration; unmeasurable until R12 answers."*
- **SOURCE** [R] `CLAIM_LADDER` §Where v0.1 sits today.
- **REOPEN CONDITION** [R] R12 answering.

---

## 6 · REFUSED — pointer, not transcription

`docs/ANTI_FEATURES.md` is a complete, well-formed REFUSED register and correctly guards the very
distinction this document exists to preserve: *"Anti-features are not 'future features we haven't
prioritized.' They are permanent exclusions."* It is not re-transcribed here. Four load-bearing
refusals are noted because they are strategically, not only ethically, consequential:

| # | Refusal | Source |
|---|---|---|
| X-25 | **Sanctuary content never crosses** — by any mechanism, *including member request within Sanctuary*. The one absolute that overrides member will. | FR-08.1; `CLAUDE.md` §Sanctuary invariant 6 |
| X-26 | **No counts, scores, ranks, streaks, badges, leaderboards or trust levels** as social-status mechanisms. Forecloses the entire engagement-metrics growth playbook. | FR-08.7; `ANTI_FEATURES.md` §2 |
| X-27 | **No access gated on a measured attribute of a person.** Named on sight in the I0 census as the distortion to refuse. | I0 census finding (2) |
| X-28 | **No stealth memory.** Consent for memory is constitutional. | `CLAUDE.md` §Non-negotiables |

---

## 7 · Findings

### F1 · REFUSED is well-kept; the other three classes are not kept at all
`ANTI_FEATURES.md` is rigorous and self-aware. There is no counterpart for CHOSEN AGAINST,
DEFERRED or UNPROVEN. Those live scattered across programme records, canon asides, CLAUDE.md
bullets and commit messages, recoverable only by the kind of sweep that produced this document.

### F2 · The hardening the founder warned about has already occurred once
The observation-phase freeze — a legitimate DEFERRED — hardened into a de facto REFUSED and
required an explicit founder act to unwind on 2026-05-24:

> *"No more hardened rules against providing the one thing that makes soulful engagement possible
> and makes this platform more than a chat bot."*

The correction was precise rather than total: the freeze *"remains in force as discipline"* but is
*"no longer used to block function."* **This is the register's own justification, and it is
empirical, not theoretical.** A DEFERRED with no recorded reopen condition will eventually be
read as doctrine. Four months later, X-16 and X-21 sit in exactly that position.

### F3 · Tradeoff and reopen condition are structurally absent
Across every ruling surveyed, **one** entry has a fully recovered reopen condition (X-14, the
Anti-Drift Law), and **one** format ever asked for reversibility (`decision-log.md`, dormant since
February). Everywhere else these fields had to be marked **[J]**.

This is the gap, stated precisely: **Soullab records its decisions and their reasoning, but not
their price or their exit.** A choice without a recorded price is indistinguishable from a
preference; a choice without a recorded exit becomes doctrine by attrition. The instrument this
register argues for is not a new document — it is two more fields on rulings Soullab is already
writing.

### F4 · The general decision log went dormant as decision volume exploded
`docs/decision-log.md` opens with *"Prevents re-deciding things. Every model reads this for
context."* It contains three entries, all dated 2026-02-11. Seven months and several hundred
rulings later it has not been touched. Lane-scoped ledgers (`STUDIO_DECISION_LEDGER.md`, the FR
series) absorbed the function and do it well — but only within their lane. **Nothing holds
cross-lane strategic memory.** That is the seat this register would occupy.

### F5 · A contradiction inside the anchor, recorded not repaired
`CLAUDE.md:13` lists *"EC2, Docker, Caddy"* as infrastructure choices that are part of the ethical
architecture. `CLAUDE.md:131` states *"NOT EC2 — The server is NOT an AWS EC2 instance."* One of
these is stale. The Infrastructure section is almost certainly correct and the non-negotiables
line is a fossil from an earlier deployment. **Read-only pass: flagged, not fixed.**

### F6 · The strongest exclusions in the corpus are enforced by falsifiers, not by prose
X-07 is the model: the rejected alternative does not merely lack authorization — it **fails
T10d**. X-09 is pinned by a test file. X-03 is enforced by `check:no-openai`. Prose exclusions
drift; enforced ones do not. This is the direct evidence for the earlier finding that a
`STRATEGY_CASE` schema would be the wrong instrument: **what holds in this codebase is a
predeclared falsifier that runs, not a field an LLM fills in.**

---

## 8 · What this document does not do

- It does **not** draft or imply a strategic kernel.
- It does **not** open a lane, authorize a build, touch schema, or change behavior.
- It does **not** re-transcribe `ANTI_FEATURES.md`.
- It does **not** assert that any **[J]** field is what the founder actually reasoned.
- It does **not** claim completeness. It is a first sweep of the rulings Jarvis could reach.

---

## 9 · Adjudication sheet

For each entry: **ACCEPT** (as written) · **CORRECT** (fields named) · **RECLASS** (new class) ·
**SUPERSEDE** (no longer holds) · **STRIKE** (never was a choice).

Highest-value adjudications first, in Jarvis's judgment:

| Priority | Entry | The question |
|---|---|---|
| 1 | **X-16, X-21** | These sit today where the observation-phase freeze sat before 2026-05-24. Are they DEFERRED with a real exit, or have they already become doctrine? |
| 2 | **X-01** | Is self-hosting REFUSED or CHOSEN AGAINST? The register cannot classify a non-negotiable whose stated rationale is architectural rather than ethical. |
| 3 | **F3** | Should TRADEOFF and REOPEN CONDITION become required fields on founder rulings going forward? This is the structural repair the whole sweep points at. |
| 4 | **X-04** | Nineteen months old, marked reversible, never revisited. Still current? |
| 5 | **X-13** | The only entry with no reopen condition and a growing cost. |

**No entry in this register has standing until adjudicated.**
