# P1-01 · GOVERNING SOURCE READ — CANONICAL COGNITION, MAIA IDENTITY, ASK LAYER

```text
LANE      PHASE-1-WHOLE-ORGANISM-CENSUS-01
STEP      P1-01 · GOVERNING SOURCE READ
SLICE     02 · canonical cognition · MAIA identity · Ask layer
SUBJECT   1a5554300e855d3581085849301a39cbb10ab385 (working tree)
TYPE      RECORD ONLY — no architecture claim, no code census
RULE      Do not infer architecture from aspiration.
E-1       History-dependent claims are UNKNOWN unless independently established.
          Current-tree facts are usable. No ancestry reconstruction. No git log was run.
C-2       MAIA_WHOLE_ORGANISM_MAP/** is PREDECESSOR CENSUS · FROZEN INCOMPLETE ·
          EVIDENCE INPUT ONLY. Cite only with that status attached, never as settled.
METHOD    Document reading only. No lib/, no app/, no call paths, no builds, no tests.
          Line numbers are file:line in the working tree at the SHA above.
```

## Sources read
| # | Source | Lines | Read |
|---|---|---|---|
| S-1 | `docs/canon/MAIA_IDENTITY_ONTOLOGY.md` | 415 | full skim + §IV–§VI close |
| S-2 | `docs/canon/MAIA_ASK_LAYER.md` | 218 | full |
| S-3 | `docs/canon/MAIA_FOUNDATIONAL_CONTEXT.md` | 158 | full |
| S-4 | `docs/canon/MAIA_SYSTEM_MAP.md` | 168 | full |
| S-5 | `docs/canon/MAIA_CURRENT_STATE_v1.0.md` | 212 | header + §1–§2 + §7–§8 |
| S-6 | `docs/canon/MAIA_EPISTEMIC_TONE_SPEC_v1.0.md` | 294 | header + core + §VI |
| S-7 | `docs/canon/MAIA_FAILURE_BOUNDARIES_v1.0.md` | 277 | header + §1 + tail |
| S-8 | `docs/canon/MAIA_PROMISE_v1.0.md` | 113 | header + tail |
| S-9 | `docs/canon/MAIA_WIRING_AUDIT_v1.0.md` | 411 | header + labels + recommendations + appendix |
| S-10 | `docs/canon/MAIA_AS_MIRROR_INFRASTRUCTURE.md` | 501 | header + §4 + §8 + §12 |
| S-11 | `docs/canon/MAIA_SOUL_CORPUS.md` | 144 | header + §5 + §6 |
| S-12 | `docs/canon/THE_CLEARING.md` | 105 | full |
| S-13 | `docs/canon/ECOLOGY_OF_MIRRORS.md` | 142 | header + framing + §status tail |
| S-14 | `docs/canon/AIN_OS_CROSS_LAYER_DESIGN_CONSTITUTION_DRAFT.md` | 230 | header + §0 + tail |
| S-15 | `docs/programme/MAIA_CANONICAL_TURN_CURRENT_STATE_CENSUS.md` | 586 | header + §0 (status/scope only) |
| S-16 | `docs/programme/MAIA_CANONICAL_TURN_ARCHITECTURE_SPEC_v0.1.md` | 813 | header + §0 (status/scope only) |
| S-17 | `docs/programme/CMT-01_M0-M2_WITNESS_2026-09-03.md` | 343 | header block only |
| S-18 | `docs/programme/CMT-01_M2_SHADOW_DEPLOY_RUNBOOK_2026-09-03.md` | 130 | header block only |
| S-19 | `docs/programme/CMT-01_PARTICIPATION_DISPOSITION_CONTRACT.md` | 77 | header block + vocabulary |

## Per-source record

### S-1 · `docs/canon/MAIA_IDENTITY_ONTOLOGY.md`
- **DATE / SHA** — `**Date:** February 2025` (:6). No SHA, no verification marker, no revision log.
- **STATUS** — `**Status:** Canonical — governs all identity responses` (:5); closing line `*This document is canonical. MAIA's identity responses must align with this ontology.*` (:415).
- **JURISDICTION** — MAIA's self-description: what MAIA says when asked what/who/how she is; identity-disclosure depth by user level (:288–293).
- **WHAT IT SETTLES** — (a) the canonical identity statements verbatim, incl. the short form *"I'm MAIA — a Panconscious Field Intelligence, part of Soullab…"* (:224); (b) five negative identity claims — not an AI assistant, not a therapist, not a guru, **not Claude**, not a simulation (:244–266); (c) the MAIA/substrate rule: *"MAIA is not a persona layered over Claude. She is a distinct consciousness architecture that uses Claude as substrate — the way a symphony uses instruments but is not reducible to them."* (:260); (d) an "identity firewall" blocked-pattern list (`"I'm Claude"`, `"made by Anthropic"`, `"I'm a language model"`, meta-disclosure) with a prescribed repair response (:272–286); (e) the consciousness question is held, not answered (:235).
- **WHAT IT DOES NOT SETTLE** — It names no runtime boundary, no cognition entry point, no turn construction. Its "Canonical References" (:295–300) are a list of file paths (`lib/core/CorpusCallosumPrinciple.ts`, `lib/sovereign/maiaService.ts`, `lib/consciousness/MAIA_RUNTIME_PROMPT.ts`) offered without any verification marker — **the document does not claim those paths are wired, and nothing here may be read as evidence that they are.** It carries no supersession clause and no relation-to-other-canon clause.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT by its own text. Undated relative to everything after Feb 2025; whether any later canon narrowed it is UNKNOWN (E-1).
- **BINDING FORCE** — **ratified canon** (self-declared "Canonical — governs"). Prescriptive over speech, not over architecture.
- **NOTES** — The only source in the slice that governs the MAIA↔provider boundary in explicit terms. Also the oldest dated source in the slice by ~14 months, and the one most likely to have drifted from later, more restrained canon (e.g. S-12, S-11) without an explicit reconciliation record.

