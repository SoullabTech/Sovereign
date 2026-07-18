# Gold Reflection — Decision Register — 2026-07-17

**Authority**: Kelly's rulings, 2026-07-17, accepting the four Gold Reflection design
documents as the basis for the next phase. This register is the single tracking surface
for what is **ratified**, what is **directed** (work ordered, not yet done), and what
remains **unresolved**. Update in place as items move.

Phase posture: **govern existing live reflection and collective pathways before adding
any new one.** The end-of-conversation prototype is accepted in principle but **not
authorized**; its eligibility gates are listed under D-items.

---

## Ratified (R)

| # | Ruling | Constitutional wording (record verbatim) |
|---|--------|------------------------------------------|
| R1 | "Gold" is an internal founding image only — never a field, score, classification, detectable category, member-facing label, or essence claim. | *Gold names the intention of the mirror. It is never a quantity the system claims to detect.* |
| R2 | Epistemic grammar, five distinctions: `Observation ≠ Interpretation ≠ Recognition`; `Recognition ≠ Durable memory`; `Durable memory ≠ Collective eligibility`. No stage silently implies the next. Lifecycle: evidence → observation → tentative reflection → member response → optional keeping → optional collective contribution. | — |
| R3 | Rejection asymmetry. "Curated, never rejected" governs member-authored material; `not-true` governs MAIA-generated construals. | *The system never rejects a member's experience. The member may always reject the system's interpretation.* |
| R4 | Recurring-theme pipeline: **freeze expansion now; subsume into the ratification architecture next.** Its output is *candidate observation*, never *known member theme*. Until a member review surface exists: no new consumers, no increased prompt authority, no identity-claim presentation, no collective use of inferred themes, rejected construals do not remain active. | *The recurring-theme pipeline may continue detecting candidate recurrence internally, but its output may not be treated as member truth, durable recognition, or collective knowledge until it enters the ratification grammar.* |
| R5 | Circles field pulse: **suspend system-inferred member-theme contributions** until explicit collective eligibility, adequate cohort thresholds, and re-identification protections exist. Cohort threshold of 2 is not acceptable for developmental pattern reflection. Permitted inputs (only): member-authored contributions deliberately shared with the Circle; explicitly public/group-visible material; non-sensitive operational aggregates; direct quotations only when explicitly offered for group use. | *Suspend inferred-theme contributions to the Circles field pulse until explicit collective eligibility, minimum cohort thresholds, and re-identification protections exist.* |
| R6 | Collective eligibility is a **per-item, opt-in contribution act**, separate from keeping. Account-level consent never silently makes developmental material eligible. Silence means no contribution. UI must never frame sharing as the virtuous answer; "no" is ordinary. Thresholds are necessary but not sufficient. | *No collective pattern may be shown when a reasonable participant could infer whose life produced it.* |
| R7 | Rejected construals are **structurally suppressed**: not memory, not established context, not collective, not rephrase-and-re-offer. Rejection retained only as a boundary, never a psychological fact. Internal meaning: *do not use this construal again without materially new evidence* — never *member resists this truth*. | — |
| R8 | Member response grammar ratified: **recognized** (feels true; not automatically durable) · **revised** (member's wording takes precedence) · **not-true** (wrong; suppressed per R7; never read as resistance/defensiveness/avoidance) · **not-now** (no engagement now; do not interpret why; suppress resurfacing until member reopens or a governed period passes) · **kept** (explicit durable form, preferentially member's language; keeping ≠ collective eligibility). | — |
| R9 | **Silence stores no proposed meaning.** Non-response ⇒ no inferred recognition, no durable object, no collective eligibility, no interpretation of the non-response. Ordinary turn retention per existing policy is unaffected. | — |
| R10 | Sanctuary boundary is a **server-enforced** invariant; an interface-only guard is not an enforced boundary. Server denies by container provenance. | *No episodic mark, quote candidate, memory atom, theme signal, or downstream learning artifact may be written from Sanctuary unless a separately ratified Sanctuary-specific gesture explicitly permits it.* / *Sanctuary content may not cross its boundary because a client failed to hide a control.* |
| R11 | The four design documents (`GOLD_REFLECTION_*_2026-07-17.md`) are accepted as the basis of the next phase. | Direction: *MAIA notices but does not define. MAIA reflects but does not pronounce. The member recognizes and remains the author. AIN learns only from what sovereign members deliberately contribute.* |
| R12 | Circles containment authorized and executed as a **sovereignty correction, not a feature change** (PR #626). Theme pipeline: contained now, subsumed later — legitimate capability (detecting candidate recurrence) preserved; illegitimate authority (recurrence as member truth / shareable knowledge) removed. | *System-inferred themes may support private tentative reflection, but they may not enter a shared field without explicit member ratification and collective eligibility.* |
| R13 | Orientation themes (member-named) remain conceptually and technically distinct from inferred theme signals. Never merge on the word "theme." | *Member-authored meaning may enter continuity directly. System-generated meaning must pass through recognition.* |
| R14 | Episodic-mark patch is approved as **interim defense-in-depth only**; its constitutional grade is not promoted until provenance-less writes are closed. Durable memory moves toward a typed `source` union — no untyped "came from nowhere" state. | *Requests with resolvable Sanctuary session provenance are refused server-side. Provenance-less requests remain outside the complete guarantee.* |
| R15 | Sanctuary enforcement moves from caller convention to server-resolved provenance with store-level refusal. | *Sanctuary provenance is resolved server-side, and protected stores refuse writes regardless of caller behavior.* / *MAIA may notice privately before the member recognizes. Nothing inferred may cross a sovereign boundary before the member has authorized what it is and where it may go.* |

## Workstream outcomes (2026-07-17, this session)

- **Workstream A — COMPLETE, stopped at open PR** per ruling:
  [PR #626](https://github.com/SoullabTech/Sovereign/pull/626), branch
  `fix/circles-pulse-inferred-theme-containment` off `clean-main-no-secrets`, commit
  `54c9017fc`. Theme JOIN removed from `getCirclePulse`; "self-observed" label →
  "Candidate recurrence — system-noticed, not yet confirmed by the member"; refusal
  **R17** added (65/65 harness checks pass); no new typecheck errors in touched files;
  pulse routes verified `force-dynamic`/uncached; UI has explicit empty-signals state.
  Revert = single `git revert 54c9017fc`. **Awaiting Kelly merge + deploy.**
  Production sizing: the ≥2-member aggregation currently returns **zero rows** — the
  defect is structural, not presently manifesting.
- **Workstream B — stopped at its stop conditions**:
  - B1 `SANCTUARY_PRODUCTION_EVIDENCE_2026-07-17.md`: **confirmed full-content escape**
    (by 5-for-5 timestamp correlation in a sanctuary-only window) — 2026-06-14, one
    member, one session; 10 `conversation_turns` + 44 `agent_runs` (35 with content)
    persisted and still present; the session's `maia_sessions` row **wrongly records
    `standard`** (sanctuary is per-request; session-level provenance is structurally
    insufficient); theme-signal gate held (0 rows); atoms permanently unattributable.
  - B2/B3/first-patch proposal:
    `SANCTUARY_REPAIR_SEQUENCE_AND_ENFORCEMENT_DESIGN_2026-07-17.md` — ranked S1–S6 +
    remediation item; governed-write-context design (per-turn provenance,
    `runtime_consent_state`, store-level refusal, fail-closed on absent provenance);
    isolated PR S1 proposal (TurnsStore + corpusCallosumService).
- **Inventory correction (D1)**: read-only member visibility of theme signals DOES
  exist — `app/api/members/themes/route.ts` (member-scoped self-view). Correction
  still missing: no member can reject/correct a signal. Additional member-scoped
  readers on main: `lib/maia/memoryLoaders.ts:150`, `lib/maia/recurrenceDetector.ts:94`;
  admin-scoped: `app/api/admin/activity-feed/route.ts:158`.

## K-rulings — EXECUTED (2026-07-17, incident-response phase)

| # | Ruling | Execution status |
|---|--------|------------------|
| K1 | Merge + deploy PR #626 — **APPROVED, EXECUTED & PRODUCTION-VERIFIED**. | Scope-reviewed (exactly 4 files), admin-merged as `6243294df` per Kelly authorization (branch policy required it). Deploy chained behind the in-flight House-Presence deploy (lane lock honored). **Verified in production 2026-07-17 ~17:58 UTC**: (1) container fresh, `GIT_COMMIT=6243294df` (contains `54c9017fc`), `DEPLOY_LANE=deploy-lane`, LAN `.104`, health ok; (2) compiled production bundle contains NO `member_theme_signals`×`circle_memberships` co-occurrence in any chunk — the cross-member JOIN is gone from the artifact (remaining refs = legitimate member-scoped/admin readers); (3) no fallback path (R17 harness green at the deployed SHA); (4) pulse route alive and auth-enforcing (401 unauthenticated; zero pulse errors in logs since deploy; UI has explicit empty-signals branch); (5) private theme data path intact (member-scoped query runs; founder currently has 0 signals in-window — a valid result); (6) corrected label "Candidate recurrence" present in the compiled bundle. Caveat stated honestly: no in-circle member session was available for a full authenticated pulse render, and the founder is not a circle member — behavioral render proof rests on the structural chain (artifact grep + R17 + UI branch), not a live member view. |
| K2 | Sanctuary S1 — **APPROVED & EXECUTED to open PR**: [PR #629](https://github.com/SoullabTech/Sovereign/pull/629) (`fix/sanctuary-s1-store-boundary`, `2b115dfb7`). `TurnPosture` (per-turn, server-resolved, unforgeable) + store-boundary refusal in TurnsStore (all 3 write methods), corpusCallosumService (both writers + trace), sessionManager (both lanes incl. the escaped conversation_history jsonb). Refusal R18; harness 75/0/0. Honest limitation recorded: phase-one posture derives from the request flag; S5 = authoritative provenance. **Stopped at open PR per ruling.** |
| K3 | Targeted deletion — **EXECUTED & VERIFIED**. Audit record created BEFORE deletion (`docs/incidents/INCIDENT_2026-06-14_SANCTUARY_PERSISTENCE.md`). Derivative sweep found a 3rd + 4th lane: `integration_passes` (5 rows) and `maia_sessions.conversation_history` (5 of 12 jsonb entries, filtered by timestamp key — content never read). One transaction: DELETE 10 turns + 44 agent_runs + 5 integration_passes, UPDATE history 12→7; count-only verification all-zero; 4 pre-sanctuary turns retained. **Not erased**: 30 nightly dumps (06-17→07-17) contain the rows; rotation expires last one ~2026-08-16; no offsite copies. Kelly decision open: destroy contaminated dumps early or let rotation run. |
| K4 | Member notification — **DRAFT PREPARED, NOT SENT**: `docs/incidents/MEMBER_NOTIFICATION_DRAFT_SANC-20260614-01.md` (plain-language full-content disclosure, backup caveat, uncertainty stated; fact-check anchors included). Send-gates: containment deployed/dated + Kelly independent fact-check. Legacy oracle lane — **DISABLED to open PR**: [PR #630](https://github.com/SoullabTech/Sovereign/pull/630) (`0515523f8`), hard 410 refusal before body read, refusal R19, reachability evidence (zero traffic 60d) recorded. Note: #629/#630 have a trivial adjacent-line index.ts merge conflict — resolve on second merge. |

## K5–K8 rulings — EXECUTED (2026-07-17 evening, closure sequence)

| # | Ruling | Execution status |
|---|--------|------------------|
| K5 | Merge/deploy order #630 → #629, with three merge-gate proofs on #629 — **EXECUTED**. #630 merged (`7a708eba5`); #629 merge-gated on runtime proofs **A/B/C — 13/13 green** on a real DB driving the actual stores (mid-session standard→sanctuary→standard with no retroactivity; named assertion `HISTORY_JSONB_ZERO_APPEND`; canary content absent from every lane, queue, and captured log — refusal is a drop, not a deferral). Proof transcript posted to PR #629. #629 merged (`33ec88ac6`) after resolving the R18 numbering collision (main's R18 = episodic-mark guard from #625; store-boundary refusal renumbered **R21**; R20 reserved per ruling). **Deployed + live-verified**: GIT_COMMIT=`33ec88ac6`; oracle lane returns 410 before body read with `[ORACLE-LANE]` marker; `[SANCTUARY] write refused` marker present in compiled bundle; harness 85/0/1-warn (R20's intentional warn) across 20 refusals. |
| K6 | Early destruction of contaminated backups — **EXECUTED, audit-first, continuity preserved**. Fresh clean post-deletion dump taken and integrity-verified FIRST (`maia_backup_20260717_181311.sql.gz`); SHA-256 manifest of all 30 contaminated dumps recorded; then destroyed 19:16 UTC (31→1 files). Zero-coverage window: none. `BACKUP_DESTRUCTION_AUDIT_SANC-20260614-01.md`. Honest caveat recorded: `rm`-level destruction, not forensic shredding. |
| K7 | Notification — **all technical send-gates met**; draft updated to state plainly that backups were destroyed. Remaining: Kelly's independent fact-check + placeholders + channel; **the send is Kelly's act**. Affected member = id prefix `ce284751` (identity resolved operationally, not written in docs). |
| K8 | S5 provenance — **queued as next architectural priority**. Constitutional sentence recorded: *Sanctuary is not a session property. Sanctuary is a per-turn posture.* R20 added as Proposed refusal (sanctuary content may never survive backup restoration) with enforcement (deletion manifests / tombstones / restore filtering / protected backup classes) as an S5 deliverable. Incident severity recorded: Medium / Limited / 1 member / no cross-member or human-review evidence / promise violation confirmed. |

**Final ruling (Kelly, 2026-07-17)**: *SANC-20260614-01 — Technical remediation
complete; member disclosure pending founder review and delivery.* Technical closure ≠
relational closure; the incident is not fully closed until the member is informed.
Covenant gates on #626/#629/#630 cleared post-merge (class-a + rollback checkboxes;
all three now PASS).

**Constitutional sentences recorded as foundational (R-canon candidates for the next
sitting)**:
1. *Sanctuary is not a session property. Sanctuary is a per-turn posture.*
2. *No durable object may be written without knowing what governed its creation.*
3. *Deletion is not complete if restoration can silently resurrect what sovereignty
   required the system to forget.*
4. *The system can only reflect safely if it first knows exactly what it is allowed
   to remember.*

**Open**: K7 send (founder's act; post-send record template in the notification doc)
· **S5 phase chartered** (mission: make every durable object able to prove what
governed its creation and whether it was permitted to persist — full scope in
`SANCTUARY_REPAIR_SEQUENCE_AND_ENFORCEMENT_DESIGN_2026-07-17.md` Part 4). **All
gold-reflection feature work remains frozen until S5 demonstrates the boundary
structurally, not by caller convention.**

## Post-closure phase plan (Kelly ruling, 2026-07-18): papers before code

Feature development is **stopped**. Directive: *design provenance as if it were a
constitutional substrate for every future platform running on AIN OS.* Four papers
commissioned — delivered as CANON-CANDIDATES awaiting Kelly's red-line:

1. `S5_PROVENANCE_CONSTITUTION_2026-07-18.md` — the seven questions; provenance
   shape; enforcement stack; **object-by-object provenance map** (Week-1 mapping
   deliverable, source-verified); restoration guarantees; historical-unknowns
   treatment; AIN-OS substrate framing.
2. `WHAT_SANCTUARY_ACTUALLY_MEANS_2026-07-18.md` — meaning paper; posture-not-place;
   the felt test and subtle-violation shape; flags the live copy question ("session"
   wording vs per-turn truth) for the Jondi session.
3. `JONDI_HOSPITALITY_SESSION_FRAME_2026-07-18.md` — **frame only**; the paper is
   authored WITH Jondi (hospitality witness and relational translator); Kelly's six
   questions + derived questions; real-auth walk; verbatim scribe posture.
4. `AIN_COLLECTIVE_INTELLIGENCE_BOUNDARIES_2026-07-18.md` — boundary model restated
   on the provenance substrate; collective eligibility = provenance question #5,
   minted only by member offering; supersedes the 07-17 model where they differ.

**Three tracks, in order**: (1) S5 provenance architecture · (2) Jondi session
(meaning, not features) · (3) Larry / Now What? (continuity + appropriate
remembering + appropriate forgetting; his register: *"we discovered that trust must
come before intelligence"*). Then, only after S5: the gold-reflection prototype
("What seemed most alive?" with recognize/revise/not-true/keep — nothing more).

**30-day calendar (Kelly)**: W1 close incident (send notification · final doc review
· S5 constitutional paper · provenance map) → W2 Jondi (implications · hospitality
questions · Now What? flow · onboarding/trust surfaces) → W3 Larry (one beautiful
continuity loop; "does this feel like your work living between sessions?") → W4
reflection prototype, only after provenance decisions settle.

**Threshold framing (recorded)**: the question has moved from *can MAIA exist?* to
*how does MAIA become trustworthy enough to accompany people over decades?* Working
architecture triad: **AIN = constitutional intelligence · MAIA = relational
intelligence · Soullab = cultural intelligence.** Build sequence: Relationship →
Trust → Sovereignty → Provenance → Reflection → Recognition → Collective
Intelligence.

## Kelly's assessment and ruling candidates (2026-07-18, paper review)

**Phase framing (recorded)**: Phase I — *Can continuity exist?* → Yes. Phase II —
*What may continuity become?* → *Not everything that can be remembered should be
remembered* (completed with the incident). **Phase III (now beginning) —
Constitutional Intelligence: under what conditions may intelligence arise from
relationship?** = S5. Closing characterization: *the week MAIA stopped becoming a
memory system and started becoming a constitutionally governed relational
intelligence.*

**Ruling candidates from the papers** (Kelly's formulations, numbered RC to avoid
collision with ratified R1–R15; formal placement at red-line/sitting):

| # | Candidate (verbatim) | Recorded in |
|---|---|---|
| RC1 | *Unknown provenance is itself provenance.* | Provenance Constitution §7 |
| RC2 | *Historical unattributed objects remain permanently collective-ineligible.* | Provenance Constitution §7 / AIN Boundaries §1.2 |
| RC3 | *Duplicate content lanes constitute constitutional debt.* (session-history jsonb so classified: temporary compatibility layer → eventual retirement; no new consumers; not removed immediately) | Provenance Constitution §5 |
| RC4 | *Sanctuary is violated whenever the relationship appears altered by what was promised would not remain.* | What Sanctuary Actually Means §6 |
| RC5 | *AIN may only learn from what has chosen to teach it.* | AIN Boundaries §6 |

**Paper-review outcomes also recorded**: Sanctuary UI copy change agreed — preferred
candidate *"While Sanctuary is active, what is spoken here is not carried forward"*;
final wording via Jondi session, then its own small PR. Jondi frame gains question 7:
*At what moments did MAIA stop feeling like a host and start feeling like a system?*

**Platform assessment (Kelly)**: overall **A** — Relationship A · Governance A ·
Incident Response A · Hospitality A- · Reflection Readiness B+ · Collective
Intelligence B+ · Provenance B+/A- trajectory. "Not because it is finished. Because
it now increasingly understands what it is, what it is not, what it may remember,
what it may forget, and what conditions must exist before intelligence becomes
trustworthy."

**Remaining founder acts (unchanged)**: (1) send the member notification — *"I would
not delay this long"*; (2) red-line the four papers, which are founding decisions,
not design decisions.

## Directed work — this phase (D)

| # | Deliverable | Status |
|---|-------------|--------|
| D1 | Recurring-theme reachability & authority inventory (writers, readers, prompt injections, UI exposure, collective use, deletion, member visibility, staleness) — **read-only; do not modify the pipeline** | `THEME_SIGNAL_REACHABILITY_INVENTORY_2026-07-17.md` — **delivered**. Key facts: pipeline is **byte-identical on clean-main-no-secrets → plausibly LIVE in production**; no member visibility/correction/deletion exists; prompt block mislabels inferred themes as "self-observed"; no invalidation on contradictory evidence; sovereign writer applies no confidence floor. |
| D2 | Circles field-pulse containment plan — smallest change severing inferred-theme input; do not implement unless the pathway is actively exposing private inferred content, in which case classify as sovereignty defect + isolated patch proposal | `CIRCLES_FIELD_PULSE_CONTAINMENT_PLAN_2026-07-17.md` — **delivered**. **Escalation clause triggered: classified sovereignty defect, actively exposing** (coarse category-level, 2-member floor — severity moderated but crossing is unconsented). One-file patch proposal (kill the JOIN in `fieldPulseService.getCirclePulse`) on a separate branch off main; production exposure-sizing SQL included; prompt-label fix (4a) recommended alongside. **Ready for immediate implementation on Kelly's go.** |
| D3 | Rejected-construal suppression design (no implementation) | `REJECTED_CONSTRUAL_SUPPRESSION_DESIGN_2026-07-17.md` — **delivered** |
| D4 | Sanctuary write-path audit + isolated patch plan (all write paths, not just episodic marks; escape assessment; if active escape confirmed → immediate implementation priority, stop reflection work) | `SANCTUARY_WRITE_PATH_AUDIT_2026-07-17.md` — **delivered**. Classification: **sovereignty defect, no confirmed active escape** (live route caller-gated; legacy lane ungated; no server-side provenance exists to audit against — atoms permanently un-auditable). Escape determination requires the audit's §4 production queries (first act of patch phase). 6-step isolated patch plan included. Mark-route fix running separately. |
| D5 | This decision register | **delivered**; maintain in place |

## Prototype eligibility gates (P) — all must close before implementation is considered

| # | Gate | Depends on |
|---|------|-----------|
| P1 | Sanctuary boundary server-enforced | D4 + the isolated patch session |
| P2 | Inferred themes removed from unconsented collective use | D2 + review |
| P3 | All current theme consumers inventoried | D1 |
| P4 | Rejected-construal suppression designed | D3 ✓ (design delivered; ruling on its open items pending — U5) |
| P5 | Member response grammar ratified **in implementation terms** (schema/route/UI mapping) | future spec, after D1–D4 review |

Prototype shape when eligible (unchanged): member-invited "What seemed most alive?" at
conversation close; 2–3 cited member-authored moments; private, evidence-grounded,
non-diagnostic, non-scoring, non-collective, reversible, silent unless invited,
non-durable unless explicitly kept.

## Unresolved (U) — carried forward for future ruling

| # | Question | Source |
|---|----------|--------|
| U1 | Recurrence threshold as constitutional constraint (≥3 moments / ≥2 sessions proposed) — ratify or amend when the grammar is ratified in implementation terms (P5) | Doc A §6, §12.2 |
| U2 | Restraint categories (grief/crisis material) — how to bound member-initiative-only evidence without hidden content classification; v0 dissolves it by being invitation-only, but a ruling is needed before any proactive surface is ever proposed | Doc A §12.3 |
| U3 | `not-now` governed resurfacing period — duration, and whether v0 should be member-reopen-only | R8; Doc A §7 |
| U4 | Collective cohort threshold — no universal number encoded yet; 2 inadequate; a floor like 10 may still be unsafe in intimate circles; the R6 reasonable-participant test governs. Concrete parameters deferred until a collective pathway is actually proposed | Kelly ruling §5; Doc C §9.1 |
| U5 | Suppression design open items: gist-similarity threshold + adversarial paraphrase test harness; N=2 stop-construing constant; conservative (member-reopen-only) vs offered reopening — recommendation is conservative for v0 | D3 §8 |
| U6 | Disposition of Circles field pulse *product* (beyond containment): retrofit with member offering gesture vs container-internal redesign — after D2 review | Doc C §9.6 |
| U7 | Chapters dependency: prototype seam is end-of-conversation; revisit if conversation-chapters ship first | Doc A §12.6 |
| U8 | Whether admin/research cross-member aggregation (`researchMetricRegistry`, admin dashboards) is inventoried under the collective boundary model when ratified | Doc C §1.2 |
| U9 | Whether any pathway for sensitive identity/health material should ever exist in collective learning (recommendation standing: none) | Doc C §9.2 |
| U10 | Evidence-deletion cascade ("no orphaned meaning") — ratify as invariant at next canon sitting | Doc A §12.7 |

## Explicitly out of scope this phase

No new reflection features, schemas, prompts, collective ingestion, or UI. No
modification of the theme pipeline (D1 is read-only). No implementation of containment
(D2 is a plan) unless active-exposure escalation applies. No implementation of
suppression (D3 is a design).
