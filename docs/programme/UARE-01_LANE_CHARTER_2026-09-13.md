# UARE-01 — Individual AI / Human Life Model Architecture Study

**Date opened:** 2026-09-13
**Class:** External-architecture research lane. **Not** a product lane, not a marketing lane, not a build lane.
**Opened by:** founder (Kelly), on a first-pass study of Uare.ai (formerly Eternos).
**Status:** DEFINED. First-pass evidence intake COMPLETE. No MAIA code, canon, schema or claim changed.
**Subject:** Uare.ai — "Individual AI" built on a proprietary *Human Life Model™*, multi-agent processing, graph retrieval, cloned voice, MCP-style actions, and a practitioner subscription economy.

---

## 0 · What this lane is not

Read this section before anything else in the lane.

A competitive-analysis lane is the easiest back door into doctrine that exists in this project. It
arrives carrying real evidence — a shipped product, a funded team, a working failure log — and that
evidence has a natural pull toward becoming authority. It must not be allowed to.

This lane may **not**:

- ratify, weaken, strengthen, amend or reinterpret any canon in `docs/canon/`;
- introduce a competitor's vocabulary (`Individual AI`, `Human Life Model`, the seven dimensions,
  `fidelity %`) into MAIA's product surface, schema, prompt, or doctrine;