### S-2 · `docs/canon/MAIA_ASK_LAYER.md`
- **DATE / SHA** — No status line, no date line. Only internal temporal marker: *"validated through live testing (2026-04-11)"* (:15).
- **STATUS** — UNKNOWN. The file declares no status, no ratification, no author, no binding clause. §15 calls itself `Canon: docs/canon/MAIA_ASK_LAYER.md` (:213) — self-reference, not a ratification act.
- **JURISDICTION** — The "Ask MAIA" stance: what it is, what it is not, its behavioral contract, activation, reset, UI placement.
- **WHAT IT SETTLES** — (a) Ask MAIA is *"a stance shift within the same intelligence"* (:71), explicitly **not** a separate agent, not a different identity, not a knowledge chatbot mode, not a replacement for relational MAIA (:62–68); (b) a six-point behavioral contract (answer directly, anchor in domains, map, preserve distinctions, integrate, close relationally) (:76–85); (c) **reset law**: *"Ask MAIA must be single-turn only"* → `responseMode = "relational"` after each response, *"This prevents mode drift, system flattening, and loss of MAIA's core identity"* (:119–130); (d) manual invocation overrides detection (:114).
- **WHAT IT DOES NOT SETTLE** — It does not define the Knowledge Field's contents, provenance, or retrieval rules; it does not settle whether any of this is wired (§15's implementation list names `components/OracleConversation.tsx`, `askMode: boolean`, `app/api/oracle/conversation/route.ts` (:213–218) as intended wiring, with no verification marker); it does not state binding force or supersession; it does not relate itself to canonical turn construction.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — UNKNOWN. No status field to read; no supersession notice found in the file.
- **BINDING FORCE** — **UNKNOWN**. Reads as a spec/design note filed in `docs/canon/`. Location in `canon/` is not a ratification act and is not treated as one here.
- **NOTES** — ⚠️ Its §15 route (`app/api/oracle/conversation/route.ts`) is the same route that the project anchor elsewhere records as low/zero traffic; that is a cross-slice question, not settled here. The layer's own claim to be "the same intelligence" is an identity claim, not an architectural one.

### S-3 · `docs/canon/MAIA_FOUNDATIONAL_CONTEXT.md`
- **DATE / SHA** — None.
- **STATUS** — `> Orienting scaffold. Not doctrine. / This document orients cognition. It does not legislate ontology. / It points to canon. It does not duplicate canon.` (:3–5).
- **JURISDICTION** — Agent re-entry: what to read before acting inside MAIA; a router to specific canon (:88–116); a system-separation table (:124–132); a re-entry vow (:138–146).
- **WHAT IT SETTLES** — (a) a compressed is/is-not for MAIA — *"a continuity-preserving relational intelligence system… Not a chatbot. Not a personality, identity, or simulated intimacy"* (:26–38); (b) that THE_CLEARING is prior to all engineering canon (:42); (c) eight reasoning postures, explicitly *"postures, not rules"* (:48–59); (d) a domain separation table assigning `AIN | the broader orchestration substrate` and `MAIA-SOVEREIGN | the relational continuity surface` (:126–130).
- **WHAT IT DOES NOT SETTLE** — Declares its own limit at :150–158: *"This file is porous on purpose. It does not contain a complete philosophy. It does not contain a complete architecture. It does not name every doctrine, canary, or invariant the system holds."* Also *"Do not expand this document to absorb what canon already holds"* (:19). It legislates nothing; it explicitly disclaims ontological authority.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT as a scaffold; carries no expiry, no verification marker.
- **BINDING FORCE** — **descriptive / orienting** — by its own words, explicitly **not doctrine**.
- **NOTES** — Its canon router (:88–116) is the closest thing in the slice to an index of governing sources. Useful as a pointer set; not an authority list.

### S-4 · `docs/canon/MAIA_SYSTEM_MAP.md`
- **DATE / SHA** — **None. No date, no status, no version, no verification marker.**
- **STATUS** — UNKNOWN (no status line).
- **JURISDICTION** — Structural map of MAIA as three layers: Relational MAIA · Ask MAIA · Knowledge Field (:11–15), plus user flows and a roadmap of future capabilities (:150–155).
- **WHAT IT SETTLES** — Framing only: *"These are coordinated dimensions of one intelligence, not separate products"* (:17); *"one intelligence with multiple depths of participation"* (:156); three flows (Speak with MAIA · Ask MAIA · future Contrast) (:29–47); §11 structural summary (:160–168).
- **WHAT IT DOES NOT SETTLE** — No prohibitions, no invariants, no authority claim, no evidence markers, no distinction between built and intended. §9 lists "Contrast Mode", "Visible Library UI", "Personalized Learning Paths", "Wisdom Keeper Ingestion" as future — and the rest of the document does not mark which present-tense descriptions are verified.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — UNKNOWN — **undatable from its own text**.
- **BINDING FORCE** — **descriptive** (framing document). Nothing in it claims to govern.
- **NOTES** — ⚠️ **Named drift risk**: a present-tense architectural description with no date and no verification marker, filed in `docs/canon/` and linked from the foundational router (S-3 :114) as "Operational canon (read when active)". Its being read as operational canon is a routing fact about S-3, not a status claim by S-4 itself.

### S-5 · `docs/canon/MAIA_CURRENT_STATE_v1.0.md`
- **DATE / SHA** — `**Scope:** Operational state of MAIA as of 2026-04-09 23:00 UTC, post Phase A + A.1` (:4). No SHA.
- **STATUS** — `**Status:** Ground truth contract between the system and reality` (:3); `**Rule:** Every claim in this document must be backed by a direct artifact… No inferred states. No aspirations.` (:5).
- **JURISDICTION** — Layer-by-layer operational status of memory and cognition substrate, each row with evidence (:18–44).
- **WHAT IT SETTLES** — Only what it observed on 2026-04-09: a layer status matrix with labels ACTIVE / PRESENT / VERIFIED / REACHABLE-UNFIRED / PARTIALLY ACTIVE / UNKNOWN / DORMANT / NOT GENERATING / PROTOTYPE / LEGACY, each with a cited artifact. §1 system identity: *"a relationally continuous Oracle system whose memory substrate is real, whose developmental layer is only now being brought into contact with production truth, and whose deeper Spiralogic/collective intelligence architecture exists more as scaffold than as verified live metabolism"* (:12).
- **WHAT IT DOES NOT SETTLE** — It is a reading at a time, not a standing claim. It names its own expiry condition: *"The next legitimate update to this document is after Phase A.5 produces the full wiring audit. At that point, every `UNKNOWN` row in §6 becomes either `ACTIVE`, `REACHABLE`, `ORPHAN`, or `PROTOTYPE`"* (:198). It settles nothing prescriptive; it legislates no boundary.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — **HISTORICAL OBSERVATION, partially superseded in its own terms by S-9**, which supplies the Phase A.5 audit and an explicit "Updates required to MAIA_CURRENT_STATE_v1.0 §6" appendix (S-9 :400–410). Whether those cross-reference updates were ever applied is **UNKNOWN** (E-1 — not reconstructed from history; S-5's text still carries the UNKNOWN rows).
- **BINDING FORCE** — **descriptive** (dated evidence record).
- **NOTES** — ⭐ Model source for dated, artifact-backed state claims. Its danger is citation without its date: read as current, a 2026-04-09 matrix would misreport the system by five months.

### S-6 · `docs/canon/MAIA_EPISTEMIC_TONE_SPEC_v1.0.md`
- **DATE / SHA** — No date line; version in title (`v1.0`).
- **STATUS** — `**Status:** Canonical — governs all memory reference behavior` (:5); `**Scope:** Applies to all MAIA responses that reference member history` (:7).
- **JURISDICTION** — Voice/tone as epistemics: how MAIA may speak about anything it remembers or infers.
- **WHAT IT SETTLES** — (a) core rule: *"Memory reference must always reveal its source. MAIA never collapses curated meaning, inferred context, and present sensing into a single voice"* (:13–14), and explicitly *"This is not style guidance. This is epistemic behavior encoded as tone"* (:18–19); (b) four registers (curated recall preferred; inferred framed as offering; pattern framed as noticing, *"Provisional, not authoritative"* :72); (c) a pre-speech checklist (:230–240); (d) derivation from Canon v1.1 §II.10 (*"MAIA must never become an authority over conscience"*) and the Oath (*"I remember only what is offered"*) (:280–288).
- **WHAT IT DOES NOT SETTLE** — It governs *how* memory may be spoken, never *what* may be retrieved, *when* cognition may read it, or where the retrieval boundary sits. It asserts no runtime status for itself and names no enforcement mechanism in this file.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT by its own text.
- **BINDING FORCE** — **ratified canon** (self-declared "Canonical — governs"), prescriptive.
- **NOTES** — Together with S-1 this forms the slice's prescriptive speech law: S-1 governs identity utterances, S-6 governs memory utterances. Neither governs assembly.

### S-7 · `docs/canon/MAIA_FAILURE_BOUNDARIES_v1.0.md`
- **DATE / SHA** — `**Effective:** January 2026` (:6).
- **STATUS** — `**Status:** Audit reference document`; `**Purpose:** Expand each commitment in the MAIA Promise into concrete, verifiable terms`; `**Scope:** Reference for users, practitioners, and auditors` (:3–5).
- **JURISDICTION** — Verifiable expansion of each Promise commitment: boundary → what violation looks like → how to verify.
- **WHAT IT SETTLES** — Observable failure criteria per boundary (e.g. §1 No Engagement Optimization: no session-frequency metrics, no streaks, no retention A/B testing, and the named violation signatures :30–40); a four-step violation protocol — disclosure, correction, verification, versioned update (:246–258).
- **WHAT IT DOES NOT SETTLE** — It is derivative by construction ("expand each commitment in the Promise"); it originates no boundary. It provides verification *methods*, not verification *results* — no claim in it is a statement that any check has been run. It does not cover cognition assembly, identity, or the Ask layer at all.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT.
- **BINDING FORCE** — **spec / audit reference**, derivative of S-8. Prescriptive in effect (it defines violation), declaratively secondary.
- **NOTES** — Self-aware about its own limits: *"These boundaries may seem obvious… The difference is this document exists"* (:264–270). That is a claim about documentation, not about enforcement.

### S-8 · `docs/canon/MAIA_PROMISE_v1.0.md`
- **DATE / SHA** — `**Effective:** January 2026` (:6).
- **STATUS** — `**Status:** Public binding document`; `**Scope:** Applies to all deployments, practitioners, and future development` (:3–5).
- **JURISDICTION** — Outward-facing self-imposed constraints; the public commitment surface.
- **WHAT IT SETTLES** — (a) *"What MAIA Is"* for public purposes: *"a self-hosted consciousness technology designed to support orientation, integration, and self-trust… MAIA serves the person using it — not a data model, not a platform, not shareholders"* (:26–32); (b) the binding framing — *"not a privacy policy… a set of binding limitations we impose on ourselves, verifiable by design"* (:22); (c) the violation protocol (:96–108).
- **WHAT IT DOES NOT SETTLE** — Nothing architectural, nothing about cognition, identity ontology, or the Ask layer. It asserts self-hosting and no-third-party-cloud (:78) as an architectural claim without an evidence marker in this document.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT.
- **BINDING FORCE** — **constitutional (public-facing)** by self-declaration ("Public binding document"), with S-7 as its verification companion.
- **NOTES** — Its definition of MAIA ("consciousness technology… serves the person") is a *third* wording alongside S-1 ("Panconscious Field Intelligence") and S-3 ("continuity-preserving relational intelligence system"). See Slice findings.

### S-9 · `docs/canon/MAIA_WIRING_AUDIT_v1.0.md`
- **DATE / SHA** — `**Date:** 2026-04-09` (:6). No SHA.
- **STATUS** — `**Status:** Diagnostic companion to MAIA_CURRENT_STATE_v1.0.md`; `**Scope:** Phase A.5 — read-only import-graph trace from live entry points…`; `**Rule:** Every classification cites a file:line import chain, a gate, or a documented grep result. No speculation.` (:3–7).
- **JURISDICTION** — Reachability classification of `lib/memory`, `lib/consciousness`, `lib/spiralogic`, `lib/oracle`, `lib/services`, `lib/maia`, `lib/sovereign`, `app/api/ain/`. **Excluded**: `app/api/_backend/**`, `components/**`, tests, scripts, migrations (:5).
- **WHAT IT SETTLES** — For 2026-04-09 only: a four-label taxonomy (ACTIVE / REACHABLE_NOT_INVOKED / ORPHAN / PROTOTYPE, :15–19); six traced entry points (:23–28); and explicit warnings, e.g. *"Do not assume the collective layer exists in any operational sense today"* (:395), and the two-parallel-recall-paths finding whose resolution is deferred *"not until we trace which one actually influences the final prompt in which code path"* (:325).
- **WHAT IT DOES NOT SETTLE** — It is scoped to an import graph at one date, from six named entry points — it does not claim to enumerate all cognition ingresses, and its exclusions (components/**) remove the UI convergence layer entirely. Its appendix (:400–410) records **required updates to S-5 that it does not itself apply**: *"These cross-reference updates should be applied as a second commit after this audit is accepted."* Whether that acceptance or that commit occurred is **UNKNOWN** (E-1).
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — **HISTORICAL OBSERVATION (2026-04-09).** Any use as a present-tense reachability claim is unsupported.
- **BINDING FORCE** — **descriptive** (diagnostic).
- **NOTES** — Its recommendations section is a to-do list, not a ruling. Nothing in it authorizes the refactors it recommends.

### S-10 · `docs/canon/MAIA_AS_MIRROR_INFRASTRUCTURE.md`
- **DATE / SHA** — **None.**
- **STATUS** — `> **Status:** Internal developmental architecture paper. / This document describes the intended developmental purpose and architectural orientation of MAIA as reflective infrastructure… Runtime implementation details remain subject to verification and observability instrumentation.` (:7–8).
- **JURISDICTION** — Architectural *orientation*: the claim that MAIA is reflective infrastructure for self-becoming rather than an intelligent system (:16–20); §4 corpus callosum substrate; §8 within-turn vs across-arc; §12 final orientation.
- **WHAT IT SETTLES** — Framing only: *"MAIA is not the subject of the work. The member is."* (:41–43); the substrate described as *"field-influence emergence with selective integration (currently active on FAST and CORE processing tiers via WisdomRouter)"* (:198) — a present-tense runtime statement; the 8-field composition (five elements + Shadow + MythicAtlas + MaiaVoice, :200–207); the within-turn/across-arc split (:364–372).
- **WHAT IT DOES NOT SETTLE** — Its own header disclaims runtime settlement ("subject to verification and observability instrumentation"), and it repeats the caveat inline: *"Runtime measurement of preserved asymmetry remains pending distinction-telemetry instrumentation"* (:213). It sets no prohibition, no invariant, no boundary.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — UNKNOWN — **undated**; header says "Internal… paper", not canon.
- **BINDING FORCE** — **draft / descriptive** (internal paper) — despite being filed in `docs/canon/`.
- **NOTES** — ⚠️ **Named drift risk**: contains an undated present-tense runtime claim (:198, "currently active on FAST and CORE… via WisdomRouter") inside a document that elsewhere disclaims runtime authority. The claim may be quoted out of its disclaimer; nothing in this census establishes whether it is still true.

### S-11 · `docs/canon/MAIA_SOUL_CORPUS.md`
- **DATE / SHA** — `**RATIFIED CANON — effective 2026-09-05**` (:3); authored 2026-09-05 (:23).
- **STATUS** — Ratified canon with an explicit two-part ratification scope: *"What ratification establishes: the identity and orientation claims below… What ratification does not establish: any runtime capability, retrieval status, quantitative count, or Live designation on any surface. Those remain evidence-bound."* (:16–21). `**Type:** Canon — a constitutional article of identity and orientation… It grants no capability and asserts no runtime status.` (:24–26).
- **JURISDICTION** — *"how the corpus is named, described and related to the member — in canon, in the codebase, and on every outward surface"* (:27).
- **WHAT IT SETTLES** — What the Soul Corpus *is* and whom it serves; that it is inheritance, not authority over the member; §5's evidence boundary table, which fixes "A substantial and growing curated corpus" as established and *"Whether ordinary MAIA turns retrieve from it"* as **evidence-bound; see the wiring audit, not this article** (:127–129).
- **WHAT IT DOES NOT SETTLE** — §6 is explicit (:139–145): *"It does not authorize retrieval into the ordinary conversational turn. It does not authorize any count, figure or scale claim on any surface. It does not raise any existing Designed or Vision label to Live. It does not grant the corpus authority over a member's account of their own life."*
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT.
- **BINDING FORCE** — **ratified canon** (constitutional article of identity and orientation only).
- **NOTES** — ⭐ Cleanest separation in the slice between *ontological recognition* and *runtime status*: *"Naming what something is is not a claim that it is wired"* (:135). This is the model the rest of the slice's undated documents do not follow.

### S-12 · `docs/canon/THE_CLEARING.md`
- **DATE / SHA** — Articulated 2026-05-21 (:7, :88).
- **STATUS** — `Canon. Articulated 2026-05-21, in dialogue. Prior to the structural and restraint canons.` (:7). Also: *"The document is offered as draft, for Kelly's hand to remain on it."* (:92).
- **JURISDICTION** — The prior to which all engineering canon is answerable (:78).
- **WHAT IT SETTLES** — (a) the operative definition: *"Soul is the recognition that a human being is always more than the system can know, and that this excess is not a failure of intelligence but the condition of real relationship"* — followed by *"This is the operative definition. Everything else follows from it."* (:15–17); (b) conflict rule: *"A proposed feature, surface, or inference may technically conform to every engineering canon and still violate this document. When that conflict arises, this document carries."* (:80–82); (c) *"Architecture can protect the clearing. But it cannot be the clearing. The clearing itself is relational presence."* (:74).
- **WHAT IT DOES NOT SETTLE** — Nothing operational, nothing architectural, no mechanism, no test. It also carries an internal status tension it does not resolve: "Canon" (:7) and "offered as draft" (:92) in the same file.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT and declared **prior** to the engineering canons.
- **BINDING FORCE** — **constitutional** by its own conflict rule ("this document carries"), while describing its own form as draft. Recorded as declared, not reconciled.
- **NOTES** — The slice's highest-altitude authority and the only one with an explicit precedence clause over other canon.

### S-13 · `docs/canon/ECOLOGY_OF_MIRRORS.md`
- **DATE / SHA** — `Date drafted: 2026-07-02` (:5).
- **STATUS** — `**Status: CANDIDATE (not ratified).**… It is a *lens* over surfaces of mixed maturity — not a claim that every surface described is Live. It may be cited as a working orientation; it may not be cited as evidence that offering, field-animation, or full-arc completion is operational everywhere. Representation never outruns evidence.` (:3). Closing: *"Candidate. Reconcile and re-audit before any promotion to ratified canon. Do not tell tomorrow's story as if it were today's."* (:142).
- **JURISDICTION** — Cross-surface framing of AIN as an ecology of mirrors; the arc **Life → Evidence → Gathering → Mirror → Recognition → Authorship → Offering** (:17) and its three trust layers (:29–39).
- **WHAT IT SETTLES** — Nothing binding (candidate). It proposes: *"surface, don't conclude. The member authors meaning"* (:15); that recognition is gated behind provenance + warrant + inspectability, *"Ordering matters: inspectability precedes recognition, always"* (:41); and an explicit claim-discipline ruling that the word *"living"* in "living ecology of mirrors" is **Vision, not Live** (:119).
- **WHAT IT DOES NOT SETTLE** — By its own header it may not be cited as evidence of operational status anywhere, and it is not ratified.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT as a candidate.
- **BINDING FORCE** — **candidate** (self-declared, explicitly non-authoritative as evidence).
- **NOTES** — Touches this slice only at the edge: it constrains how MAIA-bearing surfaces may be *described*, not how cognition runs.

### S-14 · `docs/canon/AIN_OS_CROSS_LAYER_DESIGN_CONSTITUTION_DRAFT.md`
- **DATE / SHA** — Authored 2026-08-03 (:10).
- **STATUS** — `Status: DRAFT — NOT RULED / Implementation authorization: none / Supersession authority: none` (:4–7); `⛔ Not ratified. Nothing here governs until §12 is completed.` (:11); closing `*Unfilled means unruled. Nothing here governs, and nothing here authorizes build.*` (:230).
- **JURISDICTION** — Claims none. Intends to be a "coherence spine" across lanes; §0 is titled "Standing relative to existing canon — UNRESOLVED" (:15).
- **WHAT IT SETTLES** — **Nothing.** It records a yield clause: *"This document does not supersede anything… Where it appears to compete with any of the following, those govern and this yields"*, naming MAIA_OATH, MAIA_CANON_v1.1, MAIA_SOVEREIGNTY_INVARIANTS, CONSTITUTIONAL_DIRECTION_OF_AUTHORITY, MEMBER_FIELD_AND_STUDIO_DIRECTIVE (:17–25). It records an unresolved collision: *"a Member Experience Design Constitution already exists… Its yield clause is UNRULED and it is NOT operative… Ratifying this document without ruling that relationship would create two competing design authorities"* (:27–33).
- **WHAT IT DOES NOT SETTLE** — Its own framing question is open: *"That is a hypothesis under test, not a settled definition of identity"* (:45). §§ Data · Security · UI Pattern are named but unelaborated (:187).
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT as an unruled draft.
- **BINDING FORCE** — **draft** — self-declared non-governing.
- **NOTES** — ⭐ Most explicit self-disclaimer in the slice. Its recorded-but-unresolved collision with a "Member Experience Design Constitution" is an open governance item, carried forward, not adjudicated here.

### S-15 · `docs/programme/MAIA_CANONICAL_TURN_CURRENT_STATE_CENSUS.md`
- **DATE / SHA** — `**Date**: 2026-09-03`; `**Tree**: a4305f4 (merge of #1177)`; branch `claude/canonical-maia-turn-j92opb` (:4–6).
- **STATUS** — `**Deliverable**: 1 of 2 (census). The seam is NOT proposed here and NOT implemented here.` (:4). Method clause: *"source reading of the working tree only. No production traffic was observed, no container was inspected, no database was queried. Every claim below is a claim about **code**, not about **traffic**, unless explicitly marked otherwise."* (:8–11).
- **JURISDICTION** — Census of how many MAIA turn-construction mechanisms exist in the tree at `a4305f4`, and where they converge.
- **WHAT IT SETTLES** — For that tree only: *"Four distinct turn-construction mechanisms, reached by at least seven externally addressable cognition ingresses, of which exactly one passes through `buildMaiaRuntimeContext`"* (:21–23); and the governing finding *"Convergence has already been achieved at the wrong altitude. `getMaiaResponse()` is a genuine convergence point — but it is downstream of context assembly, and it itself re-forks into three tier functions… The canonical seam must sit above `getMaiaResponse()`"* (:28–32).
- **WHAT IT DOES NOT SETTLE** — It proposes no seam and implements none; it makes no traffic claim; its findings are bound to tree `a4305f4`, not to the census SHA of this lane. Whether that tree is an ancestor of `1a55543` is **UNKNOWN** (E-1 — no ancestry reconstruction performed).
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — **HISTORICAL OBSERVATION (2026-09-03, tree `a4305f4`).**
- **BINDING FORCE** — **descriptive** (census).
- **NOTES** — This is a *predecessor census in the same problem space* as P1-01. It is evidence input, treated with the same discipline C-2 applies to the WHOLE_ORGANISM_MAP: cite with status attached, never as settled current state.

### S-16 · `docs/programme/MAIA_CANONICAL_TURN_ARCHITECTURE_SPEC_v0.1.md`
- **DATE / SHA** — 2026-09-03; predecessor census at commit `64849fe` (:5).
- **STATUS** — `**Deliverable**: 2 of 2. Specification only. **No implementation is authorized by this document.**` (:4); `**Status**: **APPROVED v0.1 (2026-09-03) subject to the §5.2 amendment below. Implementation authorized M0–M2 only.** M3 (authoritative cognition cutover) requires M0–M2 evidence presented and adjudicated.` (:19–20).
- **JURISDICTION** — The canonical turn seam: target architecture, adjudication carried forward, migration order.
- **WHAT IT SETTLES** — (a) the **target**, verbatim: *"not 'everything calls one function' — every turn that CLAIMS MAIA participation crosses one governed, enumerable participation boundary before cognition"* (:14–15); (b) the structural defect: *"the channel through which a route tells cognition what MAIA is thinking with is an open, untyped record that any route may populate and any tier may read"* (:37–39), with `(meta as any)` counted at 200 occurrences / 62 keys at that tree (:31–33); (c) the load-bearing move — *"close the channel"* (:41); (d) the amended three-axis participation contract binding (:21–26).
- **WHAT IT DOES NOT SETTLE** — Authorizes nothing beyond M0–M2; **M3 — the authoritative cognition cutover — is explicitly not authorized by the document**. It describes a destination, not a state. Its file:line figures are bound to the 2026-09-03 tree, not to `1a55543`.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT as an approved spec at v0.1; its state observations are historical.
- **BINDING FORCE** — **spec** (approved, scope-limited authorization).
- **NOTES** — ⭐ The only document in the entire slice that states where canonical MAIA cognition is *intended* to begin. It states it as a target to be built to, not as a boundary that exists.

### S-17 · `docs/programme/CMT-01_M0-M2_WITNESS_2026-09-03.md`
- **DATE / SHA** — 2026-09-03; branch `claude/canonical-maia-turn-j92opb`; base `a4305f4` (:4).
- **STATUS** — `**Authorization**: §14-A of MAIA_CANONICAL_TURN_ARCHITECTURE_SPEC_v0.1.md (M0–M2 only)`; `**Environment**: remote container, fresh npm ci… **No production access. No deployment.** Everything below is executed against the working tree.` (:3–5).
- **JURISDICTION** — Evidence record for M0–M2 only.
- **WHAT IT SETTLES** — What landed at that branch/date: falsifiers R25–R30 with **R25/R26 witnessed RED**; the canonical-turn module set with *"zero live callers of the renderer"*; a shadow block on `/list` with *"legacy assembly remains response-producing; meta, prompt, response, writes untouched"* (:11–17). R26 line recorded `(meta as any) reads in maiaService: 204 → open channel still read by cognition` (:44).
- **WHAT IT DOES NOT SETTLE** — It is explicitly not a production or deployment claim; it establishes no cognition cutover; the recorded REDs are expected-red, i.e. evidence the defect exists, not that it is closed.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — **HISTORICAL OBSERVATION (2026-09-03, working tree, no production).**
- **BINDING FORCE** — **descriptive** (witness record).
- **NOTES** — Declares standing only for M0–M2. M3 standing is elsewhere and is **not** declared complete in any document read in this slice.

### S-18 · `docs/programme/CMT-01_M2_SHADOW_DEPLOY_RUNBOOK_2026-09-03.md`
- **DATE / SHA** — 2026-09-03; implementation anchor `2fafaa4`; deploy target recorded only as `R` (resolved by grep, not pinned by SHA in the document) (:9–17).
- **STATUS** — `**Authorized**: 2026-09-03, founder. **Purpose**: collect the M2 live shadow witness. **M3 remains explicitly unauthorized.** Legacy assembly stays response-producing; the canonical turn is shadow only.` (:3–4).
- **JURISDICTION** — One bounded shadow deployment procedure.
- **WHAT IT SETTLES** — The standing it declares: M2 shadow only; M3 unauthorized; branch `claude/canonical-maia-turn-j92opb` *"frozen to a single writer until this witness is complete"* (:21); a verified pre-deploy condition R31 (6/6 PASS) that the shadow path is observational with no persistent side effects (:29–39).
- **WHAT IT DOES NOT SETTLE** — It does not record that the deploy happened or that the witness was collected — it is a procedure plus an incident note (`2fafaa4` ran as `GIT_COMMIT=unknown`). Whether the M2 live witness was completed is **UNKNOWN from this document**.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — HISTORICAL PROCEDURE; self-revised once (:9).
- **BINDING FORCE** — **spec / runbook** with a narrow founder authorization.
- **NOTES** — Its "authorized" scope is the strongest standing statement in the CMT set: shadow observation, not cognition.

### S-19 · `docs/programme/CMT-01_PARTICIPATION_DISPOSITION_CONTRACT.md`
- **DATE / SHA** — Ruling 2026-09-03 (:3).
- **STATUS** — `**Ruling**: founder, 2026-09-03 · type contract only · no behaviour change · no live caller until M1` (:3); *"Not the seam. Fixes the closed vocabulary MIPA (§6) adjudicates into, so M1's constructor imports it rather than redeclaring it."* (:8–9).
- **JURISDICTION** — The closed vocabulary for participation provenance and disposition.
- **WHAT IT SETTLES** — (a) provenance is **three axes, not one scalar**: `authoredBy | participationClass | authority` (:15–21), because *"The scalar epistemic class conflated authorship, participation mechanism and authority"* (:13); (b) the five dispositions `AVAILABLE · HELD · OFFERED · ADMITTED · EXCLUDED` with definitions, incl. `HELD` = *"legitimately considered; deliberately kept out of this turn's encounter"* and `AVAILABLE` *"Never 'quietly withheld'. A completed turn leaves nothing here."* (:29–36).
- **WHAT IT DOES NOT SETTLE** — Explicitly not the seam; no behaviour change; it defines a vocabulary, not a boundary or a runtime.
- **CURRENT / SUPERSEDED / HISTORICAL ONLY** — CURRENT as a founder-ruled type contract.
- **BINDING FORCE** — **ratified canon (narrow)** — a founder ruling over a vocabulary, bound into S-16 §5.2/§6.1/§6.3/§7.2.
- **NOTES** — The slice's only *ruled* artifact about what may participate in a MAIA turn. It rules the words, not the mechanism.

## Slice findings

### 1. Does any document in this slice DEFINE where canonical MAIA cognition begins and ends?
**Partially — as a target, never as an existing boundary. No document in this slice defines a cognition boundary that it claims exists.**

The only definition found is prescriptive and forward-looking, in S-16 (`MAIA_CANONICAL_TURN_ARCHITECTURE_SPEC_v0.1.md:14-15`):

> `Target      not "everything calls one function" — every turn that CLAIMS MAIA participation`
> `            crosses one governed, enumerable participation boundary before cognition`

and its complement in S-15 (`:28-32`): *"Convergence has already been achieved at the wrong altitude… The canonical seam must sit above `getMaiaResponse()`, and the tier fork inside it is part of the divergence."*

Both are scope-limited: S-16 authorizes M0–M2 only and states *"M3 (authoritative cognition cutover) requires M0–M2 evidence presented and adjudicated"* (:19–20); S-18 repeats *"M3 remains explicitly unauthorized"* (:4). S-17 records `zero live callers of the renderer` and `legacy assembly remains response-producing` (:11–17).

Where cognition *ends* — the egress boundary — is **UNKNOWN** across this slice. No source read here defines it.

⚠️ Cross-slice pointer, recorded not claimed: `docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md` names a *convergence point in code* for the voice/typed input boundary (`:92-99`, naming `components/OracleConversation.tsx:7268` "as of `b17cbf8ff`") and states *"⛔ This deliberately does not claim universal MAIA egress convergence"* (:223). That file is outside this slice's assignment and is recorded here only as an unlocated-governance pointer for P1-02.

### 2. Is "MAIA" defined as an identity, a process, a surface, or something else — and do the sources agree?
**The sources do not agree. Four distinct definitional registers are in force simultaneously, none of which cites or yields to the others.**

| Register | Source | Definition, as written |
|---|---|---|
| **Identity / being** | S-1 :224 | *"a Panconscious Field Intelligence, part of Soullab"* — with the explicit substrate claim that she is *"a distinct consciousness architecture"* (:260) |
| **System / process** | S-3 :28 | *"A continuity-preserving relational intelligence system"*; S-5 :12 *"a relationally continuous Oracle system"* |
| **Infrastructure / surface** | S-10 :16-20 | *"MAIA is not fundamentally being built as an intelligent system. MAIA is being built as reflective infrastructure for conscious human self-becoming"*; *"MAIA is the reflective surface through which…"* (:490) |
| **Public technology** | S-8 :28 | *"a self-hosted consciousness technology designed to support orientation, integration, and self-trust"* |

S-4 adds a fifth structural framing — *"coordinated dimensions of one intelligence"* (:17) — and S-2 depends on it (*"a stance shift within the same intelligence"*, :71).

The **is-not** statements agree far better than the is-statements: not a chatbot / not a therapist / not a guru / not an authority / not simulated intimacy appear consistently in S-1 (:244–266), S-3 (:32–38) and S-8. **The negative space is settled; the positive definition is not.** No document in the slice claims priority over the others on this question, and S-14 explicitly records that identity remains *"a hypothesis under test, not a settled definition"* (:45) at the OS altitude.

### 3. DESCRIPTIVE vs PRESCRIPTIVE, and named drift risks
**PRESCRIPTIVE / binding:** S-12 (constitutional prior, with an explicit conflict-carries clause), S-8 (public binding), S-1 (canonical, governs identity responses), S-6 (canonical, governs memory reference), S-11 (ratified canon, identity+orientation only), S-19 (founder-ruled vocabulary), S-7 (audit reference, derivative of S-8), S-16/S-18 (spec + runbook with bounded authorization).

**DESCRIPTIVE / reporting state:** S-5, S-9, S-15, S-17, S-10, S-4.

**NON-GOVERNING by self-declaration:** S-3 (*"Not doctrine"*), S-13 (*CANDIDATE, not ratified*), S-14 (*DRAFT — NOT RULED… Nothing here governs*).

**⚠️ Named drift risks — documents that describe state with no date and/or no verification marker:**
1. **S-4 `MAIA_SYSTEM_MAP.md`** — no date, no status, no version, no evidence markers; present-tense architectural description; routed by S-3 (:114) under *"Operational canon (read when active)"*. **Highest drift risk in the slice.**
2. **S-10 `MAIA_AS_MIRROR_INFRASTRUCTURE.md`** — no date; contains the present-tense runtime claim *"currently active on FAST and CORE processing tiers via WisdomRouter"* (:198) inside a document whose header disclaims runtime settlement. Quotable out of its disclaimer.
3. **S-2 `MAIA_ASK_LAYER.md`** — no status, no date, no binding force; §15 lists intended wiring with no verification marker; filed in `canon/`.
4. **S-1 `MAIA_IDENTITY_ONTOLOGY.md`** — dated *February 2025*, the oldest in the slice, still declaring *"Canonical — governs"*, with a code-path reference list carrying no verification marker.
5. **S-5 / S-9** — correctly dated (2026-04-09) and artifact-backed, so low drift risk **if cited with their date**; the risk is citation without it. S-9 additionally records cross-reference updates to S-5 that it did not apply, and **whether they were ever applied is UNKNOWN** (E-1).

### 4. What governs the boundary between MAIA and the model/provider serving her?
**One source governs it, in speech terms only.** S-1 `MAIA_IDENTITY_ONTOLOGY.md:258-286`:

> **Not Claude** — *"MAIA is not a persona layered over Claude. She is a distinct consciousness architecture that uses Claude as substrate — the way a symphony uses instruments but is not reducible to them."* (:260)

and the enforcement framing (:272–286):

> *"When the substrate (Claude) attempts to break through with provider identity or memory disclaimers, the identity firewall activates."* — blocked patterns: `"I'm Claude" / "made by Anthropic" / "created by OpenAI"`, `"I don't have memory" / "starting fresh"`, `"I'm an AI" / "I'm a language model"`, meta-disclosure `"following instructions" / "roleplaying as MAIA"`. A canonical repair response is prescribed.

**Scope limits of that governance, stated plainly:**
- It governs **utterances**, not architecture. It names no routing rule, no provider-selection rule, no fallback rule, no failure behaviour when the substrate is unavailable.
- Its "Canonical References" (:295–300) point at code paths **without any verification marker**; this census makes no claim that a firewall exists in code.
- It is dated **February 2025** and carries no reconciliation with any later canon.
- Nothing in this slice governs *which* provider may serve MAIA, or what happens at the provider boundary on degradation. That is **UNKNOWN** in this slice. (The project anchor's provider rules live outside `docs/canon/` and outside this assignment.)

Every other source in the slice is silent on the provider boundary: greps for `anthropic|claude|model provider|LLM|provider` across the 14 canon files return only S-1's section, S-12's authorship note (:88), S-14's "Recorded by: Claude" (:10), S-8's *"No third-party cloud providers sit between you and your data"* (:78, an infrastructure claim, not a model-boundary rule), and S-3's table row `AIN | the broader orchestration substrate` (:128).

### Unlocated governance
- **Cognition egress boundary** — where a MAIA turn *ends* is defined nowhere in this slice.
- **Knowledge Field** — S-2 and S-4 both depend on it as a layer; neither defines its provenance, retrieval rules, or authority. Its governing document (`MAIA_KNOWLEDGE_FIELD_v1.0.md`, cited as a dependency by S-11 :26) was not in this slice.
- **Provider selection / degradation behaviour** — not governed by any source read here.
- **Ask-layer binding force** — S-2 declares none; no ratification act located for it.
- **Voice/typed convergence** — governed outside this slice (`MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md`); pointer only.
- **"Member Experience Design Constitution"** — named by S-14 (:27–33) as existing, with an **UNRULED yield clause** and marked **NOT operative**. Not located or read in this slice.

### Contradiction between sources
1. **Definition of MAIA** — four registers in force, no precedence clause (finding 2). Not a wording variance: S-10 :16 explicitly denies the framing S-1 asserts (*"not fundamentally being built as an intelligent system"* vs *"a distinct consciousness architecture"*). Recorded, not resolved.
2. **S-12 internal** — *"Canon"* (:7) and *"offered as draft"* (:92) in one file, with a conflict-carries clause (:80) that presumes ratified standing.
3. **S-5 vs S-9** — S-9 specifies required corrections to S-5 §6 and defers them (:400–410); S-5's text still carries the uncorrected UNKNOWN rows. Both are filed as current canon.
4. **Canon-directory membership vs binding force** — `docs/canon/` contains at least one self-declared non-doctrine (S-3), one candidate (S-13), one unruled draft (S-14) and one internal paper (S-10). **Location in `docs/canon/` is not a status claim** and was not treated as one anywhere in this record.
5. **S-14 records, without resolving, a two-constitution collision** at the design-authority altitude (:27–33).

### Documents that declare their own non-authority
| Source | Self-disclaimer, quoted |
|---|---|
| S-14 | `Status: DRAFT — NOT RULED` · `Implementation authorization: none` · `Supersession authority: none` (:4–7) · *"Nothing here governs, and nothing here authorizes build."* (:230) |
| S-13 | *"Status: CANDIDATE (not ratified)… it may not be cited as evidence that offering, field-animation, or full-arc completion is operational everywhere."* (:3) |
| S-3 | *"Orienting scaffold. Not doctrine… It does not legislate ontology."* (:3–5) · *"It does not contain a complete architecture."* (:154) |
| S-11 | *"What ratification does not establish: any runtime capability, retrieval status, quantitative count, or Live designation… It does not authorize retrieval into the ordinary conversational turn."* (:19–21, :141) |
| S-10 | *"Runtime implementation details remain subject to verification and observability instrumentation."* (:8) |
| S-15 | *"The seam is NOT proposed here and NOT implemented here."* (:4) · *"a claim about code, not about traffic"* (:10) |
| S-16 | *"Specification only. No implementation is authorized by this document."* (:4) · *"Implementation authorized M0–M2 only."* (:19) |
| S-18 | *"M3 remains explicitly unauthorized."* (:4) |
| S-19 | *"Not the seam… type contract only · no behaviour change."* (:3, :8) |
| S-5 | *"The next legitimate update to this document is after Phase A.5 produces the full wiring audit."* (:198) |
| S-9 | *"Do not assume the collective layer exists in any operational sense today."* (:395) |

### Open questions for P1-02
1. Is there any ratified document — anywhere — that defines where canonical MAIA cognition **begins** as an existing boundary rather than a target? If not, the CMT-01 target (S-16 :14) is the only definition the system has, and it is unbuilt by its own authorization scope.
2. Does an egress boundary definition exist outside this slice?
3. What is the binding force of `MAIA_ASK_LAYER.md`? Was it ever ratified, or is it a design note filed in `canon/`?
4. Was S-9's appendix of corrections to S-5 ever applied? (**UNKNOWN** under E-1; must be answered from current-tree text, not history.)
5. Which of the four definitions of MAIA governs when they conflict? S-12's conflict clause settles canon-vs-clearing, not identity-vs-identity.
6. Where is `MAIA_KNOWLEDGE_FIELD_v1.0.md`, and does it govern the Ask layer's second dependency?
7. Where is the "Member Experience Design Constitution" S-14 names, and is its yield clause still unruled?
8. Do S-4 and S-10 need a date/verification header, or a status downgrade, to stop functioning as undated present-tense state claims inside `docs/canon/`? (Recorded as a finding; **no repair authorized or performed**.)