- author a public comparison, a "unlike X, we…" sentence, or any outward claim whatsoever
  (that is `JARVIS-PUBLIC-ACCOUNTED-FOR-01`'s custody, and it consumes only *accepted* outputs);
- open, unblock, re-sequence or re-prioritize any other lane;
- justify a build. "A competitor ships it" is not a reason. It has never been a reason here.

**Explicit founder prohibition, recorded at open:** *do not adopt Uare's seven-dimension Human Life
Model.* The parallel to Spiralogic / elemental architecture is real and is exactly why importing
their taxonomy would be corrosive — it would substitute a vendor's decomposition for our own and
make the resemblance look like derivation.

## 1 · Purpose

Establish, in one durable record, what an independently funded team building genuinely adjacent
architecture has **solved, shipped, failed at, and claimed** — so that MAIA's design decisions are
made against observed reality rather than against remembered impressions of a competitor.

The standing rule from `docs/research/CREATIVE_ENVIRONMENT_COMPARATIVE_STUDY.md` applies directly:
*do not assume remembered research exists; verify every claimed corpus before building from it.*
This lane exists so that "we looked at Uare" is a file, not a memory.

## 2 · Governing question

> Where has another team's shipped reality already answered a question MAIA is still holding open —
> and where has it answered a **different** question that only looks like ours?

**Governing sentence:** *A competitor tells us what the market has discovered. It never tells us
what MAIA is.*

## 3 · The primary discriminator

The single most important finding of the first pass is not a feature. It is a fork in what the
system is for:

```text
UARE            person ──► captured ──► modeled ──► the model answers AS the person
                "always you" · "talk to yourself" · "works as you" · "thinks like you"

MAIA            person ──► encountered ──► remembered ──► an other answers WITH the person
                knows me without being me
```

Call these **`MODEL-OF-ME`** and **`OTHER-WHO-KNOWS-ME`**. Every observation in this lane is
classified against that fork before it is considered for MAIA relevance, because a mechanism that is
correct under `MODEL-OF-ME` can be actively harmful under `OTHER-WHO-KNOWS-ME` while looking
identical in a screenshot.

Two canon consequences, already ratified, that this fork touches:

- **Non-impersonation.** MAIA does not simulate intimacy, certainty or power where none is
  ethically grounded (Anchor, non-negotiables). A system optimized to answer *as* the member has
  no structural defence against reinforcing the member's existing map — the ego's account of itself
  is not the psyche. Fidelity to self-description is not the same thing as contact with a person.
- **Direction of authority.** `docs/canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md`: authority moves
  upward only, through authored experience, never skipping a layer. A model that generates the
  member's own recognitions *for* them manufactures higher-order meaning — the precise move the
  constitution forbids.

## 4 · Direction of authority within this lane

```text
   Uare public material · runtime observation · shipped defect log
                              │
                              ▼                    (Encounter-layer evidence only)
                     UARE-01 classified findings
                              │
                              ▼
              questions posed to the owning MAIA lane
                              │
                              ▼
        that lane adjudicates · founder rules · canon (maybe) moves
```

Never the reverse. A finding here may **raise** a question for Anamnesis, Jarvis, Voice,
Practitioner Studio or Writer's Studio. It may not answer one. Each owning lane adjudicates its own
question on its own evidence, and a UARE-01 finding enters that adjudication as an input carrying no
standing beyond "this is what we observed elsewhere."

## 5 · Evidence classes (mandatory tag on every claim)

Adapted from the comparative-study instrument. The adaptation is the fourth class, which that study
did not need: Uare's material is largely **vendor-authored**, so a category of claim exists here that
is simultaneously primary-source and unfalsifiable from outside.

| Class | Meaning | How it may be used |
| --- | --- | --- |
| **[D] Documented** | Stated in Uare's own legal, pricing, support or release material — contractual or operational commitments they can be held to. | May ground a finding. Cite the document. |
| **[O] Observed** | Seen in a runtime walkthrough or in the App Store release record — behaviour, not description. | May ground a finding. Cite the observation and its date. |
| **[M] Marketing** | Vendor assertion about capability or philosophy, not independently checkable (*"trained only on you"*, *"you own your AI"*). | **Records what they claim, never what is true.** May ground a finding *about their claim*. May never ground a finding about their architecture. |
| **[I] Interpretation** | Soullab's reading — philosophical, strategic, architectural. | Must be labelled as ours. May never be cited later as though it were [D] or [O]. |

**The first-pass record is almost entirely [D], [M] and [I].** There is at present **no [O]** — no one
at Soullab has run the product. Any finding that requires [O] is explicitly marked *unverified* and
may not ground a decision until step U2.

## 6 · Custody

```text
LANE CHARTER (this file)
docs/programme/UARE-01_LANE_CHARTER_2026-09-13.md

FIRST-PASS STUDY (evidence of record)
docs/research/competitive/UARE-01_INDIVIDUAL_AI_FIRST_PASS_2026-09-13.md

CANDIDATE INSTRUMENT (not ratified)
docs/programme/UARE-01_VOICE_ACCEPTANCE_MATRIX_CANDIDATE_2026-09-13.md

BRANCH
claude/uare-ai-analysis-bm8azo

STANDING
NO CODE CHANGED · NO CANON CHANGED · NO SCHEMA CHANGED · NO CLAIM PUBLISHED
NO ACCOUNT CREATED · NO PAYMENT MADE · NO SOULLAB MATERIAL DISCLOSED TO A THIRD PARTY
```

## 7 · Sequence

| Step | Name | Output | Authorization |
| --- | --- | --- | --- |
| **U0** | **INTAKE** | The founder's first pass, classified by evidence class. | ✅ done — this commit |
| **U1** | **MAIA-SIDE COVERAGE SURVEY** | For each transferable observation, what does MAIA *already* have? Grep-and-test level, honest about what was not surveyed. Begins with the voice matrix's coverage column. | ✅ open — no founder act needed; read-only, internal |
| **U2** | **CLEAN-ROOM WALKTHROUGH** | Runtime observation → the first [O] evidence. | ⛔ **requires a founder act** — see §8 |
| **U3** | **DISCRIMINATION PASS** | Every finding classified `MODEL-OF-ME` / `OTHER-WHO-KNOWS-ME` / neutral-infrastructure. Neutral-infrastructure findings are the only ones eligible to become candidate design inputs without a doctrinal question attached. | ⛔ requires U1; U2 for [O]-dependent rows |
| **U4** | **QUESTION HANDOFF** | One docket per owning lane (Voice · Anamnesis · Jarvis · Practitioner Studio · Writer's Studio), each a *question*, never a recommendation. | ⛔ founder ruling on which dockets open |
| **U5** | **STANDING WATCH** | Periodic re-read: release notes, pricing, legal terms, funding. Diff against this record. | ⛔ not opened |

**U1 may proceed. U2 and beyond may not.**

## 8 · The clean-room walkthrough — constraints before it is ever authorized

Walking the product is the only way to convert [M] into [O], and the founder is right that the
website tells us intent while the runtime tells us what was solved. It is also the step with real
exposure, so its constraints are recorded now, before anyone is tempted:

1. **Synthetic identity only.** A fabricated persona with fabricated biography. No founder, member,
   tester, or employee identity. No Soullab email domain.
2. **No member material, ever.** Not anonymized, not aggregated, not "just one example." Member
   material entering a third party's retrieval or model surface is a Sanctuary-and-consent breach
   regardless of what the third party's policy says.
3. **No Soullab material.** No canon, no Spiralogic, no architecture docs, no Writer's Studio
   manuscripts, no pitch material. A system whose entire function is to ingest and model uploaded
   documents is the wrong place to test with our own. *We do not hand our unbuilt architecture to
   an adjacent funded competitor in exchange for a UX observation.*
4. **No real person's voice.** Their onboarding wants a voice sample. Cloning a real person's voice
   for competitive research is not acceptable here even with that person's consent — it normalizes
   exactly the practice we are studying critically. Use a synthesized sample, or skip the step and
   record it as unobserved.
5. **Paid tiers are an outward-facing commitment.** Their Professional plan is a recurring charge
   under their subscription terms [D]. Entering a contract with a competitor is a founder decision,
   not a research decision.
6. **Record method, not just result.** Date, tier, platform, build. An undated runtime observation
   decays into [M] within a release cycle.

## 9 · The reciprocity test

The first pass found a real gap between Uare's *"you own your Individual AI"* [M] and their terms,
which reserve the underlying software and architecture and describe export as memories, context and
transcripts rather than portable runnable model weights [D].

That observation is correct and it is dangerous to us, because it is the shape of the finding that
turns a research lane into a marketing lane. So:

> **Reciprocity test — standing rule for this lane.** No observation about another company's claim
> may be recorded as a Soullab advantage unless Soullab currently passes the *stricter* form of the
> same test, evidenced under `docs/canon/CLAIM_STATE_AUTHORITY.md`.

Applied to this case: before "true portability" is ever an asserted Soullab advantage, someone must
demonstrate a member leaving with memory graph, provenance, developmental history and member
intelligence in an open, independently usable form. Self-hosting is a genuine and material
difference — it is not yet the same thing as demonstrated member portability. Until that is
evidenced, the finding is recorded as **a question we have also not answered**, not as a contrast.

The same test binds the *"trained only on you"* finding. Their positioning oversimplifies what their
own technical and legal material describes. The defensible formulation for us is architectural, not
comparative: **a general model may be used without the general model becoming the authority on the
person** — which is what canonical cognition plus the memory/provenance boundary is already for.

## 10 · Standing prohibitions

- No Uare terminology in MAIA code, schema, prompt, UI or doctrine.
- No fidelity/completeness percentage over a human being, ever. A number asserting a person is
  *n%* modeled is an epistemic claim we cannot support and would not want to be able to support.
- No practitioner-visible member conversation by default. Uare's subscription terms state a
  Professional can view conversations subscribers have with their Individual AI [D]; if Soullab ever
  approaches practitioner surfaces, member-private and explicitly-shared must be structurally
  distinct, not policy-distinct.
- No public comparison, deck slide, podcast line or landing-page sentence out of this lane. Route
  through claim discipline or not at all.

## 11 · Output typing

Every design idea this lane produces is **Cat 1 — preserved direction (held, not authorized)** under
the six-category typology in the Anchor, and stays there until a *different* lane builds it under its
own authorization. Nothing in this lane may be cited as built, wired, designed-and-approved, or
live. The three first-pass ideas most likely to drift upward, pinned here as Cat 1:

- **visible model formation** — a member-facing view of what MAIA has evidence for, exposing
  *source → interpretation → confidence → correction*, without a completeness metric;
- **elicitation-as-encounter** — onboarding as a small number of real questions rather than a profile
  form, whose structured residue can feed memory;
- **provenance chips** — "MAIA remembers this *because…*", available on demand without intruding on
  the conversation.

## 12 · Stop conditions

- Any finding that would require changing canon **stops** and becomes a question for the owning lane.
- Any finding touching member data, Sanctuary, consent or PHI is **Class A** regardless of how minor
  it looks as a product observation.
- Any pressure to publish a comparison **stops the lane** and goes to claim discipline.
- If U2 is authorized and the walkthrough would require uploading anything not fabricated for the
  purpose, **stop the walkthrough**, not the constraint.

---

*Adjacent architecture is the most useful and most dangerous kind of evidence. Useful, because
someone else has already paid for the failure surface. Dangerous, because resemblance invites
substitution. This lane exists to take the first and refuse the second.*
